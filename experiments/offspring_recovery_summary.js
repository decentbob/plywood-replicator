#!/usr/bin/env node
const fs=require('fs'),assert=require('assert/strict');
const {I_DOCK,I_REPEL,I_TPL}=require('../src/sim.js');
const key=r=>r.seed+':'+r.profile;
function load(prefix){
  const m=JSON.parse(fs.readFileSync(prefix+'.manifest.json'));assert(m.complete&&m.completed===m.jobs.length,'Incomplete batch');
  const runs=fs.readFileSync(prefix+'.runs.jsonl','utf8').trim().split(/\r?\n/).map(JSON.parse),seen=new Set(),expected=new Set(m.jobs.map(key));
  assert.equal(expected.size,m.jobs.length);assert.equal(runs.length,m.jobs.length);
  for(const r of runs){assert(expected.has(key(r))&&!seen.has(key(r)),'Unknown/duplicate run');seen.add(key(r));assert.equal(r.steps,m.options.steps);
    for(const [k,v]of Object.entries({seed:r.seed,nA:60,nB:60,nU:40,nE:0,W:18,H:18,pFray:0,pSoft:0,pGrip:0.2,pUndock:0.1,energyGate:true,
      bendA:r.profile==='square'?0:-20,bendB:r.profile==='square'?0:20,iters:4,stiffA:0.5,stiffB:0.5}))assert.equal(r.params[k],v,k);
    const owner=new Map(),times=new Map();for(const e of r.rearms){assert(e.t>0&&e.t<=r.steps&&!times.has(e.u));times.set(e.u,e.t);}
    assert.equal(r.rows.length,4+r.births.length);
    for(const [i,row]of r.rows.entries()){
      assert.equal(row.id,i);assert.equal(row.units.length,8);assert.equal(row.seq,'AAAABBBB');assert(row.units.every(u=>Number.isInteger(u)&&u>=0&&u<120&&!owner.has(u)));
      if(i<4){assert.equal(row.born,0);assert.equal(row.gen,0);assert.deepEqual(row.parentUnits,[]);assert.deepEqual(row.parentRows,[]);}
      else{const b=r.births[i-4];assert.equal(row.born,b.t);assert.equal(row.gen,b.gen);assert.equal(row.seq,b.seq);
        assert.equal(row.parentUnits.length,8);assert.equal(row.parentRows.length,1);const parent=row.parentRows[0];assert(Number.isInteger(parent)&&parent<i);
        assert(row.parentUnits.every(u=>owner.get(u)===parent));assert.equal(r.rows[parent].seq,b.parent);assert.equal(row.gen,r.rows[parent].gen+1);}
      row.units.forEach(u=>owner.set(u,i));
      const full=row.units.every(u=>times.has(u))?Math.max(row.born,...row.units.map(u=>times.get(u))):null;assert.equal(row.fullAt,full);
      for(const k of ['firstDock','firstJoined'])assert(row[k]===null||(row[k]>=row.born&&row[k]<=r.steps&&row[k]%100===0));
      assert(Number.isInteger(row.maxDock)&&row.maxDock>=0&&row.maxDock<=8);
      assert.deepEqual(row.children,r.rows.filter(c=>c.parentRows.length===1&&c.parentRows[0]===i).map(c=>c.id));
    }
    assert.equal(r.windows.length,r.steps/10000);
    for(const [i,w]of r.windows.entries()){
      assert.equal(w.t,(i+1)*10000);assert.equal(w.stats.t,w.t);const known=r.rows.filter(row=>row.born<=w.t);
      assert.equal(w.stats.births,known.length-4);assert.equal(w.stats.fuelUsed,r.rearms.filter(e=>e.t<=w.t).length);
      assert.equal(w.rows.length,known.length);assert.equal(w.material.founders,32);assert.equal(w.material.offspring,(known.length-4)*8);
      assert.equal(w.material.free,w.stats.free);assert(Object.values(w.material).every(n=>Number.isInteger(n)&&n>=0));assert.equal(Object.values(w.material).reduce((a,b)=>a+b,0),120);
      const used=new Set(known.flatMap(row=>row.units));let linked=0;
      for(const u of w.unlogged){assert(u.units.length>=2&&u.states.length===u.units.length&&u.parents.length===u.units.length);linked+=u.units.length;
        for(const x of u.units){assert(!used.has(x)&&x>=0&&x<120);used.add(x);}assert(u.states.every(st=>[I_DOCK,I_REPEL,I_TPL].includes(st)));
        assert(u.attached>=0&&u.attached<=u.states.filter(st=>st===I_DOCK).length);}
      assert.equal(linked,w.material.unloggedLinked);
      for(const row of w.rows){const target=r.rows[row.id];assert(target&&target.born<=w.t);
        const armed=target.units.flatMap((u,j)=>times.has(u)&&times.get(u)<=w.t?[j]:[]);assert.deepEqual(row.armed,armed);
        assert.deepEqual(row.waiting,Array.from({length:8},(_,j)=>j).filter(j=>!armed.includes(j)));assert.equal(new Set(row.docked).size,row.docked.length);
        assert(row.docked.every(j=>armed.includes(j)));assert(row.joined>=0&&row.joined<=row.docked.length);}
    }
  }return runs;
}
function summarize(runs){assert.equal(new Set(runs.map(key)).size,runs.length,'Duplicate run');
  for(const seed of new Set(runs.map(r=>r.seed))){const pair=runs.filter(r=>r.seed===seed);assert.equal(pair.length,2,'Missing shape arm');
    const clean=p=>Object.fromEntries(Object.entries(p).filter(([k])=>!['bendA','bendB'].includes(k)));assert.deepEqual(clean(pair[0].params),clean(pair[1].params));}
  return runs.map(r=>{const born=r.rows.slice(4),early=born.filter(row=>row.born<=50000),final=r.windows.at(-1),half=r.windows[4];
    const count=rs=>({n:rs.length,full:rs.filter(row=>row.fullAt!==null).length,productive:rs.filter(row=>row.children.length).length,
      docked:rs.filter(row=>row.firstDock!==null).length,joined:rs.filter(row=>row.firstJoined!==null).length});
    return {seed:r.seed,profile:r.profile,early:count(early),all:count(born),material:final.material,halfMaterial:half?.material,
      offspring:born.map(row=>({id:row.id,born:row.born,fullAt:row.fullAt,armed:final.rows.find(x=>x.id===row.id).armed.length,
        firstJoined:row.firstJoined,maxDock:row.maxDock,children:row.children.length})),
      unlogged:final.unlogged.map(u=>({length:u.units.length,attached:u.attached,states:u.states,parents:u.parents}))};});}
if(require.main===module){assert(process.argv.length>2);for(const r of summarize(process.argv.slice(2).flatMap(load)))console.log(JSON.stringify(r));}
module.exports={load,summarize};
