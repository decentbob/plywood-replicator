#!/usr/bin/env node
'use strict';
const fs=require('fs'),zlib=require('zlib'),assert=require('assert/strict');
const {hash}=require('./half_cell_rim_test'),{comparable}=require('./half_cell_geometry');
const stem='HC_polymer_20260928',src='experiments/scratch/',dest='experiments/out/';
const read=f=>JSON.parse(f.endsWith('.gz')?zlib.gunzipSync(fs.readFileSync(f)):fs.readFileSync(f));
const names=[stem+'.json.gz',stem+'.json.gz.cpu.json',stem+'.failed-source.js',
  stem+'_v2.json.gz',stem+'_v2.json.gz.cpu.json',stem+'_v2.json.gz.validation.json',
  stem+'_v2.json.gz.validation.json.cpu.json',stem+'.extensions.json'];
const target=dest+stem+'.manifest.json';
for(const f of [...names.map(n=>dest+n),target])assert(!fs.existsSync(f),'Refusing overwrite '+f);
const raw=read(src+stem+'_v2.json.gz'),validation=read(src+stem+'_v2.json.gz.validation.json'),
  failed=read(src+stem+'.json.gz'),tests=read(src+stem+'.extensions.json'),old=read(raw.input);
assert(raw.complete&&validation.complete&&tests.complete&&!failed.complete&&!raw.summary.pass);
assert.equal(validation.rawHash,hash(src+stem+'_v2.json.gz'));assert.equal(raw.inputHash,hash(raw.input));
for(const [f,h]of Object.entries({...raw.sources,...tests.sources}))assert.equal(hash(f),h,f);
assert.equal(hash(src+stem+'.failed-source.js'),failed.sources['experiments/half_cell_polymer_assay.js']);
let controls=0;
for(let i=0;i<raw.records.length;i++)if(raw.records[i].job.arm!=='on'){
  assert.deepEqual(comparable(raw.records[i].final),comparable(old.records[i].final));controls++;
}
const comparisons=raw.records.filter(c=>c.job.arm==='on').map(c=>{
  const off=raw.records.find(d=>d.job.arm==='off'&&d.job.seed===c.job.seed&&d.job.mode===c.job.mode&&d.job.end===c.job.end);
  const first=c.samples.findIndex((s,i)=>JSON.stringify(s.frame)!==JSON.stringify(off.samples[i].frame));
  return {...c.job,firstDifferentFrame:first<0?null:first};
});
const files=[];
for(const name of names){fs.copyFileSync(src+name,dest+name,fs.constants.COPYFILE_EXCL);
  assert.equal(hash(src+name),hash(dest+name));files.push({source:src+name,target:dest+name,sha256:hash(dest+name),bytes:fs.statSync(dest+name).size});}
const costs=names.filter(n=>n.endsWith('.cpu.json')).map(n=>({file:dest+n,...read(dest+n)}));
const c=process.cpuUsage(),archiveCpuSeconds=(c.user+c.system)/1e6;
const manifest={command:process.argv.slice(1),sourceHash:hash(__filename),files,costs,testsCpuSeconds:tests.cpuSeconds,
  archiveCpuSeconds,measuredCpuSeconds:costs.reduce((s,c)=>s+c.cpuSeconds,0)+tests.cpuSeconds+archiveCpuSeconds,
  timingScope:'Includes failed harness, execution, validation, extension tests and archive process CPU. Shell, editing, Git, one read-only summary inspection and final small bookkeeping writes are unmeasured.',
  physicsSteps:costs.reduce((n,c)=>n+Object.values(c.steps).reduce((a,b)=>a+b,0),0)+tests.physicsSteps,
  archivedControlStateAndRngMatches:controls,onOffFrameComparisons:comparisons,
  outcome:{gate:false,prepared:8,onRecruited:0,onWorlds:8,eligibleOnContacts:1,automaticCapTests:2,automaticExtensions:tests.extensions},
  harnessFailure:'Missing size array in the native-M geometry test adapter; fixed before any simulation step. Exact failed source/report retained. No mechanism, parameter or gate change.',
  reproduce:'Use the v2 commands in RESULTS 85 with unique output stems. Input is the archived HC_rim_20260928.json.gz; no scratch dependency.'};
fs.writeFileSync(target,JSON.stringify(manifest,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({files:files.length,physicsSteps:manifest.physicsSteps,measuredCpuSeconds:manifest.measuredCpuSeconds,controls,comparisons,outcome:manifest.outcome}));
