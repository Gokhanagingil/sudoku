// Shape ids retain the exact 1–9 mapping used by the original theme and notes.
export const SHAPE_NAMES = ["Daire", "Üçgen", "Kare", "Baklava", "Yıldız", "Beşgen", "Artı", "Altıgen", "Hilal"];
const paths = [
  '<circle cx="50" cy="50" r="39"/>',
  '<path d="M50 9 94 87H6Z"/>',
  '<rect x="12" y="12" width="76" height="76" rx="3"/>',
  '<path d="M50 5 95 50 50 95 5 50Z"/>',
  '<path d="m50 5 13 29 32 4-24 23 6 33-27-16-27 16 6-33L5 38l32-4Z"/>',
  '<path d="M50 6 94 39 77 91H23L6 39Z"/>',
  '<path d="M36 7h28v29h29v28H64v29H36V64H7V36h29Z"/>',
  '<path d="M27 10h46l23 40-23 40H27L4 50Z"/>',
  '<path d="M65 8A42 42 0 1 0 89 74 36 36 0 0 1 65 8Z"/>'
];
export function shapeSvg(value, note = false) {
  if (!Number.isInteger(value) || value < 1 || value > 9) return "";
  return `<svg class="shape-art${note ? " note-art" : ""}" viewBox="0 0 100 100" aria-hidden="true" focusable="false">${paths[value - 1]}</svg>`;
}
