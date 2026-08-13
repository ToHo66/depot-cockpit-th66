DEPOT-COCKPIT PROFESSIONAL 5.9.5
BUILD PERSISTENCE-GUARD · 13.08.2026 · 13:45

ZIEL
Dieser Build behebt ausschließlich das Risiko, dass manuell erfasste Positionen
(z.B. SpaceX) und Transaktionen zwischen verschiedenen Vercel-Preview-URLs
scheinbar verschwinden.

WARUM DAS PASSIERT
localStorage/IndexedDB sind an die jeweilige Web-Adresse (Origin) gebunden.
Eine neue Vercel-Preview-Adresse besitzt daher einen anderen lokalen Speicher
als die feste Produktionsadresse.

WAS 5.9.5 MACHT
- Erkennt automatisch eine Vercel-Preview-Adresse.
- Warnt sichtbar, bevor dort versehentlich weiter gebucht wird.
- Zeigt Anzahl der dort gespeicherten Positionen und Transaktionen.
- Ein Button überträgt den lokalen Depotstand einmalig über einen temporären,
  nur im Browser verarbeiteten URL-Hash zur festen Produktionsadresse.
- Auf der festen Produktionsadresse wird der Depotstand in den regulären
  Speicher "th66-professional-master-v5" importiert und die URL sofort bereinigt.
- Danach arbeitet der Nutzer auf der festen Adresse weiter.

SICHERHEIT / SAFE STEP
UNVERÄNDERT und byte-identisch zu 5.9.2:
- app-590.js
- app-592.js
- api/market-data-v3.js
- api/instrument-search-v2.js

Damit werden Kursversorgung, Bewertung, Brokerage-Logik und Transaktionen
NICHT verändert.

NEU:
- app-595.js

GEÄNDERT:
- index.html (nur Versions-/Buildtext + Einbindung app-595.js)

UPLOAD
Hauptverzeichnis:
1. index.html ersetzen
2. app-595.js neu hinzufügen

Die übrigen Dateien müssen NICHT ersetzt werden, wenn 5.9.2 bereits sauber läuft.

TEST
1. Nach Deployment eine Preview-URL öffnen.
2. Erwartung: gelbe Warnung "Vercel-Testadresse erkannt".
3. "Depotdaten übernehmen & feste App öffnen" antippen.
4. Erwartung: feste Adresse depot-cockpit-th66-vercel-v20.vercel.app öffnet sich.
5. Dort muss eine grüne Bestätigung erscheinen.
6. Positionen/Transaktionen prüfen.
