'use strict';
// Runtime bridge: unchanged curved geometry and rim chemistry, ordinary time steps.
const assert=require('assert/strict');
const {Sim,DEFAULTS,F,R,K,L,T_A,T_C,T_E,T_P,T_Q,I_DOCK,I_TPL,I_ON,NV}=require('../src/sim');
const {HalfCellPolymerSim}=require('./half_cell_polymer');
const {ArcSim,setup:arcSetup}=require('./half_cell_arc');
const {frame,overlap}=require('./half_cell_geometry');
const FORMAT='half-cell-live-v1';
const STARTS=['bath','contacts','paired'];
class LiveHalfCellSim extends HalfCellPolymerSim {
  _initGeometry(){return ArcSim.prototype._initGeometry.call(this);}
  step(){return Sim.prototype.step.call(this);}
}
function synchronize(s){s._deriveAll();s._deriveAll();s._computeOpen();s._buildHash();s._bondList();}
function createWorld({seed=787,motion='body',start='bath'}={}){
  assert(Number.isInteger(seed)&&seed>=1&&seed<=2147483647,'Seed must be an integer from 1 to 2147483647');
  assert(['body','individual'].includes(motion)&&STARTS.includes(start),'Unknown start or motion');
  const c=arcSetup({seed,mode:motion==='body'?'body16':'individual16',arm:'closed'});
  const s=LiveHalfCellSim.fromState(c.s.saveState(),{rimBind:true,pMem:DEFAULTS.pMem,
    pMelt:DEFAULTS.pMelt,pMeltRun:DEFAULTS.pMeltRun,pMeltEnd:DEFAULTS.pMeltEnd,
    pReload:DEFAULTS.pReload,maxEventLog:0,maxBirthLog:0});
  const daughter=new Set(c.ids.groups[1]);
  if(start!=='paired'){
    for(const [a]of c.ids.faces)s._unlink(a>>2,F);
    for(const u of daughter){
      for(let i=0;i<4;i++){
        s._unlink(u,i);const a=u*4+i,b=s.rimBond[a];if(b>=0){s.rimBond[a]=-1;s.rimBond[b]=-1;}
      }
      s.is[u]=I_DOCK;
    }
  }
  if(start==='bath'){
    // Rejection placement is initialization only. No target slot/orientation is retained.
    const free=[...daughter,...c.ids.fuels],placed=[...c.ids.groups[0]];
    for(const u of free){
      let ok=false;
      for(let attempt=0;attempt<2000&&!ok;attempt++){
        s.px[u]=7+10*s.rng();s.py[u]=6+11*s.rng();s.pa[u]=2*Math.PI*s.rng();s._resetShape(u);
        ok=placed.every(v=>{
          const dx=s._dx(s.px[v]-s.px[u]),dy=s._dy(s.py[v]-s.py[u]);
          return overlap(s._outline(u),s._outline(v,dx,dy))<1e-10;
        });
      }
      assert(ok,'Could not place conserved free material');placed.push(u);
    }
  }
  for(const u of c.ids.fuels)s.is[u]=I_ON;
  s.rimEvents=0;synchronize(s);
  return {s,setup:{seed,motion,start},ids:c.ids};
}
function bonds(table){return Array.from(table).flatMap((b,a)=>b>a?[[a,b]]:[]);}
function observe(s){
  // Topology and membership are read-only reporting, never inputs to runtime rules.
  const chains=[],closed=[];
  for(let p=0;p<s.n;p++)if(s.type[p]===T_P){
    const units=[p],seen=new Set(units);let u=p;
    while(s.bond[u*4+R]>=0){
      const b=s.bond[u*4+R],v=b>>2;
      if((b&3)!==L||seen.has(v)||![T_A,T_Q].includes(s.type[v]))break;
      units.push(v);seen.add(v);u=v;if(s.type[u]===T_Q)break;
    }
    if(s.type[u]!==T_Q)continue;
    const unpaired=units.every(v=>s.bond[v*4+F]<0),active=units.every(v=>s.is[v]===I_TPL);
    const chain={units,unpaired,active};chains.push(chain);
    const ws=[],visited=new Set([p]);let b=s.rimBond[p*4+L];
    while(b>=0&&!visited.has(b>>2)){
      const v=b>>2;visited.add(v);
      if(v===u&&(b&3)===R){closed.push({...chain,rim:ws});break;}
      if(s.type[v]!==T_C||(b&3)!==F)break;
      ws.push(v);b=s.rimBond[v*4+K];
    }
  }
  let docked=0,freeW=0,charged=0;
  for(let u=0;u<s.n;u++){
    if([T_A,T_P,T_Q].includes(s.type[u])&&s.bond[u*4+F]>=0)docked++;
    if(s.type[u]===T_C&&!s.rimBond.subarray(u*4,u*4+4).some(b=>b>=0))freeW++;
    if(s.type[u]===T_E&&s.is[u]===I_ON)charged++;
  }
  return {chains,closed,chainCount:chains.length,closedCount:closed.length,
    unpairedChains:chains.filter(x=>x.unpaired).length,
    unpairedClosed:closed.filter(x=>x.unpaired).length,
    activeClosed:closed.filter(x=>x.unpaired&&x.active).length,
    copyingContacts:docked/2,freeW,charged,rimBonds:bonds(s.rimBond).length,
    ordinaryBonds:bonds(s.bond).length,rimAttachments:s.rimEvents};
}
function geometry(s){
  let maxOverlap=0,maxPin=0;let worstPair=null;
  for(let u=0;u<s.n;u++)for(let v=u+1;v<s.n;v++){
    const value=overlap(s._outline(u),s._outline(v,s._dx(s.px[v]-s.px[u]),s._dy(s.py[v]-s.py[u])));
    if(value>maxOverlap){maxOverlap=value;worstPair=[u,v];}
  }
  for(const [a,b]of [...bonds(s.bond),...bonds(s.rimBond)]){
    const ac=s._sideCorners(a>>2,a&3,[0,0]),bc=s._sideCorners(b>>2,b&3,[0,0]);
    for(let k=0;k<2;k++)maxPin=Math.max(maxPin,Math.hypot(
      s._dx(s.px[b>>2]+s.ox[bc[1-k]]-s.px[a>>2]-s.ox[ac[k]]),
      s._dy(s.py[b>>2]+s.oy[bc[1-k]]-s.py[a>>2]-s.oy[ac[k]])));
  }
  return {maxOverlap,maxPin,worstPair};
}
function snapshot(world,measure=false){
  const s=world.s;
  return {...frame(s),rimBonds:bonds(s.rimBond),types:[...s.type],states:[...s.is],
    width:s.p.W,height:s.p.H,setup:world.setup,summary:observe(s),...(measure?{geometry:geometry(s)}:{})};
}
function invariant(s,initial){
  assert.equal(s.n,28);assert.deepEqual(s.check(),[]);
  const st=s.saveState();
  for(const k of ['type','nv','rx','ry','edgeOf','size','w','wr'])assert.deepEqual(st.arrays[k],initial.arrays[k],k);
  for(const k of ['px','py','pa','ox','oy'])assert(s[k].every(Number.isFinite),k);
  for(let u=0;u<s.n;u++)if(s.type[u]===T_C)assert(s.bond.subarray(u*4,u*4+4).every(b=>b<0),'W leaked into letter chemistry');
}
function save(world){return {format:FORMAT,setup:{...world.setup},state:world.s.saveState()};}
function restore(saved){
  assert(saved&&saved.format===FORMAT,'Use a half-cell live save');
  const reference=createWorld(saved.setup),expected=reference.s.saveState(),st=saved.state;
  assert(st&&st.version===1&&st.arrays&&st.nums,'Invalid state');
  assert.deepEqual(st.p,expected.p,'Unsupported parameters');
  assert.deepEqual(Object.keys(st.arrays).sort(),Object.keys(expected.arrays).sort(),'Invalid arrays');
  for(const [key,value]of Object.entries(expected.arrays)){
    const q=st.arrays[key];assert(q&&q.t===value.t&&typeof q.b==='string'&&q.b.length===value.b.length,'Invalid array '+key);
  }
  assert(Number.isInteger(st.nums.t)&&st.nums.t>=0&&Number.isInteger(st.rng),'Invalid time/RNG');
  const s=LiveHalfCellSim.fromState(st);invariant(s,expected);
  assert.equal(s.rimBond.length,s.n*4);
  for(let u=0;u<s.n;u++)assert(Number.isInteger(s.is[u])&&s.is[u]>=0&&s.is[u]<=3,'Invalid block state');
  return {s,setup:{...saved.setup},ids:reference.ids};
}
module.exports={LiveHalfCellSim,createWorld,synchronize,observe,geometry,snapshot,invariant,save,restore,FORMAT,STARTS};
