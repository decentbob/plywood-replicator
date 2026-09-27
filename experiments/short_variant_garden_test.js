#!/usr/bin/env node
const assert=require('assert/strict');
const {Sim,T_A,T_B,T_U,L,R,K,I_TPL,I_REPEL,S}=require('../src/sim.js');
const {setup,observe,metrics,run,complement}=require('./short_variant_garden.js');
const {decision,evidence}=require('./short_variant_garden_summary.js');
const physical=s=>{const v=s.saveState();delete v.nums.pinsVersion;return v;};
const job={seed:299,sequence:'ABABA',profile:'opposed20',grip:true,steps:4000};
for(const sequence of ['ABABA','AABAB'])for(const profile of ['square','opposed20']){
  const j={...job,sequence,profile},a=setup(j),b=setup(j),o=observe(a.s,a.founders);
  for(let i=0;i<20;i++){a.s.run(100);o.sample();b.s.run(100);}
  assert.deepEqual(a.s.saveState(),b.s.saveState(),'Observer changed physics/RNG');
  const c=Sim.fromState(b.s.saveState());b.s.run(500);c.run(500);assert.deepEqual(physical(b.s),physical(c));
  const off=setup({...j,grip:false});
  for(const k of ['type','is','bond','px','py','pa','ox','oy'])assert.deepEqual(off.s[k],setup(j).s[k]);
  assert.deepEqual(a.founders.map((us,i)=>us.map(u=>a.s._letter(u)).join('')),
    [sequence,complement(sequence),sequence,complement(sequence)]);
}
const r=run(job);evidence(r);
assert.equal(run({...job,grip:false,steps:1000}).metrics.primary,0);

const {s,founders}=setup(job),o=observe(s,founders),fuel=Array.from(s.type).indexOf(T_U),host=founders[0][0];
s._link(fuel,L,host,K);assert.equal(o.rows[0].lost,null);
s._unlink(fuel,L);assert.equal(o.rows[0].lost,null);
s._link(host,K,fuel,R);s._unlink(host,K);assert.equal(o.rows[0].lost,null);
function child(parent,fueled=true){
  s.t+=100;const used=new Set(o.rows.flatMap(p=>p.units)),units=[];
  for(const pu of [...parent].reverse()){
    const want=s.type[pu]===T_A?T_B:T_A,u=Array.from({length:120},(_,i)=>i).find(i=>!used.has(i)&&s.type[i]===want);
    assert.notEqual(u,undefined);used.add(u);units.push(u);s.is[u]=I_REPEL;s.parentOf[u]=pu;s._event('release',u);
  }
  for(let i=1;i<units.length;i++)s._link(units[i-1],R,units[i],L);
  for(const u of units){
    s.is[u]=I_TPL;
    if(fueled){
      s._link(fuel,L,u,K);s._link(fuel,R,founders[3][0],K);s.ss[fuel*4+L]=S.GIVE;
      s._event('rearm',u);s.fuelUsed++;s._unlink(fuel,L);s._unlink(fuel,R);
    }
  }
  s._event('birth',units[0]);return units;
}
const c1=child(founders[0]),c2=child(c1);
const record=()=>({...job,steps:s.t,rows:o.rows,events:o.events,samples:[o.sample()],births:[],finalState:s.saveState()});
assert.equal(metrics(record()).primary,1,'Fuel-supported exact renewal');
const missing=structuredClone(record());missing.events.find(e=>e.kind==='rearm').kind='missing';
assert.equal(metrics(missing).primary,0,'Missing per-unit fuel witness');
s._unlink(c2[0],R);s._link(c2[0],R,c2[1],L);child(c2);
assert.equal(o.rows.at(-1).parent,null,'Recycled parent IDs');
const unfueled=child(founders[1],false);child(unfueled);
assert.equal(metrics(record()).primary,1,'Prepared activity without fuel counted');

const synthetic=[];
for(const seed of [303,304])for(const sequence of ['ABABA','AABAB'])for(const profile of ['square','opposed20'])for(const grip of [true,false])
  synthetic.push({seed,sequence,profile,grip,steps:100000,metrics:{primary:sequence==='ABABA'&&profile==='opposed20'&&grip?3:0}});
assert(decision(synthetic).pass);
synthetic.find(r=>r.seed===304&&r.sequence==='AABAB'&&r.profile==='opposed20'&&r.grip).metrics.primary=2;
assert(!decision(synthetic).pass);
console.log('PASS: four observer-neutrality comparisons, restart, paired setup, fuel/lineage witnesses, fuel-side regression and fixed gate');
