function json(res,status,body){
  res.setHeader('Content-Type','application/json; charset=utf-8');
  res.setHeader('Cache-Control','public, max-age=300');
  return res.status(status).json(body)
}
const SEEDED=[
  {name:'Vanguard FTSE All-World UCITS ETF',isin:'IE00BK5BQT80',wkn:'A2PKXG',mnemonic:'VWCE',type:'ETF',currency:'EUR',venue:'Xetra'},
  {name:'Future of Defence UCITS ETF',isin:'IE000OJ5TQP4',wkn:'',mnemonic:'ASWC',type:'ETF',currency:'EUR',venue:'Xetra'},
  {name:'Amundi STOXX Europe 600 Banks UCITS ETF',isin:'LU1834983477',wkn:'',mnemonic:'LBNK',type:'ETF',currency:'EUR',venue:'Xetra'},
  {name:'iShares Essential Metals Producers UCITS ETF',isin:'IE000ROSD5J6',wkn:'',mnemonic:'CEBT',type:'ETF',currency:'EUR',venue:'Xetra'},
  {name:'iShares MSCI World Information Technology UCITS ETF',isin:'IE00BJ5JNY98',wkn:'',mnemonic:'AYEW',type:'ETF',currency:'EUR',venue:'Xetra'},
  {name:'VanEck Semiconductor UCITS ETF',isin:'IE00BMC38736',wkn:'',mnemonic:'VVSM',type:'ETF',currency:'EUR',venue:'Xetra'},
  {name:'L&G Cyber Security UCITS ETF',isin:'IE00BYPLS672',wkn:'',mnemonic:'USPY',type:'ETF',currency:'EUR',venue:'Xetra'},
  {name:'Fidelity Global Quality Income UCITS ETF',isin:'IE00BYXVGZ48',wkn:'',mnemonic:'FGEQ',type:'ETF',currency:'EUR',venue:'Xetra'},
  {name:'SAP SE',isin:'DE0007164600',wkn:'716460',mnemonic:'SAP',type:'Aktie',currency:'EUR',venue:'Xetra'},
  {name:'Xetra-Gold',isin:'DE000A0S9GB0',wkn:'A0S9GB',mnemonic:'4GLD',type:'ETC',currency:'EUR',venue:'Xetra'},
  {name:'iShares Ageing Population UCITS ETF',isin:'IE00BYZK4669',wkn:'',mnemonic:'2B77',type:'ETF',currency:'EUR',venue:'Xetra'}
];
export default async function handler(req,res){
  const q=String(req.query?.q||'').toLowerCase().trim();
  if(!q)return json(res,200,{ok:true,results:[]});
  const results=SEEDED.filter(x=>
    [x.name,x.isin,x.wkn,x.mnemonic,x.type].some(v=>String(v||'').toLowerCase().includes(q))
  ).slice(0,20);
  return json(res,200,{ok:true,source:'Xetra Instrument Master – seeded + free-entry fallback',results})
}
