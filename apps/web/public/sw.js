/* eslint-disable no-undef */
importScripts("https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-sw.js");

if (self.workbox) {
  workbox.setConfig({ debug: false });
  workbox.core.clientsClaim();
  workbox.core.skipWaiting();
  workbox.precaching.precacheAndRoute([]);

  workbox.routing.registerRoute(
    ({ request }) => request.destination === "document",
    new workbox.strategies.NetworkFirst({
      cacheName: "eo-pages",
      networkTimeoutSeconds: 5,
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 50,
          purgeOnQuotaError: true
        })
      ]
    })
  );

  workbox.routing.registerRoute(
    ({ request }) =>
      request.destination === "style" || request.destination === "script",
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: "eo-assets"
    })
  );

  workbox.routing.registerRoute(
    ({ request }) => request.destination === "image",
    new workbox.strategies.CacheFirst({
      cacheName: "eo-images",
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 60,
          maxAgeSeconds: 30 * 24 * 60 * 60,
          purgeOnQuotaError: true
        })
      ]
    })
  );
}

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
