import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.119.1";

const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" };
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
 if(!secret||!/^[A-Za-z0-9]{6}$/.test(secret))return json({error:"Admin access is not configured. Set VELLORA_ADMIN_SECRET_CODE to exactly six letters or digits in Supabase Function Secrets."},503);
 const db=createClient(url,serviceKey,{auth:{persistSession:false,autoRefreshToken:false}});
 const authHeader=req.headers.get("authorization")||"";
 const bearer=authHeader.startsWith("Bearer ")?authHeader.slice(7):"";
 const contentType=req.headers.get("content-type")||"";
 let action="";
 if(contentType.includes("application/json")){
   let body:any;try{body=await req.json()}catch{return json({error:"Invalid request."},400)}
   action=String(body.action||"");
   if(action==="login"){
     const ip=req.headers.get("cf-connecting-ip")||req.headers.get("x-real-ip")||(req.headers.get("x-forwarded-for")||"unknown").split(",")[0].trim();
     const ipHash=await sha(secret+":"+ip), now=Date.now();
     const {data:attempt}=await db.from("vellora_admin_login_attempts").select("*").eq("ip_hash",ipHash).maybeSingle();
     if(attempt&&now-new Date(attempt.window_started_at).getTime()<15*60*1000&&attempt.failed_attempts>=5)return json({error:"Too many attempts. Try again in 15 minutes."},429);
     const ok=equal(String(body.loginCode||""),"123098")&&equal(String(body.secretCode||""),secret);
     if(!ok){
       const fresh=!attempt||now-new Date(attempt.window_started_at).getTime()>=15*60*1000;
       const count=fresh?1:Number(attempt.failed_attempts)+1;
       const {error}=await db.from("vellora_admin_login_attempts").upsert({ip_hash:ipHash,window_started_at:fresh?new Date().toISOString():attempt.window_started_at,failed_attempts:count,updated_at:new Date().toISOString()});
       if(error)return json({error:"Login service temporarily unavailable."},503);
       return json({error:"The login code or secret access code is incorrect."},401);
     }
     await db.from("vellora_admin_login_attempts").delete().eq("ip_hash",ipHash);
     const issued=await issueToken(secret,serviceKey);\n     return json({...issued,expiresIn:7*24*60*60});
   }
 }
 if(action==="verify"){if(!await validToken(bearer,secret,serviceKey))return json({error:"Admin session is invalid or expired. Please unlock the Admin Hub again."},401);return json({ok:true});}\n if(!await validToken(bearer,secret,serviceKey))return json({error:"Admin session is invalid or expired. Please unlock the Admin Hub again."},401);
 if(!contentType.includes("multipart/form-data"))return json({error:"Invalid upload request."},400);
 let form:FormData;try{form=await req.formData()}catch{return json({error:"Could not read upload form."},400)}
 if(String(form.get("action")||"")!=="add-book")return json({error:"Unknown admin action."},400);
 const title=String(form.get("title")||"").trim(),author=String(form.get("author")||"").trim(),genre=String(form.get("genre")||"").trim(),language=String(form.get("language")||"English").trim();
 const cover=form.get("cover"),pdf=form.get("pdf");
 if(!title||title.length>180||!author||author.length>160||!genre||genre.length>80||!language||language.length>80||!(cover instanceof File)||!(pdf instanceof File))return json({error:"Complete all required book fields."},400);
 if(cover.size<1||cover.size>5*1024*1024||pdf.size<1||pdf.size>80*1024*1024)return json({error:"Cover must be under 5 MB and PDF under 80 MB."},400);
 const coverTypes:Record<string,string>={"image/jpeg":"jpg","image/png":"png","image/webp":"webp"};
 if(!coverTypes[cover.type]||pdf.type!=="application/pdf")return json({error:"Use a JPG, PNG or WebP cover and a PDF file."},400);
 const id=crypto.randomUUID(),base=id+"-"+title.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,100),coverPath=base+"."+coverTypes[cover.type],pdfPath=base+".pdf";
 const coverBytes=new Uint8Array(await cover.arrayBuffer()),pdfBytes=new Uint8Array(await pdf.arrayBuffer());
 const coverUpload=await db.storage.from("book-covers").upload(coverPath,coverBytes,{upsert:false,contentType:cover.type});
 if(coverUpload.error)return json({error:"Cover upload failed: "+coverUpload.error.message},400);
 const pdfUpload=await db.storage.from("book-files").upload(pdfPath,pdfBytes,{upsert:false,contentType:"application/pdf"});
 if(pdfUpload.error){await db.storage.from("book-covers").remove([coverPath]);return json({error:"PDF upload failed: "+pdfUpload.error.message},400);}
 const coverUrl=db.storage.from("book-covers").getPublicUrl(coverPath).data.publicUrl;
 const reading=form.get("reading_time_minutes");
 const row={id,title,author,slug:base+"-"+id.slice(0,8),description:String(form.get("description")||"").slice(0,3000),genre,cover_url:coverUrl,pdf_path:pdfPath,language,reading_time_minutes:reading?Math.max(1,Math.min(100000,Number(reading)||1)):null,is_featured:form.get("is_featured")==="on",is_recommended:form.get("is_recommended")==="on",is_published:form.get("is_published")==="on",created_by:null};
 const {error}=await db.from("books").insert(row);
 if(error){await db.storage.from("book-files").remove([pdfPath]);await db.storage.from("book-covers").remove([coverPath]);return json({error:"Book record could not be saved: "+error.message},400);}
 return json({ok:true,id});
});