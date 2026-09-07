const CACHE = "kus-koyu-denge-v3";
const SHELL = ["./", "./index.html", "./src/styles.css", "./src/styles-base.css", "./src/styles-home.css", "./src/styles-tokens.css", "./src/styles-game.css", "./src/styles-sheets.css", "./src/styles-responsive.css", "./src/app.js", "./src/actions.js", "./src/content.js", "./src/feedback.js", "./src/game-core.js", "./src/game-view.js", "./src/home-view.js", "./src/modals.js", "./src/state.js", "./src/tutorial.js", "./src/ui.js", "./manifest.webmanifest", "./app-icon.svg", "./privacy.html"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))));
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
    if (response.ok && new URL(event.request.url).origin === self.location.origin) {
      const copy = response.clone();
      caches.open(CACHE).then((cache) => cache.put(event.request, copy));
    }
    return response;
  }).catch(() => caches.match("./index.html"))));
});
