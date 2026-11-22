"use strict";
const CACHE="vellora-admin-shell-v4";
const SHELL=["/vellora/admin-app/","/vellora/admin-app/index.html","/vellora/admin-app/manifest.webmanifest","/vellora/admin-app/admin.css","/vellora/admin-app/admin.js","/vellora/1795184280354.png?v=20261122-logo"];
self.addEventListener("install",event=>event.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener("activate",event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith("vellora-admin-")&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",event=>{
 const req=event.request,u=new URL(req.url);
 if(req.method!=="GET"||u.origin!==self.location.origin)return;
 if(u.pathname.includes("/functions/v1/")||u.pathname.includes("/storage/")||u.pathname.includes("/rest/"))return;
 if(u.pathname==="/vellora/admin-app/"||u.pathname==="/vellora/admin-app/index.html"){
  event.respondWith(fetch(req).catch(()=>caches.match("/vellora/admin-app/index.html")));return;
 }
 if(u.pathname.startsWith("/vellora/admin-app/")&&/\.(css|js|svg|webmanifest)$/.test(u.pathname)){
  event.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(r=>{if(r.ok)caches.open(CACHE).then(c=>c.put(req,r.clone()));return r})));
 }
});
