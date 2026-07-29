const DAY=86400000;
function json(res,status,body){res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','no-store');res.status(status).json(body)}
function isoDate(d){return new Date(d).toISOString().slice(0,10)}
function subCalendarMonths(date,months){const d=new Date(date),day=d.getUTCDate();d.setUTCDate(1);d.setUTCMonth(d.getUTCMonth()-months);const last=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,0)).getUTCDate();d.setUTCDate(Math.min(day,last));return d}
function latestOnOrBefore(rows,targetDate){const target=isoDate(targetDate);for(let i=rows.length-1;i>=0;i--)if(rows[i].date<=target)return rows[i];return null}
function pct(current,base){return Number.isFinite(current)&&Number.isFinite(base)&&base!==0?((current/base)-1)*100:null}
function normalizeRows(raw){if(!Array.isArray(raw))return[];return raw.map(r=>({date:String(r.date||''),open:Number(r.open),high:Number(r.high),low:Number(r.low),close:Number(r.adjusted_close??r.close),volume:Number(r.volume||0)})).filter(r=>/^\d{4}-\d{2}-\d{2}$/.test(r.date)&&Number.isFinite(r.close)&&r.close>0).sort((a,b)=>a.date.localeCompare(b.date))}
function publicEndpoint(symbol,from,to){return `https://eodhd.com/api/eod/${encodeURIComponent(symbol)}?api_token=***&fmt=json&period=d&order=a&from=${from}&to=${to}`}
function deploymentInfo(){return {deploymentId:process.env.VERCEL_DEPLOYMENT_ID||process.env.VERCEL_GIT_COMMIT_SHA||null,deploymentUrl:process.env.VERCEL_URL||null,environment:process.env.VERCEL_ENV||null,region:process.env.VERCEL_REGION||null}}
async function fetchHistory(symbol,token,from,to){
  const url=new URL(`https://eodhd.com/api/eod/${encodeURIComponent(symbol)}`);
  url.searchParams.set('api_token',token);url.searchParams.set('fmt','json');url.searchParams.set('period','d');url.searchParams.set('order','a');url.searchParams.set('from',from);url.searchParams.set('to',to);
  const started=Date.now();let response,text='';
  try{
    response=await fetch(url,{headers:{Accept:'application/json'}});text=await response.text();
    const attempt={symbol,endpoint:publicEndpoint(symbol,from,to),provider:'EODHD',httpStatus:response.status,responseTimeMs:Date.now()-started,ok:response.ok,responsePreview:text.slice(0,300)};
    if(!response.ok)return {ok:false,attempt,error:`EODHD ${response.status}: ${text.slice(0,180)}`};
    let parsed;try{parsed=JSON.parse(text)}catch{return {ok:false,attempt:{...attempt,ok:false},error:'EODHD lieferte kein gültiges JSON'}}
    if(parsed?.error)return {ok:false,attempt:{...attempt,ok:false},error:String(parsed.error)};
    const rows=normalizeRows(parsed);if(rows.length<2)return {ok:false,attempt:{...attempt,ok:false},error:'Zu wenige historische Datenpunkte.'};
    return {ok:true,attempt,rows};
  }catch(error){return {ok:false,attempt:{symbol,endpoint:publicEndpoint(symbol,from,to),provider:'EODHD',httpStatus:null,responseTimeMs:Date.now()-started,ok:false,responsePreview:null},error:error?.message||'Netzwerkfehler'}}
}
export default async function handler(req,res){
  const startedAt=new Date();const requestId=`md-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,7)}`;const token=process.env.EODHD_API_KEY;
  const baseDiagnostics={requestId,appVersion:'GOLDEN MASTER 5.1',apiKeyPresent:Boolean(token),provider:'EODHD',sourceLayer:'Vercel Serverless Function /api/market-data',startedAt:startedAt.toISOString(),...deploymentInfo()};
  if(req.method!=='POST')return json(res,405,{ok:false,error:'Nur POST ist erlaubt.',diagnostics:{...baseDiagnostics,finishedAt:new Date().toISOString(),requestCount:0,successfulRequests:0,failedRequests:0}});
  if(!token)return json(res,503,{ok:false,code:'API_KEY_MISSING',error:'EODHD_API_KEY ist in Vercel noch nicht hinterlegt.',diagnostics:{...baseDiagnostics,finishedAt:new Date().toISOString(),requestCount:0,successfulRequests:0,failedRequests:0}});
  const positions=Array.isArray(req.body?.positions)?req.body.positions:[];
  if(positions.length>40)return json(res,400,{ok:false,error:'Zu viele Positionen.',diagnostics:{...baseDiagnostics,finishedAt:new Date().toISOString(),requestCount:0,successfulRequests:0,failedRequests:0}});
  const today=new Date(),from=isoDate(new Date(today.getTime()-400*DAY)),to=isoDate(today),results=[];let requestCount=0,successfulRequests=0,failedRequests=0,lastSuccessfulAt=null;
  for(const p of positions){
    const candidates=Array.isArray(p.candidates)?p.candidates.filter(x=>x&&String(x.symbol||'').trim()):[];
    if(!candidates.length){results.push({id:p.id,ok:false,error:'Kein unterstützter EODHD-Handelsplatz oder Symbol hinterlegt.',attempts:[]});continue}
    let rows=null,used=null,lastError=null;const attempts=[];
    for(const candidate of candidates){
      requestCount++;const fetched=await fetchHistory(String(candidate.symbol).trim(),token,from,to);attempts.push({...fetched.attempt,venue:String(candidate.venue||'Unbekannt')});
      if(fetched.ok){successfulRequests++;lastSuccessfulAt=new Date().toISOString();rows=fetched.rows;used={venue:String(candidate.venue||'Unbekannt'),symbol:String(candidate.symbol).trim()};break}
      failedRequests++;lastError=fetched.error;
    }
    if(!rows||!used){results.push({id:p.id,ok:false,error:lastError||'Keine Kursreihe der Handelsplatz-Priorität war verfügbar.',attempted:candidates,attempts});continue}
    try{
      const symbol=used.symbol,last=rows.at(-1),previous=rows.at(-2),lastDate=new Date(`${last.date}T12:00:00Z`),weekBase=latestOnOrBefore(rows,new Date(lastDate.getTime()-7*DAY)),monthBase=latestOnOrBefore(rows,subCalendarMonths(lastDate,1)),threeMonthBase=latestOnOrBefore(rows,subCalendarMonths(lastDate,3)),yearBase=latestOnOrBefore(rows,subCalendarMonths(lastDate,12));
      results.push({id:p.id,ok:true,symbol,usedVenue:used.venue,requestedVenue:p.analysisVenue||p.brokerVenue||null,attempted:candidates,attempts,venueWarning:(p.analysisVenue&&p.analysisVenue!==used.venue)?`Feste Analysebörse ${p.analysisVenue} lieferte keine Reihe; transparenter Ersatz: ${used.venue}. Die Broker-Anzeigequelle beeinflusst die Analyse nicht.`:'Feste Analysebörse wurde verwendet. Die Broker-Anzeigequelle beeinflusst die Analyse nicht.',currency:p.currency||'EUR',source:`EODHD EOD · ${used.venue} · durchgehend dieselbe Kursreihe`,latest:{date:last.date,price:last.close},performance:{day:{pct:pct(last.close,previous.close),baseDate:previous.date,basePrice:previous.close},week:{pct:pct(last.close,weekBase?.close),baseDate:weekBase?.date||null,basePrice:weekBase?.close||null},month:{pct:pct(last.close,monthBase?.close),baseDate:monthBase?.date||null,basePrice:monthBase?.close||null},threeMonths:{pct:pct(last.close,threeMonthBase?.close),baseDate:threeMonthBase?.date||null,basePrice:threeMonthBase?.close||null},year:{pct:pct(last.close,yearBase?.close),baseDate:yearBase?.date||null,basePrice:yearBase?.close||null}},chart:rows.slice(-260).map(r=>({date:r.date,close:r.close}))})
    }catch(error){results.push({id:p.id,ok:false,symbol:used?.symbol||null,error:error.message||'Unbekannter Datenfehler',attempts})}
  }
  const finishedAt=new Date();
  return json(res,200,{ok:true,version:'5.1',generatedAt:finishedAt.toISOString(),method:'Diagnose-Release 5.1: Kurslogik unverändert, jeder EODHD-Aufruf wird transparent protokolliert.',diagnostics:{...baseDiagnostics,finishedAt:finishedAt.toISOString(),durationMs:finishedAt-startedAt,requestCount,successfulRequests,failedRequests,lastSuccessfulAt},results})
}
