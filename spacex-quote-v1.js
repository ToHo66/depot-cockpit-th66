// 5.9.6 isolated diagnostic endpoint; does not modify normal market data.
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 if(String(req.query?.isin||'').toUpperCase()!=='US84615Q1031')
  return res.status(400).json({ok:false,error:'unsupported'});
 const symbols=['SPAX','SPACE','US84615Q1031'];
 const attempts=[];
 for(const symbol of symbols){
  try{
   const u=`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=15m&range=1d`;
   const r=await fetch(u,{headers:{'User-Agent':'Mozilla/5.0','Accept':'application/json'}});
   const j=r.ok?await r.json():null;
   const meta=j?.chart?.result?.[0]?.meta;
   const price=Number(meta?.regularMarketPrice);
   attempts.push({symbol,http:r.status,price:Number.isFinite(price)?price:null,currency:meta?.currency||null});
   if(Number.isFinite(price)&&price>0)
    return res.status(200).json({ok:true,isin:'US84615Q1031',symbol,price,currency:meta?.currency||null,source:'diagnostic-yahoo',attempts});
  }catch(e){attempts.push({symbol,error:String(e?.message||e)})}
 }
 return res.status(404).json({ok:false,isin:'US84615Q1031',error:'no unique quote resolved',attempts});
}