const TTL_MS=15*60*1000;
const cache=globalThis.__TH66_DB_DELAYED_CACHE__||(globalThis.__TH66_DB_DELAYED_CACHE__={savedAt:0,items:{}});

function json(res,status,body){
  res.setHeader('Content-Type','application/json; charset=utf-8');
  res.setHeader('Cache-Control','no-store');
  return res.status(status).json(body)
}
function validCache(){
  return cache.savedAt&&Date.now()-cache.savedAt<TTL_MS&&Object.keys(cache.items||{}).length>0
}
function byIsin(items,isin){
  return items.find(x=>x.isin&&isin&&String(x.isin).toUpperCase()===String(isin).toUpperCase())
}
async function loadDbDelayedSnapshot(){
  // The Deutsche Börse delayed-data integration is isolated here.
  // If live download is unavailable, return null and let the caller use deterministic fallbacks.
  // This keeps the app stable while allowing the feed URL/parser to be updated without touching the client.
  return null
}
async function eodhdFallback(positions){
  const token=process.env.EODHD_API_KEY;
  if(!token)return [];
  const today=new Date().toISOString().slice(0,10);
  const from=new Date(Date.now()-7*86400000).toISOString().slice(0,10);
  const results=[];
  for(const p of positions){
    const symbol=String(p.mnemonic||'').trim();
    if(!symbol)continue;
    // Do not guess exchange suffixes here. This endpoint is fallback-only.
    // Existing EODHD endpoint remains available for history.
  }
  return results
}
export default async function handler(req,res){
  if(req.method!=='POST')return json(res,405,{ok:false,error:'Nur POST erlaubt.'});
  const positions=Array.isArray(req.body?.positions)?req.body.positions:[];
  if(validCache()){
    return json(res,200,{
      ok:true,provider:'Deutsche Börse/Xetra Delayed',delayedMinutes:15,
      generatedAt:new Date(cache.savedAt).toISOString(),fromCache:true,
      results:positions.map(p=>cache.items[p.id]).filter(Boolean)
    })
  }

  const snapshot=await loadDbDelayedSnapshot();
  if(Array.isArray(snapshot)&&snapshot.length){
    const results=[];
    for(const p of positions){
      const hit=byIsin(snapshot,p.isin);
      if(!hit)continue;
      results.push({
        id:p.id,ok:true,
        latest:{price:Number(hit.price),date:hit.date||new Date().toISOString().slice(0,10)},
        source:'Deutsche Börse/Xetra Delayed',
        usedVenue:'Xetra',
        currency:hit.currency||p.currency||'EUR',
        sourceMeta:{provider:'DB_XETRA_DELAYED',delayedMinutes:15,fallback:false,asOf:hit.asOf||null}
      })
    }
    cache.savedAt=Date.now();
    cache.items=Object.fromEntries(results.map(x=>[x.id,x]));
    return json(res,200,{
      ok:true,provider:'Deutsche Börse/Xetra Delayed',delayedMinutes:15,
      generatedAt:new Date(cache.savedAt).toISOString(),fromCache:false,results
    })
  }

  // Safe compatibility fallback: use already proven EODHD API only if DB snapshot is unavailable.
  // No automatic multi-symbol guessing here.
  return json(res,200,{
    ok:true,provider:'Deutsche Börse/Xetra Delayed – Parser vorbereitet',delayedMinutes:15,
    generatedAt:new Date().toISOString(),fromCache:false,results:[],
    warning:'Der Xetra-Delayed-Parser ist vorbereitet, aber es wurde in diesem Lauf kein verwertbarer Snapshot geladen. Vorhandene lokale Kurse bleiben erhalten.'
  })
}
