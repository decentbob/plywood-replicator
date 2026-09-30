'use strict';
// Competition demo: two founders of equal length in one world, one whose Z grows a part, one plain; optional damage
// field (grown parts shade) and fraying (recycling). Reports complete free strands per gap sequence over time.
//   node experiments/tri_compete.js SEED STEPS OUTSTEM PARAMS_JSON GAPS1 GAPS2 ...
const {createTriWorld,triCensus,render}=require('./tri_chain');
const [seed,steps,stem,pj,...gs]=process.argv.slice(2),params=JSON.parse(pj),gaps=gs.map(g=>[...g].filter(c=>c!=='e').map(c=>c==='m'?'m':+c));
const comp=g=>[...g].reverse().map(c=>c==='m'||c==='e'?c:2-(+c)).join(''),names=gs.map(g=>comp(g)===g?[g]:[g,comp(g)]);
const {s}=createTriWorld({seed:+seed,gaps,free:+(params.free||180),size:+(params.size||26),params});
const t0=Date.now(),rows=[];
for(let t=1;t<=+steps;t++){s.step();
  if(t%(+steps/10|0)===0){const c=triCensus(s).filter(q=>!q.paired),cnt={};for(const q of c)cnt[q.gaps]=(cnt[q.gaps]||0)+1;
    const known=names.flat(),line=`t=${t} ${names.map(ns=>ns.join('|')+':'+ns.reduce((a,g)=>a+(cnt[g]||0),0)).join(' ')} fragments:${c.filter(q=>!known.includes(q.gaps)).length} breaks=${s.fieldBreaks||0} fray=${s.frayEvents||0} ${((Date.now()-t0)/t).toFixed(0)}ms/step`;
    console.log(line);rows.push(line);}}
render(s,`${stem}.png`,`${stem.split('/').pop()} seed ${seed} t=${steps} ${JSON.stringify(params)}`);
