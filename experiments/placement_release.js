#!/usr/bin/env node
// Prepared diagnostic interventions; all subsequent dynamics use the ordinary engine.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),assert=require('assert/strict');
const {Worker,isMainThread,parentPort,workerData}=require('worker_threads');
const {setup}=require('./patch_completion');
const {Sim,F,L,R,I_DOCK,I_REPEL,T_X,T_G}=require('../src/sim');
const arms={keep:[],release87:[87],release107:[107],releaseBoth:[87,107]};
const job={seed:83,profile:'opposed20',undock:0.3,steps:50000},forkAt=15000;
const sources=['src/sim.js','experiments/end_protection.js','experiments/end_protection_natural.js','experiments/patch_completion.js','experiments/placement_release.js'];
const hash=x=>crypto.createHash('sha256').update(typeof x==='string'||Buffer.isBuffer(x)?x:JSON.stringify(x)).digest('hex');
function rows(s){const seen=new Set(),out=[];for(let u=0;u<s.n;u++)if(!seen.has(u)){
  const units=s.strandOf(u);for(const x of units)seen.add(x);
  out.push({units,seq:units.map(x=>s._letter(x)).join(''),states:units.map(x=>s.is[x]),faces:units.map(x=>s.bond[x*4+F])});
}return out;}
function prepare(){const {s,parent}=setup(job);s.run(forkAt);
  const cohort=[87,107].map(anchor=>({anchor,units:s.strandOf(anchor),site:parent.indexOf(s.bond[anchor*4+F]>>2)}));
  assert.deepEqual(cohort.map(x=>x.units.map(u=>s._letter(u)).join('')),['PAAAABB','PAAAAB']);assert.deepEqual(cohort.map(x=>x.site),[3,4]);
  return {state:s.saveState(),parent,cohort,births:s.births};
}
function intervene(s,arm){assert(Object.hasOwn(arms,arm));for(const u of arms[arm]){
  assert.equal(s.is[u],I_DOCK);assert(s.bond[u*4+F]>=0);s.is[u]=I_REPEL;s._unlink(u,F);
}if(arms[arm].length){s._deriveAll();s._deriveAll();s._computeOpen();}}
function observe(s,parent,cohort){
  const placements=[],links=[],unlinks=[],birthMembers=[],index=new Map(parent.map((u,i)=>[u,i]));let context=null;
  const owner=new Map(parent.map(u=>[u,'founder']));for(const c of cohort)for(const u of c.units)owner.set(u,c.anchor===87?'long':'short');
  const form=s._formBond,slot=s._slotFree,link=s._link,unlink=s._unlink,event=s._event;
  s._formBond=function(u,i,v,j){const site=i===F&&j===F?(index.get(u)??index.get(v)):undefined;
    const previous=context;context=[2,3].includes(site)?{t:this.t,site,u,i,v,j}:null;
    const result=form.call(this,u,i,v,j);context=previous;return result;
  };
  s._slotFree=function(m,tx,ty){const result=slot.call(this,m,tx,ty);if(context){const blockers=[];
    this._forNear(tx,ty,v=>{if(v===m||this.type[v]===T_X||this.type[v]===T_G)return;
      const dx=this._dx(this.px[v]-tx),dy=this._dy(this.py[v]-ty),limit=0.75*(this.size[v]+this.size[m])/2;
      if(dx*dx+dy*dy<limit*limit)blockers.push({u:v,dx,dy,limit,group:owner.get(v)||'other'});
    });assert.equal(result,blockers.length===0);placements.push({...context,m,tx,ty,accepted:result,blockers});
  }return result;};
  s._link=function(u,i,v,j){links.push({t:this.t,u,i,v,j});return link.call(this,u,i,v,j);};
  s._unlink=function(u,i){const q=this.bond[u*4+i];if(q>=0)unlinks.push({t:this.t,u,i,v:q>>2,j:q&3});return unlink.call(this,u,i);};
  s._event=function(kind,u,v){const result=event.call(this,kind,u,v);if(kind==='birth')birthMembers.push({t:this.t,units:this.strandOf(u)});return result;};
  return {placements,links,unlinks,birthMembers};
}
function branch(prepared,arm){
  const s=Sim.fromState(prepared.state),restored=s.saveState(),startHash=hash(prepared.state),types=Array.from(s.type);
  // fromState invalidates the bond-group cache; all physical state and RNG must match.
  restored.nums.bondsDirty=prepared.state.nums.bondsDirty;assert.deepEqual(restored,prepared.state);intervene(s,arm);
  const initialBonds=Array.from(s.bond),initialStates=Array.from(s.is),o=observe(s,prepared.parent,prepared.cohort),windows=[];
  for(let t=forkAt;t<job.steps;t+=5000){s.run(5000);windows.push({t:s.t,stats:s.stats(),rows:rows(s)});assert.deepEqual(s.check(),[]);}
  assert.deepEqual(Array.from(s.type),types);assert.equal(o.birthMembers.length,s.births.length);
  for(const e of o.unlinks)assert(![L,R].includes(e.i),'Unexpected lateral loss');
  const births=s.births.map((b,i)=>({...b,...o.birthMembers[i]}));
  const state=s.saveState();return {arm,startHash,initialBonds,initialStates,...o,windows,births,finalStateHash:hash(state),state};
}
async function main(){
  const out=process.argv[2];assert(out&&!fs.existsSync(out));fs.mkdirSync(path.dirname(out),{recursive:true});
  const cpu=process.cpuUsage(),prepared=prepare(),sourceHashes=Object.fromEntries(sources.map(f=>[f,hash(fs.readFileSync(f))]));
  const results=await Promise.all(Object.keys(arms).map(arm=>new Promise((resolve,reject)=>{
    const w=new Worker(__filename,{workerData:{prepared,arm}});let result;
    w.on('message',r=>{result=r;console.error(JSON.stringify({arm:r.arm,births:r.births.map(b=>b.seq),placements:r.placements.length}));});
    w.on('error',reject);w.on('exit',code=>code||!result?reject(Error('Worker failed')):resolve(result));
  })));
  const control=results.find(r=>r.arm==='keep'),unobserved=Sim.fromState(prepared.state);
  unobserved.run(job.steps-forkAt);assert.deepEqual(control.state,unobserved.saveState());
  const plain=setup(job).s;plain.run(job.steps);const continuous=plain.saveState(),normalized=structuredClone(control.state);
  // Restoration forces one extra bond-list rebuild. pinsVersion only invalidates
  // the corner-group cache; prove every other saved field agrees, including RNG.
  const cacheDelta=normalized.nums.pinsVersion-continuous.nums.pinsVersion;assert.equal(cacheDelta,1);
  normalized.nums.pinsVersion=continuous.nums.pinsVersion;assert.deepEqual(normalized,continuous);
  const ref=fs.readFileSync('experiments/out/PC_screen.runs.jsonl','utf8').trim().split(/\r?\n/).map(JSON.parse).find(r=>r.seed===83&&r.profile==='opposed20'&&r.undock===0.3);
  assert.deepEqual(plain.births,ref.births);assert.deepEqual(control.births,[]);
  for(const w of control.windows)assert.deepEqual(w.stats,ref.windows.find(x=>x.t===w.t).stats);
  for(const r of results)delete r.state;
  const c=process.cpuUsage(cpu),result={job,forkAt,prepared,results,neutral:true,
    restart:{cacheDelta,continuousStateHash:hash(continuous),unobservedStateHash:hash(unobserved.saveState())},
    sources:sourceHashes,cpuSeconds:(c.user+c.system)/1e6,executedSteps:240000};
  fs.writeFileSync(out,JSON.stringify(result)+'\n',{flag:'wx'});console.log(JSON.stringify({neutral:true,cpuSeconds:result.cpuSeconds}));
}
if(!isMainThread&&require.main===module)parentPort.postMessage(branch(workerData.prepared,workerData.arm));else if(require.main===module)main().catch(e=>{console.error(e);process.exitCode=1;});
module.exports={arms,job,forkAt,sources,hash,rows,prepare,intervene,observe,branch};
