#!/usr/bin/env node
const fs=require('fs'),path=require('path'),crypto=require('crypto'),assert=require('assert/strict');
const {Worker,isMainThread,parentPort,workerData}=require('worker_threads');
const {setup}=require('./curved_fuel_reproduction.js');
const {F,R,K,L,I_DOCK,I_REPEL,I_TPL,T_A,T_B,S}=require('../src/sim.js');
const letter=(s,u)=>s.type[u]===T_A||s.type[u]===T_B;
function observe(s,founders){
  const rows=[],owner=new Map(),rearms=[],windows=[];
  function active(row){return row.units.every(u=>s.is[u]===I_TPL);}
  function register(units,born,gen){
    assert(units.every(u=>!owner.has(u)),'Birth reuses a known row');
    const id=rows.length,row={id,units:[...units],born,gen,seq:units.map(u=>s._letter(u)).join(''),
      parentUnits:born?units.map(u=>s.parentOf[u]):[],parentRows:[],fullAt:null,firstDock:null,firstJoined:null,maxDock:0,children:[]};
    if(born)row.parentRows=[...new Set(row.parentUnits.map(u=>owner.get(u)??null))];
    rows.push(row);for(const u of units)owner.set(u,id);if(active(row))row.fullAt=born;
    if(born&&row.parentRows.length===1&&row.parentRows[0]!==null)rows[row.parentRows[0]].children.push(id);
    return row;
  }
  for(let i=0;i<founders.length;i+=8)register(founders.slice(i,i+8),0,0);
  const original=s._event;
  s._event=function(kind,u,v){
    const result=original.call(this,kind,u,v);
    if(kind==='birth')register(this.strandOf(u),this.t,this.gen[u]);
    if(kind==='rearm'&&letter(this,u)){
      const q=this.bond[u*4+K];assert(q>=0&&this.ss[q]===S.GIVE,'Non-fuel rearming');
      rearms.push({t:this.t,u,fuel:q>>2});const row=rows[owner.get(u)];
      if(row&&row.fullAt===null&&active(row))row.fullAt=this.t;
    }
    return result;
  };
  function rowState(row){
    const armed=[],waiting=[],docked=[];let joined=0;
    for(const [i,u]of row.units.entries()){
      if(i)assert.equal(s.bond[row.units[i-1]*4+R],u*4+L,'Row integrity');
      if(s.is[u]===I_TPL)armed.push(i);else if(s.is[u]===I_REPEL)waiting.push(i);
      const q=s.bond[u*4+F];if(q>=0&&s.is[q>>2]===I_DOCK){docked.push(i);if(s.bond[(q>>2)*4+L]>=0||s.bond[(q>>2)*4+R]>=0)joined++;}
    }
    assert.equal(armed.length+waiting.length,row.units.length);
    return {id:row.id,armed,waiting,docked,joined};
  }
  function sample(){for(const row of rows){const r=rowState(row);if(r.docked.length&&row.firstDock===null)row.firstDock=s.t;
    if(r.joined&&row.firstJoined===null)row.firstJoined=s.t;row.maxDock=Math.max(row.maxDock,r.docked.length);}}
  function snapshot(){
    const material={founders:0,offspring:0,free:0,dockedSingle:0,unloggedLinked:0,other:0},unlogged=[],seen=new Set();
    for(let u=0;u<s.n;u++)if(letter(s,u)){
      if(owner.has(u)){material[rows[owner.get(u)].born===0?'founders':'offspring']++;continue;}
      const nl=Number(s.bond[u*4+L]>=0)+Number(s.bond[u*4+R]>=0);
      if(nl){material.unloggedLinked++;if(!seen.has(u)){const units=s.strandOf(u);for(const x of units){assert(!owner.has(x));seen.add(x);}
        unlogged.push({units,seq:units.map(x=>s._letter(x)).join(''),states:units.map(x=>s.is[x]),
          attached:units.filter(x=>s.is[x]===I_DOCK&&s.bond[x*4+F]>=0).length,
          parents:units.map(x=>{const q=s.bond[x*4+F];return q>=0?owner.get(q>>2)??null:null;})});}
      }else if(s.is[u]===I_DOCK)material[s.bond[u*4+F]>=0?'dockedSingle':'free']++;else material.other++;
    }
    assert.equal(Object.values(material).reduce((a,b)=>a+b,0),120);
    const w={t:s.t,stats:s.stats(),material,unlogged,rows:rows.map(rowState)};windows.push(w);return w;
  }
  return {rows,rearms,windows,sample,snapshot};
}
function run(job){
  const {s,founders}=setup({...job,mode:'bootstrap',rows:4,grip:true,iters:4}),types=Array.from(s.type),o=observe(s,founders);
  for(let t=0;t<job.steps;t+=100){s.run(100);o.sample();if(s.t%10000===0)o.snapshot();}
  assert.deepEqual(Array.from(s.type),types);assert.deepEqual(s.check(),[]);assert.equal(o.rearms.length,s.fuelUsed);
  assert.equal(new Set(o.rearms.map(e=>e.u)).size,o.rearms.length);const born=o.rows.filter(r=>r.born>0);
  assert.equal(born.length,s.births.length);
  born.forEach((r,i)=>{const b=s.births[i];assert.equal(r.born,b.t);assert.equal(r.seq,b.seq);assert.equal(r.gen,b.gen);assert.equal(r.parentRows.length,1);
    assert.notEqual(r.parentRows[0],null);assert.equal(o.rows[r.parentRows[0]].seq,b.parent);});
  const r={...job,params:s.p,rows:o.rows,rearms:o.rearms,windows:o.windows,births:s.births};
  if(job.reference){const archived=fs.readFileSync(job.reference,'utf8').trim().split(/\r?\n/).map(JSON.parse).find(a=>a.seed===job.seed&&a.profile===job.profile&&a.grip);
    assert(archived&&archived.steps===job.steps);assert.deepEqual(r.params,archived.params);assert.deepEqual(r.births,archived.births);
    assert.deepEqual(r.windows.map(w=>w.stats),archived.windows);assert.deepEqual(r.rearms.map(e=>({t:e.t,unit:e.u,fuel:e.fuel})),archived.events.map(({t,unit,fuel})=>({t,unit,fuel})));}
  return r;
}
function main(){
  const o={out:'',seeds:'73,74,75,76',profiles:'square,opposed20',steps:100000,workers:4,
    reference:path.join(__dirname,'out','UF_bootstrap_confirm.runs.jsonl')};
  for(let i=2;i<process.argv.length;i+=2){const k=process.argv[i].replace(/^--/,'');assert(Object.hasOwn(o,k)&&process.argv[i+1]!==undefined);o[k]=typeof o[k]==='number'?Number(process.argv[i+1]):process.argv[i+1];}
  const seeds=o.seeds.split(',').map(Number),profiles=o.profiles.split(',');assert(o.out&&o.steps>0&&o.steps%10000===0&&Number.isInteger(o.workers)&&o.workers>=1&&o.workers<=4);
  assert(seeds.every(Number.isInteger)&&profiles.every(p=>['square','opposed20'].includes(p)));assert.equal(new Set(seeds).size,seeds.length);assert.equal(new Set(profiles).size,profiles.length);
  const jobs=seeds.flatMap(seed=>profiles.map(profile=>({seed,profile,steps:o.steps,reference:o.reference})));
  const files=['.runs.jsonl','.manifest.json'].map(ext=>o.out+ext);assert(files.every(f=>!fs.existsSync(f)));fs.mkdirSync(path.dirname(o.out),{recursive:true});
  const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
  const m={options:o,jobs,complete:false,completed:0,node:process.version,started:new Date().toISOString(),sources:Object.fromEntries(
    ['../src/sim.js','curved_fuel_reproduction.js','curved_fuel.js','offspring_recovery.js'].map(f=>[f,hash(path.join(__dirname,f))]))};
  const write=()=>fs.writeFileSync(files[1],JSON.stringify(m,null,2)+'\n');fs.writeFileSync(files[0],'',{flag:'wx'});write();
  const cpu=process.cpuUsage(),wall=Date.now();let next=0,active=0,failed=false;
  function launch(){while(!failed&&active<o.workers&&next<jobs.length){const w=new Worker(__filename,{workerData:jobs[next++]});active++;let received=false;
    w.on('message',r=>{assert(!received);received=true;m.completed++;fs.appendFileSync(files[0],JSON.stringify(r)+'\n');write();
      console.error(JSON.stringify({completed:m.completed,seed:r.seed,profile:r.profile,births:r.births.length,material:r.windows.at(-1).material}));});
    w.on('error',e=>{failed=true;process.exitCode=1;console.error(e);});w.on('exit',code=>{active--;if(code||!received){failed=true;process.exitCode=1;}
      if(!active&&(failed||next===jobs.length)){const c=process.cpuUsage(cpu);Object.assign(m,{complete:!failed,cpuSeconds:(c.user+c.system)/1e6,wallSeconds:(Date.now()-wall)/1000,finished:new Date().toISOString()});write();}launch();});}}
  launch();
}
if(!isMainThread&&require.main===module)parentPort.postMessage(run(workerData));else if(require.main===module)main();
module.exports={observe,run};
