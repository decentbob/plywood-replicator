#!/usr/bin/env node
const assert=require('assert/strict');
const {Sim}=require('../src/sim.js');
const {setup}=require('./short_variant_garden.js');
const {load,validate}=require('./short_variant_garden_summary.js');
const {m,rs}=load(process.argv[2]);validate(m,rs);
const physical=state=>{const s=structuredClone(state);delete s.nums.pinsVersion;return s;};
for(const r of rs){
  // Independent parent-centric queries, rather than the census event stream.
  const indices=new Map(r.events.flatMap((e,i)=>e.kind==='row'?[[e.id,i]]:[]));
  const productive=[];
  for(const p of r.rows.filter(p=>p.born&&p.depth!==null&&p.detached&&p.fullAt!==null)){
    const good=p.children.some(id=>{
      const c=r.rows[id];if(c.depth===null||!c.detached||c.born<p.fullAt)return false;
      const end=indices.get(id),start=indices.get(p.id);
      if(r.events.slice(start+1,end).some(e=>e.kind==='retire'&&e.id===p.id))return false;
      return p.units.every(u=>{
        let release=-1;for(let i=0;i<start;i++)if(r.events[i].kind==='release'&&r.events[i].u===u)release=i;
        return release>=0&&r.events.slice(release+1,end).some(e=>e.kind==='rearm'&&e.u===u);
      });
    });
    if(good)productive.push(p.id);
  }
  assert.equal(productive.length,r.metrics.primary,'Independent primary reconstruction');
  for(const cp of r.checkpoints){
    const s=Sim.fromState(cp.state);s.run(500);assert.deepEqual(physical(s.saveState()),physical(cp.after500));
  }
}
const clone=x=>structuredClone(x);
function reject(change){const mm=clone(m),rr=clone(rs);change(mm,rr);assert.throws(()=>validate(mm,rr));}
reject(mm=>mm.complete=false);reject(mm=>mm.sources={});reject((mm,rr)=>rr.pop());
reject((mm,rr)=>rr[0].params.pFray=0);reject((mm,rr)=>rr[0].metrics.primary++);
reject((mm,rr)=>rr[0].samples[0].material.free++);
reject((mm,rr)=>rr[0].rows[0].children.push(999));
reject((mm,rr)=>rr[0].events.find(e=>e.kind==='row').faces[0]=999);
reject((mm,rr)=>rr[0].events.find(e=>e.kind==='bond+').v=-1);
const fuel=rs.find(r=>r.events.some(e=>e.kind==='rearm'));
assert(fuel,'Measured fuel events required for holder calibration');
const fi=rs.indexOf(fuel);
reject((mm,rr)=>rr[fi].events.find(e=>e.kind==='rearm').holders.pop());
reject((mm,rr)=>rr[fi].events.find(e=>e.kind==='rearm').u=159);
reject((mm,rr)=>rr[fi].rows.find(p=>p.born&&p.parent!==null).provenance[0].unit=-1);
if(process.argv.includes('--replay')){
  const r=rs.filter(r=>r.sequence==='ABABA'&&r.profile==='opposed20'&&r.grip).sort((a,b)=>a.seed-b.seed)[0];
  const {s}=setup(r);s.run(r.steps);assert.deepEqual(s.saveState(),r.finalState,'Full observed/plain replay');
  console.log(`Full unobserved replay matches: ${r.seed}/${r.sequence}/${r.profile}/${r.steps}`);
}
console.log(`PASS: ${rs.length} independent primaries and checkpoint restarts; twelve corruption checks`);
