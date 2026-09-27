#!/usr/bin/env node
// Measurement only. No observer data is read by simulator rules.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),assert=require('assert/strict');
const {Worker,isMainThread,parentPort,workerData}=require('worker_threads');
const {Sim,F,K,L,R,T_A,T_B,I_DOCK,I_TPL,S}=require('../src/sim.js');
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const digest=x=>hash(JSON.stringify(x));
const sequences=['AAAABBBB','ABABABAB'];
const base={W:18,H:18,nA:60,nB:60,nE:0,nU:40,sizeU:1.2,seedCount:0,
  compCopy:true,pocket:true,pReloadU:0.002,stiffA:0.5,stiffB:0.5,
  pFray:0.00003,pUnzip:1,pSoft:0,pUndock:0.1,iters:4,bodyJostle:true,
  snapCorners:false,maxEventLog:0,maxBirthLog:100000};
const letter=(s,u)=>s.type[u]===T_A||s.type[u]===T_B;
const complement=q=>[...q].reverse().map(c=>c==='A'?'B':'A').join('');
function setup(job){
  assert(sequences.includes(job.sequence)&&['square','opposed20'].includes(job.profile));
  const bend=job.profile==='square'?0:20;
  const s=new Sim({...base,seed:job.seed,pGrip:job.grip?0.2:0,bendA:-bend,bendB:bend});
  const founders=[];
  for(let i=0;i<4;i++){const row=s.seedStrand(9,(i+0.5)*4.5,0,8,job.sequence);assert(row);founders.push(row);}
  s._deriveAll();s._computeOpen();s._buildHash();assert.deepEqual(s.check(),[]);
  return {s,founders};
}
function observe(s,founders){
  const rows=[],events=[],owner=new Map(),release=new Map();
  function retire(id,reason){
    if(id===undefined||id===null||rows[id].lost!==null)return;
    const r=rows[id];r.lost=s.t;r.loss=reason;
    for(const u of r.units)if(owner.get(u)===id)owner.delete(u);
    events.push({kind:'retire',t:s.t,id,reason});
  }
  function register(units,born){
    const seq=units.map(u=>s._letter(u)).join('');
    const provenance=born?units.map(u=>release.get(u)??null):[];
    const parentIds=[...new Set(provenance.map(p=>p?.row??null))];
    let parent=null;
    if(born&&parentIds.length===1&&parentIds[0]!==null){
      const p=rows[parentIds[0]],ps=provenance.map(v=>v.unit);
      if(p.lost===null&&ps.length===p.units.length&&ps.every((u,i)=>u===p.units.at(-1-i))&&
        units.every(u=>!p.units.includes(u)))parent=p.id;
    }
    const detached=units.every(u=>s.bond[u*4+F]<0);
    const exact=parent!==null&&detached&&seq===complement(rows[parent].seq);
    const depth=born?(exact&&rows[parent].depth!==null?rows[parent].depth+1:null):0;
    for(const u of units)retire(owner.get(u),'member-reused');
    const r={id:rows.length,units:[...units],born,seq,provenance,parent,detached,exact,depth,
      fullAt:units.every(u=>s.is[u]===I_TPL)?s.t:null,lost:null,loss:null,children:[]};
    rows.push(r);for(const u of units)owner.set(u,r.id);
    if(parent!==null)rows[parent].children.push(r.id);
    events.push({kind:'row',t:s.t,id:r.id,units:[...units],parent,depth});
    return r;
  }
  for(const units of founders)register(units,0);
  const event=s._event,unlink=s._unlink,link=s._link;
  s._event=function(kind,u,v){
    const result=event.call(this,kind,u,v);
    if(kind==='fray')retire(owner.get(u),'fray');
    if(kind==='release'){
      const unit=this.parentOf[u],row=owner.get(unit)??null;
      const p={t:this.t,unit,row};release.set(u,p);events.push({kind,t:this.t,u,...p});
    }
    if(kind==='rearm'&&letter(this,u)){
      const q=this.bond[u*4+K];assert(q>=0&&this.ss[q]===S.GIVE,'Non-fuel arming');
      events.push({kind,t:this.t,u,fuel:q>>2});
      const r=rows[owner.get(u)];if(r&&r.fullAt===null&&r.units.every(x=>this.is[x]===I_TPL))r.fullAt=this.t;
    }
    if(kind==='birth')register(this.strandOf(u),this.t);
    return result;
  };
  s._unlink=function(u,side){
    const q=this.bond[u*4+side];
    if(q>=0&&(side===L||side===R)){retire(owner.get(u),'unlink');retire(owner.get(q>>2),'unlink');
      events.push({kind:'unlink',t:this.t,u,side,q});}
    return unlink.call(this,u,side);
  };
  s._link=function(u,side,v,vs){
    if(side===L||side===R){retire(owner.get(u),'link');retire(owner.get(v),'link');events.push({kind:'link',t:this.t,u,side,v,vs});}
    return link.call(this,u,side,v,vs);
  };
  function sample(){
    let bends=0,joints=0;const material={founders:0,offspring:0,free:0,dockedSingle:0,unfinishedLinked:0,releasedOther:0,other:0};
    const seen=new Set();
    for(const r of rows)if(r.lost===null){
      assert.deepEqual(s.strandOf(r.units[0]),r.units,'Intact row changed');
      for(let i=1;i<r.units.length;i++){
        const a=s._side(r.units[i-1],F,[0,0,0,0]),b=s._side(r.units[i],F,[0,0,0,0]);
        bends+=Math.acos(Math.max(-1,Math.min(1,a[2]*b[2]+a[3]*b[3])))*180/Math.PI;joints++;
      }
    }
    for(let u=0;u<s.n;u++)if(letter(s,u)){
      if(owner.has(u)){material[rows[owner.get(u)].born===0?'founders':'offspring']++;continue;}
      if(seen.has(u))continue;
      if(s.bond[u*4+L]>=0||s.bond[u*4+R]>=0){
        const units=s.strandOf(u);assert(units.every(x=>!owner.has(x)));
        units.forEach(x=>seen.add(x));
        material[units.some(x=>s.is[x]===I_DOCK)?'unfinishedLinked':'releasedOther']+=units.length;
      }else material[s.is[u]===I_DOCK?(s.bond[u*4+F]>=0?'dockedSingle':'free'):'other']++;
    }
    assert.equal(Object.values(material).reduce((a,b)=>a+b,0),120);
    return {t:s.t,material,bends,joints,fuelUsed:s.fuelUsed,births:s.birthCount};
  }
  return {rows,events,sample,retire};
}
function metrics(r){
  const born=r.rows.filter(x=>x.born>0),exact=born.filter(x=>x.depth!==null&&x.detached);
  const productive=exact.filter(p=>p.fullAt!==null&&p.children.some(id=>{
    const c=r.rows[id];return c.depth!==null&&c.detached&&p.fullAt<=c.born&&(p.lost===null||p.lost>=c.born);
  }));
  return {births:born.length,detached:born.filter(p=>p.detached).length,exact:exact.length,
    founderChildren:exact.filter(p=>p.depth===1).length,primary:productive.length,
    earlyPrimary:productive.filter(p=>p.born<=50000).length,
    secondCycle:exact.filter(p=>p.depth>=2).length,full:exact.filter(p=>p.fullAt!==null).length,
    persistent5k:exact.filter(p=>p.born+5000<=r.steps&&(p.lost===null||p.lost>=p.born+5000)).length,
    censored5k:exact.filter(p=>p.born+5000>r.steps&&p.lost===null).length,
    lengthChanged:born.filter(p=>p.units.length!==8).length,
    otherEight:born.filter(p=>p.units.length===8&&p.seq!==r.sequence).length,
    intactFounders:r.rows.filter(p=>!p.born&&p.lost===null).length,
    unfinished:r.samples.at(-1).material.unfinishedLinked,
    fuel:r.samples.at(-1).fuelUsed,
    meanBend:r.samples.reduce((n,w)=>n+w.bends,0)/(r.samples.reduce((n,w)=>n+w.joints,0)||1)};
}
function run(job,progress=()=>{}){
  const {s,founders}=setup(job),initialState=s.saveState(),types=Array.from(s.type),o=observe(s,founders),samples=[];
  for(let t=0;t<job.steps;t+=100){s.run(Math.min(100,job.steps-t));samples.push(o.sample());
    if(s.t%10000===0){assert.deepEqual(s.check(),[]);assert.deepEqual(Array.from(s.type),types);
      progress({seed:job.seed,sequence:job.sequence,profile:job.profile,grip:job.grip,t:s.t,births:s.birthCount});}}
  const r={...job,params:s.p,initialHash:digest(initialState),rows:o.rows,events:o.events,samples,births:s.births,finalState:s.saveState()};
  r.finalHash=digest(r.finalState);r.metrics=metrics(r);
  assert.equal(r.metrics.births,s.birthCount);assert.equal(r.events.filter(e=>e.kind==='rearm').length,s.fuelUsed);
  assert.deepEqual(s.check(),[]);assert.deepEqual(Array.from(s.type),types);return r;
}
function main(){
  const options={out:'',seeds:'203,204',sequences:sequences.join(','),profiles:'square,opposed20',grips:'1,0',steps:100000,workers:4};
  for(let i=2;i<process.argv.length;i+=2){const k=process.argv[i].replace(/^--/,'');assert(Object.hasOwn(options,k)&&process.argv[i+1]!==undefined);
    options[k]=typeof options[k]==='number'?Number(process.argv[i+1]):process.argv[i+1];}
  const seeds=options.seeds.split(',').map(Number),seqs=options.sequences.split(','),profiles=options.profiles.split(','),grips=options.grips.split(',').map(Number);
  assert(options.out&&Number.isInteger(options.steps)&&options.steps>0&&options.steps%100===0);
  assert(Number.isInteger(options.workers)&&options.workers>=1&&options.workers<=4);
  assert(seeds.every(Number.isInteger)&&seqs.every(q=>sequences.includes(q))&&profiles.every(p=>['square','opposed20'].includes(p))&&grips.every(g=>[0,1].includes(g)));
  for(const xs of [seeds,seqs,profiles,grips])assert.equal(new Set(xs).size,xs.length);
  const jobs=seeds.flatMap(seed=>seqs.flatMap(sequence=>profiles.flatMap(profile=>grips.map(grip=>({seed,sequence,profile,grip:!!grip,steps:options.steps})))));
  const files=['.runs.jsonl','.manifest.json'].map(ext=>options.out+ext);assert(files.every(f=>!fs.existsSync(f)));
  fs.mkdirSync(path.dirname(options.out),{recursive:true});
  const sources=['src/sim.js','experiments/sequence_shape.js','experiments/sequence_shape_plan.md'];
  const m={options,jobs,node:process.version,platform:process.platform,command:process.argv,complete:false,completed:0,
    sources:Object.fromEntries(sources.map(f=>[f,hash(fs.readFileSync(path.join(__dirname,'..',f)))])),started:new Date().toISOString()};
  const write=()=>fs.writeFileSync(files[1],JSON.stringify(m,null,2)+'\n');fs.writeFileSync(files[0],'',{flag:'wx'});write();
  const cpu=process.cpuUsage(),wall=Date.now();let next=0,active=0,failed=false;
  function launch(){while(!failed&&active<options.workers&&next<jobs.length){
    const w=new Worker(__filename,{workerData:jobs[next++]});active++;let received=false;
    w.on('message',msg=>{if(msg.progress){console.error(JSON.stringify(msg.progress));return;}
      assert(!received);received=true;fs.appendFileSync(files[0],JSON.stringify(msg.result)+'\n');m.completed++;write();
      console.error(JSON.stringify({completed:m.completed,...msg.result.metrics}));});
    w.on('error',e=>{failed=true;process.exitCode=1;console.error(e);});
    w.on('exit',code=>{active--;if(code||!received){failed=true;process.exitCode=1;}
      if(!active&&(failed||next===jobs.length)){const c=process.cpuUsage(cpu);Object.assign(m,{complete:!failed,cpuSeconds:(c.user+c.system)/1e6,
        wallSeconds:(Date.now()-wall)/1000,finished:new Date().toISOString()});write();}launch();});
  }}launch();
}
if(require.main===module){if(isMainThread)main();else parentPort.postMessage({result:run(workerData,progress=>parentPort.postMessage({progress}))});}
module.exports={base,sequences,setup,observe,metrics,run,hash,digest,complement};
