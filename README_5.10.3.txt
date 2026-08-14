Depot-Cockpit Professional 5.10.3 – Ethereum Quote Fix

Basis: bestätigte stabile 5.10.2.

Änderung:
- Ethereum-Positionsintegration bleibt unverändert (3,363942 ETH, Trade Republic, 12.000,00 EUR Kaufbetrag).
- Ausschließlich der Krypto-Kursweg im bestehenden api/market-data-v3.js wurde gehärtet.
- Primär: Coinbase Exchange ETH-EUR Ticker (öffentlich, ohne API-Key).
- Fallback 1: Coinbase Spot ETH-EUR (öffentlich, ohne API-Key).
- Fallback 2: bisheriger Yahoo-ETH-EUR-Weg.
- Keine EODHD-Anfrage für Krypto.
- Keine Änderung an SpaceX, Trilogy, S-Broker-Positionen, Transaktionen oder Speicher-Schlüssel.
- 5.10.2 Release-/Preload-Dateien sind nicht parallel enthalten; sie wurden durch 5.10.3 ersetzt.

Sollzustand nach Deployment:
14/14 bewertet · 0 fehlt · Trade Republic 3 Positionen · Ethereum mit EUR-Kurs und Positionswert.
