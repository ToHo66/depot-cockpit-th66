Depot-Cockpit Repository Cleanup

Dieses Paket enthält einen GitHub-Workflow.
Nach dem Hochladen nach main startet der Cleanup automatisch.

Er löscht ausschließlich explizit aufgeführte Altdateien und prüft vor dem Commit,
dass der aktive Kern weiterhin vollständig vorhanden ist.

Aktiver Kern, der NICHT gelöscht wird:
- index.html
- app.js
- app-preload.js
- app-release.js
- styles.css
- styles-580.css
- manifest.webmanifest
- vercel.json
- api/market-data-v3.js
- api/instrument-search.js
- api/health.js

Der Workflow löscht sich nach erfolgreicher Ausführung selbst.
