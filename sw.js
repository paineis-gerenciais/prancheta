/* Service Worker — Prancheta (PWA)
   Estratégia: cache-first para o "casco" do app (funciona offline);
   dados do Firestore continuam indo direto pela rede/SDK. */
const CACHE = 'prancheta-v1';
const SHELL = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  // nunca intercepta Firestore/Auth
  if (url.hostname.includes('googleapis.com') || url.hostname.includes('firebaseapp.com')) return;

  // navegação: rede primeiro, fallback para o cache (offline)
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).catch(() => caches.match('./index.html')));
    return;
  }
  // estáticos (inclui fontes e SDK via CDN): cache primeiro, atualiza em segundo plano
  e.respondWith(
    caches.match(e.request).then(hit => {
      const net = fetch(e.request).then(res => {
        if (res.ok) caches.open(CACHE).then(c => c.put(e.request, res.clone()));
        return res;
      }).catch(() => hit);
      return hit || net;
    })
  );
});
