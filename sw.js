// Service Worker para ASOTATUR · Tarifario Oficial (GitHub Pages)
const CACHE_NAME = "asotatur-pwa-v2026-11-24-3";
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./tarifas.js",
  "./apple-touch-icon.png"
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE)).catch(() => {})
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Estrategia Network-First: siempre busca la versión fresca en GitHub Pages;
// si no hay señal (ej. en sótanos de hoteles o túneles), responde desde caché.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const cloned = networkResponse.clone();
          const urlWithoutQuery = event.request.url.split("?")[0];
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, cloned.clone());
            if (urlWithoutQuery !== event.request.url) {
              cache.put(urlWithoutQuery, cloned);
            }
          });
        }
        return networkResponse;
      })
      .catch(() => {
        const urlWithoutQuery = event.request.url.split("?")[0];
        return caches.match(event.request).then(
          (cached) => cached || caches.match(urlWithoutQuery) || caches.match("./index.html")
        );
      })
  );
});
