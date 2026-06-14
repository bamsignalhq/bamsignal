const CACHE_NAME = "bamsignal-static-v4";
const APP_SHELL = [
  "/",
  "/manifest.webmanifest",
  "/favicon.webp",
  "/apple-touch-icon.webp",
  "/brand/logo.webp",
  "/icons/icon-192.webp",
  "/icons/icon-512.webp",
  "/app-store-badge.svg",
  "/google-play-badge.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  if (url.pathname.startsWith("/api/")) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match("/"))
    );
    return;
  }

  if (url.origin !== self.location.origin) return;

  const cacheableDestinations = new Set(["script", "style", "image", "font"]);
  const isShellAsset = APP_SHELL.includes(url.pathname);
  if (!isShellAsset && !cacheableDestinations.has(request.destination)) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    })
  );
});
