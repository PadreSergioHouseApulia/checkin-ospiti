self.addEventListener('install', (e) => {
  console.log('[Service Worker] Installato');
});

self.addEventListener('fetch', (e) => {
  // Lasciamo passare tutte le richieste normalmente (nessuna cache forzata)
});