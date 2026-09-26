#!/usr/bin/env node
const fs=require('fs'),assert=require('assert/strict');
const {Sim,F,L,R,I_DOCK,I_REPEL,I_TPL}=require('../src/sim');
const {arms,job,forkAt,sources,hash,intervene,rows}=require('./placement_release');
const exact=b=>b.seq==='PAAAABBBBQ'&&b.parent==='PAAAABBBBQ'&&b.gen===1;
const sorted=xs=>[...xs].sort((a,b)=>a-b);
function validate(r){
  assert.deepEqual(r.job,job);assert.equal(r.forkAt,forkAt);assert.equal(r.neutral,true);assert.equal(r.executedSteps,240000);assert(r.cpuSeconds>0);
  assert.deepEqual(Object.keys(r.sources).sort(),[...sources].sort());
  for(const [file,h]of Object.entries(r.sources)){const raw=fs.readFileSync(file,'utf8'),lf=raw.replace(/\r\n/g,'\n');assert([raw,lf,lf.replace(/\n/g,'\r\n')].some(x=>hash(x)===h),'Source mismatch: '+file);}
  const p=r.prepared,s0=Sim.fromState(p.state);assert.equal(s0.t,15000);assert.equal(s0.n,150);assert.deepEqual(s0.check(),[]);
  const archived=fs.readFileSync('experiments/out/PC_screen.runs.jsonl','utf8').trim().split(/\r?\n/).map(JSON.parse).find(x=>x.seed===83&&x.profile==='opposed20'&&x.undock===0.3);
  assert.deepEqual(s0.p,archived.params);assert.deepEqual(p.parent,archived.parent);assert.deepEqual(s0.stats(),archived.windows.find(w=>w.t===forkAt).stats);
  assert.deepEqual(p.births,archived.births.filter(b=>b.t<=forkAt));
  assert.deepEqual(p.cohort,[87,107].map(anchor=>({anchor,units:s0.strandOf(anchor),site:p.parent.indexOf(s0.bond[anchor*4+F]>>2)})));
  assert.deepEqual(p.cohort.map(c=>c.units.map(u=>s0._letter(u)).join('')),['PAAAABB','PAAAAB']);
  assert.deepEqual(r.results.map(x=>x.arm).sort(),Object.keys(arms).sort());
  const owner=new Map(p.parent.map(u=>[u,'founder']));for(const c of p.cohort)for(const u of c.units)owner.set(u,c.anchor===87?'long':'short');
  for(const b of r.results){
    assert.equal(b.startHash,hash(p.state));const s=Sim.fromState(p.state);intervene(s,b.arm);
    assert.deepEqual(b.initialBonds,Array.from(s.bond));assert.deepEqual(b.initialStates,Array.from(s.is));
    assert.equal(b.windows.length,7);assert.equal(b.birthMembers.length,b.births.length);
    const bonds=[...b.initialBonds],events=[...b.links.map((e,i)=>({...e,phase:0,index:i})),...b.unlinks.map((e,i)=>({...e,phase:1,index:i}))].sort((a,b)=>a.t-b.t||a.phase-b.phase||a.index-b.index);
    let pos=0,bornPos=0;const apply=e=>{
      assert(Number.isInteger(e.t)&&e.t>forkAt&&e.t<=job.steps);for(const u of [e.u,e.v])assert(Number.isInteger(u)&&u>=0&&u<150);assert(e.u!==e.v);
      assert(Number.isInteger(e.i)&&e.i>=0&&e.i<4&&Number.isInteger(e.j)&&e.j>=0&&e.j<4);
      const a=e.u*4+e.i,c=e.v*4+e.j;
      if(e.phase===0){assert.equal(bonds[a],-1);assert.equal(bonds[c],-1);bonds[a]=c;bonds[c]=a;}
      else {assert.equal(e.i,F);assert.equal(e.j,F);assert.equal(bonds[a],c);assert.equal(bonds[c],a);bonds[a]=bonds[c]=-1;}
    };
    assert(b.births.every((x,i)=>i===0||x.t>=b.births[i-1].t));
    for(let i=0;i<7;i++){
      const w=b.windows[i];assert.equal(w.t,20000+i*5000);
      while(bornPos<b.births.length&&b.births[bornPos].t<=w.t){
        const born=b.births[bornPos++];while(pos<events.length&&events[pos].t<=born.t)apply(events[pos++]);
        s.bond.set(bonds);assert.deepEqual(s.strandOf(born.units[0]),born.units);
        assert(born.units.every(u=>bonds[u*4+F]<0),'Birth still attached');
      }
      while(pos<events.length&&events[pos].t<=w.t)apply(events[pos++]);
      s.bond.set(bonds);const expected=rows(s).map(x=>x.units).sort((a,b)=>a[0]-b[0]);assert.deepEqual(w.rows.map(x=>x.units).sort((a,b)=>a[0]-b[0]),expected);
      const ids=w.rows.flatMap(x=>x.units);assert.equal(ids.length,150);assert.equal(new Set(ids).size,150);let free=0,docked=0;
      for(const row of w.rows){assert.equal(row.seq,row.units.map(u=>s._letter(u)).join(''));assert.equal(row.states.length,row.units.length);
        assert.deepEqual(row.faces,row.units.map(u=>bonds[u*4+F]));assert(row.states.every(x=>[I_DOCK,I_REPEL,I_TPL].includes(x)));
        for(let j=0;j<row.units.length;j++){const u=row.units[j],st=row.states[j];
          if(st===I_DOCK){if(bonds[u*4+F]>=0)docked++;else if(row.units.length===1)free++;}
          if(st===I_TPL)assert(p.parent.includes(u));
        }}
      assert.equal(w.stats.free,free);assert.equal(w.stats.docked,docked);
      assert.equal(w.stats.births,p.births.length+b.births.filter(x=>x.t<=w.t).length);
    }
    assert.equal(pos,events.length);assert.equal(bornPos,b.births.length);
    for(let i=0;i<b.births.length;i++){
      const born=b.births[i];assert.deepEqual(b.birthMembers[i],{t:born.t,units:born.units});assert(born.t>forkAt&&born.t<=job.steps);
      assert.equal(born.seq,born.units.map(u=>s._letter(u)).join(''));assert.equal(born.gen,1);assert.equal(born.parent,'PAAAABBBBQ');
      assert.equal(new Set(born.units).size,born.units.length);assert(born.units.every(u=>!p.parent.includes(u)));
      for(let j=1;j<born.units.length;j++)assert.equal(bonds[born.units[j-1]*4+R],born.units[j]*4+L);
    }
    for(const e of b.placements){
      assert([2,3].includes(e.site));assert.equal(e.i,F);assert.equal(e.j,F);assert([e.u,e.v].includes(p.parent[e.site]));
      for(const u of [e.u,e.v,e.m])assert(Number.isInteger(u)&&u>=0&&u<150);assert([e.u,e.v].includes(e.m));
      assert.equal(e.accepted,e.blockers.length===0);assert(Number.isInteger(e.t)&&e.t>forkAt&&e.t<=job.steps);assert(Number.isFinite(e.tx)&&Number.isFinite(e.ty));
      assert.equal(new Set(e.blockers.map(x=>x.u)).size,e.blockers.length);
      for(const x of e.blockers){assert(x.u!==e.m&&Number.isInteger(x.u)&&x.u>=0&&x.u<150);assert.equal(x.group,owner.get(x.u)||'other');
        assert.equal(x.limit,0.75*(s.size[x.u]+s.size[e.m])/2);assert(x.dx*x.dx+x.dy*x.dy<x.limit*x.limit);}
    }
    assert(/^[0-9a-f]{64}$/.test(b.finalStateHash));
  }
  const keep=r.results.find(x=>x.arm==='keep'),old=JSON.parse(fs.readFileSync('experiments/out/AA_selected.json'));
  assert.equal(r.restart.cacheDelta,1);assert.equal(r.restart.continuousStateHash,old.finalStateSha256);
  assert.equal(keep.finalStateHash,r.restart.unobservedStateHash);assert.deepEqual(keep.births,[]);
  const site2=keep.placements.filter(e=>e.site===2);assert.equal(site2.length,47);assert.equal(site2.filter(e=>e.accepted).length,4);
  return r;
}
function summarize(r){return r.results.map(b=>{
  const cohorts=r.prepared.cohort.map(c=>({anchor:c.anchor,
    exactCompletion:b.births.filter(x=>exact(x)&&c.units.every(u=>x.units.includes(u))).map(x=>x.t),
    final:b.windows.at(-1).rows.find(x=>c.units.every(u=>x.units.includes(u)))}));
  const failed=b.placements.filter(e=>!e.accepted),blockedBy={};for(const e of failed)for(const group of new Set(e.blockers.map(x=>x.group)))blockedBy[group]=(blockedBy[group]||0)+1;
  const ids={};for(const e of failed)for(const u of new Set(e.blockers.map(x=>x.u)))ids[u]=(ids[u]||0)+1;
  return {arm:b.arm,exact:b.births.filter(exact).length,partialBirths:b.births.filter(x=>!exact(x)).map(x=>({t:x.t,seq:x.seq,units:x.units})),
    placements:b.placements.length,accepted:b.placements.filter(e=>e.accepted).length,blockedBy,blockerIds:ids,
    free:b.windows.at(-1).stats.free,cohorts:cohorts.map(c=>({anchor:c.anchor,exactCompletion:c.exactCompletion,finalSeq:c.final.seq,attached:c.final.faces.filter(q=>q>=0).length,states:c.final.states}))};
});}
if(require.main===module){const r=validate(JSON.parse(fs.readFileSync(process.argv[2])));for(const row of summarize(r))console.log(JSON.stringify(row));console.log(JSON.stringify({cpuSeconds:r.cpuSeconds,executedSteps:r.executedSteps,neutral:r.neutral}));}
module.exports={validate,summarize,exact};
