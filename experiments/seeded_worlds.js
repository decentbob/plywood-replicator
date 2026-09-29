'use strict';
// Generic soups for the seeded-growth engine: one founder chain (any P..Q sequence) plus loose parts, placed without
// overlap. Structures are not prepared: they grow from the founder's seeds under the same rules as in every copy.
const assert=require('assert/strict');
const {F,R,K,L,T_A,T_B,T_C,T_D,T_E,T_J,T_P,T_Q,I_ON,TNAME}=require('../src/sim');
const live=require('./half_cell_live'),{overlap}=require('./half_cell_geometry');
const {seeded}=require('./seeded_growth'),{PinsLiveSim}=require('./half_cell_pins');

// Comb (COMPLEXITY_MAP step 3, the user's branching idea): B exposes a seed on its back (K); a D junction attaches by
// its face and offers two family-3 ports (R, L); J arm blocks attach by F and extend by K. Only B carries a seed.
const COMB={structural:[T_D,T_J],labels:{[T_B]:{[K]:{f:2,s:1,seed:true}},[T_D]:{[F]:{f:2,s:-1},[R]:{f:3,s:1},[L]:{f:3,s:1}},
  [T_J]:{[F]:{f:3,s:-1},[K]:{f:3,s:1}}}};

function createWorld({seed,size=24,founder='PABAQ',loose={},config=COMB,Base=PinsLiveSim,params={}}={}){
  const ref=live.createWorld({seed:1,start:'paired',motion:'body'}).s.p,need={},founders=Array.isArray(founder)?founder:[founder];
  for(const f of founders)for(const ch of f)need[ch]=(need[ch]||0)+1;
  const counts={nA:(need.A||0)+(loose.A||0),nB:(need.B||0)+(loose.B||0),nC:loose.C||0,nD:loose.D||0,nJ:loose.J||0,
    nP:(need.P||0)+(loose.P||0),nQ:(need.Q||0)+(loose.Q||0),nE:loose.E||0};
  const Cls=seeded(Base,config),s=new Cls({...ref,...counts,energyGate:false,...params,seed,W:size,H:size,seedCount:0});
  const chains=founders.map((f,k)=>{const c=s.seedStrand(size/2,size*(k+1)/(founders.length+1),0,f.length,f);assert(c,'founder not placed');return c;});
  const chain=chains[0],placed=chains.flat();
  for(let u=0;u<s.n;u++)if(!placed.includes(u)){
    let ok=false;
    for(let a=0;a<5000&&!ok;a++){
      s.px[u]=size*s.rng();s.py[u]=size*s.rng();s.pa[u]=2*Math.PI*s.rng();s._resetShape(u);
      ok=placed.every(v=>{const dx=s._dx(s.px[v]-s.px[u]),dy=s._dy(s.py[v]-s.py[u]);return Math.hypot(dx,dy)>3||overlap(s._outline(u),s._outline(v,dx,dy))<1e-10;});
    }
    assert(ok,'could not place loose material');placed.push(u);if(s.type[u]===T_E)s.is[u]=I_ON;
  }
  s.rimEvents=0;live.synchronize(s);
  return {s,Cls,founder:chain,founders:chains};
}
// Read-only census: every P..Q chain (sequence, paired or not) and the structure grown from each chain block.
function census(s){
  const chains=[];
  for(let p=0;p<s.n;p++)if(s.type[p]===T_P){
    const units=[p];let u=p;
    while(s.bond[u*4+R]>=0&&(s.bond[u*4+R]&3)===L){u=s.bond[u*4+R]>>2;if(units.includes(u))break;units.push(u);if(s.type[u]===T_Q)break;}
    if(s.type[u]!==T_Q)continue;
    const inChain=new Set(units),struct=[];
    for(const c of units){const seen=new Set(),todo=[];for(let i=0;i<4;i++){const b=s.rimBond[c*4+i];if(b>=0&&!inChain.has(b>>2))todo.push(b>>2);}
      while(todo.length){const v=todo.pop();if(seen.has(v)||inChain.has(v))continue;seen.add(v);for(let i=0;i<4;i++){const b=s.rimBond[v*4+i];if(b>=0)todo.push(b>>2);}}
      struct.push(seen.size);}
    chains.push({units,seq:units.map(v=>TNAME[s.type[v]]).join(''),paired:units.some(v=>s.bond[v*4+F]>=0),struct});
  }
  let freeStruct=0;for(let u=0;u<s.n;u++)if([T_D,T_J,T_C].includes(s.type[u])&&![0,1,2,3].some(i=>s.rimBond[u*4+i]>=0))freeStruct++;
  return {chains,freeStruct};
}
module.exports={COMB,createWorld,census};
// Enzyme cell (COMPLEXITY_MAP 3c, process M): W starts blank (kind 0), catchable only by a writer. B's back seeds a
// D writer whose K port writes kind 1; kind-1 W carries the half-cell wall labels, so only a chain that carries B
// makes its own wall material. Unattached wall-kind W forgets back to blank at pForget.
const {HALF_CELL}=require('./seeded_growth');
const ENZYME_CELL={structural:[T_C,T_D],labels:{[T_P]:HALF_CELL.labels[T_P],[T_Q]:HALF_CELL.labels[T_Q],
  [T_B]:{[K]:{f:2,s:1,seed:true}},[T_D]:{[F]:{f:2,s:-1},[K]:{f:9,s:1,write:1}}},
  programmable:{type:T_C,pForget:1e-4,kinds:{0:{[F]:{f:9,s:-1},[K]:{f:9,s:-1}},1:{[F]:{f:1,s:-1},[K]:{f:1,s:1}}}}};
module.exports.ENZYME_CELL=ENZYME_CELL;
