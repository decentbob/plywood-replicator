#!/usr/bin/env node
const assert=require('assert/strict');
const {setup,install}=require('./assembly_front'),{setup:baseSetup}=require('./patch_completion');
const {F,L,R,S}=require('../src/sim');
const job={seed:85,profile:'opposed20',arm:'off',undock:0.1,steps:20000};
const a=baseSetup(job).s,b=setup(job).s;a.run(20000);b.run(20000);
assert.deepEqual(b.saveState(),a.saveState());assert.deepEqual(b.births,a.births);
for(const arm of ['L','R']){
  const {s,parent}=setup({...job,arm}),from=arm==='L'?0:9,next=arm==='L'?1:8,far=arm==='L'?2:7;
  const receptive=u=>s.ss[u*4+F]!==S.IDLE;
  assert(receptive(parent[from]));assert(!receptive(parent[next]));assert(!receptive(parent[far]));
  const free=Array.from({length:s.n},(_,u)=>u).find(u=>!parent.includes(u));
  s._link(parent[from],F,free,F);
  s._deriveAll();assert(!receptive(parent[next]),'No same-pass neighbor reading');
  s._deriveAll();assert(receptive(parent[next]));assert(!receptive(parent[far]),'Occupancy does not relay without a contact');
  const original=s.ss[parent[from]*4+F];assert.notEqual(original,S.IDLE,'Bound face retains normal identity');
  s._unlink(parent[from],F);s._deriveAll();s._deriveAll();assert(!receptive(parent[next]),'No persistent permission after contact leaves');
  // The receiving side reads its bonded partner's previous mark directly.
  const q=s.bond[parent[next]*4+(arm==='L'?L:R)];s.front0[q]=1;s._derive(parent[next]);assert(receptive(parent[next]));
  s.front0[q]=0;s._derive(parent[next]);assert(!receptive(parent[next]));
}
assert.throws(()=>install(baseSetup(job).s,'invalid'));
console.log('PASS: off saved state/RNG/birth identity; both polarities, one-pass contact delay, no uncontacted propagation, bound identity and reset');
