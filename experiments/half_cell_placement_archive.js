#!/usr/bin/env node
'use strict';
const fs=require('fs'),assert=require('assert/strict');
const {read,write}=require('./half_cell_bath'),{hash}=require('./half_cell_rim_test');
const stem='HC_placement_20260928',src='experiments/scratch/',dst='experiments/out/';
const jobs=[809,811].flatMap(seed=>['on','off'].map(arm=>`${stem}_${seed}_${arm}.json.gz`));
const names=jobs.flatMap(n=>[n,n+'.cpu.json']).concat(['.preflight.json','.preflight.json.cpu.json','.summary.json','.summary.json.cpu.json','.svg','.report.json'].map(x=>stem+x));
const target=dst+stem+'.manifest.json';for(const p of [...names.map(n=>dst+n),target])assert(!fs.existsSync(p),'Refusing overwrite '+p);
const summary=read(src+stem+'.summary.json'),report=read(src+stem+'.report.json');assert(summary.complete);
for(const p of summary.inputs)assert.equal(hash(p.path),p.sha256);
for(const [p,h]of Object.entries(summary.sources))assert.equal(hash(p),h);
assert.equal(hash(report.figure.path),report.figure.sha256);assert.equal(hash(src+stem+'.summary.json'),report.summaryHash);
assert.equal(hash('experiments/half_cell_placement_report.js'),report.sourceHash);
for(const n of jobs){const raw=read(src+n);assert(raw.complete&&raw.neutral&&!raw.censored);for(const [p,h]of Object.entries(raw.sources))assert.equal(hash(p),h,p);assert.equal(hash(raw.input),raw.inputHash);}
const files=[];for(const n of names){fs.copyFileSync(src+n,dst+n,fs.constants.COPYFILE_EXCL);assert.equal(hash(src+n),hash(dst+n));files.push({path:dst+n,sha256:hash(dst+n),bytes:fs.statSync(dst+n).size});}
const costs=names.filter(n=>n.endsWith('.cpu.json')).map(n=>({path:dst+n,...read(dst+n)}));
const archiveCpu=Object.values(process.cpuUsage()).reduce((a,b)=>a+b,0)/1e6;
const manifest={schema:1,complete:true,command:process.argv.slice(1),files,costs,
  sources:Object.fromEntries(['experiments/half_cell_placement.js','experiments/half_cell_placement_plan.md','experiments/half_cell_placement_summary.js','experiments/half_cell_placement_report.js','experiments/half_cell_placement_archive.js'].map(p=>[p,hash(p)])),
  physicsSteps:costs.reduce((n,c)=>n+c.steps,0),measuredCpuSeconds:costs.reduce((n,c)=>n+c.cpuSeconds,0)+report.cpuSeconds+archiveCpu,archiveCpuSeconds:archiveCpu,
  timingScope:'Node process CPU including startup/serialization; editing, read-only inspection, shell/Git and SVG raster preview are unmeasured. Fully inclusive cost not independently verified.',
  validation:'All historical checkpoints/finals and ordered successful bond events match; all saved attempts recomputed and placement replayed; three corruptions rejected. Preflight observer neutrality and subclass restart pass.',
  limitations:['Archived worlds, no fresh independent confirmation','Every event is a repeated opportunity within its world','Core comparator is a different placement algorithm, not an admissible collision rescue','No runtime correction, autonomous reproduction or reliable exclusion established'],
  reproduce:'Preflight: node experiments/half_cell_placement.js --preflight UNIQUE.preflight.json. Replay: node experiments/half_cell_placement.js INPUT.json.gz UNIQUE.json.gz for each archived Q8h job. Summary: node experiments/half_cell_placement_summary.js UNIQUE.summary.json PREFLIGHT RAW809on RAW809off RAW811on RAW811off. Report: node experiments/half_cell_placement_report.js SUMMARY UNIQUE_STEM. Archive script names this completed batch and refuses overwrite.'};
assert.equal(manifest.physicsSteps,200274);assert(manifest.measuredCpuSeconds<2800);
write(target,manifest);console.log(JSON.stringify({files:files.length,steps:manifest.physicsSteps,cpu:manifest.measuredCpuSeconds}));
