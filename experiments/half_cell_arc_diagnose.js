#!/usr/bin/env node
'use strict';
// Post-result diagnosis frozen here: replay the largest closed-world overlap,
// sample each unchanged solver pass before/after contacts, and check neutrality.
// No new parameter, extra relaxation, timestep or gate; no rescue of Q8f.
const fs=require('fs'),zlib=require('zlib'),assert=require('assert/strict');
const {ArcSim,frame,measure}=require('./half_cell_arc'),g=require('./half_cell_geometry');
const {hash}=require('./half_cell_rim_test');
const file=process.argv[2],target=process.argv[3];assert(file&&target&&!fs.existsSync(target),'Unique output required');
const raw=JSON.parse(zlib.gunzipSync(fs.readFileSync(file)));assert(raw.complete&&!raw.summary.pass);
const out={command:process.argv.slice(1),rawHash:hash(file),sourceHash:hash(__filename),complete:false,physicsSteps:0};
try{
  for(const [f,h]of Object.entries(raw.sources))assert.equal(hash(f),h,f);
  let selected;
  for(const c of raw.records.filter(c=>c.job.arm==='closed'))for(const q of c.samples)
    if(!selected||q.metrics.structuralOverlap>selected.q.metrics.structuralOverlap)selected={c,q};
  const {c,q}=selected,t=q.frame.t;assert(t>0);
  Object.assign(out,{job:c.job,t,expected:q,stages:[],windowFailures:[]});
  const s=ArcSim.fromState(c.initial),plain=ArcSim.fromState(c.initial);
  const advance=x=>{if(x.t===40){for(const [a]of c.ids.faces)x._unlink(a>>2,0);x._computeOpen();}x._physics();x.t++;out.physicsSteps++;};
  for(let k=1;k<t;k++){advance(s);assert.deepEqual(frame(s),c.samples[k].frame);}
  const ordinary=s.bond,originalPairs=s._polygonContacts,originalSeparate=s._separatePair;let pairs=0,calls=0;
  const capture=(phase,pass)=>{
    const f=frame(s);f.bonds=[...ordinary].flatMap((b,a)=>b>a?[[a,b]]:[]);
    out.stages.push({phase,pass,frame:f,metrics:measure(f,c.metadata,c.ids)});
  };
  s._polygonContacts=function(){const xs=originalPairs.call(this);pairs=xs.length/2;assert(pairs>0);return xs;};
  s._separatePair=function(u,v){
    if(calls%pairs===0)capture('beforeContacts',Math.floor(calls/pairs)+1);
    originalSeparate.call(this,u,v);calls++;
    if(calls%pairs===0)capture('afterContacts',calls/pairs);
  };
  advance(s);capture('afterFinalPinsAndShape',s.p.iters);assert.equal(calls,pairs*s.p.iters);
  for(let k=0;k<t;k++)advance(plain);
  assert.deepEqual(frame(s),q.frame);assert.deepEqual(g.comparable(s.saveState()),g.comparable(plain.saveState()));
  out.neutral=true;
  const f=q.frame,m=c.metadata,structural=c.ids.groups.flat(),wrap=(x,w)=>x-w*Math.round(x/w);let pair;
  for(let k=0;k<structural.length;k++)for(let l=k+1;l<structural.length;l++){
    const u=structural[k],v=structural[l],dx=f.centers[v][0]-f.centers[u][0],dy=f.centers[v][1]-f.centers[u][1];
    const ps=f.polygons[v].map(p=>[p[0]+wrap(dx,m.W)-dx,p[1]+wrap(dy,m.H)-dy]),overlap=g.overlap(f.polygons[u],ps);
    if(!pair||overlap>pair.overlap)pair={u,v,types:[m.types[u],m.types[v]],overlap,
      directlyBonded:[...f.bonds,...f.rimBonds].some(([a,b])=>((a>>2)===u&&(b>>2)===v)||((a>>2)===v&&(b>>2)===u))};
  }
  out.worstPair=pair;
  for(const c of raw.records)for(const [window,lo,hi]of [['held',31,40],['released',111,120]]){
    const xs=c.samples.filter(q=>q.frame.t>=lo&&q.frame.t<=hi);
    out.windowFailures.push({...c.job,window,pin:xs.filter(q=>q.metrics.maxPin>.1).length,
      overlap:xs.filter(q=>q.metrics.structuralOverlap>.02).length,
      copying:xs.filter(q=>q.metrics.copying.some(x=>!x)).length,
      fuel:xs.filter(q=>q.metrics.fuel.some(x=>x.overlap>.02)).length});
  }
  out.complete=true;
}catch(e){out.error={message:e.message,stack:e.stack};process.exitCode=1;}
const cost=process.cpuUsage();out.cpuSeconds=(cost.user+cost.system)/1e6;
fs.writeFileSync(target,JSON.stringify(out)+'\n',{flag:'wx'});
console.log(JSON.stringify({complete:out.complete,cpuSeconds:out.cpuSeconds,physicsSteps:out.physicsSteps,worstPair:out.worstPair,
  stages:out.stages?.map(s=>({phase:s.phase,pass:s.pass,pin:s.metrics.maxPin,overlap:s.metrics.structuralOverlap})),error:out.error}));
