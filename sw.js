/**
 * Xestus OmniTools - Offline Service Worker
 * Ensures full offline functionality for in-browser client-side execution
 */

const CACHE_NAME = 'xestus-omnitools-v2';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './about.html',
  './contact.html',
  './privacy.html',
  './terms.html',
  './manifest.json',
  './css/style.css',
  './css/components.css',
  './js/app.js',
  './js/soundEffects.js',
  './js/confetti.js',
  './js/tools/imageCompressor.js',
  './js/tools/qrGenerator.js',
  './js/tools/pdfTools.js',
  './js/tools/jsonTools.js',
  './js/tools/passwordGen.js',
  './js/tools/financeCalc.js',
  './js/tools/textAnalyzer.js',
  './js/tools/colorStudio.js',
  './js/tools/base64Tool.js',
  './js/tools/unitConverter.js',
  './js/tools/markdownStudio.js',
  './js/tools/ageCalculator.js',
  './js/tools/diffChecker.js',
  './js/tools/exifScrubber.js',
  './js/tools/signaturePad.js',
  './assets/icons/favicon.svg',
  './assets/images/og-image.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('[SW] Cache addAll warning:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).then((response) => {
        return caches.open(CACHE_NAME).then((cache) => {
          if (response.status === 200) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      }).catch(() => caches.match('./index.html'));
    })
  );
});
