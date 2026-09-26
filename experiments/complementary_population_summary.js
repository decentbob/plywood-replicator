#!/usr/bin/env node
const fs=require('fs'),assert=require('assert/strict');
const {profiles,child}=require('./complementary_fit.js');
const key=r=>[r.seed,r.profile,r.complement].join(':');
function load(prefix) {
  const m=JSON.parse(fs.readFileSync(prefix+'.manifest.json','utf8'));assert(m.complete&&m.completed===m.jobs.length,'Incomplete batch');
  const rows=fs.readFileSync(prefix+'.runs.jsonl','utf8').trim().split(/\r?\n/).map(JSON.parse);
  const [header,...csv]=fs.readFileSync(prefix+'.csv','utf8').trim().split(/\r?\n/),cols=header.split(',');
  const expected=new Set(m.jobs.map(key)),seen=new Set(),rebuilt=[];assert.equal(expected.size,m.jobs.length);assert.equal(rows.length,m.jobs.length);
  for(const r of rows){assert(expected.has(key(r))&&!seen.has(key(r)));seen.add(key(r));assert.equal(r.steps,m.options.steps);
    const [bendA,bendB]=profiles[r.profile];
    for(const [k,v] of Object.entries({seed:r.seed,compCopy:r.complement,bendA,bendB,W:24,H:24,nA:120,nB:120,nE:40,
      seedCount:3,seedSeq:'ABBABA',stiffA:0.5,stiffB:0.5,pFray:0.00003,pUnzip:1,pSoft:0,pUndock:0,bodyJostle:true,iters:4}))assert.equal(r.params[k],v,k);
    assert.equal(r.windows.length,r.steps/10000);assert(r.births.every(b=>!b.prod&&b.t>0&&b.t<=r.steps));
    assert.equal(r.exact,r.births.filter(b=>b.seq===child(b.parent,r.complement)).length);
    for(const [i,w] of r.windows.entries()){
      assert.equal(w.t,(i+1)*10000);assert.equal(w.births,r.births.filter(b=>b.t<=w.t).length);
      const row={...r,...w};rebuilt.push(cols.map(k=>row[k]??'').join(','));
    }
  }
  assert.deepEqual(rebuilt,csv,'CSV/raw mismatch');
  for(const seed of new Set(rows.map(r=>r.seed))){const rs=rows.filter(r=>r.seed===seed);assert.equal(rs.length,4,'Missing factorial cell');
    const clean=p=>Object.fromEntries(Object.entries(p).filter(([k])=>!['compCopy','bendA','bendB'].includes(k)));
    for(const r of rs)assert.deepEqual(clean(r.params),clean(rs[0].params),'Unmatched parameters');}
  return rows;
}
function summary(r) {
  const early=r.windows.find(w=>w.t===20000),late=r.windows.at(-1),lateBirths=r.births.filter(b=>b.t>20000);
  const counts={};for(const b of lateBirths)counts[b.seq]=(counts[b.seq]||0)+1;
  return {seed:r.seed,profile:r.profile,complement:r.complement,births20k:early.births,births:late.births,
    lateBirths:lateBirths.length,maxGen:late.maxGen,activeUnits:late.tpl,meanLength:late.meanLen,
    snapshotExact:r.exact,snapshotDifferent:r.births.length-r.exact,
    laterGenerationBirths:r.births.filter(b=>b.gen>=2).length,
    lateMeanBirthLength:lateBirths.length?lateBirths.reduce((n,b)=>n+b.seq.length,0)/lateBirths.length:null,
    lateSequences:Object.entries(counts).sort((a,b)=>b[1]-a[1])};
}
if(require.main===module){assert(process.argv.length>2);for(const prefix of process.argv.slice(2))for(const r of load(prefix))console.log(JSON.stringify(summary(r)));}
module.exports={load,summary};
