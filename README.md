# Depot-Cockpit – Stabilitätsbasis

Dieser Stand kehrt bewusst zum brauchbaren Release 4.0 zurück und übernimmt nur die technisch notwendigen Stabilitätsänderungen.

## Verbindliche Architektur

- Kein automatischer EODHD-Abruf beim Öffnen.
- Ein neuer Kursabruf erfolgt ausschließlich nach Klick auf ↻.
- Der letzte gültige Kursstand wird dauerhaft zusammen mit den Depotdaten gespeichert.
- Alte Marktdaten-Caches werden als Rückfallebene gelesen.
- API-Fehler und einzelne fehlerhafte Positionen überschreiben niemals funktionierende Altwerte.
- Manuelle Brokerkurse und Depotstammdaten funktionieren unabhängig von EODHD.
- JSON-Export und -Import enthalten auch den letzten gültigen Kursstand.

## Automatisierte Prüfungen

`npm test` prüft:
- kein Abruf beim Start,
- manueller Abruf erlaubt,
- vollständiger 402-Fehler mit Altstand,
- teilweiser API-Erfolg,
- leerer Erstzustand,
- Auswahl des neuesten gültigen Snapshots,
- Ablehnung beschädigter Snapshots,
- verständliche Fehlermeldung.

Die App wurde außerdem per JavaScript-Syntaxprüfung und ZIP-Integritätsprüfung kontrolliert.
