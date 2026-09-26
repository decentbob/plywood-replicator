#!/usr/bin/env node
const assert=require('assert/strict'),{setup,observe,run}=require('./end_protection.js'),{F,I_DOCK,I_REPEL}=require('../src/sim.js');
const {inventory}=require('./end_protection_natural.js');
const job={seed:81,profile:'opposed20',mode:'attached',capFray:0,steps:2000};
const a=setup(job),b=setup(job),o=observe(a.s,a.target,a.anchor);
for(let t=0;t<2000;t+=100){a.s.run(100);o.sample();b.s.run(100);}assert.deepEqual(a.s.saveState(),b.s.saveState());
let bend=0;for(let i=1;i<a.target.length;i++){const x=a.s._side(a.target[i-1],F,[0,0,0,0]),y=a.s._side(a.target[i],F,[0,0,0,0]);
  bend+=Math.acos(Math.max(-1,Math.min(1,x[2]*y[2]+x[3]*y[3])))*180/Math.PI;}
assert(bend/(a.target.length-1)>5,'Wedge geometry is physically active');
assert.equal(a.s.is[a.target.at(-1)],I_DOCK);assert.equal(o.losses.length,0);assert.equal(o.anchorLostAt,null);
const fragile=setup({...job,capFray:1}),protectedRow=setup(job);
for(const k of ['type','is','bond','px','py','pa','ox','oy'])assert.deepEqual(fragile.s[k],protectedRow.s[k]);assert.equal(fragile.s.rng(),protectedRow.s.rng());
const detached=setup({...job,mode:'detached'});for(const k of ['type','px','py','pa','ox','oy'])assert.deepEqual(detached.s[k],protectedRow.s[k]);
const initial=protectedRow.s.saveState(),inv=inventory(protectedRow.s,new Set(protectedRow.parent));
assert.deepEqual(protectedRow.s.saveState(),initial);assert.equal(inv.rows.length,1);assert.deepEqual(inv.rows[0].eligible,[]);
assert.equal(inventory(detached.s,new Set(detached.parent)).rows[0].eligible.length,1);
assert.equal(detached.s.is[detached.anchor.u],I_REPEL);assert.equal(detached.s.bond[detached.anchor.u*4+F],-1);
detached.s.p.pFray=1;const d=observe(detached.s,detached.target,detached.anchor);detached.s.run(10);assert(d.losses.length>0,'Exposed ordinary end must recycle');
for(const mode of ['copy','full','attached','detached'])run({...job,mode});
console.log('PASS: neutral observer, matched cap susceptibility and anchor ablation, persistent stalled anchor, exposed-end recycling and conservation');
