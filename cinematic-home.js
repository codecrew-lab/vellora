/* VELLORA Phase 3 — progressive reveal and loading states */
(function(){
"use strict";
const reduce=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
function skeletons(){
 const grid=document.getElementById("grid"),featured=document.getElementById("featured");
 if(grid){grid.setAttribute("aria-busy","true");grid.classList.add("library-skeleton");grid.innerHTML=Array.from({length:6},()=>'<div class="skeleton-card" aria-hidden="true"><div class="skeleton-cover"></div><div class="skeleton-line"></div><div class="skeleton-line short"></div></div>').join("")}
 if(featured){featured.setAttribute("aria-busy","true");featured.innerHTML='<div class="feature-skeleton" aria-hidden="true"></div>'}
}
function reveal(root){
 if(!root)return;
 const items=root.matches&&root.matches(".card,.discovery-section,.featured")?[root]:Array.from(root.querySelectorAll(".card,.discovery-section,.featured"));
 items.forEach(el=>{
  if(el.dataset.revealBound)return;
  el.dataset.revealBound="1";
  if(reduce||!("IntersectionObserver"in window)){el.classList.add("reveal-ready");return}
  el.classList.add("reveal-pending");
  observer.observe(el);
 });
}
const observer=!("IntersectionObserver"in window)?null:new IntersectionObserver(entries=>{
 entries.forEach(entry=>{if(!entry.isIntersecting)return;entry.target.classList.remove("reveal-pending");entry.target.classList.add("reveal-ready");observer.unobserve(entry.target)});
},{rootMargin:"0px 0px -36px 0px",threshold:.06});
function init(){
 skeletons();
 const grid=document.getElementById("grid"),featured=document.getElementById("featured"),main=document.querySelector("main");
 if(!grid||!main)return;
 const finish=()=>{
  grid.classList.remove("library-skeleton");grid.removeAttribute("aria-busy");
  if(featured){featured.removeAttribute("aria-busy");reveal(featured)}
  reveal(main);
 };
 const mo=new MutationObserver(()=>{if(grid.children.length&& !grid.querySelector(".skeleton-card"))finish()});
 mo.observe(grid,{childList:true,subtree:false});
 const dynamic=new MutationObserver(records=>records.forEach(record=>record.addedNodes.forEach(node=>{if(node.nodeType===1)reveal(node)})));
 dynamic.observe(main,{childList:true,subtree:true});
 if(grid.children.length&&!grid.querySelector(".skeleton-card"))finish();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();