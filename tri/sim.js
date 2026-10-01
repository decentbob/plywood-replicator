'use strict';
// Typed-triangle chemistry on the triangle physics (physics.js). Rules in full: docs/RULES.md.
// Every block is the same unit triangle. Its TYPE is three side glues (counter-clockwise) plus side marks; its STATE
// is a few small per-triangle values (charge, fill, cap, door state). Bonds carry a kind on each end (PREV/NEXT chain
// bonds, FACE/TFACE copy bonds, GLUE bonds). Every rule reads one triangle, its bonds and its bonded partners' exposed
// values from the previous pass; nothing counts, traverses or reads an organism.
//
//   glue binding   complementary glues (a<->A, ..., '-' inert) bind flush sides if one triangle is already attached
//   chain copying  dock (face glue complement), fill (2 - gap fills), close, release, refractory (busy relay)
//   casting        a triangle glue-bonded on all three sides to activated casters takes their instruction glues
//   hinges         driven flaps: triggers, latches, hand-off/drop/pulse releases, interlock signal, carried cargo
//   energy         charge state; discharged binds nothing; fuel sides; light zone recharge (environment)
const {Physics}=require('./physics');
const PREV=1,NEXT=2,FACE=3,TFACE=4,GLUE=5;                      // bond kinds (per bond end)
const FREE=0,SFACE=1,SBACK=2,DOCKED=3,GROWN=4;                  // roles (derived from bonds)
const BUSY=30;                                                  // range of the busy relay (bonds)
const m3=x=>((x%3)+3)%3;
const SNAP0=-Math.PI/3;   // angle of rest corner 0 (physics REST)

// ---------------- glues and types ----------------
// glue codes: 0 inert '-', lower case odd, upper case even; complement = the other case
// letters: a..z / A..Z, then Greek α..ω / Α..Ω (24 more pairs, for kits that need many unique glues)
const GL='αβγδεζηθικλμνξοπρστυφχψω',GU=GL.toUpperCase(),LOW='abcdefghijklmnopqrstuvwxyz'+GL,UP='ABCDEFGHIJKLMNOPQRSTUVWXYZ'+GU;
const gcode=c=>{if(c==='-')return 0;let i=LOW.indexOf(c);if(i>=0)return 2*i+1;i=UP.indexOf(c);if(i>=0)return 2*i+2;throw Error('glue letter '+c);};
const gname=g=>g===0?'-':g%2?LOW[(g-1)/2]:UP[(g-2)/2];
const comp=g=>g===0?0:g%2?g+1:g-1;
// side marks: < > hinge (pinned corner first/second) . close-only * trigger ~ latch $ fuel; release marks on a hinge side:
// ! drop, ^ hand-off, # pulse (on a trigger side, # lets the key go after it has been read)
const MARKS='<>.!^#*~$+=%@';
function parseType(str){const t=[...str.matchAll(/([a-zA-Zα-ωΑ-Ω-])([<>.!^#*~$+=%@]*)/g)];if(t.length!==3)throw Error('type needs 3 sides: '+str);
  const has=(m,c)=>m[2].includes(c)?1:0;
  return {glue:t.map(m=>gcode(m[1])),hinge:t.map(m=>has(m,'<')?1:has(m,'>')?2:0),close:t.map(m=>has(m,'.')),
    rel:t.map(m=>has(m,'!')?1:has(m,'^')?2:has(m,'#')?3:0),trig:t.map(m=>has(m,'*')),latch:t.map(m=>has(m,'~')),fuel:t.map(m=>has(m,'$')),hear:t.map(m=>has(m,'+')),wide:t.map(m=>has(m,'=')),act:t.map(m=>has(m,'%')),att:t.map(m=>has(m,'@'))};}
const typeName=(s,u)=>[0,1,2].map(i=>{const k=u*3+i;return gname(s.glue[k])+(s.hinge[k]===1?'<':s.hinge[k]===2?'>':'')+(s.cOnly[k]?'.':'')+
  (s.rel[k]===1?'!':s.rel[k]===2?'^':s.rel[k]===3?'#':'')+(s.trg[k]?'*':'')+(s.ltc[k]?'~':'')+(s.fuel[k]?'$':'')+(s.hear[k]?'+':'')+(s.wide[k]?'=':'')+(s.act[k]?'%':'')+(s.att[k]?'@':'');}).join('');
const canon=name=>{const t=[...name.matchAll(/[a-zA-Zα-ωΑ-Ω-][<>.!^#*~$+=%@]*/g)].map(m=>m[0]);return [0,1,2].map(r=>[0,1,2].map(i=>t[(i+r)%3]).join('')).sort()[0];};

const DEFAULTS={pBond:1,triTol:0.45,triTolClose:0.22,hingeAngle:Math.PI/3,hingeRate:0.05,dropTol:0.15,lockRange:12,sigRange:6,
  zip:true,caps:false,pDissolve:0,triUndock:0,pFray:0,pLoose:0,latGlue:false,castComp:false,noDock:false,light:null};

class TriSim extends Physics{
  constructor(params={},n=params.n||0){
    super({...DEFAULTS,...params},n);
    const I8=k=>new Int8Array(k);
    this.bkind=I8(3*n);this.glue=I8(3*n);this.cOnly=I8(3*n);this.rel=I8(3*n);this.trg=I8(3*n);this.ltc=I8(3*n);this.fuel=I8(3*n);this.hear=I8(3*n);this.wide=I8(3*n);this.act=I8(3*n);this.att=I8(3*n);this.hSign=I8(3*n);
    this.hRel=new Float64Array(3*n);
    this.fill=I8(n);this.role=I8(n);this.nb=I8(n);this.gap=I8(n).fill(-1);this.need=I8(n);this.busy=I8(n);this.refr=I8(n);this.cap=I8(n);this.sigP=I8(n);this.sigN=I8(n);
    this.actE=I8(n).fill(-1);this.tb=I8(n);this.nbc=I8(n);this.dOpen=I8(n);this.pw=I8(n);this.lockBusy=I8(n);this.chg=I8(n).fill(1);this.zip=I8(n);this.sg=I8(n);this.cg=I8(n);
    this.ev={};   // event counters (observation only)
  }
  count(k,d=1){this.ev[k]=(this.ev[k]||0)+d;}
  setType(u,str){const t=parseType(str);for(let i=0;i<3;i++){const k=u*3+i;this.glue[k]=t.glue[i];this.hinge[k]=t.hinge[i];this.cOnly[k]=t.close[i];
    this.rel[k]=t.rel[i];this.trg[k]=t.trig[i];this.ltc[k]=t.latch[i];this.fuel[k]=t.fuel[i];this.hear[k]=t.hear[i];this.wide[k]=t.wide[i];this.act[k]=t.act[i];this.att[k]=t.att[i];}this.bondsDirty=true;}
  typeName(u){return typeName(this,u);}
  // ---------------- roles (from a triangle's own bonds) ----------------
  _edges(u){let prev=-1,next=-1,face=-1;for(let i=0;i<3;i++){if(this.bond[u*3+i]<0)continue;const k=this.bkind[u*3+i];
    if(k===PREV)prev=i;else if(k===NEXT)next=i;else if(k===FACE)face=i;}return {prev,next,face};}
  // role and role edges: a strand triangle's free edge is a face if next = prev+1 (counter-clockwise), else a hidden
  // back; strand ends are faces with one inert (spare) edge; a docked triangle has prev f+1 and next f+2; a fill
  // attached by its next edge n has prev n+1 until its second chain bond forms
  roles(u){const e=this._edges(u);
    if(e.face>=0)return {role:DOCKED,prev:m3(e.face+1),next:m3(e.face+2),free:-1,face:e.face};
    if(e.prev<0&&e.next<0){for(let i=0;i<3;i++)if(this.bond[u*3+i]>=0&&this.bkind[u*3+i]===GLUE)return {role:GROWN};return {role:FREE};}
    if(e.prev>=0&&e.next>=0)return {role:e.next===m3(e.prev+1)?SFACE:SBACK,prev:e.prev,next:e.next,free:3-e.prev-e.next};
    if(e.next>=0&&this.fill[u])return {role:SBACK,prev:m3(e.next+1),next:e.next,free:m3(e.next+2),fill:true};
    if(e.next>=0)return {role:SFACE,prev:-1,next:e.next,free:m3(e.next+1),inert:m3(e.next+2)};
    return {role:SFACE,prev:e.prev,next:-1,free:m3(e.prev+2),inert:m3(e.prev+1)};}
  // ---------------- exposed values (previous pass, one bond per pass) ----------------
  derive(){
    const n=this.n,R=this._R=new Array(n),role=this.role,P=(u,i)=>this.partner(u,i);
    const nb0=this.nb.slice(),gap0=this.gap.slice(),need0=this.need.slice(),busy0=this.busy.slice(),lb0=this.lockBusy.slice(),zip0=this.zip.slice(),sg0=this.sg.slice();
    for(let u=0;u<n;u++){R[u]=this.roles(u);role[u]=R[u].role;}
    // busy: BUSY on a triangle with a bonded face (either end), relayed along chain bonds -1 per bond (refractory)
    for(let u=0;u<n;u++){let b=0;for(let i=0;i<3;i++){if(this.bond[u*3+i]<0)continue;const k=this.bkind[u*3+i];
        if(k===FACE||k===TFACE)b=BUSY;else if(k===PREV||k===NEXT)b=Math.max(b,busy0[P(u,i)]-1);}
      this.busy[u]=b;if(this.refr[u]&&b===0)this.refr[u]=0;}
    // caps (option): capped strand ends emit, relayed away from them; a face hearing both ends is in an intact strand
    if(this.p.caps){const sp0=this.sigP.slice(),sn0=this.sigN.slice();
      for(let u=0;u<n;u++){const e=this._edges(u);let a=0,b=0;
        if(e.prev>=0)a=Math.max(0,sp0[P(u,e.prev)]-1);else if(e.next>=0&&this.cap[u]&&e.face<0&&!this.fill[u])a=BUSY;
        if(e.next>=0)b=Math.max(0,sn0[P(u,e.next)]-1);else if(e.prev>=0&&this.cap[u]&&e.face<0&&!this.fill[u])b=BUSY;
        this.sigP[u]=a;this.sigN[u]=b;}}
    // nb: my next partner is a back; gap: hidden backs after a face (0,1,2); need: fills still to place after a docked/fill
    for(let u=0;u<n;u++){const r=R[u];this.nb[u]=0;this.gap[u]=-1;this.need[u]=0;
      if(r.role===SFACE||r.role===SBACK){const nx=r.next>=0?P(u,r.next):-1;
        if(nx>=0){this.nb[u]=role[nx]===SBACK?1:0;if(r.role===SFACE)this.gap[u]=role[nx]===SFACE?0:role[nx]===SBACK?1+nb0[nx]:-1;}
        if(r.fill&&nx>=0)this.need[u]=Math.max(0,need0[nx]-1);}
      else if(r.role===DOCKED){const t=P(u,r.face);this.need[u]=gap0[t]>=0?Math.max(0,2-gap0[t]):0;}}
    // zip: a strand triangle without a next bond (the strand's high end), or whose next partner is a face being copied
    // (a TFACE bond), or a back that hears zip from its next partner; a face takes a dock only while it hears zip, so a
    // copy grows from the high end one face after another and never encloses an empty dock site between two copies
    for(let u=0;u<n;u++){const r=R[u];let z=0;
      if(r.role===SFACE||r.role===SBACK){const e=this._edges(u);
        if(e.next<0)z=1;else{const v=P(u,e.next);if(role[v]===SFACE)z=[0,1,2].some(i=>this.bond[v*3+i]>=0&&this.bkind[v*3+i]===TFACE)?1:0;else if(role[v]===SBACK)z=zip0[v];}}
      this.zip[u]=z;}
    // lock signal (interlock): an unbonded latch side emits lockRange, relayed -1 per bond
    for(let u=0;u<n;u++){let v=0;for(let i=0;i<3;i++){if(this.ltc[u*3+i]&&this.bond[u*3+i]<0)v=this.p.lockRange;const q=this.bond[u*3+i];if(q>=0)v=Math.max(v,lb0[(q/3)|0]-1);}this.lockBusy[u]=v;}
    // tb: a trigger side of mine is bonded; nbc: my bond count; actE: my activator side (glue K bonded to a k, or an
    // activator side '%' bonded by its glue)
    const K=gcode('K');
    for(let u=0;u<n;u++){let tb=0,c=0,a=-1;for(let i=0;i<3;i++){const q=this.bond[u*3+i];if(q<0)continue;c++;if(this.trg[u*3+i])tb=1;
      if(a<0&&((this.glue[u*3+i]===K&&this.glue[q]===comp(K))||(this.act[u*3+i]&&this.glue[u*3+i]&&this.glue[q]===comp(this.glue[u*3+i]))))a=i;}this.tb[u]=tb;this.nbc[u]=c;this.actE[u]=a;}
    // sg (trigger signal on hear sides): sigRange while a trigger side of mine is bonded, else the best value heard on a
    // bonded hear side '+' (the partner's previous value - 1); a flap with sg > 0 swings
    for(let u=0;u<n;u++){let v=this.tb[u]?this.p.sigRange:0;for(let i=0;i<3;i++){if(!this.hear[u*3+i])continue;const q=this.bond[u*3+i];if(q>=0)v=Math.max(v,sg0[(q/3)|0]-1);}this.sg[u]=v;}
  }
  // ---------------- bonds ----------------
  bind(u,i,ku,v,j,kv){this.link(u,i,v,j);this.bkind[u*3+i]=ku;this.bkind[v*3+j]=kv;
    for(const [x,e,y] of [[u,i,v],[v,j,u]]){if(!this.hinge[x*3+e])continue;   // a hinge remembers its flush angle and which way is away
      {const d=this.angle(x)-this.angle(y),L=Math.PI/3;this.hRel[x*3+e]=L*Math.round(d/L);}   // rest angle on the lattice
      const c=this.hinge[x*3+e]===1?e:(e+1)%3,fx=-this.ox[x*3+c],fy=-this.oy[x*3+c];
      const dx=this._dx(this.px[x]-this.px[y]),dy=this._dy(this.py[x]-this.py[y]);this.hSign[x*3+e]=(dx*(-fy)+dy*fx)>0?1:-1;}}
  // binding pulls a free triangle in: v is placed exactly flush with side j against side i of u (it moves at most about
  // the binding tolerance), so every bond starts aligned (a tilted bond jams a strip against its own contacts)
  _snap(v,j,u,i){if(this.p.snap===false)return;const X=k=>this.px[u]+this.ox[u*3+k],Y=k=>this.py[u]+this.oy[u*3+k];
    const a=[X(i),Y(i)],b=[X((i+1)%3),Y((i+1)%3)],c=[X((i+2)%3),Y((i+2)%3)],x=[a[0]+b[0]-c[0],a[1]+b[1]-c[1]];
    const V=[];V[j]=b;V[(j+1)%3]=a;V[(j+2)%3]=x;const cx=(a[0]+b[0]+x[0])/3,cy=(a[1]+b[1]+x[1])/3;
    this.px[v]=this._wx(cx);this.py[v]=this._wy(cy);this.pa[v]=Math.atan2(V[0][1]-cy,V[0][0]-cx)-SNAP0;this.resetShape(v);}
  cut(u,i){const q=this.bond[u*3+i];if(q<0)return;this.bkind[u*3+i]=0;this.bkind[q]=0;this.unlink(u,i);}
  // sides of an attached triangle that bind by glue: free sides of a grown (glue-bonded) triangle, the back of a
  // released strand triangle, the spare edge of a strand end that is not being copied
  _active(u,r){const bnd=i=>this.bond[u*3+i]>=0;
    if(r.role===GROWN)return [0,1,2].filter(i=>!bnd(i));
    if(r.role===SBACK&&!r.fill&&r.prev>=0&&r.next>=0&&r.free>=0&&!bnd(r.free))return [r.free];
    if(r.role===SFACE&&r.inert>=0&&!bnd(r.inert)&&!(r.free>=0&&bnd(r.free)))return [r.inert];
    return [];}
  formBonds(){
    const p=this.p,R=this._R,pairs=this.pairs,G=this.glue,gl=(u,i)=>G[u*3+i],bnd=(u,i)=>this.bond[u*3+i]>=0,free=u=>R[u].role===FREE;
    const flush=(u,i,v,j,tol)=>this.flushGap(u,i,v,j)<=tol;
    for(let k=0;k<pairs.length;k+=2){let u=pairs[k],v=pairs[k+1];const ru=R[u],rv=R[v];
      if(free(u)&&free(v))continue;                    // free triangles never bind each other (activation by attachment)
      if(!this.chg[u]||!this.chg[v])continue;          // a discharged triangle binds nothing
      if(free(u)||free(v)){if(free(u))[u,v]=[v,u];const r=R[u];let done=false;   // u attached, v free
        const part=this.att[v*3]||this.att[v*3+1]||this.att[v*3+2];   // a part (has an attach side '@') binds only by it, never docks or fills
        // glue binding on an active side (not close-only sides)
        for(const e of this._active(u,r)){const g=gl(u,e);if(!g||this.cOnly[u*3+e])continue;
          for(let j=0;j<3;j++)if(gl(v,j)===comp(g)&&!this.cOnly[v*3+j]&&(!part||this.att[v*3+j])&&flush(u,e,v,j,p.triTol)&&this.rng()<p.pBond){this._snap(v,j,u,e);this.bind(u,e,GLUE,v,j,GLUE);R[v]={role:GROWN};if(!part)this.cg[v]=1;this.count('glue');done=true;break;}
          if(done)break;}
        if(done||part)continue;
        // dock on a free template face with the complementary glue
        if(!p.noDock&&r.role===SFACE&&r.free>=0&&!bnd(u,r.free)&&!this.refr[u]&&(!p.zip||this.zip[u])&&(!p.caps||(this.sigP[u]>0&&this.sigN[u]>0))){const g=gl(u,r.free);
          if(g)for(let j=0;j<3;j++)if(gl(v,j)===comp(g)&&flush(u,r.free,v,j,p.triTol)&&this.rng()<p.pBond){this._snap(v,j,u,r.free);this.bind(u,r.free,TFACE,v,j,FACE);
            if(this.cap[u])this.cap[v]=1;this.sigP[v]=this.sigN[u];this.sigN[v]=this.sigP[u];this.count('dock');R[v]={role:DOCKED};break;}
          continue;}
        // fill the prev edge of a docked or fill triangle that still needs fills (glue-agnostic unless latGlue)
        if((r.role===DOCKED||r.fill)&&r.prev>=0&&!bnd(u,r.prev)&&this.need[u]>=1){for(let j=0;j<3;j++)if((!p.latGlue||gl(v,j)===comp(gl(u,r.prev)))&&flush(u,r.prev,v,j,p.triTol)&&this.rng()<p.pBond){
          this._snap(v,j,u,r.prev);this.bind(u,r.prev,PREV,v,j,NEXT);this.fill[v]=1;this.sigP[v]=this.sigP[u];this.sigN[v]=this.sigN[u];this.count('fill');R[v]={role:SBACK,fill:true};break;}}
        continue;}
      // two attached triangles: glue closure between active sides
      let done=false;
      for(const e of this._active(u,ru)){const g=gl(u,e);if(!g)continue;
        for(const f of this._active(v,rv))if(gl(v,f)===comp(g)&&flush(u,e,v,f,p.triTolClose)&&this.rng()<p.pBond){this.bind(u,e,GLUE,v,f,GLUE);this.count('closeGlue');done=true;break;}
        if(done)break;}
      if(done)continue;
      // copy closure: prev edge of one copy triangle to next edge of another, only when no more fills are needed
      const cp=r=>r.role===DOCKED||r.fill;if(!cp(ru)||!cp(rv))continue;
      for(const [a,ra,b,rb] of [[u,ru,v,rv],[v,rv,u,ru]])
        if(ra.prev>=0&&rb.next>=0&&this.need[a]===0&&!bnd(a,ra.prev)&&!bnd(b,rb.next)&&flush(a,ra.prev,b,rb.next,p.triTolClose)&&this.rng()<p.pBond){
          this.bind(a,ra.prev,PREV,b,rb.next,NEXT);this.count('close');break;}
    }
  }
  // ---------------- state changes ----------------
  chemistry(){
    const n=this.n,p=this.p,P=(u,i)=>this.partner(u,i);
    // fills become ordinary strand triangles once they have both chain bonds
    for(let u=0;u<n;u++)if(this.fill[u]){const e=this._edges(u);if(e.prev>=0&&e.next>=0)this.fill[u]=0;}
    // release: a docked triangle whose prev and next edges are bonded to complete partners lets go of its face
    for(let u=0;u<n;u++){const e=this._edges(u);if(e.face<0)continue;const t=P(u,e.face),rt=this.roles(t);
      const done=i=>{const w=P(u,i);if(this.fill[w])return false;const ew=this._edges(w);for(const j of [ew.prev,ew.next])if(j>=0&&this.fill[P(w,j)])return false;return true;};
      const endOK=!p.caps||this.cap[t],pOK=e.prev>=0?done(e.prev):rt.next<0&&endOK,nOK=e.next>=0?done(e.next):rt.prev<0&&endOK;
      if(pOK&&nOK){this.refr[u]=1;this.refr[t]=1;this.cut(u,e.face);this.count('release');}}
    this._environment();
    for(let u=0;u<n;u++)if((this.fill[u]||this.cap[u]||this.cg[u])&&!this.bonded(u)){this.fill[u]=0;this.cap[u]=0;this.cg[u]=0;}   // a free triangle keeps no chain or caught state
    this._cast();this._light();
  }
  // options: dissolve (with caps: strands missing a cap signal fall apart), undock (lone docked triangles leave), fray
  // (a triangle held by one bond, not being copied, lets go), loose (below)
  _environment(){const p=this.p,n=this.n;
    if(p.pDissolve>0&&p.caps)for(let u=0;u<n;u++){let chain=0;for(let i=0;i<3;i++){if(this.bond[u*3+i]<0)continue;const k=this.bkind[u*3+i];if(k===PREV||k===NEXT)chain++;}
      if(chain>0&&this.busy[u]===0&&!this.fill[u]&&(this.sigP[u]===0||this.sigN[u]===0)&&this.rng()<p.pDissolve){for(let i=0;i<3;i++)this.cut(u,i);this.count('dissolve');}}
    // loose (option, proofreading): a caught triangle (bound when free, not by an attach side) held on only one or two sides
    // lets go; one held on all three sides is fully recognized (a pocket casts it at once)
    if(p.pLoose>0)for(let u=0;u<n;u++){if(!this.cg[u])continue;let nb=0;for(let i=0;i<3;i++)if(this.bond[u*3+i]>=0)nb++;
      if(nb>=1&&nb<=2&&this.rng()<p.pLoose){for(let i=0;i<3;i++)this.cut(u,i);this.count('loose');}}
    if(!(p.triUndock>0)&&!(p.pFray>0))return;
    for(let u=0;u<n;u++){let nb=0,chain=0,face=-1,copying=false;
      for(let i=0;i<3;i++){if(this.bond[u*3+i]<0)continue;nb++;const k=this.bkind[u*3+i];if(k===PREV||k===NEXT)chain++;if(k===FACE)face=i;if(k===FACE||k===TFACE)copying=true;}
      if(p.triUndock>0&&chain===0&&face>=0&&this.rng()<p.triUndock){for(let i=0;i<3;i++)this.cut(u,i);this.count('undock');continue;}
      if(p.pFray>0&&nb===1&&!copying&&this.busy[u]===0&&this.rng()<p.pFray){for(let i=0;i<3;i++)this.cut(u,i);this.count('fray');}}
  }
  // casting: a triangle glue-bonded on all three sides, each partner's activator (the side after its recognition side)
  // bonded to a k: the triangle takes each partner's instruction glue (castComp: its complement) and lets go
  _cast(){const G=this.glue;
    for(let u=0;u<this.n;u++){let ok=true;const src=[];
      for(let i=0;i<3&&ok;i++){const q=this.bond[u*3+i];if(q<0||this.bkind[u*3+i]!==GLUE){ok=false;break;}
        const w=(q/3)|0,j=q%3;if(this.actE[w]!==m3(j+1))ok=false;else src.push(G[w*3+m3(j+2)]);}
      if(!ok)continue;
      for(let i=0;i<3;i++){const k=u*3+i;G[k]=this.p.castComp?comp(src[i]):src[i];this.hinge[k]=0;this.cOnly[k]=0;this.rel[k]=0;this.trg[k]=0;this.ltc[k]=0;this.fuel[k]=0;this.hear[k]=0;this.wide[k]=0;this.act[k]=0;this.att[k]=0;this.cut(u,i);}
      this.count('cast');(this.castLog||(this.castLog=[])).push([this.t,u,typeName(this,u)]);}}
  // environment drive (labelled): free discharged triangles inside the light zone {x, y, r, p} recharge
  _light(){const L=this.p.light;if(!L)return;
    for(let u=0;u<this.n;u++){if(this.chg[u]||this.bonded(u))continue;
      if(Math.hypot(this._dx(this.px[u]-L.x),this._dy(this.py[u]-L.y))<L.r&&this.rng()<L.p){this.chg[u]=1;this.count('recharge');}}}
  // ---------------- hinge drive ----------------
  servo(){
    if(!this.hinge.some(x=>x))return;const n=this.n,p=this.p,th0=p.hingeAngle,rate=p.hingeRate,wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
    const hb=(x,e)=>this.isHingeBond(x,e),P=(u,i)=>this.partner(u,i);
    // latches let go while their door is triggered (and no other door is unlatched: interlock) or opening
    for(let u=0;u<n;u++)for(let i=0;i<3;i++){if(!this.ltc[u*3+i]||this.bond[u*3+i]<0)continue;let trig=this.tb[u],open=this.dOpen[u];
      for(let e=0;e<3;e++)if(e!==i&&this.bond[u*3+e]>=0&&!hb(u,e)){const w=P(u,e);if(this.tb[w])trig=1;if(this.dOpen[w])open=1;}
      if(open||(trig&&this.lockBusy[u]===0)){this.cut(u,i);this.count('unlatch');}}
    for(let u=0;u<n;u++)for(let i=0;i<3;i++){const q=this.bond[u*3+i];if(!this.hinge[u*3+i]||q<0)continue;const v=(q/3)|0,rel=this.rel[u*3+i];
      const th=this.wide[u*3+i]?2*Math.PI/3:th0,open=()=>wrap(this.hRel[u*3+i]+this.hSign[u*3+i]*th-(this.angle(u)-this.angle(v)));
      // releases on my own triggers: hand-off once the cargo is bonded elsewhere too; drop once the swing is complete
      for(let e=0;e<3;e++){if(!this.trg[u*3+e]||this.bond[u*3+e]<0)continue;
        if(rel===2&&this.nbc[P(u,e)]>=2){this.cut(u,e);this.count('handoff');}else if(rel===1&&Math.abs(open())<p.dropTol){this.cut(u,e);this.count('drop');}}
      // triggered: a trigger side of mine is bonded, or a triangle bonded to me (not by a hinge) reports one
      let swung=[0,1,2].some(e=>this.trg[u*3+e]&&this.bond[u*3+e]>=0);
      for(let e=0;e<3&&!swung;e++)if(this.bond[u*3+e]>=0&&!hb(u,e)&&this.tb[P(u,e)])swung=true;if(this.sg[u]>0)swung=true;
      // energy: with a fuel side (mine or my hinge partner's), a swing starts only by spending a charged carrier there
      if(swung&&!this.pw[u]&&!this.dOpen[u]){let need=false,spent=false;
        for(const x of [u,v])for(let e=0;e<3;e++){if(!this.fuel[x*3+e])continue;need=true;if(spent)continue;const w=P(x,e);
          if(w>=0&&this.chg[w]){this.cut(x,e);this.chg[w]=0;spent=true;this.count('fuelUsed');}}
        if(need){if(spent)this.pw[u]=1;else{swung=false;this.count('unfuelled');}}}
      // pulse doors: a trigger sets the open state (unless the interlock signal is heard); open reached -> reset
      if(rel===3){if(swung&&!this.dOpen[u]&&this.lockBusy[u]>0){swung=false;this.count('interlocked');}
        if(swung)this.dOpen[u]=1;if(this.dOpen[u]&&Math.abs(open())<p.dropTol){this.dOpen[u]=0;this.count('pulse');}swung=!!this.dOpen[u];}
      const target=this.hRel[u*3+i]+(swung?this.hSign[u*3+i]*th:0),err=wrap(target-(this.angle(u)-this.angle(v)));
      if(!swung&&Math.abs(err)<0.02)this.pw[u]=0;if(Math.abs(err)<0.01)continue;
      const rr=swung?rate/2:rate,d=Math.max(-rr,Math.min(rr,err));   // a loaded flap drives at half rate: a returning flap wins a push
      // the flap's body (everything bonded to it except through this hinge); locked if it reaches the partner
      const body=[u],seen=new Set(body);let locked=false;
      for(let k=0;k<body.length&&!locked;k++){const x=body[k];for(let e=0;e<3;e++){const r=this.bond[x*3+e];if(r<0||(x===u&&e===i))continue;const y=(r/3)|0;
        if(y===v){locked=true;break;}if(!seen.has(y)){seen.add(y);body.push(y);}}}
      if(locked)continue;
      const c=this.hinge[u*3+i]===1?i:(i+1)%3,Px=this.px[u]+this.ox[u*3+c],Py=this.py[u]+this.oy[u*3+c],cs=Math.cos(d),sn=Math.sin(d);
      for(const x of body){const rx=this._dx(this.px[x]-Px),ry=this._dy(this.py[x]-Py);this.rigidMove(x,cs*rx-sn*ry-rx,sn*rx+cs*ry-ry,d);
        this.px[x]=this._wx(this.px[x]);this.py[x]=this._wy(this.py[x]);}}
    // pulse triggers let the key go once it has been read
    for(let u=0;u<n;u++)if(this.tb[u])for(let e=0;e<3;e++)if(this.trg[u*3+e]&&this.rel[u*3+e]===3&&this.bond[u*3+e]>=0){this.cut(u,e);this.count('keyRelease');}
  }
  step(){this.servo();this.t++;this.physics();this.derive();this.formBonds();this.chemistry();}
  run(steps){for(let k=0;k<steps;k++)this.step();}
}
module.exports={TriSim,PREV,NEXT,FACE,TFACE,GLUE,FREE,SFACE,SBACK,DOCKED,GROWN,gcode,gname,comp,parseType,typeName,canon,MARKS,LOW,UP};
