/* Depot-Cockpit Professional 5.10.2
   CLEAN CONSOLIDATED RELEASE LAYER
   Replaces active app-590.js + app-592.js + app-595.js.
   SpaceX diagnostic app-596.js is retired because quote routing is now part of the normal market-data path.
*/

/* Depot-Cockpit Professional 5.9.2
   CONSOLIDATED-STABLE
   - ersetzt app-563/app-564/app-565/app-570 als aktive UI-Schicht
   - genau ein Render-Hook
   - Snapshot-Merge erhält letzte gültige Kurse
   - Filter, Datenqualität, Allokation und Risiko greifen auf denselben State zu
*/
(() => {
  'use strict';

  const UI = { broker: 'all', asset: 'alle', period: 'day', analysis: 'performance' };
  const BUILD_VERSION = '5.10.2';
  const BUILD_STAMP = 'BUILD CRYPTO-ETHEREUM · 2026-08-14 · 13:22';

  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));

  function fmtDate(d) {
    if (!d) return '';
    const x = new Date(String(d).length === 10 ? d + 'T12:00:00' : d);
    return Number.isNaN(x.getTime()) ? String(d) : x.toLocaleDateString('de-DE');
  }

  function inferredType(p) {
    const explicit = String(p.assetType || p.type || '').toLowerCase();
    if (explicit.includes('crypto') || explicit.includes('krypto')) return 'crypto';
    if (explicit.includes('etf')) return 'etfs';
    if (explicit.includes('aktie') || explicit.includes('stock')) return 'aktien';
    if (explicit.includes('roh') || explicit.includes('etc') || explicit.includes('gold')) return 'rohstoffe';
    if (p.id === 'crypto-ethereum-eth') return 'crypto';
    if (p.id === 'sap' || p.id === 'trilogy') return 'aktien';
    if (p.id === 'gold' || /gold/i.test(p.name || '')) return 'rohstoffe';
    return 'etfs';
  }

  function scopePositions() {
    return state.positions.filter(p => UI.broker === 'all' || p.broker === UI.broker);
  }

  function visiblePositions() {
    return scopePositions().filter(p => UI.asset === 'alle' || inferredType(p) === UI.asset);
  }

  function quoteStatus(p) {
    const d = state.data?.[p.id];
    const manual = Number.isFinite(brokerPrice(p));
    if (manual) return { kind:'manual', label:'🟡 Manueller Brokerkurs', detail:'manuell' };
    if (d?.ok && Number.isFinite(Number(d?.latest?.price))) {
      if (dataIsCurrentToday(p.id) && !d.__stale) {
        const delayed = d?.sourceMeta?.delayedMinutes ?? 15;
        return { kind:'current', label:`🟢 Aktuell · Börse ca. ${delayed} Min`, detail:d?.latest?.date || '' };
      }
      return { kind:'stored', label:`🟠 Letzter gültiger Kurs · ${fmtDate(d?.latest?.date)}`, detail:d?.latest?.date || '' };
    }
    return { kind:'missing', label:'🔴 Kein gültiger Kurs', detail:'' };
  }

  function scopeCoverage() {
    const ps = scopePositions();
    const counts = { current:0, stored:0, manual:0, missing:0 };
    const valued = [];
    for (const p of ps) {
      const s = quoteStatus(p);
      counts[s.kind] = (counts[s.kind] || 0) + 1;
      const v = positionValue(p);
      if (Number.isFinite(v)) valued.push({ p, v, status:s });
    }
    return { ps, valued, counts, ratio: ps.length ? valued.length / ps.length : 0 };
  }

  /* CRITICAL DATA FIX:
     A partial refresh must never erase previously valid quotes.
     New valid items replace old items; missing new items retain the old valid quote
     and are marked stale. */
  if (typeof persistAndApplySnapshot === 'function') {
    persistAndApplySnapshot = async function(snapshot) {
      let previous = {};
      try {
        const db = await dbGetSnapshot();
        previous = db?.items || {};
      } catch {}
      if (!Object.keys(previous).length) {
        previous = readCentralMarketCache()?.items || {};
      }

      const items = {};
      for (const [id, item] of Object.entries(previous)) {
        if (item?.ok && Number.isFinite(Number(item?.latest?.price))) {
          items[id] = { ...item, __stale:true };
        }
      }
      for (const item of (snapshot?.results || [])) {
        if (item?.id && item?.ok && Number.isFinite(Number(item?.latest?.price))) {
          items[item.id] = { ...item, __stale:false };
        }
      }

      const stored = {
        id:'latest',
        schemaVersion:5,
        generationId:snapshot.generationId || crypto.randomUUID?.() || String(Date.now()),
        savedAt:new Date().toISOString(),
        generatedAt:snapshot.generatedAt || new Date().toISOString(),
        requestedIds:snapshot.requestedIds || [],
        items,
        coverage:snapshot.coverage || {},
        diagnostics:snapshot.diagnostics || {},
        provider:snapshot.provider || 'Market Data Core'
      };

      const mode = await dbPutSnapshot(stored);
      writeJsonStorage(CENTRAL_MARKET_CACHE, stored);
      state.data = items;
      state.updatedAt = stored.generatedAt;
      saveMarketCache();
      return { stored, mode };
    };
  }

  function periodResult() {
    if (UI.period === 'max') return null;
    const ps = scopePositions();
    let current = 0, base = 0, count = 0;
    for (const p of ps) {
      const d = state.data?.[p.id];
      const perf = d?.performance?.[UI.period];
      const price = valuationPrice(p);
      if (!Number.isFinite(price) || !Number.isFinite(perf?.basePrice) || perf.basePrice <= 0) continue;
      current += price * p.qty;
      base += perf.basePrice * p.qty;
      count++;
    }
    if (!count || !base) return null;
    return { euro:current-base, pct:(current/base-1)*100, count, total:ps.length };
  }

  function renderHero() {
    const { ps, valued, counts } = scopeCoverage();
    const total = valued.reduce((a, x) => a + x.v, 0);
    const totalEl = document.getElementById('totalValue');
    const label = document.getElementById('heroScopeLabel');
    if (totalEl) totalEl.textContent = valued.length ? eur(total) : '–';
    if (label) {
      label.textContent = UI.broker === 'all' ? 'Gesamtdepotwert' :
        UI.broker === 'sBroker' ? 'S Broker Depotwert' : 'Trade Republic Depotwert';
    }

    let line = document.getElementById('heroCoverage580');
    if (!line && totalEl) {
      line = document.createElement('div');
      line.id = 'heroCoverage580';
      totalEl.insertAdjacentElement('afterend', line);
    }
    if (line) {
      const missing = counts.missing || 0;
      line.className = 'hero-coverage-580 ' + (missing ? 'partial' : 'complete');
      line.innerHTML = `<strong>${valued.length}/${ps.length} bewertet</strong> · ` +
        `${counts.current || 0} aktuell · ${counts.stored || 0} letzter gültiger Kurs · ` +
        `${counts.manual || 0} manuell · ${missing} fehlt`;
    }

    const coverage = document.getElementById('coverage');
    if (coverage) coverage.textContent = `${valued.length}/${ps.length}`;
    const small = coverage?.closest('.metric-card')?.querySelector('small');
    if (small) {
      small.textContent = `${counts.current || 0} aktuell · ${counts.stored || 0} gespeichert · ${counts.manual || 0} manuell · ${counts.missing || 0} fehlt`;
    }

    const sb = state.positions.filter(p => p.broker === 'sBroker');
    const tr = state.positions.filter(p => p.broker === 'Trade Republic');
    const sbVals = sb.map(positionValue).filter(Number.isFinite);
    const trVals = tr.map(positionValue).filter(Number.isFinite);
    const sbEl = document.getElementById('sbrokerValue');
    const trEl = document.getElementById('trValue');
    if (sbEl) sbEl.textContent = sbVals.length ? eur(sbVals.reduce((a,b)=>a+b,0)) : '–';
    if (trEl) trEl.textContent = trVals.length ? eur(trVals.reduce((a,b)=>a+b,0)) : '–';
  }

  function renderPeriod() {
    document.querySelectorAll('.period-tabs button').forEach(b =>
      b.classList.toggle('active', b.dataset.period === UI.period)
    );
    const r = periodResult();
    const labels = { day:'1 Tag', week:'1 Woche', month:'1 Monat', threeMonths:'3 Monate', year:'1 Jahr', max:'Max' };
    const e = document.getElementById('dayEuro');
    const p = document.getElementById('dayPct');
    const note = document.getElementById('valuationNote');

    if (r) {
      if (e) { e.textContent = eur(r.euro); e.className = cls(r.euro); }
      if (p) { p.textContent = pc(r.pct); p.className = cls(r.pct); }
      if (note) note.textContent = `Performance ${labels[UI.period]} · ${r.count}/${r.total} Positionen mit historischer Vergleichsbasis`;
    } else {
      if (e) { e.textContent = '–'; e.className = ''; }
      if (p) { p.textContent = '–'; p.className = ''; }
      if (note) note.textContent = `Für ${labels[UI.period]} fehlen noch ausreichende historische Vergleichsdaten.`;
    }
  }

  function renderOverviewPositionsFiltered() {
    const box = document.getElementById('overviewPositions');
    if (!box) return;
    const rows = scopePositions()
      .map(p => ({ p, value:positionValue(p), pct:state.data[p.id]?.performance?.day?.pct }))
      .sort((a,b)=>(b.value||0)-(a.value||0)).slice(0,5);
    box.innerHTML = rows.map(x => `<div class="compact-position">
      <div><b>${esc(x.p.name)}</b><small>${x.p.qty.toLocaleString('de-DE')} Stück · ${esc(x.p.broker)}</small></div>
      <div class="value-col"><b>${eur(x.value)}</b><small class="${cls(x.pct)}">${pc(x.pct)}</small></div>
    </div>`).join('');
  }

  function enhancePositionCards() {
    document.querySelectorAll('#positionList .position-card').forEach(card => {
      const name = card.querySelector('.position-summary h3')?.textContent?.trim();
      const p = state.positions.find(x => x.name === name);
      if (!p) return;
      card.dataset.assetType = inferredType(p);

      const badge = card.querySelector('.badge');
      const s = quoteStatus(p);
      if (badge) {
        badge.textContent = s.label;
        badge.className = `badge status-${s.kind}`;
      }

      if (s.kind === 'stored') {
        const source = card.querySelector('.source');
        if (source && !source.querySelector('.stale-warning')) {
          source.insertAdjacentHTML(
            'afterbegin',
            '<b class="stale-warning">Angezeigt wird der letzte gültige gespeicherte Kurs; beim aktuellen Abruf lag kein neuer Kurs vor.</b><br>'
          );
        }
      }
    });
  }

  function applyPositionVisibility() {
    const allowed = new Set(visiblePositions().map(p => p.name));
    document.querySelectorAll('#positionList .position-card').forEach(card => {
      const name = card.querySelector('.position-summary h3')?.textContent?.trim();
      card.style.display = allowed.has(name) ? '' : 'none';
    });
    document.querySelectorAll('#positionList .broker-title').forEach(title => {
      const broker = title.textContent.trim();
      const any = visiblePositions().some(p => p.broker === broker);
      title.style.display = any ? '' : 'none';
    });
    document.querySelectorAll('.filter-chips button').forEach(b =>
      b.classList.toggle('active', b.dataset.positionFilter === UI.asset)
    );
  }

  function renderReconciliation() {
    const box = document.getElementById('reconciliationSummary');
    if (!box) return;
    const ref = state.settings.sbrokerReference;
    if (!Number.isFinite(ref)) {
      box.innerHTML = `<div><span class="panel-kicker">OPTIONAL</span><h3>Broker-Abgleich</h3>
        <p>Im normalen Betrieb nicht erforderlich. Nur öffnen, wenn du bewusst einen aktuellen Brokerwert vergleichen möchtest.</p></div>
        <button class="secondary-action" id="openCompare580">Bei Bedarf vergleichen</button>`;
    } else {
      const app = brokerTotal('sBroker');
      const gap = Number.isFinite(app) ? app - ref : null;
      box.innerHTML = `<div><span class="panel-kicker">OPTIONALER DEPOT-ABGLEICH</span>
        <h3>${eur(gap)} Abweichung</h3><p>App ${eur(app)} · S Broker ${eur(ref)}</p></div>
        <button class="secondary-action" id="openCompare580">Details</button>`;
    }
    box.querySelector('#openCompare580')?.addEventListener('click', () => {
      showPage('manage');
      setTimeout(() => document.getElementById('optionalDepotCompare')?.setAttribute('open',''), 40);
    });
  }

  function renderPerformanceAnalysis() {
    const summary = document.getElementById('analysisPerformanceSummary');
    const contrib = document.getElementById('contributors');
    const r = periodResult();

    if (summary) {
      summary.innerHTML = r
        ? `<div class="analysis-kpis">
            <span>Zeitraum <b>${document.querySelector('.period-tabs button.active')?.textContent || '1T'}</b></span>
            <span>Veränderung <b class="${cls(r.euro)}">${eur(r.euro)}</b></span>
            <span>Performance <b class="${cls(r.pct)}">${pc(r.pct)}</b></span>
            <span>Datenbasis <b>${r.count}/${r.total}</b></span>
          </div>`
        : '<div class="info-strip">Für diesen Zeitraum fehlen noch historische Vergleichsdaten. Es werden keine unbelegten Performancewerte angezeigt.</div>';
    }
    if (contrib && !contrib.querySelector('.market-row')) {
      contrib.innerHTML = '<p class="muted">Noch keine belegten Tagesbeiträge aus einer vollständigen Vergleichsbasis.</p>';
    }
  }

  function renderAllocation() {
    const box = document.getElementById('allocationContent');
    if (!box) return;
    const { ps, valued, ratio, counts } = scopeCoverage();

    if (ratio < 0.80) {
      box.innerHTML = `<div class="integrity-note-580 danger"><strong>Allokation derzeit nicht belastbar.</strong><br>
        ${valued.length}/${ps.length} Positionen sind bewertbar. Eine Prozentverteilung würde fehlende Positionen künstlich übergewichten.</div>`;
      return;
    }

    const total = valued.reduce((a,x)=>a+x.v,0);
    const note = counts.stored || counts.missing
      ? `<div class="integrity-note-580 warn"><strong>Hinweis zur Datenbasis:</strong> ${counts.current || 0} aktuell · ${counts.stored || 0} letzter gültiger Kurs · ${counts.missing || 0} fehlt.</div>`
      : '';

    box.innerHTML = note + [...valued].sort((a,b)=>b.v-a.v).map(x => {
      const w = total ? x.v/total*100 : 0;
      return `<div class="allocation-row">
        <div><b>${esc(x.p.name)}</b><small>${esc(x.p.broker)}</small></div>
        <div class="allocation-value"><b>${w.toFixed(1).replace('.',',')} %</b><small>${eur(x.v)}</small></div>
        <div class="weight-bar"><i style="width:${Math.min(100,w)}%"></i></div>
      </div>`;
    }).join('');
  }

  function renderRisk() {
    const box = document.getElementById('riskContent');
    if (!box) return;
    const { ps, valued, ratio, counts } = scopeCoverage();

    if (ratio < 0.80) {
      box.innerHTML = `<div class="integrity-note-580 danger"><strong>Risikoauswertung derzeit nicht belastbar.</strong><br>
        ${valued.length}/${ps.length} Positionen besitzen einen verwertbaren Kurs. Fehlende Positionen dürfen die Depotgewichtung nicht verzerren.</div>`;
      return;
    }

    const total = valued.reduce((a,x)=>a+x.v,0);
    const top = [...valued].sort((a,b)=>b.v-a.v)[0];
    const topWeight = top && total ? top.v/total*100 : null;
    const concentration = Number.isFinite(topWeight) ? (topWeight > 20 ? 'Erhöht' : topWeight > 12 ? 'Beobachten' : 'Ausgewogen') : '–';

    box.innerHTML = `<div class="risk-grid">
      <article><span>Größte Position</span><b>${top ? esc(top.p.name) : '–'}</b><strong>${Number.isFinite(topWeight) ? topWeight.toFixed(1).replace('.',',')+' %' : '–'}</strong></article>
      <article><span>Konzentration</span><b>${concentration}</b><small>größte Einzelposition</small></article>
      <article><span>Letzte gespeicherte Kurse</span><b>${counts.stored || 0}</b><small>aktuell nicht neu geliefert</small></article>
      <article><span>Ohne gültigen Kurs</span><b>${counts.missing || 0}</b><small>muss geprüft werden</small></article>
    </div>
    ${top && Number.isFinite(topWeight) ? `<div class="integrity-note-580 ${counts.stored ? 'warn':'good'}">
      ${esc(top.p.name)} macht rund ${topWeight.toFixed(1).replace('.',',')} % des bewertbaren Depots aus.
      ${counts.stored ? 'Ein Teil der Bewertung basiert auf zuletzt gespeicherten Kursen.' : ''}
    </div>` : ''}`;
  }

  function renderAnalysisTab() {
    const map = { performance:'analysisPerformance', allokation:'analysisAllocation', risiko:'analysisRisk' };
    document.querySelectorAll('.analysis-tabs button').forEach(b =>
      b.classList.toggle('active', b.dataset.analysisTab === UI.analysis)
    );
    Object.values(map).forEach(id => {
      const el = document.getElementById(id);
      if (el) el.hidden = true;
    });
    const active = document.getElementById(map[UI.analysis]);
    if (active) active.hidden = false;

    if (UI.analysis === 'performance') renderPerformanceAnalysis();
    if (UI.analysis === 'allokation') renderAllocation();
    if (UI.analysis === 'risiko') renderRisk();
  }

  function moveTechnicalBlocks() {
    document.querySelector('.legacy-comparison-panel')?.classList.add('hidden580');
    document.querySelector('.legacy-chart-panel')?.classList.add('hidden580');
    document.querySelector('.legacy-diagnostics-panel')?.classList.add('hidden580');

    const bc = document.getElementById('brokerComparison');
    const bhome = document.getElementById('brokerComparisonHome');
    if (bc && bhome && bc.parentElement !== bhome) bhome.appendChild(bc);

    const dg = document.getElementById('diagnostics');
    const dghome = document.getElementById('diagnosticsHome');
    if (dg && dghome && dg.parentElement !== dghome) dghome.appendChild(dg);

    document.getElementById('courseManagerBlock')?.removeAttribute('open');
  }

  function renderAll() {
    document.querySelectorAll('.broker-tab').forEach(x =>
      x.classList.toggle('active', x.dataset.brokerFilter === UI.broker)
    );

    enhancePositionCards();
    applyPositionVisibility();
    renderHero();
    renderPeriod();
    renderOverviewPositionsFiltered();
    renderReconciliation();
    moveTechnicalBlocks();
    renderAnalysisTab();
  }

  function bindOnce() {
    document.querySelectorAll('.broker-tab').forEach(btn => {
      btn.onclick = () => {
        UI.broker = btn.dataset.brokerFilter;
        renderAll();
      };
    });

    document.querySelectorAll('.filter-chips button').forEach(btn => {
      btn.onclick = () => {
        UI.asset = btn.dataset.positionFilter;
        applyPositionVisibility();
      };
    });

    document.querySelectorAll('.period-tabs button').forEach(btn => {
      btn.onclick = () => {
        UI.period = btn.dataset.period;
        renderPeriod();
        renderPerformanceAnalysis();
      };
    });

    document.querySelectorAll('.analysis-tabs button').forEach(btn => {
      btn.onclick = () => {
        UI.analysis = btn.dataset.analysisTab;
        renderAnalysisTab();
      };
    });
  }

  // Make diagnostics show the actual release identity.
  if (typeof runSystemDiagnosis === 'function') {
    runSystemDiagnosis = async function() {
      const button = document.getElementById('diagnoseBtn');
      if (button) { button.disabled = true; button.textContent = 'Prüfung läuft …'; }
      try {
        const health = await fetchJsonWithTimeout('/api/health', {}, 8000);
        let snap = null;
        try { snap = await dbGetSnapshot(); } catch {}
        const valid = Object.keys(snap?.items || {}).length;
        showDiagnostic('Systemprüfung abgeschlossen', [
          `App-Version: ${BUILD_VERSION}`,
          `Vercel-Funktion: ${health.response.ok ? 'erreichbar' : 'Fehler ' + health.response.status}`,
          `Persistenter iPhone-Snapshot: ${valid} Kursreihen`,
          `Snapshot-Stand: ${snap?.generatedAt || snap?.savedAt || 'noch leer'}`,
          `Speicher: ${'indexedDB' in window ? 'IndexedDB aktiv' : 'localStorage-Fallback'}`,
          'Aktive UI-Architektur: app.js + app-590.js · ein konsolidierter Daten-/UI-Layer',
          'Die Diagnose selbst startet keinen Börsenabruf.'
        ], health.response.ok ? 'success' : 'error');
      } catch (error) {
        showDiagnostic('Systemprüfung abgebrochen', [`App-Version: ${BUILD_VERSION}`, `Fehler: ${error.message || String(error)}`], 'error');
      } finally {
        if (button) { button.disabled = false; button.textContent = 'Systemprüfung starten'; }
      }
    };
    const diagBtn = document.getElementById('diagnoseBtn');
    if (diagBtn) diagBtn.onclick = runSystemDiagnosis;
  }

  // Exactly one render wrapper.
  if (typeof render === 'function') {
    const coreRender = render;
    render = function() {
      coreRender();
      renderAll();
    };
  }

  bindOnce();
  renderAll();

  // The core restores IndexedDB asynchronously. The wrapped render above handles that.
  window.addEventListener('DOMContentLoaded', () => {
    bindOnce();
    renderAll();
  });
})();




/* Depot-Cockpit 5.10.2 – DATA CORE V3
   Ein einziger Kurs-Endpunkt:
   Deutsche Börse Xetra Post-Trade -> Xetra Pre-Trade -> EODHD nur für Rest -> Trilogy TMQ.
   Keine separaten market-fallback/trilogy Endpunkte mehr.
*/
(() => {
  'use strict';

  const CORE_VERSION = '5.10.2';

  function correctInstrumentMaster590() {
    const fixes = {
      allworld: { analysisSymbol:'VWCE', marketSymbol:'VWCE', analysisVenue:'Xetra' },
      worldit:  { analysisSymbol:'AYEW', marketSymbol:'AYEW', analysisVenue:'Xetra' },
      ageing:   { analysisSymbol:'2B77', marketSymbol:'2B77', analysisVenue:'Xetra' },
      trilogy:  { analysisSymbol:'TMQ',  marketSymbol:'TMQ',  analysisVenue:'NYSE' }
    };
    let changed = false;
    for (const p of state.positions) {
      const f = fixes[p.id];
      if (!f) continue;
      for (const [k,v] of Object.entries(f)) {
        if (p[k] !== v) { p[k] = v; changed = true; }
      }
    }
    if (changed) {
      try { save(); } catch {}
    }
  }

  function payload590() {
    return state.positions.map(p => ({
      id:p.id,
      name:p.name,
      isin:p.isin || '',
      wkn:p.wkn || '',
      mnemonic:p.analysisSymbol || p.marketSymbol || '',
      currency:p.currency || 'EUR',
      dataSource:p.dataSource || 'DB_DELAYED',
      broker:p.broker || '',
      venue:p.analysisVenue || '',
      exchangeCode:p.analysisExchangeCode || p.exchangeCode || '',
      candidates:(() => {
        const base = String(p.analysisSymbol || p.marketSymbol || '').trim().split('.')[0];
        if (!base || p.id === 'trilogy' || p.dataSource === 'CRYPTO_YAHOO') return [];
        const exchange = String(p.analysisExchangeCode || p.exchangeCode || '').toUpperCase();
        if (exchange === 'US' || ['NYSE','NASDAQ','NYSE MKT','AMEX'].includes(exchange)) {
          return [{venue:'US',symbol:`${base}.US`}];
        }
        if (exchange === 'PA') return [{venue:'Euronext Paris',symbol:`${base}.PA`}];
        if (exchange === 'AS') return [{venue:'Euronext Amsterdam',symbol:`${base}.AS`}];
        return [
          {venue:'Xetra',symbol:`${base}.XETRA`},
          {venue:'Frankfurt',symbol:`${base}.F`},
          {venue:'Stuttgart',symbol:`${base}.STU`}
        ];
      })()
    }));
  }

  function statusLine590(d) {
    if (!d) return 'keine Rückmeldung';
    if (d.ok && Number.isFinite(Number(d.latest?.price))) {
      const src = d.sourceMeta?.sourceKind || d.sourceMeta?.provider || d.source || 'Quelle';
      return `${eur(Number(d.latest.price))} · ${src}`;
    }
    return `${d.code || 'FEHLT'}${d.error ? ' · '+d.error : ''}`;
  }

  async function refresh590() {
    correctInstrumentMaster590();

    const b = document.getElementById('refreshBtn');
    if (b) { b.disabled = true; b.textContent = '…'; }

    showDiagnostic('Datenkern 5.10.2 prüft alle Depotpositionen', [
      '1. Xetra Post-Trade: echter letzter Handel.',
      '2. Falls dort kein Trade gefunden wird: Xetra Pre-Trade mit Bid/Ask-Mittelwert.',
      '3. Nur verbleibende Fehlstellen: EODHD-Fallback.',
      '4. Trilogy Metals: TMQ (NYSE American) mit EUR/USD-Umrechnung.',
      '5. Ethereum: ETH-EUR als separate 24/7-Krypto-Kursquelle.',
      'Vorhandene gültige gespeicherte Kurse werden bei Fehlschlägen nicht gelöscht.'
    ]);

    try {
      const {response, body} = await fetchJsonWithTimeout(
        '/api/market-data-v3',
        {
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body:JSON.stringify({positions:payload590(), diagnostics:true})
        },
        45000
      );

      if (!response.ok || !body?.ok) {
        throw new Error(body?.error || `Market Data V3 HTTP ${response.status}`);
      }

      const snapshot = {
        ok:true,
        provider:'Depot-Cockpit Market Data V3',
        generatedAt:body.generatedAt || new Date().toISOString(),
        requestedIds:state.positions.map(p => p.id),
        results:(body.results || []).filter(x => x?.ok),
        diagnostics:body.diagnostics || {}
      };

      const {stored, mode} = await persistAndApplySnapshot(snapshot);
      state.updatedAt = stored.generatedAt || stored.savedAt;
      render();

      const report = body.positionDiagnostics || [];
      const lines = [
        `Speicher: ${mode}`,
        `Neue Treffer dieses Laufs: ${(body.results || []).filter(x=>x?.ok).length}/${state.positions.length}`,
        `Gespeicherte verwertbare Kursreihen: ${Object.keys(stored.items || {}).length}/${state.positions.length}`,
        ...report.map(r => `${r.name}: ${r.statusLabel || r.status || 'unbekannt'}${r.source ? ' · '+r.source : ''}`)
      ];

      showDiagnostic(
        body.complete ? 'Datenkern 5.10.2: vollständige Versorgung' : 'Datenkern 5.10.2: Prüfung abgeschlossen',
        lines,
        body.complete ? 'success' : 'info'
      );
      toast(`${Object.keys(stored.items || {}).length}/${state.positions.length} Positionen verwertbar`);
    } catch (error) {
      showDiagnostic('Datenkern 5.10.2 fehlgeschlagen', [
        error?.message || String(error),
        'Bereits gespeicherte gültige Kurse bleiben unverändert erhalten.'
      ], 'error');
    } finally {
      if (b) { b.disabled = false; b.textContent = '↻'; }
    }
  }

  function installRefresh590() {
    const old = document.getElementById('refreshBtn');
    if (!old || old.dataset.refresh590 === '1') return;
    const fresh = old.cloneNode(true); // entfernt alte Click-Listener vollständig
    fresh.dataset.refresh590 = '1';
    fresh.disabled = false;
    fresh.textContent = '↻';
    old.replaceWith(fresh);
    fresh.addEventListener('click', refresh590);
  }

  correctInstrumentMaster590();
  installRefresh590();
  window.addEventListener('DOMContentLoaded', () => {
    correctInstrumentMaster590();
    installRefresh590();
  });
})();



/* Depot-Cockpit Professional 5.10.2
   TRANSACTION-CORRECTION
   - externe Live-Instrumentsuche (EODHD Search API via Server)
   - neue Instrumente erhalten eine Kursquelle statt automatisch MANUAL
   - Broker und Handelsplatz werden getrennt gespeichert
   - offene Käufe verwenden gewichteten Einstand
   - Transaktionshistorie zeigt Volumen/Erlös und realisierten G/V getrennt
   - "undefined" wird niemals als Handelsplatz ausgegeben
   - unvollständiger Depotwert wird als "bewerteter Depotwert" gekennzeichnet
*/
(() => {
  'use strict';

  const BUILD = '5.10.2';

  const txEsc = s => String(s ?? '').replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));

  function normalizeBroker592(v) {
    const s = String(v || '').trim();
    if (/^s[\s-]?broker$/i.test(s)) return 'sBroker';
    if (/trade\s*republic/i.test(s)) return 'Trade Republic';
    return s || 'Sonstiger';
  }

  function venueLabel592(t) {
    const v = String(t?.venue || t?.instrumentMeta?.venue || '').trim();
    if (!v || v === 'undefined' || v === 'null') return '';
    return v;
  }

  function txAmount592(t) {
    const qty = Number(t?.qty), price = Number(t?.price), fees = Number(t?.fees || 0);
    if (!Number.isFinite(qty) || !Number.isFinite(price)) return null;
    return t.type === 'SELL' ? qty * price - fees : qty * price + fees;
  }

  // ----- Live/remote instrument search -----
  if (typeof searchInstrumentMaster === 'function') {
    searchInstrumentMaster = async function(query) {
      const q = String(query || '').trim();
      if (!q) return [];

      try {
        const {response, body} = await fetchJsonWithTimeout(
          `/api/instrument-search-v2?q=${encodeURIComponent(q)}`, {}, 12000
        );
        if (response.ok && body?.ok && Array.isArray(body.results) && body.results.length) {
          return body.results;
        }
      } catch {}

      // Existing local/server search remains a fallback.
      try {
        const {response, body} = await fetchJsonWithTimeout(
          `/api/instrument-search?q=${encodeURIComponent(q)}`, {}, 8000
        );
        if (response.ok && body?.ok && Array.isArray(body.results) && body.results.length) {
          return body.results;
        }
      } catch {}

      const local = typeof localInstrumentMaster === 'function' ? localInstrumentMaster() : [];
      const nq = typeof normalizeSearchText === 'function' ? normalizeSearchText(q) : q.toLowerCase();
      return local.filter(item => {
        const hay = [item.name,item.isin,item.wkn,item.mnemonic,item.type]
          .map(x => typeof normalizeSearchText === 'function'
            ? normalizeSearchText(x) : String(x||'').toLowerCase())
          .join(' ');
        return hay.includes(nq);
      }).slice(0,20);
    };
  }

  if (typeof runBuyInstrumentSearch === 'function') {
    runBuyInstrumentSearch = async function() {
      const input = document.getElementById('buyInstrumentQuery');
      const resultsBox = document.getElementById('buyInstrumentResults');
      if (!input || !resultsBox) return;
      const query = input.value.trim();
      if (!query) {
        resultsBox.innerHTML = '<div class="search-empty">Bitte Name, ISIN, WKN oder Kürzel eingeben.</div>';
        return;
      }

      resultsBox.innerHTML =
        '<div class="search-empty"><b>Nicht lokal gefunden?</b> Börsen-/Marktdaten werden durchsucht …</div>';

      const results = await searchInstrumentMaster(query);

      if (!results.length) {
        resultsBox.innerHTML = `<div class="search-empty">
          <b>Kein eindeutiger Markttreffer.</b><br>
          Bitte ISIN/WKN/Kürzel prüfen. Wenn die Kennung korrekt ist, kann das Papier trotzdem frei angelegt werden.
          <button type="button" id="useFreeEntryBtn" class="secondary">Freie Eingabe verwenden</button>
        </div>`;
        document.getElementById('useFreeEntryBtn').onclick = () => {
          setSelectedBuyInstrument({
            name:query, isin:/^[A-Z]{2}[A-Z0-9]{10}$/.test(query.toUpperCase()) ? query.toUpperCase() : '',
            wkn:'', mnemonic:'', type:'Wertpapier', currency:'EUR',
            venue:'Manuell', exchangeCode:'', source:'MANUAL'
          });
          resultsBox.innerHTML = '';
          syncBuyFieldsFromInstrument(selectedBuyInstrument());
        };
        return;
      }

      resultsBox.innerHTML = results.map((item,i) => `
        <button type="button" class="instrument-result" data-instrument-index="${i}">
          <b>${txEsc(item.name || 'Unbenannt')}</b>
          <span>${txEsc(item.isin || '–')} · ${txEsc(item.wkn || '–')} · ${txEsc(item.mnemonic || item.code || '–')}</span>
          <span>${txEsc(item.type || 'Wertpapier')} · ${txEsc(item.currency || 'EUR')} · ${txEsc(item.venue || item.exchange || '–')}</span>
          <span>${item.source === 'EODHD_SEARCH' ? 'Externe Marktsuche' : 'Instrument-Master'}</span>
        </button>`).join('');

      resultsBox.querySelectorAll('[data-instrument-index]').forEach(btn => {
        btn.onclick = () => {
          const item = results[Number(btn.dataset.instrumentIndex)];
          setSelectedBuyInstrument(item);
          syncBuyFieldsFromInstrument(item);
          resultsBox.innerHTML = '';
        };
      });
    };
  }

  // ----- Open buy: keep one position per ISIN and calculate weighted acquisition price -----
  if (typeof ensureBoughtInstrumentInDepot === 'function') {
    ensureBoughtInstrumentInDepot = function(instrument, qty, price, fees, broker, date) {
      const q = Number(qty || 0), pr = Number(price || 0), f = Number(fees || 0);
      const normalizedBroker = normalizeBroker592(broker);
      let p = state.positions.find(x =>
        instrument.isin && String(x.isin || '').toUpperCase() === String(instrument.isin).toUpperCase()
      );

      const venue = String(instrument.venue || 'Manuell').trim() || 'Manuell';
      const symbol = String(instrument.mnemonic || instrument.code || '').trim();
      const exchangeCode = String(instrument.exchangeCode || instrument.exchange || '').trim().toUpperCase();
      const automatic = instrument.source === 'EODHD_SEARCH' && symbol;

      if (!p) {
        p = normalizePosition({
          id:`custom-${Date.now()}`,
          name:instrument.name || 'Unbenanntes Wertpapier',
          isin:instrument.isin || `MANUAL-${Date.now()}`,
          wkn:instrument.wkn || '',
          mnemonic:symbol,
          assetType:instrument.type || 'Wertpapier',
          type:instrument.type || 'Wertpapier',
          qty:0,
          broker:normalizedBroker,
          dataSource:automatic ? 'EODHD_DYNAMIC' : 'MANUAL',
          brokerDisplaySource:venue,
          brokerVenue:venue,
          analysisVenue:automatic ? (venue || 'US') : 'Manuell',
          analysisExchangeCode:automatic ? exchangeCode : '',
          exchangeCode:automatic ? exchangeCode : '',
          analysisSymbol:symbol,
          marketSymbol:symbol,
          currency:instrument.currency || 'EUR',
          purchasePrice:null,
          fallbackVenues:automatic ? [] : ['Manuell']
        });
        state.positions.push(p);
      }

      const oldQty = Number(p.qty || 0);
      const oldPurchase = Number(p.purchasePrice);
      const oldCost = Number.isFinite(oldPurchase) ? oldQty * oldPurchase : 0;
      const newQty = oldQty + q;

      p.qty = newQty;
      p.broker = normalizedBroker;
      p.brokerDisplaySource = p.brokerDisplaySource || venue;
      p.brokerVenue = p.brokerVenue || venue;
      if (automatic) {
        p.dataSource = 'EODHD_DYNAMIC';
        p.analysisSymbol = symbol;
        p.marketSymbol = symbol;
        p.analysisExchangeCode = exchangeCode;
        p.exchangeCode = exchangeCode;
        p.currency = instrument.currency || p.currency || 'EUR';
      }
      if (newQty > 0) p.purchasePrice = (oldCost + q * pr + f) / newQty;

      state.transactions.unshift({
        id:`tx-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
        type:'BUY',
        date:date || new Date().toISOString().slice(0,10),
        positionId:p.id,
        name:p.name,
        isin:p.isin,
        qty:q,
        price:pr,
        fees:f,
        broker:normalizedBroker,
        venue,
        realized:null,
        instrumentMeta:{...instrument,venue,exchangeCode},
        createdAt:new Date().toISOString()
      });

      save();
      render();
      return p;
    };
  }

  // ----- Standard buy/sell: broker stays with position, venue stays with transaction -----
  if (typeof recordTransaction === 'function') {
    recordTransaction = function() {
      const id = document.getElementById('txPosition')?.value;
      const type = document.getElementById('txType')?.value;
      const date = document.getElementById('txDate')?.value;
      const qty = parseNum(document.getElementById('txQty')?.value);
      const price = parseNum(document.getElementById('txPrice')?.value);
      const fees = parseNum(document.getElementById('txFees')?.value) || 0;
      const venue = String(document.getElementById('txVenue')?.value || '').trim() || 'Nicht angegeben';

      const p = state.positions.find(x => x.id === id);
      if (!p || !date || !Number.isFinite(qty) || qty <= 0 || !Number.isFinite(price) || price <= 0) {
        toast('Datum, Stückzahl und Kurs vollständig eingeben');
        return;
      }
      if (type === 'SELL' && qty > p.qty) {
        toast('Verkauf übersteigt den aktuellen Bestand');
        return;
      }

      const oldQty = Number(p.qty || 0);
      const oldPurchase = Number(p.purchasePrice);
      let realized = null;

      if (type === 'BUY') {
        const oldCost = Number.isFinite(oldPurchase) ? oldQty * oldPurchase : 0;
        p.qty = oldQty + qty;
        p.purchasePrice = (oldCost + qty * price + fees) / p.qty;
      } else {
        realized = Number.isFinite(oldPurchase) ? qty * (price - oldPurchase) - fees : null;
        p.qty = oldQty - qty;
        if (p.qty === 0) {
          p.archiveReason = 'vollständig verkauft';
          p.archivedAt = new Date().toISOString();
          state.archive.push({...p});
          state.positions = state.positions.filter(x => x.id !== p.id);
          delete state.settings.brokerPrices[p.id];
        }
      }

      state.transactions.push({
        id:uid(),
        type,date,
        positionId:id,
        name:p.name,
        isin:p.isin,
        qty,price,fees,
        broker:normalizeBroker592(p.broker),
        venue,
        realized,
        createdAt:new Date().toISOString()
      });

      save();
      render();
      toast(type === 'BUY' ? 'Kauf erfasst' : 'Verkauf erfasst');
    };
  }

  // ----- Transaction history: no mixed metric -----
  if (typeof renderTransactions === 'function') {
    renderTransactions = function() {
      const select = document.getElementById('txPosition');
      if (select) {
        const old = select.value;
        select.innerHTML = transactionOptions();
        if (old && [...select.options].some(o => o.value === old)) select.value = old;
      }

      const box = document.getElementById('transactionList');
      if (!box) return;

      const txs = [...state.transactions].sort((a,b) =>
        String(b.date || '').localeCompare(String(a.date || '')) ||
        String(b.createdAt || '').localeCompare(String(a.createdAt || ''))
      );

      box.innerHTML = txs.length ? txs.map(t => {
        const venue = venueLabel592(t);
        const broker = normalizeBroker592(t.broker || state.positions.find(p => p.id === t.positionId)?.broker);
        const amount = txAmount592(t);
        const realized = Number(t.realized);
        const isSell = t.type === 'SELL';

        return `<div class="archive-row transaction-history-592">
          <div>
            <b>${isSell ? 'Verkauf' : 'Kauf'} · ${txEsc(t.name)}</b>
            <small class="muted">
              ${new Date(String(t.date)+'T12:00:00').toLocaleDateString('de-DE')}
              · ${Number(t.qty).toLocaleString('de-DE')} Stück
              · ${eur(Number(t.price),3)}
              ${venue ? ` · ${txEsc(venue)}` : ''}
              · ${txEsc(broker)}
              · Gebühren ${eur(Number(t.fees||0))}
            </small>
          </div>
          <div class="tx-values-592">
            <strong>${isSell ? 'Erlös' : 'Volumen'} ${eur(amount)}</strong>
            ${isSell && Number.isFinite(realized)
              ? `<small class="${realized >= 0 ? 'positive' : 'negative'}">realisiert ${realized >= 0 ? '+' : ''}${eur(realized)}</small>`
              : ''}
          </div>
        </div>`;
      }).join('') : '<p class="muted">Noch keine Käufe oder Verkäufe erfasst.</p>';
    };
  }

  function repairLegacyTransactions592() {
    let changed = false;
    for (const t of state.transactions || []) {
      if (!t.broker) {
        const p = state.positions.find(x => x.id === t.positionId) ||
                  state.archive.find(x => x.id === t.positionId);
        if (p?.broker) { t.broker = normalizeBroker592(p.broker); changed = true; }
      }
      if ((!t.venue || t.venue === 'undefined') && t.instrumentMeta?.venue) {
        t.venue = t.instrumentMeta.venue; changed = true;
      }
    }
    if (changed) save();
  }

  function labelIncompleteDepot592() {
    const valued = state.positions.filter(p => Number.isFinite(positionValue(p))).length;
    const total = state.positions.length;
    const label = document.querySelector('#overview .hero-card > span, #overview .hero-card .hero-label');
    if (label && valued < total) label.textContent = 'Bewerteter Depotwert';
  }

  function rewire592() {
    // Replace handlers installed by the older core with the corrected functions.
    const record = document.getElementById('recordTransaction');
    if (record) record.onclick = recordTransaction;

    const searchBtn = document.getElementById('buyInstrumentSearchBtn');
    if (searchBtn) searchBtn.onclick = runBuyInstrumentSearch;

    const q = document.getElementById('buyInstrumentQuery');
    if (q && q.dataset.wired592 !== '1') {
      q.dataset.wired592 = '1';
      q.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
          e.preventDefault();
          runBuyInstrumentSearch();
        }
      });
    }

    const buyBtn = document.getElementById('buyOpenInstrumentBtn');
    if (buyBtn) {
      buyBtn.onclick = () => {
        const instrument = collectOpenBuyInstrument();
        const num = id => parseNum(document.getElementById(id)?.value);
        const qty = num('buyQty'), price = num('buyPrice'), fees = num('buyFees') || 0;
        if (!Number.isFinite(qty) || qty <= 0 || !Number.isFinite(price) || price <= 0) {
          toast('Bitte Stückzahl und Kaufkurs eingeben');
          return;
        }
        const broker = document.getElementById('buyBroker')?.value || 'sBroker';
        const date = document.getElementById('buyDate')?.value || new Date().toISOString().slice(0,10);
        const p = ensureBoughtInstrumentInDepot(instrument,qty,price,fees,broker,date);
        toast(`${p.name} wurde dem Depot hinzugefügt`);
        setSelectedBuyInstrument(null);
      };
    }
  }

  repairLegacyTransactions592();

  if (typeof render === 'function') {
    const render590 = render;
    render = function() {
      render590();
      renderTransactions();
      labelIncompleteDepot592();
      rewire592();
    };
  }

  rewire592();
  renderTransactions();
  labelIncompleteDepot592();

  window.addEventListener('DOMContentLoaded', () => {
    rewire592();
    renderTransactions();
    labelIncompleteDepot592();
  });

  console.info(`Depot-Cockpit ${BUILD} Transaction-Correction aktiv`);
})();


/* Depot-Cockpit Professional 5.10.2
   PERSISTENCE-GUARD
   Additive safety layer only:
   - does NOT change market-data-v3.js
   - does NOT change valuation logic
   - protects user-created positions/transactions from Vercel preview-host storage splits
   - offers one-tap transfer of local portfolio state to the fixed production host
*/
(() => {
  'use strict';

  const VERSION_595 = '5.10.2';
  const BUILD_595 = 'BUILD CRYPTO-ETHEREUM · 2026-08-14 · 13:22';
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
    // Single release-identity owner. No global text scan and no legacy version substitution.
    const version = document.getElementById('appVersionLabel');
    const build = document.getElementById('buildStamp');
    if (version) version.textContent = `DEPOT-COCKPIT · VERSION ${VERSION_595}`;
    if (build) build.textContent = BUILD_595;
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