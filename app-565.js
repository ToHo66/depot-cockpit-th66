/* Depot-Cockpit Professional 5.6.5 – Cleanup
   Kleine Bereinigungen:
   1) EUR-Hauptwert bleibt auch nach Zeitraumwechsel stabil.
   2) Datenqualität: aktuell / letzter gültiger Kurs / fehlt klar getrennt.
   3) Performance-Platzhalter bereinigt.
   4) Risiko-Hinweis zur Konzentration ergänzt.
*/
(() => {
  'use strict';

  function scope565() {
    return document.querySelector('.broker-tab.active')?.dataset?.brokerFilter || 'all';
  }

  function positions565() {
    const scope = scope565();
    return (window.state?.positions || []).filter(p => scope === 'all' || p.broker === scope);
  }

  function qstat565(p) {
    const d = state?.data?.[p.id];
    let manual = false;
    try { manual = Number.isFinite(brokerPrice(p)); } catch {}
    if (manual) return 'current';
    if (d?.ok && Number.isFinite(Number(d?.latest?.price))) {
      try {
        if (dataIsCurrentToday(p.id) && !d.__stale) return 'current';
      } catch {}
      return 'stored';
    }
    return 'missing';
  }

  function sum565() {
    const ps = positions565();
    let sum = 0, valid = 0;
    for (const p of ps) {
      let v = null;
      try { v = positionValue(p); } catch {}
      if (Number.isFinite(v)) { sum += v; valid++; }
    }
    return {sum, valid, total: ps.length, missing: ps.length - valid};
  }

  function stabilizeHero565() {
    const {sum, valid, total, missing} = sum565();
    const totalEl = document.getElementById('totalValue');
    if (totalEl) {
      totalEl.textContent = valid ? eur(sum) : '–';
      totalEl.classList.toggle('partial-total-564', missing > 0);
    }

    let line = document.getElementById('heroCoverage564');
    if (line) {
      if (!missing) {
        line.className = 'hero-coverage-564 complete';
        line.innerHTML = `<strong>Vollständig bewertet</strong> · ${valid}/${total} Positionen`;
      } else {
        line.className = 'hero-coverage-564 partial';
        line.innerHTML = `<strong>${valid}/${total} Positionen bewertet</strong> · ${missing} ${missing===1?'Kurs fehlt':'Kurse fehlen'} · EUR-Wert = Summe der verfügbaren Positionen`;
      }
    }
  }

  function updateQuality565() {
    const ps = positions565();
    const counts = {current:0, stored:0, missing:0};
    ps.forEach(p => counts[qstat565(p)]++);

    const coverage = document.getElementById('coverage');
    if (coverage) coverage.textContent = `${counts.current}/${ps.length}`;

    const small = coverage?.closest('.metric-card')?.querySelector('small');
    if (small) {
      small.textContent = `${counts.current} aktuell · ${counts.stored} letzter gültiger Kurs · ${counts.missing} fehlt`;
    }

    // Keep risk view consistent with the same source-of-truth.
    const risk = document.getElementById('riskContent');
    if (risk && !risk.hidden) {
      const storedCard = [...risk.querySelectorAll('article')].find(a => a.textContent.includes('Letzte gespeicherte Kurse'));
      if (storedCard) {
        const b = storedCard.querySelector('b');
        const s = storedCard.querySelector('small');
        if (b) b.textContent = counts.stored;
        if (s) s.textContent = 'aktuell nicht neu geliefert';
      }
      const missCard = [...risk.querySelectorAll('article')].find(a => a.textContent.includes('Ohne gültigen Kurs'));
      if (missCard) {
        const b = missCard.querySelector('b');
        if (b) b.textContent = counts.missing;
      }
    }
  }

  function cleanupPerformance565() {
    const perf = document.getElementById('analysisPerformance');
    if (!perf) return;
    const contrib = document.getElementById('contributors');
    if (contrib && /Nach der ersten Aktualisierung verfügbar/i.test(contrib.textContent || '')) {
      contrib.innerHTML = '<p class="muted">Für diesen Zeitraum fehlen noch historische Vergleichsdaten.</p>';
    }

    const summary = document.getElementById('analysisPerformanceSummary');
    if (summary && /keine vollständige Vergleichsbasis/i.test(summary.textContent || '')) {
      summary.innerHTML = '<div class="info-strip">Für diesen Zeitraum fehlen noch historische Vergleichsdaten. Es werden keine erfundenen Performancewerte angezeigt.</div>';
    }
  }

  function riskNote565() {
    const risk = document.getElementById('riskContent');
    if (!risk) return;
    let note = document.getElementById('riskConcentrationNote565');
    if (!note) {
      note = document.createElement('div');
      note.id = 'riskConcentrationNote565';
      note.className = 'risk-note-565';
      risk.appendChild(note);
    }

    const ps = positions565()
      .map(p => {
        let v = null;
        try { v = positionValue(p); } catch {}
        return {p, v};
      })
      .filter(x => Number.isFinite(x.v));
    const total = ps.reduce((a,x)=>a+x.v,0);
    const top = [...ps].sort((a,b)=>b.v-a.v)[0];
    if (!top || !total) {
      note.textContent = '';
      return;
    }
    const w = top.v / total * 100;
    if (w > 20) {
      note.textContent = `${top.p.name} macht rund ${w.toFixed(1).replace('.',',')} % des bewertbaren Depots aus. Deshalb wird die Konzentration als erhöht eingestuft.`;
    } else if (w > 12) {
      note.textContent = `${top.p.name} ist mit rund ${w.toFixed(1).replace('.',',')} % die größte Position und sollte beobachtet werden.`;
    } else {
      note.textContent = 'Die größte Einzelposition liegt derzeit in einem vergleichsweise ausgewogenen Bereich.';
    }
  }

  function patch565() {
    const v = document.getElementById('appVersionLabel');
    if (v) v.textContent = 'DEPOT-COCKPIT · VERSION 5.6.5';
    const b = document.getElementById('buildStamp');
    if (b) b.textContent = 'BUILD CLEANUP · 2026-08-11 · 23:14';

    stabilizeHero565();
    updateQuality565();
    cleanupPerformance565();
    riskNote565();
  }

  // Final rendering pass after all previous overlays.
  if (typeof render === 'function') {
    const prevRender = render;
    render = function() {
      prevRender();
      setTimeout(patch565, 0);
      setTimeout(patch565, 80);
    };
  }

  window.addEventListener('DOMContentLoaded', () => {
    setTimeout(patch565, 160);
    document.addEventListener('click', ev => {
      if (ev.target.closest('.broker-tab, .period-tabs button, .analysis-tabs button, #refreshBtn')) {
        setTimeout(patch565, 20);
        setTimeout(patch565, 180);
      }
    });
  });
})();
