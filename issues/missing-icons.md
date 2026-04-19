---
title: Eksik İkonlar
created: 2026-04-19
updated: 2026-04-19
source: manifest.json
tags: [icons, ui, manifest-v3]
status: closed
---

# Eksik İkonlar

## Problem

Chrome uzantısı yüklenirken hata:
> Could not load icon 'assets/icons/icon-16.png' specified in 'icons'

## Kök Neden

manifest.json içerisinde tanımlanan icon dosyaları (`icon-16.png`, `icon-48.png`, `icon-128.png`) mevcut değil. LLM statik görsel dosya üretemedği için ikonlar boş bırakıldı.

## Çözüm

1. Grafik tasarımcı tarafından şu sizes için PNG ikonlar tasarlanmalı:
   - `16px` × `16px` (toolbar display)
   - `48px` × `48px` (extensions page)
   - `128px` × `128px` (Chrome Web Store)

2. `assets/icons/` klasörü oluşturulmalı ve PNG dosyaları buraya konulmalı.

3. `manifest.json`'un `action.default_icon` ve root-level `icons` bloğu güncellenmelidir:
   ```json
   "icons": {
     "16": "assets/icons/icon-16.png",
     "48": "assets/icons/icon-48.png",
     "128": "assets/icons/icon-128.png"
   }
   ```

## İlgili Dosyalar

- [manifest.json](manifest.json) — Şu an icon tanımları kaldırılmış state

## Status

🟠 **Ertelenmiş** — Tasarım tamamlanana kadar icon tanımları devre dışı
