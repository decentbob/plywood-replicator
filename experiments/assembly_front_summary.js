#!/usr/bin/env node
const fs=require('fs'),path=require('path'),crypto=require('crypto'),assert=require('assert/strict');
const {jobsFor,sourceFiles}=require('./assembly_front');
const {validate}=require('./patch_completion_summary');
const key=r=>[r.seed,r.profile,r.arm].join(':');
function validateBatch(m,rs){
  assert(m.complete&&m.completed===m.jobs.length,'Incomplete batch');assert.deepEqual(m.jobs,jobsFor(m.options));
  assert.deepEqual(Object.keys(m.sources).sort(),[...sourceFiles].sort());
  const expected=new Map(m.jobs.map(j=>[key(j),j])),seen=new Set();assert.equal(expected.size,m.jobs.length);assert.equal(rs.length,m.jobs.length);
  for(const r of rs){assert(expected.has(key(r))&&!seen.has(key(r)),'Unexpected or duplicate run');seen.add(key(r));
    for(const[k,v]of Object.entries(expected.get(key(r))))assert.equal(r[k],v);assert(['off','L','R'].includes(r.arm));validate(r);}
  for(const[file,hash]of Object.entries(m.sources)){const raw=fs.readFileSync(path.join(__dirname,file),'utf8'),lf=raw.replace(/\r\n/g,'\n');
    assert([raw,lf,lf.replace(/\n/g,'\r\n')].some(x=>crypto.createHash('sha256').update(x).digest('hex')===hash),'Source mismatch: '+file);}
  return rs;
}
function load(prefix){return validateBatch(JSON.parse(fs.readFileSync(prefix+'.manifest.json')),fs.readFileSync(prefix+'.runs.jsonl','utf8').trim().split(/\r?\n/).map(JSON.parse));}
function summarize(rs){
  assert.equal(new Set(rs.map(key)).size,rs.length);
  const seeds=[...new Set(rs.map(r=>r.seed))],arms=[...new Set(rs.map(r=>r.arm))];assert(arms.includes('off'));
  for(const seed of seeds)for(const profile of ['square','opposed20'])for(const arm of arms)assert(rs.some(r=>r.seed===seed&&r.profile===profile&&r.arm===arm),'Missing paired arm');
  const clean=p=>Object.fromEntries(Object.entries(p).filter(([k])=>!['seed','bendA','bendB'].includes(k)));
  for(const r of rs){assert.deepEqual(clean(r.params),clean(rs[0].params));assert.equal(r.steps,rs[0].steps);}
  const rows=[...rs].sort((a,b)=>a.seed-b.seed||a.profile.localeCompare(b.profile)||a.arm.localeCompare(b.arm)).map(r=>({seed:r.seed,profile:r.profile,arm:r.arm,
    exact20:r.births.filter(b=>b.t<=20000).length,exact50:r.exact,errors:r.births.length-r.exact,nuclei:r.links.filter(e=>e.kind==='nucleation').length,
    merges:r.links.filter(e=>e.kind==='merge').length,unfinished:r.unfinished.map(p=>({length:p.units.length,age:r.steps-p.start})),free:r.windows.at(-1).stats.free}));
  const qualifies=arms.filter(arm=>arm!=='off'&&seeds.every(seed=>{
    const r=rows.find(r=>r.seed===seed&&r.profile==='opposed20'&&r.arm===arm),c=rows.find(r=>r.seed===seed&&r.profile==='opposed20'&&r.arm==='off');
    return r.exact50>c.exact50&&r.exact20>=c.exact20&&rows.filter(r=>r.arm===arm&&r.seed===seed).every(r=>!r.errors);
  }));
  return {rows,qualifies};
}
if(require.main===module){const result=summarize(load(process.argv[2]));for(const row of result.rows)console.log(JSON.stringify(row));console.log(JSON.stringify({qualifies:result.qualifies}));}
module.exports={load,validateBatch,summarize};
