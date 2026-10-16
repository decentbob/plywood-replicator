'use strict';
// Site probe (explore run 20261016-1602; observation only): preload it into a pair world to print, every 1000 steps from
// SP_T0 (20000), what holds the own sites of host nurseries (a triangle with a front 'c@', a root '@&' and a lysis side
// '!'): empty, a host kid, a catcher (a type with 'C@' and a root) waiting with an open front or filled; and the free
// hosts and catchers. NODE_OPTIONS='-r ./tri/siteprobe.js' node tri/demos.js pair ...
const {TriSim}=require('./sim');const T0=+(process.env.SP_T0||20000);
const orig=TriSim.prototype._copy;TriSim.prototype._copy=function(){orig.call(this);if(this.t<T0||this.t%1000)return;
  const r={empty:0,host:0,catW:0,catF:0,other:0,hosts:0,freeHost:0,freeCat:0},ty=u=>this.typeName(u),
    isHost=u=>{const t=ty(u);return t.includes('c@')&&t.includes('!')&&t.includes('&');},isCat=u=>{const t=ty(u);return t.includes('C@')&&t.includes('&');};
  for(let u=0;u<this.n;u++){if(!this.bonded(u)){if(isHost(u))r.freeHost++;else if(isCat(u))r.freeCat++;continue;}if(!isHost(u))continue;r.hosts++;
    for(let i=0;i<3;i++){if(!this.lys[u*3+i])continue;const q=this.bond[u*3+i];if(q<0){r.empty++;continue;}const v=(q/3)|0;
      if(isHost(v))r.host++;else if(isCat(v)){let open=false;for(let j=0;j<3;j++)if(this.att[v*3+j]&&!this.done[v*3+j]&&this.bond[v*3+j]<0)open=true;open?r.catW++:r.catF++;}else r.other++;}}
  console.log('probe: t='+this.t+' '+JSON.stringify(r));};
