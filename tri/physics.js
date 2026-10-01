'use strict';
// Rigid-part physics for unit triangles on a torus (all blocks are the same regular triangle, side 1).
//   state   centre (px, py) and angle pa per triangle; the corner offsets (ox, oy) always follow from pa (rigid blocks)
//   bonds   bond[u*3+i] = v*3+j: side i of u is joined to side j of v (-1: free); hinge[u*3+i] marks a hinged side
//           (1: it pins its first corner, 2: its second). Bonded blocks are flush by construction: binding places them
//           (sim.js), and nothing deforms afterwards.
//   parts   a body is the set of blocks joined by bonds (hinged ones included); it moves and turns as one rigid piece.
//           A hinged flap turns relative to its partner only when the chemistry drives it (sim.js servo, via tryMove).
//   motion  every step each body, in random order, proposes a Brownian kick (translation and turn; a larger body gets a
//           smaller kick) and moves along it in short sub-steps until the next sub-step would overlap another block:
//           move or stop. Nothing overlaps, deforms, squeezes or passes through a wall. A body that does overlap (binding
//           just placed it) may make any move that reduces its overlap.
// Locality: nothing here reads chemistry; the chemistry (sim.js) reads `pairs` (blocks near enough to bond).
const R3=1/Math.sqrt(3);
const REST=[[R3*Math.cos(-Math.PI/3),R3*Math.sin(-Math.PI/3)],[R3*Math.cos(Math.PI/3),R3*Math.sin(Math.PI/3)],[-R3,0]];   // counter-clockwise; side 0 faces +x
const AREA=Math.sqrt(3)/4,INERTIA=AREA/12,SIZE=Math.sqrt(AREA);   // unit density: mass = area; moment about the centroid = area * side^2 / 12
const DEFAULTS={seed:1,W:18,H:18,sigma:0.3,sigmaRot:0.45,pairTol:0.35,subStep:0.8,direct:1.0,bisect:1,skin:0,split:true};
const EPS=1e-10,TOUCH=1e-6,CELL=1.4,NEAR2=(2*R3)*(2*R3),IN2=(R3-1e-4)*(R3-1e-4);   // IN2: (two inradii)^2, a little less   // overlaps below TOUCH count as touching; CELL >= reach of overlap and pair checks

function mulberry32(seed){let a=seed|0;const f=()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
  f.getState=()=>a;f.setState=s=>{a=s|0;};return f;}
// minimum translation of convex polygon b out of convex polygon a (null if they do not overlap)
function separation(a,b){let best=null;
  for(const ps of [a,b])for(let k=0;k<ps.length;k++){const p=ps[k],q=ps[(k+1)%ps.length],dx=q[0]-p[0],dy=q[1]-p[1],d=Math.hypot(dx,dy);if(d<EPS)continue;
    const nx=dy/d,ny=-dx/d;let amax=-Infinity,amin=Infinity,bmax=-Infinity,bmin=Infinity;
    for(const c of a){const v=c[0]*nx+c[1]*ny;if(v>amax)amax=v;if(v<amin)amin=v;}for(const c of b){const v=c[0]*nx+c[1]*ny;if(v>bmax)bmax=v;if(v<bmin)bmin=v;}
    const plus=amax-bmin,minus=bmax-amin;if(plus<=EPS||minus<=EPS)return null;
    const depth=Math.min(plus,minus),sign=plus<=minus?1:-1;if(!best||depth<best.depth)best={depth,x:sign*nx*depth,y:sign*ny*depth};}
  return best;}
// penetration depth of two triangles (flat corner arrays A, B of length 6), 0 if they only touch or are apart
function triDepth(A,B){let best=Infinity;
  for(let w=0;w<2;w++){const P=w?B:A;for(let k=0;k<3;k++){const k1=k===2?0:k+1,ex=P[2*k1]-P[2*k],ey=P[2*k1+1]-P[2*k+1],d=Math.hypot(ex,ey),nx=ey/d,ny=-ex/d;
    let amax=-Infinity,amin=Infinity,bmax=-Infinity,bmin=Infinity;
    for(let c=0;c<6;c+=2){const a=A[c]*nx+A[c+1]*ny,b=B[c]*nx+B[c+1]*ny;if(a>amax)amax=a;if(a<amin)amin=a;if(b>bmax)bmax=b;if(b<bmin)bmin=b;}
    const depth=Math.min(amax-bmin,bmax-amin);if(depth<=SKIN.v)return 0;if(depth<best)best=depth;}}
  return best;}
const SKIN={v:TOUCH};
const TA=new Float64Array(6),TB=new Float64Array(6);

class Physics{
  constructor(params={},n=params.n||0){
    this.p={...DEFAULTS,...params};this.n=n;this.t=0;this.rng=mulberry32(this.p.seed);this._spare=NaN;
    this.px=new Float64Array(n);this.py=new Float64Array(n);this.pa=new Float64Array(n);
    this.ox=new Float64Array(3*n);this.oy=new Float64Array(3*n);this.bond=new Int32Array(3*n).fill(-1);this.hinge=new Int8Array(3*n);
    this.pairs=[];this._mark=new Int32Array(n);this._stamp=0;
    for(let u=0;u<n;u++)this.resetShape(u);
  }
  // ---- torus and random numbers
  _dx(d){const W=this.p.W;return d-W*Math.round(d/W);}
  _dy(d){const H=this.p.H;return d-H*Math.round(d/H);}
  _wx(x){const W=this.p.W;return ((x%W)+W)%W;}
  _wy(y){const H=this.p.H;return ((y%H)+H)%H;}
  _gauss(){if(this._spare===this._spare){const g=this._spare;this._spare=NaN;return g;}
    let x,y,q;do{x=2*this.rng()-1;y=2*this.rng()-1;q=x*x+y*y;}while(q>=1||q===0);const f=Math.sqrt(-2*Math.log(q)/q);this._spare=y*f;return x*f;}
  // ---- geometry of one block
  resetShape(u){const c=Math.cos(this.pa[u]),s=Math.sin(this.pa[u]);for(let k=0;k<3;k++){const [x,y]=REST[k];this.ox[u*3+k]=c*x-s*y;this.oy[u*3+k]=s*x+c*y;}}
  rigidMove(u,dx,dy,da){this.px[u]+=dx;this.py[u]+=dy;if(da!==0){this.pa[u]+=da;this.resetShape(u);}}
  angle(u){return Math.atan2(this.oy[u*3],this.ox[u*3]);}   // orientation read from the corners (rest corner 0 is at -60 degrees)
  outline(u,x=0,y=0){return [0,1,2].map(k=>[x+this.ox[u*3+k],y+this.oy[u*3+k]]);}
  radius(){return R3;}
  // side i of u faces side j of v: corner i of u meets corner j+1 of v and corner i+1 meets corner j; largest gap
  flushGap(u,i,v,j){const dx=this._dx(this.px[v]-this.px[u]),dy=this._dy(this.py[v]-this.py[u]),a0=u*3+i,a1=u*3+(i+1)%3,b0=v*3+j,b1=v*3+(j+1)%3;
    return Math.max(Math.hypot(dx+this.ox[b1]-this.ox[a0],dy+this.oy[b1]-this.oy[a0]),Math.hypot(dx+this.ox[b0]-this.ox[a1],dy+this.oy[b0]-this.oy[a1]));}
  // ---- bonds
  link(u,i,v,j){this.bond[u*3+i]=v*3+j;this.bond[v*3+j]=u*3+i;}
  unlink(u,i){const q=this.bond[u*3+i];if(q<0)return;this.bond[q]=-1;this.bond[u*3+i]=-1;}
  partner(u,i){const q=this.bond[u*3+i];return q<0?-1:(q/3)|0;}
  bonded(u){return this.bond[u*3]>=0||this.bond[u*3+1]>=0||this.bond[u*3+2]>=0;}
  isHingeBond(u,i){const q=this.bond[u*3+i];return q>=0&&(this.hinge[u*3+i]>0||this.hinge[q]>0);}
  // bodies: components through bonds (hinged bonds included)
  bodies(){const n=this.n,comp=new Int32Array(n).fill(-1),members=[];
    for(let u=0;u<n;u++){if(comp[u]>=0)continue;const id=members.length,list=[u];comp[u]=id;
      for(let k=0;k<list.length;k++){const x=list[k];for(let i=0;i<3;i++){const q=this.bond[x*3+i];if(q<0)continue;const y=(q/3)|0;if(comp[y]<0){comp[y]=id;list.push(y);}}}
      members.push(list);}
    return {comp,members};}
  // the body of u (blocks reachable through bonds)
  bodyOf(u){const list=[u],seen=new Set(list);for(let k=0;k<list.length;k++){const x=list[k];for(let i=0;i<3;i++){const q=this.bond[x*3+i];if(q<0)continue;const y=(q/3)|0;if(!seen.has(y)){seen.add(y);list.push(y);}}}return list;}
  // ---- cell grid of block centres (rebuilt each step; kept current by tryMove)
  gridSync(){const W=this.p.W,H=this.p.H,gx=Math.max(1,Math.floor(W/CELL)),gy=Math.max(1,Math.floor(H/CELL));
    this._gx=gx;this._gy=gy;this._cw=W/gx;this._ch=H/gy;this._all=gx<3||gy<3;
    if(!this._cells||this._cells.length!==gx*gy)this._cells=Array.from({length:gx*gy},()=>[]);else for(const c of this._cells)c.length=0;
    if(!this._cellOf||this._cellOf.length!==this.n)this._cellOf=new Int32Array(this.n);
    for(let u=0;u<this.n;u++){const c=this._cellAt(this.px[u],this.py[u]);this._cellOf[u]=c;this._cells[c].push(u);}}
  _cellAt(x,y){return Math.min(this._gy-1,Math.floor(this._wy(y)/this._ch))*this._gx+Math.min(this._gx-1,Math.floor(this._wx(x)/this._cw));}
  _regrid(u){const c=this._cellAt(this.px[u],this.py[u]),o=this._cellOf[u];if(c===o)return;const L=this._cells[o],k=L.indexOf(u);if(k>=0)L.splice(k,1);this._cells[c].push(u);this._cellOf[u]=c;}
  // visit blocks whose centres may lie within reach of (x, y)
  _around(x,y,fn){if(this._all){for(let v=0;v<this.n;v++)fn(v);return;}
    const cx=Math.min(this._gx-1,Math.floor(this._wx(x)/this._cw)),cy=Math.min(this._gy-1,Math.floor(this._wy(y)/this._ch));
    for(let b=-1;b<=1;b++)for(let a=-1;a<=1;a++){const L=this._cells[((cy+b+this._gy)%this._gy)*this._gx+(cx+a+this._gx)%this._gx];for(let k=0;k<L.length;k++)fn(L[k]);}}
  // total overlap of the marked blocks (relative offsets rx, ry from pivot (cx, cy)) moved by (tx, ty) and turned by da
  // about the pivot, against unmarked blocks; early: stop at the first overlap (then the value is only > 0)
  _overlap(list,rx,ry,cx,cy,tx,ty,da,st,early){const c=Math.cos(da),s=Math.sin(da),mark=this._mark,{px,py,ox,oy}=this,W=this.p.W,Hh=this.p.H;
    const gx=this._gx,gy=this._gy,cw=this._cw,ch=this._ch,cells=this._cells,all=this._all;let sum=0;
    for(let k=0;k<list.length;k++){const u=list[k],x=cx+c*rx[k]-s*ry[k]+tx,y=cy+s*rx[k]+c*ry[k]+ty;let built=false;
      const gxi=Math.min(gx-1,Math.floor((((x%W)+W)%W)/cw)),gyi=Math.min(gy-1,Math.floor((((y%Hh)+Hh)%Hh)/ch));
      for(let b=-1;b<=1;b++)for(let a=-1;a<=1;a++){if(all&&(a||b))continue;
        const L=all?null:cells[((gyi+b+gy)%gy)*gx+(gxi+a+gx)%gx],m=all?this.n:L.length;
        for(let q=0;q<m;q++){const v=all?q:L[q];if(mark[v]===st)continue;
          let dx=px[v]-x,dy=py[v]-y;dx-=W*Math.round(dx/W);dy-=Hh*Math.round(dy/Hh);const d2=dx*dx+dy*dy;if(d2>=NEAR2)continue;
          if(early&&d2<IN2)return 1;   // centres closer than two inradii: certainly overlapping
          if(!built){for(let e=0;e<3;e++){const ax=ox[u*3+e],ay=oy[u*3+e];TA[2*e]=c*ax-s*ay;TA[2*e+1]=s*ax+c*ay;}built=true;}
          for(let e=0;e<3;e++){TB[2*e]=dx+ox[v*3+e];TB[2*e+1]=dy+oy[v*3+e];}const dd=triDepth(TA,TB);if(dd>0){if(early)return dd;sum+=dd;}}}}
    return sum;}
  // move the blocks of `list` rigidly by (tx, ty) and a turn da about (cx, cy), in sub-steps, as far as they go without
  // overlapping unlisted blocks; returns the fraction moved (0: blocked). An overlapping set may move if that reduces it.
  tryMove(list,tx,ty,da,cx,cy){if(!this._cells)this.gridSync();SKIN.v=Math.max(TOUCH,this.p.skin);const st=++this._stamp,k=list.length,rx=new Float64Array(k),ry=new Float64Array(k);let reach=0;
    for(let q=0;q<k;q++){const u=list[q];this._mark[u]=st;rx[q]=this._dx(this.px[u]-cx);ry[q]=this._dy(this.py[u]-cy);reach=Math.max(reach,Math.hypot(rx[q],ry[q])+R3);}
    const dist=Math.max(Math.hypot(tx,ty),reach*Math.abs(da));let f=0;
    // a move short enough that it cannot pass through a one-row wall (that needs 1.44: the wall plus two inradii)
    // whose destination is clear is taken at once
    const tried=dist<=this.p.direct;if(tried&&this._overlap(list,rx,ry,cx,cy,tx,ty,da,st,true)===0)f=1;
    const nsub=f===1?0:Math.max(1,Math.ceil(dist/this.p.subStep));
    let blocked=-1;for(let q=1;q<=nsub;q++){const g=q/nsub;if((g===1&&tried)||this._overlap(list,rx,ry,cx,cy,g*tx,g*ty,g*da,st,true)>0){blocked=g;break;}f=g;}   // the full move was already found blocked
    // blocked: close in on the contact (bisection), so a body ends up touching what stopped it
    if(blocked>0)for(let b=0;b<this.p.bisect;b++){const g=(f+blocked)/2;if(this._overlap(list,rx,ry,cx,cy,g*tx,g*ty,g*da,st,true)>0)blocked=g;else f=g;}
    if(f===0){const d0=this._overlap(list,rx,ry,cx,cy,0,0,0,st,false);if(d0>0&&this._overlap(list,rx,ry,cx,cy,tx,ty,da,st,false)<d0-EPS)f=1;}
    if(f===0)return 0;
    const c=Math.cos(f*da),s=Math.sin(f*da);
    for(let q=0;q<k;q++){const u=list[q];this.px[u]=this._wx(cx+c*rx[q]-s*ry[q]+f*tx);this.py[u]=this._wy(cy+s*rx[q]+c*ry[q]+f*ty);
      if(da!==0){this.pa[u]+=f*da;this.resetShape(u);}this._regrid(u);}
    return f;}
  // overlap the blocks of `list` would have after a rigid move (translation, turn da about (cx, cy)); for placing checks
  moveDepth(list,tx,ty,da,cx,cy){if(!this._cells)this.gridSync();SKIN.v=Math.max(TOUCH,this.p.skin);const st=++this._stamp,k=list.length,rx=new Float64Array(k),ry=new Float64Array(k);
    for(let q=0;q<k;q++){const u=list[q];this._mark[u]=st;rx[q]=this._dx(this.px[u]-cx);ry[q]=this._dy(this.py[u]-cy);}
    return this._overlap(list,rx,ry,cx,cy,tx,ty,da,st,true);}
  // ---- motion: every body proposes a Brownian kick (a body: the mean of its blocks' kicks, turned by their torque)
  _jostle(){const p=this.p,{px,py}=this,w=1/AREA,wr=1/INERTIA,sw=Math.sqrt(w),spin=p.sigmaRot*w,{members}=this.bodies();
    for(let k=members.length-1;k>0;k--){const j=Math.floor(this.rng()*(k+1));const t=members[k];members[k]=members[j];members[j]=t;}
    for(const list of members){const m=list.length,u0=list[0];
      if(m===1){const tx=p.sigma*sw*this._gauss(),ty=p.sigma*sw*this._gauss(),da=spin*this._gauss();
        if(p.split){this.tryMove(list,tx,ty,0,px[u0],py[u0]);this.tryMove(list,0,0,da,px[u0],py[u0]);}else this.tryMove(list,tx,ty,da,px[u0],py[u0]);continue;}
      let cx=0,cy=0;const rx=new Float64Array(m),ry=new Float64Array(m);
      for(let q=0;q<m;q++){rx[q]=this._dx(px[list[q]]-px[u0]);ry[q]=this._dy(py[list[q]]-py[u0]);cx+=rx[q];cy+=ry[q];}cx/=m;cy/=m;
      let inertia=0,tq=0;const ib=1/wr;
      for(let q=0;q<m;q++){const r2=(rx[q]-cx)**2+(ry[q]-cy)**2;inertia+=r2+ib;tq+=r2*p.sigma*p.sigma*w+ib*ib*spin*spin;}
      const st=p.sigma*Math.sqrt(m*w)/m,sr=Math.sqrt(tq)/inertia;
      const tx=st*this._gauss(),ty=st*this._gauss(),da=sr*this._gauss();
      if(p.split){this.tryMove(list,tx,ty,0,px[u0]+cx,py[u0]+cy);this.tryMove(list,0,0,da,px[list[0]]+this._dx(cx),py[list[0]]+this._dy(cy));}else this.tryMove(list,tx,ty,da,px[u0]+cx,py[u0]+cy);}}
  // blocks near enough to bond (centre distance within two radii plus pairTol)
  _pairs(){const reach=2*R3+this.p.pairTol*SIZE+EPS,r2=reach*reach,out=this.pairs,cand=[];out.length=0;
    for(let u=0;u<this.n;u++){cand.length=0;
      this._around(this.px[u],this.py[u],v=>{if(v<=u)return;const dx=this._dx(this.px[v]-this.px[u]),dy=this._dy(this.py[v]-this.py[u]);if(dx*dx+dy*dy<=r2)cand.push(v);});
      cand.sort((a,b)=>a-b);for(const v of cand)out.push(u,v);}
    return out;}
  physics(){this.gridSync();this._jostle();this._pairs();}
  regrid(u){if(this._cells)this._regrid(u);}
  // ---- state
  saveState(){const arrays={},nums={};
    for(const k of Object.keys(this)){const v=this[k];if(k.startsWith('_')||k==='p'||k==='pairs')continue;
      if(ArrayBuffer.isView(v))arrays[k]={t:v.constructor.name,a:Array.from(v)};else if(typeof v==='number')nums[k]=v;}
    return {p:this.p,n:this.n,rng:this.rng.getState(),spare:Number.isNaN(this._spare)?null:this._spare,arrays,nums};}
  static fromState(st){const s=new this(st.p,st.n);const T={Float64Array,Int32Array,Int8Array,Uint8Array,Int16Array};
    for(const k in st.arrays)s[k]=T[st.arrays[k].t].from(st.arrays[k].a);for(const k in st.nums)s[k]=st.nums[k];
    s.rng.setState(st.rng);s._spare=st.spare===null?NaN:st.spare;return s;}
}
module.exports={Physics,REST,AREA,SIZE,DEFAULTS,separation,triDepth,mulberry32};
