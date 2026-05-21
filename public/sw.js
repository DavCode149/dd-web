let scramjet = null;

try {
  importScripts('https://cdn.jsdelivr.net/npm/@mercuryworkshop/scramjet@1.0.2-dev/scramjet.all.js');

  if (self.$scramjetLoadWorker) {
    const { ScramjetServiceWorker } = self.$scramjetLoadWorker();
    scramjet = new ScramjetServiceWorker();
  }
} catch (error) {
  console.error('[dd-web] Scramjet SW bootstrap failed:', error);
}

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  if (!scramjet) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith((async () => {
    try {
      await scramjet.loadConfig();

      if (scramjet.route(event)) {
        return scramjet.fetch(event);
      }
    } catch (error) {
      console.error('[dd-web] Scramjet fetch handler failed:', error);
    }

    return fetch(event.request);
  })());
});
