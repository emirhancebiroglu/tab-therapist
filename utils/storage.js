// TabTherapist Storage Wrapper
// chrome.storage.local async wrapper

import { extractDomain, categorize } from './categorizer.js';
import { STORAGE_WARNING_THRESHOLD, STORAGE_CRITICAL_THRESHOLD } from './constants.js';

export function getStorage(keys = null) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(keys, (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(result);
      }
    });
  });
}

export function setStorage(data) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set(data, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
}

export function clearStorage() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.clear(() => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
}

// === v2 Helpers ===

function createEmptyArchive() {
  return {
    version: 2,
    sessions: [],
    totalSessions: 0,
    totalArchivedTabs: 0,
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString()
  };
}

function isInsurancePolicy(tab) {
  const THRESHOLD_MS = 48 * 60 * 60 * 1000;
  const age = Date.now() - (tab.createdAt || Date.now());
  const neverAccessed = !tab.lastAccessed || tab.lastAccessed === tab.createdAt;
  return age > THRESHOLD_MS && neverAccessed;
}

// === v2 Arşiv İşlemleri ===

export async function archiveTabs(tabs, source = "manual", label = null) {
  const data = await chrome.storage.local.get("tabtherapist_v2_archive");
  const archive = data?.tabtherapist_v2_archive || createEmptyArchive();

  const session = {
    id: `arch_${Date.now()}`,
    createdAt: new Date().toISOString(),
    source,
    label,
    tabs: tabs.map((tab, i) => ({
      id: `tab_${Date.now()}${i}`,
      url: tab.url,
      title: tab.title || "Untitled",
      domain: extractDomain(tab.url),
      favicon: tab.favIconUrl || null,
      meta_description: null,
      addedAt: new Date().toISOString(),
      originalTabAge: Date.now() - (tab.createdAt || Date.now()),
      category: categorize(tab.url, tab.title || '', extractDomain(tab.url)),
      wasInsurancePolicy: isInsurancePolicy(tab)
    })),
    stats: {
      totalTabs: tabs.length,
      uniqueDomains: new Set(tabs.map(t => extractDomain(t.url))).size,
      oldestTabAge: Math.max(...tabs.map(t => Date.now() - (t.createdAt || Date.now()))),
      insurancePolicyCount: tabs.filter(t => isInsurancePolicy(t)).length
    }
  };

  archive.sessions.unshift(session);
  archive.totalSessions++;
  archive.totalArchivedTabs += tabs.length;
  archive.lastUpdated = new Date().toISOString();

  await chrome.storage.local.set({ tabtherapist_v2_archive: archive });
  return session;
}

export async function searchArchive(query) {
  const data = await chrome.storage.local.get("tabtherapist_v2_archive");
  const archive = data?.tabtherapist_v2_archive;
  if (!archive) return [];

  const lowerQuery = query.toLowerCase();
  const results = [];

  archive.sessions.forEach(session => {
    session.tabs.forEach(tab => {
      if (
        tab.title.toLowerCase().includes(lowerQuery) ||
        tab.url.toLowerCase().includes(lowerQuery) ||
        tab.domain.toLowerCase().includes(lowerQuery)
      ) {
        results.push({ ...tab, sessionId: session.id, sessionDate: session.createdAt });
      }
    });
  });

  return results;
}

export async function restoreTabsFromSession(sessionId, tabIds = null) {
  const data = await chrome.storage.local.get("tabtherapist_v2_archive");
  const archive = data?.tabtherapist_v2_archive;
  if (!archive) return;

  const session = archive.sessions.find(s => s.id === sessionId);
  if (!session) return;

  const tabsToRestore = tabIds
    ? session.tabs.filter(t => tabIds.includes(t.id))
    : session.tabs;

  for (const tab of tabsToRestore) {
    await chrome.tabs.create({ url: tab.url, active: false });
  }
}

export async function deleteTabFromArchiveSession(sessionId, tabId) {
  const data = await chrome.storage.local.get("tabtherapist_v2_archive");
  const archive = data?.tabtherapist_v2_archive;
  if (!archive) return;

  const session = archive.sessions.find(s => s.id === sessionId);
  if (!session) return;

  const tabIndex = session.tabs.findIndex(t => t.id === tabId);
  if (tabIndex === -1) return;

  session.tabs.splice(tabIndex, 1);
  archive.totalArchivedTabs = Math.max(0, archive.totalArchivedTabs - 1);

  if (session.tabs.length === 0) {
    const sessionIndex = archive.sessions.findIndex(s => s.id === sessionId);
    archive.sessions.splice(sessionIndex, 1);
    archive.totalSessions = Math.max(0, archive.totalSessions - 1);
  } else {
    session.stats.totalTabs = session.tabs.length;
    session.stats.uniqueDomains = new Set(session.tabs.map(t => t.domain)).size;
  }

  archive.lastUpdated = new Date().toISOString();
  await chrome.storage.local.set({ tabtherapist_v2_archive: archive });
}

export async function deleteArchiveSession(sessionId) {
  const data = await chrome.storage.local.get("tabtherapist_v2_archive");
  const archive = data?.tabtherapist_v2_archive;
  if (!archive) return;

  const sessionIndex = archive.sessions.findIndex(s => s.id === sessionId);
  if (sessionIndex === -1) return;

  const removedTabs = archive.sessions[sessionIndex].tabs.length;
  archive.sessions.splice(sessionIndex, 1);
  archive.totalSessions--;
  archive.totalArchivedTabs -= removedTabs;
  archive.lastUpdated = new Date().toISOString();

  await chrome.storage.local.set({ tabtherapist_v2_archive: archive });
}

// === v2 Velocity & Switch Logging ===

export async function logVelocityEvent(type, tabId, domain) {
  const data = await chrome.storage.local.get("tabtherapist_v2_velocity_log");
  const log = data?.tabtherapist_v2_velocity_log || {
    version: 1, events: [], windowStart: Date.now(), maxEvents: 500
  };

  log.events.push({ type, timestamp: Date.now(), tabId, domain });

  const oneHourAgo = Date.now() - 3600000;
  log.events = log.events.filter(e => e.timestamp > oneHourAgo);

  if (log.events.length > log.maxEvents) {
    log.events = log.events.slice(-log.maxEvents);
  }

  await chrome.storage.local.set({ tabtherapist_v2_velocity_log: log });
}

export async function logSwitchEvent(tabId, domain, category) {
  const data = await chrome.storage.local.get("tabtherapist_v2_switch_log");
  const log = data?.tabtherapist_v2_switch_log || {
    version: 1, activations: [], windowMinutes: 30, maxActivations: 300
  };

  log.activations.push({ timestamp: Date.now(), tabId, domain, category });

  const cutoff = Date.now() - (log.windowMinutes * 60 * 1000);
  log.activations = log.activations.filter(a => a.timestamp > cutoff);

  if (log.activations.length > log.maxActivations) {
    log.activations = log.activations.slice(-log.maxActivations);
  }

  await chrome.storage.local.set({ tabtherapist_v2_switch_log: log });
}

export async function pruneVelocityLog() {
  const data = await chrome.storage.local.get("tabtherapist_v2_velocity_log");
  const log = data?.tabtherapist_v2_velocity_log;
  if (!log) return;

  const oneHourAgo = Date.now() - 3600000;
  log.events = log.events.filter(e => e.timestamp > oneHourAgo);
  await chrome.storage.local.set({ tabtherapist_v2_velocity_log: log });
}

export async function pruneSwitchLog() {
  const data = await chrome.storage.local.get("tabtherapist_v2_switch_log");
  const log = data?.tabtherapist_v2_switch_log;
  if (!log) return;

  const cutoff = Date.now() - (log.windowMinutes * 60 * 1000);
  log.activations = log.activations.filter(a => a.timestamp > cutoff);
  await chrome.storage.local.set({ tabtherapist_v2_switch_log: log });
}

export async function checkStorageHealth() {
  return new Promise((resolve) => {
    chrome.storage.local.getBytesInUse(null, (bytesInUse) => {
      const status = bytesInUse >= STORAGE_CRITICAL_THRESHOLD
        ? "critical"
        : bytesInUse >= STORAGE_WARNING_THRESHOLD
          ? "warning"
          : "ok";
      resolve({ bytesInUse, status });
    });
  });
}

export async function exportArchiveAsJSON() {
  const data = await chrome.storage.local.get("tabtherapist_v2_archive");
  return JSON.stringify(data?.tabtherapist_v2_archive || createEmptyArchive(), null, 2);
}

export async function migrateV1toV2() {
  const data = await chrome.storage.local.get(["archived_tabs", "tab_history"]);

  if (data.archived_tabs?.length) {
    const fakeTabs = data.archived_tabs.map(url => ({ url, title: url }));
    await archiveTabs(fakeTabs, "migration_v1");
    await chrome.storage.local.remove("archived_tabs");
  }

  const meta = { migratedAt: new Date().toISOString(), fromVersion: 1 };
  await chrome.storage.local.set({ tabtherapist_v2_meta: meta });
}

