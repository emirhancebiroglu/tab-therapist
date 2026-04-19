---
title: "Karar: Skor Kartı Görseli için Canvas API"
created: 2026-04-19
updated: 2026-04-19
source: raw/docs/TabTherapist_Project_Plan.md
tags: [karar, canvas-api, skor-kartı, görsel-üretim, paylaşım]
---

# Karar: Skor Kartı Görseli için Canvas API

## Karar

Paylaşılabilir skor kartı görseli (1080×1080px PNG) sunucu tarafı render yerine tarayıcı Canvas API ile üretilecektir.

**Kaynak:** [[sources/docs/TabTherapist_Project_Plan]] — Bölüm 3.3 ve ADIM 6

---

## Gerekçe

### Alternatifler

| Yaklaşım | Nasıl Çalışır | Neden Reddedildi |
|----------|--------------|-----------------|
| Sunucu render (Puppeteer) | Screenshot servisi, bulut fonksiyon | API maliyeti yaratır, sunucu gerektirir |
| Screenshot API (3. taraf) | Externalapi.com, htmlcsstoimage vb. | API maliyeti, gizlilik riski, dış bağımlılık |
| CSS/HTML print | `window.print()` veya html2canvas | Tutarsız render, tarayıcı bağımlı |
| **Canvas API** | Tarayıcı 2D context, `toDataURL()` | ✓ Ücretsiz, hızlı, tutarlı, gizlilik korunur |

### Canvas'ın Avantajları
1. **Sıfır maliyet:** Tarayıcı API'si, ek servis yok
2. **Gizlilik:** Kullanıcı verisi hiçbir yere gönderilmez
3. **Deterministik:** Her render aynı sonucu verir
4. **Özelleştirme:** Piksel düzeyinde kontrol, tam brand uyumu
5. **Offline:** İnternet bağlantısı gerektirmez

---

## Uygulama

Canvas render `scorecard/scorecard.js` içinde gerçekleşir:

```javascript
const canvas = document.getElementById('scorecard');
const ctx = canvas.getContext('2d');
canvas.width = 1080;
canvas.height = 1080;

// Gradient arka plan
const gradient = ctx.createLinearGradient(0, 0, 1080, 1080);
gradient.addColorStop(0, '#1a1a2e');
gradient.addColorStop(1, '#16213e');
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, 1080, 1080);

// Skor, kişilik tipi, istatistikler...
// Logo, watermark...

// PNG dışa aktarım
const dataURL = canvas.toDataURL('image/png');
```

### CORS Uyarısı
Canvas'a cross-origin kaynak yüklenirse `toDataURL()` "SecurityError: Tainted canvases may not be exported" hatası verir. Bu nedenle tüm fontlar ve görseller extension paketi içinde (`assets/`) olmalıdır.

---

## Paylaşım Akışı

1. Kullanıcı "Skor Kartı Oluştur" butonuna tıklar
2. `scorecard.html` yeni sekmede açılır
3. Canvas render edilir (~50ms)
4. "İndir" butonu: `<a href={dataURL} download="tab-score.png">`
5. "X'de Paylaş": `https://twitter.com/intent/tweet?text=...`
6. "LinkedIn'de Paylaş": `https://linkedin.com/shareArticle?...`

---

## Bağlantılı Sayfalar

- [[concepts/canvas-api]] — Canvas API'nin detaylı açıklaması
- [[decisions/client-side-only]] — Sunucu kullanmama kararı
- [[concepts/retro-therapist-design]] — Skor kartı tasarım detayları
- [[sources/docs/TabTherapist_Project_Plan]] — Kaynak belge
