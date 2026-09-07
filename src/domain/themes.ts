import { getBird } from './birds';
import type { ThemeId } from './types';

export interface VisualTheme {
  id: ThemeId;
  title: string;
  description: string;
}

export const VISUAL_THEMES: VisualTheme[] = [
  { id: 'birds', title: 'Kuşlar', description: 'Sıcak ve canlı Kuş Köyü görünümü' },
  { id: 'shapes', title: 'Geometrik', description: 'Birbirinden kolay ayrılan şekiller' },
  { id: 'classic', title: 'Klasik', description: 'Büyük ve yüksek kontrastlı sayılar' },
];

const SHAPE_NAMES = ['Daire', 'Üçgen', 'Kare', 'Baklava', 'Beşgen', 'Altıgen', 'Yıldız', 'Artı', 'Halka'];

export function getTokenName(value: number, theme: ThemeId): string {
  if (theme === 'birds') return getBird(value).name;
  if (theme === 'shapes') return SHAPE_NAMES[value - 1] ?? `${value}. şekil`;
  return `${value} sayısı`;
}
