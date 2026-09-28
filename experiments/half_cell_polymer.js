'use strict';
const {HalfCellRimSim}=require('./half_cell_rim');
// Existing membrane end-corner capture, applied to constitutively sticky W ends.
// + plays the membrane R role; - plays L. No new activation/copying state.
class HalfCellPolymerSim extends HalfCellRimSim {
  polymerContact(u,i,v,j){
    const a=this._side(u,i,[0,0,0,0]),b=this._side(v,j,[0,0,0,0]);
    const ac=this._sideCorners(u,i,[0,0]),bc=this._sideCorners(v,j,[0,0]);
    const q=ac[this.rimLabel(u,i)>0?1:0],r=bc[this.rimLabel(v,j)>0?1:0];
    const dx=this._dx(this.px[v]-this.px[u]),dy=this._dy(this.py[v]-this.py[u]);
    const gx=dx+this.ox[r]-this.ox[q],gy=dy+this.oy[r]-this.oy[q];
    const tolerance=(this.p.memLinkTol||this.p.linkDistTol)*(this.size[u]+this.size[v])/2;
    return gx*gx+gy*gy<=tolerance*tolerance&&a[2]*b[2]+a[3]*b[3]<=0;
  }
  _formRimBonds(){
    if(this.p.rimBind===false)return;
    for(let u=0;u<this.n;u++)for(let v=u+1;v<this.n;v++){
      if(!this._candidate(u,v))continue;
      for(let i=0;i<4;i++)for(let j=0;j<4;j++){
        if(!this.rimCompatible(u,i,v,j)||this.rimBond[u*4+i]>=0||this.rimBond[v*4+j]>=0)continue;
        if(!this.polymerContact(u,i,v,j))continue;
        const probability=this.p.pMem;
        if(probability<=0||(probability<1&&this.rng()>=probability))continue;
        this._linkRim(u,i,v,j); // no projection; ordinary edge pins align the parts
      }
    }
  }
}
module.exports={HalfCellPolymerSim};
