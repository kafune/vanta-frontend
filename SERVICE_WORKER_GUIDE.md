# Service Worker Implementation Guide

## Overview

This guide provides instructions for implementing a Service Worker in the VANTA dark fashion store to enable offline support and improved performance.

## What is a Service Worker?

A Service Worker is a JavaScript file that runs in the background, separate from the web page. It enables features like:
- Offline functionality
- Background sync
- Push notifications
- Caching strategies
- Network interception

## Implementation Steps

### 1. Create Service Worker File

Create `client/public/service-worker.js`:

```javascript
const CACHE_NAME = 'vanta-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
];

// Install event - cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }

      return fetch(event.request).then((response) => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Clone the response
        const responseToCache = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      });
    }).catch(() => {
      // Return offline page if available
      return caches.match('/offline.html');
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
```

### 2. Register Service Worker

Add to `client/src/main.tsx`:

```typescript
// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then((registration) => {
        console.log('Service Worker registered:', registration);
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
  });
}
```

### 3. Create Offline Page

Create `client/public/offline.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Offline - VANTA</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
        'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
        sans-serif;
      background: #0B0B0B;
      color: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
    }
    
    .offline-container {
      text-align: center;
      padding: 2rem;
      max-width: 500px;
    }
    
    h1 {
      font-size: 2rem;
      margin-bottom: 1rem;
    }
    
    p {
      font-size: 1rem;
      color: #999;
      margin-bottom: 2rem;
    }
    
    button {
      background: #FFFFFF;
      color: #0B0B0B;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      font-size: 1rem;
      cursor: pointer;
      transition: background 0.3s;
    }
    
    button:hover {
      background: #E0E0E0;
    }
  </style>
</head>
<body>
  <div class="offline-container">
    <h1>You're Offline</h1>
    <p>It looks like you've lost your internet connection. Some features may not be available.</p>
    <button onclick="window.location.reload()">Try Again</button>
  </div>
</body>
</html>
```

### 4. Update Manifest

Update `client/public/manifest.json`:

```json
{
  "name": "VANTA - Premium Fashion Store",
  "short_name": "VANTA",
  "description": "Premium dark fashion e-commerce store",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0B0B0B",
  "theme_color": "#FFFFFF",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/favicon.ico",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

## Caching Strategies

### Cache First
Best for: Static assets, images, fonts

```javascript
self.addEventListener('fetch', (event) => {
  if (event.request.destination === 'image') {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }
});
```

### Network First
Best for: API calls, dynamic content

```javascript
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, response.clone());
            return response;
          });
        })
        .catch(() => caches.match(event.request))
    );
  }
});
```

### Stale While Revalidate
Best for: Product data, user preferences

```javascript
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      });

      return response || fetchPromise;
    })
  );
});
```

## Features to Implement

### 1. Offline Product Browsing
- Cache product listings
- Cache product details
- Cache product images
- Show cached data when offline

### 2. Offline Shopping Cart
- Persist cart to IndexedDB
- Sync cart when online
- Show sync status indicator

### 3. Background Sync
- Queue orders for sync
- Retry failed requests
- Show sync progress

### 4. Push Notifications
- Order status updates
- Promotion notifications
- Personalized recommendations

## Testing Service Worker

### Chrome DevTools
1. Open DevTools (F12)
2. Go to Application tab
3. Select Service Workers
4. Check registration status
5. Test offline mode

### Testing Offline
1. Open DevTools
2. Go to Network tab
3. Check "Offline" checkbox
4. Refresh page
5. Verify offline page displays

## Performance Metrics

### Before Service Worker
- First load: 3-5 seconds
- Repeat load: 2-3 seconds
- Offline: Not available

### After Service Worker
- First load: 2-3 seconds
- Repeat load: 0.5-1 second
- Offline: Cached content available

## Best Practices

1. **Version Your Cache**: Use version numbers in cache names
2. **Clean Up Old Caches**: Remove old cache versions
3. **Handle Errors**: Gracefully handle network failures
4. **Limit Cache Size**: Implement cache size limits
5. **Test Thoroughly**: Test offline scenarios
6. **Monitor Performance**: Track service worker metrics
7. **Security**: Validate all cached content
8. **Update Strategy**: Plan for service worker updates

## Troubleshooting

### Service Worker Not Registering
- Check browser console for errors
- Verify service worker file exists
- Check HTTPS is enabled (required for production)
- Clear browser cache and try again

### Cache Not Working
- Check cache name in DevTools
- Verify cache storage quota
- Check network tab for failed requests
- Review service worker code for errors

### Offline Page Not Showing
- Verify offline.html exists
- Check service worker fetch handler
- Test offline mode in DevTools
- Check browser console for errors

## Implementation Checklist

- [ ] Create service-worker.js file
- [ ] Register service worker in main.tsx
- [ ] Create offline.html page
- [ ] Update manifest.json
- [ ] Implement caching strategies
- [ ] Test offline functionality
- [ ] Test cache invalidation
- [ ] Monitor cache performance
- [ ] Document caching behavior
- [ ] Set up error handling

## References

- [MDN Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web.dev Service Workers](https://web.dev/service-workers-cache-storage/)
- [Google Workbox](https://developers.google.com/web/tools/workbox)
