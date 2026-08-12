DEPOT-COCKPIT PROFESSIONAL 5.9.1
BUILD TRANSACTION-CORRECTION · 12.08.2026

BASIS
Unveränderte Kursarchitektur aus 5.9.0. Die funktionierende Deutsche-Börse-
Versorgung wird nicht grundsätzlich umgebaut.

KORREKTUREN
1. EXTERNE INSTRUMENTSUCHE
   - Zuerst bestehender Instrument-Master.
   - Bei Nichttreffer automatische EODHD-Suche nach Name, Ticker oder ISIN.
   - Treffer können direkt übernommen werden.
   - Freie Eingabe erscheint nur als letzter Fallback.

2. NEUE WERTPAPIERE / KURSVERSORGUNG
   - Ein extern gefundener Titel wird nicht mehr automatisch als MANUAL angelegt.
   - Ticker + Exchange-Code werden gespeichert.
   - US-Titel werden direkt über EODHD Live (verzögert) versucht.
   - Laut EODHD ist der REST-Livekurs für Aktien typischerweise ca. 15–20 Minuten verzögert.
   - Falls Live nicht verfügbar ist, bleibt der EOD-Schlusskurs-Fallback.

3. BROKER / HANDELSPLATZ
   - Broker bleibt Eigenschaft der Position.
   - Handelsplatz wird je Transaktion separat gespeichert.
   - Ein Handelsplatz darf den Broker nicht verändern.

4. TRANSAKTIONSHISTORIE
   - "undefined" wird nicht mehr angezeigt.
   - Kauf: Volumen wird ausgewiesen.
   - Verkauf: Verkaufserlös UND realisierter Gewinn/Verlust werden getrennt dargestellt.
   - Bestehende alte Transaktionen werden soweit möglich repariert.

5. NACHKAUF
   - Gewichteter Einstand wird auch bei Käufen über "Neues Wertpapier kaufen"
     korrekt fortgeschrieben, wenn dieselbe ISIN bereits existiert.

6. UNVOLLSTÄNDIGE BEWERTUNG
   - Fehlt für eine Position ein Kurs, wird der Hauptwert als "Bewerteter Depotwert"
     bezeichnet und nicht als scheinbar vollständiger Gesamtdepotwert.

UPLOAD – 4 DATEIEN
HAUPTVERZEICHNIS:
1. index.html       ersetzen
2. app-590.js       ersetzen
3. app-591.js       neu hinzufügen

ORDNER api:
4. market-data-v3.js         ersetzen
5. instrument-search-v2.js   neu hinzufügen

HINWEIS
Das sind tatsächlich 5 Dateien. app.js, styles.css, styles-580.css und vercel.json
bleiben unverändert.

TESTABLAUF
A) Seite öffnen: VERSION 5.9.1 muss sichtbar sein.
B) Neue ISIN suchen, die lokal nicht vorhanden ist.
C) Erwartung: "Börsen-/Marktdaten werden durchsucht" und danach Trefferliste.
D) Kauf speichern.
E) Aktualisieren.
F) Prüfen: Kursquelle, Broker, Handelsplatz, Bestand.
G) Nachkauf derselben ISIN.
H) Teilverkauf.
I) Historie muss Volumen/Erlös und realisierten G/V getrennt zeigen.
