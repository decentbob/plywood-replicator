'use strict';
// Site-race probe (build run 20261016-2151; observation only): preload it into a pair world to follow every nursery site
// (an attached triangle's lysis side whose glue is the complement of its own root '@&') from step RP_T0 (20000): when a
// head that waited there leaves (its root lets go), which head takes the site next and how long it stays empty. Heads are
// N (a nursery: its own side is its root's complement with '!') or C (a cheat: any other head of a nursery's root); a taker's
// origin is 'here' (copied at this site), 'left' (copied from the head that just left it), 'home' (from another head
// raised on this same site), 'kin' (copied from another N), 'cheat' (from another C), '?' (no copy seen). 'race:' lines every RP_EVERY (10000) steps, each since the one before; and
// the copies made from C heads, by where the template was: waiting on a site (front open), on a site with its front
// filled, or free of any site. NODE_OPTIONS='-r ./tri/raceprobe.js' node tri/demos.js pair ...
const {TriSim,comp}=require('./sim');const T0=+(process.env.RP_T0||20000),EV=+(process.env.RP_EVERY||10000);
const root=(s,u)=>{for(let i=0;i<3;i++){const k=u*3+i;if(s.att[k]&&s.done[k]&&s.glue[k])return i;}return -1;};
// the nursery site side of u, or -1: a lysis side whose glue is the complement of u's root
const siteSide=(s,u)=>{const r=root(s,u);if(r<0)return -1;for(let i=0;i<3;i++){const k=u*3+i;if(i!==r&&s.lys[k]&&s.glue[k]===comp(s.glue[u*3+r]))return i;}return -1;};
// N a nursery; C a head of a nursery's root letter (one seen so far) without its site; O anything else (fillers too)
const NR=new Set(),kind=(s,u)=>{const r=root(s,u);if(r<0)return 'O';if(siteSide(s,u)>=0){NR.add(s.glue[u*3+r]);return 'N';}return NR.has(s.glue[u*3+r])?'C':'O';};
let tpl=null,emptyAt,lastKid,lastKind,blank,born;const R={},tot={},cc={wait:0,filled:0,free:0},ccT={wait:0,filled:0,free:0};
const add=(o,k,d)=>{const e=o[k]||(o[k]={n:0,d:0});e.n++;e.d+=d;};
function init(s){tpl=new Int32Array(s.n).fill(-1);emptyAt=new Float64Array(s.n).fill(-1);lastKid=new Int32Array(s.n).fill(-1);lastKind=new Array(s.n).fill('');blank=new Int32Array(s.n).fill(-1);born=new Int32Array(s.n).fill(-1);}
const _bind=TriSim.prototype.bind;TriSim.prototype.bind=function(u,i,v,j){_bind.call(this,u,i,v,j);if(!tpl)init(this);if(this.t<T0)return;
  for(const [a,x,b,y] of [[u,i,v,j],[v,j,u,i]]){if(siteSide(this,a)!==x||!this.bonded(a))continue;
    if(this.cpy[b*3+y]){blank[a]=b;continue;}
    if(this.done[b*3+y]&&this.att[b*3+y]){const o=tpl[b],org=o<0?'?':o===a?'here':o===lastKid[a]?'left':born[o]===a?'home':kind(this,o)==='N'?'kin':'cheat',k=kind(this,b)+':'+org;
      if(emptyAt[a]>=0&&lastKind[a]){add(R,lastKind[a]+' -> '+k,this.t-emptyAt[a]);add(tot,lastKind[a]+' -> '+kind(this,b),0);}emptyAt[a]=-1;born[b]=a;}}};
const _cut=TriSim.prototype.cut;TriSim.prototype.cut=function(u,i){const q=this.bond[u*3+i];if(q<0||!tpl||this.t<T0)return _cut.call(this,u,i);const v=(q/3)|0,j=q%3;
  for(const [a,x,b] of [[u,i,v],[v,j,u]]){if(siteSide(this,a)!==x)continue;if(blank[a]===b){blank[a]=-1;continue;}
    // a kid leaves (its root lets go) or the site's body comes apart (lysis: not a race)
    if(this.ly[a]||this.ly[b])emptyAt[a]=-1;else{emptyAt[a]=this.t;lastKid[a]=b;lastKind[a]=kind(this,b);}}
  _cut.call(this,u,i);};
const _copy=TriSim.prototype._copy;TriSim.prototype._copy=function(){if(!tpl)init(this);const L0=this.copyLog?this.copyLog.length:0;_copy.call(this);const L=this.copyLog||[];
  for(let k=L0;k<L.length;k++){const [,c,,w]=L[k];tpl[c]=w;if(this.t<T0||kind(this,w)!=='C')continue;
    // where the cheat template is: on a nursery site (its root bonded), front open or filled, or free of any site
    const r=root(this,w),q=r>=0?this.bond[w*3+r]:-1;let st='free';if(q>=0){let open=false;for(let e=0;e<3;e++){const x=w*3+e;if(e!==r&&this.att[x]&&!this.done[x]&&this.glue[x]&&this.bond[x]<0)open=true;}st=open?'wait':'filled';}
    cc[st]++;}
  if(this.t>=T0&&this.t%100===0)for(let u=0;u<this.n;u++){if(!this.bonded(u)||kind(this,u)!=='C')continue;const r=root(this,u),q=this.bond[u*3+r];let st='free';
    if(q>=0){let open=false;for(let e=0;e<3;e++){const x=u*3+e;if(e!==r&&this.att[x]&&!this.done[x]&&this.glue[x]&&this.bond[x]<0)open=true;}st=open?'wait':'filled';}ccT[st]++;}
  if(this.t>=T0&&this.t%EV===0)report(this.t);};
const fmt=o=>Object.entries(o).sort((a,b)=>b[1].n-a[1].n).map(([k,e])=>`${k} ${e.n}${e.d?` (${(e.d/e.n).toFixed(0)})`:''}`).join(', ');
function report(t){const ce=Object.entries(cc).map(([k,n])=>`${k} ${n} (${ccT[k]?(100*n/ccT[k]).toFixed(2):'-'}/10k)`).join(', ');
  console.log(`race: t=${t} | ${fmt(R)} | by leaver ${fmt(tot)} | C copies by template place: ${ce}`);
  for(const o of [R,tot])for(const k in o)delete o[k];for(const k in cc){cc[k]=0;ccT[k]=0;}}
// Fates (explore run 20261016-2258, observation only): every free copy of a head of kind C or N made from RP_T0 on is
// followed to its fate: 'site' (it binds an empty nursery site by its root), 'decay' (it turns back into a blank while
// free), 'other' (it binds anything else); per kind the share, the mean age at its fate and the mean distance from where
// it was made. Every 100 steps (at step 25 of each 100, between decay steps) a sample of attached C and N heads, empty
// nursery sites (an attached N's site side unbonded), free C copies and free blanks. 'fate:' lines with each 'race:'
// line give the restated law's three factors: rB, blank arrivals per empty site per step; pi, C copies per attached C per
// step; rho, the share of C copies that bind a site per empty site; and n* = rB / (pi rho) against the sampled N count;
// rC, C arrivals per empty site per step, and the births ratio rB C / rC (the N count if births follow the race)
const FT=new Map(),FA={},SM={n:0,C:0,N:0,E:0,F:0,B:0},SB={blank:0,C:0,N:0},CP={C:0,N:0};
const fate=(s,u,f)=>{const o=FT.get(u);FT.delete(u);const k=o.k+':'+f,e=FA[k]||(FA[k]={n:0,age:0,d:0});e.n++;e.age+=s.t-o.t;e.d+=Math.hypot(s._dx(s.px[u]-o.x),s._dy(s.py[u]-o.y));};
const _bind2=TriSim.prototype.bind;TriSim.prototype.bind=function(u,i,v,j){const fu=!this.bonded(u),fv=!this.bonded(v);_bind2.call(this,u,i,v,j);if(this.t<T0)return;
  for(const [a,x,b,y,fb] of [[u,i,v,j,fv],[v,j,u,i,fu]]){if(!fb)continue;const st=siteSide(this,a)===x&&this.bonded(a)&&this.att[b*3+y]&&this.done[b*3+y];
    if(siteSide(this,a)===x&&this.bonded(a)){if(this.cpy[b*3+y])SB.blank++;else if(FT.has(b))SB[FT.get(b).k]++;}
    if(FT.has(b))fate(this,b,st?'site':'other');}};
const _copy2=TriSim.prototype._copy;TriSim.prototype._copy=function(){if(this.t>=T0)for(const u of [...FT.keys()])if(this.cpy[u*3]||this.cpy[u*3+1]||this.cpy[u*3+2])fate(this,u,'decay');
  const L0=this.copyLog?this.copyLog.length:0;_copy2.call(this);const L=this.copyLog||[];
  if(this.t>=T0){for(let k=L0;k<L.length;k++){const [,c,,w]=L[k],kw=kind(this,w);if(kw!=='C'&&kw!=='N')continue;CP[kw]++;if(FT.has(c))FT.delete(c);FT.set(c,{t:this.t,x:this.px[c],y:this.py[c],k:kw});}
    if(this.t%100===25){SM.n++;for(let u=0;u<this.n;u++){const kd=kind(this,u);if(this.bonded(u)){if(kd==='C')SM.C++;else if(kd==='N'){SM.N++;const e=siteSide(this,u);if(this.bond[u*3+e]<0)SM.E++;}}
      else if(this.cpy[u*3]||this.cpy[u*3+1]||this.cpy[u*3+2])SM.B++;else if(FT.has(u)&&FT.get(u).k==='C')SM.F++;}}
    if(this.t%EV===0)fateReport(this.t);}};
function fateReport(t){const m=Math.max(1,SM.n),E=SM.E/m,C=SM.C/m,N=SM.N/m,steps=100*SM.n,rB=SB.blank/Math.max(1,SM.E*100),pi=CP.C/Math.max(1,SM.C*100),rC=SB.C/Math.max(1,SM.E*100),
    nC=Object.entries(FA).filter(([k])=>k[0]==='C').reduce((a,[,e])=>a+e.n,0),rho=(FA['C:site']?FA['C:site'].n:0)/Math.max(1,nC)/Math.max(1e-9,E);
  const f=Object.entries(FA).sort().map(([k,e])=>`${k} ${e.n} (age ${(e.age/e.n).toFixed(0)}, dist ${(e.d/e.n).toFixed(1)})`).join(', ');
  console.log(`fate: t=${t} | ${f} | sample: N ${N.toFixed(0)} C ${C.toFixed(0)} emptySites ${E.toFixed(1)} freeC ${(SM.F/m).toFixed(1)} blanks ${(SM.B/m).toFixed(0)} | site binds: blank ${SB.blank} C ${SB.C} N ${SB.N} | copies C ${CP.C} N ${CP.N} | rB ${rB.toExponential(2)} pi ${pi.toExponential(2)} rho ${rho.toExponential(2)} rC ${rC.toExponential(2)} n* ${(rB/Math.max(1e-12,pi*rho)).toFixed(0)} births ratio ${(rB*C/Math.max(1e-12,rC)).toFixed(0)} (N ${N.toFixed(0)}) over ${steps} steps`);
  for(const k in FA)delete FA[k];for(const k in SM)SM[k]=0;for(const k in SB)SB[k]=0;CP.C=CP.N=0;}
