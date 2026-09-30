'use strict';
// Multi-port blocks (backlog 1): growth ports on ANY polygon edge, not just the four working sides.
// config.edgeLabels = {type: {edge: {f, s, seed}}} (edge = polygon edge index, 0..nv-1; for configured shapes edges 0..3
// are also the working sides F, R, K, L). Bonds live in their own table `xBond` (n*NV, edge-indexed) and become
// ordinary corner pins in the physics. Same rule as the seeded engine: labels of one family with opposite signs, not
// both seeds, end-corner contact, and at least one block already attached (any bond on another edge or side).
const {NV,T_E}=require('../src/sim');
function ports(Base,config){
  const table=config.edgeLabels||{};
  const lab=(t,e)=>table[t]&&table[t][e]||null;
  return class extends Base{
    _x(){if(!this.xBond||this.xBond.length!==this.n*NV)this.xBond=new Int32Array(this.n*NV).fill(-1);return this.xBond;}
    xAttached(u,e){
      const x=this._x();
      for(let k=0;k<NV;k++)if(k!==e&&x[u*NV+k]>=0)return true;
      for(let k=0;k<4;k++)if(this.bond[u*4+k]>=0||(this.rimBond&&this.rimBond[u*4+k]>=0))return true;
      return false;
    }
    attached(u,i){return super.attached?super.attached(u,i)||this._x().subarray(u*NV,u*NV+NV).some(b=>b>=0):false;}
    _edge(u,e){  // world-relative corners of edge e (a0 -> a1) and its outward normal
      const n=this.corners(u),a=u*NV+e,b=u*NV+(e+1)%n,ax=this.ox[a],ay=this.oy[a],bx=this.ox[b],by=this.oy[b],l=Math.hypot(bx-ax,by-ay)||1;
      return {a,b,ax,ay,bx,by,nx:(by-ay)/l,ny:-(bx-ax)/l};
    }
    edgeContact(u,e,v,f){
      const A=this._edge(u,e),B=this._edge(v,f),dx=this._dx(this.px[v]-this.px[u]),dy=this._dy(this.py[v]-this.py[u]);
      // facing edges: a0 meets b1 and a1 meets b0 (as in core pins); both gaps within tolerance, normals opposed
      const g1=Math.hypot(dx+B.bx-A.ax,dy+B.by-A.ay),g2=Math.hypot(dx+B.ax-A.bx,dy+B.ay-A.by);
      const tol=(this.p.memLinkTol||this.p.linkDistTol)*(this.size[u]+this.size[v])/2;
      return Math.min(g1,g2)<=tol&&A.nx*B.nx+A.ny*B.ny<=0;
    }
    _formPortBonds(){
      const x=this._x(),p=this.p.pMem;
      for(let u=0;u<this.n;u++){const tu=table[this.type[u]];if(!tu)continue;
        for(let v=u+1;v<this.n;v++){const tv=table[this.type[v]];if(!tv)continue;
          if(!this._candidate(u,v))continue;
          for(const e in tu)for(const f in tv){const a=tu[e],b=tv[f],ie=+e,jf=+f;
            if(a.f!==b.f||a.s!==-b.s||(a.seed&&b.seed))continue;
            if(x[u*NV+ie]>=0||x[v*NV+jf]>=0)continue;
            if(!this.xAttached(u,ie)&&!this.xAttached(v,jf))continue;
            if(this._portAllowed&&!this._portAllowed(u,ie,v,jf))continue;
            if(!this.edgeContact(u,ie,v,jf))continue;
            if(p<1&&this.rng()>=p)continue;
            x[u*NV+ie]=v*NV+jf;x[v*NV+jf]=u*NV+ie;this.bondsDirty=true;this.portEvents=(this.portEvents||0)+1;}
        }}
    }
    _formBonds(){const r=super._formBonds();this._formPortBonds();return r;}
    _bondList(){
      const dirty=this.bondsDirty,out=super._bondList();
      if(dirty){const x=this._x();
        for(let q=0;q<x.length;q++){const r=x[q];if(r<=q)continue;
          const u=(q/NV)|0,e=q%NV,v=(r/NV)|0,f=r%NV,A=this._edge(u,e),B=this._edge(v,f);
          if(this._hinge(u,e,v,f))this.pins.push(A.a,B.b);else this.pins.push(A.a,B.b,A.b,B.a);}
        this.pinsVersion=(this.pinsVersion||0)+1;}
      return out;
    }
    // Hinges (backlog 2): a label with hinge:true (on either end) pins only the first corner of the shared edge, so the
    // part swings about that corner; hinged pairs keep their contact, so a flap cannot swing through its base.
    _hinge(u,e,v,f){const a=lab(this.type[u],e),b=lab(this.type[v],f);return !!(a&&a.hinge||b&&b.hinge);}
    _polygonContacts(){
      const c=super._polygonContacts(),x=this._x(),out=[];
      for(let k=0;k<c.length;k+=2){const u=c[k],v=c[k+1];let linked=false;
        for(let e=0;e<NV&&!linked;e++){const b=x[u*NV+e];if(b>=0&&((b/NV)|0)===v&&!this._hinge(u,e,v,b%NV))linked=true;}
        if(!linked)out.push(u,v);}
      this._sweep=out.length/2;this._calls=0;return out;
    }
  };
}
// Regular polygon with n sides of length `side`, centred, first edge vertical on the +x side (edge 0 faces +x).
function regular(n,side=1){const R=side/(2*Math.sin(Math.PI/n)),pts=[];
  for(let k=0;k<n;k++){const a=-Math.PI/n+2*Math.PI*k/n;pts.push([R*Math.cos(a),R*Math.sin(a)]);}return pts;}
module.exports={ports,regular};
