
/* Depot-Cockpit Professional 5.9.1
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

  const BUILD = '5.9.1';

  const txEsc = s => String(s ?? '').replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));

  function normalizeBroker591(v) {
    const s = String(v || '').trim();
    if (/^s[\s-]?broker$/i.test(s)) return 'sBroker';
    if (/trade\s*republic/i.test(s)) return 'Trade Republic';
    return s || 'Sonstiger';
  }

  function venueLabel591(t) {
    const v = String(t?.venue || t?.instrumentMeta?.venue || '').trim();
    if (!v || v === 'undefined' || v === 'null') return '';
    return v;
  }

  function txAmount591(t) {
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
          Auch die externe Instrumentsuche hat keinen eindeutigen Treffer geliefert.
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
      const normalizedBroker = normalizeBroker591(broker);
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
        broker:normalizeBroker591(p.broker),
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
        const venue = venueLabel591(t);
        const broker = normalizeBroker591(t.broker || state.positions.find(p => p.id === t.positionId)?.broker);
        const amount = txAmount591(t);
        const realized = Number(t.realized);
        const isSell = t.type === 'SELL';

        return `<div class="archive-row transaction-history-591">
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
          <div class="tx-values-591">
            <strong>${isSell ? 'Erlös' : 'Volumen'} ${eur(amount)}</strong>
            ${isSell && Number.isFinite(realized)
              ? `<small class="${realized >= 0 ? 'positive' : 'negative'}">realisiert ${realized >= 0 ? '+' : ''}${eur(realized)}</small>`
              : ''}
          </div>
        </div>`;
      }).join('') : '<p class="muted">Noch keine Käufe oder Verkäufe erfasst.</p>';
    };
  }

  function repairLegacyTransactions591() {
    let changed = false;
    for (const t of state.transactions || []) {
      if (!t.broker) {
        const p = state.positions.find(x => x.id === t.positionId) ||
                  state.archive.find(x => x.id === t.positionId);
        if (p?.broker) { t.broker = normalizeBroker591(p.broker); changed = true; }
      }
      if ((!t.venue || t.venue === 'undefined') && t.instrumentMeta?.venue) {
        t.venue = t.instrumentMeta.venue; changed = true;
      }
    }
    if (changed) save();
  }

  function labelIncompleteDepot591() {
    const valued = state.positions.filter(p => Number.isFinite(positionValue(p))).length;
    const total = state.positions.length;
    const label = document.querySelector('#overview .hero-card > span, #overview .hero-card .hero-label');
    if (label && valued < total) label.textContent = 'Bewerteter Depotwert';
  }

  function rewire591() {
    // Replace handlers installed by the older core with the corrected functions.
    const record = document.getElementById('recordTransaction');
    if (record) record.onclick = recordTransaction;

    const searchBtn = document.getElementById('buyInstrumentSearchBtn');
    if (searchBtn) searchBtn.onclick = runBuyInstrumentSearch;

    const q = document.getElementById('buyInstrumentQuery');
    if (q && q.dataset.wired591 !== '1') {
      q.dataset.wired591 = '1';
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

  repairLegacyTransactions591();

  if (typeof render === 'function') {
    const render590 = render;
    render = function() {
      render590();
      renderTransactions();
      labelIncompleteDepot591();
      rewire591();
    };
  }

  rewire591();
  renderTransactions();
  labelIncompleteDepot591();

  window.addEventListener('DOMContentLoaded', () => {
    rewire591();
    renderTransactions();
    labelIncompleteDepot591();
  });

  console.info(`Depot-Cockpit ${BUILD} Transaction-Correction aktiv`);
})();
