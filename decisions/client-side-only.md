---
title: "Karar: Tamamen İstemci Tarafı — Sunucu Yok"
created: 2026-04-19
updated: 2026-04-19
source: raw/docs/TabTherapist_Project_Plan.md
tags: [karar, istemci-tarafı, gizlilik, maliyet, dış-api]
---

# Karar: Tamamen İstemci Tarafı — Sunucu Yok

## Karar

TabTherapist hiçbir sunucu, backend API veya dış servis çağrısı kullanmayacaktır. Tüm veri işleme, skor hesaplama ve görsel üretim kullanıcının tarayıcısında gerçekleşecektir.

**Kaynak:** [[sources/docs/TabTherapist_Project_Plan]] — Bölüm 4 (Tech Stack) ve proje kısıtları

---

## Gerekçe

### 1. Gizlilik
Kullanıcının hangi sekmeleri açtığı hassas bilgidir. Bu veriyi sunucuya göndermek kullanıcı güvenini zedeler ve GDPR/KVKK kapsamında ek yükümlülükler doğurur.

### 2. Maliyet
Sunucu altyapısı işletim maliyeti yaratır. Açık kaynak bir side proje olarak bu maliyet sürdürülemezdir. Tamamen istemci tarafında çalışmak = sıfır işletim maliyeti.

### 3. Güvenilirlik
Sunucu bağımlılığı = tek hata noktası. İstemci tarafında çalışan extension sunucu çöktüğünde de çalışmaya devam eder.

### 4. Kompleksiyet
Backend eklentisi auth, rate limiting, deployment, monitoring gerektirir. Kapsam dışı.

---

## Etkilenen Özellikler

| Özellik | İstemci Tarafı Çözüm |
|---------|---------------------|
| Skor hesaplama | `utils/analyzer.js` — tarayıcıda |
| Veri saklama | `chrome.storage.local` — yerel |
| Skor kartı görsel üretimi | Canvas API — tarayıcıda |
| Paylaşım | Sosyal medya share URL'leri (query string) — sunucu render yok |
| Haftalık rapor (v1.1) | `chrome.alarms` + `chrome.notifications` |

---

## Kapsam Dışı Kalan Özellikler

Bu karar nedeniyle bazı özellikler kapsam dışına çıkmaktadır:

- Cihazlar arası senkronizasyon (`chrome.storage.sync` sınırlı ama mümkün — v2.0)
- Kullanıcı hesabı, kayıt, giriş
- Aggregated/anonim kullanım istatistikleri
- Sunucu tarafı görsel render (Puppeteer vb.)
- Push notification (tarayıcı dışı)

---

## Bağlantılı Sayfalar

- [[decisions/vanilla-js-no-framework]] — Framework kullanmama kararı
- [[decisions/sharecard-canvas]] — Sunucu yerine Canvas ile görsel üretimi
- [[concepts/manifest-v3]] — Extension'ın izin modeli
- [[sources/docs/TabTherapist_Project_Plan]] — Kaynak belge
