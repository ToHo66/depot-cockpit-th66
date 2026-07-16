# Depot-Cockpit Professional 2.2 Master

Diese Version basiert auf der zuletzt aus GitHub geladenen Vercel-Struktur und den sBroker-Screenshots vom 14.07.2026.

## Enthalten
- sBroker und Trade Republic getrennt
- verbindliche Stückzahlen und Einstandskurse aus der Masterdatei
- manuell wählbarer bevorzugter Handelsplatz und alternative Handelsplätze je Position
- manueller Brokerkurs für die aktuelle Bewertung
- Käufe, Teilkäufe, Verkäufe und Teilverkäufe erfassen
- vollständige Verkäufe automatisch archivieren
- Transaktionshistorie mit Gebühren und realisiertem Ergebnis
- Export und Import der lokalen Depotdaten
- EODHD-Marktdaten über die bestehende Vercel-Variable `EODHD_API_KEY`

## Installation
Der Inhalt dieses Ordners gehört direkt in die oberste Ebene des GitHub-Repositories. Vercel übernimmt danach automatisch die Veröffentlichung.

## Datenhinweis
Die Datei `MASTERDATEI.json` ist die verbindliche Referenz. Xtrackers MSCI World Value ist dort vorläufig nicht als aktiv geführt, weil die aktuelle sBroker-Gesamtsumme exakt aus den elf sichtbaren Positionen besteht.


## Version 3.0.1 – Kursarchitektur
- Einheitliche Versionskennung 3.0.1.
- Korrekte Tagesbeiträge aus `(EOD-Schlusskurs - Vortagesschluss) × Stückzahl`.
- Transparente Kursdiagnose je Position.
- Klare Trennung zwischen manuellem Brokerkurs, Referenz-Handelsplatz und tatsächlichem EODHD-Symbol.
- Manuelle Depot-Referenzwerte werden als solche und mit Zeitstempel gekennzeichnet.
- Tageswerte sind ausdrücklich EOD-Werte und keine Intraday-Livekurse.
