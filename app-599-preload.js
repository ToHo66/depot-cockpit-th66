/* Depot-Cockpit Professional 5.9.9 — SpaceX quote routing safe-step */
(()=>{'use strict';
const ISIN='US84615Q1031',STORE='th66-professional-master-v5';
try{
 const raw=localStorage.getItem(STORE); if(!raw)return;
 const x=JSON.parse(raw); if(!Array.isArray(x.positions))return;
 const p=x.positions.find(v=>String(v?.isin||'').toUpperCase()===ISIN); if(!p)return;
 const wanted={wkn:'A42D4F',analysisSymbol:'SPX',marketSymbol:'SPX',analysisVenue:'Frankfurt',
 analysisExchangeCode:'DE',currency:'EUR',dataSource:'DB_DELAYED',assetType:'Aktie'};
 let changed=false;
 for(const [k,v] of Object.entries(wanted)){if(p[k]!==v){p[k]=v;changed=true;}}
 if(changed)localStorage.setItem(STORE,JSON.stringify(x));
 window.__DC_SPACEX_ROUTE_599__={ok:true,changed,isin:ISIN,symbol:'SPX',venue:'Frankfurt'};
}catch(e){console.warn('5.9.9 SpaceX routing patch failed',e);}
})();