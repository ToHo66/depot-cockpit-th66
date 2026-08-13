
function send(res,status,body){
  res.setHeader('Content-Type','application/json; charset=utf-8');
  res.setHeader('Cache-Control','no-store');
  return res.status(status).json(body);
}
function venueFromExchange(ex){
  const x=String(ex||'').toUpperCase();
  if(['US','NYSE','NASDAQ','NYSE MKT','AMEX'].includes(x)) return 'US';
  if(['XETRA','XETR','XET'].includes(x)) return 'Xetra';
  if(x==='F') return 'Frankfurt';
  if(x==='STU') return 'Stuttgart';
  if(x==='PA') return 'Euronext Paris';
  if(x==='AS') return 'Euronext Amsterdam';
  return x||'Unbekannt';
}
function mapSearch(r){
  return {
    name:r.Name||r.name||'Unbenanntes Wertpapier',
    isin:r.ISIN||r.Isin||r.isin||'',
    wkn:'',
    mnemonic:r.Code||r.code||r.symbol||'',
    code:r.Code||r.code||r.symbol||'',
    type:r.Type||r.type||'Wertpapier',
    currency:r.Currency||r.currency||'EUR',
    venue:venueFromExchange(r.Exchange||r.exchange||r.exchangeCode),
    exchange:r.Exchange||r.exchange||r.exchangeCode||'',
    exchangeCode:r.Exchange||r.exchange||r.exchangeCode||'',
    previousClose:Number.isFinite(Number(r.previousClose))?Number(r.previousClose):null,
    previousCloseDate:r.previousCloseDate||null,
    isPrimary:Boolean(r.isPrimary),
    source:'EODHD_SEARCH'
  };
}
function dedupe(items){
  const seen=new Set(), out=[];
  for(const x of items){
    const k=[x.isin,x.mnemonic,x.exchangeCode].join('|').toUpperCase();
    if(!x.mnemonic || seen.has(k)) continue;
    seen.add(k); out.push(x);
  }
  return out;
}
async function getJson(url,ms=8500){
  const ctrl=new AbortController(), timer=setTimeout(()=>ctrl.abort(),ms);
  try{
    const r=await fetch(url,{signal:ctrl.signal,headers:{Accept:'application/json'}});
    const text=await r.text();
    if(!r.ok) throw new Error(`HTTP ${r.status}`);
    let x; try{x=JSON.parse(text)}catch{throw new Error('Ungültige JSON-Antwort')}
    return x;
  } finally { clearTimeout(timer) }
}
export default async function handler(req,res){
  if(req.method!=='GET') return send(res,405,{ok:false,error:'Nur GET erlaubt.'});
  const q=String(req.query?.q||'').trim();
  if(q.length<2) return send(res,400,{ok:false,error:'Suchbegriff zu kurz.'});
  const token=process.env.EODHD_API_KEY;
  if(!token) return send(res,503,{ok:false,error:'EODHD_API_KEY fehlt.'});

  const isIsin=/^[A-Z]{2}[A-Z0-9]{9}\d$/i.test(q);
  const found=[];
  const errors=[];

  // Exact identifier mapping is more reliable for ISINs than fuzzy search.
  if(isIsin){
    try{
      const u=new URL('https://eodhd.com/api/id-mapping');
      u.searchParams.set('filter[isin]',q.toUpperCase());
      u.searchParams.set('page[limit]','20');
      u.searchParams.set('api_token',token);
      u.searchParams.set('fmt','json');
      const x=await getJson(u);
      const rows=Array.isArray(x?.data)?x.data:(Array.isArray(x)?x:[]);
      for(const r of rows){
        const symbol=String(r.symbol||r.Symbol||'');
        const [code,exchange=''] = symbol.includes('.') ? symbol.split(/\.(?=[^.]+$)/) : [symbol,''];
        found.push(mapSearch({
          Name:r.name||r.Name||r.securityName||q,
          ISIN:q.toUpperCase(),
          Code:code,
          Exchange:exchange || r.exchange || r.exchangeCode,
          Type:r.type||r.securityType,
          Currency:r.currency
        }));
      }
    }catch(e){ errors.push(`ID-Mapping: ${e.message}`) }
  }

  // Fallback / general name-symbol search.
  try{
    const u=new URL(`https://eodhd.com/api/search/${encodeURIComponent(q)}`);
    u.searchParams.set('api_token',token);
    u.searchParams.set('fmt','json');
    u.searchParams.set('limit','20');
    u.searchParams.set('type','all');
    const x=await getJson(u);
    const rows=Array.isArray(x)?x:(x?[x]:[]);
    for(const r of rows) found.push(mapSearch(r));
  }catch(e){ errors.push(`Search: ${e.message}`) }

  const results=dedupe(found).slice(0,20);
  return send(res,200,{
    ok:true,query:q,results,
    provider:'EODHD ID Mapping + Search',
    noMatch:results.length===0,
    diagnostics:errors
  });
}
