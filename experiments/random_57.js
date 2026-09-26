'use strict';
// Read-only table recovery and observer-only persistence prerequisite.
const fs=require('fs'), assert=require('assert/strict');
const {RChem,randomTable}=require('../src/rchem');
const {drawR}=require('./rsearch');
const {catalog,Observer,inventory,hash,read,checkProtocol}=require('./random_heredity');
const write=(p,x)=>fs.writeFileSync(p,JSON.stringify(x)+'\n',{flag:'wx'});
const PREVIOUS='experiments/out/RH_20260926.protocol.json';
const SOURCES=['src/sim.js','src/rchem.js','experiments/rsearch.js',
  'experiments/random_heredity.js','experiments/random_57.js',
  'experiments/random_57_test.js','experiments/random_57_plan.md',PREVIOUS];
function rankAndSelect(rows){
  const ranked=[...rows].sort((a,b)=>b.total-a.total||(a.sig<b.sig?-1:a.sig>b.sig?1:0));
  let pair=null;
  for(let i=0;i<ranked.length&&!pair;++i)if(ranked[i].persistentMembers.length)
    for(let j=i+1;j<ranked.length;++j)if(ranked[j].persistentMembers.length&&
      ranked[i].composition===ranked[j].composition&&ranked[i].sig!==ranked[j].sig){pair=[ranked[i],ranked[j]];break;}
  return {ranked,pair};
}
function persistentMembers(episodes,sig,start,end){
  return episodes.filter(e=>e.sig===sig&&e.start===start&&e.end===null&&end-start>=100)
    .map(e=>e.members).sort((a,b)=>a.join(',')<b.join(',')?-1:1);
}
function prepare(stem){
  const prior=read(PREVIOUS),candidate=prior.candidates.find(c=>c.i===57),params=drawR(57);
  assert.deepEqual(params,candidate.params);assert.deepEqual(randomTable(params),candidate.table);
  write(`${stem}.protocol.json`,{created:new Date().toISOString(),baseline:'50b147e',candidate,
    params:{...params,table:candidate.table,bodyJostle:true,iters:4,snapCorners:true},
    sourceHashes:Object.fromEntries(SOURCES.map(p=>[p,hash(p)])),command:process.argv,
    criteria:{steps:30000,every:5000,persistenceStart:29900,persistenceSteps:100,minSize:3,maxSize:10}});
}
function recover(stem){
  const p=read(`${stem}.protocol.json`);checkProtocol(p);
  const cpu=process.cpuUsage(),s=new RChem(p.params),samples=[];
  const take=()=>samples.push({t:s.t,inventory:inventory(s),structures:[...catalog(s).values()]});
  for(let t=5000;t<=25000;t+=5000){s.run(5000);take();console.log(`table57 recovery ${t}/30000`);}
  s.run(4900);const initial=s.saveState(),before=[...catalog(s).keys()];
  const o=new Observer(s,before.map(sig=>({targets:[sig]})),[]);
  for(let t=0;t<100;++t){s.step();o.tick();}take();
  const totals=new Map();for(const sample of samples)for(const r of sample.structures)totals.set(r.sig,(totals.get(r.sig)||0)+r.count);
  const rows=samples.at(-1).structures.map(r=>({...r,total:totals.get(r.sig),
    persistentMembers:persistentMembers(o.episodes,r.sig,29900,30000)}));
  const {ranked,pair}=rankAndSelect(rows);
  const definition=pair?{name:'table57',params:p.params,variants:pair.map((r,i)=>({
    name:`V${i}`,targets:[r.sig],composition:r.composition,total:r.total,
    members:r.persistentMembers[0],capture:s.capture(r.persistentMembers[0])}))}:null;
  const result={protocolHash:hash(`${stem}.protocol.json`),samples,ranked,definition,
    finalWindow:{initial,targets:before,events:o.events,episodes:o.episodes},final:s.saveState(),
    cpuSeconds:Object.values(process.cpuUsage(cpu)).reduce((a,b)=>a+b)/1e6,command:process.argv};
  write(`${stem}.recovery.json`,result);console.log(format(result));
}
function format(r){
  const lines=['Table 57 recovery: persistent same-composition variant prerequisite',
    'size composition totalOccurrences finalCount persistentFinalMembers'];
  for(const row of r.ranked)lines.push(`${row.size} ${row.composition} ${row.total} ${row.count} ${row.persistentMembers.length}`);
  lines.push(`pair=${Boolean(r.definition)} CPU_seconds=${r.cpuSeconds.toFixed(3)}`);return lines.join('\n')+'\n';
}
function validate(stem){
  const p=read(`${stem}.protocol.json`),r=read(`${stem}.recovery.json`);checkProtocol(p);
  assert.equal(r.protocolHash,hash(`${stem}.protocol.json`));
  assert.deepEqual(p.params,{...drawR(57),table:randomTable(drawR(57)),bodyJostle:true,iters:4,snapCorners:true});
  assert.deepEqual(r.samples.map(s=>s.t),[5000,10000,15000,20000,25000,30000]);
  for(const sample of r.samples){assert.deepEqual(sample.inventory.counts,[150,150]);assert.equal(sample.inventory.free+sample.inventory.bonded,300);}
  // Rerun the real physics window independently, with and without observation.
  const observed=RChem.fromState(r.finalWindow.initial),plain=RChem.fromState(r.finalWindow.initial);
  assert.deepEqual([...catalog(observed).keys()],r.finalWindow.targets);
  const o=new Observer(observed,r.finalWindow.targets.map(sig=>({targets:[sig]})),[]);
  for(let t=0;t<100;++t){observed.step();o.tick();plain.step();}
  assert.deepEqual(o.events,r.finalWindow.events);assert.deepEqual(o.episodes,r.finalWindow.episodes);
  const norm=s=>{const v=structuredClone(s);delete v.nums.pinsVersion;return v;};
  assert.deepEqual(norm(observed.saveState()),norm(r.final));assert.deepEqual(norm(plain.saveState()),norm(r.final));
  for(const key of Object.keys(plain))if(ArrayBuffer.isView(plain[key]))assert.deepEqual(observed[key],plain[key],key);
  assert.deepEqual([...catalog(plain).values()],r.samples.at(-1).structures);
  const totals=new Map();for(const sample of r.samples)for(const row of sample.structures)totals.set(row.sig,(totals.get(row.sig)||0)+row.count);
  const selected=rankAndSelect(r.samples.at(-1).structures.map(row=>({...row,total:totals.get(row.sig),
    persistentMembers:persistentMembers(o.episodes,row.sig,29900,30000)})));
  assert.deepEqual(selected.ranked,r.ranked);assert.equal(Boolean(selected.pair),Boolean(r.definition));
  if(selected.pair)for(let i=0;i<2;++i){
    assert.deepEqual(r.definition.variants[i].targets,[selected.pair[i].sig]);
    assert.deepEqual(r.definition.variants[i].capture,plain.capture(selected.pair[i].persistentMembers[0]));
  }
  for(let u=0;u<plain.n;++u)for(let i=0;i<4;++i){const q=plain.bond[4*u+i];if(q>=0)assert.equal(plain.bond[q],4*u+i);}
  return r;
}
if(require.main===module){const [cmd,stem]=process.argv.slice(2);
  if(cmd==='prepare')prepare(stem);else if(cmd==='recover')recover(stem);
  else if(cmd==='validate'){const r=validate(stem);console.log('PASS: hashes, window physics, observer neutrality, restart, material/bonds and selection');process.stdout.write(format(r));}
  else throw Error('Usage: random_57.js prepare|recover|validate UNIQUE_STEM');
}
module.exports={rankAndSelect,persistentMembers,validate,format};
