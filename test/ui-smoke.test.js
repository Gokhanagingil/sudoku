import test from "node:test";
import assert from "node:assert/strict";

const store = new Map();
globalThis.localStorage = {
  getItem: (key) => store.has(key) ? store.get(key) : null,
  setItem: (key, value) => store.set(key, String(value)),
  removeItem: (key) => store.delete(key),
  clear: () => store.clear()
};
const { runtime } = await import("../src/state.js");
const { createPuzzle } = await import("../src/game-core.js");
const { homeMarkup } = await import("../src/home-view.js");
const { gameMarkup } = await import("../src/game-view.js");
const { buildTutorial } = await import("../src/tutorial.js");

test("home screen exposes a single clear start action and five mastery tiers", () => {
  runtime.save.activeGame = null;
  const html = homeMarkup();
  assert.match(html, /Kaldığın yerden devam et|Yeni bahçeye başla/);
  assert.match(html, /Kuş Köyü/);
  assert.equal((html.match(/data-tier=/g) || []).length, 5);
});

test("game screen renders board, four core tools and no forced timer", () => {
  runtime.puzzle = createPuzzle("acemi", 1);
  runtime.save.activeGame = {
    tierId: "acemi", ordinal: 1, values: [...runtime.puzzle.givens], notes: {}, history: [],
    startedAt: Date.now(), elapsedBefore: 0, tutorial: null
  };
  runtime.settings.showTimer = false;
  const html = gameMarkup("00:00");
  assert.equal((html.match(/data-action="(note|undo|erase|hint)"/g) || []).length, 4);
  assert.equal((html.match(/data-cell=/g) || []).length, 16);
  assert.doesNotMatch(html, /data-timer/);
});

test("first lesson points to an actual empty cell and its canonical value", () => {
  runtime.puzzle = createPuzzle("acemi", 1);
  const tutorial = buildTutorial(1);
  assert.equal(runtime.puzzle.givens[tutorial.targetCell], 0);
  assert.equal(tutorial.targetValue, runtime.puzzle.solution[tutorial.targetCell]);
});
