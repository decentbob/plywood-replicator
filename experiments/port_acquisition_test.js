#!/usr/bin/env node
'use strict';
const assert=require('assert/strict'),base=require('./resource_ports');
const {AcquisitionSim,fixture,gap,metrics}=require('./port_acquisition');
const normal=st=>{const a=JSON.parse(JSON.stringify(st));delete a.nums.pinsVersion;delete a.arrays.open;return a;};
const cfg={kind:'left',start:'one0',scheme:'zero4',seed:221,enabled:true,viability:true};
// Actual second bond, and it must not reposition either bonded block.
const f=fixture(cfg),s=f.s,missing=f.observer.targets.find(x=>s.bond[x.q]!==x.r),before=s.saveState();
assert(s._formBond(missing.q>>2,missing.q&3,missing.r>>2,missing.r&3));
for(const name of ['px','py','pa','ox','oy'])assert.deepEqual(s.saveState().arrays[name],before.arrays[name]);
assert(gap(s,missing.q>>2,missing.q&3,missing.r>>2,missing.r&3).max<1e-8);
const negative=fixture(cfg).s;negative.portLabels=Object.freeze(Array(negative.n*4).fill('dead:0:+'));
const bond0=Array.from(negative.bond);negative._formBonds();assert.deepEqual(Array.from(negative.bond),bond0);

// A monomer rotated by 90 degrees fits only when the proposed pose is used.
const pair=base.setup([{id:'a',kind:'B',type:'B0',x:0,y:0},{id:'b',kind:'B',type:'B0',x:2,y:0}],{zero:true});
const state=pair.saveState();state.p={...state.p,portLabels:['X:0:+','N:0:+','X:0:-','N:0:+','X:0:+','N:0:+','X:0:-','N:0:+'],associationEnabled:true,portLoss:0};
const rotated=AcquisitionSim.fromState(state);rotated._rigidMove(1,0,0,Math.PI/2);
let proposedRotation;const originalSlot=rotated._slotFree;
rotated._slotFree=function(m,x,y,rot){proposedRotation=rot;return originalSlot.call(this,m,x,y,rot);};
assert(rotated._formBond(0,0,1,2));assert(Math.abs(Math.sin(proposedRotation)+1)<1e-8);
assert(gap(rotated,0,0,1,2).max<1e-8);
const rejected=AcquisitionSim.fromState(state);rejected._slotFree=()=>false;const rejectedBefore=rejected.saveState();
assert.equal(rejected._formBond(0,0,1,2),false);
for(const name of ['px','py','pa','ox','oy','bond'])assert.deepEqual(rejected.saveState().arrays[name],rejectedBefore.arrays[name]);
const lossy=fixture({...cfg,enabled:false}).s;lossy.p.portLoss=1;const types=Array.from(lossy.type);lossy._loseBonds();
assert(Array.from(lossy.bond).every(q=>q===-1));assert.deepEqual(Array.from(lossy.type),types);assert.deepEqual(lossy.check(),[]);

// Do not let setup IDs, pattern metadata or observer graph helpers reach reactions.
const clean=fixture({...cfg,scheme:'individual32',viability:false}),poison=fixture({...cfg,scheme:'individual32',viability:false});
const fail=()=>{throw Error('Forbidden observer/setup read');};
for(const name of ['_nodes','_units'])Object.defineProperty(poison.s,name,{get:fail,configurable:true});
const oldOpen=poison.s.open;Object.defineProperty(poison.s,'open',{get:fail,configurable:true});
Object.defineProperty(poison.s.p,'fixture',{get:fail,configurable:true});
for(const name of ['componentOf','strandOf','chainOf','cycleOf','stats','enclosedBy'])poison.s[name]=fail;
for(let t=0;t<40;t++){metrics(clean.s,clean.observer);clean.s.step();poison.s.step();}
// Core serialization enumerates properties before skipping private metadata.
for(const name of ['_nodes','_units']){delete poison.s[name];poison.s[name]=clean.s[name];}
delete poison.s.open;poison.s.open=oldOpen;
delete poison.s.p.fixture;poison.s.p.fixture=clean.s.p.fixture;
assert.deepEqual(normal(clean.s.saveState()),normal(poison.s.saveState()),'Observer/metadata access changes runtime');
const restored=AcquisitionSim.fromState(JSON.parse(JSON.stringify(clean.s.saveState())));
for(let t=0;t<50;t++){clean.s.step();restored.step();}
assert.deepEqual(normal(clean.s.saveState()),normal(restored.saveState()));
assert.deepEqual(clean.s.portLabels,restored.portLabels);assert.deepEqual(restored.check(),[]);
const acquired=fixture(cfg).s;acquired.step();const acquiredRestart=AcquisitionSim.fromState(JSON.parse(JSON.stringify(acquired.saveState())));
for(let t=0;t<20;t++){acquired.step();acquiredRestart.step();}
assert.deepEqual(normal(acquired.saveState()),normal(acquiredRestart.saveState()));
console.log('PASS: face specificity, rotated placement, rejection neutrality, no bonded repositioning, loss/conservation, metadata boundary, observer neutrality and subclass/label restart');
