#!/usr/bin/env node
// Measurement only: the ordinary engine supplies all forces, binding and transitions.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),assert=require('assert/strict');
const {Worker,isMainThread,parentPort,workerData}=require('worker_threads');
const {Sim,F,K,L,R,T_A,T_B,T_U,I_REPEL,I_TPL,I_ON,S}=require('../src/sim.js');
const profiles={square:[0,0],opposed20:[-20,20],opposed40:[-40,40]};
function setup(job) {
  const {seed,sequence,profile,size,iters=4,bodyJostle=true,grip=true}=job;
  assert(profiles[profile]&&sequence.length===8&&/^[AB]+$/.test(sequence));
  const [bendA,bendB]=profiles[profile],nA=[...sequence].filter(x=>x==='A').length;
  const s=new Sim({seed,W:12,H:12,nA,nB:8-nA,nE:0,nU:40,sizeU:size,seedCount:0,
    compCopy:true,pocket:true,pGrip:grip?0.2:0,pReloadU:0.002,bendA,bendB,stiffA:0.5,stiffB:0.5,
    pFray:0,pSoft:0,pUndock:0.1,iters,bodyJostle,maxBirthLog:10000,maxEventLog:0});
  const template=s.seedStrand(6,6,0,8,sequence);assert(template);
  for(const u of template)s.is[u]=I_REPEL;
  s._deriveAll();s._computeOpen();s._buildHash();assert.deepEqual(s.check(),[]);
  return {s,template};
}
function instrument(s,template) {
  const events=[],index=new Map(template.map((u,i)=>[u,i])),original=s._transition.bind(s);
  s._transition=function(u){
    const before=this.is[u],q=this.bond[u*4+K];let source=null;
    if(index.has(u)&&before===I_REPEL&&q>=0&&this.ss[q]===S.GIVE){
      const fuel=q>>2,holders=[];
      for(let side=0;side<4;side++){const p=this.bond[fuel*4+side];if(p>=0)holders.push({index:index.get(p>>2),side:p&3});}
      source={fuel,holders};
    }
    original(u);
    if(index.has(u)&&before===I_REPEL&&this.is[u]===I_TPL){assert(source,'Arming without fuel');
      events.push({t:this.t,index:index.get(u),letter:this._letter(u),...source});}
  };
  return events;
}
function sample(s,template,w) {
  w.samples++;let bend=0,armed=0;
  for(let i=0;i<8;i++){
    if(s.is[template[i]]===I_TPL)armed++;
    if(i){const a=s._side(template[i-1],F,[0,0,0,0]),b=s._side(template[i],F,[0,0,0,0]);
      bend+=Math.acos(Math.max(-1,Math.min(1,a[2]*b[2]+a[3]*b[3])))*180/Math.PI;}
  }
  w.armedSum+=armed;w.bendSum+=bend/7;
  for(let u=0;u<s.n;u++)if(s.type[u]===T_U){let nb=0;for(let side=0;side<4;side++)nb+=s.bond[u*4+side]>=0;
    if(nb===1)w.held1++;if(nb>=2)w.held2++;}
}
function run(job) {
  const {s,template}=setup(job),types=Array.from(s.type),events=instrument(s,template),windows=[];
  let w={samples:0,armedSum:0,bendSum:0,held1:0,held2:0};
  for(let t=0;t<job.steps;t+=100){s.run(Math.min(100,job.steps-t));sample(s,template,w);
    if(s.t%10000===0||s.t===job.steps){windows.push({until:s.t,...w,armed:events.length,fuelUsed:s.fuelUsed});
      w={samples:0,armedSum:0,bendSum:0,held1:0,held2:0};}}
  assert.deepEqual(s.check(),[]);assert.deepEqual(Array.from(s.type),types);assert.equal(s.births.length,0);
  assert.equal(s.fuelUsed,events.length);assert.equal(new Set(events.map(e=>e.index)).size,events.length);
  for(let i=0;i<7;i++)assert.equal(s.bond[template[i]*4+R],template[i+1]*4+L);
  const armedA=events.filter(e=>e.letter==='A').length,armedB=events.length-armedA;
  const n=windows.reduce((n,w)=>n+w.samples,0);
  return {...job,armed:events.length,armedA,armedB,firstArming:events[0]?.t??null,completeTime:events.length===8?events.at(-1).t:null,
    meanBend:windows.reduce((n,w)=>n+w.bendSum,0)/n,meanArmed:windows.reduce((n,w)=>n+w.armedSum,0)/n,
    events,windows,params:s.p};
}
function main() {
  const o={out:'',seeds:'51,52',sequences:'AAAABBBB,AABBAABB,ABABABAB',profiles:'square,opposed20,opposed40',sizes:'0.5,1.2',
    steps:50000,iters:4,bodyJostle:1,grip:1,workers:4};
  for(let i=2;i<process.argv.length;i+=2){const k=process.argv[i].replace(/^--/,'');assert(Object.hasOwn(o,k)&&process.argv[i+1]!==undefined);
    o[k]=typeof o[k]==='number'?Number(process.argv[i+1]):process.argv[i+1];}
  const seeds=o.seeds.split(',').map(Number),sequences=o.sequences.split(','),shapes=o.profiles.split(','),sizes=o.sizes.split(',').map(Number);
  assert(o.out&&Number.isInteger(o.steps)&&o.steps>0&&o.steps%100===0&&Number.isInteger(o.workers)&&o.workers>=1&&o.workers<=4);
  assert(Number.isInteger(o.iters)&&o.iters>0&&[0,1].includes(o.bodyJostle)&&[0,1].includes(o.grip));
  assert(seeds.every(Number.isInteger)&&sequences.every(s=>s.length===8&&/^[AB]+$/.test(s))&&shapes.every(s=>profiles[s])&&sizes.every(s=>s>0&&Number.isFinite(s)));
  for(const xs of [seeds,sequences,shapes,sizes])assert.equal(new Set(xs).size,xs.length);
  const jobs=seeds.flatMap(seed=>sequences.flatMap(sequence=>sizes.flatMap(size=>shapes.map(profile=>({seed,sequence,size,profile,steps:o.steps,
    iters:o.iters,bodyJostle:!!o.bodyJostle,grip:!!o.grip})))));
  const files=['.csv','.runs.jsonl','.manifest.json'].map(x=>o.out+x);assert(files.every(f=>!fs.existsSync(f)),'Output exists');fs.mkdirSync(path.dirname(o.out),{recursive:true});
  const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
  const m={options:o,jobs,complete:false,completed:0,node:process.version,started:new Date().toISOString(),
    sources:Object.fromEntries(['../src/sim.js','curved_fuel.js'].map(f=>[f,hash(path.join(__dirname,f))]))};
  const cols=['seed','sequence','size','profile','steps','iters','bodyJostle','grip','armed','armedA','armedB','firstArming','completeTime','meanBend','meanArmed'];
  const write=()=>fs.writeFileSync(files[2],JSON.stringify(m,null,2)+'\n');
  fs.writeFileSync(files[0],cols.join(',')+'\n',{flag:'wx'});fs.writeFileSync(files[1],'',{flag:'wx'});write();
  const cpu=process.cpuUsage(),wall=Date.now();let next=0,active=0,failed=false;
  function launch(){while(!failed&&active<o.workers&&next<jobs.length){const w=new Worker(__filename,{workerData:jobs[next++]});active++;let received=false;
    w.on('message',r=>{assert(!received);received=true;m.completed++;fs.appendFileSync(files[1],JSON.stringify(r)+'\n');
      fs.appendFileSync(files[0],cols.map(k=>r[k]??'').join(',')+'\n');write();console.error(JSON.stringify({completed:m.completed,total:jobs.length,
        seed:r.seed,sequence:r.sequence,size:r.size,profile:r.profile,armed:r.armed,completeTime:r.completeTime}));});
    w.on('error',e=>{failed=true;process.exitCode=1;console.error(e);});
    w.on('exit',code=>{active--;if(code||!received){failed=true;process.exitCode=1;}
      if(!active&&(failed||next===jobs.length)){const c=process.cpuUsage(cpu);Object.assign(m,{complete:!failed,finished:new Date().toISOString(),
        cpuSeconds:(c.user+c.system)/1e6,wallSeconds:(Date.now()-wall)/1000});write();}launch();});}}
  launch();
}
if(!isMainThread&&require.main===module)parentPort.postMessage(run(workerData));
else if(require.main===module)main();
module.exports={profiles,setup,instrument,sample,run};
