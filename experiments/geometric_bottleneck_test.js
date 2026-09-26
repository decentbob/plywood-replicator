#!/usr/bin/env node
const assert=require('assert/strict');
const {setup,counters,observe,run}=require('./geometric_bottleneck.js');
const {F,L,R,I_DOCK,T_A,T_B,Sim}=require('../src/sim.js');
const job={seed:31,angle:20,attached:false,steps:1000,mode:'bend',stiffness:0.5,iters:4,bodyJostle:true};
const off=setup(job),on=setup({...job,attached:true});
for(const k of ['type','is','px','py','pa','ox','oy'])assert.deepEqual(off.s[k],on.s[k],'Matched initial '+k);
const square=setup({...job,angle:0});
assert.notDeepEqual(square.s.ox,off.s.ox,'Permanent wedge actually changes corners');
for(const {s,template} of [off,on]) {
  const a=Array.from(s.type).findIndex((t,u)=>t===T_A&&s.is[u]===I_DOCK);
  const b=Array.from(s.type).findIndex((t,u)=>t===T_B&&s.is[u]===I_DOCK);
  s._link(a,F,template[0],F);s._link(b,F,template[1],F);s._deriveAll();
  assert.equal(s.compat(a,L,b,R),1);
  const c=counters();observe(s,template,c);assert.equal(c.edges[0].both,1);assert.equal(c.edges[0].eligible,1);
  s._link(a,L,b,R);s._deriveAll();const d=counters();observe(s,template,d);assert.equal(d.edges[0].joined,1);
}
// Sampling must not consume randomness or modify any stored dynamics.
const observed=setup(job),plain=setup(job),c=counters();
for(let i=0;i<50;i++){observed.s.run(20);observe(observed.s,observed.template,c);plain.s.run(20);}
assert.deepEqual(observed.s.saveState(),plain.s.saveState(),'Observer changed trajectory');
assert(c.edges.some(e=>e.eligible>0),'Must exercise the geometric gate');
const resumed=Sim.fromState(JSON.parse(JSON.stringify(observed.s.saveState())));
observed.s.run(100);resumed.run(100);
for(const k of ['is','bond','px','py','pa','ox','oy','births'])assert.deepEqual(observed.s[k],resumed[k],'Resume '+k);
assert.equal(observed.s.rng(),resumed.rng(),'Resume random stream');
for(const attached of [false,true])for(const bodyJostle of [false,true]) {
  const r=run({...job,attached,bodyJostle});assert.equal(r.other,0);assert.equal(r.supportOccupancy,attached?1:0);
  assert.equal(r.windows.reduce((n,w)=>n+w.samples,0),50);
}
console.log('PASS: shape activation, matched geometry, equal chemistry, gate counters, observation neutrality, conservation, inactive offspring, support retention, resume');
