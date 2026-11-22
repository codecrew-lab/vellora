"use strict";
const CACHE="vellora-reader-shell-v2";
const SHELL=["/vellora/","/vellora/index.html","/vellora/manifest.webmanifest","/vellora/1795184280354.png","/vellora/icons/vellora-v.svg","/vellora/styles.css","/vellora/config.js","/vellora/app.js"];
self.addEventListener("install",event=>event.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener("activate",event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith("vellora-reader-")&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",event=>{
 const u=new URL(event.request.url);
 if(event.request.method!=="GET"||u.origin!==self.location.origin)return;
 if(u.pathname.startsWith("/vellora/admin-app/")||u.pathname.startsWith("/vellora/admin.html")||u.pathname.startsWith("/vellora/admin.js")||u.pathname.startsWith("/vellora/admin.css"))return;
 if(u.pathname==="/vellora/"||u.pathname==="/vellora/index.html"){
  event.respondWith(fetch(event.request).catch(()=>caches.match("/vellora/index.html").then(r=>r||caches.match("/vellora/"))));return;
 }
 if(u.pathname.startsWith("/vellora/")&&/\.(css|js|svg|png|webp|woff2?)$/.test(u.pathname)){
  event.respondWith(caches.match(event.request).then(hit=>hit||fetch(event.request).then(r=>{if(r.ok)caches.open(CACHE).then(c=>c.put(event.request,r.clone()));return r})));
 }
});
