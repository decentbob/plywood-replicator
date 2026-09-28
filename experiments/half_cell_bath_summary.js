#!/usr/bin/env node
'use strict';
const fs=require('fs'),assert=require('assert/strict');
const {read,write}=require('./half_cell_bath'),{hash}=require('./half_cell_rim_test');
const {T_E,T_C,F,R,L}=require('../src/sim');
const key=(a,b)=>a<b?a+':'+b:b+':'+a;
function decode(st,name){const b=Buffer.from(st.arrays[name].b,'base64');return Array.from({length:b.length/4},(_,i)=>b.readInt32LE(i*4));}
function edges(table){return table.flatMap((b,a)=>b>a?[key(a,b)]:[]).sort();}
function railPieces(r){
  const bond=decode(r.final,'bond'),types=[...Buffer.from(r.final.arrays.type.b,'base64')],states=[...Buffer.from(r.final.arrays.is.b,'base64')],seen=new Set(),pieces=[];
  for(let u=0;u<types.length;u++)if(![T_E,T_C].includes(types[u])&&!seen.has(u)){
    const units=[],todo=[u];while(todo.length){const v=todo.pop();if(seen.has(v))continue;seen.add(v);units.push(v);
      for(const i of [R,L])if(bond[v*4+i]>=0)todo.push(bond[v*4+i]>>2);}
    units.sort((a,b)=>a-b);pieces.push({units,types:units.map(v=>types[v]),states:units.map(v=>states[v]),
      founder:units.length===r.founder.length&&units.every(v=>r.founder.includes(v)),unpaired:units.every(v=>bond[v*4+F]<0)});
  }
  return pieces;
}
function audit(r){
  assert(r.complete&&!r.censored);assert.equal(r.job.horizon,50000);assert.equal(r.final.nums.t,50000);
  const ordinary=decode(r.initial,'bond'),rim=decode(r.initial,'rimBond'),types=[...Buffer.from(r.initial.arrays.type.b,'base64')];
  const counts={rim:0,copyAdded:0,copyRemoved:0,railAdded:0,railRemoved:0,fuelAdded:0,fuelRemoved:0};let ei=0,lastT=0;
  for(const sample of r.samples){
    while(ei<r.monitor.events.length&&r.monitor.events[ei].t<=sample.t){
      const e=r.monitor.events[ei++];assert(Number.isInteger(e.t)&&e.t>=lastT&&e.t<=50000);lastT=e.t;
      assert([e.a,e.b].every(a=>Number.isInteger(a)&&a>=0&&a<112));assert.notEqual(e.a>>2,e.b>>2);
      assert(['add','remove','rim'].includes(e.op));const table=e.op==='rim'?rim:ordinary;
      if(e.op==='remove'){assert.equal(table[e.a],e.b);assert.equal(table[e.b],e.a);table[e.a]=table[e.b]=-1;}
      else{assert.equal(table[e.a],-1);assert.equal(table[e.b],-1);table[e.a]=e.b;table[e.b]=e.a;}
      for(const a of [e.a,e.b])assert(!(ordinary[a]>=0&&rim[a]>=0),'shared ordinary/rim port');
      if(e.op==='rim')counts.rim++;
      else{
        const kind=[types[e.a>>2],types[e.b>>2]].includes(T_E)?'fuel':(e.a&3)===F&&(e.b&3)===F?'copy':'rail';
        counts[kind+(e.op==='add'?'Added':'Removed')]++;
      }
    }
    assert.deepEqual(edges(ordinary),sample.frame.bonds.map(([a,b])=>key(a,b)).sort());
    assert.deepEqual(edges(rim),sample.frame.rimBonds.map(([a,b])=>key(a,b)).sort());
  }
  assert.equal(ei,r.monitor.events.length);assert.deepEqual(ordinary,decode(r.final,'bond'));assert.deepEqual(rim,decode(r.final,'rimBond'));
  assert.equal(r.outcome.events,ei);assert.equal(r.monitor.counts.phaseEligible,r.monitor.eligible.length);
  assert.equal(counts.rim,r.final.nums.rimEvents);assert(counts.rim<=r.monitor.counts.actualRimEligible);
  assert(r.monitor.counts.actualRimEligible<=r.monitor.counts.actualRimTests);
  if(!r.job.on){assert.equal(counts.rim,0);assert.equal(r.monitor.counts.actualRimTests,0);}
  for(const e of r.monitor.eligible)assert(Number.isInteger(e.t)&&e.t>=1&&e.t<=50000&&e.a!==e.b);
  const charged=r.samples.map(q=>q.census.base.charged),final=r.outcome.final;
  return {...r.job,...counts,...r.monitor.counts,
    distinctEligiblePairs:new Set(r.monitor.eligible.map(e=>key(e.a,e.b))).size,
    firstChain:r.outcome.firstChain,firstClosed:r.outcome.firstClosed,firstDetachedChain:r.outcome.firstDetachedChain,
    firstDetachedClosed:r.outcome.firstDetachedClosed,firstPersistentClosed:r.outcome.firstPersistentClosed,
    activeNovelSeen:r.outcome.activeNovelSeen,novelKeys:r.outcome.novelKeys,closedKeys:r.outcome.closedKeys,
    minCharged:r.outcome.minCharged,sampledMinCharged:Math.min(...charged),
    finalClosed:final.base.closedCount,finalChains:final.base.chainCount,finalFreeW:final.base.freeW,
    finalFreeRingsW:final.freeRingsW,finalFreeArcW:final.freeArcW,finalCapBoundW:final.capBoundW,
    components:final.components,finalRailPieces:railPieces(r),sampledMaxOverlap:r.outcome.sampledMaxOverlap,sampledMaxPin:r.outcome.sampledMaxPin};
}
function main(){
  const [output,...files]=process.argv.slice(2);assert(output&&files.length===4&&!fs.existsSync(output));
  const r={command:process.argv.slice(1),sourceHash:hash(__filename),inputs:files.map(path=>({path,sha256:hash(path)})),complete:false};let error;
  try{
    const raws=files.map(read);r.rows=raws.map(audit);
    for(const seed of [809,811]){
      const on=raws.find(x=>x.job.seed===seed&&x.job.on),off=raws.find(x=>x.job.seed===seed&&!x.job.on);
      assert(on&&off);assert.deepEqual(on.initial.arrays,off.initial.arrays);assert.equal(on.initial.rng,off.initial.rng);
      assert.deepEqual({...on.initial.p,rimBind:false},off.initial.p);
    }
    const index=raws.findIndex(x=>x.monitor.events.length);assert(index>=0);
    const tape=structuredClone(raws[index]);tape.monitor.events[0].b=tape.monitor.events[0].a;assert.throws(()=>audit(tape));
    const sample=structuredClone(raws[0]);sample.samples[0].frame.rimBonds=[];assert.throws(()=>audit(sample));
    const aggregate=structuredClone(raws[0]);aggregate.outcome.events++;assert.throws(()=>audit(aggregate));
    r.corruptionsRejected=3;r.promotion=r.rows.filter(x=>x.on).every(x=>x.firstPersistentClosed!==null);
    r.complete=true;
  }catch(e){error=e;r.error={message:e.message,stack:e.stack};}
  const c=process.cpuUsage();r.cpuSeconds=(c.user+c.system)/1e6;r.physicsSteps=0;write(output,r);
  console.log(JSON.stringify(r));if(error)process.exitCode=1;
}
if(require.main===module)main();module.exports={audit};
