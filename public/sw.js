const CACHE_NAME = 'power-platform-pro-v2';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icon-512.png',
  '/icon.png',
  '/favicon.ico',
  '/images/showcase/market_bg.png',
  '/images/showcase/qloud_bg.png'
];

// 1. INSTALLATION: Pre-cache static core
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('👷 SW: Pre-caching Core Shell');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// 2. ACTIVATION: Cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// 3. STRATEGY: Stale-While-Revalidate
// Serve from cache immediately, then update cache from network in background.
self.addEventListener('fetch', (event) => {
  // We only handle GET requests for caching
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          // Update cache with the new response
          if (networkResponse.ok) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(() => {
          // If offline and no cache, you could serve an offline page here
          console.log('📡 SW: Device is offline, serving from cache failover');
        });

        // Return cached response immediately if it exists, otherwise wait for network
        return cachedResponse || fetchPromise;
      });
    })
  );
});
