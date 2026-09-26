#!/usr/bin/env node
// Existing physics only. Founder identity is used exclusively by observers.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),assert=require('assert/strict');
const {Worker,isMainThread,parentPort,workerData}=require('worker_threads');
const {Sim,F,K,L,R,I_TPL,LETTERS}=require('../src/sim.js');
const sequence='ABBABA',expected='ABABBA';

function geometry(s,template) {
  let bend=0,occupied=0,supported=0;
  for(let i=0;i<template.length;i++) {
    const u=template[i];
    occupied+=s.bond[u*4+F]>=0;supported+=s.bond[u*4+K]>=0;
    if(i){const a=s._side(template[i-1],F,[0,0,0,0]),b=s._side(u,F,[0,0,0,0]);
      bend+=Math.acos(Math.max(-1,Math.min(1,a[2]*b[2]+a[3]*b[3])))*180/Math.PI;}
  }
  return {bend:bend/(template.length-1),occupied:occupied/template.length,supported:supported/template.length};
}

function setup({seed,angle,attached,mode='bend',stiffness=0.5,iters=4,bodyJostle=true}) {
  assert(['bend','fold'].includes(mode));
  const s=new Sim({seed,W:18,H:18,nA:60,nB:60,nE:0,n1:3,n2:3,seedCount:0,
    translate:true,transCode:'A1,B2',catalysis:true,pLinkBare:1,pBindP:attached?0.2:0,
    pPMelt:0,pPMeltRun:0,pFray:0,pSoft:0,pUndock:0.1,energyGate:true,
    stiffA:stiffness,stiffB:stiffness,stiff1:1,stiff2:1,[mode+'B']:angle,iters,bodyJostle,
    maxEventLog:0,maxBirthLog:10000});
  const template=s.seedStrand(9,9,0,6,sequence),brace=s.seedStrand(9,8,0,6,'122121');
  assert(template&&brace);
  const side=s._side(template[0],K,[0,0,0,0]);
  for(let i=0;i<brace.length;i++) {
    s.px[brace[i]]=s._wx(s.px[template[i]]+side[2]);
    s.py[brace[i]]=s._wy(s.py[template[i]]+side[3]);
    if(attached)s._link(brace[i],F,template[i],K);
  }
  s._deriveAll();s._computeOpen();s._buildHash();assert.deepEqual(s.check(),[]);
  return {s,template,brace};
}
function counters() {
  return {samples:0,bend:0,faceOccupancy:0,supportOccupancy:0,
    edges:Array.from({length:5},(_,index)=>({index,pair:sequence.slice(index,index+2),both:0,joined:0,
      unjoined:0,eligible:0,geometryPass:0,distanceFail:0,angleFail:0,gapSum:0,angleSum:0}))};
}
function observe(s,template,c) {
  const g=geometry(s,template);c.samples++;c.bend+=g.bend;c.faceOccupancy+=g.occupied;c.supportOccupancy+=g.supported;
  for(let i=0;i<5;i++) {
    const a=s.bond[template[i]*4+F],b=s.bond[template[i+1]*4+F],e=c.edges[i];
    if(a<0||b<0)continue;
    e.both++;const u=a>>2,v=b>>2;
    if(s.bond[u*4+L]===v*4+R){e.joined++;continue;}
    e.unjoined++;
    if(s.bond[u*4+L]>=0||s.bond[v*4+R]>=0||s.compat(u,L,v,R)<=0)continue;
    e.eligible++;
    const su=s._side(u,L,[0,0,0,0]),sv=s._side(v,R,[0,0,0,0]);
    const dx=s._dx(s.px[v]-s.px[u]),dy=s._dy(s.py[v]-s.py[u]);
    const gap=Math.hypot(dx+sv[0]-su[0],dy+sv[1]-su[1]);
    const angle=Math.acos(Math.max(-1,Math.min(1,-su[2]*sv[2]-su[3]*sv[3])))*180/Math.PI;
    e.gapSum+=gap;e.angleSum+=angle;
    if(gap>s.p.linkDistTol*(s.size[u]+s.size[v])/2)e.distanceFail++;
    if(angle>s.p.linkTolDeg)e.angleFail++;
    if(s._geomOK(u,L,v,R,dx,dy,Math.hypot(dx,dy)))e.geometryPass++;
  }
}
function run(job) {
  const {s,template,brace}=setup(job),types=Array.from(s.type),founders=new Set(template),windows=[];
  let c=counters();
  for(let t=0;t<job.steps;t+=20) {
    s.run(Math.min(20,job.steps-t));observe(s,template,c);
    if(s.t%5000===0||s.t===job.steps){windows.push({until:s.t,...c});c=counters();}
  }
  assert.deepEqual(s.check(),[]);assert.deepEqual(Array.from(s.type),types);
  for(let u=0;u<s.n;u++)if(LETTERS.includes(s.type[u])&&s.is[u]===I_TPL)assert(founders.has(u),'Offspring rearmed');
  for(let i=0;i<6;i++)assert.equal(s.bond[brace[i]*4+F],job.attached?template[i]*4+K:-1);
  const births=s.births.filter(b=>!b.prod),exact=births.filter(b=>b.seq===expected&&b.parent===sequence);
  const n=windows.reduce((a,c)=>a+c.samples,0),mean=k=>windows.reduce((a,c)=>a+c[k],0)/n;
  return {...job,exact:exact.length,other:births.length-exact.length,firstExact:exact[0]?.t??null,
    meanBend:mean('bend'),faceOccupancy:mean('faceOccupancy'),supportOccupancy:mean('supportOccupancy'),
    docks:s.dockEvents,windows,params:s.p,births:s.births};
}
function main() {
  const o={out:'',steps:20000,seeds:'11,12',angles:'0,10,20,30',mode:'bend',stiffness:0.5,iters:4,bodyJostle:1,workers:4};
  for(let i=2;i<process.argv.length;i+=2){const k=process.argv[i].replace(/^--/,'');
    assert(Object.hasOwn(o,k)&&process.argv[i+1]!==undefined,'Unknown option');
    o[k]=typeof o[k]==='number'?Number(process.argv[i+1]):process.argv[i+1];}
  const seeds=o.seeds.split(',').map(Number),angles=o.angles.split(',').map(Number);
  assert(o.out&&Number.isInteger(o.steps)&&o.steps>0&&o.steps%20===0);
  assert(Number.isInteger(o.workers)&&o.workers>=1&&o.workers<=4&&[0,1].includes(o.bodyJostle));
  assert(seeds.every(Number.isInteger)&&angles.every(x=>Number.isFinite(x)&&x>=0&&x<=45));
  assert(new Set(seeds).size===seeds.length&&new Set(angles).size===angles.length);
  assert(['bend','fold'].includes(o.mode)&&o.stiffness>0&&o.stiffness<=1&&Number.isInteger(o.iters)&&o.iters>0);
  const files=['.csv','.runs.jsonl','.manifest.json'].map(x=>o.out+x);assert(files.every(f=>!fs.existsSync(f)),'Output exists');
  fs.mkdirSync(path.dirname(o.out),{recursive:true});
  const jobs=seeds.flatMap(seed=>angles.flatMap(angle=>[false,true].map(attached=>({seed,angle,attached,
    steps:o.steps,mode:o.mode,stiffness:o.stiffness,iters:o.iters,bodyJostle:!!o.bodyJostle}))));
  const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
  const m={options:o,jobs,complete:false,completed:0,started:new Date().toISOString(),node:process.version,
    sources:Object.fromEntries(['../src/sim.js','geometric_bottleneck.js'].map(f=>[f,hash(path.join(__dirname,f))]))};
  const cols=['seed','angle','attached','steps','mode','stiffness','iters','bodyJostle','exact','other','firstExact','meanBend','faceOccupancy','supportOccupancy','docks'];
  const write=()=>fs.writeFileSync(files[2],JSON.stringify(m,null,2)+'\n');
  fs.writeFileSync(files[0],cols.join(',')+'\n',{flag:'wx'});fs.writeFileSync(files[1],'',{flag:'wx'});write();
  const cpu=process.cpuUsage(),wall=Date.now();let next=0,active=0,failed=false;
  function launch(){while(!failed&&active<o.workers&&next<jobs.length){
    const job=jobs[next++],w=new Worker(__filename,{workerData:job});active++;let received=false;
    w.on('message',r=>{assert(!received,'Duplicate worker result');received=true;m.completed++;fs.appendFileSync(files[1],JSON.stringify(r)+'\n');
      fs.appendFileSync(files[0],cols.map(k=>r[k]??'').join(',')+'\n');write();
      console.error(JSON.stringify({completed:m.completed,total:jobs.length,seed:r.seed,angle:r.angle,attached:r.attached,exact:r.exact,bend:r.meanBend}));});
    w.on('error',e=>{failed=true;process.exitCode=1;console.error(e);});
    w.on('exit',code=>{active--;if(code||!received){failed=true;process.exitCode=1;}
      if(!active&&(failed||next===jobs.length)){const c=process.cpuUsage(cpu);Object.assign(m,{complete:!failed,
        finished:new Date().toISOString(),cpuSeconds:(c.user+c.system)/1e6,wallSeconds:(Date.now()-wall)/1000});write();}launch();});
  }}launch();
}
if(!isMainThread&&require.main===module)parentPort.postMessage(run(workerData));
else if(require.main===module)main();
module.exports={setup,counters,observe,run};
