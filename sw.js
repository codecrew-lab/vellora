"use strict";

/*
 * VELLORA full-app offline shell.
 * Keep this worker scoped to the public VELLORA app; Supabase data/auth
 * mutations remain network-only and are never cached.
 */
const CACHE = "vellora-app-shell-v6";
const BASE = "/vellora/";
const SHELL = [
  BASE,
  BASE + "index.html",
  BASE + "reader.html",
  BASE + "submit.html",
  BASE + "manifest.webmanifest",
  BASE + "1795184280354.png",
  BASE + "styles.css",
  BASE + "config.js",
  BASE + "app.js"
];
const STATIC_CDN = [
  "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.119.1/dist/umd/supabase.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js",
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Lora:ital,wght@0,400;0,500;1,400&family=DM+Sans:wght@400;500&display=swap",
  "https://sfxmint.com/dl/paper-fabric-page-turn-33.mp3"
];
const FONT_ORIGINS = new Set(["https://fonts.googleapis.com", "https://fonts.gstatic.com"]);
const CDN_ORIGINS = new Set(["https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com", "https://sfxmint.com"]);

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // A missing optional remote resource must never prevent the app shell
    // from installing and becoming available offline.
    await Promise.allSettled(SHELL.map(url => cache.add(url)));
    await Promise.allSettled(STATIC_CDN.map(url => cache.add(url)));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys
      .filter(key => key.startsWith("vellora-reader-") || key.startsWith("vellora-app-shell-"))
      .filter(key => key !== CACHE)
      .map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

async function cacheFirst(request) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request, { ignoreSearch: true });
  if (cached) return cached;
  const response = await fetch(request);
  if (response && (response.ok || response.type === "opaque")) {
    await cache.put(request, response.clone());
  }
  return response;
}

async function networkFirst(request, fallbackUrl) {
  const cache = await caches.open(CACHE);
  try {
    const response = await fetch(request);
    if (response && response.ok) await cache.put(request, response.clone());
    return response;
  } catch (_) {
    const cached = await cache.match(request, { ignoreSearch: true });
    if (cached) return cached;
    if (fallbackUrl) {
      const fallback = await cache.match(fallbackUrl);
      if (fallback) return fallback;
    }
    return Response.error();
  }
}

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    // Cache only static libraries, web fonts, page-turn audio and image
    // resources. Supabase REST/auth/storage APIs are deliberately excluded.
    const isStaticCdn = CDN_ORIGINS.has(url.origin);
    const isFont = FONT_ORIGINS.has(url.origin);
    const isRemoteImage = request.destination === "image" &&
      /\.(avif|gif|jpe?g|png|svg|webp)$/i.test(url.pathname);
    if (isStaticCdn || isFont || isRemoteImage) {
      event.respondWith(cacheFirst(request).catch(() => caches.match(request, { ignoreSearch: true }).then(hit => hit || Response.error())));
    }
    return;
  }

  if (!url.pathname.startsWith(BASE)) return;

  // Do not take over the separate Admin Hub's own service-worker scope.
  if (url.pathname.startsWith(BASE + "admin-app/")) return;

  if (request.mode === "navigate") {
    const fallback = url.pathname.endsWith("/reader.html")
      ? BASE + "reader.html"
      : url.pathname.endsWith("/submit.html")
        ? BASE + "submit.html"
        : BASE + "index.html";
    event.respondWith(networkFirst(request, fallback));
    return;
  }

  if (/\.(css|js|svg|png|webp|jpe?g|woff2?|webmanifest)$/i.test(url.pathname)) {
    event.respondWith(cacheFirst(request).catch(() => caches.match(request, { ignoreSearch: true }).then(hit => hit || Response.error())));
  }
});
