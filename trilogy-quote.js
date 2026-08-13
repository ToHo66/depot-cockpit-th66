/* Depot-Cockpit 5.9.4 – isolated Trilogy Metals fallback.
   This endpoint is deliberately separate from market-data-v3.js.
   It can never change or suppress quotes for any other portfolio position.
*/
function send(res,status,body){
  res.status(status).setHeader('Cache-Control','no-store').json(body);
}
async function eodhdLatest(symbol,token){
  const url=`https://eodhd.com/api/eod/${encodeURIComponent(symbol)}?api_token=${encodeURIComponent(token)}&fmt=json&period=d&order=d&limit=5`;
  const r=await fetch(url,{headers:{Accept:'application/json'}});
  const text=await r.text();
  if(!r.ok) throw new Error(`EODHD ${r.status}`);
  const rows=JSON.parse(text);
  if(!Array.isArray(rows)) throw new Error('EODHD no rows');
  for(let i=rows.length-1;i>=0;i--){
    const price=Number(rows[i]?.adjusted_close ?? rows[i]?.close);
    if(Number.isFinite(price)&&price>0) return {price,date:String(rows[i]?.date||'')};
  }
  throw new Error('EODHD no price');
}
export default async function handler(req,res){
  if(req.method!=='GET') return send(res,405,{ok:false,error:'Nur GET erlaubt.'});
  const token=process.env.EODHD_API_KEY||'';
  if(!token) return send(res,503,{ok:false,error:'EODHD_API_KEY fehlt.'});
  try{
    const [tmq,fx]=await Promise.all([
      eodhdLatest('TMQ.US',token),
      eodhdLatest('EURUSD.FOREX',token)
    ]);
    const eur=tmq.price/fx.price;
    if(!(Number.isFinite(eur)&&eur>0)) throw new Error('Ungültige EUR-Umrechnung');
    return send(res,200,{
      ok:true,
      result:{
        id:'trilogy',ok:true,
        latest:{price:Number(eur.toFixed(6)),date:tmq.date},
        source:'Isolierter Trilogy-Fallback · TMQ.US · EUR/USD',
        usedVenue:'NYSE American',currency:'EUR',
        sourceMeta:{provider:'EODHD_TRILOGY_ISOLATED',sourceKind:'TMQ Schlusskurs in EUR',priceUsd:tmq.price,eurUsd:fx.price,asOf:tmq.date}
      }
    });
  }catch(e){
    return send(res,502,{ok:false,error:e?.message||String(e)});
  }
}
