# Golden Master 5.2 – Abrufschutz-Test

Diese Testversion basiert direkt auf Golden Master 5.0.

Geändert wurde ausschließlich die Kursabruflogik:

- kein automatischer EODHD-Abruf beim Öffnen oder Neuladen
- Abruf nur nach Klick auf ↻ und ausdrücklicher Bestätigung
- maximal ein festes Analyse-Symbol je Position
- keine automatische Schleife über Ersatzbörsen
- Schutz vor parallelen Doppelabrufen
- Warnung bei einem zweiten Abruf am selben Tag
- sofortiger Abbruch aller weiteren externen Anfragen nach EODHD 402
- vorhandene erfolgreiche Cache-Daten bleiben bei Fehlern erhalten

Zum ersten sinnvollen Test bitte bis zum nächsten Reset des EODHD-Tageslimits warten, die App öffnen und genau einmal auf ↻ klicken.
