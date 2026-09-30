'use strict';
// Triangle-only chains (user, 2026-09-30; design figure experiments/out/TRI_alphabet_20260930.png).
// One block type: the unit triangle (type A, three edges). Bonds live in the ordinary bond table (edge i = side i), so
// the polygon physics, corner pins and rigid-body jostling are unchanged. The chemistry below replaces the letter rules.
//
// Each triangle derives its roles from its own bonds (and one own state, `fill`):
//   - a bond carries a kind on each end: PREV / NEXT (chain, directional) or FACE (template-copy);
//   - a strand triangle with PREV on edge p and NEXT on edge q has its free edge as a FACE if q = p+1 (mod 3, counter-
//     clockwise: the free edge lies left of the direction of travel) and as a hidden BACK otherwise;
//   - strand ends (one chain bond) are face triangles: face = next+1 (first) or prev+2 (last); their third edge is inert;
//   - a docked triangle (FACE bond on edge f) has prev edge f+1 and next edge f+2;
//   - a fill triangle attached by its NEXT edge n (own state fill = 1 until it has both chain bonds) has prev edge n+1.
// Exposed values (read by bonded partners from the previous pass, one bond per pass):
//   nb   strand triangle: my NEXT partner is a back;
//   gap  strand face: hidden backs before the next face (0, 1, 2) = 0 if next is a face, else 1 + nb of my next;
//   need docked: 2 - gap of my template partner (fills still to place after me); fill: need of my NEXT partner - 1.
// Rules (bond formation needs flush edges: both corner gaps within tolerance; probability pBond per step):
//   dock    a free triangle binds a strand triangle's free face;
//   fill    a free triangle binds the PREV edge of a docked or fill triangle whose need >= 1 (so a gap gets exactly 2 - c
//           fills and nothing grows past the chain ends or into a docking site);
//   close   a docked/fill triangle's free PREV edge binds another docked/fill triangle's free NEXT edge, only when it
//           needs no more fills (need 0): a gap gets exactly its 2 - c fills even if the chain is strained;
//   release a docked triangle lets go of its face once its prev and next edges are bonded to complete partners (not a
//           fill still waiting for its other bond; an edge facing past the template's end counts as done): the copy
//           peels off as one piece and is a template itself;
//   refractory a released face (template and copy side) takes no new dock until the busy level around it (30 on any
//           bonded face, relayed -1 per chain bond per pass) has fallen to 0, i.e. until the whole copy has let go:
//           no second copy starts under a copy that is still peeling off.
// No counters, no traversal: every rule reads one triangle, its bonds and its partners' exposed values.
//   node experiments/tri_chain.js demo SEED STEPS OUTSTEM GAPS [free] [size]      (GAPS e.g. 1101121)
const fs=require('fs'),path=require('path'),zlib=require('zlib'),{execFileSync}=require('child_process');
const {T_A,NV}=require('../src/sim');
const live=require('./half_cell_live'),{overlap}=require('./half_cell_geometry');
const {seeded}=require('./seeded_growth'),{regular}=require('./seeded_ports'),{PinsLiveSim}=require('./half_cell_pins');
const {band}=require('./triangle_alphabet_figure');

const PREV=1,NEXT=2,FACE=3,TFACE=4;   // FACE on the copy (docked) end of a face bond, TFACE on the template end
const FREE=0,SFACE=1,SBACK=2,DOCKED=3,BUSY=30;   // BUSY: range of the relayed busy level (bonds)
const m3=x=>((x%3)+3)%3;
const TRI_CONFIG={structural:[],shapes:{[T_A]:regular(3,1)},labels:{}};

class TriSim extends seeded(PinsLiveSim,TRI_CONFIG){
  _tri(){const n=this.n;if(!this.bkind||this.bkind.length!==n*4){this.bkind=new Int8Array(n*4);this.fill=new Int8Array(n);
    this.role=new Int8Array(n);this.nb=new Int8Array(n);this.busy=new Int8Array(n);this.refr=new Int8Array(n);this.gap=new Int8Array(n).fill(-1);this.need=new Int8Array(n);}}
  // edges of u by kind (from its own bonds): {prev, next, face} (-1 if none)
  _edges(u){const k=this.bkind,o=u*4;let prev=-1,next=-1,face=-1;
    for(let i=0;i<3;i++){if(this.bond[o+i]<0)continue;if(k[o+i]===PREV)prev=i;else if(k[o+i]===NEXT)next=i;else if(k[o+i]===FACE)face=i;}
    return {prev,next,face};}
  // role and the role-defined edges of u: {role, prev, next, free (face or back edge), inert}
  _roles(u){
    const e=this._edges(u);
    if(e.face>=0)return {role:DOCKED,prev:m3(e.face+1),next:m3(e.face+2),free:-1,face:e.face};
    if(e.prev<0&&e.next<0)return {role:FREE};
    if(e.prev>=0&&e.next>=0)return {role:e.next===m3(e.prev+1)?SFACE:SBACK,prev:e.prev,next:e.next,free:3-e.prev-e.next};
    if(e.next>=0&&this.fill[u])return {role:SBACK,prev:m3(e.next+1),next:e.next,free:m3(e.next+2),fill:true};
    if(e.next>=0)return {role:SFACE,prev:-1,next:e.next,free:m3(e.next+1),inert:m3(e.next+2)};
    return {role:SFACE,prev:e.prev,next:-1,free:m3(e.prev+2),inert:m3(e.prev+1)};
  }
  _partner(u,i){const q=this.bond[u*4+i];return q<0?-1:q>>2;}
  _derive3(){
    this._tri();const n=this.n,role=this.role,nb0=this.nb.slice(),gap0=this.gap.slice(),need0=this.need.slice(),R=this._R=new Array(n);
    for(let u=0;u<n;u++){R[u]=this._roles(u);role[u]=R[u].role;}
    // busy: BUSY on a triangle with a bonded face (either end), relayed along chain bonds with -1 per bond (previous pass)
    const busy0=this.busy.slice();
    for(let u=0;u<n;u++){let b=0;for(let i=0;i<3;i++){const k=this.bkind[u*4+i];if(this.bond[u*4+i]<0)continue;
        if(k===FACE||k===TFACE)b=BUSY;else if(k===PREV||k===NEXT)b=Math.max(b,busy0[this.bond[u*4+i]>>2]-1);}
      this.busy[u]=b;if(this.refr[u]&&b===0)this.refr[u]=0;}
    for(let u=0;u<n;u++){const r=R[u];this.nb[u]=0;this.gap[u]=-1;this.need[u]=0;
      if(r.role===SFACE||r.role===SBACK){const nx=r.next>=0?this._partner(u,r.next):-1;
        if(nx>=0){this.nb[u]=role[nx]===SBACK?1:0;if(r.role===SFACE)this.gap[u]=role[nx]===SFACE?0:role[nx]===SBACK?1+nb0[nx]:-1;}
        if(r.fill&&nx>=0)this.need[u]=Math.max(0,need0[nx]-1);}
      else if(r.role===DOCKED){const t=this._partner(u,r.face);this.need[u]=gap0[t]>=0?Math.max(0,2-gap0[t]):0;}}
  }
  _flush(u,i,v,j,tol){  // edge i of u faces edge j of v: corner i of u meets corner j+1 of v and corner i+1 meets corner j
    const a0=u*NV+i,a1=u*NV+(i+1)%3,b0=v*NV+j,b1=v*NV+(j+1)%3,dx=this._dx(this.px[v]-this.px[u]),dy=this._dy(this.py[v]-this.py[u]);
    const g1=Math.hypot(dx+this.ox[b1]-this.ox[a0],dy+this.oy[b1]-this.oy[a0]),g2=Math.hypot(dx+this.ox[b0]-this.ox[a1],dy+this.oy[b0]-this.oy[a1]);
    return Math.max(g1,g2)<=tol;}
  _bind(u,i,ku,v,j,kv){this._link(u,i,v,j);this.bkind[u*4+i]=ku;this.bkind[v*4+j]=kv;}
  _triBonds(){
    const p=this.p,R=this._R,pairs=this.pairs,tolF=p.triTol||0.3,tolC=p.triTolClose||0.22,pb=p.pBond===undefined?0.5:p.pBond;
    const free=u=>R[u].role===FREE,bnd=(u,i)=>this.bond[u*4+i]>=0;
    for(let k=0;k<pairs.length;k+=2){let u=pairs[k],v=pairs[k+1];const ru=R[u],rv=R[v];
      if(free(u)&&free(v))continue;
      if(free(u)||free(v)){if(free(u)){[u,v]=[v,u];}const r=R[u];   // u attached, v free
        // dock on a free face
        if(r.role===SFACE&&r.free>=0&&!bnd(u,r.free)&&!this.refr[u]){for(let j=0;j<3;j++)if(this._flush(u,r.free,v,j,tolF)&&this.rng()<pb){this._bind(u,r.free,TFACE,v,j,FACE);this.dockEvents=(this.dockEvents||0)+1;R[v]={role:DOCKED};break;}continue;}
        // fill on the prev edge of a docked or fill triangle that still needs fills
        if((r.role===DOCKED||r.fill)&&r.prev>=0&&!bnd(u,r.prev)&&this.need[u]>=1){for(let j=0;j<3;j++)if(this._flush(u,r.prev,v,j,tolF)&&this.rng()<pb){
          this._bind(u,r.prev,PREV,v,j,NEXT);this.fill[v]=1;this.fillEvents=(this.fillEvents||0)+1;R[v]={role:SBACK,fill:true};break;}}
        continue;}
      // close: two copy triangles (docked or fill), prev edge of one to next edge of the other
      const cp=r=>r.role===DOCKED||r.fill;if(!cp(ru)||!cp(rv))continue;
      for(const [a,ra,b,rb] of [[u,ru,v,rv],[v,rv,u,ru]]){
        if(ra.prev>=0&&rb.next>=0&&this.need[a]===0&&!bnd(a,ra.prev)&&!bnd(b,rb.next)&&this._flush(a,ra.prev,b,rb.next,tolC)&&this.rng()<pb){
          this._bind(a,ra.prev,PREV,b,rb.next,NEXT);this.closeEvents=(this.closeEvents||0)+1;break;}}
    }
  }
  _triChem(){
    // fills become ordinary strand triangles once they have both chain bonds
    for(let u=0;u<this.n;u++)if(this.fill[u]){const e=this._edges(u);if(e.prev>=0&&e.next>=0)this.fill[u]=0;}
    // release: a docked triangle whose prev and next edges are done lets go of its face
    for(let u=0;u<this.n;u++){const e=this._edges(u);if(e.face<0)continue;
      const t=this._partner(u,e.face),rt=this._roles(t),done=i=>{const w=this._partner(u,i);if(this.fill[w])return false;   // a fill still in progress (mine or my partner's) holds me
        const ew=this._edges(w);for(const j of [ew.prev,ew.next])if(j>=0&&this.fill[this._partner(w,j)])return false;return true;};
      const pOK=e.prev>=0?done(e.prev):rt.next<0,nOK=e.next>=0?done(e.next):rt.prev<0;
      if(pOK&&nOK){const q=this.bond[u*4+e.face];this.refr[u]=1;this.refr[t]=1;this.bkind[u*4+e.face]=0;this.bkind[q]=0;this._unlink(u,e.face);this.releaseEvents=(this.releaseEvents||0)+1;}}
  }
  step(){this.t++;this._physics();this._derive3();this._triBonds();this._triChem();}
}

// ---------------- worlds ----------------
const rolesFromGaps=gaps=>['F',...gaps.flatMap(c=>[...Array(c).fill('B'),'F'])];
function placeBand(s,units,tris,cx,cy){
  let mx=0,my=0;for(const t of tris)for(const p of t.v){mx+=p[0]/(3*tris.length);my+=p[1]/(3*tris.length);}
  const corner0=Math.atan2(regular(3,1)[0][1],regular(3,1)[0][0]);
  tris.forEach((t,k)=>{const u=units[k];let V=t.v;const cr=(V[1][0]-V[0][0])*(V[2][1]-V[0][1])-(V[1][1]-V[0][1])*(V[2][0]-V[0][0]);if(cr<0)V=[V[0],V[2],V[1]];
    const c=[(V[0][0]+V[1][0]+V[2][0])/3,(V[0][1]+V[1][1]+V[2][1])/3];s.px[u]=s._wx(cx+c[0]-mx);s.py[u]=s._wy(cy+c[1]-my);
    s.pa[u]=Math.atan2(V[0][1]-c[1],V[0][0]-c[0])-corner0;s._resetShape(u);t.world=V.map(p=>[p[0]-mx+cx,p[1]-my+cy]);});
  const same=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1])<1e-6;
  const edgeOf=(t,a,b)=>{for(let i=0;i<3;i++){const p=t.world[i],q=t.world[(i+1)%3];if((same(p,a)&&same(q,b))||(same(p,b)&&same(q,a)))return i;}return -1;};
  for(let k=0;k+1<tris.length;k++){const [a,b]=tris[k].exit.map(p=>[p[0]-0,p[1]-0]);
    const A=tris[k].world,shared=A.filter(p=>tris[k+1].world.some(q=>same(p,q)));
    const i=edgeOf(tris[k],shared[0],shared[1]),j=edgeOf(tris[k+1],shared[0],shared[1]);
    s._bind(units[k],i,NEXT,units[k+1],j,PREV);}
}
function createTriWorld({seed,gaps=[1,1,1,1,1],free=120,size=18,params={}}={}){
  const ref=live.createWorld({seed:1,start:'paired',motion:'body'}).s.p,tris=band(rolesFromGaps(gaps));
  const s=new TriSim({...ref,nA:tris.length+free,nB:0,nC:0,nD:0,nJ:0,nP:0,nQ:0,nE:0,energyGate:false,...params,seed,W:size,H:size,seedCount:0});
  s._tri();const units=tris.map((_,k)=>k);
  placeBand(s,units,tris,size/2,size/2);
  const placed=[...units];
  for(let u=0;u<s.n;u++)if(!placed.includes(u)){let ok=false;
    for(let a=0;a<5000&&!ok;a++){s.px[u]=size*s.rng();s.py[u]=size*s.rng();s.pa[u]=2*Math.PI*s.rng();s._resetShape(u);
      ok=placed.every(v=>{const dx=s._dx(s.px[v]-s.px[u]),dy=s._dy(s.py[v]-s.py[u]);return Math.hypot(dx,dy)>2||overlap(s._outline(u),s._outline(v,dx,dy))<1e-10;});}
    if(!ok)throw Error('could not place');placed.push(u);}
  s.bondsDirty=true;s._derive3();
  return {s,founder:units};
}
// Read-only census: strands (chain-bonded components) with their gap strings and pairing.
function triCensus(s){
  s._tri();const seen=new Set(),out=[];
  for(let u=0;u<s.n;u++){if(seen.has(u))continue;const e=s._edges(u);if(e.prev>=0||e.next<0)continue;   // strand starts
    const units=[];let x=u,guard=0;while(x>=0&&!seen.has(x)&&guard++<500){seen.add(x);units.push(x);const r=s._edges(x);x=r.next>=0?s._partner(x,r.next):-1;}
    const roles=units.map(v=>s._roles(v).role),gaps=[];let c=null;
    for(const r of roles){if(r===SFACE||r===DOCKED){if(c!==null)gaps.push(c);c=0;}else if(c!==null)c++;}
    out.push({units,gaps:gaps.join(''),n:units.length,paired:units.some(v=>s._edges(v).face>=0)});}
  return out;
}
// ---------------- pictures ----------------
function render(s,out,title,focus=null){
  // focus = {units, radius}: centre on those units and draw only blocks within radius of their centre (zoomed)
  s._tri();let W=s.p.W,S=560,k=S/W;const keep=new Set();let fx=0,fy=0;
  if(focus){const u0=focus.units[0];let sx=0,sy=0;for(const u of focus.units){sx+=s._dx(s.px[u]-s.px[u0]);sy+=s._dy(s.py[u]-s.py[u0]);}
    fx=s.px[u0]+sx/focus.units.length;fy=s.py[u0]+sy/focus.units.length;
    for(let u=0;u<s.n;u++)if(Math.hypot(s._dx(s.px[u]-fx),s._dy(s.py[u]-fy))<focus.radius)keep.add(u);k=S/(2*focus.radius);}
  const svg=[`<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S+30}"><rect width="${S}" height="${S+30}" fill="#f5f7f8"/><rect width="${S}" height="${S}" fill="#15222d"/>`];
  // centre on the founder's first triangle (or the focus)
  const cx=focus?0:W/2-s.px[0],cy=focus?0:W/2-s.py[0];
  const X0=u=>focus?s._dx(s.px[u]-fx)+focus.radius:((s.px[u]+cx)%W+W)%W,Y0=u=>focus?s._dy(s.py[u]-fy)+focus.radius:((s.py[u]+cy)%W+W)%W;
  for(let u=0;u<s.n;u++){if(focus&&!keep.has(u))continue;const r=s._roles(u);
    const col=r.role===FREE?'#56646e':r.role===DOCKED?'#9fd8cf':r.role===SFACE?'#f6cf8a':'#c98f2e';
    const pts=[];for(let q=0;q<3;q++){const x=X0(u)+s.ox[u*NV+q],y=Y0(u)+s.oy[u*NV+q];pts.push(`${(x*k).toFixed(1)},${(y*k).toFixed(1)}`);}
    svg.push(`<polygon points="${pts.join(' ')}" fill="${r.fill?'#3f9e8f':col}" stroke="#1b2a33" stroke-width="0.8"/>`);
    if((r.role===SFACE)&&r.free>=0){const a=u*NV+r.free,b=u*NV+(r.free+1)%3,X=v=>(X0(u)+s.ox[v])*k,Y=v=>(Y0(u)+s.oy[v])*k;
      svg.push(`<line x1="${X(a).toFixed(1)}" y1="${Y(a).toFixed(1)}" x2="${X(b).toFixed(1)}" y2="${Y(b).toFixed(1)}" stroke="#e0672b" stroke-width="2.2"/>`);}}
  svg.push(`<text x="8" y="${S+20}" font-family="Arial" font-size="13" fill="#233542">${title}</text></svg>`);
  const svgf=out.replace(/\.png$/,'.svg');fs.writeFileSync(svgf,svg.join('\n'));
  const chrome=fs.readdirSync('/opt/pw-browsers').filter(d=>d.startsWith('chromium')).map(d=>`/opt/pw-browsers/${d}/chrome-linux/chrome`).find(fs.existsSync);
  execFileSync(chrome,['--headless','--no-sandbox','--disable-gpu','--hide-scrollbars',`--screenshot=${path.resolve(out)}`,`--window-size=${S},${S+30+90}`,'file://'+path.resolve(svgf)],{stdio:'ignore'});
  fs.writeFileSync(out.replace(/\.png$/,'.json.gz'),zlib.gzipSync(JSON.stringify(s.saveState())));
}
function demo(seed,steps,stem,gaps,free=120,size=18,every=0,params={}){
  const {s}=createTriWorld({seed,gaps,free,size,params}),t0=Date.now(),log=[];
  render(s,`${stem}_t0.png`,`${path.basename(stem)} seed ${seed} t=0, founder gaps ${gaps.join('')}`);
  for(let t=1;t<=steps;t++){s.step();
    if(t%Math.max(1,steps/10|0)===0){const c=triCensus(s);
      const line=`t=${t} strands=${c.length} [${c.map(q=>q.gaps+'/'+q.n+(q.paired?'*':'')).join(' ')}] dock=${s.dockEvents||0} fill=${s.fillEvents||0} close=${s.closeEvents||0} release=${s.releaseEvents||0} ${((Date.now()-t0)/t).toFixed(1)}ms/step`;
      console.log(line);log.push(line);}
    if(every&&t%every===0)render(s,`${stem}_t${t}.png`,`${path.basename(stem)} seed ${seed} t=${t}`);}
  render(s,`${stem}.png`,`${path.basename(stem)} seed ${seed} t=${steps}`);
  return {s,log};
}
if(require.main===module){const [cmd,seed,steps,stem,g,free,size]=process.argv.slice(2);
  if(cmd==='demo')demo(+seed,+steps,stem,[...(g||'11111')].map(Number),free?+free:120,size?+size:18,+steps/4|0);}
module.exports={TriSim,createTriWorld,triCensus,render,demo,PREV,NEXT,FACE,TFACE,rolesFromGaps};
