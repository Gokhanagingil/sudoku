import { MAX_BACKUP_BYTES, parseBackup, stringifyBackup } from "./backup.js";
import { pauseClock } from "./clock.js";
import { isNative, nativeCall } from "./native.js";
import { defaultSettings, persist, runtime } from "./state.js";

export async function exportBackup() {
  pauseClock(runtime.save.activeGame);
  persist();
  const text = stringifyBackup(runtime.save, runtime.settings);
  const name = `Kus-Koyu-Denge-${new Date().toISOString().slice(0, 10)}.json`;
  if (isNative()) return nativeCall("exportBackup", { text, name });
  const url = URL.createObjectURL(new Blob([text], { type: "application/json" }));
  const a = document.createElement("a"); a.href = url; a.download = name;
  document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 30000);
  return { saved: true };
}
export async function importBackup(file) {
  if (!file || file.size > MAX_BACKUP_BYTES) throw new Error("Lütfen 2 MB’den küçük bir oyun yedeği seç.");
  const restored = parseBackup(await file.text());
  if (!window.confirm(`Bu yedekte ${restored.save.score} puan var. Şimdiki ilerlemenin yerine bu yedek yüklensin mi?`)) return false;
  const previous = { save: runtime.save, settings: runtime.settings };
  runtime.save = restored.save; runtime.settings = { ...defaultSettings, ...restored.settings };
  if (!persist()) { runtime.save = previous.save; runtime.settings = previous.settings; throw new Error("Yedek kaydedilemedi. Cihazında yer açıp tekrar dene."); }
  runtime.storageWarning = ""; runtime.puzzle = null; runtime.screen = "home";
  runtime.settingsOpen = false; runtime.menuOpen = false; runtime.result = null;
  runtime.selectedCell = null; runtime.selectedToken = null; runtime.notesMode = false;
  return true;
}
export function storeRowsMarkup() {
  return `<div class="sheet-label">Kayıt ve gizlilik</div>
    <p class="settings-copy">Hesap gerekmez. İlerlemen bu cihazda saklanır. Telefon değiştirmeden veya oyunu silmeden önce yedek al.</p>
    <button class="sheet-row" data-action="export-backup">İlerlememi yedekle <b aria-hidden="true">›</b></button>
    <button class="sheet-row" data-action="import-backup">Yedekten geri yükle <b aria-hidden="true">›</b></button>
    <input type="file" data-backup-file accept="application/json,.json" hidden>
    <a class="sheet-row" href="./privacy.html">Gizlilik bilgileri <b aria-hidden="true">›</b></a>
    <button class="sheet-row" data-action="privacy-options" hidden>Reklam gizlilik tercihleri <b aria-hidden="true">›</b></button>
    <p class="settings-copy" role="status" data-settings-message></p><p class="settings-copy">Kuş Köyü: Denge · 1.1.0</p>`;
}
