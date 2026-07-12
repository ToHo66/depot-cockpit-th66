# Depot-Cockpit TH66 Professional 2.0.0

Neustart mit einer klaren, prüfbaren Datenarchitektur.

## Grundprinzip

- Marktrenditen (Tag/Woche/Monat/Chart) werden ausschließlich aus derselben EODHD-EOD-Kursreihe berechnet.
- Manuelle sBroker-Kurse dienen ausschließlich der aktuellen Depotbewertung.
- Brokerkurs und historische Marktrendite werden niemals rechnerisch vermischt.
- Bei fehlenden Daten wird eine verständliche Fehlermeldung angezeigt; es werden keine Fantasiewerte erzeugt.

## Einmalige Einrichtung in Vercel

1. Projekt mit GitHub verbinden oder den entpackten Projektordner deployen.
2. Project Settings → Environment Variables öffnen.
3. Variable `EODHD_API_KEY` mit dem EODHD-Schlüssel anlegen.
4. Danach ein neues Deployment starten.
5. In der App auf **Aktualisieren** tippen.

## Enthaltene Positionen

11 sBroker-Positionen mit den zuletzt bestätigten Stückzahlen:
Vanguard 327, Defence 1518, Banks 310, Essential Metals 1850, World IT 780, Semiconductor 98, Cyber 141, Fidelity 580, Data Center 65, SAP 60, Xetra-Gold 35.

## API-Aufwand

Eine vollständige Aktualisierung nutzt grundsätzlich einen historischen EOD-Aufruf pro Position. Bei einem kostenlosen EODHD-Konto ist deshalb nur eine begrenzte Zahl täglicher Aktualisierungen sinnvoll.
