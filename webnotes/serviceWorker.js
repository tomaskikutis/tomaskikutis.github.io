var CACHE = 'offline-fallback';

self.addEventListener('install', function(evt) {
    console.log('The service worker is being installed.');
    evt.waitUntil(precache().then(function() {
        return self.skipWaiting();
    }));
});

self.addEventListener('activate', function(evt) {
    evt.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function(evt) {
    console.log('The service worker is serving the asset.');
    evt.respondWith(networkOrCache(evt.request).catch(function() {
        return useFallback();
    }));
});

function precache() {
    return caches.open(CACHE).then(function(cache) {
        return cache.addAll([
            '/'
        ]);
    });
}

function networkOrCache(request) {
    return fetch(request).then(function(response) {
            return response.ok ? response : fromCache(request);
        })
        .catch(function() {
            return fromCache(request);
        });
}

function useFallback() {
    return caches.open(CACHE).then(function(cache) {
        return cache.match("/").then(function(matching) {
            return matching;
        });
    });
}

function fromCache(request) {
    return caches.open(CACHE).then(function(cache) {
        return cache.match(request).then(function(matching) {
            return matching || Promise.reject('request-not-in-cache');
        });
    });
}