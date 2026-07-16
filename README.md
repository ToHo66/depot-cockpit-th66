# Depot-Cockpit Professional 3.1 – Kursmanager

## Kernänderung

Version 3.1 behebt den konkreten Übertragungsfehler aus 3.0.3: Die API erwartet eine Handelsplatz-Kandidatenliste; diese wird jetzt bei jeder Kursabfrage aus den gespeicherten Zuordnungen erzeugt und mitgesendet.

## Kursmanager

Unter **Einstellungen → Kursmanager 3.1** werden alle Positionen zentral geprüft und konfiguriert:

- Broker-Referenzplatz
- EODHD-Hauptsymbol
- getrennte Symbole für Xetra, Frankfurt und Stuttgart
- optionaler manueller Brokerkurs
- Status aktiv / offen / fehlerhaft
- sichtbare Abrufreihenfolge
- Schaltfläche „Speichern & Kurse prüfen“

Tradegate, gettex und Lang & Schwarz besitzen in EODHD nicht zwingend eigene Kursreihen. In diesen Fällen bleibt der Broker-Referenzplatz sichtbar, während eine unterstützte EODHD-Reihe für die Historie verwendet oder ein manueller Brokerkurs für die aktuelle Bewertung eingetragen wird.
