#!/usr/bin/env node
const assert=require('assert/strict'),fs=require('fs');
const {setup,instrument}=require('./patch_completion'),{R,L}=require('../src/sim');
const job={seed:81,profile:'opposed20',undock:0.1,steps:20000};
const a=setup(job),b=setup(job),o=instrument(b.s,b.parent);
a.s.run(20000);b.s.run(20000);
assert.deepEqual(b.s.saveState(),a.s.saveState());assert.deepEqual(b.s.births,a.s.births);assert.deepEqual(b.s.stats(),a.s.stats());
const reference=fs.readFileSync('experiments/out/EP_copy.runs.jsonl','utf8').trim().split(/\r?\n/).map(JSON.parse).find(r=>r.seed===81&&r.profile===job.profile);
assert.deepEqual(b.s.births,reference.births);assert.equal(o.completed.length,reference.exact);
const stronger=setup({...job,undock:1}); // Compare initial states separately, before any steps.
const initial=setup(job).s.saveState(),other=stronger.s.saveState();other.p.pUndock=0.1;assert.deepEqual(other,initial);
// Synthetic observer fixture: two nuclei, one extension and their merger; no physics is run.
const f=setup(job),obs=instrument(f.s,f.parent),free=Array.from({length:f.s.n},(_,i)=>i).filter(u=>!f.parent.includes(u)),[u,v,w,x,y]=free;
f.s._link(u,R,v,L);f.s.t=1;f.s._link(v,R,w,L);f.s.t=2;f.s._link(x,R,y,L);assert.equal(obs.sample(),2);
f.s.t=3;f.s._link(w,R,x,L);assert.equal(obs.sample(),1);assert.deepEqual(obs.links.map(e=>e.kind),['nucleation','extension','nucleation','merge']);
assert.deepEqual(obs.unfinished()[0].nuclei,[0,2]);assert.equal(obs.unfinished()[0].start,0);
f.s.t=4;f.s._event('birth',u);assert.equal(obs.sample(),0);assert.deepEqual(obs.completed[0],{t:4,units:[u,v,w,x,y],nuclei:[0,2],start:0});
assert.throws(()=>f.s._unlink(u,R));assert.throws(()=>f.s._link(y,R,free[5],L));
console.log('PASS: exact saved-state/RNG observer neutrality, archived replay, matched initial conditions, nucleation/extension/merge, birth attribution and censoring');
