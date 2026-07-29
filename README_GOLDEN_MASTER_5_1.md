# Depot-Cockpit Golden Master 5.1 – API-Diagnose

Basis ist unverändert Golden Master 5.0. Dieses Release verändert ausschließlich die Diagnose des Kursabrufs.

Neu:
- korrekte Versionsanzeige Golden Master 5.1
- API-Key vorhanden: Ja/Nein, ohne Schlüsselanzeige
- Request-Zähler je Aktualisierung
- EODHD-Symbol, Börsenplatz und bereinigter Endpunkt je Versuch
- HTTP-Status, Antwortzeit und gekürzte Provider-Antwort
- letzte erfolgreiche Antwort
- Vercel Deployment-ID, URL, Umgebung und Region soweit verfügbar
- eindeutige Trennung zwischen Vercel-Funktion und EODHD-Antwort

Unverändert:
- Cache-Logik
- Design und Navigation
- Depotberechnung
- Bewertungslogik
- Symbol- und Handelsplatzpriorität
