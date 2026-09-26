#!/usr/bin/env node
// Short viability check after the isolated geometric assay; ordinary Sim only.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),assert=require('assert/strict');
const {Worker,isMainThread,parentPort,workerData}=require('worker_threads');
const {Sim}=require('../src/sim.js');
const {profiles,child}=require('./complementary_fit.js');
function run(job) {
  const [bendA,bendB]=profiles[job.profile];
  const s=new Sim({seed:job.seed,W:24,H:24,nA:120,nB:120,nE:40,seedCount:3,seedSeq:'ABBABA',
    compCopy:job.complement,bendA,bendB,stiffA:0.5,stiffB:0.5,pFray:0.00003,pUnzip:1,pSoft:0,
    maxEventLog:0,maxBirthLog:10000}),types=Array.from(s.type),windows=[],births=[];
  for(let t=0;t<job.steps;t+=10000){s.run(Math.min(10000,job.steps-t));const st=s.stats();
    windows.push(st);births.push(...s.births);s.births.length=0;
    assert.deepEqual(s.check(),[]);assert.deepEqual(Array.from(s.type),types);}
  return {...job,params:s.p,windows,births,exact:births.filter(b=>b.seq===child(b.parent,job.complement)).length};
}
function main() {
  const o={out:'',seeds:'41,42',steps:50000,workers:3};
  for(let i=2;i<process.argv.length;i+=2){const k=process.argv[i].replace(/^--/,'');assert(Object.hasOwn(o,k)&&process.argv[i+1]!==undefined);
    o[k]=typeof o[k]==='number'?Number(process.argv[i+1]):process.argv[i+1];}
  const seeds=o.seeds.split(',').map(Number);assert(o.out&&seeds.every(Number.isInteger)&&new Set(seeds).size===seeds.length);
  assert(Number.isInteger(o.steps)&&o.steps>=20000&&o.steps%10000===0&&Number.isInteger(o.workers)&&o.workers>=1&&o.workers<=4);
  const jobs=seeds.flatMap(seed=>['square','opposed'].flatMap(profile=>[false,true].map(complement=>({seed,profile,complement,steps:o.steps}))));
  const files=['.csv','.runs.jsonl','.manifest.json'].map(x=>o.out+x);assert(files.every(f=>!fs.existsSync(f)),'Output exists');fs.mkdirSync(path.dirname(o.out),{recursive:true});
  const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
  const m={options:o,jobs,complete:false,completed:0,node:process.version,started:new Date().toISOString(),sources:Object.fromEntries(
    ['../src/sim.js','complementary_population.js','complementary_fit.js','geometric_bottleneck.js'].map(f=>[f,hash(path.join(__dirname,f))]))};
  const cols=['seed','profile','complement','t','births','maxGen','strands','meanLen','tpl','free','energyUsed'];
  const write=()=>fs.writeFileSync(files[2],JSON.stringify(m,null,2)+'\n');
  fs.writeFileSync(files[0],cols.join(',')+'\n',{flag:'wx'});fs.writeFileSync(files[1],'',{flag:'wx'});write();
  const cpu=process.cpuUsage(),wall=Date.now();let next=0,active=0,failed=false;
  function launch(){while(!failed&&active<o.workers&&next<jobs.length){const w=new Worker(__filename,{workerData:jobs[next++]});active++;let received=false;
    w.on('message',r=>{assert(!received,'Duplicate result');received=true;m.completed++;fs.appendFileSync(files[1],JSON.stringify(r)+'\n');
      for(const st of r.windows){const row={...r,...st};fs.appendFileSync(files[0],cols.map(k=>row[k]??'').join(',')+'\n');}write();
      console.error(JSON.stringify({completed:m.completed,total:jobs.length,seed:r.seed,profile:r.profile,complement:r.complement,
        births:r.births.length,exact:r.exact,maxGen:r.windows.at(-1).maxGen,births20k:r.windows.find(w=>w.t===20000).births}));});
    w.on('error',e=>{failed=true;process.exitCode=1;console.error(e);});
    w.on('exit',code=>{active--;if(code||!received){failed=true;process.exitCode=1;}
      if(!active&&(failed||next===jobs.length)){const c=process.cpuUsage(cpu);Object.assign(m,{complete:!failed,finished:new Date().toISOString(),
        cpuSeconds:(c.user+c.system)/1e6,wallSeconds:(Date.now()-wall)/1000});write();}launch();});}}
  launch();
}
if(!isMainThread&&require.main===module)parentPort.postMessage(run(workerData));
else if(require.main===module)main();
module.exports={run};
