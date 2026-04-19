---
title: "Kavram: Tab Hoarding Score"
created: 2026-04-19
updated: 2026-04-19
source: raw/docs/TabTherapist_Project_Plan.md
tags: [skor-algoritması, gamification, kişilik-tipi, tab-hoarding]
---

# Kavram: Tab Hoarding Score

## Tanım

Tab Hoarding Score (THS), kullanıcının tarayıcı sekme alışkanlıklarını **0-100** arasında ölçen ağırlıklı bir skorlama sistemidir. TabTherapist'in temel çıktısıdır ve paylaşılabilir skor kartının merkezinde yer alır.

**Kaynak:** [[sources/docs/TabTherapist_Project_Plan]] — Bölüm 3.2

---

## Skor Algoritması

Skor 6 metriğin ağırlıklı toplamından oluşur:

| Metrik | Ağırlık | Açıklama |
|--------|---------|----------|
| Toplam sekme sayısı | **%25** | Tüm pencerelerdeki sekme toplamı |
| Ortalama sekme yaşı | **%20** | Sekmelerin ilk açılıştan bu yana geçen süre ortalaması |
| Duplicate sekme oranı | **%15** | Aynı URL'li sekmelerin toplam sekmeye oranı |
| Aspirational tab sayısı | **%20** | 3+ gündür açık, hiç ziyaret edilmemiş sekmeler |
| Tek domain yoğunluğu | **%10** | Tek bir domain'den gelen sekmelerin oranı |
| Pencere sayısı | **%10** | Açık Chrome penceresi sayısı |

**Toplam: %100**

### Uygulama Notu

Algoritma `utils/analyzer.js` içinde implementedir. Her metrik 0-100 arasında normalize edilir, ardından ağırlıklı toplam hesaplanır. Eşik değerler `utils/constants.js`'de saklanır.

---

## Kişilik Tipleri

| Aralık | Tip | Açıklama |
|--------|-----|----------|
| 0–20 | **Zen Master** | Minimalist, disiplinli, sekme sayısını düşük tutar |
| 21–40 | **Casual Browser** | Normal kullanıcı, dengeli alışkanlıklar |
| 41–60 | **Tab Enthusiast** | Biraz fazla ama yönetilebilir |
| 61–80 | **Digital Hoarder** | Ciddi biriktirici, müdahale önerisi |
| 81–100 | **Tab Apocalypse** | Acil müdahale gerekli |

---

## Özel Kavramlar

### Aspirational Tab
3 veya daha fazla gündür açık olan ve bu süre içinde hiç aktif olarak ziyaret edilmemiş sekmeler. "Okuyacağım ama hiç okumadığım" sekmelerdir. Bu kavramın tespiti skor algoritmasında %20 ağırlık taşır.

### Insurance Policy Tab
Bir gün işe yarayabileceği düşüncesiyle kapatılamayan sekmeler (örneğin StackOverflow cevapları). v1.1'de ayrıca tespit edilecek.

---

## Gamification Mantığı

Tab Hoarding Score, Spotify Wrapped'in viral mekanizmasını benimsiyordu:
1. **Kişiselleştirme** — veriler senden gelir, sonuç sana özel
2. **Karşılaştırma** — "Senin skorun kaç?" organik yayılma sağlar
3. **Kimlik** — kişilik tipi paylaşılabilir bir etiket olur

---

## Bağlantılı Sayfalar

- [[concepts/tab-analytics]] — Altta yatan metrikler
- [[decisions/client-side-only]] — Sunucuda işleme yapılmama kararı
- [[syntheses/architecture]] — Algoritmanın dosya yapısındaki yeri
- [[sources/docs/TabTherapist_Project_Plan]] — Kaynak belge
