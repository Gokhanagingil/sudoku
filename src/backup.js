import { TIERS } from "./content.js";
import { createPuzzle } from "./game-core.js";

export const MAX_BACKUP_BYTES = 2 * 1024 * 1024;
const ids = TIERS.map(t => t.id);
const object = v => v !== null && typeof v === "object" && !Array.isArray(v);
const integer = (v, min = 0, max = 1000000000) => Number.isSafeInteger(v) && v >= min && v <= max;
const copy = v => JSON.parse(JSON.stringify(v));
function checkNotes(notes, size) {
  return object(notes) && Object.entries(notes).every(([cell, values]) => /^\d+$/.test(cell) && integer(Number(cell), 0, size * size - 1) && Array.isArray(values) && values.length <= size && new Set(values).size === values.length && values.every(n => integer(n, 1, size)));
}
function checkValues(values, puzzle) {
  return Array.isArray(values) && values.length === puzzle.size ** 2 && values.every((n, i) => integer(n, 0, puzzle.size) && (!puzzle.givens[i] || n === puzzle.givens[i]));
}
export function validateSave(raw) {
  if (!object(raw) || raw.version !== 3 || !integer(raw.score) || !ids.includes(raw.selectedTier) || !["birds", "shapes", "numbers"].includes(raw.theme)) throw new Error("Oyun kaydı tanınamadı.");
  if (!Array.isArray(raw.completed) || raw.completed.length > 50000 || raw.completed.some(id => !/^(acemi|cirak|deneyimli|usta|pro)-[1-9]\d{0,6}$/.test(id)) || new Set(raw.completed).size !== raw.completed.length) throw new Error("Tamamlanan bahçeler okunamadı.");
  if (!object(raw.nextOrdinal) || ids.some(id => !integer(raw.nextOrdinal[id], 1, 1000000))) throw new Error("Bahçe sırası okunamadı.");
  if (!Array.isArray(raw.tutorialLessonsCompleted) || raw.tutorialLessonsCompleted.some(n => ![1, 2].includes(n)) || !Array.isArray(raw.ruleIntrosSeen) || raw.ruleIntrosSeen.some(id => !ids.includes(id))) throw new Error("Öğretici kaydı okunamadı.");
  if (!object(raw.stats) || ["completed", "hints", "undos", "placements", "notes"].some(key => !integer(raw.stats[key]))) throw new Error("İstatistik kaydı okunamadı.");
  if (raw.activeGame !== null) {
    const g = raw.activeGame;
    if (!object(g) || !ids.includes(g.tierId) || !integer(g.ordinal, 1, 1000000) || !integer(g.elapsedBefore, 0, Number.MAX_SAFE_INTEGER)) throw new Error("Açık bahçe okunamadı.");
    const p = createPuzzle(g.tierId, g.ordinal);
    if (!checkValues(g.values, p) || !checkNotes(g.notes, p.size) || !Array.isArray(g.history) || g.history.length > 100 || g.history.some(h => !object(h) || !checkValues(h.values, p) || !checkNotes(h.notes, p.size))) throw new Error("Taşlar veya notlar geçerli değil.");
    if (g.tutorial != null) {
      const t = g.tutorial;
      if (!object(t) || ![1, 2].includes(t.lesson) || !integer(t.stage, 0, 3) || !integer(t.targetCell, 0, p.size * p.size - 1) || !integer(t.lesson === 1 ? t.targetValue : t.noteValue, 1, p.size)) throw new Error("Öğretici adımı geçerli değil.");
    }
  }
  return copy(raw);
}
export function parseBackup(text) {
  if (typeof text !== "string" || new TextEncoder().encode(text).byteLength > MAX_BACKUP_BYTES) throw new Error("Yedek dosyası çok büyük.");
  let data;
  try { data = JSON.parse(text); } catch { throw new Error("Bu dosya bir oyun yedeği değil."); }
  if (data?.format !== "kus-koyu-denge-backup" || data.version !== 1 || !object(data.settings) || Object.values(data.settings).some(v => typeof v !== "boolean")) throw new Error("Yedek sürümü desteklenmiyor.");
  const save = validateSave(data.save);
  if (save.activeGame) { save.activeGame.startedAt = Date.now(); save.activeGame.clockRunning = false; }
  return { save, settings: data.settings };
}
export function stringifyBackup(save, settings) {
  return JSON.stringify({ format: "kus-koyu-denge-backup", version: 1, savedAt: new Date().toISOString(), save: validateSave(save), settings }, null, 2);
}
