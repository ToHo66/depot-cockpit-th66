DEPOT-COCKPIT PROFESSIONAL 5.7.0
STABLE PRODUCTION – Abschlussrelease 11.08.2026

WICHTIGSTE ÄNDERUNG
Die Ursache der verlorenen Kurs-/Historiedaten war der Wechsel zwischen immer neuen
Vercel-Deployment-URLs. Jede URL besitzt auf dem iPhone einen eigenen Browser-Speicher.

5.7.0 erzwingt deshalb bei jeder *.vercel.app-Preview automatisch die feste Adresse:
https://depot-cockpit-th66-vercel-v20.vercel.app

Dadurch werden localStorage und IndexedDB künftig immer auf derselben Origin benutzt
und bleiben bei neuen Deployments erhalten.

WAS 5.7.0 NICHT BEHAUPTET
Es wurde heute kein externer Server-Datenspeicher (z.B. Vercel KV/Postgres) eingerichtet.
Die Persistenz basiert bewusst auf der festen Production-Origin und dem bereits vorhandenen
IndexedDB/localStorage-Snapshot. Das beseitigt das konkrete Preview-URL-Problem ohne
neue externe Infrastruktur.

ZUSÄTZLICH
- Basis ist die stabile 5.6.4-Oberfläche; der problematische 5.6.5-Layer wird nicht geladen.
- Teilweise fehlende Kurse löschen vorhandene gültige Kurse weiterhin nicht.
- Depotwert bleibt als EUR-Summe der verfügbaren Positionen sichtbar.
- Datenqualität: aktuell / letzter gültiger Kurs / fehlt.
- Allokation und Risiko werden bei <80% bewertbaren Positionen als "nicht belastbar"
  markiert und optisch zurückgenommen, statt falsche Prozentwerte als normal darzustellen.
- Bei ausreichender Bewertung, aber vielen gespeicherten Kursen, erscheint ein
  Aktualitätshinweis.
- Version 5.7.0 und eindeutiger Build-Stempel.

UPLOAD AUF DEM IPHONE
Nur drei Dateien ins HAUPTVERZEICHNIS von GitHub:
1. index.html      -> ersetzen
2. app-570.js      -> neu
3. styles-570.css  -> neu

NICHT ANFASSEN:
app.js
app-563.js
app-564.js
styles.css
styles-563.css
styles-564.css
vercel.json
/api
/public

Nach dem Deployment kannst du auch eine neue Vercel-Preview öffnen:
Sie muss automatisch auf die feste Produktionsadresse wechseln.

Oben muss stehen:
DEPOT-COCKPIT · VERSION 5.7.0
BUILD STABLE-PRODUCTION · 2026-08-11 · 23:46

Danach für heute nichts mehr ändern.
