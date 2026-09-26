#!/usr/bin/env node
const assert=require('assert/strict');
const {setup,instrument,sample,run}=require('./curved_fuel.js');
const {F,K,L,T_U,I_TPL,Sim}=require('../src/sim.js');
const job={seed:71,sequence:'AAAABBBB',profile:'opposed40',size:0.5,steps:2000,iters:4,bodyJostle:true,grip:true};
const {s,template}=setup(job),events=instrument(s,template),fuel=Array.from(s.type).indexOf(T_U);
// Chemistry fixture only: one held side cannot give; two can, spending exactly one fuel.
s.p.pGripMelt=0;s.p.pGripMelt2=0;
s._link(fuel,F,template[5],K);s._deriveAll();s.t++;s._chemistry();assert.equal(s.fuelUsed,0);assert.equal(events.length,0);
s._link(fuel,L,template[6],K);s._deriveAll();s.t++;s._chemistry();
assert.equal(s.fuelUsed,1);assert.equal(events.length,1);assert.equal(events[0].holders.length,2);
assert.equal(s.is[template[events[0].index]],I_TPL);
const observed=setup(job),plain=setup(job);instrument(observed.s,observed.template);
const w={samples:0,armedSum:0,bendSum:0,held1:0,held2:0};
for(let i=0;i<20;i++){observed.s.run(100);sample(observed.s,observed.template,w);plain.s.run(100);}
assert.deepEqual(observed.s.saveState(),plain.s.saveState(),'Observation changed trajectory');
assert(w.bendSum/w.samples>5,'Persistent bend physically active');
const resumed=Sim.fromState(JSON.parse(JSON.stringify(plain.s.saveState())));plain.s.run(100);resumed.run(100);
for(const k of ['is','bond','px','py','pa','ox','oy'])assert.deepEqual(plain.s[k],resumed[k]);
assert.equal(plain.s.rng(),resumed.rng());
const off=setup({...job,grip:false}),on=setup(job);
for(const k of ['type','is','px','py','pa','ox','oy'])assert.deepEqual(off.s[k],on.s[k],'Grip control initial '+k);
const r=run({...job,grip:false});assert.equal(r.armed,0);assert.equal(r.completeTime,null);
console.log('PASS: local two-contact energy accounting, real curvature, observer neutrality, matched grip ablation, conservation, exact resume');
