#!/usr/bin/env node
const fs=require('fs'),assert=require('assert/strict');
const {Sim,F,I_HOLD}=require('../src/sim');
const {validateRun,fileHash}=require('./local_redocking_summary');
const fixture=require('./second_contact'),exposure=require('./second_contact_exposure');
const order=require('./second_contact_order');
function counts(b,p){
  const s=Sim.fromState(b.initial),bonds=Array.from(s.bond);let pos=0,heldSteps=0,bothSteps=0,firstLoss=null;
  for(let t=p.at+1;t<=p.at+5000;t++){
    const held=bonds[fixture.secondary*4+F]===p.parent[fixture.site]*4+F;
    if(held){heldSteps++;if(bonds[p.u*4+F]>=0)bothSteps++;}
    while(pos<b.events.length&&b.events[pos].t===t){const e=b.events[pos++];if(e.kind==='link'){bonds[e.u*4+e.i]=e.v*4+e.j;bonds[e.v*4+e.j]=e.u*4+e.i;}else if(e.kind==='unlink')bonds[e.u*4+e.i]=bonds[e.v*4+e.j]=-1;}
    if(held&&bonds[fixture.secondary*4+F]!==p.parent[fixture.site]*4+F&&firstLoss===null)firstLoss=t;
  }
  assert.equal(pos,b.events.length);return {heldSteps,bothSteps,firstLoss};
}
function validate(r,exposed=false,ordered=false){
  assert(!(exposed&&ordered));if(ordered)assert.equal(r.kind,'scan-order');else assert.equal(r.kind,undefined);
  const api=ordered?order:exposed?exposure:fixture;assert.equal(r.input,exposed||ordered?'experiments/out/SC_selected.json':'experiments/out/RF_selected.json');fileHash(r.input,r.inputHash);
  const ref=JSON.parse(fs.readFileSync(r.input)),p=exposed||ordered?ref.prepared:ref.prepared[0];assert.deepEqual(r.prepared,p);
  assert.deepEqual(Object.keys(r.sources).sort(),[...api.sources].sort());for(const[f,h]of Object.entries(r.sources))fileHash(f,h);
  assert(r.neutral&&r.cpuSeconds>0);assert.equal(r.executedSteps,exposed?15000:25000);assert.deepEqual(r.results.map(x=>x.arm),api.arms);
  if(!exposed&&!ordered)assert.deepEqual(r.availability,ref.prepared.map(p=>({profile:p.profile,probes:fixture.audit(p)})));
  for(const b of r.results){assert.deepEqual(b.initial,(ordered?order.start(p,b.arm):exposed?exposure.start(p,b.arm):fixture.prepare(p,b.arm)).saveState());
    validateRun({...b,mode:'seek'},{state:b.initial,parent:p.parent},p.at+5000,1000,exposed?[]:[I_HOLD]);
    for(const w of b.windows)for(const row of w.rows)row.states.forEach((st,i)=>{if(st===I_HOLD){assert.equal(b.arm,'hold');assert.equal(row.units[i],fixture.secondary);}});
    const c=counts(b,p);assert.equal(b.heldSteps,c.heldSteps);assert.equal(b.bothSteps,c.bothSteps);if(!exposed)assert.equal(b.firstLoss,c.firstLoss);
  }
  assert.deepEqual(r.results[0].final,ref.results[0].final);assert.deepEqual(r.results[0].events,ref.results[0].events);return r;
}
function summarize(r){const p=r.prepared;return r.results.map(b=>{
  const target=b.settled.filter(x=>p.target.every(u=>x.units.includes(u))),back=b.events.find(e=>e.kind==='endpoint-redock'&&e.u===p.u);
  const links=b.events.filter(e=>e.kind==='link'&&e.i===F&&e.j===F&&(e.u===fixture.secondary||e.v===fixture.secondary));
  return {arm:b.arm,heldSteps:b.heldSteps,bothSteps:b.bothSteps,secondaryLinks:links.map(e=>({t:e.t,site:p.parent.indexOf(e.u===fixture.secondary?e.v:e.u)})),
    firstReturn:back?{t:back.t,site:p.parent.indexOf(back.face>>2)}:null,target:target.map(x=>({t:x.t,seq:x.seq})),
    targetExact:target.some(x=>x.seq==='PAAAABBBBQ'),exact:b.settled.filter(x=>x.seq==='PAAAABBBBQ').length,nonExact:b.settled.filter(x=>x.seq!=='PAAAABBBBQ').length};
});}
if(require.main===module){const r=JSON.parse(fs.readFileSync(process.argv[2]));validate(r,r.input.endsWith('SC_selected.json')&&!r.kind,r.kind==='scan-order');const rows=summarize(r);for(const x of rows)console.log(JSON.stringify(x));console.log(JSON.stringify({cpuSeconds:r.cpuSeconds}));
  if(process.argv[3]){assert(process.argv[3].endsWith('.csv'));const keys=['arm','heldSteps','bothSteps','targetExact','exact','nonExact'];fs.writeFileSync(process.argv[3],keys.join(',')+'\n'+rows.map(x=>keys.map(k=>x[k]).join(',')).join('\n')+'\n');}}
module.exports={validate,summarize,counts};
