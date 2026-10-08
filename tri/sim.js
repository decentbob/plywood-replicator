'use strict';
// Typed-triangle chemistry on the triangle physics (physics.js). Rules in full: docs/RULES.md.
// Every block is the same unit triangle. Its TYPE is three side glues (counter-clockwise) plus side marks; its STATE
// is a few small per-triangle values (spent sides, relayed signals). Every rule reads one triangle, its bonds and its
// bonded partners' exposed values from the previous pass; nothing counts, traverses or reads an organism.
//
//   glue binding     complementary glues (a<->A, ..., '-' inert) bind flush sides if one triangle is already attached;
//                    parts ('@') and close-only ('.') sides
//   contact copying  a free copy blank ('?') bound to an attached triangle takes its type and lets go (with probability
//                    pErr one side of it wrong: copy error); no copy blank binds an anchor side ('|')
//   completion       the open signal from open growth fronts; '&' sides let go and are spent once none is heard
//   lysis            a triangle bonded to a lysis side ('!') is lysed; lysis is relayed one bond per pass; a lysed
//                    triangle cuts all its bonds and returns to a fresh state
//   joints           no signal and no lysis crosses a joint, a bond on which either side carries '&'
// (Chain copying, strands and the anchor's catch of a strand end were retired on 2026-10-08, core review run
// 20261008-2221: git `1284bb4`; the casting lineage's rules on 2026-10-03: git `7415fd4`; docs/RULES.md Core changes.)
const {Physics}=require('./physics');
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

const DEFAULTS={pBond:1,capture:0.6,triTolClose:0.05,openRange:120,pErr:0};
const ERRG=[...'-abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'].map(gcode);   // glues a copy error draws from

class TriSim extends Physics{
  constructor(params={},n=params.n||0){
    super({...DEFAULTS,...params},n);
    const I8=k=>new Int8Array(k);
    this.glue=I8(3*n);this.cOnly=I8(3*n);this.att=I8(3*n);this.done=I8(3*n);this.spent=I8(3*n);this.anc=I8(3*n);this.cpy=I8(3*n);this.lys=I8(3*n);
    this.role=I8(n);this.ly=I8(n);this.op=new Int16Array(n).fill(-1);   // role: 1 attached (bonded) when the pass began
    this.ev={};   // event counters (observation only)
  }
  count(k,d=1){this.ev[k]=(this.ev[k]||0)+d;}
  setType(u,str){const t=parseType(str);for(let i=0;i<3;i++){const k=u*3+i;this.spent[k]=0;this.glue[k]=t.glue[i];this.cOnly[k]=t.close[i];
    this.att[k]=t.att[i];this.done[k]=t.done[i];this.anc[k]=t.anc[i];this.cpy[k]=t.cpy[i];this.lys[k]=t.lys[i];}}
  typeName(u){return typeName(this,u);}
  // ---------------- exposed values (previous pass, one bond per pass) ----------------
  derive(){
    const n=this.n,role=this.role;
    // previous-pass values, copied into buffers kept between passes
    const sv=this._sv||(this._sv={}),old=k=>{const a=this[k];let b=sv[k];if(!b||b.length!==a.length)b=sv[k]=new a.constructor(a.length);b.set(a);return b;};
    const op0=old('op'),ly0=old('ly');
    for(let u=0;u<n;u++)role[u]=this.bonded(u)?1:0;
    // op (open signal): an attached triangle with an unbonded attach side '@' (a growth front still open) emits
    // openRange, relayed -1 per bond but not across a joint (a bond on which either side carries '&': a bud and its
    // parent do not hear each other; since run 20261006-1920); a part that hears none is complete. A completion release
    // side '&' (a spent attachment) emits nothing.
    for(let u=0;u<n;u++){let v=0,b=false;for(let i=0;i<3;i++){const q=this.bond[u*3+i];if(q>=0){b=true;if(!this.done[u*3+i]&&!this.done[q])v=Math.max(v,op0[(q/3)|0]-1);}}
      if(b&&this._front(u))v=this.p.openRange;
      // -1: free (not yet heard)
      this.op[u]=b?v:-1;}
    // ly (lysis): 1 for a triangle bonded to a partner's lysis side '!', or hearing lysis from a partner (previous pass),
    // across a bond that is not a joint (neither side carries '&': the joint between a bud and its parent stops both, as
    // it stops the open signal; contact lysis stops there since core review run 20261008-2221, candidate (v)); 2 for a
    // bonded triangle that was lysed in the previous pass (its partners have heard it: it cuts its bonds this pass)
    for(let u=0;u<n;u++){let L=0;
      for(let i=0;i<3;i++){const q=this.bond[u*3+i];if(q<0)continue;if(ly0[u]){L=2;break;}
        if(!this.done[u*3+i]&&!this.done[q]&&(this.lys[q]||ly0[(q/3)|0]))L=1;}
      this.ly[u]=L;}
  }
  // an open front: an unbonded glued attach side '@' that is not '&'. A triangle caught by glue with one emits the open
  // signal from the pass it binds (since run 20261006-1920: a part emitting only from the next pass left the cells
  // behind it a pass of silence, and the root let go before its individual was complete)
  _front(u){for(let i=0;i<3;i++){const k=u*3+i;if(this.att[k]&&this.glue[k]&&this.bond[k]<0&&!this.done[k])return true;}return false;}
  caught(v){if(this._front(v))this.op[v]=this.p.openRange;}
  // ---------------- bonds ----------------
  bind(u,i,v,j){if(this.bond[u*3+i]>=0||this.bond[v*3+j]>=0)throw Error('bind: side already bonded');this.link(u,i,v,j);}
  // binding pulls a free triangle in: v is placed exactly flush with side j against side i of u (it moves at most about
  // the binding tolerance), so every bond starts aligned (a tilted bond jams a strip against its own contacts)
  _snap(v,j,u,i){const X=k=>this.px[u]+this.ox[u*3+k],Y=k=>this.py[u]+this.oy[u*3+k];
    const a=[X(i),Y(i)],b=[X((i+1)%3),Y((i+1)%3)],c=[X((i+2)%3),Y((i+2)%3)],x=[a[0]+b[0]-c[0],a[1]+b[1]-c[1]];
    const V=[];V[j]=b;V[(j+1)%3]=a;V[(j+2)%3]=x;const cx=(a[0]+b[0]+x[0])/3,cy=(a[1]+b[1]+x[1])/3,ang=Math.atan2(V[0][1]-cy,V[0][0]-cx)-SNAP0;
    // binding needs the flush place to be free (a triangle cannot bind into an occupied site)
    const tx=this._dx(cx-this.px[v]),ty=this._dy(cy-this.py[v]),da=ang-this.pa[v];if(this.moveDepth([v],tx,ty,da,this.px[v],this.py[v])>0)return false;
    this.px[v]=this._wx(cx);this.py[v]=this._wy(cy);this.pa[v]=ang;this.resetShape(v);this.regrid(v);return true;}
  cut(u,i){if(this.bond[u*3+i]>=0)this.unlink(u,i);}
  // sides of an attached triangle that bind by glue: its free sides, if it was attached when the pass began or was caught
  // by glue in it (a copy blank that bound by its copy side binds nothing else; as a bit set: bit i for side i, so the
  // per-pair loops allocate nothing)
  _active(u){const B=this.bond,k=u*3;return this.role[u]?(B[k]<0?1:0)|(B[k+1]<0?2:0)|(B[k+2]<0?4:0):0;}
  formBonds(){
    const p=this.p,role=this.role,pairs=this.pairs,G=this.glue,gl=(u,i)=>G[u*3+i],free=u=>!this.bonded(u);
    const flush=(u,i,v,j,tol)=>this.flushGap(u,i,v,j)<=tol;
    // a free triangle binds by glue none of its close-only '.' or spent sides (an anchor side binds as its glue does: run
    // 0050's narrowing was removed in run 20261004-0820, RULES Core changes)
    const fs=(v,j)=>!this.cOnly[v*3+j]&&!this.spent[v*3+j];
    // a free triangle reaches the site beside side i of u: its centre is within `capture` of the site's centre (any
    // orientation: binding turns it into place)
    const reach=(u,i,v,j)=>{const X=k=>this.ox[u*3+k],Y=k=>this.oy[u*3+k],k2=(i+2)%3;
      const sx=(2*(X(i)+X((i+1)%3))-X(k2))/3,sy=(2*(Y(i)+Y((i+1)%3))-Y(k2))/3,dx=this._dx(this.px[v]-this.px[u])-sx,dy=this._dy(this.py[v]-this.py[u])-sy;return dx*dx+dy*dy<=p.capture*p.capture;};
    const ly=this.ly;
    for(let k=0;k<pairs.length;k+=2){let u=pairs[k],v=pairs[k+1];
      if(free(u)&&free(v))continue;                    // free triangles never bind each other (activation by attachment)
      if(ly[u]||ly[v])continue;                        // a lysed triangle binds nothing (no part rejoins a body coming apart)
      if(free(u)||free(v)){if(free(u))[u,v]=[v,u];let done=false;   // u attached, v free
        // copy side '?': a free triangle that has one binds only by it (not by a close-only one: run 20261007-2051), to
        // any free (unbonded, not spent, not anchor) side of an attached triangle, whatever its glue; it takes its partner's type in this pass (_copy) and lets
        // go, so it stays free here (it binds nothing else and is never a template). An anchor side is no template
        if(this.cpy[v*3]||this.cpy[v*3+1]||this.cpy[v*3+2]){
          for(let e=0;e<3&&!done;e++){if(this.bond[u*3+e]>=0||this.spent[u*3+e]||this.anc[u*3+e])continue;
            for(let j=0;j<3;j++)if(this.cpy[v*3+j]&&fs(v,j)&&reach(u,e,v,j)&&this.rng()<p.pBond){if(!this._snap(v,j,u,e))continue;this.bind(u,e,v,j);this.count('copyBind');done=true;break;}}
          continue;}
        const part=this.att[v*3]||this.att[v*3+1]||this.att[v*3+2];   // a part (has an attach side '@') binds only by it
        // glue binding on an active side (not close-only or spent sides)
        for(let e=0,am=this._active(u);e<3;e++){if(!(am>>e&1))continue;const g=gl(u,e);if(!g||this.cOnly[u*3+e]||this.spent[u*3+e])continue;
          for(let j=0;j<3;j++)if(gl(v,j)===comp(g)&&fs(v,j)&&(!part||this.att[v*3+j])&&(!this.att[u*3+e]||(part&&this.att[v*3+j]))&&reach(u,e,v,j)&&this.rng()<p.pBond){if(!this._snap(v,j,u,e))continue;this.bind(u,e,v,j);role[v]=1;this.count('glue');this.caught(v);done=true;break;}
          if(done)break;}
        continue;}
      // two attached triangles: glue closure between active sides (a completion side never closes, also before it is spent)
      let done=false;
      for(let e=0,am=this._active(u);e<3;e++){if(!(am>>e&1))continue;const g=gl(u,e);if(!g||this.done[u*3+e])continue;
        for(let f=0,av=this._active(v);f<3;f++)if((av>>f&1)&&gl(v,f)===comp(g)&&!this.done[v*3+f]&&flush(u,e,v,f,p.triTolClose)&&this.rng()<p.pBond){this.bind(u,e,v,f);this.count('closeGlue');done=true;break;}
        if(done)break;}
    }
  }
  // ---------------- state changes ----------------
  chemistry(){this._lyse();this._copy();}
  // contact copying: a triangle that was free when this pass began (a copy blank that bound this pass; since run
  // 20261007-2051, before which a prepared triangle welded only by a '?' side was rewritten too) and is bonded by a copy
  // side '?' and by nothing else takes
  // its partner's type (side i+k takes the partner's side j+k, i and j the bonded sides: the partner turned about the
  // shared edge; glues and marks) and lets go (copyLog, observation only: time, copy, its new type, its template).
  // Copy error (pErr, run 20261008-0651): with probability pErr one side of the copy, drawn at random, is taken wrong: with
  // 1/2 a glue drawn from inert and a..z, A..Z, else one of the six marks toggled
  _copy(){const A=['glue','cOnly','att','done','anc','cpy','lys'],pe=this.p.pErr;
    for(let u=0;u<this.n;u++)if(!this.role[u])for(let i=0;i<3;i++){if(!this.cpy[u*3+i])continue;const q=this.bond[u*3+i];if(q<0||this.bond[u*3+m3(i+1)]>=0||this.bond[u*3+m3(i+2)]>=0)continue;
      const w=(q/3)|0,j=q%3,src=[0,1,2].map(k=>A.map(a=>this[a][w*3+m3(j+k)]));
      for(let k=0;k<3;k++){const x=u*3+m3(i+k);A.forEach((a,z)=>{this[a][x]=src[k][z];});this.spent[x]=0;}
      if(pe>0&&this.rng()<pe){const x=u*3+Math.floor(this.rng()*3);if(this.rng()<0.5)this.glue[x]=ERRG[Math.floor(this.rng()*ERRG.length)];
        else{const a=A[1+Math.floor(this.rng()*6)];this[a][x]^=1;}this.count('copyError');}
      for(let k=0;k<3;k++)this.cut(u,k);this.count('copy');(this.copyLog||(this.copyLog=[])).push([this.t,u,typeName(this,u),w]);break;}}
  // completion release '&': the bond on this side is cut once its triangle hears no open signal (its part is complete);
  // the side is then spent: it binds nothing again, so the gap it leaves cannot be refilled
  _release(){for(let u=0;u<this.n;u++)if(this.op[u]===0)for(let i=0;i<3;i++){const k=u*3+i;if(!this.done[k])continue;this.spent[k]=1;if(this.bond[k]>=0){this.cut(u,i);this.count('complete');}}}
  // lysis: a triangle lysed for a whole pass (ly 2) cuts all its bonds; a lysed triangle that is then free (by its own
  // cuts or its partners') returns to a fresh state of its type (spent sides cleared), so each
  // part leaves a lysed body as the part it was made as; it hears nothing (op -1, as a free triangle: a stale completion
  // signal would spend its '&' side in the next release)
  _lyse(){const n=this.n,L=this.ly;let any=false;for(let u=0;u<n;u++)if(L[u]){any=true;break;}if(!any)return;
    for(let u=0;u<n;u++)if(L[u]===2){for(let i=0;i<3;i++)if(this.bond[u*3+i]>=0){this.cut(u,i);this.count('lyse');}}
    for(let u=0;u<n;u++)if(L[u]&&!this.bonded(u)){for(let i=0;i<3;i++)this.spent[u*3+i]=0;this.op[u]=-1;L[u]=0;}}
  step(){this._release();this.t++;this.physics();this.derive();this.formBonds();this.chemistry();}
  run(steps){for(let k=0;k<steps;k++)this.step();}
}
module.exports={TriSim,gcode,gname,comp,parseType,typeName,canon,MARKS,LOW,UP,TOK};
