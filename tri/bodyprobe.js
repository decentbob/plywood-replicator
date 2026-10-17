'use strict';
// Body probe (build run 20261017-0726; observation only): preload it into a pair world to print, every BP_EVERY steps
// (5000) from BP_T0 (5000), a 'body:' line: individuals (triangles joined by bonds that are not joints) by their number of
// cells, complete ones (no open front) apart, and the commonest compositions of complete individuals of 3 or more cells
// (sorted canonical types). NODE_OPTIONS='-r ./tri/bodyprobe.js' node tri/demos.js pair ...
const {TriSim,canon}=require('./sim');const T0=+(process.env.BP_T0||5000),EV=+(process.env.BP_EVERY||5000);
const orig=TriSim.prototype._copy;TriSim.prototype._copy=function(){orig.call(this);if(this.t<T0||this.t%EV)return;
  const n=this.n,P=new Int32Array(n).map((_,i)=>i),f=x=>{while(P[x]!==x)x=P[x]=P[P[x]];return x;};
  for(let u=0;u<n;u++)for(let i=0;i<3;i++){const q=this.bond[u*3+i];if(q<0||this.done[u*3+i]||this.done[q])continue;const a=f(u),b=f((q/3)|0);if(a!==b)P[a]=b;}
  const M=new Map();for(let u=0;u<n;u++){if(!this.bonded(u))continue;const r=f(u);if(!M.has(r))M.set(r,[]);M.get(r).push(u);}
  const all={},done={},big=new Map();let cells3=0;
  for(const L of M.values()){const k=L.length;all[k]=(all[k]||0)+1;
    if(L.some(x=>[0,1,2].some(i=>this.att[x*3+i]&&this.glue[x*3+i]&&!this.done[x*3+i]&&this.bond[x*3+i]<0)))continue;
    done[k]=(done[k]||0)+1;if(k>=3){cells3+=k;const key=L.map(u=>canon(this.typeName(u))).sort().join('+');big.set(key,(big.get(key)||0)+1);}}
  const h=o=>Object.keys(o).sort((a,b)=>a-b).map(k=>k+':'+o[k]).join(' ')||'-';
  console.log(`body: t=${this.t} individuals ${h(all)} | complete ${h(done)} | cells in complete 3+ ${cells3} | ${[...big].sort((a,b)=>b[1]-a[1]).slice(0,5).map(([k,v])=>v+'x '+k).join(', ')||'-'}`);};
