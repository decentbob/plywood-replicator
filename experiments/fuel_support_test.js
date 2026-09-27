#!/usr/bin/env node
const assert=require('assert/strict');
const {Sim,K,I_REPEL,I_TPL}=require('../src/sim.js');
const {reconstruct,poolsFor,graph,references,decision}=require('./fuel_support.js');
function fixture(){
  const s=new Sim({W:20,H:20,nA:4,nB:0,nE:0,nU:1,seedCount:0});
  const rows=[0,1,2].map(id=>({id,units:[id],born:1,seq:'A',lost:null}));
  const events=[
    ...rows.map((p,id)=>({kind:'row',id,units:p.units,states:[id?I_TPL:I_REPEL],t:1})),
    {kind:'bond+',u:4,side:0,v:0,vs:K,t:10},
    {kind:'bond+',u:4,side:1,v:1,vs:K,t:10},
    {kind:'bond-',u:4,side:1,q:1*4+K,t:20},
    {kind:'bond+',u:4,side:1,v:2,vs:K,t:30},
    {kind:'rearm',u:0,fuel:4,actorState:I_TPL,t:40,holders:[{unit:0},{unit:2}]}
  ];
  return {rows,events,steps:50,initialState:s.saveState(),finalState:{nums:{fuelUsed:1}}};
}
const r=fixture(),d=reconstruct(r),p=poolsFor(d);
assert.equal(d.coverage.included,1);assert.equal(d.opportunities.length,2);
assert.deepEqual(d.receipts[0].helpers,[2]);assert.equal(p[0].helperSets,2);
assert.deepEqual(p[0].candidates.map(c=>c.weight),[11,11]);
// Helpers alive earlier but retired at the consuming event cannot be sampled.
for(const before of [true,false]){
  const x=fixture(),pos=x.events.length-(before?1:0);
  x.events.splice(pos,0,{kind:'retire',id:1,t:40});x.rows[1].lost=40;
  assert.equal(poolsFor(reconstruct(x))[0].helperSets,before?1:2);
}
// Unknown helper material stays unknown, even if registered immediately afterward.
{
  const x=fixture(),row=x.events.splice(2,1)[0];row.t=41;x.events.push(row);
  const a=reconstruct(x);assert.equal(a.coverage.unknownHelpers,1);assert.equal(a.coverage.included,0);
}
// Arming before actor registration must not receive that future identity.
{
  const x=fixture(),row=x.events.shift();row.t=41;x.events.push(row);
  const a=reconstruct(x);assert.equal(a.coverage.actorUntracked,1);assert.equal(a.coverage.actorNeverRegistered,1);
}
// Two helper blocks on one row contribute only one helper-row edge.
{
  const x=fixture();x.rows.pop();x.rows[1].units=[1,2];x.events.splice(2,1);
  x.events[1].units=[1,2];x.events[1].states=[I_TPL,I_TPL];
  x.events=x.events.filter(e=>e.kind!=='bond-');
  x.events.find(e=>e.kind==='bond+'&&e.v===2).side=2;
  x.events.at(-1).holders=[{unit:0},{unit:1},{unit:2}];
  const a=reconstruct(x);assert.deepEqual(a.receipts[0].helpers,[1]);assert.equal(poolsFor(a)[0].helperSets,1);
}
// A configuration wholly in the preceding fixed bin contributes no weight.
{
  const a=structuredClone(d);a.receipts[0].t=10020;
  a.opportunities[1].start=10010;a.opportunities[1].end=10020;
  assert.equal(poolsFor(a)[0].helperSets,1);
}
// Same-step encounters still have weight one.
{
  const x=fixture();x.events.forEach(e=>{if(e.t>=10)e.t=10;});
  assert.deepEqual(poolsFor(reconstruct(x))[0].candidates.map(c=>c.weight),[1,1]);
}
// Corrupt/missing physical contacts cannot manufacture an opportunity.
{
  const x=fixture();x.events.at(-1).holders.pop();assert.throws(()=>reconstruct(x));
}
const rows=[{born:1,lost:null},{born:2,lost:null},{born:20,lost:null},{born:21,lost:null}],
  life=[{born:1,lost:null},{born:2,lost:null},{born:90,lost:null},{born:91,lost:null}],
  edges=[{parent:0,child:2},{parent:1,child:3}],
  receipts=[0,1,2,3].map(i=>({event:10+i*10,t:10+i*10,actor:i<2?0:1,helpers:[i<2?1:0],episode:`f:${i}`}));
assert.equal(graph(receipts,rows,life,edges).counts.primary,1);
assert.equal(graph(receipts.map(e=>({...e,episode:'same'})),rows,life,edges).counts.primary,0);
assert.equal(graph(receipts,[{...rows[0],born:0},...rows.slice(1)],life,edges).counts.primary,0);
const early=structuredClone(life);early[2].born=5;
assert.equal(graph(receipts,rows,early,edges).counts.primary,0);
const ref=references(d,r.rows,[],12345);assert.deepEqual(ref,references(d,r.rows,[],12345));
assert.equal(new Set(ref.draws.flat()).size,2);assert.equal(ref.alternativeFraction,1);
const degenerate=structuredClone(d);degenerate.life[1].lost=6;
const nullRef=references(degenerate,r.rows,[],12345);assert.equal(nullRef.alternativeFraction,0);
assert.equal(new Set(nullRef.draws.flat()).size,1);
const worlds=[];
for(const seed of [303,304])for(const sequence of ['ABABA','AABAB'])for(const profile of ['square','opposed20'])
  worlds.push({seed,sequence,profile,grip:true,pass:sequence==='ABABA'&&profile==='square'});
assert.deepEqual(decision(worlds).candidates,[{sequence:'ABABA',profile:'square'}]);
worlds.find(w=>w.seed===304&&w.pass).pass=false;assert(!decision(worlds).pass);
console.log('PASS: ordered identities, contact episodes, readiness, unknowns, bins, helper deduplication, reciprocal renewal and null reproducibility');
