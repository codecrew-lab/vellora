(()=>{"use strict";const K="vellora.readingDiary.v1",$=s=>document.querySelector(s),get=()=>{try{return JSON.parse(localStorage.getItem(K)||"[]")}catch{return[]}},esc=s=>String(s||"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));function letters(e){let t=e.title||"this story",a=e.author||"the author";return [["A Thank-You Note","Dear reader,","Thank you for giving "+t+" your time, attention and imagination. A story becomes a journey when someone chooses to read it.","Thank you for being part of this journey."],["Where It Began","A note about the beginning,","Every story begins with a spark: a question, an image or a feeling. "+t+" grew from that first spark into a world of its own.","Thank you for following this story."],["The World Between the Pages","To the curious reader,","You travelled through the world of "+t+". The people and places may live on the page, but your imagination gave them another life.","The world can stay alive in you."],["A Thought I Kept Aside","One last thought,","There are always possibilities outside a finished manuscript: paths not taken, questions left open and details each reader understands differently. Perhaps you noticed something others missed in "+t+".","Your interpretation is part of this story now."],["Just for You","Dear reader,","You brought your own memories and feelings to "+t+". If a scene made you pause or a character felt familiar, keep that feeling. It belongs to you now.","May these pages stay with you."],["Until the Next Story","Before you go,","The final page is not the end of your reading journey. Another book is waiting with a new voice and a different world. Thank you for spending part of your day inside "+t+".","With appreciation, "+a]].map((x,i)=>({id:i+1,title:x[0],salutation:x[1],body:x[2],closing:x[3],byline:a}));}let active=null,n=0,d=null;function open(e,i=0){active=e;n=Math.max(0,Math.min(5,i));if(!d){d=document.createElement("dialog");d.className="va-letter-dialog";d.innerHTML=`<div class="va-letter-shell"><header><small>VELLORA · SIX LETTERS</small><button data-close>×</button></header><p id="vaCount"></p><article class="va-paper"><h2 id="vaTitle"></h2><p id="vaSal"></p><p id="vaBody"></p><p id="vaClose"></p><p id="vaSign"></p></article><footer><button data-prev>← Previous</button><button data-next>Next letter →</button></footer><small class="va-note">A story-inspired VELLORA keepsake, not a personally authored letter unless supplied or approved by the author.</small></div>`;document.body.appendChild(d);d.addEventListener("click",ev=>{if(ev.target.closest("[data-close]"))d.close();if(ev.target.closest("[data-prev]"))open(active,n-1);if(ev.target.closest("[data-next]"))open(active,n+1)})}let v=(e.author_letters||letters(e))[n];$("#vaCount").textContent="LETTER "+(n+1)+" OF 6";$("#vaTitle").textContent=v.title;$("#vaSal").textContent=v.salutation;$("#vaBody").textContent=v.body;$("#vaClose").textContent=v.closing;$("#vaSign").textContent="— "+v.byline;d.querySelector("[data-prev]").disabled=n===0;d.querySelector("[data-next]").disabled=n===5;if(!d.open)d.showModal()}function render(){let h=$("#authorLettersEntries");if(!h)return;let a=get().sort((x,y)=>new Date(y.completed_at)-new Date(x.completed_at));a.forEach(e=>{if(!e.author_letters||e.author_letters.length!==6)e.author_letters=letters(e)});try{localStorage.setItem(K,JSON.stringify(a))}catch{}h.innerHTML=a.length?a.map(e=>`<article class="va-collection"><div><small>SIX LETTERS · STORY KEEPSAKE</small><h3>${esc(e.title)}</h3><p>For completing a story by ${esc(e.author)}</p></div><button data-open="${esc(e.book_id)}">Open letters</button></article>`).join(""):`<p class="va-empty">Complete a story in the Library to receive its six-letter collection.</p>`}document.addEventListener("click",e=>{let b=e.target.closest("[data-open]");if(b)open(get().find(x=>String(x.book_id)===b.dataset.open))});window.addEventListener("storage",e=>{if(e.key===K)render()});window.VelloraAuthorLetters={render,open};render()})();
(()=>{"use strict";
const $=s=>document.querySelector(s);
let notePage=null,onNote=false,lastPage=false,originalLabel="",originalRangeMax="",originalRangeValue="";
function getLetter(){
 const title=$("#readerTitle")?.textContent?.trim()||"this story";
 const meta=$("#dMeta")?.textContent||"";
 const author=(meta.split("·")[0]||"").trim()||"the author";
 let saved=null;
 try{
  const rows=JSON.parse(localStorage.getItem("vellora.readingDiary.v1")||"[]");
  saved=Array.isArray(rows)?rows.find(x=>String(x.title||"").trim()===title):null;
 }catch{}
 const supplied=saved?.author_note||saved?.author_letters?.[0]||null;
 if(supplied){
  return {
   title:supplied.title||"A Note from the Author",
   salutation:supplied.salutation||"Dear reader,",
   body:supplied.body||supplied.message||("Thank you for reading "+title+"."),
   closing:supplied.closing||"Thank you for being part of this story.",
   signature:supplied.byline||author
  };
 }
 return {
  title:"A Note from the Author",
  salutation:"Dear reader,",
  body:"Thank you for staying with "+title+" until the final page. I hope this story left you with a feeling, a question, or a small moment you will carry beyond these pages. Every reader discovers something different in a story, and what you take from these pages becomes part of its journey.",
  closing:"Thank you for giving this story a place in your imagination.",
  signature:author
 };
}
function build(){
 if(notePage)return notePage;
 notePage=document.createElement("section");
 notePage.className="va-premium-note-page";
 notePage.setAttribute("aria-label","Author's note");
 notePage.innerHTML='<div class="va-note-inner"><div class="va-note-kicker">VELLORA · A FINAL KEEPSAKE</div><p class="va-note-eyebrow">The story may end here…</p><h2>A little something<br>for you</h2><p class="va-note-hint">A private note from the author</p><button type="button" class="va-envelope" aria-label="Open the author's note"><span class="va-envelope-back"></span><span class="va-envelope-letter"><span>✧</span><b>A NOTE FOR YOU</b></span><span class="va-envelope-flap"></span><span class="va-envelope-front"></span><span class="va-envelope-seal">V</span></button><p class="va-note-tap">TAP THE ENVELOPE TO OPEN</p><article class="va-note-letter" hidden><div class="va-letter-rule">✧ &nbsp; V E L L O R A &nbsp; ✧</div><h3></h3><p class="va-letter-salutation"></p><p class="va-letter-body"></p><p class="va-letter-closing"></p><p class="va-letter-signature"></p></article><button type="button" class="va-note-back">← Back to the final story page</button></div>';
 $("#pageStage")?.append(notePage);
 const envelope=notePage.querySelector(".va-envelope");
 envelope.addEventListener("click",()=>{
  if(envelope.classList.contains("opened"))return;
  const letter=getLetter();
  notePage.querySelector(".va-note-letter h3").textContent=letter.title;
  notePage.querySelector(".va-letter-salutation").textContent=letter.salutation;
  notePage.querySelector(".va-letter-body").textContent=letter.body;
  notePage.querySelector(".va-letter-closing").textContent=letter.closing;
  notePage.querySelector(".va-letter-signature").textContent="— "+letter.signature;
  envelope.classList.add("opened");
  notePage.querySelector(".va-note-letter").hidden=false;
  notePage.querySelector(".va-note-tap").hidden=true;
 });
 notePage.querySelector(".va-note-back").addEventListener("click",hide);
 return notePage;
}
function show(){
 if(onNote)return;
 const stage=$("#pageStage"),frame=$("#pageFrame"),prev=$("#prevPage"),next=$("#nextPage"),label=$("#pageLabel"),range=$("#pageRange");
 if(!stage||!frame)return;
 originalLabel=label?.textContent||originalLabel;
 originalRangeMax=range?.max||originalRangeMax;
 originalRangeValue=range?.value||originalRangeValue;
 build();onNote=true;notePage.hidden=false;frame.hidden=true;
 if(prev)prev.hidden=true;if(next)next.hidden=true;
 if(label)label.textContent="Author's Note";
 if(range){range.disabled=true;range.setAttribute("aria-label","Author's Note page");}
}
function hide(){
 if(!onNote)return;
 onNote=false;
 if(notePage)notePage.hidden=true;
 const frame=$("#pageFrame"),prev=$("#prevPage"),next=$("#nextPage"),label=$("#pageLabel"),range=$("#pageRange");
 if(frame)frame.hidden=false;
 if(prev)prev.hidden=false;
 if(next){next.hidden=false;next.disabled=true;}
 if(label)label.textContent=originalLabel;
 if(range){range.disabled=false;if(originalRangeMax)range.max=originalRangeMax;if(originalRangeValue)range.value=originalRangeValue;}
}
function isFinalLabel(){
 const m=($("#pageLabel")?.textContent||"").match(/Page\s+(\d+)\s+of\s+(\d+)/i);
 return !!m&&Number(m[1])===Number(m[2])&&Number(m[2])>0;
}
function watch(){
 const label=$("#pageLabel"),next=$("#nextPage");
 if(!label||!next)return;
 const refresh=()=>{
  lastPage=isFinalLabel();
  if(!onNote&&lastPage)next.disabled=false;
 };
 new MutationObserver(refresh).observe(label,{childList:true,characterData:true,subtree:true});
 refresh();
 next.addEventListener("click",e=>{
  if(onNote||!lastPage)return;
  e.preventDefault();e.stopImmediatePropagation();show();
 },true);
 document.addEventListener("keydown",e=>{
  if(onNote&&e.key==="ArrowLeft"){e.preventDefault();e.stopImmediatePropagation();hide();return}
  if(!onNote&&lastPage&&e.key==="ArrowRight"){e.preventDefault();e.stopImmediatePropagation();show()}
 },true);
 const stage=$("#pageStage");
 stage?.addEventListener("touchend",e=>{
  if(onNote)return;
  const t=e.changedTouches?.[0],start=stage.__vaTouchX;
  if(lastPage&&Number.isFinite(start)&&t&&start-t.screenX>48){e.preventDefault();e.stopImmediatePropagation();show()}
 },{capture:true});
 stage?.addEventListener("touchstart",e=>{stage.__vaTouchX=e.changedTouches?.[0]?.screenX},{capture:true,passive:true});
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",watch,{once:true});else watch();
})();