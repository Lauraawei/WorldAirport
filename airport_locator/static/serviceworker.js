const CACHE_NAME = "airport-locator-cache-v2"; // Updated cache version
const urlsToCache = [
  "/",
  "/static/css/style.css",  // Updated path for the CSS file
  "/static/js/map.js",  // Updated path for the JS file
  "/map",  // Dynamic map page
  "/static/icons/icon-192x192.png",  // Add your PWA icons
  "/static/icons/icon-512x512.png",  // Add your PWA icons
  "/login",  // Login page
  "/signup",  // Signup page
];

// Install Service Worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache");
      return cache.addAll(urlsToCache);
    })
  );
});

// Fetch requests
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        console.log(`Serving cached: ${event.request.url}`);
        return response; // Return cached response if available
      }
      console.log(`Fetching: ${event.request.url}`);
      return fetch(event.request); // Fetch from the network if not cached
    }).catch((error) => {
      console.error("Fetch failed; returning offline page.", error);
      throw error;
    })
  );
});

// Activate Service Worker
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log(`Deleting cache: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
