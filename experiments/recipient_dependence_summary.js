#!/usr/bin/env node
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const {kind,hash,arms,base}=require('./recipient_dependence.js');
const {Sim}=require('../src/sim.js');
function summarize(r,after=10000){
  assert(after>=0&&after<r.steps&&after%100===0);
  const births=r.births.filter(b=>!b.prod&&b.t>after),ss=r.samples.filter(s=>s.t>after);
  const counts={producer:0,recipient:0,unknown:0,producerGen2:0,recipientGen2:0,exact:0,sameLengthError:0,lengthError:0};
  for(const b of births){const k=kind(b.parent);counts[k]++;if(k!=='unknown'&&b.gen>=2)counts[k+'Gen2']++;
    if(k!=='unknown')counts[b.seq===[...b.parent].reverse().join('')?'exact':b.seq.length===b.parent.length?'sameLengthError':'lengthError']++;}
  const sites=ss.reduce((n,s)=>n+s.recipientSites,0),bound=ss.reduce((n,s)=>n+s.recipientBound,0);
  const producerSites=ss.reduce((n,s)=>n+s.producerSites,0),producerBound=ss.reduce((n,s)=>n+s.producerBound,0);
  const members=r.members.filter(b=>b.t>after),observed=members.filter(b=>b.at5k!==null);
  const physical={producerDetached:0,recipientDetached:0,producerDetachedExact:0,recipientDetachedExact:0};
  births.forEach((b,i)=>{const k=kind(b.parent);if(k==='unknown'||!members[i].detached)return;
    physical[k+'Detached']++;if(b.seq===[...b.parent].reverse().join(''))physical[k+'DetachedExact']++;});
  return {arm:r.arm,seed:r.seed,...counts,products:r.births.filter(b=>b.prod&&b.t>after).length,
    ...physical,
    sites,bound,occupancy:sites?bound/sites:null,producerSites,producerBound,
    detached:members.filter(b=>b.detached).length,activeAtRelease:members.filter(b=>b.active).length,
    assessed5k:observed.length,intact5k:observed.filter(b=>b.at5k.intact).length,
    active5k:observed.filter(b=>b.at5k.active).length,censored5k:members.length-observed.length,
    final:r.samples.at(-1).material};
}
function validate(m,runs,checkSources=true){
  assert(m.complete,'Incomplete batch');assert.equal(m.completed,m.jobs.length);
  assert.equal(runs.length,m.jobs.length);const keys=new Set();
  if(checkSources)for(const [f,h]of Object.entries(m.sources))assert.equal(hash(fs.readFileSync(path.join(__dirname,'..',f))),h,'source '+f);
  for(const r of runs){const key=r.arm+':'+r.seed;assert(!keys.has(key),'Duplicate run');keys.add(key);
    assert(m.jobs.some(j=>j.arm===r.arm&&j.seed===r.seed&&j.steps===r.steps),'Unexpected run');
    const expected=new Sim({...base,...arms[r.arm],seed:r.seed});assert.deepEqual(r.params,expected.p,'Unexpected parameters');
    assert.equal(r.initialHash,require('./recipient_dependence.js').physicalHash(expected));
    assert.equal(r.samples.length,r.steps/100,'Missing samples');
    r.samples.forEach((s,i)=>{assert.equal(s.t,(i+1)*100);for(const cls of ['producer','recipient','unknown']){
      assert(Number.isInteger(s[cls+'Sites'])&&s[cls+'Sites']>=0);assert(Number.isInteger(s[cls+'Bound'])&&s[cls+'Bound']>=0&&s[cls+'Bound']<=s[cls+'Sites']);}
      for(const [group,n]of [['letters',600],['products',300]]){assert(Object.values(s.material[group]).every(x=>Number.isInteger(x)&&x>=0));
        assert.equal(Object.values(s.material[group]).reduce((a,b)=>a+b,0),n);}assert.equal(s.material.energy,100);});
    const births=r.births.filter(b=>!b.prod);assert.equal(births.length,r.members.length);assert.equal(births.length,r.finalState.nums.birthCount);
    assert.equal(r.births.filter(b=>b.prod).length,r.finalState.nums.prodCount);
    assert.equal(r.finalState.nums.t,r.steps);assert.deepEqual(r.finalState.p,r.params);
    const final=Sim.fromState(r.finalState);assert.deepEqual(final.check(),[]);assert.deepEqual(Array.from(final.type),Array.from(expected.type));
    assert.deepEqual(require('./recipient_dependence.js').sample(final),r.samples.at(-1),'Final material/occupancy mismatch');
    r.births.forEach((b,i)=>{assert(b.t>0&&b.t<=r.steps);if(i)assert(b.t>=r.births[i-1].t);});
    births.forEach((b,i)=>{const x=r.members[i];assert.equal(b.t,x.t);assert.equal(b.seq,x.seq);
      assert.equal(x.units.length,b.seq.length);assert.equal(new Set(x.units).size,x.units.length);
      assert.equal(x.units.map(u=>final._letter(u)).join(''),x.seq);
      if(x.at5k!==null){assert.equal(x.at5k.t,Math.ceil((x.t+5000)/100)*100);assert(x.at5k.t<=r.steps);assert(!x.at5k.active||x.at5k.intact);}
      else assert(x.t+5000>r.steps,'Missing follow-up');});
    if(['noSource','neither'].includes(r.arm)){assert.equal(r.finalState.nums.prodCount,0);assert(r.samples.every(s=>s.material.products.free===300));}
    if(r.arm!=='on')assert(r.samples.every(s=>s.producerBound+s.recipientBound+s.unknownBound===0),'Unexpected product occupancy');
  }
  for(const seed of new Set(runs.map(r=>r.seed)))assert.equal(new Set(runs.filter(r=>r.seed===seed).map(r=>r.initialHash)).size,1,'Unmatched initial states');
}
function report(rows){
  const columns=['arm','seed','recipient','producer','recipientGen2','producerGen2','products','bound','sites','exact','sameLengthError','lengthError','unknown'];
  console.log('| '+columns.join(' | ')+' |\n| '+columns.map(()=> '---').join(' | ')+' |');
  for(const r of rows)console.log('| '+columns.map(k=>r[k]).join(' | ')+' |');
  console.log('\nFace-free output at logging (post-hoc robustness check, original primary retained):');
  console.log('| arm | seed | recipient detached | recipient detached exact | producer detached | producer detached exact |');
  console.log('|---|---|---|---|---|---|');
  for(const r of rows)console.log(`| ${r.arm} | ${r.seed} | ${r.recipientDetached} | ${r.recipientDetachedExact} | ${r.producerDetached} | ${r.producerDetachedExact} |`);
  console.log('\nPersistence at the first 100-step sample at least 5k after release:');
  console.log('| arm | seed | detached | active at release | assessed | intact | active | censored | final unfinished letters |');
  console.log('|---|---|---|---|---|---|---|---|---|');
  for(const r of rows)console.log(`| ${r.arm} | ${r.seed} | ${r.detached} | ${r.activeAtRelease} | ${r.assessed5k} | ${r.intact5k} | ${r.active5k} | ${r.censored5k} | ${r.final.letters.unfinishedLinked} |`);
  console.log('\nOccupancy and final inventory (free / docked single / unfinished linked / released linked / other):');
  for(const r of rows)console.log(JSON.stringify({arm:r.arm,seed:r.seed,recipientBound:r.bound,recipientSites:r.sites,
    producerBound:r.producerBound,producerSites:r.producerSites,material:r.final}));
  for(const seed of new Set(rows.map(r=>r.seed))){const group=Object.fromEntries(rows.filter(r=>r.seed===seed).map(r=>[r.arm,r]));
    if(!['on','noBind','noSource','neither'].every(a=>group[a]))continue;
    const a=group.on,b=group.noBind,c=group.noSource;
    console.log(JSON.stringify({seed,bindingEffect:a.recipient-b.recipient,productionEffect:a.recipient-c.recipient,
      pass:a.recipient-b.recipient>=5&&a.recipient-c.recipient>=5&&a.producer>=5&&a.producerGen2>=1&&a.bound>0}));
  }
}
if(require.main===module){const stem=process.argv[2],after=Number(process.argv[3]??10000);assert(stem,'usage: recipient_dependence_summary.js STEM [after=10000]');
  const m=JSON.parse(fs.readFileSync(stem+'.manifest.json')),runs=fs.readFileSync(stem+'.runs.jsonl','utf8').trim().split(/\r?\n/).map(JSON.parse);
  validate(m,runs);report(runs.sort((a,b)=>a.seed-b.seed||a.arm.localeCompare(b.arm)).map(r=>summarize(r,after)));
  console.log(`Validated ${runs.length} runs; ${m.cpuSeconds.toFixed(3)} CPU seconds.`);
}
module.exports={summarize,validate};
