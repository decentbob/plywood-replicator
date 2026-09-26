#!/usr/bin/env node
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const {Worker,isMainThread,parentPort,workerData}=require('worker_threads');
const {Sim,F,NV}=require('../src/sim');
const {setup}=require('./patch_completion');
const {SEEK,install,observe}=require('./local_redocking');
const {hash,rows}=require('./placement_release');
const {geometry}=require('./anchor_access');
const cases=[{profile:'square',at:5316,u:114},{profile:'opposed20',at:28184,u:107}];
const arms=[4,8].flatMap(iters=>[0.5,0.8].map(stiff=>({iters,stiff})));
const sources=['src/sim.js','experiments/end_protection.js','experiments/end_protection_natural.js','experiments/patch_completion.js','experiments/placement_release.js','experiments/local_redocking.js','experiments/anchor_access.js','experiments/registration_fit.js'];
function deformation(s,units){
  let error=0,corners=0;const perUnit=[];
  for(const u of units){const o=u*NV,r=s._restSlot(u)*NV,n=s.corners(u);let mx=0,my=0,A=0,B=0,e=0;
    for(let k=0;k<n;k++){mx+=s.ox[o+k];my+=s.oy[o+k];}mx/=n;my/=n;
    for(let k=0;k<n;k++){const x=s.ox[o+k]-mx,y=s.oy[o+k]-my;A+=s.rx[r+k]*x+s.ry[r+k]*y;B+=s.rx[r+k]*y-s.ry[r+k]*x;}
    const h=Math.hypot(A,B)||1,c=A/h,t=B/h;
    for(let k=0;k<n;k++){const dx=s.ox[o+k]-mx-(c*s.rx[r+k]-t*s.ry[r+k]),dy=s.oy[o+k]-my-(t*s.rx[r+k]+c*s.ry[r+k]);e+=dx*dx+dy*dy;}
    perUnit.push({u,rms:Math.sqrt(e/n)});error+=e;corners+=n;
  }
  return {rms:Math.sqrt(error/corners),perUnit};
}
function watch(s,p){
  const o=observe(s),checks=[],placements=[],geom=s._geomOK,form=s._formBond;
  const partner=(u,i,v,j)=>i===F&&j===F?(u===p.u?v:v===p.u?u:null):null;
  s._geomOK=function(u,i,v,j,dx,dy,d){const result=geom.call(this,u,i,v,j,dx,dy,d),v0=partner(u,i,v,j);
    if(v0!==null){const gate=geometry(this,u,i,v,j,dx,dy,d);assert.equal(result,gate==='pass');checks.push({t:this.t,partner:v0,site:p.parent.indexOf(v0),gate});}return result;};
  s._formBond=function(u,i,v,j){const v0=partner(u,i,v,j),result=form.call(this,u,i,v,j);
    if(v0!==null)placements.push({t:this.t,partner:v0,site:p.parent.indexOf(v0),accepted:result});return result;};
  return {...o,checks,placements};
}
function build(c,reference){
  const {s,parent}=setup({seed:87,profile:c.profile,undock:0.1});install(s,'seek',0.0001);const o=observe(s);s.run(c.at);
  assert.equal(s.is[c.u],SEEK);assert.equal(s.bond[c.u*4+F],-1);
  assert.deepEqual(o.events,reference.events.filter(e=>e.t<=c.at));assert.deepEqual(o.settled,reference.settled.filter(e=>e.t<=c.at));
  assert.deepEqual(s.births,reference.births.filter(e=>e.t<=c.at));
  const p={...c,parent,state:s.saveState(),target:s.strandOf(c.u)};assert(p.target.every(u=>s.bond[u*4+F]<0));
  s.run(5000);assert.deepEqual(o.events,reference.events.filter(e=>e.t<=s.t));assert.deepEqual(o.settled,reference.settled.filter(e=>e.t<=s.t));
  p.continuousState=s.saveState();p.referenceEvents=o.events.filter(e=>e.t>c.at);return p;
}
function start(p,a){const changes={iters:a.iters,...Object.fromEntries(['A','B','P','Q'].map(c=>['stiff'+c,a.stiff]))};
  return install(Sim.fromState(p.state,changes),'seek',0.0001);
}
function run(p,a){const s=start(p,a),initial=s.saveState(),o=watch(s,p),windows=[],shape=[{t:s.t,...deformation(s,p.target)}];
  for(let dt=1;dt<=5000;dt++){s.step();if([1,10,100,1000,2000,3000,4000,5000].includes(dt))shape.push({t:s.t,...deformation(s,p.target)});
    if(dt%1000===0){assert.deepEqual(s.check(),[]);windows.push({t:s.t,stats:s.stats(),rows:rows(s)});}}
  return {...a,profile:p.profile,initial,...o,shape,windows,births:s.births,final:s.saveState()};
}
async function main(){
  const out=process.argv[2];assert(out&&!fs.existsSync(out));fs.mkdirSync(path.dirname(out),{recursive:true});
  const input='experiments/out/RD_screen.json',raw=fs.readFileSync(input),reference=JSON.parse(raw),cpu=process.cpuUsage();
  const prepared=cases.map(c=>build(c,reference.results.find(r=>r.seed===87&&r.profile===c.profile&&r.mode==='seek')));
  const sourceHashes=Object.fromEntries(sources.map(f=>[f,hash(fs.readFileSync(f))])),results=[];
  for(const p of prepared){results.push(...await Promise.all(arms.map(a=>new Promise((resolve,reject)=>{
    const w=new Worker(__filename,{workerData:{p,a}});let result;w.on('message',r=>{result=r;console.error(JSON.stringify({profile:r.profile,stiff:r.stiff,iters:r.iters,settled:r.settled.map(x=>x.seq)}));});
    w.on('error',reject);w.on('exit',code=>code||!result?reject(Error('Worker failed')):resolve(result));
  }))));const control=results.find(r=>r.profile===p.profile&&r.stiff===0.5&&r.iters===4),plain=start(p,arms[0]);plain.run(5000);
    assert.deepEqual(control.final,plain.saveState());assert.deepEqual(control.events,p.referenceEvents);
    const normalized=structuredClone(control.final),delta=normalized.nums.pinsVersion-p.continuousState.nums.pinsVersion;
    assert.equal(delta,p.state.nums.bondsDirty?0:1);normalized.nums.pinsVersion=p.continuousState.nums.pinsVersion;assert.deepEqual(normalized,p.continuousState);p.cacheDelta=delta;
  }
  const c=process.cpuUsage(cpu);fs.writeFileSync(out,JSON.stringify({input,inputHash:hash(raw),sources:sourceHashes,prepared,arms,results,neutral:true,executedSteps:93500,cpuSeconds:(c.user+c.system)/1e6})+'\n',{flag:'wx'});
}
if(!isMainThread&&require.main===module)parentPort.postMessage(run(workerData.p,workerData.a));else if(require.main===module)main().catch(e=>{console.error(e);process.exitCode=1;});
module.exports={cases,arms,sources,deformation,watch,build,start,run};
