#!/usr/bin/env node
const assert=require('assert/strict');
const {setup,run}=require('./curved_collective.js');
const single=require('./curved_fuel.js');
const job={seed:71,profile:'opposed20',rows:1,steps:1000,iters:4};
const a=setup(job),b=single.setup({...job,sequence:'AAAABBBB',size:1.2,grip:true,bodyJostle:true});
a.s.run(1000);b.s.run(1000);assert.deepEqual(a.s.saveState(),b.s.saveState(),'Single-row reference drift');
for(const rows of [2,4]){const curved=setup({...job,rows}),square=setup({...job,rows,profile:'square'});
  for(const k of ['type','is','px','py','pa'])assert.deepEqual(curved.s[k],square.s[k]);
  const r=run({...job,rows});assert.equal(r.armed,r.byRow.reduce((n,r)=>n+r.armed,0));assert(r.cross<=r.armed);}
console.log('PASS: single-row reference trajectory, matched materials/positions, conserved collective assay, event/row accounting');
