// RestoBill service worker.
//
// Android Chrome refuses `new Notification(...)` from a page — a kitchen alert
// has to be raised through a service worker registration, which is why this
// file exists. It deliberately caches nothing: the app is one large HTML file
// that changes often, and serving a stale copy to a live till would be worse
// than needing a connection to load it.

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));

// Raised by the page while it is alive, and by a real push once one is wired up.
async function focusApp() {
  const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
  const open = all.find(c => 'focus' in c);
  if (open) return open.focus();
  if (self.clients.openWindow) return self.clients.openWindow('./');
}

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(focusApp());
});

// Ready for server-sent push. Without one, nothing reaches here — see the
// kitchen alert notes in index.html.
self.addEventListener('push', event => {
  let data = { title: 'New KOT', body: 'A new order is ready to prepare.' };
  try { if (event.data) data = Object.assign(data, event.data.json()); } catch (e) {}
  event.waitUntil(self.registration.showNotification(data.title, {
    body: data.body,
    icon: './icon-192.png',
    badge: './icon-192.png',
    tag: 'restobill-kot',
    renotify: true,
    requireInteraction: true,
  }));
});
