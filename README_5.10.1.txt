DEPOT-COCKPIT PROFESSIONAL 5.10.1 — CLEAN CONSOLIDATED
Stand: 14.08.2026 12:28

ZIEL
Die kleinen Safe-Steps 5.9.7 bis 5.10.0 sind in eine saubere aktive Struktur überführt.
Keine konkurrierenden Versions-Patches mehr. Keine gestapelten SpaceX-Reparaturskripte mehr.

AKTIVE STRUKTUR
1. app.js                  bestehender stabiler Basiskern (unverändert)
2. app-preload-5101.js     Regression-Lock + idempotente SpaceX-Normalisierung
3. app-release-5101.js     konsolidierter UI-/Daten-/Transaktions-/Persistenz-Layer
4. api/market-data-v3.js   unverändert aus bestätigter Basis
5. api/instrument-search-v2.js unverändert aus bestätigter Basis
6. api/spacex-quote-v1.js  unverändert, nur Diagnose/Reserve

ERSETZT / NICHT MEHR AKTIV
app-597-preload.js
app-598-preload.js
app-599-preload.js
app-5100-preload.js
app-590.js
app-592.js
app-595.js
app-596.js

WICHTIGE INVARIANTEN
- SpaceX 20,437 Stück bleiben erhalten.
- ISIN US84615Q1031 / WKN A42D4F / SPX / EUR.
- 11 S-Broker-Positionen bleiben unangetastet.
- Trilogy Metals bleibt unangetastet.
- Fehlende Kurse löschen keine Position.
- Transaktionshistorie bleibt append-only geschützt.
- Versionsanzeige hat nur noch einen Eigentümer und bleibt 5.10.1.

DEPLOYMENT
Diese Dateien ersetzen die gleichnamigen aktiven Release-Dateien aus dem Paket.
Die oben genannten alten app-59x/app-5100-Dateien sollen aus dem Repository entfernt werden; index.html referenziert sie nicht mehr.
Der bestehende app.js-, CSS- und Manifest-Basiskern bleibt unverändert.
