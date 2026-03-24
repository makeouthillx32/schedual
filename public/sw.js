// public/sw.js
// Service worker for DART Thrift PWA
// Handles push notifications and offline caching

const CACHE_NAME = 'dart-thrift-v1';

// ── Install ────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  self.skipWaiting();
});

// ── Activate ───────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ── Push event — fires when server sends a push ────────────────────────────
self.addEventListener('push', (event) => {
  console.log('[SW] Push received');

  let data = { title: 'DART Thrift', body: 'You have a new notification.', url: '/Delivery' };

  try {
    if (event.data) {
      data = { ...data, ...event.data.json() };
    }
  } catch (e) {
    console.error('[SW] Failed to parse push data:', e);
  }

  const options = {
    body:    data.body,
    icon:    '/images/home/dartlogo.svg',
    badge:   '/images/home/dartlogo.svg',
    tag:     data.tag || 'dart-notification',
    data:    { url: data.url || '/Delivery' },
    vibrate: [200, 100, 200],
    requireInteraction: data.requireInteraction || false,
    actions: data.actions || [],
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// ── Notification click — open or focus the app ─────────────────────────────
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.notification.tag);
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/Delivery';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If app is already open, focus it and navigate
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          client.navigate(targetUrl);
          return;
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// ── Fetch — network first, fall back to cache for navigation ───────────────
self.addEventListener('fetch', (event) => {
  // Only handle same-origin navigation requests for offline fallback
  if (
    event.request.mode === 'navigate' &&
    event.request.url.startsWith(self.location.origin)
  ) {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match('/offline.html') || fetch(event.request)
      )
    );
  }
});