'use strict';
// Damage field with shadows (user, 2026-09-29): an environmental field of intensity I(x) that breaks chain bonds,
// attenuated by wall blocks. Each step, a block with lateral bonds has exposure = fraction of `dirs` directions from its
// centre whose segment of length `range` does not cross a wall polygon (walls cast shadows, like light). One of its
// lateral bonds breaks with probability pField * I(x) * exposure (rolled by the block, as core radiation R7).
// This is an explicit external drive, like pBreak/radBand; the letters' chemistry and all reactions are unchanged.
const {L,R,T_E}=require('../src/sim');
function crosses(ax,ay,bx,by,ps){  // segment a-b against polygon edges
  for(let k=0;k<ps.length;k++){const [cx,cy]=ps[k],[dx,dy]=ps[(k+1)%ps.length];
    const d=(bx-ax)*(dy-cy)-(by-ay)*(dx-cx);if(Math.abs(d)<1e-12)continue;
    const t=((cx-ax)*(dy-cy)-(cy-ay)*(dx-cx))/d,u=((cx-ax)*(by-ay)-(cy-ay)*(bx-ax))/d;
    if(t>=0&&t<=1&&u>=0&&u<=1)return true;}
  return false;
}
function field(Base,{walls,pField,intensity=()=>1,dirs=16,range=3}){
  const wall=new Set(walls);
  return class extends Base{
    exposure(u){
      const near=[];
      for(let v=0;v<this.n;v++)if(wall.has(this.type[v])){const dx=this._dx(this.px[v]-this.px[u]),dy=this._dy(this.py[v]-this.py[u]);
        if(Math.hypot(dx,dy)<range+1.5)near.push(this._outline(v,dx,dy));}
      if(!near.length)return 1;
      let open=0;
      for(let k=0;k<dirs;k++){const a=2*Math.PI*(k+0.5)/dirs,bx=range*Math.cos(a),by=range*Math.sin(a);
        if(!near.some(ps=>crosses(0,0,bx,by,ps)))open++;}
      return open/dirs;
    }
    _chemistry(){
      const p=this.p;
      for(let u=0;u<this.n;u++){
        const o=u*4,bl=this.bond[o+L]>=0,br=this.bond[o+R]>=0;if((!bl&&!br)||wall.has(this.type[u])||this.type[u]===T_E)continue;
        const base=pField*intensity(this.px[u]/p.W);if(base<=0||this.rng()>=base)continue;   // cheap pre-roll, then exposure
        if(this.rng()<this.exposure(u)){const side=bl&&br?(this.rng()<0.5?L:R):bl?L:R;this.pendingUnlink.push(o+side);this.fieldBreaks=(this.fieldBreaks||0)+1;}
      }
      return super._chemistry();
    }
  };
}
module.exports={field,crosses};
