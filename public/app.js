const DEFAULT_POSITIONS = [
  {id:'allworld',name:'Vanguard FTSE All-World',isin:'IE00BK5BQT80',qty:327,broker:'sBroker',marketSymbol:'VGWL.XETRA',currency:'EUR'},
  {id:'defence',name:'Future of Defence',isin:'IE000OJ5TQP4',qty:1518,broker:'sBroker',marketSymbol:'ASWC.XETRA',currency:'EUR'},
  {id:'banks',name:'Amundi STOXX Europe 600 Banks',isin:'LU1834983477',qty:310,broker:'sBroker',marketSymbol:'LBNK.XETRA',currency:'EUR'},
  {id:'metals',name:'iShares Essential Metals Producers',isin:'IE000ROSD5J6',qty:1850,broker:'sBroker',marketSymbol:'CEBT.XETRA',currency:'EUR'},
  {id:'worldit',name:'iShares MSCI World Information Technology',isin:'IE00BJ5JNY98',qty:780,broker:'sBroker',marketSymbol:'AYEW.XETRA',currency:'EUR'},
  {id:'semiconductor',name:'VanEck Semiconductor',isin:'IE00BMC38736',qty:98,broker:'sBroker',marketSymbol:'VVSM.XETRA',currency:'EUR'},
  {id:'cyber',name:'L&G Cyber Security',isin:'IE00BYPLS672',qty:141,broker:'sBroker',marketSymbol:'USPY.XETRA',currency:'EUR'},
  {id:'fidelity',name:'Fidelity Global Quality Income',isin:'IE00BYXVGZ48',qty:580,broker:'sBroker',marketSymbol:'FGEQ.XETRA',currency:'EUR'},
  {id:'datacenter',name:'Global X Data Center REITs & Digital Infrastructure',isin:'IE00BMH5Y327',qty:65,broker:'sBroker',marketSymbol:'V9N.XETRA',currency:'EUR'},
  {id:'sap',name:'SAP SE',isin:'DE0007164600',qty:60,broker:'sBroker',marketSymbol:'SAP.XETRA',currency:'EUR'},
  {id:'gold',name:'Xetra-Gold',isin:'DE000A0S9GB0',qty:35,broker:'sBroker',marketSymbol:'4GLD.XETRA',currency:'EUR'}
];
const STORE='th66-professional-v2';
const state={positions:DEFAULT_POSITIONS,data:{},settings:{sbrokerReference:null,trReference:null,brokerPrices:{}},updatedAt:null};

const $=s=>document.querySelector(s); const $$=s=>[...document.querySelectorAll(s)];
function parseNum(v){if(v==null||v==='')return null;const n=Number(String(v).replace(/\./g,'').replace(',','.'));return Number.isFinite(n)?n:null}
function eur(v,d=2){return Number.isFinite(v)?new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR',minimumFractionDigits:d,maximumFractionDigits:d}).format(v):'–'}
function pc(v){if(!Number.isFinite(v))return '–';return `${v>=0?'+':''}${v.toLocaleString('de-DE',{minimumFractionDigits:2,maximumFractionDigits:2})} %`}
function cls(v){return !Number.isFinite(v)?'':v>0?'positive':v<0?'negative':''}
function save(){localStorage.setItem(STORE,JSON.stringify({settings:state.settings}))}
function load(){try{const x=JSON.parse(localStorage.getItem(STORE)||'{}');if(x.settings)state.settings={...state.settings,...x.settings,brokerPrices:{...state.settings.brokerPrices,...(x.settings.brokerPrices||{})}}}catch{}}
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2400)}
function positionValue(p){const manual=state.settings.brokerPrices[p.id];const market=state.data[p.id]?.latest?.price;const price=Number.isFinite(manual)?manual:market;return Number.isFinite(price)?price*p.qty:null}
function brokerTotal(name){const ps=state.positions.filter(p=>p.broker===name);const vals=ps.map(positionValue);return vals.every(Number.isFinite)?vals.reduce((a,b)=>a+b,0):vals.filter(Number.isFinite).reduce((a,b)=>a+b,0)}
function marketDayContribution(p){const d=state.data[p.id];if(!d?.ok||!Number.isFinite(d.performance?.day?.pct))return null;return positionValue(p)*(d.performance.day.pct/100)}
function chartSvg(points){if(!points?.length||points.length<2)return '<div class="chart-empty">Keine zusammenhängende Historie verfügbar</div>';const vals=points.map(x=>x.close),min=Math.min(...vals),max=Math.max(...vals),range=max-min||1;const w=600,h=130,pad=8;const coords=points.map((x,i)=>`${pad+(i/(points.length-1))*(w-2*pad)},${h-pad-((x.close-min)/range)*(h-2*pad)}`).join(' ');return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-label="Kurschart"><polyline points="${coords}" fill="none" stroke="#2d63e2" stroke-width="4" vector-effect="non-scaling-stroke"/><line x1="8" y1="${h-8}" x2="${w-8}" y2="${h-8}" stroke="#dce4ee"/></svg>`}
function render(){
  const sb=brokerTotal('sBroker'),tr=brokerTotal('Trade Republic'),total=sb+tr;
  $('#sbrokerValue').textContent=eur(sb);$('#trValue').textContent=eur(tr);$('#totalValue').textContent=eur(total);
  const available=state.positions.filter(p=>state.data[p.id]?.ok).length;$('#coverage').textContent=`${available}/${state.positions.length}`;
  $('#lastUpdate').textContent=state.updatedAt?`Stand ${new Date(state.updatedAt).toLocaleString('de-DE',{hour:'2-digit',minute:'2-digit'})}`:'Noch kein Update';
  const contribs=state.positions.map(marketDayContribution).filter(Number.isFinite);const dayEuro=contribs.reduce((a,b)=>a+b,0);const denom=state.positions.map(positionValue).filter(Number.isFinite).reduce((a,b)=>a+b,0);const day=denom?dayEuro/denom*100:null;$('#dayPct').textContent=pc(day);$('#dayPct').className=cls(day);
  $('#valuationNote').textContent=state.settings.sbrokerReference?`Broker-Referenz: ${eur(state.settings.sbrokerReference)} · Abweichung ${eur(sb-state.settings.sbrokerReference)}`:'Bewertung mit Brokerkurs (falls eingetragen), sonst letztem EOD-Kurs';
  $('#sbrokerCount').textContent=`${state.positions.filter(p=>p.broker==='sBroker').length} Positionen`;$('#trCount').textContent=`${state.positions.filter(p=>p.broker==='Trade Republic').length} Positionen`;
  renderPositions();renderAnalysis();renderManage();
}
function renderPositions(){
  $('#positionList').innerHTML=state.positions.map(p=>{const d=state.data[p.id],manual=state.settings.brokerPrices[p.id],price=Number.isFinite(manual)?manual:d?.latest?.price;const val=Number.isFinite(price)?price*p.qty:null;const status=d?.ok?'ok':d?'error':'warn';const statusText=d?.ok?(Number.isFinite(manual)?'Brokerkurs + EOD-Historie':'EODHD geladen'):d?.error||'Noch nicht geladen';const perf=d?.performance||{};return `<article class="position-card" data-id="${p.id}"><div class="position-summary"><div><h3>${p.name}</h3><p>${p.qty} Stück · ${p.isin} · ${p.marketSymbol}</p><span class="badge ${status}">${statusText}</span></div><div class="price"><strong>${eur(price,price<20?3:2)}</strong><small>${eur(val)}</small></div></div><div class="position-details"><div class="perf-grid">${[['Tag',perf.day],['Woche',perf.week],['Monat',perf.month],['3 Monate',perf.threeMonths],['1 Jahr',perf.year]].map(([n,x])=>`<div class="perf-box"><span>${n}</span><strong class="${cls(x?.pct)}">${pc(x?.pct)}</strong><small>${x?.baseDate||'–'} · ${eur(x?.basePrice,3)}</small></div>`).join('')}</div><div class="chart-wrap">${chartSvg(d?.chart)}</div><div class="source">${d?.source||d?.error||'Noch keine Daten'}${d?.latest?`<br>Letzter EOD-Kurs: ${d.latest.date}`:''}${Number.isFinite(manual)?`<br>Aktuelle Bewertung mit manuell gespeichertem Brokerkurs: ${eur(manual,3)}`:''}</div></div></article>`}).join('');
  $$('.position-summary').forEach(x=>x.onclick=()=>x.parentElement.classList.toggle('open'));
}
function renderAnalysis(){
 const rows=state.positions.map(p=>({p,v:marketDayContribution(p)})).filter(x=>Number.isFinite(x.v)).sort((a,b)=>Math.abs(b.v)-Math.abs(a.v));$('#contributors').innerHTML=rows.length?rows.map(x=>`<div class="rank-row"><div><b>${x.p.name}</b><small class="muted">Tagesbeitrag</small></div><strong class="${cls(x.v)}">${eur(x.v)}</strong></div>`).join(''):'<p class="muted">Nach der ersten erfolgreichen Aktualisierung verfügbar.</p>';
 $('#diagnostics').innerHTML=state.positions.map(p=>{const d=state.data[p.id];return `<div class="diag-row"><div><b>${p.name}</b><small class="muted">${p.marketSymbol}</small></div><strong class="${d?.ok?'positive':d?'negative':''}">${d?.ok?`${d.chart?.length||0} Datenpunkte`:d?.error||'offen'}</strong></div>`}).join('');
}
function renderManage(){
 $('#sbrokerReference').value=state.settings.sbrokerReference?.toLocaleString('de-DE')||'';$('#trReference').value=state.settings.trReference?.toLocaleString('de-DE')||'';
 $('#brokerPriceInputs').innerHTML=state.positions.map(p=>`<div class="broker-line"><div><b>${p.name}</b><small>${p.qty} Stück · ${p.isin}</small></div><input class="broker-input" data-id="${p.id}" inputmode="decimal" placeholder="Kurs" value="${Number.isFinite(state.settings.brokerPrices[p.id])?String(state.settings.brokerPrices[p.id]).replace('.',','):''}"></div>`).join('');
}
async function refresh(){const b=$('#refreshBtn');b.disabled=true;b.textContent='Lädt …';$('#setupBanner').classList.add('hidden');try{const r=await fetch('/api/market-data',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({positions:state.positions})});const x=await r.json();if(!r.ok||!x.ok)throw Object.assign(new Error(x.error||'Datenabruf fehlgeschlagen'),{code:x.code});state.data=Object.fromEntries(x.results.map(y=>[y.id,y]));state.updatedAt=x.generatedAt;render();toast('Marktdaten aktualisiert');}catch(e){const ban=$('#setupBanner');ban.classList.remove('hidden');ban.innerHTML=e.code==='API_KEY_MISSING'?'<b>EODHD-Schlüssel fehlt noch.</b><br>Die App-Struktur funktioniert. Sobald <code>EODHD_API_KEY</code> in Vercel hinterlegt ist, lädt diese Version dieselbe historische Kursreihe für Kurs, Woche, Monat und Chart.':'<b>Datenabruf nicht vollständig:</b><br>'+e.message;toast('Marktdaten konnten nicht geladen werden');}finally{b.disabled=false;b.textContent='Aktualisieren'}}
function wire(){
 $$('.bottom-nav button').forEach(b=>b.onclick=()=>{$$('.bottom-nav button').forEach(x=>x.classList.remove('active'));b.classList.add('active');$$('.page').forEach(x=>x.classList.remove('active'));$('#'+b.dataset.page).classList.add('active');scrollTo({top:0,behavior:'smooth'})});
 $('#refreshBtn').onclick=refresh;$('#expandAll').onclick=()=>{const cards=$$('.position-card');const all=cards.every(c=>c.classList.contains('open'));cards.forEach(c=>c.classList.toggle('open',!all));$('#expandAll').textContent=all?'Alle öffnen':'Alle schließen'};
 $('#saveReferences').onclick=()=>{state.settings.sbrokerReference=parseNum($('#sbrokerReference').value);state.settings.trReference=parseNum($('#trReference').value);save();render();toast('Broker-Referenzen gespeichert')};
 $('#saveBrokerPrices').onclick=()=>{$$('.broker-input').forEach(i=>{const n=parseNum(i.value);if(Number.isFinite(n))state.settings.brokerPrices[i.dataset.id]=n;else delete state.settings.brokerPrices[i.dataset.id]});save();render();toast('Brokerkurse gespeichert')};
 $('#exportBtn').onclick=()=>{const blob=new Blob([JSON.stringify({version:'2.0.0',exportedAt:new Date().toISOString(),settings:state.settings},null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`depot-cockpit-sicherung-${new Date().toISOString().slice(0,10)}.json`;a.click();URL.revokeObjectURL(a.href)};
 $('#importInput').onchange=async e=>{try{const x=JSON.parse(await e.target.files[0].text());if(!x.settings)throw new Error();state.settings={...state.settings,...x.settings,brokerPrices:{...(x.settings.brokerPrices||{})}};save();render();toast('Sicherung importiert')}catch{toast('Ungültige Sicherungsdatei')}};
 $('#resetBtn').onclick=()=>{if(confirm('Lokale Brokerwerte und Kurse wirklich löschen?')){localStorage.removeItem(STORE);state.settings={sbrokerReference:null,trReference:null,brokerPrices:{}};render();toast('Lokale Eingaben gelöscht')}};
}
load();wire();render();
fetch('/api/health').then(r=>r.json()).then(x=>{if(!x.eodhdConfigured){const b=$('#setupBanner');b.classList.remove('hidden');b.innerHTML='<b>Professional 2.0 ist bereit.</b><br>Für echte Marktdaten fehlt nur noch der geschützte EODHD-Schlüssel in Vercel.'}}).catch(()=>{});
