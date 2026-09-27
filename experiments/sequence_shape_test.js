#!/usr/bin/env node
const assert=require('assert/strict');
const {Sim,T_A,T_B,T_U,L,R,K,I_TPL}=require('../src/sim.js');
const {setup,observe,metrics,run}=require('./sequence_shape.js');
const job={seed:199,sequence:'AAAABBBB',profile:'opposed20',grip:true,steps:4000};
const a=setup(job),b=setup(job),o=observe(a.s,a.founders);
for(let t=0;t<4000;t+=100){a.s.run(100);o.sample();b.s.run(100);}
assert.deepEqual(a.s.saveState(),b.s.saveState(),'Observer changes physical arrays, counters or RNG');
const state=JSON.parse(JSON.stringify(b.s.saveState())),c=Sim.fromState(state);
b.s.run(500);c.run(500);
const bs=b.s.saveState(),cs=c.saveState();
// Restore rebuilds the pin cache once; this cache version is not physical state.
delete bs.nums.pinsVersion;delete cs.nums.pinsVersion;
assert.deepEqual(bs,cs,'Restart mismatch');
const off=setup({...job,grip:false});
for(const k of ['type','is','bond','px','py','pa','ox','oy'])assert.deepEqual(off.s[k],setup(job).s[k]);
const noFuel=run({...job,grip:false});assert.equal(noFuel.metrics.fuel,0);assert.equal(noFuel.metrics.primary,0);

// Construct explicit histories to test attribution independently of chance births.
const f=setup(job),v=observe(f.s,f.founders),s=f.s;
const fuel=Array.from(s.type).indexOf(T_U),host=f.founders[0][0];
s._link(fuel,L,host,K);assert.equal(v.rows[0].lost,null,'Fuel-side L is not a letter lateral edit');
s._unlink(fuel,L);assert.equal(v.rows[0].lost,null,'Fuel unbinding invalidated a row');
s._link(host,K,fuel,R);s._unlink(host,K);assert.equal(v.rows[0].lost,null);
function child(parent){
  s.t+=100;
  const used=new Set(v.rows.flatMap(r=>r.units)),units=[];
  for(const pu of [...parent].reverse()){
    const want=s.type[pu]===T_A?T_B:T_A;
    const u=Array.from({length:120},(_,i)=>i).find(i=>!used.has(i)&&s.type[i]===want);
    assert.notEqual(u,undefined);used.add(u);units.push(u);s.is[u]=I_TPL;s.parentOf[u]=pu;s._event('release',u);
  }
  for(let i=1;i<units.length;i++)s._link(units[i-1],R,units[i],L);
  s._event('birth',units[0]);return units;
}
const c1=child(f.founders[0]),c2=child(c1);
assert.equal(v.rows[4].depth,1);assert.equal(v.rows[5].depth,2);
const r={...job,steps:s.t,rows:v.rows,samples:[v.sample()]};assert.equal(metrics(r).primary,1);
const fullAt=v.rows[4].fullAt;v.rows[4].fullAt=null;
assert.equal(metrics(r).primary,0,'Partly rearmed parents cannot pass the primary');v.rows[4].fullAt=fullAt;
s._unlink(c2[0],R);s._link(c2[0],R,c2[1],L);
child(c2);assert.equal(v.rows[6].parent,null,'Rejoined IDs falsely revived a retired parent');
assert.equal(v.rows[6].depth,null);
const mismatched=child(f.founders[1]);
assert.equal(v.rows.at(-1).depth,1);
assert.equal(new Set(mismatched).size,8);
const shuffled=[...f.founders[2]];[shuffled[0],shuffled[1]]=[shuffled[1],shuffled[0]];
child(shuffled);assert.equal(v.rows.at(-1).parent,null,'Same sequence with wrong member registration must fail');
console.log('PASS: observer neutrality, restart, matched fuel ablation, conservation, physical parent mapping and recycled-ID rejection');
