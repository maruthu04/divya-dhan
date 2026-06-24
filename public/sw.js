// Service Worker for DivyaDhan PWA

self.addEventListener('install', (event) => {
  // Force the waiting service worker to become the active service worker.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Allow the active service worker to set itself as the controller for all clients within its scope.
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // A basic fetch handler is required for browser PWA installation requirements.
  // By default, we let the browser handle requests natively via the network.
});
