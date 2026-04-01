// public/sw.js — DART Delivery Service Worker
// Push types:
//   "new_order"    → new delivery/pickup (fires to ALL subscribed devices)
//   "driver_alert" → targeted alert for a specific driver (by user_id)

self.addEventListener("install",  () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

// ── Push received ─────────────────────────────────────────────────────────────
self.addEventListener("push", (e) => {
  if (!e.data) return;

  let p;
  try { p = e.data.json(); }
  catch { p = { title: "DART Delivery", body: e.data.text(), url: "/Delivery" }; }

  const { title = "DART Delivery", body = "", url = "/Delivery", tag = "dart-delivery", type = "general" } = p;

  const actions = [
    { action: "view",    title: type === "new_order" ? "View Order" : "Open App" },
    { action: "dismiss", title: "Dismiss" },
  ];

  e.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon:               "/images/home/dartlogo.svg",
      badge:              "/images/home/dartlogo.svg",
      tag,
      data:               { url },
      requireInteraction: true,
      vibrate:            [200, 100, 200],
      actions,
    })
  );
});

// ── Notification click ────────────────────────────────────────────────────────
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  if (e.action === "dismiss") return;

  const url = e.notification.data?.url || "/Delivery";

  e.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const c of clients) {
        if (c.url.includes(url) && "focus" in c) return c.focus();
      }
      for (const c of clients) {
        if ("focus" in c) return c.focus().then(() => c.navigate(url));
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});