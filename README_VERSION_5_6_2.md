# Depot-Cockpit 5.6.2 — Single-Source Deployment Fix

Root cause fixed: previous releases contained two complete frontends (repository root and /public) while vercel.json forced outputDirectory=public. Updating only the root files therefore could deploy an older /public copy. 5.6.2 has exactly one frontend source: the repository root.

Visible release markers:
- DEPOT-COCKPIT · VERSION 5.6.2
- BUILD SINGLE-SOURCE · 2026-08-11 · 14:36

System diagnosis exists only under Einstellungen → Hilfe & Diagnose.
No market-data calculation logic was changed.
