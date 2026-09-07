import { candidatesFor, logicalHint, nextHumanStep } from "./game-core.js";
import { runtime, persist } from "./state.js";

export function tutorialLessonFor(tierId, ordinal) {
  if (tierId !== "acemi") return null;
  if (ordinal === 1 && !runtime.save.tutorialLessonsCompleted.includes(1)) return 1;
  if (ordinal === 2 && !runtime.save.tutorialLessonsCompleted.includes(2)) return 2;
  return null;
}

export function buildTutorial(lesson) {
  const puzzle = runtime.puzzle;
  if (!lesson || !puzzle) return null;
  if (lesson === 1) {
    const step = nextHumanStep(puzzle.givens, puzzle) || logicalHint(puzzle.givens, puzzle);
    return { lesson: 1, stage: 0, targetCell: step?.index ?? puzzle.givens.findIndex((value) => !value), targetValue: step?.value ?? 1 };
  }
  const options = puzzle.givens
    .map((value, index) => value ? null : { index, candidates: candidatesFor(puzzle.givens, index, puzzle) })
    .filter(Boolean)
    .filter((item) => item.candidates.length > 1)
    .sort((a, b) => a.candidates.length - b.candidates.length);
  const target = options[0] || (() => {
    const step = logicalHint(puzzle.givens, puzzle);
    return { index: step?.index ?? puzzle.givens.findIndex((value) => !value), candidates: step?.candidates?.length ? step.candidates : [step?.value ?? 1] };
  })();
  return { lesson: 2, stage: 0, targetCell: target.index, noteValue: target.candidates[0] };
}

export function normalizeActiveTutorial() {
  if (!runtime.save.activeGame || !runtime.puzzle) return;
  const lesson = tutorialLessonFor(runtime.save.activeGame.tierId, runtime.save.activeGame.ordinal);
  if (!lesson) {
    runtime.save.activeGame.tutorial = null;
    return;
  }
  if (!runtime.save.activeGame.tutorial || runtime.save.activeGame.tutorial.lesson !== lesson) runtime.save.activeGame.tutorial = buildTutorial(lesson);
}

export function currentTutorial() {
  return runtime.save.activeGame?.tutorial || null;
}

export function markTutorialLessonComplete(lesson) {
  if (!runtime.save.tutorialLessonsCompleted.includes(lesson)) runtime.save.tutorialLessonsCompleted.push(lesson);
  runtime.save.tutorialLessonsCompleted.sort();
  if (runtime.save.activeGame) runtime.save.activeGame.tutorial = null;
  persist();
}

export function ruleIntroForCurrentTier() {
  if (currentTutorial()) return null;
  const tierId = runtime.save.activeGame?.tierId;
  if (!tierId || runtime.save.ruleIntrosSeen.includes(tierId)) return null;
  const intros = {
    cirak: ["●", "Yeni işaret: Komşuluk", "Noktayla bağlı iki yuva ardışık değer taşır. Örneğin 3 ve 4."],
    deneyimli: ["→", "Yeni işaret: Sıra oku", "Okun başladığı yuva daha küçük, gösterdiği yuva daha büyüktür."],
    pro: ["Σ", "Yeni işaret: Toplam bağı", "Bağdaki sayı, iki komşu yuvadaki değerlerin toplamıdır."]
  };
  return intros[tierId] || null;
}
