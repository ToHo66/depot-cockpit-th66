const MASTER_URL='https://www.cashmarket.deutsche-boerse.com/resource/blob/1528/a31c10e3183f4c5dd721f9c7f9eaaaea/data/t7-xetr-allTradableInstruments.csv';
const KEY='__TH66_XETRA_MASTER_531__';
const cache=globalThis[KEY]||(globalThis[KEY]={savedAt:0,items:[]});
const TTL=12*60*60*1000;
function send(res,status,body){res.setHeader('Cache-Control','public, max-age=300');return res.status(status).json(body)}
function csv(line,d=';'){const o=[];let c='',q=false;for(let i=0;i<line.length;i++){const x=line[i];if(x==='"'){if(q&&line[i+1]==='"'){c+='"';i++}else q=!q}else if(x===d&&!q){o.push(c);c=''}else c+=x}o.push(c);return o}
function key(s){return String(s||'').toLowerCase().replace(/[^a-z0-9]/g,'')}
function col(h,names){const a=h.map(key);for(const n of names){const k=key(n),i=a.findIndex(x=>x===k||x.includes(k));if(i>=0)return i}return -1}
async function master(){
  if(cache.items.length&&Date.now()-cache.savedAt<TTL)return cache.items;
  const r=await fetch(MASTER_URL,{cache:'no-store',headers:{'User-Agent':'Depot-Cockpit-TH66/5.3.1'}});if(!r.ok)throw new Error('Instrument-Master HTTP '+r.status);
  const t=await r.text(), lines=t.split(/\r?\n/).filter(Boolean);if(lines.length<2)throw new Error('Instrument-Master leer');const d=lines[0].includes(';')?';':',';const h=csv(lines[0],d);
  const ni=col(h,['instrumentname','name','shortname','title']), ii=col(h,['isin']), wi=col(h,['wkn']), mi=col(h,['mnemonic','ticker','symbol']), ti=col(h,['instrumenttype','type']), ci=col(h,['currency','tradingcurrency']), idi=col(h,['instrumentid','securityid']);
  const items=[];for(const l of lines.slice(1)){const c=csv(l,d),isin=String(c[ii]||'').trim().toUpperCase();if(!/^[A-Z]{2}[A-Z0-9]{9}[0-9]$/.test(isin))continue;items.push({name:String(c[ni]||isin).trim(),isin,wkn:wi>=0?String(c[wi]||'').trim():'',mnemonic:mi>=0?String(c[mi]||'').trim():'',type:ti>=0?String(c[ti]||'Wertpapier').trim():'Wertpapier',currency:ci>=0?String(c[ci]||'EUR').trim():'EUR',venue:'Xetra',instrumentId:idi>=0?String(c[idi]||'').trim():'',source:'XETRA_MASTER'})}
  cache.items=items;cache.savedAt=Date.now();return items
}
export default async function handler(req,res){const q=String(req.query?.q||'').trim().toLowerCase();if(!q)return send(res,200,{ok:true,results:[]});try{const items=await master(),terms=q.split(/\s+/).filter(Boolean),hits=[];for(const x of items){const f=[x.name,x.isin,x.wkn,x.mnemonic,x.type].map(v=>String(v||'').toLowerCase()),hay=f.join(' ');if(!terms.every(t=>hay.includes(t)))continue;let s=0;if(f[1]===q)s+=100;if(f[2]===q)s+=90;if(f[3]===q)s+=80;if(f[0].startsWith(q))s+=50;if(f[0].includes(q))s+=20;hits.push({s,x})}hits.sort((a,b)=>b.s-a.s);return send(res,200,{ok:true,source:'Deutsche Börse T7 XETR All Tradable Instruments',count:items.length,results:hits.slice(0,25).map(v=>v.x)})}catch(e){return send(res,200,{ok:true,source:'free-entry-fallback',results:[],warning:e.message||String(e)})}}
