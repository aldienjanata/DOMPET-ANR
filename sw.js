const CACHE = 'dompet-anr-v4';
const ASSETS = ['./index.html','./manifest.json','./icon-192.png','./icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.allSettled(ASSETS.map(a => c.add(a).catch(()=>{}))))
      .then(() => self.skipWaiting())
  );
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.hostname.includes('script.google.com')) return;
  if (url.hostname.includes('fonts.') || url.hostname.includes('jsdelivr.net')) {
    e.respondWith(caches.match(e.request).then(c => c || fetch(e.request).then(r => {
      if (r && r.status === 200) { const cl=r.clone(); caches.open(CACHE).then(cache=>cache.put(e.request,cl)); }
      return r;
    })));
    return;
  }
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).catch(() => caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(e.request).then(c => c || fetch(e.request)));
});
