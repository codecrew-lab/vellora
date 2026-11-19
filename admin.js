(function(){
"use strict";
const API="https://egyrlxgpgkflcejtgvvc.supabase.co/functions/v1/vellora-admin";
const $=s=>document.querySelector(s);
let sessionToken="";
function status(el,msg,kind){el.textContent=msg;el.className="admin-status"+(kind?" "+kind:"")}
function lock(){sessionToken="";$("#loginPanel").classList.remove("admin-hidden");$("#dashboard").classList.add("admin-hidden");$("#loginForm").reset()}
async function callApi(action,body,token){
 const headers={};if(token)headers.Authorization="Bearer "+token;
 const isForm=body instanceof FormData;if(!isForm)headers["Content-Type"]="application/json";
 const response=await fetch(API,{method:"POST",headers,body:isForm?body:JSON.stringify(body)});
 let data={};try{data=await response.json()}catch(_){}
 if(!response.ok)throw new Error(data.error||"The request could not be completed.");
 return data;
}
$("#loginForm").addEventListener("submit",async e=>{
 e.preventDefault();const f=new FormData(e.currentTarget);status($("#loginStatus"),"Checking your access codes…");
 try{const result=await callApi("login",{action:"login",loginCode:String(f.get("loginCode")||""),secretCode:String(f.get("secretCode")||"")});sessionToken=result.token;$("#loginPanel").classList.add("admin-hidden");$("#dashboard").classList.remove("admin-hidden");e.currentTarget.reset();status($("#adminStatus"),"Admin hub unlocked. Your session expires automatically after 30 minutes.","success")}
 catch(err){status($("#loginStatus"),err.message,"error")}
});
$("#signOut").addEventListener("click",lock);
$("#bookForm").addEventListener("submit",async e=>{
 e.preventDefault();if(!sessionToken){lock();return}
 const form=new FormData(e.currentTarget),cover=form.get("cover"),pdf=form.get("pdf");
 if(!cover||!cover.size||!pdf||!pdf.size){status($("#adminStatus"),"Choose both a cover image and a PDF.","error");return}
 if(cover.size>5*1024*1024||pdf.size>80*1024*1024){status($("#adminStatus"),"Cover images must be under 5 MB and PDFs under 80 MB.","error");return}
 if(!["image/jpeg","image/png","image/webp"].includes(cover.type)||pdf.type!=="application/pdf"){status($("#adminStatus"),"Use a JPG, PNG or WebP cover and a PDF file.","error");return}
 status($("#adminStatus"),"Uploading book securely…");
 try{form.set("action","add-book");await callApi("add-book",form,sessionToken);e.currentTarget.reset();status($("#adminStatus"),"Book added successfully. "+(form.get("is_published")==="on"?"It is now visible in the public library.":"It is saved as unpublished."),"success")}
 catch(err){if(/session|access code|expired/i.test(err.message))lock();status($("#adminStatus"),err.message,"error")}
});
})();