export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='POST')return res.status(405).json({ok:false,error:'Nur POST ist erlaubt.'});
  const token=process.env.EODHD_API_KEY;
  if(!token)return res.status(503).json({ok:false,code:'API_KEY_MISSING',error:'EODHD_API_KEY fehlt.',checkedAt:new Date().toISOString()});
  const symbol=String(req.body?.symbol||'').trim();
  if(!symbol)return res.status(400).json({ok:false,error:'Testsymbol fehlt.',checkedAt:new Date().toISOString()});
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),8000);
  const started=Date.now();
  try{
    const to=new Date().toISOString().slice(0,10);
    const from=new Date(Date.now()-14*86400000).toISOString().slice(0,10);
    const url=new URL(`https://eodhd.com/api/eod/${encodeURIComponent(symbol)}`);
    url.searchParams.set('api_token',token);
    url.searchParams.set('fmt','json');
    url.searchParams.set('period','d');
    url.searchParams.set('from',from);
    url.searchParams.set('to',to);
    const response=await fetch(url,{signal:controller.signal,headers:{Accept:'application/json'}});
    const text=await response.text();
    let parsed=null;
    try{parsed=JSON.parse(text)}catch{}
    const rows=Array.isArray(parsed)?parsed:[];
    return res.status(response.ok?200:502).json({
      ok:response.ok&&rows.length>0,
      symbol,
      venue:req.body?.venue||null,
      upstreamStatus:response.status,
      durationMs:Date.now()-started,
      rowCount:rows.length,
      lastDate:rows.at(-1)?.date||null,
      lastClose:rows.at(-1)?.adjusted_close??rows.at(-1)?.close??null,
      error:response.ok?(rows.length?'': 'EODHD lieferte keine Datensätze.'):`EODHD ${response.status}: ${text.slice(0,220)}`,
      checkedAt:new Date().toISOString()
    });
  }catch(error){
    return res.status(504).json({
      ok:false,symbol,upstreamStatus:null,durationMs:Date.now()-started,
      error:error?.name==='AbortError'?'EODHD antwortete nicht innerhalb von 8 Sekunden.':String(error?.message||error),
      checkedAt:new Date().toISOString()
    });
  }finally{clearTimeout(timeout)}
}
