// Depot-Cockpit 5.10.0 isolated SpaceX diagnostic endpoint.
// This endpoint never modifies portfolio state and is not the primary market-data path.
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 if(String(req.query?.isin||'').toUpperCase()!=='US84615Q1031')
  return res.status(400).json({ok:false,error:'unsupported'});
 const symbols=['SPX.DE','SPX.F','SPCX'];
 const attempts=[];
 for(const symbol of symbols){
  try{
   const u=`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=15m&range=1d&includePrePost=false`;
   const r=await fetch(u,{headers:{'User-Agent':'Mozilla/5.0','Accept':'application/json'}});
   const j=r.ok?await r.json():null;
   const rr=j?.chart?.result?.[0];
   const meta=rr?.meta;
   let price=Number(meta?.regularMarketPrice);
   if(!(price>0)){
    const closes=rr?.indicators?.quote?.[0]?.close||[];
    for(let i=closes.length-1;i>=0;i--){const n=Number(closes[i]);if(n>0){price=n;break;}}
   }
   const currency=String(meta?.currency||'').toUpperCase()||null;
   attempts.push({symbol,http:r.status,price:Number.isFinite(price)?price:null,currency});
   if(Number.isFinite(price)&&price>0 && currency==='EUR')
    return res.status(200).json({ok:true,isin:'US84615Q1031',symbol,price,currency:'EUR',source:'diagnostic-yahoo-germany',attempts});
  }catch(e){attempts.push({symbol,error:String(e?.message||e)})}
 }
 return res.status(404).json({ok:false,isin:'US84615Q1031',error:'no German EUR quote resolved',attempts});
}
