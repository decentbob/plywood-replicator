'use strict';
// Coverage hook for core reviews (observation only): preload it to record, per demo process, which marks the world's
// triangles carry and which rule events fire.
//   COV_OUT=$PWD/runs/cov.jsonl NODE_OPTIONS="-r ./tri/coverage.js" node tri/check.js     (one JSON line per demo)
const path=require('path'),fs=require('fs');
const M=require(path.join(__dirname,'sim.js')),P=M.TriSim.prototype;
const cov={argv:process.argv.slice(2),marks:{},sims:[]};
const origSet=P.setType;P.setType=function(u,str){for(const m of str.matchAll(M.TOK))for(const c of m[2])cov.marks[c]=(cov.marks[c]||0)+1;return origSet.call(this,u,str);};
const origStep=P.step;P.step=function(){if(!this.__cov){this.__cov=1;cov.sims.push(this);}return origStep.call(this);};
process.on('exit',()=>{const out=process.env.COV_OUT;if(!out)return;
  const ev={},present={};for(const s of cov.sims){for(const k in s.ev)ev[k]=(ev[k]||0)+s.ev[k];
    const A={'.':'cOnly','@':'att','&':'done','|':'anc','?':'cpy'};
    for(const c in A){let k=0;for(const x of s[A[c]])if(x)k++;present[c]=(present[c]||0)+k;}}
  fs.appendFileSync(out,JSON.stringify({argv:cov.argv,marks:cov.marks,present,ev})+'\n');});
