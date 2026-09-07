import { findConflicts } from "./game-core.js";
import { runtime } from "./state.js";
import { currentTutorial, ruleIntroForCurrentTier } from "./tutorial.js";
import { gameMenuMarkup, settingsMarkup } from "./modals.js";
import { esc, icon, shellClasses, tokenMarkup, tokenName } from "./ui.js";

function constraintLegend(puzzle) {
  if (!puzzle.constraints.length) return `<div class="rule-chip"><span>✓</span> Yatay, dikey ve bahçede her taş bir kez</div>`;
  const types = new Set(puzzle.constraints.map((item) => item.type));
  const chips = [`<div class="rule-chip"><span>✓</span> Yatay, dikey ve bahçede her taş bir kez</div>`];
  if (types.has("consecutive")) chips.push(`<div class="rule-chip"><span>●</span> Noktalı ikili ardışık</div>`);
  if (types.has("order")) chips.push(`<div class="rule-chip"><span>→</span> Ok yönünde değer artar</div>`);
  if (types.has("sum")) chips.push(`<div class="rule-chip"><span>Σ</span> Bağdaki sayı toplamdır</div>`);
  return chips.join("");
}

function cellBorders(index, puzzle) {
  const row = Math.floor(index / puzzle.size), col = index % puzzle.size, region = puzzle.regions[index];
  const top = row === 0 || puzzle.regions[index - puzzle.size] !== region;
  const bottom = row === puzzle.size - 1 || puzzle.regions[index + puzzle.size] !== region;
  const left = col === 0 || puzzle.regions[index - 1] !== region;
  const right = col === puzzle.size - 1 || puzzle.regions[index + 1] !== region;
  return `${top ? "region-top" : ""} ${bottom ? "region-bottom" : ""} ${left ? "region-left" : ""} ${right ? "region-right" : ""}`;
}

function isPeer(a, b, puzzle) {
  if (a === b) return false;
  return Math.floor(a / puzzle.size) === Math.floor(b / puzzle.size) || a % puzzle.size === b % puzzle.size || puzzle.regions[a] === puzzle.regions[b];
}

function notesMarkup(notes, size) {
  if (!notes?.length) return "";
  return `<span class="notes-grid" style="--note-cols:${Math.ceil(Math.sqrt(size))}">${Array.from({ length: size }, (_, index) => `<i>${notes.includes(index + 1) ? (runtime.save.theme === "shapes" ? ["●","▲","■","◆","★","⬟","✚","⬢","☾"][index] : index + 1) : ""}</i>`).join("")}</span>`;
}

function cellAria(index, value, given, puzzle) {
  return `${Math.floor(index / puzzle.size) + 1}. yatay yol, ${index % puzzle.size + 1}. dikey yol, ${value ? `${tokenName(value)}${given ? ", başlangıç taşı" : ""}` : "boş yuva"}`;
}

function tutorialTargetCell(index) {
  const t = currentTutorial();
  return Boolean(t && ((t.lesson === 1 && t.stage === 0 && t.targetCell === index) || (t.lesson === 2 && t.stage === 1 && t.targetCell === index)));
}

function tutorialTargetToken(value) {
  const t = currentTutorial();
  return Boolean(t && ((t.lesson === 1 && t.stage === 1 && t.targetValue === value) || (t.lesson === 2 && t.stage === 2 && t.noteValue === value)));
}

function constraintOverlays(puzzle) {
  return puzzle.constraints.map((constraint, index) => {
    const [a,b] = constraint.cells, ar = Math.floor(a / puzzle.size), ac = a % puzzle.size, br = Math.floor(b / puzzle.size), bc = b % puzzle.size;
    const x = ((ac + bc + 1) / 2) * (100 / puzzle.size), y = ((ar + br + 1) / 2) * (100 / puzzle.size);
    let text = "●", cls = "consecutive", rotation = 0;
    if (constraint.type === "order") { text = "➜"; cls = "order"; if (br > ar) rotation = 90; else if (br < ar) rotation = -90; else if (bc < ac) rotation = 180; }
    if (constraint.type === "sum") { text = constraint.target; cls = "sum"; }
    return `<span class="constraint-mark ${cls}" style="left:${x}%;top:${y}%;--rotation:${rotation}deg" aria-hidden="true" data-constraint="${index}">${text}</span>`;
  }).join("");
}

function boardMarkup() {
  const { puzzle, save, settings, selectedCell, hintFocus } = runtime;
  const game = save.activeGame, conflicts = findConflicts(game.values, puzzle);
  return `<div class="board-wrap size-${puzzle.size}"><div class="board" style="--size:${puzzle.size}">${game.values.map((value,index) => { const given = Boolean(puzzle.givens[index]); const wrong = settings.showMistakes && value && value !== puzzle.solution[index]; const selected = selectedCell === index; const same = value && selectedCell !== null && value === game.values[selectedCell]; const peer = selectedCell !== null && isPeer(index, selectedCell, puzzle); const hint = hintFocus?.index === index; return `<button class="cell ${cellBorders(index,puzzle)} ${given ? "given" : ""} ${selected ? "selected" : ""} ${same ? "same" : ""} ${peer ? "peer" : ""} ${conflicts.has(index) || wrong ? "conflict" : ""} ${hint ? "hint-focus" : ""} ${tutorialTargetCell(index) ? "tutorial-target" : ""}" data-cell="${index}" aria-label="${cellAria(index,value,given,puzzle)}"><span class="nest-ring"></span>${value ? tokenMarkup(value,true) : notesMarkup(game.notes[index],puzzle.size)}</button>`; }).join("")}${constraintOverlays(puzzle)}</div></div>`;
}

function tutorialCard() {
  const t = currentTutorial();
  if (!t) return "";
  let title = "", copy = "", step = "1";
  if (t.lesson === 1) {
    step = t.stage >= 2 ? "✓" : String(t.stage + 1);
    if (t.stage === 0) { title = "Parlayan boş yuvaya dokun."; copy = "Önce nereye yerleştireceğini seç."; }
    else if (t.stage === 1) { title = `${tokenName(t.targetValue)} taşını seç.`; copy = "Diğer taşlar elenince bu yuvada tek seçenek kalıyor."; }
    else { title = "İlk çıkarım tamam."; copy = "Şimdi aynı mantıkla devam edebilirsin."; }
  } else {
    step = t.stage >= 3 ? "✓" : String(t.stage + 1);
    if (t.stage === 0) { title = "Emin değilken Not'u aç."; copy = "Notlar cevap değildir; küçük aday işaretleridir."; }
    else if (t.stage === 1) { title = "Parlayan boş yuvayı seç."; copy = "Bu yuvada birden fazla olasılık var."; }
    else if (t.stage === 2) { title = `${tokenName(t.noteValue)} adayını ekle.`; copy = "Taş küçük görünür; daha sonra silebilirsin."; }
    else { title = "Not kullanmayı öğrendin."; copy = "Not modu açıkken taşlar küçük aday olarak kalır."; }
  }
  const done = t.stage >= (t.lesson === 1 ? 2 : 3);
  return `<div class="coach-card"><span>${step}</span><div><strong>${title}</strong><p>${copy}</p></div><button data-action="${done ? "finish-tutorial" : "skip-tutorial"}">${done ? "Devam" : "Geç"}</button></div>`;
}

function ruleIntroCard() {
  const intro = ruleIntroForCurrentTier();
  return intro ? `<div class="coach-card rule-intro-card"><span>${intro[0]}</span><div><strong>${intro[1]}</strong><p>${intro[2]}</p></div><button data-action="finish-rule-intro">Anladım</button></div>` : "";
}

export function gameMarkup(elapsedText) {
  const { save, settings, puzzle, selectedCell, selectedToken, notesMode, hintFocus } = runtime;
  const remaining = save.activeGame.values.filter((value) => !value).length;
  const selectedHasContent = selectedCell !== null && !puzzle.givens[selectedCell] && (save.activeGame.values[selectedCell] || save.activeGame.notes[selectedCell]?.length);
  const tierName = {acemi:"Acemi",cirak:"Çırak",deneyimli:"Deneyimli",usta:"Usta",pro:"Pro"}[save.activeGame.tierId];
  return `<main class="${shellClasses("game-screen")}"><header class="game-header"><button class="round-button small" data-action="home" aria-label="Köye dön">${icon("back")}</button><div class="game-heading"><p>${esc(tierName)} • Bahçe ${save.activeGame.ordinal}</p><strong>${remaining ? `${remaining} yuva kaldı` : "Tamamlandı"}</strong></div><button class="round-button small" data-action="menu" aria-label="Oyun menüsü">${icon("more")}</button></header><section class="game-body"><div class="game-status-row"><div class="status-pill"><span>Ustalık</span><b>${save.score}</b></div>${settings.showTimer ? `<div class="status-pill"><span>Süre</span><b data-timer>${elapsedText}</b></div>` : ""}<div class="status-pill"><span>Mantık</span><b>${esc(puzzle.analysis.label)}</b></div></div>${tutorialCard()}${ruleIntroCard()}<div class="rule-strip">${constraintLegend(puzzle)}</div>${boardMarkup()}<div class="token-tray" style="--token-count:${puzzle.size}">${Array.from({length:puzzle.size},(_,i)=>i+1).map((value)=>{ const completeCount=save.activeGame.values.filter((item)=>item===value).length; const finished=completeCount>=puzzle.size; const selected=selectedToken===value || (hintFocus?.type!=="review" && hintFocus?.value===value); return `<button class="tray-token ${selected?"selected":""} ${finished?"finished":""} ${tutorialTargetToken(value)?"tutorial-target":""}" data-token="${value}" ${finished?"disabled":""} aria-label="${tokenName(value)}">${tokenMarkup(value)}</button>`; }).join("")}</div><div class="tool-row"><button class="tool-button ${notesMode?"active":""} ${currentTutorial()?.lesson===2 && currentTutorial()?.stage===0?"tutorial-target":""}" data-action="note">${icon("note")}<span>Not</span><small>${notesMode?"Açık":"Kapalı"}</small></button><button class="tool-button" data-action="undo" ${save.activeGame.history.length?"":"disabled"}>${icon("undo")}<span>Geri al</span><small>${save.activeGame.history.length?"Hazır":"—"}</small></button><button class="tool-button" data-action="erase" ${selectedHasContent?"":"disabled"}>${icon("erase")}<span>Temizle</span><small>Yuva</small></button><button class="tool-button" data-action="hint">${icon("hint")}<span>İpucu</span><small>Ceza yok</small></button></div></section>${runtime.menuOpen ? gameMenuMarkup() : ""}${runtime.settingsOpen ? settingsMarkup() : ""}<div id="toast" class="toast" role="status" aria-live="polite"></div></main>`;
}
