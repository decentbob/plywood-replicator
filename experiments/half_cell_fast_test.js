#!/usr/bin/env node
'use strict';
// Bit-identity and speed check: FastLiveHalfCellSim versus LiveHalfCellSim from identical saved states.
const assert=require('assert/strict'),live=require('./half_cell_live'),{FastLiveHalfCellSim}=require('./half_cell_fast');
const steps=Number(process.argv[2]||1500),cpu=()=>{const c=process.cpuUsage();return(c.user+c.system)/1e6;};
let slow=0,quick=0,worlds=0;
for(const start of live.STARTS)for(const motion of ['body','individual'])for(const seed of [901,902]){
  const st=live.createWorld({seed,start,motion}).s.saveState();
  const a=live.LiveHalfCellSim.fromState(st),b=FastLiveHalfCellSim.fromState(st);
  let t=cpu();a.run(steps);slow+=cpu()-t;t=cpu();b.run(steps);quick+=cpu()-t;
  assert.deepEqual(b.saveState(),a.saveState(),`${start}/${motion}/${seed} diverged`);
  assert.deepEqual(Array.from(b.rimBond),Array.from(a.rimBond));worlds++;
}
console.log(JSON.stringify({worlds,steps,identical:true,slowCpu:+slow.toFixed(2),fastCpu:+quick.toFixed(2),speedup:+(slow/quick).toFixed(2)}));
