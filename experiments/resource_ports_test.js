#!/usr/bin/env node
'use strict';
const assert=require('assert/strict');
const {PortSim,setup,polygon,area,overlap,labels,mates,idealCases,frontFixture,squareFixture,snapshot,advance,touching}=require('./resource_ports');
const box=(x,y,w,h)=>[[x,y],[x+w,y],[x+w,y+h],[x,y+h]];
assert(Math.abs(overlap(box(0,0,2,1),box(1.6,0,2,1))-.4)<1e-12);
assert.equal(overlap(box(0,0,2,1),box(0,1.2,2,1)),0);
assert.equal(overlap(box(0,0,1,1),box(.5,.5,1,1)),.25);
assert.equal(overlap(box(0,0,1,1),box(1,0,1,1)),0);
assert.equal(overlap(box(0,0,1,1),box(-1,-1,3,3)),1);
for(const t of ['D00','D01','D10','D11','U00','U01','U10','U11','B0','B1','T0','T1']){
  const ls=labels(t);assert.equal(ls.length,4);assert(ls.every(x=>!x.includes('NaN')));assert(ls.every(x=>!mates(x,x)));
}
const ideals=idealCases();assert.equal(ideals.length,96);
assert(ideals.every(c=>c.contacts.every(q=>q.compatible&&q.pinGap<1e-8)&&c.maxOverlap<1e-8));
assert(ideals.filter(c=>c.length===3).every(c=>c.fronts.length===2&&c.fronts.every(f=>f.contacts.length===2)));
for(const end of ['left','right'])for(const proxy of ['area','long']){
  const a=frontFixture(end,0,{proxy}),b=frontFixture(end,0,{proxy});
  const types=Array.from(a.s.type),bonds=Array.from(a.s.bond);
  for(let t=0;t<100;t++){snapshot(a.s,a.target);advance(a.s);advance(b.s);}
  assert.deepEqual(a.s.saveState(),b.s.saveState(),'Observer changes physical state or RNG');
  const st=JSON.parse(JSON.stringify(b.s.saveState())),restored=PortSim.fromState(st);
  for(let t=0;t<100;t++){advance(b.s);advance(restored);}
  const bs=b.s.saveState(),rs=restored.saveState();delete bs.nums.pinsVersion;delete rs.nums.pinsVersion;
  assert.deepEqual(bs,rs,'Research geometry restart failed');
  assert.deepEqual(Array.from(a.s.type),types);assert.deepEqual(Array.from(a.s.bond),bonds);
}
const sq=squareFixture(0,{zero:true}),before=touching(sq.s).length;
sq.s.px[sq.incoming]+=.1;assert(touching(sq.s).length<before,'Corner perturbation must break exact agreement');
const raw=setup([{id:'B',kind:'B',type:'B0',x:0,y:0}]);assert.equal(area(polygon(raw,0)),2);
assert.equal(raw.w[0],.5);assert.equal(raw.wr[0],1.2);
console.log('PASS: independent overlap examples, complete rotated port graph, perturbation detection, conservation, observer neutrality and geometry restart');
