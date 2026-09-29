#!/usr/bin/env node
'use strict';
// Q8l: abundant-soup half-cells. See half_cell_soup_plan.md.  all STEM | job STEM K ARM SEED | summary STEM
const {spawn}=require('child_process'),{T_C}=require('../src/sim');
const live=require('./half_cell_live'),{FastLiveHalfCellSim}=require('./half_cell_fast'),{PinsLiveSim}=require('./half_cell_pins');
const {createSoup}=require('./half_cell_soup'),bath=require('./half_cell_bath'),kit=require('./screen_kit');
const {AnchorProjectSim,AnchorPinsSim}=require('./half_cell_anchor');
const CLASS={project:FastLiveHalfCellSim,pins:PinsLiveSim,anchorProject:AnchorProjectSim,anchorPins:AnchorPinsSim},SIZE={4:24,8:32},STEPS=50000,SEEDS=[1201,1202];
// Q8l ran the default arms; Q8m sets HC_ARMS=anchorProject,anchorPins (half_cell_anchor_plan.md).
const ARMS=(process.env.HC_ARMS||'project,pins').split(',');
const key=xs=>xs.join(',');
const jobs=()=>[4,8].flatMap(k=>ARMS.flatMap(arm=>SEEDS.map(seed=>({k,arm,seed}))));
function wStats(s){
  let free=0,freeRing=0,capBound=0;const seen=new Set();
  for(let u=0;u<s.n;u++)if(s.type[u]===T_C&&!seen.has(u)){
    const todo=[u],units=[];let caps=0,edges=0;
    while(todo.length){const v=todo.pop();if(seen.has(v))continue;seen.add(v);units.push(v);if(s.type[v]!==T_C)caps++;
      for(let i=0;i<4;i++){const b=s.rimBond[v*4+i];if(b>=0){edges++;if(!seen.has(b>>2))todo.push(b>>2);}}}
    const w=units.filter(v=>s.type[v]===T_C).length;
    if(units.length===1)free++;else if(caps)capBound+=w;else if(edges/2===units.length)freeRing+=w;
  }
  return {free,freeRing,capBound};
}
function job(stem,k,arm,seed){
  const file=`${stem}_K${k}_${arm}_${seed}.json.gz`,Cls=CLASS[arm];
  const w=createSoup({seed,extra:k,size:SIZE[k],Cls}),initial=w.s.saveState(),founder=w.founder;
  const out={job:{k,arm,seed,steps:STEPS},founder,initial,milestones:{},samples:[]};
  const watch=s=>{
    if(s.t%100)return;
    const o=live.observe(s),novel=o.chains.filter(x=>key(x.units)!==key(founder)),closed=o.closed.filter(x=>key(x.units)!==key(founder));
    const mark=(name,cond,extra)=>{if(cond&&!out.milestones[name])out.milestones[name]={t:s.t,...(extra?extra():{})};};
    mark('novelChain',novel.length>0);mark('novelClosed',closed.length>0);
    const un=closed.filter(x=>x.unpaired);
    mark('unpairedClosed',un.length>0,()=>({detached:bath.detached(s,[...un[0].units,...un[0].rim]).detached}));
    if(s.t%1000===0)out.samples.push({t:s.t,chains:o.chainCount,closed:o.closedCount,novelChains:novel.length,novelClosed:closed.length,copying:o.copyingContacts,charged:o.charged,...wStats(s)});
  };
  const t0=kit.cpu(),r=kit.run(initial,STEPS,watch,{check:seed===SEEDS[0],Cls});
  const fin=Cls.fromState(r.final),o=live.observe(fin),closed=o.closed.filter(x=>key(x.units)!==key(founder));
  out.final={chains:o.chainCount,closed:o.closedCount,novelClosed:closed.length,
    detachedNovelClosed:closed.filter(x=>x.unpaired&&bath.detached(fin,[...x.units,...x.rim]).detached).length,w:wStats(fin),
    maxOverlap:live.geometry(fin).maxOverlap,check:fin.check().length};
  out.checked=r.checked;out.finalState=r.final;out.tape=r.tape;out.cpuSeconds=kit.cpu()-t0;kit.write(file,out);
  console.log(JSON.stringify({k,arm,seed,milestones:out.milestones,final:out.final,cpu:+out.cpuSeconds.toFixed(1)}));
}
function all(stem){const list=jobs();let next=0,n=0;const go=()=>{while(n<4&&next<list.length){const j=list[next++];n++;
  spawn(process.execPath,[__filename,'job',stem,String(j.k),j.arm,String(j.seed)],{stdio:['ignore','inherit','inherit']}).on('exit',c=>{n--;if(c)console.error('FAILED',JSON.stringify(j));go();});}};go();}
function summary(stem){
  const rows=jobs().map(j=>{const r=kit.read(`${stem}_K${j.k}_${j.arm}_${j.seed}.json.gz`);
    const face=r.tape.filter(e=>e.op==='link'&&(e.a&3)===0&&(e.b&3)===0).length,other=r.tape.filter(e=>e.op==='link').length-face;
    return {...j,novelChain:r.milestones.novelChain?.t??null,novelClosed:r.milestones.novelClosed?.t??null,unpairedClosed:r.milestones.unpairedClosed?.t??null,
      detached:r.milestones.unpairedClosed?.detached||r.final.detachedNovelClosed>0,finalChains:r.final.chains,finalClosed:r.final.closed,
      faceLinks:face,otherLinks:other,unlinks:r.tape.filter(e=>e.op==='unlink').length,w:r.final.w,maxOverlap:r.final.maxOverlap,checked:r.checked,cpu:r.cpuSeconds};});
  const lead=rows.some(r=>r.unpairedClosed!==null),partial=rows.some(r=>r.novelChain!==null);
  kit.write(stem+'.summary.json',{rows,lead,partial});for(const r of rows)console.log(JSON.stringify(r));console.log(JSON.stringify({lead,partial}));
}
const [mode,stem,...a]=process.argv.slice(2);
if(mode==='all')all(stem);else if(mode==='job')job(stem,Number(a[0]),a[1],Number(a[2]));else if(mode==='summary')summary(stem);else throw Error('mode');
