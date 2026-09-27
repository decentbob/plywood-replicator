#!/usr/bin/env node
// Offline context detail and a check for simultaneous pre-incorporation losses.
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const {validate}=require('./geometric_error_test.js');
const {hash,cpu}=require('./geometric_error.js');
const file=path.resolve(process.argv[2]),output=path.resolve(process.argv[3]);
assert(process.argv[2]&&process.argv[3]);assert(!fs.existsSync(output),'Refusing overwrite');
const raw=fs.readFileSync(file),r=JSON.parse(raw);validate(r);
const contexts=r.records.map(x=>{
  const first=x.outcome;
  const faces=x.c.map((u,i)=>[u*4,x.t[i]*4]);
  const simultaneous=first.kind==='incorporated'?0:x.tape.filter(e=>e.t===first.t&&e.op==='unlink'&&
    faces.some(([a,b])=>(a===e.a&&b===e.b)||(a===e.b&&b===e.a))).length;
  return {...x.job,...first,simultaneousFaceLosses:simultaneous,
    initialGap:x.samples[0].gap,initialAngle:x.samples[0].angle,initialGeometryPass:x.samples[0].pass};
});
const ambiguous=contexts.filter(x=>x.simultaneousFaceLosses>1);
assert.equal(ambiguous.length,0,'Do not credit simultaneous losses as selective rejection');
const validation=JSON.parse(fs.readFileSync(file+'.validation.json'));
const execution=JSON.parse(fs.readFileSync(file+'.cpu.json'));
// One earlier read-only diagnostic printed per-context timing and used 0.233 CPU seconds.
const auxiliaryCpuSeconds=0.233;
const report={kind:'geometric-error-context-report',command:process.argv,inputSHA256:hash(raw),
  sourceSHA256:hash(fs.readFileSync(__filename)),summary:r.summary,contexts,
  simultaneousLossCases:ambiguous.length,executionCpuSeconds:execution.cpuSeconds,
  validationCpuSeconds:validation.qaCpuSeconds,auxiliaryCpuSeconds,
  reportCpuSeconds:cpu(),totalMeasuredCpuSeconds:execution.cpuSeconds+validation.qaCpuSeconds+auxiliaryCpuSeconds+cpu(),
  steps:{observed:96*200,plain:96*200,restartContinuation:96*100,preparedPhysicsOnly:96*100}};
assert(report.totalMeasuredCpuSeconds<120);
fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({summary:report.summary,simultaneousLossCases:0,totalMeasuredCpuSeconds:report.totalMeasuredCpuSeconds}));
