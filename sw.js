const CACHE_NAME = 'notecards-v1';
const ASSETS = [
  'index.html',
  'manifest.json',
  'static/notecards.css',
  'static/quavers.png',
  'static/quavers.svg',
  'js/abcjs-basic-min.js',
  'js/instruments.js',
  'js/notecards.js',
  'https://cdn.jsdelivr.net/npm/bulma@1.0.2/css/bulma.min.css',
  'https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js',
];

self.addEventListener('install', (event) => {
  console.log("Service worker install");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log("Service worker activate");
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  console.log("Service worker fetch");
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
