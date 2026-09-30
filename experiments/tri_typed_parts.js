'use strict';
// Typed parts (user: redo the grown parts with types instead of programs). Every step of a part is fixed by glue
// matching alone: a part is a series of types, each attaching by the complement of the glue its parent exposes and
// exposing the next glue on one side (rel 1 or rel 2 counter-clockwise from its attach side); a type exposing
// nothing ends the part, so the length needs no counting. Repeats (a type binding its own kind) grow until supply or
// geometry stops them.
//   arms   strand ends carry seed glues on their spare sides (first end p, last end u); the dockers carry the same
//          glues on their side edges (types Apu, Bpu, ...), so every copy's ends show them again: arms are inherited
//          through the docker types.
//   node experiments/tri_typed_parts.js arms SEED STEPS OUT [pattern]
const path=require('path');
const T=require('./tri_typed');
// types of an arm grown from seed glue `seed` by a bend pattern ('1'/'2' per step), using the letters given
function armTypes(seed,pattern,letters){const E=[seed,...letters.slice(0,pattern.length)],out=[];
  for(let k=0;k<=pattern.length;k++){const t=['-','-','-'];t[0]=T.gname(T.comp(T.gcode(E[k])));if(k<pattern.length)t[+pattern[k]]=E[k+1];out.push(t.join(''));}
  return out;}
const mirror=p=>[...p].map(c=>c==='1'?'2':'1').join('');
if(require.main===module){const [cmd,seed='1',steps='6000',out='experiments/scratch/parts.png',pat='222112']=process.argv.slice(2);
  if(cmd==='arms'){
    const A1=armTypes('p',pat,'cdeghi'),A2=armTypes('u',mirror(pat),'jkmnoq');
    console.log('arm types',A1.join(' '),'|',A2.join(' '));
    const supply={Apu:8,Bpu:8,apu:8,bpu:8,'---':24};for(const t of [...A1,...A2])supply[t]=(supply[t]||0)+(+process.env.ARMS||12);
    const {s}=T.createTypedWorld({seed:+seed,size:20,founders:[{gaps:[1,1,1,1,1],faces:'ababab',ends:'pu'}],supply});
    const t0=Date.now(),frames=[];const snap=(t)=>{const f=out.replace('.png',`_t${t}.png`);T.render(s,f,`${path.basename(out,'.png')} t=${t}: arms ${pat} / ${mirror(pat)}`);frames.push(f);};
    snap(0);
    for(let t=1;t<=+steps;t++){s.step();
      if(t%Math.max(1,+steps/6|0)===0){const c=T.typedCensus(s).filter(x=>x.n>1);
        let grown=0;for(let u=0;u<s.n;u++)if(s._roles(u).role===5)grown++;
        console.log(`t=${t} strands [${c.map(q=>q.faces+'/'+q.gaps+(q.paired?'*':'')).join(' ')}] grown=${grown} glue=${s.glueEvents||0} docks=${s.dockEvents||0} releases=${s.releaseEvents||0} ${((Date.now()-t0)/t).toFixed(1)}ms/step`);}
      if(t%Math.max(1,+steps/3|0)===0)snap(t);}
    require('child_process').execFileSync('node',['tools/montage.js',out,'4',`Typed arms from strand ends (${pat} / ${mirror(pat)}), heritable through docker types`,...frames]);}
}
module.exports={armTypes,mirror};
