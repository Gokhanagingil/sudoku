export type GridSize = 4 | 6 | 9;

export type DifficultyId = 'acemi' | 'cirak' | 'deneyimli' | 'usta' | 'pro';
export type ThemeId = 'birds' | 'shapes' | 'classic';

export interface GridSpec {
  size: GridSize;
  boxRows: number;
  boxColumns: number;
}

export interface Difficulty {
  id: DifficultyId;
  title: string;
  shortDescription: string;
  longDescription: string;
  minPoints: number;
  basePoints: number;
  spec: GridSpec;
  targetClues: number;
  accent: string;
}

export interface Puzzle {
  id: string;
  seed: number;
  sequence: number;
  difficultyId: DifficultyId;
  spec: GridSpec;
  givens: number[];
  solution: number[];
  tutorialCell?: number;
  analysis: PuzzleAnalysis;
}

export interface PuzzleAnalysis {
  nakedSingles: number;
  hiddenSingles: number;
  unresolvedAfterSingles: number;
  score: number;
}

export type NotesByCell = Record<number, number[]>;

export type TutorialStep = 'intro' | 'select-cell' | 'select-token' | 'success';

export interface TutorialState {
  lesson: 1 | 2;
  step: TutorialStep;
  targetCell: number;
  targetValue: number;
}

export interface GameSession {
  puzzle: Puzzle;
  board: number[];
  notes: NotesByCell;
  selectedCell: number | null;
  selectedToken: number | null;
  noteMode: boolean;
  startedAt: number;
  elapsedSeconds: number;
  hintsUsed: number;
  conflictsSeen: number;
  undoStack: Array<{ board: number[]; notes: NotesByCell }>;
  completed: boolean;
  earnedPoints: number;
  tutorial: TutorialState | null;
}

export interface PlayerProgress {
  points: number;
  completedPuzzleIds: string[];
  puzzlesCompleted: Record<DifficultyId, number>;
  lastDifficultyId: DifficultyId;
  tutorialLessonsCompleted: number;
}

export interface GameSettings {
  theme: ThemeId;
  textScale: 'large' | 'larger';
  highContrast: boolean;
  reducedMotion: boolean;
  sound: boolean;
  haptics: boolean;
  keepAwake: boolean;
  showTimer: boolean;
  autoCheck: boolean;
  showNumbers: boolean;
}

export interface PersistedGameState {
  version: 1;
  progress: PlayerProgress;
  settings: GameSettings;
  activeSession: GameSession | null;
}

export interface Hint {
  cell: number;
  title: string;
  message: string;
  candidates: number[];
}
