DEPOT-COCKPIT PROFESSIONAL 5.6.3
Konsolidierungsrelease – iPhone

Dieses Paket basiert auf der funktionierenden Root-Auslieferung 5.6.2 und ergänzt
die heute gemeinsam festgelegte Bedienlogik, ohne die bestehende Marktdaten-Engine
grundlegend umzubauen.

ENTHALTEN
- index.html       -> neue 5.6.3 Oberfläche
- app-563.js       -> Funktions-/Datenqualitäts-Overlay
- styles-563.css   -> Kontrast- und UI-Korrekturen

WICHTIG: Die vorhandenen Dateien app.js, styles.css, api/* und vercel.json bleiben
bestehen. Dieses Paket ersetzt nur index.html und ergänzt zwei neue Dateien.

UMGESETZT
1. Gesamt / S Broker / Trade Republic funktionieren als echter Depotfilter.
2. Alle / Aktien / ETFs / Rohstoffe funktionieren als Positionsfilter.
3. 1T / 1W / 1M / 3M / 1J zeigen nur belegte Performance; fehlende Historie wird
   ausdrücklich als nicht verfügbar gekennzeichnet.
4. Performance / Allokation / Risiko sind echte unterschiedliche Ansichten.
5. Die wertlose statische Balkengrafik wird entfernt.
6. Depot-Differenzprüfung wandert in "Optionaler Depot-Abgleich".
7. Technische Kursdiagnose wandert in "Erweiterte Kursdiagnose".
8. Kontrast schwacher Texte wird deutlich erhöht.
9. Kursstatus je Position:
   🟢 aktuell
   🟡 manueller Brokerkurs
   🟠 letzter gültiger gespeicherter Kurs
   🔴 kein gültiger Kurs
10. Ein partiell fehlgeschlagener Refresh löscht einen zuvor gültigen Kurs nicht mehr.
    Der alte Wert bleibt sichtbar und wird ausdrücklich orange als "letzter gültiger Kurs"
    gekennzeichnet.
11. Versionsanzeige: 5.6.3.

UPLOAD AUF DEM IPHONE
1. ZIP entpacken.
2. Die drei Dateien index.html, app-563.js und styles-563.css im HAUPTVERZEICHNIS
   von depot-cockpit-th66 hochladen.
3. index.html ersetzen lassen; die beiden anderen Dateien sind neu.
4. Commit direkt auf main.
5. Vercel deployt automatisch.
6. Danach Produktionsseite öffnen. Oben muss stehen:
   DEPOT-COCKPIT · VERSION 5.6.3
   BUILD KONSOLIDIERUNG · 2026-08-11 · 22:30

NICHT ANFASSEN
- /public
- app.js
- styles.css
- /api
- vercel.json
