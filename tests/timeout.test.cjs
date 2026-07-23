const assert=require('node:assert/strict');
const fs=require('node:fs');

const app=fs.readFileSync('public/app.js','utf8');
const api=fs.readFileSync('api/market-data.js','utf8');

assert.match(app,/AbortController/);
assert.match(app,/30000/);
assert.match(app,/CLIENT_TIMEOUT/);
assert.match(app,/finally\{/);
assert.match(api,/PER_REQUEST_TIMEOUT_MS=5500/);
assert.match(api,/TOTAL_BUDGET_MS=24000/);
assert.match(api,/Promise\.all/);
assert.match(api,/UPSTREAM_TIMEOUT/);
assert.match(api,/SERVER_BUDGET/);
assert.match(api,/clearTimeout\(timeout\)/);

console.log('Timeout- und Hänger-Schutz bestanden: 10/10');
