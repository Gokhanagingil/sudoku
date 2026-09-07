import { useEffect, useReducer } from 'react';
import { DIFFICULTY_BY_ID } from '../domain/difficulties';
import { createPuzzle, getPeerIndices, hasConflict, isPuzzleComplete } from '../domain/sudoku';
import type {
  DifficultyId,
  GameSession,
  GameSettings,
  NotesByCell,
  PersistedGameState,
} from '../domain/types';

const STORAGE_KEY = 'kus-koyu-state-v1';

const emptyCounts = {
  acemi: 0,
  cirak: 0,
  deneyimli: 0,
  usta: 0,
  pro: 0,
};

export const DEFAULT_STATE: PersistedGameState = {
  version: 1,
  progress: {
    points: 0,
    completedPuzzleIds: [],
    puzzlesCompleted: emptyCounts,
    lastDifficultyId: 'acemi',
    tutorialLessonsCompleted: 0,
  },
  settings: {
    theme: 'birds',
    textScale: 'large',
    highContrast: false,
    reducedMotion: false,
    sound: true,
    haptics: true,
    keepAwake: true,
    showTimer: false,
    autoCheck: true,
    showNumbers: true,
  },
  activeSession: null,
};

type Snapshot = Pick<GameSession, 'board' | 'notes'>;

export type GameAction =
  | { type: 'start'; difficultyId: DifficultyId; seed?: number }
  | { type: 'beginTutorial' }
  | { type: 'finishTutorial' }
  | { type: 'skipTutorials' }
  | { type: 'selectCell'; cell: number }
  | { type: 'selectToken'; value: number }
  | { type: 'toggleNotes' }
  | { type: 'enterValue'; value: number }
  | { type: 'erase' }
  | { type: 'undo' }
  | { type: 'restart' }
  | { type: 'tick' }
  | { type: 'useHint'; cell: number }
  | { type: 'dismissTutorial' }
  | { type: 'closeSession' }
  | { type: 'updateSettings'; settings: Partial<GameSettings> };

function snapshot(session: GameSession): Snapshot {
  return {
    board: [...session.board],
    notes: Object.fromEntries(Object.entries(session.notes).map(([cell, notes]) => [cell, [...notes]])),
  };
}

function startSession(
  difficultyId: DifficultyId,
  tutorialLessonsCompleted: number,
  sequence: number,
  seed = Date.now(),
): GameSession {
  const tutorialLesson = difficultyId === 'acemi' && tutorialLessonsCompleted < 2
    ? (tutorialLessonsCompleted + 1) as 1 | 2
    : undefined;
  const puzzle = createPuzzle(difficultyId, seed, tutorialLesson, sequence);
  const targetCell = puzzle.tutorialCell;
  return {
    puzzle,
    board: [...puzzle.givens],
    notes: {},
    selectedCell: null,
    selectedToken: null,
    noteMode: false,
    startedAt: Date.now(),
    elapsedSeconds: 0,
    hintsUsed: 0,
    conflictsSeen: 0,
    undoStack: [],
    completed: false,
    earnedPoints: 0,
    tutorial: tutorialLesson && targetCell !== undefined
      ? {
          lesson: tutorialLesson,
          step: 'intro',
          targetCell,
          targetValue: puzzle.solution[targetCell]!,
        }
      : null,
  };
}

function updateCompletion(state: PersistedGameState, session: GameSession): PersistedGameState {
  if (session.completed || !isPuzzleComplete(session.board, session.puzzle)) {
    return { ...state, activeSession: session };
  }

  const difficulty = DIFFICULTY_BY_ID[session.puzzle.difficultyId];
  const firstCompletion = !state.progress.completedPuzzleIds.includes(session.puzzle.id);
  const earnedPoints = firstCompletion ? difficulty.basePoints : 0;
  const completedPuzzleIds = firstCompletion
    ? [...state.progress.completedPuzzleIds, session.puzzle.id].slice(-500)
    : state.progress.completedPuzzleIds;

  return {
    ...state,
    activeSession: { ...session, completed: true, earnedPoints },
    progress: {
      ...state.progress,
      points: state.progress.points + earnedPoints,
      completedPuzzleIds,
      puzzlesCompleted: {
        ...state.progress.puzzlesCompleted,
        [session.puzzle.difficultyId]:
          state.progress.puzzlesCompleted[session.puzzle.difficultyId] + (firstCompletion ? 1 : 0),
      },
    },
  };
}

function updateNotesAfterEntry(notes: NotesByCell, cell: number, value: number, session: GameSession): NotesByCell {
  const nextNotes: NotesByCell = { ...notes };
  delete nextNotes[cell];
  for (const peer of getPeerIndices(cell, session.puzzle.spec)) {
    if (!nextNotes[peer]?.includes(value)) continue;
    nextNotes[peer] = nextNotes[peer]!.filter((candidate) => candidate !== value);
    if (nextNotes[peer]!.length === 0) delete nextNotes[peer];
  }
  return nextNotes;
}

export function gameReducer(state: PersistedGameState, action: GameAction): PersistedGameState {
  if (action.type === 'start') {
    return {
      ...state,
      progress: { ...state.progress, lastDifficultyId: action.difficultyId },
      activeSession: startSession(
        action.difficultyId,
        state.progress.tutorialLessonsCompleted,
        state.progress.puzzlesCompleted[action.difficultyId] + 1,
        action.seed,
      ),
    };
  }

  if (action.type === 'updateSettings') {
    return { ...state, settings: { ...state.settings, ...action.settings } };
  }

  if (action.type === 'closeSession') return { ...state, activeSession: null };

  const session = state.activeSession;
  if (!session) return state;

  if (action.type === 'beginTutorial') {
    if (!session.tutorial || session.tutorial.step !== 'intro') return state;
    return {
      ...state,
      activeSession: {
        ...session,
        tutorial: { ...session.tutorial, step: 'select-cell' },
      },
    };
  }

  if (action.type === 'finishTutorial') {
    if (!session.tutorial) return state;
    return {
      ...state,
      progress: {
        ...state.progress,
        tutorialLessonsCompleted: Math.max(
          state.progress.tutorialLessonsCompleted,
          session.tutorial.lesson,
        ),
      },
      activeSession: { ...session, tutorial: null },
    };
  }

  if (action.type === 'skipTutorials') {
    return {
      ...state,
      progress: { ...state.progress, tutorialLessonsCompleted: 2 },
      activeSession: { ...session, tutorial: null },
    };
  }

  if (action.type === 'selectCell') {
    if (session.tutorial?.step === 'intro') return state;
    if (session.tutorial?.step === 'select-cell') {
      if (action.cell !== session.tutorial.targetCell) return state;
      return {
        ...state,
        activeSession: {
          ...session,
          selectedCell: action.cell,
          selectedToken: null,
          tutorial: { ...session.tutorial, step: 'select-token' },
        },
      };
    }
    if (session.tutorial?.step === 'select-token' && action.cell !== session.tutorial.targetCell) return state;
    return {
      ...state,
      activeSession: {
        ...session,
        selectedCell: action.cell,
        selectedToken: session.board[action.cell] || session.selectedToken,
      },
    };
  }

  if (action.type === 'selectToken') {
    if (session.tutorial) return state;
    return {
      ...state,
      activeSession: {
        ...session,
        selectedToken: session.selectedToken === action.value ? null : action.value,
      },
    };
  }

  if (action.type === 'toggleNotes') {
    if (session.tutorial) return state;
    return { ...state, activeSession: { ...session, noteMode: !session.noteMode } };
  }

  if (action.type === 'enterValue') {
    const cell = session.selectedCell;
    if (cell === null || session.puzzle.givens[cell] !== 0 || session.completed) return state;
    if (session.tutorial && (
      session.tutorial.step !== 'select-token' || action.value !== session.tutorial.targetValue
    )) return state;
    const undoStack = [...session.undoStack, snapshot(session)].slice(-100);

    if (session.noteMode) {
      const current = session.notes[cell] ?? [];
      const next = current.includes(action.value)
        ? current.filter((candidate) => candidate !== action.value)
        : [...current, action.value].sort((a, b) => a - b);
      const notes = { ...session.notes, [cell]: next };
      if (next.length === 0) delete notes[cell];
      return {
        ...state,
        activeSession: {
          ...session,
          notes,
          undoStack,
          tutorial: session.tutorial,
        },
      };
    }

    const board = [...session.board];
    board[cell] = action.value;
    const notes = updateNotesAfterEntry(session.notes, cell, action.value, session);
    const conflictAdded = hasConflict(board, cell, session.puzzle.spec)
      || action.value !== session.puzzle.solution[cell] ? 1 : 0;
    const nextSession: GameSession = {
      ...session,
      board,
      notes,
      selectedToken: action.value,
      undoStack,
      conflictsSeen: session.conflictsSeen + conflictAdded,
      tutorial: session.tutorial
        ? { ...session.tutorial, step: 'success' }
        : null,
    };
    return updateCompletion(state, nextSession);
  }

  if (action.type === 'erase') {
    const cell = session.selectedCell;
    if (cell === null || session.puzzle.givens[cell] !== 0 || session.completed) return state;
    if (!session.board[cell] && !session.notes[cell]?.length) return state;
    const board = [...session.board];
    board[cell] = 0;
    const notes = { ...session.notes };
    delete notes[cell];
    return {
      ...state,
      activeSession: {
        ...session,
        board,
        notes,
        undoStack: [...session.undoStack, snapshot(session)].slice(-100),
      },
    };
  }

  if (action.type === 'undo') {
    const previous = session.undoStack.at(-1);
    if (!previous || session.completed) return state;
    return {
      ...state,
      activeSession: {
        ...session,
        board: previous.board,
        notes: previous.notes,
        undoStack: session.undoStack.slice(0, -1),
      },
    };
  }

  if (action.type === 'restart') {
    return {
      ...state,
      activeSession: {
        ...session,
        board: [...session.puzzle.givens],
        notes: {},
        selectedCell: null,
        selectedToken: null,
        noteMode: false,
        startedAt: Date.now(),
        elapsedSeconds: 0,
        hintsUsed: 0,
        conflictsSeen: 0,
        undoStack: [],
        completed: false,
        earnedPoints: 0,
        tutorial: session.tutorial
          ? { ...session.tutorial, step: 'intro' }
          : null,
      },
    };
  }

  if (action.type === 'tick') {
    if (session.completed) return state;
    return { ...state, activeSession: { ...session, elapsedSeconds: session.elapsedSeconds + 1 } };
  }

  if (action.type === 'useHint') {
    return {
      ...state,
      activeSession: {
        ...session,
        selectedCell: action.cell,
        hintsUsed: session.hintsUsed + 1,
      },
    };
  }

  if (action.type === 'dismissTutorial') {
    return gameReducer(state, { type: 'skipTutorials' });
  }

  return state;
}

function loadState(): PersistedGameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<PersistedGameState>;
    if (parsed.version !== 1 || !parsed.progress || !parsed.settings) return DEFAULT_STATE;
    return {
      ...DEFAULT_STATE,
      ...parsed,
      progress: {
        ...DEFAULT_STATE.progress,
        ...parsed.progress,
        puzzlesCompleted: {
          ...DEFAULT_STATE.progress.puzzlesCompleted,
          ...parsed.progress.puzzlesCompleted,
        },
      },
      settings: { ...DEFAULT_STATE.settings, ...parsed.settings },
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export function useGameState() {
  const [state, dispatch] = useReducer(gameReducer, undefined, loadState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  return { state, dispatch };
}
