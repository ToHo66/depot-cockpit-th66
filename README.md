# Depot-Cockpit – Stabilitätsbasis Timeout-Fix

Behoben wurde der endlose Ladezustand beim Kursabruf.

- Browser bricht nach 30 Sekunden kontrolliert ab.
- Jede EODHD-Anfrage endet nach spätestens 5,5 Sekunden.
- Die Serverfunktion hat insgesamt höchstens 24 Sekunden Zeit.
- Alle Positionen werden parallel bearbeitet, statt nacheinander minutenlang zu blockieren.
- Pro Position werden maximal zwei Symbolkandidaten geprüft.
- Der Ladezustand endet immer mit Daten oder einer sichtbaren Fehlermeldung.
- Vorhandene Werte bleiben bei Fehlern erhalten.
