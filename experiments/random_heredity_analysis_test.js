'use strict';
const assert=require('assert/strict');
const {outcome,validateWorld}=require('./random_heredity_summary');
const {read}=require('./random_heredity');
const fixture=[];
for(const name of ['copy','table55'])for(let variant=0;variant<2;++variant)for(const seed of [202,203])
  for(const arm of ['seeded','disrupted','plain'])fixture.push({id:`screen_${name}_v${variant}_${seed}_${arm}`,
    budgetCensored:false,summary:{persistent:[arm==='seeded'?3:0,arm==='seeded'?3:0],witnesses:[{variant}]}});
assert.ok(outcome(fixture).every(c=>c.pass));
fixture.at(-3).summary.persistent[1]=2;
assert.equal(outcome(fixture).at(-1).pass,false,'minimum effect');
fixture.at(-3).summary.persistent[1]=3;fixture.at(-3).summary.witnesses=[];
assert.equal(outcome(fixture).at(-1).pass,false,'renewal witness');
fixture.at(-3).summary.witnesses=[{variant:1}];fixture.at(-3).budgetCensored=true;
assert.equal(outcome(fixture).at(-1).pass,false,'censored run');
assert.throws(()=>outcome(fixture.slice(1)),/Incomplete/);
if(process.argv[2]){
  const stem=process.argv[2], job=read(`${stem}.calibrate.manifest.json`).jobs[0];
  const raw=read(`${stem}.${job.id}.json`);
  validateWorld(raw,job);
  const wrong=structuredClone(raw);wrong.events[0][2]=-1;
  assert.throws(()=>validateWorld(wrong,job));
  const count=structuredClone(raw);count.summary.persistent[0]++;
  assert.throws(()=>validateWorld(count,job));
}
console.log('PASS: gate boundaries, missing worlds, budget censoring, altered bonds and inflated counts');
