/* Depot-Cockpit Professional 5.6.3 – Konsolidierungs-Overlay
   Ziel: funktionierende Filter, verständliche Kursstatus, Analyse ohne Platzhalter,
   optionaler Broker-Abgleich und Erhalt des letzten gültigen Kurses.
*/
(() => {
  'use strict';

  const UI563 = { broker:'all', asset:'alle', period:'day', analysis:'performance' };
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fmtDate = d => {
    if(!d) return '';
    const x = new Date(String(d).length===10 ? d+'T12:00:00' : d);
    return Number.isNaN(x.getTime()) ? String(d) : x.toLocaleDateString('de-DE');
  };

  function inferredType(p){
    const explicit=String(p.assetType||p.type||'').toLowerCase();
    if(explicit.includes('etf')) return 'etfs';
    if(explicit.includes('aktie')||explicit.includes('stock')) return 'aktien';
    if(explicit.includes('roh')||explicit.includes('etc')||explicit.includes('gold')) return 'rohstoffe';
    if(p.id==='sap'||p.id==='trilogy') return 'aktien';
    if(p.id==='gold'||/gold/i.test(p.name||'')) return 'rohstoffe';
    return 'etfs';
  }

  function scopePositions(){
    return state.positions.filter(p => UI563.broker==='all' || p.broker===UI563.broker);
  }
  function visiblePositions(){
    return scopePositions().filter(p => UI563.asset==='alle' || inferredType(p)===UI563.asset);
  }

  function quoteStatus(p){
    const d=state.data?.[p.id], manual=Number.isFinite(brokerPrice(p));
    if(manual) return {kind:'manual', label:'🟡 Manueller Brokerkurs', detail:'manuell'};
    if(d?.ok && Number.isFinite(Number(d?.latest?.price))){
      if(dataIsCurrentToday(p.id) && !d.__stale) {
        const delayed=d?.sourceMeta?.delayedMinutes ?? 15;
        return {kind:'current',label:`🟢 Aktuell · Börse ca. ${delayed} Min`,detail:d?.latest?.date||''};
      }
      return {kind:'stored',label:`🟠 Letzter gültiger Kurs · ${fmtDate(d?.latest?.date)}`,detail:d?.latest?.date||''};
    }
    return {kind:'missing',label:'🔴 Kein gültiger Kurs',detail:''};
  }

  // 5.6.3: Ein partieller Refresh darf gültige alte Positionen nicht löschen.
  if(typeof persistAndApplySnapshot==='function'){
    persistAndApplySnapshot = async function(snapshot){
      const previous = readCentralMarketCache()?.items || {};
      const items = {};
      for(const [id,item] of Object.entries(previous)){
        if(item?.ok && Number.isFinite(Number(item?.latest?.price))) items[id]={...item,__stale:true};
      }
      for(const item of (snapshot?.results||[])){
        if(item?.id && item?.ok && Number.isFinite(Number(item?.latest?.price))) items[item.id]={...item,__stale:false};
      }
      const stored={
        id:'latest',schemaVersion:5,
        generationId:snapshot.generationId||crypto.randomUUID?.()||String(Date.now()),
        savedAt:new Date().toISOString(),
        generatedAt:snapshot.generatedAt||new Date().toISOString(),
        requestedIds:snapshot.requestedIds||[],
        items,
        coverage:snapshot.coverage||{},
        diagnostics:snapshot.diagnostics||{},
        provider:snapshot.provider||'Market Data Core'
      };
      const mode=await dbPutSnapshot(stored);
      writeJsonStorage(CENTRAL_MARKET_CACHE,stored);
      state.data=items;
      state.updatedAt=stored.generatedAt;
      saveMarketCache();
      return {stored,mode};
    };
  }

  function periodResult(){
    const ps=scopePositions();
    if(UI563.period==='max') return null;
    let current=0, base=0, count=0;
    for(const p of ps){
      const d=state.data?.[p.id], perf=d?.performance?.[UI563.period];
      const price=valuationPrice(p);
      if(!Number.isFinite(price)||!Number.isFinite(perf?.basePrice)||perf.basePrice<=0) continue;
      current += price*p.qty;
      base += perf.basePrice*p.qty;
      count++;
    }
    if(!count || !base) return null;
    return {euro:current-base,pct:(current/base-1)*100,count,total:ps.length};
  }

  function applyPeriod(){
    document.querySelectorAll('.period-tabs button').forEach(b=>b.classList.toggle('active',b.dataset.period===UI563.period));
    const r=periodResult();
    const labels={day:'1 Tag',week:'1 Woche',month:'1 Monat',threeMonths:'3 Monate',year:'1 Jahr',max:'Max'};
    const e=document.getElementById('dayEuro'), p=document.getElementById('dayPct');
    if(!e||!p)return;
    if(r){
      e.textContent=eur(r.euro);
      p.textContent=pc(r.pct);
      e.className=cls(r.euro); p.className=cls(r.pct);
      const note=document.getElementById('valuationNote');
      if(note) note.textContent=`Performance ${labels[UI563.period]} · ${r.count}/${r.total} Positionen mit verfügbarer Vergleichsbasis`;
    }else{
      e.textContent='–'; p.textContent='–';
      e.className=''; p.className='';
      const note=document.getElementById('valuationNote');
      if(note) note.textContent=`Performance ${labels[UI563.period]} derzeit nicht vollständig verfügbar`;
    }
  }

  function applyBrokerScope(){
    document.querySelectorAll('.broker-tab').forEach(b=>b.classList.toggle('active',b.dataset.brokerFilter===UI563.broker));
    const ps=scopePositions();
    const vals=ps.map(p=>positionValue(p)).filter(Number.isFinite);
    const complete=vals.length===ps.length && ps.length>0;
    const total=vals.reduce((a,b)=>a+b,0);
    const totalEl=document.getElementById('totalValue');
    const label=document.getElementById('heroScopeLabel');
    if(totalEl) totalEl.textContent=complete?eur(total):`Teilbewertung ${vals.length}/${ps.length}`;
    if(label) label.textContent=UI563.broker==='all'?'Gesamtdepotwert':`${UI563.broker} Depotwert`;

    const ov=document.getElementById('overviewPositions');
    if(ov){
      const rows=ps.map(p=>({p,value:positionValue(p),pct:state.data[p.id]?.performance?.day?.pct}))
        .sort((a,b)=>(b.value||0)-(a.value||0)).slice(0,5);
      ov.innerHTML=rows.map(x=>`<div class="compact-position"><div><b>${esc(x.p.name)}</b><small>${x.p.qty.toLocaleString('de-DE')} Stück · ${esc(x.p.broker)}</small></div><div class="value-col"><b>${eur(x.value)}</b><small class="${cls(x.pct)}">${pc(x.pct)}</small></div></div>`).join('');
    }
    applyPositionVisibility();
    applyPeriod();
  }

  function applyPositionVisibility(){
    const ps=visiblePositions();
    const allowed=new Set(ps.map(p=>p.name));
    document.querySelectorAll('#positionList .position-card').forEach(card=>{
      const name=card.querySelector('.position-summary h3')?.textContent?.trim();
      card.hidden=!allowed.has(name);
      if(card.hidden) card.style.display='none'; else card.style.display='';
    });
    document.querySelectorAll('#positionList .broker-title').forEach(title=>{
      const broker=title.textContent.trim();
      const any=ps.some(p=>p.broker===broker);
      title.hidden=!any;
      title.style.display=any?'':'none';
    });
    document.querySelectorAll('.filter-chips button').forEach(b=>b.classList.toggle('active',b.dataset.positionFilter===UI563.asset));
  }

  function enhancePositionCards(){
    document.querySelectorAll('#positionList .position-card').forEach(card=>{
      const name=card.querySelector('.position-summary h3')?.textContent?.trim();
      const p=state.positions.find(x=>x.name===name); if(!p)return;
      card.dataset.assetType=inferredType(p);
      const badge=card.querySelector('.badge');
      const s=quoteStatus(p);
      if(badge){
        badge.textContent=s.label;
        badge.className=`badge status-${s.kind}`;
      }
      const source=card.querySelector('.source');
      if(source && s.kind==='stored'){
        source.insertAdjacentHTML('afterbegin',`<b class="stale-warning">Hinweis: Angezeigt wird der letzte gültige gespeicherte Kurs. Beim aktuellen Abruf lag kein neuer Kurs vor.</b><br>`);
      }
    });
  }

  function updateReconciliation(){
    const box=document.getElementById('reconciliationSummary'); if(!box)return;
    const ref=state.settings.sbrokerReference;
    if(!Number.isFinite(ref)){
      box.innerHTML=`<div><span class="panel-kicker">OPTIONAL</span><h3>Broker-Abgleich</h3><p>Für den normalen Betrieb nicht erforderlich. Nur öffnen, wenn du bewusst einen aktuellen S-Broker-Gesamtwert vergleichen möchtest.</p></div><button class="secondary-action" id="openCompare563">Bei Bedarf vergleichen</button>`;
      box.querySelector('#openCompare563').onclick=()=>{showPage('manage');setTimeout(()=>document.getElementById('optionalDepotCompare')?.setAttribute('open',''),50)};
    } else {
      const app=brokerTotal('sBroker'), gap=Number.isFinite(app)?app-ref:null;
      box.innerHTML=`<div><span class="panel-kicker">OPTIONALER DEPOT-ABGLEICH</span><h3>${eur(gap)} Abweichung</h3><p>App ${eur(app)} · S Broker ${eur(ref)}</p></div><button class="secondary-action" id="openCompare563">Details</button>`;
      box.querySelector('#openCompare563').onclick=()=>{showPage('manage');setTimeout(()=>document.getElementById('optionalDepotCompare')?.setAttribute('open',''),50)};
    }
  }

  function buildAllocation(){
    const box=document.getElementById('allocationContent'); if(!box)return;
    const ps=scopePositions().map(p=>({p,v:positionValue(p)})).filter(x=>Number.isFinite(x.v));
    const total=ps.reduce((a,x)=>a+x.v,0);
    if(!total){box.innerHTML='<p class="muted">Noch keine vollständige Bewertung verfügbar.</p>';return}
    box.innerHTML=ps.sort((a,b)=>b.v-a.v).map(x=>{
      const w=x.v/total*100;
      return `<div class="allocation-row"><div><b>${esc(x.p.name)}</b><small>${esc(x.p.broker)}</small></div><div class="allocation-value"><b>${w.toFixed(1).replace('.',',')} %</b><small>${eur(x.v)}</small></div><div class="weight-bar"><i style="width:${Math.min(100,w)}%"></i></div></div>`;
    }).join('');
  }

  function buildRisk(){
    const box=document.getElementById('riskContent'); if(!box)return;
    const ps=scopePositions().map(p=>({p,v:positionValue(p),s:quoteStatus(p)}));
    const valued=ps.filter(x=>Number.isFinite(x.v)), total=valued.reduce((a,x)=>a+x.v,0);
    const top=[...valued].sort((a,b)=>b.v-a.v)[0];
    const topWeight=top&&total?top.v/total*100:null;
    const stale=ps.filter(x=>x.s.kind==='stored').length;
    const missing=ps.filter(x=>x.s.kind==='missing').length;
    const concentration=Number.isFinite(topWeight)?(topWeight>20?'Erhöht':topWeight>12?'Beobachten':'Ausgewogen'):'–';
    box.innerHTML=`<div class="risk-grid">
      <article><span>Größte Position</span><b>${top?esc(top.p.name):'–'}</b><strong>${Number.isFinite(topWeight)?topWeight.toFixed(1).replace('.',',')+' %':'–'}</strong></article>
      <article><span>Konzentration</span><b>${concentration}</b><small>größte Einzelposition</small></article>
      <article><span>Letzte gespeicherte Kurse</span><b>${stale}</b><small>aktuell nicht neu geliefert</small></article>
      <article><span>Ohne gültigen Kurs</span><b>${missing}</b><small>muss geprüft werden</small></article>
    </div>`;
  }

  function buildPerformanceSummary(){
    const box=document.getElementById('analysisPerformanceSummary');if(!box)return;
    const r=periodResult();
    if(!r){box.innerHTML='<div class="info-strip">Für den gewählten Zeitraum liegt noch keine vollständige Vergleichsbasis vor. Es werden nur belegte Werte gezeigt.</div>';return}
    box.innerHTML=`<div class="analysis-kpis"><span>Zeitraum <b>${document.querySelector('.period-tabs button.active')?.textContent||'1T'}</b></span><span>Veränderung <b class="${cls(r.euro)}">${eur(r.euro)}</b></span><span>Performance <b class="${cls(r.pct)}">${pc(r.pct)}</b></span><span>Datenbasis <b>${r.count}/${r.total}</b></span></div>`;
  }

  function applyAnalysisTab(){
    document.querySelectorAll('.analysis-tabs button').forEach(b=>b.classList.toggle('active',b.dataset.analysisTab===UI563.analysis));
    const map={performance:'analysisPerformance',allokation:'analysisAllocation',risiko:'analysisRisk'};
    Object.values(map).forEach(id=>{const el=document.getElementById(id);if(el)el.hidden=true});
    const active=document.getElementById(map[UI563.analysis]);if(active)active.hidden=false;
    if(UI563.analysis==='performance') buildPerformanceSummary();
    if(UI563.analysis==='allokation') buildAllocation();
    if(UI563.analysis==='risiko') buildRisk();
  }

  function moveTechnicalBlocks(){
    document.querySelector('.legacy-comparison-panel')?.classList.add('hidden563');
    document.querySelector('.legacy-chart-panel')?.classList.add('hidden563');
    document.querySelector('.legacy-diagnostics-panel')?.classList.add('hidden563');

    const bc=document.getElementById('brokerComparison'), bhome=document.getElementById('brokerComparisonHome');
    if(bc&&bhome&&bc.parentElement!==bhome) bhome.appendChild(bc);

    const dg=document.getElementById('diagnostics'), dghome=document.getElementById('diagnosticsHome');
    if(dg&&dghome&&dg.parentElement!==dghome) dghome.appendChild(dg);

    const cm=document.getElementById('courseManagerBlock');
    if(cm) cm.removeAttribute('open');
  }

  function updateCoverage(){
    const ps=scopePositions();
    const current=ps.filter(p=>quoteStatus(p).kind==='current'||quoteStatus(p).kind==='manual').length;
    const stored=ps.filter(p=>quoteStatus(p).kind==='stored').length;
    const coverage=document.getElementById('coverage');
    if(coverage) coverage.textContent=`${current}/${ps.length}`;
    const card=coverage?.closest('.metric-card')?.querySelector('small');
    if(card) card.textContent=stored?`${stored} mit letztem gültigem Kurs`:'aktuell/verwertbar';
  }

  function rebindControls(){
    document.querySelectorAll('.broker-tab').forEach(b=>{
      b.onclick=()=>{UI563.broker=b.dataset.brokerFilter;applyBrokerScope();buildAllocation();buildRisk();};
    });
    document.querySelectorAll('.filter-chips button').forEach(b=>{
      b.onclick=()=>{UI563.asset=b.dataset.positionFilter;applyPositionVisibility();};
    });
    document.querySelectorAll('.period-tabs button').forEach(b=>{
      b.onclick=()=>{UI563.period=b.dataset.period;applyPeriod();buildPerformanceSummary();};
    });
    document.querySelectorAll('.analysis-tabs button').forEach(b=>{
      b.onclick=()=>{UI563.analysis=b.dataset.analysisTab;applyAnalysisTab();};
    });
  }

  function enhance(){
    const ver=document.getElementById('appVersionLabel'); if(ver) ver.textContent='DEPOT-COCKPIT · VERSION 5.6.3';
    const bs=document.getElementById('buildStamp'); if(bs) bs.textContent='BUILD KONSOLIDIERUNG · 2026-08-11 · 22:30';
    enhancePositionCards();
    moveTechnicalBlocks();
    updateReconciliation();
    updateCoverage();
    rebindControls();
    applyBrokerScope();
    applyAnalysisTab();
  }

  // Original render nach jedem Refresh erweitern.
  if(typeof render==='function'){
    const baseRender=render;
    render=function(){baseRender();setTimeout(enhance,0)};
  }

  window.addEventListener('DOMContentLoaded',()=>setTimeout(enhance,80));
})();
