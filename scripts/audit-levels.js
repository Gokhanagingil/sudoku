import assert from "node:assert/strict";
import { TIERS } from "../src/content.js";
import { createPuzzle, solvePuzzle } from "../src/game-core.js";

const PACK_SIZE_PER_TIER = 60;
const startedAt = Date.now();
const summary = [];

for (const tier of TIERS) {
  const seen = new Set();
  const scores = [];
  const labels = new Map();
  for (let ordinal = 1; ordinal <= PACK_SIZE_PER_TIER; ordinal += 1) {
    const puzzle = createPuzzle(tier.id, ordinal);
    const solved = solvePuzzle(puzzle, 2);
    const fingerprint = `${puzzle.givens.join("")}|${JSON.stringify(puzzle.constraints)}`;
    assert.equal(solved.count, 1, `${tier.id}-${ordinal}: çözüm benzersiz değil`);
    assert.deepEqual(solved.solution, puzzle.solution, `${tier.id}-${ordinal}: kanonik çözüme ulaşmıyor`);
    assert.ok(puzzle.givens.filter(Boolean).length >= tier.targetGivens, `${tier.id}-${ordinal}: başlangıç taşı hedefin altında`);
    assert.equal(puzzle.analysis.unresolved, 0, `${tier.id}-${ordinal}: açıklanabilir temel tekniklerle çözülemiyor`);
    assert.ok(!seen.has(fingerprint), `${tier.id}-${ordinal}: aynı kademede yinelenen bulmaca`);
    seen.add(fingerprint);
    scores.push(puzzle.analysis.score);
    labels.set(puzzle.analysis.label, (labels.get(puzzle.analysis.label) || 0) + 1);
  }

  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  summary.push({ tier: tier.id, levels: PACK_SIZE_PER_TIER, min: Math.min(...scores), max: Math.max(...scores), avg: Number(avg.toFixed(1)), labels: Object.fromEntries(labels) });
}

for (let i = 1; i < summary.length; i += 1) {
  assert.ok(summary[i].avg > summary[i - 1].avg, `${summary[i].tier}: ortalama zorluk önceki kademeden yüksek olmalı`);
}

for (const tier of TIERS) {
  for (const ordinal of [1, 30, 60]) {
    const a = createPuzzle(tier.id, ordinal);
    const b = createPuzzle(tier.id, ordinal);
    assert.deepEqual(a.givens, b.givens, `${tier.id}-${ordinal}: deterministik değil`);
    assert.deepEqual(a.constraints, b.constraints, `${tier.id}-${ordinal}: ilişki işaretleri deterministik değil`);
  }
}

console.table(summary.map(({ labels, ...row }) => ({ ...row, labels: JSON.stringify(labels) })));
console.log(`300 bölümlük başlangıç paketi doğrulandı: ${Date.now() - startedAt} ms`);
