import { TIERS, tierForId, unlockedTier, villageMilestone } from "./content.js";
import { runtime } from "./state.js";
import { settingsMarkup } from "./modals.js";
import { birdSvg, esc, icon, shellClasses, villageStageForScore } from "./ui.js";

export function homeMarkup() {
  const { save, settings } = runtime;
  const unlocked = unlockedTier(save.score);
  const nextLocked = TIERS.find((tier) => save.score < tier.unlockScore);
  const progress = nextLocked ? Math.max(0, Math.min(1, (save.score - unlocked.unlockScore) / (nextLocked.unlockScore - unlocked.unlockScore))) : 1;
  const villageStage = villageStageForScore(save.score);
  const milestone = villageMilestone(save.score);
  const activeTier = save.activeGame ? tierForId(save.activeGame.tierId) : null;

  return `<main class="${shellClasses("home-screen")}">
    <section class="village-hero stage-${villageStage}" aria-label="Kuş Köyü, ${esc(milestone.title)}">
      <div class="hero-topbar"><div><p class="eyebrow">KUŞ KÖYÜ</p><h1>Denge</h1></div><button class="round-button" data-action="settings" aria-label="Ayarlar">${icon("settings")}</button></div>
      <div class="village-scene" aria-hidden="true"><div class="sun"></div><div class="hill hill-a"></div><div class="hill hill-b"></div><div class="house house-a"><i></i></div><div class="house house-b"><i></i></div><div class="tree tree-a"></div><div class="tree tree-b"></div><div class="hero-bird bird-a">${birdSvg(0, true)}</div><div class="hero-bird bird-b">${birdSvg(Math.min(8, villageStage + 2), true)}</div>${villageStage >= 2 ? `<div class="hero-bird bird-c">${birdSvg(4, true)}</div>` : ""}</div>
      <div class="hero-copy"><p class="hero-tagline">Her yuva yerini bulsun.</p><p>Yolları, bahçeleri ve işaretleri birlikte düşün.</p></div>
    </section>
    <section class="home-content">
      <div class="mastery-card"><div class="mastery-head"><div><span>Ustalık yolun</span><strong>${esc(unlocked.name)}</strong></div><b>${save.score} puan</b></div><div class="progress-track"><span style="width:${Math.round(progress * 100)}%"></span></div><p>${nextLocked ? `${nextLocked.name} için ${Math.max(0, nextLocked.unlockScore - save.score)} puan daha` : "Tüm ustalık kademeleri açık"}</p><div class="home-stats"><span><b>${save.stats.completed}</b><small>Tamamlanan</small></span><span><b>${esc(milestone.title)}</b><small>Köy</small></span><span><b>300+</b><small>Bahçe</small></span></div></div>
      <button class="primary-cta" data-action="${save.activeGame ? "continue" : "start"}"><span>${save.activeGame ? "Kaldığın yerden devam et" : "Yeni bahçeye başla"}</span><small>${save.activeGame ? `${activeTier.name} • Bahçe ${save.activeGame.ordinal}` : `${esc(tierForId(save.selectedTier).name)} • Bahçe ${save.nextOrdinal[save.selectedTier] || 1}`}</small></button>
      <section class="section-block"><div class="section-title"><div><p class="eyebrow">USTALIK</p><h2>Zorluk kademeleri</h2></div><span>5 seviye</span></div><div class="tier-list">${TIERS.map((tier) => { const locked = save.score < tier.unlockScore; const selected = save.selectedTier === tier.id; return `<button class="tier-card ${selected ? "selected" : ""} ${locked ? "locked" : ""}" data-tier="${tier.id}" ${locked ? "disabled" : ""}><span class="tier-badge">${locked ? "🔒" : tier.size + "×" + tier.size}</span><span class="tier-copy"><strong>${esc(tier.name)}</strong><small>${esc(tier.subtitle)}</small></span><span class="tier-meta">${locked ? tier.unlockScore + " puan" : "+" + tier.reward}</span></button>`; }).join("")}</div></section>
      <section class="section-block"><div class="section-title"><div><p class="eyebrow">GÖRÜNÜM</p><h2>Taşlarını seç</h2></div><span>Oyun aynı kalır</span></div><div class="theme-switcher">${[["birds","Kuşlar",birdSvg(0,true)],["shapes","Şekiller",'<span class="theme-symbol">◆</span>'],["numbers","Klasik",'<span class="theme-symbol">4</span>']].map(([id,label,preview]) => `<button class="theme-option ${save.theme === id ? "selected" : ""}" data-theme="${id}"><span>${preview}</span><strong>${label}</strong></button>`).join("")}</div></section>
      <section class="daily-card"><div><p class="eyebrow">OYUN FELSEFESİ</p><h2>Ceza yok, acele yok.</h2><p>İpucu, geri alma ve ara verme serbest. Ustalık yalnızca tamamladığın bahçelerle büyür.</p></div></section>
    </section>
    ${runtime.settingsOpen ? settingsMarkup() : ""}
  </main>`;
}
