#!/usr/bin/env node
'use strict';
const assert=require('assert/strict');
const {load}=require('./port_acquisition'),{validate}=require('./port_acquisition_summary');
const {digest}=require('./resource_ports');
const r=load(process.argv[2]);validate(r);
function reject(change){const c=JSON.parse(JSON.stringify(r));change(c);assert.throws(()=>validate(c,{replay:false}));}
reject(c=>c.provenance.sources={});reject(c=>c.viability.pop());
reject(c=>c.viability[0].observer.incoming=999);reject(c=>c.viability[0].finalHash='changed');
reject(c=>c.viability[0].rows[0].targetCount=2);reject(c=>c.summary.acquisitionPass=!c.summary.acquisitionPass);
reject(c=>{c.viability[0].final.acquisition.trace[0].r=999;c.viability[0].finalHash=digest(c.viability[0].final);});
console.log('PASS: complete trajectory replay, independent bond-event reconstruction; corrupted sources, coverage, observer IDs, states, metrics, events and gate summaries rejected');
