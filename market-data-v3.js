import { gunzipSync } from 'node:zlib';

const XETRA_MICS = new Set(['XETR','XETA','XETB','XETS']);
const SERVER_TTL_MS = 5 * 60 * 1000;
const CACHE_KEY = '__TH66_MARKET_CORE_V3__';
const cache = globalThis[CACHE_KEY] || (globalThis[CACHE_KEY] = { savedAt:0, items:{}, diagnostics:{} });

function send(res,status,body){
  res.setHeader('Content-Type','application/json; charset=utf-8');
  res.setHeader('Cache-Control','no-store');
  return res.status(status).json(body);
}
function pad(n){ return String(n).padStart(2,'0') }
function isoDay(d){ return d.toISOString().slice(0,10) }
function normalizeKey(k){ return String(k||'').toLowerCase().replace(/[^a-z0-9]/g,'') }
function numberish(v){
  if(typeof v==='number' && Number.isFinite(v)) return v;
  if(typeof v!=='string') return null;
  const s=v.trim().replace(/\s/g,'').replace(',','.');
  if(!/^[-+]?\d+(\.\d+)?$/.test(s)) return null;
  const n=Number(s); return Number.isFinite(n)?n:null;
}
function leaves(value,path='',out=[]){
  if(Array.isArray(value)){ value.forEach((v,i)=>leaves(v,`${path}[${i}]`,out)); return out; }
  if(value && typeof value==='object'){
    for(const [k,v] of Object.entries(value)) leaves(v,path?`${path}.${k}`:k,out);
    return out;
  }
  out.push({path,key:normalizeKey(path.split('.').at(-1)||''),value});
  return out;
}
function parseDocuments(buf){
  let text;
  try{ text=gunzipSync(buf).toString('utf8').replace(/^\uFEFF/,'').trim() }catch{ return [] }
  if(!text) return [];
  try{ const x=JSON.parse(text); return Array.isArray(x)?x:[x] }catch{}
  const docs=[];
  for(const line of text.split(/\r?\n/)){
    const s=line.trim(); if(!s) continue;
    try{ const x=JSON.parse(s); Array.isArray(x)?docs.push(...x):docs.push(x) }catch{}
  }
  return docs;
}
function explode(doc){
  if(Array.isArray(doc)) return doc.flatMap(explode);
  if(!doc || typeof doc!=='object') return [];
  const ls=leaves(doc);
  const hasPriceLike=ls.some(l=>numberish(l.value)>0 && /price|pric|bid|ask|px/i.test(l.path));
  if(hasPriceLike) return [doc];
  const out=[];
  for(const v of Object.values(doc)) if(v && typeof v==='object') out.push(...explode(v));
  return out.length?out:[doc];
}
function tokens(p){
  return [p.isin,p.wkn,p.mnemonic,p.instrumentId,p.securityId]
    .map(v=>String(v||'').trim().toUpperCase()).filter(Boolean);
}
function eventMatches(ls,p){
  const tt=tokens(p);
  for(const l of ls){
    const v=String(l.value??'').trim().toUpperCase();
    for(const t of tt){
      if(v===t) return {matched:true,token:t,path:l.path};
      if(t.length>=6 && v.includes(t)) return {matched:true,token:t,path:l.path};
    }
  }
  return {matched:false};
}
function findMic(ls){
  for(const l of ls){
    const v=String(l.value||'').toUpperCase();
    if(XETRA_MICS.has(v)) return v;
  }
  return null;
}
function findTimestamp(ls){
  for(const l of ls){
    if(typeof l.value==='string' && /20\d\d[-T]/.test(l.value) && Number.isFinite(Date.parse(l.value)))
      return new Date(l.value).toISOString();
  }
  return null;
}
function findCurrency(ls){
  for(const l of ls){
    const v=String(l.value||'').toUpperCase();
    if((l.key.includes('currency')||l.key.includes('ccy')) && /^[A-Z]{3}$/.test(v)) return v;
  }
  return null;
}
function postPrice(ls){
  const c=[];
  for(const l of ls){
    const n=numberish(l.value); if(!(n>0 && n<1e7)) continue;
    const p=normalizeKey(l.path), k=l.key;
    let s=0;
    if(['price','tradeprice','transactionprice','executedprice','lastprice','tradedprice','pric'].includes(k)) s+=140;
    if(k.includes('price')||k==='pric') s+=80;
    if(k.includes('px')) s+=40;
    if(p.includes('quantity')||p.includes('volume')||p.includes('size')||p.includes('amount')) s-=120;
    if(p.includes('bid')||p.includes('ask')) s-=40;
    if(s>0) c.push({n,score:s,path:l.path});
  }
  c.sort((a,b)=>b.score-a.score);
  return c[0]||null;
}
function preQuote(ls){
  const bids=[], asks=[];
  for(const l of ls){
    const n=numberish(l.value); if(!(n>0 && n<1e7)) continue;
    const p=normalizeKey(l.path);
    const isQty=/quantity|volume|size|amount|qty/.test(p);
    if(isQty) continue;
    if(/bid/.test(p) && /price|pric|px|bid/.test(p)) bids.push({n,path:l.path});
    if(/ask|offer/.test(p) && /price|pric|px|ask|offer/.test(p)) asks.push({n,path:l.path});
  }
  const bid=bids.map(x=>x.n).filter(Number.isFinite).sort((a,b)=>b-a)[0] ?? null;
  const ask=asks.map(x=>x.n).filter(Number.isFinite).sort((a,b)=>a-b)[0] ?? null;
  if(Number.isFinite(bid) && Number.isFinite(ask) && ask>=bid)
    return {price:(bid+ask)/2,bid,ask,path:`${bids[0]?.path||'bid'} | ${asks[0]?.path||'ask'}`};
  if(Number.isFinite(bid)) return {price:bid,bid,ask:null,path:bids[0]?.path||'bid'};
  if(Number.isFinite(ask)) return {price:ask,bid:null,ask,path:asks[0]?.path||'ask'};
  return null;
}

function berlinParts(date){
  const f=new Intl.DateTimeFormat('en-CA',{
    timeZone:'Europe/Berlin',year:'numeric',month:'2-digit',day:'2-digit',
    hour:'2-digit',minute:'2-digit',hourCycle:'h23',weekday:'short'
  });
  const o={};
  for(const p of f.formatToParts(date)) if(p.type!=='literal') o[p.type]=p.value;
  return {year:+o.year,month:+o.month,day:+o.day,hour:+o.hour,minute:+o.minute,weekday:o.weekday};
}
function isWeekendBerlin(date){
  const w=berlinParts(date).weekday;
  return w==='Sat'||w==='Sun';
}
function insideRetailSession(date){
  const p=berlinParts(date);
  const minutes=p.hour*60+p.minute;
  return minutes>=8*60 && minutes<=22*60;
}
function searchMinutes(now=new Date(),limit=90){
  // Deutsche Börse timestamps/file names are UTC. Trading-session decisions are Europe/Berlin.
  let t=new Date(now.getTime()-16*60000);
  const out=[];
  let guard=0;
  while(out.length<limit && guard<36*60){
    if(!isWeekendBerlin(t) && insideRetailSession(t)) out.push(new Date(t));
    t=new Date(t.getTime()-60000);
    guard++;
  }
  return out;
}
function fileName(kind,d){
  return `DETR-${kind}-${d.getUTCFullYear()}-${pad(d.getUTCMonth()+1)}-${pad(d.getUTCDate())}T${pad(d.getUTCHours())}_${pad(d.getUTCMinutes())}.json.gz`;
}
async function fetchGz(kind,d){
  const name=fileName(kind,d);
  const c=new AbortController(), timer=setTimeout(()=>c.abort(),3500);
  try{
    const r=await fetch(`https://mfs.deutsche-boerse.com/api/download/${name}`,{
      signal:c.signal,cache:'no-store',
      headers:{Accept:'application/gzip, application/octet-stream, */*','User-Agent':'Depot-Cockpit-TH66/5.9.0'}
    });
    if(!r.ok) return {name,buf:null,status:r.status};
    const b=Buffer.from(await r.arrayBuffer());
    return {name,buf:b.length?b:null,status:r.status};
  }catch(e){
    return {name,buf:null,status:0,error:e?.name||'fetch_error'};
  }finally{ clearTimeout(timer) }
}

function scanDocs(docs,positions,kind,hits,diag,file){
  for(const doc of docs) for(const event of explode(doc)){
    const ls=leaves(event);
    const mic=findMic(ls);
    if(mic && !XETRA_MICS.has(mic)) continue;
    for(const p of positions){
      if(hits.has(p.id)) continue;
      const m=eventMatches(ls,p);
      if(!m.matched) continue;
      const price = kind==='posttrade' ? postPrice(ls) : preQuote(ls);
      if(!price) {
        diag[p.id].matchedWithoutPrice++;
        continue;
      }
      const time=findTimestamp(ls);
      hits.set(p.id,{
        id:p.id,ok:true,
        latest:{price:price.n??price.price,date:(time||new Date().toISOString()).slice(0,10)},
        source:kind==='posttrade'?'Deutsche Börse / Xetra Delayed Post-Trade':'Deutsche Börse / Xetra Delayed Pre-Trade',
        usedVenue:'Xetra',currency:findCurrency(ls)||p.currency||'EUR',
        sourceMeta:{
          provider:kind==='posttrade'?'DB_XETRA_POSTTRADE':'DB_XETRA_PRETRADE',
          sourceKind:kind==='posttrade'?'Xetra letzter Handel':'Xetra Bid/Ask',
          delayedMinutes:15,asOf:time,mic:mic||'XETR',
          officialFile:file,matchedBy:m.token,matchedPath:m.path,
          priceField:price.path||null,bid:price.bid??null,ask:price.ask??null
        }
      });
      diag[p.id].status='FOUND';
      diag[p.id].source=kind==='posttrade'?'Xetra Post-Trade':'Xetra Pre-Trade';
      diag[p.id].matchedBy=m.token;
      diag[p.id].file=file;
    }
  }
}

async function scanDeutscheBoerse(positions){
  const hits=new Map();
  const diag=Object.fromEntries(positions.map(p=>[p.id,{
    id:p.id,name:p.name,isin:p.isin,mnemonic:p.mnemonic,status:'NOT_FOUND',
    source:null,matchedBy:null,file:null,matchedWithoutPrice:0
  }]));

  const minutes=searchMinutes(new Date(),90);
  let filesAttempted=0,filesParsed=0;

  // First: real trades. 30 newest minutes are enough for liquid titles.
  const postMinutes=minutes.slice(0,30);
  for(let i=0;i<postMinutes.length && hits.size<positions.length;i+=12){
    const batch=await Promise.all(postMinutes.slice(i,i+12).map(d=>fetchGz('posttrade',d)));
    filesAttempted+=batch.length;
    for(const x of batch){
      if(!x.buf) continue;
      const docs=parseDocuments(x.buf); if(!docs.length) continue;
      filesParsed++;
      scanDocs(docs,positions,'posttrade',hits,diag,x.name);
    }
  }

  // Second: pre-trade only for remaining titles. A current quote is better than "kein Kurs".
  const remaining=positions.filter(p=>!hits.has(p.id));
  if(remaining.length){
    const preMinutes=minutes.slice(0,12);
    for(let i=0;i<preMinutes.length && remaining.some(p=>!hits.has(p.id));i+=6){
      const batch=await Promise.all(preMinutes.slice(i,i+6).map(d=>fetchGz('pretrade',d)));
      filesAttempted+=batch.length;
      for(const x of batch){
        if(!x.buf) continue;
        const docs=parseDocuments(x.buf); if(!docs.length) continue;
        filesParsed++;
        scanDocs(docs,remaining,'pretrade',hits,diag,x.name);
      }
    }
  }

  return {hits,diag,diagnostics:{
    dbRequested:positions.length,dbFound:hits.size,filesAttempted,filesParsed,
    searchStart:minutes.at(-1)?.toISOString()||null,searchEnd:minutes[0]?.toISOString()||null
  }};
}

function normalizeRows(raw){
  if(!Array.isArray(raw)) return [];
  return raw.map(r=>({date:String(r.date||''),close:Number(r.adjusted_close??r.close)}))
    .filter(r=>/^\d{4}-\d{2}-\d{2}$/.test(r.date)&&Number.isFinite(r.close)&&r.close>0)
    .sort((a,b)=>a.date.localeCompare(b.date));
}
async function eodhdSeries(symbol,token){
  const to=new Date(), from=new Date(to.getTime()-45*86400000);
  const u=new URL(`https://eodhd.com/api/eod/${encodeURIComponent(symbol)}`);
  u.searchParams.set('api_token',token);u.searchParams.set('fmt','json');
  u.searchParams.set('period','d');u.searchParams.set('order','a');
  u.searchParams.set('from',isoDay(from));u.searchParams.set('to',isoDay(to));
  const r=await fetch(u,{headers:{Accept:'application/json'}});
  const text=await r.text();
  if(!r.ok) throw new Error(`EODHD ${r.status}`);
  let x; try{x=JSON.parse(text)}catch{throw new Error('EODHD JSON')}
  if(x?.error) throw new Error(String(x.error));
  return normalizeRows(x);
}
async function eodhdFallback(p,token){
  if(!token) return null;
  for(const c of (p.candidates||[]).slice(0,3)){
    try{
      const rows=await eodhdSeries(c.symbol,token);
      const last=rows.at(-1);
      if(last) return {
        id:p.id,ok:true,latest:{price:last.close,date:last.date},
        source:`EODHD Fallback · ${c.venue}`,usedVenue:c.venue,currency:p.currency||'EUR',
        sourceMeta:{provider:'EODHD_FALLBACK',sourceKind:'EODHD letzter Schlusskurs',fallback:true,symbol:c.symbol}
      };
    }catch(e){
      if(/402|limit|rate/i.test(e?.message||'')) break;
    }
  }
  return null;
}

async function yahooChart(symbol){
  const u=`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=5d&interval=1d&includePrePost=false`;
  const r=await fetch(u,{headers:{Accept:'application/json','User-Agent':'Mozilla/5.0 DepotCockpit/5.9.0'}});
  const text=await r.text();
  if(!r.ok) throw new Error(`Yahoo ${r.status}`);
  const x=JSON.parse(text), rr=x?.chart?.result?.[0];
  if(!rr) throw new Error('Yahoo no result');
  const closes=rr?.indicators?.quote?.[0]?.close||[], ts=rr?.timestamp||[];
  for(let i=closes.length-1;i>=0;i--){
    const n=Number(closes[i]);
    if(Number.isFinite(n)&&n>0)
      return {price:n,asOf:new Date((ts[i]||Math.floor(Date.now()/1000))*1000).toISOString()};
  }
  throw new Error('Yahoo no price');
}
async function cryptoResult(p){
  const symbol=String(p.analysisSymbol||p.marketSymbol||'ETH-EUR').trim()||'ETH-EUR';

  // 5.10.4: Kraken is the primary ETH/EUR source. The public ticker endpoint
  // needs no API key and returns the last traded price in EUR directly.
  try{
    const pair=symbol.toUpperCase()==='ETH-EUR'?'ETHEUR':symbol.toUpperCase().replace('-','');
    const u=`https://api.kraken.com/0/public/Ticker?pair=${encodeURIComponent(pair)}`;
    const r=await fetch(u,{headers:{Accept:'application/json','User-Agent':'DepotCockpit/5.10.4'}});
    const text=await r.text();
    if(r.ok){
      const x=JSON.parse(text);
      if(Array.isArray(x?.error) && x.error.length===0){
        const first=Object.values(x?.result||{})[0];
        const price=Number(first?.c?.[0]);
        if(price>0){
          const iso=new Date().toISOString();
          return {
            id:p.id,ok:true,latest:{price:Number(price.toFixed(6)),date:iso.slice(0,10)},
            source:'ETH/EUR · Kraken',usedVenue:'Crypto',currency:'EUR',
            sourceMeta:{provider:'KRAKEN_PUBLIC',sourceKind:'ETH/EUR letzter Trade · 24/7',delayedMinutes:0,asOf:iso,symbol:'ETHEUR'}
          };
        }
      }
    }
  }catch{}

  // Coinbase and Yahoo remain fallbacks only; both were unreliable from the deployed Vercel runtime.
  try{
    const product=symbol.toUpperCase()==='ETH-EUR'?'ETH-EUR':symbol.toUpperCase();
    const u=`https://api.exchange.coinbase.com/products/${encodeURIComponent(product)}/ticker`;
    const r=await fetch(u,{headers:{Accept:'application/json','User-Agent':'DepotCockpit/5.10.4'}});
    const text=await r.text();
    if(r.ok){
      const x=JSON.parse(text), price=Number(x?.price);
      if(price>0){
        const iso=x?.time && !Number.isNaN(new Date(x.time).getTime()) ? new Date(x.time).toISOString() : new Date().toISOString();
        return {
          id:p.id,ok:true,latest:{price:Number(price.toFixed(6)),date:iso.slice(0,10)},
          source:`${product} · Coinbase Exchange`,usedVenue:'Crypto',currency:'EUR',
          sourceMeta:{provider:'COINBASE_EXCHANGE',sourceKind:`${product} letzter Trade`,delayedMinutes:0,asOf:iso,symbol:product}
        };
      }
    }
  }catch{}

  try{
    const pair=symbol.toUpperCase()==='ETH-EUR'?'ETH-EUR':symbol.toUpperCase();
    const u=`https://api.coinbase.com/v2/prices/${encodeURIComponent(pair)}/spot`;
    const r=await fetch(u,{headers:{Accept:'application/json','User-Agent':'DepotCockpit/5.10.4'}});
    const text=await r.text();
    if(r.ok){
      const x=JSON.parse(text), price=Number(x?.data?.amount);
      if(price>0){
        const iso=new Date().toISOString();
        return {
          id:p.id,ok:true,latest:{price:Number(price.toFixed(6)),date:iso.slice(0,10)},
          source:`${pair} · Coinbase Spot`,usedVenue:'Crypto',currency:'EUR',
          sourceMeta:{provider:'COINBASE_SPOT',sourceKind:`${pair} Spotpreis`,delayedMinutes:0,asOf:iso,symbol:pair}
        };
      }
    }
  }catch{}

  try{
    const u=`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1d&interval=5m&includePrePost=true`;
    const r=await fetch(u,{headers:{Accept:'application/json','User-Agent':'Mozilla/5.0 DepotCockpit/5.10.4'}});
    const text=await r.text(); if(!r.ok) throw new Error(`Yahoo ${r.status}`);
    const x=JSON.parse(text), rr=x?.chart?.result?.[0]; if(!rr) throw new Error('Yahoo no result');
    let price=Number(rr?.meta?.regularMarketPrice), asOf=Number(rr?.meta?.regularMarketTime);
    if(!(price>0)){
      const closes=rr?.indicators?.quote?.[0]?.close||[], ts=rr?.timestamp||[];
      for(let i=closes.length-1;i>=0;i--){const n=Number(closes[i]);if(n>0){price=n;asOf=Number(ts[i]);break;}}
    }
    if(!(price>0)) return null;
    const iso=new Date((asOf||Math.floor(Date.now()/1000))*1000).toISOString();
    return {
      id:p.id,ok:true,latest:{price:Number(price.toFixed(6)),date:iso.slice(0,10)},
      source:`${symbol} · Yahoo Fallback`,usedVenue:'Crypto',currency:'EUR',
      sourceMeta:{provider:'YAHOO_CRYPTO_FALLBACK',sourceKind:`${symbol} 24/7`,delayedMinutes:5,asOf:iso,symbol}
    };
  }catch{return null}
}

async function trilogyResult(p){
  try{
    const [tmq,fx]=await Promise.all([yahooChart('TMQ'),yahooChart('EURUSD=X')]);
    const eur=tmq.price/fx.price;
    if(!(eur>0)) return null;
    return {
      id:p.id,ok:true,latest:{price:Number(eur.toFixed(6)),date:tmq.asOf.slice(0,10)},
      source:'TMQ (NYSE American) · EUR/USD umgerechnet',usedVenue:'NYSE American',currency:'EUR',
      sourceMeta:{provider:'YAHOO_TMQ',sourceKind:'TMQ Schlusskurs in EUR',priceUsd:tmq.price,eurUsd:fx.price,asOf:tmq.asOf}
    };
  }catch{return null}
}

function cacheCompleteFor(ids){
  if(!(cache.savedAt && Date.now()-cache.savedAt<SERVER_TTL_MS)) return false;
  return ids.every(id=>cache.items[id]?.ok && Number.isFinite(Number(cache.items[id]?.latest?.price)));
}

export default async function handler(req,res){
  if(req.method!=='POST') return send(res,405,{ok:false,error:'Nur POST erlaubt.'});
  const positions=Array.isArray(req.body?.positions)?req.body.positions:[];
  if(!positions.length) return send(res,400,{ok:false,error:'Keine Positionen übergeben.'});
  if(positions.length>20) return send(res,400,{ok:false,error:'Zu viele Positionen.'});

  const ids=positions.map(p=>p.id);
  if(cacheCompleteFor(ids)){
    const results=ids.map(id=>cache.items[id]).filter(Boolean);
    return send(res,200,{
      ok:true,version:'5.9.0',generatedAt:new Date(cache.savedAt).toISOString(),
      fromCache:true,complete:true,results,
      positionDiagnostics:positions.map(p=>({
        id:p.id,name:p.name,status:'FOUND',statusLabel:'Cache · gültiger Kurs',source:cache.items[p.id]?.source||''
      })),
      diagnostics:{...cache.diagnostics,cacheHit:true}
    });
  }

  const cryptoPositions=positions.filter(p=>p.dataSource==='CRYPTO_YAHOO');
  const dbPositions=positions.filter(p=>p.id!=='trilogy' && p.dataSource!=='MANUAL' && p.dataSource!=='CRYPTO_YAHOO');
  const trilogy=positions.find(p=>p.id==='trilogy');
  const db=await scanDeutscheBoerse(dbPositions);
  const resultMap=new Map([...db.hits.entries()]);
  const positionDiagnostics=Object.values(db.diag);

  // EODHD only for unresolved German positions.
  const token=process.env.EODHD_API_KEY || '';
  let eodhdRequests=0,eodhdFound=0;
  for(const p of dbPositions.filter(p=>!resultMap.has(p.id))){
    eodhdRequests++;
    const x=await eodhdFallback(p,token);
    if(x){
      resultMap.set(p.id,x);eodhdFound++;
      const d=positionDiagnostics.find(z=>z.id===p.id);
      if(d){d.status='FOUND';d.statusLabel='EODHD-Fallback';d.source=x.source}
    }
  }

  for(const p of cryptoPositions){
    const c=await cryptoResult(p);
    if(c){
      resultMap.set(p.id,c);
      positionDiagnostics.push({id:p.id,name:p.name,status:'FOUND',statusLabel:'Krypto 24/7 in EUR',source:c.source});
    }else{
      positionDiagnostics.push({id:p.id,name:p.name,status:'NOT_FOUND',statusLabel:'Krypto-Kurs nicht geliefert',source:null});
    }
  }

  if(trilogy){
    const t=await trilogyResult(trilogy);
    if(t){
      resultMap.set('trilogy',t);
      positionDiagnostics.push({id:'trilogy',name:trilogy.name,status:'FOUND',statusLabel:'TMQ in EUR',source:t.source});
    }else{
      positionDiagnostics.push({id:'trilogy',name:trilogy.name,status:'NOT_FOUND',statusLabel:'TMQ nicht geliefert',source:null});
    }
  }

  for(const d of positionDiagnostics){
    if(!d.statusLabel){
      d.statusLabel=d.status==='FOUND'?d.source||'gefunden':'Keine Quelle lieferte einen verwertbaren Kurs';
    }
  }

  const results=[...resultMap.values()];
  cache.savedAt=Date.now();
  cache.items=Object.fromEntries(results.map(x=>[x.id,x]));
  cache.diagnostics={...db.diagnostics,eodhdRequests,eodhdFound,trilogyFound:resultMap.has('trilogy'),cryptoRequested:cryptoPositions.length,cryptoFound:cryptoPositions.filter(p=>resultMap.has(p.id)).length};

  return send(res,200,{
    ok:true,version:'5.9.0',generatedAt:new Date().toISOString(),
    fromCache:false,complete:ids.every(id=>resultMap.has(id)),
    results,positionDiagnostics,
    diagnostics:cache.diagnostics,
    warning:ids.every(id=>resultMap.has(id))?null:`${ids.filter(id=>!resultMap.has(id)).length} Position(en) ohne neuen verwertbaren Kurs.`
  });
}

export const __test={berlinParts,insideRetailSession,searchMinutes,parseDocuments,eventMatches,postPrice,preQuote};
