#!/usr/bin/env node
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const {F,I_DOCK,I_REPEL,I_HOLD}=require('../src/sim');
const {SEEK}=require('./local_redocking');
const first=require('./second_contact'),{hash,rows}=require('./placement_release');
const sources=[...first.sources,'experiments/second_contact_order.js'],arms=first.arms;
function pairOrder(s,x,y){s._buildHash();const matches=[];
  for(let c=0;c<s.cellStart.length-1;c++)for(let a=s.cellStart[c];a<s.cellStart[c+1];a++){
    const u=s.cellItems[a];if(u!==x&&u!==y)continue;
    for(let f=-1;f<4;f++){const c2=f<0?c:s.fwd[c*4+f];for(let k=f<0?a+1:s.cellStart[c2];k<s.cellStart[c2+1];k++){
      const v=s.cellItems[k];if(u===x&&v===y||u===y&&v===x)matches.push([u,v]);}}
  }assert.equal(matches.length,1);return matches[0];
}
function start(p,arm){assert(arms.includes(arm));const s=first.prepare(p,'off');if(arm==='off')return s;
  const x=first.secondary,y=p.parent[first.site];s.is[x]=SEEK;s._deriveAll();s._computeOpen();
  const [u,v]=pairOrder(s,x,y);assert.deepEqual([u,v],[y,x]);assert.equal(s.compat(u,F,v,F),1);
  assert(s.bond[u*4+F]<0&&s.bond[v*4+F]<0);const dx=s._dx(s.px[v]-s.px[u]),dy=s._dy(s.py[v]-s.py[u]);
  assert(s._geomOK(u,F,v,F,dx,dy,Math.hypot(dx,dy)));assert(s._formBond(u,F,v,F));
  s.is[x]=arm==='hold'?I_HOLD:I_DOCK;if(arm==='placement'){s._unlink(x,F);s.is[x]=I_REPEL;}
  s.brokeF.length=0;s._deriveAll();s._deriveAll();s._computeOpen();return s;
}
function run(p,arm){const s=start(p,arm),initial=s.saveState(),o=first.watch(s),windows=[];let heldSteps=0,bothSteps=0,firstLoss=null;
  for(let dt=1;dt<=5000;dt++){
    const held=s.bond[first.secondary*4+F]===p.parent[first.site]*4+F;
    if(held){heldSteps++;if(s.bond[p.u*4+F]>=0)bothSteps++;}
    s.step();if(held&&s.bond[first.secondary*4+F]!==p.parent[first.site]*4+F&&firstLoss===null)firstLoss=s.t;
    if(dt%1000===0){assert.deepEqual(s.check(),[]);windows.push({t:s.t,rows:rows(s),stats:s.stats()});}
  }return {arm,initial,...o,windows,births:s.births,final:s.saveState(),heldSteps,bothSteps,firstLoss};
}
function main(){const out=process.argv[2];assert(out&&!fs.existsSync(out));fs.mkdirSync(path.dirname(out),{recursive:true});
  const input='experiments/out/SC_selected.json',raw=fs.readFileSync(input),ref=JSON.parse(raw),p=ref.prepared,cpu=process.cpuUsage();
  const sourceHashes=Object.fromEntries(sources.map(f=>[f,hash(fs.readFileSync(f))])),results=arms.map(arm=>run(p,arm));
  assert.deepEqual(results[0].final,ref.results[0].final);const plain=start(p,'hold');plain.run(5000);assert.deepEqual(results[3].final,plain.saveState());
  const c=process.cpuUsage(cpu);fs.writeFileSync(out,JSON.stringify({kind:'scan-order',input,inputHash:hash(raw),sources:sourceHashes,prepared:p,results,neutral:true,executedSteps:25000,cpuSeconds:(c.user+c.system)/1e6})+'\n',{flag:'wx'});
  for(const b of results)console.log(JSON.stringify({arm:b.arm,held:b.heldSteps,both:b.bothSteps,target:b.settled.filter(x=>p.target.every(u=>x.units.includes(u)))}));
}
if(require.main===module)main();module.exports={sources,arms,start,pairOrder,run};
