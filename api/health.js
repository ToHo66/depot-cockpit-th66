export default function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  res.status(200).json({
    ok:true,
    appVersion:'5.1',
    eodhdConfigured:Boolean(process.env.EODHD_API_KEY),
    deploymentId:process.env.VERCEL_DEPLOYMENT_ID||process.env.VERCEL_URL||null,
    region:process.env.VERCEL_REGION||null,
    checkedAt:new Date().toISOString()
  })
}
