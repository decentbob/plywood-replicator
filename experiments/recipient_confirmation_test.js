#!/usr/bin/env node
const assert=require('assert/strict');
const fs=require('fs'),path=require('path');
const {spec,evaluate,prepare,load}=require('./recipient_confirmation_summary.js');
const fixture=()=>spec.seeds.flatMap(seed=>spec.arms.map(arm=>({seed,arm,
  recipient:arm==='on'?5:0,producer:arm==='on'?5:0,producerGen2:arm==='on'?1:0,
  bound:arm==='on'?1:0,recipientDetachedExact:arm==='on'?1:0})));
assert.equal(evaluate(fixture()).confirmed,true,'inclusive numerical thresholds');
function fails(change,check){const rows=fixture();change(rows);const result=evaluate(rows);
  assert.equal(result.confirmed,false);assert.equal(result.seeds.filter(s=>s.pass).length,3,'no majority shortcut');
  if(check)assert.equal(result.seeds[0].checks[check],false);}
fails(r=>r[0].recipient=4,'binding');
fails(r=>r[1].recipient=1,'binding');fails(r=>r[2].recipient=1,'production');
fails(r=>r[0].producer=4,'producer');fails(r=>r[0].producerGen2=0,'producerGen2');
fails(r=>r[0].bound=0,'occupancy');
fails(r=>r[1].recipientDetachedExact=1,'detachedBinding');
fails(r=>r[2].recipientDetachedExact=1,'detachedProduction');
assert.throws(()=>evaluate(fixture().slice(1)));
const duplicate=fixture();duplicate[1]={...duplicate[0]};assert.throws(()=>evaluate(duplicate));
const old=fixture();old[0].seed=103;assert.throws(()=>evaluate(old),'screen seeds excluded');
const bad=fixture();bad[0].recipient=NaN;assert.throws(()=>evaluate(bad));
// Exercise protocol/file checks separately from simulation trajectories.
const scratch=path.join(__dirname,'scratch');fs.mkdirSync(scratch,{recursive:true});
const dir=fs.mkdtempSync(path.join(scratch,'RD_protocol_test-')),stem=path.join(dir,'fixture');
prepare(stem);assert.throws(()=>prepare(stem),/Output already exists/);
const protocol=JSON.parse(fs.readFileSync(stem+'.protocol.json'));
const manifest={started:new Date(Date.parse(protocol.created)+1000).toISOString(),complete:false,
  options:{steps:spec.steps,seeds:spec.seeds.join(','),arms:spec.arms.join(',')}};
fs.writeFileSync(stem+'.runs.jsonl','{}\n');
function rejected(change,pattern){const p=structuredClone(protocol),m=structuredClone(manifest);change(p,m);
  fs.writeFileSync(stem+'.protocol.json',JSON.stringify(p));fs.writeFileSync(stem+'.manifest.json',JSON.stringify(m));
  assert.throws(()=>load(stem),pattern);}
rejected(()=>{},/Incomplete batch/);
rejected(p=>p.spec.minimumRecipientDifference=4,/Changed confirmation criteria/);
rejected((p,m)=>m.started=new Date(Date.parse(p.created)-1).toISOString(),/Protocol must precede/);
rejected(p=>p.sources['src/sim.js']='changed',/Protocol source/);
rejected((p,m)=>m.options.steps=10000);
rejected((p,m)=>m.options.seeds='103,104');
console.log('confirmation decisions and provenance: thresholds, every-seed gate, detached output, complete matrix and protocol checks passed');
