#!/usr/bin/env node
'use strict';
// Q8i observer only. All writes by diagnostic comparisons occur on disposable clones.
const fs=require('fs'),assert=require('assert/strict');
const {Sim,F,R,L,T_E,TNAME}=require('../src/sim');
const live=require('./half_cell_live'),g=require('./half_cell_geometry');
const {HalfCellRimSim,GAP}=require('./half_cell_rim');
const {PolygonContactSim,separation}=require('./polygon_contact_physics');
const {read,write}=require('./half_cell_bath'),{hash}=require('./half_cell_rim_test');
const cpu=()=>{const c=process.cpuUsage();return(c.user+c.system)/1e6;};
const own=['experiments/half_cell_placement.js','experiments/half_cell_placement_plan.md'];
const names=['candidateTests','candidatePass','tryPairs','sideTests','compatible','geometryTests','geometryPass','placements','accepted','rejected'];
const blank=()=>Object.fromEntries(names.map(k=>[k,0]));
const label=(s,u,i,v,j)=>`${TNAME[s.type[u]]}:${'FRKL'[i]}/${TNAME[s.type[v]]}:${'FRKL'[j]}`;
function diagnose(s,u,i,v,j){
  const q={t:s.t,u,i,v,j,types:[TNAME[s.type[u]],TNAME[s.type[v]]],
    free:[!s.hasMechanicalBond(u),!s.hasMechanicalBond(v)],contact:s.edgeContact(u,i,v,j)};
  if(s.type[u]===T_E||s.type[v]===T_E)return {...q,branch:'fuel',predicted:true};
  if(!q.free[0]&&!q.free[1])return {...q,branch:'bound',limit:GAP,predicted:q.contact.gap<=GAP};
  const [a,ia,m,im]=q.free[1]?[u,i,v,j]:[v,j,u,i];
  const sa=s._side(a,ia,[0,0,0,0]),sm=s._side(m,im,[0,0,0,0]);
  const rot=Math.atan2(-sa[3],-sa[2])-Math.atan2(sm[3],sm[2]),c=Math.cos(rot),sn=Math.sin(rot);
  const tx=s._wx(s.px[a]+sa[0]-(c*sm[0]-sn*sm[1])),ty=s._wy(s.py[a]+sa[1]-(sn*sm[0]+c*sm[1]));
  const projected=s._outline(m,0,0,rot),blockers=[];let intended;
  for(let b=0;b<s.n;b++)if(b!==m){
    const polygon=s._outline(b,s._dx(s.px[b]-tx),s._dy(s.py[b]-ty));
    const sat=separation(projected,polygon),area=g.overlap(projected,polygon);
    const row={unit:b,type:TNAME[s.type[b]],intended:b===a,depth:sat?.depth||0,area,polygon};
    if(b===a)intended=row;
    if(sat)blockers.push(row);
  }
  const slotFree=PolygonContactSim.prototype._slotFree.call(s,m,tx,ty,rot);
  assert.equal(slotFree,blockers.length===0,'all-pair diagnostic disagrees with runtime vacancy');
  return {...q,branch:'free',anchor:a,moving:m,pose:{tx,ty,rot},projected,intended,blockers,
    firstBlocker:blockers[0]?.unit??null,predicted:slotFree};
}
function coreCompare(state,args,Class=live.LiveHalfCellSim){
  const s=Class.fromState(state);s._slotFree=Sim.prototype._slotFree;s._buildHash();
  const accepted=Sim.prototype._formBond.call(s,...args);
  return {accepted}; // Old center vacancy/placement is an algorithm comparator only.
}
function instrument(s){
  const record={counts:blank(),strata:{},attempts:[],events:[]};let binding=false,inTry=false;
  const wrap=(name,fn)=>{const original=s[name];s[name]=function(...args){return fn.call(this,original,args);};};
  const inc=(key,stratum)=>{record.counts[key]++;if(stratum)(record.strata[stratum]??=blank())[key]++;};
  wrap('_formBonds',function(f,args){binding=true;try{return f.apply(this,args);}finally{binding=false;}});
  wrap('_formRimBonds',function(f,args){binding=false;return f.apply(this,args);});
  wrap('_candidate',function(f,args){const ok=f.apply(this,args);if(binding){inc('candidateTests');if(ok)inc('candidatePass');}return ok;});
  wrap('_tryBond',function(f,args){inc('tryPairs');inTry=true;try{return f.apply(this,args);}finally{inTry=false;}});
  wrap('compat',function(f,args){const pr=f.apply(this,args);if(inTry){const k=label(this,...args);inc('sideTests',k);if(pr>0)inc('compatible',k);}return pr;});
  wrap('_geomOK',function(f,args){const ok=f.apply(this,args);if(inTry){const k=label(this,...args);inc('geometryTests',k);if(ok)inc('geometryPass',k);}return ok;});
  wrap('_formBond',function(f,args){
    const k=label(this,...args);inc('placements',k);
    const state=this.saveState(),geometry=diagnose(this,...args),core=coreCompare(state,args);
    const accepted=f.apply(this,args);assert.equal(accepted,geometry.predicted);
    inc(accepted?'accepted':'rejected',k);
    record.attempts.push({args,state,geometry,core,accepted});return accepted;
  });
  for(const [name,op]of [['_link','add'],['_unlink','remove'],['_linkRim','rim']])wrap(name,function(f,args){
    const [u,i,v,j]=args,a=u*4+i,b=op==='remove'?this.bond[a]:v*4+j;
    const result=f.apply(this,args);if(b>=0)record.events.push({t:this.t,op,a,b});return result;
  });
  return record;
}
function validateRecord(record){
  const c=record.counts,a=record.attempts;
  assert.equal(c.placements,a.length);assert.equal(c.accepted,a.filter(x=>x.accepted).length);
  assert.equal(c.rejected,a.filter(x=>!x.accepted).length);
  assert.equal(c.compatible,c.geometryTests);assert(c.geometryPass>=c.placements);
  assert(c.candidatePass>=c.tryPairs);assert(c.sideTests>=c.compatible);
  for(const k of names.slice(3))assert.equal(c[k],Object.values(record.strata).reduce((n,s)=>n+s[k],0));
  for(const x of a){
    const s=live.LiveHalfCellSim.fromState(x.state);
    assert.deepEqual(diagnose(s,...x.args),x.geometry);
    assert.deepEqual(coreCompare(x.state,x.args),x.core);
    assert.equal(s._formBond(...x.args),x.accepted);
  }
  return a.length;
}
function squareControls(){
  const rows=[];
  for(const kind of ['face','lateral']){
    const s=new Sim({seed:1,W:24,H:24,nA:4,nB:0,nE:0,seedCount:0,sigma:0,sigmaRot:0});
    const row=s.seedStrand(12,12,0,2,'AA'),other=[0,1,2,3].filter(u=>!row.includes(u));
    let args;
    if(kind==='face'){
      const m=other[0],a=row[0],side=s._side(a,F,[0,0,0,0]);
      s.pa[m]=Math.PI;s._resetShape(m);const sm=s._side(m,F,[0,0,0,0]);
      s.px[m]=s.px[a]+side[0]-sm[0];s.py[m]=s.py[a]+side[1]-sm[1];
      s.px[other[1]]=3;s.py[other[1]]=3;args=[a,F,m,F];
    }else{
      s._unlink(row[0],R);for(let k=0;k<other.length;k++){s.px[other[k]]=3+k*3;s.py[other[k]]=3;}
      args=[row[0],R,row[1],L];
    }
    s._buildHash();const initial=s.saveState();
    const original=Sim.fromState(initial);original._buildHash();const coreAccepted=original._formBond(...args);
    const research=Sim.fromState(initial);research.rimBond=new Int32Array(s.n*4).fill(-1);
    for(const name of ['hasMechanicalBond','edgeContact'])research[name]=HalfCellRimSim.prototype[name];
    for(const name of ['_outline','_radius'])research[name]=PolygonContactSim.prototype[name];
    const geometry=diagnose(research,...args),accepted=HalfCellRimSim.prototype._formBond.call(research,...args);
    assert(coreAccepted&&accepted);rows.push({kind,initial,args,coreAccepted,accepted,geometry});
  }
  return rows;
}
function preflight(out){
  const r={command:process.argv.slice(1),complete:false,steps:0,sources:Object.fromEntries(own.map(p=>[p,hash(p)]))};
  try{
    const w=live.createWorld({seed:809,start:'bath'}),initial=w.s.saveState(),plain=live.LiveHalfCellSim.fromState(initial);
    const record=instrument(w.s);let resumed;
    for(let t=1;t<=100;t++){w.s.step();plain.step();r.steps+=2;if(t>50){resumed.step();r.steps++;}if(t===50)resumed=live.LiveHalfCellSim.fromState(w.s.saveState());}
    live.invariant(w.s,initial);assert.deepEqual(g.comparable(w.s.saveState()),g.comparable(plain.saveState()));
    assert.deepEqual(g.comparable(w.s.saveState()),g.comparable(resumed.saveState()));validateRecord(record);
    r.neutral=r.restart=true;r.short=record;r.squares=squareControls();
    const prepared=live.createWorld({start:'contacts'}).s;
    Object.assign(prepared.p,{sigma:0,sigmaRot:0,pMem:1,pMelt:0,pMeltRun:0,pMeltEnd:0});
    const before=prepared.saveState(),preparedPlain=live.LiveHalfCellSim.fromState(before),mon=instrument(prepared);
    for(let t=0;t<12;t++){prepared.step();preparedPlain.step();r.steps+=2;}
    assert.deepEqual(g.comparable(prepared.saveState()),g.comparable(preparedPlain.saveState()));
    live.invariant(prepared,before);assert.equal(live.observe(prepared).closedCount,2);
    validateRecord(mon);r.prepared={initial:before,record:mon,final:prepared.saveState(),observation:live.observe(prepared)};
    r.complete=true;
  }catch(e){r.error={message:e.message,stack:e.stack};process.exitCode=1;}
  write(out,r);write(out+'.cpu.json',{cpuSeconds:cpu(),steps:r.steps,complete:r.complete});
  console.log(JSON.stringify({complete:r.complete,steps:r.steps,cpu:cpu(),error:r.error}));
}
function replay(input,out){
  const raw=read(input),r={command:process.argv.slice(1),input,inputHash:hash(input),job:raw.job,
    sources:{...raw.sources,...Object.fromEntries(own.map(p=>[p,hash(p)]))},complete:false,censored:false,steps:0,checkpoints:0};
  try{
    for(const [p,h]of Object.entries(r.sources))assert.equal(hash(p),h,p);
    const s=live.LiveHalfCellSim.fromState(raw.initial);r.record=instrument(s);
    for(let t=1;t<=raw.job.horizon;t++){
      s.step();r.steps++;if(t<=5||t%5000===0)live.invariant(s,raw.initial);
      const checkpoint=(t%5000===0||t===26000)?raw.checkpoints.find(c=>c.t===t):null;
      if(checkpoint){assert.deepEqual(g.comparable(s.saveState()),g.comparable(checkpoint.state));r.checkpoints++;}
      if(t%5000===0)console.log(JSON.stringify({job:r.job,t,cpu:cpu(),placements:r.record.counts.placements,rejected:r.record.counts.rejected}));
      if(t%100===0&&cpu()>650){r.censored=true;break;}
    }
    r.final=s.saveState();
    if(!r.censored){
      assert.deepEqual(g.comparable(r.final),g.comparable(raw.final));assert.deepEqual(r.record.events,raw.monitor.events);
      assert.equal(r.record.counts.placements,raw.monitor.counts.ordinaryPlacementAttempts);
      assert.equal(r.record.counts.rejected,raw.monitor.counts.ordinaryPlacementRejected);
      r.validatedAttempts=validateRecord(r.record);r.complete=true;r.neutral=true;
    }
  }catch(e){r.error={message:e.message,stack:e.stack};process.exitCode=1;}
  write(out,r);write(out+'.cpu.json',{cpuSeconds:cpu(),steps:r.steps,complete:r.complete,censored:r.censored});
  console.log(JSON.stringify({complete:r.complete,censored:r.censored,counts:r.record?.counts,error:r.error,cpu:cpu()}));
}
if(require.main===module){const [a,b,c]=process.argv.slice(2);if(a==='--preflight')preflight(b);else replay(a,b);}
module.exports={diagnose,instrument,validateRecord,squareControls};
