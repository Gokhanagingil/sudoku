import { continueGame, elapsedSeconds, eraseSelected, finishRuleIntro, finishTutorialCard, formatTime, goHome, restartGame, selectCell, selectToken, setActionHooks, setTheme, showHint, skipTutorial, startGame, toggleNotesMode, undo } from "./actions.js";
import { focusKey, restoreFocus, trapDialogTab } from "./accessibility.js";
import { pauseClock, resumeClock } from "./clock.js";
import { releaseWakeLock, requestWakeLock, softFeedback } from "./feedback.js";
import { gameMarkup } from "./game-view.js";
import { homeMarkup } from "./home-view.js";
import { resultShellMarkup } from "./modals.js";
import { isNative, nativeCall, syncNativeContext } from "./native.js";
import { exportBackup, importBackup } from "./store-tools.js";
import { persist, runtime } from "./state.js";
import { esc } from "./ui.js";

const app = document.querySelector("#app");
let toastTimer = null, tickTimer = null, returnFocus = null;
function showToast(message, duration = 3500) {
  const toast = document.querySelector("#toast");
  if (!toast) return;
  clearTimeout(toastTimer); toast.textContent = message; toast.classList.add("show");
  toastTimer = setTimeout(() => toast.classList.remove("show"), duration);
}
function stopTimerTick() { clearInterval(tickTimer); tickTimer = null; }
function startTimerTick() {
  stopTimerTick();
  if (!runtime.settings.showTimer || !runtime.save.activeGame) return;
  tickTimer = setInterval(() => {
    const timer = app.querySelector("[data-timer]");
    if (timer) timer.textContent = formatTime(elapsedSeconds());
  }, 1000);
}
function activePlay() { return runtime.screen === "game" && !runtime.settingsOpen && !runtime.menuOpen && document.visibilityState !== "hidden"; }
function syncClock() {
  if (activePlay()) { resumeClock(runtime.save.activeGame); requestWakeLock(); }
  else { pauseClock(runtime.save.activeGame); releaseWakeLock(); }
}
function replaceMarkup(markup) {
  const key = focusKey(document.activeElement);
  const scroll = app.querySelector(".sheet")?.scrollTop || 0;
  app.innerHTML = markup;
  if (runtime.storageWarning) app.querySelector("main")?.insertAdjacentHTML("afterbegin", `<div class="storage-notice" role="status">${esc(runtime.storageWarning)}</div>`);
  syncClock(); bindCommon();
  restoreFocus(app, returnFocus || key); returnFocus = null;
  const sheet = app.querySelector(".sheet"); if (sheet) sheet.scrollTop = scroll;
  updatePrivacyEntry();
}
function updatePrivacyEntry() {
  syncNativeContext(runtime).then(status => {
    const button = app.querySelector('[data-action="privacy-options"]');
    if (button) button.hidden = !status.privacyRequired;
  });
}
function on(action, callback) { app.querySelectorAll(`[data-action="${action}"]`).forEach(el => el.addEventListener("click", callback)); }
function closeSettings() { runtime.settingsOpen = false; returnFocus = '[data-action="settings"]'; render(); }
function closeMenu() { runtime.menuOpen = false; returnFocus = '[data-action="menu"]'; render(); }
function bindCommon() {
  on("settings", () => { runtime.menuOpen = false; runtime.settingsOpen = true; render(); });
  on("close-settings", event => { if (event.currentTarget === event.target || !event.currentTarget.classList.contains("modal-layer")) closeSettings(); });
  on("home", goHome);
  on("menu", () => { runtime.menuOpen = true; render(); });
  on("close-menu", closeMenu);
  on("start", () => startGame()); on("continue", continueGame); on("restart", restartGame);
  on("next-puzzle", () => {
    const next = runtime.result.unlockedNewTier || { id: runtime.result.tierId };
    runtime.result = null; runtime.save.selectedTier = next.id; persist(); startGame(next.id);
  });
  app.querySelectorAll("[data-theme]").forEach(button => button.addEventListener("click", () => setTheme(button.dataset.theme)));
  app.querySelectorAll("[data-setting]").forEach(input => input.addEventListener("change", () => {
    runtime.settings[input.dataset.setting] = input.checked; persist(); softFeedback("select"); render();
  }));
  const message = text => { const node = app.querySelector("[data-settings-message]"); if (node) node.textContent = text; };
  on("export-backup", async () => {
    try { const result = await exportBackup(); message(result.saved ? "Yedek dosyan hazır. Güvenli bir yerde sakla." : "Yedekleme iptal edildi."); }
    catch { message("Yedek kaydedilemedi. Tekrar dene; mevcut ilerlemen değiştirilmedi."); }
  });
  on("import-backup", () => app.querySelector("[data-backup-file]")?.click());
  app.querySelector("[data-backup-file]")?.addEventListener("change", async event => {
    const file = event.target.files?.[0]; if (!file) return;
    try { if (await importBackup(file)) render(); } catch (error) { message(error.message); }
    event.target.value = "";
  });
  on("privacy-options", async () => {
    try { const status = await nativeCall("privacyOptions"); if (status.error) message("Tercihler şu anda açılamadı. Daha sonra tekrar dene."); }
    catch { message("Tercihler şu anda açılamadı. Oynamaya devam edebilirsin."); }
  });
}
export function renderHome() {
  runtime.screen = "home"; stopTimerTick(); replaceMarkup(homeMarkup());
  app.querySelectorAll("[data-tier]").forEach(button => button.addEventListener("click", () => {
    runtime.save.selectedTier = button.dataset.tier; persist(); softFeedback("select"); renderHome();
  }));
}
export function renderGame() {
  if (!runtime.save.activeGame) return renderHome();
  runtime.screen = "game"; replaceMarkup(gameMarkup(formatTime(elapsedSeconds())));
  app.querySelectorAll("[data-cell]").forEach(cell => cell.addEventListener("click", () => selectCell(Number(cell.dataset.cell))));
  app.querySelectorAll("[data-token]").forEach(token => token.addEventListener("click", () => selectToken(Number(token.dataset.token))));
  on("note", toggleNotesMode); on("undo", undo); on("erase", eraseSelected); on("hint", showHint);
  on("skip-tutorial", skipTutorial); on("finish-tutorial", finishTutorialCard); on("finish-rule-intro", finishRuleIntro);
  startTimerTick();
}
export function renderResult() { runtime.screen = "result"; stopTimerTick(); replaceMarkup(resultShellMarkup()); }
function render() {
  if (runtime.screen === "result" && runtime.result) renderResult();
  else if (runtime.screen === "game" && runtime.save.activeGame) renderGame();
  else renderHome();
}
function back() {
  if (runtime.settingsOpen) closeSettings();
  else if (runtime.menuOpen) closeMenu();
  else if (runtime.screen !== "home") goHome();
  else nativeCall("background").catch(() => {});
}
setActionHooks({ render, renderHome, renderGame, renderResult, toast: showToast, stopTimer: stopTimerTick });
window.addEventListener("denge-back", back);
window.addEventListener("denge-privacy", updatePrivacyEntry);
document.addEventListener("keydown", event => {
  if (event.key === "Escape") { event.preventDefault(); back(); return; }
  if (trapDialogTab(event, app) || !activePlay() || !runtime.puzzle) return;
  const cell = document.activeElement?.dataset?.cell;
  const offsets = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -runtime.puzzle.size, ArrowDown: runtime.puzzle.size };
  if (cell !== undefined && offsets[event.key] !== undefined) {
    event.preventDefault();
    const next = Math.max(0, Math.min(runtime.puzzle.size ** 2 - 1, Number(cell) + offsets[event.key]));
    app.querySelector(`[data-cell="${next}"]`)?.focus({ preventScroll: true });
  }
});
document.addEventListener("visibilitychange", () => { syncClock(); persist(); syncNativeContext(runtime); });
window.addEventListener("pagehide", () => { pauseClock(runtime.save.activeGame); persist(); releaseWakeLock(); nativeCall("setContext", { home:false, keepAwake:false }).catch(() => {}); });
window.addEventListener("pageshow", () => { syncClock(); syncNativeContext(runtime); });
if ("serviceWorker" in navigator && !isNative() && location.protocol !== "file:") {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
} else if (isNative() && "serviceWorker" in navigator) {
  // Native assets are already offline; avoid retaining an obsolete web cache across APK updates.
  navigator.serviceWorker.getRegistrations().then(items => items.forEach(item => item.unregister())).catch(() => {});
}
render();
