#!/usr/bin/env node
// Research-only contact-gated faces. The ordinary engine is not modified.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),assert=require('assert/strict');
const {Worker,isMainThread,parentPort,workerData}=require('worker_threads');
const {setup:baseSetup,instrument}=require('./patch_completion');
const {inventory}=require('./end_protection_natural');
const {sequence}=require('./end_protection');
const {Sim,F,R,L,S,I_TPL,LETTERS}=require('../src/sim');
class FrontSim extends Sim {
  _deriveAll(){
    if(this._frontSide!==undefined)this.front0.set(this.front);
    super._deriveAll();
  }
  _derive(u){
    super._derive(u);
    if(this._frontSide===undefined)return;
    const o=u*4,b=this.bond,armed=this.is[u]===I_TPL&&LETTERS.includes(this.type[u]);
    // A side advertises only this unit's own face occupancy, never a relayed mark.
    for(const side of [L,R])this.front[o+side]=Number(armed&&b[o+F]>=0&&b[o+side]>=0);
    if(!armed||b[o+F]>=0)return;
    const q=b[o+this._frontSide];
    if(q>=0&&!this.front0[q])this.ss[o+F]=S.IDLE;
  }
}
function install(s,arm){
  assert(['off','L','R'].includes(arm));Object.setPrototypeOf(s,FrontSim.prototype);
  if(arm==='off')return s;
  s._frontSide=arm==='L'?L:R;s.front=new Uint8Array(s.n*4);s.front0=new Uint8Array(s.n*4);
  s._deriveAll();s._computeOpen();return s;
}
function setup(job){const x=baseSetup(job);install(x.s,job.arm);return x;}
function run(job){
  const {s,parent}=setup(job),types=Array.from(s.type),o=instrument(s,parent),windows=[];
  let samples=0,patchSum=0,multi=0,zero=0;
  for(let t=0;t<job.steps;t+=100){s.run(100);const n=o.sample();samples++;patchSum+=n;multi+=n>=2;zero+=n===0;
    if(s.t%5000===0){windows.push({...inventory(s,o.known),samples,patchSum,multi,zero});samples=patchSum=multi=zero=0;}}
  assert.deepEqual(s.check(),[]);assert.deepEqual(Array.from(s.type),types);
  for(let u=0;u<s.n;u++)if(LETTERS.includes(s.type[u])&&s.is[u]===I_TPL)assert(o.founder.has(u));
  assert.equal(o.completed.length,s.births.length);
  return {...job,params:s.p,parent,links:o.links,completed:o.completed,unfinished:o.unfinished(),windows,births:s.births,
    exact:s.births.filter(b=>b.seq===sequence&&b.parent===sequence&&b.gen===1).length};
}
const sourceFiles=['../src/sim.js','end_protection.js','end_protection_natural.js','patch_completion.js','assembly_front.js'];
function jobsFor(o){return o.seeds.split(',').map(Number).flatMap(seed=>o.profiles.split(',').flatMap(profile=>o.arms.split(',').map(arm=>({seed,profile,arm,undock:o.undock,steps:o.steps}))));}
function main(){
  const o={out:'',seeds:'85,86',profiles:'square,opposed20',arms:'off,L,R',undock:0.1,steps:50000,workers:4};
  for(let i=2;i<process.argv.length;i+=2){const k=process.argv[i].replace(/^--/,'');assert(Object.hasOwn(o,k)&&process.argv[i+1]!==undefined);o[k]=typeof o[k]==='number'?Number(process.argv[i+1]):process.argv[i+1];}
  assert(o.out&&Number.isInteger(o.steps)&&o.steps>=20000&&o.steps%10000===0&&Number.isInteger(o.workers)&&o.workers>=1&&o.workers<=4);
  assert(o.undock>=0&&o.undock<=1);
  for(const key of ['seeds','profiles','arms']){const xs=o[key].split(',');assert(xs.length&&new Set(xs).size===xs.length);}
  const jobs=jobsFor(o);assert(jobs.every(j=>Number.isInteger(j.seed)&&['square','opposed20'].includes(j.profile)&&['off','L','R'].includes(j.arm)));
  const files=['.runs.jsonl','.manifest.json'].map(ext=>o.out+ext);assert(files.every(f=>!fs.existsSync(f)));fs.mkdirSync(path.dirname(o.out),{recursive:true});
  const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
  const m={options:o,jobs,complete:false,completed:0,node:process.version,started:new Date().toISOString(),sources:Object.fromEntries(sourceFiles.map(f=>[f,hash(path.join(__dirname,f))]))};
  const write=()=>fs.writeFileSync(files[1],JSON.stringify(m,null,2)+'\n');fs.writeFileSync(files[0],'',{flag:'wx'});write();
  const cpu=process.cpuUsage(),wall=Date.now();let next=0,active=0,failed=false;
  function launch(){while(!failed&&active<o.workers&&next<jobs.length){const w=new Worker(__filename,{workerData:jobs[next++]});active++;let received=false;
    w.on('message',r=>{assert(!received);received=true;m.completed++;fs.appendFileSync(files[0],JSON.stringify(r)+'\n');write();console.error(JSON.stringify({completed:m.completed,total:jobs.length,seed:r.seed,profile:r.profile,arm:r.arm,exact:r.exact}));});
    w.on('error',e=>{failed=true;process.exitCode=1;console.error(e);});w.on('exit',code=>{active--;if(code||!received){failed=true;process.exitCode=1;}
      if(!active&&(failed||next===jobs.length)){const c=process.cpuUsage(cpu);Object.assign(m,{complete:!failed,cpuSeconds:(c.user+c.system)/1e6,wallSeconds:(Date.now()-wall)/1000,finished:new Date().toISOString()});write();}launch();});}}
  launch();
}
if(!isMainThread&&require.main===module)parentPort.postMessage(run(workerData));else if(require.main===module)main();
module.exports={FrontSim,install,setup,run,jobsFor,sourceFiles};
