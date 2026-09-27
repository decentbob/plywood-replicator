#!/usr/bin/env node
// Independent indexed queries against the historical rows/events, plus report corruption.
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const {load}=require('./sequence_shape_summary.js');
const {verify}=require('./short_variant_summary.js');
const file=process.argv[2];assert(file,'Pass the archived census JSON');
const report=verify(file), {rs}=load(path.join(__dirname,'out/SS_screen_20260927'));
for(const r of rs){
  const w=report.result.worlds.find(w=>w.seed===r.seed&&w.sequence===r.sequence&&w.profile===r.profile&&w.grip===r.grip);
  const rowIndex=new Map(r.events.map((e,i)=>[e.kind==='row'?e.id:-1,i]));
  const expected=[];
  for(const p of r.rows.filter(p=>p.born>0&&p.detached&&p.seq.length<8&&p.fullAt!==null)){
    for(const id of p.children){
      const child=r.rows[id];
      if(!child.exact||!child.detached||child.born<p.fullAt)continue;
      const end=rowIndex.get(id),begin=rowIndex.get(p.id);
      assert(!r.events.slice(begin+1,end).some(e=>e.kind==='retire'&&e.id===p.id));
      const fuel=p.units.every(u=>{
        let release=-1;
        for(let i=0;i<begin;i++)if(r.events[i].kind==='release'&&r.events[i].u===u)release=i;
        return release>=0&&r.events.slice(release+1,end).some(e=>e.kind==='rearm'&&e.u===u);
      });
      if(fuel)expected.push([p.id,id]);
    }
  }
  assert.deepEqual(w.edges.map(e=>[e.parent,e.child]).sort(),expected.sort());
  const chains=expected.flatMap(([a,b])=>expected.filter(([p])=>p===b).map(([,c])=>[a,b,c]));
  assert.deepEqual(w.chains.map(c=>c.rows).sort(),chains.sort());
  assert.equal(w.calibrationEightParents,r.metrics.primary,'Eight-letter positive control');
}
const dir=fs.mkdtempSync(path.join(__dirname,'scratch/SV_corruption_'));
const mutations=[
  r=>{r.inputs[Object.keys(r.inputs)[0]]='bad';},
  r=>{r.sources[Object.keys(r.sources)[0]]='bad';},
  r=>{r.result.decision.pass=!r.result.decision.pass;},
  r=>{r.result.worlds.find(w=>w.chains.length).chains[0].rows[0]=-1;},
  r=>{r.result.worlds.pop();},
  r=>{r.result.worlds[0].totals.primary++;}
];
for(let i=0;i<mutations.length;i++){
  const r=structuredClone(report);mutations[i](r);
  const f=path.join(dir,`${i}.json`);fs.writeFileSync(f,JSON.stringify(r));assert.throws(()=>verify(f));
}
console.log('Independent edge/chain reconstruction, eight-letter calibration and six corruptions pass.');
