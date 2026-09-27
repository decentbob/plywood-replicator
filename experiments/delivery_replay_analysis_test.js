#!/usr/bin/env node
const fs=require('fs'),assert=require('assert/strict');
const {rate,summarize,decide}=require('./delivery_replay_summary.js');
const {criteria}=require('./delivery_replay.js');
assert.equal(rate(0,0).value,null);
const fixtures=JSON.parse(fs.readFileSync('experiments/out/DD_fixtures_20260927.json')).result.fixtures;
// Synthetic timing/site exposure below exercises analysis boundaries, not simulation evidence.
function example(name){
  const r=structuredClone(fixtures.find(f=>f.name===name));
  Object.assign(r,{seed:105,arm:'on',steps:10000,agreement:{fullFinalState:true},members:[]});
  r.observer.samples=Array.from({length:10000},(_,i)=>({t:i+1,producer:0,recipient:2,unknown:0,
    freeProducer:0,freeRecipient:2,freeUnknown:0,mature:2}));return r;
}
const a=example('supported'),s=summarize(a,0,10000),c=s.categories.recipient;
assert.equal(s.coverage.value,1);assert.equal(c.bindings,1);assert.equal(c.attempts,1);
assert.equal(c.endedBindings,0);assert.equal(c.openBindings,1);assert.equal(c.usedOpenBindings,1);
assert.equal(c.rates.use.value,null);assert.equal(c.output.supportedExact,1);
assert.equal(c.usedOpenWithSameRow,1);assert.equal(c.usedOpenAfterIdentityLossOrChange,0);
const retiredUse=structuredClone(a),h=retiredUse.observer.events.find(e=>e.supports?.length).supports[0];
h.row=null;h.category='unknown';
const ru=summarize(retiredUse,0,10000);
assert.equal(ru.categories.recipient.usedOpenBindings,1);assert.equal(ru.categories.recipient.usedOpenWithSameRow,0);
assert.equal(ru.categories.recipient.usedOpenAfterIdentityLossOrChange,1);
assert.equal(ru.categories.unknown.supportedLinks,1);assert.equal(ru.output.supportedExact,0);
assert.deepEqual(c.fixedFollowup,{eligibleSupportLinks:1,linksWithOutputWithin5k:1,exactOutputsWithin5k:1,lateSupportLinks:0});
const close=structuredClone(a);close.observer.events[2].end=close.observer.events.length;
close.observer.events.push({id:close.observer.events.length,t:10000,kind:'bond-',u:0,i:2,v:4,j:0});
assert.equal(summarize(close,0,10000).categories.recipient.rates.use.value,1);
const boundary=structuredClone(a);boundary.observer.events.find(e=>e.kind==='row'&&e.row===1).t=5003;
assert.equal(summarize(boundary,0,10000).categories.recipient.fixedFollowup.exactOutputsWithin5k,0);
boundary.observer.events.find(e=>e.kind==='row'&&e.row===1).t=5002;
assert.equal(summarize(boundary,0,10000).categories.recipient.fixedFollowup.exactOutputsWithin5k,1);
const late=structuredClone(a);late.observer.events.forEach(e=>{if(e.t)e.t+=5000;});
assert.equal(summarize(late,0,10000).categories.recipient.fixedFollowup.lateSupportLinks,1);
assert.equal(summarize(late,0,10000).categories.recipient.fixedFollowup.eligibleSupportLinks,0);
const old=structuredClone(a);assert.equal(summarize(old,1,10000).categories.recipient.bindings,0);
assert.equal(summarize(old,1,10000).categories.recipient.bindingsStartedBeforeWindow,1);
for(const name of ['bare','retired','severed','stale'])assert.equal(summarize(example(name),0,10000).output.supportedExact,0,name);
const noBind=summarize(example('noBind'),0,10000).categories.recipient;
assert.equal(noBind.geometric,1);assert.equal(noBind.bindings,0);assert.equal(noBind.probabilities[0],1);
const missing=example('supported');missing.agreement.fullFinalState=false;assert.throws(()=>summarize(missing,0,10000));
function matrix(){return criteria.seeds.flatMap(seed=>criteria.arms.map(arm=>({seed,arm,coverage:rate(80,100),
  categories:{recipient:{rates:Object.fromEntries(['availability','encounter','binding','use']
    .map(k=>[k,rate([105,107].includes(seed)?15:5,20)]))}}})));}
const rows=matrix();assert.equal(decide(rows).signatures.length,4);
assert.throws(()=>decide(rows.slice(1)));assert.throws(()=>decide([...rows.slice(1),rows[1]]));
const low=structuredClone(rows);low[0].coverage=rate(79,100);assert.equal(decide(low).signatures.length,0);
const sparse=structuredClone(rows);sparse[0].categories.recipient.rates.binding=rate(15,19);
assert.equal(decide(sparse).stages.binding.signature,false);
const equal=structuredClone(rows);equal.find(r=>r.seed===108&&r.arm==='on').categories.recipient.rates.encounter=rate(15,20);
assert.equal(decide(equal).stages.encounter.signature,false);
const zero=structuredClone(rows);zero[0].categories.recipient.rates.use=rate(0,0);assert(!decide(zero).stages.use.signature);
console.log('PASS: stage/category attribution, bare/retired/severed/stale controls, zero denominators, open episodes, 5k/window boundaries, coverage and strict world-order gates.');
