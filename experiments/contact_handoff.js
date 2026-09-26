#!/usr/bin/env node
// Research-only contact handshake. Global membership is used only by observers.
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const {Worker,isMainThread,parentPort,workerData}=require('worker_threads');
const {Sim,F,L,R,S,I_DOCK,I_REPEL,LETTERS}=require('../src/sim');
const {SEEK,RedockSim,install:installRedock}=require('./local_redocking');
const {setup}=require('./patch_completion');
const {rows,hash}=require('./placement_release');
const REQUEST=7,OFFER=8,LATCH=9,arms=['seek','wait','pulse','hold'];
const sources=['src/sim.js','experiments/end_protection.js','experiments/end_protection_natural.js','experiments/patch_completion.js','experiments/placement_release.js','experiments/local_redocking.js','experiments/contact_handoff.js'];
class HandoffSim extends RedockSim {
  _deriveAll(){if(this.hm)this.hm0.set(this.hm);super._deriveAll();}
  _derive(u){
    const st=this.is[u],o=u*4;
    if(st===REQUEST)this.is[u]=I_DOCK;
    else if(st===OFFER||st===LATCH)this.is[u]=SEEK;
    super._derive(u);this.is[u]=st;
    if(this.hm){this.hm.fill(0,o,o+4);const mark=this.bond[o+F]>=0?(st===REQUEST?1:st===LATCH?2:0):0;
      for(const side of [L,R])if(this.bond[o+side]>=0)this.hm[o+side]=mark;}
  }
  _transition(u){
    if(this._handMode==='seek')return super._transition(u);
    const o=u*4,b=this.bond,st=this.is[u],nl=Number(b[o+L]>=0)+Number(b[o+R]>=0);
    const reads=mark=>[L,R].some(i=>b[o+i]>=0&&this.hm0[b[o+i]]===mark);
    if(st===REQUEST){
      if(b[o+F]<0||nl!==1){this.is[u]=I_DOCK;return Sim.prototype._transition.call(this,u);}
      if(reads(2)){this.is[u]=SEEK;this.pendingUnlink.push(o+F);}
      return;
    }
    if(st===OFFER){
      if(b[o+F]>=0){this.is[u]=this._handMode==='hold'?LATCH:I_DOCK;
        if(this.is[u]===I_DOCK)Sim.prototype._transition.call(this,u);
      }else if(!reads(1))this.is[u]=I_REPEL;
      return;
    }
    if(st===LATCH){
      if(b[o+F]<0||!reads(1)){this.is[u]=I_DOCK;Sim.prototype._transition.call(this,u);}
      return;
    }
    if(st===SEEK)return super._transition(u);
    if(st===I_REPEL&&b[o+F]<0&&this._handMode!=='wait'&&reads(1)){this.is[u]=OFFER;return;}
    Sim.prototype._transition.call(this,u);
    if(this.is[u]===I_DOCK&&LETTERS.includes(this.type[u])&&b[o+F]>=0&&nl===1&&this.rng()<this._endRate)this.is[u]=REQUEST;
  }
}
function install(s,mode,marks){
  assert(arms.includes(mode));installRedock(s,'seek',0.0001);Object.setPrototypeOf(s,HandoffSim.prototype);s._handMode=mode;
  s.hm=new Uint8Array(s.n*4);s.hm0=new Uint8Array(s.n*4);
  if(marks){s.hm.set(marks.current);s.hm0.set(marks.previous);}return s;
}
const marks=s=>({current:Array.from(s.hm),previous:Array.from(s.hm0)});
const save=s=>({state:s.saveState(),marks:marks(s)});
const restore=(x,arm)=>install(Sim.fromState(x.state),arm,x.marks);
function watch(s){
  const events=[],settled=[],stockBirths=[],seen=new Set(rows(s).filter(r=>r.units.length>1&&r.states.every(x=>x===I_REPEL)&&r.faces.every(x=>x<0)).map(r=>r.units.join(',')));
  const link=s._link,unlink=s._unlink,transition=s._transition,log=s._logBirths,event=s._event;
  s._link=function(u,i,v,j){const r=link.call(this,u,i,v,j);events.push({kind:'link',t:this.t,u,i,v,j});return r;};
  s._unlink=function(u,i){const q=this.bond[u*4+i];if(q>=0){assert.equal(i,F);events.push({kind:'unlink',t:this.t,u,i,v:q>>2,j:q&3});}return unlink.call(this,u,i);};
  s._transition=function(u){const before=this.is[u],bonds=Array.from(this.bond.slice(u*4,u*4+4)),read=bonds.map(q=>q<0?0:this.hm0[q]);
    const result=transition.call(this,u);if(this.is[u]!==before)events.push({kind:'state',t:this.t,u,before,after:this.is[u],bonds,read});return result;};
  s._event=function(kind,u,v){if(kind==='birth')stockBirths.push({t:this.t,units:this.strandOf(u)});return event.call(this,kind,u,v);};
  s._logBirths=function(){log.call(this);for(const r of rows(this)){
    const key=r.units.join(',');if(r.units.length<2||seen.has(key)||r.states.some(x=>x!==I_REPEL)||r.faces.some(q=>q>=0))continue;
    seen.add(key);settled.push({t:this.t,units:r.units,seq:r.seq});}};
  return {events,settled,stockBirths};
}
function run(p,arm,steps=5000,observed=true){
  const s=install(Sim.fromState(p.state),arm),initial=save(s),o=observed?watch(s):{},windows=[];
  for(let dt=1;dt<=steps;dt++){s.step();if(observed&&dt%1000===0){assert.deepEqual(s.check(),[]);windows.push({t:s.t,rows:rows(s),stats:s.stats(),marks:marks(s)});}}
  return {profile:p.profile,arm,initial,...o,windows,births:s.births,final:save(s)};
}
function build(p){const {s,parent}=setup({seed:87,profile:p.profile,undock:0.1});installRedock(s,'seek',0.0001);s.run(p.at-1);
  const state=s.saveState();assert.deepEqual(s.strandOf(p.u),p.target);s.step();assert.deepEqual(s.saveState(),p.state);
  return {profile:p.profile,at:p.at-1,u:p.u,parent,target:p.target,state};
}
async function main(){const out=process.argv[2];assert(out&&!fs.existsSync(out));fs.mkdirSync(path.dirname(out),{recursive:true});
  const input='experiments/out/RF_selected.json',raw=fs.readFileSync(input),cpu=process.cpuUsage(),reference=JSON.parse(raw),prepared=reference.prepared.map(build),results=[];
  const sourceHashes=Object.fromEntries(sources.map(f=>[f,hash(fs.readFileSync(f))]));
  for(const p of prepared){const batch=await Promise.all(arms.map(arm=>new Promise((resolve,reject)=>{const w=new Worker(__filename,{workerData:{p,arm}});let value;
    w.on('message',r=>{value=r;console.error(JSON.stringify({profile:p.profile,arm,settled:r.settled.map(x=>x.seq),special:r.events.filter(e=>e.kind==='state'&&(e.before>=REQUEST||e.after>=REQUEST)).map(e=>({t:e.t,u:e.u,from:e.before,to:e.after}))}));});
    w.on('error',reject);w.on('exit',code=>code||!value?reject(Error('worker failed')):resolve(value));})));results.push(...batch);
    for(const arm of arms)assert.deepEqual(run(p,arm,5000,false).final,batch.find(r=>r.arm===arm).final);
  }
  const c=process.cpuUsage(cpu);fs.writeFileSync(out,JSON.stringify({input,inputHash:hash(raw),sources:sourceHashes,prepared,results,neutral:true,executedSteps:113500,cpuSeconds:(c.user+c.system)/1e6})+'\n',{flag:'wx'});
}
if(!isMainThread&&require.main===module)parentPort.postMessage(run(workerData.p,workerData.arm));else if(require.main===module)main().catch(e=>{console.error(e);process.exitCode=1;});
module.exports={REQUEST,OFFER,LATCH,arms,sources,HandoffSim,install,marks,save,restore,watch,run,build};
