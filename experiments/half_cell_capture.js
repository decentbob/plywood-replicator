#!/usr/bin/env node
'use strict';
const fs=require('fs'),assert=require('assert/strict');
const {F,R,L,T_A,T_P,T_Q,T_E}=require('../src/sim');
const live=require('./half_cell_live'),g=require('./half_cell_geometry');
const {read,write}=require('./half_cell_bath'),{hash}=require('./half_cell_rim_test');
const STEM='experiments/out/HC_placement_20260928';
const INPUTS=[809,811].flatMap(seed=>['on','off'].map(arm=>`${STEM}_${seed}_${arm}.json.gz`)).concat(STEM+'.preflight.json');
const OWN=['experiments/half_cell_capture.js','experiments/half_cell_capture_plan.md'];
const counts={observed:0,plain:0,restart:0,replay:0};
const cpu=()=>Object.values(process.cpuUsage()).reduce((a,b)=>a+b,0)/1e6;
const bonds=table=>Array.from(table).flatMap((b,a)=>b>a?[[a,b]]:[]);
class CaptureSim extends live.LiveHalfCellSim{
  _formBond(u,i,v,j){
    if(this.type[u]!==T_E&&this.type[v]!==T_E&&(!this.hasMechanicalBond(u)||!this.hasMechanicalBond(v))){
      this._link(u,i,v,j);return true;
    }
    return super._formBond(u,i,v,j);
  }
  step(){throw Error('Prepared capture assay: use physics-only advance');}
}
const Class=arm=>arm==='pins'?CaptureSim:live.LiveHalfCellSim;
function catalog(){
  const entries=[],bound=[],sources={};
  for(const file of INPUTS){
    const raw=read(file);assert(raw.complete);Object.assign(sources,raw.sources);
    const prepared=file.endsWith('.preflight.json'),record=prepared?raw.prepared.record:raw.record;
    record.attempts.forEach((attempt,index)=>{
      const entry={key:prepared?`prepared/${index}`:`${raw.job.seed}/${raw.job.on?'on':'off'}/${index}`,
        origin:prepared?'prepared':`${raw.job.seed}/${raw.job.on?'on':'off'}`,file,index,prepared,attempt};
      if(attempt.geometry.branch==='free')entries.push(entry);else if(!prepared)bound.push(entry);
    });
  }
  assert.equal(entries.length,42);assert.equal(bound.length,6);
  for(const [p,h]of Object.entries(sources))assert.equal(hash(p),h,p);
  return {entries,bound,sources:{...sources,...Object.fromEntries(OWN.map(p=>[p,hash(p)]))},inputs:INPUTS.map(path=>({path,sha256:hash(path)}))};
}
function eligible(s,args){const [u,i,v,j]=args,dx=s._dx(s.px[v]-s.px[u]),dy=s._dy(s.py[v]-s.py[u]);
  return s.bond[u*4+i]<0&&s.bond[v*4+j]<0&&s.compat(...args)>0&&s._geomOK(...args,dx,dy,Math.hypot(dx,dy));}
function setup(entry,job){
  const s=Class(job.arm).fromState(entry.attempt.state,{bodyJostle:job.mode==='body16'}),before=s.saveState();
  assert.equal(s.p.iters,16);assert(eligible(s,entry.attempt.args));
  const accepted=job.arm==='wait'?false:s._formBond(...entry.attempt.args);
  if(job.arm==='project')assert.equal(accepted,entry.attempt.accepted);
  if(job.arm!=='project')for(const k of ['px','py','pa','ox','oy'])assert.deepEqual(s.saveState().arrays[k],before.arrays[k]);
  s._computeOpen(); // Match save restoration after the prepared bond changes.
  const original=[...bonds(s.bond),...bonds(s.rimBond)];
  const target=[entry.attempt.args[0]*4+entry.attempt.args[1],entry.attempt.args[2]*4+entry.attempt.args[3]];
  // Metadata belongs to the observer record, never the simulator.
  return {s,before,accepted,meta:{args:entry.attempt.args,target,anchor:entry.attempt.geometry.anchor,moving:entry.attempt.geometry.moving,
    original:original.filter(([a,b])=>!target.includes(a)||!target.includes(b))}};
}
function frame(s){return {...g.frame(s),rimBonds:bonds(s.rimBond)};}
function projection(s,a,i,m,j){
  const sa=s._side(a,i,[0,0,0,0]),sm=s._side(m,j,[0,0,0,0]);
  const rot=Math.atan2(-sa[3],-sa[2])-Math.atan2(sm[3],sm[2]),c=Math.cos(rot),sn=Math.sin(rot);
  return {rot,x:s._wx(s.px[a]+sa[0]-c*sm[0]+sn*sm[1]),y:s._wy(s.py[a]+sa[1]-sn*sm[0]-c*sm[1])};
}
function side(s,u,i,pose){const q=s._sideCorners(u,i,[0,0]),rot=pose?.rot||0,c=Math.cos(rot),sn=Math.sin(rot),x=pose?.x??s.px[u],y=pose?.y??s.py[u];
  return q.map(k=>[x+c*s.ox[k]-sn*s.oy[k],y+sn*s.ox[k]+c*s.oy[k]]);}
function gap(s,u,i,v,j,pose){const a=side(s,u,i),b=side(s,v,j,pose);return Math.max(...a.map((p,k)=>Math.hypot(s._dx(p[0]-b[1-k][0]),s._dy(p[1]-b[1-k][1]))));}
function projectedGeom(s,u,i,v,j,pose){
  const actualSide=s._side.bind(s),adapter=Object.create(s);
  adapter._side=function(w,k,out){const q=actualSide(w,k,out);if(w!==v)return q;
    const c=Math.cos(pose.rot),sn=Math.sin(pose.rot),[x,y,nx,ny]=q;
    q[0]=c*x-sn*y;q[1]=sn*x+c*y;q[2]=c*nx-sn*ny;q[3]=sn*nx+c*ny;return q;};
  const dx=s._dx(pose.x-s.px[u]),dy=s._dy(pose.y-s.py[u]);
  return adapter._geomOK(u,i,v,j,dx,dy,Math.hypot(dx,dy));
}
function railProbe(s,meta){
  const {anchor:a,moving:m}=meta,options=[];
  for(const rail of [R,L]){
    const b=s.bond[a*4+rail];if(b<0)continue;const n=b>>2,mSide=rail===R?L:R,otherSide=rail;
    if(s.bond[m*4+mSide]>=0)continue;
    const face=s.bond[n*4+F],type=s.type[n]===T_P?T_Q:s.type[n]===T_Q?T_P:s.type[n];
    const candidates=face>=0?[face>>2]:Array.from({length:s.n},(_,u)=>u).filter(u=>u!==m&&s.type[u]===type&&!s.hasMechanicalBond(u));
    for(const u of candidates){if(u===m||![T_A,T_P,T_Q].includes(s.type[u])||s.bond[u*4+otherSide]>=0)continue;
      const pose=face>=0?{x:s.px[u],y:s.py[u],rot:0}:projection(s,n,F,u,F);
      const polygon=s._outline(u,0,0,pose.rot);let overlap=0;
      for(let v=0;v<s.n;v++)if(v!==u)overlap=Math.max(overlap,g.overlap(polygon,s._outline(v,s._dx(s.px[v]-pose.x),s._dy(s.py[v]-pose.y))));
      const copyPin=gap(s,n,F,u,F,pose),railPin=gap(s,m,mSide,u,otherSide,pose),geom=projectedGeom(s,m,mSide,u,otherSide,pose);
      options.push({neighbor:n,unit:u,rail:mSide,prepared:face<0,pose,overlap,copyPin,railPin,geom,
        good:copyPin<=.1&&railPin<=.1&&overlap<=.02&&geom});
    }
  }
  return {available:options.length>0,good:options.some(x=>x.good),options};
}
function measure(s,meta){
  const q=live.geometry(s),[u,i,v,j]=meta.args;
  const existingPin=Math.max(0,...meta.original.map(([a,b])=>gap(s,a>>2,a&3,b>>2,b&3)));
  const targetPin=gap(s,u,i,v,j),targetOverlap=g.overlap(s._outline(u),s._outline(v,s._dx(s.px[v]-s.px[u]),s._dy(s.py[v]-s.py[u])));
  return {...q,targetPin,targetOverlap,existingPin,probe:railProbe(s,meta)};
}
const good=q=>q.targetPin<=.1&&q.existingPin<=.1&&q.maxOverlap<=.02&&q.probe.good;
function invariant(s,initial){live.invariant(s,initial);const state=s.saveState();for(const k of ['bond','rimBond','is'])assert.deepEqual(state.arrays[k],initial.arrays[k],k);}
function advance(s,kind){s._physics();s.t++;counts[kind]++;}
function run(entry,job,horizon=60){
  const {s,before,accepted,meta}=setup(entry,job),initial=s.saveState(),plain=Class(job.arm).fromState(initial);
  const c={job,entry:entry.key,origin:entry.origin,prepared:entry.prepared,previouslyAccepted:entry.attempt.accepted,before,initial,accepted,meta,samples:[]};let resumed;
  const mid=Math.floor(horizon/2);
  for(let dt=0;dt<=horizon;dt++){
    if(dt){advance(s,'observed');if(dt>mid)advance(resumed,'restart');}
    const f=frame(s),metrics=measure(s,meta);c.samples.push({dt,frame:f,metrics});
    if(dt<=5||dt===horizon)invariant(s,initial);
    if(dt===mid){c.midpoint=s.saveState();resumed=Class(job.arm).fromState(c.midpoint);}
  }
  for(let k=0;k<horizon;k++)advance(plain,'plain');c.final=s.saveState();
  assert.deepEqual(g.comparable(c.final),g.comparable(plain.saveState()));assert.deepEqual(g.comparable(c.final),g.comparable(resumed.saveState()));
  c.neutral=c.restart=true;return c;
}
function summarize(records){
  const rows=records.map(c=>{const tail=c.samples.slice(-10).map(x=>x.metrics);return {entry:c.entry,origin:c.origin,prepared:c.prepared,previouslyAccepted:c.previouslyAccepted,...c.job,
    accepted:c.accepted,pass:c.accepted&&tail.every(good),aligned:tail.every(q=>q.targetPin<=.1),
    geometry:tail.every(q=>q.targetPin<=.1&&q.existingPin<=.1&&q.maxOverlap<=.02),access:tail.every(q=>q.probe.good),
    unavailable:tail.filter(q=>!q.probe.available).length,maxOverlap:Math.max(...c.samples.map(x=>x.metrics.maxOverlap)),
    maxTargetPin:Math.max(...c.samples.map(x=>x.metrics.targetPin)),tailOverlap:Math.max(...tail.map(q=>q.maxOverlap)),
    tailExistingPin:Math.max(...tail.map(q=>q.existingPin)),tailTargetPin:Math.max(...tail.map(q=>q.targetPin))};});
  const groups=[];for(const origin of [...new Set(rows.map(r=>r.origin))])for(const mode of ['body16','individual16']){
    const pins=rows.filter(r=>r.origin===origin&&r.mode===mode&&r.arm==='pins'),project=rows.filter(r=>r.origin===origin&&r.mode===mode&&r.arm==='project'),wait=rows.filter(r=>r.origin===origin&&r.mode===mode&&r.arm==='wait');
    const rejected=pins.filter(r=>!r.previouslyAccepted);
    groups.push({origin,mode,n:pins.length,pinsPass:pins.filter(r=>r.pass).length,pinsGeometry:pins.filter(r=>r.geometry).length,pinsAccess:pins.filter(r=>r.access).length,
      projectPass:project.filter(r=>r.pass).length,waitAligned:wait.filter(r=>r.aligned).length,
      benefit:origin==='prepared'||rejected.some(r=>r.pass&&!wait.find(w=>w.entry===r.entry).aligned)});
  }
  return {pass:rows.length===252&&rows.filter(r=>r.arm==='pins').every(r=>r.pass)&&groups.every(g=>g.benefit),groups,rows};
}
function validate(c,entry){
  const start=setup(entry,c.job);assert.deepEqual(g.comparable(start.s.saveState()),g.comparable(c.initial));assert.deepEqual(start.meta,c.meta);
  assert(c.neutral&&c.restart);const s=Class(c.job.arm).fromState(c.initial);
  for(let dt=0;dt<c.samples.length;dt++){
    if(dt)advance(s,'replay');const q=c.samples[dt];assert.equal(q.dt,dt);assert.deepEqual(frame(s),q.frame,'Frame mismatch');assert.deepEqual(measure(s,c.meta),q.metrics,'Metrics mismatch');
    if(dt===30)assert.deepEqual(g.comparable(s.saveState()),g.comparable(c.midpoint));
  }
  invariant(s,c.initial);assert.deepEqual(g.comparable(s.saveState()),g.comparable(c.final));
}
function main(mode,file){
  const validating=mode==='--validate',preflight=mode==='--preflight',output=validating?file+'.validation.json':file;
  assert(!fs.existsSync(output)&&!fs.existsSync(output+'.cpu.json'),'Unique output required');
  const catalogData=catalog(),{entries,bound}=catalogData,r={command:process.argv.slice(1),sources:catalogData.sources,inputs:catalogData.inputs,complete:false,censored:false,records:[]};
  try{
    if(validating){
      const raw=read(file);assert(raw.complete&&!raw.censored);assert.deepEqual(raw.sources,r.sources);assert.equal(raw.records.length,252);
      for(const c of raw.records){validate(c,entries.find(e=>e.key===c.entry));if(cpu()>250){r.censored=true;break;}}
      if(!r.censored){assert.deepEqual(summarize(raw.records),raw.summary);r.summary=raw.summary;r.rawHash=hash(file);r.frames=252*61;
        for(const kind of ['corner','bond']){const bad=structuredClone(raw.records[0]);if(kind==='corner')bad.samples[1].frame.polygons[0][0][0]+=.25;else bad.samples[1].frame.rimBonds=[];assert.throws(()=>validate(bad,entries[0]),/Frame mismatch/);}
        const bad=structuredClone(raw.summary);bad.pass=!bad.pass;assert.throws(()=>assert.deepEqual(summarize(raw.records),bad));r.corruptionsRejected=3;}
    }else{
      r.boundControls=bound.map(e=>{const a=live.LiveHalfCellSim.fromState(e.attempt.state),b=CaptureSim.fromState(e.attempt.state);assert.equal(a._formBond(...e.attempt.args),b._formBond(...e.attempt.args));assert.deepEqual(g.comparable(a.saveState()),g.comparable(b.saveState()));return {key:e.key,accepted:e.attempt.accepted};});
      const selected=preflight?[entries.find(e=>!e.attempt.accepted),entries.find(e=>e.attempt.accepted),entries.find(e=>e.prepared)]:entries;
      jobs: for(const e of selected)for(const motion of ['body16','individual16'])for(const arm of ['project','pins','wait']){
        r.records.push(run(e,{mode:motion,arm},preflight?5:60));
        if(cpu()>(preflight?50:400)){r.censored=true;break jobs;}
        if(!preflight&&r.records.length%18===0)console.log(JSON.stringify({records:r.records.length,total:252,cpu:cpu()}));
      }
      if(!preflight&&!r.censored)r.summary=summarize(r.records);
    }
    r.complete=!r.censored;
  }catch(e){r.error={message:e.message,stack:e.stack};process.exitCode=1;}
  write(output,r);write(output+'.cpu.json',{cpuSeconds:cpu(),counts,complete:r.complete,censored:r.censored});
  console.log(JSON.stringify({complete:r.complete,censored:r.censored,counts,cpu:cpu(),pass:r.summary?.pass,groups:r.summary?.groups,error:r.error}));
}
if(require.main===module){const [a,b]=process.argv.slice(2);main(a.startsWith('--')?a:'run',a.startsWith('--')?b:a);}
module.exports={CaptureSim,catalog,setup,frame,measure,summarize,validate,railProbe};
