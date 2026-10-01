'use strict';
// Worlds: founder chains (lattice bands), prepared structures (labelled starting conditions) and a free supply of
// typed triangles; read-only census helpers (observation never feeds the rules).
const {TriSim,PREV,NEXT,GLUE,SFACE,SBACK,DOCKED,gcode,gname,comp,typeName,canon}=require('./sim');
const {REST,separation}=require('./physics');
const H=Math.sqrt(3)/2,CORNER0=Math.atan2(REST[0][1],REST[0][0]);
const add=(a,b)=>[a[0]+b[0],a[1]+b[1]],sub=(a,b)=>[a[0]-b[0],a[1]-b[1]],mid=(a,b)=>[(a[0]+b[0])/2,(a[1]+b[1])/2];
const cross=(a,b)=>a[0]*b[1]-a[1]*b[0],same=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1])<1e-6;
const ccw=V=>cross(sub(V[1],V[0]),sub(V[2],V[0]))<0?[V[0],V[2],V[1]]:V;

// A chain as a lattice band from a role list ('F' face, 'B' hidden back): each triangle has two chain neighbours and
// one free edge, a face (left of the direction of travel) or a back (right). Returns {v, role, free, entry, exit}.
function band(roles){let a=[0,0],b=[0,1];const rot=(p,c,t)=>{const d=sub(p,c),co=Math.cos(t),si=Math.sin(t);return [c[0]+co*d[0]-si*d[1],c[1]+si*d[0]+co*d[1]];};
  let x=rot(b,a,-Math.PI/3);const out=[];
  for(const role of roles){const em=mid(a,b);let pick=null;
    for(const [ex,fr] of [[[a,x],[b,x]],[[b,x],[a,x]]]){const left=cross(sub(mid(ex[0],ex[1]),em),sub(mid(fr[0],fr[1]),em))>0;if((role==='F')===left)pick={ex,fr};}
    const t={v:[a,b,x],role,free:pick.fr,entry:[a,b],exit:pick.ex};out.push(t);
    const opp=t.v.find(v=>!same(v,pick.ex[0])&&!same(v,pick.ex[1]));[a,b]=pick.ex;x=sub(add(a,b),opp);}
  return out;}
const rolesFromGaps=gaps=>['F',...gaps.flatMap(c=>[...Array(c).fill('B'),'F'])];
// put triangle u at counter-clockwise world corners V (side i runs V[i] -> V[i+1])
function placeTri(s,u,V){const c=[(V[0][0]+V[1][0]+V[2][0])/3,(V[0][1]+V[1][1]+V[2][1])/3];s.px[u]=s._wx(c[0]);s.py[u]=s._wy(c[1]);
  s.pa[u]=Math.atan2(V[0][1]-c[1],V[0][0]-c[0])-CORNER0;s.resetShape(u);}
// a prepared structure: triangles {v, type, loose} in local lattice coordinates, moved to (x, y) and turned by rot.
// Shared sides bind when their glues are complementary; two inert shared sides are welded by the structure glue pair
// f/F (not for `loose` triangles, e.g. doors and hatches).
function buildStructure(s,units,tris,x,y,rot=0){const cs=Math.cos(rot),sn=Math.sin(rot),T=p=>[x+p[0]*cs-p[1]*sn,y+p[0]*sn+p[1]*cs];
  const W=tris.map(t=>{const V=t.v.map(T);if(cross(sub(V[1],V[0]),sub(V[2],V[0]))<0)throw Error('structure triangle not counter-clockwise');return V;});
  tris.forEach((t,k)=>{placeTri(s,units[k],W[k]);s.setType(units[k],t.type);});
  for(let a=0;a<tris.length;a++)for(let b=a+1;b<tris.length;b++)for(let i=0;i<3;i++)for(let j=0;j<3;j++){
    if(!(same(W[a][i],W[b][(j+1)%3])&&same(W[a][(i+1)%3],W[b][j])))continue;
    const u=units[a],v=units[b];let gu=s.glue[u*3+i],gv=s.glue[v*3+j];
    if(gu===0&&gv===0){if(tris[a].loose||tris[b].loose)continue;gu=gcode('f');gv=gcode('F');s.glue[u*3+i]=gu;s.glue[v*3+j]=gv;}
    if(gu&&gv===comp(gu))s.bind(u,i,GLUE,v,j,GLUE);}
  return W;}
// founders: {gaps, faces, ends?, backs?, x?, y?, caps?}; structures: {tris, x, y, rot?}; supply: {type: count}
function createWorld({seed=1,size=18,founders=[],structures=[],supply={},params={}}={}){
  const bands=founders.map(f=>band(rolesFromGaps(f.gaps)));
  const n=bands.reduce((a,b)=>a+b.length,0)+structures.reduce((a,t)=>a+t.tris.length,0)+Object.values(supply).reduce((a,b)=>a+b,0);
  // TRI_PARAMS (environment, JSON) overrides parameters for experiments, e.g. TRI_PARAMS='{"sigma":0.2}'
  const s=new TriSim({...params,...JSON.parse(process.env.TRI_PARAMS||'{}'),seed,W:size,H:size},n);let next=0;const placed=[],out={s,founders:[],structures:[]};
  bands.forEach((tris,k)=>{const f=founders[k],units=tris.map(()=>next++),cx=f.x??size*(k+1)/(bands.length+1),cy=f.y??size*(k+1)/(bands.length+1);
    let mx=0,my=0;for(const t of tris)for(const p of t.v){mx+=p[0]/(3*tris.length);my+=p[1]/(3*tris.length);}
    const Wv=tris.map((t,q)=>{const V=ccw(t.v).map(p=>[p[0]-mx+cx,p[1]-my+cy]);placeTri(s,units[q],V);return V;});
    for(let q=0;q+1<tris.length;q++)for(let i=0;i<3;i++)for(let j=0;j<3;j++)if(same(Wv[q][i],Wv[q+1][(j+1)%3])&&same(Wv[q][(i+1)%3],Wv[q+1][j]))s.bind(units[q],i,NEXT,units[q+1],j,PREV);
    units.forEach(u=>s.setType(u,'---'));
    let fi=0;for(const u of units){const r=s.roles(u);if(r.role===SFACE)s.glue[u*3+r.free]=gcode(f.faces[fi++]||'-');else if(r.role===SBACK&&f.backs)s.glue[u*3+r.free]=gcode(f.backs);}
    if(f.ends){const r0=s.roles(units[0]),r1=s.roles(units[units.length-1]);if(r0.inert>=0)s.glue[units[0]*3+r0.inert]=gcode(f.ends[0]);if(r1.inert>=0&&f.ends[1])s.glue[units[units.length-1]*3+r1.inert]=gcode(f.ends[1]);}
    if(f.caps!==false){s.cap[units[0]]=1;s.cap[units[units.length-1]]=1;}
    placed.push(...units);out.founders.push(units);});
  for(const st of structures){const units=st.tris.map(()=>next++);buildStructure(s,units,st.tris,st.x,st.y,st.rot||0);placed.push(...units);out.structures.push(units);}
  for(const [t,c] of Object.entries(supply))for(let q=0;q<c;q++){const u=next++;s.setType(u,t);
    if(!placeFree(s,u,placed,()=>[size*s.rng(),size*s.rng()]))throw Error('could not place '+t);placed.push(u);}
  for(let k=0;k<40;k++)s.derive();   // settle the relayed signals of the founders
  return out;}
// place free triangle u at random points from gen() without overlapping `placed`; true on success
function placeFree(s,u,placed,gen,tries=5000){for(let a=0;a<tries;a++){const [x,y]=gen();s.px[u]=s._wx(x);s.py[u]=s._wy(y);s.pa[u]=2*Math.PI*s.rng();s.resetShape(u);
    if(placed.every(v=>{const dx=s._dx(s.px[v]-s.px[u]),dy=s._dy(s.py[v]-s.py[u]);return Math.hypot(dx,dy)>2||!separation(s.outline(u),s.outline(v,dx,dy));}))return true;}
  return false;}
// Where a kit part grown from strand end `end` would lie (lattice coordinates of the kit mapped so the root's seed side
// meets the end's spare edge). ok when no part cell or clear cell (cells the part needs empty) meets a strand cell, a
// dock site of the strand (a face's mirror cell) or a cell beside a dock site. Read-only planning for demos.
function partPlacement(s,units,end,K,clear=[]){
  const u0=units[0],P=(u,k)=>[s._dx(s.px[u]-s.px[u0])+s.ox[u*3+k],s._dy(s.py[u]-s.py[u0])+s.oy[u*3+k]];
  const e=s.roles(end).inert,a=P(end,(e+1)%3),b=P(end,e),V=K.tris[K.root].v,i=K.rootSide,c=V[i],d=V[(i+1)%3];
  const ang=Math.atan2(b[1]-a[1],b[0]-a[0])-Math.atan2(d[1]-c[1],d[0]-c[0]),cs=Math.cos(ang),sn=Math.sin(ang);
  const T=p=>{const x=p[0]-c[0],y=p[1]-c[1];return [a[0]+cs*x-sn*y,a[1]+sn*x+cs*y];},cen=v=>[(v[0][0]+v[1][0]+v[2][0])/3,(v[0][1]+v[1][1]+v[2][1])/3];
  const cells=K.tris.map(t=>t.v.map(T)),clr=clear.map(v=>v.map(T)),strand=units.map(u=>[0,1,2].map(k=>P(u,k))),dock=[];
  for(const u of units){const r=s.roles(u);if(r.role!==SFACE||r.free<0)continue;const f=r.free,A=P(u,f),B=P(u,(f+1)%3),C=P(u,(f+2)%3);dock.push([B,A,[A[0]+B[0]-C[0],A[1]+B[1]-C[1]]]);}
  const dist=(v,w)=>{const p=cen(v),q=cen(w);return Math.hypot(p[0]-q[0],p[1]-q[1]);};
  for(const v of [...cells,...clr]){for(const w of strand)if(dist(v,w)<0.3)return {ok:false,cells};for(const w of dock)if(dist(v,w)<0.7)return {ok:false,cells};}
  return {ok:true,cells};}
// read-only census: strands (chain-bonded components) with face glue sequence and gap string
function census(s){const seen=new Set(),out=[];
  for(let u=0;u<s.n;u++){if(seen.has(u))continue;const e=s._edges(u);if(e.prev>=0||e.next<0)continue;
    const units=[];let x=u,guard=0;while(x>=0&&!seen.has(x)&&guard++<1000){seen.add(x);units.push(x);const r=s._edges(x);x=r.next>=0?s.partner(x,r.next):-1;}
    let faces='',gaps='',c=null;
    for(const v of units){const r=s.roles(v);if(r.role===SFACE||r.role===DOCKED){faces+=gname(s.glue[v*3+(r.role===DOCKED?r.face:r.free)]);if(c!==null)gaps+=c;c=0;}else if(c!==null)c++;}
    out.push({units,faces,gaps,n:units.length,paired:units.some(v=>s._edges(v).face>=0)});}
  return out;}
const typeCount=s=>{const m={};for(let u=0;u<s.n;u++){const k=canon(typeName(s,u));m[k]=(m[k]||0)+1;}return m;};
module.exports={createWorld,partPlacement,buildStructure,placeTri,placeFree,band,rolesFromGaps,census,typeCount,H};
