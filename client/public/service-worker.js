/**
 * VANTA Service Worker
 * Enables offline functionality and caching strategies
 */

const CACHE_VERSION = 'vanta-v1';
const CACHE_ASSETS = `${CACHE_VERSION}-assets`;
const CACHE_API = `${CACHE_VERSION}-api`;
const CACHE_IMAGES = `${CACHE_VERSION}-images`;

// Assets to cache on install
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/offline.html',
];

// Install event - cache essential assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');

  event.waitUntil(
    caches.open(CACHE_ASSETS).then((cache) => {
      console.log('[Service Worker] Caching assets');
      return cache.addAll(ASSETS_TO_CACHE).catch((error) => {
        console.warn('[Service Worker] Failed to cache some assets:', error);
      });
    })
  );

  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // API requests - Network First with API cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request, CACHE_API));
    return;
  }

  // Image requests - Cache First
  if (request.destination === 'image') {
    event.respondWith(cacheFirstStrategy(request, CACHE_IMAGES));
    return;
  }

  // HTML/JS/CSS - Stale While Revalidate
  if (
    request.destination === 'document' ||
    request.destination === 'script' ||
    request.destination === 'style'
  ) {
    event.respondWith(staleWhileRevalidateStrategy(request, CACHE_ASSETS));
    return;
  }

  // Default - Network First
  event.respondWith(networkFirstStrategy(request, CACHE_ASSETS));
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            // Delete caches that don't match current version
            return (
              cacheName !== CACHE_ASSETS &&
              cacheName !== CACHE_API &&
              cacheName !== CACHE_IMAGES
            );
          })
          .map((cacheName) => {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    })
  );

  // Claim all clients
  self.clients.claim();
});

// Message event - handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    clearAllCaches();
  }
});

/**
 * Cache First Strategy
 * Return from cache if available, otherwise fetch from network
 */
function cacheFirstStrategy(request, cacheName) {
  return caches.match(request).then((response) => {
    if (response) {
      console.log('[Service Worker] Cache hit:', request.url);
      return response;
    }

    console.log('[Service Worker] Cache miss, fetching:', request.url);
    return fetch(request)
      .then((response) => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200) {
          return response;
        }

        // Clone and cache the response
        const responseToCache = response.clone();
        caches.open(cacheName).then((cache) => {
          cache.put(request, responseToCache);
        });

        return response;
      })
      .catch((error) => {
        console.error('[Service Worker] Fetch failed:', error);
        return caches.match('/offline.html');
      });
  });
}

/**
 * Network First Strategy
 * Try network first, fall back to cache if offline
 */
function networkFirstStrategy(request, cacheName) {
  return fetch(request)
    .then((response) => {
      // Don't cache non-successful responses
      if (!response || response.status !== 200) {
        return response;
      }

      // Clone and cache the response
      const responseToCache = response.clone();
      caches.open(cacheName).then((cache) => {
        cache.put(request, responseToCache);
      });

      return response;
    })
    .catch((error) => {
      console.error('[Service Worker] Network request failed:', error);

      // Try to return cached response
      return caches
        .match(request)
        .then((response) => {
          if (response) {
            console.log('[Service Worker] Returning cached response:', request.url);
            return response;
          }

          // Return offline page as fallback
          if (request.destination === 'document') {
            return caches.match('/offline.html');
          }

          return new Response('Offline', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/plain',
            }),
          });
        });
    });
}

/**
 * Stale While Revalidate Strategy
 * Return cached response immediately, update cache in background
 */
function staleWhileRevalidateStrategy(request, cacheName) {
  return caches.match(request).then((cachedResponse) => {
    const fetchPromise = fetch(request)
      .then((response) => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200) {
          return response;
        }

        // Clone and cache the response
        const responseToCache = response.clone();
        caches.open(cacheName).then((cache) => {
          cache.put(request, responseToCache);
        });

        return response;
      })
      .catch((error) => {
        console.error('[Service Worker] Background fetch failed:', error);
        return cachedResponse;
      });

    // Return cached response if available, otherwise wait for network
    return cachedResponse || fetchPromise;
  });
}

/**
 * Clear all caches
 */
function clearAllCaches() {
  return caches.keys().then((cacheNames) => {
    return Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
  });
}

// Log service worker lifecycle
console.log('[Service Worker] Loaded');
