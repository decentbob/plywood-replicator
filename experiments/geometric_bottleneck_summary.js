#!/usr/bin/env node
const fs=require('fs'),assert=require('assert/strict');
const key=r=>[r.seed,r.angle,r.attached,r.mode,r.stiffness,r.iters,r.bodyJostle].join(':');
function load(prefix) {
  const m=JSON.parse(fs.readFileSync(prefix+'.manifest.json','utf8'));
  assert(m.complete&&m.completed===m.jobs.length,'Incomplete batch');
  const rows=fs.readFileSync(prefix+'.runs.jsonl','utf8').trim().split(/\r?\n/).map(JSON.parse);
  const [head,...csv]=fs.readFileSync(prefix+'.csv','utf8').trim().split(/\r?\n/),cols=head.split(',');
  const expected=new Set(m.jobs.map(key)),seen=new Set();assert.equal(expected.size,m.jobs.length);
  assert.equal(rows.length,m.jobs.length);assert.equal(csv.length,rows.length);
  rows.forEach((r,i)=>{
    assert(expected.has(key(r))&&!seen.has(key(r)),'Unknown or duplicate job');seen.add(key(r));
    assert.equal(csv[i],cols.map(k=>r[k]??'').join(','),'CSV/raw mismatch');
    const job=m.jobs.find(j=>key(j)===key(r));for(const k of Object.keys(job))assert.equal(r[k],job[k]);
    for(const [k,v] of Object.entries({seed:r.seed,[r.mode+'B']:r.angle,stiffA:r.stiffness,stiffB:r.stiffness,
      iters:r.iters,bodyJostle:r.bodyJostle,pLinkBare:1,pBindP:r.attached?0.2:0,nE:0,energyGate:true,pFray:0,pSoft:0}))assert.equal(r.params[k],v,k);
    const births=r.births.filter(b=>!b.prod),exact=births.filter(b=>b.seq==='ABABBA'&&b.parent==='ABBABA');
    assert.equal(r.exact,exact.length);assert.equal(r.other,births.length-exact.length);assert.equal(r.firstExact,exact[0]?.t??null);
    assert(r.births.every(b=>b.t>0&&b.t<=r.steps));assert.equal(r.supportOccupancy,r.attached?1:0);
    assert.equal(r.windows.length,Math.ceil(r.steps/5000));let previous=0;
    for(const w of r.windows){assert.equal(w.until,Math.min(previous+5000,r.steps));assert.equal(w.samples,(w.until-previous)/20);previous=w.until;
      assert.equal(w.edges.length,5);
      for(const [index,e] of w.edges.entries()){
        assert.equal(e.index,index);assert.equal(e.pair,'ABBABA'.slice(index,index+2));
        for(const k of ['both','joined','unjoined','eligible','geometryPass','distanceFail','angleFail'])assert(Number.isInteger(e[k])&&e[k]>=0);
        assert.equal(e.both,e.joined+e.unjoined);assert(e.both<=w.samples&&e.eligible<=e.unjoined);
        assert(e.geometryPass<=e.eligible&&e.distanceFail<=e.eligible&&e.angleFail<=e.eligible);
        assert(e.gapSum>=0&&e.angleSum>=0);
      }
    }
    const n=r.windows.reduce((n,w)=>n+w.samples,0);
    for(const [name,k] of [['meanBend','bend'],['faceOccupancy','faceOccupancy'],['supportOccupancy','supportOccupancy']])
      assert.equal(r[name],r.windows.reduce((n,w)=>n+w[k],0)/n);
  });return rows;
}
function edgeSummary(r,index) {
  const es=r.windows.flatMap(w=>w.edges.filter(e=>index===undefined||e.index===index));
  const sum=k=>es.reduce((n,e)=>n+e[k],0),n=sum('eligible');
  return {both:sum('both'),joined:sum('joined'),eligible:n,pass:n?sum('geometryPass')/n:null,
    distanceFail:n?sum('distanceFail')/n:null,angleFail:n?sum('angleFail')/n:null,gap:n?sum('gapSum')/n:null,angle:n?sum('angleSum')/n:null};
}
function summarize(rows) {
  assert.equal(new Set(rows.map(key)).size,rows.length,'Duplicate runs across files');
  const conditions=[...new Set(rows.map(r=>[r.mode,r.angle,r.stiffness,r.iters,r.bodyJostle].join(':')))];
  return conditions.map(condition=>{
    const rs=rows.filter(r=>[r.mode,r.angle,r.stiffness,r.iters,r.bodyJostle].join(':')===condition);
    const seeds=[...new Set(rs.map(r=>r.seed))],pairs=seeds.map(seed=>{
      const off=rs.find(r=>r.seed===seed&&!r.attached),on=rs.find(r=>r.seed===seed&&r.attached);assert(off&&on,'Missing pair');
      const clean=p=>Object.fromEntries(Object.entries(p).filter(([k])=>k!=='pBindP'));
      assert.deepEqual(clean(off.params),clean(on.params),'Unmatched parameters');assert.equal(off.steps,on.steps);
      return {seed,off,on};
    });return {condition,pairs};
  });
}
if(require.main===module) {
  assert(process.argv.length>2,'usage: geometric_bottleneck_summary.js PREFIX...');
  const groups=summarize(process.argv.slice(2).flatMap(load));
  for(const g of groups) {
    const mean=(side,k)=>g.pairs.reduce((n,p)=>n+p[side][k],0)/g.pairs.length;
    console.log(JSON.stringify({condition:g.condition,n:g.pairs.length,exact:[mean('off','exact'),mean('on','exact')],
      bend:[mean('off','meanBend'),mean('on','meanBend')],occupancy:[mean('off','faceOccupancy'),mean('on','faceOccupancy')],
      pairs:g.pairs.map(p=>({seed:p.seed,exact:[p.off.exact,p.on.exact],BB:[edgeSummary(p.off,1),edgeSummary(p.on,1)]}))}));
  }
}
module.exports={load,edgeSummary,summarize};
