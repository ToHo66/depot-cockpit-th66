# Depot-Cockpit Professional 3.2.1 – Render-Korrektur

Diese Korrektur behebt den Laufzeitfehler:

`Can't find variable: render`

Ursache:
Beim Erstellen von Version 3.2 wurde die zentrale `render()`-Funktion versehentlich aus `public/app.js` entfernt. Dadurch konnte die App nach dem Laden keine Oberfläche und keine Kursdaten mehr aktualisieren.

Geprüfter sichtbarer Test:
- Versionskennung 3.2.1
- kein Hinweis `Can't find variable: render`
- Dashboard wird aufgebaut
- Kursabruf startet wieder
- Kursmanager wird ebenfalls gerendert
