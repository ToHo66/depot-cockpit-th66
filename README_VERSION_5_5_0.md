# Depot-Cockpit 5.5.0 – Market Data Core

Struktureller Neuaufbau der Kursversorgung.

## Pipeline
1. Instrumente über offiziellen Xetra-Instrument-Master auflösen.
2. Xetra Pre-Trade bevorzugen (Bid/Ask, Bewertungswert = Mid sofern vorhanden).
3. Xetra Post-Trade als nächster Pfad.
4. Tradegate Pre-Trade und Frankfurt Pre-Trade als Fallback.
5. Ein atomarer Snapshot wird erzeugt.
6. Der Snapshot wird auf dem iPhone persistent in IndexedDB gespeichert.
7. Die App liest den Snapshot nach dem Schreiben erneut aus und rendert ausschließlich diese gespeicherten Daten.

Keine Vermischung mit alten EODHD-Kursen. Kein Teilwert wird als Gesamtdepotwert bezeichnet.
