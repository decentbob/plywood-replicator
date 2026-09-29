'use strict';
// Q8m anchor rule (half_cell_anchor_plan.md): a rim bond forms only if at least one contacting block is anchored,
// i.e. a cap whose own chain port is bonded (P at R, Q at L) or a W whose other rim port is bonded. Reads own bonds only.
const {R,L,F,K,T_P,T_Q,T_C}=require('../src/sim');
const {FastLiveHalfCellSim}=require('./half_cell_fast'),{PinsLiveSim}=require('./half_cell_pins');
function anchor(Base){
  return class extends Base{
    anchored(u,i){
      const t=this.type[u];
      if(t===T_P)return this.bond[u*4+R]>=0;
      if(t===T_Q)return this.bond[u*4+L]>=0;
      if(t===T_C)return this.rimBond[u*4+(i===F?K:F)]>=0;
      return false;
    }
    polymerContact(u,i,v,j){return (this.anchored(u,i)||this.anchored(v,j))&&super.polymerContact(u,i,v,j);}
  };
}
module.exports={anchor,AnchorProjectSim:anchor(FastLiveHalfCellSim),AnchorPinsSim:anchor(PinsLiveSim)};
