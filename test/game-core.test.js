import test from "node:test";
import assert from "node:assert/strict";
import { TIERS, tierForId } from "../src/content.js";
import {
  baseCandidatesFor,
  candidatesFor,
  createPuzzle,
  findConflicts,
  isComplete,
  logicalHint,
  makeRegions,
  makeSolution,
  solvePuzzle
} from "../src/game-core.js";

function validUnits(values, size, regions) {
  const expected = Array.from({ length: size }, (_, index) => index + 1).join(",");
  for (let row = 0; row < size; row += 1) {
    assert.equal(values.slice(row * size, row * size + size).sort((a, b) => a - b).join(","), expected);
  }
  for (let col = 0; col < size; col += 1) {
    const column = Array.from({ length: size }, (_, row) => values[row * size + col]);
    assert.equal(column.sort((a, b) => a - b).join(","), expected);
  }
  for (let region = 0; region < size; region += 1) {
    const unit = values.filter((_, index) => regions[index] === region);
    assert.equal(unit.sort((a, b) => a - b).join(","), expected);
  }
}

test("4x4 solution respects row, column and garden uniqueness", () => {
  const regions = makeRegions(4, 2, 2);
  const solution = makeSolution(4, 2, 2, "test-4");
  validUnits(solution, 4, regions);
});

test("6x6 solution respects 2x3 garden uniqueness", () => {
  const regions = makeRegions(6, 2, 3);
  const solution = makeSolution(6, 2, 3, "test-6");
  validUnits(solution, 6, regions);
});

test("generated beginner puzzle has exactly one solution", () => {
  const puzzle = createPuzzle("acemi", 1);
  const solved = solvePuzzle(puzzle, 2);
  assert.equal(solved.count, 1);
  assert.deepEqual(solved.solution, puzzle.solution);
});

test("relationship tiers actually contain the promised clue types", () => {
  for (const tier of TIERS) {
    const puzzle = createPuzzle(tier.id, 2);
    const types = new Set(puzzle.constraints.map((constraint) => constraint.type));
    for (const type of tier.clueTypes) assert.ok(types.has(type), `${tier.id} should contain ${type}`);
  }
});

test("relationship clues can narrow candidates beyond row/column/garden", () => {
  let found = false;
  for (let ordinal = 1; ordinal <= 12 && !found; ordinal += 1) {
    const puzzle = createPuzzle("pro", ordinal);
    const values = [...puzzle.givens];
    for (let index = 0; index < values.length; index += 1) {
      if (values[index]) continue;
      if (candidatesFor(values, index, puzzle).length < baseCandidatesFor(values, index, puzzle).length) {
        found = true;
        break;
      }
    }
  }
  assert.equal(found, true);
});

test("candidates reject row duplicates", () => {
  const puzzle = createPuzzle("acemi", 3);
  const values = [...puzzle.givens];
  const index = values.findIndex((value) => value === 0);
  const row = Math.floor(index / puzzle.size);
  const usedInRow = values.slice(row * puzzle.size, row * puzzle.size + puzzle.size).filter(Boolean);
  const candidates = candidatesFor(values, index, puzzle);
  for (const used of usedInRow) assert.ok(!candidates.includes(used));
});

test("conflict detection is gentle but exact", () => {
  const puzzle = createPuzzle("acemi", 4);
  const values = [...puzzle.givens];
  const empty = values.map((value, index) => value ? -1 : index).filter((index) => index >= 0);
  const first = empty[0];
  const row = Math.floor(first / puzzle.size);
  const rowValue = values.slice(row * puzzle.size, row * puzzle.size + puzzle.size).find(Boolean);
  values[first] = rowValue;
  assert.ok(findConflicts(values, puzzle).has(first));
});

test("complete board is recognized", () => {
  const puzzle = createPuzzle("acemi", 5);
  assert.equal(isComplete(puzzle.solution, puzzle), true);
});

test("logical hint never mutates the board and leaves the move to the player", () => {
  const puzzle = createPuzzle("deneyimli", 3);
  const values = [...puzzle.givens];
  const before = [...values];
  const hint = logicalHint(values, puzzle);
  assert.ok(hint);
  assert.deepEqual(values, before);
  assert.ok(Number.isInteger(hint.index));
  assert.ok(hint.reason.length > 20);
});

test("difficulty analysis rises across mastery tiers", () => {
  const averages = [];
  for (const tier of TIERS) {
    const scores = Array.from({ length: 8 }, (_, index) => createPuzzle(tier.id, index + 1).analysis.score);
    averages.push(scores.reduce((a, b) => a + b, 0) / scores.length);
  }
  for (let index = 1; index < averages.length; index += 1) {
    assert.ok(averages[index] > averages[index - 1], `${TIERS[index].id} should rate above ${TIERS[index - 1].id}`);
  }
});

test("100-level fast quality gate is deterministic, unique and tier-calibrated", { timeout: 90000 }, () => {
  for (const tier of TIERS) {
    for (let ordinal = 1; ordinal <= 20; ordinal += 1) {
      const puzzle = createPuzzle(tier.id, ordinal);
      const solved = solvePuzzle(puzzle, 2);
      assert.equal(solved.count, 1, `${tier.id}-${ordinal} should be unique`);
      assert.deepEqual(solved.solution, puzzle.solution, `${tier.id}-${ordinal} should solve to its canonical board`);
      assert.equal(puzzle.givens.length, tier.size * tier.size);
      assert.ok(puzzle.givens.filter(Boolean).length >= tier.targetGivens, `${tier.id}-${ordinal} should not undershoot givens`);
      assert.equal(puzzle.analysis.unresolved, 0, `${tier.id}-${ordinal} should be explainable by the core hint techniques`);
    }
  }
  for (const tier of TIERS) {
    for (const ordinal of [1, 10, 20]) {
      const first = createPuzzle(tier.id, ordinal);
      const second = createPuzzle(tier.id, ordinal);
      assert.deepEqual(second.givens, first.givens, `${tier.id}-${ordinal} should be deterministic`);
      assert.deepEqual(second.constraints, first.constraints, `${tier.id}-${ordinal} constraints should be deterministic`);
    }
  }
});

test("tier lookup remains stable for all five product levels", () => {
  assert.deepEqual(["acemi", "cirak", "deneyimli", "usta", "pro"].map((id) => tierForId(id).id), ["acemi", "cirak", "deneyimli", "usta", "pro"]);
});
