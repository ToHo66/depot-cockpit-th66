/* Depot-Cockpit Professional 5.9.7
   DATA REGRESSION LOCK + ONE-TIME SPACEX REPAIR
   Executes before app.js.

   Invariants:
   1) A normal save may never silently lose an active position.
   2) A normal save may never silently lose transaction history.
   3) Legitimate full sales are allowed when the position is archived.
   4) Legitimate partial sales are allowed when a new SELL transaction explains the quantity decrease.
   5) Before every accepted write, the previous valid snapshot is retained as a rollback copy.
*/
(() => {
  'use strict';

  const STORE = 'th66-professional-master-v5';
  const BACKUP = 'th66-professional-master-v5-regression-lock';
  const HISTORY = 'th66-professional-master-v5-history';
  const REPAIR_MARKER = 'th66-repair-597-spacex-v1';
  const MAX_HISTORY = 5;

  const SPACEX = {
    id: 'custom-spacex-us84615q1031',
    name: 'Space Explorations Technology A',
    isin: 'US84615Q1031',
    wkn: 'A42D4F',
    qty: 10,
    broker: 'Trade Republic',
    brokerDisplaySource: 'Lang & Schwarz',
    brokerVenue: 'Lang & Schwarz',
    analysisVenue: 'Manuell',
    fallbackVenues: ['Manuell'],
    dataSource: 'MANUAL',
    analysisSymbol: '',
    marketSymbol: '',
    currency: 'EUR',
    purchasePrice: null,
    assetType: 'Aktie',
    type: 'Aktie'
  };

  function parse(raw) {
    if (!raw) return null;
    try {
      const x = JSON.parse(raw);
      if (!x || typeof x !== 'object') return null;
      if (!Array.isArray(x.positions) || !Array.isArray(x.transactions) || !Array.isArray(x.archive)) return null;
      return x;
    } catch {
      return null;
    }
  }

  function identity(x) {
    const isin = String(x?.isin || '').trim().toUpperCase();
    if (isin) return 'isin:' + isin;
    const id = String(x?.id || x?.positionId || '').trim();
    if (id) return 'id:' + id;
    return 'name:' + String(x?.name || '').trim().toLowerCase();
  }

  function txIdentity(t) {
    if (t?.id) return 'id:' + t.id;
    return [
      String(t?.type || ''),
      String(t?.date || ''),
      identity(t),
      Number(t?.qty || 0),
      Number(t?.price || 0),
      Number(t?.fees || 0)
    ].join('|');
  }

  function clone(x) {
    return JSON.parse(JSON.stringify(x));
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
             (position.isin && isin === String(position.isin).toUpperCase()) ||
             identity(t) === key;
    });
  }

  function unionTransactions(previous, candidate) {
    const out = [];
    const seen = new Set();
    for (const t of [...(candidate.transactions || []), ...(previous.transactions || [])]) {
      const k = txIdentity(t);
      if (seen.has(k)) continue;
      seen.add(k);
      out.push(t);
    }
    return out;
  }

  function harden(previous, candidate) {
    if (!previous) return candidate;
    const next = clone(candidate);
    const archived = archivedKeys(next);
    const byKey = new Map((next.positions || []).map(p => [identity(p), p]));

    for (const oldPos of previous.positions || []) {
      const k = identity(oldPos);
      const newPos = byKey.get(k);

      if (!newPos) {
        // A disappearance is legitimate only after a full sale/archive.
        if (!archived.has(k)) {
          next.positions.push(clone(oldPos));
          byKey.set(k, next.positions[next.positions.length - 1]);
        }
        continue;
      }

      const oldQty = Number(oldPos.qty);
      const newQty = Number(newPos.qty);
      if (Number.isFinite(oldQty) && Number.isFinite(newQty) && newQty < oldQty) {
        // Quantity may fall only if a new SELL transaction explains the change.
        if (!hasNewSellFor(oldPos, previous, next)) {
          newPos.qty = oldQty;
        }
      }
    }

    // Transaction history is append-only in normal operation.
    next.transactions = unionTransactions(previous, next);
    return next;
  }

  function pushHistory(raw) {
    const current = parse(raw);
    if (!current) return;
    let history = [];
    try {
      history = JSON.parse(localStorage.getItem(HISTORY) || '[]');
      if (!Array.isArray(history)) history = [];
    } catch {
      history = [];
    }
    const stamp = current.savedAt || new Date().toISOString();
    history.unshift({ savedAt: stamp, snapshot: current });
    history = history.slice(0, MAX_HISTORY);
    nativeSetItem.call(localStorage, HISTORY, JSON.stringify(history));
  }

  const nativeSetItem = Storage.prototype.setItem;

  function writeBackup(raw) {
    if (!parse(raw)) return;
    nativeSetItem.call(localStorage, BACKUP, raw);
    pushHistory(raw);
  }

  function oneTimeRepairSpaceX() {
    if (localStorage.getItem(REPAIR_MARKER) === 'done') return;

    const raw = localStorage.getItem(STORE);
    const snap = parse(raw);
    if (!snap) return;

    const sxKey = identity(SPACEX);
    const active = (snap.positions || []).some(p => identity(p) === sxKey);
    const archived = (snap.archive || []).some(p => identity(p) === sxKey);

    if (!active && !archived) {
      const repaired = clone(snap);
      repaired.positions.push(clone(SPACEX));
      repaired.savedAt = new Date().toISOString();
      repaired.repair597 = {
        at: repaired.savedAt,
        action: 'restore-missing-active-position',
        isin: SPACEX.isin,
        qty: SPACEX.qty
      };
      writeBackup(raw);
      nativeSetItem.call(localStorage, STORE, JSON.stringify(repaired));
    }

    nativeSetItem.call(localStorage, REPAIR_MARKER, 'done');
  }

  // Recover from a richer rollback copy before the app initializes.
  function recoverFromBackupIfRicher() {
    const primaryRaw = localStorage.getItem(STORE);
    const backupRaw = localStorage.getItem(BACKUP);
    const primary = parse(primaryRaw);
    const backup = parse(backupRaw);
    if (!primary || !backup) return;

    const merged = harden(backup, primary);
    const changed =
      merged.positions.length !== primary.positions.length ||
      merged.transactions.length !== primary.transactions.length ||
      merged.positions.some((p, i) => JSON.stringify(p) !== JSON.stringify(primary.positions[i]));

    if (changed) {
      nativeSetItem.call(localStorage, STORE, JSON.stringify(merged));
    }
  }

  // Guard all future writes to the canonical depot store.
  Storage.prototype.setItem = function(key, value) {
    if (this === localStorage && key === STORE) {
      const previousRaw = localStorage.getItem(STORE);
      const previous = parse(previousRaw);
      const candidate = parse(String(value));

      if (candidate) {
        const hardened = harden(previous, candidate);
        if (previousRaw && previous) writeBackup(previousRaw);
        return nativeSetItem.call(this, key, JSON.stringify(hardened));
      }
    }
    return nativeSetItem.call(this, key, value);
  };

  recoverFromBackupIfRicher();
  oneTimeRepairSpaceX();

  window.__DC_REGRESSION_LOCK_597__ = {
    version: '5.9.7',
    store: STORE,
    backup: BACKUP,
    history: HISTORY,
    inspect() {
      const x = parse(localStorage.getItem(STORE));
      return x ? {
        positions: x.positions.length,
        transactions: x.transactions.length,
        archive: x.archive.length,
        hasSpaceX: x.positions.some(p => String(p.isin || '').toUpperCase() === SPACEX.isin)
      } : null;
    }
  };

  console.info('Depot-Cockpit 5.9.7 Data Regression Lock active');
})();