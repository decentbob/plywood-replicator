'use strict';
// Copy-rate hook (observation only; build run 20261008-0121): preload it into a pair world to tally contact copies by
// template from step CR_T0 (25000), per attached triangle of that class (sampled every 100 steps): S parts by type, R
// parts by the S on their front ('R alone': a head on a seed site still waiting); 'copyrate:' line at exit, with the share
// of samples in which an S's seed site holds a bud. NODE_OPTIONS='-r ./tri/copyrate.js' node tri/demos.js pair ...
const {TriSim,canon}=require('./sim');const T0=+(process.env.CR_T0||25000);
const C={},N={},B={};let last=0;
const cls=(s,w)=>{const t=canon(s.typeName(w));if(t.includes('C@'))return 'S '+t;for(let i=0;i<3;i++){const q=s.bond[w*3+i];if(q<0)continue;const y=(q/3)|0,ty=canon(s.typeName(y));if(ty.includes('C@')&&s.att[w*3+i]&&!s.done[w*3+i])return 'R on '+ty;}return 'R alone '+t;};
const orig=TriSim.prototype._copy;TriSim.prototype._copy=function(){const n0=this.copyLog?this.copyLog.length:0;orig.call(this);
  if(this.t<T0)return;const L=this.copyLog||[];for(let k=n0;k<L.length;k++){const c=cls(this,L[k][3]);C[c]=(C[c]||0)+1;}
  if(L.length>5000)this.copyLog=[];
  if(this.t%100===0&&this.t!==last){last=this.t;for(let u=0;u<this.n;u++){if(!this.bonded(u))continue;const c=cls(this,u);N[c]=(N[c]||0)+1;
    if(c.startsWith('S ')){const b=[0,1,2].some(i=>this.bond[u*3+i]>=0&&!this.att[u*3+i]);if(b)B[c]=(B[c]||0)+1;}}}};
process.on('exit',()=>{const rows=Object.keys(N).filter(c=>N[c]>=200).sort((a,b)=>N[b]-N[a]).map(c=>`${c}: ${(100*(C[c]||0)/N[c]).toFixed(2)} copies per 10k steps (${N[c]} samples${B[c]!==undefined?`, seed site taken ${(B[c]/N[c]).toFixed(2)}`:''})`);console.log('copyrate: '+rows.join(' | '));});
