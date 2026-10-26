// Self-destruct Service Worker: cancella TUTTE le cache e si disiscrive immediatamente
self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => caches.delete(key)));
    }).then(() => {
      return self.registration.unregister();
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Non intercetta più nulla: tutto viene scaricato direttamente e sempre dalla rete
self.addEventListener('fetch', () => {
  // Pass-through diretto alla rete, nessuna cache
});