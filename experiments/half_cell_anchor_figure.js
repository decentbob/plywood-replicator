#!/usr/bin/env node
'use strict';
// Replays one Q8m world from its saved initial state (checking the saved final state) and draws actual polygons at
// chosen steps. Observation only.  node experiments/half_cell_anchor_figure.js RAW.json.gz OUT.svg t1,t2,...
const fs=require('fs'),assert=require('assert/strict');
const {TNAME}=require('../src/sim'),kit=require('./screen_kit'),g=require('./half_cell_geometry'),live=require('./half_cell_live');
const {AnchorProjectSim,AnchorPinsSim}=require('./half_cell_anchor');
const [raw,out,times]=process.argv.slice(2);assert(raw&&out&&times&&!fs.existsSync(out),'usage / refusing overwrite');
const r=kit.read(raw),Cls={anchorPins:AnchorPinsSim,anchorProject:AnchorProjectSim}[r.job.arm];
const ts=times.split(',').map(Number),frames=[],s=Cls.fromState(r.initial);
const key=xs=>xs.join(',');
const snap=()=>{const o=live.observe(s);frames.push({t:s.t,f:{...g.frame(s),rimBonds:[...s.rimBond].flatMap((b,a)=>b>a?[[a,b]]:[])},
  types:[...s.type],daughters:o.closed.filter(c=>key(c.units)!==key(r.founder)).map(c=>[...c.units,...c.rim]),
  chains:o.chains.filter(c=>key(c.units)!==key(r.founder)).map(c=>c.units),founder:o.closed.filter(c=>key(c.units)===key(r.founder)).map(c=>[...c.units,...c.rim])});};
if(ts.includes(0))snap();
while(s.t<r.job.steps){s.step();if(ts.includes(s.t))snap();}
assert.deepEqual(JSON.parse(JSON.stringify(kit.comparable(s.saveState()))),kit.comparable(r.finalState),'replay differs from saved final state');
const W=r.initial.p.W,S=380,cols=Math.min(3,frames.length),rows=Math.ceil(frames.length/cols),PW=S+24,PH=S+56;
const width=24+cols*PW,height=110+rows*PH+60,svg=[`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,`<rect width="${width}" height="${height}" fill="#f5f7f8"/>`];
const esc=x=>String(x).replace(/&/g,'&amp;').replace(/</g,'&lt;');
const text=(x,y,v,z=15,c='#233542')=>svg.push(`<text x="${x}" y="${y}" font-family="Arial,sans-serif" font-size="${z}" fill="${c}">${esc(v)}</text>`);
text(24,32,`Half-cell soup with anchored rim growth · K=${r.job.k??4} · ${r.job.arm} · seed ${r.job.seed}`,22);
text(24,56,'Actual polygons from a deterministic replay (final state matches the saved run). Body motion, 16 passes.',14);
const fill={A:'#9cc3e6',P:'#f0a35e',Q:'#e4785a',C:'#8fcf9f',E:'#ffe36e'};
frames.forEach((q,j)=>{
  const x=24+(j%cols)*PW,y=90+Math.floor(j/cols)*PH,k=S/W,f=q.f,d=new Set(q.daughters.flat()),c=new Set(q.chains.flat()),fo=new Set(q.founder.flat());
  svg.push(`<defs><clipPath id="c${j}"><rect x="${x}" y="${y}" width="${S}" height="${S}"/></clipPath></defs><rect x="${x}" y="${y}" width="${S}" height="${S}" fill="#15222d"/><g clip-path="url(#c${j})">`);
  for(const dx of [-W,0,W])for(const dy of [-W,0,W]){
    f.polygons.forEach((ps,u)=>{const pts=ps.map(p=>`${(x+(p[0]+dx)*k).toFixed(1)},${(y+(p[1]+dy)*k).toFixed(1)}`).join(' ');
      const hi=d.has(u)?'#ffffff':c.has(u)?'#c77dff':fo.has(u)?'#ff5d5d':'#2c4452',sw=d.has(u)||c.has(u)||fo.has(u)?1.6:.6;
      svg.push(`<polygon points="${pts}" fill="${fill[TNAME[q.types[u]]]||'#ccc'}" stroke="${hi}" stroke-width="${sw}"/>`);});
  }
  svg.push('</g>');
  text(x,y+S+20,`t = ${q.t}: new closed D ${q.daughters.length}, new chains ${q.chains.length}`,14);
});
text(24,height-38,'Blue A letters, orange P / red Q caps, green W rim, yellow E fuel. Outlines: red founder D, white new closed D, purple new chain.',13);
text(24,height-18,'Exploratory screen tier: one world, prepared founder, conserved loose material; not a confirmed reproduction result.',13);
svg.push('</svg>');fs.writeFileSync(out,svg.join('\n')+'\n',{flag:'wx'});console.log(out,frames.length,'frames');
