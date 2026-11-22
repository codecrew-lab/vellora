"use strict";
const CACHE="vellora-reader-shell-v5";
const SHELL=["/vellora/","/vellora/index.html","/vellora/reader.html","/vellora/manifest.webmanifest","/vellora/1795184280354.png?v=20261122-maskable","/vellora/styles.css","/vellora/config.js","/vellora/app.js"];
const CDN=["https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.119.1/dist/umd/supabase.min.js","https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js","https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js"];
self.addEventListener("install",event=>event.waitUntil((async()=>{const c=await caches.open(CACHE);await c.addAll(SHELL);await Promise.allSettled(CDN.map(url=>c.add(url)));await self.skipWaiting()})()));
self.addEventListener("activate",event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith("vellora-reader-")&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",event=>{
 const r=event.request,u=new URL(r.url);if(r.method!=="GET")return;
 if(u.origin!==self.location.origin){if(CDN.includes(u.href))event.respondWith(caches.match(r).then(hit=>hit||fetch(r).then(res=>{if(res.ok)caches.open(CACHE).then(c=>c.put(r,res.clone()));return res})));return}
 if(!u.pathname.startsWith("/vellora/"))return;
 if(u.pathname.startsWith("/vellora/admin-app/")||u.pathname.startsWith("/vellora/admin.html")||u.pathname.startsWith("/vellora/admin.js")||u.pathname.startsWith("/vellora/admin.css"))return;
 if(r.mode==="navigate"){event.respondWith(fetch(r).then(res=>{if(res.ok)caches.open(CACHE).then(c=>c.put(r,res.clone()));return res}).catch(()=>caches.match(r,{ignoreSearch:true}).then(hit=>hit||caches.match("/vellora/index.html"))));return}
 if(/\.(css|js|svg|png|webp|woff2?)$/.test(u.pathname))event.respondWith(caches.match(r,{ignoreSearch:true}).then(hit=>hit||fetch(r).then(res=>{if(res.ok)caches.open(CACHE).then(c=>c.put(r,res.clone()));return res})));
});
