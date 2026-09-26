#!/usr/bin/env node
const fs=require('fs'),assert=require('assert/strict');
const {profiles}=require('./curved_fuel.js');
const key=r=>[r.seed,r.rows,r.profile,r.iters].join(':');
function load(prefix){
  const m=JSON.parse(fs.readFileSync(prefix+'.manifest.json','utf8'));assert(m.complete&&m.completed===m.jobs.length,'Incomplete batch');
  const rows=fs.readFileSync(prefix+'.runs.jsonl','utf8').trim().split(/\r?\n/).map(JSON.parse),seen=new Set(),expected=new Set(m.jobs.map(key));
  const [head,...csv]=fs.readFileSync(prefix+'.csv','utf8').trim().split(/\r?\n/),cols=head.split(',');
  assert.equal(rows.length,m.jobs.length);assert.equal(csv.length,rows.length);assert.equal(expected.size,m.jobs.length);
  rows.forEach((r,i)=>{
    assert(expected.has(key(r))&&!seen.has(key(r)),'Unknown/duplicate job');seen.add(key(r));assert.equal(r.steps,m.options.steps);
    assert.equal(csv[i],cols.map(k=>r[k]??'').join(','),'CSV/raw mismatch');const [bendA,bendB]=profiles[r.profile];
    for(const[k,v]of Object.entries({seed:r.seed,nA:r.rows*4,nB:r.rows*4,nE:0,nU:40,sizeU:1.2,W:12,H:12,
      pFray:0,pSoft:0,pocket:true,pGrip:0.2,bendA,bendB,iters:r.iters}))assert.equal(r.params[k],v,k);
    assert.equal(r.events.length,r.armed);assert.equal(new Set(r.events.map(e=>e.index)).size,r.armed);assert.equal(r.perRow,r.armed/r.rows);
    for(const e of r.events){assert(e.t>0&&e.t<=r.steps&&Number.isInteger(e.index)&&e.index>=0&&e.index<r.rows*8);
      assert.equal(e.letter,'AAAABBBB'[e.index%8]);assert(e.holders.length>=2&&e.holders.every(h=>h.side===2&&Number.isInteger(h.index)&&h.index>=0&&h.index<r.rows*8));
      assert(e.holders.some(h=>h.index===e.index));}
    const byRow=Array.from({length:r.rows},(_,row)=>{const es=r.events.filter(e=>Math.floor(e.index/8)===row);
      return {row,armed:es.length,armedA:es.filter(e=>e.letter==='A').length,completeTime:es.length===8?es.at(-1).t:null};});
    assert.deepEqual(r.byRow,byRow);assert.equal(r.completeRows,byRow.filter(r=>r.completeTime!==null).length);
    const cross=r.events.filter(e=>e.holders.some(h=>Math.floor(h.index/8)!==Math.floor(e.index/8)));
    assert.equal(r.cross,cross.length);assert.equal(r.crossA,cross.filter(e=>e.letter==='A').length);assert.equal(r.armedA,r.events.filter(e=>e.letter==='A').length);
    assert.equal(r.windows.length,r.steps/10000);
    for(const [j,w]of r.windows.entries()){assert.equal(w.until,(j+1)*10000);const es=r.events.filter(e=>e.t<=w.until);
      assert.equal(w.armed,es.length);assert.equal(w.fuelUsed,es.length);assert.deepEqual(w.armedByRow,byRow.map(row=>es.filter(e=>Math.floor(e.index/8)===row.row).length));}
  });return rows;
}
function summarize(rows){assert.equal(new Set(rows.map(key)).size,rows.length,'Duplicate run across files');
  const cells=[...new Set(rows.map(r=>[r.rows,r.iters].join(':')))];
  return cells.map(cell=>{const rs=rows.filter(r=>[r.rows,r.iters].join(':')===cell),seeds=[...new Set(rs.map(r=>r.seed))];
    const pairs=seeds.map(seed=>{const off=rs.find(r=>r.seed===seed&&r.profile==='square'),on=rs.find(r=>r.seed===seed&&r.profile==='opposed20');
      assert(off&&on,'Missing shape control');const clean=p=>Object.fromEntries(Object.entries(p).filter(([k])=>!['bendA','bendB'].includes(k)));
      assert.deepEqual(clean(off.params),clean(on.params),'Unexpected parameter difference');assert.equal(off.steps,on.steps);
      return {seed,square:off,curved:on};});return {cell,pairs};});}
if(require.main===module){assert(process.argv.length>2);for(const g of summarize(process.argv.slice(2).flatMap(load)))console.log(JSON.stringify({cell:g.cell,pairs:g.pairs.map(p=>({seed:p.seed,
  armedPerRow:[p.square.perRow,p.curved.perRow],complete:[p.square.completeRows,p.curved.completeRows],crossA:[p.square.crossA,p.curved.crossA],armedA:[p.square.armedA,p.curved.armedA]}))}));}
module.exports={load,summarize};
