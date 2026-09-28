#!/usr/bin/env node
'use strict';
// Retrospective phase observation only. No changed parameters or new trajectories.
const fs=require('fs'),zlib=require('zlib'),assert=require('assert/strict');
const {HalfCellRimSim,GAP}=require('./half_cell_rim');
const {frame,measure}=require('./half_cell_rim_assay');
const {overlap,comparable}=require('./half_cell_geometry');
const {hash}=require('./half_cell_rim_test');
const {TNAME}=require('../src/sim');
const file=process.argv[2],out=process.argv[3];assert(file&&out&&!fs.existsSync(out),'Unique report required');
const raw=JSON.parse(zlib.gunzipSync(fs.readFileSync(file)));assert(raw.complete);
for(const [f,h]of Object.entries(raw.sources))assert.equal(hash(f),h,f);
const report={raw:file,rawHash:hash(file),sourceHash:hash(__filename),command:process.argv.slice(1),
  scope:'Retrospective contact opportunities and overlap phase; no tuning',contacts:[],complete:false,physicsSteps:0};
function opportunity(s){
  let eligible=0,candidates=0,opposed=0,minGap=Infinity,minOpposedGap=Infinity;
  for(let u=0;u<s.n;u++)for(let v=u+1;v<s.n;v++)for(let i=0;i<4;i++)for(let j=0;j<4;j++){
    if(!s.rimCompatible(u,i,v,j)||s.rimBond[u*4+i]>=0||s.rimBond[v*4+j]>=0)continue;
    const q=s.edgeContact(u,i,v,j);minGap=Math.min(minGap,q.gap);
    if(q.opposed){opposed++;minOpposedGap=Math.min(minOpposedGap,q.gap);}
    if(s._candidate(u,v)){candidates++;if(q.opposed&&q.gap<=GAP)eligible++;}
  }
  return {eligible,candidates,opposed,minGap,minOpposedGap:Number.isFinite(minOpposedGap)?minOpposedGap:null};
}
function worstPair(f,m){
  let best={area:-1};
  for(let u=0;u<m.types.length;u++)for(let v=u+1;v<m.types.length;v++){
    const dx=f.centers[v][0]-f.centers[u][0],dy=f.centers[v][1]-f.centers[u][1];
    const ps=f.polygons[v].map(p=>[p[0]-m.W*Math.round(dx/m.W),p[1]-m.H*Math.round(dy/m.H)]);
    const area=overlap(f.polygons[u],ps);if(area>best.area)best={area,pair:[u,v],types:[TNAME[m.types[u]],TNAME[m.types[v]]]};
  }
  return best;
}
let error;
try{
  for(const c of raw.records.filter(c=>c.job.arm==='on')){
    const s=HalfCellRimSim.fromState(c.initial),initial=opportunity(s),observations=[],original=s._formRimBonds;
    s._formRimBonds=function(){observations.push({t:this.t,...opportunity(this)});return original.call(this);};
    for(let t=1;t<=c.job.horizon;t++){s.step();report.physicsSteps++;assert.deepEqual(frame(s),c.samples[t].frame);}
    assert.deepEqual(comparable(s.saveState()),comparable(c.final));
    const off=raw.records.find(x=>x.job.arm==='off'&&x.job.mode===c.job.mode&&x.job.end===c.job.end&&x.job.seed===c.job.seed);
    assert.deepEqual(c.samples,off.samples,'Unexpected on/off physical divergence');
    report.contacts.push({job:c.job,initial,observations,eligibleAtBinding:observations.reduce((a,q)=>a+q.eligible,0),
      minGap:Math.min(...observations.map(q=>q.minGap)),minOpposedGap:Math.min(...observations.filter(q=>q.minOpposedGap!==null).map(q=>q.minOpposedGap)),
      onOffFramesIdentical:true});
  }
  let selected;
  for(const c of raw.records)for(const q of c.samples)if(!selected||q.metrics.maxOverlap>selected.q.metrics.maxOverlap)selected={c,q};
  const {c,q}=selected,s=HalfCellRimSim.fromState(c.initial),stages=[];
  for(let t=1;t<q.frame.t;t++){s.step();report.physicsSteps++;}
  for(const name of ['_physics','_formBonds','_chemistry']){
    const original=s[name];s[name]=function(){const result=original.call(this),f=frame(this);
      stages.push({phase:name,frame:f,metrics:measure(f,c.metadata,c.ids),worst:worstPair(f,c.metadata)});return result;};
  }
  s.step();report.physicsSteps++;assert.deepEqual(frame(s),q.frame);
  report.overlapWitness={job:c.job,t:q.frame.t,stages};
  report.complete=true;
}catch(e){error=e;report.error={message:e.message,stack:e.stack};}
fs.writeFileSync(out,JSON.stringify(report)+'\n',{flag:'wx'});
const cost=process.cpuUsage(),cpuSeconds=(cost.user+cost.system)/1e6;
fs.writeFileSync(out+'.cpu.json',JSON.stringify({cpuSeconds,physicsSteps:report.physicsSteps,complete:report.complete})+'\n',{flag:'wx'});
console.log(JSON.stringify({complete:report.complete,cpuSeconds,physicsSteps:report.physicsSteps,
  contacts:report.contacts.map(({job,initial,eligibleAtBinding,minGap,minOpposedGap})=>({job,initial,eligibleAtBinding,minGap,minOpposedGap})),
  overlap:report.overlapWitness&&{job:report.overlapWitness.job,t:report.overlapWitness.t,stages:report.overlapWitness.stages.map(s=>({phase:s.phase,...s.worst}))},error:report.error}));
if(error)process.exitCode=1;
