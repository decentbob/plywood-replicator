#!/usr/bin/env node
const assert=require('assert/strict');
const {Sim,isProd,LETTERS,I_TPL,I_DOCK,F,K,S}=require('../src/sim.js');
const {base,arms,kind,sample,observe,physicalHash}=require('./recipient_dependence.js');
const worlds=Object.fromEntries(Object.entries(arms).map(([a,p])=>[a,new Sim({...base,...p,seed:101})]));
assert.equal(new Set(Object.values(worlds).map(physicalHash)).size,1,'matched initial material and geometry');
assert.equal(kind('BAAAAB'),'producer');assert.equal(kind('BCDDCB'),'recipient');assert.equal(kind('A'),'unknown');
for(const [arm,s] of Object.entries(worlds)){
  const u=Array.from(s.type).findIndex((t,u)=>t===0&&s.is[u]===I_TPL),v=Array.from(s.type).findIndex(isProd);
  assert.equal(s.is[v],I_DOCK);
  assert.equal(s.compat(u,K,v,F),['on','noBind'].includes(arm)?1:0,'production toggle');
  s.is[v]=I_TPL;s._deriveAll();
  assert.equal(s.ss[v*4+F],S.PBIND);
  assert.equal(s.compat(u,K,v,F),['on','noSource'].includes(arm)?s.p.pBindP:0,'mature binding retained independently');
}
// Exercise observation on real dynamics; saved state includes every public physical array and RNG.
const a=new Sim({...base,seed:101}),b=new Sim({...base,seed:101}),o=observe(a);
for(let t=0;t<2000;t+=100){a.run(100);sample(a);o.update();b.run(100);}
assert.deepEqual(a.saveState(),b.saveState(),'observation must not change any saved state');
assert.deepEqual(a.births,b.births);assert.equal(o.members.length,a.birthCount);
const c=Sim.fromState(JSON.parse(JSON.stringify(a.saveState())));
a.run(200);c.run(200);assert.deepEqual(a.saveState(),c.saveState(),'exact restart');
assert.deepEqual(a.check(),[]);
const off=new Sim({...base,...arms.noSource,seed:102});off.run(2000);
assert.equal(off.prodCount,0);assert(off.trs.every(x=>x===0));
assert(Array.from(off.type).every((t,u)=>!isProd(t)||off.is[u]===I_DOCK));
assert.equal(sample(off).material.products.free,300);
// The existing start mark advances and withdraws one bond per derive pass.
const relay=new Sim({...base,seedSeq:'AAAABAAAA',seedCount:1,transStart:'B'});
const middle=Array.from(relay.type).findIndex((t,u)=>t===1&&relay.is[u]===I_TPL);
const chain=relay.strandOf(middle);assert.equal(chain.length,9);
relay.trs.fill(0);relay.trs0.fill(0);
for(let pass=1;pass<=5;pass++){
  relay._deriveAll();
  chain.forEach((u,i)=>assert.equal(relay.trs[u*4+F],Math.abs(i-4)<pass?1:0,'one-hop propagation'));
}
relay.is[middle]=I_DOCK;
for(let pass=1;pass<=5;pass++){
  relay._deriveAll();
  chain.forEach((u,i)=>assert.equal(relay.trs[u*4+F],Math.abs(i-4)>=pass?1:0,'one-hop withdrawal'));
}
// Mature occupancy excludes a product monomer still docked for construction.
const d=new Sim({...base,seed:103});
const u=Array.from(d.type).findIndex((t,u)=>LETTERS.includes(t)&&t!==0&&d.is[u]===I_TPL&&
  kind(d.strandOf(u).map(v=>d._letter(v)).join(''))==='recipient');
const v=Array.from(d.type).findIndex(isProd);d.bond[u*4+K]=v*4+F;d.bond[v*4+F]=u*4+K;
assert.equal(sample(d).recipientBound,0);d.is[v]=I_TPL;assert.equal(sample(d).recipientBound,1);
console.log('recipient dependence: controls, observer neutrality, restart and occupancy passed');
