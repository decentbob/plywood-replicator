#!/usr/bin/env node
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const {Worker,isMainThread,parentPort,workerData}=require('worker_threads');
const {setup}=require('./patch_completion');
const {install,observe}=require('./local_redocking');
const {hash,rows}=require('./placement_release');
const jobs=[87,88].flatMap(seed=>['square','opposed20'].flatMap(profile=>['off','drop','seek'].map(mode=>({seed,profile,mode,rate:mode==='off'?0:0.0001,undock:0.1,steps:50000}))));
const sourceFiles=['src/sim.js','experiments/end_protection.js','experiments/end_protection_natural.js','experiments/patch_completion.js','experiments/placement_release.js','experiments/local_redocking.js','experiments/local_redocking_screen.js'];
function run(job){
  const {s,parent}=setup(job),prepared={state:s.saveState(),parent};install(s,job.mode,job.rate);const o=observe(s),windows=[];
  for(let i=0;i<10;i++){s.run(5000);assert.deepEqual(s.check(),[]);windows.push({t:s.t,stats:s.stats(),rows:rows(s)});}
  if(job.mode==='off'){const ordinary=setup(job).s;ordinary.run(job.steps);assert.deepEqual(s.saveState(),ordinary.saveState());}
  return {...job,prepared,...o,windows,births:s.births,final:s.saveState()};
}
async function main(){
  const out=process.argv[2];assert(out&&!fs.existsSync(out));fs.mkdirSync(path.dirname(out),{recursive:true});
  const sources=Object.fromEntries(sourceFiles.map(f=>[f,hash(fs.readFileSync(f))])),results=[],cpu=process.cpuUsage();
  for(let i=0;i<jobs.length;i+=4){results.push(...await Promise.all(jobs.slice(i,i+4).map(job=>new Promise((resolve,reject)=>{
    const w=new Worker(__filename,{workerData:job});let result;
    w.on('message',r=>{result=r;console.error(JSON.stringify({seed:r.seed,profile:r.profile,mode:r.mode,exact:r.settled.filter(x=>x.seq==='PAAAABBBBQ').length,partial:r.settled.filter(x=>x.seq!=='PAAAABBBBQ').length}));});
    w.on('error',reject);w.on('exit',code=>code||!result?reject(Error('Worker failed')):resolve(result));
  }))));}
  const c=process.cpuUsage(cpu);fs.writeFileSync(out,JSON.stringify({sources,jobs,results,neutral:true,executedSteps:800000,cpuSeconds:(c.user+c.system)/1e6})+'\n',{flag:'wx'});
}
if(!isMainThread&&require.main===module)parentPort.postMessage(run(workerData));else if(require.main===module)main().catch(e=>{console.error(e);process.exitCode=1;});
module.exports={jobs,sourceFiles,run};
