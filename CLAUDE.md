# TabTherapist Wiki — Şema ve Kurallar

## Amaç

Bu vault, **TabTherapist** projesi için kalıcı bilgi arşividir. TabTherapist; tarayıcı sekme alışkanlıklarını analiz edip paylaşılabilir skor kartı üreten bir Chrome Extension'dır (Manifest V3).

---

## Klasör Yapısı

```
tab-therapist/
├── CLAUDE.md           — Bu dosya: şema ve kurallar
├── index.md            — Tüm sayfaların içerik kataloğu
├── log.md              — Append-only işlem günlüğü
├── raw/                — IMMUTABLE: ham kaynaklar (kullanıcı ekler, LLM dokunmaz)
│   └── docs/
├── sources/            — raw/ altındaki her kaynak için özet sayfası
│   └── docs/
├── entities/           — Kişiler, ürünler, organizasyonlar
├── concepts/           — Soyut kavramlar, terimler, teknolojiler
├── decisions/          — Mimari ve tasarım kararları + gerekçe
├── issues/             — Açık sorular, çelişkiler, belirsizlikler
├── syntheses/          — Üst düzey sentezler, mimari belgeler
└── archive/            — Eskimiş sayfalar (silinmez, buraya taşınır)
```

---

## Sayfa Formatı

Her sayfa YAML frontmatter ile başlar:

```yaml
---
title: Sayfa başlığı
created: YYYY-MM-DD
updated: YYYY-MM-DD
source: raw/docs/DosyaAdı.md   # Kaynaksız iddia yasak
tags: [tag1, tag2]
---
```

Ardından `# Başlık` (H1) gelir.

---

## Proje Kısıtları (Teknik)

- **Vanilla JS** — Hiçbir framework (React, Vue, Angular) kullanılmaz
- **Framework yok** — Bağımlılık sıfır, bundle boyutu minimal
- **Dış API yasak** — API maliyeti doğuran servis çağrıları yapılmaz
- **Tamamen istemci tarafı** — Canvas API dahil her şey tarayıcıda çalışır
- **Manifest V3** — Service worker tabanlı, MV2 API'leri kullanılmaz
- **Chrome APIs:** `tabs`, `storage`, `alarms`

---

## Workflow: INGEST

Yeni bir kaynak eklendiğinde:
1. `raw/` altına kaynağı ekle (kullanıcı yapar)
2. `sources/<kategori>/<kaynak-adı>.md` — özet sayfası oluştur
3. Kavramlar → `concepts/` altına sayfa aç veya güncelle
4. Kararlar → `decisions/` altına sayfa aç veya güncelle
5. Varlıklar → `entities/` altına sayfa aç veya güncelle
6. `index.md` güncelle — yeni sayfaları listele
7. `log.md` güncelle — `[YYYY-MM-DD HH:MM] INGEST: <kaynak>` formatında

---

## Workflow: QUERY

Soru geldiğinde:
1. `index.md` üzerinden ilgili sayfaları bul
2. İlgili `concepts/`, `decisions/`, `sources/` sayfalarını oku
3. Yanıtı sentezle
4. İyi yanıtı `syntheses/` altına kaydet (kalıcı değer taşıyorsa)
5. `log.md` güncelle — `[YYYY-MM-DD] QUERY: <soru özeti>`

---

## Workflow: LINT

Periyodik sağlık kontrolü:
1. Tüm sayfalarda frontmatter eksiksiz mi?
2. `index.md` tüm sayfaları listeli mi?
3. Orphan sayfa var mı?
4. Kaynaksız iddia var mı?
5. Çelişkili bilgi var mı? (işaretle, silme)
6. Stale sayfa var mı? (güncelle veya arşivle)
7. Sonuçları `lint-report.md` olarak kaydet

---

## Hard Rules

1. **raw/ immutable** — Bu klasörü asla değiştirme, sadece kullanıcı ekler
2. **Kaynaksız iddia yasak** — Her claim'in `source:` alanı olmalı
3. **Çelişki işaretlenir, silinmez** — `> ⚠️ ÇELİŞKİ:` bloğu kullan
4. **Bidirectional link** — A sayfası B'ye bağlanıyorsa B de A'ya bağlanır
5. **Her işlem log'lanır** — `log.md` append-only'dir
6. **Şema birlikte evrilir** — Bu CLAUDE.md projeyle güncellenir
7. **Atomic sayfalar** — Her sayfa tek kavramı/kararı kapsar
8. **Arşivle, silme** — Eskimiş sayfalar `archive/` klasörüne taşınır

---

## Dil

Tüm içerik **Türkçe** yazılır. Teknik terimler (Canvas API, Manifest V3 vb.) İngilizce bırakılabilir.
