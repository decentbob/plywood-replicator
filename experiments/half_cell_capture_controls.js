#!/usr/bin/env node
'use strict';
const fs=require('fs'),assert=require('assert/strict');
const base=require('./half_cell_capture'),live=require('./half_cell_live'),g=require('./half_cell_geometry');
const {read,write}=require('./half_cell_bath'),{hash}=require('./half_cell_rim_test');
const [input,out]=process.argv.slice(2),raw=read(input);assert(raw.complete&&!raw.censored);assert(!fs.existsSync(out)&&!fs.existsSync(out+'.cpu.json'));
const C=arm=>arm==='pins'?base.CaptureSim:live.LiveHalfCellSim;
const counts={observed:0,plain:0,restart:0,replay:0},advance=(s,kind)=>{s._physics();s.t++;counts[kind]++;};
const r={command:process.argv.slice(1),input,inputHash:hash(input),complete:false,records:[],
  sources:{...raw.sources,...Object.fromEntries(['experiments/half_cell_capture_controls.js','experiments/half_cell_capture_control_note.md'].map(p=>[p,hash(p)]))}};
try{
  for(const [p,h]of Object.entries(r.sources))assert.equal(hash(p),h,p);
  const entries=base.catalog().entries.filter(e=>e.prepared).map(e=>{const result=structuredClone(e);Object.assign(result.attempt.state.p,{sigma:.3,sigmaRot:.45});return result;});
  for(const entry of entries)for(const mode of ['body16','individual16'])for(const arm of ['project','pins','wait']){
    const job={mode,arm},start=base.setup(entry,job),s=start.s,initial=s.saveState(),plain=C(arm).fromState(initial);
    const c={job,entry:entry.key,origin:entry.origin,prepared:true,previouslyAccepted:entry.attempt.accepted,...start,initial,samples:[]};delete c.s;let resumed;
    for(let dt=0;dt<=60;dt++){
      if(dt){advance(s,'observed');if(dt>30)advance(resumed,'restart');}
      c.samples.push({dt,frame:base.frame(s),metrics:base.measure(s,c.meta)});
      live.invariant(s,initial);if(dt===30){c.midpoint=s.saveState();resumed=C(arm).fromState(c.midpoint);}
    }
    for(let t=0;t<60;t++)advance(plain,'plain');c.final=s.saveState();
    for(const k of ['bond','rimBond','is'])assert.deepEqual(c.final.arrays[k],initial.arrays[k]);
    assert.deepEqual(g.comparable(c.final),g.comparable(plain.saveState()));assert.deepEqual(g.comparable(c.final),g.comparable(resumed.saveState()));c.neutral=c.restart=true;
    const replay=C(arm).fromState(initial);
    for(let dt=0;dt<=60;dt++){if(dt)advance(replay,'replay');assert.deepEqual(base.frame(replay),c.samples[dt].frame);assert.deepEqual(base.measure(replay,c.meta),c.samples[dt].metrics);}
    assert.deepEqual(g.comparable(replay.saveState()),g.comparable(c.final));r.records.push(c);
    assert(Object.values(process.cpuUsage()).reduce((a,b)=>a+b,0)/1e6<70,'Control correction CPU ceiling');
  }
  r.originalSummary=raw.summary;r.summary=base.summarize([...raw.records.filter(c=>!c.prepared),...r.records]);r.complete=true;
}catch(e){r.error={message:e.message,stack:e.stack};process.exitCode=1;}
write(out,r);write(out+'.cpu.json',{cpuSeconds:Object.values(process.cpuUsage()).reduce((a,b)=>a+b,0)/1e6,counts,complete:r.complete});
console.log(JSON.stringify({complete:r.complete,counts,pass:r.summary?.pass,groups:r.summary?.groups,error:r.error}));
