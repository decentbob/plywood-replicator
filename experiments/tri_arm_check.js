'use strict';
// Check end arms in a running world: for every released complete strand, walk both arms (growth bonds), compare each
// arm triangle with the lattice plan (rigid fit on the strand), and draw organisms alone (strand + arms).
//   node experiments/tri_arm_check.js SEED STEPS PATTERN GAPS OUTSTEM [params-json]
const {createTriWorld,triCensus,render,rolesFromGaps}=require('./tri_chain'),{grow}=require('./tri_arm_design'),{band}=require('./triangle_alphabet_figure');
const [seed,steps,pat,g,stem,pj]=process.argv.slice(2),gaps=[...g].map(Number),mir=[...pat].map(c=>c==='1'?'2':'1').join('');
const {s}=createTriWorld({seed:+seed,gaps,free:120,size:24,params:{grow:{E:'arm'+pat},caps:true,pFray:0.0002,triUndock:0.0003,pDissolve:0.002,...JSON.parse(pj||'{}')}});
for(let t=0;t<+steps;t++)s.step();
const cen=v=>[(v[0][0]+v[1][0]+v[2][0])/3,(v[0][1]+v[1][1]+v[2][1])/3],avg=A=>[A.reduce((a,p)=>a+p[0],0)/A.length,A.reduce((a,p)=>a+p[1],0)/A.length];
const walk=root=>{const out=[];let x=root;for(let k=0;k<20;k++){let nx=-1;for(let i=0;i<3;i++){const q=s.bond[x*4+i];if(q>=0&&(s.bkind[x*4+i]===5||s.bkind[x*4+i]===7)&&s.gstate[q>>2])nx=q>>2;}if(nx<0)break;out.push(nx);x=nx;}return out;};
const strands=triCensus(s).filter(q=>!q.paired&&q.n>=5);let full=0,k=0;const dev=[];
for(const q of strands){
  const tris=band(rolesFromGaps([...q.gaps].map(Number)));if(tris.length!==q.n)continue;
  const P=tris.map(x=>cen(x.v)),Q=q.units.map(u=>[s.px[u],s.py[u]]),mp=avg(P),u0=q.units[0];
  const Qr=Q.map(p=>[s._dx(p[0]-Q[0][0]),s._dy(p[1]-Q[0][1])]),mq=avg(Qr);
  let A=0,B=0;P.forEach((p,i)=>{const x=p[0]-mp[0],y=p[1]-mp[1],u=Qr[i][0]-mq[0],v=Qr[i][1]-mq[1];A+=x*u+y*v;B+=x*v-y*u;});
  // the physical strand may be the mirror image of the drawing: try both and keep the better fit
  const fit=(sg)=>{let A=0,B=0;P.forEach((p,i)=>{const x=p[0]-mp[0],y=sg*(p[1]-mp[1]),u=Qr[i][0]-mq[0],v=Qr[i][1]-mq[1];A+=x*u+y*v;B+=x*v-y*u;});
    const th=Math.atan2(B,A),c=Math.cos(th),sn=Math.sin(th);return p=>{const x=p[0]-mp[0],y=sg*(p[1]-mp[1]);return [Q[0][0]+mq[0]+c*x-sn*y,Q[0][1]+mq[1]+sn*x+c*y];};};
  const err=m=>Math.max(...P.map((p,i)=>{const r=m(p);return Math.hypot(s._dx(Q[i][0]-r[0]),s._dy(Q[i][1]-r[1]));}));
  const m1=fit(1),m2=fit(-1),map=err(m1)<=err(m2)?m1:m2;
  const arms=[[true,pat],[false,mir]].map(([first,pp])=>{const plan=grow(first?tris[0]:tris[tris.length-1],first,pp).map(v=>map(cen(v))),sim=walk(first?q.units[0]:q.units[q.units.length-1]);
    return {len:sim.length,want:plan.length,d:sim.map((u,i)=>Math.hypot(s._dx(s.px[u]-plan[i][0]),s._dy(s.py[u]-plan[i][1])))};});
  const ok=arms.every(a=>a.len===a.want);if(ok)full++;for(const a of arms)dev.push(...a.d);
  console.log(`strand ${q.gaps}: arms ${arms.map(a=>a.len+'/'+a.want).join(' ')}, worst arm deviation ${Math.max(0,...arms.flatMap(a=>a.d)).toFixed(2)}`);
  if(k<4){const units=[...q.units,...walk(q.units[0]),...walk(q.units[q.units.length-1])];render(s,`${stem}_${k++}.png`,`organism ${q.gaps} with arms ${pat}/${mir}: ${arms.map(a=>a.len+'/'+a.want).join(', ')} triangles`,{units,radius:5,only:true});}
}
console.log(`released strands ${strands.length}, with both arms complete ${full}, mean arm-triangle deviation ${(dev.reduce((a,b)=>a+b,0)/Math.max(1,dev.length)).toFixed(2)}`);
