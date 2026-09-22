DEPOT-COCKPIT 6.0.24-mobile24 — MOVERS FILTER / LAM ROUTING

Enthaltene Korrekturen:

1. Gewinner/Verlierer
- Gewinner zeigt ausschließlich Tageswerte > 0 %.
- Verlierer zeigt ausschließlich Tageswerte < 0 %.
- 0,00 % erscheint in keiner Liste.
- Gibt es nur 1 oder 2 echte Verlierer/Gewinner, werden auch nur 1 oder 2 angezeigt.
- Ein positiver Wert kann nicht mehr als "Verlierer" erscheinen.

2. LAM Research
- ISIN US5128073062
- WKN A40L1V
- Deutsche-Börse/Xetra-Symbol LAR0
- primäres Routing weiterhin über bestehenden Deutsche-Börse-Kern
- Fallback: LAR0.DE -> LAR0.F -> LAR0.SG
- Historie/Analyse: LAR0.DE mit deutschem Fallback
- Tagesreferenz: deutsche EUR-Referenz, damit kein unnötiger Nasdaq/EUR-Mix entsteht.

3. Dynamische Instrument-Metadaten
- Bereits lokal gespeicherte Positionen werden beim Laden anhand ihrer ISIN mit
  fehlenden Katalogdaten ergänzt, ohne Stückzahl oder Einstand zu überschreiben.
- Dadurch erhalten auch ältere manuell angelegte Positionen nach einem Update
  nachträglich das korrekte Kurs-/Analyse-Routing.

4. Kompatibilitätsrouting für aktuelle dynamische S-Broker-Positionen
- Franklin FTSE Korea: IE00BHZRR030 / A2PB5X / FLXK
- LAM Research: US5128073062 / A40L1V / LAR0
- Micron Technology: US5951121038 / 869020 / MTE

Bewusst nicht verändert:
- bestehende Transaktionen und Stückzahlen
- Einstandswerte
- Healthcare-Reparatur aus 6.0.23
- Rechenkern und Qualitätslogik
- Chart-/5er-Check-UI
