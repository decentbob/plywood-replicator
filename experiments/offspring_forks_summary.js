#!/usr/bin/env node
const fs=require('fs'),assert=require('assert/strict'),{arms}=require('./offspring_forks.js');
const key=r=>r.seed+':'+r.profile;
function load(prefix){
  const m=JSON.parse(fs.readFileSync(prefix+'.manifest.json'));assert(m.complete&&m.completed===m.jobs.length,'Incomplete batch');
  const runs=fs.readFileSync(prefix+'.runs.jsonl','utf8').trim().split(/\r?\n/).map(JSON.parse),seen=new Set(),expected=new Set(m.jobs.map(key));
  assert.equal(expected.size,m.jobs.length);assert.equal(runs.length,m.jobs.length);
  for(const r of runs){assert(expected.has(key(r))&&!seen.has(key(r)));seen.add(key(r));assert.equal(r.steps,m.options.steps);assert.equal(r.forkAt,m.options.forkAt);
    assert(/^[a-f0-9]{64}$/.test(r.sourceStateHash));assert.deepEqual(r.arms.map(a=>a.arm).sort(),Object.keys(arms).sort());
    const base=r.arms.find(a=>a.arm==='control'),owners=new Map();for(const [i,row]of r.cohort.entries()){
      assert(row.born>0&&row.born<=r.forkAt&&row.seq==='AAAABBBB'&&row.units.length===8);
      for(const u of row.units){assert(!owners.has(u)&&u>=0&&u<120);owners.set(u,i);}}
    for(const[k,v]of Object.entries({seed:r.seed,nA:60,nB:60,nU:40,nE:0,W:18,H:18,pGrip:0.2,energyGate:true,pFray:0,pUnzip:0,
      bendA:r.profile==='square'?0:-20,bendB:r.profile==='square'?0:20,iters:4}))assert.equal(base.params[k],v,k);
    for(const a of r.arms){assert.deepEqual(a.params,{...base.params,...arms[a.arm]},'Unexpected intervention');assert.equal(a.start,r.forkAt);assert.equal(a.steps,r.steps);
      assert.deepEqual(a.initial,base.initial);assert.equal(a.initial.t,r.forkAt);assert.equal(a.lost.length,r.cohort.length);
      assert(a.lost.every(t=>t===null||(t>r.forkAt&&t<=r.forkAt+r.steps)));
      if(!arms[a.arm].pFray)assert(a.lost.every(t=>t===null));
      for(const b of a.births){assert(b.t>r.forkAt&&b.t<=r.forkAt+r.steps);assert.equal(b.units.length,b.seq.length);assert.equal(b.parents.length,b.units.length);
        assert.equal(new Set(b.units).size,b.units.length);assert(b.units.every(u=>u>=0&&u<120));
        if(b.cohortParent!==null){const p=b.cohortParent;assert(Number.isInteger(p)&&r.cohort[p]);assert(b.parents.every(u=>owners.get(u)===p));assert(a.lost[p]===null||a.lost[p]>b.t);assert.equal(b.parent,r.cohort[p].seq);}}
      assert.equal(a.exactCohort,a.births.filter(b=>b.cohortParent!==null&&b.seq==='AAAABBBB'&&b.parent==='AAAABBBB').length);
      assert.equal(a.windows.length,r.steps/10000);for(const [i,w]of a.windows.entries()){
        assert.equal(w.stats.t,r.forkAt+(i+1)*10000);assert.equal(w.stats.births,a.initial.births+a.births.filter(b=>b.t<=w.stats.t).length);
        assert.equal(w.intact,a.lost.filter(t=>t===null||t>w.stats.t).length);assert(w.stats.free>=0&&w.stats.free<=120);}
    }
  }return runs;
}
function summarize(runs){assert.equal(new Set(runs.map(key)).size,runs.length,'Duplicate run');
  for(const seed of new Set(runs.map(r=>r.seed))){const pair=runs.filter(r=>r.seed===seed);assert.equal(pair.length,2,'Missing shape');
    const clean=p=>Object.fromEntries(Object.entries(p).filter(([k])=>!['bendA','bendB'].includes(k)));assert.deepEqual(clean(pair[0].arms[0].params),clean(pair[1].arms[0].params));}
  return runs.map(r=>({seed:r.seed,profile:r.profile,cohort:r.cohort.length,arms:r.arms.map(a=>({arm:a.arm,total:a.births.length,exactCohort:a.exactCohort,
    exactFamily:a.births.filter(b=>b.seq==='AAAABBBB'&&b.parent==='AAAABBBB').length,meanLength:a.births.length?a.births.reduce((n,b)=>n+b.seq.length,0)/a.births.length:null,
    intact:a.lost.filter(t=>t===null).length,free:a.windows.at(-1).stats.free,frays:a.windows.at(-1).stats.frays-a.initial.frays,
    sequences:[...new Set(a.births.map(b=>b.seq))]}))}));}
if(require.main===module){assert(process.argv.length>2);for(const r of summarize(process.argv.slice(2).flatMap(load)))console.log(JSON.stringify(r));}
module.exports={load,summarize};
