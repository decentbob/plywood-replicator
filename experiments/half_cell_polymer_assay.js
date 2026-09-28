#!/usr/bin/env node
'use strict';
const fs=require('fs'),zlib=require('zlib'),assert=require('assert/strict');
const {HalfCellPolymerSim}=require('./half_cell_polymer');
const old=require('./half_cell_rim_assay'),base=require('./half_cell_geometry');
const {hash}=require('./half_cell_rim_test');
const {setup}=require('./half_cell_rim_setup');
const {Sim,T_M,T_P,F,R,K,L}=require('../src/sim');
const INPUT='experiments/out/HC_rim_20260928.json.gz';
const read=f=>JSON.parse(f.endsWith('.gz')?zlib.gunzipSync(fs.readFileSync(f)):fs.readFileSync(f));
const cpu=()=>{const c=process.cpuUsage();return(c.user+c.system)/1e6;};
const steps={observed:0,plain:0,restart:0,replay:0};
function testFixture(end,angle=0,gap=0){
  const prepared=setup({seed:701,mode:'body16',end,arm:'on'}),s=HalfCellPolymerSim.fromState(prepared.s.saveState(),{pMem:1});
  const u=prepared.ids.caps[0],v=prepared.ids.rims[0],i=s.type[u]===T_P?L:R,j=s.type[u]===T_P?F:K;
  s._rigidMove(v,0,0,angle);
  const ac=s._sideCorners(u,i,[0,0]),bc=s._sideCorners(v,j,[0,0]),a=ac[s.rimLabel(u,i)>0?1:0],b=bc[s.rimLabel(v,j)>0?1:0];
  const normal=s._side(u,i,[0,0,0,0]);
  s._rigidMove(v,s._dx(s.px[u]+s.ox[a]-s.px[v]-s.ox[b])+gap*normal[2],s._dy(s.py[u]+s.oy[a]-s.py[v]-s.oy[b])+gap*normal[3],0);
  return {s,u,v,i,j,ids:prepared.ids};
}
function selfCheck(){
  let comparisons=0;
  for(const end of ['P','Q'])for(const angle of [0,Math.PI/6,Math.PI/2,2*Math.PI/3])for(const gap of [0,.06,.2]){
    const {s,u,v,i,j}=testFixture(end,angle,gap),map={[u]:i,[v]:j};
    const adapter={type:new Uint8Array(s.n).fill(T_M),p:s.p,size:s.size,ox:s.ox,oy:s.oy,
      _side:(x,side,out)=>s._side(x,map[x],out),_sideCorners:(x,side,out)=>s._sideCorners(x,map[x],out)};
    const dx=s._dx(s.px[v]-s.px[u]),dy=s._dy(s.py[v]-s.py[u]);
    const native=Sim.prototype._geomOK.call(adapter,u,s.rimLabel(u,i)>0?R:L,v,s.rimLabel(v,j)>0?R:L,dx,dy,Math.hypot(dx,dy));
    assert.equal(s.polymerContact(u,i,v,j),native,'Differs from membrane contact rule');comparisons++;
  }
  for(const end of ['P','Q']){
    const {s,u,v,i,j}=testFixture(end,Math.PI/6),before=s.saveState();
    assert(s.polymerContact(u,i,v,j));assert(s.edgeContact(u,i,v,j).gap>.1);
    s._formRimBonds();assert.equal(s.rimBond[u*4+i],v*4+j,'Automatic corner attachment missing');
    for(const key of ['px','py','pa','ox','oy'])assert.deepEqual(s.saveState().arrays[key],before.arrays[key],'Attachment moved a block');
  }
  for(const energyGate of [false,true])for(const state of [0,1,2]){
    const {s,u,i}=testFixture('P');s.p.energyGate=energyGate;s.is.fill(state);s._formRimBonds();assert(s.rimBond[u*4+i]>=0);
  }
  const off=testFixture('P');off.s.p.rimBind=false;off.s._formRimBonds();assert.equal(off.s.rimEvents,0);
  const wrong=testFixture('P');for(const w of wrong.ids.rims)wrong.s._rigidMove(w,0,0,Math.PI);
  wrong.s._formRimBonds();assert.equal(wrong.s.rimEvents,0);
  return {nativeGeometryComparisons:comparisons,misalignedAutomaticAttachments:2,stateEnergyCases:6,offAndWrongLabels:true,noProjection:true};
}
function opportunities(s){
  let eligible=0,oldEligible=0;
  for(let u=0;u<s.n;u++)for(let v=u+1;v<s.n;v++)if(s._candidate(u,v))for(let i=0;i<4;i++)for(let j=0;j<4;j++){
    if(!s.rimCompatible(u,i,v,j)||s.rimBond[u*4+i]>=0||s.rimBond[v*4+j]>=0)continue;
    if(s.polymerContact(u,i,v,j))eligible++;
    const q=s.edgeContact(u,i,v,j);if(q.gap<=.1&&q.opposed)oldEligible++;
  }
  return {eligible,oldEligible};
}
function check(s,c){
  assert.deepEqual(s.check(),[]);assert.equal(s.n,8);const st=s.saveState();
  for(const k of ['type','nv','rx','ry','edgeOf','size','w','wr'])assert.deepEqual(st.arrays[k],c.initial.arrays[k],k);
  for(const cap of c.ids.caps){assert(s.bond[cap*4+(s.type[cap]===T_P?R:L)]>=0);if(c.job.arm==='prepared')assert(s.rimBond[cap*4+(s.type[cap]===T_P?L:R)]>=0);}
}
function run(c,retain){
  const s=HalfCellPolymerSim.fromState(c.initial),plain=HalfCellPolymerSim.fromState(c.initial),n=c.job.horizon;
  const r={job:c.job,ids:c.ids,metadata:c.metadata,initial:s.saveState(),samples:[],phases:[],neutral:false,restart:false};retain(r);
  const fn=s._formRimBonds;s._formRimBonds=function(){const q=opportunities(this),before=this.rimEvents;fn.call(this);r.phases.push({t:this.t,...q,formed:this.rimEvents-before});};
  let resumed;
  for(let t=0;t<=n;t++){
    if(t){s.step();steps.observed++;if(t>n/2){resumed.step();steps.restart++;}}
    const f=old.frame(s);r.samples.push({frame:f,metrics:old.measure(f,c.metadata,c.ids)});
    if(c.job.arm!=='on')assert.deepEqual(f,c.samples[t].frame,'Archived control differs');
    if(t<=5){check(s,c);assert(r.samples.at(-1).metrics.maxPin<=1,'Viability pin error');}
    if(t===n/2){r.midpoint=s.saveState();resumed=HalfCellPolymerSim.fromState(r.midpoint);}
  }
  for(let t=0;t<n;t++){plain.step();steps.plain++;}
  check(s,c);r.final=s.saveState();assert.deepEqual(base.comparable(r.final),base.comparable(plain.saveState()));
  assert.deepEqual(base.comparable(r.final),base.comparable(resumed.saveState()));r.neutral=true;r.restart=true;return r;
}
function summary(r){return {...old.summarize(r),opportunities:r.records.map(c=>({...c.job,
  eligible:c.phases.reduce((a,q)=>a+q.eligible,0),oldEligible:c.phases.reduce((a,q)=>a+q.oldEligible,0),formed:c.phases.reduce((a,q)=>a+q.formed,0)}))};}
function validate(r,c){
  assert.deepEqual(r.job,c.job);assert.deepEqual(r.ids,c.ids);assert.deepEqual(r.metadata,c.metadata);
  const s=HalfCellPolymerSim.fromState(c.initial),phases=[],fn=s._formRimBonds;
  assert.deepEqual(base.comparable(s.saveState()),base.comparable(r.initial));assert(r.neutral&&r.restart);
  s._formRimBonds=function(){const q=opportunities(this),before=this.rimEvents;fn.call(this);phases.push({t:this.t,...q,formed:this.rimEvents-before});};
  assert.equal(r.samples.length,c.job.horizon+1);
  for(let t=0;t<=c.job.horizon;t++){
    const sample=r.samples[t];assert.equal(sample.frame.t,t);assert.deepEqual(old.measure(sample.frame,r.metadata,r.ids),sample.metrics,'Metric mismatch');
    if(t){s.step();steps.replay++;}assert.deepEqual(old.frame(s),sample.frame,'Frame mismatch');
    if(t===c.job.horizon/2)assert.deepEqual(base.comparable(s.saveState()),base.comparable(r.midpoint));
  }
  assert.deepEqual(phases,r.phases);check(s,c);assert.deepEqual(base.comparable(s.saveState()),base.comparable(r.final));
}
function main(){
  const validating=process.argv[2]==='--validate',file=process.argv[validating?3:2];assert(file);
  const target=validating?file+'.validation.json':file;assert(!fs.existsSync(target)&&!fs.existsSync(target+'.cpu.json'),'Refusing overwrite');
  const input=read(INPUT),sources={...input.sources,...Object.fromEntries(['experiments/half_cell_polymer.js','experiments/half_cell_polymer_plan.md','experiments/half_cell_polymer_assay.js'].map(f=>[f,hash(f)]))};
  const r={kind:'half-cell-polymer',input:INPUT,inputHash:hash(INPUT),sources,command:process.argv.slice(1),records:[],complete:false};let error;
  try{
    for(const [f,h]of Object.entries(sources))assert.equal(hash(f),h,f);r.tests=selfCheck();assert.equal(input.records.length,24);
    if(validating){
      const raw=read(file);assert(raw.complete);assert.deepEqual(raw.sources,sources);assert.equal(raw.inputHash,r.inputHash);assert.deepEqual(raw.tests,r.tests);assert.equal(raw.records.length,24);
      for(let i=0;i<24;i++){validate(raw.records[i],input.records[i]);assert(cpu()<75,'Validation CPU reserve');}
      assert.deepEqual(raw.summary,summary(raw));
      const bad=structuredClone(raw.records[0]);bad.samples[1].frame.polygons[0][0][0]+=.2;assert.throws(()=>validate(bad,input.records[0]),/Metric mismatch/);
      const labels=structuredClone(raw.records[0]);labels.job.seed++;assert.throws(()=>validate(labels,input.records[0]));
      const rim=structuredClone(raw.records[0]);rim.samples[1].frame.rimBonds=[];assert.throws(()=>validate(rim,input.records[0]),/Metric mismatch/);
      const wrong=structuredClone(raw.summary);wrong.pass=!wrong.pass;assert.throws(()=>assert.deepEqual(wrong,summary(raw)));
      Object.assign(r,{rawHash:hash(file),summary:raw.summary,frames:6424,corruptionsRejected:4});
    }else{
      for(const c of input.records){run(c,x=>r.records.push(x));assert(cpu()<75,'Execution CPU reserve');}r.summary=summary(r);
    }
    r.complete=true;
  }catch(e){error=e;r.error={message:e.message,stack:e.stack};}
  const bytes=Buffer.from(JSON.stringify(r)+'\n');fs.writeFileSync(target,validating?bytes:zlib.gzipSync(bytes),{flag:'wx'});
  const cost={cpuSeconds:cpu(),steps,complete:r.complete};fs.writeFileSync(target+'.cpu.json',JSON.stringify(cost)+'\n',{flag:'wx'});
  console.log(JSON.stringify({complete:r.complete,cost,tests:r.tests,pass:r.summary?.pass,strata:r.summary?.strata,
    opportunities:r.summary?.opportunities?.filter(c=>c.arm==='on'),error:r.error}));if(error)process.exitCode=1;
}
if(require.main===module)main();
