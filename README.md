# Depot-Cockpit – Stabilitätsbasis korrigiert

## Ursache des leeren Starts

Die vorherige Stabilitätsbasis hatte den automatischen Kursabruf vollständig abgeschaltet. Auf einer Installation ohne bereits gespeicherten Kursstand konnte deshalb nur ein leerer Zustand erscheinen. Zusätzlich hing die App von einer separat geladenen `market-core.js` ab.

## Korrektur

- `MarketCore` ist direkt in `app.js` integriert.
- Mit gültigem Cache erscheint der letzte Kursstand sofort und es gibt keinen automatischen Abruf.
- Ohne gültigen Cache erfolgt nach erfolgreicher Schlüsselprüfung genau ein kontrollierter Erstabruf.
- Der ↻-Button startet jederzeit eine bewusste Aktualisierung.
- Während des Abrufs erscheint eine sichtbare Statusmeldung.
- Fehler löschen weiterhin keine vorhandenen Werte.
