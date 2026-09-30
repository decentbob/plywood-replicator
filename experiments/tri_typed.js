'use strict';
// Typed triangles (user, 2026-09-30): replaces the growth programs of tri_chain.js. Every block is the same unit
// triangle; a triangle's TYPE is three glues, one per side (counter-clockwise), written as a string such as "aB-".
//   glues   letters in complementary pairs: a <-> A, b <-> B, ..., '-' inert (binds nothing). k <-> K is the
//           activator pair used by casting; nothing else makes it special.
//   binding (one rule everywhere) a side binds a flush side carrying the complementary glue, if at least one of the two
//           triangles is already attached (activation by attachment: free triangles never bind each other).
//           Repeats are allowed: a type that binds itself grows until geometry or supply stops it.
//   chains  the copy chemistry of tri_chain.js; a free triangle docks on a template face only with the complementary
//           glue, so a copy's faces carry the complement of the template's faces and a copy of the copy restores them.
//           Fills and closures stay glue-agnostic (option latGlue: fills need the complement of the lateral glue).
//           Chain backs (released strands) and strand ends' spare edges bind by glue like any attached side.
//   hinges  (side property, written after the glue: '<' pins the side's first corner, '>' its second) a bond on a
//           hinged side pins one corner only; hinged pairs keep their contact and jostle as one body. The hinge
//           is driven, not floppy: it rests flush (the angle at which the bond formed) and swings hingeAngle (60
//           degrees) away from its partner while the flap's trigger side (the side before the hinge side,
//           counter-clockwise) is bonded. Binding the trigger closes/opens the hatch, releasing it swings it back, and
//           whatever is bonded to the flap is carried along (blocks moved by a machine part).
//   close-only (side property '.') the side binds only triangles that are already attached, never a free one: it
//           closes onto what a structure brings to it (a switch of the side's activity by attachment).
//   casting (permanent type change, in-simulation) a triangle T whose three sides are all glue-bonded to triangles
//           N1..N3 is in a pocket. For each Ni: the side bonded to T is its recognition side, the next side
//           counter-clockwise its activator side, the remaining side its instruction side. If every Ni's activator side
//           is bonded to a k (Ni exposes this to T, previous pass), T takes on each side the instruction glue of the
//           triangle facing it (castComp: its complement) and lets go of all three. Casters are ordinary types with K
//           on the activator side; a pocket needs a frame holding k in the right places, so casting is rare by chance
//           and routine inside a machine.
//           Default is to copy the instruction glue, not complement it: a complemented product would carry the
//           complement of its casters' instruction sides and stick to them.
//   node experiments/tri_typed.js copy SEED STEPS OUTSTEM   |   pocket SEED STEPS OUTSTEM
const fs=require('fs'),path=require('path'),zlib=require('zlib'),{execFileSync}=require('child_process');
const {NV}=require('../src/sim');
const live=require('./half_cell_live'),{overlap}=require('./half_cell_geometry');
const {TriSim,PREV,NEXT,FACE,TFACE}=require('./tri_chain');
const {band}=require('./triangle_alphabet_figure'),{regular}=require('./seeded_ports');
const GLUE=12,FREE=0,SFACE=1,SBACK=2,DOCKED=3,GROWN=5;
const m3=x=>((x%3)+3)%3;

// ---------------- glues and types ----------------
const gcode=c=>c==='-'?0:c>='a'&&c<='z'?2*(c.charCodeAt(0)-97)+1:2*(c.charCodeAt(0)-65)+2;
const gname=g=>g===0?'-':g%2?String.fromCharCode(97+(g-1)/2):String.fromCharCode(65+(g-2)/2);
const comp=g=>g===0?0:g%2?g+1:g-1;
function parseType(str){const t=[...str.matchAll(/([a-zA-Z-])([<>.]*)/g)];if(t.length!==3)throw Error('type needs 3 sides: '+str);
  return {glue:t.map(m=>gcode(m[1])),hinge:t.map(m=>m[2].includes('<')?1:m[2].includes('>')?2:0),close:t.map(m=>m[2].includes('.')?1:0)};}
const typeName=(s,u)=>[0,1,2].map(i=>gname(s.glue[u*3+i])+(s.hing[u*3+i]===1?'<':s.hing[u*3+i]===2?'>':'')+(s.cOnly[u*3+i]?'.':'')).join('');
// canonical name up to rotation (the same type in any orientation)
const canon=name=>{const t=[...name.matchAll(/[a-zA-Z-][<>.]*/g)].map(m=>m[0]);return [0,1,2].map(r=>[0,1,2].map(i=>t[(i+r)%3]).join('')).sort()[0];};

class TypedSim extends TriSim{
  _tri(){super._tri();const n=this.n;if(!this.glue||this.glue.length!==3*n){this.glue=new Int8Array(3*n);this.hing=new Int8Array(3*n);this.actE=new Int8Array(n).fill(-1);this.hRel=new Float64Array(3*n);this.cOnly=new Int8Array(3*n);this.hSign=new Int8Array(3*n);}}
  setType(u,str){this._tri();const t=parseType(str);for(let i=0;i<3;i++){this.glue[u*3+i]=t.glue[i];this.hing[u*3+i]=t.hinge[i];this.cOnly[u*3+i]=t.close[i];}this.bondsDirty=true;}
  _roles(u){const r=super._roles(u);
    if(r.role===FREE)for(let i=0;i<3;i++)if(this.bond[u*4+i]>=0&&this.bkind[u*4+i]===GLUE)return {role:GROWN};
    return r;}
  _derive3(){super._derive3();
    // activator exposure: the side of mine whose glue is K and is bonded to a partner side carrying k (or -1)
    const K=gcode('K');for(let u=0;u<this.n;u++){let a=-1;for(let i=0;i<3;i++){const q=this.bond[u*4+i];
      if(q>=0&&this.glue[u*3+i]===K&&this.glue[(q>>2)*3+(q&3)]===comp(K)){a=i;break;}}this.actE[u]=a;}}
  // sides of an attached triangle that bind by glue: all free sides of a glue-bonded (grown) triangle; the back of a
  // released strand triangle; the spare edge of a strand end that is not being copied
  _active(u,r){const bnd=i=>this.bond[u*4+i]>=0;
    if(r.role===GROWN)return [0,1,2].filter(i=>!bnd(i));
    if(r.role===SBACK&&!r.fill&&r.prev>=0&&r.next>=0&&r.free>=0&&!bnd(r.free))return [r.free];
    if(r.role===SFACE&&r.inert>=0&&!bnd(r.inert)&&!(r.free>=0&&bnd(r.free)))return [r.inert];
    return [];}
  _triBonds(){
    const p=this.p,R=this._R,pairs=this.pairs,tolF=p.triTol||0.3,tolC=p.triTolClose||0.22,pb=p.pBond===undefined?0.5:p.pBond,G=this.glue;
    const free=u=>R[u].role===FREE,bnd=(u,i)=>this.bond[u*4+i]>=0,gl=(u,i)=>G[u*3+i];
    for(let k=0;k<pairs.length;k+=2){let u=pairs[k],v=pairs[k+1];const ru=R[u],rv=R[v];
      if(free(u)&&free(v))continue;
      if(free(u)||free(v)){if(free(u))[u,v]=[v,u];const r=R[u];let done=false;   // u attached, v free
        // glue binding on an active side
        for(const e of this._active(u,r)){const g=gl(u,e);if(!g||this.cOnly[u*3+e])continue;
          for(let j=0;j<3;j++)if(gl(v,j)===comp(g)&&this._flush(u,e,v,j,tolF)&&this.rng()<pb){this._bind(u,e,GLUE,v,j,GLUE);R[v]={role:GROWN};this.glueEvents=(this.glueEvents||0)+1;done=true;break;}
          if(done)break;}
        if(done)continue;
        // dock on a free face with the complementary glue
        if(!p.noDock&&r.role===SFACE&&r.free>=0&&!bnd(u,r.free)&&!this.refr[u]&&(!p.caps||(this.sigP[u]>0&&this.sigN[u]>0))){const g=gl(u,r.free);
          if(g)for(let j=0;j<3;j++)if(gl(v,j)===comp(g)&&this._flush(u,r.free,v,j,tolF)&&this.rng()<pb){this._bind(u,r.free,TFACE,v,j,FACE);
            if(this.cap[u])this.cap[v]=1;this.sigP[v]=this.sigN[u];this.sigN[v]=this.sigP[u];this.dockEvents=(this.dockEvents||0)+1;R[v]={role:DOCKED};break;}
          continue;}
        // fill on the prev edge of a docked or fill triangle that still needs fills (glue-agnostic unless latGlue)
        if((r.role===DOCKED||r.fill)&&r.prev>=0&&!bnd(u,r.prev)&&this.need[u]>=1){for(let j=0;j<3;j++)if((!p.latGlue||gl(v,j)===comp(gl(u,r.prev)))&&this._flush(u,r.prev,v,j,tolF)&&this.rng()<pb){
          this._bind(u,r.prev,PREV,v,j,NEXT);this.fill[v]=1;this.sigP[v]=this.sigP[u];this.sigN[v]=this.sigN[u];this.fillEvents=(this.fillEvents||0)+1;R[v]={role:SBACK,fill:true};break;}}
        continue;}
      // two attached triangles: glue closure between active sides
      let done=false;
      for(const e of this._active(u,ru)){const g=gl(u,e);if(!g)continue;
        for(const f of this._active(v,rv))if(gl(v,f)===comp(g)&&this._flush(u,e,v,f,tolC)&&this.rng()<pb){this._bind(u,e,GLUE,v,f,GLUE);this.closeGlue=(this.closeGlue||0)+1;done=true;break;}
        if(done)break;}
      if(done)continue;
      // copy closure: prev edge of one copy triangle to next edge of another
      const cp=r=>r.role===DOCKED||r.fill;if(!cp(ru)||!cp(rv))continue;
      for(const [a,ra,b,rb] of [[u,ru,v,rv],[v,rv,u,ru]]){
        if(ra.prev>=0&&rb.next>=0&&this.need[a]===0&&!bnd(a,ra.prev)&&!bnd(b,rb.next)&&this._flush(a,ra.prev,b,rb.next,tolC)&&this.rng()<pb){
          this._bind(a,ra.prev,PREV,b,rb.next,NEXT);this.closeEvents=(this.closeEvents||0)+1;break;}}
    }
  }
  _triChem(){super._triChem();this._cast();}
  _cast(){
    const G=this.glue;
    for(let u=0;u<this.n;u++){let ok=true;const src=[];
      for(let i=0;i<3&&ok;i++){const q=this.bond[u*4+i];if(q<0||this.bkind[u*4+i]!==GLUE){ok=false;break;}
        const w=q>>2,j=q&3;if(this.actE[w]!==m3(j+1))ok=false;else src.push(G[w*3+m3(j+2)]);}
      if(!ok)continue;
      for(let i=0;i<3;i++){G[u*3+i]=this.p.castComp?comp(src[i]):src[i];this.hing[u*3+i]=0;this.cOnly[u*3+i]=0;this._cut(u,i);}
      this.castEvents=(this.castEvents||0)+1;(this.castLog||(this.castLog=[])).push([this.t,u,typeName(this,u)]);}
  }
  // hinges: a bond on a hinged side pins one corner; hinged pairs still collide
  _bondList(){const dirty=this.bondsDirty,out=super._bondList();
    if(dirty&&this.hing&&this.hing.some(x=>x)){const pins=this.pins,cu=[0,0],cv=[0,0];pins.length=0;
      for(const q of out){const r=this.bond[q];if(r<0)continue;const u=q>>2,i=q&3,v=r>>2,j=r&3;this._sideCorners(u,i,cu);this._sideCorners(v,j,cv);
        const hu=i<3?this.hing[u*3+i]:0,hv=j<3?this.hing[v*3+j]:0;
        if(hu===1||hv===2)pins.push(cu[0],cv[1]);else if(hu===2||hv===1)pins.push(cu[1],cv[0]);else pins.push(cu[0],cv[1],cu[1],cv[0]);}
      this.pinsVersion=(this.pinsVersion||0)+1;}
    return out;}
  _polygonContacts(){const c=super._polygonContacts();
    if(this.hing&&this.hing.some(x=>x)){for(let q=0;q<this.n*4;q++){const r=this.bond[q];if(r<=q)continue;const u=q>>2,i=q&3,v=r>>2,j=r&3;
      if((i<3&&this.hing[u*3+i])||(j<3&&this.hing[v*3+j]))c.push(u,v);}this._sweep=Math.max(1,c.length/2);}
    return c;}
  // hinge drive: a hinged side remembers its flush angle (relative to its partner, when the bond formed) and which
  // way is away from the partner. While the flap's trigger side (the side before the hinge side, counter-clockwise)
  // is bonded the flap is driven to hingeAngle away from flush, otherwise back to flush, at most hingeRate per step,
  // turning about its pinned corner and carrying everything bonded to it. A flap whose body reaches its partner
  // through other bonds is locked and not driven.
  _ang(u){return Math.atan2(this.oy[u*NV],this.ox[u*NV]);}
  _bind(u,i,ku,v,j,kv){super._bind(u,i,ku,v,j,kv);
    for(const [x,e,y] of [[u,i,v],[v,j,u]]){if(e>2||!this.hing||!this.hing[x*3+e])continue;
      this.hRel[x*3+e]=this._ang(x)-this._ang(y);
      const c=this.hing[x*3+e]===1?e:(e+1)%3,Px=this.ox[x*NV+c],Py=this.oy[x*NV+c];   // pin relative to the flap centre
      const fx=-Px,fy=-Py,dx=this._dx(this.px[x]-this.px[y]),dy=this._dy(this.py[x]-this.py[y]);   // centre - pin; flap - partner
      this.hSign[x*3+e]=(dx*(-fy)+dy*fx)>0?1:-1;}}
  _servo(){
    if(!this.hing||!this.hing.some(x=>x))return;const n=this.n,th=this.p.hingeAngle??Math.PI/3,rate=this.p.hingeRate??0.05;
    const wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
    for(let u=0;u<n;u++)for(let i=0;i<3;i++){const q=this.bond[u*4+i];if(!this.hing[u*3+i]||q<0)continue;const v=q>>2;
      const swung=this.bond[u*4+m3(i+2)]>=0,target=this.hRel[u*3+i]+(swung?this.hSign[u*3+i]*th:0);
      const err=wrap(target-(this._ang(u)-this._ang(v)));if(Math.abs(err)<0.01)continue;const d=Math.max(-rate,Math.min(rate,err));
      // the flap's body: everything bonded to it except through its hinge
      const body=[u],seen=new Set(body);let locked=false;
      for(let k=0;k<body.length&&!locked;k++){const x=body[k];for(let e=0;e<3;e++){const r=this.bond[x*4+e];if(r<0||(x===u&&e===i))continue;const y=r>>2;
        if(y===v){locked=true;break;}if(!seen.has(y)){seen.add(y);body.push(y);}}}
      if(locked)continue;
      const c=this.hing[u*3+i]===1?i:(i+1)%3,Px=this.px[u]+this.ox[u*NV+c],Py=this.py[u]+this.oy[u*NV+c],cs=Math.cos(d),sn=Math.sin(d);
      for(const x of body){const rx=this._dx(this.px[x]-Px),ry=this._dy(this.py[x]-Py);
        this._rigidMove(x,cs*rx-sn*ry-rx,sn*rx+cs*ry-ry,d);
        this.px[x]=this._wx(this.px[x]);this.py[x]=this._wy(this.py[x]);}
      this.hingeMoves=(this.hingeMoves||0)+1;}
  }
  step(){this._servo();super.step();}
  saveState(){const s=super.saveState();s.typed={glue:Array.from(this.glue||[]),hing:Array.from(this.hing||[]),cOnly:Array.from(this.cOnly||[]),bkind:Array.from(this.bkind||[])};return s;}
}

// ---------------- worlds ----------------
const H=Math.sqrt(3)/2,corner0=Math.atan2(regular(3,1)[0][1],regular(3,1)[0][0]);
const ccwV=V=>((V[1][0]-V[0][0])*(V[2][1]-V[0][1])-(V[1][1]-V[0][1])*(V[2][0]-V[0][0]))<0?[V[0],V[2],V[1]]:V;
function placeTri(s,u,V){  // V: counter-clockwise world corners; side i runs V[i] -> V[i+1]
  const c=[(V[0][0]+V[1][0]+V[2][0])/3,(V[0][1]+V[1][1]+V[2][1])/3];s.px[u]=s._wx(c[0]);s.py[u]=s._wy(c[1]);
  s.pa[u]=Math.atan2(V[0][1]-c[1],V[0][0]-c[0])-corner0;s._resetShape(u);}
const same=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1])<1e-6;
// A prepared structure (labelled starting condition): triangles {v, type} in local lattice coordinates, moved to
// (x, y) and turned by rot. Shared sides bind when their glues are complementary; two inert shared sides are welded
// by a structure glue pair (f/F) so the structure holds together.
function buildStructure(s,units,tris,x,y,rot=0){
  const cs=Math.cos(rot),sn=Math.sin(rot),T=p=>[x+p[0]*cs-p[1]*sn,y+p[0]*sn+p[1]*cs];
  const W=tris.map(t=>{const V=t.v.map(T);const cr=(V[1][0]-V[0][0])*(V[2][1]-V[0][1])-(V[1][1]-V[0][1])*(V[2][0]-V[0][0]);if(cr<0)throw Error('structure triangle not counter-clockwise');return V;});
  tris.forEach((t,k)=>{placeTri(s,units[k],W[k]);s.setType(units[k],t.type);});
  for(let a=0;a<tris.length;a++)for(let b=a+1;b<tris.length;b++)for(let i=0;i<3;i++)for(let j=0;j<3;j++){
    if(!(same(W[a][i],W[b][(j+1)%3])&&same(W[a][(i+1)%3],W[b][j])))continue;
    const u=units[a],v=units[b];let gu=s.glue[u*3+i],gv=s.glue[v*3+j];
    if(gu===0&&gv===0){gu=gcode('f');gv=gcode('F');s.glue[u*3+i]=gu;s.glue[v*3+j]=gv;}
    if(gv===comp(gu)&&gu)s._bind(u,i,GLUE,v,j,GLUE);}
  return W;
}
// founders: {gaps:[...], faces:'abab..'} (one face glue per face triangle, in strand order), backs:'-' glue for hidden
// triangles' spare sides; structures: {tris, x, y, rot}; supply: {type: count}
function createTypedWorld({seed,founders=[],structures=[],supply={},size=18,params={}}={}){
  const ref=live.createWorld({seed:1,start:'paired',motion:'body'}).s.p;
  const bands=founders.map(f=>band(['F',...f.gaps.flatMap(c=>[...Array(c).fill('B'),'F'])]));
  const nFree=Object.values(supply).reduce((a,b)=>a+b,0),nStruct=structures.reduce((a,t)=>a+t.tris.length,0),nBand=bands.reduce((a,b)=>a+b.length,0);
  const s=new TypedSim({...ref,nA:nBand+nStruct+nFree,nB:0,nC:0,nD:0,nJ:0,nP:0,nQ:0,nE:0,energyGate:false,iters:32,...params,seed,W:size,H:size,seedCount:0});
  s._tri();let next=0;const placed=[],out={s,founders:[],structures:[]};
  bands.forEach((tris,k)=>{const f=founders[k],units=tris.map(()=>next++),cx=f.x??size*(k+1)/(bands.length+1),cy=f.y??size*(k+1)/(bands.length+1);
    // lay the band down (as tri_chain.placeBand) and bind it
    let mx=0,my=0;for(const t of tris)for(const p of t.v){mx+=p[0]/(3*tris.length);my+=p[1]/(3*tris.length);}
    const Wv=tris.map((t,q)=>{const V=ccwV(t.v).map(p=>[p[0]-mx+cx,p[1]-my+cy]);placeTri(s,units[q],V);return V;});
    for(let q=0;q+1<tris.length;q++){const A=Wv[q],B=Wv[q+1];for(let i=0;i<3;i++)for(let j=0;j<3;j++)if(same(A[i],B[(j+1)%3])&&same(A[(i+1)%3],B[j]))s._bind(units[q],i,NEXT,units[q+1],j,PREV);}
    units.forEach(u=>s.setType(u,'---'));
    let fi=0;for(const u of units){const r=s._roles(u);if(r.role===SFACE){s.glue[u*3+r.free]=gcode(f.faces[fi++]||'-');}
      else if(r.role===SBACK&&f.backs)s.glue[u*3+r.free]=gcode(f.backs);}
    if(f.caps!==false){s.cap[units[0]]=1;s.cap[units[units.length-1]]=1;}
    placed.push(...units);out.founders.push(units);});
  for(const st of structures){const units=st.tris.map(()=>next++);buildStructure(s,units,st.tris,st.x,st.y,st.rot||0);placed.push(...units);out.structures.push(units);}
  const types=Object.entries(supply).flatMap(([t,c])=>Array(c).fill(t));
  for(const t of types){const u=next++;let ok=false;s.setType(u,t);
    for(let a=0;a<5000&&!ok;a++){s.px[u]=size*s.rng();s.py[u]=size*s.rng();s.pa[u]=2*Math.PI*s.rng();s._resetShape(u);
      ok=placed.every(v=>{const dx=s._dx(s.px[v]-s.px[u]),dy=s._dy(s.py[v]-s.py[u]);return Math.hypot(dx,dy)>2||overlap(s._outline(u),s._outline(v,dx,dy))<1e-10;});}
    if(!ok)throw Error('could not place');placed.push(u);}
  s.bondsDirty=true;for(let k=0;k<40;k++)s._derive3();
  return out;
}
// Read-only census: strands with their face glue sequence (read along the strand) and gap string.
function typedCensus(s){
  s._tri();const seen=new Set(),out=[];
  for(let u=0;u<s.n;u++){if(seen.has(u))continue;const e=s._edges(u);if(e.prev>=0||e.next<0)continue;
    const units=[];let x=u,guard=0;while(x>=0&&!seen.has(x)&&guard++<500){seen.add(x);units.push(x);const r=s._edges(x);x=r.next>=0?s._partner(x,r.next):-1;}
    let faces='',gaps='',c=null;
    for(const v of units){const r=s._roles(v);if(r.role===SFACE||r.role===DOCKED){faces+=gname(s.glue[v*3+(r.role===DOCKED?r.face:r.free)]);if(c!==null)gaps+=c;c=0;}else if(c!==null)c++;}
    out.push({units,faces,gaps,n:units.length,paired:units.some(v=>s._edges(v).face>=0)});}
  return out;
}
const typeCount=s=>{const m={};for(let u=0;u<s.n;u++){const k=canon(typeName(s,u));m[k]=(m[k]||0)+1;}return m;};

// ---------------- pictures ----------------
const PAL=['#e6194b','#3cb44b','#ffe119','#4363d8','#f58231','#911eb4','#46f0f0','#f032e6','#bcf60c','#fabebe','#008080','#e6beff'];
const gcol=g=>g===0?'#56646e':PAL[((g-1)>>1)%PAL.length];
function render(s,out,title,focus=null,labels=false){
  s._tri();const W=s.p.W,S=560;let k=S/W,fx=0,fy=0;const keep=new Set();
  if(focus){const u0=focus.units[0];let sx=0,sy=0;for(const u of focus.units){sx+=s._dx(s.px[u]-s.px[u0]);sy+=s._dy(s.py[u]-s.py[u0]);}
    fx=s.px[u0]+sx/focus.units.length;fy=s.py[u0]+sy/focus.units.length;
    for(let u=0;u<s.n;u++)if(Math.hypot(s._dx(s.px[u]-fx),s._dy(s.py[u]-fy))<focus.radius*1.5)keep.add(u);k=S/(2*focus.radius);}
  const svg=[`<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S+30}"><rect width="${S}" height="${S+30}" fill="#f5f7f8"/><rect width="${S}" height="${S}" fill="#15222d"/>`];
  // world y up is drawn up (flip), so counter-clockwise reads counter-clockwise on the page
  const X0=u=>focus?s._dx(s.px[u]-fx)+focus.radius:((s.px[u])%W+W)%W,Y0=u=>focus?focus.radius-s._dy(s.py[u]-fy):W-((s.py[u])%W+W)%W;
  for(let u=0;u<s.n;u++){if(focus&&!keep.has(u))continue;const r=s._roles(u);
    const P=q=>[(X0(u)+s.ox[u*NV+q])*k,(Y0(u)-s.oy[u*NV+q])*k];
    const fill=r.role===DOCKED?'#9fd8cf':r.role===SFACE?'#f6cf8a':r.role===SBACK?(r.fill?'#3f9e8f':'#c98f2e'):r.role===GROWN?'#8a9bb0':'#3a4852';
    svg.push(`<polygon points="${[0,1,2].map(q=>P(q).map(z=>z.toFixed(1)).join(',')).join(' ')}" fill="${fill}" stroke="#1b2a33" stroke-width="0.8"/>`);
    // glue marks: a coloured bar along each glued side (letters when zoomed)
    const c=[[0,1,2].reduce((a,q)=>a+P(q)[0],0)/3,[0,1,2].reduce((a,q)=>a+P(q)[1],0)/3];
    for(let i=0;i<3;i++){const g=s.glue[u*3+i];if(!g&&!s.hing[u*3+i])continue;const a=P(i),b=P((i+1)%3),sh=0.22;
      const A=[a[0]+(c[0]-a[0])*sh,a[1]+(c[1]-a[1])*sh],B=[b[0]+(c[0]-b[0])*sh,b[1]+(c[1]-b[1])*sh];
      if(g)svg.push(`<line x1="${A[0].toFixed(1)}" y1="${A[1].toFixed(1)}" x2="${B[0].toFixed(1)}" y2="${B[1].toFixed(1)}" stroke="${gcol(g)}" stroke-width="${focus?4:2}" stroke-dasharray="${g%2?'':'3,2'}"/>`);
      if(s.hing[u*3+i]){const h=s.hing[u*3+i]===1?A:B;svg.push(`<circle cx="${h[0].toFixed(1)}" cy="${h[1].toFixed(1)}" r="${focus?5:2}" fill="#fff"/>`);}
      if(labels&&g){const m=[(A[0]+B[0])/2*0.7+c[0]*0.3,(A[1]+B[1])/2*0.7+c[1]*0.3];svg.push(`<text x="${m[0].toFixed(1)}" y="${(m[1]+5).toFixed(1)}" font-family="Arial" font-weight="bold" font-size="${Math.max(9,k*0.22).toFixed(0)}" text-anchor="middle" fill="#fff">${gname(g)}</text>`);}}}
  svg.push(`<text x="8" y="${S+20}" font-family="Arial" font-size="13" fill="#233542">${title}</text></svg>`);
  const svgf=out.replace(/\.png$/,'.svg');fs.writeFileSync(svgf,svg.join('\n'));
  const chrome=fs.readdirSync('/opt/pw-browsers').filter(d=>d.startsWith('chromium')).map(d=>`/opt/pw-browsers/${d}/chrome-linux/chrome`).find(fs.existsSync);
  execFileSync(chrome,['--headless','--no-sandbox','--disable-gpu','--hide-scrollbars',`--screenshot=${path.resolve(out)}`,`--window-size=${S},${S+30+90}`,'file://'+path.resolve(svgf)],{stdio:'ignore'});
  fs.unlinkSync(svgf);
  fs.writeFileSync(out.replace(/\.png$/,'.json.gz'),zlib.gzipSync(JSON.stringify(s.saveState())));
}

// ---------------- the casting pocket (prepared frame) ----------------
// Lattice: the pocket is a side-2 triangle (0,0),(2,0),(1,2H); the target ends in its centre. Two casters are fixed in
// the frame (both outer sides bonded). The third is a hatch hinged at V = (1.5,H), the corner it shares with the
// centre: it waits flush against its hinge partner H (open), with its catch side facing the upper slot, which is open to
// the outside. A target caught there triggers the hatch: it swings 60 degrees and carries the target into the centre,
// where the target binds both fixed casters; the cast releases it, the catch side is free again and the hatch swings
// back open. The fixed casters' recognition sides are close-only, so only the hatch catches.
// Casters: recognition A, then activator K, then instruction x (counter-clockwise).
function pocket(instr='bcd',recog='A'){
  const [p,q,r]=[...instr],R=recog,P=gname(comp(gcode(p))),Q=gname(comp(gcode(q)));
  return [
    {v:[[0,0],[1,0],[0.5,H]],type:`${p}${R}.K`},                               // N0: bottom instruction p, inner A, left-lower K
    {v:[[1,0],[2,0],[1.5,H]],type:`K${q}${R}.`},                               // N1: bottom-right K, right-lower instruction q, inner A
    {v:[[1.5,H],[2,2*H],[1,2*H]],type:`K<${r}${R}`},                          // hatch (open): hinge K on H (pin V), top instruction r, catch A
    {v:[[1.5,H],[2.5,H],[2,2*H]],type:'--k'},                                 // H: the hatch's hinge partner (k)
    {v:[[2,0],[2.5,H],[1.5,H]],type:`--${Q}`},                                // holds N1's instruction side
    {v:[[1,0],[1.5,-H],[2,0]],type:'--k'},                                    // k under N1
    {v:[[0,0],[0.5,-H],[1,0]],type:`--${P}`},                                 // holds N0's instruction side
    {v:[[0,0],[0.5,H],[-0.5,H]],type:'k--'},                                  // k beside N0
    {v:[[1,0],[0.5,-H],[1.5,-H]],type:'---'},                                 // connector under the pocket
    {v:[[0,0],[-0.5,H],[-1,0]],type:'---'},{v:[[0,0],[-1,0],[-0.5,-H]],type:'---'},{v:[[0,0],[-0.5,-H],[0.5,-H]],type:'---'},   // fan at (0,0)
    {v:[[2,0],[1.5,-H],[2.5,-H]],type:'---'},{v:[[2,0],[2.5,-H],[3,0]],type:'---'},{v:[[2,0],[3,0],[2.5,H]],type:'---'},         // fan at (2,0)
  ];
}

function run(s,steps,stem,every,focus,labels,extra=()=>''){
  const t0=Date.now();render(s,`${stem}_t0.png`,`${path.basename(stem)} t=0`,focus,labels);
  for(let t=1;t<=steps;t++){s.step();
    if(t%Math.max(1,steps/10|0)===0){const c=typedCensus(s).filter(x=>x.n>1);
      console.log(`t=${t} strands=${c.length} [${c.map(q=>q.faces+'/'+q.gaps+(q.paired?'*':'')).join(' ')}] dock=${s.dockEvents||0} fill=${s.fillEvents||0} release=${s.releaseEvents||0} glue=${s.glueEvents||0} cast=${s.castEvents||0} ${extra(s)} ${((Date.now()-t0)/t).toFixed(1)}ms/step`);}
    if(every&&t%every===0)render(s,`${stem}_t${t}.png`,`${path.basename(stem)} t=${t}`,focus,labels);}
  render(s,`${stem}.png`,`${path.basename(stem)} t=${steps}`,focus,labels);
}
if(require.main===module){const [cmd,seed='1',steps='3000',stem='experiments/scratch/typed',...rest]=process.argv.slice(2);
  if(cmd==='copy'){
    // a typed founder: faces a,b,a,a,b,b over the alphabet {a,b}; dockers for both strands, inert fillers
    const {s}=createTypedWorld({seed:+seed,size:18,founders:[{gaps:[1,0,2,1,1],faces:'abaabb'}],
      supply:{'A--':14,'B--':14,'a--':14,'b--':14,'---':50}});
    run(s,+steps,stem,0,null,false);}
  if(cmd==='pocket'){
    const tris=pocket(rest[0]||'bcd');
    const {s,structures}=createTypedWorld({seed:+seed,size:14,structures:[{tris,x:7,y:7}],supply:{'aaa':16,'---':20}});
    run(s,+steps,stem,+steps/4|0,{units:structures[0],radius:5},true,s=>JSON.stringify(typeCount(s)));
    console.log('casts',JSON.stringify((s.castLog||[]).slice(0,10)));}
}
module.exports={TypedSim,createTypedWorld,typedCensus,typeCount,render,pocket,parseType,typeName,canon,gcode,gname,comp,GLUE,buildStructure};
