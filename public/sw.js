const CACHE_NAME = 'cloud-task-v2';
const ASSETS = [
    '/',
    '/index.html',
    '/manifest.webmanifest',
    '/icon-192x192.png',
    '/icon-512x512.png',
    '/vite.svg'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    // Only handle GET requests
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(event.request).catch(() => {
                // If both fail, and it's a navigation request, return index.html
                if (event.request.mode === 'navigate') {
                    return caches.match('/');
                }
            });
        })
    );
});
