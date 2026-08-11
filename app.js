const VENUES=['Tradegate','gettex','Lang & Schwarz','Xetra','Stuttgart','Frankfurt','Société Générale','Euronext Paris','Euronext Amsterdam','Nasdaq','NYSE','Direkthandel','Manuell'];
const EODHD_VENUE_CODES={'Xetra':'XETRA','Frankfurt':'F','Stuttgart':'STU','Euronext Paris':'PA','Euronext Amsterdam':'AS','Nasdaq':'US','NYSE':'US'};
const EODHD_SUPPORTED_VENUES=Object.keys(EODHD_VENUE_CODES);
function tickerBase(symbol){return String(symbol||'').trim().split('.')[0]}
function defaultVenueSymbols(p){const base=tickerBase(p.marketSymbol);const map={...(p.venueSymbols||{})};if(base){for(const [venue,code] of Object.entries(EODHD_VENUE_CODES)){if(!map[venue])map[venue]=`${base}.${code}`}}if(p.marketSymbol&&!Object.values(map).includes(p.marketSymbol))map.Xetra=p.marketSymbol;return map}
function normalizePosition(p){
  p.fallbackVenues=Array.isArray(p.fallbackVenues)?p.fallbackVenues:[];
  p.brokerDisplaySource=p.brokerDisplaySource||p.brokerVenue||'Nicht erfasst';
  p.analysisVenue=p.analysisVenue||(EODHD_VENUE_CODES[p.brokerVenue]?p.brokerVenue:'Xetra');
  p.analysisSymbol=p.analysisSymbol||p.marketSymbol||'';
  p.marketSymbol=p.analysisSymbol;
  p.venueSymbols=defaultVenueSymbols(p);
  return p
}
function venueCandidates(p){
  const ordered=[p.analysisVenue,...(p.analysisFallbackVenues||p.fallbackVenues||[])];
  const seen=new Set(),c=[];
  for(const venue of ordered){
    const symbol=p.venueSymbols?.[venue];
    if(symbol&&EODHD_VENUE_CODES[venue]&&!seen.has(symbol)){
      seen.add(symbol);c.push({venue,symbol})
    }
  }
  if(p.analysisSymbol&&!seen.has(p.analysisSymbol)){
    c.push({venue:p.analysisVenue||'Analysebörse',symbol:p.analysisSymbol})
  }
  return c
}
const DEFAULT_POSITIONS=[
{id:'allworld',name:'Vanguard FTSE All-World',isin:'IE00BK5BQT80',wkn:'A2PKXG',qty:327,broker:'sBroker',brokerDisplaySource:'Société Générale',analysisVenue:'Xetra',fallbackVenues:['Tradegate','Frankfurt'],dataSource:'DB_DELAYED',analysisSymbol:'VGWL',currency:'EUR',purchasePrice:157.422},
{id:'defence',name:'Future of Defence',isin:'IE000OJ5TQP4',wkn:'A3EB9T',qty:1518,broker:'sBroker',brokerDisplaySource:'Lang & Schwarz',analysisVenue:'Xetra',fallbackVenues:['Tradegate','Frankfurt'],dataSource:'DB_DELAYED',analysisSymbol:'ASWC',currency:'EUR',purchasePrice:14.75},
{id:'banks',name:'Amundi STOXX Europe 600 Banks',isin:'LU1834983477',wkn:'LYX01W',qty:310,broker:'sBroker',brokerDisplaySource:'Lang & Schwarz',analysisVenue:'Xetra',fallbackVenues:['Tradegate','Frankfurt'],dataSource:'DB_DELAYED',analysisSymbol:'LBNK',currency:'EUR',purchasePrice:45.115},
{id:'metals',name:'iShares Essential Metals Producers',isin:'IE000ROSD5J6',wkn:'A3ERLP',qty:1850,broker:'sBroker',brokerDisplaySource:'Lang & Schwarz',analysisVenue:'Xetra',fallbackVenues:['Tradegate','Frankfurt'],dataSource:'DB_DELAYED',analysisSymbol:'CEBT',currency:'EUR',purchasePrice:7.093},
{id:'worldit',name:'iShares MSCI World Information Technology',isin:'IE00BJ5JNY98',wkn:'A2PHCC',qty:780,broker:'sBroker',brokerDisplaySource:'Xetra',analysisVenue:'Xetra',fallbackVenues:['Tradegate','Frankfurt'],dataSource:'DB_DELAYED',analysisSymbol:'AYEW',currency:'EUR',purchasePrice:15.891},
{id:'semiconductor',name:'VanEck Semiconductor',isin:'IE00BMC38736',wkn:'A2QC5J',qty:98,broker:'sBroker',brokerDisplaySource:'Lang & Schwarz',analysisVenue:'Xetra',fallbackVenues:['Tradegate','Frankfurt'],dataSource:'DB_DELAYED',analysisSymbol:'VVSM',currency:'EUR',purchasePrice:89.377},
{id:'sap',name:'SAP SE',isin:'DE0007164600',wkn:'716460',qty:60,broker:'sBroker',brokerDisplaySource:'Xetra',analysisVenue:'Xetra',fallbackVenues:['Tradegate','Frankfurt'],dataSource:'DB_DELAYED',analysisSymbol:'SAP',currency:'EUR',purchasePrice:250.417},
{id:'fidelity',name:'Fidelity Global Quality Income',isin:'IE00BYXVGZ48',wkn:'A2DL7E',qty:580,broker:'sBroker',brokerDisplaySource:'Xetra',analysisVenue:'Xetra',fallbackVenues:['Tradegate','Frankfurt'],dataSource:'DB_DELAYED',analysisSymbol:'FGEQ',currency:'EUR',purchasePrice:9.855},
{id:'cyber',name:'L&G Cyber Security',isin:'IE00BYPLS672',wkn:'A14WU5',qty:141,broker:'sBroker',brokerDisplaySource:'Euronext Paris',analysisVenue:'Xetra',fallbackVenues:['Tradegate','Frankfurt'],dataSource:'DB_DELAYED',analysisSymbol:'USPY',currency:'EUR',purchasePrice:33.329},
{id:'gold',name:'Xetra-Gold',isin:'DE000A0S9GB0',wkn:'A0S9GB',qty:35,broker:'sBroker',brokerDisplaySource:'Lang & Schwarz',analysisVenue:'Xetra',fallbackVenues:['Tradegate','Frankfurt'],dataSource:'DB_DELAYED',analysisSymbol:'4GLD',currency:'EUR',purchasePrice:117.846},
{id:'ageing',name:'iShares Ageing Population',isin:'IE00BYZK4669',wkn:'A2ANH1',qty:150,broker:'sBroker',brokerDisplaySource:'Lang & Schwarz',analysisVenue:'Xetra',fallbackVenues:['Tradegate','Frankfurt'],dataSource:'DB_DELAYED',analysisSymbol:'AGED',currency:'EUR',purchasePrice:9.52},
{id:'trilogy',name:'Trilogy Metals',isin:'CA89621C1059',wkn:'A14XMF',qty:600,broker:'Trade Republic',brokerDisplaySource:'Lang & Schwarz',analysisVenue:'Manuell',fallbackVenues:['Manuell'],dataSource:'TRILOGY_YAHOO',analysisSymbol:'TMQ',currency:'EUR',purchasePrice:null}
];
const APP_VERSION='5.6.1';
const APP_BUILD='UI-HARDFIX-20260811';
const APP_BUILD_DATE='2026-08-11';
const CANONICAL_HOST='depot-cockpit-th66-vercel-v20.vercel.app';
const STORE='th66-professional-master-v5';
const LEGACY_STORES=['th66-professional-v22-master','th66-professional-master','th66-professional-v3'];
const MARKET_CACHE='th66-professional-market-cache-v550';
const REQUEST_GUARD='th66-eodhd-request-guard-v521';
const MARKET_SOURCE_PREF='th66-market-source-pref-v53';
const CENTRAL_MARKET_CACHE='th66-market-snapshot-v550';
const INSTRUMENT_MASTER_CACHE='th66-instrument-master-v550';
const MARKET_CACHE_TTL_MS=15*60*1000;

function readJsonStorage(key,fallback=null){
  try{return JSON.parse(localStorage.getItem(key)||'null')??fallback}catch{return fallback}
}
function writeJsonStorage(key,value){
  localStorage.setItem(key,JSON.stringify(value))
}

const MARKET_DB_NAME='DepotCockpitMarketDB';
const MARKET_DB_VERSION=1;
const MARKET_DB_STORE='snapshots';
function openMarketDb(){
  return new Promise((resolve,reject)=>{
    if(!('indexedDB' in window)){resolve(null);return}
    const req=indexedDB.open(MARKET_DB_NAME,MARKET_DB_VERSION);
    req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(MARKET_DB_STORE))db.createObjectStore(MARKET_DB_STORE,{keyPath:'id'})};
    req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)
  })
}
async function dbPutSnapshot(snapshot){
  const db=await openMarketDb();if(!db){writeJsonStorage(CENTRAL_MARKET_CACHE,snapshot);return 'localStorage'}
  await new Promise((resolve,reject)=>{const tx=db.transaction(MARKET_DB_STORE,'readwrite');tx.objectStore(MARKET_DB_STORE).put({...snapshot,id:'latest'});tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)});
  return 'IndexedDB'
}
async function dbGetSnapshot(){
  const db=await openMarketDb();if(!db)return readJsonStorage(CENTRAL_MARKET_CACHE,null);
  return await new Promise((resolve,reject)=>{const tx=db.transaction(MARKET_DB_STORE,'readonly');const r=tx.objectStore(MARKET_DB_STORE).get('latest');r.onsuccess=()=>resolve(r.result||null);r.onerror=()=>reject(r.error)})
}
async function dbClearSnapshot(){
  const db=await openMarketDb();if(db)await new Promise((resolve,reject)=>{const tx=db.transaction(MARKET_DB_STORE,'readwrite');tx.objectStore(MARKET_DB_STORE).delete('latest');tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)});
  localStorage.removeItem(CENTRAL_MARKET_CACHE)
}
function marketSourcePreference(){
  return {primary:'DB_DELAYED',fallbacks:['XETRA_POSTTRADE','MANUAL']} // 5.4.0 fixed policy
}
function readCentralMarketCache(){
  const x=readJsonStorage(CENTRAL_MARKET_CACHE,{items:{},savedAt:null});
  return x&&typeof x==='object'?x:{items:{},savedAt:null}
}
function centralMarketCacheFresh(){
  const x=readCentralMarketCache();if(!x.savedAt)return false;
  return Date.now()-new Date(x.savedAt).getTime()<MARKET_CACHE_TTL_MS
}
async function persistAndApplySnapshot(snapshot){
  const items={};
  for(const item of (snapshot?.results||[]))if(item?.id&&item?.ok&&Number.isFinite(Number(item?.latest?.price)))items[item.id]=item;
  const stored={
    id:'latest',schemaVersion:5,generationId:snapshot.generationId||crypto.randomUUID?.()||String(Date.now()),
    savedAt:new Date().toISOString(),generatedAt:snapshot.generatedAt||new Date().toISOString(),
    requestedIds:snapshot.requestedIds||[],items,coverage:snapshot.coverage||{},diagnostics:snapshot.diagnostics||{},provider:snapshot.provider||'Market Data Core'
  };
  const mode=await dbPutSnapshot(stored);
  writeJsonStorage(CENTRAL_MARKET_CACHE,stored); // synchronous mirror for fast startup
  state.data=items;state.updatedAt=stored.generatedAt;saveMarketCache();
  return {stored,mode}
}
async function restorePersistedMarketSnapshot(){
  let snap=null;try{snap=await dbGetSnapshot()}catch{}
  if(!snap)snap=readCentralMarketCache();
  if(snap?.schemaVersion!==5||!snap?.items)return false;
  const validIds=new Set(state.positions.filter(p=>p.dataSource!=='MANUAL').map(p=>p.id));
  const items={};for(const [id,item] of Object.entries(snap.items))if(validIds.has(id)&&item?.ok&&Number.isFinite(Number(item?.latest?.price)))items[id]=item;
  state.data=items;state.updatedAt=snap.generatedAt||snap.savedAt||null;return Object.keys(items).length>0
}
function localDay(){return new Date().toISOString().slice(0,10)}
function readRequestGuard(){
  try{
    const x=JSON.parse(localStorage.getItem(REQUEST_GUARD)||'{}');
    return x.day===localDay()?x:{day:localDay(),requestedIds:[],rateLimited:false,lastAttempt:null}
  }catch{return {day:localDay(),requestedIds:[],rateLimited:false,lastAttempt:null}}
}
function writeRequestGuard(x){localStorage.setItem(REQUEST_GUARD,JSON.stringify(x))}
function dataIsCurrentToday(id){
  const d=state.data?.[id]?.latest?.date;
  if(!d)return false;
  const today=localDay();
  const now=new Date();
  const weekday=now.getUTCDay();
  if(weekday===0){
    const fri=new Date(now);fri.setUTCDate(now.getUTCDate()-2);
    return d>=fri.toISOString().slice(0,10)
  }
  if(weekday===6){
    const fri=new Date(now);fri.setUTCDate(now.getUTCDate()-1);
    return d>=fri.toISOString().slice(0,10)
  }
  return d>=today
}

DEFAULT_POSITIONS.forEach(normalizePosition);
const state={positions:structuredClone(DEFAULT_POSITIONS),archive:[],transactions:[],data:{},settings:{sbrokerReference:null,sbrokerReferenceUpdatedAt:null,trReference:null,trReferenceUpdatedAt:null,brokerPrices:{},brokerPositionValues:{},venuePriority:['Tradegate','gettex','Lang & Schwarz','Xetra','Stuttgart','Frankfurt']},updatedAt:null};
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
function parseNum(v){if(v==null||v==='')return null;const t=String(v).trim().replace(/\s/g,'');const normalized=t.includes(',')?t.replace(/\./g,'').replace(',','.'):t;const n=Number(normalized);return Number.isFinite(n)?n:null}
function eur(v,d=2){return Number.isFinite(v)?new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR',minimumFractionDigits:d,maximumFractionDigits:d}).format(v):'–'}
function pc(v){return Number.isFinite(v)?`${v>=0?'+':''}${v.toLocaleString('de-DE',{minimumFractionDigits:2,maximumFractionDigits:2})} %`:'–'}
function cls(v){return !Number.isFinite(v)?'':v>0?'positive':v<0?'negative':''}
function uid(){return 'p'+Date.now().toString(36)+Math.random().toString(36).slice(2,6)}
function snapshot(){
  return {
    schemaVersion:3,
    savedAt:new Date().toISOString(),
    positions:state.positions,
    archive:state.archive,
    transactions:state.transactions,
    settings:state.settings
  }
}
function save(){
  localStorage.setItem(STORE,JSON.stringify(snapshot()))
}
function migrateLegacyStorage(){
  if(localStorage.getItem(STORE))return;
  for(const key of LEGACY_STORES){
    const raw=localStorage.getItem(key);
    if(!raw)continue;
    try{
      const old=JSON.parse(raw);
      if(old?.settings?.sbrokerReference===167818.83&&!old.settings.sbrokerReferenceUpdatedAt){
        old.settings.sbrokerReference=null
      }
      localStorage.setItem(STORE,JSON.stringify({...old,schemaVersion:3,migratedAt:new Date().toISOString()}));
      return
    }catch{}
  }
}
function load(){
  migrateLegacyStorage();
  try{
    const x=JSON.parse(localStorage.getItem(STORE)||'{}');
    if(Array.isArray(x.positions)&&x.positions.length){
      const incoming=x.positions.filter(p=>p.id!=='datacenter').map(normalizePosition);
      const byId=new Map(incoming.map(p=>[p.id,p]));
      for(const d of DEFAULT_POSITIONS) if(!byId.has(d.id)&&d.id==='ageing') incoming.push(structuredClone(d));
      state.positions=incoming
    }
    if(Array.isArray(x.archive))state.archive=x.archive;
    if(Array.isArray(x.transactions))state.transactions=x.transactions;
    if(x.settings){
      const sb=Number(x.settings.sbrokerReference);
      const tr=Number(x.settings.trReference);
      state.settings={
        ...state.settings,
        ...x.settings,
        sbrokerReference:Number.isFinite(sb)&&sb>0?sb:null,
        trReference:Number.isFinite(tr)&&tr>0?tr:null,
        brokerPrices:{...state.settings.brokerPrices,...(x.settings.brokerPrices||{})},
        brokerPositionValues:{...state.settings.brokerPositionValues,...(x.settings.brokerPositionValues||{})}
      }
    }
  }catch(error){
    console.error('Lokale Daten konnten nicht geladen werden',error)
  }
}
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2400)}
function marketPrice(p){return state.data[p.id]?.latest?.price}
function brokerPrice(p){return state.settings.brokerPrices[p.id]}
function brokerPositionValue(p){return state.settings.brokerPositionValues?.[p.id]}
function appEodValue(p){const price=marketPrice(p);return Number.isFinite(price)?price*p.qty:null}
function valuationPrice(p){const manual=brokerPrice(p);return Number.isFinite(manual)?manual:marketPrice(p)}
function positionValue(p){const price=valuationPrice(p);return Number.isFinite(price)?price*p.qty:null}
function brokerTotal(name){const values=state.positions.filter(p=>p.broker===name).map(positionValue).filter(Number.isFinite);return values.length?values.reduce((a,b)=>a+b,0):null}
function saveMarketCache(){try{localStorage.setItem(MARKET_CACHE,JSON.stringify({savedAt:new Date().toISOString(),updatedAt:state.updatedAt,data:state.data}))}catch{}}
function loadMarketCache(){/* 5.4.0: legacy market caches intentionally ignored */}
function marketDayContribution(p){const d=state.data[p.id];const latest=d?.latest?.price,previous=d?.performance?.day?.basePrice;if(!d?.ok||!Number.isFinite(latest)||!Number.isFinite(previous))return null;return (latest-previous)*p.qty}
function chartSvg(points){if(!points?.length||points.length<2)return '<div class="chart-empty">Keine zusammenhängende Historie verfügbar</div>';const vals=points.map(x=>x.close),min=Math.min(...vals),max=Math.max(...vals),range=max-min||1,w=600,h=150,pad=10;const coords=points.map((x,i)=>`${pad+(i/(points.length-1))*(w-2*pad)},${h-pad-((x.close-min)/range)*(h-2*pad)}`).join(' ');return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-label="Kurschart"><polyline points="${coords}" fill="none" stroke="#2d63e2" stroke-width="4" vector-effect="non-scaling-stroke"/><line x1="10" y1="${h-10}" x2="${w-10}" y2="${h-10}" stroke="#dce4ee"/></svg>`}
function venueOptions(selected){return VENUES.map(v=>`<option ${v===selected?'selected':''}>${v}</option>`).join('')}

function courseStatus(p){
  const manual=Number.isFinite(brokerPrice(p));
  const d=state.data[p.id];
  const candidates=venueCandidates(p);
  if(manual)return {level:'ok',label:'Brokerkurs aktiv',detail:`Manuell ${eur(brokerPrice(p),3)}`};
  if(p.dataSource==='MANUAL')return {level:'manual',label:'Manueller Kurs fehlt',detail:'Bitte Brokerkurs eintragen'};
  if(d?.ok)return {level:'ok',label:'Kursreihe aktiv',detail:`${d.usedVenue||'EODHD'} · ${d.symbol||''}`};
  if(!candidates.length)return {level:'bad',label:'Keine Kursreihe zugeordnet',detail:'Handelsplatz oder EODHD-Symbol festlegen'};
  if(d&&!d.ok)return {level:'bad',label:'Abruf fehlgeschlagen',detail:d.error||'Kursreihe prüfen'};
  return {level:'warn',label:'Bereit zur Prüfung',detail:`${candidates.length} mögliche Kursreihe(n)`};
}
function renderCourseManager(){
  const box=$('#courseManager');if(!box)return;
  const rows=state.positions.map(p=>{const st=courseStatus(p);const candidates=venueCandidates(p);return `<article class="course-row" data-id="${p.id}">
    <div class="course-head"><div><b>${p.name}</b><small>${p.isin} · ${p.qty.toLocaleString('de-DE')} Stück · ${p.broker}</small></div><span class="course-status ${st.level}">${st.label}</span></div>
    <div class="course-grid">
      <label>Broker-Anzeigequelle (nur Information)<input data-course-field="brokerDisplaySource" value="${p.brokerDisplaySource||''}" placeholder="z. B. Quotrix, L&S, Société Générale"></label>
      <label>Feste Analysebörse<select data-course-field="analysisVenue">${venueOptions(p.analysisVenue)}</select></label>
      <label>Festes Analyse-Symbol<input data-course-field="analysisSymbol" value="${p.analysisSymbol||p.marketSymbol||''}" placeholder="z. B. VGWL.XETRA"></label>
      <label>Xetra-Symbol<input data-course-symbol="Xetra" value="${p.venueSymbols?.Xetra||''}" placeholder="… .XETRA"></label>
      <label>Frankfurt-Symbol<input data-course-symbol="Frankfurt" value="${p.venueSymbols?.Frankfurt||''}" placeholder="… .F"></label>
      <label>Stuttgart-Symbol<input data-course-symbol="Stuttgart" value="${p.venueSymbols?.Stuttgart||''}" placeholder="… .STU"></label>
      <label>Manueller Brokerkurs (€)<input data-course-broker-price inputmode="decimal" value="${Number.isFinite(brokerPrice(p))?String(brokerPrice(p)).replace('.',','):''}" placeholder="optional – nur exakter Brokerabgleich"></label>
    </div>
    <div class="course-foot"><span>${st.detail}</span><small>Analyse: ${candidates.map(x=>`${x.venue} (${x.symbol})`).join(' → ')||'keine Reihe'} · Die Broker-Anzeigequelle steuert den Abruf nicht.</small></div>
  </article>`}).join('');
  const statuses=state.positions.map(courseStatus),ok=statuses.filter(x=>x.level==='ok').length,bad=statuses.filter(x=>x.level==='bad').length,warn=statuses.length-ok-bad;
  $('#courseManagerSummary').innerHTML=`<span class="summary-pill ok">${ok} aktiv</span><span class="summary-pill warn">${warn} offen</span><span class="summary-pill bad">${bad} fehlerhaft</span>`;
  box.innerHTML=rows;
}
function saveCourseManager(){
  $$('.course-row').forEach(row=>{
    const p=state.positions.find(x=>x.id===row.dataset.id);if(!p)return;
    p.brokerDisplaySource=row.querySelector('[data-course-field="brokerDisplaySource"]').value.trim()||'Nicht erfasst';
    p.analysisVenue=row.querySelector('[data-course-field="analysisVenue"]').value;
    p.analysisSymbol=row.querySelector('[data-course-field="analysisSymbol"]').value.trim();
    p.marketSymbol=p.analysisSymbol;
    p.venueSymbols={...(p.venueSymbols||{})};
    row.querySelectorAll('[data-course-symbol]').forEach(i=>{const v=i.dataset.courseSymbol,val=i.value.trim();if(val)p.venueSymbols[v]=val;else delete p.venueSymbols[v]});
    const bp=parseNum(row.querySelector('[data-course-broker-price]').value);
    if(Number.isFinite(bp))state.settings.brokerPrices[p.id]=bp;else delete state.settings.brokerPrices[p.id];
    normalizePosition(p)
  });
  save();render();toast('Getrennte Kurslogik gespeichert')
}

function render(){
  const sbPositions=state.positions.filter(p=>p.broker==='sBroker'), trPositions=state.positions.filter(p=>p.broker==='Trade Republic');
  const sbValued=sbPositions.filter(p=>Number.isFinite(positionValue(p))), trValued=trPositions.filter(p=>Number.isFinite(positionValue(p)));
  const sbComplete=sbValued.length===sbPositions.length, trComplete=trValued.length===trPositions.length;
  const sb=sbComplete&&sbPositions.length?sbValued.reduce((a,p)=>a+positionValue(p),0):null;
  const tr=trComplete&&trPositions.length?trValued.reduce((a,p)=>a+positionValue(p),0):null;
  const valued=state.positions.filter(p=>Number.isFinite(positionValue(p)));
  const totalComplete=valued.length===state.positions.length;
  const total=totalComplete?valued.reduce((sum,p)=>sum+positionValue(p),0):null;
  $('#sbrokerValue').textContent=sbComplete?eur(sb):`Teilbewertung ${sbValued.length}/${sbPositions.length}`;
  $('#trValue').textContent=trComplete?eur(tr):`Teilbewertung ${trValued.length}/${trPositions.length}`;
  $('#totalValue').textContent=totalComplete?eur(total):`Teilbewertung ${valued.length}/${state.positions.length}`;
  $('#sbrokerCount').textContent=`${state.positions.filter(p=>p.broker==='sBroker').length} Positionen`;
  $('#trCount').textContent=`${state.positions.filter(p=>p.broker==='Trade Republic').length} Positionen`;
  const available=state.positions.filter(p=>state.data[p.id]?.ok||Number.isFinite(brokerPrice(p))).length;
  $('#coverage').textContent=`${available}/${state.positions.length}`;
  $('#lastUpdate').textContent=state.updatedAt?`Stand ${new Date(state.updatedAt).toLocaleString('de-DE',{hour:'2-digit',minute:'2-digit'})}`:'Kurse werden geladen';
  const contribs=state.positions.map(marketDayContribution).filter(Number.isFinite);
  const dayEuro=contribs.length?contribs.reduce((a,b)=>a+b,0):null;
  const denom=valued.length?valued.reduce((a,p)=>a+positionValue(p),0):null;
  const day=Number.isFinite(dayEuro)&&denom?dayEuro/denom*100:null;
  $('#dayPct').textContent=pc(day);$('#dayPct').className=cls(day);
  $('#dayEuro').textContent=eur(dayEuro);$('#dayEuro').className=cls(dayEuro);
  const investedPositions=state.positions.filter(p=>Number.isFinite(p.purchasePrice));
  const allInvestedValued=investedPositions.length>0&&investedPositions.every(p=>Number.isFinite(positionValue(p)));
  const invested=investedPositions.reduce((sum,p)=>sum+p.purchasePrice*p.qty,0);
  const valuedInvestedTotal=allInvestedValued?investedPositions.reduce((sum,p)=>sum+positionValue(p),0):null;
  const gain=allInvestedValued?valuedInvestedTotal-invested:null;
  const gainPct=allInvestedValued&&invested?gain/invested*100:null;
  if($('#gainLossValue')){$('#gainLossValue').textContent=eur(gain);$('#gainLossValue').className=cls(gain)}
  if($('#gainLossPct')){$('#gainLossPct').textContent=allInvestedValued?pc(gainPct):'Warten auf vollständige Kursdaten';$('#gainLossPct').className=cls(gainPct)}
  if($('#chartHeadline')){$('#chartHeadline').textContent=pc(day);$('#chartHeadline').className=cls(day)}
  const refDate=state.settings.sbrokerReferenceUpdatedAt?new Date(state.settings.sbrokerReferenceUpdatedAt).toLocaleString('de-DE',{dateStyle:'short',timeStyle:'short'}):'Datum unbekannt';
  const deviation=Number.isFinite(sb)&&Number.isFinite(state.settings.sbrokerReference)?sb-state.settings.sbrokerReference:null;
  $('#valuationNote').textContent=Number.isFinite(state.settings.sbrokerReference)?`S Broker Referenz (manuell, ${refDate}) ${eur(state.settings.sbrokerReference)} · Abweichung ${eur(deviation)}`:'Bewertung: manueller Brokerkurs hat Vorrang, sonst aktueller Delayed-Snapshot';
  renderMarketToday();renderOverviewPositions();renderReconciliationSummary();renderDiagnostics();renderPositions();renderAnalysis();renderBrokerComparison();renderManage();renderCourseManager();renderTransactions()
}

function renderReconciliationSummary(){
  const box=$('#reconciliationSummary');if(!box)return;
  const appTotal=brokerTotal('sBroker'),ref=state.settings.sbrokerReference;
  const gap=Number.isFinite(appTotal)&&Number.isFinite(ref)?appTotal-ref:null;
  const positions=state.positions.filter(p=>p.broker==='sBroker');
  const known=positions.filter(p=>Number.isFinite(brokerPositionValue(p))).length;
  const ranked=positions.map(p=>({p,priority:positionPriority(p)})).sort((a,b)=>b.priority.score-a.priority.score).slice(0,3);
  box.innerHTML=`<div>
    <span class="panel-kicker">DEPOT-ABGLEICH</span>
    <h3>${eur(gap)} Abweichung</h3>
    <p>App ${eur(appTotal)} gegenüber S Broker ${eur(ref)} · ${known}/${positions.length} Positionswerte geprüft.</p>
    <div class="mini-priority-list">${ranked.map((x,i)=>`<span>${i+1}. ${x.p.name}</span>`).join('')}</div>
  </div>
  <button class="secondary-action">Top-Verursacher prüfen</button>`;
  box.querySelector('button').onclick=()=>showPage('analysis')
}


function renderDiagnostics(){
  const box=$('#diagnosticsContent');if(!box)return;
  const sBrokerPositions=state.positions.filter(p=>p.broker==='sBroker');
  const calculated=sBrokerPositions.map(p=>positionValue(p)).filter(Number.isFinite);
  const calculatedSum=calculated.reduce((a,b)=>a+b,0);
  const currentRef=state.settings.sbrokerReference;
  const oldKeys=LEGACY_STORES.filter(k=>Boolean(localStorage.getItem(k)));
  box.innerHTML=`<div class="diagnostic-grid">
    <span>Geöffnete Adresse<b>${location.hostname}</b></span>
    <span>Feste Produktionsadresse<b>${CANONICAL_HOST}</b></span>
    <span>Aktiver Speicher<b>${STORE}</b></span>
    <span>S-Broker-Referenz<b>${eur(currentRef)}</b></span>
    <span>Referenz gespeichert<b>${state.settings.sbrokerReferenceUpdatedAt?new Date(state.settings.sbrokerReferenceUpdatedAt).toLocaleString('de-DE'):'Nein'}</b></span>
    <span>Summe S-Broker-Positionen<b>${eur(calculated.length?calculatedSum:null)}</b></span>
    <span>Bewertete Positionen<b>${calculated.length}/${sBrokerPositions.length}</b></span>
    <span>Kursdaten geladen<b>${Object.values(state.data).filter(x=>x?.ok).length}/${state.positions.length}</b></span>
    <span>Alte Speicher auf dieser Adresse<b>${oldKeys.length?oldKeys.join(', '):'keine'}</b></span>
  </div>
  <p class="diagnostic-note">Nur zur Fehlersuche. Vorschauadressen werden automatisch auf die feste Produktionsadresse umgeleitet, damit Eingaben erhalten bleiben.</p>`
}

function renderOverviewPositions(){const box=$('#overviewPositions');if(!box)return;const rows=state.positions.map(p=>({p,value:positionValue(p),pct:state.data[p.id]?.performance?.day?.pct})).sort((a,b)=>(b.value||0)-(a.value||0)).slice(0,5);box.innerHTML=rows.map(x=>`<div class="compact-position"><div><b>${x.p.name}</b><small>${x.p.qty.toLocaleString('de-DE')} Stück · ${x.p.broker}</small></div><div class="value-col"><b>${eur(x.value)}</b><small class="${cls(x.pct)}">${pc(x.pct)}</small></div></div>`).join('')}
function renderMarketToday(){const rows=state.positions.map(p=>({p,v:marketDayContribution(p),pct:state.data[p.id]?.performance?.day?.pct})).filter(x=>Number.isFinite(x.v)).sort((a,b)=>b.v-a.v);if(!rows.length){$('#marketToday').innerHTML='<p class="muted">Nach der ersten Aktualisierung verfügbar.</p>';return}const top=rows.slice(0,2),bottom=[...rows].sort((a,b)=>a.v-b.v).slice(0,2);$('#marketToday').innerHTML=[...top,...bottom].map(x=>`<div class="market-row"><div><b>${x.p.name}</b><small class="muted">${pc(x.pct)}</small></div><strong class="${cls(x.v)}">${eur(x.v)}</strong></div>`).join('')}
function renderPositions(){$('#positionList').innerHTML=['sBroker','Trade Republic'].map(broker=>{const ps=state.positions.filter(p=>p.broker===broker);if(!ps.length)return '';return `<h3 class="broker-title">${broker}</h3>`+ps.map(p=>{const d=state.data[p.id],manual=brokerPrice(p),price=valuationPrice(p),val=positionValue(p),perf=d?.performance||{},status=d?.ok?'ok':Number.isFinite(manual)?'warn':d?'error':'warn',statusText=d?.ok?(Number.isFinite(manual)?'Brokerkurs + EOD-Historie':(d?.sourceMeta?.provider?.startsWith('DB_')?'Börse 15 Min geladen':'Kurs geladen')):Number.isFinite(manual)?'Nur Brokerkurs':d?.error||'Noch nicht geladen';return `<article class="position-card"><div class="position-summary"><div><h3>${p.name}</h3><p>${p.qty.toLocaleString('de-DE')} Stück · ${p.isin}${p.wkn?` · ${p.wkn}`:''}</p><span class="badge ${status}">${statusText}</span></div><div class="price"><strong>${eur(price,price<20?3:2)}</strong><small>${eur(val)}</small></div></div><div class="position-details"><div class="meta-grid"><div class="meta-box"><span>Broker</span><strong>${p.broker}</strong></div><div class="meta-box"><span>Broker-Anzeigequelle</span><strong>${p.brokerDisplaySource||'–'}</strong></div><div class="meta-box"><span>Feste Analysebörse</span><strong>${p.analysisVenue||'–'}</strong></div><div class="meta-box"><span>Alternativen / Datenquelle</span><strong>${(p.fallbackVenues||[]).join(' → ')||'–'}<br>${p.dataSource}${p.marketSymbol?` · ${p.marketSymbol}`:''}</strong></div></div><div class="perf-grid">${[['Tag',perf.day],['Woche',perf.week],['Monat',perf.month],['3 Monate',perf.threeMonths],['1 Jahr',perf.year]].map(([n,x])=>{const available=Number.isFinite(x?.pct)&&Number.isFinite(x?.basePrice)&&x?.baseDate;return `<div class="perf-box${available?'':' unavailable'}"><span>${n}</span>${available?`<strong class="${cls(x.pct)}">${pc(x.pct)}</strong><small>${x.baseDate} · ${eur(x.basePrice,3)}</small>`:`<strong>–</strong><small>${n==='1 Jahr'?'Noch keine vollständigen 1-Jahres-Daten':'Keine Daten verfügbar'}</small>`}</div>`}).join('')}</div><div class="chart-wrap">${chartSvg(d?.chart)}</div><div class="source">${d?.source||d?.error||'Noch keine Marktdaten'}${d?.latest?`<br>Kursstand: ${d.latest.date}`:''}${Number.isFinite(manual)?`<br>Aktuelle Bewertung mit Brokerkurs: ${eur(manual,3)}`:''}${Number.isFinite(p.purchasePrice)?`<br>Kaufkurs: ${eur(p.purchasePrice,3)} · Gewinn/Verlust ${pc((price/p.purchasePrice-1)*100)}`:''}</div></div></article>`}).join('')}).join('');$$('.position-summary').forEach(x=>x.onclick=()=>x.parentElement.classList.toggle('open'))}
function renderAnalysis(){const rows=state.positions.map(p=>({p,v:marketDayContribution(p)})).filter(x=>Number.isFinite(x.v)).sort((a,b)=>Math.abs(b.v)-Math.abs(a.v));$('#contributors').innerHTML=rows.length?rows.map(x=>`<div class="market-row"><div><b>${x.p.name}</b><small class="muted">EOD-Tagesbeitrag · Schlusskurs gegen Vortag</small></div><strong class="${cls(x.v)}">${eur(x.v)}</strong></div>`).join(''):'<p class="muted">Nach der ersten Aktualisierung verfügbar.</p>';$('#diagnostics').innerHTML=state.positions.map(p=>{const d=state.data[p.id],manual=brokerPrice(p),latest=d?.latest?.price,prev=d?.performance?.day?.basePrice,appPrice=valuationPrice(p),delta=Number.isFinite(manual)&&Number.isFinite(latest)?manual-latest:null;let status=d?.ok?'EOD geladen':Number.isFinite(manual)?'Nur Brokerkurs':d?.error||'Noch nicht geladen';let klass=d?.ok?'positive':d?.error?'negative':'warn';return `<div class="diagnostic-card"><div class="diag-title"><div><b>${p.name}</b><small>${p.qty.toLocaleString('de-DE')} Stück · ${p.broker}</small></div><strong class="${klass}">${status}</strong></div><div class="diag-grid"><span>Broker-Anzeigequelle (Info)<b>${p.brokerDisplaySource||'–'}</b></span><span>Feste Analysebörse<b>${p.analysisVenue||'–'}</b></span><span>Tatsächlich verwendete Analysebörse<b>${d?.usedVenue||'–'}</b></span><span>Tatsächliche EODHD-Reihe<b>${d?.symbol||p.marketSymbol||'–'}</b></span><span>Kursdatum<b>${d?.latest?.date||'–'}</b></span><span>EOD-Schlusskurs<b>${eur(latest,3)}</b></span><span>Vortagesschluss<b>${eur(prev,3)}</b></span><span>EOD-Tagesänderung<b class="${cls(d?.performance?.day?.pct)}">${pc(d?.performance?.day?.pct)}</b></span><span>Bewertungskurs der App<b>${eur(appPrice,3)}</b></span><span>Manueller Brokerkurs<b>${eur(manual,3)}</b></span><span>Differenz Broker/EOD<b class="${cls(delta)}">${eur(delta,3)}</b></span><span>Tagesbeitrag EOD<b class="${cls(marketDayContribution(p))}">${eur(marketDayContribution(p))}</b></span></div><p class="diagnostic-note">${d?.venueWarning||'Der Handelsplatz steuert den Abruf automatisch. Unterstützt sind Xetra, Frankfurt, Stuttgart, Euronext Paris/Amsterdam und US. Tradegate, gettex sowie Lang & Schwarz benötigen weiterhin einen manuellen Brokerkurs.'}</p></div>`}).join('')}


function positionPriority(p){
  const value=positionValue(p);
  const analysis=appEodValue(p);
  const brokerVal=brokerPositionValue(p);
  const day=Math.abs(marketDayContribution(p)||0);
  const brokerGap=Number.isFinite(brokerVal)&&Number.isFinite(value)?Math.abs(value-brokerVal):0;
  const venueRisk=(p.brokerDisplaySource&&p.analysisVenue&&p.brokerDisplaySource!==p.analysisVenue)?1:0;
  const missingBroker=Number.isFinite(brokerVal)?0:1;
  const missingCourse=Number.isFinite(value)?0:1;
  const weight=Math.abs(value||analysis||0);

  // Gewichtung:
  // 45 % Positionsgröße, 25 % bekannte Brokerabweichung,
  // 15 % Tagesbewegung, 10 % Quellenrisiko, 5 % Datenlücke.
  const score=
    Math.min(weight/60000,1)*45+
    Math.min(brokerGap/2000,1)*25+
    Math.min(day/700,1)*15+
    venueRisk*10+
    (missingBroker||missingCourse)*5;

  const reasons=[];
  if(weight>=25000)reasons.push('hoher Depotanteil');
  if(brokerGap>=250)reasons.push(`bekannte Abweichung ${eur(brokerGap)}`);
  if(day>=250)reasons.push(`starker Tagesbeitrag ${eur(day)}`);
  if(venueRisk)reasons.push('Brokerquelle und Analysebörse weichen ab');
  if(missingBroker)reasons.push('Broker-Positionswert fehlt');
  if(missingCourse)reasons.push('Bewertungskurs fehlt');

  return {
    score:Math.round(score),
    reasons:reasons.length?reasons:['geringere Priorität'],
    brokerGap,
    weight,
    day
  }
}

function priorityLabel(score){
  if(score>=75)return {text:'Priorität 1',level:'bad'};
  if(score>=50)return {text:'Priorität 2',level:'warn'};
  if(score>=30)return {text:'Priorität 3',level:'ok'};
  return {text:'später prüfen',level:'muted'}
}

function renderBrokerComparison(){
  const box=$('#brokerComparison');if(!box)return;
  const rows=state.positions.filter(p=>p.broker==='sBroker').map(p=>{
    const brokerVal=brokerPositionValue(p),analysisVal=appEodValue(p),usedVal=positionValue(p);
    const diffUsed=Number.isFinite(brokerVal)&&Number.isFinite(usedVal)?usedVal-brokerVal:null;
    const priority=positionPriority(p);
    return {p,brokerVal,analysisVal,usedVal,diffUsed,priority}
  }).sort((a,b)=>b.priority.score-a.priority.score);

  const known=rows.filter(x=>Number.isFinite(x.brokerVal));
  const unknown=rows.filter(x=>!Number.isFinite(x.brokerVal));
  const reference=state.settings.sbrokerReference,appTotal=brokerTotal('sBroker');
  const totalGap=Number.isFinite(reference)&&Number.isFinite(appTotal)?appTotal-reference:null;
  const knownBrokerSum=known.reduce((a,x)=>a+x.brokerVal,0);
  const knownAppSum=known.reduce((a,x)=>a+(Number.isFinite(x.usedVal)?x.usedVal:0),0);
  const unknownAppSum=unknown.reduce((a,x)=>a+(Number.isFinite(x.usedVal)?x.usedVal:0),0);
  const residual=Number.isFinite(reference)?reference-knownBrokerSum-unknownAppSum:null;
  const top=rows.slice(0,3);

  box.innerHTML=`<div class="comparison-summary reconciliation-summary">
    <span>Aktueller App-Wert <b>${eur(appTotal)}</b></span>
    <span>S-Broker-Referenz <b>${eur(reference)}</b></span>
    <span>Gesamtabweichung <b class="${cls(totalGap)}">${eur(totalGap)}</b></span>
    <span>Positionswerte erfasst <b>${known.length}/${rows.length}</b></span>
    <span>Bereits erklärter Anteil <b class="${cls(knownAppSum-knownBrokerSum)}">${eur(knownAppSum-knownBrokerSum)}</b></span>
    <span>Noch ungeklärter Rest <b class="${cls(-residual)}">${eur(-residual)}</b></span>
  </div>

  <div class="priority-box">
    <div class="panel-head">
      <div><span class="panel-kicker">SCHNELLPRÜFUNG</span><h4>Diese drei Positionen zuerst prüfen</h4></div>
    </div>
    ${top.map((x,i)=>{
      const label=priorityLabel(x.priority.score);
      return `<div class="priority-row">
        <span class="priority-rank">${i+1}</span>
        <div><b>${x.p.name}</b><small>${x.priority.reasons.join(' · ')}</small></div>
        <span class="course-status ${label.level}">${label.text} · ${x.priority.score}</span>
      </div>`
    }).join('')}
  </div>

  <p class="diagnostic-note">Die Reihenfolge berücksichtigt Depotgröße, bekannte Abweichung, Tagesbewegung, Quellenrisiko und fehlende Brokerwerte. So müssen zuerst nur die wahrscheinlichsten Verursacher geprüft werden.</p>`+
  rows.map(x=>{
    const label=priorityLabel(x.priority.score);
    return `<div class="comparison-row ${Number.isFinite(x.brokerVal)?'known':'unknown'}">
      <div>
        <b>${x.p.name}</b>
        <small>${x.p.qty.toLocaleString('de-DE')} Stück · ${x.p.isin}</small>
        <small>${x.priority.reasons.join(' · ')}</small>
      </div>
      <div class="comparison-values">
        <span>Prüfpriorität <b class="course-status ${label.level}">${x.priority.score}/100</b></span>
        <span>Brokerwert <b>${eur(x.brokerVal)}</b></span>
        <span>App-Bewertung <b>${eur(x.usedVal)}</b></span>
        <span>Analyse-EOD <b>${eur(x.analysisVal)}</b></span>
        <span>Abweichung <b class="${cls(x.diffUsed)}">${eur(x.diffUsed)}</b></span>
        <span>Status <b>${Number.isFinite(x.brokerVal)?'geprüft':'Brokerwert fehlt'}</b></span>
      </div>
    </div>`
  }).join('');
}

function renderManage(){['newVenue'].forEach(id=>$('#'+id).innerHTML=venueOptions('Xetra'));$('#sbrokerReference').value=state.settings.sbrokerReference?.toLocaleString('de-DE')||'';$('#trReference').value=state.settings.trReference?.toLocaleString('de-DE')||'';$('#positionEditors').innerHTML=state.positions.map(p=>`<div class="editor-card" data-id="${p.id}"><div class="editor-head"><b>${p.name}</b><button class="danger archive-btn" data-id="${p.id}">Archivieren</button></div><div class="editor-grid"><label>Name<input data-field="name" value="${p.name}"></label><label>ISIN<input data-field="isin" value="${p.isin}"></label><label>WKN<input data-field="wkn" value="${p.wkn||''}"></label><label>Stückzahl<input data-field="qty" inputmode="decimal" value="${p.qty}"></label><label>Kaufkurs<input data-field="purchasePrice" inputmode="decimal" value="${Number.isFinite(p.purchasePrice)?String(p.purchasePrice).replace('.',','):''}"></label><label>Broker<select data-field="broker"><option ${p.broker==='sBroker'?'selected':''}>sBroker</option><option ${p.broker==='Trade Republic'?'selected':''}>Trade Republic</option></select></label><label>Broker-Anzeigequelle (nur Info)<input data-field="brokerDisplaySource" value="${p.brokerDisplaySource||''}" placeholder="Quotrix, L&S, Société Générale"></label><label>Feste Analysebörse<select data-field="analysisVenue">${venueOptions(p.analysisVenue)}</select></label><label>Analyse-Ersatzbörsen<input data-field="fallbackVenues" value="${(p.fallbackVenues||[]).filter(v=>EODHD_VENUE_CODES[v]).join(', ')}" placeholder="Frankfurt, Stuttgart"></label><label>Datenquelle<select data-field="dataSource"><option value="EODHD" ${p.dataSource==='EODHD'?'selected':''}>EODHD</option><option value="MANUAL" ${p.dataSource==='MANUAL'?'selected':''}>Nur Brokerkurs</option></select></label><label>Festes Analyse-Symbol<input data-field="analysisSymbol" value="${p.analysisSymbol||p.marketSymbol||''}"></label><label>Xetra-Symbol<input data-venue-symbol="Xetra" value="${p.venueSymbols?.Xetra||''}"></label><label>Frankfurt-Symbol<input data-venue-symbol="Frankfurt" value="${p.venueSymbols?.Frankfurt||''}"></label><label>Stuttgart-Symbol<input data-venue-symbol="Stuttgart" value="${p.venueSymbols?.Stuttgart||''}"></label></div></div>`).join('');$('#brokerPositionValueInputs').innerHTML=state.positions.map(p=>`<div class="broker-line"><div><b>${p.name}</b><small>${p.qty.toLocaleString('de-DE')} Stück · App EOD ${eur(appEodValue(p))}</small></div><input class="broker-position-value-input" data-id="${p.id}" inputmode="decimal" placeholder="Positionswert €" value="${Number.isFinite(brokerPositionValue(p))?String(brokerPositionValue(p)).replace('.',','):''}"></div>`).join('');$('#brokerPriceInputs').innerHTML=state.positions.map(p=>`<div class="broker-line"><div><b>${p.name}</b><small>${p.qty} Stück · Brokeranzeige ${p.brokerDisplaySource||'–'} · Analyse ${p.analysisVenue||'–'}</small></div><input class="broker-input" data-id="${p.id}" inputmode="decimal" placeholder="Kurs" value="${Number.isFinite(state.settings.brokerPrices[p.id])?String(state.settings.brokerPrices[p.id]).replace('.',','):''}"></div>`).join('');$('#archiveList').innerHTML=state.archive.length?state.archive.map(p=>`<div class="archive-row"><div><b>${p.name}</b><small class="muted">${p.isin} · ${p.archiveReason||'archiviert'}</small></div><button class="secondary restore-btn" data-id="${p.id}">Wiederherstellen</button></div>`).join(''):'<p class="muted">Keine archivierten Positionen.</p>';$$('.archive-btn').forEach(b=>b.onclick=()=>archivePosition(b.dataset.id));$$('.restore-btn').forEach(b=>b.onclick=()=>restorePosition(b.dataset.id))}
function archivePosition(id){const i=state.positions.findIndex(p=>p.id===id);if(i<0)return;const [p]=state.positions.splice(i,1);p.archiveReason=prompt('Grund für Archivierung/Verkauf?','verkauft')||'archiviert';p.archivedAt=new Date().toISOString();state.archive.push(p);delete state.settings.brokerPrices[id];save();render();toast('Position archiviert')}
function restorePosition(id){const i=state.archive.findIndex(p=>p.id===id);if(i<0)return;const [p]=state.archive.splice(i,1);delete p.archiveReason;delete p.archivedAt;state.positions.push(p);save();render();toast('Position wiederhergestellt')}

function transactionOptions(){return state.positions.map(p=>`<option value="${p.id}">${p.name} · ${p.qty.toLocaleString('de-DE')} Stück</option>`).join('')}
function renderTransactions(){
  const select=$('#txPosition'); if(select){const old=select.value;select.innerHTML=transactionOptions();if(old)select.value=old}
  const box=$('#transactionList'); if(!box)return;
  box.innerHTML=state.transactions.length?[...state.transactions].sort((a,b)=>b.date.localeCompare(a.date)).map(t=>`<div class="archive-row"><div><b>${t.type==='BUY'?'Kauf':'Verkauf'} · ${t.name}</b><small class="muted">${new Date(t.date+'T12:00:00').toLocaleDateString('de-DE')} · ${t.qty.toLocaleString('de-DE')} Stück · ${eur(t.price,3)} · ${t.venue} · Gebühren ${eur(t.fees||0)}</small></div><strong class="${t.realized>=0?'positive':'negative'}">${t.type==='SELL'&&Number.isFinite(t.realized)?eur(t.realized):eur(t.qty*t.price+(t.fees||0))}</strong></div>`).join(''):'<p class="muted">Noch keine Käufe oder Verkäufe erfasst.</p>'
}
function recordTransaction(){
 const id=$('#txPosition').value,type=$('#txType').value,date=$('#txDate').value,qty=parseNum($('#txQty').value),price=parseNum($('#txPrice').value),fees=parseNum($('#txFees').value)||0,venue=$('#txVenue').value;
 const p=state.positions.find(x=>x.id===id);if(!p||!date||!Number.isFinite(qty)||qty<=0||!Number.isFinite(price)||price<=0){toast('Datum, Stückzahl und Kurs vollständig eingeben');return}
 if(type==='SELL'&&qty>p.qty){toast('Verkauf übersteigt den aktuellen Bestand');return}
 const oldQty=p.qty,oldPurchase=p.purchasePrice;
 let realized=null;
 if(type==='BUY'){
   const oldCost=Number.isFinite(oldPurchase)?oldQty*oldPurchase:0;
   p.qty=oldQty+qty;p.purchasePrice=(oldCost+qty*price+fees)/p.qty;
 } else {
   realized=Number.isFinite(oldPurchase)?qty*(price-oldPurchase)-fees:null;
   p.qty=oldQty-qty;
   if(p.qty===0){p.archiveReason='vollständig verkauft';p.archivedAt=new Date().toISOString();state.archive.push({...p});state.positions=state.positions.filter(x=>x.id!==p.id);delete state.settings.brokerPrices[p.id]}
 }
 state.transactions.push({id:uid(),type,date,positionId:id,name:p.name,isin:p.isin,qty,price,fees,venue,realized,createdAt:new Date().toISOString()});save();render();toast(type==='BUY'?'Kauf erfasst':'Verkauf erfasst')
}
async function fetchJsonWithTimeout(url,options={},timeoutMs=20000){
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),timeoutMs);
  try{
    const response=await fetch(url,{...options,signal:controller.signal,cache:'no-store'});
    const text=await response.text();
    let body=null;
    try{body=JSON.parse(text)}catch{body={ok:false,error:`Ungültige Serverantwort (${response.status})`,raw:text.slice(0,300)}}
    return {response,body}
  }catch(error){
    if(error?.name==='AbortError')throw new Error(`Zeitüberschreitung nach ${Math.round(timeoutMs/1000)} Sekunden`);
    throw error
  }finally{clearTimeout(timer)}
}
function showDiagnostic(title,lines,kind='info'){
  const panel=$('#diagnosticPanel');
  if(!panel)return;
  panel.hidden=false;
  panel.className=`diagnostic-panel ${kind}`;
  panel.innerHTML=`<div class="diagnostic-title">${title}</div>${lines.map(x=>`<div class="diagnostic-line">${x}</div>`).join('')}`;
  panel.scrollIntoView({behavior:'smooth',block:'center'});
}
async function runSystemDiagnosis(){
  const button=$('#diagnoseBtn');if(button){button.disabled=true;button.textContent='Prüfung läuft …'}
  try{
    const health=await fetchJsonWithTimeout('/api/health',{},8000);
    let snap=null;try{snap=await dbGetSnapshot()}catch{}
    const valid=Object.keys(snap?.items||{}).length;
    showDiagnostic('Systemprüfung abgeschlossen',[
      `App-Version: ${APP_VERSION}`,
      `Vercel-Funktion: ${health.response.ok?'erreichbar':'Fehler '+health.response.status}`,
      `Persistenter iPhone-Snapshot: ${valid} Kursreihen`,
      `Snapshot-Stand: ${snap?.generatedAt||snap?.savedAt||'noch leer'}`,
      `Speicher: ${'indexedDB' in window?'IndexedDB aktiv':'localStorage-Fallback'}`,
      'Kursweg: Instrument-Master → Xetra Pre-Trade → Xetra Post-Trade → Tradegate/Frankfurt Fallback → Snapshot → Anzeige',
      'Die Diagnose selbst startet keinen Börsenabruf.'
    ],health.response.ok?'success':'error')
  }catch(error){showDiagnostic('Systemprüfung abgebrochen',[`App-Version: ${APP_VERSION}`,`Fehler: ${error.message||String(error)}`],'error')}
  finally{if(button){button.disabled=false;button.textContent='Systemprüfung starten'}}
}
async function fetchTrilogyQuote(){
  const p=state.positions.find(x=>x.id==='trilogy');
  if(!p)return null;
  try{
    const {response,body}=await fetchJsonWithTimeout('/api/trilogy-quote',{},10000);
    if(!response.ok||!body?.ok||!Number.isFinite(Number(body.price)))return null;
    return {
      id:p.id,ok:true,
      latest:{price:Number(body.price),date:String(body.asOf||new Date().toISOString()).slice(0,10)},
      source:body.source||'Yahoo Finance · NYSE American TMQ',
      usedVenue:body.venue||'NYSE American',currency:'EUR',
      quote:{last:Number(body.price),method:'last+fx'},
      sourceMeta:{provider:'TRILOGY_YAHOO',delayedMinutes:body.delayedMinutes??0,asOf:body.asOf||null,officialFile:null,matchedBy:'TMQ + EURUSD FX',priceUsd:body.priceUsd,eurUsd:body.eurUsd}
    };
  }catch{return null}
}
async function refresh(){
  const b=$('#refreshBtn');b.disabled=true;b.textContent='…';
  showDiagnostic('Market Data Core läuft',[
    'Schritt 1: Instrumente eindeutig auflösen.',
    'Schritt 2: Pre-/Post-Trade und Fallback-Feeds verarbeiten.',
    'Schritt 3: vollständigen Snapshot speichern.',
    'Schritt 4: Anzeige ausschließlich aus dem gespeicherten Snapshot aufbauen.'
  ]);
  try{
    const positions=state.positions.filter(p=>p.dataSource==='DB_DELAYED').map(p=>({id:p.id,name:p.name,isin:p.isin,wkn:p.wkn||'',mnemonic:p.analysisSymbol||p.marketSymbol||'',currency:p.currency||'EUR'}));
    const {response:r,body:x}=await fetchJsonWithTimeout('/api/market-data-v2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({positions})},30000);
    if(!r.ok||!x.ok)throw new Error(x.error||`Market Data Core fehlgeschlagen (${r.status})`);
    const trilogy=await fetchTrilogyQuote();
    if(trilogy){
      x.results=[...(x.results||[]),trilogy];
      x.coverage={...(x.coverage||{}),tradeRepublic:1};
    }else{
      x.coverage={...(x.coverage||{}),tradeRepublic:0};
      x.diagnostics={...(x.diagnostics||{}),missing:[...(x.diagnostics?.missing||[]),{id:'trilogy',name:'Trilogy Metals',isin:'CA89621C1059',source:'Trade Republic / TMQ'}]};
    }
    const requestedIds=[...positions.map(p=>p.id),'trilogy'];
    const {stored,mode}=await persistAndApplySnapshot({...x,provider:'Market Data Core 5.5.2 · Deutsche Börse + Trilogy TMQ',requestedIds});
    // read-after-write gate: UI consumes what was actually persisted, never transient response data
    await restorePersistedMarketSnapshot();render();
    const good=Object.keys(stored.items||{}).length,total=positions.length+1;
    const cov=x.coverage||{};
    showDiagnostic(good===total?'Market Snapshot vollständig':'Market Snapshot unvollständig',[
      `Erfolgreich gespeichert: ${good}/${total}`,
      `Instrument-Master: ${cov.instrumentMasterResolved??0}/${total}`,
      `Xetra Pre-Trade: ${cov.xetraPretrade??0}`,
      `Xetra Post-Trade: ${cov.xetraPosttrade??0}`,
      `Tradegate/Frankfurt Fallback: ${(cov.tradegate??0)+(cov.frankfurt??0)}`,
      `Trade Republic · Trilogy Metals: ${cov.tradeRepublic??0}/1`,
      `Speicher bestätigt: ${mode}`,
      `Generation: ${stored.generationId}`,
      `Stand: ${stored.generatedAt}`,
      ...(x.diagnostics?.missing?.length?[`Fehlend: ${x.diagnostics.missing.map(v=>v.name).join(', ')}`]:[])
    ],good===total?'success':'error');
    toast(`${good}/${total} Kurse im Snapshot gespeichert`)
  }catch(err){
    await restorePersistedMarketSnapshot();render();
    showDiagnostic('Market Data Core fehlgeschlagen',[`Fehler: ${err.message||String(err)}`,'Der zuletzt erfolgreich gespeicherte Snapshot bleibt unverändert.'],'error');toast('Kurs-Synchronisierung fehlgeschlagen')
  }finally{b.disabled=false;b.textContent='↻'}
}
function showPage(page){
  const titles={overview:'Übersicht',positions:'Positionen',transaction:'Transaktion',analysis:'Analyse',manage:'Einstellungen'};
  $$('.bottom-nav button').forEach(x=>x.classList.toggle('active',x.dataset.page===page));
  $$('.page').forEach(x=>x.classList.remove('active'));
  $('#'+page)?.classList.add('active');
  const title=$('#pageTitle'); if(title) title.textContent=titles[page]||'Depot-Cockpit';
  const tabs=document.querySelector('.broker-tabs'); if(tabs) tabs.hidden=!['overview','positions'].includes(page);
  document.body.dataset.page=page;
  scrollTo({top:0,behavior:'smooth'});
}

function setActiveButton(button,selector){
  document.querySelectorAll(selector).forEach(x=>x.classList.remove('active'));
  button.classList.add('active');
}
function bindClickableGroup(selector,callback){
  document.querySelectorAll(selector).forEach(button=>{
    button.onclick=()=>{
      setActiveButton(button,selector);
      callback(button.dataset.value||button.dataset.tab||button.textContent.trim());
    };
  });
}
function applyPerformanceFilter(label){
  const key=String(label||'').toLowerCase().trim();
  document.querySelectorAll('[data-performance-section]').forEach(section=>{
    const sectionKey=String(section.dataset.performanceSection||'').toLowerCase();
    section.hidden=!(key==='performance'||sectionKey===key);
  });
}
function applyPositionFilter(label){
  const key=String(label||'').toLowerCase().trim();
  document.querySelectorAll('.position-card').forEach(card=>{
    const type=String(card.dataset.assetType||card.dataset.type||'').toLowerCase();
    card.hidden=!(key==='alle'||!key||type.includes(key.replace('etfs','etf').replace('aktien','aktie').replace('rohstoffe','rohstoff')));
  });
}

function normalizeSearchText(v){
  return String(v||'').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu,'').trim()
}
function localInstrumentMaster(){
  const cached=readJsonStorage(INSTRUMENT_MASTER_CACHE,null);
  const seeded=state.positions.map(p=>({
    name:p.name,
    isin:p.isin,
    wkn:p.wkn||'',
    mnemonic:p.mnemonic||p.marketSymbol||'',
    type:p.assetType||p.type||'Wertpapier',
    currency:p.currency||'EUR',
    venue:p.analysisVenue||p.brokerVenue||'Xetra',
    source:'DEPOT'
  }));
  return cached?.items?.length?cached.items:seeded
}
async function searchInstrumentMaster(query){
  const q=normalizeSearchText(query);
  if(!q)return [];
  // 1) server-side instrument master if available
  try{
    const {response,body}=await fetchJsonWithTimeout(`/api/instrument-search?q=${encodeURIComponent(query)}`,{},8000);
    if(response.ok&&body?.ok&&Array.isArray(body.results)&&body.results.length){
      return body.results
    }
  }catch{}
  // 2) local fallback
  const items=localInstrumentMaster();
  return items.filter(item=>{
    const hay=[item.name,item.isin,item.wkn,item.mnemonic,item.type].map(normalizeSearchText).join(' ');
    return hay.includes(q)
  }).slice(0,20)
}
function selectedBuyInstrument(){
  return state.__selectedBuyInstrument||null
}
function setSelectedBuyInstrument(item){
  state.__selectedBuyInstrument=item||null;
  const box=$('#buyInstrumentSelected');
  if(!box)return;
  if(!item){
    box.innerHTML='<span class="muted">Noch kein Instrument gewählt. Freie Eingabe ist jederzeit möglich.</span>';
    return
  }
  box.innerHTML=`<div class="instrument-selected">
    <b>${item.name||'Unbenanntes Wertpapier'}</b>
    <span>${item.isin||'keine ISIN'} · ${item.wkn||'keine WKN'} · ${item.mnemonic||'kein Kürzel'}</span>
    <span>${item.type||'Wertpapier'} · ${item.currency||'EUR'} · ${item.venue||'Xetra'}</span>
  </div>`
}
async function runBuyInstrumentSearch(){
  const input=$('#buyInstrumentQuery');
  const resultsBox=$('#buyInstrumentResults');
  if(!input||!resultsBox)return;
  const query=input.value.trim();
  if(!query){
    resultsBox.innerHTML='<div class="search-empty">Bitte Name, ISIN, WKN oder Kürzel eingeben.</div>';
    return
  }
  resultsBox.innerHTML='<div class="search-empty">Suche läuft …</div>';
  const results=await searchInstrumentMaster(query);
  if(!results.length){
    resultsBox.innerHTML=`<div class="search-empty">
      Kein Treffer im Instrument-Master. Du kannst das Papier trotzdem frei anlegen.
      <button type="button" id="useFreeEntryBtn" class="secondary">Freie Eingabe verwenden</button>
    </div>`;
    $('#useFreeEntryBtn').onclick=()=>{
      setSelectedBuyInstrument({
        name:query,isin:'',wkn:'',mnemonic:'',type:'Wertpapier',currency:'EUR',venue:'Manuell',source:'MANUAL'
      });
      resultsBox.innerHTML='';
      syncBuyFieldsFromInstrument(selectedBuyInstrument());
    };
    return
  }
  resultsBox.innerHTML=results.map((item,i)=>`<button type="button" class="instrument-result" data-instrument-index="${i}">
    <b>${item.name||'Unbenannt'}</b>
    <span>${item.isin||'–'} · ${item.wkn||'–'} · ${item.mnemonic||'–'}</span>
    <span>${item.type||'Wertpapier'} · ${item.currency||'EUR'} · ${item.venue||'Xetra'}</span>
  </button>`).join('');
  resultsBox.querySelectorAll('[data-instrument-index]').forEach(btn=>{
    btn.onclick=()=>{
      const item=results[Number(btn.dataset.instrumentIndex)];
      setSelectedBuyInstrument(item);
      syncBuyFieldsFromInstrument(item);
      resultsBox.innerHTML='';
    }
  })
}
function syncBuyFieldsFromInstrument(item){
  if(!item)return;
  const mapping={
    buyName:item.name||'',
    buyIsin:item.isin||'',
    buyWkn:item.wkn||'',
    buyMnemonic:item.mnemonic||'',
    buyType:item.type||'Wertpapier',
    buyCurrency:item.currency||'EUR',
    buyVenue:item.venue||'Xetra'
  };
  for(const [id,value] of Object.entries(mapping)){
    const el=document.getElementById(id);
    if(el&&!el.value)el.value=value
  }
}
function collectOpenBuyInstrument(){
  const selected=selectedBuyInstrument()||{};
  const val=id=>document.getElementById(id)?.value?.trim()||'';
  return {
    name:val('buyName')||selected.name||'Unbenanntes Wertpapier',
    isin:val('buyIsin')||selected.isin||'',
    wkn:val('buyWkn')||selected.wkn||'',
    mnemonic:val('buyMnemonic')||selected.mnemonic||'',
    type:val('buyType')||selected.type||'Wertpapier',
    currency:val('buyCurrency')||selected.currency||'EUR',
    venue:val('buyVenue')||selected.venue||'Manuell',
    source:selected.source||'MANUAL'
  }
}
function ensureBoughtInstrumentInDepot(instrument,qty,price,fees,broker,date){
  let p=state.positions.find(x=>instrument.isin&&x.isin===instrument.isin);
  if(!p){
    p=normalizePosition({
      id:`custom-${Date.now()}`,
      name:instrument.name,
      isin:instrument.isin||`MANUAL-${Date.now()}`,
      wkn:instrument.wkn||'',
      mnemonic:instrument.mnemonic||'',
      assetType:instrument.type||'Wertpapier',
      type:instrument.type||'Wertpapier',
      qty:0,
      broker:broker||'sBroker',
      dataSource:instrument.source==='MANUAL'?'MANUAL':'XETRA_DELAYED',
      brokerDisplaySource:instrument.venue||'Manuell',
      analysisVenue:instrument.venue||'Xetra',
      analysisSymbol:instrument.mnemonic||'',
      marketSymbol:instrument.mnemonic||'',
      currency:instrument.currency||'EUR',
      purchasePrice:Number(price)||0,
      fallbackVenues:['Tradegate','Frankfurt']
    });
    state.positions.push(p)
  }
  p.qty=Number(p.qty||0)+Number(qty||0);
  if(Number(price)>0)p.purchasePrice=Number(price);
  state.transactions.unshift({
    id:`tx-${Date.now()}`,
    type:'BUY',
    date:date||new Date().toISOString().slice(0,10),
    positionId:p.id,
    name:p.name,
    isin:p.isin,
    qty:Number(qty||0),
    price:Number(price||0),
    fees:Number(fees||0),
    broker:broker||p.broker,
    instrumentMeta:instrument
  });
  save();
  render();
  return p
}
function wire(){
  const buySearchBtn=$('#buyInstrumentSearchBtn');
  const buyOpenBtn=$('#buyOpenInstrumentBtn');
  if(buyOpenBtn)buyOpenBtn.onclick=()=>{
    const instrument=collectOpenBuyInstrument();
    const num=id=>parseNum(document.getElementById(id)?.value);
    const qty=num('buyQty'),price=num('buyPrice'),fees=num('buyFees')||0;
    if(!Number.isFinite(qty)||qty<=0||!Number.isFinite(price)||price<=0){
      toast('Bitte Stückzahl und Kaufkurs eingeben');return
    }
    const broker=$('#buyBroker')?.value||'sBroker';
    const date=$('#buyDate')?.value||new Date().toISOString().slice(0,10);
    const p=ensureBoughtInstrumentInDepot(instrument,qty,price,fees,broker,date);
    toast(`${p.name} wurde dem Depot hinzugefügt`);
    setSelectedBuyInstrument(null);
  };

  if(buySearchBtn)buySearchBtn.onclick=runBuyInstrumentSearch;
  const buyQuery=$('#buyInstrumentQuery');
  if(buyQuery)buyQuery.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();runBuyInstrumentSearch()}});
$$('.bottom-nav button').forEach(b=>b.onclick=()=>showPage(b.dataset.page));$$('[data-target-page]').forEach(b=>b.onclick=()=>showPage(b.dataset.targetPage));$$('.transaction-type button').forEach(b=>b.onclick=()=>{$$('.transaction-type button').forEach(x=>x.classList.remove('active'));b.classList.add('active');$('#txType').value=b.dataset.tx});$$('.broker-tab').forEach(b=>b.onclick=()=>{$$('.broker-tab').forEach(x=>x.classList.remove('active'));b.classList.add('active');const filter=b.dataset.brokerFilter;$$('.position-card').forEach(c=>{const id=c.querySelector('.position-summary h3')?.textContent;const p=state.positions.find(x=>x.name===id);c.style.display=filter==='all'||p?.broker===filter?'':'none'})});$('#refreshBtn').onclick=refresh;$('#diagnoseBtn').onclick=runSystemDiagnosis;
  bindClickableGroup('[data-analysis-tab]',applyPerformanceFilter);
  bindClickableGroup('[data-position-filter]',applyPositionFilter);
  document.querySelectorAll('[data-open-all]').forEach(button=>{
    button.onclick=()=>{
      const cards=[...document.querySelectorAll('.position-card')];
      const shouldOpen=cards.some(card=>!card.classList.contains('expanded'));
      cards.forEach(card=>card.classList.toggle('expanded',shouldOpen));
      button.textContent=shouldOpen?'Alle schließen':'Alle öffnen';
    };
  });
$('#saveCourseManager').onclick=saveCourseManager;$('#testCourseManager').onclick=async()=>{saveCourseManager();await refresh();showPage('manage');document.querySelector('#courseManagerBlock')?.scrollIntoView({behavior:'smooth',block:'start'})};$('#recordTransaction').onclick=recordTransaction;$('#txDate').value=new Date().toISOString().slice(0,10);$('#txVenue').innerHTML=venueOptions('Tradegate');$('#expandAll').onclick=()=>{const cards=$$('.position-card'),all=cards.every(c=>c.classList.contains('open'));cards.forEach(c=>c.classList.toggle('open',!all));$('#expandAll').textContent=all?'Alle öffnen':'Alle schließen'};$('#saveReferences').onclick=()=>{const sbRef=parseNum($('#sbrokerReference').value);
state.settings.sbrokerReference=Number.isFinite(sbRef)&&sbRef>0?sbRef:null;
state.settings.sbrokerReferenceUpdatedAt=Number.isFinite(sbRef)&&sbRef>0?new Date().toISOString():null;
const trRef=parseNum($('#trReference').value);
state.settings.trReference=Number.isFinite(trRef)&&trRef>0?trRef:null;
state.settings.trReferenceUpdatedAt=Number.isFinite(trRef)&&trRef>0?new Date().toISOString():null;save();render();toast('Manuelle Broker-Referenzen gespeichert')};$('#saveBrokerPositionValues').onclick=()=>{$$('.broker-position-value-input').forEach(i=>{const p=state.positions.find(x=>x.id===i.dataset.id);const n=parseNum(i.value);if(Number.isFinite(n)&&p?.qty>0){state.settings.brokerPositionValues[p.id]=n;state.settings.brokerPrices[p.id]=n/p.qty}else{delete state.settings.brokerPositionValues[i.dataset.id]}});const sbVals=state.positions.filter(p=>p.broker==='sBroker').map(p=>brokerPositionValue(p)).filter(Number.isFinite);if(sbVals.length===state.positions.filter(p=>p.broker==='sBroker').length){state.settings.sbrokerReference=sbVals.reduce((a,b)=>a+b,0);state.settings.sbrokerReferenceUpdatedAt=new Date().toISOString()}save();render();toast('Broker-Positionswerte gespeichert')};$('#saveBrokerPrices').onclick=()=>{$$('.broker-input').forEach(i=>{const n=parseNum(i.value);if(Number.isFinite(n))state.settings.brokerPrices[i.dataset.id]=n;else delete state.settings.brokerPrices[i.dataset.id]});save();render();toast('Brokerkurse gespeichert')};$('#savePositionSettings').onclick=()=>{$$('.editor-card').forEach(card=>{const p=state.positions.find(x=>x.id===card.dataset.id);card.querySelectorAll('[data-field]').forEach(el=>{const f=el.dataset.field;let v=el.value;if(['qty','purchasePrice'].includes(f))v=parseNum(v);if(f==='fallbackVenues')v=String(v).split(',').map(x=>x.trim()).filter(Boolean);p[f]=v});p.venueSymbols={...(p.venueSymbols||{})};card.querySelectorAll('[data-venue-symbol]').forEach(el=>{const venue=el.dataset.venueSymbol;const value=el.value.trim();if(value)p.venueSymbols[venue]=value;else delete p.venueSymbols[venue]});p.marketSymbol=p.analysisSymbol||p.marketSymbol;normalizePosition(p)});save();render();toast('Stammdaten gespeichert')};$('#addPosition').onclick=()=>{const name=$('#newName').value.trim(),isin=$('#newIsin').value.trim().toUpperCase(),qty=parseNum($('#newQty').value);if(!name||!isin||!Number.isFinite(qty)){toast('Name, ISIN und Stückzahl fehlen');return}state.positions.push(normalizePosition({id:uid(),name,isin,wkn:$('#newWkn').value.trim().toUpperCase(),qty,purchasePrice:parseNum($('#newPurchasePrice').value),broker:$('#newBroker').value,brokerDisplaySource:$('#newVenue').value,analysisVenue:'Xetra',fallbackVenues:$('#newFallbackVenues').value.split(',').map(x=>x.trim()).filter(Boolean),dataSource:$('#newSource').value,analysisSymbol:$('#newSymbol').value.trim(),currency:'EUR'}));save();render();toast('Position hinzugefügt')};$('#exportBtn').onclick=()=>{const blob=new Blob([JSON.stringify({version:APP_VERSION,exportedAt:new Date().toISOString(),positions:state.positions,archive:state.archive,transactions:state.transactions,settings:state.settings},null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`depot-cockpit-sicherung-${new Date().toISOString().slice(0,10)}.json`;a.click();URL.revokeObjectURL(a.href)};$('#importInput').onchange=async e=>{try{const x=JSON.parse(await e.target.files[0].text());if(!Array.isArray(x.positions)||!x.settings)throw new Error();state.positions=x.positions;state.archive=x.archive||[];state.transactions=x.transactions||[];state.settings={...state.settings,...x.settings,brokerPrices:{...(x.settings.brokerPrices||{})},brokerPositionValues:{...(x.settings.brokerPositionValues||{})}};save();render();toast('Sicherung importiert')}catch{toast('Ungültige Sicherungsdatei')}};$('#resetBtn').onclick=()=>{if(confirm('Lokale Stammdaten, Brokerwerte und Archiv wirklich zurücksetzen?')){localStorage.removeItem(STORE);state.positions=structuredClone(DEFAULT_POSITIONS);state.archive=[];state.transactions=[];state.settings={sbrokerReference:null,sbrokerReferenceUpdatedAt:null,trReference:null,trReferenceUpdatedAt:null,brokerPrices:{},brokerPositionValues:{},venuePriority:['Tradegate','gettex','Lang & Schwarz','Xetra','Stuttgart','Frankfurt']};state.data={};render();toast('Lokale Daten zurückgesetzt')}}}
load();restorePersistedMarketSnapshot().then(()=>render());loadMarketCache();wire();render();
showPage('overview');

function applyBuildIdentity(){
  const version=document.getElementById('appVersionLabel');
  const stamp=document.getElementById('buildStamp');
  if(version)version.textContent=`DEPOT-COCKPIT · VERSION ${APP_VERSION}`;
  if(stamp)stamp.textContent=`BUILD ${APP_BUILD} · ${APP_BUILD_DATE}`;
  document.documentElement.dataset.appVersion=APP_VERSION;
  document.documentElement.dataset.appBuild=APP_BUILD;
}
applyBuildIdentity();
