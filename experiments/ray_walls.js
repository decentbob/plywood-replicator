#!/usr/bin/env node
'use strict';
// Walls against rays (ray_walls_plan.md).  all STEM | job STEM WALL RAY SEED | summary STEM
const {spawn}=require('child_process'),{T_C}=require('../src/sim'),live=require('./half_cell_live'),kit=require('./screen_kit');
const {rays}=require('./seeded_rays'),{seeded,HALF_CELL}=require('./seeded_growth'),{PinsLiveSim}=require('./half_cell_pins'),{createSoup}=require('./half_cell_soup');
const Cls=rays(seeded(PinsLiveSim,HALF_CELL),{walls:[T_C]}),SEEDS=[1501,1502,1503,1504,1505,1506],STEPS=100000;
const jobs=()=>['walled','bare'].flatMap(wall=>['on','off'].flatMap(ray=>SEEDS.map(seed=>({wall,ray,seed}))));
function job(stem,wall,ray,seed){
  const w=createSoup({seed,extra:4,size:24,Cls,rays:2,params:{pFray:0.002,rayHit:ray==='on'?0.01:0,rimBind:wall==='walled'}}),initial=w.s.saveState();
  const seen=new Set(),samples=[];let chainSteps=0;
  const watch=s=>{if(s.t%500)return;const o=live.observe(s);for(const c of o.chains)seen.add(c.units.join(','));chainSteps+=o.chainCount*500;
    if(s.t%5000===0)samples.push({t:s.t,chains:o.chainCount,closed:o.closedCount,hits:s.rayHits});};
  const t0=kit.cpu(),r=kit.run(initial,STEPS,watch,{check:seed===SEEDS[0],Cls});
  const out={job:{wall,ray,seed,steps:STEPS},initial,samples,distinct:seen.size,chainSteps,hits:Cls.fromState(r.final).rayHits,finalState:r.final,tape:r.tape,checked:r.checked,cpuSeconds:kit.cpu()-t0};
  kit.write(`${stem}_${wall}_${ray}_${seed}.json.gz`,out);console.log(JSON.stringify({wall,ray,seed,distinct:out.distinct,chainSteps,hits:out.hits,cpu:Math.round(out.cpuSeconds)}));
}
function all(stem){const list=jobs();let next=0,n=0;const go=()=>{while(n<4&&next<list.length){const j=list[next++];n++;
  spawn(process.execPath,[__filename,'job',stem,j.wall,j.ray,String(j.seed)],{stdio:['ignore','inherit','inherit']}).on('exit',c=>{n--;if(c)console.error('FAILED',JSON.stringify(j));go();});}};go();}
function summary(stem){
  const get=(wall,ray,seed)=>kit.read(`${stem}_${wall}_${ray}_${seed}.json.gz`);
  const rows=SEEDS.map(seed=>{const r={seed};for(const wall of ['walled','bare'])for(const ray of ['on','off']){const x=get(wall,ray,seed);r[wall+'_'+ray]={distinct:x.distinct,chainSteps:x.chainSteps,hits:x.hits};}
    r.ratioWalled=r.walled_on.chainSteps/r.walled_off.chainSteps;r.ratioBare=r.bare_on.chainSteps/r.bare_off.chainSteps;return r;});
  const a=rows.filter(r=>r.ratioWalled>r.ratioBare).length,b=rows.filter(r=>r.walled_on.chainSteps>r.bare_on.chainSteps).length;
  const out={rows,walledRatioHigher:a,walledOnBeatsBareOn:b,benefit:a>=5&&b>=5};kit.write(stem+'.summary.json',out);
  for(const r of rows)console.log(JSON.stringify(r));console.log(JSON.stringify({walledRatioHigher:a,walledOnBeatsBareOn:b,benefit:out.benefit}));
}
const [mode,stem,...x]=process.argv.slice(2);
if(mode==='all')all(stem);else if(mode==='job')job(stem,x[0],x[1],Number(x[2]));else if(mode==='summary')summary(stem);else throw Error('mode');
