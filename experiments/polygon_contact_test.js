#!/usr/bin/env node
'use strict';
const assert=require('assert/strict');
const {Sim}=require('../src/sim'),base=require('./resource_ports');
const {PolygonContactSim,separation}=require('./polygon_contact_physics');
const {snapshot,canonical}=require('./polygon_contact');
const close=(a,b,tol=1e-8)=>assert(Math.abs(a-b)<=tol,`${a} != ${b}`);
const box=(x,y,w,h)=>[[x,y],[x+w,y],[x+w,y+h],[x,y+h]];
const turn=(ps,a)=>ps.map(([x,y])=>[x*Math.cos(a)-y*Math.sin(a),x*Math.sin(a)+y*Math.cos(a)]);
const a=box(-1,-.5,2,1),over=box(.6,-.5,2,1),gap=box(-1,.7,2,1);
for(const angle of [0,.37,Math.PI/2,Math.PI]){
  const p=turn(a,angle),q=turn(over,angle),m=separation(p,q);close(m.depth,.4);
  assert.equal(separation(p,q.map(([x,y])=>[x+m.x,y+m.y])),null);
  assert.equal(separation(p,turn(gap,angle)),null);
}
assert.equal(separation(a,box(1,-.5,2,1)),null);
assert.equal(separation(box(0,0,1,1),box(1.1,1.1,1,1)),null);
close(separation(box(0,0,4,4),box(1,1,1,1)).depth,2);
close(separation(box(0,0,1,1),box(0,0,1,1)).depth,1);
function pair(x,y){const s=base.setup([{id:'a',kind:'B',type:'B0',x:0,y:0},{id:'b',kind:'B',type:'B0',x,y}],{zero:true});return PolygonContactSim.fromState(s.saveState());}
const p=pair(1.6,0),x0=Array.from(p.px);p.w[0]=1;p.w[1]=.5;p._separatePair(0,1);
close(x0[0]-p.px[0],.4*2/3);close(p.px[1]-x0[1],.4/3);
assert.equal(p._slotFree(0,p.px[0],p.py[0]),true);
const periodic=pair(1.6,0);periodic.px[0]=79.8;periodic.px[1]=1.4;
assert.equal(periodic._slotFree(0,79.8,periodic.py[0]),false);base.advance(periodic);
close(Math.abs(periodic._dx(periodic.px[1]-periodic.px[0])),2);
const rotated=pair(1.6,0);assert.equal(rotated._slotFree(0,rotated.px[0],rotated.py[0]),false);
assert.equal(rotated._slotFree(0,rotated.px[0],rotated.py[0],Math.PI/2),true);
const thin=base.setup([{id:'a',kind:'I',type:'D00',x:0,y:0},{id:'b',kind:'I',type:'D00',x:1,y:0}],{zero:true});
const bound=PolygonContactSim.fromState(thin.saveState());bound.px[1]+=2;
for(let k=0;k<4;k++)bound.ox[k]*=5;
bound._shapePairs();assert.deepEqual(bound.pairs,[0,1],'Actual expanded corners must enter search');

const fixture=base.frontFixture('left',0,{zero:true});
const s=PolygonContactSim.fromState(fixture.s.saveState()),plain=PolygonContactSim.fromState(fixture.s.saveState());
for(let t=0;t<100;t++){snapshot(s,fixture.target,'polygon');base.advance(s);base.advance(plain);}
assert.deepEqual(s.saveState(),plain.saveState(),'Observation must preserve arrays and RNG');
const restored=PolygonContactSim.fromState(JSON.parse(JSON.stringify(s.saveState())));
for(let t=0;t<20;t++){base.advance(s);base.advance(restored);}
assert.deepEqual(canonical(s.saveState()),canonical(restored.saveState()));assert.deepEqual(s.check(),[]);
assert.throws(()=>s.step(),/Physics-only/);assert.throws(()=>s._formBond(),/Physics-only/);
// Verify unchanged source spans rather than merely expecting similar trajectories.
const old=Sim.prototype._physics.toString().replace(/\r\n/g,'\n'),now=PolygonContactSim.prototype._physics.toString().replace(/\r\n/g,'\n');
const span=(text,start,end)=>{const a=text.indexOf(start),b=text.indexOf(end,a);assert(a>=0&&b>a);return text.slice(a,b);};
assert.equal(span(old,'    const p =','    // 2. one neighbour scan:'),span(now,'    const p =','    // Research replacement:'));
assert.equal(span(old,'    // 3. constraints','      for (let k = 0; k < contacts.length;'),span(now,'    // 3. constraints','      for (let k=0;k<contacts.length;'));
assert.equal(span(old,'      for (let k = 0; k < pins.length; k += 2)', '    this._buildHash();   // for the empty-slot'),
  span(now,'      for (let k = 0; k < pins.length; k += 2)', '    this._buildHash();   // retained core cache'));
console.log('PASS: independent contact geometry, containment, rotation, torus, mass weighting, placement, shape bounds, restart, observer neutrality and unchanged solver spans');
