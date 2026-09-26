#!/usr/bin/env node
const fs=require('fs'),assert=require('assert/strict'),{sequence,partial}=require('./end_protection.js');
const {I_DOCK,I_REPEL,I_TPL,L,R}=require('../src/sim.js');
const key=r=>[r.seed,r.profile,r.mode,r.capFray].join(':');
function load(prefix){
  const m=JSON.parse(fs.readFileSync(prefix+'.manifest.json'));assert(m.complete&&m.completed===m.jobs.length,'Incomplete batch');
  const runs=fs.readFileSync(prefix+'.runs.jsonl','utf8').trim().split(/\r?\n/).map(JSON.parse),expected=new Map(m.jobs.map(j=>[key(j),j])),seen=new Set();
  assert.equal(expected.size,m.jobs.length);assert.equal(runs.length,m.jobs.length);
  for(const r of runs){assert(expected.has(key(r))&&!seen.has(key(r)),'Unknown/duplicate job');seen.add(key(r));assert.equal(r.steps,expected.get(key(r)).steps);
    const copy=r.mode==='copy',pair=['attached','detached'].includes(r.mode),text=pair?sequence+partial:sequence;
    const counts=Object.fromEntries(['A','B','P','Q'].map(c=>['n'+c,copy?(c==='A'||c==='B'?60:15):[...text].filter(x=>x===c).length]));
    for(const[k,v]of Object.entries({...counts,seed:r.seed,W:20,H:20,nE:0,nU:0,pFray:copy?0:0.00003,pUnzip:1,capFray:r.capFray,pUndock:0.1,pSoft:0,
      energyGate:true,compCopy:true,bendA:r.profile==='square'?0:-20,bendB:r.profile==='square'?0:20,stiffA:0.5,stiffB:0.5,stiffP:0.5,stiffQ:0.5}))assert.equal(r.params[k],v,k);
    const natural=!r.target;
    assert.equal(r.windows.length,r.steps/(natural?5000:10000));
    for(const[i,w]of r.windows.entries()){
      assert.equal(w.t,(i+1)*(natural?5000:10000));assert.equal(w.stats.t,w.t);assert.equal(w.stats.births,r.births.filter(b=>b.t<=w.t).length);
      if(natural){const used=new Set();let attached=0,linked=0;for(const row of w.rows){assert(row.units.length>=2&&row.units.length===row.seq.length);linked+=row.units.length;
        assert.equal(row.states.length,row.units.length);assert.equal(row.faces.length,row.units.length);assert(row.states.every(st=>[I_DOCK,I_REPEL,I_TPL].includes(st)));
        for(const u of row.units){assert(u>=0&&u<150&&!used.has(u));used.add(u);}
        assert.equal(row.attached,row.states.filter((st,i)=>st===I_DOCK&&row.faces[i]>=0).length);attached+=row.attached;
        const eligible=row.units.flatMap((u,j)=>row.states[j]!==I_DOCK&&row.faces[j]<0&&(j===0||j===row.units.length-1)&&(!'PQ'.includes(row.seq[j])||r.capFray>0)?[j]:[]);
        assert.deepEqual(row.eligible,eligible);}
        const singles=w.stats.docked-attached;assert(singles>=0);assert.equal(10+10*w.stats.births+w.stats.free+linked+singles,150);
      }else{assert.equal(w.states.length,r.target.length);assert(w.links>=0&&w.links<r.target.length);assert(w.free>=0&&w.free<=r.target.length);
        if(r.firstLoss===null||w.t<r.firstLoss)assert.equal(w.links,r.target.length-1);}
    }
    if(!natural){assert.equal(r.exact,r.births.filter(b=>b.seq===sequence&&b.parent===sequence).length);assert.equal(r.target.length,pair?8:10);
      const edge=(a,b)=>[a,b].sort((a,b)=>a-b).join(':'),edges=new Set(r.target.slice(0,-1).map((u,i)=>edge(u,r.target[i+1]))),lost=new Set();
      for(const e of r.losses){assert(e.t>0&&e.t<=r.steps&&[L,R].includes(e.i)&&[L,R].includes(e.j));const k=edge(e.u,e.v);assert(edges.has(k)&&!lost.has(k));lost.add(k);}
      assert.equal(r.firstLoss,r.losses[0]?.t??null);assert(r.firstFree===null||(r.firstLoss!==null&&r.firstFree>=r.firstLoss&&r.firstFree<=r.steps&&r.firstFree%100===0));
      assert(r.anchorLostAt===null||(r.anchorLostAt>0&&r.anchorLostAt<=r.steps));
    }
    if(copy){assert(r.births.every(b=>b.seq===sequence&&b.parent===sequence&&b.gen===1));}
  }return runs;
}
function summarize(runs){assert.equal(new Set(runs.map(key)).size,runs.length,'Duplicate run');
  for(const r of runs){const pair=runs.find(x=>x.seed===r.seed&&x.mode===r.mode&&x.capFray===r.capFray&&x.profile!==r.profile);assert(pair,'Missing shape control');
    const clean=p=>Object.fromEntries(Object.entries(p).filter(([k])=>!['bendA','bendB'].includes(k)));assert.deepEqual(clean(r.params),clean(pair.params));}
  for(const r of runs)for(const pair of runs.filter(x=>x.seed===r.seed&&x.mode===r.mode&&x.profile===r.profile)){
    const clean=p=>Object.fromEntries(Object.entries(p).filter(([k])=>k!=='capFray'));assert.deepEqual(clean(r.params),clean(pair.params),'Unexpected cap comparison');}
  return runs.map(r=>r.target?{seed:r.seed,profile:r.profile,mode:r.mode,cap:r.capFray,exact:r.exact,firstLoss:r.firstLoss,firstFree:r.firstFree,
    // For initially detached rows this raw field can describe a later re-formed face pair, not an original anchor.
    originalAnchorLostAt:r.mode==='attached'?r.anchorLostAt:null,finalLinks:r.windows.at(-1).links,finalFree:r.windows.at(-1).free}:
    {seed:r.seed,profile:r.profile,windows:r.windows.map(w=>({t:w.t,unfinished:w.rows.length,protected:w.rows.filter(x=>!x.eligible.length).length,
      capEnded:w.rows.filter(x=>/[PQ]/.test(x.seq)).length,units:w.rows.reduce((n,x)=>n+x.units.length,0),sequences:w.rows.map(x=>x.seq)}))});
}
if(require.main===module){assert(process.argv.length>2);for(const prefix of process.argv.slice(2))for(const r of summarize(load(prefix)))console.log(JSON.stringify(r));}
module.exports={load,summarize};
