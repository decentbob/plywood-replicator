'use strict';
// Lysis probe (build run 20261017-2158; observation only): preload it into a pair world to count who lyses whom and who
// raises whom. From LY_T0 (0), a 'lys:' line every LY_EVERY steps (10000): contact lysis events of the period, each
// '<count> <lysing type>:<its side> > <lysed type> joint|bond' (a triangle newly lysed by a partner's lysis side '!'; the
// relay that takes the rest of a body apart is not counted); a 'raise:' line: root bindings of the period, each
// '<count> <raiser type>:<its side> < <kid type>' (a free triangle caught by glue on a side marked '&'), the commonest
// LY_N (12) of each; a 'bounce:' line: of the period's contact lyses by a root (a '&' side: a kid that lyses its raiser),
// how many of those kids were raised again (caught by glue on a '&' side, still of the same type, within LY_BACK steps:
// 200) and how many were not (free parts that decayed, or still free); and the same for the raisers they lysed (a lysed
// triangle returns to a fresh state of its type, so it can be raised again). Types are canonical rotations.
// NODE_OPTIONS='-r ./tri/lysprobe.js' node tri/demos.js pair ...
const {TriSim,canon,typeName}=require('./sim');const T0=+(process.env.LY_T0||0),EVERY=+(process.env.LY_EVERY||10000),N=+(process.env.LY_N||12);
const side=(s,k)=>{const u=(k/3)|0,t=[...typeName(s,u).matchAll(/([^.@&|?!])([.@&|?!]*)/g)];return t[k%3][0];};
const add=(m,k)=>m.set(k,(m.get(k)||0)+1);
const BACK=+(process.env.LY_BACK||200);
const P=s=>s._ly||(s._ly={lys:new Map(),raise:new Map(),prev:null,last:null,bo:new Map(),b:[0,0],lo:new Map(),l:[0,0]});
const oDerive=TriSim.prototype.derive;TriSim.prototype.derive=function(){oDerive.call(this);const W=P(this),n=this.n;
  if(!W.prev||W.prev.length!==n)W.prev=new Int8Array(n);
  if(this.t>=T0){const lj=this.p.lysJoint,A=['glue','cOnly','att','done','anc','cpy','lys'],same=(x,q)=>A.every(a=>this[a][x]===this[a][q]);
    for(let u=0;u<n;u++){if(this.ly[u]!==1||W.prev[u])continue;
      for(let i=0;i<3;i++){const q=this.bond[u*3+i];if(q<0||!this.lys[q])continue;const jt=this.done[u*3+i]||this.done[q],w=(q/3)|0;
        if(jt&&(lj===1||lj===2&&(same(u*3,q)||same(u*3+1,q)||same(u*3+2,q))))continue;
        add(W.lys,`${canon(this.typeName(w))}:${side(this,q)} > ${canon(this.typeName(u))} ${jt?'joint':'bond'}`);
        if(this.done[q]){W.b[0]++;W.bo.set(w,[this.t,this.typeName(w)]);W.l[0]++;W.lo.set(u,[this.t,this.typeName(u)]);}break;}}}
  W.prev.set(this.ly);};
const oBind=TriSim.prototype.bind;TriSim.prototype.bind=function(u,i,v,j){oBind.call(this,u,i,v,j);P(this).last=[u,i,v,j];};
const oCaught=TriSim.prototype.caught;TriSim.prototype.caught=function(v){oCaught.call(this,v);const W=P(this),b=W.last;
  if(this.t>=T0&&b&&b[2]===v&&this.done[v*3+b[3]]){add(W.raise,`${canon(this.typeName(b[0]))}:${side(this,b[0]*3+b[1])} < ${canon(this.typeName(v))}`);
    for(const [M,c] of [[W.bo,W.b],[W.lo,W.l]]){const r=M.get(v);if(r){M.delete(v);if(this.t-r[0]<=BACK&&r[1]===this.typeName(v))c[1]++;}}}};
const oStep=TriSim.prototype.step;TriSim.prototype.step=function(){oStep.call(this);if(this.t<T0||this.t%EVERY)return;const W=P(this);
  const top=m=>[...m].sort((a,b)=>b[1]-a[1]).slice(0,N).map(([k,c])=>c+' '+k).join(', ');
  console.log(`lys: t=${this.t} | ${top(W.lys)}`);console.log(`raise: t=${this.t} | ${top(W.raise)}`);
  console.log(`bounce: t=${this.t} bounced ${W.b[0]} raised again ${W.b[1]} not ${W.b[0]-W.b[1]} | lysed raisers raised again ${W.l[1]} not ${W.l[0]-W.l[1]}`);
  W.lys.clear();W.raise.clear();W.b=[0,0];W.l=[0,0];for(const M of [W.bo,W.lo])for(const [u,r] of M)if(this.t-r[0]>BACK)M.delete(u);};
