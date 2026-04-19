// TabTherapist Popup Script
// Vanilla JS: Dashboard UI mantığı

console.log('TabTherapist Popup yüklendi');

// Popup açıldığında çalışan başlangıç kodları
document.addEventListener('DOMContentLoaded', () => {
  console.log('Popup DOM hazır');

  // Service worker'ın çalıştığını doğrula
  chrome.runtime.getBackgroundPage((backgroundPage) => {
    if (backgroundPage) {
      console.log('Service Worker bağlantısı başarılı');
    } else {
      console.warn('Service Worker bağlanılamadı');
    }
  });
});

// Popup kapatılırken çalışacak kod (opsiyonel)
window.addEventListener('unload', () => {
  console.log('Popup kapatıldı');
});
