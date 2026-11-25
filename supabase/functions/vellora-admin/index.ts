import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.119.1";

const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, apikey, x-client-info, content-type, x-vellora-admin-session", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Max-Age": "86400" };
const encoder = new TextEncoder();
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json", "Cache-Control": "no-store" } });
const equal = (a: string, b: string) => { let diff = a.length ^ b.length; const n = Math.max(a.length,b.length); for(let i=0;i<n;i++) diff |= (a.charCodeAt(i)||0) ^ (b.charCodeAt(i)||0); return diff===0; };
const b64url = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes)).replace(/=/g,"").replace(/\+/g,"-").replace(/\//g,"_");
const fromB64url = (s: string) => Uint8Array.from(atob(s.replace(/-/g,"+").replace(/_/g,"/")+"=".repeat((4-s.length%4)%4)),c=>c.charCodeAt(0));
async function hmac(secret:string,data:string){const key=await crypto.subtle.importKey("raw",encoder.encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign"]);return new Uint8Array(await crypto.subtle.sign("HMAC",key,encoder.encode(data)));}
const SESSION_MS=7*24*60*60*1000;
const signingKey=(secret:string,serviceKey:string)=>secret+":"+serviceKey;
async function issueToken(secret:string,serviceKey:string){const exp=Date.now()+SESSION_MS;const payload=b64url(encoder.encode(JSON.stringify({exp,scope:"vellora-admin"})));return {token:payload+"."+b64url(await hmac(signingKey(secret,serviceKey),payload)),expiresAt:exp};}
async function validToken(token:string,secret:string,serviceKey:string){try{const [payload,sig]=token.split(".");if(!payload||!sig)return false;const expected=await hmac(signingKey(secret,serviceKey),payload);if(!equal(b64url(expected),sig))return false;const data=JSON.parse(new TextDecoder().decode(fromB64url(payload)));return data.scope==="vellora-admin"&&Number(data.exp)>Date.now();}catch{return false;}}
async function sha(value:string){return b64url(new Uint8Array(await crypto.subtle.digest("SHA-256",encoder.encode(value))));}

Deno.serve(async(req:Request)=>{
 if(req.method==="OPTIONS")return new Response("ok",{headers:cors});
 if(req.method!=="POST")return json({error:"Method not allowed."},405);
 const url=Deno.env.get("SUPABASE_URL")!, serviceKey=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
 const secret=Deno.env.get("VELLORA_ADMIN_SECRET_CODE");
 if(!secret||secret.length<6||secret.length>128||/\s/.test(secret))return json({error:"Admin access is not configured. Set VELLORA_ADMIN_SECRET_CODE to 6–128 characters with no spaces in Supabase Function Secrets."},503);
 const db=createClient(url,serviceKey,{auth:{persistSession:false,autoRefreshToken:false}});
 const authHeader=req.headers.get("authorization")||"";
 const bearer=req.headers.get("x-vellora-admin-session")||"";
 const contentType=req.headers.get("content-type")||"";
 let action="", actionBody:any={};
 if(contentType.includes("application/json")){
   try{actionBody=await req.json()}catch{return json({error:"Invalid request."},400)}
   action=String(actionBody.action||"");
   if(action==="login"){
     const ip=req.headers.get("cf-connecting-ip")||req.headers.get("x-real-ip")||(req.headers.get("x-forwarded-for")||"unknown").split(",")[0].trim();
     const ipHash=await sha(secret+":"+ip), now=Date.now();
     const {data:attempt}=await db.from("vellora_admin_login_attempts").select("*").eq("ip_hash",ipHash).maybeSingle();
     if(attempt&&now-new Date(attempt.window_started_at).getTime()<15*60*1000&&attempt.failed_attempts>=5)return json({error:"Too many attempts. Try again in 15 minutes."},429);
     const ok=equal(String(actionBody.loginCode||""),"123098")&&equal(String(actionBody.secretCode||""),secret);
     if(!ok){
       const fresh=!attempt||now-new Date(attempt.window_started_at).getTime()>=15*60*1000;
       const count=fresh?1:Number(attempt.failed_attempts)+1;
       const {error}=await db.from("vellora_admin_login_attempts").upsert({ip_hash:ipHash,window_started_at:fresh?new Date().toISOString():attempt.window_started_at,failed_attempts:count,updated_at:new Date().toISOString()});
       if(error)return json({error:"Login service temporarily unavailable."},503);
       return json({error:"The login code or secret access code is incorrect."},401);
     }
     await db.from("vellora_admin_login_attempts").delete().eq("ip_hash",ipHash);
     const issued=await issueToken(secret,serviceKey);
     return json({...issued,expiresIn:7*24*60*60});
   }
 }
 if(action==="verify"){if(!await validToken(bearer,secret,serviceKey))return json({error:"Admin session is invalid or expired. Please unlock the Admin Hub again."},401);return json({ok:true});}
 if(!await validToken(bearer,secret,serviceKey))return json({error:"Admin session is invalid or expired. Please unlock the Admin Hub again."},401);

 if(contentType.includes("application/json") && action!=="login"){
   if(!await validToken(bearer,secret,serviceKey))return json({error:"Admin session is invalid or expired. Please unlock the Admin Hub again."},401);
   if(action==="list-books"){const {data,error}=await db.from("books").select("id,title,author,genre,description,manuscript_content,cover_url,pdf_path,language,reading_time_minutes,is_featured,is_recommended,is_published,created_at,updated_at,published_at").order("published_at",{ascending:false,nullsFirst:false}).order("created_at",{ascending:false});if(error)return json({error:"Could not load books: "+error.message},400);return json({books:data||[]});}
   if(action==="list-submissions"){const {data,error}=await db.from("book_submissions").select("id,title,author,genre,language,description,cover_style,submitted_at").eq("status","pending").order("submitted_at",{ascending:true});if(error)return json({error:"Could not load reader submissions: "+error.message},400);return json({submissions:data||[]});}
   if(action==="get-submission"){const id=String(actionBody.id||"");if(!id)return json({error:"A submission ID is required."},400);const {data,error}=await db.from("book_submissions").select("id,title,author,genre,language,description,manuscript_content,cover_style").eq("id",id).eq("status","pending").maybeSingle();if(error)return json({error:"Could not load this manuscript: "+error.message},400);if(!data)return json({error:"This submission is no longer pending."},404);return json({submission:data});}
   if(action==="reject-submission"){const id=String(actionBody.id||"");if(!id)return json({error:"A submission ID is required."},400);const {data,error}=await db.from("book_submissions").update({status:"rejected",reviewed_at:new Date().toISOString(),review_note:String(actionBody.note||"").slice(0,1000)}).eq("id",id).eq("status","pending").select("id").maybeSingle();if(error)return json({error:"Could not reject submission: "+error.message},400);if(!data)return json({error:"This submission is no longer pending."},409);return json({ok:true});}
   if(action==="set-published"){const id=String(actionBody.id||"");const {error}=await db.from("books").update({is_published:!!actionBody.published,published_at:!!actionBody.published?new Date().toISOString():null,updated_at:new Date().toISOString()}).eq("id",id);if(error)return json({error:"Could not update publication status: "+error.message},400);return json({ok:true});}
   if(action==="delete-book"||action==="delete-all-books"){const id=String(actionBody.id||"");if(action==="delete-book"&&!id)return json({error:"A book ID is required."},400);let q=db.from("books").select("id,pdf_path");if(action==="delete-book")q=q.eq("id",id);const {data:rows,error:readError}=await q;if(readError)return json({error:readError.message},400);if(action==="delete-book"&&!rows?.length)return json({error:"Book not found."},404);const ids=(rows||[]).map((r:any)=>r.id);if(ids.length){const {error}=await db.from("books").delete().in("id",ids);if(error)return json({error:"Delete failed: "+error.message},400);}const paths=(rows||[]).map((r:any)=>r.pdf_path).filter((p:string)=>!!p);if(paths.length){const {error}=await db.storage.from("book-files").remove(paths);if(error)return json({ok:true,deleted:ids.length,warning:"Book records deleted; PDF cleanup warning: "+error.message});}return json({ok:true,deleted:ids.length});}
   return json({error:"Unknown admin action."},400);
 }
 if(!contentType.includes("multipart/form-data"))return json({error:"Invalid upload request."},400);
 let form:FormData;try{form=await req.formData()}catch{return json({error:"Could not read upload form."},400)}
 const formAction=String(form.get("action")||"");if(!["add-book","update-book","approve-submission"].includes(formAction))return json({error:"Unknown admin action."},400);const editId=String(form.get("id")||"");const submissionId=String(form.get("submission_id")||"");let existing:any=null,submission:any=null;if(formAction==="update-book"){if(!editId)return json({error:"Book ID is required."},400);const found=await db.from("books").select("*").eq("id",editId).maybeSingle();if(found.error||!found.data)return json({error:"Book to edit was not found."},404);existing=found.data;}if(formAction==="approve-submission"){if(!submissionId)return json({error:"Submission ID is required."},400);const found=await db.from("book_submissions").select("id,status").eq("id",submissionId).maybeSingle();if(found.error||!found.data||found.data.status!=="pending")return json({error:"This reader submission is no longer pending."},409);submission=found.data;}
 const title=String(form.get("title")||"").trim(),author=String(form.get("author")||"").trim(),genre=String(form.get("genre")||"").trim(),language=String(form.get("language")||"English").trim();
 const coverStyle=String(form.get("cover_style")||"");
 const allowedCovers=new Set(["nocturne","botanical","gilded","midnight","terracotta"]);
 const allowedGenres=new Set(["Fantasy","Romance","Mystery","Thriller","Horror","Science Fiction","Adventure","Drama","Historical Fiction","Poetry","Children’s Fiction","Young Adult","Non-fiction"]);
 const pdf=form.get("pdf");
 if(!title||title.length>180||!author||author.length>160||!genre||genre.length>80||!language||language.length>80||!allowedCovers.has(coverStyle)||!allowedGenres.has(genre))return json({error:"Complete required book details, choose an available genre and choose a VELLORA cover."},400);
 if(!(pdf instanceof File)||pdf.size===0||pdf.type!=="application/pdf")return json({error:"The generated VELLORA PDF is missing or invalid. Please try publishing again."},400);
 if(pdf.size>50*1024*1024)return json({error:"The generated PDF exceeds VELLORA’s 50 MB storage limit. Shorten the manuscript and publish again."},413);
 const id=formAction==="update-book"?editId:crypto.randomUUID(),base=id+"-"+title.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,100);
 const pdfPath=base+"-"+crypto.randomUUID().slice(0,8)+".pdf";
 const bytes=new Uint8Array(await pdf.arrayBuffer());const upload=await db.storage.from("book-files").upload(pdfPath,bytes,{upsert:false,contentType:"application/pdf"});if(upload.error)return json({error:"Generated PDF upload failed: "+upload.error.message},400);
 const reading=form.get("reading_time_minutes");
 const row={title,author,slug:existing?.slug||base+"-"+id.slice(0,8),description:String(form.get("description")||"").slice(0,3000),manuscript_content:String(form.get("manuscript_content")||"").trim(),genre,cover_url:"vellora-cover://"+coverStyle,pdf_path:pdfPath,language,reading_time_minutes:reading?Math.max(1,Math.min(100000,Number(reading)||1)):null,is_featured:form.get("is_featured")==="on",is_recommended:form.get("is_recommended")==="on",is_published:true,updated_at:new Date().toISOString()};
 const saved=formAction==="update-book"?await db.from("books").update(row).eq("id",id):await db.from("books").insert({...row,id,created_by:null});
 if(saved.error){await db.storage.from("book-files").remove([pdfPath]);return json({error:"Book record could not be saved: "+saved.error.message},400);}
 if(formAction==="approve-submission"){const reviewed=await db.from("book_submissions").update({status:"approved",reviewed_at:new Date().toISOString(),review_note:"Approved and published by VELLORA admin."}).eq("id",submission.id).eq("status","pending").select("id").maybeSingle();if(reviewed.error||!reviewed.data){await db.from("books").delete().eq("id",id);await db.storage.from("book-files").remove([pdfPath]);return json({error:"The submission could not be marked approved. The new book was rolled back; please refresh the queue and try again."},409);}}
 if(existing?.pdf_path)await db.storage.from("book-files").remove([existing.pdf_path]);
 return json({ok:true,id,updated:formAction==="update-book",approvedSubmission:formAction==="approve-submission"});
});