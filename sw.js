// Service worker du Grimoire des Requêtes : tout le jeu est gardé sur l'appareil pour marcher sans Internet.
// Généré par build.py : la version change à chaque nouvelle version du jeu, l'ancien cache est alors remplacé.
const CACHE = "grimoire-9d61f37ff231";
const FILES = [
 "./",
 "assets/apple-touch-icon.png",
 "assets/chateau-1.webp",
 "assets/chateau-2.webp",
 "assets/chateau-3.webp",
 "assets/ecole-feu.webp",
 "assets/ecole-glace.webp",
 "assets/ecole-lumiere.webp",
 "assets/ecole-nature.webp",
 "assets/ecole-ombre.webp",
 "assets/heros-1.webp",
 "assets/heros-2.webp",
 "assets/heros-3.webp",
 "assets/heros-4.webp",
 "assets/heros-5.webp",
 "assets/heros-6.webp",
 "assets/icon-192.png",
 "assets/icon-512.png",
 "assets/icon-maskable-512.png",
 "assets/logo-128.webp",
 "assets/logo-480.webp",
 "assets/monstre-1.webp",
 "assets/monstre-2.webp",
 "assets/monstre-3.webp",
 "assets/monstre-4.webp",
 "assets/monstre-5.webp",
 "assets/monstre-6.webp",
 "assets/monstre-7.webp",
 "assets/monstre-8.webp",
 "assets/monstre-9.webp",
 "assets/region-crypte.webp",
 "assets/region-foret.webp",
 "assets/region-marais.webp",
 "assets/region-pics.webp",
 "assets/table-chateaux.webp",
 "assets/table-heros.webp",
 "assets/table-inventaire.webp",
 "assets/table-monstres.webp",
 "assets/table-sorts.webp",
 "assets/table-visites.webp",
 "confidentialite.html",
 "config.js",
 "css/style.css",
 "index.html",
 "js/actions.js",
 "js/data/levels.js",
 "js/data/schema.js",
 "js/engine.js",
 "js/main.js",
 "js/render.js",
 "js/state.js",
 "manifest.webmanifest",
 "premiers-pas.html",
 "sql/schema.sql",
 "vendor/sql-wasm-binary.js",
 "vendor/sql-wasm.js"
];
self.addEventListener("install", (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener("activate", (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith("grimoire-") && k !== CACHE && k !== "grimoire-polices").map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", (e) => {
  const req = e.request; if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {      // polices : gardées après la première visite
    e.respondWith(caches.open("grimoire-polices").then((c) => c.match(req).then((hit) => hit || fetch(req).then((r) => { if (r.ok || r.type === "opaque") c.put(req, r.clone()); return r; }))));
    return;
  }
  if (url.origin !== location.origin) return;            // le classement en ligne passe toujours par le réseau
  if (url.pathname.endsWith("/config.js")) {               // réglages : le réseau d'abord, la copie gardée sinon
    e.respondWith(fetch(req).then((r) => { caches.open(CACHE).then((c) => c.put(req, r.clone())); return r; }).catch(() => caches.match(req)));
    return;
  }
  e.respondWith(caches.match(req, { ignoreSearch: true }).then((hit) => hit || fetch(req).catch(() => req.mode === "navigate" ? caches.match("./index.html") : Response.error())));
});
