/* Depot-Cockpit Professional 5.11.2
   CLEAN CONSOLIDATED PRELOAD
   Replaces: app-597-preload.js, app-598-preload.js, app-599-preload.js, app-5100-preload.js.

   Responsibilities are deliberately limited:
   1) Protect active positions and transaction history from accidental regression.
   2) Keep rollback snapshots before accepted portfolio writes.
   3) Normalize the verified SpaceX position idempotently (20.437 shares, EUR routing).
   4) Never change other instruments merely because SpaceX needs normalization.
*/
(() => {
  'use strict';

  const VERSION = '5.11.2';
  const STORE = 'th66-professional-master-v5';
  const BACKUP = 'th66-professional-master-v5-regression-lock';
  const HISTORY = 'th66-professional-master-v5-history';
  const MAX_HISTORY = 5;
  const nativeSetItem = Storage.prototype.setItem;

  const SPACEX = Object.freeze({
    id:'custom-spacex-us84615q1031',
    name:'Space Explorations Technology A',
    isin:'US84615Q1031',
    wkn:'A42D4F',
    qty:20.437,
    broker:'Trade Republic',
    brokerDisplaySource:'Lang & Schwarz',
    brokerVenue:'Lang & Schwarz',
    analysisVenue:'Frankfurt',
    analysisExchangeCode:'DE',
    exchangeCode:'DE',
    fallbackVenues:['Xetra','Frankfurt','Stuttgart'],
    dataSource:'DB_DELAYED',
    analysisSymbol:'SPX',
    marketSymbol:'SPX',
    currency:'EUR',
    purchasePrice:null,
    assetType:'Aktie',
    type:'Aktie'
  });



  const ETHEREUM = Object.freeze({
    id:'ethereum',
    name:'Ethereum',
    isin:'',
    wkn:'',
    qty:3.363942,
    broker:'Trade Republic',
    brokerDisplaySource:'Trade Republic',
    brokerVenue:'Krypto',
    analysisVenue:'Krypto',
    analysisExchangeCode:'CRYPTO',
    exchangeCode:'CRYPTO',
    fallbackVenues:[],
    dataSource:'CRYPTO',
    analysisSymbol:'ETH',
    marketSymbol:'ETH',
    currency:'EUR',
    purchasePrice:3567.24,
    purchaseTotal:12000,
    assetType:'Krypto',
    type:'Krypto'
  });

  const FRESH_CANONICAL_POSITIONS = Object.freeze([
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
    {id:'trilogy',name:'Trilogy Metals',isin:'CA89621C1059',wkn:'A14XMF',qty:600,broker:'Trade Republic',brokerDisplaySource:'Lang & Schwarz',analysisVenue:'Manuell',fallbackVenues:['Manuell'],dataSource:'TRILOGY_YAHOO',analysisSymbol:'TMQ',currency:'EUR',purchasePrice:null},
    SPACEX,
    ETHEREUM
  ]);

  function isEthereum(x) {
    return String(x?.id || '').trim().toLowerCase() === 'ethereum' ||
      String(x?.name || '').trim().toLowerCase() === 'ethereum';
  }

  function seedOrRepairRequiredPortfolio() {
    const raw = localStorage.getItem(STORE);
    const existing = parse(raw);

    // Fresh Vercel/deployment host: seed the complete 14-position canonical baseline BEFORE app.js loads.
    if (!existing) {
      const fresh = {
        schemaVersion:3,
        savedAt:new Date().toISOString(),
        positions:FRESH_CANONICAL_POSITIONS.map(clone),
        archive:[],
        transactions:[],
        settings:{},
        initializedBy:'5.11.2-fresh-canonical-14'
      };
      nativeSetItem.call(localStorage, STORE, JSON.stringify(fresh));
      return {changed:true, mode:'fresh-seed', count:fresh.positions.length};
    }

    // Existing store: never replace user holdings. Only restore the two confirmed special positions
    // when they are neither active nor intentionally archived.
    const archived = existing.archive || [];
    let changed = false;
    if (!(existing.positions || []).some(isSpaceX) && !archived.some(isSpaceX)) {
      existing.positions.push(clone(SPACEX));
      changed = true;
    }
    if (!(existing.positions || []).some(isEthereum) && !archived.some(isEthereum)) {
      existing.positions.push(clone(ETHEREUM));
      changed = true;
    }
    if (changed) {
      existing.savedAt = new Date().toISOString();
      existing.repairedBy = '5.11.2-required-positions';
      nativeSetItem.call(localStorage, STORE, JSON.stringify(existing));
    }
    return {changed, mode:'existing-merge', count:(existing.positions || []).length};
  }

  const clone = x => JSON.parse(JSON.stringify(x));
  function parse(raw) {
    if (!raw) return null;
    try {
      const x = JSON.parse(raw);
      return x && typeof x === 'object' && Array.isArray(x.positions) &&
        Array.isArray(x.transactions) && Array.isArray(x.archive) ? x : null;
    } catch { return null; }
  }
  function identity(x) {
    const isin = String(x?.isin || '').trim().toUpperCase();
    if (isin) return 'isin:' + isin;
    const id = String(x?.id || x?.positionId || '').trim();
    if (id) return 'id:' + id;
    return 'name:' + String(x?.name || '').trim().toLowerCase();
  }
  function isSpaceX(x) {
    return String(x?.isin || '').trim().toUpperCase() === SPACEX.isin ||
      String(x?.name || '').toLowerCase().includes('space exploration');
  }
  function txIdentity(t) {
    if (t?.id) return 'id:' + t.id;
    return [String(t?.type||''), String(t?.date||''), identity(t), Number(t?.qty||0),
      Number(t?.price||0), Number(t?.fees||0)].join('|');
  }
  function archivedKeys(snapshot) {
    return new Set((snapshot.archive || []).map(identity));
  }
  function newTransactions(previous, candidate) {
    const old = new Set((previous.transactions || []).map(txIdentity));
    return (candidate.transactions || []).filter(t => !old.has(txIdentity(t)));
  }
  function hasNewSellFor(position, previous, candidate) {
    const key = identity(position);
    return newTransactions(previous, candidate).some(t => {
      if (String(t?.type || '').toUpperCase() !== 'SELL') return false;
      const pid = String(t?.positionId || '');
      const isin = String(t?.isin || '').toUpperCase();
      return (position.id && pid === String(position.id)) ||
        (position.isin && isin === String(position.isin).toUpperCase()) || identity(t) === key;
    });
  }
  function unionTransactions(previous, candidate) {
    const out = [], seen = new Set();
    for (const t of [...(candidate.transactions || []), ...(previous.transactions || [])]) {
      const k = txIdentity(t); if (seen.has(k)) continue; seen.add(k); out.push(t);
    }
    return out;
  }
  function harden(previous, candidate) {
    if (!previous) return candidate;
    const next = clone(candidate);
    const archived = archivedKeys(next);
    const byKey = new Map((next.positions || []).map(p => [identity(p), p]));
    for (const oldPos of previous.positions || []) {
      const k = identity(oldPos), newPos = byKey.get(k);
      if (!newPos) {
        if (!archived.has(k)) { next.positions.push(clone(oldPos)); byKey.set(k, next.positions.at(-1)); }
        continue;
      }
      const oldQty = Number(oldPos.qty), newQty = Number(newPos.qty);
      if (Number.isFinite(oldQty) && Number.isFinite(newQty) && newQty < oldQty &&
          !hasNewSellFor(oldPos, previous, next)) newPos.qty = oldQty;
    }
    next.transactions = unionTransactions(previous, next);
    return next;
  }
  function pushHistory(raw, reason='accepted-write') {
    const current = parse(raw); if (!current) return;
    let h=[]; try { h=JSON.parse(localStorage.getItem(HISTORY)||'[]'); if(!Array.isArray(h))h=[]; } catch {}
    h.unshift({savedAt:new Date().toISOString(), reason, snapshot:current});
    nativeSetItem.call(localStorage, HISTORY, JSON.stringify(h.slice(0, MAX_HISTORY)));
  }
  function writeBackup(raw, reason) {
    if (!parse(raw)) return;
    nativeSetItem.call(localStorage, BACKUP, raw);
    pushHistory(raw, reason);
  }
  function recoverFromBackupIfRicher() {
    const primaryRaw=localStorage.getItem(STORE), backupRaw=localStorage.getItem(BACKUP);
    const primary=parse(primaryRaw), backup=parse(backupRaw); if(!primary||!backup)return;
    const merged=harden(backup, primary);
    if (JSON.stringify(merged)!==JSON.stringify(primary)) nativeSetItem.call(localStorage, STORE, JSON.stringify(merged));
  }
  function transactionBalance(snapshot) {
    const txs=(snapshot.transactions||[]).filter(isSpaceX); if(!txs.length)return null;
    let balance=0, usable=0;
    for(const t of txs){
      const q=Number(t?.qty); if(!Number.isFinite(q)||q<=0)continue;
      const type=String(t?.type||'').toUpperCase();
      if(type==='BUY'){balance+=q;usable++;} else if(type==='SELL'){balance-=q;usable++;}
    }
    return usable ? Math.round(balance*1e6)/1e6 : null;
  }
  function normalizeSpaceX() {
    const raw=localStorage.getItem(STORE), snap=parse(raw); if(!snap)return {changed:false,reason:'no-store'};
    if((snap.archive||[]).some(isSpaceX)) return {changed:false,reason:'archived'};
    let p=(snap.positions||[]).find(isSpaceX), changed=false, changes=[];
    const balance=transactionBalance(snap);
    if(!p){
      p=clone(SPACEX);
      if(Number.isFinite(balance)&&balance>0)p.qty=balance;
      snap.positions.push(p); changed=true; changes.push('restore');
    }
    const currentQty=Number(p.qty);
    if(currentQty===10){
      const wanted=Number.isFinite(balance)&&balance>0 ? balance : SPACEX.qty;
      if(wanted!==currentQty){p.qty=wanted;changed=true;changes.push('qty');}
    }
    const route={
      name:SPACEX.name, isin:SPACEX.isin, wkn:SPACEX.wkn, broker:SPACEX.broker,
      brokerDisplaySource:SPACEX.brokerDisplaySource, brokerVenue:SPACEX.brokerVenue,
      analysisVenue:SPACEX.analysisVenue, analysisExchangeCode:SPACEX.analysisExchangeCode,
      exchangeCode:SPACEX.exchangeCode, fallbackVenues:[...SPACEX.fallbackVenues], dataSource:SPACEX.dataSource,
      analysisSymbol:SPACEX.analysisSymbol, marketSymbol:SPACEX.marketSymbol, currency:'EUR',
      assetType:'Aktie', type:'Aktie'
    };
    for(const [k,v] of Object.entries(route)){
      if(JSON.stringify(p[k])!==JSON.stringify(v)){p[k]=v;changed=true;changes.push(k);}
    }
    if(changed){
      writeBackup(raw,'pre-5.11.2-spacex-normalize');
      snap.savedAt=new Date().toISOString();
      snap.normalized5101={at:snap.savedAt, isin:SPACEX.isin, changes:[...new Set(changes)]};
      nativeSetItem.call(localStorage, STORE, JSON.stringify(snap));
    }
    return {changed,qty:Number(p.qty),changes:[...new Set(changes)]};
  }

  const portfolioResult = seedOrRepairRequiredPortfolio();
  recoverFromBackupIfRicher();
  const spaceXResult = normalizeSpaceX();

  Storage.prototype.setItem = function(key, value) {
    if(this===localStorage && key===STORE){
      const previousRaw=localStorage.getItem(STORE), previous=parse(previousRaw), candidate=parse(String(value));
      if(candidate){
        const hardened=harden(previous,candidate);
        if(previousRaw&&previous)writeBackup(previousRaw,'pre-accepted-write');
        return nativeSetItem.call(this,key,JSON.stringify(hardened));
      }
    }
    return nativeSetItem.call(this,key,value);
  };

  window.__DC_PRELOAD__={version:VERSION,store:STORE,backup:BACKUP,history:HISTORY,portfolio:portfolioResult,spaceX:spaceXResult};
  console.info('Depot-Cockpit 5.11.2 clean preload active', window.__DC_PRELOAD__);
})();
