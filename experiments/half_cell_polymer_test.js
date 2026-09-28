#!/usr/bin/env node
'use strict';
// Additional functional coverage: extend a cap-bound W at either free end.
// Prepared geometry, pMem=1, no time stepping; not a kinetic success claim.
const fs=require('fs'),assert=require('assert/strict');
const {HalfCellPolymerSim}=require('./half_cell_polymer');
const {setup,jobs}=require('./half_cell_rim_setup');
const {F,K,L,R}=require('../src/sim');
const {comparable}=require('./half_cell_geometry');
const {hash}=require('./half_cell_rim_test');
const file=process.argv[2];assert(file&&!fs.existsSync(file),'Unique output required');
const r={command:process.argv.slice(1),sources:Object.fromEntries([
  'experiments/half_cell_polymer_test.js','experiments/half_cell_polymer.js',
  'experiments/half_cell_rim.js','experiments/half_cell_rim_setup.js','src/sim.js'
].map(f=>[f,hash(f)])),complete:false,physicsSteps:0};
try{
  let extensions=0;
  for(const end of ['P','Q']){
    const fixture=setup({...jobs()[0],end,arm:'prepared'});
    const s=HalfCellPolymerSim.fromState(fixture.s.saveState(),{pMem:1,rimBind:true});
    const [u,v]=fixture.ids.rims,cap=fixture.ids.caps[0];
    const capSide=end==='P'?L:R,attached=end==='P'?F:K,i=end==='P'?K:F,j=end==='P'?F:K;
    s.rimBond.fill(-1);s._linkRim(cap,capSide,u,attached);
    const a=s._side(u,i,[0,0,0,0]),b=s._side(v,j,[0,0,0,0]);
    s._rigidMove(v,0,0,Math.atan2(-a[3],-a[2])-Math.atan2(b[3],b[2]));
    const c=s._side(v,j,[0,0,0,0]);
    s._rigidMove(v,s._dx(s.px[u]+a[0]-s.px[v]-c[0]),s._dy(s.py[u]+a[1]-s.py[v]-c[1]),0);
    assert(s.polymerContact(u,i,v,j));assert(s.rimCompatible(u,i,v,j));
    const before=s.saveState();s.p.pMem=0;s._formRimBonds();assert.equal(s.rimBond[u*4+i],-1);
    s.p.pMem=1;s._formRimBonds();assert.equal(s.rimBond[u*4+i],v*4+j);
    assert.equal(s.rimBond[cap*4+capSide],u*4+attached);
    for(const key of ['px','py','pa','ox','oy','type','bond'])assert.deepEqual(s.saveState().arrays[key],before.arrays[key]);
    const events=s.rimEvents;s._formRimBonds();assert.equal(s.rimEvents,events,'Occupied ends rebound');
    const restored=HalfCellPolymerSim.fromState(s.saveState());
    assert.deepEqual(comparable(restored.saveState()),comparable(s.saveState()));
    assert.deepEqual(s.check(),[]);assert.equal(s.n,8);extensions++;
  }
  Object.assign(r,{complete:true,extensions,checks:['both W end directions','growth from cap-bound W',
    'zero probability','occupied ports','pose/material/ordinary bonds unchanged','restart retains new bonds']});
}catch(e){r.error={message:e.message,stack:e.stack};process.exitCode=1;}
const c=process.cpuUsage();r.cpuSeconds=(c.user+c.system)/1e6;
fs.writeFileSync(file,JSON.stringify(r)+'\n',{flag:'wx'});console.log(JSON.stringify(r));
