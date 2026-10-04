'use strict';
// Designed structures on the triangle lattice (prepared starting conditions, labelled as such in every demo): the ring
// kit and the closure kind's bud kit (the casting lineage's pockets, machines and kits were removed on 2026-10-03; git
// `7415fd4`). Coordinates: lattice with unit sides, H = sqrt(3)/2; triangles given counter-clockwise, side i runs
// v[i] -> v[i+1]; a type string names the glue and marks of sides 0, 1, 2 (sim.js parseType).
const {gcode,gname,comp,LOW,UP}=require('./sim');
const H=Math.sqrt(3)/2;
const same=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1])<1e-6,cen=v=>[(v[0][0]+v[1][0]+v[2][0])/3,(v[0][1]+v[1][1]+v[2][1])/3];
function lattice(R){const out=[];for(let i=-2*R-6;i<=2*R+6;i++)for(let j=-2*R-6;j<=2*R+6;j++){const b=[i+j/2,j*H];
  out.push([b,[b[0]+1,b[1]],[b[0]+0.5,b[1]+H]],[[b[0]+1,b[1]],[b[0]+1.5,b[1]+H],[b[0]+0.5,b[1]+H]]);}return out;}
const hexr=p=>Math.max(...[0,1,2,3,4,5].map(k=>{const a=Math.PI/6+k*Math.PI/3;return (p[0]*Math.cos(a)+p[1]*Math.sin(a))/H;}));

// Ring kit (periodic): a one-row hexagonal ring of side R has 6(2R-1) cells, six repeats of a (2R-1)-cell motif (the
// lattice is symmetric under 60-degree turns, so a turned cell takes the same type). Motif type k attaches by G_k@ to
// the glue g_k its predecessor exposes and exposes g_(k+1) to its successor; motif letters cycle, so growth runs around
// the ring without counting. The root (cell 0) attaches to a seed by its outer side and closes the ring: its side
// toward the last cell carries G_0 without '@' (a closure once the last cell is attached). Inner and outer sides are
// inert. bud: the root's seed side releases on completion ('&'), so a closed ring lets go of its seed. twoWay (two
// fronts) grows faster but the fronts may meet at an inward-facing cell that only the closed-off inside can fill. Returns {tris (ring in growth order, root first, with types), kit (motif types), root, rootSide, letters}.
function ringKit(R=3,seed='z',letters=null,bud=false,twoWay=false,seedIn=false){
  const cells=lattice(R).filter(v=>{const r=hexr(cen(v));return r<R&&r>R-1;}),ang=v=>{const c=cen(v);return Math.atan2(c[1],c[0]);};
  // order around the ring, starting just past angle -30 degrees (a side's first cell)
  const start=-Math.PI/6+1e-6,key=v=>((ang(v)-start)%(2*Math.PI)+2*Math.PI)%(2*Math.PI);cells.sort((a,b)=>key(a)-key(b));
  const N=cells.length,P=N/6;if(P!==2*R-1)throw Error('ring kit: unexpected cell count '+N);
  // the root's free side must face outward (an anchor inside would enclose the last site): start one cell later if not
  const shared0=(a,b)=>{for(let i=0;i<3;i++)for(let j=0;j<3;j++)if(same(a[i],b[(j+1)%3])&&same(a[(i+1)%3],b[j]))return i;return -1;};
  const freeOut=k=>{const v=cells[k],a=shared0(v,cells[(k+N-1)%N]),b=shared0(v,cells[(k+1)%N]),f=3-a-b,m=[(v[f][0]+v[(f+1)%3][0])/2,(v[f][1]+v[(f+1)%3][1])/2];
    return hexr(m)>R-0.5;};
  // start where two outward-facing cells meet: the root and the last site both face outward (the last site fills from
  // outside, not from the closed-off inside)
  // seedIn (the ring grows around what carries the seed): the root faces inward and the last two sites both face
  // outward (a corner pair), so the closing sites fill from outside
  {let k0=0;for(let k=0;k<N;k++){const ok=seedIn?!freeOut(k)&&freeOut((k+N-1)%N)&&freeOut((k+N-2)%N):freeOut(k)&&freeOut((k+N-1)%N);if(ok){k0=k;break;}}
    const rot=cells.splice(0,k0);cells.push(...rot);}
  const shared=(a,b)=>{for(let i=0;i<3;i++)for(let j=0;j<3;j++)if(same(a[i],b[(j+1)%3])&&same(a[(i+1)%3],b[j]))return i;return -1;};
  const L=letters||[...LOW].filter(c=>!'fkxyz'.includes(c)&&c!==seed).slice(0,P);
  const types=cells.map((v,k)=>{const t=['-','-','-'],prev=shared(v,cells[(k+N-1)%N]),next=shared(v,cells[(k+1)%N]);if(prev<0||next<0)throw Error('ring kit: cells not adjacent');
    t[prev]=UP[LOW.indexOf(L[k%P])]+'@';t[next]=L[(k+1)%P]+'@';return t;});   // the exposed growth side takes parts only ('@'); twoWay: either side attaches
  // root: closure side without '@', seed on its outer side (the side farther from the centre)
  const root=types[0],v0=cells[0],prev0=shared(v0,cells[N-1]),next0=shared(v0,cells[1]);
  if(twoWay){root[prev0]=root[prev0].replace('@','');}   // the root exposes both fronts
  else root[prev0]=root[prev0].replace('@','.');
  let rootSide=-1,far=-1;for(let i=0;i<3;i++){if(root[i]!=='-')continue;const m=[(v0[i][0]+v0[(i+1)%3][0])/2,(v0[i][1]+v0[(i+1)%3][1])/2],d=Math.hypot(m[0],m[1])*(seedIn?-1:1);if(rootSide<0||d>far){far=d;rootSide=i;}}
  root[rootSide]=gname(comp(gcode(seed)))+'@'+(bud?'&':'');
  // bud: the seed side releases on completion ('&'): once no growth front is open, the ring lets go of its seed
  const names=types.map(t=>t.join(''));
  return {tris:cells.map((v,k)=>({v,type:names[k]})),kit:names.slice(P,2*P),root:0,rootSide,letters:L.join(''),N,P};}

// Bud kit for closure (designed in autorun run 20261003-1121, docs/IDEAS.md "Closure by design"): one organism kind
// whose bud is the same kind. A one-row ring of side R (odd) with a pore of 3 or 7 cells (in, out, ..., in) in the
// middle of its top wall (with 7 its edges are the wall's corner cells for R = 5), grown from its root in one direction
// (counter-clockwise) round to its last cell E: every cell has its own type
// (a grown periodic ring cannot stop beside a gap: growth cannot count repeats, so every cell up to the pore's far edge
// must be unique; 6(2R-1)-pore-1 bond letters, 46 for R = 5 and pore 7). A 3-cell pore passes no strand between two such
// cells (run 20261003-1121: 0 of 8 worlds), a 7-cell pore does. The root is the pore's left edge: its outer side 'Y@&' attaches
// to a seed y and lets go once the cell hears no open signal (completion); its pore side is the catching anchor 'W@|'
// (it emits the open signal until it holds a strand's low end w, so the bud holds on to its parent until then, and later
// holds the cell's founder). E is the pore's right edge: its outer side is the seed site 'y' (plain glue: it emits no
// open signal, it is never spent), where the next bud's root attaches. Every other free side is '&' (spent once complete:
// never copied). A bud's root attached to a parent's E puts the bud at the parent rotated 180 degrees about the middle of
// the parent's pore (budPose): its pore faces the parent's pore (an aligned doorway) and its E lies on the parent's root.
// letters: bond glues (default: the lower-case letters minus the genome's a w z, the seed y and the weld f).
// eSource: E's pore side is plain '-' instead of '&' (never spent, so copied by any copy blank that reaches it): copies
// of E then form in the pore, which in a sealed pair is where the bud's last site opens (run 20261003-1650).
// anchor={at:k,glue:'Z'}: the catching anchor on arc cell k's inner side instead of the root's pore side (the root's pore
// side is then '-&'); glue 'Z' catches a strand's high end (only a strand held by its high end is copied). On the root a
// strand held by its high end stands out of the cell into the doorway (run 20261003-1921, dry-run); the open range must
// then reach the root from cell k (openRange > k), so the root holds while the waiting anchor emits.
// seedAt=m (autorun run 20261004-0621, explore): the seed site 'y' on arc cell m's outer side instead of E's (E's outer
// side is then a wall side); the bud then grows off the parent's wall at m instead of across its pore. pose(p): where a
// point of the parent lies in its bud, unpose its inverse (the motion that puts the bud's root seed side on the parent's seed site).
function budKit(R=5,pore=7,letters=null,eSource=false,anchor={},wall='-&',seedAt=-1){if(R%2!==1||(pore!==3&&pore!==7))throw Error('budKit: R odd, pore 3 or 7');const e=(pore+1)/4;
  const cells=lattice(R).filter(v=>{const r=hexr(cen(v));return r<R&&r>R-1;}),top=v=>cen(v)[1]>(R-1)*H,near=(v,x)=>top(v)&&Math.abs(cen(v)[0]-x)<0.1;
  const root=cells.find(v=>near(v,-e)),gap=cells.filter(v=>top(v)&&Math.abs(cen(v)[0])<e-0.1),ang=v=>{const c=cen(v);return Math.atan2(c[1],c[0]);};
  if(!root||gap.length!==pore)throw Error('budKit: no pore');const a0=ang(root),key=v=>((ang(v)-a0)%(2*Math.PI)+2*Math.PI)%(2*Math.PI);
  const arc=cells.filter(v=>!gap.includes(v)).sort((a,b)=>key(a)-key(b)),N=arc.length;if(!near(arc[N-1],e))throw Error('budKit: the arc does not end at the pore');
  const shared=(a,b)=>{for(let i=0;i<3;i++)for(let j=0;j<3;j++)if(same(a[i],b[(j+1)%3])&&same(a[(i+1)%3],b[j]))return i;return -1;};
  const L=letters||[...LOW].filter(c=>!'awzyf'.includes(c)).slice(0,N-1);if(L.length<N-1)throw Error(`budKit: needs ${N-1} letters`);
  const outer=(v,i)=>hexr([(v[i][0]+v[(i+1)%3][0])/2,(v[i][1]+v[(i+1)%3][1])/2]);
  const AK=anchor.at||0,AG=(anchor.glue||'W')+'@|';let rootSide=-1,anchorSide=-1,seedSide=-1,eSide=-1;
  const types=arc.map((v,k)=>{const t=[wall,wall,wall],prev=k>0?shared(v,arc[k-1]):-1,next=k<N-1?shared(v,arc[k+1]):-1;
    if((k>0&&prev<0)||(k<N-1&&next<0))throw Error('budKit: cells not adjacent');
    if(prev>=0)t[prev]=UP[LOW.indexOf(L[k-1])]+'@';if(next>=0)t[next]=L[k]+'@';
    if(k===0||k===N-1){const free=[0,1,2].filter(i=>i!==prev&&i!==next).sort((i,j)=>outer(v,j)-outer(v,i));   // outer side first
      if(k===0){rootSide=free[0];t[free[0]]='Y@&';if(AK===0){anchorSide=free[1];t[free[1]]=AG;}}else{eSide=free[1];if(seedAt<0||seedAt===N-1){seedSide=free[0];t[free[0]]='y';}if(eSource)t[free[1]]='-';}}
    else if(k===seedAt){const f=[0,1,2].find(i=>i!==prev&&i!==next);if(outer(v,f)<R-0.5)throw Error('budKit: seed cell '+k+' has no outer side');seedSide=f;t[f]='y';}
    else if(k===AK){const f=[0,1,2].find(i=>i!==prev&&i!==next);if(outer(v,f)>R-0.5)throw Error('budKit: anchor cell '+k+' has no inner side');anchorSide=f;t[f]=AG;}
    return t.join('');});
  if(AK<0||AK>=N-1)throw Error('budKit: anchor cell out of range');const SC=seedAt<0?N-1:seedAt;if(SC===0||SC===AK)throw Error('budKit: seed cell on the root or the anchor');
  // the bud's pose: the rigid motion taking the root's seed side (a -> b) onto the seed site (b' -> a': bonded sides run opposite)
  const rv=arc[0],sv=arc[SC],a=rv[rootSide],b=rv[(rootSide+1)%3],A=sv[(seedSide+1)%3],B=sv[seedSide];
  const th=Math.atan2(B[1]-A[1],B[0]-A[0])-Math.atan2(b[1]-a[1],b[0]-a[0]),c=Math.cos(th),sn=Math.sin(th);
  const pose=p=>{const x=p[0]-a[0],y=p[1]-a[1];return [A[0]+c*x-sn*y,A[1]+sn*x+c*y];},unpose=p=>{const x=p[0]-A[0],y=p[1]-A[1];return [a[0]+c*x+sn*y,a[1]-sn*x+c*y];};
  return {tris:arc.map((v,k)=>({v,type:types[k]})),types,root:0,last:N-1,seedCell:SC,rootSide,anchorSide,anchorCell:AK,seedSide,eSide,pose,unpose,letters:L.join(''),N,R,pore};}
// a bud's pose on its parent (budKit): the parent's cells rotated 180 degrees about the middle of its pore's outer edge
const budPose=(R,p)=>[-p[0],2*R*H-p[1]];

module.exports={budKit,budPose,ringKit,lattice,hexr,H};
