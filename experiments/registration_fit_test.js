#!/usr/bin/env node
const fs=require('fs'),assert=require('assert/strict');
const {NV,Sim}=require('../src/sim');
const {arms,start,watch,deformation}=require('./registration_fit');
const {validate,summary,history}=require('./registration_fit_summary');
const r=validate(JSON.parse(fs.readFileSync(process.argv[2]||'experiments/out/RF_selected.json')));
for(const p of r.prepared)for(const a of arms){
  const s=start(p,a),before=Sim.fromState(p.state).saveState(),after=s.saveState();
  assert.deepEqual(after.arrays,before.arrays);assert.deepEqual(after.rng,before.rng);assert.deepEqual(after.nums,before.nums);
  const expected={...before.p,iters:a.iters};for(const c of ['A','B','P','Q'])expected['stiff'+c]=a.stiff;assert.deepEqual(after.p,expected);
  const plain=start(p,a),observed=start(p,a);watch(observed,p);plain.run(300);observed.run(300);assert.deepEqual(observed.saveState(),plain.saveState());
}
// Corner-error measurement is rotation/translation invariant, vanishes at rest,
// and responds to actual deformation rather than a parameter value.
const p=r.prepared[0],s=start(p,arms[0]),u=p.target[0];s._resetShape(u);assert(deformation(s,[u]).rms<1e-12);
for(let k=0;k<s.corners(u);k++){const q=u*NV+k,x=s.ox[q],y=s.oy[q];s.ox[q]=-y+0.4;s.oy[q]=x-0.7;}
assert(deformation(s,[u]).rms<1e-12);s.ox[u*NV]+=0.2;assert(deformation(s,[u]).rms>0.01);
let rejected=0;const bad=change=>{const x=structuredClone(r);change(x);assert.throws(()=>validate(x));rejected++;};
bad(x=>x.neutral=false);bad(x=>x.inputHash='0'.repeat(64));bad(x=>x.sources['src/sim.js']='0'.repeat(64));bad(x=>x.results.pop());
bad(x=>x.results.reverse());bad(x=>x.results[1].stiff=0.5);bad(x=>x.results[1].initial.rng++);bad(x=>x.prepared[0].target.pop());
bad(x=>x.results[0].events.find(e=>e.kind==='endpoint-redock').face=-1);
bad(x=>x.results[0].settled.pop());bad(x=>x.results[0].windows[0].rows.pop());bad(x=>x.results[0].windows[0].stats.free++);
bad(x=>x.results[0].shape[0].rms=1);bad(x=>x.results[0].shape[1].perUnit[0].rms=-1);
bad(x=>x.results[0].checks[0].site=99);bad(x=>x.results[0].placements[0].accepted=false);
const result=summary(r);assert.equal(result.qualifies,false);assert(result.rows.every(x=>!x.targetExact));
assert(result.rows.filter(x=>x.profile==='square').every(x=>x.firstReturn.site===4&&x.target[0].seq==='PAAAABBBQ'));
assert(result.rows.filter(x=>x.profile==='opposed20').every(x=>x.firstReturn.site===2));
const es=history(JSON.parse(fs.readFileSync(r.input))).flatMap(x=>x.episodes);assert.equal(es.length,25);assert.equal(es.filter(x=>x.wait===1).length,21);assert.equal(es.filter(x=>x.from!==x.to).length,2);
console.log(`PASS: all eight initial-state matches and observer-neutrality checks, physical shape metric, SEEK-start graph reconstruction, historical episodes and ${rejected} corruption cases`);
