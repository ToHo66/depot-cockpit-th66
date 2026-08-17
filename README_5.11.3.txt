Depot-Cockpit Professional 5.11.3 – Unified Market Core

- 14 Positionen bleiben kanonisch erhalten (11 S Broker + Trilogy + SpaceX 20,437 + Ethereum 3,363942).
- Ethereum wird nicht mehr über einen separaten neuen API-Dateipfad geladen.
- ETH/EUR ist direkt in api/market-data-v3.js integriert.
- Primär Kraken ETHEUR, Fallback Coinbase ETH-EUR Spot.
- app-release.js ruft nur noch den gemeinsamen Market-Data-Core auf.
- Keine versionsnummerierten Runtime-Dateien; vorhandene Dateien werden ersetzt.
