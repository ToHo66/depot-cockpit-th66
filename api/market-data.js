const DAY=86400000;
function json(res,status,body){res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','no-store');res.status(status).json(body)}
function isoDate(d){return new Date(d).toISOString().slice(0,10)}
function subCalendarMonths(date,months){const d=new Date(date),day=d.getUTCDate();d.setUTCDate(1);d.setUTCMonth(d.getUTCMonth()-months);const last=new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,0)).getUTCDate();d.setUTCDate(Math.min(day,last));return d}
function latestOnOrBefore(rows,targetDate){const target=isoDate(targetDate);for(let i=rows.length-1;i>=0;i--)if(rows[i].date<=target)return rows[i];return null}
function pct(current,base){return Number.isFinite(current)&&Number.isFinite(base)&&base!==0?((current/base)-1)*100:null}
function normalizeRows(raw){if(!Array.isArray(raw))return[];return raw.map(r=>({date:String(r.date||''),open:Number(r.open),high:Number(r.high),low:Number(r.low),close:Number(r.adjusted_close??r.close),volume:Number(r.volume||0)})).filter(r=>/^\d{4}-\d{2}-\d{2}$/.test(r.date)&&Number.isFinite(r.close)&&r.close>0).sort((a,b)=>a.date.localeCompare(b.date))}
async function fetchHistory(symbol,token,from,to){const url=new URL(`https://eodhd.com/api/eod/${encodeURIComponent(symbol)}`);url.searchParams.set('api_token',token);url.searchParams.set('fmt','json');url.searchParams.set('period','d');url.searchParams.set('order','a');url.searchParams.set('from',from);url.searchParams.set('to',to);const response=await fetch(url,{headers:{Accept:'application/json'}});const text=await response.text();if(!response.ok)throw new Error(`EODHD ${response.status}: ${text.slice(0,180)}`);let parsed;try{parsed=JSON.parse(text)}catch{throw new Error('EODHD lieferte kein gültiges JSON')}if(parsed?.error)throw new Error(String(parsed.error));return normalizeRows(parsed)}
export default async function handler(req,res){
  if(req.method!=='POST')return json(res,405,{ok:false,error:'Nur POST ist erlaubt.'});
  const token=process.env.EODHD_API_KEY;
  if(!token)return json(res,503,{ok:false,code:'API_KEY_MISSING',error:'EODHD_API_KEY ist in Vercel noch nicht hinterlegt.'});
  const positions=Array.isArray(req.body?.positions)?req.body.positions:[];
  if(positions.length>20)return json(res,400,{ok:false,error:'Abrufschutz: maximal 20 Positionen pro Lauf.'});
  const today=new Date(),from=isoDate(new Date(today.getTime()-400*DAY)),to=isoDate(today),results=[];
  let externalRequests=0,stoppedBecause=null;
  for(const p of positions){
    if(stoppedBecause){results.push({id:p.id,ok:false,error:'Nicht mehr abgefragt: Abrufschutz aktiv.'});continue}
    const candidate=Array.isArray(p.candidates)?p.candidates.find(x=>x&&String(x.symbol||'').trim()):null;
    if(!candidate){results.push({id:p.id,ok:false,error:'Kein festes EODHD-Symbol hinterlegt.'});continue}
    try{
      externalRequests++;
      const rows=await fetchHistory(String(candidate.symbol).trim(),token,from,to);
      if(rows.length<2)throw new Error('Zu wenige historische Datenpunkte.');
      const used={venue:String(candidate.venue||'Unbekannt'),symbol:String(candidate.symbol).trim()};
      const last=rows.at(-1),previous=rows.at(-2),lastDate=new Date(`${last.date}T12:00:00Z`),weekBase=latestOnOrBefore(rows,new Date(lastDate.getTime()-7*DAY)),monthBase=latestOnOrBefore(rows,subCalendarMonths(lastDate,1)),threeMonthBase=latestOnOrBefore(rows,subCalendarMonths(lastDate,3)),yearBase=latestOnOrBefore(rows,subCalendarMonths(lastDate,12));
      results.push({id:p.id,ok:true,symbol:used.symbol,usedVenue:used.venue,requestedVenue:p.analysisVenue||p.brokerVenue||null,attempted:[candidate],venueWarning:'Festes Analyse-Symbol wurde verwendet. Keine automatische Ersatzbörsen-Abfrage.',currency:p.currency||'EUR',source:`EODHD EOD · ${used.venue} · festes Symbol`,latest:{date:last.date,price:last.close},performance:{day:{pct:pct(last.close,previous.close),baseDate:previous.date,basePrice:previous.close},week:{pct:pct(last.close,weekBase?.close),baseDate:weekBase?.date||null,basePrice:weekBase?.close||null},month:{pct:pct(last.close,monthBase?.close),baseDate:monthBase?.date||null,basePrice:monthBase?.close||null},threeMonths:{pct:pct(last.close,threeMonthBase?.close),baseDate:threeMonthBase?.date||null,basePrice:threeMonthBase?.close||null},year:{pct:pct(last.close,yearBase?.close),baseDate:yearBase?.date||null,basePrice:yearBase?.close||null}},chart:rows.slice(-260).map(r=>({date:r.date,close:r.close}))});
    }catch(error){
      const message=error?.message||'Unbekannter Datenfehler';
      results.push({id:p.id,ok:false,symbol:String(candidate.symbol).trim(),attempted:[candidate],error:message});
      if(/EODHD\s+402|daily API requests limit/i.test(message))stoppedBecause='EODHD-Tageslimit erreicht; alle weiteren externen Anfragen wurden sofort beendet.';
    }
  }
  return json(res,200,{ok:true,version:'5.2-test',generatedAt:new Date().toISOString(),externalRequests,stoppedBecause,method:'Abrufschutz: maximal ein festes Symbol je Position, keine Ersatzbörsen-Schleife, sofortiger Abbruch bei HTTP 402.',results});
}
