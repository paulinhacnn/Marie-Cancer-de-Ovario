/* Contract and epidemiological invariants for the retained real aggregates.
 * Run: node scripts/validate_frontend_data.cjs
 * Aggregate-only audit: node scripts/validate_frontend_data.cjs --raw-only
 * No network, packages, browser, or microdata required.
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const frontend = path.resolve(__dirname,'../frontend');
const requests = [];
const context = {
  window:{},
  fetch:async relative => {
    requests.push(relative);
    const filename = path.resolve(frontend,relative);
    assert(filename.startsWith(frontend+path.sep),'Only bundled aggregate files may be read.');
    return {ok:true,json:async () => JSON.parse(fs.readFileSync(filename,'utf8'))};
  }
};
const rawOnly = process.argv.includes('--raw-only');
if (!rawOnly) {
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(frontend,'data.js'),'utf8'),context);
}

function auditExploratoryAggregates() {
  const dir = path.join(frontend,'data/pns');
  const manifest = JSON.parse(fs.readFileSync(path.join(dir,'manifest.json'),'utf8'));
  assert.equal(manifest.schemaVersion,'pns-ovarian-1.5');
  assert.equal(manifest.qualityPolicy.mode,'exploratory');
  assert.equal(manifest.qualityPolicy.isOfficialIBGERule,false);
  assert.equal(manifest.qualityPolicy.suppressEstimates,false);
  assert.equal(manifest.qualityPolicy.publishUnweightedCounts,true);
  assert.equal(manifest.qualityPolicy.suppressComplementaryCounts,false);
  assert.equal(manifest.sample.adultWomen,46869);
  assert.equal(manifest.sample.ovarianSelfReportWomen,53);
  assert.equal(manifest.sample.noOvarianSelfReportWomen,46816);
  assert.equal(manifest.design.weight,'V00291');
  assert.equal(manifest.design.strata,'V0024');
  assert.equal(manifest.design.psu,'UPA_PNS');
  assert.equal(manifest.design.nPSU,8027);
  assert.equal(manifest.design.nStrata,574);
  assert.equal(manifest.design.degreesOfFreedom,7453);
  const national = manifest.nationalOvarian.prevalence;
  assert.equal(national.pct,0.1077);
  assert.equal(national.low,0.0704);
  assert.equal(national.high,0.1646);
  assert.equal(national.nValid,46869);
  assert.equal(national.nEvent,53);
  const audit = {territories:0,proportions:0,inconclusive:0,boundaries:0,noData:0,crosses:0};
  const countKeys = new Set(['n','nValid','nEvent','missing','nPaired']);
  const validQuality = new Set(['ok','caution','inconclusive','no_data']);
  function visit(value,location) {
    if (!value || typeof value !== 'object') return;
    if (Array.isArray(value)) {
      value.forEach((child,i) => visit(child,`${location}[${i}]`));
      return;
    }
    assert(!Object.hasOwn(value,'countsWithheld'),`${location}: obsolete complementary suppression`);
    for (const key of countKeys) {
      if (Object.hasOwn(value,key)) {
        assert(Number.isInteger(value[key]) && value[key] >= 0,`${location}.${key}: exact nonnegative sample count required`);
      }
    }
    if (Object.hasOwn(value,'pct') && Object.hasOwn(value,'nValid')) {
      audit.proportions++;
      const {nValid:n,nEvent:events,pct,low,high,quality,qualityReasons:reasons} = value;
      assert(validQuality.has(quality),`${location}: unknown quality flag`);
      assert(Array.isArray(reasons),`${location}: reasons must be explicit`);
      assert(events <= n,`${location}: numerator exceeds denominator`);
      if (n === 0) {
        audit.noData++;
        assert.equal(quality,'no_data');
        assert.equal(pct,null);
        assert.equal(low,null);
        assert.equal(high,null);
        assert.equal(value.cv,null);
      } else {
        assert(Number.isFinite(pct) && pct >= 0 && pct <= 100,`${location}: observed point must remain available`);
        assert.notEqual(quality,'no_data');
        if (n < 30 || Math.min(events,n-events) < 5 || (value.cv !== null && value.cv > .30001)) {
          assert.equal(quality,'inconclusive',`${location}: fragile estimate must be flagged`);
        }
        if (events === 0 || events === n) {
          audit.boundaries++;
          assert.equal(pct,events === 0 ? 0 : 100);
          assert.equal(low,null,`${location}: no degenerate boundary confidence interval`);
          assert.equal(high,null);
          assert.equal(value.cv,null);
          assert.equal(quality,'inconclusive');
          assert(reasons.includes('boundary'));
        } else if (low !== null || high !== null) {
          assert(Number.isFinite(low) && Number.isFinite(high));
          assert(low >= 0 && low <= pct && high >= pct && high <= 100);
          assert(low < high,`${location}: no false precision from degenerate confidence interval`);
        } else {
          assert.equal(quality,'inconclusive');
          assert(reasons.includes('no_variance'));
        }
      }
      if (quality === 'inconclusive') {
        audit.inconclusive++;
        assert(reasons.length > 0);
      }
    }
    if (Object.hasOwn(value,'nPaired') && Object.hasOwn(value,'cells')) {
      audit.crosses++;
      if (value.nPaired === 0) {
        assert.equal(value.quality,'no_data');
        assert.equal(value.cells.length,0);
        assert.equal(value.womenPaired,null);
      } else {
        assert.equal(value.cells.length,4,'Every observed binary pair retains all four cells.');
        assert.equal(value.cells.reduce((sum,cell) => sum+cell.n,0),value.nPaired);
        assert(Math.abs(value.cells.reduce((sum,cell) => sum+cell.women,0)-value.womenPaired)<.05);
        assert(Math.abs(value.cells.reduce((sum,cell) => sum+cell.pct,0)-100)<.001);
        const conditions = {b_given_a_true:['aValue',1,'bValue'],b_given_a_false:['aValue',0,'bValue'],
          a_given_b_true:['bValue',1,'aValue'],a_given_b_false:['bValue',0,'aValue']};
        for (const [key,[condition,level,outcome]] of Object.entries(conditions)) {
          const cells = value.cells.filter(cell => cell[condition] === level);
          const stat = value.conditional[key];
          assert.equal(stat.nValid,cells.reduce((sum,cell) => sum+cell.n,0));
          assert.equal(stat.nEvent,cells.filter(cell => cell[outcome] === 1).reduce((sum,cell) => sum+cell.n,0));
          if (stat.nValid > 0) {
            const denominator = cells.reduce((sum,cell) => sum+cell.women,0);
            const numerator = cells.filter(cell => cell[outcome] === 1).reduce((sum,cell) => sum+cell.women,0);
            // Cell totals are rounded to cents after estimation. This bound
            // allows only their rounding error, not a different denominator.
            assert(Math.abs(stat.pct - 100*numerator/denominator) <= .0001 + 2/denominator);
          }
        }
      }
    }
    for (const [key,child] of Object.entries(value)) visit(child,`${location}.${key}`);
  }
  for (const uf of manifest.ufs) {
    const data = JSON.parse(fs.readFileSync(path.join(dir,'uf',`${uf}.json`),'utf8'));
    assert.equal(data.uf,uf);
    assert.equal(data.rows.length,24);
    audit.territories++;
    for (const age of ['all',...manifest.ageBands]) {
      const rows = data.rows.filter(row => row.age === age);
      const all = rows.find(row => row.cohort === 'all');
      const ovarian = rows.find(row => row.cohort === 'ovarian');
      const noOvarian = rows.find(row => row.cohort === 'no_ovarian');
      assert.equal(all.n,ovarian.n+noOvarian.n,'Real cohort sample counts must partition each domain.');
      for (const row of rows) {
        if (row.n === 0) {
          assert.equal(row.quality,'no_data');
          assert.equal(row.women,null);
        } else {
          assert(Number.isFinite(row.women) && row.women > 0);
          if (row.n < 30) assert.equal(row.quality,'inconclusive');
        }
      }
    }
    visit(data,uf);
  }
  assert.equal(audit.territories,28);
  assert(audit.boundaries > 0 && audit.inconclusive > 0 && audit.noData > 0);
  return audit;
}

(async () => {
  const rawAudit = auditExploratoryAggregates();
  if (rawOnly) {
    console.log(JSON.stringify({validation:'PASS',pnsSchema:'pns-ovarian-1.5',rawAudit},null,2));
    return;
  }
  const D = await context.window.ONCO.ready;
  assert.equal(D.isSynthetic,false);
  assert.equal(D.metadata.isSynthetic,false);
  assert.equal(D.states.length,27);
  assert.equal(D.metrics.length,Object.keys(D.metadata.metrics).length);
  assert.equal(requests.length,5,'Initial load is manifest, summary, admin, BR, SP.');

  const br = D.aggregate({uf:'BR',age:'all',cohort:'all'});
  assert.equal(br.n,D.metadata.sample.adultWomen);
  assert.equal(br.women,D.metadata.sample.weightedAdultWomen2019);
  assert.equal(br.rates.fruit,br.raw.rates.fruit.pct);
  assert.equal(br.rates.sugary,br.raw.rates.sugary.pct);
  assert(D.metrics.find(m => m.id === 'sugary').label.includes('diet/zero'));
  assert.equal(D.ovarianN({uf:'BR'}),D.metadata.sample.ovarianSelfReportWomen);
  assert.equal(D.ovarianN({uf:'SP'}),4,'A small observed count is shown exactly in exploratory mode.');
  const noOvarian = D.aggregate({uf:'BR',cohort:'no_ovarian'});
  assert.equal(noOvarian.n,46816);
  assert.equal(noOvarian.raw.countsWithheld,undefined);
  const small = D.aggregate({uf:'BR',age:'30-39',cohort:'ovarian'});
  assert.equal(small.n,5);
  assert.equal(small.suppressed,false);
  assert.equal(small.rates.fruit,50.3113);
  assert.equal(small.estimates.fruit.nValid,5);
  assert.equal(small.estimates.fruit.nEvent,2);
  assert.equal(small.estimates.fruit.low,9.8619);
  assert.equal(small.estimates.fruit.high,90.3573);
  assert.equal(small.estimates.fruit.quality,'inconclusive');
  assert(small.estimates.fruit.qualityReasons.includes('small_sample'));
  const noData = D.aggregate({uf:'BR',age:'18-29',cohort:'ovarian'});
  assert.equal(noData.n,0);
  assert.equal(noData.raw.quality,'no_data');
  assert.equal(noData.women,null);
  assert.equal(noData.rates.fruit,null,'An empty domain is never converted into a zero estimate.');
  const single = D.aggregate({uf:'SP',age:'30-39',cohort:'ovarian'});
  assert.equal(single.n,1);
  assert.equal(single.rates.fruit,100);
  assert.equal(single.estimates.fruit.nEvent,1);
  assert.equal(single.estimates.fruit.low,null);
  assert.equal(single.estimates.fruit.high,null);
  assert.equal(single.estimates.fruit.cv,null);
  assert.equal(single.estimates.fruit.quality,'inconclusive');
  const observedZero = Object.values(single.estimates).find(stat => stat.nValid === 1 && stat.nEvent === 0);
  assert(observedZero,'An observed zero with a nonempty denominator must remain available.');
  assert.equal(observedZero.pct,0);
  assert.equal(observedZero.low,null);
  assert.equal(observedZero.high,null);
  assert.equal(observedZero.quality,'inconclusive');

  const ageRows = D.groups({uf:'BR'},'age');
  assert.equal(ageRows.reduce((n,row) => n+row.n,0),br.n);
  const school = D.groups({uf:'BR'},'education');
  assert(school.every(row => row.share === row.raw.pct));
  assert(school.every(row => row.rates.fruit === row.raw.rates.fruit.pct));

  const joint = D.cross({uf:'BR'},'fruit','obesity');
  const reverse = D.cross({uf:'BR'},'obesity','fruit');
  assert.equal(joint.suppressed,false);
  assert.equal(joint.n,joint.raw.nPaired);
  assert.equal(joint.total,joint.raw.womenPaired);
  assert(joint.total < br.women,'Known paired BMI denominator excludes missing/ineligible BMI.');
  assert.equal(joint.cells.reduce((n,cell) => n+cell.n,0),joint.n);
  assert(Math.abs(joint.cells.reduce((n,cell) => n+cell.women,0)-joint.total)<.05);
  assert(Math.abs(joint.cells.reduce((n,cell) => n+cell.pct,0)-100)<.001);
  for (const cell of joint.cells) {
    const other = reverse.cells.find(row => row.a === cell.b && row.b === cell.a);
    assert.equal(other.pct,cell.pct);
    assert.equal(other.women,cell.women);
    assert.equal(other.low,cell.low);
  }
  assert.equal(reverse.conditional.b_given_a_true.pct,joint.conditional.a_given_b_true.pct);
  assert.equal(reverse.conditional.b_given_a_false.high,joint.conditional.a_given_b_false.high);
  assert.equal(D.cross({uf:'BR',cohort:'ovarian'},'fruit','obesity').suppressed,true);
  const rareCross = D.cross({uf:'SP'},'fruit','ovarian');
  assert.equal(rareCross.cells.length,4);
  assert.equal(rareCross.suppressed,false);
  assert.equal(rareCross.qualityCode,'inconclusive');
  assert.equal(rareCross.conditional.a_given_b_true.nValid,4);
  assert.equal(rareCross.conditional.a_given_b_true.nEvent,2);
  assert.equal(rareCross.conditional.a_given_b_true.pct,45.4387);
  assert.equal(rareCross.conditional.a_given_b_true.quality,'inconclusive');

  assert.equal(D.mortality('BR'),D.adminData.mortality.national_total);
  assert.equal(D.mortalityAges('BR').reduce((n,row) => n+row.deaths,0),D.mortality('BR'));
  assert.equal(D.mortality('BR','18-29'),null,'PNS age bands cannot silently filter SIM.');
  assert.equal(br.deaths,undefined,'Admin outcomes do not share a PNS denominator.');
  assert.equal(br.mortalityRate,undefined);
  assert.equal(D.incidence('BR').cases,D.adminData.incidence_estimate.national_cases);
  assert.equal(D.incidence('AC').cases,null);
  assert.equal(D.incidence('AC').display,'<20');
  assert.equal(D.incidence('AC').censored,true);

  const before = requests.length;
  await Promise.all([D.ensure('AC'),D.ensure('AC')]);
  assert.equal(requests.length,before+1,'Concurrent UF requests are deduplicated.');
  assert.equal(D.aggregate({uf:'AC'}).n,D.raw.ufs.AC.rows.find(row => row.age === 'all' && row.cohort === 'all').n);
  assert.equal(D.aggregate({uf:'INVALID'}).women,null);
  await assert.rejects(D.ensure('INVALID'));
  console.log(JSON.stringify({validation:'PASS',pnsSchema:D.metadata.schemaVersion,
    metrics:D.metrics.map(m => m.id),adultWomenSample:br.n,weightedWomen2019:br.women,
    ovarianSample:D.ovarianN({uf:'BR'}),SIM2024FemaleDeaths:D.mortality('BR'),
    INCA2026EstimatedCases:D.incidence('BR').cases,pairedFruitBMI:{n:joint.n,women:joint.total},
    conditionalFruitGivenBMI:reverse.conditional.b_given_a_true.pct,
    exploratoryOvarianAge30to39:{n:small.n,nEvent:small.estimates.fruit.nEvent,pct:small.rates.fruit},rawAudit},null,2));
})().catch(error => {console.error(error);process.exitCode=1;});
