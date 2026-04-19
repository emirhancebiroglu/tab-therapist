---
title: İşlem Günlüğü
---

# İşlem Günlüğü

<!-- Append-only. Yeni kayıtlar en alta eklenir. -->

---

[2026-04-19 00:00] SETUP: Vault yapısı oluşturuldu. Klasörler: sources/docs/, entities/, concepts/, decisions/, issues/, syntheses/, archive/. İskelet dosyalar: CLAUDE.md, index.md, log.md.

[2026-04-19 00:01] INGEST: raw/docs/TabTherapist_Project_Plan.md — 484 satır, Türkçe proje planı işlendi.
  - Oluşturulan: sources/docs/TabTherapist_Project_Plan.md
  - Oluşturulan: concepts/manifest-v3.md
  - Oluşturulan: concepts/canvas-api.md
  - Oluşturulan: concepts/tab-hoarding-score.md
  - Oluşturulan: concepts/retro-therapist-design.md
  - Oluşturulan: concepts/tab-analytics.md
  - Oluşturulan: decisions/vanilla-js-no-framework.md
  - Oluşturulan: decisions/manifest-v3-architecture.md
  - Oluşturulan: decisions/client-side-only.md
  - Oluşturulan: decisions/sharecard-canvas.md

[2026-04-19 00:02] SYNTHESIS: syntheses/architecture.md oluşturuldu — v1.0 MVP teknik stack ve dosya ağacı.

[2026-04-19 00:03] LINT: lint-report.md oluşturuldu — ilk geçiş raporu.

[2026-04-19 10:45] ADIM 1: İskelet & Manifest kodlandı
  - Oluşturulan: manifest.json (MV3 standardı, tabs + storage + alarms izinleri)
  - Oluşturulan: background/service-worker.js (Tab event dinleyicileri)
  - Oluşturulan: popup/popup.html (380×500px dashboard UI)
  - Oluşturulan: popup/popup.css (CSS custom properties, tema sistemi)
  - Oluşturulan: popup/popup.js (Popup mantığı, Service Worker bağlantısı)
  - Oluşturulan: utils/analyzer.js (Skor algoritması placeholder)
  - Oluşturulan: utils/storage.js (chrome.storage.local async wrapper)
  - Oluşturulan: utils/constants.js (Eşik değerler, kişilik tipi aralıkları)

[2026-04-19 11:30] BUGFIX: "Could not load icon" hatası düzeltildi
  - Düzenlendi: manifest.json — icon tanımları kaldırıldı (geçici çözüm)
  - Oluşturulan: issues/missing-icons.md — ikonlar tasarlanana kadar issue sayfası

[2026-04-19 12:00] ADIM 2: Tab Veri Toplama kodlandı
  - Güncellendi: background/service-worker.js — collectTabStats() + findDuplicateTabs() + storage event handler'ları
  - Güncellendi: utils/analyzer.js — findDuplicateTabs() fonksiyonu (popup için), calculateTabHoardingScore() placeholder korundu

[2026-04-19 13:00] ADIM 3: Skor Algoritması kodlandı
  - Güncellendi: utils/analyzer.js — calculateHoardingScore(stats) ve getPersonalityType(score) fonksiyonları eklendi
  - Güncellendi: background/service-worker.js — collectTabStats() sonuna skor hesaplaması ve konsol çıktısı entegre edildi
