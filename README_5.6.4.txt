DEPOT-COCKPIT PROFESSIONAL 5.6.4
Kleine technische Korrekturen auf Basis der funktionierenden 5.6.3.

ÄNDERUNGEN
1. Der Hauptwert zeigt wieder den tatsächlich berechenbaren Depotwert in EUR.
   Auch bei fehlenden Kursen steht dort nicht mehr nur "Teilbewertung 10/12".
2. Direkt darunter steht transparent:
   - wie viele Positionen bewertet sind,
   - wie viele Kurse fehlen,
   - dass der EUR-Wert bei Teilabdeckung nur die Summe der verfügbaren Werte ist.
3. Die Datenqualitäts-Kachel folgt dem aktuell gewählten Brokerfilter.
4. Die dekorativen blauen Mini-Balken im Depotwert werden entfernt.
5. Version/Build werden eindeutig auf 5.6.4 aktualisiert.
6. Keine Änderung an Marktdaten-Engine, Filtern oder den funktionierenden
   Kursstatus-Ampeln aus 5.6.3.

UPLOAD AUF DEM IPHONE
Nur diese drei Dateien im HAUPTVERZEICHNIS von GitHub hochladen:
- index.html       (ersetzen)
- app-564.js       (neu)
- styles-564.css   (neu)

Bestehende Dateien NICHT löschen oder ersetzen:
- app.js
- app-563.js
- styles.css
- styles-563.css
- vercel.json
- /api
- /public

Nach dem Deployment muss oben stehen:
DEPOT-COCKPIT · VERSION 5.6.4
BUILD TECHNICAL POLISH · 2026-08-11 · 22:48
