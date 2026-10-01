'use strict';
// Designed structures on the triangle lattice (prepared starting conditions, labelled as such in every demo) and
// type kits. Coordinates: lattice with unit sides, H = sqrt(3)/2; triangles given counter-clockwise, side i runs
// v[i] -> v[i+1]; a type string names the glue and marks of sides 0, 1, 2 (sim.js parseType).
const {gcode,gname,comp}=require('./sim');
const H=Math.sqrt(3)/2;
const same=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1])<1e-6,cen=v=>[(v[0][0]+v[1][0]+v[2][0])/3,(v[0][1]+v[1][1]+v[2][1])/3];
const has=(v,...ps)=>ps.every(p=>v.some(x=>same(x,p))),add=(p,d)=>[p[0]+d[0],p[1]+d[1]];
const edge=(v,x,y,g)=>{const i=[0,1,2].find(k=>same(v[k],x)&&same(v[(k+1)%3],y));return [0,1,2].map(k=>k===i?g:'-').join('');};
function lattice(R){const out=[];for(let i=-2*R-6;i<=2*R+6;i++)for(let j=-2*R-6;j<=2*R+6;j++){const b=[i+j/2,j*H];
  out.push([b,[b[0]+1,b[1]],[b[0]+0.5,b[1]+H]],[[b[0]+1,b[1]],[b[0]+1.5,b[1]+H],[b[0]+0.5,b[1]+H]]);}return out;}
const hexr=p=>Math.max(...[0,1,2,3,4,5].map(k=>{const a=Math.PI/6+k*Math.PI/3;return (p[0]*Math.cos(a)+p[1]*Math.sin(a))/H;}));

// Casting pocket (hatch design). The pocket is a side-2 triangle (0,0),(2,0),(1,2H); the target ends in its centre.
// Two casters are fixed in the frame; the third is a hatch hinged at (1.5,H) that waits open, catches a target in the
// upper slot (trigger = catch side) and swings it into the centre; the fixed casters' recognition sides are close-only,
// so only the hatch catches. Casters: recognition, activator K, instruction (counter-clockwise). The product takes the
// instructions [p, q, r] of (fixed caster 0, fixed caster 1, hatch). fuel: a glue letter puts a fuel side on the hatch's
// hinge partner (energy). An inert instruction side is not welded to the frame (that would overwrite it).
function pocket(instr='bcd',recog='A',fuel=null){
  const [p,q,r]=[...instr],R=recog,P=gname(comp(gcode(p))),Q=gname(comp(gcode(q)));
  return [
    {v:[[0,0],[1,0],[0.5,H]],type:`${p}${R}.K`,loose:p==='-'},          // caster 0: instruction p (bottom), recognition (inner), K
    {v:[[1,0],[2,0],[1.5,H]],type:`K${q}${R}.`,loose:q==='-'},          // caster 1: K, instruction q (right-lower), recognition
    {v:[[1.5,H],[2,2*H],[1,2*H]],type:`K<${r}${R}*`},                   // hatch (open): hinge K (pin (1.5,H)), instruction r, catch/trigger
    {v:[[1.5,H],[2.5,H],[2,2*H]],type:fuel?`-${fuel}$k`:'--k'},          // hinge partner (k); with fuel, its outer side holds a carrier
    {v:[[2,0],[2.5,H],[1.5,H]],type:`--${Q}`},                           // holds caster 1's instruction side
    {v:[[1,0],[1.5,-H],[2,0]],type:'--k'},                               // k under caster 1
    {v:[[0,0],[0.5,-H],[1,0]],type:`--${P}`},                            // holds caster 0's instruction side
    {v:[[0,0],[0.5,H],[-0.5,H]],type:'k--'},                             // k beside caster 0
    {v:[[1,0],[0.5,-H],[1.5,-H]],type:'---'},
    {v:[[0,0],[-0.5,H],[-1,0]],type:'---'},{v:[[0,0],[-1,0],[-0.5,-H]],type:'---'},{v:[[0,0],[-0.5,-H],[0.5,-H]],type:'---'},
    {v:[[2,0],[1.5,-H],[2.5,-H]],type:'---'},{v:[[2,0],[2.5,-H],[3,0]],type:'---'},{v:[[2,0],[3,0],[2.5,H]],type:'---'},
  ];}

// Lid pocket (bulge-free casting pocket). The target slot T = (0,0),(1,0),(0.5,H) is a V notch between two fixed
// casters, B below and R on the right, open to the upper left, so a free target slides in. B and R catch (their
// recognition sides are not close-only); R's recognition side is also a trigger. R's trigger signal is heard by Q
// (hear side '+' facing R) and by the lid (hear side on its hinge, facing Q): the lid, hinged to Q at (0.5,H) and
// waiting open 120 degrees away (wide hinge '='), closes onto T. It turns about a corner of T, so its leading edge
// arrives flush and nothing bulges into the target; its recognition side is close-only and bonds the caught target.
// After the cast the trigger lets go, the signal fades and the lid reopens. Product: [p, q, r] = instructions of
// (B, R, lid) on T's sides 0, 1, 2. q must not be inert (R's instruction bond carries the signal to Q).
// fuel: a glue letter puts a fuel side on Q's outer side (each closing spends a charged carrier).
function lidPocket(instr='bcd',recog='A',fuel=null){
  const [p,q,r]=[...instr],R=recog,P=gname(comp(gcode(p))),Q=gname(comp(gcode(q)));if(q==='-')throw Error('lid pocket: R needs an instruction glue');
  return [
    {v:[[0,0],[0.5,-H],[1,0]],type:`K${p}${R}`,loose:p==='-'},          // B: K, instruction p, recognition (catches)
    {v:[[1,0],[1.5,H],[0.5,H]],type:`K${q}${R}*`},                       // R: K, instruction q, recognition + trigger
    {v:[[0.5,H],[1,2*H],[0,2*H]],type:`K<=+${r}${R}.`},                  // lid (open): hinge K (pin (0.5,H), wide, hears Q), instruction r, recognition (close-only)
    {v:[[0.5,H],[1.5,H],[1,2*H]],type:`${Q}+${fuel?fuel+'$':'-'}k`},     // Q: holds R's instruction and hears R; outer side (fuel); lid's hinge partner
    {v:[[0,0],[-0.5,-H],[0.5,-H]],type:'--k'},                           // Z: k for B
    {v:[[0.5,-H],[1.5,-H],[1,0]],type:`--${P}`},                         // W: holds B's instruction
    {v:[[1,0],[2,0],[1.5,H]],type:'--k'},                                // S: k for R
    {v:[[1,0],[1.5,-H],[2,0]],type:'---'},{v:[[2,0],[2.5,H],[1.5,H]],type:'---'},{v:[[2,0],[1.5,-H],[2.5,-H]],type:'---'},
    {v:[[-0.5,-H],[0,-2*H],[0.5,-H]],type:'---'},{v:[[0,-2*H],[1,-2*H],[0.5,-H]],type:'---'},{v:[[0.5,-H],[1,-2*H],[1.5,-H]],type:'---'},
    {v:[[1,-2*H],[2,-2*H],[1.5,-H]],type:'---'},
    ...(fuel?[]:[{v:[[1.5,H],[2,2*H],[1,2*H]],type:'---'},{v:[[1.5,H],[2.5,H],[2,2*H]],type:'---'}]),   // behind Q (a kit reaches Q this way)
  ];}

// Conveyor: hatch 1 (hand-off ^) catches a block (glue a) and swings it to hatch 2's catch side; once the block is
// bonded twice hatch 1 lets go; hatch 2 (drop !) swings on and drops it. The frame cell beside hatch 2's third side
// stays empty: a triangle turning about a corner bulges 13% past the edge it swings toward.
function conveyor(){return [
  {v:[[0,0],[0.5,H],[-0.5,H]],type:'h<^-A*',loose:true},
  {v:[[-0.5,-H],[0.5,-H],[0,0]],type:'h<!-A*',loose:true},
  {v:[[0,0],[1,0],[0.5,H]],type:'--H'},{v:[[-0.5,-H],[0,-2*H],[0.5,-H]],type:'--H'},
  {v:[[1,0],[1.5,H],[0.5,H]],type:'---'},{v:[[1,0],[2,0],[1.5,H]],type:'---'},{v:[[1,0],[1.5,-H],[2,0]],type:'---'},
  {v:[[0.5,-H],[1.5,-H],[1,0]],type:'---'},{v:[[0.5,-H],[1,-2*H],[1.5,-H]],type:'---'},{v:[[0.5,-H],[0,-2*H],[1,-2*H]],type:'---'},
];}

// Closed ring membrane (cells between hexagons of side R-rows and R) with a gate on the bottom side: a two-triangle
// panel (outer cell U + inner cell D, welded w/W), D hinged to the next outer cell at the panel's bottom corner, U
// latched (L~) into the wall on its left. A key (ggg) on U's outer face (trigger G*) unlatches it; the panel swings
// out (use hingeAngle 120 degrees) carrying the key. With rows=2 the inner-row cells behind the door are left out.
function ring(R=4,rows=1){
  let cells=lattice(R).filter(v=>{const r=hexr(cen(v));return r<R&&r>R-rows;});
  const onY=(v,y)=>v.filter(p=>Math.abs(p[1]-y)<1e-6).length;
  const D=cells.filter(v=>onY(v,-(R-1)*H)===2&&cen(v)[1]<-(R-1)*H).sort((a,b)=>Math.abs(cen(a)[0])-Math.abs(cen(b)[0]))[0];
  const pin=D.find(p=>Math.abs(p[1]+R*H)<1e-6),[q,r]=D.filter(p=>!same(p,pin)).sort((a,b)=>b[0]-a[0]);
  const U=cells.find(v=>onY(v,-R*H)===2&&has(v,pin,r)),Ur=cells.find(v=>onY(v,-R*H)===2&&has(v,pin,q));
  const a=U.find(p=>!same(p,pin)&&!same(p,r)),Dl=cells.find(v=>v!==U&&has(v,a,r));
  if(rows>1){const X=cells.find(v=>v!==D&&has(v,q,r)),top=X.find(p=>!same(p,q)&&!same(p,r)),Yr=cells.find(v=>v!==X&&has(v,q,top));cells=cells.filter(v=>v!==X&&v!==Yr);}
  const tris=[{v:[pin,q,r],type:'h<-w',loose:true},{v:[a,pin,r],type:'G*WL~',loose:true}];
  for(const v of cells){if(v===D||v===U)continue;tris.push({v,type:v===Ur?edge(v,q,pin,'H'):v===Dl?edge(v,a,r,'l'):'---'});}
  return {tris,R};}

// Airlock (user: a double lock): one-row ring; below its bottom side a lock section (two more rows in a window) with
// an inner door (ring-row panel U1+D1, hinged at its top corner, swings inward, trigger G on the chamber side), a
// two-cell chamber, and an outer door (panel U2+D2, hinged at its bottom corner, swings outward, trigger G outside).
// Both are pulse doors (#): a key opens the door, is let go at once, the door swings 120 degrees and back and re-latches.
// Interlock: a door that is not latched emits the lock signal; a closed door ignores its key while it hears it.
function airlock(R=4,win=2.5){
  const lat=lattice(R),ring=lat.filter(v=>{const r=hexr(cen(v));return r<R&&r>R-1;});
  const lock=lat.filter(v=>{const c=cen(v),r=hexr(c);return r>R&&r<R+2&&c[1]<-R*H&&Math.abs(c[0])<win;});
  const D1=ring.filter(v=>v.filter(p=>Math.abs(p[1]+(R-1)*H)<1e-6).length===2&&cen(v)[1]<-(R-1)*H).sort((a,b)=>Math.abs(cen(a)[0])-Math.abs(cen(b)[0]))[0];
  const p1=D1.find(p=>Math.abs(p[1]+R*H)<1e-6),[q1,r1]=D1.filter(p=>!same(p,p1)).sort((a,b)=>b[0]-a[0]),a1=add(p1,[-1,0]);
  const U1=ring.find(v=>has(v,a1,p1,r1)),Dl1=ring.find(v=>v!==U1&&has(v,a1,r1)),Ur1=ring.find(v=>v!==D1&&has(v,p1,q1));
  const m=add(p1,[-0.5,-H]),c1=lock.find(v=>has(v,a1,p1,m)),c2=lock.find(v=>has(v,m,p1,add(m,[1,0])));
  const p2=add(m,[0.5,-H]),q2=add(m,[1,0]),a2=add(p2,[-1,0]);
  const D2=lock.find(v=>has(v,m,q2,p2)),U2=lock.find(v=>has(v,a2,p2,m)),Dl2=lock.find(v=>v!==U2&&has(v,a2,m)),Ur2=lock.find(v=>v!==D2&&has(v,p2,q2));
  if(![D1,U1,Dl1,Ur1,c1,c2,D2,U2,Dl2,Ur2].every(Boolean))throw Error('airlock geometry');
  const tris=[
    {v:[a1,p1,r1],type:'G*#Wh<#',loose:true},   // U1 (inner door, hinged): trigger to the chamber, weld, hinge to the wall
    {v:[p1,q1,r1],type:'L~-w',loose:true},      // D1: latch to the wall, inside face, weld
    {v:[a2,p2,m],type:'G*#WL~',loose:true},     // U2 (outer door): outer trigger, weld, latch to the lock wall
    {v:[p2,q2,m],type:'h<#-w',loose:true},      // D2 (outer door, hinged): hinge, chamber face, weld
  ];
  for(const v of [...ring,...lock]){if([U1,D1,U2,D2,c1,c2].includes(v))continue;
    tris.push({v,type:v===Dl1?edge(v,a1,r1,'H'):v===Ur1?edge(v,q1,p1,'l'):v===Dl2?edge(v,a2,m,'l'):v===Ur2?edge(v,q2,p2,'H'):'---'});}
  return {tris,R};}

// Kit (heritable parts): turn a prepared structure into types that grow it from one root cell. Cells are joined by a
// spanning tree from the root (breadth first); every tree edge gets its own glue pair, the parent exposing the lower
// case letter and the child attaching by the upper case one, so each kit type attaches at one place only. Tree edges
// are the plain (inert, welded) shared edges and the casters' activator edges (K/k), which become a unique pair with
// the activator mark '%' on the caster's side. Every other shared edge closes once both cells are attached: plain
// ones by the close-only pair f/F, functional ones (instruction holders, other glue pairs) keep their glue and become
// close-only on both sides, so free triangles (products, dockers) never stick to a growing part. Each kit cell's
// attachment side carries '@': a free part binds only by it (a free caster never sticks to a caught target). Loose
// cells are not welded. Returns {tris, types (per cell), kit (types except the root's), tree: [[parent, child]]}.
// reserved: letters the kit must not use (both cases; also every letter already in the structure).
function kit(tris,root=0,reserved='',seed=null){
  if(root==='auto'){let best=null;for(let r=0;r<tris.length;r++){if(tris[r].loose)continue;try{const k=kit(tris,r,reserved,seed);if(seed&&k.rootSide<0)continue;
      if(!best||k.depth<best.depth)best=k;}catch(e){}}if(!best)throw Error('kit: no root');return best;}
  const tok=tris.map(t=>[...t.type.matchAll(/([a-zA-Z-])([<>.!^#*~$+=%]*)/g)].map(m=>({g:m[1],m:m[2]})));
  const E=[];for(let a=0;a<tris.length;a++)for(let b=a+1;b<tris.length;b++)for(let i=0;i<3;i++)for(let j=0;j<3;j++){const A=tris[a].v,B=tris[b].v;
    if(same(A[i],B[(j+1)%3])&&same(A[(i+1)%3],B[j]))E.push({a,i,b,j});}
  const plain=e=>tok[e.a][e.i].g==='-'&&tok[e.b][e.j].g==='-',loose=e=>tris[e.a].loose||tris[e.b].loose;
  const isK=(x,i)=>tok[x][i].g==='K',actE=e=>(isK(e.a,e.i)&&tok[e.b][e.j].g==='k')||(isK(e.b,e.j)&&tok[e.a][e.i].g==='k');
  const used=new Set([...reserved.toLowerCase(),...(seed?seed.toLowerCase():''),'f','k',...tris.flatMap(t=>[...t.type.replace(/[^a-zA-Z]/g,'').toLowerCase()])]);
  const pool=[...'abcdeghijlmnopqrstuvwxyz'].filter(c=>!used.has(c));
  const seen=new Set([root]),tree=[],treeE=new Set(),q=[root];
  while(q.length){const x=q.shift();for(const e of E){if(treeE.has(e))continue;const y=e.a===x?e.b:e.b===x?e.a:-1;if(y<0||seen.has(y))continue;
    if(!((plain(e)&&!loose(e))||actE(e)))continue;seen.add(y);q.push(y);treeE.add(e);tree.push([x,y,e]);}}
  if(seen.size!==tris.length)throw Error('kit: cells not reachable by plain or activator edges: '+tris.map((_,k)=>k).filter(k=>!seen.has(k)).join(' '));
  if(tree.length>pool.length)throw Error(`kit: needs ${tree.length} glue pairs, ${pool.length} letters free`);
  const addMark=(t,c)=>{if(!t.m.includes(c))t.m+=c;};
  tree.forEach(([x,y,e],k)=>{const L=pool[k],[px,pi,cy,ci]=e.a===x?[e.a,e.i,e.b,e.j]:[e.b,e.j,e.a,e.i];
    for(const [c,i,g] of [[px,pi,L],[cy,ci,L.toUpperCase()]]){const t=tok[c][i];if(t.g==='K')addMark(t,'%');t.g=g;if(c===cy)addMark(t,'@');}});
  for(const e of E){if(treeE.has(e)||loose(e))continue;const A=tok[e.a][e.i],B=tok[e.b][e.j];
    if(plain(e)){A.g='f';B.g='F';}else if(A.g==='-'||B.g==='-')continue;addMark(A,'.');addMark(B,'.');}
  // seed: the root's first outer inert side takes the seed glue's complement (it attaches to an exposed seed)
  let rootSide=-1;if(seed)for(let i=0;i<3&&rootSide<0;i++)if(tok[root][i].g==='-'&&!E.some(e=>(e.a===root&&e.i===i)||(e.b===root&&e.j===i))){rootSide=i;tok[root][i].g=gname(comp(gcode(seed)));addMark(tok[root][i],'@');}
  const depth=new Map([[root,0]]);for(const [x,y] of tree)depth.set(y,depth.get(x)+1);
  const types=tok.map(t=>t.map(x=>x.g+x.m).join(''));
  return {tris:tris.map((t,k)=>({...t,type:types[k]})),types,kit:types.filter((_,k)=>k!==root),tree:tree.map(([x,y])=>[x,y]),root,rootSide,depth:Math.max(...depth.values())};}

// Arm kit: the types of an arm grown from seed glue `seed` by a bend pattern ('1'/'2' per step: the side, counted
// counter-clockwise from the attach side, that exposes the next glue), using the given letters; the last type exposes
// nothing, so the arm ends without counting.
function armTypes(seed,pattern,letters){const E=[seed,...letters.slice(0,pattern.length)],out=[];
  for(let k=0;k<=pattern.length;k++){const t=['-','-','-'];t[0]=gname(comp(gcode(E[k])));if(k<pattern.length)t[+pattern[k]]=E[k+1];out.push(t.join(''));}
  return out;}
const mirror=p=>[...p].map(c=>c==='1'?'2':'1').join('');
module.exports={pocket,lidPocket,kit,conveyor,ring,airlock,armTypes,mirror,lattice,hexr,H};
