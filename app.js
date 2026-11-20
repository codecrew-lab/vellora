(function(){
"use strict";
const cfg=window.VELLORA_CONFIG||{},db=window.supabase&&cfg.url?window.supabase.createClient(cfg.url,cfg.publishableKey):null,$=s=>document.querySelector(s);
const store={get(k,d){try{return JSON.parse(localStorage.getItem(k))??d}catch(_){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(_){}}};
const themes=[["manuscript","Enhanced Manuscript","Faded manuscript","#EDE3D0"],["vellum","Classic Vellum","Warm ivory","#FFFCF7"],["heritage","Dark Heritage","Deep antique brown","#2D231C"]];
let books=[],genre="All",language="All",sortMode="newest",active=null,pdf=null,page=1,sound=store.get("vellora.sound",false),outline=[],drawVersion=0,renderTask=null,readerResizeTimer=null;
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const slug=v=>String(v||"book").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
function theme(t){if(!themes.some(x=>x[0]===t))t="manuscript";document.documentElement.dataset.theme=t;store.set("vellora.theme",t)}
theme(store.get("vellora.theme","manuscript"));
/* Original VELLORA manuscript opening — preserved from the supplied index.html. */
const landing=$("#landing");
function showLanding(){
  landing.hidden=false;
  landing.className="";
  const dust=$("#dust");
  dust.innerHTML="";
  for(let i=0;i<26;i++){
    const p=document.createElement("i");
    p.style.cssText=`left:${Math.random()*100}%;top:${50+Math.random()*50}%;animation-duration:${9+Math.random()*10}s;animation-delay:${-Math.random()*12}s;transform:scale(${.6+Math.random()*1.4})`;
    dust.appendChild(p);
  }
  $("#open").focus();
}
$("#open").onclick=()=>{
  landing.classList.add("opening");
  store.set("vellora.seen",1);
  setTimeout(()=>{landing.hidden=true},1800);
};
/* Always show the signature opening on a fresh page load, even if a
   previous preview already set the old one-time seen flag. */
showLanding();

function cover(b){const styles={nocturne:"cover-nocturne",botanical:"cover-botanical",gilded:"cover-gilded",midnight:"cover-midnight",terracotta:"cover-terracotta"};const key=String(b.cover_url||"").replace("vellora-cover://","");const cls=styles[key]||"cover-nocturne";const titleLength=String(b.title||"").trim().length;const titleScale=titleLength>42?0.66:titleLength>30?0.76:titleLength>22?0.86:titleLength>14?0.94:1;return '<div class="cover '+cls+'" style="--title-scale:'+titleScale+'"><em>'+esc(b.genre||"VELLORA EDITIONS")+'</em><b>'+esc(b.title||"Untitled") +'</b><small>'+esc(b.author||"VELLORA")+'</small></div>'}
function card(b){return '<button class="card" data-id="'+esc(b.id)+'">'+cover(b)+'<h3>'+esc(b.title)+'</h3><p>'+esc(b.description||"")+'</p><div class="meta">'+esc(b.author||"VELLORA")+' · '+esc(b.genre||"")+'</div></button>'}
function empty(el,title,msg){el.innerHTML='<div class="empty-state"><h3>'+title+'</h3><p>'+msg+'</p></div>'}
function recent(){return store.get("vellora.recent",[]).map(id=>books.find(b=>b.id===id)).filter(Boolean)}
function favorites(){return [...new Set(store.get("vellora.favorites",[]).map(String))].map(id=>books.find(b=>String(b.id)===id)).filter(Boolean)}
function isFavorite(id){return store.get("vellora.favorites",[]).some(x=>String(x)===String(id))}
function drawFavorites(){
 const shelf=$("#favoritesShelf");if(!shelf)return;
 const saved=favorites();shelf.hidden=false;
 shelf.innerHTML='<div class="discovery-heading"><span class="eyebrow">Your personal collection</span><h2>Favourite books <span class="favorite-count">'+saved.length+'</span></h2><p class="favorite-intro">Keep the stories you love close at hand.</p></div>'+(saved.length?'<div class="cont">'+saved.map(card).join("")+'</div>':'<div class="favorite-empty"><span aria-hidden="true">♡</span><b>Your shelf is waiting.</b><p>Open any book and choose “Save to favourites” to collect it here.</p></div>');
}
function toggleFavorite(id){
 const list=store.get("vellora.favorites",[]).map(String),key=String(id),next=list.includes(key)?list.filter(x=>x!==key):[...list,key];
 store.set("vellora.favorites",next);drawFavorites();
 if(active&&String(active.id)===key)updateFavoriteButton();
}
function updateFavoriteButton(){
 const button=$("#favoriteBook");if(!button||!active)return;
 const saved=isFavorite(active.id);button.setAttribute("aria-pressed",String(saved));
 button.textContent=saved?"♥ Saved to favourites":"♡ Save to favourites";
}
function drawRecent(){const r=recent();$("#continue").hidden=!r.length;$("#contRow").innerHTML=r.map(card).join("")}\nfunction readingStats(){
 const progress=books.map(b=>({book:b,data:store.get("vellora.progress."+b.id,null)})).filter(x=>x.data&&Number(x.data.total)>0);
 const pages=progress.reduce((sum,x)=>sum+Math.max(0,Number(x.data.maxPage)||Number(x.data.page)||0),0);
 const completed=progress.filter(x=>Math.max(Number(x.data.maxPage)||0,Number(x.data.page)||0)>=Number(x.data.total)).length;
 const inProgress=progress.filter(x=>Math.max(Number(x.data.maxPage)||0,Number(x.data.page)||0)<Number(x.data.total)).length;
 const now=new Date(),cutoff=new Date(now.getFullYear(),now.getMonth(),now.getDate()-6),days=store.get("vellora.readingDays",[]).filter(day=>{const d=new Date(day+"T00:00:00");return !Number.isNaN(d.getTime())&&d>=cutoff&&d<=now});
 return {pages,completed,inProgress,activeDays:new Set(days).size};
}
function drawReadingInsights(){
 const section=$("#readingInsights");if(!section)return;const s=readingStats();
 section.innerHTML='<div class="discovery-heading"><span class="eyebrow">Your personal reading journey</span><h2>Reading insights</h2><p class="insights-intro">A quiet look at the progress you have made on this device.</p></div><div class="insight-grid"><article class="insight-card"><span>Pages reached</span><b>'+s.pages.toLocaleString()+'</b><small>Across your saved reading positions</small></article><article class="insight-card"><span>Books completed</span><b>'+s.completed+'</b><small>Reached the final page</small></article><article class="insight-card"><span>In progress</span><b>'+s.inProgress+'</b><small>Books with a saved position</small></article><article class="insight-card"><span>Active days</span><b>'+s.activeDays+'<i> / 7</i></b><small>Days you read in the past week</small></article></div><p class="insights-note">Your reading activity stays in this browser and is not shared with the library.</p>';
}
function buildLibraryTools(){
const bar=$("#library .bar");if(!bar||$("#sortBooks"))return;
const select=document.createElement("select");select.id="sortBooks";select.setAttribute("aria-label","Sort books");select.innerHTML='<option value="newest">Newest first</option><option value="title">Title A–Z</option><option value="author">Author A–Z</option><option value="genre">Genre A–Z</option>';select.value=sortMode;select.className="sort-select";bar.append(select);
const languageSelect=document.createElement("select");languageSelect.id="languageFilter";languageSelect.setAttribute("aria-label","Filter by language");languageSelect.className="sort-select language-select";languageSelect.innerHTML='<option value="All">All languages</option>';bar.append(languageSelect);
const clear=document.createElement("button");clear.type="button";clear.id="clearLibraryFilters";clear.className="clear-filters";clear.textContent="Clear filters";clear.hidden=true;bar.append(clear);
const insights=document.createElement("section");insights.id="readingInsights";insights.className="discovery-section reading-insights";$("#continue").after(insights);\nconst fav=document.createElement("section");fav.id="favoritesShelf";fav.className="discovery-section favorites-shelf";fav.hidden=true;$("#readingInsights").after(fav);
const count=document.createElement("p");count.id="libraryResults";count.className="library-results";bar.after(count);
const rec=document.createElement("section");rec.id="recommendedShelf";rec.className="discovery-section";rec.hidden=true;count.after(rec);
const genres=document.createElement("section");genres.id="genreShelf";genres.className="discovery-section";genres.innerHTML='<div class="discovery-heading"><span class="eyebrow">Find your next world</span><h2>Explore by genre</h2></div><div class="genre-tiles" id="genreTiles"></div>';rec.after(genres);
select.addEventListener("change",()=>{sortMode=select.value;drawGrid()});
}
function drawDiscovery(){
const rec=books.filter(b=>b.is_recommended);
const shelf=$("#recommendedShelf");
if(shelf){shelf.hidden=!rec.length;shelf.innerHTML=rec.length?'<div class="discovery-heading"><span class="eyebrow">Handpicked for your journey</span><h2>Recommended reads</h2></div><div class="cont">'+rec.slice(0,10).map(card).join("")+'</div>':""}
const counts=[...new Set(books.map(b=>String(b.genre||"").trim()).filter(Boolean))].sort((x,y)=>x.localeCompare(y));
const tiles=$("#genreTiles");
if(tiles)tiles.innerHTML=counts.length?counts.map(g=>'<button class="genre-tile" data-genre-tile="'+esc(g)+'"><span>'+esc(g)+'</span><small>'+books.filter(b=>String(b.genre||"").trim()===g).length+' '+(books.filter(b=>String(b.genre||"").trim()===g).length===1?'edition':'editions')+'</small></button>').join(""):'<p class="empty">Genres will appear as books are published.</p>';
}
function drawGrid(){
const q=($("#search").value||"").toLowerCase().trim();
const gs=["All"].concat([...new Set(books.map(b=>String(b.genre||"").trim()).filter(Boolean))].sort((x,y)=>x.localeCompare(y)));
$("#chips").innerHTML=gs.map(g=>'<button class="chip" aria-pressed="'+(g===genre)+'" data-g="'+esc(g)+'">'+esc(g)+'</button>').join("");
const languages=[...new Set(books.map(b=>String(b.language||"").trim()).filter(Boolean))].sort((x,y)=>x.localeCompare(y));
const languageSelect=$("#languageFilter");
if(languageSelect){
 const options=['<option value="All">All languages</option>',...languages.map(item=>'<option value="'+esc(item)+'">'+esc(item)+'</option>')];
 languageSelect.innerHTML=options.join("");
 if(!languages.includes(language))language="All";
 languageSelect.value=language;
}
const haystack=b=>[b.title,b.author,b.description,b.genre,b.language].map(value=>String(value||"")).join(" ").toLowerCase();
let found=books.filter(b=>(genre==="All"||String(b.genre||"").trim()===genre)&&(language==="All"||String(b.language||"").trim()===language)&&(!q||haystack(b).includes(q)));
found.sort((x,y)=>sortMode==="title"?String(x.title||"").localeCompare(String(y.title||"")):sortMode==="author"?String(x.author||"").localeCompare(String(y.author||"")):sortMode==="genre"?String(x.genre||"").localeCompare(String(y.genre||"")):new Date(y.created_at||0)-new Date(x.created_at||0));
const activeFilters=Boolean(q||genre!=="All"||language!=="All"),clear=$("#clearLibraryFilters");
if(clear)clear.hidden=!activeFilters;
const result=$("#libraryResults");if(result)result.textContent=found.length+" "+(found.length===1?"book":"books")+(activeFilters?" match your filters":" in the library");
if(found.length)$("#grid").innerHTML=found.map(card).join("");
else empty($("#grid"),books.length?"No matching stories":"The library is waiting for its first story",books.length?'Try a different title, author or language, or clear your filters.':'New books published by the VELLORA admin will appear here.');
}
async function load(){if(!db){empty($("#grid"),"Library connection unavailable","Check the public Supabase configuration.");return}const {data,error}=await db.from("books").select("id,title,author,slug,description,genre,cover_url,pdf_path,language,reading_time_minutes,is_featured,is_recommended,is_published,created_at").eq("is_published",true).order("created_at",{ascending:false});if(error){empty($("#grid"),"Could not load the library","Please refresh or check the Supabase books SELECT policy.");console.error(error);return}books=data||[];buildLibraryTools();drawDiscovery();const f=books.find(b=>b.is_featured)||books[0];if(f){$("#featured").hidden=false;$("#featured").innerHTML='<div class="featured"><span class="tag">Featured story</span>'+cover(f)+'<div><div class="meta">'+esc(f.author||"")+' · '+esc(f.genre||"")+'</div><h2>'+esc(f.title)+'</h2><p>'+esc(f.description||"")+'</p><button class="btn" data-id="'+esc(f.id)+'">Discover story</button></div></div>'}else $("#featured").hidden=true;drawGrid();drawRecent();drawReadingInsights();drawFavorites()}
function openBook(id){
 active=books.find(b=>String(b.id)===String(id));if(!active)return;
 store.set("vellora.recent",[active.id,...store.get("vellora.recent",[]).filter(x=>x!==active.id)].slice(0,12));
 $("#dT").textContent=active.title||"Untitled";
 $("#dMeta").textContent=(active.author||"VELLORA")+" · "+(active.genre||"")+" · "+(active.language||"English");
 $("#dDesc").textContent=active.description||"";
 $("#dCover").innerHTML=cover(active);
 const facts=[["Genre",active.genre||"Uncategorised"],["Language",active.language||"English"],["Reading time",Number(active.reading_time_minutes)>0?Number(active.reading_time_minutes)+" min":"Not specified"]];
 $("#dDetails").innerHTML=facts.map(([label,value])=>'<span class="detail-fact"><small>'+esc(label)+'</small><b>'+esc(value)+'</b></span>').join("");
 const progress=store.get("vellora.progress."+active.id,null),progressBox=$("#dProgress");
 if(progress&&Number(progress.total)>0){
  const pct=Math.max(0,Math.min(100,Math.round(Number(progress.page||1)/Number(progress.total)*100)));
  progressBox.hidden=false;progressBox.innerHTML='<div class="detail-progress-heading"><span>YOUR READING PROGRESS</span><b>'+pct+'%</b></div><div class="detail-progress-track"><i style="width:'+pct+'%"></i></div><small>Page '+Math.max(1,Number(progress.page)||1)+' of '+Number(progress.total)+'</small>';
 }else{progressBox.hidden=true;progressBox.innerHTML=""}
 $("#readBook").hidden=!active.pdf_path;$("#downloadBook").hidden=!active.pdf_path;
 $("#readBook").textContent=progress&&active.pdf_path?"Continue reading":"Read book";
 updateFavoriteButton();$("#dlg").showModal();drawRecent();
}
async function signed(){if(!active||!active.pdf_path)throw Error("This book has no PDF file yet.");const {data,error}=await db.storage.from("book-files").createSignedUrl(active.pdf_path,600);if(error)throw error;return data.signedUrl}
async function download(){try{const a=document.createElement("a");a.href=await signed();a.download=slug(active.title)+".pdf";a.rel="noopener";document.body.append(a);a.click();a.remove()}catch(e){alert("Download unavailable: "+e.message)}}
function save(){if(!pdf||!active)return;const percent=Math.round(page/pdf.numPages*100),key="vellora.progress."+active.id,previous=store.get(key,{}),oldMax=Math.max(Number(previous.maxPage)||0,Number(previous.page)||0),newMax=Math.max(oldMax,page);store.set(key,{page:page,total:pdf.numPages,maxPage:newMax,updatedAt:Date.now()});window.dispatchEvent(new CustomEvent("vellora:pages-read",{detail:{pages:Math.max(0,newMax-oldMax)}}));const now=new Date(),day=[now.getFullYear(),String(now.getMonth()+1).padStart(2,"0"),String(now.getDate()).padStart(2,"0")].join("-"),days=store.get("vellora.readingDays",[]);store.set("vellora.readingDays",[...new Set([...days,day])].sort().slice(-365));$("#readerProgress").innerHTML='<div class="progress-copy"><span>Reading progress</span><b>'+percent+'%</b></div><div class="progress-track"><i style="width:'+percent+'%"></i></div><small>Page '+page+' of '+pdf.numPages+'</small>';$("#readerProgress").setAttribute("aria-label","Reading progress "+percent+" percent");drawReadingInsights();}
async function draw(n,dir){
 if(!pdf||!active)return false;
 const version=++drawVersion;
 if(renderTask){try{renderTask.cancel()}catch(_){}renderTask=null}
 page=Math.max(1,Math.min(pdf.numPages,n));
 const frame=$("#pageFrame"),currentPdf=pdf,currentBook=active,requestedPage=page;
 const status=$("#readerStatus"),animate=dir==="next"||dir==="prev";
 frame.classList.remove("turn-next","turn-prev");
 frame.classList.toggle("turn-next",animate&&dir==="next");
 frame.classList.toggle("turn-prev",animate&&dir==="prev");
 frame.setAttribute("aria-busy","true");
 if(status)status.textContent="Loading page "+requestedPage+" of "+currentPdf.numPages;
 if(animate)await new Promise(r=>setTimeout(r,100));
 if(version!==drawVersion||pdf!==currentPdf)return false;
 let task=null;
 try{
  const p=await currentPdf.getPage(requestedPage);
  if(version!==drawVersion||pdf!==currentPdf)return false;
  const v=p.getViewport({scale:1}),stage=$("#pageStage");
  const compact=window.matchMedia("(max-width:650px)").matches;
  const availableWidth=Math.max(1,Math.min(stage.clientWidth-(compact?24:112),compact?560:760));
  const availableHeight=Math.max(1,stage.clientHeight-(compact?22:24));
  const scale=Math.max(.1,Math.min(availableWidth/v.width,availableHeight/v.height,2));
  const dpr=Math.max(1,Math.min(window.devicePixelRatio||1,3));
  const vp=p.getViewport({scale:scale*dpr}),c=$("#pdfCanvas");
  const displayWidth=vp.width/dpr,displayHeight=vp.height/dpr;
  frame.style.width=displayWidth+"px";frame.style.height=displayHeight+"px";
  c.width=Math.ceil(vp.width);c.height=Math.ceil(vp.height);
  c.style.width=displayWidth+"px";c.style.height=displayHeight+"px";
  c.setAttribute("aria-label","Book page "+requestedPage+" of "+currentPdf.numPages);
  task=p.render({canvasContext:c.getContext("2d",{alpha:false}),viewport:vp});
  renderTask=task;
  await task.promise;
  if(version!==drawVersion||pdf!==currentPdf)return false;
  if(renderTask===task)renderTask=null;
  $("#pageLabel").textContent="Page "+requestedPage+" of "+currentPdf.numPages;
  $("#pageRange").max=currentPdf.numPages;$("#pageRange").value=requestedPage;
  const marks=store.get("vellora.bookmarks."+currentBook.id,[]);
  $("#bookmarkPage").setAttribute("aria-pressed",String(marks.includes(requestedPage)));
  $("#bookmarkPage").textContent=marks.includes(requestedPage)?"◆ Saved":"Bookmark";
  const bm=$("#bookmarkSelect");
  if(bm){bm.innerHTML='<option value="">Saved bookmarks ('+marks.length+')</option>'+marks.map(v=>'<option value="'+v+'">Page '+v+'</option>').join("");bm.value=""}
  $("#prevPage").disabled=requestedPage<=1;$("#nextPage").disabled=requestedPage>=currentPdf.numPages;
  frame.classList.remove("turn-next","turn-prev");
  frame.setAttribute("aria-busy","false");
  if(status)status.textContent="Page "+requestedPage+" of "+currentPdf.numPages+" loaded";
  save();
  if(sound&&animate){try{const AC=window.AudioContext||window.webkitAudioContext;if(AC){const ac=new AC(),o=ac.createOscillator(),g=ac.createGain();o.connect(g);g.connect(ac.destination);g.gain.value=.02;o.frequency.value=500;o.start();o.stop(ac.currentTime+.07);o.onended=()=>ac.close()}}catch(_){}}
  return true;
 }catch(err){
  if(err&&err.name==="RenderingCancelledException")return false;
  if(version===drawVersion&&pdf===currentPdf){
   if(renderTask===task)renderTask=null;
   frame.classList.remove("turn-next","turn-prev");
   frame.setAttribute("aria-busy","false");
   if(status)status.textContent="Could not render page "+requestedPage+". Try another page or reopen the book.";
  }
  console.error("VELLORA reader render failed",err);
  return false;
 }
}
async function start(){
 const trigger=$("#readBook"),reader=$("#reader"),status=$("#readerStatus");
 trigger.disabled=true;
 try{
  if(status)status.textContent="Preparing your book…";
  const url=await signed();
  $("#dlg").close();reader.hidden=false;reader.setAttribute("aria-busy","true");
  $("#readerTitle").textContent=active.title;
  $("#soundToggle").textContent="Page sound: "+(sound?"On":"Off");
  pdfjsLib.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  pdf=await pdfjsLib.getDocument({url}).promise;
  const saved=store.get("vellora.progress."+active.id,null);
  page=saved?Math.max(1,Math.min(pdf.numPages,Number(saved.page)||1)):1;
  outline=await pdf.getOutline()||[];
  const sel=$("#chapterSelect");sel.innerHTML='<option value="">Page navigation</option>';
  async function add(items){for(const x of items){let d=x.dest;if(typeof d==="string")d=await pdf.getDestination(d);if(d){const i=await pdf.getPageIndex(d[0]),o=document.createElement("option");o.value=i+1;o.textContent=x.title;sel.append(o)}if(x.items?.length)await add(x.items)}}
  await add(outline);
  const rendered=await draw(page);
  if(!rendered)throw new Error("The first page could not be displayed. Please try again.");
  reader.setAttribute("aria-busy","false");
  $("#closeReader").focus();
 }catch(e){
  reader.hidden=true;reader.setAttribute("aria-busy","false");
  if(status)status.textContent="Could not open this book.";
  alert("Could not open this book: "+e.message);
 }finally{trigger.disabled=false}
}
function menu(view){let h="";if(view==="menu")h='<button class="mi" data-go="library">Library</button><button class="mi" data-go="favorites">Favourites <span class="menu-count">' + favorites().length + '</span></button><button class="mi" data-v="settings">Settings</button><button class="mi" data-v="recent">Recently Read</button>';else{h='<button class="back" data-v="menu">Back</button>';if(view==="settings")h+='<h2>Reading theme</h2><div class="themes">'+themes.map(t=>'<button class="th" data-theme-pick="'+t[0]+'" aria-pressed="'+(document.documentElement.dataset.theme===t[0])+'"><span class="sw" style="background:'+t[3]+'"></span><span><b>'+t[1]+'</b><small>'+t[2]+'</small></span></button>').join("")+'</div><h2 class="settings-subhead">Reading preferences</h2><button class="setting-row" data-sound-setting aria-pressed="'+sound+'"><span><b>Page-turn sound</b><small>Play a subtle sound when turning pages</small></span><strong>'+(sound?"On":"Off")+'</strong></button><h2 class="settings-subhead">Manage your reading data</h2><button class="setting-row" data-clear-recent><span><b>Clear recently read</b><small>Remove your reading history from this device</small></span><strong>Clear</strong></button><button class="setting-row" data-clear-bookmarks><span><b>Clear all bookmarks</b><small>Remove saved page bookmarks from this device</small></span><strong>Clear</strong></button>';if(view==="recent"){const r=recent();h+='<h2>Recently read</h2>'+(r.length?r.map(b=>'<button class="recent-row" data-id="'+esc(b.id)+'">'+esc(b.title)+'</button>').join(""):'<p class="empty">Books you open will appear here.</p>')}if(view==="favorites"){const r=favorites();h+='<h2>Favourite books</h2>'+(r.length?r.map(b=>'<button class="recent-row" data-id="'+esc(b.id)+'">'+esc(b.title)+'</button>').join(""):'<p class="empty">Save a book from its details to see it here.</p>')}}$("#panel").innerHTML=h}
function toggle(v){$("#panel").classList.toggle("show",v);$("#fab").setAttribute("aria-expanded",String(v));if(v)menu("menu")}
$("#dClose").onclick=()=>$("#dlg").close();$("#favoriteBook").onclick=()=>{if(active)toggleFavorite(active.id)};$("#readBook").onclick=start;$("#downloadBook").onclick=download;$("#shareBook").onclick=async()=>{if(!active)return;const payload={title:active.title||"VELLORA book",text:[active.title,active.author?"by "+active.author:"",active.genre||""].filter(Boolean).join(" · "),url:window.location.href.split("#")[0]};try{if(navigator.share)await navigator.share(payload);else if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(payload.text+" — "+payload.url);$("#shareBook").textContent="Copied!";setTimeout(()=>$("#shareBook").textContent="Share book",1800)}else alert("Sharing is not available in this browser.")}catch(e){if(e.name!=="AbortError")alert("Could not share this book. Please try again.")}};function closeReader(){$("#reader").hidden=true;$("#reader").setAttribute("aria-busy","false");if(readerResizeTimer){clearTimeout(readerResizeTimer);readerResizeTimer=null}drawVersion++;if(renderTask){try{renderTask.cancel()}catch(_){}renderTask=null}pdf=null}
$("#closeReader").onclick=closeReader;$("#prevPage").onclick=()=>draw(page-1,"prev");$("#nextPage").onclick=()=>draw(page+1,"next");$("#pageRange").oninput=e=>draw(+e.target.value,+e.target.value>page?"next":"prev");$("#chapterSelect").onchange=e=>e.target.value&&draw(+e.target.value,"next");$("#bookmarkSelect").onchange=e=>e.target.value&&draw(+e.target.value,+e.target.value>page?"next":"prev");$("#bookmarkPage").onclick=()=>{let marks=store.get("vellora.bookmarks."+active.id,[]);marks=marks.includes(page)?marks.filter(x=>x!==page):[...marks,page].sort((x,y)=>x-y);store.set("vellora.bookmarks."+active.id,marks);$("#bookmarkPage").setAttribute("aria-pressed",String(marks.includes(page)));$("#bookmarkPage").textContent=marks.includes(page)?"◆ Saved":"Bookmark";const bm=$("#bookmarkSelect");if(bm){bm.innerHTML='<option value="">Saved bookmarks (' +marks.length+')</option>'+marks.map(n=>'<option value="'+n+'">Page '+n+'</option>').join("");bm.value=""}};$("#soundToggle").onclick=()=>{sound=!sound;store.set("vellora.sound",sound);$("#soundToggle").textContent="Page sound: "+(sound?"On":"Off")};$("#search").oninput=drawGrid;$("#chips").onclick=e=>{if(e.target.dataset.g){genre=e.target.dataset.g;drawGrid()}};$("#languageFilter").addEventListener("change",e=>{language=e.target.value;drawGrid()});$("#clearLibraryFilters").addEventListener("click",()=>{genre="All";language="All";$("#search").value="";$("#sortBooks").value="newest";sortMode="newest";drawGrid()});document.addEventListener("click",e=>{const b=e.target.closest("[data-genre-tile]");if(b){genre=b.dataset.genreTile;$("#library").scrollIntoView({behavior:"smooth"});drawGrid()}});document.addEventListener("click",e=>{const b=e.target.closest("[data-id]");if(b&&!b.closest("#panel"))openBook(b.dataset.id)});const panel=$("#panel"),fab=$("#fab");
fab.addEventListener("click",e=>{e.preventDefault();e.stopPropagation();toggle(!panel.classList.contains("show"))});
panel.addEventListener("click",e=>{
 const b=e.target.closest("button");if(!b)return;
 e.preventDefault();e.stopPropagation();
 if(b.dataset.v){menu(b.dataset.v);return}
 if(b.dataset.go){
  const destination=b.dataset.go;
  toggle(false);
  if(destination==="favorites"){drawFavorites();$("#favoritesShelf").scrollIntoView({behavior:"smooth"})}
  else $("#library").scrollIntoView({behavior:"smooth"});
  return;
 }
 if(b.dataset.themePick){theme(b.dataset.themePick);menu("settings");return}
 if(b.hasAttribute("data-sound-setting")){sound=!sound;store.set("vellora.sound",sound);menu("settings");return}
 if(b.hasAttribute("data-clear-recent")){
  if(confirm("Clear your recently read list on this device?")){store.set("vellora.recent",[]);drawRecent();menu("settings")}
  return;
 }
 if(b.hasAttribute("data-clear-bookmarks")){
  if(confirm("Clear all saved bookmarks on this device?")){
   for(let i=localStorage.length-1;i>=0;i--){const key=localStorage.key(i);if(key&&key.startsWith("vellora.bookmarks."))localStorage.removeItem(key)}
   if(active&&pdf)draw(page);
   menu("settings");
  }
  return;
 }
 if(b.dataset.id){const id=b.dataset.id;toggle(false);openBook(id)}
});
document.addEventListener("click",e=>{if(!e.target.closest("#panel,#fab"))toggle(false)});document.addEventListener("keydown",e=>{
 if(!$("#reader").hidden){
  if(e.key==="Escape"){closeReader();return}
  if(e.target.closest("input,select,textarea,[contenteditable=true]"))return;
  if(e.key==="ArrowRight"){e.preventDefault();draw(page+1,"next")}
  if(e.key==="ArrowLeft"){e.preventDefault();draw(page-1,"prev")}
  if(e.key==="Home"){e.preventDefault();draw(1,"prev")}
  if(e.key==="End"){e.preventDefault();draw(pdf?pdf.numPages:page,"next")}
 }else if(e.key==="Escape")toggle(false)
});
let swipeStart=null;
const pageStage=$("#pageStage");
pageStage.addEventListener("pointerdown",e=>{
 if(!e.target.closest("#pageFrame,#pdfCanvas"))return;
 if(e.pointerType==="mouse"&&e.button!==0)return;
 swipeStart={x:e.clientX,y:e.clientY};
},{passive:true});
pageStage.addEventListener("pointerup",e=>{
 if(!swipeStart)return;
 const dx=e.clientX-swipeStart.x,dy=e.clientY-swipeStart.y;swipeStart=null;
 if(Math.abs(dx)>48&&Math.abs(dx)>Math.abs(dy)*1.2)draw(page+(dx<0?1:-1),dx<0?"next":"prev");
},{passive:true});
pageStage.addEventListener("pointercancel",()=>{swipeStart=null},{passive:true});
window.addEventListener("resize",()=>{
 if($("#reader").hidden||!pdf)return;
 if(readerResizeTimer)clearTimeout(readerResizeTimer);
 readerResizeTimer=setTimeout(()=>{readerResizeTimer=null;if(!$("#reader").hidden&&pdf)draw(page)},160);
},{passive:true});
load();
})();