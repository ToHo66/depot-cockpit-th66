'use strict';

const APP_VERSION='6.0.24-mobile24';
const STORE='th66-depot-cockpit-v6';
const SNAPSHOT_KEY='th66-depot-cockpit-v6-market-snapshot';
const TX_KEY='th66-depot-cockpit-v6-transactions';
const MASTER=Object.freeze([{"id":"allworld","name":"Vanguard FTSE All-World","isin":"IE00BK5BQT80","wkn":"A2PKXG","qty":327,"broker":"sBroker","brokerDisplaySource":"Société Générale","analysisVenue":"Xetra","fallbackVenues":["Tradegate","Frankfurt"],"dataSource":"DB_DELAYED","analysisSymbol":"VWCE","mnemonic":"VWCE","currency":"EUR","purchasePrice":157.422,"assetType":"ETF"},{"id":"defence","name":"Future of Defence","isin":"IE000OJ5TQP4","wkn":"A3EB9T","qty":1518,"broker":"sBroker","brokerDisplaySource":"Lang & Schwarz","analysisVenue":"Xetra","fallbackVenues":["Tradegate","Frankfurt"],"dataSource":"DB_DELAYED","analysisSymbol":"ASWC","mnemonic":"ASWC","currency":"EUR","purchasePrice":14.75,"assetType":"ETF"},{"id":"banks","name":"Amundi STOXX Europe 600 Banks","isin":"LU1834983477","wkn":"LYX01W","qty":310,"broker":"sBroker","brokerDisplaySource":"Lang & Schwarz","analysisVenue":"Xetra","fallbackVenues":["Tradegate","Frankfurt"],"dataSource":"DB_DELAYED","analysisSymbol":"LBNK","mnemonic":"LBNK","currency":"EUR","purchasePrice":45.115,"assetType":"ETF"},{"id":"metals","name":"iShares Essential Metals Producers","isin":"IE000ROSD5J6","wkn":"A3ERLP","qty":1850,"broker":"sBroker","brokerDisplaySource":"Lang & Schwarz","analysisVenue":"Xetra","fallbackVenues":["Tradegate","Frankfurt"],"dataSource":"DB_DELAYED","analysisSymbol":"CEBT","mnemonic":"CEBT","currency":"EUR","purchasePrice":7.093,"assetType":"ETF"},{"id":"worldit","name":"iShares MSCI World Information Technology","isin":"IE00BJ5JNY98","wkn":"A2PHCC","qty":780,"broker":"sBroker","brokerDisplaySource":"Xetra","analysisVenue":"Xetra","fallbackVenues":["Tradegate","Frankfurt"],"dataSource":"DB_DELAYED","analysisSymbol":"AYEW","mnemonic":"AYEW","currency":"EUR","purchasePrice":15.891,"assetType":"ETF"},{"id":"semiconductor","name":"VanEck Semiconductor","isin":"IE00BMC38736","wkn":"A2QC5J","qty":98,"broker":"sBroker","brokerDisplaySource":"Lang & Schwarz","analysisVenue":"Xetra","fallbackVenues":["Tradegate","Frankfurt"],"dataSource":"DB_DELAYED","analysisSymbol":"VVSM","mnemonic":"VVSM","currency":"EUR","purchasePrice":89.377,"assetType":"ETF"},{"id":"sap","name":"SAP SE","isin":"DE0007164600","wkn":"716460","qty":60,"broker":"sBroker","brokerDisplaySource":"Xetra","analysisVenue":"Xetra","fallbackVenues":["Tradegate","Frankfurt"],"dataSource":"DB_DELAYED","analysisSymbol":"SAP","mnemonic":"SAP","currency":"EUR","purchasePrice":250.417,"assetType":"Aktie"},{"id":"fidelity","name":"Fidelity Global Quality Income","isin":"IE00BYXVGZ48","wkn":"A2DL7E","qty":580,"broker":"sBroker","brokerDisplaySource":"Xetra","analysisVenue":"Xetra","fallbackVenues":["Tradegate","Frankfurt"],"dataSource":"DB_DELAYED","analysisSymbol":"FGEQ","mnemonic":"FGEQ","currency":"EUR","purchasePrice":9.855,"assetType":"ETF"},{"id":"cyber","name":"L&G Cyber Security","isin":"IE00BYPLS672","wkn":"A14WU5","qty":141,"broker":"sBroker","brokerDisplaySource":"Lang & Schwarz","analysisVenue":"Xetra","fallbackVenues":["Tradegate","Frankfurt"],"dataSource":"DB_DELAYED","analysisSymbol":"USPY","mnemonic":"USPY","currency":"EUR","purchasePrice":33.329,"assetType":"ETF"},{"id":"gold","name":"Xetra-Gold","isin":"DE000A0S9GB0","wkn":"A0S9GB","qty":35,"broker":"sBroker","brokerDisplaySource":"Lang & Schwarz","analysisVenue":"Xetra","fallbackVenues":["Tradegate","Frankfurt"],"dataSource":"DB_DELAYED","analysisSymbol":"4GLD","mnemonic":"4GLD","currency":"EUR","purchasePrice":117.846,"assetType":"Rohstoff"},{"id":"ageing","name":"iShares Ageing Population","isin":"IE00BYZK4669","wkn":"A2ANH1","qty":150,"broker":"sBroker","brokerDisplaySource":"Lang & Schwarz","analysisVenue":"Xetra","fallbackVenues":["Tradegate","Frankfurt"],"dataSource":"DB_DELAYED","analysisSymbol":"AGED","mnemonic":"AGED","currency":"EUR","purchasePrice":9.52,"assetType":"ETF"},{"id":"trilogy","name":"Trilogy Metals","isin":"CA89621C1059","wkn":"A14XMF","qty":600,"broker":"Trade Republic","brokerDisplaySource":"Lang & Schwarz","analysisVenue":"NYSE American","fallbackVenues":[],"dataSource":"TRILOGY_YAHOO","analysisSymbol":"TMQ","mnemonic":"TMQ","currency":"EUR","purchasePrice":5.38,"assetType":"Aktie"},{"id":"custom-spacex-us84615q1031","name":"Space Explorations Technology A","isin":"US84615Q1031","wkn":"A42D4F","qty":20.437,"broker":"Trade Republic","brokerDisplaySource":"Lang & Schwarz","analysisVenue":"Frankfurt","fallbackVenues":["Xetra","Frankfurt","Stuttgart"],"dataSource":"DB_DELAYED","analysisSymbol":"SPX","mnemonic":"SPX","currency":"EUR","purchasePrice":117.86,"assetType":"Aktie"},{"id":"ethereum","name":"Ethereum","isin":"","wkn":"","qty":3.363942,"broker":"Trade Republic","brokerDisplaySource":"Trade Republic","analysisVenue":"Krypto","fallbackVenues":[],"dataSource":"CRYPTO","analysisExchangeCode":"CRYPTO","analysisSymbol":"ETH","mnemonic":"ETH","currency":"EUR","purchasePrice":3567.24,"purchaseTotal":12000,"assetType":"Krypto"}]);

const INSTRUMENT_CATALOG=Object.freeze({
  'IE00BMYDM919':{
    id:'custom-ie00bmydm919',
    name:'L&G Europe ex-UK Quality Dividends Equal Weight',
    isin:'IE00BMYDM919',
    wkn:'A2QK9U',
    broker:'sBroker',
    brokerDisplaySource:'Tradegate BSX',
    analysisVenue:'Xetra',
    fallbackVenues:['Tradegate','Frankfurt','Stuttgart'],
    dataSource:'DB_DELAYED',
    analysisSymbol:'LGGE',
    mnemonic:'LGGE',
    currency:'EUR',
    purchasePrice:0,
    assetType:'ETF'
  },
  'IE00BYZK4776':{
    id:'custom-ie00byzk4776',
    name:'iShares Healthcare Innovation UCITS ETF',
    isin:'IE00BYZK4776',
    wkn:'A2ANH2',
    broker:'sBroker',
    brokerDisplaySource:'Tradegate BSX',
    analysisVenue:'Xetra',
    fallbackVenues:['Tradegate','Frankfurt','Stuttgart'],
    dataSource:'DB_DELAYED',
    analysisSymbol:'2B78',
    mnemonic:'2B78',
    currency:'EUR',
    purchasePrice:0,
    assetType:'ETF'
  },
  'IE00BHZRR030':{
    id:'custom-ie00bhzrr030',
    name:'Franklin FTSE Korea UCITS ETF',
    isin:'IE00BHZRR030',
    wkn:'A2PB5X',
    broker:'sBroker',
    brokerDisplaySource:'Lang & Schwarz',
    analysisVenue:'Xetra',
    fallbackVenues:['Tradegate','Frankfurt','Stuttgart'],
    dataSource:'DB_DELAYED',
    analysisSymbol:'FLXK',
    mnemonic:'FLXK',
    currency:'EUR',
    purchasePrice:0,
    assetType:'ETF'
  },
  'US5128073062':{
    id:'custom-us5128073062',
    name:'LAM Research',
    isin:'US5128073062',
    wkn:'A40L1V',
    broker:'sBroker',
    brokerDisplaySource:'Lang & Schwarz',
    analysisVenue:'Xetra',
    fallbackVenues:['Tradegate','Frankfurt','Stuttgart'],
    dataSource:'DB_DELAYED',
    analysisSymbol:'LAR0',
    mnemonic:'LAR0',
    currency:'EUR',
    purchasePrice:0,
    assetType:'Aktie'
  },
  'US5951121038':{
    id:'custom-us5951121038',
    name:'Micron Technology',
    isin:'US5951121038',
    wkn:'869020',
    broker:'sBroker',
    brokerDisplaySource:'Lang & Schwarz',
    analysisVenue:'Xetra',
    fallbackVenues:['Tradegate','Frankfurt','Stuttgart'],
    dataSource:'DB_DELAYED',
    analysisSymbol:'MTE',
    mnemonic:'MTE',
    currency:'EUR',
    purchasePrice:0,
    assetType:'Aktie'
  }
});
const MASTER_BY_ID=new Map(MASTER.map(p=>[p.id,p]));
const state={
  positions:structuredClone(MASTER),quotes:{},updatedAt:null,broker:'all',page:'overview',
  type:'all',transactions:[],txKind:'BUY',lastDiagnostics:null,analysisScope:'all',technicalAsset:'allworld',technicalRange:'1Y',technical:null,technicalLoading:false,technicalCache:{},moverMode:'winners',dailyMovers:null,dailyMoversLoading:false,closedIds:[]
};
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const clone=x=>JSON.parse(JSON.stringify(x));
const eur=(v,d=2)=>{
  if(v===null||v===undefined||v==='')return '–';
  const n=Number(v);
  return Number.isFinite(n)?new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR',minimumFractionDigits:d,maximumFractionDigits:d}).format(n):'–';
};
const num=v=>{if(v==null||v==='')return null;const s=String(v).trim().replace(/\s/g,'').replace(/\./g,'').replace(',','.');const n=Number(s);return Number.isFinite(n)?n:null};
const valid=q=>q?.ok&&Number.isFinite(Number(q?.latest?.price))&&Number(q.latest.price)>0;
const value=p=>valid(state.quotes[p.id])?Number(state.quotes[p.id].latest.price)*Number(p.qty):null;
const pct=(a,b)=>Number.isFinite(a)&&Number.isFinite(b)&&b!==0?(a/b*100):null;
function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1800)}



const CONFIRMED_TRANSACTIONS=Object.freeze([
  {
    id:'confirmed-fidelity-sell-20260825',
    positionId:'fidelity',
    positionName:'Fidelity Global Quality Income',
    isin:'IE00BYXVGZ48',
    kind:'SELL',
    qty:580,
    price:10.17,
    fees:0,
    date:'2026-08-25',
    venue:'Tradegate BSX',
    amount:-5848.35,
    createdAt:'2026-08-25T15:50:00+02:00',
    confirmed:true
  },
  {
    id:'confirmed-lgge-buy-20260825',
    positionId:'custom-ie00bmydm919',
    positionName:'L&G Europe ex-UK Quality Dividends Equal Weight',
    isin:'IE00BMYDM919',
    kind:'BUY',
    qty:271,
    price:18.48,
    fees:0,
    date:'2026-08-25',
    venue:'Tradegate BSX',
    amount:5009.57,
    createdAt:'2026-08-25T15:51:00+02:00',
    confirmed:true
  },
  {
    id:'confirmed-lgge-sell-20260902',
    positionId:'custom-ie00bmydm919',
    positionName:'L&G Europe ex-UK Quality Dividends Equal Weight',
    isin:'IE00BMYDM919',
    kind:'SELL',
    qty:271,
    price:18.45,
    fees:0,
    date:'2026-09-02',
    venue:'Frankfurt',
    amount:-4980.76,
    createdAt:'2026-09-02T10:25:00+02:00',
    confirmed:true
  },
  {
    id:'confirmed-healthcare-buy-20260902',
    positionId:'custom-ie00byzk4776',
    positionName:'iShares Healthcare Innovation UCITS ETF',
    isin:'IE00BYZK4776',
    kind:'BUY',
    qty:545,
    price:9.17,
    fees:0,
    date:'2026-09-02',
    venue:'Tradegate BSX',
    amount:5011.09,
    createdAt:'2026-09-02T10:32:00+02:00',
    confirmed:true
  }
]);

function normalizeIsin(v){
  return String(v||'')
    .toUpperCase()
    .normalize('NFKC')
    .replace(/[^A-Z0-9]/g,'');
}

function transactionKey(t){
  return [
    String(t.kind||'').toUpperCase(),
    normalizeIsin(t.isin||''),
    Number(t.qty||0).toFixed(6),
    Number(t.price||0).toFixed(6),
    String(t.date||'').slice(0,10)
  ].join('|');
}

function applyConfirmedTransactions(list){
  const byKey=new Map((list||[]).map(t=>[transactionKey(t),t]));
  for(const confirmed of CONFIRMED_TRANSACTIONS){
    const key=transactionKey(confirmed);
    if(byKey.has(key)){
      Object.assign(byKey.get(key), confirmed);
    }else{
      const copy=structuredClone(confirmed);
      list.push(copy);
      byKey.set(key,copy);
    }
  }
  return list;
}

const LEGACY_TX_KEYS=['dc601_transactions','dc600_transactions','depotcockpit_transactions','transactions'];

function normalizeTransaction(t){
  if(!t||typeof t!=='object')return null;
  const kind=String(t.kind||t.type||t.art||'').toUpperCase();
  const normalizedKind=kind.includes('SELL')||kind.includes('VERKAUF')?'SELL':'BUY';
  const qty=Number(t.qty??t.quantity??t.stueck??t.stück);
  const price=Number(t.price??t.kurs??t.executionPrice);
  if(!(qty>0)||!(price>0))return null;
  return {
    id:String(t.id||t.uuid||`${normalizedKind}-${t.positionId||t.isin||t.name||'tx'}-${t.date||t.createdAt||Date.now()}`),
    positionId:String(t.positionId||t.assetId||''),
    positionName:String(t.positionName||t.name||t.assetName||''),
    isin:normalizeIsin(t.isin||''),
    kind:normalizedKind,
    qty,
    price,
    fees:Number(t.fees??t.gebuehren??t.gebühren??0)||0,
    date:String(t.date||t.executionDate||t.datum||new Date().toISOString().slice(0,10)).slice(0,10),
    venue:String(t.venue||t.handelsplatz||''),
    amount:Number.isFinite(Number(t.amount))?Number(t.amount):(normalizedKind==='BUY'?(qty*price):-(qty*price)),
    createdAt:String(t.createdAt||new Date().toISOString())
  };
}

function mergeTransactions(...lists){
  const out=[],seen=new Set();
  for(const list of lists){
    if(!Array.isArray(list))continue;
    for(const raw of list){
      const t=normalizeTransaction(raw);if(!t)continue;
      const key=transactionKey(t);
      if(seen.has(key))continue;
      seen.add(key);out.push(t);
    }
  }
  return out.sort((a,b)=>String(a.createdAt||a.date).localeCompare(String(b.createdAt||b.date)));
}

function migrateLegacyTransactions(){
  const pools=[];
  try{pools.push(JSON.parse(localStorage.getItem(TX_KEY)||'[]'))}catch{}
  for(const key of LEGACY_TX_KEYS){
    try{
      const raw=localStorage.getItem(key);
      if(raw)pools.push(JSON.parse(raw));
    }catch{}
  }
  try{
    const store=JSON.parse(localStorage.getItem(STORE)||'null');
    if(Array.isArray(store?.transactions))pools.push(store.transactions);
    if(Array.isArray(store?.txHistory))pools.push(store.txHistory);
  }catch{}
  return applyConfirmedTransactions(mergeTransactions(...pools));
}


function txMatchesPosition(t,p){
  if(!t||!p)return false;
  if(t.positionId&&t.positionId===p.id)return true;
  const ti=String(t.isin||'').toUpperCase(),pi=String(p.isin||'').toUpperCase();
  return Boolean(ti&&pi&&ti===pi);
}


function enrichPositionFromCatalog(p){
  const c=resolveCatalogByIsin(p?.isin||'');
  if(!c)return p;
  const preserve={
    id:p.id||c.id,
    qty:p.qty,
    purchasePrice:p.purchasePrice,
    purchaseTotal:p.purchaseTotal
  };
  const enriched={...structuredClone(c),...p};
  enriched.id=preserve.id;
  if(preserve.qty!==undefined)enriched.qty=preserve.qty;
  if(preserve.purchasePrice!==undefined)enriched.purchasePrice=preserve.purchasePrice;
  if(preserve.purchaseTotal!==undefined)enriched.purchaseTotal=preserve.purchaseTotal;
  for(const key of ['wkn','analysisVenue','dataSource','analysisSymbol','mnemonic','currency','assetType']){
    if(!enriched[key] && c[key])enriched[key]=c[key];
  }
  if((!Array.isArray(enriched.fallbackVenues)||!enriched.fallbackVenues.length) && c.fallbackVenues){
    enriched.fallbackVenues=structuredClone(c.fallbackVenues);
  }
  return enriched;
}
function enrichPersistedPositions(){
  state.positions=state.positions.map(enrichPositionFromCatalog);
}
function reconcilePositionsWithLedger(){
  // A) Canonical master positions: keep fully sold positions closed.
  for(const master of MASTER){
    const buys=state.transactions.filter(t=>t.kind==='BUY'&&txMatchesPosition(t,master));
    const sells=state.transactions.filter(t=>t.kind==='SELL'&&txMatchesPosition(t,master));
    const buyQty=buys.reduce((s,t)=>s+Number(t.qty||0),0);
    const sellQty=sells.reduce((s,t)=>s+Number(t.qty||0),0);
    const effectiveStart=Number(master.qty||0);
    const netQty=Math.max(0,effectiveStart+buyQty-sellQty);

    if(sellQty>0 && netQty<=1e-9){
      state.closedIds=[...new Set([...state.closedIds,master.id])];
      state.positions=state.positions.filter(p=>p.id!==master.id);
      delete state.quotes[master.id];
      delete state.technicalCache[master.id];
    }
  }

  // B) Custom positions are reconstructed from the ledger itself.
  const customIsins=new Set(
    state.transactions
      .map(t=>normalizeIsin(t.isin||''))
      .filter(isin=>isin && !MASTER.some(p=>normalizeIsin(p.isin||'')===isin))
  );

  for(const isin of customIsins){
    const buys=state.transactions.filter(t=>t.kind==='BUY'&&normalizeIsin(t.isin||'')===isin);
    const sells=state.transactions.filter(t=>t.kind==='SELL'&&normalizeIsin(t.isin||'')===isin);
    const buyQty=buys.reduce((s,t)=>s+Number(t.qty||0),0);
    const sellQty=sells.reduce((s,t)=>s+Number(t.qty||0),0);
    const qty=Math.max(0,buyQty-sellQty);

    const existing=state.positions.find(p=>normalizeIsin(p.isin||'')===isin);

    if(qty<=1e-9){
      if(existing){
        state.positions=state.positions.filter(p=>p.id!==existing.id);
        delete state.quotes[existing.id];
        delete state.technicalCache[existing.id];
      }
      continue;
    }

    const catalog=resolveCatalogByIsin(isin);
    if(!catalog)continue;

    const gross=buys.reduce((s,t)=>s+(Number(t.qty||0)*Number(t.price||0))+Number(t.fees||0),0);
    const avgPrice=buyQty>0?gross/buyQty:0;

    if(existing){
      existing.qty=qty;
      if(avgPrice>0)existing.purchasePrice=avgPrice;
      existing.purchaseTotal=gross;
      continue;
    }

    const p=structuredClone(catalog);
    p.qty=qty;
    p.purchasePrice=avgPrice;
    p.purchaseTotal=gross;
    state.positions.push(p);
  }

  // C) Keep analysis selection valid.
  if(state.technicalAsset&&!state.positions.some(p=>p.id===state.technicalAsset)){
    state.technicalAsset=state.positions[0]?.id||'';
    state.technical=null;
  }
}
function resolveCatalogByIsin(isin){
  const key=normalizeIsin(isin);
  if(!key)return null;
  return INSTRUMENT_CATALOG[key] || MASTER.find(p=>String(p.isin||'').toUpperCase()===key) || null;
}
function load(){
  let savedPositions=[],savedClosed=[];
  try{
    const saved=JSON.parse(localStorage.getItem(STORE)||'null');
    if(Array.isArray(saved?.positions))savedPositions=saved.positions;
    if(Array.isArray(saved?.closedIds))savedClosed=saved.closedIds;
  }catch{}

  state.closedIds=[...new Set(savedClosed)];
  const savedById=new Map(savedPositions.map(p=>[p?.id,p]).filter(([id])=>id));

  const canonical=MASTER.map(master=>{
    const saved=savedById.get(master.id)||{};
    const merged=structuredClone(master);
    const qty=Number(saved.qty),purchasePrice=Number(saved.purchasePrice),purchaseTotal=Number(saved.purchaseTotal);
    if(Number.isFinite(qty)&&qty>=0)merged.qty=qty;
    if(Number.isFinite(purchasePrice)&&purchasePrice>0)merged.purchasePrice=purchasePrice;
    if(Number.isFinite(purchaseTotal)&&purchaseTotal>0)merged.purchaseTotal=purchaseTotal;
    return merged;
  }).filter(p=>Number(p.qty)>0&&!state.closedIds.includes(p.id));

  const custom=savedPositions.filter(p=>p?.id&&!MASTER_BY_ID.has(p.id)&&Number(p.qty)>0).map(p=>({
    id:String(p.id),
    name:String(p.name||p.isin||'Neue Position'),
    isin:String(p.isin||'').toUpperCase(),
    wkn:String(p.wkn||'').toUpperCase(),
    qty:Number(p.qty)||0,
    broker:p.broker==='Trade Republic'?'Trade Republic':'sBroker',
    brokerDisplaySource:String(p.brokerDisplaySource||'Tradegate BSX'),
    analysisVenue:String(p.analysisVenue||'Xetra'),
    fallbackVenues:Array.isArray(p.fallbackVenues)?p.fallbackVenues:['Tradegate','Frankfurt','Stuttgart'],
    dataSource:String(p.dataSource||'DB_DELAYED'),
    analysisSymbol:String(p.analysisSymbol||p.mnemonic||'').toUpperCase(),
    mnemonic:String(p.mnemonic||p.analysisSymbol||'').toUpperCase(),
    currency:'EUR',
    purchasePrice:Number(p.purchasePrice)||0,
    purchaseTotal:Number(p.purchaseTotal)||undefined,
    assetType:String(p.assetType||'ETF')
  }));

  state.positions=[...canonical,...custom];

  const sx=state.positions.find(p=>p.id==='custom-spacex-us84615q1031');
  if(sx)sx.qty=20.437;
  const eth=state.positions.find(p=>p.id==='ethereum');
  if(eth){eth.qty=3.363942;eth.purchasePrice=3567.24;eth.purchaseTotal=12000}

  state.transactions=migrateLegacyTransactions();
  state.transactions=applyConfirmedTransactions(state.transactions);
  reconcilePositionsWithLedger();
  enrichPersistedPositions();
  try{
    const snap=JSON.parse(localStorage.getItem(SNAPSHOT_KEY)||'null');
    if(snap?.items){
      state.quotes=Object.fromEntries(Object.entries(snap.items).filter(([,q])=>valid(q)));
      state.updatedAt=snap.generatedAt||snap.savedAt||null;
    }
  }catch{}
  persist();
}
function persist(){
  const payload={
    schemaVersion:9,
    savedAt:new Date().toISOString(),
    positions:state.positions,
    closedIds:state.closedIds,
    transactions:state.transactions
  };
  localStorage.setItem(STORE,JSON.stringify(payload));
  localStorage.setItem(TX_KEY,JSON.stringify(state.transactions));
}
function mergeSnapshot(payload){
  const items={...state.quotes};
  for(const r of payload?.results||[])if(r?.id&&valid(r))items[r.id]={...r,__stale:false};
  for(const p of state.positions){
    const fresh=(payload?.results||[]).find(r=>r?.id===p.id&&valid(r));
    if(!fresh&&items[p.id])items[p.id]={...items[p.id],__stale:true};
  }
  state.quotes=items;state.updatedAt=payload?.generatedAt||new Date().toISOString();state.lastDiagnostics=payload;
  localStorage.setItem(SNAPSHOT_KEY,JSON.stringify({schemaVersion:7,savedAt:new Date().toISOString(),generatedAt:state.updatedAt,items}));
}


function canonicalNameForTransaction(t){
  const isin=normalizeIsin(t?.isin||'');
  const c=resolveCatalogByIsin(isin);
  return c?.name || t?.positionName || positionNameById(t?.positionId);
}
function positionNameById(id){
  return state.positions.find(p=>p.id===id)?.name || MASTER_BY_ID.get(id)?.name || id;
}
function activeCount(){return state.positions.length}
function brokerCounts(){
  return {
    sBroker:state.positions.filter(p=>p.broker==='sBroker').length,
    tr:state.positions.filter(p=>p.broker==='Trade Republic').length
  };
}
function makeCustomId(isin,name){
  const clean=String(isin||'').replace(/[^a-z0-9]/gi,'').toLowerCase();
  if(clean)return `custom-${clean}`;
  return `custom-${String(name||'position').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}-${Date.now()}`;
}
function applyCatalogToNewForm(){
  const raw=String($('#txNewIsin')?.value||'');
  const isin=normalizeIsin(raw);
  const c=resolveCatalogByIsin(isin);
  const hint=$('#txNewHint');

  if($('#txNewIsin') && raw!==isin)$('#txNewIsin').value=isin;

  if(!isin){
    if(hint)hint.textContent='ISIN eingeben. Bekannte Instrumente werden automatisch ergänzt.';
    return;
  }

  if(!c){
    if(hint)hint.textContent=`ISIN ${isin} noch nicht hinterlegt · Name bitte manuell ergänzen.`;
    return;
  }

  if($('#txNewName'))$('#txNewName').value=c.name||'';
  if($('#txNewWkn'))$('#txNewWkn').value=c.wkn||'';
  if($('#txNewBroker'))$('#txNewBroker').value=c.broker==='Trade Republic'?'Trade Republic':'sBroker';
  if($('#txNewType'))$('#txNewType').value=c.assetType||'ETF';
  if($('#txNewSymbol'))$('#txNewSymbol').value=c.analysisSymbol||c.mnemonic||'';
  if(hint)hint.textContent=`✓ Instrument erkannt · ${c.name}${c.wkn?` · WKN ${c.wkn}`:''}${c.analysisSymbol||c.mnemonic?` · Ticker ${c.analysisSymbol||c.mnemonic}`:''}`;
}
function buildNewPosition(){
  const isin=normalizeIsin($('#txNewIsin')?.value);
  const catalog=resolveCatalogByIsin(isin);

  // ISIN first: known instruments do not require manual name input.
  if(catalog){
    const master=MASTER.find(p=>p.id===catalog.id||String(p.isin||'').toUpperCase()===isin);
    if(master){
      state.closedIds=state.closedIds.filter(id=>id!==master.id);
      const restored=structuredClone(master);
      restored.qty=0;
      restored.purchasePrice=0;
      restored.purchaseTotal=0;
      return {position:restored};
    }

    const p=structuredClone(catalog);
    p.qty=0;p.purchasePrice=0;p.purchaseTotal=0;
    return {position:p};
  }

  const name=String($('#txNewName')?.value||'').trim();
  const wkn=String($('#txNewWkn')?.value||'').trim().toUpperCase();
  const broker=$('#txNewBroker')?.value==='Trade Republic'?'Trade Republic':'sBroker';
  const assetType=String($('#txNewType')?.value||'ETF');
  const symbol=String($('#txNewSymbol')?.value||'').trim().toUpperCase();

  if(!isin)return {error:'Bitte zuerst die ISIN eingeben.'};
  if(!name)return {error:'Diese ISIN ist noch nicht hinterlegt. Bitte den Namen einmal manuell ergänzen.'};

  return {position:{
    id:makeCustomId(isin,name),name,isin,wkn,qty:0,broker,
    brokerDisplaySource:'Tradegate BSX',
    analysisVenue:'Xetra',
    fallbackVenues:['Tradegate','Frankfurt','Stuttgart'],
    dataSource:'DB_DELAYED',
    analysisSymbol:symbol,
    mnemonic:symbol,
    currency:'EUR',
    purchasePrice:0,
    assetType
  }};
}
function filteredByBroker(ps=state.positions){return state.broker==='all'?ps:ps.filter(p=>p.broker===state.broker)}
function quoteAgeLabel(q){
  const raw=q?.sourceMeta?.asOf||q?.latest?.date||state.updatedAt;
  if(!raw)return '';
  const d=new Date(raw);
  if(!Number.isFinite(d.getTime()))return '';
  const sameDay=d.toDateString()===new Date().toDateString();
  return sameDay?d.toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'}):d.toLocaleDateString('de-DE');
}
function priceLabel(p){
  const q=state.quotes[p.id]; if(!valid(q))return 'Kein gültiger Kurs';
  if(q.__stale)return `Letzter gültiger Kurs${quoteAgeLabel(q)?' · '+quoteAgeLabel(q):''}`;
  if(q?.sourceMeta?.provider==='KRAKEN')return 'Kraken · ETH/EUR';
  if(q?.sourceMeta?.provider==='COINBASE')return 'Coinbase · ETH/EUR';
  return 'Aktuell';
}
function providerLabel(q){return q?.sourceMeta?.provider||q?.usedVenue||q?.source||'–'}

function sourceDetail(q){
  if(!q)return 'Kein neuer Kurs';
  const provider=providerLabel(q);
  const kind=q?.sourceMeta?.sourceKind||'';
  const venue=q?.usedVenue||'';
  return [provider,kind,venue].filter(Boolean).filter((x,i,a)=>a.indexOf(x)===i).join(' · ');
}
function costBasis(p){
  const e=Number(p.purchasePrice),qty=Number(p.qty);
  return Number.isFinite(e)&&e>0&&Number.isFinite(qty)?e*qty:null;
}
function gainSinceBuy(p){
  const v=value(p),c=costBasis(p);
  if(!Number.isFinite(v)||!Number.isFinite(c)||c<=0)return null;
  return {amount:v-c,pct:(v/c-1)*100};
}

function normalizeVenue(v){
  const s=String(v||'').trim().toLowerCase();
  if(!s)return '';
  if(s.includes('xetra')||s==='xetr')return 'Xetra';
  if(s.includes('lang')||s.includes('l&s'))return 'Lang & Schwarz';
  if(s.includes('nyse'))return 'NYSE American';
  if(s.includes('nasdaq'))return 'Nasdaq';
  if(s.includes('kraken'))return 'Kraken';
  if(s.includes('coinbase'))return 'Coinbase';
  if(s.includes('tradegate'))return 'Tradegate';
  if(s.includes('frankfurt'))return 'Frankfurt';
  if(s.includes('stuttgart'))return 'Stuttgart';
  return String(v||'');
}
function currentVenueFor(p,q){
  if(!q)return '';
  return normalizeVenue(q.usedVenue||q?.sourceMeta?.venue||q?.sourceMeta?.sourceKind||q?.sourceMeta?.provider);
}
function currentCurrencyFor(q){
  return String(q?.currency||q?.latest?.currency||q?.sourceMeta?.currency||'EUR').toUpperCase();
}
function referenceCurrencyFor(ref){
  return String(ref?.currency||'EUR').toUpperCase();
}
function referenceCompatibility(p,q,ref){
  if(!ref?.previousClose){
    return {
      calcKey:'red',calcLabel:'Keine belastbare Tagesreferenz',
      brokerKey:'red',brokerLabel:'Brokervergleich nicht möglich',
      eligible:false,detail:'Tageswert nicht berechenbar'
    };
  }

  const currentVenue=currentVenueFor(p,q);
  const refVenue=normalizeVenue(ref?.venue||ref?.referenceVenue||'');
  const brokerVenue=normalizeVenue(p?.brokerDisplaySource||'');
  const currentCurrency=currentCurrencyFor(q);
  const refCurrency=referenceCurrencyFor(ref);

  const pIsin=normalizeIsin(p?.isin||'');
  const refIsin=normalizeIsin(ref?.isin||p?.isin||'');
  const sameInstrument=Boolean(pIsin&&refIsin&&pIsin===refIsin);
  const sameVenue=Boolean(currentVenue&&refVenue&&currentVenue===refVenue);
  const sameCurrency=currentCurrency===refCurrency;

  let calcKey='red',calcLabel='Nicht vergleichbare Referenzbasis',eligible=false;
  if(sameInstrument&&sameVenue&&sameCurrency){
    calcKey='green';calcLabel='Rechenbasis konsistent';eligible=true;
  }else if(sameInstrument&&sameCurrency&&currentVenue&&refVenue&&currentVenue!==refVenue){
    calcKey='red';calcLabel='Unterschiedliche Handelsplätze';
  }else if(sameInstrument&&sameVenue&&!sameCurrency){
    calcKey='red';calcLabel='Währungen nicht vergleichbar';
  }else if(!sameInstrument){
    calcKey='red';calcLabel='Instrumentenidentität nicht eindeutig';
  }else{
    calcKey='red';calcLabel='Referenzbasis unklar';
  }

  let brokerKey='yellow',brokerLabel='Brokerplatz kann abweichen';
  if(!brokerVenue){
    brokerLabel='Brokerreferenz unbekannt · intern wertbar, wenn Rechenbasis grün';
  }else if(refVenue&&brokerVenue===refVenue){
    brokerKey='green';brokerLabel='Brokerreferenz passend';
  }else{
    brokerLabel=`Brokerplatz abweichend · intern weiterhin wertbar (${brokerVenue} vs. ${refVenue||'unbekannt'})`;
  }

  return {
    calcKey,calcLabel,brokerKey,brokerLabel,eligible,
    currentVenue,refVenue,brokerVenue,currentCurrency,refCurrency,
    detail:eligible
      ?`Aktuell und Vortag: ${refVenue} · ${refCurrency}`
      :`Aktuell ${currentVenue||'unbekannt'} / ${currentCurrency}; Vortag ${refVenue||'unbekannt'} / ${refCurrency}`
  };
}

function dailyMove(p){
  const q=state.quotes[p.id],dailyRef=dailyReferenceFor(p.id);
  const ref=Number(dailyRef?.previousClose);
  const cur=valid(q)?Number(q.latest.price):null;
  if(!(Number.isFinite(ref)&&ref>0&&Number.isFinite(cur)&&cur>0))return null;
  const quality=referenceCompatibility(p,q,dailyRef);
  return {
    amount:(cur-ref)*Number(p.qty),
    pct:(cur/ref-1)*100,
    reference:ref,
    referenceSource:dailyRef?.source||'',
    referenceAsOf:dailyRef?.asOf||null,
    quality,
    eligible:quality.eligible
  };
}
function signalFor(p){
  const g=gainSinceBuy(p);
  return g?{key:'blue',label:'Basis vorhanden'}:{key:'grey',label:'Noch nicht bewertet'};
}
function signedPct(v){return Number.isFinite(v)?`${v>=0?'+':''}${v.toLocaleString('de-DE',{minimumFractionDigits:2,maximumFractionDigits:2})} %`:'–'}
function signedEur(v){return Number.isFinite(v)?`${v>=0?'+':''}${eur(v)}`:'–'}



function dailyReferenceFor(id){
  const row=state.dailyMovers?.items?.find(x=>x.id===id);
  const v=Number(row?.previousClose);
  return Number.isFinite(v)&&v>0?row:null;
}
async function loadDailyMovers(){
  if(state.dailyMoversLoading)return;
  state.dailyMoversLoading=true;
  try{
    const r=await fetch('/api/analysis',{method:'POST',headers:{'Content-Type':'application/json'},cache:'no-store',body:JSON.stringify({action:'daily-references'})});
    const p=await r.json();
    if(!r.ok||!p?.ok)throw new Error(p?.error||`HTTP ${r.status}`);
    state.dailyMovers=p;
  }catch(e){state.dailyMovers={ok:false,error:e?.message||String(e),items:[]}}
  finally{state.dailyMoversLoading=false;if(state.page==='overview')renderDailyMovers()}
}
function openTechnicalFor(id){
  state.technicalAsset=id;state.page='analysis';render();updateAnalysisLandscape();
  setTimeout(()=>loadTechnical(id),0);
}
function renderDailyMovers(){
  const box=$('#dailyMoversList');if(!box)return;
  $$('.mover-tab').forEach(b=>b.classList.toggle('active',b.dataset.mode===state.moverMode));
  if(state.dailyMoversLoading){box.innerHTML='<div class="mover-empty">Tagesbewegungen werden geladen …</div>';return}
  const d=state.dailyMovers;
  if(!d?.ok){box.innerHTML=`<div class="mover-empty">${d?.error||'Noch keine Tagesreferenzen'}</div>`;return}

  const rows=state.positions.map(p=>{
    const q=state.quotes[p.id],ref=dailyReferenceFor(p.id);
    const current=valid(q)?Number(q.latest.price):null;
    const previous=Number(ref?.previousClose);
    if(!(Number.isFinite(current)&&current>0&&Number.isFinite(previous)&&previous>0))return null;
    return {
      id:p.id,name:p.name,broker:p.broker,price:current,previousClose:previous,
      pct:(current/previous-1)*100,referenceSource:ref?.source||'Vortagesschluss',
      quality:referenceCompatibility(p,q,ref)
    };
  }).filter(Boolean).filter(x=>x.quality?.eligible);

  const directional=rows.filter(x=>state.moverMode==='winners'?x.pct>0:x.pct<0);
  directional.sort((a,b)=>state.moverMode==='winners'?b.pct-a.pct:a.pct-b.pct);
  const chosen=directional.slice(0,3);

  box.innerHTML=chosen.length?chosen.map(x=>`
    <button class="mover-row ${x.pct>=0?'up':'down'}" data-id="${x.id}">
      <div class="mover-main">
        <b>${x.name}</b>
        <small>${x.broker} · <span class="quality-inline"><i class="quality-dot ${x.quality?.brokerKey||'yellow'}"></i>${x.quality?.brokerKey==='green'?'Brokerreferenz passend':'Brokerplatz-Hinweis'}</span></small>
      </div>
      <div class="mover-value">
        <strong>${x.pct>=0?'+':''}${Number(x.pct).toLocaleString('de-DE',{minimumFractionDigits:2,maximumFractionDigits:2})} %</strong>
        <small>${eur(x.price,x.price<20?3:2)}</small>
      </div>
    </button>`).join(''):state.moverMode==='winners'?'<div class="mover-empty">Heute noch keine positiven, intern belastbaren Werte.</div>':'<div class="mover-empty">Heute noch keine negativen, intern belastbaren Werte.</div>';

  $$('.mover-row').forEach(b=>b.onclick=()=>openTechnicalFor(b.dataset.id));
}
function renderOverview(){
  const ps=filteredByBroker(), vals=ps.map(value).filter(Number.isFinite), total=vals.reduce((a,b)=>a+b,0);
  $('#heroLabel').textContent=state.broker==='all'?'Gesamtdepotwert':state.broker==='sBroker'?'S-Broker-Wert':'Trade-Republic-Wert';
  $('#total').textContent=vals.length?eur(total):'–';
  $('#coverage').textContent=`${vals.length}/${ps.length} bewertet`;
  $('#coverage').className='pill '+(vals.length===ps.length?'ok':'warn');
  $('#updated').textContent=state.updatedAt?`Stand ${new Date(state.updatedAt).toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'})}`:'Noch kein Kursabruf';
  const sb=state.positions.filter(p=>p.broker==='sBroker'),tr=state.positions.filter(p=>p.broker==='Trade Republic');
  const sum=x=>x.map(value).filter(Number.isFinite).reduce((a,b)=>a+b,0);
  $('#sbValue').textContent=eur(sum(sb)); $('#trValue').textContent=eur(sum(tr));
  $('#sbCount').textContent=`${sb.length} Positionen`; $('#trCount').textContent=`${tr.length} Positionen`;
  $('#positionCount').textContent=state.positions.length; $('#txCount').textContent=state.transactions.length; const pc=$('#positionsKicker');if(pc)pc.textContent=`BESTÄNDE · ${state.positions.length} POSITIONEN`;
  const allVal=state.positions.filter(p=>Number.isFinite(value(p))).length;
  $('#quality').textContent=`${allVal}/${state.positions.length}`; $('#apiState').textContent=state.updatedAt?'OK':'–'; const bc=brokerCounts(); if($('#masterTotalCount'))$('#masterTotalCount').textContent=`${state.positions.length} aktive Positionen`;if($('#masterSbCount'))$('#masterSbCount').textContent=bc.sBroker;if($('#masterTrCount'))$('#masterTrCount').textContent=bc.tr;
  const eth=state.quotes.ethereum;
  $('#ethDiag').textContent=valid(eth)?`Ethereum: ${providerLabel(eth)} · ${eur(eth.latest.price)} · OK`:'Ethereum: noch kein gültiger ETH/EUR-Kurs';

  const top=ps.slice(0,6);
  $('#overviewPositions').innerHTML=top.map(positionCompact).join('')+(ps.length>6?`<button class="secondary" data-go="positions">Alle ${ps.length} Positionen öffnen</button>`:'');
  renderDailyMovers();
  wireDynamic();
}
function positionCompact(p){
  const q=state.quotes[p.id],v=value(p),price=valid(q)?Number(q.latest.price):null;
  return `<div class="compact-item" data-compact-id="${p.id}">
    <div class="compact-summary">
      <div><b>${p.name}</b><small>${Number(p.qty).toLocaleString('de-DE',{maximumFractionDigits:6})} ${p.assetType==='Krypto'?'ETH':'Stück'} · ${priceLabel(p)}</small></div>
      <div class="compact-value"><strong>${eur(price,price&&price<20?3:2)}</strong><small>${eur(v)}</small></div>
    </div>
    <div class="compact-detail">Broker: ${p.broker} · Quelle: ${providerLabel(q)}${p.isin?` · ISIN ${p.isin}`:''}</div>
  </div>`;
}
function renderPositions(){
  let ps=filteredByBroker();
  if(state.type!=='all')ps=ps.filter(p=>p.assetType===state.type);
  const groups=['sBroker','Trade Republic'];
  $('#positionList').innerHTML=groups.map(b=>{
    const gp=ps.filter(p=>p.broker===b); if(!gp.length)return '';
    return `<div class="kicker" style="margin:18px 5px 8px">${b}</div>`+gp.map(p=>{
      const q=state.quotes[p.id],pr=valid(q)?Number(q.latest.price):null,v=value(p),entry=Number(p.purchasePrice);
      const perf=Number.isFinite(pr)&&Number.isFinite(entry)&&entry>0?(pr/entry-1)*100:null;
      return `<article class="position-card" data-position-id="${p.id}">
        <div class="position-head">
          <div><h3>${p.name}</h3><div class="meta">${Number(p.qty).toLocaleString('de-DE',{maximumFractionDigits:6})} ${p.assetType==='Krypto'?'ETH':'Stück'}${p.isin?` · ${p.isin}`:''}${p.wkn?` · ${p.wkn}`:''}</div><span class="badge ${valid(q)?'':'missing'}">${priceLabel(p)}</span></div>
          <div class="right"><strong>${eur(pr,pr&&pr<20?3:2)}</strong><small>${eur(v)}</small></div>
        </div>
        <div class="position-detail"><div class="detail-grid">
          <div><span>Broker</span><strong>${p.broker}</strong></div>
          <div><span>Datenquelle</span><strong>${providerLabel(q)}</strong></div>
          <div><span>Einstand</span><strong>${Number.isFinite(entry)?eur(entry):'–'}</strong></div>
          <div><span>Performance ggü. Einstand</span><strong>${Number.isFinite(perf)?`${perf>=0?'+':''}${perf.toFixed(2)} %`:'–'}</strong></div>
        </div></div>
      </article>`;
    }).join('');
  }).join('');
  wireDynamic();
}

function activateNewPositionForm(){
  if(state.txKind!=='BUY'){
    state.txKind='BUY';
    $$('[data-tx-kind]').forEach(x=>x.classList.toggle('active',x.dataset.txKind==='BUY'));
  }
  renderTransactions();
  const sel=$('#txPosition');
  if(sel){
    sel.value='__NEW__';
    sel.dataset.keepNew='1';
  }
  const box=$('#txNewPositionBox');
  if(box)box.hidden=false;
  setTimeout(()=>$('#txNewIsin')?.focus(),0);
}
function renderTransactions(){
  const newOpt=state.txKind==='BUY'?'<option value="__NEW__">＋ Neue Position hinzufügen</option>':'';
  $('#txPosition').innerHTML=newOpt+state.positions.map(p=>`<option value="${p.id}">${p.name}</option>`).join('');
  const addBtn=$('#addNewPositionBtn');if(addBtn)addBtn.hidden=state.txKind!=='BUY';
  if(state.txKind==='BUY'&&$('#txPosition').dataset.keepNew==='1')$('#txPosition').value='__NEW__';
  $('#txDate').value=$('#txDate').value||new Date().toISOString().slice(0,10);
  $('#historyHint').textContent=state.transactions.length?`${state.transactions.length} Buchungen`:'Noch keine Transaktionen';
  $('#txHistory').innerHTML=state.transactions.length?state.transactions.slice().reverse().map(t=>{
    return `<div class="tx-row"><div class="tx-copy"><b>${t.kind==='BUY'?'Kauf':'Verkauf'} · ${canonicalNameForTransaction(t)}</b><small class="tx-meta">${t.date} · ${t.qty} Stück · ${eur(t.price)}${t.venue?` · ${t.venue}`:''}</small></div><strong>${eur(t.amount??(t.qty*t.price+(t.kind==='BUY'?t.fees:-t.fees)))}</strong></div>`;
  }).join(''):'<p class="micro">Noch keine Transaktionen gespeichert.</p>';

  const newBox=$('#txNewPositionBox');
  if(newBox)newBox.hidden=!(state.txKind==='BUY'&&$('#txPosition').value==='__NEW__');
}
const TECH_LABELS={rsi:'RSI 14',macd:'MACD',trend:'30/50/200',relative:'Relative Stärke',volume:'Volumen'};
function techScoreClass(score){if(score>=8)return {key:'green',label:'Technisch stark'};if(score>=5)return {key:'yellow',label:'Gemischt'};if(score>=3)return {key:'orange',label:'Schwach'};return {key:'red',label:'Technischer Trendbruch'}}
function formatTechNumber(v,d=2){return Number.isFinite(Number(v))?Number(v).toLocaleString('de-DE',{minimumFractionDigits:d,maximumFractionDigits:d}):'–'}
function rangeSlice(points,range){const n={'1W':8,'1M':31,'3M':93,'6M':186,'1Y':370}[range]||370;if(!points?.length)return [];const cutoff=new Date(points.at(-1).date).getTime()-n*86400000;return points.filter(x=>new Date(x.date).getTime()>=cutoff)}
function svgPath(vals,x,y){let d='';vals.forEach((v,i)=>{if(!Number.isFinite(v.y))return;d+=`${d?' L':'M'} ${x(i).toFixed(1)} ${y(v.y).toFixed(1)}`});return d}
function drawTechnicalChart(){
  const box=$('#technicalChart'),data=state.technical;if(!box)return;
  if(!data?.ok){box.innerHTML=`<div class="chart-empty">${data?.error||'Noch keine technischen Daten'}</div>`;return}
  const pts=rangeSlice(data.points,state.technicalRange);
  if(pts.length<2){box.innerHTML='<div class="chart-empty">Zu wenig Historie.</div>';return}

  const series=[
    {key:'close',label:'Kurs',cls:'close',color:'#0c2b55',on:$('#toggleClose')?.checked!==false},
    {key:'sma30',label:'30T',cls:'s30',color:'#16865a',on:$('#toggle30')?.checked!==false},
    {key:'sma50',label:'50T',cls:'s50',color:'#d78d13',on:$('#toggle50')?.checked!==false},
    {key:'sma200',label:'200T',cls:'s200',color:'#9e3750',on:$('#toggle200')?.checked!==false}
  ].filter(s=>s.on);

  const numeric=v=>v===null||v===undefined||v===''?null:Number(v);
  const all=[];series.forEach(s=>pts.forEach(p=>{const v=numeric(p[s.key]);if(Number.isFinite(v))all.push(v)}));
  if(!all.length){box.innerHTML='<div class="chart-empty">Keine darstellbaren Werte.</div>';return}

  let lo=Math.min(...all),hi=Math.max(...all);if(hi===lo){hi+=1;lo-=1}
  const pad=(hi-lo)*.06;lo-=pad;hi+=pad;

  const W=720,H=330,L=58,R=14,T=16,B=48;
  const x=i=>L+(W-L-R)*(i/(pts.length-1));
  const y=v=>T+(H-T-B)*(1-(v-lo)/(hi-lo));

  const formatFullDate=iso=>{
    const d=new Date(`${iso}T12:00:00`);
    return Number.isNaN(d.getTime())?iso:d.toLocaleDateString('de-DE',{day:'2-digit',month:'short',year:'2-digit'});
  };
  const formatMonth=iso=>{
    const d=new Date(`${iso}T12:00:00`);
    if(Number.isNaN(d.getTime()))return iso;
    return `${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getFullYear()).slice(-2)}`;
  };
  const formatDay=iso=>{
    const d=new Date(`${iso}T12:00:00`);
    if(Number.isNaN(d.getTime()))return iso;
    return `${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}`;
  };

  const grid=[0,.25,.5,.75,1].map(q=>{
    const yy=T+(H-T-B)*q,val=hi-(hi-lo)*q;
    return `<line x1="${L}" y1="${yy}" x2="${W-R}" y2="${yy}" class="chart-grid"/><text x="${L-8}" y="${yy+4}" text-anchor="end" class="chart-axis">${formatTechNumber(val,2)}</text>`;
  }).join('');

  const buildTicks=(arr,range)=>{
    if(!arr.length)return[];
    if(range==='1W'){
      return arr.map((p,i)=>({idx:i,label:formatDay(p.date)}));
    }
    if(range==='1M'){
      const target=6,step=Math.max(1,Math.floor((arr.length-1)/(target-1))),ids=[];
      for(let i=0;i<arr.length;i+=step)ids.push(i);
      if(ids[ids.length-1]!==arr.length-1)ids.push(arr.length-1);
      return [...new Set(ids)].map(i=>({idx:i,label:formatDay(arr[i].date)}));
    }
    const monthly=[];let lastMonth='';
    arr.forEach((p,i)=>{
      const key=p.date.slice(0,7);
      if(key!==lastMonth){monthly.push({idx:i,label:formatMonth(p.date)});lastMonth=key}
    });
    const lastIdx=arr.length-1,lastLabel=formatMonth(arr[lastIdx].date);
    if(monthly.at(-1)?.label!==lastLabel)monthly.push({idx:lastIdx,label:lastLabel});
    const maxTicks=range==='3M'?4:range==='6M'?7:7;
    if(monthly.length<=maxTicks)return monthly;
    const chosen=[];
    for(let i=0;i<maxTicks;i++){
      const idx=Math.round(i*(monthly.length-1)/(maxTicks-1));
      const t=monthly[idx];
      if(t&&!chosen.some(x=>x.idx===t.idx))chosen.push(t);
    }
    return chosen;
  };

  const ticks=buildTicks(pts,state.technicalRange);
  const xgrid=ticks.map(t=>{
    const xx=x(t.idx);
    return `<line x1="${xx}" y1="${T}" x2="${xx}" y2="${H-B}" class="chart-vgrid"/><text x="${xx}" y="${H-11}" text-anchor="middle" class="chart-xaxis">${t.label}</text>`;
  }).join('');

  const paths=series.map(s=>`<path d="${svgPath(pts.map(p=>({y:numeric(p[s.key])})),x,y)}" class="chart-line ${s.cls}"/>`).join('');
  const probeLine=`<line class="chart-probe-line" x1="${L}" y1="${T}" x2="${L}" y2="${H-B}" style="display:none"/>`;
  const probeDots=series.map(s=>`<circle class="chart-probe-dot ${s.cls}" r="4" cx="0" cy="0" style="display:none"/>`).join('');

  box.innerHTML=`<div class="chart-probe-panel"><strong>Ablesewert</strong><small>Finger auf den Chart legen</small></div><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Technischer Kurschart">${grid}${xgrid}${probeLine}${paths}${probeDots}</svg>`;

  const caption=document.querySelector('.chart-axis-caption');
  if(caption)caption.textContent=state.technicalRange==='1W'
    ?'Zeitachse · Handelstage'
    :state.technicalRange==='1M'
      ?'Zeitachse · Tages-/Wochenmarken'
      :'Zeitachse · Monatsmarken';

  const strip=$('#chartDateStrip');
  if(strip)strip.innerHTML=`<span>${state.technicalRange==='1W'?'1 Woche · einzelne Handelstage':state.technicalRange==='1M'?'1 Monat · Tages-/Wochenmarken':'MM/JJ · Monatsmarken'}</span>`;

  const probe=box.querySelector('.chart-probe-panel'),line=box.querySelector('.chart-probe-line'),dots=[...box.querySelectorAll('.chart-probe-dot')];

  const pointerToIndex=clientX=>{
    const rect=box.getBoundingClientRect(),local=Math.max(0,Math.min(rect.width,clientX-rect.left));
    const viewX=local/Math.max(1,rect.width)*W,ratio=(viewX-L)/Math.max(1,W-L-R);
    return Math.max(0,Math.min(pts.length-1,Math.round(ratio*(pts.length-1))));
  };

  const showProbe=idx=>{
    const p=pts[idx];if(!p)return;
    const px=x(idx);line.setAttribute('x1',px);line.setAttribute('x2',px);line.style.display='block';
    const rows=series.map((s,i)=>{
      const v=numeric(p[s.key]),dot=dots[i];
      if(Number.isFinite(v)){
        dot.setAttribute('cx',px);dot.setAttribute('cy',y(v));dot.style.display='block';
        return `<span><i style="background:${s.color}"></i><em>${s.label}</em><b>${formatTechNumber(v,2)}</b></span>`;
      }
      if(dot)dot.style.display='none';return '';
    }).filter(Boolean).join('');
    probe.innerHTML=`<strong>${formatFullDate(p.date)}</strong><div class="probe-values">${rows}</div>`;
  };

  const interact=e=>{
    const t=e.touches?.[0]||e.changedTouches?.[0],cx=t?t.clientX:e.clientX;
    if(Number.isFinite(cx))showProbe(pointerToIndex(cx));
  };

  box.onpointerdown=interact;box.onpointermove=e=>{if(e.pointerType==='mouse'||e.buttons)interact(e)};
  box.onclick=interact;box.ontouchstart=interact;box.ontouchmove=interact;box.ontouchend=interact;
}
function technicalInterpretation(data){if(!data?.ok)return '';const m=data.metrics||{},score=Number(data.score),parts=[];if(Number.isFinite(Number(m.rsi)))parts.push(m.rsi>=70?'RSI hoch':m.rsi<=35?'RSI schwach':'RSI neutral');if(Number.isFinite(Number(m.macd))&&Number.isFinite(Number(m.macdSignal)))parts.push(m.macd>m.macdSignal?'MACD positiv':'MACD negativ');if(Number.isFinite(Number(m.sma50))&&Number.isFinite(Number(m.sma200)))parts.push(Number(data.lastPrice)>m.sma50&&m.sma50>m.sma200?'Trend aufwärts':Number(data.lastPrice)>m.sma200?'Trend gemischt':'unter 200T');const head=score>=8?'Technisch stark':score>=6?'Erholung / positiv':score<=3?'Technisch schwach':'Technisch gemischt';return head+(parts.length?' · '+parts.join(' · '):'')}function renderTechnicalWorkbench(){const data=state.technical,asset=state.positions.find(p=>p.id===state.technicalAsset);if($('#technicalAsset')&&$('#technicalAsset').options.length===0)$('#technicalAsset').innerHTML=state.positions.map(p=>`<option value="${p.id}">${p.name}</option>`).join('');if($('#technicalAsset'))$('#technicalAsset').value=state.technicalAsset;$$('.range-btn').forEach(b=>b.classList.toggle('active',b.dataset.range===state.technicalRange));if(state.technicalLoading){$('#technicalStatus').innerHTML='<span class="tech-dot grey"></span><b>Analyse wird geladen …</b>';$('#technicalMetrics').innerHTML='';$('#technicalChart').innerHTML='<div class="chart-empty">Historische Kurse werden ausgewertet …</div>';return}if(!data?.ok){
  $('#technicalStatus').innerHTML=`<span class="tech-dot grey"></span><div><b>${asset?.name||'Wertpapier'}</b><small>${data?.error||'Noch nicht analysiert'}</small></div>`;
  $('#technicalMetrics').innerHTML='';
  $('#technicalConclusion').textContent=data?.error||'Noch keine technische Aussage.';
  $('#technicalNote').textContent='';
  const tw=$('#trendWatchSummary');if(tw)tw.innerHTML=`<strong>${asset?.name||'Wertpapier'}</strong><span>${data?.error||'Noch keine technische Analyse.'}</span>`;
  drawTechnicalChart();return
}const sig=techScoreClass(Number(data.score));$('#technicalStatus').innerHTML=`<span class="tech-dot ${sig.key}"></span><div><b>${sig.label} · ${data.score}/10</b><small>${data.name} · Stand ${data.asOf||'–'}</small></div>`;const m=data.metrics||{},cards=[['RSI 14',formatTechNumber(m.rsi,1),m.checks?.rsi],['MACD',`${formatTechNumber(m.macd,3)} / ${formatTechNumber(m.macdSignal,3)}`,m.checks?.macd],['30/50/200',`${formatTechNumber(m.sma30,2)} · ${formatTechNumber(m.sma50,2)} · ${formatTechNumber(m.sma200,2)}`,m.checks?.trend],['Rel. Stärke',Number.isFinite(Number(m.relativeStrength20))?`${Number(m.relativeStrength20)>=0?'+':''}${formatTechNumber(m.relativeStrength20,2)} %`:'–',m.checks?.relative],['Volumen',Number.isFinite(Number(m.volumeRatio))?`${formatTechNumber(m.volumeRatio,2)}×`:'–',m.checks?.volume]];$('#technicalMetrics').innerHTML=cards.map(([k,v,c])=>`<div class="tech-metric-row"><span>${k}</span><strong>${v}</strong><small class="check-${c?.key||'grey'}">${c?.label||'–'}</small></div>`).join('');$('#technicalConclusion').textContent=technicalInterpretation(data);const tw=$('#trendWatchSummary');if(tw)tw.innerHTML=`<strong>${data.name}</strong><span>Trend-Score ${data.score}/10 · ${technicalInterpretation(data)}</span>`;$('#technicalNote').textContent=data.note||'';drawTechnicalChart()}
async function loadTechnical(assetId=state.technicalAsset){state.technicalAsset=assetId;state.technicalLoading=true;renderTechnicalWorkbench();try{const r=await fetch('/api/analysis',{method:'POST',headers:{'Content-Type':'application/json'},cache:'no-store',body:JSON.stringify({positionId:assetId})});const p=await r.json();if(!r.ok||!p?.ok)throw new Error(p?.error||`HTTP ${r.status}`);state.technical=p;state.technicalCache[assetId]=p}catch(e){state.technical={ok:false,error:e?.message||String(e)}}finally{state.technicalLoading=false;renderTechnicalWorkbench();if(state.page==='analysis')renderAnalysis()}}

function buildReferenceAuditSummary(){
  const rows=state.positions.map(p=>{
    const q=state.quotes[p.id],d=dailyMove(p);
    return {
      calc:d?.quality?.calcKey||'red',
      broker:d?.quality?.brokerKey||'yellow',
      eligible:Boolean(d?.eligible)
    };
  });
  return {
    total:rows.length,
    green:rows.filter(r=>r.calc==='green').length,
    red:rows.filter(r=>r.calc==='red').length,
    brokerHints:rows.filter(r=>r.broker==='yellow').length
  };
}
function renderAnalysis(){
  const scope=state.analysisScope||'all';
  const scoped=scope==='all'?state.positions:state.positions.filter(p=>p.broker===scope);
  const valued=scoped.filter(p=>Number.isFinite(value(p)));
  $('#analysisCoverage').textContent=`${valued.length} / ${scoped.length}`;
  const sorted=[...valued].sort((a,b)=>value(b)-value(a)),largest=sorted[0];
  $('#largestPosition').textContent=largest?`${largest.name} · ${eur(value(largest))}`:'–';
  const total=valued.reduce((s,p)=>s+value(p),0);
  const tr=valued.filter(p=>p.broker==='Trade Republic').reduce((s,p)=>s+value(p),0);
  $('#trShare').textContent=total?`${(tr/total*100).toFixed(1)} %`:'–';

  const withCost=valued.filter(p=>Number.isFinite(costBasis(p)));
  const cost=withCost.reduce((s,p)=>s+costBasis(p),0);
  const current=withCost.reduce((s,p)=>s+value(p),0);
  const sinceAmount=current-cost;
  const sincePct=cost>0?(current/cost-1)*100:null;

  const dayCovered=valued.filter(p=>dailyMove(p)?.eligible);
  const dayAmount=dayCovered.reduce((s,p)=>s+dailyMove(p).amount,0);
  const refValue=dayCovered.reduce((s,p)=>s+dailyMove(p).reference*Number(p.qty),0);
  const dayPct=refValue>0?dayAmount/refValue*100:null;

  $('#analysisScopeLabel').textContent=scope==='all'?'Gesamtdepot':scope==='sBroker'?'S Broker':'Trade Republic';
  $$('.analysis-scope').forEach(b=>b.classList.toggle('active',b.dataset.scope===scope));
  const cautionCount=dayCovered.filter(p=>dailyMove(p)?.quality?.brokerKey==='yellow').length;
  const excludedCount=valued.length-dayCovered.length;
  $('#dayPerformance').innerHTML=`<small>Heute</small><strong class="${dayCovered.length?(dayAmount>=0?'positive':'negative'):''}">${dayCovered.length?signedEur(dayAmount):'–'}</strong><span>${dayCovered.length?signedPct(dayPct):'Tagesreferenz baut sich auf'} · ${dayCovered.length}/${valued.length} intern belastbar${excludedCount?` · <i class="quality-dot red"></i>${excludedCount} ausgeschlossen`:''}${cautionCount?` · <i class="quality-dot yellow"></i>${cautionCount} Brokerplatz-Hinweis`:''}</span>`;
  $('#buyPerformance').innerHTML=`<small>Seit Kauf</small><strong class="${withCost.length?(sinceAmount>=0?'positive':'negative'):''}">${withCost.length?signedEur(sinceAmount):'–'}</strong><span>${withCost.length?signedPct(sincePct):'Keine Kostenbasis'} · ${withCost.length}/${scoped.length}</span>`;

  $('#positionAnalysis').innerHTML=scoped.map(p=>{
    const q=state.quotes[p.id],g=gainSinceBuy(p),d=dailyMove(p),entry=Number(p.purchasePrice);
    return `<details class="analysis-position">
      <summary>
        <div class="analysis-title"><div><b>${p.name}</b><small>${p.broker}</small></div></div>
        <div class="analysis-now"><strong>${valid(q)?eur(q.latest.price,q.latest.price<20?3:2):'–'}</strong><small>${eur(value(p))}</small></div>
      </summary>
      <div class="analysis-position-body">
        <div class="analysis-kpi analysis-today">
          <span>Heute ${d?`<i class="quality-dot ${d.quality?.calcKey||'red'}" title="${d.quality?.calcLabel||''}"></i>`:''}</span>
          <strong class="${d?(d.amount>=0?'positive':'negative'):''}">${d?signedEur(d.amount):'–'}</strong>
          <small>${d?signedPct(d.pct):'Noch keine Tagesreferenz'}${d&&!d.eligible?' · nicht im Tagesgesamtwert':''}</small>
          ${d?`<div class="daily-reference-detail">
            <b><i class="quality-dot ${d.quality?.calcKey||'red'}"></i>${d.quality?.calcLabel||'Referenz'}</b>
            <span>Aktuell ${eur(q.latest.price,q.latest.price<20?3:2)} · ${d.quality?.currentVenue||providerLabel(q)} · ${d.quality?.currentCurrency||'EUR'}</span>
            <span>Vortag ${eur(d.reference,d.reference<20?3:2)} · ${d.quality?.refVenue||'Referenzmarkt'} · ${d.quality?.refCurrency||'EUR'}${d.referenceAsOf?` · ${d.referenceAsOf}`:''}</span>
            <span>Rechnung: ${eur(q.latest.price,q.latest.price<20?3:2)} − ${eur(d.reference,d.reference<20?3:2)} = ${signedPct(d.pct)}</span>
            <em>${d.quality?.detail||d.referenceSource}</em>
            <span class="broker-quality"><i class="quality-dot ${d.quality?.brokerKey||'yellow'}"></i>${d.quality?.brokerLabel||'Brokerreferenz prüfen'}</span><span class="broker-note">Gelb = nur abweichender Brokerplatz; bei grüner Rechenbasis bleibt die Tagesrechnung gültig.</span>
          </div>`:''}
        </div>
        <div class="analysis-kpi"><span>Seit Kauf</span><strong class="${g?(g.amount>=0?'positive':'negative'):''}">${g?signedEur(g.amount):'–'}</strong><small>${g?signedPct(g.pct):'Keine Kostenbasis'}</small></div>
        <div class="analysis-kpi"><span>Einstand</span><strong>${Number.isFinite(entry)?eur(entry):'–'}</strong><small>${Number(p.qty).toLocaleString('de-DE',{maximumFractionDigits:6})} ${p.assetType==='Krypto'?'ETH':'Stück'}</small></div>
        <div class="analysis-kpi"><span>Quelle</span><strong>${providerLabel(q)}</strong><small>${priceLabel(p)}</small></div>
      </div>
    </details>`;
  }).join('');

  $('#sourceAnalysis').innerHTML=scoped.map(p=>{
    const q=state.quotes[p.id];
    return `<div class="source-row"><b>${p.name}</b><small>${valid(q)?sourceDetail(q):'Kein neuer Kurs'} · ${priceLabel(p)}</small></div>`;
  }).join('');
  renderTechnicalWorkbench();
  const missing=scoped.filter(p=>!valid(state.quotes[p.id]));
  $('#missingAnalysis').innerHTML=missing.length?missing.map(p=>`<div class="source-row"><b>${p.name}</b><small>Kein verwertbarer Kurs im aktuellen Snapshot</small></div>`).join(''):'<p class="micro">Keine Kursprobleme.</p>';

  const audit=buildReferenceAuditSummary();
  const auditEl=$('#referenceAudit');
  if(auditEl)auditEl.innerHTML=`<div class="reference-audit-head"><b>Tagesreferenz-Audit</b><span><i class="quality-dot green"></i>${audit.green} intern belastbar · <i class="quality-dot red"></i>${audit.red} ausgeschlossen · <i class="quality-dot yellow"></i>${audit.brokerHints} Brokerhinweise</span></div>`;
}
function renderMore(){}
function render(){
  $$('.page').forEach(x=>x.classList.toggle('active',x.id===`page-${state.page}`));
  $$('.nav-btn').forEach(x=>x.classList.toggle('active',x.dataset.page===state.page));
  const titles={overview:'Übersicht',positions:'Positionen',transaction:'Transaktionen',analysis:'Analyse',more:'Mehr'};
  $('#pageTitle').textContent=titles[state.page];
  $$('.broker-tab').forEach(x=>x.classList.toggle('active',x.dataset.broker===state.broker));
  if(state.page==='overview')renderOverview();
  if(state.page==='positions')renderPositions();
  if(state.page==='transaction')renderTransactions();
  if(state.page==='analysis')renderAnalysis();
  if(state.page==='more')renderMore();
}
function go(page){state.page=page;window.scrollTo({top:0,behavior:'instant'});render();updateAnalysisLandscape();if(page==='analysis'&&!state.technical)loadTechnical(state.technicalAsset);if(page==='overview'&&!state.dailyMovers)loadDailyMovers()}
function wireDynamic(){
  $$('[data-compact-id]').forEach(x=>x.onclick=()=>x.classList.toggle('open'));
  $$('.position-card').forEach(x=>x.querySelector('.position-head').onclick=()=>x.classList.toggle('open'));
  $$('[data-go]').forEach(x=>x.onclick=()=>go(x.dataset.go));
}
async function refresh(){
  const b=$('#refresh');b.disabled=true;b.textContent='…';$('#message').textContent='Kursabruf läuft …';
  try{
    const r=await fetch('/api/market-data',{method:'POST',headers:{'Content-Type':'application/json'},cache:'no-store',body:JSON.stringify({positions:state.positions})});
    const ct=r.headers.get('content-type')||''; if(!ct.includes('application/json'))throw new Error(`Marktdaten-Endpunkt nicht aktiv (HTTP ${r.status})`);
    const p=await r.json(); if(!r.ok||!p?.ok)throw new Error(p?.error||`HTTP ${r.status}`);
    mergeSnapshot(p); const good=(p.results||[]).filter(valid).length,eth=(p.results||[]).find(x=>x.id==='ethereum');
    $('#message').textContent=`${good}/${state.positions.length} neue Kurse`;
    loadDailyMovers();
    render(); toast('Marktdaten aktualisiert');
  }catch(e){$('#message').textContent='Abruf fehlgeschlagen';toast(e?.message||String(e));}
  finally{b.disabled=false;b.textContent='↻'}
}
function saveTransaction(){
  let positionId=$('#txPosition').value;
  const qty=num($('#txQty').value),price=num($('#txPrice').value),fees=num($('#txFees').value)||0,date=$('#txDate').value||new Date().toISOString().slice(0,10);
  const venue=String($('#txVenue')?.value||'').trim();
  const brokerAmount=num($('#txAmount')?.value);
  if(!(qty>0)||!(price>0))return toast('Stückzahl und Kurs prüfen');

  let p=null;
  if(state.txKind==='BUY'&&positionId==='__NEW__'){
    applyCatalogToNewForm();
    const built=buildNewPosition();
    if(built.error)return toast(built.error);
    p=built.position;
    const duplicate=state.positions.find(x=>x.id===p.id||String(x.isin||'').toUpperCase()===String(p.isin||'').toUpperCase());
    if(duplicate)p=duplicate;
    else state.positions.push(p);
    positionId=p.id;
  }else{
    p=state.positions.find(x=>x.id===positionId);
  }
  if(!p)return toast('Position nicht gefunden');

  if(state.txKind==='SELL'&&qty>Number(p.qty)+1e-9)return toast('Verkauf über Bestand nicht möglich');

  const beforeQty=Number(p.qty)||0;
  if(state.txKind==='BUY'){
    const oldEntry=Number(p.purchasePrice)||0,newQty=beforeQty+qty;
    p.purchasePrice=newQty?((beforeQty*oldEntry)+(qty*price)+fees)/newQty:price;
    p.purchaseTotal=(Number(p.purchaseTotal)||beforeQty*oldEntry)+(qty*price)+fees;
    p.qty=newQty;
    state.closedIds=state.closedIds.filter(id=>id!==p.id);
  }else{
    p.qty=Math.max(0,beforeQty-qty);
  }

  const amount=Number.isFinite(brokerAmount)&&brokerAmount>0?(state.txKind==='BUY'?brokerAmount:-brokerAmount):(state.txKind==='BUY'?(qty*price+fees):-(qty*price-fees));
  state.transactions=mergeTransactions(state.transactions,[{
    id:crypto.randomUUID?.()||String(Date.now()),
    positionId:p.id,positionName:p.name,isin:p.isin||'',kind:state.txKind,
    qty,price,fees,date,venue,amount,createdAt:new Date().toISOString()
  }]);

  if(state.txKind==='SELL'&&p.qty<=1e-9){
    state.closedIds=[...new Set([...state.closedIds,p.id])];
    state.positions=state.positions.filter(x=>x.id!==p.id);
    delete state.quotes[p.id];
    delete state.technicalCache[p.id];
    if(state.technicalAsset===p.id){
      state.technicalAsset=state.positions[0]?.id||'';
      state.technical=null;
    }
  }

  reconcilePositionsWithLedger();
  enrichPersistedPositions();
  persist();
  $('#txQty').value='';$('#txPrice').value='';$('#txFees').value='0';
  if($('#txVenue'))$('#txVenue').value='';if($('#txAmount'))$('#txAmount').value='';
  if($('#txPosition'))$('#txPosition').dataset.keepNew='0';
  render();
  toast(state.txKind==='BUY'?'Kauf gespeichert':'Verkauf gespeichert');
}
async function diagnose(){
  const lines=[`Depot-Cockpit ${APP_VERSION}`,`Positionen: ${state.positions.length}`,`Kurse im Snapshot: ${Object.keys(state.quotes).length}`,`Letzter Stand: ${state.updatedAt||'–'}`];
  try{const r=await fetch('/api/health',{cache:'no-store'});lines.push(`Health API: HTTP ${r.status}`);if(r.ok)lines.push(JSON.stringify(await r.json()))}catch(e){lines.push('Health API: '+(e?.message||e))}
  lines.push(`Ethereum: ${valid(state.quotes.ethereum)?providerLabel(state.quotes.ethereum)+' '+eur(state.quotes.ethereum.latest.price):'FEHLT'}`);
  const missing=state.positions.filter(p=>!valid(state.quotes[p.id])).map(p=>p.name);lines.push(`Ohne gültigen Kurs: ${missing.length?missing.join(', '):'keine'}`);
  $('#diagOutput').textContent=lines.join('\n');
}
function exportData(){$('#exportBox').value=JSON.stringify({version:APP_VERSION,exportedAt:new Date().toISOString(),positions:state.positions,transactions:state.transactions,snapshot:state.quotes},null,2);toast('Export vorbereitet')}

load();
$('#refresh').onclick=refresh;
$$('.nav-btn').forEach(b=>b.onclick=()=>go(b.dataset.page));
$$('.broker-tab').forEach(b=>b.onclick=()=>{state.broker=b.dataset.broker;render()});
$$('.chip').forEach(b=>b.onclick=()=>{state.type=b.dataset.type;$$('.chip').forEach(x=>x.classList.toggle('active',x===b));renderPositions()});
$$('.analysis-scope').forEach(b=>b.onclick=()=>{state.analysisScope=b.dataset.scope;renderAnalysis()});
$$('.mover-tab').forEach(b=>b.onclick=()=>{state.moverMode=b.dataset.mode;renderDailyMovers()});
$$('[data-tx-kind]').forEach(b=>b.onclick=()=>{state.txKind=b.dataset.txKind;$$('[data-tx-kind]').forEach(x=>x.classList.toggle('active',x===b));if($('#txPosition'))$('#txPosition').dataset.keepNew='0';renderTransactions()});
$('#addNewPositionBtn')?.addEventListener('click',activateNewPositionForm);
$('#txPosition').onchange=()=>{
  const isNew=$('#txPosition').value==='__NEW__';
  $('#txPosition').dataset.keepNew=isNew?'1':'0';
  const box=$('#txNewPositionBox');if(box)box.hidden=!isNew;
  if(isNew)setTimeout(()=>$('#txNewIsin')?.focus(),0);
};
['input','change','blur'].forEach(ev=>$('#txNewIsin')?.addEventListener(ev,applyCatalogToNewForm));
$('#txNewIsin')?.addEventListener('paste',()=>setTimeout(applyCatalogToNewForm,0));
$('#saveTx').onclick=saveTransaction;$('#runDiag').onclick=diagnose;$('#exportBtn').onclick=exportData;
$('#technicalAsset').onchange=e=>loadTechnical(e.target.value);$$('.range-btn').forEach(b=>b.onclick=()=>{state.technicalRange=b.dataset.range;renderTechnicalWorkbench()});['toggleClose','toggle30','toggle50','toggle200'].forEach(id=>document.getElementById(id)?.addEventListener('change',drawTechnicalChart));$('#reloadTechnical').onclick=()=>loadTechnical(state.technicalAsset);
document.getElementById('reloadMovers')?.addEventListener('click',loadDailyMovers);
render();

function stabilizeViewport(){
  document.documentElement.style.setProperty('--app-vh', `${window.visualViewport?.height||window.innerHeight}px`);
}
window.visualViewport?.addEventListener('resize',stabilizeViewport);
window.visualViewport?.addEventListener('scroll',stabilizeViewport);
window.addEventListener('orientationchange',stabilizeViewport);
stabilizeViewport();

function updateBottomDock(){
  const vv=window.visualViewport;
  const browserBottom=vv?Math.max(0,window.innerHeight-(vv.offsetTop+vv.height)):0;
  document.documentElement.style.setProperty('--browser-bottom',`${Math.round(browserBottom)}px`);
}
window.visualViewport?.addEventListener('resize',updateBottomDock);
window.visualViewport?.addEventListener('scroll',updateBottomDock);
window.addEventListener('resize',updateBottomDock);
updateBottomDock();

function updateAnalysisLandscape(){
  document.documentElement.classList.toggle('analysis-landscape',window.matchMedia('(orientation: landscape)').matches&&state.page==='analysis');
}
window.addEventListener('orientationchange',()=>setTimeout(updateAnalysisLandscape,100));
window.addEventListener('resize',updateAnalysisLandscape);
if(!state.dailyMovers)setTimeout(loadDailyMovers,180);
