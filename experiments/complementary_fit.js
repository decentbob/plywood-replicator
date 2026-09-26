#!/usr/bin/env node
const fs=require('fs'),path=require('path'),crypto=require('crypto'),assert=require('assert/strict');
const {Worker,isMainThread,parentPort,workerData}=require('worker_threads');
const {Sim,I_TPL}=require('../src/sim.js');
const {observe,counters}=require('./geometric_bottleneck.js');
const profiles={square:[0,0],bonly:[0,20],positive:[20,20],opposed:[-20,20]};
const child=(sequence,complement)=>[...sequence].reverse().map(x=>complement?(x==='A'?'B':'A'):x).join('');
function setup({seed,profile,complement,sequence='ABBABA',iters=4,bodyJostle=true}) {
  assert(profiles[profile]&&sequence.length===6&&/^[AB]+$/.test(sequence));
  const [bendA,bendB]=profiles[profile];
  const s=new Sim({seed,W:18,H:18,nA:60,nB:60,nE:0,seedCount:0,compCopy:complement,
    pFray:0,pSoft:0,pUndock:0.1,energyGate:true,stiffA:0.5,stiffB:0.5,bendA,bendB,iters,bodyJostle,
    maxEventLog:0,maxBirthLog:10000});
  const template=s.seedStrand(9,9,0,6,sequence);assert(template);s._buildHash();assert.deepEqual(s.check(),[]);
  return {s,template};
}
function run(job) {
  const {s,template}=setup(job),types=Array.from(s.type),founders=new Set(template),windows=[];
  const fresh=()=>{const c=counters();c.edges.forEach(e=>e.pair=job.sequence.slice(e.index,e.index+2));return c;};
  let c=fresh();
  for(let t=0;t<job.steps;t+=20){s.run(Math.min(20,job.steps-t));observe(s,template,c);
    if(s.t%5000===0||s.t===job.steps){windows.push({until:s.t,...c});c=fresh();}}
  assert.deepEqual(s.check(),[]);assert.deepEqual(Array.from(s.type),types);
  for(let u=0;u<s.n;u++)if(s.is[u]===I_TPL)assert(founders.has(u),'Offspring rearmed');
  const expected=child(job.sequence,job.complement),exact=s.births.filter(b=>b.seq===expected&&b.parent===job.sequence);
  const n=windows.reduce((n,w)=>n+w.samples,0),mean=k=>windows.reduce((n,w)=>n+w[k],0)/n;
  return {...job,expected,exact:exact.length,other:s.births.length-exact.length,firstExact:exact[0]?.t??null,
    meanBend:mean('bend'),faceOccupancy:mean('faceOccupancy'),docks:s.dockEvents,windows,params:s.p,births:s.births};
}
function main() {
  const o={out:'',steps:20000,seeds:'21,22',profiles:'square,bonly,positive,opposed',sequences:'ABBABA',iters:4,bodyJostle:1,workers:4};
  for(let i=2;i<process.argv.length;i+=2){const k=process.argv[i].replace(/^--/,'');assert(Object.hasOwn(o,k)&&process.argv[i+1]!==undefined,'Unknown option');
    o[k]=typeof o[k]==='number'?Number(process.argv[i+1]):process.argv[i+1];}
  const seeds=o.seeds.split(',').map(Number),shapes=o.profiles.split(','),sequences=o.sequences.split(',');
  assert(o.out&&Number.isInteger(o.steps)&&o.steps>0&&o.steps%20===0);
  assert(Number.isInteger(o.workers)&&o.workers>=1&&o.workers<=4&&[0,1].includes(o.bodyJostle)&&Number.isInteger(o.iters)&&o.iters>0);
  assert(seeds.every(Number.isInteger)&&shapes.every(x=>profiles[x])&&sequences.every(x=>x.length===6&&/^[AB]+$/.test(x)));
  for(const xs of [seeds,shapes,sequences])assert.equal(new Set(xs).size,xs.length);
  const jobs=seeds.flatMap(seed=>sequences.flatMap(sequence=>shapes.flatMap(profile=>[false,true].map(complement=>({seed,profile,complement,sequence,
    steps:o.steps,iters:o.iters,bodyJostle:!!o.bodyJostle})))));
  const files=['.csv','.runs.jsonl','.manifest.json'].map(x=>o.out+x);assert(files.every(f=>!fs.existsSync(f)),'Output exists');fs.mkdirSync(path.dirname(o.out),{recursive:true});
  const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
  const m={options:o,jobs,complete:false,completed:0,started:new Date().toISOString(),node:process.version,
    sources:Object.fromEntries(['../src/sim.js','geometric_bottleneck.js','complementary_fit.js'].map(f=>[f,hash(path.join(__dirname,f))]))};
  const cols=['seed','profile','complement','sequence','steps','iters','bodyJostle','expected','exact','other','firstExact','meanBend','faceOccupancy','docks'];
  const write=()=>fs.writeFileSync(files[2],JSON.stringify(m,null,2)+'\n');
  fs.writeFileSync(files[0],cols.join(',')+'\n',{flag:'wx'});fs.writeFileSync(files[1],'',{flag:'wx'});write();
  const cpu=process.cpuUsage(),wall=Date.now();let next=0,active=0,failed=false;
  function launch(){while(!failed&&active<o.workers&&next<jobs.length){
    const w=new Worker(__filename,{workerData:jobs[next++]});active++;let received=false;
    w.on('message',r=>{assert(!received,'Duplicate worker result');received=true;m.completed++;fs.appendFileSync(files[1],JSON.stringify(r)+'\n');
      fs.appendFileSync(files[0],cols.map(k=>r[k]??'').join(',')+'\n');write();console.error(JSON.stringify({completed:m.completed,total:jobs.length,
        seed:r.seed,profile:r.profile,complement:r.complement,sequence:r.sequence,exact:r.exact,other:r.other}));});
    w.on('error',e=>{failed=true;process.exitCode=1;console.error(e);});
    w.on('exit',code=>{active--;if(code||!received){failed=true;process.exitCode=1;}
      if(!active&&(failed||next===jobs.length)){const c=process.cpuUsage(cpu);Object.assign(m,{complete:!failed,
        finished:new Date().toISOString(),cpuSeconds:(c.user+c.system)/1e6,wallSeconds:(Date.now()-wall)/1000});write();}launch();});
  }}launch();
}
if(!isMainThread&&require.main===module)parentPort.postMessage(run(workerData));
else if(require.main===module)main();
module.exports={setup,run,child,profiles};
