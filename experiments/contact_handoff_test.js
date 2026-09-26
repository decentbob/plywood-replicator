#!/usr/bin/env node
const fs=require('fs'),assert=require('assert/strict');
const {Sim,F,L,R,S,I_DOCK,I_REPEL}=require('../src/sim');
const {SEEK}=require('./local_redocking');
const a=require('./contact_handoff'),{validate}=require('./contact_handoff_summary');
const r=JSON.parse(fs.readFileSync(process.argv[2]||'experiments/out/CH_selected.json')),rs=validate(r),p=r.prepared[0];
const u=p.u,v=107,w=95;
function fixture(mode='hold'){const s=a.install(Sim.fromState(p.state),mode);s.is[u]=a.REQUEST;return s;}
// A new mark cannot be read in the derive pass that first publishes it.
{
  const s=fixture();assert.equal(s.is[v],I_REPEL);s._deriveAll();assert.equal(s.hm[v*4+L],0);
  assert.equal(s.hm0[s.bond[v*4+L]],0);s._transition(v);assert.equal(s.is[v],I_REPEL);
  s._deriveAll();s._transition(v);assert.equal(s.is[v],a.OFFER);
  s._deriveAll();s._deriveAll();s._transition(w);assert.equal(s.is[w],I_REPEL,'Request must not propagate a second hop');
  assert.equal(s.ss[v*4+F],S.DOCK);assert.equal(s.hm[u*4+F],0);assert.equal(s.hm[u*4+2],0);
  s._unlink(u,F);s._deriveAll();s._deriveAll();s._transition(v);assert.equal(s.is[v],I_REPEL,'Face loss withdraws request');
}
// Capture/release sequence uses only bonded previous-pass signals. An OFFER
// contact must survive its capture transition in hold, unlike the pulse arm.
for(const mode of ['hold','pulse']){
  const s=fixture(mode);s._deriveAll();s._deriveAll();s._transition(v);assert.equal(s.is[v],a.OFFER);
  const f=p.parent[2];assert.equal(s.bond[f*4+F],-1);s._link(v,F,f,F);s._deriveAll();s._deriveAll();s._transition(v);
  assert.equal(s.is[v],mode==='hold'?a.LATCH:I_REPEL);
  s._transition(u);assert.equal(s.is[u],a.REQUEST,'No reading live capture state');
  s._deriveAll();s._transition(u);assert.equal(s.is[u],a.REQUEST,'Support has not reached previous pass');
  s._deriveAll();s._transition(u);
  assert.equal(s.is[u],mode==='hold'?SEEK:a.REQUEST);
  assert.equal(s.pendingUnlink.includes(u*4+F),mode==='hold');
  if(mode==='hold'){
    s._unlink(u,F);s.pendingUnlink.length=0;s._deriveAll();s._deriveAll();s._transition(v);assert.equal(s.is[v],I_REPEL,'Latch releases when request disappears');
  }
}
{
  const s=fixture();s.hm0.fill(2);s._unlink(u,R);s._transition(u);assert.notEqual(s.is[u],SEEK,'No support read through a missing bond');
}
// Restarts preserve marks and trajectories even while the two contacts overlap.
for(const p0 of r.prepared)for(const arm of a.arms){
  const observed=a.install(Sim.fromState(p0.state),arm),plain=a.install(Sim.fromState(p0.state),arm);a.watch(observed);
  observed.run(300);plain.run(300);assert.deepEqual(a.save(observed),a.save(plain));
  const continuous=a.install(Sim.fromState(p0.state),arm);continuous.run(3);const snapshot=a.save(continuous),resumed=a.restore(snapshot,arm);
  assert.deepEqual(a.marks(resumed),snapshot.marks);continuous.run(300);resumed.run(300);
  const c=a.save(continuous),q=a.save(resumed),delta=q.state.nums.pinsVersion-c.state.nums.pinsVersion;
  assert.equal(delta,snapshot.state.nums.bondsDirty?0:1);q.state.nums.pinsVersion=c.state.nums.pinsVersion;assert.deepEqual(q,c);
}
const square=rs.filter(x=>x.profile==='square'),curved=rs.filter(x=>x.profile==='opposed20');
assert.deepEqual(square.map(x=>x.targetExact),[false,true,true,true]);assert.deepEqual(curved.map(x=>x.targetExact),[false,false,false,false]);
assert.deepEqual(square[3].acquisitions,[{t:5318,u:v,site:2}]);assert.deepEqual(square[3].handoffs,[{t:5319,u,site:3}]);
assert.deepEqual(square[3].primaryReturns,[{t:5320,site:3}]);assert.equal(square[3].heldPhases,2);assert.equal(square[3].overlapPhases,1);
assert(square[1].target[0].t<square[3].target[0].t);assert(curved.slice(1).every(x=>x.unresolved.length===1&&!x.acquisitions.length));
assert.equal(square[2].captures,519);assert.equal(square[2].pendingBlocks,2);assert.equal(curved[3].captures,0);
let rejected=0;
for(const change of [x=>x.inputHash='bad',x=>x.sources['src/sim.js']='bad',x=>x.neutral=false,x=>x.executedSteps++,x=>x.results.pop(),
  x=>x.prepared[0].target.pop(),x=>x.results[3].initial.state.rng++,x=>x.results[3].settled.pop(),x=>x.results[3].settled[0].seq='PAAAABBBQ',
  x=>x.results[3].events.find(e=>e.kind==='state'&&e.after===a.LATCH).read[3]=0,
  x=>x.results[3].events.find(e=>e.kind==='state'&&e.after===SEEK).after=a.REQUEST,
  x=>x.results[3].events.find(e=>e.kind==='unlink').i=R,
  x=>x.results[3].events.find(e=>e.kind==='state'&&e.after===a.LATCH).bonds[0]=-1,
  x=>x.results[3].windows[0].rows.pop(),x=>x.results[3].windows[0].stats.free++,
  x=>x.results[7].windows[0].marks.previous.fill(0),x=>x.results[7].final.marks.current.fill(0),
  x=>x.results[3].stockBirths.pop(),x=>x.results[3].events.reverse()]){
  const copy=structuredClone(r);change(copy);assert.throws(()=>validate(copy));rejected++;
}
console.log(`PASS: local signaling latency, capture and withdrawal, eight-arm observer/restart checks, raw reconstruction and ${rejected} corruptions`);
