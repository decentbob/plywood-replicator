'use strict';
// Designed structures on the triangle lattice (prepared starting conditions, labelled as such in every demo) and
// type kits. Coordinates: lattice with unit sides, H = sqrt(3)/2; triangles given counter-clockwise, side i runs
// v[i] -> v[i+1]; a type string names the glue and marks of sides 0, 1, 2 (sim.js parseType).
const {gcode,gname,comp,LOW,UP,TOK}=require('./sim');
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
// instr: a string of three glues, or three tokens with carried marks (["-", "b'@", "A'@"]: the product's sides then
// carry those marks: a stamp, see RULES Casting).
function lidPocket(instr='bcd',recog='A',fuel=null,catcher='BR'){
  const tk=typeof instr==='string'?[...instr]:instr,g=tk.map(t=>t[0]),c=tk.map(t=>t.slice(1));if(c.some(x=>x&&x[0]!=="'"))throw Error('lid pocket: carried marks follow an apostrophe');
  const [p,q,r]=g,R=recog,P=gname(comp(gcode(p))),Q=gname(comp(gcode(q)));if(q==='-')throw Error('lid pocket: R needs an instruction glue');
  const [pc,qc,rc]=c;
  return [
    {v:[[0,0],[0.5,-H],[1,0]],type:`K${p}.${pc}${R}${catcher.includes('B')?'':'.'}`,loose:p==='-'},   // B: K, instruction p (close-only, as all instruction sides), recognition (catches if in `catcher`)
    {v:[[1,0],[1.5,H],[0.5,H]],type:`K${q}.${qc}${R}${catcher.includes('R')?'':'.'}*`},                       // R: K, instruction q, recognition + trigger
    {v:[[0.5,H],[1,2*H],[0,2*H]],type:`K<=+${r}.${rc}${R}.`},                  // lid (open): hinge K (pin (0.5,H), wide, hears Q), instruction r, recognition (close-only)
    {v:[[0.5,H],[1.5,H],[1,2*H]],type:`${Q}+${fuel?fuel+'$':'-'}k`},     // Q: holds R's instruction and hears R; outer side (fuel); lid's hinge partner
    {v:[[0,0],[-0.5,-H],[0.5,-H]],type:'--k'},                           // Z: k for B
    {v:[[0.5,-H],[1.5,-H],[1,0]],type:`--${P}`},                         // W: holds B's instruction
    {v:[[1,0],[2,0],[1.5,H]],type:'--k'},                                // S: k for R
    {v:[[1,0],[1.5,-H],[2,0]],type:'---'},{v:[[2,0],[2.5,H],[1.5,H]],type:'---'},{v:[[2,0],[1.5,-H],[2.5,-H]],type:'---'},
    {v:[[-0.5,-H],[0,-2*H],[0.5,-H]],type:'---'},{v:[[0,-2*H],[1,-2*H],[0.5,-H]],type:'---'},{v:[[0.5,-H],[1,-2*H],[1.5,-H]],type:'---'},
    {v:[[1,-2*H],[2,-2*H],[1.5,-H]],type:'---'},
    ...(fuel?[]:[{v:[[1.5,H],[2,2*H],[1,2*H]],type:'---'},{v:[[1.5,H],[2.5,H],[2,2*H]],type:'---'}]),   // behind Q (a kit reaches Q this way)
  ];}
// stamp instructions for a lid pocket that casts part type t: t's sides as tokens, turned so side 1 (R's instruction)
// is not inert, each side's marks carried (b@ -> b'@)
function stampInstr(t){const x=[...t.matchAll(TOK)].map(m=>({g:m[1],m:m[2]}));const r=[0,1,2].find(k=>x[(k+1)%3].g!=='-');if(r===undefined)throw Error('stampInstr: inert type');
  return [0,1,2].map(i=>{const y=x[(i+r)%3];return y.g+(y.m?"'"+y.m:'');});}
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
  const tok=tris.map(t=>[...t.type.matchAll(TOK)].map(m=>({g:m[1],m:m[2],c:m[3]?"'"+m[3]:''})));
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
  const types=tok.map(t=>t.map(x=>x.g+x.m+x.c).join(''));
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

// Bud pair (prepared, labelled starting condition): a parent ring P (side RP, centre 0,0) and a bud ring D (side RD)
// above it, sharing a flat contact (P's top side against D's bottom side) held by completion-release pairs ('&'). A
// doorway runs through both walls: each wall has a door panel of k cells (welded by hear sides, a built-in trigger
// between its first two cells), turned open into its own ring about a pin on its inner boundary and held there by a
// '&' pair to a doorstop cell welded to the wall. While anything bonded to the pair hears an open signal (a growth
// front, e.g. a seed inside D), all holds. Once nothing is open: the '&' bonds cut, P and D separate, and each panel,
// always triggered, swings shut (60 or 120 degrees, '=') and closes (close-only pair) onto the wall cell beyond the doorway, which
// locks it. Returns {tris (closed positions: the demo turns the panels open), P: cell indices, D, doors:[{panel, prev,
// next, pin, dir, ang, stop, hingeSide, closeSide, stopSide:[panel cell, side, stop side]}], cap}. capGlue: D grows a
// three-cell cap on its inner wall from one part type (below).
function budPair({RP=6,RD=4,k=5,capGlue=null,anchorGlue=null,anchorP=null,organelle:org=null,importD=null}={}){
  if((RP+RD)%2)throw Error('budPair: RP+RD must be even (lattice offset)');
  const {triDepth}=require('./physics'),flat=V=>Float64Array.from(V.flat());
  const Pc=ringKit(RP,'z').tris.map(t=>t.v),dy=(RP+RD)*H,Dc=ringKit(RD,'z').tris.map(t=>t.v.map(p=>[p[0],p[1]+dy]));
  const cells=[...Pc,...Dc],NP=Pc.length,ND=Dc.length,P=[...Array(NP).keys()],D=[...Array(ND).keys()].map(q=>NP+q);
  const side=(a,b)=>{for(let i=0;i<3;i++)for(let j=0;j<3;j++)if(same(cells[a][i],cells[b][(j+1)%3])&&same(cells[a][(i+1)%3],cells[b][j]))return [i,j];return null;};
  const rot=(p,c,t)=>[c[0]+Math.cos(t)*(p[0]-c[0])-Math.sin(t)*(p[1]-c[1]),c[1]+Math.sin(t)*(p[0]-c[0])+Math.cos(t)*(p[1]-c[1])];
  const yc=RP*H,T=cells.map(()=>['-','-','-']);
  // the doors: k consecutive ring cells nearest x = 0 on the contact row, pin on the inner boundary, turning inward
  const lat=lattice(RP+RD+2).map(v=>v.map(p=>[p[0],p[1]])),key=v=>{const c=cen(v);return Math.round(c[0]*12)+','+Math.round(c[1]*12);};
  const occupied=new Set(cells.map(key));
  const doors=[];
  for(const [ring,inner,sgn] of [[P,(RP-1)*H,-1],[D,dy-(RD-1)*H,1]]){
    const N=ring.length,row=ring.filter(c=>cells[c].every(p=>Math.abs(p[1]-yc)<1e-6||Math.abs(p[1]-inner)<1e-6)&&Math.abs(cen(cells[c])[0])<Math.max(RP,RD));
    const idx=c=>ring.indexOf(c);let best=null;
    for(const st of row){const panel=[...Array(k).keys()].map(q=>ring[(idx(st)+q)%N]);if(!panel.every(c=>row.includes(c)))continue;
      const xm=panel.reduce((a,c)=>a+cen(cells[c])[0],0)/k;
      for(const [h,o,end] of [[panel[0],ring[(idx(st)+N-1)%N],ring[(idx(st)+k)%N]],[panel[k-1],ring[(idx(st)+k)%N],ring[(idx(st)+N-1)%N]]]){
        const ord=h===panel[0]?panel:[...panel].reverse();
        for(const pin of cells[h].filter(p=>Math.abs(p[1]-inner)<1e-6&&cells[o].some(q=>same(p,q))))for(const dir of [1,-1])for(const ang of [60,120]){
          const fixed=cells.filter((_,x)=>!panel.includes(x));
          if(!sweepClear(panel.map(c=>cells[c]),fixed,pin,dir,ang))continue;
          const open=panel.map(c=>cells[c].map(p=>rot(p,pin,dir*ang*Math.PI/180)));
          if(Math.sign(cen(open[0])[1]-yc)!==sgn)continue;   // opens into its own ring
          // doorstop: a free lattice slot sharing a side with an open panel cell (not the hinge cell) and with a fixed
          // cell of the same ring, clear of the panel's closing sweep
          for(const v of lat){if(occupied.has(key(v)))continue;const sh=(A,B)=>{for(let i=0;i<3;i++)for(let j=0;j<3;j++)if(same(A[i],B[(j+1)%3])&&same(A[(i+1)%3],B[j]))return [i,j];return null;};
            const pi=open.findIndex((V,q)=>q>0&&sh(V,v)),wc=ring.find(c=>!panel.includes(c)&&sh(cells[c],v));if(pi<0||wc===undefined)continue;
            if(open.some(V=>triDepth(flat(V),flat(v))>1e-6))continue;
            if(!sweepClear(open,[v],pin,-dir,ang))continue;
            const score=Math.abs(xm-(doors.length?doors[0].xm:0));if(!best||score<best.score)best={score,xm,ang,panel:ord,prev:o,next:end,pin,dir,stopV:v,stopWall:wc,stopPanel:ord.indexOf(panel[pi]),stopOpen:open[pi],open:ord.map(c=>open[panel.indexOf(c)])};}
          }}}
    if(!best)throw Error('budPair: no door');doors.push(best);}
  // the doorstops become cells of their rings
  for(const d of doors){d.stop=cells.length;cells.push(d.stopV);T.push(['-','-','-']);(P.includes(d.prev)?P:D).push(d.stop);}
  const sideV=(A,B)=>{for(let i=0;i<3;i++)for(let j=0;j<3;j++)if(same(A[i],B[(j+1)%3])&&same(A[(i+1)%3],B[j]))return [i,j];return null;};
  // contact: P's top side against D's bottom side ('&' pairs), not across the doorway (loose panels)
  const loose=new Set(doors.flatMap(d=>d.panel));
  for(const a of P)for(const b of D){if(loose.has(a)||loose.has(b))continue;const ij=side(a,b);if(!ij)continue;T[a][ij[0]]='ш&';T[b][ij[1]]='Ш&';}
  const W=['ψ','ω'];
  doors.forEach((d,n)=>{const pc=d.panel,g=W[n];
    {const [i,j]=side(pc[0],d.prev);T[pc[0]][i]=g+(same(cells[pc[0]][i],d.pin)?'<':'>')+(d.ang===120?'=':'');T[d.prev][j]=UP[LOW.indexOf(g)];d.hingeSide=[i,j];}
    // welds inside the panel hear each other; the first weld is also the built-in trigger (always triggered)
    for(let q=0;q+1<pc.length;q++){const [i,j]=side(pc[q],pc[q+1]);const w=['б','г','д','ж'][q]+(n?'':'');T[pc[q]][i]=(n?UP[LOW.indexOf(w)]:w)+(q===0?'*':'')+'+';T[pc[q+1]][j]=(n?w:UP[LOW.indexOf(w)])+'+';}
    // the closing pair: the last panel cell onto the wall cell beyond the doorway (close-only: nothing free binds it)
    // the wall side is also a latch: unbonded (doorway open) it emits the lock signal, so another door of the ring (an
    // import door) holds shut until this one is shut (a ring with two gaps falls apart); shut, it holds (never triggered)
    {const [i,j]=side(pc[pc.length-1],d.next);T[pc[pc.length-1]][i]=(n?'э':'Э')+'.';T[d.next][j]=(n?'Э':'э')+'.~';d.closeSide=[i,j];}
    // the doorstop holds the open panel by a '&' pair; welded to its wall cell (inert sides: the builder welds them)
    {const V=d.stopOpen,[i,j]=sideV(V,d.stopV);T[pc[d.stopPanel]][i]=(n?'ц':'Ц')+'&';T[d.stop][j]=(n?'Ц':'ц')+'&';d.stopSide=[pc[d.stopPanel],i,j];}});
  // cap (the bud's content): three slots around a vertex V on D's inner boundary, from a seed side on one wall cell
  // (glue `cap` + '@') to a closing side on the next (complement, close-only); one part type fills all three (they are
  // turns of each other about V). Returns {seed: [cell, side], close: [cell, side], slots, type}.
  let cap=null;
  if(capGlue){const busy=new Set([...loose,...doors.flatMap(d=>[d.stop,d.prev,d.next])]),C=capGlue,CU=gname(comp(gcode(C)));
    const near=(v,w)=>Math.hypot(cen(v)[0]-cen(w)[0],cen(v)[1]-cen(w)[1]);
    const cand=[];
    for(const c of D){if(busy.has(c))continue;for(let f=0;f<3;f++){if(T[c][f]!=='-'||cells.some((w,x)=>x!==c&&sideV(cells[c],w)&&sideV(cells[c],w)[0]===f))continue;
      const V0=cells[c][f],V1=cells[c][(f+1)%3];if(hexr([(V0[0]+V1[0])/2,V0[1]/2+V1[1]/2-dy])>RD-0.5)continue;   // inner side
      for(const V of [V0,V1]){const rotV=(v,t)=>v.map(p=>rot(p,V,t));
        // the slot across side f, then two more turned about V away from the wall
        const s0=[cells[c][(f+1)%3],cells[c][f],[V0[0]+V1[0]-cells[c][(f+2)%3][0],V0[1]+V1[1]-cells[c][(f+2)%3][1]]];
        for(const t of [Math.PI/3,-Math.PI/3]){const sl=[s0,rotV(s0,t),rotV(s0,2*t)],last=rotV(s0,3*t);
          const c2=D.find(x=>!busy.has(x)&&x!==c&&near(cells[x],last)<1e-6);if(c2===undefined)continue;
          if(sl.some(v=>cells.some(w=>near(v,w)<1e-6)||doors.some(d=>d.open.some(w=>near(v,w)<1.6))))continue;
          if(Math.abs(t)>0&&hexr([cen(sl[1])[0],cen(sl[1])[1]-dy])>RD-1)continue;   // the cap bulges inward
          cand.push({c,f,c2,sl,t,dist:Math.min(...doors.map(d=>near(d.open[0],sl[1])))});}}}}
    cand.sort((a,b)=>b.dist-a.dist);const b=cand[0];if(!b)throw Error('budPair: no place for the cap');
    T[b.c][b.f]=C+'@';const ls=b.sl[b.sl.length-1],f2=[0,1,2].find(i=>sideV(cells[b.c2],ls)&&sideV(cells[b.c2],ls)[0]===i);T[b.c2][f2]=CU+'.';
    // part type: side toward the previous cell attaches (complement + '@'), side toward the next exposes `cap` + '@'
    const types=b.sl.map((v,q)=>{const prev=q?b.sl[q-1]:cells[b.c],next=q<2?b.sl[q+1]:cells[b.c2],t=['-','-','-'];t[sideV(v,prev)[0]]=CU+'@';t[sideV(v,next)[0]]=C+'@';return t.join('');});
    const canonT=t=>{const x=[...t.matchAll(TOK)].map(m=>m[0]);return [0,1,2].map(r=>[...x.slice(r),...x.slice(0,r)].join('')).sort()[0];};
    if(new Set(types.map(canonT)).size!==1)throw Error('budPair: cap slots need different types '+types);
    cap={seed:[b.c,b.f],close:[b.c2,f2],slots:b.sl,type:types[0]};}
  // import door (importD: the key glue, e.g. 'U' for blanks uuu): a revolving door in D's wall as importRing's (k cells
  // welded by hear sides, hinged at an inner corner with drop '!' and wide '=', latched at its far end, the key '*' on an
  // outer face); its sweep (panel and key, 120 degrees inward) clear of everything fixed and of the closing door's sweep.
  // While D hears an open signal its latch holds and its key is deaf: it imports only after the split.
  let imp=null;
  if(importD){const busy=new Set([...loose,...doors.flatMap(d=>[d.stop,d.prev,d.next])]),Dr=D.filter(c=>c<NP+ND),N=Dr.length,kk=4,dcen=[0,dy];
    const dd=doors[1],dsw=[];for(let q=0;q<=12;q++)for(const V of dd.open)dsw.push(V.map(p=>rot(p,dd.pin,-dd.dir*q/12*dd.ang*Math.PI/180)));
    const order=[...Array(N).keys()].sort((a,b)=>cen(cells[Dr[b]])[1]-cen(cells[Dr[a]])[1]);   // far from P first
    for(const st of order){if(imp)break;const panel=[...Array(kk).keys()].map(q=>Dr[(st+q)%N]),prev=Dr[(st+N-1)%N],next=Dr[(st+kk)%N];
      if([...panel,prev,next].some(c=>busy.has(c)))continue;const fixed=cells.filter((_,x)=>!panel.includes(x));
      for(const P0 of cells[panel[0]].filter(p=>cells[prev].some(q=>same(p,q))&&hexr([p[0]-dcen[0],p[1]-dcen[1]])<RD-0.5)){if(imp)break;
        for(const kc of panel){const f=[0,1,2].find(i=>!cells.some((w,x)=>x!==kc&&sideV(cells[kc],w)&&sideV(cells[kc],w)[0]===i));if(f===undefined)continue;
          const v=cells[kc],m=[(v[f][0]+v[(f+1)%3][0])/2-dcen[0],(v[f][1]+v[(f+1)%3][1])/2-dcen[1]];if(hexr(m)<RD-0.5)continue;
          const kv=[v[(f+1)%3],v[f],[v[f][0]+v[(f+1)%3][0]-v[(f+2)%3][0],v[f][1]+v[(f+1)%3][1]-v[(f+2)%3][1]]];
          // the direction the hinge really turns (sim.bind: away from its partner's centre about the pinned corner)
          const c0=cen(cells[panel[0]]),q0=cen(cells[prev]),fv=[c0[0]-P0[0],c0[1]-P0[1]],dv=[c0[0]-q0[0],c0[1]-q0[1]],dir=(dv[0]*(-fv[1])+dv[1]*fv[0])>0?1:-1;
          if(!sweepClear([...panel.map(c=>cells[c]),kv],[...fixed,...dsw],P0,dir,120))continue;
          const kEnd=cen(kv.map(p=>rot(p,P0,dir*2*Math.PI/3)));if(hexr([kEnd[0]-dcen[0],kEnd[1]-dcen[1]])>RD-1-0.3)continue;
          const sw=[];for(let q=0;q<=12;q++)for(const V of [...panel.map(c=>cells[c]),kv])sw.push(cen(V.map(p=>rot(p,P0,dir*q/12*2*Math.PI/3))));
          imp={panel,prev,next,P:P0,dir,keyCell:kc,keySide:f,sweep:sw};break;}}}
    if(!imp)throw Error('budPair: no import door in D');
    const H2=['л','п','ф','и','з'];
    {const [i,j]=side(imp.panel[0],imp.prev),v=cells[imp.panel[0]];T[imp.panel[0]][i]=H2[0]+(same(v[i],imp.P)?'<':'>')+'!=';T[imp.prev][j]=UP[LOW.indexOf(H2[0])];}
    for(let q=0;q+1<imp.panel.length;q++){const [i,j]=side(imp.panel[q],imp.panel[q+1]);T[imp.panel[q]][i]=H2[q+1]+'+';T[imp.panel[q+1]][j]=UP[LOW.indexOf(H2[q+1])]+'+';}
    {const last=imp.panel[imp.panel.length-1],[i,j]=side(last,imp.next);T[last][i]='Ч~';T[imp.next][j]='ч';}
    T[imp.keyCell][imp.keySide]=importD+'*';for(const c of imp.panel)loose.add(c);}
  // organelle (with anchorGlue): D grows a part from kit options `organelle.opts` (structures.kitOptions, their seeds
  // '@' on a D wall side) and keeps an anchor side: planned together so that the part, its slot and lid spaces, the
  // anchored strand (world.band of `organelle.gaps`, its high end on the anchor) with its dock sites and the row beyond
  // them, and the door's sweep do not meet
  let organelle=null;
  if(org){const {band,rolesFromGaps}=require('./world'),dcen=[0,dy],dist=(p,q)=>Math.hypot(p[0]-q[0],p[1]-q[1]);
    const busy=new Set([...loose,...doors.flatMap(d=>[d.stop,d.prev,d.next]),...(imp?[imp.prev,imp.next]:[])]),wallC=cells.map(cen);
    const inSide=[];for(const c of D){if(busy.has(c))continue;for(let f=0;f<3;f++){if(T[c][f]!=='-'||cells.some((w,x)=>x!==c&&sideV(cells[c],w)&&sideV(cells[c],w)[0]===f))continue;
      const V0=cells[c][f],V1=cells[c][(f+1)%3];if(hexr([(V0[0]+V1[0])/2-dcen[0],(V0[1]+V1[1])/2-dcen[1]])<RD-0.5)inSide.push([c,f]);}}
    const dd=doors[1],sweep=imp?[...imp.sweep]:[];for(let q=0;q<=12;q++)for(const V of dd.open)sweep.push(cen(V.map(p=>rot(p,dd.pin,-dd.dir*q/12*dd.ang*Math.PI/180))));
    const B=band(rolesFromGaps(org.gaps)),last=B[B.length-1];
    const strandAt=([c,f])=>{const a=cells[c][(f+1)%3],b=cells[c][f],[x0,x1]=last.exit;   // the strand's spare high edge x0->x1 meets the anchor side (b->a)
      const ang=Math.atan2(a[1]-b[1],a[0]-b[0])-Math.atan2(x1[1]-x0[1],x1[0]-x0[0]);const cs=Math.cos(ang),sn=Math.sin(ang);
      // the shared edge runs the opposite way: x0 -> b... try both orientations and keep the one on the inner side
      const out=[];for(const [P0,Q0] of [[b,x0],[a,x0]]){const an=Math.atan2((P0===b?a:b)[1]-P0[1],(P0===b?a:b)[0]-P0[0])-Math.atan2(x1[1]-x0[1],x1[0]-x0[0]),c2=Math.cos(an),s2=Math.sin(an);
        const M=p=>[P0[0]+c2*(p[0]-x0[0])-s2*(p[1]-x0[1]),P0[1]+s2*(p[0]-x0[0])+c2*(p[1]-x0[1])];out.push(B.map(t=>({v:t.v.map(M),role:t.role,free:t.free.map(M)})));}
      return out.find(st=>st.every(t=>hexr([cen(t.v)[0]-dcen[0],cen(t.v)[1]-dcen[1]])<RD-1))||null;};
    let bestO=null;
    for(const an of inSide){const st=strandAt(an);if(!st)continue;const keep=[],docks=[];
      for(const t of st){keep.push(cen(t.v));if(t.role!=='F')continue;const [A,Bp]=t.free,C=t.v.find(p=>!same(p,A)&&!same(p,Bp)),X=[A[0]+Bp[0]-C[0],A[1]+Bp[1]-C[1]];
        const dock=cen([A,Bp,X]),fc=cen(t.v);docks.push(dock,[2*dock[0]-fc[0],2*dock[1]-fc[1]]);}
      // the strand may touch the wall at its anchored end; its dock sites (where copies grow) stay off the wall
      if(keep.some(p=>wallC.some(q=>dist(p,q)<0.3))||docks.some(p=>wallC.some(q=>dist(p,q)<0.9))||[...keep,...docks].some(p=>sweep.some(q=>dist(p,q)<1.2)||hexr([p[0]-dcen[0],p[1]-dcen[1]])>RD-1))continue;
      keep.push(...docks);
      for(const K of org.opts){for(const w of inSide){if(w[0]===an[0])continue;const {cells:oc,T:map}=mapKit(K,cells[w[0]],w[1]),extra=[...org.clear,...org.slots.map(x=>x.v)].map(v=>v.map(map));
          const all=[...oc,...extra].map(cen),ex=extra.map(cen);
          if(all.some(p=>hexr([p[0]-dcen[0],p[1]-dcen[1]])>RD-1-0.3)||all.some(p=>wallC.some(q=>dist(p,q)<0.3)))continue;
          if(ex.some(p=>wallC.some(q=>dist(p,q)<0.9))||all.some(p=>sweep.some(q=>dist(p,q)<1.0))||all.some(p=>keep.some(q=>dist(p,q)<1.0)))continue;
          // narrow sites: a kit cell (not the root) with a side on a wall cell can enter only through its one open
          // side once its parent is there (2 of 4 bud pockets stalled on such a cell); fewest of them, after kit risk
          const across=(v,i)=>{const a=v[i],b=v[(i+1)%3],c=v[(i+2)%3];return cen([a,b,[a[0]+b[0]-c[0],a[1]+b[1]-c[1]]]);};
          const narrow=oc.filter((v,x)=>x!==K.root&&[0,1,2].some(i=>{const m=across(v,i);return wallC.some(q=>dist(m,q)<0.3);})).length;
          if(!bestO||K.risk<bestO.K.risk||(K.risk===bestO.K.risk&&narrow<bestO.narrow))bestO={K,cells:oc,wall:w,anchor:an,strand:st,narrow};}}}
    if(!bestO)throw Error('budPair: no place for the organelle and anchor');
    T[bestO.wall[0]][bestO.wall[1]]=org.seed+'@';T[bestO.anchor[0]][bestO.anchor[1]]=anchorGlue+'@|';
    organelle=bestO;}
  // anchor: an inward side of a plain D wall cell, far from the door, takes glue `anchorGlue` with '@|' (it catches a
  // strand end's seed and emits the open signal until it has)
  let anchor=organelle?organelle.anchor:null;
  if(anchorGlue&&!organelle){const busy=new Set([...loose,...doors.flatMap(d=>[d.stop,d.prev,d.next])]);if(cap)busy.add(cap.seed[0]).add(cap.close[0]);let best=null;
    for(const c of D){if(busy.has(c))continue;for(let f=0;f<3;f++){if(T[c][f]!=='-'||cells.some((w,x)=>x!==c&&sideV(cells[c],w)&&sideV(cells[c],w)[0]===f))continue;
      const V0=cells[c][f],V1=cells[c][(f+1)%3],m=[(V0[0]+V1[0])/2,(V0[1]+V1[1])/2-dy];if(hexr(m)>RD-0.5)continue;
      const d=Math.min(...doors.map(q=>Math.hypot(cen(q.open[0])[0]-m[0],cen(q.open[0])[1]-m[1]-dy)));if(!best||d>best.d)best={c,f,d};}}
    if(!best)throw Error('budPair: no anchor side');T[best.c][best.f]=anchorGlue+'@|';anchor=[best.c,best.f];}
  // anchorP: the parent keeps its own genome: an inward side of a plain P wall cell far from the door takes glue
  // `anchorP` with '|' (no '@': it does not hold the pair together)
  let anchorPs=null;
  if(anchorP){const busy=new Set([...loose,...doors.flatMap(d=>[d.stop,d.prev,d.next])]);let best=null;
    for(const c of P){if(busy.has(c))continue;for(let f=0;f<3;f++){if(T[c][f]!=='-'||cells.some((w,x)=>x!==c&&sideV(cells[c],w)&&sideV(cells[c],w)[0]===f))continue;
      const V0=cells[c][f],V1=cells[c][(f+1)%3],m=[(V0[0]+V1[0])/2,(V0[1]+V1[1])/2];if(hexr(m)>RP-0.5)continue;
      const d=Math.min(...doors.map(q=>Math.hypot(cen(q.open[0])[0]-m[0],cen(q.open[0])[1]-m[1])));if(!best||d>best.d)best={c,f,d,m};}}
    T[best.c][best.f]=anchorP+'|';anchorPs=[best.c,best.f,best.m];}
  return {tris:cells.map((v,x)=>({v,type:T[x].join(''),loose:loose.has(x)})),P,D,doors,cap,anchor,anchorP:anchorPs,organelle,importDoor:imp};}

// Grown bud (the parent P is prepared, labelled; the bud D grows from P's seed): P is a ring of side RP; D, a ring of
// side RD above it, grows from free kit parts (every cell its own type) on P's seed side S (outer top side, glue
// `seed`). D's root sits on S; from the root two fronts grow: D's door panel (k cells along the contact row, hinged to
// the root, welded) and the wall the long way round; its last cell q meets the panel's far end flush, unbonded (a bond
// there would lock the flap). Beside S, P has its own door panel (k cells, hinged to S). Both panels are pulse doors
// ('#') with a built-in trigger (the second panel cell's weld side '*'): they swing open (into their own rings)
// whenever they hear no lock signal. Signals: S's seed side, the root's seed side, the root's wall site and every
// later site of the wall front are latches ('~': unbonded, they emit the lock signal), so from t=0 until q has arrived
// an open latch holds both doors shut; latch sites emit no open signal, so the open signal comes from the panel front
// (ordinary sites) and from the content's seed (a cap, as budPair's) on the wall front's first cell. The root's seed
// side is also a completion release ('&'): while the cap is open the pair holds; once nothing is open the seed bond is
// cut for good, both seed latches are open again, their lock signal shuts both doors and D leaves with its panel. No
// latch sits on or beside a triggered cell or a flap (a latch lets go there). Returns {tris: P cells then D cells in
// their grown places (types; D cells loose), P, D (indices), S, root, panelP, panelD, q, frontB (wall growth order),
// doors [{panel, hinge, pin, dir, ang}], kit (D types except the root's), rootType, cap, letters}.
function grownBud({RP=6,RD=4,k=5,seed='z',capGlue='a',avoid=''}={}){
  if((RP+RD)%2)throw Error('grownBud: RP+RD must be even (lattice offset)');
  const Pc=ringKit(RP,'z').tris.map(t=>t.v),dy=(RP+RD)*H,Dc=ringKit(RD,'z').tris.map(t=>t.v.map(p=>[p[0],p[1]+dy]));
  const NP=Pc.length,ND=Dc.length,cells=[...Pc,...Dc],P=[...Array(NP).keys()],D=[...Array(ND).keys()].map(q=>NP+q);
  const sideV=(A,B)=>{for(let i=0;i<3;i++)for(let j=0;j<3;j++)if(same(A[i],B[(j+1)%3])&&same(A[(i+1)%3],B[j]))return [i,j];return null;};
  const side=(a,b)=>sideV(cells[a],cells[b]),rot=(p,c,t)=>[c[0]+Math.cos(t)*(p[0]-c[0])-Math.sin(t)*(p[1]-c[1]),c[1]+Math.sin(t)*(p[0]-c[0])+Math.cos(t)*(p[1]-c[1])];
  const at=(ring,i)=>ring[((i%ring.length)+ring.length)%ring.length],yt=RP*H,row=(c,a,b)=>cells[c].every(p=>Math.abs(p[1]-a)<1e-6||Math.abs(p[1]-b)<1e-6);
  // a flap's real swing (sim.bind: away from its hinge partner about the pinned corner): CCW (+1) or CW (-1)
  const realDir=(f,o,pin)=>{const c=cen(cells[f]),q=cen(cells[o]),fv=[c[0]-pin[0],c[1]-pin[1]],d=[c[0]-q[0],c[1]-q[1]];return (d[0]*(-fv[1])+d[1]*fv[0])>0?1:-1;};
  const inRing=(V,c0,R)=>hexr([cen(V)[0]-c0[0],cen(V)[1]-c0[1]])<R-1;
  const layouts=[];
  for(let i=0;i<NP;i++){const S=P[i],up=cells[S].filter(p=>Math.abs(p[1]-yt)<1e-6);if(up.length!==2||!row(S,(RP-1)*H,yt))continue;
    const r=D.findIndex(c=>has(cells[c],...up));if(r<0)continue;const root=D[r];
    for(const s of [1,-1]){const pD=[...Array(k).keys()].map(q=>at(D,r+s*(q+1))),sP=Math.sign(cen(cells[at(P,i+1)])[0]-cen(cells[S])[0])===Math.sign(cen(cells[pD[0]])[0]-cen(cells[root])[0])?1:-1,pP=[...Array(k).keys()].map(q=>at(P,i+sP*(q+1))),q=at(D,r+s*(k+1));
      if(!pP.every(c=>row(c,(RP-1)*H,yt))||!pD.every(c=>row(c,yt,(RP+1)*H)))continue;
      const doors=[];
      for(const [panel,hp,c0,R] of [[pP,S,[0,0],RP],[pD,root,[0,dy],RD]]){let pick=null;const fixed=cells.filter((_,x)=>!pP.includes(x)&&!pD.includes(x));
        for(const ang of [60,120])for(const pin of cells[panel[0]].filter(p=>cells[hp].some(q=>same(p,q)))){if(pick)break;const dir=realDir(panel[0],hp,pin);
          if(!sweepClear(panel.map(c=>cells[c]),fixed,pin,dir,ang))continue;
          const open=panel.map(c=>cells[c].map(p=>rot(p,pin,dir*ang*Math.PI/180)));if(!open.every(V=>inRing(V,c0,R)))continue;
          pick={panel,hinge:hp,pin,dir,ang,open};}
        if(!pick)break;doors.push(pick);}
      if(doors.length<2)continue;
      // the two doors' sweeps must not meet (they open together)
      const swept=d=>{const out=[];for(let a=0;a<=d.ang;a+=5)for(const c of d.panel)out.push(cells[c].map(p=>rot(p,d.pin,d.dir*a*Math.PI/180)));return out;};
      if(!sweepClear(doors[0].panel.map(c=>cells[c]),doors[1].panel.map(c=>cells[c]),doors[0].pin,doors[0].dir,doors[0].ang)||!sweepClear(doors[1].panel.map(c=>cells[c]),swept(doors[0]),doors[1].pin,doors[1].dir,doors[1].ang))continue;
      const score=Math.abs(cen(cells[S])[0])+doors[0].ang/60+doors[1].ang/60;layouts.push({score,S,root,r,s,pP,pD,q,doors});}}
  if(!layouts.length)throw Error('grownBud: no doorway');
  layouts.sort((a,b)=>a.score-b.score);let err=null;
  for(const lay of layouts){try{return grownBudTypes(lay);}catch(e){err=e;}}
  throw err;
  // types of one layout (throws when the cap has no place)
  function grownBudTypes({S,root,r,s,pP,pD,q,doors}){const frontB=[...Array(ND-k-1).keys()].map(x=>at(D,r-s*(x+1)));
  if(frontB[frontB.length-1]!==q)throw Error('grownBud: wall front does not end at q');
  // letters: unique pairs for the tree edges of D and the welds of P's panel
  const U=c=>UP[LOW.indexOf(c)],res=new Set([seed,capGlue,'f','k','x',...[...avoid].map(c=>LOW.includes(c)?c:LOW[UP.indexOf(c)])].filter(Boolean));
  const pool=[...LOW].filter(c=>!res.has(c));if(pool.length<ND+k-1)throw Error('grownBud: not enough letters');let nl=0;const L=()=>pool[nl++];
  const T=cells.map(()=>['-','-','-']);
  const pinMark=(c,i,pin)=>same(cells[c][i],pin)?'<':'>';
  // P's door: hinged to S, built-in trigger on the second cell's weld, welded panel (loose: its far end meets the wall unwelded)
  {const d=doors[0],[i,j]=side(pP[0],S),h=L();T[pP[0]][i]=h+pinMark(pP[0],i,d.pin)+'#'+(d.ang===120?'=':'');T[S][j]=U(h);
    for(let x=0;x+1<k;x++){const [a,b]=side(pP[x],pP[x+1]),w=L();T[pP[x]][a]=w;T[pP[x+1]][b]=U(w)+(x===0?'*':'');}}
  // S's seed side (outer top) and the root's seed side: latches (unbonded, they hold the doors shut); the root's is
  // also the completion release
  {const [i,j]=side(S,root);T[S][i]=seed+'@~';T[root][j]=gname(comp(gcode(seed)))+'@&~';}
  // D's panel front (ordinary sites: open signal): root -> p1 (hinge, pulse) -> p2 (built-in trigger) -> ... -> pk
  {const d=doors[1],ch=[root,...pD];for(let x=0;x+1<ch.length;x++){const [a,b]=side(ch[x],ch[x+1]),g=L();
    T[ch[x]][a]=g+'@';T[ch[x+1]][b]=U(g)+'@'+(x===0?pinMark(ch[1],b,d.pin)+'#'+(d.ang===120?'=':''):'')+(x===1?'*':'');}}
  // D's wall front (latch sites: lock signal): root -> c1 -> ... -> q
  {const ch=[root,...frontB];for(let x=0;x+1<ch.length;x++){const [a,b]=side(ch[x],ch[x+1]),g=L();T[ch[x]][a]=g+'@~';T[ch[x+1]][b]=U(g)+'@';}}
  // cap (D's content): three slots around a vertex on D's inner boundary, seed on one wall cell's inner side, closing
  // side on another (as budPair's); clear of the doors' open positions
  let cap=null;
  if(capGlue){const C=capGlue,CU=gname(comp(gcode(C))),near=(v,w)=>Math.hypot(cen(v)[0]-cen(w)[0],cen(v)[1]-cen(w)[1]),cand=[];
    const sweep=[];for(const d of doors)for(let a=0;a<=d.ang;a+=10)for(const c of d.panel)sweep.push(cells[c].map(p=>rot(p,d.pin,d.dir*a*Math.PI/180)));
    for(const c of frontB.slice(0,1)){for(let f=0;f<3;f++){if(T[c][f]!=='-'||cells.some((w,x)=>x!==c&&sideV(cells[c],w)&&sideV(cells[c],w)[0]===f))continue;
      const V0=cells[c][f],V1=cells[c][(f+1)%3];if(hexr([(V0[0]+V1[0])/2,(V0[1]+V1[1])/2-dy])>RD-0.5)continue;
      for(const V of [V0,V1]){const rotV=(v,t)=>v.map(p=>rot(p,V,t)),s0=[cells[c][(f+1)%3],cells[c][f],[V0[0]+V1[0]-cells[c][(f+2)%3][0],V0[1]+V1[1]-cells[c][(f+2)%3][1]]];
        // three slots on a straight stretch of the inner boundary, two at its corner (the third is the closing wall cell)
        for(const t of [Math.PI/3,-Math.PI/3])for(const n of [3,2]){const sl=[...Array(n).keys()].map(x=>rotV(s0,x*t)),last=rotV(s0,n*t);
          const c2=frontB.find(x=>x!==c&&near(cells[x],last)<1e-6);if(c2===undefined)continue;
          if(sl.some(v=>cells.some(w=>near(v,w)<1e-6))||!doors.every(d=>sweepClear(d.panel.map(x=>cells[x]),sl,d.pin,d.dir,d.ang)))continue;
          if(sl.some(v=>hexr([cen(v)[0],cen(v)[1]-dy])>RD-1))continue;
          cand.push({c,f,c2,sl,dist:Math.min(...sweep.map(w=>Math.min(...sl.map(v=>near(w,v)))))+n});}}}}
    cand.sort((a,b)=>b.dist-a.dist);const b=cand[0];if(!b)throw Error('grownBud: no place for the cap');
    T[b.c][b.f]=C+'@';const ls=b.sl[b.sl.length-1],f2=[0,1,2].find(i=>sideV(cells[b.c2],ls)&&sideV(cells[b.c2],ls)[0]===i);T[b.c2][f2]=CU+'.';
    const types=b.sl.map((v,x)=>{const prev=x?b.sl[x-1]:cells[b.c],next=x<b.sl.length-1?b.sl[x+1]:cells[b.c2],t=['-','-','-'];t[sideV(v,prev)[0]]=CU+'@';t[sideV(v,next)[0]]=C+'@';return t.join('');});
    if(new Set(types.map(t=>canonT(t))).size!==1)throw Error('grownBud: cap slots need different types '+types);
    cap={seed:[b.c,b.f],close:[b.c2,f2],slots:b.sl,type:types[0]};}
  const types=T.map(t=>t.join('')),loose=new Set([...pP,...D]);
  return {tris:cells.map((v,x)=>({v,type:types[x],loose:loose.has(x)})),P,D,S,root,panelP:pP,panelD:pD,q,frontB,doors:doors.map(({open,...d})=>d),
    kit:D.filter(c=>c!==root).map(c=>types[c]),rootType:types[root],cap,letters:pool.slice(0,nl).join('')};}}
const canonT=t=>{const x=[...t.matchAll(TOK)].map(m=>m[0]);return [0,1,2].map(r=>[...x.slice(r),...x.slice(0,r)].join('')).sort()[0];};

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
module.exports={pocket,lidPocket,stampInstr,budPair,grownBud,lidSlot,lidClear,pocketPair,importRing,doorRingKit,cellKit,mapKit,sweepClear,kit,kitOptions,ringKit,conveyor,ring,airlock,armTypes,mirror,lattice,hexr,H};
