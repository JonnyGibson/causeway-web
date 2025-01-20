const CACHE_NAME = 'giants-causeway-v1';

// Get the base path dynamically
const BASE_PATH = self.location.pathname.includes('causeway') 
    ? '/causeway/'
    : '/';

console.log('[Service Worker] Using base path:', BASE_PATH);

const ASSETS_TO_CACHE = [
    BASE_PATH,
    BASE_PATH + 'index.html',
    BASE_PATH + 'assets/css/style.css',
    BASE_PATH + 'assets/js/app.js',
    BASE_PATH + 'assets/images/map.jpg',
    BASE_PATH + 'icon.png',
    BASE_PATH + 'manifest.json',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css',
    'https://fonts.googleapis.com/icon?family=Material+Icons',
    'https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js',
    'https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics-compat.js'
];

// Audio files to cache
const AUDIO_FILES = [
    BASE_PATH + 'assets/audio/en/guideintro.mp3',
    BASE_PATH + 'assets/audio/en/guide1.mp3',
    BASE_PATH + 'assets/audio/en/guide2.mp3',
    BASE_PATH + 'assets/audio/en/guide3.mp3',
    BASE_PATH + 'assets/audio/en/guide4.mp3',
    BASE_PATH + 'assets/audio/en/guide5.mp3',
    BASE_PATH + 'assets/audio/en/guide6.mp3'
];

// Install event - cache all static assets
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installation started');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(async (cache) => {
                console.log('[Service Worker] Cache opened, starting to add files');
                
                // Cache static assets one by one to identify which file fails
                for (const file of ASSETS_TO_CACHE) {
                    try {
                        const request = new Request(file, {
                            credentials: 'same-origin'
                        });
                        const response = await fetch(request);
                        if (!response || response.status !== 200) {
                            throw new Error(`HTTP ${response.status} received for ${file}`);
                        }
                        await cache.put(request, response);
                        console.log(`[Service Worker] Successfully cached: ${file}`);
                    } catch (error) {
                        console.error(`[Service Worker] Failed to cache: ${file}`, error);
                    }
                }

                // Try to cache audio files
                console.log('[Service Worker] Starting to cache audio files');
                const audioResults = await Promise.allSettled(
                    AUDIO_FILES.map(async (audioFile) => {
                        try {
                            const request = new Request(audioFile, {
                                credentials: 'same-origin'
                            });
                            const response = await fetch(request);
                            if (!response || response.status !== 200) {
                                throw new Error(`HTTP ${response.status} received for ${audioFile}`);
                            }
                            await cache.put(request, response);
                            console.log(`[Service Worker] Successfully cached audio: ${audioFile}`);
                        } catch (error) {
                            console.error(`[Service Worker] Failed to cache audio: ${audioFile}`, error);
                        }
                    })
                );

                console.log('[Service Worker] Installation complete');
                return Promise.resolve();
            })
            .catch(error => {
                console.error('[Service Worker] Installation failed:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activation started');
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log(`[Service Worker] Deleting old cache: ${cacheName}`);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
        .then(() => {
            console.log('[Service Worker] Activation complete');
            // Claim all clients to ensure the new service worker takes effect immediately
            return self.clients.claim();
        })
    );
});

// Fetch event - serve from cache, falling back to network
self.addEventListener('fetch', (event) => {
    // Only handle GET requests
    if (event.request.method !== 'GET') return;

    // Skip analytics requests
    if (event.request.url.includes('google-analytics.com')) return;

    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (response) {
                    console.log(`[Service Worker] Serving from cache: ${event.request.url}`);
                    return response;
                }

                console.log(`[Service Worker] Fetching from network: ${event.request.url}`);
                return fetch(event.request)
                    .then((response) => {
                        // Check if we received a valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clone the response as it can only be consumed once
                        const responseToCache = response.clone();

                        // Only cache local resources
                        if (event.request.url.startsWith(self.location.origin)) {
                            caches.open(CACHE_NAME)
                                .then((cache) => {
                                    console.log(`[Service Worker] Caching new resource: ${event.request.url}`);
                                    cache.put(event.request, responseToCache);
                                })
                                .catch(err => {
                                    console.error(`[Service Worker] Failed to cache: ${event.request.url}`, err);
                                });
                        }

                        return response;
                    })
                    .catch(error => {
                        console.error(`[Service Worker] Fetch failed: ${event.request.url}`, error);
                        return new Response('Network error', { 
                            status: 408, 
                            statusText: 'Network error',
                            headers: new Headers({
                                'Content-Type': 'text/plain'
                            })
                        });
                    });
            })
    );
}); 