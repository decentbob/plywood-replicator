#!/usr/bin/env node
const assert=require('assert/strict');
const {setup,run,child}=require('./complementary_fit.js');
const {F,L,R,I_DOCK,T_A,T_B}=require('../src/sim.js');
const job={seed:32,profile:'opposed',complement:false,sequence:'ABBABA',steps:1000,iters:4,bodyJostle:true};
assert.equal(child(job.sequence,false),'ABABBA');assert.equal(child(job.sequence,true),'BABAAB');
assert.equal(child(child(job.sequence,true),true),job.sequence);
const off=setup(job),on=setup({...job,complement:true});
for(const k of ['type','is','px','py','pa','ox','oy'])assert.deepEqual(off.s[k],on.s[k],'Matched initial '+k);
// Verify actual free A widens toward its back, while B narrows.
for(const [t,wider] of [[T_A,true],[T_B,false]]) {
  const u=Array.from(off.s.type).findIndex((x,i)=>x===t&&off.s.is[i]===I_DOCK),s=off.s;
  const width=side=>{const [a,b]=s._sideCorners(u,side,[0,0]);return Math.hypot(s.ox[b]-s.ox[a],s.oy[b]-s.oy[a]);};
  assert.equal(width(2)>width(F),wider,'Opposing physical wedge sign');
}
for(const {s,template} of [off,on]) {
  const wanted=s.p.compCopy?[T_B,T_A]:[T_A,T_B];
  const [a,b]=wanted.map(t=>Array.from(s.type).findIndex((x,u)=>x===t&&s.is[u]===I_DOCK));
  assert.equal(s.compat(a,F,template[0],F),1);assert.equal(s.compat(b,F,template[1],F),1);
  s._link(a,F,template[0],F);s._link(b,F,template[1],F);s._deriveAll();assert.equal(s.compat(a,L,b,R),1);
}
for(const sequence of ['ABBABA','BABAAB'])for(const complement of [false,true]) {
  const r=run({...job,sequence,complement});assert.equal(r.other,0);assert.equal(r.windows[0].samples,50);
}
console.log('PASS: opposing actual wedges, matched starting physics, equal intended bond probabilities, reciprocal expected sequences, conserved inactive offspring');
