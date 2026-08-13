DEPOT-COCKPIT PROFESSIONAL 5.9.2
BUILD STABLE-CORE-RESTORE · 12.08.2026

URSACHE DES 5.9.1-RÜCKSCHRITTS
5.9.1 hatte den bewährten Kurskern aus 5.9.0 verändert:
Vor dem normalen EODHD-Fallback wurde für ungelöste Titel zusätzlich ein
Real-Time-Endpunkt aufgerufen. Bei API-/Plan-Limits konnte dieser Schritt
den bewährten Fallback abbrechen. Außerhalb der Xetra-Handelszeit fiel die
Versorgung dadurch von 12/12 auf 3/12.

5.9.2
- api/market-data-v3.js ist wieder EXAKT der bewährte 5.9.0-Kurskern.
- Keine Live-Quote-Erweiterung im bestehenden Depot.
- Die Transaktionskorrekturen aus 5.9.1 bleiben erhalten.
- Broker und Handelsplatz bleiben getrennt.
- Kein "undefined" in neuen Transaktionen.
- Verkauf: Erlös und realisierter G/V getrennt.
- Gewichteter Einstand bei Nachkauf bleibt erhalten.
- Externe Instrumentsuche verbessert:
  1. bei ISIN zuerst EODHD ID Mapping,
  2. danach EODHD Search API.
- Ein Nichttreffer wird nicht als technischer Fehler ausgegeben, sondern als
  "Kennung prüfen / freie Eingabe".

WICHTIG ZUM TEST VON 23:40
Die eingegebene ISIN IE00BYZK4776 ist nicht die ISIN des iShares Ageing
Population. Dessen ISIN lautet IE00BYZK4669. Ein Nichttreffer für 4776 ist
deshalb kein Beleg für einen Defekt der externen Suche.

UPLOAD
Hauptverzeichnis:
- index.html ersetzen
- app-590.js ersetzen
- app-592.js neu hinzufügen
- app-591.js löschen, falls noch vorhanden

Ordner api:
- market-data-v3.js ersetzen
- instrument-search-v2.js ersetzen

ERSTER TEST
1. VERSION 5.9.2 muss sichtbar sein.
2. Aktualisieren.
3. Erwartung: bestehende 12 Positionen dürfen nicht dauerhaft auf 3/12 fallen.
4. Externe Suche mit einer nachweislich korrekten ISIN testen.
