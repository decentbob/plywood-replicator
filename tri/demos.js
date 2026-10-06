'use strict';
// Demos of every capability (one or two small worlds each; pictures + saved states in the output directory).
//   node tri/demos.js NAME [seed] [steps] [outdir] [extra]
// NAME: copy | ring | imprint | pool | budpool | budcycle | lysis | closure | pair (budpore, the doorway pairs, retired 2026-10-04: git `882b7d4`; the casting lineage's demos were removed on 2026-10-03; git `7415fd4`)
const path=require('path');
const {createWorld,placeFree,census,typeCount,buildStructure,placeTri}=require('./world');
const {render,montage}=require('./render');
const S=require('./structures');
const {TriSim,canon,typeName,TOK}=require('./sim');
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
    // (9); BCE: E parts (0); BCES=0: no E source (E's pore side a closed wall: E parts only from the pool, BCE); BCES=2: the E source on E's outer side (its pore side a wall); BCAFTER (50000);
    // BCF=n, BCFP=p (a supply, labelled environment drive): n pre-food (400), each turning into a blank with probability p (0.0003) every 100 steps
    // BCL=q: a monomer loop (labelled drive): free genome monomers become blanks (q per 100 steps, 0.002), anywhere
    // A world that runs on (explore run 20261005-0721): BCLK=q: free kit parts decay into blanks too (q per 100 steps, 0: never;
    // the same draw as the loop's); BCH=h: a hazard (labelled drive, below: each body lysed at rate h per 100 steps), from
    // step BCHT on; BCP=k: a 'pop:' line every k steps (population, stocks, generations). BCW=1: open walls ('-', copyable:
    // every cell a source of its type; fails on the 7-cell pore, run 0721); BCO=n: the opening (pore) in cells (7; odd, 27 a
    // half ring: budKit), BCSC: the seed cell (45)
    // BCGATE=1 (an oracle, not a rule: it reads whether the bud's root is bonded, 40 bonds away): a bud's seed site binds
    // nothing (spent) until the bud has let go, so a bud waiting for its catch cannot start its own bud (NEXT, candidate (n))
    // BCGEN=n: stop once a bud of generation n (1: the parent's bud, 2: its bud, ...) is complete, has let go and holds a caught strand
    // ('letgo:' lines: each bud's let-go with the stocks then; ownCopies in the result: generation:copies on the bud's caught
    // strand after its let-go, for each bud that has let go holding one)
    // The setup before run 1021 (the doorway kind with budpool's harness, check budcycle, retired in run 20261005-0251; its
    // options BCSEED, BCK, BCHOLD and run 1021's BCLK are in git at a2f3914). The setup of runs 0621-0751 (check budcycle-free,
    // retired in run 1021): BCS=32 BCF=180 BCFP=0.001 BCL=0.
    // BCDBG=1: genome copies by source (copied type, role, side) at the end
    // Lysis in the lineage (build run 20261004-2221): BCC=n cutters (labelled, placed outside; 0), BCT their type
    // ('z@!-|-|': binds a waiting anchor Z@|; with BCQ=1 'г@!-|-|'); BCA: the anchor cell (6; 44 or 40 put the held strand
    // in or beside the pore, where its first copy jams); BCQ=1: a lysis receptor 'Г@&' on E's outer side (budKit receptor;
    // with BCR=50 it binds a cutter only while E hears its waiting anchor, 40 bonds away, so only complete buds waiting
    // for a catch are lysed). Observation: 'letgo:' lines mark lysed buds; the result adds cutBinds, lysedBuds, cuts,
    // falseRel (roots released incomplete without lysis: the open relay's lag, NEXT candidate (o)), lysedAt, poolMin
    budcycle(){steps=steps||300000;const {GLUE,gcode:gc}=require('./sim');const AK=+(process.env.BCA||6),CU=+(process.env.BCC||0),RQ=process.env.BCQ==='1',cut=process.env.BCT||(RQ?'г@!-|-|':'z@!-|-|'),P=parseInt(extra)||8,B=+(process.env.BCB||20),BI=+(process.env.BCI||20),size=+(process.env.BCS||36),r=+(process.env.BCR||9),after=+(process.env.BCAFTER||50000),SF=+(process.env.BCF??400),SFP=+(process.env.BCFP||0.0003),LP=+(process.env.BCL??0.002),GSTOP=+(process.env.BCGEN||0),GATE=process.env.BCGATE==='1',OW=process.env.BCW==='1',LK=+(process.env.BCLK||0),HZ=+(process.env.BCH||0),HT=+(process.env.BCHT||0),PO=+(process.env.BCO||7),SV=+(process.env.BCSV||0),R=5;
      const K=S.budKit(R,PO,null,process.env.BCES==='0'?false:process.env.BCES==='2'?'out':true,{at:AK,glue:'Z'},OW?'-':'-|',+(process.env.BCSC||45),RQ?'Г@&':null),N=K.N,SC=K.seedCell,supply={'-?-?-?':B};
      for(const t of K.types)supply[t]=P;supply[K.types[N-1]]=+(process.env.BCE||0);if(SF)supply['---']=SF;if(CU)supply[cut]=CU;
      // BCSV=n scavengers (labelled prepared bodies, never copied; NEXT step 1a, test 'scavenger'): two welded triangles, Z@|!&
      // (catches a free strand's high end and lyses the strand; & stops the lysis there; @ keeps free monomers off) and Ж@| (an
      // open side no part matches, so the & side is never spent), placed on a circle around the parent
      const SVT=[{v:[[0,0],[1,0],[0.5,H]],type:'Z@|!&-Ж@|'},{v:[[1,0],[1.5,H],[0.5,H]],type:'-|-|-'}];
      const svs=[...Array(SV).keys()].map(k=>({tris:SVT,x:size/2+13*Math.cos(2*Math.PI*k/SV),y:size/2+13*Math.sin(2*Math.PI*k/SV)}));
      const {s,structures,founders}=createWorld({seed,size,founders:[{gaps:[1,1,1],faces:'aAaA',x:2,y:2}],structures:[{tris:K.tris,x:size/2,y:size/2-R*H},...svs],supply,params:{openRange:r}});
      const Pu=structures[0],F=founders[0],all=[...Array(s.n).keys()],idx=new Map(Pu.map((u,k)=>[canon(s.typeName(u)),k])),kitT=new Set(idx.keys()),cutC=canon(cut),isCut=u=>CU>0&&canon(s.typeName(u))===cutC;seedCopyGenome(s,F);
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
      const svU=new Set(structures.slice(1).flat()),prep=new Set([...Pu,...F,...svU]),placed=[...prep];let ni=0;
      for(let u=0;u<s.n;u++){if(prep.has(u))continue;const ins=s.typeName(u)==='-?-?-?'&&ni++<BI;
        if(!placeFree(s,u,placed,()=>{for(;;){const x=size*s.rng(),y=size*s.rng(),w=where(x,y);if(ins?w==='P'&&S.hexr(toKit(Pu[0],0,Pu[20],20,x,y))<R-1.6:w==='out')return [x,y];}},50000))throw Error('budcycle: could not place');placed.push(u);s.regrid(u);}
      for(let k=0;k<40;k++)s.derive();
      const sk={E:0,seed:0,front:0,kitX:0,gP:0,gB:0,gF:0},skf=()=>'sinks '+Object.entries(sk).map(([k,x])=>k+':'+x).join(' '),cp={bud:0,par:0,gen:0,genH:0,other:0},ev={fed:0,loop:0,loopK:0,hits:0,gens:{},stray:0,early:0,catchT:0,catchN:0,par2:0,bud2:0,relP:0,relB:0,relF:0,cutBind:0,lysed:0,falseRel:0};
      const gb={},ob=s.bind.bind(s);s.bind=(u,i,ku,v,j,kv)=>{const vf=!s.bonded(v),res=ob(u,i,ku,v,j,kv);if(buds.length)bud=buds[0].cells;
        // genome triangles taken from the free pool, by bond kind (observation: docks 4, fills 1, glue 5) and type
        if(vf&&!s.cpy[v*3+j]&&!kitT.has(canon(s.typeName(v)))&&!isCut(v)){const k=ku+':'+canon(s.typeName(v));gb[k]=(gb[k]||0)+1;}
        if(s.cpy[v*3+j]&&process.env.BCDBG&&!kitT.has(canon(s.typeName(u)))){const r=s.roles(u),e=s._edges(u),rn=['free','face','back','docked','grown'][r.role],pos=r.role===1?(e.prev<0?'lo':e.next<0?'hi':'mid'):'',sk=i===r.free?'free':i===r.inert?'spare':'other',k=`${canon(s.typeName(u))}:${rn}${pos}:${sk}`;(cp.dbg=cp.dbg||{})[k]=(cp.dbg[k]||0)+1;}
        if(s.cpy[v*3+j]&&process.env.BCDBG&&kitT.has(canon(s.typeName(u)))){const k=`${Pu.includes(u)?'P':bud.includes(u)?'B':'o'}${idx.get(canon(s.typeName(u)))}:${i}${s.op[u]>0?'o':''}`;(cp.kdbg=cp.kdbg||{})[k]=(cp.kdbg[k]||0)+1;}
        // where the blanks go (observation): each copy bind by its template: E (an E source side), seed (a seed site), front (other
        // kit sides), kitX (a kit part in no bud), gP / gB / gF (a genome triangle in the parent's body, a bud's, neither: free strands)
        if(s.cpy[v*3+j]){let k;if(kitT.has(canon(s.typeName(u)))){const kk=Pu.includes(u)?Pu.indexOf(u):(cellOf.get(u)||[0,-1])[1];k=kk<0?'kitX':kk===N-1&&i===K.eSide?'E':kk===SC&&i===K.seedSide?'seed':'front';}
          else{const b=s.bodyOf(u);k=b.includes(Pu[0])?'gP':b.some(x=>cellOf.has(x))?'gB':'gF';}sk[k]++;}
        if(s.cpy[v*3+j]){if(bud.includes(u))cp.bud++;else if(Pu.includes(u))cp.par++;else if(!kitT.has(canon(s.typeName(u)))){cp.gen++;if(s.bodyOf(u).some(x=>kitT.has(canon(s.typeName(x)))))cp.genH++;}else cp.other++;}
        else if(s.att[v*3+j]&&!s.anc[u*3+i]&&!isCut(v)){const k=idx.get(canon(s.typeName(v))),w=cellOf.get(u);
          // a root on a seed site (the parent's E or a bud's E) starts a bud; part k on cell k-1 of a bud grows it
          if(k===0&&(u===Pu[SC]&&!cellOf.has(u)||w&&w[1]===SC)){const b=new Array(N).fill(-1);b[0]=v;const on=u===Pu[SC]?'P':w[0];buds.push({cells:b,on,gen:on==='P'?1:buds[on].gen+1,t0:s.t,tc:0,tl:0,tk:0,rel:0,relAfter:0});cellOf.set(v,[buds.length-1,0]);if(buds.length===1)tb[0]=s.t;else if(u===Pu[SC])ev.par2++;else ev.bud2++;}
          else if(k>0&&w&&w[1]===k-1&&buds[w[0]].cells[k]<0){buds[w[0]].cells[k]=v;cellOf.set(v,[w[0],k]);if(GATE&&k===SC&&!buds[w[0]].tl)s.spent[v*3+K.seedSide]=1;if(w[0]===0)tb[k]=s.t;}else ev.stray++;}
        else if(s.anc[u*3+i]&&u===bud[AK]&&!ev.catchT&&!isCut(v)){ev.catchT=s.t;ev.catchN=n();if(bud[N-1]<0)ev.early=1;snap(s,'catch',`t=${s.t}: the bud's anchor catches a strand (${n()} of ${N} cells)`,focus(),false);}
        // each bud's catch (observation): its anchor cell binds a strand end
        if(s.anc[u*3+i]&&!s.cpy[v*3+j]&&!isCut(v)){const w=cellOf.get(u);if(w&&w[1]===AK&&!buds[w[0]].tk)buds[w[0]].tk=s.t;}
        if(isCut(v)){ev.cutBind++;const w=cellOf.get(u);if(w){const B=buds[w[0]];if(!B.cb)B.cb=s.t;}}
        return res;};
      // copy releases (a docked triangle lets go of its template): on the parent's founder, on the bud's caught strand, on free strands
      let lastT=-1,lastU=-1;{const oc=s.cut.bind(s),ok=s.count.bind(s);s.cut=(u,i)=>{const q=s.bond[u*3+i];lastT=q>=0?(q/3)|0:-1;lastU=u;return oc(u,i);};
        s.count=(k,d)=>{if(k==='lyse'){const w=cellOf.get(lastU);if(w&&buds[w[0]].cells[w[1]]===lastU){const B=buds[w[0]];if(!B.ly){B.ly=s.t;B.lyN=B.cells.filter(x=>x>=0).length;ev.lysed++;}}}if(k==='release'&&lastT>=0){const b=s.bodyOf(lastT);if(b.includes(Pu[0]))ev.relP++;else if(bud[0]>=0&&b.includes(bud[0]))ev.relB++;else ev.relF++;
          // which bud's anchor holds the template's strand (observation: walk the strand's non-kit triangles to the kit cell holding it)
          const L=[lastT],seen=new Set(L);let h=-1;for(let q=0;q<L.length&&h<0;q++)for(let i=0;i<3;i++){const y=s.partner(L[q],i);if(y<0||seen.has(y))continue;seen.add(y);if(kitT.has(canon(s.typeName(y)))){h=y;break;}L.push(y);}
          const w=h>=0&&cellOf.get(h);if(w&&w[1]===AK){const B=buds[w[0]];B.rel++;if(B.tl)B.relAfter++;}}return ok(k,d);};}
      const n=()=>bud.filter(u=>u>=0).length,focus=()=>({units:[...Pu,...bud.filter(u=>u>=0)],radius:11});
      // Closed walls: the kit's wall sides (each cell's side that is neither a link, the seed bond, the anchor nor E's sides) are
      // closed sides '-|' (the anchor mark without a glue: it catches nothing, and no copy blank or free triangle binds it)
      // instead of '-&' (copyable until completion spends them), so kit parts are copied only at '@' fronts and the E source.
      // Strands (observation; 7 triangles, not being copied): held by the parent, held by the bud, free in P, in D, out
      const strands=()=>{const o={held:0,budHeld:0,P:0,D:0,out:0};for(const q of census(s)){if(q.n<7||q.paired)continue;const b=s.bodyOf(q.units[0]);if(b.includes(Pu[0])){o.held++;continue;}if(bud[0]>=0&&b.includes(bud[0])){o.budHeld++;continue;}
          let x=0,y=0;for(const u of q.units){x+=s._dx(s.px[u]-s.px[q.units[0]]);y+=s._dy(s.py[u]-s.py[q.units[0]]);}o[where(s.px[q.units[0]]+x/q.n,s.py[q.units[0]]+y/q.n)]++;}return o;};
      const fmt=o=>`strands held ${o.held}/${o.budHeld} free in P ${o.P} in D ${o.D} out ${o.out}`,blanks=()=>all.filter(u=>!s.bonded(u)&&s.typeName(u)==='-?-?-?').length;
      // the pool (observation): free parts per kit type, cells 0..N-2 (E's are made by the E source)
      const pool=()=>{const c=new Array(N-1).fill(0);for(const u of all)if(!s.bonded(u)){const k=idx.get(canon(s.typeName(u)));if(k!==undefined&&k<N-1)c[k]++;}return c;},
        pfmt=c=>`pool ${Math.min(...c)}/${(c.reduce((a,x)=>a+x,0)/c.length).toFixed(1)}/${Math.max(...c)} (empty ${c.filter(x=>!x).length})`;
      // BCP=k (observation for long worlds): every k steps a 'pop:' line: complete bodies (attached E cells), of them holding a
      // strand (an attached anchor cell whose anchor side is bonded), attached kit cells, free blanks, pre-food, monomers and
      // parts, the pool, buds started, buds complete, let go and holding a catch, as a generation counts them (in all, since the last line, highest generation), hazard hits
      const IP=+(process.env.BCP||0);let ipLast=0;
      const indef=t=>{let E=0,held=0,cells=0,bl=0,pf=0,mono=0,parts=0;for(const u of all){const tn=s.typeName(u),k=idx.get(canon(tn));
          if(s.bonded(u)){if(k!==undefined){cells++;if(k===N-1)E++;if(k===AK&&[0,1,2].some(i=>s.anc[u*3+i]&&s.bond[u*3+i]>=0))held++;}continue;}
          if(tn==='-?-?-?')bl++;else if(tn==='---')pf++;else if(k!==undefined)parts++;else if(!isCut(u))mono++;}
        const lg=buds.filter(b=>b.tl&&b.tk&&b.tc&&!b.ly),w=lg.filter(b=>Math.max(b.tl,b.tc,b.tk)>ipLast).length,g=Math.max(0,...lg.map(b=>b.gen));ipLast=t;
        console.log(`pop: t=${t} bodies ${E} holding ${held} cells ${cells} | blanks ${bl} prefood ${pf} monomers ${mono} parts ${parts} ${pfmt(pool())} | buds ${buds.length} letgo ${lg.length} (+${w}) maxGen ${g} | hits ${ev.hits} lysed ${ev.lysed} decayedParts ${ev.loopK}`);};
      snap(s,'t0',`t=0: the parent holding its founder among ${P} parts of each of ${N-1} types, ${B} blanks (${BI} inside)`,null,false);
      let tc=0,shot=12,sealedIn=null;
      for(let t=1;t<=steps;t++){s.step();
        // BCF=n (a supply drive, labelled): n inert triangles '---' (binding nothing: pre-food) start outside; every 100 steps
        // each becomes a blank with probability BCFP (0.0003), so food arrives over the run instead of as one stock
        if(SF&&t%100===0)for(const u of all)if(s.rng()<SFP&&!s.bonded(u)&&s.typeName(u)==='---'){s.setType(u,'-?-?-?');ev.fed++;}
        // BCL=q (a food loop, labelled environment drive): every 100 steps each free triangle that is neither a blank, pre-food
        // nor a kit part (a genome monomer nobody used) becomes a blank with probability q, wherever it is (kit parts draw a
        // number too, as when run 1021's BCLK could turn them back: outputs stay those of earlier runs)
        if((LP||LK)&&t%100===0)for(const u of all){if(s.bonded(u))continue;const tn=s.typeName(u);if(tn==='-?-?-?'||tn==='---'||isCut(u))continue;const kit=kitT.has(canon(tn));if(s.rng()<(kit?LK:LP)){s.setType(u,'-?-?-?');ev.loop++;if(kit)ev.loopK++;}}
        // BCH=h (a hazard, labelled environment drive): every 100 steps each body (two or more bonded triangles, as physics
        // moves it) is hit with probability h, whatever its size: one of its triangles, drawn at random, is lysed, and the lysis
        // rule takes the body apart from there (not across an '&' joint: a bud and its parent die apart), its parts free and
        // fresh, a strand's triangles monomers; mean life 100/h steps. BCHT=t0: from step t0 on (0). Scavengers (BCSV) are spared
        if(HZ&&t>HT&&t%100===0){const {members}=s.bodies();for(const m of members)if(m.length>1&&!(SV&&m.some(u=>svU.has(u)))&&s.rng()<HZ){const u=m[Math.floor(s.rng()*m.length)];if(!s.ly[u]){s.ly[u]=1;ev.hits++;}}}
        if(IP&&t%IP===0)indef(t);
        if(!sealedIn&&bud[N-2]>=0){sealedIn={t,...strands(),blanks:all.filter(u=>!s.bonded(u)&&s.typeName(u)==='-?-?-?'&&where(s.px[u],s.py[u])!=='out').length,E:all.filter(u=>!s.bonded(u)&&idx.get(canon(s.typeName(u)))===N-1&&where(s.px[u],s.py[u])!=='out').length};}
        if(n()>=shot&&!tc){snap(s,`g${shot}`,`t=${t}: ${n()} of ${N} cells`,focus(),false);shot+=12;}
        if(!tc&&bud[N-1]>=0){tc=t;snap(s,'done',`t=${t}: the bud is complete (${N} cells)${ev.catchT?', its anchor holding a strand':''}`,focus(),false);}
        if(!ts&&bud[0]>=0&&![0,1,2].some(k=>s.partner(bud[0],k)===Pu[SC])){ts=t;ev.splitN=n();snap(s,'split',`t=${t}: the bud ${buds[0].ly?'is taken apart (lysis)':'lets go of its parent'} (${n()} cells)`,focus(),false);}
        if(every(t,20))console.log(`t=${t} bud cells=${n()}/${N} catch=${ev.catchT||'no'} split=${ts||'no'} ${fmt(strands())} releases: parent ${ev.relP} bud ${ev.relB} free ${ev.relF}; copies: bud ${cp.bud} parent ${cp.par} genome ${cp.gen} (of held ${cp.genH}); docks ${s.ev.dock||0} fills ${s.ev.fill||0}; blanks ${blanks()}; ${pfmt(pool())}; stray=${ev.stray}${CU?`; buds ${buds.length} lysed ${ev.lysed} cuts ${s.ev.lyse||0}`:''}`);
        // each bud's completion and let-go (observation), with the stocks at that moment; generation g reached: the first bud of generation g or later complete, let go and holding a caught strand
        if(t%100===0)for(let i=0;i<buds.length;i++){const B=buds[i];if(!B.tc&&B.cells[N-1]>=0)B.tc=t;
          if(!B.tl&&B.cells[0]>=0&&s.bond[B.cells[0]*3+K.rootSide]<0){B.tl=t;if(!B.ly&&B.cells[N-1]<0)ev.falseRel++;if(GATE&&B.cells[SC]>=0)s.spent[B.cells[SC]*3+K.seedSide]=0;const c=pool(),used=buds.reduce((a,b)=>a+b.cells.filter(x=>x>=0).length,0);
            console.log(`letgo: bud ${i} gen ${B.gen} on ${B.on} t=${t} cells=${B.cells.filter(x=>x>=0).length}/${N} complete=${B.tc||'not'} catch=${B.tk||'not'}${B.ly?` lysed=${B.ly} at ${B.lyN} cells`:''} | blanks ${blanks()} prefood ${all.filter(u=>!s.bonded(u)&&s.typeName(u)==='---').length} fed ${ev.fed} looped ${ev.loop} | ${pfmt(c)} kitCopies ${cp.bud+cp.par+cp.other} partsUsed ${used} | ${fmt(strands())} | ${skf()}`);}
          if(B.tc&&B.tl&&B.tk&&!B.ly)for(let g=1;g<=B.gen;g++)if(!ev.gens[g]){ev.gens[g]=t;ev.gb=i;console.log(`generation ${g}: bud ${i} (generation ${B.gen}) complete and let go at t=${t}`);}}
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
      console.log(`result: cells=${n()}/${N} complete=${tc||'not'} catch=${ev.catchT||'not'} early=${ev.early} catchCells=${ev.catchN} split=${ts||'not'} splitCells=${ev.splitN||0} budCopies=${Math.floor(ev.relB/4)} parentCopies=${Math.floor(ev.relP/4)} leaked=${o.out} newRoots=${ev.par2}/${ev.bud2} nextCells=${Math.max(0,...buds.slice(1).filter(b=>b.on==='P').map(b=>b.cells.filter(x=>x>=0).length))}/${Math.max(0,...buds.slice(1).filter(b=>b.on===0).map(b=>b.cells.filter(x=>x>=0).length))} gen2=${ev.gens[2]||'not'} gen3=${ev.gens[3]||'not'} ownCopies=${buds.filter(b=>b.tl&&b.tk).map(b=>`${b.gen}:${Math.floor(b.relAfter/4)}`).join(',')||'none'} stray=${ev.stray} kitCopies=${cp.bud+cp.par+cp.other} genomeCopies=${cp.gen} ofHeld=${cp.genH}${SF?` fed=${ev.fed}`:''}${LP?` looped=${ev.loop}`:''}${CU?` cutBinds=${ev.cutBind} lysedBuds=${ev.lysed} cuts=${s.ev.lyse||0} falseRel=${ev.falseRel} lysedAt=${buds.filter(b=>b.ly).map(b=>b.lyN).join(',')||'none'} poolMin=${Math.min(...pool())}`:''}`);console.log(skf());
      // the chain (observation): from the bud that reached the last generation back to the parent, each bud's own copies after let-go ('held': never let go)
      {const a=[];for(let c=ev.gb;c!==undefined&&c!=='P';c=buds[c].on){const B=buds[c];a.push(`${c}:g${B.gen}:${B.tl?Math.floor(B.relAfter/4):'held'}`);}console.log('chain:',a.join(' <- ')||'none');}
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
    // lysis (explore run 20261004-2051; RULES Core changes, the lysis side '!'): a closed world with no food, a prepared parent
    // of budcycle's kind (budKit(5, 7, eSource, anchor Z@| on cell 6, closed walls, seed site on cell 45), labelled) holding
    // its founder by the high end, and on its seed site a prepared complete bud that waits for a catch that never comes
    // (no blanks: nothing is copied, no strand leaks); LYC cutters 'z@!-|-|' (labelled: a part whose attach side carries
    // the lysis mark; it binds only a waiting anchor Z@|) and LYP free parts of each kit type (0). Observation: each bud on
    // the parent's seed site (its root and the cells joined to it), its size, completion and lysis; how many of its cells
    // are parts of the first (stuck) bud. extra: unused. LYS: world size (30); LYA: the anchor cell (44: the anchor opens
    // only when a bud is nearly complete; budcycle's kind has 6, where cutters kill every bud as its cell 6 attaches); LYR:
    // openRange (50: more than the anchor cell, so the root holds while the anchor waits; 9 with LYA=6); the oracle LYFIX
    // (candidate (o)) was removed in run 20261005-1921 (RULES, Core changes: its -1 never fades)
    lysis(){steps=steps||400000;const {GLUE,gcode:gc}=require('./sim');const AK=+(process.env.LYA||44),R=5,C=+(process.env.LYC??4),P=+(process.env.LYP||0),size=+(process.env.LYS||30),cut=process.env.LYT||'z@!-|-|';
      const K=S.budKit(R,7,null,true,{at:AK,glue:'Z'},'-|',45),N=K.N,SC=K.seedCell,O=[size/2,size/2-R*H],supply={};if(C)supply[cut]=C;if(P)for(const t of K.types)supply[t]=P;
      const {s,structures,founders}=createWorld({seed,size,founders:[{gaps:[1,1,1],faces:'aAaA',x:2,y:2}],structures:[{tris:K.tris,x:O[0],y:O[1]},{tris:K.tris.map(t=>({...t,v:t.v.map(K.pose)})),x:O[0],y:O[1]}],supply,params:{openRange:+(process.env.LYR||50)}});
      const Pu=structures[0],B0=structures[1],F=founders[0],all=[...Array(s.n).keys()],kitT=new Set(K.types.map(canon)),first=new Set(B0);seedCopyGenome(s,F);
      s.bind(B0[0],K.rootSide,GLUE,Pu[SC],K.seedSide,GLUE);
      {const b=F.find(u=>{const q=s.roles(u);return q.inert>=0&&s.glue[u*3+q.inert]===gc('z');}),f=s.roles(b).inert,md=s.moveDepth;s.moveDepth=()=>0;const ok=s._snapBody(b,f,Pu[AK],K.anchorSide);s.moveDepth=md;
        if(!ok)throw Error('lysis: founder not placed');s.bind(Pu[AK],K.anchorSide,GLUE,b,f,GLUE);}
      // free triangles placed outside both rings (centres of the parent and of the posed bud)
      const cB=K.pose([0,0]),cen=[[O[0],O[1]],[O[0]+cB[0],O[1]+cB[1]]],prep=new Set([...Pu,...B0,...F]),placed=[...prep];
      for(const u of all){if(prep.has(u))continue;if(!placeFree(s,u,placed,()=>{for(;;){const x=size*s.rng(),y=size*s.rng();if(cen.every(c=>Math.hypot(s._dx(x-c[0]),s._dy(y-c[1]))>R+1))return [x,y];}},50000))throw Error('lysis: could not place');placed.push(u);s.regrid(u);}
      for(let k=0;k<40;k++)s.derive();
      // the bud on the parent's seed site (observation: its root and the kit cells joined to it, the parent's cells excluded)
      const parent=new Set([...Pu,...F]),budNow=()=>{const r=s.partner(Pu[SC],K.seedSide);if(r<0)return null;const seen=new Set([r]),L=[r];
        for(let q=0;q<L.length;q++)for(let i=0;i<3;i++){const y=s.partner(L[q],i);if(y<0||seen.has(y)||parent.has(y)||!kitT.has(canon(s.typeName(y))))continue;seen.add(y);L.push(y);}return L;};
      const buds=[{root:B0[0],t0:0,max:N,tc:1,reused:N,n:N}],focus=()=>({units:[...Pu,...(budNow()||[])],radius:12});let cur=buds[0],lysedFirst=0,lyse0=0;const pic={};const freedAt=new Array(N).fill(0);
      snap(s,'t0',`t=0: the parent and its stuck bud (complete, waiting for a catch), ${C} cutters, ${P} parts per type, no blanks`,null,false);
      const free=()=>all.filter(u=>!s.bonded(u)&&kitT.has(canon(s.typeName(u)))).length;
      for(let t=1;t<=steps;t++){s.step();
        // the stuck bud is apart once each of its cells has been free (the waves run from its anchor cell to both ends; a
        // new bud may start on the parent's seed site from the first parts freed before the far end is apart)
        if(!lysedFirst&&s.ev.lyse){B0.forEach((u,k)=>{if(!freedAt[k]&&!s.bonded(u))freedAt[k]=t;});if(freedAt.every(x=>x)){lysedFirst=t;snap(s,'lysed',`t=${t}: the stuck bud has come apart into its ${N} parts`,null,false);console.log(`lysed: every cell of the stuck bud free by t=${t} (from t=${Math.min(...freedAt)}; ${s.ev.lyse} cuts); free kit parts ${free()}`);}}
        // a bud ends when its root leaves the seed site or it loses cells (lysis); a new one starts from a root alone (or
        // with one cell: the root may bind again at once)
        if(t%10)continue;const L=budNow(),root=L?L[0]:-1;
        if(cur&&(cur.root!==root||L.length<cur.n-1)){cur.end=t;cur.lysed=(s.ev.lyse||0)>lyse0;console.log(`bud ${buds.length-1} ends at t=${t}: max ${cur.max} cells, complete ${cur.tc||'not'}, ${cur.lysed?'lysed':'let go'}`);cur=null;}
        if(L&&!cur&&L.length<=2){cur={root,t0:t,max:0,tc:0,reused:0,n:L.length};buds.push(cur);lyse0=s.ev.lyse||0;}
        if(cur){const n=L.length;cur.n=n;if(n>cur.max){cur.max=n;cur.reused=L.filter(u=>first.has(u)).length;}if(n>=N&&!cur.tc){cur.tc=t;if(!pic.regrown){pic.regrown=t;snap(s,'regrown',`t=${t}: a new bud complete, ${cur.reused} of its ${N} cells parts of the stuck bud`,focus(),false);}console.log(`bud ${buds.length-1} complete at t=${t}: ${cur.reused} of ${N} cells from the stuck bud`);}
          if(cur!==buds[0]&&n===36&&!pic.half){pic.half=t;snap(s,'half',`t=${t}: a new bud on the parent's seed site, 36 of ${N} cells, ${L.filter(u=>first.has(u)).length} of them parts of the stuck bud`,focus(),false);}}
        if(every(t,20))console.log(`t=${t} bud ${L?L.length:0}/${N} buds ${buds.length} complete ${buds.filter(b=>b.tc).length} lysed ${buds.filter(b=>b.lysed).length} cuts ${s.ev.lyse||0} free parts ${free()}`);}
      if(process.env.LYDBG){const {canon:cn}=require('./sim');console.log('first bud cells still bonded:',B0.map((u,k)=>s.bonded(u)?k+':'+[0,1,2].map(i=>{const y=s.partner(u,i);return y<0?'-':B0.includes(y)?'b'+B0.indexOf(y):Pu.includes(y)?'p'+Pu.indexOf(y):s.typeName(y);}).join(','):'').filter(Boolean).join(' '));}
      // kit bodies off the parent (observation): bodies of two or more kit parts not joined to the parent, by size
      const frag=[];{const seen=new Set(parent);const bp=budNow();if(bp)bp.forEach(u=>seen.add(u));for(const u of all){if(seen.has(u)||!s.bonded(u)||!kitT.has(canon(s.typeName(u))))continue;const b=s.bodyOf(u);b.forEach(x=>seen.add(x));frag.push(b.filter(x=>kitT.has(canon(s.typeName(x)))).length);}}
      const later=buds.slice(1);snap(s,'end',`t=${s.t}: ${later.length} buds after the stuck one, ${later.filter(b=>b.tc).length} complete`,null,false);
      console.log(`t=${s.t} result: lysedFirst=${lysedFirst||'not'} buds=${later.length} complete=${later.filter(b=>b.tc).length} lysed=${buds.filter(b=>b.lysed).length} max=${Math.max(0,...later.map(b=>b.max))} firstComplete=${(later.find(b=>b.tc)||{}).tc||'not'} reused=${Math.max(0,...later.map(b=>b.reused))} cuts=${s.ev.lyse||0} offParent=${frag.sort((a,b)=>b-a).join(',')||'none'}`);
      finish('Lysis: a stuck bud taken apart into its parts, which grow the next bud (no food; the lysis side \'!\')',3);},
    // the pair (build run 20261005-2320; IDEAS "Sources in proportion to use"): one founder pair (pairKit, a labelled
    // start) among copy blanks only: no free parts. A blank that touches an adult's exposed side becomes a part (R at R's
    // '-', S at S's seed site y while no bud sits on it); a free R binds a pair's y, a free S binds its open front b@, and
    // the new pair lets go ('&'). Observation only: bodies (R bonded to S), each body's generation (its parent: the body
    // whose y its R was bound to), the free part pools. PAB blanks (300), PAS world (30), PAR openRange (1), PAT=1 the
    // turned side order (S 'B@y-|'); extra: bodies to report the time of (20).
    // Direction 1 (build run 20261006-0251), two labelled environment drives, both off by default: PAD=d, every 100 steps
    // each free part (R or S, not a blank) becomes a copy blank with probability d; PAH=h, every 100 steps each body (two or
    // more bonded triangles, as physics moves it) is hit with probability h from step PAHT on (0): one of its triangles,
    // drawn at random, is lysed and the lysis rule takes it apart into its parts (not across an '&' joint), as budcycle's
    // BCH. A body dies when its R loses its S. PAP=k: a 'pop:' line every k steps (living bodies, births, deaths,
    // generations, pools)
    // Direction 2 (explore run 20261006-0450), observation and labelled starts and drives, all off by default: PAV=half|right|mix,
    // a neutral marker put in at step PAVT (100000): every R in the left (half) or right half of the world (right), or each R with
    // probability PAVP (0.5; mix), attached or free, gets glue x on its plain side '-' (R 'Y@&b@|x': nothing carries X, so
    // nothing binds it; copies carry it); PAVK=seed or front puts in a variant instead: S's seed site y or R's front b@
    // without its anchor mark (copied while free: while no bud sits on it, while a bud waits for its S); 'var:' lines every PAP steps give the marked share of living bodies and how
    // clustered they are (same-marker share among each body's 6 nearest bodies, against random mixing). PAM=m, a labelled
    // mutagen drive: every 100 steps (at step 50 of each 100) each free part (a free triangle without a copy side) has, with probability m, one
    // side drawn at random changed: its glue (half the time: inert or one of a..z, A..Z) or one of its marks toggled
    // ('.@&|?!'); 'mut:' lines every PAP steps count bodies by their types. With either, PAD decays every free part,
    // variant or not, into a blank (without them only R and S are ever free parts). PAHU=1: the hazard per triangle
    // instead of per body: every triangle of a body is lysed with probability h/2 (a pair is hit about as often as
    // before); per body, a hit lyses one part between '&' joints, so a body of k such parts loses each about k times
    // less often (a body's size lowers its parts' risk)
    // Material flow (build run 20261006-0621), a labelled drive, off by default: PAHB=1, a triangle the hazard hits becomes a
    // copy blank once it is free (dead material returns as raw material, not as parts); PAHB=2, every triangle lysed (the
    // hit one and the part the lysis takes apart, up to its '&' joints) does
    pair(){steps=steps||200000;const {gcode:gc}=require('./sim');const K=S.pairKit(process.env.PAT==='1'),_kr=process.env.PAKR,_ks=process.env.PAKS;if(_kr)K.tris[0]={...K.tris[0],type:K.R=_kr};if(_ks)K.tris[1]={...K.tris[1],type:K.S=_ks};const NB=+(process.env.PAB||300),size=+(process.env.PAS||30),goal=parseInt(extra)||20;
      const HB=+(process.env.PAHB||0),DK=+(process.env.PAD||0),HZ=+(process.env.PAH||0),HT=+(process.env.PAHT||0),PP=+(process.env.PAP||0),VM=process.env.PAV||'',VT=+(process.env.PAVT||100000),MU=+(process.env.PAM||0),HU=process.env.PAHU==='1',VK=process.env.PAVK||'x',VP=+(process.env.PAVP||0.5);
      const {s,structures}=createWorld({seed,size,structures:[{tris:K.tris,x:size/2,y:size/2}],supply:{'-?-?-?':NB},params:{openRange:+(process.env.PAR||1)}});
      // alive: a living body's R -> {id (birth order), g (generation), t (birth)}; kids by body id
      const cR=canon(K.R),cS=canon(K.S),cB=canon('-?-?-?'),cV=canon(K.R.replace(/-(?![.@&|?!])/,'x')),RL=new Set([cR,cV]),all=[...Array(s.n).keys()],Y=gc('Y'),B=gc('B'),gb=gc('b'),alive=new Map([[structures[0][0],{id:0,g:0,t:0}]]),kids=new Map(),dbl=[],dead=new Uint8Array(s.n),ev={births:1,deaths:0,hits:0,decayed:0,returned:0,life:0,lastBirth:0,reused:0,mutated:0},rec=new Int8Array(s.n),pg=new Int32Array(s.n).fill(-1),cp={},cx=new Float32Array(s.n).fill(NaN),cy=new Float32Array(s.n),dist={n:0,sum:0,near:0};let reached=0,maxGen=0;
      const side=(u,g)=>[0,1,2].find(i=>s.glue[u*3+i]===g),front=u=>{const i=side(u,gb);return i===undefined?-1:s.partner(u,i);};
      // a new body: an R bonded to an S by its front (seen within a pass of S binding; its Y lets go one pass later); a
      // death: a living body's R no longer bonded to an S by its front (lysed)
      const scan=t=>{if(HZ)for(const [u,b] of alive)if(front(u)<0){alive.delete(u);ev.deaths++;ev.life+=t-b.t;}
        for(const u of all){if(!s.bonded(u)||alive.has(u)||(s.glue[u*3]!==gb&&s.glue[u*3+1]!==gb&&s.glue[u*3+2]!==gb)||!RL.has(canon(s.typeName(u))))continue;const f=s.partner(u,side(u,gb)),y=s.partner(u,side(u,Y)),pr=y>=0?s.partner(y,side(y,B)):-1,P=pr>=0?alive.get(pr):undefined;
          // a waiting bud remembers its parent's generation (the parent may die in the pass its bud completes)
          if(f<0){if(P)pg[u]=P.g+1;continue;}const g=P?P.g+1:pg[u];pg[u]=-1;alive.set(u,{id:ev.births,g,t});ev.births++;ev.reused+=rec[u]+rec[f];rec[u]=rec[f]=0;for(const v of [u,f])if(!Number.isNaN(cx[v])){const d=Math.hypot(s._dx(s.px[v]-cx[v]),s._dy(s.py[v]-cy[v]));dist.n++;dist.sum+=d;if(d<5)dist.near++;cx[v]=NaN;}ev.lastBirth=t;if(P)kids.set(P.id,(kids.get(P.id)||0)+1);if(g>maxGen)maxGen=g;if(!(ev.births&(ev.births-1)))dbl.push(t);}};
      const pools=()=>{let r=0,q=0,b=0,w=0;for(const u of all){const c=canon(s.typeName(u));if(c===cB)b++;else if(s.bonded(u)){if(RL.has(c)&&front(u)<0)w++;}else if(RL.has(c))r++;else if(c===cS)q++;}return {r,q,b,w};};
      const line=t=>{const P=pools();console.log(`t=${t} bodies=${ev.births} gen=${maxGen} waiting=${P.w} freeR=${P.r} freeS=${P.q} blanks=${P.b} copies=${s.ev.copy||0}`);};
      let pb=1,pd=0,pc=0,pcR=0,pcS=0,pu=0;const avg={n:0,r:0,q:0,b:0,w:0},acc=()=>{const P=pools();avg.n++;for(const k of ['r','q','b','w'])avg[k]+=P[k];};
      const pop=t=>{const P={},m=Math.max(1,avg.n);for(const k of ['r','q','b','w']){P[k]=(avg[k]/m).toFixed(0);avg[k]=0;}avg.n=0;const gs=[...alive.values()].map(b=>b.g),mg=gs.length?gs.reduce((a,b)=>a+b,0)/gs.length:0;
        console.log(`pop: t=${t} alive ${alive.size} births ${ev.births} (+${ev.births-pb}) deaths ${ev.deaths} (+${ev.deaths-pd}) gen max ${maxGen} mean ${mg.toFixed(1)} min ${gs.length?gs.reduce((a,b)=>Math.min(a,b)):'-'} | mean pools: freeR ${P.r} freeS ${P.q} waiting ${P.w} blanks ${P.b} | hits ${ev.hits} decayed ${ev.decayed}${HB?` returned ${ev.returned}`:''} copies ${s.ev.copy||0} (+${(s.ev.copy||0)-pc}: R ${(cp[cR]||0)-pcR} S ${(cp[cS]||0)-pcS}) fresh ${(1-(ev.reused-pu)/Math.max(1,2*(ev.births-pb))).toFixed(2)} | copied-to-born distance ${dist.n?(dist.sum/dist.n).toFixed(1):'-'}, within 5: ${dist.n?(dist.near/dist.n).toFixed(2):'-'}`);dist.n=dist.sum=dist.near=0;pb=ev.births;pd=ev.deaths;pc=s.ev.copy||0;pcR=cp[cR]||0;pcS=cp[cS]||0;pu=ev.reused;};
      // the mutagen: side i drawn at random; its glue replaced (inert or a..z, A..Z) or one mark toggled
      const AL='-abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',MK='.@&|?!',mutate=u=>{const t=[...s.typeName(u).matchAll(TOK)].map(m=>[m[1],m[2]]),i=Math.floor(s.rng()*3);
        if(s.rng()<0.5)t[i][0]=AL[Math.floor(s.rng()*AL.length)];else{const c=MK[Math.floor(s.rng()*MK.length)];t[i][1]=t[i][1].includes(c)?t[i][1].replace(c,''):t[i][1]+c;}
        s.setType(u,t.map(([g,m])=>g+[...MK].filter(c=>m.includes(c)).join('')).join(''));};
      // marker census: share of living bodies whose R carries x; clustering: same-marker share among each body's 6 nearest
      // living bodies (torus distance between their R's), against f^2 + (1 - f)^2 for random mixing
      const vEnd={lost:0,fixed:0},marker=t=>{const L=[...alive.keys()],m=L.map(u=>canon(s.typeName(u))===cV?1:0),N=L.length,f=N?m.reduce((a,b)=>a+b,0)/N:0;let same=0,cnt=0;
        for(let a=0;a<N;a++){const d=[];for(let b=0;b<N;b++)if(b!==a)d.push([Math.hypot(s._dx(s.px[L[b]]-s.px[L[a]]),s._dy(s.py[L[b]]-s.py[L[a]])),m[b]]);d.sort((x,y)=>x[0]-y[0]);for(const [,q] of d.slice(0,6)){same+=q===m[a]?1:0;cnt++;}}
        if(!vEnd.lost&&N&&f===0)vEnd.lost=t;if(!vEnd.fixed&&N&&f===1)vEnd.fixed=t;
        const o=opened();console.log(`var: t=${t} alive ${N} marked ${m.reduce((a,b)=>a+b,0)} share ${f.toFixed(3)} sameNeighbours ${cnt?(same/cnt).toFixed(3):'-'} random ${(f*f+(1-f)*(1-f)).toFixed(3)} copies x ${cp[cV]||0} openSeed ${o.S} openFront ${o.R}`);};
      // mutation census: bodies (two or more bonded triangles) by their types; variant types ever seen in a body
      const seenV=new Map(),census=t=>{const {members}=s.bodies(),by=new Map();let mb=0,fm=0;
        for(const m of members){if(m.length<2)continue;const ty=m.map(u=>canon(s.typeName(u))),k=ty.slice().sort().join(' + ');by.set(k,(by.get(k)||0)+1);
          if(ty.some(c=>c!==cR&&c!==cS)){mb++;for(const c of new Set(ty))if(c!==cR&&c!==cS){const v=seenV.get(c)||{first:t,last:t,max:0,n:0};v.last=t;v.n++;seenV.set(c,v);}}}
        for(const [c,v] of seenV)if(v.last===t){let k=0;for(const m of members)if(m.length>1&&m.some(u=>canon(s.typeName(u))===c))k++;v.max=Math.max(v.max,k);}
        for(const u of all)if(!s.bonded(u)){const c=canon(s.typeName(u));if(c!==cR&&c!==cS&&c!==cB)fm++;}
        const top=[...by].sort((a,b)=>b[1]-a[1]).slice(0,6).map(([k,n])=>n+'x '+k).join(' | '),o=opened();
        console.log(`mut: t=${t} bodies ${[...by.values()].reduce((a,b)=>a+b,0)} withVariant ${mb} kinds ${by.size} freeVariants ${fm} mutated ${ev.mutated} openSeed ${o.S} openFront ${o.R} | ${top}`);};
      // the two variants that expose a part more: among attached S-like triangles (a side B@ and a side y), the share whose
      // y side has no anchor mark (the seed site copied while free); among attached R-like ones (Y@ and b@), the share whose
      // b@ side has none (the front copied while a bud waits)
      const yy=gc('y'),opened=()=>{let sn=0,so=0,rn=0,ro=0;const has=(u,g,a)=>[0,1,2].find(i=>s.glue[u*3+i]===g&&(!a||s.att[u*3+i]));
        for(const u of all){if(!s.bonded(u))continue;const iB=has(u,B,1),iy=has(u,yy),iY=has(u,Y,1),ib=has(u,gb,1);
          if(iB!==undefined&&iy!==undefined){sn++;if(!s.anc[u*3+iy])so++;}if(iY!==undefined&&ib!==undefined){rn++;if(!s.anc[u*3+ib])ro++;}}
        return {S:sn?(so/sn).toFixed(2):'-',R:rn?(ro/rn).toFixed(2):'-'};};
      snap(s,'t0',`t=0: one founder pair (R ${K.R}, S ${K.S}) among ${NB} copy blanks, no free parts`,null,false);
      const pic={};let first=0;
      for(let t=1;t<=steps;t++){s.step();if(s.copyLog){for(const [,u,ty] of s.copyLog){const c=canon(ty);cp[c]=(cp[c]||0)+1;cx[u]=s.px[u];cy[u]=s.py[u];}s.copyLog.length=0;}
        // PAHB (labelled drive): a dead triangle, once free, returns as a copy blank
        if(HZ)for(let u=0;u<s.n;u++){if(s.ly[u]){rec[u]=1;if(HB===2)dead[u]=1;}else if(dead[u]&&!s.bonded(u)){dead[u]=0;s.setType(u,'-?-?-?');rec[u]=0;pg[u]=-1;cx[u]=NaN;ev.returned++;}}
        // PAD=d (labelled drive): free parts return to blanks
        if(DK&&t%100===0)for(const u of all){if(s.bonded(u)||s.ly[u]||s.cpy[u*3]||s.cpy[u*3+1]||s.cpy[u*3+2])continue;if(s.rng()<DK){s.setType(u,'-?-?-?');rec[u]=0;pg[u]=-1;cx[u]=NaN;ev.decayed++;}}
        // PAH=h (labelled drive): a body hazard, mean life 100/h steps
        if(HZ&&t>HT&&t%100===0){const {members}=s.bodies();if(HU){for(const m of members)if(m.length>1)for(const u of m)if(s.rng()<HZ/2&&!s.ly[u]){s.ly[u]=1;if(HB)dead[u]=1;ev.hits++;}}else for(const m of members)if(m.length>1&&s.rng()<HZ){const u=m[Math.floor(s.rng()*m.length)];if(!s.ly[u]){s.ly[u]=1;if(HB)dead[u]=1;ev.hits++;}}}
        // PAV (labelled start): the neutral marker, glue x on R's plain side (its spent '&' side stays spent)
        if(VM&&t===VT)for(const u of all){if(canon(s.typeName(u))!==(VK==='seed'?cS:cR)||(VM==='half'?s._wx(s.px[u])>=size/2:VM==='right'?s._wx(s.px[u])<size/2:s.rng()>=VP))continue;
          for(let i=0;i<3;i++){const k=u*3+i;if(VK==='seed'){if(s.glue[k]===yy)s.anc[k]=0;}else if(VK==='front'){if(s.glue[k]===gb)s.anc[k]=0;}else if(!s.glue[k]&&!s.cOnly[k]&&!s.att[k]&&!s.done[k]&&!s.anc[k]&&!s.cpy[k]&&!s.lys[k])s.glue[k]=gc('x');}}
        // PAM=m (labelled drive, a mutagen): one side of a free part changed now and then (at mid-interval: PAD 1 would
        // turn a part mutated at the decay's step back into a blank at once)
        if(MU&&t%100===50)for(const u of all){if(s.bonded(u)||s.ly[u]||s.cpy[u*3]||s.cpy[u*3+1]||s.cpy[u*3+2]||s.rng()>=MU)continue;mutate(u);ev.mutated++;}
        scan(t);
        if(VM&&PP&&t%PP===0&&t>=VT)marker(t);
        if(MU&&PP&&t%PP===0)census(t);
        if(!first&&ev.births>1){first=t;const fu=[...alive.keys()];snap(s,'bud1',`t=${t}: the founder's first bud`,{units:fu,radius:3},true);}
        if(!reached&&ev.births>=goal){reached=t;snap(s,'goal',`t=${t}: ${ev.births} bodies, generation ${maxGen}`,null,false);}
        for(const k of [5,10]){if(!pic[k]&&ev.births>=k){pic[k]=t;snap(s,'b'+k,`t=${t}: ${ev.births} bodies`,null,false);}}
        if(PP){if(t%10===5)acc();if(t%PP===0)pop(t);}
        if(every(t,20))line(t);}
      const P=pools(),gens={};for(const b of alive.values())gens[b.g]=(gens[b.g]||0)+1;
      snap(s,'end',`t=${s.t}: ${alive.size} bodies${ev.deaths?` alive (${ev.births} born, ${ev.deaths} died)`:''}, generation ${maxGen}${DK?'':`, free R ${P.r}, free S ${P.q}`}, blanks ${P.b}`,null,false);
      // copies by type (R, S); children per body (a parent buds again once its last bud has moved off its seed site)
      const kv=[...Array(ev.births).keys()].map(i=>kids.get(i)||0);
      const drv=HZ||DK?` alive=${alive.size} deaths=${ev.deaths} hits=${ev.hits} decayed=${ev.decayed}${HB?` returned=${ev.returned}`:''} meanLife=${ev.deaths?(ev.life/ev.deaths).toFixed(0):'-'} fresh=${(1-ev.reused/Math.max(1,2*(ev.births-1))).toFixed(2)} lastBirth=${ev.lastBirth} aliveGens=${Object.keys(gens).sort((a,b)=>a-b).join(',')}`:'';
      console.log(`t=${s.t} result: bodies=${ev.births} reached${goal}=${reached||'not'} gen=${maxGen} perGen=${Object.keys(gens).sort((a,b)=>a-b).map(g=>g+':'+gens[g]).join(',')} freeR=${P.r} freeS=${P.q} waiting=${P.w} blanks=${P.b} copies=${s.ev.copy||0} copiesR=${cp[cR]||0} copiesS=${cp[cS]||0} firstBud=${first||'not'} doublings=${dbl.join(',')} founderKids=${kids.get(0)||0} maxKids=${kv.reduce((a,b)=>Math.max(a,b),0)} kidsMean=${(kv.reduce((a,b)=>a+b,0)/kv.length).toFixed(2)}${drv}`);
      if(VM){const o=opened();console.log(`t=${s.t} marker: lost=${vEnd.lost||'not'} fixed=${vEnd.fixed||'not'} copiesX=${cp[cV]||0} openSeed=${o.S} openFront=${o.R}`);}
      if(MU){const o=opened();console.log(`t=${s.t} result: openSeed=${o.S} openFront=${o.R} mutated=${ev.mutated} copies=${s.ev.copy||0}`);}
      if(MU)console.log(`t=${s.t} variants (in a body at some census; max bodies, first, last seen): ${[...seenV].sort((a,b)=>b[1].max-a[1].max).slice(0,15).map(([c,v])=>`${c} ${v.max} ${v.first}-${v.last}`).join(' | ')||'none'}`);
      finish(`The pair: one founder among copy blanks (S ${K.S})${HZ||DK?`, hazard ${HZ}, decay ${DK}`:''}`,3);},
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
