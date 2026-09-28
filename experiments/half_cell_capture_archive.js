#!/usr/bin/env node
'use strict';
const fs=require('fs'),assert=require('assert/strict');
const {read,write}=require('./half_cell_bath'),{hash}=require('./half_cell_rim_test');
const stem='HC_capture_20260928',src='experiments/scratch/',dst='experiments/out/';
const suffixes=['.preflight.json.gz','.preflight.json.gz.cpu.json','.preflight-source-v1.js',
  '.preflight-v2.json.gz','.preflight-v2.json.gz.cpu.json','.json.gz','.json.gz.cpu.json',
  '.json.gz.validation.json','.json.gz.validation.json.cpu.json','.controls.json.gz','.controls.json.gz.cpu.json','.svg','.report.json'];
const names=suffixes.map(x=>stem+x),target=dst+stem+'.manifest.json';
for(const p of [...names.map(n=>dst+n),target])assert(!fs.existsSync(p),'Refusing overwrite '+p);
const raw=read(src+stem+'.json.gz'),validation=read(src+stem+'.json.gz.validation.json'),report=read(src+stem+'.report.json');
const controls=read(src+stem+'.controls.json.gz');assert(controls.complete);assert.equal(controls.inputHash,hash(src+stem+'.json.gz'));
for(const [p,h]of Object.entries(controls.sources))assert.equal(hash(p),h,p);
assert(raw.complete&&!raw.censored&&validation.complete&&!validation.censored);assert.equal(validation.rawHash,hash(src+stem+'.json.gz'));
assert.equal(report.rawHash,validation.rawHash);assert.equal(report.sourceHash,hash('experiments/half_cell_capture_report.js'));assert.equal(report.figure.sha256,hash(report.figure.path));
for(const [p,h]of Object.entries(raw.sources))assert.equal(hash(p),h,p);for(const input of raw.inputs)assert.equal(hash(input.path),input.sha256);
const failed=read(src+stem+'.preflight.json.gz');assert(!failed.complete);assert.equal(failed.sources['experiments/half_cell_capture.js'],hash(src+stem+'.preflight-source-v1.js'));
const preflight=read(src+stem+'.preflight-v2.json.gz');assert(preflight.complete);assert.deepEqual(preflight.sources,raw.sources);
const files=[];for(const n of names){fs.copyFileSync(src+n,dst+n,fs.constants.COPYFILE_EXCL);assert.equal(hash(src+n),hash(dst+n));files.push({path:dst+n,sha256:hash(dst+n),bytes:fs.statSync(dst+n).size});}
const costs=names.filter(n=>n.endsWith('.cpu.json')).map(n=>({path:dst+n,...read(dst+n)})),archiveCpu=Object.values(process.cpuUsage()).reduce((a,b)=>a+b,0)/1e6;
const manifest={complete:true,command:process.argv.slice(1),files,costs,pass:controls.summary.pass,originalPass:raw.summary.pass,
  physicsSteps:costs.reduce((n,c)=>n+Object.values(c.counts).reduce((a,b)=>a+b,0),0),
  measuredCpuSeconds:costs.reduce((n,c)=>n+c.cpuSeconds,0)+report.cpuSeconds+archiveCpu,archiveCpuSeconds:archiveCpu,
  sources:Object.fromEntries(['experiments/half_cell_capture.js','experiments/half_cell_capture_plan.md','experiments/half_cell_capture_report.js','experiments/half_cell_capture_archive.js','experiments/half_cell_capture_controls.js','experiments/half_cell_capture_control_note.md'].map(p=>[p,hash(p)])),
  harnessFailure:'First preflight failed after26 physics passes because the open-side cache was not recomputed after the prepared bond. Source/output retained; v2 refreshes this derived cache before saving. No physics/rule/gate changed.',
  controlDeviation:'Original24 prepared-control trajectories retain saved zero kicks despite the plan specifying moving controls. A separate frozen correction repeats only these24 with sigma .3/sigmaRot .45, preserving original records and both summaries. The bath gate had already failed and stays failed.',
  validation:'Original252 plus corrected24 observed/plain and midpoint-restored trajectories; all16,836 frames independently replayed; three deliberate corruptions rejected. All six archived bound branches unchanged.',
  timingScope:'Measured Node process CPU includes startup/serialization and failed attempt. Editing, shell/Git, read-only inspections and raster preview are unmeasured; fully inclusive budget not independently verified.',
  reproduction:'node experiments/half_cell_capture.js --preflight UNIQUE.json.gz; node experiments/half_cell_capture.js UNIQUE.json.gz; node experiments/half_cell_capture.js --validate UNIQUE.json.gz; node experiments/half_cell_capture_controls.js RAW UNIQUE.controls.json.gz; node experiments/half_cell_capture_report.js RAW UNIQUE_STEM. Use the controls-file summary for the corrected moving-control comparison. Archived Q8i inputs only; no scratch prerequisite. Archive names this batch and refuses overwrite.',
  limitations:['Prepared phase-state interventions and physics only; no autonomous acquisition','Correlated archived contacts, not42 independent worlds','Existing bonded exclusion exemption and finite constraint resolution retained','No core or live integration; original failed mechanical gates remain failed']};
assert.equal(manifest.physicsSteps,58222);assert(manifest.measuredCpuSeconds<750);write(target,manifest);
console.log(JSON.stringify({files:files.length,steps:manifest.physicsSteps,cpu:manifest.measuredCpuSeconds,pass:manifest.pass}));
