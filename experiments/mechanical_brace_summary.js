#!/usr/bin/env node
const fs=require('fs'),assert=require('assert/strict');
const key=r=>[r.seed,r.fold,r.attached,r.bodyJostle].join(':');
function load(prefix) {
  const m=JSON.parse(fs.readFileSync(prefix+'.manifest.json','utf8'));
  assert(m.complete && m.completed===m.jobs.length,'Incomplete batch');
  const rows=fs.readFileSync(prefix+'.runs.jsonl','utf8').trim().split(/\r?\n/).map(JSON.parse);
  const [header,...csv]=fs.readFileSync(prefix+'.csv','utf8').trim().split(/\r?\n/);
  const cols=header.split(','),expected=new Set(m.jobs.map(key)),seen=new Set();
  assert.equal(expected.size,m.jobs.length);assert.equal(rows.length,m.jobs.length);assert.equal(csv.length,rows.length);
  rows.forEach((r,i)=>{
    assert(expected.has(key(r))&&!seen.has(key(r)),'Unknown or duplicate job');seen.add(key(r));
    assert.equal(csv[i],cols.map(k=>r[k]??'').join(','),'CSV/raw result mismatch');
    const births=r.births.filter(b=>!b.prod),exact=births.filter(b=>b.seq==='ABABBA'&&b.parent==='ABBABA');
    assert.equal(r.total,births.length);assert.equal(r.exact,exact.length);assert.equal(r.other,r.total-r.exact);
    assert.equal(r.firstExact,exact.length?exact[0].t:null);
    assert.equal(r.restrictedFirst,r.firstExact??r.steps);
    assert.equal(r.params.pLinkBare,1);assert.equal(r.params.nE,0);assert.equal(r.params.energyGate,true);
    assert.equal(r.supportOccupancy,r.attached?1:0);
    assert(r.births.every(b=>b.t>0&&b.t<=r.steps));
  });
  return rows;
}
function summarize(rows) {
  assert.equal(new Set(rows.map(key)).size,rows.length,'Duplicate run across files');
  assert.equal(new Set(rows.map(r=>r.steps)).size,1,'Unequal run lengths');
  const conditions=[...new Set(rows.map(r=>r.fold+':'+r.bodyJostle))];
  const results=[];
  for(const condition of conditions) {
    const rs=rows.filter(r=>r.fold+':'+r.bodyJostle===condition),seeds=[...new Set(rs.map(r=>r.seed))];
    const pairs=seeds.map(seed=>{
      const off=rs.find(r=>r.seed===seed&&!r.attached),on=rs.find(r=>r.seed===seed&&r.attached);
      assert(off&&on,'Missing matched arm');
      const clean=p=>Object.fromEntries(Object.entries(p).filter(([k])=>k!=='pBindP'));
      assert.deepEqual(clean(off.params),clean(on.params),'Unexpected paired parameter difference');
      assert.equal(off.params.pBindP,0);assert.equal(on.params.pBindP,0.2);
      return {seed,off,on,difference:on.exact-off.exact};
    });
    results.push({fold:rs[0].fold,bodyJostle:rs[0].bodyJostle,pairs});
  }
  return results;
}
if(require.main===module) {
  assert(process.argv.length>2,'usage: mechanical_brace_summary.js PREFIX [PREFIX ...]');
  const groups=summarize(process.argv.slice(2).flatMap(load));
  console.log('| fold | body jostle | seed | exact, free / attached | first exact, free / attached | bend degrees, free / attached | other births, free / attached |');
  console.log('|---|---|---:|---:|---:|---:|---:|');
  for(const g of groups) for(const {seed,off,on} of g.pairs) console.log(`| ${g.fold} | ${g.bodyJostle} | ${seed} | ${off.exact} / ${on.exact} | ${off.firstExact??'censored'} / ${on.firstExact??'censored'} | ${off.meanBend.toFixed(2)} / ${on.meanBend.toFixed(2)} | ${off.other} / ${on.other} |`);
  console.log('\nEqual-weight seed means; first-copy time uses the run limit for censored runs:');
  for(const g of groups){const mean=(side,k)=>g.pairs.reduce((sum,p)=>sum+p[side][k],0)/g.pairs.length;
    console.log(JSON.stringify({fold:g.fold,bodyJostle:g.bodyJostle,n:g.pairs.length,
      exact:[mean('off','exact'),mean('on','exact')],restrictedFirst:[mean('off','restrictedFirst'),mean('on','restrictedFirst')],
      bend:[mean('off','meanBend'),mean('on','meanBend')],faceOccupancy:[mean('off','faceOccupancy'),mean('on','faceOccupancy')],
      wins:g.pairs.filter(p=>p.difference>0).length,ties:g.pairs.filter(p=>p.difference===0).length,
      noExact:[g.pairs.filter(p=>!p.off.exact).length,g.pairs.filter(p=>!p.on.exact).length]}));
  }
}
module.exports={load,summarize};
