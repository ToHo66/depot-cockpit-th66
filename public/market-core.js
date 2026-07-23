(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.MarketCore=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  function isValidItem(item){
    return Boolean(item&&item.ok&&item.latest&&Number.isFinite(Number(item.latest.price))&&Number(item.latest.price)>0)
  }
  function sanitize(data){
    const out={};
    if(!data||typeof data!=='object')return out;
    for(const [id,item] of Object.entries(data)){
      if(isValidItem(item))out[id]={...item,cached:true}
    }
    return out
  }
  function mergeLastGood(previous,results){
    const merged={...sanitize(previous)};
    let successes=0;
    for(const item of Array.isArray(results)?results:[]){
      if(item&&item.id&&isValidItem(item)){
        merged[item.id]={...item,cached:Boolean(item.cached)};
        successes++
      }
    }
    return {data:merged,successes}
  }
  function chooseSnapshot(snapshots,maxAgeMs,now=Date.now()){
    const valid=(Array.isArray(snapshots)?snapshots:[])
      .filter(Boolean)
      .map(s=>({...s,data:sanitize(s.data)}))
      .filter(s=>Object.keys(s.data).length>0)
      .filter(s=>{
        const t=new Date(s.savedAt||s.updatedAt||0).getTime();
        return Number.isFinite(t)&&t>0&&now-t<=maxAgeMs
      })
      .sort((a,b)=>new Date(b.savedAt||b.updatedAt)-new Date(a.savedAt||a.updatedAt));
    return valid[0]||null
  }
  function shouldRequest({manual=false}={}){
    return manual===true
  }
  function friendlyError(message){
    const text=String(message||'');
    if(/402|daily API requests limit|rate.?limit/i.test(text))return 'Tägliches Kursdaten-Limit erreicht.';
    if(/API_KEY_MISSING|Schlüssel fehlt/i.test(text))return 'EODHD-Schlüssel fehlt.';
    return text||'Kursdaten konnten nicht aktualisiert werden.'
  }
  return {isValidItem,sanitize,mergeLastGood,chooseSnapshot,shouldRequest,friendlyError}
});
