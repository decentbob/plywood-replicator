#!/usr/bin/env node
// Research-only endpoint states; restricted to the no-energy/no-turnover assay.
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const {Worker,isMainThread,parentPort,workerData}=require('worker_threads');
const {Sim,F,K,L,R,S,I_DOCK,I_REPEL,LETTERS}=require('../src/sim');
const {rows,hash}=require('./placement_release');
const SEEK=6;
class RedockSim extends Sim {
  _derive(u){
    if(this.is[u]!==SEEK)return super._derive(u);
    const o=u*4;this.ss[o+F]=S.DOCK;this.ss[o+K]=S.IDLE;
    for(const side of [L,R])this.ss[o+side]=this.bond[o+side]>=0?S.BONDED:S.INERT;
  }
  _transition(u){
    const o=u*4,b=this.bond;
    if(this.is[u]===SEEK){
      if(b[o+F]>=0||b[o+L]<0&&b[o+R]<0){
        this.is[u]=I_DOCK;if(b[o+F]>=0)this._event('endpoint-redock',u);
        return super._transition(u);
      }
      return;
    }
    super._transition(u);
    if(!this._endRate||!LETTERS.includes(this.type[u])||this.is[u]!==I_DOCK||b[o+F]<0)return;
    if(Number(b[o+L]>=0)+Number(b[o+R]>=0)!==1)return;
    if(this.rng()<this._endRate){
      this.is[u]=this._endMode==='seek'?SEEK:I_REPEL;
      this.pendingUnlink.push(o+F);this._event('endpoint-release',u);
    }
  }
}
function install(s,mode,rate){
  assert(['off','drop','seek'].includes(mode));assert(rate>=0&&rate<=1);assert(mode!=='off'||rate===0);
  assert(s.p.energyGate&&s.p.pFray===0&&s.p.pBreak===0&&!s.p.backCopy&&!s.p.stack&&!s.p.translate);
  assert(Array.from(s.type).every(t=>LETTERS.includes(t)));
  Object.setPrototypeOf(s,RedockSim.prototype);s._endMode=mode;s._endRate=rate;return s;
}
function observe(s){
  const events=[],stockBirths=[],settled=[],seen=new Set();
  const event=s._event,link=s._link,unlink=s._unlink,log=s._logBirths;
  s._event=function(kind,u,v){const result=event.call(this,kind,u,v);
    if(kind==='birth')stockBirths.push({t:this.t,units:this.strandOf(u)});
    if(kind==='endpoint-release'||kind==='endpoint-redock')events.push({kind,t:this.t,u,face:this.bond[u*4+F],units:this.strandOf(u),state:this.is[u]});
    return result;
  };
  s._link=function(u,i,v,j){const result=link.call(this,u,i,v,j);events.push({kind:'link',t:this.t,u,i,v,j});return result;};
  s._unlink=function(u,i){const q=this.bond[u*4+i];if(q>=0){assert.equal(i,F,'Lateral loss');events.push({kind:'unlink',t:this.t,u,i,v:q>>2,j:q&3});}return unlink.call(this,u,i);};
  s._logBirths=function(){const candidates=[...this.brokeF];log.call(this);
    for(const u of candidates){const units=this.strandOf(u),key=[...units].sort((a,b)=>a-b).join(',');
      if(units.length<2||seen.has(key)||units.some(x=>this.bond[x*4+F]>=0||this.is[x]!==I_REPEL))continue;
      seen.add(key);settled.push({t:this.t,units,seq:units.map(x=>this._letter(x)).join('')});
    }
  };
  return {events,stockBirths,settled};
}
const jobs=[{mode:'off',rate:0},...[0.0001,0.001].flatMap(rate=>['drop','seek'].map(mode=>({mode,rate})))];
const sourceFiles=['src/sim.js','experiments/placement_release.js','experiments/local_redocking.js'];
function run(prepared,job){
  const s=install(Sim.fromState(prepared.state),job.mode,job.rate),o=observe(s),windows=[];
  for(let i=0;i<7;i++){s.run(5000);assert.deepEqual(s.check(),[]);windows.push({t:s.t,stats:s.stats(),rows:rows(s)});}
  assert.equal(o.stockBirths.length,s.births.length);
  return {...job,...o,windows,births:s.births,final:s.saveState()};
}
async function main(){
  const out=process.argv[2];assert(out&&!fs.existsSync(out));fs.mkdirSync(path.dirname(out),{recursive:true});
  const input='experiments/out/PR_selected.json',raw=fs.readFileSync(input),prepared=JSON.parse(raw).prepared;
  const sources=Object.fromEntries(sourceFiles.map(f=>[f,hash(fs.readFileSync(f))]));
  const cpu=process.cpuUsage(),results=[];
  for(let start=0;start<jobs.length;start+=4){const batch=await Promise.all(jobs.slice(start,start+4).map(job=>new Promise((resolve,reject)=>{
    const w=new Worker(__filename,{workerData:{prepared,job}});let value;
    w.on('message',r=>{value=r;console.error(JSON.stringify({mode:r.mode,rate:r.rate,settled:r.settled.map(x=>x.seq),releases:r.events.filter(x=>x.kind==='endpoint-release').length,redocks:r.events.filter(x=>x.kind==='endpoint-redock').length}));});
    w.on('error',reject);w.on('exit',code=>code||!value?reject(Error('Worker failed')):resolve(value));
  })));results.push(...batch);}
  const ordinary=Sim.fromState(prepared.state);ordinary.run(35000);assert.deepEqual(results[0].final,ordinary.saveState());
  const c=process.cpuUsage(cpu);fs.writeFileSync(out,JSON.stringify({input,inputHash:hash(raw),sources,jobs,results,neutral:true,executedSteps:210000,cpuSeconds:(c.user+c.system)/1e6})+'\n',{flag:'wx'});
}
if(!isMainThread&&require.main===module)parentPort.postMessage(run(workerData.prepared,workerData.job));
else if(require.main===module)main().catch(e=>{console.error(e);process.exitCode=1;});
module.exports={SEEK,RedockSim,install,observe,jobs,sourceFiles,run};
