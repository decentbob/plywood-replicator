#!/usr/bin/env node
const fs=require('fs'),assert=require('assert/strict');
const {Sim,F,L,R,I_DOCK,I_REPEL,I_TPL}=require('../src/sim');
const {rows}=require('./placement_release');
const {fileHash}=require('./local_redocking_summary');
const api=require('./contact_handoff');
const {SEEK}=require('./local_redocking');
const {REQUEST,OFFER,LATCH}=api,exact='PAAAABBBBQ';
function derived(s){const a=new Array(s.n*4).fill(0);for(let u=0;u<s.n;u++){
  const o=u*4,k=s.bond[o+F]>=0?(s.is[u]===REQUEST?1:s.is[u]===LATCH?2:0):0;
  for(const side of [L,R])if(s.bond[o+side]>=0)a[o+side]=k;
}return a;}
function analyze(b,p){
  const s=Sim.fromState(b.initial.state),start=p.at,end=start+5000;
  assert.equal(s.n,150);assert.equal(s.t,start);assert.deepEqual(s.check(),[]);
  assert.deepEqual(b.initial,api.save(api.install(Sim.fromState(p.state),b.arm)));
  let pos=0,previous=b.initial.marks.previous,last=start,heldPhases=0,overlapPhases=0,primaryReturns=[];
  const complete=[],seen=new Set(),acquisitions=[],requests=[],handoffs=[];
  for(const row of rows(s))if(row.units.length>1&&row.states.every(st=>st===I_REPEL)&&row.faces.every(q=>q<0))seen.add(row.units.join(','));
  assert.equal(b.windows.length,5);b.windows.forEach((w,i)=>assert.equal(w.t,start+(i+1)*1000));
  for(let t=start+1;t<=end;t++){
    const held=p.target.some(u=>u!==p.u&&s.is[u]===LATCH&&s.bond[u*4+F]>=0);
    if(held){heldPhases++;if(s.bond[p.u*4+F]>=0)overlapPhases++;}
    while(pos<b.events.length&&b.events[pos].t===t){const e=b.events[pos++];
      assert(e.t>=last&&Number.isInteger(e.u)&&e.u>=0&&e.u<s.n);last=e.t;
      const o=e.u*4;
      if(e.kind==='state'){
        assert.equal(s.is[e.u],e.before);assert.notEqual(e.before,e.after);
        assert([I_DOCK,I_REPEL,I_TPL,SEEK,REQUEST,OFFER,LATCH].includes(e.after));
        assert.deepEqual(e.bonds,Array.from(s.bond.slice(o,o+4)));
        assert.deepEqual(e.read,e.bonds.map(q=>q<0?0:previous[q]));
        const nl=Number(e.bonds[L]>=0)+Number(e.bonds[R]>=0),request=[L,R].some(i=>e.bonds[i]>=0&&e.read[i]===1),support=[L,R].some(i=>e.bonds[i]>=0&&e.read[i]===2);
        if(e.after===REQUEST){assert.notEqual(b.arm,'seek');assert.equal(e.before,I_DOCK);assert(e.bonds[F]>=0&&nl===1);requests.push({t,u:e.u});}
        if(e.after===OFFER){assert(['pulse','hold'].includes(b.arm));assert.equal(e.before,I_REPEL);assert(e.bonds[F]<0&&request);}
        if(e.after===LATCH){assert.equal(b.arm,'hold');assert.equal(e.before,OFFER);assert(e.bonds[F]>=0);acquisitions.push({t,u:e.u,site:p.parent.indexOf(e.bonds[F]>>2)});}
        if(e.before===REQUEST&&e.after===SEEK){assert(support&&e.bonds[F]>=0&&nl===1);handoffs.push({t,u:e.u,site:p.parent.indexOf(e.bonds[F]>>2)});}
        if(e.before===LATCH)assert(e.bonds[F]<0||!request);
        if(e.before===SEEK&&e.u===p.u&&e.bonds[F]>=0)primaryReturns.push({t,site:p.parent.indexOf(e.bonds[F]>>2)});
        s.is[e.u]=e.after;
      }else{
        assert(['link','unlink'].includes(e.kind));assert(Number.isInteger(e.v)&&e.v>=0&&e.v<s.n&&e.v!==e.u);
        assert([F,L,R].includes(e.i)&&[F,L,R].includes(e.j));
        const a=o+e.i,c=e.v*4+e.j;
        if(e.kind==='link'){assert.equal(s.bond[a],-1);assert.equal(s.bond[c],-1);s.bond[a]=c;s.bond[c]=a;
          if(e.i===F||e.j===F){assert(e.i===F&&e.j===F);assert(p.parent.includes(e.u)||p.parent.includes(e.v));}}
        else{assert(e.i===F&&e.j===F);assert.equal(s.bond[a],c);assert.equal(s.bond[c],a);s.bond[a]=s.bond[c]=-1;}
      }
    }
    assert(pos===b.events.length||b.events[pos].t>t,'Unordered event');
    previous=derived(s);
    const inventory=rows(s);
    for(const row of inventory){const key=row.units.join(',');if(row.units.length>1&&!seen.has(key)&&row.states.every(st=>st===I_REPEL)&&row.faces.every(q=>q<0)){
      seen.add(key);complete.push({t,units:row.units,seq:row.seq});}}
    if((t-start)%1000===0){const w=b.windows[(t-start)/1000-1];assert.deepEqual(w.rows,inventory);
      assert.deepEqual(w.marks,{current:previous,previous});
      const ids=inventory.flatMap(r=>r.units);assert.equal(ids.length,150);assert.equal(new Set(ids).size,150);
      assert.equal(w.stats.free,inventory.filter(r=>r.units.length===1&&r.states[0]===I_DOCK&&r.faces[0]<0).length);
      assert.equal(w.stats.docked,inventory.flatMap(r=>r.states.map((st,i)=>st===I_DOCK&&r.faces[i]>=0)).filter(Boolean).length);
      assert.equal(w.stats.births,p.state.nums.birthCount+b.births.filter(x=>x.t<=t).length);
    }
  }
  assert.equal(pos,b.events.length);assert.deepEqual(complete,b.settled);
  const final=Sim.fromState(b.final.state);assert.equal(final.t,end);assert.deepEqual(final.check(),[]);
  assert.deepEqual(Array.from(final.hm),b.final.marks.current);assert.deepEqual(Array.from(final.hm0),b.final.marks.previous);
  assert.deepEqual(Array.from(final.is),Array.from(s.is));assert.deepEqual(Array.from(final.bond),Array.from(s.bond));
  assert.deepEqual(b.final.state.arrays.type,p.state.arrays.type);assert.deepEqual(b.final.state.p,p.state.p);
  assert.deepEqual(b.final.marks,{current:previous,previous});assert.deepEqual(rows(final),b.windows.at(-1).rows);
  assert.equal(b.births.length,b.stockBirths.length);b.births.forEach((x,i)=>{const m=b.stockBirths[i];assert.equal(x.t,m.t);assert.equal(x.seq,m.units.map(u=>s._letter(u)).join(''));});
  const target=complete.filter(x=>p.target.every(u=>x.units.includes(u))),pending=rows(final).filter(r=>p.target.every(u=>r.units.includes(u)));
  const offers=b.events.filter(e=>e.kind==='state'&&e.after===OFFER).length,
    captures=b.events.filter(e=>e.kind==='state'&&e.before===OFFER&&e.bonds[F]>=0).length;
  return {profile:p.profile,arm:b.arm,heldPhases,overlapPhases,offers,captures,requests,acquisitions,handoffs,primaryReturns,target,
    pendingBlocks:Array.from(final.is).filter(st=>st>=REQUEST).length,
    exact:complete.filter(x=>x.seq===exact).length,nonExact:complete.filter(x=>x.seq!==exact).length,
    unresolved:pending.filter(r=>r.faces.some(q=>q>=0)||r.states.some(st=>st!==I_REPEL)).map(r=>({seq:r.seq,states:r.states,faces:r.faces})),
    targetExact:target.some(x=>x.seq===exact)};
}
function validate(r){assert.equal(r.input,'experiments/out/RF_selected.json');fileHash(r.input,r.inputHash);
  assert.deepEqual(Object.keys(r.sources).sort(),[...api.sources].sort());for(const [f,h]of Object.entries(r.sources))fileHash(f,h);
  assert(r.neutral&&r.cpuSeconds>0);assert.equal(r.executedSteps,113500);
  const ref=JSON.parse(fs.readFileSync(r.input));assert.equal(r.prepared.length,2);
  for(let i=0;i<2;i++){const p=r.prepared[i],old=ref.prepared[i];assert.equal(p.profile,old.profile);assert.equal(p.at,old.at-1);
    assert.equal(p.u,old.u);assert.deepEqual(p.parent,old.parent);assert.deepEqual(p.target,old.target);
    const s=api.install(Sim.fromState(p.state),'seek');s.step();const replay=s.saveState();
    delete replay.arrays.hm;delete replay.arrays.hm0;
    assert.equal(replay.nums.pinsVersion-old.state.nums.pinsVersion,p.state.nums.bondsDirty?0:1);
    replay.nums.pinsVersion=old.state.nums.pinsVersion;assert.deepEqual(replay,old.state);
  }
  assert.deepEqual(r.results.map(b=>[b.profile,b.arm]),r.prepared.flatMap(p=>api.arms.map(a=>[p.profile,a])));
  return r.results.map(b=>analyze(b,r.prepared.find(p=>p.profile===b.profile)));
}
if(require.main===module){const r=JSON.parse(fs.readFileSync(process.argv[2])),rs=validate(r);rs.forEach(x=>console.log(JSON.stringify(x)));console.log(JSON.stringify({cpuSeconds:r.cpuSeconds,executedSteps:r.executedSteps}));
  if(process.argv[3]){assert(process.argv[3].endsWith('.csv'));const keys=['profile','arm','heldPhases','overlapPhases','targetExact','exact','nonExact'];fs.writeFileSync(process.argv[3],keys.join(',')+'\n'+rs.map(x=>keys.map(k=>x[k]).join(',')).join('\n')+'\n');}}
module.exports={derived,analyze,validate};
