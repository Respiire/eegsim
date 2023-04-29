const CACHE_NAME = "eegsim-cache-v0.0.89";
const urlsToCache = [
  "/",
];
self.addEventListener("install", async (event) => {
  self.skipWaiting();
  event.waitUntil(cache_assets());
});
async function cache_assets() {
  const cache = await self.caches.open(CACHE_NAME);
  return cache.addAll(urlsToCache);
}
self.addEventListener("activate", async (event) => {
  event.waitUntil(delete_old_caches());
});
async function delete_old_caches() {
  const keys = await caches.keys();
  const deletePromises = keys
    .filter((key) => key !== CACHE_NAME)
    .map((key) => self.caches.delete(key));
  return Promise.all(deletePromises);
}
self.addEventListener("fetch", (event) => {
  event.respondWith(get_response(event.request));
});
async function get_response(request) {
  const cache = await self.caches.open(CACHE_NAME);
  const cached_response = await cache.match(request);
  const pending_response = fetch(request).then((response) => {
    cache.put(request, response.clone());
    return response;
  });
  return cached_response || pending_response;
}
