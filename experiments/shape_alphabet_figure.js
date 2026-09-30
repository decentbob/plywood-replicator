'use strict';
// Design figure for the base-shape alphabet (ROADMAP 10). Pure geometry, no simulation.
// One 4-cornered block family: face F and laterals R, L always have unit length (always attachable);
// the laterals tilt inward by theta and the back K shrinks to 1-2 sin(theta).
//   theta=0   -> square   (chain goes straight)
//   (no wedge state: a welded trapezoid of three triangles covers it, and 60-degree steps fit together better)
//   theta=30  -> triangle (back collapses to a point; turns 60 degrees)
// Usage: node experiments/shape_alphabet_figure.js [OUT.png]
const fs=require('fs'),path=require('path'),{execFileSync}=require('child_process');
const out=process.argv[2]||'experiments/out/SHAPES_alphabet_20260930.png';
const D=Math.PI/180,TILT={S:0,W:15*D,T:30*D};
const COL={S:'#9fd8cf',W:'#c9b6e8',T:'#f6cf8a'},FACE='#e0672b',LAT='#2b6fb3',BACK='#777';

// ---- block and chain geometry (math coords, y up; faces point +y) ----
function block(th){const s=Math.sin(th),c=Math.cos(th);
  return {fL:[-.5,0],fR:[.5,0],bR:[.5-s,-c],bL:[-.5+s,-c]};}
const rot=(p,a)=>[p[0]*Math.cos(a)-p[1]*Math.sin(a),p[0]*Math.sin(a)+p[1]*Math.cos(a)];
const ang=(a,b)=>Math.atan2(b[1]-a[1],b[0]-a[0]);
function chain(seq,forceSquare=false){  // lateral R of block i shares its whole edge with lateral L of block i+1
  const out=[];let prev=null;
  for(const ch of seq){const b=block(forceSquare?0:TILT[ch]);let T;
    if(!prev)T=p=>p;
    else{const a=ang(prev.fR,prev.bR)-ang(b.fL,b.bL),o=prev.fR;T=p=>{const r=rot([p[0]-b.fL[0],p[1]-b.fL[1]],a);return [r[0]+o[0],r[1]+o[1]];};}
    const w={fL:T(b.fL),fR:T(b.fR),bR:T(b.bR),bL:T(b.bL),ch};out.push(w);prev=w;}
  return out;
}
// ---- regular unit polygons joined edge to edge (for composite parts) ----
function reg(n,a,b){const v=[a,b];let d=[b[0]-a[0],b[1]-a[1]];
  for(let k=2;k<n;k++){d=rot(d,2*Math.PI/n);const p=v[v.length-1];v.push([p[0]+d[0],p[1]+d[1]]);}return v;}
function attach(poly,dir,n){  // attach a unit n-gon on the edge whose outward normal is closest to dir
  let best=-1,bi=0;for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],l=Math.hypot(b[0]-a[0],b[1]-a[1]);
    const d=((b[1]-a[1])*dir[0]-(b[0]-a[0])*dir[1])/l;if(d>best){best=d;bi=i;}}
  return reg(n,poly[(bi+1)%poly.length],poly[bi]);}
const U=[0,1],R=[1,0],DN=[0,-1],deg=a=>[Math.cos(a*D),Math.sin(a*D)];

// ---- SVG helpers ----
const W=1500,H=1060,parts=[];
const txt=(x,y,s,o={})=>parts.push(`<text x="${x}" y="${y}" font-family="Helvetica,Arial,sans-serif" font-size="${o.size||16}" fill="${o.fill||'#222'}" text-anchor="${o.anchor||'start'}" font-weight="${o.weight||'normal'}">${s}</text>`);
function view(ox,oy,sc){return p=>[ox+p[0]*sc,oy-p[1]*sc];}
function poly(V,pts,fill){parts.push(`<polygon points="${pts.map(p=>V(p).map(z=>z.toFixed(1)).join(',')).join(' ')}" fill="${fill}" stroke="#333" stroke-width="1.2" stroke-linejoin="round"/>`);}
function seg(V,a,b,col,w){const A=V(a),B=V(b);parts.push(`<line x1="${A[0].toFixed(1)}" y1="${A[1].toFixed(1)}" x2="${B[0].toFixed(1)}" y2="${B[1].toFixed(1)}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>`);}
function drawBlock(V,b,fill,edges=true){poly(V,[b.fL,b.fR,b.bR,b.bL],fill);
  if(edges){seg(V,b.fL,b.fR,FACE,4);seg(V,b.fR,b.bR,LAT,2.5);seg(V,b.bL,b.fL,LAT,2.5);
    if(Math.hypot(b.bR[0]-b.bL[0],b.bR[1]-b.bL[1])>1e-6)seg(V,b.bR,b.bL,BACK,2.5);}}
function bbox(pts){let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const p of pts){x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);y0=Math.min(y0,p[1]);y1=Math.max(y1,p[1]);}return {x0,y0,x1,y1};}
function drawChainAt(cx,cy,sc,seq,opt={}){  // centre a chain drawing on (cx,cy)
  const C=chain(seq,opt.square),bb=bbox(C.flatMap(b=>[b.fL,b.fR,b.bR,b.bL]));
  const V=view(cx-(bb.x0+bb.x1)/2*sc,cy+(bb.y0+bb.y1)/2*sc,sc);
  for(const b of C)drawBlock(V,b,COL[b.ch],opt.edges!==false);
  if(opt.dots)for(const b of C){const m=V([(b.fL[0]+b.fR[0]+b.bR[0]+b.bL[0])/4,(b.fL[1]+b.fR[1]+b.bR[1]+b.bL[1])/4]);
    parts.push(`<circle cx="${m[0].toFixed(1)}" cy="${m[1].toFixed(1)}" r="4" fill="${b.ch==='T'?'#c07a00':'#1d8f80'}"/>`);}
  return bb;
}
function drawPolys(cx,cy,sc,list){const bb=bbox(list.flatMap(p=>p.pts));
  const V=view(cx-(bb.x0+bb.x1)/2*sc,cy+(bb.y0+bb.y1)/2*sc,sc);
  for(const p of list)poly(V,p.pts,p.fill);}

parts.push(`<rect width="${W}" height="${H}" fill="#fbfaf7"/>`);
txt(30,42,'Base shapes: one block, one edge length, two rest states',{size:26,weight:'bold'});
txt(30,68,'Every working edge (face F, laterals R and L) is exactly one unit long, so any edge can bond to any edge. Larger forms come from combinations and sequences.',{size:15,fill:'#555'});

// ---- Panel A: the family ----
txt(30,112,'A. The block family (a state, not a type)',{size:19,weight:'bold'});
const sc=95;
[['S','square','tilt 0°, back 1','turn 0° (straight)'],['T','triangle','tilt 30°, back 0','turn 60°']].forEach(([k,name,geo,turn],i)=>{
  const cx=110+i*220,cy=170,V=view(cx,cy,sc);drawBlock(V,block(TILT[k]),COL[k]);
  txt(cx,cy+sc+30,name,{anchor:'middle',weight:'bold'});txt(cx,cy+sc+50,geo,{anchor:'middle',size:13,fill:'#555'});
  txt(cx,cy+sc+68,turn,{anchor:'middle',size:13,fill:'#555'});
  if(i===0){txt(cx,cy-8,'F',{anchor:'middle',fill:FACE,weight:'bold'});txt(cx+sc*.5+12,cy+sc*.55,'R',{fill:LAT,weight:'bold'});
    txt(cx-sc*.5-24,cy+sc*.55,'L',{fill:LAT,weight:'bold'});txt(cx,cy+sc+14,'K',{anchor:'middle',fill:BACK,weight:'bold',size:13});
    txt(cx+110,cy+sc*.5,'⇄',{anchor:'middle',size:30,fill:'#999'});}
});
{const t0=reg(3,[0,0],[1,0]),t1=attach(t0,deg(30),3),t2=attach(t1,deg(-30),3);
  drawPolys(565,205,40,[{pts:t0,fill:COL.T},{pts:t1,fill:COL.T},{pts:t2,fill:COL.T}]);
  txt(565,268,'no wedge state:',{anchor:'middle',size:13,fill:'#555',weight:'bold'});
  txt(565,286,'a welded trapezoid',{anchor:'middle',size:13,fill:'#555'});
  txt(565,304,'covers it, and 60° steps',{anchor:'middle',size:13,fill:'#555'});
  txt(565,322,'make parts fit together',{anchor:'middle',size:13,fill:'#555'});}
const ax=30,ay=385;
[['F face (copy pairing) — always 1',FACE],['R, L laterals (backbone) — always 1',LAT],['K back (structure seed) — shrinks, gone in the triangle',BACK]].forEach(([s,c],i)=>{
  parts.push(`<line x1="${ax}" y1="${ay+i*22-5}" x2="${ax+28}" y2="${ay+i*22-5}" stroke="${c}" stroke-width="4"/>`);txt(ax+38,ay+i*22,s,{size:14});});
txt(30,462,'The switch is a local state (like the core fold rule, or the programmable kind):',{size:14,fill:'#333'});
txt(30,481,'the laterals tilt and the back shrinks; F, R and L never change length. Chains turn only in 60° steps.',{size:14,fill:'#333'});

// ---- Panel B: composite parts ----
txt(700,112,'B. Bigger parts are bonded combinations (and can be split)',{size:19,weight:'bold'});
const s0=reg(4,[0,0],[1,0]),s1=attach(s0,R,4),s2=attach(s1,R,4);
const t0=reg(3,[0,0],[1,0]),t1=attach(t0,deg(30),3),t2=attach(t1,deg(-30),3);
const hex=[];for(let k=0;k<6;k++)hex.push({pts:[[0,0],deg(k*60),deg(k*60+60)],fill:COL.T});
const h0=reg(4,[0,0],[1,0]),h1=attach(h0,U,3);
const L0=reg(4,[0,0],[1,0]),L1=attach(L0,R,4),L2=attach(L0,U,4);
const saw=[s0,s1,s2].flatMap(s=>[{pts:s,fill:COL.S},{pts:attach(s,U,3),fill:COL.T}]);
const oct=[];{let prev=reg(4,[0,0],[1,0]);oct.push({pts:prev,fill:COL.S});}  // square + triangle strip: a bent plate
const pl0=reg(4,[0,0],[1,0]),pl1=attach(pl0,R,3),pl2=attach(pl1,deg(30),4);
const gallery=[
  ['rod 2',[{pts:s0,fill:COL.S},{pts:s1,fill:COL.S}]],
  ['rod 3',[{pts:s0,fill:COL.S},{pts:s1,fill:COL.S},{pts:s2,fill:COL.S}]],
  ['corner',[{pts:L0,fill:COL.S},{pts:L1,fill:COL.S},{pts:L2,fill:COL.S}]],
  ['house',[{pts:h0,fill:COL.S},{pts:h1,fill:COL.T}]],
  ['rhombus',[{pts:t0,fill:COL.T},{pts:t1,fill:COL.T}]],
  ['trapezoid',[{pts:t0,fill:COL.T},{pts:t1,fill:COL.T},{pts:t2,fill:COL.T}]],
  ['hexagon hub',hex],
  ['kinked plate',[{pts:pl0,fill:COL.S},{pts:pl1,fill:COL.T},{pts:pl2,fill:COL.S}]],
  ['saw / comb',saw],
];
gallery.forEach(([name,list],i)=>{const col=i%5,row=(i/5)|0,cx=760+col*150,cy=190+row*165;
  drawPolys(cx,cy,42,list);txt(cx,cy+78,name,{anchor:'middle',size:14});});
txt(700,500,'Edge-to-edge bonds pinned at both corners are rigid; one corner would make a hinge.',{size:14,fill:'#333'});

// ---- Panel C: sequence -> shape ----
txt(30,560,'C. Sequence → shape: a chain folds into the shape its letters encode',{size:19,weight:'bold'});
txt(30,584,'While a letter is face-paired (being copied) it rests as a square, so copying stays straight and shape-agnostic.',{size:14,fill:'#333'});
txt(30,603,'Once free, each letter takes its encoded rest shape (dot: teal = square, amber = triangle) and the released strand folds.',{size:14,fill:'#333'});
// copying pair: template (faces down) paired with its copy (faces up), all square
{const seq='SSSTTTSSS',sq=38,C=chain(seq,true),V1=view(80,690,sq),V2=view(80,690+0*sq,sq);
  for(const b of C)drawBlock(V1,b,COL[b.ch]);
  const flip=p=>[p[0],-p[1]];
  for(const b of C)drawBlock(V1,{fL:flip(b.fR),fR:flip(b.fL),bR:flip(b.bL),bL:flip(b.bR)},'#e8e8e8');
  for(const b of C){const m=V1([(b.fL[0]+b.bR[0])/2,(b.fL[1]+b.bR[1])/2]);parts.push(`<circle cx="${m[0].toFixed(1)}" cy="${m[1].toFixed(1)}" r="4" fill="${b.ch==='T'?'#c07a00':'#1d8f80'}"/>`);}
  txt(80+4.5*sq-sq/2,690-sq-10,'copy (paired face to face): squares',{anchor:'middle',size:13,fill:'#555'});
  txt(80+4.5*sq-sq/2,690+sq+24,'template SSSTTTSSS, paired: squares',{anchor:'middle',size:13,fill:'#555'});
  txt(80+9*sq+20,700,'→',{size:34,fill:'#999'});
  txt(80+9*sq+14,730,'release',{size:12,fill:'#777'});}
drawChainAt(625,700,34,'SSSTTTSSS',{dots:true});txt(625,790,'SSS TTT SSS → hairpin (back to back)',{anchor:'middle',size:14});
const examples=[['SSSSSS','SSSSSS → straight rod'],['TTTTTT','TTTTTT → hexagon'],['STSTSTSTSTST','(ST)×6 → 12-ring (a cell)'],['SSTSSTSSTSSTSSTSST','(SST)×6 → big ring'],['SSSSTSSSS','one T → 60° bend'],['SSTTSSSS','TT → 120° hook']];
examples.forEach(([seq,cap],i)=>{const cx=[885,1100,1330,160,420,680][i],cy=i<3?700:935,sc2=i===3?24:34;
  drawChainAt(cx,cy,sc2,seq,{dots:true});txt(cx,i<3?790:1035,cap,{anchor:'middle',size:14});});
txt(1000,880,'Faces (orange) always end up on the convex side: a folded chain',{size:14,fill:'#333'});
txt(1000,900,'keeps its copying faces exposed to the outside, like the half-cell.',{size:14,fill:'#333'});
txt(1000,930,'Same sequence → same shape, so shape is inherited;',{size:14,fill:'#333'});
txt(1000,950,'a copying error in the shape letter changes the fold.',{size:14,fill:'#333'});

const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${parts.join('\n')}</svg>`;
const svgFile=out.replace(/\.png$/,'.svg');fs.mkdirSync(path.dirname(svgFile),{recursive:true});fs.writeFileSync(svgFile,svg);
const htmlFile=svgFile.replace(/\.svg$/,'.html');fs.writeFileSync(htmlFile,`<!doctype html><html><body style="margin:0;background:#fbfaf7">${svg}</body></html>`);
if(out.endsWith('.png')){
  const chrome=fs.readdirSync('/opt/pw-browsers').filter(d=>d.startsWith('chromium')).map(d=>`/opt/pw-browsers/${d}/chrome-linux/chrome`).find(fs.existsSync);
  execFileSync(chrome,['--headless','--no-sandbox','--disable-gpu','--hide-scrollbars',`--screenshot=${path.resolve(out)}`,`--window-size=${W},${H+90}`,'file://'+path.resolve(htmlFile)],{stdio:'ignore'});
  fs.unlinkSync(htmlFile);
}
console.log('wrote',svgFile,out.endsWith('.png')?out:'');
