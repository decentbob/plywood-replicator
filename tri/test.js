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
  const t=parseType('K.dA@&');assert.deepEqual(t.glue,[gcode('K'),gcode('d'),gcode('A')]);assert.deepEqual(t.close,[1,0,0]);assert.deepEqual(t.att,[0,0,1]);assert.deepEqual(t.done,[0,0,1]);
  const s=new TriSim({},1);s.setType(0,'K.dA@&');assert.equal(s.typeName(0),'K.dA@&');assert.equal(canon('A--'),canon('-A-'));
  for(const old of ['K<dA*','a-b$','K%--',"Kb.'@X"])assert.throws(()=>parseType(old),/marks/,'removed mark accepted: '+old);});

// a founder face with a docker placed exactly on it (no jostle): docks only with the complementary glue
function dockWorld(dockerType,end='high'){
  const {s,founders}=createWorld({seed:3,size:12,founders:[{gaps:[1,1],faces:'aba',x:6,y:6}],supply:{[dockerType]:1},params:{sigma:0,sigmaRot:0}});
  const f=founders[0],u=end==='high'?f[f.length-1]:f[0],r=s.roles(u),d=s.n-1,i=r.free,P=k=>[s.px[u]+s.ox[u*3+k],s.py[u]+s.oy[u*3+k]];
  const a=P(i),b=P((i+1)%3),c=P((i+2)%3),x=[a[0]+b[0]-c[0],a[1]+b[1]-c[1]];placeTri(s,d,[b,a,x]);   // reflection of the face triangle across its face
  s.setType(d,dockerType);s.derive();return {s,u,d,i};}
test('copy: complementary docking only',()=>{
  for(const [type,expect] of [['A--',true],['B--',false],['a--',false]]){const {s,u,d,i}=dockWorld(type);s.run(30);
    assert.equal(s.bond[u*3+i]>=0&&((s.bond[u*3+i]/3)|0)===d,expect,`docker ${type}`);symmetric(s);}});
test('binding: a free triangle docks by none of its anchor, close-only or spent sides',()=>{
  for(const type of ['A|--','A.--','A--']){const {s,u,d,i}=dockWorld(type);if(type==='A--')s.spent[d*3]=1;s.derive();s.run(30);
    assert.ok(s.bond[u*3+i]<0,`docker ${type}${type==='A--'?' (side spent)':''} must not dock`);}});
test('binding: an attached triangle\u2019s close-only side takes no dock or fill (a close-only side binds no free triangle)',()=>{
  {const {s,u,i}=dockWorld('A--');s.cOnly[u*3+i]=1;s.derive();s.run(30);assert.ok(s.bond[u*3+i]<0,'a close-only face took a dock');}
  // dockers whose prev side (the side a fill binds) is close-only: copies dock but take no fill (control: plain dockers)
  for(const [mk,expect] of [['.',false],['',true]]){const {s}=createWorld({seed:2,size:18,founders:[{gaps:[1,0,2,1,1],faces:'abaabb'}],
      supply:{[`A-${mk}-`]:14,[`B-${mk}-`]:14,'---':50}});s.run(3000);assert.ok((s.ev.dock||0)>0,'docks');assert.equal((s.ev.fill||0)>0,expect,`fills with dockers A-${mk}-`);}});
test('copy: zip, a face takes a dock only from the high end on',()=>{
  const {s,u,i}=dockWorld('A--','low');s.run(30);assert.ok(s.bond[u*3+i]<0,'low end docked before the faces above it');
  const h=dockWorld('A--','high');h.s.run(30);assert.ok(h.s.bond[h.u*3+h.i]>=0,'the high end docks');});

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
test('copy side: a copy blank binds no anchor side (a waiting anchor is no template)',()=>{
  // template welded by side 0; a copy blank flush beside side 1: copied unless side 1 is an anchor side
  for(const [tmpl,expect] of [['fW@|-&',false],['fW@-&',true],['fW|-&',false]]){
    const tris=[{v:[[0,0],[1,0],[0.5,H]],type:tmpl},{v:[[0,0],[0.5,-H],[1,0]],type:'--F'},{v:[[1,0],[1.5,H],[0.5,H]],type:'-?-?-?',loose:true}];
    const s=new TriSim({sigma:0,sigmaRot:0,W:10,H:10},3);buildStructure(s,[0,1,2],tris,5,5);for(let i=0;i<3;i++)s.cut(2,i);s.derive();s.run(5);
    assert.equal(!!s.ev.copy,expect,tmpl);if(!expect)assert.equal(s.typeName(2),'-?-?-?','the blank stays a blank');symmetric(s);}});

test('anchor: an anchor side catches a strand end seed and the strand is placed flush as one body; a spent one catches nothing',()=>{
  for(const [ag,expect,spent] of [['Z|',true],['Y|',false],['Z',false],['Z|',false,true]]){
    const {s,founders}=createWorld({seed:5,size:16,founders:[{gaps:[1,1],faces:'aaa',ends:'-z',x:6,y:8}],supply:{'---':2},params:{sigma:0,sigmaRot:0}});
    const F=founders[0],u=F[F.length-1],r=s.roles(u),i=r.inert,P=k=>[s.px[u]+s.ox[u*3+k],s.py[u]+s.oy[u*3+k]];
    const a=P(i),b=P((i+1)%3),c=P((i+2)%3),x=[a[0]+b[0]-c[0],a[1]+b[1]-c[1]],sh=[0.12,-0.08];
    const V=[b,a,x].map(p=>[p[0]+sh[0],p[1]+sh[1]]);   // the anchor cell (its side 0 faces the end, a little off the flush place), welded on side 1
    const W2=[V[2],V[1],[V[1][0]+V[2][0]-V[0][0],V[1][1]+V[2][1]-V[0][1]]];placeTri(s,s.n-2,V);placeTri(s,s.n-1,W2);s.setType(s.n-2,ag+'f-');s.setType(s.n-1,'F--');s.bind(s.n-2,1,GLUE,s.n-1,0,GLUE);if(spent)s.spent[(s.n-2)*3]=1;   // a spent anchor side catches nothing
    s.derive();s.run(3);const ok=s.partner(u,i)===s.n-2;assert.equal(ok,expect,ag+(spent?' (spent)':''));
    if(ok){assert.ok(s.flushGap(u,i,s.n-2,0)<1e-6,'flush');for(let q=0;q+1<F.length;q++)for(let e=0;e<3;e++){const qq=s.bond[F[q]*3+e];if(qq>=0)assert.ok(s.flushGap(F[q],e,(qq/3)|0,qq%3)<1e-6,'strand stays rigid');}}
    symmetric(s);}});
test('anchor: catches a strand end while the strand is being copied (its docker moves with it)',()=>{
  const {s,founders}=createWorld({seed:5,size:16,founders:[{gaps:[1,1],faces:'aaa',ends:'-z',x:6,y:8}],supply:{'---':3},params:{sigma:0,sigmaRot:0}});
  const F=founders[0],u=F[F.length-1],r=s.roles(u),i=r.inert,P=k=>[s.px[u]+s.ox[u*3+k],s.py[u]+s.oy[u*3+k]],refl=e=>{const a=P(e),b=P((e+1)%3),c=P((e+2)%3);return [b,a,[a[0]+b[0]-c[0],a[1]+b[1]-c[1]]];};
  const D=s.n-3;placeTri(s,D,refl(r.free));s.setType(D,'A--');s.derive();s.run(3);assert.ok(s.partner(u,r.free)===D,'docked on the high end');
  const sh=[0.12,-0.08],V=refl(i).map(p=>[p[0]+sh[0],p[1]+sh[1]]);
  const W2=[V[2],V[1],[V[1][0]+V[2][0]-V[0][0],V[1][1]+V[2][1]-V[0][1]]];placeTri(s,s.n-2,V);placeTri(s,s.n-1,W2);s.setType(s.n-2,'Z|f-');s.setType(s.n-1,'F--');s.bind(s.n-2,1,GLUE,s.n-1,0,GLUE);
  s.derive();assert.ok(s.busy[u]>0,'the strand is busy');s.run(3);assert.equal(s.partner(u,i),s.n-2,'caught while busy');assert.equal(s.partner(u,r.free),D,'the docker stays');
  assert.ok(s.flushGap(u,i,s.n-2,0)<1e-6,'flush');assert.ok(s.flushGap(u,r.free,D,s.bond[u*3+r.free]%3)<1e-6,'the docker moved with the strand');symmetric(s);});
test('heldCopy option: a free strand takes no dock; held by its high end (not by a completion side) it does',()=>{
  // a strand's high end, a docker A-- at its face; the high end's spare edge free, held by an anchor Z|, or held by Z&
  for(const [hold,expect] of [[null,false],['Z|f-',true],['Z&f-',false]]){
    const {s,founders}=createWorld({seed:5,size:16,founders:[{gaps:[1,1],faces:'aaa',ends:'-z',x:6,y:8}],supply:{'---':3},params:{sigma:0,sigmaRot:0,heldCopy:true}});
    const F=founders[0],u=F[F.length-1],r=s.roles(u),i=r.inert,P=k=>[s.px[u]+s.ox[u*3+k],s.py[u]+s.oy[u*3+k]],refl=e=>{const a=P(e),b=P((e+1)%3),c=P((e+2)%3);return [b,a,[a[0]+b[0]-c[0],a[1]+b[1]-c[1]]];};
    if(hold){const V=refl(i),W2=[V[2],V[1],[V[1][0]+V[2][0]-V[0][0],V[1][1]+V[2][1]-V[0][1]]];placeTri(s,s.n-2,V);placeTri(s,s.n-1,W2);s.setType(s.n-2,hold);s.setType(s.n-1,'F--');
      s.bind(s.n-2,1,GLUE,s.n-1,0,GLUE);s.bind(u,i,GLUE,s.n-2,0,GLUE);}
    const D=s.n-3;placeTri(s,D,refl(r.free));s.setType(D,'A--');s.derive();s.run(3);
    assert.equal(s.partner(u,r.free)===D,expect,hold?'held by '+hold:'free');}});
test('anchor: a free triangle\u2019s anchor side binds nothing',()=>{
  // a free part with an anchor side beside a strand end's seed: binds only without the anchor mark (control)
  for(const [ty,expect] of [['Z@|--',false],['Z@--',true]]){
    const {s,founders}=createWorld({seed:5,size:16,founders:[{gaps:[1,1],faces:'aaa',ends:'-z',x:6,y:8}],supply:{'---':1},params:{sigma:0,sigmaRot:0}});
    const F=founders[0],u=F[F.length-1],i=s.roles(u).inert,P=k=>[s.px[u]+s.ox[u*3+k],s.py[u]+s.oy[u*3+k]],a=P(i),b=P((i+1)%3),c=P((i+2)%3);
    const v=s.n-1;placeTri(s,v,[b,a,[a[0]+b[0]-c[0],a[1]+b[1]-c[1]]].map(p=>[p[0]+0.1,p[1]-0.05]));s.setType(v,ty);s.derive();s.run(3);
    assert.equal(s.partner(u,i)===v,expect,ty);symmetric(s);}});
test('budding: a ring on a seed lets go when complete (open signal), holds while a front is open',()=>{
  for(const [missing,expect] of [[0,true],[1,false]]){const K=S.ringKit(3,'z',null,true),r=K.tris[0],i=K.rootSide,a=r.v[i],b=r.v[(i+1)%3],c=r.v[(i+2)%3];
    const anc={v:[b,a,[a[0]+b[0]-c[0],a[1]+b[1]-c[1]]],type:'z--'},base={v:null,type:'---'};
    {const A=anc.v,q=A[1],w=A[2],e=A[0];base.v=[w,q,[q[0]+w[0]-e[0],q[1]+w[1]-e[1]]];}
    const ring=K.tris.slice(0,K.tris.length-missing),all=[anc,base,...ring];const s=new TriSim({sigma:0,sigmaRot:0,W:16,H:16},all.length);buildStructure(s,all.map((_,k)=>k),all,8,8);
    for(let k=0;k<150;k++)s.derive();   // settle the relayed signals (a grown ring has them from its first cell)
    assert.ok(s.partner(2,K.rootSide)===0,'root on the seed');for(let k=0;k<80;k++)s.step();
    assert.equal(s.partner(2,K.rootSide)<0,expect,missing?'incomplete ring must hold':'complete ring must let go');}});

test('state: save and reload continue the same run',()=>{
  const {s}=createWorld({seed:5,size:12,founders:[{gaps:[1,1],faces:'aba'}],supply:{'A--':4,'B--':4,'---':6}});s.run(50);
  const a=TriSim.fromState(JSON.parse(JSON.stringify(s.saveState())));s.run(40);a.run(40);
  assert.deepEqual(Array.from(a.px),Array.from(s.px));assert.deepEqual(Array.from(a.bond),Array.from(s.bond));});

test('physics: a closed ring keeps its tracers at the default jostle (no tunnelling)',()=>{
  const R=4,tris=S.ringKit(R,'z').tris.map(t=>({v:t.v,type:'---'}));   // a plain closed ring (welded)
  const {s,structures}=createWorld({seed:2,size:16,structures:[{tris,x:8,y:8}],params:{}});
  // tracers inside: placed near the centre
  const ring=structures[0],{placeFree}=require('./world'),n0=s.n;void n0;assert.ok(ring.length>30);
  const s2=new TriSim({...s.p},s.n+6);for(const k of ['px','py','pa','ox','oy','bond','glue','bkind'])s2[k].set(s[k]);
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
test('physics: rigid parts never overlap, bonds stay flush (crowded copy world)',()=>{
  const {triDepth}=require('./physics');
  const {s}=createWorld({seed:4,size:12,founders:[{gaps:[1,0,2],faces:'abab'}],supply:{'A--':10,'B--':10,'a--':10,'b--':10,'---':20}});s.run(600);
  const A=new Float64Array(6),B=new Float64Array(6);let worst=0,gap=0;
  for(let u=0;u<s.n;u++)for(let v=u+1;v<s.n;v++){const dx=s._dx(s.px[v]-s.px[u]),dy=s._dy(s.py[v]-s.py[u]);if(dx*dx+dy*dy>1.4)continue;
    for(let q=0;q<3;q++){A[2*q]=s.ox[u*3+q];A[2*q+1]=s.oy[u*3+q];B[2*q]=dx+s.ox[v*3+q];B[2*q+1]=dy+s.oy[v*3+q];}worst=Math.max(worst,triDepth(A,B));}
  for(let u=0;u<s.n;u++)for(let i=0;i<3;i++){const q=s.bond[u*3+i];if(q>=0)gap=Math.max(gap,s.flushGap(u,i,(q/3)|0,q%3));}
  assert.ok(worst<1e-3,`overlap ${worst}`);assert.ok(gap<1e-6,`bond gap ${gap}`);assert.ok((s.ev.dock||0)+(s.ev.glue||0)>0,'something bound');symmetric(s);});

test('physics: a body longer than half the world keeps its shape (offsets unwrapped along bonds)',()=>{
  const roles=[...Array(24)].map((_,i)=>'FB'[i%2]),ccw=V=>((V[1][0]-V[0][0])*(V[2][1]-V[0][1])-(V[1][1]-V[0][1])*(V[2][0]-V[0][0]))<0?[V[0],V[2],V[1]]:V,B=band(roles).map(t=>({v:ccw(t.v),type:'---'}));   // a straight strip about 12 long
  const s=new TriSim({W:14,H:14,seed:4},B.length);buildStructure(s,B.map((_,k)=>k),B,7,7,0.4);s.derive();s.run(300);let worst=0;
  for(let u=0;u<s.n;u++)for(let i=0;i<3;i++){const q=s.bond[u*3+i];if(q>=0)worst=Math.max(worst,s.flushGap(u,i,(q/3)|0,q%3));}
  assert.ok(worst<1e-6,'bonds stay flush (worst gap '+worst+')');});
test('locality: release reads its chain partners\' fill state from the previous pass (one bond per pass)',()=>{
  // U (1) docked on T (0), prev partner P (2, docked on 3), next partner Y (6, docked on 7); P's prev is a fill W (4)
  const {PREV,NEXT}=require('./sim');const s=new TriSim({W:40,H:40,seed:1},8);for(let u=0;u<8;u++){s.setType(u,'a--');s.px[u]=3*u+2;s.py[u]=5;}
  const B=(u,i,ku,v,j,kv)=>{s.link(u,i,v,j);s.bkind[u*3+i]=ku;s.bkind[v*3+j]=kv;};
  B(0,0,TFACE,1,0,FACE);B(3,0,TFACE,2,0,FACE);B(7,0,TFACE,6,0,FACE);B(1,1,PREV,2,2,NEXT);B(1,2,NEXT,6,1,PREV);B(2,1,PREV,4,0,NEXT);s.fill[4]=1;s.fn[2]=1;   // P exposed the fill in the previous pass
  s.chemistry();assert.ok(s.bond[3]>=0,'U holds its face while P has a fill beside it');
  B(4,1,PREV,5,0,NEXT);s.chemistry();assert.ok(s.bond[3]>=0,'the fill completed this pass: U hears it one pass later');
  s.chemistry();assert.ok(s.bond[3]<0,'U lets go in the next pass');s.derive();assert.ok(s.refr[1]===1||s.busy[1]===0,'released U is refractory');});
test('copy: a docked triangle keeps its template while a fill that bound in this pass is incomplete',()=>{
  const {PREV,NEXT}=require('./sim');const {s}=createWorld({seed:2,size:18,founders:[{gaps:[1,0,2,1,1],faces:'abaabb'}],supply:{'A--':14,'B--':14,'a--':14,'b--':14,'---':50}});
  let bad=0;const chem=s.chemistry.bind(s);s.chemistry=()=>{const faces=[];for(let u=0;u<s.n;u++){const e=s._edges(u);if(e.face>=0)faces.push([u,e]);}chem();
    for(const [u,e] of faces){if(s.bond[u*3+e.face]>=0)continue;for(const i of [e.prev,e.next]){if(i<0||s.bond[u*3+i]<0)continue;const w=s.partner(u,i),f=s._edges(w);if(s.fill[w]&&(f.prev<0||f.next<0))bad++;}}};
  s.run(1500);assert.ok((s.ev.release||0)>=1,'copies release');assert.equal(bad,0,'a release left an incomplete fill behind');});
test('copy side: only a triangle bonded by its copy side alone takes its partner\'s type',()=>{
  const s=new TriSim({W:40,H:40,seed:1},3);s.setType(0,'abc');s.setType(1,'a?-x');s.setType(2,'X--');for(let u=0;u<3;u++){s.px[u]=3*u+2;s.py[u]=5;}
  s.link(0,0,1,0);s.bkind[0]=GLUE;s.bkind[3]=GLUE;s.link(1,2,2,0);s.bkind[5]=GLUE;s.bkind[6]=GLUE;s.chemistry();
  assert.equal(s.typeName(1),'a?-x','an attached triangle with a copy side is no copy blank');assert.ok(s.bond[3]>=0);
  s.cut(1,2);s.chemistry();assert.equal(s.typeName(1),'abc','bonded by its copy side alone it copies (the partner turned about the shared edge)');});
test('conservation: blocks stay in play, types change only by copy (a ring kit, copy blanks, a founder and its dockers)',()=>{
  const {triDepth}=require('./physics');
  const {s}=createWorld({seed:2,size:14,founders:[{gaps:[1,1],faces:'aba',x:3,y:3}],structures:[{tris:S.ringKit(3,'z').tris,x:8,y:8}],supply:{'A--':4,'B--':4,'---':10,'-?-?-?':12}});
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
test('physics: an anchor never pulls a strand through a wall (the whole capture path must be clear)',()=>{
  // a strand end lies within capture of an anchor site, the strand turned 100 degrees from its flush place and a welded
  // wall row across the sweep of its far part: the destination is clear, the path is not (it was captured, 2026-10-02)
  const {GLUE}=require("./sim"),phi=-100*Math.PI/180,R0=3,SH=0.55,tris=[];for(let k=0;k<4;k++)tris.push({v:[[k,0],[k+1,0],[k+0.5,H]],type:'---'},{v:[[k+1,0],[k+1.5,H],[k+0.5,H]],type:'---'});
  const {s,founders}=createWorld({seed:5,size:30,founders:[{gaps:[1,1,1,1,1,1],faces:'aaaaaaa',ends:'-z',x:15,y:15}],supply:{'---':2+tris.length},params:{sigma:0,sigmaRot:0}});
  const F=founders[0],u=F[F.length-1],i=s.roles(u).inert,P=k=>[s.px[u]+s.ox[u*3+k],s.py[u]+s.oy[u*3+k]];
  const a=P(i),b=P((i+1)%3),c=P((i+2)%3),x=[a[0]+b[0]-c[0],a[1]+b[1]-c[1]],V=[b,a,x],W2=[V[2],V[1],[V[1][0]+V[2][0]-V[0][0],V[1][1]+V[2][1]-V[0][1]]];
  const A=F.length,A2=A+1;placeTri(s,A,V);placeTri(s,A2,W2);s.setType(A,'Z|f-');s.setType(A2,'F--');s.bind(A,1,GLUE,A2,0,GLUE);
  const units=tris.map((_,k)=>A2+1+k);for(const w of units)s.px[w]=-50;
  const cx=s.px[u],cy=s.py[u],fin0=[s.px[F[0]],s.py[F[0]]],ax=s._dx(s.px[A]-cx),ay=s._dy(s.py[A]-cy),al=Math.hypot(ax,ay),sx=-SH*ax/al,sy=-SH*ay/al,co=Math.cos(phi),si=Math.sin(phi);
  for(const w of F){const dx=s._dx(s.px[w]-cx),dy=s._dy(s.py[w]-cy);s.px[w]=s._wx(cx+co*dx-si*dy+sx);s.py[w]=s._wy(cy+si*dx+co*dy+sy);s.pa[w]+=phi;s.resetShape(w);}
  const ang=(X,Y)=>Math.atan2(s._dy(Y-cy),s._dx(X-cx)),a0=ang(s.px[F[0]],s.py[F[0]]),a1=ang(fin0[0],fin0[1]),mid=Math.atan2(Math.sin(a0)+Math.sin(a1),Math.cos(a0)+Math.cos(a1));
  buildStructure(s,units,tris,cx+R0*Math.cos(mid)+Math.sin(mid)*H/2,cy+R0*Math.sin(mid)-Math.cos(mid)*H/2,mid);s.gridSync();
  assert.equal(s.moveDepth(F,0,0,0,s.px[F[0]],s.py[F[0]]),0,'start clear');s.derive();s.run(3);
  assert.ok(s.partner(u,i)!==A&&!s.ev.anchor,'the strand was captured through the wall');});
test('binding: a bonded triangle is never free (a docked template that lost its chain bonds is not caught again)',()=>{
  const {FACE}=require('./sim'),s=new TriSim({W:16,H:16,seed:2,sigma:0,sigmaRot:0},4);
  const refl=u=>i=>{const P=k=>[s.px[u]+s.ox[u*3+k],s.py[u]+s.oy[u*3+k]];const a=P(i),b=P((i+1)%3),c=P((i+2)%3);return [b,a,[a[0]+b[0]-c[0],a[1]+b[1]-c[1]]];};
  const u=0,w=1,t=2,d=3;placeTri(s,u,[[8,8],[9,8],[8.5,8+H]]);s.setType(u,'a-f');placeTri(s,w,refl(u)(2));s.setType(w,'F--');s.bind(u,2,GLUE,w,0,GLUE);
  const S=refl(u)(0),Sc=[(S[0][0]+S[1][0]+S[2][0])/3,(S[0][1]+S[1][1]+S[2][1])/3];placeTri(s,t,S.map(p=>[2*Sc[0]-p[0],2*Sc[1]-p[1]-0.5]));s.setType(t,'A--');
  placeTri(s,d,refl(t)(0));s.setType(d,'a--');s.bind(t,0,TFACE,d,0,FACE);s.gridSync();s.physics();s.derive();s.formBonds();
  assert.equal(s.bond[t*3],d*3,'the template keeps its face bond');symmetric(s);assert.throws(()=>s.bind(u,0,GLUE,t,0,GLUE),/already bonded/);});
const closureCase=(K,range)=>{
  // no physics: cells are bonded in growth order (as parts arriving), each followed by signal passes (derive, release)
  const R=5,N=K.N,AK=K.anchorCell,SE=K.types[AK].includes('Z@|')?'z--':'w--',s=new TriSim({W:40,H:40,sigma:0,sigmaRot:0,openRange:range},2*N+2),O=[20,20],at=p=>[O[0]+p[0],O[1]+p[1]];
  const sh=(a,b)=>{const eq=(p,q)=>Math.hypot(p[0]-q[0],p[1]-q[1])<1e-6;for(let i=0;i<3;i++)for(let j=0;j<3;j++)if(eq(a[i],b[(j+1)%3])&&eq(a[(i+1)%3],b[j]))return [i,j];return null;};
  // geometry: the bud (the parent turned 180 degrees about its pore) puts its root on the parent's seed site and its E on the parent's root, without overlap
  const Bv=K.tris.map(t=>t.v.map(p=>S.budPose(R,p)));
  assert.deepEqual(sh(Bv[0],K.tris[N-1].v),[K.rootSide,K.seedSide],'bud root on the parent seed site');
  assert.deepEqual(sh(Bv[N-1],K.tris[0].v),[K.seedSide,K.rootSide],'bud seed site on the parent root');
  const cen=v=>[(v[0][0]+v[1][0]+v[2][0])/3,(v[0][1]+v[1][1]+v[2][1])/3];for(const b of Bv)for(const t of K.tris){const c=cen(b),d=cen(t.v);assert.ok(Math.hypot(c[0]-d[0],c[1]-d[1])>0.5,'bud overlaps parent');}
  assert.equal(new Set(K.letters).size,N-1,'one letter per bond');assert.ok(![...K.letters].some(c=>'awzyf'.includes(c)),'kit letter clashes with genome or seed');
  const refl=(u,i)=>{const P=k=>[s.px[u]+s.ox[u*3+k],s.py[u]+s.oy[u*3+k]],a=P(i),b=P((i+1)%3),c=P((i+2)%3);return [b,a,[a[0]+b[0]-c[0],a[1]+b[1]-c[1]]];};
  const pass=k=>{for(let q=0;q<k;q++){s.derive();s._release();}},state=U=>U.map(u=>[0,1,2].map(i=>(s.bond[u*3+i]>=0?'b':'-')+(s.spent[u*3+i]?'s':'-')).join(' '));
  // the parent: complete, its founder held by its root's anchor side (a stand-in strand end w)
  const Pu=[...Array(N).keys()],Bu=Pu.map(k=>N+k),Ps=2*N,Bs=2*N+1;buildStructure(s,Pu,K.tris,O[0],O[1]);
  placeTri(s,Ps,refl(Pu[AK],K.anchorSide));s.setType(Ps,SE);s.bind(Pu[AK],K.anchorSide,GLUE,Ps,0,GLUE);pass(10);
  const P0=state(Pu);assert.ok(Pu.every(u=>s.op[u]===0),'the parent hears no open signal');
  assert.ok(s.bond[Pu[N-1]*3+K.seedSide]<0&&!s.spent[Pu[N-1]*3+K.seedSide],'the parent seed site is free');
  Bv.forEach((v,k)=>{placeTri(s,Bu[k],v.map(at));s.setType(Bu[k],K.types[k]);});
  // growth: the root on the parent's seed site, then each cell on its predecessor; a stall of 300 passes half way
  const held=()=>s.bond[Bu[0]*3+K.rootSide]===Pu[N-1]*3+K.seedSide;
  s.bind(Bu[0],K.rootSide,GLUE,Pu[N-1],K.seedSide,GLUE);pass(5);assert.ok(held(),'root let go');
  for(let k=1;k<N;k++){const [i,j]=sh(Bv[k],Bv[k-1]);s.bind(Bu[k],i,GLUE,Bu[k-1],j,GLUE);pass(k===25?300:4);assert.ok(held(),'the bud let go while growing (cell '+k+')');}
  pass(20);assert.ok(held(),'the complete bud let go before its anchor caught');
  assert.deepEqual(Bu.filter(u=>s.op[u]>0),Bu.filter((u,k)=>Math.abs(k-AK)<range),'only the waiting anchor emits; its range only is unspent');assert.ok(s.op[Bu[0]]>0,'the root hears no open signal');
  // the catch: the bud's anchor takes a strand end; completion releases the root from the parent
  placeTri(s,Bs,refl(Bu[AK],K.anchorSide));s.setType(Bs,SE);s.bind(Bu[AK],K.anchorSide,GLUE,Bs,0,GLUE);pass(10);
  assert.ok(s.bond[Bu[0]*3+K.rootSide]<0,'the bud did not let go after its catch');
  assert.ok(s.bond[Pu[N-1]*3+K.seedSide]<0&&!s.spent[Pu[N-1]*3+K.seedSide],'the parent seed site is not free again');
  // closure: the bud is now in the parent's starting state (same types, bonds and spent sides cell by cell), and so is the parent
  assert.deepEqual(state(Bu),P0,'the bud is not in the parent\'s state');assert.deepEqual(state(Pu),P0,'the parent changed');symmetric(s);};
test('closure (budKit): a bud grown cell by cell on its parent holds until its anchor catches, then lets go in the parent\'s own state',()=>closureCase(S.budKit(5),3));
// the anchor Z@| on arc cell 6 (run 20261003-1921): the open range reaches the root from there
test('closure (budKit, anchor on cell 6, Z@|): the bud holds until its catch and lets go in the parent\'s state',()=>closureCase(S.budKit(5,7,null,false,{at:6,glue:'Z'}),9));
test('worlds: founder census reads faces and gaps',()=>{const {s}=createWorld({seed:1,size:14,founders:[{gaps:[1,0,2],faces:'abab'}]});
  const c=census(s);assert.equal(c.length,1);assert.equal(c[0].faces,'abab');assert.equal(c[0].gaps,'102');});
console.log(`${passed} tests passed`);
