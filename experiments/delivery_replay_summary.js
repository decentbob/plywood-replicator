#!/usr/bin/env node
// Retrospective measurements only; the frozen observer and chemistry are untouched.
const fs=require('fs'),path=require('path'),zlib=require('zlib'),assert=require('assert/strict');
const {criteria}=require('./delivery_replay.js');
const {verify}=require('./delivery_replay_test.js');
const {hash}=require('./recipient_dependence.js');
const categories=['producer','recipient','unknown'];
const rate=(numerator,denominator)=>({numerator,denominator,value:denominator?numerator/denominator:null});
function summarize(r,after=criteria.after,end=criteria.steps){
  assert.equal(r.steps,end);assert(r.agreement.fullFinalState,'Historical agreement required before interpretation');
  const d=r.observer,inWindow=e=>e.t>after&&e.t<=end;
  const samples=d.samples.filter(inWindow),events=d.events.filter(inWindow);
  assert.equal(samples.length,end-after);
  const totals=Object.fromEntries(['producer','recipient','unknown','freeProducer','freeRecipient','freeUnknown','mature']
    .map(k=>[k,samples.reduce((n,s)=>n+s[k],0)]));
  const known=totals.producer+totals.recipient;
  const owner=new Map(),attempts=new Map();
  // Attempt events have endpoints but no row/category field. Rebuild live row ownership at that event.
  for(const e of d.events){
    if(e.kind==='retire')d.rows[e.row].units.forEach(u=>owner.delete(u));
    if(e.kind==='row')d.rows[e.row].units.forEach(u=>owner.set(u,e.row));
    if(e.kind==='attempt')attempts.set(e.id,owner.has(e.unit)?d.rows[owner.get(e.unit)].category:'unknown');
  }
  const allLinks=d.events.filter(e=>e.kind==='bond+'&&e.sticky);
  const used=new Set(allLinks.flatMap(e=>e.supports.filter(h=>h.known).map(h=>h.binding)));
  const sameRowUsed=new Set(),changedRowUsed=new Set();
  for(const e of allLinks)for(const h of e.supports)if(h.known){
    const b=d.events[h.binding];
    (h.row!==null&&h.row===b.row?sameRowUsed:changedRowUsed).add(h.binding);
  }
  const births=d.rows.filter(p=>!p.initial&&inWindow(d.events[p.born]));
  const witnesses=p=>p.exact?p.witnesses.filter(id=>id!==null&&d.events[id].sticky&&
    d.events[id].supports.some(h=>h.known&&h.row===p.parent)):[];
  const supportByBirth=new Map(births.map(p=>[p.id,witnesses(p)]));
  const out={seed:r.seed,arm:r.arm,window:{after,end},siteSteps:totals,
    coverage:rate(known,known+totals.unknown),retirements:events.filter(e=>e.kind==='retire').length,
    episodeCategory:'Category at binding onset; link categories are at use. Same-row and lost/changed-row use are reported separately and can overlap.',
    retirementReasons:{},categories:{},
    output:{births:births.length,detached:births.filter(p=>p.detached).length,
      exact:births.filter(p=>p.exact).length,unknownParent:births.filter(p=>p.parent===null).length,
      variantKnownParent:births.filter(p=>p.parent!==null&&p.seq!==[...d.rows[p.parent].seq].reverse().join('')).length,
      supportedExact:births.filter(p=>supportByBirth.get(p.id).length).length,
      unsupported:births.filter(p=>!supportByBirth.get(p.id).length).length},
    originalBirthClasses:{exact:0,sameLengthVariant:0,lengthVariant:0,unknown:0,products:0},
    originalFollowup:{births:0,assessed:0,intact:0,active:0,censored:0},
    finalMaterial:r.samples?.at(-1)?.material??null};
  for(const b of (r.births??[]).filter(inWindow)){
    const k=b.prod?'products':!b.parent||b.parent.length<2?'unknown':
      b.seq===[...b.parent].reverse().join('')?'exact':b.seq.length===b.parent.length?'sameLengthVariant':'lengthVariant';
    out.originalBirthClasses[k]++;
  }
  for(const e of events.filter(e=>e.kind==='retire'))out.retirementReasons[e.reason]=(out.retirementReasons[e.reason]??0)+1;
  for(const b of r.members.filter(inWindow)){
    const f=out.originalFollowup;f.births++;
    if(b.at5k){f.assessed++;f.intact+=Number(b.at5k.intact);f.active+=Number(b.at5k.active);}else f.censored++;
  }
  for(const c of categories){
    const ops=events.filter(e=>e.kind==='opportunity'&&e.category===c),geometric=ops.filter(e=>e.geometry);
    const formed=events.filter(e=>e.kind==='binding'&&e.category===c);
    const ended=formed.filter(e=>e.end!==null&&d.events[e.end].t<=end),open=formed.filter(e=>!ended.includes(e));
    const attempt=events.filter(e=>e.kind==='attempt'&&attempts.get(e.id)===c);
    const links=allLinks.filter(e=>inWindow(e)&&e.supports.some(h=>h.known&&h.category===c));
    const eligible=links.filter(e=>e.t<=end-5000),late=links.filter(e=>e.t>end-5000);
    const categoryBirths=births.filter(p=>(p.parent===null?'unknown':d.rows[p.parent].category)===c);
    const eligibleIDs=new Set(eligible.map(e=>e.id));
    const followed=categoryBirths.filter(p=>supportByBirth.get(p.id).some(id=>eligibleIDs.has(id)&&
      d.events[p.born].t-d.events[id].t<=5000));
    const successfulLinks=new Set(followed.flatMap(p=>supportByBirth.get(p.id).filter(id=>eligibleIDs.has(id)&&
      d.events[p.born].t-d.events[id].t<=5000)));
    const probabilities={};for(const e of geometric)probabilities[e.probability]=(probabilities[e.probability]??0)+1;
    const free=totals['free'+c[0].toUpperCase()+c.slice(1)];
    out.categories[c]={siteSteps:totals[c],freeBackSiteSteps:free,matureProductUnitSteps:totals.mature,
      scanned:ops.length,geometryRejected:ops.length-geometric.length,geometric:geometric.length,probabilities,
      attempts:attempt.length,vacancyFailures:attempt.filter(e=>!e.success).length,bindings:formed.length,
      endedBindings:ended.length,usedEndedBindings:ended.filter(e=>used.has(e.id)).length,
      usedEndedWithSameRow:ended.filter(e=>sameRowUsed.has(e.id)).length,
      usedEndedAfterIdentityLossOrChange:ended.filter(e=>changedRowUsed.has(e.id)).length,
      openBindings:open.length,usedOpenBindings:open.filter(e=>used.has(e.id)).length,
      usedOpenWithSameRow:open.filter(e=>sameRowUsed.has(e.id)).length,
      usedOpenAfterIdentityLossOrChange:open.filter(e=>changedRowUsed.has(e.id)).length,
      bindingsStartedBeforeWindow:d.events.filter(e=>e.kind==='binding'&&e.category===c&&e.t<=after&&
        (e.end===null||d.events[e.end].t>after)).length,
      supportedLinks:links.length,unknownSignalLinks:allLinks.filter(e=>inWindow(e)&&e.supports.some(h=>!h.known&&h.category===c)).length,
      output:{births:categoryBirths.length,detached:categoryBirths.filter(p=>p.detached).length,
        exact:categoryBirths.filter(p=>p.exact).length,supportedExact:categoryBirths.filter(p=>supportByBirth.get(p.id).length).length,
        unsupported:categoryBirths.filter(p=>!supportByBirth.get(p.id).length).length},
      fixedFollowup:{eligibleSupportLinks:eligible.length,linksWithOutputWithin5k:successfulLinks.size,
        exactOutputsWithin5k:followed.length,lateSupportLinks:late.length},
      rates:{availability:rate(totals[c],totals.mature),encounter:rate(geometric.length,free),
        binding:rate(formed.length,geometric.length),use:rate(ended.filter(e=>used.has(e.id)).length,ended.length)}};
  }
  return out;
}
function decide(rows){
  assert.equal(rows.length,16);const seen=new Set();
  for(const r of rows){assert(criteria.seeds.includes(r.seed)&&criteria.arms.includes(r.arm));
    const key=r.seed+':'+r.arm;assert(!seen.has(key));seen.add(key);}
  const on=rows.filter(r=>r.arm==='on'),coverage=on.every(r=>r.coverage.value!==null&&r.coverage.value>=criteria.minimumCoverage);
  const stages={};
  for(const stage of ['availability','encounter','binding','use']){
    const values=on.map(r=>({seed:r.seed,...r.categories.recipient.rates[stage]}));
    const denominators=values.every(r=>r.denominator>0&&
      (stage!=='binding'||r.denominator>=criteria.minimumOpportunities)&&(stage!=='use'||r.denominator>=criteria.minimumEnded));
    const failed=values.filter(r=>[106,108].includes(r.seed)),passed=values.filter(r=>[105,107].includes(r.seed));
    const ordering=values.every(r=>r.value!==null)&&Math.max(...failed.map(r=>r.value))<Math.min(...passed.map(r=>r.value));
    stages[stage]={values,coverage,denominators,ordering,signature:coverage&&denominators&&ordering};
  }
  return {coverage,stages,signatures:Object.entries(stages).filter(([,s])=>s.signature).map(([name])=>name),
    caveat:'Retrospective world ordering is not causal necessity or a rescue of section 62.'};
}
function report(dir){
  const start=process.cpuUsage(),m=verify(dir);
  const provenance={created:new Date().toISOString(),command:process.argv,node:process.version,
    inputManifest:{file:path.join(dir,'manifest.json'),sha256:hash(fs.readFileSync(path.join(dir,'manifest.json')))},
    sources:Object.fromEntries(['experiments/delivery_replay_summary.js','experiments/delivery_replay_test.js',
      'experiments/delivery_replay_analysis_test.js'].map(f=>[f,hash(fs.readFileSync(f))])),replayCpuSeconds:m.cpuSeconds};
  const finish=result=>{const cpu=process.cpuUsage(start);return {...result,provenance,
    analysisCpuSeconds:(cpu.user+cpu.system)/1e6};};
  const rows=[],partial=[];
  for(const item of m.records){
    const r=JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(dir,item.file))));
    if(r.steps===criteria.steps)rows.push(summarize(r));
    else partial.push({seed:r.seed,arm:r.arm,steps:r.steps,agreement:r.agreement,countsFromStart:r.counts});
  }
  if(!m.complete)return finish({status:m.status,interpretable:false,preflight:m.preflight,rows,
    partial,missing:m.jobs.filter(j=>!rows.some(r=>r.seed===j.seed&&r.arm===j.arm)),
    decision:null,caveat:'Completed-world descriptions only. No full-matrix stage decision is permitted.'});
  return finish({status:m.status,interpretable:true,rows,decision:decide(rows)});
}
if(require.main===module){const result=report(process.argv[2]);
  if(process.argv[3])fs.writeFileSync(process.argv[3],JSON.stringify(result,null,2)+'\n',{flag:'wx'});
  else console.log(JSON.stringify(result,null,2));}
module.exports={rate,summarize,decide,report};
