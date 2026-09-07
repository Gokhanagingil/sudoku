export interface BirdDefinition {
  value: number;
  name: string;
  shortName: string;
  body: string;
  chest: string;
  wing: string;
  accent: string;
  mark: 'dots' | 'bib' | 'mask' | 'stripe';
}

export const BIRDS: BirdDefinition[] = [
  { value: 1, name: 'Maviş', shortName: 'Maviş', body: '#68a9cf', chest: '#d9f1ef', wing: '#3678a2', accent: '#f0b44d', mark: 'dots' },
  { value: 2, name: 'Nar Bülbülü', shortName: 'Nar', body: '#cf6656', chest: '#f4c8a2', wing: '#9e463d', accent: '#e9a13e', mark: 'bib' },
  { value: 3, name: 'Limon İspinozu', shortName: 'Limon', body: '#e8c94b', chest: '#fff1a9', wing: '#91833a', accent: '#d68f38', mark: 'stripe' },
  { value: 4, name: 'Leylak Kuşu', shortName: 'Leylak', body: '#9878bd', chest: '#eadff2', wing: '#65508f', accent: '#e2a654', mark: 'dots' },
  { value: 5, name: 'Zeytin Baştankarası', shortName: 'Zeytin', body: '#718d55', chest: '#dbe3ad', wing: '#465f39', accent: '#d68f38', mark: 'bib' },
  { value: 6, name: 'Mercan Kuşu', shortName: 'Mercan', body: '#e17f78', chest: '#ffe0d0', wing: '#b45661', accent: '#efb342', mark: 'stripe' },
  { value: 7, name: 'Gece Sakası', shortName: 'Gece', body: '#536778', chest: '#d9e0df', wing: '#283d4e', accent: '#e1a442', mark: 'mask' },
  { value: 8, name: 'Turkuaz Ardıç', shortName: 'Turkuaz', body: '#4aa9a0', chest: '#caece4', wing: '#24736f', accent: '#e49c45', mark: 'dots' },
  { value: 9, name: 'Gül Sığırcığı', shortName: 'Gül', body: '#c77e9e', chest: '#f4d5e1', wing: '#8d4f71', accent: '#e2a348', mark: 'mask' },
];

export function getBird(value: number): BirdDefinition {
  return BIRDS[value - 1] ?? BIRDS[0]!;
}
