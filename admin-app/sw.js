"use strict";
const CACHE="vellora-admin-shell-v1";
const SHELL=["/vellora/admin-app/","/vellora/admin-app/index.html","/vellora/admin-app/manifest.webmanifest","/vellora/admin.css","/vellora/admin.js","/vellora/icons/vellora-admin.svg"];
self.addEventListener("install",event=>event.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener("activate",event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith("vellora-admin-")&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",event=>{
 const u=new URL(event.request.url);
 if(event.request.method!=="GET"||u.origin!==self.location.origin)return;
 if(u.pathname.includes("/functions/v1/")||u.pathname.includes("/storage/")||u.pathname.includes("/rest/"))return;
 if(u.pathname==="/vellora/admin-app/"||u.pathname==="/vellora/admin-app/index.html"){
  event.respondWith(fetch(event.request).catch(()=>caches.match("/vellora/admin-app/index.html")));return;
 }
 if(u.pathname.startsWith("/vellora/")&&/\.(css|js|svg|webmanifest)$/.test(u.pathname)){
  event.respondWith(caches.match(event.request).then(hit=>hit||fetch(event.request).then(r=>{if(r.ok)caches.open(CACHE).then(c=>c.put(event.request,r.clone()));return r})));
 }
});
