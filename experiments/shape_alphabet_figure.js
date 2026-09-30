'use strict';
// Design figure for the base-shape alphabet (ROADMAP 10). Pure geometry, no simulation.
// One 4-cornered block family: face F and laterals R, L always have unit length (always attachable);
// the laterals tilt by theta and the back K becomes 1-2 sin(theta).
//   S theta=0    -> square    (back 1; chain goes straight)
//   T theta=+30  -> triangle  (back 0; chain turns 60 degrees, face on the convex side)
//   Z = three welded triangles (a trapezoid, back 2; turns 60 degrees the other way, face on the concave side)
// Base shapes are only the square and the triangle (user, 2026-09-30). Copying pairs faces, and a bent double strand
// must be one rigid piece: S pairs with S (a 1x2 domino), T pairs with Z (together a side-2 triangle). The Z is not a
// separate shape: a triangle docks on the T face and two more fill the notches beside it (the bend is a mould).
// Usage: node experiments/shape_alphabet_figure.js [OUT.png]
const fs=require('fs'),path=require('path'),{execFileSync}=require('child_process');
const out=process.argv[2]||'experiments/out/SHAPES_alphabet_20260930.png';
const D=Math.PI/180,TILT={S:0,T:30*D,Z:-30*D},COMP={S:'S',T:'Z',Z:'T'};
const COL={S:'#9fd8cf',T:'#f6cf8a',Z:'#f6cf8a'},DOT={S:'#1d8f80',T:'#c07a00',Z:'#c07a00'},FACE='#e0672b',LAT='#2b6fb3',BACK='#777';

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
function copyOf(C,comp=COMP){  // one partner per template face; the partner's face lies on the template's face, reversed
  return C.map(b=>{const c=comp[b.ch],k=block(TILT[c]),a=ang(b.fR,b.fL)-ang(k.fL,k.fR),o=b.fR;
    const T=p=>{const r=rot([p[0]-k.fL[0],p[1]-k.fL[1]],a);return [r[0]+o[0],r[1]+o[1]];};
    return {fL:T(k.fL),fR:T(k.fR),bR:T(k.bR),bL:T(k.bL),ch:c};});}
const gapOf=(K,i)=>Math.hypot(K[i].bL[0]-K[i+1].bR[0],K[i].bL[1]-K[i+1].bR[1]);  // copy i and i+1 must share a whole lateral
// ---- regular unit polygons joined edge to edge (for composite parts) ----
function reg(n,a,b){const v=[a,b];let d=[b[0]-a[0],b[1]-a[1]];
  for(let k=2;k<n;k++){d=rot(d,2*Math.PI/n);const p=v[v.length-1];v.push([p[0]+d[0],p[1]+d[1]]);}return v;}
function attach(poly,dir,n){  // attach a unit n-gon on the edge whose outward normal is closest to dir
  let best=-1,bi=0;for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],l=Math.hypot(b[0]-a[0],b[1]-a[1]);
    const d=((b[1]-a[1])*dir[0]-(b[0]-a[0])*dir[1])/l;if(d>best){best=d;bi=i;}}
  return reg(n,poly[(bi+1)%poly.length],poly[bi]);}
const U=[0,1],R=[1,0],DN=[0,-1],deg=a=>[Math.cos(a*D),Math.sin(a*D)];

// ---- SVG helpers ----
const W=1500,H=1070,parts=[];
const txt=(x,y,s,o={})=>parts.push(`<text x="${x}" y="${y}" font-family="Helvetica,Arial,sans-serif" font-size="${o.size||16}" fill="${o.fill||'#222'}" text-anchor="${o.anchor||'start'}" font-weight="${o.weight||'normal'}">${s}</text>`);
function view(ox,oy,sc){return p=>[ox+p[0]*sc,oy-p[1]*sc];}
function poly(V,pts,fill){parts.push(`<polygon points="${pts.map(p=>V(p).map(z=>z.toFixed(1)).join(',')).join(' ')}" fill="${fill}" stroke="#333" stroke-width="1.2" stroke-linejoin="round"/>`);}
function seg(V,a,b,col,w){const A=V(a),B=V(b);parts.push(`<line x1="${A[0].toFixed(1)}" y1="${A[1].toFixed(1)}" x2="${B[0].toFixed(1)}" y2="${B[1].toFixed(1)}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>`);}
const mid=(a,b)=>[(a[0]+b[0])/2,(a[1]+b[1])/2],cen=(...q)=>[q.reduce((z,p)=>z+p[0],0)/q.length,q.reduce((z,p)=>z+p[1],0)/q.length];
const isZ=b=>Math.hypot(b.bR[0]-b.bL[0],b.bR[1]-b.bL[1])>1.5;
function subTris(b){const m=mid(b.bL,b.bR);return [[b.fL,b.bL,m],[b.fL,m,b.fR],[b.fR,m,b.bR]];}
function dotsOf(b){if(isZ(b))return subTris(b).map(t=>cen(...t));return [cen(b.fL,b.fR,b.bR,b.bL)];}
function drawBlock(V,b,fill,edges=true){
  if(isZ(b))for(const t of subTris(b))poly(V,t,fill);else poly(V,[b.fL,b.fR,b.bR,b.bL],fill);
  if(edges){seg(V,b.fL,b.fR,FACE,4);seg(V,b.fR,b.bR,LAT,2.5);seg(V,b.bL,b.fL,LAT,2.5);
    if(Math.hypot(b.bR[0]-b.bL[0],b.bR[1]-b.bL[1])>1e-6)seg(V,b.bR,b.bL,BACK,2.5);}}
function bbox(pts){let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const p of pts){x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);y0=Math.min(y0,p[1]);y1=Math.max(y1,p[1]);}return {x0,y0,x1,y1};}
function drawChainAt(cx,cy,sc,seq,opt={}){  // centre a chain drawing on (cx,cy)
  const C=chain(seq,opt.square),bb=bbox(C.flatMap(b=>[b.fL,b.fR,b.bR,b.bL]));
  const V=view(cx-(bb.x0+bb.x1)/2*sc,cy+(bb.y0+bb.y1)/2*sc,sc);
  for(const b of C)drawBlock(V,b,COL[b.ch],opt.edges!==false);
  if(opt.dots)for(const b of C)for(const q of dotsOf(b)){const m=V(q);
    parts.push(`<circle cx="${m[0].toFixed(1)}" cy="${m[1].toFixed(1)}" r="4" fill="${DOT[b.ch]}"/>`);}
  return bb;
}
function drawPolys(cx,cy,sc,list){const bb=bbox(list.flatMap(p=>p.pts));
  const V=view(cx-(bb.x0+bb.x1)/2*sc,cy+(bb.y0+bb.y1)/2*sc,sc);
  for(const p of list)poly(V,p.pts,p.fill);}

parts.push(`<rect width="${W}" height="${H}" fill="#fbfaf7"/>`);
txt(30,42,'Base shapes: two shapes (square, triangle), one edge length',{size:26,weight:'bold'});
txt(30,68,'Every working edge (face F, laterals R and L) is exactly one unit long, so any edge can bond to any edge. Larger forms come from combinations and sequences.',{size:15,fill:'#555'});

// ---- Panel A: two base shapes ----
txt(30,112,'A. Two base shapes, one edge length',{size:19,weight:'bold'});
const sc=85;
{let V=view(90,165,sc);drawBlock(V,block(0),COL.S);
  txt(90,157,'F',{anchor:'middle',fill:FACE,weight:'bold'});txt(90+sc*.5+8,165+sc*.55,'R',{fill:LAT,weight:'bold'});
  txt(90-sc*.5-20,165+sc*.55,'L',{fill:LAT,weight:'bold'});txt(90,165+sc+14,'K',{anchor:'middle',fill:BACK,weight:'bold',size:13});
  txt(90,165+sc+32,'square',{anchor:'middle',weight:'bold'});txt(90,165+sc+50,'straight',{anchor:'middle',size:13,fill:'#555'});
  V=view(265,165,sc);drawBlock(V,block(TILT.T),COL.T);
  txt(265,165+sc+32,'triangle',{anchor:'middle',weight:'bold'});txt(265,165+sc+50,'bend T: turns 60°, face outside',{anchor:'middle',size:13,fill:'#555'});
  V=view(490,165,sc*.8);drawBlock(V,block(TILT.Z),COL.Z);
  txt(490,165+sc+32,'welded trapezoid (3 triangles)',{anchor:'middle',weight:'bold',size:15});txt(490,165+sc+50,'bend Z: turns 60° the other way, face inside',{anchor:'middle',size:13,fill:'#555'});}
const ax=30,ay=372;
[['F face (copy pairing) — unit',FACE],['R, L laterals (backbone) — unit',LAT],['K back (structure seed) — square only; Z has two unit sites',BACK]].forEach(([s,c],i)=>{
  parts.push(`<line x1="${ax}" y1="${ay+i*22-5}" x2="${ax+28}" y2="${ay+i*22-5}" stroke="${c}" stroke-width="4"/>`);txt(ax+38,ay+i*22,s,{size:14});});
txt(30,445,'Pairing complements: S↔S (a domino), T↔Z (a side-2 triangle).',{size:14,fill:'#333',weight:'bold'});
txt(30,464,'A Z is built in place from supplied triangles; square⇄triangle switching is optional (supply balancing).',{size:14,fill:'#333'});
txt(30,483,'All turns are 60° steps, so parts share a few directions and fit together.',{size:14,fill:'#333'});

// ---- Panel B: composite parts ----
txt(700,112,'B. Welded shapes: bonded combinations (and can be split)',{size:19,weight:'bold'});
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
txt(700,500,'The trapezoid is one of many welded shapes. Edge-to-edge bonds pinned at both corners are rigid;',{size:14,fill:'#333'});
txt(700,519,'one pinned corner would make a hinge.',{size:14,fill:'#333'});

// ---- Panel C: copying a bent chain ----
txt(30,560,'C. A bent chain is copied by complementary shapes, so the copy is bent too',{size:19,weight:'bold'});
txt(30,584,'Each copy unit docks face to face; neighbouring copy units must share whole laterals. Template dark outline, copy lighter; one dot per block.',{size:14,fill:'#333'});
function drawDouble(cx,cy,sc,seq,opt={}){
  const C=chain(seq);let K=copyOf(C,opt.comp);
  if(opt.split){const c=q=>q.reduce((a,b)=>[a[0]+(b.fL[0]+b.bR[0])/2/q.length,a[1]+(b.fL[1]+b.bR[1])/2/q.length],[0,0]);
    const a=c(C),b=c(K),l=Math.hypot(b[0]-a[0],b[1]-a[1]),d=[(b[0]-a[0])/l*opt.split,(b[1]-a[1])/l*opt.split],m=p=>[p[0]+d[0],p[1]+d[1]];
    K=K.map(k=>({fL:m(k.fL),fR:m(k.fR),bR:m(k.bR),bL:m(k.bL),ch:k.ch}));}
  const all=[...C,...K].flatMap(b=>[b.fL,b.fR,b.bR,b.bL]),bb=bbox(all);
  const V=view(cx-(bb.x0+bb.x1)/2*sc,cy+(bb.y0+bb.y1)/2*sc,sc);
  if(!opt.hideCopy)for(const b of K){if(isZ(b))for(const t of subTris(b))poly(V,t,COL[b.ch]+'aa');else poly(V,[b.fL,b.fR,b.bR,b.bL],COL[b.ch]+'aa');seg(V,b.fR,b.bR,LAT,1.5);seg(V,b.bL,b.fL,LAT,1.5);}
  for(const b of C)drawBlock(V,b,COL[b.ch]);
  for(const b of (opt.hideCopy?C:[...C,...K]))for(const q of dotsOf(b)){const m=V(q);
    parts.push(`<circle cx="${m[0].toFixed(1)}" cy="${m[1].toFixed(1)}" r="3.5" fill="${DOT[b.ch]}"/>`);}
  let worst=0;for(let i=0;i+1<K.length;i++){const g=gapOf(K,i);worst=Math.max(worst,g);
    if(g>1e-6&&!opt.hideCopy&&!opt.split){const A=V(K[i].bL),B=V(K[i+1].bR);
      parts.push(`<line x1="${A[0]}" y1="${A[1]}" x2="${B[0]}" y2="${B[1]}" stroke="#d0021b" stroke-width="3"/>`);
      parts.push(`<circle cx="${(A[0]+B[0])/2}" cy="${(A[1]+B[1])/2}" r="14" fill="none" stroke="#d0021b" stroke-width="2.5"/>`);}}
  return worst;
}
const checks=[];
checks.push(['square copy at a T',drawDouble(150,690,34,'SSTSS',{comp:{S:'S',T:'S',Z:'S'}})]);
txt(150,790,'✗ squares cannot follow a bend',{anchor:'middle',size:14,fill:'#d0021b'});
txt(150,808,'(the copy leaves a 60° gap)',{anchor:'middle',size:13,fill:'#777'});
checks.push(['SSTSS',drawDouble(420,690,34,'SSTSS')]);
txt(420,790,'✓ the bend is a mould: 1 triangle docks,',{anchor:'middle',size:14,fill:'#1a7f37'});
txt(420,808,'2 fill the notches → rigid side-2 triangle',{anchor:'middle',size:13,fill:'#777'});
drawDouble(650,690,30,'SSTSS',{split:1.2});
txt(640,808,'separated: both strands bent',{anchor:'middle',size:13,fill:'#777'});
checks.push(['S-curve',drawDouble(900,690,28,'SSSTSSSZSSS')]);
txt(900,790,'S-curve: T and Z in one strand',{anchor:'middle',size:14});
txt(900,808,'(copy: the same bends, complemented)',{anchor:'middle',size:13,fill:'#777'});
checks.push(['hairpin',drawDouble(1150,690,28,'SSSTTTSSS')]);
txt(1150,790,'hairpin SSS TTT SSS in a',{anchor:'middle',size:14});
txt(1150,808,'U of 9 triangles; slides off',{anchor:'middle',size:13,fill:'#777'});
checks.push(['ring',drawDouble(1370,690,26,'TTTTTT')]);
txt(1370,790,'closed ring TTTTTT',{anchor:'middle',size:14});
txt(1370,808,'is enclosed by its copy',{anchor:'middle',size:13,fill:'#777'});
// single strands
txt(30,860,'Released strands keep their shape (no folding rule needed):',{size:15,weight:'bold'});
[['SSSSSS','rod'],['TTTTTT','hexagon, faces out'],['ZZZZZZ','ring of 18 triangles'],['(ST)×6','12-ring','STSTSTSTSTST'],['SSTSSZSS','zigzag'],['SSSTTTSSS','hairpin']].forEach(([cap,d,seq],i)=>{
  const cx=110+i*205,cy=955;drawChainAt(cx,cy,i===3?22:26,seq||cap,{dots:true});txt(cx,1040,cap+' → '+d,{anchor:'middle',size:14});});
for(const [n,g] of checks)console.log('copy lateral gap',n,g.toFixed(3));

const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${parts.join('\n')}</svg>`;
const svgFile=out.replace(/\.png$/,'.svg');fs.mkdirSync(path.dirname(svgFile),{recursive:true});fs.writeFileSync(svgFile,svg);
const htmlFile=svgFile.replace(/\.svg$/,'.html');fs.writeFileSync(htmlFile,`<!doctype html><html><body style="margin:0;background:#fbfaf7">${svg}</body></html>`);
if(out.endsWith('.png')){
  const chrome=fs.readdirSync('/opt/pw-browsers').filter(d=>d.startsWith('chromium')).map(d=>`/opt/pw-browsers/${d}/chrome-linux/chrome`).find(fs.existsSync);
  execFileSync(chrome,['--headless','--no-sandbox','--disable-gpu','--hide-scrollbars',`--screenshot=${path.resolve(out)}`,`--window-size=${W},${H+90}`,'file://'+path.resolve(htmlFile)],{stdio:'ignore'});
  fs.unlinkSync(htmlFile);
}
console.log('wrote',svgFile,out.endsWith('.png')?out:'');
