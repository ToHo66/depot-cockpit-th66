DEPOT-COCKPIT PROFESSIONAL 5.8.0
CONSOLIDATED-STABLE · 12.08.2026

ZIEL
Die Overlay-Kette vom Vorabend wird beendet. Aktiv sind nur noch:
- app.js        = bestehender, funktionierender Kern
- app-580.js    = eine einzige konsolidierte UI-/Stabilitätsschicht
- styles.css    = bestehende Basis
- styles-580.css= eine einzige konsolidierte UI-Stildatei

NICHT MEHR AKTIV GELADEN
app-563.js
app-564.js
app-565.js
app-570.js
styles-563.css
styles-564.css
styles-565.css
styles-570.css

WICHTIGE STABILITÄTSÄNDERUNGEN
1. Genau ein Render-Hook statt mehrerer sich gegenseitig überschreibender Hooks.
2. Übersicht, Positionen, Datenqualität, Allokation und Risiko lesen denselben State.
3. Partieller Kursabruf löscht ältere gültige Kurse nicht mehr:
   neue gültige Kurse ersetzen alte; nicht neu gelieferte bleiben als "letzter gültiger Kurs".
4. Depotwert bleibt als EUR-Summe der tatsächlich bewertbaren Positionen sichtbar.
5. Datenqualität trennt: aktuell / letzter gültiger Kurs / manuell / fehlt.
6. Allokation und Risiko werden bei unter 80 % bewertbaren Positionen nicht berechnet.
7. Brokerfilter, Assetfilter und Zeitraumfilter sind in derselben konsolidierten Schicht verdrahtet.
8. Diagnose zeigt ausdrücklich Version 5.8.0 und die neue Architektur.
9. Keine automatische Preview-Weiterleitung im Code. Für dauerhaften iPhone-Speicher
   nach dem Deployment immer die feste Produktionsadresse öffnen:
   https://depot-cockpit-th66-vercel-v20.vercel.app

UPLOAD AUF DEM IPHONE
Nur diese drei Dateien ins HAUPTVERZEICHNIS von GitHub:
1. index.html      -> ersetzen
2. app-580.js      -> neu
3. styles-580.css  -> neu

Die alten app-563/app-564/app-565/app-570 und styles-Dateien dürfen im Repository
liegen bleiben; index.html lädt sie nicht mehr.

NICHT ANFASSEN
app.js
styles.css
vercel.json
/api
/public

PRÜFUNG NACH DEPLOYMENT
Oben muss stehen:
DEPOT-COCKPIT · VERSION 5.8.0
BUILD CONSOLIDATED-STABLE · 2026-08-12 · 07:50

Danach die FESTE Produktionsadresse öffnen, nicht die zufällige Preview-Adresse.
