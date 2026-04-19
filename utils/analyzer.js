// TabTherapist Analyzer
// Skor hesaplama ve tab analiz fonksiyonları

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

// Eşik değerleri (normalize için)
const THRESHOLDS = {
  totalTabs: 50,       // 50 sekme = max puan
  avgAgeMs: 7 * 24 * 60 * 60 * 1000, // 7 gün = max puan
  duplicateRatio: 0.5, // %50 duplicate = max puan
  aspirationalCount: 20, // 20 aspirational tab = max puan
  domainConcentration: 0.6, // tek domain %60 = max puan
  totalWindows: 10,    // 10 pencere = max puan
};

// Değeri 0-100 arasına sıkıştırır
function normalize(value, max) {
  return Math.min(100, (value / max) * 100);
}

// Aynı URL'ye sahip duplicate sekmeleri tespit eder
function findDuplicateTabs(tabs) {
  const urlCount = {};
  for (const tab of tabs) {
    const url = tab.url || tab.pendingUrl || '';
    if (!url || url.startsWith('chrome://') || url.startsWith('chrome-extension://')) continue;
    urlCount[url] = (urlCount[url] || 0) + 1;
  }

  const duplicates = {};
  for (const [url, count] of Object.entries(urlCount)) {
    if (count > 1) duplicates[url] = count;
  }

  const duplicateCount = Object.values(duplicates).reduce((sum, count) => sum + (count - 1), 0);

  return { duplicates, duplicateCount };
}

/**
 * calculateHoardingScore — 6 metriğin ağırlıklı ortalamasından 0-100 skor üretir.
 *
 * @param {object} stats
 * @param {number}   stats.totalTabs        — Toplam sekme sayısı
 * @param {number}   stats.totalWindows     — Açık pencere sayısı
 * @param {number}   stats.duplicateCount   — Duplicate sekme sayısı
 * @param {object}   stats.domainMap        — { hostname: count }
 * @param {object}   stats.tab_history      — chrome.storage'dan gelen { tabId: { firstSeen, lastActive } }
 * @returns {{ score: number, breakdown: object }}
 */
function calculateHoardingScore(stats) {
  const { totalTabs, totalWindows, duplicateCount, domainMap, tab_history = {} } = stats;

  // 1. Toplam sekme sayısı (25%)
  const tabScore = normalize(totalTabs, THRESHOLDS.totalTabs);

  // 2. Ortalama sekme yaşı (20%)
  const now = Date.now();
  const historyEntries = Object.values(tab_history);
  let avgAgeMs = 0;
  if (historyEntries.length > 0) {
    const totalAge = historyEntries.reduce((sum, entry) => sum + (now - (entry.firstSeen || now)), 0);
    avgAgeMs = totalAge / historyEntries.length;
  }
  const ageScore = normalize(avgAgeMs, THRESHOLDS.avgAgeMs);

  // 3. Duplicate sekme oranı (15%)
  const duplicateRatio = totalTabs > 0 ? duplicateCount / totalTabs : 0;
  const duplicateScore = normalize(duplicateRatio, THRESHOLDS.duplicateRatio);

  // 4. Aspirational tab sayısı (20%) — 3+ gündür açık, hiç ziyaret edilmemiş
  const aspirationalCount = historyEntries.filter(entry => {
    const age = now - (entry.firstSeen || now);
    const neverVisited = entry.lastActive === entry.firstSeen;
    return age >= THREE_DAYS_MS && neverVisited;
  }).length;
  const aspirationalScore = normalize(aspirationalCount, THRESHOLDS.aspirationalCount);

  // 5. Tek domain yoğunluğu (10%)
  const domainCounts = Object.values(domainMap || {});
  const maxDomainCount = domainCounts.length > 0 ? Math.max(...domainCounts) : 0;
  const domainConcentration = totalTabs > 0 ? maxDomainCount / totalTabs : 0;
  const domainScore = normalize(domainConcentration, THRESHOLDS.domainConcentration);

  // 6. Pencere sayısı (10%)
  const windowScore = normalize(totalWindows, THRESHOLDS.totalWindows);

  // Ağırlıklı toplam
  const score = Math.round(
    tabScore         * 0.25 +
    ageScore         * 0.20 +
    duplicateScore   * 0.15 +
    aspirationalScore * 0.20 +
    domainScore      * 0.10 +
    windowScore      * 0.10
  );

  return {
    score,
    breakdown: {
      tabScore:          Math.round(tabScore),
      ageScore:          Math.round(ageScore),
      duplicateScore:    Math.round(duplicateScore),
      aspirationalScore: Math.round(aspirationalScore),
      domainScore:       Math.round(domainScore),
      windowScore:       Math.round(windowScore),
      aspirationalCount,
    }
  };
}

/**
 * getPersonalityType — Skora göre kişilik tipini döndürür.
 * @param {number} score — 0-100
 * @returns {string}
 */
function getPersonalityType(score) {
  if (score <= 20) return 'Zen Master';
  if (score <= 40) return 'Casual Browser';
  if (score <= 60) return 'Tab Enthusiast';
  if (score <= 80) return 'Digital Hoarder';
  return 'Tab Apocalypse';
}
