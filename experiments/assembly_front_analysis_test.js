#!/usr/bin/env node
const assert=require('assert/strict'),fs=require('fs');
const {validateBatch,summarize}=require('./assembly_front_summary');
const {validate:validateAnchor}=require('./anchor_access_summary');
const {geometry}=require('./anchor_access');
const {F,L,R}=require('../src/sim');
const prefix=process.argv[2]||'experiments/out/AF_screen',anchor=process.argv[3]||'experiments/out/AA_selected.json';
const m=JSON.parse(fs.readFileSync(prefix+'.manifest.json')),rs=fs.readFileSync(prefix+'.runs.jsonl','utf8').trim().split(/\r?\n/).map(JSON.parse);
validateBatch(m,rs);summarize(rs);
const bad=change=>{const mm=structuredClone(m),rr=structuredClone(rs);change(mm,rr);assert.throws(()=>validateBatch(mm,rr));};
bad(m=>m.complete=false);bad(m=>m.jobs.pop());bad((m,r)=>r.push(r[0]));bad((m,r)=>r[0].arm='wrong');
bad((m,r)=>r[0].params.pUndock=0.4);bad((m,r)=>r[0].windows[0].stats.free++);bad((m,r)=>r[0].exact++);
bad(m=>m.sources['assembly_front.js']='0'.repeat(64));
assert.throws(()=>summarize(rs.slice(1)));
const a=JSON.parse(fs.readFileSync(anchor));validateAnchor(a);
for(const change of [x=>x.occupancy[2].free++,x=>x.counts.site2.accepted++,x=>x.neutral=false,x=>x.referenceSha256='bad']){
  const x=structuredClone(a);change(x);assert.throws(()=>validateAnchor(x));}
// Independent geometric fixtures isolate each first failed gate.
const fake={size:[1,1],p:{linkDistTol:0.2,distTol:0.2},cosTol:0.8,cosLinkTol:0.9,cosTolRot:0.95,
  _side(u,i,out){return Object.assign(out,u?[ -0.5,0,-1,0 ]:[0.5,0,1,0]);}};
assert.equal(geometry(fake,0,F,1,F,1,0,1),'pass');assert.equal(geometry(fake,0,R,1,L,2,0,2),'gap');
fake._side=(u,i,out)=>Object.assign(out,u?[-0.5,0,0,1]:[0.5,0,1,0]);
assert.equal(geometry(fake,0,F,1,F,1,0,1),'bearing');assert.equal(geometry(fake,0,R,1,L,1,0,1),'angle');
console.log('PASS: complete grid, raw graph/material reconstruction, source hashes, gate partitions, geometry fixtures and corrupted-data rejection');
