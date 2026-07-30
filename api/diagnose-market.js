export default function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  return res.status(200).json({
    ok:true,
    disabled:true,
    upstreamStatus:null,
    durationMs:0,
    rowCount:0,
    message:'Die EODHD-Testabfrage ist ab Version 5.2.1 deaktiviert, damit die Diagnose kein Tageskontingent verbraucht.',
    checkedAt:new Date().toISOString()
  })
}
