const CACHE_NAME = 'secureview-cache-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  'https://res.cloudinary.com/dvx76fscz/image/upload/f_auto,q_auto,w_180/v1775406492/My%20Brand/logo_o30lrg.png',
  'https://res.cloudinary.com/dvx76fscz/image/upload/f_auto,q_auto,w_220/v1775405708/logo%20white%20background.png',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap',
  'https://unpkg.com/lucide@0.359.0/dist/umd/lucide.min.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
