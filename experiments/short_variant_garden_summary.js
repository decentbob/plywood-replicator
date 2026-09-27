#!/usr/bin/env node
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const {Sim,F,K,L,R,T_A,T_B,T_U,I_TPL}=require('../src/sim.js');
const {setup,metrics,sources,sequences,hash,digest,complement}=require('./short_variant_garden.js');
const {census}=require('./short_variant_summary.js');
const key=r=>[r.seed,r.sequence,r.profile,r.grip].join('/');
const load=stem=>({m:JSON.parse(fs.readFileSync(stem+'.manifest.json','utf8')),
  rs:fs.readFileSync(stem+'.runs.jsonl','utf8').trim().split(/\r?\n/).filter(Boolean).map(JSON.parse)});
function evidence(r){
  const initial=Sim.fromState(r.initialState),b=Array.from(initial.bond),types=Array.from(initial.type),
    live=new Map(),seen=new Set(),states=new Map(),full=new Map(),latest=new Map();
  const fuel={sameRow:0,differentRows:0,untracked:0,knownCross:0,waitCount:0,waitSum:0,waitMax:0};
  const fuelEvents=[];let previous=0;
  const lateral=(u,side)=>(types[u]===T_A||types[u]===T_B)&&(side===L||side===R);
  for(const [index,e]of r.events.entries()){
    assert(e.t>=previous&&e.t<=r.steps);previous=e.t;
    if(e.kind==='bond+'){
      const a=e.u*4+e.side,z=e.v*4+e.vs;assert.equal(b[a],-1);assert.equal(b[z],-1);
      if(lateral(e.u,e.side))assert(!live.has(e.u),'Edited live parent');
      if(lateral(e.v,e.vs))assert(!live.has(e.v),'Edited live parent');
      b[a]=z;b[z]=a;
    }
    if(e.kind==='bond-'){
      const a=e.u*4+e.side;assert.equal(b[a],e.q);assert.equal(b[e.q],a);
      if(lateral(e.u,e.side))assert(!live.has(e.u),'Unlinked live parent');
      if(lateral(e.q>>2,e.q&3))assert(!live.has(e.q>>2),'Unlinked live partner');
      b[a]=-1;b[e.q]=-1;
    }
    if(e.kind==='release')latest.set(e.u,{index,t:e.t});
    if(e.kind==='retire'){
      assert(seen.has(e.id));const p=r.rows[e.id];assert.equal(p.lost,e.t);assert.equal(p.loss,e.reason);
      for(const u of p.units){assert.equal(live.get(u),p.id);live.delete(u);}
    }
    if(e.kind==='rearm'){
      assert.equal(types[e.fuel],T_U);assert.equal(b[e.u*4+K]>>2,e.fuel);assert.equal(e.actorState,I_TPL);
      const holders=[];
      for(let side=0;side<4;side++){const q=b[e.fuel*4+side];if(q>=0)holders.push({fuelSide:side,unit:q>>2,side:q&3});}
      assert.deepEqual(e.holders,holders,'Fuel holder tape mismatch');assert(holders.length>=2);
      assert(holders.every(h=>(types[h.unit]===T_A||types[h.unit]===T_B)&&h.side===K));
      assert(holders.some(h=>h.unit===e.u&&h.side===K));
      const owners=holders.map(h=>live.get(h.unit)??null),known=new Set(owners.filter(x=>x!==null));
      const category=owners.includes(null)?'untracked':known.size===1?'sameRow':'differentRows';
      fuel[category]++;if(known.size>1)fuel.knownCross++;
      const wait=latest.has(e.u)?e.t-latest.get(e.u).t:null;
      if(wait!==null){assert(wait>=0);fuel.waitCount++;fuel.waitSum+=wait;fuel.waitMax=Math.max(fuel.waitMax,wait);}
      fuelEvents.push({event:index,t:e.t,u:e.u,fuel:e.fuel,owners,category,wait});
      states.set(e.u,I_TPL);const id=live.get(e.u);
      if(id!==undefined&&!full.has(id)&&r.rows[id].units.every(u=>states.get(u)===I_TPL))full.set(id,e.t);
    }
    if(e.kind==='row'){
      const p=r.rows[e.id];assert(p&&!seen.has(e.id));seen.add(e.id);
      assert.equal(p.id,e.id);assert.equal(p.born,e.t);assert.equal(p.parent,e.parent);assert.equal(p.depth,e.depth);
      assert.deepEqual(p.units,e.units);assert.equal(new Set(p.units).size,p.units.length);
      assert.equal(p.seq,p.units.map(u=>types[u]===T_A?'A':'B').join(''));
      assert.deepEqual(e.faces,p.units.map(u=>b[u*4+F]));assert.equal(p.detached,e.faces.every(q=>q<0));
      assert.equal(e.states.length,p.units.length);
      for(let i=0;i<p.units.length;i++){
        const u=p.units[i];assert(!live.has(u));states.set(u,e.states[i]);live.set(u,p.id);
        assert.equal(b[u*4+L],i?p.units[i-1]*4+R:-1);
        assert.equal(b[u*4+R],i+1<p.units.length?p.units[i+1]*4+L:-1);
      }
      if(e.states.every(s=>s===I_TPL))full.set(p.id,e.t);
      if(!p.born){assert.equal(p.depth,0);assert.equal(p.seq,p.id%2?complement(r.sequence):r.sequence);}
      else{
        const par=p.parent===null?null:r.rows[p.parent];
        assert.equal(p.depth,p.exact&&par.depth!==null?par.depth+1:null);
        const birth=r.births[p.id-4];assert.equal(birth.t,p.born);assert.equal(birth.seq,p.seq);
      }
    }
    for(const cp of r.checkpoints)if(index+1===cp.eventCount)assert.deepEqual(b,Array.from(Sim.fromState(cp.state).bond));
  }
  assert.equal(seen.size,r.rows.length);
  assert.deepEqual(b,Array.from(Sim.fromState(r.finalState).bond),'Final bond reconstruction');
  for(const p of r.rows){
    assert.equal(p.fullAt,full.get(p.id)??null,'Full rearming reconstruction');
    assert.equal(p.lost===null,p.units.every(u=>live.get(u)===p.id));
    assert.deepEqual(p.children,r.rows.filter(c=>c.parent===p.id).map(c=>c.id));
  }
  assert.equal(fuelEvents.length,r.finalState.nums.fuelUsed);
  return {fuel,fuelEvents,variants:census(r)};
}
function validate(m,rs){
  assert(m.complete&&m.completed===m.jobs.length&&rs.length===m.jobs.length,'Incomplete batch');
  assert.deepEqual(m.errors,[]);assert.equal(new Set(rs.map(key)).size,rs.length);
  assert.deepEqual(rs.map(key).sort(),m.jobs.map(key).sort());
  assert.deepEqual(Object.keys(m.sources).sort(),[...sources].sort());
  for(const [f,h]of Object.entries(m.sources)){
    const raw=fs.readFileSync(path.join(__dirname,'..',f)),lf=raw.toString().replace(/\r\n/g,'\n');
    assert([hash(raw),hash(lf),hash(lf.replace(/\n/g,'\r\n'))].includes(h),'Source changed: '+f);
  }
  return rs.map(r=>{
    const j=m.jobs.find(j=>key(j)===key(r)),{s}=setup(j);assert.equal(r.steps,j.steps);
    assert.deepEqual(r.params,JSON.parse(JSON.stringify(s.p)));
    assert.equal(r.initialHash,digest(r.initialState));assert.equal(r.initialHash,digest(s.saveState()));
    assert.equal(r.finalHash,digest(r.finalState));assert.deepEqual(r.finalState.p,r.params);
    assert.equal(r.finalState.nums.t,r.steps);assert.equal(r.finalState.nums.n,160);
    assert.deepEqual(r.initialState.arrays.type,r.finalState.arrays.type);assert.deepEqual(Sim.fromState(r.finalState).check(),[]);
    assert.equal(r.samples.length,r.steps/100);assert.equal(r.births.length,r.finalState.nums.birthCount);
    assert.equal(r.rows.length,4+r.births.length);assert.equal(r.checkpoints.length,1);
    const cp=r.checkpoints[0];assert.equal(cp.state.nums.t,Math.floor(r.steps/200)*100);
    assert.equal(cp.after500.nums.t,cp.state.nums.t+500);assert(cp.eventCount>0&&cp.eventCount<=r.events.length);
    assert(r.events.slice(0,cp.eventCount).every(e=>e.t<=cp.state.nums.t));
    assert(r.events.slice(cp.eventCount).every(e=>e.t>cp.state.nums.t));
    r.samples.forEach((w,i)=>{assert.equal(w.t,(i+1)*100);assert.equal(Object.values(w.material).reduce((a,b)=>a+b,0),120);
      assert(Object.values(w.material).every(n=>Number.isInteger(n)&&n>=0));assert(Number.isFinite(w.bends)&&w.bends>=0&&w.joints>=0);});
    assert.equal(r.samples.at(-1).fuelUsed,r.finalState.nums.fuelUsed);
    const e=evidence(r);assert.deepEqual(r.metrics,metrics(r));
    if(!r.grip){assert.equal(r.metrics.fuel,0);assert.equal(r.metrics.primary,0);}
    return {seed:r.seed,sequence:r.sequence,profile:r.profile,grip:r.grip,...r.metrics,...e};
  });
}
function decision(rs){
  const seeds=[...new Set(rs.map(r=>r.seed))];
  if(rs.length===4&&rs.every(r=>r.steps===20000&&r.profile==='opposed20'&&r.grip))
    return {kind:'viability',pass:sequences.every(q=>rs.some(r=>r.sequence===q&&r.metrics.founderChildren>0))};
  assert.equal(rs.length,seeds.length*8,'Decision requires complete factorial');
  const contrasts=seeds.map(seed=>{
    const n=(q,p,g)=>rs.find(r=>r.seed===seed&&r.sequence===q&&r.profile===p&&r.grip===g).metrics.primary;
    const alternating=n('ABABA','opposed20',true),rearranged=n('AABAB','opposed20',true),
      squareContrast=n('ABABA','square',true)-n('AABAB','square',true),
      gripContrast=alternating-n('ABABA','opposed20',false),contrast=alternating-rearranged;
    return {seed,alternating,rearranged,contrast,squareContrast,gripContrast,
      pass:alternating>=2&&contrast>=2&&contrast>squareContrast&&gripContrast>=2};
  });
  return {kind:'screen',pass:contrasts.every(c=>c.pass),contrasts};
}
if(require.main===module){
  const {m,rs}=load(process.argv[2]),worlds=validate(m,rs),result={decision:decision(rs),cpuSeconds:m.cpuSeconds,worlds};
  console.table(worlds.map(({seed,sequence,profile,grip,primary,exact,secondCycle,full,fuel,meanBend,unfinished})=>
    ({seed,sequence,profile,grip,primary,exact,secondCycle,full,fuel,meanBend,unfinished})));
  console.log(JSON.stringify({decision:result.decision,cpuSeconds:m.cpuSeconds}));
  if(process.argv[3])fs.writeFileSync(process.argv[3],JSON.stringify(result,null,2)+'\n',{flag:'wx'});
}
module.exports={load,validate,evidence,decision,key};
