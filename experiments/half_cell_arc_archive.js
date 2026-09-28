#!/usr/bin/env node
'use strict';
const fs=require('fs'),zlib=require('zlib'),assert=require('assert/strict');
const {hash}=require('./half_cell_rim_test');
const src='experiments/scratch/',dst='experiments/out/';
const stems=['HC_arc_20260928','HC_arc32_20260928'];
const read=f=>JSON.parse(f.endsWith('.gz')?zlib.gunzipSync(fs.readFileSync(f)):fs.readFileSync(f));
const suffixes=['.json.gz','.json.gz.cpu.json','.json.gz.validation.json','.json.gz.validation.json.cpu.json','.report.json','.svg','.png'];
const names=stems.flatMap(s=>suffixes.map(x=>s+x)).concat(stems[0]+'.diagnosis.json');
const target=dst+stems[0]+'.manifest.json';
for(const f of [...names.map(n=>dst+n),target])assert(!fs.existsSync(f),'Refusing overwrite '+f);
const raws=stems.map(s=>read(src+s+'.json.gz')),reports=stems.map(s=>read(src+s+'.report.json'));
for(let i=0;i<2;i++){
  const raw=raws[i],val=read(src+stems[i]+'.json.gz.validation.json'),report=reports[i];
  assert(raw.complete&&val.complete&&!raw.summary.pass&&!report.passGate);
  assert.equal(raw.records.length,8);assert.equal(val.frames,968);assert.equal(val.corruptionsRejected,4);
  assert.deepEqual(raw.summary,val.summary);
  assert.equal(val.rawHash,hash(src+stems[i]+'.json.gz'));assert.equal(report.rawHash,val.rawHash);
  assert.equal(report.closedPassed,i?3:2);
  for(const [f,h]of Object.entries(raw.sources))assert.equal(hash(f),h,f);
  assert.equal(report.sourceHash,hash('experiments/half_cell_arc'+(i?'32':'')+'_report.py'));
  for(const fig of report.figures)assert.equal(hash(fig.path),fig.sha256);
  for(const r of raw.records)assert(r.neutral&&r.restart);
}
assert.equal(raws[1].inputHash,hash(src+stems[0]+'.json.gz'));
const diagnosis=read(src+stems[0]+'.diagnosis.json');
assert(diagnosis.complete&&diagnosis.neutral);
assert.equal(diagnosis.rawHash,hash(src+stems[0]+'.json.gz'));
assert.equal(diagnosis.sourceHash,hash('experiments/half_cell_arc_diagnose.js'));
const costs=names.filter(n=>n.endsWith('.cpu.json')).map(n=>({file:dst+n,...read(src+n)}));
for(const c of costs)assert(c.complete);
const files=[];
for(const name of names){fs.copyFileSync(src+name,dst+name,fs.constants.COPYFILE_EXCL);
  assert.equal(hash(src+name),hash(dst+name));files.push({source:src+name,target:dst+name,sha256:hash(dst+name),bytes:fs.statSync(dst+name).size});}
const cpu=process.cpuUsage(),archiveCpuSeconds=(cpu.user+cpu.system)/1e6;
const manifest={command:process.argv.slice(1),sourceHash:hash(__filename),files,costs,
  reportCpuSeconds:reports.map(r=>r.cpuSeconds),diagnosisCpuSeconds:diagnosis.cpuSeconds,archiveCpuSeconds,
  measuredCpuSeconds:costs.reduce((n,c)=>n+c.cpuSeconds,0)+reports.reduce((n,r)=>n+r.cpuSeconds,0)+diagnosis.cpuSeconds+archiveCpuSeconds,
  physicsSteps:costs.reduce((n,c)=>n+Object.values(c.counts).reduce((a,b)=>a+b,0),0)+diagnosis.physicsSteps,
  timingScope:'Node process CPU includes startup/compression. Python report CPU begins after imports. Read-only inspections, Python imports, shell/editing/Git and final small bookkeeping are unmeasured; fully inclusive CPU cap not independently verified.',
  outcomes:{original16:{pass:false,closedPassed:2,closedWorlds:4},separate32:{pass:false,closedPassed:3,closedWorlds:4},autonomousGrowth:false},
  failedHarnessExecutions:[],
  validation:{replayedFrames:1936,neutralityAndRestarts:16,corruptionsRejected:8,diagnosisNeutral:true},
  visualQA:'Both PNGs inspected: six actual-frame panels at t0/40/120, seed761 in both motion modes. Four E particles are explicitly outside the crop. Seed769 failure is reported separately; these figures do not show the worst case.',
  reproduce:'Use unique output stems for assays, diagnosis, validation and Python/Pillow reports. The resolution runner requires experiments/scratch/HC_arc_20260928.json.gz: if absent restore that exact archived file using COPYFILE_EXCL, never overwrite. Archiver names this completed batch and refuses overwrite.'};
assert.equal(manifest.physicsSteps,6792);
fs.writeFileSync(target,JSON.stringify(manifest,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({files:files.length,physicsSteps:manifest.physicsSteps,cpuSeconds:manifest.measuredCpuSeconds,outcomes:manifest.outcomes}));
