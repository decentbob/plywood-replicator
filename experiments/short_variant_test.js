#!/usr/bin/env node
const assert = require('assert/strict');
const {census, decision, family, verify} = require('./short_variant_summary.js');

function fixture() {
  const rows = [], events = [];
  for (let id = 0; id < 3; id++) {
    const born = (id+1)*10, units = [id*3,id*3+1,id*3+2];
    const provenance = units.map((u,i) => ({t:born,unit:id ? rows[id-1].units.at(-1-i) : 99,row:id ? id-1 : null}));
    units.forEach((u,i) => events.push({kind:'release',u,...provenance[i]}));
    units.forEach(u => events.push({kind:'rearm',t:born,u,fuel:100}));
    rows.push({id,born,units,seq:id === 1 ? 'BBB' : 'AAA',provenance,parent:id ? id-1 : null,
      exact:id > 0,detached:true,fullAt:born,lost:null,depth:null});
    events.push({kind:'row',t:born,id,units});
  }
  return {seed:203,sequence:'AAAABBBB',profile:'square',grip:true,steps:100000,
    rows,events,samples:[{material:{offspring:9}}]};
}
const baseline = census(fixture());
assert.equal(baseline.totals.primary, 2);
assert.deepEqual(baseline.chains.map(c => c.rows), [[0,1,2]]);
assert.equal(family('BBA'), 'BAA');
assert.notEqual(family('ABAB'), family('AABB'));

// Identical strings with no mapped parent are recurrence, not heredity.
{
  const r = fixture();
  for (const e of r.events) if (e.kind === 'release') {e.unit=99; e.row=null;}
  for (const p of r.rows) {p.parent=null;p.exact=false;p.provenance=p.units.map(() => ({t:p.born,unit:99,row:null}));}
  assert.equal(census(r).totals.primary, 0);
}
// Mixed physical parents cannot acquire a string-only exact identity.
{
  const r = fixture(), e = r.events.find(e => e.kind === 'release' && e.u === 3);
  e.row=null; e.unit=99; r.rows[1].provenance[0]={t:20,unit:99,row:null};
  r.rows[1].parent=null;r.rows[1].exact=false;
  assert.equal(census(r).totals.chains, 0);
}
// Same-step order: fuel arriving after child registration does not fuel that edge.
{
  const r = fixture(), i = r.events.findIndex(e => e.kind === 'rearm' && e.u === 0);
  const [e] = r.events.splice(i,1);e.t=20;
  r.events.splice(r.events.findIndex(e => e.kind === 'row' && e.id === 1)+1,0,e);
  r.rows[0].fullAt=20;
  assert.equal(census(r).totals.primary, 1);assert.equal(census(r).totals.chains, 0);
}
// Fuel before a release must not count as rearming after it.
{
  const r=fixture(), i=r.events.findIndex(e => e.kind === 'rearm' && e.u === 0);
  const [e]=r.events.splice(i,1);r.events.unshift(e);
  assert.equal(census(r).totals.chains,0);
}
// A retired parent at the same numeric step cannot be revived by its member IDs.
{
  const r=fixture(), i=r.events.findIndex(e => e.kind === 'row' && e.id === 1);
  r.events.splice(i,0,{kind:'retire',t:20,id:0});r.rows[0].lost=20;
  r.rows[1].parent=null;r.rows[1].exact=false;
  assert.equal(census(r).totals.chains,0);
}
// Losing a parent after the valid birth does not retroactively erase a witness.
{
  const r=fixture(), i=r.events.findIndex(e => e.kind === 'row' && e.id === 1);
  r.events.splice(i+1,0,{kind:'retire',t:20,id:0});r.rows[0].lost=20;
  assert.equal(census(r).totals.chains,1);
}
{
  const r=fixture();r.rows[1].detached=false;r.rows[1].exact=false;
  assert.equal(census(r).totals.primary,0);
}
{
  const r=fixture();r.rows[0].fullAt=null;
  assert.equal(census(r).totals.primary,1);
}
{
  const r=fixture();r.rows[1].provenance[0].unit=50;
  assert.throws(() => census(r));
}
{
  const r=fixture();r.rows[1].parent=null;
  assert.throws(() => census(r), /Reconstructed parent/);
}
{
  const r=fixture();r.events.push({...r.events.at(-1)});
  assert.throws(() => census(r), /Duplicate/);
}
// Both worlds and matched off controls are required; other arms cannot substitute.
{
  const worlds=[];
  for(const seed of [203,204]) for(const sequence of ['AAAABBBB','ABABABAB'])
    for(const profile of ['square','opposed20']) for(const grip of [true,false])
      worlds.push({seed,sequence,profile,grip,families:grip ? [{family:'AAA',primary:2,chains:1}] : []});
  assert.equal(decision(worlds).candidates.length,4);
  for(const w of worlds) if(w.seed === 204 && w.grip) w.families[0].chains=0;
  assert.equal(decision(worlds).pass,false);
  for(const w of worlds) {if(w.grip) w.families[0].chains=1;else w.families=[{family:'AAA',primary:2,chains:0}];}
  assert.equal(decision(worlds).pass,false);
}
if(process.argv[2]) verify(process.argv[2]);
console.log('Short-variant lineage, fuel, event-order and decision tests pass.');
