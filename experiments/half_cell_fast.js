'use strict';
// Speed-only subclasses of the half-cell research runtime. Trajectories are bit-identical to the classes they wrap
// except for the contact prefilter noted below (checked by half_cell_fast_test.js).
// The polygon-contact solver recomputed both bounding radii for every candidate pair in every pass (about half the
// runtime). Radii depend only on corner offsets, which a contact sweep never changes (it moves centres only), so
// they are computed once at the start of each sweep. Pair lists are built with plain loops instead of subarrays.
const {T_A,T_B,T_C,T_D,T_E,T_P,T_Q,NV}=require('../src/sim');
const {separation,EPS}=require('./polygon_contact_physics');
const live=require('./half_cell_live');
const TYPES=new Set([T_A,T_B,T_C,T_D,T_E,T_P,T_Q]),MARGIN=2;

function fast(Base){
  return class extends Base{
    _radii(){
      const r=this._fr&&this._fr.length===this.n?this._fr:(this._fr=new Float64Array(this.n));
      for(let u=0;u<this.n;u++){let m=0;for(let k=u*NV,e=k+this.corners(u);k<e;k++)m=Math.max(m,Math.hypot(this.ox[k],this.oy[k]));r[u]=m;}
      return r;
    }
    _polygonContacts(){
      // Pairs further apart than their radii plus MARGIN at the start of the solve are skipped. With MARGIN 1 six of
      // twelve test worlds drifted (individual kicks); with 2 all twelve stay bit-identical (half_cell_fast_test.js).
      const contacts=[],b=this.bond,r=this._radii().slice();
      for(let u=0;u<this.n;u++){
        if(!TYPES.has(this.type[u]))throw new Error('Unsupported fixture type');
        const o=u*4;
        for(let v=u+1;v<this.n;v++){
          if((b[o]>=0&&(b[o]>>2)===v)||(b[o+1]>=0&&(b[o+1]>>2)===v)||(b[o+2]>=0&&(b[o+2]>>2)===v)||(b[o+3]>=0&&(b[o+3]>>2)===v))continue;
          if(Math.hypot(this._dx(this.px[v]-this.px[u]),this._dy(this.py[v]-this.py[u]))>r[u]+r[v]+MARGIN)continue;
          contacts.push(u,v);
        }
      }
      this._sweep=contacts.length/2;this._calls=0;
      return contacts;
    }
    _separatePair(u,v){
      if(this._calls++%this._sweep===0)this._radii();
      const r=this._fr,dx=this._dx(this.px[v]-this.px[u]),dy=this._dy(this.py[v]-this.py[u]);
      if(Math.hypot(dx,dy)>r[u]+r[v]+EPS)return;
      const move=separation(this._outline(u),this._outline(v,dx,dy));if(!move)return;
      const wu=this.w[u],wv=this.w[v],sum=wu+wv;
      this.px[u]-=move.x*wu/sum;this.py[u]-=move.y*wu/sum;
      this.px[v]+=move.x*wv/sum;this.py[v]+=move.y*wv/sum;
    }
    // During the bonding phase corners change only through _rigidMove/_resetShape, which invalidate the cache.
    _formBonds(){this._candRadii=this._radii().slice();try{return super._formBonds();}finally{this._candRadii=null;}}
    _rigidMove(u,dx,dy,da){this._candRadii=null;return super._rigidMove(u,dx,dy,da);}
    _resetShape(u){this._candRadii=null;return super._resetShape(u);}
    _candidate(u,v){
      const r=this._candRadii;if(!r)return super._candidate(u,v);
      const dx=this._dx(this.px[v]-this.px[u]),dy=this._dy(this.py[v]-this.py[u]);
      const tolerance=Math.max(this.p.distTol,this.p.linkDistTol)*(this.size[u]+this.size[v])/2;
      return Math.hypot(dx,dy)<=r[u]+r[v]+tolerance+EPS;
    }
    _shapePairs(){
      const r=this._radii(),tol=Math.max(this.p.distTol,this.p.linkDistTol);
      this.pairs.length=0;
      for(let u=0;u<this.n;u++)for(let v=u+1;v<this.n;v++){
        const dx=this._dx(this.px[v]-this.px[u]),dy=this._dy(this.py[v]-this.py[u]),tolerance=tol*(this.size[u]+this.size[v])/2;
        if(Math.hypot(dx,dy)<=r[u]+r[v]+tolerance+EPS)this.pairs.push(u,v);
      }
      return this.pairs;
    }
  };
}
const FastLiveHalfCellSim=fast(live.LiveHalfCellSim);
module.exports={fast,FastLiveHalfCellSim};
