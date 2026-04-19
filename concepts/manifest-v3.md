---
title: "Kavram: Chrome Extension Manifest V3"
created: 2026-04-19
updated: 2026-04-19
source: raw/docs/TabTherapist_Project_Plan.md
tags: [chrome-extension, manifest-v3, service-worker, mimari]
---

# Kavram: Chrome Extension Manifest V3

## Tanım

Manifest V3 (MV3), Chrome uzantıları için 2020'den itibaren zorunlu hale gelen mimari versiyondur. MV2'nin güvenlik ve performans sorunlarını çözmek için tasarlanmıştır.

**Kaynak:** [[sources/docs/TabTherapist_Project_Plan]] — Bölüm 4 (Tech Stack)

---

## MV3'ün Temel Özellikleri

### Service Worker (Background Script)
- MV2'deki kalıcı `background page` yerine **service worker** kullanılır
- Service worker'lar gerektiğinde uyanır, iş bitince uyur (bellek tasarrufu)
- Kalıcı state **service worker içinde saklanamaz** — `chrome.storage` kullanılmalıdır
- TabTherapist'te: `background/service-worker.js` tab event'lerini dinler, veriyi `chrome.storage.local`'a yazar

### Güvenlik Kısıtları
- `eval()` ve dinamik kod yürütme yasak
- Remote code loading yasak (tüm JS pakette olmalı)
- `content_security_policy` daha katı

### İzin Modeli
- TabTherapist'in kullandığı izinler:
  - `tabs` — sekme bilgisine erişim (URL, başlık, pencere ID)
  - `storage` — `chrome.storage.local` ile kalıcı veri saklama
  - `alarms` — periyodik görevler (v1.1 haftalık rapor için)

### MV2'den Farklar (Önemli)

| Özellik | MV2 | MV3 |
|---------|-----|-----|
| Background | Kalıcı sayfa | Service Worker (uyu/uyan) |
| State tutma | Değişkenlerde | `chrome.storage` |
| Remote JS | İzin verilebilir | Yasak |
| `webRequest` | Blocking | Non-blocking (deklaratif) |
| Manifest zorunluluğu | Opsiyonel | 2024'ten itibaren Chrome zorunlu kıldı |

---

## TabTherapist'te Kullanım

```
manifest.json
├── "manifest_version": 3
├── "background": { "service_worker": "background/service-worker.js" }
├── "permissions": ["tabs", "storage", "alarms"]
└── "action": { "default_popup": "popup/popup.html" }
```

Service worker `chrome.tabs.onCreated`, `chrome.tabs.onRemoved`, `chrome.tabs.onActivated` event'lerini dinleyerek sekme verilerini toplar ve `chrome.storage.local`'a yazar.

---

## Mimari Kısıtlar

- **Service worker yaşam döngüsü:** 30 saniye idle'dan sonra uyuyabilir. Uzun süren işlemler `chrome.alarms` ile tetiklenmeli.
- **Storage sınırı:** `chrome.storage.local` maksimum 10 MB (QUOTA_BYTES)
- **Senkron storage yok:** Tüm storage işlemleri async/await ile yapılır

---

## Bağlantılı Sayfalar

- [[decisions/manifest-v3-architecture]] — MV3 seçim kararı ve gerekçesi
- [[decisions/client-side-only]] — Sunucu kullanmama kararı
- [[sources/docs/TabTherapist_Project_Plan]] — Kaynak belge
