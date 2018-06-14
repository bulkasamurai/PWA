var dataCacheName = 'weather-data-v1';
var cacheName = 'weather-pages-1';
var filesToCache = [
    '/bulkasamurai/',
    '/bulkasamurai/index.html',
    '/bulkasamurai/manifest.json',
    '/bulkasamurai/scripts/main.js',
    '/bulkasamurai/styles/styles.css',
    '/bulkasamurai/images/clear.png',
    '/bulkasamurai/images/cloudy-scattered-showers.png',
    '/bulkasamurai/images/cloudy.png',
    '/bulkasamurai/images/fog.png',
    '/bulkasamurai/images/add.svg',
    '/bulkasamurai/images/partly-cloudy.png',
    '/bulkasamurai/images/rain.png',
    '/bulkasamurai/images/scattered-showers.png',
    '/bulkasamurai/images/sleet.png',
    '/bulkasamurai/images/snow.png',
    '/bulkasamurai/images/thunderstorm.png',
    '/bulkasamurai/images/wind.png',
    '/bulkasamurai/images/reload.svg',
    '/bulkasamurai/images/sunny-bg.png',
    '/bulkasamurai/images/rain-bg.png',
    '/bulkasamurai/images/thunderstorms-bg.png',
    '/bulkasamurai/images/snow-bg.png',
    '/bulkasamurai/images/fog-bg.png',
    '/bulkasamurai/images/windy-bg.png',
    '/bulkasamurai/images/cloudy-bg.png',
    '/bulkasamurai/images/partly-cloudy-day-bg.png',
    '/bulkasamurai/images/favicon.ico',
    '/bulkasamurai/images/cancel.svg'
];

self.addEventListener('install', function(e) {
    console.log('[ServiceWorker] Install');
    e.waitUntil(
        caches.open(cacheName).then(function(cache) {
            console.log('[ServiceWorker] Caching app shell');
            return cache.addAll(filesToCache);
        })
    );
});

self.addEventListener('activate', function(e) {
    console.log('[ServiceWorker] Activate');
    e.waitUntil(
        caches.keys().then(function(keyList) {
            return Promise.all(keyList.map(function(key) {
                if (key !== cacheName && key !== dataCacheName) {
                    console.log('[ServiceWorker] Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
    );
    return self.clients.claim();
});

self.addEventListener('fetch', function(e) {
    console.log('[Service Worker] Fetch', e.request.url);
    var dataUrl = 'https://query.yahooapis.com/v1/public/yql';
    if (e.request.url.indexOf(dataUrl) > -1) {
        e.respondWith(
            caches.open(dataCacheName).then(function(cache) {
                return fetch(e.request).then(function(response){
                    cache.put(e.request.url, response.clone());
                    return response;
                }).catch(function() {
                    // Do nothing.
                });
            })
        );
    } else {
        e.respondWith(
            caches.match(e.request).then(function(response) {
                return response || fetch(e.request);
            })
        );
    }
});

self.addEventListener('push', function (event) {
    console.log('Push');
    const title = 'Weather';
    const options = {
        body: 'Everything ok'
    };
    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function (event) {
    console.log('Notification click');
    event.notification.close();
    event.waitUntil(
        clients.openWindow('https://developers.google.com/web/')
    );
});
