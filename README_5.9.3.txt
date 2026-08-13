DEPOT-COCKPIT PROFESSIONAL 5.9.3
BUILD TRILOGY-FALLBACK · 13.08.2026

ÄNDERUNGSUMFANG – ABSICHTLICH KLEIN
- Ausgangsbasis: 5.9.2 Stable Core Restore.
- Standard-Kurskern Deutsche Börse/Xetra und normaler EODHD-Fallback unverändert.
- Transaktionen, Speicherung, Instrument-Master und UI-Logik unverändert.
- Einzige funktionale Änderung: Trilogy Metals.

TRILOGY METALS
1. Bisheriger TMQ/Yahoo-Pfad bleibt erste Quelle.
2. Nur wenn dieser Pfad keinen Kurs liefert, wird TMQ.US über EODHD abgefragt.
3. Für die EUR-Umrechnung wird dann EURUSD.FOREX über EODHD verwendet.
4. Der resultierende TMQ-Kurs wird weiterhin ausschließlich in EUR an die App geliefert.
5. Scheitern beide Wege, bleibt der vorhandene gespeicherte Kurs erhalten; andere Positionen werden nicht beeinflusst.

WICHTIG
SpaceX ist in 5.9.3 absichtlich NICHT verändert.

TEST NACH DEPLOYMENT
1. VERSION 5.9.3 sichtbar.
2. Aktualisieren.
3. Prüfen, dass die bisherigen grünen Positionen weiterhin grün bleiben.
4. Trilogy Metals prüfen: aktueller/letzter verwertbarer TMQ-Kurs statt fehlender Kurs.
5. SpaceX darf weiterhin unverändert als separater Sonderfall erscheinen.
