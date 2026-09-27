#!/usr/bin/env node
'use strict';
const assert=require('assert/strict'),{hash}=require('./placement_release');
const {load}=require('./handoff_closure'),{validate,decision}=require('./handoff_closure_summary');
const r=load(process.argv[2]),summary=validate(r);
function reject(change){const c=JSON.parse(JSON.stringify(r));change(c);assert.throws(()=>validate(c,{replay:false}));}
reject(c=>c.provenance.inputHash='bad');reject(c=>c.provenance.sources={});reject(c=>c.results.pop());
reject(c=>c.prepared.cohort[0].units.pop());reject(c=>c.results[0].initial.state.rng++);
reject(c=>c.results[0].windows[0].rows.pop());reject(c=>c.results[0].windows[0].stats.free++);
reject(c=>c.results[0].final.marks.current[0]=1);
const branch=r.results.findIndex(b=>b.events.length);assert(branch>=0);
reject(c=>c.results[branch].events[0].t=1);
const changedState=r.results.findIndex(b=>b.events.some(e=>e.kind==='state'));
if(changedState>=0)reject(c=>c.results[changedState].events.find(e=>e.kind==='state').before=999);
const withOutput=r.results.findIndex(b=>b.settled.length);
if(withOutput>=0)reject(c=>c.results[withOutput].settled[0].seq='incorrect');
// An extra record must not fabricate the physical handoff leg of the gate.
reject(c=>c.results[4].supportPhases.push({t:50000,contacts:[]}));
const base=['ordinary','seek','wait','pulse','hold'].map(arm=>({arm,usefulExact:0,cohortUseful:0,cohorts:[]}));
const hold=base.at(-1);hold.usefulExact=1;hold.cohortUseful=1;hold.cohorts=[{proofs:[{}]}];assert(decision(base).pass);
base[2].usefulExact=1;assert(!decision(base).pass,'Equal waiting output cannot pass');
base[2].usefulExact=0;hold.cohorts=[{proofs:[]}];assert(!decision(base).pass,'Output without physical handoff cannot pass');
console.log(JSON.stringify({validation:'PASS: complete observed/plain replays, checkpoints, event reconstruction, corrupt-data and gate checks',gate:summary.gate,summaryHash:hash(summary)}));
