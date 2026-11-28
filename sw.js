"use strict";
const CACHE="vellora-app-shell-v33",BASE="/vellora/";
const SHELL=[BASE,BASE+"index.html",BASE+"reader.html",BASE+"submit.html",BASE+"manifest.webmanifest",BASE+"styles.css",BASE+"config.js",BASE+"app.js",BASE+"reading-diary.js",BASE+"reading-diary.css",BASE+"author-letters.js",BASE+"author-letters.css",BASE+"reading-analytics.js",BASE+"1795184280354.png"];
const STATIC_ORIGINS=new Set(["https://cdn.jsdelivr.net","https://cdnjs.cloudflare.com","https://fonts.googleapis.com","https://fonts.gstatic.com","https://sfxmint.com"]);
self.addEventListener("install",e=>e.waitUntil((async()=>{const c=await caches.open(CACHE);await Promise.allSettled(SHELL.map(u=>c.add(u)));await self.skipWaiting()})()));
self.addEventListener("activate",e=>e.waitUntil((async()=>{const k=await caches.keys();await Promise.all(k.filter(x=>x.startsWith("vellora-app-shell-")&&x!==CACHE).map(x=>caches.delete(x)));await self.clients.claim()})()));
async function netFirst(req,fb){const c=await caches.open(CACHE);try{const r=await fetch(req);if(r&&r.ok)c.put(req,r.clone());return r}catch(_){return(await c.match(req,{ignoreSearch:true}))||(fb?await c.match(fb):null)||Response.error()}}
async function cacheFirst(req){const c=await caches.open(CACHE),h=await c.match(req);if(h)return h;const r=await fetch(req);if(r&&r.ok)c.put(req,r.clone());return r}
self.addEventListener("fetch",e=>{const q=e.request;if(q.method!=="GET")return;const u=new URL(q.url);if(u.origin!==self.location.origin){if(STATIC_ORIGINS.has(u.origin))e.respondWith(netFirst(q).catch(()=>Response.error()));return}if(!u.pathname.startsWith(BASE)||u.pathname.startsWith(BASE+"admin-app/"))return;if(q.mode==="navigate"){const fb=u.pathname.endsWith("/reader.html")?BASE+"reader.html":u.pathname.endsWith("/submit.html")?BASE+"submit.html":BASE+"index.html";e.respondWith(netFirst(q,fb));return}if(/\.(css|js|svg|png|webp|jpe?g|woff2?|webmanifest)$/i.test(u.pathname))e.respondWith(netFirst(q).catch(()=>Response.error()))});

self.addEventListener("push",event=>{
 let payload={};try{payload=event.data?event.data.json():{}}catch(_){}
 const title=String(payload.title||"Your new book is ready! 📚");
 const options={body:String(payload.body||"A new story has arrived in the VELLORA Library. Tap here to start reading!"),icon:"/vellora/icons/vellora-192.svg",badge:"/vellora/icons/vellora-192.svg",tag:"vellora-book-"+String(payload.bookId||Date.now()),renotify:true,data:{url:String(payload.url||"/vellora/")}};
 event.waitUntil(self.registration.showNotification(title,options));
});
self.addEventListener("notificationclick",event=>{
 event.notification.close();
 const target=new URL(String(event.notification.data?.url||"/vellora/"),self.location.origin);
 if(target.origin!==self.location.origin||!target.pathname.startsWith("/vellora/"))target.href=new URL("/vellora/",self.location.origin).href;
 event.waitUntil((async()=>{
  const windows=await self.clients.matchAll({type:"window",includeUncontrolled:true});
  for(const client of windows){
   if(new URL(client.url).origin===self.location.origin&&new URL(client.url).pathname.startsWith("/vellora/")){
    await client.navigate(target.href);return client.focus();
   }
  }
  return self.clients.openWindow(target.href);
 })());
});
