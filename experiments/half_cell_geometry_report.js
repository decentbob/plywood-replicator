#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto'),assert=require('assert/strict');
const {summarize}=require('./half_cell_geometry');
const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const read=f=>JSON.parse(fs.readFileSync(f));
const file=process.argv[2],failed=process.argv[3],out=process.argv[4];
assert(file&&failed,'Usage: node half_cell_geometry_report.js VALID_RAW FAILED_RAW [NEW_REPORT]');
if(out)assert(!fs.existsSync(out),'Refusing overwrite');
const r=read(file),v=read(file+'.validation.json'),cost=read(file+'.cpu.json'),bad=read(failed),badCost=read(failed+'.cpu.json');
assert(r.complete&&v.valid&&!bad.complete);assert.equal(v.rawHash,hash(file));assert.deepEqual(r.summary,summarize(r));
for(const [f,h] of Object.entries(r.sources))assert.equal(hash(f),h,f);
const stem=failed.replace(/\.json$/,''),snapshots={
  'experiments/half_cell_geometry.js':stem+'.failed-source.js',
  'experiments/half_cell_geometry_plan.md':stem+'.frozen-plan.md'};
for(const [f,h] of Object.entries(bad.sources))assert.equal(hash(snapshots[f]||f),h,'Failed-attempt snapshot: '+f);
assert.equal(bad.records.length,0);assert(bad.error.message.startsWith('observer affects physical state/RNG'));
const groups=[];
for(const mode of ['body4','individual4','individual16'])for(const arm of ['attached','unbound']) {
  const cs=r.summary.rows.filter(x=>x.mode===mode&&x.arm===arm);
  groups.push({mode,arm,worlds:cs.length,passing:cs.filter(x=>x.goodHeld>=24).length,
    goodHeldSamples:cs.reduce((s,x)=>s+x.goodHeld,0),heldSamples:cs.length*25,
    maxTailPin:Math.max(...cs.map(x=>x.maxTailPin)),maxTailOverlap:Math.max(...cs.map(x=>x.maxTailOverlap)),
    maxTailFuelOverlap:Math.max(...cs.map(x=>x.maxTailFuelOverlap))});
}
const archived=[file,file+'.cpu.json',file+'.validation.json',file+'.svg',failed,failed+'.cpu.json',...Object.values(snapshots)];
for(const f of archived){const scratch=f.replace(/[\\/]out[\\/]/,path.sep+'scratch'+path.sep);if(fs.existsSync(scratch))assert.equal(hash(f),hash(scratch));}
const c=process.cpuUsage(),reportCpu=(c.user+c.system)/1e6;
const report={scope:'Prepared geometry and numerical mechanics only',groups,
  staticPlacements:r.static.reduce((s,x)=>s+x.samples.length,0),staticPass:r.summary.staticPass,physicalPass:r.summary.physicalPass,
  clearAfterPreparedRelease:r.summary.rows.filter(x=>x.firstClear!==null).length,
  firstClearRange:[Math.min(...r.summary.rows.map(x=>x.firstClear)),Math.max(...r.summary.rows.map(x=>x.firstClear))],
  maxReleasedCrossOverlap:Math.max(...r.summary.rows.map(x=>x.maxReleasedCrossOverlap)),
  maxHullExcess:Math.max(...r.records.flatMap(c=>c.samples.map(q=>q.metrics.maxHullExcess))),
  failedAttempt:{reason:'Setup left the open eligibility cache stale; restore recomputed it. Setup/release now refresh it.',
    rawStepCounterLimitation:'Old counters included completed records only: 0 reported despite 500 executed physics steps before the neutrality assertion.',
    reconstructedSteps:{observed:200,plain:200,restart:100},cpuSeconds:badCost.cpuSeconds},
  physicsSteps:cost.observedSteps+cost.plainSteps+cost.restartSteps+v.replaySteps+500,
  measuredCpuSeconds:{failed:badCost.cpuSeconds,execution:cost.cpuSeconds,validation:v.cpuSeconds,report:reportCpu,
    total:badCost.cpuSeconds+cost.cpuSeconds+v.cpuSeconds+reportCpu},
  timingLimit:'One preliminary read-only aggregation was not CPU-instrumented; shell/docs/Git and final report serialization excluded. Inclusive CPU total is not fully measured.',
  files:Object.fromEntries(archived.map(f=>[f,hash(f)])),reportSourceHash:hash(__filename)};
if(out)fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify(report));
