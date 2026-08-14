Depot-Cockpit Professional 5.10.2 – Crypto Ethereum
Stand: 14.08.2026 · 13:22

Basis: bestätigte stabile Version 5.10.1 Clean Consolidated.

Änderungen:
- Ethereum als dritte Trade-Republic-Position ergänzt.
- Bestand: 3,363942 ETH.
- Verbindlicher Kaufbetrag: 12.000,00 EUR.
- Rechnerischer Einstand: 3.567,243430 EUR je ETH.
- Eigener Instrumenttyp Crypto; Aktien/ETFs/Rohstoffe bleiben logisch getrennt.
- Neuer Positionsfilter „Krypto“.
- ETH-EUR wird innerhalb des bestehenden zentralen Market-Data-V3-Endpunkts separat als 24/7-Kurs behandelt.
- Crypto läuft nicht über Deutsche-Börse- oder EODHD-Routing und verbraucht dort keine zusätzlichen Calls.
- SpaceX-Regressionsschutz 20,437 Stück bleibt vollständig erhalten.
- Keine alten 5.10.1 Release-/Preload-Dateien parallel im Paket.

Regression-Lock:
- bestehende Positionen und Transaktionen werden nicht gelöscht;
- fehlende Kursdaten dürfen Positionen nicht entfernen;
- bestehende gültige Kurse bleiben als letzter gültiger Kurs erhalten;
- Ethereum-Migration ist idempotent und erzeugt keine Dublette.
