const CACHE_NAME = 'zaltergames-v1';
const ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './css/giochi.css',
  './css/anima.css',
  './js/qrcode.js',
  './js/obiettivi.js'
];

// Install: memorizza la cache base e forza l'attivazione immediata
self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// Activate: elimina le vecchie versioni della cache e prende il controllo subito
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: strategia Network-First
// Prova prima a scaricare la versione più recente da internet.
// Solo se si è offline o la rete fallisce, usa la cache salvata.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || !e.request.url.startsWith('http')) return;

  e.respondWith(
    fetch(e.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(e.request);
      })
  );
});
