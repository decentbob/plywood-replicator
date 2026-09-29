#!/usr/bin/env node
'use strict';
// Shield screen (shield_plan.md).  all STEM | job STEM FIELD SEED | summary STEM
const {spawn}=require('child_process'),{T_J}=require('../src/sim'),W=require('./seeded_worlds'),kit=require('./screen_kit');
const {field}=require('./seeded_field'),{PinsLiveSim}=require('./half_cell_pins');
const SEEDS=[1711,1712,1713,1714,1715,1716],STEPS=100000,CFG={...W.SHIELD,shapes:{[T_J]:W.fan(1,4,1)}};
const jobs=()=>['on','off'].flatMap(f=>SEEDS.map(seed=>({f,seed})));
function job(stem,f,seed){
  const Base=field(PinsLiveSim,{walls:[T_J],pField:f==='on'?1e-5:0,range:5});
  const w=W.createWorld({seed,size:22,founder:['PBBQ','PAAQ'],loose:{A:12,B:12,P:8,Q:8,J:12},config:CFG,Base,params:{pFray:0.002}}),initial=w.s.saveState();
  const cs={PBBQ:0,PAAQ:0,other:0},seen={PBBQ:new Set(),PAAQ:new Set()},samples=[];
  const watch=s=>{if(s.t%500)return;const c=W.census(s);for(const x of c.chains){const k=x.seq==='PBBQ'||x.seq==='PAAQ'?x.seq:'other';cs[k]+=500;if(seen[k])seen[k].add(x.units.join());}
    if(s.t%5000===0)samples.push({t:s.t,chains:c.chains.map(x=>x.seq+'['+x.struct+']'),breaks:s.fieldBreaks||0});};
  const t0=kit.cpu(),r=kit.run(initial,STEPS,watch,{check:seed===SEEDS[0],Cls:w.Cls});
  const out={job:{f,seed,steps:STEPS},initial,chainSteps:cs,distinct:{PBBQ:seen.PBBQ.size,PAAQ:seen.PAAQ.size},samples,finalState:r.final,tape:r.tape,checked:r.checked,cpuSeconds:kit.cpu()-t0};
  kit.write(`${stem}_${f}_${seed}.json.gz`,out);console.log(JSON.stringify({f,seed,chainSteps:cs,distinct:out.distinct,breaks:samples.at(-1).breaks,cpu:Math.round(out.cpuSeconds)}));
}
function all(stem){const list=jobs();let next=0,n=0;const go=()=>{while(n<4&&next<list.length){const j=list[next++];n++;
  spawn(process.execPath,[__filename,'job',stem,j.f,String(j.seed)],{stdio:['ignore','inherit','inherit']}).on('exit',c=>{n--;if(c)console.error('FAILED',JSON.stringify(j));go();});}};go();}
function summary(stem){
  const S=x=>x.chainSteps.PBBQ/Math.max(1,x.chainSteps.PBBQ+x.chainSteps.PAAQ);
  const rows=SEEDS.map(seed=>{const on=kit.read(`${stem}_on_${seed}.json.gz`),off=kit.read(`${stem}_off_${seed}.json.gz`);
    return {seed,Son:S(on),Soff:S(off),on:on.chainSteps,off:off.chainSteps,distinctOn:on.distinct,distinctOff:off.distinct};});
  const k=rows.filter(r=>r.Son>r.Soff).length,out={rows,shieldFavouredByField:k,adaptation:k>=5};kit.write(stem+'.summary.json',out);
  for(const r of rows)console.log(JSON.stringify(r));console.log(JSON.stringify({shieldFavouredByField:k,adaptation:out.adaptation}));
}
const [mode,stem,...x]=process.argv.slice(2);
if(mode==='all')all(stem);else if(mode==='job')job(stem,x[0],Number(x[1]));else if(mode==='summary')summary(stem);else throw Error('mode');
