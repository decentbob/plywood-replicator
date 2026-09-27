#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),zlib=require('zlib'),crypto=require('crypto'),assert=require('assert/strict');
const {Sim,T_A,T_C,T_E,T_P,T_Q,F}=require('../src/sim');
const base=require('./half_cell_geometry');
const {PolygonContactSim,separation}=require('./polygon_contact_physics');
const INPUT='experiments/out/HC_geometry_20260927_v2.json';
const SOURCES=['src/sim.js','experiments/half_cell_geometry.js','experiments/half_cell_geometry_plan.md',
  'experiments/resource_ports.js','experiments/resource_economy.js','experiments/polygon_contact_physics.js',
  'experiments/half_cell_contact.js','experiments/half_cell_contact_plan.md'];
const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const cpu=()=>{const c=process.cpuUsage();return (c.user+c.system)/1e6;};
const counts={observed:0,plain:0,restart:0,replay:0};
class HalfCellContactSim extends base.HalfCellGeometrySim {
  _physics(){
    assert(!this.p.maxStrain&&!this.p.snapCorners&&!this.p.nG,'Unsupported physics options');
    return PolygonContactSim.prototype._physics.call(this);
  }
  _polygonContacts(){
    const contacts=[];
    for(let u=0;u<this.n;u++){
      assert([T_A,T_C,T_E,T_P,T_Q].includes(this.type[u]),'Unsupported fixture type');
      for(let v=u+1;v<this.n;v++){
        if(this.bond.subarray(u*4,u*4+4).some(q=>q>=0&&(q>>2)===v))continue;
        contacts.push(u,v);
      }
    }
    return contacts;
  }
}
for(const name of ['_radius','_outline','_candidate','_shapePairs','_separatePair'])
  HalfCellContactSim.prototype[name]=PolygonContactSim.prototype[name];
const Class=arm=>arm==='core'?base.HalfCellGeometrySim:HalfCellContactSim;
const advance=(s,kind)=>{s._physics();s.t++;counts[kind]++;};
function release(s,ids){for(const u of [ids.caps[0],ids.letters[0]])s._unlink(u,F);s._computeOpen();}
function metrics(f,m,ids){
  const q=base.measure(f,m,ids);let bondedOverlap=0;
  for(const [a,b] of f.bonds){const u=a>>2,v=b>>2,dx=f.centers[v][0]-f.centers[u][0],dy=f.centers[v][1]-f.centers[u][1];
    const ps=f.polygons[v].map(p=>[p[0]-m.W*Math.round(dx/m.W),p[1]-m.H*Math.round(dy/m.H)]);
    bondedOverlap=Math.max(bondedOverlap,base.overlap(f.polygons[u],ps));}
  return {...q,bondedOverlap};
}
function invariant(s,c){
  assert.deepEqual(s.check(),[]);assert.equal(s.n,8);
  const st=s.saveState();for(const k of ['type','nv','rx','ry','edgeOf','size','w','wr'])assert.deepEqual(st.arrays[k],c.initial.arrays[k],k);
  for(const k of ['px','py','pa','ox','oy'])assert(s[k].every(Number.isFinite),k);
  const b=base.HalfCellGeometrySim.fromState(c.initial).bond;
  for(let a=0;a<b.length;a++){
    const cut=s.t>100&&(a%4===F)&&[...c.ids.caps,...c.ids.letters].includes(a>>2);
    assert.equal(s.bond[a],cut?-1:b[a]);
  }
}
function run(c,arm,retain,kind='observed'){
  const C=Class(arm),s=C.fromState(c.initial),plain=C.fromState(c.initial);
  const r={job:{...c.job,contact:arm},ids:c.ids,metadata:c.metadata,initial:s.saveState(),samples:[],neutral:false,restart:false};
  retain(r);let resumed;
  for(let t=0;t<=200;t++){
    if(t===101){release(s,c.ids);release(resumed,c.ids);}
    if(t){advance(s,kind);if(t>100)advance(resumed,'restart');}
    const f=base.frame(s);r.samples.push({frame:f,metrics:metrics(f,c.metadata,c.ids)});
    if(arm==='core')assert.deepEqual(f,c.samples[t].frame,'Archived core trajectory differs');
    if(t<=5){invariant(s,c);assert(r.samples.at(-1).metrics.maxPin<=1,'Viability pin residual');}
    if(t===100){r.midpoint=s.saveState();resumed=C.fromState(r.midpoint);}
  }
  for(let t=1;t<=200;t++){if(t===101)release(plain,c.ids);advance(plain,'plain');}
  invariant(s,c);r.final=s.saveState();
  assert.deepEqual(base.comparable(r.final),base.comparable(plain.saveState()),'Observer changed physical state/RNG');
  assert.deepEqual(base.comparable(r.final),base.comparable(resumed.saveState()),'Subclass restart differs');
  r.neutral=true;r.restart=true;return r;
}
function good(q){return q.maxPin<=.1&&q.maxOverlap<=.02&&q.copying.every(x=>x.eligible)&&q.fuel.every(x=>x.maxOverlap<=.02);}
function summarize(r){
  const rows=r.records.map(c=>{
    const held=c.samples.filter(x=>x.frame.t>=76&&x.frame.t<=100),released=c.samples.filter(x=>x.frame.t>100);
    return {...c.job,heldGood:held.filter(x=>good(x.metrics)).length,
      releasedPinGood:released.filter(x=>x.metrics.maxPin<=.1).length,
      overlapFailures:released.filter(x=>x.metrics.crossOverlap>.02).length,
      firstClear:released.find(x=>x.metrics.minCrossGap>=.1)?.frame.t??null,
      maxCrossOverlap:Math.max(...released.map(x=>x.metrics.crossOverlap)),
      maxAllOverlap:Math.max(...released.map(x=>x.metrics.maxOverlap)),
      maxBondedOverlap:Math.max(...released.map(x=>x.metrics.bondedOverlap)),
      maxPin:Math.max(...released.map(x=>x.metrics.maxPin))};
  });
  const poly=rows.filter(x=>x.contact==='polygon'),groups=[];
  const pass=x=>x.heldGood>=24&&x.overlapFailures===0&&x.releasedPinGood>=99&&x.firstClear!==null;
  for(const contact of ['core','polygon'])for(const mode of ['body4','individual16'])for(const arm of ['attached','unbound']){
    const cs=rows.filter(x=>x.contact===contact&&x.mode===mode&&x.arm===arm);
    groups.push({contact,mode,arm,n:cs.length,pass:cs.filter(pass).length,heldPass:cs.filter(x=>x.heldGood>=24).length,
      clear:cs.filter(x=>x.firstClear!==null).length,overlapFailures:cs.reduce((a,x)=>a+x.overlapFailures,0),
      releasedPinGood:cs.reduce((a,x)=>a+x.releasedPinGood,0),
      maxCrossOverlap:Math.max(...cs.map(x=>x.maxCrossOverlap)),maxAllOverlap:Math.max(...cs.map(x=>x.maxAllOverlap)),
      maxBondedOverlap:Math.max(...cs.map(x=>x.maxBondedOverlap)),maxPin:Math.max(...cs.map(x=>x.maxPin))});
  }
  return {pass:poly.length===16&&poly.every(pass),rows,groups};
}
function selfCheck(){
  const a=[[0,0],[1,0],[1,1],[0,1]],b=a.map(([x,y])=>[x+.5,y]);
  assert(Math.abs(separation(a,b).depth-.5)<1e-12);
  assert.equal(separation(a,a.map(([x,y])=>[x+1,y])),null);
  assert(Math.abs(separation(a,[[.2,.2],[.8,.2],[.8,.8],[.2,.8]]).depth-.8)<1e-12);
  const original=base.setup(base.jobs()[0]).s,s=HalfCellContactSim.fromState(original.saveState());
  const aa=[...s.type].flatMap((t,u)=>t===T_A?[u]:[]),[u,v]=aa;
  for(const x of aa){s.pa[x]=0;s._resetShape(x);s.py[x]=12;}
  s.px[u]=23.8;s.px[v]=.3;s.w[u]=1;s.w[v]=.5;s._separatePair(u,v);
  assert(Math.abs(s._dx(s.px[v]-s.px[u])-1)<1e-10);
  assert(Math.abs(s.px[u]-(23.8-1/3))<1e-10);
  assert.throws(()=>s.step(),/forbidden/);assert.throws(()=>s._chemistry(),/forbidden/);
  s.type[u]=255;assert.throws(()=>s._polygonContacts(),/Unsupported fixture type/);
  const old=Sim.prototype._physics.toString().replace(/\r\n/g,'\n'),now=PolygonContactSim.prototype._physics.toString().replace(/\r\n/g,'\n');
  const span=(s,a,b)=>{const i=s.indexOf(a),j=s.indexOf(b,i);assert(i>=0&&j>i);return s.slice(i,j);};
  assert.equal(span(old,'    const p =','    // 2. one neighbour scan:'),span(now,'    const p =','    // Research replacement:'));
  assert.equal(span(old,'    // 3. constraints','      for (let k = 0; k < contacts.length;'),span(now,'    // 3. constraints','      for (let k=0;k<contacts.length;'));
  assert.equal(span(old,'      for (let k = 0; k < pins.length; k += 2)','    this._buildHash();   // for the empty-slot'),
    span(now,'      for (let k = 0; k < pins.length; k += 2)','    this._buildHash();   // retained core cache'));
}
function input(){
  const r=JSON.parse(fs.readFileSync(INPUT));assert(r.complete);
  for(const [f,h] of Object.entries(r.sources))assert.equal(hash(f),h,f);
  return r.records.filter(x=>x.job.mode!=='individual4');
}
function validateRecord(r,c,replay=true){
  assert.deepEqual(r.job,{...c.job,contact:r.job.contact});assert(['core','polygon'].includes(r.job.contact));
  assert.deepEqual(r.ids,c.ids);assert.deepEqual(r.metadata,c.metadata);assert(r.neutral&&r.restart);
  assert.equal(r.samples.length,201);assert.deepEqual(base.comparable(r.initial),base.comparable(c.initial));
  const s=Class(r.job.contact).fromState(r.initial);
  for(let t=0;t<=200;t++){
    const q=r.samples[t];assert.equal(q.frame.t,t);assert.deepEqual(metrics(q.frame,r.metadata,r.ids),q.metrics,'Metric mismatch');
    if(replay){if(t===101)release(s,r.ids);if(t)advance(s,'replay');assert.deepEqual(base.frame(s),q.frame,'Replay frame mismatch');
      if(r.job.contact==='core')assert.deepEqual(q.frame,c.samples[t].frame);
      if(t===100)assert.deepEqual(base.comparable(s.saveState()),base.comparable(r.midpoint));}
  }
  if(replay){invariant(s,c);assert.deepEqual(base.comparable(s.saveState()),base.comparable(r.final));}
}
function main(){
  const validating=process.argv[2]==='--validate',file=process.argv[validating?3:2];assert(file,'Supply unique .json.gz path');
  const target=validating?file+'.validation.json':file;assert(!fs.existsSync(target),'Refusing overwrite');
  assert(!fs.existsSync(target+'.cpu.json'),'CPU artifact exists');
  const r={kind:'half-cell-contact',created:new Date().toISOString(),command:process.argv.slice(1),input:INPUT,inputHash:hash(INPUT),
    sources:Object.fromEntries(SOURCES.map(f=>[f,hash(f)])),records:[],complete:false};
  let error;
  try{
    selfCheck();const cs=input();assert.equal(cs.length,16);
    if(validating){
      const raw=JSON.parse(zlib.gunzipSync(fs.readFileSync(file)));assert(raw.complete);assert.equal(raw.input,INPUT);assert.equal(raw.inputHash,hash(INPUT));
      assert.deepEqual(raw.sources,r.sources);assert.equal(raw.records.length,32);
      let i=0;for(const c of cs)for(const arm of ['core','polygon']){const rec=raw.records[i++];assert.equal(rec.job.contact,arm);validateRecord(rec,c);assert(cpu()<60,'Validation CPU ceiling');}
      assert.deepEqual(raw.summary,summarize(raw));
      const bad=structuredClone(raw.records[0]);bad.samples[1].frame.polygons[0][0][0]+=.2;assert.throws(()=>validateRecord(bad,cs[0],false),/Metric mismatch/);
      const wrong=structuredClone(raw.summary);wrong.pass=!wrong.pass;assert.throws(()=>assert.deepEqual(wrong,summarize(raw)));
      const label=structuredClone(raw.records[0]);label.job.seed++;assert.throws(()=>validateRecord(label,cs[0],false));
      Object.assign(r,{valid:true,rawHash:hash(file),worlds:32,frames:6432,corruptionsRejected:3,summary:raw.summary});
    }else{
      for(const c of cs)for(const arm of ['core','polygon']){run(c,arm,x=>r.records.push(x));assert(cpu()<60,'Execution CPU ceiling');}
      r.summary=summarize(r);
    }
    r.complete=true;
  }catch(e){error=e;r.error={message:e.message,stack:e.stack};}
  fs.mkdirSync(path.dirname(target),{recursive:true});
  const bytes=Buffer.from(JSON.stringify(r)+'\n');fs.writeFileSync(target,validating?bytes:zlib.gzipSync(bytes),{flag:'wx'});
  const cost={cpuSeconds:cpu(),counts,complete:r.complete};fs.writeFileSync(target+'.cpu.json',JSON.stringify(cost)+'\n',{flag:'wx'});
  console.log(JSON.stringify({complete:r.complete,cost,pass:r.summary?.pass,groups:r.summary?.groups,error:r.error}));if(error)throw error;
}
if(require.main===module)main();
module.exports={HalfCellContactSim,metrics,summarize,validateRecord,selfCheck};
