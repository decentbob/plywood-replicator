'use strict';
// Verify copies geometrically: for every released complete strand, compare the turn angles of its centroid path with
// the turns its roles demand (F/B pattern -> +-60 degrees), measure the worst bond pin gap, and draw each strand alone.
//   node experiments/tri_verify.js SEED STEPS GAPS OUTSTEM
const {createTriWorld,triCensus,render}=require('./tri_chain'),{band,rolesFromGaps}=Object.assign({},require('./triangle_alphabet_figure'),require('./tri_chain'));
const {NV}=require('../src/sim');
const [seed,steps,g,stem]=process.argv.slice(2),gaps=[...g].map(c=>c==='m'?'m':+c);
const {s,founder}=createTriWorld({seed:+seed,gaps,free:120,size:22});
for(let t=0;t<+steps;t++)s.step();
const turns=units=>{const c=units.map(u=>[s.px[u],s.py[u]]),a=[];for(let k=1;k<c.length;k++)a.push(Math.atan2(s._dy(c[k][1]-c[k-1][1]),s._dx(c[k][0]-c[k-1][0])));
  return a.slice(1).map((x,k)=>{let d=(x-a[k])*180/Math.PI;return ((d+540)%360)-180;});};
const want=roles=>{const tris=band(roles.map(x=>x==='M'?'B':x)),c=tris.map(t=>[(t.v[0][0]+t.v[1][0]+t.v[2][0])/3,(t.v[0][1]+t.v[1][1]+t.v[2][1])/3]),a=[];
  for(let k=1;k<c.length;k++)a.push(Math.atan2(c[k][1]-c[k-1][1],c[k][0]-c[k-1][0]));return a.slice(1).map((x,k)=>{let d=(x-a[k])*180/Math.PI;return ((d+540)%360)-180;});};
const pinGap=units=>{let m=0;for(const u of units)for(let i=0;i<3;i++){const q=s.bond[u*4+i];if(q<0)continue;const v=q>>2,j=q&3,dx=s._dx(s.px[v]-s.px[u]),dy=s._dy(s.py[v]-s.py[u]);
  for(const [a,b] of [[u*NV+i,v*NV+(j+1)%3],[u*NV+(i+1)%3,v*NV+j]])m=Math.max(m,Math.hypot(dx+s.ox[b]-s.ox[a],dy+s.oy[b]-s.oy[a]));}return m;};
const strands=triCensus(s).filter(q=>!q.paired&&q.n>=5);let k=0;
for(const q of strands){
  const roles=q.units.map(u=>{const r=s._roles(u).role;return r===1?'F':'B';}),w=want(roles),h=turns(q.units);
  // the physical chain may be mirrored relative to the drawing convention: compare up to a global sign
  const dev=Math.min(Math.max(...w.map((x,i)=>Math.abs(x-h[i]))),Math.max(...w.map((x,i)=>Math.abs(-x-h[i]))));
  const tag=q.units.includes(founder[0])?'founder':'copy';
  console.log(`${tag} gaps ${q.gaps} n ${q.n}: worst turn deviation ${dev.toFixed(1)} deg, worst pin gap ${pinGap(q.units).toFixed(3)}; turns ${h.map(x=>x.toFixed(0)).join(' ')}`);
  if(k<6)render(s,`${stem}_${k++}.png`,`${tag} ${q.gaps} (${q.n} triangles), worst turn deviation ${dev.toFixed(0)} deg`,{units:q.units,radius:4.5,only:true});
}
