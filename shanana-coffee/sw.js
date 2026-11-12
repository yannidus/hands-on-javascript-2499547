/* Shanana Coffee service worker: makes the site installable and usable offline.
   - pages: network first, fall back to the saved copy
   - images, CSS, JS: saved copy first, refreshed in the background
   - Google Fonts: saved after first load
   Bump VERSION whenever files change so phones pick up the new copy. */
const VERSION = "shanana-v2";
const FONTS = "shanana-fonts-v1";
const PRECACHE = [
  "./", "index.html", "coffee.html", "collection.html", "heritage.html", "impact.html", "wholesale.html", "contact.html", "privacy.html", "404.html",
  "site.webmanifest",
  "assets/css/main.css",
  "assets/js/boot.js", "assets/js/config.js", "assets/js/catalog.js", "assets/js/viewer.js", "assets/js/main.js", "assets/js/form.js",
  "assets/img/favicon.svg",
  "assets/img/icons/icon-192.png", "assets/img/icons/icon-512.png", "assets/img/icons/apple-touch-icon.png",
  "assets/img/products/bag-front.webp",
  ...Array.from({ length: 8 }, (_, i) => `assets/img/products/360/bag-0${i + 1}.webp`),
  "assets/img/nyaruguru/hills-clouds.webp", "assets/img/nyaruguru/drying-beds.webp"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION && k !== FONTS).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;               // never touch form submissions
  const url = new URL(req.url);

  if (url.origin !== location.origin) {           // Google Fonts only
    if (/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) e.respondWith(staleWhileRevalidate(req, FONTS));
    return;
  }
  if (req.mode === "navigate" || req.destination === "document") {
    e.respondWith(
      fetch(req).then((res) => { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); return res; })
        .catch(() => caches.match(req, { ignoreSearch: true }).then((hit) => hit || caches.match("index.html")))
    );
    return;
  }
  e.respondWith(staleWhileRevalidate(req, VERSION));
});

function staleWhileRevalidate(req, cacheName) {
  return caches.open(cacheName).then((cache) =>
    cache.match(req, { ignoreSearch: true }).then((hit) => {
      const refresh = fetch(req).then((res) => { if (res && (res.ok || res.type === "opaque")) cache.put(req, res.clone()); return res; }).catch(() => hit);
      return hit || refresh;
    })
  );
}
