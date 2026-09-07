const SAVE_KEY = "kus-koyu-denge-save-v3";
const LEGACY_SAVE_KEY = "kus-koyu-denge-save-v2";
const SETTINGS_KEY = "kus-koyu-denge-settings-v3";
const LEGACY_SETTINGS_KEY = "kus-koyu-denge-settings-v2";

export const defaultSave = {
  version: 3,
  score: 0,
  completed: [],
  selectedTier: "acemi",
  nextOrdinal: { acemi: 1, cirak: 1, deneyimli: 1, usta: 1, pro: 1 },
  activeGame: null,
  theme: "birds",
  tutorialLessonsCompleted: [],
  ruleIntrosSeen: [],
  stats: { completed: 0, hints: 0, undos: 0, placements: 0, notes: 0 }
};

export const defaultSettings = {
  largeText: true,
  highContrast: false,
  reduceMotion: false,
  showTimer: false,
  showMistakes: false,
  numberSupport: true,
  keepAwake: true,
  sound: true,
  haptics: true
};

export function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function readStored(key) {
  try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
}

function loadAndNormalizeSave() {
  const raw = readStored(SAVE_KEY) || readStored(LEGACY_SAVE_KEY) || {};
  const tutorialLessonsCompleted = Array.isArray(raw.tutorialLessonsCompleted)
    ? raw.tutorialLessonsCompleted.filter((item) => item === 1 || item === 2)
    : raw.tutorialComplete ? [1] : [];
  return {
    ...clone(defaultSave),
    ...raw,
    version: 3,
    completed: Array.isArray(raw.completed) ? raw.completed : [],
    nextOrdinal: { ...defaultSave.nextOrdinal, ...(raw.nextOrdinal || {}) },
    tutorialLessonsCompleted,
    ruleIntrosSeen: Array.isArray(raw.ruleIntrosSeen) ? raw.ruleIntrosSeen : [],
    stats: { ...defaultSave.stats, ...(raw.stats || {}) },
    theme: ["birds", "shapes", "numbers"].includes(raw.theme) ? raw.theme : "birds"
  };
}

function loadAndNormalizeSettings() {
  const raw = readStored(SETTINGS_KEY) || readStored(LEGACY_SETTINGS_KEY) || {};
  return { ...clone(defaultSettings), ...raw };
}

export const runtime = {
  save: loadAndNormalizeSave(),
  settings: loadAndNormalizeSettings(),
  screen: "home",
  puzzle: null,
  selectedCell: null,
  selectedToken: null,
  notesMode: false,
  result: null,
  settingsOpen: false,
  menuOpen: false,
  hintFocus: null
};

export function persist() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(runtime.save));
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(runtime.settings));
}

persist();
