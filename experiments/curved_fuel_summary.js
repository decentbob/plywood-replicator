#!/usr/bin/env node
const fs=require('fs'),assert=require('assert/strict');
const {profiles}=require('./curved_fuel.js');
const key=r=>[r.seed,r.sequence,r.profile,r.size,r.iters,r.bodyJostle,r.grip].join(':');
function load(prefix) {
  const m=JSON.parse(fs.readFileSync(prefix+'.manifest.json','utf8'));assert(m.complete&&m.completed===m.jobs.length,'Incomplete batch');
  const rows=fs.readFileSync(prefix+'.runs.jsonl','utf8').trim().split(/\r?\n/).map(JSON.parse);
  const [head,...csv]=fs.readFileSync(prefix+'.csv','utf8').trim().split(/\r?\n/),cols=head.split(',');
  const expected=new Set(m.jobs.map(key)),seen=new Set();assert.equal(expected.size,m.jobs.length);assert.equal(rows.length,m.jobs.length);assert.equal(csv.length,rows.length);
  rows.forEach((r,i)=>{
    assert(expected.has(key(r))&&!seen.has(key(r)),'Duplicate/unknown job');seen.add(key(r));assert.equal(r.steps,m.options.steps);
    assert.equal(csv[i],cols.map(k=>r[k]??'').join(','),'CSV/raw mismatch');
    const [bendA,bendB]=profiles[r.profile],nA=[...r.sequence].filter(x=>x==='A').length;
    for(const [k,v]of Object.entries({seed:r.seed,bendA,bendB,nA,nB:8-nA,nE:0,nU:40,sizeU:r.size,pocket:true,compCopy:true,
      iters:r.iters,bodyJostle:r.bodyJostle,pGrip:r.grip?0.2:0,pFray:0,pSoft:0}))assert.equal(r.params[k],v,k);
    assert.equal(r.armed,r.events.length);assert.equal(new Set(r.events.map(e=>e.index)).size,r.armed);assert(r.armed<=8);
    for(const e of r.events){assert(e.t>0&&e.t<=r.steps&&e.index>=0&&e.index<8);assert.equal(e.letter,r.sequence[e.index]);
      assert(e.holders.length>=2&&e.holders.every(h=>h.side===2&&Number.isInteger(h.index)&&h.index>=0&&h.index<8));
      assert(e.holders.some(h=>h.index===e.index));}
    assert.equal(r.armedA,r.events.filter(e=>e.letter==='A').length);assert.equal(r.armedB,r.armed-r.armedA);
    assert.equal(r.firstArming,r.events[0]?.t??null);assert.equal(r.completeTime,r.armed===8?r.events.at(-1).t:null);
    assert.equal(r.windows.length,Math.ceil(r.steps/10000));let prev=0;
    for(const w of r.windows){assert.equal(w.until,Math.min(prev+10000,r.steps));assert.equal(w.samples,(w.until-prev)/100);prev=w.until;
      assert.equal(w.armed,r.events.filter(e=>e.t<=w.until).length);assert.equal(w.fuelUsed,w.armed);
      for(const k of ['armedSum','held1','held2'])assert(Number.isInteger(w[k])&&w[k]>=0);
      assert(w.armedSum<=8*w.samples&&w.held1+w.held2<=40*w.samples);}
    const n=r.windows.reduce((n,w)=>n+w.samples,0);
    assert.equal(r.meanBend,r.windows.reduce((n,w)=>n+w.bendSum,0)/n);assert.equal(r.meanArmed,r.windows.reduce((n,w)=>n+w.armedSum,0)/n);
  });return rows;
}
function summarize(rows) {
  assert.equal(new Set(rows.map(key)).size,rows.length,'Duplicate run across batches');
  const conditions=[...new Set(rows.map(r=>[r.sequence,r.size,r.iters,r.bodyJostle,r.grip].join(':')))];
  return conditions.map(condition=>{
    const rs=rows.filter(r=>[r.sequence,r.size,r.iters,r.bodyJostle,r.grip].join(':')===condition),seeds=[...new Set(rs.map(r=>r.seed))];
    const shapes=[...new Set(rs.map(r=>r.profile))];
    for(const seed of seeds){const paired=rs.filter(r=>r.seed===seed);assert.equal(paired.length,shapes.length,'Missing shape arm');
      const clean=p=>Object.fromEntries(Object.entries(p).filter(([k])=>!['bendA','bendB'].includes(k)));
      for(const r of paired){assert.deepEqual(clean(r.params),clean(paired[0].params),'Unmatched shape parameters');assert.equal(r.steps,paired[0].steps);}}
    return {condition,n:seeds.length,profiles:shapes.map(profile=>{const runs=rs.filter(r=>r.profile===profile),mean=k=>runs.reduce((n,r)=>n+r[k],0)/runs.length;
      return {profile,meanArmed:mean('armed'),armedA:mean('armedA'),armedB:mean('armedB'),meanBend:mean('meanBend'),complete:runs.filter(r=>r.completeTime!==null).length,
        perSeed:runs.map(r=>({seed:r.seed,armed:r.armed,indices:r.events.map(e=>e.index),first:r.firstArming,complete:r.completeTime}))};})};
  });
}
if(require.main===module){assert(process.argv.length>2);for(const g of summarize(process.argv.slice(2).flatMap(load)))console.log(JSON.stringify(g));}
module.exports={load,summarize};
