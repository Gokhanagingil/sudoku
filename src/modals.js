import { storeRowsMarkup } from "./store-tools.js";
import { tierForId } from "./content.js";
import { runtime } from "./state.js";
import { birdSvg, icon } from "./ui.js";

export function settingsMarkup() {
  const rows = [["largeText","Büyük yazı ve düğmeler","60+ kullanım için önerilir"],["numberSupport","Kuşlarda sayı desteği","Benzer kuşları ayırt etmeyi kolaylaştırır"],["highContrast","Yüksek kontrast","Sınırları ve metni belirginleştirir"],["showMistakes","Nazik hata kontrolü","Yanlış taşları ceza vermeden sarı çerçeveyle gösterir"],["showTimer","Süreyi göster","Yalnızca bilgi amaçlıdır; puanı etkilemez"],["sound","Nazik sesler","Yerleştirme ve tamamlamada kısa geri bildirim verir"],["haptics","Titreşim","Desteklenen cihazlarda dokunmayı hissettirir"],["reduceMotion","Hareketi azalt","Geçiş ve kutlama hareketlerini azaltır"],["keepAwake","Oynarken ekranı açık tut","Desteklenen cihazlarda ekranın uyumasını önler"]];
  return `<div class="modal-layer" data-action="close-settings"><div class="sheet settings-sheet" role="dialog" aria-modal="true" aria-labelledby="settings-title" onclick="event.stopPropagation()"><div class="sheet-handle"></div><div class="sheet-head"><div><p class="eyebrow">ERİŞİLEBİLİRLİK</p><h2 id="settings-title">Ayarlar</h2></div><button class="round-button small" data-action="close-settings" aria-label="Ayarları kapat">${icon("close")}</button></div><div class="settings-list">${rows.map(([key,title,copy]) => `<label class="setting-row"><span><strong>${title}</strong><small>${copy}</small></span><input type="checkbox" data-setting="${key}" ${runtime.settings[key] ? "checked" : ""}><i aria-hidden="true"></i></label>`).join("")}</div>${storeRowsMarkup()}</div></div>`;
}

export function gameMenuMarkup() {
  return `<div class="modal-layer" data-action="close-menu"><div class="sheet" role="dialog" aria-modal="true" aria-label="Oyun menüsü" onclick="event.stopPropagation()"><div class="sheet-handle"></div><div class="sheet-head"><div><p class="eyebrow">OYUN MENÜSÜ</p><h2>Bahçe seçenekleri</h2></div><button class="round-button small" data-action="close-menu" aria-label="Menüyü kapat">${icon("close")}</button></div><button class="sheet-row" data-action="settings"><span>Ayarlar ve erişilebilirlik</span><b>›</b></button><div class="sheet-label">Tema</div><div class="theme-switcher compact">${[["birds","Kuşlar",birdSvg(0,true)],["shapes","Şekiller",'<span class="theme-symbol">◆</span>'],["numbers","Klasik",'<span class="theme-symbol">4</span>']].map(([id,label,preview]) => `<button class="theme-option ${runtime.save.theme===id?"selected":""}" data-theme="${id}"><span>${preview}</span><strong>${label}</strong></button>`).join("")}</div><button class="danger-row" data-action="restart">Bu bahçeyi yeniden başlat</button></div></div>`;
}

export function resultMarkup() {
  const result = runtime.result;
  const tier = tierForId(result.tierId);
  return `<div class="modal-layer result-layer"><div class="result-card" role="dialog" aria-modal="true" aria-labelledby="result-title"><div class="result-bird">${birdSvg((result.ordinal + 2) % 9)}</div><p class="eyebrow">BAHÇE TAMAMLANDI</p><h2 id="result-title">Eline sağlık.</h2><p>${tier.name} • Bahçe ${result.ordinal} çözüldü.</p><div class="reward-row"><div><span>Ustalık puanı</span><strong>+${result.reward}</strong></div>${runtime.settings.showTimer ? `<div><span>Süre</span><strong>${result.timeText}</strong></div>` : ""}</div>${result.unlockedNewTier ? `<div class="unlock-banner"><strong>${result.unlockedNewTier.name} açıldı</strong><span>${result.unlockedNewTier.description}</span></div>` : ""}<button class="primary-cta compact" data-action="next-puzzle"><span>${result.unlockedNewTier ? `${result.unlockedNewTier.name}'a geç` : "Sonraki bahçe"}</span><small>Hazırsan devam et</small></button><button class="text-button" data-action="home">Köye dön</button></div></div>`;
}

export function resultShellMarkup() {
  const tier = tierForId(runtime.result.tierId);
  const classes = `app-shell game-screen ${runtime.settings.largeText ? "large-text" : ""} ${runtime.settings.highContrast ? "high-contrast" : ""} ${runtime.settings.reduceMotion ? "reduce-motion" : ""}`;
  return `<main class="${classes}"><header class="game-header"><button class="round-button small" data-action="home" aria-label="Köye dön">${icon("back")}</button><div class="game-heading"><p>${tier.name}</p><strong>Bahçe tamamlandı</strong></div><span></span></header><section class="result-backdrop-scene"><div class="village-scene mini"><div class="sun"></div><div class="hill hill-a"></div><div class="house house-a"><i></i></div>${birdSvg((runtime.result.ordinal + 1) % 9)}</div></section>${resultMarkup()}</main>`;
}
