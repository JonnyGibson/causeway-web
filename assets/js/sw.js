const CACHE_NAME = 'giants-causeway-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/assets/css/style.css',
    '/assets/js/app.js',
    '/assets/images/map.jpg',
    '/icon.png',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css',
    'https://fonts.googleapis.com/icon?family=Material+Icons'
];

// Audio files to cache
const AUDIO_FILES = [
    '/assets/audio/en/guideintro.mp3',
    '/assets/audio/en/guide1.mp3',
    '/assets/audio/en/guide2.mp3',
    '/assets/audio/en/guide3.mp3',
    '/assets/audio/en/guide4.mp3',
    '/assets/audio/en/guide5.mp3',
    '/assets/audio/en/guide6.mp3'
];

// Install event - cache all static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll([...ASSETS_TO_CACHE, ...AUDIO_FILES]);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch event - serve from cache, falling back to network
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (response) {
                    return response; // Return cached version
                }
                return fetch(event.request)
                    .then((response) => {
                        // Check if we received a valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clone the response as it can only be consumed once
                        const responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    });
            })
    );
}); 