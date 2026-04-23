// TabTherapist Analyzer
// Skor hesaplama ve tab analiz fonksiyonları

import { extractDomain, categorize } from './categorizer.js';
import {
  SCORE_WEIGHTS_V2,
  PERSONALITY_TYPES_V2,
  MEMORY_MULTIPLIERS,
  MEMORY_BASE_MB,
  STORAGE_KEYS_V2,
  VELOCITY_WINDOW_MS,
  SWITCH_WINDOW_MINUTES,
  INSURANCE_POLICY_THRESHOLD_HOURS,
} from './constants.js';

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
export function calculateHoardingScore(stats) {
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
export function getPersonalityType(score) {
  if (score <= 20) return 'Zen Master';
  if (score <= 40) return 'Casual Browser';
  if (score <= 60) return 'Tab Enthusiast';
  if (score <= 80) return 'Digital Hoarder';
  return 'Tab Apocalypse';
}

// --- v2 Analyzer Fonksiyonları ---

/**
 * Shannon entropy'ye dayalı dikkat parçalanma skoru (0-100).
 * @param {chrome.tabs.Tab[]} tabs
 * @returns {number}
 */
export function calculateAttentionFragment(tabs) {
  if (!tabs || tabs.length === 0) return 0;

  const domainCounts = {};
  for (const tab of tabs) {
    const domain = extractDomain(tab.url || tab.pendingUrl || '');
    domainCounts[domain] = (domainCounts[domain] || 0) + 1;
  }

  const total = tabs.length;
  let entropy = 0;
  for (const count of Object.values(domainCounts)) {
    const p = count / total;
    if (p > 0) entropy -= p * Math.log2(p);
  }

  const maxEntropy = Math.log2(total) || 1;
  return Math.round((entropy / maxEntropy) * 100);
}

/**
 * Belirli saatten uzun süredir açık olan "sigorta poliçesi" sekmeleri tespit eder.
 * @param {chrome.tabs.Tab[]} tabs
 * @param {number} thresholdHours
 * @returns {{ count: number, tabs: chrome.tabs.Tab[], ratio: number }}
 */
export function detectInsurancePolicyTabs(tabs, thresholdHours = INSURANCE_POLICY_THRESHOLD_HOURS) {
  const thresholdMs = thresholdHours * 3600000;
  const now = Date.now();

  const insuranceTabs = tabs.filter(tab => {
    const lastAccessed = tab.lastAccessed || now;
    return (now - lastAccessed) >= thresholdMs;
  });

  return {
    count: insuranceTabs.length,
    tabs: insuranceTabs,
    ratio: tabs.length > 0 ? insuranceTabs.length / tabs.length : 0,
  };
}

/**
 * Son 1 saatteki sekme açma/kapama hızını hesaplar.
 * @returns {Promise<{ opened: number, closed: number, velocity: number, netRate: number }>}
 */
export async function calculateTabVelocity() {
  return new Promise(resolve => {
    chrome.storage.local.get(STORAGE_KEYS_V2.VELOCITY_LOG, result => {
      const logData = result[STORAGE_KEYS_V2.VELOCITY_LOG];
      // Storage format: { version, events: [...], windowStart, maxEvents }
      const log = (logData && logData.events) ? logData.events : [];
      const now = Date.now();

      const recent = log.filter(e => (now - e.timestamp) <= VELOCITY_WINDOW_MS);
      const opened = recent.filter(e => e.type === 'created').length;
      const closed = recent.filter(e => e.type === 'removed').length;

      resolve({ opened, closed, velocity: opened + closed, netRate: opened - closed });
    });
  });
}

/**
 * Son 30 dakikadaki bağlam değişimlerini hesaplar ve ceza puanı üretir.
 * @returns {Promise<{ switchCount: number, penalty: number, topSwitches: Array }>}
 */
export async function calculateContextSwitchPenalty() {
  return new Promise(resolve => {
    chrome.storage.local.get(STORAGE_KEYS_V2.SWITCH_LOG, result => {
      const logData = result[STORAGE_KEYS_V2.SWITCH_LOG];
      // Storage format: { version, activations: [...], windowMinutes, maxActivations }
      const log = (logData && logData.activations) ? logData.activations : [];
      const now = Date.now();
      const windowMs = SWITCH_WINDOW_MINUTES * 60000;

      const recent = log.filter(e => (now - e.timestamp) <= windowMs);
      const switchCount = recent.length;

      const categoryMap = {};
      for (const entry of recent) {
        const key = entry.category || 'other';
        categoryMap[key] = (categoryMap[key] || 0) + 1;
      }

      const topSwitches = Object.entries(categoryMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([category, count]) => ({ category, count }));

      // 30 switch in 30 dakika = tam ceza
      const penalty = Math.min(100, Math.round((switchCount / 30) * 100));

      resolve({ switchCount, penalty, topSwitches });
    });
  });
}

/**
 * Sekmelerin tahmini RAM baskısını hesaplar.
 * @param {chrome.tabs.Tab[]} tabs
 * @returns {{ estimatedMB: number, score: number, heaviestDomains: Array }}
 */
export function calculateMemoryPressure(tabs) {
  if (!tabs || tabs.length === 0) {
    return { estimatedMB: 0, score: 0, heaviestDomains: [] };
  }

  const domainLoad = {};
  for (const tab of tabs) {
    const domain = extractDomain(tab.url || tab.pendingUrl || '');
    const multiplier = MEMORY_MULTIPLIERS[domain] || 1.0;
    domainLoad[domain] = (domainLoad[domain] || 0) + MEMORY_BASE_MB * multiplier;
  }

  const estimatedMB = Math.round(Object.values(domainLoad).reduce((a, b) => a + b, 0));

  const heaviestDomains = Object.entries(domainLoad)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([domain, mb]) => ({ domain, category: categorize(domain), mb: Math.round(mb) }));

  // 4000MB = tam baskı (80 sekme × ortalama 50MB)
  const score = Math.min(100, Math.round((estimatedMB / 4000) * 100));

  return { estimatedMB, score, heaviestDomains };
}

/**
 * v1 ve v2 metriklerini SCORE_WEIGHTS_V2 ağırlıklarıyla birleştirerek yeni skor üretir.
 * @param {chrome.tabs.Tab[]} tabs
 * @returns {Promise<{ score: number, personality: string, metrics: object }>}
 */
export async function calculateScoreV2(tabs) {
  const now = Date.now();
  const tabCount = tabs.length;

  const tabHistory = await new Promise(resolve =>
    chrome.storage.local.get('tab_history', r => resolve(r.tab_history || {}))
  );

  const windows = await new Promise(resolve =>
    chrome.windows.getAll({}, resolve)
  );
  const wCount = windows.length;

  // Ortalama sekme yaşı (ms)
  const historyEntries = Object.values(tabHistory);
  const avgAge = historyEntries.length > 0
    ? historyEntries.reduce((sum, e) => sum + (now - (e.firstSeen || now)), 0) / historyEntries.length
    : 0;

  // Duplicate oranı
  const urlCount = {};
  for (const tab of tabs) {
    const url = tab.url || tab.pendingUrl || '';
    if (!url || url.startsWith('chrome://') || url.startsWith('chrome-extension://')) continue;
    urlCount[url] = (urlCount[url] || 0) + 1;
  }
  const duplCount = Object.values(urlCount).filter(c => c > 1).reduce((s, c) => s + (c - 1), 0);
  const duplRatio = tabCount > 0 ? duplCount / tabCount : 0;

  // Tek domain yoğunluğu
  const domainCounts = {};
  for (const tab of tabs) {
    const d = extractDomain(tab.url || tab.pendingUrl || '');
    domainCounts[d] = (domainCounts[d] || 0) + 1;
  }
  const maxDomainCount = Object.values(domainCounts).length > 0 ? Math.max(...Object.values(domainCounts)) : 0;
  const domainConc = tabCount > 0 ? maxDomainCount / tabCount : 0;

  // v2 metrikler
  const ins = detectInsurancePolicyTabs(tabs);
  const attentionFragment = calculateAttentionFragment(tabs);
  const contextSwitch = await calculateContextSwitchPenalty();
  const memoryPressure = calculateMemoryPressure(tabs);

  // Normalize yardımcıları
  const normTabCount   = v => Math.min(100, (v / 50) * 100);
  const normAge        = v => Math.min(100, (v / (7 * 24 * 3600000)) * 100);
  const normDuplicates = v => Math.min(100, (v / 0.5) * 100);
  const normInsurance  = v => Math.min(100, (v / 0.5) * 100);
  const normDomainConc = v => Math.min(100, (v / 0.6) * 100);
  const normWindows    = v => Math.min(100, (v / 10) * 100);

  const W = SCORE_WEIGHTS_V2;
  const rawScore =
    normTabCount(tabCount)     * W.tabCount +
    normAge(avgAge)            * W.avgAge +
    normDuplicates(duplRatio)  * W.duplicates +
    normInsurance(ins.ratio)   * W.insurancePolicy +
    normDomainConc(domainConc) * W.domainConcentration +
    normWindows(wCount)        * W.windowCount +
    attentionFragment          * W.attentionFragment +
    contextSwitch.penalty      * W.contextSwitch +
    memoryPressure.score       * W.memoryPressure;

  const score = Math.round(rawScore);

  const personalityEntry = PERSONALITY_TYPES_V2.find(p => score >= p.min && score <= p.max)
    || PERSONALITY_TYPES_V2[PERSONALITY_TYPES_V2.length - 1];

  return {
    score,
    personality: `${personalityEntry.emoji} ${personalityEntry.name}`,
    metrics: {
      tabCount,
      avgAgeHours:          Math.round(avgAge / 3600000),
      duplicateRatio:       Math.round(duplRatio * 100),
      insuranceCount:       ins.count,
      insuranceRatio:       Math.round(ins.ratio * 100),
      attentionFragment,
      contextSwitchPenalty: contextSwitch.penalty,
      memoryPressureMB:     memoryPressure.estimatedMB,
      memoryScore:          memoryPressure.score,
    },
  };
}
