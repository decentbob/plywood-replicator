#!/usr/bin/env node
const fs=require('fs'),path=require('path'),crypto=require('crypto'),assert=require('assert/strict');
const {Worker,isMainThread,parentPort,workerData}=require('worker_threads');
const {Sim}=require('../src/sim.js'),{setup}=require('./curved_fuel_reproduction.js'),{observe}=require('./offspring_recovery.js');
const arms={control:{},energy:{energyGate:false},turnover:{pFray:0.00003,pUnzip:1},both:{energyGate:false,pFray:0.00003,pUnzip:1}};
const hash=o=>crypto.createHash('sha256').update(JSON.stringify(o)).digest('hex');
function follow(s,cohort){
  const lost=cohort.map(()=>null),owner=new Map(),events=[];
  for(const [i,row]of cohort.entries())for(const u of row.units)owner.set(u,i);
  const original=s._event;
  s._event=function(kind,u,v){const result=original.call(this,kind,u,v);
    if(kind==='fray'&&owner.has(u)){const id=owner.get(u);if(lost[id]===null)lost[id]=this.t;}
    if(kind==='birth'){
      const units=this.strandOf(u),parents=units.map(x=>this.parentOf[x]),ids=[...new Set(parents.map(x=>owner.get(x)??null))];let parent=null;
      if(ids.length===1&&ids[0]!==null&&lost[ids[0]]===null){const row=cohort[ids[0]];
        if(this.strandOf(parents[0]).join(',')===row.units.join(','))parent=ids[0];}
      events.push({t:this.t,units,parents,cohortParent:parent,seq:units.map(x=>this._letter(x)).join('')});
    }return result;
  };return {lost,events};
}
function branch(state,cohort,arm,steps){
  const s=Sim.fromState(state,arms[arm]),types=Array.from(s.type),start=s.t,initial=s.stats(),o=follow(s,cohort),windows=[];
  s.births.length=0;
  for(let t=0;t<steps;t+=10000){s.run(Math.min(10000,steps-t));windows.push({stats:s.stats(),intact:o.lost.filter(t=>t===null).length});assert.deepEqual(s.check(),[]);}
  assert.deepEqual(Array.from(s.type),types);assert.equal(o.events.length,s.births.length);
  const births=s.births.map((b,i)=>{const e=o.events[i];assert.equal(e.t,b.t);assert.equal(e.seq,b.seq);return {...b,...e};});
  return {arm,params:s.p,start,steps,initial,windows,births,lost:o.lost,exactCohort:births.filter(b=>b.cohortParent!==null&&b.seq==='AAAABBBB'&&b.parent==='AAAABBBB').length};
}
function run(job){
  const {s,founders}=setup({seed:job.seed,profile:job.profile,mode:'bootstrap',rows:4,grip:true,iters:4}),o=observe(s,founders);
  s.run(job.forkAt);assert.deepEqual(s.check(),[]);
  const archived=fs.readFileSync(job.reference,'utf8').trim().split(/\r?\n/).map(JSON.parse).find(r=>r.seed===job.seed&&r.profile===job.profile&&r.grip);
  assert(archived&&archived.steps===job.forkAt);assert.deepEqual(s.births,archived.births);assert.deepEqual(s.stats(),archived.windows.at(-1));
  const state=JSON.parse(JSON.stringify(s.saveState())),cohort=o.rows.filter(r=>r.born>0).map(({id,units,born,seq,gen})=>({id,units,born,seq,gen}));
  const result={...job,sourceStateHash:hash(state),cohort,arms:Object.keys(arms).map(arm=>branch(state,cohort,arm,job.steps))};
  assert.equal(hash(state),result.sourceStateHash,'Branch mutated source state');return result;
}
function main(){
  const o={out:'',seeds:'73,74',profiles:'square,opposed20',forkAt:100000,steps:50000,workers:4,reference:path.join(__dirname,'out','UF_bootstrap_confirm.runs.jsonl')};
  for(let i=2;i<process.argv.length;i+=2){const k=process.argv[i].replace(/^--/,'');assert(Object.hasOwn(o,k)&&process.argv[i+1]!==undefined);o[k]=typeof o[k]==='number'?Number(process.argv[i+1]):process.argv[i+1];}
  const seeds=o.seeds.split(',').map(Number),profiles=o.profiles.split(',');assert(o.out&&o.steps>=10000&&o.steps%10000===0&&o.forkAt>0&&Number.isInteger(o.workers)&&o.workers>=1&&o.workers<=4);
  assert(seeds.every(Number.isInteger)&&profiles.every(p=>['square','opposed20'].includes(p)));assert.equal(new Set(seeds).size,seeds.length);assert.equal(new Set(profiles).size,profiles.length);
  const jobs=seeds.flatMap(seed=>profiles.map(profile=>({seed,profile,forkAt:o.forkAt,steps:o.steps,reference:o.reference})));
  const files=['.runs.jsonl','.manifest.json'].map(ext=>o.out+ext);assert(files.every(f=>!fs.existsSync(f)));fs.mkdirSync(path.dirname(o.out),{recursive:true});
  const fileHash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
  const m={options:o,jobs,complete:false,completed:0,node:process.version,started:new Date().toISOString(),sources:Object.fromEntries(
    ['../src/sim.js','curved_fuel_reproduction.js','curved_fuel.js','offspring_recovery.js','offspring_forks.js'].map(f=>[f,fileHash(path.join(__dirname,f))]))};
  const write=()=>fs.writeFileSync(files[1],JSON.stringify(m,null,2)+'\n');fs.writeFileSync(files[0],'',{flag:'wx'});write();
  const cpu=process.cpuUsage(),wall=Date.now();let next=0,active=0,failed=false;
  function launch(){while(!failed&&active<o.workers&&next<jobs.length){const w=new Worker(__filename,{workerData:jobs[next++]});active++;let received=false;
    w.on('message',r=>{assert(!received);received=true;m.completed++;fs.appendFileSync(files[0],JSON.stringify(r)+'\n');write();console.error(JSON.stringify({completed:m.completed,seed:r.seed,profile:r.profile,
      arms:r.arms.map(a=>({arm:a.arm,births:a.births.length,exactCohort:a.exactCohort,free:a.windows.at(-1).stats.free,intact:a.lost.filter(t=>t===null).length}))}));});
    w.on('error',e=>{failed=true;process.exitCode=1;console.error(e);});w.on('exit',code=>{active--;if(code||!received){failed=true;process.exitCode=1;}
      if(!active&&(failed||next===jobs.length)){const c=process.cpuUsage(cpu);Object.assign(m,{complete:!failed,cpuSeconds:(c.user+c.system)/1e6,wallSeconds:(Date.now()-wall)/1000,finished:new Date().toISOString()});write();}launch();});}}
  launch();
}
if(!isMainThread&&require.main===module)parentPort.postMessage(run(workerData));else if(require.main===module)main();
module.exports={arms,follow,branch,run};
