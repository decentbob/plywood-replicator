#!/usr/bin/env node
const fs=require('fs'),assert=require('assert/strict');
const {profiles}=require('./curved_fuel.js');
const key=r=>[r.seed,r.rows,r.profile,r.grip,r.mode,r.iters].join(':');
function load(prefix){
  const m=JSON.parse(fs.readFileSync(prefix+'.manifest.json','utf8'));assert(m.complete&&m.completed===m.jobs.length,'Incomplete batch');
  const rows=fs.readFileSync(prefix+'.runs.jsonl','utf8').trim().split(/\r?\n/).map(JSON.parse);
  const [header,...csv]=fs.readFileSync(prefix+'.csv','utf8').trim().split(/\r?\n/),cols=header.split(',');
  const expected=new Set(m.jobs.map(key)),seen=new Set();assert.equal(expected.size,m.jobs.length);assert.equal(rows.length,m.jobs.length);assert.equal(csv.length,rows.length);
  rows.forEach((r,i)=>{
    assert(expected.has(key(r))&&!seen.has(key(r)),'Unknown/duplicate run');seen.add(key(r));assert.equal(r.steps,m.options.steps);
    assert.equal(csv[i],cols.map(k=>r[k]??'').join(','),'CSV/raw mismatch');const [bendA,bendB]=profiles[r.profile];
    for(const[k,v]of Object.entries({seed:r.seed,W:18,H:18,nA:60,nB:60,nE:0,nU:r.mode==='copy'?0:40,sizeU:1.2,
      bendA,bendB,pGrip:r.grip?0.2:0,pocket:true,compCopy:true,stiffA:0.5,stiffB:0.5,pUndock:0.1,pFray:0,pSoft:0,iters:r.iters}))assert.equal(r.params[k],v,k);
    assert.equal(r.total,r.births.length);assert.equal(r.family,r.births.filter(b=>b.seq==='AAAABBBB'&&b.parent==='AAAABBBB').length);
    assert.equal(r.fuelUsed,r.events.length);assert.equal(new Set(r.events.map(e=>e.unit)).size,r.events.length);
    for(const e of r.events)assert(e.t>0&&e.t<=r.steps&&Number.isInteger(e.unit)&&e.unit>=0&&e.unit<120&&['A','B'].includes(e.letter));
    for(const b of r.births)assert(b.t>0&&b.t<=r.steps&&b.gen>=1&&!b.prod&&/^[AB]+$/.test(b.seq));
    assert.equal(r.windows.length,r.steps/10000);
    for(const [j,w]of r.windows.entries()){assert.equal(w.t,(j+1)*10000);assert.equal(w.births,r.births.filter(b=>b.t<=w.t).length);assert.equal(w.fuelUsed,r.events.filter(e=>e.t<=w.t).length);}
    assert.equal(r.free,r.windows.at(-1).free);assert.equal(r.maxGen,r.windows.at(-1).maxGen);
    if(r.mode==='copy'){assert.equal(r.fuelUsed,0);assert(r.births.every(b=>b.gen===1));}
    if(r.mode==='bootstrap'&&!r.grip){assert.equal(r.fuelUsed,0);assert.equal(r.total,0);}
  });return rows;
}
function summarize(rows){assert.equal(new Set(rows.map(key)).size,rows.length,'Duplicate runs');
  const groups=[...new Set(rows.map(r=>[r.mode,r.rows,r.iters].join(':')))];
  return groups.map(group=>{const rs=rows.filter(r=>[r.mode,r.rows,r.iters].join(':')===group),seeds=[...new Set(rs.map(r=>r.seed))];
    for(const seed of seeds){const arms=rs.filter(r=>r.seed===seed);assert.equal(arms.length,rs[0].mode==='copy'?2:4,'Missing arm');
      const clean=p=>Object.fromEntries(Object.entries(p).filter(([k])=>!['bendA','bendB','pGrip'].includes(k)));
      for(const r of arms){assert.deepEqual(clean(r.params),clean(arms[0].params));assert.equal(r.steps,arms[0].steps);}}
    return {group,runs:rs.map(r=>({seed:r.seed,profile:r.profile,grip:r.grip,total:r.total,family:r.family,
      late:r.births.filter(b=>b.t>20000).length,laterGen:r.births.filter(b=>b.gen>=2).length,
      fuel:r.fuelUsed,maxGen:r.maxGen,free:r.free,sequences:[...new Set(r.births.map(b=>b.seq))]}))};});}
if(require.main===module){assert(process.argv.length>2);for(const g of summarize(process.argv.slice(2).flatMap(load)))console.log(JSON.stringify(g));}
module.exports={load,summarize};
