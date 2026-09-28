'use strict';
// Isolated Q8c chemistry. C is a fixed W carrier, not a replicating letter here.
const assert=require('assert/strict');
const {Sim,F,R,K,L,T_C,T_E,T_P,T_Q,S}=require('../src/sim');
const {HalfCellContactSim}=require('./half_cell_contact');
const {PolygonContactSim}=require('./polygon_contact_physics');
const GAP=.1, COS=Math.cos(Math.PI/18);
class HalfCellRimSim extends HalfCellContactSim {
  constructor(p){
    super(p);
    this.rimBond=new Int32Array(this.n*4).fill(-1);
    this.rimEvents=0;
    assert(!this.p.pUndock&&!this.p.proof&&!this.p.maxStrain&&!this.p.snapCorners,
      'This assay excludes undocking kicks, proofreading and strain/snap rules');
  }
  // Immutable end labels: P+; Q-; W F-, K+. No cap/cap rim binding.
  rimLabel(u,i){
    const t=this.type[u];
    return t===T_P&&i===L?1:t===T_Q&&i===R?-1:t===T_C&&i===F?-1:t===T_C&&i===K?1:0;
  }
  rimCompatible(u,i,v,j){
    const a=this.rimLabel(u,i),b=this.rimLabel(v,j);
    return u!==v&&a!==0&&a===-b&&(this.type[u]===T_C||this.type[v]===T_C);
  }
  mechanicalBonds(){
    const result=new Int32Array(this.bond);
    for(let a=0;a<result.length;a++)if(this.rimBond[a]>=0){
      assert(result[a]<0,'Ordinary and rim ports overlap');result[a]=this.rimBond[a];
    }
    return result;
  }
  _physics(){
    const ordinary=this.bond;
    this.bond=this.mechanicalBonds();this.bondsDirty=true;this._inRimPhysics=true;
    try{return super._physics();}
    finally{
      this.bond=ordinary;this._inRimPhysics=false;this.bondsDirty=true;
      this._bondList(); // Never expose the temporary mechanical graph to chemistry.
    }
  }
  hasMechanicalBond(u){
    for(let i=0;i<4;i++)if(this.bond[u*4+i]>=0||this.rimBond?.[u*4+i]>=0)return true;
    return false;
  }
  _derive(u){
    if(this.type[u]===T_C){this.ss.fill(S.IDLE,u*4,u*4+4);return;}
    return Sim.prototype._derive.call(this,u);
  }
  _transition(u){if(this.type[u]!==T_C)return Sim.prototype._transition.call(this,u);}
  _computeOpen(){
    Sim.prototype._computeOpen.call(this);
    for(let u=0;u<this.n;u++)if(this.type[u]===T_C)this.open[u]=0;
  }
  compat(u,i,v,j){
    if(this.type[u]===T_C||this.type[v]===T_C)return 0;
    return Sim.prototype.compat.call(this,u,i,v,j);
  }
  edgeContact(u,i,v,j){
    const a=this._side(u,i,[0,0,0,0]),b=this._side(v,j,[0,0,0,0]);
    const ac=this._sideCorners(u,i,[0,0]),bc=this._sideCorners(v,j,[0,0]);
    let gap=0;
    for(const [q,r]of [[ac[0],bc[1]],[ac[1],bc[0]]]){
      gap=Math.max(gap,Math.hypot(this._dx(this.px[v]+this.ox[r]-this.px[u]-this.ox[q]),
        this._dy(this.py[v]+this.oy[r]-this.py[u]-this.oy[q])));
    }
    return {gap,opposed:a[2]*b[2]+a[3]*b[3]<=-COS};
  }
  _linkRim(u,i,v,j){
    assert(this.rimCompatible(u,i,v,j),'Incompatible rim labels');
    const a=u*4+i,b=v*4+j;
    assert(this.rimBond[a]<0&&this.rimBond[b]<0&&this.bond[a]<0&&this.bond[b]<0,'Occupied rim port');
    this.rimBond[a]=b;this.rimBond[b]=a;this.rimEvents++;
  }
  _formRimBonds(){
    if(this.p.rimBind===false)return;
    // Pair enumeration is a contact search, not a graph/organism predicate.
    for(let u=0;u<this.n;u++)for(let v=u+1;v<this.n;v++){
      if(!this._candidate(u,v))continue;
      for(let i=0;i<4;i++)for(let j=0;j<4;j++){
        if(!this.rimCompatible(u,i,v,j)||this.rimBond[u*4+i]>=0||this.rimBond[v*4+j]>=0)continue;
        const q=this.edgeContact(u,i,v,j);
        if(q.gap<=GAP&&q.opposed)this._linkRim(u,i,v,j);
      }
    }
  }
  _formBond(u,i,v,j){
    // Existing compatibility and geometry are checked by _tryBond. Only an
    // entirely free block may be projected; bound parts acquire pins in place.
    if(this.type[u]===T_E||this.type[v]===T_E){this._link(u,i,v,j);return true;}
    const fu=!this.hasMechanicalBond(u),fv=!this.hasMechanicalBond(v);
    if(!fu&&!fv){
      if(this.edgeContact(u,i,v,j).gap>GAP)return false;
      this._link(u,i,v,j);return true;
    }
    const [a,ia,m,im]=fv?[u,i,v,j]:[v,j,u,i];
    const sa=this._side(a,ia,[0,0,0,0]),sm=this._side(m,im,[0,0,0,0]);
    const rot=Math.atan2(-sa[3],-sa[2])-Math.atan2(sm[3],sm[2]),c=Math.cos(rot),s=Math.sin(rot);
    const tx=this._wx(this.px[a]+sa[0]-(c*sm[0]-s*sm[1])),ty=this._wy(this.py[a]+sa[1]-(s*sm[0]+c*sm[1]));
    if(!PolygonContactSim.prototype._slotFree.call(this,m,tx,ty,rot))return false;
    this._rigidMove(m,this._dx(tx-this.px[m]),this._dy(ty-this.py[m]),rot);
    this._link(u,i,v,j);return true;
  }
  _formBonds(){
    this._computeOpen();
    // Current-corner bounds replace the old size-based outer filter.
    for(let u=0;u<this.n;u++)for(let v=u+1;v<this.n;v++)if(this._candidate(u,v)){
      const dx=this._dx(this.px[v]-this.px[u]),dy=this._dy(this.py[v]-this.py[u]),d=Math.hypot(dx,dy);
      if(d>1e-12)this._tryBond(u,v,dx,dy,d);
    }
    this._formRimBonds();
  }
  _relaxFreed(){for(const u of this._bondedUnits||[])if(!this.hasMechanicalBond(u))this._resetShape(u);}
  _chemistry(){return Sim.prototype._chemistry.call(this);}
  step(){return Sim.prototype.step.call(this);}
  saveState(){assert(!this._inRimPhysics,'Save only between phases');return super.saveState();}
  check(){
    const errors=super.check();if(!this.rimBond)return errors;
    for(let a=0;a<this.rimBond.length;a++){
      const b=this.rimBond[a];if(b<0)continue;
      if(b>=this.rimBond.length||this.rimBond[b]!==a||!this.rimCompatible(a>>2,a&3,b>>2,b&3))errors.push('invalid rim bond '+a);
      if(this.bond[a]>=0)errors.push('shared port '+a);
    }
    return errors;
  }
}
module.exports={HalfCellRimSim,GAP};
