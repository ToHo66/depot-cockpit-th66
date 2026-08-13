/* Depot-Cockpit Professional 5.9.5
   PERSISTENCE-GUARD
   Additive safety layer only:
   - does NOT change market-data-v3.js
   - does NOT change valuation logic
   - protects user-created positions/transactions from Vercel preview-host storage splits
   - offers one-tap transfer of local portfolio state to the fixed production host
*/
(() => {
  'use strict';

  const VERSION_595 = '5.9.5';
  const BUILD_595 = 'BUILD PERSISTENCE-GUARD · 2026-08-13 · 13:45';
  const TRANSFER_PREFIX = '#dc-transfer=';
  const MAX_TRANSFER_CHARS = 70000;

  function base64UrlEncodeUtf8(text) {
    const bytes = new TextEncoder().encode(text);
    let binary = '';
    for (const b of bytes) binary += String.fromCharCode(b);
    return btoa(binary).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  }

  function base64UrlDecodeUtf8(text) {
    const padded = text.replace(/-/g,'+').replace(/_/g,'/') + '==='.slice((text.length + 3) % 4);
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }

  function currentStoreKey() {
    try {
      if (typeof STORE !== 'undefined' && STORE) return STORE;
    } catch {}
    return 'th66-professional-master-v5';
  }

  function canonicalHost() {
    try {
      if (typeof CANONICAL_HOST !== 'undefined' && CANONICAL_HOST) return CANONICAL_HOST;
    } catch {}
    return 'depot-cockpit-th66-vercel-v20.vercel.app';
  }

  function isCanonical() {
    return location.hostname === canonicalHost();
  }

  function isVercelPreview() {
    return /\.vercel\.app$/i.test(location.hostname) && !isCanonical();
  }

  function validateSnapshot(raw) {
    if (!raw) return {ok:false, reason:'Kein lokaler Depotstand vorhanden.'};
    let x;
    try { x = JSON.parse(raw); } catch { return {ok:false, reason:'Lokaler Depotstand ist kein gültiges JSON.'}; }
    if (!Array.isArray(x.positions) || !Array.isArray(x.transactions)) {
      return {ok:false, reason:'Depotstand hat nicht das erwartete Schema.'};
    }
    return {ok:true, data:x};
  }

  function importTransferIfPresent() {
    if (!isCanonical()) return false;
    if (!location.hash.startsWith(TRANSFER_PREFIX)) return false;

    const payload = location.hash.slice(TRANSFER_PREFIX.length);
    try {
      const raw = base64UrlDecodeUtf8(payload);
      const valid = validateSnapshot(raw);
      if (!valid.ok) throw new Error(valid.reason);

      localStorage.setItem(currentStoreKey(), raw);
      sessionStorage.setItem('dc-transfer-success-595', new Date().toISOString());

      history.replaceState(null, '', location.pathname + location.search);
      location.reload();
      return true;
    } catch (error) {
      console.error('Depot-Transfer konnte nicht importiert werden', error);
      sessionStorage.setItem('dc-transfer-error-595', String(error?.message || error));
      history.replaceState(null, '', location.pathname + location.search);
      return false;
    }
  }

  function showTransferSuccessIfNeeded() {
    const stamp = sessionStorage.getItem('dc-transfer-success-595');
    if (!stamp) return;
    sessionStorage.removeItem('dc-transfer-success-595');

    const msg = document.createElement('div');
    msg.className = 'dc-persistence-success-595';
    msg.innerHTML = '<b>✅ Depotdaten übernommen.</b> Diese feste Produktionsadresse verwendet jetzt deinen übertragenen Depotstand.';
    Object.assign(msg.style, {
      position:'fixed', left:'14px', right:'14px', top:'calc(env(safe-area-inset-top, 0px) + 14px)',
      zIndex:'99999', background:'#e9f8ef', color:'#0b5a2a', border:'1px solid #a8dfb9',
      borderRadius:'14px', padding:'12px 14px', font:'600 14px/1.35 system-ui, -apple-system, sans-serif',
      boxShadow:'0 8px 28px rgba(0,0,0,.16)'
    });
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 6500);
  }

  function installPreviewGuard() {
    if (!isVercelPreview()) return;
    if (document.getElementById('dcPersistenceGuard595')) return;

    const guard = document.createElement('div');
    guard.id = 'dcPersistenceGuard595';
    Object.assign(guard.style, {
      position:'fixed', left:'12px', right:'12px', top:'calc(env(safe-area-inset-top, 0px) + 12px)',
      zIndex:'99998', background:'#fff7df', color:'#4d3800', border:'1px solid #efc86c',
      borderRadius:'16px', padding:'13px 14px', boxShadow:'0 10px 30px rgba(0,0,0,.18)',
      font:'500 14px/1.35 system-ui, -apple-system, sans-serif'
    });

    const raw = localStorage.getItem(currentStoreKey());
    const valid = validateSnapshot(raw);
    const positionCount = valid.ok ? valid.data.positions.length : 0;
    const txCount = valid.ok ? valid.data.transactions.length : 0;

    guard.innerHTML = `
      <div style="font-weight:800;margin-bottom:5px">⚠️ Vercel-Testadresse erkannt</div>
      <div style="margin-bottom:10px">
        Diese Adresse besitzt einen eigenen Browser-Speicher. Neue Käufe oder Verkäufe könnten auf der festen Produktionsadresse fehlen.
        ${valid.ok ? `<br><b>Hier gefunden:</b> ${positionCount} Positionen · ${txCount} Transaktionen.` : ''}
      </div>
      <button id="dcTransfer595" type="button" style="
        width:100%;border:0;border-radius:12px;padding:11px 12px;background:#1769e0;color:white;
        font-weight:800;font-size:15px">
        ${valid.ok ? 'Depotdaten übernehmen & feste App öffnen' : 'Feste Produktionsadresse öffnen'}
      </button>
      <button id="dcStayPreview595" type="button" style="
        width:100%;border:0;background:transparent;padding:9px 6px 2px;color:#6d5a20;font-weight:600">
        Nur ansehen
      </button>`;

    document.body.appendChild(guard);

    document.getElementById('dcStayPreview595').onclick = () => guard.remove();
    document.getElementById('dcTransfer595').onclick = () => {
      const target = `https://${canonicalHost()}/`;
      if (!valid.ok) {
        location.href = target;
        return;
      }

      const encoded = base64UrlEncodeUtf8(raw);
      if (encoded.length > MAX_TRANSFER_CHARS) {
        alert('Der Depotstand ist für die automatische URL-Übertragung zu groß. Bitte auf dieser Testadresse keine weiteren Buchungen vornehmen. Öffne stattdessen die feste Produktionsadresse.');
        return;
      }
      location.href = target + TRANSFER_PREFIX + encoded;
    };
  }

  function annotateVersion() {
    // Purely visual guard: does not touch portfolio or market state.
    document.querySelectorAll('body *').forEach(el => {
      if (el.children.length === 0 && /VERSION 5\.9\.2/.test(el.textContent || '')) {
        el.textContent = el.textContent.replace('VERSION 5.9.2', `VERSION ${VERSION_595}`);
      }
      if (el.children.length === 0 && /BUILD STABLE-CORE-RESTORE/.test(el.textContent || '')) {
        el.textContent = BUILD_595;
      }
    });
  }

  if (importTransferIfPresent()) return;

  window.addEventListener('DOMContentLoaded', () => {
    annotateVersion();
    showTransferSuccessIfNeeded();
    installPreviewGuard();
  });

  setTimeout(() => {
    annotateVersion();
    installPreviewGuard();
  }, 800);

  console.info(`Depot-Cockpit ${VERSION_595} Persistence-Guard aktiv`);
})();