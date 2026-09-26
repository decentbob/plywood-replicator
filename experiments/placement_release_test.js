#!/usr/bin/env node
const assert=require('assert/strict'),fs=require('fs');
const {Sim,F,L,R,I_REPEL}=require('../src/sim');
const {arms,intervene,observe}=require('./placement_release');
const {validate,summarize}=require('./placement_release_summary');
const data=JSON.parse(fs.readFileSync(process.argv[2]||'experiments/out/PR_selected.json'));
validate(data);
for(const arm of Object.keys(arms)){
  const s=Sim.fromState(data.prepared.state),before=s.saveState(),bonds=Array.from(s.bond),states=Array.from(s.is);
  intervene(s,arm);const after=s.saveState();assert.deepEqual(after.rng,before.rng);assert.deepEqual(after.p,before.p);
  // Only state, bond pointers, derived sides and receptivity may change. No
  // coordinate, velocity, shape, type, handedness, provenance or material edit.
  const derived=new Set(['bond','is','ss','ss0','open']);
  for(const k of Object.keys(before.arrays))if(!derived.has(k))assert.deepEqual(after.arrays[k],before.arrays[k],k);
  for(let u=0;u<s.n;u++){
    assert.equal(s.is[u],arms[arm].includes(u)?I_REPEL:states[u]);
    for(const side of [L,R])assert.equal(s.bond[u*4+side],bonds[u*4+side]);
  }
  const changed=[];for(let q=0;q<bonds.length;q++)if(bonds[q]!==s.bond[q])changed.push(q);
  const expected=arms[arm].flatMap(u=>[u*4+F,bonds[u*4+F]]).sort((a,b)=>a-b);
  assert.deepEqual(changed,expected);assert(changed.every(q=>s.bond[q]===-1));assert.deepEqual(s.check(),[]);
  if(arm==='keep')assert.deepEqual(after,before);
  // Observe both ordinary and intervention states; event hooks cannot consume
  // RNG or mutate physics. The archived long run performs this at 35k too.
  const plain=Sim.fromState(after),watched=Sim.fromState(after);
  observe(watched,data.prepared.parent,data.prepared.cohort);plain.run(300);watched.run(300);
  assert.deepEqual(watched.saveState(),plain.saveState());assert.deepEqual(watched.births,plain.births);
}
let rejected=0;const bad=change=>{const x=structuredClone(data);change(x);assert.throws(()=>validate(x));rejected++;};
bad(x=>x.neutral=false);bad(x=>x.executedSteps--);bad(x=>x.results.pop());bad(x=>x.results[1].arm='keep');
bad(x=>x.prepared.state.p.pUndock=0.2);bad(x=>x.prepared.cohort[0].units.pop());
bad(x=>x.sources['src/sim.js']='0'.repeat(64));bad(x=>x.restart.cacheDelta=0);bad(x=>x.restart.unobservedStateHash='0'.repeat(64));
bad(x=>x.results[1].initialStates[87]=0);bad(x=>x.results[1].initialBonds[87*4+F]=0);
bad(x=>x.results[1].links[0].u=-1);bad(x=>x.results[1].unlinks[0].i=R);
bad(x=>x.results[1].windows[0].rows.pop());bad(x=>x.results[1].windows[0].stats.free++);
bad(x=>x.results[1].births[0].seq='PAAAABBBBQ');bad(x=>x.results[1].birthMembers[0].units.pop());
bad(x=>x.results[0].placements[0].accepted=!x.results[0].placements[0].accepted);
bad(x=>x.results[0].placements.find(e=>e.blockers.length).blockers[0].group='other');
bad(x=>x.results[0].placements.find(e=>e.blockers.length).blockers[0].dx=100);
bad(x=>{const e=x.results[0].placements.find(e=>e.blockers.length);e.blockers.push(e.blockers[0]);});
const result=summarize(data);assert.deepEqual(result.map(x=>x.exact),[0,3,3,2]);
assert.deepEqual(result[0].blockerIds,{'87':43});
assert.deepEqual(result[1].cohorts.map(x=>x.exactCompletion),[[],[23606]]);
assert.deepEqual(result[2].cohorts.map(x=>x.exactCompletion),[[20258],[]]);
assert(result.slice(1).every(x=>x.partialBirths.length===arms[x.arm].length));
console.log(`PASS: isolated release edits, conservation, four-arm observer neutrality, event-time birth membership, graph/material reconstruction and ${rejected} corruption checks`);
