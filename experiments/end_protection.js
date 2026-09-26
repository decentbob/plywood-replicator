#!/usr/bin/env node
const fs=require('fs'),path=require('path'),crypto=require('crypto'),assert=require('assert/strict');
const {Worker,isMainThread,parentPort,workerData}=require('worker_threads');
const {Sim,F,R,L,I_DOCK,I_REPEL,I_TPL,LETTERS}=require('../src/sim.js');
const sequence='PAAAABBBBQ',partial='PAAAABBB';
function setup(job){
  const copy=job.mode==='copy',pair=['attached','detached'].includes(job.mode),text=pair?sequence+partial:sequence;
  const counts=Object.fromEntries(['A','B','P','Q'].map(c=>['n'+c,copy?(c==='A'||c==='B'?60:15):[...text].filter(x=>x===c).length]));
  const s=new Sim({seed:job.seed,W:20,H:20,...counts,nE:0,nU:0,seedCount:0,compCopy:true,
    stiffA:0.5,stiffB:0.5,stiffP:0.5,stiffQ:0.5,bendA:job.profile==='square'?0:-20,bendB:job.profile==='square'?0:20,
    pFray:copy?0:0.00003,pUnzip:1,capFray:job.capFray,pUndock:0.1,pSoft:0,iters:4,bodyJostle:true,maxEventLog:0,maxBirthLog:10000});
  const parent=s.seedStrand(10,10,0,10,sequence);assert(parent);let target=parent,anchor=null;
  if(pair){target=s.seedStrand(10,11,Math.PI,partial.length,partial);assert(target);
    const normal=s._side(parent[0],F,[0,0,0,0]);
    for(let i=0;i<target.length;i++){const u=target[i],v=parent[9-i];s.px[u]=s._wx(s.px[v]+normal[2]);s.py[u]=s._wy(s.py[v]+normal[3]);s.is[u]=I_REPEL;}
    const u=target.at(-1),v=parent[9-(partial.length-1)];anchor={u,v};
    if(job.mode==='attached'){s.is[u]=I_DOCK;s._link(u,F,v,F);}
  }else if(!copy)for(const u of target)s.is[u]=I_REPEL;
  s._deriveAll();s._computeOpen();s._buildHash();assert.deepEqual(s.check(),[]);
  return {s,parent,target,anchor};
}
function observe(s,target,anchor){
  const edges=new Set(target.slice(0,-1).map((u,i)=>[u,target[i+1]].sort((a,b)=>a-b).join(':'))),lost=new Set(),losses=[];
  let anchorLostAt=null;const original=s._unlink;
  s._unlink=function(u,i){const q=this.bond[u*4+i];
    if(q>=0){const v=q>>2,key=[u,v].sort((a,b)=>a-b).join(':');
      if([L,R].includes(i)&&edges.has(key)&&!lost.has(key)){lost.add(key);losses.push({t:this.t,u,i,v,j:q&3});}
      if(anchor&&i===F&&((u===anchor.u&&v===anchor.v)||(u===anchor.v&&v===anchor.u))&&anchorLostAt===null)anchorLostAt=this.t;
    }return original.call(this,u,i);
  };
  return {losses,get anchorLostAt(){return anchorLostAt;},sample(){let links=0,free=0;
    for(let i=0;i<target.length;i++){const u=target[i];if(i&&s.bond[target[i-1]*4+R]===u*4+L)links++;
      if(s.is[u]===I_DOCK&&s.bond[u*4+F]<0&&s.bond[u*4+L]<0&&s.bond[u*4+R]<0)free++;}
    return {t:s.t,links,free,anchor:anchor?s.bond[anchor.u*4+F]===anchor.v*4+F:false,states:target.map(u=>s.is[u]),stats:s.stats()};}};
}
function run(job){
  const {s,parent,target,anchor}=setup(job),types=Array.from(s.type),o=observe(s,target,anchor),windows=[];let firstFree=null;
  for(let t=0;t<job.steps;t+=100){s.run(100);const w=o.sample();if(w.free&&firstFree===null)firstFree=s.t;if(s.t%10000===0)windows.push(w);}
  assert.deepEqual(s.check(),[]);assert.deepEqual(Array.from(s.type),types);
  if(job.mode==='copy'){const ids=new Set(parent);for(let u=0;u<s.n;u++)if(LETTERS.includes(s.type[u])&&s.is[u]===I_TPL)assert(ids.has(u),'Offspring activated');}
  return {...job,params:s.p,target,parent,anchor,losses:o.losses,firstLoss:o.losses[0]?.t??null,anchorLostAt:o.anchorLostAt,firstFree,windows,births:s.births,
    exact:s.births.filter(b=>b.seq===sequence&&b.parent===sequence).length};
}
function main(){
  const o={out:'',modes:'full,attached,detached',seeds:'81,82',profiles:'square,opposed20',caps:'0,1',steps:50000,workers:4};
  for(let i=2;i<process.argv.length;i+=2){const k=process.argv[i].replace(/^--/,'');assert(Object.hasOwn(o,k)&&process.argv[i+1]!==undefined);o[k]=typeof o[k]==='number'?Number(process.argv[i+1]):process.argv[i+1];}
  const seeds=o.seeds.split(',').map(Number),profiles=o.profiles.split(','),caps=o.caps.split(',').map(Number),modes=o.modes.split(',');
  assert(o.out&&Number.isInteger(o.steps)&&o.steps>=10000&&o.steps%10000===0&&Number.isInteger(o.workers)&&o.workers>=1&&o.workers<=4);
  assert(seeds.every(Number.isInteger)&&profiles.every(p=>['square','opposed20'].includes(p))&&caps.every(c=>c>=0&&c<=1)&&modes.every(m=>['copy','full','attached','detached'].includes(m)));
  for(const xs of [seeds,profiles,caps,modes])assert.equal(new Set(xs).size,xs.length);
  const jobs=seeds.flatMap(seed=>profiles.flatMap(profile=>modes.flatMap(mode=>caps.map(capFray=>({seed,profile,mode,capFray,steps:o.steps})))));
  const files=['.runs.jsonl','.manifest.json'].map(ext=>o.out+ext);assert(files.every(f=>!fs.existsSync(f)));fs.mkdirSync(path.dirname(o.out),{recursive:true});
  const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
  const m={options:o,jobs,complete:false,completed:0,node:process.version,started:new Date().toISOString(),sources:Object.fromEntries(['../src/sim.js','end_protection.js'].map(f=>[f,hash(path.join(__dirname,f))]))};
  const write=()=>fs.writeFileSync(files[1],JSON.stringify(m,null,2)+'\n');fs.writeFileSync(files[0],'',{flag:'wx'});write();
  const cpu=process.cpuUsage(),wall=Date.now();let next=0,active=0,failed=false;
  function launch(){while(!failed&&active<o.workers&&next<jobs.length){const w=new Worker(__filename,{workerData:jobs[next++]});active++;let received=false;
    w.on('message',r=>{assert(!received);received=true;m.completed++;fs.appendFileSync(files[0],JSON.stringify(r)+'\n');write();console.error(JSON.stringify({completed:m.completed,total:jobs.length,seed:r.seed,profile:r.profile,mode:r.mode,cap:r.capFray,firstLoss:r.firstLoss,exact:r.exact}));});
    w.on('error',e=>{failed=true;process.exitCode=1;console.error(e);});w.on('exit',code=>{active--;if(code||!received){failed=true;process.exitCode=1;}
      if(!active&&(failed||next===jobs.length)){const c=process.cpuUsage(cpu);Object.assign(m,{complete:!failed,cpuSeconds:(c.user+c.system)/1e6,wallSeconds:(Date.now()-wall)/1000,finished:new Date().toISOString()});write();}launch();});}}
  launch();
}
if(!isMainThread&&require.main===module)parentPort.postMessage(run(workerData));else if(require.main===module)main();
module.exports={setup,observe,run,sequence,partial};
