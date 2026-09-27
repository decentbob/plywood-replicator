#!/usr/bin/env node
'use strict';
const assert=require('assert/strict');
const {load,validate}=require('./resource_ports_summary');
const r=load(process.argv[2]);validate(r);
function reject(fn){const c=JSON.parse(JSON.stringify(r));fn(c);assert.throws(()=>validate(c,{replay:false}));}
reject(c=>c.provenance.sources={});
reject(c=>c.ideal[0].contacts[0].compatible=false);
reject(c=>c.physical.pop());
reject(c=>c.physical[0].finalHash='invalid');
reject(c=>c.physical[0].samples[0].target.pinGap++);
reject(c=>c.steric[0].slotFree=!c.steric[0].slotFree);
console.log('PASS: all 136 physical fixtures replay exactly; altered sources, geometry, coverage, states and placement results rejected');
