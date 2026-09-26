'use strict';
const assert=require('assert/strict');
const fs=require('fs');
const {RChem}=require('../src/rchem');
const {read,hash,checkProtocol,Observer,summarize,inventory}=require('./random_heredity');

function validateWorld(raw,job){
  for(const k of ['id','variant','seed','arm'])assert.equal(raw[k],job[k],k);
  assert.equal(raw.requestedSteps,job.steps);
  assert.deepEqual(raw.params,raw.initial.p);
  assert.deepEqual(raw.params.table,job.def.params.table);
  assert.deepEqual(raw.targets,job.def.variants.map(v=>v.targets));
  assert.equal(raw.initial.nums.t,0);assert.equal(raw.final.nums.t,raw.steps);
  assert.ok(raw.steps<=job.steps);assert.equal(raw.budgetCensored,raw.steps<job.steps);
  const s=RChem.fromState(raw.initial), o=new Observer(s,job.def.variants,raw.founders);
  assert.equal(s.n,300);
  const expected=inventory(s).counts;
  let next=0,sample=1;
  assert.deepEqual(inventory(s),raw.samples[0]);
  for(let t=1;t<=raw.steps;++t){
    s.t=t;
    while(next<raw.events.length&&raw.events[next][0]===t){
      const [,kind,u,i,v,j]=raw.events[next++];
      assert.ok(u>=0&&u<s.n&&v>=0&&v<s.n&&u!==v);
      assert.ok(i>=0&&i<4&&j>=0&&j<4);
      if(kind===1){assert.equal(s.bond[4*u+i],-1);assert.equal(s.bond[4*v+j],-1);s._link(u,i,v,j);}
      else{assert.equal(kind,-1);assert.equal(s.bond[4*u+i],4*v+j);assert.equal(s.bond[4*v+j],4*u+i);s._unlink(u,i);}
    }
    o.tick();
    if(t%1000===0){assert.deepEqual(inventory(s),raw.samples[sample++]);assert.deepEqual(raw.samples[sample-1].counts,expected);}
  }
  assert.equal(next,raw.events.length);assert.equal(sample,raw.samples.length);
  assert.equal(s.saveState().arrays.bond.b,raw.final.arrays.bond.b);
  assert.equal(s.saveState().arrays.type.b,raw.final.arrays.type.b);
  const structural=e=>e.map(({states,...x})=>x);
  assert.deepEqual(structural(o.episodes),structural(raw.episodes),'episode history differs from bond replay');
  assert.deepEqual(summarize(raw),raw.summary);
  const final=RChem.fromState(raw.final);
  for(const k of ['px','py','pa','ox','oy'])assert.ok([...final[k]].every(Number.isFinite),k);
  return raw;
}
function outcome(rows){
  const cases=[];
  for(const name of ['copy','table55'])for(let variant=0;variant<2;++variant)for(const seed of [202,203]){
    const arms=Object.fromEntries(['seeded','disrupted','plain'].map(arm=>[arm,rows.find(r=>r.id===`screen_${name}_v${variant}_${seed}_${arm}`)]));
    if(Object.values(arms).some(x=>!x))throw new Error('Incomplete matrix');
    const counts=Object.fromEntries(Object.entries(arms).map(([k,r])=>[k,r.summary.persistent[variant]]));
    const witnesses=arms.seeded.summary.witnesses.filter(w=>w.variant===variant).length;
    cases.push({name,variant,seed,counts,witnesses,pass:!Object.values(arms).some(r=>r.budgetCensored)&&
      counts.seeded-counts.disrupted>=3&&counts.seeded-counts.plain>=3&&witnesses>=1});
  }
  return cases;
}
function founderReadout(raw){
  const groups=[];
  // Founders are stored in transplant order, with one complete capture per group.
  const size=raw.founders.length/4;
  if(!size)return [];
  for(let i=0;i<4;++i){
    const members=raw.founders.slice(i*size,(i+1)*size).sort((a,b)=>a-b).join(',');
    const episodes=raw.episodes.filter(e=>e.members.join(',')===members&&e.variant===raw.variant);
    groups.push({first:episodes[0]?.start??null,persistentFirst:episodes.find(e=>(e.end??raw.steps)-e.start>=100)?.start??null});
  }
  return groups;
}
function analyze(stem){
  const protocol=read(`${stem}.protocol.json`), recovery=read(`${stem}.recovery.json`);checkProtocol(protocol);
  assert.equal(recovery.protocolHash,hash(`${stem}.protocol.json`));
  const rows=[];
  for(const mode of ['calibrate','screen']){
    const manifest=read(`${stem}.${mode}.manifest.json`);
    assert.equal(manifest.protocolHash,hash(`${stem}.protocol.json`));
    assert.equal(manifest.recoveryHash,hash(`${stem}.recovery.json`));
    assert.equal(manifest.jobs.length,mode==='calibrate'?2:24);
    assert.equal(new Set(manifest.jobs.map(j=>j.id)).size,manifest.jobs.length);
    for(const job of manifest.jobs){
      assert.deepEqual(job.def,job.def.name==='copy'?protocol.control:recovery.definition);
      rows.push(validateWorld(read(`${stem}.${job.id}.json`),job));
    }
  }
  // Repeated plain jobs differ only in the planned comparison label.
  for(const name of ['copy','table55'])for(const seed of [202,203]){
    const pair=[0,1].map(v=>rows.find(r=>r.id===`screen_${name}_v${v}_${seed}_plain`));
    assert.deepEqual(pair[0].final,pair[1].final,'plain variants should be identical physical worlds');
  }
  for(const name of ['copy','table55'])for(const seed of [202,203])for(const v of [0,1]){
    const pair=['seeded','disrupted'].map(a=>rows.find(r=>r.id===`screen_${name}_v${v}_${seed}_${a}`));
    for(const key of ['type','is','px','py','pa','ox','oy'])assert.deepEqual(pair[0].initial.arrays[key],pair[1].initial.arrays[key],key);
  }
  const cases=outcome(rows), cpuSeconds=recovery.cpuSeconds+rows.reduce((n,r)=>n+r.cpuSeconds,0);
  const result={cases,cpuSeconds,steps:30000+rows.reduce((n,r)=>n+r.steps,0),
    rows:rows.map(r=>({id:r.id,summary:r.summary,finalInventory:r.samples.at(-1),initialOverlaps:r.initialOverlaps,
      founderTargets:founderReadout(r),cpuSeconds:r.cpuSeconds,steps:r.steps,budgetCensored:r.budgetCensored,
      bondEvents:r.events.length,episodes:r.episodes.length,
      persistentMaterial:[0,1].map(v=>{const es=r.episodes.filter(e=>e.variant===v&&!e.founderOverlap&&(e.end??r.steps)-e.start>=100);
        return {variant:v,uniqueBlocks:new Set(es.flatMap(e=>e.members)).size,
          standing:es.filter(e=>e.end===null).length};})}))};
  const lines=['P4 exact-structure screen: all raw bond histories replayed',
    'table variant seed seeded disrupted plain contactWitnesses pass'];
  for(const c of cases)lines.push(`${c.name} ${c.variant} ${c.seed} ${c.counts.seeded} ${c.counts.disrupted} ${c.counts.plain} ${c.witnesses} ${c.pass}`);
  lines.push(`steps=${result.steps} CPU_seconds=${cpuSeconds.toFixed(3)}`);
  return {result,text:lines.join('\n')+'\n'};
}
if(require.main===module){const a=analyze(process.argv[2]);process.stdout.write(a.text);
  if(process.argv[3]){fs.writeFileSync(`${process.argv[3]}.json`,JSON.stringify(a.result,null,2)+'\n',{flag:'wx'});
    fs.writeFileSync(`${process.argv[3]}.txt`,a.text,{flag:'wx'});}}
module.exports={validateWorld,outcome,founderReadout,analyze};
