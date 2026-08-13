/* Depot-Cockpit Professional 5.9.8
   SPACEX QUANTITY REPAIR
   Narrow one-time repair only.
   It does NOT touch quote logic, transaction recording, market data or other positions.

   Background:
   5.9.7 restored SpaceX with a conservative emergency quantity of 10.
   The verified pre-regression position shown in the app was 20.437 shares.
   This patch upgrades ONLY that emergency-restored 10-share record to 20.437,
   and only when there is no transaction evidence explaining a 10-share balance.
*/
(() => {
  'use strict';

  const STORE = 'th66-professional-master-v5';
  const HISTORY = 'th66-professional-master-v5-history';
  const MARKER = 'th66-repair-598-spacex-qty-v1';
  const ISIN = 'US84615Q1031';
  const VERIFIED_QTY = 20.437;
  const EMERGENCY_QTY_597 = 10;

  function parse(raw) {
    try {
      const x = JSON.parse(raw || '');
      return x && Array.isArray(x.positions) && Array.isArray(x.transactions) && Array.isArray(x.archive) ? x : null;
    } catch {
      return null;
    }
  }

  function sxTxs(snapshot) {
    return (snapshot.transactions || []).filter(t =>
      String(t?.isin || '').toUpperCase() === ISIN ||
      String(t?.name || '').toLowerCase().includes('space explor')
    );
  }

  function transactionBalance(txs) {
    if (!txs.length) return null;
    let balance = 0;
    let usable = 0;
    for (const t of txs) {
      const q = Number(t?.qty);
      if (!Number.isFinite(q) || q <= 0) continue;
      const type = String(t?.type || '').toUpperCase();
      if (type === 'BUY') { balance += q; usable++; }
      else if (type === 'SELL') { balance -= q; usable++; }
    }
    return usable ? Math.round(balance * 1e6) / 1e6 : null;
  }

  function writeHistory(snapshot) {
    let history = [];
    try {
      history = JSON.parse(localStorage.getItem(HISTORY) || '[]');
      if (!Array.isArray(history)) history = [];
    } catch {
      history = [];
    }
    history.unshift({
      savedAt: new Date().toISOString(),
      reason: 'pre-5.9.8-spacex-quantity-repair',
      snapshot: JSON.parse(JSON.stringify(snapshot))
    });
    localStorage.setItem(HISTORY, JSON.stringify(history.slice(0, 5)));
  }

  if (localStorage.getItem(MARKER) === 'done') return;

  const snapshot = parse(localStorage.getItem(STORE));
  if (!snapshot) return;

  const p = snapshot.positions.find(x => String(x?.isin || '').toUpperCase() === ISIN);
  if (!p) {
    // 5.9.7 is responsible for existence protection; do not create another duplicate here.
    localStorage.setItem(MARKER, 'done-no-position');
    return;
  }

  const archived = snapshot.archive.some(x => String(x?.isin || '').toUpperCase() === ISIN);
  if (archived) {
    localStorage.setItem(MARKER, 'done-archived');
    return;
  }

  const txs = sxTxs(snapshot);
  const txBalance = transactionBalance(txs);
  const currentQty = Number(p.qty);

  // If complete transaction evidence exists and produces a positive balance,
  // transaction history has priority over any hard-coded repair value.
  if (Number.isFinite(txBalance) && txBalance > 0) {
    if (Math.abs(currentQty - txBalance) > 1e-6) {
      writeHistory(snapshot);
      p.qty = txBalance;
      p.quantityRepair598 = {
        source: 'transaction-history',
        previousQty: currentQty,
        repairedQty: txBalance,
        at: new Date().toISOString()
      };
      snapshot.savedAt = new Date().toISOString();
      localStorage.setItem(STORE, JSON.stringify(snapshot));
    }
    localStorage.setItem(MARKER, 'done-from-transactions');
    return;
  }

  // No usable transaction history remains in this origin.
  // Repair only the exact 5.9.7 emergency value; never overwrite a different live quantity.
  if (Math.abs(currentQty - EMERGENCY_QTY_597) <= 1e-6) {
    writeHistory(snapshot);
    p.qty = VERIFIED_QTY;
    p.quantityRepair598 = {
      source: 'verified-pre-regression-position',
      previousQty: currentQty,
      repairedQty: VERIFIED_QTY,
      isin: ISIN,
      at: new Date().toISOString()
    };
    snapshot.savedAt = new Date().toISOString();
    localStorage.setItem(STORE, JSON.stringify(snapshot));
    localStorage.setItem(MARKER, 'done-verified-qty');
  } else {
    localStorage.setItem(MARKER, 'done-no-change');
  }

  window.__DC_REPAIR_598__ = {
    isin: ISIN,
    verifiedQty: VERIFIED_QTY,
    currentQty: Number(p.qty),
    transactionBalance: txBalance,
    transactionCount: txs.length
  };

  console.info('Depot-Cockpit 5.9.8 SpaceX quantity repair', window.__DC_REPAIR_598__);
})();