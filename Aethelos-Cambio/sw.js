const CACHE_NAME = "aethelos-cambio-v2";

const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/styles.css",
  "/app.js",
  "/manifest.json"
];

// INSTALL
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// ACTIVATE (limpia versiones viejas)
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// FETCH (NETWORK FIRST + FALLBACK CACHE)
self.addEventListener("fetch", (event) => {
  const url = event.request.url;

  // NO cachear APIs en vivo (Binance / Forex)
  if (
    url.includes("binance") ||
    url.includes("er-api") ||
    url.includes("exchangerate")
  ) {
    event.respondWith(fetch(event.request));
    return;
  }

  // cache normal para UI
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, clone);
        });
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
