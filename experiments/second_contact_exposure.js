#!/usr/bin/env node
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const {F}=require('../src/sim');
const {SEEK}=require('./local_redocking');
const {prepare,watch,secondary,site,sources:priorSources}=require('./second_contact');
const {hash,rows}=require('./placement_release');
const sources=[...priorSources,'experiments/second_contact_exposure.js'],arms=['off','expose'];
function start(p,arm){assert(arms.includes(arm));const s=prepare(p,'off');if(arm==='expose'){s.is[secondary]=SEEK;s._deriveAll();s._deriveAll();s._computeOpen();}return s;}
function run(p,arm){const s=start(p,arm),initial=s.saveState(),o=watch(s),windows=[];let heldSteps=0,bothSteps=0;
  for(let dt=1;dt<=5000;dt++){
    if(s.bond[secondary*4+F]===p.parent[site]*4+F){heldSteps++;if(s.bond[p.u*4+F]>=0)bothSteps++;}
    s.step();if(dt%1000===0){assert.deepEqual(s.check(),[]);windows.push({t:s.t,rows:rows(s),stats:s.stats()});}
  }return {arm,initial,...o,windows,births:s.births,final:s.saveState(),heldSteps,bothSteps};
}
function main(){const out=process.argv[2];assert(out&&!fs.existsSync(out));fs.mkdirSync(path.dirname(out),{recursive:true});
  const input='experiments/out/SC_selected.json',raw=fs.readFileSync(input),reference=JSON.parse(raw),p=reference.prepared,cpu=process.cpuUsage();
  const sourceHashes=Object.fromEntries(sources.map(f=>[f,hash(fs.readFileSync(f))])),results=arms.map(arm=>run(p,arm));
  assert.deepEqual(results[0].final,reference.results[0].final);assert.deepEqual(results[0].events,reference.results[0].events);
  const plain=start(p,'expose');plain.run(5000);assert.deepEqual(results[1].final,plain.saveState());
  const c=process.cpuUsage(cpu);fs.writeFileSync(out,JSON.stringify({input,inputHash:hash(raw),sources:sourceHashes,prepared:p,results,neutral:true,executedSteps:15000,cpuSeconds:(c.user+c.system)/1e6})+'\n',{flag:'wx'});
  for(const r of results)console.log(JSON.stringify({arm:r.arm,settled:r.settled,heldSteps:r.heldSteps}));
}
if(require.main===module)main();module.exports={sources,arms,start,run};
