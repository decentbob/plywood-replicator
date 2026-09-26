#!/usr/bin/env node
const assert=require('assert/strict'),fs=require('fs');
const {Sim,F,K,L,R,I_DOCK,I_REPEL,S}=require('../src/sim');
const {SEEK,install,observe}=require('./local_redocking');
const p=JSON.parse(fs.readFileSync('experiments/out/PR_selected.json')).prepared;
const make=(mode='seek',rate=1)=>install(Sim.fromState(p.state),mode,rate);
// Eligible endpoint: only its own state changes and only its F bond is queued.
for(const mode of ['drop','seek']){
  const s=make(mode),before=s.saveState();s._transition(87);
  assert.equal(s.is[87],mode==='seek'?SEEK:I_REPEL);assert.deepEqual(s.pendingUnlink,[87*4+F]);
  assert.deepEqual(s.saveState().arrays.bond,before.arrays.bond);assert.equal(s.kicked.length,0);
  for(const k of ['px','py','pa','ox','oy','type','hand'])assert.deepEqual(s.saveState().arrays[k],before.arrays[k]);
}
// State persists free, exposes only the normal docking face, and returns to
// ordinary chemistry when a face binds. No observer identities are consulted.
const s=make(),q=s.bond[87*4+F];s._transition(87);s.pendingUnlink.length=0;s._unlink(87,F);s._deriveAll();s._computeOpen();
assert.equal(s.ss[87*4+F],S.DOCK);assert.equal(s.ss[87*4+K],S.IDLE);assert.equal(s.open[87],1<<F);
for(const i of[L,R])assert.equal(s.ss[87*4+i],s.bond[87*4+i]>=0?S.BONDED:S.INERT);
const rng=s.rng.getState();for(let i=0;i<10;i++)s._transition(87);assert.equal(s.is[87],SEEK);assert.equal(s.rng.getState(),rng);
assert.equal(s.compat(87,F,q>>2,F),1);s._link(87,F,q>>2,F);s._deriveAll();s._transition(87);assert.equal(s.is[87],I_DOCK);
// Prohibit hidden global inspection in both rule paths.
const local=make();for(const k of ['strandOf','componentOf','stats','chainOf'])local[k]=()=>{throw Error('Global read: '+k);};
local._transition(107);local._derive(107);assert.equal(local.is[107],SEEK);
// Unlinked material and already inactive units do not receive the new state.
const quiet=make();const free=Array.from({length:quiet.n},(_,u)=>u).find(u=>quiet.is[u]===I_DOCK&&[F,K,L,R].every(i=>quiet.bond[u*4+i]<0));
quiet._transition(free);assert.equal(quiet.is[free],I_DOCK);assert.equal(quiet.pendingUnlink.length,0);
const inactive=p.cohort[0].units[0];quiet._transition(inactive);assert.equal(quiet.is[inactive],I_REPEL);
// The off subclass consumes no extra randomness; active observation and save /
// restore are exact, including after SEEK has arisen.
const off=make('off',0),plain=Sim.fromState(p.state);off.run(1000);plain.run(1000);assert.deepEqual(off.saveState(),plain.saveState());
const a=make('seek',0.001),b=make('seek',0.001);const o=observe(b);a.run(5000);b.run(5000);
assert.deepEqual(a.saveState(),b.saveState());assert(o.events.some(x=>x.kind==='endpoint-release'));
const restored=install(Sim.fromState(a.saveState()),'seek',0.001);a.run(500);restored.run(500);
const x=a.saveState(),y=restored.saveState();y.nums.pinsVersion=x.nums.pinsVersion;assert.deepEqual(y,x);
console.log('PASS: local state/face edits, no kick/global reads, SEEK persistence and contact return, compatibility, off identity, active observer neutrality and restart');
