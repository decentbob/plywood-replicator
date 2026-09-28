#!/usr/bin/env node
'use strict';
const fs=require('fs'),zlib=require('zlib'),assert=require('assert/strict');
const {hash}=require('./half_cell_rim_test');
const stem='HC_settle_20260928',src='experiments/scratch/',dst='experiments/out/';
const read=f=>JSON.parse(f.endsWith('.gz')?zlib.gunzipSync(fs.readFileSync(f)):fs.readFileSync(f));
const versions=['','_v2','_v3','_v4'],failedNames=versions.flatMap(v=>[stem+v+'.json.gz',stem+v+'.json.gz.cpu.json',stem+v+'.failed-source.js']);
const names=[...failedNames,stem+'_v5.json.gz',stem+'_v5.json.gz.cpu.json',stem+'_v5.json.gz.validation.json',
  stem+'_v5.json.gz.validation.json.cpu.json',stem+'.report.json',stem+'.svg',stem+'.png'];
const target=dst+stem+'.manifest.json';
for(const f of [...names.map(n=>dst+n),target])assert(!fs.existsSync(f),'Refusing overwrite '+f);
const raw=read(src+stem+'_v5.json.gz'),validation=read(src+stem+'_v5.json.gz.validation.json'),report=read(src+stem+'.report.json');
assert(raw.complete&&validation.complete&&raw.summary.pass);assert.equal(raw.records.length,48);
assert.equal(validation.rawHash,hash(src+stem+'_v5.json.gz'));assert.equal(report.rawHash,validation.rawHash);
for(const [f,h]of Object.entries(raw.sources))assert.equal(hash(f),h,f);
assert.equal(report.sourceHash,hash('experiments/half_cell_settle_report.py'));
for(const v of versions){const bad=read(src+stem+v+'.json.gz');assert(!bad.complete);
  assert.equal(hash(src+stem+v+'.failed-source.js'),bad.sources['experiments/half_cell_settle.js']);}
for(const figure of report.figures)assert.equal(hash(figure.path),figure.sha256);
const files=[];
for(const name of names){fs.copyFileSync(src+name,dst+name,fs.constants.COPYFILE_EXCL);
  assert.equal(hash(src+name),hash(dst+name));files.push({source:src+name,target:dst+name,sha256:hash(dst+name),bytes:fs.statSync(dst+name).size});}
const costs=names.filter(n=>n.endsWith('.cpu.json')).map(n=>({file:dst+n,...read(dst+n)}));
const c=process.cpuUsage(),archiveCpuSeconds=(c.user+c.system)/1e6;
const manifest={command:process.argv.slice(1),sourceHash:hash(__filename),files,costs,
  priorSourceCatalog:{file:'experiments/out/HC_polymer_20260928_v2.json.gz',sha256:hash('experiments/out/HC_polymer_20260928_v2.json.gz')},
  reportCpuSeconds:report.cpuSeconds,recordedInspectionCpuSeconds:.155,archiveCpuSeconds,
  measuredCpuSeconds:costs.reduce((n,c)=>n+c.cpuSeconds,0)+report.cpuSeconds+.155+archiveCpuSeconds,
  timingScope:'Node process costs include startup/compression. Python report CPU begins after imports. One subsequent read-only summary inspection, Python imports/package checks, shell/editing/Git and final small bookkeeping are unmeasured.',
  physicsSteps:costs.reduce((n,c)=>n+Object.values(c.counts).reduce((a,b)=>a+b,0),0),
  outcome:{pass:true,preparedOnPass:24,onWorlds:24,offCandidateAligned:0,offWorlds:24,autonomousGrowth:false},
  failedPreflights:['unexported metadata helper','unexported side/nearby/contact helpers','restart dirty-bond cache','open-port cache after prepared native M binding'],
  failureScope:'All four failures preceded any physics step. Exact sources retained. Repairs change setup/analysis only; no mechanism, fixture geometry, gate or parameter retuning.',
  visualQA:'PNG inspected at full render: six legible actual-frame panels including the largest overlap in each illustrated world; dashed spare placement is labelled as observer-only.',
  reproduce:'Use unique output stems for assay, validation and report. No scratch input required. Archiver names this completed batch and refuses overwrite.'};
fs.writeFileSync(target,JSON.stringify(manifest,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({files:files.length,physicsSteps:manifest.physicsSteps,cpuSeconds:manifest.measuredCpuSeconds,outcome:manifest.outcome}));
