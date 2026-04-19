---
title: "Kavram: Tab Analytics Dashboard"
created: 2026-04-19
updated: 2026-04-19
source: raw/docs/TabTherapist_Project_Plan.md
tags: [dashboard, analytics, tab-veri, metrikler, popup]
---

# Kavram: Tab Analytics Dashboard

## Tanım

Tab Analytics Dashboard, TabTherapist popup'unun ana ekranıdır. Kullanıcının mevcut sekme durumunu anlık olarak gösterir ve Tab Hoarding Score'un hesaplandığı ham verileri sunar.

**Kaynak:** [[sources/docs/TabTherapist_Project_Plan]] — Bölüm 3.1 ve 6 (ADIM 2-4)

---

## Gösterilen Metrikler

| Metrik | Açıklama | Kaynak API |
|--------|----------|-----------|
| Toplam sekme sayısı | Tüm pencerelerdeki sekme toplamı | `chrome.tabs.query({})` |
| Pencere başına dağılım | Her Chrome penceresindeki sekme sayısı | `windowId` gruplandırma |
| Domain bazlı gruplandırma | Hangi siteden kaç sekme açık | URL → `hostname` parse |
| En eski sekme | En uzun süredir açık olan sekmenin yaşı | `chrome.storage`'dan ilk görülme zamanı |
| Tahmini RAM kullanımı | Sekme sayısı × ortalama MB (yaklaşık değer) | Sabit çarpan, gerçek RAM değil |

---

## Veri Toplama Mimarisi

```
chrome.tabs.onCreated → service-worker.js
    ↓
Tab ID + URL + timestamp → chrome.storage.local
    ↓
popup.js açılınca:
    chrome.tabs.query({}) → mevcut tüm sekmeler
    chrome.storage.local.get() → tarihsel veri (ilk açılış zamanları)
    ↓
utils/analyzer.js:
    Domain gruplandırma
    Yaş hesaplama (şimdiki zaman - ilk açılış)
    Duplicate tespiti
    Skor hesaplama
    ↓
popup.html'e render
```

---

## Veri Saklama

`chrome.storage.local` içinde tab meta verisi saklanır:

```json
{
  "tab_history": {
    "<tabId>": {
      "url": "https://example.com",
      "firstSeen": 1713484800000,
      "lastActive": 1713571200000
    }
  }
}
```

Tab kapandığında (`chrome.tabs.onRemoved`) kayıt silinir. Storage temizliği periyodik olarak yapılır (`chrome.alarms`).

---

## Popup Layout

```
┌─────────────────────────────┐
│  🛋️  TabTherapist           │
│  ─────────────────────────  │
│  [Skor Dairesi: 67]         │
│  "Digital Hoarder"          │
│  ─────────────────────────  │
│  📊 42 sekme  |  3 pencere  │
│  🕐 En eski: 14 gün önce   │
│  🔁 5 duplicate             │
│  ─────────────────────────  │
│  Domain Listesi:            │
│  github.com ████████ 12     │
│  stackoverflow.com ████ 7   │
│  ─────────────────────────  │
│  [Skor Kartı Oluştur]       │
│  [Eski Sekmeleri Kapat]     │
└─────────────────────────────┘
```

---

## Bağlantılı Sayfalar

- [[concepts/tab-hoarding-score]] — Dashboard verilerinden üretilen skor
- [[concepts/manifest-v3]] — Veri toplamayı sağlayan service worker
- [[syntheses/architecture]] — Mimari içindeki yeri
- [[sources/docs/TabTherapist_Project_Plan]] — Kaynak belge
