#!/usr/bin/env node
'use strict';
const fs=require('fs'),assert=require('assert/strict'),crypto=require('crypto');
const {setup,jobs}=require('./half_cell_rim_setup');
const {HalfCellRimSim}=require('./half_cell_rim');
const {HalfCellContactSim}=require('./half_cell_contact');
const {F,R,K,L,T_C,T_P,I_DOCK,I_REPEL,I_TPL,S}=require('../src/sim');
const {comparable}=require('./half_cell_geometry');
const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const SOURCES=['src/sim.js','experiments/half_cell_geometry.js','experiments/half_cell_contact.js',
  'experiments/polygon_contact_physics.js','experiments/resource_ports.js','experiments/resource_economy.js',
  'experiments/half_cell_rim.js','experiments/half_cell_rim_setup.js','experiments/half_cell_rim_test.js',
  'experiments/half_cell_rim_plan.md'];
function tests(){
  let chemistryCases=0,physicsSteps=0;
  for(const end of ['P','Q'])for(const rail of [false,true])for(const state of [I_DOCK,I_REPEL,I_TPL]){
    const {s,ids}=setup({...jobs()[0],end}),cap=ids.caps[1],side=s.type[cap]===T_P?R:L;
    if(!rail)s._unlink(cap,side);s.is[cap]=state;
    const bare=HalfCellRimSim.fromState(s.saveState());bare.rimBond.fill(-1);
    for(const x of [s,bare]){x._deriveAll();x._deriveAll();x._computeOpen();}
    assert.deepEqual(s.ss,bare.ss,'Rim changed ordinary side states');
    s._chemistry();bare._chemistry();assert.deepEqual(s.is,bare.is);assert.deepEqual(s.bond,bare.bond);
    if(state===I_DOCK)assert.equal(s.is[cap],rail?I_REPEL:I_DOCK);
    else if(!rail)assert.equal(s.is[cap],I_DOCK,'Rim substituted for lost rail');
    assert(s.rimBond.some(q=>q>=0));chemistryCases++;
  }
  for(const end of ['P','Q']){
    const {s,ids}=setup({...jobs()[0],end}),cap=ids.caps[1];s.is[cap]=I_REPEL;
    s._link(cap,K,ids.fuels[1],F);s._deriveAll();s._deriveAll();s._chemistry();
    assert.equal(s.is[cap],I_TPL,'Supplied fuel failed to rearm');assert(s.rimBond.some(q=>q>=0));
    for(const w of ids.rims){assert.equal(s.open[w],0);for(let i=0;i<4;i++)assert.equal(s.ss[w*4+i],S.IDLE);}
  }
  for(const arm of ['on','off']){
    const {s}=setup({...jobs()[0],arm});s._formRimBonds();assert.equal(s.rimEvents,arm==='on'?2:0);
  }
  const wrong=setup({...jobs()[0],arm:'on'});
  for(const w of wrong.ids.rims)wrong.s._rigidMove(w,0,0,Math.PI);
  wrong.s._formRimBonds();assert.equal(wrong.s.rimEvents,0,'Wrong end labels bind');
  const ww=setup({...jobs()[0],arm:'on'});
  for(let u=0;u<ww.s.n;u++){ww.s.px[u]=2+u*2;ww.s.py[u]=2;ww.s.pa[u]=0;ww.s._resetShape(u);}
  ww.s.bond.fill(-1);const [a,b]=ww.ids.rims;
  ww.s.px[a]=10;ww.s.px[b]=10.5;ww.s.py[a]=ww.s.py[b]=12;ww.s._formRimBonds();
  assert.equal(ww.s.rimBond[a*4+F],b*4+K,'W/W ends did not bind');
  const dock=setup(jobs()[0]),cap=dock.ids.caps[1],rail=dock.s.type[cap]===T_P?R:L;
  dock.s._unlink(cap,F);dock.s._unlink(cap,rail);dock.s._rigidMove(cap,.02,0,0);
  const before=dock.s.saveState();assert(dock.s._formBond(dock.ids.caps[0],F,cap,F));
  for(const k of ['px','py','pa','ox','oy'])assert.deepEqual(dock.s.saveState().arrays[k],before.arrays[k],'Attached cap snapped');
  for(const name of ['fixture','target','parentIdentity'])Object.defineProperty(dock.s,name,{get(){throw Error('Observer read');}});
  dock.s._formRimBonds(); // no reads of observer classifications
  const {s}=setup(jobs()[0]),st=s.saveState(),union=s.mechanicalBonds();
  st.arrays.bond={t:'Int32Array',b:Buffer.from(union.buffer).toString('base64')};
  const old=HalfCellContactSim.fromState(st);
  for(let t=0;t<10;t++){
    s._physics();old._physics();physicsSteps+=2;
    const ss=s.saveState(),os=old.saveState();
    for(const k of ['px','py','pa','ox','oy'])assert.deepEqual(ss.arrays[k],os.arrays[k],'Mechanical overlay differs');
    assert.equal(ss.rng,os.rng);assert.deepEqual(s.check(),[]);
  }
  const restored=HalfCellRimSim.fromState(s.saveState());s.step();restored.step();physicsSteps+=2;
  assert.deepEqual(comparable(s.saveState()),comparable(restored.saveState()),'Restart differs');
  const bad=HalfCellRimSim.fromState(s.saveState());bad.rimBond[0]=0;assert(bad.check().length>0);
  return {chemistryCases,physicsSteps,checks:['end semantics','rail loss','ordinary release','supplied-fuel rearm',
    'W inert','rim labels and off control','W/W binding','no attached-cap projection','observer metadata',
    'mechanical union equivalence','research restart','rim corruption rejected']};
}
if(require.main===module){
  const file=process.argv[2];assert(file&&!fs.existsSync(file),'Unique output required');
  const r={sources:Object.fromEntries(SOURCES.map(f=>[f,hash(f)])),command:process.argv.slice(1),complete:false};
  try{r.result=tests();r.complete=true;}catch(e){r.error={message:e.message,stack:e.stack};process.exitCode=1;}
  const c=process.cpuUsage();r.cpuSeconds=(c.user+c.system)/1e6;
  fs.writeFileSync(file,JSON.stringify(r)+'\n',{flag:'wx'});console.log(JSON.stringify(r));
}
module.exports={tests,SOURCES,hash};
