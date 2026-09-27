#!/usr/bin/env node
const assert=require('assert/strict');
const {primaryFuel}=require('./short_variant_garden_report.js');
const r={metrics:{primary:1},rows:[{id:0,units:[0,1],seq:'AB',born:2,depth:1}],events:[
  {kind:'release',u:0,t:1},{kind:'release',u:1,t:1},
  {kind:'rearm',u:0,t:1,fuel:9,holders:[{unit:0},{unit:1}]},
  {kind:'row',id:0,t:2},
  {kind:'rearm',u:1,t:2,fuel:8,holders:[{unit:1},{unit:2}]},
  {kind:'row',id:1,t:3}
]};
const variants={edges:[{parent:0,child:1}]},[p]=primaryFuel(r,variants);
assert(p.witnesses[0].beforeRegistration);assert(!p.witnesses[1].beforeRegistration);
assert.deepEqual(p.witnesses.map(w=>w.outsideParentMembers),[[],[2]]);
assert.deepEqual(p.witnesses.map(w=>w.wait),[0,1]);
const late=structuredClone(r);[late.events[4],late.events[5]]=[late.events[5],late.events[4]];
assert.throws(()=>primaryFuel(late,variants),'Fuel after child cannot support the parent');
const old=structuredClone(r);old.events.unshift(old.events.splice(2,1)[0]);
assert.throws(()=>primaryFuel(old,variants),'Fuel before release cannot support the parent');
console.log('PASS: primary-parent fuel membership, pre-registration arming and temporal exclusions');
