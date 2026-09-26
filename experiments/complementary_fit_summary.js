#!/usr/bin/env node
const fs=require('fs'),assert=require('assert/strict');
const {child,profiles}=require('./complementary_fit.js');
const {edgeSummary}=require('./geometric_bottleneck_summary.js');
const key=r=>[r.seed,r.profile,r.complement,r.sequence,r.iters,r.bodyJostle].join(':');
function load(prefix) {
  const m=JSON.parse(fs.readFileSync(prefix+'.manifest.json','utf8'));assert(m.complete&&m.completed===m.jobs.length,'Incomplete batch');
  const rows=fs.readFileSync(prefix+'.runs.jsonl','utf8').trim().split(/\r?\n/).map(JSON.parse);
  const [head,...csv]=fs.readFileSync(prefix+'.csv','utf8').trim().split(/\r?\n/),cols=head.split(',');
  const expected=new Set(m.jobs.map(key)),seen=new Set();assert.equal(expected.size,m.jobs.length);
  assert.equal(rows.length,m.jobs.length);assert.equal(csv.length,rows.length);
  rows.forEach((r,i)=>{
    assert(expected.has(key(r))&&!seen.has(key(r)),'Unknown or duplicate job');seen.add(key(r));
    assert.equal(csv[i],cols.map(k=>r[k]??'').join(','),'CSV/raw mismatch');
    const job=m.jobs.find(j=>key(j)===key(r));for(const k of Object.keys(job))assert.equal(r[k],job[k]);
    const [bendA,bendB]=profiles[r.profile];
    for(const [k,v] of Object.entries({seed:r.seed,bendA,bendB,compCopy:r.complement,iters:r.iters,bodyJostle:r.bodyJostle,
      nA:60,nB:60,nE:0,energyGate:true,stiffA:0.5,stiffB:0.5,pFray:0,pSoft:0,pHyb:0,pCapture:0,pLigate:0,pSpont:0}))assert.equal(r.params[k],v,k);
    assert.equal(r.expected,child(r.sequence,r.complement));
    const exact=r.births.filter(b=>b.seq===r.expected&&b.parent===r.sequence);
    assert.equal(r.exact,exact.length);assert.equal(r.other,r.births.length-exact.length);assert.equal(r.firstExact,exact[0]?.t??null);
    assert(r.births.every(b=>!b.prod&&b.t>0&&b.t<=r.steps));assert.equal(r.windows.length,Math.ceil(r.steps/5000));
    let previous=0;
    for(const w of r.windows){assert.equal(w.until,Math.min(previous+5000,r.steps));assert.equal(w.samples,(w.until-previous)/20);previous=w.until;
      assert.equal(w.edges.length,5);assert.equal(w.supportOccupancy,0);
      for(const [index,e] of w.edges.entries()){
        assert.equal(e.index,index);assert.equal(e.pair,r.sequence.slice(index,index+2));
        for(const k of ['both','joined','unjoined','eligible','geometryPass','distanceFail','angleFail'])assert(Number.isInteger(e[k])&&e[k]>=0);
        assert.equal(e.both,e.joined+e.unjoined);assert(e.both<=w.samples&&e.eligible<=e.unjoined);
        assert(e.geometryPass<=e.eligible&&e.distanceFail<=e.eligible&&e.angleFail<=e.eligible);
        assert(e.gapSum>=0&&e.angleSum>=0);
      }
    }
    const n=r.windows.reduce((n,w)=>n+w.samples,0);
    for(const [name,k] of [['meanBend','bend'],['faceOccupancy','faceOccupancy']])assert.equal(r[name],r.windows.reduce((n,w)=>n+w[k],0)/n);
  });return rows;
}
function summarize(rows) {
  assert.equal(new Set(rows.map(key)).size,rows.length,'Duplicate runs across files');
  const conditions=[...new Set(rows.map(r=>[r.profile,r.sequence,r.iters,r.bodyJostle].join(':')))];
  return conditions.map(condition=>{
    const rs=rows.filter(r=>[r.profile,r.sequence,r.iters,r.bodyJostle].join(':')===condition);
    const seeds=[...new Set(rs.map(r=>r.seed))],pairs=seeds.map(seed=>{
      const off=rs.find(r=>r.seed===seed&&!r.complement),on=rs.find(r=>r.seed===seed&&r.complement);assert(off&&on,'Missing paired mode');
      const clean=p=>Object.fromEntries(Object.entries(p).filter(([k])=>k!=='compCopy'));
      assert.deepEqual(clean(off.params),clean(on.params),'Unexpected parameter difference');assert.equal(off.steps,on.steps);
      return {seed,off,on};});return {condition,pairs};
  });
}
function contrasts(rows) {
  const groups=summarize(rows),out=[];
  for(const g of groups.filter(g=>g.pairs[0].off.profile==='opposed')) {
    const r=g.pairs[0].off,control=groups.find(h=>h.pairs[0].off.profile==='square'&&h.pairs[0].off.sequence===r.sequence&&
      h.pairs[0].off.iters===r.iters&&h.pairs[0].off.bodyJostle===r.bodyJostle);
    assert(control,'Missing square control');assert.equal(control.pairs.length,g.pairs.length);
    const effects=g.pairs.map(p=>{const q=control.pairs.find(q=>q.seed===p.seed);assert(q,'Missing square seed');
      const clean=params=>Object.fromEntries(Object.entries(params).filter(([k])=>!['compCopy','bendA','bendB'].includes(k)));
      assert.deepEqual(clean(p.off.params),clean(q.off.params),'Unexpected square-control parameter difference');
      assert.equal(p.off.steps,q.off.steps);const shape=p.on.exact-p.off.exact,square=q.on.exact-q.off.exact;
      return {seed:p.seed,shape,square,interaction:shape-square};});
    out.push({sequence:r.sequence,iters:r.iters,bodyJostle:r.bodyJostle,effects,
      meanInteraction:effects.reduce((s,e)=>s+e.interaction,0)/effects.length});
  }return out;
}
if(require.main===module) {
  assert(process.argv.length>2,'usage: complementary_fit_summary.js PREFIX...');
  const rows=process.argv.slice(2).flatMap(load),groups=summarize(rows);
  for(const g of groups){const mean=(side,k)=>g.pairs.reduce((n,p)=>n+p[side][k],0)/g.pairs.length;
    console.log(JSON.stringify({condition:g.condition,n:g.pairs.length,exact:[mean('off','exact'),mean('on','exact')],
      bend:[mean('off','meanBend'),mean('on','meanBend')],docks:[mean('off','docks'),mean('on','docks')],
      pairs:g.pairs.map(p=>({seed:p.seed,exact:[p.off.exact,p.on.exact],edge1:[edgeSummary(p.off,1),edgeSummary(p.on,1)]}))}));}
  for(const c of contrasts(rows))console.log(JSON.stringify({contrast:c}));
}
module.exports={load,summarize,contrasts};
