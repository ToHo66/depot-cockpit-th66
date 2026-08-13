DEPOT-COCKPIT 5.9.6 — SPACEX DIAGNOSTIC SAFE STEP

Dieser Schritt verändert KEINE bestehende Kurs-, Depot-, Transaktions- oder Speicherlogik.
Er diagnostiziert ausschließlich die Kursauflösung für US84615Q1031 (SpaceX).

Geschützt und byte-identisch zu 5.9.5:
app-590.js
app-592.js
app-595.js
api/market-data-v3.js
api/instrument-search-v2.js

Neu:
app-596.js
api/spacex-quote-v1.js

Geändert:
index.html: nur Versions-/Buildtext und Einbindung app-596.js.

Ziel:
Zuerst sicher feststellen, welche externe Symbolauflösung für SpaceX funktioniert.
Noch KEINE Einspeisung des Ergebnisses in die Depotbewertung. Damit kann 5.9.6
keinen der bereits funktionierenden grünen Kurse beschädigen.
