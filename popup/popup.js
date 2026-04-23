// TabTherapist Popup Script

const CIRCUMFERENCE = 327; // 2π × 52
const ARCHIVE_KEY   = 'tabtherapist_v2_archive';

const PERSONALITY_TYPE_MAP = {
  'Zen Master':      'zen',
  'Casual Browser':  'casual',
  'Tab Enthusiast':  'enthusiast',
  'Digital Hoarder': 'hoarder',
  'Tab Apocalypse':  'apocalypse',
};

let currentStats         = null;
let archiveData          = null;
let activeFilter         = 'all';
let archiveSearchDebounce = null;

// ── MODAL ──

function openModal(message, onConfirm) {
  const modal     = document.getElementById('confirmModal');
  const msgEl     = document.getElementById('modalMessage');
  const btnOk     = document.getElementById('modalConfirm');
  const btnCancel = document.getElementById('modalCancel');

  msgEl.textContent = message;
  modal.hidden = false;

  function close() {
    modal.hidden = true;
    btnOk.removeEventListener('click', handleOk);
    btnCancel.removeEventListener('click', close);
  }
  function handleOk() { close(); onConfirm(); }

  btnOk.addEventListener('click', handleOk);
  btnCancel.addEventListener('click', close);
}

// ── VIEW SWITCHING ──

function showMainView() {
  document.getElementById('mainView').hidden    = false;
  document.getElementById('archiveView').hidden = true;
}

function showArchiveView() {
  document.getElementById('mainView').hidden    = true;
  document.getElementById('archiveView').hidden = false;
  loadAndRenderArchive();
}

// ── MAIN VIEW LOGIC ──

function refreshStats() {
  chrome.runtime.sendMessage({ type: 'GET_TAB_STATS' }, (response) => {
    if (chrome.runtime.lastError || !response) { renderError(); return; }
    currentStats = response;
    renderStats(response);
  });
}

function animateScore(targetScore) {
  const scoreEl = document.getElementById('scoreValue');
  const ringEl  = document.getElementById('ringFill');
  const duration = 1200;
  const start = performance.now();

  function tick(now) {
    const elapsed  = Math.min(now - start, duration);
    const eased    = 1 - Math.pow(1 - elapsed / duration, 3);
    const current  = Math.round(eased * targetScore);

    scoreEl.textContent = current;
    ringEl.style.strokeDashoffset = CIRCUMFERENCE - (CIRCUMFERENCE * (current / 100));

    if (elapsed < duration) {
      requestAnimationFrame(tick);
    } else {
      scoreEl.textContent = targetScore;
      ringEl.style.strokeDashoffset = CIRCUMFERENCE - (CIRCUMFERENCE * (targetScore / 100));
    }
  }

  requestAnimationFrame(tick);
}

function showDashboard() {
  document.getElementById('loadingState').hidden  = true;
  document.getElementById('singleTabMsg').hidden  = true;
  document.getElementById('dashboardMain').hidden = false;
}

function showSingleTabMessage() {
  document.getElementById('loadingState').hidden  = true;
  document.getElementById('dashboardMain').hidden = true;
  document.getElementById('singleTabMsg').hidden  = false;
}

function updateActionButtons(data) {
  const btnCloseAncient    = document.getElementById('btnCloseAncient');
  const btnMergeDuplicates = document.getElementById('btnMergeDuplicates');
  const btnArchive         = document.getElementById('btnArchive');

  const ancientTabCount = data.ancientTabCount ?? 0;
  const duplicateCount  = data.duplicateCount  ?? 0;
  const totalTabs       = data.totalTabs       ?? 0;

  if (btnCloseAncient)    btnCloseAncient.disabled    = (ancientTabCount === 0);
  if (btnMergeDuplicates) btnMergeDuplicates.disabled = (duplicateCount === 0);
  if (btnArchive)         btnArchive.disabled         = (totalTabs <= 1);
}

function updateV2Metrics(data) {
  const attentionEl = document.getElementById('attention-fragment');
  const insuranceEl = document.getElementById('insurance-count');
  const velocityEl  = document.getElementById('tab-velocity');
  const contextEl   = document.getElementById('context-switch');

  if (attentionEl) attentionEl.textContent = data.attentionFragment != null ? `%${data.attentionFragment}` : '--';
  if (insuranceEl) insuranceEl.textContent = data.insurancePolicy   != null ? `${data.insurancePolicy} adet` : '--';
  if (velocityEl) {
    const v = data.velocity;
    velocityEl.textContent = v != null ? (v >= 0 ? `+${v}` : `${v}`) : '--';
  }
  if (contextEl) contextEl.textContent = data.contextSwitchPenalty != null ? `%${data.contextSwitchPenalty}` : '--';
}

function renderStats(data) {
  if (data.totalTabs === 1) {
    showSingleTabMessage();
    return;
  }

  showDashboard();

  document.getElementById('statTabs').textContent       = data.totalTabs      ?? '--';
  document.getElementById('statWindows').textContent    = data.totalWindows   ?? '--';
  document.getElementById('statDuplicates').textContent = data.duplicateCount ?? '--';

  const badge = document.getElementById('personalityBadge');
  const label = document.getElementById('personalityLabel');
  label.textContent  = data.personality ?? 'Bilinmiyor';
  badge.dataset.type = PERSONALITY_TYPE_MAP[data.personality] ?? '';

  animateScore(data.score ?? 0);
  updateActionButtons(data);
  updateV2Metrics(data);
}

function renderError() {
  showDashboard();
  document.getElementById('scoreValue').textContent       = '?';
  document.getElementById('personalityLabel').textContent = 'Veri alınamadı';
  document.getElementById('statTabs').textContent         = '--';
  document.getElementById('statWindows').textContent      = '--';
  document.getElementById('statDuplicates').textContent   = '--';
}

// ── ARCHIVE VIEW LOGIC ──

function loadAndRenderArchive() {
  chrome.storage.local.get(ARCHIVE_KEY, (result) => {
    archiveData = result[ARCHIVE_KEY] || { sessions: [], totalSessions: 0, totalArchivedTabs: 0 };
    renderSessions();
  });
}

function formatDate(isoString) {
  try {
    const d = new Date(isoString);
    return d.toLocaleString('tr-TR', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  } catch {
    return isoString;
  }
}

function getCategoryEmoji(category) {
  const map = {
    development: '💻', media: '🎬', social: '💬',
    productivity: '📊', communication: '✉️', shopping: '🛒',
    research: '📚', news: '📰', other: '🔗'
  };
  return map[category] || '🔗';
}

function buildTabItem(tab, sessionId) {
  const item = document.createElement('div');
  item.className = 'tab-item';

  if (tab.favicon) {
    const fav = document.createElement('img');
    fav.className = 'tab-favicon';
    fav.src = tab.favicon;
    fav.onerror = () => fav.remove();
    item.appendChild(fav);
  }

  const info = document.createElement('div');
  info.className = 'tab-info';

  const titleEl = document.createElement('span');
  titleEl.className = 'tab-title';
  titleEl.textContent = tab.title || tab.url;
  titleEl.title = tab.url;

  const domainEl = document.createElement('span');
  domainEl.className = 'tab-domain';
  domainEl.textContent = tab.domain;

  info.appendChild(titleEl);
  info.appendChild(domainEl);

  const catBadge = document.createElement('span');
  catBadge.className = 'tab-category';
  catBadge.textContent = getCategoryEmoji(tab.category);

  const restoreBtn = document.createElement('button');
  restoreBtn.className = 'tab-restore-btn';
  restoreBtn.textContent = '↩';
  restoreBtn.title = 'Sekmeyi Aç';
  restoreBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    chrome.tabs.create({ url: tab.url, active: false });
  });

  const deleteTabBtn = document.createElement('button');
  deleteTabBtn.className = 'tab-delete-btn';
  deleteTabBtn.textContent = '🗑';
  deleteTabBtn.title = 'Sekmeyi Sil';
  deleteTabBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    deleteTabFromArchiveSessionLocal(sessionId, tab.id, item);
  });

  item.appendChild(info);
  item.appendChild(catBadge);
  item.appendChild(restoreBtn);
  item.appendChild(deleteTabBtn);

  return item;
}

function buildSessionCard(session) {
  const visibleTabs = activeFilter === 'all'
    ? session.tabs
    : session.tabs.filter(t => t.category === activeFilter);

  // Eşleşen sekme yoksa oturumu gizle
  if (visibleTabs.length === 0) return null;

  const card = document.createElement('div');
  card.className = 'session-card';

  const header = document.createElement('div');
  header.className = 'session-header';

  const meta = document.createElement('div');
  meta.className = 'session-meta';

  const dateEl = document.createElement('div');
  dateEl.className = 'session-date';
  dateEl.textContent = formatDate(session.createdAt);

  const infoEl = document.createElement('div');
  infoEl.className = 'session-info';
  const tabCountLabel = activeFilter === 'all'
    ? `${session.tabs.length} sekme`
    : `${visibleTabs.length} / ${session.tabs.length} sekme`;
  infoEl.textContent = `${tabCountLabel} · ${session.stats?.uniqueDomains ?? '?'} domain`;

  meta.appendChild(dateEl);
  meta.appendChild(infoEl);

  const actions = document.createElement('div');
  actions.className = 'session-actions';

  const restoreBtn = document.createElement('button');
  restoreBtn.className = 'restore-all-btn';
  restoreBtn.textContent = '↩ Yükle';
  restoreBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    session.tabs.forEach(tab => chrome.tabs.create({ url: tab.url, active: false }));
  });

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-session-btn';
  deleteBtn.textContent = '🗑';
  deleteBtn.title = 'Oturumu Sil';
  deleteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openModal(`${session.tabs.length} sekme arşivden silinecek. Emin misin?`, () => {
      deleteArchiveSessionLocal(session.id);
    });
  });

  const toggle = document.createElement('span');
  toggle.className = 'session-toggle';
  toggle.textContent = '▼';

  actions.appendChild(restoreBtn);
  actions.appendChild(deleteBtn);
  actions.appendChild(toggle);

  header.appendChild(meta);
  header.appendChild(actions);

  const tabsList = document.createElement('div');
  tabsList.className = 'tabs-list';

  visibleTabs.forEach(tab => tabsList.appendChild(buildTabItem(tab, session.id)));

  header.addEventListener('click', () => card.classList.toggle('expanded'));

  card.appendChild(header);
  card.appendChild(tabsList);

  return card;
}

function renderSessions() {
  const list        = document.getElementById('sessionsList');
  const emptyState  = document.getElementById('archiveEmptyState');
  const searchResEl = document.getElementById('searchResults');

  list.hidden      = false;
  searchResEl.hidden = true;
  list.innerHTML   = '';

  if (!archiveData || !archiveData.sessions || archiveData.sessions.length === 0) {
    emptyState.hidden = false;
    return;
  }

  emptyState.hidden = true;
  let rendered = 0;
  archiveData.sessions.forEach(session => {
    const card = buildSessionCard(session);
    if (card) { list.appendChild(card); rendered++; }
  });

  if (rendered === 0) {
    emptyState.hidden = false;
  }
}

function deleteTabFromArchiveSessionLocal(sessionId, tabId, tabEl) {
  if (!archiveData) return;
  const session = archiveData.sessions.find(s => s.id === sessionId);
  if (!session) return;

  const tabIndex = session.tabs.findIndex(t => t.id === tabId);
  if (tabIndex === -1) return;

  session.tabs.splice(tabIndex, 1);
  archiveData.totalArchivedTabs = Math.max(0, (archiveData.totalArchivedTabs || 1) - 1);

  let sessionCardEl = null;
  if (session.tabs.length === 0) {
    const sessionIndex = archiveData.sessions.findIndex(s => s.id === sessionId);
    archiveData.sessions.splice(sessionIndex, 1);
    archiveData.totalSessions = Math.max(0, (archiveData.totalSessions || 1) - 1);
    sessionCardEl = tabEl?.closest('.session-card');
  } else {
    if (session.stats) {
      session.stats.totalTabs = session.tabs.length;
      session.stats.uniqueDomains = new Set(session.tabs.map(t => t.domain)).size;
    }
    // Update session info text in DOM without re-render
    const card = tabEl?.closest('.session-card');
    if (card) {
      const infoEl = card.querySelector('.session-info');
      if (infoEl) infoEl.textContent = `${session.tabs.length} sekme · ${session.stats?.uniqueDomains ?? '?'} domain`;
    }
  }

  archiveData.lastUpdated = new Date().toISOString();
  chrome.storage.local.set({ [ARCHIVE_KEY]: archiveData }, () => {
    if (sessionCardEl) {
      sessionCardEl.remove();
      if (!archiveData.sessions.length) {
        document.getElementById('archiveEmptyState').hidden = false;
      }
    } else {
      tabEl?.remove();
    }
  });
}

function deleteArchiveSessionLocal(sessionId) {
  if (!archiveData) return;
  const idx = archiveData.sessions.findIndex(s => s.id === sessionId);
  if (idx === -1) return;

  const removedTabs = archiveData.sessions[idx].tabs.length;
  archiveData.sessions.splice(idx, 1);
  archiveData.totalSessions     = Math.max(0, (archiveData.totalSessions     || 1)           - 1);
  archiveData.totalArchivedTabs = Math.max(0, (archiveData.totalArchivedTabs || removedTabs) - removedTabs);
  archiveData.lastUpdated = new Date().toISOString();

  chrome.storage.local.set({ [ARCHIVE_KEY]: archiveData }, renderSessions);
}

function searchArchiveData(query) {
  if (!archiveData) return [];
  const lq = query.toLowerCase();
  const results = [];
  archiveData.sessions.forEach(session => {
    session.tabs.forEach(tab => {
      if (
        (tab.title  || '').toLowerCase().includes(lq) ||
        tab.url.toLowerCase().includes(lq) ||
        tab.domain.toLowerCase().includes(lq)
      ) {
        results.push({ ...tab, sessionId: session.id, sessionDate: session.createdAt });
      }
    });
  });
  return results;
}

function renderSearchResults(results) {
  const listEl      = document.getElementById('sessionsList');
  const emptyState  = document.getElementById('archiveEmptyState');
  const resultsEl   = document.getElementById('searchResults');
  const resultsListEl = document.getElementById('resultsList');

  if (results.length === 0) {
    listEl.hidden     = false;
    resultsEl.hidden  = true;
    emptyState.hidden = !!archiveData?.sessions?.length;
    return;
  }

  listEl.hidden     = true;
  emptyState.hidden = true;
  resultsEl.hidden  = false;
  resultsListEl.innerHTML = '';

  results.forEach(tab => {
    const li = document.createElement('li');
    li.className = 'result-item';

    const meta = document.createElement('div');
    meta.className = 'result-meta';

    const titleEl = document.createElement('div');
    titleEl.className = 'result-title';
    titleEl.textContent = tab.title || tab.url;

    const detailEl = document.createElement('div');
    detailEl.className = 'result-detail';
    detailEl.textContent = `${tab.domain} · ${formatDate(tab.sessionDate)}`;

    meta.appendChild(titleEl);
    meta.appendChild(detailEl);

    const restoreBtn = document.createElement('button');
    restoreBtn.className = 'tab-restore-btn';
    restoreBtn.textContent = '↩';
    restoreBtn.title = 'Sekmeyi Aç';
    restoreBtn.addEventListener('click', () => chrome.tabs.create({ url: tab.url, active: false }));

    li.appendChild(meta);
    li.appendChild(restoreBtn);
    resultsListEl.appendChild(li);
  });
}

function exportArchiveAsJSON() {
  const json = JSON.stringify(archiveData || {}, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `tabtherapist-archive-${Date.now()}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ── INIT ──

document.addEventListener('DOMContentLoaded', () => {

  // Populate metric tooltips from parent data-tooltip attribute
  document.querySelectorAll('.metric-card[data-tooltip]').forEach(card => {
    const tooltip = card.querySelector('.metric-tooltip');
    if (tooltip) tooltip.textContent = card.dataset.tooltip;
  });

  // Load dashboard stats
  chrome.runtime.sendMessage({ type: 'GET_TAB_STATS' }, (response) => {
    if (chrome.runtime.lastError || !response) { renderError(); return; }
    currentStats = response;
    renderStats(response);
  });

  // Share / scorecard
  document.getElementById('shareBtn').addEventListener('click', () => {
    chrome.tabs.create({ url: 'scorecard/scorecard.html' });
  });

  // Close ancient tabs
  document.getElementById('btnCloseAncient').addEventListener('click', () => {
    const count = currentStats?.ancientTabCount ?? 0;
    if (count === 0) return;
    openModal(`${count} eski sekme kapatılacak. Emin misin?`, () => {
      chrome.runtime.sendMessage({ type: 'CLOSE_ANCIENT_TABS' }, refreshStats);
    });
  });

  // Merge duplicates
  document.getElementById('btnMergeDuplicates').addEventListener('click', () => {
    const count = currentStats?.duplicateCount ?? 0;
    if (count === 0) return;
    openModal(`${count} kopya sekme kapatılacak. Emin misin?`, () => {
      chrome.runtime.sendMessage({ type: 'MERGE_DUPLICATES' }, refreshStats);
    });
  });

  // Archive & close (then show archive view)
  document.getElementById('btnArchive').addEventListener('click', () => {
    const totalTabs = currentStats?.totalTabs ?? 0;
    if (totalTabs <= 1) return;
    const archiveCount = totalTabs - 1;
    openModal(`${archiveCount} sekme arşivlenip kapatılacak. Emin misin?`, () => {
      chrome.runtime.sendMessage({ type: 'ARCHIVE_TABS_V2' }, (response) => {
        if (chrome.runtime.lastError || !response) return;
        showArchiveView();
      });
    });
  });

  // Open archive via header button
  document.getElementById('btnOpenArchive').addEventListener('click', showArchiveView);

  // Back to main view
  document.getElementById('btnArchiveBack').addEventListener('click', () => {
    showMainView();
    refreshStats();
  });

  // Export archive as JSON
  document.getElementById('btnExport').addEventListener('click', exportArchiveAsJSON);

  // Archive search
  document.getElementById('archiveSearch').addEventListener('input', (e) => {
    clearTimeout(archiveSearchDebounce);
    const query = e.target.value.trim();
    if (!query) { renderSessions(); return; }
    archiveSearchDebounce = setTimeout(() => renderSearchResults(searchArchiveData(query)), 300);
  });

  // Category filter bar
  document.getElementById('filterBar').addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeFilter = btn.dataset.cat;
    const query = document.getElementById('archiveSearch').value.trim();
    if (query) {
      renderSearchResults(searchArchiveData(query));
    } else {
      renderSessions();
    }
  });

});
