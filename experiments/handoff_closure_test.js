#!/usr/bin/env node
'use strict';
const fs=require('fs'),assert=require('assert/strict');
const {Sim}=require('../src/sim'),api=require('./contact_handoff'),runner=require('./handoff_closure');
const p=JSON.parse(fs.readFileSync(runner.INPUT)).prepared;
for(const arm of runner.ARMS){
  const observed=runner.install(Sim.fromState(p.state),arm),plain=runner.install(Sim.fromState(p.state),arm);
  runner.observe(observed);observed.run(100);plain.run(100);assert.deepEqual(api.save(observed),api.save(plain));
}
// Calibrate the physical-phase observer against the archived positive square handoff.
const square=JSON.parse(fs.readFileSync('experiments/out/CH_selected.json')).prepared.find(x=>x.profile==='square');
const s=runner.install(Sim.fromState(square.state),'hold'),o=runner.observe(s);s.run(8);
assert(o.supportPhases.length>0);assert(o.supportPhases.every(p=>p.contacts.every(c=>c.afterFace===c.face&&Number.isFinite(c.afterGap))));
assert(o.events.some(e=>e.kind==='state'&&e.after===api.LATCH));
console.log('PASS: five-arm short observer neutrality and actual supporting-contact physics observer calibration');
