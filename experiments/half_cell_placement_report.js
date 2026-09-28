#!/usr/bin/env node
'use strict';
const fs=require('fs'),assert=require('assert/strict');
const {read,write}=require('./half_cell_bath'),{hash}=require('./half_cell_rim_test');
const live=require('./half_cell_live');
const [input,stem]=process.argv.slice(2),summary=read(input),panels=[];
assert(summary.complete);
const load=x=>{const p=fs.existsSync(x.path)?x.path:'experiments/out/'+require('path').basename(x.path);assert.equal(hash(p),x.sha256);return read(p);};
const records=summary.inputs.slice(1).map(load);
for(const r of records){const attempt=r.record.attempts.find(a=>!a.accepted&&a.geometry.branch==='free');if(attempt)panels.push({title:`${r.job.seed}/${r.job.on?'on':'off'} first free rejection`,attempt});}
const bound=records.flatMap(r=>r.record.attempts).find(a=>!a.accepted&&a.geometry.branch==='bound');if(bound)panels.push({title:'First bound rejection (ordered worlds)',attempt:bound});
const prepared=load(summary.inputs[0]).prepared.record.attempts.find(a=>a.accepted&&a.geometry.branch==='free');panels.push({title:'Prepared contact: successful free placement',attempt:prepared});
const svg=['<svg xmlns="http://www.w3.org/2000/svg" width="1040" height="1260" viewBox="0 0 1040 1260">','<rect width="1040" height="1260" fill="#101923"/>'];
const esc=x=>String(x).replace(/&/g,'&amp;').replace(/</g,'&lt;');
const text=(x,y,str,size=15,color='#edf3fa')=>svg.push(`<text x="${x}" y="${y}" font-family="Arial,sans-serif" font-size="${size}" fill="${color}">${esc(str)}</text>`);
text(24,34,'Why ordinary placements were rejected',26);text(24,61,'Hull of actual corners; dashed cyan = proposed free-part pose. W uses carrier type C.',15);
const metadata=[];
panels.forEach(({title,attempt:a},index)=>{
  const s=live.LiveHalfCellSim.fromState(a.state),q=a.geometry,x=24+(index%2)*510,y=98+Math.floor(index/2)*370;
  text(x,y,title,18);text(x,y+23,`t=${q.t}  ${q.types.join('/')}  sides ${'FRKL'[q.i]}/${'FRKL'[q.j]}  gap=${q.contact.gap.toFixed(5)}`);
  const free=q.branch==='free',origin=free?[q.pose.tx,q.pose.ty]:[s.px[q.u],s.py[q.u]],units=new Set(free?[q.moving,q.anchor,...q.blockers.map(b=>b.unit)]:[q.u,q.v]);
  const polys=[...units].map(u=>({u,ps:s._outline(u,s._dx(s.px[u]-origin[0]),s._dy(s.py[u]-origin[1]))}));
  const points=polys.flatMap(p=>p.ps).concat(free?q.projected:[]),xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);
  const minX=Math.min(...xs)-.15,maxX=Math.max(...xs)+.15,minY=Math.min(...ys)-.15,maxY=Math.max(...ys)+.15;
  const scale=Math.min(470/(maxX-minX),238/(maxY-minY));
  const map=ps=>ps.map(([a,b])=>[x+10+(a-minX)*scale,y+40+(b-minY)*scale]);
  const poly=(ps,fill,stroke,dash='')=>svg.push(`<polygon points="${map(ps).map(p=>p.join(',')).join(' ')}" fill="${fill}" fill-opacity=".55" stroke="${stroke}" stroke-width="1.7" ${dash}/>`);
  for(const {u,ps}of polys){const isPartner=u===(free?q.anchor:q.u),isMoving=u===(free?q.moving:q.v);
    poly(ps,isMoving?'#8598ad':isPartner?'#efb75c':'#ed6e83',isMoving?'#afc3d8':isPartner?'#ffce8c':'#ff8999');
    const cx=ps.reduce((n,p)=>n+p[0],0)/ps.length,cy=ps.reduce((n,p)=>n+p[1],0)/ps.length,[pos]=map([[cx,cy]]);text(pos[0]-7,pos[1]+4,u,13);
  }
  if(free)poly(q.projected,'#2aced9','#52f0f5','stroke-dasharray="6 4"');
  if(free){text(x,y+305,`Blockers: ${q.blockers.map(b=>`${b.unit}${b.intended?' (partner)':''}`).join(', ')||'none'}`);text(x,y+328,`Largest overlap area: ${Math.max(0,...q.blockers.map(b=>b.area)).toExponential(3)}`);}
  else{text(x,y+305,`Endpoint gap ${q.contact.gap.toFixed(5)} exceeds ${q.limit}`);text(x,y+328,'Bound parts acquire pins in place; no projection.');}
  metadata.push({title,t:q.t,args:a.args,geometry:q,sourceState:a.state});
});
text(24,1230,'Prepared success is a contact control. These replays establish neither reproduction nor reliable exclusion.',15);
svg.push('</svg>');fs.writeFileSync(stem+'.svg',svg.join('\n')+'\n',{flag:'wx'});
write(stem+'.report.json',{command:process.argv.slice(1),summaryHash:hash(input),sourceHash:hash(__filename),panels:metadata,
  figure:{path:stem+'.svg',sha256:hash(stem+'.svg')},steps:0,cpuSeconds:Object.values(process.cpuUsage()).reduce((a,b)=>a+b,0)/1e6});
console.log(stem+'.svg');
