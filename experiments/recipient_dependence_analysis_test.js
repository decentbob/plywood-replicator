#!/usr/bin/env node
const assert=require('assert/strict');
const {Sim}=require('../src/sim.js');
const {base,physicalHash,sample}=require('./recipient_dependence.js');
const {validate,summarize}=require('./recipient_dependence_summary.js');
const s=new Sim({...base,seed:103}),initialHash=physicalHash(s),samples=[];
// Synthetic stationary material fixture: validates accounting, not a trajectory result.
for(s.t=100;s.t<=1000;s.t+=100)samples.push(sample(s));s.t=1000;
const r={arm:'on',seed:103,steps:1000,params:s.p,initialHash,samples,births:[],members:[],finalState:s.saveState()};
const m={complete:true,completed:1,jobs:[{arm:'on',seed:103,steps:1000}],sources:{}};
validate(m,[r],false);
assert.equal(summarize(r,0).recipient,0,'zero outcomes retained');
function reject(change){const a=structuredClone(m),b=[structuredClone(r)];change(a,b);assert.throws(()=>validate(a,b,false));}
reject(m=>m.complete=false);reject((m,r)=>r.push(r[0]));reject((m,r)=>r[0].samples.pop());
reject((m,r)=>r[0].samples[1].t=100);reject((m,r)=>r[0].params.pSoft=0.3);
reject((m,r)=>r[0].samples[0].recipientBound=1000);reject((m,r)=>r[0].samples[0].material.letters.free++);
reject((m,r)=>r[0].births.push({t:200,seq:'BC',parent:'CB'}));reject((m,r)=>r[0].initialHash='different');
const raw={...r,steps:10000,births:[
  {t:100,seq:'CB',parent:'BC',gen:2},{t:200,seq:'BAAB',parent:'BAAB',gen:2},
  {t:300,seq:'CA',parent:'BC',gen:1},{t:400,seq:'BCC',parent:'BC',gen:1},
  {t:500,seq:'BC',parent:'',gen:1},{t:600,seq:'11',parent:'BAAB',prod:1}],
  members:[{t:100,detached:true,active:false,at5k:{intact:true,active:true}},
    {t:200,detached:true,active:false,at5k:{intact:false,active:false}},
    {t:300,detached:false,active:false,at5k:null},{t:400,detached:true,active:false,at5k:null},
    {t:500,detached:true,active:false,at5k:null}]};
const out=summarize(raw,0);
for(const [key,n]of Object.entries({producer:1,recipient:3,unknown:1,producerGen2:1,recipientGen2:1,
  exact:2,sameLengthError:1,lengthError:1,products:1,assessed5k:2,intact5k:1,active5k:1,censored5k:3,
  producerDetached:1,producerDetachedExact:1,recipientDetached:2,recipientDetachedExact:1}))assert.equal(out[key],n,key);
assert.equal(summarize(raw,200).recipient,2);assert.equal(summarize(raw,200).recipientDetached,1);
assert.throws(()=>summarize(r,1000));assert.throws(()=>summarize(r,1));
console.log('recipient dependence analysis: missing/duplicate/changed evidence rejected; counts and censoring passed');
