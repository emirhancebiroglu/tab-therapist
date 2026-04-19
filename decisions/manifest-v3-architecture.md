---
title: "Karar: Manifest V3 Mimarisi"
created: 2026-04-19
updated: 2026-04-19
source: raw/docs/TabTherapist_Project_Plan.md
tags: [karar, manifest-v3, service-worker, chrome-extension, mimari]
---

# Karar: Manifest V3 Mimarisi

## Karar

TabTherapist, Chrome Extension Manifest V3 (MV3) mimarisini kullanacaktır. Background context için kalıcı background page yerine service worker kullanılacaktır.

**Kaynak:** [[sources/docs/TabTherapist_Project_Plan]] — Bölüm 4 (Tech Stack)

---

## Gerekçe

### Zorunluluk
Chrome, 2024 itibarıyla yeni extension'lar için MV3'ü zorunlu kılmıştır. Mevcut MV2 extension'ları için de geçiş tarihleri duyurulmuştur. Bu bir tercih değil, zorunluluktur.

### Avantajlar
- **Güvenlik:** Remote code yükleme yasağı, `eval()` kısıtlaması sayesinde daha güvenli
- **Performans:** Service worker'lar idle'da uyur, kalıcı background page kadar bellek tüketmez
- **Store uyumu:** Chrome Web Store review süreci MV3 extension'larda daha hızlı

---

## Mimari Sonuçları

### Service Worker Kısıtları
Service worker'lar durumu bellekte tutamaz; uyanıp uyuyabilirler. Bu kısıtlar TabTherapist'i şöyle etkiler:

- Tab meta verileri (ilk açılış zamanı, son aktivite) service worker içinde değil, `chrome.storage.local`'da saklanır
- Uzun süreli işlemler (v1.1 haftalık rapor) `chrome.alarms` ile planlanır
- Popup açıldığında storage'dan okur, service worker'a bağlı kalmaz

### İzin Modeli
```json
"permissions": ["tabs", "storage", "alarms"]
```

- `tabs`: `chrome.tabs.query()`, `onCreated`, `onRemoved`, `onActivated` event'leri
- `storage`: `chrome.storage.local` okuma/yazma
- `alarms`: Periyodik haftalık rapor tetikleyici (v1.1)

### Dosya Yapısı
```
manifest.json
    "manifest_version": 3
    "background": { "service_worker": "background/service-worker.js" }
    "action": { "default_popup": "popup/popup.html" }
    "permissions": ["tabs", "storage", "alarms"]
```

---

## Dikkat Edilmesi Gereken Noktalar

- **30 saniye kural:** Service worker uzun idle'dan sonra uyuyabilir. Tab event'leri zaten event-driven olduğu için bu genelde sorun değil, ancak uzun senkron işlemler kaçınılmalıdır.
- **`chrome.storage.session`:** MV3 ile gelen yeni API; sekme oturumu boyunca geçici veri için kullanılabilir (v1.1'de değerlendirilebilir).

---

## Bağlantılı Sayfalar

- [[concepts/manifest-v3]] — MV3 kavramının detayları
- [[decisions/client-side-only]] — Sunucu kullanmama kararı
- [[syntheses/architecture]] — Tam mimari
- [[sources/docs/TabTherapist_Project_Plan]] — Kaynak belge
