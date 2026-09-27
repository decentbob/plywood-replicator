#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const base=require('./resource_ports'),{PolygonContactSim}=require('./polygon_contact_physics');
const {INPUT,SOURCES,load,canonical,snapshot,staticCases,runCase,summarize}=require('./polygon_contact');
const norm=x=>JSON.parse(JSON.stringify(x));
function validate(r,{replay=true}={}){
  assert.equal(r.schema,1);assert.equal(r.provenance.input,INPUT);
  const root=path.join(__dirname,'..'),input=load(path.join(root,INPUT));
  assert.equal(r.provenance.inputHash,base.hash(fs.readFileSync(path.join(root,INPUT))));
  assert.deepEqual(Object.keys(r.provenance.sources).sort(),[...SOURCES].sort());
  for(const [f,h] of Object.entries(r.provenance.sources)){
    const b=fs.readFileSync(path.join(root,f)),lf=b.toString().replace(/\r\n/g,'\n');
    assert([base.hash(b),base.hash(lf),base.hash(lf.replace(/\n/g,'\r\n'))].includes(h),'Source changed: '+f);
  }
  assert.deepEqual(r.ideal,norm(staticCases(input)),'Static contacts or placements changed');
  assert.equal(r.runs.length,272);assert.equal(r.provenance.physicsSteps,24320);
  let index=0;
  for(const kind of ['physical','steric'])for(const original of input[kind])for(const arm of ['baseline','polygon']){
    const c=r.runs[index++],Class=arm==='polygon'?PolygonContactSim:base.PortSim;
    const key=kind==='physical'?[original.proxy,original.fixture,original.first,original.seed,original.scheme].join('/'):
      [original.proxy,original.kind,original.orientation,original.iters].join('/');
    assert.equal(c.key,key);assert.equal(c.arm,arm);assert.equal(c.kind,kind);
    assert.equal(c.proxy,original.proxy);assert.equal(c.fixture,original.fixture||original.kind);
    assert.equal(c.scheme,original.scheme||`zero${original.iters}`);
    for(const k of ['first','seed','orientation','iters'])assert.equal(c[k],original[k]);
    assert.deepEqual(c.target,original.target||null);
    assert.equal(c.initialHash,base.digest(c.initial));assert.equal(c.finalHash,base.digest(c.final));
    assert.deepEqual(canonical(c.initial),canonical(original.initial),'Initial preparation changed');
    assert.deepEqual(c.initial.p,c.final.p);
    for(const k of ['type','bond','w','wr','size','nv','rx','ry','edgeOf'])assert.deepEqual(c.initial.arrays[k],c.final.arrays[k]);
    assert.equal(c.initial.nums.n,c.final.nums.n);assert.equal(c.final.nums.birthCount,0);
    const times=kind==='physical'?[0,1,10,100]:[0,1,10];
    assert.deepEqual(c.samples.map(q=>q.t),times);assert.equal(c.final.nums.t,times.at(-1));
    const start=Class.fromState(c.initial),end=Class.fromState(c.final);
    assert.deepEqual(start.check(),[]);assert.deepEqual(end.check(),[]);
    assert.deepEqual(snapshot(start,c.target,arm),c.samples[0]);assert.deepEqual(snapshot(end,c.target,arm),c.samples.at(-1));
    assert.equal(c.slotFree,kind==='steric'?start._slotFree(0,start.px[0],start.py[0]):null);
    if(arm==='baseline')assert.deepEqual(canonical(c.final),canonical(original.final));
    if(replay)assert.deepEqual(norm(runCase(original,arm,kind)),c,'Full fixture replay differs');
  }
  assert.deepEqual(r.summary,norm(summarize(r)),'Summary or gates changed');
  return r.summary;
}
if(require.main===module){const r=load(process.argv[2]),s=validate(r);console.log(JSON.stringify({gates:s.gates,counts:s.counts,cpuSeconds:r.provenance.cpuSeconds}));
  console.table(s.groups.filter(c=>c.scheme==='individual16'));}
module.exports={validate};
