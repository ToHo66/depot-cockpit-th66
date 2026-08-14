const TIMEOUT_MS = 8000;

function send(res, status, body) {
  res.status(status).setHeader('Cache-Control','no-store, max-age=0');
  res.setHeader('Content-Type','application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

async function getJson(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const r = await fetch(url, {
      signal: controller.signal,
      headers: {'Accept':'application/json','User-Agent':'DepotCockpit/5.10.5'},
      cache:'no-store'
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return await r.json();
  } finally {
    clearTimeout(timer);
  }
}

async function fromKraken() {
  const j = await getJson('https://api.kraken.com/0/public/Ticker?pair=ETHEUR');
  if (Array.isArray(j?.error) && j.error.length) throw new Error(j.error.join(', '));
  const row = j?.result && Object.values(j.result)[0];
  const price = Number(row?.c?.[0]);
  if (!(price > 0)) throw new Error('Kraken ohne Preis');
  return {price, provider:'KRAKEN', source:'Kraken ETH/EUR · letzter Trade'};
}

async function fromCoinbase() {
  const j = await getJson('https://api.coinbase.com/v2/prices/ETH-EUR/spot');
  const price = Number(j?.data?.amount);
  if (!(price > 0)) throw new Error('Coinbase ohne Preis');
  return {price, provider:'COINBASE', source:'Coinbase ETH/EUR · Spot'};
}

export default async function handler(req, res) {
  if (!['GET','POST'].includes(req.method)) return send(res,405,{ok:false,error:'Nur GET/POST erlaubt'});
  const errors=[];
  for (const fn of [fromKraken, fromCoinbase]) {
    try {
      const q=await fn();
      return send(res,200,{ok:true,symbol:'ETH-EUR',currency:'EUR',price:q.price,provider:q.provider,source:q.source,asOf:new Date().toISOString()});
    } catch (e) { errors.push(e?.message || String(e)); }
  }
  return send(res,502,{ok:false,error:'ETH/EUR konnte nicht geladen werden',details:errors});
}
