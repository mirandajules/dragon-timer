// Offline cache. Bump VERSION to push an update to installed copies.
const VERSION = 'dragon-timer-v1', ASSETS = ["./","index.html","icon.svg","icon-192.png","icon-512.png","design/background-clouds.webp","posters/standby.webp","posters/hands.webp","posters/teeth.webp","posters/tidy.webp","videos/standby.mp4","videos/hands-start.mp4","videos/hands-loop.mp4","videos/teeth-start.mp4","videos/teeth-loop.mp4","videos/tidy-start.mp4","videos/tidy-loop.mp4"];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith((async () => {
    const hit = await caches.match(e.request, { ignoreSearch: true });
    if (!hit) return fetch(e.request);
    const range = e.request.headers.get('range');
    if (!range) return hit;
    const buf = await hit.arrayBuffer(), m = /bytes=(\d*)-(\d*)/.exec(range);   // Safari asks for video byte ranges
    const start = m[1] ? +m[1] : 0, end = m[2] ? Math.min(+m[2], buf.byteLength - 1) : buf.byteLength - 1;
    return new Response(buf.slice(start, end + 1), { status: 206, headers: {
      'Content-Type': hit.headers.get('Content-Type') || 'video/mp4', 'Content-Length': end - start + 1,
      'Content-Range': 'bytes ' + start + '-' + end + '/' + buf.byteLength } });
  })());
});
