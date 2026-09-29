'use strict';
// Ray particles in the polygon engine (ROADMAP 1, the user's radiation-protection hypothesis). As in the core, a ray (X)
// touching a block may break one of that block's lateral bonds (core _rayHit, unchanged: rayHit, resistances).
// Rays collide only with the configured wall types, so a wall physically shields what lies behind it; they pass
// through everything else. Observation-free; each block's chemistry is unchanged.
const {T_X,T_E}=require('../src/sim');
function rays(Base,{walls}){
  const wall=new Set(walls);
  return class extends Base{
    _polygonContacts(){
      const c=super._polygonContacts(),out=[];
      for(let k=0;k<c.length;k+=2){const u=c[k],v=c[k+1],xu=this.type[u]===T_X,xv=this.type[v]===T_X;
        if(xu&&xv)continue;if((xu&&!wall.has(this.type[v]))||(xv&&!wall.has(this.type[u])))continue;out.push(u,v);}
      this._sweep=out.length/2;this._calls=0;return out;
    }
    _formBonds(){
      super._formBonds();
      for(let x=0;x<this.n;x++)if(this.type[x]===T_X)for(let v=0;v<this.n;v++)
        if(v!==x&&this.type[v]!==T_X&&this.type[v]!==T_E&&!wall.has(this.type[v]))this._rayHit(x,v);
    }
  };
}
module.exports={rays};
