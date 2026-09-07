import { DIFFICULTY_BY_ID } from './difficulties';
import type { DifficultyId, GridSpec, Hint, Puzzle, PuzzleAnalysis } from './types';

function mulberry32(seed: number) {
  return () => {
    let value = (seed += 0x6d2b79f5);
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(values: T[], random: () => number): T[] {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex]!, result[index]!];
  }
  return result;
}

export function getBoxIndex(cell: number, spec: GridSpec): number {
  const row = Math.floor(cell / spec.size);
  const column = cell % spec.size;
  const boxesPerRow = spec.size / spec.boxColumns;
  return Math.floor(row / spec.boxRows) * boxesPerRow + Math.floor(column / spec.boxColumns);
}

export function getPeerIndices(cell: number, spec: GridSpec): number[] {
  const peers = new Set<number>();
  const row = Math.floor(cell / spec.size);
  const column = cell % spec.size;
  const boxRow = Math.floor(row / spec.boxRows) * spec.boxRows;
  const boxColumn = Math.floor(column / spec.boxColumns) * spec.boxColumns;

  for (let index = 0; index < spec.size; index += 1) {
    peers.add(row * spec.size + index);
    peers.add(index * spec.size + column);
  }

  for (let rowOffset = 0; rowOffset < spec.boxRows; rowOffset += 1) {
    for (let columnOffset = 0; columnOffset < spec.boxColumns; columnOffset += 1) {
      peers.add((boxRow + rowOffset) * spec.size + boxColumn + columnOffset);
    }
  }

  peers.delete(cell);
  return [...peers];
}

export function getCandidates(board: number[], cell: number, spec: GridSpec): number[] {
  if (board[cell]) return [];
  const used = new Set(getPeerIndices(cell, spec).map((peer) => board[peer]).filter(Boolean));
  return Array.from({ length: spec.size }, (_, index) => index + 1).filter((value) => !used.has(value));
}

export function hasConflict(board: number[], cell: number, spec: GridSpec): boolean {
  const value = board[cell];
  if (!value) return false;
  return getPeerIndices(cell, spec).some((peer) => board[peer] === value);
}

function findBestEmptyCell(board: number[], spec: GridSpec): { cell: number; candidates: number[] } | null {
  let best: { cell: number; candidates: number[] } | null = null;
  for (let cell = 0; cell < board.length; cell += 1) {
    if (board[cell]) continue;
    const candidates = getCandidates(board, cell, spec);
    if (candidates.length === 0) return { cell, candidates };
    if (!best || candidates.length < best.candidates.length) best = { cell, candidates };
    if (candidates.length === 1) break;
  }
  return best;
}

export function countSolutions(board: number[], spec: GridSpec, limit = 2): number {
  const working = [...board];
  let solutions = 0;

  const search = () => {
    if (solutions >= limit) return;
    const next = findBestEmptyCell(working, spec);
    if (!next) {
      solutions += 1;
      return;
    }
    if (next.candidates.length === 0) return;

    for (const value of next.candidates) {
      working[next.cell] = value;
      search();
      working[next.cell] = 0;
      if (solutions >= limit) return;
    }
  };

  search();
  return solutions;
}

function buildSolvedBoard(spec: GridSpec, random: () => number): number[] {
  const { size, boxRows, boxColumns } = spec;
  const symbols = shuffle(Array.from({ length: size }, (_, index) => index + 1), random);
  const rowBands = shuffle(Array.from({ length: size / boxRows }, (_, index) => index), random);
  const rows = rowBands.flatMap((band) =>
    shuffle(Array.from({ length: boxRows }, (_, index) => band * boxRows + index), random),
  );
  const columnStacks = shuffle(Array.from({ length: size / boxColumns }, (_, index) => index), random);
  const columns = columnStacks.flatMap((stack) =>
    shuffle(Array.from({ length: boxColumns }, (_, index) => stack * boxColumns + index), random),
  );

  const pattern = (row: number, column: number) =>
    (boxColumns * (row % boxRows) + Math.floor(row / boxRows) + column) % size;

  return rows.flatMap((row) => columns.map((column) => symbols[pattern(row, column)]!));
}

function removeClues(solution: number[], spec: GridSpec, targetClues: number, random: () => number): number[] {
  const puzzle = [...solution];
  const order = shuffle(Array.from({ length: puzzle.length }, (_, index) => index), random);

  for (const cell of order) {
    if (puzzle.filter(Boolean).length <= targetClues) break;
    const mirror = puzzle.length - 1 - cell;
    const cells = cell === mirror ? [cell] : [cell, mirror];
    const previous = cells.map((index) => puzzle[index]!);
    cells.forEach((index) => {
      puzzle[index] = 0;
    });

    if (puzzle.filter(Boolean).length < targetClues || countSolutions(puzzle, spec, 2) !== 1) {
      cells.forEach((index, position) => {
        puzzle[index] = previous[position]!;
      });
    }
  }

  return puzzle;
}

function getUnits(spec: GridSpec): number[][] {
  const units: number[][] = [];
  for (let row = 0; row < spec.size; row += 1) {
    units.push(Array.from({ length: spec.size }, (_, column) => row * spec.size + column));
  }
  for (let column = 0; column < spec.size; column += 1) {
    units.push(Array.from({ length: spec.size }, (_, row) => row * spec.size + column));
  }
  for (let box = 0; box < spec.size; box += 1) {
    const boxRow = Math.floor(box / (spec.size / spec.boxColumns)) * spec.boxRows;
    const boxColumn = (box % (spec.size / spec.boxColumns)) * spec.boxColumns;
    units.push(Array.from({ length: spec.size }, (_, offset) => (
      (boxRow + Math.floor(offset / spec.boxColumns)) * spec.size + boxColumn + (offset % spec.boxColumns)
    )));
  }
  return units;
}

export function analyzePuzzle(board: number[], spec: GridSpec): PuzzleAnalysis {
  const working = [...board];
  const units = getUnits(spec);
  let nakedSingles = 0;
  let hiddenSingles = 0;
  let progressed = true;

  while (progressed) {
    progressed = false;
    for (let cell = 0; cell < working.length; cell += 1) {
      if (working[cell]) continue;
      const candidates = getCandidates(working, cell, spec);
      if (candidates.length === 1) {
        working[cell] = candidates[0]!;
        nakedSingles += 1;
        progressed = true;
        break;
      }
    }
    if (progressed) continue;

    outer: for (const unit of units) {
      for (let value = 1; value <= spec.size; value += 1) {
        if (unit.some((cell) => working[cell] === value)) continue;
        const possibleCells = unit.filter((cell) => !working[cell] && getCandidates(working, cell, spec).includes(value));
        if (possibleCells.length === 1) {
          working[possibleCells[0]!] = value;
          hiddenSingles += 1;
          progressed = true;
          break outer;
        }
      }
    }
  }

  const unresolvedAfterSingles = working.filter((value) => value === 0).length;
  return {
    nakedSingles,
    hiddenSingles,
    unresolvedAfterSingles,
    score: hiddenSingles * 4 + unresolvedAfterSingles * 12,
  };
}

function prepareTutorialLine(
  givens: number[],
  solution: number[],
  spec: GridSpec,
  lesson: 1 | 2,
  random: () => number,
): number {
  const lines = shuffle(Array.from({ length: spec.size }, (_, index) => index), random);

  for (const line of lines) {
    const cells = Array.from({ length: spec.size }, (_, offset) => (
      lesson === 1 ? line * spec.size + offset : offset * spec.size + line
    ));
    const target = cells.find((cell) => givens[cell] === 0) ?? cells[0]!;
    for (const cell of cells) givens[cell] = solution[cell]!;
    givens[target] = 0;
    return target;
  }

  return givens.findIndex((value) => value === 0);
}

export function createPuzzle(
  difficultyId: DifficultyId,
  seed = Date.now(),
  tutorialLesson?: 1 | 2,
  sequence = 1,
): Puzzle {
  const difficulty = DIFFICULTY_BY_ID[difficultyId];
  const normalizedSeed = Math.abs(Math.trunc(seed)) || 1;
  const random = mulberry32(normalizedSeed);
  const attemptCount = difficultyId === 'pro' ? 6 : difficultyId === 'usta' || difficultyId === 'deneyimli' ? 4 : 2;
  const candidates = Array.from({ length: attemptCount }, () => {
    const solution = buildSolvedBoard(difficulty.spec, random);
    const givens = removeClues(solution, difficulty.spec, difficulty.targetClues, random);
    return { solution, givens, analysis: analyzePuzzle(givens, difficulty.spec) };
  }).sort((a, b) => a.analysis.score - b.analysis.score);
  const chosenIndex = difficultyId === 'pro' || difficultyId === 'deneyimli'
    ? candidates.length - 1
    : difficultyId === 'usta'
      ? Math.floor(candidates.length * .6)
      : 0;
  const chosen = candidates[chosenIndex]!;
  const solution = chosen.solution;
  const givens = [...chosen.givens];
  const tutorialCell = tutorialLesson
    ? prepareTutorialLine(givens, solution, difficulty.spec, tutorialLesson, random)
    : undefined;

  return {
    id: `${difficultyId}-${normalizedSeed.toString(36)}`,
    seed: normalizedSeed,
    sequence,
    difficultyId,
    spec: difficulty.spec,
    givens,
    solution,
    tutorialCell,
    analysis: chosen.analysis,
  };
}

export function isPuzzleComplete(board: number[], puzzle: Puzzle): boolean {
  return board.length === puzzle.solution.length && board.every((value, index) => value === puzzle.solution[index]);
}

export function buildHint(board: number[], puzzle: Puzzle): Hint | null {
  const wrongCell = board.findIndex((value, cell) => (
    value !== 0 && puzzle.givens[cell] === 0 && value !== puzzle.solution[cell]
  ));
  if (wrongCell >= 0) {
    return {
      cell: wrongCell,
      candidates: [puzzle.solution[wrongCell]!],
      title: 'Bir seçimi yeniden düşün',
      message: 'Parlayan yuvadaki simge bu satır, sütun veya bahçeyle uyuşmuyor. Çevresindeki simgeleri karşılaştır.',
    };
  }

  const emptyCells = board
    .map((value, cell) => ({ value, cell }))
    .filter(({ value }) => value === 0)
    .map(({ cell }) => ({ cell, candidates: getCandidates(board, cell, puzzle.spec) }))
    .filter(({ candidates }) => candidates.length > 0)
    .sort((a, b) => a.candidates.length - b.candidates.length);

  const best = emptyCells[0];
  if (!best) return null;

  if (best.candidates.length === 1) {
    return {
      cell: best.cell,
      candidates: best.candidates,
      title: 'Tek olasılık bulundu',
      message: 'Parlayan yuvada yalnızca bir simge mümkün. Aynı satır, sütun ve bahçedeki simgeleri karşılaştır.',
    };
  }

  return {
    cell: best.cell,
    candidates: best.candidates,
    title: 'Bu yuvayı daraltalım',
    message: 'Parlayan yuvada birkaç olasılık var. Aynı satır, sütun ve bahçede görünen simgeleri eleyerek ilerle.',
  };
}

export function describeCell(cell: number, spec: GridSpec): string {
  const row = Math.floor(cell / spec.size) + 1;
  const column = (cell % spec.size) + 1;
  return `${row}. satır, ${column}. sütun`;
}
