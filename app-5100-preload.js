/* Depot-Cockpit Professional 5.10.0
   UNIFIED SPACEX SAFE-STEP
   Goal: combine the proven 5.9.2 market-data path with the protected 5.9.8 quantity state.
   Scope is intentionally limited to ISIN US84615Q1031.

   Invariants:
   - Existing non-SpaceX positions and transactions are untouched.
   - A verified SpaceX quantity other than the old 5.9.7 emergency value 10 is never overwritten.
   - Transaction evidence has priority when it yields a positive balance.
   - Missing SpaceX may be restored only when it is not archived.
   - SpaceX is normalized for the existing 5.9.2 market core: ISIN-first, German symbol SPX, EUR.
*/
(() => {
  'use strict';

  const STORE = 'th66-professional-master-v5';
  const HISTORY = 'th66-professional-master-v5-history';
  const ISIN = 'US84615Q1031';
  const VERIFIED_QTY = 20.437;
  const OLD_EMERGENCY_QTY = 10;
  const AUTO_REFRESH_MARKER = 'th66-5100-spacex-refresh-v1';

  function clone(x) { return JSON.parse(JSON.stringify(x)); }
  function parse(raw) {
    try {
      const x = JSON.parse(raw || '');
      return x && Array.isArray(x.positions) && Array.isArray(x.transactions) && Array.isArray(x.archive) ? x : null;
    } catch { return null; }
  }
  function isSpaceX(x) {
    return String(x?.isin || '').trim().toUpperCase() === ISIN ||
      String(x?.name || '').toLowerCase().includes('space exploration');
  }
  function txBalance(snapshot) {
    const txs = (snapshot.transactions || []).filter(isSpaceX);
    if (!txs.length) return null;
    let balance = 0, usable = 0;
    for (const t of txs) {
      const q = Number(t?.qty);
      if (!Number.isFinite(q) || q <= 0) continue;
      const type = String(t?.type || '').toUpperCase();
      if (type === 'BUY') { balance += q; usable++; }
      else if (type === 'SELL') { balance -= q; usable++; }
    }
    return usable ? Math.round(balance * 1e6) / 1e6 : null;
  }
  function saveHistory(snapshot, reason) {
    let h = [];
    try { h = JSON.parse(localStorage.getItem(HISTORY) || '[]'); if (!Array.isArray(h)) h = []; } catch { h = []; }
    h.unshift({ savedAt:new Date().toISOString(), reason, snapshot:clone(snapshot) });
    localStorage.setItem(HISTORY, JSON.stringify(h.slice(0, 5)));
  }

  const snapshot = parse(localStorage.getItem(STORE));
  if (!snapshot) return;

  const archived = (snapshot.archive || []).some(isSpaceX);
  let p = (snapshot.positions || []).find(isSpaceX);
  const balance = txBalance(snapshot);
  let changed = false;
  const changes = [];

  if (!p && !archived) {
    saveHistory(snapshot, 'pre-5.10.0-unified-spacex-restore');
    p = {
      id:'custom-spacex-us84615q1031',
      name:'Space Explorations Technology A',
      isin:ISIN,
      wkn:'A42D4F',
      qty:Number.isFinite(balance) && balance > 0 ? balance : VERIFIED_QTY,
      broker:'Trade Republic',
      brokerDisplaySource:'Lang & Schwarz',
      brokerVenue:'Lang & Schwarz',
      analysisVenue:'Xetra',
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
    };
    snapshot.positions.push(p);
    changed = true;
    changes.push('restored-position');
  }

  if (!p) {
    window.__DC_SPACEX_UNIFIED_5100__ = { ok:true, archived:true, changed:false };
    return;
  }

  const currentQty = Number(p.qty);
  if (Number.isFinite(balance) && balance > 0 && Number.isFinite(currentQty) && Math.abs(currentQty - balance) > 1e-6) {
    saveHistory(snapshot, 'pre-5.10.0-spacex-transaction-reconcile');
    p.qty = balance;
    changed = true;
    changes.push(`qty-from-transactions:${currentQty}->${balance}`);
  } else if (!(Number.isFinite(balance) && balance > 0) && Math.abs(currentQty - OLD_EMERGENCY_QTY) <= 1e-6) {
    saveHistory(snapshot, 'pre-5.10.0-spacex-emergency-qty-repair');
    p.qty = VERIFIED_QTY;
    changed = true;
    changes.push(`qty-emergency-repair:${OLD_EMERGENCY_QTY}->${VERIFIED_QTY}`);
  }

  const master = {
    name:'Space Explorations Technology A',
    isin:ISIN,
    wkn:'A42D4F',
    broker:'Trade Republic',
    analysisSymbol:'SPX',
    marketSymbol:'SPX',
    analysisVenue:'Xetra',
    analysisExchangeCode:'DE',
    exchangeCode:'DE',
    currency:'EUR',
    dataSource:'DB_DELAYED',
    assetType:'Aktie',
    type:'Aktie'
  };
  for (const [k,v] of Object.entries(master)) {
    if (p[k] !== v) { p[k] = v; changed = true; changes.push(`master:${k}`); }
  }
  if (!Array.isArray(p.fallbackVenues) || !['Xetra','Frankfurt','Stuttgart'].every(v => p.fallbackVenues.includes(v))) {
    p.fallbackVenues = ['Xetra','Frankfurt','Stuttgart'];
    changed = true;
    changes.push('master:fallbackVenues');
  }

  if (changed) {
    snapshot.savedAt = new Date().toISOString();
    snapshot.unified5100 = { at:snapshot.savedAt, isin:ISIN, changes };
    localStorage.setItem(STORE, JSON.stringify(snapshot));
  }

  window.__DC_SPACEX_UNIFIED_5100__ = {
    ok:true,
    changed,
    changes,
    isin:ISIN,
    qty:Number(p.qty),
    transactionBalance:balance,
    symbol:p.analysisSymbol,
    venue:p.analysisVenue,
    currency:p.currency
  };

  // One automatic refresh only when SpaceX has no usable quote yet.
  // This reuses the proven 5.9.2 refresh path rather than creating a second client-side quote engine.
  window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      try {
        if (sessionStorage.getItem(AUTO_REFRESH_MARKER) === 'done') return;
        const live = window.state?.data?.[p.id];
        const hasQuote = live?.ok && Number.isFinite(Number(live?.latest?.price));
        if (hasQuote) return;
        const btn = document.getElementById('refreshBtn');
        if (!btn || btn.disabled) return;
        sessionStorage.setItem(AUTO_REFRESH_MARKER, 'done');
        btn.click();
      } catch (e) { console.warn('5.10.0 SpaceX auto-refresh skipped', e); }
    }, 1200);
  });

  console.info('Depot-Cockpit 5.10.0 Unified SpaceX active', window.__DC_SPACEX_UNIFIED_5100__);
})();
