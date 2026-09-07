import type { Difficulty, DifficultyId } from './types';

export const DIFFICULTIES: Difficulty[] = [
  {
    id: 'acemi',
    title: 'Acemi',
    shortDescription: '4 kuş · geniş yuvalar',
    longDescription: 'Sudoku mantığını sakin adımlarla öğren.',
    minPoints: 0,
    basePoints: 50,
    spec: { size: 4, boxRows: 2, boxColumns: 2 },
    targetClues: 8,
    accent: '#4F7B68',
  },
  {
    id: 'cirak',
    title: 'Çırak',
    shortDescription: '6 kuş · yeni düzen',
    longDescription: 'Satır, sütun ve bahçeyi birlikte takip et.',
    minPoints: 250,
    basePoints: 80,
    spec: { size: 6, boxRows: 2, boxColumns: 3 },
    targetClues: 18,
    accent: '#2E7D86',
  },
  {
    id: 'deneyimli',
    title: 'Deneyimli',
    shortDescription: '6 kuş · daha az ipucu',
    longDescription: 'Olasılıkları not ederek birkaç adım sonrasını gör.',
    minPoints: 800,
    basePoints: 120,
    spec: { size: 6, boxRows: 2, boxColumns: 3 },
    targetClues: 13,
    accent: '#4E6692',
  },
  {
    id: 'usta',
    title: 'Usta',
    shortDescription: '9 kuş · klasik köy',
    longDescription: 'Klasik 9×9 düzende güçlü bir meydan okuma.',
    minPoints: 1800,
    basePoints: 170,
    spec: { size: 9, boxRows: 3, boxColumns: 3 },
    targetClues: 38,
    accent: '#8A5D82',
  },
  {
    id: 'pro',
    title: 'Pro',
    shortDescription: '9 kuş · ileri mantık',
    longDescription: 'Az başlangıç kuşuyla derin mantık zincirleri kur.',
    minPoints: 3600,
    basePoints: 240,
    spec: { size: 9, boxRows: 3, boxColumns: 3 },
    targetClues: 29,
    accent: '#A65D43',
  },
];

export const DIFFICULTY_BY_ID = Object.fromEntries(
  DIFFICULTIES.map((difficulty) => [difficulty.id, difficulty]),
) as Record<DifficultyId, Difficulty>;

export function getPlayerDifficulty(points: number): Difficulty {
  return [...DIFFICULTIES].reverse().find((item) => points >= item.minPoints) ?? DIFFICULTIES[0]!;
}

export function getNextDifficulty(points: number): Difficulty | null {
  return DIFFICULTIES.find((item) => item.minPoints > points) ?? null;
}

export function isDifficultyUnlocked(id: DifficultyId, points: number): boolean {
  return points >= DIFFICULTY_BY_ID[id].minPoints;
}
