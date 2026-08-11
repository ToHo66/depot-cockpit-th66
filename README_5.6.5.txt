DEPOT-COCKPIT PROFESSIONAL 5.6.5
Kleiner Cleanup auf Basis von 5.6.4.

ÄNDERUNGEN
- Depotwert in EUR bleibt auch nach Wechsel 1T/1W/1M/3M/1J/Max stabil.
- Datenqualität wird nicht mehr missverständlich als "aktuell/verwertbar" gezeigt.
  Stattdessen: X aktuell · Y letzter gültiger Kurs · Z fehlt.
- Performance-Platzhalter "Nach der ersten Aktualisierung verfügbar" entfernt.
- Klare Aussage bei fehlenden historischen Vergleichsdaten.
- Risikoansicht erklärt kurz, warum die Konzentration als erhöht eingestuft wird.
- Keine Änderung an Marktdaten-Engine oder Stammdaten.

UPLOAD AUF DEM IPHONE
Nur diese drei Dateien ins GitHub-Hauptverzeichnis:
1. index.html       -> ersetzen
2. app-565.js       -> neu
3. styles-565.css   -> neu

NICHT ANFASSEN:
app.js, app-563.js, app-564.js, styles.css, styles-563.css, styles-564.css,
vercel.json, /api, /public.

Nach Deployment muss oben stehen:
DEPOT-COCKPIT · VERSION 5.6.5
BUILD CLEANUP · 2026-08-11 · 23:14
