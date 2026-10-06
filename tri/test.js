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
  {const q=new TriSim({},1);q.setType(0,'z@!-|-|');assert.equal(q.typeName(0),'z@!-|-|');}
  for(const old of ['K<dA*','a-b$','K%--',"Kb.'@X"])assert.throws(()=>parseType(old),/marks/,'removed mark accepted: '+old);});

// a founder face with a docker placed exactly on it (no jostle): docks only with the complementary glue (the founder is
// held by its high end: only a held strand is copied)
function dockWorld(dockerType,end='high'){
  const {s,founders}=createWorld({seed:3,size:12,founders:[{gaps:[1,1],faces:'aba',hold:'z',x:6,y:6}],supply:{[dockerType]:1},params:{sigma:0,sigmaRot:0}});
  const f=founders[0],u=end==='high'?f[f.length-1]:f[0],r=s.roles(u),d=s.n-1,i=r.free,P=k=>[s.px[u]+s.ox[u*3+k],s.py[u]+s.oy[u*3+k]];
  const a=P(i),b=P((i+1)%3),c=P((i+2)%3),x=[a[0]+b[0]-c[0],a[1]+b[1]-c[1]];placeTri(s,d,[b,a,x]);   // reflection of the face triangle across its face
  s.setType(d,dockerType);s.derive();return {s,u,d,i};}
test('copy: complementary docking only',()=>{
  for(const [type,expect] of [['A--',true],['B--',false],['a--',false]]){const {s,u,d,i}=dockWorld(type);s.run(30);
    assert.equal(s.bond[u*3+i]>=0&&((s.bond[u*3+i]/3)|0)===d,expect,`docker ${type}`);symmetric(s);}});
test('binding: a free triangle docks by none of its close-only or spent sides',()=>{
  for(const type of ['A.--','A--']){const {s,u,d,i}=dockWorld(type);if(type==='A--')s.spent[d*3]=1;s.derive();s.run(30);
    assert.ok(s.bond[u*3+i]<0,`docker ${type}${type==='A--'?' (side spent)':''} must not dock`);}});
test('binding: an attached triangle\u2019s close-only side takes no dock or fill (a close-only side binds no free triangle)',()=>{
  {const {s,u,i}=dockWorld('A--');s.cOnly[u*3+i]=1;s.derive();s.run(30);assert.ok(s.bond[u*3+i]<0,'a close-only face took a dock');}
  // dockers whose prev side (the side a fill binds) is close-only: copies dock but take no fill (control: plain dockers)
  for(const [mk,expect] of [['.',false],['',true]]){const {s}=createWorld({seed:2,size:18,founders:[{gaps:[1,0,2,1,1],faces:'abaabb',hold:'z'}],
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
  // the strand is held by its high end (so it is copied); a docker on the high end's face; a second anchor W| catches the low end w
  const {s,founders,holds}=createWorld({seed:5,size:16,founders:[{gaps:[1,1],faces:'aaa',ends:'w',hold:'z',x:6,y:8}],supply:{'---':3},params:{sigma:0,sigmaRot:0}});
  const F=founders[0],h=F[F.length-1],rh=s.roles(h),u=F[0],r=s.roles(u),i=r.inert,P=(w,k)=>[s.px[w]+s.ox[w*3+k],s.py[w]+s.oy[w*3+k]],refl=(w,e)=>{const a=P(w,e),b=P(w,(e+1)%3),c=P(w,(e+2)%3);return [b,a,[a[0]+b[0]-c[0],a[1]+b[1]-c[1]]];};
  const D=s.n-3;placeTri(s,D,refl(h,rh.free));s.setType(D,'A--');s.derive();s.run(3);assert.ok(s.partner(h,rh.free)===D,'docked on the high end');
  const sh=[0.12,-0.08],V=refl(u,i).map(p=>[p[0]+sh[0],p[1]+sh[1]]);
  const W2=[V[2],V[1],[V[1][0]+V[2][0]-V[0][0],V[1][1]+V[2][1]-V[0][1]]];placeTri(s,s.n-2,V);placeTri(s,s.n-1,W2);s.setType(s.n-2,'W|f-');s.setType(s.n-1,'F--');s.bind(s.n-2,1,GLUE,s.n-1,0,GLUE);
  for(let k=0;k<6;k++)s.derive();s.run(3);assert.equal(s.partner(u,i),s.n-2,'caught while being copied');assert.equal(s.partner(h,rh.free),D,'the docker stays');
  assert.equal(s.partner(h,rh.inert),holds[0][0],'the high end stays held');
  assert.ok(s.flushGap(u,i,s.n-2,0)<1e-6,'flush');assert.ok(s.flushGap(h,rh.free,D,s.bond[h*3+rh.free]%3)<1e-6,'the docker moved with the strand');symmetric(s);});
test('copy: only a strand held by its high end is copied (a free strand, or one held by its low end, takes no dock)',()=>{
  // a strand's high end, a docker A-- at its face; the strand free, held by its high end (hold: an anchor Z| on the spare
  // edge z), or held by its low end (an anchor W| on the low end's spare edge w). Only an anchor's catch binds a strand
  // end (run 20261004-0022); the option heldCopy (run 20261003-1720) is the rule since run 20261004-0820
  for(const [hold,expect] of [[null,false],['high',true],['low',false]]){
    const {s,founders}=createWorld({seed:5,size:16,founders:[{gaps:[1,1],faces:'aaa',ends:'w',hold:hold==='high'?'z':undefined,x:6,y:8}],supply:{'---':hold==='low'?3:1},params:{sigma:0,sigmaRot:0}});
    const F=founders[0],u=F[F.length-1],r=s.roles(u),P=(w,k)=>[s.px[w]+s.ox[w*3+k],s.py[w]+s.oy[w*3+k]],refl=(w,e)=>{const a=P(w,e),b=P(w,(e+1)%3),c=P(w,(e+2)%3);return [b,a,[a[0]+b[0]-c[0],a[1]+b[1]-c[1]]];};
    if(hold==='low'){const l=F[0],V=refl(l,s.roles(l).inert),W2=[V[2],V[1],[V[1][0]+V[2][0]-V[0][0],V[1][1]+V[2][1]-V[0][1]]];placeTri(s,s.n-3,V);placeTri(s,s.n-2,W2);s.setType(s.n-3,'W|f-');s.setType(s.n-2,'F--');
      s.bind(s.n-3,1,GLUE,s.n-2,0,GLUE);s.bind(l,s.roles(l).inert,GLUE,s.n-3,0,GLUE);}
    const D=s.n-1;placeTri(s,D,refl(u,r.free));s.setType(D,'A--');s.derive();s.run(3);
    assert.equal(s.partner(u,r.free)===D,expect,hold?'held by its '+hold+' end':'free');}});
test('copy side: a strand triangle is a template whether or not its strand is held (candidate (p), heldContact, removed in run 20261005-1921)',()=>{
  // a copy blank flush at the low end's free face of a 5-triangle strand, free or held by its high end: copied both times
  const run=hold=>{const {s,founders}=createWorld({seed:5,size:16,founders:[{gaps:[1,1],faces:'aaa',hold:hold?'z':undefined,x:6,y:8}],supply:{'-?-?-?':1},params:{sigma:0,sigmaRot:0}});
    const F=founders[0],u=F[0],r=s.roles(u),P=k=>[s.px[u]+s.ox[u*3+k],s.py[u]+s.oy[u*3+k]],a=P(r.free),b=P((r.free+1)%3),c=P((r.free+2)%3);
    for(let k=0;k<8;k++)s.derive();
    const D=s.n-1;placeTri(s,D,[b,a,[a[0]+b[0]-c[0],a[1]+b[1]-c[1]]]);s.derive();s.run(2);return !!s.ev.copy;};
  assert.ok(run(false),'a free strand is copied');assert.ok(run(true),'a held strand is copied');});
test('anchor: a free triangle\u2019s anchor side binds as its glue does (an inert one binds nothing)',()=>{
  // a free triangle beside a grown triangle's glue side z: binds by Z with or without the anchor mark (run 0050's
  // narrowing, a free anchor side binds nothing, was removed in run 20261004-0820); a closed side -| binds nothing
  for(const [ty,expect] of [['Z|--',true],['Z--',true],['-|--',false]]){
    const s=new TriSim({W:16,H:16,seed:5,sigma:0,sigmaRot:0},3),V=[[6,6],[7,6],[6.5,6+H]],W2=[V[2],V[1],[V[1][0]+V[2][0]-V[0][0],V[1][1]+V[2][1]-V[0][1]]];
    placeTri(s,0,V);placeTri(s,1,W2);s.setType(0,'zf-');s.setType(1,'F--');s.bind(0,1,GLUE,1,0,GLUE);
    const a=V[0],b=V[1],c=V[2];placeTri(s,2,[b,a,[a[0]+b[0]-c[0],a[1]+b[1]-c[1]]].map(p=>[p[0]+0.1,p[1]-0.05]));s.setType(2,ty);s.derive();s.run(3);
    assert.equal(s.partner(0,0)===2,expect,ty);symmetric(s);}});
test('binding: a strand end\u2019s seed and a strand\u2019s back bind no free triangle by glue (only an anchor catches an end)',()=>{
  // a free triangle with the complementary glue beside the high end's spare edge z, or beside a back's free edge b
  for(const [ty,where] of [['Z@--','end'],['Z--','end'],['B--','back']]){
    const {s,founders}=createWorld({seed:5,size:16,founders:[{gaps:[1,1],faces:'aaa',ends:'-z',x:6,y:8}],supply:{'---':1},params:{sigma:0,sigmaRot:0}});
    const F=founders[0],u=where==='end'?F[F.length-1]:F.find(w=>s.roles(w).role===2),r=s.roles(u),i=where==='end'?r.inert:r.free;if(where==='back')s.glue[u*3+i]=gcode('b');
    const P=k=>[s.px[u]+s.ox[u*3+k],s.py[u]+s.oy[u*3+k]],a=P(i),b=P((i+1)%3),c=P((i+2)%3);
    const v=s.n-1;placeTri(s,v,[b,a,[a[0]+b[0]-c[0],a[1]+b[1]-c[1]]].map(p=>[p[0]+0.1,p[1]-0.05]));s.setType(v,ty);s.derive();s.run(3);
    assert.ok(s.partner(u,i)!==v&&!s.ev.glue,ty+' bound the '+where);symmetric(s);}});
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
  const {s}=createWorld({seed:5,size:12,founders:[{gaps:[1,1],faces:'aba',hold:'z'}],supply:{'A--':4,'B--':4,'---':6}});s.run(50);
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
  const {triDepth}=require('./physics');
  const {s}=createWorld({seed:4,size:12,founders:[{gaps:[1,0,2],faces:'abab',hold:'z'}],supply:{'A--':10,'B--':10,'a--':10,'b--':10,'---':20}});s.run(600);
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
  s.chemistry();assert.ok(s.bond[3]<0,'U lets go in the next pass');});
test('copy: a docked triangle keeps its template while a fill that bound in this pass is incomplete',()=>{
  const {PREV,NEXT}=require('./sim');const {s}=createWorld({seed:2,size:18,founders:[{gaps:[1,0,2,1,1],faces:'abaabb',hold:'z'}],supply:{'A--':14,'B--':14,'a--':14,'b--':14,'---':50}});
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
  const {s}=createWorld({seed:2,size:14,founders:[{gaps:[1,1],faces:'aba',hold:'z',x:3,y:3}],structures:[{tris:S.ringKit(3,'z').tris,x:8,y:8}],supply:{'A--':4,'B--':4,'---':10,'-?-?-?':12}});
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
  placeTri(s,Ps,refl(Pu[AK],K.anchorSide));s.setType(Ps,SE);s.bind(Pu[AK],K.anchorSide,GLUE,Ps,0,GLUE);pass(10);
  const P0=state(Pu);assert.ok(Pu.every(u=>s.op[u]===0),'the parent hears no open signal');
  assert.ok(s.bond[Pu[SC]*3+K.seedSide]<0&&!s.spent[Pu[SC]*3+K.seedSide],'the parent seed site is free');
  Bv.forEach((v,k)=>{placeTri(s,Bu[k],v.map(at));s.setType(Bu[k],K.types[k]);});
  // growth: the root on the parent's seed site, then each cell on its predecessor; a stall of 300 passes half way
  const held=()=>s.bond[Bu[0]*3+K.rootSide]===Pu[SC]*3+K.seedSide;
  s.bind(Bu[0],K.rootSide,GLUE,Pu[SC],K.seedSide,GLUE);s.caught(Bu[0]);pass(5);assert.ok(held(),'root let go');
  for(let k=1;k<N;k++){const [i,j]=sh(Bv[k],Bv[k-1]);s.bind(Bu[k],i,GLUE,Bu[k-1],j,GLUE);s.caught(Bu[k]);pass(k===25?300:4);assert.ok(held(),'the bud let go while growing (cell '+k+')');}
  pass(20);assert.ok(held(),'the complete bud let go before its anchor caught');
  assert.deepEqual(Bu.filter(u=>s.op[u]>0),Bu.filter((u,k)=>Math.abs(k-AK)<range),'only the waiting anchor emits; its range only is unspent');assert.ok(s.op[Bu[0]]>0,'the root hears no open signal');
  // the catch: the bud's anchor takes a strand end; completion releases the root from the parent
  placeTri(s,Bs,refl(Bu[AK],K.anchorSide));s.setType(Bs,SE);s.bind(Bu[AK],K.anchorSide,GLUE,Bs,0,GLUE);pass(10);
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
  placeTri(s,Ps,refl(Pu[AK],K.anchorSide));s.setType(Ps,'z--');s.bind(Pu[AK],K.anchorSide,GLUE,Ps,0,GLUE);s.bind(Bu[0],K.rootSide,GLUE,Pu[SC],K.seedSide,GLUE);
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
// receptor (run 20261004-2221, build): the kit with a lysis receptor 'Г@&' on E's outer side (openRange 50, more than the
// 40 bonds from the anchor cell 6 to E); a parent holding a stand-in strand end, its complete bud on the seed site (cell
// 45), waiting for a catch or (caught) holding a stand-in strand end; a cutter 'г@!-|-|' placed at the bud's receptor; no motion
const receptorCase=caught=>{const K=S.budKit(5,7,null,true,{at:6,glue:'Z'},'-|',45,'Г@&'),N=K.N,AK=K.anchorCell,SC=K.seedCell,E=N-1,s=new TriSim({W:40,H:40,sigma:0,sigmaRot:0,openRange:50},2*N+3),O=[20,20];
  const Pu=[...Array(N).keys()],Bu=Pu.map(k=>N+k),Ps=2*N,Bs=2*N+1,C=2*N+2;buildStructure(s,Pu,K.tris,O[0],O[1]);buildStructure(s,Bu,K.tris.map(t=>({...t,v:t.v.map(K.pose)})),O[0],O[1]);
  const refl=(u,i)=>{const P=k=>[s.px[u]+s.ox[u*3+k],s.py[u]+s.oy[u*3+k]],a=P(i),b=P((i+1)%3),c=P((i+2)%3);return [b,a,[a[0]+b[0]-c[0],a[1]+b[1]-c[1]]];};
  placeTri(s,Ps,refl(Pu[AK],K.anchorSide));s.setType(Ps,'z--');s.bind(Pu[AK],K.anchorSide,GLUE,Ps,0,GLUE);
  if(caught){placeTri(s,Bs,refl(Bu[AK],K.anchorSide));s.setType(Bs,'z--');s.bind(Bu[AK],K.anchorSide,GLUE,Bs,0,GLUE);}else{placeTri(s,Bs,[[1,1],[2,1],[1.5,1+Math.sqrt(3)/2]]);s.px[Bs]=-30;}
  // the parent stood alone once (as every parent has: it was a bud that caught and let go), so its receptor is spent; then the bud's root binds its seed site
  for(let k=0;k<60;k++)s.derive();s.step();s.bind(Bu[0],K.rootSide,GLUE,Pu[SC],K.seedSide,GLUE);for(let k=0;k<60;k++)s.derive();s.step();
  const parentSpent=!!s.spent[Pu[E]*3+K.receptorSide],budSpent=!!s.spent[Bu[E]*3+K.receptorSide];
  placeTri(s,C,refl(Bu[E],K.receptorSide));s.setType(C,'г@!-|-|');s.gridSync();
  let bound=0,apart=0;for(let k=1;k<=120;k++){s.step();if(!bound&&s.partner(Bu[E],K.receptorSide)===C)bound=k;if(!apart&&Bu.every(u=>!s.bonded(u)))apart=k;}
  const whole=Pu.slice(1).every((u,k)=>[0,1,2].some(i=>s.partner(u,i)===Pu[k]))&&s.partner(Pu[AK],K.anchorSide)===Ps;
  return {s,K,Bu,parentSpent,budSpent,bound,apart,whole};};
test('receptor: a cutter binds the receptor on the last cell of a complete bud waiting for its catch and takes the bud apart; a bud that has caught and its parent are immune',()=>{
  const w=receptorCase(false);assert.ok(w.parentSpent,'the parent\'s receptor (holding its strand) is not spent');assert.ok(!w.budSpent,'the waiting bud\'s receptor is spent');
  assert.ok(w.bound>0,'the cutter did not bind the waiting bud\'s receptor');assert.ok(w.apart>0,`the waiting bud did not come apart (bound at pass ${w.bound})`);assert.ok(w.whole,'the parent did not stay whole');
  const c=receptorCase(true);assert.ok(c.budSpent,'the receptor of a bud holding a strand is not spent');assert.ok(!c.bound&&!c.s.ev.lyse,'a cutter bound or lysed a bud that has caught');
  assert.ok(c.Bu.slice(1).every((u,k)=>[0,1,2].some(i=>c.s.partner(u,i)===c.Bu[k])),'the bud that has caught came apart');});
// scavenger (designed in explore run 20261005-0721, NEXT step 1a; not yet in a demo): two welded triangles whose anchor side
// Z@|!& holds a strand's high end, lyses it (!) and stops the lysis at that bond (&); its '@' keeps free monomers off it
// (without it the freed high end, 'z' on its spare edge, glue-bound the side again every other pass); a glued attach side
// no part matches (Ж@|) emits the open signal, so the & side never hears "complete" and is never spent. Without & the
// lysis comes back and takes the scavenger apart too
const scavengerCase=amp=>{const {s,founders,holds}=createWorld({seed:5,size:16,founders:[{gaps:[1,1,1],faces:'aAaA',hold:'z',x:8,y:8}],params:{sigma:0,sigmaRot:0}});
  const [A,A2]=holds[0],F=founders[0];s.setType(A,s.typeName(A).replace('Z|','Z@|!'+(amp?'&':'')).replace('-|','Ж@|'));
  for(let k=0;k<5;k++)s.derive();for(let k=0;k<12;k++)s.step();   // the open signal settles first (the scavenger is prepared so)
  return {s,A,A2,F,apart:F.every(u=>!s.bonded(u)),whole:[0,1,2].some(i=>s.partner(A,i)===A2),free:[0,1,2].every(i=>!(s.anc[A*3+i]&&s.glue[A*3+i]===s.glue[A*3+[0,1,2].find(j=>s.lys[A*3+j])])||s.bond[A*3+i]<0),
    spent:[0,1,2].some(i=>s.lys[A*3+i]&&s.spent[A*3+i])};};
test('scavenger: an anchor side Z@|!& takes apart the strand it holds into monomers and stays whole, its anchor free and unspent; without & it dies too',()=>{
  const w=scavengerCase(true);assert.ok(w.apart,'the held strand did not come apart');assert.ok(w.whole,'the scavenger came apart');assert.ok(w.free,'the anchor side still holds');assert.ok(!w.spent,'the anchor side was spent');
  const c=scavengerCase(false);assert.ok(c.apart,'the held strand did not come apart (no &)');assert.ok(!c.whole,'without & the scavenger stayed whole');});
test('worlds: founder census reads faces and gaps',()=>{const {s}=createWorld({seed:1,size:14,founders:[{gaps:[1,0,2],faces:'abab'}]});
  const c=census(s);assert.equal(c.length,1);assert.equal(c[0].faces,'abab');assert.equal(c[0].gaps,'102');});
console.log(`${passed} tests passed`);
