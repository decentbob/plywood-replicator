#!/usr/bin/env node
'use strict';
const fs=require('fs'),assert=require('assert/strict');
const {read,write}=require('./half_cell_bath'),{hash}=require('./half_cell_rim_test');
const {LiveHalfCellSim}=require('./half_cell_live');
const [input,stem]=process.argv.slice(2),raw=read(input);assert(raw.complete&&!raw.censored);
for(const suffix of ['.svg','.report.json'])assert(!fs.existsSync(stem+suffix));
const pins=raw.records.filter(c=>c.job.arm==='pins'),first=pins.find(c=>!c.previouslyAccepted&&c.job.mode==='body16');
let worst={value:-1};for(const c of pins)for(const q of c.samples.slice(-10))if(q.metrics.targetOverlap>worst.value)worst={value:q.metrics.targetOverlap,c,dt:q.dt};
const choices=[{c:first,dt:60,label:'First rejected bath contact'}, {c:worst.c,dt:worst.dt,label:'Largest final-window target overlap'}];
const svg=['<svg xmlns="http://www.w3.org/2000/svg" width="1180" height="900" viewBox="0 0 1180 900">','<rect width="1180" height="900" fill="#101923"/>'];
const text=(x,y,value,size=15)=>svg.push(`<text x="${x}" y="${y}" font-family="Arial,sans-serif" font-size="${size}" fill="#edf3fa">${String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;')}</text>`);
text(24,34,'Face capture: projection, edge pins, or waiting',26);text(24,62,'Actual corners after prepared attachment; physics only. No new material or subsequent chemistry.',16);
const panels=[];
choices.forEach((choice,row)=>{
  text(24,104+row*366,`${choice.label}: ${choice.c.entry}, ${choice.c.job.mode}, dt=${choice.dt}`,18);
  ['project','pins','wait'].forEach((arm,col)=>{
    const c=raw.records.find(c=>c.entry===choice.c.entry&&c.job.mode===choice.c.job.mode&&c.job.arm===arm),q=c.samples[choice.dt],f=q.frame;
    const s=LiveHalfCellSim.fromState(c.initial),a=c.meta.anchor,m=c.meta.moving,x=24+col*386,y=122+row*366,scale=36,cx=f.centers[a][0],cy=f.centers[a][1];
    const point=p=>[x+175+(p[0]-cx)*scale,y+145+(p[1]-cy)*scale];
    text(x,y+8,arm==='project'?'Current projection':arm==='pins'?'In-place edge pins':'Wait without binding',18);
    const id=`clip${row}${col}`;svg.push(`<defs><clipPath id="${id}"><rect x="${x}" y="${y+20}" width="350" height="250"/></clipPath></defs><rect x="${x}" y="${y+20}" width="350" height="250" fill="#152430"/><g clip-path="url(#${id})">`);
    for(let u=0;u<f.polygons.length;u++){
      const dx=s._dx(f.centers[u][0]-cx)-(f.centers[u][0]-cx),dy=s._dy(f.centers[u][1]-cy)-(f.centers[u][1]-cy);
      const ps=f.polygons[u].map(([px,py])=>point([px+dx,py+dy]));
      const color=u===a?'#efb75c':u===m?'#54cbd7':s.type[u]===4?'#8dbb96':s.type[u]===2?'#ebdb79':'#adbdcf';
      svg.push(`<polygon points="${ps.map(p=>p.join(',')).join(' ')}" fill="${color}" fill-opacity=".65" stroke="${u===m?'#5cffff':'#263f50'}" stroke-width="${u===m?2:1}"/>`);
      if(u===a||u===m){const [px,py]=point([f.centers[u][0]+dx,f.centers[u][1]+dy]);text(px-5,py+4,u,12);}
    }
    svg.push('</g>');text(x,y+292,`Target pin ${q.metrics.targetPin.toFixed(3)} | overlap ${q.metrics.targetOverlap.toFixed(4)}`,14);
    text(x,y+315,`All-pair overlap ${q.metrics.maxOverlap.toFixed(4)} | rail access ${q.metrics.probe.good?'yes':'no'}`,14);
    panels.push({entry:c.entry,job:c.job,dt:q.dt,metrics:q.metrics});
  });
});
text(24,857,'Orange: docking anchor. Cyan: incoming part. Green: W. Cropped around the anchor in each arm.',15);
text(24,883,'The second row is an explicitly selected diagnostic maximum, not an independent replicate.',15);svg.push('</svg>');
fs.writeFileSync(stem+'.svg',svg.join('\n')+'\n',{flag:'wx'});
write(stem+'.report.json',{command:process.argv.slice(1),sourceHash:hash(__filename),rawHash:hash(input),panels,
  figure:{path:stem+'.svg',sha256:hash(stem+'.svg')},cpuSeconds:Object.values(process.cpuUsage()).reduce((a,b)=>a+b,0)/1e6,steps:0});
console.log(stem+'.svg');
