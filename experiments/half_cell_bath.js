#!/usr/bin/env node
'use strict';
const fs=require('fs'),zlib=require('zlib'),assert=require('assert/strict');
const live=require('./half_cell_live'),g=require('./half_cell_geometry');
const {F,R,L,T_A,T_C,T_E,T_P,T_Q}=require('../src/sim');
const {hash}=require('./half_cell_rim_test');
const INPUT='experiments/out/HC_live_20260928.json.gz';
const cpu=()=>{const c=process.cpuUsage();return(c.user+c.system)/1e6;};
const read=p=>JSON.parse(p.endsWith('.gz')?zlib.gunzipSync(fs.readFileSync(p)):fs.readFileSync(p));
const write=(p,r)=>fs.writeFileSync(p,p.endsWith('.gz')?zlib.gzipSync(JSON.stringify(r)+'\n'):JSON.stringify(r,null,2)+'\n',{flag:'wx'});
const key=xs=>xs.join(',');
function setup(seed,on){const w=live.createWorld({seed,start:'bath',motion:'body'});w.s.p.rimBind=on;return w;}
function instrument(s){
  const result={eligible:[],events:[],counts:{phaseEligible:0,actualRimTests:0,actualRimEligible:0,ordinaryPlacementAttempts:0,ordinaryPlacementRejected:0,freePlacementRejected:0,boundPlacementRejected:0}};
  const form=s._formRimBonds,contact=s.polymerContact,link=s._link,unlink=s._unlink,rim=s._linkRim,place=s._formBond;
  s._formRimBonds=function(){
    const ports=[];for(let u=0;u<this.n;u++)for(let i=0;i<4;i++)if(this.rimLabel(u,i)&&this.rimBond[u*4+i]<0)ports.push([u,i]);
    for(let a=0;a<ports.length;a++)for(let b=a+1;b<ports.length;b++){
      const [u,i]=ports[a],[v,j]=ports[b];
      if(this.rimCompatible(u,i,v,j)&&this._candidate(u,v)&&contact.call(this,u,i,v,j)){
        result.counts.phaseEligible++;result.eligible.push({t:this.t,a:u*4+i,b:v*4+j});
      }
    }
    return form.call(this);
  };
  s.polymerContact=function(...args){result.counts.actualRimTests++;const yes=contact.apply(this,args);if(yes)result.counts.actualRimEligible++;return yes;};
  s._link=function(u,i,v,j){const value=link.call(this,u,i,v,j);result.events.push({t:this.t,op:'add',a:u*4+i,b:v*4+j});return value;};
  s._unlink=function(u,i){const a=u*4+i,b=this.bond[a],value=unlink.call(this,u,i);if(b>=0)result.events.push({t:this.t,op:'remove',a,b});return value;};
  s._linkRim=function(u,i,v,j){const value=rim.call(this,u,i,v,j);result.events.push({t:this.t,op:'rim',a:u*4+i,b:v*4+j});return value;};
  s._formBond=function(u,i,v,j){
    const free=!this.hasMechanicalBond(u)||!this.hasMechanicalBond(v);result.counts.ordinaryPlacementAttempts++;
    const ok=place.call(this,u,i,v,j);if(!ok){result.counts.ordinaryPlacementRejected++;result.counts[free?'freePlacementRejected':'boundPlacementRejected']++;}return ok;
  };
  return result;
}
function census(s,founder){
  const obs=live.observe(s),seen=new Set(),components=[];
  for(let u=0;u<s.n;u++)if(s.type[u]===T_C&&!seen.has(u)){
    const todo=[u],units=[],caps=[];let edges=0;
    while(todo.length){const v=todo.pop();if(seen.has(v))continue;seen.add(v);units.push(v);if(s.type[v]!==T_C)caps.push(v);
      for(let i=0;i<4;i++){const b=s.rimBond[v*4+i];if(b>=0){edges++;if(!seen.has(b>>2))todo.push(b>>2);}}
    }
    components.push({units:units.sort((a,b)=>a-b),w:units.filter(v=>s.type[v]===T_C).length,caps:caps.sort((a,b)=>a-b),cycle:edges/2===units.length});
  }
  const novel=obs.chains.filter(x=>key(x.units)!==key(founder));
  return {base:obs,components,novelChains:novel,
    novelClosed:obs.closed.filter(x=>key(x.units)!==key(founder)),
    freeRingsW:components.filter(x=>!x.caps.length&&x.cycle).reduce((n,x)=>n+x.w,0),
    capBoundW:components.filter(x=>x.caps.length).reduce((n,x)=>n+x.w,0),
    freeArcW:components.filter(x=>!x.caps.length&&!x.cycle).reduce((n,x)=>n+x.w,0)};
}
function pointSegment(p,a,b){const x=b[0]-a[0],y=b[1]-a[1],d=x*x+y*y,t=d?Math.max(0,Math.min(1,((p[0]-a[0])*x+(p[1]-a[1])*y)/d)):0;return Math.hypot(p[0]-a[0]-t*x,p[1]-a[1]-t*y);}
function detached(s,units){
  const set=new Set(units);let gap=Infinity;
  for(const u of units)for(let i=0;i<4;i++)for(const table of [s.bond,s.rimBond]){
    const b=table[u*4+i];if(b>=0&&!set.has(b>>2)&&s.type[b>>2]!==T_E)return {detached:false,gap:0};
  }
  for(const u of units)for(let v=0;v<s.n;v++)if(!set.has(v)&&s.type[v]!==T_E){
    const a=s._outline(u),b=s._outline(v,s._dx(s.px[v]-s.px[u]),s._dy(s.py[v]-s.py[u]));
    if(g.overlap(a,b)>1e-10)return {detached:false,gap:0};
    for(const [ps,qs]of [[a,b],[b,a]])for(const p of ps)for(let k=0;k<qs.length;k++)gap=Math.min(gap,pointSegment(p,qs[k],qs[(k+1)%qs.length]));
  }
  return {detached:gap>=.1,gap};
}
function tracker(s,founder){
  const value={firstChain:null,firstClosed:null,firstUnpairedChain:null,firstDetachedChain:null,firstDetachedClosed:null,
    firstPersistentClosed:null,maxClosedStreak:0,novelKeys:[],closedKeys:[],activeNovelSeen:false,
    maxCopyingContacts:0,minCharged:4,maxFreeRingsW:0,maxCapBoundW:8};
  let streak=0,lastKey='';
  return {value,update(){
    const c=census(s,founder);value.maxCopyingContacts=Math.max(value.maxCopyingContacts,c.base.copyingContacts);
    value.minCharged=Math.min(value.minCharged,c.base.charged);value.maxFreeRingsW=Math.max(value.maxFreeRingsW,c.freeRingsW);value.maxCapBoundW=Math.max(value.maxCapBoundW,c.capBoundW);
    for(const x of c.novelChains){if(value.firstChain===null)value.firstChain=s.t;if(!value.novelKeys.includes(key(x.units)))value.novelKeys.push(key(x.units));
      if(x.active)value.activeNovelSeen=true;
      if(x.unpaired){if(value.firstUnpairedChain===null)value.firstUnpairedChain=s.t;
        // A chain with its own rim is evaluated as a full D below, not penalized for having W bonds.
        if(!c.novelClosed.some(y=>key(y.units)===key(x.units))&&detached(s,x.units).detached&&value.firstDetachedChain===null)value.firstDetachedChain=s.t;
      }
    }
    let qualified='';
    for(const x of c.novelClosed){if(value.firstClosed===null)value.firstClosed=s.t;const k=key([...x.units,...x.rim]);if(!value.closedKeys.includes(k))value.closedKeys.push(k);
      if(x.unpaired&&detached(s,[...x.units,...x.rim]).detached){qualified=k;if(value.firstDetachedClosed===null)value.firstDetachedClosed=s.t;}
    }
    streak=qualified?(qualified===lastKey?streak+1:1):0;lastKey=qualified;value.maxClosedStreak=Math.max(value.maxClosedStreak,streak);
    if(streak>=100&&value.firstPersistentClosed===null)value.firstPersistentClosed=s.t;
    return c;
  }};
}
function sample(w,founder){return {t:w.s.t,frame:live.snapshot(w),census:census(w.s,founder),geometry:live.geometry(w.s)};}
function sources(){const input=read(INPUT);return Object.fromEntries([...Object.keys(input.sources),'experiments/half_cell_bath.js','experiments/half_cell_bath_plan.md'].map(p=>[p,hash(p)]));}
function run(seed,on,file,horizon=50000){
  assert(!fs.existsSync(file)&&!fs.existsSync(file+'.cpu.json'),'Unique output required');
  const w=setup(seed,on),s=w.s,initial=s.saveState(),founder=w.ids.chains[0],monitor=instrument(s),track=tracker(s,founder);
  const r={command:process.argv.slice(1),job:{seed,on,horizon},sources:sources(),input:INPUT,inputHash:hash(INPUT),initial,founder,
    samples:[],milestones:[],checkpoints:[],monitor,complete:false,censored:false};let error;
  try{
    const reference=read(INPUT);for(const [p,h]of Object.entries(reference.sources))assert.equal(hash(p),h,p);
    r.samples.push(sample(w,founder));track.update();
    for(let t=1;t<=horizon;t++){
      s.step();track.update();
      const milestones=['firstChain','firstClosed','firstUnpairedChain','firstDetachedChain','firstDetachedClosed','firstPersistentClosed'].filter(k=>track.value[k]===t);
      if(milestones.length)r.milestones.push({milestones,state:s.saveState(),sample:sample(w,founder)});
      if(t<=5||t%500===0)live.invariant(s,initial);
      if(t%500===0)r.samples.push(sample(w,founder));
      if(t%5000===0||t===26000)r.checkpoints.push({t,state:s.saveState()});
      if(t===1000||t%10000===0)console.log(JSON.stringify({seed,on,t,cpu:cpu(),rim:s.rimEvents,copy:track.value.maxCopyingContacts,firstChain:track.value.firstChain}));
      if(t%100===0&&cpu()>600){r.censored=true;break;}
    }
    live.invariant(s,initial);r.complete=s.t===horizon;
  }catch(e){error=e;r.error={message:e.message,stack:e.stack};}
  r.final=s.saveState();r.outcome={...track.value,final:census(s,founder),events:monitor.events.length,
    sampledMaxOverlap:Math.max(...r.samples.map(q=>q.geometry.maxOverlap)),sampledMaxPin:Math.max(...r.samples.map(q=>q.geometry.maxPin))};
  write(file,r);write(file+'.cpu.json',{cpuSeconds:cpu(),steps:s.t,complete:r.complete,censored:r.censored});
  console.log(JSON.stringify({complete:r.complete,job:r.job,t:s.t,outcome:r.outcome,error:r.error}));if(error)process.exitCode=1;
}
function validate(file){
  const output=file+'.validation.json';assert(!fs.existsSync(output)&&!fs.existsSync(output+'.cpu.json'));
  const r=read(file),report={command:process.argv.slice(1),rawHash:hash(file),sourceHash:hash(__filename),complete:false,steps:0};let error;
  try{
    assert(r.complete&&!r.censored);assert.deepEqual(r.sources,sources());
    const w=setup(r.job.seed,r.job.on);assert.deepEqual(w.s.saveState(),r.initial);const s=w.s,track=tracker(s,r.founder);
    const ordinary=new Int32Array(s.bond),rim=new Int32Array(s.rimBond);let next=0,si=0;
    for(let t=0;t<=r.job.horizon;t++){
      if(t){s.step();report.steps++;}track.update();
      while(next<r.monitor.events.length&&r.monitor.events[next].t===t){const e=r.monitor.events[next++],table=e.op==='rim'?rim:ordinary;
        if(e.op==='remove'){assert.equal(table[e.a],e.b);table[e.a]=table[e.b]=-1;}
        else{assert.equal(table[e.a],-1);assert.equal(table[e.b],-1);table[e.a]=e.b;table[e.b]=e.a;}}
      assert.deepEqual(s.bond,ordinary);assert.deepEqual(s.rimBond,rim);
      for(const m of r.milestones.filter(m=>m.sample.t===t)){assert.deepEqual(sample(w,r.founder),m.sample);assert.deepEqual(g.comparable(s.saveState()),g.comparable(m.state));}
      if(t%500===0)assert.deepEqual(sample(w,r.founder),r.samples[si++]);
      if(t%5000===0&&t||t===26000){const checkpoint=r.checkpoints.find(c=>c.t===t);assert.deepEqual(g.comparable(s.saveState()),g.comparable(checkpoint.state));}
      if(t%1000===0)assert(cpu()<600,'Replay CPU ceiling');
    }
    assert.equal(next,r.monitor.events.length);assert.deepEqual(g.comparable(s.saveState()),g.comparable(r.final));
    for(const [k,v]of Object.entries(track.value))assert.deepEqual(v,r.outcome[k]);
    const resumed=live.LiveHalfCellSim.fromState(r.checkpoints.find(c=>c.t===25000).state);
    for(let k=0;k<1000;k++){resumed.step();report.steps++;}
    assert.deepEqual(g.comparable(resumed.saveState()),g.comparable(r.checkpoints.find(c=>c.t===26000).state));
    report.complete=true;report.frames=si;report.neutral=true;report.restart=true;report.tapeEvents=next;
  }catch(e){error=e;report.error={message:e.message,stack:e.stack};}
  write(output,report);write(output+'.cpu.json',{cpuSeconds:cpu(),steps:report.steps,complete:report.complete});console.log(JSON.stringify(report));if(error)process.exitCode=1;
}
function preflight(file){
  assert(!fs.existsSync(file));const report={command:process.argv.slice(1),sources:sources(),complete:false,steps:0};let error;
  try{
    const w=setup(809,true),off=setup(809,false),initial=w.s.saveState();assert.deepEqual(initial.arrays,off.s.saveState().arrays);assert.equal(initial.rng,off.s.saveState().rng);
    const plain=live.LiveHalfCellSim.fromState(initial),mon=instrument(w.s);let resumed;
    for(let t=1;t<=100;t++){w.s.step();plain.step();report.steps+=2;if(t>50){resumed.step();report.steps++;}census(w.s,w.ids.chains[0]);
      if(t===50)resumed=live.LiveHalfCellSim.fromState(w.s.saveState());}
    live.invariant(w.s,initial);assert.deepEqual(g.comparable(w.s.saveState()),g.comparable(plain.saveState()));assert.deepEqual(g.comparable(w.s.saveState()),g.comparable(resumed.saveState()));
    const pair=live.createWorld({start:'paired'}),founder=pair.ids.chains[0],c=census(pair.s,founder);
    assert.equal(c.novelClosed.length,1);assert(!detached(pair.s,[...c.novelClosed[0].units,...c.novelClosed[0].rim]).detached);
    const u=pair.ids.arcs[1][3],a=u*4+2,b=pair.s.rimBond[a];pair.s.rimBond[a]=pair.s.rimBond[b]=-1;assert.equal(census(pair.s,founder).novelClosed.length,0);
    const q=sample(w,w.ids.chains[0]),bad=structuredClone(q);bad.geometry.maxOverlap++;assert.throws(()=>assert.deepEqual(bad,sample(w,w.ids.chains[0])));
    Object.assign(report,{complete:true,neutral:true,restart:true,observer:mon,classification:true,corruptedSampleRejected:true,final:w.s.saveState()});
  }catch(e){error=e;report.error={message:e.message,stack:e.stack};}
  report.cpuSeconds=cpu();write(file,report);console.log(JSON.stringify({complete:report.complete,cpu:report.cpuSeconds,steps:report.steps,error:report.error}));if(error)process.exitCode=1;
}
if(require.main===module){const args=process.argv.slice(2);if(args[0]==='--validate')validate(args[1]);else if(args[0]==='--preflight')preflight(args[1]);else run(Number(args[0]),args[1]==='on',args[2]);}
module.exports={setup,instrument,census,detached,tracker,sample,sources,read,write};
