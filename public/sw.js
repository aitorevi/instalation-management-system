const DEBUG = false;
const log = DEBUG ? console.log.bind(console) : () => {};
const error = DEBUG ? console.error.bind(console) : console.error.bind(console);

const CACHE_NAME = 'ims-cache-v1';

const STATIC_ASSETS = [
  '/favicon.svg',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/offline.html'
];

self.addEventListener('install', (event) => {
  log('[SW] Installing...');

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        log('[SW] Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        error('[SW] Failed to cache assets:', error);
      })
  );
});

self.addEventListener('activate', (event) => {
  log('[SW] Activating...');

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => {
              log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        log('[SW] Old caches cleaned');
        return self.clients.claim();
      })
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (url.origin !== location.origin) {
    log('[SW] Skipping cross-origin request:', url.href);
    return;
  }

  if (
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/auth') ||
    url.href.includes('supabase')
  ) {
    log('[SW] Skipping API/auth request:', url.pathname);
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok && request.method === 'GET') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
            log('[SW] Cached:', url.pathname);
          });
        }
        return response;
      })
      .catch(() => {
        log('[SW] Network failed, trying cache:', url.pathname);
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            log('[SW] Serving from cache:', url.pathname);
            return cachedResponse;
          }

          if (request.mode === 'navigate') {
            log('[SW] Serving offline page');
            return caches.match('/offline.html');
          }

          log('[SW] No cache available for:', url.pathname);
          return new Response('Offline', { status: 503 });
        });
      })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    log('[SW] Received SKIP_WAITING message');
    self.skipWaiting();
  }
});

self.addEventListener('push', (event) => {
  log('[SW] Push received:', event);

  if (!event.data) {
    log('[SW] No push data');
    return;
  }

  const data = event.data.json();
  log('[SW] Push data:', data);

  const options = {
    body: data.body || 'Nueva notificación',
    icon: data.icon || '/icons/icon-192.png',
    badge: data.badge || '/icons/icon-96.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/',
      ...data.data
    },
    actions: data.actions || [],
    requireInteraction: false,
    tag: 'installation-notification'
  };

  log('[SW] Notification options:', options);

  const notificationPromise = self.registration
    .showNotification(data.title || 'IMS', options)
    .then(() => {
      log('[SW] Notification shown successfully');
    })
    .catch((err) => {
      error('[SW] Failed to show notification:', err);
    });

  event.waitUntil(notificationPromise);
});

self.addEventListener('notificationclick', (event) => {
  log('[SW] Notification clicked:', event);

  event.notification.close();

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(url) && 'focus' in client) {
          log('[SW] Focusing existing window');
          return client.focus();
        }
      }

      if (clients.openWindow) {
        log('[SW] Opening new window:', url);
        return clients.openWindow(url);
      }
    })
  );
});
