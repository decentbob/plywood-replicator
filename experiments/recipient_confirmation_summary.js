#!/usr/bin/env node
// Decision protocol for a fresh confirmation; never imported by simulation workers.
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),cp=require('child_process');
const {hash,physicalHash}=require('./recipient_dependence.js');
const {validate,summarize}=require('./recipient_dependence_summary.js');
const {Sim}=require('../src/sim.js');
const spec={seeds:[105,106,107,108],arms:['on','noBind','noSource','neither'],steps:50000,after:10000,
  minimumRecipientDifference:5,minimumProducerBirths:5,minimumProducerGen2:1,
  requirePositiveOccupancy:true,requireDetachedExactAdvantage:true,requireEverySeed:true};
const sources=['src/sim.js','experiments/recipient_dependence.js','experiments/recipient_dependence_plan.md',
  'experiments/recipient_dependence_summary.js','experiments/recipient_confirmation_plan.md',
  'experiments/recipient_confirmation_summary.js'];
const root=path.join(__dirname,'..');
function evaluate(rows){
  assert.equal(rows.length,spec.seeds.length*spec.arms.length,'Incomplete confirmation matrix');
  const keys=new Set();
  for(const r of rows){assert(spec.seeds.includes(r.seed)&&spec.arms.includes(r.arm),'Unexpected seed/arm');
    const key=r.seed+':'+r.arm;assert(!keys.has(key),'Duplicate seed/arm');keys.add(key);
    for(const k of ['recipient','producer','producerGen2','bound','recipientDetachedExact'])assert(Number.isInteger(r[k])&&r[k]>=0,'Invalid '+k);
  }
  const seeds=spec.seeds.map(seed=>{
    const g=Object.fromEntries(rows.filter(r=>r.seed===seed).map(r=>[r.arm,r]));
    const a=g.on,b=g.noBind,c=g.noSource;
    const bindingEffect=a.recipient-b.recipient,productionEffect=a.recipient-c.recipient;
    const bindingExactEffect=a.recipientDetachedExact-b.recipientDetachedExact;
    const productionExactEffect=a.recipientDetachedExact-c.recipientDetachedExact;
    const checks={binding:bindingEffect>=spec.minimumRecipientDifference,
      production:productionEffect>=spec.minimumRecipientDifference,
      producer:a.producer>=spec.minimumProducerBirths,producerGen2:a.producerGen2>=spec.minimumProducerGen2,
      occupancy:a.bound>0,detachedBinding:bindingExactEffect>0,detachedProduction:productionExactEffect>0};
    return {seed,bindingEffect,productionEffect,bindingExactEffect,productionExactEffect,
      checks,pass:Object.values(checks).every(Boolean)};
  });
  return {seeds,confirmed:seeds.every(s=>s.pass)};
}
function prepare(stem){
  assert(stem);assert(['.protocol.json','.runs.jsonl','.manifest.json'].every(ext=>!fs.existsSync(stem+ext)),'Output already exists');
  fs.mkdirSync(path.dirname(stem),{recursive:true});
  const protocol={schema:1,spec,created:new Date().toISOString(),
    commit:cp.execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),
    sources:Object.fromEntries(sources.map(f=>[f,hash(fs.readFileSync(path.join(root,f)))]))};
  fs.writeFileSync(stem+'.protocol.json',JSON.stringify(protocol,null,2)+'\n',{flag:'wx'});
  console.log('Wrote prospective protocol: '+stem+'.protocol.json');
}
function load(stem){
  const p=JSON.parse(fs.readFileSync(stem+'.protocol.json')),m=JSON.parse(fs.readFileSync(stem+'.manifest.json'));
  assert.equal(p.schema,1);assert.deepEqual(p.spec,spec,'Changed confirmation criteria');
  assert(Number.isFinite(Date.parse(p.created))&&Date.parse(p.created)<=Date.parse(m.started),'Protocol must precede simulation');
  assert.deepEqual(Object.keys(p.sources),sources);
  for(const [f,h] of Object.entries(p.sources))assert.equal(hash(fs.readFileSync(path.join(root,f))),h,'Protocol source '+f);
  assert.equal(m.options.steps,spec.steps);assert.equal(m.options.seeds,spec.seeds.join(','));assert.equal(m.options.arms,spec.arms.join(','));
  const runs=fs.readFileSync(stem+'.runs.jsonl','utf8').trim().split(/\r?\n/).map(JSON.parse);
  validate(m,runs);
  const rows=runs.map(r=>summarize(r,spec.after)).sort((a,b)=>a.seed-b.seed||spec.arms.indexOf(a.arm)-spec.arms.indexOf(b.arm));
  const result=evaluate(rows);
  const inactiveControls=spec.seeds.map(seed=>{
    const a=runs.find(r=>r.seed===seed&&r.arm==='noSource'),b=runs.find(r=>r.seed===seed&&r.arm==='neither');
    return {seed,identicalPhysicalStateAndRng:physicalHash(Sim.fromState(a.finalState))===physicalHash(Sim.fromState(b.finalState))};
  });
  return {protocol:p,manifest:m,rows,result,inactiveControls};
}
function report(data){
  const {rows,result,manifest,inactiveControls}=data;
  console.log('Fresh confirmation only: (10000,50000], four seeds; original screen excluded.');
  const cols=['seed','arm','recipient','producer','producerGen2','recipientDetachedExact','bound','sites','exact','sameLengthError','lengthError','unknown'];
  console.log('| '+cols.join(' | ')+' |\n| '+cols.map(()=> '---').join(' | ')+' |');
  rows.forEach(r=>console.log('| '+cols.map(k=>r[k]).join(' | ')+' |'));
  console.log('\nPredeclared paired decisions:');result.seeds.forEach(s=>console.log(JSON.stringify(s)));
  console.log('\nOccupancy, sampled persistence and final material:');rows.forEach(r=>console.log(JSON.stringify(r)));
  console.log('\nInactive-control physical/RNG agreement: '+JSON.stringify(inactiveControls));
  console.log(JSON.stringify({confirmed:result.confirmed,passingSeeds:result.seeds.filter(s=>s.pass).length,
    disposition:result.confirmed?'Plan bounded rare/common competition':'Park this setting for frequency competition',
    runs:rows.length,cpuSeconds:manifest.cpuSeconds}));
}
if(require.main===module){if(process.argv[2]==='--prepare')prepare(process.argv[3]);else {assert(process.argv[2],'Provide batch stem');report(load(process.argv[2]));}}
module.exports={spec,evaluate,load,prepare};
