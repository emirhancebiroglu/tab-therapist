---
title: "Kavram: Retro-Terapist Tasarım Dili"
created: 2026-04-19
updated: 2026-04-19
source: raw/docs/TabTherapist_Project_Plan.md
tags: [tasarım, renk-paleti, ui, skor-kartı, tipografi]
---

# Kavram: Retro-Terapist Tasarım Dili

## Tanım

TabTherapist'in görsel kimliği "Retro-Terapist" estetiği üzerine kuruludur: nostaljik psikolog ofisi teması, mizahi ama kaliteli bir his, warm tonlar.

**Kaynak:** [[sources/docs/TabTherapist_Project_Plan]] — Bölüm 5 (Tasarım & Tema)

---

## Renk Paleti

```css
--bg-primary:    #1a1a2e;   /* Koyu lacivert — ana zemin */
--bg-secondary:  #16213e;   /* Koyu mavi — kart zemin */
--accent-warm:   #e2b714;   /* Amber/altın — vurgular */
--accent-danger: #ff6b6b;   /* Kırmızı — uyarı mesajları */
--accent-calm:   #4ecdc4;   /* Turkuaz — olumlu geri bildirim */
--text-primary:  #eee8d5;   /* Krem — ana metin */
--text-muted:    #8892b0;   /* Gri-mavi — ikincil metin */
```

> Not: Proje planı Bölüm 5'te ayrıca "warm tonlar: koyu yeşil, krem, amber, kahverengi aksan" ifadesinden bahsedilmektedir. Bu tanım renk paletiyle çelişiyor gibi görünebilir (planda koyu lacivert baskın); "warm tonlar" ifadesi genel atmosfer tanımı olarak değerlendirilmeli, kesin değerler CSS değişkenlerinde.

---

## Tipografi

- **Başlıklar:** Serif font — "terapist not defteri" hissi
- **İstatistikler:** Monospace font — sayısal veri okuma kolaylığı
- Font dosyaları: `assets/fonts/` içinde `.woff2` formatında paketlenir (Canvas API'nin CORS kısıtları nedeniyle)

---

## Boyutlar

### Popup
- Genişlik: **380px**
- Yükseklik: **500px** (scrollable)
- Layout: Header + Skor Dairesi + Stat Kartları + Aksiyon Butonları

### Skor Kartı (Canvas)
- Boyut: **1080×1080px** — sosyal medya optimum kare formatı
- İçerik: Logo + Skor dairesi + 3-4 highlight istatistik + watermark (`tabtherapist.dev`)
- Arka plan: Gradient (CSS değil, Canvas `createLinearGradient`)

---

## UI Bileşenleri

| Bileşen | Açıklama |
|---------|----------|
| Skor dairesi | Animasyonlu daire gösterge (0'dan hedefe) |
| Stat kartları | Domain başına sekme sayısı, yaş, duplicate |
| Aksiyon butonları | "Close Ancient Tabs", "Merge Duplicates", "Archive" |
| Kişilik tipi etiketi | Skor aralığına göre renk kodlu badge |
| Onay dialogu | Kazara kapatmayı önlemek için confirm modal |

---

## Tasarım Felsefesi

Mevcut tab araçları "dişçi" gibi — gerekli ama sıkıcı. TabTherapist "kişilik testi" gibi tasarlanmıştır: ciddi bir araç ihtiyacı yoktur ama herkes yapar ve paylaşır. Görsel dil bu felsefey destekler: koyu ve sofistike arka plan, mizahi metin tonu, paylaşmaya değer skor kartı.

---

## Bağlantılı Sayfalar

- [[concepts/canvas-api]] — Skor kartı render mekanizması
- [[decisions/sharecard-canvas]] — Canvas seçim kararı
- [[sources/docs/TabTherapist_Project_Plan]] — Kaynak belge
