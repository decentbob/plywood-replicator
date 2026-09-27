#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const {Sim,F,L,R,I_DOCK,I_REPEL,I_TPL}=require('../src/sim');
const {rows,hash}=require('./placement_release'),api=require('./contact_handoff');
const {derived}=require('./contact_handoff_summary'),{SEEK}=require('./local_redocking');
const runner=require('./handoff_closure'),{REQUEST,OFFER,LATCH}=api;
const EXACT='PAAAABBBBQ',norm=x=>JSON.parse(JSON.stringify(x));
const ready=r=>r.units.length>1&&r.states.every(st=>st===I_REPEL)&&r.faces.every(q=>q<0);
function analyze(b,p){
  const s=Sim.fromState(b.initial.state),start=p.state.nums.t,end=start+runner.STEPS;
  assert.deepEqual(b.initial,api.save(runner.install(Sim.fromState(p.state),b.arm)));
  assert.equal(s.n,150);assert.equal(s.t,15000);
  const initialLateral=Array.from(s.bond),seen=new Set(rows(s).filter(ready).map(r=>r.units.join(',')));
  const complete=[],requests=[],acquisitions=[],handoffs=[],returns=[];let pos=0,phasePos=0,previous=b.initial.marks.previous;
  assert.equal(b.windows.length,7);
  for(let t=start+1;t<=end;t++){
    const held=[];for(let u=0;u<s.n;u++)if(s.is[u]===LATCH&&s.bond[u*4+F]>=0)held.push({u,face:s.bond[u*4+F]});
    if(held.length){const phase=b.supportPhases[phasePos++];assert(phase);assert.equal(phase.t,t);
      assert.deepEqual(phase.contacts.map(x=>({u:x.u,face:x.face})),held);
      for(const c of phase.contacts){assert.equal(c.afterFace,c.face);assert(Number.isFinite(c.beforeGap)&&c.beforeGap>=0);assert(Number.isFinite(c.afterGap)&&c.afterGap>=0);}}
    while(pos<b.events.length&&b.events[pos].t===t){
      const e=b.events[pos++];assert(Number.isInteger(e.u)&&e.u>=0&&e.u<s.n);const o=e.u*4;
      if(e.kind==='state'){
        assert.equal(s.is[e.u],e.before);assert.notEqual(e.before,e.after);
        assert([I_DOCK,I_REPEL,I_TPL,SEEK,REQUEST,OFFER,LATCH].includes(e.after));
        assert.deepEqual(e.bonds,Array.from(s.bond.slice(o,o+4)));assert.deepEqual(e.read,e.bonds.map(q=>q<0?0:previous[q]));
        const nl=Number(e.bonds[L]>=0)+Number(e.bonds[R]>=0),support=[L,R].filter(i=>e.bonds[i]>=0&&e.read[i]===2).map(i=>e.bonds[i]>>2);
        const request=[L,R].some(i=>e.bonds[i]>=0&&e.read[i]===1);
        if(e.after===REQUEST){assert(['wait','pulse','hold'].includes(b.arm));assert.equal(e.before,I_DOCK);assert(e.bonds[F]>=0&&nl===1);requests.push({t,u:e.u});}
        if(e.after===OFFER){assert(['pulse','hold'].includes(b.arm));assert.equal(e.before,I_REPEL);assert(e.bonds[F]<0&&request);}
        if(e.after===LATCH){assert.equal(b.arm,'hold');assert.equal(e.before,OFFER);assert(e.bonds[F]>=0);acquisitions.push({t,u:e.u,face:e.bonds[F]});}
        if(e.before===REQUEST&&e.after===SEEK){assert(support.length&&e.bonds[F]>=0&&nl===1);handoffs.push({t,u:e.u,support,physicalSupport:support.filter(u=>held.some(h=>h.u===u))});}
        if(e.before===LATCH)assert(e.bonds[F]<0||!request);
        if(e.before===SEEK&&e.bonds[F]>=0)returns.push({t,u:e.u,face:e.bonds[F]});
        s.is[e.u]=e.after;
      }else{
        assert(['link','unlink'].includes(e.kind));assert(Number.isInteger(e.v)&&e.v>=0&&e.v<s.n&&e.v!==e.u);
        assert([F,L,R].includes(e.i)&&[F,L,R].includes(e.j));const a=o+e.i,c=e.v*4+e.j;
        if(e.kind==='link'){assert.equal(s.bond[a],-1);assert.equal(s.bond[c],-1);s.bond[a]=c;s.bond[c]=a;}
        else{assert(e.i===F&&e.j===F);assert.equal(s.bond[a],c);assert.equal(s.bond[c],a);s.bond[a]=s.bond[c]=-1;}
      }
    }
    assert(pos===b.events.length||b.events[pos].t>t,'Unordered event');previous=derived(s);
    const inventory=rows(s);
    for(const row of inventory){const key=row.units.join(',');if(ready(row)&&!seen.has(key)){seen.add(key);complete.push({t,units:row.units,seq:row.seq});}}
    if((t-start)%5000===0){const w=b.windows[(t-start)/5000-1];assert.equal(w.t,t);assert.deepEqual(w.rows,inventory);
      assert.deepEqual(w.marks,{current:previous,previous});const ids=inventory.flatMap(r=>r.units);assert.equal(ids.length,150);assert.equal(new Set(ids).size,150);
      assert.equal(w.stats.free,inventory.filter(r=>r.units.length===1&&r.states[0]===I_DOCK&&r.faces[0]<0).length);
      assert.equal(w.stats.docked,inventory.flatMap(r=>r.states.map((st,i)=>st===I_DOCK&&r.faces[i]>=0)).filter(Boolean).length);
      assert.equal(w.stats.births,p.state.nums.birthCount+b.births.filter(x=>x.t<=t).length);
    }
  }
  assert.equal(pos,b.events.length);assert.equal(phasePos,b.supportPhases.length);assert.deepEqual(complete,b.settled);
  const final=Sim.fromState(b.final.state);assert.equal(final.t,end);assert.deepEqual(final.check(),[]);
  assert.deepEqual(Array.from(final.is),Array.from(s.is));assert.deepEqual(Array.from(final.bond),Array.from(s.bond));
  assert.deepEqual(b.final.state.arrays.type,p.state.arrays.type);assert.deepEqual(b.final.state.p,p.state.p);
  assert.deepEqual(b.final.marks,{current:previous,previous});assert.deepEqual(Array.from(final.hm),previous);assert.deepEqual(Array.from(final.hm0),previous);
  for(let u=0;u<s.n;u++)for(const i of [L,R])if(initialLateral[u*4+i]>=0)assert.equal(final.bond[u*4+i],initialLateral[u*4+i]);
  assert.equal(b.births.length,b.stockBirths.length);b.births.forEach((x,i)=>{const m=b.stockBirths[i];assert.equal(x.t,m.t);assert.equal(x.seq,m.units.map(u=>s._letter(u)).join(''));});
  const finalRows=rows(final);assert.deepEqual(finalRows,b.windows.at(-1).rows);
  const useful=complete.filter(x=>x.seq===EXACT&&x.t<=end-1000&&finalRows.some(r=>ready(r)&&r.units.join(',')===x.units.join(',')));
  const cohorts=p.cohort.map(c=>{
    const outputs=useful.filter(x=>c.units.every(u=>x.units.includes(u))),row=finalRows.find(r=>c.units.every(u=>r.units.includes(u)));assert(row);
    const proofs=[];
    for(const output of outputs)for(const h of handoffs.filter(h=>c.units.includes(h.u)&&h.t<output.t)){
      const capture=acquisitions.find(a=>h.physicalSupport.includes(a.u)&&a.t<h.t),returned=returns.find(x=>x.u===h.u&&x.t>h.t&&x.t<output.t);
      const released=b.events.some(e=>e.kind==='unlink'&&e.t===h.t&&e.u===h.u&&e.i===F);
      if(capture&&returned&&released)proofs.push({capture,release:h,returned,completion:output.t});
    }
    return {anchor:c.anchor,units:c.units,useful:outputs,proofs,final:row};
  });
  return {arm:b.arm,stockBirths:b.births.length,exact:complete.filter(x=>x.seq===EXACT).length,nonExact:complete.filter(x=>x.seq!==EXACT).length,
    usefulExact:useful.length,useful,cohortUseful:cohorts.filter(c=>c.useful.length).length,cohorts,requests,acquisitions,handoffs,returns,
    offers:b.events.filter(e=>e.kind==='state'&&e.after===OFFER).length,captures:b.events.filter(e=>e.kind==='state'&&e.before===OFFER&&e.bonds[F]>=0).length,
    supportPhases:b.supportPhases.length,supportContacts:b.supportPhases.reduce((n,p)=>n+p.contacts.length,0),
    pending:{seek:Array.from(final.is).filter(x=>x===SEEK).length,request:Array.from(final.is).filter(x=>x===REQUEST).length,offer:Array.from(final.is).filter(x=>x===OFFER).length,latch:Array.from(final.is).filter(x=>x===LATCH).length},
    free:b.windows.at(-1).stats.free,unfinishedMaterial:finalRows.filter(r=>r.units.length>1&&!ready(r)&&!r.units.some(u=>p.parent.includes(u))).reduce((n,r)=>n+r.units.length,0)};
}
function decision(arms){
  const get=a=>arms.find(x=>x.arm===a),h=get('hold'),w=get('wait');
  const usefulAdvantage=h.usefulExact>=1&&h.usefulExact>w.usefulExact&&h.usefulExact>=get('ordinary').usefulExact&&h.usefulExact>=get('seek').usefulExact;
  const reuseAdvantage=h.cohortUseful>w.cohortUseful,physicalHandoff=h.cohorts.some(c=>c.proofs.length);
  return {usefulAdvantage,reuseAdvantage,physicalHandoff,beatsPulse:h.usefulExact>get('pulse').usefulExact,pass:usefulAdvantage&&reuseAdvantage&&physicalHandoff};
}
function validate(r,{replay=true}={}){
  assert.equal(r.schema,1);assert.equal(r.provenance.input,runner.INPUT);assert.equal(r.provenance.physicsSteps,175000);
  const root=path.join(__dirname,'..'),input=fs.readFileSync(path.join(root,runner.INPUT));assert.equal(r.provenance.inputHash,hash(input));
  const ref=JSON.parse(input);assert.deepEqual(r.prepared,ref.prepared);
  assert.deepEqual(Object.keys(r.provenance.sources).sort(),[...runner.SOURCES].sort());
  for(const [f,h]of Object.entries(r.provenance.sources)){
    const b=fs.readFileSync(path.join(root,f)),lf=b.toString().replace(/\r\n/g,'\n');assert([hash(b),hash(lf),hash(lf.replace(/\n/g,'\r\n'))].includes(h),'Source changed: '+f);
  }
  assert.deepEqual(r.results.map(x=>x.arm),runner.ARMS);
  const arms=r.results.map(b=>analyze(b,r.prepared));
  const ordinary=norm(r.results[0].final.state);delete ordinary.arrays.hm;delete ordinary.arrays.hm0;
  assert.equal(hash(ordinary),ref.results.find(x=>x.arm==='keep').finalStateHash);
  for(const b of r.results){
    assert.deepEqual(b.checkpoints.map(x=>x.state.nums.t),[25000,25300]);
    if(replay){
      assert.deepEqual(norm(runner.run(r.prepared,b.arm)),b,'Observed trajectory differs');
      assert.deepEqual(runner.run(r.prepared,b.arm,false).final,b.final,'Observer changes physical arrays / RNG');
      const resumed=runner.restore(b.checkpoints[0],b.arm);resumed.run(300);const actual=api.save(resumed),expected=norm(b.checkpoints[1]);
      actual.state.nums.pinsVersion=expected.state.nums.pinsVersion;assert.deepEqual(actual,expected,'Restart differs beyond pin cache');
    }
  }
  return {arms,gate:decision(arms)};
}
if(require.main===module){const r=runner.load(process.argv[2]),s=validate(r);console.log(JSON.stringify(s));}
module.exports={analyze,decision,validate};
