# Depot-Cockpit 5.4.0 — Structural Reset

## Kernkorrekturen
- Version 5.4.0 konsistent in UI, JavaScript und package.json.
- Neuer Storage-Namespace `master-v4`; alte Marktdaten-Caches werden nicht übernommen.
- Markt-Snapshot ist atomar: neue Ergebnisse ersetzen den alten Snapshot vollständig.
- Keine Vermischung fehlender Positionen mit alten EODHD-/Xetra-Werten.
- Gesamtdepotwert wird nur bei vollständiger Bewertung aller aktiven Positionen angezeigt; sonst klare Teilbewertung x/y.
- Servercache 5.4.0 ersetzt Treffer atomar und wird nicht für abweichende Positionsmengen wiederverwendet.
- Default-Depot korrigiert: Global X Data Center entfernt; iShares Ageing Population (150 × 9,52 EUR) aufgenommen.
- Trilogy Metals bleibt als manuelle/nicht-Xetra Position getrennt.
- Kaufmaske und Deutsche-Börse-Instrumentensuche bleiben offen für neue Wertpapiere.

## Datenquelle
Die 5.4.0 verwendet den offiziellen kostenlosen Deutsche-Börse Xetra Delayed Post-Trade Feed (15 Minuten). Fehlende Instrumente werden nicht durch alte EODHD-Werte kaschiert.

## Wichtig
Pre-Trade/Tradegate/Frankfurt sind als nächste Feed-Erweiterung fachlich geeignet, wurden in 5.4.0 aber nicht mit geratenen Dateinamen implementiert. Die Deutsche Börse bestätigt offiziell kostenlose 15-Minuten-delayed Pre-/Post-Trade-Daten, minütliche Publikation und getrennte File Services.
