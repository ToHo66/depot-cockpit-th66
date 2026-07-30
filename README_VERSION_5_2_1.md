# Depot-Cockpit Version 5.2.1 – EODHD Requestschutz

- Keine automatische Hintergrundabfrage.
- Systemdiagnose verbraucht keinen EODHD-Aufruf mehr.
- Nur fehlende oder veraltete Positionen werden angefragt.
- Erfolgreich geladene Positionen werden am selben Tag nicht erneut angefragt.
- Pro Position wird genau ein festes Symbol verwendet.
- Bei HTTP 402 stoppt der Server sofort.
- Vorhandene erfolgreiche Kursdaten bleiben erhalten.
