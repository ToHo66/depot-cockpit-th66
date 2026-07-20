# Depot-Cockpit Release 4.1

## Schwerpunkt: API-Limit und Kursdaten-Stabilität

- Browsercache wird sechs Stunden ohne neuen API-Aufruf verwendet.
- Gespeicherte Kursdaten bleiben bis zu 14 Tage als Rückfallebene erhalten.
- Beim Start erfolgt kein automatischer Abruf, solange der Cache aktuell ist.
- Der Aktualisieren-Button erzwingt bewusst einen neuen Abruf.
- Pro Wertpapier wird nur eine 400-Tage-Zeitreihe geladen.
- Tag, Woche, Monat, drei Monate und ein Jahr werden aus dieser einen Reihe berechnet.
- Ein serverseitiger Best-Effort-Cache reduziert Wiederholungsabrufe innerhalb einer warmen Vercel-Instanz.
- Bei EODHD 402 wird die Abfrage sofort gestoppt; es werden keine weiteren nutzlosen Anfragen erzeugt.
- Erfolgreiche alte Kursdaten werden bei Fehlern nicht mehr durch Fehlermeldungen überschrieben.
- Die Oberfläche zeigt statt des technischen 402-Textes eine verständliche Meldung.

## Erwartetes Verhalten

1. Erster Aufruf ohne Cache: Kursdaten werden geladen.
2. Weitere Seitenaufrufe innerhalb von sechs Stunden: keine neue EODHD-Abfrage.
3. Manueller Klick auf Aktualisieren: neuer Abruf.
4. Bei erreichtem Tageslimit: zuletzt gespeicherte Kurse und Charts bleiben sichtbar.
