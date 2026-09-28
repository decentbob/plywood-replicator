#!/usr/bin/env node
'use strict';
const fs=require('fs'),zlib=require('zlib'),assert=require('assert/strict');
const {ArcSim,frame,measure,summarize}=require('./half_cell_arc'),{comparable}=require('./half_cell_geometry'),{hash}=require('./half_cell_rim_test');
const INPUT='experiments/scratch/HC_arc_20260928.json.gz',read=f=>JSON.parse(f.endsWith('.gz')?zlib.gunzipSync(fs.readFileSync(f)):fs.readFileSync(f));
const cpu=()=>{const c=process.cpuUsage();return(c.user+c.system)/1e6;},counts={observed:0,plain:0,restart:0,replay:0};
function initial(c){const s=ArcSim.fromState(c.initial,{iters:32});s._bondList();return s;}
function advance(s,c,kind){if(s.t===40){for(const [a]of c.ids.faces)s._unlink(a>>2,0);s._computeOpen();}s._physics();s.t++;counts[kind]++;}
function invariant(s,c){
  assert.equal(s.n,28);assert.deepEqual(s.check(),[]);const now=s.saveState(),bytes=Buffer.from(c.initial.arrays.bond.b,'base64');
  for(const k of ['type','nv','rx','ry','edgeOf','size','w','wr','rimBond','is'])assert.deepEqual(now.arrays[k],c.initial.arrays[k],k);
  for(let a=0;a<s.bond.length;a++)assert.equal(s.bond[a],s.t>40&&c.ids.faces.some(p=>p.includes(a))?-1:bytes.readInt32LE(a*4));
  for(const k of ['px','py','pa','ox','oy'])assert(s[k].every(Number.isFinite),k);
}
function prepare(c){
  const s=initial(c),state=s.saveState();assert.deepEqual(state.arrays,c.initial.arrays);assert.equal(state.rng,c.initial.rng);
  const p={...state.p,iters:16};assert.deepEqual(p,c.initial.p);
  return {job:{...c.job,mode:c.job.mode.replace('16','32')},referenceJob:c.job,ids:c.ids,
    metadata:{...c.metadata,p:state.p},initial:state,static:c.static,compatibility:c.compatibility,samples:[]};
}
function run(r){
  const s=ArcSim.fromState(r.initial),plain=ArcSim.fromState(r.initial);let resumed;
  for(let t=0;t<=120;t++){
    if(t){advance(s,r,'observed');if(t>60)advance(resumed,r,'restart');}
    const f=frame(s),metrics=measure(f,r.metadata,r.ids);r.samples.push({frame:f,metrics});
    if(t<=5){invariant(s,r);assert(metrics.maxPin<=1,'Viability pin');}
    if(t===60){r.midpoint=s.saveState();resumed=ArcSim.fromState(r.midpoint);}
  }
  for(let t=0;t<120;t++)advance(plain,r,'plain');invariant(s,r);r.final=s.saveState();
  assert.deepEqual(comparable(r.final),comparable(plain.saveState()));assert.deepEqual(comparable(r.final),comparable(resumed.saveState()));
  r.neutral=true;r.restart=true;
}
function validate(r,c){
  const setup=prepare(c);for(const k of ['job','referenceJob','ids','metadata','static','compatibility'])assert.deepEqual(r[k],setup[k],k);
  assert.deepEqual(comparable(r.initial),comparable(setup.initial));assert(r.neutral&&r.restart);assert.equal(r.samples.length,121);
  const s=ArcSim.fromState(r.initial);
  for(let t=0;t<=120;t++){
    const q=r.samples[t];assert.deepEqual(measure(q.frame,r.metadata,r.ids),q.metrics,'Metric mismatch');
    if(t)advance(s,r,'replay');assert.deepEqual(frame(s),q.frame,'Frame mismatch');
    if(t===60)assert.deepEqual(comparable(s.saveState()),comparable(r.midpoint));
  }
  invariant(s,r);assert.deepEqual(comparable(s.saveState()),comparable(r.final));
}
function main(){
  const validating=process.argv[2]==='--validate',file=process.argv[validating?3:2];assert(file);
  const target=validating?file+'.validation.json':file;assert(!fs.existsSync(target)&&!fs.existsSync(target+'.cpu.json'),'Refusing overwrite');
  const input=read(INPUT),files=[...Object.keys(input.sources),'experiments/half_cell_arc_resolution.js','experiments/half_cell_arc_resolution_plan.md'];
  const r={command:process.argv.slice(1),input:INPUT,inputHash:hash(INPUT),sources:Object.fromEntries(files.map(f=>[f,hash(f)])),design:input.design,records:[],complete:false};let error;
  try{
    assert(input.complete&&!input.summary.pass);for(const [f,h]of Object.entries(input.sources))assert.equal(hash(f),h,f);
    if(validating){
      const raw=read(file);assert(raw.complete);assert.deepEqual(raw.sources,r.sources);assert.equal(raw.inputHash,r.inputHash);assert.equal(raw.records.length,8);
      for(let k=0;k<8;k++){validate(raw.records[k],input.records[k]);assert(cpu()<45,'Validation CPU ceiling');}
      assert.deepEqual(raw.summary,summarize(raw));
      const bad=structuredClone(raw.records[0]);bad.samples[1].frame.polygons[0][0][0]+=.3;assert.throws(()=>validate(bad,input.records[0]),/Metric mismatch/);
      const label=structuredClone(raw.records[0]);label.job.seed++;assert.throws(()=>validate(label,input.records[0]));
      const bond=structuredClone(raw.records[0]);bond.samples[1].frame.rimBonds=[];assert.throws(()=>validate(bond,input.records[0]));
      const wrong=structuredClone(raw.summary);wrong.pass=!wrong.pass;assert.throws(()=>assert.deepEqual(wrong,summarize(raw)));
      Object.assign(r,{rawHash:hash(file),frames:8*121,corruptionsRejected:4,summary:raw.summary});
    }else{
      for(const c of input.records){const record=prepare(c);r.records.push(record);run(record);assert(cpu()<60,'Execution CPU ceiling');}
      r.summary=summarize(r);
    }
    r.complete=true;
  }catch(e){error=e;r.error={message:e.message,stack:e.stack};}
  const bytes=Buffer.from(JSON.stringify(r)+'\n');fs.writeFileSync(target,validating?bytes:zlib.gzipSync(bytes),{flag:'wx'});
  const cost={cpuSeconds:cpu(),counts,complete:r.complete};fs.writeFileSync(target+'.cpu.json',JSON.stringify(cost)+'\n',{flag:'wx'});
  console.log(JSON.stringify({complete:r.complete,cost,pass:r.summary?.pass,rows:r.summary?.rows,error:r.error}));if(error)process.exitCode=1;
}
if(require.main===module)main();
