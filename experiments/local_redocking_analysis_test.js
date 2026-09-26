#!/usr/bin/env node
const fs=require('fs'),assert=require('assert/strict');
const a=require('./local_redocking_summary'),screen=require('./local_redocking_screen_summary');
const selected=JSON.parse(fs.readFileSync(process.argv[2]||'experiments/out/RD_selected.json'));
a.validate(selected);assert.deepEqual(a.qualified(selected.results),[0.0001,0.001]);
let count=0;const bad=change=>{const x=structuredClone(selected);change(x);assert.throws(()=>a.validate(x));count++;};
bad(x=>x.neutral=false);bad(x=>x.executedSteps++);bad(x=>x.results.pop());bad(x=>x.results[1].rate=1);
bad(x=>x.inputHash='0'.repeat(64));bad(x=>x.sources['src/sim.js']='0'.repeat(64));
bad(x=>x.results[2].events.find(e=>e.kind==='endpoint-release').state=1);
bad(x=>x.results[2].events.find(e=>e.kind==='endpoint-redock').face=-1);
bad(x=>x.results[2].events.find(e=>e.kind==='unlink').i=1);
bad(x=>x.results[2].events.find(e=>e.kind==='link').u=-1);
bad(x=>x.results[2].events.find(e=>e.kind==='endpoint-release').units.pop());
bad(x=>x.results[2].settled[0].units.pop());bad(x=>x.results[2].settled[0].t=15001);
bad(x=>x.results[2].settled.push(x.results[2].settled[0]));bad(x=>x.results[2].settled[0].seq='wrong');
bad(x=>x.results[2].settled=[]);
bad(x=>x.results[2].windows[0].rows.pop());bad(x=>x.results[2].windows[0].stats.free++);
bad(x=>x.results[2].final.p.pFray=1);bad(x=>x.results[2].stockBirths.pop());
const low=a.summarize(selected.results[2]);assert.equal(low.reused.length,1);
assert(low.reused[0].episodes.some(e=>e.u===107&&e.t===18280));assert.equal(low.reused[0].t,31568);
const high=a.summarize(selected.results[4]);assert.equal(high.exact,1);assert.equal(high.stockExact,0);
if(process.argv[3]||fs.existsSync('experiments/out/RD_screen.json')){
  const r=JSON.parse(fs.readFileSync(process.argv[3]||'experiments/out/RD_screen.json'));screen.validate(r);const result=screen.summary(r);
  assert.equal(result.qualifies,false);assert.deepEqual(result.rows.filter(x=>x.mode==='seek'&&x.profile==='opposed20').map(x=>[x.exact,x.partial,x.reused.length]),[[5,1,1],[7,0,4]]);
  for(const change of [x=>x.results.reverse(),x=>x.results[0].seed++,x=>x.results[0].prepared.state.p.pUndock=0.3,x=>x.results[0].windows[0].stats.docked++,x=>x.neutral=false]){
    const x=structuredClone(r);change(x);assert.throws(()=>screen.validate(x));count++;
  }
}
console.log(`PASS: source/input hashes, event-order graph and 150-block reconstruction, release/redock provenance, intact reuse, independent completion and ${count} corrupted datasets`);
