const CACHE_NAME = "bamsignal-v1.0.15-18-mqx02jn6";
const APP_SHELL = [
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
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
  if (event.data?.type === "CLEAR_CACHES") {
    event.waitUntil(
      caches.keys().then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
    );
  }
});

function networkOnly(request) {
  return fetch(request, { cache: "no-store" });
}

function networkFirst(request) {
  return fetch(request, { cache: "no-store" })
    .then((response) => {
      if (response.ok && request.method === "GET") {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
      }
      return response;
    })
    .catch(() => caches.match(request));
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  if (url.pathname.startsWith("/api/")) return;

  if (
    request.mode === "navigate" ||
    url.pathname === "/" ||
    url.pathname.endsWith(".html") ||
    url.pathname === "/index.html"
  ) {
    event.respondWith(networkOnly(request));
    return;
  }

  if (url.origin !== self.location.origin) return;

  if (url.pathname.startsWith("/assets/") || request.destination === "script" || request.destination === "style") {
    event.respondWith(networkFirst(request));
    return;
  }

  const cacheableDestinations = new Set(["image", "font"]);
  const isShellAsset = APP_SHELL.includes(url.pathname);
  if (!isShellAsset && !cacheableDestinations.has(request.destination)) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return networkFirst(request);
    })
  );
});
