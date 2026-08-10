# Depot-Cockpit 5.3.2 — iPhone First + Xetra Parser Deep Fix

## Parser
- unterstützt JSON und NDJSON nach dem Entpacken der Deutsche-Börse-GZ-Dateien
- behandelt eine komplette NDJSON-Zeile / ein komplettes Trade-Event als Zusammenhang
- durchsucht verschachtelte Strukturen rekursiv
- Instrument-Matching über ISIN, WKN, Mnemonic und optionale Instrument-ID
- rekursive Erkennung von Preis, MIC, Zeitstempel und Währung
- Diagnose enthält Event-/Preis-/Match-Zähler sowie Feldpfad-Stichproben

## iPhone
- iPhone ist das verbindliche Primärlayout
- kein horizontales Desktop-Canvas mehr
- Schnellprüfung stapelt sich vertikal
- Depot-Differenzprüfer bricht auf zwei bzw. einer Spalte um
- Bottom Navigation bleibt innerhalb des Viewports
