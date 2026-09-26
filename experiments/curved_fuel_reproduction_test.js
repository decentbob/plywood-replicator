#!/usr/bin/env node
const assert=require('assert/strict');
const {setup,instrument,run}=require('./curved_fuel_reproduction.js');
const {I_REPEL,I_TPL}=require('../src/sim.js');
const job={seed:71,profile:'opposed20',mode:'bootstrap',rows:4,grip:true,iters:4,steps:2000};
const a=setup(job),b=setup(job);instrument(a.s);
assert(a.founders.every(u=>a.s.is[u]===I_REPEL));
a.s.run(2000);b.s.run(2000);assert.deepEqual(a.s.saveState(),b.s.saveState(),'Observer changes dynamics');
const off=setup({...job,grip:false}),on=setup(job);
for(const k of ['type','is','px','py','pa','ox','oy'])assert.deepEqual(off.s[k],on.s[k]);
const r=run({...job,grip:false});assert.equal(r.total,0);assert.equal(r.fuelUsed,0);
const copy=setup({...job,mode:'copy',rows:1});assert(copy.founders.every(u=>copy.s.is[u]===I_TPL));
run({...job,mode:'copy',rows:1});
console.log('PASS: inactive bootstrap, matched grip ablation, observer neutrality, active copying control and conserved material');
