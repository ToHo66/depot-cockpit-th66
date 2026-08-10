import { gunzipSync } from 'node:zlib';

const TTL_MS = 15 * 60 * 1000;
const KEY = '__TH66_XETRA_DELAYED_CACHE_531__';
const cache = globalThis[KEY] || (globalThis[KEY] = { savedAt: 0, items: {}, sourceFile: null });

function send(res,status,body){res.setHeader('Cache-Control','no-store');return res.status(status).json(body)}
function pad(n){return String(n).padStart(2,'0')}
function fresh(){return cache.savedAt && Date.now()-cache.savedAt<TTL_MS && Object.keys(cache.items).length>0}
function filenames(){
  const now=new Date(), out=[];
  for(let i=15;i<=75;i++){
    const d=new Date(now.getTime()-i*60000);
    out.push(`DETR-posttrade-${d.getUTCFullYear()}-${pad(d.getUTCMonth()+1)}-${pad(d.getUTCDate())}T${pad(d.getUTCHours())}_${pad(d.getUTCMinutes())}.json.gz`)
  }
  return out;
}
async function fetchGz(name){
  const c=new AbortController(), t=setTimeout(()=>c.abort(),4500);
  try{
    const r=await fetch('https://mfs.deutsche-boerse.com/api/download/'+name,{signal:c.signal,cache:'no-store',headers:{'User-Agent':'Depot-Cockpit-TH66/5.3.1'}});
    if(!r.ok)return null;
    const b=Buffer.from(await r.arrayBuffer()); return b.length?b:null;
  }catch{return null}finally{clearTimeout(t)}
}
function flatten(v,out=[]){
  if(Array.isArray(v)){for(const x of v)flatten(x,out);return out}
  if(v&&typeof v==='object'){
    const vals=Object.values(v); if(vals.filter(x=>['string','number','boolean'].includes(typeof x)).length>=2)out.push(v);
    for(const x of vals)if(x&&typeof x==='object')flatten(x,out)
  } return out
}
function map(o){const m={};for(const[k,v]of Object.entries(o||{}))if(['string','number','boolean'].includes(typeof v))m[String(k).toLowerCase().replace(/[^a-z0-9]/g,'')]=v;return m}
function isin(o){
  const m=map(o); for(const k of ['instrumentidentificationcode','isin','isincode','instrumentidentifier']){const v=String(m[k]||'').toUpperCase();if(/^[A-Z]{2}[A-Z0-9]{9}[0-9]$/.test(v))return v}
  for(const v0 of Object.values(m)){const h=String(v0).toUpperCase().match(/\b[A-Z]{2}[A-Z0-9]{9}[0-9]\b/);if(h)return h[0]} return null
}
function num(v){if(typeof v==='number'&&Number.isFinite(v))return v;const n=Number(String(v||'').replace(',','.'));return Number.isFinite(n)?n:null}
function price(o){const m=map(o);for(const k of ['price','tradeprice','transactionprice','executedprice','lastprice','pricemntryvalue','tradedprice']){const n=num(m[k]);if(n>0)return n}for(const[k,v]of Object.entries(m))if(k.includes('price')){const n=num(v);if(n>0)return n}return null}
function mic(o){const m=map(o);for(const k of ['venueofexecution','executionvenue','tradingvenue','mic','marketidentifiercode']){const v=String(m[k]||'').toUpperCase();if(/^[A-Z0-9]{4}$/.test(v))return v}return null}
function ts(o){const m=map(o);for(const k of ['publicationdatetime','publicationtime','tradetime','executiondatetime','transactiondatetime','timestamp']){const v=m[k];if(typeof v==='string'&&Number.isFinite(Date.parse(v)))return new Date(v).toISOString()}return null}
function parse(buf){try{return JSON.parse(gunzipSync(buf).toString('utf8'))}catch{return null}}
function trades(json){
  const out=[]; for(const r of flatten(json,[])){const i=isin(r),p=price(r),m=mic(r);if(!i||!(p>0))continue;if(m&&!['XETR','XETA','XETB','XETS'].includes(m))continue;out.push({isin:i,price:p,mic:m||'XETR',time:ts(r)})} return out
}
async function snapshot(positions){
  const all=[], used=[]; const wanted=new Set(positions.map(p=>String(p.isin||'').toUpperCase()).filter(Boolean));
  const names=filenames();
  for(let i=0;i<names.length && used.length<20;i+=5){
    const batch=names.slice(i,i+5); const got=await Promise.all(batch.map(async n=>({n,b:await fetchGz(n)})));
    for(const x of got){if(!x.b)continue;const j=parse(x.b);if(!j)continue;const t=trades(j);if(!t.length)continue;used.push(x.n);all.push(...t)}
    const found=new Set(all.filter(t=>wanted.has(t.isin)).map(t=>t.isin)); if(found.size===wanted.size)break
  }
  const results=[];
  for(const p of positions){const list=all.filter(t=>t.isin===String(p.isin||'').toUpperCase());if(!list.length)continue;list.sort((a,b)=>Date.parse(b.time||0)-Date.parse(a.time||0));const h=list[0];results.push({id:p.id,ok:true,latest:{price:h.price,date:(h.time||new Date().toISOString()).slice(0,10)},source:'Deutsche Börse / Xetra Delayed Post-Trade',usedVenue:'Xetra',currency:p.currency||'EUR',sourceMeta:{provider:'DB_XETRA_DELAYED',delayedMinutes:15,fallback:false,asOf:h.time,mic:h.mic,officialFile:used[0]||null}})}
  return {results,used}
}
export default async function handler(req,res){
  if(req.method!=='POST')return send(res,405,{ok:false,error:'Nur POST erlaubt.'});
  const positions=Array.isArray(req.body?.positions)?req.body.positions:[]; if(!positions.length)return send(res,400,{ok:false,error:'Keine Positionen übergeben.'});
  if(fresh())return send(res,200,{ok:true,provider:'Deutsche Börse / Xetra Delayed Post-Trade',delayedMinutes:15,generatedAt:new Date(cache.savedAt).toISOString(),fromCache:true,sourceFile:cache.sourceFile,results:positions.map(p=>cache.items[p.id]).filter(Boolean)});
  const s=await snapshot(positions);
  if(s.results.length){cache.savedAt=Date.now();cache.items={...cache.items,...Object.fromEntries(s.results.map(x=>[x.id,x]))};cache.sourceFile=s.used[0]||null}
  return send(res,200,{ok:true,provider:'Deutsche Börse / Xetra Delayed Post-Trade',delayedMinutes:15,generatedAt:new Date().toISOString(),fromCache:false,sourceFile:s.used[0]||null,results:s.results,diagnostics:{filesParsed:s.used.length,requested:positions.length,found:s.results.length},warning:s.results.length?null:'Keine passenden Xetra-Trades in den verfügbaren Delayed-Dateien gefunden.'});
}
