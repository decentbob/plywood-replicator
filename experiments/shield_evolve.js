#!/usr/bin/env node
'use strict';
// Can shields evolve? (shield_evolve_plan.md)  all STEM | job STEM FIELD SEED | summary STEM
const {spawn}=require('child_process'),{T_J}=require('../src/sim'),W=require('./seeded_worlds'),kit=require('./screen_kit');
const {field}=require('./seeded_field'),{PinsLiveSim}=require('./half_cell_pins');
// Round 1 (RESULTS 106) used the defaults; round 2 (SE_ROUND=2) strengthens conditions per the working mode: bigger plate,
// fewer copying errors, three founders and more material, longer runs.
const R2=process.env.SE_ROUND==='2';
const SEEDS=R2?[1731,1732,1733,1734,1735,1736]:[1721,1722,1723,1724,1725,1726],STEPS=R2?300000:200000,WIN=50000;
const CFG={...W.SHIELD,shapes:{[T_J]:R2?W.fan(1,6,1.5):W.fan(1,4,1)}};
const WORLD=R2?{size:26,founder:['PAAQ','PAAQ','PAAQ'],loose:{A:16,B:16,P:10,Q:10,J:24},pSoft:0.01}:{size:22,founder:['PAAQ'],loose:{A:12,B:12,P:8,Q:8,J:16},pSoft:0.05};
const jobs=()=>['on','off'].flatMap(f=>SEEDS.map(seed=>({f,seed})));
function job(stem,f,seed){
  const Base=field(PinsLiveSim,{walls:[T_J],pField:f==='on'?1e-5:0,range:5});
  const w=W.createWorld({seed,size:WORLD.size,founder:WORLD.founder,loose:WORLD.loose,config:CFG,Base,params:{pFray:0.002,pSoft:WORLD.pSoft}}),initial=w.s.saveState();
  const windows=[],first={};let cur={};
  const watch=s=>{if(s.t%500)return;const c=W.census(s);for(const x of c.chains){cur[x.seq]=(cur[x.seq]||0)+500;if(!(x.seq in first))first[x.seq]=s.t;}
    if(s.t%WIN===0){windows.push({t:s.t,chainSteps:cur});cur={};}};
  const t0=kit.cpu(),r=kit.run(initial,STEPS,watch,{check:seed===SEEDS[0],Cls:w.Cls});
  const fin=W.census(w.Cls.fromState(r.final));
  const out={job:{f,seed,steps:STEPS},initial,windows,first,final:fin.chains.map(x=>x.seq+'['+x.struct+']'),finalState:r.final,tape:r.tape,checked:r.checked,cpuSeconds:kit.cpu()-t0};
  kit.write(`${stem}_${f}_${seed}.json.gz`,out);
  const share=win=>{let b=0,t=0;for(const [k,v] of Object.entries(win.chainSteps)){t+=v;if(k.includes('B'))b+=v;}return t?+(b/t).toFixed(2):null;};
  console.log(JSON.stringify({f,seed,Bshare:windows.map(share),first,final:out.final,cpu:Math.round(out.cpuSeconds)}));
}
function all(stem){const list=jobs();let next=0,n=0;const go=()=>{while(n<4&&next<list.length){const j=list[next++];n++;
  spawn(process.execPath,[__filename,'job',stem,j.f,String(j.seed)],{stdio:['ignore','inherit','inherit']}).on('exit',c=>{n--;if(c)console.error('FAILED',JSON.stringify(j));go();});}};go();}
const [mode,stem,...x]=process.argv.slice(2);
if(mode==='all')all(stem);else if(mode==='job')job(stem,x[0],Number(x[1]));else throw Error('mode');
