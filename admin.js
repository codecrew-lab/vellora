(function(){
"use strict";
const API="https://egyrlxgpgkflcejtgvvc.supabase.co/functions/v1/vellora-admin-", $=s=>document.querySelector(s), SESSION_KEY="vellora.admin.session.v1";
let sessionToken="",editingId=null,editingSubmissionId=null,bookCache=[],submissionCache=[];
function makeBookPdf(title,author,genre,coverStyle,manuscript){
const colors={nocturne:[39,31,26],botanical:[35,56,43],gilded:[91,65,40],midnight:[24,31,49],terracotta:[139,76,58]},bg=colors[coverStyle]||colors.nocturne;
const clean=s=>String(s).normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replaceAll("—","-").replaceAll("–","-").replaceAll("½"," 1/2").replaceAll("¼"," 1/4").replaceAll("¾"," 3/4").replaceAll("’","'").replaceAll("‘","'").replaceAll("“",'"').replaceAll("”",'"').replaceAll("…","...").replace(/[^\x20-\x7E]/g,"?");
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
function status(el,msg,kind){el.textContent=msg;el.className="admin-status"+(kind?" "+kind:"")}
function lock(){sessionToken="";localStorage.removeItem(SESSION_KEY);$("#loginPanel").classList.remove("admin-hidden");$("#dashboard").classList.add("admin-hidden");$("#loginForm").reset()}
function unlock(token){sessionToken=token;$("#loginPanel").classList.add("admin-hidden");$("#dashboard").classList.remove("admin-hidden");status($("#adminStatus"),"Private publishing workspace unlocked. Session valid for 7 days.","success");loadBooks();loadSubmissions()}
async function callApi(body,token){const headers={};if(token)headers["X-Vellora-Admin-Session"]=token;const isForm=body instanceof FormData;if(!isForm)headers["Content-Type"]="application/json";const response=await fetch(API,{method:"POST",headers,body:isForm?body:JSON.stringify(body)});let data={};try{data=await response.json()}catch(_){}if(!response.ok)throw new Error(data.error||"The request could not be completed.");return data}
async function restore(){try{const s=JSON.parse(localStorage.getItem(SESSION_KEY)||"null");if(!s||!s.token||!s.expiresAt||s.expiresAt<=Date.now()){lock();return}await callApi({action:"verify"},s.token);unlock(s.token)}catch(_){lock()}}
$("#loginForm").addEventListener("submit",async e=>{e.preventDefault();const form=e.currentTarget;const f=new FormData(form);status($("#loginStatus"),"Verifying access…");try{const r=await callApi({action:"login",loginCode:String(f.get("loginCode")||""),secretCode:String(f.get("secretCode")||"")});localStorage.setItem(SESSION_KEY,JSON.stringify({token:r.token,expiresAt:r.expiresAt}));unlock(r.token);form.reset()}catch(err){status($("#loginStatus"),err.message,"error")}});
$("#signOut").addEventListener("click",lock);

/* Structured chapter and part editor. Stored as the existing markdown manuscript format. */
let studioParts=[];
const defaultStudio=()=>[{title:"Part I",chapters:[{title:"Chapter 1",content:""}]}];
function countStudioWords(){return studioParts.reduce((n,p)=>n+p.chapters.reduce((m,ch)=>m+(ch.content.trim().match(/\S+/g)||[]).length,0),0)}
function updateStudioStats(){const parts=studioParts.length,chapters=studioParts.reduce((n,p)=>n+p.chapters.length,0),words=countStudioWords();$("#studioStats").textContent=parts+" part"+(parts===1?"":"s")+" · "+chapters+" chapter"+(chapters===1?"":"s")+" · "+words.toLocaleString()+" words"}
function renderStudio(){
const host=$("#studioParts");
host.innerHTML=studioParts.map((part,pi)=>'<section class="studio-part" data-part-index="'+pi+'"><header class="studio-part-head"><div class="studio-part-title"><span class="studio-index">PART '+String(pi+1).padStart(2,"0")+'</span><input type="text" maxlength="100" aria-label="Part '+(pi+1)+' title" data-part-title="'+pi+'" value="'+escapeHtml(part.title)+'" placeholder="Part title"></div><div class="studio-actions"><button type="button" data-part-up="'+pi+'" aria-label="Move part up" '+(pi===0?'disabled':'')+'>↑</button><button type="button" data-part-down="'+pi+'" aria-label="Move part down" '+(pi===studioParts.length-1?'disabled':'')+'>↓</button><button type="button" data-part-remove="'+pi+'" class="studio-remove" '+(studioParts.length===1?'disabled':'')+'>Remove part</button></div></header><div class="studio-chapters">'+part.chapters.map((ch,ci)=>'<article class="studio-chapter" data-chapter-index="'+ci+'"><div class="studio-chapter-head"><label><span>CHAPTER '+(ci+1)+'</span><input type="text" maxlength="160" data-chapter-title="'+pi+':'+ci+'" value="'+escapeHtml(ch.title)+'" placeholder="Enter chapter title"></label><div class="studio-actions"><button type="button" data-chapter-up="'+pi+':'+ci+'" aria-label="Move chapter up" '+(ci===0?'disabled':'')+'>↑</button><button type="button" data-chapter-down="'+pi+':'+ci+'" aria-label="Move chapter down" '+(ci===part.chapters.length-1?'disabled':'')+'>↓</button><button type="button" data-chapter-remove="'+pi+':'+ci+'" class="studio-remove" '+(part.chapters.length===1?'disabled':'')+'>Remove</button></div></div><textarea data-chapter-content="'+pi+':'+ci+'" rows="18" maxlength="1500000" placeholder="Start writing this chapter here…&#10;&#10;Use blank lines to separate paragraphs. You can use ## for a section heading.">'+escapeHtml(ch.content)+'</textarea><div class="studio-chapter-foot"><span>'+((ch.content.trim().match(/\S+/g)||[]).length).toLocaleString()+' words</span><span>Large writing area · Auto-counted</span></div></article>').join("")+'</div><button type="button" class="studio-add-chapter" data-add-chapter="'+pi+'">＋ Add chapter to '+escapeHtml(part.title||("Part "+(pi+1)))+'</button></section>').join("");
updateStudioStats();
}
function captureStudio(){
$("#studioParts").querySelectorAll("[data-part-title]").forEach(el=>{const p=Number(el.dataset.partTitle);if(studioParts[p])studioParts[p].title=el.value});
$("#studioParts").querySelectorAll("[data-chapter-title]").forEach(el=>{const [p,c]=el.dataset.chapterTitle.split(":").map(Number);if(studioParts[p]?.chapters[c])studioParts[p].chapters[c].title=el.value});
$("#studioParts").querySelectorAll("[data-chapter-content]").forEach(el=>{const [p,c]=el.dataset.chapterContent.split(":").map(Number);if(studioParts[p]?.chapters[c])studioParts[p].chapters[c].content=el.value});
}
function serializeStudio(){
captureStudio();
return studioParts.flatMap((part,pi)=>[
"## "+(part.title.trim()||("Part "+(pi+1))),
...part.chapters.map((ch,ci)=>"# "+(ch.title.trim()||("Chapter "+(ci+1)))+"\n\n"+ch.content.trim())
]).filter(s=>s.trim().length>0).join("\n\n");
}
function syncStudioToManuscript(){const value=serializeStudio();$("#manuscriptContentStore").value=value;return value}
function resetBookStudio(){studioParts=defaultStudio();renderStudio();$("#manuscriptContentStore").value=""}
function loadManuscriptIntoStudio(source){
const text=String(source||"").replace(/\r\n?/g,"\n").trim();
if(!text){resetBookStudio();return}
const parts=[];let currentPart=null,currentChapter=null;
const flushChapter=()=>{if(currentChapter&&currentPart)currentPart.chapters.push(currentChapter);currentChapter=null};
const ensurePart=title=>{if(!currentPart||currentPart.title!==title){currentPart={title,chapters:[]};parts.push(currentPart)}};
for(const line of text.split("\n")){
const partMatch=line.match(/^##\s+(Part\s+.+)$/i);
const chapterMatch=line.match(/^#\s+(.+)$/);
if(partMatch){flushChapter();ensurePart(partMatch[1].trim());continue}
if(chapterMatch){
flushChapter();
const heading=chapterMatch[1].trim(),combined=heading.match(/^(Part\s+.+?)\s+[—-]\s+(.+)$/i);
if(combined){ensurePart(combined[1].trim());currentChapter={title:combined[2].trim(),lines:[]}}
else{if(!currentPart)ensurePart("Part I");currentChapter={title:heading,lines:[]}}
}else if(currentChapter)currentChapter.lines.push(line);
else if(line.trim()){if(!currentPart)ensurePart("Part I");currentChapter={title:"Chapter 1",lines:[line]}}
}
flushChapter();
studioParts=parts.length?parts:defaultStudio();
studioParts.forEach(p=>{if(!p.chapters.length)p.chapters.push({title:"Chapter 1",lines:[]})});
studioParts=studioParts.map(p=>({...p,chapters:p.chapters.map(c=>({title:c.title,content:(c.lines||[]).join("\n").trim()}))}));
renderStudio();syncStudioToManuscript();
}
$("#studioParts").addEventListener("input",e=>{
const el=e.target;
if(el.matches("[data-part-title]")){const p=Number(el.dataset.partTitle);if(studioParts[p])studioParts[p].title=el.value}
if(el.matches("[data-chapter-title]")){const [p,c]=el.dataset.chapterTitle.split(":").map(Number);if(studioParts[p]?.chapters[c])studioParts[p].chapters[c].title=el.value}
if(el.matches("[data-chapter-content]")){const [p,c]=el.dataset.chapterContent.split(":").map(Number);if(studioParts[p]?.chapters[c])studioParts[p].chapters[c].content=el.value;const card=el.closest(".studio-chapter");const words=(el.value.trim().match(/\S+/g)||[]).length;card.querySelector(".studio-chapter-foot span").textContent=words.toLocaleString()+" words"}
updateStudioStats();
});
$("#studioParts").addEventListener("click",e=>{
const b=e.target.closest("button");if(!b)return;captureStudio();
const move=(arr,from,to)=>{if(to<0||to>=arr.length)return;const [item]=arr.splice(from,1);arr.splice(to,0,item)};
if(b.dataset.addChapter!==undefined){const p=Number(b.dataset.addChapter);studioParts[p].chapters.push({title:"Chapter "+(studioParts[p].chapters.length+1),content:""})}
else if(b.dataset.partUp!==undefined)move(studioParts,Number(b.dataset.partUp),Number(b.dataset.partUp)-1);
else if(b.dataset.partDown!==undefined)move(studioParts,Number(b.dataset.partDown),Number(b.dataset.partDown)+1);
else if(b.dataset.partRemove!==undefined){const p=Number(b.dataset.partRemove);if(studioParts.length>1&&confirm("Remove this part and all its chapters?"))studioParts.splice(p,1)}
else if(b.dataset.chapterUp!==undefined){const [p,c]=b.dataset.chapterUp.split(":").map(Number);move(studioParts[p].chapters,c,c-1)}
else if(b.dataset.chapterDown!==undefined){const [p,c]=b.dataset.chapterDown.split(":").map(Number);move(studioParts[p].chapters,c,c+1)}
else if(b.dataset.chapterRemove!==undefined){const [p,c]=b.dataset.chapterRemove.split(":").map(Number);if(studioParts[p].chapters.length>1&&confirm("Remove this chapter and its writing?"))studioParts[p].chapters.splice(c,1)}
else return;
renderStudio();
});
$("#addBookPart").addEventListener("click",()=>{captureStudio();studioParts.push({title:"Part "+["I","II","III","IV","V","VI","VII","VIII","IX","X"][studioParts.length]||("Part "+(studioParts.length+1)),chapters:[{title:"Chapter 1",content:""}]});renderStudio();$("#studioParts .studio-part:last-child").scrollIntoView({behavior:"smooth",block:"center"})});
resetBookStudio();
let previewObjectUrl="";
function closeBookPreview(){const dialog=$("#bookPreviewDialog");if(dialog.open)dialog.close();$("#bookPreviewFrame").src="about:blank";if(previewObjectUrl){URL.revokeObjectURL(previewObjectUrl);previewObjectUrl="";}}
let readerPreviewWindow=null;
window.addEventListener("message",event=>{
if(event.origin!==location.origin||event.source!==readerPreviewWindow||event.data?.type!=="vellora-reader-preview-ready")return;
const form=$("#bookForm"),manuscript=syncStudioToManuscript(),f=new FormData(form);
readerPreviewWindow.postMessage({type:"vellora-reader-preview-data",payload:{title:String(f.get("title")||"Untitled story"),author:String(f.get("author")||"VELLORA Editions"),genre:String(f.get("genre")||"VELLORA EDITIONS"),manuscript}},location.origin);
});
$("#previewReader").addEventListener("click",()=>{
const form=$("#bookForm"),manuscript=syncStudioToManuscript();
if(!form.reportValidity())return;
if(readerPreviewWindow&&!readerPreviewWindow.closed)readerPreviewWindow.close();
readerPreviewWindow=window.open("reader.html?preview=1","_blank");
if(!readerPreviewWindow){status($("#adminStatus"),"Your browser blocked the preview window. Allow pop-ups for VELLORA and try again.","error");return}
status($("#adminStatus"),"Opening the real VELLORA reader with your current draft. Nothing has been saved or published.","success");
});
$("#previewBook").addEventListener("click",()=>{
const form=$("#bookForm"),manuscript=syncStudioToManuscript();
if(!form.reportValidity())return;
if(studioParts.some(p=>p.chapters.some(ch=>ch.content.trim().length<20))){status($("#adminStatus"),"Every chapter needs at least 20 characters of writing before previewing.","error");return}
const f=new FormData(form),title=String(f.get("title")||"").trim(),author=String(f.get("author")||"").trim(),genre=String(f.get("genre")||"").trim(),style=String(f.get("cover_style")||"nocturne");
try{
const blob=makeBookPdf(title,author,genre,style,manuscript);
if(previewObjectUrl)URL.revokeObjectURL(previewObjectUrl);
previewObjectUrl=URL.createObjectURL(blob);
$("#bookPreviewTitle").textContent=title;
$("#bookPreviewMeta").textContent="By "+author+" · "+genre+" · "+(blob.size/1024).toFixed(0)+" KB";
$("#bookPreviewFrame").src=previewObjectUrl;
$("#bookPreviewDialog").showModal();
}catch(err){status($("#adminStatus"),"Could not create the book preview: "+err.message,"error");}
});
$("#closeBookPreview").addEventListener("click",closeBookPreview);
$("#bookPreviewDialog").addEventListener("click",e=>{if(e.target===$("#bookPreviewDialog"))closeBookPreview();});
$("#bookPreviewDialog").addEventListener("close",()=>{if($("#bookPreviewFrame").src!=="about:blank")$("#bookPreviewFrame").src="about:blank";if(previewObjectUrl){URL.revokeObjectURL(previewObjectUrl);previewObjectUrl="";}});

$("#bookForm").addEventListener("submit",async e=>{e.preventDefault();const form=e.currentTarget;if(!sessionToken){lock();return}const manuscript=syncStudioToManuscript();const f=new FormData(form);if(!manuscript||studioParts.some(p=>p.chapters.some(ch=>ch.content.trim().length<20))){status($("#adminStatus"),"Every chapter needs at least 20 characters of writing before publishing.","error");return}if(!f.get("cover_style")){status($("#adminStatus"),"Choose a signature cover.","error");return}const publish=editingSubmissionId?true:e.submitter?.dataset.publish==="yes";f.set("action",editingSubmissionId?"approve-submission":publish?(editingId?"update-book":"add-book"):(editingId?"update-draft":"add-draft"));f.set("is_published",publish?"on":"off");if(editingId)f.set("id",editingId);if(editingSubmissionId)f.set("submission_id",editingSubmissionId);status($("#adminStatus"),editingSubmissionId?"Preparing the verified submission as a VELLORA edition…":publish?"Preparing your book for the public Library…":"Preparing your private VELLORA draft…");try{const blob=makeBookPdf(String(f.get("title")),String(f.get("author")),String(f.get("genre")),String(f.get("cover_style")),String(f.get("manuscript_content")));const safe=String(f.get("title")).toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||"vellora-book";f.set("pdf",new File([blob],safe+".pdf",{type:"application/pdf"}));status($("#adminStatus"),"Uploading your finished VELLORA edition…");await callApi(f,sessionToken);form.reset();resetBookStudio();editingId=null;editingSubmissionId=null;$("#cancelSubmissionReview").hidden=true;document.querySelector('input[name="cover_style"][value="nocturne"]').checked=true;$("#bookForm").querySelector('button[data-publish="no"]').textContent="Save as draft";$("#bookForm").querySelector('button[data-publish="yes"]').textContent="Publish to VELLORA";$("#bookFormHeading").textContent="Add a book";status($("#adminStatus"),publish?"Book published successfully. It is now available in the public Library.":"Draft saved successfully. It is private and will not appear in the public Library.","success");await loadBooks();await loadSubmissions()}catch(err){if(/session|access code|expired/i.test(err.message))lock();status($("#adminStatus"),err.message,"error")}});

function escapeHtml(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
async function loadBooks(){if(!sessionToken)return;const box=$("#bookList");box.textContent="Loading books…";try{const r=await callApi({action:"list-books"},sessionToken);bookCache=r.books||[];renderBooks()}catch(err){box.textContent=err.message;if(/session|expired/i.test(err.message))lock()}}
async function loadSubmissions(){if(!sessionToken)return;const box=$("#submissionList");box.textContent="Loading reader submissions…";try{const r=await callApi({action:"list-submissions"},sessionToken);submissionCache=r.submissions||[];renderSubmissions()}catch(err){box.textContent=err.message;if(/session|expired/i.test(err.message))lock()}}
function renderSubmissions(){const box=$("#submissionList"),count=$("#submissionCount");if(count)count.textContent=submissionCache.length+" pending submission"+(submissionCache.length===1?"":"s");if(!submissionCache.length){box.innerHTML='<p class="admin-note">No pending submissions. New reader manuscripts will appear here.</p>';return}box.innerHTML=submissionCache.map(s=>'<article class="submission-row"><div class="submission-copy"><div class="submission-meta"><strong>'+escapeHtml(s.title)+'</strong><span>'+escapeHtml(s.author)+' · '+escapeHtml(s.genre)+' · '+escapeHtml(s.language||"English")+'</span><small>Submitted '+new Date(s.submitted_at).toLocaleString()+'</small></div><p>'+escapeHtml(s.description||"No description provided.")+'</p></div><div class="submission-actions"><button type="button" data-review-submission="'+escapeHtml(s.id)+'">Review &amp; edit</button><button type="button" class="danger-btn" data-reject-submission="'+escapeHtml(s.id)+'">Reject</button></div></article>').join("")}
async function reviewSubmission(id){try{const result=await callApi({action:"get-submission",id},sessionToken),s=result.submission;if(!s)return;editingId=null;editingSubmissionId=id;const f=$("#bookForm");for(const k of ["title","author","genre","language","description","manuscript_content"]){const el=f.elements.namedItem(k);if(el)el.value=s[k]??""}loadManuscriptIntoStudio(s.manuscript_content);const radio=f.querySelector('input[name="cover_style"][value="'+s.cover_style+'"]');if(radio)radio.checked=true;else f.querySelector('input[name="cover_style"][value="nocturne"]').checked=true;f.elements.namedItem("reading_time_minutes").value="";for(const k of ["is_featured","is_recommended"])f.elements.namedItem(k).checked=false;const submit=f.querySelector('button[type="submit"]');submit.textContent="Approve & publish verified book";$("#cancelSubmissionReview").hidden=false;$("#bookFormHeading").textContent="Review reader submission";status($("#adminStatus"),"Reviewing "+s.title+". Edit any details, then approve and publish it. It stays private until you submit this form.","success");f.scrollIntoView({behavior:"smooth",block:"start"})}catch(err){status($("#adminStatus"),err.message,"error")}}
$("#cancelSubmissionReview").addEventListener("click",()=>{editingSubmissionId=null;$("#bookForm").reset();resetBookStudio();$("#cancelSubmissionReview").hidden=true;$("#bookFormHeading").textContent="Add a book";$("#bookForm").querySelector('button[data-publish="no"]').textContent="Save as draft";$("#bookForm").querySelector('button[data-publish="yes"]').textContent="Publish to VELLORA";document.querySelector('input[name="cover_style"][value="nocturne"]').checked=true;status($("#adminStatus"),"Submission review cancelled. No changes were published.");});
$("#refreshSubmissions").addEventListener("click",loadSubmissions);
$("#submissionList").addEventListener("click",async e=>{const review=e.target.closest("[data-review-submission]"),reject=e.target.closest("[data-reject-submission]");if(review){await reviewSubmission(review.dataset.reviewSubmission);return}if(reject){const s=submissionCache.find(x=>x.id===reject.dataset.rejectSubmission);if(!confirm('Reject "'+(s?.title||"this submission")+'"?'))return;try{await callApi({action:"reject-submission",id:reject.dataset.rejectSubmission},sessionToken);status($("#adminStatus"),"Submission rejected. It will not appear in the public Library.","success");await loadSubmissions()}catch(err){status($("#adminStatus"),err.message,"error")}}});
function renderBooks(){const box=$("#bookList"),term=($("#bookFilter")?.value||"").toLowerCase(),filter=$("#bookStatusFilter")?.value||"all";const total=bookCache.length,published=bookCache.filter(b=>!!b.is_published).length;$("#statTotal").textContent=total;$("#statPublished").textContent=published;$("#statDrafts").textContent=total-published;$("#statFeatured").textContent=bookCache.filter(b=>!!b.is_featured).length;$("#statRecommended").textContent=bookCache.filter(b=>!!b.is_recommended).length;const seriesOrder={"the-black-envelopes":0,"the-backwards-clock":1};const seriesRank=b=>seriesOrder[b.slug]??({"the black envelopes":0,"the backwards clock":1}[String(b.title||"").trim().toLowerCase()]??99);const rows=bookCache.filter(b=>[b.title,b.author,b.genre].some(v=>String(v||"").toLowerCase().includes(term))).filter(b=>filter==="published"?!!b.is_published:filter==="draft"?!b.is_published:filter==="featured"?!!b.is_featured:filter==="recommended"?!!b.is_recommended:true).sort((x,y)=>seriesRank(x)-seriesRank(y));if(!rows.length){box.innerHTML='<p class="admin-note">No books found. Add your first book above.</p>';return}box.innerHTML=rows.map(b=>'<article class="book-row"><div class="book-row-copy"><strong>'+escapeHtml(b.title||"Untitled book")+'</strong><span>'+escapeHtml(b.author||"Unknown author")+' · '+escapeHtml(b.genre||"Uncategorised")+'</span><small class="'+(b.is_published?"published":"draft")+'">'+(b.is_published?"Published":"Draft")+'</small>'+(b.slug==="the-clockmakers-last-letter"&&!b.pdf_path?'<small class="sample-note">VELLORA original story · Published. Edit and save to store its formatted PDF.</small>':"")+'</div><div class="book-row-actions"><button type="button" data-edit="'+escapeHtml(b.id)+'">Edit</button><button type="button" data-toggle="'+escapeHtml(b.id)+'">'+(b.is_published?"Unpublish":"Publish")+'</button><button type="button" class="danger-btn" data-delete="'+escapeHtml(b.id)+'">Delete</button></div></article>').join("")}
function editBook(id){const b=bookCache.find(x=>x.id===id);if(!b)return;editingSubmissionId=null;$("#cancelSubmissionReview").hidden=true;editingId=id;const f=$("#bookForm");for(const k of ["title","author","genre","language","description","manuscript_content","reading_time_minutes"]){const el=f.elements.namedItem(k);if(el)el.value=b[k]??""}loadManuscriptIntoStudio(b.manuscript_content);const style=String(b.cover_url||"").replace("vellora-cover://","");const radio=f.querySelector('input[name="cover_style"][value="'+style+'"]');if(radio)radio.checked=true;else f.querySelector('input[name="cover_style"][value="nocturne"]').checked=true;for(const k of ["is_featured","is_recommended"])f.elements.namedItem(k).checked=!!b[k];f.querySelector('button[data-publish="no"]').textContent="Save changes as draft";f.querySelector('button[data-publish="yes"]').textContent="Save changes & publish";$("#bookFormHeading").textContent="Edit book";status($("#adminStatus"),"Editing "+(b.title||"Untitled book")+". Saving regenerates its PDF.");f.scrollIntoView({behavior:"smooth",block:"start"})}
$("#refreshBooks").addEventListener("click",loadBooks);$("#bookFilter").addEventListener("input",renderBooks);$("#bookStatusFilter").addEventListener("change",renderBooks);
$("#bookList").addEventListener("click",async e=>{const edit=e.target.closest("[data-edit]"),del=e.target.closest("[data-delete]"),tog=e.target.closest("[data-toggle]");if(edit){editBook(edit.dataset.edit);return}if(del){const b=bookCache.find(x=>x.id===del.dataset.delete);if(!confirm('Permanently delete "'+(b?.title||"this book")+'" and its PDF?'))return;try{const r=await callApi({action:"delete-book",id:del.dataset.delete},sessionToken);status($("#adminStatus"),"Book deleted.","success");await loadBooks()}catch(err){status($("#adminStatus"),err.message,"error")}return}if(tog){const b=bookCache.find(x=>x.id===tog.dataset.toggle);if(!b)return;try{await callApi({action:"set-published",id:b.id,published:!b.is_published},sessionToken);status($("#adminStatus"),b.is_published?"Book unpublished.":"Book published.","success");await loadBooks()}catch(err){status($("#adminStatus"),err.message,"error")}}});
$("#deleteAllBooks").addEventListener("click",async()=>{if(!bookCache.length){alert("There are no books to delete.");return}if(!confirm("Delete ALL "+bookCache.length+" books and their PDF files? This cannot be undone."))return;if(!confirm("Final confirmation: permanently erase every book from VELLORA?"))return;try{const r=await callApi({action:"delete-all-books"},sessionToken);status($("#adminStatus"),r.deleted+" books deleted.","success");await loadBooks()}catch(err){status($("#adminStatus"),err.message,"error")}});
restore();
})();