DEPOT-COCKPIT PROFESSIONAL 5.9.8
SPACEX-QUANTITY-REPAIR · 13.08.2026 · 19:20

ZIEL
Ausschließlich die falsche 5.9.7-Notfallstückzahl bei SpaceX korrigieren.

BEFUND
5.9.7 hat SpaceX erfolgreich gegen Verschwinden geschützt, aber im Notfall mit
10 Stück wiederhergestellt. Der vor der Regression sichtbare und bestätigte
Bestand war 20,437 Stück.

LOGIK
1. Existiert verwertbare SpaceX-Transaktionshistorie, hat deren BUY-minus-SELL-Saldo Vorrang.
2. Existiert keine verwertbare Historie mehr, wird NUR der exakt von 5.9.7 erzeugte
   Notfallwert 10 auf 20,437 korrigiert.
3. Andere Stückzahlen werden niemals überschrieben.
4. Archivierte/vollständig verkaufte SpaceX-Positionen werden nicht wiederhergestellt.
5. Vor jeder Korrektur wird ein Historien-Snapshot geschrieben.
6. Keine Kurslogik wird verändert.

UNVERÄNDERT zu 5.9.7
- app-597-preload.js (Regression Lock)
- app-590.js / app-592.js / app-595.js / app-596.js
- api/market-data-v3.js
- api/instrument-search-v2.js
- api/spacex-quote-v1.js

NEU
- app-598-preload.js

GEÄNDERT
- index.html: nur Version/Build + app-598-preload.js vor app.js.

ERWARTUNG NACH DEPLOYMENT
Trade Republic:
- Trilogy Metals unverändert
- Space Explorations Technology A: 20,437 Stück
- SpaceX-Kurs weiterhin ggf. rot; der Kurs ist NICHT Bestandteil dieses Safe-Steps.

UPLOAD BEI BESTEHENDER 5.9.7
1. index.html ersetzen
2. app-598-preload.js hinzufügen
