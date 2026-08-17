DEPOT-COCKPIT PROFESSIONAL 5.11.1 — ETHEREUM SERVER QUOTE

Ziel:
- 5.11.0 bleibt die stabile Basis.
- Ethereum wird NICHT durch market-data-v3 geschickt.
- Eigener fester Endpunkt: /api/crypto-quote.js
- Primär Coinbase ETH-EUR Spot, Fallback Kraken ETH/EUR.
- Kein Browser-CORS: beide externen Quellen werden serverseitig von Vercel abgefragt.
- Bestehende Snapshot-Merge-Logik bleibt erhalten.
- SpaceX/Trilogy/Aktien/ETFs bleiben unverändert.

DATEIEN ZU ERSETZEN:
- index.html
- app-preload.js
- app-release.js

NEUE DATEI:
- api/crypto-quote.js

KEINE ALTDATEIEN FÜR DIESEN SCHRITT ANLEGEN.
