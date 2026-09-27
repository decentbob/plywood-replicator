#!/usr/bin/env node
// Frozen section-74 observer applied to the complete section-62 archive.
const fs=require('fs'),path=require('path'),zlib=require('zlib'),assert=require('assert/strict');
const {Sim}=require('../src/sim.js');
const old=require('./recipient_dependence.js');
const {load}=require('./recipient_confirmation_summary.js');
const diagnostic=require('./delivery_diagnostic.js');
const {checkRecord}=require('./delivery_diagnostic_analysis_test.js');
const root=path.join(__dirname,'..');
const criteria=Object.freeze({seeds:[105,106,107,108],arms:['on','noBind','noSource','neither'],
  steps:50000,after:10000,preflightSteps:10000,preflightCpu:45,projectionFactor:80,
  cpuCap:3600,rssCap:1024**3,chunk:1000,minimumCoverage:.8,minimumOpportunities:20,minimumEnded:20});
const seconds=start=>{const c=process.cpuUsage(start);return (c.user+c.system)/1e6;};
const peakRss=()=>Math.max(process.memoryUsage().rss,process.resourceUsage().maxRSS*1024);
function costGate(cpuSeconds,rssBytes){return {cpuSeconds,rssBytes,projectedCpu:cpuSeconds*criteria.projectionFactor,
  pass:cpuSeconds<=criteria.preflightCpu&&rssBytes<=criteria.rssCap&&cpuSeconds*criteria.projectionFactor<=criteria.cpuCap};}
function historicalAgreement(r,original){
  assert.equal(r.initialHash,original.initialHash,'Initial physical hash');
  assert.deepEqual(r.params,original.params,'Parameters');
  assert.deepEqual(r.samples,original.samples.filter(s=>s.t<=r.steps),'Historical samples');
  assert.deepEqual(r.births,original.births.filter(b=>b.t<=r.steps),'Historical births');
  const members=original.members.filter(b=>b.t<=r.steps).map(b=>({...b,at5k:b.at5k?.t<=r.steps?b.at5k:null}));
  assert.deepEqual(r.members,members,'Historical member follow-ups');
  if(r.steps===criteria.steps)assert.deepEqual(r.finalState,original.finalState,'Full historical state including RNG');
  return {initial:true,samples:true,births:true,members:true,fullFinalState:r.steps===criteria.steps};
}
function main(stem){
  assert(stem,'Usage: node experiments/delivery_replay.js FRESH_OUTPUT_DIRECTORY');
  assert(!fs.existsSync(stem),'Refusing overwrite');
  const cpu=process.cpuUsage(),started=new Date().toISOString();
  const input='experiments/out/RD_dependence_confirm';
  const original=load(path.join(root,input));
  assert.deepEqual(original.result.seeds.filter(s=>s.pass).map(s=>s.seed),[105,107]);
  const runs=fs.readFileSync(path.join(root,input+'.runs.jsonl'),'utf8').trim().split(/\r?\n/).map(JSON.parse);
  const sources=[...new Set([...Object.keys(original.protocol.sources),'experiments/delivery_diagnostic.js',
    'experiments/delivery_diagnostic_test.js','experiments/delivery_diagnostic_analysis_test.js',
    'experiments/delivery_replay.js','experiments/delivery_replay_plan.md'])];
  const hashes=files=>Object.fromEntries(files.map(f=>[f,old.hash(fs.readFileSync(path.join(root,f)))]));
  const jobs=criteria.seeds.flatMap(seed=>criteria.arms.map(arm=>({seed,arm})));
  const m={schema:1,kind:'delivery-replay',started,command:process.argv,node:process.version,platform:process.platform,
    criteria,jobs,sources:hashes(sources),inputs:hashes(['.protocol.json','.manifest.json','.runs.jsonl'].map(x=>input+x)),
    originalCpuSeconds:original.manifest.cpuSeconds,workers:1,records:[],preflight:null,complete:false,status:'running',
    cpuAccounting:'One process, no workers; process.cpuUsage from before archive validation, includes serialization and validation.'};
  fs.mkdirSync(stem,{recursive:true});
  const manifest=()=>fs.writeFileSync(path.join(stem,'manifest.json'),JSON.stringify(m,null,2)+'\n');
  manifest(); // Source/input hashes, criteria and exact launch precede all steps.
  let current=null,stop=null;
  function save(r){
    const name=`${r.seed}_${r.arm}_${r.steps}.json.gz`,raw=zlib.gzipSync(JSON.stringify(r));
    fs.writeFileSync(path.join(stem,name),raw,{flag:'wx'});
    m.records.push({file:name,sha256:old.hash(raw),seed:r.seed,arm:r.arm,steps:r.steps,
      agreement:r.agreement??null,validation:r.validation??null,bytes:raw.length});manifest();
  }
  try{
    for(const job of jobs){
      if(seconds(cpu)>=criteria.cpuCap){stop='cpu-cap';break;}
      const expected=runs.find(r=>r.seed===job.seed&&r.arm===job.arm),start=process.cpuUsage();
      const s=new Sim({...old.base,...old.arms[job.arm],seed:job.seed}),initialState=s.saveState(),initialHash=old.physicalHash(s);
      assert.equal(initialHash,expected.initialHash);assert.deepEqual(s.p,expected.params);
      const member=old.observe(s),observer=diagnostic.observe(s),samples=[],progress=[];
      const record=()=>({...job,steps:s.t,params:s.p,initialHash,initialState,finalState:s.saveState(),
        samples,births:s.births,members:member.members,observer:observer.snapshot(),counts:diagnostic.summary(observer.data),
        cpuSeconds:seconds(start),peakRssBytes:peakRss(),progress});
      current={record};
      while(s.t<criteria.steps){
        for(let i=0;i<criteria.chunk/100;i++){
          s.run(100);const sample=old.sample(s);samples.push(sample);member.update();
          assert.deepEqual(sample,expected.samples[s.t/100-1],'Historical sample at '+s.t);
        }
        const p={seed:job.seed,arm:job.arm,t:s.t,cpuSeconds:seconds(cpu),worldCpuSeconds:seconds(start),peakRssBytes:peakRss()};
        progress.push(p);
        if(job.seed===105&&job.arm==='on'&&s.t===criteria.preflightSteps){
          m.preflight=costGate(p.worldCpuSeconds,p.peakRssBytes);manifest();
          console.log(JSON.stringify({preflight:m.preflight}));
          if(!m.preflight.pass){stop='preflight-cost';break;}
        }
        if(s.t%10000===0)console.log(JSON.stringify(p));
        if(p.cpuSeconds>=criteria.cpuCap){stop='cpu-cap';break;}
      }
      const r=record();assert.deepEqual(s.check(),[]);assert.deepEqual(r.finalState.arrays.type,initialState.arrays.type);
      r.agreement=historicalAgreement(r,expected);checkRecord(r);r.validation='ordered physical tape passed';
      save(r);current=null;
      if(stop)break;
    }
    m.complete=m.records.length===jobs.length&&m.records.every(r=>r.steps===criteria.steps);
    m.status=m.complete?'complete':stop;
  }catch(e){
    m.status='measurement-error';m.error={message:e.message,stack:e.stack};process.exitCode=1;
    if(current){try{const r=current.record();r.error=m.error;save(r);}catch(saveError){m.saveError=saveError.stack;}}
    console.error(e.stack);
  }finally{
    m.cpuSeconds=seconds(cpu);m.peakRssBytes=peakRss();m.finished=new Date().toISOString();
    m.simulationSteps=m.records.reduce((n,r)=>n+r.steps,0);manifest();
    console.log(JSON.stringify({status:m.status,records:m.records.length,simulationSteps:m.simulationSteps,cpuSeconds:m.cpuSeconds}));
  }
}
if(require.main===module)main(process.argv[2]);
module.exports={criteria,costGate,historicalAgreement};
