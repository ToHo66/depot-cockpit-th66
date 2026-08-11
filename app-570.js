/* Depot-Cockpit Professional 5.7.0 – Stable Production
   Architekturziel:
   - eine feste Production-Origin für alle iPhone-Aufrufe
   - Browser-Speicher/IndexedDB bleiben dadurch über Deployments erhalten
   - letzte gültige Kurse werden bei partiellen Refreshes nicht gelöscht
   - Risiko/Allokation kennzeichnen unzureichende Datenbasis statt irreführender Aussagen
   - 5.6.4 Oberfläche bleibt bewusst erhalten
*/
(() => {
  'use strict';

  const VERSION_570 = '5.7.0';
  const BUILD_570 = 'BUILD STABLE-PRODUCTION · 2026-08-11 · 23:46';
  const CANONICAL_570 = 'depot-cockpit-th66-vercel-v20.vercel.app';

  function currentScope570() {
    return document.querySelector('.broker-tab.active')?.dataset?.brokerFilter || 'all';
  }

  function scopePositions570() {
    const scope = currentScope570();
    return (window.state?.positions || []).filter(p => scope === 'all' || p.broker === scope);
  }

  function quoteState570(p) {
    let manual = false;
    try { manual = Number.isFinite(brokerPrice(p)); } catch {}
    if (manual) return 'current';

    const d = state?.data?.[p.id];
    if (d?.ok && Number.isFinite(Number(d?.latest?.price))) {
      let today = false;
      try { today = dataIsCurrentToday(p.id) && !d.__stale; } catch {}
      return today ? 'current' : 'stored';
    }
    return 'missing';
  }

  function value570(p) {
    try {
      const v = positionValue(p);
      return Number.isFinite(v) ? v : null;
    } catch {
      return null;
    }
  }

  function coverage570() {
    const ps = scopePositions570();
    const counts = {current:0, stored:0, missing:0};
    const valued = [];
    for (const p of ps) {
      const s = quoteState570(p);
      counts[s]++;
      const v = value570(p);
      if (Number.isFinite(v)) valued.push({p,v,s});
    }
    return {ps, valued, counts, ratio: ps.length ? valued.length / ps.length : 0};
  }

  function stableHero570() {
    const {ps, valued, counts} = coverage570();
    const total = valued.reduce((a,x) => a+x.v, 0);
    const el = document.getElementById('totalValue');
    if (el) el.textContent = valued.length ? eur(total) : '–';

    let line = document.getElementById('heroCoverage570');
    if (!line && el) {
      line = document.createElement('div');
      line.id = 'heroCoverage570';
      line.className = 'hero-coverage-570';
      el.insertAdjacentElement('afterend', line);
    }
    if (line) {
      line.innerHTML = `<strong>${valued.length}/${ps.length} bewertet</strong> · ` +
        `${counts.current} aktuell · ${counts.stored} letzter gültiger Kurs · ${counts.missing} fehlt`;
      line.className = 'hero-coverage-570 ' + (counts.missing ? 'partial' : 'complete');
    }

    const coverage = document.getElementById('coverage');
    if (coverage) coverage.textContent = `${valued.length}/${ps.length}`;
    const small = coverage?.closest('.metric-card')?.querySelector('small');
    if (small) small.textContent = `${counts.current} aktuell · ${counts.stored} gespeichert · ${counts.missing} fehlt`;
  }

  function addProductionBadge570() {
    const header = document.querySelector('.app-header .header-row > div');
    if (!header) return;
    let badge = document.getElementById('productionBadge570');
    if (!badge) {
      badge = document.createElement('div');
      badge.id = 'productionBadge570';
      badge.className = 'production-badge-570';
      header.appendChild(badge);
    }
    badge.textContent = location.hostname === CANONICAL_570
      ? '● Feste Produktionsadresse · Speicher bleibt erhalten'
      : '○ Nicht auf Produktionsadresse';
  }

  function dataIntegrityNote570() {
    const {ps, valued, counts, ratio} = coverage570();
    let note = document.getElementById('dataIntegrity570');
    const risk = document.getElementById('riskContent');
    if (!risk) return;

    if (!note) {
      note = document.createElement('div');
      note.id = 'dataIntegrity570';
      note.className = 'integrity-note-570';
      risk.prepend(note);
    }

    const currentRatio = ps.length ? counts.current / ps.length : 0;
    if (ratio < 0.80) {
      note.className = 'integrity-note-570 danger';
      note.innerHTML = `<strong>Risikoauswertung derzeit nicht belastbar.</strong><br>` +
        `Nur ${valued.length}/${ps.length} Positionen besitzen einen verwertbaren Kurs. ` +
        `Fehlende Positionen dürfen die Depotgewichtung nicht künstlich verzerren.`;
      risk.classList.add('risk-blocked-570');
    } else {
      risk.classList.remove('risk-blocked-570');
      if (currentRatio < 0.60) {
        note.className = 'integrity-note-570 warn';
        note.innerHTML = `<strong>Auswertung mit eingeschränkter Aktualität.</strong><br>` +
          `${counts.current} Kurse aktuell, ${counts.stored} aus dem letzten gültigen Speicherstand, ${counts.missing} fehlen.`;
      } else {
        note.className = 'integrity-note-570 good';
        note.innerHTML = `<strong>Datenbasis ausreichend.</strong><br>` +
          `${counts.current} aktuell · ${counts.stored} letzter gültiger Kurs · ${counts.missing} fehlt.`;
      }
    }
  }

  function gateAllocation570() {
    const box = document.getElementById('allocationContent');
    if (!box) return;
    const {ps, valued, ratio, counts} = coverage570();
    let gate = document.getElementById('allocationGate570');
    if (ratio < 0.80) {
      if (!gate) {
        gate = document.createElement('div');
        gate.id = 'allocationGate570';
        gate.className = 'integrity-note-570 danger';
        box.prepend(gate);
      }
      gate.innerHTML = `<strong>Allokation nicht belastbar.</strong><br>` +
        `Nur ${valued.length}/${ps.length} Positionen sind bewertbar. Eine Prozentverteilung würde fehlende Positionen übergewichten.`;
      box.classList.add('allocation-blocked-570');
    } else {
      box.classList.remove('allocation-blocked-570');
      if (gate) gate.remove();
      if (counts.missing) {
        const info = document.createElement('div');
        info.className = 'integrity-note-570 warn allocation-info-570';
        info.innerHTML = `<strong>Hinweis:</strong> ${counts.missing} Position ${counts.missing===1?'fehlt':'fehlen'} in der Bewertung. Prozentwerte beziehen sich auf die bewertbaren Positionen.`;
        box.prepend(info);
      }
    }
  }

  function cleanupOldIntegrity570() {
    document.querySelectorAll('.allocation-info-570').forEach((el,i)=>{ if(i>0) el.remove(); });
  }

  function stamp570() {
    const v = document.getElementById('appVersionLabel');
    if (v) v.textContent = `DEPOT-COCKPIT · VERSION ${VERSION_570}`;
    const b = document.getElementById('buildStamp');
    if (b) b.textContent = BUILD_570;
  }

  function patch570() {
    stamp570();
    addProductionBadge570();
    stableHero570();
    dataIntegrityNote570();
    gateAllocation570();
    cleanupOldIntegrity570();
  }

  // Final rendering pass on top of the stable 5.6.4 layer.
  if (typeof render === 'function') {
    const previousRender = render;
    render = function() {
      previousRender();
      setTimeout(patch570, 0);
      setTimeout(patch570, 100);
    };
  }

  window.addEventListener('DOMContentLoaded', () => {
    setTimeout(patch570, 180);
    document.addEventListener('click', ev => {
      if (ev.target.closest('.broker-tab, .period-tabs button, .analysis-tabs button, #refreshBtn')) {
        setTimeout(patch570, 30);
        setTimeout(patch570, 220);
      }
    });
  });
})();
