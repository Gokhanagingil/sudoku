import { elapsedMillis } from "./clock.js";
import { parseBackup, stringifyBackup, validateSave } from "./backup.js";

const SAVE_KEY = "kus-koyu-denge-save-v3";
const SETTINGS_KEY = "kus-koyu-denge-settings-v3";
const BACKUP_KEY = "kus-koyu-denge-recovery-v1";
export const defaultSave = {
  version: 3, score: 0, completed: [], selectedTier: "acemi",
  nextOrdinal: { acemi: 1, cirak: 1, deneyimli: 1, usta: 1, pro: 1 },
  activeGame: null, theme: "birds", tutorialLessonsCompleted: [], ruleIntrosSeen: [],
  stats: { completed: 0, hints: 0, undos: 0, placements: 0, notes: 0 }
};
export const defaultSettings = {
  largeText: true, highContrast: false, reduceMotion: false, showTimer: false,
  showMistakes: false, numberSupport: true, keepAwake: true, sound: true, haptics: true
};
export function clone(value) { return JSON.parse(JSON.stringify(value)); }
function settingsFrom(raw = {}) {
  return Object.fromEntries(Object.entries(defaultSettings).map(([key, fallback]) => [key, typeof raw?.[key] === "boolean" ? raw[key] : fallback]));
}
function read(key) { try { return localStorage.getItem(key); } catch { return null; } }
function load() {
  const text = read(SAVE_KEY) || read("kus-koyu-denge-save-v2");
  try {
    const raw = text ? JSON.parse(text) : clone(defaultSave);
    const migrated = { ...clone(defaultSave), ...raw, version: 3, nextOrdinal: { ...defaultSave.nextOrdinal, ...raw.nextOrdinal }, stats: { ...defaultSave.stats, ...raw.stats }, tutorialLessonsCompleted: raw.tutorialLessonsCompleted ?? (raw.tutorialComplete ? [1] : []) };
    const save = validateSave(migrated);
    if (save.activeGame) { save.activeGame.clockRunning = false; save.activeGame.startedAt = Date.now(); }
    let settings;
    try { settings = settingsFrom(JSON.parse(read(SETTINGS_KEY) || read("kus-koyu-denge-settings-v2") || "{}")); } catch { settings = settingsFrom(); }
    return { save, settings, storageWarning: "" };
  } catch {
    try { return { ...parseBackup(read(BACKUP_KEY)), storageWarning: "Son sağlam kaydın geri yüklendi." }; }
    catch { return { save: clone(defaultSave), settings: settingsFrom(), storageWarning: "Kayıt okunamadı. Varsa Ayarlar’dan yedeğini yükle.", preserveUnreadable: true }; }
  }
}
export const runtime = {
  ...load(), screen: "home", puzzle: null, selectedCell: null, selectedToken: null,
  notesMode: false, result: null, settingsOpen: false, menuOpen: false, hintFocus: null
};
let lastGood = null;
try { lastGood = stringifyBackup(runtime.save, runtime.settings); } catch { /* Do not mask initial errors. */ }
export function persist() {
  try {
    // Keep the unreadable original for recovery; never silently discard it.
    if (runtime.preserveUnreadable) {
      const raw = read(SAVE_KEY);
      if (raw) localStorage.setItem("kus-koyu-denge-unreadable", raw);
      runtime.preserveUnreadable = false;
    }
    if (lastGood) localStorage.setItem(BACKUP_KEY, lastGood);
    const snapshot = clone(runtime.save);
    if (snapshot.activeGame) { snapshot.activeGame.elapsedBefore = elapsedMillis(snapshot.activeGame); snapshot.activeGame.clockRunning = false; }
    localStorage.setItem(SAVE_KEY, JSON.stringify(snapshot));
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(runtime.settings));
    lastGood = JSON.stringify({ format: "kus-koyu-denge-backup", version: 1, save: snapshot, settings: runtime.settings });
    return true;
  } catch {
    runtime.storageWarning = "Kayıt yapılamıyor. Oyunu kapatmadan Ayarlar’dan yedek al.";
    return false;
  }
}
