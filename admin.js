(function(){
"use strict";
const cfg=window.VELLORA_CONFIG||{},$=s=>document.querySelector(s),client=window.supabase&&cfg.url?window.supabase.createClient(cfg.url,cfg.publishableKey):null;
let user=null;
function status(el,msg,kind){el.textContent=msg;el.className="admin-status"+(kind?" "+kind:"")}
async function refresh(){if(!client){status($("#loginStatus"),"Supabase configuration is missing.","error");return}const {data:{user:u}}=await client.auth.getUser();user=u;if(user&&user.app_metadata&&user.app_metadata.role==="admin"){$("#loginPanel").classList.add("admin-hidden");$("#dashboard").classList.remove("admin-hidden")}else{$("#loginPanel").classList.remove("admin-hidden");$("#dashboard").classList.add("admin-hidden");if(user)status($("#loginStatus"),"This account is not an admin. Ask the project owner to set trusted App Metadata role to admin, then sign in again.","error")}}
$("#loginForm").addEventListener("submit",async e=>{e.preventDefault();if(!client)return;const f=new FormData(e.currentTarget);status($("#loginStatus"),"Signing in…");const {error}=await client.auth.signInWithPassword({email:f.get("email"),password:f.get("password")});if(error){status($("#loginStatus"),error.message,"error");return}await refresh()});
$("#signOut").addEventListener("click",async()=>{await client.auth.signOut();location.reload()});
$("#bookForm").addEventListener("submit",async e=>{
 e.preventDefault();if(!client||!user||user.app_metadata.role!=="admin"){status($("#adminStatus"),"Admin permission required.","error");return}
 const f=new FormData(e.currentTarget),title=String(f.get("title")).trim(),author=String(f.get("author")).trim(),genre=String(f.get("genre")).trim(),cover=f.get("cover"),pdf=f.get("pdf");
 if(!title||!author||!genre||!cover.size||!pdf.size){status($("#adminStatus"),"Complete all required fields and select both files.","error");return}
 if(cover.size>5*1024*1024||pdf.size>80*1024*1024){status($("#adminStatus"),"Cover images must be under 5 MB and PDFs under 80 MB.","error");return}
 if(!["image/jpeg","image/png","image/webp"].includes(cover.type)||pdf.type!=="application/pdf"){status($("#adminStatus"),"Use a JPG, PNG or WebP cover and a PDF file.","error");return}
 status($("#adminStatus"),"Uploading cover and PDF…");
 const id=crypto.randomUUID(),base=id+"-"+title.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,""),coverPath=base+"."+cover.name.split(".").pop().toLowerCase(),pdfPath=base+".pdf";
 const cu=await client.storage.from("book-covers").upload(coverPath,cover,{upsert:false,contentType:cover.type});if(cu.error){status($("#adminStatus"),"Cover upload failed: "+cu.error.message,"error");return}
 const pu=await client.storage.from("book-files").upload(pdfPath,pdf,{upsert:false,contentType:"application/pdf"});if(pu.error){status($("#adminStatus"),"PDF upload failed: "+pu.error.message+". The uploaded cover may need manual cleanup.","error");return}
 const {data:coverData}=client.storage.from("book-covers").getPublicUrl(coverPath),row={id,title,author,slug:base+"-"+id.slice(0,8),description:String(f.get("description")||""),genre,cover_url:coverData.publicUrl,pdf_path:pdfPath,language:String(f.get("language")||"English"),reading_time_minutes:f.get("reading_time_minutes")?Number(f.get("reading_time_minutes")):null,is_featured:f.get("is_featured")==="on",is_recommended:f.get("is_recommended")==="on",is_published:f.get("is_published")==="on",created_by:user.id};
 const {error}=await client.from("books").insert(row);if(error){status($("#adminStatus"),"Book record failed: "+error.message+". Uploaded files may need manual cleanup.","error");return}
 e.currentTarget.reset();status($("#adminStatus"),"Book added successfully. "+(row.is_published?"It is now visible in the public library.":"It is saved as unpublished."),"success")
});
if(client){client.auth.onAuthStateChange(()=>refresh());refresh()}else status($("#loginStatus"),"Supabase client could not start. Check config.js and network access.","error");
})();