# Depot-Cockpit Professional 3.0.3 – Berechnungsstabilität

Diese Unterversion verhindert unrealistische Gewinn-/Verlustanzeigen, solange Kursdaten fehlen oder nur teilweise geladen sind.

## Änderungen

- Gesamtgewinn wird erst berechnet, wenn alle Positionen mit Einstandskurs auch einen Bewertungskurs besitzen.
- Vor der ersten Kursabfrage erscheinen Striche statt eines künstlichen Verlusts von −153.273,67 €.
- Marktdaten werden automatisch nach dem Start geladen, sofern EODHD in Vercel konfiguriert ist.
- Die letzte erfolgreiche Kursabfrage wird für bis zu 24 Stunden lokal zwischengespeichert.
- Teilweise verfügbare Brokerwerte und Gesamtwerte werden klar als unvollständig behandelt.
- Version auf 3.0.3 vereinheitlicht.
