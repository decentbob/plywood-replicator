'use strict';
// Demos of every capability (one or two small worlds each; pictures + saved states in the output directory).
//   node tri/demos.js NAME [seed] [steps] [outdir] [extra]
// NAME: copy | ring | imprint | pool | budpool | budcycle | closure (budpore, the doorway pairs, retired 2026-10-04: git `882b7d4`; the casting lineage's demos were removed on 2026-10-03; git `7415fd4`)
const path=require('path');
const {createWorld,placeFree,census,typeCount,buildStructure,placeTri}=require('./world');
const {render,montage}=require('./render');
const S=require('./structures');
const {TriSim,canon,typeName}=require('./sim');
const H=Math.sqrt(3)/2;

// a genome copied from contact copies of itself (faces its own reverse complement, e.g. aAaA): every face triangle
// carries seed w on its prev side and z on its next (as a docker: face F, prev F+1, next F+2), so every strand exposes
// w at its low end and z at its high end; every back carries W on its next side, so (a fill needs the complement of the
// docker's prev glue) only copies of backs fill
function seedCopyGenome(s,F){const {gcode}=require('./sim');
  for(const u of F){const r=s.roles(u);if(r.role===2){s.glue[u*3+r.next]=gcode('W');continue;}if(r.role!==1)continue;s.glue[u*3+(r.free+1)%3]=gcode('w');s.glue[u*3+(r.free+2)%3]=gcode('z');}}
// every plain free side (inert, no marks) of prepared units U becomes a completion side '&': it binds nothing, and once
// its triangle hears no open signal it is spent (never copied)
function spendableSides(s,U){for(const u of U)for(let i=0;i<3;i++){const k=u*3+i;if(s.bond[k]<0&&!s.glue[k]&&!s.cOnly[k]&&!s.att[k]&&!s.anc[k]&&!s.cpy[k])s.done[k]=1;}}
function demo(name,seed=1,steps,dir='runs',extra){
  // TRI_NOPIC=1: no pictures or saved states (each picture starts a Chromium; tri/check.js reads only the reports)
  const shots=[],out=f=>path.join(dir,`${name}_${f}.png`),pics=!process.env.TRI_NOPIC;
  const snap=(s,f,title,focus,labels=true)=>{if(!pics)return;render(s,out(f),title,focus,labels);shots.push(out(f));};
  const finish=(title,cols=4)=>{if(!pics)return;montage(path.join(dir,`${name}.png`),cols,title,shots);console.log('pictures:',path.join(dir,`${name}.png`));};
  const every=(t,k)=>t%Math.max(1,(steps/k)|0)===0;
  const D={
    // typed chain copying: faces read glue; the copy carries complementary faces. The founder starts held by its high end
    // on a prepared anchor (labelled; only a held strand is copied, so its copies, which let go, are not copied again)
    copy(){steps=steps||10000;const {s}=createWorld({seed,size:18,founders:[{gaps:[1,0,2,1,1],faces:'abaabb',hold:'z'}],supply:{'A--':14,'B--':14,'a--':14,'b--':14,'---':50}});
      snap(s,'t0','t=0: founder abaabb, held by its high end',null,false);
      for(let t=1;t<=steps;t++){s.step();if(every(t,10))console.log(`t=${t} strands [${census(s).filter(c=>c.n>1).map(c=>c.faces+'/'+c.gaps+(c.paired?'*':'')).join(' ')}] docks=${s.ev.dock||0} releases=${s.ev.release||0}`);
        if(every(t,3))snap(s,`t${t}`,`t=${t}`,null,false);}
      finish('Typed chain copying: the held founder abaabb makes copies BBAABA (its reverse complement)');},
    // imprint (contact copying): two anchors z-- (labelled start); on the first a ring (R=3) grown one motif round
    // (root and the 5 motif cells: one of each part, prepared), the second bare (welded to a plain cell so it is
    // attached); copy blanks -?-?-? are the only food: no free parts. A copy blank that touches a free side of an
    // attached triangle becomes a copy of it, so the ring's own cells and root multiply, the ring closes and a second
    // ring grows on the bare anchor. extra: number of copy blanks (default 400); 'c': control, blanks without copy sides
    imprint(){if(/[mp]/.test(String(extra||'')))return D.imprintCell();if(String(extra||'').includes('g'))return D.imprintGenome();steps=steps||100000;const ctl=String(extra||'').includes('c'),nb=parseInt(extra)||400,size=36,c=size/2,K=S.ringKit(3,'z'),r=K.tris[0],i=K.rootSide;
      const a=r.v[i],b=r.v[(i+1)%3],cc=r.v[(i+2)%3],anchor={v:[b,a,[a[0]+b[0]-cc[0],a[1]+b[1]-cc[1]]],type:'z--'};
      const supply={[ctl?'---':'-?-?-?']:nb},av=anchor.v,weld={v:[av[2],av[1],[av[1][0]+av[2][0]-av[0][0],av[1][1]+av[2][1]-av[0][1]]],type:'---'};
      const {s,structures}=createWorld({seed,size,structures:[{tris:[anchor,...K.tris.slice(0,1+K.P)],x:c-7,y:c},{tris:[anchor,weld],x:c+7,y:c}],supply});
      const A=[structures[0][0],structures[1][0]],tmp=new TriSim({},1),norm=t=>{tmp.setType(0,t);return canon(tmp.typeName(0));},motif=K.kit.map(norm),rootT=norm(K.types?K.types[0]:r.type);
      console.log('motif parts',K.kit.join(' '),'root',r.type,ctl?'(control: blanks ---)':'');
      const closed=[0,0],cells=()=>{const {comp}=s.bodies();return A.map((x,q)=>{let k=0;for(let u=0;u<s.n;u++)if(comp[u]===comp[x])k++;return k-1-q;});};
      // a ring is closed once its root's close-only side is bonded (the root: the anchor's partner on the anchor's glue side)
      const isClosed=x=>{const q=s.bond[x*3];if(q<0)return false;const rt=(q/3)|0;return [0,1,2].some(e=>s.cOnly[rt*3+e]&&s.bond[rt*3+e]>=0);};
      const report=t=>{const tc=typeCount(s),n=cells();console.log(`t=${t} ring cells ${n.map(x=>x+'/'+K.N).join(' ')} closed ${closed.map(x=>x||'no').join(' ')} copies=${s.ev.copy||0} parts (attached too) [${motif.map(m=>tc[m]||0).join(' ')}] roots=${tc[rootT]||0} blanks=${tc[norm(ctl?'---':'-?-?-?')]||0}`);};
      snap(s,'t0',`t=0: a ring grown one motif round (one of each part), a bare anchor, ${ctl?'inert blanks (control)':'copy blanks'}`,null,false);
      for(let t=1;t<=steps;t++){s.step();A.forEach((x,k)=>{if(!closed[k]&&isClosed(x))closed[k]=t;});if(every(t,16))report(t);if(every(t,4))snap(s,`t${t}`,`t=${t}: copies ${s.ev.copy||0}, rings ${cells().join(' / ')}${closed[1]?', both closed':''}`,null,false);}
      const n=cells();console.log(`result: ring cells ${n.join(' ')} of ${K.N}, closed at ${closed.map(x=>x||'not yet').join(' / ')}, copies ${s.ev.copy||0}`);
      finish(`Contact copying: a ring with one of each part and copy blanks only; it closes and a second ring grows from copies${ctl?' (control)':''}`);},
    // imprint g (genome on copies): a founder strand whose faces aAaAaA are their own reverse complement, and copy blanks
    // only: no dockers or fills in supply. Copies of the strand's face triangles are its dockers, copies of its backs
    // its fills, so the strand is copied from copies of itself (extra: blanks, default 200; 'c': control, plain blanks).
    // The founder starts held by its high end on a prepared anchor (labelled; only a held strand is copied, since run
    // 20261004-0820: its copies are not copied again, so strands now grow in number linearly, not exponentially)
    imprintGenome(){steps=steps||30000;const ctl=String(extra||'').includes('c'),nb=parseInt(extra)||200,size=24;
      const {s}=createWorld({seed,size,founders:[{gaps:[1,1,1,1,1],faces:'aAaAaA',hold:'z',x:size/2,y:size/2}],supply:{[ctl?'---':'-?-?-?']:nb}});
      const strands=()=>census(s).filter(c=>c.n>=9&&!c.paired),report=t=>{const tc=typeCount(s);
        console.log(`t=${t} strands [${strands().map(c=>c.faces).join(' ')}] copies=${s.ev.copy||0} docks=${s.ev.dock||0} releases=${s.ev.release||0} blanks=${tc[canon(ctl?'---':'-?-?-?')]||0}`);};
      snap(s,'t0',`t=0: founder aAaAaA and ${ctl?'plain blanks (control)':'copy blanks'}, no dockers`,null,false);
      for(let t=1;t<=steps;t++){s.step();if(every(t,10))report(t);if(every(t,3))snap(s,`t${t}`,`t=${t}: ${strands().length} free strands, copies ${s.ev.copy||0}`,null,false);}
      console.log(`result: ${strands().length} free strands (founder included), ${s.ev.release||0} releases, ${s.ev.copy||0} copies`);
      finish(`Genome on copies: a strand copied from contact copies of its own triangles${ctl?' (control)':''}`);},
    // imprint m (genome on copies inside a cell): a sealed ring (R 6, prepared, labelled) holding a founder aAaA (seeded
    // as seedCopyGenome) and copy blanks only. The ring's free sides are completion sides '&': the ring is complete (no
    // open signal), so they are spent at once and never copied; the blanks go to the genome. extra: blanks (default 40);
    // 'n': control, plain walls (the walls take most blanks)
    // imprint p (a cell fed through a pore): as m, but the 3 wall cells in the middle of the top wall are missing (a pore),
    // and the copy blanks start outside only (labelled). Every free side of the ring, outside, inside and the pore's
    // edges, is a spent '&' side, so blanks come in through the pore and copy only the genome. extra: blanks (default
    // 150); 'n': plain walls (control: the walls take the blanks); 'c': no pore (control: no blank gets in)
    // In every variant an anchor Z@| on the bottom inner wall holds the founder by its high end (seed z; only a strand held
    // by its high end is copied: RULES, Core changes, runs 20261003-1720 and 20261004-0820; '@': a free face copy, which
    // carries z, cannot cap it; openRange 1: its signal reaches no wall side). Until run 20261004-0820 the variants without
    // 'z' had an anchor W| holding a strand by its low end, or none ('m'), and copied free strands; 'o' set the option
    // 'w': a 7-cell pore (the closure kind's width: strands pass it)
    imprintCell(){const X=String(extra||''),pore=X.includes('p'),plain=X.includes('n'),closed=pore&&X.includes('c'),nb=parseInt(extra)||(pore?150:40),R=6,size=2*R+8,c=size/2;steps=steps||(pore?100000:40000);
      let ring=S.ringKit(R,'z').tris.map(t=>({v:t.v,type:'---'}));const mid=(v,i)=>[(v[i][0]+v[(i+1)%3][0])/2,(v[i][1]+v[(i+1)%3][1])/2];
      let best=null;if(pore){const ang=t=>{const m=[0,1,2].map(i=>t.v[i]).reduce((a,p)=>[a[0]+p[0]/3,a[1]+p[1]/3],[0,0]);return Math.abs(Math.atan2(m[1],m[0])-Math.PI/2);};
        ring.sort((a,b)=>ang(a)-ang(b));if(!closed)ring=ring.slice(X.includes('w')?7:3);}
      // the anchor: the inner side nearest x = +1 on the flat bottom wall (opposite the pore; at a corner the anchored
      // strand would lie along the next wall, its backs hidden, and no fill could be copied). A strand caught by its low
      // end leans 60 degrees onto the wall, backs underneath; on the side at x = 0 its two outer back sites are 1.53 and
      // 1.73 from wall cells and a founder caught before any back was copied stalled for 50000-90000 steps (no fills); at
      // x = -1 they are 1.53 and 2.31 (run 20261003-1520). A high end leans the other way: the mirror place x = +1.
      // IMPX: another x (dry runs)
      {const ax=process.env.IMPX!==undefined?+process.env.IMPX:1;for(const t of ring)for(let i=0;i<3;i++){const m=mid(t.v,i),d=Math.abs(m[0]-ax);if(m[1]<0&&S.hexr(m)<R-0.5&&(!best||d<best.d))best={t,i,d};}
        best.t.type=[0,1,2].map(i=>i===best.i?'Z@|':'-').join('');}
      // 'h' (with p, a hooded pore): a hood over the pore (prepared, labelled): a strip one row thick two rows above the
      // wall, from x = -2 to the top wall's corner, held by a strut of 4 cells at its left end. Blanks reach the pore along
      // the corridor under it (two rows high, open to the right); a strand (a rigid strip about 4 long) that leaves the
      // pore cannot turn into the corridor, so it stays in
      const NR=ring.length;if(pore&&X.includes('h')){const y0=R*H,up=(k,y)=>({v:[[k,y],[k+1,y],[k+0.5,y+H]],type:'---'});
        // strut: row 1 up [-2,-1] on the wall, row 1 down under [-2.5,-1.5], row 2 up [-2.5,-1.5], row 2 down under [-2,-1]
        ring.push(up(-2,y0),{v:[[-2.5,y0+H],[-2,y0],[-1.5,y0+H]],type:'---'},up(-2.5,y0+H),{v:[[-2,y0+2*H],[-1.5,y0+H],[-1,y0+2*H]],type:'---'});
        for(let k=-2;k<=2;k++){ring.push(up(k,y0+2*H));if(k<2)ring.push({v:[[k+0.5,y0+3*H],[k+1,y0+2*H],[k+1.5,y0+3*H]],type:'---'});}}
      // 'x' (with p): three more founders start outside the cell (competitors for the food, as a parent's leaked copies)
      const NX=pore&&X.includes('x')?3:0,rivals=[[1,1],[1,c],[c,1]].slice(0,NX).map(([x,y])=>({gaps:[1,1,1],faces:'aAaA',x,y}));
      const {s,structures,founders}=createWorld({seed,size,founders:[{gaps:[1,1,1],faces:'aAaA',x:pore?c-1:c,y:c},...rivals],structures:[{tris:ring,x:c,y:c}],supply:{'-?-?-?':nb},params:{openRange:1}});
      const U=structures[0],F=founders[0];for(const G of founders)seedCopyGenome(s,G);if(!plain)spendableSides(s,U);for(let k=0;k<40;k++)s.derive();
      // the founder starts held by its high end on the anchor (placed where the anchor puts a strand; labelled, as in
      // budcycle). Until run 20261004-0022 it started free beside the anchor and had to be caught before it left through
      // the pore: with a 7-cell pore ('w') 1 of 8 seeds lost it that way, 3 of 8 after the strand-end glue narrowing
      {const {GLUE,gcode:gc}=require('./sim'),ak=U[ring.indexOf(best.t)],b=F.find(u=>{const q=s.roles(u);return q.inert>=0&&s.glue[u*3+q.inert]===gc('z');}),md=s.moveDepth;
        s.moveDepth=()=>0;const ok=s._snapBody(b,s.roles(b).inert,ak,best.i);s.moveDepth=md;if(!ok)throw Error('imprint: founder not placed');s.bind(ak,best.i,GLUE,b,s.roles(b).inert,GLUE);for(let k=0;k<40;k++)s.derive();}
      const prep=new Set([...U,...founders.flat()]),placed=[...prep];for(let u=0;u<s.n;u++){if(prep.has(u))continue;if(!placeFree(s,u,placed,()=>{for(;;){const x=(2*s.rng()-1)*(pore?c:R),y=(2*s.rng()-1)*(pore?c:R),h=S.hexr([x,y]);if(pore?h>R+0.6:h<R-1.6)return [c+x,c+y];}},50000))throw Error('place');placed.push(u);}
      const wallT=new Set(U.map(u=>canon(typeName(s,u)))),strands=()=>census(s).filter(q=>q.n>=7&&!q.paired);
      // inside the ring: a strand's centre within the inner wall's distance from the ring's centre (unwrapped along bonds)
      const centre=()=>{const set=new Set(U.slice(0,NR)),L=[U[0]],seen=new Set(L);for(let q=0;q<L.length;q++)for(let i=0;i<3;i++){const b=s.bond[L[q]*3+i];if(b<0)continue;const w=(b/3)|0;if(set.has(w)&&!seen.has(w)){seen.add(w);L.push(w);}}
          const RX=new Float64Array(L.length),RY=new Float64Array(L.length);s._unwrap(L,RX,RY);let x=0,y=0;for(let q=0;q<L.length;q++){x+=RX[q];y+=RY[q];}return [s.px[L[0]]+x/L.length,s.py[L[0]]+y/L.length];},
        inside=()=>{const [cx,cy]=centre();return strands().filter(q=>{let x=0,y=0;for(const u of q.units){x+=s._dx(s.px[u]-s.px[q.units[0]]);y+=s._dy(s.py[u]-s.py[q.units[0]]);}
          return Math.hypot(s._dx(s.px[q.units[0]]+x/q.n-cx),s._dy(s.py[q.units[0]]+y/q.n-cy))<(R-1)*H;}).length;};
      const tally=()=>{let g=0,w=0;for(const [,,t] of s.copyLog||[])if(wallT.has(canon(t)))w++;else g++;return [g,w];};
      const report=t=>{const [g,w]=tally();console.log(`t=${t} strands ${strands().length}${pore?` (inside ${inside()})`:''} docks=${s.ev.dock||0} releases=${s.ev.release||0} copies=${s.ev.copy||0} (genome ${g}, wall ${w}) blanks=${typeCount(s)[canon('-?-?-?')]||0}`);};
      const what=pore?`a cell with ${closed?'no pore (control)':'a pore'}${plain?' (plain walls, control)':' (spent walls)'}, founder aAaA, ${nb} copy blanks outside`:`a sealed cell${plain?' (plain walls, control)':' (spent walls)'}, founder aAaA, ${nb} copy blanks`;
      snap(s,'t0',`t=0: ${what}`,null,false);
      for(let t=1;t<=steps;t++){s.step();if(every(t,10))report(t);if(every(t,4))snap(s,`t${t}`,`t=${t}: ${pore?`${inside()} strands inside`:`${strands().length} free strands`}`,null,false);}
      const [g,w]=tally();console.log(`result: ${strands().length} free strands (founder included)${pore?`, ${inside()} inside`:''}, copies ${s.ev.copy||0}: genome ${g}, wall ${w}`);
      finish(pore?`Genome on copies in a cell fed through a pore${closed?' (control: no pore)':plain?' (control: plain walls)':''}`:`Genome on copies inside a sealed cell${plain?' (control: plain walls)':''}`);},
    // pool (a measurement, explore run 20261003-1221; IDEAS "Closure: what a part pool costs"): does a waiting growth
    // front get copies in proportion to blanks / parts? A prepared front A (fb@-&: weld, forward link b@, a '&' side that
    // stays unspent while it hears the open signal) welded to a support, in a world of B copy blanks and n parts
    // B@c@-& (the next cell). Harness (labelled, not a rule): every copy made is turned back into a blank and every part
    // that binds A is cut, both put back at random places, so B and n stay fixed. Reports the binds at A's forward site
    // (blanks: copies; parts: growth) and at its '&' site. extra: n (default 4); POOLB: blanks (default 20); POOLISO=1:
    // every other free side of the body is an inert anchor side (never copied), so only the forward site takes blanks
    pool(){steps=steps||200000;const n=parseInt(extra)||4,B=+(process.env.POOLB||20),size=16,iso=!!process.env.POOLISO;
      const tris=[{v:[[0,0],[1,0],[0.5,H]],type:iso?'fb@-|':'fb@-&'},{v:[[0,0],[0.5,-H],[1,0]],type:iso?'-|-|F':'-&-&F'}];
      const {s,structures}=createWorld({seed,size,structures:[{tris,x:size/2,y:size/2}],supply:{'-?-?-?':B,'B@c@-&':n}});const [A]=structures[0],all=[...Array(s.n).keys()];
      const ev={fwd:0,amp:0,other:0,part:0},ob=s.bind.bind(s);
      s.bind=(u,i,ku,v,j,kv)=>{const r=ob(u,i,ku,v,j,kv);if(s.cpy[v*3+j]){if(u===A&&i===1)ev.fwd++;else if(u===A&&i===2)ev.amp++;else ev.other++;}else if(u===A&&i===1&&s.att[v*3+j])ev.part++;return r;};
      const back=u=>{placeFree(s,u,all.filter(x=>x!==u&&x!==A),()=>[size*s.rng(),size*s.rng()]);s.regrid(u);};
      snap(s,'t0',`t=0: a waiting front A among ${B} blanks and ${n} parts`,null,false);
      for(let t=1;t<=steps;t++){s.step();
        for(let u=0;u<s.n;u++){if(u===A||u===structures[0][1])continue;const ty=s.typeName(u);
          if(ty!=='-?-?-?'&&ty!=='B@c@-&'&&!s.bonded(u)){s.setType(u,'-?-?-?');back(u);}
          else if(ty==='B@c@-&'&&s.bond[A*3+1]>=0&&((s.bond[A*3+1]/3)|0)===u){s.cut(A,1);back(u);}}
        if(every(t,10))console.log(`t=${t} copies at A's forward site ${ev.fwd}, at its & site ${ev.amp}, elsewhere ${ev.other}; parts bound ${ev.part}; forward copies per part ${(ev.fwd/Math.max(1,ev.part)).toFixed(2)} (B/n = ${(B/n).toFixed(2)}); A's & side spent ${s.spent[A*3+2]}`);}
      finish('A waiting front among blanks and parts');},
    // budpool (build run 20261003-1420; IDEAS "Closure: what a part pool costs"): the closure kind's bud grown from a
    // part pool, in isolation. A prepared parent of structures.budKit(5, 7) (labelled; no food, no strands; its anchor
    // holds a stand-in end w-&-&, so nothing in it emits and every wall side is spent) among P free parts of each of the
    // kit's 46 types and B copy blanks. A root part binds the parent's seed site y and the bud grows cell by cell from the
    // pool. Harness (labelled, not a rule; BPHOLD=0 turns it off): every copy made is counted (by the cell it copied) and
    // turned back into a blank at a random place, so the blanks stay B and the pool loses only the parts the bud uses.
    // When the bud is complete a stand-in strand end is put on its anchor (labelled, as in `closure`): completion
    // releases its root (the split). extra: P (default 8); BPB: blanks (8); BPS: world size (30); BPR: openRange (1)
    // BPES=1 (run 20261003-1650): E's pore side is plain (budKit eSource), and the copies made there are kept as parts
    // (the harness turns every other copy back into a blank): an E source inside the pair
    // BPA=k (run 20261003-1921): the kit's anchor Z@| on arc cell k (budKit anchor option; stand-in ends z); openRange
    // then defaults to k + 3, so the root hears the waiting anchor
    budpool(){steps=steps||100000;const {GLUE}=require('./sim');const AK=+(process.env.BPA||0),P=parseInt(extra)||8,B=+(process.env.BPB||8),size=+(process.env.BPS||30),r=+(process.env.BPR||(AK?AK+3:1)),hold=process.env.BPHOLD!=='0',es=process.env.BPES==='1',R=5,K=S.budKit(R,7,null,es,AK?{at:AK,glue:'Z'}:{}),N=K.N,SE=AK?'z-&-&':'w-&-&';
      const rv=K.tris[AK].v,ai=K.anchorSide,stand=v=>{const a=v[ai],b=v[(ai+1)%3],c=v[(ai+2)%3];return [b,a,[a[0]+b[0]-c[0],a[1]+b[1]-c[1]]];};
      const supply={'-?-?-?':B};for(const t of K.types)supply[t]=P;supply[K.types[N-1]]=+(process.env.BPE||5*P);
      const {s,structures}=createWorld({seed,size,structures:[{tris:[...K.tris,{v:stand(rv),type:SE}],x:size/2,y:size/2-R*H}],supply,params:{openRange:r}});
      const U=structures[0],Pu=U.slice(0,N),all=[...Array(s.n).keys()],idx=new Map(Pu.map((u,k)=>[canon(s.typeName(u)),k]));
      const bud=new Array(N).fill(-1),tb=new Array(N).fill(0),cp={bud:new Array(N).fill(0),par:new Array(N).fill(0),other:0},ev={stray:0,next:0},keep=new Set();
      const ob=s.bind.bind(s);s.bind=(u,i,ku,v,j,kv)=>{const res=ob(u,i,ku,v,j,kv);
        if(s.cpy[v*3+j]){const kb=bud.indexOf(u),kp=Pu.indexOf(u);if(kb>=0)cp.bud[kb]++;else if(kp>=0)cp.par[kp]++;else cp.other++;if(es&&(kp===N-1||kb===N-1)&&i===K.eSide){keep.add(v);ev.src=(ev.src||[]).concat(s.t);}}
        else if(s.att[v*3+j]){const k=idx.get(canon(s.typeName(v)));
          if(k===0&&u===Pu[N-1]&&bud[0]<0||k>0&&bud[k]<0&&u===bud[k-1]){bud[k]=v;tb[k]=s.t;}else if(k===0&&u===bud[N-1])ev.next++;else ev.stray++;}
        return res;};
      // inside the pair (observation): a lattice point of the parent's frame (two of its cells give the rigid map) inside
      // the parent's ring, the bud's ring or the doorway between them
      const cen=v=>[(v[0][0]+v[1][0]+v[2][0])/3,(v[0][1]+v[1][1]+v[2][1])/3],c0=cen(K.tris[0].v),c1=cen(K.tris[20].v),inside=u=>{const a=Pu[0],b=Pu[20],th=Math.atan2(s._dy(s.py[b]-s.py[a]),s._dx(s.px[b]-s.px[a]))-Math.atan2(c1[1]-c0[1],c1[0]-c0[0]);
        const dx=s._dx(s.px[u]-s.px[a]),dy=s._dy(s.py[u]-s.py[a]),p=[c0[0]+Math.cos(th)*dx+Math.sin(th)*dy,c0[1]-Math.sin(th)*dx+Math.cos(th)*dy];
        return S.hexr(p)<R-1||S.hexr(S.budPose(R,p))<R-1||Math.abs(p[0])<1.5&&p[1]>(R-1)*H&&p[1]<(R+1)*H;};
      let eIn=-1;
      const n=()=>bud.filter(u=>u>=0).length,focus=()=>({units:[...Pu,...bud.filter(u=>u>=0)],radius:11}),back=u=>{placeFree(s,u,all.filter(x=>x!==u),()=>[size*s.rng(),size*s.rng()]);s.regrid(u);};
      snap(s,'t0',`t=0: the parent among ${P} parts of each of ${N} types and ${B} blanks`,null,false);
      let ci=0,tc=0,ts=0,shot=12;const sum=a=>a.reduce((x,y)=>x+y,0);
      for(let t=1;t<=steps;t++){s.step();const L=s.copyLog||[];
        for(;ci<L.length;ci++){const u=L[ci][1];if(hold&&!s.bonded(u)&&!keep.has(u)){s.setType(u,'-?-?-?');back(u);}}
        if(eIn<0&&bud[N-2]>=0)eIn=all.filter(u=>!s.bonded(u)&&s.att[u*3]+s.att[u*3+1]+s.att[u*3+2]>0&&idx.get(canon(s.typeName(u)))===N-1&&inside(u)).length;
        if(n()>=shot&&!tc){snap(s,`g${shot}`,`t=${t}: ${n()} of ${N} cells; copies made ${sum(cp.bud)+sum(cp.par)}`,focus(),false);shot+=12;}
        if(!tc&&bud[N-1]>=0){tc=t;snap(s,'done',`t=${t}: the bud is complete (${N} cells)`,focus(),false);
          const x=all.find(u=>s.typeName(u)==='-?-?-?'&&!s.bonded(u)),q=bud[AK],e=[0,1,2].find(k=>s.anc[q*3+k]),V=[0,1,2].map(k=>{const z=(k-ai+e+3)%3;return [s.px[q]+s.ox[q*3+z],s.py[q]+s.oy[q*3+z]];});
          s.setType(x,SE);placeTri(s,x,stand(V));s.regrid(x);ob(q,e,GLUE,x,0,GLUE);}
        if(tc&&!ts&&![0,1,2].some(k=>s.partner(bud[0],k)===Pu[N-1])){ts=t;snap(s,'split',`t=${t}: the catch released the bud's root: split`,focus(),false);}
        if(every(t,10)||ts&&t===ts)console.log(`t=${t} bud cells=${n()}/${N} copies: bud ${sum(cp.bud)} parent ${sum(cp.par)} other ${cp.other}; stray=${ev.stray}`);
        if(ts&&t>=ts)break;}
      if(!tc){snap(s,'end',`t=${s.t}: ${n()} of ${N} cells`,focus(),false);snap(s,'endz',`the junction: the last site lies on the parent's root and opens only into the pair`,{units:[Pu[0],Pu[N-1]],radius:4},true);}
      const w=tb.map((x,k)=>k?x-tb[k-1]:x).filter((x,k)=>bud[k]>=0).sort((a,b)=>a-b),byType=cp.bud.map((c,k)=>c+cp.par[k]),used=n();
      console.log('copies per type (bud cell k, then the parent):',cp.bud.join(' '),'| parent:',cp.par.map((c,k)=>c?`${k}:${c}`:'').filter(Boolean).join(' '));
      console.log('waits by cell:',tb.map((x,k)=>bud[k]<0?'-':k?x-tb[k-1]:x).join(' '));
      console.log(`waits per cell: median ${w[w.length>>1]||0}, max ${w[w.length-1]||0}`);
      console.log(`result: cells=${used}/${N} complete=${tc||'not'} split=${ts||'not'} refilled=${byType.filter((c,k)=>bud[k]>=0&&c>=1).length}/${used} copies=${sum(byType)} min=${Math.min(...byType.filter((c,k)=>bud[k]>=0))} seedsite=${cp.par[N-1]} Einside=${eIn} stray=${ev.stray} next=${ev.next}${es?` Esource=${keep.size} lastFromSource=${bud[N-1]>=0&&keep.has(bud[N-1])} sealed=${tb[N-2]||'not'} sourceCopiesAt=${(ev.src||[]).join(',')}`:''}`);
      finish(`The closure kind's bud grown from a part pool (${P} parts of each type, ${supply[K.types[N-1]]} of the last, ${B} blanks)`,3);},
    // budcycle (build run 20261003-2221; the corner setup the default since run 20261004-1021): the closure kind's cycle from
    // its own kit. A prepared parent of structures.budKit(5, 7, eSource, anchor Z@| on arc cell 6, closed walls -|, seed
    // site on arc cell 45) (labelled) holds its founder aAaA by the high end on its anchor (placed where the anchor puts it;
    // labelled; only a strand held by its high end is copied). Around it P free parts of each kit type but E (the parent's
    // E source makes E parts), B copy blanks (BCI of them inside the parent) and BCF inert pre-food '---' outside (below).
    // No stand-in: the parent copies its founder from blanks that come in through its pore, a root part binds its seed
    // site y, the bud grows off the parent's top-right corner from the pool, and once it is complete and its anchor has
    // caught a copy by the high end, completion releases its root (the split); its own seed site then buds, and so on.
    // The run goes on BCAFTER steps after both the first split and the first bud's completion, or stops at generation BCGEN.
    // extra: P (default 8); BCB: blanks (20), BCI: of them inside the parent (20); BCS: world size (36); BCR: openRange
    // (9); BCE: E parts (0); BCAFTER (50000);
    // BCF=n, BCFP=p (a supply, labelled environment drive): n pre-food (400), each turning into a blank with probability p (0.0003) every 100 steps
    // BCL=q: a monomer loop (labelled drive): free genome monomers become blanks (q per 100 steps, 0.002), anywhere; BCLK=q: free kit parts too (0)
    // BCGEN=n: stop once a bud of generation n (1: the parent's bud, 2: its bud, ...) is complete, has let go and holds a caught strand
    // ('letgo:' lines: each bud's let-go with the stocks then; ownCopies in the result: generation:copies on the bud's caught
    // strand after its let-go, for each bud that has let go holding one)
    // The setup before run 1021 (check budcycle): BCSEED=-1 (the seed site on E: the bud across the parent's pore, a
    // doorway pair), BCK=0 (wall sides -&, copyable until completion spends them), BCHOLD=1 (budpool's harness, labelled:
    // every copy of a kit part but those made at an E's pore side becomes a blank at a random place outside both cells),
    // BCB=200, BCF=0, BCS=32, BCL=0. The setup of runs 0621-0751 (check budcycle-free, retired in run 1021): BCS=32 BCF=180 BCFP=0.001 BCL=0.
    // BCDBG=1: genome copies by source (copied type, role, side) at the end
    budcycle(){steps=steps||300000;const {GLUE,gcode:gc}=require('./sim');const AK=6,P=parseInt(extra)||8,B=+(process.env.BCB||20),BI=+(process.env.BCI||20),size=+(process.env.BCS||36),r=+(process.env.BCR||9),hold=process.env.BCHOLD==='1',after=+(process.env.BCAFTER||50000),SF=+(process.env.BCF??400),SFP=+(process.env.BCFP||0.0003),LP=+(process.env.BCL??0.002),LK=+(process.env.BCLK||0),GSTOP=+(process.env.BCGEN||0),R=5;
      const K=S.budKit(R,7,null,true,{at:AK,glue:'Z'},process.env.BCK==='0'?'-&':'-|',+(process.env.BCSEED||45)),N=K.N,SC=K.seedCell,supply={'-?-?-?':B};for(const t of K.types)supply[t]=P;supply[K.types[N-1]]=+(process.env.BCE||0);if(SF)supply['---']=SF;
      const {s,structures,founders}=createWorld({seed,size,founders:[{gaps:[1,1,1],faces:'aAaA',x:2,y:2}],structures:[{tris:K.tris,x:size/2,y:size/2-R*H}],supply,params:{openRange:r}});
      const Pu=structures[0],F=founders[0],all=[...Array(s.n).keys()],idx=new Map(Pu.map((u,k)=>[canon(s.typeName(u)),k])),kitT=new Set(idx.keys());seedCopyGenome(s,F);
      // the founder starts held by its high end z on the parent's anchor (placed where the anchor puts a strand; labelled)
      {const b=F.find(u=>{const q=s.roles(u);return q.inert>=0&&s.glue[u*3+q.inert]===gc('z');}),f=s.roles(b).inert,md=s.moveDepth;s.moveDepth=()=>0;const ok=s._snapBody(b,f,Pu[AK],K.anchorSide);s.moveDepth=md;
        if(!ok)throw Error('budcycle: founder not placed');s.bind(Pu[AK],K.anchorSide,GLUE,b,f,GLUE);}
      // kit frame (observation): a point mapped into the frame of a ring whose cells ka and kb are units ua and ub
      const cen=v=>[(v[0][0]+v[1][0]+v[2][0])/3,(v[0][1]+v[1][1]+v[2][1])/3],toKit=(ua,ka,ub,kb,x,y)=>{const c0=cen(K.tris[ka].v),c1=cen(K.tris[kb].v),th=Math.atan2(s._dy(s.py[ub]-s.py[ua]),s._dx(s.px[ub]-s.px[ua]))-Math.atan2(c1[1]-c0[1],c1[0]-c0[0]);
        const dx=s._dx(x-s.px[ua]),dy=s._dy(y-s.py[ua]);return [c0[0]+Math.cos(th)*dx+Math.sin(th)*dy,c0[1]-Math.sin(th)*dx+Math.cos(th)*dy];};
      const buds=[],cellOf=new Map(),tb=new Array(N).fill(0);let bud=new Array(N).fill(-1),ts=0;
      // where a point lies: in the parent (P), in the bud or, before the split, the bud's place and the doorway (D), or out
      const where=(x,y)=>{const p=toKit(Pu[0],0,Pu[20],20,x,y);if(S.hexr(p)<R-1)return 'P';
        if(!ts)return S.hexr(K.unpose(p))<R-1||Math.abs(p[0])<1.5&&p[1]>(R-1)*H&&p[1]<(R+1)*H?'D':'out';
        const kb=bud.reduce((m,u,k)=>u>=0?k:m,0);return kb>=2&&S.hexr(toKit(bud[0],0,bud[kb],kb,x,y))<R-1?'D':'out';};
      // re-place every free triangle (pool and blanks) clear of the founder; BI blanks inside the parent
      const prep=new Set([...Pu,...F]),placed=[...prep];let ni=0;
      for(let u=0;u<s.n;u++){if(prep.has(u))continue;const ins=s.typeName(u)==='-?-?-?'&&ni++<BI;
        if(!placeFree(s,u,placed,()=>{for(;;){const x=size*s.rng(),y=size*s.rng(),w=where(x,y);if(ins?w==='P'&&S.hexr(toKit(Pu[0],0,Pu[20],20,x,y))<R-1.6:w==='out')return [x,y];}},50000))throw Error('budcycle: could not place');placed.push(u);s.regrid(u);}
      for(let k=0;k<40;k++)s.derive();
      const cp={bud:0,par:0,gen:0,genH:0,other:0},ev={fed:0,loop:0,gens:{},stray:0,early:0,catchT:0,catchN:0,par2:0,bud2:0,relP:0,relB:0,relF:0},keep=new Set();
      const gb={},ob=s.bind.bind(s);s.bind=(u,i,ku,v,j,kv)=>{const vf=!s.bonded(v),res=ob(u,i,ku,v,j,kv);if(buds.length)bud=buds[0].cells;
        // genome triangles taken from the free pool, by bond kind (observation: docks 4, fills 1, glue 5) and type
        if(vf&&!s.cpy[v*3+j]&&!kitT.has(canon(s.typeName(v)))){const k=ku+':'+canon(s.typeName(v));gb[k]=(gb[k]||0)+1;}
        if(s.cpy[v*3+j]&&process.env.BCDBG&&!kitT.has(canon(s.typeName(u)))){const r=s.roles(u),e=s._edges(u),rn=['free','face','back','docked','grown'][r.role],pos=r.role===1?(e.prev<0?'lo':e.next<0?'hi':'mid'):'',sk=i===r.free?'free':i===r.inert?'spare':'other',k=`${canon(s.typeName(u))}:${rn}${pos}:${sk}`;(cp.dbg=cp.dbg||{})[k]=(cp.dbg[k]||0)+1;}
        if(s.cpy[v*3+j]&&process.env.BCDBG&&kitT.has(canon(s.typeName(u)))){const k=`${Pu.includes(u)?'P':bud.includes(u)?'B':'o'}${idx.get(canon(s.typeName(u)))}:${i}${s.op[u]>0?'o':''}`;(cp.kdbg=cp.kdbg||{})[k]=(cp.kdbg[k]||0)+1;}
        if(s.cpy[v*3+j]){if(bud.includes(u))cp.bud++;else if(Pu.includes(u))cp.par++;else if(!kitT.has(canon(s.typeName(u)))){cp.gen++;if(s.bodyOf(u).some(x=>kitT.has(canon(s.typeName(x)))))cp.genH++;}else cp.other++;if(i===K.eSide&&(u===Pu[N-1]||u===bud[N-1]))keep.add(v);}
        else if(s.att[v*3+j]&&!s.anc[u*3+i]){const k=idx.get(canon(s.typeName(v))),w=cellOf.get(u);
          // a root on a seed site (the parent's E or a bud's E) starts a bud; part k on cell k-1 of a bud grows it
          if(k===0&&(u===Pu[SC]||w&&w[1]===SC)){const b=new Array(N).fill(-1);b[0]=v;const on=u===Pu[SC]?'P':w[0];buds.push({cells:b,on,gen:on==='P'?1:buds[on].gen+1,t0:s.t,tc:0,tl:0,tk:0,rel:0,relAfter:0});cellOf.set(v,[buds.length-1,0]);if(buds.length===1)tb[0]=s.t;else if(u===Pu[SC])ev.par2++;else ev.bud2++;}
          else if(k>0&&w&&w[1]===k-1&&buds[w[0]].cells[k]<0){buds[w[0]].cells[k]=v;cellOf.set(v,[w[0],k]);if(w[0]===0)tb[k]=s.t;}else ev.stray++;}
        else if(s.anc[u*3+i]&&u===bud[AK]&&!ev.catchT){ev.catchT=s.t;ev.catchN=n();if(bud[N-1]<0)ev.early=1;snap(s,'catch',`t=${s.t}: the bud's anchor catches a strand (${n()} of ${N} cells)`,focus(),false);}
        // each bud's catch (observation): its anchor cell binds a strand end
        if(s.anc[u*3+i]&&!s.cpy[v*3+j]){const w=cellOf.get(u);if(w&&w[1]===AK&&!buds[w[0]].tk)buds[w[0]].tk=s.t;}
        return res;};
      // copy releases (a docked triangle lets go of its template): on the parent's founder, on the bud's caught strand, on free strands
      let lastT=-1;{const oc=s.cut.bind(s),ok=s.count.bind(s);s.cut=(u,i)=>{const q=s.bond[u*3+i];lastT=q>=0?(q/3)|0:-1;return oc(u,i);};
        s.count=(k,d)=>{if(k==='release'&&lastT>=0){const b=s.bodyOf(lastT);if(b.includes(Pu[0]))ev.relP++;else if(bud[0]>=0&&b.includes(bud[0]))ev.relB++;else ev.relF++;
          // which bud's anchor holds the template's strand (observation: walk the strand's non-kit triangles to the kit cell holding it)
          const L=[lastT],seen=new Set(L);let h=-1;for(let q=0;q<L.length&&h<0;q++)for(let i=0;i<3;i++){const y=s.partner(L[q],i);if(y<0||seen.has(y))continue;seen.add(y);if(kitT.has(canon(s.typeName(y)))){h=y;break;}L.push(y);}
          const w=h>=0&&cellOf.get(h);if(w&&w[1]===AK){const B=buds[w[0]];B.rel++;if(B.tl)B.relAfter++;}}return ok(k,d);};}
      const n=()=>bud.filter(u=>u>=0).length,focus=()=>({units:[...Pu,...bud.filter(u=>u>=0)],radius:11}),back=u=>{placeFree(s,u,all.filter(x=>x!==u),()=>{for(;;){const x=size*s.rng(),y=size*s.rng();if(where(x,y)==='out')return [x,y];}});s.regrid(u);};
      // Closed walls (default; BCK=0: '-&'): the kit's wall sides (each cell's side that is neither a link, the seed bond, the anchor nor E's sides) are
      // closed sides '-|' (the anchor mark without a glue: it catches nothing, and no copy blank or free triangle binds it)
      // instead of '-&' (copyable until completion spends them), so kit parts are copied only at '@' fronts and the E source
      // strands (7 triangles, not being copied): held by the parent, held by the bud, free in P, in D, out
      const strands=()=>{const o={held:0,budHeld:0,P:0,D:0,out:0};for(const q of census(s)){if(q.n<7||q.paired)continue;const b=s.bodyOf(q.units[0]);if(b.includes(Pu[0])){o.held++;continue;}if(bud[0]>=0&&b.includes(bud[0])){o.budHeld++;continue;}
          let x=0,y=0;for(const u of q.units){x+=s._dx(s.px[u]-s.px[q.units[0]]);y+=s._dy(s.py[u]-s.py[q.units[0]]);}o[where(s.px[q.units[0]]+x/q.n,s.py[q.units[0]]+y/q.n)]++;}return o;};
      const fmt=o=>`strands held ${o.held}/${o.budHeld} free in P ${o.P} in D ${o.D} out ${o.out}`,blanks=()=>all.filter(u=>!s.bonded(u)&&s.typeName(u)==='-?-?-?').length;
      // the pool (observation): free parts per kit type, cells 0..N-2 (E's are made by the E source)
      const pool=()=>{const c=new Array(N-1).fill(0);for(const u of all)if(!s.bonded(u)){const k=idx.get(canon(s.typeName(u)));if(k!==undefined&&k<N-1)c[k]++;}return c;},
        pfmt=c=>`pool ${Math.min(...c)}/${(c.reduce((a,x)=>a+x,0)/c.length).toFixed(1)}/${Math.max(...c)} (empty ${c.filter(x=>!x).length})`;
      snap(s,'t0',`t=0: the parent holding its founder among ${P} parts of each of ${N-1} types, ${B} blanks (${BI} inside)`,null,false);
      let ci=0,tc=0,shot=12,sealedIn=null;
      for(let t=1;t<=steps;t++){s.step();const L=s.copyLog||[];
        for(;ci<L.length;ci++){const u=L[ci][1];if(hold&&!s.bonded(u)&&!keep.has(u)&&kitT.has(canon(s.typeName(u)))){s.setType(u,'-?-?-?');back(u);}}
        // BCF=n (a supply drive, labelled): n inert triangles '---' (binding nothing: pre-food) start outside; every 100 steps
        // each becomes a blank with probability BCFP (0.0003), so food arrives over the run instead of as one stock
        if(SF&&t%100===0)for(const u of all)if(s.rng()<SFP&&!s.bonded(u)&&s.typeName(u)==='---'){s.setType(u,'-?-?-?');ev.fed++;}
        // BCL=q (a food loop, labelled environment drive): every 100 steps each free triangle that is neither a blank, pre-food
        // nor a kit part (a genome monomer nobody used) becomes a blank with probability q, wherever it is; BCLK=q the same for free kit parts
        if((LP||LK)&&t%100===0)for(const u of all){if(s.bonded(u))continue;const tn=s.typeName(u);if(tn==='-?-?-?'||tn==='---')continue;if(s.rng()<(kitT.has(canon(tn))?LK:LP)){s.setType(u,'-?-?-?');ev.loop++;}}
        if(!sealedIn&&bud[N-2]>=0){sealedIn={t,...strands(),blanks:all.filter(u=>!s.bonded(u)&&s.typeName(u)==='-?-?-?'&&where(s.px[u],s.py[u])!=='out').length,E:all.filter(u=>!s.bonded(u)&&idx.get(canon(s.typeName(u)))===N-1&&where(s.px[u],s.py[u])!=='out').length};}
        if(n()>=shot&&!tc){snap(s,`g${shot}`,`t=${t}: ${n()} of ${N} cells`,focus(),false);shot+=12;}
        if(!tc&&bud[N-1]>=0){tc=t;snap(s,'done',`t=${t}: the bud is complete (${N} cells)${ev.catchT?', its anchor holding a strand':''}`,focus(),false);}
        if(!ts&&bud[0]>=0&&![0,1,2].some(k=>s.partner(bud[0],k)===Pu[SC])){ts=t;ev.splitN=n();snap(s,'split',`t=${t}: the bud lets go of its parent (${n()} cells)`,focus(),false);}
        if(every(t,20))console.log(`t=${t} bud cells=${n()}/${N} catch=${ev.catchT||'no'} split=${ts||'no'} ${fmt(strands())} releases: parent ${ev.relP} bud ${ev.relB} free ${ev.relF}; copies: bud ${cp.bud} parent ${cp.par} genome ${cp.gen} (of held ${cp.genH}); docks ${s.ev.dock||0} fills ${s.ev.fill||0}; blanks ${blanks()}; ${pfmt(pool())}; stray=${ev.stray}`);
        // each bud's completion and let-go (observation), with the stocks at that moment; generation g reached: the first bud of generation g or later complete, let go and holding a caught strand
        if(t%100===0)for(let i=0;i<buds.length;i++){const B=buds[i];if(!B.tc&&B.cells[N-1]>=0)B.tc=t;
          if(!B.tl&&B.cells[0]>=0&&s.bond[B.cells[0]*3+K.rootSide]<0){B.tl=t;const c=pool(),used=buds.reduce((a,b)=>a+b.cells.filter(x=>x>=0).length,0);
            console.log(`letgo: bud ${i} gen ${B.gen} on ${B.on} t=${t} cells=${B.cells.filter(x=>x>=0).length}/${N} complete=${B.tc||'not'} catch=${B.tk||'not'} | blanks ${blanks()} prefood ${all.filter(u=>!s.bonded(u)&&s.typeName(u)==='---').length} fed ${ev.fed} looped ${ev.loop} | ${pfmt(c)} kitCopies ${cp.bud+cp.par+cp.other} partsUsed ${used} | ${fmt(strands())}`);}
          if(B.tc&&B.tl&&B.tk)for(let g=1;g<=B.gen;g++)if(!ev.gens[g]){ev.gens[g]=t;console.log(`generation ${g}: bud ${i} (generation ${B.gen}) complete and let go at t=${t}`);}}
        if(GSTOP&&ev.gens[GSTOP])break;
        if(ts&&tc&&t>=Math.max(ts,tc)+after)break;}
      const o=strands();console.log(`t=${s.t} bud cells=${n()}/${N} catch=${ev.catchT||'no'} split=${ts||'no'} ${fmt(o)}`);
      if(sealedIn)console.log(`at sealing (t=${sealedIn.t}): ${fmt(sealedIn)}; blanks inside ${sealedIn.blanks}, E parts inside ${sealedIn.E}`);
      // later buds (observation): where each started (P: the parent's seed site; 0: the first bud's), its cells, whether its root still holds
      console.log('later buds:',buds.slice(1).map(b=>`${b.on}:${b.cells.filter(x=>x>=0).length}${s.bonded(b.cells[0])&&s.partner(b.cells[0],K.rootSide)>=0?'':' free'}`).join(', ')||'none');
      {const g={};for(const u of all)if(!s.bonded(u)&&!kitT.has(canon(s.typeName(u)))){const k=canon(s.typeName(u));g[k]=(g[k]||0)+1;}console.log('free triangles not kit parts:',JSON.stringify(g));}
      {const g={};for(const [,u,ty] of s.copyLog||[])if(!kitT.has(canon(ty))){const k=canon(ty);g[k]=(g[k]||0)+1;}if(cp.dbg)console.log('genome copies by source:',JSON.stringify(cp.dbg));if(cp.kdbg)console.log('kit copies by template (P parent, B first bud, o other; cell:side, o hears open):',JSON.stringify(Object.entries(cp.kdbg).sort((a,b)=>b[1]-a[1])));console.log('genome copies by type:',JSON.stringify(g),'genome triangles bound (kind:type):',JSON.stringify(gb));}
      console.log('pool per type at the end (cells 0..'+(N-2)+'):',pool().join(' '));
      console.log('waits by cell:',tb.map((x,k)=>bud[k]<0?'-':k?x-tb[k-1]:x).join(' '));
      {const {comp,members}=s.bodies();if(bud[0]>=0)snap(s,'end',`t=${s.t}: the bud${ts?' after the split':''}`,{units:members[comp[bud[0]]],radius:8},false);snap(s,'endw',`t=${s.t}: the world`,null,false);}
      console.log(`result: cells=${n()}/${N} complete=${tc||'not'} catch=${ev.catchT||'not'} early=${ev.early} catchCells=${ev.catchN} split=${ts||'not'} splitCells=${ev.splitN||0} budCopies=${Math.floor(ev.relB/4)} parentCopies=${Math.floor(ev.relP/4)} leaked=${o.out} newRoots=${ev.par2}/${ev.bud2} nextCells=${Math.max(0,...buds.slice(1).filter(b=>b.on==='P').map(b=>b.cells.filter(x=>x>=0).length))}/${Math.max(0,...buds.slice(1).filter(b=>b.on===0).map(b=>b.cells.filter(x=>x>=0).length))} gen2=${ev.gens[2]||'not'} gen3=${ev.gens[3]||'not'} ownCopies=${buds.filter(b=>b.tl&&b.tk).map(b=>`${b.gen}:${Math.floor(b.relAfter/4)}`).join(',')||'none'} stray=${ev.stray} kitCopies=${cp.bud+cp.par+cp.other} genomeCopies=${cp.gen} ofHeld=${cp.genH}${SF?` fed=${ev.fed}`:''}${LP||LK?` looped=${ev.loop}`:''}`);
      finish(`One generation of the kind from its own kit: the parent copies its founder, grows its bud from the pool, the bud catches a copy and splits`,3);},
    // closure (designed, not demonstrated; docs/IDEAS.md "Closure by design"): the organism kind of structures.budKit
    // drawn, no physics. A complete parent (R 5, prepared, labelled) whose root's anchor holds a stand-in strand end; its
    // bud's cells are bonded one by one in growth order (as copies arriving), each followed by signal passes; then a
    // stand-in strand end is caught by the bud's anchor, completion releases the bud's root, and the bud is moved off to
    // show the split. The bud is then in the parent's starting state (test "closure (budKit)")
    closure(){const R=5,K=S.budKit(R),N=K.N,{GLUE}=require('./sim'),s=new TriSim({W:28,H:28,sigma:0,sigmaRot:0,openRange:3},2*N+2),O=[14,14-R*H];
      const Bv=K.tris.map(t=>t.v.map(p=>S.budPose(R,p))),at=(v,dy=0)=>v.map(p=>[O[0]+p[0],O[1]+p[1]+dy]),Pu=[...Array(N).keys()],Bu=Pu.map(k=>N+k),Ps=2*N,Bs=2*N+1;
      const sh=(a,b)=>{const eq=(p,q)=>Math.hypot(p[0]-q[0],p[1]-q[1])<1e-6;for(let i=0;i<3;i++)for(let j=0;j<3;j++)if(eq(a[i],b[(j+1)%3])&&eq(a[(i+1)%3],b[j]))return [i,j];return null;};
      const refl=(u,i)=>{const P=k=>[s.px[u]+s.ox[u*3+k],s.py[u]+s.oy[u*3+k]],a=P(i),b=P((i+1)%3),c=P((i+2)%3);return [b,a,[a[0]+b[0]-c[0],a[1]+b[1]-c[1]]];};
      const pass=k=>{for(let q=0;q<k;q++){s.derive();s._release();}},hear=()=>Bu.filter(u=>s.op[u]>0).length;
      buildStructure(s,Pu,K.tris,O[0],O[1]);placeTri(s,Ps,refl(Pu[0],K.anchorSide));s.setType(Ps,'w--');s.bind(Pu[0],K.anchorSide,GLUE,Ps,0,GLUE);
      for(const u of [...Bu,Bs]){placeTri(s,u,[[1,1],[2,1],[1.5,1+H]]);s.px[u]=-40;}pass(10);
      const put=k=>{placeTri(s,Bu[k],at(Bv[k]));s.setType(Bu[k],K.types[k]);if(k===0)s.bind(Bu[0],K.rootSide,GLUE,Pu[N-1],K.seedSide,GLUE);else{const [i,j]=sh(Bv[k],Bv[k-1]);s.bind(Bu[k],i,GLUE,Bu[k-1],j,GLUE);}pass(4);};
      console.log('kit',K.types.join(' '));snap(s,'t0','the parent (complete; its anchor holds a strand end) with its seed site free',null,true);
      for(let k=0;k<N;k++){put(k);if(k===0||k===24)snap(s,`g${k}`,`the bud grows from copies: ${k+1} of ${N} cells; ${hear()} hear the open signal`,null,true);}
      snap(s,'w',`the bud complete: its doorway faces the parent's pore; only its waiting anchor emits (${hear()} cells hear it)`,null,true);
      placeTri(s,Bs,refl(Bu[0],K.anchorSide));s.setType(Bs,'w--');s.bind(Bu[0],K.anchorSide,GLUE,Bs,0,GLUE);pass(10);
      const split=s.bond[Bu[0]*3+K.rootSide]<0;console.log('after the catch: the bud '+(split?'let go of':'still holds')+' its parent');
      Bv.forEach((v,k)=>placeTri(s,Bu[k],at(v,1.2)));placeTri(s,Bs,refl(Bu[0],K.anchorSide));
      snap(s,'split',`the catch: completion releases the bud's root; the bud (moved off) is in the parent's starting state`,null,true);
      finish('Closure by design: a bud of its parent\'s kind (structures.budKit; signals only, no physics)',2);},
    // ring membrane grown from a periodic kit (2R-1 motif types) on an anchor + root (labelled start); closes on the root
    // (extra: R, default 3; copies of each motif type 12)
    ring(){steps=steps||30000;const R=parseInt(extra)||3,K=S.ringKit(R,'z'),r=K.tris[0],i=K.rootSide,per=12;
      const a=r.v[i],b=r.v[(i+1)%3],c=r.v[(i+2)%3],anchor={v:[b,a,[a[0]+b[0]-c[0],a[1]+b[1]-c[1]]],type:'z--'};
      const supply={};for(const t of K.kit)supply[t]=per;
      const {s,structures}=createWorld({seed,size:18,structures:[{tris:[anchor,r],x:9,y:9}],supply});const A=structures[0][0],root=structures[0][1];
      console.log('motif',K.kit.join(' '),'root',r.type,'cells',K.N);let closed=0;
      const size=()=>{const {comp}=s.bodies();let k=0;for(let u=0;u<s.n;u++)if(comp[u]===comp[A])k++;return k-1;};
      snap(s,'t0','t=0: anchor and root',null,false);
      for(let t=1;t<=steps;t++){s.step();if(!closed&&s.ev.closeGlue)closed=t;if(every(t,15))console.log(`t=${t} ring cells=${size()}/${K.N} closed=${closed?'at '+closed:'no'}`);
        if(every(t,3))snap(s,`t${t}`,`t=${t}: ${size()} cells${closed?', closed':''}`,null,false);}
      {const {comp}=s.bodies();snap(s,'zoom','ring (zoom)',{units:[...Array(s.n).keys()].filter(u=>comp[u]===comp[A]),radius:R+1.5});}
      finish(`Ring membrane grown from a periodic kit (R=${R}, ${K.kit.length} motif types)`);},
  };
  if(!D[name])throw Error('unknown demo '+name+'; one of '+Object.keys(D).join(' '));
  D[name]();
}
if(require.main===module){const [name,seed='1',steps,dir='runs',extra]=process.argv.slice(2);demo(name,+seed,steps?+steps:0,dir,extra);}
module.exports={demo};
