---
title: "Sentez: TabTherapist v1.0 MVP Mimarisi"
created: 2026-04-19
updated: 2026-04-19
source: raw/docs/TabTherapist_Project_Plan.md
tags: [mimari, mvp, tech-stack, dosya-yapısı, sentez]
---

# Sentez: TabTherapist v1.0 MVP Mimarisi

## Genel Bakış

TabTherapist v1.0 MVP, **sıfır bağımlılıklı**, **tamamen istemci tarafı** çalışan bir Chrome Extension'dır. Manifest V3, Vanilla JS ve Canvas API üzerine kuruludur.

---

## Tech Stack

| Katman | Teknoloji | Gerekçe |
|--------|-----------|---------|
| Extension Altyapısı | Chrome Extension Manifest V3 | Chrome zorunluluğu |
| Background | Service Worker | MV3 standardı |
| UI | Vanilla JS + HTML + CSS | Framework yok, hız |
| Görsel Üretim | Canvas API | Sunucu maliyeti yok |
| Veri Saklama | `chrome.storage.local` | Yerel, gizli |
| Tema Sistemi | CSS Custom Properties | Dinamik tema altyapısı |
| Periyodik Görev | `chrome.alarms` | Service worker uyuma sorunu çözümü |
| Paket | Sıfır build adımı | Doğrudan dosyalar, npm yok |

---

## Dosya Ağacı

```
tab-therapist/               ← Extension kök dizini
├── manifest.json            ← Extension yapılandırması (MV3)
│
├── background/
│   └── service-worker.js    ← Tab event dinleyici, veri toplama
│                              chrome.tabs.on{Created,Removed,Activated}
│                              → chrome.storage.local'a yazar
│
├── popup/
│   ├── popup.html           ← Ana dashboard UI (380×500px)
│   ├── popup.css            ← Dashboard stilleri + CSS custom props
│   └── popup.js             ← Dashboard mantığı, storage okuma
│
├── scorecard/
│   ├── scorecard.html       ← Tam sayfa skor kartı (yeni sekme)
│   ├── scorecard.css        ← Skor kartı stilleri
│   └── scorecard.js        ← Canvas 1080×1080 render + PNG indirme
│
├── utils/
│   ├── analyzer.js          ← Skor hesaplama algoritması (6 metrik)
│   ├── storage.js           ← chrome.storage wrapper (async/await)
│   └── constants.js         ← Eşik değerler, kişilik tipi aralıkları
│
└── assets/
    ├── icons/               ← Extension ikonları: 16×16, 48×48, 128×128
    ├── fonts/               ← Custom woff2 fontlar (serif + monospace)
    └── images/              ← Skor kartı arka plan görselleri (opsiyonel)
```

---

## Modül Bağımlılık Grafiği

```
service-worker.js
    └── storage.js           (veri yaz)

popup.js
    ├── storage.js           (veri oku)
    ├── analyzer.js          (skor hesapla)
    └── constants.js         (eşik değerler)

scorecard.js
    ├── storage.js           (veri oku)
    ├── analyzer.js          (skor hesapla)
    └── constants.js         (kişilik tipleri)

analyzer.js
    └── constants.js         (ağırlıklar, eşikler)
```

---

## Veri Akışı

```
Chrome Tab Event
      ↓
service-worker.js
      ↓ chrome.storage.local.set()
chrome.storage.local
      ↓ chrome.storage.local.get()
popup.js / scorecard.js
      ↓
analyzer.js → Tab Hoarding Score (0-100)
      ↓
DOM render (popup) | Canvas render (scorecard)
      ↓
Kullanıcı → İndir / Paylaş
```

---

## İzin Listesi

```json
"permissions": ["tabs", "storage", "alarms"]
```

- `tabs` — Sekme bilgileri (URL, başlık, pencere ID)
- `storage` — `chrome.storage.local` (10MB limit)
- `alarms` — Periyodik görevler (v1.1 haftalık rapor)

**Dikkat:** `host_permissions` tanımlanmamıştır. Extension sekme URL'lerine `tabs` izniyle erişir, sayfaların DOM'una değil.

---

## Implementasyon Adımları (10 Aşama)

| # | Adım | Çıktı | Tahmini Süre |
|---|------|-------|-------------|
| 1 | İskelet & Manifest | Chrome'a yükleniyor | 30 dk |
| 2 | Tab Veri Toplama | Console'da tab verisi | 1 saat |
| 3 | Skor Algoritması | Skor + kişilik tipi | 1 saat |
| 4 | Dashboard UI | Görsel popup | 2-3 saat |
| 5 | Aksiyonlar | Tab yönetimi çalışıyor | 1-2 saat |
| 6 | Skor Kartı / Canvas | PNG indirilebiliyor | 2 saat |
| 7 | Polish | Animasyonlar, hover | 1-2 saat |
| 8 | Test | Edge case'ler kapsandı | 1 saat |
| 9 | GitHub & Docs | Profesyonel repo | 1 saat |
| 10 | İçerik & Lansman | Sosyal medyada yayında | 1 saat |
| **Toplam** | | | **~12-15 saat** |

---

## Mimari Kısıtlar ve Çözümler

| Kısıt | Etki | Çözüm |
|-------|------|-------|
| Service worker uyuyabilir | State kaybı | `chrome.storage.local` kullan |
| Storage 10MB limiti | Büyük geçmiş kesmesi | Eski kayıtları temizle (`chrome.alarms`) |
| Canvas CORS kısıtı | `toDataURL()` hatası | Tüm asset'ler pakette olmalı |
| MV3 remote code yasağı | Harici JS yüklenemez | Tüm JS pakette olmalı |
| Incognito sekmeleri | `tabs` izniyle erişilemez | Incognito sekmeleri filtrele |

---

## v1.1 ve v2.0 Uzantı Noktaları

- **v1.1:** `chrome.notifications` + `chrome.alarms` → haftalık rapor. `chrome.storage.session` → oturum verisi. Aspirational tab tespiti `analyzer.js`'e eklenti.
- **v2.0:** Firefox WebExtension API uyumlu rewrite (manifest farkları). `chrome.storage.sync` → cihazlar arası senkronizasyon.

---

## Bağlantılı Sayfalar

- [[concepts/manifest-v3]] — Service worker mimarisi
- [[concepts/canvas-api]] — Skor kartı render
- [[concepts/tab-hoarding-score]] — Skor algoritması detayları
- [[concepts/tab-analytics]] — Dashboard ve veri toplama
- [[decisions/vanilla-js-no-framework]] — Framework reddi
- [[decisions/manifest-v3-architecture]] — MV3 seçim kararı
- [[decisions/client-side-only]] — Sunucu yok kararı
- [[decisions/sharecard-canvas]] — Canvas seçim kararı
- [[sources/docs/TabTherapist_Project_Plan]] — Kaynak belge
