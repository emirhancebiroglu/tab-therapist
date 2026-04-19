---
title: "Kavram: Canvas API"
created: 2026-04-19
updated: 2026-04-19
source: raw/docs/TabTherapist_Project_Plan.md
tags: [canvas-api, görsel-üretim, skor-kartı, istemci-tarafı]
---

# Kavram: Canvas API

## Tanım

Canvas API, HTML5 tarayıcılarında JavaScript ile piksel düzeyinde 2D grafik çizmeyi sağlayan bir tarayıcı API'sidir. Sunucu gerektirmeden tamamen istemci tarafında görsel üretimi mümkün kılar.

**Kaynak:** [[sources/docs/TabTherapist_Project_Plan]] — Bölüm 4 (Tech Stack) ve Bölüm 6 (ADIM 6)

---

## TabTherapist'teki Kullanım Amacı

TabTherapist, kullanıcının Tab Hoarding Score'unu ve istatistiklerini içeren **1080×1080px skor kartını** Canvas API ile üretir. Bu görsel sosyal medyada paylaşılabilir bir PNG dosyasına dönüştürülür.

**Tercih sebebi:** Sunucu tarafı render (Puppeteer, screenshot API vb.) hem maliyet yaratır hem gizlilik riski taşır. Canvas ile aynı iş sıfır maliyetle tarayıcıda yapılır.

---

## Skor Kartı Render Akışı

```
scorecard.html yüklenir
    ↓
scorecard.js: chrome.storage'dan veri çek
    ↓
<canvas id="scorecard" width="1080" height="1080">
    ↓
ctx.fillRect(...)     → gradient arka plan
ctx.drawImage(...)    → logo
ctx.fillText(...)     → skor sayısı (büyük serif font)
ctx.fillText(...)     → kişilik tipi
ctx.fillText(...)     → 3-4 highlight istatistik
ctx.fillText(...)     → "tabtherapist.dev" watermark
    ↓
canvas.toDataURL("image/png") → PNG data URL
    ↓
<a download="my-score.png"> → İndirme butonu
```

---

## Teknik Notlar

| Özellik | Değer |
|---------|-------|
| Boyut | 1080×1080px (sosyal medya standardı) |
| Format | PNG (kayıpsız, şeffaflık destekli) |
| Font | Custom woff2 fontlar `assets/fonts/` içinde |
| Dışa aktarım | `canvas.toDataURL("image/png")` → data URL |
| Paylaşım | X ve LinkedIn için query string'li URL oluşturulur |

### Önemli Kısıt: CORS ve Fontlar
Canvas'ta cross-origin kaynak kullanılırsa `toDataURL()` "tainted canvas" hatası verir ve çalışmaz. Bu nedenle tüm fontlar ve görseller extension paketi içinde (`assets/`) bulunmalıdır.

---

## Bağlantılı Sayfalar

- [[decisions/sharecard-canvas]] — Canvas API seçim kararı
- [[decisions/client-side-only]] — Sunucu kullanmama kararı
- [[concepts/retro-therapist-design]] — Skor kartı tasarım detayları
- [[sources/docs/TabTherapist_Project_Plan]] — Kaynak belge
