#!/usr/bin/env node
'use strict';
const fs=require('fs'),assert=require('assert/strict');
const {read,write}=require('./half_cell_bath'),{hash}=require('./half_cell_rim_test');
const [summaryFile,stem]=process.argv.slice(2);assert(summaryFile&&stem);
for(const suffix of ['.svg','.report.json'])assert(!fs.existsSync(stem+suffix),'Refusing overwrite');
const summary=read(summaryFile);assert(summary.complete);
const escape=x=>String(x).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const svg=['<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1162" viewBox="0 0 1000 1162">',
  '<rect width="1000" height="1162" fill="#f5f7f8"/>'];
const text=(x,y,value,size=16)=>svg.push(`<text x="${x}" y="${y}" font-family="Arial,sans-serif" font-size="${size}" fill="#233542">${escape(value)}</text>`);
text(24,32,'Free-bath half-cell acquisition · actual final polygons',25);
text(24,58,'Two fresh seeds; 50,000 steps; same material, automatic W binding on / off',16);
const panels=[];
for(let j=0;j<4;j++){
  const r=read(summary.inputs[j].path),q=r.samples.at(-1),f=q.frame,row=summary.rows[j];
  const x=24+(j%2)*494,y=106+Math.floor(j/2)*528,S=430,scale=S/f.width;
  text(x,y-16,`Seed ${r.job.seed} · rim binding ${r.job.on?'on':'off'} · t=${q.t}`,18);
  svg.push(`<defs><clipPath id="p${j}"><rect x="${x}" y="${y}" width="${S}" height="${S}"/></clipPath></defs>`,
    `<rect x="${x}" y="${y}" width="${S}" height="${S}" fill="#101a23"/><g clip-path="url(#p${j})">`);
  const color={0:'#c8dcec',2:'#ffe775',4:'#a5d4b5',7:'#f1cc8b',8:'#f1cc8b'};
  for(const dx of [-f.width,0,f.width])for(const dy of [-f.height,0,f.height]){
    for(let u=0;u<f.types.length;u++){
      const ps=f.polygons[u].map(p=>[x+(p[0]+dx)*scale,y+(p[1]+dy)*scale]);
      svg.push(`<polygon points="${ps.map(p=>p.join(',')).join(' ')}" fill="${color[f.types[u]]}" stroke="#243b47" stroke-width=".6"/>`);
    }
    for(const [a,b]of [...f.bonds,...f.rimBonds]){
      const u=a>>2,v=b>>2,pa=f.centers[u],pb=f.centers[v];let vx=pb[0]-pa[0],vy=pb[1]-pa[1];vx-=f.width*Math.round(vx/f.width);vy-=f.height*Math.round(vy/f.height);
      svg.push(`<line x1="${x+(pa[0]+dx)*scale}" y1="${y+(pa[1]+dy)*scale}" x2="${x+(pa[0]+vx+dx)*scale}" y2="${y+(pa[1]+vy+dy)*scale}" stroke="#55756e" stroke-width=".7"/>`);
    }
  }
  svg.push('</g>');
  text(x,y+S+22,`New W bonds ${row.rim}; free W ${row.finalFreeW}; new closed D ${row.firstClosed===null?'none':'yes'}`,14);
  panels.push({job:r.job,t:q.t,rawHash:hash(summary.inputs[j].path)});
}
text(24,1102,'Blue A · orange P/Q caps · green W · yellow E. Each world conserves 28 blocks.',16);
text(24,1128,'One D is prepared initially. Connectivity does not establish a sealed wall or inherited benefit.',15);
svg.push('</svg>');fs.writeFileSync(stem+'.svg',svg.join('\n')+'\n',{flag:'wx'});
const c=process.cpuUsage();write(stem+'.report.json',{command:process.argv.slice(1),sourceHash:hash(__filename),summaryHash:hash(summaryFile),
  panels,figure:{path:stem+'.svg',sha256:hash(stem+'.svg')},cpuSeconds:(c.user+c.system)/1e6,physicsSteps:0});
console.log(stem+'.svg');
