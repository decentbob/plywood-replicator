'use strict';
const assert=require('assert/strict');
const {calibrationPass,cases}=require('./random_57_screen');
const base={id:'calibrate_table57_v0_204_seeded',variant:0,founders:[0,1,2,3,4,5,6,7,8,9,10,11],steps:10000,budgetCensored:false};
const ep=(members,end)=>({members,variant:0,start:0,end});
assert.equal(calibrationPass({...base,episodes:[ep([0,1,2],100)]}),false);
assert.equal(calibrationPass({...base,episodes:[ep([0,1,2],100),ep([3,4,5],99)]}),false);
assert.equal(calibrationPass({...base,episodes:[ep([0,1,2],100),ep([3,4,5],100)]}),true);
assert.equal(calibrationPass({...base,budgetCensored:true,episodes:[ep([0,1,2],100),ep([3,4,5],100)]}),false);
const rows=[];for(const name of ['copy','table57'])for(let variant=0;variant<2;++variant)for(const seed of [205,206])
  for(const arm of ['seeded','disrupted','plain'])rows.push({id:`screen_${name}_v${variant}_${seed}_${arm}`,budgetCensored:false,
    summary:{persistent:[arm==='seeded'?3:0,arm==='seeded'?3:0],witnesses:[{variant}]}});
assert.ok(cases(rows,[205,206]).every(c=>c.pass));
rows.at(-3).summary.persistent[1]=2;assert.equal(cases(rows,[205,206]).at(-1).pass,false);
rows.at(-3).summary.persistent[1]=3;rows.at(-3).summary.witnesses=[];assert.equal(cases(rows,[205,206]).at(-1).pass,false);
assert.throws(()=>cases(rows.slice(1),[205,206]),/Incomplete/);
console.log('PASS: random-founder viability, persistence boundary, censoring, output contrast, witnesses and matrix completeness');
