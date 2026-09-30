'use strict';
// Gallery of grown parts on triangle-only chains: one founder, different growth programs per site type; each panel shows
// the founder and its first released copy (zoomed) once the copy has grown its own parts.
//   node experiments/tri_gallery.js OUTSTEM GAPS SEED "Z:hex" "Z:plate" "Z:spike" "R:fan,Z:hex" ...
const {createTriWorld,triCensus,render,TFACE}=require('./tri_chain');
const [stem,g,seed,...cfgs]=process.argv.slice(2),gaps=[...g].map(Number),panels=[];
for(const [k,cf] of cfgs.entries()){
  const grow=Object.fromEntries(cf.split(',').map(x=>x.split(':')));
  const {s,founder}=createTriWorld({seed:+seed+k,gaps,free:130,size:22,params:{grow}}),F=new Set(founder);
  let copy=null,tRel=0,t=0;
  const grownOn=units=>{const seen=new Set(),todo=[...units];while(todo.length){const u=todo.pop();for(let i=0;i<3;i++){const q=s.bond[u*4+i],kd=s.bkind[u*4+i];
      if(q>=0&&kd>=5&&!seen.has(q>>2)&&!units.includes(q>>2)){seen.add(q>>2);todo.push(q>>2);}}}return seen.size;};
  for(t=1;t<=12000;t++){s.step();
    if(!copy){const c=triCensus(s).find(q=>!q.paired&&q.n===founder.length&&!F.has(q.units[0]));if(c){copy=c.units;tRel=t;}}
    else if(grownOn(copy)>=grownOn(founder)&&t>tRel+200||t>tRel+3000)break;}
  const c=copy?triCensus(s).find(q=>q.units.includes(copy[0])):null;
  const title=`${cf}: founder ${g}${c?`, copy ${c.gaps}`:''}, t=${t}, parts ${grownOn(founder)} + ${c?grownOn(c.units):0} triangles`;
  const out=`${stem}_${k}.png`;render(s,out,title,{units:c?[...founder,...c.units]:founder,radius:7});panels.push(out);console.log(title);
}
require('child_process').execFileSync('node',[require('path').join(__dirname,'../tools/montage.js'),`${stem}.png`,'2',`Grown parts on a triangle-only chain (founder ${g}); each panel: founder and its first copy`,...panels],{stdio:'inherit'});
