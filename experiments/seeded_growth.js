'use strict';
// Generic seeded growth (COMPLEXITY_MAP step 1). One rule over a port-label table replaces the half-cell's hard-coded
// rim labels, so new structures are configuration:
//   - a label is {f: family, s: +1/-1, seed: bool} on (block type, working side);
//   - two ports bind by the existing end-corner polymer contact if they share a family, have opposite signs, and are
//     not both seeds (seed ports sit on copied chain blocks; the rest are structural parts);
//   - a port can bind only if its block is attached elsewhere, or its partner's is (activation by attachment,
//     generalizing RESULTS 97's anchor rule: any other ordinary or growth bond of the block counts);
//   - structural types never take part in letter chemistry (as W in RESULTS 84–98).
// Each block reads only its own bonds and labels; there is no new state, relay or counter.
//
// Optional reversible programming (COMPLEXITY_MAP 3c, process M), config.programmable = {type, kinds, pForget}:
//   - blocks of that type carry one small state `kind` (0 = blank); kinds[k] is its label table;
//   - a label may carry write:k. A programmable block bonded to such a port sets its OWN kind to k (reads the bonded
//     partner's exposed label, writes itself), permanently;
//   - it then requests release of its own growth bonds that its new labels no longer match (the state change drives
//     release; no timing program);
//   - an unattached programmed block returns to blank with probability pForget per step (reversal and recycling).
const {Sim,S,F,R,K,L,NV,T_A,T_B,T_C,T_D,T_P,T_Q}=require('../src/sim');
// Custom parts (user, 2026-09-29): a structure meant to have a fixed length and form is ONE block with its own polygon,
// not a run of small repeating blocks (which grows to random or unbounded length). config.shapes = {type: [[x,y],...]}
// gives corners (counter-clockwise, about the centroid); edges 0..3 are F, R, K, L. Mass and moment of inertia follow
// the polygon's area (unit density), so a unit square keeps the core's values (w 1, wr 6).
function polyMass(pts){let A=0,I=0;for(let k=0;k<pts.length;k++){const [x0,y0]=pts[k],[x1,y1]=pts[(k+1)%pts.length],c=x0*y1-x1*y0;
  A+=c/2;I+=c*(x0*x0+x0*x1+x1*x1+y0*y0+y0*y1+y1*y1)/12;}return {area:Math.abs(A),inertia:Math.abs(I)};}
function rod(length,width=1){const a=length/2,b=width/2;return [[a,-b],[a,b],[-a,b],[-a,-b]];}

// The half-cell (RESULTS 97–98) as a configuration: P and Q seed family 1 on their outer lateral sides; W carries it.
const HALF_CELL={structural:[T_C],labels:{[T_P]:{[L]:{f:1,s:1,seed:true}},[T_Q]:{[R]:{f:1,s:-1,seed:true}},
  [T_C]:{[F]:{f:1,s:-1},[K]:{f:1,s:1}}}};

function seeded(Base,config){
  const structural=new Set(config.structural),labels=config.labels,prog=config.programmable||null;
  const byType=(t,i)=>labels[t]&&labels[t][i]||null;
  return class extends Base{
    _initGeometry(){
      super._initGeometry();
      for(const [key,pts] of Object.entries(config.shapes||{})){
        const t=+key,{area,inertia}=polyMass(pts);this.nv[t]=pts.length;
        pts.forEach((q,k)=>{this.rx[t*NV+k]=q[0];this.ry[t*NV+k]=q[1];});
        for(let i=0;i<4;i++)this.edgeOf[t*4+i]=i;
        for(let u=0;u<this.n;u++)if(this.type[u]===t){this.size[u]=Math.sqrt(area);this.w[u]=1/area;this.wr[u]=1/inertia;
          if(this.vw)this.vw[u]=this.nv[t]*this.w[u];this._resetShape(u);}
      }
    }
    _kinds(){if(!this.kind||this.kind.length!==this.n)this.kind=new Int8Array(this.n);return this.kind;}
    labelOf(u,i){
      const t=this.type[u];
      if(prog&&t===prog.type){const k=prog.kinds[this._kinds()[u]];return k&&k[i]||null;}
      return byType(t,i);
    }
    rimLabel(u,i){const e=this.labelOf(u,i);return e?e.s*e.f:0;}
    rimCompatible(u,i,v,j){
      const a=this.labelOf(u,i),b=this.labelOf(v,j);
      return u!==v&&!!a&&!!b&&a.f===b.f&&a.s===-b.s&&!(a.seed&&b.seed);
    }
    attached(u,i){
      for(let k=0;k<4;k++)if(k!==i&&(this.bond[u*4+k]>=0||this.rimBond[u*4+k]>=0))return true;
      return false;
    }
    polymerContact(u,i,v,j){return (this.attached(u,i)||this.attached(v,j))&&super.polymerContact(u,i,v,j);}
    _derive(u){if(structural.has(this.type[u])){this.ss.fill(S.IDLE,u*4,u*4+4);return;}return Sim.prototype._derive.call(this,u);}
    _transition(u){
      if(!structural.has(this.type[u]))return Sim.prototype._transition.call(this,u);
      // Structural decay (turnover; user's patchy-environment idea): config.decay = {pRim, band}. Each growth bond of a
      // structural block breaks at pRim per step while the block is in the hot band x < band*W (band 1 = everywhere).
      // Rolled once per bond (by the lower-index structural end). A local environmental drive, as core pBreak/radBand.
      // Maintenance by attachment (config.release, ROADMAP 1a): a growth bond is kept only while at least one of its two
      // blocks is attached elsewhere. When a chain breaks and a seed block drifts free with its part, both let go and
      // return to the soup. The structural block requests release of its own incident bond; reads own and partner bonds.
      if(config.release)for(let i=0;i<4;i++){const b=this.rimBond[u*4+i];
        if(b>=0&&!this.attached(u,i)&&!this.attached(b>>2,b&3)){this.rimBond[u*4+i]=-1;this.rimBond[b]=-1;this.releaseEvents=(this.releaseEvents||0)+1;}}
      const dec=config.decay;
      if(dec&&dec.pRim>0&&(dec.band>=1||this.px[u]<dec.band*this.p.W))for(let i=0;i<4;i++){const b=this.rimBond[u*4+i];
        if(b>=0&&(!structural.has(this.type[b>>2])||(b>>2)>u)&&this.rng()<dec.pRim){this.rimBond[u*4+i]=-1;this.rimBond[b]=-1;}}
      if(!prog||this.type[u]!==prog.type)return;
      const kind=this._kinds(),rb=this.rimBond;
      // read the bonded partners' exposed write marks; adopt the first one that differs from my kind
      for(let i=0;i<4;i++){const b=rb[u*4+i];if(b<0)continue;const w=this.labelOf(b>>2,b&3);
        if(w&&w.write!==undefined&&w.write!==kind[u]){kind[u]=w.write;this.programEvents=(this.programEvents||0)+1;break;}}
      // release my own growth bonds that my labels no longer match
      for(let i=0;i<4;i++){const b=rb[u*4+i];if(b>=0&&!this.rimCompatible(u,i,b>>2,b&3)){rb[u*4+i]=-1;rb[b]=-1;}}
      // forget when free
      if(kind[u]!==0&&prog.pForget>0&&![0,1,2,3].some(i=>rb[u*4+i]>=0||this.bond[u*4+i]>=0)&&this.rng()<prog.pForget)kind[u]=0;
    }
    _computeOpen(){Sim.prototype._computeOpen.call(this);for(let u=0;u<this.n;u++)if(structural.has(this.type[u]))this.open[u]=0;}
    compat(u,i,v,j){if(structural.has(this.type[u])||structural.has(this.type[v]))return 0;return Sim.prototype.compat.call(this,u,i,v,j);}
  };
}
module.exports={seeded,HALF_CELL,polyMass,rod};
