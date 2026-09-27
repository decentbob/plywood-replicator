#!/usr/bin/env node
const assert=require('assert/strict');
const {validate,decision,load}=require('./sequence_shape_summary.js');
const {m,rs}=load(process.argv[2]);
validate(m,rs);
const clone=x=>JSON.parse(JSON.stringify(x));
function reject(change){const mm=clone(m),rr=clone(rs);change(mm,rr);assert.throws(()=>validate(mm,rr));}
reject(mm=>mm.complete=false);
reject(mm=>mm.sources={});
reject((mm,rr)=>rr.pop());
reject((mm,rr)=>rr[0].params.pFray=0);
reject((mm,rr)=>rr[0].metrics.primary++);
reject((mm,rr)=>rr[0].samples[0].material.free++);
reject((mm,rr)=>rr[0].rows.find(r=>r.born>0).provenance[0].unit=-1);
reject((mm,rr)=>rr[0].events.find(e=>e.kind==='row').units[0]=-1);
reject((mm,rr)=>rr[0].rows[0].children.push(999));
const synthetic=[];
for(const seed of [1,2])for(const sequence of ['AAAABBBB','ABABABAB'])for(const profile of ['square','opposed20'])for(const grip of [true,false])
  synthetic.push({seed,sequence,profile,grip,metrics:{primary:grip&&profile==='opposed20'&&sequence==='AAAABBBB'?3:0,secondCycle:0}});
assert.deepEqual(decision(synthetic).lead,['AAAABBBB']);
synthetic.find(r=>r.seed===2&&r.sequence==='AAAABBBB'&&r.profile==='opposed20'&&r.grip).metrics.primary=1;
assert.deepEqual(decision(synthetic).lead,[],'One successful world cannot pass');
console.log('PASS: raw validation, corrupt/missing data rejection, per-world promotion gate');
