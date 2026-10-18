/*
 * Marie Câncer de Ovário — adapter for retained, real public aggregates.
 * PNS 2019 estimates are computed by the reproducible Python survey pipeline.
 * SIM 2024 deaths and INCA 2026 estimates retain their own units and age scope.
 * This file contains no generated people, fitted records, or imputed counts.
 * Small samples remain descriptive and inconclusive; null means no estimate.
 */
(function (global) {
  'use strict';

  const states = [
    {uf:'AC',name:'Acre',region:'Norte',code:'12'},
    {uf:'AL',name:'Alagoas',region:'Nordeste',code:'27'},
    {uf:'AP',name:'Amapá',region:'Norte',code:'16'},
    {uf:'AM',name:'Amazonas',region:'Norte',code:'13'},
    {uf:'BA',name:'Bahia',region:'Nordeste',code:'29'},
    {uf:'CE',name:'Ceará',region:'Nordeste',code:'23'},
    {uf:'DF',name:'Distrito Federal',region:'Centro-Oeste',code:'53'},
    {uf:'ES',name:'Espírito Santo',region:'Sudeste',code:'32'},
    {uf:'GO',name:'Goiás',region:'Centro-Oeste',code:'52'},
    {uf:'MA',name:'Maranhão',region:'Nordeste',code:'21'},
    {uf:'MT',name:'Mato Grosso',region:'Centro-Oeste',code:'51'},
    {uf:'MS',name:'Mato Grosso do Sul',region:'Centro-Oeste',code:'50'},
    {uf:'MG',name:'Minas Gerais',region:'Sudeste',code:'31'},
    {uf:'PA',name:'Pará',region:'Norte',code:'15'},
    {uf:'PB',name:'Paraíba',region:'Nordeste',code:'25'},
    {uf:'PR',name:'Paraná',region:'Sul',code:'41'},
    {uf:'PE',name:'Pernambuco',region:'Nordeste',code:'26'},
    {uf:'PI',name:'Piauí',region:'Nordeste',code:'22'},
    {uf:'RJ',name:'Rio de Janeiro',region:'Sudeste',code:'33'},
    {uf:'RN',name:'Rio Grande do Norte',region:'Nordeste',code:'24'},
    {uf:'RS',name:'Rio Grande do Sul',region:'Sul',code:'43'},
    {uf:'RO',name:'Rondônia',region:'Norte',code:'11'},
    {uf:'RR',name:'Roraima',region:'Norte',code:'14'},
    {uf:'SC',name:'Santa Catarina',region:'Sul',code:'42'},
    {uf:'SP',name:'São Paulo',region:'Sudeste',code:'35'},
    {uf:'SE',name:'Sergipe',region:'Nordeste',code:'28'},
    {uf:'TO',name:'Tocantins',region:'Norte',code:'17'}
  ];
  const ages = [
    {id:'18-29',label:'18–29 anos'}, {id:'30-39',label:'30–39 anos'},
    {id:'40-49',label:'40–49 anos'}, {id:'50-59',label:'50–59 anos'},
    {id:'60-69',label:'60–69 anos'}, {id:'70-79',label:'70–79 anos'},
    {id:'80+',label:'80 anos ou mais'}
  ];
  const metrics = [
    {id:'fruit',label:'Frutas ≥ 5 dias/semana',description:'Frequência semanal de consumo de frutas; PNS 2019, P018.'},
    {id:'vegetables',label:'Verduras e legumes ≥ 5 dias/semana',description:'Frequência semanal de verduras e legumes; PNS 2019, P00901.'},
    {id:'beans',label:'Feijão ≥ 5 dias/semana',description:'Frequência semanal de feijão; PNS 2019, P006.'},
    {id:'sugary',label:'Refrigerante ≥ 5 dias/semana · inclui diet/zero',description:'PNS 2019, P02002: inclui refrigerantes diet/zero. Não identifica somente bebidas açucaradas.'},
    {id:'ultra',label:'Ultraprocessados: ≥ 5 grupos no dia anterior',description:'Cinco ou mais dos dez grupos alimentares da PNS 2019. Não é participação na energia ingerida.'},
    {id:'obesity',label:'IMC ≥ 30 · peso e altura referidos',description:'Peso e altura finais referidos, inclusive imputações do IBGE. Gestantes e gravidez desconhecida excluídas; não usa antropometria aferida.'},
    {id:'healthPlan',label:'Plano de saúde médico',description:'Relato de plano de saúde médico; PNS 2019, I00102.'}
  ];

  const validUFs = new Set(['BR', ...states.map(s => s.uf)]);
  const validAges = new Set(['all', ...ages.map(a => a.id)]);
  const validCohorts = new Set(['all','ovarian','no_ovarian']);
  const details = new Map();
  const detailIndex = new Map();
  const pending = new Map();
  const summaryIndex = new Map();
  const deathIndex = new Map();
  const incidenceIndex = new Map();
  const finite = value => typeof value === 'number' && Number.isFinite(value) ? value : null;
  const key = (uf, age, cohort) => `${uf}|${age}|${cohort}`;
  const reasons = {
    ok:'Estimativa descritiva; consulte o intervalo de confiança de 95%.',
    caution:'Estimativa com maior incerteza: consulte o intervalo de confiança de 95%.',
    inconclusive:'Resultado exploratório e inconclusivo. A amostra pequena, os valores extremos ou a alta incerteza limitam a interpretação.',
    high_uncertainty:'Estimativa suprimida porque o coeficiente de variação supera 30%.',
    insufficient_sample:'Estimativa suprimida porque há menos de 30 observações válidas.',
    suppressed_rare:'Resultado suprimido para proteger células ou complementos com menos de 5 observações.',
    no_data:'Nenhuma observação válida neste recorte.',
    partial_uncertainty:'Há células suprimidas por alta incerteza; as demais conservam seus próprios intervalos.',
    not_loaded:'Os detalhes deste território ainda não foram carregados.',
    invalid_filter:'O filtro informado não corresponde aos recortes disponíveis nesta fonte.',
    unavailable:'Este resultado não foi calculado nos agregados disponibilizados.'
  };
  const api = {
    states, ages, metrics, ready:null, metadata:null, adminData:null,
    raw:{manifest:null,summary:null,admin:null,ufs:Object.create(null)},
    ensure, aggregate, groups, cross, ovarianN, mortality, mortalityAges, incidence,
    isLoaded: uf => details.has(uf),
    isSynthetic:false
  };
  global.ONCO = api;

  function filters(input) {
    const f = input || {};
    return {uf:f.uf == null ? 'BR' : f.uf, age:f.age == null ? 'all' : f.age,
      cohort:f.cohort == null ? 'all' : f.cohort};
  }
  function isValid(f) {
    return validUFs.has(f.uf) && validAges.has(f.age) && validCohorts.has(f.cohort);
  }
  async function getJSON(path) {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`Não foi possível carregar ${path} (HTTP ${response.status}).`);
    return response.json();
  }
  async function ensure(uf) {
    if (!validUFs.has(uf)) throw new Error(`Território não disponível: ${String(uf)}.`);
    if (details.has(uf)) return details.get(uf);
    if (pending.has(uf)) return pending.get(uf);
    const request = getJSON(`data/pns/uf/${uf}.json`).then(data => {
      if (data.uf !== uf || !Array.isArray(data.rows)) throw new Error(`Estrutura PNS inválida em ${uf}.`);
      details.set(uf,data);
      api.raw.ufs[uf] = data;
      for (const row of data.rows) detailIndex.set(key(uf,row.age,row.cohort),row);
      return data;
    }).finally(() => pending.delete(uf));
    pending.set(uf,request);
    return request;
  }
  function findRow(f, detailedOnly=false) {
    if (!isValid(f)) return null;
    return detailIndex.get(key(f.uf,f.age,f.cohort)) ||
      (!detailedOnly && f.cohort === 'all' ? summaryIndex.get(key(f.uf,f.age,'all')) : null) || null;
  }
  function estimate(raw) {
    if (!raw) return {pct:null,low:null,high:null,nValid:null,nEvent:null,cv:null,
      quality:'unavailable',suppressed:true,reason:reasons.unavailable};
    const pct = finite(raw.pct);
    return {...raw,pct,low:finite(raw.low),high:finite(raw.high),
      suppressed:pct === null,reason:reasons[raw.quality] || reasons.unavailable};
  }
  function normalize(row, f, unavailableReason) {
    const rates = {}, estimates = {};
    for (const metric of metrics) {
      const stat = estimate(row?.rates?.[metric.id]);
      rates[metric.id] = stat.pct;
      estimates[metric.id] = stat;
    }
    const women = finite(row?.women), n = finite(row?.n);
    const hasAnyEstimate = Object.values(rates).some(value => value !== null);
    const hasSuppressedEstimates = Object.values(rates).some(value => value === null);
    const populationCode = row?.populationQuality || row?.quality || unavailableReason || 'unavailable';
    // Publication checks are already applied to each estimate by the survey pipeline.
    // A suppressed population total does not erase an otherwise publishable ratio.
    const suppressed = women === null && !hasAnyEstimate;
    const inconclusive = populationCode === 'inconclusive' || Object.values(estimates).some(stat => stat.quality === 'inconclusive');
    const caution = populationCode !== 'ok' || hasSuppressedEstimates ||
      Object.values(estimates).some(stat => !['ok','no_data'].includes(stat.quality));
    const quality = suppressed ? 'no_data' : inconclusive ? 'inconclusive' : caution ? 'caution' : 'ok';
    let reason = reasons[populationCode] || reasons.unavailable;
    if (!suppressed && hasSuppressedEstimates) {
      reason = 'Alguns indicadores não têm respostas válidas neste recorte. Os demais mostram a estimativa, o n real e a incerteza.';
    }
    return {uf:f.uf,age:f.age,cohort:f.cohort,year:2019,women,n,
      womenLow:finite(row?.womenLow),womenHigh:finite(row?.womenHigh),
      rates,estimates,quality,qualityCode:populationCode,suppressed,hasSuppressedEstimates,reason,
      ovarianRate:row?.ovarianRate ? estimate(row.ovarianRate) : null,
      raw:row || null};
  }
  function aggregate(input) {
    const f = filters(input);
    return normalize(findRow(f),f,!isValid(f) ? 'invalid_filter' : !details.has(f.uf) ? 'not_loaded' : 'unavailable');
  }
  function groups(input, dimension) {
    const f = filters(input);
    if (!isValid(f)) return [];
    if (dimension === 'state') {
      const scope = f.uf === 'BR' ? states : states.filter(state => state.uf === f.uf);
      return scope.map(state => ({id:state.uf,label:state.name,region:state.region,...aggregate({...f,uf:state.uf})}));
    }
    if (dimension === 'age') {
      const scope = f.age === 'all' ? ages : ages.filter(age => age.id === f.age);
      const row = findRow(f,true);
      return scope.map(age => {
        const original = row?.groups?.age?.find(group => group.label === age.id);
        return {id:age.id,label:age.label,...aggregate({...f,age:age.id}),
          share:finite(original?.pct),shareEstimate:estimate(original)};
      });
    }
    if (!['education','income','race'].includes(dimension)) return [];
    const row = findRow(f,true);
    const originals = row?.groups?.[dimension];
    const labels = originals || api.metadata?.groups?.[dimension] || [];
    return labels.map(item => {
      const original = originals ? item : null;
      return {id:item.id,label:item.label,
        ...normalize(original,f,details.has(f.uf) ? 'unavailable' : 'not_loaded'),
        share:finite(original?.pct),shareEstimate:estimate(original)};
    });
  }
  function emptyCross(f, a, b, code, reason) {
    return {uf:f.uf,age:f.age,cohort:f.cohort,a,b,n:null,total:null,cells:[],conditional:{},
      quality:'suppressed',qualityCode:code,suppressed:true,hasSuppressedCells:true,
      reason:reason || reasons[code] || reasons.unavailable,raw:null};
  }
  function cross(input, a, b) {
    const f = filters(input);
    if (!isValid(f)) return emptyCross(f,a,b,'invalid_filter');
    if (f.cohort !== 'all') return emptyCross(f,a,b,'unavailable',
      'Cruzamentos estão disponíveis para todas as mulheres. Os dados não permitem divulgar este cruzamento dentro da coorte selecionada.');
    if (a === b) return emptyCross(f,a,b,'invalid_filter','Selecione dois indicadores diferentes.');
    const row = findRow(f,true);
    if (!row) return emptyCross(f,a,b,details.has(f.uf) ? 'unavailable' : 'not_loaded');
    const original = row.crosses?.[`${a}|${b}`] || row.crosses?.[`${b}|${a}`];
    if (!original) return emptyCross(f,a,b,'unavailable');
    const flipped = original.a !== a;
    const cells = (original.cells || []).map(cell => {
      const stat = estimate(cell);
      return {...stat,a:Boolean(flipped ? cell.bValue : cell.aValue),
        b:Boolean(flipped ? cell.aValue : cell.bValue),
        women:stat.suppressed ? null : finite(cell.women),n:finite(cell.n),raw:cell};
    }).sort((x,y) => Number(x.a)-Number(y.a) || Number(x.b)-Number(y.b));
    const conditional = {};
    const names = ['b_given_a_true','b_given_a_false','a_given_b_true','a_given_b_false'];
    const swap = {b_given_a_true:'a_given_b_true',b_given_a_false:'a_given_b_false',
      a_given_b_true:'b_given_a_true',a_given_b_false:'b_given_a_false'};
    for (const name of names) {
      const stat = original.conditional?.[flipped ? swap[name] : name];
      if (stat) conditional[name] = estimate(stat);
    }
    const suppressed = cells.length !== 4 || cells.every(cell => cell.suppressed);
    const hasSuppressedCells = cells.length !== 4 || cells.some(cell => cell.suppressed);
    return {uf:f.uf,age:f.age,cohort:f.cohort,a,b,n:finite(original.nPaired),
      total:finite(original.womenPaired ?? original.total),cells,conditional,
      quality:suppressed ? 'no_data' : original.quality || 'caution',
      qualityCode:original.quality,suppressed,hasSuppressedCells,
      reason:reasons[original.quality] || reasons.unavailable,raw:original};
  }
  function ovarianN(input) {
    const f = {...filters(input),cohort:'ovarian'};
    if (!isValid(f)) return null;
    const ovarianRow = findRow(f,true);
    if (ovarianRow) {
      const n = finite(ovarianRow.n);
      return n;
    }
    const source = findRow({...f,cohort:'all'})?.ovarianRate;
    return finite(source?.nEvent);
  }
  function mortality(uf, age='all') {
    if (!validUFs.has(uf)) return null;
    return finite(deathIndex.get(`${uf}|${age}`)?.deaths);
  }
  function mortalityAges(uf) {
    if (!validUFs.has(uf)) return [];
    return (api.adminData?.mortality?.age_groups || []).map(age =>
      ({id:age.id,label:age.label,deaths:mortality(uf,age.id)}));
  }
  function incidence(uf) {
    if (!validUFs.has(uf)) return null;
    return incidenceIndex.get(uf) || null;
  }

  api.ready = (async function () {
    const [manifest,summary,admin] = await Promise.all([
      getJSON('data/pns/manifest.json'),getJSON('data/pns/summary.json'),getJSON('data/admin.json')
    ]);
    if (manifest.isSynthetic !== false || admin.synthetic !== false) {
      throw new Error('As fontes devem declarar explicitamente que os dados não são sintéticos.');
    }
    if (!Array.isArray(summary.rows) || !Array.isArray(admin.mortality?.rows)) {
      throw new Error('Estrutura das fontes PNS/SIM incompatível com o painel.');
    }
    api.metadata = api.raw.manifest = manifest;
    api.raw.summary = summary;
    api.adminData = api.raw.admin = admin;
    for (const [id,official] of Object.entries(manifest.metrics || {})) {
      let metric = metrics.find(item => item.id === id);
      if (!metric) {
        metric = {id,label:official.label};
        metrics.push(metric);
      }
      Object.assign(metric,{fullLabel:official.label,description:official.rule,
        variables:official.variables,unit:official.unit});
    }
    for (const row of summary.rows) summaryIndex.set(key(row.uf,row.age,row.cohort),row);
    for (const row of admin.mortality.rows) deathIndex.set(`${row.uf}|${row.age}`,row);
    for (const row of admin.incidence_estimate?.rows || []) incidenceIndex.set(row.uf,row);
    await Promise.all([ensure('BR'),ensure('SP')]);
    return api;
  })();
})(window);
