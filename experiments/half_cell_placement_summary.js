#!/usr/bin/env node
'use strict';
const assert=require('assert/strict');
const {read,write}=require('./half_cell_bath'),{hash}=require('./half_cell_rim_test');
const {validateRecord}=require('./half_cell_placement');
const live=require('./half_cell_live');
const {Sim}=require('../src/sim'),{overlap}=require('./half_cell_geometry');
function detail(x){
  const s=live.LiveHalfCellSim.fromState(x.state),q=x.geometry;
  const blockers=(q.blockers||[]).map(b=>({...b,anchorNeighbor:!b.intended&&[s.bond,s.rimBond].some(table=>
    Array.from(table.subarray(q.anchor*4,q.anchor*4+4)).some(p=>p>=0&&(p>>2)===b.unit))}));
  const areas=()=>{const result={};for(const u of x.args.filter((_,i)=>i===0||i===2))for(let v=0;v<s.n;v++)if(u!==v){
    const key=[u,v].sort((a,b)=>a-b).join('/');result[key]=overlap(s._outline(u),s._outline(v,s._dx(s.px[v]-s.px[u]),s._dy(s.py[v]-s.py[u])));
  }return result;};
  const before=areas();s._slotFree=Sim.prototype._slotFree;s._buildHash();
  const accepted=Sim.prototype._formBond.call(s,...x.args);assert.equal(accepted,x.core.accepted);
  const after=areas();return {t:q.t,args:x.args,types:q.types,branch:q.branch,accepted:x.accepted,blockers,
    boundGap:q.contact.gap,coreAccepted:accepted,
    coreMaxOverlap:Math.max(...Object.values(after)),coreMaxOverlapIncrease:Math.max(0,...Object.keys(after).map(k=>after[k]-before[k]))};
}
function summarize(r){
  const a=r.record.attempts,free=a.filter(x=>!x.accepted&&x.geometry.branch==='free'),bound=a.filter(x=>!x.accepted&&x.geometry.branch==='bound');
  const details=a.map(detail);
  return {job:r.job,counts:r.record.counts,probabilityRejected:r.record.counts.geometryPass-r.record.counts.placements,
    rejectedFree:free.length,rejectedBound:bound.length,
    partnerOnly:free.filter(x=>x.geometry.blockers.every(b=>b.intended)).length,
    partnerAndOther:free.filter(x=>x.geometry.blockers.some(b=>b.intended)&&x.geometry.blockers.some(b=>!b.intended)).length,
    otherOnly:free.filter(x=>x.geometry.blockers.every(b=>!b.intended)).length,
    blockerTypes:free.reduce((d,x)=>{for(const b of x.geometry.blockers)d[b.type]=(d[b.type]||0)+1;return d;},{}),
    coreAcceptsRejected:a.filter(x=>!x.accepted&&x.core.accepted).length,
    areaRange:free.length?[Math.min(...free.flatMap(x=>x.geometry.blockers.map(b=>b.area))),Math.max(...free.flatMap(x=>x.geometry.blockers.map(b=>b.area)))]:null,
    depthRange:free.length?[Math.min(...free.flatMap(x=>x.geometry.blockers.map(b=>b.depth))),Math.max(...free.flatMap(x=>x.geometry.blockers.map(b=>b.depth)))]:null,
    boundGaps:bound.map(x=>x.geometry.contact.gap),strata:r.record.strata,details};
}
function main(out,preflight,...files){
  const p=read(preflight);assert(p.complete&&p.neutral&&p.restart);
  for(const [file,h]of Object.entries(p.sources))assert.equal(hash(file),h,file);
  const records=files.map(read),r={command:process.argv.slice(1),complete:false,steps:0,inputs:[preflight,...files].map(path=>({path,sha256:hash(path)})),
    sources:Object.fromEntries(['experiments/half_cell_placement.js','experiments/half_cell_placement_plan.md','experiments/half_cell_placement_summary.js'].map(p=>[p,hash(p)])),rows:[],corruptions:[]};
  assert.deepEqual(records.map(x=>[x.job.seed,x.job.on]),[[809,true],[809,false],[811,true],[811,false]]);
  for(const x of records){assert(x.complete&&!x.censored&&x.neutral);for(const [p,h]of Object.entries(x.sources))assert.equal(hash(p),h,p);assert.equal(x.steps,50000);assert.equal(x.checkpoints,11);validateRecord(x.record);r.rows.push(summarize(x));}
  const attempts=records.flatMap(x=>x.record.attempts);assert.equal(attempts.length,44);assert.equal(attempts.filter(x=>!x.accepted).length,39);
  for(const kind of ['pose','outcome','aggregate']){
    const bad=structuredClone(records[0].record);
    if(kind==='pose'){
      const a=bad.attempts[0],buffer=Buffer.from(a.state.arrays.px.b,'base64'),offset=a.args[0]*8;
      buffer.writeDoubleLE(buffer.readDoubleLE(offset)+.25,offset);a.state.arrays.px.b=buffer.toString('base64');
    }
    if(kind==='outcome')bad.attempts[0].accepted=!bad.attempts[0].accepted;
    if(kind==='aggregate')bad.counts.sideTests++;
    assert.throws(()=>validateRecord(bad));r.corruptions.push(kind);
  }
  r.complete=true;write(out,r);write(out+'.cpu.json',{cpuSeconds:Object.values(process.cpuUsage()).reduce((a,b)=>a+b,0)/1e6,steps:0,complete:true});
  console.log(JSON.stringify(r.rows.map(({strata,details,...x})=>x),null,2));
}
if(require.main===module)main(...process.argv.slice(2));
module.exports={summarize};
