const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const source=fs.readFileSync(require('node:path').join(__dirname,'../public/market-core.js'),'utf8');
const sandbox={globalThis:{}};
vm.runInNewContext(source,sandbox,{filename:'market-core.js'});
const Core=sandbox.globalThis.MarketCore;

function good(id,price,date='2026-07-20'){
  return {id,ok:true,latest:{price,date},performance:{day:{pct:1,basePrice:price-1,baseDate:'2026-07-19'}}}
}
function bad(id,msg='EODHD 402: You exceeded your daily API requests limit.'){
  return {id,ok:false,error:msg,code:'RATE_LIMIT'}
}

assert.equal(typeof Core.shouldRequest,'function','MarketCore muss geladen sein');
assert.equal(Core.shouldRequest({manual:false}),false,'Start darf keine Anfrage auslösen');
assert.equal(Core.shouldRequest({manual:true}),true,'Manueller Refresh muss erlaubt sein');

const previous={a:good('a',100),b:good('b',200)};
const merged402=Core.mergeLastGood(previous,[bad('a'),bad('b')]);
assert.equal(merged402.successes,0);
assert.equal(merged402.data.a.latest.price,100,'402 darf Altwert nicht löschen');
assert.equal(merged402.data.b.latest.price,200,'402 darf zweiten Altwert nicht löschen');

const partial=Core.mergeLastGood(previous,[good('a',110),bad('b')]);
assert.equal(partial.successes,1);
assert.equal(partial.data.a.latest.price,110,'Erfolg muss aktualisieren');
assert.equal(partial.data.b.latest.price,200,'Fehler muss Altwert behalten');

const empty=Core.mergeLastGood({},[bad('a')]);
assert.equal(Object.keys(empty.data).length,0,'Ohne Altstand und ohne Erfolg bleibt Zustand leer');

const now=Date.now();
const chosen=Core.chooseSnapshot([
  {savedAt:new Date(now-1000).toISOString(),data:{a:good('a',101)}},
  {savedAt:new Date(now-2000).toISOString(),data:{a:good('a',99)}}
],90*86400000,now);
assert.equal(chosen.data.a.latest.price,101,'Neuester gültiger Snapshot muss gewählt werden');

const damaged=Core.chooseSnapshot([
  {savedAt:new Date(now-1000).toISOString(),data:{a:bad('a')}}
],90*86400000,now);
assert.equal(damaged,null,'Snapshot ohne gültige Kurse muss verworfen werden');

assert.equal(Core.friendlyError('EODHD 402: You exceeded your daily API requests limit.'),'Tägliches Kursdaten-Limit erreicht.');

console.log('Alle Stabilitätstests bestanden: 10/10');
