import { describe, expect, it } from 'vitest';
import { DIFFICULTY_BY_ID } from '../domain/difficulties';
import { DEFAULT_STATE, gameReducer } from './gameState';

const trainedState = () => ({
  ...DEFAULT_STATE,
  progress: { ...DEFAULT_STATE.progress, tutorialLessonsCompleted: 2 },
});

function solveActivePuzzle(state: ReturnType<typeof trainedState>) {
  const puzzle = state.activeSession!.puzzle;
  let solved = state;
  puzzle.givens.forEach((value, cell) => {
    if (value !== 0) return;
    solved = gameReducer(solved, { type: 'selectCell', cell });
    solved = gameReducer(solved, { type: 'enterValue', value: puzzle.solution[cell]! });
  });
  return solved;
}

describe('game state', () => {
  it('keeps puzzle progress intact while changing visual theme', () => {
    const started = gameReducer(trainedState(), { type: 'start', difficultyId: 'acemi', seed: 123 });
    const changed = gameReducer(started, { type: 'updateSettings', settings: { theme: 'shapes' } });

    expect(changed.settings.theme).toBe('shapes');
    expect(changed.activeSession?.puzzle).toEqual(started.activeSession?.puzzle);
    expect(changed.activeSession?.board).toEqual(started.activeSession?.board);
  });

  it('stores notes without changing the chosen cell value', () => {
    let state = gameReducer(trainedState(), { type: 'start', difficultyId: 'acemi', seed: 456 });
    const session = state.activeSession!;
    const cell = session.board.findIndex((value) => value === 0);
    const value = session.puzzle.solution[cell]!;

    state = gameReducer(state, { type: 'selectCell', cell });
    state = gameReducer(state, { type: 'toggleNotes' });
    state = gameReducer(state, { type: 'enterValue', value });

    expect(state.activeSession?.board[cell]).toBe(0);
    expect(state.activeSession?.notes[cell]).toEqual([value]);
  });

  it('awards points once when a puzzle is completed', () => {
    let state = gameReducer(trainedState(), { type: 'start', difficultyId: 'acemi', seed: 789 });
    state = solveActivePuzzle(state);

    expect(state.activeSession?.completed).toBe(true);
    expect(state.activeSession?.earnedPoints).toBeGreaterThan(0);
    expect(state.progress.points).toBe(state.activeSession?.earnedPoints);
    expect(state.progress.puzzlesCompleted.acemi).toBe(1);
  });

  it('never awards a second score for the same seeded puzzle', () => {
    let state = gameReducer(trainedState(), { type: 'start', difficultyId: 'acemi', seed: 222 });
    state = solveActivePuzzle(state);
    const firstScore = state.progress.points;

    state = gameReducer(state, { type: 'start', difficultyId: 'acemi', seed: 222 });
    state = solveActivePuzzle(state);

    expect(state.activeSession?.completed).toBe(true);
    expect(state.activeSession?.earnedPoints).toBe(0);
    expect(state.progress.points).toBe(firstScore);
    expect(state.progress.puzzlesCompleted.acemi).toBe(1);
  });

  it('clears a placed value from peer notes and restores everything with undo', () => {
    let state = gameReducer(trainedState(), { type: 'start', difficultyId: 'acemi', seed: 321 });
    const session = state.activeSession!;
    const target = session.board.findIndex((value) => value === 0);
    const value = session.puzzle.solution[target]!;
    const peer = session.board.findIndex((cellValue, cell) => (
      cellValue === 0 && cell !== target && (
        Math.floor(cell / session.puzzle.spec.size) === Math.floor(target / session.puzzle.spec.size)
        || cell % session.puzzle.spec.size === target % session.puzzle.spec.size
      )
    ));
    expect(peer).toBeGreaterThanOrEqual(0);

    state = gameReducer(state, { type: 'selectCell', cell: peer });
    state = gameReducer(state, { type: 'toggleNotes' });
    state = gameReducer(state, { type: 'enterValue', value });
    state = gameReducer(state, { type: 'toggleNotes' });
    state = gameReducer(state, { type: 'selectCell', cell: target });
    state = gameReducer(state, { type: 'enterValue', value });
    expect(state.activeSession?.notes[peer]).toBeUndefined();

    state = gameReducer(state, { type: 'undo' });
    expect(state.activeSession?.board[target]).toBe(0);
    expect(state.activeSession?.notes[peer]).toEqual([value]);
  });

  it('supports choosing a token before choosing a cell', () => {
    let state = gameReducer(trainedState(), { type: 'start', difficultyId: 'acemi', seed: 987 });
    const value = state.activeSession!.puzzle.solution.find(Boolean)!;
    state = gameReducer(state, { type: 'selectToken', value });
    expect(state.activeSession?.selectedToken).toBe(value);
  });

  it('guides the first two acemi puzzles one step at a time', () => {
    let state = gameReducer(DEFAULT_STATE, { type: 'start', difficultyId: 'acemi', seed: 654 });
    expect(state.activeSession?.tutorial?.lesson).toBe(1);
    expect(state.activeSession?.tutorial?.step).toBe('intro');

    state = gameReducer(state, { type: 'beginTutorial' });
    const tutorial = state.activeSession!.tutorial!;
    const target = tutorial.targetCell;
    const wrongCell = state.activeSession!.board.findIndex((_, cell) => cell !== target);

    const ignoredCell = gameReducer(state, { type: 'selectCell', cell: wrongCell });
    expect(ignoredCell).toBe(state);

    state = gameReducer(state, { type: 'selectCell', cell: target });
    expect(state.activeSession?.tutorial?.step).toBe('select-token');

    const wrongValue = tutorial.targetValue === 1 ? 2 : 1;
    const ignoredToken = gameReducer(state, { type: 'enterValue', value: wrongValue });
    expect(ignoredToken).toBe(state);

    state = gameReducer(state, { type: 'enterValue', value: tutorial.targetValue });
    expect(state.activeSession?.tutorial?.step).toBe('success');
    expect(state.activeSession?.board[target]).toBe(tutorial.targetValue);

    state = gameReducer(state, { type: 'finishTutorial' });
    expect(state.activeSession?.tutorial).toBeNull();
    expect(state.progress.tutorialLessonsCompleted).toBe(1);
  });

  it('uses hints without changing the board, notes, or points', () => {
    let state = gameReducer(trainedState(), { type: 'start', difficultyId: 'acemi', seed: 321 });
    const beforeBoard = [...state.activeSession!.board];
    const beforeNotes = { ...state.activeSession!.notes };
    const emptyCell = beforeBoard.findIndex((value) => value === 0);

    state = gameReducer(state, { type: 'useHint', cell: emptyCell });

    expect(state.activeSession?.board).toEqual(beforeBoard);
    expect(state.activeSession?.notes).toEqual(beforeNotes);
    expect(state.activeSession?.selectedCell).toBe(emptyCell);
    expect(state.activeSession?.hintsUsed).toBe(1);
    expect(state.progress.points).toBe(0);
  });

  it('keeps the full level reward after a hint and a corrected mistake', () => {
    let state = gameReducer(trainedState(), { type: 'start', difficultyId: 'acemi', seed: 147 });
    const puzzle = state.activeSession!.puzzle;
    const firstEmpty = puzzle.givens.findIndex((value) => value === 0);
    const wrongValue = puzzle.solution[firstEmpty] === 1 ? 2 : 1;

    state = gameReducer(state, { type: 'useHint', cell: firstEmpty });
    state = gameReducer(state, { type: 'enterValue', value: wrongValue });
    state = gameReducer(state, { type: 'enterValue', value: puzzle.solution[firstEmpty]! });

    puzzle.givens.forEach((value, cell) => {
      if (value !== 0 || cell === firstEmpty) return;
      state = gameReducer(state, { type: 'selectCell', cell });
      state = gameReducer(state, { type: 'enterValue', value: puzzle.solution[cell]! });
    });

    expect(state.activeSession?.completed).toBe(true);
    expect(state.activeSession?.hintsUsed).toBe(1);
    expect(state.activeSession?.conflictsSeen).toBeGreaterThan(0);
    expect(state.activeSession?.earnedPoints).toBe(DIFFICULTY_BY_ID.acemi.basePoints);
    expect(state.progress.points).toBe(DIFFICULTY_BY_ID.acemi.basePoints);
  });
});
