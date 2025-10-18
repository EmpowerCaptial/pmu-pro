const CACHE_NAME = 'pmu-pro-v1.2025.10.18.0338';
const urlsToCache = [
  '/',
  '/dashboard',
  '/analyze',
  '/clients',
  '/pigment-library',
  '/library',
  '/help'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('🔄 Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('✅ Opened cache:', CACHE_NAME);
        return cache.addAll(urlsToCache).catch((error) => {
          console.warn('⚠️ Some resources failed to cache:', error);
          // Continue with installation even if some resources fail
          return Promise.resolve();
        });
      })
      .then(() => {
        // Skip waiting to activate immediately
        console.log('🚀 Service Worker installed, skipping waiting...');
        return self.skipWaiting();
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  // Skip caching for API endpoints, PDFs, and other dynamic content
  if (event.request.url.includes('/api/') || 
      event.request.url.includes('.pdf') ||
      event.request.url.includes('/documents/') ||
      event.request.url.includes('/sample-documents/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        return fetch(event.request);
      }).catch((error) => {
        console.warn('Fetch failed:', error);
        // Return a fallback response or let the browser handle it
        return fetch(event.request);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🔄 Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Take control of all clients immediately
      console.log('🎯 Service Worker activated, taking control...');
      return self.clients.claim();
    })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    // Sync any pending data when back online
    console.log('Background sync completed');
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Push notification handling
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New PMU Pro notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View',
        icon: '/icons/icon-72x72.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/icon-72x72.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('PMU Pro', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
