#!/usr/bin/env node
const fs = require('fs'), os = require('os'), path = require('path'), assert = require('assert/strict');
const { analyze } = require('./flexibility_summary.js');
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'poly-flex-summary-')), prefix = path.join(dir, 'fixture');
const arms = ['durable','durableNoBind','soft0','soft0NoBind'];
const manifest = { complete:true, options:{ every:10000, steps:50000, seeds:'7', arms:arms.join(',') },
  jobs:arms.map(arm => ({ arm, seed:7, params:{ seed:7, pBindP:arm.endsWith('NoBind')?0:0.1,
    ...(arm.startsWith('soft')?{stiff1:0.8,stiff2:0.8}:{}) } })) };
const header = 'arm,seed,t,hostBirths,mimicBirths,otherBirths,products,mimicSites,mimicBound';
const counts = [2,1,4,1];
const lines = arms.flatMap((arm,i) => [10000,20000,30000,40000,50000].map(t =>
  `${arm},7,${t},0,${t===30000?counts[i]:0},0,0,10,${arm.endsWith('NoBind')?0:1}`));
const births = arms.flatMap((arm,i) => Array.from({length:counts[i]}, () =>
  JSON.stringify({ arm,seed:7,t:25000,seq:'PCQ',parent:'PCQ' })));
const write = () => {
  fs.writeFileSync(prefix+'.manifest.json',JSON.stringify(manifest));
  fs.writeFileSync(prefix+'.csv',[header,...lines].join('\n')+'\n');
  fs.writeFileSync(prefix+'.births.jsonl',births.join('\n')+'\n');
};
try {
  write();
  const result = analyze(prefix);
  assert.deepEqual(result.contrasts,[{seed:7,rigid:1,flexible:3,interaction:2}]);
  assert.equal(result.rows.reduce((s,r)=>s+r.exact,0),8);
  const last = lines.pop(); write(); assert.throws(()=>analyze(prefix),/Missing windows/); lines.push(last);
  lines.push(last); write(); assert.throws(()=>analyze(prefix),/duplicate window/); lines.pop();
  const birth = births.pop(); write(); assert.throws(()=>analyze(prefix),/birth mismatch/); births.push(birth);
  manifest.jobs[2].params.unexpected = true; write(); assert.throws(()=>analyze(prefix),/parameter difference/);
  delete manifest.jobs[2].params.unexpected;
  manifest.complete = false; write(); assert.throws(()=>analyze(prefix),/complete/); manifest.complete = true;
  write(); assert.throws(()=>analyze(prefix,25000),/complete recorded windows/);
  console.log('PASS: paired contrasts, exact copies, missing/duplicate windows, raw counts, parameters, completion, interval boundaries');
} finally {
  // Only the exact temporary directory created above is removed.
  fs.rmSync(dir,{recursive:true,force:true});
}
