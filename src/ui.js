import { BIRDS, GEOMETRIC, VILLAGE_MILESTONES } from "./content.js";
import { runtime } from "./state.js";

export function esc(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char]));
}

export function icon(name) {
  const icons = {
    back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    settings: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M19 13.5v-3l-2-.7a6 6 0 0 0-.7-1.7l.9-1.9-2.1-2.1-1.9.9a6 6 0 0 0-1.7-.7L10.5 2h-3l-.7 2a6 6 0 0 0-1.7.7l-1.9-.9L1.1 6l.9 1.9a6 6 0 0 0-.7 1.7L0 10.5v3l2 .7a6 6 0 0 0 .7 1.7l-.9 1.9L4 19.9l1.9-.9a6 6 0 0 0 1.7.7l.7 2h3l.7-2a6 6 0 0 0 1.7-.7l1.9.9 2.1-2.1-.9-1.9a6 6 0 0 0 .7-1.7Z" transform="translate(2 0) scale(.83)" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
    undo: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 7 5 11l4 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M5 11h8a5 5 0 0 1 5 5v1" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    erase: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 15 8-10 8 7-7 8H8Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M13 20h8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    hint: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18h6M10 22h4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M8.5 15.5C7.6 14.6 7 13.1 7 11.5a5 5 0 0 1 10 0c0 1.6-.6 3.1-1.5 4-.6.6-1 1.2-1.2 2h-4.6c-.2-.8-.6-1.4-1.2-2Z" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
    note: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h14v16H5z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 9h8M8 13h5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    more: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="19" cy="12" r="1.8"/></svg>',
    close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };
  return icons[name] || "";
}

function birdMark(bird) {
  if (bird.mark === "dots") return `<circle cx="39" cy="43" r="2.4" fill="${bird.chest}"/><circle cx="34" cy="49" r="1.9" fill="${bird.chest}"/>`;
  if (bird.mark === "bib") return `<path d="M43 34c8 2 11 7 9 15-5 2-10 1-14-4 0-5 2-9 5-11Z" fill="${bird.wing}" opacity=".72"/>`;
  if (bird.mark === "stripe") return `<path d="M25 44c6 4 12 5 18 2" fill="none" stroke="${bird.chest}" stroke-width="3.4" stroke-linecap="round"/>`;
  if (bird.mark === "crest") return `<path d="M43 13c1-8 5-12 10-14-1 6 1 10 5 14" fill="${bird.wing}"/>`;
  if (bird.mark === "mask") return `<path d="M47 18c7-2 12 0 16 4-4 5-10 6-16 3Z" fill="${bird.wing}"/>`;
  return "";
}

export function birdSvg(index, compact = false) {
  const bird = BIRDS[index % BIRDS.length];
  const label = runtime.settings.numberSupport ? `<span class="token-rank">${index + 1}</span>` : "";
  return `<span class="bird-token ${compact ? "compact" : ""}" aria-label="${esc(bird.name)}">${label}<svg viewBox="0 0 80 76" aria-hidden="true">
    <ellipse cx="37" cy="64" rx="25" ry="4" fill="rgba(27,59,40,.12)"/><path d="m24 53-12 9 15-2Z" fill="${bird.wing}"/>
    <ellipse cx="38" cy="44" rx="22" ry="24" transform="rotate(-8 38 44)" fill="${bird.body}"/><ellipse cx="43" cy="48" rx="14" ry="17" fill="${bird.chest}"/>
    <path d="M24 40c-7 7-6 19 3 23 8-5 11-13 11-23-5-3-9-3-14 0Z" fill="${bird.wing}"/>${birdMark(bird)}
    <circle cx="50" cy="24" r="14" fill="${bird.body}"/><path d="m62 25 12 5-12 4Z" fill="${bird.accent}"/>
    <circle cx="54" cy="21" r="3" fill="#fff"/><circle cx="55" cy="21" r="1.6" fill="#22372d"/><path d="M47 12c2-4 5-6 9-7-1 4-1 6 0 9" fill="${bird.wing}"/>
  </svg></span>`;
}

export function tokenMarkup(value, compact = false) {
  if (!value) return "";
  if (runtime.save.theme === "numbers") return `<span class="number-token">${value}</span>`;
  if (runtime.save.theme === "shapes") return `<span class="shape-token">${esc(GEOMETRIC[value - 1])}<span class="token-rank">${value}</span></span>`;
  return birdSvg(value - 1, compact);
}

export function tokenName(value) {
  if (runtime.save.theme === "birds") return `${BIRDS[value - 1].name}, ${value}`;
  if (runtime.save.theme === "shapes") return `${GEOMETRIC[value - 1]}, ${value}`;
  return String(value);
}

export function themeLabel(theme) {
  return theme === "birds" ? "Kuşlar" : theme === "shapes" ? "Şekiller" : "Klasik";
}

export function villageStageForScore(score) {
  let stage = 0;
  VILLAGE_MILESTONES.forEach((milestone, index) => { if (score >= milestone.score) stage = index; });
  return stage;
}

export function shellClasses(type) {
  const settings = runtime.settings;
  return `app-shell ${type} ${settings.largeText ? "large-text" : ""} ${settings.highContrast ? "high-contrast" : ""} ${settings.reduceMotion ? "reduce-motion" : ""}`;
}
