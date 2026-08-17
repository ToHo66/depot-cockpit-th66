/* Depot-Cockpit 5.11.1 — dedicated crypto quote endpoint.
   Server-side only: avoids browser CORS and keeps crypto outside the equity/ETF routing core.
   Primary: Coinbase public ETH-EUR spot. Fallback: Kraken ETH/EUR public ticker.
*/

const SOURCES = [
  {
    provider: 'Coinbase',
    url: 'https://api.coinbase.com/v2/prices/ETH-EUR/spot',
    parse(json) {
      return Number(json?.data?.amount);
    }
  },
  {
    provider: 'Kraken',
    url: 'https://api.kraken.com/0/public/Ticker?pair=ETHEUR',
    parse(json) {
      if (Array.isArray(json?.error) && json.error.length) return NaN;
      const first = Object.values(json?.result || {})[0];
      return Number(first?.c?.[0] ?? first?.p?.[0]);
    }
  }
];

async function getJson(url, timeoutMs = 6500) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Depot-Cockpit/5.11.1'
      },
      signal: controller.signal
    });
    const text = await response.text();
    let json = null;
    try { json = text ? JSON.parse(text) : null; } catch {}
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return json;
  } finally {
    clearTimeout(timer);
  }
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (!['GET', 'POST'].includes(req.method || 'GET')) {
    res.status(405).json({ ok:false, error:'Method not allowed' });
    return;
  }

  const input = req.method === 'POST' ? (req.body || {}) : (req.query || {});
  const symbol = String(input.symbol || 'ETH').toUpperCase();
  const quote = String(input.quote || 'EUR').toUpperCase();
  const id = String(input.id || 'ethereum');
  const name = String(input.name || 'Ethereum');

  if (symbol !== 'ETH' || quote !== 'EUR') {
    res.status(400).json({ ok:false, id, error:'5.11.1 supports ETH/EUR only.' });
    return;
  }

  const attempts = [];
  for (const source of SOURCES) {
    try {
      const json = await getJson(source.url);
      const price = source.parse(json);
      if (!Number.isFinite(price) || price <= 0) throw new Error('invalid price');
      const now = new Date();
      res.status(200).json({
        ok:true,
        id,
        name,
        symbol:'ETH-EUR',
        latest:{
          price,
          date:now.toISOString().slice(0,10),
          timestamp:now.toISOString(),
          currency:'EUR'
        },
        performance:{},
        sourceMeta:{
          provider:source.provider,
          sourceKind:'CRYPTO_SPOT',
          delayedMinutes:0,
          pair:'ETH-EUR'
        },
        generatedAt:now.toISOString(),
        attempts:[...attempts, {provider:source.provider, ok:true}]
      });
      return;
    } catch (error) {
      attempts.push({provider:source.provider, ok:false, error:error?.message || String(error)});
    }
  }

  res.status(502).json({
    ok:false,
    id,
    name,
    symbol:'ETH-EUR',
    error:'Keine Krypto-Kursquelle erreichbar.',
    attempts,
    generatedAt:new Date().toISOString()
  });
}
