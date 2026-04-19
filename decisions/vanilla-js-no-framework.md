---
title: "Karar: Vanilla JS — Framework Kullanılmayacak"
created: 2026-04-19
updated: 2026-04-19
source: raw/docs/TabTherapist_Project_Plan.md
tags: [karar, vanilla-js, mimari, bağımlılık, performans]
---

# Karar: Vanilla JS — Framework Kullanılmayacak

## Karar

TabTherapist'te React, Vue, Angular veya başka herhangi bir JS framework/kütüphane kullanılmayacaktır. Tüm UI ve mantık saf (vanilla) JavaScript ile yazılacaktır.

**Kaynak:** [[sources/docs/TabTherapist_Project_Plan]] — Bölüm 4 (Neden Framework Yok?)

---

## Gerekçe

Proje planında açıkça belirtilen dört sebep:

1. **Hız:** Chrome extension popup'ları küçük ve hızlı olmalıdır. Framework yükleme maliyeti bu bağlamda kabul edilemez.
2. **Gereksiz overhead:** React/Vue'nun reconciliation, virtual DOM vb. mekanizmaları bu ölçekte bir UI için overkill'dir.
3. **Bundle boyutu:** Sıfır bağımlılık = küçük paket = Chrome Web Store review süreci daha kısa.
4. **Bağımlılık riski:** Npm bağımlılıkları güvenlik riskleri taşır ve güncelleme yükü yaratır.

---

## Etkilenen Alanlar

- `popup/popup.js` — DOM manipülasyonu vanilla JS ile yapılır
- `scorecard/scorecard.js` — Canvas render vanilla JS ile yapılır
- `utils/analyzer.js` — Pure fonksiyonlar, framework yok
- `utils/storage.js` — Chrome storage wrapper, vanilla
- `background/service-worker.js` — Service worker; zaten framework desteklemez

---

## Alternatifler ve Neden Reddedildi

| Alternatif | Neden Reddedildi |
|------------|-----------------|
| React | Bundle boyutu (~40KB min+gzip), gereksiz karmaşıklık |
| Vue | React'a benzer overhead, popup için fazla |
| Preact | Daha hafif ama yine bağımlılık; gereksiz |
| Svelte | Compile-time framework, proje ölçeği için overkill |
| jQuery | Eski yaklaşım, modern DOM API'leri yeterli |

---

## Bağlantılı Sayfalar

- [[decisions/client-side-only]] — Genel "dış servis yok" kararı
- [[concepts/manifest-v3]] — Service worker zaten framework gerektirmez
- [[sources/docs/TabTherapist_Project_Plan]] — Kaynak belge
