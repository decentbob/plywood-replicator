#!/usr/bin/env node
const assert=require('assert/strict');
const {setup}=require('./curved_fuel_reproduction.js');
const {observe}=require('./offspring_recovery.js');
const {F,R,L}=require('../src/sim.js');
const job={seed:71,profile:'square',mode:'copy',rows:1,grip:true,iters:4};
const a=setup(job),b=setup(job),o=observe(a.s,a.founders);
for(let t=0;t<10000;t+=100){a.s.run(100);o.sample();b.s.run(100);}
o.snapshot();assert(a.s.births.length>0);assert.equal(o.rows.length,1+a.s.births.length);
assert.deepEqual(a.s.saveState(),b.s.saveState(),'Observer changes simulation or RNG');
assert.equal(o.rows[0].children.length,a.s.births.length);assert(o.rows.slice(1).every(r=>r.fullAt===null));
const c=setup({...job,mode:'bootstrap',rows:4}),v=observe(c.s,c.founders),ids=Array.from({length:120},(_,i)=>i).filter(u=>!c.founders.includes(u));
assert.deepEqual(v.snapshot().material,{founders:32,offspring:0,free:88,dockedSingle:0,unloggedLinked:0,other:0});
c.s._link(ids[0],F,c.founders[0],F);assert.equal(v.snapshot().material.dockedSingle,1);
c.s._link(ids[0],R,ids[1],L);const w=v.snapshot();assert.equal(w.material.unloggedLinked,2);assert.equal(w.material.free,86);assert.equal(w.unlogged[0].attached,1);
console.log('PASS: complete observer neutrality, birth membership and parent attribution, inactive offspring, exhaustive material partition');
