//This is the service worker with the combined offline experience (Offline page + Offline copy of pages)

//Install stage sets up the offline page in the cahche and opens a new cache
self.addEventListener('install', function (event) {
    event.waitUntil(preLoad());
});

var preLoad = function () {
    console.log('Инсталяция');
    return caches.open('BTWebClient').then(function (cache) {
        console.log('Кэширование главной и оффлайн страниц');
        return cache.addAll([
            '/bulkasamurai/',
            '/bulkasamurai/index.html',
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
            '/bulkasamurai/images/cancel.svg'
        ]);
    });
};

self.addEventListener('fetch', function (event) {
    console.log('Сервис воркер в процессе работы');
    event.respondWith(checkResponse(event.request).catch(function () {
            return returnFromCache(event.request)
        }
    ));
    event.waitUntil(addToCache(event.request));
});

var checkResponse = function (request) {
    return new Promise(function (fulfill, reject) {
        fetch(request).then(function (response) {
            if (response.status !== 404) {
                fulfill(response)
            } else {
                reject()
            }
        }, reject)
    });
};

var addToCache = function (request) {
    return caches.open('BTWebClient').then(function (cache) {
        return fetch(request).then(function (response) {
            console.log('Добавление страницы в оффлайн' + response.url);
            return cache.put(request, response);
        });
    });
};

var returnFromCache = function (request) {
    return caches.open('BTWebClient').then(function (cache) {
        return cache.match(request).then(function (matching) {
            if (!matching || matching.status == 404) {
                return cache.match('offline.html')
            } else {
                return matching
            }
        });
    });
};

self.addEventListener('push', function (event) {
    console.log('Получен пуш');
    console.log('Пуш данные: "${event.data.text()}"');
    const title = 'Байтех-Заявки';
    const options = {
        body: 'Все работает',
        icon: 'images/icon.png',
        badge: 'images/badge.png'
    };
    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function (event) {
    console.log('Клик по уведомлению');
    event.notification.close();
    event.waitUntil(
        clients.openWindow('https://developers.google.com/web/')
    );
});