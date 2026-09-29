'use strict';
// Abundant-soup half-cell worlds: one founder D (the RESULTS 87/88 geometry) plus K loose inventories of its parts
// (P, A, A, Q, eight W, fuel), placed without overlap. Uses the live chemistry and the fast runtime.
const assert=require('assert/strict');
const {NV,F,R,K,L,T_A,T_C,T_E,T_P,T_Q,I_TPL,I_ON}=require('../src/sim');
const live=require('./half_cell_live'),{FastLiveHalfCellSim}=require('./half_cell_fast'),{overlap}=require('./half_cell_geometry');
function createSoup({seed,extra=4,size=24,fuelPer=2,Cls=FastLiveHalfCellSim,rays=0,params={}}={}){
  const ref=live.createWorld({seed:1,start:'paired',motion:'body'}).s,p={...ref.p};
  const counts={nA:2+2*extra,nB:0,nC:8+8*extra,nP:1+extra,nQ:1+extra,nE:4+fuelPer*extra,nX:rays};
  const s=new Cls({...p,...params,...counts,seed,W:size,H:size,seedCount:0});
  const units=t=>Array.from({length:s.n},(_,u)=>u).filter(u=>s.type[u]===t);
  const P=units(T_P),Q=units(T_Q),A=units(T_A),Wb=units(T_C),E=units(T_E);
  // Founder: copy the reference founder's relative poses, rim and chain bonds (reference ids are its group 0).
  const rw=live.createWorld({seed:1,start:'paired',motion:'body'}),rs=rw.s,ids=rw.ids;
  const map=new Map(),take={[T_P]:P,[T_Q]:Q,[T_A]:A,[T_C]:Wb},used={[T_P]:0,[T_Q]:0,[T_A]:0,[T_C]:0};
  const founder=[...ids.chains[0],...ids.arcs[0]];
  const cx=size/2-rs.px[ids.chains[0][1]],cy=size/2-rs.py[ids.chains[0][1]];
  for(const u of founder){const t=rs.type[u],v=take[t][used[t]++];map.set(u,v);
    s.px[v]=s._wx(rs.px[u]+cx);s.py[v]=s._wy(rs.py[u]+cy);s.pa[v]=rs.pa[u];
    for(let k=0;k<NV;k++){s.ox[v*NV+k]=rs.ox[u*NV+k];s.oy[v*NV+k]=rs.oy[u*NV+k];}
    s.is[v]=I_TPL;}
  for(const u of founder)for(let i=0;i<4;i++){
    const b=rs.bond[u*4+i];if(b>=0&&map.has(b>>2)&&(b&3)!==F){const v=map.get(u),w=map.get(b>>2);if(s.bond[v*4+i]<0)s._link(v,i,w,b&3);}
    const rb=rs.rimBond[u*4+i];if(rb>=0&&map.has(rb>>2)){const v=map.get(u),w=map.get(rb>>2);if(s.rimBond[v*4+i]<0){s.rimBond[v*4+i]=w*4+(rb&3);s.rimBond[w*4+(rb&3)]=v*4+i;}}
  }
  const placed=[...map.values()],loose=Array.from({length:s.n},(_,u)=>u).filter(u=>!placed.includes(u));
  for(const u of loose){
    let ok=false;
    for(let attempt=0;attempt<5000&&!ok;attempt++){
      s.px[u]=size*s.rng();s.py[u]=size*s.rng();s.pa[u]=2*Math.PI*s.rng();s._resetShape(u);
      ok=placed.every(v=>{const dx=s._dx(s.px[v]-s.px[u]),dy=s._dy(s.py[v]-s.py[u]);
        return Math.hypot(dx,dy)>3||overlap(s._outline(u),s._outline(v,dx,dy))<1e-10;});
    }
    assert(ok,'Could not place loose material');placed.push(u);
    s.is[u]=s.type[u]===T_E?I_ON:s.is[u];
  }
  s.rimEvents=0;live.synchronize(s);
  return {s,founder:[...ids.chains[0]].map(u=>map.get(u)),founderArc:ids.arcs[0].map(u=>map.get(u))};
}
module.exports={createSoup};
