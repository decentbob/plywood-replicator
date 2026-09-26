'use strict';
// New launch protocol; reuse the frozen section-64 worker and analyzer unchanged.
const fs=require('fs'),assert=require('assert/strict'),{fork}=require('child_process');
const {read,hash,checkProtocol,control,summarize}=require('./random_heredity');
const {validateWorld,founderReadout}=require('./random_heredity_summary');
const {validate}=require('./random_57');
const write=(p,x)=>fs.writeFileSync(p,JSON.stringify(x)+'\n',{flag:'wx'});
const WORKER=require.resolve('./random_heredity');
function prepare(stem){
  const recovery=validate(stem);assert.ok(recovery.definition,'No eligible variant pair');
  const sources=['experiments/random_57_screen.js','experiments/random_57_screen_test.js',
    'experiments/random_heredity_summary.js'];
  write(`${stem}.screen.protocol.json`,{created:new Date().toISOString(),baseline:'50b147e',
    recoveryHash:hash(`${stem}.recovery.json`),recoveryProtocolHash:hash(`${stem}.protocol.json`),
    sourceHashes:Object.fromEntries(sources.map(f=>[f,hash(f)])),defs:[control(),recovery.definition],
    calibrationSeed:204,seeds:[205,206],steps:50000,calibrationSteps:10000,workers:2,cpuBudget:3600,command:process.argv});
}
function check(stem){
  const p=read(`${stem}.screen.protocol.json`);checkProtocol(p);checkProtocol(read(`${stem}.protocol.json`));
  assert.equal(p.recoveryHash,hash(`${stem}.recovery.json`));assert.equal(p.recoveryProtocolHash,hash(`${stem}.protocol.json`));return p;
}
function calibrationPass(raw){
  if(raw.budgetCensored)return false;
  return raw.id.includes('_copy_')?summarize(raw).persistent[raw.variant]>=1:
    founderReadout(raw).filter(f=>f.persistentFirst!==null).length>=2;
}
function cases(rows,seeds){
  const out=[];
  for(const name of ['copy','table57'])for(let variant=0;variant<2;++variant)for(const seed of seeds){
    const arms=Object.fromEntries(['seeded','disrupted','plain'].map(a=>[a,rows.find(r=>r.id===`screen_${name}_v${variant}_${seed}_${a}`)]));
    if(Object.values(arms).some(r=>!r))throw Error('Incomplete matrix');
    const counts=Object.fromEntries(Object.entries(arms).map(([a,r])=>[a,r.summary.persistent[variant]]));
    const witnesses=arms.seeded.summary.witnesses.filter(w=>w.variant===variant).length;
    out.push({name,variant,seed,counts,witnesses,pass:Object.values(arms).every(r=>!r.budgetCensored)&&
      counts.seeded-counts.disrupted>=3&&counts.seeded-counts.plain>=3&&witnesses>=1});
  }return out;
}
async function batch(stem,mode){
  const p=check(stem),jobs=[];let used=read(`${stem}.recovery.json`).cpuSeconds,reserved=0,next=0;
  if(mode==='screen'){
    for(const j of read(`${stem}.calibrate.manifest.json`).jobs){
      const r=validateWorld(read(`${stem}.${j.id}.json`),j);assert.ok(calibrationPass(r),`Failed calibration ${j.id}`);used+=r.cpuSeconds;
    }
  }
  for(const def of p.defs)for(let variant=0;variant<2;++variant)
    for(const seed of mode==='calibrate'?[p.calibrationSeed]:p.seeds)
      for(const arm of mode==='calibrate'?['seeded']:['seeded','disrupted','plain']){
        const id=`${mode}_${def.name}_v${variant}_${seed}_${arm}`,out=`${stem}.${id}.json`;
        if(fs.existsSync(out))throw Error(`Output exists ${out}`);
        jobs.push({id,out,def,variant,seed,arm,steps:mode==='calibrate'?p.calibrationSteps:p.steps});
      }
  write(`${stem}.${mode}.manifest.json`,{created:new Date().toISOString(),protocolHash:hash(`${stem}.screen.protocol.json`),jobs,workers:p.workers,command:process.argv});
  async function worker(){while(next<jobs.length){
    assert.ok(used<p.cpuBudget,'CPU budget reached; remaining jobs unrun');
    const job={...jobs[next++],cpuBudget:Math.max(1,Math.min(600,(p.cpuBudget-used-reserved)/2))};reserved+=job.cpuBudget;
    await new Promise((resolve,reject)=>{
      const child=fork(WORKER,['worker'],{stdio:['ignore','inherit','inherit','ipc']});child.send(job);
      child.on('message',m=>{reserved-=job.cpuBudget;used+=m.cpuSeconds;console.log(JSON.stringify({id:job.id,CPU:m.cpuSeconds,persistent:m.persistent,witnesses:m.witnesses.length}));});
      child.on('error',reject);child.on('exit',c=>c===0?resolve():reject(Error(`Worker ${job.id} failed: ${c}`)));
    });
  }}await Promise.all([worker(),worker()]);
}
function analyze(stem){
  const p=check(stem),recovery=validate(stem),rows=[];
  for(const mode of ['calibrate','screen']){
    const m=read(`${stem}.${mode}.manifest.json`);assert.equal(m.protocolHash,hash(`${stem}.screen.protocol.json`));
    assert.equal(m.jobs.length,mode==='calibrate'?4:24);assert.equal(new Set(m.jobs.map(j=>j.id)).size,m.jobs.length);
    for(const j of m.jobs){assert.deepEqual(j.def,p.defs.find(d=>d.name===j.def.name));
      const raw=validateWorld(read(`${stem}.${j.id}.json`),j);if(mode==='calibrate')assert.ok(calibrationPass(raw));rows.push(raw);}
  }
  for(const name of ['copy','table57'])for(const seed of p.seeds){
    const plain=[0,1].map(v=>rows.find(r=>r.id===`screen_${name}_v${v}_${seed}_plain`));assert.deepEqual(plain[0].final,plain[1].final);
    for(let v=0;v<2;++v){const arms=['seeded','disrupted'].map(a=>rows.find(r=>r.id===`screen_${name}_v${v}_${seed}_${a}`));
      for(const k of ['type','is','px','py','pa','ox','oy'])assert.deepEqual(arms[0].initial.arrays[k],arms[1].initial.arrays[k]);}
  }
  const result={cases:cases(rows,p.seeds),steps:30000+rows.reduce((n,r)=>n+r.steps,0),cpuSeconds:recovery.cpuSeconds+rows.reduce((n,r)=>n+r.cpuSeconds,0),
    rows:rows.map(r=>({id:r.id,summary:r.summary,founderTargets:founderReadout(r),finalInventory:r.samples.at(-1),
      initialOverlaps:r.initialOverlaps,steps:r.steps,cpuSeconds:r.cpuSeconds,budgetCensored:r.budgetCensored,
      standing:[0,1].map(v=>r.episodes.filter(e=>e.variant===v&&!e.founderOverlap&&e.end===null&&r.steps-e.start>=100).length)}))};
  const text=['Table 57 heredity screen: complete bond-history replay',
    'table variant seed seeded disrupted plain contactWitnesses pass',
    ...result.cases.map(c=>`${c.name} ${c.variant} ${c.seed} ${c.counts.seeded} ${c.counts.disrupted} ${c.counts.plain} ${c.witnesses} ${c.pass}`),
    `steps=${result.steps} CPU_seconds=${result.cpuSeconds.toFixed(3)}`].join('\n')+'\n';
  return {result,text};
}
if(require.main===module){const [cmd,stem,out]=process.argv.slice(2);
  if(cmd==='prepare')prepare(stem);
  else if(cmd==='calibrate'||cmd==='screen')batch(stem,cmd).catch(e=>{console.error(e);process.exitCode=1;});
  else if(cmd==='summary'){const a=analyze(stem);process.stdout.write(a.text);if(out){write(`${out}.json`,a.result);fs.writeFileSync(`${out}.txt`,a.text,{flag:'wx'});}}
  else throw Error('Usage: random_57_screen.js prepare|calibrate|screen|summary STEM [OUTPUT_STEM]');
}
module.exports={calibrationPass,cases};
