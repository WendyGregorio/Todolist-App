// Minimal Service Worker to allow installation without caching files.
// This ensures the application always loads the latest version from the server.

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

// Pass-through fetch handler (required for PWA installation in most browsers)
self.addEventListener('fetch', (event) => {
    // Just fetch directly from the network
    return;
});
