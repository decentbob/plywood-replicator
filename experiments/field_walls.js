#!/usr/bin/env node
'use strict';
// Walls in a shadowing damage field (field_walls_plan.md).  all STEM | job STEM WALL FIELD SEED | summary STEM
const {spawn}=require('child_process'),{T_C}=require('../src/sim'),live=require('./half_cell_live'),kit=require('./screen_kit');
const {field}=require('./seeded_field'),{seeded,HALF_CELL}=require('./seeded_growth'),{PinsLiveSim}=require('./half_cell_pins'),{createSoup}=require('./half_cell_soup');
// RESULTS 103 used the default seeds; field_walls_confirm_plan.md sets FW_SEEDS.
const SEEDS=(process.env.FW_SEEDS||'1521,1522,1523,1524,1525,1526').split(',').map(Number),STEPS=100000;
const cls=on=>field(seeded(PinsLiveSim,HALF_CELL),{walls:[T_C],pField:on?1e-5:0,range:5});
const jobs=()=>['walled','bare'].flatMap(wall=>['on','off'].flatMap(f=>SEEDS.map(seed=>({wall,f,seed}))));
function job(stem,wall,f,seed){
  const Cls=cls(f==='on'),w=createSoup({seed,extra:4,size:24,Cls,params:{pFray:0.002,rimBind:wall==='walled'}}),initial=w.s.saveState();
  const seen=new Set(),samples=[];let chainSteps=0;
  const watch=s=>{if(s.t%500)return;const o=live.observe(s);for(const c of o.chains)seen.add(c.units.join(','));chainSteps+=o.chainCount*500;
    if(s.t%5000===0)samples.push({t:s.t,chains:o.chainCount,closed:o.closedCount,breaks:s.fieldBreaks||0});};
  const t0=kit.cpu(),r=kit.run(initial,STEPS,watch,{check:seed===SEEDS[0],Cls});
  const out={job:{wall,f,seed,steps:STEPS},initial,samples,distinct:seen.size,chainSteps,breaks:samples.at(-1).breaks,finalState:r.final,tape:r.tape,checked:r.checked,cpuSeconds:kit.cpu()-t0};
  kit.write(`${stem}_${wall}_${f}_${seed}.json.gz`,out);console.log(JSON.stringify({wall,f,seed,distinct:out.distinct,chainSteps,breaks:out.breaks,cpu:Math.round(out.cpuSeconds)}));
}
function all(stem){const list=jobs();let next=0,n=0;const go=()=>{while(n<4&&next<list.length){const j=list[next++];n++;
  spawn(process.execPath,[__filename,'job',stem,j.wall,j.f,String(j.seed)],{stdio:['ignore','inherit','inherit']}).on('exit',c=>{n--;if(c)console.error('FAILED',JSON.stringify(j));go();});}};go();}
function summary(stem){
  const get=(wall,f,seed)=>kit.read(`${stem}_${wall}_${f}_${seed}.json.gz`);
  const rows=SEEDS.map(seed=>{const r={seed};for(const wall of ['walled','bare'])for(const f of ['on','off']){const x=get(wall,f,seed);r[wall+'_'+f]={distinct:x.distinct,chainSteps:x.chainSteps,breaks:x.breaks};}
    r.ratioWalled=r.walled_on.chainSteps/r.walled_off.chainSteps;r.ratioBare=r.bare_on.chainSteps/r.bare_off.chainSteps;return r;});
  const a=rows.filter(r=>r.ratioWalled>r.ratioBare).length,b=rows.filter(r=>r.walled_on.chainSteps>r.bare_on.chainSteps).length;
  const sign=(wins,n)=>{let p=0;for(let k=wins;k<=n;k++){let c=1;for(let i=0;i<k;i++)c=c*(n-i)/(i+1);p+=c/Math.pow(2,n);}return p;};
  const net=rows.map(r=>Math.sign(r.walled_on.chainSteps-r.bare_on.chainSteps)).filter(x=>x),prot=rows.map(r=>Math.sign(r.ratioWalled-r.ratioBare)).filter(x=>x);
  const pNet=sign(net.filter(x=>x>0).length,net.length),pProt=sign(prot.filter(x=>x>0).length,prot.length);
  const out={rows,protection:a,netBenefit:b,protects:a>=5,benefit:a>=5&&b>=5,signTest:{pNet,pProt,netN:net.length,protN:prot.length,confirmed:pNet<=0.05&&pProt<=0.05}};kit.write(stem+'.summary.json',out);
  for(const r of rows)console.log(JSON.stringify(r));console.log(JSON.stringify({protection:a,netBenefit:b,protects:out.protects,benefit:out.benefit,signTest:out.signTest}));
}
const [mode,stem,...x]=process.argv.slice(2);
if(mode==='all')all(stem);else if(mode==='job')job(stem,x[0],x[1],Number(x[2]));else if(mode==='summary')summary(stem);else throw Error('mode');
