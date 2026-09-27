#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const base=require('./resource_ports');
const {AcquisitionSim,SOURCES,configs,fixture,metrics,outcome,runCase,summarize,load}=require('./port_acquisition');
const norm=x=>JSON.parse(JSON.stringify(x));
// Core restore rebuilds these derived caches. Acquisition reads bonds directly,
// not open; neither cache is an input to this subclass's physical trajectory.
function physicalState(st){const s=norm(st);delete s.nums.pinsVersion;delete s.arrays.open;return s;}
function validate(r,{replay=true}={}){
  assert.equal(r.schema,1);assert.deepEqual(Object.keys(r.provenance.sources).sort(),[...SOURCES].sort());
  for(const [f,h]of Object.entries(r.provenance.sources)){
    const b=fs.readFileSync(path.join(__dirname,'..',f)),lf=b.toString().replace(/\r\n/g,'\n');
    assert([base.hash(b),base.hash(lf),base.hash(lf.replace(/\n/g,'\r\n'))].includes(h),'Source changed: '+f);
  }
  assert.deepEqual(r.viability.map(c=>c.config),configs(true));
  const viable=r.viability.every(c=>c.config.enabled?c.rows.at(-1).targetCount===2:c.initial.arrays.bond.b===c.final.arrays.bond.b);
  assert.deepEqual(r.runs.map(c=>c.config),viable?configs():[]);
  assert.equal(r.provenance.physicsSteps,r.viability.length*20+r.runs.length*500);
  for(const c of [...r.viability,...r.runs]){
    assert.equal(c.initialHash,base.digest(c.initial));assert.equal(c.finalHash,base.digest(c.final));
    const prepared=fixture(c.config);assert.deepEqual(c.observer,prepared.observer);assert.deepEqual(c.initial,norm(prepared.s.saveState()));
    assert.deepEqual(c.initial.p,c.final.p);assert.equal(c.initial.nums.n,c.final.nums.n);assert.equal(c.final.nums.birthCount,0);
    for(const k of ['type','w','wr','size','nv','rx','ry','edgeOf'])assert.deepEqual(c.initial.arrays[k],c.final.arrays[k]);
    const horizon=c.config.viability?20:500;assert.equal(c.rows.length,horizon+1);assert.equal(c.final.nums.t,horizon);
    for(let t=0;t<c.rows.length;t++){assert.equal(c.rows[t].t,t);assert(c.rows[t].targetCount>=0&&c.rows[t].targetCount<=2);}
    assert.deepEqual(c.outcome,outcome(c.rows));
    const before=AcquisitionSim.fromState(c.initial),after=AcquisitionSim.fromState(c.final);
    assert.deepEqual(before.check(),[]);assert.deepEqual(after.check(),[]);
    assert.deepEqual(c.rows[0],metrics(before,c.observer));assert.deepEqual(c.rows.at(-1),metrics(after,c.observer));
    // Independent event reconstruction validates bond outputs without consulting targets in dynamics.
    const bonds=Array.from(before.bond),events=c.final.acquisition.trace;
    let last=0;
    for(const e of events){assert(e.t>=last&&e.t>=1&&e.t<=horizon);last=e.t;
      assert(e.q>=0&&e.r>=0&&e.q<bonds.length&&e.r<bonds.length&&(e.q>>2)!==(e.r>>2));
      if(e.kind==='bind'){
        assert(c.config.enabled);assert.equal(bonds[e.q],-1);assert.equal(bonds[e.r],-1);
        assert(base.mates(before.portLabels[e.q],before.portLabels[e.r]));bonds[e.q]=e.r;bonds[e.r]=e.q;
      }else{assert.equal(e.kind,'loss');assert.equal(bonds[e.q],e.r);assert.equal(bonds[e.r],e.q);bonds[e.q]=-1;bonds[e.r]=-1;}
    }
    assert.deepEqual(bonds,Array.from(after.bond));
    assert.deepEqual(c.snapshots.map(x=>x.t),c.config.viability?[0,1,10,20]:[0,1,10,100,500]);
    for(const x of c.snapshots){assert.equal(x.state.nums.t,x.t);const s=AcquisitionSim.fromState(x.state);assert.deepEqual(metrics(s,c.observer),c.rows[x.t]);}
    if(replay){
      assert.deepEqual(norm(runCase(c.config)),c,'Full trajectory replay differs');
      const middle=c.snapshots.find(x=>x.t===(c.config.viability?10:100)),resumed=AcquisitionSim.fromState(middle.state);
      while(resumed.t<horizon)resumed.step();
      assert.deepEqual(physicalState(resumed.saveState()),physicalState(c.final),'Checkpoint physical arrays, labels, events or RNG differ');
    }
  }
  assert.deepEqual(r.summary,norm(summarize(r)));return r.summary;
}
if(require.main===module){const r=load(process.argv[2]),s=validate(r);console.log(JSON.stringify({viabilityPass:s.viabilityPass,controlPass:s.controlPass,acquisitionPass:s.acquisitionPass,cpuSeconds:r.provenance.cpuSeconds}));console.table(s.groups.filter(g=>g.enabled));}
module.exports={validate};
