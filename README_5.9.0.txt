DEPOT-COCKPIT PROFESSIONAL 5.9.0
BUILD DATA-CORE-V3 · 12.08.2026

WARUM 5.9.0
Die Datenversorgung wurde nicht erneut mit weiteren Einzel-Patches überlagert.
5.9.0 verwendet einen einzigen neuen Kurs-Endpunkt: /api/market-data-v3.

WESENTLICHE ÄNDERUNGEN
- Xetra Post-Trade bleibt erste Quelle: tatsächlich gehandelter letzter Preis.
- Fehlt dort ein Trade, wird Xetra Pre-Trade geprüft:
  Bid/Ask werden ausgewertet; bei beiden Seiten wird der Mittelwert verwendet.
- Erst danach wird EODHD für weiterhin fehlende deutsche Positionen verwendet.
- Trilogy Metals wird im selben Endpunkt über TMQ + EUR/USD versorgt.
- Der 15-Minuten-Cache gilt nur noch dann als "vollständig", wenn ALLE angefragten
  Positionen einen gültigen Kurs besitzen. Ein 10/11-Ergebnis blockiert die fehlende
  Position nicht mehr.
- Deutsche-Börse-Suche orientiert sich an Europe/Berlin und der erweiterten
  Xetra-Retail-Session 08:00–22:00 Uhr; Dateinamen bleiben UTC.
- Jede Position erhält eine Diagnose: gefunden/nicht gefunden, Quelle, Match und Datei.
- Instrumentstammdaten werden beim Start korrigiert:
  Vanguard FTSE All-World = VWCE
  MSCI World Information Technology = AYEW
  iShares Ageing Population = 2B77
  Trilogy Metals = TMQ
- Bereits gespeicherte gültige Kurse bleiben erhalten, wenn der neue Lauf keinen
  besseren Wert liefert.

UPLOAD AUF DEM IPHONE – NUR 3 DATEIEN
HAUPTVERZEICHNIS:
1. index.html          ersetzen
2. app-590.js          neu hinzufügen

ORDNER api:
3. market-data-v3.js   neu hinzufügen

NICHT ÄNDERN
app.js
styles.css
styles-580.css
vercel.json
api/market-data-v2.js
api/market-data.js
/public

Die alten app-581.js und älteren Layer dürfen im Repository liegen bleiben.
index.html lädt sie nicht mehr.

NACH DEM DEPLOYMENT
1. Feste Produktionsadresse öffnen:
   depot-cockpit-th66-vercel-v20.vercel.app
2. Oben muss VERSION 5.9.0 / BUILD DATA-CORE-V3 stehen.
3. Einmal auf Aktualisieren drücken.
4. Unter Diagnose wird anschließend JEDE Depotposition mit ihrer tatsächlich
   verwendeten Quelle bzw. dem konkreten Fehlstatus aufgeführt.

WICHTIG
Ein Pre-Trade-Wert ist kein ausgeführter Handel. Die App kennzeichnet die Quelle
deshalb ausdrücklich als "Xetra Bid/Ask". So wird nicht mehr "kein Kurs" angezeigt,
nur weil in der betrachteten Minute kein Post-Trade stattgefunden hat.
