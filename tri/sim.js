'use strict';
// Typed-triangle chemistry on the triangle physics (physics.js). Rules in full: docs/RULES.md.
// Every block is the same unit triangle. Its TYPE is three side glues (counter-clockwise) plus side marks; its STATE
// is a few small per-triangle values (fill, spent sides, relayed signals). Bonds carry a kind on each end (PREV/NEXT
// chain bonds, FACE/TFACE copy bonds, GLUE bonds). Every rule reads one triangle, its bonds and its bonded partners'
// exposed values from the previous pass; nothing counts, traverses or reads an organism.
//
//   glue binding     complementary glues (a<->A, ..., '-' inert) bind flush sides if one triangle is already attached;
//                    parts ('@'), close-only ('.') and anchor ('|') sides
//   chain copying    dock (face glue complement), fill (2 - gap fills, lateral glue complement), close, release,
//                    zip (from a strand's high end while an anchor holds it: only held
//                    strands are copied)
//   contact copying  a free copy blank ('?') bound to an attached triangle takes its type and lets go (with probability
//                    pErr one side of it wrong: copy error)
//   completion       the open signal from open growth fronts (not across '&' joints); '&' sides let go and are spent
//                    once none is heard
//   lysis            a triangle bonded to a lysis side ('!') is lysed; lysis is relayed one bond per pass (not across
//                    a bond on an '&' side; with lysOneWay, not into a triangle through its own '!' side); a lysed
//                    triangle cuts all its bonds and returns to a fresh state
// (The casting lineage's rules, casting, hinges and machines, energy, proofreading, were removed on 2026-10-03: git
// `7415fd4`, docs/RULES.md Core changes.)
const {Physics}=require('./physics');
const PREV=1,NEXT=2,FACE=3,TFACE=4,GLUE=5;                      // bond kinds (per bond end)
const FREE=0,SFACE=1,SBACK=2,DOCKED=3,GROWN=4;                  // roles (derived from bonds)
const R_FREE=Object.freeze({role:FREE}),R_GROWN=Object.freeze({role:GROWN});   // shared role records (never changed)
const m3=x=>((x%3)+3)%3;
const SNAP0=-Math.PI/3;   // angle of rest corner 0 (physics REST)

// ---------------- glues and types ----------------
// glue codes: 0 inert '-', lower case odd, upper case even; complement = the other case
// letters: a..z / A..Z, then Greek α..ω / Α..Ω (24 more pairs) and 13 Cyrillic pairs (б / Б ...), for kits that need
// many unique glues (63 pairs: codes fit in Int8)
const GL='αβγδεζηθικλμνξοπρστυφχψω',GU=GL.toUpperCase(),CL='бгджзилпфцчшэ',CU=CL.toUpperCase(),LOW='abcdefghijklmnopqrstuvwxyz'+GL+CL,UP='ABCDEFGHIJKLMNOPQRSTUVWXYZ'+GU+CU;
const gcode=c=>{if(c==='-')return 0;let i=LOW.indexOf(c);if(i>=0)return 2*i+1;i=UP.indexOf(c);if(i>=0)return 2*i+2;throw Error('glue letter '+c);};
const gname=g=>g===0?'-':g%2?LOW[(g-1)/2]:UP[(g-2)/2];
const comp=g=>g===0?0:g%2?g+1:g-1;
// side marks: . close-only, @ attach (parts), & completion release, | anchor, ? copy side, ! lysis side
const MARKS='.@&|?!';
const LET='a-zA-Zα-ωΑ-Ωа-яА-Я-',TOK=new RegExp(`([${LET}])([${MARKS}]*)`,'g');
function parseType(str){const t=[...str.matchAll(TOK)];if(t.length!==3||t.map(m=>m[0]).join('')!==str)throw Error('type needs 3 sides with marks '+MARKS+': '+str);
  const has=(m,c)=>m[2].includes(c)?1:0;
  return {glue:t.map(m=>gcode(m[1])),close:t.map(m=>has(m,'.')),att:t.map(m=>has(m,'@')),done:t.map(m=>has(m,'&')),anc:t.map(m=>has(m,'|')),cpy:t.map(m=>has(m,'?')),lys:t.map(m=>has(m,'!'))};}
const sideMarks=(s,k)=>(s.cOnly[k]?'.':'')+(s.att[k]?'@':'')+(s.done[k]?'&':'')+(s.anc[k]?'|':'')+(s.cpy[k]?'?':'')+(s.lys[k]?'!':'');
const typeName=(s,u)=>{let o='';for(let k=u*3;k<u*3+3;k++)o+=gname(s.glue[k])+sideMarks(s,k);return o;};
// canon (the least of a type's three rotations) is remembered per name: demos call it on every triangle many times
const CANON=new Map();
const canon=name=>{let c=CANON.get(name);if(c!==undefined)return c;const t=[...name.matchAll(TOK)].map(m=>m[0]);c=[0,1,2].map(r=>[0,1,2].map(i=>t[(i+r)%3]).join('')).sort()[0];
  if(CANON.size>=1e5)CANON.clear();CANON.set(name,c);return c;};

const DEFAULTS={pBond:1,capture:0.6,triTolClose:0.05,openRange:120,pErr:0,lysOneWay:0};
const ERRG=[...'-abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'].map(gcode);   // glues a copy error draws from

class TriSim extends Physics{
  constructor(params={},n=params.n||0){
    super({...DEFAULTS,...params},n);
    const I8=k=>new Int8Array(k);
    this.bkind=I8(3*n);this.glue=I8(3*n);this.cOnly=I8(3*n);this.att=I8(3*n);this.done=I8(3*n);this.spent=I8(3*n);this.anc=I8(3*n);this.cpy=I8(3*n);this.lys=I8(3*n);
    this.fill=I8(n);this.role=I8(n);this.gap=I8(n).fill(-1);this.need=I8(n);
    this.zip=I8(n);this.fn=I8(n);this.ly=I8(n);this.op=new Int16Array(n).fill(-1);
    this.ev={};   // event counters (observation only)
  }
  count(k,d=1){this.ev[k]=(this.ev[k]||0)+d;}
  setType(u,str){const t=parseType(str);for(let i=0;i<3;i++){const k=u*3+i;this.spent[k]=0;this.glue[k]=t.glue[i];this.cOnly[k]=t.close[i];
    this.att[k]=t.att[i];this.done[k]=t.done[i];this.anc[k]=t.anc[i];this.cpy[k]=t.cpy[i];this.lys[k]=t.lys[i];}}
  typeName(u){return typeName(this,u);}
  // ---------------- roles (from a triangle's own bonds) ----------------
  _edges(u){let prev=-1,next=-1,face=-1;for(let i=0;i<3;i++){if(this.bond[u*3+i]<0)continue;const k=this.bkind[u*3+i];
    if(k===PREV)prev=i;else if(k===NEXT)next=i;else if(k===FACE)face=i;}return {prev,next,face};}
  // role and role edges: a strand triangle's free edge is a face if next = prev+1 (counter-clockwise), else a hidden
  // back; strand ends are faces with one inert (spare) edge; a docked triangle has prev f+1 and next f+2; a fill
  // attached by its next edge n has prev n+1 until its second chain bond forms
  roles(u){if(this.bond[u*3]<0&&this.bond[u*3+1]<0&&this.bond[u*3+2]<0)return R_FREE;const e=this._edges(u);
    if(e.face>=0)return {role:DOCKED,prev:m3(e.face+1),next:m3(e.face+2),free:-1,face:e.face};
    if(e.prev<0&&e.next<0){for(let i=0;i<3;i++)if(this.bond[u*3+i]>=0&&this.bkind[u*3+i]===GLUE)return R_GROWN;return R_FREE;}
    if(e.prev>=0&&e.next>=0)return {role:e.next===m3(e.prev+1)?SFACE:SBACK,prev:e.prev,next:e.next,free:3-e.prev-e.next};
    if(e.next>=0&&this.fill[u])return {role:SBACK,prev:m3(e.next+1),next:e.next,free:m3(e.next+2),fill:true};
    if(e.next>=0)return {role:SFACE,prev:-1,next:e.next,free:m3(e.next+1),inert:m3(e.next+2)};
    return {role:SFACE,prev:e.prev,next:-1,free:m3(e.prev+2),inert:m3(e.prev+1)};}
  // ---------------- exposed values (previous pass, one bond per pass) ----------------
  derive(){
    const n=this.n,R=this._R=new Array(n),role=this.role,P=(u,i)=>this.partner(u,i);
    // previous-pass values, copied into buffers kept between passes
    const sv=this._sv||(this._sv={}),old=k=>{const a=this[k];let b=sv[k];if(!b||b.length!==a.length)b=sv[k]=new a.constructor(a.length);b.set(a);return b;};
    const gap0=old('gap'),need0=old('need'),zip0=old('zip'),op0=old('op'),ly0=old('ly');
    for(let u=0;u<n;u++){R[u]=this.roles(u);role[u]=R[u].role;}
    // gap: hidden backs from my next partner to the next face (0, 1, 2: two or more), relayed by backs (previous pass;
    // run 20261007-2051 merged the value nb, "my next partner is a back", into it: the same need everywhere); need:
    // fills still to place after a docked/fill
    for(let u=0;u<n;u++){const r=R[u];this.gap[u]=-1;this.need[u]=0;
      if(r.role===SFACE||r.role===SBACK){const nx=r.next>=0?P(u,r.next):-1;
        if(nx>=0)this.gap[u]=role[nx]===SFACE?0:role[nx]===SBACK?1+(gap0[nx]>0?1:0):-1;
        if(r.fill&&nx>=0)this.need[u]=Math.max(0,need0[nx]-1);}
      else if(r.role===DOCKED){const t=P(u,r.face);this.need[u]=gap0[t]>=0?Math.max(0,2-gap0[t]):0;}}
    // zip: a strand's high end (no next bond) while its spare edge is held (only an anchor's catch binds it), a strand
    // triangle whose next partner is a face being copied (a TFACE bond), or a back that hears zip from its next partner;
    // a face takes a dock only while it hears zip, so only a strand held by its high end is copied (a free strand never:
    // Core changes, run 20261004-0820, the option heldCopy of run 20261003-1720 made the rule), and a copy grows from the
    // high end one face after another and never encloses an empty dock site between two copies
    for(let u=0;u<n;u++){const r=R[u];let z=0;
      if(r.role===SFACE||r.role===SBACK){const e=this._edges(u);
        if(e.next<0){const sp=r.inert;z=sp>=0&&this.bond[u*3+sp]>=0?1:0;}else{const v=P(u,e.next);if(role[v]===SFACE)z=[0,1,2].some(i=>this.bond[v*3+i]>=0&&this.bkind[v*3+i]===TFACE)?1:0;else if(role[v]===SBACK)z=zip0[v];}}
      this.zip[u]=z;}
    // op (open signal): an attached triangle with an unbonded attach side '@' (a growth front still open) emits
    // openRange, relayed -1 per bond but not across a joint (a bond on which either side carries '&': a bud and its
    // parent do not hear each other; since run 20261006-1920); a part that hears none is complete. A completion release
    // side '&' (a spent attachment) emits nothing.
    for(let u=0;u<n;u++){let v=0,b=false;for(let i=0;i<3;i++){const q=this.bond[u*3+i];if(q>=0){b=true;if(!this.done[u*3+i]&&!this.done[q])v=Math.max(v,op0[(q/3)|0]-1);}}
      if(b&&this._front(u))v=this.p.openRange;
      // -1: free (not yet heard)
      this.op[u]=b?v:-1;}
    // ly (lysis): 1 for a triangle bonded to a partner's lysis side '!', or hearing lysis from a partner (previous pass)
    // across a bond on which neither side carries '&' (the joint between a bud and its parent stops it); 2 for a
    // bonded triangle that was lysed in the previous pass (its partners have heard it: it cuts its bonds this pass).
    // lysOneWay (candidate (w), run 20261008-1522; default 0): no lysis is relayed into a triangle across a bond on its
    // own lysis side '!' (a lysis side lyses its partner and passes nothing back)
    const ow=this.p.lysOneWay;
    for(let u=0;u<n;u++){let L=0;
      for(let i=0;i<3;i++){const q=this.bond[u*3+i];if(q<0)continue;if(ly0[u]){L=2;break;}
        if(this.lys[q]||ly0[(q/3)|0]&&!this.done[u*3+i]&&!this.done[q]&&!(ow&&this.lys[u*3+i]))L=1;}
      this.ly[u]=L;}
  }
  // an open front: an unbonded glued attach side '@' that is not '&'. A triangle caught by glue with one emits the open
  // signal from the pass it binds (since run 20261006-1920: a part emitting only from the next pass left the cells
  // behind it a pass of silence, and the root let go before its individual was complete)
  _front(u){for(let i=0;i<3;i++){const k=u*3+i;if(this.att[k]&&this.glue[k]&&this.bond[k]<0&&!this.done[k])return true;}return false;}
  caught(v){if(this._front(v))this.op[v]=this.p.openRange;}
  // ---------------- bonds ----------------
  bind(u,i,ku,v,j,kv){if(this.bond[u*3+i]>=0||this.bond[v*3+j]>=0)throw Error('bind: side already bonded');this.link(u,i,v,j);this.bkind[u*3+i]=ku;this.bkind[v*3+j]=kv;}
  // binding pulls a free triangle in: v is placed exactly flush with side j against side i of u (it moves at most about
  // the binding tolerance), so every bond starts aligned (a tilted bond jams a strip against its own contacts)
  _snap(v,j,u,i){const X=k=>this.px[u]+this.ox[u*3+k],Y=k=>this.py[u]+this.oy[u*3+k];
    const a=[X(i),Y(i)],b=[X((i+1)%3),Y((i+1)%3)],c=[X((i+2)%3),Y((i+2)%3)],x=[a[0]+b[0]-c[0],a[1]+b[1]-c[1]];
    const V=[];V[j]=b;V[(j+1)%3]=a;V[(j+2)%3]=x;const cx=(a[0]+b[0]+x[0])/3,cy=(a[1]+b[1]+x[1])/3,ang=Math.atan2(V[0][1]-cy,V[0][0]-cx)-SNAP0;
    // binding needs the flush place to be free (a triangle cannot bind into an occupied site)
    const tx=this._dx(cx-this.px[v]),ty=this._dy(cy-this.py[v]),da=ang-this.pa[v];if(this.moveDepth([v],tx,ty,da,this.px[v],this.py[v])>0)return false;
    this.px[v]=this._wx(cx);this.py[v]=this._wy(cy);this.pa[v]=ang;this.resetShape(v);this.regrid(v);return true;}
  // anchor capture (physics: a connected structure moves as one body): strand end v is placed with side j flush against
  // side i of u by moving its whole body rigidly, if the place is free (all or nothing, like binding a free triangle)
  _snapBody(v,j,u,i){const X=k=>this.px[u]+this.ox[u*3+k],Y=k=>this.py[u]+this.oy[u*3+k];
    const a=[X(i),Y(i)],b=[X((i+1)%3),Y((i+1)%3)],c=[X((i+2)%3),Y((i+2)%3)],x=[a[0]+b[0]-c[0],a[1]+b[1]-c[1]];
    const V=[];V[j]=b;V[(j+1)%3]=a;V[(j+2)%3]=x;const cx=(a[0]+b[0]+x[0])/3,cy=(a[1]+b[1]+x[1])/3,ang=Math.atan2(V[0][1]-cy,V[0][0]-cx)-SNAP0;
    const body=this.bodyOf(v),tx=this._dx(cx-this.px[v]),ty=this._dy(cy-this.py[v]),da=Math.atan2(Math.sin(ang-this.pa[v]),Math.cos(ang-this.pa[v])),ox=this.px[v],oy=this.py[v];
    if(body.includes(u))return false;
    // the whole path must be clear (checked in sub-steps of at most subStep, as every move): a strand never jumps a wall
    const co=Math.cos(da),si=Math.sin(da),k=body.length,RX=new Float64Array(k),RY=new Float64Array(k);this._unwrap(body,RX,RY);
    let reach=0;for(let q=0;q<k;q++)reach=Math.max(reach,Math.hypot(RX[q],RY[q])+1/Math.sqrt(3));   // measured along bonds (a long strand is not folded)
    const nsub=Math.max(1,Math.ceil(Math.max(Math.hypot(tx,ty),reach*Math.abs(da))/this.p.subStep));
    for(let q=1;q<=nsub;q++){const g=q/nsub;if(this.moveDepth(body,g*tx,g*ty,g*da,ox,oy)>0)return false;}
    for(let q=0;q<k;q++){const w=body[q],rx=RX[q],ry=RY[q];this.px[w]=this._wx(ox+co*rx-si*ry+tx);this.py[w]=this._wy(oy+si*rx+co*ry+ty);this.pa[w]+=da;this.resetShape(w);this.regrid(w);}
    return true;}
  cut(u,i){const q=this.bond[u*3+i];if(q<0)return;this.bkind[u*3+i]=0;this.bkind[q]=0;this.unlink(u,i);}
  // sides of an attached triangle that bind by glue: the free sides of a grown (glue-bonded) triangle, and no others: a
  // strand triangle binds by dock, fill and copy closure, its end's seed only by an anchor's catch (since 2026-10-04,
  // run 20261004-0022: a free back monomer glue-capped strands' low ends; RULES, Core changes)
  // (as a bit set: bit i for side i, so the per-pair loops allocate nothing)
  _active(u,r){const B=this.bond,k=u*3;
    if(r.role===GROWN)return (B[k]<0?1:0)|(B[k+1]<0?2:0)|(B[k+2]<0?4:0);
    return 0;}
  formBonds(){
    const p=this.p,R=this._R,pairs=this.pairs,G=this.glue,gl=(u,i)=>G[u*3+i],bnd=(u,i)=>this.bond[u*3+i]>=0,free=u=>!this.bonded(u);
    const flush=(u,i,v,j,tol)=>this.flushGap(u,i,v,j)<=tol;
    // a free triangle binds (glue catch, dock, fill) by none of its close-only '.' or spent sides (an anchor side binds as
    // its glue does: run 0050's narrowing was removed in run 20261004-0820, RULES Core changes)
    const fs=(v,j)=>!this.cOnly[v*3+j]&&!this.spent[v*3+j];
    // a free triangle reaches the site beside side i of u: its centre is within `capture` of the site's centre (any
    // orientation: binding turns it into place)
    const reach=(u,i,v,j)=>{const X=k=>this.ox[u*3+k],Y=k=>this.oy[u*3+k],k2=(i+2)%3;
      const sx=(2*(X(i)+X((i+1)%3))-X(k2))/3,sy=(2*(Y(i)+Y((i+1)%3))-Y(k2))/3,dx=this._dx(this.px[v]-this.px[u])-sx,dy=this._dy(this.py[v]-this.py[u])-sy;return dx*dx+dy*dy<=p.capture*p.capture;};
    const ly=this.ly;
    for(let k=0;k<pairs.length;k+=2){let u=pairs[k],v=pairs[k+1];const ru=R[u],rv=R[v];
      if(free(u)&&free(v))continue;                    // free triangles never bind each other (activation by attachment)
      if(ly[u]||ly[v])continue;                        // a lysed triangle binds nothing (no part rejoins a body coming apart)
      if(free(u)||free(v)){if(free(u))[u,v]=[v,u];const r=R[u];let done=false;   // u attached, v free
        // copy side '?': a free triangle that has one binds only by it (not by a close-only one: run 20261007-2051), to
        // any free (unbonded, not spent, not anchor) side of an attached triangle, whatever its glue; it takes its partner's type in this pass (_copy) and lets
        // go, so it stays free here (it binds nothing else and is never a template). An anchor side is no template:
        // it binds only by catching a strand end
        if(this.cpy[v*3]||this.cpy[v*3+1]||this.cpy[v*3+2]){
          for(let e=0;e<3&&!done;e++){if(this.bond[u*3+e]>=0||this.spent[u*3+e]||this.anc[u*3+e])continue;
            for(let j=0;j<3;j++)if(this.cpy[v*3+j]&&fs(v,j)&&reach(u,e,v,j)&&this.rng()<p.pBond){if(!this._snap(v,j,u,e))continue;this.bind(u,e,GLUE,v,j,GLUE);this.count('copyBind');done=true;break;}}
          continue;}
        const part=this.att[v*3]||this.att[v*3+1]||this.att[v*3+2];   // a part (has an attach side '@') binds only by it, never docks or fills
        // glue binding on an active side (not close-only or spent sides)
        for(let e=0,am=this._active(u,r);e<3;e++){if(!(am>>e&1))continue;const g=gl(u,e);if(!g||this.cOnly[u*3+e]||this.spent[u*3+e])continue;
          for(let j=0;j<3;j++)if(gl(v,j)===comp(g)&&fs(v,j)&&(!part||this.att[v*3+j])&&(!this.att[u*3+e]||(part&&this.att[v*3+j]))&&reach(u,e,v,j)&&this.rng()<p.pBond){if(!this._snap(v,j,u,e))continue;this.bind(u,e,GLUE,v,j,GLUE);R[v]={role:GROWN};this.count('glue');this.caught(v);done=true;break;}
          if(done)break;}
        if(done||part)continue;
        // dock on a free template face with the complementary glue (a close-only or spent side binds no free triangle)
        if(r.role===SFACE&&!bnd(u,r.free)&&this.zip[u]&&!this.cOnly[u*3+r.free]&&!this.spent[u*3+r.free]){const g=gl(u,r.free);
          if(g)for(let j=0;j<3;j++)if(gl(v,j)===comp(g)&&fs(v,j)&&reach(u,r.free,v,j)&&this.rng()<p.pBond){if(!this._snap(v,j,u,r.free))continue;this.bind(u,r.free,TFACE,v,j,FACE);
            this.count('dock');R[v]={role:DOCKED};break;}
          continue;}
        // fill the prev edge of a docked or fill triangle that still needs fills, with the complement of that edge's glue
        // (an inert edge takes an inert side)
        if((r.role===DOCKED||r.fill)&&r.prev>=0&&!bnd(u,r.prev)&&this.need[u]>=1&&!this.cOnly[u*3+r.prev]&&!this.spent[u*3+r.prev]){for(let j=0;j<3;j++)if(gl(v,j)===comp(gl(u,r.prev))&&fs(v,j)&&reach(u,r.prev,v,j)&&this.rng()<p.pBond){
          if(!this._snap(v,j,u,r.prev))continue;this.bind(u,r.prev,PREV,v,j,NEXT);this.fill[v]=1;this.fn[v]=1;this.fn[u]=1;this.count('fill');R[v]={role:SBACK,fill:true};break;}}
        continue;}
      // anchor: an unbonded anchor side '|' of an attached triangle catches a strand end's seed (its unbonded spare edge,
      // also while the strand is being copied) with the complementary glue, as it would catch a free triangle: the end
      // comes within `capture` of the site and the strand is placed flush (physics moves it, with any partial copy
      // docked on it, as one body); a spent anchor side catches nothing
      {let hit=false;for(let w=0;w<2;w++){const a=w?v:u,b=w?u:v,rb=w?ru:rv;if(rb.role!==SFACE||rb.inert===undefined)continue;
          for(let e=0;e<3&&!hit;e++){if(!this.anc[a*3+e]||this.bond[a*3+e]>=0||!this.glue[a*3+e]||this.spent[a*3+e])continue;const f=rb.inert;
            if(this.bond[b*3+f]>=0||this.glue[b*3+f]!==comp(this.glue[a*3+e])||!reach(a,e,b,f)||this.rng()>=p.pBond)continue;
            if(!this._snapBody(b,f,a,e))continue;this.bind(a,e,GLUE,b,f,GLUE);this.count('anchor');hit=true;}
          if(hit)break;}
        if(hit)continue;}
      // two attached triangles: glue closure between active sides (a completion side never closes, also before it is spent)
      let done=false;
      for(let e=0,am=this._active(u,ru);e<3;e++){if(!(am>>e&1))continue;const g=gl(u,e);if(!g||this.done[u*3+e])continue;
        for(let f=0,av=this._active(v,rv);f<3;f++)if((av>>f&1)&&gl(v,f)===comp(g)&&!this.done[v*3+f]&&flush(u,e,v,f,p.triTolClose)&&this.rng()<p.pBond){this.bind(u,e,GLUE,v,f,GLUE);this.count('closeGlue');done=true;break;}
        if(done)break;}
      if(done)continue;
      // copy closure: prev edge of one copy triangle to next edge of another, only when no more fills are needed (no
      // completion side closes, as in glue closure). A triangle docked or filled in this pass closes from the next pass
      // (its role record here has no chain edges yet)
      const cp=r=>r.role===DOCKED||r.fill;if(!cp(ru)||!cp(rv))continue;
      for(const [a,ra,b,rb] of [[u,ru,v,rv],[v,rv,u,ru]])
        if(ra.prev>=0&&rb.next>=0&&this.need[a]===0&&!bnd(a,ra.prev)&&!bnd(b,rb.next)&&!this.done[a*3+ra.prev]&&!this.done[b*3+rb.next]&&flush(a,ra.prev,b,rb.next,p.triTolClose)&&this.rng()<p.pBond){
          this.bind(a,ra.prev,PREV,b,rb.next,NEXT);this.count('close');break;}
    }
  }
  // ---------------- state changes ----------------
  chemistry(){
    const n=this.n,p=this.p,P=(u,i)=>this.partner(u,i);
    this._lyse();
    // fills become ordinary strand triangles once they have both chain bonds
    for(let u=0;u<n;u++)if(this.fill[u]){const e=this._edges(u);if(e.prev>=0&&e.next>=0)this.fill[u]=0;}
    // release: a docked triangle whose prev and next edges are bonded to complete partners lets go of its face (the
    // partners' fn from the previous pass)
    for(let u=0;u<n;u++){if(!this.bonded(u))continue;const e=this._edges(u);if(e.face<0)continue;const t=P(u,e.face),rt=this.roles(t);
      const done=i=>!this.fn[P(u,i)];   // my chain partner exposes that neither it nor its chain neighbours are fills
      const pOK=e.prev>=0?done(e.prev):rt.next<0,nOK=e.next>=0?done(e.next):rt.prev<0;
      if(pOK&&nOK){this.cut(u,e.face);this.count('release');}}
    // fn (exposed for the next pass): I am a fill, or a fill is bonded to me by a chain bond
    for(let u=0;u<n;u++){let f=this.fill[u];for(let i=0;i<3&&!f;i++){const q=this.bond[u*3+i];if(q<0)continue;const k=this.bkind[u*3+i];if((k===PREV||k===NEXT)&&this.fill[(q/3)|0])f=1;}this.fn[u]=f;}
    for(let u=0;u<n;u++)if(this.fill[u]&&!this.bonded(u))this.fill[u]=0;   // a free triangle keeps no chain state
    this._copy();
  }
  // contact copying: a triangle that was free when this pass began (a copy blank that bound this pass; since run
  // 20261007-2051, before which a prepared triangle welded only by a '?' side was rewritten too) and is bonded by a copy
  // side '?' and by nothing else takes
  // its partner's type (side i+k takes the partner's side j+k, i and j the bonded sides: the partner turned about the
  // shared edge; glues and marks) and lets go (copyLog, observation only: time, copy, its new type, its template).
  // Copy error (pErr, run 20261008-0651): with probability pErr one side of the copy, drawn at random, is taken wrong: with
  // 1/2 a glue drawn from inert and a..z, A..Z, else one of the six marks toggled
  _copy(){const A=['glue','cOnly','att','done','anc','cpy','lys'],pe=this.p.pErr;
    for(let u=0;u<this.n;u++)if(this.role[u]===FREE)for(let i=0;i<3;i++){if(!this.cpy[u*3+i])continue;const q=this.bond[u*3+i];if(q<0||this.bond[u*3+m3(i+1)]>=0||this.bond[u*3+m3(i+2)]>=0)continue;
      const w=(q/3)|0,j=q%3,src=[0,1,2].map(k=>A.map(a=>this[a][w*3+m3(j+k)]));
      for(let k=0;k<3;k++){const x=u*3+m3(i+k);A.forEach((a,z)=>{this[a][x]=src[k][z];});this.spent[x]=0;}
      if(pe>0&&this.rng()<pe){const x=u*3+Math.floor(this.rng()*3);if(this.rng()<0.5)this.glue[x]=ERRG[Math.floor(this.rng()*ERRG.length)];
        else{const a=A[1+Math.floor(this.rng()*6)];this[a][x]^=1;}this.count('copyError');}
      for(let k=0;k<3;k++)this.cut(u,k);this.count('copy');(this.copyLog||(this.copyLog=[])).push([this.t,u,typeName(this,u),w]);break;}}
  // completion release '&': the bond on this side is cut once its triangle hears no open signal (its part is complete);
  // the side is then spent: it binds nothing again, so the gap it leaves cannot be refilled
  _release(){for(let u=0;u<this.n;u++)if(this.op[u]===0)for(let i=0;i<3;i++){const k=u*3+i;if(!this.done[k])continue;this.spent[k]=1;if(this.bond[k]>=0){this.cut(u,i);this.count('complete');}}}
  // lysis: a triangle lysed for a whole pass (ly 2) cuts all its bonds; a lysed triangle that is then free (by its own
  // cuts or its partners') returns to a fresh state of its type (spent sides and fill cleared), so each
  // part leaves a lysed body as the part it was made as; it hears nothing (op -1, as a free triangle: a stale completion
  // signal would spend its '&' side in the next release)
  _lyse(){const n=this.n,L=this.ly;let any=false;for(let u=0;u<n;u++)if(L[u]){any=true;break;}if(!any)return;
    for(let u=0;u<n;u++)if(L[u]===2){for(let i=0;i<3;i++)if(this.bond[u*3+i]>=0){this.cut(u,i);this.count('lyse');}}
    for(let u=0;u<n;u++)if(L[u]&&!this.bonded(u)){for(let i=0;i<3;i++)this.spent[u*3+i]=0;this.fill[u]=0;this.fn[u]=0;this.op[u]=-1;L[u]=0;}}
  step(){this._release();this.t++;this.physics();this.derive();this.formBonds();this.chemistry();}
  run(steps){for(let k=0;k<steps;k++)this.step();}
}
module.exports={TriSim,PREV,NEXT,FACE,TFACE,GLUE,FREE,SFACE,SBACK,DOCKED,GROWN,gcode,gname,comp,parseType,typeName,canon,MARKS,LOW,UP,TOK};
