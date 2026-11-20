(function(){
"use strict";
const cfg=window.VELLORA_CONFIG||{},db=window.supabase&&cfg.url?window.supabase.createClient(cfg.url,cfg.publishableKey):null,$=s=>document.querySelector(s);
const store={get(k,d){try{return JSON.parse(localStorage.getItem(k))??d}catch(_){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(_){}}};
const themes=[["manuscript","Enhanced Manuscript","Faded manuscript","#EDE3D0"],["vellum","Classic Vellum","Warm ivory","#FFFCF7"],["heritage","Dark Heritage","Deep antique brown","#2D231C"]];
let books=[],genre="All",sortMode="newest",active=null,pdf=null,page=1,sound=store.get("vellora.sound",false),outline=[],drawVersion=0,renderTask=null;
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const slug=v=>String(v||"book").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
function makeBookPdf(title,author,genre,coverStyle,manuscript){
const colors={nocturne:[39,31,26],botanical:[35,56,43],gilded:[91,65,40],midnight:[24,31,49],terracotta:[139,76,58]},bg=colors[coverStyle]||colors.nocturne;
const clean=s=>String(s).normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/[^\x20-\x7E]/g,"?").replaceAll("—","-").replaceAll("’","'");
const esc=s=>clean(s).replaceAll("\\","\\\\").replaceAll("(","\\(").replaceAll(")","\\)");
const wrap=(s,n)=>{let out=[],line="";for(const token of clean(s).split(/\s+/)){let word=token;if(!word)continue;while(word.length>n){if(line){out.push(line);line=""}out.push(word.slice(0,n));word=word.slice(n)}const t=line?line+" "+word:word;if(t.length>n&&line){out.push(line);line=word}else line=t}if(line)out.push(line);return out};
let pages=[],cover="q\n"+bg.map(v=>(v/255).toFixed(3)).join(" ")+" rg\n0 0 595 842 re f\n0.82 0.69 0.48 RG 1 w 32 32 531 778 re S 42 42 511 758 re S\nBT /F2 13 Tf 0.82 0.69 0.48 rg 1 0 0 1 190 700 Tm (V E L L O R A   E D I T I O N S) Tj ET\n";
let lines=wrap(title,28),yy=480;cover+="BT /F2 28 Tf 0.96 0.92 0.84 rg\n";lines.forEach((v,i)=>cover+="1 0 0 1 "+(297-v.length*7.5)+" "+(yy-i*38)+" Tm ("+esc(v)+") Tj\n");cover+="ET\nBT /F3 17 Tf 0.82 0.69 0.48 rg 1 0 0 1 220 340 Tm ("+esc("by "+author)+") Tj ET\nBT /F2 10 Tf 0.96 0.92 0.84 rg 1 0 0 1 240 115 Tm ("+esc(genre.toUpperCase())+") Tj ET\nQ";pages.push(cover);
let body="",y=785,n=2;
const footer=(s,num)=>s+"\n0.65 0.55 0.42 RG 0.5 w 65 42 m 530 42 l S\nBT /F3 9 Tf 0.35 0.30 0.25 rg 1 0 0 1 65 26 Tm ("+esc(title.slice(0,60))+") Tj ET\nBT /F1 9 Tf 0.35 0.30 0.25 rg 1 0 0 1 520 26 Tm ("+num+") Tj ET";
const next=()=>{pages.push(footer(body,n++));body="BT /F3 9 Tf 0.48 0.41 0.31 rg 1 0 0 1 65 810 Tm ("+esc(title.slice(0,65))+") Tj ET\n";y=785};
for(const raw of String(manuscript).replaceAll("\r","").split("\n\n")){let b=raw.trim();if(!b)continue;let ch=b.startsWith("# "),sec=b.startsWith("## "),txt=b.replace(/^#{1,2}\s*/,""),sz=ch?34:sec?28:22,lh=ch?44:sec?36:30,ls=wrap(txt,ch?25:sec?32:42),gap=ch?26:sec?20:18;if(ch){y-=10;if(y<100)next();body+="0.65 0.52 0.34 RG 0.7 w 65 "+y+" m 530 "+y+" l S\n"}const font=ch||sec?"/F2":"/F1";body+="BT "+font+" "+sz+" Tf 0.06 0.05 0.04 rg\n";for(const line of ls){if(y<65+lh){body+="ET\n";next();body+="BT "+font+" "+sz+" Tf 0.06 0.05 0.04 rg\n"}body+="1 0 0 1 65 "+y+" Tm ("+esc(line)+") Tj\n";y-=lh}body+="ET\n";y-=gap}
pages.push(footer(body,n));
let o=[];o[1]="<< /Type /Catalog /Pages 2 0 R >>";o[3]="<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";o[4]="<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>";o[5]="<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique >>";let kids=[];
pages.forEach((s,i)=>{let p=6+i*2,q=p+1;kids.push(p+" 0 R");o[p]="<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R >> >> /Contents "+q+" 0 R >>";o[q]="<< /Length "+s.length+" >>\nstream\n"+s+"\nendstream"});
o[2]="<< /Type /Pages /Kids ["+kids.join(" ")+"] /Count "+pages.length+" >>";let out="%PDF-1.4\n",off=[0];for(let i=1;i<o.length;i++){off[i]=out.length;out+=i+" 0 obj\n"+o[i]+"\nendobj\n"}let x=out.length;out+="xref\n0 "+o.length+"\n0000000000 65535 f \n";for(let i=1;i<o.length;i++)out+=String(off[i]).padStart(10,"0")+" 00000 n \n";out+="trailer\n<< /Size "+o.length+" /Root 1 0 R /Info << /Title ("+esc(title)+") /Author ("+esc(author)+") /Creator (VELLORA Editions) >> >>\nstartxref\n"+x+"\n%%EOF";return new Blob([out],{type:"application/pdf"});
}
function generatedBookPdf(b){const style=String(b.cover_url||"vellora-cover://nocturne").replace("vellora-cover://","");return makeBookPdf(b.title||"Untitled",b.author||"VELLORA Editions",b.genre||"Fiction",style,b.manuscript_content||"");}
function theme(t){if(!themes.some(x=>x[0]===t))t="manuscript";document.documentElement.dataset.theme=t;store.set("vellora.theme",t);const picker=$("#readerTheme");if(picker)picker.value=t}
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
  setTimeout(()=>{landing.hidden=true},window.matchMedia("(prefers-reduced-motion: reduce)").matches?40:2250);
};
/* Always show the signature opening on a fresh page load, even if a
   previous preview already set the old one-time seen flag. */
showLanding();

function cover(b){const styles={nocturne:"cover-nocturne",botanical:"cover-botanical",gilded:"cover-gilded",midnight:"cover-midnight",terracotta:"cover-terracotta"};const key=String(b.cover_url||"").replace("vellora-cover://","");const cls=styles[key]||"cover-nocturne";const titleLength=String(b.title||"").trim().length;const titleScale=titleLength>42?0.66:titleLength>30?0.76:titleLength>22?0.86:titleLength>14?0.94:1;return '<div class="cover '+cls+'" style="--title-scale:'+titleScale+'"><em>'+esc(b.genre||"VELLORA EDITIONS")+'</em><b>'+esc(b.title||"Untitled") +'</b><small>'+esc(b.author||"VELLORA")+'</small></div>'}
function card(b){return '<button class="card rv" data-id="'+esc(b.id)+'">'+cover(b)+'<h3>'+esc(b.title)+'</h3><p>'+esc(b.description||"")+'</p><div class="meta">'+esc(b.author||"VELLORA")+' · '+esc(b.genre||"")+'</div></button>'}
function empty(el,title,msg){el.innerHTML='<div class="empty-state"><h3>'+title+'</h3><p>'+msg+'</p></div>'}
function recent(){return store.get("vellora.recent",[]).map(id=>books.find(b=>b.id===id)).filter(Boolean)}
// Full-site reveal observer; also handles cards rendered after Supabase loads.
let velloraRevealObserver=null;
function revealVellora(root=document){
  const selectors=".hero,#featured,#continue,#library .bar,footer,.discovery-section";
  if(root.matches&&root.matches(selectors))root.classList.add("rv");
  root.querySelectorAll?.(selectors).forEach(el=>el.classList.add("rv"));
  const items=[];
  if(root.matches&&root.matches(".rv:not(.in)"))items.push(root);
  root.querySelectorAll?.(".rv:not(.in)").forEach(el=>items.push(el));
  if(!("IntersectionObserver" in window)){items.forEach(el=>el.classList.add("in"));return}
  if(!velloraRevealObserver){
    velloraRevealObserver=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add("in");velloraRevealObserver.unobserve(entry.target)}});
    },{threshold:.08,rootMargin:"0px 0px -35px 0px"});
  }
  items.forEach((el,i)=>{el.style.setProperty("--rv-delay",((i%4)*75)+"ms");velloraRevealObserver.observe(el)});
}
function drawRecent(){const r=recent();$("#continue").hidden=!r.length;$("#contRow").innerHTML=r.map(card).join("");revealVellora(document)}
function buildLibraryTools(){
const bar=$("#library .finder")||$("#library .bar");if(!bar)return;
const select=$("#fs");if(!select&&!$("#sortBooks")){const s=document.createElement("select");s.id="sortBooks";s.setAttribute("aria-label","Sort books");s.innerHTML='<option value="newest">Newest first</option><option value="title">Title A–Z</option><option value="author">Author A–Z</option><option value="genre">Genre A–Z</option>';s.value=sortMode;s.className="sort-select";bar.append(s);s.addEventListener("change",()=>{sortMode=s.value;drawGrid()})}
const count=$("#count")||document.createElement("p");if(!count.id){count.id="libraryResults";count.className="library-results";bar.after(count)}
const rec=document.createElement("section");rec.id="recommendedShelf";rec.className="discovery-section";rec.hidden=true;bar.after(rec);
const genres=document.createElement("section");genres.id="genreShelf";genres.className="discovery-section";genres.innerHTML='<div class="discovery-heading"><span class="eyebrow">Find your next world</span><h2>Explore by genre</h2></div><div class="genre-tiles" id="genreTiles"></div>';rec.after(genres);
if(select)select.addEventListener("change",drawGrid);
}
function drawDiscovery(){
const rec=books.filter(b=>b.is_recommended);
const shelf=$("#recommendedShelf");
if(shelf){shelf.hidden=!rec.length;shelf.innerHTML=rec.length?'<div class="discovery-heading"><span class="eyebrow">Handpicked for your journey</span><h2>Recommended reads</h2></div><div class="cont">'+rec.slice(0,10).map(card).join("")+'</div>':""}
const counts=[...new Set(books.map(b=>String(b.genre||"").trim()).filter(Boolean))].sort((x,y)=>x.localeCompare(y));
const tiles=$("#genreTiles");
if(tiles)tiles.innerHTML=counts.length?counts.map(g=>'<button class="genre-tile" data-genre-tile="'+esc(g)+'"><span>'+esc(g)+'</span><small>'+books.filter(b=>String(b.genre||"").trim()===g).length+' '+(books.filter(b=>String(b.genre||"").trim()===g).length===1?'edition':'editions')+'</small></button>').join(""):'<p class="empty">Genres will appear as books are published.</p>';
revealVellora(document);
}
function drawGrid(){
const q=(($("#search")||$("#q"))?.value||"").toLowerCase().trim(),gs=["All"].concat([...new Set(books.map(b=>String(b.genre||"").trim()).filter(Boolean))].sort((x,y)=>x.localeCompare(y)));
$("#chips").innerHTML=gs.map(g=>'<button class="chip" aria-pressed="'+(g===genre)+'" data-g="'+esc(g)+'">'+esc(g)+'</button>').join("");
const time=$("#ft")?.value||"",ranges={"":[0,Infinity],s:[0,29],m:[30,49],l:[50,Infinity]},[lo,hi]=ranges[time]||ranges[""];
let found=books.filter(b=>(genre==="All"||String(b.genre||"").trim()===genre)&&(!q||(b.title+" "+b.author+" "+b.description+" "+b.genre).toLowerCase().includes(q))&&(!time||((Number(b.reading_time_minutes)||0)>=lo&&(Number(b.reading_time_minutes)||0)<=hi)));
const sort=$("#fs")?.value||sortMode;
found.sort((x,y)=>sort==="az"||sort==="title"?String(x.title||"").localeCompare(String(y.title||"")):sort==="short"?Number(x.reading_time_minutes||0)-Number(y.reading_time_minutes||0):sort==="long"?Number(y.reading_time_minutes||0)-Number(x.reading_time_minutes||0):sort==="author"?String(x.author||"").localeCompare(String(y.author||"")):sort==="genre"?String(x.genre||"").localeCompare(String(y.genre||"")):new Date(y.created_at||0)-new Date(x.created_at||0));
const result=$("#count")||$("#libraryResults");if(result)result.textContent=found.length+" "+(found.length===1?"story":"stories")+(q?' for “'+q+'”':genre!=="All"||time?" matching your filters":" in the collection");
if($("#qx"))$("#qx").hidden=!q;if($("#adv"))$("#adv").toggleAttribute("data-on",!!(time||($("#fs")?.value||"")));
if(found.length)$("#grid").innerHTML=found.map(card).join("");else empty($("#grid"),books.length?"No matching stories":"The library is waiting for its first story",books.length?'Try another search or reset the filters.':'New books published by the VELLORA admin will appear here.');
revealVellora($("#library"));
}
async function load(){if(!db){empty($("#grid"),"Library connection unavailable","Check the public Supabase configuration.");return}const {data,error}=await db.from("books").select("id,title,author,slug,description,genre,cover_url,pdf_path,language,reading_time_minutes,is_featured,is_recommended,is_published,created_at,manuscript_content").eq("is_published",true).order("created_at",{ascending:false});if(error){empty($("#grid"),"Could not load the library","Please refresh or check the Supabase books SELECT policy.");console.error(error);return}books=data||[];buildLibraryTools();drawDiscovery();const f=books.find(b=>b.is_featured)||books[0];if(f){$("#featured").hidden=false;$("#featured").innerHTML='<div class="featured rv"><span class="tag">Featured story</span>'+cover(f)+'<div><div class="meta">'+esc(f.author||"")+' · '+esc(f.genre||"")+'</div><h2>'+esc(f.title)+'</h2><p>'+esc(f.description||"")+'</p><button class="btn" data-id="'+esc(f.id)+'">Discover story</button></div></div>'}else $("#featured").hidden=true;drawGrid();drawRecent();revealVellora(document)}
function openBook(id){active=books.find(b=>String(b.id)===String(id));if(!active)return;store.set("vellora.recent",[active.id,...store.get("vellora.recent",[]).filter(x=>x!==active.id)].slice(0,12));$("#dT").textContent=active.title;$("#dMeta").textContent=(active.author||"VELLORA")+" · "+(active.genre||"")+" · "+(active.language||"English");$("#dDesc").textContent=active.description||"";$("#dCover").innerHTML=cover(active);$("#readBook").hidden=!(active.pdf_path||active.manuscript_content);$("#downloadBook").hidden=!(active.pdf_path||active.manuscript_content);$("#dlg").showModal();drawRecent()}
async function signed(){if(!active||!active.pdf_path)throw Error("This book has no PDF file yet.");const {data,error}=await db.storage.from("book-files").createSignedUrl(active.pdf_path,600);if(error)throw error;return data.signedUrl}
async function download(){try{const a=document.createElement("a");if(active.pdf_path)a.href=await signed();else{const blob=generatedBookPdf(active),url=URL.createObjectURL(blob);a.href=url;a.addEventListener("click",()=>setTimeout(()=>URL.revokeObjectURL(url),1500),{once:true})}a.download=slug(active.title)+".pdf";a.rel="noopener";document.body.append(a);a.click();a.remove()}catch(e){alert("Download unavailable: "+e.message)}}
function save(){if(!pdf)return;const percent=Math.round(page/pdf.numPages*100);store.set("vellora.progress."+active.id,{page:page,total:pdf.numPages,updatedAt:Date.now()});$("#readerProgress").innerHTML='<div class="progress-copy"><span>Reading progress</span><b>'+percent+'%</b></div><div class="progress-track"><i style="width:'+percent+'%"></i></div><small>Page '+page+' of '+pdf.numPages+'</small>';const prev=store.get("vellora.progress."+active.id,{});$("#readerProgress").setAttribute("aria-label","Reading progress "+percent+" percent");}
async function draw(n,dir){
 if(!pdf||!active)return;
 const version=++drawVersion;
 if(renderTask){try{renderTask.cancel()}catch(_){}renderTask=null}
 page=Math.max(1,Math.min(pdf.numPages,n));
 const frame=$("#pageFrame"),currentPdf=pdf,currentBook=active;
 frame.classList.remove("turn-next","turn-prev");
 frame.classList.add(dir==="prev"?"turn-prev":"turn-next");
 await new Promise(r=>setTimeout(r,100));
 if(version!==drawVersion||pdf!==currentPdf)return;
 const p=await currentPdf.getPage(page);
 if(version!==drawVersion||pdf!==currentPdf)return;
 const v=p.getViewport({scale:1});
 const stage=$("#pageStage");
 const compact=window.matchMedia("(max-width:650px)").matches;
 const availableWidth=Math.max(1,Math.min(stage.clientWidth-(compact?24:112),compact?560:440));
 const availableHeight=Math.max(1,Math.min(stage.clientHeight-(compact?22:24),compact?560:640));
 const scale=Math.max(.1,Math.min(availableWidth/v.width,availableHeight/v.height,2));
 const dpr=Math.max(1,Math.min(window.devicePixelRatio||1,3));
 const vp=p.getViewport({scale:scale*dpr}),c=$("#pdfCanvas");
 const displayWidth=vp.width/dpr,displayHeight=vp.height/dpr;
 frame.style.width=displayWidth+"px";frame.style.height=displayHeight+"px";
 c.width=Math.ceil(vp.width);c.height=Math.ceil(vp.height);
 c.style.width=displayWidth+"px";c.style.height=displayHeight+"px";
 const task=p.render({canvasContext:c.getContext("2d"),viewport:vp});
 renderTask=task;
 try{await task.promise}catch(err){if(err&&err.name==="RenderingCancelledException")return;throw err}
 if(version!==drawVersion||pdf!==currentPdf)return;
 renderTask=null;
 $("#pageLabel").textContent="Page "+page+" of "+currentPdf.numPages;
 $("#pageRange").max=currentPdf.numPages;$("#pageRange").value=page;
 const marks=store.get("vellora.bookmarks."+currentBook.id,[]);
 $("#bookmarkPage").setAttribute("aria-pressed",String(marks.includes(page)));
 $("#bookmarkPage").textContent=marks.includes(page)?"◆ Saved":"Bookmark";
 const bm=$("#bookmarkSelect");
 if(bm){bm.innerHTML='<option value="">Saved bookmarks ('+marks.length+')</option>'+marks.map(n=>'<option value="'+n+'">Page '+n+'</option>').join("");bm.value=""}
 $("#prevPage").disabled=page<=1;$("#nextPage").disabled=page>=currentPdf.numPages;
 frame.classList.remove("turn-next","turn-prev");save();
 if(sound){try{const AC=window.AudioContext||window.webkitAudioContext;if(AC){const ac=new AC(),o=ac.createOscillator(),g=ac.createGain();o.connect(g);g.connect(ac.destination);g.gain.value=.02;o.frequency.value=500;o.start();o.stop(ac.currentTime+.07);o.onended=()=>ac.close()}}catch(_){}}
}
async function start(){try{$("#dlg").close();$("#reader").hidden=false;$("#readerTitle").textContent=active.title;$("#soundToggle").textContent="Sound "+(sound?"on":"off");$("#readerTheme").value=document.documentElement.dataset.theme||"manuscript";pdfjsLib.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";const source=active.pdf_path?{url:await signed()}:{data:new Uint8Array(await generatedBookPdf(active).arrayBuffer())};pdf=await pdfjsLib.getDocument(source).promise;const saved=store.get("vellora.progress."+active.id,null);page=saved?Math.max(1,Math.min(pdf.numPages,Number(saved.page)||1)):1;outline=await pdf.getOutline()||[];const sel=$("#chapterSelect");sel.innerHTML='<option value="">Page navigation</option>';async function add(items){for(const x of items){let d=x.dest;if(typeof d==="string")d=await pdf.getDestination(d);if(d){const i=await pdf.getPageIndex(d[0]),o=document.createElement("option");o.value=i+1;o.textContent=x.title;sel.append(o)}if(x.items?.length)await add(x.items)}}await add(outline);await draw(page)}catch(e){$("#reader").hidden=true;alert("Could not open this book: "+e.message)}}
function menu(view){let h="";if(view==="menu")h='<button class="mi" data-go="library">Library</button><button class="mi" data-v="settings">Settings</button><button class="mi" data-v="recent">Recently Read</button>';else{h='<button class="back" data-v="menu">Back</button>';if(view==="settings")h+='<h2>Reading theme</h2><div class="themes">'+themes.map(t=>'<button class="th" data-theme-pick="'+t[0]+'" aria-pressed="'+(document.documentElement.dataset.theme===t[0])+'"><span class="sw" style="background:'+t[3]+'"></span><span><b>'+t[1]+'</b><small>'+t[2]+'</small></span></button>').join("")+'</div><button class="mi" data-v="intro">Replay opening</button><h2 class="settings-subhead">Reading preferences</h2><button class="setting-row" data-sound-setting aria-pressed="'+sound+'"><span><b>Page-turn sound</b><small>Play a subtle sound when turning pages</small></span><strong>'+(sound?"On":"Off")+'</strong></button><h2 class="settings-subhead">Manage your reading data</h2><button class="setting-row" data-clear-recent><span><b>Clear recently read</b><small>Remove your reading history from this device</small></span><strong>Clear</strong></button><button class="setting-row" data-clear-bookmarks><span><b>Clear all bookmarks</b><small>Remove saved page bookmarks from this device</small></span><strong>Clear</strong></button>';if(view==="recent"){const r=recent();h+='<h2>Recently read</h2>'+(r.length?r.map(b=>'<button class="recent-row" data-id="'+esc(b.id)+'">'+esc(b.title)+'</button>').join(""):'<p class="empty">Books you open will appear here.</p>')}}$("#panel").innerHTML=h}
function toggle(v,view){$("#panel").classList.toggle("show",v);if($("#fab"))$("#fab").setAttribute("aria-expanded",String(v));if($("#gear"))$("#gear").setAttribute("aria-expanded",String(v&&view==="settings"));if($("#recentBtn"))$("#recentBtn").setAttribute("aria-expanded",String(v&&view==="recent"));if(v)menu(view||"menu")}
$("#dClose").onclick=()=>$("#dlg").close();$("#readBook").onclick=()=>{if(!active)return;location.href="reader.html?id="+encodeURIComponent(active.id)};$("#downloadBook").onclick=download;function closeReader(){$("#reader").hidden=true;drawVersion++;if(renderTask){try{renderTask.cancel()}catch(_){}renderTask=null}pdf=null}
$("#closeReader").onclick=closeReader;$("#prevPage").onclick=()=>draw(page-1,"prev");$("#nextPage").onclick=()=>draw(page+1,"next");$("#pageRange").oninput=e=>draw(+e.target.value,+e.target.value>page?"next":"prev");$("#chapterSelect").onchange=e=>e.target.value&&draw(+e.target.value,"next");$("#bookmarkSelect").onchange=e=>e.target.value&&draw(+e.target.value,+e.target.value>page?"next":"prev");$("#bookmarkPage").onclick=()=>{let marks=store.get("vellora.bookmarks."+active.id,[]);marks=marks.includes(page)?marks.filter(x=>x!==page):[...marks,page].sort((x,y)=>x-y);store.set("vellora.bookmarks."+active.id,marks);$("#bookmarkPage").setAttribute("aria-pressed",String(marks.includes(page)));$("#bookmarkPage").textContent=marks.includes(page)?"◆ Saved":"Bookmark";const bm=$("#bookmarkSelect");if(bm){bm.innerHTML='<option value="">Saved bookmarks (' +marks.length+')</option>'+marks.map(n=>'<option value="'+n+'">Page '+n+'</option>').join("");bm.value=""}};$("#soundToggle").onclick=()=>{sound=!sound;store.set("vellora.sound",sound);$("#soundToggle").textContent="Sound "+(sound?"on":"off")};$("#readerTheme").onchange=e=>theme(e.target.value);$("#readerPdf").onclick=()=>download();$("#search").oninput=drawGrid;if($("#ft"))$("#ft").onchange=drawGrid;if($("#fs"))$("#fs").onchange=drawGrid;if($("#qx"))$("#qx").onclick=()=>{$("#search").value="";drawGrid();$("#search").focus()};if($("#adv"))$("#adv").onclick=()=>{const hidden=$("#advp").hidden;$("#advp").hidden=!hidden;$("#adv").setAttribute("aria-expanded",String(hidden))};if($("#reset"))$("#reset").onclick=()=>{genre="All";$("#search").value="";$("#ft").value="";$("#fs").value="";drawGrid()};document.addEventListener("keydown",e=>{if(e.key==="/"&&!/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)){e.preventDefault();$("#search").focus()}});$("#chips").onclick=e=>{if(e.target.dataset.g){genre=e.target.dataset.g;drawGrid()}};document.addEventListener("click",e=>{const b=e.target.closest("[data-genre-tile]");if(b){genre=b.dataset.genreTile;$("#library").scrollIntoView({behavior:"smooth"});drawGrid()}});document.addEventListener("click",e=>{const b=e.target.closest("[data-id]");if(b)openBook(b.dataset.id)});if($("#fab"))$("#fab").onclick=()=>toggle(!$("#panel").classList.contains("show"),"menu");if($("#gear"))$("#gear").onclick=()=>toggle(!$("#panel").classList.contains("show"),"settings");if($("#recentBtn"))$("#recentBtn").onclick=()=>toggle(!$("#panel").classList.contains("show"),"recent");$("#panel").onclick=e=>{const b=e.target.closest("button");if(!b)return;if(b.dataset.v==="intro"){toggle(false);showLanding();return}if(b.dataset.v){menu(b.dataset.v);return}if(b.dataset.go){toggle(false);$("#library").scrollIntoView({behavior:"smooth"});return}if(b.dataset.themePick){theme(b.dataset.themePick);menu("settings");return}if(b.hasAttribute("data-sound-setting")){sound=!sound;store.set("vellora.sound",sound);menu("settings");return}if(b.hasAttribute("data-clear-recent")){if(confirm("Clear your recently read list on this device?")){store.set("vellora.recent",[]);drawRecent();menu("settings")}return}if(b.hasAttribute("data-clear-bookmarks")){if(confirm("Clear all saved bookmarks on this device?")){for(let i=localStorage.length-1;i>=0;i--){const k=localStorage.key(i);if(k&&k.startsWith("vellora.bookmarks."))localStorage.removeItem(k)}if(active&&pdf)draw(page);menu("settings")}return}if(b.dataset.id)toggle(false)};document.addEventListener("click",e=>{if(!e.target.closest("#panel,#fab,#gear,#recentBtn"))toggle(false)});document.addEventListener("keydown",e=>{if(!$("#reader").hidden){if(e.key==="ArrowRight")draw(page+1,"next");if(e.key==="ArrowLeft")draw(page-1,"prev");if(e.key==="Escape")closeReader()}else if(e.key==="Escape")toggle(false)});let x=0,y=0;$("#pageStage").addEventListener("touchstart",e=>{x=e.changedTouches[0].screenX;y=e.changedTouches[0].screenY},{passive:true});$("#pageStage").addEventListener("touchend",e=>{const dx=e.changedTouches[0].screenX-x,dy=e.changedTouches[0].screenY-y;if(Math.abs(dx)>48&&Math.abs(dx)>Math.abs(dy)*1.2)draw(page+(dx<0?1:-1),dx<0?"next":"prev")},{passive:true});load();
})();