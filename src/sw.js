importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.6.3/workbox-sw.js');

if (workbox) {

    const { strategies, routing, precaching, expiration } = workbox;

    const expirationPlugin = new expiration.Plugin({
        // Only cache requests for a week
        maxAgeSeconds: 7 * 24 * 60 * 60,
        // Only cache 10 requests.
        maxEntries: 10,
    });

    precaching.precacheAndRoute([]);

    routing.registerRoute(
        // Cache JS files
        /.*\.js/,
        // Use cache but update in the background ASAP
        strategies.staleWhileRevalidate({
            // Use a custom cache name
            cacheName: 'js-cache'
        })
    );

    routing.registerRoute(
        // Cache CSS files
        /.*\.css/,
        strategies.staleWhileRevalidate({
            cacheName: 'css-cache',
        })
    );

    routing.registerRoute(
        // Cache image files
        /.*\.(?:png|jpg|jpeg|svg|gif)/,
        // Use cache first, network if it fails
        strategies.cacheFirst({
            cacheName: 'image-cache',
            plugins: [
                expirationPlugin
            ]
        })
    );

    routing.registerRoute(
        // Cache image files
        /.*\.pdf/,
        strategies.cacheFirst({
            cacheName: 'cv-cache',
            plugins: [
                expirationPlugin
            ]
        })
    );
}