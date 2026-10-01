'use strict';
// Designed structures on the triangle lattice (prepared starting conditions, labelled as such in every demo) and
// type kits. Coordinates: lattice with unit sides, H = sqrt(3)/2; triangles given counter-clockwise, side i runs
// v[i] -> v[i+1]; a type string names the glue and marks of sides 0, 1, 2 (sim.js parseType).
const {gcode,gname,comp,LOW,UP}=require('./sim');
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
function lidPocket(instr='bcd',recog='A',fuel=null,catcher='BR'){
  const [p,q,r]=[...instr],R=recog,P=gname(comp(gcode(p))),Q=gname(comp(gcode(q)));if(q==='-')throw Error('lid pocket: R needs an instruction glue');
  return [
    {v:[[0,0],[0.5,-H],[1,0]],type:`K${p}.${R}${catcher.includes('B')?'':'.'}`,loose:p==='-'},   // B: K, instruction p (close-only, as all instruction sides), recognition (catches if in `catcher`)
    {v:[[1,0],[1.5,H],[0.5,H]],type:`K${q}.${R}${catcher.includes('R')?'':'.'}*`},                       // R: K, instruction q, recognition + trigger
    {v:[[0.5,H],[1,2*H],[0,2*H]],type:`K<=+${r}.${R}.`},                  // lid (open): hinge K (pin (0.5,H), wide, hears Q), instruction r, recognition (close-only)
    {v:[[0.5,H],[1.5,H],[1,2*H]],type:`${Q}+${fuel?fuel+'$':'-'}k`},     // Q: holds R's instruction and hears R; outer side (fuel); lid's hinge partner
    {v:[[0,0],[-0.5,-H],[0.5,-H]],type:'--k'},                           // Z: k for B
    {v:[[0.5,-H],[1.5,-H],[1,0]],type:`--${P}`},                         // W: holds B's instruction
    {v:[[1,0],[2,0],[1.5,H]],type:'--k'},                                // S: k for R
    {v:[[1,0],[1.5,-H],[2,0]],type:'---'},{v:[[2,0],[2.5,H],[1.5,H]],type:'---'},{v:[[2,0],[1.5,-H],[2.5,-H]],type:'---'},
    {v:[[-0.5,-H],[0,-2*H],[0.5,-H]],type:'---'},{v:[[0,-2*H],[1,-2*H],[0.5,-H]],type:'---'},{v:[[0.5,-H],[1,-2*H],[1.5,-H]],type:'---'},
    {v:[[1,-2*H],[2,-2*H],[1.5,-H]],type:'---'},
    ...(fuel?[]:[{v:[[1.5,H],[2,2*H],[1,2*H]],type:'---'},{v:[[1.5,H],[2.5,H],[2,2*H]],type:'---'}]),   // behind Q (a kit reaches Q this way)
  ];}
// cells a lid pocket needs empty: the slot, the lid's sweep (Lc, V) and the cell its corner bulges into (X)
// the lid pocket's slot (T) and which cells catch into it (for kit safety checks)
const lidSlot=(catcher='BR')=>({v:[[0,0],[1,0],[0.5,H]],catchers:[...catcher].map(c=>c==='B'?0:1)});
const lidClear=()=>[[[0,0],[1,0],[0.5,H]],[[0,0],[0.5,H],[-0.5,H]],[[0.5,H],[0,2*H],[-0.5,H]],[[0,0],[-0.5,H],[-1,0]]];

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

// Gated ring membrane (rigid parts): a one-row ring of side R with a door panel of `k` consecutive wall cells, welded
// together (unique weld glues), hinged to the wall at one end (pin on the outer boundary) and latched (L~) to the wall
// at the other; a key (ggg) on an outward face of the panel (trigger G*) unlatches it and the panel swings 120 degrees
// out (use hingeAngle 120 degrees or a wide hinge). The door is chosen so its whole swing is clear of the wall (a rigid
// panel cannot squeeze past its neighbours): checked here by sweeping it. pulse: '#' marks (pulse door, key let go).
function ring(R=4,rows=1,k=3,pulse=false){
  if(rows!==1)throw Error('ring: one row only on rigid physics');
  const cells=ringKit(R,'z').tris.map(t=>t.v),N=cells.length,shr=(a,b)=>a.filter(p=>b.some(q=>same(p,q)));
  const rot=(p,c,t)=>[c[0]+Math.cos(t)*(p[0]-c[0])-Math.sin(t)*(p[1]-c[1]),c[1]+Math.sin(t)*(p[0]-c[0])+Math.cos(t)*(p[1]-c[1])];
  const {triDepth}=require('./physics'),flat=V=>Float64Array.from(V.flat()),out=v=>hexr(cen(v))>R-0.5;
  // bottom side first: start cells ordered by height
  const order=[...Array(N).keys()].sort((a,b)=>cen(cells[a])[1]-cen(cells[b])[1]);let door=null;
  for(const st of order){const panel=[...Array(k).keys()].map(q=>(st+q)%N),prev=(st+N-1)%N,next=(st+k)%N;
    for(const P of shr(cells[st],cells[prev])){if(hexr(P)<R-0.01)continue;
      for(const dir of [1,-1]){let ok=true;
        for(let a=1;a<=120&&ok;a++){const t=dir*a*Math.PI/180;for(const c of panel){const V=flat(cells[c].map(p=>rot(p,P,t)));
          for(let w=0;w<N&&ok;w++)if(!panel.includes(w)&&triDepth(V,flat(cells[w]))>1e-6)ok=false;if(!ok)break;}}
        const moved=cen(cells[st].map(p=>rot(p,P,dir*0.3)));if(ok&&Math.hypot(...moved)>Math.hypot(...cen(cells[st])))door={panel,prev,next,P};if(door)break;}if(door)break;}if(door)break;}
  if(!door)throw Error('ring: no clear door');
  const side=(a,b)=>{for(let i=0;i<3;i++)for(let j=0;j<3;j++)if(same(cells[a][i],cells[b][(j+1)%3])&&same(cells[a][(i+1)%3],cells[b][j]))return [i,j];return null;};
  const T=cells.map(()=>['-','-','-']),loose=new Set(door.panel),W='wvu';
  // hinge: first panel cell to the previous wall cell
  {const [i,j]=side(door.panel[0],door.prev),v=cells[door.panel[0]];T[door.panel[0]][i]='h'+(same(v[i],door.P)?'<':'>')+(pulse?'#':'');T[door.prev][j]='H';}
  // welds inside the panel, latch at the far end
  for(let q=0;q+1<door.panel.length;q++){const [i,j]=side(door.panel[q],door.panel[q+1]);T[door.panel[q]][i]=W[q]+'+';T[door.panel[q+1]][j]=W[q].toUpperCase()+'+';}   // weld sides hear: the key's signal reaches the hinge
  {const last=door.panel[door.panel.length-1],[i,j]=side(last,door.next);T[last][i]='L~';T[door.next][j]='l';}
  // key trigger on the panel cell nearest the latch with an outward free side (a latch hears triggers one bond away)
  for(const c of [...door.panel].reverse()){const f=[0,1,2].find(i=>T[c][i]==='-'&&!cells.some((w,x)=>x!==c&&side(c,x)&&side(c,x)[0]===i));
    if(f===undefined)continue;const m=[(cells[c][f][0]+cells[c][(f+1)%3][0])/2,(cells[c][f][1]+cells[c][(f+1)%3][1])/2];if(hexr(m)>R-0.5){T[c][f]='G*'+(pulse?'#':'');break;}}
  const tris=cells.map((v,x)=>({v,type:T[x].join(''),loose:loose.has(x)}));
  return {tris,R,door};}

// sweep test: do the cells `moving` (vertex lists), turned about P by up to `ang` degrees in direction dir, stay clear of
// the cells `fixed`? (rigid parts cannot squeeze: every machine's sweep must be clear)
function sweepClear(moving,fixed,P,dir,ang){const {triDepth}=require('./physics'),flat=V=>Float64Array.from(V.flat());
  const rot=(p,t)=>[P[0]+Math.cos(t)*(p[0]-P[0])-Math.sin(t)*(p[1]-P[1]),P[1]+Math.sin(t)*(p[0]-P[0])+Math.cos(t)*(p[1]-P[1])];
  for(let a=1;a<=ang;a++){const t=dir*a*Math.PI/180;for(const V0 of moving){const V=flat(V0.map(p=>rot(p,t)));for(const W of fixed)if(triDepth(V,flat(W))>1e-6)return false;}}
  return true;}
// Import ring (a selective importer, revolving door): a one-row ring whose door panel (k cells, welded with hear sides)
// is hinged at an inner corner, latched at its far end, and catches a key (glue `key`, e.g. X for blanks xxx) on an outer
// face. The caught key triggers the panel: it unlatches and swings 120 degrees inward (wide hinge) carrying the key, drops
// it inside at the end of the swing (drop '!'), swings back and re-latches. Only triangles with the key's complement are
// carried in. The door is chosen by sweeping panel and key (rigid parts): returns {tris, R, door}.
function importRing(R=4,key='X',k=4){
  const cells=ringKit(R,'z').tris.map(t=>t.v),N=cells.length,shr=(a,b)=>a.filter(p=>b.some(q=>same(p,q)));
  const side=(a,b)=>{for(let i=0;i<3;i++)for(let j=0;j<3;j++)if(same(cells[a][i],cells[b][(j+1)%3])&&same(cells[a][(i+1)%3],cells[b][j]))return [i,j];return null;};
  const rot=(p,c,t)=>[c[0]+Math.cos(t)*(p[0]-c[0])-Math.sin(t)*(p[1]-c[1]),c[1]+Math.sin(t)*(p[0]-c[0])+Math.cos(t)*(p[1]-c[1])];
  const order=[...Array(N).keys()].sort((a,b)=>cen(cells[a])[1]-cen(cells[b])[1]);let door=null;
  for(const st of order){const panel=[...Array(k).keys()].map(q=>(st+q)%N),prev=(st+N-1)%N,next=(st+k)%N,fixed=cells.filter((_,x)=>!panel.includes(x));
    for(const P of shr(cells[st],cells[prev]))for(const kc of panel){const f=[0,1,2].find(i=>!cells.some((w,x)=>x!==kc&&side(kc,x)&&side(kc,x)[0]===i));
      const v=cells[kc],m=[(v[f][0]+v[(f+1)%3][0])/2,(v[f][1]+v[(f+1)%3][1])/2];if(hexr(m)<R-0.5)continue;
      const kv=[v[(f+1)%3],v[f],[v[f][0]+v[(f+1)%3][0]-v[(f+2)%3][0],v[f][1]+v[(f+1)%3][1]-v[(f+2)%3][1]]];
      for(const dir of [1,-1]){if(!sweepClear([...panel.map(c=>cells[c]),kv],fixed,P,dir,120))continue;
        const kEnd=cen(kv.map(p=>rot(p,P,dir*2*Math.PI/3)));if(Math.hypot(...kEnd)<(R-1)*H-0.3){door={panel,prev,next,P,keyCell:kc,keySide:f,dir,keyV:kv};break;}}
      if(door)break;}if(door)break;}
  if(!door)throw Error('importRing: no clear import door');
  const T=cells.map(()=>['-','-','-']),W='wvu';
  {const [i,j]=side(door.panel[0],door.prev),v=cells[door.panel[0]];T[door.panel[0]][i]='h'+(same(v[i],door.P)?'<':'>')+'!=';T[door.prev][j]='H';}
  for(let q=0;q+1<door.panel.length;q++){const [i,j]=side(door.panel[q],door.panel[q+1]);T[door.panel[q]][i]=W[q]+'+';T[door.panel[q+1]][j]=W[q].toUpperCase()+'+';}
  {const last=door.panel[door.panel.length-1],[i,j]=side(last,door.next);T[last][i]='L~';T[door.next][j]='l';}
  T[door.keyCell][door.keySide]=key+'*';
  return {tris:cells.map((v,x)=>({v,type:T[x].join(''),loose:door.panel.includes(x)})),R,door};}

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
function kit(tris,root=0,reserved='',seed=null,side=null,slots=[]){
  if(root==='auto'){let best=null;for(let r=0;r<tris.length;r++){if(tris[r].loose)continue;try{const k=kit(tris,r,reserved,seed,null,slots);if(seed&&k.rootSide<0)continue;
      if(!best||k.risk<best.risk||(k.risk===best.risk&&k.depth<best.depth))best=k;}catch(e){}}if(!best)throw Error('kit: no root');return best;}
  const tok=tris.map(t=>[...t.type.matchAll(/([a-zA-Zα-ωΑ-Ωа-яА-Я-])([<>.!^#*~$+=%@]*)/g)].map(m=>({g:m[1],m:m[2]})));
  const E=[];for(let a=0;a<tris.length;a++)for(let b=a+1;b<tris.length;b++)for(let i=0;i<3;i++)for(let j=0;j<3;j++){const A=tris[a].v,B=tris[b].v;
    if(same(A[i],B[(j+1)%3])&&same(A[(i+1)%3],B[j]))E.push({a,i,b,j});}
  const plain=e=>tok[e.a][e.i].g==='-'&&tok[e.b][e.j].g==='-',loose=e=>tris[e.a].loose||tris[e.b].loose;
  const isK=(x,i)=>tok[x][i].g==='K',actE=e=>(isK(e.a,e.i)&&tok[e.b][e.j].g==='k')||(isK(e.b,e.j)&&tok[e.a][e.i].g==='k');
  const low=c=>{const i=UP.indexOf(c);return i>=0?LOW[i]:c;},used=new Set([...reserved,...(seed||''),'f','k',...tris.flatMap(t=>[...t.type])].map(low));
  const pool=[...LOW].filter(c=>!used.has(c));
  const seen=new Set([root]),tree=[],treeE=new Set(),q=[root];
  while(q.length){const x=q.shift();for(const e of E){if(treeE.has(e))continue;const y=e.a===x?e.b:e.b===x?e.a:-1;if(y<0||seen.has(y))continue;
    if(!((plain(e)&&!loose(e))||actE(e)))continue;seen.add(y);q.push(y);treeE.add(e);tree.push([x,y,e]);}}
  if(seen.size!==tris.length)throw Error('kit: cells not reachable by plain or activator edges: '+tris.map((_,k)=>k).filter(k=>!seen.has(k)).join(' '));
  if(tree.length>pool.length)throw Error(`kit: needs ${tree.length} glue pairs, ${pool.length} letters free`);
  const addMark=(t,c)=>{if(!t.m.includes(c))t.m+=c;};
  tree.forEach(([x,y,e],k)=>{const L=pool[k],[px,pi,cy,ci]=e.a===x?[e.a,e.i,e.b,e.j]:[e.b,e.j,e.a,e.i];
    for(const [c,i,g] of [[px,pi,L],[cy,ci,UP[LOW.indexOf(L)]]]){const t=tok[c][i];if(t.g==='K')addMark(t,'%');t.g=g;addMark(t,'@');}});   // both ends '@': the parent's site takes parts only
  for(const e of E){if(treeE.has(e)||loose(e))continue;const A=tok[e.a][e.i],B=tok[e.b][e.j];
    if(plain(e)){A.g='f';B.g='F';}else if(A.g==='-'||B.g==='-')continue;addMark(A,'.');addMark(B,'.');}
  // seed: the root's first outer inert side takes the seed glue's complement (it attaches to an exposed seed)
  let rootSide=-1;if(seed)for(let i=0;i<3&&rootSide<0;i++)if((side===null||side===i)&&tok[root][i].g==='-'&&!E.some(e=>(e.a===root&&e.i===i)||(e.b===root&&e.j===i))){rootSide=i;tok[root][i].g=gname(comp(gcode(seed)));addMark(tok[root][i],'@');}
  const depth=new Map([[root,0]]);for(const [x,y] of tree)depth.set(y,depth.get(x)+1);
  // safety (enclosed holes): a cell is at risk if, when it arrives, every side may already face something: a cell no
  // deeper than it (not its descendant), or a slot (a filled slot blocks it, an empty one is a narrow deep channel). Such
  // a cell can only be reached through a filled or narrow space. risk = number of such cells (prefer kits with none).
  const kids=new Map();for(const [x,y] of tree){if(!kids.has(x))kids.set(x,[]);kids.get(x).push(y);}
  const desc=c=>{const out=new Set(),q=[c];while(q.length){for(const y of kids.get(q.pop())||[])if(!out.has(y)){out.add(y);q.push(y);}}return out;};
  const sh=(A,B)=>{for(let i=0;i<3;i++)for(let j=0;j<3;j++)if(same(A[i],B[(j+1)%3])&&same(A[(i+1)%3],B[j]))return i;return -1;};
  let risk=0;const risky=[];
  for(let c=0;c<tris.length;c++){if(c===root)continue;const D=desc(c),dc=depth.get(c);let early=0;
    for(let i=0;i<3;i++){let e=false;
      for(let o=0;o<tris.length&&!e;o++)if(o!==c&&sh(tris[c].v,tris[o].v)===i&&!D.has(o)&&depth.get(o)<=dc)e=true;
      for(const sl of slots)if(!e&&sh(tris[c].v,sl.v)===i)e=true;   // a slot is never an access route (a cell behind it is as hard to reach as a hole)
      if(e)early++;}
    if(early===3){risk++;risky.push(c);}}
  const types=tok.map(t=>t.map(x=>x.g+x.m).join(''));
  return {tris:tris.map((t,k)=>({...t,type:types[k]})),types,kit:types.filter((_,k)=>k!==root),tree:tree.map(([x,y])=>[x,y]),root,rootSide,depth:Math.max(...depth.values()),risk,risky,letters:tree.map((_,k)=>pool[k]).join('')};}

// every (root, seed side) kit of a structure, fewest risky cells first, then shallowest tree
function kitOptions(tris,reserved='',seed='z',slots=[]){const out=[];
  for(let r=0;r<tris.length;r++){if(tris[r].loose)continue;for(let i=0;i<3;i++){try{const k=kit(tris,r,reserved,seed,i,slots);if(k.rootSide===i)out.push(k);}catch(e){}}}
  return out.sort((a,b)=>a.risk-b.risk||a.depth-b.depth);}

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

// Door ring kit (a membrane that grows its own import door): a seedIn ring kit (root facing inward, holding the seed)
// that grows two fronts from its root. One front is the periodic motif, the long way round. The other is short and
// unique: one wall cell u, then a four-cell door panel attached to u by its latch side ('~'), welded by hear sides
// ('+'), whose last cell carries the key ('*', outside) and a close-only hinge side ('<' or '>', '!' drop, '=' wide).
// The motif front's last cell closes onto that hinge side, so the hinge exists only once the ring is closed. (The
// latch holds a trigger while its triangle hears an open signal, so a key bound early does not drop the panel.) A
// key that binds a blank then swings the panel 120 degrees inward, the hinge drops the blank inside, the panel swings
// back and re-latches. The door position is found by a search (the panel's sweep clear of the wall, the key's cargo
// ending inside). avoid: letters the kit must not use. m: unique wall cells between the root and the panel (their
// free sides can carry seeds for inner parts: `wall`). release false: the root keeps the chain (no '&'). Returns {tris (growth order: root, motif..., hinge cell,
// panel..., u), counts (type -> cells needed, root excluded), root, rootSide, letters, door}. order: which way round the
// short front may run ([false, true]: either, plain first). pore: no key; the second panel
// cell attaches by a trigger side, so the door swings open as soon as its hinge exists and stays open (a pore).
function doorRingKit(R=5,seed='z',key='X',k=4,avoid='',m=1,release=true,pore=false,order=[false,true],pre=0){
  const base0=ringKit(R,seed,null,true,false,true).tris.map(t=>t.v),N=base0.length,P=2*R-1;
  const shr=(a,b)=>a.filter(p=>b.some(q=>same(p,q))),rot=(p,c,t)=>[c[0]+Math.cos(t)*(p[0]-c[0])-Math.sin(t)*(p[1]-c[1]),c[1]+Math.sin(t)*(p[0]-c[0])+Math.cos(t)*(p[1]-c[1])];
  let door=null;
  for(const rev of order){const base=rev?[base0[0],...base0.slice(1).reverse()]:base0;
    for(let r0=0;r0<N&&!door;r0++){const cells=[...base.slice(r0),...base.slice(0,r0)];
      const side=(a,b)=>{for(let i=0;i<3;i++)for(let j=0;j<3;j++)if(same(cells[a][i],cells[b][(j+1)%3])&&same(cells[a][(i+1)%3],cells[b][j]))return i;return -1;};
      const freeS=c=>[0,1,2].find(i=>side(c,(c+1)%N)!==i&&side(c,(c+N-1)%N)!==i);
      const outw=c=>{const v=cells[c],f=freeS(c);return hexr([(v[f][0]+v[(f+1)%3][0])/2,(v[f][1]+v[(f+1)%3][1])/2])>R-0.5;};   // hex radius (Euclidean distance misjudges sides near corners)
      const hc=N-m-k,hp=hc-1;if(outw(0)||(!pore&&!outw(hc))||!outw(hp))continue;
      const panel=[...Array(k).keys()].map(q=>hc+q),fixed=cells.filter((_,x)=>!panel.includes(x)),f=freeS(hc),v=cells[hc];
      const kv=[v[(f+1)%3],v[f],[v[f][0]+v[(f+1)%3][0]-v[(f+2)%3][0],v[f][1]+v[(f+1)%3][1]-v[(f+2)%3][1]]];
      // the direction a hinge actually turns (sim.bind: away from its partner's centre about the pinned corner)
      const realDir=Pv=>{const c=cen(cells[hc]),q=cen(cells[hp]),f=[c[0]-Pv[0],c[1]-Pv[1]],d=[c[0]-q[0],c[1]-q[1]];return (d[0]*(-f[1])+d[1]*f[0])>0?1:-1;};
      for(const Pv of shr(cells[hc],cells[hp]))for(const dir of [1,-1]){if(door||dir!==realDir(Pv))continue;
        // a pore's panel swings out and stays out (the inside stays free); a door's key carries its cargo inside
        if(pore){if(sweepClear(panel.map(c=>cells[c]),fixed,Pv,dir,120)&&(()=>{const q=panel.flatMap(c=>cells[c]).map(p=>rot(p,Pv,dir*2*Math.PI/3));return hexr([q.reduce((a,p)=>a+p[0],0)/q.length,q.reduce((a,p)=>a+p[1],0)/q.length])>R;})())door={cells,side,freeS,outw,hc,hp,panel,P:Pv,dir,keySide:f};continue;}
        if(!sweepClear([...panel.map(c=>cells[c]),kv],fixed,Pv,dir,120))continue;
        if(hexr(cen(kv.map(p=>rot(p,Pv,dir*2*Math.PI/3))))<R-1-0.35)door={cells,side,freeS,outw,hc,hp,panel,P:Pv,dir,keySide:f};}}
    if(door)break;}
  if(!door)throw Error('doorRingKit: no clear door');
  const {cells,side,freeS,outw,hc,hp}=door,used=new Set([seed,key.toLowerCase(),'f','k','x','y',...[...avoid].map(c=>LOW[Math.max(LOW.indexOf(c),UP.indexOf(c))])]);
  const L=[...LOW].filter(c=>!used.has(c)).slice(0,P),X=[...LOW].filter(c=>!used.has(c)&&!L.includes(c)).slice(0,k+m+pre),U=c=>UP[LOW.indexOf(c)];
  const T=cells.map(()=>['-','-','-']);
  // motif front: c_1 .. c_hp (cell q attaches by L_q, exposes L_(q+1)); the root exposes L_1 and holds the seed
  // (pre: the first links root -> c_1 -> .. -> c_pre use unique letters, so c_1 .. c_pre are unique wall cells too)
  const lk=q=>q<pre?X[k+m+q]:L[(q+1)%P];   // the glue of the link from c_q to c_(q+1)
  for(let q=0;q<=hp;q++){const nx=side(q,q+1);T[q][nx]=lk(q)+'@';if(q>0)T[q][side(q,q-1)]=U(lk(q-1))+'@';}
  T[0][freeS(0)]=gname(comp(gcode(seed)))+'@'+(release?'&':'');
  // short front: root -> wall cells N-1 .. N-m -> panel N-m-1 (latched to the last wall cell) .. hc (welded)
  for(let q=0;q<m;q++){const a=q?N-q:0,b=N-1-q;T[a][side(a,b)]=X[q]+'@';T[b][side(b,a)]=U(X[q])+'@';}
  // the latch: both sides marked (an edge that comes apart: no open signal from either side once the door is open)
  // (a pore holds its panel by a completion release pair instead: once the cell is complete it lets go for good and
  // the spent wall side recruits nothing, so the pore stays open)
  T[N-m][side(N-m,N-m-1)]=X[m]+(pore?'@&':'~@');T[N-m-1][side(N-m-1,N-m)]=U(X[m])+(pore?'@&':'~@');
  for(let q=N-m-1;q>hc;q--){const e=X[m+(N-m-1-q)+1];T[q][side(q,q-1)]=e+'+@';T[q-1][side(q-1,q)]=U(e)+(pore&&q===N-m-1?'*':'')+'+@';}
  {const i=side(hc,hp),v=cells[hc];T[hc][i]=U(L[hc%P])+(same(v[i],door.P)?'<':'>')+'!=.';if(!pore)T[hc][door.keySide]=key+'*';}
  const wall=[...[...Array(m).keys()].map(q=>N-1-q),...[...Array(pre).keys()].map(q=>q+1)].map(c=>{const f=freeS(c);return {cell:c,side:f,inward:!outw(c)};});
  const types=T.map(t=>t.join('')),counts={},canonT=t=>[0,1,2].map(r=>[...t.slice(r),...t.slice(0,r)].join('')).sort()[0];
  T.slice(1).forEach(t=>{const c=canonT(t);counts[c]=(counts[c]||0)+1;});
  return {tris:cells.map((v,q)=>({v,type:types[q]})),types,counts,root:0,rootSide:freeS(0),rootType:types[0],N,letters:[...L,...X].join(''),wall,door:{hc,hp,P:door.P,dir:door.dir,panel:door.panel}};}

// map kit K so that its root's seed side lies flush against side i of the triangle with vertices A (a shared edge runs
// the opposite way); returns the mapped cells and the point map
function mapKit(K,A,i){const a=A[(i+1)%3],b=A[i],V=K.tris[K.root].v,j=K.rootSide,c=V[j],d=V[(j+1)%3];
  const ang=Math.atan2(b[1]-a[1],b[0]-a[0])-Math.atan2(d[1]-c[1],d[0]-c[0]),cs=Math.cos(ang),sn=Math.sin(ang);
  const T=p=>{const x=p[0]-c[0],y=p[1]-c[1];return [a[0]+cs*x-sn*y,a[1]+sn*x+cs*y];};return {cells:K.tris.map(t=>t.v.map(T)),T};}

// Two lid pockets joined into one structure (an organelle with two slots): the second pocket turned by a multiple of
// 60 degrees and moved by a lattice vector so that the two do not overlap, neither covers the other's slot or lid
// space, and they share at least one edge (so one kit can grow both). Returns candidates {tris, slots, clear}, most
// shared edges first.
function pocketPair(instrA,instrB,recog='X'){
  const A=lidPocket(instrA,recog,null,'B'),B=lidPocket(instrB,recog,null,'B'),sA=lidSlot('B'),cA=lidClear();
  const rotP=(p,k)=>{const a=k*Math.PI/3,c=Math.cos(a),s=Math.sin(a);return [c*p[0]-s*p[1],s*p[0]+c*p[1]];};
  const keyOf=v=>{const c=cen(v);return Math.round(c[0]*6)+','+Math.round(c[1]*6/H);};
  const occA=new Set(A.map(t=>keyOf(t.v))),freeA=new Set([sA.v,...cA].map(keyOf)),out=[];
  for(let k=0;k<6;k++)for(let i=-6;i<=6;i++)for(let j=-6;j<=6;j++){const d=[i+j/2,j*H],T=p=>{const q=rotP(p,k);return [q[0]+d[0],q[1]+d[1]];};
    const Bt=B.map(t=>({...t,v:t.v.map(T)})),sB={...sA,v:sA.v.map(T)},cB=cA.map(v=>v.map(T));
    const occB=Bt.map(t=>keyOf(t.v)),freeB=[sB.v,...cB].map(keyOf);
    if(occB.some(x=>occA.has(x)||freeA.has(x))||freeB.some(x=>occA.has(x)))continue;
    let shared=0;for(const a of A)for(const b of Bt)for(let x=0;x<3;x++)for(let y=0;y<3;y++)if(same(a.v[x],b.v[(y+1)%3])&&same(a.v[(x+1)%3],b.v[y]))shared++;
    if(!shared)continue;out.push({tris:[...A,...Bt],slots:[sA,sB],clear:[...cA,...cB],shared});}
  return out.sort((a,b)=>b.shared-a.shared);}

// Cell kit (a membrane that grows its own machines): a door ring kit (door or pore; the root keeps the chain) whose
// inward-facing wall cell carries the seed of an organelle (two lid pockets joined, `pocketPair`), so the casting
// machinery hangs on the wall, not on the chain. Searched: layout of the pair, kit option, wall cell, so that every
// organelle cell, slot and lid space lies inside the ring, the slots and lid spaces stay off the wall and the door's
// sweep, and nothing touches the cells in `keep` (e.g. the chain and the room its copy needs, in ring coordinates;
// keepFor(ringKit) computes them for the chosen ring).
// late (default): the organelle starts only once the wall is complete (its seed is a trigger side). Fewest risky
// cells first. Returns {tris (ring cells, then organelle cells), counts (type -> cells, root excluded),
// rootType, rootSide, root, N, ring (the door ring kit), organelle {K, cells, wall, side, seed}, letters}.
function cellKit({R=7,seed='m',k=4,m=5,pre=0,pore=true,key='X',recog='X',pockets=['AXm','aXm'],avoid='',keep=null,keepFor=null,maxRisk=99,order=[false,true],late=true}={}){
  const used0=[...new Set([...pockets.join(''),recog,seed,...avoid].filter(c=>c!=='-').map(c=>LOW[Math.max(LOW.indexOf(c),UP.indexOf(c))]))].join('');
  const KR=doorRingKit(R,seed,key,k,used0,m,false,pore,order,pre),ring=KR.tris.map(t=>t.v);if(keepFor)keep=keepFor(KR);keep=keep||[];
  const rot=(p,c,t)=>[c[0]+Math.cos(t)*(p[0]-c[0])-Math.sin(t)*(p[1]-c[1]),c[1]+Math.sin(t)*(p[0]-c[0])+Math.cos(t)*(p[1]-c[1])];
  // the part of the door's sweep inside the ring (panel cells turned up to 120 degrees)
  const sweep=[];for(let q=1;q<=12;q++)for(const c of KR.door.panel){const p=cen(ring[c].map(p=>rot(p,KR.door.P,KR.door.dir*q/12*2*Math.PI/3)));if(hexr(p)<R-1)sweep.push(p);}
  // the door's whole sweep must also miss the kept cells (a chain beside the hinge stalls a turning panel)
  if(keep.length&&!sweepClear(KR.door.panel.map(c=>ring[c]),keep,KR.door.P,KR.door.dir,120))throw Error('cellKit: the door sweeps the kept cells');
  const dist=(p,q)=>Math.hypot(p[0]-q[0],p[1]-q[1]),inner=KR.wall.filter(w=>w.inward),ringC=ring.map(cen),keepC=keep.map(cen);
  let letters=used0+KR.letters;const sd=[...LOW].find(c=>!letters.includes(c));letters+=sd;
  const layouts=pockets.length===2?pocketPair(pockets[0],pockets[1],recog):[{tris:lidPocket(pockets[0],recog,null,'B'),slots:[lidSlot('B')],clear:lidClear()}];
  let best=null;
  for(const L of layouts){const opts=kitOptions(L.tris,letters,sd,L.slots);
    for(const K of opts){if(K.risk>maxRisk||(best&&K.risk>=best.K.risk))continue;
      for(const w of inner){const {cells,T:map}=mapKit(K,ring[w.cell],w.side),extra=[...L.clear,...L.slots.map(x=>x.v)].map(v=>v.map(map));
        const all=[...cells,...extra].map(cen),ex=extra.map(cen);
        if(all.some(p=>hexr(p)>R-1-0.3)||all.some(p=>ringC.some(q=>dist(p,q)<0.3)))continue;   // inside, no overlap (cells may touch the wall)
        if(ex.some(p=>ringC.some(q=>dist(p,q)<0.9)))continue;   // the slots and lid spaces stay off the wall
        if(all.some(p=>sweep.some(q=>dist(p,q)<1.0))||all.some(p=>keepC.some(q=>dist(p,q)<0.9)))continue;
        best={K,cells,wall:w.cell,side:w.side,seed:sd};break;}}}
  if(!best)throw Error('cellKit: no place for the organelle');
  letters+=best.K.letters;
  // the organelle's seed on the wall is a trigger side: it binds nothing while the cell hears an open signal, and it
  // emits none, so the wall closes and the pore opens first; then the organelle's parts come in and grow it
  const T=KR.types.map(t=>[...t.matchAll(/[a-zA-Zα-ωΑ-Ωа-яА-Я-][<>.!^#*~$+=%@&]*/g)].map(x=>x[0]));T[best.wall][best.side]=sd+(late?'*':'@');
  const ringTypes=T.map(t=>t.join('')),canonT=t=>{const x=[...t.matchAll(/[a-zA-Zα-ωΑ-Ωа-яА-Я-][<>.!^#*~$+=%@&]*/g)].map(y=>y[0]);return [0,1,2].map(r=>[...x.slice(r),...x.slice(0,r)].join('')).sort()[0];};
  const tris=[...ring.map((v,q)=>({v,type:ringTypes[q]})),...best.cells.map((v,q)=>({v,type:best.K.types[q]}))];
  const counts={};tris.slice(1).forEach(t=>{const c=canonT(t.type);counts[c]=(counts[c]||0)+1;});
  return {tris,counts,rootType:ringTypes[0],rootSide:KR.rootSide,root:0,N:ring.length,ring:KR,organelle:best,letters};}

// Arm kit: the types of an arm grown from seed glue `seed` by a bend pattern ('1'/'2' per step: the side, counted
// counter-clockwise from the attach side, that exposes the next glue), using the given letters; the last type exposes
// nothing, so the arm ends without counting.
function armTypes(seed,pattern,letters){const E=[seed,...letters.slice(0,pattern.length)],out=[];
  for(let k=0;k<=pattern.length;k++){const t=['-','-','-'];t[0]=gname(comp(gcode(E[k])));if(k<pattern.length)t[+pattern[k]]=E[k+1];out.push(t.join(''));}
  return out;}
const mirror=p=>[...p].map(c=>c==='1'?'2':'1').join('');
module.exports={pocket,lidPocket,lidSlot,lidClear,pocketPair,importRing,doorRingKit,cellKit,mapKit,sweepClear,kit,kitOptions,ringKit,conveyor,ring,airlock,armTypes,mirror,lattice,hexr,H};
