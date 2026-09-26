#!/usr/bin/env node
const assert=require('assert/strict');
const {Sim}=require('../src/sim.js'),{setup}=require('./curved_fuel_reproduction.js'),{observe}=require('./offspring_recovery.js'),{follow,branch,arms}=require('./offspring_forks.js');
const {s,founders}=setup({seed:71,profile:'square',mode:'copy',rows:1,grip:true,iters:4}),o=observe(s,founders);s.run(10000);
const state=JSON.parse(JSON.stringify(s.saveState())),cohort=o.rows.slice(1),before=JSON.stringify(state);
const a=Sim.fromState(state),b=Sim.fromState(state);follow(a,cohort);a.run(3000);b.run(3000);assert.deepEqual(a.saveState(),b.saveState());
for(const arm of Object.keys(arms)){const r=branch(state,cohort,arm,3000);assert.deepEqual(r.params,{...state.p,...arms[arm]});
  if(arm==='control')assert.deepEqual(r.windows.at(-1).stats,b.stats());}
assert.equal(JSON.stringify(state),before,'Fork source mutated');
const c=Sim.fromState(state),f=follow(c,cohort);assert(cohort.length>=2);
// Observer fixture: the same parent IDs must cease to count after their original row frays.
cohort[1].units.forEach((u,i)=>c.parentOf[u]=cohort[0].units[i]);
c._event('birth',cohort[1].units[0]);assert.equal(f.events.at(-1).cohortParent,0);
c._event('fray',cohort[0].units[0]);assert.equal(f.lost[0],c.t);
c._event('birth',cohort[1].units[0]);assert.equal(f.events.at(-1).cohortParent,null);
c._event('fray',cohort[0].units[1]);assert.equal(f.lost[0],c.t);
console.log('PASS: exact control continuation, observer neutrality, independent parameter-only branches, immutable source and first-fray cohort loss');
