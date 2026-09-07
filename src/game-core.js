import { tierForId } from "./content.js";

export function seededRandom(seed) {
  let value = 2166136261 >>> 0;
  const text = String(seed);
  for (let i = 0; i < text.length; i += 1) {
    value ^= text.charCodeAt(i);
    value = Math.imul(value, 16777619);
  }
  return () => {
    value += 0x6D2B79F5;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(items, random) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function makeRegions(size, regionRows, regionCols) {
  const regions = Array(size * size).fill(0);
  const regionsPerRow = size / regionCols;
  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      const regionRow = Math.floor(row / regionRows);
      const regionCol = Math.floor(col / regionCols);
      regions[row * size + col] = regionRow * regionsPerRow + regionCol;
    }
  }
  return regions;
}

export function makeSolution(size, regionRows, regionCols, seed) {
  const random = seededRandom(seed);
  const base = regionCols;
  const pattern = (row, col) => (base * (row % regionRows) + Math.floor(row / regionRows) + col) % size;
  const rowBands = shuffle(Array.from({ length: size / regionRows }, (_, index) => index), random);
  const rows = rowBands.flatMap((band) => shuffle(Array.from({ length: regionRows }, (_, offset) => band * regionRows + offset), random));
  const colStacks = shuffle(Array.from({ length: size / regionCols }, (_, index) => index), random);
  const cols = colStacks.flatMap((stack) => shuffle(Array.from({ length: regionCols }, (_, offset) => stack * regionCols + offset), random));
  const values = shuffle(Array.from({ length: size }, (_, index) => index + 1), random);
  return rows.flatMap((row) => cols.map((col) => values[pattern(row, col)]));
}

function orthogonalPairs(size) {
  const pairs = [];
  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      const a = row * size + col;
      if (col + 1 < size) pairs.push([a, a + 1]);
      if (row + 1 < size) pairs.push([a, a + size]);
    }
  }
  return pairs;
}

function edgeKey(a, b) {
  return a < b ? `${a}:${b}` : `${b}:${a}`;
}

export function makeConstraints(solution, tier, seed) {
  const random = seededRandom(`${seed}:constraints`);
  const pairs = shuffle(orthogonalPairs(tier.size), random);
  const constraints = [];
  const usedEdges = new Set();
  const plan = tier.constraintPlan || { consecutive: 0, order: 0, sum: 0 };

  const add = (constraint) => {
    const [a, b] = constraint.cells;
    const key = edgeKey(a, b);
    if (usedEdges.has(key)) return false;
    usedEdges.add(key);
    constraints.push(constraint);
    return true;
  };

  let remaining = plan.consecutive || 0;
  if (tier.clueTypes.includes("consecutive") && remaining > 0) {
    for (const [a, b] of pairs) {
      if (remaining <= 0) break;
      if (Math.abs(solution[a] - solution[b]) === 1 && add({ type: "consecutive", cells: [a, b] })) remaining -= 1;
    }
  }

  remaining = plan.order || 0;
  if (tier.clueTypes.includes("order") && remaining > 0) {
    for (const [a, b] of shuffle(pairs, random)) {
      if (remaining <= 0) break;
      if (usedEdges.has(edgeKey(a, b))) continue;
      const direction = solution[a] < solution[b] ? [a, b] : [b, a];
      if (add({ type: "order", cells: direction })) remaining -= 1;
    }
  }

  remaining = plan.sum || 0;
  if (tier.clueTypes.includes("sum") && remaining > 0) {
    for (const [a, b] of shuffle(pairs, random)) {
      if (remaining <= 0) break;
      if (usedEdges.has(edgeKey(a, b))) continue;
      if (add({ type: "sum", cells: [a, b], target: solution[a] + solution[b] })) remaining -= 1;
    }
  }

  return constraints;
}

export function baseCandidatesFor(values, index, puzzle) {
  if (values[index]) return [];
  const { size, regions } = puzzle;
  const row = Math.floor(index / size);
  const col = index % size;
  const region = regions[index];
  const used = new Set();

  for (let i = 0; i < size; i += 1) {
    const rowValue = values[row * size + i];
    const colValue = values[i * size + col];
    if (rowValue) used.add(rowValue);
    if (colValue) used.add(colValue);
  }
  for (let i = 0; i < values.length; i += 1) {
    if (regions[i] === region && values[i]) used.add(values[i]);
  }

  return Array.from({ length: size }, (_, i) => i + 1).filter((value) => !used.has(value));
}

function valuesCompatible(constraint, left, right) {
  if (!left || !right) return true;
  if (constraint.type === "consecutive") return Math.abs(left - right) === 1;
  if (constraint.type === "order") return left < right;
  if (constraint.type === "sum") return left + right === constraint.target;
  return true;
}

function constraintAllowsPartial(constraint, values, index, candidate, puzzle) {
  const [a, b] = constraint.cells;
  const other = index === a ? b : a;
  const ownIsA = index === a;
  const otherValue = values[other];
  if (otherValue) {
    return ownIsA
      ? valuesCompatible(constraint, candidate, otherValue)
      : valuesCompatible(constraint, otherValue, candidate);
  }

  const partnerCandidates = baseCandidatesFor(values, other, puzzle);
  if (!partnerCandidates.length) return false;
  return partnerCandidates.some((partner) => ownIsA
    ? valuesCompatible(constraint, candidate, partner)
    : valuesCompatible(constraint, partner, candidate));
}

export function candidatesFor(values, index, puzzle) {
  const candidates = baseCandidatesFor(values, index, puzzle);
  if (!candidates.length) return [];
  const related = (puzzle.constraints || []).filter((constraint) => constraint.cells.includes(index));
  if (!related.length) return candidates;
  return candidates.filter((candidate) => related.every((constraint) => constraintAllowsPartial(constraint, values, index, candidate, puzzle)));
}

export function isValidBoard(values, puzzle) {
  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];
    if (!value) continue;
    const copy = [...values];
    copy[index] = 0;
    if (!candidatesFor(copy, index, puzzle).includes(value)) return false;
  }
  return true;
}

export function solvePuzzle(puzzle, limit = 2, startingValues = puzzle.givens) {
  const values = [...startingValues];
  let count = 0;
  let firstSolution = null;

  function search() {
    if (count >= limit) return;
    let target = -1;
    let options = null;
    for (let index = 0; index < values.length; index += 1) {
      if (values[index]) continue;
      const candidates = candidatesFor(values, index, puzzle);
      if (candidates.length === 0) return;
      if (!options || candidates.length < options.length) {
        target = index;
        options = candidates;
        if (candidates.length === 1) break;
      }
    }
    if (target === -1) {
      if (!isValidBoard(values, puzzle)) return;
      count += 1;
      if (!firstSolution) firstSolution = [...values];
      return;
    }
    for (const value of options) {
      values[target] = value;
      search();
      values[target] = 0;
      if (count >= limit) return;
    }
  }

  search();
  return { count, solution: firstSolution };
}

function removeValuesUniquely(solution, basePuzzle, targetGivens, seed) {
  const random = seededRandom(`${seed}:remove`);
  const givens = [...solution];
  const order = shuffle(Array.from({ length: solution.length }, (_, index) => index), random);
  let filled = givens.length;

  for (const index of order) {
    if (filled <= targetGivens) break;
    const previous = givens[index];
    givens[index] = 0;
    const check = solvePuzzle({ ...basePuzzle, givens }, 2, givens);
    if (check.count !== 1) givens[index] = previous;
    else filled -= 1;
  }
  return givens;
}

function unitsFor(puzzle) {
  const groups = [];
  const { size, regions } = puzzle;
  for (let row = 0; row < size; row += 1) {
    groups.push({ type: "row", number: row + 1, cells: Array.from({ length: size }, (_, col) => row * size + col) });
  }
  for (let col = 0; col < size; col += 1) {
    groups.push({ type: "column", number: col + 1, cells: Array.from({ length: size }, (_, row) => row * size + col) });
  }
  for (let region = 0; region < size; region += 1) {
    groups.push({ type: "region", number: region + 1, cells: regions.map((value, index) => value === region ? index : -1).filter((index) => index >= 0) });
  }
  return groups;
}

function relationReason(index, value, values, puzzle) {
  const related = (puzzle.constraints || []).filter((constraint) => constraint.cells.includes(index));
  for (const constraint of related) {
    const [a, b] = constraint.cells;
    const other = index === a ? b : a;
    const otherValue = values[other];
    if (!otherValue) continue;
    if (constraint.type === "consecutive") {
      return `Komşuluk noktası nedeniyle bu yuva ${otherValue}'in hemen öncesi ya da sonrası olmalı.`;
    }
    if (constraint.type === "order") {
      const isLower = index === a;
      return `Sıra oku bu yuvanın ${isLower ? "diğer yuvadan küçük" : "diğer yuvadan büyük"} olması gerektiğini söylüyor.`;
    }
    if (constraint.type === "sum") {
      return `Toplam bağı ${constraint.target}; komşu yuvadaki ${otherValue} ile birlikte yalnızca ${value} uyuyor.`;
    }
  }
  return null;
}

export function nextHumanStep(values, puzzle) {
  for (let index = 0; index < values.length; index += 1) {
    if (values[index]) continue;
    const candidates = candidatesFor(values, index, puzzle);
    if (candidates.length === 1) {
      const base = baseCandidatesFor(values, index, puzzle);
      const relation = base.length > 1 ? relationReason(index, candidates[0], values, puzzle) : null;
      return {
        type: relation ? "relation-single" : "single",
        index,
        value: candidates[0],
        candidates,
        reason: relation || "Satır, sütun ve bahçedeki diğer taşlar elendiğinde bu yuvada tek seçenek kalıyor."
      };
    }
  }

  const groups = unitsFor(puzzle);
  for (const group of groups) {
    const placements = new Map();
    for (const index of group.cells) {
      if (values[index]) continue;
      for (const candidate of candidatesFor(values, index, puzzle)) {
        if (!placements.has(candidate)) placements.set(candidate, []);
        placements.get(candidate).push(index);
      }
    }
    for (const [value, cells] of placements.entries()) {
      if (cells.length !== 1) continue;
      const unitName = group.type === "row" ? `${group.number}. yatay yol` : group.type === "column" ? `${group.number}. dikey yol` : `${group.number}. bahçe`;
      return {
        type: "hidden-single",
        index: cells[0],
        value,
        candidates: candidatesFor(values, cells[0], puzzle),
        reason: `${unitName} içinde ${value} sırasındaki taşın gidebileceği başka yuva kalmadı.`
      };
    }
  }

  return null;
}

export function analyzePuzzle(puzzle) {
  const values = [...puzzle.givens];
  let singles = 0;
  let hiddenSingles = 0;
  let relationSingles = 0;
  let safety = values.length * 3;

  while (safety-- > 0) {
    const step = nextHumanStep(values, puzzle);
    if (!step) break;
    if (step.type === "single") singles += 1;
    else if (step.type === "hidden-single") hiddenSingles += 1;
    else relationSingles += 1;
    values[step.index] = step.value;
  }

  const unresolved = values.filter((value) => !value).length;
  const emptyCells = puzzle.givens.filter((value) => !value).length;
  const relationWeight = (puzzle.constraints || []).reduce((total, constraint) => total + (constraint.type === "sum" ? 3 : constraint.type === "order" ? 2 : 1), 0);
  const score = emptyCells + hiddenSingles * 2 + relationSingles * 3 + unresolved * 7 + relationWeight;
  const label = score < 22 ? "Sakin" : score < 48 ? "Düşünceli" : score < 85 ? "Derin" : "Ustalık";

  return {
    singles,
    hiddenSingles,
    relationSingles,
    unresolved,
    solvedByCoreTechniques: unresolved === 0,
    score,
    label
  };
}

function generateCandidate(tier, ordinal, variant) {
  const seed = `${tier.id}-${ordinal}-v${variant}`;
  const regions = makeRegions(tier.size, tier.regionRows, tier.regionCols);
  const solution = makeSolution(tier.size, tier.regionRows, tier.regionCols, seed);
  const constraints = makeConstraints(solution, tier, seed);
  const basePuzzle = {
    id: `${tier.id}-${ordinal}`,
    seed,
    tierId: tier.id,
    ordinal,
    size: tier.size,
    regionRows: tier.regionRows,
    regionCols: tier.regionCols,
    regions,
    constraints,
    givens: Array(tier.size * tier.size).fill(0),
    solution
  };
  const givens = removeValuesUniquely(solution, basePuzzle, tier.targetGivens, seed);
  const puzzle = { ...basePuzzle, givens };
  return { ...puzzle, analysis: analyzePuzzle(puzzle) };
}

export function createPuzzle(tierId, ordinal = 1) {
  const tier = tierForId(tierId);
  const variants = tier.id === "acemi" ? 2 : tier.id === "cirak" ? 3 : tier.id === "deneyimli" ? 5 : tier.id === "usta" ? 4 : 6;
  const candidates = Array.from({ length: variants }, (_, index) => generateCandidate(tier, ordinal, index + 1));
  const explainable = candidates.filter((candidate) => candidate.analysis.solvedByCoreTechniques);
  const pool = explainable.length ? explainable : candidates;
  pool.sort((a, b) => a.analysis.score - b.analysis.score);

  let selected;
  if (tier.id === "acemi" || tier.id === "cirak") selected = pool[0];
  else if (tier.id === "deneyimli") selected = pool[pool.length - 1];
  else if (tier.id === "usta") selected = pool[Math.max(0, pool.length - 2)];
  else selected = pool[pool.length - 1];

  return selected;
}

export function findConflicts(values, puzzle) {
  const conflicts = new Set();
  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];
    if (!value) continue;
    const copy = [...values];
    copy[index] = 0;
    if (!candidatesFor(copy, index, puzzle).includes(value)) conflicts.add(index);
  }
  return conflicts;
}

export function logicalHint(values, puzzle) {
  const wrong = values.findIndex((value, index) => value && !puzzle.givens[index] && value !== puzzle.solution[index]);
  if (wrong >= 0) {
    return {
      type: "review",
      index: wrong,
      value: puzzle.solution[wrong],
      candidates: candidatesFor(values.map((value, index) => index === wrong ? 0 : value), wrong, puzzle),
      reason: "Bu yuvadaki taş ileride dengeyi bozuyor. Satır, sütun, bahçe ve varsa bağlantı işaretlerini yeniden karşılaştır."
    };
  }

  const step = nextHumanStep(values, puzzle);
  if (step) return step;

  const options = values
    .map((value, index) => value ? null : { index, candidates: candidatesFor(values, index, puzzle) })
    .filter(Boolean)
    .filter((item) => item.candidates.length > 0)
    .sort((a, b) => a.candidates.length - b.candidates.length);
  const best = options[0];
  if (!best) return null;
  const names = best.candidates.join(" veya ");
  return {
    type: "chain",
    index: best.index,
    value: puzzle.solution[best.index],
    candidates: best.candidates,
    reason: `Bu yuva en iyi başlangıç noktası. Şu anda ${names} seçenekleri kalıyor; komşu yolları ve ilişki işaretlerini birlikte izlediğinde doğru seçenek tekleşecek.`
  };
}

export function isComplete(values, puzzle) {
  return values.length === puzzle.solution.length && values.every(Boolean) && isValidBoard(values, puzzle);
}

export function progressForScore(score, tiers) {
  let current = tiers[0];
  let next = null;
  for (const tier of tiers) {
    if (score >= tier.unlockScore) current = tier;
    else {
      next = tier;
      break;
    }
  }
  if (!next) return { current, next: null, fraction: 1 };
  const span = next.unlockScore - current.unlockScore;
  return { current, next, fraction: Math.max(0, Math.min(1, (score - current.unlockScore) / span)) };
}
