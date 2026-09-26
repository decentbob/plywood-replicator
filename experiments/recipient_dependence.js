#!/usr/bin/env node
// P1 causal ecology screen. All classification and member tracking are observation only.
const fs=require('fs'), path=require('path'), crypto=require('crypto'), assert=require('assert/strict');
const {Worker,isMainThread,parentPort,workerData}=require('worker_threads');
const {Sim,LETTERS,isProd,F,K,L,R,I_TPL,I_DOCK}=require('../src/sim.js');
const arms={on:{},noBind:{pBindP:0},noSource:{transStart:'P'},neither:{pBindP:0,transStart:'P'}};
const base={W:40,H:40,nA:150,nB:150,nC:150,nD:150,n1:300,nE:100,
  seedSeq:'BAAAAB,BCDDCB',seedCount:3,pUndock:0.1,pFray:0.00003,pUnzip:1,pSoft:0.002,
  translate:true,transCode:'A1',catalysis:true,pLinkBare:0.01,bindAny:true,
  bodyJostle:true,iters:4,snapCorners:false,maxEventLog:0,maxBirthLog:100000};
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
function physicalHash(s){return hash(JSON.stringify({rng:s.rng.getState(),spare:s._spare,
  arrays:['type','px','py','pa','ox','oy','bond','is'].map(k=>[k,Array.from(s[k])])}));}
function kind(q){return !q||q.length<2?'unknown':q.includes('AA')?'producer':'recipient';}
function sample(s){
  const counts={producerSites:0,recipientSites:0,unknownSites:0,producerBound:0,recipientBound:0,unknownBound:0};
  const material={letters:{free:0,dockedSingle:0,unfinishedLinked:0,releasedLinked:0,other:0},
    products:{free:0,dockedSingle:0,unfinishedLinked:0,releasedLinked:0,other:0},energy:0};
  const seen=new Set();
  for(let u=0;u<s.n;u++){
    const prod=isProd(s.type[u]);
    if(!prod&&!LETTERS.includes(s.type[u])){material.energy++;continue;}
    const m=prod?material.products:material.letters;
    const linked=s.bond[u*4+L]>=0||s.bond[u*4+R]>=0;
    if(!linked){m[s.is[u]===I_DOCK?(s.bond[u*4+F]>=0?'dockedSingle':'free'):'other']++;continue;}
    if(seen.has(u))continue;
    const units=s.strandOf(u);for(const v of units)seen.add(v);
    const unfinished=units.some(v=>s.is[v]===I_DOCK);
    m[unfinished?'unfinishedLinked':'releasedLinked']+=units.length;
    if(prod)continue;
    const category=kind(units.map(v=>s._letter(v)).join(''));
    for(const v of units)if(s.is[v]===I_TPL){
      counts[category+'Sites']++;
      const q=s.bond[v*4+K];
      if(q>=0&&isProd(s.type[q>>2])&&s.is[q>>2]===I_TPL)counts[category+'Bound']++;
    }
  }
  assert.equal(Object.values(material.letters).reduce((a,b)=>a+b,0),600);
  assert.equal(Object.values(material.products).reduce((a,b)=>a+b,0),300);
  assert.equal(material.energy,100);
  return {t:s.t,...counts,material};
}
function observe(s){
  const members=[],original=s._event;
  s._event=function(event,u,v){
    const r=original.call(this,event,u,v);
    if(event==='birth'){
      const units=this.strandOf(u);
      members.push({t:this.t,units,seq:units.map(x=>this._letter(x)).join(''),
        detached:units.every(x=>this.bond[x*4+F]<0),active:units.every(x=>this.is[x]===I_TPL),at5k:null});
    }
    return r;
  };
  function update(){for(const b of members)if(b.at5k===null&&s.t>=b.t+5000){
    const intact=b.units.every((u,i)=>s.bond[u*4+L]===(i?b.units[i-1]*4+R:-1)&&
      s.bond[u*4+R]===(i+1<b.units.length?b.units[i+1]*4+L:-1));
    b.at5k={t:s.t,intact,active:intact&&b.units.every(u=>s.is[u]===I_TPL)};
  }}
  return {members,update};
}
function run(job,progress=()=>{}){
  assert(Object.hasOwn(arms,job.arm));
  const s=new Sim({...base,...arms[job.arm],seed:job.seed}),types=Array.from(s.type),initialHash=physicalHash(s);
  const o=observe(s),samples=[];
  for(let t=100;t<=job.steps;t+=100){
    s.run(100);samples.push(sample(s));o.update();
    if(t%10000===0){assert.deepEqual(s.check(),[]);assert.deepEqual(Array.from(s.type),types);
      progress({seed:job.seed,arm:job.arm,t,births:s.birthCount,products:s.prodCount});}
  }
  assert.deepEqual(s.check(),[]);assert.deepEqual(Array.from(s.type),types);
  const births=s.births.filter(b=>!b.prod);
  assert.equal(births.length,s.birthCount);assert.equal(o.members.length,births.length);
  births.forEach((b,i)=>{assert.equal(b.t,o.members[i].t);assert.equal(b.seq,o.members[i].seq);});
  return {...job,params:s.p,initialHash,samples,births:s.births,members:o.members,finalState:s.saveState()};
}
function main(){
  const options={out:'',seeds:'103,104',arms:'on,noBind,noSource,neither',steps:50000,workers:4};
  for(let i=2;i<process.argv.length;i+=2){const k=process.argv[i].replace(/^--/,'');
    assert(Object.hasOwn(options,k)&&process.argv[i+1]!==undefined,'Unknown/missing option');
    options[k]=typeof options[k]==='number'?Number(process.argv[i+1]):process.argv[i+1];}
  const seeds=options.seeds.split(',').map(Number),selected=options.arms.split(',');
  assert(options.out&&Number.isInteger(options.steps)&&options.steps>0&&options.steps%100===0);
  assert(Number.isInteger(options.workers)&&options.workers>=1&&options.workers<=4);
  assert(seeds.every(Number.isInteger)&&new Set(seeds).size===seeds.length);
  assert(selected.every(a=>Object.hasOwn(arms,a))&&new Set(selected).size===selected.length);
  const jobs=seeds.flatMap(seed=>selected.map(arm=>({seed,arm,steps:options.steps})));
  const files=['.runs.jsonl','.manifest.json'].map(ext=>options.out+ext);
  assert(files.every(f=>!fs.existsSync(f)),'Choose an unused output stem');
  fs.mkdirSync(path.dirname(options.out),{recursive:true});
  const sources=['src/sim.js','experiments/recipient_dependence.js','experiments/recipient_dependence_plan.md'];
  const m={options,jobs,node:process.version,platform:process.platform,command:process.argv,complete:false,completed:0,
    sources:Object.fromEntries(sources.map(f=>[f,hash(fs.readFileSync(path.join(__dirname,'..',f)))])),started:new Date().toISOString()};
  const write=()=>fs.writeFileSync(files[1],JSON.stringify(m,null,2)+'\n');
  fs.writeFileSync(files[0],'',{flag:'wx'});write();
  const cpu=process.cpuUsage(),wall=Date.now();let next=0,active=0,failed=false;
  function launch(){while(!failed&&active<options.workers&&next<jobs.length){
    const w=new Worker(__filename,{workerData:jobs[next++]});active++;let received=false;
    w.on('message',msg=>{if(msg.progress){console.error(JSON.stringify(msg.progress));return;}
      assert(!received);received=true;fs.appendFileSync(files[0],JSON.stringify(msg.result)+'\n');m.completed++;write();});
    w.on('error',e=>{failed=true;process.exitCode=1;console.error(e);});
    w.on('exit',code=>{active--;if(code||!received){failed=true;process.exitCode=1;}
      if(!active&&(failed||next===jobs.length)){const c=process.cpuUsage(cpu);
        Object.assign(m,{complete:!failed,cpuSeconds:(c.user+c.system)/1e6,wallSeconds:(Date.now()-wall)/1000,finished:new Date().toISOString()});write();}
      launch();});
  }}launch();
}
if(require.main===module){if(isMainThread)main();else parentPort.postMessage({result:run(workerData,progress=>parentPort.postMessage({progress}))});}
module.exports={arms,base,kind,sample,observe,run,physicalHash,hash};
