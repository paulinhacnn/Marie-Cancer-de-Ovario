/**
 * Verificação das interações sem navegador. Usa os dados reais empacotados.
 * Não é um teste de aparência/renderização visual.
 * Execute: node scripts/validate_app_interactions.cjs
 */
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const base=path.resolve(__dirname,'../frontend');
const elements={},listeners={},downloads=[],errors=[],objectUrls=new Map();
let nextURL=0;
function element(id=''){return {id,innerHTML:'',textContent:'',style:{},classList:{add(){},remove(){}},focus(){},appendChild(){},remove(){},querySelectorAll(){return []},click(){downloads.push({filename:this.download,blob:objectUrls.get(this.href)})},isConnected:true};}
['app','modal-root','toast'].forEach(id=>elements[id]=element(id));
const context={
 console:{log(){},warn(){},error(...args){errors.push(args.map(String).join(' '));}},Intl,Blob,
 URL:{createObjectURL(blob){const u='blob:qa-'+ ++nextURL;objectUrls.set(u,blob);return u},revokeObjectURL(u){objectUrls.delete(u)}},
 setTimeout,clearTimeout,MouseEvent:class{},location:{hash:''},
 history:{replaceState(_a,_b,h){context.location.hash=h}},
 localStorage:{data:{},getItem(k){return this.data[k]??null},setItem(k,v){this.data[k]=v}},
 fetch:async(url)=>({ok:fs.existsSync(path.join(base,url)),json:async()=>JSON.parse(fs.readFileSync(path.join(base,url),'utf8'))})
};
context.document={activeElement:null,body:element('body'),title:'',
 querySelector(s){if(s.startsWith('#')&&!s.includes(' '))return elements[s.slice(1)]||null;return null},
 querySelectorAll(){return []},getElementById(id){return elements[id]||null},createElement(){return element()},
 addEventListener(name,fn){listeners[name]=fn}
};
context.window=context;context.scrollTo=()=>{};context.addEventListener=()=>{};context.innerWidth=1440;context.print=()=>{};
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(base,'data.js'),'utf8'),context);
vm.runInContext(fs.readFileSync(path.join(base,'app.js'),'utf8'),context);
const html=()=>elements.app.innerHTML;
async function settle(){
 for(let i=0;i<12;i++)await new Promise(resolve=>setImmediate(resolve));
 if(context.MARIE_APP)await context.MARIE_APP.render();
 assert.equal(errors.length,0,errors.join('\n'));
}
async function change(id,value){listeners.change({target:{id,value,dataset:{}}});await settle();}
async function click(dataset){listeners.click({target:{closest(){return {dataset}}},preventDefault(){}});await settle();}
async function page(p){await context.MARIE_APP.navigate(p);await settle();}
function checkView(label){
 assert(html().length>6000,label+' tem conteúdo');
 assert(!/\b(?:NaN|undefined|Infinity)\b/.test(html()),label+' não deve renderizar valor inválido');
 assert(!/SINTETICO_DEMONSTRACAO|CENÁRIO SINTÉTICO|Dados simulados|população nacional do cenário/.test(html()),label+' não deve usar dados sintéticos');
 assert(!/OncoLens|Onco<span>Lens/i.test(html()),label+' usa somente a nova marca');
 assert(html().includes('assets/marie-logo.jpeg'),label+' usa logo Marie original');
 assert(html().includes('FAPESP · PIPE Fase 2'),label+' mantém identificação PIPE II');
}
async function lastCsv(){return downloads.at(-1).blob.text();}
async function main(){
 await context.ONCO.ready;await settle();
 assert(context.MARIE_APP,'Inicialização do app');
 assert.equal(context.ONCO.contextData.rows.length,28);
 assert.equal((html().match(/class="uf(?: selected)?"/g)||[]).length,27,'27 geometrias oficiais');
 for(const p of ['overview','population','risk','nutrition','cross','care','onehealth','evidence','research','sources']){
   await page(p);checkView(p);
   context.MARIE_APP.exportData();
   assert(downloads.at(-1).filename.endsWith('_dados_reais.csv'),'Exportação identificada');
   assert((await lastCsv()).length>100,p+' exportável');
 }
 await page('nutrition');
 await change('heat-dimension','education');
 assert(html().includes('data-heat-cell="fruit|'),'Células alimentares por escolaridade');
 assert(html().includes('data-heat-cell="treatedWater|'),'Água no mapa de calor');
 const first=html().match(/data-heat-cell="([^"]+)"/)[1];
 await click({heatCell:first});
 assert(elements['modal-root'].innerHTML.includes('IC95%'),'Modal mostra intervalo');
 assert(!elements['modal-root'].innerHTML.includes('&lt;span'),'Modal não mostra código HTML literal');
 await click({action:'close-modal'});
 await change('uf-select','BR');await change('age-select','30-39');await change('cohort-select','ovarian');
 assert(html().includes('5 entrevistadas neste recorte'),'N real da coorte pequena');
 assert(html().includes('Resultado exploratório e inconclusivo'),'Aviso explícito de incerteza');
 assert(html().includes('50,3%')&&html().includes('9,9–90,4%'),'Ponto e IC reais para frutas com n=5');
 assert(html().includes('n = 5 · 2 com a característica'),'Contagem de respostas e eventos');
 assert(!html().includes('estimativas suprimidas'),'Não bloqueia grupo pequeno');
 checkView('Coorte pequena');
 await change('uf-select','SP');
 assert(html().includes('1 entrevistadas neste recorte'),'N=1 visível');
 assert(html().includes('100,0%')&&html().includes('IC95% não calculável'),'Limite observado sem intervalo degenerado');
 await change('uf-select','BR');await change('age-select','18-29');
 assert(html().includes('Sem observações válidas neste recorte'),'N zero preserva ausência');
 assert(html().includes('data-nutrition-source="uk"'),'N zero não bloqueia acesso ao UKB');
 await click({nutritionSource:'uk'});
 checkView('Alimentação UK Biobank');
 assert(html().includes('107.919')&&html().includes('291')&&html().includes('143'),'Amostra e eventos publicados de ovário');
 assert(html().includes('1,19 (1,08–1,30)')&&html().includes('1,30 (1,13–1,50)'),'HRs e ICs britânicos');
 assert(!html().includes('id="age-select"')&&!html().includes('id="uf-select"'),'Filtros PNS não aparecem no UKB');
 assert(html().includes('homens e mulheres'),'Perfis da coorte completa identificados');
 assert(html().includes('1,45 (0,98–2,15)')&&html().includes('inclui 1'),'Quartil de incidência inconclusivo');
 await change('uk-endpoint','mortality');
 assert(html().includes('1,91 (1,08–3,39)'),'Seletor troca para quartis de mortalidade');
 await change('uk-profile','vegetables_mean_g_day');
 assert(html().includes('211,8 g/dia')&&html().includes('132,6 g/dia'),'Perfis alimentares publicados por quartil');
 await click({ukQuartile:'Q4'});
 assert(html().includes('Q4 · maior consumo selecionado'),'Inspeção dinâmica do quartil');
 context.MARIE_APP.exportData();
 const ukcsv=await lastCsv();
 assert(ukcsv.includes('EVIDENCIA_PUBLICADA_UKB')&&!ukcsv.includes('IBGE PNS'),'CSV britânico não recebe linhas brasileiras');
 assert(ukcsv.includes('107919')&&ukcsv.includes('1.19'),'Exportação preserva valores originais');
 assert(ukcsv.includes('n_mulheres_modelo_total')&&ukcsv.includes('n_mulheres_quartil')&&ukcsv.includes('28272'),'CSV distingue N do modelo e de cada quartil');
 await click({nutritionSource:'compare'});
 await change('age-select','30-39');
 await change('nutrition-metric','fruit');
 assert(html().includes('as associações observadas no UK Biobank'),'Objetivo integrado visível');
 assert(html().includes('n = 5 entrevistadas')&&html().includes('50,3%'),'Grupos brasileiros no integrado');
 assert(html().includes('255,0 g/dia'),'Perfil externo usa gramas/dia');
 assert(html().includes('5+ dias por semana')||html().includes('5 dias/semana'),'Unidade brasileira visível');
 context.MARIE_APP.exportData();
 const integratedcsv=await lastCsv();
 assert(integratedcsv.includes('EVIDENCIA_PUBLICADA_UKB')&&integratedcsv.includes('IBGE PNS 2019'),'CSV integrado mantém origens');
 await page('risk');
 assert((html().match(/data-risk-id=/g)||[]).length===18,'Tabela inclui 18 fatores/contextos verificados');
 await change('risk-direction','context');
 assert((html().match(/data-risk-id=/g)||[]).length===3,'Filtro mostra contexto sem chamar de risco clínico');
 await change('risk-direction','all');await change('risk-category','metabolic');
 assert(html().includes('data-risk-explore="obesity"'),'Atalho para variável disponível');
 await click({riskExplore:'obesity'});
 assert.equal(context.MARIE_APP.getState().page,'nutrition');
 assert.equal(context.MARIE_APP.getState().nutritionMetric,'obesity');
 await page('research');
 assert((html().match(/class="scholarship-card"/g)||[]).length===5,'Cinco bolsas presentes');
 for(const process of ['25/14126-3','23/13767-0','26/21806-3','26/04565-2','26/04434-5','26/04531-0','26/04794-1'])assert(html().includes(process),process+' verificado na tela');
 assert(html().includes('Keteryne Rodrigues da Silva')&&html().includes('Francisco Bruno de Sousa Rocha'),'Beneficiários publicados');
 context.MARIE_APP.exportData();
 assert((await lastCsv()).includes('26/21806-3'),'Exportação das bolsas');
 await click({action:'reset'});
 await page('cross');await change('cross-a','fruit');await change('cross-b','ovarian');
 assert(html().includes('10.000'),'Frequência do evento raro usa 10.000');
 assert(!html().includes('<b>0</b>'),'Evento raro não arredondado para zero');
 await change('cross-a','ovarian');await change('cross-b','fruit');
 assert(html().includes('Com a característica A'),'Orientação inversa disponível');
 assert(html().includes('38,5%'),'Frutas entre entrevistadas com relato de ovário');
 await change('uf-select','SP');
 context.MARIE_APP.exportData();
 const smallcrosscsv=await lastCsv();
 assert(smallcrosscsv.includes('inconclusive')&&smallcrosscsv.includes('rare_cell')&&smallcrosscsv.includes('n_valido'),'CSV preserva incerteza e denominador da célula rara');
 await click({action:'reset'});
 await change('cross-a','healthPlan');await change('cross-b','networkWater');
 assert(html().includes('Tabela 2 × 2'),'Indicadores adicionais acessíveis');
 await change('uf-select','ES');await change('cross-a','sugary');await change('cross-b','obesity');
 assert(html().includes('Exploratório e inconclusivo'),'Alta incerteza mantém leitura exploratória');
 await click({action:'reset'});await click({crossMode:'territorial'});await click({preset:'education'});
 assert.equal(context.MARIE_APP.getState().scatterX,'idhm_education_2019');
 assert.equal((html().match(/class="scatter-dot/g)||[]).length,27,'27 UFs sem Brasil na nuvem');
 assert(html().includes('IDHM Educação'),'Eixo educação contextual');
 assert(html().includes('0,60'),'Índice na escala de 0 a 1');
 await change('age-select','80+');
 assert(html().includes('n válido 69; 2 com a característica'),'Dispersão conserva N e numerador por eixo PNS');
 assert(html().includes('stat-cell'),'Tabela territorial tem precisão por eixo');
 context.MARIE_APP.exportData();
 const territorialcsv=await lastCsv();
 assert(territorialcsv.includes('qualidade_B')&&territorialcsv.includes('0.86951'),'CSV conserva CV e qualidade de ES 80+');
 await change('age-select','all');
 await click({preset:'oncology'});
 assert(html().includes('2022')&&html().includes('2024'),'Anos distintos visíveis');
 assert(html().includes('tamanho e da estrutura etária'),'Leitura correta de contagens');
 await change('age-select','30-39');await change('uf-select','SP');
 await page('care');
 assert(/print-title[^>]*>[^<]*Todas as idades/.test(html()),'Cabeçalho care não recebe filtro etário PNS');
 assert(!html().includes('id="age-select"'),'SIM preserva faixas próprias');
 context.MARIE_APP.exportData();
 const carecsv=await lastCsv();
 assert(carecsv.includes('"SP"')&&!carecsv.includes('"RJ"'),'CSV respeita UF selecionada');
 assert(html().includes('66,2%'),'Parcela60+ correta em SP');
 await page('onehealth');
 assert(html().includes('IDHM')&&html().includes('2021')&&html().includes('2019'),'Contexto com ambas referências');
 await click({action:'open-context'});
 assert.equal(context.MARIE_APP.getState().crossMode,'territorial');
 await page('overview');await click({save:'evidence'});
 let agenda=JSON.parse(context.localStorage.data['marie-ovario-agenda-real-v3']);
 assert(agenda[0].source.includes('Cassidy'),'Pauta preserva fonte de literatura');
 await click({save:'evidence'});
 assert.equal(JSON.parse(context.localStorage.data['marie-ovario-agenda-real-v3']).length,1,'Pauta sem duplicação');
 await click({action:'close-modal'});
 for(const uf of ['BR','RR','SP'])for(const age of ['all','18-29','80+']){
   await change('uf-select',uf);await change('age-select',age);
   for(const p of ['overview','population','nutrition','onehealth']){await page(p);checkView(p+' '+uf+' '+age);}
 }
 assert.equal(errors.length,0);
 const css=fs.readFileSync(path.join(base,'styles.css'),'utf8');
 assert(css.includes('overflow-y:scroll')&&css.includes('scrollbar-gutter:stable'),'Rolagem vertical explícita');
 assert(css.includes('.table-scroll{overflow-x:auto'),'Rolagem horizontal de tabelas');
 console.log('PASS: 10 páginas Marie, logos originais, 27 UFs, pequenos grupos visíveis com n/IC/inconclusivo, zeros sem IC degenerado, ausência sem dados inventados, UKB e quartis reais, integrado com unidades próprias, 18 fatores, 2 projetos/5 bolsas, cruzamentos inversos, exportações e pauta; 36 recortes adicionais. Verificação de lógica e CSS, sem renderização visual de navegador.');
}
main().catch(error=>{console.error(error);process.exitCode=1});
