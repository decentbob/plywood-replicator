#!/usr/bin/env node
'use strict';
const fs=require('fs'),zlib=require('zlib'),assert=require('assert/strict');
const live=require('./half_cell_live'),{comparable}=require('./half_cell_geometry');
const {F,R,K,L,T_C}=require('../src/sim'),{hash}=require('./half_cell_rim_test');
const INPUT='experiments/out/HC_arc_20260928.json.gz';
const cpu=()=>{const c=process.cpuUsage();return(c.user+c.system)/1e6;};
const counts={functional:0,observed:0,plain:0,restart:0,replay:0};
const advance=(s,k)=>{s.step();counts[k]++;};
const read=p=>JSON.parse(p.endsWith('.gz')?zlib.gunzipSync(fs.readFileSync(p)):fs.readFileSync(p));
function functional(){
  const rows=[];
  for(const pMem of [0,1])for(const rimBind of [false,true]){
    const w=live.createWorld({start:'contacts'}),s=w.s,initial=s.saveState();
    Object.assign(s.p,{pMem,rimBind,sigma:0,sigmaRot:0,pMelt:0,pMeltRun:0,pMeltEnd:0});
    for(let t=0;t<12;t++)advance(s,'functional');
    live.invariant(s,initial);
    const report=live.observe(s),expected=pMem&&rimBind?18:9;
    assert.equal(report.rimBonds,expected,'Automatic cap/extension/closure gate');
    assert.equal(report.chainCount,2,'Ordinary chain formation');
    assert.equal(report.unpairedChains,2,'Ordinary release');
    rows.push({pMem,rimBind,report,state:s.saveState()});
  }
  // Loaded states must keep the research runtime and reject corrupted material/bonds.
  const w=live.createWorld({start:'paired'});advance(w.s,'functional');
  const before=w.s.saveState();live.observe(w.s);live.geometry(w.s);live.snapshot(w,true);
  assert.deepEqual(comparable(before),comparable(w.s.saveState()));
  const saved=live.save(w),restored=live.restore(saved);advance(w.s,'functional');advance(restored.s,'functional');
  assert.deepEqual(comparable(w.s.saveState()),comparable(restored.s.saveState()));
  let rejected=0;
  for(const change of [x=>x.format='core',x=>x.state.p.iters=32,x=>x.state.arrays.type.b='',
    x=>{const b=Buffer.from(x.state.arrays.rimBond.b,'base64');b.writeInt32LE(9999,0);x.state.arrays.rimBond.b=b.toString('base64');}]){
    const bad=structuredClone(saved);change(bad);assert.throws(()=>live.restore(bad));rejected++;
  }
  // Classification cannot confuse a cut rim with a completed D or an unpaired chain.
  const test=live.createWorld({start:'paired'}),s=test.s;
  assert.equal(live.observe(s).closedCount,2);assert.equal(live.observe(s).unpairedClosed,0);
  const a=test.ids.arcs[1][3]*4+K,b=s.rimBond[a];s.rimBond[a]=s.rimBond[b]=-1;
  assert.equal(live.observe(s).closedCount,1);
  assert.equal(live.observe(live.createWorld({start:'bath'}).s).closedCount,1);
  return {rows,rejected,observerNeutral:true,restart:true,classification:true};
}
function summary(records){return records.map(r=>{
  const samples=r.samples,first=fn=>samples.find(q=>fn(q.summary))?.t??null;
  return {...r.job,firstNewChain:first(x=>x.chainCount>r.samples[0].summary.chainCount),
    firstNewClosed:first(x=>x.closedCount>r.samples[0].summary.closedCount),
    firstTwoUnpaired:first(x=>x.unpairedChains===2),
    maxCopyingContacts:Math.max(...samples.map(x=>x.summary.copyingContacts)),
    maxOverlap:Math.max(...samples.map(x=>x.geometry.maxOverlap)),maxPin:Math.max(...samples.map(x=>x.geometry.maxPin)),
    final:samples.at(-1).summary};});}
function run(job){
  const w=live.createWorld(job),initial=w.s.saveState(),plain=live.LiveHalfCellSim.fromState(initial);
  const r={job,initial:live.save(w),samples:[]};let restarted;
  for(let t=0;t<=120;t++){
    if(t){advance(w.s,'observed');if(t>60)advance(restarted.s,'restart');}
    r.samples.push(live.snapshot(w,true));live.invariant(w.s,initial);
    if(t===60){r.midpoint=live.save(w);restarted=live.restore(r.midpoint);}
  }
  for(let t=0;t<120;t++)advance(plain,'plain');r.final=live.save(w);
  assert.deepEqual(comparable(r.final.state),comparable(plain.saveState()));
  assert.deepEqual(comparable(r.final.state),comparable(restarted.s.saveState()));
  r.neutral=true;r.restart=true;return r;
}
function validate(record){
  const w=live.createWorld(record.job);assert.deepEqual(live.save(w),record.initial);
  assert.equal(record.samples.length,121);
  for(let t=0;t<=120;t++){
    if(t)advance(w.s,'replay');assert.deepEqual(live.snapshot(w,true),record.samples[t]);
    if(t===60)assert.deepEqual(comparable(w.s.saveState()),comparable(record.midpoint.state));
  }
  live.invariant(w.s,record.initial.state);
  assert.deepEqual(comparable(w.s.saveState()),comparable(record.final.state));
}
function main(){
  const checking=process.argv[2]==='--validate',file=process.argv[checking?3:2];assert(file);
  const output=checking?file+'.validation.json':file;assert(!fs.existsSync(output)&&!fs.existsSync(output+'.cpu.json'),'Unique output required');
  const input=read(INPUT),files=[...Object.keys(input.sources),'experiments/half_cell_live.js',
    'experiments/half_cell_live_assay.js','experiments/half_cell_live_plan.md'];
  const r={command:process.argv.slice(1),input:INPUT,inputHash:hash(INPUT),sources:Object.fromEntries(files.map(p=>[p,hash(p)])),
    complete:false,records:[]};let error;
  try{
    for(const [p,h]of Object.entries(input.sources))assert.equal(hash(p),h,p);
    if(checking){
      const raw=read(file);assert(raw.complete);assert.deepEqual(raw.sources,r.sources);assert.equal(raw.records.length,12);
      for(const record of raw.records){validate(record);assert(cpu()<60,'Validation CPU ceiling');}
      assert.deepEqual(summary(raw.records),raw.summary);
      const bad=structuredClone(raw.records[0]);bad.samples[0].summary.closedCount=99;assert.throws(()=>validate(bad));
      r.rawHash=hash(file);r.frames=12*121;r.corruptionRejected=true;r.summary=raw.summary;
    }else{
      r.functional=functional();assert(cpu()<60);
      for(const seed of [787,797])for(const motion of ['body','individual'])for(const start of live.STARTS){
        const record=run({seed,motion,start});r.records.push(record);assert(cpu()<120,'Execution CPU ceiling');
      }
      r.summary=summary(r.records);
    }
    r.complete=true;
  }catch(e){error=e;r.error={message:e.message,stack:e.stack};}
  fs.writeFileSync(output,checking?JSON.stringify(r)+'\n':zlib.gzipSync(JSON.stringify(r)+'\n'),{flag:'wx'});
  const cost={cpuSeconds:cpu(),counts,complete:r.complete};fs.writeFileSync(output+'.cpu.json',JSON.stringify(cost)+'\n',{flag:'wx'});
  console.log(JSON.stringify({complete:r.complete,cost,summary:r.summary,error:r.error}));if(error)process.exitCode=1;
}
if(require.main===module)main();
module.exports={summary,validate};
