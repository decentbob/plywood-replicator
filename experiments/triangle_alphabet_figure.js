'use strict';
// Design figure for the triangle-only chain (user, 2026-09-30). Pure geometry, no simulation.
// A chain is a band of unit triangles: each has two chain neighbours and one free edge, a FACE (copying side, left of the
// direction of travel) or a hidden BACK (right). Grouping each face with the backs that follow gives three letters:
//   T = F      (1 triangle, bend 60 degrees away from the copy side)
//   R = F B    (2 triangles, a rhombus, straight)
//   Z = F B B  (3 triangles, a trapezoid, bend toward the copy side)
// Copying: a free triangle docks on every face; the gap between two docked triangles around their shared vertex is filled
// by 2 - c triangles (c = hidden backs between the faces). So T <-> Z, R <-> R, and a copy of the copy restores the chain.
// The script builds the copies on the lattice and checks: no overlaps, copy gaps 2 - c, copy of copy = original.
//   node experiments/triangle_alphabet_figure.js [OUT.png]
const fs=require('fs'),path=require('path'),{execFileSync}=require('child_process');
const out=process.argv[2]||'experiments/out/TRI_alphabet_20260930.png';
const LET={T:['F'],R:['F','B'],Z:['F','B','B']},COMP={T:'Z',R:'R',Z:'T'};
const add=(a,b)=>[a[0]+b[0],a[1]+b[1]],sub=(a,b)=>[a[0]-b[0],a[1]-b[1]],mid=(a,b)=>[(a[0]+b[0])/2,(a[1]+b[1])/2];
const cross=(a,b)=>a[0]*b[1]-a[1]*b[0],cen=t=>[(t[0][0]+t[1][0]+t[2][0])/3,(t[0][1]+t[1][1]+t[2][1])/3];
const rot=(p,c,a)=>{const d=sub(p,c),co=Math.cos(a),si=Math.sin(a);return [c[0]+co*d[0]-si*d[1],c[1]+si*d[0]+co*d[1]];};
const close=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1])<1e-6;

// Build a band from a role list. Returns triangles {v:[a,b,x], role, free:[p,q] (free edge), entry, exit}.
function band(roles,start=[[0,0],[0,1]],dir=1){
  // first triangle: entry edge `start`, apex on the side given by dir
  let [a,b]=start,x=rot(b,a,-dir*Math.PI/3);const out=[];
  for(let k=0;k<roles.length;k++){
    const entryMid=mid(a,b);let pick=null;
    for(const [ex,fr] of [[[a,x],[b,x]],[[b,x],[a,x]]]){
      const exitMid=mid(ex[0],ex[1]),freeMid=mid(fr[0],fr[1]),left=cross(sub(exitMid,entryMid),sub(freeMid,entryMid))>0;
      if((roles[k]==='F')===left)pick={ex,fr};}
    const t={v:[a,b,x],role:roles[k],free:pick.fr,entry:[a,b],exit:pick.ex};out.push(t);
    const opp=t.v.find(v=>!close(v,pick.ex[0])&&!close(v,pick.ex[1]));[a,b]=pick.ex;x=sub(add(a,b),opp);   // next apex: reflect across the exit edge
  }
  return out;
}
const rolesOf=seq=>[...seq].flatMap(c=>LET[c]);
function facesGaps(tris){const g=[];let c=null;for(const t of tris){if(t.role==='F'){if(c!==null)g.push(c);c=0;}else if(c!==null)c++;}return g;}
// Copy: dock on each face (reflect across the face edge), then fill around the shared vertex of consecutive faces.
function copyOf(tris){
  const faces=tris.filter(t=>t.role==='F'),dock=faces.map(t=>{const [p,q]=t.free,x=t.v.find(v=>!close(v,p)&&!close(v,q));return {v:[p,q,sub(add(p,q),x)],role:'F',kind:'dock'};});
  const out=[dock[0]];
  for(let k=0;k+1<faces.length;k++){
    const f1=faces[k].free,f2=faces[k+1].free,V=[...f1].find(p=>f2.some(q=>close(p,q)));
    if(!V)throw Error('faces do not share a vertex');
    // rotate dock k about V toward dock k+1 in 60 degree steps until it coincides
    let cur=dock[k].v,fills=[],ok=false;
    for(const sgn of [1,-1]){cur=dock[k].v;fills=[];
      for(let s=0;s<3;s++){cur=cur.map(p=>rot(p,V,sgn*Math.PI/3));
        if(cur.every(p=>dock[k+1].v.some(q=>close(p,q)))){ok=true;break;}
        if(tris.some(t=>Math.hypot(...sub(cen(t.v),cen(cur)))<0.5))break;   // this way round runs into the template
        fills.push({v:cur,role:'B',kind:'fill'});}
      if(ok)break;}
    if(!ok)throw Error('copy cannot close between faces '+k+' and '+(k+1)+' (overlap)');
    out.push(...fills,dock[k+1]);
  }
  return out;
}
function overlaps(list){  // two triangles overlap if their centroids are closer than the inradius*2
  for(let i=0;i<list.length;i++)for(let j=i+1;j<list.length;j++)if(Math.hypot(...sub(cen(list[i].v),cen(list[j].v)))<0.5)return [i,j];return null;}
// The copy runs antiparallel. Read in its own direction, its gaps are 2 - c in reverse order; as letters (gap -> T/R/Z)
// plus a final R for the end letter (the last letter's hidden triangle follows the last face and is not templated).
function seqOfCopy(copy){return [...facesGaps(copy)].reverse().map(g=>'TRZ'[g]).join('')+'R';}
function check(seq){
  const t=band(rolesOf(seq)),c=copyOf(t),ov=overlaps([...t,...c]);
  if(ov)throw Error(seq+': overlap');
  const cseq=seqOfCopy(c);
  return {t,c,cseq,gaps:facesGaps(t),copyGaps:facesGaps(c)};
}

// ---------------- drawing ----------------
const W=1500,H=1260,parts=[];
const txt=(x,y,s,o={})=>parts.push(`<text x="${x}" y="${y}" font-family="Helvetica,Arial,sans-serif" font-size="${o.size||16}" fill="${o.fill||'#222'}" text-anchor="${o.anchor||'start'}" font-weight="${o.weight||'normal'}">${s}</text>`);
const COL={F:'#f6cf8a',B:'#c98f2e',dock:'#9fd8cf',fill:'#3f9e8f',grow:'#c9a0f0'};
function view(list,cx,cy,sc){const pts=list.flatMap(t=>t.v);let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;
  for(const p of pts){x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);y0=Math.min(y0,p[1]);y1=Math.max(y1,p[1]);}
  return p=>[cx+(p[0]-(x0+x1)/2)*sc,cy-(p[1]-(y0+y1)/2)*sc];}
function tri(V,t,fill,stroke='#333',w=1){parts.push(`<polygon points="${t.v.map(p=>V(p).map(z=>z.toFixed(1)).join(',')).join(' ')}" fill="${fill}" stroke="${stroke}" stroke-width="${w}" stroke-linejoin="round"/>`);}
function seg(V,a,b,col,w){const A=V(a),B=V(b);parts.push(`<line x1="${A[0].toFixed(1)}" y1="${A[1].toFixed(1)}" x2="${B[0].toFixed(1)}" y2="${B[1].toFixed(1)}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>`);}
function letterOutline(V,tris){  // thick outline around each letter group (face + following backs)
  let g=[];const groups=[];for(const t of tris){if(t.role==='F'&&g.length){groups.push(g);g=[];}g.push(t);}groups.push(g);
  for(const gr of groups){const edges=[];for(const t of gr)for(let i=0;i<3;i++)edges.push([t.v[i],t.v[(i+1)%3]]);
    for(const e of edges){const n=edges.filter(f=>(close(e[0],f[0])&&close(e[1],f[1]))||(close(e[0],f[1])&&close(e[1],f[0]))).length;if(n===1)seg(V,e[0],e[1],'#222',2.6);}}
  return groups;}
function drawChain(tris,copy,cx,cy,sc,opt={}){
  const V=view([...tris,...(copy||[])],cx,cy,sc);
  for(const t of tris)tri(V,t,COL[t.role]);
  if(copy)for(const t of copy)tri(V,t,t.kind==='dock'?COL.dock:COL.fill);
  const groups=letterOutline(V,tris);if(copy)letterOutline(V,copy);
  for(const t of tris)if(t.role==='F')seg(V,t.free[0],t.free[1],'#e0672b',4);
  if(opt.labels)groups.forEach(g=>{const c=V(cen(g[g.length>1?1:0].v));txt(c[0],c[1]+5,({1:'T',2:'R',3:'Z'})[g.length],{anchor:'middle',weight:'bold',size:15});});
  return V;
}

parts.push(`<rect width="${W}" height="${H}" fill="#fbfaf7"/>`);
txt(30,42,'Triangle-only chain: one base shape, three letters, copying by docking and filling',{size:26,weight:'bold'});
txt(30,68,'A chain is a band of unit triangles. Each has two chain neighbours and one free edge: a face (orange line, copying side) or a hidden back. Letter = one face plus the backs that follow it.',{size:15,fill:'#555'});

// Panel A: letters
txt(30,112,'A. Three letters (thick outline), all made of the one triangle',{size:19,weight:'bold'});
[['T','T: face only (1 triangle): bend away from the copy side'],['R','R: face + 1 hidden (rhombus): straight'],['Z','Z: face + 2 hidden (trapezoid): bend toward the copy side']].forEach(([L,s],i)=>{
  const t=band(['B',...LET[L],'B']);const V=view(t,200+i*310,190,55);
  t.forEach((q,k)=>tri(V,q,k===0||k===t.length-1?'#eee':COL[q.role],k===0||k===t.length-1?'#bbb':'#333'));
  letterOutline(V,t.slice(1,-1));for(const q of t.slice(1,-1))if(q.role==='F')seg(V,q.free[0],q.free[1],'#e0672b',4);
  txt(200+i*310,262,s,{anchor:'middle',size:13});});
txt(1000,160,'light = orange face triangle, dark = hidden back triangle',{size:13,fill:'#555'});
txt(1000,180,'teal = copy: light docked on a face, dark = fill triangle',{size:13,fill:'#555'});
txt(1000,200,'grey triangles = neighbouring letters',{size:13,fill:'#555'});

// Panel B: pairing rule
txt(30,305,'B. Complement: the gap between two faces (c hidden backs) is filled by 2 − c triangles, so T ⇄ Z and R ⇄ R',{size:19,weight:'bold'});
['RRR','RTR','RZR'].forEach((sq,i)=>{const r=check(sq);drawChain(r.t,r.c,200+i*430,420,48,{labels:true});
  txt(200+i*430,515,`${sq}: gaps ${r.gaps.join(',')} → copy ${r.cseq} (gaps ${[...r.copyGaps].reverse().join(',')})`,{anchor:'middle',size:14});});

// Panel C: a kinked chain and its copy; copy of copy
txt(30,560,'C. A kinked chain RRTRRZRR, its moulded copy, and the copy of the copy (= the original shape)',{size:19,weight:'bold'});
const C1=check('RRTRRZRR');drawChain(C1.t,C1.c,380,700,30,{labels:true});
txt(380,840,`template RRTRRZRR (gaps ${C1.gaps.join('')}); copy gaps ${C1.copyGaps.join('')}, copy reads ${C1.cseq}`,{anchor:'middle',size:14});
const C2=check(C1.cseq);drawChain(C2.t,C2.c,1100,700,30,{labels:true});
txt(1100,840,`the copy ${C1.cseq} as template; its copy reads ${C2.cseq} (the original)`,{anchor:'middle',size:14});
if(C2.cseq!=='RRTRRZRR')throw Error('copy of copy differs: '+C2.cseq);

// Panel D: growth sites and example parts (sketch)
txt(30,895,'D. Growth sites on the hidden side (sketch): parts grown by local rules, ended by closure or a stop triangle',{size:19,weight:'bold'});
{const t=band(rolesOf('RRZRRTRR')),V=drawChain(t,null,380,1040,44,{labels:true});
  // Z back: the two hidden triangles' back edges; grow a closed hexagon on the Z's middle back vertex (sketch)
  // Z back: the hexagon of 6 triangles around the vertex y opposite one Z back edge (shares that edge; ends by closure)
  const zb=t.filter((q,k)=>q.role==='B'&&t[k-1]&&t[k-1].role==='B');
  let hex=null;for(const b of [...zb,...t.filter((q,k)=>q.role==='B'&&t[k+1]&&t[k+1].role==='B')]){
    const [p,q]=b.free,inner=b.v.find(v=>!close(v,p)&&!close(v,q)),y=sub(add(p,q),inner);
    const h=[...Array(6)].map((_,k)=>({v:[y,rot(p,y,k*Math.PI/3),rot(p,y,(k+1)*Math.PI/3)]}));
    if(!h.some(a=>t.some(c=>Math.hypot(...sub(cen(a.v),cen(c.v)))<0.5))){hex=h;break;}}
  if(hex)for(const h of hex)tri(V,h,COL.grow,'#6a4a8a');
  // R back: a 3-triangle spike (fin) on the first R's back edge
  const rb=t[1];const [p,q]=rb.free,x=rb.v.find(v=>!close(v,p)&&!close(v,q)),y=sub(add(p,q),x);
  const f1={v:[p,q,y]},f2=(()=>{const z=sub(add(q,y),p);return {v:[q,y,z]};})(),f3=(()=>{const z=sub(add(y,f2.v[2]),q);return {v:[y,f2.v[2],z]};})();
  for(const f of [f1,f2,f3])tri(V,f,'#e7a8c8','#8a4a6a');
  txt(30,1200,'purple: a hexagon closed on a Z back (6 triangles, ends by closure); pink: a fin on an R back ended by a stop triangle',{size:13});}
txt(900,935,'Rules (all local):',{size:15,weight:'bold'});
['a triangle reads its roles from its own bonds (face or back = which side its free edge is on);',
 'a free triangle docks on a free face;',
 'a fill triangle binds only next to a docked triangle (or a fill bonded to one), so fills',
 '  never run past two and no gap is left unfillable;',
 'a copy triangle bonded on both sides lets go of its face (the copy peels off);',
 'growth only on hidden backs, only on released strands, never fusing structures;',
 'a letter\'s hidden side decides WHICH part grows (Z back vs R back): heritable form.'].forEach((s,i)=>txt(900,960+i*21,s,{size:13}));

fs.writeFileSync(out.replace(/\.png$/,'.svg'),`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${parts.join('\n')}</svg>`);
const chrome=fs.readdirSync('/opt/pw-browsers').filter(d=>d.startsWith('chromium')).map(d=>`/opt/pw-browsers/${d}/chrome-linux/chrome`).find(fs.existsSync);
execFileSync(chrome,['--headless','--no-sandbox','--disable-gpu','--hide-scrollbars',`--screenshot=${path.resolve(out)}`,`--window-size=${W},${H+90}`,'file://'+path.resolve(out.replace(/\.png$/,'.svg'))],{stdio:'ignore'});
console.log(out,'checks:',['RRR','RTR','RZR','RRTRRZRR'].map(s=>{const r=check(s);return s+'->'+r.cseq;}).join(' '));
module.exports={band,copyOf,check,rolesOf,LET,COMP};
