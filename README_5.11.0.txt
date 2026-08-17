Depot-Cockpit Professional 5.11.0 – Clean Core Reset

Ziel: Altlasten beseitigen und wieder eine eindeutige Laufzeitstruktur herstellen.
Basis: bestätigter stabiler Funktionsstand 5.10.1.

Aktive Frontend-Dateien nach Bereinigung:
- app.js (bestehender Kern, unverändert)
- app-preload.js (einzige Preload-Schicht)
- app-release.js (einzige Release-/UI-Schicht)
- index.html
- styles.css + styles-580.css

Aktive API-Bausteine:
- api/market-data-v3.js
- api/spacex-quote-v1.js
- api/instrument-search-v2.js
- api/health.js (bestehende Datei bleibt)

Keine neuen versionsnummerierten app-preload/app-release-Dateien mehr. Künftige Versionen ersetzen app-preload.js und app-release.js direkt.
Ethereum-Kursrouting wird erst nach erfolgreichem Clean-Reset erneut isoliert aufgebaut.
