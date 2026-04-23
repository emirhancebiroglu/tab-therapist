// TabTherapist — Skor Kartı Canvas Renderer

const W = 1080;
const H = 1080;

function loadData(callback) {
  chrome.runtime.sendMessage({ type: 'GET_TAB_STATS' }, (statsResponse) => {
    if (chrome.runtime.lastError || !statsResponse) {
      statsResponse = { score: 0, personality: 'Bilinmiyor', totalTabs: 0, totalWindows: 0, duplicateCount: 0 };
    }
    chrome.storage.local.get('tab_history', ({ tab_history }) => {
      const now = Date.now();
      const values = Object.values(tab_history || {});
      const oldestDays = values.length > 0
        ? Math.max(...values.map(t => Math.floor((now - (t.firstSeen || now)) / 86400000)))
        : 0;
      callback(statsResponse, oldestDays);
    });
  });
}

function drawCard(ctx, data, oldestDays) {
  const score       = data.score        ?? 0;
  const personality = data.personality  ?? 'Bilinmiyor';
  const totalTabs   = data.totalTabs    ?? 0;
  const totalWindows = data.totalWindows ?? 0;

  // 1. Background gradient
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, '#1a1a2e');
  grad.addColorStop(1, '#16213e');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // 2. Decorative border
  ctx.save();
  ctx.strokeStyle = 'rgba(226, 183, 20, 0.28)';
  ctx.lineWidth = 6;
  ctx.strokeRect(24, 24, W - 48, H - 48);
  ctx.restore();

  // 3. Header title
  ctx.textAlign = 'center';
  ctx.fillStyle = '#e2b714';
  ctx.font = 'bold 72px Georgia, serif';
  ctx.fillText('\uD83D\uDECB\uFE0F TabTherapist', W / 2, 118);

  // 4. Tagline
  ctx.fillStyle = '#8892b0';
  ctx.font = '28px "Courier New", monospace';
  ctx.fillText('Sekme Psikoloji Kliniği', W / 2, 162);

  // 5. Score circle track
  ctx.beginPath();
  ctx.arc(W / 2, 460, 200, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(226, 183, 20, 0.12)';
  ctx.lineWidth = 22;
  ctx.lineCap = 'butt';
  ctx.stroke();

  // 6. Score circle arc
  if (score > 0) {
    const startAngle = -Math.PI / 2;
    const endAngle   = startAngle + (Math.PI * 2 * score / 100);
    ctx.save();
    ctx.shadowColor = 'rgba(226, 183, 20, 0.55)';
    ctx.shadowBlur   = 22;
    ctx.beginPath();
    ctx.arc(W / 2, 460, 200, startAngle, endAngle);
    ctx.strokeStyle = '#e2b714';
    ctx.lineWidth   = 22;
    ctx.lineCap     = 'round';
    ctx.stroke();
    ctx.restore();
  }

  // 7. Score number
  ctx.fillStyle = '#e2b714';
  ctx.font = 'bold 140px Georgia, serif';
  ctx.fillText(String(score), W / 2, 508);

  // 8. "/100"
  ctx.fillStyle = '#8892b0';
  ctx.font = '44px "Courier New", monospace';
  ctx.fillText('/ 100', W / 2, 568);

  // 9. Personality type
  ctx.fillStyle = '#eee8d5';
  ctx.font = 'italic 44px Georgia, serif';
  ctx.fillText(personality, W / 2, 714);

  // 10. Separator line
  ctx.beginPath();
  ctx.moveTo(W / 2 - 280, 772);
  ctx.lineTo(W / 2 + 280, 772);
  ctx.strokeStyle = 'rgba(226, 183, 20, 0.38)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // 11. Stats
  const attentionFragment   = data.attentionFragment   ?? null;
  const insurancePolicyCount = data.insurancePolicy     ?? null;

  ctx.fillStyle = '#eee8d5';
  ctx.font = '30px "Courier New", monospace';
  ctx.fillText('\uD83D\uDCC1 Toplam Sekme: ' + totalTabs,   W / 2, 820);
  ctx.fillText('\uD83D\uDC65 Pencere: ' + totalWindows,     W / 2, 866);
  if (oldestDays > 0) {
    ctx.fillText('\u23F0 En Eski Sekme: ' + oldestDays + ' Gün', W / 2, 912);
  }
  if (attentionFragment !== null) {
    ctx.fillText('\uD83E\uDDE0 Dikkat Par\u00E7alanmas\u0131: %' + attentionFragment, W / 2, 958);
  }
  if (insurancePolicyCount !== null) {
    ctx.fillText('\uD83D\uDCCB Sigorta Poli\u00E7eleri: ' + insurancePolicyCount + ' adet', W / 2, 1004);
  }

  // 12. Watermark
  ctx.fillStyle = 'rgba(136, 146, 176, 0.45)';
  ctx.font = '22px "Courier New", monospace';
  ctx.fillText('tabtherapist.dev', W / 2, 1058);
}

function flashButton(btn, message) {
  const original = btn.textContent;
  btn.textContent = message;
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = original;
    btn.disabled = false;
  }, 2000);
}

function copyCanvasToClipboard(canvas) {
  return new Promise((resolve, reject) => {
    if (!navigator.clipboard || !window.ClipboardItem) {
      resolve(false);
      return;
    }
    canvas.toBlob(blob => {
      if (!blob) { resolve(false); return; }
      navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
        .then(() => resolve(true))
        .catch(() => resolve(false));
    }, 'image/png');
  });
}

function setupButtons(canvas, data) {
  document.getElementById('btnDownload').addEventListener('click', () => {
    const a = document.createElement('a');
    a.href     = canvas.toDataURL('image/png');
    a.download = 'tabtherapist-score-' + Date.now() + '.png';
    a.click();
  });

  document.getElementById('btnShareX').addEventListener('click', async () => {
    const btn         = document.getElementById('btnShareX');
    const score       = data.score       ?? 0;
    const personality = data.personality ?? 'Bilinmiyor';
    const text = 'TabTherapist skorum: ' + score + '/100 \uD83D\uDECB\uFE0F' +
      '\nKişilik Tipim: ' + personality +
      '\n\n(Görseli buraya yapıştır! Ctrl+V/Cmd+V)' +
      '\n\n#TabTherapist #TabHoarder';

    const copied = await copyCanvasToClipboard(canvas);
    if (copied) flashButton(btn, 'Görsel Kopyalandı!');
    window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent(text));
  });

  document.getElementById('btnShareLinkedIn').addEventListener('click', async () => {
    const btn         = document.getElementById('btnShareLinkedIn');
    const score       = data.score       ?? 0;
    const personality = data.personality ?? 'Bilinmiyor';
    const repoUrl = 'https://github.com/emirhancebiroglu/tab-therapist';
    const summary = 'TabTherapist skorum: ' + score + '/100 — Kişilik Tipim: ' + personality +
      ' | Skor kartı görselini aşağıya yapıştırabilirsiniz (Ctrl+V/Cmd+V). #TabTherapist';

    const copied = await copyCanvasToClipboard(canvas);
    if (copied) flashButton(btn, 'Görsel Kopyalandı!');
    window.open(
      'https://www.linkedin.com/shareArticle?mini=true' +
      '&url=' + encodeURIComponent(repoUrl) +
      '&title=' + encodeURIComponent('TabTherapist — Sekme Psikoloji Kliniği') +
      '&summary=' + encodeURIComponent(summary)
    );
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('shareCanvas');
  const ctx    = canvas.getContext('2d');

  loadData((data, oldestDays) => {
    drawCard(ctx, data, oldestDays);
    setupButtons(canvas, data);
  });
});
