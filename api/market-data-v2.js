import { gunzipSync } from 'node:zlib';

const TTL_MS=15*60*1000;
const KEY='__TH66_XETRA_DELAYED_CACHE_532__';
const cache=globalThis[KEY]||(globalThis[KEY]={savedAt:0,items:{},sourceFile:null,diagnostics:{}});
const XETRA_MICS=new Set(['XETR','XETA','XETB','XETS']);

function send(res,status,body){res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','no-store');return res.status(status).json(body)}
function pad(n){return String(n).padStart(2,'0')}
function fresh(){return cache.savedAt&&Date.now()-cache.savedAt<TTL_MS&&Object.keys(cache.items||{}).length>0}
function filenames(now=new Date()){
  const out=[];
  for(let i=15;i<=90;i++){
    const d=new Date(now.getTime()-i*60000);
    out.push(`DETR-posttrade-${d.getUTCFullYear()}-${pad(d.getUTCMonth()+1)}-${pad(d.getUTCDate())}T${pad(d.getUTCHours())}_${pad(d.getUTCMinutes())}.json.gz`)
  }
  return out
}
async function fetchGz(name){
  const c=new AbortController(),t=setTimeout(()=>c.abort(),5000);
  try{
    const r=await fetch('https://mfs.deutsche-boerse.com/api/download/'+name,{signal:c.signal,cache:'no-store',headers:{Accept:'application/gzip, application/octet-stream, */*','User-Agent':'Depot-Cockpit-TH66/5.3.2'}});
    if(!r.ok)return null;
    const b=Buffer.from(await r.arrayBuffer());return b.length?b:null
  }catch{return null}finally{clearTimeout(t)}
}
function normalizeKey(k){return String(k||'').toLowerCase().replace(/[^a-z0-9]/g,'')}
function parseDocuments(buf){
  let text;
  try{text=gunzipSync(buf).toString('utf8').replace(/^\uFEFF/,'').trim()}catch{return []}
  if(!text)return [];
  try{
    const whole=JSON.parse(text);
    return Array.isArray(whole)?whole:[whole]
  }catch{}
  // Deutsche Börse minute bundles can be newline-delimited JSON. Parse every line independently.
  const docs=[];
  for(const line of text.split(/\r?\n/)){
    const s=line.trim();if(!s)continue;
    try{const x=JSON.parse(s);if(Array.isArray(x))docs.push(...x);else docs.push(x)}catch{}
  }
  return docs
}
function leaves(value,path='',out=[]){
  if(Array.isArray(value)){value.forEach((v,i)=>leaves(v,`${path}[${i}]`,out));return out}
  if(value&&typeof value==='object'){for(const[k,v]of Object.entries(value))leaves(v,path?`${path}.${k}`:k,out);return out}
  out.push({path,key:normalizeKey(path.split('.').at(-1)||''),value});return out
}
function numberish(v){
  if(typeof v==='number'&&Number.isFinite(v))return v;
  if(typeof v!=='string')return null;
  const s=v.trim().replace(/\s/g,'').replace(',','.');
  if(!/^[-+]?\d+(\.\d+)?$/.test(s))return null;
  const n=Number(s);return Number.isFinite(n)?n:null
}
function exactTokenSet(position){
  const a=[position.isin,position.wkn,position.mnemonic,position.instrumentId,position.securityId]
    .map(v=>String(v||'').trim().toUpperCase()).filter(Boolean);
  return new Set(a)
}
function eventMatchesPosition(eventLeaves,position){
  const tokens=exactTokenSet(position);if(!tokens.size)return false;
  for(const leaf of eventLeaves){
    const v=String(leaf.value??'').trim().toUpperCase();
    if(tokens.has(v))return true;
    // ISIN can occasionally be embedded in a larger identification field.
    const isin=String(position.isin||'').toUpperCase();
    if(isin&&v.includes(isin))return true
  }
  return false
}
function findMic(ls){
  const preferred=['venueofexecution','executionvenue','tradingvenue','marketidentifiercode','mic','marketmic'];
  for(const p of preferred){const l=ls.find(x=>x.key===p);const v=String(l?.value||'').toUpperCase();if(/^[A-Z0-9]{4}$/.test(v))return v}
  for(const l of ls){const v=String(l.value||'').toUpperCase();if(XETRA_MICS.has(v))return v}
  return null
}
function findTimestamp(ls){
  const hints=['publicationdatetime','publicationtime','tradetime','executiondatetime','transactiondatetime','timestamp','datetime','tradetimestamp'];
  for(const h of hints){
    for(const l of ls.filter(x=>x.key===h||x.key.includes(h))){
      if(typeof l.value==='string'&&Number.isFinite(Date.parse(l.value)))return new Date(l.value).toISOString()
    }
  }
  for(const l of ls){if(typeof l.value==='string'&&/20\d\d[-T]/.test(l.value)&&Number.isFinite(Date.parse(l.value)))return new Date(l.value).toISOString()}
  return null
}
function findCurrency(ls){
  for(const l of ls){const v=String(l.value||'').toUpperCase();if((l.key.includes('currency')||l.key.includes('ccy'))&&/^[A-Z]{3}$/.test(v))return v}
  return null
}
function priceScore(path,key){
  const p=normalizeKey(path);
  let s=0;
  if(['tradeprice','transactionprice','executedprice','lastprice','tradedprice','price'].includes(key))s+=100;
  if(key.includes('price'))s+=70;
  if(key.includes('px'))s+=55;
  if(p.includes('price'))s+=30;
  if(p.includes('mntryvalue')||p.includes('monetaryvalue'))s+=20;
  if(p.includes('quantity')||p.includes('volume')||p.includes('size')||p.includes('amount'))s-=80;
  return s
}
function findPrice(ls){
  const candidates=[];
  for(const l of ls){
    const n=numberish(l.value);if(!(n>0&&n<1e7))continue;
    const score=priceScore(l.path,l.key);if(score>0)candidates.push({n,score,path:l.path})
  }
  candidates.sort((a,b)=>b.score-a.score);
  return candidates[0]||null
}
function explodeEvents(doc){
  // Each NDJSON line/root object is treated as a complete event so nested identifiers and prices remain related.
  if(Array.isArray(doc))return doc.flatMap(explodeEvents);
  if(!doc||typeof doc!=='object')return [];
  const direct=leaves(doc,'',[]);
  // If this root already looks trade-like, keep it intact.
  const hasPrice=direct.some(l=>priceScore(l.path,l.key)>0&&numberish(l.value)>0);
  if(hasPrice)return [doc];
  const children=[];
  for(const v of Object.values(doc))if(v&&typeof v==='object')children.push(...explodeEvents(v));
  return children.length?children:[doc]
}
function extractForPositions(docs,positions){
  const hits=new Map();
  let eventCount=0,matchedEvents=0,priceEvents=0,xetraEvents=0;
  const keySamples=new Set();
  for(const doc of docs){
    for(const event of explodeEvents(doc)){
      eventCount++;
      const ls=leaves(event,'',[]);
      ls.slice(0,30).forEach(l=>keySamples.add(l.path));
      const p=findPrice(ls);if(p)priceEvents++;
      const mic=findMic(ls);if(!mic||XETRA_MICS.has(mic))xetraEvents++;
      for(const position of positions){
        if(!eventMatchesPosition(ls,position))continue;
        matchedEvents++;
        if(!p)continue;
        if(mic&&!XETRA_MICS.has(mic))continue;
        const timestamp=findTimestamp(ls);
        const previous=hits.get(position.id);
        const t=timestamp?Date.parse(timestamp):0,pt=previous?.time?Date.parse(previous.time):0;
        if(!previous||t>=pt)hits.set(position.id,{price:p.n,pricePath:p.path,mic:mic||'XETR',time:timestamp,currency:findCurrency(ls)||position.currency||'EUR'})
      }
    }
  }
  return {hits,diagnostics:{documents:docs.length,eventCount,matchedEvents,priceEvents,xetraEvents,keySamples:[...keySamples].slice(0,24)}}
}
async function snapshot(positions){
  const names=filenames();const used=[];const combinedDocs=[];let diag={documents:0,eventCount:0,matchedEvents:0,priceEvents:0,xetraEvents:0,keySamples:[]};
  for(let i=0;i<names.length&&used.length<28;i+=6){
    const batch=names.slice(i,i+6);
    const got=await Promise.all(batch.map(async n=>({n,b:await fetchGz(n)})));
    for(const x of got){
      if(!x.b)continue;
      const docs=parseDocuments(x.b);if(!docs.length)continue;
      used.push(x.n);combinedDocs.push(...docs)
    }
    if(combinedDocs.length){
      const test=extractForPositions(combinedDocs,positions);
      diag=test.diagnostics;
      if(test.hits.size===positions.length)break
    }
  }
  const extracted=extractForPositions(combinedDocs,positions);diag=extracted.diagnostics;
  const results=[];
  for(const p of positions){
    const h=extracted.hits.get(p.id);if(!h)continue;
    results.push({id:p.id,ok:true,latest:{price:h.price,date:(h.time||new Date().toISOString()).slice(0,10)},source:'Deutsche Börse / Xetra Delayed Post-Trade',usedVenue:'Xetra',currency:h.currency,sourceMeta:{provider:'DB_XETRA_DELAYED',delayedMinutes:15,fallback:false,asOf:h.time,mic:h.mic,officialFile:used[0]||null,matchedBy:'ISIN/WKN/Mnemonic',priceField:h.pricePath}})
  }
  return {results,used,diagnostics:diag}
}
export const __test={parseDocuments,leaves,eventMatchesPosition,findPrice,extractForPositions};
export default async function handler(req,res){
  if(req.method!=='POST')return send(res,405,{ok:false,error:'Nur POST erlaubt.'});
  const positions=Array.isArray(req.body?.positions)?req.body.positions:[];if(!positions.length)return send(res,400,{ok:false,error:'Keine Positionen übergeben.'});
  if(fresh())return send(res,200,{ok:true,provider:'Deutsche Börse / Xetra Delayed Post-Trade',delayedMinutes:15,generatedAt:new Date(cache.savedAt).toISOString(),fromCache:true,sourceFile:cache.sourceFile,results:positions.map(p=>cache.items[p.id]).filter(Boolean),diagnostics:cache.diagnostics});
  const s=await snapshot(positions);
  if(s.results.length){cache.savedAt=Date.now();cache.items={...cache.items,...Object.fromEntries(s.results.map(x=>[x.id,x]))};cache.sourceFile=s.used[0]||null;cache.diagnostics=s.diagnostics}
  return send(res,200,{ok:true,provider:'Deutsche Börse / Xetra Delayed Post-Trade',delayedMinutes:15,generatedAt:new Date().toISOString(),fromCache:false,sourceFile:s.used[0]||null,results:s.results,diagnostics:{...s.diagnostics,filesParsed:s.used.length,requested:positions.length,found:s.results.length},warning:s.results.length?null:'Xetra-Dateien geladen, aber noch kein Depotinstrument eindeutig einem Trade-Event zugeordnet.'});
}
