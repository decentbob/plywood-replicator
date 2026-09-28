#!/usr/bin/env node
'use strict';
const fs=require('fs'),zlib=require('zlib'),assert=require('assert/strict');
const {hash}=require('./half_cell_rim_test'),{summary}=require('./half_cell_live_assay');
const stem='HC_live_20260928',src='experiments/scratch/',dst='experiments/out/';
const read=p=>JSON.parse(p.endsWith('.gz')?zlib.gunzipSync(fs.readFileSync(p)):fs.readFileSync(p));
const names=['.json.gz','.json.gz.cpu.json','.json.gz.validation.json','.json.gz.validation.json.cpu.json','.http.json'].map(s=>stem+s);
const target=dst+stem+'.manifest.json';for(const p of [...names.map(n=>dst+n),target])assert(!fs.existsSync(p),'Refusing overwrite '+p);
const raw=read(src+names[0]),execution=read(src+names[1]),validation=read(src+names[2]),qa=read(src+names[3]),http=read(src+names[4]);
assert(raw.complete&&execution.complete&&validation.complete&&qa.complete&&http.complete);
for(const r of [raw,http])for(const [p,h]of Object.entries(r.sources))assert.equal(hash(p),h,p);
assert.equal(validation.rawHash,hash(src+names[0]));assert.deepEqual(summary(raw.records),raw.summary);assert.deepEqual(validation.summary,raw.summary);
assert.equal(validation.frames,1452);assert(validation.corruptionRejected);
assert.deepEqual(raw.records.map(r=>r.job),[787,797].flatMap(seed=>['body','individual'].flatMap(motion=>['bath','contacts','paired'].map(start=>({seed,motion,start})))));
assert(raw.records.every(r=>r.neutral&&r.restart));assert.equal(raw.functional.rejected,4);
const files=names.map(name=>{fs.copyFileSync(src+name,dst+name,fs.constants.COPYFILE_EXCL);assert.equal(hash(src+name),hash(dst+name));return {source:src+name,target:dst+name,sha256:hash(dst+name),bytes:fs.statSync(dst+name).size};});
const c=process.cpuUsage(),archiveCpuSeconds=(c.user+c.system)/1e6;
const manifest={command:process.argv.slice(1),sourceHash:hash(__filename),files,
  measuredCpuSeconds:execution.cpuSeconds+qa.cpuSeconds+http.cpuSeconds+archiveCpuSeconds,
  costs:{execution:execution.cpuSeconds,validation:qa.cpuSeconds,http:http.cpuSeconds,archive:archiveCpuSeconds},
  measuredPhysicsSteps:Object.values(execution.counts).reduce((a,b)=>a+b,0)+Object.values(qa.counts).reduce((a,b)=>a+b,0)+http.physicsSteps,
  untimedPhysicsSteps:{initialSmoke:1,browserQA:122},
  timingScope:'Node assay/validation/HTTP/archive process CPU includes startup/compression. Initial smoke, live browser server and UI interactions, reading/editing/build/Git are unmeasured; fully inclusive cap not independently verified. Browser left paused; user-driven later steps are outside this assay.',
  failedHarnessExecutions:[],
  browserQA:{url:'http://127.0.0.1:8787/',checks:['initial bath shows one closed rim and28 conserved parts',
    'paired reset shows4 copying contacts; Step releases to2 unpaired closed rims',
    '+100 advances to101; Run/Pause reaches121 and stops',
    'individual-contact reset/Step shows1 copying contact at t1',
    'whole-world/follow-first controls render actual polygons and rim bonds',
    'browser console errors/warnings empty'],saveLoad:'Exact continuation tested through HTTP; browser file picker not exercised'},
  outcome:{preparedRelease:4,preparedWorlds:4,movingAcquiredClosed:0,movingAcquisitionWorlds:8,
    zeroMotionContactAssembly:true,autonomousCellReproduction:false},
  limitations:['120-step integration check, not population viability','prepared contact functional test uses zero kicks and pMem=1',
    'ordinary melting/reload restored but no fuel utilization in this short screen','contact/constraint overlap unresolved','rim bonds do not decay'],
  reproduce:'Run half_cell_live_assay.js with a unique output, then --validate that output. Run tools/half_cell_server_test.js with a unique report. Archived input is used directly; no scratch prerequisite. Archiver names this completed batch and refuses overwrite.'};
assert.equal(manifest.measuredPhysicsSteps,5112);
fs.writeFileSync(target,JSON.stringify(manifest,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({files:files.length,cpuSeconds:manifest.measuredCpuSeconds,physicsSteps:manifest.measuredPhysicsSteps,outcome:manifest.outcome}));
