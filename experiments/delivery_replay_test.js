#!/usr/bin/env node
const fs=require('fs'),path=require('path'),zlib=require('zlib'),assert=require('assert/strict');
const {Sim}=require('../src/sim.js');
const {hash,physicalHash}=require('./recipient_dependence.js');
const {criteria,costGate,historicalAgreement}=require('./delivery_replay.js');
const {checkRecord}=require('./delivery_diagnostic_analysis_test.js');
function boundaries(){
  assert(costGate(45,1024**3).pass);assert(!costGate(45.001,1).pass);assert(!costGate(1,1024**3+1).pass);
  const r={initialHash:'h',params:{},steps:10000,samples:[{t:100}],births:[{t:100}],
    members:[{t:100,at5k:{t:5100}},{t:9000,at5k:null}]};
  const old={...r,members:[r.members[0],{t:9000,at5k:{t:14000}}]};
  assert.equal(historicalAgreement(r,old).fullFinalState,false);
  for(const mutate of [x=>x.initialHash='bad',x=>x.samples[0].t++,x=>x.births=[],x=>x.members[0].at5k=null]){
    const x=structuredClone(r);mutate(x);assert.throws(()=>historicalAgreement(x,old));
  }
  const final={...r,steps:50000,finalState:{rng:5}};
  assert(historicalAgreement(final,final).fullFinalState);
  assert.throws(()=>historicalAgreement({...final,finalState:{rng:6}},final));
}
function verify(dir){
  boundaries();const m=JSON.parse(fs.readFileSync(path.join(dir,'manifest.json')));
  assert.equal(m.schema,1);assert.equal(m.kind,'delivery-replay');assert.deepEqual(m.criteria,criteria);
  assert.deepEqual(m.jobs,criteria.seeds.flatMap(seed=>criteria.arms.map(arm=>({seed,arm}))));
  for(const [file,h]of Object.entries({...m.sources,...m.inputs}))assert.equal(hash(fs.readFileSync(file)),h,file);
  const originals=fs.readFileSync('experiments/out/RD_dependence_confirm.runs.jsonl','utf8').trim().split(/\r?\n/).map(JSON.parse);
  const seen=new Set();let steps=0;
  for(const item of m.records){
    const raw=fs.readFileSync(path.join(dir,item.file));assert.equal(hash(raw),item.sha256);assert.equal(raw.length,item.bytes);
    const r=JSON.parse(zlib.gunzipSync(raw)),key=r.seed+':'+r.arm;
    assert(!seen.has(key));seen.add(key);assert.equal(item.seed,r.seed);assert.equal(item.arm,r.arm);assert.equal(item.steps,r.steps);
    assert.equal(r.finalState.nums.t,r.steps);assert.equal(physicalHash(Sim.fromState(r.initialState)),r.initialHash);
    assert.deepEqual(Sim.fromState(r.finalState).check(),[]);assert.deepEqual(r.initialState.arrays.type,r.finalState.arrays.type);
    const expected=originals.find(o=>o.seed===r.seed&&o.arm===r.arm);assert(expected);
    assert.deepEqual(historicalAgreement(r,expected),r.agreement);assert.deepEqual(item.agreement,r.agreement);
    checkRecord(r);assert.equal(r.observer.samples.length,r.steps);
    r.observer.samples.forEach((s,i)=>{assert.equal(s.t,i+1);
      for(const c of ['producer','recipient','unknown']){const free='free'+c[0].toUpperCase()+c.slice(1);
        assert(Number.isInteger(s[c])&&s[c]>=0&&s[free]>=0&&s[free]<=s[c]);}
      assert(s.producer+s.recipient+s.unknown<=600);assert(s.mature>=0&&s.mature<=300);
    });
    assert.equal(r.progress.length,r.steps/criteria.chunk);r.progress.forEach((p,i)=>assert.equal(p.t,(i+1)*criteria.chunk));
    for(const mutate of [x=>x.counts.supportedExact++,x=>x.observer.events.find(e=>e.kind==='bond-').v=-1,
      x=>x.observer.rows[0].parent=0]){const x=structuredClone(r);mutate(x);assert.throws(()=>checkRecord(x));}
    steps+=r.steps;
  }
  assert.equal(steps,m.simulationSteps);
  if(m.preflight)assert.deepEqual(m.preflight,costGate(m.preflight.cpuSeconds,m.preflight.rssBytes));
  if(m.status==='preflight-cost'){
    assert(!m.complete);assert(!m.preflight.pass);assert.equal(m.records.length,1);
    assert.equal(m.records[0].seed,105);assert.equal(m.records[0].arm,'on');assert.equal(steps,10000);
  }else if(m.status==='complete'){
    assert(m.complete&&m.preflight.pass);assert.equal(seen.size,16);assert.equal(steps,800000);
  }else if(m.status==='cpu-cap'){
    assert(!m.complete&&m.preflight.pass);assert(m.cpuSeconds>=criteria.cpuCap);
    m.records.slice(0,-1).forEach(r=>assert.equal(r.steps,criteria.steps));
    assert(m.records.at(-1).steps>0&&m.records.at(-1).steps<=criteria.steps);
    assert(m.records.at(-1).steps%criteria.chunk===0);
  }else assert.fail('Stopped with unresolved measurement/budget error: '+m.status);
  console.log(JSON.stringify({pass:true,status:m.status,records:m.records.length,steps,
    checks:'source/input/raw hashes, historical prefixes/full states, physical tape, sample coverage, cost boundaries, corruption rejection'}));
  return m;
}
if(require.main===module){if(process.argv[2])verify(process.argv[2]);else{boundaries();console.log('PASS cost boundaries and historical corruption rejection');}}
module.exports={verify,boundaries};
