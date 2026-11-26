/* L'Atelier hors ligne : la page, ses polices et ses icônes restent dans le téléphone.
   En ligne, la page se met à jour d'elle-même ; sans réseau, la copie gardée prend le relais. */
const CACHE = 'atelier-eb352806df';
const FILES = [
 "./",
 "./index.html",
 "./manifest.webmanifest",
 "./icons/apple-touch-icon.png",
 "./icons/icon-192.png",
 "./icons/icon-512.png",
 "./icons/maskable-192.png",
 "./icons/maskable-512.png",
 "./fonts/cormorant-garamond-latin-500-normal.woff2",
 "./fonts/cormorant-garamond-latin-600-normal.woff2",
 "./fonts/cormorant-garamond-latin-500-italic.woff2",
 "./fonts/space-grotesk-latin-400-normal.woff2",
 "./fonts/space-grotesk-latin-500-normal.woff2",
 "./fonts/space-grotesk-latin-600-normal.woff2",
 "./fonts/space-mono-latin-400-normal.woff2",
 "./fonts/space-mono-latin-700-normal.woff2"
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(f => new Request(f, {cache: 'reload'})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('atelier-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
function within(ms, p) {
  return new Promise((ok, ko) => { const t = setTimeout(() => ko(new Error('réseau trop lent')), ms); p.then(r => { clearTimeout(t); ok(r); }, e => { clearTimeout(t); ko(e); }); });
}
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  if (r.mode === 'navigate') {                    // la page : le réseau d'abord (3 s au plus), sinon la copie gardée
    e.respondWith(within(3000, fetch(r)).then(res => {
      if (res.ok) { const cp = res.clone(); caches.open(CACHE).then(c => c.put('./index.html', cp)); }
      return res;
    }).catch(() => caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(r, {ignoreSearch: true}).then(hit => hit || fetch(r).then(res => {
    if (res.ok) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(r, cp)); }
    return res;
  })));
});
