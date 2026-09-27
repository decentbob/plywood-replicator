#!/usr/bin/env node
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const {Sim}=require('../src/sim.js');
const {setup,metrics,hash,digest,complement}=require('./sequence_shape.js');
const key=r=>[r.seed,r.sequence,r.profile,r.grip].join('/');
function validate(m,rs){
  assert(m.complete&&m.completed===m.jobs.length&&rs.length===m.jobs.length,'Incomplete batch');
  assert.equal(new Set(rs.map(key)).size,rs.length,'Duplicate world');
  assert.deepEqual(rs.map(key).sort(),m.jobs.map(key).sort(),'Missing or unexpected world');
  assert.deepEqual(Object.keys(m.sources).sort(),['src/sim.js','experiments/sequence_shape.js','experiments/sequence_shape_plan.md'].sort(),'Missing source provenance');
  for(const [f,h]of Object.entries(m.sources)){
    const raw=fs.readFileSync(path.join(__dirname,'..',f));
    const lf=raw.toString().replace(/\r\n/g,'\n');
    assert([hash(raw),hash(lf),hash(lf.replace(/\n/g,'\r\n'))].includes(h),'Source changed: '+f);
  }
  for(const r of rs){
    const j=m.jobs.find(j=>key(j)===key(r)),{s}=setup(j);
    assert.equal(r.steps,j.steps);assert.deepEqual(r.params,JSON.parse(JSON.stringify(s.p)));
    assert.equal(r.initialHash,digest(s.saveState()));assert.equal(r.finalHash,digest(r.finalState));
    assert.deepEqual(r.finalState.p,r.params);assert.equal(r.finalState.nums.t,r.steps);
    assert.deepEqual(r.finalState.arrays.type,s.saveState().arrays.type,'Material types changed');
    assert.equal(r.finalState.nums.n,160);
    assert.deepEqual(Sim.fromState(r.finalState).check(),[]);
    assert.equal(r.samples.length,r.steps/100);
    r.samples.forEach((w,i)=>{assert.equal(w.t,(i+1)*100);assert.equal(Object.values(w.material).reduce((a,b)=>a+b,0),120);
      assert(Object.values(w.material).every(n=>Number.isInteger(n)&&n>=0));assert(Number.isFinite(w.bends)&&w.bends>=0&&w.joints>=0);});
    assert.equal(r.births.length,r.finalState.nums.birthCount);assert.equal(r.rows.length,4+r.births.length);
    assert.equal(r.events.filter(e=>e.kind==='rearm').length,r.finalState.nums.fuelUsed);
    assert.equal(r.samples.at(-1).fuelUsed,r.finalState.nums.fuelUsed);
    assert.equal(r.events.filter(e=>e.kind==='row').length,r.rows.length);
    const latestRelease=new Map(),live=new Map(),recorded=new Set();let previous=0;
    for(const e of r.events){
      assert(e.t>=previous&&e.t<=r.steps);previous=e.t;
      if(e.kind==='release'){assert(e.row===null||live.get(e.unit)===e.row);latestRelease.set(e.u,{t:e.t,unit:e.unit,row:e.row});}
      if(e.kind==='retire'){
        const p=r.rows[e.id];assert(recorded.has(e.id));assert.equal(p.lost,e.t);assert.equal(p.loss,e.reason);
        p.units.forEach(u=>{if(live.get(u)===p.id)live.delete(u);});
      }
      if(e.kind==='row'){
        const p=r.rows[e.id];assert(!recorded.has(e.id));recorded.add(e.id);
        assert.equal(p.id,e.id);assert.equal(p.born,e.t);assert.deepEqual(p.units,e.units);assert.equal(p.parent,e.parent);assert.equal(p.depth,e.depth);
        assert.equal(new Set(p.units).size,p.units.length);assert.equal(p.seq.length,p.units.length);
        if(p.born){
          assert.deepEqual(p.provenance,p.units.map(u=>latestRelease.get(u)??null));
          if(p.parent!==null){
            const par=r.rows[p.parent];assert(par.born<=p.born&&(par.lost===null||par.lost>=p.born));
            assert(p.provenance.every((v,i)=>v.row===par.id&&v.unit===par.units.at(-1-i)&&live.get(v.unit)===par.id));
            assert.equal(p.units.length,par.units.length);assert(p.units.every(u=>!par.units.includes(u)));
          }
          const exact=p.parent!==null&&p.detached&&p.seq===complement(r.rows[p.parent].seq);
          assert.equal(p.exact,exact);assert.equal(p.depth,exact&&r.rows[p.parent].depth!==null?r.rows[p.parent].depth+1:null);
          const b=r.births[p.id-4];assert.equal(b.t,p.born);assert.equal(b.seq,p.seq);
        }else {assert.equal(p.depth,0);assert.equal(p.seq,r.sequence);}
        p.units.forEach(u=>{assert(!live.has(u));live.set(u,p.id);});
        assert(p.fullAt===null||(p.fullAt>=p.born&&p.fullAt<=r.steps&&(p.lost===null||p.fullAt<=p.lost)));
        assert(p.lost===null||(p.lost>=p.born&&p.lost<=r.steps));
      }
    }
    for(const p of r.rows){
      assert.deepEqual(p.children,r.rows.filter(c=>c.parent===p.id).map(c=>c.id));
      assert.equal(p.lost===null,p.units.every(u=>live.get(u)===p.id));
    }
    assert.deepEqual(r.metrics,metrics(r),'Metrics disagree with raw histories');
    if(!r.grip){assert.equal(r.metrics.fuel,0);assert.equal(r.metrics.primary,0);}
  }
  return rs.map(r=>({seed:r.seed,sequence:r.sequence,profile:r.profile,grip:r.grip,...r.metrics}));
}
function decision(rs){
  const seeds=[...new Set(rs.map(r=>r.seed))];
  if(rs.length!==seeds.length*8)return {kind:'viability',pass:['AAAABBBB','ABABABAB'].every(seq=>rs.some(r=>r.sequence===seq&&r.metrics.founderChildren>0))};
  const lead=['AAAABBBB','ABABABAB'].filter(sequence=>seeds.every(seed=>{
    const other=sequence==='AAAABBBB'?'ABABABAB':'AAAABBBB';
    const n=(q,p,g)=>rs.find(r=>r.seed===seed&&r.sequence===q&&r.profile===p&&r.grip===g).metrics.primary;
    const on=n(sequence,'opposed20',true),diff=on-n(other,'opposed20',true);
    return on>=2&&diff>=2&&diff>n(sequence,'square',true)-n(other,'square',true)&&on-n(sequence,'opposed20',false)>=2;
  }));
  return {kind:'screen',lead,anySecondCycle:rs.some(r=>r.metrics.secondCycle>0)};
}
function load(stem){return {m:JSON.parse(fs.readFileSync(stem+'.manifest.json','utf8')),
  rs:fs.readFileSync(stem+'.runs.jsonl','utf8').trim().split(/\r?\n/).filter(Boolean).map(JSON.parse)};}
if(require.main===module){const {m,rs}=load(process.argv[2]);const rows=validate(m,rs);
  console.table(rows);console.log(JSON.stringify({decision:decision(rs),cpuSeconds:m.cpuSeconds}));
  if(process.argv[3]){const cols=Object.keys(rows[0]);fs.writeFileSync(process.argv[3],cols.join(',')+'\n'+rows.map(r=>cols.map(k=>r[k]).join(',')).join('\n')+'\n',{flag:'wx'});}}
module.exports={validate,decision,load};
