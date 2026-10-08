'use strict';
// Worlds: prepared structures (labelled starting conditions) and a free supply of typed triangles; a read-only type
// count (observation never feeds the rules). Founder strands (lattice bands, held by an anchor) and the strand census
// left with chain copying on 2026-10-08 (core review run 20261008-2221: git `1284bb4`).
const {TriSim,gcode,comp,typeName,canon}=require('./sim');
const {REST,separation}=require('./physics');
const H=Math.sqrt(3)/2,CORNER0=Math.atan2(REST[0][1],REST[0][0]);
const sub=(a,b)=>[a[0]-b[0],a[1]-b[1]];
const cross=(a,b)=>a[0]*b[1]-a[1]*b[0],same=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1])<1e-6;

// put triangle u at counter-clockwise world corners V (side i runs V[i] -> V[i+1])
function placeTri(s,u,V){const c=[(V[0][0]+V[1][0]+V[2][0])/3,(V[0][1]+V[1][1]+V[2][1])/3];s.px[u]=s._wx(c[0]);s.py[u]=s._wy(c[1]);
  s.pa[u]=Math.atan2(V[0][1]-c[1],V[0][0]-c[0])-CORNER0;s.resetShape(u);}
// a prepared structure: triangles {v, type, loose} in local lattice coordinates, moved to (x, y) and turned by rot.
// Shared sides bind when their glues are complementary; two inert shared sides are welded by the structure glue pair
// f/F (not for `loose` triangles, e.g. a free triangle placed in a site).
function buildStructure(s,units,tris,x,y,rot=0){const cs=Math.cos(rot),sn=Math.sin(rot),T=p=>[x+p[0]*cs-p[1]*sn,y+p[0]*sn+p[1]*cs];
  const W=tris.map(t=>{const V=t.v.map(T);if(cross(sub(V[1],V[0]),sub(V[2],V[0]))<0)throw Error('structure triangle not counter-clockwise');return V;});
  tris.forEach((t,k)=>{placeTri(s,units[k],W[k]);s.setType(units[k],t.type);});
  for(let a=0;a<tris.length;a++)for(let b=a+1;b<tris.length;b++)for(let i=0;i<3;i++)for(let j=0;j<3;j++){
    if(!(same(W[a][i],W[b][(j+1)%3])&&same(W[a][(i+1)%3],W[b][j])))continue;
    const u=units[a],v=units[b];let gu=s.glue[u*3+i],gv=s.glue[v*3+j];
    if(gu===0&&gv===0){if(tris[a].loose||tris[b].loose)continue;gu=gcode('f');gv=gcode('F');s.glue[u*3+i]=gu;s.glue[v*3+j]=gv;}
    if(gu&&gv===comp(gu))s.bind(u,i,v,j);}
  return W;}
// structures: {tris, x, y, rot?}; supply: {type: count}
function createWorld({seed=1,size=18,structures=[],supply={},params={}}={}){
  const n=structures.reduce((a,t)=>a+t.tris.length,0)+Object.values(supply).reduce((a,b)=>a+b,0);
  // TRI_PARAMS (environment, JSON) overrides parameters for experiments, e.g. TRI_PARAMS='{"sigma":0.2}'
  const s=new TriSim({...params,...JSON.parse(process.env.TRI_PARAMS||'{}'),seed,W:size,H:size},n);let next=0;const placed=[],out={s,structures:[]};
  for(const st of structures){const units=st.tris.map(()=>next++);buildStructure(s,units,st.tris,st.x,st.y,st.rot||0);placed.push(...units);out.structures.push(units);}
  for(const [t,c] of Object.entries(supply))for(let q=0;q<c;q++){const u=next++;s.setType(u,t);
    if(!placeFree(s,u,placed,()=>[size*s.rng(),size*s.rng()]))throw Error('could not place '+t);placed.push(u);}
  for(let k=0;k<40;k++)s.derive();   // settle the relayed signals of the prepared structures
  // TRI_RESUME (environment): a saved state (.json.gz from a demo's pictures) of this same world continues from there;
  // TRI_PARAMS still overrides the saved parameters, and TRI_RESEED=k restarts the random stream from k (replicate
  // continuations of one state; explore run 20261008-1522)
  if(process.env.TRI_RESUME){const st=JSON.parse(require('zlib').gunzipSync(require('fs').readFileSync(process.env.TRI_RESUME)));
    if(st.n===n){const r=s.constructor.fromState(st);for(const k of Object.keys(r))s[k]=r[k];s._cells=null;s.p={...s.p,...JSON.parse(process.env.TRI_PARAMS||'{}')};
      if(process.env.TRI_RESEED){s.rng.setState(+process.env.TRI_RESEED);s._spare=NaN;}
      console.log('resumed from',process.env.TRI_RESUME,'at t='+s.t+(process.env.TRI_RESEED?' reseeded '+process.env.TRI_RESEED:''));}}
  return out;}

// place free triangle u at random points from gen() without overlapping `placed`; true on success
function placeFree(s,u,placed,gen,tries=5000){for(let a=0;a<tries;a++){const [x,y]=gen();s.px[u]=s._wx(x);s.py[u]=s._wy(y);s.pa[u]=2*Math.PI*s.rng();s.resetShape(u);
    if(placed.every(v=>{const dx=s._dx(s.px[v]-s.px[u]),dy=s._dy(s.py[v]-s.py[u]);return Math.hypot(dx,dy)>2||!separation(s.outline(u),s.outline(v,dx,dy));}))return true;}
  return false;}
const typeCount=s=>{const m={};for(let u=0;u<s.n;u++){const k=canon(typeName(s,u));m[k]=(m[k]||0)+1;}return m;};
module.exports={createWorld,buildStructure,placeTri,placeFree,typeCount,H};
