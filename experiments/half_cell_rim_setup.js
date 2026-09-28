'use strict';
const geometry=require('./half_cell_geometry');
const {HalfCellRimSim}=require('./half_cell_rim');
const {F,R,K,L,T_P,T_Q,I_TPL,I_DOCK,I_ON}=require('../src/sim');
function jobs(){return [701,703].flatMap(seed=>['body16','individual16'].flatMap(mode=>['P','Q'].flatMap(end=>
  ['prepared','on','off'].map(arm=>({seed,mode,end,arm,horizon:arm==='prepared'?200:300})))));}
function setup(job){
  const original=geometry.setup({seed:job.seed,mode:job.mode==='body16'?'body4':'individual16',end:job.end,arm:'unbound'});
  const s=HalfCellRimSim.fromState(original.s.saveState(),{iters:16,rimBind:job.arm==='on',
    pMelt:0,pMeltRun:0,pMeltEnd:0,pReload:0,pUndock:0,energyGate:true});
  const ids=structuredClone(original.ids);
  for(let h=0;h<2;h++){
    const cap=ids.caps[h],w=ids.rims[h],rim=s.type[cap]===T_P?L:R;
    if(s.type[cap]===T_Q)s._rigidMove(w,0,0,Math.PI);
    if(job.arm==='prepared')s._linkRim(cap,rim,w,s.type[cap]===T_P?F:K);
    else{const side=s._side(cap,rim,[0,0,0,0]);s._rigidMove(w,.06*side[2],.06*side[3],0);}
    s.is[cap]=s.is[ids.letters[h]]=h===0?I_TPL:I_DOCK;s.is[ids.fuels[h]]=I_ON;
  }
  ids.groups=ids.caps.map((cap,h)=>[cap,ids.letters[h],...(job.arm==='prepared'?[ids.rims[h]]:[])]);
  s._deriveAll();s._deriveAll();s._computeOpen();s._buildHash();s._bondList();
  return {s,ids,metadata:{W:s.p.W,H:s.p.H,types:[...s.type],sizes:[...s.size],edgeOf:[...s.edgeOf],
    distTol:s.p.distTol,tolDeg:s.p.tolDeg,tolRotDeg:s.p.tolRotDeg}};
}
module.exports={setup,jobs};
