#!/usr/bin/env node
// Descriptive fuel witnesses for the predeclared primary; does not change its gate.
const fs=require('fs'),assert=require('assert/strict');
const {load,validate,decision}=require('./short_variant_garden_summary.js');
function primaryFuel(r,variants){
  const rowIndices=new Map(r.events.flatMap((e,i)=>e.kind==='row'?[[e.id,i]]:[]));
  const edges=variants.edges.filter(e=>r.rows[e.parent].depth!==null);
  const ids=[...new Set(edges.map(e=>e.parent))];assert.equal(ids.length,r.metrics.primary);
  return ids.map(id=>{
    const p=r.rows[id],firstChild=edges.filter(e=>e.parent===id).sort((a,b)=>rowIndices.get(a.child)-rowIndices.get(b.child))[0].child;
    const end=rowIndices.get(firstChild),start=rowIndices.get(id);
    const witnesses=p.units.map(u=>{
      let release=-1,arm=-1;
      for(let i=0;i<start;i++)if(r.events[i].kind==='release'&&r.events[i].u===u)release=i;
      assert(release>=0);
      for(let i=release+1;i<end;i++)if(r.events[i].kind==='rearm'&&r.events[i].u===u)arm=i;
      assert(arm>=0);const e=r.events[arm];
      const outside=e.holders.filter(h=>!p.units.includes(h.unit)).map(h=>h.unit);
      return {unit:u,event:arm,t:e.t,fuel:e.fuel,holders:e.holders,outsideParentMembers:outside,
        beforeRegistration:arm<start,wait:e.t-r.events[release].t};
    });
    return {id,seq:p.seq,born:p.born,firstChild,witnesses};
  });
}
if(require.main===module){
  const stem=process.argv[2],{m,rs}=load(stem),validated=validate(m,rs);
  const worlds=rs.map((r,i)=>{
    const parents=primaryFuel(r,validated[i].variants),ws=parents.flatMap(p=>p.witnesses);
    return {seed:r.seed,sequence:r.sequence,profile:r.profile,grip:r.grip,metrics:r.metrics,
      material:r.samples.at(-1).material,fuel:validated[i].fuel,
      primaryFuel:{parents,events:ws.length,outsideParent:ws.filter(w=>w.outsideParentMembers.length).length,
        beforeRegistration:ws.filter(w=>w.beforeRegistration).length},
      sameFamilyOutsideExactLineage:r.rows.filter(p=>p.born&&p.seq.length===5&&p.depth===null).length};
  });
  const report={decision:decision(rs),cpuSeconds:m.cpuSeconds,worlds};
  console.table(worlds.map(w=>({seed:w.seed,seq:w.sequence,shape:w.profile,grip:w.grip,
    primary:w.metrics.primary,births:w.metrics.births,fuel:w.metrics.fuel,same:w.fuel.sameRow,
    cross:w.fuel.differentRows,unknown:w.fuel.untracked,primaryFuel:w.primaryFuel.events,
    external:w.primaryFuel.outsideParent})));
  console.log(JSON.stringify(report.decision));
  if(process.argv[3])fs.writeFileSync(process.argv[3],JSON.stringify(report,null,2)+'\n',{flag:'wx'});
}
module.exports={primaryFuel};
