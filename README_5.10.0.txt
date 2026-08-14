Depot-Cockpit Professional 5.10.0 — Unified SpaceX Safe-Step
Stand: 14.08.2026

Ziel
- Das funktionierende Kursprinzip des stabilen 5.9.2-Datenkerns wird beibehalten.
- Der bestätigte SpaceX-Bestand 20,437 aus 5.9.8 bleibt geschützt.
- Nur SpaceX (ISIN US84615Q1031 / WKN A42D4F) wird zusätzlich vereinheitlicht.

SpaceX-Stammdaten in 5.10.0
- ISIN: US84615Q1031
- WKN: A42D4F
- Symbol Deutschland: SPX
- Primäre Analyse-Route: Xetra / DE
- Fallback-Venues: Xetra, Frankfurt, Stuttgart
- Währung: EUR
- Broker: Trade Republic

Mengenlogik
1. Positive, verwertbare BUY/SELL-Transaktionsbilanz hat Vorrang.
2. Nur der alte 5.9.7-Notfallwert exakt 10 wird ohne Transaktionsbeleg auf 20,437 repariert.
3. Jede andere bestehende Menge bleibt unangetastet.
4. Fehlt SpaceX vollständig und ist nicht archiviert, wird die bestätigte Position 20,437 wiederhergestellt.

Kurslogik
- Kein neuer paralleler Client-Kurskern.
- Der bestehende 5.9.2 Market Data V3 bleibt führend und sucht per ISIN/Symbol.
- Falls für SpaceX beim Start kein verwertbarer Kurs vorhanden ist, wird einmal pro Sitzung automatisch der vorhandene Refresh ausgelöst.
- Bestehende letzte gültige Kurse bleiben durch die 5.9.2 Snapshot-Merge-Logik erhalten.

Regression Lock
- 5.9.7 Regression Lock bleibt aktiv.
- 5.9.8 Quantity Repair bleibt aktiv.
- 5.9.9 Routing Patch bleibt aktiv.
- 5.10.0 führt die drei Safe-Steps zusammen und normalisiert den Endzustand.
- Andere 12 Positionen, Transaktionslogik und der Market-Data-Kern werden nicht umgebaut.

Test nach Deployment
1. Gesamt: 13 Positionen.
2. S Broker: 11 Positionen.
3. Trade Republic: 2 Positionen.
4. SpaceX sichtbar.
5. SpaceX Menge exakt 20,437, sofern keine neueren realen BUY/SELL-Transaktionen eine andere Menge ergeben.
6. SpaceX Kurs in EUR vorhanden; bei Fehlschlag bleibt letzter gültiger Kurs erhalten.
7. Trilogy Metals unverändert 600 Stück.
8. Kein Global X Data Center als aktive Position.
