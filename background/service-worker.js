// TabTherapist Service Worker
// Manifest V3: Tab event dinleyicisi ve veri yöneticisi

import {
  calculateHoardingScore,
  getPersonalityType,
  calculateAttentionFragment,
  detectInsurancePolicyTabs,
  calculateTabVelocity,
  calculateContextSwitchPenalty,
} from '../utils/analyzer.js';
import { extractDomain, categorize } from '../utils/categorizer.js';
import {
  archiveTabs,
  logVelocityEvent,
  logSwitchEvent,
  pruneVelocityLog,
  pruneSwitchLog,
  checkStorageHealth,
  migrateV1toV2
} from '../utils/storage.js';

const ANCIENT_THRESHOLD_MS = 3 * 24 * 60 * 60 * 1000; // 3 gün

// Tab oluşturulduğunda ilk görülme zamanını kaydet
chrome.tabs.onCreated.addListener(async (tab) => {
  if (!tab.url && !tab.pendingUrl) return;
  const url = tab.url || tab.pendingUrl;
  const { tab_history = {} } = await chrome.storage.local.get('tab_history');
  if (!tab_history[tab.id]) {
    tab_history[tab.id] = {
      url,
      firstSeen: Date.now(),
      lastActive: Date.now()
    };
    await chrome.storage.local.set({ tab_history });
  }
  // v2: velocity tracking
  await logVelocityEvent("created", tab.id, extractDomain(url));
});

// Tab kapandığında kaydı temizle
chrome.tabs.onRemoved.addListener(async (tabId) => {
  const { tab_history = {} } = await chrome.storage.local.get('tab_history');
  delete tab_history[tabId];
  await chrome.storage.local.set({ tab_history });
  // v2: velocity tracking
  await logVelocityEvent("removed", tabId, null);
});

// Tab aktif olduğunda lastActive güncelle
chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  const { tab_history = {} } = await chrome.storage.local.get('tab_history');
  if (tab_history[tabId]) {
    tab_history[tabId].lastActive = Date.now();
    await chrome.storage.local.set({ tab_history });
  }
  // v2: context switch tracking
  try {
    const tab = await chrome.tabs.get(tabId);
    const tabUrl = tab.url || tab.pendingUrl || '';
    const domain = extractDomain(tabUrl);
    const category = categorize(tabUrl, tab.title || '', domain);
    await logSwitchEvent(tabId, domain, category);
  } catch {
    // tab getirilemezse sessizce atla
  }
});

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

// Tüm açık sekmeleri sorgular, ham veriyi işler ve konsola yazdırır
async function collectTabStats() {
  const tabs = await chrome.tabs.query({});

  const totalTabs = tabs.length;

  // Pencere bazlı gruplama
  const windowMap = {};
  for (const tab of tabs) {
    if (!windowMap[tab.windowId]) windowMap[tab.windowId] = 0;
    windowMap[tab.windowId]++;
  }
  const totalWindows = Object.keys(windowMap).length;

  // Domain bazlı gruplama
  const domainMap = {};
  for (const tab of tabs) {
    try {
      const url = tab.url || tab.pendingUrl || '';
      if (!url || url.startsWith('chrome://') || url.startsWith('chrome-extension://')) continue;
      const hostname = new URL(url).hostname;
      domainMap[hostname] = (domainMap[hostname] || 0) + 1;
    } catch {
      // parse edilemeyen URL'leri atla
    }
  }

    // Duplicate tespiti
  const { duplicates, duplicateCount } = findDuplicateTabs(tabs);

  // Skor algoritması
  const { tab_history = {} } = await chrome.storage.local.get('tab_history');
  const { score, breakdown } = calculateHoardingScore({
    totalTabs, totalWindows, duplicateCount, domainMap, tab_history
  });
  const personality = getPersonalityType(score);

  // v2 metrics
  const attentionFragment = calculateAttentionFragment(tabs);
  const insurance = detectInsurancePolicyTabs(tabs);
  const tabVelocity = await calculateTabVelocity();
  const contextSwitch = await calculateContextSwitchPenalty();

  const now = Date.now();
  const ancientTabCount = tabs.filter(t => {
    const h = tab_history[t.id];
    return h && (now - h.firstSeen) >= ANCIENT_THRESHOLD_MS;
  }).length;

  return {
    totalTabs, totalWindows, windowMap, domainMap, duplicates, duplicateCount, score, personality,
    ancientTabCount,
    attentionFragment,
    insurancePolicy: insurance.count,
    velocity: tabVelocity.netRate,
    contextSwitchPenalty: contextSwitch.penalty,
  };
}

// Popup açıldığında istatistikleri hesapla
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'GET_TAB_STATS') {
    collectTabStats()
      .then(sendResponse)
      .catch(() => sendResponse(null));
    return true;
  }

  if (message.type === 'CLOSE_ANCIENT_TABS') {
    chrome.tabs.query({}).then(async (tabs) => {
      const { tab_history = {} } = await chrome.storage.local.get('tab_history');
      const now = Date.now();
      const ancientIds = tabs
        .filter(t => {
          const h = tab_history[t.id];
          return h && (now - h.firstSeen) >= ANCIENT_THRESHOLD_MS;
        })
        .map(t => t.id);
      if (ancientIds.length) await chrome.tabs.remove(ancientIds);
      sendResponse({ closed: ancientIds.length });
    });
    return true;
  }

  if (message.type === 'MERGE_DUPLICATES') {
    chrome.tabs.query({}).then(async (tabs) => {
      const urlMap = {};
      const toClose = [];
      for (const tab of tabs) {
        const url = tab.url || tab.pendingUrl || '';
        if (!url || url.startsWith('chrome://') || url.startsWith('chrome-extension://')) continue;
        if (!urlMap[url]) {
          urlMap[url] = tab;
        } else {
          if (tab.active) {
            toClose.push(urlMap[url].id);
            urlMap[url] = tab;
          } else {
            toClose.push(tab.id);
          }
        }
      }
      if (toClose.length) await chrome.tabs.remove(toClose);
      sendResponse({ closed: toClose.length });
    });
    return true;
  }

  if (message.type === 'ARCHIVE_TABS_V2') {
    (async () => {
      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const allTabs = await chrome.tabs.query({});
      const toArchive = allTabs.filter(t =>
        t.id !== activeTab?.id &&
        t.url &&
        !t.url.startsWith('chrome://') &&
        !t.url.startsWith('chrome-extension://')
      );

      if (toArchive.length === 0) {
        sendResponse({ archived: 0 });
        return;
      }

      const session = await archiveTabs(toArchive, 'manual');
      await chrome.tabs.remove(toArchive.map(t => t.id));
      sendResponse({ archived: toArchive.length, session });
    })();
    return true;
  }
});

// v2: Periyodik temizlik alarmı (her 5 dakikada bir)
chrome.alarms.create("cleanup", { periodInMinutes: 5 });
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === "cleanup") {
    await pruneVelocityLog();
    await pruneSwitchLog();
    await checkStorageHealth();
  }
});

// v2: İlk kurulum / güncelleme → migrasyon
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === "install" || details.reason === "update") {
    await migrateV1toV2();
  }
});

// Service worker başladığında bir kez çalıştır (geliştirme amaçlı)
collectTabStats();
