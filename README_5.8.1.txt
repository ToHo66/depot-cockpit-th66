DEPOT-COCKPIT PROFESSIONAL 5.8.1 – DATA SUPPLY

WICHTIGE KLARSTELLUNG
Vanguard FTSE All-World (IE00BK5BQT80) war in 5.8.0 vorhanden und ist dein größter
Depotposten. Der vollständig fehlende ETF war iShares MSCI World Information Technology
(IE00BJ5JNY98 / AYEW). Die neue Version behandelt deshalb gezielt WORLD IT und Trilogy,
ohne den All-World fälschlich als Ursache der Kursabweichung zu behandeln.

NEUE DATENPIPELINE
1. Deutsche Börse / Xetra Delayed Post-Trade bleibt Primärquelle.
2. Nur Titel, die dort im aktuellen Lauf fehlen, gehen an /api/market-fallback.
3. Der Fallback probiert deterministisch maximal vier EODHD-Symbole und stoppt nach
   der ersten gültigen Reihe. Dadurch wird das EODHD-Tageskontingent geschont.
4. World IT erhält vorrangig:
   AYEW.XETRA -> AYEW.F -> AYEW.STU
5. Trilogy Metals wird separat über TMQ geladen. Trilogy Metals selbst bestätigt
   TMQ als Börsenkürzel an NYSE American und TSX. Der Kurs wird über EUR/USD in EUR
   umgerechnet.
6. Bereits gespeicherte gültige Kurse bleiben erhalten, wenn auch die Fallbackquelle
   nichts Neues liefert.

TECHNISCHE ARCHITEKTUR
Aktiv geladen:
- app.js
- app-581.js
- styles.css
- styles-580.css

app-581 ist die vollständige konsolidierte 5.8-Schicht plus Datenversorgungslogik.
app-580 wird nicht mehr geladen.

UPLOAD AUF DEM IPHONE
Vier Dateien/Positionen:
HAUPTVERZEICHNIS:
1. index.html -> ersetzen
2. app-581.js -> neu

ORDNER api:
3. api/market-fallback.js -> neu
4. api/trilogy-quote.js -> neu

styles-580.css aus 5.8.0 bleibt bestehen und wird weiter verwendet.
app-580.js darf im Repository bleiben; index.html lädt es nicht mehr.

NICHT ANFASSEN:
app.js
styles.css
styles-580.css
api/market-data-v2.js
api/market-data.js
vercel.json
/public

Nach Deployment:
- feste Produktionsadresse öffnen
- einmal Aktualisieren drücken
- Diagnose muss World IT und Trilogy separat ausweisen
- Version oben: 5.8.1
