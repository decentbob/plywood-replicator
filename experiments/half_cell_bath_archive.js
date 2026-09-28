#!/usr/bin/env node
'use strict';
const fs=require('fs'),assert=require('assert/strict');
const {read,write}=require('./half_cell_bath'),{hash}=require('./half_cell_rim_test');
const stem='HC_bath_20260928',src='experiments/scratch/',dst='experiments/out/';
const jobs=[809,811].flatMap(seed=>['on','off'].map(arm=>`${stem}_${seed}_${arm}.json.gz`));
const names=jobs.flatMap(n=>[n,n+'.cpu.json',n+'.validation.json',n+'.validation.json.cpu.json']).concat(
  ['.preflight.json','.preflight-v2.json','.preflight-source.js','.summary.json','.svg','.report.json','.report-source-v1.js','_v2.svg','_v2.report.json'].map(x=>stem+x));
const target=dst+stem+'.manifest.json';for(const p of [...names.map(n=>dst+n),target])assert(!fs.existsSync(p),'Refusing overwrite '+p);
const summary=read(src+stem+'.summary.json'),report=read(src+stem+'_v2.report.json'),firstReport=read(src+stem+'.report.json');assert(summary.complete);
assert.equal(hash('experiments/half_cell_bath_summary.js'),summary.sourceHash);
assert.equal(hash(src+stem+'.report-source-v1.js'),firstReport.sourceHash);
assert.equal(hash(firstReport.figure.path),firstReport.figure.sha256);
assert.equal(hash('experiments/half_cell_bath_report.js'),report.sourceHash);assert.equal(hash(src+stem+'.summary.json'),report.summaryHash);
assert.equal(hash(report.figure.path),report.figure.sha256);
for(const n of jobs){const raw=read(src+n),val=read(src+n+'.validation.json');assert(raw.complete&&!raw.censored&&val.complete&&val.neutral&&val.restart);
  assert.equal(val.sourceHash,hash('experiments/half_cell_bath.js'));assert.equal(val.steps,51000);
  assert.equal(val.frames,101);assert.equal(val.rawHash,hash(src+n));for(const [p,h]of Object.entries(raw.sources))assert.equal(hash(p),h,p);}
const first=read(src+stem+'.preflight.json'),second=read(src+stem+'.preflight-v2.json');assert(first.complete&&second.complete);
assert.equal(first.sources['experiments/half_cell_bath.js'],hash(src+stem+'.preflight-source.js'));
for(const [p,h]of Object.entries(second.sources))assert.equal(hash(p),h,p);
const files=names.map(name=>{fs.copyFileSync(src+name,dst+name,fs.constants.COPYFILE_EXCL);assert.equal(hash(src+name),hash(dst+name));return {source:src+name,target:dst+name,sha256:hash(dst+name),bytes:fs.statSync(dst+name).size};});
const costs=jobs.flatMap(n=>[n+'.cpu.json',n+'.validation.json.cpu.json']).map(n=>({file:dst+n,...read(dst+n)}));
const c=process.cpuUsage(),archiveCpuSeconds=(c.user+c.system)/1e6;
const manifest={command:process.argv.slice(1),sourceHash:hash(__filename),files,costs,
  physicsSteps:costs.reduce((n,c)=>n+c.steps,0)+first.steps+second.steps,
  measuredCpuSeconds:costs.reduce((n,c)=>n+c.cpuSeconds,0)+first.cpuSeconds+second.cpuSeconds+summary.cpuSeconds+firstReport.cpuSeconds+report.cpuSeconds+archiveCpuSeconds,
  preflightCpuSeconds:[first.cpuSeconds,second.cpuSeconds],analysisCpuSeconds:summary.cpuSeconds,reportCpuSeconds:[firstReport.cpuSeconds,report.cpuSeconds],archiveCpuSeconds,
  outcome:{promotion:summary.promotion,rows:summary.rows},
  validation:{fullPlainReplay:true,checkpoints:true,midpointRestartStepsPerWorld:1000,frames:404,bondTape:true,corruptionsRejected:summary.corruptionsRejected},
  preflightRevision:'Both preflights passed. Before the population runs, source was extended to save/replay first qualifying milestone frames; the first exact source is preserved. No runtime or parameter change.',
  figureRevision:'First figure had overlapping row labels; v2 corrects spacing. Both figures/reports and first source retained. PNG previews inspected; conversion and UI timeout are untimed, no physics.',
  timingScope:'Measured Node process CPU includes startup and compression. Read-only inspection, file editing, shell/Git and visual inspection are unmeasured. Fully inclusive cap not independently verified.',
  reproduce:'Run half_cell_bath.js --preflight UNIQUE.json; SEED on|off UNIQUE.json.gz for809/811; --validate each raw. Summary takes UNIQUE.summary.json then four raw paths in809on/off,811on/off order. Report takes summary and UNIQUE stem. No scratch input prerequisite. Archive script names this completed batch and refuses overwrite.',
  limitations:['body-jostled screen only; known overlap limitations','one offspring inventory; no sustained turnover test','phase contacts in a world are not independent replicates','sampled geometry maxima every500 steps, not continuous exclusion']};
assert.equal(manifest.physicsSteps,404500);
write(target,manifest);console.log(JSON.stringify({files:files.length,steps:manifest.physicsSteps,cpu:manifest.measuredCpuSeconds,promotion:summary.promotion}));
