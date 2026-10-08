'use strict';
// Fast checks of the triangle engine (about 20 s): node tri/test.js
const assert=require('assert/strict');
const {TriSim,gcode,parseType,canon}=require('./sim');
const {createWorld,buildStructure,placeTri}=require('./world');
const S=require('./structures');
const H=Math.sqrt(3)/2;let passed=0;
const test=(name,fn)=>{const t0=Date.now();fn();passed++;console.log(`ok  ${name} (${Date.now()-t0} ms)`);};
const symmetric=s=>{for(let q=0;q<3*s.n;q++){const r=s.bond[q];if(r>=0)assert.equal(s.bond[r],q,'bond table not symmetric');}};

test('types: parse, name, canonical rotation',()=>{
  const t=parseType('K.dA@&');assert.deepEqual(t.glue,[gcode('K'),gcode('d'),gcode('A')]);assert.deepEqual(t.close,[1,0,0]);assert.deepEqual(t.att,[0,0,1]);assert.deepEqual(t.done,[0,0,1]);
  const s=new TriSim({},1);s.setType(0,'K.dA@&');assert.equal(s.typeName(0),'K.dA@&');assert.equal(canon('A--'),canon('-A-'));
  {const q=new TriSim({},1);q.setType(0,'z@!-|-|');assert.equal(q.typeName(0),'z@!-|-|');}
  for(const old of ['K<dA*','a-b$','K%--',"Kb.'@X"])assert.throws(()=>parseType(old),/marks/,'removed mark accepted: '+old);});

// a grown triangle (cell 0, welded to cell 1) with glue side `at` (side 2: glue a); a free triangle flush in the site beside it
const glueCase=(tmpl,free,spent)=>{const tris=[{v:[[0,0],[1,0],[0.5,H]],type:tmpl},{v:[[0,0],[0.5,-H],[1,0]],type:'--F'},{v:[[0,0],[0.5,H],[-0.5,H]],type:free,loose:true}];
  const s=new TriSim({sigma:0,sigmaRot:0,W:10,H:10},3);buildStructure(s,[0,1,2],tris,5,5);for(let i=0;i<3;i++)s.cut(2,i);if(spent)s.spent[2*3+spent-1]=1;s.derive();s.run(30);symmetric(s);return s.partner(0,2)===2;};
test('binding: a free triangle binds by none of its close-only or spent sides',()=>{
  assert.ok(glueCase('f-a','A--'),'control: a plain side binds');assert.ok(!glueCase('f-a','A.--'),'a close-only side bound');assert.ok(!glueCase('f-a','A--',1),'a spent side bound');});
test('binding: an attached triangle\u2019s close-only side binds no free triangle',()=>{assert.ok(!glueCase('f-a.','A--'),'a close-only side caught a free triangle');});
test('parts: a free triangle with an attach side binds only by it',()=>{
  for(const [part,expect] of [['A@--',true],['A-B@',false],['A--',true]]){
    const tris=[{v:[[0,0],[1,0],[0.5,H]],type:'f-a'},{v:[[0,0],[0.5,-H],[1,0]],type:'--F'},{v:[[0,0],[0.5,H],[-0.5,H]],type:part,loose:true}];
    const s=new TriSim({sigma:0,sigmaRot:0,W:10,H:10},3);buildStructure(s,[0,1,2],tris,5,5);for(let i=0;i<3;i++)s.cut(2,i);s.derive();s.run(30);
    assert.equal(s.partner(0,2)===2,expect,part);}});

test('copy side: a copy blank binds any free side of an attached triangle, takes its type (turned, with its marks) and lets go',()=>{
  // template (cell 0) welded to cell 1 by side 0; the copy blank (cell 2) sits flush in the site beside template side `at`
  const run=(tmpl,blank,at,attached=true)=>{const sites=[[[1,0],[1.5,H],[0.5,H]],[[0,0],[0.5,H],[-0.5,H]]];
    const tris=[{v:[[0,0],[1,0],[0.5,H]],type:tmpl},{v:[[0,0],[0.5,-H],[1,0]],type:'--F'},{v:sites[at-1],type:blank,loose:true}];
    const s=new TriSim({sigma:0,sigmaRot:0,W:10,H:10},3);buildStructure(s,[0,1,2],tris,5,5);for(let i=0;i<3;i++)s.cut(2,i);if(!attached)s.cut(0,0);s.derive();s.run(5);symmetric(s);return s;};
  for(const [tmpl,at] of [["fA.b@|",1],["fA@|b.",2],['f-b',1]]){const s=run(tmpl,'-?-?-?',at);
    assert.equal(s.ev.copy,1,`one copy (${tmpl} side ${at})`);assert.equal(canon(s.typeName(2)),canon(tmpl),'the copy has the template type (not its mirror)');
    assert.ok(!s.bonded(2),'the copy lets go');assert.equal(s.typeName(0),tmpl,'the template is unchanged');assert.equal(s.partner(0,0),1);}
  assert.notEqual(canon('fbA'),canon('fAb'),'test types are chiral');
  assert.ok(!run('f-b','---',1).bonded(2),'a blank without a copy side binds no inert side');
  assert.ok(!run('f-b','-?-?-?',1,false).ev.copy,'a free template is not copied (free triangles never bind each other)');});
test('copy side: copying is glue-blind (a copy side binds a side whatever either glue; candidate (t), the option copyGlue, removed in run 20261007-2051)',()=>{
  // template welded by side 0, its side 1 glue A; a copy blank flush beside side 1
  for(const blank of ['a?a?a?','b?b?b?','A?A?A?','b?-?b?']){
    const tris=[{v:[[0,0],[1,0],[0.5,H]],type:'fA.b@|'},{v:[[0,0],[0.5,-H],[1,0]],type:'--F'},{v:[[1,0],[1.5,H],[0.5,H]],type:blank,loose:true}];
    const s=new TriSim({sigma:0,sigmaRot:0,W:10,H:10},3);buildStructure(s,[0,1,2],tris,5,5);for(let i=0;i<3;i++)s.cut(2,i);s.derive();s.run(5);
    assert.equal(s.ev.copy,1,blank);assert.equal(canon(s.typeName(2)),canon('fA.b@|'));symmetric(s);}});
test('copy error (pErr, run 20261008-0651): a copy takes one side wrong (a glue, or one mark toggled); the template stays',()=>{
  const {TOK}=require('./sim'),sides=x=>[...x.matchAll(TOK)].map(m=>m[0]);let diff=0;
  for(let seed=1;seed<=40;seed++){const tris=[{v:[[0,0],[1,0],[0.5,H]],type:'fA.b@|'},{v:[[0,0],[0.5,-H],[1,0]],type:'--F'},{v:[[1,0],[1.5,H],[0.5,H]],type:'-?-?-?',loose:true}];
    const s=new TriSim({sigma:0,sigmaRot:0,W:10,H:10,seed,pErr:1},3);buildStructure(s,[0,1,2],tris,5,5);for(let i=0;i<3;i++)s.cut(2,i);s.derive();s.run(5);
    // (a copy whose error gave it a copy side '?' is a blank again and may copy once more: read the first copy)
    assert.ok(s.ev.copy>=1&&s.ev.copyError===s.ev.copy);assert.equal(s.typeName(0),'fA.b@|','the template is unchanged');
    // the copy is the template turned about the shared edge: compare it side by side with the rotation that differs least
    const c=sides(s.copyLog[0][2]),T=sides('fA.b@|'),d=Math.min(...[0,1,2].map(r=>[0,1,2].filter(k=>c[k]!==T[(k+r)%3]).length));assert.ok(d<=1,'at most one side differs: '+s.copyLog[0][2]);diff+=d;}
  assert.ok(diff>=30,'nearly every error changes the copy ('+diff+' of 40)');});
test('copy side: only a triangle free when the pass began copies, and never by a close-only copy side (run 20261007-2051)',()=>{
  // two prepared triangles welded only by their '?' sides stay as they are (before, the lower index took the other's type)
  {const tris=[{v:[[0,0],[1,0],[0.5,H]],type:'f?Ab'},{v:[[0,0],[0.5,-H],[1,0]],type:'--F?'}];
    const s=new TriSim({sigma:0,sigmaRot:0,W:10,H:10},2);buildStructure(s,[0,1],tris,5,5);s.derive();s.run(5);
    assert.ok(!s.ev.copy,'no copy');assert.equal(s.typeName(0),'f?Ab');assert.equal(s.typeName(1),'--F?');assert.equal(s.partner(0,0),1);symmetric(s);}
  // a blank whose copy sides are all close-only binds nothing beside a template; with one plain copy side it copies
  for(const [blank,expect] of [['-.?-.?-.?',false],['-.?-.?-?',true]]){
    const tris=[{v:[[0,0],[1,0],[0.5,H]],type:'fA.b@|'},{v:[[0,0],[0.5,-H],[1,0]],type:'--F'},{v:[[1,0],[1.5,H],[0.5,H]],type:blank,loose:true}];
    const s=new TriSim({sigma:0,sigmaRot:0,W:10,H:10},3);buildStructure(s,[0,1,2],tris,5,5);for(let i=0;i<3;i++)s.cut(2,i);s.derive();s.run(5);
    assert.equal(!!s.ev.copy,expect,blank);symmetric(s);}});
test('copy side: a copy blank binds no anchor side (a waiting anchor is no template)',()=>{
  // template welded by side 0; a copy blank flush beside side 1: copied unless side 1 is an anchor side
  for(const [tmpl,expect] of [['fW@|-&',false],['fW@-&',true],['fW|-&',false]]){
    const tris=[{v:[[0,0],[1,0],[0.5,H]],type:tmpl},{v:[[0,0],[0.5,-H],[1,0]],type:'--F'},{v:[[1,0],[1.5,H],[0.5,H]],type:'-?-?-?',loose:true}];
    const s=new TriSim({sigma:0,sigmaRot:0,W:10,H:10},3);buildStructure(s,[0,1,2],tris,5,5);for(let i=0;i<3;i++)s.cut(2,i);s.derive();s.run(5);
    assert.equal(!!s.ev.copy,expect,tmpl);if(!expect)assert.equal(s.typeName(2),'-?-?-?','the blank stays a blank');symmetric(s);}});

test('anchor: a free triangle\u2019s anchor side binds as its glue does (an inert one binds nothing)',()=>{
  // a free triangle beside a grown triangle's glue side z: binds by Z with or without the anchor mark (run 0050's
  // narrowing, a free anchor side binds nothing, was removed in run 20261004-0820); a closed side -| binds nothing
  for(const [ty,expect] of [['Z|--',true],['Z--',true],['-|--',false]]){
    const s=new TriSim({W:16,H:16,seed:5,sigma:0,sigmaRot:0},3),V=[[6,6],[7,6],[6.5,6+H]],W2=[V[2],V[1],[V[1][0]+V[2][0]-V[0][0],V[1][1]+V[2][1]-V[0][1]]];
    placeTri(s,0,V);placeTri(s,1,W2);s.setType(0,'zf-');s.setType(1,'F--');s.bind(0,1,1,0);
    const a=V[0],b=V[1],c=V[2];placeTri(s,2,[b,a,[a[0]+b[0]-c[0],a[1]+b[1]-c[1]]].map(p=>[p[0]+0.1,p[1]-0.05]));s.setType(2,ty);s.derive();s.run(3);
    assert.equal(s.partner(0,0)===2,expect,ty);symmetric(s);}});
test('pair: a free R binds the seed site, a free S its front, the pair lets go; only the plain sides are copied',()=>{
  const K=S.pairKit(),tri=(s,u,V)=>{placeTri(s,u,V);s.regrid(u);};
  // the place across side i of attached unit u (free triangles moved there bind in the next pass: sigma 0)
  const site=(s,u,i)=>{const P=k=>[s.px[u]+s.ox[u*3+k],s.py[u]+s.oy[u*3+k]],a=P(i),b=P((i+1)%3),c=P((i+2)%3);return [b,a,[a[0]+b[0]-c[0],a[1]+b[1]-c[1]]];};
  const world=free=>{const s=new TriSim({sigma:0,sigmaRot:0,W:16,H:16,openRange:1},2+free.length);buildStructure(s,[0,1],K.tris,8,8);
    free.forEach((t,k)=>{s.setType(2+k,t);tri(s,2+k,[[1+k,1],[2+k,1],[1.5+k,1+H]]);});for(let k=0;k<40;k++)s.derive();return s;};
  {const s=world([K.R,K.S]);tri(s,2,site(s,1,K.seedSide));s.step();assert.equal(s.partner(2,K.rootSide),1,'R on the seed site');
    for(let k=0;k<5;k++)s.step();assert.equal(s.partner(2,K.rootSide),1,'R holds while its front is open');
    tri(s,3,site(s,2,K.growSide));s.step();assert.equal(s.partner(2,K.growSide),3,'S on the front');
    for(let k=0;k<3;k++)s.step();assert.ok(s.partner(2,K.rootSide)<0&&s.spent[2*3+K.rootSide],'the new pair lets go');assert.equal(s.partner(2,K.growSide),3);}
  // copy blanks: at R's '-' and S's '-' a copy of that cell; at the seed site y| none (an anchor side is no template)
  for(const [u,i,want] of [[0,2,K.R],[1,1,K.S],[1,K.seedSide,'-?-?-?']]){const s=world(['-?-?-?']);tri(s,2,site(s,u,i));s.step();
    assert.equal(canon(s.typeName(2)),canon(want),`blank at side ${i} of cell ${u}`);assert.ok(!s.bonded(2));}});
// one range for every length (core-review run 20261006-1920): the open signal stops at '&' joints and a caught part with an
// open front emits from the pass it binds, so a 3-cell strip's bud holds through each catch at the default range 120,
// lets go once complete, and its parent never hears it
test('strip: a 3-cell bud holds through every catch and lets go complete; its parent hears none of it (openRange 120)',()=>{
  const K=S.strip(3),tri=(s,u,V)=>{placeTri(s,u,V);s.regrid(u);};
  const site=(s,u,i)=>{const P=k=>[s.px[u]+s.ox[u*3+k],s.py[u]+s.oy[u*3+k]],a=P(i),b=P((i+1)%3),c=P((i+2)%3);return [b,a,[a[0]+b[0]-c[0],a[1]+b[1]-c[1]]];};
  const s=new TriSim({sigma:0,sigmaRot:0,W:20,H:20},6);buildStructure(s,[0,1,2],K.tris,10,10);for(let k=0;k<3;k++)s.setType(3+k,K.types[k]);
  [3,4,5].forEach((u,k)=>tri(s,u,[[1+2*k,1],[2+2*k,1],[1.5+2*k,1+H]]));s.run(130);assert.ok([0,1,2].every(u=>s.op[u]===0),'the founder is complete');
  const sideOf=(u,g)=>[0,1,2].find(i=>s.glue[u*3+i]===gcode(g)),hold=()=>s.partner(3,0)===2,quiet=()=>[0,1,2].every(u=>s.op[u]<=0);
  tri(s,3,site(s,2,sideOf(2,'z')));s.step();assert.ok(hold(),'root on the seed site');s.run(5);assert.ok(hold()&&quiet(),'root holds; the parent hears nothing');
  tri(s,4,site(s,3,sideOf(3,'c')));s.step();assert.equal(s.partner(4,0),3,'second cell on the root');
  for(let k=0;k<5;k++){s.step();assert.ok(hold()&&quiet(),'the root let go after its second cell bound (pass '+k+')');}
  tri(s,5,site(s,4,sideOf(4,'d')));s.step();assert.equal(s.partner(5,0),4,'last cell');s.run(130);
  assert.ok(s.partner(3,0)<0&&s.spent[3*3],'the complete bud let go');assert.ok(s.bonded(4)&&s.bonded(5),'the bud stays whole');});
test('budding: a ring on a seed lets go when complete (open signal), holds while a front is open',()=>{
  for(const [missing,expect] of [[0,true],[1,false]]){const K=S.ringKit(3,'z',null,true),r=K.tris[0],i=K.rootSide,a=r.v[i],b=r.v[(i+1)%3],c=r.v[(i+2)%3];
    const anc={v:[b,a,[a[0]+b[0]-c[0],a[1]+b[1]-c[1]]],type:'z--'},base={v:null,type:'---'};
    {const A=anc.v,q=A[1],w=A[2],e=A[0];base.v=[w,q,[q[0]+w[0]-e[0],q[1]+w[1]-e[1]]];}
    const ring=K.tris.slice(0,K.tris.length-missing),all=[anc,base,...ring];const s=new TriSim({sigma:0,sigmaRot:0,W:16,H:16},all.length);buildStructure(s,all.map((_,k)=>k),all,8,8);
    for(let k=0;k<150;k++)s.derive();   // settle the relayed signals (a grown ring has them from its first cell)
    assert.ok(s.partner(2,K.rootSide)===0,'root on the seed');for(let k=0;k<80;k++)s.step();
    assert.equal(s.partner(2,K.rootSide)<0,expect,missing?'incomplete ring must hold':'complete ring must let go');}});

test('state: save and reload continue the same run',()=>{
  const {s}=createWorld({seed:5,size:12,structures:[{tris:S.ringKit(3,'z').tris,x:6,y:6}],supply:{'-?-?-?':12,'---':6}});s.run(50);
  const a=TriSim.fromState(JSON.parse(JSON.stringify(s.saveState())));s.run(40);a.run(40);
  assert.deepEqual(Array.from(a.px),Array.from(s.px));assert.deepEqual(Array.from(a.bond),Array.from(s.bond));});

test('physics: a closed ring keeps its tracers at the default jostle (no tunnelling)',()=>{
  const R=4,tris=S.ringKit(R,'z').tris.map(t=>({v:t.v,type:'---'}));   // a plain closed ring (welded)
  const {s,structures}=createWorld({seed:2,size:16,structures:[{tris,x:8,y:8}],params:{}});
  // tracers inside: placed near the centre
  const ring=structures[0],{placeFree}=require('./world'),n0=s.n;void n0;assert.ok(ring.length>30);
  const s2=new TriSim({...s.p},s.n+6);for(const k of ['px','py','pa','ox','oy','bond','glue'])s2[k].set(s[k]);
  const placed=[...ring],inside=[];for(let u=s.n;u<s2.n;u++){if(!placeFree(s2,u,placed,()=>{const a=2*Math.PI*s2.rng(),r=1.4*s2.rng();return [8+r*Math.cos(a),8+r*Math.sin(a)];}))throw Error('place');placed.push(u);inside.push(u);}
  s2.derive();const cx=()=>{let x=0,y=0;for(const u of ring){x+=s2._dx(s2.px[u]-s2.px[ring[0]]);y+=s2._dy(s2.py[u]-s2.py[ring[0]]);}return [s2.px[ring[0]]+x/ring.length,s2.py[ring[0]]+y/ring.length];};
  s2.run(1500);const [x,y]=cx();for(const u of inside)assert.ok(Math.hypot(s2._dx(s2.px[u]-x),s2._dy(s2.py[u]-y))<(R-1)*H,'tracer left the ring');symmetric(s2);});

test('physics: a block overlapping a wall cannot jump through it (an overlap-reducing move is short)',()=>{
  // a straight one-row wall (welded lattice row between y = 0 and y = H) and a free block below it, pushed 0.02 into it
  // (an overlap, as one left by a cut); kicks of up to 2 straight up must not carry it across
  const tris=[];for(let i=0;i<10;i++)tris.push({v:[[i,0],[i+1,0],[i+0.5,H]],type:'---'},{v:[[i+1,0],[i+1.5,H],[i+0.5,H]],type:'---'});
  const s=new TriSim({W:24,H:24,seed:3,sigma:0,sigmaRot:0},tris.length+1);buildStructure(s,tris.map((_,k)=>k),tris,6,12);
  const u=tris.length;placeTri(s,u,[[11,12],[10,12],[10.5,12-H]].map(p=>[p[0],p[1]+0.02]));s.gridSync();
  assert.ok(s.moveDepth([u],0,0,0,s.px[u],s.py[u])>0,'the block overlaps the wall');
  for(const k of [1.2,1.6,2.0,2.4])s._single(u,0,k,0);assert.ok(s.py[u]<12,'the block jumped through the wall');symmetric(s);});
test('physics: a lone block sees blocks beyond the 3 x 3 grid cells around it (long moves near a cell edge)',()=>{
  // world 14 (grid cells 1.4 wide): obstacle A at x = 4.3 (cell 3), block B at x = 1.45 (cell 1); B kicked +2.2 must stop
  // before A (its neighbour search once covered only cells 0..2)
  const s=new TriSim({W:14,H:14,seed:1,sigma:0,sigmaRot:0},2),tri=(x,y)=>[[x-0.5,y-H/3],[x+0.5,y-H/3],[x,y+2*H/3]];placeTri(s,0,tri(4.3,7));placeTri(s,1,tri(1.45,7));
  s.gridSync();s._single(1,2.2,0,0);assert.ok(s.moveDepth([1],0,0,0,s.px[1],s.py[1])===0,`B overlaps A (B at x=${s.px[1].toFixed(2)})`);assert.ok(s.px[1]<3.4,'B stopped before A');});
// run 20261004-1421 (harden): a lone block's neighbours are gathered along its move (the capsule), not in a disk of
// reach 2 circumradii + |move| around its start; every overlap test must give the same answer, and the depth sums of an
// overlap-reducing move must add the disk's blocks in grid order, so the moves are bit for bit those of the disk
test('physics: lone-block moves with the capsule neighbour list equal those with the disk list (crowded, overlaps)',()=>{
  const mk=()=>{const {s}=createWorld({seed:5,size:12,supply:{'---':110}});for(let k=0;k<12;k++){s.px[k]=s.px[k+12]+0.3;s.py[k]=s.py[k+12]+0.2;}s.gridSync();return s;};
  const a=mk(),b=mk(),sd=b._sdepth;let reduce=0;
  b._sdepth=function(u,x,y,t,early){const nd=this._nbDisk();return sd.call(this,u,x,y,t,early,nd,this._ndn);};   // every test against the disk list
  const nbd=a._nbDisk;a._nbDisk=function(){reduce++;return nbd.call(this);};
  for(let t=0;t<150;t++){a.physics();b.physics();}
  for(const k of ['px','py','pa'])assert.deepEqual(a[k],b[k],k+' differ');assert.ok(reduce>0,'no overlap-reducing move was tried');});
// run 20261006-0021 (harden): a body's overlap test skips grid cells beyond the overlap reach of each block's centre;
// every test must give the answer of a scan over all blocks (early tests: overlap or not; sums: the same within rounding)
test('physics: body overlap tests skipping far cells equal a scan over all blocks (random overlapping blocks)',()=>{
  const s=new TriSim({W:12,H:12,seed:3},220),R=require('./physics').mulberry32(7);for(let u=0;u<s.n;u++){s.px[u]=12*R();s.py[u]=12*R();s.pa[u]=7*R();s.resetShape(u);}s.gridSync();
  const rx=new Float64Array(2),ry=new Float64Array(2);let far=0;
  for(let k=0;k<20000;k++){const u=(R()*s.n)|0,st=++s._stamp;s._mark[u]=st;rx[0]=0;ry[0]=0;const a=[[u],rx,ry,s.px[u],s.py[u],2*R()-1,2*R()-1,R()<0.5?0:3*R()-1.5,st];
    const r=s._overlap(...a,false),e=s._overlap(...a,true);s._all=true;const q=s._overlap(...a,false),f=s._overlap(...a,true);s._all=false;
    assert.equal(e>0,f>0,'early test differs');assert.ok(Math.abs(r-q)<1e-12,'depth sum differs');if(q>0)far++;}
  assert.ok(far>1000,'few overlapping tests');});
test('physics: rigid parts never overlap, bonds stay flush (crowded copy world)',()=>{
  const {triDepth}=require('./physics'),K=S.ringKit(3,'z'),sup={'-?-?-?':30,'---':10};for(const t of K.kit)sup[t]=(sup[t]||0)+4;
  const {s}=createWorld({seed:4,size:12,structures:[{tris:K.tris.slice(0,1+K.P),x:6,y:6}],supply:sup});s.run(600);
  const A=new Float64Array(6),B=new Float64Array(6);let worst=0,gap=0;
  for(let u=0;u<s.n;u++)for(let v=u+1;v<s.n;v++){const dx=s._dx(s.px[v]-s.px[u]),dy=s._dy(s.py[v]-s.py[u]);if(dx*dx+dy*dy>1.4)continue;
    for(let q=0;q<3;q++){A[2*q]=s.ox[u*3+q];A[2*q+1]=s.oy[u*3+q];B[2*q]=dx+s.ox[v*3+q];B[2*q+1]=dy+s.oy[v*3+q];}worst=Math.max(worst,triDepth(A,B));}
  for(let u=0;u<s.n;u++)for(let i=0;i<3;i++){const q=s.bond[u*3+i];if(q>=0)gap=Math.max(gap,s.flushGap(u,i,(q/3)|0,q%3));}
  assert.ok(worst<1e-3,`overlap ${worst}`);assert.ok(gap<1e-6,`bond gap ${gap}`);assert.ok((s.ev.copy||0)+(s.ev.glue||0)>0,'something bound');symmetric(s);});

test('physics: a body longer than half the world keeps its shape (offsets unwrapped along bonds)',()=>{
  const B=[];for(let i=0;i<12;i++)B.push({v:[[i,0],[i+1,0],[i+0.5,H]],type:'---'},{v:[[i+1,0],[i+1.5,H],[i+0.5,H]],type:'---'});   // a straight welded row about 12 long
  const s=new TriSim({W:14,H:14,seed:4},B.length);buildStructure(s,B.map((_,k)=>k),B,7,7,0.4);s.derive();s.run(300);let worst=0;
  for(let u=0;u<s.n;u++)for(let i=0;i<3;i++){const q=s.bond[u*3+i];if(q>=0)worst=Math.max(worst,s.flushGap(u,i,(q/3)|0,q%3));}
  assert.ok(worst<1e-6,'bonds stay flush (worst gap '+worst+')');});
test('copy side: only a triangle bonded by its copy side alone takes its partner\'s type',()=>{
  const s=new TriSim({W:40,H:40,seed:1},3);s.setType(0,'abc');s.setType(1,'a?-x');s.setType(2,'X--');for(let u=0;u<3;u++){s.px[u]=3*u+2;s.py[u]=5;}
  s.link(0,0,1,0);s.link(1,2,2,0);s.chemistry();
  assert.equal(s.typeName(1),'a?-x','an attached triangle with a copy side is no copy blank');assert.ok(s.bond[3]>=0);
  s.cut(1,2);s.chemistry();assert.equal(s.typeName(1),'abc','bonded by its copy side alone it copies (the partner turned about the shared edge)');});
test('conservation: blocks stay in play, types change only by copy (a ring kit, copy blanks, plain triangles)',()=>{
  const {triDepth}=require('./physics');
  const {s}=createWorld({seed:2,size:14,structures:[{tris:S.ringKit(3,'z').tris,x:8,y:8}],supply:{'A--':4,'B--':4,'---':10,'-?-?-?':12}});
  const before=[...Array(s.n).keys()].map(u=>s.typeName(u));s.run(3000);
  let changed=0,worst=0;const A=new Float64Array(6),B=new Float64Array(6);
  for(let u=0;u<s.n;u++){assert.ok(Number.isFinite(s.px[u])&&Number.isFinite(s.py[u])&&Number.isFinite(s.pa[u]),'block '+u+' left play');
    assert.ok(s.px[u]>=0&&s.px[u]<s.p.W&&s.py[u]>=0&&s.py[u]<s.p.H,'block '+u+' outside the torus');if(s.typeName(u)!==before[u])changed++;
    for(let v=u+1;v<s.n;v++){const dx=s._dx(s.px[v]-s.px[u]),dy=s._dy(s.py[v]-s.py[u]);if(dx*dx+dy*dy>1.4)continue;
      for(let q=0;q<3;q++){A[2*q]=s.ox[u*3+q];A[2*q+1]=s.oy[u*3+q];B[2*q]=dx+s.ox[v*3+q];B[2*q+1]=dy+s.oy[v*3+q];}worst=Math.max(worst,triDepth(A,B));}}
  assert.ok((s.ev.copy||0)>=1,`copies ${s.ev.copy}`);
  assert.ok(changed<=(s.ev.copy||0),`${changed} types changed, ${s.ev.copy} copies`);
  assert.ok(worst<1e-3,`overlap ${worst}`);symmetric(s);});
test('physics: a block in a hole of a one-row wall never hops across it through the apex pinch',()=>{
  const tris=[];for(let i=0;i<10;i++){if(i!==5)tris.push({v:[[i,0],[i+1,0],[i+0.5,H]],type:'---'});tris.push({v:[[i+1,0],[i+1.5,H],[i+0.5,H]],type:'---'});}
  const sw=Math.sqrt(1/(Math.sqrt(3)/4));let up=0;
  for(let k=0;k<300;k++){const s=new TriSim({W:24,H:24,seed:k+1},tris.length+1);buildStructure(s,tris.map((_,q)=>q),tris,6,12);
    const u=tris.length;placeTri(s,u,[[11,12],[12,12],[11.5,12+H]]);s.gridSync();if(k===0){s._single(u,0,0.95,0);assert.ok(s.py[u]<12.3,'a direct kick of 0.95 hopped the wall');}
    for(let t=0;t<200;t++){s._single(u,0.3*sw*s._gauss(),0.3*sw*s._gauss(),0.45*sw*sw*s._gauss());if(s.py[u]-H/3>12+H-1e-6){up++;break;}if(s.py[u]+2*H/3<12+1e-6)break;}}
  assert.equal(up,0,`${up} of 300 blocks crossed the (frozen) wall`);});
const closureCase=(K,range)=>{
  // no physics: cells are bonded in growth order (as parts arriving), each followed by signal passes (derive, release)
  const R=5,N=K.N,AK=K.anchorCell,SE=K.types[AK].includes('Z@|')?'z--':'w--',s=new TriSim({W:40,H:40,sigma:0,sigmaRot:0,openRange:range},2*N+2),O=[20,20],at=p=>[O[0]+p[0],O[1]+p[1]];
  const sh=(a,b)=>{const eq=(p,q)=>Math.hypot(p[0]-q[0],p[1]-q[1])<1e-6;for(let i=0;i<3;i++)for(let j=0;j<3;j++)if(eq(a[i],b[(j+1)%3])&&eq(a[(i+1)%3],b[j]))return [i,j];return null;};
  // geometry: the bud (the parent turned 180 degrees about its pore) puts its root on the parent's seed site and its E on the parent's root, without overlap
  // (seedAt, run 20261004-0621: the seed site on another outer cell; K.pose puts the root's seed side on it)
  const SC=K.seedCell,Bv=K.tris.map(t=>t.v.map(K.pose));if(SC===N-1)K.tris.forEach((t,k)=>t.v.forEach((p,q)=>{const b=S.budPose(R,p);assert.ok(Math.hypot(b[0]-Bv[k][q][0],b[1]-Bv[k][q][1])<1e-9,'pose is the turn about the pore');}));
  assert.deepEqual(sh(Bv[0],K.tris[SC].v),[K.rootSide,K.seedSide],'bud root on the parent seed site');
  if(SC===N-1)assert.deepEqual(sh(Bv[N-1],K.tris[0].v),[K.seedSide,K.rootSide],'bud seed site on the parent root');
  const cen=v=>[(v[0][0]+v[1][0]+v[2][0])/3,(v[0][1]+v[1][1]+v[2][1])/3];for(const b of Bv)for(const t of K.tris){const c=cen(b),d=cen(t.v);assert.ok(Math.hypot(c[0]-d[0],c[1]-d[1])>0.5,'bud overlaps parent');}
  assert.equal(new Set(K.letters).size,N-1,'one letter per bond');assert.ok(![...K.letters].some(c=>'awzyf'.includes(c)),'kit letter clashes with genome or seed');
  const refl=(u,i)=>{const P=k=>[s.px[u]+s.ox[u*3+k],s.py[u]+s.oy[u*3+k]],a=P(i),b=P((i+1)%3),c=P((i+2)%3);return [b,a,[a[0]+b[0]-c[0],a[1]+b[1]-c[1]]];};
  const pass=k=>{for(let q=0;q<k;q++){s.derive();s._release();}},state=U=>U.map(u=>[0,1,2].map(i=>(s.bond[u*3+i]>=0?'b':'-')+(s.spent[u*3+i]?'s':'-')).join(' '));
  // the parent: complete, its founder held by its root's anchor side (a stand-in strand end w)
  const Pu=[...Array(N).keys()],Bu=Pu.map(k=>N+k),Ps=2*N,Bs=2*N+1;buildStructure(s,Pu,K.tris,O[0],O[1]);
  placeTri(s,Ps,refl(Pu[AK],K.anchorSide));s.setType(Ps,SE);s.bind(Pu[AK],K.anchorSide,Ps,0);pass(10);
  const P0=state(Pu);assert.ok(Pu.every(u=>s.op[u]===0),'the parent hears no open signal');
  assert.ok(s.bond[Pu[SC]*3+K.seedSide]<0&&!s.spent[Pu[SC]*3+K.seedSide],'the parent seed site is free');
  Bv.forEach((v,k)=>{placeTri(s,Bu[k],v.map(at));s.setType(Bu[k],K.types[k]);});
  // growth: the root on the parent's seed site, then each cell on its predecessor; a stall of 300 passes half way
  const held=()=>s.bond[Bu[0]*3+K.rootSide]===Pu[SC]*3+K.seedSide;
  s.bind(Bu[0],K.rootSide,Pu[SC],K.seedSide);s.caught(Bu[0]);pass(5);assert.ok(held(),'root let go');
  for(let k=1;k<N;k++){const [i,j]=sh(Bv[k],Bv[k-1]);s.bind(Bu[k],i,Bu[k-1],j);s.caught(Bu[k]);pass(k===25?300:4);assert.ok(held(),'the bud let go while growing (cell '+k+')');}
  pass(20);assert.ok(held(),'the complete bud let go before its anchor caught');
  assert.deepEqual(Bu.filter(u=>s.op[u]>0),Bu.filter((u,k)=>Math.abs(k-AK)<range),'only the waiting anchor emits; its range only is unspent');assert.ok(s.op[Bu[0]]>0,'the root hears no open signal');
  // the catch: the bud's anchor takes a strand end; completion releases the root from the parent
  placeTri(s,Bs,refl(Bu[AK],K.anchorSide));s.setType(Bs,SE);s.bind(Bu[AK],K.anchorSide,Bs,0);pass(10);
  assert.ok(s.bond[Bu[0]*3+K.rootSide]<0,'the bud did not let go after its catch');
  assert.ok(s.bond[Pu[SC]*3+K.seedSide]<0&&!s.spent[Pu[SC]*3+K.seedSide],'the parent seed site is not free again');
  // closure: the bud is now in the parent's starting state (same types, bonds and spent sides cell by cell), and so is the parent
  assert.deepEqual(state(Bu),P0,'the bud is not in the parent\'s state');assert.deepEqual(state(Pu),P0,'the parent changed');symmetric(s);};
test('closure (budKit): a bud grown cell by cell on its parent holds until its anchor catches, then lets go in the parent\'s own state',()=>closureCase(S.budKit(5),3));
// the anchor Z@| on arc cell 6 (run 20261003-1921): the open range reaches the root from there
test('closure (budKit, anchor on cell 6, Z@|): the bud holds until its catch and lets go in the parent\'s state',()=>closureCase(S.budKit(5,7,null,false,{at:6,glue:'Z'}),9));
test('closure (budKit, anchor on cell 6, closed walls -|): the same with walls nothing binds or copies',()=>closureCase(S.budKit(5,7,null,false,{at:6,glue:'Z'},'-|'),9));
// a wide opening (explore run 20261005-0721): a half ring (pore 27, 27 cells, open walls '-'), anchor on cell 7, seed site on
// cell 24; its bud on the seed site overlaps neither its parent nor (one generation on) its parent's parent's place
test('closure (budKit, half ring: pore 27): the same cycle, and the bud placed on the seed site overlaps no parent cell',()=>{
  const K=S.budKit(5,27,null,true,{at:7,glue:'Z'},'-',24),c=v=>[(v[0][0]+v[1][0]+v[2][0])/3,(v[0][1]+v[1][1]+v[2][1])/3];
  assert.equal(K.N,27);const P=K.tris.map(t=>c(t.v)),B=K.tris.map(t=>c(t.v.map(K.pose))),G=K.tris.map(t=>c(t.v.map(K.pose).map(K.pose)));
  for(const a of P)for(const b of [...B,...G])assert.ok(Math.hypot(a[0]-b[0],a[1]-b[1])>0.5,'a bud cell overlaps its parent');
  closureCase(S.budKit(5,27,null,false,{at:7,glue:'Z'},'-|',24),9);});
// the seed site on cell 45 (run 20261004-0621): the bud grows off the parent's top-right corner, pores facing across an open wedge
test('closure (budKit, seed site on cell 45): the bud off the corner holds until its catch and lets go in the parent\'s state',()=>closureCase(S.budKit(5,7,null,false,{at:6,glue:'Z'},'-|',45),9));
// lysis (run 20261004-2051, explore; RULES Core changes): a parent holding a stand-in strand end, its complete bud waiting
// for a catch on the parent's seed site (cell 45), and a free part placed in the bud's anchor site; no motion (so the
// freed parts stay where they were: the root binds the parent's seed site again and a new bud regrows from them)
const lysisCase=cutter=>{const K=S.budKit(5,7,null,false,{at:6,glue:'Z'},'-|',45),N=K.N,AK=K.anchorCell,SC=K.seedCell,s=new TriSim({W:40,H:40,sigma:0,sigmaRot:0,openRange:9},2*N+2),O=[20,20];
  const Pu=[...Array(N).keys()],Bu=Pu.map(k=>N+k),Ps=2*N,C=2*N+1;buildStructure(s,Pu,K.tris,O[0],O[1]);buildStructure(s,Bu,K.tris.map(t=>({...t,v:t.v.map(K.pose)})),O[0],O[1]);
  const refl=(u,i)=>{const P=k=>[s.px[u]+s.ox[u*3+k],s.py[u]+s.oy[u*3+k]],a=P(i),b=P((i+1)%3),c=P((i+2)%3);return [b,a,[a[0]+b[0]-c[0],a[1]+b[1]-c[1]]];};
  placeTri(s,Ps,refl(Pu[AK],K.anchorSide));s.setType(Ps,'z--');s.bind(Pu[AK],K.anchorSide,Ps,0);s.bind(Bu[0],K.rootSide,Pu[SC],K.seedSide);
  const wall=[0,1,2].find(i=>s.bond[Bu[20]*3+i]<0);s.spent[Bu[20]*3+wall]=1;   // a spent side (labelled: set by hand) to see the fresh state after lysis
  for(let k=0;k<40;k++)s.derive();assert.ok(s.op[Bu[0]]>0,'the waiting bud holds (its anchor emits)');
  placeTri(s,C,refl(Bu[AK],K.anchorSide));s.setType(C,cutter);s.gridSync();
  const types=[...Array(s.n).keys()].map(u=>s.typeName(u)),bonds=U=>U.map(u=>[0,1,2].map(i=>u===Pu[SC]&&i===K.seedSide?'seed':s.bond[u*3+i]).join(',')),P0=bonds([...Pu,Ps]);
  // each bud cell's first pass free (the waves run from the anchor cell to both ends, one bond per pass), and whether it
  // was then fresh (no spent side) and quiet (no lysis); the parent's seed site once the root is free
  const freed=new Array(N).fill(0);let fresh=true,quiet=true,seed=false;
  for(let k=1;k<=60;k++){s.step();Bu.forEach((u,c)=>{if(freed[c]||s.bonded(u))return;freed[c]=k;if([0,1,2].some(i=>s.spent[u*3+i]))fresh=false;if(s.ly[u])quiet=false;
      if(!c)seed=s.bond[Pu[SC]*3+K.seedSide]<0&&!s.spent[Pu[SC]*3+K.seedSide];});
    assert.deepEqual(bonds([...Pu,Ps]),P0,'the parent changed');}
  const apart=freed.every(x=>x>0)?Math.max(...freed):0;
  assert.deepEqual([...Array(s.n).keys()].map(u=>s.typeName(u)),types,'a type changed');symmetric(s);
  return {s,Bu,C,wall,apart,fresh,quiet,seed,freed};};
test('lysis: a part with a lysis side bound to a waiting anchor takes the bud apart into its parts, fresh; the parent behind its & joint stays whole',()=>{
  const {s,apart,fresh,quiet,seed,freed}=lysisCase('z@!-|-|');
  assert.ok(apart>0&&apart<=45,`every bud cell freed by pass ${apart} (${freed.join(' ')})`);assert.ok(seed,'the parent\'s seed site was not free and fresh when the root let go');
  assert.ok(fresh,'a lysed part keeps a spent side');assert.ok(quiet,'a free triangle keeps its lysis');assert.ok(s.ev.lyse>=46,`cuts ${s.ev.lyse}`);
  // control: the same part without the lysis side binds the anchor and nothing comes apart (the bud then hears no open
  // signal and lets go of its parent by completion, as after a catch)
  const c=lysisCase('z@-|-|');assert.ok([0,1,2].some(i=>c.s.partner(c.Bu[6],i)===c.C),'the control part did not bind the anchor');
  assert.ok(!c.apart&&c.Bu.slice(1).every((u,k)=>[0,1,2].some(i=>c.s.partner(u,i)===c.Bu[k])),'the bud came apart without a lysis side');assert.ok(!c.s.ev.lyse,'lysis without a lysis side');
  assert.ok(c.s.spent[c.Bu[20]*3+c.wall],'the spent side was cleared without lysis');});
// rule (v), core review run 20261008-2221 (built as the option lysJoint in run 20261008-1951): no lysis crosses a joint,
// so a lock z! raises a key that binds by Z@& and lyses a plug Z@ (no &), and the plug's lysis comes back across the
// lock's bond (not a joint) into the lock's carrier (nothing moves here, so a lysed part binds again at once and is lysed
// again: the test reads lysis events and whether the lock is whole)
const lockCase=part=>{const tris=[{v:[[0,0],[1,0],[0.5,H]],type:'fz!-'},{v:[[0,0],[0.5,-H],[1,0]],type:'--F'},{v:[[1,0],[1.5,H],[0.5,H]],type:part,loose:true}];
  const s=new TriSim({sigma:0,sigmaRot:0,W:10,H:10},3);buildStructure(s,[0,1,2],tris,5,5);for(let i=0;i<3;i++)s.cut(2,i);s.derive();s.run(8);
  return {held:[0,1,2].some(i=>s.partner(0,i)===2),lysed:!!s.ev.lyse,whole:s.partner(0,0)===1};};
test('lysis stops at a joint: a lock z! raises a key with & and lyses a plug without, whose lysis comes back into the lock\u2019s carrier',()=>{
  const k=lockCase('Z@&c@-');assert.ok(k.held&&!k.lysed,'the key was not raised on the lock');assert.ok(k.whole);
  const p=lockCase('Z@--');assert.ok(p.lysed,'the plug was not lysed');assert.ok(!p.whole,'the lysis did not come back');});
console.log(`${passed} tests passed`);
