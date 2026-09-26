#!/usr/bin/env node
const fs=require('fs'),path=require('path'),crypto=require('crypto'),assert=require('assert/strict');
const {Worker,isMainThread,parentPort,workerData}=require('worker_threads');
const {Sim,I_REPEL,I_TPL,R,L}=require('../src/sim.js');
const {profiles,instrument}=require('./curved_fuel.js');
const sequence='AAAABBBB';
function setup({seed,profile,rows,iters=4}) {
  const [bendA,bendB]=profiles[profile];
  const s=new Sim({seed,W:12,H:12,nA:4*rows,nB:4*rows,nE:0,nU:40,sizeU:1.2,seedCount:0,
    compCopy:true,pocket:true,pGrip:0.2,pReloadU:0.002,bendA,bendB,stiffA:0.5,stiffB:0.5,
    pFray:0,pSoft:0,pUndock:0.1,iters,bodyJostle:true,maxEventLog:0,maxBirthLog:10000});
  const strands=[];
  for(let row=0;row<rows;row++){const units=s.seedStrand(6,(row+0.5)*12/rows,0,8,sequence);assert(units);strands.push(units);}
  const units=strands.flat();for(const u of units)s.is[u]=I_REPEL;
  s._deriveAll();s._computeOpen();s._buildHash();assert.deepEqual(s.check(),[]);
  return {s,strands,units};
}
function run(job) {
  const {s,strands,units}=setup(job),types=Array.from(s.type),events=instrument(s,units),windows=[];
  for(let t=0;t<job.steps;t+=10000){s.run(Math.min(10000,job.steps-t));
    windows.push({until:s.t,armed:events.length,armedByRow:strands.map(row=>row.filter(u=>s.is[u]===I_TPL).length),fuelUsed:s.fuelUsed});}
  assert.deepEqual(s.check(),[]);assert.deepEqual(Array.from(s.type),types);assert.equal(s.births.length,0);
  assert.equal(s.fuelUsed,events.length);assert.equal(new Set(events.map(e=>e.index)).size,events.length);
  for(const row of strands)for(let i=0;i<7;i++)assert.equal(s.bond[row[i]*4+R],row[i+1]*4+L);
  const byRow=Array.from({length:job.rows},(_,row)=>{const es=events.filter(e=>Math.floor(e.index/8)===row);
    return {row,armed:es.length,armedA:es.filter(e=>e.letter==='A').length,completeTime:es.length===8?es.at(-1).t:null};});
  const cross=events.filter(e=>e.holders.some(h=>Math.floor(h.index/8)!==Math.floor(e.index/8)));
  return {...job,armed:events.length,perRow:events.length/job.rows,completeRows:byRow.filter(r=>r.completeTime!==null).length,
    cross:cross.length,crossA:cross.filter(e=>e.letter==='A').length,armedA:events.filter(e=>e.letter==='A').length,
    byRow,events,windows,params:s.p};
}
function main() {
  const o={out:'',seeds:'61,62',rows:'1,2,4',profiles:'square,opposed20',steps:50000,iters:4,workers:4};
  for(let i=2;i<process.argv.length;i+=2){const k=process.argv[i].replace(/^--/,'');assert(Object.hasOwn(o,k)&&process.argv[i+1]!==undefined);
    o[k]=typeof o[k]==='number'?Number(process.argv[i+1]):process.argv[i+1];}
  const seeds=o.seeds.split(',').map(Number),counts=o.rows.split(',').map(Number),shapes=o.profiles.split(',');
  assert(o.out&&Number.isInteger(o.steps)&&o.steps>=10000&&o.steps%10000===0&&Number.isInteger(o.workers)&&o.workers>=1&&o.workers<=4);
  assert(Number.isInteger(o.iters)&&o.iters>0&&seeds.every(Number.isInteger)&&counts.every(n=>[1,2,4].includes(n))&&shapes.every(s=>profiles[s]));
  for(const xs of [seeds,counts,shapes])assert.equal(new Set(xs).size,xs.length);
  const jobs=seeds.flatMap(seed=>counts.flatMap(rows=>shapes.map(profile=>({seed,rows,profile,steps:o.steps,iters:o.iters}))));
  const files=['.csv','.runs.jsonl','.manifest.json'].map(x=>o.out+x);assert(files.every(f=>!fs.existsSync(f)));fs.mkdirSync(path.dirname(o.out),{recursive:true});
  const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
  const m={options:o,jobs,complete:false,completed:0,node:process.version,started:new Date().toISOString(),
    sources:Object.fromEntries(['../src/sim.js','curved_collective.js','curved_fuel.js'].map(f=>[f,hash(path.join(__dirname,f))]))};
  const cols=['seed','rows','profile','steps','iters','armed','perRow','completeRows','cross','crossA','armedA'];
  const write=()=>fs.writeFileSync(files[2],JSON.stringify(m,null,2)+'\n');
  fs.writeFileSync(files[0],cols.join(',')+'\n',{flag:'wx'});fs.writeFileSync(files[1],'',{flag:'wx'});write();
  const cpu=process.cpuUsage(),wall=Date.now();let next=0,active=0,failed=false;
  function launch(){while(!failed&&active<o.workers&&next<jobs.length){const w=new Worker(__filename,{workerData:jobs[next++]});active++;let received=false;
    w.on('message',r=>{assert(!received);received=true;m.completed++;fs.appendFileSync(files[1],JSON.stringify(r)+'\n');
      fs.appendFileSync(files[0],cols.map(k=>r[k]??'').join(',')+'\n');write();console.error(JSON.stringify({completed:m.completed,total:jobs.length,
        seed:r.seed,rows:r.rows,profile:r.profile,perRow:r.perRow,completeRows:r.completeRows,crossA:r.crossA}));});
    w.on('error',e=>{failed=true;process.exitCode=1;console.error(e);});
    w.on('exit',code=>{active--;if(code||!received){failed=true;process.exitCode=1;}
      if(!active&&(failed||next===jobs.length)){const c=process.cpuUsage(cpu);Object.assign(m,{complete:!failed,finished:new Date().toISOString(),
        cpuSeconds:(c.user+c.system)/1e6,wallSeconds:(Date.now()-wall)/1000});write();}launch();});}}
  launch();
}
if(!isMainThread&&require.main===module)parentPort.postMessage(run(workerData));
else if(require.main===module)main();
module.exports={setup,run};
