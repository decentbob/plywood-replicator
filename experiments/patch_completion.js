#!/usr/bin/env node
// Observation only. All bond formation, geometry and chemistry use the ordinary engine.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),assert=require('assert/strict');
const {Worker,isMainThread,parentPort,workerData}=require('worker_threads');
const {setup:baseSetup,sequence}=require('./end_protection');
const {inventory}=require('./end_protection_natural');
const {F,R,L,I_TPL,LETTERS}=require('../src/sim');
function setup(job){const x=baseSetup({...job,mode:'copy',capFray:0});x.s.p.pUndock=job.undock;return x;}
function instrument(s,parent){
  const known=new Set(parent),founder=new Set(parent),byUnit=new Map(),patches=new Set(),links=[],completed=[];
  const link=s._link,unlink=s._unlink,event=s._event;
  s._link=function(u,i,v,j){
    const lateral=[L,R].includes(i)&&[L,R].includes(j);
    if(!lateral)return link.call(this,u,i,v,j);
    assert(!known.has(u)&&!known.has(v),'Lateral bond involving a completed row');
    const a=byUnit.get(u),b=byUnit.get(v);assert(!a||a!==b,'Cycle outside assay scope');
    const kind=!a&&!b?'nucleation':a&&b?'merge':'extension';
    const e={t:this.t,u,i,v,j,kind};link.call(this,u,i,v,j);links.push(e);
    const p={units:[...new Set([...(a?.units||[u]),...(b?.units||[v])])],
      nuclei:[...(a?.nuclei||[]),...(b?.nuclei||[])]};
    if(kind==='nucleation')p.nuclei.push(links.length-1);
    if(a)patches.delete(a);if(b)patches.delete(b);patches.add(p);
    for(const x of p.units)byUnit.set(x,p);
  };
  s._unlink=function(u,i){assert(![L,R].includes(i)||this.bond[u*4+i]<0,'Lateral loss outside no-turnover assay');return unlink.call(this,u,i);};
  s._event=function(kind,u,v){const result=event.call(this,kind,u,v);
    if(kind==='birth'){
      const units=this.strandOf(u),p=byUnit.get(u);assert(p&&patches.has(p));
      assert.deepEqual([...units].sort((a,b)=>a-b),[...p.units].sort((a,b)=>a-b));
      completed.push({t:this.t,units,nuclei:p.nuclei,start:Math.min(...p.nuclei.map(i=>links[i].t))});
      patches.delete(p);for(const x of units){known.add(x);byUnit.delete(x);}
    }return result;
  };
  return {links,completed,known,founder,sample(){return patches.size;},unfinished(){return [...patches].map(p=>({...p,start:Math.min(...p.nuclei.map(i=>links[i].t))}));}};
}
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
function main(){
  const o={out:'',seeds:'83,84',profiles:'square,opposed20',undocks:'0.1,0.3,1',steps:50000,workers:4};
  for(let i=2;i<process.argv.length;i+=2){const k=process.argv[i].replace(/^--/,'');assert(Object.hasOwn(o,k)&&process.argv[i+1]!==undefined);o[k]=typeof o[k]==='number'?Number(process.argv[i+1]):process.argv[i+1];}
  const seeds=o.seeds.split(',').map(Number),profiles=o.profiles.split(','),undocks=o.undocks.split(',').map(Number);
  assert(o.out&&Number.isInteger(o.steps)&&o.steps>=20000&&o.steps%10000===0&&Number.isInteger(o.workers)&&o.workers>=1&&o.workers<=4);
  assert(seeds.length&&seeds.every(Number.isInteger)&&profiles.every(p=>['square','opposed20'].includes(p))&&undocks.every(p=>p>0&&p<=1));
  for(const xs of [seeds,profiles,undocks])assert.equal(new Set(xs).size,xs.length);
  const jobs=seeds.flatMap(seed=>profiles.flatMap(profile=>undocks.map(undock=>({seed,profile,undock,steps:o.steps}))));
  const files=['.runs.jsonl','.manifest.json'].map(ext=>o.out+ext);assert(files.every(f=>!fs.existsSync(f)));fs.mkdirSync(path.dirname(o.out),{recursive:true});
  const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
  const m={options:o,jobs,complete:false,completed:0,node:process.version,started:new Date().toISOString(),sources:Object.fromEntries(['../src/sim.js','end_protection.js','end_protection_natural.js','patch_completion.js'].map(f=>[f,hash(path.join(__dirname,f))]))};
  const write=()=>fs.writeFileSync(files[1],JSON.stringify(m,null,2)+'\n');fs.writeFileSync(files[0],'',{flag:'wx'});write();
  const cpu=process.cpuUsage(),wall=Date.now();let next=0,active=0,failed=false;
  function launch(){while(!failed&&active<o.workers&&next<jobs.length){const w=new Worker(__filename,{workerData:jobs[next++]});active++;let received=false;
    w.on('message',r=>{assert(!received);received=true;m.completed++;fs.appendFileSync(files[0],JSON.stringify(r)+'\n');write();console.error(JSON.stringify({completed:m.completed,total:jobs.length,seed:r.seed,profile:r.profile,undock:r.undock,exact:r.exact}));});
    w.on('error',e=>{failed=true;process.exitCode=1;console.error(e);});w.on('exit',code=>{active--;if(code||!received){failed=true;process.exitCode=1;}
      if(!active&&(failed||next===jobs.length)){const c=process.cpuUsage(cpu);Object.assign(m,{complete:!failed,cpuSeconds:(c.user+c.system)/1e6,wallSeconds:(Date.now()-wall)/1000,finished:new Date().toISOString()});write();}launch();});}}
  launch();
}
if(!isMainThread&&require.main===module)parentPort.postMessage(run(workerData));else if(require.main===module)main();
module.exports={setup,instrument,run};
