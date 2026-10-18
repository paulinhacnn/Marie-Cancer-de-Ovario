(async function () {
  'use strict';
  const D = window.ONCO;
  try { await D.ready; } catch (error) { document.getElementById('app').innerHTML='<main class="main"><h1>Não foi possível carregar os dados reais</h1><p>Confira se a pasta frontend/data foi incluída no projeto. Nenhum valor de demonstração é utilizado.</p></main>'; console.error(error); return; }

  try {
    const [evidence, context, funding, ukbiobank, riskFactors] = await Promise.all(['data/evidence.json','data/context.json','data/funding.json','data/ukbiobank.json','data/risk-factors.json'].map(async path => {
      const response=await fetch(path);
      if(!response.ok)throw new Error('Fonte indisponível: '+path);
      return response.json();
    }));
    if(!Array.isArray(evidence.studies)||context.is_synthetic!==false||context.rows?.length!==28)throw new Error('Fontes de evidência ou contexto incompatíveis.');
    const water=context.sources.water,idhm=context.sources.idhm;
    context.indicators={
      water_network_pct:{label:'Domicílios com água da rede',year:2022,unit:'percent',source:'IBGE · Censo',sourceUrl:water.source_url,definition:'Rede geral como principal abastecimento dos domicílios particulares permanentes ocupados.'},
      idhm_2019:{label:'IDHM',year:2019,unit:'index',source:'PNUD / FJP',sourceUrl:idhm.source_url,definition:'Índice estadual de desenvolvimento humano; referência do mesmo ano da PNS.'},
      idhm_education_2019:{label:'IDHM Educação',year:2019,unit:'index',source:'PNUD / FJP',sourceUrl:idhm.source_url,definition:'Dimensão de educação do desenvolvimento humano: frequência escolar e escolaridade de adultos.'},
      idhm:{label:'IDHM',year:2021,unit:'index',source:'PNUD / FJP',sourceUrl:idhm.source_url,definition:'Índice estadual de longevidade, educação e renda, conforme a planilha desta edição.'},
      idhm_education:{label:'IDHM Educação',year:2021,unit:'index',source:'PNUD / FJP',sourceUrl:idhm.source_url,definition:'Componente de educação da mesma edição e ano do IDHM 2021.'}
    };
    if(funding.isSynthetic!==false||funding.scholarships?.length!==5||ukbiobank.isSynthetic!==false||ukbiobank.effects?.length!==2||riskFactors.isSynthetic!==false||!Array.isArray(riskFactors.items))throw new Error('Fontes de pesquisa ou fatores de risco incompatíveis.');
    // Translations pair exact source strings with professionally reviewed
    // English wording; source JSON objects are left unchanged.
    const sourceEn=window.MARIE_SOURCE_TRANSLATIONS,translations=window.MARIE_I18N?.dict;
    if(sourceEn&&translations){
      translations.set(riskFactors.definition,sourceEn.riskDefinition);
      riskFactors.categories.forEach(c=>{if(sourceEn.categories[c.id])translations.set(c.label,sourceEn.categories[c.id]);});
      riskFactors.items.forEach(r=>{
        const words=sourceEn.risk[r.id];if(!words)return;
        ['label','evidence','explanation','measurement'].forEach((key,i)=>translations.set(r[key],words[i]));
      });
      evidence.studies.forEach(r=>{
        const words=sourceEn.evidence[r.title];if(!words)return;
        ['title','finding','comparison','limitations'].forEach((key,i)=>translations.set(r[key],words[i]));
      });
      evidence.mechanisms.forEach(r=>{
        const words=sourceEn.mechanisms[r.compound];if(!words)return;
        ['compound','finding','limitations'].forEach((key,i)=>translations.set(r[key],words[i]));
      });
    }
    D.evidenceData=evidence;D.contextData=context;D.fundingData=funding;D.ukData=ukbiobank;D.riskData=riskFactors;
  } catch(error) {
    document.getElementById('app').innerHTML='<main class="main"><h1>Fonte do observatório indisponível</h1><p>Confira se todos os arquivos da pasta frontend/data acompanham esta versão do projeto. Atualize a pasta completa ao substituir o aplicativo.</p></main>';
    console.error(error);return;
  }
  const $ = (s, root = document) => root.querySelector(s);
  const e = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const num = v => v == null ? '—' : new Intl.NumberFormat(state.lang==='en'?'en-US':'pt-BR',{maximumFractionDigits:0}).format(v);
  const decimal = (v,d=1) => v == null ? '—' : new Intl.NumberFormat(state.lang==='en'?'en-US':'pt-BR',{minimumFractionDigits:d,maximumFractionDigits:d}).format(v);
  const pct = v => v == null ? '—' : decimal(v,v>0&&v<.01?3:v>0&&v<1?2:1)+'%';
  const compact = v => v == null ? '—' : v>=1e6 ? decimal(v/1e6)+(state.lang==='en'?' M':' mi') : v>=1e3 ? decimal(v/1e3)+(state.lang==='en'?' K':' mil') : num(v);
  const icons = {
    grid:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.87M16 3a4 4 0 0 1 0 8"/><circle cx="9" cy="7" r="4"/>',
    leaf:'<path d="M20 3c-8-1-16 2-16 10a7 7 0 0 0 7 7c8 0 10-8 9-17Z"/><path d="m4 21 12-12m-6 6V9m0 6h6"/>',
    network:'<circle cx="5" cy="5" r="3"/><circle cx="19" cy="5" r="3"/><circle cx="12" cy="19" r="3"/><path d="m7 7 4 9m6-9-4 9M8 5h8"/>',
    heart:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0l-1 1-1-1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/><path d="M3 12h5l2-4 4 8 2-4h5"/>',
    database:'<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.7 4 3 9 3s9-1.3 9-3V5M3 12c0 1.7 4 3 9 3s9-1.3 9-3"/>',
    chevron:'<path d="m9 5 7 7-7 7"/>',down:'<path d="m6 9 6 6 6-6"/>',
    arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>',external:'<path d="M14 3h7v7m0-7L10 14M11 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6"/>',
    download:'<path d="M12 3v12m-5-5 5 5 5-5M4 16v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4"/>',
    pin:'<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/>',
    reset:'<path d="M3 10a9 9 0 1 1 2.6 8M3 4v6h6"/>',spark:'<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z"/>',
    plus:'<path d="M12 5v14M5 12h14"/>',check:'<path d="m4 12 5 5L20 6"/>',close:'<path d="m6 6 12 12M6 18 18 6"/>',
    shield:'<path d="M12 3 3 7v5c0 6 9 10 9 10s9-4 9-10V7l-9-4Z"/><path d="m8 12 3 3 5-6"/>',
    chart:'<path d="M3 3v18h18M7 16V9m5 7V5m5 11v-4"/>',clipboard:'<rect x="5" y="4" width="15" height="18" rx="2"/><rect x="9" y="2" width="7" height="4" rx="1"/><path d="M9 11h7M9 15h7M9 19h4"/>',
    menu:'<path d="M3 6h18M3 12h18M3 18h18"/>',search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
    hospital:'<path d="M4 21V8h16v13M9 8V3h6v5M2 21h20m-11 0v-5h2v5M8 11h.01M16 11h.01M8 14h.01M16 14h.01"/>',
    sliders:'<path d="M4 6h6m4 0h6M4 12h10m4 0h2M4 18h2m4 0h10"/><circle cx="12" cy="6" r="2"/><circle cx="16" cy="12" r="2"/><circle cx="8" cy="18" r="2"/>',
    lock:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V6a4 4 0 0 1 8 0v4M12 14v3"/>',
    print:'<path d="M6 9V3h12v6M6 18H3V9h18v9h-3"/><path d="M6 14h12v7H6zM17 12h.01"/>',
    activity:'<path d="M2 12h5l3-8 4 16 3-8h5"/>',book:'<path d="M12 6C8 3 5 3 2 4v16c3-1 6-1 10 2 4-3 7-3 10-2V4c-3-1-6-1-10 2Zm0 0v16"/>',
    circle:'<circle cx="12" cy="12" r="8"/>',compare:'<path d="M4 7h14m-4-4 4 4-4 4M20 17H6m4-4-4 4 4 4"/>',scale:'<path d="M12 3v18M6 21h12M3 7h18m-15 0-3 7h6L6 7Zm12 0-3 7h6l-3-7Z"/>'
  };
  const icon = (name,size=16) => `<svg class="icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]||icons.circle}</svg>`;
  const pages = [
    {id:'overview',label:'Visão executiva',icon:'grid',title:'A população no centro da decisão',sub:'Estratificação, alimentação e atenção ao câncer de ovário em uma visão integrada.'},
    {id:'population',label:'População',icon:'users',title:'Cada território, muitos perfis',sub:'Explore a distribuição por idade, renda e escolaridade para orientar o planejamento.'},
    {id:'risk',label:'Fatores de risco',icon:'shield',title:'O que é fator de risco para ovário?',sub:'Entenda a força da evidência, o sentido da associação e quais fatores estão medidos no painel.'},
    {id:'nutrition',label:'Alimentação',icon:'leaf',title:'Os hábitos também contam uma história',sub:'Conheça os perfis alimentares e como se distribuem nos grupos populacionais.'},
    {id:'cross',label:'Cruzamentos',icon:'network',title:'Transforme perguntas em análises',sub:'Explore combinações nas mesmas participantes ou padrões entre territórios.'},
    {id:'care',label:'Atenção oncológica',icon:'heart',title:'O câncer de ovário no território',sub:'Óbitos observados e casos novos estimados, com as unidades e os períodos de cada fonte.'},
    {id:'onehealth',label:'One Health',icon:'network',title:'Uma visão integrada da saúde',sub:'Saúde da mulher conectada à alimentação, aos sistemas de produção e ao ambiente.'},
    {id:'evidence',label:'Evidências',icon:'book',title:'Cítricos, alimentação e ciência',sub:'Resultados publicados, com o nível de evidência e a pergunta que cada estudo responde.'},
    {id:'research',label:'Projetos e bolsas',icon:'spark',title:'A pesquisa que sustenta o projeto',sub:'Marie.AI · FAPESP PIPE Fase 2 · projetos vinculados e bolsas de pesquisa.'},
    {id:'sources',label:'Fontes e método',icon:'database',title:'Uma análise que mostra de onde vem',sub:'Consulte a origem dos dados, as definições e a precisão das estimativas.'}
  ];
  const allowedPages = pages.map(p=>p.id);
  const hash = location.hash.replace('#','');
  const initialLang = (function(){try{return (typeof URLSearchParams !== 'undefined' && location.search ? new URLSearchParams(location.search).get('lang') : null) || localStorage.getItem('marie-language') || 'pt';}catch{return 'pt';}})();
  const state = {lang:initialLang==='en'?'en':'pt',page:allowedPages.includes(hash)?hash:'overview',uf:'BR',age:'all',cohort:'all',mapMetric:'ultra',mapMode:'relative',compare:'SP',crossMode:'individual',crossA:'ultra',crossB:'obesity',scatterX:'ultra',scatterY:'obesity',nutritionMetric:'ultra',nutritionSource:'br',ukEndpoint:'incidence',ukProfile:'fruit_mean_g_day',ukQuartile:'Q1',riskCategory:'all',riskDirection:'all',heatDimension:'income',mobile:false};
  if(document.documentElement)document.documentElement.lang=state.lang==='en'?'en':'pt-BR';
  function applyLanguage(root=document) {if(state.lang==='en')window.MARIE_I18N?.translateDOM(root);}
  const sources = {
    pns:'https://biblioteca.ibge.gov.br/visualizacao/instrumentos_de_coleta/doc5569.pdf',
    dictionary:'https://ftp.ibge.gov.br/PNS/2019/Microdados/Documentacao/Dicionario_e_input_20220530.zip',
    lifestyle:'https://biblioteca.ibge.gov.br/visualizacao/livros/liv101764.pdf',
    census:'https://sidra.ibge.gov.br/tabela/9514',
    inca:'https://www.gov.br/inca/pt-br/assuntos/cancer/numeros/estimativa/estado-capital/brasil/por-estado/por-estado/',
    nci:'https://www.cancer.gov/types/ovarian/hp/ovarian-prevention-pdq',
    repo:'https://github.com/rafa-trindade/kaggle-datahub',
    sim:'https://datasus.saude.gov.br/mortalidade-desde-1996-pela-cid-10/',
    sih:'https://tabnet.datasus.gov.br/cgi/sih/midescr.htm',
    sia:'https://datasus.saude.gov.br/acesso-a-informacao/producao-ambulatorial-sia-sus/',
    keys:'https://ftp.ibge.gov.br/PNS/2019/Microdados/Documentacao/Chaves_PNS_2019.pdf'
  };
  let geometry = null;
  let agenda = [];
  let previousFocus = null;
  let toastTimer;
  let renderTicket=0;
  try { const a=JSON.parse(localStorage.getItem('marie-ovario-agenda-real-v3')||'[]'); if(Array.isArray(a)) agenda=a.filter(x=>x&&typeof x.id==='string'&&typeof x.title==='string').slice(0,100); } catch (_) {}
  const getFilters = (cohort=false) => ({uf:state.uf,age:state.age,cohort:cohort?state.cohort:'all'});
  const territory = uf => uf==='BR'?'Brasil':D.states.find(s=>s.uf===uf)?.name||uf;
  const ageLabel = () => state.age==='all'?'18 anos ou mais':D.ages.find(a=>a.id===state.age)?.label||state.age;
  const metricLabel = id => id==='ovarian'?'Relato de câncer de ovário':D.metrics.find(m=>m.id===id)?.label||id;
  const selected = (a,b) => a===b?' selected':'';
  const option = (value,label,current) => `<option value="${e(value)}"${selected(value,current)}>${e(label)}</option>`;
  const ufs = current => option('BR','Brasil',current)+D.states.map(s=>option(s.uf,`${s.uf} · ${s.name}`,current)).join('');
  const metricOptions = (current,ovary=false) => D.metrics.map(m=>option(m.id,m.label,current)).join('')+(ovary?option('ovarian','Relato de câncer de ovário · PNS',current):'');
  const tag = (text,type='') => `<span class="tiny-tag ${type}">${e(text)}</span>`;
  const btn = (text,action,ic,kind='') => `<button class="button ${kind}" data-action="${action}">${ic?icon(ic,14):''}${text}</button>`;
  const panel = (title,sub,body,extra='',footer='') => `<section class="panel"><div class="panel-header"><div><h2 class="panel-title">${title}</h2>${sub?`<p class="panel-sub">${sub}</p>`:''}</div>${extra}</div><div class="panel-body">${body}</div>${footer?`<div class="panel-foot">${footer}</div>`:''}</section>`;
  const kpi = (label,value,sub,ic,accent=false,unit='') => `<div class="kpi${accent?' accent':''}"><div class="kpi-top"><span>${label}</span><span class="metric-icon">${icon(ic,15)}</span></div><div class="kpi-value">${value}${unit?`<small>${unit}</small>`:''}</div><div class="kpi-sub">${sub}</div></div>`;
  const callout = (text,ic='info') => `<div class="callout">${icon(ic,16)}<p>${text}</p></div>`;
  function ci(stat) {
    if (!stat || stat.pct == null) return `<span class="uncertainty muted">Sem respostas válidas${stat?.nValid!=null?' · n = '+num(stat.nValid):''}</span>`;
    const interval=stat.low!=null&&stat.high!=null?`IC95% ${decimal(stat.low,stat.pct<1?2:1)}–${decimal(stat.high,stat.pct<1?2:1)}%`:'IC95% não calculável neste recorte';
    const count=stat.nValid!=null?`n = ${num(stat.nValid)}${stat.nEvent!=null?' · '+num(stat.nEvent)+' com a característica':''}`:'';
    const quality=stat.quality==='inconclusive'?'Exploratório e inconclusivo':stat.quality==='caution'?'Interpretar com cautela':'';
    return `<span class="uncertainty">${e(interval)}${count?`<span class="sample-count">${e(count)}</span>`:''}${quality?`<span class="quality-label ${stat.quality==='inconclusive'?'inconclusive':''}">${e(quality)}</span>`:''}</span>`;
}
  function metricDetail(a,id) {
  const v=a.estimates?.[id];
  return ci(v);
}
  function relationshipBars(rows,options={}) {
  return `<div class="relationship-bars">${rows.map((r,i)=>{
    const st=r.stat||{},v=st.pct,low=st.low,high=st.high;
    return `<div class="relationship-row"><div class="relationship-label"><strong>${e(r.label)}</strong>${r.sub?`<span>${e(r.sub)}</span>`:''}</div><div class="relationship-plot"><div class="relationship-track"><span style="width:${v==null?0:Math.max(0,Math.min(100,v))}%;background:${r.color||'#2b7c61'}"></span>${v!=null&&low!=null&&high!=null?`<i class="relationship-ci" style="left:${low}%;width:${high-low}%" title="${e(`IC95% ${decimal(low)} a ${decimal(high)}%`)}"></i>`:''}</div><small>${ci(st)}</small></div><strong class="relationship-value">${pct(v)}</strong></div>`;
  }).join('')}<div class="relationship-scale"><span>0%</span><span>50%</span><span>100%</span></div></div>`;
}
  function heatmapPanel(f) {
  const dimensions={age:'Faixa etária',income:'Renda',education:'Escolaridade',race:'Raça ou cor'},rows=D.groups(f,state.heatDimension),ids=['fruit','vegetables','beans','ultra','sugary','obesity','networkWater','treatedWater','higherEducation'];
  const label=id=>({fruit:'Frutas',vegetables:'Hortaliças',beans:'Feijão',ultra:'Ultraprocessados',sugary:'Refrigerante',obesity:'IMC ≥ 30',networkWater:'Água da rede',treatedWater:'Tratamento doméstico da água',higherEducation:'Superior completo'})[id];
  const cells=ids.map(id=>`<tr><th>${e(label(id))}</th>${rows.map(r=>{const st=r.estimates?.[id],v=st?.pct,t=v==null?0:v/100,bg=v==null?'#eef1ed':`rgb(${Math.round(241-215*t)},${Math.round(246-141*t)},${Math.round(237-155*t)})`,tip=`${r.label}: ${metricLabel(id)} · ${v==null?'estimativa indisponível':pct(v)+'; IC95% '+decimal(st.low)+' a '+decimal(st.high)+'%; n válido '+num(st.nValid)}`;return `<td><button class="heatmap-cell" style="background:${bg};color:${v!=null&&v>85?'#fff':'#15382f'}" data-heat-cell="${e(id+'|'+r.id)}" title="${e(tip)}" aria-label="${e(tip)}">${pct(v)}</button></td>`;}).join('')}</tr>`).join('');
  return panel('Onde os perfis se encontram?','Mapa de calor: cada célula é o percentual dentro do grupo',`<div class="table-scroll"><table class="heatmap-table"><thead><tr><th>Característica</th>${rows.map(r=>`<th>${e(r.label)}</th>`).join('')}</tr></thead><tbody>${cells}</tbody></table></div><div class="heatmap-key"><span>Menor proporção</span><span class="legend-ramp"></span><span>Maior proporção</span></div><p class="graph-hint">Selecione uma célula para ver a definição, o intervalo de confiança e o número de respostas válidas. A intensidade da cor representa proporção, não gravidade ou risco.</p>`,`<select id="heat-dimension" class="slim-select" aria-label="Estratificação do mapa de calor">${Object.entries(dimensions).map(([k,v])=>option(k,v,state.heatDimension)).join('')}</select>`,'Recortes pequenos permanecem visíveis e inconclusivos. Um traço indica que não há respostas válidas para o indicador.');
}
  function cohortComparison() {
  const f=getFilters(),yes=D.aggregate({...f,cohort:'ovarian'}),no=D.aggregate({...f,cohort:'no_ovarian'});
  const id=state.nutritionMetric,ys=yes.estimates?.[id],ns=no.estimates?.[id];
  return panel('O perfil muda entre mulheres com e sem relato de ovário?',e(metricLabel(id))+' · comparação descritiva no mesmo recorte',relationshipBars([{label:'Com relato de ovário',sub:yes.n==null?'Contagem indisponível':`n = ${num(yes.n)} entrevistadas`,stat:ys},{label:'Sem relato de ovário',sub:no.n==null?'Contagem indisponível':`n = ${num(no.n)} entrevistadas`,stat:ns,color:'#8baa89'}])+`<p class="graph-hint">A dieta foi registrada na entrevista e pode ter mudado depois do diagnóstico. A comparação não estima efeito protetor, risco futuro nem causalidade. Grupos pequenos mostram n real e estimativas exploratórias e inconclusivas.</p>`,tag('Exploratório'),'O indicador acompanha o seletor alimentar acima. A população de comparação é calculada diretamente na PNS.');
}
  function empty(title='Sem observações válidas neste recorte',text='A fonte não contém respostas válidas para esta seleção. Experimente outro território ou faixa etária. Ausência de dado não significa ausência da característica.',n=null){
    return `<div class="empty-state"><div class="empty-symbol">${icon('database',23)}</div><h3>${title}</h3><p>${text}</p>${n!=null?`<small>${num(n)} entrevistadas neste recorte</small>`:''}</div>`;
  }
  function cohortBar(){return `<div class="cohort-bar">${icon('sliders',15)}<span>População da análise</span><select id="cohort-select" aria-label="População da análise">${option('all','Todas as mulheres adultas',state.cohort)}${option('ovarian','Com relato de câncer de ovário',state.cohort)}${option('no_ovarian','Sem relato de câncer de ovário',state.cohort)}</select><button class="help" data-action="cohort-help">${icon('info',13)} Como esse recorte funciona</button></div>`;}

  function sampleNotice(a) {
    if(!a || !a.n)return '';
    if(a.n<30||a.quality==='inconclusive')return `<div class="sample-notice" role="status">${icon('info',19)}<div><strong>Resultado exploratório e inconclusivo</strong><p><b>${num(a.n)} entrevistadas neste recorte.</b> Os valores disponíveis são exibidos com o número de respostas. A pequena amostra ou a alta incerteza impedem uma conclusão confiável. Os percentuais usam pesos amostrais; 0% ou 100% observados não significam certeza na população.</p></div></div>`;
    return `<div class="sample-strip">${icon('users',15)}<span><strong>${num(a.n)} entrevistadas no recorte</strong> · cada indicador mostra seu próprio n válido e IC95%.</span>${a.quality==='caution'?tag('Interpretar com cautela','neutral'):''}</div>`;
  }
  function dateBR(value) {if(!value)return state.lang==='en'?'Not reported':'Não informado';const [y,m,d]=value.split('-');return state.lang==='en'?`${y}-${m}-${d}`:`${d}/${m}/${y}`;}
  function institutionalStrip() {
    const d=D.fundingData,p=d.project;
    return `<section class="institutional-strip" aria-label="Apoio à pesquisa FAPESP PIPE Fase 2"><a class="fapesp-logo" href="${e(p.source_url)}" target="_blank" rel="noopener noreferrer" aria-label="Projeto na Biblioteca Virtual da FAPESP"><img src="${e(d.logo)}" alt="FAPESP" width="148" height="83"></a><div class="institutional-copy"><span>APOIO À PESQUISA</span><strong>FAPESP · PIPE Fase 2</strong><p>Marie.AI · Processo ${e(p.process)} · ${dateBR(p.start)} a ${dateBR(p.end)}</p></div><button class="button ghost" data-page="research">Projetos e ${num(d.scholarships.length)} bolsas ${icon('arrow',13)}</button></section>`;
  }
  function nutritionTabs() {
    return `<div class="view-tabs nutrition-tabs" aria-label="Origem da análise alimentar">${[['br','Brasil · PNS','users'],['uk','Reino Unido · UK Biobank','book'],['compare','Brasil + Reino Unido','compare']].map(([id,label,ic])=>`<button data-nutrition-source="${id}" class="${state.nutritionSource===id?'active':''}" aria-pressed="${state.nutritionSource===id}">${icon(ic,16)}${label}</button>`).join('')}</div>`;
  }
  function nutrition() {
    return nutritionTabs()+(state.nutritionSource==='uk'?ukNutrition():state.nutritionSource==='compare'?integratedNutrition():nutritionBrazil());
  }
  function ukMainEvidence() {
    const d=D.ukData;
    return panel('Alimentação e câncer de ovário: o que foi observado?','UK Biobank · Reino Unido, Europa · associações prospectivas ajustadas',forestPlot(d.effects),tag('Estudo publicado'),`Cada aumento de 10 pontos percentuais de ultraprocessados no peso total da dieta. <a href="${e(d.full_text_url)}" target="_blank" rel="noopener noreferrer">Chang et al., 2023 · tabelas 2 e 3 ${icon('external',11)}</a>`)+`<div class="reading-card"><strong>Como ler: HR 1,19 corresponde a uma taxa instantânea estimada 19% maior na comparação do estudo.</strong><p>HR 1,30 corresponde a 30% maior na análise de mortalidade. Esses valores são associações ajustadas da coorte britânica. Não significam 19 ou 30 casos adicionais em cada 100 mulheres. O incremento é de <b>10 pontos percentuais do peso da dieta</b>, incluindo bebidas; o estudo principal não usa percentual de calorias.</p></div>`;
  }
  function ukQuartilePanel() {
    const d=D.ukData,endpoint=state.ukEndpoint,incidence=endpoint==='incidence';
    const effects=d.quartiles.rows.map(r=>({title:r.label+' · '+r.range_published,effect_measure:'HR ajustado vs Q1',year:2023,effect:r['ovarian_'+endpoint].hr,low:r['ovarian_'+endpoint].low,high:r['ovarian_'+endpoint].high,reference:r['ovarian_'+endpoint].reference}));
    return panel('O que muda entre os grupos de consumo?',`${incidence?'Incidência':'Mortalidade'} por câncer de ovário · ${num(d.cohort.n_female)} mulheres`,forestPlot(effects)+`<p class="graph-hint">${incidence?'No maior quartil, o HR é 1,45 (IC95% 0,98–2,15). Esse intervalo inclui 1: a comparação Q4 versus Q1 permanece inconclusiva. Ela é diferente da análise contínua por incremento de 10 pontos percentuais.':'No maior quartil, o HR é 1,91 (IC95% 1,08–3,39). Trata-se de óbito por ovário no seguimento da coorte; não é uma análise de sobrevida entre as mulheres já diagnosticadas.'}</p>`,`<select id="uk-endpoint" class="slim-select" aria-label="Desfecho no estudo britânico">${option('incidence','Novos casos de ovário',endpoint)}${option('mortality','Óbitos por ovário',endpoint)}</select>`,'Q1 é a referência do estudo. Não há um intervalo estimado para a referência fixada em 1.');
  }
  function ukProfileDefinitions() {
    return {fruit_mean_g_day:{label:'Frutas',unit:'g/dia',type:'mean',sd:'fruit_sd_g_day'},vegetables_mean_g_day:{label:'Hortaliças',unit:'g/dia',type:'mean',sd:'vegetables_sd_g_day'},upf_weight_mean_pct:{label:'Ultraprocessados no peso da dieta',unit:'%',type:'mean',sd:'upf_weight_sd_pct'},university_degree_published_pct:{label:'Formação universitária',unit:'%',type:'proportion'},bmi_ge30_published_pct:{label:'IMC ≥ 30',unit:'%',type:'proportion'}};
  }
  function ukProfilePanel(profile=state.ukProfile,interactive=true) {
    const d=D.ukData,defs=ukProfileDefinitions(),def=defs[profile]||defs.fruit_mean_g_day,rows=d.quartiles.rows,maximum=Math.max(...rows.map(r=>r[profile]),1)*1.08;
    const format=v=>def.unit==='%'?pct(v):decimal(v,1)+' g/dia';
    const selectedRow=rows.find(r=>r.id===state.ukQuartile)||rows[0];
    const chart=`<div class="uk-profile-bars">${rows.map(r=>`<button class="uk-profile-row ${r.id===state.ukQuartile?'selected':''}" data-uk-quartile="${r.id}" aria-pressed="${r.id===state.ukQuartile}"><span><strong>${e(r.label)}</strong><small>${e(r.range_published)} de UPF por peso</small></span><span class="uk-profile-track"><i style="width:${r[profile]/maximum*100}%"></i></span><b>${format(r[profile])}</b><small class="uk-profile-count">n = ${num(r.n_all_participants)} participantes${def.sd?' · DP '+decimal(r[def.sd])+' '+def.unit:''}</small></button>`).join('')}</div>`;
    return panel('Como a alimentação e o contexto se relacionam?',`Perfil por quartil de ultraprocessados · ${e(def.label)}`,chart+`<div class="reading-card"><strong>${e(selectedRow.label)} selecionado</strong><p>${e(def.label)}: <b>${format(selectedRow[profile])}</b>${def.type==='mean'?' em média':''}. O grupo contém ${num(selectedRow.n_all_participants)} participantes, incluindo ${num(selectedRow.n_female)} mulheres. ${def.sd?'DP indica a dispersão publicada; não é intervalo de confiança.':''}</p></div><p class="graph-hint"><b>Este gráfico descreve a coorte completa: homens e mulheres.</b> A Tabela 1 não publica esses perfis exclusivamente para mulheres com câncer de ovário. Os modelos de câncer apresentados acima usam somente mulheres.</p>`,interactive?`<select id="uk-profile" class="slim-select" aria-label="Perfil alimentar ou social no UK Biobank">${Object.entries(defs).map(([id,m])=>option(id,m.label,profile)).join('')}</select>`:tag('Perfil publicado'),'Fonte: Tabela 1 de Chang et al., 2023. Selecione uma linha para inspecionar os números publicados.');
  }
  function ukNutrition() {
    const d=D.ukData;
    return `<section class="international-hero"><div><span class="onehealth-label">REINO UNIDO · EUROPA</span><h2>UK Biobank: alimentação acompanhada ao longo do tempo</h2><p>Resultados agregados publicados em uma coorte prospectiva. A análise distingue novos casos de câncer de ovário e óbitos por essa causa.</p></div>${tag('Chang et al. · 2023')}</section>
    <div class="kpi-grid">${kpi('Mulheres nos modelos de ovário',num(d.cohort.n_female),'Coorte de 197.426 participantes no estudo','users',true)}${kpi('Novos casos de ovário',num(d.ovarian.incidence.cases),'Casos registrados durante o seguimento','database')}${kpi('Óbitos por ovário',num(d.ovarian.mortality.deaths),'Causa básica de morte na coorte','heart')}${kpi('Seguimento mediano','9,8','Anos · coorte completa do estudo','clock')}</div>
    ${ukMainEvidence()}${ukQuartilePanel()}${ukProfilePanel()}
    ${panel('O que esses dados permitem interpretar?','População, período e ajustes do estudo',`<div class="grid-equal study-methods"><div class="text-block"><h3>De onde vêm os dados</h3><p>UK Biobank: Inglaterra, País de Gales e Escócia, com recrutamento geral aos 40–69 anos. Alimentação registrada por recordatórios de 24 horas entre 2009 e 2012. A coorte não representa toda a Europa nem a população brasileira.</p><h3>O que está integrado aqui</h3><p>Tabelas e resultados publicados, com valores, intervalos e fontes verificáveis. Os microdados individuais do UK Biobank exigem acesso aprovado e não estão incluídos neste projeto.</p></div><div class="text-block"><h3>Associações ajustadas</h3><p>Modelos de Cox consideram idade, fatores sociais, tabagismo, atividade física, álcool, IMC, energia e outros ajustes do artigo. Os modelos femininos também incluem menopausa, contraceptivos orais, terapia hormonal e paridade.</p><h3>O que continua incerto</h3><p>O desenho é observacional. Erros de medida, seleção e fatores não controlados podem influenciar os resultados. Os 143 óbitos não devem ser divididos pelos 291 casos para estimar letalidade.</p></div></div>`,`<a class="button ghost" href="${e(d.full_text_url)}" target="_blank" rel="noopener noreferrer">Artigo e suplemento ${icon('external',12)}</a>`)}
    <div class="explore-strip"><div><h3>Como isso conversa com a população brasileira?</h3><p>Explore perfis da PNS e as associações britânicas, com suas diferenças visíveis.</p></div><button class="button primary" data-nutrition-source="compare">Brasil + Reino Unido ${icon('arrow',13)}</button></div>`;
  }
  function integratedNutrition() {
    const f=getFilters(true),a=D.aggregate(f),id=state.nutritionMetric,groupRows=D.groups(f,state.heatDimension);
    const profiles={fruit:'fruit_mean_g_day',vegetables:'vegetables_mean_g_day',ultra:'upf_weight_mean_pct',obesity:'bmi_ge30_published_pct',higherEducation:'university_degree_published_pct'};
    return `<section class="international-hero"><div><span class="onehealth-label">BRASIL + REINO UNIDO · LEITURA INTEGRADA</span><h2>Estratificar aqui. Ampliar a leitura com evidência externa.</h2><p>Estratificamos a população feminina brasileira, incluindo mulheres com e sem relato de câncer de ovário, e comparamos seus perfis alimentares com as associações observadas no UK Biobank.</p></div></section>
    ${callout('<strong>Como essa integração funciona:</strong> os cruzamentos individuais ocorrem dentro da PNS. Os resultados britânicos acrescentam uma comparação científica externa. As duas bases não foram ligadas por pessoa, e suas medidas alimentares têm unidades diferentes.','compare')}
    ${cohortBar()}${sampleNotice(a)}
    <div class="analysis-controls"><div class="control-group"><label for="nutrition-metric">Característica brasileira</label><select id="nutrition-metric">${metricOptions(id)}</select></div><div class="control-group"><label for="heat-dimension">Estratificar por</label><select id="heat-dimension">${Object.entries({age:'Faixa etária',income:'Renda',education:'Escolaridade',race:'Raça ou cor'}).map(([k,v])=>option(k,v,state.heatDimension)).join('')}</select></div></div>
    ${cohortComparison()}
    ${panel('Em quais grupos brasileiros a característica aparece?',e(metricLabel(id))+' · '+e(territory(state.uf))+' · PNS 2019',relationshipBars(groupRows.map(r=>({label:r.label,sub:`n = ${num(r.n)} entrevistadas`,stat:r.estimates?.[id]}))),tag('Estratificação brasileira'),'Os filtros de território, idade e população aplicam-se aos resultados brasileiros. Pequenos grupos permanecem exploratórios e inconclusivos.')}
    ${ukMainEvidence()}${profiles[id]?ukProfilePanel(profiles[id],false):callout('O estudo britânico integrado não publica uma medida comparável a este indicador da PNS. As associações com ultraprocessados continuam disponíveis acima.','book')}
    ${panel('Duas fontes, perguntas complementares','O gestor consegue comparar os contextos sem trocar seus denominadores',`<div class="table-scroll"><table class="data-table source-comparison"><thead><tr><th>Aspecto</th><th>Brasil · PNS 2019</th><th>Reino Unido · UK Biobank</th></tr></thead><tbody><tr><th>População</th><td>Mulheres de 18 anos ou mais, com e sem relato de ovário</td><td>107.919 mulheres nos modelos de ovário; perfis alimentares publicados para a coorte completa</td></tr><tr><th>Ultraprocessados</th><td>5+ de 10 grupos no dia anterior</td><td>Percentual do peso total da dieta</td></tr><tr><th>Frutas</th><td>Consumo em 5+ dias por semana</td><td>Média em gramas/dia por quartil de UPF na coorte completa</td></tr><tr><th>Ovário</th><td>Relato atual ou passado na entrevista</td><td>Novos casos e óbitos durante seguimento</td></tr><tr><th>Medida</th><td>Percentual ponderado, n real e IC95%</td><td>HR ajustado e IC95%; perfis publicados</td></tr><tr><th>Uso de gestão</th><td>Localizar perfis, desigualdades e lacunas de informação</td><td>Contextualizar hipóteses com evidência prospectiva externa</td></tr></tbody></table></div>`)}
    ${cohortNotes()}`;
  }
  function researchPage() {
    const d=D.fundingData,p=d.project;
    const projectCard=(r,main=false)=>`<article class="project-card ${main?'featured':''}"><div class="source-card-head">${tag(main?'PIPE Fase 2':'Projeto vinculado',main?'':'neutral')}<span class="process-number">Processo ${e(r.process)}</span></div><h3>${e(r.title)}</h3><dl class="funding-details"><div><dt>Vigência</dt><dd>${dateBR(r.start)} a ${dateBR(r.end)}</dd></div><div><dt>Pesquisadora responsável</dt><dd>${e(r.principal_investigator)}</dd></div><div><dt>Empresa</dt><dd>${e(r.company||p.company)}</dd></div></dl><a href="${e(r.source_url)}" target="_blank" rel="noopener noreferrer">Consultar auxílio na FAPESP ${icon('external',12)}</a></article>`;
    return `<section class="research-hero"><div class="research-brand"><img src="${e(d.logo)}" alt="FAPESP" width="220" height="123"></div><div><span class="eyebrow">PESQUISA INOVATIVA EM PEQUENAS EMPRESAS</span><h2>Marie.AI · PIPE II</h2><p>Plataforma Multimodal de Saúde da Mulher</p><strong>Pesquisadora responsável: ${e(p.principal_investigator)}</strong></div></section>
    <div class="kpi-grid">${kpi('Projeto em destaque','PIPE II','Segunda fase do programa FAPESP','spark',true)}${kpi('Processo principal',e(p.process),'Auxílio à pesquisa','clipboard')}${kpi('Projetos apresentados',num(1+d.linked_projects.length),'Auxílio principal e projeto vinculado','network')}${kpi('Bolsas vinculadas',num(d.scholarships.length),'Bolsas no país · TT e PIPE','users')}</div>
    <div class="grid-equal">${projectCard(p,true)}${d.linked_projects.map(r=>projectCard(r)).join('')}</div>
    ${panel('Bolsas vinculadas à pesquisa','Beneficiárias e beneficiários, processos e vigências próprias',`<div class="scholarship-list">${d.scholarships.map((r,i)=>`<article class="scholarship-card"><span class="scholarship-order">0${i+1}</span><div><div class="scholarship-meta">${tag(r.modality_code||r.modality,'neutral')}<span>Processo ${e(r.process)}</span></div><h3>${e(r.title)}</h3><p><strong>${e(r.beneficiary)}</strong></p><p>Vigência: ${dateBR(r.start)} a ${dateBR(r.end)}</p><a href="${e(r.source_url)}" target="_blank" rel="noopener noreferrer">Ficha da bolsa na FAPESP ${icon('external',11)}</a></div></article>`).join('')}</div>`,tag('5 registros verificados'),`Fonte: Biblioteca Virtual da FAPESP · conferência ${dateBR(d.reviewed_at)}. As vigências são as publicadas em cada ficha.`)}
    ${callout('<strong>Identificação institucional da pesquisa.</strong> Os processos e bolsas são apresentados conforme as fichas da FAPESP. Os resultados estatísticos e suas interpretações neste observatório são de responsabilidade da equipe do projeto.','info')}`;
  }
  function riskPage() {
    const d=D.riskData,directions={increased:'Associado a maior risco',decreased:'Associado a menor risco',uncertain:'Evidência ainda inconclusiva',context:'Contexto populacional'};
    const rows=d.items.filter(r=>(state.riskCategory==='all'||r.category===state.riskCategory)&&(state.riskDirection==='all'||r.direction===state.riskDirection));
    const category=id=>d.categories.find(x=>x.id===id)?.label||id;
    return `<section class="risk-definition"><div class="risk-definition-icon">${icon('shield',27)}</div><div><span class="eyebrow">FATOR DE RISCO</span><h2>Uma característica associada a maior probabilidade de adoecer.</h2><p>${e(d.definition)}</p></div></section>
    <div class="risk-legend">${Object.entries(directions).map(([id,label])=>`<button data-risk-direction="${id}" class="risk-key ${id} ${state.riskDirection===id?'selected':''}"><i></i>${label}</button>`).join('')}</div>
    <div class="analysis-controls"><div class="control-group"><label for="risk-category">Domínio do fator</label><select id="risk-category">${option('all','Todos os domínios',state.riskCategory)}${d.categories.map(r=>option(r.id,r.label,state.riskCategory)).join('')}</select></div><div class="control-group"><label for="risk-direction">Sentido da evidência</label><select id="risk-direction">${option('all','Toda a evidência',state.riskDirection)}${Object.entries(directions).map(([k,v])=>option(k,v,state.riskDirection)).join('')}</select></div></div>
    ${panel('Fatores e disponibilidade dos dados','Tabela adaptada do documento técnico para o câncer de ovário',`<div class="table-scroll"><table class="data-table risk-table"><thead><tr><th>Fator / domínio</th><th>O que a evidência indica</th><th>O que está disponível no painel</th><th>Fonte</th></tr></thead><tbody>${rows.map(r=>`<tr data-risk-id="${e(r.id)}"><td><strong>${e(r.label)}</strong><small>${e(category(r.category))}</small></td><td><span class="risk-tag ${e(r.direction)}">${e(directions[r.direction])}</span><strong class="risk-evidence">${e(r.evidence)}</strong><p>${e(r.explanation)}</p></td><td><p>${e(r.measurement)}</p>${r.metric&&D.metrics.some(m=>m.id===r.metric)?`<button class="button ghost" data-risk-explore="${e(r.metric)}">Explorar indicador ${icon('arrow',11)}</button>`:''}</td><td>${r.source_urls.map((url,i)=>`<a href="${e(url)}" target="_blank" rel="noopener noreferrer">${r.source_urls.length>1?'Fonte '+(i+1):'Consultar'} ${icon('external',11)}</a>`).join('<br>')}</td></tr>`).join('')}</tbody></table></div>${rows.length?'':empty('Nenhum fator nesta combinação','Selecione outro domínio ou sentido da evidência.')}`,tag(num(rows.length)+' fatores'),'A ausência de uma informação no extrato não significa que o fator esteja ausente na pessoa ou no estado.')}
    <div class="grid-equal">${panel('Como usar para gestão','Da evidência à pergunta que pode ser respondida',`<div class="text-block"><h3>Estratificar o que foi medido</h3><p>Idade e IMC ajudam a descrever grupos brasileiros. Alimentação, renda, escolaridade e água acrescentam contexto e relações exploratórias. Cada proporção exibe a amostra que a sustenta.</p><h3>Reconhecer lacunas clínicas</h3><p>História familiar, variantes genéticas e exposições hormonais precisam de dados próprios. Não foi atribuída uma prevalência estadual a essas características.</p></div>`)}${panel('Fator de risco não é diagnóstico','Interpretação de evidências populacionais',`<div class="text-block"><p>Ter um fator não determina que uma mulher terá câncer. Não ter os fatores conhecidos também não exclui a doença.</p><p>Associações alimentares observacionais e indicadores de infraestrutura não são convertidos em pontos ou probabilidade individual de câncer. Resultados sobre menor risco não constituem indicação de medicamento ou procedimento.</p><p><a href="${sources.nci}" target="_blank" rel="noopener noreferrer">NCI · prevenção dos cânceres de ovário, tuba e peritônio</a></p></div>`)}</div>
    ${callout('<strong>Adaptação da tabela enviada:</strong> foram preservadas as colunas de fator, disponibilidade e regra de interpretação. As categorias originalmente voltadas ao câncer de mama foram revistas para ovário, com fontes específicas em cada linha.','book')}`;
  }

  function shell(content){
    const p=pages.find(p=>p.id===state.page);
    const international=state.page==='nutrition'&&state.nutritionSource==='uk';
    const showFilters=!['sources','evidence','research','risk'].includes(state.page)&&!international;
    const printScope=international?'Reino Unido · Europa · UK Biobank':showFilters?territory(state.uf)+' · '+(state.page==='care'?'Todas as idades':ageLabel()):p.label;
    const banner=state.page==='care'?'Óbitos SIM 2024 e casos novos estimados INCA 2026. Todas as idades.':state.page==='research'?'Biblioteca Virtual da FAPESP · processos, vínculos e vigências publicados.':state.page==='risk'?'Evidência específica para ovário · fatores clínicos, associações em estudo e contexto populacional.':international?'UK Biobank · resultados agregados publicados · Reino Unido, Europa.':state.page==='nutrition'&&state.nutritionSource==='compare'?'PNS 2019 + UK Biobank · os filtros brasileiros não alteram os resultados britânicos.':state.page==='evidence'?'Resultados científicos publicados. Não são estimativas da população brasileira.':state.page==='onehealth'?'PNS 2019 · água do Censo 2022 · IDHM 2019/2021. Cada medida preserva seu universo.':'PNS 2019 · estimativas ponderadas, n real e IC95%. Recortes pequenos são exploratórios e inconclusivos.';
    return `<div class="mobile-backdrop${state.mobile?' show':''}" data-action="mobile-close"></div><aside class="sidebar${state.mobile?' open':''}" aria-label="Navegação principal"><a class="brand marie-brand" href="#overview" data-page="overview" aria-label="Marie Câncer de Ovário · Visão executiva"><img src="assets/marie-logo.jpeg" alt="Marie Câncer de Ovário" width="190" height="154"></a><div class="nav-label">OBSERVATÓRIO</div><nav class="nav">${pages.map(p=>`<button data-page="${p.id}" class="${state.page===p.id?'active':''}"${state.page===p.id?' aria-current="page"':''}>${icon(p.icon,17)}${p.label}</button>`).join('')}</nav><div class="sidebar-bottom"><div class="sidebar-note">${icon('network',19)}<strong>Informação para cuidar melhor</strong><p>Uma visão da população e da rede, com o contexto que a gestão precisa.</p><a href="#sources" data-page="sources">Conheça a metodologia ${icon('arrow',12)}</a></div><div class="sidebar-profile"><div class="avatar">GS</div><div><div class="profile-name">Gestão de saúde</div><div class="profile-role">Visão estratégica</div></div>${icon('shield',14)}</div></div></aside><div class="shell"><header class="topbar"><button class="icon-button mobile-menu" data-action="mobile" aria-label="Abrir navegação">${icon('menu',19)}</button><div class="breadcrumb"><span>Observatório</span>${icon('chevron',11)}<strong>Câncer de ovário</strong></div><div class="topbar-right"><div class="lang-switch" role="group" aria-label="Idioma / Language"><button type="button" data-lang="pt" aria-pressed="${state.lang==='pt'}" title="Português">PT</button><button type="button" data-lang="en" aria-pressed="${state.lang==='en'}" title="English">EN</button></div><span class="live-pill"><i class="status-dot"></i> Dados reais</span><span class="version">STREAMLIT</span><button class="icon-button" data-action="about" aria-label="Sobre este observatório">${icon('info',18)}</button></div></header><main class="main" id="content" tabindex="-1">${institutionalStrip()}<div class="page-heading"><div><div class="eyebrow"><i class="status-dot"></i>${p.label}</div><h1>${p.title}</h1><p>${p.sub}</p></div><div class="heading-actions">${btn('Exportar recorte','export','download')}${btn(`Minha pauta${agenda.length?` <span class="count">${agenda.length}</span>`:''}`,'agenda','clipboard','primary')}</div></div><div class="print-title">Marie Câncer de Ovário · ${e(printScope)}</div>${showFilters?`<div class="filters"><label class="filter-field">${icon('pin',15)}<span>Território</span><select id="uf-select" aria-label="Selecionar território">${ufs(state.uf)}</select></label>${state.page!=='care'?`<label class="filter-field">${icon('users',15)}<span>Faixa etária</span><select id="age-select" aria-label="Selecionar faixa etária">${option('all','Todas as idades · 18+',state.age)}${D.ages.map(a=>option(a.id,a.label,state.age)).join('')}</select></label>`:``}<button class="filter-reset" data-action="reset">${icon('reset',12)} Limpar</button><span class="filter-count">${icon('sliders',12)}${state.uf==='BR'?'27 UFs':e(state.uf)} · ${state.page==='care'?'Todas as idades':e(ageLabel())}</span></div>`:''}<div class="demo-banner real-banner">${icon('database',14)}<span><strong>Dados reais, com fonte e período.</strong> ${e(banner)}</span><button data-action="demo-info">Entenda os dados</button></div>${content}<footer class="page-foot"><span>Marie Câncer de Ovário · Observatório de população e atenção oncológica</span><a href="#sources" data-page="sources">Fontes transparentes. Interpretações responsáveis.</a></footer></main></div>`;
  }
  function bars(rows,field='women',type='number',action='age'){
    const values=rows.map(r=>field in r?r[field]:r.rates?.[field]);
    if(values.every(v=>v==null))return empty();
    const w=540,h=200,left=37,right=12,top=23,bottom=35,plotH=h-top-bottom,max=Math.max(...values.map(v=>v||0),1)*1.13,barSpace=(w-left-right)/Math.max(rows.length,1),barW=Math.min(36,barSpace*.56);
    const f=v=>type==='percent'?`${Math.round(v)}%`:compact(v);
    let svg=`<svg class="bar-chart" viewBox="0 0 ${w} ${h}" role="group" aria-label="${e(field==='women'?'População feminina por idade · PNS 2019':field==='deaths'?'Óbitos por câncer de ovário · SIM 2024':metricLabel(field))}">`;
    [0,.5,1].forEach(t=>{const y=top+plotH*(1-t);svg+=`<line class="chart-grid" x1="${left}" x2="${w-right}" y1="${y}" y2="${y}"/><text class="chart-tick" x="${left-7}" y="${y+3}" text-anchor="end">${e(f(max*t))}</text>`;});
    rows.forEach((r,i)=>{const v=values[i],bh=(v||0)/max*plotH,x=left+barSpace*i+(barSpace-barW)/2,y=top+plotH-bh;const clickable=action==='age'&&D.ages.some(a=>a.id===r.id);svg+=`<g${clickable?` data-age="${e(r.id)}" tabindex="0" role="button" aria-label="Filtrar ${e(r.label)}"`:''}><rect x="${x}" y="${y}" width="${barW}" height="${v==null?0:Math.max(bh,1)}" rx="4" class="chart-bar${r.id===state.age?' selected':''}"/><text class="chart-bar-value" x="${x+barW/2}" y="${y-7}" text-anchor="middle">${v==null?'—':e(f(v))}</text><text class="chart-label" x="${x+barW/2}" y="${h-14}" text-anchor="middle">${e(r.id==='80+'?'80+':r.id)}</text><title>${e(r.label)}: ${e(v==null?'não disponível':type==='percent'?pct(v):num(v))}</title></g>`;});
    return svg+'</svg>';
  }
  function hbars(items,max=100){return items.map(i=>`<div class="hbar-row"><div class="hbar-label">${i.label}${i.sub?`<small>${i.sub}</small>`:''}</div><div class="hbar-track"><div class="hbar-fill" style="width:${i.value==null?0:Math.min(100,i.value/max*100)}%;${i.color?`background:${i.color}`:''}"></div></div><div class="hbar-value">${i.value==null?'—':i.format==='number'?compact(i.value):pct(i.value)}</div></div>`).join('');}
  function metricValue(row,metric,absolute=false){if(metric==='women'){const total=D.aggregate({uf:'BR',age:state.age,cohort:'all'}).women;return absolute?row.women:row.women!=null&&total?row.women/total*100:null;}if(metric==='mortalityRate')return absolute?row.deaths:row.mortalityRate;if(metric==='admissions')return absolute?row.admissions:row.women?row.admissions/row.women*100000:null;const p=row.rates?.[metric];return absolute?row.estimates?.[metric]?.weightedYes??null:p;}
  function mapBlock(metric='ultra',mode='relative'){
    const all=D.groups({uf:'BR',age:state.age,cohort:'all'},'state'),absolute=mode==='absolute',values=all.map(r=>metricValue(r,metric,absolute)).filter(v=>v!=null),lo=values.length?Math.min(...values):null,hi=values.length?Math.max(...values):null;
    const fmt=v=>absolute?compact(v):metric==='mortalityRate'||metric==='admissions'?decimal(v):pct(v);
    const col=v=>{const t=hi>lo?(v-lo)/(hi-lo):.5,a=[233,243,227],b=[34,116,88];return `rgb(${a.map((x,i)=>Math.round(x+(b[i]-x)*t)).join(',')})`;};
    const valByUF=Object.fromEntries(all.map(r=>[r.id,metricValue(r,metric,absolute)]));
    let map='';
    if(geometry){
      const project=pt=>[25+(pt[0]+74)*9.1,15+(5.6-pt[1])*9.1];
      const path=coords=>coords.map(ring=>ring.map((pt,i)=>{const p=project(pt);return(i?'L':'M')+p.map(x=>x.toFixed(1)).join(' ');}).join(' ')+'Z').join(' ');
      map=`<svg class="brazil-map" viewBox="0 0 420 380" role="group" aria-label="Mapa do Brasil por unidade da federação. Selecione um estado para filtrar.">`;
      geometry.features.forEach(f=>{const s=D.states.find(s=>s.code===String(f.properties.codarea));if(!s)return;const polys=f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.coordinates;const v=valByUF[s.uf];map+=`<path class="uf${state.uf===s.uf?' selected':''}" d="${polys.map(path).join(' ')}" fill="${v==null?'#edf1e8':col(v)}" data-uf="${s.uf}" data-tip="${e(s.name)}|${e(fmt(v))}" role="button" tabindex="0" aria-label="${e(s.name)}: ${e(fmt(v))}. Selecionar território."><title>${e(s.name)}: ${e(fmt(v))}</title></path>`;});
      const centers={AC:[-70.6,-9.5],AM:[-64,-4],RR:[-61,2],AP:[-51.6,1.4],PA:[-53.3,-4.5],RO:[-63,-11],TO:[-48.3,-10],MA:[-45,-5],PI:[-42.7,-7.4],CE:[-39.7,-5],RN:[-36.5,-5.5],PB:[-36.8,-7.25],PE:[-37.9,-8.7],AL:[-36.6,-9.65],SE:[-37.4,-10.6],BA:[-42,-12.6],MT:[-56,-13],MS:[-54.5,-20.4],GO:[-50.2,-16],MG:[-45,-18.6],ES:[-40.5,-19.6],RJ:[-42.9,-22.6],SP:[-49,-22.3],PR:[-51.3,-24.7],SC:[-50.4,-27],RS:[-53,-30]};
      Object.entries(centers).forEach(([uf,pt])=>{const p=project(pt);map+=`<text class="map-label" x="${p[0]}" y="${p[1]}">${uf}</text>`;});
      const df=project([-47.9,-15.8]);map+=`<circle cx="${df[0]}" cy="${df[1]}" r="4" fill="${valByUF.DF==null?'#edf1e8':col(valByUF.DF)}" stroke="white" stroke-width="1.3" data-uf="DF" role="button" tabindex="0" aria-label="Selecionar Distrito Federal" data-tip="Distrito Federal|${fmt(valByUF.DF)}"/><text class="map-label" x="${df[0]+8}" y="${df[1]-3}">DF</text></svg>`;
    }else map=`<div class="uf-tiles" aria-label="Unidades da federação">${D.states.map(s=>`<button class="uf-tile" data-uf="${s.uf}" style="background:${valByUF[s.uf]==null?'#edf1e8':col(valByUF[s.uf])}" title="${e(s.name)}: ${fmt(valByUF[s.uf])}">${s.uf}</button>`).join('')}</div>`;
    const scope=D.aggregate(getFilters());const vv=metricValue(scope,metric,absolute);const unit=absolute?'número absoluto':metric==='mortalityRate'||metric==='admissions'?'por 100 mil mulheres':metric==='women'?'da população PNS nacional':'proporção ponderada · PNS 2019';
    return `<div class="map-wrap"><div class="map-summary"><span>${e(territory(state.uf))}</span><strong>${e(fmt(vv))}</strong><span>${unit}</span></div>${map}<div class="map-note">${icon('pin',15)}Selecione uma UF<br>para explorar</div></div><div class="map-legend"><span>${e(fmt(lo))}</span><div class="legend-ramp"></div><span>${e(fmt(hi))}</span></div>`;
  }
  function insights() {
  const a=D.aggregate(getFilters()),scope=territory(state.uf);
  return [
    {key:'nutrition',title:'Entender o perfil alimentar',text:a.rates.ultra==null?`O recorte de ${scope} não permite estimar este indicador com a precisão adotada. Amplie o grupo para explorar.`:`Na PNS 2019, ${pct(a.rates.ultra)} das mulheres deste recorte relataram 5+ grupos de ultraprocessados no dia anterior. Compare idade, renda e escolaridade.`,label:'Alimentação e contexto',source:'IBGE · PNS 2019',page:'nutrition',tone:''},
    {key:'evidence',title:'Ler a evidência sobre cítricos',text:'O estudo com 171.940 mulheres encontrou um sinal para flavanonas. Laranja e suco, analisados isoladamente, não apresentaram associação significativa.',label:'Evidência científica',source:'Cassidy et al., 2014 · NHS / NHS II',page:'evidence',tone:'amber'},
    {key:'context',title:'Uma perspectiva One Health',text:'Conecte saúde da mulher e alimentação à discussão sobre sistemas alimentares, animais e ambiente. Veja quais dimensões já estão medidas.',label:'Saúde integrada',source:'OMS · abordagem One Health; PNS, Censo e PNUD no painel',page:'onehealth',tone:''}
  ];
}
  function insightsPanel(){return `<section class="panel insights-panel"><div class="panel-header"><div><h2 class="panel-title">Leituras para a gestão</h2><p class="panel-sub">Perguntas apoiadas pelos dados e pela literatura</p></div>${icon('spark',17)}</div><div class="insight-list">${insights().map((i,k)=>{const saved=agenda.some(a=>a.id===`${i.key}-${state.uf}-${state.age}`);return `<article class="insight"><div class="insight-top"><span class="priority-marker ${i.tone}"><i></i>${i.label}</span><span>0${k+1}</span></div><h3>${i.title}</h3><p>${e(i.text)}</p><div class="insight-action"><button data-page="${i.page}">Explorar ${icon('arrow',11)}</button><button data-save="${i.key}" class="${saved?'saved':''}">${icon(saved?'check':'plus',11)}${saved?'Na pauta':'Salvar na pauta'}</button></div></article>`;}).join('')}</div></section>`;}
  function overview() {
  const a=D.aggregate(getFilters()),ag=D.groups({...getFilters(),age:'all'},'age');
  const mapTitle=state.mapMetric==='women'?'A distribuição da população':'Perfil da população no território';
  return `<section class="onehealth-hero"><div><span class="onehealth-label">${icon('network',13)} PERSPECTIVA ONE HEALTH</span><h2>Saúde da mulher, alimentação e território.</h2><p>Uma visão integrada para a gestão do câncer de ovário, com dados reais e evidência científica.</p></div><button class="button" data-page="onehealth">Conheça a abordagem ${icon('arrow',13)}</button></section>
  <div class="kpi-grid">${kpi('População representada',compact(a.women),'Mulheres adultas · PNS 2019','users',true)}${kpi('Entrevistadas no recorte',num(a.n),'Amostra observada · não é incidência','database')}${kpi('5+ grupos de ultraprocessados',pct(a.rates.ultra),metricDetail(a,'ultra'),'leaf')}${kpi('Relato de câncer de ovário',e(String(D.ovarianN(getFilters())??'—')),'Entrevistadas na PNS · diagnóstico atual ou passado','heart')}</div>
  <div class="grid-main"><section class="panel"><div class="panel-header"><div><h2 class="panel-title">${mapTitle}</h2><p class="panel-sub">PNS 2019 · ${e(ageLabel())} · estimativas ponderadas</p></div><select id="map-metric" class="slim-select" aria-label="Indicador do mapa">${option('ultra','Ultraprocessados',state.mapMetric)}${option('fruit','Frutas',state.mapMetric)}${option('obesity','IMC ≥ 30',state.mapMetric)}${option('women','População',state.mapMetric)}</select></div>${mapBlock(state.mapMetric,'relative')}<div class="panel-foot"><span>Fonte: IBGE/PNS 2019 · malha: IBGE</span><span>Selecione uma UF para explorar</span></div></section>${insightsPanel()}</div>
  <div class="grid-equal">${panel('Uma população, diferentes idades','População estimada pela PNS, no ano de 2019',bars(ag),'','Selecione uma faixa para filtrar o perfil populacional.')}${panel('Um olhar sobre os hábitos','Percentual ponderado entre respostas válidas',relationshipBars(['fruit','vegetables','ultra'].map(id=>({label:metricLabel(id),stat:a.estimates[id]}))),`<button class="button ghost" data-page="nutrition">Ver relações ${icon('arrow',12)}</button>`,'O traço sobre a barra mostra o intervalo de confiança de 95%.')}</div>
  <div class="explore-strip"><div><span class="explore-strip-icon">${icon('network',20)}</span><div><h3>Como os hábitos se relacionam com o perfil da população?</h3><p>Escolha duas características e compare os grupos com uma leitura direta.</p></div></div><button class="button" data-page="cross">Abrir cruzamentos ${icon('arrow',13)}</button></div>`;
}
  function population() {
  const f=getFilters(true),a=D.aggregate(f),ageRows=D.groups({...f,age:'all'},'age'),incomes=D.groups(f,'income'),educations=D.groups(f,'education'),races=D.groups(f,'race');
  if(!a.n)return cohortBar()+panel('Perfil da população','PNS 2019 · mesmas entrevistadas',empty(undefined,undefined,a.n))+cohortNotes();
  const compare=D.aggregate({uf:state.compare,age:state.age,cohort:state.cohort});
  const compRows=['ultra','fruit','obesity'].map(id=>`<div class="comparison-section"><h3>${e(metricLabel(id))}</h3>${relationshipBars([{label:territory(state.uf),stat:a.estimates[id]},{label:territory(state.compare),stat:compare.estimates[id],color:'#8baa89'}])}</div>`).join('');
  return cohortBar()+sampleNotice(a)+`<div class="kpi-grid">${kpi('Entrevistadas',num(a.n),'Observações reais na amostra','users',true)}${kpi('População ponderada',compact(a.women),`PNS 2019 · IC95% ${compact(a.womenLow)}–${compact(a.womenHigh)}${a.n<30?' · inconclusivo':''}`,'database')}${kpi('Plano de saúde',pct(a.rates.healthPlan),metricDetail(a,'healthPlan'),'heart')}${kpi('IMC referido ≥ 30 kg/m²',pct(a.rates.obesity),metricDetail(a,'obesity'),'scale')}</div>
  <div class="grid-main">${panel('Distribuição por faixa etária',e(territory(state.uf))+(state.cohort==='ovarian'?' · número real de entrevistadas':' · população representada em 2019'),bars(ageRows,state.cohort==='ovarian'?'n':'women'),'','O filtro de idade afeta as demais distribuições.')}${panel('Comparar dois territórios','Mesmo grupo etário e mesma definição de indicador',compRows,`<select class="slim-select" id="compare-uf" aria-label="Território de comparação">${ufs(state.compare)}</select>`,'As diferenças são descritivas; a incerteza acompanha cada estimativa.')}</div>
  <div class="grid-equal">${panel('Composição por escolaridade','Distribuição dentro do recorte selecionado',relationshipBars(educations.map(r=>({label:r.label,stat:r.shareEstimate||{pct:r.share},sub:`n = ${num(r.n)}`}))))}${panel('Composição por raça ou cor','Categorias autorreferidas na PNS',relationshipBars(races.map(r=>({label:r.label,stat:r.shareEstimate||{pct:r.share},sub:`n = ${num(r.n)}`}))))}</div>
  ${panel('Renda e perfil alimentar','5+ grupos de ultraprocessados no dia anterior',relationshipBars(incomes.map(r=>({label:r.label,stat:r.estimates?.ultra,sub:`n = ${num(r.n)}`}))),tag('PNS 2019'),'A proporção é calculada dentro de cada faixa de renda, com o desenho amostral.')}${cohortNotes()}`;
}
  function cohortNotes(){return callout('<strong>Relato de ovário na PNS:</strong> o questionário distingue quem informou ter ou ter tido esse diagnóstico. A alimentação é observada no momento da entrevista; essa comparação descreve os perfis relatados, sem estabelecer o que foi consumido antes do câncer.');}
  function nutritionBrazil() {
  const f=getFilters(true),a=D.aggregate(f);
  if(!a.n)return cohortBar()+panel('Alimentação no recorte selecionado','PNS 2019 · disponibilidade de respostas',empty(undefined,undefined,a.n))+`<div class="explore-strip"><div><h3>As evidências internacionais continuam disponíveis</h3><p>O UK Biobank apresenta resultados publicados sobre alimentação e ovário.</p></div><button class="button primary" data-nutrition-source="uk">Abrir UK Biobank ${icon('arrow',13)}</button></div>`+cohortNotes();
  const defs={fruit:['Frutas','5+ dias por semana','leaf'],vegetables:['Hortaliças','5+ dias por semana','leaf'],beans:['Feijão','5+ dias por semana','leaf'],ultra:['Ultraprocessados','5+ grupos no dia anterior','chart'],sugary:['Refrigerante','5+ dias/semana · inclui diet/zero','activity'],obesity:['IMC referido ≥ 30','Peso e altura autorreferidos','scale']};
  const ages=D.groups({...f,age:'all'},'age'),income=D.groups(f,'income');
  return cohortBar()+sampleNotice(a)+`<div class="metric-tiles">${Object.entries(defs).map(([id,def])=>`<div class="metric-tile">${icon(def[2],18)}<h3>${def[0]}</h3><div class="number">${pct(a.rates[id])}</div><p>${def[1]}</p>${ci(a.estimates[id])}</div>`).join('')}</div>
  <div class="grid-main">${panel('Como o hábito varia com a idade?','Percentual em cada faixa etária · PNS 2019',relationshipBars(ages.map(r=>({label:r.label,sub:`n = ${num(r.n)} entrevistadas`,stat:r.estimates?.[state.nutritionMetric]}))),`<select id="nutrition-metric" class="slim-select" aria-label="Indicador alimentar">${metricOptions(state.nutritionMetric)}</select>`,'Selecione o indicador. Cada faixa mantém o percentual, o número de respostas e a incerteza.')}${panel('Como o hábito varia com a renda?',e(metricLabel(state.nutritionMetric)),relationshipBars(income.map(r=>({label:r.label,stat:r.estimates?.[state.nutritionMetric],sub:`n = ${num(r.n)}`}))),tag('Renda per capita'))}</div>
  ${heatmapPanel(f)}
  ${cohortComparison()}
  ${callout('<strong>Fruta em geral e cítrico específico são perguntas diferentes.</strong> A PNS utilizada mede frutas e suco natural, mas não isola laranja nem a ingestão de flavanonas. A aba Evidências apresenta os resultados dos estudos que mediram essas exposições.','book')}
  <div class="grid-equal">${panel('Duas características na mesma mulher','Coocorrência observada nos microdados',miniCross({...f,cohort:'all'}),`<button class="button ghost" data-page="cross">Explorar relações ${icon('arrow',12)}</button>`,'Neste cartão: todas as mulheres do território e faixa etária selecionados.')}${panel('Definições que ajudam a interpretar','Cada marcador responde a uma pergunta',`<ul class="details-list compact"><li><span>Frutas e hortaliças</span><strong>Frequência, não adequação nutricional</strong></li><li><span>Ultraprocessados</span><strong>Grupos consumidos ontem, não calorias</strong></li><li><span>Refrigerante</span><strong>Inclui diet/zero; não estima açúcar</strong></li><li><span>IMC referido</span><strong>Não é antropometria aferida</strong></li><li><span>Ovário</span><strong>Relato atual ou passado</strong></li></ul>`,`<a class="button ghost" href="${sources.pns}" target="_blank" rel="noopener noreferrer">Questionário ${icon('external',12)}</a>`,'Fonte: questionário e microdados oficiais da PNS 2019.')}</div>`;
}
  function miniCross(f) {
  const c=D.cross(f,'ultra','obesity'),yes=c.cells.find(x=>x.a&&x.b);
  return `<div class="stat-line"><div>5+ grupos de ultraprocessados<br>e IMC referido ≥ 30 kg/m²<small>As duas características na mesma entrevistada</small></div><strong>${pct(yes?.pct)}</strong></div>${ci(yes)}<div class="text-block mt-15"><p>A proporção é calculada diretamente nas entrevistadas com as duas respostas válidas. Não é o produto de duas prevalências nem uma probabilidade de câncer.</p></div>`;
}
  function matrix(c) {
    const cell=(a,b)=>{const v=c.cells.find(x=>x.a===a&&x.b===b);return `<div class="matrix-cell${a&&b?' dark':''}${v?.pct==null?' suppressed':''}"><strong>${v?.pct==null?'Indisponível':pct(v.pct)}</strong><span>${v?.pct==null?'Sem respostas válidas':num(v.n)+' entrevistadas observadas'}</span><small>${v?.pct==null?'':compact(v.women)+' representadas pelos pesos'}</small>${v?.pct!=null?ci(v):''}</div>`;};
    return `<div class="matrix"><div></div><div class="matrix-label">Sem B<br>${e(metricLabel(state.crossB))}</div><div class="matrix-label">Com B<br>${e(metricLabel(state.crossB))}</div><div class="matrix-label">Sem A<br>${e(metricLabel(state.crossA))}</div>${cell(false,false)}${cell(false,true)}<div class="matrix-label">Com A<br>${e(metricLabel(state.crossA))}</div>${cell(true,false)}${cell(true,true)}</div>`;
  }

  function conditionalPanel(c) {
  const y=c.conditional?.b_given_a_true,n=c.conditional?.b_given_a_false,labelA=metricLabel(state.crossA),labelB=metricLabel(state.crossB),difference=y?.pct!=null&&n?.pct!=null?y.pct-n.pct:null;
  const per=state.crossB==='ovarian'?10000:100;
  const frequency=v=>decimal(v/100*per,(v/100*per)<1?2:0);
  return panel('B aparece mais em qual grupo?',e(labelB)+' · percentual dentro de cada grupo de A',
    relationshipBars([{label:'Com a característica A',sub:labelA,stat:y},{label:'Sem a característica A',sub:labelA,stat:n,color:'#8baa89'}])+
    `<div class="reading-card"><strong>Leitura do gráfico</strong><p>${y?.pct!=null?`Entre cada ${num(per)} mulheres com a característica A, aproximadamente <b>${frequency(y.pct)}</b> também apresentam B.`:'O grupo com a característica A não tem respostas válidas para esta estimativa.'} ${n?.pct!=null?`No grupo sem A, são aproximadamente <b>${frequency(n.pct)} em cada ${num(per)}</b>.`:''}</p>${difference!=null?`<p>Diferença descritiva: <b>${decimal(Math.abs(difference),Math.abs(difference)<1?2:1)} pontos percentuais ${difference>=0?'a mais':'a menos'}</b> no grupo com A. Essa diferença não é uma estimativa de efeito causal. Consulte o n e a qualidade de cada grupo antes de interpretá-la.</p>`:''}</div>`,tag('Comparação dinâmica'),'Os intervalos são calculados no desenho amostral dentro de cada grupo; não são derivados dos intervalos da tabela.');
}
  function crossPage() {
  const tabs=`<div class="view-tabs"><button data-cross-mode="individual" class="${state.crossMode==='individual'?'active':''}">${icon('users',15)} Nas mesmas participantes</button><button data-cross-mode="territorial" class="${state.crossMode==='territorial'?'active':''}">${icon('pin',15)} Entre territórios</button><button data-action="open-integrated">${icon('compare',15)} Brasil + Reino Unido</button></div>`;
  if(state.crossMode==='territorial')return tabs+territorialCross();
  const f=getFilters(),c=D.cross(f,state.crossA,state.crossB),ovary=state.crossB==='ovarian'||state.crossA==='ovarian';
  const controls=`<div class="analysis-controls"><div class="control-group"><label for="cross-a">Característica A</label><select id="cross-a">${metricOptions(state.crossA,true)}</select></div><div class="control-group"><label for="cross-b">Característica B</label><select id="cross-b">${metricOptions(state.crossB,true)}</select></div></div>`;
  const unavailable=state.crossA===state.crossB?empty('Escolha duas características diferentes','Cada seletor representa uma variável do cruzamento.'):null;
  return tabs+panel('Escolha a relação que deseja explorar','PNS 2019 · todas as mulheres adultas no território e faixa etária selecionados',controls,tag('Dados reais'))+
  `<div class="stack-gap"></div>${unavailable||conditionalPanel(c)}<div class="stack-gap"></div><div class="grid-main">${panel('Como as características se distribuem juntas','As quatro combinações, sobre o total de respostas válidas',unavailable||(c.n>0?matrix(c):empty(undefined,undefined,c.n)),tag('Tabela 2 × 2'),`<span>Denominador comum: respostas válidas para A e B</span><span>PNS 2019 · IC95%</span>`)}${panel('O que este cruzamento representa','O denominador faz parte da interpretação',`<ul class="details-list"><li><span>Território</span><strong>${e(territory(state.uf))}</strong></li><li><span>Idade</span><strong>${e(ageLabel())}</strong></li><li><span>Entrevistadas com respostas válidas</span><strong>${num(c.n)}</strong></li><li><span>População ponderada válida</span><strong>${compact(c.total)}</strong></li><li><span>Intervalo de confiança</span><strong>95% · desenho amostral</strong></li><li><span>Disponibilidade</span><strong>${c.quality==='inconclusive'?'Exploratório e inconclusivo':(c.suppressed||c.hasSuppressedCells)?'Parcial / limitada':'Estimativas disponíveis'}</strong></li></ul><div class="text-block mt-15"><p>A tabela usa a proporção conjunta. O gráfico acima usa a proporção de B dentro de cada grupo de A, por isso os números respondem a perguntas diferentes.</p><p>Uma diferença pode refletir idade, condições sociais, seleção e outros fatores. Não foi feito ajuste causal.</p></div>`)}</div>${ovary?cohortNotes():callout('<strong>Relação descritiva entre características observadas.</strong> As respostas vêm das mesmas entrevistadas. Os gráficos não estimam risco individual ou efeito de uma intervenção.')}`;
}
  function axisMeta(id) {
  if(id==='deaths')return {label:'Óbitos C56',year:2024,source:'SIM',unit:'count',scope:'todas as idades'};
  const m=D.contextData?.indicators?.[id];
  if(m)return {...m,source:m.source||'Contexto territorial',scope:'indicador estadual'};
  return {label:metricLabel(id),year:2019,source:'PNS',unit:'percent',scope:ageLabel()};
}
  function statText(stat) {
    if(!stat)return '';
    if(stat.pct==null)return 'Sem respostas válidas';
    const interval=stat.low!=null&&stat.high!=null?`IC95% ${pct(stat.low)} a ${pct(stat.high)}`:'IC95% não calculável';
    return `n válido ${num(stat.nValid)}; ${num(stat.nEvent)} com a característica; ${interval}${stat.quality==='inconclusive'?'; exploratório e inconclusivo':stat.quality==='caution'?'; interpretar com cautela':''}`;
  }
  function axisFormat(id,value) {
  const m=axisMeta(id);
  return value==null?'—':m.unit==='index'?decimal(value,3):m.unit==='count'?num(value):pct(value);
}
  function contextOptions(current) {
  return metricOptions(current)+Object.entries(D.contextData?.indicators||{}).map(([id,m])=>option(id,m.label+' · '+m.year,current)).join('');
}
  function scatterRows() {
  const rows=D.groups({uf:'BR',age:state.age,cohort:'all'},'state');
  return rows.map(r=>{
    const c=D.contextData?.rows?.find(v=>v.uf===r.id);
    const val=id=>id==='deaths'?D.mortality(r.id):D.contextData?.indicators?.[id]?(c?.[id]??null):(r.rates[id]??null);
    const stat=id=>axisMeta(id).source==='PNS'?r.estimates?.[id]||null:null;
    return {...r,x:val(state.scatterX),y:val(state.scatterY),xEstimate:stat(state.scatterX),yEstimate:stat(state.scatterY)};
  });
}
  function scatter(rows) {
  const W=710,H=375,L=66,R=30,T=25,B=70,valid=rows.filter(r=>Number.isFinite(r.x)&&Number.isFinite(r.y));
  if(!valid.length)return empty('Não há pares divulgáveis para os indicadores selecionados','Escolha outro indicador ou amplie o recorte etário.');
  if(state.scatterX===state.scatterY)return empty('Escolha dois indicadores diferentes','A relação fica mais informativa com duas variáveis distintas.');
  const xm=axisMeta(state.scatterX),ym=axisMeta(state.scatterY);
  const bounds=(values,unit)=>{const mn=Math.min(...values),mx=Math.max(...values),step=unit==='index'?.05:unit==='count'?Math.max(1,10**Math.floor(Math.log10(Math.max(1,mx)))):5;let lo=Math.max(0,Math.floor(mn/step)*step),hi=Math.ceil(mx/step)*step;if(lo===hi)hi+=step;return [lo,hi];};
  const [x0,x1]=bounds(valid.map(r=>r.x),xm.unit),[y0,y1]=bounds(valid.map(r=>r.y),ym.unit),px=x=>L+(x-x0)/(x1-x0)*(W-L-R),py=y=>H-B-(y-y0)/(y1-y0)*(H-T-B);
  const tick=(v,m)=>m.unit==='index'?decimal(v,2):m.unit==='count'?compact(v):decimal(v,0)+'%';
  let svg=`<svg class="scatter-chart" viewBox="0 0 ${W} ${H}" role="group" aria-label="Dispersão por estados: ${e(xm.label)} e ${e(ym.label)}">`;
  for(let i=0;i<=4;i++){const x=x0+(x1-x0)*i/4,y=y0+(y1-y0)*i/4;svg+=`<line class="chart-grid" x1="${L}" x2="${W-R}" y1="${py(y)}" y2="${py(y)}"/><text class="chart-tick" x="${L-9}" y="${py(y)+3}" text-anchor="end">${tick(y,ym)}</text><text class="chart-tick" x="${px(x)}" y="${H-B+20}" text-anchor="middle">${tick(x,xm)}</text>`;}
  valid.forEach(r=>{const note=`A: ${axisFormat(state.scatterX,r.x)}${r.xEstimate?'; '+statText(r.xEstimate):''}. B: ${axisFormat(state.scatterY,r.y)}${r.yEstimate?'; '+statText(r.yEstimate):''}`,inconclusive=[r.xEstimate,r.yEstimate].some(v=>v?.quality==='inconclusive');svg+=`<g data-uf="${r.id}" tabindex="0" role="button" aria-label="${e(r.label)}, ${e(note)}" data-tip="${e(r.label)}|${e(note)}"><circle class="scatter-dot${state.uf===r.id?' selected':''}${inconclusive?' inconclusive':''}" cx="${px(r.x)}" cy="${py(r.y)}" r="${state.uf===r.id?8:5.5}"/><text class="scatter-label" x="${px(r.x)+8}" y="${py(r.y)-8}">${r.id}</text><title>${e(r.label)} · ${e(note)}</title></g>`;});
  return svg+`<text class="scatter-axis-label" x="${(L+W-R)/2}" y="${H-15}" text-anchor="middle">${e(xm.label)} · ${xm.year}</text><text class="scatter-axis-label" transform="translate(15 ${(T+H-B)/2}) rotate(-90)" text-anchor="middle">${e(ym.label)} · ${ym.year}</text></svg>`;
}
  function territorialCross() {
  const rows=scatterRows(),xm=axisMeta(state.scatterX),ym=axisMeta(state.scatterY),different=xm.year!==ym.year,death=state.scatterY==='deaths';
  return callout(`<strong>Cada ponto é um estado.</strong> O eixo horizontal representa ${e(xm.label)} (${xm.year}); o vertical, ${e(ym.label)} (${ym.year}). ${different?'Os anos são diferentes, portanto esta é uma comparação histórica e exploratória.':'Os indicadores selecionados têm o mesmo ano de referência.'} ${death?'Contagens de óbitos também dependem do tamanho e da estrutura etária da população.':''}`,'pin')+
  panel('Como os estados se relacionam?','Escolha alimentação, água, escolaridade ou desenvolvimento humano',`<div class="preset-row"><span>Comece por uma pergunta</span><button data-preset="water">Água × escolaridade</button><button data-preset="education">Educação × ultraprocessados</button><button data-preset="development">IDHM × frutas</button><button data-preset="oncology">Abastecimento × óbitos</button></div><div class="analysis-controls"><div class="control-group"><label for="scatter-x">Eixo horizontal · indicador A</label><select id="scatter-x">${contextOptions(state.scatterX)}</select></div><div class="control-group"><label for="scatter-y">Eixo vertical · indicador B</label><select id="scatter-y">${contextOptions(state.scatterY)}${option('deaths','Óbitos C56 · contagem SIM 2024',state.scatterY)}</select></div></div><div class="axis-sources"><span><b>A</b> ${e(xm.source)} ${xm.year} · ${e(xm.scope)}</span><span><b>B</b> ${e(ym.source)} ${ym.year} · ${e(ym.scope)}</span></div>${scatter(rows)}<div class="reading-card"><strong>Como interpretar</strong><p>Mais à direita significa maior valor de A; mais acima, maior valor de B. Pontos próximos têm perfis semelhantes nesses dois indicadores. O contorno tracejado sinaliza uma estimativa PNS inconclusiva; o número de respostas e o IC95% aparecem no detalhe e na tabela abaixo. Isso descreve territórios, sem provar que a relação ocorre nas mesmas pessoas ou que um indicador causa o outro.</p></div>`,tag('UF'),'A idade selecionada afeta apenas os indicadores da PNS. IDHM, Censo e SIM mantêm seu recorte original.')+
  `<div class="stack-gap"></div>`+territoryTable(rows,true);
}
  function territoryTable(rows,isCross=false) {
  const body=rows.map(r=>`<tr data-table-state="${e(r.label.toLowerCase())} ${r.id.toLowerCase()}"><td><strong>${r.id}</strong> · ${e(r.label)}</td>${isCross?`<td class="number stat-cell"><strong>${axisFormat(state.scatterX,r.x)}</strong>${r.xEstimate?ci(r.xEstimate):''}</td><td class="number stat-cell"><strong>${axisFormat(state.scatterY,r.y)}</strong>${r.yEstimate?ci(r.yEstimate):''}</td>`:`<td class="number">${num(D.mortality(r.id))}</td><td class="number">${e(D.incidence(r.id)?.display??'—')}</td>`}<td><button data-uf="${r.id}">Explorar</button></td></tr>`).join('');
  return `<section class="panel"><div class="panel-header"><div><h2 class="panel-title">${isCross?'Os valores por trás dos pontos':'Indicadores oncológicos por UF'}</h2><p class="panel-sub">${isCross?'Os valores seguem as unidades e anos indicados em cada eixo.':'SIM 2024 e INCA 2026 · todas as idades'}</p></div><label class="search-box">${icon('search',13)}<input id="table-search" placeholder="Buscar UF" aria-label="Buscar estado na tabela"></label></div><div class="panel-body"><div class="table-scroll"><table class="data-table"><thead><tr><th>Território</th>${isCross?`<th class="number">${e(axisMeta(state.scatterX).label)} · ${axisMeta(state.scatterX).year}</th><th class="number">${e(axisMeta(state.scatterY).label)} · ${axisMeta(state.scatterY).year}</th>`:`<th class="number">Óbitos observados · 2024</th><th class="number">Casos novos estimados · 2026</th>`}<th></th></tr></thead><tbody>${body}</tbody></table><p id="table-no-results" hidden>Sem estados correspondentes à busca.</p></div></div><div class="panel-foot"><span>${rows.length} territórios</span><span>Dados reais · fontes e unidades distintas</span></div></section>`;
}
  function care() {
  const deaths=D.mortality(state.uf),inc=D.incidence(state.uf),ages=D.mortalityAges(state.uf),older=ages.filter(r=>parseInt(r.id,10)>=60).reduce((sum,r)=>sum+(r.deaths||0),0),rows=D.states.map(s=>({id:s.uf,label:s.name}));
  return `<div class="kpi-grid">${kpi('Óbitos por câncer de ovário',num(deaths),'Observados · SIM 2024 · todas as idades','activity',true)}${kpi('Casos novos estimados',e(inc?.display??'—'),'Estimativa INCA para 2026 · todas as idades','heart')}${kpi('Óbitos a partir de 60 anos',num(older),'Subconjunto dos óbitos · SIM 2024','users')}${kpi('Participação de 60+ nos óbitos',pct(deaths?older/deaths*100:null),'Distribuição etária dos óbitos, não risco','chart')}</div>
  <div class="grid-equal">${panel('Em quais idades os óbitos foram registrados?','SIM 2024 · câncer de ovário como causa básica',hbars(ages.map(r=>({label:e(r.label),value:r.deaths,format:'number'})),Math.max(...ages.map(r=>r.deaths),1)),tag('Óbitos observados'),'Faixas etárias originais do SIM. Não são as mesmas categorias da PNS.')}${panel('Dois indicadores, duas perguntas','Observação de óbitos e estimativa de casos novos',`<div class="text-block"><h3>SIM 2024</h3><p>Registros finais de óbitos do sexo feminino, por estado de residência e causa básica C56. A tabela nacional totaliza 4.567 óbitos.</p><h3>INCA 2026</h3><p>Estimativa publicada de novos casos anuais. O valor nacional é 8.020. Nas UFs em que a fonte publica menos de 20, o painel preserva “&lt;20”.</p><h3>A comparação exige denominadores próprios</h3><p>Não se divide o total de óbitos por esses casos estimados para calcular letalidade, nem pelos pesos da PNS 2019 para calcular taxa de mortalidade.</p></div>`,tag('Fontes oficiais'))}</div>
  ${callout('<strong>Recorte específico: neoplasia maligna do ovário, C56.</strong> Estadiamento, histologia, tratamentos, internações, genética e intervalos de acesso não foram preenchidos com estimativas. Não há uma base clínica de pacientes vinculada à PNS.')}
  ${territoryTable(rows)}
  <div class="stack-gap"></div>${panel('Informações assistenciais a integrar','O painel mostra apenas os dados que foram efetivamente obtidos',`<ul class="details-list compact"><li><span>Internações específicas C56 e custos</span><strong>Não integrados</strong></li><li><span>Quimioterapia e registros APAC</span><strong>Não integrados</strong></li><li><span>Estádio / histologia / BRCA</span><strong>Sem fonte clínica integrada</strong></li><li><span>Taxas de mortalidade por população</span><strong>Denominador do mesmo ano não integrado</strong></li></ul>`,'','As ausências ficam explícitas; nenhum desses campos recebe um valor artificial.')}`;
}

  function evidencePage() {
  const data=D.evidenceData||{studies:[],mechanisms:[]};
  const texts=state.lang==='en'?{
    participants:'Participants in the two cohorts',
    cases:'Confirmed cases in the cohort study',
    protective:'Protective published associations',
    neutral:'Neutral or inconclusive findings',
    chartTitle:'Published factors by direction of association',
    chartSub:'Scatter plot by publication year and reported relative measure',
    chartFoot:'Colors summarize the published direction. A horizontal line at 1.00 marks no association. Hover over a point to inspect the factor, comparison and interval.',
    summaryTitle:'How to read this section correctly',
    summaryBody:'Protective means a relative measure below 1 with a 95% confidence interval entirely below 1. Risk means the estimate is above 1 with the entire interval above 1. Neutral or inconclusive means the interval crosses 1 or the published evidence does not support a clear direction.',
    tableTitle:'Table of published values',
    tableSub:'Factors classified as protective, neutral / inconclusive, or risk',
    factor:'Factor', category:'Classification', measure:'Measure', interval:'95% CI', comparison:'Comparison', note:'Key interpretation',
    notesTitle:'Important interpretation notes', notesSub:'What should not be overstated when reading each factor',
    notePnsTitle:'Where can citrus exposure actually be measured in Brazilian data?', notePnsSub:'Verified availability in Brazilian instruments',
    pnsHead:'PNS 2019, integrated into the dashboard', pnsBody:'It allows general fruit consumption to be related to self-reported ovarian cancer in the same respondents. P018 does not identify citrus specifically; the previous-day fruit group also mixes oranges with other fruits.',
    pofHead:'POF 2017–2018', pofBody:'It contains specific codes for orange, lemon, tangerine and orange juice. The module does not include ovarian cancer diagnosis and offers no public person-level key linking it to PNS.',
    limitHead:'The limit of the linkage', limitBody:'Orange consumption from POF was not assigned to women in the PNS. The epidemiologic studies cited remain an external layer of evidence, with their own population and design.',
    primary:'Primary source',
    mechsTitle:'Compounds and experimental mechanisms', mechsSub:'Preclinical evidence serves a different purpose than population prevention evidence',
    protectiveLabel:'Protective', neutralLabel:'Neutral / inconclusive', riskLabel:'Risk'
  }:{
    participants:'Participantes nas duas coortes',
    cases:'Casos confirmados no estudo',
    protective:'Associações protetivas publicadas',
    neutral:'Achados neutros ou inconclusivos',
    chartTitle:'Fatores publicados por sentido da associação',
    chartSub:'Gráfico de dispersão por ano de publicação e medida relativa reportada',
    chartFoot:'As cores resumem o sentido do achado publicado. A linha horizontal em 1,00 marca ausência de associação. Passe o mouse sobre um ponto para ver o fator, a comparação e o intervalo.',
    summaryTitle:'Como ler esta seção corretamente',
    summaryBody:'Protetivo significa medida relativa abaixo de 1 com IC95% inteiro abaixo de 1. Risco significa estimativa acima de 1 com todo o IC95% acima de 1. Neutro ou inconclusivo significa que o intervalo cruza 1 ou que a evidência publicada não sustenta direção clara.',
    tableTitle:'Tabela dos valores publicados',
    tableSub:'Fatores classificados como protetivos, neutros / inconclusivos ou de risco',
    factor:'Fator', category:'Classificação', measure:'Medida', interval:'IC95%', comparison:'Comparação', note:'Interpretação-chave',
    notesTitle:'Observações importantes de interpretação', notesSub:'O que não deve ser superinterpretado em cada fator',
    notePnsTitle:'Onde medir exposição a cítricos de verdade?', notePnsSub:'Disponibilidade verificada nos instrumentos brasileiros',
    pnsHead:'PNS 2019, integrada ao painel', pnsBody:'Permite relacionar frutas em geral com relato de ovário nas mesmas entrevistadas. P018 não identifica cítricos; o grupo de frutas do dia anterior também mistura laranja com outras frutas.',
    pofHead:'POF 2017–2018', pofBody:'Possui códigos específicos de laranja, limão, tangerina e suco de laranja. O módulo não contém diagnóstico ovariano e não oferece uma chave pública de pessoa que o una à PNS.',
    limitHead:'O limite do cruzamento', limitBody:'O consumo de laranja da POF não foi atribuído às mulheres da PNS. Os estudos epidemiológicos citados permanecem uma camada de evidência externa, com sua população e desenho.',
    primary:'Fonte primária',
    mechsTitle:'Compostos e mecanismos experimentais', mechsSub:'Evidência pré-clínica tem finalidade diferente de prevenção populacional',
    protectiveLabel:'Protetivo', neutralLabel:'Neutro / inconclusivo', riskLabel:'Risco'
  };
  const effects=data.studies.filter(x=>Number.isFinite(x.effect)).map(s=>({
    ...s,
    category:(Number.isFinite(s.effect)&&Number.isFinite(s.low)&&Number.isFinite(s.high))?(s.effect<1&&s.high<1?'protective':s.effect>1&&s.low>1?'risk':'neutral'):'neutral'
  }));
  const counts={protective:effects.filter(r=>r.category==='protective').length,neutral:effects.filter(r=>r.category==='neutral').length,risk:effects.filter(r=>r.category==='risk').length};
  return `<div class="kpi-grid">${kpi(texts.participants,'171.940','NHS + NHS II · Cassidy et al., 2014','users',true)}${kpi(texts.cases,'723',state.lang==='en'?'Epithelial ovarian cancer · follow-up':'Câncer epitelial de ovário · seguimento','database')}${kpi(texts.protective,num(counts.protective),state.lang==='en'?'95% CI fully below 1.00':'IC95% inteiro abaixo de 1,00','leaf')}${kpi(texts.neutral,num(counts.neutral),state.lang==='en'?'Interval crosses 1.00 or no clear direction':'Intervalo cruza 1,00 ou sem direção clara','book')}</div>
  ${panel(texts.chartTitle,texts.chartSub,evidenceScatterPlot(effects,texts),'',texts.chartFoot)}
  <div class="reading-card"><strong>${texts.summaryTitle}</strong><p>${texts.summaryBody}</p></div>
  ${panel(texts.tableTitle,texts.tableSub,evidenceValueTable(effects,texts))}
  ${panel(texts.notesTitle,texts.notesSub,evidenceNotes(effects,texts),'',state.lang==='en'?'Orange juice is a citrus product, but in the cited cohort analysis this food item by itself did not show a statistically significant association with ovarian cancer.':'Suco de laranja é um alimento cítrico, mas na análise de coorte citada esse item alimentar isolado não apresentou associação estatisticamente significativa com câncer de ovário.')}
  <div class="grid-equal">${panel(texts.mechsTitle,texts.mechsSub,data.mechanisms.map(m=>`<div class="method-step"><span class="step-number">${icon('leaf',17)}</span><div><h3>${e(m.compound)}</h3><p><strong>${e(m.evidence_level||m.model)}</strong> · ${e(m.finding)}</p><p>${e(m.limitations)} <a href="${e(m.url)}" target="_blank" rel="noopener noreferrer">${texts.primary}</a></p></div></div>`).join(''))}${panel(texts.notePnsTitle,texts.notePnsSub,`<div class="text-block"><h3>${texts.pnsHead}</h3><p>${texts.pnsBody}</p><h3>${texts.pofHead}</h3><p>${texts.pofBody}</p><h3>${texts.limitHead}</h3><p>${texts.limitBody}</p></div>`)} </div>`;
}

  function evidenceScatterPlot(effects,texts) {
    const finite=effects.filter(r=>Number.isFinite(r.effect));
    if(!finite.length)return empty();
    const years=finite.map(r=>r.year||0),loYear=Math.min(...years)-0.5,hiYear=Math.max(...years)+0.5;
    const vals=finite.flatMap(r=>[r.effect,r.low,r.high].filter(v=>Number.isFinite(v)));
    const lo=Math.min(0.45,...vals.map(v=>v>0?v:0.45))*0.95, hi=Math.max(1.65,...vals)*1.08;
    const W=920,H=430,L=78,R=42,T=30,B=58;
    const px=x=>L+((x-loYear)/(hiYear-loYear))*(W-L-R);
    const py=y=>H-B-((y-lo)/(hi-lo))*(H-T-B);
    const colors={protective:'#2c7a57',neutral:'#a17b43',risk:'#b84c5c'};
    const label=(c)=>c==='protective'?texts.protectiveLabel:c==='risk'?texts.riskLabel:texts.neutralLabel;
    const yearsTicks=Array.from(new Set(years)).sort((a,b)=>a-b);
    const yTicks=[0.5,0.75,1,1.25,1.5].filter(v=>v>=lo&&v<=hi);
    return `<div class="evidence-legend"><span><i style="background:${colors.protective}"></i>${texts.protectiveLabel}</span><span><i style="background:${colors.neutral}"></i>${texts.neutralLabel}</span><span><i style="background:${colors.risk}"></i>${texts.riskLabel}</span></div><svg class="scatter-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${e(texts.chartTitle)}"><line x1="${L}" x2="${W-R}" y1="${py(1)}" y2="${py(1)}" stroke="#8d8067" stroke-dasharray="4 4"/>${yTicks.map(t=>`<g><line x1="${L}" x2="${W-R}" y1="${py(t)}" y2="${py(t)}" stroke="#e7dfd1"/><text x="${L-10}" y="${py(t)+4}" class="chart-tick" text-anchor="end">${decimal(t,2)}</text></g>`).join('')}${yearsTicks.map(t=>`<g><line x1="${px(t)}" x2="${px(t)}" y1="${T}" y2="${H-B}" stroke="#f0eadf"/><text x="${px(t)}" y="${H-B+22}" class="chart-tick" text-anchor="middle">${e(String(t))}</text></g>`).join('')}${finite.map((r,i)=>{const x=px(r.year),y=py(r.effect),color=colors[r.category]||colors.neutral,ciTop=Number.isFinite(r.high)?py(r.high):y,ciLow=Number.isFinite(r.low)?py(r.low):y,short=r.title.length>26?r.title.slice(0,26)+'…':r.title;const tooltip=`${r.title}
${label(r.category)}
${r.effect_measure} ${decimal(r.effect,2)}${Number.isFinite(r.low)&&Number.isFinite(r.high)?`; ${state.lang==='en'?'95% CI':'IC95%'} ${decimal(r.low,2)}–${decimal(r.high,2)}`:''}
${r.comparison}`;return `<g class="scatter-point"><line x1="${x}" x2="${x}" y1="${ciTop}" y2="${ciLow}" stroke="${color}" stroke-width="2" opacity="0.9"/><circle cx="${x}" cy="${y}" r="7" fill="${color}" stroke="#fff" stroke-width="2"/><text x="${x}" y="${y-12}" class="scatter-label" text-anchor="middle">${e(short)}</text><title>${e(tooltip)}</title></g>`;}).join('')}<text x="${(L+W-R)/2}" y="${H-12}" class="chart-tick" text-anchor="middle">${state.lang==='en'?'Publication year':'Ano de publicação'}</text><text x="18" y="${(T+H-B)/2}" class="chart-tick" transform="rotate(-90 18 ${(T+H-B)/2})" text-anchor="middle">${state.lang==='en'?'Relative measure (HR or OR)':'Medida relativa (HR ou OR)'}</text></svg>`;
  }

  function evidenceValueTable(effects,texts){
    const label=(c)=>c==='protective'?texts.protectiveLabel:c==='risk'?texts.riskLabel:texts.neutralLabel;
    return `<div class="table-scroll"><table class="data-table evidence-table"><thead><tr><th>${texts.factor}</th><th>${texts.category}</th><th>${texts.measure}</th><th>${texts.interval}</th><th>${texts.comparison}</th><th>${texts.note}</th></tr></thead><tbody>${effects.map(r=>`<tr><td><strong>${e(r.title)}</strong><small>${e((r.publication_title||'')+' · '+String(r.year||''))}</small></td><td><span class="risk-tag ${e(r.category==='protective'?'protective':r.category==='risk'?'risk':'neutral')}">${e(label(r.category))}</span></td><td><strong>${e(r.effect_measure||'—')}</strong> ${Number.isFinite(r.effect)?decimal(r.effect,2):'—'}</td><td>${Number.isFinite(r.low)&&Number.isFinite(r.high)?`${decimal(r.low,2)}–${decimal(r.high,2)}`:'—'}</td><td>${e(r.comparison||'—')}</td><td>${e(r.finding||'—')}<br><small>${e(r.limitations||'')}</small><br><a href="${e(r.url)}" target="_blank" rel="noopener noreferrer">${texts.primary} ${icon('external',11)}</a></td></tr>`).join('')}</tbody></table></div>`;
  }

  function evidenceNotes(effects,texts){
    return `<div class="evidence-notes">${effects.map(r=>`<article class="evidence-note ${e(r.category)}"><div class="evidence-note-head"><h3>${e(r.title)}</h3><span class="risk-tag ${e(r.category==='protective'?'protective':r.category==='risk'?'risk':'neutral')}">${e(r.category==='protective'?texts.protectiveLabel:r.category==='risk'?texts.riskLabel:texts.neutralLabel)}</span></div><p><strong>${state.lang==='en'?'What it means':'O que significa'}:</strong> ${e(r.finding||'—')}</p><p><strong>${state.lang==='en'?'Important observation':'Observação importante'}:</strong> ${e(r.limitations||'—')}</p>${r.p_trend!=null?`<p><strong>${state.lang==='en'?'Trend test':'Teste de tendência'}:</strong> p = ${decimal(r.p_trend,2)}</p>`:''}${r.i_squared_percent!=null?`<p><strong>${state.lang==='en'?'Heterogeneity':'Heterogeneidade'}:</strong> I² = ${decimal(r.i_squared_percent,1)}%${r.p_heterogeneity!=null?`; p = ${decimal(r.p_heterogeneity,3)}`:''}</p>`:''}</article>`).join('')}</div>`;
  }
  function forestPlot(effects) {
    const finite=effects.flatMap(r=>[r.low,r.high,r.effect]).filter(v=>Number.isFinite(v)&&v>0);
    const W=880,H=82+effects.length*65,L=352,R=160,T=24,lo=Math.min(.5,...finite)*.87,hi=Math.max(1.55,...finite)*1.12,px=v=>L+(Math.log(v)-Math.log(lo))/(Math.log(hi)-Math.log(lo))*(W-L-R);
    return `<svg class="forest-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Efeitos publicados e intervalos de confiança. A linha em 1 indica ausência de associação."><line x1="${px(1)}" x2="${px(1)}" y1="10" y2="${H-49}" stroke="#a59b84" stroke-dasharray="4 4"/>${effects.map((r,i)=>{const y=T+i*65+15,hasCI=r.low!=null&&r.high!=null,color=r.reference?'#81958a':r.low<=1&&r.high>=1?'#a17b43':'#287959';return `<text x="4" y="${y-3}" class="forest-label">${e(r.title.length>52?r.title.slice(0,49)+'…':r.title)}</text><text x="4" y="${y+15}" class="chart-tick">${e(r.effect_measure)} · ${r.year}</text>${hasCI?`<line x1="${px(r.low)}" x2="${px(r.high)}" y1="${y}" y2="${y}" stroke="${color}" stroke-width="2.5"/><line x1="${px(r.low)}" x2="${px(r.low)}" y1="${y-6}" y2="${y+6}" stroke="${color}"/><line x1="${px(r.high)}" x2="${px(r.high)}" y1="${y-6}" y2="${y+6}" stroke="${color}"/>`:''}<circle cx="${px(r.effect)}" cy="${y}" r="5.5" fill="${color}"/><text x="${W-R+14}" y="${y+4}" class="forest-label">${decimal(r.effect,2)} ${r.reference?'(referência)':hasCI?'('+decimal(r.low,2)+'–'+decimal(r.high,2)+')':''}</text><title>${e(r.title)}: ${e(r.effect_measure)} ${decimal(r.effect,2)}${hasCI?'; IC95% '+decimal(r.low,2)+' a '+decimal(r.high,2):'; referência'}</title>`;}).join('')}${[.25,.5,.75,1,1.5,2,3,4].filter(t=>t>=lo&&t<=hi).map(t=>`<text x="${px(t)}" y="${H-25}" class="chart-tick" text-anchor="middle">${decimal(t,t===.25||t===.75?2:1)}</text>`).join('')}<text x="${(L+W-R)/2}" y="${H-5}" class="chart-tick" text-anchor="middle">Medida relativa publicada · escala logarítmica</text></svg>`;
  }

  function oneHealthPage() {
  const a=D.aggregate(getFilters()),water=a.estimates?.networkWater,treated=a.estimates?.treatedWater,edu=a.estimates?.higherEducation;
  return `<section class="onehealth-hero"><div><span class="onehealth-label">${icon('network',13)} ONE HEALTH · SAÚDE ÚNICA</span><h2>O cuidado começa antes do atendimento.</h2><p>Saúde da mulher, alimentos, água, condições sociais e sistemas de produção fazem parte de uma visão integrada.</p></div></section>
  <div class="kpi-grid">${kpi('Água da rede geral',pct(water?.pct),'Mulheres em domicílios com essa fonte · PNS 2019','activity',true)}${kpi('Tratamento doméstico da água',pct(treated?.pct),'Relato de filtrar, ferver, clorar ou tratar em casa','shield')}${kpi('Ensino superior completo',pct(edu?.pct),'Escolaridade das entrevistadas · PNS 2019','book')}${kpi('Alimentação na mesma entrevista',pct(a.rates.fruit),'Frutas em 5+ dias/semana · PNS 2019','leaf')}</div>
  <div class="source-grid">${[
    ['HUMANA','Saúde da mulher','Relato de diagnóstico, idade e perfil de saúde na PNS; óbitos SIM e estimativas INCA em fontes próprias.','Dados integrados'],
    ['ALIMENTOS','Alimentação e sistemas alimentares','Hábitos observados e literatura sobre compostos bioativos. Produção e rastreabilidade dos alimentos ainda não foram vinculadas.','Hábitos integrados'],
    ['AMBIENTE','Água e condições de vida','Fonte de abastecimento e tratamento doméstico relatado, relacionados às características das mesmas mulheres. Não comprova potabilidade.','Dados integrados'],
    ['ANIMAL','Animais e ecossistemas','Saúde animal, biodiversidade e impactos da produção compõem a abordagem. Esta versão ainda não possui indicadores dessas dimensões.','A integrar']
  ].map(([initial,title,text,status])=>`<article class="source-card"><div class="source-card-head"><span class="source-initial">${initial}</span>${tag(status,status==='A integrar'?'neutral':'')}</div><h3>${title}</h3><p>${text}</p></article>`).join('')}</div>
  <div class="grid-equal">${panel('Água, alimentação e escolaridade','Dimensões observadas nos domicílios das entrevistadas',relationshipBars([{label:'Rede geral como fonte principal de água',stat:water},{label:'Tratamento da água de beber no domicílio',stat:treated},{label:'Ensino superior completo',stat:edu,color:'#8baa89'}]),tag('PNS 2019'),'Denominador: mulheres adultas com resposta válida. Não é o índice de cobertura de todos os habitantes do estado.')}${panel('Como comparar relações no painel','Escolha a unidade que corresponde à pergunta',`<div class="method-step"><span class="step-number">01</span><div><h3>Nas mesmas mulheres</h3><p>Relacione abastecimento, tratamento doméstico, escolaridade e alimentação. O gráfico compara proporções dentro de cada grupo.</p><button class="button ghost" data-page="cross">Abrir relações ${icon('arrow',12)}</button></div></div><div class="method-step"><span class="step-number">02</span><div><h3>Entre estados</h3><p>Compare indicadores territoriais, com ano e denominador visíveis. IDHM descreve contexto do território, não uma característica individual.</p><button class="button ghost" data-action="open-context">Comparar estados ${icon('arrow',12)}</button></div></div>`)} </div>
  ${contextPanel()}
  ${callout('<strong>Abordagem One Health em desenvolvimento.</strong> A OMS reconhece a interdependência entre pessoas, animais, plantas e ecossistemas. Este observatório integra saúde humana, hábitos e parte das condições ambientais e sociais; não afirma ter medido toda essa rede nem identificado causas ambientais do câncer.','network')}
  <p class="graph-hint"><a href="https://www.who.int/health-topics/one-health" target="_blank" rel="noopener noreferrer">Definição de One Health · Organização Mundial da Saúde</a></p>`;
}
  function contextPanel() {
  const ctx=D.contextData;
  if(!ctx)return panel('Desenvolvimento humano e infraestrutura','Contexto estadual em fontes próprias',empty('Fonte contextual não disponível','Os indicadores só aparecem depois de uma fonte oficial ser integrada.'));
  const row=ctx.rows?.find(r=>r.uf===state.uf),ind=ctx.indicators||{};
  return panel('O contexto social e ambiental do território',e(territory(state.uf))+' · cada indicador mantém sua data e população de referência',`<div class="context-grid">${Object.entries(ind).map(([id,m])=>`<div class="context-card"><span>${e(m.label)}</span><strong>${row?.[id]==null?'—':m.unit==='index'?decimal(row[id],3):pct(row[id])}</strong><small>${e(String(m.year))} · ${e(m.unit==='index'?'Índice de 0 a 1':'Percentual de domicílios')}</small><p>${e(m.definition||'')}</p><a href="${e(m.sourceUrl||m.source_url||'#')}" target="_blank" rel="noopener noreferrer">Fonte oficial ${icon('external',10)}</a></div>`).join('')}</div>`,tag('Indicadores territoriais'),'Não são dados das mesmas pessoas entrevistadas na PNS. Alterar a faixa etária da PNS não muda estes indicadores.');
}
  function sourcePage() {
  const national=D.aggregate({uf:'BR',age:'all',cohort:'all'});
  const list=[
    {initial:'PNS',title:'PNS 2019',text:'Microdados reais processados: alimentação, água, escolaridade, renda, raça ou cor e diagnóstico autorreferido de ovário.',unit:'Mulheres adultas · amostra complexa',url:sources.pns,status:'Integrada'},
    {initial:'SIM',title:'Mortalidade 2024',text:'Óbitos do sexo feminino por UF de residência, com C56 como causa básica. Dados finais até 2024.',unit:'Óbitos observados · todas as idades',url:sources.sim,status:'Integrada'},
    {initial:'INCA',title:'Estimativa 2026',text:'Casos novos anuais estimados de câncer de ovário. Valores menores de 20 são preservados conforme a publicação.',unit:'Estimativa de incidência · não casos observados',url:sources.inca,status:'Integrada'},
    {initial:'IBGE',title:'Contexto territorial',text:'Domicílios com rede geral como principal abastecimento, extraídos do Censo Demográfico 2022 e comparados por estado.',unit:'Contexto de UF · sem vínculo de pessoa',url:'https://sidra.ibge.gov.br/tabela/6803',status:D.contextData?'Integrado':'A integrar'},
    {initial:'PNUD',title:'IDHM e educação',text:'Índices de desenvolvimento humano e de sua dimensão de educação em 2019 e 2021, conforme a planilha oficial incluída.',unit:'Índice de 0 a 1 · contexto estadual',url:'https://www.undp.org/pt/brazil/desenvolvimento-humano/painel-idhm',status:'Integrado'},
    {initial:'UKB',title:'UK Biobank · Reino Unido, Europa',text:'Alimentação, incidência e mortalidade por ovário em Chang et al., 2023. Tabelas publicadas, com HR ajustados, IC95% e perfis por quartil.',unit:'Evidência agregada publicada · sem microdados individuais',url:D.ukData.full_text_url,status:'Integrada'},
    {initial:'FAPESP',title:'PIPE Fase 2 · Marie.AI',text:'Projeto principal, auxílio vinculado e cinco bolsas, com processos e vigências verificáveis.',unit:'Identificação institucional da pesquisa',url:D.fundingData.project.source_url,status:'Verificada'},
    {initial:'NCI',title:'Fatores de risco de ovário',text:'Definição, direção da associação, força da evidência e disponibilidade no painel. Tabela adaptada para ovário.',unit:'Referência científica · sem pontuação individual',url:sources.nci,status:'Referência'},
    {initial:'CIÊNCIA',title:'Cítricos e flavanonas',text:'Resultados de coortes e síntese posterior, com medidas de associação, intervalos e limitações.',unit:'Literatura externa · não risco calculado pela PNS',url:'https://pmc.ncbi.nlm.nih.gov/articles/PMC4196485/',status:'Verificada'},
    {initial:'OMS',title:'One Health',text:'A abordagem orienta a conexão entre saúde humana, alimentação, animais, plantas e ambiente.',unit:'Referência conceitual · integração em desenvolvimento',url:'https://www.who.int/health-topics/one-health',status:'Referência'}
  ];
  return callout('<strong>Somente dados reais.</strong> Os indicadores da PNS são estimativas próprias calculadas sobre microdados públicos do IBGE. SIM e INCA preservam seus valores e unidades. Nenhum registro foi gerado, preenchido por simulação ou substituído por uma média inventada.','database')+
  `<div class="source-grid">${list.map(r=>`<article class="source-card"><div class="source-card-head"><span class="source-initial">${r.initial}</span>${tag(r.status)}</div><h3>${r.title}</h3><p>${r.text}</p><div class="source-meta">${r.unit}</div><a href="${r.url}" target="_blank" rel="noopener noreferrer">Consultar fonte ${icon('external',12)}</a></article>`).join('')}</div>
  <div class="grid-equal">${panel('A amostra e o cálculo','Resultados reproduzíveis a partir dos arquivos oficiais',`<ul class="details-list compact"><li><span>Mulheres adultas entrevistadas</span><strong>${num(national.n)}</strong></li><li><span>Com relato de ovário</span><strong>${e(String(D.ovarianN({uf:'BR',age:'all'})))}</strong></li><li><span>Peso do morador selecionado</span><strong>V00291</strong></li><li><span>Estrato / conglomerado</span><strong>V0024 / UPA_PNS</strong></li><li><span>Precisão</span><strong>Linearização de Taylor · IC95%</strong></li></ul><div class="text-block mt-15"><p>As estimativas por grupo preservam o desenho completo. Os intervalos de proporção usam transformação logit e distribuição t com os graus de liberdade do desenho. Respostas ausentes não entram automaticamente como “não”.</p><p>Os pesos refletem a edição e a reponderação dos microdados utilizados. A população representada é de 2019, não uma projeção para 2026.</p></div>`)}${panel('Como mostramos a incerteza','Política exploratória do projeto; não é uma regra oficial do IBGE',`<ul class="details-list compact"><li><span>Menos de 30 respostas válidas</span><strong>Valor visível · inconclusivo</strong></li><li><span>Coeficiente de variação acima de 30%</span><strong>Valor visível · inconclusivo</strong></li><li><span>Células muito pequenas</span><strong>n real e aviso de incerteza</strong></li><li><span>Faixa intermediária de incerteza</span><strong>Aviso de cautela e IC95%</strong></li><li><span>Ausência de uma fonte</span><strong>Informação indisponível</strong></li></ul><p class="graph-hint">Um traço significa ausência de respostas válidas ou de uma estimativa calculável. Pontos de 0%/100% podem ser observados na amostra; o IC95% fica ausente quando não pode ser calculado adequadamente. Nenhum dado ausente vira zero.</p>`)}</div>
  <div class="grid-equal">${panel('Educação, água e saúde','Definições que não devem ser misturadas',`<div class="text-block"><h3>Escolaridade e IDHM</h3><p>Escolaridade é uma característica da entrevistada; IDHM e IDHM-Educação descrevem o estado em um ano específico. Não são medidas intercambiáveis.</p><h3>Água</h3><p>Rede geral indica a fonte principal do domicílio. Tratamento doméstico relata uma prática, como filtrar ou ferver. Nenhum dos dois é uma análise laboratorial de potabilidade.</p><h3>Antropometria</h3><p>O IMC utiliza peso e altura autorreferidos finais do IBGE, com exclusão de gestantes e gravidez desconhecida. A antropometria aferida teria outro peso amostral.</p></div>`)}${panel('Reproduzir e atualizar','Código e proveniência acompanham o projeto Streamlit',`<ul class="source-links"><li><a href="${sources.dictionary}" target="_blank" rel="noopener noreferrer">Dicionário oficial PNS 2019</a><small>Variáveis, códigos, posições e categorias.</small></li><li><a href="${sources.pns}" target="_blank" rel="noopener noreferrer">Questionário oficial</a><small>Alimentação, água e relato de câncer.</small></li><li><a href="${sources.keys}" target="_blank" rel="noopener noreferrer">Chaves e desenho da PNS</a><small>Identificação interna; não permite ligar pacientes ao DATASUS.</small></li></ul><div class="text-block"><p>A pasta scripts do projeto reproduz o processamento. Os manifestos registram URLs, datas, hashes, definições, desenho e critérios de divulgação. As fontes territoriais mantêm os recortes originais.</p></div>`)} </div>`;
}
  function render() {
  const ticket=++renderTicket,active=document.activeElement?.id;
  return Promise.all([D.ensure(state.uf),state.page==='population'?D.ensure(state.compare):Promise.resolve()]).then(()=>{
    if(ticket!==renderTicket)return;
    const content={overview,population,nutrition,risk:riskPage,research:researchPage,cross:crossPage,care,onehealth:oneHealthPage,evidence:evidencePage,sources:sourcePage}[state.page]();
    $('#app').innerHTML=shell(content);
    applyLanguage($('#app'));
    if(active)document.getElementById(active)?.focus({preventScroll:true});
    document.title=state.lang==='en'?`${window.MARIE_I18N.translateText(pages.find(p=>p.id===state.page).label)} | Marie Ovarian Cancer`:`${pages.find(p=>p.id===state.page).label} | Marie Câncer de Ovário`;
  }).catch(error=>{
    if(ticket===renderTicket)$('#app').innerHTML='<main class="main"><h1>Não foi possível carregar este recorte</h1><p>Atualize a página e confira se os arquivos de dados foram incluídos no projeto.</p></main>';
    console.error(error);
  });
}
  function navigate(page){if(!allowedPages.includes(page))return Promise.resolve();state.page=page;state.mobile=false;history.replaceState(null,'','#'+page);return render().then(()=>{$('#content')?.focus({preventScroll:true});window.scrollTo({top:0,behavior:'auto'});});}
  function notify(message){clearTimeout(toastTimer);$('#toast').textContent=state.lang==='en'?window.MARIE_I18N.translateText(message):message;$('#toast').classList.add('show');toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),3400);}
  function showModal(title,sub,body,footer=''){
    previousFocus=document.activeElement;
    $('#modal-root').innerHTML=`<div class="overlay" data-action="dismiss"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div class="modal-header"><div><h2 id="modal-title">${title}</h2><p>${sub}</p></div><button class="icon-button" data-action="close-modal" aria-label="Fechar">${icon('close',16)}</button></div><div class="modal-body">${body}</div>${footer?`<div class="modal-footer">${footer}</div>`:''}</section></div>`;
    applyLanguage($('#modal-root'));
    document.body.style.overflow='hidden';setTimeout(()=>$('#modal-root [data-action="close-modal"]')?.focus(),0);
  }
  function closeModal(){ $('#modal-root').innerHTML='';document.body.style.overflow='';if(previousFocus?.isConnected)previousFocus.focus(); }
  function persistAgenda(){try{localStorage.setItem('marie-ovario-agenda-real-v3',JSON.stringify(agenda));}catch(_){notify('A pauta ficará disponível apenas nesta sessão.');}}
  function saveInsight(key){const insight=insights().find(i=>i.key===key);if(!insight)return;const id=`${key}-${state.uf}-${state.age}`;if(agenda.some(x=>x.id===id)){showAgenda();return;}agenda.push({id,title:insight.title,text:insight.text,uf:state.uf,age:state.age,status:'Em análise',source:insight.source||'Fontes do observatório'});persistAgenda();render();notify('Leitura salva na sua pauta deste navegador.');}
  function showAgenda(){showModal('Minha pauta de gestão','Leituras salvas neste navegador · dados reais',agenda.length?agenda.map(a=>`<article class="agenda-item"><h3>${e(a.title)}</h3><p>${e(a.text)}</p><div class="agenda-item-footer"><small>${e(territory(a.uf))} · ${e(a.age==='all'?'18+':a.age)} · ${e(a.source||'Fonte registrada no observatório')}</small><select data-agenda-status="${e(a.id)}" aria-label="Status de ${e(a.title)}">${['Em análise','Planejado','Concluído'].map(v=>option(v,v,a.status)).join('')}</select><button data-agenda-remove="${e(a.id)}">Remover</button></div></article>`).join(''):empty('Sua pauta começa com uma leitura','Na visão executiva, use “Salvar na pauta” para reunir os pontos que deseja acompanhar.'),btn('Exportar pauta','export-agenda','download')+btn('Concluir','close-modal',null,'primary'));}
  function demoInfo() {
  showModal('Sobre os dados deste observatório','Dados reais com datas, unidades e limitações explícitas',`<div class="text-block"><p><strong>A PNS 2019 foi processada a partir dos microdados oficiais.</strong> Os filtros, percentuais e cruzamentos usam os agregados dessas entrevistas, com pesos e intervalos calculados pelo desenho amostral.</p><p>SIM 2024 e INCA 2026 são fontes separadas, de todas as idades. IDHM e abastecimento territorial mantêm a data publicada em cada indicador.</p><p>O painel não gera pessoas ou eventos. Pequenos grupos mostram estimativas exploratórias e inconclusivas, com n real e IC95% quando calculável. Ausência de respostas permanece sem estimativa. Não há uma probabilidade individual de câncer calculada pela interface.</p><p>Alimentação, água, escolaridade e contexto são dimensões de investigação. Associações observadas não estabelecem causas do câncer.</p></div>`,btn('Entendi','close-modal',null,'primary'));
}
  function cohortHelp(){showModal('Relato de câncer de ovário','Como construir e interpretar o recorte da PNS 2019',`<div class="text-block"><h3>Uma informação disponível na mesma entrevista</h3><p>Q120 pergunta sobre diagnóstico médico de câncer. Q121014 registra o relato de câncer de ovário, atual ou passado, sem separar essas duas situações.</p><h3>O comparador exige tratar os saltos</h3><p>Com relato: Q120 = 1 e Q121014 = 1. Sem relato: Q120 = 2, ou Q120 = 1 e Q121014 = 2. Os demais valores precisam de avaliação; ausências não são transformadas automaticamente em “não”.</p><h3>O que esse desenho não estabelece</h3><p>A dieta foi informada na entrevista e pode ter mudado após o diagnóstico. A PNS permite múltiplos relatos de câncer e não fornece, nesse campo, histologia, estádio ou a cronologia específica do ovário.</p><h3>Precisão para interpretar</h3><p>Foram identificadas 53 entrevistadas adultas com relato de ovário no Brasil. O painel calcula a incerteza pelo desenho complexo. Recortes com poucas entrevistadas permanecem visíveis, com n real e o aviso de resultado exploratório e inconclusivo.</p><p><a href="${sources.pns}" target="_blank" rel="noopener noreferrer">Abrir questionário oficial do IBGE</a></p></div>`,btn('Voltar à análise','close-modal',null,'primary'));}
  function csvCell(v){const t=String(v??'');return '"'+t.replace(/"/g,'""')+'"';}
  function downloadCSV(filename,rows){if(!rows.length){notify('Não há linhas para exportar.');return;}const keys=[...new Set(rows.flatMap(Object.keys))],data='\ufeff'+[keys,...rows.map(r=>keys.map(k=>r[k]))].map(r=>r.map(csvCell).join(';')).join('\r\n'),blob=new Blob([data],{type:'text/csv;charset=utf-8;'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=filename;document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);notify('CSV exportado com recorte, unidade e fonte, período e intervalo de confiança.');}
  function exportData() {
  const f=getFilters(['population','nutrition'].includes(state.page)),base={tipo:'DADOS_REAIS',fonte:'IBGE PNS 2019; cálculos Marie Câncer de Ovário',ano:2019,UF:f.uf,idade:f.age,coorte:f.cohort,pagina:state.page};let rows=[];
  if(state.page==='risk'){rows=D.riskData.items.filter(r=>(state.riskCategory==='all'||r.category===state.riskCategory)&&(state.riskDirection==='all'||r.direction===state.riskDirection)).map(r=>({tipo:'EVIDENCIA_SOBRE_FATORES',fator:r.label,dominio:r.category,sentido:r.direction,evidencia:r.evidence,interpretacao:r.explanation,disponibilidade:r.measurement,indicador_PNS:r.metric,fontes:r.source_urls.join(' | ')}));}
  else if(state.page==='research'){rows=[{tipo:'AUXILIO_PRINCIPAL',...D.fundingData.project},{tipo:'AUXILIO_VINCULADO',...D.fundingData.linked_projects[0]},...D.fundingData.scholarships.map(r=>({tipo:'BOLSA_VINCULADA',...r}))].map(({links,source_sha256,...r})=>r);}
  else if(state.page==='nutrition'&&state.nutritionSource!=='br'){
    const d=D.ukData;
    rows=d.effects.map(r=>({tipo:'EVIDENCIA_PUBLICADA_UKB',fonte:d.full_text_url,ano:2023,territorio:'Reino Unido, Europa',medida:r.effect_measure,indicador:r.title,valor:r.effect,IC95_inferior:r.low,IC95_superior:r.high,n_mulheres:r.n,eventos:r.events,unidade_eventos:r.event_unit,comparacao:r.comparison}));
    d.quartiles.rows.forEach(r=>{for(const endpoint of ['incidence','mortality']){const v=r['ovarian_'+endpoint];rows.push({tipo:'EVIDENCIA_PUBLICADA_UKB_QUARTIL',fonte:d.full_text_url,ano:2023,territorio:'Reino Unido',indicador:endpoint,quartil:r.id,faixa_UPF_peso:r.range_published,medida:'HR ajustado vs Q1',valor:v.hr,IC95_inferior:v.low,IC95_superior:v.high,n_mulheres_modelo_total:v.n_models,n_mulheres_quartil:r.n_female});}
      for(const [key,m] of Object.entries(ukProfileDefinitions()))rows.push({tipo:'PERFIL_PUBLICADO_UKB_COORTE_COMPLETA',fonte:d.full_text_url,ano:2023,territorio:'Reino Unido',populacao:'Homens e mulheres',quartil:r.id,indicador:m.label,valor:r[key],unidade:m.unit,medida:m.type==='mean'?'Média':'Percentual publicado',desvio_padrao:m.sd?r[m.sd]:null,n:r.n_all_participants,n_mulheres:r.n_female});
    });
    if(state.nutritionSource==='compare'){
      for(const cohort of ['all','ovarian','no_ovarian']){const a=D.aggregate({...f,cohort}),v=a.estimates[state.nutritionMetric]||{};rows.push({...base,coorte:cohort,indicador:metricLabel(state.nutritionMetric),valor:v.pct,unidade:'Percentual ponderado de respostas válidas',n:a.n,n_valido:v.nValid,n_evento:v.nEvent,IC95_inferior:v.low,IC95_superior:v.high,CV:v.cv,qualidade:v.quality,motivos_qualidade:(v.qualityReasons||[]).join(' | ')});}
      D.groups(f,state.heatDimension).forEach(r=>{const v=r.estimates[state.nutritionMetric]||{};rows.push({...base,estratificacao:state.heatDimension,grupo:r.label,indicador:metricLabel(state.nutritionMetric),valor:v.pct,unidade:'Percentual ponderado de respostas válidas',n:r.n,n_valido:v.nValid,n_evento:v.nEvent,IC95_inferior:v.low,IC95_superior:v.high,CV:v.cv,qualidade:v.quality,motivos_qualidade:(v.qualityReasons||[]).join(' | ')});});
    }
  }
  else if(state.page==='evidence'){rows=(D.evidenceData?.studies||[]).map(r=>({tipo:'EVIDENCIA_PUBLICADA',...r,adjustments:(r.adjustments||[]).join(' | ')}));}
  else if(state.page==='sources'){rows=Object.entries(D.metadata?.metrics||{}).map(([id,m])=>({...base,indicador:id,definicao:typeof m==='string'?m:JSON.stringify(m),metodo:'Desenho amostral complexo; Taylor; IC95%'}));}
  else if(state.page==='care'){const selection=state.uf==='BR'?[{uf:'BR'},...D.states]:[{uf:state.uf}];rows=selection.map(s=>({tipo:'DADOS_REAIS',UF:s.uf,obitos_SIM_2024:D.mortality(s.uf),casos_novos_INCA_2026:D.incidence(s.uf)?.display,idade:'Todas as idades',unidade_SIM:'obitos observados',fonte_SIM:sources.sim,unidade_INCA:'casos anuais estimados',fonte_INCA:sources.inca}));}
  else if(state.page==='cross'&&state.crossMode==='individual'){
    const c=D.cross(f,state.crossA,state.crossB);
    rows=c.cells.map(v=>({...base,indicador_a:metricLabel(state.crossA),presenca_a:v.a,indicador_b:metricLabel(state.crossB),presenca_b:v.b,medida:'Proporcao conjunta',n:v.n,n_valido:v.nValid,n_evento:v.nEvent,populacao_ponderada:v.women,percentual:v.pct,IC95_inferior:v.low,IC95_superior:v.high,CV:v.cv,qualidade:v.quality,motivos_qualidade:(v.qualityReasons||[]).join(' | '),sem_estimativa:v.suppressed}));
    Object.entries(c.conditional||{}).forEach(([key,v])=>rows.push({...base,indicador_a:metricLabel(state.crossA),indicador_b:metricLabel(state.crossB),medida:key,n_valido:v.nValid,n_evento:v.nEvent,percentual:v.pct,IC95_inferior:v.low,IC95_superior:v.high,CV:v.cv,qualidade:v.quality,motivos_qualidade:(v.qualityReasons||[]).join(' | ')}));
  }else if(state.page==='cross'&&state.crossMode==='territorial'){
    const xm=axisMeta(state.scatterX),ym=axisMeta(state.scatterY);rows=scatterRows().map(r=>({tipo:'DADOS_REAIS_AGREGADOS',UF:r.id,indicador_A:xm.label,valor_A:r.x,ano_A:xm.year,unidade_A:xm.unit,escopo_A:xm.scope,indicador_B:ym.label,valor_B:r.y,ano_B:ym.year,unidade_B:ym.unit,escopo_B:ym.scope,n_valido_A:r.xEstimate?.nValid,n_evento_A:r.xEstimate?.nEvent,IC95_inferior_A:r.xEstimate?.low,IC95_superior_A:r.xEstimate?.high,CV_A:r.xEstimate?.cv,qualidade_A:r.xEstimate?.quality,motivos_A:r.xEstimate?.qualityReasons?.join(' | '),n_valido_B:r.yEstimate?.nValid,n_evento_B:r.yEstimate?.nEvent,IC95_inferior_B:r.yEstimate?.low,IC95_superior_B:r.yEstimate?.high,CV_B:r.yEstimate?.cv,qualidade_B:r.yEstimate?.quality,motivos_B:r.yEstimate?.qualityReasons?.join(' | '),ajuste_causal:'Nao realizado'}));
  }else{
    const a=D.aggregate(f);
    rows=[{...base,indicador:'Populacao representada',valor:a.women,unidade:'Soma de pesos amostrais',n:a.n,IC95_inferior:a.womenLow,IC95_superior:a.womenHigh,CV:a.raw?.cv,qualidade:a.raw?.quality,motivos_qualidade:(a.raw?.qualityReasons||[]).join(' | ')},...D.metrics.map(m=>{const v=a.estimates[m.id]||{};return {...base,indicador:m.label,valor:v.pct,unidade:'percentual entre respostas validas',IC95_inferior:v.low,IC95_superior:v.high,n_valido:v.nValid,n_evento:v.nEvent,CV:v.cv,qualidade:v.quality,motivos_qualidade:(v.qualityReasons||[]).join(' | ')};})];
    if(state.page==='onehealth')Object.entries(D.contextData?.indicators||{}).forEach(([id,m])=>{const r=D.contextData.rows.find(v=>v.uf===state.uf);rows.push({tipo:'CONTEXTO_TERRITORIAL',fonte:m.source,ano:m.year,UF:state.uf,indicador:m.label,valor:r?.[id],unidade:m.unit});});
  }
  const exportScope=state.page==='nutrition'&&state.nutritionSource==='uk'?'UK_Biobank':state.page==='nutrition'&&state.nutritionSource==='compare'?state.uf+'_e_UK_Biobank':['research','risk','evidence','sources'].includes(state.page)?'fontes':state.uf;
  downloadCSV(`marie_ovario_${state.page}_${exportScope}_dados_reais.csv`,rows);
}
  document.addEventListener('click',ev=>{
    const t=ev.target.closest('button,a,[data-action],[data-uf],[data-age],.overlay');if(!t)return;
    if(t.dataset.lang&&['pt','en'].includes(t.dataset.lang)){
      state.lang=t.dataset.lang; document.documentElement.lang=state.lang==='en'?'en':'pt-BR';
      try{localStorage.setItem('marie-language',state.lang)}catch{}
      const url=new URL(location.href);url.searchParams.set('lang',state.lang);history.replaceState(null,'',url.pathname+url.search+url.hash);
      render();return;
    }
    if(t.dataset.nutritionSource&&['br','uk','compare'].includes(t.dataset.nutritionSource)){state.nutritionSource=t.dataset.nutritionSource;render();return;}
    if(t.dataset.ukQuartile&&D.ukData.quartiles.rows.some(r=>r.id===t.dataset.ukQuartile)){state.ukQuartile=t.dataset.ukQuartile;render();return;}
    if(t.dataset.riskDirection){state.riskDirection=state.riskDirection===t.dataset.riskDirection?'all':t.dataset.riskDirection;render();return;}
    if(t.dataset.riskExplore){state.nutritionMetric=t.dataset.riskExplore;state.nutritionSource='br';navigate('nutrition');return;}
    if(t.dataset.page){ev.preventDefault();closeModal();navigate(t.dataset.page);return;}
    if(t.dataset.uf){state.uf=t.dataset.uf;removeTip();render();return;}
    if(t.dataset.age){state.age=state.age===t.dataset.age?'all':t.dataset.age;render();return;}
    if(t.dataset.heatCell){
      const [metricId,groupId]=t.dataset.heatCell.split('|');
      const row=D.groups(getFilters(true),state.heatDimension).find(r=>r.id===groupId),stat=row?.estimates?.[metricId];
      showModal('Detalhe do estrato',e(row?.label||groupId),`<div class="text-block"><h3>${e(metricLabel(metricId))}</h3><p class="modal-estimate">${pct(stat?.pct)}</p><p>${ci(stat)}</p><p>Amostra com resposta válida: ${stat?.nValid==null?'não divulgada':num(stat.nValid)}. Fonte: PNS 2019. O percentual se refere às mulheres deste estrato, com pesos amostrais.</p>${stat?.pct==null?'<p>Este indicador não tem respostas válidas no recorte selecionado. Os demais indicadores conservam os seus próprios resultados.</p>':''}</div>`,btn('Fechar','close-modal',null,'primary'));return;
    }
    if(t.dataset.preset){
      const presets={water:['networkWater','higherEducation'],education:['idhm_education_2019','ultra'],development:['idhm_2019','fruit'],oncology:['water_network_pct','deaths']};
      const pair=presets[t.dataset.preset];if(pair){[state.scatterX,state.scatterY]=pair;state.crossMode='territorial';render();}return;
    }
    if(t.dataset.mapMode){state.mapMode=t.dataset.mapMode;render();return;}
    if(t.dataset.crossMode){state.crossMode=t.dataset.crossMode;render();return;}
    if(t.dataset.save){saveInsight(t.dataset.save);return;}
    if(t.dataset.agendaRemove){agenda=agenda.filter(x=>x.id!==t.dataset.agendaRemove);persistAgenda();render();showAgenda();return;}
    const action=t.dataset.action;
    if(action==='dismiss'&&ev.target!==t)return;
    if(action==='close-modal'||action==='dismiss'){closeModal();return;}
    if(action==='reset'){Object.assign(state,{uf:'BR',age:'all',cohort:'all'});render();return;}
    if(action==='mobile'||action==='mobile-close'){state.mobile=action==='mobile'?!state.mobile:false;render();return;}
    if(action==='export'){exportData();return;}
    if(action==='export-agenda'){downloadCSV('marie_pauta_gestao.csv',agenda.map(a=>({...a,fonte:a.source})));return;}
    if(action==='agenda'){showAgenda();return;}
    if(action==='demo-info'||action==='about'){demoInfo();return;}
    if(action==='cohort-help'){cohortHelp();return;}
    if(action==='open-integrated'){state.nutritionSource='compare';navigate('nutrition');return;}
    if(action==='open-context'){state.scatterX='water_network_pct';state.scatterY='idhm_education_2019';state.crossMode='territorial';navigate('cross');return;}
    if(action==='print'){window.print();return;}
  });
  document.addEventListener('change',ev=>{
    const t=ev.target;
    const ids={'uf-select':'uf','age-select':'age','cohort-select':'cohort','map-metric':'mapMetric','compare-uf':'compare','nutrition-metric':'nutritionMetric','heat-dimension':'heatDimension','cross-a':'crossA','cross-b':'crossB','scatter-x':'scatterX','scatter-y':'scatterY','uk-endpoint':'ukEndpoint','uk-profile':'ukProfile','risk-category':'riskCategory','risk-direction':'riskDirection'};
    if(ids[t.id]){state[ids[t.id]]=t.value;render();return;}
    if(t.dataset.agendaStatus){const a=agenda.find(a=>a.id===t.dataset.agendaStatus);if(a){a.status=t.value;persistAgenda();notify('Status da pauta atualizado.');}}
  });
  document.addEventListener('input',ev=>{if(ev.target.id==='table-search'){const q=ev.target.value.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g,'');let n=0;document.querySelectorAll('[data-table-state]').forEach(tr=>{const label=tr.dataset.tableState.normalize('NFD').replace(/[\u0300-\u036f]/g,'');tr.hidden=!label.includes(q);if(!tr.hidden)n++;});const empty=$('#table-no-results');if(empty)empty.hidden=n>0;}});
  document.addEventListener('keydown',ev=>{
    if(ev.key==='Escape'){closeModal();removeTip();if(state.mobile){state.mobile=false;render();}}
    if((ev.key==='Enter'||ev.key===' ')&&ev.target.matches('[data-uf],[data-age]')&&!ev.target.matches('button')){ev.preventDefault();ev.target.dispatchEvent(new MouseEvent('click',{bubbles:true}));}
    if(ev.key==='Tab'&&$('#modal-root .modal')){const controls=[...$('#modal-root .modal').querySelectorAll('button,a,select,input,[tabindex="0"]')].filter(x=>!x.disabled),first=controls[0],last=controls[controls.length-1];if(ev.shiftKey&&document.activeElement===first){ev.preventDefault();last?.focus();}else if(!ev.shiftKey&&document.activeElement===last){ev.preventDefault();first?.focus();}}
  });
  function removeTip(){document.querySelectorAll('.map-tooltip').forEach(x=>x.remove());}
  document.addEventListener('pointerover',ev=>{const t=ev.target.closest('[data-tip]');if(!t)return;removeTip();const [title,value]=t.dataset.tip.split('|'),tip=document.createElement('div');tip.className='map-tooltip';tip.innerHTML=`<strong>${e(title)}</strong><span>${e(value)}</span>`;document.body.appendChild(tip);applyLanguage(tip);});
  document.addEventListener('pointermove',ev=>{const tip=$('.map-tooltip');if(tip){tip.style.left=Math.min(ev.clientX+15,window.innerWidth-250)+'px';tip.style.top=Math.max(10,ev.clientY-58)+'px';}});
  document.addEventListener('pointerout',ev=>{if(ev.target.closest('[data-tip]'))removeTip();});
  window.addEventListener('hashchange',()=>{const page=location.hash.replace('#','');if(allowedPages.includes(page))navigate(page);});
  await render();
  fetch('brazil-map.json').then(r=>{if(!r.ok)throw new Error('Map unavailable');return r.json();}).then(g=>{if(g.type==='FeatureCollection'&&g.features?.length===27){geometry=g;render();}}).catch(()=>{});
  // Read-only UI hooks used by the reproducible interaction checks.
  window.MARIE_APP = {getState:()=>({...state}),navigate,render,getFilters,exportData,whenReady:()=>D.ready,version:'3.1.0-bilingual-scroll'};
})();
