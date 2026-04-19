# TabTherapist — Proje Planı
### "Spotify Wrapped, ama tarayıcı sekmeleriniz için"

---

## 1. PROJE ÖZETİ

**Proje Adı:** TabTherapist  
**Tagline:** "Your browser tabs need therapy. So do you."  
**Repo:** `github.com/<username>/tab-therapist`  
**Tür:** Chrome Extension (Manifest V3)  
**Hedef Kitle:** Developer'lar, bilgi işçileri, tab hoarder'lar  
**Viral Mekanizma:** Spotify Wrapped tarzı paylaşılabilir skor kartı

---

## 2. REKABET ANALİZİ & FARK

### 2.1 Pazar Haritası — 15 rakip incelendi

Tüm mevcut tab extension'ları 3 kategoriye ayrılıyor:

**Kategori A: Tab Saver / Session Manager (Kaydet & Geri Yükle)**
| Araç | Kullanıcı | Ne Yapar | Eksik |
|---|---|---|---|
| OneTab | 2M+ | Tüm sekmeleri tek tıkla listeye çevir | Organizasyon yok, flat list |
| Session Buddy | 1M+ | Oturum kaydet/geri yükle | Cihazlar arası sync yok |
| TabGroup Vault | 2K+ | Chrome tab group'ları kaydet | Sadece group'lara odaklı, $29 Pro |
| Tabs Aside | 50K+ | Eski Edge "set aside" özelliği | Aktif tab yönetimi yok |
| Tabby Hoarder | Küçük | Tab'ları depola, sonra geri yükle | Basit, analiz yok |

**Kategori B: Tab Organizer / Workspace (Grupla & Düzenle)**
| Araç | Kullanıcı | Ne Yapar | Eksik |
|---|---|---|---|
| Workona | 500K+ | Proje bazlı workspace'ler | Aylık ücretli, ağır |
| Toby | 200K+ | New tab'ı koleksiyon panosuna çevir | Zorunlu new tab değişikliği |
| Tab Manager Plus | 300K+ | Grid görünüm, arama, duplicate bulma | Oturum kaydetmez |
| Cluster | 100K+ | Pencereler arası kuşbakışı görünüm | Session/group desteği yok |
| Tabs Outliner | 50K+ | Tree-style ağaç yapısı | UI eski, güncelleme yok |
| Tabli | 30K+ | Tüm pencereler arası hızlı geçiş | Basit, gruplandırma yok |

**Kategori C: Focus / Productivity (Odaklanma & Verimlilik)**
| Araç | Kullanıcı | Ne Yapar | Eksik |
|---|---|---|---|
| TabInsights | Yeni | Pomodoro + dikkat dağıtıcı site engelleme | Focus tool, tab analizi değil |
| Brain Saver | Yeni | Gamified site engelleme + streak | Site engelleme odaklı |
| Tab Wrangler | 200K+ | İnaktif sekmeleri otomatik kapat | Analiz yok, sadece otomatik kapatma |
| The Marvellous Suspender | 500K+ | İnaktif sekmeleri dondur, RAM kurtar | RAM aracı, tek iş |

**Chrome Native (2026):**
- Chrome 146: Vertical tab sidebar (Mart 2026) — artık extension gerektirmiyor
- Chrome 140: ML-based Memory Saver — inaktif sekmeleri akıllıca donduruyor
- Tab Groups: Sağ tık → gruba ekle (2020'den beri mevcut)

### 2.2 Pazar Boşluğu — Kimsenin Yapmadığı Şey

Araştırma sonucu net bir boşluk ortaya çıktı:

**Hiçbir araç şunları yapmıyor:**
1. Kullanıcının tab alışkanlıklarını **skor olarak ölçme** (0-100)
2. Tab davranışından **kişilik tipi çıkarma** (gamification)
3. **Paylaşılabilir görsel kart** üretme (Spotify Wrapped mekanizması)
4. Tab hoarding'i **mizahi/eğlenceli** bir dille anlatma
5. "Aspirational tab" veya "Insurance Policy tab" gibi **davranış kategorileri** tespiti

Mevcut araçlar → **"Sekmelerini düzenle"** (utility)
TabTherapist → **"Sekme alışkanlıklarını keşfet ve paylaş"** (insight + entertainment)

### 2.3 Spotify Wrapped Viral Mekanizması Analizi

Spotify Wrapped neden her yıl milyarlarca impression alıyor:
- **Kişiselleştirme:** Veriler senden geliyor, sonuç sana özel
- **Gamification:** Skor, yüzdelik dilim, kişilik tipi
- **Düşük sürtünme:** Paylaşmak tek tık, görsel hazır
- **Sosyal karşılaştırma:** "Senin skorun kaç?" etkisi
- **FOMO:** Herkes paylaşınca sen de paylaşmak istiyorsun

TabTherapist aynı mekanizmayı uyguluyor:
- Tab Hoarding Score → kişisel, ölçülebilir
- Kişilik tipi → paylaşılabilir kimlik
- PNG skor kartı → sosyal medyaya hazır
- "Senin skorun kaç?" → organik yayılma

### 2.4 Neden TabTherapist Kazanır

| Boyut | Mevcut Araçlar | TabTherapist |
|---|---|---|
| **Amaç** | Tab'ları yönet/düzenle | Tab alışkanlıklarını anla ve paylaş |
| **Ton** | Ciddi, kurumsal, utilitarian | Mizahi, kişilikli, eğlenceli |
| **Çıktı** | Düzenlenmiş sekmeler | Paylaşılabilir skor kartı + insight |
| **Viral** | Organik yayılma yok | Spotify Wrapped tarzı paylaşım döngüsü |
| **Kategori** | Productivity tool | Entertainment + Light productivity |
| **Rekabet** | 15+ benzer araç | **Bu kategoride rakip yok** |
| **Kullanım sıklığı** | Günlük/sürekli | Haftalık check-in + sosyal paylaşım |
| **Hedef** | Problemi çöz | Problemi eğlenceye çevir |

**Tek cümle fark:** Mevcut araçlar "dişçi" gibi — gerekli ama sıkıcı.
TabTherapist "kişilik testi" gibi — kimse ihtiyacı yok ama herkes yapıyor ve paylaşıyor.

---

## 3. ÖZELLİK SETİ (Feature Set)

### v1.0 — MVP (İlk Release)

#### 3.1 Tab Analytics Dashboard (Popup)
- Toplam açık sekme sayısı
- Pencere başına dağılım
- Domain bazlı gruplandırma (en çok hangi siteden kaç sekme)
- Sekme yaşı analizi (en eski sekme ne zamandan beri açık)
- Tahmini RAM kullanımı (sekme sayısı × ortalama)

#### 3.2 Tab Hoarding Score (0-100)
Skor algoritması (ağırlıklı):
- Toplam sekme sayısı (25%)
- Ortalama sekme yaşı (20%)
- Duplicate sekme oranı (15%)
- "Aspirational tab" sayısı — 3+ gündür açık, hiç ziyaret edilmemiş (20%)
- Tek domain'den çoklu sekme yoğunluğu (10%)
- Pencere sayısı (10%)

Skor Aralıkları & Kişilik Tipleri:
- **0-20:** "Zen Master" — Minimalist, disiplinli
- **21-40:** "Casual Browser" — Normal kullanıcı
- **41-60:** "Tab Enthusiast" — Biraz fazla ama idare eder
- **61-80:** "Digital Hoarder" — Ciddi biriktirici
- **81-100:** "Tab Apocalypse" — Müdahale gerekli

#### 3.3 Paylaşılabilir Skor Kartı
- Skor + kişilik tipi + öne çıkan istatistikler
- Tek tıkla görsel oluşturma (canvas → PNG)
- X ve LinkedIn'e doğrudan paylaşım linkleri
- Branded görsel: logo + gradient arka plan + istatistikler

#### 3.4 Temel Aksiyonlar
- "Close Ancient Tabs" — X günden eski sekmeleri kapat
- "Merge Duplicates" — Aynı URL'li sekmeleri birleştir
- "Archive & Close" — Sekmeleri listeye kaydet ve kapat

### v1.1 — Sonraki İterasyon (Post-Launch)
- Haftalık "Tab Therapy Raporu" (notification)
- "Aspirational Tab" ve "Insurance Policy Tab" tespiti (StackOverflow linkleri)
- Tab Streak: kaç gün üst üste 30 sekme altında kaldın
- Karanlık/aydınlık tema desteği

### v2.0 — Gelecek Vizyon
- Tab kullanım trend grafiği (günlük/haftalık)
- "Tab Wrapped" — aylık özet rapor
- Çoklu tarayıcı desteği (Firefox)

---

## 4. TECH STACK

```
Chrome Extension (Manifest V3)
├── manifest.json          — Extension yapılandırması
├── background/
│   └── service-worker.js  — Tab event listener'lar, veri toplama
├── popup/
│   ├── popup.html         — Ana dashboard UI
│   ├── popup.css          — Stiller
│   └── popup.js           — Dashboard logic
├── scorecard/
│   ├── scorecard.html     — Tam sayfa skor kartı
│   ├── scorecard.css      — Skor kartı stili
│   └── scorecard.js       — Canvas render + paylaşım
├── utils/
│   ├── analyzer.js        — Skor hesaplama algoritması
│   ├── storage.js         — chrome.storage wrapper
│   └── constants.js       — Sabitler, eşik değerler
├── assets/
│   ├── icons/             — Extension ikonları (16, 48, 128)
│   ├── fonts/             — Custom fontlar (woff2)
│   └── images/            — Skor kartı arka planları
└── README.md
```

### Teknoloji Tercihleri
- **Vanilla JS** — Framework yok, hız ve basitlik için
- **Manifest V3** — Service worker tabanlı, zorunlu
- **Chrome APIs:** `tabs`, `storage`, `alarms`
- **Canvas API** — Paylaşılabilir skor kartı görseli üretimi
- **CSS Custom Properties** — Tema sistemi
- **Permissions:** `tabs` (sekme bilgisi), `storage` (veri saklama)

### Neden Framework Yok?
- Chrome extension popup'ları küçük ve hızlı olmalı
- React/Vue overhead gereksiz
- Bundle boyutu küçük kalır
- Chrome Web Store review süreci kısalır

---

## 5. TASARIM & TEMA

### Estetik Yön: "Retro-Terapist"
- Nostaljik psikolog ofisi teması (deri koltuk, not defteri hissi)
- Mizahi ama kaliteli
- Warm tonlar: koyu yeşil, krem, amber, kahverengi aksan
- Font: serif başlık (terapist notu hissi) + monospace istatistikler

### Renk Paleti
```
--bg-primary:    #1a1a2e    (Koyu lacivert — ana zemin)
--bg-secondary:  #16213e    (Koyu mavi — kart zemin)
--accent-warm:   #e2b714    (Amber/altın — vurgular)
--accent-danger: #ff6b6b    (Kırmızı — uyarılar)
--accent-calm:   #4ecdc4    (Turkuaz — olumlu)
--text-primary:  #eee8d5    (Krem — ana metin)
--text-muted:    #8892b0    (Gri-mavi — ikincil metin)
```

### Popup Boyut
- Genişlik: 380px
- Yükseklik: 500px (scrollable)

### Skor Kartı Görseli
- 1080x1080px (sosyal medya optimum)
- Gradient arka plan
- Logo + skor dairesi + 3-4 highlight stat
- "tabtherapist.dev" watermark

---

## 6. İMPLEMENTASYON ADIMLARI

Her adım bağımsız, test edilebilir, tamamlanınca sonraki adıma geçilir.

### ADIM 1: İskelet & Manifest
- [ ] Proje klasör yapısı oluştur
- [ ] manifest.json (Manifest V3)
- [ ] Boş service worker
- [ ] Minimal popup (HTML + CSS + JS)
- [ ] Chrome'a yüklenebilir hale getir
- **Çıktı:** Extension Chrome'da yükleniyor, popup açılıyor

### ADIM 2: Tab Veri Toplama
- [ ] `chrome.tabs.query()` ile tüm sekmeleri çek
- [ ] Domain parse etme (URL → hostname)
- [ ] Domain bazlı gruplandırma
- [ ] Sekme sayısı, pencere sayısı hesaplama
- [ ] Duplicate tespiti
- **Çıktı:** Console'da tüm tab verileri görünüyor

### ADIM 3: Skor Algoritması
- [ ] `analyzer.js` — Skor hesaplama fonksiyonu
- [ ] Ağırlıklı skor formülü implementasyonu
- [ ] Kişilik tipi eşleştirme
- [ ] Sekme yaşı takibi (ilk açılış zamanı kaydetme)
- [ ] `chrome.storage.local` ile geçmiş veri saklama
- **Çıktı:** Skor hesaplanıyor, kişilik tipi dönüyor

### ADIM 4: Dashboard UI (Popup)
- [ ] Layout: Header + Skor dairesi + Stat kartları + Aksiyon butonları
- [ ] Skor animasyonu (0'dan hedefe sayma)
- [ ] Domain listesi (en çok sekme açılan siteler)
- [ ] "En eski sekme" highlight
- [ ] Renk paleti ve tipografi uygulaması
- **Çıktı:** Popup'ta görsel olarak çalışan dashboard

### ADIM 5: Aksiyonlar
- [ ] "Close Ancient Tabs" — Belirli günden eski sekmeleri kapat
- [ ] "Merge Duplicates" — Aynı URL'leri birleştir
- [ ] "Archive & Close" — URL'leri kaydet, sekmeleri kapat
- [ ] Onay dialog'u (kazara kapatmayı önle)
- **Çıktı:** Aksiyonlar çalışıyor, sekmeler yönetiliyor

### ADIM 6: Paylaşılabilir Skor Kartı
- [ ] Tam sayfa skor kartı (yeni tab)
- [ ] Canvas API ile PNG render
- [ ] İstatistik highlight'ları seçimi
- [ ] "Share on X" ve "Share on LinkedIn" butonları
- [ ] PNG indirme butonu
- **Çıktı:** Paylaşılabilir görsel oluşturuluyor

### ADIM 7: Polish & Mikro-etkileşimler
- [ ] Hover efektleri
- [ ] Skor dairesi animasyonu (CSS veya Canvas)
- [ ] Kişilik tipi reveal animasyonu
- [ ] Loading state'leri
- [ ] Boş durum (0 sekme) için özel mesaj
- **Çıktı:** Parlatılmış, profesyonel UI

### ADIM 8: Test & Hata Ayıklama
- [ ] Edge case: 0 sekme, 1 sekme, 500+ sekme
- [ ] Incognito pencere handling
- [ ] Farklı ekran boyutları
- [ ] Chrome versiyon uyumluluğu
- [ ] Memory leak kontrolü
- [ ] Permission hataları
- **Çıktı:** Stabil, hatasız çalışan extension

### ADIM 9: GitHub & Dokümantasyon
- [ ] README.md (İngilizce, kurulum, ekran görüntüleri, katkıda bulunma)
- [ ] LICENSE (MIT)
- [ ] .gitignore
- [ ] CONTRIBUTING.md
- [ ] Demo GIF / screenshot'lar
- [ ] GitHub Topics & Description
- **Çıktı:** Profesyonel GitHub repo

### ADIM 10: İçerik & Lansman
- [ ] Chrome Web Store'a yükleme (opsiyonel)
- [ ] X thread (Türkçe/İngilizce)
- [ ] LinkedIn post
- [ ] dev.to blog yazısı
- [ ] Product Hunt listing (opsiyonel)
- **Çıktı:** Lansman tamamlandı

---

## 7. TEST PLANI

### Birim Testler
- Skor algoritması: bilinen girdi → beklenen çıktı
- Domain parse: çeşitli URL formatları
- Duplicate tespiti: aynı URL, farklı parametre, trailing slash

### Entegrasyon Testleri
- Tab açma/kapama sonrası dashboard güncellenmesi
- Storage'a yazma/okuma döngüsü
- Skor kartı render → indirme akışı

### Manuel Test Senaryoları
| Senaryo | Beklenen |
|---|---|
| 0 sekme (imkansız ama edge case) | "Zen Master" mesajı |
| 1 sekme | Düşük skor, minimal UI |
| 50 sekme, hepsi aynı domain | Yoğunluk uyarısı |
| 200+ sekme | Yüksek skor, performans OK |
| Duplicate sekmeler var | Merge önerisi |
| 30 günlük eski sekme var | "Ancient tab" vurgusu |
| Incognito pencere açık | Incognito sekmeler hariç tutulur |

---

## 8. İÇERİK STRATEJİSİ

### GitHub README Yapısı
```
# 🛋️ TabTherapist
Your browser tabs need therapy. So do you.

[Screenshot / Demo GIF]

## What is this?
TabTherapist analyzes your browser tab habits and gives you a 
"Tab Hoarding Score" — think Spotify Wrapped, but for your tabs.

## Features
- 📊 Tab Hoarding Score (0-100)
- 🧠 Personality type (Zen Master → Tab Apocalypse)
- 📈 Domain analysis & tab age tracking
- 🖼️ Shareable scorecard for social media
- 🧹 Quick cleanup actions

## Install
[Chrome Web Store link] or load unpacked...

## Screenshots
...

## Built With
Chrome Extension Manifest V3, Vanilla JS, Canvas API

## Contributing
...

## License
MIT
```

### X Thread Taslağı
```
1/ Bir Chrome extension yaptım: TabTherapist 🛋️

Tarayıcı sekmelerinizi analiz edip "Tab Hoarding Score" veriyor.

Spotify Wrapped gibi, ama sekmeleriniz için.

[Screenshot]

2/ Neden yaptım?

Bu dev.to yazısı 100 yorum aldı:
"147 sekmem var ve hiçbirini kapatamıyorum"

Herkes bu sorunu yaşıyor. Ama kimse ölçmüyor.

3/ Nasıl çalışıyor?

→ Açık sekme sayısı
→ Domain dağılımı  
→ En eski sekme yaşı
→ Duplicate oranı

Bunlardan ağırlıklı bir skor üretiyor.

4/ Kişilik tipleri:

🧘 Zen Master (0-20)
😎 Casual Browser (21-40)
📚 Tab Enthusiast (41-60)
📦 Digital Hoarder (61-80)
💥 Tab Apocalypse (81-100)

5/ En iyi kısım: paylaşılabilir skor kartı.

Tek tıkla PNG oluştur, X'e paylaş.

Repo: [link]
Chrome Web Store: [link]

Senin skorun kaç? 👇
```

### LinkedIn Post Taslağı
```
Geçen hafta bir yazı okudum: Cornell'de bir hoca, 
AI ödevlerine karşı daktilo kullandırıyor.

Ama asıl ilginç olan: bir dev.to yazısında bir developer 
"147 sekmem var ve kapatamıyorum" diye yazmış. 
100 yorum almış. Çünkü herkes bu sorunu biliyor.

Bu iki hikayeden bir fikir çıktı:
"Ya tab alışkanlıklarımızı ölçsek?"

TabTherapist'i yaptım.

Chrome extension. Sekmelerinizi analiz ediyor.
Skor veriyor. Kişilik tipi atıyor.
Spotify Wrapped gibi paylaşılabilir kart üretiyor.

Repo açık kaynak: [link]

Teknik detaylar:
• Chrome Manifest V3
• Vanilla JS (framework yok)
• Canvas API ile görsel üretimi
• 0 dependency

Senin Tab Hoarding Score'un kaç?

#opensource #chromeextension #developer #productivity
```

---

## 9. ZAMAN ÇİZELGESİ (Tahmini)

| Adım | Tahmini Süre |
|---|---|
| 1. İskelet & Manifest | 30 dk |
| 2. Tab Veri Toplama | 1 saat |
| 3. Skor Algoritması | 1 saat |
| 4. Dashboard UI | 2-3 saat |
| 5. Aksiyonlar | 1-2 saat |
| 6. Skor Kartı | 2 saat |
| 7. Polish | 1-2 saat |
| 8. Test | 1 saat |
| 9. GitHub & Docs | 1 saat |
| 10. İçerik & Lansman | 1 saat |
| **TOPLAM** | **~12-15 saat** |

---

## 10. BAŞARI KRİTERLERİ

- [ ] Extension Chrome'da sorunsuz çalışıyor
- [ ] Skor tutarlı ve anlamlı
- [ ] UI profesyonel ve eğlenceli
- [ ] Skor kartı paylaşılabilir
- [ ] GitHub repo temiz, README profesyonel
- [ ] En az 1 sosyal medya içeriği yayınlandı
- [ ] İlk 50 GitHub star (hedef)

---

*Bu plan, adım adım ilerlenecek şekilde tasarlanmıştır.*
*Her adım tamamlandığında bir sonrakine geçilir.*
*İlk adım: İskelet & Manifest*
