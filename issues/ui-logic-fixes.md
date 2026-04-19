# TabTherapist — UI & Logic Fix Plan
**Dosya:** `issues/ui-logic-fixes.md`  
**Hedef:** 4 kritik hatanın Claude Code tarafından doğrudan uygulanabilecek şekilde atomik adımlara bölünmüş çözüm planı.  
**Kural:** Tüm düzeltmeler yalnızca **Vanilla JS** ve **CSS** kullanır. Framework yok, kütüphane yok.

---

## FIX 1 — Loading Ekranı Takılı Kalıyor

### Problem
`popup.js` içinde veriler yüklendikten sonra loading state'i gizlenmiyor.  
`#loading-screen` (veya benzeri wrapper) veri geldikten sonra da DOM'da görünür halde kalıyor.

### Etkilenen Dosyalar
- `popup/popup.js`
- `popup/popup.html` (id kontrolü)
- `popup/popup.css` (display tanımı kontrolü)

### Uygulama Adımları

**Adım 1.1 — `popup.html` içinde element id'lerini doğrula**

Loading container'ının id'si `loading-screen`, asıl içerik container'ının id'si `main-content` olduğunu varsayarak devam edilir. Farklıysa aşağıdaki id'leri mevcut id'lerle eşleştir.

```html
<!-- Loading state: başlangıçta görünür -->
<div id="loading-screen">
  <!-- koltuk ikonu + "Terapist notlarını inceliyor..." -->
</div>

<!-- Ana içerik: başlangıçta gizli -->
<div id="main-content" style="display: none;">
  <!-- skor, stat kartlar, butonlar -->
</div>
```

**Adım 1.2 — `popup.css` içinde default display tanımlarını kontrol et**

```css
/* Var olan tanım varsa bu şekilde olmalı */
#loading-screen {
  display: flex; /* veya block — mevcut değeri koru */
}

#main-content {
  display: none; /* başlangıç gizli */
}
```

**Adım 1.3 — `popup.js` içinde veri yükleme tamamlandıktan sonra swap yap**

`chrome.tabs.query(...)` callback'inin veya Promise `.then()` bloğunun **en son satırına**, tüm DOM güncellemeleri yapıldıktan **sonra** şu iki satırı ekle:

```js
// Tüm DOM güncellemeleri tamamlandıktan sonra:
document.getElementById('loading-screen').style.display = 'none';
document.getElementById('main-content').style.display = 'flex'; // veya 'block'
```

**Adım 1.4 — Doğrulama**

`popup.js` içinde `chrome.tabs.query` çağrısını bul. Aşağıdaki yapıyı referans al:

```js
// ÖNCE (hatalı durum — swap satırları yok veya yanlış yerde):
chrome.tabs.query({}, (tabs) => {
  renderScore(tabs);
  renderStats(tabs);
  // ← buraya eklenmemiş
});

// SONRA (doğru durum):
chrome.tabs.query({}, (tabs) => {
  renderScore(tabs);
  renderStats(tabs);
  // ↓ her şey bittikten sonra en sona ekle
  document.getElementById('loading-screen').style.display = 'none';
  document.getElementById('main-content').style.display = 'flex';
});
```

---

## FIX 2 — Yanlış Aydınlanma Mesajı

### Problem
"Sadece 1 sekme mi? Terapiste ihtiyacın yok..." mesajı için kullanılan koşul yanlış.  
Muhtemelen `tabs.length === 1` yerine `activeTab` veya başka bir değişken kontrol ediliyor.  
Gerçek sekme sayısı 10 olmasına rağmen mesaj tetikleniyor.

### Etkilenen Dosyalar
- `popup/popup.js`

### Uygulama Adımları

**Adım 2.1 — Mevcut koşulu bul**

`popup.js` içinde "aydınlanma" veya "1 sekme" mesajını render eden fonksiyonu veya koşulu bul.  
Genellikle şu örüntülerden biri kullanılır:

```js
// Hatalı örnek A — activeTab sayıyor, tüm tabları değil:
if (activeTabs.length === 1) { ... }

// Hatalı örnek B — window bazlı sayıyor:
if (currentWindowTabs.length === 1) { ... }

// Hatalı örnek C — filtreden geçirilmiş liste:
if (filteredTabs.length <= 1) { ... }
```

**Adım 2.2 — Koşulu düzelt**

Koşul her zaman `chrome.tabs.query({})` ile dönen **tüm** sekme sayısını kullanmalı:

```js
// DOĞRU:
chrome.tabs.query({}, (allTabs) => {
  const totalTabCount = allTabs.length;

  if (totalTabCount === 1) {
    // aydınlanma mesajını göster
    showEnlightenmentMessage();
  } else {
    // aydınlanma mesajını gizle
    hideEnlightenmentMessage();
  }
});
```

**Adım 2.3 — Mesaj container'ının görünürlüğünü helper fonksiyonla yönet**

`popup.js` içine şu iki fonksiyonu ekle veya mevcut olanları bu şekilde güncelle:

```js
function showEnlightenmentMessage() {
  const el = document.getElementById('enlightenment-message');
  if (el) el.style.display = 'block'; // veya 'flex'
}

function hideEnlightenmentMessage() {
  const el = document.getElementById('enlightenment-message');
  if (el) el.style.display = 'none';
}
```

**Adım 2.4 — `popup.html` içinde element id'sini doğrula**

Meditasyon yapan adam ikonunu ve metni içeren wrapper'ın id'si `enlightenment-message` olmalı. Farklıysa yukarıdaki fonksiyonlarda o id'yi kullan.

---

## FIX 3 — Mantıksız Modal (0 Kopya Durumu)

### Problem
`duplicateCount === 0` olduğunda "Kopyaları Birleştir" butonu aktif kalıyor ve "0 kopya sekme kapatılacak. Emin misin?" modalı açılıyor. Hedefsiz aksiyon butonları disabled olmalı.

### Etkilenen Dosyalar
- `popup/popup.js`

### Uygulama Adımları

**Adım 3.1 — Her aksiyon butonu için disabled mantığını tanımla**

| Buton | Disabled Koşulu |
|---|---|
| Eski Sekmeleri Kapat | `ancientTabCount === 0` |
| Kopyaları Birleştir | `duplicateCount === 0` |
| Arşivle | `allTabs.length === 0` |

**Adım 3.2 — `popup.css` içine disabled stil ekle**

```css
.action-btn:disabled,
.action-btn[disabled] {
  opacity: 0.35;
  cursor: not-allowed;
  pointer-events: none;
  border-color: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.3);
}
```

**Adım 3.3 — `popup.js` içinde butonları analiz sonucuna göre güncelle**

Tab analizi tamamlandıktan sonra (FIX 1'deki aynı callback bloğu içine) şu satırları ekle:

```js
chrome.tabs.query({}, (allTabs) => {
  // ... mevcut analiz kodu ...

  // Buton referanslarını al
  const btnCloseAncient = document.getElementById('btn-close-ancient');
  const btnMergeDupes   = document.getElementById('btn-merge-dupes');
  const btnArchive      = document.getElementById('btn-archive');

  // Disabled durumlarını ayarla
  if (btnCloseAncient) {
    btnCloseAncient.disabled = (ancientTabCount === 0);
  }
  if (btnMergeDupes) {
    btnMergeDupes.disabled = (duplicateCount === 0);
  }
  if (btnArchive) {
    btnArchive.disabled = (allTabs.length === 0);
  }
});
```

**Adım 3.4 — Modal'ı açan event listener'a erken çıkış koşulu ekle (ikinci savunma hattı)**

Modal açan fonksiyon içinde, `disabled` prop'una ek olarak sayı kontrolü de yap:

```js
btnMergeDupes.addEventListener('click', () => {
  if (duplicateCount === 0) return; // erken çıkış, modal açılmaz
  showConfirmModal(`${duplicateCount} kopya sekme kapatılacak. Emin misin?`, () => {
    mergeDuplicates();
  });
});

btnCloseAncient.addEventListener('click', () => {
  if (ancientTabCount === 0) return; // erken çıkış
  showConfirmModal(`${ancientTabCount} eski sekme kapatılacak. Emin misin?`, () => {
    closeAncientTabs();
  });
});
```

**Adım 3.5 — `popup.html` içinde buton id'lerini doğrula**

Aksiyon butonlarının id'leri Adım 3.3'teki id'lerle eşleşmeli. Farklıysa js tarafındaki `getElementById` çağrılarını mevcut id'lerle güncelle.

---

## FIX 4 — Scroll Zorunluluğu (CSS Layout)

### Problem
`popup.html` 380×500px kısıtlı bir popup alanına sahip. Aksiyon butonları (`Eski Sekmeleri Kapat`, `Kopyaları Birleştir`, `Arşivle`) ve altındaki mesaj bu alana sığmıyor, scroll gerekiyor.

### Etkilenen Dosyalar
- `popup/popup.css`
- `popup/popup.html` (gerekirse minor yapısal değişiklik)

### Uygulama Adımları

**Adım 4.1 — Popup kök boyutunu sabitle**

`popup.css` başına veya `body` kuralının yanına ekle:

```css
html, body {
  width: 380px;
  min-height: 500px;
  max-height: 500px;
  overflow: hidden; /* scroll'u tamamen kapat */
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
```

**Adım 4.2 — Ana wrapper'ı flex column yap ve sabit yüksekliğe bağla**

`#main-content` veya ana wrapper class'ı için:

```css
#main-content {
  display: flex;
  flex-direction: column;
  height: 500px;         /* tam popup yüksekliği */
  overflow: hidden;
  padding: 0 16px 12px;
  box-sizing: border-box;
  gap: 0;                /* gap'ı section bazında kontrol edeceğiz */
}
```

**Adım 4.3 — Skor bölgesini küçült**

Skor dairesi + kişilik tipi badge'i içeren bölge muhtemelen fazla yer kaplıyor:

```css
/* Skor dairesi */
.score-circle {
  width: 110px;           /* önceki değer neyse azalt, örn. 140 → 110 */
  height: 110px;
  margin: 8px auto;       /* üst/alt margin küçült */
}

.score-number {
  font-size: 2rem;        /* fazla büyükse küçült */
}

.personality-badge {
  margin: 6px auto 10px; /* üst/alt margin sıkıştır */
  padding: 4px 16px;
}
```

**Adım 4.4 — Stat kartları grid'ini sıkıştır**

```css
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;               /* önceki değer neyse, max 8px */
  margin: 6px 0;
}

.stat-card {
  padding: 8px 4px;       /* iç boşluğu azalt */
}

.stat-value {
  font-size: 1.4rem;      /* büyük fontsa küçült */
}

.stat-label {
  font-size: 0.6rem;
  letter-spacing: 0.08em;
}
```

**Adım 4.5 — Paylaş butonu margin'ini sıkıştır**

```css
#btn-share {
  margin: 8px 0;          /* üst/alt margin azalt */
  padding: 12px;          /* iç boşluk azalt */
}
```

**Adım 4.6 — Aksiyon butonları arasındaki gap'i azalt**

```css
.actions-section {
  display: flex;
  flex-direction: column;
  gap: 5px;               /* 8-10px'ten 5px'e indir */
  margin-top: 6px;
}

.action-btn {
  padding: 8px 12px;      /* dikey padding azalt */
  font-size: 0.75rem;
}
```

**Adım 4.7 — Header yüksekliğini kontrol et**

```css
.header {
  padding: 10px 16px;     /* üst/alt padding sıkıştır */
}

.header h1 {
  font-size: 1.1rem;
}

.header .subtitle {
  font-size: 0.55rem;
}
```

**Adım 4.8 — Aydınlanma mesajını (meditasyon adam + text) aksiyon butonlarının arkasına taşı**

Eğer aydınlanma mesajı her zaman DOM'da bulunup sadece gizleniyorsa, `display: none` olduğunda yer kaplamaz. Ancak `visibility: hidden` kullanıldıysa yer kaplamaya devam eder. Bunu kontrol et:

```js
// popup.js içinde — visibility değil, display kullan:
el.style.display = 'none';    // ✅ yer kaplamaz
// el.style.visibility = 'hidden'; // ❌ yer kaplamaya devam eder
```

**Adım 4.9 — Son kontrol: Tüm değişikliklerden sonra toplam yüksekliği hesapla**

Popup içindeki bölümlerin tahmini yükseklikleri (hedef ≤ 500px):

| Bölüm | Hedef Yükseklik |
|---|---|
| Header | ~52px |
| Loading → gizli | 0px |
| Skor dairesi + badge | ~165px |
| Stat kartları | ~75px |
| Paylaş butonu | ~50px |
| Aksiyon butonları (3 adet) | ~115px |
| Footer / version | ~28px |
| **Toplam** | **~485px** |

500px'e sığıyor. Ölçümler gerçek değerlerden farklıysa 4.3–4.7 adımlarındaki değerleri orantılı küçült.

---

## Uygulama Sırası (Önerilen)

1. **FIX 4** — Önce layout'u sıkıştır (diğer fix'lerin görsel doğrulamasını kolaylaştırır)
2. **FIX 1** — Loading ekranını düzelt
3. **FIX 2** — Yanlış mesajı düzelt
4. **FIX 3** — Disabled buton mantığını ekle

---

## Doğrulama Checklist

Her fix uygulandıktan sonra şu senaryoları manuel test et:

- [ ] 10 sekme açıkken popup'ı aç → loading ekranı kaybolup skor görünüyor mu?
- [ ] 10 sekme açıkken "aydınlanma mesajı" **görünmüyor** mu?
- [ ] 1 sekme açıkken "aydınlanma mesajı" **görünüyor** mu?
- [ ] `duplicateCount === 0` iken "Kopyaları Birleştir" butonu disabled/soluk mu?
- [ ] `duplicateCount === 0` iken "Kopyaları Birleştir" butonuna tıklandığında modal **açılmıyor** mu?
- [ ] `ancientTabCount === 0` iken "Eski Sekmeleri Kapat" butonu disabled/soluk mu?
- [ ] Tüm içerik scroll **gerektirmeden** 380×500px popup'a sığıyor mu?
- [ ] Disabled butonların üzerine hover edildiğinde `not-allowed` cursoru görünüyor mu?
