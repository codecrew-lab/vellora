/* VELLORA — private, device-local reading diary. */
(()=>{"use strict";
 const KEY="vellora.readingDiary.v1", $=s=>document.querySelector(s);
 const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 const safeUrl=v=>{try{const u=new URL(String(v||""),location.href);return /^https?:$/.test(u.protocol)?u.href:""}catch{return""}};
 const all=()=>{try{const v=JSON.parse(localStorage.getItem(KEY)||"[]");return Array.isArray(v)?v:[]}catch{return[]}};
 const dateLabel=v=>{const d=new Date(v);return Number.isNaN(d.getTime())?"Date unavailable":new Intl.DateTimeFormat(undefined,{day:"numeric",month:"long",year:"numeric"}).format(d)};
 const stars=n=>n?("★".repeat(n)+"☆".repeat(5-n)):"Not rated yet";
 function renderShelf(){
  const host=$("#readingDiaryEntries");if(!host)return;
  const rows=all().sort((a,b)=>new Date(b.completed_at)-new Date(a.completed_at));
  if(!rows.length){host.innerHTML='<div class="vd-empty"><span>✧</span><h3>Your first diary page is waiting.</h3><p>Finish a story and VELLORA will save the moment here.</p></div>';return}
  host.innerHTML=rows.map(e=>{let url="";try{const u=new URL(e.cover_url||"",location.href);if(/^https?:$/.test(u.protocol))url=u.href}catch{}
   const cover=url?'<img src="'+esc(url)+'" alt="Cover of '+esc(e.title)+'" loading="lazy">':'<div class="vd-cover-fallback"><small>VELLORA</small><strong>'+esc(e.title)+'</strong><i>'+esc(e.author)+'</i></div>';
   return '<article class="vd-page"><div class="vd-book-cover">'+cover+'</div><div class="vd-page-copy"><div class="vd-page-kicker">READING MEMORY · '+dateLabel(e.completed_at)+'</div><h3>'+esc(e.title)+'</h3><p class="vd-author">By '+esc(e.author)+'</p><div class="vd-rating">'+stars(e.rating)+'</div>'+(e.reflection?'<p class="vd-reflection">“'+esc(e.reflection)+'”</p>':'<p class="vd-reflection vd-muted">A little reflection is waiting to be added.</p>')+(e.favourite_character?'<p class="vd-detail"><b>Favourite character</b> '+esc(e.favourite_character)+'</p>':'')+(e.memorable_moment?'<p class="vd-detail"><b>Memorable moment</b> '+esc(e.memorable_moment)+'</p>':'')+'<p class="vd-closing">'+esc(e.closing_line||"Another story has found a place in my memories.")+'</p><button type="button" class="vd-edit" data-diary-edit="'+esc(e.book_id)+'">'+(e.rating?"Edit this memory":"Complete this diary page")+'</button></div></article>';
  }).join("");
 }
 const write=rows=>{try{localStorage.setItem(KEY,JSON.stringify(rows));renderShelf();window.dispatchEvent(new Event("vellora:diary-updated"));return true}catch(e){console.warn("VELLORA diary storage:",e);return false}};
 let dialog;
 function buildDialog(){
  if(dialog)return dialog;
  dialog=document.createElement("dialog");dialog.id="velloraDiaryEditor";dialog.className="vd-editor";
  dialog.innerHTML='<form id="vdForm" method="dialog"><div class="vd-editor-top"><span class="vd-kicker">A PAGE IN YOUR STORY</span><button type="button" class="vd-close" id="vdClose" aria-label="Close">×</button></div><h2 id="vdHeading">Your reading memory</h2><p class="vd-bookline" id="vdBookLine"></p><div class="vd-field"><span>Your personal rating</span><span class="vd-stars">'+[1,2,3,4,5].map(n=>'<label><input type="radio" name="rating" value="'+n+'" required><span aria-hidden="true">★</span></label>').join("")+'</span></div><label class="vd-field">A little reflection<textarea name="reflection" maxlength="1200" rows="4" placeholder="What did this story make you feel? What will you remember?"></textarea></label><div class="vd-two"><label class="vd-field">Favourite character<input name="favourite_character" maxlength="100" placeholder="Who stayed with you?"></label><label class="vd-field">A memorable moment<input name="memorable_moment" maxlength="180" placeholder="A scene you will remember"></label></div><p class="vd-status" id="vdStatus" aria-live="polite">Your diary is private and saved on this device.</p><div class="vd-actions"><button type="button" class="vd-later" id="vdLater">Maybe later</button><button type="submit" class="vd-save" id="vdSave">Save diary page</button></div></form>';
  document.body.appendChild(dialog);
  $("#vdClose").addEventListener("click",()=>dialog.close());$("#vdLater").addEventListener("click",()=>dialog.close());
  $("#vdForm").addEventListener("submit",e=>{e.preventDefault();const id=dialog.dataset.bookId,fd=new FormData(e.currentTarget),rating=Number(fd.get("rating"));if(!Number.isInteger(rating)||rating<1||rating>5){$("#vdStatus").textContent="Choose a star rating to save this page.";return}const rows=all(),entry=rows.find(x=>String(x.book_id)===id);if(!entry)return;entry.rating=rating;entry.reflection=String(fd.get("reflection")||"").trim();entry.favourite_character=String(fd.get("favourite_character")||"").trim();entry.memorable_moment=String(fd.get("memorable_moment")||"").trim();entry.updated_at=new Date().toISOString();if(!write(rows)){$("#vdStatus").textContent="This device could not save the diary page. Check available storage and try again.";return}dialog.close()});
  return dialog;
 }
 function open(entry){
  if(!entry)return;const d=buildDialog(),form=$("#vdForm");d.dataset.bookId=String(entry.book_id);
  $("#vdHeading").textContent=entry.rating?"Revisit this reading memory":"Your story has reached its last page";
  $("#vdBookLine").textContent=(entry.title||"Untitled story")+" · "+(entry.author||"VELLORA Editions")+" · "+dateLabel(entry.completed_at);
  form.querySelectorAll('input[name="rating"]').forEach(r=>r.checked=Number(r.value)===Number(entry.rating));
  form.elements.reflection.value=entry.reflection||"";form.elements.favourite_character.value=entry.favourite_character||"";form.elements.memorable_moment.value=entry.memorable_moment||"";
  $("#vdStatus").textContent="Your diary is private and saved on this device.";
  if(typeof d.showModal==="function"&&!d.open)d.showModal();else d.setAttribute("open","");
 }
 function complete(book){
  const id=String(book?.id||"");if(!id)return null;
  const rows=all();let entry=rows.find(x=>String(x.book_id)===id);
  if(!entry){entry={book_id:id,title:String(book.title||"Untitled story"),author:String(book.author||"VELLORA Editions"),cover_url:String(book.cover_url||""),completed_at:new Date().toISOString(),rating:null,reflection:"",favourite_character:"",memorable_moment:"",closing_line:"Another story has found a place in my memories.",updated_at:new Date().toISOString()};rows.unshift(entry);write(rows)}
  else{entry.title=book.title||entry.title;entry.author=book.author||entry.author;entry.cover_url=book.cover_url||entry.cover_url;write(rows)}
  return entry;
 }
 document.addEventListener("click",e=>{const b=e.target.closest("[data-diary-edit]");if(b)open(all().find(x=>String(x.book_id)===String(b.dataset.diaryEdit)))});
 window.addEventListener("storage",e=>{if(e.key===KEY)renderShelf()});
 window.VelloraDiary={all,complete,open,renderShelf};renderShelf();window.dispatchEvent(new Event("vellora:diary-updated"));
})();