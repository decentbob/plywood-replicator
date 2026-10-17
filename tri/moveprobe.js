'use strict';
// Move probe (explore run 20261017-2304; observation only): how far material travels. From MV_T0 (20000) every triangle's
// displacement is summed step by step (torus-unwrapped); 'move:' lines at MV_T0 + 100, 1000, 5000, 10000, 20000 give the
// root mean square displacement of all triangles, in world units (a cell is about 1). NODE_OPTIONS='-r ./tri/moveprobe.js'
const {TriSim}=require('./sim');const T0=+(process.env.MV_T0||20000),AT=[100,1000,5000,10000,20000];
const orig=TriSim.prototype._copy;TriSim.prototype._copy=function(){orig.call(this);const t=this.t;if(t<T0)return;const n=this.n;
  if(t===T0){this.mvX=Float64Array.from(this.px);this.mvY=Float64Array.from(this.py);this.mvDX=new Float64Array(n);this.mvDY=new Float64Array(n);return;}
  for(let u=0;u<n;u++){this.mvDX[u]+=this._dx(this.px[u]-this.mvX[u]);this.mvDY[u]+=this._dy(this.py[u]-this.mvY[u]);this.mvX[u]=this.px[u];this.mvY[u]=this.py[u];}
  if(AT.includes(t-T0)){let s=0;for(let u=0;u<n;u++)s+=this.mvDX[u]**2+this.mvDY[u]**2;console.log(`move: t=${t} after ${t-T0} rms ${Math.sqrt(s/n).toFixed(2)}`);}};
