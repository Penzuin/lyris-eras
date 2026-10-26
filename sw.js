// Keeps the app shell on the phone so it opens offline. Ideas are never cached here:
// GitHub API calls always go to the network (the page keeps its own copy in the browser).
const CACHE = "lyris-eras-v1";
const SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL))); self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.hostname === "api.github.com") return;
  if (u.origin === location.origin) {   // network first, so updates show up; cache when offline
    e.respondWith(fetch(e.request).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; }).catch(() => caches.match(e.request).then(r => r || caches.match("./index.html"))));
  } else if (u.hostname.endsWith("gstatic.com") || u.hostname.endsWith("googleapis.com")) {   // fonts
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(n => { const copy = n.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return n; })));
  }
});
