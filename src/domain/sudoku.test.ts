import { describe, expect, it } from 'vitest';
import { DIFFICULTIES } from './difficulties';
import { analyzePuzzle, countSolutions, createPuzzle, getBoxIndex, getCandidates, hasConflict, isPuzzleComplete } from './sudoku';

describe('Sudoku puzzle engine', () => {
  it.each(DIFFICULTIES)('creates a unique and valid $title puzzle', (difficulty) => {
    const puzzle = createPuzzle(difficulty.id, 20260907 + difficulty.minPoints);

    expect(puzzle.givens).toHaveLength(difficulty.spec.size ** 2);
    expect(puzzle.solution).toHaveLength(difficulty.spec.size ** 2);
    expect(countSolutions(puzzle.givens, puzzle.spec)).toBe(1);
    expect(puzzle.givens.filter(Boolean).length).toBeGreaterThanOrEqual(difficulty.targetClues);
    expect(isPuzzleComplete(puzzle.solution, puzzle)).toBe(true);
    expect(puzzle.analysis).toEqual(analyzePuzzle(puzzle.givens, puzzle.spec));

    for (let row = 0; row < difficulty.spec.size; row += 1) {
      const rowValues = puzzle.solution.slice(row * difficulty.spec.size, (row + 1) * difficulty.spec.size);
      expect(new Set(rowValues).size).toBe(difficulty.spec.size);
    }

    for (let column = 0; column < difficulty.spec.size; column += 1) {
      const columnValues = puzzle.solution.filter((_, cell) => cell % difficulty.spec.size === column);
      expect(new Set(columnValues).size).toBe(difficulty.spec.size);
    }

    for (let box = 0; box < difficulty.spec.size; box += 1) {
      const boxValues = puzzle.solution.filter((_, cell) => getBoxIndex(cell, difficulty.spec) === box);
      expect(new Set(boxValues).size).toBe(difficulty.spec.size);
    }
  }, 20_000);

  it('finds candidates and detects a repeated symbol', () => {
    const puzzle = createPuzzle('acemi', 42);
    const emptyCell = puzzle.givens.findIndex((value) => value === 0);
    const candidates = getCandidates(puzzle.givens, emptyCell, puzzle.spec);
    expect(candidates).toContain(puzzle.solution[emptyCell]);

    const peer = puzzle.givens.findIndex((value, cell) => value !== 0 && (
      Math.floor(cell / puzzle.spec.size) === Math.floor(emptyCell / puzzle.spec.size) ||
      cell % puzzle.spec.size === emptyCell % puzzle.spec.size
    ));
    const board = [...puzzle.givens];
    board[emptyCell] = board[peer]!;
    expect(hasConflict(board, emptyCell, puzzle.spec)).toBe(true);
  });
});
