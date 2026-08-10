# Depot-Cockpit 5.3.4 — Xetra minute-scan correction

## Root cause found
5.3.3 searched the Xetra trading session but advanced through the candidate minute list in steps of 18 (`i += 18`). DETR post-trade is published once per minute. This skipped 17 of every 18 publication files and explains sparse/random hits such as 3/10.

## Fix
- Every publication minute is now scanned, newest first.
- Network work is bounded in batches of 24 files and stops once every requested instrument has a hit.
- Central cache key bumped to avoid contamination by older partial snapshots.
- UI source badge now distinguishes Xetra delayed from EODHD.
- Diagnostic source-file field now reads the actual `sourceFiles[]` response.

## Parser regression gate
14/14 instrument-identification and price extraction cases passed locally: all 11 master sBroker instruments plus 3 unrelated controls (DAX ETF, MSCI World ETF, S&P 500 ETF). This validates parser/matching across separate minute documents.

## Important
A true live 14/14 Deutsche-Börse network test still requires execution in the deployed Vercel runtime because the local sandbox has no outbound DNS/network access to mfs.deutsche-boerse.com. Do not describe the local regression test as a live-market 14/14 result.
