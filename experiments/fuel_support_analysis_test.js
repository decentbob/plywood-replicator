#!/usr/bin/env node
// Independent queries over raw lifetimes and the saved support records; no Sim steps.
const fs=require('fs'),assert=require('assert/strict');
const {load}=require('./short_variant_garden_summary.js');
const {census}=require('./short_variant_summary.js');
const sort=xs=>xs.sort((a,b)=>a-b);
function checkWorld(w,r){
  assert.deepEqual([w.seed,w.sequence,w.profile,w.grip],[r.seed,r.sequence,r.profile,r.grip]);
  const lives=r.rows.map(p=>({born:r.events.findIndex(e=>e.kind==='row'&&e.id===p.id),
    lost:r.events.findIndex(e=>e.kind==='retire'&&e.id===p.id)}));
  const alive=(id,index)=>lives[id].born<index&&(lives[id].lost<0||lives[id].lost>index);
  assert.deepEqual(w.life,lives.map(l=>({born:l.born,lost:l.lost<0?null:l.lost})));
  const owner=(u,index)=>r.rows.find(p=>p.units.includes(u)&&alive(p.id,index))?.id;
  const coverage={fuelEvents:0,actorUntracked:0,actorNeverRegistered:0,unknownHelpers:0,
    sameRowOnly:0,included:0,partlyKnownCross:0},receipts=[];
  r.events.forEach((e,index)=>{
    if(e.kind==='release')assert.equal(owner(e.u,index),undefined,'Unlogged readiness change within a live row');
    if(e.kind!=='rearm')return;
    coverage.fuelEvents++;
    const actor=owner(e.u,index),owners=e.holders.map(h=>owner(h.unit,index));
    const helpers=sort([...new Set(owners.filter(id=>id!==undefined&&id!==actor))]);
    if(actor===undefined){coverage.actorUntracked++;
      if(!r.rows.some(p=>p.units.includes(e.u)&&lives[p.id].born<index))coverage.actorNeverRegistered++;
    }else if(owners.includes(undefined)){
      coverage.unknownHelpers++;if(helpers.length)coverage.partlyKnownCross++;
    }else if(!helpers.length)coverage.sameRowOnly++;
    else{coverage.included++;receipts.push({event:index,t:e.t,actor,unit:e.u,fuel:e.fuel,helpers});}
  });
  assert.deepEqual(w.coverage,coverage);
  assert.deepEqual(w.receipts.map(({event,t,actor,unit,fuel,helpers})=>({event,t,actor,unit,fuel,helpers})),receipts);
  const renewal=census(r).edges;assert.deepEqual(w.renewalEdges,renewal);
  for(const e of renewal)assert(alive(e.parent,lives[e.child].born),'Renewal after parent retirement');
  const pairIds=[...new Set(receipts.flatMap(e=>e.helpers.map(h=>sort([h,e.actor]).join('/'))))].sort();
  assert.deepEqual(w.observed.pairs.map(p=>`${p.a}/${p.b}`).sort(),pairIds);
  for(const p of w.observed.pairs){
    const dirs=[[p.a,p.b],[p.b,p.a]].map(([helper,actor])=>w.receipts.filter(e=>e.actor===actor&&e.helpers.includes(helper)));
    const episodes=dirs.map(es=>[...new Set(es.map(e=>e.episode))].sort());
    assert.deepEqual(p.directions,dirs.map((es,i)=>({events:es.length,episodes:episodes[i],
      first:es.length?Math.min(...es.map(e=>e.event)):null,last:es.length?Math.max(...es.map(e=>e.event)):null})));
    const received=[dirs[1],dirs[0]].map(es=>es.length?Math.min(...es.map(e=>e.event)):Infinity);
    const renew=[p.a,p.b].map((id,i)=>renewal.some(e=>e.parent===id&&lives[e.child].born>received[i]));
    assert.deepEqual(p.renewal,renew);
    assert.equal(p.reciprocal,dirs.every(es=>es.length));
    assert.equal(p.repeated,episodes.some(es=>es.length>=2));
    assert.equal(p.repeatedReciprocal,episodes.every(es=>es.length>=2));
    assert.equal(p.primary,p.repeatedReciprocal&&r.rows[p.a].born>0&&r.rows[p.b].born>0&&renew.every(Boolean));
    assert.equal(p.horizonCensored,r.rows[p.a].lost===null&&r.rows[p.b].lost===null);
    const times=dirs.flat().map(e=>e.t);assert.equal(p.first,Math.min(...times));
    assert.equal(p.last,Math.max(...times));assert.equal(p.span,p.last-p.first);
  }
  const actorIds=[...new Set(receipts.map(e=>e.actor))];let switches=0,successions=0;
  for(const actor of actorIds){
    const es=receipts.filter(e=>e.actor===actor);successions+=es.length-1;
    switches+=es.slice(1).filter((e,i)=>e.helpers.join('/')!==es[i].helpers.join('/')).length;
    assert.deepEqual(w.observed.actors.find(a=>a.actor===actor),
      {actor,events:es.length,partners:sort([...new Set(es.flatMap(e=>e.helpers))])});
  }
  const counts={events:receipts.length,edges:receipts.reduce((n,e)=>n+e.helpers.length,0),pairs:pairIds.length,
    repeated:w.observed.pairs.filter(p=>p.repeated).length,reciprocal:w.observed.pairs.filter(p=>p.reciprocal).length,
    repeatedReciprocal:w.observed.pairs.filter(p=>p.repeatedReciprocal).length,
    primary:w.observed.pairs.filter(p=>p.primary).length,actors:actorIds.length,switches,successions};
  assert.deepEqual(w.observed.counts,counts);
  assert.equal(w.reference.pools.length,receipts.length);
  for(const [i,e]of w.receipts.entries()){
    const lo=Math.min(9,Math.floor(e.t/10000))*10000,hi=lo===90000?100000:lo+9999;
    const candidates=w.opportunities.filter(o=>o.actor===e.actor&&o.unit===e.unit&&o.helpers.length===e.helpers.length&&
      o.startIndex<=e.event&&o.helpers.every(h=>alive(h,e.event)))
      .map(o=>({id:o.id,weight:Math.min(o.end,e.t,hi)-Math.max(o.start,lo)+1})).filter(c=>c.weight>0);
    assert.deepEqual(w.reference.pools[i],{receipt:i,
      helperSets:new Set(candidates.map(c=>w.opportunities[c.id].helpers.join('/'))).size,candidates});
    assert(candidates.some(c=>c.id===e.opportunity));
  }
  assert.equal(w.reference.draws.length,199);assert.equal(w.reference.counts.length,199);
  w.reference.draws.forEach(draw=>{
    assert.equal(draw.length,receipts.length);
    draw.forEach((id,i)=>assert(w.reference.pools[i].candidates.some(c=>c.id===id)));
  });
  for(const metric of ['repeated','reciprocal','repeatedReciprocal','primary']){
    const xs=sort(w.reference.counts.map(c=>c[metric]));
    assert.deepEqual(w.reference.stats[metric],{median:xs[99],q95:xs[189],upperFraction:xs.filter(n=>n>=counts[metric]).length/199});
  }
  const alternatives=w.reference.pools.filter(p=>p.helperSets>1).length;
  assert.equal(w.reference.alternativeEvents,alternatives);
  assert.equal(w.reference.alternativeFraction,receipts.length?alternatives/receipts.length:0);
  assert.equal(w.pass,counts.primary>=1&&counts.primary>w.reference.stats.primary.q95&&w.reference.alternativeFraction>=.2);
}
if(require.main===module){
  const saved=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
  const {rs}=load('experiments/out/SVG_screen_20260927');
  assert.equal(saved.result.worlds.length,16);
  saved.result.worlds.forEach((w,i)=>checkWorld(w,rs[i]));
  const i=saved.result.worlds.findIndex(w=>w.observed.counts.primary),w=saved.result.worlds[i];
  const mutations=[x=>x.coverage.included++,x=>x.life[x.receipts[0].actor].born++,
    x=>x.receipts[0].helpers.push(x.receipts[0].actor),x=>x.observed.counts.primary++,
    x=>x.observed.pairs.find(p=>p.primary).renewal[0]=false,
    x=>x.reference.pools[0].candidates[0].weight++,x=>x.reference.draws[0][0]=-1,
    x=>x.reference.stats.primary.q95++,x=>x.reference.alternativeEvents++,x=>x.pass=!x.pass];
  mutations.forEach(mutate=>{const x=structuredClone(w);mutate(x);assert.throws(()=>checkWorld(x,rs[i]));});
  const candidates=[];
  for(const sequence of ['ABABA','AABAB'])for(const profile of ['square','opposed20'])
    if([303,304].every(seed=>saved.result.worlds.some(w=>w.seed===seed&&w.sequence===sequence&&w.profile===profile&&w.grip&&w.pass)))
      candidates.push({sequence,profile});
  assert.deepEqual(saved.result.decision,{pass:candidates.length>0,candidates});
  console.log('PASS: 16 independent raw-lifetime/holder queries, pair and renewal counts, pools, draws, quantiles and gate; 10 corruptions rejected.');
}
module.exports={checkWorld};
