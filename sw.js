const CACHE_VERSION = 'v1';
const STATIC_CACHE = 'static-' + CACHE_VERSION;

const OFFLINE_URL = '/LadoB-pwa/offline.html';

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(function(cache) {
      return cache.addAll([
        OFFLINE_URL,
        '/LadoB-pwa/',
        '/LadoB-pwa/index.html'
      ]);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.map(function(key) {
          if (key !== STATIC_CACHE) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  const req = event.request;

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then(function(response) {
          const copy = response.clone();
          caches.open(STATIC_CACHE).then(function(cache) {
            cache.put(req, copy);
          });
          return response;
        })
        .catch(function() {
          return caches.match(OFFLINE_URL);
        })
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(function(cached) {
      return cached || fetch(req);
    })
  );
});