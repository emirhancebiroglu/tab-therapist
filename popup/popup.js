// TabTherapist Popup Script

const CIRCUMFERENCE = 327; // 2π × 52

const PERSONALITY_TYPE_MAP = {
  'Zen Master':      'zen',
  'Casual Browser':  'casual',
  'Tab Enthusiast':  'enthusiast',
  'Digital Hoarder': 'hoarder',
  'Tab Apocalypse':  'apocalypse',
};

let currentStats = null;

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
    const progress = elapsed / duration;
    // ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(eased * targetScore);

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

function renderStats(data) {
  document.getElementById('statTabs').textContent      = data.totalTabs      ?? '--';
  document.getElementById('statWindows').textContent   = data.totalWindows   ?? '--';
  document.getElementById('statDuplicates').textContent = data.duplicateCount ?? '--';

  const badge = document.getElementById('personalityBadge');
  const label = document.getElementById('personalityLabel');
  label.textContent = data.personality ?? 'Bilinmiyor';
  badge.dataset.type = PERSONALITY_TYPE_MAP[data.personality] ?? '';

  animateScore(data.score ?? 0);
}

function renderError() {
  document.getElementById('scoreValue').textContent     = '?';
  document.getElementById('personalityLabel').textContent = 'Veri alınamadı';
  document.getElementById('statTabs').textContent       = '--';
  document.getElementById('statWindows').textContent    = '--';
  document.getElementById('statDuplicates').textContent = '--';
}

document.addEventListener('DOMContentLoaded', () => {
  chrome.runtime.sendMessage({ type: 'GET_TAB_STATS' }, (response) => {
    if (chrome.runtime.lastError || !response) { renderError(); return; }
    currentStats = response;
    renderStats(response);
  });

  document.getElementById('shareBtn').addEventListener('click', () => {
    chrome.tabs.create({ url: 'scorecard/scorecard.html' });
  });

  document.getElementById('btnCloseAncient').addEventListener('click', () => {
    openModal('3 günden eski sekmeler kapatılacak. Emin misin?', () => {
      chrome.runtime.sendMessage({ type: 'CLOSE_ANCIENT_TABS' }, refreshStats);
    });
  });

  document.getElementById('btnMergeDuplicates').addEventListener('click', () => {
    const count = currentStats?.duplicateCount ?? '?';
    openModal(`${count} kopya sekme kapatılacak. Emin misin?`, () => {
      chrome.runtime.sendMessage({ type: 'MERGE_DUPLICATES' }, refreshStats);
    });
  });

  document.getElementById('btnArchive').addEventListener('click', () => {
    const count = currentStats ? currentStats.totalTabs - 1 : '?';
    openModal(`${count} sekme arşivlenip kapatılacak. Emin misin?`, () => {
      chrome.runtime.sendMessage({ type: 'ARCHIVE_AND_CLOSE' }, refreshStats);
    });
  });
});
