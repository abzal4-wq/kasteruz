// Kaster.uz Service Worker — offline qo'llab-quvvatlash
// HMR (dev) ni buzmaslik uchun ehtiyotkor: faqat GET, navigatsiya va statik fayllar

const CACHE = "kaster-v5";
const APP_SHELL = ["/", "/manifest.webmanifest", "/icon-192.png", "/icon-512.png", "/favicon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(APP_SHELL)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Faqat GET va shu origin
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  // Vite dev / HMR / manba modullarini tegmaymiz
  if (
    url.pathname.startsWith("/@") ||
    url.pathname.startsWith("/src/") ||
    url.pathname.startsWith("/node_modules/") ||
    url.search.includes("import") ||
    url.search.includes("t=") ||
    url.pathname.includes("hot-update")
  ) {
    return;
  }

  // Navigatsiya (sahifa) — network-first, offline'da cache fallback
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put("/", copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match("/").then((r) => r || caches.match(request)))
    );
    return;
  }

  // Statik (rasm, ikonka, manifest) — cache-first
  if (
    /\.(png|jpg|jpeg|webp|svg|gif|ico|woff2?|ttf)$/.test(url.pathname) ||
    url.pathname.endsWith(".webmanifest")
  ) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((res) => {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(request, copy)).catch(() => {});
            return res;
          }).catch(() => cached)
      )
    );
  }
});
