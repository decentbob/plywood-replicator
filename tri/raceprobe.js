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
