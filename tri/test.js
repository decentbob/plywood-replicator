'use strict';
// Fast checks of the triangle engine (about 20 s): node tri/test.js
const assert=require('assert/strict');
const {TriSim,gcode,parseType,canon,FACE,TFACE,GLUE}=require('./sim');
const {createWorld,buildStructure,placeTri,band,rolesFromGaps,census}=require('./world');
const S=require('./structures');
const H=Math.sqrt(3)/2;let passed=0;
const test=(name,fn)=>{const t0=Date.now();fn();passed++;console.log(`ok  ${name} (${Date.now()-t0} ms)`);};
const symmetric=s=>{for(let q=0;q<3*s.n;q++){const r=s.bond[q];if(r>=0)assert.equal(s.bond[r],q,'bond table not symmetric');}};

test('types: parse, name, canonical rotation',()=>{
  const t=parseType('K<^dA*');assert.deepEqual(t.glue,[gcode('K'),gcode('d'),gcode('A')]);assert.deepEqual(t.hinge,[1,0,0]);assert.deepEqual(t.rel,[2,0,0]);assert.deepEqual(t.trig,[0,0,1]);
  const s=new TriSim({},1);s.setType(0,'K<^dA*');assert.equal(s.typeName(0),'K<^dA*');assert.equal(canon('A--'),canon('-A-'));});

// a founder face with a docker placed exactly on it (no jostle): docks only with the complementary glue
function dockWorld(dockerType,charged=true){
  const {s,founders}=createWorld({seed:3,size:12,founders:[{gaps:[1,1],faces:'aba',x:6,y:6}],supply:{[dockerType]:1},params:{sigma:0,sigmaRot:0}});
  const f=founders[0],u=f[0],r=s.roles(u),d=s.n-1,i=r.free,P=k=>[s.px[u]+s.ox[u*3+k],s.py[u]+s.oy[u*3+k]];
  const a=P(i),b=P((i+1)%3),c=P((i+2)%3),x=[a[0]+b[0]-c[0],a[1]+b[1]-c[1]];placeTri(s,d,[b,a,x]);   // reflection of the face triangle across its face
  s.setType(d,dockerType);if(!charged)s.chg[d]=0;s.derive();return {s,u,d,i};}
test('copy: complementary docking only, not when discharged',()=>{
  for(const [type,expect] of [['A--',true],['B--',false],['a--',false]]){const {s,u,d,i}=dockWorld(type);s.run(30);
    assert.equal(s.bond[u*3+i]>=0&&((s.bond[u*3+i]/3)|0)===d,expect,`docker ${type}`);symmetric(s);}
  const {s,u,i}=dockWorld('A--',false);s.run(30);assert.ok(s.bond[u*3+i]<0,'discharged docker must not bind');});

test('casting: a pocket of three activated casters casts the instruction glues',()=>{
  const tris=[{v:[[1,0],[1.5,H],[0.5,H]],type:'aaa'},
    {v:[[0,0],[1,0],[0.5,H]],type:'bA.K'},{v:[[1,0],[2,0],[1.5,H]],type:'KcA.'},{v:[[0.5,H],[1.5,H],[1,2*H]],type:'AKd'},
    {v:[[0,0],[0.5,H],[-0.5,H]],type:'k--'},{v:[[1,0],[1.5,-H],[2,0]],type:'--k'},{v:[[1.5,H],[2,2*H],[1,2*H]],type:'--k'}];
  const s=new TriSim({sigma:0,sigmaRot:0,W:10,H:10},tris.length);buildStructure(s,tris.map((_,k)=>k),tris,4,4);
  assert.equal(s.nbc.length,tris.length);s.derive();s.chemistry();
  assert.equal(s.ev.cast,1,'one cast');assert.equal(canon(s.typeName(0)),canon('bcd'));assert.ok(!s.bonded(0),'product released');});

test('hinge: a triggered flap swings 60 degrees and returns when the trigger lets go',()=>{
  // partner P (fixed by no jostle), flap F hinged at P's shared corner, trigger side of F faces cargo C
  const tris=[{v:[[0,0],[1,0],[0.5,H]],type:'--H'},{v:[[0,0],[0.5,H],[-0.5,H]],type:'h<-A*',loose:true},{v:[[0,0],[-0.5,H],[-1,0]],type:'a--',loose:true}];
  const s=new TriSim({sigma:0,sigmaRot:0,W:10,H:10},3);buildStructure(s,[0,1,2],tris,5,5);
  assert.ok(s.isHingeBond(1,0),'hinge bond');assert.ok(s.bond[1*3+2]>=0,'cargo bound to the trigger side');
  const rel=()=>Math.atan2(Math.sin(s.angle(1)-s.angle(0)-s.hRel[3]),Math.cos(s.angle(1)-s.angle(0)-s.hRel[3]));
  s.derive();s.run(80);assert.ok(Math.abs(Math.abs(rel())-Math.PI/3)<0.1,`swung to 60 degrees (got ${rel().toFixed(2)})`);
  s.cut(1,2);s.px[2]=s._wx(s.px[2]+4);s.run(80);assert.ok(Math.abs(rel())<0.1,`back to flush (got ${rel().toFixed(2)})`);symmetric(s);});

test('state: save and reload continue the same run',()=>{
  const {s}=createWorld({seed:5,size:12,founders:[{gaps:[1,1],faces:'aba'}],supply:{'A--':4,'B--':4,'---':6}});s.run(50);
  const a=TriSim.fromState(JSON.parse(JSON.stringify(s.saveState())));s.run(40);a.run(40);
  assert.deepEqual(Array.from(a.px),Array.from(s.px));assert.deepEqual(Array.from(a.bond),Array.from(s.bond));});

test('physics: a closed ring keeps its tracers at the default jostle (no tunnelling)',()=>{
  const {tris,R}=S.ring(4,1);for(const t of tris)t.type=t.type.replace(/[*~<]/g,'');   // a plain closed ring (door welded shut)
  const {s,structures}=createWorld({seed:2,size:16,structures:[{tris,x:8,y:8}],params:{}});
  // tracers inside: placed near the centre
  const ring=structures[0],{placeFree}=require('./world'),n0=s.n;void n0;assert.ok(ring.length>30);
  const s2=new TriSim({...s.p},s.n+6);for(const k of ['px','py','pa','ox','oy','bond','hinge','glue','bkind'])s2[k].set(s[k]);
  const placed=[...ring],inside=[];for(let u=s.n;u<s2.n;u++){if(!placeFree(s2,u,placed,()=>{const a=2*Math.PI*s2.rng(),r=1.4*s2.rng();return [8+r*Math.cos(a),8+r*Math.sin(a)];}))throw Error('place');placed.push(u);inside.push(u);}
  s2.derive();const cx=()=>{let x=0,y=0;for(const u of ring){x+=s2._dx(s2.px[u]-s2.px[ring[0]]);y+=s2._dy(s2.py[u]-s2.py[ring[0]]);}return [s2.px[ring[0]]+x/ring.length,s2.py[ring[0]]+y/ring.length];};
  s2.run(1500);const [x,y]=cx();for(const u of inside)assert.ok(Math.hypot(s2._dx(s2.px[u]-x),s2._dy(s2.py[u]-y))<(R-1)*H,'tracer left the ring');symmetric(s2);});

test('worlds: founder census reads faces and gaps',()=>{const {s}=createWorld({seed:1,size:14,founders:[{gaps:[1,0,2],faces:'abab'}]});
  const c=census(s);assert.equal(c.length,1);assert.equal(c[0].faces,'abab');assert.equal(c[0].gaps,'102');});
console.log(`${passed} tests passed`);
