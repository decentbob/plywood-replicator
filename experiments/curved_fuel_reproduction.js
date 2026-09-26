#!/usr/bin/env node
const fs=require('fs'),path=require('path'),crypto=require('crypto'),assert=require('assert/strict');
const {Worker,isMainThread,parentPort,workerData}=require('worker_threads');
const {Sim,I_REPEL,I_TPL,T_A,T_B,K,S}=require('../src/sim.js');
const {profiles}=require('./curved_fuel.js');
const sequence='AAAABBBB';
function setup(job){
  const [bendA,bendB]=profiles[job.profile],copy=job.mode==='copy';
  assert(['copy','bootstrap'].includes(job.mode));assert(!copy||job.rows===1);
  const s=new Sim({seed:job.seed,W:18,H:18,nA:60,nB:60,nE:0,nU:copy?0:40,sizeU:1.2,seedCount:0,
    compCopy:true,pocket:true,pGrip:job.grip?0.2:0,pReloadU:0.002,bendA,bendB,stiffA:0.5,stiffB:0.5,
    pFray:0,pSoft:0,pUndock:0.1,iters:job.iters,bodyJostle:true,maxEventLog:0,maxBirthLog:10000});
  const founders=[];for(let row=0;row<job.rows;row++){const units=s.seedStrand(9,(row+0.5)*18/job.rows,0,8,sequence);assert(units);founders.push(...units);}
  if(!copy)for(const u of founders)s.is[u]=I_REPEL;
  s._deriveAll();s._computeOpen();s._buildHash();assert.deepEqual(s.check(),[]);
  return {s,founders};
}
function instrument(s){const events=[],original=s._transition.bind(s);
  s._transition=function(u){const was=this.is[u],q=this.bond[u*4+K];
    const fuel=q>=0&&this.ss[q]===S.GIVE?q>>2:null;
    original(u);
    if((this.type[u]===T_A||this.type[u]===T_B)&&was===I_REPEL&&this.is[u]===I_TPL){assert.notEqual(fuel,null,'Arming without fuel');
      events.push({t:this.t,unit:u,letter:this._letter(u),gen:this.gen[u],fuel});}
  };return events;
}
function run(job,progress=()=>{}){
  const {s,founders}=setup(job),types=Array.from(s.type),events=instrument(s),windows=[],births=[];
  for(let t=0;t<job.steps;t+=10000){s.run(Math.min(10000,job.steps-t));const st=s.stats();
    windows.push(st);births.push(...s.births);s.births.length=0;assert.deepEqual(s.check(),[]);assert.deepEqual(Array.from(s.type),types);
    if(s.t===20000)progress({seed:job.seed,profile:job.profile,mode:job.mode,rows:job.rows,grip:job.grip,t:s.t,births:st.births,fuelUsed:st.fuelUsed});}
  assert.equal(s.fuelUsed,events.length);assert.equal(new Set(events.map(e=>e.unit)).size,events.length);
  if(job.mode==='copy'){const ids=new Set(founders);for(let u=0;u<s.n;u++)if((s.type[u]===T_A||s.type[u]===T_B)&&s.is[u]===I_TPL)assert(ids.has(u));}
  return {...job,params:s.p,windows,births,events,total:births.length,family:births.filter(b=>b.seq===sequence&&b.parent===sequence).length,
    fuelUsed:s.fuelUsed,maxGen:s.maxGen,free:windows.at(-1).free};
}
function main(){
  const o={out:'',mode:'copy',seeds:'71,72',rows:'1',profiles:'square,opposed20',grips:'1',steps:20000,iters:4,workers:4};
  for(let i=2;i<process.argv.length;i+=2){const k=process.argv[i].replace(/^--/,'');assert(Object.hasOwn(o,k)&&process.argv[i+1]!==undefined);
    o[k]=typeof o[k]==='number'?Number(process.argv[i+1]):process.argv[i+1];}
  const seeds=o.seeds.split(',').map(Number),counts=o.rows.split(',').map(Number),shapes=o.profiles.split(','),grips=o.grips.split(',').map(Number);
  assert(o.out&&['copy','bootstrap'].includes(o.mode)&&Number.isInteger(o.steps)&&o.steps>=20000&&o.steps%10000===0);
  assert(Number.isInteger(o.iters)&&o.iters>0&&Number.isInteger(o.workers)&&o.workers>=1&&o.workers<=4);
  assert(seeds.every(Number.isInteger)&&counts.every(n=>[1,4].includes(n))&&shapes.every(s=>['square','opposed20'].includes(s))&&grips.every(n=>[0,1].includes(n)));
  for(const xs of[seeds,counts,shapes,grips])assert.equal(new Set(xs).size,xs.length);
  assert(o.mode!=='copy'||(counts.length===1&&counts[0]===1));
  const jobs=seeds.flatMap(seed=>counts.flatMap(rows=>shapes.flatMap(profile=>grips.map(grip=>({seed,rows,profile,grip:!!grip,mode:o.mode,steps:o.steps,iters:o.iters})))));
  const files=['.csv','.runs.jsonl','.manifest.json'].map(x=>o.out+x);assert(files.every(f=>!fs.existsSync(f)));fs.mkdirSync(path.dirname(o.out),{recursive:true});
  const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
  const m={options:o,jobs,complete:false,completed:0,node:process.version,started:new Date().toISOString(),
    sources:Object.fromEntries(['../src/sim.js','curved_fuel_reproduction.js','curved_fuel.js'].map(f=>[f,hash(path.join(__dirname,f))]))};
  const cols=['seed','rows','profile','grip','mode','steps','iters','total','family','fuelUsed','maxGen','free'];
  const write=()=>fs.writeFileSync(files[2],JSON.stringify(m,null,2)+'\n');fs.writeFileSync(files[0],cols.join(',')+'\n',{flag:'wx'});fs.writeFileSync(files[1],'',{flag:'wx'});write();
  const cpu=process.cpuUsage(),wall=Date.now();let next=0,active=0,failed=false;
  function launch(){while(!failed&&active<o.workers&&next<jobs.length){const w=new Worker(__filename,{workerData:jobs[next++]});active++;let received=false;
    w.on('message',message=>{if(message.kind==='progress'){console.error(JSON.stringify(message));return;}
      assert(message.kind==='result'&&!received);received=true;const r=message.value;m.completed++;fs.appendFileSync(files[1],JSON.stringify(r)+'\n');
      fs.appendFileSync(files[0],cols.map(k=>r[k]??'').join(',')+'\n');write();console.error(JSON.stringify({completed:m.completed,totalJobs:jobs.length,
        seed:r.seed,rows:r.rows,profile:r.profile,grip:r.grip,total:r.total,family:r.family,fuel:r.fuelUsed,maxGen:r.maxGen}));});
    w.on('error',e=>{failed=true;process.exitCode=1;console.error(e);});w.on('exit',code=>{active--;if(code||!received){failed=true;process.exitCode=1;}
      if(!active&&(failed||next===jobs.length)){const c=process.cpuUsage(cpu);Object.assign(m,{complete:!failed,finished:new Date().toISOString(),
        cpuSeconds:(c.user+c.system)/1e6,wallSeconds:(Date.now()-wall)/1000});write();}launch();});}}
  launch();
}
if(!isMainThread&&require.main===module)parentPort.postMessage({kind:'result',value:run(workerData,p=>parentPort.postMessage({kind:'progress',...p}))});
else if(require.main===module)main();
module.exports={setup,instrument,run};
