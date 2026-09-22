const POSITIONS={allworld:{name:'Vanguard FTSE All-World',symbol:'VWCE.DE',benchmark:'VWCE.DE'},defence:{name:'Future of Defence',symbol:'ASWC.DE',benchmark:'VWCE.DE'},banks:{name:'Amundi STOXX Europe 600 Banks',symbol:'LBNK.DE',benchmark:'VWCE.DE'},metals:{name:'iShares Essential Metals Producers',symbol:'CEBT.DE',benchmark:'VWCE.DE'},worldit:{name:'iShares MSCI World Information Technology',symbol:'AYEW.DE',benchmark:'VWCE.DE'},semiconductor:{name:'VanEck Semiconductor',symbol:'VVSM.DE',benchmark:'VWCE.DE'},sap:{name:'SAP SE',symbol:'SAP.DE',benchmark:'VWCE.DE'},fidelity:{name:'Fidelity Global Quality Income',symbol:'FGEQ.DE',benchmark:'VWCE.DE'},cyber:{name:'L&G Cyber Security',symbol:'USPY.DE',benchmark:'VWCE.DE'},gold:{name:'Xetra-Gold',symbol:'4GLD.DE',benchmark:'VWCE.DE'},ageing:{name:'iShares Ageing Population',symbol:'2B77.DE',benchmark:'VWCE.DE'},trilogy:{name:'Trilogy Metals',symbol:'TMQ',benchmark:'VWCE.DE'},'custom-spacex-us84615q1031':{name:'Space Explorations Technology A',symbol:'SPCX',benchmark:'VWCE.DE',convertUsdToEur:true},'custom-ie00bmydm919':{name:'L&G Europe ex-UK Quality Dividends Equal Weight',symbol:'LGGE.DE',benchmark:'VWCE.DE'},'custom-ie00byzk4776':{name:'iShares Healthcare Innovation UCITS ETF',symbol:'2B78.DE',benchmark:'VWCE.DE'},'custom-ie00bhzrr030':{name:'Franklin FTSE Korea UCITS ETF',symbol:'FLXK.DE',benchmark:'VWCE.DE'},'custom-us5128073062':{name:'LAM Research',symbol:'LAR0.DE',benchmark:'VWCE.DE'},'custom-us5951121038':{name:'Micron Technology',symbol:'MTE.DE',benchmark:'VWCE.DE'},ethereum:{name:'Ethereum',symbol:'ETH-EUR',benchmark:'BTC-EUR'}};
function sma(v,n){const o=new Array(v.length).fill(null);let s=0;for(let i=0;i<v.length;i++){s+=v[i];if(i>=n)s-=v[i-n];if(i>=n-1)o[i]=s/n}return o}function ema(v,n){const o=new Array(v.length).fill(null),k=2/(n+1);let p=null;for(let i=0;i<v.length;i++){p=p==null?v[i]:v[i]*k+p*(1-k);o[i]=p}return o}function rsi(v,n=14){if(v.length<=n)return null;let g=0,l=0;for(let i=1;i<=n;i++){const d=v[i]-v[i-1];d>=0?g+=d:l-=d}let ag=g/n,al=l/n;for(let i=n+1;i<v.length;i++){const d=v[i]-v[i-1];ag=(ag*(n-1)+Math.max(d,0))/n;al=(al*(n-1)+Math.max(-d,0))/n}if(al===0)return 100;const rs=ag/al;return 100-100/(1+rs)}async function yahoo(symbol){const u=`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=5y&interval=1d&includePrePost=false`;const r=await fetch(u,{headers:{Accept:'application/json','User-Agent':'Mozilla/5.0 DepotCockpit/6.0.12'}});if(!r.ok)throw new Error(`Yahoo ${r.status}`);const j=await r.json(),rr=j?.chart?.result?.[0];if(!rr)throw new Error('Keine Yahoo-Historie');const ts=rr.timestamp||[],q=rr.indicators?.quote?.[0]||{},cl=q.close||[],vol=q.volume||[],pts=[];for(let i=0;i<ts.length;i++){const c=Number(cl[i]);if(Number.isFinite(c)&&c>0)pts.push({date:new Date(ts[i]*1000).toISOString().slice(0,10),close:c,volume:Number(vol[i])||0})}if(pts.length<35)throw new Error('Zu wenig historische Daten');return pts}

async function yahooEurConverted(symbol){
  const [asset,fx]=await Promise.all([yahoo(symbol),yahoo('EURUSD=X')]);
  const fxByDate=new Map(fx.map(x=>[x.date,x.close]));
  const out=[];
  for(const p of asset){
    const eurUsd=Number(fxByDate.get(p.date));
    if(!(eurUsd>0))continue;
    out.push({...p,close:p.close/eurUsd});
  }
  if(out.length<5)throw new Error('Zu wenig EUR-konvertierte Historie');
  return out;
}
async function historyForPosition(p){
  if(p?.convertUsdToEur)return yahooEurConverted(p.symbol);

  const symbols=[p?.symbol].filter(Boolean);
  if(String(p?.name||'').includes('Europe ex-UK Quality Dividends')){
    for(const s of ['LGGE.DE','IE00BMYDM919.SG','LDEU.DE'])if(!symbols.includes(s))symbols.push(s);
  }
  if(String(p?.name||'').includes('Healthcare Innovation') || p?.symbol==='2B78.DE'){
    for(const s of ['2B78.DE','IE00BYZK4776.SG'])if(!symbols.includes(s))symbols.push(s);
  }
  if(String(p?.name||'').includes('LAM Research') || p?.symbol==='LAR0.DE'){
    for(const s of ['LAR0.DE','LAR0.F','LRCX'])if(!symbols.includes(s))symbols.push(s);
  }
  if(String(p?.name||'').includes('Micron') || p?.symbol==='MTE.DE'){
    for(const s of ['MTE.DE','MTE.F','MU'])if(!symbols.includes(s))symbols.push(s);
  }
  if(String(p?.name||'').includes('FTSE Korea') || p?.symbol==='FLXK.DE'){
    for(const s of ['FLXK.DE'])if(!symbols.includes(s))symbols.push(s);
  }

  let lastError=null;
  for(const s of symbols){
    try{return await yahoo(s)}catch(e){lastError=e}
  }
  throw lastError||new Error('Keine Historienquelle');
}

const POSITION_ISINS={
  allworld:'IE00BK5BQT80',
  defence:'IE000OJ5TQP4',
  banks:'LU1834983477',
  metals:'IE000ROSD5J6',
  worldit:'IE00BJ5JNY98',
  semiconductor:'IE00BMC38736',
  sap:'DE0007164600',
  fidelity:'IE00BYXVGZ48',
  cyber:'IE00BYPLS672',
  gold:'DE000A0S9GB0',
  ageing:'IE00BYZK4669',
  trilogy:'CA89621C1059',
  'custom-spacex-us84615q1031':'US84615Q1031',
  'custom-ie00bmydm919':'IE00BMYDM919',
  'custom-ie00byzk4776':'IE00BYZK4776',
  'custom-ie00bhzrr030':'IE00BHZRR030',
  'custom-us5128073062':'US5128073062',
  'custom-us5951121038':'US5951121038',
  ethereum:'ETH'
};
const POSITION_BROKERS={allworld:'S Broker',defence:'S Broker',banks:'S Broker',metals:'S Broker',worldit:'S Broker',semiconductor:'S Broker',sap:'S Broker',fidelity:'S Broker',cyber:'S Broker',gold:'S Broker',ageing:'S Broker',trilogy:'Trade Republic','custom-spacex-us84615q1031':'Trade Republic','custom-ie00bmydm919':'S Broker','custom-ie00byzk4776':'S Broker','custom-ie00bhzrr030':'S Broker','custom-us5128073062':'S Broker','custom-us5951121038':'S Broker',ethereum:'Trade Republic'};

async function yahooDaily(symbol){
  const u=`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1mo&interval=1d&includePrePost=false`;
  const r=await fetch(u,{headers:{Accept:'application/json','User-Agent':'Mozilla/5.0 DepotCockpit/6.0.24'}});
  if(!r.ok)throw new Error(`Yahoo ${r.status}`);
  const j=await r.json(),rr=j?.chart?.result?.[0],ts=rr?.timestamp||[],q=rr?.indicators?.quote?.[0]||{},cl=q.close||[];
  const out=[];
  for(let i=0;i<ts.length;i++){
    const c=Number(cl[i]);
    if(Number.isFinite(c)&&c>0){
      out.push({
        date:new Date(ts[i]*1000).toISOString().slice(0,10),
        close:c,
        ts:Number(ts[i])
      });
    }
  }
  return out;
}


function localDateISO(timeZone){
  const parts=new Intl.DateTimeFormat('en-CA',{
    timeZone,year:'numeric',month:'2-digit',day:'2-digit'
  }).formatToParts(new Date());
  const get=t=>parts.find(p=>p.type===t)?.value;
  return `${get('year')}-${get('month')}-${get('day')}`;
}
function previousCompletedRow(rows,timeZone){
  if(!Array.isArray(rows)||!rows.length)return null;
  const today=localDateISO(timeZone);
  const candidates=rows.filter(r=>r?.date && String(r.date)<today && Number(r.close)>0);
  return candidates.length?candidates.at(-1):null;
}
function rowForDate(rows,date){
  return Array.isArray(rows)?rows.find(r=>String(r?.date)===String(date))||null:null;
}
async function standardPreviousClose(id,p){
  if(!p.symbol || id==='trilogy' || id==='ethereum' || id==='custom-spacex-us84615q1031')return null;
  try{
    let a=null,usedSymbol=p.symbol,usedVenue='Xetra';
    if(id==='custom-ie00byzk4776'){
      for(const s of ['2B78.DE','IE00BYZK4776.SG']){
        try{
          const rows=await yahooDaily(s);
          if(rows?.length){a=rows;usedSymbol=s;usedVenue=s.endsWith('.SG')?'Stuttgart':'Xetra';break}
        }catch{}
      }
      if(!a)return null;
    }else if(id==='custom-us5128073062'){
      for(const s of ['LAR0.DE','LAR0.F']){
        try{
          const rows=await yahooDaily(s);
          if(rows?.length){a=rows;usedSymbol=s;usedVenue=s.endsWith('.F')?'Frankfurt':'Xetra';break}
        }catch{}
      }
      if(!a)return null;
    }else if(id==='custom-us5951121038'){
      for(const s of ['MTE.DE','MTE.F']){
        try{
          const rows=await yahooDaily(s);
          if(rows?.length){a=rows;usedSymbol=s;usedVenue=s.endsWith('.F')?'Frankfurt':'Xetra';break}
        }catch{}
      }
      if(!a)return null;
    }else{
      a=await yahooDaily(p.symbol);
    }
    const prev=previousCompletedRow(a,'Europe/Berlin');
    if(!prev?.close)return null;
    return {
      id,name:p.name,broker:POSITION_BROKERS[id]||'',isin:POSITION_ISINS[id]||'',
      previousClose:Number(prev.close),currency:'EUR',asOf:prev.date,
      symbol:usedSymbol,venue:usedVenue,referenceType:'Letzter abgeschlossener Handelstag',
      source:`Yahoo ${usedSymbol} · ${usedVenue} · Schlusskurs ${prev.date}`
    };
  }catch{return null}
}

async function trilogyPreviousClose(p){
  try{
    const [tmq,fx]=await Promise.all([yahooDaily('TMQ'),yahooDaily('EURUSD=X')]);
    const tmqPrev=previousCompletedRow(tmq,'America/New_York');
    if(!tmqPrev?.close)return null;

    let fxPrev=rowForDate(fx,tmqPrev.date);
    if(!fxPrev){
      const priorFx=fx.filter(r=>r?.date && String(r.date)<=String(tmqPrev.date) && Number(r.close)>0);
      fxPrev=priorFx.length?priorFx.at(-1):null;
    }
    if(!(fxPrev?.close>0))return null;

    return {
      id:'trilogy',name:p.name,broker:'Trade Republic',isin:POSITION_ISINS.trilogy,
      previousClose:Number((tmqPrev.close/fxPrev.close).toFixed(6)),
      currency:'EUR',asOf:tmqPrev.date,venue:'NYSE American',
      referenceType:'Letzter abgeschlossener Handelstag · USD→EUR',
      source:`TMQ NYSE American · Schlusskurs ${tmqPrev.date} · EUR/USD ${fxPrev.date}`
    };
  }catch{return null}
}

async function ethereumPreviousClose(p){
  try{
    const r=await fetch('https://api.kraken.com/0/public/OHLC?pair=ETHEUR&interval=1440',{headers:{Accept:'application/json','User-Agent':'Mozilla/5.0 DepotCockpit/6.0.24'}});
    if(!r.ok)throw new Error(`Kraken ${r.status}`);
    const j=await r.json(),obj=j?.result||{},key=Object.keys(obj).find(k=>k!=='last'),raw=key?obj[key]:null;
    if(!Array.isArray(raw)||!raw.length)return null;

    const rows=raw.map(row=>{
      const ts=Number(row?.[0]),close=Number(row?.[4]);
      return {
        ts,date:Number.isFinite(ts)?new Date(ts*1000).toISOString().slice(0,10):null,
        close
      };
    }).filter(r=>r.date&&r.close>0);

    const prev=previousCompletedRow(rows,'UTC');
    if(!prev?.close)return null;

    return {
      id:'ethereum',name:p.name,broker:'Trade Republic',isin:POSITION_ISINS.ethereum,
      previousClose:Number(prev.close),currency:'EUR',asOf:prev.date,
      venue:'Kraken',referenceType:'Letzter abgeschlossener UTC-Tag',
      source:`Kraken ETH/EUR · Schlusskurs ${prev.date}`
    };
  }catch{return null}
}


async function spacexPreviousClose(p){
  try{
    const a=await yahooEurConverted('SPCX');
    const prev=previousCompletedRow(a,'America/New_York');
    if(!(prev?.close>0))return null;
    return {
      id:'custom-spacex-us84615q1031',name:p.name,broker:'Trade Republic',isin:POSITION_ISINS['custom-spacex-us84615q1031'],
      previousClose:Number(prev.close.toFixed(6)),currency:'EUR',asOf:prev.date,
      venue:'Nasdaq',referenceType:'Letzter abgeschlossener Nasdaq-Handelstag · USD→EUR',
      source:`Yahoo SPCX Nasdaq · Schlusskurs ${prev.date} · USD→EUR`
    };
  }catch{return null}
}

async function dailyReferenceFor(id,p){
  if(id==='trilogy')return trilogyPreviousClose(p);
  if(id==='ethereum')return ethereumPreviousClose(p);
  if(id==='custom-spacex-us84615q1031')return spacexPreviousClose(p);
  return standardPreviousClose(id,p);
}
function pct(a,b){return Number.isFinite(a)&&Number.isFinite(b)&&b!==0?(a/b-1)*100:null}function ck(key,label,points){return {key,label,points}}function score(m,last,prev){let s=0,c={};const R=m.rsi;if(!Number.isFinite(R)){c.rsi=ck('grey','noch nicht verfügbar',0)}else if(R>=45&&R<=70){c.rsi=ck('green','gesund',2);s+=2}else if((R>=35&&R<45)||(R>70&&R<=75)){c.rsi=ck('yellow','angespannt',1);s++}else c.rsi=ck('red',R>75?'überkauft':'schwach',0);if(m.macd>m.macdSignal){c.macd=ck('green','positiv',2);s+=2}else if(Math.abs(m.macd-m.macdSignal)<=Math.max(.001,Math.abs(m.macd)*.12)){c.macd=ck('yellow','neutral',1);s++}else c.macd=ck('red','negativ',0);if(Number.isFinite(m.sma50)&&Number.isFinite(m.sma200)){
  if(last>m.sma50&&m.sma50>m.sma200){c.trend=ck('green','Aufwärtstrend',2);s+=2}
  else if(last>m.sma200){c.trend=ck('yellow','gemischt',1);s++}
  else c.trend=ck('red','unter 200T',0);
}else if(Number.isFinite(m.sma50)){
  if(last>m.sma50){c.trend=ck('yellow','über 50T · 200T noch nicht verfügbar',1);s++}
  else c.trend=ck('orange','unter 50T · 200T noch nicht verfügbar',0);
}else c.trend=ck('grey','Historie für Trendlinien noch zu kurz',0);if(!Number.isFinite(m.relativeStrength20)){c.relative=ck('grey','noch nicht verfügbar',0)}else if(m.relativeStrength20>2){c.relative=ck('green','stärker als Benchmark',2);s+=2}else if(m.relativeStrength20>=-2){c.relative=ck('yellow','marktgleich',1);s++}else c.relative=ck('red','schwächer',0);const day=prev?last/prev-1:0;if(!Number.isFinite(m.volumeRatio)){c.volume=ck('grey','noch nicht verfügbar',0)}else if(m.volumeRatio>=1.15&&day>0){c.volume=ck('green','Anstieg bestätigt',2);s+=2}else if(m.volumeRatio>=.8){c.volume=ck('yellow','neutral',1);s++}else c.volume=ck('red','schwach',0);return {score:s,checks:c}}
export default async function handler(req,res){res.setHeader('Cache-Control','no-store');if(req.method==='GET'||(req.url||'').includes('/api/health'))return res.status(200).json({ok:true,project:'Depot-Cockpit',version:'6.0.24-mobile24',service:'analysis-health'});if(req.method!=='POST')return res.status(405).json({ok:false,error:'POST erforderlich'});try{if(req.body?.action==='daily-references'){const rows=await Promise.all(Object.entries(POSITIONS).map(([id,p])=>dailyReferenceFor(id,p)));return res.status(200).json({ok:true,action:'daily-references',items:rows.filter(Boolean),asOf:new Date().toISOString()})}const id=req.body?.positionId,p=POSITIONS[id];if(!p)return res.status(400).json({ok:false,error:'Unbekannte Position'});if(!p.symbol)return res.status(422).json({ok:false,error:'Für dieses Wertpapier ist noch keine verifizierte Historienquelle hinterlegt.'});const [a,b]=await Promise.all([historyForPosition(p),yahoo(p.benchmark)]),cl=a.map(x=>x.close),vol=a.map(x=>x.volume),s30=sma(cl,30),s50=sma(cl,50),s200=sma(cl,200),e12=ema(cl,12),e26=ema(cl,26),macd=cl.map((_,i)=>e12[i]-e26[i]),sig=ema(macd,9),last=cl.at(-1),prev=cl.at(-2),bench=b.map(x=>x.close),rs20=(cl.length>=21&&bench.length>=21)?pct(last,cl.at(-21))-pct(bench.at(-1),bench.at(-21)):null,avg=vol.slice(-20).reduce((s,v)=>s+v,0)/Math.max(1,vol.slice(-20).length),m={rsi:rsi(cl),macd:macd.at(-1),macdSignal:sig.at(-1),sma30:s30.at(-1),sma50:s50.at(-1),sma200:s200.at(-1),relativeStrength20:rs20,volumeRatio:avg>0?vol.at(-1)/avg:null},sc=score(m,last,prev);const fullPoints=a.map((x,i)=>({...x,sma30:s30[i],sma50:s50[i],sma200:s200[i]})),points=fullPoints.slice(-430);return res.status(200).json({ok:true,positionId:id,name:p.name,symbol:p.symbol,benchmark:p.benchmark,asOf:a.at(-1)?.date||null,score:sc.score,lastPrice:last,previousClose:prev,metrics:{...m,checks:sc.checks},points,note:p.convertUsdToEur?'SpaceX-Historie: Yahoo SPCX (Nasdaq, USD) täglich nach EUR umgerechnet. Nicht verfügbare 200-Tage-Signale werden nicht geschätzt.':'Technischer 5er-Check aus fünf Jahren Tageshistorie. 30/50/200-Tage-Linien werden auf der vollständigen Historie berechnet; angezeigt wird der gewählte Ausschnitt.'})}catch(e){return res.status(500).json({ok:false,error:e?.message||String(e)})}}
