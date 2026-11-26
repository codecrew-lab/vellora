/* VELLORA Reading Analytics — device-local, account-free tracking. */
(()=>{
 "use strict";
 const KEY="vellora.reading-analytics.v1";
 const read=()=>{try{return JSON.parse(localStorage.getItem(KEY))||{books:{},days:{}}}catch{return {books:{},days:{}}}};
 const write=data=>{try{localStorage.setItem(KEY,JSON.stringify(data))}catch(e){console.warn("VELLORA reading analytics storage:",e)}};
 const fmt=ms=>{const m=Math.max(0,Math.floor(ms/60000)),h=Math.floor(m/60),r=m%60;return h? h+"h "+r+"m":r+"m"};
 const dayKey=d=>{const x=new Date(d);return x.getFullYear()+"-"+String(x.getMonth()+1).padStart(2,"0")+"-"+String(x.getDate()).padStart(2,"0")};
 const isReader=!!document.getElementById("book")&&location.pathname.toLowerCase().endsWith("reader.html");
 if(isReader){
  const params=new URLSearchParams(location.search),id=params.get("id");
  if(!id||params.get("preview")==="1")return;
  let title="",active=false,lastActivity=Date.now(),lastTick=Date.now(),interval=null;
  const IDLE_LIMIT=5*60*1000,MAX_TICK=20*1000;
  const refreshTitle=()=>{const el=document.getElementById("ttl");const value=(el?.textContent||"").split(" · ")[0].trim();if(value&&value!=="Loading story…")title=value};
  const start=()=>{refreshTitle();if(!title||document.visibilityState!=="visible"||Date.now()-lastActivity>IDLE_LIMIT)return;active=true;lastTick=Date.now();};
  const pause=()=>{if(!active)return;tick();active=false};
  const tick=()=>{
   if(!active)return;
   const now=Date.now(),elapsed=Math.max(0,Math.min(MAX_TICK,now-lastTick));lastTick=now;
   if(!elapsed)return;
   const data=read(),entry=data.books[String(id)]||{title:title||"Untitled book",totalMs:0,lastReadAt:null};
   entry.title=title||entry.title;entry.totalMs=Math.max(0,Number(entry.totalMs)||0)+elapsed;entry.lastReadAt=new Date(now).toISOString();
   data.books[String(id)]=entry;const day=dayKey(now);data.days[day]=(Number(data.days[day])||0)+elapsed;write(data);
  };
  const activity=()=>{lastActivity=Date.now();if(document.visibilityState==="visible"&&!active)start()};
  ["pointerdown","pointermove","keydown","touchstart","wheel","scroll"].forEach(name=>addEventListener(name,activity,{passive:true}));
  document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="hidden")pause();else activity()});
  addEventListener("pagehide",pause);addEventListener("beforeunload",pause);
  const observer=new MutationObserver(refreshTitle);const titleEl=document.getElementById("ttl");if(titleEl)observer.observe(titleEl,{childList:true,subtree:true,characterData:true});
  refreshTitle();start();
  interval=setInterval(()=>{if(document.visibilityState!=="visible"||Date.now()-lastActivity>IDLE_LIMIT){pause();return}tick();if(!active)start()},15000);
  return;
 }
 const library=document.getElementById("library");
 if(!library)return;
 const section=document.createElement("section");section.id="readingActivity";section.className="reading-activity";
 section.innerHTML='<div class="sec"><small>Your personal reading journal</small><h2>Reading Activity</h2><p class="count">Your reading time, saved privately on this device.</p></div><div class="ra-summary"><article><span>Total reading time</span><strong id="raTotal">0m</strong></article><article><span>Books explored</span><strong id="raBooks">0</strong></article><article><span>Last 7 days</span><strong id="raWeek">0m</strong></article></div><div class="ra-list-head"><h3>Time by book</h3><button type="button" id="raRefresh">Refresh</button></div><div id="raBooksList" class="ra-books-list"></div><button type="button" id="raMore" class="ra-more" hidden>Show more</button><p class="ra-empty" id="raEmpty" hidden>No reading time recorded yet. Open any book and start reading — VELLORA will track it automatically.</p>';
 const recommended=document.getElementById("recommendedShelf");
 (recommended||library).parentNode.insertBefore(section,recommended||library);
 const style=document.createElement("style");style.textContent=`.reading-activity{max-width:1040px;margin:58px auto 40px;padding:0 clamp(16px,4vw,36px);color:var(--text)}.reading-activity .sec{margin:0 0 22px}.ra-summary{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.ra-summary article{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:18px;display:grid;gap:8px}.ra-summary article span,.ra-list-head button{font: .72rem var(--ui);letter-spacing:.08em;color:var(--text2)}.ra-summary strong{font:600 clamp(1.35rem,3vw,2rem) var(--display);color:var(--accent)}.ra-list-head{display:flex;align-items:center;justify-content:space-between;margin:24px 0 10px}.ra-list-head h3{font:600 1.45rem var(--display)}.ra-list-head button{border:1px solid var(--border);border-radius:999px;padding:8px 14px;background:var(--surface);color:var(--text)}.ra-books-list{display:grid;gap:9px}.ra-book{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px 16px;align-items:center;padding:14px 16px;border:1px solid var(--border);border-radius:12px;background:var(--surface)}.ra-book strong{font:500 1rem var(--display);overflow-wrap:anywhere}.ra-book time{font: .8rem var(--ui);color:var(--accent);white-space:nowrap}.ra-book small{grid-column:1/-1;font: .7rem var(--ui);color:var(--text2)}.ra-more{display:block;margin:14px auto 0;padding:10px 22px;border:1px solid var(--border);border-radius:999px;background:var(--surface);color:var(--text);font:.78rem var(--ui);letter-spacing:.06em;cursor:pointer}.ra-more[hidden]{display:none!important}.ra-empty{padding:18px;text-align:center;color:var(--text2);font:.85rem var(--ui);border:1px dashed var(--border);border-radius:12px}@media(max-width:560px){.ra-summary{gap:7px}.ra-summary article{padding:12px 10px}.ra-summary article span{font-size:.62rem}.ra-book{padding:12px}}`;
 document.head.appendChild(style);
 let showAllBooks=false;
 const render=()=>{
  const data=read(),books=Object.entries(data.books||{}).filter(([,b])=>Number(b.totalMs)>0).sort((a,b)=>(b[1].totalMs||0)-(a[1].totalMs||0));
  const total=books.reduce((n,[,b])=>n+(Number(b.totalMs)||0),0),now=new Date(),week=Array.from({length:7},(_,i)=>{const d=new Date(now);d.setDate(now.getDate()-i);return Number(data.days?.[dayKey(d)]||0)}).reduce((a,b)=>a+b,0);
  document.getElementById("raTotal").textContent=fmt(total);document.getElementById("raBooks").textContent=String(books.length);document.getElementById("raWeek").textContent=fmt(week);
  const list=document.getElementById("raBooksList"),empty=document.getElementById("raEmpty"),more=document.getElementById("raMore");empty.hidden=books.length>0;
  list.innerHTML=books.slice(0,showAllBooks?books.length:4).map(([,b])=>'<div class="ra-book"><strong>'+escapeHtml(b.title||"Untitled book")+'</strong><time>'+fmt(Number(b.totalMs)||0)+'</time><small>Last read '+(b.lastReadAt?new Date(b.lastReadAt).toLocaleDateString():"—")+'</small></div>').join("");
  more.hidden=books.length<=4;more.textContent=showAllBooks?"Show less":"Show more";
 };
 const escapeHtml=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 document.getElementById("raRefresh").addEventListener("click",render);document.getElementById("raMore").addEventListener("click",()=>{showAllBooks=!showAllBooks;render()});addEventListener("storage",e=>{if(e.key===KEY)render()});render();
})();