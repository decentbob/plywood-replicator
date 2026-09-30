'use strict';
// Seeded letters vs single triangles: same total material, time to copies and exactness.
//   node experiments/tri_pieces.js SEED STEPS COND GAPS     COND = singles | pieces | loose
const {createTriWorld,triCensus}=require('./tri_chain');
const [seed,steps,cond,g]=process.argv.slice(2),gaps=[...g].map(Number);
const comp=x=>[...x].reverse().map(c=>2-(+c)).join(''),ok=new Set([g,comp(g)]);
const P={singles:{free:80,params:{}},pieces:{free:42,params:{pieces:{R:10,Z:6}}},loose:{free:42,params:{pieces:{R:10,Z:6},pieceStrict:false}}}[cond];
const {s}=createTriWorld({seed:+seed,gaps,free:P.free,size:22,params:{...P.params,caps:true,pFray:0.0002,triUndock:0.0003,pDissolve:0.002}});
let first=0;const t0=Date.now();
for(let t=1;t<=+steps;t++){s.step();
  if(t%500===0||t===+steps){const c=triCensus(s).filter(q=>!q.paired&&q.n>=5),good=c.filter(q=>ok.has(q.gaps)).length,bad=c.filter(q=>!ok.has(q.gaps));
    if(!first&&good>1)first=t;
    if(t===+steps)console.log(`${cond} seed ${seed}: first copy by t=${first||'-'}, at end ${good} correct strands, ${bad.length} other [${bad.map(q=>q.gaps+'/'+q.n).join(' ')}], piece docks ${s.pieceDocks||0}, rejects ${s.pieceRejects||0}, single docks ${(s.dockEvents||0)-(s.pieceDocks||0)}, fills ${s.fillEvents||0}, ${((Date.now()-t0)/t).toFixed(0)}ms/step`);}}
