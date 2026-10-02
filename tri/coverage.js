'use strict';
// Coverage hook for core reviews (observation only): preload it to record, per demo process, which marks the world's
// triangles carry, which rule events fire, and why trigger sides and latches were held (open or lock signal).
//   COV_OUT=$PWD/runs/cov.jsonl NODE_OPTIONS="-r ./tri/coverage.js" node tri/check.js     (one JSON line per demo)
const path=require('path'),fs=require('fs');
const M=require(path.join(__dirname,'sim.js')),P=M.TriSim.prototype;
const cov={argv:process.argv.slice(2),marks:{},carried:{},deaf:{op:0,lock:0},latchHold:{op:0,lock:0},sims:[]};
const origSet=P.setType;P.setType=function(u,str){for(const m of str.matchAll(M.TOK)){for(const c of m[2])cov.marks[c]=(cov.marks[c]||0)+1;for(const c of (m[3]||''))cov.carried[c]=(cov.carried[c]||0)+1;}return origSet.call(this,u,str);};
const origDeaf=P._deaf;P._deaf=function(u,e){if(this.trg[u*3+e]){if(this.op[u]!==0)cov.deaf.op++;else if(this.lockBusy[u]>0)cov.deaf.lock++;}return origDeaf.call(this,u,e);};
const origLat=P._latches;P._latches=function(){const n=this.n;
  for(let u=0;u<n;u++)for(let i=0;i<3;i++){if(!this.ltc[u*3+i]||this.bond[u*3+i]<0)continue;let trig=this.tb[u]||this.sg[u]>0,open=this.dOpen[u];
    for(let e=0;e<3;e++)if(e!==i&&this.bond[u*3+e]>=0&&!this.isHingeBond(u,e)){const w=this.partner(u,e);if(this.tb[w])trig=1;if(this.dOpen[w])open=1;}
    if(!open&&trig){if(this.op[u]!==0)cov.latchHold.op++;else if(this.lockBusy[u]>0)cov.latchHold.lock++;}}
  return origLat.call(this);};
const origStep=P.step;P.step=function(){if(!this.__cov){this.__cov=1;cov.sims.push(this);}return origStep.call(this);};
process.on('exit',()=>{const out=process.env.COV_OUT;if(!out)return;
  const ev={},present={};for(const s of cov.sims){for(const k in s.ev)ev[k]=(ev[k]||0)+s.ev[k];
    const A={'<>':'hinge','.':'cOnly','*':'trg','~':'ltc','$':'fuel','+':'hear','=':'wide','%':'act','@':'att','&':'done','|':'anc','?':'cpy'};
    for(const c in A){let k=0;for(const x of s[A[c]])if(x)k++;present[c]=(present[c]||0)+k;}
    const r=[0,0,0,0];for(const x of s.rel)r[x]++;present['!']=r[1];present['^']=r[2];present['#']=r[3];}
  fs.appendFileSync(out,JSON.stringify({argv:cov.argv,marks:cov.marks,carried:cov.carried,present,ev,deaf:cov.deaf,latchHold:cov.latchHold})+'\n');});
