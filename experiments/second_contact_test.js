#!/usr/bin/env node
const fs=require('fs'),assert=require('assert/strict');
const {F,I_REPEL,I_HOLD}=require('../src/sim');
const a=require('./second_contact'),e=require('./second_contact_exposure'),{validate,summarize}=require('./second_contact_summary');
const r=validate(JSON.parse(fs.readFileSync(process.argv[2]||'experiments/out/SC_selected.json'))),p=r.prepared;
const x=validate(JSON.parse(fs.readFileSync(process.argv[3]||'experiments/out/SC_exposure.json')),true);
const order=require('./second_contact_order'),z=validate(JSON.parse(fs.readFileSync(process.argv[4]||'experiments/out/SC_scan_order.json')),false,true);
const aligned=a.prepare(p,'placement').saveState();
for(const arm of a.arms){const s=a.prepare(p,arm),before=s.saveState(),plain=a.prepare(p,arm);a.watch(s);s.run(300);plain.run(300);assert.deepEqual(s.saveState(),plain.saveState());
  assert.deepEqual(before.rng,p.state.rng);assert.deepEqual(before.p,p.state.p);assert.deepEqual(before.arrays.type,p.state.arrays.type);
  if(arm!=='off')for(const k of ['px','py','pa','ox','oy'])assert.deepEqual(before.arrays[k],aligned.arrays[k]);
}
const before=e.start(p,'off').saveState(),after=e.start(p,'expose').saveState();
for(const k of Object.keys(before.arrays))if(!['is','ss','ss0','open'].includes(k))assert.deepEqual(after.arrays[k],before.arrays[k],k);
assert.deepEqual(after.rng,before.rng);assert.deepEqual(after.p,before.p);
const rs=summarize(r);assert.deepEqual(rs.map(x=>x.targetExact),[false,false,true,true]);assert.deepEqual(rs.map(x=>[x.heldSteps,x.bothSteps]),[[0,0],[0,0],[1,0],[14,13]]);
assert.deepEqual(rs.map(x=>x.firstReturn.site),[4,4,3,3]);
const xs=summarize(x);assert(!xs[1].targetExact);assert.equal(xs[1].heldSteps,0);assert.deepEqual(xs[1].secondaryLinks,[{t:5329,site:3}]);
assert.deepEqual(summarize(z).map(x=>x.targetExact),[false,false,true,true]);
assert.deepEqual(order.pairOrder(a.prepare(p,'off'),a.secondary,p.parent[a.site]),[p.parent[a.site],a.secondary]);
const alignedScan=order.start(p,'placement').saveState();
for(const arm of order.arms){const s=order.start(p,arm),plain=order.start(p,arm);if(arm!=='off')for(const k of ['px','py','pa','ox','oy'])assert.deepEqual(s.saveState().arrays[k],alignedScan.arrays[k]);a.watch(s);s.run(300);plain.run(300);assert.deepEqual(s.saveState(),plain.saveState());}
const row=r.results[3].windows.at(-1).rows.find(row=>p.target.every(u=>row.units.includes(u)));
assert(row.states.includes(I_HOLD)&&row.states.every(st=>[I_REPEL,I_HOLD].includes(st))&&row.faces.every(q=>q<0));
let rejected=0;const bad=(data,change,exposed=false)=>{const copy=structuredClone(data);change(copy);assert.throws(()=>validate(copy,exposed));rejected++;};
for(const change of [z=>z.neutral=false,z=>z.inputHash='0'.repeat(64),z=>z.sources['src/sim.js']='0'.repeat(64),z=>z.results.pop(),z=>z.prepared.target.pop(),
  z=>z.availability[1].probes[0].placed=true,z=>z.results[1].initial.rng++,z=>z.results[3].bothSteps++,z=>z.results[2].heldSteps++,z=>z.results[3].firstLoss++,
  z=>z.results[3].settled.pop(),z=>z.results[3].windows[0].rows.pop(),z=>z.results[3].windows[0].stats.free++,z=>z.results[3].events.find(e=>e.kind==='unlink').i=1])bad(r,change);
for(const change of [z=>z.results[1].initial.arrays.bond=z.results[0].final.arrays.bond,z=>z.results[1].heldSteps=1,z=>z.results[1].settled=[]])bad(x,change,true);
for(const change of [x=>x.kind='wrong',x=>x.results[1].initial=r.results[1].initial,x=>x.results[3].bothSteps++]){const copy=structuredClone(z);change(copy);assert.throws(()=>validate(copy,false,true));rejected++;}
console.log(`PASS: physically admissible contact census, aligned fixture controls, pure face exposure, observer neutrality, contact lifetimes, HOLD completion and ${rejected} corrupted datasets`);
