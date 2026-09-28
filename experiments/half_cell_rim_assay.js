#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),zlib=require('zlib'),assert=require('assert/strict');
const {setup,jobs}=require('./half_cell_rim_setup');
const {HalfCellRimSim}=require('./half_cell_rim');
const geometry=require('./half_cell_geometry');
const {SOURCES:TEST_SOURCES,hash}=require('./half_cell_rim_test');
const {F,R,L,T_P,T_C,I_TPL}=require('../src/sim');
const TEST='experiments/scratch/HC_rim_20260928.tests.json';
const SOURCES=[...TEST_SOURCES,'experiments/half_cell_rim_assay.js'];
const count={observed:0,plain:0,restart:0,replay:0};
const cpu=()=>{const c=process.cpuUsage();return(c.user+c.system)/1e6;};
const read=f=>JSON.parse(f.endsWith('.gz')?zlib.gunzipSync(fs.readFileSync(f)):fs.readFileSync(f));
function frame(s){return {...geometry.frame(s),rimBonds:[...s.rimBond].flatMap((q,a)=>q>a?[[a,q]]:[]),states:[...s.is],rimEvents:s.rimEvents};}
function measure(f,m,ids){
  const q=geometry.measure({...f,bonds:[...f.bonds,...f.rimBonds]},m,ids);
  const cap=ids.caps[0],rim=m.types[cap]===T_P?L:R,a=cap*4+rim;
  const pair=f.rimBonds.find(p=>p.includes(a)),parentPartner=pair?(pair[0]===a?pair[1]:pair[0])>>2:-1;
  const occupied=new Set(f.rimBonds.flatMap(p=>p.map(a=>a>>2)));
  const crossPreparation=f.rimBonds.filter(([a,b])=>ids.caps.some((cap,h)=>
    ((a>>2)===cap&&(b>>2)===ids.rims[1-h])||((b>>2)===cap&&(a>>2)===ids.rims[1-h]))).length;
  return {...q,parentPartner,
    released:[ids.caps,ids.letters].every(([u,v])=>!f.bonds.some(([a,b])=>(a===u*4+F&&b===v*4+F)||(a===v*4+F&&b===u*4+F))),
    rimWW:f.rimBonds.filter(([a,b])=>m.types[a>>2]===T_C&&m.types[b>>2]===T_C).length,
    crossPreparation,freeW:ids.rims.filter(u=>!occupied.has(u)).length,
    armedChainUnits:[...ids.caps,...ids.letters].filter(u=>f.states[u]===I_TPL).length};
}
function invariant(s,c){
  assert.deepEqual(s.check(),[]);assert.equal(s.n,8);
  const now=s.saveState();for(const k of ['type','nv','rx','ry','edgeOf','size','w','wr'])assert.deepEqual(now.arrays[k],c.initial.arrays[k],k);
  for(const cap of c.ids.caps){const rail=s.type[cap]===T_P?R:L;assert(s.bond[cap*4+rail]>=0,'Supplied rail lost');}
  if(c.job.arm==='prepared')for(const cap of c.ids.caps){const rim=s.type[cap]===T_P?L:R;assert(s.rimBond[cap*4+rim]>=0,'Supplied rim lost');}
}
function run(job,retain){
  const {s,ids,metadata}=setup(job),initial=s.saveState(),plain=HalfCellRimSim.fromState(initial);
  const c={job,ids,metadata,initial,samples:[],neutral:false,restart:false};retain(c);let resumed;
  for(let t=0;t<=job.horizon;t++){
    if(t){s.step();count.observed++;if(t>job.horizon/2){resumed.step();count.restart++;}}
    const f=frame(s);c.samples.push({frame:f,metrics:measure(f,metadata,ids)});
    if(t<=5){invariant(s,c);assert(c.samples.at(-1).metrics.maxPin<=1,'Viability pin error');}
    if(t===job.horizon/2){c.midpoint=s.saveState();resumed=HalfCellRimSim.fromState(c.midpoint);}
  }
  for(let t=0;t<job.horizon;t++){plain.step();count.plain++;}
  invariant(s,c);c.final=s.saveState();
  assert.deepEqual(geometry.comparable(c.final),geometry.comparable(plain.saveState()),'Observer affects state/RNG');
  assert.deepEqual(geometry.comparable(c.final),geometry.comparable(resumed.saveState()),'Restart differs');
  c.neutral=true;c.restart=true;return c;
}
function summarize(r){
  const rows=r.records.map(c=>{
    const tail=c.samples.slice(-20),first=predicate=>c.samples.find(q=>q.frame.t>0&&predicate(q.metrics))?.frame.t??null;
    const tailGeometry=tail.every(q=>q.metrics.maxPin<=.1&&q.metrics.maxOverlap<=.02);
    const release=first(m=>m.released),clear=first(m=>m.released&&m.minCrossGap>=.1),acquire=first(m=>m.parentPartner>=0);
    const sustained=tail.every(q=>q.metrics.parentPartner>=0)&&tailGeometry;
    return {...c.job,release,clear,acquire,tailGeometry,sustained,
      pass:c.job.arm==='prepared'?release!==null&&release<=10&&clear!==null&&tailGeometry:c.job.arm==='on'?sustained:c.final.nums.rimEvents===0,
      maxOverlap:Math.max(...c.samples.map(q=>q.metrics.maxOverlap)),maxPin:Math.max(...c.samples.map(q=>q.metrics.maxPin)),
      maxTailOverlap:Math.max(...tail.map(q=>q.metrics.maxOverlap)),maxTailPin:Math.max(...tail.map(q=>q.metrics.maxPin)),
      finalFreeW:c.samples.at(-1).metrics.freeW,finalRimWW:c.samples.at(-1).metrics.rimWW,
      finalCrossPreparation:c.samples.at(-1).metrics.crossPreparation,finalArmed:c.samples.at(-1).metrics.armedChainUnits,
      newRimBonds:c.final.nums.rimEvents-c.initial.nums.rimEvents};
  });
  const strata=[];
  for(const mode of ['body16','individual16'])for(const end of ['P','Q']){
    const select=arm=>rows.filter(x=>x.mode===mode&&x.end===end&&x.arm===arm),prep=select('prepared'),on=select('on'),off=select('off');
    strata.push({mode,end,prepared:prep.filter(x=>x.pass).length,on:on.filter(x=>x.pass).length,off:off.filter(x=>x.pass).length,
      pass:prep.length===2&&prep.every(x=>x.pass)&&on.length===2&&on.some(x=>x.pass)&&off.length===2&&off.every(x=>x.pass)});
  }
  return {pass:rows.length===24&&strata.every(x=>x.pass),strata,rows};
}
function validate(c,replay=true){
  const {s,ids,metadata}=setup(c.job);assert.deepEqual(ids,c.ids);assert.deepEqual(metadata,c.metadata);
  assert.deepEqual(geometry.comparable(s.saveState()),geometry.comparable(c.initial));assert(c.neutral&&c.restart);
  assert.equal(c.samples.length,c.job.horizon+1);
  for(let t=0;t<=c.job.horizon;t++){
    const q=c.samples[t];assert.equal(q.frame.t,t);assert.deepEqual(measure(q.frame,c.metadata,c.ids),q.metrics,'Metric mismatch');
    if(replay){if(t){s.step();count.replay++;}assert.deepEqual(frame(s),q.frame,'Trajectory mismatch');
      if(t===c.job.horizon/2)assert.deepEqual(geometry.comparable(s.saveState()),geometry.comparable(c.midpoint));}
  }
  if(replay){invariant(s,c);assert.deepEqual(geometry.comparable(s.saveState()),geometry.comparable(c.final));}
}
function main(){
  const validating=process.argv[2]==='--validate',file=process.argv[validating?3:2];assert(file,'Provide unique output path');
  const target=validating?file+'.validation.json':file;assert(!fs.existsSync(target)&&!fs.existsSync(target+'.cpu.json'),'Refusing overwrite');
  const r={kind:'half-cell-rim',command:process.argv.slice(1),test:TEST,testHash:hash(TEST),
    sources:Object.fromEntries(SOURCES.map(f=>[f,hash(f)])),jobs:jobs(),records:[],complete:false};let error;
  try{
    const test=read(TEST);assert(test.complete);for(const [f,h]of Object.entries(test.sources))assert.equal(hash(f),h,f);
    if(validating){
      const raw=read(file);assert(raw.complete);assert.deepEqual(raw.sources,r.sources);assert.equal(raw.testHash,r.testHash);
      assert.deepEqual(raw.jobs,jobs());assert.equal(raw.records.length,24);
      for(let i=0;i<24;i++){assert.deepEqual(raw.records[i].job,r.jobs[i]);validate(raw.records[i]);assert(cpu()<75,'Validation CPU reserve');}
      assert.deepEqual(raw.summary,summarize(raw));
      const bad=structuredClone(raw.records[0]);bad.samples[1].frame.polygons[0][0][0]+=.2;assert.throws(()=>validate(bad,false),/Metric mismatch/);
      const rim=structuredClone(raw.records[0]);rim.samples[1].frame.rimBonds=[];assert.throws(()=>validate(rim,false),/Metric mismatch/);
      const wrong=structuredClone(raw.summary);wrong.pass=!wrong.pass;assert.throws(()=>assert.deepEqual(wrong,summarize(raw)));
      const label=structuredClone(raw.records[0]);label.job.seed++;assert.throws(()=>validate(label,false));
      Object.assign(r,{rawHash:hash(file),frames:raw.records.reduce((a,c)=>a+c.samples.length,0),corruptionsRejected:4,summary:raw.summary});
    }else{
      for(const job of r.jobs){run(job,c=>r.records.push(c));assert(cpu()<75,'Execution CPU reserve');}
      r.summary=summarize(r);
    }
    r.complete=true;
  }catch(e){error=e;r.error={message:e.message,stack:e.stack};}
  fs.mkdirSync(path.dirname(target),{recursive:true});const bytes=Buffer.from(JSON.stringify(r)+'\n');
  fs.writeFileSync(target,validating?bytes:zlib.gzipSync(bytes),{flag:'wx'});
  const cost={cpuSeconds:cpu(),count,complete:r.complete};fs.writeFileSync(target+'.cpu.json',JSON.stringify(cost)+'\n',{flag:'wx'});
  console.log(JSON.stringify({complete:r.complete,cost,pass:r.summary?.pass,strata:r.summary?.strata,error:r.error}));if(error)process.exitCode=1;
}
if(require.main===module)main();
module.exports={frame,measure,summarize,validate};
