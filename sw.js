// 2B Sales OS Service Worker v1.0
const CACHE_NAME = '2b-sales-os-giza-v1';
const ASSETS_TO_CACHE = [
  './2B_Master_Sales_OS_2027.html',
  './manifest.json',
  './icon.svg',
  './icon-192.png',
  './icon-512.png',
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;800;900&display=swap'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[2B SW] Caching app shell & assets...');
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('[2B SW] Some external assets could not be precached directly:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached version immediately
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        // Cache external CDN resources dynamically
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Fallback for HTML documents if offline
        if (event.request.headers.get('accept')?.includes('text/html')) {
          return caches.match('./2B_Master_Sales_OS_2027.html');
        }
      });
    })
  );
});