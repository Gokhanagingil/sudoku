const CACHE = "kus-koyu-denge-1.1.0";
const FILES = ["accessibility.js", "actions.js", "app.js", "backup.js", "clock.js", "content.js", "feedback.js", "game-core.js", "game-view.js", "home-view.js", "modals.js", "native.js", "shapes.js", "state.js", "store-tools.js", "tutorial.js", "ui.js", "styles.css", "styles-base.css", "styles-game.css", "styles-home.css", "styles-responsive.css", "styles-sheets.css", "styles-tokens.css"];
const SHELL = ["./", "./index.html", "./manifest.webmanifest", "./app-icon.svg", "./privacy.html", "./privacy.js", ...FILES.map(f => `./src/${f}`)];
self.addEventListener("install", event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL))));
// Wait until the old app is closed: never mix two game versions in an active session.
self.addEventListener("activate", event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith("kus-koyu-denge-") && key !== CACHE).map(key => caches.delete(key))))));
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET" || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(caches.open(CACHE).then(async cache => {
    const cached = await cache.match(event.request);
    if (cached) return cached;
    try { return await fetch(event.request); }
    catch { return event.request.mode === "navigate" ? (await cache.match("./index.html")) : Response.error(); }
  }));
});
