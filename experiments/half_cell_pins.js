#!/usr/bin/env node
'use strict';
// Q8k screen: live half-cell chemistry with projection (unchanged) versus in-place capture. See half_cell_pins_plan.md.
//   node experiments/half_cell_pins.js all STEM | job STEM START ARM SEED | summary STEM
// Q8l reuses PinsLiveSim with the soup worlds (half_cell_soup_screen.js).
const fs=require('fs'),path=require('path'),{spawn}=require('child_process'),assert=require('assert/strict');
const {T_E}=require('../src/sim');
const live=require('./half_cell_live'),{FastLiveHalfCellSim}=require('./half_cell_fast');
const bath=require('./half_cell_bath'),kit=require('./screen_kit');
class PinsLiveSim extends FastLiveHalfCellSim{
  // Q8j CaptureSim rule: a free block binds where it is; everything else delegates unchanged.
  _formBond(u,i,v,j){
    if(this.type[u]!==T_E&&this.type[v]!==T_E&&(!this.hasMechanicalBond(u)||!this.hasMechanicalBond(v))){this._link(u,i,v,j);return true;}
    return super._formBond(u,i,v,j);
  }
}
const CLASS={project:FastLiveHalfCellSim,pins:PinsLiveSim};
const PLAN={contacts:{seeds:[1001,1002,1003,1004,1005,1006,1007,1008],steps:3000},bath:{seeds:[1101,1102,1103,1104],steps:50000}};
const key=xs=>xs.join(',');
function jobs(){return Object.entries(PLAN).flatMap(([start,p])=>['project','pins'].flatMap(arm=>p.seeds.map(seed=>({start,arm,seed,steps:p.steps}))));}

function job(stem,start,arm,seed){
  const steps=PLAN[start].steps,file=`${stem}_${start}_${arm}_${seed}.json.gz`;
  assert(!fs.existsSync(file),'Refusing overwrite '+file);
  const w=live.createWorld({seed,start,motion:'body'}),Cls=CLASS[arm],initial=Cls.fromState(w.s.saveState()).saveState();
  const founder=w.ids.chains[0],first=PLAN[start].seeds[0]===seed;
  const out={job:{start,arm,seed,steps},founder,initial,milestones:{},samples:[],check:null};
  let s=null;
  const watch=sim=>{
    s=sim;if(sim.t%50)return;
    const o=live.observe(sim),novel=o.chains.filter(x=>key(x.units)!==key(founder)),closed=o.closed.filter(x=>key(x.units)!==key(founder));
    const mark=(k,cond,extra)=>{if(cond&&!out.milestones[k])out.milestones[k]={t:sim.t,...(extra?extra():{})};};
    mark('novelChain',novel.length>0);
    mark('novelClosed',closed.length>0);
    const unpaired=closed.filter(x=>x.unpaired);
    mark('unpairedClosed',unpaired.length>0,()=>({detached:bath.detached(sim,[...unpaired[0].units,...unpaired[0].rim]).detached}));
    if(sim.t%1000===0)out.samples.push({t:sim.t,summary:{...o,chains:o.chains.length,closed:o.closed.length},maxOverlap:live.geometry(sim).maxOverlap});
  };
  const t0=kit.cpu(),r=kit.run(initial,steps,watch,{check:first,Cls});
  const fin=Cls.fromState(r.final),o=live.observe(fin),closed=o.closed.filter(x=>key(x.units)!==key(founder));
  out.final={summary:{...o,chains:o.chains.length,closed:o.closed.length},novelClosed:closed.length,
    detachedNovelClosed:closed.filter(x=>x.unpaired&&bath.detached(fin,[...x.units,...x.rim]).detached).length,geometry:live.geometry(fin)};
  live.invariant(fin,initial);
  out.check=r.checked;out.finalState=r.final;out.tape=r.tape;out.cpuSeconds=kit.cpu()-t0;
  kit.write(file,out);
  console.log(JSON.stringify({start,arm,seed,milestones:out.milestones,novelClosed:out.final.novelClosed,detached:out.final.detachedNovelClosed,cpu:+out.cpuSeconds.toFixed(1)}));
}
function all(stem){
  const list=jobs();let next=0,live_=0;
  const launch=()=>{while(live_<4&&next<list.length){const j=list[next++];live_++;
    const p=spawn(process.execPath,[__filename,'job',stem,j.start,j.arm,String(j.seed)],{stdio:['ignore','inherit','inherit']});
    p.on('exit',code=>{live_--;if(code)console.error('FAILED',JSON.stringify(j));launch();});}};
  launch();
}
function summary(stem){
  const rows=jobs().map(j=>{const r=kit.read(`${stem}_${j.start}_${j.arm}_${j.seed}.json.gz`);
    return {...j,novelChain:r.milestones.novelChain?.t??null,novelClosed:r.milestones.novelClosed?.t??null,unpairedClosed:r.milestones.unpairedClosed?.t??null,
      detachedAtMilestone:r.milestones.unpairedClosed?.detached??null,finalNovelClosed:r.final.novelClosed,finalDetached:r.final.detachedNovelClosed,
      maxOverlap:Math.max(r.final.geometry.maxOverlap,...r.samples.map(x=>x.maxOverlap)),rim:r.final.summary.rimAttachments,checked:r.check,cpu:r.cpuSeconds};});
  const cell=(start,arm)=>rows.filter(r=>r.start===start&&r.arm===arm);
  const count=(rs,k)=>rs.filter(r=>r[k]!==null&&r[k]!==false&&r[k]!==0).length;
  const table=['contacts','bath'].flatMap(start=>['project','pins'].map(arm=>{const rs=cell(start,arm);
    return {start,arm,n:rs.length,novelChain:count(rs,'novelChain'),novelClosed:count(rs,'novelClosed'),unpairedClosed:count(rs,'unpairedClosed'),
      detached:rs.filter(r=>r.detachedAtMilestone||r.finalDetached).length,maxOverlap:+Math.max(...rs.map(r=>r.maxOverlap)).toFixed(4),cpu:+rs.reduce((a,r)=>a+r.cpu,0).toFixed(1)};}));
  const b=a=>table.find(t=>t.start==='bath'&&t.arm===a);
  const lead=(b('pins').novelClosed>=2&&b('project').novelClosed===0)||b('pins').detached+b('pins').unpairedClosed>=1;
  const out={rows,table,lead};kit.write(stem+'.summary.json',out);
  for(const t of table)console.log(JSON.stringify(t));console.log(JSON.stringify({lead}));
}
const [mode,stem,...rest]=process.argv.slice(2);
if(require.main===module){
  if(mode==='all')all(stem);else if(mode==='job')job(stem,rest[0],rest[1],Number(rest[2]));else if(mode==='summary')summary(stem);
  else throw new Error('mode: all | job | summary');
}
module.exports={PinsLiveSim,jobs};
