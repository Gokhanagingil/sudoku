export const TIERS = [
  {
    id: "acemi",
    name: "Acemi",
    subtitle: "Köyü tanı",
    size: 4,
    regionRows: 2,
    regionCols: 2,
    unlockScore: 0,
    reward: 50,
    targetGivens: 8,
    clueTypes: [],
    constraintPlan: { consecutive: 0, order: 0, sum: 0 },
    description: "Dört kuşla temel satır, sütun ve bahçe mantığını öğren."
  },
  {
    id: "cirak",
    name: "Çırak",
    subtitle: "Yollar çoğalıyor",
    size: 6,
    regionRows: 2,
    regionCols: 3,
    unlockScore: 250,
    reward: 80,
    targetGivens: 16,
    clueTypes: ["consecutive"],
    constraintPlan: { consecutive: 4, order: 0, sum: 0 },
    description: "Altı kuş ve komşuluk noktalarıyla yeni çıkarımlar yap."
  },
  {
    id: "deneyimli",
    name: "Deneyimli",
    subtitle: "İpuçlarını birleştir",
    size: 6,
    regionRows: 2,
    regionCols: 3,
    unlockScore: 800,
    reward: 120,
    targetGivens: 12,
    clueTypes: ["consecutive", "order"],
    constraintPlan: { consecutive: 5, order: 3, sum: 0 },
    description: "Komşuluk ve sıra oklarını birlikte okuyarak birkaç adım sonrasını gör."
  },
  {
    id: "usta",
    name: "Usta",
    subtitle: "Büyük köy",
    size: 9,
    regionRows: 3,
    regionCols: 3,
    unlockScore: 1800,
    reward: 170,
    targetGivens: 31,
    clueTypes: ["consecutive", "order"],
    constraintPlan: { consecutive: 7, order: 5, sum: 0 },
    description: "Dokuz kuşluk büyük köyde temel kurallar ve ilişki ipuçları birlikte çalışır."
  },
  {
    id: "pro",
    name: "Pro",
    subtitle: "Köyün ustası",
    size: 9,
    regionRows: 3,
    regionCols: 3,
    unlockScore: 3600,
    reward: 240,
    targetGivens: 24,
    clueTypes: ["consecutive", "order", "sum"],
    constraintPlan: { consecutive: 9, order: 6, sum: 5 },
    description: "Düşük başlangıç yoğunluğunu komşuluk, sıra ve toplam ilişkileriyle çöz."
  }
];

export const BIRDS = [
  { id: "mavi", name: "Maviş", body: "#5b9fc7", chest: "#dff4ef", wing: "#2f7197", accent: "#e8a73f", mark: "dots" },
  { id: "nar", name: "Nar Bülbülü", body: "#c95f55", chest: "#f2c4a1", wing: "#9a403a", accent: "#e7a13d", mark: "bib" },
  { id: "limon", name: "Limon İspinozu", body: "#d9bd3f", chest: "#fff2aa", wing: "#827837", accent: "#d88e34", mark: "stripe" },
  { id: "leylak", name: "Leylak Kuşu", body: "#8c70b0", chest: "#eadff4", wing: "#5f4b84", accent: "#dda151", mark: "crest" },
  { id: "zeytin", name: "Zeytin Baştankarası", body: "#6f8952", chest: "#dce4b2", wing: "#465e39", accent: "#d88e34", mark: "bib" },
  { id: "mercan", name: "Mercan Kuşu", body: "#dc7973", chest: "#ffe1d1", wing: "#aa5160", accent: "#efad41", mark: "stripe" },
  { id: "gece", name: "Gece Sakası", body: "#526577", chest: "#d9e0df", wing: "#283b4c", accent: "#dfa13e", mark: "mask" },
  { id: "turkuaz", name: "Turkuaz Ardıç", body: "#429e96", chest: "#cbece4", wing: "#226e6a", accent: "#e19740", mark: "dots" },
  { id: "gul", name: "Gül Sığırcığı", body: "#bd7597", chest: "#f1d3df", wing: "#864a6d", accent: "#dfa045", mark: "mask" }
];

export const GEOMETRIC = ["●", "▲", "■", "◆", "★", "⬟", "✚", "⬢", "☾"];

export const VILLAGE_MILESTONES = [
  { score: 0, title: "İlk yuvalar", copy: "Maviş köye yerleşti." },
  { score: 250, title: "Çiçek yolu", copy: "Patikaların kenarı çiçeklendi." },
  { score: 800, title: "Yeni komşular", copy: "Köye yeni kuşlar geldi." },
  { score: 1800, title: "Köy meydanı", copy: "Büyük bahçe ve meydan canlandı." },
  { score: 3600, title: "Denge Köyü", copy: "Köy bütün ayrıntılarıyla tamamlandı." }
];

export function tierForId(id) {
  return TIERS.find((tier) => tier.id === id) || TIERS[0];
}

export function unlockedTier(score) {
  return TIERS.reduce((current, tier) => score >= tier.unlockScore ? tier : current, TIERS[0]);
}

export function nextTier(tierId) {
  const index = TIERS.findIndex((tier) => tier.id === tierId);
  return TIERS[Math.min(TIERS.length - 1, Math.max(0, index + 1))];
}

export function villageMilestone(score) {
  return VILLAGE_MILESTONES.reduce((current, milestone) => score >= milestone.score ? milestone : current, VILLAGE_MILESTONES[0]);
}
