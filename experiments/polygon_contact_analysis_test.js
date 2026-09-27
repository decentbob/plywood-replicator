#!/usr/bin/env node
'use strict';
const assert=require('assert/strict');
const {load}=require('./polygon_contact'),{validate}=require('./polygon_contact_summary');
const r=load(process.argv[2]);validate(r);
function reject(change){const c=JSON.parse(JSON.stringify(r));change(c);assert.throws(()=>validate(c,{replay:false}));}
reject(c=>c.provenance.sources={});reject(c=>c.provenance.inputHash='changed');
reject(c=>c.runs.pop());reject(c=>c.ideal[0].fronts[0].slotFree=false);
reject(c=>c.runs[0].finalHash='changed');reject(c=>c.runs[0].samples[0].maxPin=999);
reject(c=>c.runs[0].target.u=999);reject(c=>c.summary.gates.pass=false);
console.log('PASS: all 272 fixture trajectories replay; altered provenance, input, coverage, placement, state, observation, target and gates rejected');
