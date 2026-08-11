/* Depot-Cockpit Professional 5.6.4 – kleine technische Korrekturen
   - Depotwert in EUR bleibt sichtbar, auch wenn einzelne Kurse fehlen.
   - Bewertungsabdeckung wird separat und verständlich ausgewiesen.
   - Dekorative Mini-Balken werden entfernt.
   - Keine Änderung an der Kursengine oder den bestehenden 5.6.3-Filtern.
*/
(() => {
  'use strict';

  function activeBrokerScope564() {
    const active = document.querySelector('.broker-tab.active');
    return active?.dataset?.brokerFilter || 'all';
  }

  function scopedPositions564() {
    const scope = activeBrokerScope564();
    if (!window.state?.positions) return [];
    return state.positions.filter(p => scope === 'all' || p.broker === scope);
  }

  function safePositionValue564(p) {
    try {
      const v = positionValue(p);
      return Number.isFinite(v) ? v : null;
    } catch {
      return null;
    }
  }

  function scopeLabel564() {
    const scope = activeBrokerScope564();
    if (scope === 'sBroker') return 'S Broker';
    if (scope === 'Trade Republic') return 'Trade Republic';
    return 'Gesamtdepot';
  }

  function ensureCoverageLine564() {
    const hero = document.querySelector('.hero-card');
    const total = document.getElementById('totalValue');
    if (!hero || !total) return null;

    let line = document.getElementById('heroCoverage564');
    if (!line) {
      line = document.createElement('div');
      line.id = 'heroCoverage564';
      line.className = 'hero-coverage-564';
      total.insertAdjacentElement('afterend', line);
    }
    return line;
  }

  function patchHero564() {
    const ps = scopedPositions564();
    if (!ps.length) return;

    const values = ps.map(p => ({ p, value: safePositionValue564(p) }));
    const valid = values.filter(x => Number.isFinite(x.value));
    const missing = values.length - valid.length;
    const sum = valid.reduce((a, x) => a + x.value, 0);

    const totalEl = document.getElementById('totalValue');
    if (totalEl) {
      // Important: Never replace the useful EUR value with "Teilbewertung x/y".
      totalEl.textContent = valid.length ? eur(sum) : '–';
      totalEl.classList.toggle('partial-total-564', missing > 0);
    }

    const coverageLine = ensureCoverageLine564();
    if (coverageLine) {
      if (missing === 0) {
        coverageLine.innerHTML = `<strong>Vollständig bewertet</strong> · ${valid.length}/${values.length} Positionen`;
        coverageLine.className = 'hero-coverage-564 complete';
      } else {
        coverageLine.innerHTML =
          `<strong>${valid.length}/${values.length} Positionen bewertet</strong> · ` +
          `${missing} ${missing === 1 ? 'Kurs fehlt' : 'Kurse fehlen'} · angezeigter EUR-Wert ist die Summe der verfügbaren Positionen`;
        coverageLine.className = 'hero-coverage-564 partial';
      }
    }

    const label = document.getElementById('heroScopeLabel');
    if (label) label.textContent = `${scopeLabel564()}wert`;

    // Make the data-quality card consistent with the selected broker scope.
    const coverage = document.getElementById('coverage');
    if (coverage) coverage.textContent = `${valid.length}/${values.length}`;
    const small = coverage?.closest('.metric-card')?.querySelector('small');
    if (small) {
      small.textContent = missing
        ? `${missing} ${missing === 1 ? 'Position ohne gültigen Kurs' : 'Positionen ohne gültigen Kurs'}`
        : 'vollständig bewertbar';
    }
  }

  function patchVersion564() {
    const v = document.getElementById('appVersionLabel');
    if (v) v.textContent = 'DEPOT-COCKPIT · VERSION 5.6.4';
    const b = document.getElementById('buildStamp');
    if (b) b.textContent = 'BUILD TECHNICAL POLISH · 2026-08-11 · 22:48';
  }

  function patch564() {
    patchVersion564();
    patchHero564();
  }

  // The original render is already wrapped by 5.6.3. Add one small final pass.
  if (typeof render === 'function') {
    const render563 = render;
    render = function() {
      render563();
      setTimeout(patch564, 0);
    };
  }

  window.addEventListener('DOMContentLoaded', () => {
    setTimeout(patch564, 120);

    // Broker and period controls may update the hero asynchronously.
    document.addEventListener('click', ev => {
      if (ev.target.closest('.broker-tab, .period-tabs button, #refreshBtn')) {
        setTimeout(patch564, 20);
        setTimeout(patch564, 250);
      }
    });
  });
})();
