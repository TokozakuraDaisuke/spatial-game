const CACHE = 'spatial-game-v11';
const FILES = ['./', './index.html', './manifest.json', './icon.svg'];
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)));
});
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith((async () => {
    try {
      let request = event.request;
      if (request.mode === 'navigate') {
        const fresh = new URL(request.url);
        fresh.searchParams.set('_refresh', CACHE);
        request = new Request(fresh.toString(), { credentials: 'same-origin', cache: 'no-store' });
      }
      const response = await fetch(request);
      if (event.request.mode === 'navigate' && response.ok) {
        const cache = await caches.open(CACHE);
        await cache.put(event.request, response.clone());
      }
      return response;
    } catch (error) {
      return (await caches.match(event.request)) || (await caches.match('./index.html'));
    }
  })());
});