/* 5.9.6 SpaceX diagnostic safe-step: additive only */
(()=>{'use strict';
const ISIN='US84615Q1031';
async function run(){
 try{
  const r=await fetch('/api/spacex-quote-v1?isin='+ISIN,{cache:'no-store'});
  const j=await r.json();
  window.__DC_SPACEX_DIAGNOSTIC_596__=j;
  window.dispatchEvent(new CustomEvent('dc:spacex-diagnostic',{detail:j}));
  console.info('SpaceX diagnostic 5.9.6',j);
 }catch(e){console.warn('SpaceX diagnostic 5.9.6 failed',e);}
}
addEventListener('DOMContentLoaded',()=>setTimeout(run,1200));
})();