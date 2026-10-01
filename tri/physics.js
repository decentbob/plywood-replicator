'use strict';
// Polygon physics for unit triangles on a torus (all blocks are the same regular triangle, side 1).
//   state   centre (px, py), angle pa, corner offsets (ox, oy) per triangle; corners are soft (stiffness `stiff`)
//   bonds   bond[u*3+i] = v*3+j: side i of u is joined to side j of v (-1: free). A bond pins the two corner pairs
//           of the shared side together; a hinged side (hinge[u*3+i] = 1: its first corner, 2: its second) pins one
//           corner only, so the partner swings about it, and hinged pairs still collide.
//   motion  Brownian jostling of bodies (a body = blocks joined by bonds, moved and turned as one rigid body; a free
//           block alone), then `iters` constraint passes: polygon contacts (minimum translation), pins (rigid share plus
//           corner deformation by softness) and shape matching of bonded blocks back toward their rest shape.
//   no tunnelling  a jostle kick can exceed a thin wall (kicks reach about 1.8 at sigma 0.3, a one-row wall is 0.87
//           thick): after the jostle, a body whose block-centre path enters a block of another bonded structure is
//           moved only 1/2 or 1/4 of the way (translation, orientation kept), or not at all.
// Locality: nothing here reads chemistry; the chemistry (sim.js) reads `pairs` (blocks near enough to bond).
const R3=1/Math.sqrt(3);
const REST=[[R3*Math.cos(-Math.PI/3),R3*Math.sin(-Math.PI/3)],[R3*Math.cos(Math.PI/3),R3*Math.sin(Math.PI/3)],[-R3,0]];   // counter-clockwise; side 0 faces +x
const AREA=Math.sqrt(3)/4,INERTIA=AREA/12,SIZE=Math.sqrt(AREA);   // unit density: mass = area; moment about the centroid = area * side^2 / 12
const DEFAULTS={seed:1,W:18,H:18,sigma:0.3,sigmaRot:0.45,stiff:0.8,iters:32,pairTol:0.35,noTunnel:true};
const EPS=1e-10;

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
// separation() for two triangles given by corner offsets (ox, oy at a and b), the second displaced by (dx, dy); no
// allocation, same arithmetic
const SA=new Float64Array(6),SB=new Float64Array(6);
function sepTri(ox,oy,a,b,dx,dy){for(let k=0;k<3;k++){SA[2*k]=0+ox[a+k];SA[2*k+1]=0+oy[a+k];SB[2*k]=dx+ox[b+k];SB[2*k+1]=dy+oy[b+k];}
  let bd=Infinity,bx=0,by=0,found=false;
  for(let w=0;w<2;w++){const P=w?SB:SA;for(let k=0;k<3;k++){const k1=(k+1)%3,ex=P[2*k1]-P[2*k],ey=P[2*k1+1]-P[2*k+1],d=Math.hypot(ex,ey);if(d<EPS)continue;
    const nx=ey/d,ny=-ex/d;let amax=-Infinity,amin=Infinity,bmax=-Infinity,bmin=Infinity;
    for(let c=0;c<3;c++){const v=SA[2*c]*nx+SA[2*c+1]*ny;if(v>amax)amax=v;if(v<amin)amin=v;}for(let c=0;c<3;c++){const v=SB[2*c]*nx+SB[2*c+1]*ny;if(v>bmax)bmax=v;if(v<bmin)bmin=v;}
    const plus=amax-bmin,minus=bmax-amin;if(plus<=EPS||minus<=EPS)return null;
    const depth=Math.min(plus,minus),sign=plus<=minus?1:-1;if(!found||depth<bd){found=true;bd=depth;bx=sign*nx*depth;by=sign*ny*depth;}}}
  return {depth:bd,x:bx,y:by};}
// segment a-b against segment c-d
function segX(ax,ay,bx,by,cx,cy,dx,dy){const d=(bx-ax)*(dy-cy)-(by-ay)*(dx-cx);if(Math.abs(d)<1e-12)return false;
  const t=((cx-ax)*(dy-cy)-(cy-ay)*(dx-cx))/d,w=((cx-ax)*(by-ay)-(cy-ay)*(bx-ax))/d;return t>=0&&t<=1&&w>=0&&w<=1;}

class Physics{
  constructor(params={},n=params.n||0){
    this.p={...DEFAULTS,...params};this.n=n;this.t=0;this.rng=mulberry32(this.p.seed);this._spare=NaN;
    this.px=new Float64Array(n);this.py=new Float64Array(n);this.pa=new Float64Array(n);
    this.ox=new Float64Array(3*n);this.oy=new Float64Array(3*n);this.bond=new Int32Array(3*n).fill(-1);this.hinge=new Int8Array(3*n);
    this.pairs=[];this.pins=[];this.bondsDirty=true;
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
  rigidMove(u,dx,dy,da){this.px[u]+=dx;this.py[u]+=dy;if(da===0)return;this.pa[u]+=da;const c=Math.cos(da),s=Math.sin(da);
    for(let k=u*3;k<u*3+3;k++){const x=this.ox[k],y=this.oy[k];this.ox[k]=c*x-s*y;this.oy[k]=s*x+c*y;}}
  angle(u){return Math.atan2(this.oy[u*3],this.ox[u*3]);}   // orientation read from the corners (rest corner 0 is at -60 degrees)
  outline(u,x=0,y=0){return [0,1,2].map(k=>[x+this.ox[u*3+k],y+this.oy[u*3+k]]);}
  radius(u){let r=0;for(let k=u*3;k<u*3+3;k++)r=Math.max(r,Math.hypot(this.ox[k],this.oy[k]));return r;}
  // side i of u faces side j of v: corner i of u meets corner j+1 of v and corner i+1 meets corner j; largest gap
  flushGap(u,i,v,j){const dx=this._dx(this.px[v]-this.px[u]),dy=this._dy(this.py[v]-this.py[u]),a0=u*3+i,a1=u*3+(i+1)%3,b0=v*3+j,b1=v*3+(j+1)%3;
    return Math.max(Math.hypot(dx+this.ox[b1]-this.ox[a0],dy+this.oy[b1]-this.oy[a0]),Math.hypot(dx+this.ox[b0]-this.ox[a1],dy+this.oy[b0]-this.oy[a1]));}
  // ---- bonds
  link(u,i,v,j){this.bond[u*3+i]=v*3+j;this.bond[v*3+j]=u*3+i;this.bondsDirty=true;}
  unlink(u,i){const q=this.bond[u*3+i];if(q<0)return;this.bond[q]=-1;this.bond[u*3+i]=-1;this.bondsDirty=true;}
  partner(u,i){const q=this.bond[u*3+i];return q<0?-1:(q/3)|0;}
  bonded(u){return this.bond[u*3]>=0||this.bond[u*3+1]>=0||this.bond[u*3+2]>=0;}
  isHingeBond(u,i){const q=this.bond[u*3+i];return q>=0&&(this.hinge[u*3+i]>0||this.hinge[q]>0);}
  _pinList(){if(!this.bondsDirty)return this.pins;const P=this.pins;P.length=0;
    for(let q=0;q<3*this.n;q++){const r=this.bond[q];if(r<=q)continue;const u=(q/3)|0,i=q%3,v=(r/3)|0,j=r%3,a0=u*3+i,a1=u*3+(i+1)%3,b0=v*3+j,b1=v*3+(j+1)%3;
      const hu=this.hinge[q],hv=this.hinge[r];
      if(hu===1||hv===2)P.push(a0,b1);else if(hu===2||hv===1)P.push(a1,b0);else P.push(a0,b1,a1,b0);}
    this.bondsDirty=false;return P;}
  // bodies: components through bonds (hinged bonds included)
  bodies(){const n=this.n,comp=new Int32Array(n).fill(-1),members=[];
    for(let u=0;u<n;u++){if(comp[u]>=0)continue;const id=members.length,list=[u];comp[u]=id;
      for(let k=0;k<list.length;k++){const x=list[k];for(let i=0;i<3;i++){const q=this.bond[x*3+i];if(q<0)continue;const y=(q/3)|0;if(comp[y]<0){comp[y]=id;list.push(y);}}}
      members.push(list);}
    return {comp,members};}
  // ---- motion
  _jostle(){
    const p=this.p,n=this.n,{px,py,pa,ox,oy}=this,w=1/AREA,wr=1/INERTIA,sw=Math.sqrt(w);
    const X=Float64Array.from(px),Y=Float64Array.from(py),A=Float64Array.from(pa),OX=Float64Array.from(ox),OY=Float64Array.from(oy);
    const {comp,members}=this.bodies();
    for(const list of members){const m=list.length;
      if(m===1){const u=list[0];px[u]=this._wx(px[u]+p.sigma*sw*this._gauss());py[u]=this._wy(py[u]+p.sigma*sw*this._gauss());
        const da=p.sigmaRot*w*(sw/Math.sqrt(w))*this._gauss();this.rigidMove(u,0,0,da);continue;}
      // a body: the mean of its blocks' kicks, turned by the torque of the kicks and the blocks' own turns
      const rx=new Float64Array(m),ry=new Float64Array(m),u0=list[0];let cx=0,cy=0;
      for(let k=0;k<m;k++){rx[k]=this._dx(px[list[k]]-px[u0]);ry[k]=this._dy(py[list[k]]-py[u0]);cx+=rx[k];cy+=ry[k];}cx/=m;cy/=m;
      let s2=0,tq=0,inertia=0;const ib=1/wr,spin=p.sigmaRot*w*(sw/Math.sqrt(w));
      for(let k=0;k<m;k++){const dx=rx[k]-cx,dy=ry[k]-cy,r2=dx*dx+dy*dy;s2+=sw*sw;inertia+=r2+ib;tq+=r2*p.sigma*p.sigma*sw*sw+ib*ib*spin*spin;}
      const st=p.sigma*Math.sqrt(s2)/m,sr=Math.sqrt(tq)/inertia,tx=st*this._gauss(),ty=st*this._gauss(),da=sr*this._gauss(),c=Math.cos(da),s=Math.sin(da);
      const ax=px[u0]+cx,ay=py[u0]+cy;
      for(let k=0;k<m;k++){const x=list[k],dx=rx[k]-cx,dy=ry[k]-cy;px[x]=this._wx(ax+c*dx-s*dy+tx);py[x]=this._wy(ay+s*dx+c*dy+ty);pa[x]+=da;
        for(let q=x*3;q<x*3+3;q++){const a=ox[q],b=oy[q];ox[q]=c*a-s*b;oy[q]=s*a+c*b;}}}
    if(!p.noTunnel)return;
    // no tunnelling through structures (bodies of two or more blocks)
    const sb=[];for(let v=0;v<n;v++)if(members[comp[v]].length>=2)sb.push(v);
    const through=(u,mx,my)=>{const m=Math.hypot(mx,my);if(m<1e-9)return false;
      for(const v of sb){if(comp[v]===comp[u])continue;const vx=this._dx(X[v]-X[u]),vy=this._dy(Y[v]-Y[u]);if(Math.hypot(vx,vy)>m+1.5)continue;
        for(let k=0;k<3;k++){const a=v*3+k,e=v*3+(k+1)%3;if(segX(0,0,mx,my,vx+OX[a],vy+OY[a],vx+OX[e],vy+OY[e]))return true;}}
      return false;};
    for(const list of members){if(!list.some(u=>through(u,this._dx(px[u]-X[u]),this._dy(py[u]-Y[u]))))continue;
      const u0=list[0],tx=this._dx(px[u0]-X[u0]),ty=this._dy(py[u0]-Y[u0]);let f=0;
      for(const g of [0.5,0.25])if(!list.some(u=>through(u,g*tx,g*ty))){f=g;break;}
      for(const u of list){px[u]=this._wx(X[u]+f*tx);py[u]=this._wy(Y[u]+f*ty);pa[u]=A[u];for(let k=u*3;k<u*3+3;k++){ox[k]=OX[k];oy[k]=OY[k];}}
      this.tunnelBlocks=(this.tunnelBlocks||0)+1;}
  }
  // block radii (corners are soft, so a radius can exceed 1/sqrt(3))
  _radii(){const n=this.n,r=this._r&&this._r.length===n?this._r:(this._r=new Float64Array(n)),{ox,oy}=this;
    for(let u=0;u<n;u++){let m=0;for(let k=u*3;k<u*3+3;k++)m=Math.max(m,Math.hypot(ox[k],oy[k]));r[u]=m;}return r;}
  // candidate pairs (u < v, in u-major order) whose centres are within `reach` of each other: a cell grid on the torus
  _near(reach){const n=this.n,{px,py}=this,W=this.p.W,H=this.p.H,gx=Math.max(1,Math.floor(W/reach)),gy=Math.max(1,Math.floor(H/reach)),cw=W/gx,ch=H/gy;
    if(gx<3||gy<3){const all=[];for(let u=0;u<n;u++)for(let v=u+1;v<n;v++)all.push(u,v);return all;}
    const head=new Int32Array(gx*gy).fill(-1),nxt=new Int32Array(n),cx=new Int32Array(n),cy=new Int32Array(n);
    for(let u=n-1;u>=0;u--){cx[u]=Math.min(gx-1,Math.floor(this._wx(px[u])/cw));cy[u]=Math.min(gy-1,Math.floor(this._wy(py[u])/ch));const c=cy[u]*gx+cx[u];nxt[u]=head[c];head[c]=u;}
    const out=[],cand=[];
    for(let u=0;u<n;u++){cand.length=0;
      for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const c=((cy[u]+b+gy)%gy)*gx+(cx[u]+a+gx)%gx;for(let v=head[c];v>=0;v=nxt[v])if(v>u)cand.push(v);}
      cand.sort((a,b)=>a-b);for(const v of cand)out.push(u,v);}
    return out;}
  _contacts(){const r=this._radii(),out=[],near=this._near(2*Math.max(...r,R3)+2);
    for(let k=0;k<near.length;k+=2){const u=near[k],v=near[k+1];
      let joined=false;for(let i=0;i<3;i++){const q=this.bond[u*3+i];if(q>=0&&((q/3)|0)===v&&!this.isHingeBond(u,i))joined=true;}
      if(joined)continue;if(Math.hypot(this._dx(this.px[v]-this.px[u]),this._dy(this.py[v]-this.py[u]))>r[u]+r[v]+2)continue;out.push(u,v);}
    return out;}
  // separate two blocks (minimum translation, shared equally); r: radii
  _separate(u,v,r){const dx=this._dx(this.px[v]-this.px[u]),dy=this._dy(this.py[v]-this.py[u]);if(Math.hypot(dx,dy)>r[u]+r[v]+EPS)return;
    const m=sepTri(this.ox,this.oy,u*3,v*3,dx,dy);if(!m)return;this.px[u]-=m.x/2;this.py[u]-=m.y/2;this.px[v]+=m.x/2;this.py[v]+=m.y/2;}
  _pairs(){const r=this._radii(),tol=this.p.pairTol*SIZE,near=this._near(2*Math.max(...r,R3)+tol+EPS);this.pairs.length=0;
    for(let k=0;k<near.length;k+=2){const u=near[k],v=near[k+1];if(Math.hypot(this._dx(this.px[v]-this.px[u]),this._dy(this.py[v]-this.py[u]))<=r[u]+r[v]+tol+EPS)this.pairs.push(u,v);}
    return this.pairs;}
  physics(){
    const p=this.p,n=this.n,{px,py,ox,oy}=this,w=1/AREA,wr=1/INERTIA,soft=1-p.stiff;
    this._jostle();
    const contacts=this._contacts(),pins=this._pinList(),bonded=[];for(let u=0;u<n;u++)if(this.bonded(u))bonded.push(u);
    const fitC=new Float64Array(n),fitS=new Float64Array(n);
    for(let it=0;it<p.iters;it++){
      {const r=this._radii();for(let k=0;k<contacts.length;k+=2)this._separate(contacts[k],contacts[k+1],r);}
      for(let k=0;k<pins.length;k+=2){const qa=pins[k],qb=pins[k+1],u=(qa/3)|0,v=(qb/3)|0;
        const dx=this._dx(px[v]+ox[qb]-px[u]-ox[qa]),dy=this._dy(py[v]+oy[qb]-py[u]-oy[qa]),dl=Math.hypot(dx,dy);if(dl<1e-9)continue;
        const nx=dx/dl,ny=dy/dl,cu=ox[qa]*ny-oy[qa]*nx,cv=ox[qb]*ny-oy[qb]*nx,eu=w+wr*cu*cu,ev=w+wr*cv*cv,lam=dl/(eu+ev);
        this.rigidMove(u,nx*lam*w*(1-soft),ny*lam*w*(1-soft),wr*cu*lam*(1-soft));this.rigidMove(v,-nx*lam*w*(1-soft),-ny*lam*w*(1-soft),-wr*cv*lam*(1-soft));
        if(soft>0){ox[qa]+=nx*lam*eu*soft;oy[qa]+=ny*lam*eu*soft;ox[qb]-=nx*lam*ev*soft;oy[qb]-=ny*lam*ev*soft;}}
      if(soft>0)for(const u of bonded){   // shape matching: best-fit turn of the rest shape onto the corners, pulled toward it
        const o=u*3;let mx=(ox[o]+ox[o+1]+ox[o+2])/3,my=(oy[o]+oy[o+1]+oy[o+2])/3;px[u]+=mx;py[u]+=my;let a=0,b=0;
        for(let k=0;k<3;k++){ox[o+k]-=mx;oy[o+k]-=my;a+=REST[k][0]*ox[o+k]+REST[k][1]*oy[o+k];b+=REST[k][0]*oy[o+k]-REST[k][1]*ox[o+k];}
        const h=Math.hypot(a,b)||1,c=a/h,s=b/h;
        for(let k=0;k<3;k++){const gx=c*REST[k][0]-s*REST[k][1],gy=s*REST[k][0]+c*REST[k][1];ox[o+k]+=p.stiff*(gx-ox[o+k]);oy[o+k]+=p.stiff*(gy-oy[o+k]);}
        fitC[u]=c;fitS[u]=s;}}
    if(soft>0)for(const u of bonded)this.pa[u]=Math.atan2(fitS[u],fitC[u]);
    for(let u=0;u<n;u++){px[u]=this._wx(px[u]);py[u]=this._wy(py[u]);}
    this._pairs();
  }
  // ---- state
  saveState(){const arrays={},nums={};
    for(const k of Object.keys(this)){const v=this[k];if(k.startsWith('_')||k==='p'||k==='pairs'||k==='pins')continue;
      if(ArrayBuffer.isView(v))arrays[k]={t:v.constructor.name,a:Array.from(v)};else if(typeof v==='number')nums[k]=v;}
    return {p:this.p,n:this.n,rng:this.rng.getState(),spare:Number.isNaN(this._spare)?null:this._spare,arrays,nums};}
  static fromState(st){const s=new this(st.p,st.n);const T={Float64Array,Int32Array,Int8Array,Uint8Array,Int16Array};
    for(const k in st.arrays)s[k]=T[st.arrays[k].t].from(st.arrays[k].a);for(const k in st.nums)s[k]=st.nums[k];
    s.rng.setState(st.rng);s._spare=st.spare===null?NaN:st.spare;s.bondsDirty=true;return s;}
}
module.exports={Physics,REST,AREA,SIZE,DEFAULTS,separation,sepTri,segX,mulberry32};
