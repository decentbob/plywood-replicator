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
const {Sim,S,F,R,K,L,T_A,T_B,T_C,T_D,T_P,T_Q}=require('../src/sim');

// The half-cell (RESULTS 97–98) as a configuration: P and Q seed family 1 on their outer lateral sides; W carries it.
const HALF_CELL={structural:[T_C],labels:{[T_P]:{[L]:{f:1,s:1,seed:true}},[T_Q]:{[R]:{f:1,s:-1,seed:true}},
  [T_C]:{[F]:{f:1,s:-1},[K]:{f:1,s:1}}}};

function seeded(Base,config){
  const structural=new Set(config.structural),labels=config.labels,prog=config.programmable||null;
  const byType=(t,i)=>labels[t]&&labels[t][i]||null;
  return class extends Base{
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
module.exports={seeded,HALF_CELL};
