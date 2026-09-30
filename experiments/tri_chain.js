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
//   caps     (option) strand ends carry a cap state, inherited by the triangle docking on them; capped ends emit a
//           signal relayed along the chain (range 30 bonds); a face takes a dock only if it hears both ends (an intact
//           strand), and a copy end is done only at a capped template end: broken fragments stop being copied;
//   dissolve (option pDissolve, with caps) strands missing a cap signal and orphaned parts fall apart, returning
//           their material;
//   marks    (states) a hidden triangle of an R letter may carry a mark; the face before it shows it, the docked
//           triangle reads it across the face bond, and the fill placed next to it copies it (error pMarkErr); marked
//           R backs are growth site 'Rm': heritable parts on an unchanged shape;
//   pieces   (seeded letters) pre-welded rhombuses (R) and trapezoids (Z) dock as a unit when their welded triangles
//           lie on the fill side and do not exceed the site's need; single triangles fill any rest;
//   refractory a released face (template and copy side) takes no new dock until the busy level around it (30 on any
//           bonded face, relayed -1 per chain bond per pass) has fallen to 0, i.e. until the whole copy has let go:
//           no second copy starts under a copy that is still peeling off.
// No counters, no traversal: every rule reads one triangle, its bonds and its partners' exposed values.
//   node experiments/tri_chain.js demo SEED STEPS OUTSTEM GAPS [free] [size]      (GAPS e.g. 1101121)
const fs=require('fs'),path=require('path'),zlib=require('zlib'),{execFileSync}=require('child_process');
const {T_A,NV}=require('../src/sim');
const live=require('./half_cell_live'),{overlap}=require('./half_cell_geometry');
const {seeded}=require('./seeded_growth'),{regular}=require('./seeded_ports'),{PinsLiveSim}=require('./half_cell_pins');
const {band}=require('./triangle_alphabet_figure'),{crosses}=require('./seeded_field');

const PREV=1,NEXT=2,FACE=3,TFACE=4;   // FACE on the copy (docked) end of a face bond, TFACE on the template end
const FREE=0,SFACE=1,SBACK=2,DOCKED=3,GROWN=5,PIECE=6,BUSY=30;
const GSEED=5,GUP=6,GDOWN=7,GRING=8,HOLD=9,HELD=10,WELD=11;   // WELD: bonds inside a seeded free piece (letter);   // HOLD/HELD: a hand's holding edge and the triangle it holds;   // growth bond kinds: seed edge on a chain back, child's attach edge, parent's sticky edge, ring closure   // BUSY: range of the relayed busy level (bonds)
const m3=x=>((x%3)+3)%3;

// ---------------- growth programs (grown parts on hidden backs) ----------------
// A grown triangle has a state; its edges are named relative to the edge it attached by (rel 1 = next counter-clockwise,
// rel 2 = the other). stick: [rel, child state] = that edge takes one free triangle, which is given the child state
// (the parent writes it; the child keeps it). close: rel edges that bind a ring partner's sticky edge (closure).
// Parts end by closure (a ring has no free slot left) or by stop states (no sticky edge); nothing counts.
const PROGRAMS={
  hex:{s0:{stick:[[1,'r']],close:[2]},r:{stick:[[2,'r']]}},                  // 6 triangles around one point, closes itself
  plate:{s0:{stick:[[1,'c']]},c:{stick:[[1,'x'],[2,'x']]},x:{stick:[]}},       // side-2 triangle: corner, centre, 2 corners
  spike:{s0:{stick:[[1,'a']]},a:{stick:[[2,'b']]},b:{stick:[[1,'x']]},x:{stick:[]}},   // straight strip of 4
  fan:{s0:{stick:[[1,'f'],[2,'f']]},f:{stick:[]}},
  hand:{s0:{stick:[[1,'t']]},t:{stick:[],hold:[1,2]}},
  blade:{s0:{stick:[[1,'k']]},k:{stick:[],cut:[1,2]}},                    // 2-triangle arm; the tip cuts strands it touches                     // 2-triangle arm; the tip holds free triangles                          // trapezoid: a triangle with two stop wings
};
// arms from strand ends (site E): a strip grown by a pattern of relative edges ('1'/'2' per step, then a stop); equal
// neighbouring steps (11, 22) bend the strip by 60 degrees, alternating steps (12) keep it straight
function armProgram(pat){const pr={};[...pat].forEach((c,k)=>{pr[k===0?'s0':'a'+k]={stick:[[+c,k+1<pat.length?'a'+(k+1):'x']]};});pr.x={stick:[]};return pr;}
for(let L=3;L<=7;L++)for(let m=0;m<(1<<L);m++){const pat=[...Array(L)].map((_,k)=>(m>>k)&1?'2':'1').join('');PROGRAMS['arm'+pat]=armProgram(pat);}
const CODES=[];for(const [pn,pr] of Object.entries(PROGRAMS))for(const st of Object.keys(pr))CODES.push([pn,st]);
const code=(pn,st)=>1+CODES.findIndex(([a,b])=>a===pn&&b===st);
const TRI_CONFIG={structural:[],shapes:{[T_A]:regular(3,1)},labels:{}};

class TriSim extends seeded(PinsLiveSim,TRI_CONFIG){
  _tri(){const n=this.n;if(!this.bkind||this.bkind.length!==n*4){this.bkind=new Int8Array(n*4);this.fill=new Int8Array(n);
    this.role=new Int8Array(n);this.nb=new Int8Array(n);this.busy=new Int8Array(n);this.refr=new Int8Array(n);this.gstate=new Int8Array(n);this.gatt=new Int8Array(n);this.cap=new Int8Array(n);this.mark=new Int8Array(n);this.mAfter=new Int8Array(n);this.dm=new Int8Array(n);this.sigP=new Int8Array(n);this.sigN=new Int8Array(n);this.gap=new Int8Array(n).fill(-1);this.need=new Int8Array(n);}}
  // edges of u by kind (from its own bonds): {prev, next, face} (-1 if none)
  _edges(u){const k=this.bkind,o=u*4;let prev=-1,next=-1,face=-1;
    for(let i=0;i<3;i++){if(this.bond[o+i]<0)continue;if(k[o+i]===PREV)prev=i;else if(k[o+i]===NEXT)next=i;else if(k[o+i]===FACE)face=i;}
    return {prev,next,face};}
  // role and the role-defined edges of u: {role, prev, next, free (face or back edge), inert}
  _roles(u){
    const e=this._edges(u);
    if(e.face>=0)return {role:DOCKED,prev:m3(e.face+1),next:m3(e.face+2),free:-1,face:e.face};
    if(this.gstate&&this.gstate[u])return {role:GROWN,att:this.gatt[u]};
    if(e.prev<0&&e.next<0){for(let i=0;i<3;i++)if(this.bond[u*4+i]>=0&&this.bkind[u*4+i]===WELD)return {role:PIECE};return {role:FREE};}
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
    // cap signals (option caps): each capped strand end emits BUSY, relayed along chain bonds away from it (-1 per bond,
    // previous pass); a triangle hearing both ends (sigP from the start side, sigN from the end side) is in an intact strand
    if(this.p.caps){const sp0=this.sigP.slice(),sn0=this.sigN.slice();
      for(let u=0;u<n;u++){const e=this._edges(u);let a=0,b=0;
        if(e.prev>=0)a=Math.max(0,sp0[this._partner(u,e.prev)]-1);else if(e.next>=0&&this.cap[u]&&e.face<0&&!this.fill[u])a=BUSY;
        if(e.next>=0)b=Math.max(0,sn0[this._partner(u,e.next)]-1);else if(e.prev>=0&&this.cap[u]&&e.face<0&&!this.fill[u])b=BUSY;
        this.sigP[u]=a;this.sigN[u]=b;}}
    const mA0=this.mAfter.slice();
    for(let u=0;u<n;u++){const r=R[u];this.nb[u]=0;this.gap[u]=-1;this.need[u]=0;this.mAfter[u]=0;
      if(r.role===SFACE||r.role===SBACK){const nx=r.next>=0?this._partner(u,r.next):-1;
        if(nx>=0){this.nb[u]=role[nx]===SBACK?1:0;if(r.role===SFACE)this.gap[u]=role[nx]===SFACE?0:role[nx]===SBACK?1+nb0[nx]:-1;
          if(this.gap[u]===1)this.mAfter[u]=this.mark[nx];}   // marks: a face shows the mark of its single hidden neighbour (R letter)
        if(r.fill&&nx>=0)this.need[u]=Math.max(0,need0[nx]-1);}
      else if(r.role===DOCKED){const t=this._partner(u,r.face);this.need[u]=gap0[t]>=0?Math.max(0,2-gap0[t]):0;this.dm[u]=mA0[t];}}
  }
  _flush(u,i,v,j,tol){  // edge i of u faces edge j of v: corner i of u meets corner j+1 of v and corner i+1 meets corner j
    const a0=u*NV+i,a1=u*NV+(i+1)%3,b0=v*NV+j,b1=v*NV+(j+1)%3,dx=this._dx(this.px[v]-this.px[u]),dy=this._dy(this.py[v]-this.py[u]);
    const g1=Math.hypot(dx+this.ox[b1]-this.ox[a0],dy+this.oy[b1]-this.oy[a0]),g2=Math.hypot(dx+this.ox[b0]-this.ox[a1],dy+this.oy[b0]-this.oy[a1]);
    return Math.max(g1,g2)<=tol;}
  _bind(u,i,ku,v,j,kv){
    // a held triangle that is used for anything else (dock, fill, growth, a new hold) is let go by its hand first
    if(ku!==HOLD)for(const x of [u,v])for(let k=0;k<3;k++)if(this.bond[x*4+k]>=0&&this.bkind[x*4+k]===HELD)this._cut(x,k);
    this._link(u,i,v,j);this.bkind[u*4+i]=ku;this.bkind[v*4+j]=kv;}
  _triBonds(){
    const p=this.p,R=this._R,pairs=this.pairs,tolF=p.triTol||0.3,tolC=p.triTolClose||0.22,pb=p.pBond===undefined?0.5:p.pBond;
    const free=u=>R[u].role===FREE,bnd=(u,i)=>this.bond[u*4+i]>=0;
    for(let k=0;k<pairs.length;k+=2){let u=pairs[k],v=pairs[k+1];const ru=R[u],rv=R[v];
      if(free(u)&&free(v))continue;
      // seeded pieces (letters): a free piece docks one of its triangles on a template face if its welded triangles lie
      // on that triangle's fill (prev) side, in fill order, and are no more than the site needs (2 - gap); its welds
      // become chain bonds and its other triangles become fills, so the copy is built letter by letter
      if((ru.role===SFACE&&rv.role===PIECE)||(rv.role===PIECE&&false)||(rv.role===SFACE&&ru.role===PIECE)){
        const [t,x]=ru.role===SFACE?[u,v]:[v,u],rt=R[t];
        if(rt.free>=0&&!bnd(t,rt.free)&&!this.refr[t]&&(!p.caps||(this.sigP[t]>0&&this.sigN[t]>0))){
          const need=this.gap[t]>=0?2-this.gap[t]:0,weldAt=(y,i)=>this.bond[y*4+i]>=0&&this.bkind[y*4+i]===WELD;
          for(let j=0;j<3;j++){if(bnd(x,j)||!this._flush(t,rt.free,x,j,tolF))continue;
            const pe=m3(j+1),ne=m3(j+2);if(weldAt(x,ne))break;
            const chain=[];let y=x,ye=pe,ok=true;
            while(weldAt(y,ye)){const q=this.bond[y*4+ye],w=q>>2,we=q&3;chain.push([y,ye,w,we]);
              const others=[0,1,2].filter(f=>f!==we&&weldAt(w,f));if(others.length>1||(others.length===1&&others[0]!==m3(we+1))){ok=false;break;}
              y=w;ye=m3(we+1);if(!others.length)break;}
            if(!ok||(p.pieceStrict!==false&&chain.length>need)){this.pieceRejects=(this.pieceRejects||0)+1;break;}
            if(this.rng()>=pb)break;
            this._bind(t,rt.free,TFACE,x,j,FACE);if(this.cap[t])this.cap[x]=1;this.sigP[x]=this.sigN[t];this.sigN[x]=this.sigP[t];
            for(const [a,ae,w,we] of chain){this.bkind[a*4+ae]=PREV;this.bkind[w*4+we]=NEXT;this.fill[w]=1;this.sigP[w]=this.sigP[x];this.sigN[w]=this.sigN[x];R[w]={role:SBACK,fill:true};}
            R[x]={role:DOCKED};this.pieceDocks=(this.pieceDocks||0)+1;this.dockEvents=(this.dockEvents||0)+1;break;}}
        continue;}
      if(free(u)||free(v)){if(free(u)){[u,v]=[v,u];}const r=R[u];   // u attached, v free
        // growth: a site back (released strand) seeds its program; a grown triangle extends by its state
        const G=p.grow;
        if(G&&r.role===SBACK&&!r.fill&&r.free>=0&&!bnd(u,r.free)&&r.prev>=0&&r.next>=0){
          const a=this._partner(u,r.prev),b=this._partner(u,r.next),site=R[a].role===SFACE&&R[b].role===SFACE?(this.mark[u]?'Rm':'R'):R[a].role===SFACE&&R[b].role===SBACK?'Z':null;
          if(site&&G[site]){for(let j=0;j<3;j++)if(this._flush(u,r.free,v,j,tolF)&&this.rng()<pb){this._bind(u,r.free,GSEED,v,j,GUP);
            this.gstate[v]=code(G[site],'s0');this.gatt[v]=j;this.growEvents=(this.growEvents||0)+1;R[v]={role:GROWN};break;}}
          continue;}
        if(r.role===GROWN){const [pn,st]=CODES[this.gstate[u]-1],rule=PROGRAMS[pn][st];let done=false;
          for(const [rel,child] of rule.stick){const e=m3(r.att+rel);if(bnd(u,e))continue;
            for(let j=0;j<3&&!done;j++)if(this._flush(u,e,v,j,tolF)&&this.rng()<pb){this._bind(u,e,GDOWN,v,j,GUP);
              this.gstate[v]=code(pn,child);this.gatt[v]=j;this.growEvents=(this.growEvents||0)+1;R[v]={role:GROWN};done=true;}
            if(done)break;}
          // hands: a holding edge grabs a free (or held) triangle; it is let go at pHoldRelease per step
          if(!done&&rule.hold&&p.pHold!==0)for(const rel of rule.hold){const e=m3(r.att+rel);if(bnd(u,e))continue;
            let held=false;for(let k=0;k<3;k++)if(this.bond[v*4+k]>=0)held=true;if(held)break;
            for(let j=0;j<3;j++)if(this._flush(u,e,v,j,p.holdTol||0.45)&&this.rng()<pb){this._bind(u,e,HOLD,v,j,HELD);this.holdEvents=(this.holdEvents||0)+1;done=true;break;}
            if(done)break;}
          continue;}
        // end arms (site E): a released strand end grows its program from its spare (inert) edge
        if(G&&G.E&&r.role===SFACE&&r.inert>=0&&!bnd(u,r.inert)&&!(r.free>=0&&bnd(u,r.free))){
          for(let j=0;j<3;j++)if(this._flush(u,r.inert,v,j,tolF)&&this.rng()<pb){this._bind(u,r.inert,GSEED,v,j,GUP);
            this.gstate[v]=code(G.E,'s0');this.gatt[v]=j;this.growEvents=(this.growEvents||0)+1;R[v]={role:GROWN};break;}
          if(R[v].role===GROWN)continue;}
        // dock on a free face
        if(r.role===SFACE&&r.free>=0&&!bnd(u,r.free)&&!this.refr[u]&&(!p.caps||(this.sigP[u]>0&&this.sigN[u]>0))){for(let j=0;j<3;j++)if(this._flush(u,r.free,v,j,tolF)&&this.rng()<pb){this._bind(u,r.free,TFACE,v,j,FACE);if(this.cap[u])this.cap[v]=1;this.sigP[v]=this.sigN[u];this.sigN[v]=this.sigP[u];this.dockEvents=(this.dockEvents||0)+1;R[v]={role:DOCKED};break;}continue;}
        // fill on the prev edge of a docked or fill triangle that still needs fills
        if((r.role===DOCKED||r.fill)&&r.prev>=0&&!bnd(u,r.prev)&&this.need[u]>=1){for(let j=0;j<3;j++)if(this._flush(u,r.prev,v,j,tolF)&&this.rng()<pb){
          this._bind(u,r.prev,PREV,v,j,NEXT);this.fill[v]=1;this.mark[v]=(r.role===DOCKED&&this.need[u]===1?this.dm[u]:0)^(p.pMarkErr>0&&this.rng()<p.pMarkErr?1:0);this.sigP[v]=this.sigP[u];this.sigN[v]=this.sigN[u];this.fillEvents=(this.fillEvents||0)+1;R[v]={role:SBACK,fill:true};break;}}
        continue;}
      // predation (blades): a blade tip touching a strand triangle that is not being copied cuts one of that triangle's
      // chain bonds at pCut (contact only; the victim's fragments dissolve and return their triangles)
      if(p.pCut>0)for(const [a,ra,b,rb] of [[u,ru,v,rv],[v,rv,u,ru]]){
        if(ra.role!==GROWN||(rb.role!==SFACE&&rb.role!==SBACK)||rb.free<0||bnd(b,rb.free)||this.busy[b]>0)continue;
        const [pn,st]=CODES[this.gstate[a]-1],cut=PROGRAMS[pn][st].cut;if(!cut)continue;
        // contact: centres closer than cutReach (touching triangles); never the triangle my own arm grows from
        const par=this._partner(a,ra.att),root=par>=0?this._partner(par,this.gatt[par]):-1;if(b===par||b===root)continue;
        if(Math.hypot(this._dx(this.px[b]-this.px[a]),this._dy(this.py[b]-this.py[a]))<(p.cutReach||0.75)&&this.rng()<p.pCut){
          const ch=[rb.prev,rb.next].filter(i=>i>=0&&bnd(b,i));if(ch.length){this._cut(b,ch[(this.rng()*ch.length)|0]);this.cutEvents=(this.cutEvents||0)+1;}}}
      // ring closure: a grown triangle's sticky edge binds another grown triangle's close edge
      if(ru.role===GROWN&&rv.role===GROWN){
        for(const [a,ra,b,rb] of [[u,ru,v,rv],[v,rv,u,ru]]){const [pa_,sa]=CODES[this.gstate[a]-1],[pb_,sb]=CODES[this.gstate[b]-1],cl=PROGRAMS[pb_][sb].close||[];
          for(const [rel] of PROGRAMS[pa_][sa].stick){const e=m3(ra.att+rel);if(bnd(a,e))continue;
            for(const c of cl){const f=m3(rb.att+c);if(!bnd(b,f)&&this._flush(a,e,b,f,tolC)&&this.rng()<pb){this._bind(a,e,GRING,b,f,GRING);this.ringEvents=(this.ringEvents||0)+1;}}}}
        continue;}
      // ligation (optional, pLigate): the last triangle of one strand and the first of another join by their spare end
      // edges (both stay face triangles, so the junction is a gap 0, a T bend); neither may be in a copy (busy 0)
      if(p.pLigate>0){const end=(r,x,last)=>r.role===SFACE&&r.inert>=0&&!this.fill[x]&&this.busy[x]===0&&(last?r.next<0:r.prev<0);
        for(const [a,ra,b,rb] of [[u,ru,v,rv],[v,rv,u,ru]])if(end(ra,a,true)&&end(rb,b,false)&&!bnd(a,ra.inert)&&!bnd(b,rb.inert)&&this._flush(a,ra.inert,b,rb.inert,tolC)&&this.rng()<p.pLigate){
          this._bind(a,ra.inert,NEXT,b,rb.inert,PREV);this.ligateEvents=(this.ligateEvents||0)+1;break;}}
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
      const endOK=!this.p.caps||this.cap[t],pOK=e.prev>=0?done(e.prev):rt.next<0&&endOK,nOK=e.next>=0?done(e.next):rt.prev<0&&endOK;
      if(pOK&&nOK){const q=this.bond[u*4+e.face];this.refr[u]=1;this.refr[t]=1;this.bkind[u*4+e.face]=0;this.bkind[q]=0;this._unlink(u,e.face);this.releaseEvents=(this.releaseEvents||0)+1;}}
    this._environment();
    for(let u=0;u<this.n;u++)if((this.fill[u]||this.gstate[u]||this.cap[u]||this.mark[u])&&this.bond[u*4]<0&&this.bond[u*4+1]<0&&this.bond[u*4+2]<0){this.fill[u]=0;this.gstate[u]=0;this.cap[u]=0;this.mark[u]=0;}   // a free triangle keeps no state
  }
  _cut(u,i){const q=this.bond[u*4+i];if(q<0)return;this.bkind[u*4+i]=0;this.bkind[q]=0;this._unlink(u,i);}
  // Environment (explicit external drives, labelled as such; off by default):
  //   pField  a damage field: a strand triangle loses one chain bond at pField * exposure per step; exposure = fraction
  //           of fieldDirs directions (length fieldRange) not crossing a grown triangle (grown parts cast shadows);
  //   triUndock a lone docked triangle (no chain bond) undocks (stalled copies recycle);
//   pFray   fraying: a triangle held by exactly one bond (a chain end or a part tip) that is not being copied lets go
  //           at pFray per step, so material recycles; a part tip that frays is regrown by its program.
  _environment(){
    const p=this.p,n=this.n;
    const pr=p.pHoldRelease===undefined?0.02:p.pHoldRelease;
    for(let u=0;u<n;u++)for(let k=0;k<3;k++)if(this.bond[u*4+k]>=0&&this.bkind[u*4+k]===HELD&&this.rng()<pr)this._cut(u,k);
    // dissolving (option pDissolve, with caps): a strand triangle not being copied (busy 0) that misses a cap signal (a
    // broken or uncapped strand) leaves (all its bonds go) at pDissolve; so does a grown triangle whose attach bond is gone
    if(p.pDissolve>0&&p.caps)for(let u=0;u<n;u++){let chain=0,up=false,any=false;
      for(let i=0;i<3;i++){if(this.bond[u*4+i]<0)continue;any=true;const k=this.bkind[u*4+i];if(k===PREV||k===NEXT)chain++;if(k===GUP)up=true;}
      if(!any)continue;
      const dead=this.gstate[u]?!up:(chain>0&&this.busy[u]===0&&!this.fill[u]&&(this.sigP[u]===0||this.sigN[u]===0));
      if(dead&&this.rng()<p.pDissolve){for(let i=0;i<3;i++)this._cut(u,i);this.gstate[u]=0;this.dissolveEvents=(this.dissolveEvents||0)+1;}}
    if(!(p.pField>0)&&!(p.pFray>0))return;
    for(let u=0;u<n;u++){
      let nb=0,chain=[],copying=false;
      for(let i=0;i<3;i++){if(this.bond[u*4+i]<0)continue;nb++;const k=this.bkind[u*4+i];if(k===PREV||k===NEXT)chain.push(i);if(k===FACE||k===TFACE)copying=true;}
      if(p.pField>0&&chain.length&&!copying&&this.rng()<p.pField&&this.rng()<this.exposure(u)){this._cut(u,chain[(this.rng()*chain.length)|0]);this.fieldBreaks=(this.fieldBreaks||0)+1;continue;}
      // undocking: a lone docked triangle (no copy neighbour yet) leaves at triUndock, so docks on dead
      // templates recycle (undocking one bonded to a copy in progress split copies into replicating fragments)
      if(p.triUndock>0&&chain.length===0){const f=[0,1,2].find(i=>this.bond[u*4+i]>=0&&this.bkind[u*4+i]===FACE);
        if(f!==undefined&&this.rng()<p.triUndock){for(let i=0;i<3;i++)this._cut(u,i);this.undockEvents=(this.undockEvents||0)+1;continue;}}
      if(p.pFray>0&&nb===1&&!copying&&this.busy[u]===0&&!(this.bkind[u*4]===WELD||this.bkind[u*4+1]===WELD||this.bkind[u*4+2]===WELD)&&this.rng()<p.pFray){
        for(let i=0;i<3;i++)if(this.bond[u*4+i]>=0)this._cut(u,i);this.gstate[u]=0;this.frayEvents=(this.frayEvents||0)+1;}
    }
  }
  exposure(u){
    const p=this.p,range=p.fieldRange||3,dirs=p.fieldDirs||16,near=[];
    for(let v=0;v<this.n;v++)if(this.gstate[v]){const dx=this._dx(this.px[v]-this.px[u]),dy=this._dy(this.py[v]-this.py[u]);
      if(Math.hypot(dx,dy)<range+1)near.push(this._outline(v,dx,dy));}
    if(!near.length)return 1;let open=0;
    for(let k=0;k<dirs;k++){const a=2*Math.PI*(k+0.5)/dirs,bx=range*Math.cos(a),by=range*Math.sin(a);if(!near.some(ps=>crosses(0,0,bx,by,ps)))open++;}
    return open/dirs;
  }
  step(){this.t++;this._physics();this._derive3();this._triBonds();this._triChem();}
}

// ---------------- worlds ----------------
const rolesFromGaps=gaps=>['F',...gaps.flatMap(c=>c==='m'?['M','F']:[...Array(c).fill('B'),'F'])];   // 'm' = gap 1 with a marked hidden triangle
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
  // gaps: one founder's gap list, or a list of them (several founders, spread along a diagonal)
  const ref=live.createWorld({seed:1,start:'paired',motion:'body'}).s.p,all=Array.isArray(gaps[0])?gaps:[gaps],rolesAll=all.map(g=>rolesFromGaps(g)),bands=rolesAll.map(r=>band(r.map(x=>x==='M'?'B':x)));
  const total=bands.reduce((a,b)=>a+b.length,0);
  const pc=params.pieces||{},s=new TriSim({...ref,nA:total+free+2*(pc.R||0)+3*(pc.Z||0),nB:0,nC:0,nD:0,nJ:0,nP:0,nQ:0,nE:0,energyGate:false,...params,seed,W:size,H:size,seedCount:0});
  s._tri();let next=0;const founders=bands.map((tris,k)=>{const units=tris.map(()=>next++);
    placeBand(s,units,tris,size*(k+1)/(bands.length+1),size*(k+1)/(bands.length+1));return units;});
  const units=founders[0],placed=founders.flat();
  // seeded pieces (params.pieces = {R: n, Z: n}): pre-welded letters placed without overlap
  const pieces=[];for(const [L,roles] of [['R',['F','B']],['Z',['F','B','B']]])for(let q=0;q<((params.pieces||{})[L]||0);q++){
    const tris=band(roles),us=tris.map(()=>next++);let ok=false;
    for(let a=0;a<3000&&!ok;a++){placeBand(s,us,tris,size*s.rng(),size*s.rng());
      ok=us.every(u=>placed.every(v=>{const dx=s._dx(s.px[v]-s.px[u]),dy=s._dy(s.py[v]-s.py[u]);return Math.hypot(dx,dy)>2||overlap(s._outline(u),s._outline(v,dx,dy))<1e-10;}));
      if(!ok)for(const u of us)for(let i=0;i<3;i++)if(s.bond[u*4+i]>=0)s._cut(u,i);}
    if(!ok)throw Error('could not place piece');for(const u of us)for(let i=0;i<3;i++)if(s.bond[u*4+i]>=0)s.bkind[u*4+i]=WELD;placed.push(...us);pieces.push(us);}
  for(let u=0;u<s.n;u++)if(!placed.includes(u)){let ok=false;
    for(let a=0;a<5000&&!ok;a++){s.px[u]=size*s.rng();s.py[u]=size*s.rng();s.pa[u]=2*Math.PI*s.rng();s._resetShape(u);
      ok=placed.every(v=>{const dx=s._dx(s.px[v]-s.px[u]),dy=s._dy(s.py[v]-s.py[u]);return Math.hypot(dx,dy)>2||overlap(s._outline(u),s._outline(v,dx,dy))<1e-10;});}
    if(!ok)throw Error('could not place');placed.push(u);}
  founders.forEach((f,k)=>{s.cap[f[0]]=1;s.cap[f[f.length-1]]=1;rolesAll[k].forEach((x,i)=>{if(x==='M')s.mark[f[i]]=1;});});   // founder ends carry caps (used with option caps)
  s.bondsDirty=true;for(let k=0;k<40;k++)s._derive3();   // settle the relayed signals (busy, cap signals) of the founders
  return {s,founder:units,founders};
}
// Read-only census: strands (chain-bonded components) with their gap strings and pairing.
function triCensus(s){
  s._tri();const seen=new Set(),out=[];
  for(let u=0;u<s.n;u++){if(seen.has(u))continue;const e=s._edges(u);if(e.prev>=0||e.next<0)continue;   // strand starts
    const units=[];let x=u,guard=0;while(x>=0&&!seen.has(x)&&guard++<500){seen.add(x);units.push(x);const r=s._edges(x);x=r.next>=0?s._partner(x,r.next):-1;}
    const roles=units.map(v=>s._roles(v).role),gaps=[];let c=null;
    let mk=0;for(let q=0;q<roles.length;q++){const r=roles[q];if(r===SFACE||r===DOCKED){if(c!==null)gaps.push(c===1&&mk?'m':c);c=0;mk=0;}else if(c!==null){c++;mk=s.mark[units[q]];}}
    out.push({units,gaps:gaps.join(''),n:units.length,paired:units.some(v=>s._edges(v).face>=0)});}
  return out;
}
// ---------------- pictures ----------------
function render(s,out,title,focus=null){
  // focus = {units, radius}: centre on those units and draw only blocks within radius of their centre (zoomed)
  s._tri();let W=s.p.W,S=560,k=S/W;const keep=new Set();let fx=0,fy=0;
  if(focus){const u0=focus.units[0];let sx=0,sy=0;for(const u of focus.units){sx+=s._dx(s.px[u]-s.px[u0]);sy+=s._dy(s.py[u]-s.py[u0]);}
    fx=s.px[u0]+sx/focus.units.length;fy=s.py[u0]+sy/focus.units.length;
    for(let u=0;u<s.n;u++)if((!focus.only||focus.units.includes(u))&&Math.hypot(s._dx(s.px[u]-fx),s._dy(s.py[u]-fy))<focus.radius)keep.add(u);k=S/(2*focus.radius);}
  const svg=[`<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S+30}"><rect width="${S}" height="${S+30}" fill="#f5f7f8"/><rect width="${S}" height="${S}" fill="#15222d"/>`];
  // centre on the founder's first triangle (or the focus)
  const cx=focus?0:W/2-s.px[0],cy=focus?0:W/2-s.py[0];
  const X0=u=>focus?s._dx(s.px[u]-fx)+focus.radius:((s.px[u]+cx)%W+W)%W,Y0=u=>focus?s._dy(s.py[u]-fy)+focus.radius:((s.py[u]+cy)%W+W)%W;
  for(let u=0;u<s.n;u++){if(focus&&!keep.has(u))continue;const r=s._roles(u);
    const GC=new Proxy({hex:'#b58ae6',plate:'#e78ac0',spike:'#8ab4e6',fan:'#7fd18f',hand:'#f08a5d',blade:'#e84a5f'},{get:(o,k)=>o[k]||'#b58ae6'});
    const col=r.role===GROWN?GC[CODES[s.gstate[u]-1][0]]:r.role===PIECE?'#8fa3b3':r.role===FREE?'#56646e':r.role===DOCKED?'#9fd8cf':r.role===SFACE?'#f6cf8a':'#c98f2e';
    const pts=[];for(let q=0;q<3;q++){const x=X0(u)+s.ox[u*NV+q],y=Y0(u)+s.oy[u*NV+q];pts.push(`${(x*k).toFixed(1)},${(y*k).toFixed(1)}`);}
    const isHeld=[0,1,2].some(k=>s.bond[u*4+k]>=0&&s.bkind[u*4+k]===HELD);
    svg.push(`<polygon points="${pts.join(' ')}" fill="${isHeld?'#c7d3dc':r.fill?'#3f9e8f':col}" stroke="#1b2a33" stroke-width="0.8"/>`);
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
module.exports={PROGRAMS,TriSim,createTriWorld,triCensus,render,demo,PREV,NEXT,FACE,TFACE,rolesFromGaps};
