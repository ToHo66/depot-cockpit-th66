const DAY=86400000;
function json(res,status,body){res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','no-store');res.status(status).json(body)}
function isoDate(d){return new Date(d).toISOString().slice(0,10)}
function subCalendarMonths(date,months){const d=new Date(date),day=d.getUTCDate();d.setUTCDate(1);d.setUTCMonth(d.getUTCMonth()-months);const last=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,0)).getUTCDate();d.setUTCDate(Math.min(day,last));return d}
function latestOnOrBefore(rows,targetDate){const target=isoDate(targetDate);for(let i=rows.length-1;i>=0;i--)if(rows[i].date<=target)return rows[i];return null}
function pct(current,base){return Number.isFinite(current)&&Number.isFinite(base)&&base!==0?((current/base)-1)*100:null}
function normalizeRows(raw){if(!Array.isArray(raw))return[];return raw.map(r=>({date:String(r.date||''),open:Number(r.open),high:Number(r.high),low:Number(r.low),close:Number(r.adjusted_close??r.close),volume:Number(r.volume||0)})).filter(r=>/^\d{4}-\d{2}-\d{2}$/.test(r.date)&&Number.isFinite(r.close)&&r.close>0).sort((a,b)=>a.date.localeCompare(b.date))}
function safeError(text){return String(text||'Unbekannter Fehler').replace(/api_token=[^&\s]+/gi,'api_token=***').slice(0,240)}
function baseDiagnostics(token){return {apiKeyPresent:Boolean(token),requestCount:0,lastSuccessfulAt:null,deploymentId:process.env.VERCEL_DEPLOYMENT_ID||process.env.VERCEL_GIT_COMMIT_SHA?.slice(0,12)||null,environment:process.env.VERCEL_ENV||null,region:process.env.VERCEL_REGION||process.env.VERCEL_FUNCTION_REGION||null,generatedAt:new Date().toISOString(),attempts:[]}}
async function fetchHistory(symbol,token,from,to,meta,diagnostics){
  const url=new URL(`https://eodhd.com/api/eod/${encodeURIComponent(symbol)}`);url.searchParams.set('api_token',token);url.searchParams.set('fmt','json');url.searchParams.set('period','d');url.searchParams.set('order','a');url.searchParams.set('from',from);url.searchParams.set('to',to);
  const started=Date.now();diagnostics.requestCount++;
  let response,text='';
  try{
    response=await fetch(url,{headers:{Accept:'application/json'}});text=await response.text();
    const attempt={id:meta.id,positionName:meta.positionName,symbol,venue:meta.venue,endpoint:`/api/eod/${encodeURIComponent(symbol)}?fmt=json&period=d&order=a&from=${from}&to=${to}&api_token=***`,status:response.status,durationMs:Date.now()-started,ok:response.ok,error:response.ok?null:safeError(text)};
    diagnostics.attempts.push(attempt);
    if(!response.ok)throw Object.assign(new Error(`EODHD ${response.status}`),{status:response.status,detail:safeError(text)});
    let parsed;try{parsed=JSON.parse(text)}catch{throw new Error('EODHD lieferte kein gültiges JSON')}
    if(parsed?.error)throw new Error(String(parsed.error));diagnostics.lastSuccessfulAt=new Date().toISOString();return normalizeRows(parsed)
  }catch(error){
    if(!diagnostics.attempts.some(a=>a.id===meta.id&&a.symbol===symbol&&a.durationMs===Date.now()-started)){
      diagnostics.attempts.push({id:meta.id,positionName:meta.positionName,symbol,venue:meta.venue,endpoint:`/api/eod/${encodeURIComponent(symbol)}?fmt=json&period=d&order=a&from=${from}&to=${to}&api_token=***`,status:response?.status??null,durationMs:Date.now()-started,ok:false,error:safeError(error.detail||error.message)})
    }
    throw error
  }
}
export default async function handler(req,res){
  const token=process.env.EODHD_API_KEY;const diagnostics=baseDiagnostics(token);
  if(req.method!=='POST')return json(res,405,{ok:false,error:'Nur POST ist erlaubt.',diagnostics});
  if(!token)return json(res,503,{ok:false,code:'API_KEY_MISSING',error:'EODHD_API_KEY ist in Vercel noch nicht hinterlegt.',diagnostics});
  const positions=Array.isArray(req.body?.positions)?req.body.positions:[];if(positions.length>40)return json(res,400,{ok:false,error:'Zu viele Positionen.',diagnostics});
  const today=new Date(),from=isoDate(new Date(today.getTime()-400*DAY)),to=isoDate(today),results=[];
  for(const p of positions){
    const candidates=Array.isArray(p.candidates)?p.candidates.filter(x=>x&&String(x.symbol||'').trim()):[];
    if(!candidates.length){results.push({id:p.id,ok:false,error:'Kein unterstützter EODHD-Handelsplatz oder Symbol hinterlegt.'});continue}
    let rows=null,used=null,lastError=null;
    for(const candidate of candidates){
      try{const candidateRows=await fetchHistory(String(candidate.symbol).trim(),token,from,to,{id:p.id,positionName:p.name,venue:String(candidate.venue||'Unbekannt')},diagnostics);if(candidateRows.length<2)throw new Error('Zu wenige historische Datenpunkte.');rows=candidateRows;used={venue:String(candidate.venue||'Unbekannt'),symbol:String(candidate.symbol).trim()};break}catch(error){lastError=error}
    }
    if(!rows||!used){results.push({id:p.id,ok:false,error:'Kursabruf fehlgeschlagen – Details unter Einstellungen → Hilfe & Diagnose.',diagnosticStatus:lastError?.status||null,attempted:candidates});continue}
    try{const symbol=used.symbol,last=rows.at(-1),previous=rows.at(-2),lastDate=new Date(`${last.date}T12:00:00Z`),weekBase=latestOnOrBefore(rows,new Date(lastDate.getTime()-7*DAY)),monthBase=latestOnOrBefore(rows,subCalendarMonths(lastDate,1)),threeMonthBase=latestOnOrBefore(rows,subCalendarMonths(lastDate,3)),yearBase=latestOnOrBefore(rows,subCalendarMonths(lastDate,12));results.push({id:p.id,ok:true,symbol,usedVenue:used.venue,requestedVenue:p.analysisVenue||p.brokerVenue||null,attempted:candidates,venueWarning:(p.analysisVenue&&p.analysisVenue!==used.venue)?`Feste Analysebörse ${p.analysisVenue} lieferte keine Reihe; transparenter Ersatz: ${used.venue}. Die Broker-Anzeigequelle beeinflusst die Analyse nicht.`:'Feste Analysebörse wurde verwendet. Die Broker-Anzeigequelle beeinflusst die Analyse nicht.',currency:p.currency||'EUR',source:`EODHD EOD · ${used.venue} · durchgehend dieselbe Kursreihe`,latest:{date:last.date,price:last.close},performance:{day:{pct:pct(last.close,previous.close),baseDate:previous.date,basePrice:previous.close},week:{pct:pct(last.close,weekBase?.close),baseDate:weekBase?.date||null,basePrice:weekBase?.close||null},month:{pct:pct(last.close,monthBase?.close),baseDate:monthBase?.date||null,basePrice:monthBase?.close||null},threeMonths:{pct:pct(last.close,threeMonthBase?.close),baseDate:threeMonthBase?.date||null,basePrice:threeMonthBase?.close||null},year:{pct:pct(last.close,yearBase?.close),baseDate:yearBase?.date||null,basePrice:yearBase?.close||null}},chart:rows.slice(-260).map(r=>({date:r.date,close:r.close}))})}catch(error){results.push({id:p.id,ok:false,symbol:used?.symbol||null,error:'Kursdaten konnten nicht verarbeitet werden – Details unter Hilfe & Diagnose.'})}
  }
  diagnostics.generatedAt=new Date().toISOString();
  return json(res,200,{ok:true,version:'5.1-diagnose',generatedAt:new Date().toISOString(),method:'Golden Master 5.0 unverändert plus isolierte API-Diagnose unter Einstellungen.',results,diagnostics})
}
