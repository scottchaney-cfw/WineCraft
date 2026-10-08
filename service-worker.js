// Cache-first offline shell. Bump CACHE_NAME whenever any precached file changes so the new
// version gets fetched and old caches get cleaned up.
const CACHE_NAME = 'winecraft-ipad-v1';
const PRECACHE = [
  './',
  'index.html',
  'manifest.json',
  'css/styles.css',
  'js/db.js',
  'js/calc.js',
  'js/util.js',
  'js/router.js',
  'js/seed.js',
  'js/app.js',
  'js/screens/labTests.js',
  'js/screens/labWork.js',
  'js/screens/labLog.js',
  'js/screens/crushLog.js',
  'js/screens/preHarvest.js',
  'js/screens/preHarvestMeasure.js',
  'js/screens/vineyard.js',
  'js/screens/workOrder.js',
  'js/screens/wineList.js',
  'js/screens/conversions.js',
  'js/screens/blending.js',
  'js/screens/adminGeneric.js',
  'js/screens/tank.js',
  'js/screens/tankCapacity.js',
  'js/screens/settings.js',
  'js/screens/wheels.js',
  'js/screens/home.js',
  'assets/icons/icon-192.png',
  'assets/icons/icon-512.png',
  'assets/icons/apple-touch-icon.png',
  'assets/aroma_wheel.png',
  'assets/taste_wheel.png',
  'assets/fault_wheel.png',
  'assets/diagnostic.png',
  'assets/PrivacyPolicy.html',
  'assets/procedures/TA.html',
  'assets/procedures/TAandPH.html',
  'assets/procedures/FreeSO2.html',
  'assets/procedures/FreeSO2andVA.html',
  'assets/procedures/pH.html',
  'assets/procedures/VA.html',
  'assets/procedures/Alcohol.html',
  'assets/procedures/YAN.html',
  'assets/procedures/TotalSO2.html',
  'assets/procedures/RS.html',
  'assets/procedures/Blending.html',
  'assets/procedures/Conversions.html',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const network = fetch(event.request).then((response) => {
        if (response && response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
