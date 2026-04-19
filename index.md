---
title: TabTherapist Wiki — İçerik Kataloğu
updated: 2026-04-19
---

# İçerik Kataloğu

> TabTherapist (Manifest V3 Chrome Extension) bilgi arşivi. Tüm sayfalar Türkçe, her sayfa YAML frontmatter içerir.

---

## Kaynaklar (`sources/`)

| Sayfa | Açıklama |
|-------|----------|
| [[sources/docs/TabTherapist_Project_Plan]] | Ana proje planı — rekabet analizi, özellik seti, tech stack, implementasyon adımları |

---

## Kavramlar (`concepts/`)

| Sayfa | Açıklama |
|-------|----------|
| [[concepts/manifest-v3]] | Chrome Extension Manifest V3 — service worker mimarisi, izin modeli, MV2 farkları |
| [[concepts/canvas-api]] | Canvas API — istemci tarafı 1080×1080px skor kartı üretimi |
| [[concepts/tab-hoarding-score]] | Tab Hoarding Score (0-100) — 6 metrikli ağırlıklı skor algoritması ve 5 kişilik tipi |
| [[concepts/retro-therapist-design]] | Retro-Terapist tasarım dili — renk paleti, tipografi, boyutlar |
| [[concepts/tab-analytics]] | Tab Analytics Dashboard — metrikler, veri toplama mimarisi, popup layout |

---

## Kararlar (`decisions/`)

| Sayfa | Karar Özeti |
|-------|-------------|
| [[decisions/vanilla-js-no-framework]] | Framework kullanılmıyor — hız, bundle boyutu, bağımlılık reddi |
| [[decisions/manifest-v3-architecture]] | MV3 zorunlu, service worker + `chrome.storage` mimarisi |
| [[decisions/client-side-only]] | Sunucu yok — gizlilik, sıfır maliyet, güvenilirlik |
| [[decisions/sharecard-canvas]] | Skor kartı görseli Canvas API ile üretilir — sunucu render reddi |

---

## Sentezler (`syntheses/`)

| Sayfa | Açıklama |
|-------|----------|
| [[syntheses/architecture]] | v1.0 MVP teknik stack, dosya ağacı, modül bağımlılıkları, mimari kısıtlar |

---

## Varlıklar (`entities/`)

*Henüz kayıt yok.*

---

## Sorunlar (`issues/`)

*Henüz kayıt yok.*

---

## Arşiv (`archive/`)

*Henüz arşivlenmiş sayfa yok.*

---

## İstatistikler

| Tür | Adet |
|-----|------|
| Kaynaklar | 1 |
| Kavramlar | 5 |
| Kararlar | 4 |
| Sentezler | 1 |
| Varlıklar | 0 |
| **Toplam sayfa** | **11** |

*Son güncelleme: 2026-04-19*
