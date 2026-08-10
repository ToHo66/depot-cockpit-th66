# Depot-Cockpit Professional 5.3.3

## Root Cause
5.3.2 suchte DETR-Post-Trade-Dateien nur 15–90 Minuten relativ zur aktuellen Uhrzeit. Nach Xetra-Schluss lag dieses Fenster vollständig nach der liquiden Handelssitzung. Der einzelne VanEck-Treffer war daher kein Beweis vollständiger Abdeckung.

5.3.3 durchsucht stattdessen den tatsächlichen Xetra-Handelstag rückwärts (UTC) und stoppt je Instrument beim neuesten Treffer.

## iPhone Root Cause
Die CSS-Regel `[class*="priority"]` traf nicht nur Prioritäts-Badges, sondern auch `.priority-box` und `.priority-row` und zwang diese Container in `inline-flex` mit Mindestbreite. Das erzeugte die extrem schmalen Textspalten. 5.3.3 beschränkt die Regel auf `.course-status`, `.priority-pill` und `.score` und setzt die mobile Schnellprüfung explizit vertikal zurück.
