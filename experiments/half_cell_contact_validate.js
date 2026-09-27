#!/usr/bin/env node
'use strict';
// Read-only replay and retrospective within-solver diagnosis; never changes a gate.
const fs=require('fs'),zlib=require('zlib'),crypto=require('crypto'),assert=require('assert/strict');
const base=require('./half_cell_geometry');
const assay=require('./half_cell_contact');
const {F,TNAME}=require('../src/sim');
const cpu=()=>{const c=process.cpuUsage();return (c.user+c.system)/1e6;};
const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const read=f=>JSON.parse(f.endsWith('.gz')?zlib.gunzipSync(fs.readFileSync(f)):fs.readFileSync(f));
const file=process.argv[2],out=process.argv[3];assert(file&&out,'Supply raw and unique report path');
assert(!fs.existsSync(out)&&!fs.existsSync(out+'.cpu.json'),'Refusing overwrite');
function initialClass(arm){return arm==='core'?base.HalfCellGeometrySim:assay.HalfCellContactSim;}
function validateRecord(rec,original,replay=true){
  // fromState deliberately invalidates the pin-list cache. Compare against the
  // same restored state the runner saved, rather than the pre-restore cache bit.
  const restored=initialClass(rec.job.contact).fromState(original.initial).saveState();
  assay.validateRecord(rec,{...original,initial:restored},replay);
}
function pairArea(f,m,u,v){
  const dx=f.centers[v][0]-f.centers[u][0],dy=f.centers[v][1]-f.centers[u][1];
  return base.overlap(f.polygons[u],f.polygons[v].map(p=>[p[0]-m.W*Math.round(dx/m.W),p[1]-m.H*Math.round(dy/m.H)]));
}
function worst(r,scope){
  let best={area:-1};
  for(const c of r.records.filter(c=>c.job.contact==='polygon'))for(const q of c.samples.filter(q=>q.frame.t>100)){
    const pairs=scope==='cross'?c.ids.groups[0].flatMap(u=>c.ids.groups[1].map(v=>[u,v])):
      q.frame.polygons.flatMap((p,u)=>q.frame.polygons.flatMap((p,v)=>v>u?[[u,v]]:[]));
    for(const [u,v] of pairs){const area=pairArea(q.frame,c.metadata,u,v);
      if(area>best.area)best={area,job:c.job,t:q.frame.t,pair:[u,v],types:[u,v].map(x=>TNAME[c.metadata.types[x]])};}
  }
  return best;
}
function trace(r,w){
  const rec=r.records.find(c=>JSON.stringify(c.job)===JSON.stringify(w.job));
  const s=assay.HalfCellContactSim.fromState(rec.midpoint),plain=assay.HalfCellContactSim.fromState(rec.midpoint);
  const release=x=>{for(const u of [rec.ids.caps[0],rec.ids.letters[0]])x._unlink(u,F);x._computeOpen();};
  release(s);release(plain);
  let steps=0;
  for(let t=101;t<w.t;t++){s._physics();s.t++;plain._physics();plain.t++;steps+=2;}
  const stages=[],count=s._polygonContacts().length/2,original=s._separatePair;let call=0;
  const capture=(stage,iteration)=>{const f=base.frame(s);stages.push({stage,iteration,pairArea:pairArea(f,rec.metadata,...w.pair),
    metrics:assay.metrics(f,rec.metadata,rec.ids),frame:f});};
  s._separatePair=function(u,v){
    if(call%count===0)capture(call===0?'after kick':'after previous pins and shape',Math.floor(call/count));
    original.call(this,u,v);call++;
    if(call%count===0)capture('after contact sweep',call/count);
  };
  s._physics();s.t++;plain._physics();plain.t++;steps+=2;capture('after final pins and shape',s.p.iters);
  assert.equal(call,count*s.p.iters);assert.deepEqual(base.comparable(s.saveState()),base.comparable(plain.saveState()));
  assert.deepEqual(base.frame(s),rec.samples[w.t].frame);
  return {witness:w,stages,physicsSteps:steps,neutral:true};
}
const report={command:process.argv.slice(1),raw:file,rawHash:hash(file),validatorHash:hash(__filename),complete:false};
let error;
try{
  const r=read(file),input=read(r.input),cs=input.records.filter(c=>c.job.mode!=='individual4');
  assert(r.complete);assert.equal(hash(r.input),r.inputHash);
  for(const [f,h] of Object.entries(r.sources))assert.equal(hash(f),h,f);
  assay.selfCheck();assert.equal(r.records.length,32);assert.equal(cs.length,16);
  let i=0;for(const c of cs)for(const arm of ['core','polygon']){
    const rec=r.records[i++];assert.equal(rec.job.contact,arm);validateRecord(rec,c);assert(cpu()<60,'Validation CPU ceiling');
  }
  assert.deepEqual(r.summary,assay.summarize(r));
  const bad=structuredClone(r.records[0]);bad.samples[1].frame.polygons[0][0][0]+=.2;
  assert.throws(()=>validateRecord(bad,cs[0],false),/Metric mismatch/);
  const label=structuredClone(r.records[0]);label.job.seed++;assert.throws(()=>validateRecord(label,cs[0],false));
  const wrong=structuredClone(r.summary);wrong.pass=!wrong.pass;assert.throws(()=>assert.deepEqual(wrong,assay.summarize(r)));
  const cross=worst(r,'cross'),all=worst(r,'all'),traces=[trace(r,cross),trace(r,all)];
  Object.assign(report,{complete:true,worlds:32,frames:6432,replaySteps:6400,corruptionsRejected:3,
    summary:r.summary,maxHullExcess:Math.max(...r.records.flatMap(c=>c.samples.map(q=>q.metrics.maxHullExcess))),
    diagnosis:{scope:'Retrospective numerical localization; no changed settings or gate',cross,all,traces},
    diagnosticSteps:traces.reduce((a,t)=>a+t.physicsSteps,0)});
}catch(e){error=e;report.error={message:e.message,stack:e.stack};}
fs.writeFileSync(out,JSON.stringify(report)+'\n',{flag:'wx'});
const cost={cpuSeconds:cpu(),complete:report.complete};fs.writeFileSync(out+'.cpu.json',JSON.stringify(cost)+'\n',{flag:'wx'});
console.log(JSON.stringify({complete:report.complete,cost,pass:report.summary?.pass,
  diagnosis:report.diagnosis&&{cross:report.diagnosis.cross,all:report.diagnosis.all,traces:report.diagnosis.traces.map(t=>t.stages.map(s=>({stage:s.stage,it:s.iteration,area:s.pairArea,pin:s.metrics.maxPin})))},error:report.error}));
if(error)process.exitCode=1;
