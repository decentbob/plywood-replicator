#!/usr/bin/env node
const fs=require('fs'),path=require('path'),crypto=require('crypto'),assert=require('assert/strict');
const {Worker,isMainThread,parentPort,workerData}=require('worker_threads');
const {setup}=require('./end_protection.js');
const {F,R,L,I_DOCK,T_P,T_Q,LETTERS}=require('../src/sim.js');
function inventory(s,known){
  const seen=new Set(),rows=[];
  for(let u=0;u<s.n;u++)if(LETTERS.includes(s.type[u])&&!seen.has(u)){
    const units=s.strandOf(u);for(const x of units)seen.add(x);if(units.length<2||units.every(x=>known.has(x)))continue;
    assert(units.every(x=>!known.has(x)),'Mixed logged/unlogged row');
    const states=units.map(x=>s.is[x]),faces=units.map(x=>s.bond[x*4+F]),eligible=[];
    units.forEach((x,i)=>{const nl=Number(s.bond[x*4+L]>=0)+Number(s.bond[x*4+R]>=0),cap=s.type[x]===T_P||s.type[x]===T_Q;
      if(states[i]!==I_DOCK&&faces[i]<0&&nl===1&&(!cap||s.p.capFray>0))eligible.push(i);});
    rows.push({units,seq:units.map(x=>s._letter(x)).join(''),states,faces,eligible,
      attached:states.filter((st,i)=>st===I_DOCK&&faces[i]>=0).length});
  }return {t:s.t,stats:s.stats(),rows};
}
function run(job){
  const {s,parent}=setup(job),known=new Set(parent),original=s._event;
  s._event=function(kind,u,v){const result=original.call(this,kind,u,v);if(kind==='birth')for(const x of this.strandOf(u))known.add(x);return result;};
  const windows=[];for(let t=0;t<job.steps;t+=5000){s.run(5000);windows.push(inventory(s,known));}
  assert.deepEqual(s.check(),[]);const ref=JSON.parse(fs.readFileSync(job.reference,'utf8').trim().split(/\r?\n/).find(line=>{const r=JSON.parse(line);return r.seed===job.seed&&r.profile===job.profile;}));
  assert.deepEqual(s.births,ref.births);assert.deepEqual(s.p,ref.params);
  assert.deepEqual(windows.filter(w=>w.t%10000===0).map(w=>w.stats),ref.windows.map(w=>w.stats));
  return {...job,params:s.p,windows,births:s.births};
}
function main(){
  const o={out:'',reference:'experiments/out/EP_copy.runs.jsonl',workers:4};for(let i=2;i<process.argv.length;i+=2){const k=process.argv[i].replace(/^--/,'');assert(Object.hasOwn(o,k)&&process.argv[i+1]!==undefined);o[k]=k==='workers'?Number(process.argv[i+1]):process.argv[i+1];}
  assert(o.out&&Number.isInteger(o.workers)&&o.workers>=1&&o.workers<=4);
  const jobs=fs.readFileSync(o.reference,'utf8').trim().split(/\r?\n/).map(JSON.parse).map(({seed,profile,mode,capFray,steps})=>({seed,profile,mode,capFray,steps,reference:o.reference}));
  assert(jobs.every(j=>j.mode==='copy'&&j.steps%5000===0));
  const files=['.runs.jsonl','.manifest.json'].map(ext=>o.out+ext);assert(files.every(f=>!fs.existsSync(f)));fs.mkdirSync(path.dirname(o.out),{recursive:true});
  const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
  const m={options:o,jobs,complete:false,completed:0,node:process.version,started:new Date().toISOString(),sources:Object.fromEntries(['../src/sim.js','end_protection.js','end_protection_natural.js'].map(f=>[f,hash(path.join(__dirname,f))]))};
  const write=()=>fs.writeFileSync(files[1],JSON.stringify(m,null,2)+'\n');fs.writeFileSync(files[0],'',{flag:'wx'});write();
  const cpu=process.cpuUsage(),wall=Date.now();let next=0,active=0,failed=false;
  function launch(){while(!failed&&active<o.workers&&next<jobs.length){const w=new Worker(__filename,{workerData:jobs[next++]});active++;let received=false;
    w.on('message',r=>{assert(!received);received=true;m.completed++;fs.appendFileSync(files[0],JSON.stringify(r)+'\n');write();const rows=r.windows.at(-1).rows;console.error(JSON.stringify({completed:m.completed,seed:r.seed,profile:r.profile,unfinished:rows.length,protected:rows.filter(x=>!x.eligible.length).length}));});
    w.on('error',e=>{failed=true;process.exitCode=1;console.error(e);});w.on('exit',code=>{active--;if(code||!received){failed=true;process.exitCode=1;}
      if(!active&&(failed||next===jobs.length)){const c=process.cpuUsage(cpu);Object.assign(m,{complete:!failed,cpuSeconds:(c.user+c.system)/1e6,wallSeconds:(Date.now()-wall)/1000,finished:new Date().toISOString()});write();}launch();});}}
  launch();
}
if(!isMainThread&&require.main===module)parentPort.postMessage(run(workerData));else if(require.main===module)main();
module.exports={inventory,run};
