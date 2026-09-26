'use strict';
const assert=require('assert/strict');
const {RChem}=require('../src/rchem');
const {drawR}=require('./rsearch');
const {graph,canonical,components,control,prepareWorld,Observer,summarize,inventory}=require('./random_heredity');

const def=control();
assert.equal(def.variants[0].targets.length,2);
assert.equal(def.variants[1].targets.length,1);
assert.ok(!def.variants[0].targets.includes(def.variants[1].targets[0]));
const setup=prepareWorld(def,0,'seeded',201), disrupted=prepareWorld(def,0,'disrupted',201);
assert.deepEqual(inventory(setup.s).counts,[150,150]);
assert.deepEqual(setup.founders,disrupted.founders);
for(const key of ['px','py','pa','ox','oy','type','is'])assert.deepEqual(setup.s[key],disrupted.s[key],key);
const comp=components(setup.s).find(c=>c.length===3), sig=canonical(graph(setup.s,comp));
assert.equal(canonical(graph(setup.s,[...comp].reverse())),sig);
setup.s.is[comp[0]]=4;
assert.equal(canonical(graph(setup.s,comp)),sig,'state changes must not create species');
const modified=graph(setup.s,comp);modified[0].type=99;
assert.notEqual(canonical(modified),sig);

// Observer wrappers, exact classifications and scans must preserve every physical
// array, counter, RNG and spare Gaussian value; compare both tables.
for(const params of [def.params,drawR(55)]){
  const plain=new RChem({...params,seed:771}), observed=new RChem({...params,seed:771});
  if(params.table){plain.seedChains(['AAB'],5);observed.seedChains(['AAB'],5);}
  const o=new Observer(observed,def.variants,[]);
  for(let t=0;t<1200;++t){plain.step();observed.step();o.tick();}
  assert.deepEqual(observed.saveState(),plain.saveState(),'observer changed physical state');
  for(const key of Object.keys(plain))if(ArrayBuffer.isView(plain[key]))assert.deepEqual(observed[key],plain[key],key);
  const continued=RChem.fromState(plain.saveState());
  plain.run(100);continued.run(100);
  const resumed=continued.saveState(), uninterrupted=plain.saveState();
  // Rebuilding pins on restore advances this cache version, not physical time.
  delete resumed.nums.pinsVersion;delete uninterrupted.nums.pinsVersion;
  assert.deepEqual(resumed,uninterrupted,'RChem restart diverged');
  for(let u=0;u<plain.n;++u)for(let side=0;side<4;++side){const q=plain.bond[4*u+side];if(q>=0)assert.equal(plain.bond[q],4*u+side);}
}

const ep=(members,start,end,founderOverlap=0,variant=0)=>({members,start,end,founderOverlap,variant});
const raw={steps:500,targets:[['A'],['B']],events:[],episodes:[
  ep([1,2,3],0,200,3),ep([4,5,6],10,50),ep([4,5,6],100,250),
  ep([4,5,6],300,null),ep([7,8,9],450,null),ep([10,11,12],200,400,0,1)]};
assert.deepEqual(summarize(raw).fresh,[2,1]);
assert.deepEqual(summarize(raw).persistent,[1,1]);
assert.equal(summarize(raw).censored,1);
// A contact after verified persistence and before separation is only a witness.
raw.episodes.push(ep([13,14,15],260,null));raw.events.push([210,1,4,0,13,0]);
assert.equal(summarize(raw).witnesses.length,1);
raw.events[0][0]=30;assert.equal(summarize(raw).witnesses.length,0);

// Transient attachment and loss in the same step must interrupt persistence.
const f=prepareWorld(def,1,'seeded',301), obs=new Observer(f.s,def.variants,f.founders);
const before=obs.episodes.length, u=f.founders[0], v=components(f.s).find(c=>c.length===1)[0];
f.s.t=50;f.s._link(u,0,v,0);f.s._unlink(u,0);obs.tick();
assert.ok(obs.episodes.length>before);assert.ok(obs.episodes.some(e=>e.end===50));
console.log('PASS: exact graph identity, control reversal, matched preparation, state exclusion, persistence/member reuse, witnesses, observer neutrality and RChem restart');
