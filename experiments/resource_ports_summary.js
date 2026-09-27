#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),zlib=require('zlib'),assert=require('assert/strict');
const {PortSim,idealCases,summarize,snapshot,advance,hash,digest}=require('./resource_ports');
const normalize=x=>JSON.parse(JSON.stringify(x));
function load(file){const raw=fs.readFileSync(file);return JSON.parse((file.endsWith('.gz')?zlib.gunzipSync(raw):raw).toString());}
function validate(r,{replay=true}={}){
  assert.equal(r.schema,1);
  const sources=['src/sim.js','experiments/resource_economy.js','experiments/resource_ports.js','experiments/resource_ports_plan.md'];
  assert.deepEqual(Object.keys(r.provenance.sources).sort(),sources.sort());
  for(const [f,h]of Object.entries(r.provenance.sources)){
    const raw=fs.readFileSync(path.join(__dirname,'..',f)),lf=raw.toString().replace(/\r\n/g,'\n');
    assert([hash(raw),hash(lf),hash(lf.replace(/\n/g,'\r\n'))].includes(h),'Source changed: '+f);
  }
  assert.deepEqual(r.ideal,normalize(idealCases()),'Ideal graph/geometry records changed');
  assert(r.ideal.every(c=>c.fronts.every(f=>f.contacts.every(q=>q.compatible&&q.pinGap<1e-8))),'Front port contract fails');
  assert.equal(r.physical.length,120);assert.equal(r.steric.length,16);
  assert.equal(new Set(r.physical.map(c=>[c.proxy,c.fixture,c.first,c.seed,c.scheme].join('/'))).size,120);
  assert.equal(new Set(r.steric.map(c=>[c.proxy,c.kind,c.orientation,c.iters].join('/'))).size,16);
  for(const c of [...r.physical,...r.steric]){
    assert.equal(c.initialHash,digest(c.initial));assert.equal(c.finalHash,digest(c.final));
    assert.deepEqual(c.initial.p,c.final.p);assert.equal(c.initial.nums.n,c.final.nums.n);
    for(const k of ['type','bond','w','wr','size','nv','rx','ry','edgeOf'])assert.deepEqual(c.initial.arrays[k],c.final.arrays[k],'Material, geometry or prepared bonds changed');
    assert.equal(c.final.nums.birthCount,0);assert.equal(c.final.nums.t,c.samples?100:10);
    const s=PortSim.fromState(c.initial),samples=c.samples||[c.before,c.after],target=c.target;
    assert.deepEqual(s.check(),[]);
    assert.deepEqual(snapshot(s,target),samples[0]);
    if(c.slotFree!==undefined)assert.equal(s._slotFree(0,s.px[0],s.py[0]),c.slotFree);
    if(!replay)continue;
    for(let t=1;t<=c.final.nums.t;t++){
      advance(s);const stored=samples.find(w=>w.t===t);if(stored)assert.deepEqual(snapshot(s,target),stored,'Physics replay differs');
    }
    const actual=s.saveState(),expected=normalize(c.final);
    // Restore rebuilds the pin cache; its version is not a physical variable.
    delete actual.nums.pinsVersion;delete expected.nums.pinsVersion;
    assert.deepEqual(actual,expected,'Final physical arrays / RNG differ');
  }
  return summarize(r);
}
function distance(polygons){const centers=polygons.map(ps=>ps.reduce((a,p)=>[a[0]+p[0]/ps.length,a[1]+p[1]/ps.length],[0,0]));
  return Math.hypot(centers[0][0]-centers[1][0],centers[0][1]-centers[1][1]);}
function details(r){
  return {steric:r.steric.map(c=>({proxy:c.proxy,kind:c.kind,direction:c.orientation,iters:c.iters,slotFree:c.slotFree,
    initialDistance:distance(c.before.polygons),finalDistance:distance(c.after.polygons),initialOverlap:c.before.maxHullOverlap,finalOverlap:c.after.maxHullOverlap})),
    totals:['area','long'].map(proxy=>{const cs=r.ideal.filter(c=>c.proxy===proxy),fronts=cs.flatMap(c=>c.fronts);return {proxy,
      contacts:cs.reduce((a,c)=>a+c.contacts.length,0),excludedContacts:cs.flatMap(c=>c.contacts).filter(q=>!q.centreGate||!q.neighbor).length,
      fronts:fronts.length,excludedFrontContacts:fronts.flatMap(f=>f.contacts).filter(q=>!q.centreGate||!q.neighbor).length,
      rejectedFrontPlacements:fronts.filter(f=>!f.slotFree).length};})};
}
if(require.main===module){const r=load(process.argv[2]),s=validate(r);
  console.log(JSON.stringify({portLayoutPass:s.portLayoutPass,directMechanicsPass:s.directMechanicsPass,cpuSeconds:r.provenance.cpuSeconds}));
  console.table(details(r).totals);console.table(details(r).steric);
  if(process.argv[3])fs.writeFileSync(process.argv[3],JSON.stringify({summary:s,details:details(r)},null,2)+'\n',{flag:'wx'});
}
module.exports={load,validate,details};
