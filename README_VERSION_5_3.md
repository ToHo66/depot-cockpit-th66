# Depot-Cockpit Version 5.3

Neu:
- Architektur für Deutsche Börse/Xetra Delayed als Primärquelle.
- Zentraler 15-Minuten-Kurscache.
- Alte gerätebezogene Tages-Sperrlogik wird für die neue Engine nicht verwendet.
- Offene Kaufsuche nach Name, ISIN, WKN oder Kürzel.
- Vollständig freie Eingabe bleibt immer möglich.
- Neue Käufe können automatisch neue Depotpositionen anlegen.
- Instrument-Suchendpunkt vorbereitet.
- EODHD bleibt für Historie/Sonderfälle verfügbar.

Wichtig:
Der Xetra-Delayed-Parser ist bewusst in einer eigenen Serverdatei isoliert. So kann die konkrete Deutsche-Börse-Downloadquelle/Dateistruktur nach dem finalen Feed-Mapping geändert werden, ohne die App erneut umzubauen.
