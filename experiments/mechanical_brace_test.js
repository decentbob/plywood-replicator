#!/usr/bin/env node
const assert=require('assert/strict');
const {setup,run}=require('./mechanical_brace.js');
const {F,L,R,I_DOCK,T_A,T_B,Sim}=require('../src/sim.js');
const job={seed:11,fold:15,steps:1000};
const off=setup({...job,attached:false}),on=setup({...job,attached:true});
for(const key of ['type','is','px','py','pa','ox','oy']) assert.deepEqual(on.s[key],off.s[key],'Matched initial '+key);
for(const {s,template} of [off,on]) {
  const a=Array.from(s.type).findIndex((t,u)=>t===T_A&&s.is[u]===I_DOCK);
  const b=Array.from(s.type).findIndex((t,u)=>t===T_B&&s.is[u]===I_DOCK);
  s._link(a,F,template[0],F);s._link(b,F,template[1],F);s._deriveAll();
  assert.equal(s.compat(a,L,b,R),1,'Same letter-link probability with or without support');
  s.p.pLinkBare=0.05;
  assert.equal(s.compat(a,L,b,R),s===on.s?1:0.05,'Assay removes a real chemical contrast');
}
for(const attached of [false,true]) for(const bodyJostle of [false,true]) {
  const r=run({...job,attached,bodyJostle});
  assert.equal(r.supportOccupancy,attached?1:0);
  assert.equal(r.other,0);
}
const original=setup({...job,attached:true}).s;
original.run(100);
const resumed=Sim.fromState(JSON.parse(JSON.stringify(original.saveState())));
original.run(100);resumed.run(100);
for(const key of ['is','bond','px','py','ox','oy']) assert.deepEqual(original[key],resumed[key]);
console.log('PASS: matched initial geometry, equal linking probability, support retention, conserved single-founder assay, exact resume');
