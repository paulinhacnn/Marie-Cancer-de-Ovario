/* Source-level validation: not a substitute for browser/clinical review. */
const assert=require('assert');
const fs=require('fs');const path=require('path');const vm=require('vm');
const root=path.join(__dirname,'..');
const ctx={window:{}};
vm.createContext(ctx);
for(const n of ['i18n-en.js','i18n-en-data.js','i18n-en-extra.js'])vm.runInContext(fs.readFileSync(path.join(root,'frontend',n),'utf8'),ctx);
const i18n=ctx.window.MARIE_I18N,src=ctx.window.MARIE_SOURCE_TRANSLATIONS;
assert(i18n&&src,'English language modules present');
const risk=JSON.parse(fs.readFileSync(path.join(root,'frontend/data/risk-factors.json')));
const evidence=JSON.parse(fs.readFileSync(path.join(root,'frontend/data/evidence.json')));
assert(risk.items.length===18);
for(const c of risk.categories)assert(src.categories[c.id]&&src.categories[c.id].length>5,'Risk category '+c.id);
for(const r of risk.items){const t=src.risk[r.id];assert(t&&t.length===4&&t[0].length>3&&t.slice(1).every(x=>x.length>12),'Risk source translation '+r.id);}
for(const s of evidence.studies)assert(src.evidence[s.title]?.length===4,'Evidence source '+s.title);
for(const m of evidence.mechanisms)assert(src.mechanisms[m.compound]?.length===3,'Mechanism '+m.compound);
for(const [pt] of [['Visão executiva'],['População'],['Fatores de risco'],['Alimentação'],['Cruzamentos'],['Atenção oncológica'],['One Health'],['Evidências'],['Projetos e bolsas'],['Fontes e método']])assert(i18n.dict.has(pt),'Page label '+pt);
for(const p of ['95% CI','self-reported','Observed deaths','estimated','observational','individual']){
 const complete=[...i18n.dict.values(),...Object.values(src.risk).flat(),...Object.values(src.evidence).flat()];
 assert(complete.some(x=>x.toLowerCase().includes(p.toLowerCase())),'English scientific terminology '+p);
}
const css=fs.readFileSync(path.join(root,'frontend/marie-theme.css'),'utf8');
const bridge=fs.readFileSync(path.join(root,'frontend/streamlit-bridge.js'),'utf8');
const app=fs.readFileSync(path.join(root,'app.py'),'utf8');
assert(css.includes('--marie-wine')&&css.includes('.lang-switch'));
assert(bridge.includes('ResizeObserver')&&bridge.includes('streamlit:setFrameHeight'));
assert(!app.includes('height:100dvh !important'));
console.log('PASS: English navigation, 18 risk records, 5 evidence studies, 3 experimental mechanisms, scientific terminology, logo palette, dynamic Streamlit height.');
