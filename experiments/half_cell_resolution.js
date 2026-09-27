#!/usr/bin/env node
'use strict';
const fs=require('fs'),zlib=require('zlib'),crypto=require('crypto'),assert=require('assert/strict');
const base=require('./half_cell_geometry'),contact=require('./half_cell_contact');
const {F}=require('../src/sim');
const INPUT='experiments/out/HC_geometry_20260927_v2.json';
const CONTACT='experiments/scratch/HC_contact_20260927_v2.json.gz';
const DIAGNOSIS='experiments/scratch/HC_contact_20260927_v2.checked.json';
const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const cpu=()=>{const c=process.cpuUsage();return(c.user+c.system)/1e6;};
const read=f=>JSON.parse(f.endsWith('.gz')?zlib.gunzipSync(fs.readFileSync(f)):fs.readFileSync(f));
const steps={observed:0,plain:0,restart:0,replay:0};
const advance=(s,kind)=>{s._physics();s.t++;steps[kind]++;};
const release=(s,ids)=>{for(const u of [ids.caps[0],ids.letters[0]])s._unlink(u,F);s._computeOpen();};
function cases(){return read(INPUT).records.filter(c=>c.job.mode==='body4').map(c=>({...c,
  job:{...c.job,mode:'body16'},initial:contact.HalfCellContactSim.fromState(c.initial,{iters:16}).saveState()}));}
function run(c,retain){
  const C=contact.HalfCellContactSim,s=C.fromState(c.initial),plain=C.fromState(c.initial);
  const rec={job:{...c.job,contact:'polygon'},ids:c.ids,metadata:c.metadata,initial:s.saveState(),samples:[],neutral:false,restart:false};retain(rec);
  let resumed;
  for(let t=0;t<=200;t++){
    if(t===101){release(s,c.ids);release(resumed,c.ids);}
    if(t){advance(s,'observed');if(t>100)advance(resumed,'restart');}
    const frame=base.frame(s),metrics=contact.metrics(frame,c.metadata,c.ids);rec.samples.push({frame,metrics});
    if(t<=5){assert.deepEqual(s.check(),[]);assert.equal(s.n,8);assert(metrics.maxPin<=1);
      for(const k of ['px','py','pa','ox','oy'])assert(s[k].every(Number.isFinite));}
    if(t===100){rec.midpoint=s.saveState();resumed=C.fromState(rec.midpoint);}
  }
  for(let t=1;t<=200;t++){if(t===101)release(plain,c.ids);advance(plain,'plain');}
  rec.final=s.saveState();assert.deepEqual(s.check(),[]);
  for(const k of ['type','nv','rx','ry','edgeOf','size','w','wr'])assert.deepEqual(rec.final.arrays[k],rec.initial.arrays[k]);
  assert.deepEqual(base.comparable(rec.final),base.comparable(plain.saveState()));
  assert.deepEqual(base.comparable(rec.final),base.comparable(resumed.saveState()));
  rec.neutral=true;rec.restart=true;return rec;
}
function summarize(records,reference){
  const rows=contact.summarize({records}).rows,old=reference.summary.rows.filter(x=>x.contact==='polygon');
  const admitted=x=>x.heldGood>=24&&x.overlapFailures===0&&x.releasedPinGood>=99&&x.firstClear!==null&&x.maxAllOverlap<=.02;
  const individual=old.filter(x=>x.mode==='individual16');
  return {pass:rows.length===8&&rows.every(admitted)&&individual.length===8&&individual.every(admitted),
    body16Passing:rows.filter(admitted).length,individual16Passing:individual.filter(admitted).length,
    rows,referenceRows:old};
}
function main(){
  const validating=process.argv[2]==='--validate',file=process.argv[validating?3:2];assert(file);
  const target=validating?file+'.validation.json':file;assert(!fs.existsSync(target)&&!fs.existsSync(target+'.cpu.json'),'Refusing overwrite');
  const reference=read(CONTACT),diagnosis=read(DIAGNOSIS);assert(reference.complete&&diagnosis.complete&&!reference.summary.pass);
  assert.equal(diagnosis.rawHash,hash(CONTACT));
  const sources={...reference.sources,...Object.fromEntries(['experiments/half_cell_contact_validate.js','experiments/half_cell_resolution.js','experiments/half_cell_resolution_plan.md'].map(f=>[f,hash(f)]))};
  const r={kind:'half-cell-resolution',command:process.argv.slice(1),inputs:Object.fromEntries([INPUT,CONTACT,DIAGNOSIS].map(f=>[f,hash(f)])),sources,records:[],complete:false};
  let error;
  try{
    for(const [f,h]of Object.entries(sources))assert.equal(hash(f),h,f);contact.selfCheck();const cs=cases();assert.equal(cs.length,8);
    if(validating){
      const raw=read(file);assert(raw.complete);assert.deepEqual(raw.sources,sources);assert.deepEqual(raw.inputs,r.inputs);assert.equal(raw.records.length,8);
      for(let i=0;i<8;i++){contact.validateRecord(raw.records[i],cs[i]);steps.replay+=200;assert(cpu()<45,'Validation CPU ceiling');}
      assert.deepEqual(raw.summary,summarize(raw.records,reference));
      const bad=structuredClone(raw.records[0]);bad.samples[1].frame.polygons[0][0][0]+=.2;
      assert.throws(()=>contact.validateRecord(bad,cs[0],false),/Metric mismatch/);
      const wrong=structuredClone(raw.summary);wrong.pass=!wrong.pass;assert.throws(()=>assert.deepEqual(wrong,summarize(raw.records,reference)));
      Object.assign(r,{rawHash:hash(file),summary:raw.summary,frames:1608,corruptionsRejected:2});
    }else{
      for(const c of cs){run(c,x=>r.records.push(x));assert(cpu()<45,'Execution CPU ceiling');}
      r.summary=summarize(r.records,reference);
    }
    r.complete=true;
  }catch(e){error=e;r.error={message:e.message,stack:e.stack};}
  const bytes=Buffer.from(JSON.stringify(r)+'\n');fs.writeFileSync(target,validating?bytes:zlib.gzipSync(bytes),{flag:'wx'});
  const cost={cpuSeconds:cpu(),steps,complete:r.complete};fs.writeFileSync(target+'.cpu.json',JSON.stringify(cost)+'\n',{flag:'wx'});
  console.log(JSON.stringify({complete:r.complete,cost,summary:r.summary,error:r.error}));if(error)process.exitCode=1;
}
if(require.main===module)main();
