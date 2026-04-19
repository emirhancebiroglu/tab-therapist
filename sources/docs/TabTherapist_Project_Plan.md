---
title: "Kaynak Özeti: TabTherapist Proje Planı"
created: 2026-04-19
updated: 2026-04-19
source: raw/docs/TabTherapist_Project_Plan.md
tags: [proje-planı, chrome-extension, mvp, kaynak-özeti]
---

# Kaynak Özeti: TabTherapist Proje Planı

## Metadata

| Alan | Değer |
|------|-------|
| Dosya | `raw/docs/TabTherapist_Project_Plan.md` |
| Satır sayısı | 484 |
| Dil | Türkçe |
| Ingest tarihi | 2026-04-19 |
| Kapsam | Tam proje planı (rekabet → launch) |

---

## Proje Özeti

**TabTherapist**, tarayıcı sekme alışkanlıklarını analiz eden bir Chrome Extension'dır. Tagline: *"Your browser tabs need therapy. So do you."*

- **Tür:** Chrome Extension (Manifest V3)
- **Hedef kitle:** Developer'lar, bilgi işçileri, tab hoarder'lar
- **Viral mekanizma:** Spotify Wrapped tarzı paylaşılabilir skor kartı
- **Farklılaşma:** Mevcut hiçbir araç tab alışkanlıklarını skor olarak ölçmüyor ve paylaşılabilir görsel üretmiyor

---

## Bölüm Özetleri

### 1. Rekabet Analizi (15 rakip)

Piyasadaki araçlar 3 kategoriye ayrılıyor:
- **Tab Saver/Session Manager:** OneTab, Session Buddy, TabGroup Vault — kaydet/geri yükle, analiz yok
- **Tab Organizer/Workspace:** Workona, Toby, Tab Manager Plus — gruplandırma, ücretli veya ağır
- **Focus/Productivity:** Tab Wrangler, The Marvellous Suspender — RAM/dikkat araçları

**Pazar boşluğu:** Hiçbir araç tab'ları skor olarak ölçmüyor, kişilik tipi çıkarmıyor, paylaşılabilir görsel üretmiyor veya davranışı eğlenceli anlatmıyor.

### 2. Özellik Seti

**v1.0 MVP:**
- Tab Analytics Dashboard (açık sekme sayısı, domain dağılımı, yaş analizi, RAM tahmini)
- Tab Hoarding Score (0-100) + 5 kişilik tipi
- Paylaşılabilir skor kartı (Canvas → PNG)
- Temel aksiyonlar (eski sekme kapat, duplicate birleştir, arşivle)

**v1.1:** Haftalık rapor, aspirational tab tespiti, streaks, karanlık tema  
**v2.0:** Trend grafikleri, Tab Wrapped, Firefox desteği

### 3. Tech Stack

Vanilla JS + Chrome Manifest V3 + Canvas API. Framework yok, sıfır bağımlılık.
Dosya yapısı: `manifest.json`, `background/service-worker.js`, `popup/`, `scorecard/`, `utils/`, `assets/`

Detay: → [[concepts/manifest-v3]], [[concepts/canvas-api]], [[decisions/vanilla-js-no-framework]]

### 4. Tasarım

"Retro-Terapist" estetiği. Koyu lacivert zemin, amber vurgular, krem metin.
Popup: 380×500px. Skor kartı: 1080×1080px.
Detay: → [[concepts/retro-therapist-design]]

### 5. Implementasyon

10 adım, toplam ~12-15 saat:
1. İskelet & Manifest (30 dk)
2. Tab veri toplama (1 saat)
3. Skor algoritması (1 saat)
4. Dashboard UI (2-3 saat)
5. Aksiyonlar (1-2 saat)
6. Skor kartı / Canvas (2 saat)
7. Polish (1-2 saat)
8. Test (1 saat)
9. GitHub & Docs (1 saat)
10. İçerik & Lansman (1 saat)

### 6. Test Planı

- Birim: skor algoritması, domain parse, duplicate tespiti
- Entegrasyon: tab açma/kapama → dashboard güncelleme, storage döngüsü, Canvas render
- Manuel: edge case'ler (0 sekme, 500+ sekme, incognito, duplicate, 30 günlük eski sekme)

### 7. İçerik Stratejisi

GitHub README, X thread taslağı, LinkedIn post taslağı hazır. "Senin skorun kaç?" CTA ile viral mekanizma tetikleniyor.

### 8. Başarı Kriterleri

- Extension Chrome'da çalışıyor
- Skor tutarlı ve anlamlı
- Skor kartı paylaşılabilir
- GitHub repo profesyonel
- 1 sosyal medya içeriği yayınlandı
- Hedef: 50 GitHub star

---

## Çıkarılan Kavramlar

- [[concepts/manifest-v3]] — Chrome Extension Manifest V3
- [[concepts/canvas-api]] — Canvas API ile skor kartı üretimi
- [[concepts/tab-hoarding-score]] — Skor algoritması ve kişilik tipleri
- [[concepts/retro-therapist-design]] — Tasarım dili ve renk paleti
- [[concepts/tab-analytics]] — Dashboard metrikleri

## Çıkarılan Kararlar

- [[decisions/vanilla-js-no-framework]] — Framework reddi
- [[decisions/manifest-v3-architecture]] — MV3 mimarisi
- [[decisions/client-side-only]] — Sunucu yok kararı
- [[decisions/sharecard-canvas]] — Canvas API ile görsel üretimi
