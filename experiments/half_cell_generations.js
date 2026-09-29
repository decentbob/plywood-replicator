#!/usr/bin/env node
'use strict';
// Q8n: anchored half-cell soups with observer-only parent tracking. See half_cell_generations_plan.md.
//   all STEM | job STEM ARM SEED | summary STEM
const {spawn}=require('child_process'),{F}=require('../src/sim');
const live=require('./half_cell_live'),bath=require('./half_cell_bath'),kit=require('./screen_kit');
const {AnchorProjectSim,AnchorPinsSim}=require('./half_cell_anchor'),{createSoup}=require('./half_cell_soup');
const CLASS={anchorProject:AnchorProjectSim,anchorPins:AnchorPinsSim},SEEDS=[1301,1302,1303,1304,1305,1306],STEPS=150000;
const jobs=()=>Object.keys(CLASS).flatMap(arm=>SEEDS.map(seed=>({arm,seed})));
const key=xs=>xs.join(',');
function tracker(founder){
  const ids=new Map([[key(founder),{units:founder,gen:0,parent:null,born:0,closed:0,unpaired:null,detached:null,lastPartners:null}]]);
  return {ids,update(s){
    const o=live.observe(s),owner=new Map();
    for(const c of o.chains)for(const u of c.units)owner.set(u,key(c.units));
    for(const c of o.chains){
      const k=key(c.units);let rec=ids.get(k);
      const partners={};for(const u of c.units){const b=s.bond[u*4+F];if(b>=0&&owner.has(b>>2)&&owner.get(b>>2)!==k)partners[owner.get(b>>2)]=(partners[owner.get(b>>2)]||0)+1;}
      if(!rec){
        const best=Object.entries(partners).sort((a,b)=>b[1]-a[1])[0];
        const parent=best?best[0]:null,pg=parent&&ids.get(parent)?ids.get(parent).gen:null;
        rec={units:c.units,gen:pg===null?null:pg+1,parent,born:s.t,closed:0,unpaired:null,detached:null};ids.set(k,rec);
      }
    }
    for(const c of o.closed){const rec=ids.get(key(c.units));if(!rec)continue;
      if(!rec.closed)rec.closed=s.t;
      if(c.unpaired&&!rec.unpaired){rec.unpaired=s.t;if(bath.detached(s,[...c.units,...c.rim]).detached)rec.detached=s.t;}
      else if(c.unpaired&&rec.unpaired&&!rec.detached&&s.t%1000===0&&bath.detached(s,[...c.units,...c.rim]).detached)rec.detached=s.t;}
    return o;
  }};
}
function job(stem,arm,seed){
  const file=`${stem}_${arm}_${seed}.json.gz`,Cls=CLASS[arm],w=createSoup({seed,extra:4,size:24,Cls}),initial=w.s.saveState();
  const tr=tracker(w.founder),samples=[];
  const watch=s=>{if(s.t%100)return;const o=tr.update(s);
    if(s.t%5000===0)samples.push({t:s.t,chains:o.chainCount,closed:o.closedCount,copying:o.copyingContacts,freeW:o.freeW,charged:o.charged,ids:tr.ids.size});};
  const t0=kit.cpu(),r=kit.run(initial,STEPS,watch,{check:seed===SEEDS[0],Cls});
  const lineage=[...tr.ids.values()].map(x=>({...x,units:x.units}));
  const out={job:{arm,seed,steps:STEPS},founder:w.founder,initial,lineage,samples,checked:r.checked,finalState:r.final,tape:r.tape,cpuSeconds:kit.cpu()-t0};
  kit.write(file,out);
  console.log(JSON.stringify({arm,seed,lineage:lineage.map(x=>({gen:x.gen,born:x.born,closed:x.closed,unpaired:x.unpaired,detached:x.detached})),cpu:+out.cpuSeconds.toFixed(0)}));
}
function all(stem){const list=jobs();let next=0,n=0;const go=()=>{while(n<4&&next<list.length){const j=list[next++];n++;
  spawn(process.execPath,[__filename,'job',stem,j.arm,String(j.seed)],{stdio:['ignore','inherit','inherit']}).on('exit',c=>{n--;if(c)console.error('FAILED',JSON.stringify(j));go();});}};go();}
function summary(stem){
  const rows=jobs().map(j=>{const r=kit.read(`${stem}_${j.arm}_${j.seed}.json.gz`),L=r.lineage;
    const gens=g=>L.filter(x=>x.gen===g);
    return {...j,chains:L.length-1,gen1:gens(1).length,gen2:gens(2).length,gen3plus:L.filter(x=>x.gen>=3).length,unknownParent:L.filter(x=>x.gen===null).length,
      closedGen1:gens(1).filter(x=>x.closed).length,closedGen2:L.filter(x=>x.gen>=2&&x.closed).length,
      separated:L.filter(x=>x.gen>0&&x.detached).length,checked:r.checked,cpu:Math.round(r.cpuSeconds)};});
  const lead=rows.some(r=>r.closedGen2>0),partial=rows.some(r=>r.gen2>0);
  kit.write(stem+'.summary.json',{rows,lead,partial});for(const r of rows)console.log(JSON.stringify(r));console.log(JSON.stringify({lead,partial}));
}
const [mode,stem,...a]=process.argv.slice(2);
if(mode==='all')all(stem);else if(mode==='job')job(stem,a[0],Number(a[1]));else if(mode==='summary')summary(stem);else throw Error('mode');
