'use strict';
// Demos of every capability (one or two small worlds each; pictures + saved states in the output directory).
//   node tri/demos.js NAME [seed] [steps] [outdir] [extra]
// NAME: copy | ring | imprint | pool | budpool | closure | budpore (the casting lineage's demos were removed on 2026-10-03; git `7415fd4`)
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
    // typed chain copying: faces read glue; the copy carries complementary faces
    copy(){steps=steps||10000;const {s}=createWorld({seed,size:18,founders:[{gaps:[1,0,2,1,1],faces:'abaabb'}],supply:{'A--':14,'B--':14,'a--':14,'b--':14,'---':50}});
      snap(s,'t0','t=0: founder abaabb',null,false);
      for(let t=1;t<=steps;t++){s.step();if(every(t,10))console.log(`t=${t} strands [${census(s).filter(c=>c.n>1).map(c=>c.faces+'/'+c.gaps+(c.paired?'*':'')).join(' ')}] docks=${s.ev.dock||0} releases=${s.ev.release||0}`);
        if(every(t,3))snap(s,`t${t}`,`t=${t}`,null,false);}
      finish('Typed chain copying: abaabb -> BBAABA (reverse complement) -> abaabb');},
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
    // its fills, so the strand is copied from copies of itself (extra: blanks, default 200; 'c': control, plain blanks)
    imprintGenome(){steps=steps||30000;const ctl=String(extra||'').includes('c'),nb=parseInt(extra)||200,size=24;
      const {s}=createWorld({seed,size,founders:[{gaps:[1,1,1,1,1],faces:'aAaAaA',x:size/2,y:size/2}],supply:{[ctl?'---':'-?-?-?']:nb}});
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
    // an anchor W| in the middle of the bottom inner wall holds a strand by its low end (seed w: the founder, or a copy if the founder left), and the
    // copy blanks start outside only (labelled). Every free side of the ring, outside, inside and the pore's edges, is a
    // spent '&' side, so blanks come in through the pore and copy only the genome. extra: blanks (default 150); 'n':
    // plain walls (control: the walls take the blanks); 'c': no pore (control: no blank gets in)
    // 'z' (with p): the anchor is Z@| and holds a strand by its high end (seed z; '@': a free face copy, which carries z,
    // cannot cap it; openRange 1: its signal reaches no wall side); 'o': option heldCopy (only a strand held
    // by its high end is copied: free strands, leaked or rival, are sterile; RULES, Core changes, run 20261003-1720);
    // 'w': a 7-cell pore (the closure kind's width: strands pass it)
    imprintCell(){const X=String(extra||''),pore=X.includes('p'),plain=X.includes('n'),closed=pore&&X.includes('c'),nb=parseInt(extra)||(pore?150:40),R=6,size=2*R+8,c=size/2;steps=steps||(pore?100000:40000);
      let ring=S.ringKit(R,'z').tris.map(t=>({v:t.v,type:'---'}));const mid=(v,i)=>[(v[i][0]+v[(i+1)%3][0])/2,(v[i][1]+v[(i+1)%3][1])/2];
      if(pore){const ang=t=>{const m=[0,1,2].map(i=>t.v[i]).reduce((a,p)=>[a[0]+p[0]/3,a[1]+p[1]/3],[0,0]);return Math.abs(Math.atan2(m[1],m[0])-Math.PI/2);};
        ring.sort((a,b)=>ang(a)-ang(b));if(!closed)ring=ring.slice(X.includes('w')?7:3);
        // the anchor: the inner side nearest x = -1 on the flat wall opposite the pore (at a corner the anchored strand
        // would lie along the next wall, its backs hidden, and no fill could be copied). A caught strand leans 60 degrees
        // onto the wall, backs underneath; on the side at x = 0 its two outer back sites are 1.53 and 1.73 from wall
        // cells and a founder caught before any back was copied stalled for 50000-90000 steps (no fills); at x = -1 they
        // are 1.53 and 2.31 (run 20261003-1520)
        // with 'z' (a high end caught: the strand leans the other way) the mirror place x = +1; IMPX: another x (dry runs)
        const ax=process.env.IMPX!==undefined?+process.env.IMPX:X.includes('z')?1:-1;let best=null;for(const t of ring)for(let i=0;i<3;i++){const m=mid(t.v,i),d=Math.abs(m[0]-ax);if(m[1]<0&&S.hexr(m)<R-0.5&&(!best||d<best.d))best={t,i,d};}
        best.t.type=[0,1,2].map(i=>i===best.i?(X.includes('z')?'Z@|':'W|'):'-').join('');}
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
      const {s,structures,founders}=createWorld({seed,size,founders:[{gaps:[1,1,1],faces:'aAaA',x:pore?c-1:c,y:c},...rivals],structures:[{tris:ring,x:c,y:c}],supply:{'-?-?-?':nb},params:{heldCopy:X.includes('o'),...(X.includes('z')?{openRange:1}:{})}});
      const U=structures[0],F=founders[0];for(const G of founders)seedCopyGenome(s,G);if(!plain)spendableSides(s,U);for(let k=0;k<40;k++)s.derive();
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
    // budpore (a bud pair on copies; see INNOVATIONS): parent P (R 7) and bud D (R 5), prepared rings (labelled) touching
    // along D's bottom wall. The contact cells of both walls right of x = -0.75 are missing: one opening joins P, D and
    // the outside (each ring has one gap: a second would cut its wall in two). The leftmost P-D bond is the doorway bond
    // (a completion-release bond: '&' on both sides, no glue); the other contacts are unbonded. D's anchor A is W@|
    // (anchor, attach) on the inner side farthest from D's corners within 5 ring bonds of L (the middle of D's lower-left
    // wall), so a strand caught there stands into the bud with its backs open. A catches a strand's low end w (as P's
    // anchor W| holds the founder aAaA; seedCopyGenome): the high end, where copying starts (zip), stays free in the bud.
    // While A is unbonded its '@' emits the open signal, which reaches both sides of the doorway bond (openRange = A's
    // distance to L + 3); once A holds a strand the signal fades and the doorway bond is cut by completion release: D
    // lets go of P, and both freed sides are spent (never copied). The walls start spent (labelled: prepared as
    // complete, before the range is set), so only A's side is exposed. Copy blanks start outside ('i': also 60 inside
    // P). extra: blanks outside (default 300). Until run 20261003-0050 a latch let go on A's trigger signal, relayed by
    // a hear chain (code at e2634fb); its freed latch sides were copied 3-105 times per world.
    // Option 'c' (sealed): the doorway ends at x = 2.25, so it joins P and D only; 80 blanks start inside P and
    // the founder hangs from the doorway's left edge; outside blanks get in only after the split (each half a pore).
    // BUDNI=n: n blanks start inside P instead. BUDRP=r: P's radius (odd; default 7).
    budpore(){steps=steps||200000;const X=String(extra||''),nb=parseInt(extra)||300,NI=process.env.BUDNI?+process.env.BUDNI:X.includes('i')?60:X.includes('c')?80:0,DW=0.75,RP=+(process.env.BUDRP||7),RD=+(process.env.BUDRD||5),size=40,c=size/2,cy=c-3,dyL=(RP+RD)*H;
      const cn=v=>[(v[0][0]+v[1][0]+v[2][0])/3,(v[0][1]+v[1][1]+v[2][1])/3],mid=(v,i)=>[(v[i][0]+v[(i+1)%3][0])/2,(v[i][1]+v[(i+1)%3][1])/2];
      let Pc=S.ringKit(RP,'z').tris.map(t=>t.v);const Dc=S.ringKit(RD,'z').tris.map(t=>t.v.map(p=>[p[0],p[1]+dyL]));
      // the doorway: contact-row cells of both walls with x > -DW (the junction opens into P, into D and to the outside)
      // option 'c' (closed): the doorway ends at x = DC, so it joins P and D only (sealed while joined; each half becomes a pore after the split)
      const DC=X.includes('c')?2.25:1e9,gap=v=>cn(v)[0]>-DW&&cn(v)[0]<DC;
      // BUDPG=a,b / BUDDG=a,b: P's / D's half of the doorway is the contact-row cells with a < x < b instead
      const rg=(e,g)=>{if(!e)return g;const [a,b]=e.split(',').map(Number);return v=>cn(v)[0]>a&&cn(v)[0]<b;},gP=rg(process.env.BUDPG,gap),gD=rg(process.env.BUDDG,gap);
      // BUDCAP=a (with BUDPG starting at a): the same two cells as a free cap instead, bonded only to P's cell left of them
      // ('&' on the cap's side, a catching anchor Z@| on P's), touching D's wall unbonded. When the bud's catch silences
      // its anchor the cap is cut one pass before the doorway's '&' (P's side only) would be (openRange set so the parity
      // of the decaying signal does it); P's freed anchor emits and holds the doorway until it has caught its own plug
      const CA=process.env.BUDCAP?+process.env.BUDCAP:null,capT=CA===null?[]:Pc.filter(v=>cn(v)[1]>(RP-1)*H&&cn(v)[0]>CA&&cn(v)[0]<CA+1);
      Pc=Pc.filter(v=>!(cn(v)[1]>(RP-1)*H&&gP(v)));const Dk=Dc.filter(v=>!(cn(v)[1]<dyL-(RD-1)*H&&gD(v)));
      const tris=[...Pc,...Dk,...capT].map(v=>({v,type:'---'})),NP=Pc.length;
      // BUDPS=n (n <= 2): n more strands aAaA start free inside P, in rows below the founder (labelled: a parent that has
      // copied its genome)
      const moreF=[...Array(Math.min(2,+(process.env.BUDPS||0))).keys()].map(k=>({gaps:[1,1,1],faces:'aAaA',x:c,y:cy-1-1.1*k}));
      const {s,structures,founders}=createWorld({seed,size,founders:[{gaps:[1,1,1],faces:'aAaA',x:c,y:cy},...moreF],structures:[{tris,x:c,y:cy}],supply:{'-?-?-?':nb+NI},params:{}});
      const U=structures[0],F=founders[0],Pu=U.slice(0,NP),Du=U.slice(NP,NP+Dk.length),Cu=U.slice(NP+Dk.length),{gcode:gc,GLUE}=require('./sim'),inP=new Set(Pu),inD=new Set(Du);
      // the hold: the leftmost P-D bond is the doorway bond L; the anchor A is the inner free side within MD ring bonds
      // of L farthest from D's corners
      const LX=process.env.BUDLX?+process.env.BUDLX:null;
      const RC=[...Array(6).keys()].map(k=>[(RD-0.5)*Math.cos(k*Math.PI/3),dyL+(RD-0.5)*Math.sin(k*Math.PI/3)]);let pick=null;const MD=5;
      for(const u of Pu)for(let i=0;i<3;i++){const b=s.bond[u*3+i];if(b<0||!inD.has((b/3)|0))continue;const L=(b/3)|0,x=cn(tris[U.indexOf(L)].v)[0];if(LX!==null?!pick||Math.abs(x-LX)<Math.abs(pick.x-LX):!pick||x<pick.x)pick={u,i,L,j:b%3,x};}
      if(!pick)throw Error('budpore: no doorway bond');
      // BUDA=cell:side (D cell index in the structure, side) chooses the anchor instead
      const BA=process.env.BUDA,cands=[],more=[],prev=new Map([[pick.L,-1]]),Q=[pick.L],dist=new Map([[pick.L,0]]);let best=null;
      for(let q=0;q<Q.length;q++){const w=Q[q],d=dist.get(w);
        if(d>0||BA){const v=tris[U.indexOf(w)].v;for(let f=0;f<3;f++){const m=mid(v,f);if(s.bond[w*3+f]>=0||S.hexr([m[0],m[1]-dyL])>RD-0.5)continue;const sc=Math.min(...RC.map(r=>Math.hypot(r[0]-m[0],r[1]-m[1])));
          const k={A:w,f,sc,d};cands.push(k);if(BA?BA.split(',').includes(`${U.indexOf(w)}:${f}`):d<=MD&&(!best||sc>best.sc))best=k;if(BA&&BA.split(',').includes(`${U.indexOf(w)}:${f}`))more.push(k);}}
        if(d>=MD&&!BA&&!process.env.BUDDRY)continue;for(let e=0;e<3;e++){const b=s.bond[w*3+e];if(b<0||!inD.has((b/3)|0)||dist.has((b/3)|0))continue;dist.set((b/3)|0,d+1);prev.set((b/3)|0,w);Q.push((b/3)|0);}}
      if(!best)throw Error('budpore: no anchor side '+(BA||''));
      for(const u of Pu)for(let i=0;i<3;i++){const b=s.bond[u*3+i];if(b<0||!inD.has((b/3)|0)||(u===pick.u&&i===pick.i))continue;s.cut(u,i);s.glue[u*3+i]=0;s.glue[b]=0;}
      let cap=null;if(CA!==null){for(const u of Cu)for(let i=0;i<3;i++){const b=s.bond[u*3+i];if(b<0)continue;const w=(b/3)|0;if(inD.has(w))s.cut(u,i);else if(inP.has(w))cap={u,i,P:w,j:b%3};}
        if(!cap||cap.P!==pick.u)throw Error('budpore: the cap is not bonded to the doorway cell');}
      // the doorway bond carries no glue: once it is cut its two sides bind nothing
      s.glue[pick.u*3+pick.i]=0;s.glue[pick.L*3+pick.j]=0;const da={u:best.A,i:best.f};
      // prepared bonds need no glue: every wall side is inert (copies of wall cells then bind nothing; with the weld glue
      // f/F, copies of the anchor and the freed latch sides glued onto each other and onto strands and grew clusters)
      for(const u of U)for(let i=0;i<3;i++)s.glue[u*3+i]=0;
      // P's anchor W| (middle of its bottom inner wall)
      // BUDPX=x: P's anchor on P's top inner wall (beside the doorway) nearest x instead ('b': the bottom wall's middle; 'b1':
      // the bottom wall nearest x = 1); with 'c' on the doorway's
      // left edge (-1): the founder hangs under the doorway, so its copies are released at the way into D
      const PX=/^b/.test(process.env.BUDPX||'')?'':process.env.BUDPX||(X.includes('c')?-1:''),PB=/^b./.test(process.env.BUDPX||'')?+process.env.BUDPX.slice(1):0;let pa=null;for(const u of Pu){const v=tris[U.indexOf(u)].v;for(let i=0;i<3;i++){const m=mid(v,i);if(s.bond[u*3+i]>=0||(PX?m[1]<0:m[1]>0)||S.hexr(m)>RP-0.5)continue;const d=PX?Math.abs(m[0]-PX):Math.abs(m[0]-PB);if(!pa||d<pa.d)pa={u,i,d};}}
      if(PX)console.log('P anchor at',S.hexr(mid(tris[U.indexOf(pa.u)].v,pa.i)).toFixed(2),mid(tris[U.indexOf(pa.u)].v,pa.i).map(x=>x.toFixed(2)).join(','));
      // BUDPF=x: the founder as P's plug: held by its high end z on an anchor Z| on the free side of P's top row nearest x
      // (at the left edge of P's half it lies in P's row, faces into P), instead of W| holding its low end
      // BUDAG=Z: D's catching anchor takes a strand's high end z (glue Z@|; also in the dry-run) instead of its low end.
      // BUDPFE=w: BUDPF holds the founder's low end w (anchor W|) instead; BUDPFE=z without BUDPF: P's anchor (BUDPX) is Z|
      // and holds the founder's high end. BUDLX=x: the doorway bond is the P-D contact nearest x
      // (default: the leftmost)
      let fe=process.env.BUDPFE||'w';if(process.env.BUDPF){const x0=+process.env.BUDPF;pa=null;for(const u of Pu){const v=tris[U.indexOf(u)].v;for(let i=0;i<3;i++){const m=mid(v,i);if(s.bond[u*3+i]>=0||m[1]<(RP-1)*H||m[1]>RP*H-0.1)continue;const d=Math.abs(m[0]-x0)+Math.abs(m[1]-(RP-0.5)*H);if(!pa||d<pa.d)pa={u,i,d};}}
        fe=process.env.BUDPFE||'z';console.log(`P anchor ${fe.toUpperCase()}| (founder's ${fe==='z'?'high':'low'} end) on P cell ${U.indexOf(pa.u)} side ${pa.i} at`,mid(tris[U.indexOf(pa.u)].v,pa.i).map(x=>x.toFixed(2)).join(','));}
      // BUDPA=cell:side: P's anchor on that P cell's side instead (from BUDDRYP)
      if(process.env.BUDPA){const [k,i]=process.env.BUDPA.split(':').map(Number);pa={u:U[k],i,d:0};if(s.bond[pa.u*3+i]>=0)throw Error('budpore: BUDPA side is bonded');}
      s.glue[pa.u*3+pa.i]=gc(fe.toUpperCase());s.anc[pa.u*3+pa.i]=1;
      for(const k of BA?more:[best]){s.glue[k.A*3+k.f]=gc(process.env.BUDAG||'W');s.anc[k.A*3+k.f]=1;s.att[k.A*3+k.f]=1;}s.p.openRange=1;
      for(const G of founders)seedCopyGenome(s,G);for(let k=0;k<40;k++)s.derive();
      // BUDDRY: where a strand caught by its low end on each inner side of D would stand (placed as the anchor places it):
      // overlap with the wall, and each back site's and face site's distance to the nearest wall cell; then exit
      if(process.env.BUDDRY){const {triDepth}=require('./physics'),A6=new Float64Array(6),B6=new Float64Array(6),b=F.find(u=>{const r=s.roles(u);return r.inert>=0&&s.glue[u*3+r.inert]===gc(process.env.BUDAG?process.env.BUDAG.toLowerCase():'w');}),f=s.roles(b).inert,md=s.moveDepth;s.moveDepth=()=>0;
        const site=(u,i)=>{const P=k=>[s.px[u]+s.ox[u*3+k],s.py[u]+s.oy[u*3+k]],a=P(i),q=P((i+1)%3),o=P((i+2)%3);return [(2*a[0]+2*q[0]-o[0])/3,(2*a[1]+2*q[1]-o[1])/3];};
        const near=p=>Math.min(...U.map(v=>Math.hypot(s._dx(s.px[v]-p[0]),s._dy(s.py[v]-p[1])))),cD=[c,cy+dyL];
        for(const k of cands.sort((x,y)=>x.d-y.d)){s._snapBody(b,f,k.A,k.f);let ov=0;for(const u of F)for(const v of U){const dx=s._dx(s.px[v]-s.px[u]),dy=s._dy(s.py[v]-s.py[u]);if(dx*dx+dy*dy>1.4)continue;
            for(let q=0;q<3;q++){A6[2*q]=s.ox[u*3+q];A6[2*q+1]=s.oy[u*3+q];B6[2*q]=dx+s.ox[v*3+q];B6[2*q+1]=dy+s.oy[v*3+q];}if(triDepth(A6,B6)>1e-6)ov++;}
          const bk=[],fc=[];for(const u of F){const r=s.roles(u);if(r.free<0)continue;(r.role===2?bk:fc).push(near(site(u,r.free)).toFixed(2));}
          let ex=0,ey=0;for(const u of F){ex+=s._dx(s.px[u]-cD[0]);ey+=s._dy(s.py[u]-cD[1]);}const inn=S.hexr([ex/F.length,ey/F.length])<RD-1;
          const km=mid(tris[U.indexOf(k.A)].v,k.f);console.log(`cell ${U.indexOf(k.A)}:${k.f} at ${km[0].toFixed(2)},${(km[1]-dyL).toFixed(2)} (D frame) bonds from the doorway cell ${k.d} corner dist ${k.sc.toFixed(2)} overlaps ${ov} strand ${inn?'inside':'OUT'} backs [${bk}] faces [${fc}]${k===best?' (chosen)':''}`);
          // BUDDRYPIC=cell:side,...: a picture of the strand placed there
          if((process.env.BUDDRYPIC||'').split(',').includes(`${U.indexOf(k.A)}:${k.f}`))snap(s,`dry${U.indexOf(k.A)}_${k.f}`,`dry-run: a strand caught by its low end on D cell ${U.indexOf(k.A)} side ${k.f}`,{units:[...F,k.A],radius:6},false);}
        s.moveDepth=md;process.exit(0);}
      // BUDDRYP: the same for the founder on every inner side of P, held by the end P's anchor takes (BUDPFE); then exit
      if(process.env.BUDDRYP){const {triDepth}=require('./physics'),A6=new Float64Array(6),B6=new Float64Array(6),b=F.find(u=>{const r=s.roles(u);return r.inert>=0&&s.glue[u*3+r.inert]===gc(fe);}),f=s.roles(b).inert,md=s.moveDepth;s.moveDepth=()=>0;
        const site=(u,i)=>{const P=k=>[s.px[u]+s.ox[u*3+k],s.py[u]+s.oy[u*3+k]],a=P(i),q=P((i+1)%3),o=P((i+2)%3);return [(2*a[0]+2*q[0]-o[0])/3,(2*a[1]+2*q[1]-o[1])/3];};
        const near=p=>Math.min(...U.map(v=>Math.hypot(s._dx(s.px[v]-p[0]),s._dy(s.py[v]-p[1]))));
        for(const u of Pu){const v=tris[U.indexOf(u)].v;for(let i=0;i<3;i++){const m=mid(v,i);if(s.bond[u*3+i]>=0||S.hexr(m)>RP-0.5)continue;if(!s._snapBody(b,f,u,i))continue;let ov=0;
          for(const w of F)for(const x of U){const dx=s._dx(s.px[x]-s.px[w]),dy=s._dy(s.py[x]-s.py[w]);if(dx*dx+dy*dy>1.4)continue;
            for(let q=0;q<3;q++){A6[2*q]=s.ox[w*3+q];A6[2*q+1]=s.oy[w*3+q];B6[2*q]=dx+s.ox[x*3+q];B6[2*q+1]=dy+s.oy[x*3+q];}if(triDepth(A6,B6)>1e-6)ov++;}
          const bk=[],fc=[];for(const w of F){const r=s.roles(w);if(r.free<0)continue;(r.role===2?bk:fc).push(near(site(w,r.free)));}
          let ex=0,ey=0;for(const w of F){ex+=s._dx(s.px[w]-c);ey+=s._dy(s.py[w]-cy);}const inn=S.hexr([ex/F.length,ey/F.length])<RP-1,sb=[...bk].sort((x,y)=>x-y);
          console.log(`P cell ${U.indexOf(u)}:${i} at ${m[0].toFixed(2)},${m[1].toFixed(2)} overlaps ${ov} strand ${inn?'inside':'OUT'} backs [${bk.map(x=>x.toFixed(2))}] faces [${fc.map(x=>x.toFixed(2))}] 2nd-worst back ${sb[1]!==undefined?sb[1].toFixed(2):'-'}${u===pa.u&&i===pa.i?' (chosen)':''}`);}}
        s.moveDepth=md;process.exit(0);}
      // the founder starts held by P's anchor (placed where the anchor puts a strand; labelled)
      {const b=F.find(u=>{const r=s.roles(u);return r.inert>=0&&s.glue[u*3+r.inert]===gc(fe);}),f=s.roles(b).inert,md=s.moveDepth;s.moveDepth=()=>0;const ok=s._snapBody(b,f,pa.u,pa.i);s.moveDepth=md;
        if(!ok)throw Error('budpore: founder not placed');s.bind(pa.u,pa.i,GLUE,b,f,GLUE);
        const {triDepth}=require('./physics'),A=new Float64Array(6),B=new Float64Array(6);for(const u of F)for(const v of U){const dx=s._dx(s.px[v]-s.px[u]),dy=s._dy(s.py[v]-s.py[u]);if(dx*dx+dy*dy>1.4)continue;
          for(let q=0;q<3;q++){A[2*q]=s.ox[u*3+q];A[2*q+1]=s.oy[u*3+q];B[2*q]=dx+s.ox[v*3+q];B[2*q+1]=dy+s.oy[v*3+q];}if(triDepth(A,B)>1e-6)throw Error('budpore: founder overlaps the wall');}}
      spendableSides(s,U);for(let k=0;k<60;k++)s.derive();
      // the walls start spent (one completion pass while only A hears its own signal; spent sides stay spent), then the
      // open range grows to reach P's side of the doorway bond, which becomes a completion-release bond ('&' both sides)
      const dMax=Math.max(...(BA?more:[best]).map(k=>k.d));s._release();s.p.openRange=dMax+3;for(let k=0;k<dMax+4;k++)s.derive();s.done[pick.L*3+pick.j]=1;
      if(cap){const dist=new Map([[da.u,0]]),Q=[da.u];for(let q=0;q<Q.length;q++)for(let e=0;e<3;e++){const b=s.bond[Q[q]*3+e];if(b<0||dist.has((b/3)|0))continue;dist.set((b/3)|0,dist.get(Q[q])+1);Q.push((b/3)|0);}
        const dc=dist.get(cap.u);let R=Math.max(dMax+3,dc+2);if((R-dc)%2)R++;s.p.openRange=R;for(let k=0;k<R+2;k++)s.derive();
        s.done[cap.u*3+cap.i]=1;s.glue[cap.P*3+cap.j]=gc('Z');s.anc[cap.P*3+cap.j]=1;s.att[cap.P*3+cap.j]=1;s.done[pick.u*3+pick.i]=1;s.done[pick.L*3+pick.j]=0;
        if(!(s.op[cap.u]>0))throw Error('budpore: the cap hears no open signal');console.log(`cap: on P cell ${U.indexOf(cap.P)} (anchor Z@|), ${dc} bonds from the bud's anchor; openRange ${R}`);}
      else s.done[pick.u*3+pick.i]=1;
      if(!(s.op[pick.u]>0&&s.op[pick.L]>0))throw Error('budpore: the doorway bond hears no open signal');
      const prep=new Set([...U,...founders.flat()]),placed=[...prep];let ni=0;for(let u=0;u<s.n;u++){if(prep.has(u))continue;const ins=ni++<NI;
        if(!placeFree(s,u,placed,()=>{for(;;){if(ins){const x=(2*s.rng()-1)*RP,y=(2*s.rng()-1)*RP;if(S.hexr([x,y])<RP-1.6)return [c+x,cy+y];continue;}const x=size*s.rng(),y=size*s.rng();if(S.hexr([s._dx(x-c),s._dy(y-cy)])>RP+0.6&&S.hexr([s._dx(x-c),s._dy(y-cy-dyL)])>RD+0.6)return [x,y];}},50000))throw Error('place');placed.push(u);}
      // inside a ring: within its inner wall's distance of its centre (unwrapped along bonds)
      const centre=L=>{const set=new Set(L),Q=[L[0]],seen=new Set(Q);for(let q=0;q<Q.length;q++)for(let i=0;i<3;i++){const b=s.bond[Q[q]*3+i];if(b<0)continue;const w=(b/3)|0;if(set.has(w)&&!seen.has(w)){seen.add(w);Q.push(w);}}
        const RX=new Float64Array(Q.length),RY=new Float64Array(Q.length);s._unwrap(Q,RX,RY);let x=0,y=0;for(let q=0;q<Q.length;q++){x+=RX[q];y+=RY[q];}return [s.px[Q[0]]+x/Q.length,s.py[Q[0]]+y/Q.length];};
      const where=()=>{const cP=centre(Pu),cD=centre(Du),{comp}=s.bodies();return census(s).filter(q=>q.n>=7&&!q.paired).map(q=>{let x=0,y=0;for(const u of q.units){x+=s._dx(s.px[u]-s.px[q.units[0]]);y+=s._dy(s.py[u]-s.py[q.units[0]]);}
        const X=s.px[q.units[0]]+x/q.n,Y=s.py[q.units[0]]+y/q.n,inR=(C,R)=>Math.hypot(s._dx(X-C[0]),s._dy(Y-C[1]))<(R-1)*H,an=comp[q.units[0]]===comp[Pu[0]]||comp[q.units[0]]===comp[Du[0]];
        return inR(cD,RD)?(an?'D*':'D'):inR(cP,RP)?(an?'P*':'P'):'out';});};
      const wallT=new Set(U.map(u=>canon(typeName(s,u)))),tally=()=>{let gn=0,w=0;for(const [,,ty] of s.copyLog||[])if(wallT.has(canon(ty)))w++;else gn++;return [gn,w];};
      let split=0,atSplit=null,bSplit=0;const nIn=(L,k)=>L.filter(x=>x[0]===k).length;
      // copies finished inside the bud after the split (a release whose copy triangle lies inside D)
      // and on the bud's own anchored strand (its template is in D's body; a copy of aAaA has 4 docked triangles)
      let relD=0,relA=0,relJ=0,lastCut=-1,lastT=-1;{const oc=s.cut.bind(s),ok=s.count.bind(s);s.cut=(u,i)=>{lastCut=u;lastT=s.bond[u*3+i]>=0?(s.bond[u*3+i]/3)|0:-1;return oc(u,i);};
        s.count=(k,d)=>{if(k==='release'&&!split&&lastT>=0){const {comp}=s.bodies(),cD=centre(Du);if(comp[lastT]===comp[Du[0]]&&Math.hypot(s._dx(s.px[lastT]-cD[0]),s._dy(s.py[lastT]-cD[1]))<(RD-1)*H)relJ++;}
          if(k==='release'&&split&&lastCut>=0){const cD=centre(Du);if(Math.hypot(s._dx(s.px[lastCut]-cD[0]),s._dy(s.py[lastCut]-cD[1]))<(RD-1)*H)relD++;
          if(lastT>=0){const {comp}=s.bodies();if(comp[lastT]===comp[Du[0]])relA++;}}return ok(k,d);};}
      const report=t=>{const {comp}=s.bodies();if(!split&&comp[Pu[0]]!==comp[Du[0]]){split=t;atSplit=where();bSplit=typeCount(s)[canon('-?-?-?')]||0;
          snap(s,'split',`t=${t}: split, ${bSplit} blanks left`,{units:Pu,radius:16},false);}const L=where(),[gn,w]=tally();
        console.log(`t=${t} strands in P ${nIn(L,'P')} in D ${nIn(L,'D')} out ${L.filter(x=>x==='out').length} [${L.join(' ')}] ${split?'SPLIT at '+split:'joined'} docks=${s.ev.dock||0} releases=${s.ev.release||0} anchors=${s.ev.anchor||0} copies=${s.ev.copy||0} (genome ${gn}, wall ${w}) blanks=${typeCount(s)[canon('-?-?-?')]||0}`);};
      // DBGC: where copies are made after the split (by the copied triangle: in D, in P, outside; wall or genome type)
      const afterW={};if(process.env.DBGC){const cl=[];cl.push=function(e){if(split){const [,u,ty]=e,cD=centre(Du),cP=centre(Pu),d=C=>Math.hypot(s._dx(s.px[u]-C[0]),s._dy(s.py[u]-C[1]));
        const k=(d(cD)<RD*H?'D':d(cP)<RP*H?'P':'out')+':'+(wallT.has(canon(ty))?ty:'genome');afterW[k]=(afterW[k]||0)+1;}return Array.prototype.push.call(this,e);};s.copyLog=cl;
        process.on('exit',()=>console.log('after split',JSON.stringify(afterW)));}
      if(process.env.DBGC)process.on('exit',()=>{const m={};for(const [tt,u,ty] of s.copyLog||[])if(wallT.has(canon(ty)))m[ty+(split&&tt>split?' after':' before')]=(m[ty+(split&&tt>split?' after':' before')]||0)+1;const g={};for(const [,,ty] of s.copyLog||[])if(!wallT.has(canon(ty)))g[ty]=(g[ty]||0)+1;console.log('genome copies by type',JSON.stringify(g),'fills',s.ev.fill||0,'docks',s.ev.dock||0);console.log(JSON.stringify(m),'hearing',U.filter(u=>s.op[u]>0).length,'unspent free sides',U.reduce((a,u)=>a+[0,1,2].filter(i=>s.bond[u*3+i]<0&&!s.spent[u*3+i]).length,0));});
      console.log(`budpore: completion-release doorway bond on D cell ${U.indexOf(pick.L)}, anchor ${process.env.BUDAG||'W'}@| on D cell ${U.indexOf(da.u)} (${best.d} bonds), openRange ${s.p.openRange}`);
      snap(s,'t0',`t=0: parent P (founder on its anchor${NI?`, ${NI} copy blanks`:''}) and bud D joined by one completion-release bond; ${nb} copy blanks outside`,{units:U,radius:14},false);
      for(let t=1;t<=steps;t++){s.step();if(every(t,40))report(t);if(every(t,+process.env.BUDF||4))snap(s,`t${t}`,`t=${t}: ${split?'split at '+split+', the bud':'joined'}`,split?{units:Du,radius:9}:{units:Pu,radius:16},false);}
      report(steps);const L=where(),[gn,w]=tally();
      console.log(`result: ${split?'split at '+split+' with '+bSplit+' blanks left':'not split'}, strands in D at the split ${atSplit?nIn(atSplit,'D'):0}, at the end ${nIn(L,'D')}, copy releases in D after the split ${relD}, on the bud's anchored strand ${relA} (copies ${Math.floor(relA/4)}); before the split on D's anchored strand ${relJ}; in P ${nIn(L,'P')}; copies ${s.ev.copy||0}: genome ${gn}, wall ${w}`);
      {const {comp,members}=s.bodies();snap(s,'zoom','the bud at the end',{units:members[comp[Du[0]]],radius:8},false);}
      finish(`Bud pair on copies: the bud catches a copy mid-wall by its ${process.env.BUDAG==='Z'?'high':'low'} end and splits off with food left${s.p.heldCopy?' (heldCopy: only held strands are copied)':''}; frames then follow the bud`);},
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
