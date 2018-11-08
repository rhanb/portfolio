importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.6.1/workbox-sw.js');

if (workbox) {
    workbox.precaching.precacheAndRoute([]);

    workbox.routing.registerRoute(
        new RegExp('.*\.js'),
        workbox.strategies.networkFirst()
    );

    workbox.routing.registerRoute(
        // Cache CSS files
        /.*\.css/,
        // Use cache but update in the background ASAP
        workbox.strategies.staleWhileRevalidate({
            // Use a custom cache name
            cacheName: 'css-cache',
        })
    );

    workbox.routing.registerRoute(
        // Cache image files
        /.*\.(?:png|jpg|jpeg|svg|gif)/,
        // Use the cache if it's available
        workbox.strategies.cacheFirst({
            // Use a custom cache name
            cacheName: 'image-cache'
        })
    );

    workbox.routing.registerRoute(
        // Cache image files
        /.*\.pdf/,
        // Use the cache if it's available
        workbox.strategies.cacheFirst({
            // Use a custom cache name
            cacheName: 'cv-cache'
        })
    );
}