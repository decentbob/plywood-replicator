'use strict';
// Frames of the founder's first copy on a triangle-only chain (zoomed): start, half built, nearly closed, released.
//   node experiments/tri_frames.js SEED GAPS OUTSTEM [free] [size]
const {createTriWorld,triCensus,render,TFACE}=require('./tri_chain');
const [seed,g,stem,free,size]=process.argv.slice(2),gaps=[...g].map(Number);
const {s,founder}=createTriWorld({seed:+seed,gaps,free:+(free||120),size:+(size||22)}),F=new Set(founder);
const shot=(tag,title,units=founder,r=4.4)=>render(s,`${stem}_${tag}.png`,title,{units,radius:r});
shot('a',`founder ${g}: orange = face triangles (orange face edge), brown = hidden backs`);
// copy triangles docked on the founder (their face partner is a founder triangle)
const onFounder=()=>{const out=[];for(const u of founder)for(let i=0;i<3;i++)if(s.bkind[u*4+i]===TFACE)out.push(s.bond[u*4+i]>>2);return out;};
const nFaces=founder.filter(u=>s._roles(u).role===1).length;
let stage=0,copy=null,tRel=0;
for(let t=1;t<=30000&&stage<4;t++){s.step();
  const d=onFounder();
  if(stage===0&&d.length>=Math.ceil(nFaces/2)){shot('b',`t=${t}: free triangles dock on faces (light teal), fills close the gaps (dark teal)`);stage=1;}
  if(stage===1){  // all copy triangles connected (chain bonds) to those docked on the founder
    const seen=new Set(d),todo=[...d];while(todo.length){const u=todo.pop();for(let i=0;i<3;i++){const q=s.bond[u*4+i],k=s.bkind[u*4+i];
      if(q>=0&&(k===1||k===2)&&!seen.has(q>>2)){seen.add(q>>2);todo.push(q>>2);}}}
    if(seen.size>=founder.length-2){shot('c',`t=${t}: copy nearly closed (${seen.size} of ${founder.length} triangles)`);stage=2;copy=[...seen];}}
  if(stage===2&&onFounder().length===0){const c=triCensus(s).find(q=>q.units.includes(copy[0]));if(c&&!c.paired){copy=c.units;tRel=t;stage=3;}}
  if(stage===3&&t>=tRel+300){const c=triCensus(s).find(q=>q.units.includes(copy[0]));
    shot('d',`t=${t}: released copy ${c.gaps} (${c.n} triangles) beside the founder ${g}`,[...founder,...c.units],6);stage=4;}}
console.log('stages',stage);
