(function(){
"use strict";
const KEY="vellora.weeklyGoal",DEFAULT_GOAL=50;
const get=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback}catch(_){return fallback}};
const set=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value))}catch(_){}}
function weekStart(date=new Date()){
 const d=new Date(date.getFullYear(),date.getMonth(),date.getDate());
 d.setDate(d.getDate()-((d.getDay()+6)%7));
 return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");
}
function goal(){const value=Number(get(KEY,DEFAULT_GOAL));return Number.isFinite(value)?Math.max(1,Math.min(10000,Math.round(value))):DEFAULT_GOAL}
function pages(){return Math.max(0,Number(get("vellora.weeklyPages."+weekStart(),0))||0)}
function render(){
 const section=document.querySelector("#readingInsights");if(!section)return;
 let panel=section.querySelector("#weeklyReadingGoal");
 if(!panel){panel=document.createElement("section");panel.id="weeklyReadingGoal";panel.className="weekly-goal";panel.setAttribute("aria-labelledby","weeklyGoalTitle");section.append(panel)}
 const target=goal(),count=pages(),percent=Math.min(100,Math.round(count/target*100));
 panel.innerHTML='<div class="weekly-goal-copy"><span class="eyebrow">A little progress, every week</span><h3 id="weeklyGoalTitle">Your weekly reading goal</h3><p>Build a steady reading rhythm, one page at a time.</p><div class="weekly-goal-numbers"><strong>'+count.toLocaleString()+'</strong><span>of '+target.toLocaleString()+' pages</span><b>'+percent+'%</b></div><div class="weekly-goal-track" role="progressbar" aria-label="Weekly reading goal" aria-valuemin="0" aria-valuemax="'+target+'" aria-valuenow="'+Math.min(count,target)+'"><i style="width:'+percent+'%"></i></div><small>'+(count>=target?'Goal reached — wonderful work!':(target-count).toLocaleString()+' pages to reach your goal')+'</small></div><form class="weekly-goal-form"><label for="weeklyGoalTarget">Weekly target</label><input id="weeklyGoalTarget" name="target" type="number" min="1" max="10000" step="1" value="'+target+'" required><button type="submit">Update goal</button></form>';
 const form=panel.querySelector("form");form.addEventListener("submit",event=>{event.preventDefault();const input=form.elements.target,value=Number(input.value);if(!Number.isInteger(value)||value<1||value>10000){input.setCustomValidity("Choose a target from 1 to 10,000 pages.");input.reportValidity();return}input.setCustomValidity("");set(KEY,value);render()});
}
window.addEventListener("vellora:pages-read",event=>{const amount=Math.max(0,Number(event.detail?.pages)||0);if(amount){const key="vellora.weeklyPages."+weekStart();set(key,pages()+amount)}render()});
const observer=new MutationObserver(()=>{if(document.querySelector("#readingInsights"))render()});
observer.observe(document.documentElement,{childList:true,subtree:true});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",render,{once:true});else render();
})();
