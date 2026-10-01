'use strict';
// Machines from driven hinges (tri_typed.js). Prepared structures (labelled starting conditions) of typed triangles.
//   conveyor  two hatches pass a block along: hatch 1 (hand-off '^') catches it and swings 60 degrees, where the
//             block meets hatch 2's catch side; the block is then bonded twice, so hatch 1 lets go and swings back,
//             and hatch 2 (drop '!') swings on and drops it. The block travels around the frame's corner.
//   gate      a closed ring membrane (ROWS=1 or 2 cell rows) with a door: a two-triangle panel latched into the wall
//             on one side and hinged on the other. A key (ggg) binding the panel's outer face (trigger G*) unlatches it
//             and the panel swings 120 degrees out, carrying the key, opening a passage (with two rows, into a chamber
//             left open to the inside). Tracers inside and outside are counted. (Walls leaked at the default jostle
//             until the no-tunnelling fix in TriSim; SIGMA still sets the jostle.)
//   node experiments/tri_machines.js conveyor SEED STEPS OUT   |   [ROWS=2 SIGMA=0.1] gate SEED STEPS OUT [keys]
const path=require('path'),{execFileSync}=require('child_process');
const T=require('./tri_typed');
const H=Math.sqrt(3)/2;

// Conveyor. Hatch 1 pinned at V=(0,0) against P1, hatch 2 pinned at V2=(-0.5,-H) against P2; a frame fan joins P1
// and P2 around the corner (1,0) without touching the catch sites (upper left C0, left C1).
function conveyor(){return [
  {v:[[0,0],[0.5,H],[-0.5,H]],type:'h<^-A*',loose:true},        // hatch 1: hinge (pin V), top, catch A (faces C0)
  {v:[[-0.5,-H],[0.5,-H],[0,0]],type:'h<!-A*',loose:true},      // hatch 2: hinge (pin V2), third side, catch A (faces C1)
  {v:[[0,0],[1,0],[0.5,H]],type:'--H'},                         // P1
  {v:[[-0.5,-H],[0,-2*H],[0.5,-H]],type:'--H'},                 // P2
  // frame around (1,0); the cell (0,0),(0.5,-H),(1,0) beside hatch 2's third side stays empty: a triangle turning
  // about a corner bulges 13% past the edge it swings toward, so a flap needs free space there to close
  {v:[[1,0],[1.5,H],[0.5,H]],type:'---'},{v:[[1,0],[2,0],[1.5,H]],type:'---'},{v:[[1,0],[1.5,-H],[2,0]],type:'---'},
  {v:[[0.5,-H],[1.5,-H],[1,0]],type:'---'},{v:[[0.5,-H],[1,-2*H],[1.5,-H]],type:'---'},{v:[[0.5,-H],[0,-2*H],[1,-2*H]],type:'---'},
];}

// Ring membrane: lattice triangles whose centroid lies in the hexagon of side R but not in that of side R-1 (one row).
// Door (bottom side): an outer cell U and the inner cell D to its right, welded (w/W) into one panel. D is hinged to
// the next outer cell at the panel's bottom corner; U is latched (L~) to the inner cell on its left, so the closed door
// keeps the ring whole. U's outer side is the trigger (G*): a key (ggg) binding it unlatches the door, and the panel
// swings 120 degrees outward carrying the key, opening a two-cell passage.
function ring(R=4,rows=1){
  const lat=[];for(let i=-2*R-2;i<=2*R+2;i++)for(let j=-2*R-2;j<=2*R+2;j++){const b=[i+j/2,j*H];
    lat.push([b,[b[0]+1,b[1]],[b[0]+0.5,b[1]+H]],[[b[0]+1,b[1]],[b[0]+1.5,b[1]+H],[b[0]+0.5,b[1]+H]]);}
  const hexr=p=>Math.max(...[0,1,2,3,4,5].map(k=>{const a=Math.PI/6+k*Math.PI/3;return (p[0]*Math.cos(a)+p[1]*Math.sin(a))/H;}));
  const cen=v=>[(v[0][0]+v[1][0]+v[2][0])/3,(v[0][1]+v[1][1]+v[2][1])/3],same=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1])<1e-6;
  let cells=lat.filter(v=>{const r=hexr(cen(v));return r<R&&r>R-rows;});
  const onY=(v,y)=>v.filter(p=>Math.abs(p[1]-y)<1e-6).length;
  const D=cells.filter(v=>onY(v,-(R-1)*H)===2&&cen(v)[1]<-(R-1)*H).sort((a,b)=>Math.abs(cen(a)[0])-Math.abs(cen(b)[0]))[0];
  const pin=D.find(p=>Math.abs(p[1]+R*H)<1e-6),[q,r]=D.filter(p=>!same(p,pin)).sort((a,b)=>b[0]-a[0]);
  const U=cells.find(v=>onY(v,-R*H)===2&&v.some(p=>same(p,pin))&&v.some(p=>same(p,r)));
  const Ur=cells.find(v=>onY(v,-R*H)===2&&v.some(p=>same(p,pin))&&v.some(p=>same(p,q)));
  const a=U.find(p=>!same(p,pin)&&!same(p,r)),Dl=cells.find(v=>v!==U&&v.some(p=>same(p,a))&&v.some(p=>same(p,r)));
  // two rows: the inner-row cell above the door and its right neighbour are left out, a chamber open to the inside
  if(rows>1){const X=cells.find(v=>v.some(p=>same(p,q))&&v.some(p=>same(p,r))&&v!==D);
    const top=X.find(p=>!same(p,q)&&!same(p,r)),Yr=cells.find(v=>v!==X&&v.some(p=>same(p,q))&&v.some(p=>same(p,top)));
    cells=cells.filter(v=>v!==X&&v!==Yr);}
  const edgeType=(v,x,y,g)=>{const i=[0,1,2].find(k=>same(v[k],x)&&same(v[(k+1)%3],y));return [0,1,2].map(k=>k===i?g:'-').join('');};
  const tris=[{v:[pin,q,r],type:'h<-w',loose:true,role:'door'},{v:[a,pin,r],type:'G*WL~',loose:true,role:'door'}];
  for(const v of cells){if(v===D||v===U)continue;const t={v,type:'---'};
    if(v===Ur)t.type=edgeType(v,q,pin,'H');if(v===Dl)t.type=edgeType(v,a,r,'l');tris.push(t);}
  return {tris,R};
}

// Airlock (user: a double lock, one door closed while the other is open, so the ring never opens into a C). The ring
// is one row (band R). Below its bottom side a lock section adds two rows (bands R+1, R+2) in a small window:
//   inner door I: the ring-row panel U1 (hinged, pin at its top corner on the inner boundary, swings inward) + D1
//                 (welded, latched to the ring on its right); trigger G on U1's bottom face, which faces the chamber;
//   chamber:      the two band R+1 cells under U1 (c1) and beside it (c2), always empty;
//   outer door O: the band R+2 panel U2 (latched on its left, trigger G on its outer face) + D2 (hinged on its
//                 right, pin at its bottom corner on the lock's outer boundary, swings outward).
// Both are pulse doors: a key (ggg) on the trigger opens the door, is let go at once, and the door swings 120
// degrees, back again, and re-latches. A key outside opens O; a key that reaches the chamber opens I. While one door
// is open the other is latched, so the ring always has a closed load path.
function airlock(R=4,win=2.5){
  const lat=[];for(let i=-2*R-6;i<=2*R+6;i++)for(let j=-2*R-6;j<=2*R+6;j++){const b=[i+j/2,j*H];
    lat.push([b,[b[0]+1,b[1]],[b[0]+0.5,b[1]+H]],[[b[0]+1,b[1]],[b[0]+1.5,b[1]+H],[b[0]+0.5,b[1]+H]]);}
  const hexr=p=>Math.max(...[0,1,2,3,4,5].map(k=>{const a=Math.PI/6+k*Math.PI/3;return (p[0]*Math.cos(a)+p[1]*Math.sin(a))/H;}));
  const cen=v=>[(v[0][0]+v[1][0]+v[2][0])/3,(v[0][1]+v[1][1]+v[2][1])/3],same=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1])<1e-6;
  const has=(v,...ps)=>ps.every(p=>v.some(x=>same(x,p))),add=(p,d)=>[p[0]+d[0],p[1]+d[1]];
  const ring=lat.filter(v=>{const r=hexr(cen(v));return r<R&&r>R-1;});
  const lock=lat.filter(v=>{const c=cen(v),r=hexr(c);return r>R&&r<R+2&&c[1]<-R*H&&Math.abs(c[0])<win;});
  // inner door: D1 = ring down cell (top edge on the inner line y=-(R-1)H) nearest x=0, U1 = the up cell left of it
  const D1=ring.filter(v=>v.filter(p=>Math.abs(p[1]+(R-1)*H)<1e-6).length===2&&cen(v)[1]<-(R-1)*H).sort((a,b)=>Math.abs(cen(a)[0])-Math.abs(cen(b)[0]))[0];
  const p1=D1.find(p=>Math.abs(p[1]+R*H)<1e-6),[q1,r1]=D1.filter(p=>!same(p,p1)).sort((a,b)=>b[0]-a[0]),a1=add(p1,[-1,0]);
  const U1=ring.find(v=>has(v,a1,p1,r1)),Dl1=ring.find(v=>v!==U1&&has(v,a1,r1)),Ur1=ring.find(v=>v!==D1&&has(v,p1,q1));
  // chamber: c1 under U1, c2 right of c1; outer door below c2
  const m=add(p1,[-0.5,-H]),c1=lock.find(v=>has(v,a1,p1,m)),c2=lock.find(v=>has(v,m,p1,add(m,[1,0])));
  const p2=add(m,[0.5,-H]),q2=add(m,[1,0]),a2=add(p2,[-1,0]);
  const D2=lock.find(v=>has(v,m,q2,p2)),U2=lock.find(v=>has(v,a2,p2,m)),Dl2=lock.find(v=>v!==U2&&has(v,a2,m)),Ur2=lock.find(v=>v!==D2&&has(v,p2,q2));
  if(![D1,U1,Dl1,Ur1,c1,c2,D2,U2,Dl2,Ur2].every(Boolean))throw Error('airlock geometry');
  const edge=(v,x,y,g)=>{const i=[0,1,2].find(k=>same(v[k],x)&&same(v[(k+1)%3],y));return [0,1,2].map(k=>k===i?g:'-').join('');};
  const tris=[
    {v:[a1,p1,r1],type:'G*#Wh<#',loose:true,role:'inner door'},     // U1: bottom trigger (chamber), weld to D1, hinge to Dl1 (pin r1)
    {v:[p1,q1,r1],type:'L~-w',loose:true,role:'inner door'},        // D1: latch to Ur1, top (inside), weld
    {v:[a2,p2,m],type:'G*#WL~',loose:true,role:'outer door'},        // U2: outer trigger, weld to D2, latch to Dl2
    {v:[p2,q2,m],type:'h<#-w',loose:true,role:'outer door'},         // D2: hinge to Ur2 (pin p2), top (chamber), weld
  ];
  for(const v of [...ring,...lock]){if([U1,D1,U2,D2,c1,c2].includes(v))continue;const t={v,type:'---'};
    if(v===Dl1)t.type=edge(v,a1,r1,'H');if(v===Ur1)t.type=edge(v,q1,p1,'l');
    if(v===Dl2)t.type=edge(v,a2,m,'l');if(v===Ur2)t.type=edge(v,q2,p2,'H');tris.push(t);}
  return {tris,R};
}

const shots=[];
function snap(s,f,title,focus){T.render(s,f,title,focus,true);shots.push(f);}
function montage(out,title,cols=4){execFileSync('node',['tools/montage.js',out,String(cols),title,...shots]);}

if(require.main===module){const [cmd,seed='1',steps='3000',out='experiments/scratch/machine.png',extra]=process.argv.slice(2);
  if(cmd==='conveyor'){
    const {s,structures}=T.createTypedWorld({seed:+seed,size:12,structures:[{tris:conveyor(),x:6,y:6}],supply:{'aaa':10,'---':14}});
    const U=structures[0],h1=U[0],h2=U[1],focus={units:U,radius:2.8,align:{u:U[2],a0:s._ang(U[2])}},plan=new Map();let n=0;
    snap(s,out.replace('.png','_t0.png'),'t=0: hatch 1 (top) and hatch 2 (bottom) waiting',focus);
    for(let t=1;t<=+steps;t++){const c1=s.bond[h1*4+2]>=0,c2=s.bond[h2*4+2]>=0,dr=s.drops||0;s.step();const d1=s.bond[h1*4+2]>=0,d2=s.bond[h2*4+2]>=0;
      // the first cycle that starts with hatch 1: frames at its catch, hand-off, hatch 2's drop, and after
      if(n===0&&!c1&&d1){n=1;plan.set(t,'hatch 1 catches');plan.set(t+8,'hatch 1 swinging');}
      if(n===1&&c1&&!d1&&d2){n=2;plan.set(t,'hand-off: hatch 1 lets go');plan.set(t+8,'hatch 2 swinging, hatch 1 back');}
      if(n===2&&(s.drops||0)>dr){n=3;plan.set(t,'hatch 2 drops');plan.set(t+12,'hatch 2 back');plan.set(t+40,'both waiting');}
      if(plan.has(t))snap(s,out.replace('.png',`_t${t}.png`),`t=${t} ${plan.get(t)}`,focus);
      if(t%Math.max(1,+steps/10|0)===0)console.log(`t=${t} catches=${s.glueEvents||0} closures=${s.closeGlue||0} handoffs=${s.handoffs||0} drops=${s.drops||0}`);}
    montage(out,'Conveyor: hatch 1 catches aaa and swings, hands off to hatch 2, which swings on and drops it');}
  if(cmd==='gate'){
    const keys=extra===undefined?4:+extra,rows=+(process.env.ROWS||1),R=4+rows-1,{tris}=ring(R,rows),size=18+2*(rows-1),c=size/2;
    const {s,structures}=T.createTypedWorld({seed:+seed,size,structures:[{tris,x:c,y:c}],supply:{'---':24,'ggg':keys},params:{hingeAngle:2*Math.PI/3,...(process.env.SIGMA?{sigma:+process.env.SIGMA}:{}),...(process.env.RATE?{hingeRate:+process.env.RATE}:{})}});
    const U=structures[0],door=U[1],ringSet=new Set(U),free=[...Array(s.n).keys()].filter(u=>!ringSet.has(u));
    const tracers=free.filter(u=>T.typeName(s,u)==='---');
    // ring centre (read-only) and a tracer's place: inside (< inner apothem), outside (> outer circumradius) or in the wall
    const centre=()=>{let x=0,y=0;const u0=U[1];for(const u of U){x+=s._dx(s.px[u]-s.px[u0]);y+=s._dy(s.py[u]-s.py[u0]);}return [s.px[u0]+x/U.length,s.py[u0]+y/U.length];};
    const where=u=>{const [x,y]=centre(),d=Math.hypot(s._dx(s.px[u]-x),s._dy(s.py[u]-y));return d<(R-rows)*H-0.3?'in':d>R+0.2?'out':'wall';};
    // prepared start: half the tracers inside the ring, the rest and the keys outside (placed without overlap)
    const {overlap}=require('./half_cell_geometry'),placed=[...U];
    free.forEach((u,k)=>{const inside=tracers.indexOf(u)>=0&&tracers.indexOf(u)<12;let ok=false;
      for(let a=0;a<5000&&!ok;a++){const ang=2*Math.PI*s.rng(),r=inside?(R-rows)*H-0.6-1.6*s.rng():R+0.8+(size/2-R-1)*s.rng();
        s.px[u]=s._wx(c+r*Math.cos(ang));s.py[u]=s._wy(c+r*Math.sin(ang));s.pa[u]=2*Math.PI*s.rng();s._resetShape(u);
        ok=placed.every(v=>{const dx=s._dx(s.px[v]-s.px[u]),dy=s._dy(s.py[v]-s.py[u]);return Math.hypot(dx,dy)>2||overlap(s._outline(u),s._outline(v,dx,dy))<1e-10;});}
      if(!ok)throw Error('could not place');placed.push(u);});
    const focus={units:U,radius:R+1.5,align:{u:U[2],a0:s._ang(U[2])}},count=()=>tracers.filter(u=>where(u)==='in').length;
    const cross0=new Map(tracers.map(u=>[u,where(u)]));let crossings=0;const log=[];
    snap(s,out.replace('.png','_t0.png'),`t=0: ${keys} keys, ${count()} tracers inside`,focus);
    for(let t=1;t<=+steps;t++){s.step();
      for(const u of tracers){const w=where(u);if(w!=='wall'&&w!==cross0.get(u)){crossings++;cross0.set(u,w);}}
      if(t%Math.max(1,+steps/10|0)===0){const line=`t=${t} inside=${count()} crossings=${crossings} door ${s.bond[door*4]>=0?'open (key bound)':'closed'}`;console.log(line);log.push(line);}
      if(t%Math.max(1,+steps/3|0)===0)snap(s,out.replace('.png',`_t${t}.png`),`t=${t}: ${keys} keys, ${count()} inside, ${crossings} crossings, door ${s.bond[door*4]>=0?'open':'closed'}`,focus);}
    montage(out,`Gated ring membrane (${rows} rows), ${keys} keys (ggg): the door unlatches and swings 120 degrees out when a key binds its outer face`);}
  if(cmd==='airlock'){
    const keys=extra===undefined?12:+extra,R=4,{tris}=airlock(R),size=20,c=size/2;
    const {s,structures}=T.createTypedWorld({seed:+seed,size,structures:[{tris,x:c,y:c}],supply:{'---':24,'ggg':keys},params:{hingeAngle:2*Math.PI/3,...(process.env.SIGMA?{sigma:+process.env.SIGMA}:{}),...(process.env.RATE?{hingeRate:+process.env.RATE}:{})}});
    const U=structures[0],[U1,D1,U2,D2]=U,ringSet=new Set(U),free=[...Array(s.n).keys()].filter(u=>!ringSet.has(u));
    const tracers=free.filter(u=>T.typeName(s,u)==='---'),keyUnits=free.filter(u=>T.typeName(s,u)==='ggg');
    // ring centre: the structure was built around (c, c); follow it through a reference cell's position and turn
    const ref=U[6],rx0=c-s.px[ref],ry0=c-s.py[ref],ra0=s._ang(ref);
    const centre=()=>{const d=s._ang(ref)-ra0,cs=Math.cos(d),sn=Math.sin(d);return [s.px[ref]+cs*rx0-sn*ry0,s.py[ref]+sn*rx0+cs*ry0];};
    const where=u=>{const [x,y]=centre(),d=Math.hypot(s._dx(s.px[u]-x),s._dy(s.py[u]-y));return d<(R-1)*H-0.3?'in':d>R+2.2?'out':'wall';};
    const {overlap}=require('./half_cell_geometry'),placed=[...U];
    free.forEach(u=>{const inside=tracers.indexOf(u)>=0&&tracers.indexOf(u)<12;let ok=false;
      for(let a=0;a<5000&&!ok;a++){const ang=2*Math.PI*s.rng(),r=inside?(R-1)*H-0.6-1.6*s.rng():R+2.6+(size/2-R-3)*s.rng();
        s.px[u]=s._wx(c+r*Math.cos(ang));s.py[u]=s._wy(c+r*Math.sin(ang));s.pa[u]=2*Math.PI*s.rng();s._resetShape(u);
        ok=placed.every(v=>{const dx=s._dx(s.px[v]-s.px[u]),dy=s._dy(s.py[v]-s.py[u]);return Math.hypot(dx,dy)>2||overlap(s._outline(u),s._outline(v,dx,dy))<1e-10;});}
      if(!ok)throw Error('could not place');placed.push(u);});
    // integrity: the widest gap across each door's latch (latch partners' distance change)
    // integrity: across each doorway, the distance between the latch partner and the hinge partner (both wall cells)
    const partner=(u,i)=>s.bond[u*4+i]>>2,li1=[0,1,2].find(i=>s.ltc[D1*3+i]),li2=[0,1,2].find(i=>s.ltc[U2*3+i]),L1=partner(D1,li1),L2=partner(U2,li2);
    const H1=partner(U1,[0,1,2].find(i=>s.hing[U1*3+i])),H2=partner(D2,[0,1,2].find(i=>s.hing[D2*3+i]));
    const dist=(a,b)=>Math.hypot(s._dx(s.px[a]-s.px[b]),s._dy(s.py[a]-s.py[b])),g1=dist(L1,H1),g2=dist(L2,H2);let gap1=0,gap2=0,bothOpen=0;
    const focus={units:U,radius:R+3,align:{u:U[6],a0:s._ang(U[6])}},kin=()=>keyUnits.filter(u=>where(u)==='in').length,tin=()=>tracers.filter(u=>where(u)==='in').length;
    const side=new Map(tracers.map(u=>[u,where(u)]));let crossings=0;
    snap(s,out.replace('.png','_t0.png'),`t=0: ${keys} keys outside, ${tin()} tracers inside`,focus);
    for(let t=1;t<=+steps;t++){s.step();
      const o1=s.bond[D1*4+li1]<0,o2=s.bond[U2*4+li2]<0;if(o1&&o2)bothOpen++;
      gap1=Math.max(gap1,Math.abs(dist(L1,H1)-g1));gap2=Math.max(gap2,Math.abs(dist(L2,H2)-g2));
      for(const u of tracers){const w=where(u);if(w!=='wall'&&w!==side.get(u)){crossings++;side.set(u,w);}}
      if(t%Math.max(1,+steps/10|0)===0)console.log(`t=${t} keys inside=${kin()} tracers inside=${tin()} crossings=${crossings} pulses=${s.pulses||0} steps with both doors unlatched=${bothOpen} largest doorway strain inner ${gap1.toFixed(2)} outer ${gap2.toFixed(2)}`);
      if(t%Math.max(1,+steps/3|0)===0)snap(s,out.replace('.png',`_t${t}.png`),`t=${t}: ${kin()} keys inside, ${tin()} tracers inside, ${crossings} crossings, ${s.pulses||0} door pulses`,focus);}
    montage(out,`Airlock (user: double lock): a key opens the outer door, a key in the chamber opens the inner door; pulse doors re-latch`);}
  if(cmd==='factory'){
    // a casting pocket makes the dockers a replicator needs: blanks xxx are cast into A-- (the docker for face a)
    const withPocket=extra!=='0',size=20;
    const np=+(process.env.POCKETS||1),structures=withPocket?[{tris:T.pocket('-A-','X'),x:5,y:5},{tris:T.pocket('-A-','X'),x:5,y:14,rot:Math.PI}].slice(0,np):[];
    const {s,structures:st}=T.createTypedWorld({seed:+seed,size,founders:[{gaps:[1,1,1,1],faces:'aaaaa',x:13,y:13}],structures,supply:{'xxx':+(process.env.BLANKS||30),'---':40}});
    const t0=Date.now();const snapF=t=>snap(s,out.replace('.png',`_t${t}.png`),`${path.basename(out,'.png')} t=${t}: ${withPocket?'pocket':'no pocket'}, casts ${s.castEvents||0}`,null);
    snapF(0);
    for(let t=1;t<=+steps;t++){s.step();
      if(t%Math.max(1,+steps/10|0)===0){const c=T.typedCensus(s).filter(x=>x.n>1),tc=T.typeCount(s);
        console.log(`t=${t} casts=${s.castEvents||0} free A-- ${tc[T.canon('A--')]||0} xxx ${tc['xxx']||0} strands [${c.map(q=>q.faces+'/'+q.gaps+(q.paired?'*':'')).join(' ')}] docks=${s.dockEvents||0} releases=${s.releaseEvents||0} ${((Date.now()-t0)/t).toFixed(1)}ms/step`);}
      if(t%Math.max(1,+steps/3|0)===0)snapF(t);}
    montage(out,`Factory: a casting pocket turns blanks (xxx) into dockers (A--) for the chain aaaaa (${withPocket?'with pocket':'control, no pocket'})`);}
}
module.exports={conveyor,ring,airlock};
