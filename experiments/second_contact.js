#!/usr/bin/env node
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const {Worker,isMainThread,parentPort,workerData}=require('worker_threads');
const {Sim,F,I_DOCK,I_REPEL,I_HOLD}=require('../src/sim');
const {SEEK,install,observe}=require('./local_redocking');
const {hash,rows}=require('./placement_release');
const {geometry}=require('./anchor_access');
const arms=['off','placement','dock','hold'],secondary=107,site=2;
const sources=['src/sim.js','experiments/local_redocking.js','experiments/placement_release.js','experiments/patch_completion.js','experiments/end_protection.js','experiments/end_protection_natural.js','experiments/anchor_access.js','experiments/second_contact.js'];
function restore(p){return install(Sim.fromState(p.state),'seek',0.0001);}
function audit(p){const out=[];
  for(const u of p.target.filter(x=>x!==p.u))for(const v of p.parent){
    const s=restore(p),actual=s.compat(u,F,v,F);s.is[u]=SEEK;s._deriveAll();s._computeOpen();s._buildHash();
    const potential=s.compat(u,F,v,F);if(potential!==1)continue;
    const dx=s._dx(s.px[v]-s.px[u]),dy=s._dy(s.py[v]-s.py[u]),gate=geometry(s,u,F,v,F,dx,dy,Math.hypot(dx,dy)),free=s.bond[v*4+F]<0&&s.bond[u*4+F]<0;
    out.push({u,v,site:p.parent.indexOf(v),actual,potential,free,gate,placed:free&&gate==='pass'?s._formBond(u,F,v,F):false});
  }return out;
}
function prepare(p,arm){assert(arms.includes(arm));const s=restore(p);
  if(arm!=='off'){
    assert.equal(p.profile,'square');const u=secondary,v=p.parent[site];assert(p.target.includes(u)&&s.bond[u*4+F]<0&&s.bond[v*4+F]<0);
    s.is[u]=SEEK;s._deriveAll();s._computeOpen();s._buildHash();assert.equal(s.compat(u,F,v,F),1);
    const dx=s._dx(s.px[v]-s.px[u]),dy=s._dy(s.py[v]-s.py[u]);assert(s._geomOK(u,F,v,F,dx,dy,Math.hypot(dx,dy)));assert(s._formBond(u,F,v,F));
    s.is[u]=arm==='hold'?I_HOLD:I_DOCK;
    if(arm==='placement'){s._unlink(u,F);s.is[u]=I_REPEL;}
    s.brokeF.length=0;s._deriveAll();s._deriveAll();s._computeOpen();
  }return s;
}
function watch(s){const o=observe(s),log=s._logBirths,settled=[],seen=new Set();
  s._logBirths=function(){const candidates=[...this.brokeF];log.call(this);
    for(const u of candidates){const units=this.strandOf(u),key=units.join(',');if(units.length<2||seen.has(key)||units.some(x=>this.bond[x*4+F]>=0||![I_REPEL,I_HOLD].includes(this.is[x])))continue;
      seen.add(key);settled.push({t:this.t,units,seq:units.map(x=>this._letter(x)).join('')});}
  };return {...o,settled};
}
function run(p,arm){const s=prepare(p,arm),initial=s.saveState(),o=watch(s),windows=[];let heldSteps=0,bothSteps=0,firstLoss=null;
  for(let dt=1;dt<=5000;dt++){
    const held=s.bond[secondary*4+F]===p.parent[site]*4+F;if(held){heldSteps++;if(s.bond[p.u*4+F]>=0)bothSteps++;}
    s.step();if(held&&s.bond[secondary*4+F]!==p.parent[site]*4+F&&firstLoss===null)firstLoss=s.t;
    if(dt%1000===0){assert.deepEqual(s.check(),[]);windows.push({t:s.t,rows:rows(s),stats:s.stats()});}
  }
  return {arm,initial,...o,windows,births:s.births,final:s.saveState(),heldSteps,bothSteps,firstLoss};
}
async function main(){const out=process.argv[2];assert(out&&!fs.existsSync(out));fs.mkdirSync(path.dirname(out),{recursive:true});
  const input='experiments/out/RF_selected.json',raw=fs.readFileSync(input),reference=JSON.parse(raw),p=reference.prepared[0],cpu=process.cpuUsage();
  const sourceHashes=Object.fromEntries(sources.map(f=>[f,hash(fs.readFileSync(f))])),availability=reference.prepared.map(p=>({profile:p.profile,probes:audit(p)}));
  assert.deepEqual(availability[0].probes.filter(x=>x.placed).map(x=>[x.u,x.site]),[[secondary,site]]);assert(!availability[1].probes.some(x=>x.placed));
  const results=await Promise.all(arms.map(arm=>new Promise((resolve,reject)=>{const w=new Worker(__filename,{workerData:{p,arm}});let value;
    w.on('message',r=>{value=r;console.error(JSON.stringify({arm,settled:r.settled.map(x=>x.seq),heldSteps:r.heldSteps,bothSteps:r.bothSteps}));});
    w.on('error',reject);w.on('exit',code=>code||!value?reject(Error('Worker failed')):resolve(value));})));
  assert.deepEqual(results[0].final,reference.results[0].final);assert.deepEqual(results[0].events,reference.results[0].events);
  const plain=prepare(p,'hold');plain.run(5000);assert.deepEqual(plain.saveState(),results[3].final);
  const c=process.cpuUsage(cpu);fs.writeFileSync(out,JSON.stringify({input,inputHash:hash(raw),sources:sourceHashes,availability,prepared:p,results,neutral:true,executedSteps:25000,cpuSeconds:(c.user+c.system)/1e6})+'\n',{flag:'wx'});
}
if(!isMainThread&&require.main===module)parentPort.postMessage(run(workerData.p,workerData.arm));else if(require.main===module)main().catch(e=>{console.error(e);process.exitCode=1;});
module.exports={arms,secondary,site,sources,audit,prepare,watch,run};
