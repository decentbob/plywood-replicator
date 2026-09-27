#!/usr/bin/env node
'use strict';
// Original selected fixture; only orchestration and observation are new.
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),zlib=require('zlib');
const {Sim,F}=require('../src/sim'),api=require('./contact_handoff');
const {hash,rows}=require('./placement_release');
const INPUT='experiments/out/PR_selected.json',ARMS=['ordinary','seek','wait','pulse','hold'],STEPS=35000;
const SOURCES=[...api.sources,'experiments/handoff_closure.js','experiments/handoff_closure_plan.md'];
const clone=x=>JSON.parse(JSON.stringify(x));
function install(s,arm,marks){
  if(arm!=='ordinary')return api.install(s,arm,marks);
  // Observer buffers only: ordinary Sim never reads or writes these marks.
  s.hm=new Uint8Array(s.n*4);s.hm0=new Uint8Array(s.n*4);return s;
}
function restore(world,arm){return install(Sim.fromState(world.state),arm,world.marks);}
function pinGap(s,u){
  const q=s.bond[u*4+F];if(q<0)return null;const v=q>>2,a=s._sideCorners(u,F,[0,0]),b=s._sideCorners(v,q&3,[0,0]);
  return Math.max(...a.map((k,i)=>Math.hypot(s._dx(s.px[v]+s.ox[b[1-i]]-s.px[u]-s.ox[k]),s._dy(s.py[v]+s.oy[b[1-i]]-s.py[u]-s.oy[k]))));
}
function observe(s){
  const o=api.watch(s),physics=s._physics,supportPhases=[];
  s._physics=function(){
    const held=[];for(let u=0;u<this.n;u++)if(this.is[u]===api.LATCH&&this.bond[u*4+F]>=0)held.push({u,face:this.bond[u*4+F],beforeGap:pinGap(this,u)});
    const result=physics.call(this);
    if(held.length)supportPhases.push({t:this.t,contacts:held.map(x=>({...x,afterFace:this.bond[x.u*4+F],afterGap:pinGap(this,x.u)}))});
    return result;
  };
  return {...o,supportPhases};
}
function run(prepared,arm,observed=true){
  const s=install(Sim.fromState(prepared.state),arm),initial=api.save(s),o=observed?observe(s):{},windows=[],checkpoints=[];
  for(let dt=1;dt<=STEPS;dt++){
    s.step();
    if(observed&&dt%5000===0){assert.deepEqual(s.check(),[]);windows.push({t:s.t,rows:rows(s),stats:s.stats(),marks:api.marks(s)});}
    if(observed&&[10000,10300].includes(dt))checkpoints.push(api.save(s));
  }
  assert.deepEqual(s.check(),[]);assert.deepEqual(s.saveState().arrays.type,prepared.state.arrays.type);
  return {arm,initial,...o,windows,checkpoints,births:s.births,final:api.save(s)};
}
function load(file){const b=fs.readFileSync(file);return JSON.parse((file.endsWith('.gz')?zlib.gunzipSync(b):b).toString());}
function main(){
  const out=process.argv[2];assert(out,'Usage: node experiments/handoff_closure.js UNIQUE_OUTPUT_STEM');
  for(const ext of ['.json','.summary.json'])assert(!fs.existsSync(out+ext),'Output exists');
  const raw=fs.readFileSync(path.join(__dirname,'..',INPUT)),ref=JSON.parse(raw);
  require('./placement_release_summary').validate(ref);
  const prepared=ref.prepared;assert.equal(prepared.state.nums.t,15000);assert.equal(prepared.state.nums.n,150);
  const cpu=process.cpuUsage(),r={schema:1,prepared,results:[]};
  for(const arm of ARMS){
    const b=run(prepared,arm);r.results.push(b);
    if(arm==='ordinary'){
      const state=clone(b.final.state);delete state.arrays.hm;delete state.arrays.hm0;
      assert.equal(hash(state),ref.results.find(x=>x.arm==='keep').finalStateHash,'Ordinary control differs from section 56');
    }
    console.log(JSON.stringify({arm,settled:b.settled.map(x=>x.seq),supportPhases:b.supportPhases.length}));
  }
  r.provenance={baseline:'f013101',input:INPUT,inputHash:hash(raw),command:process.argv,node:process.version,date:new Date().toISOString(),
    sources:Object.fromEntries(SOURCES.map(f=>[f,hash(fs.readFileSync(path.join(__dirname,'..',f)))])),
    physicsSteps:STEPS*ARMS.length,cpuSeconds:Object.values(process.cpuUsage(cpu)).reduce((a,b)=>a+b,0)/1e6};
  // Write raw evidence before analysis; a validation failure must not erase runs.
  fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out+'.json',JSON.stringify(r)+'\n',{flag:'wx'});
  const summary=require('./handoff_closure_summary').validate(r,{replay:false});
  fs.writeFileSync(out+'.summary.json',JSON.stringify(summary,null,2)+'\n',{flag:'wx'});
  console.log(JSON.stringify({gate:summary.gate,cpuSeconds:r.provenance.cpuSeconds}));
}
module.exports={INPUT,ARMS,STEPS,SOURCES,install,restore,pinGap,observe,run,load};
if(require.main===module)main();
