import { gunzipSync } from 'node:zlib';

const TTL_MS=15*60*1000;
const KEY='__TH66_XETRA_DELAYED_CACHE_533__';
const cache=globalThis[KEY]||(globalThis[KEY]={savedAt:0,items:{},sourceFiles:[],diagnostics:{}});
const XETRA_MICS=new Set(['XETR','XETA','XETB','XETS']);
function send(res,status,body){res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','no-store');return res.status(status).json(body)}
function pad(n){return String(n).padStart(2,'0')}
function fileName(d){return `DETR-posttrade-${d.getUTCFullYear()}-${pad(d.getUTCMonth()+1)}-${pad(d.getUTCDate())}T${pad(d.getUTCHours())}_${pad(d.getUTCMinutes())}.json.gz`}
function fresh(){return cache.savedAt&&Date.now()-cache.savedAt<TTL_MS&&Object.keys(cache.items||{}).length>0}
function isWeekend(d){const x=d.getUTCDay();return x===0||x===6}
function previousWeekday(d){const x=new Date(d);do{x.setUTCDate(x.getUTCDate()-1)}while(isWeekend(x));return x}
function searchMinutes(now=new Date()){
  // Root cause 5.3.2: after Xetra close we searched only the last 90 wall-clock minutes,
  // i.e. files after the liquid trading session. Search the actual Xetra session backwards.
  const delayedNow=new Date(now.getTime()-16*60000);
  let day=new Date(delayedNow);
  if(isWeekend(day)) day=previousWeekday(day);
  const y=day.getUTCFullYear(),m=day.getUTCMonth(),dt=day.getUTCDate();
  const open=new Date(Date.UTC(y,m,dt,7,0));
  const close=new Date(Date.UTC(y,m,dt,17,30));
  let end=delayedNow;
  if(end>close)end=close;
  if(end<open){day=previousWeekday(day);end=new Date(Date.UTC(day.getUTCFullYear(),day.getUTCMonth(),day.getUTCDate(),17,30))}
  const start=new Date(Date.UTC(end.getUTCFullYear(),end.getUTCMonth(),end.getUTCDate(),7,0));
  const out=[];
  for(let t=end.getTime();t>=start.getTime();t-=60000)out.push(new Date(t));
  return out;
}
async function fetchGz(name){const c=new AbortController(),t=setTimeout(()=>c.abort(),4500);try{const r=await fetch('https://mfs.deutsche-boerse.com/api/download/'+name,{signal:c.signal,cache:'no-store',headers:{Accept:'application/gzip, application/octet-stream, */*','User-Agent':'Depot-Cockpit-TH66/5.3.3'}});if(!r.ok)return null;const b=Buffer.from(await r.arrayBuffer());return b.length?b:null}catch{return null}finally{clearTimeout(t)}}
function normalizeKey(k){return String(k||'').toLowerCase().replace(/[^a-z0-9]/g,'')}
function parseDocuments(buf){let text;try{text=gunzipSync(buf).toString('utf8').replace(/^\uFEFF/,'').trim()}catch{return []}if(!text)return[];try{const whole=JSON.parse(text);return Array.isArray(whole)?whole:[whole]}catch{}const docs=[];for(const line of text.split(/\r?\n/)){const s=line.trim();if(!s)continue;try{const x=JSON.parse(s);if(Array.isArray(x))docs.push(...x);else docs.push(x)}catch{}}return docs}
function leaves(value,path='',out=[]){if(Array.isArray(value)){value.forEach((v,i)=>leaves(v,`${path}[${i}]`,out));return out}if(value&&typeof value==='object'){for(const[k,v]of Object.entries(value))leaves(v,path?`${path}.${k}`:k,out);return out}out.push({path,key:normalizeKey(path.split('.').at(-1)||''),value});return out}
function numberish(v){if(typeof v==='number'&&Number.isFinite(v))return v;if(typeof v!=='string')return null;const s=v.trim().replace(/\s/g,'').replace(',','.');if(!/^[-+]?\d+(\.\d+)?$/.test(s))return null;const n=Number(s);return Number.isFinite(n)?n:null}
function tokens(p){return [p.isin,p.wkn,p.mnemonic,p.instrumentId,p.securityId].map(v=>String(v||'').trim().toUpperCase()).filter(Boolean)}
function eventMatches(ls,p){const tt=tokens(p);for(const l of ls){const v=String(l.value??'').trim().toUpperCase();for(const t of tt)if(v===t||((t.length>=6)&&v.includes(t)))return true}return false}
function findMic(ls){for(const l of ls){const v=String(l.value||'').toUpperCase();if(XETRA_MICS.has(v))return v}return null}
function findTimestamp(ls){for(const l of ls){if(typeof l.value==='string'&&/20\d\d[-T]/.test(l.value)&&Number.isFinite(Date.parse(l.value)))return new Date(l.value).toISOString()}return null}
function findCurrency(ls){for(const l of ls){const v=String(l.value||'').toUpperCase();if((l.key.includes('currency')||l.key.includes('ccy'))&&/^[A-Z]{3}$/.test(v))return v}return null}
function priceScore(path,key){const p=normalizeKey(path);let s=0;if(['price','tradeprice','transactionprice','executedprice','lastprice','tradedprice','pric'].includes(key))s+=120;if(key.includes('price')||key==='pric')s+=80;if(key.includes('px'))s+=50;if(p.includes('price')||p.includes('pric'))s+=30;if(p.includes('quantity')||p.includes('volume')||p.includes('size')||p.includes('amount'))s-=100;return s}
function findPrice(ls){const c=[];for(const l of ls){const n=numberish(l.value);if(!(n>0&&n<1e7))continue;const score=priceScore(l.path,l.key);if(score>0)c.push({n,score,path:l.path})}c.sort((a,b)=>b.score-a.score);return c[0]||null}
function explode(doc){if(Array.isArray(doc))return doc.flatMap(explode);if(!doc||typeof doc!=='object')return[];const ls=leaves(doc);if(findPrice(ls))return[doc];const c=[];for(const v of Object.values(doc))if(v&&typeof v==='object')c.push(...explode(v));return c.length?c:[doc]}
function extract(docs,positions,hits=new Map()){let eventCount=0,matchedEvents=0;for(const doc of docs)for(const event of explode(doc)){eventCount++;const ls=leaves(event);const p=findPrice(ls);if(!p)continue;const mic=findMic(ls);if(mic&&!XETRA_MICS.has(mic))continue;for(const pos of positions){if(hits.has(pos.id)||!eventMatches(ls,pos))continue;matchedEvents++;hits.set(pos.id,{price:p.n,pricePath:p.path,mic:mic||'XETR',time:findTimestamp(ls),currency:findCurrency(ls)||pos.currency||'EUR'})}}return{hits,eventCount,matchedEvents}}
async function snapshot(positions){const minutes=searchMinutes();const hits=new Map();const used=[];let eventCount=0,matchedEvents=0,attempted=0;
  // newest valid Xetra session minute first; stop as soon as every requested instrument has a last trade
  for(let i=0;i<minutes.length&&hits.size<positions.length;i+=18){const batch=minutes.slice(i,i+18);const got=await Promise.all(batch.map(async d=>{const n=fileName(d);return{n,b:await fetchGz(n)}}));attempted+=got.length;for(const x of got){if(!x.b)continue;const docs=parseDocuments(x.b);if(!docs.length)continue;used.push(x.n);const e=extract(docs,positions,hits);eventCount+=e.eventCount;matchedEvents+=e.matchedEvents} }
  const results=[];for(const p of positions){const h=hits.get(p.id);if(!h)continue;results.push({id:p.id,ok:true,latest:{price:h.price,date:(h.time||new Date().toISOString()).slice(0,10)},source:'Deutsche Börse / Xetra Delayed Post-Trade',usedVenue:'Xetra',currency:h.currency,sourceMeta:{provider:'DB_XETRA_DELAYED',delayedMinutes:15,fallback:false,asOf:h.time,mic:h.mic,officialFile:used[0]||null,matchedBy:'ISIN/WKN/Mnemonic/Instrument-ID',priceField:h.pricePath}})}
  return{results,used,diagnostics:{requested:positions.length,found:results.length,filesAttempted:attempted,filesParsed:used.length,eventCount,matchedEvents,sessionStart:minutes.at(-1)?.toISOString(),sessionEnd:minutes[0]?.toISOString(),missing:positions.filter(p=>!hits.has(p.id)).map(p=>({id:p.id,name:p.name,isin:p.isin}))}}
}
export const __test={searchMinutes,parseDocuments,leaves,eventMatches,findPrice,extract};
export default async function handler(req,res){if(req.method!=='POST')return send(res,405,{ok:false,error:'Nur POST erlaubt.'});const positions=Array.isArray(req.body?.positions)?req.body.positions:[];if(!positions.length)return send(res,400,{ok:false,error:'Keine Positionen übergeben.'});if(fresh()){const results=positions.map(p=>cache.items[p.id]).filter(Boolean);return send(res,200,{ok:true,provider:'Deutsche Börse / Xetra Delayed Post-Trade',delayedMinutes:15,generatedAt:new Date(cache.savedAt).toISOString(),fromCache:true,sourceFiles:cache.sourceFiles,results,diagnostics:{...cache.diagnostics,requested:positions.length,found:results.length}})}const s=await snapshot(positions);if(s.results.length){cache.savedAt=Date.now();cache.items={...cache.items,...Object.fromEntries(s.results.map(x=>[x.id,x]))};cache.sourceFiles=s.used.slice(0,8);cache.diagnostics=s.diagnostics}return send(res,200,{ok:true,provider:'Deutsche Börse / Xetra Delayed Post-Trade',delayedMinutes:15,generatedAt:new Date().toISOString(),fromCache:false,sourceFiles:s.used.slice(0,8),results:s.results,diagnostics:s.diagnostics,warning:s.results.length===positions.length?null:`${positions.length-s.results.length} Instrument(e) hatten im durchsuchten Xetra-Handelstag keinen eindeutig zuordenbaren Post-Trade-Treffer.`})}
