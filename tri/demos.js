'use strict';
// Demos of every capability (one or two small worlds each; pictures + saved states in the output directory).
//   node tri/demos.js NAME [seed] [steps] [outdir] [extra]
// NAME: copy | lid | stamp | split | closure | pool | budpool | budpore | budgrow | grow | heir | cycle | ring | import | cell | bud | wrap | live | grown | cells | conveyor | gate | energy | factory | imprint
const path=require('path');
const {createWorld,placeFree,census,typeCount,partPlacement,openBudDoors,buildStructure,placeTri}=require('./world');
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
function spendableSides(s,U){for(const u of U)for(let i=0;i<3;i++){const k=u*3+i;if(s.bond[k]<0&&!s.glue[k]&&!s.hinge[k]&&!s.cOnly[k]&&!s.trg[k]&&!s.ltc[k]&&!s.hear[k]&&!s.att[k]&&!s.anc[k]&&!s.cpy[k])s.done[k]=1;}}
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
    // lid pocket: a target slides into the notch, the lid closes on it, the cast gives the instruction glues, the lid reopens
    lid(){steps=steps||4000;const {s,structures}=createWorld({seed,size:14,structures:[{tris:S.lidPocket('bcd','A'),x:7,y:7}],supply:{'aaa':16,'---':20}});
      const U=structures[0],focus={units:U,radius:4,align:{u:U[4],a0:s.angle(U[4])}};snap(s,'t0','t=0',focus);
      for(let t=1;t<=steps;t++){s.step();if(every(t,10))console.log(`t=${t} casts=${s.ev.cast||0} aaa=${typeCount(s).aaa||0}`);if(every(t,4))snap(s,`t${t}`,`t=${t}: casts ${s.ev.cast||0}`,focus);}
      console.log('casts',JSON.stringify((s.castLog||[]).slice(0,8)));finish('Lid pocket: aaa slides into the notch, the lid closes, cast bcd, the lid reopens');},
    // grown pocket: a lid pocket kit (structures.kit) grows from a seed on an anchor cell (labelled start: anchor + root);
    // extra: copies of each kit type (default 4); with 's' (e.g. 4s) a stamp pocket that casts the ring part A@-b@
    grow(){steps=steps||20000;const per=parseInt(extra)||4,stamp=String(extra||'').includes('s'),K=S.kit(S.lidPocket(stamp?S.stampInstr('A@-b@'):'-A-','X',null,'B'),'auto','x','z',null,[S.lidSlot('B')]),r=K.tris[K.root],i=K.rootSide;
      const a=r.v[i],b=r.v[(i+1)%3],c=r.v[(i+2)%3],anchor={v:[b,a,[a[0]+b[0]-c[0],a[1]+b[1]-c[1]]],type:'z--'};
      const supply={xxx:16};for(const t of K.kit)supply[t]=(supply[t]||0)+per;
      const {s,structures}=createWorld({seed,size:16,structures:[{tris:[anchor,r],x:8,y:8}],supply,params:{pLoose:0.05}});
      console.log('kit',K.kit.join(' '),'depth',K.depth);const A=structures[0][0];
      const tmp=new TriSim({},1),want=new Set(K.types.map(t=>{tmp.setType(0,t);return canon(tmp.typeName(0));})),grown=()=>{const {comp}=s.bodies();let k=0;for(let u=0;u<s.n;u++)if(comp[u]===comp[A]&&want.has(canon(typeName(s,u))))k++;return k;};
      snap(s,'t0','t=0: anchor and root',null,false);let done=0;
      for(let t=1;t<=steps;t++){s.step();if(every(t,20)){const g=grown();if(!done&&g>=K.tris.length)done=t;console.log(`t=${t} kit cells=${g}/${K.tris.length} casts=${s.ev.cast||0}`);}
        if(every(t,4))snap(s,`t${t}`,`t=${t}: casts ${s.ev.cast||0}`,null,false);}
      {const {comp}=s.bodies();snap(s,'zoom','grown part (zoom)',{units:[...Array(s.n).keys()].filter(u=>comp[u]===comp[A]),radius:3.5});}
      console.log('complete at',done||'not yet','products',JSON.stringify(typeCount(s)[canon(stamp?'A@-b@':'-A-')]||0));finish(`Grown ${stamp?'stamp':'lid'} pocket from a seed (kit of ${K.kit.length} types, ${per} each)`);},
    // heritable pocket: a chain whose low end exposes seed z grows a lid pocket from the kit in supply; dockers carry z on
    // their prev side, so every copy's low end exposes the seed again and grows its own pocket; fills must be Z--
    // (a docker used as a fill would expose z on a hidden back) (extra: kit copies, 12)
    heir(){steps=steps||30000;const per=parseInt(extra)||12,P=S.lidPocket('-A-','X');
      const supply={'Az-':14,'az-':14,'Z--':30,xxx:10};
      const probe=createWorld({seed,size:22,founders:[{gaps:[1,1,1,1],faces:'aaaaa',ends:'z-'}]}),U0=probe.founders[0];
      const K=S.kitOptions(P,'xa','z',[S.lidSlot('B')]).find(k=>partPlacement(probe.s,U0,U0[0],k,S.lidClear()).ok);if(!K)throw Error('no placement');
      for(const t of K.kit.concat([K.types[K.root]]))supply[t]=(supply[t]||0)+per;
      const {s,founders}=createWorld({seed,size:22,founders:[{gaps:[1,1,1,1],faces:'aaaaa',ends:'z-'}],supply,params:{pLoose:0.05}});
      console.log('root',K.root,'side',K.rootSide,'depth',K.depth);
      const tmp=new TriSim({},1),norm=t=>{tmp.setType(0,t);return canon(tmp.typeName(0));},want=new Set(K.types.map(norm));
      const report=t=>{const {comp,members}=s.bodies(),c=census(s).filter(x=>x.n>=9&&!x.paired);
        const parts=c.map(x=>members[comp[x.units[0]]].filter(u=>want.has(norm(typeName(s,u)))).length);
        console.log(`t=${t} strands ${c.map((x,k)=>x.faces+'+'+parts[k]).join(' ')} docks=${s.ev.dock||0} casts=${s.ev.cast||0}`);};
      snap(s,'t0','t=0: founder with seed z, kit in supply',null,false);
      for(let t=1;t<=steps;t++){s.step();if(every(t,15))report(t);if(every(t,3))snap(s,`t${t}`,`t=${t}`,null,false);}
      const c=census(s).filter(x=>x.n>=9&&!x.paired);c.slice(0,3).forEach((x,k)=>{const {comp,members}=s.bodies();snap(s,'zoom'+k,`strand ${x.faces} and its part`,{units:members[comp[x.units[0]]],radius:4.5});});
      finish('Heritable pocket: chains grow a lid pocket from their end seed');},
    // heritable factory cycle: strands aaaaa (seed y) grow pocket Py, which casts dockers Az- from blanks; their copies
    // AAAAA (seed z, from the dockers' prev side) grow pocket Pz, which casts ay-, whose copies are aaaaa again. Starts
    // with the founder aaaaa, the two kits, fills and blanks; no dockers (extra: kit copies, 10)
    cycle(){steps=steps||120000;const per=parseInt(extra)||10,size=24;
      const probe=createWorld({seed,size,founders:[{gaps:[1,1,1,1],faces:'aaaaa',ends:'y-'}]}),U0=probe.founders[0];
      const fit=(P,res,sd)=>S.kitOptions(P,res,sd,[S.lidSlot('B')]).find(k=>partPlacement(probe.s,U0,U0[0],k,S.lidClear()).ok);
      const Ky=fit(S.lidPocket('-Az','X',null,'B'),'xyz','y'),Kz=fit(S.lidPocket('-ay','X',null,'B'),'xyz'+Ky.letters,'z');if(!Ky||!Kz)throw Error('no placement');
      const supply={'Z--':16,'Y--':16,xxx:60};for(const K of [Ky,Kz])for(const t of K.types)supply[t]=(supply[t]||0)+per;
      const {s}=createWorld({seed,size,founders:[{gaps:[1,1,1,1],faces:'aaaaa',ends:'y-'}],supply,params:{pLoose:0.05}});
      const tmp=new TriSim({},1),norm=t=>{tmp.setType(0,t);return canon(tmp.typeName(0));},Wy=new Set(Ky.types.map(norm)),Wz=new Set(Kz.types.map(norm));
      const report=t=>{const {comp,members}=s.bodies(),c=census(s).filter(x=>x.n>=9&&!x.paired),tc=typeCount(s);
        const part=x=>{const m=members[comp[x.units[0]]];return m.filter(u=>Wy.has(norm(typeName(s,u)))).length+'/'+m.filter(u=>Wz.has(norm(typeName(s,u)))).length;};
        console.log(`t=${t} strands ${c.map(x=>x.faces+'['+part(x)+']').join(' ')} casts=${s.ev.cast||0} Az-=${tc[canon('Az-')]||0} ay-=${tc[canon('ay-')]||0} xxx=${tc.xxx||0} docks=${s.ev.dock||0}`);};
      snap(s,'t0','t=0: founder aaaaa (seed y), two kits, blanks; no dockers',null,false);
      for(let t=1;t<=steps;t++){s.step();if(every(t,40))report(t);if(every(t,4))snap(s,`t${t}`,`t=${t}: casts ${s.ev.cast||0}`,null,false);}
      const c=census(s).filter(x=>x.n>=9&&!x.paired);c.slice(0,4).forEach((x,k)=>{const {comp,members}=s.bodies();snap(s,'zoom'+k,`strand ${x.faces} and its part`,{units:members[comp[x.units[0]]],radius:4.5});});
      finish('Heritable factory cycle: each strand grows the pocket that casts the dockers it needs');},
    // stamp factory: five lid pockets (prepared, labelled) whose instruction sides carry the attach mark '@' cast blanks
    // xxx into the five motif parts of a ring kit (R=3); an anchor with the ring's root (prepared) grows the ring from
    // cast parts only: the metabolism makes the parts of a membrane (extra: blanks, default 60)
    stamp(){steps=steps||60000;const nb=parseInt(extra)||60,size=26,c=size/2,K=S.ringKit(3,'z'),r=K.tris[0],i=K.rootSide;
      const a=r.v[i],b=r.v[(i+1)%3],cc=r.v[(i+2)%3],anchor={v:[b,a,[a[0]+b[0]-cc[0],a[1]+b[1]-cc[1]]],type:'z--'};
      const pockets=K.kit.map((t,k)=>{const ang=2*Math.PI*k/K.kit.length+0.3,R0=8.5;return {tris:S.lidPocket(S.stampInstr(t),'X'),x:c+R0*Math.cos(ang),y:c+R0*Math.sin(ang),rot:ang+Math.PI/2};});
      const {s,structures}=createWorld({seed,size,structures:[{tris:[anchor,r],x:c,y:c},...pockets],supply:{xxx:nb}});const A=structures[0][0],root=structures[0][1],cl=[0,1,2].find(q=>s.cOnly[root*3+q]);
      console.log('motif parts',K.kit.join(' '),'stamps',K.kit.map(t=>S.stampInstr(t).join(' ')).join(' | '));
      const tmp=new TriSim({},1),norm=t=>{tmp.setType(0,t);return canon(tmp.typeName(0));},motif=K.kit.map(norm);let closed=0;
      const size_=()=>{const {comp}=s.bodies();let k=0;for(let u=0;u<s.n;u++)if(comp[u]===comp[A])k++;return k-1;};
      const report=t=>{const tc=typeCount(s);console.log(`t=${t} ring cells=${size_()}/${K.N} closed=${closed?'at '+closed:'no'} casts=${s.ev.cast||0} parts cast [${motif.map(m=>tc[m]||0).join(' ')}] blanks=${tc.xxx||0}`);};
      snap(s,'t0','t=0: five stamp pockets, blanks, the ring root on an anchor',null,false);
      for(let t=1;t<=steps;t++){s.step();if(!closed&&s.bond[root*3+cl]>=0)closed=t;if(every(t,20))report(t);if(every(t,4))snap(s,`t${t}`,`t=${t}: casts ${s.ev.cast||0}, ring ${size_()}/${K.N}${closed?', closed':''}`,null,false);}
      {const {comp}=s.bodies();snap(s,'zoom','ring grown from cast parts (zoom)',{units:[...Array(s.n).keys()].filter(u=>comp[u]===comp[A]),radius:4.5});}
      finish('Stamp factory: pockets cast blanks into membrane parts; a ring grows from them');},
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
    imprintCell(){const X=String(extra||''),pore=X.includes('p'),plain=X.includes('n'),closed=pore&&X.includes('c'),nb=parseInt(extra)||(pore?150:40),R=6,size=2*R+8,c=size/2;steps=steps||(pore?100000:40000);
      let ring=S.ringKit(R,'z').tris.map(t=>({v:t.v,type:'---'}));const mid=(v,i)=>[(v[i][0]+v[(i+1)%3][0])/2,(v[i][1]+v[(i+1)%3][1])/2];
      if(pore){const ang=t=>{const m=[0,1,2].map(i=>t.v[i]).reduce((a,p)=>[a[0]+p[0]/3,a[1]+p[1]/3],[0,0]);return Math.abs(Math.atan2(m[1],m[0])-Math.PI/2);};
        ring.sort((a,b)=>ang(a)-ang(b));if(!closed)ring=ring.slice(3);
        // the anchor: the inner side in the middle of the flat wall opposite the pore (at a corner the anchored strand
        // would lie along the next wall, its backs hidden, and no fill could be copied)
        let best=null;for(const t of ring)for(let i=0;i<3;i++){const m=mid(t.v,i),d=Math.abs(m[0]);if(m[1]<0&&S.hexr(m)<R-0.5&&(!best||d<best.d))best={t,i,d};}
        best.t.type=[0,1,2].map(i=>i===best.i?'W|':'-').join('');}
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
      const {s,structures,founders}=createWorld({seed,size,founders:[{gaps:[1,1,1],faces:'aAaA',x:pore?c-1:c,y:c},...rivals],structures:[{tris:ring,x:c,y:c}],supply:{'-?-?-?':nb},params:{}});
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
    // split: a parent ring P and a bud ring D (prepared, labelled) share a wall held by completion-release pairs '&',
    // with an open doorway through both walls (each panel turned open, held by a '&' doorstop, always triggered). Inside
    // P a stamp pocket casts blanks into the bud's part (A@-a@); parts diffuse through the doorway into D and grow a
    // three-cell cap on D's inner wall. While the cap is open the pair hears the open signal; once it is complete every
    // '&' lets go: the doors swing shut and lock, D separates with its content (extra: blanks inside P, default 30)
    // extra 'g' (genome): no cap; P holds a chain aaaa (no seed) and a stamp pocket casting its dockers Ay.z (seed z on
    // the next side, lateral y close-only; fills Y-- as food); D's wall has an anchor Z@| that catches a copy's
    // seed z (the strand is placed flush): the bud splits off once it holds a genome copy; the parent's wall has an
    // anchor W| that holds the founder by its seed w (copies do not carry w), so the parent keeps its genome
    // extra 'o' (organelle, with the genome): D also grows a stamp pocket casting aU.w (the dockers its copy AAAA needs;
    // their copies aaaa carry w like the founder; the blanks uuu are their fills) from blanks uuu (food only
    // the bud uses; the parent's pocket takes xxx), from a seed v@ on its wall; D has an import door for uuu (key U*),
    // deaf until the split; the 40 uuu start outside both rings (none inside P: a uuu that reached D early closed onto
    // two casters' U. sides in the pocket's last caster site and blocked it); its kit parts (3 of each type) start
    // inside P with the food; the pair splits once the pocket is complete and a copy is anchored: the bud leaves with a
    // genome and a pocket that casts its dockers, and imports their blanks through its own door (RP 8, RD 6)
    split(){steps=steps||60000;const org=String(extra||'').includes('o'),gen=org||String(extra||'').includes('g'),nb=parseInt(extra)||30,size=org?40:gen?32:28,c=size/2,cy=c-3,RP=org?8:gen?7:6;
      const OK=org?S.kitOptions(S.lidPocket(S.stampInstr('aU.w'),'U',null,'B'),'aywzxvuψωбгджцшэлпфизч','v',[S.lidSlot('B')]):null;
      const RD=org?6:gen?5:4,bp=S.budPair({RP,RD,k:5,capGlue:gen?null:'a',anchorGlue:gen?'Z':null,anchorP:gen?'W':null,importD:org?'U':null,organelle:org?{opts:OK,gaps:[1,1,1],seed:'v',slots:[S.lidSlot('B')],clear:S.lidClear()}:null});
      const OUT=org?40:0,kitSupply={};if(org)for(const t of bp.organelle.K.types)kitSupply[t]=(kitSupply[t]||0)+3;
      const pocket={tris:S.lidPocket(S.stampInstr(gen?'Ay.z':bp.cap.type),'X'),x:c-(gen?1:0.5),y:cy-(gen?0:1.6),rot:0};
      const supplyG={xxx:org?10:nb,'Y--':org?12:16,...(org?{uuu:OUT}:{}),...kitSupply};
      // the founder (genome variant) near P's anchor: the first spot where prepared parts do not overlap
      const overlap=(s,all)=>{const {triDepth}=require('./physics'),A=new Float64Array(6),B=new Float64Array(6);
        for(const u of all)for(const v of all){if(v<=u)continue;const dx=s._dx(s.px[v]-s.px[u]),dy=s._dy(s.py[v]-s.py[u]);if(dx*dx+dy*dy>1.4)continue;
          for(let q=0;q<3;q++){A[2*q]=s.ox[u*3+q];A[2*q+1]=s.oy[u*3+q];B[2*q]=dx+s.ox[v*3+q];B[2*q+1]=dy+s.oy[v*3+q];}if(triDepth(A,B)>1e-6)return true;}return false;};
      let W0=null;
      for(const f of gen?[0.55,0.45,0.65,0.35,0.75]:[0])for(const ox of gen?[0,1,-1,2,-2]:[0]){
        const w=createWorld({seed,size,founders:gen?[{gaps:[1,1,1],faces:'aaaa',ends:'w-',x:c+bp.anchorP[2][0]*f+ox,y:cy+bp.anchorP[2][1]*f}]:[],structures:[{tris:bp.tris,x:c,y:cy},...(pocket?[pocket]:[])],supply:gen?supplyG:{xxx:nb},params:org?{lockRange:80}:{}});
        openBudDoors(w.s,w.structures[0],bp);if(!overlap(w.s,[...w.structures[0],...(w.structures[1]||[]),...(w.founders[0]||[])])){W0=w;break;}}
      if(!W0)throw Error('split: prepared parts overlap');
      const {s,structures,founders}=W0,U=structures[0],PK=[...(structures[1]||[]),...(founders[0]||[])];
      // the blanks start inside P (the parent's food; labelled)
      const prep=new Set([...U,...PK]),free=[...Array(s.n).keys()].filter(u=>!prep.has(u)),placed=[...prep];
      // organelle variant: OUT blanks uuu start outside both rings (the bud imports them after the split)
      const outU=free.filter(u=>typeName(s,u)==='uuu').slice(0,OUT),dcy=cy+(RP+RD)*H;
      outU.forEach(u=>{if(!placeFree(s,u,placed,()=>{for(;;){const x=size*s.rng(),y=size*s.rng();const dP=[s._dx(x-c),s._dy(y-cy)],dD=[s._dx(x-c),s._dy(y-dcy)];
        if(S.hexr(dP)>RP+0.6&&S.hexr(dD)>RD+0.6)return [x,y];}},50000))throw Error('place out');placed.push(u);});
      free.filter(u=>!outU.includes(u)).forEach(u=>{if(!placeFree(s,u,placed,()=>{for(;;){const x=(2*s.rng()-1)*RP,y=(2*s.rng()-1)*RP;if(S.hexr([x,y])<RP-1.6)return [c+x,cy+y];}},50000))throw Error('place');placed.push(u);});
      const Pu=bp.P.map(q=>U[q]),Du=bp.D.map(q=>U[q]),capT=canon(gen?'Ay.z':bp.cap.type),closeU=bp.doors.map(d=>[U[d.panel[d.panel.length-1]],d.closeSide[0]]);
      const ctr=L=>{let x=0,y=0;for(const u of L){x+=s._dx(s.px[u]-s.px[L[0]]);y+=s._dy(s.py[u]-s.py[L[0]]);}return [s.px[L[0]]+x/L.length,s.py[L[0]]+y/L.length];};
      // inside a ring: hex radius (structures.hexr) in the ring's own frame (its turn since t=0 read from one wall cell)
      const a0P=s.angle(Pu[0]),a0D=s.angle(Du[0]),hexIn=(L,a0,R,u)=>{const [x,y]=ctr(L),t=a0-s.angle(L[0]),dx=s._dx(s.px[u]-x),dy=s._dy(s.py[u]-y);
        return S.hexr([Math.cos(t)*dx-Math.sin(t)*dy,Math.sin(t)*dx+Math.cos(t)*dy])<R-1;};
      const inD=u=>hexIn(Du,a0D,RD,u),inP=u=>hexIn(Pu,a0P,RP,u);
      // outside every closed structure: a flood fill on a fine grid from the world's corner (bonded triangles are walls)
      const outsideNow=()=>{const W=s.p.W,G=Math.round(W*4),cell=W/G,occ=new Uint8Array(G*G),rch=new Uint8Array(G*G),q=[];
        for(let u=0;u<s.n;u++){if(!s.bonded(u))continue;for(let a=0;a<=4;a++)for(let b=0;b<=4-a;b++){const w=[a/4,b/4,1-a/4-b/4];let x=0,y=0;
          for(let k=0;k<3;k++){x+=w[k]*(s.px[u]+s.ox[u*3+k]);y+=w[k]*(s.py[u]+s.oy[u*3+k]);}occ[(Math.floor(s._wy(y)/cell)%G)*G+Math.floor(s._wx(x)/cell)%G]=1;}}
        for(const st of [0,G-1,G*(G-1),G*G-1])if(!occ[st]){rch[st]=1;q.push(st);}
        while(q.length){const c=q.pop(),i=c%G,j=(c/G)|0;for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1]]){const n=((j+dj+G)%G)*G+((i+di+G)%G);if(!rch[n]&&!occ[n]){rch[n]=1;q.push(n);}}}
        return u=>rch[(Math.floor(s._wy(s.py[u])/cell)%G)*G+Math.floor(s._wx(s.px[u])/cell)%G]===1;};
      let split=0;const kitT=new Set(org?bp.organelle.K.types.map(t=>{const z=new TriSim({},1);z.setType(0,t);return canon(z.typeName(0));}):[]);
      const report=t=>{const {comp}=s.bodies(),dc=comp[Du[0]],cap=[...Array(s.n).keys()].filter(u=>comp[u]===dc&&canon(typeName(s,u))===capT).length;
        if(!split&&comp[Pu[0]]!==dc)split=t;const shut=closeU.map(([u,i])=>s.bond[u*3+i]>=0?'shut':'open');
        const parts=[...Array(s.n).keys()].filter(u=>canon(typeName(s,u))===capT&&!s.bonded(u));
        const st=gen?' strands ['+census(s).filter(q=>q.n>=7).map(q=>q.faces+(q.paired?'*':'')+(comp[q.units[0]]===dc||comp[q.units[0]]===comp[Pu[0]]?(inD(q.units[3])?'(anchored in D)':'(anchored in P)'):inD(q.units[3])?'(in D)':inP(q.units[3])?'(in P)':'(out)')).join(' ')+'] docks='+(s.ev.dock||0)+' anchors='+(s.ev.anchor||0):'';
        const og=org?` organelle=${[...Array(s.n).keys()].filter(u=>comp[u]===dc&&kitT.has(canon(typeName(s,u)))&&inD(u)).length}/${bp.organelle.K.types.length}`:'';
        console.log(`t=${t} casts=${s.ev.cast||0}${st}${gen?og:` cap=${cap}/3`} ${split?'SPLIT at '+split:'joined'} doors P:${shut[0]} D:${shut[1]} free parts in D=${parts.filter(inD).length}/${parts.length} blanks in D=${free.filter(u=>typeName(s,u)==='xxx'&&inD(u)).length}${gen?` fills in D=${free.filter(u=>typeName(s,u)==='Y--'&&inD(u)).length}`:''}${org?` in D: uuu=${free.filter(u=>typeName(s,u)==='uuu'&&inD(u)).length} aU.w=${free.filter(u=>canon(typeName(s,u))===canon('aU.w')&&inD(u)).length} imports=${s.ev.drop||0}`:''} completions=${s.ev.complete||0} outside=${(o=>free.filter(u=>!s.bonded(u)&&o(u)).length)(outsideNow())}`);};
      console.log('part',gen?'Ay.z':bp.cap.type,'stamp',S.stampInstr(gen?'Ay.z':bp.cap.type).join(' '),'doors',bp.doors.map(d=>d.ang+'deg').join(' '));
      snap(s,'t0','t=0: parent P (stamp pocket, blanks) and bud D share an open doorway',{units:U,radius:10});
      for(let t=1;t<=steps;t++){s.step();if(every(t,30))report(t);if(every(t,4))snap(s,`t${t}`,`t=${t}: casts ${s.ev.cast||0}${split?', split':''}`,{units:Pu,radius:12},false);}
      // organelle variant, end of run: each kit cell missing from the bud's pocket, whether its tree parent is there, how
      // many of its kit neighbours are there (3 sides facing something before it arrives: an enclosed site), and where
      // the copies of its type are (bonded: in D's body, P's body or another body of n cells; free: in D, in P, out)
      if(org){const {comp,members}=s.bodies(),dc=comp[Du[0]],pc=comp[Pu[0]],K=bp.organelle.K,norm=t=>{const z=new TriSim({},1);z.setType(0,t);return canon(z.typeName(0));};
        const T=K.types.map(norm),have=new Set([...Array(s.n).keys()].filter(u=>comp[u]===dc&&inD(u)).map(u=>canon(typeName(s,u)))),parent=new Map(K.tree.map(([x,y])=>[y,x]));
        const eq=(p,q)=>Math.hypot(p[0]-q[0],p[1]-q[1])<1e-6,A=c=>K.tris[c].v;
        const nb=c=>K.tris.map((t,o)=>o).filter(o=>o!==c&&[0,1,2].some(i=>[0,1,2].some(j=>eq(A(c)[i],A(o)[(j+1)%3])&&eq(A(c)[(i+1)%3],A(o)[j]))));
        const miss=T.map((t,c)=>c).filter(c=>!have.has(T[c]));
        console.log(`pocket: ${T.length-miss.length}/${T.length} kit cells in the bud; missing:`);
        for(const c of miss){const where={};for(let u=0;u<s.n;u++){if(canon(typeName(s,u))!==T[c])continue;
            const w=s.bonded(u)?(comp[u]===dc?'bonded in D body':comp[u]===pc?'bonded in P body':`bonded in a ${members[comp[u]].length}-cell body`):inD(u)?'free in D':inP(u)?'free in P':'free out';where[w]=(where[w]||0)+1;}
          const N=nb(c);console.log(`  cell ${c} ${K.types[c]}: parent ${parent.has(c)?parent.get(c)+(have.has(T[parent.get(c)])?' there':' missing'):'(root)'}, kit neighbours there ${N.filter(o=>have.has(T[o])).length}/${N.length}, copies ${JSON.stringify(where)}`);}
        snap(s,'pocket',`the bud's pocket: ${T.length-miss.length}/${T.length} cells`,{units:members[dc].filter(u=>T.includes(canon(typeName(s,u)))),radius:3.5});}
      {const {comp,members}=s.bodies();snap(s,'zoom','the bud after the split',{units:members[comp[Du[0]]],radius:6});}
      finish('Split: the parent feeds its bud through a doorway; when the bud is complete the doors shut and it separates');},
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
    budpool(){steps=steps||100000;const {GLUE}=require('./sim');const P=parseInt(extra)||8,B=+(process.env.BPB||8),size=+(process.env.BPS||30),r=+(process.env.BPR||1),hold=process.env.BPHOLD!=='0',R=5,K=S.budKit(R),N=K.N;
      const rv=K.tris[0].v,ai=K.anchorSide,stand=v=>{const a=v[ai],b=v[(ai+1)%3],c=v[(ai+2)%3];return [b,a,[a[0]+b[0]-c[0],a[1]+b[1]-c[1]]];};
      const supply={'-?-?-?':B};for(const t of K.types)supply[t]=P;supply[K.types[N-1]]=+(process.env.BPE||5*P);
      const {s,structures}=createWorld({seed,size,structures:[{tris:[...K.tris,{v:stand(rv),type:'w-&-&'}],x:size/2,y:size/2-R*H}],supply,params:{openRange:r}});
      const U=structures[0],Pu=U.slice(0,N),all=[...Array(s.n).keys()],idx=new Map(Pu.map((u,k)=>[canon(s.typeName(u)),k]));
      const bud=new Array(N).fill(-1),tb=new Array(N).fill(0),cp={bud:new Array(N).fill(0),par:new Array(N).fill(0),other:0},ev={stray:0,next:0};
      const ob=s.bind.bind(s);s.bind=(u,i,ku,v,j,kv)=>{const res=ob(u,i,ku,v,j,kv);
        if(s.cpy[v*3+j]){const kb=bud.indexOf(u),kp=Pu.indexOf(u);if(kb>=0)cp.bud[kb]++;else if(kp>=0)cp.par[kp]++;else cp.other++;}
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
        for(;ci<L.length;ci++){const u=L[ci][1];if(hold&&!s.bonded(u)){s.setType(u,'-?-?-?');back(u);}}
        if(eIn<0&&bud[N-2]>=0)eIn=all.filter(u=>!s.bonded(u)&&s.att[u*3]+s.att[u*3+1]+s.att[u*3+2]>0&&idx.get(canon(s.typeName(u)))===N-1&&inside(u)).length;
        if(n()>=shot&&!tc){snap(s,`g${shot}`,`t=${t}: ${n()} of ${N} cells; copies made ${sum(cp.bud)+sum(cp.par)}`,focus(),false);shot+=12;}
        if(!tc&&bud[N-1]>=0){tc=t;snap(s,'done',`t=${t}: the bud is complete (${N} cells)`,focus(),false);
          const x=all.find(u=>s.typeName(u)==='-?-?-?'&&!s.bonded(u)),q=bud[0],e=[0,1,2].find(k=>s.anc[q*3+k]),V=[0,1,2].map(k=>{const z=(k-ai+e+3)%3;return [s.px[q]+s.ox[q*3+z],s.py[q]+s.oy[q*3+z]];});
          s.setType(x,'w-&-&');placeTri(s,x,stand(V));s.regrid(x);ob(q,e,GLUE,x,0,GLUE);}
        if(tc&&!ts&&![0,1,2].some(k=>s.partner(bud[0],k)===Pu[N-1])){ts=t;snap(s,'split',`t=${t}: the catch released the bud's root: split`,focus(),false);}
        if(every(t,10)||ts&&t===ts)console.log(`t=${t} bud cells=${n()}/${N} copies: bud ${sum(cp.bud)} parent ${sum(cp.par)} other ${cp.other}; stray=${ev.stray}`);
        if(ts&&t>=ts)break;}
      if(!tc){snap(s,'end',`t=${s.t}: ${n()} of ${N} cells`,focus(),false);snap(s,'endz',`the junction: the last site lies on the parent's root and opens only into the pair`,{units:[Pu[0],Pu[N-1]],radius:4},true);}
      const w=tb.map((x,k)=>k?x-tb[k-1]:x).filter((x,k)=>bud[k]>=0).sort((a,b)=>a-b),byType=cp.bud.map((c,k)=>c+cp.par[k]),used=n();
      console.log('copies per type (bud cell k, then the parent):',cp.bud.join(' '),'| parent:',cp.par.map((c,k)=>c?`${k}:${c}`:'').filter(Boolean).join(' '));
      console.log('waits by cell:',tb.map((x,k)=>bud[k]<0?'-':k?x-tb[k-1]:x).join(' '));
      console.log(`waits per cell: median ${w[w.length>>1]||0}, max ${w[w.length-1]||0}`);
      console.log(`result: cells=${used}/${N} complete=${tc||'not'} split=${ts||'not'} refilled=${byType.filter((c,k)=>bud[k]>=0&&c>=1).length}/${used} copies=${sum(byType)} min=${Math.min(...byType.filter((c,k)=>bud[k]>=0))} seedsite=${cp.par[N-1]} Einside=${eIn} stray=${ev.stray} next=${ev.next}`);
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
      const pass=k=>{for(let q=0;q<k;q++){s.derive();s.servo();}},hear=()=>Bu.filter(u=>s.op[u]>0).length;
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
      // BUDPX=x: P's anchor on P's top inner wall (beside the doorway) nearest x instead ('b': the bottom wall's middle); with 'c' on the doorway's
      // left edge (-1): the founder hangs under the doorway, so its copies are released at the way into D
      const PX=process.env.BUDPX==='b'?'':process.env.BUDPX||(X.includes('c')?-1:'');let pa=null;for(const u of Pu){const v=tris[U.indexOf(u)].v;for(let i=0;i<3;i++){const m=mid(v,i);if(s.bond[u*3+i]>=0||(PX?m[1]<0:m[1]>0)||S.hexr(m)>RP-0.5)continue;const d=PX?Math.abs(m[0]-PX):Math.abs(m[0]);if(!pa||d<pa.d)pa={u,i,d};}}
      if(PX)console.log('P anchor at',S.hexr(mid(tris[U.indexOf(pa.u)].v,pa.i)).toFixed(2),mid(tris[U.indexOf(pa.u)].v,pa.i).map(x=>x.toFixed(2)).join(','));
      // BUDPF=x: the founder as P's plug: held by its high end z on an anchor Z| on the free side of P's top row nearest x
      // (at the left edge of P's half it lies in P's row, faces into P), instead of W| holding its low end
      // BUDAG=Z: D's catching anchor takes a strand's high end z (glue Z@|; also in the dry-run) instead of its low end.
      // BUDPFE=w: BUDPF holds the founder's low end w (anchor W|) instead. BUDLX=x: the doorway bond is the P-D contact nearest x
      // (default: the leftmost)
      let fe='w';if(process.env.BUDPF){const x0=+process.env.BUDPF;pa=null;for(const u of Pu){const v=tris[U.indexOf(u)].v;for(let i=0;i<3;i++){const m=mid(v,i);if(s.bond[u*3+i]>=0||m[1]<(RP-1)*H||m[1]>RP*H-0.1)continue;const d=Math.abs(m[0]-x0)+Math.abs(m[1]-(RP-0.5)*H);if(!pa||d<pa.d)pa={u,i,d};}}
        fe=process.env.BUDPFE||'z';console.log(`P anchor ${fe.toUpperCase()}| (founder's ${fe==='z'?'high':'low'} end) on P cell ${U.indexOf(pa.u)} side ${pa.i} at`,mid(tris[U.indexOf(pa.u)].v,pa.i).map(x=>x.toFixed(2)).join(','));}
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
      // the founder starts held by P's anchor (placed where the anchor puts a strand; labelled)
      {const b=F.find(u=>{const r=s.roles(u);return r.inert>=0&&s.glue[u*3+r.inert]===gc(fe);}),f=s.roles(b).inert,md=s.moveDepth;s.moveDepth=()=>0;const ok=s._snapBody(b,f,pa.u,pa.i);s.moveDepth=md;
        if(!ok)throw Error('budpore: founder not placed');s.bind(pa.u,pa.i,GLUE,b,f,GLUE);
        const {triDepth}=require('./physics'),A=new Float64Array(6),B=new Float64Array(6);for(const u of F)for(const v of U){const dx=s._dx(s.px[v]-s.px[u]),dy=s._dy(s.py[v]-s.py[u]);if(dx*dx+dy*dy>1.4)continue;
          for(let q=0;q<3;q++){A[2*q]=s.ox[u*3+q];A[2*q+1]=s.oy[u*3+q];B[2*q]=dx+s.ox[v*3+q];B[2*q+1]=dy+s.oy[v*3+q];}if(triDepth(A,B)>1e-6)throw Error('budpore: founder overlaps the wall');}}
      spendableSides(s,U);for(let k=0;k<60;k++)s.derive();
      // the walls start spent (one completion pass while only A hears its own signal; spent sides stay spent), then the
      // open range grows to reach P's side of the doorway bond, which becomes a completion-release bond ('&' both sides)
      const dMax=Math.max(...(BA?more:[best]).map(k=>k.d));s._latches();s.p.openRange=dMax+3;for(let k=0;k<dMax+4;k++)s.derive();s.done[pick.L*3+pick.j]=1;
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
      console.log(`budpore: completion-release doorway bond on D cell ${U.indexOf(pick.L)}, anchor W@| on D cell ${U.indexOf(da.u)} (${best.d} bonds), openRange ${s.p.openRange}`);
      snap(s,'t0',`t=0: parent P (founder on its anchor${NI?`, ${NI} copy blanks`:''}) and bud D joined by one completion-release bond; ${nb} copy blanks outside`,{units:U,radius:14},false);
      for(let t=1;t<=steps;t++){s.step();if(every(t,40))report(t);if(every(t,+process.env.BUDF||4))snap(s,`t${t}`,`t=${t}: ${split?'split at '+split+', the bud':'joined'}`,split?{units:Du,radius:9}:{units:Pu,radius:16},false);}
      report(steps);const L=where(),[gn,w]=tally();
      console.log(`result: ${split?'split at '+split+' with '+bSplit+' blanks left':'not split'}, strands in D at the split ${atSplit?nIn(atSplit,'D'):0}, at the end ${nIn(L,'D')}, copy releases in D after the split ${relD}, on the bud's anchored strand ${relA} (copies ${Math.floor(relA/4)}); before the split on D's anchored strand ${relJ}; in P ${nIn(L,'P')}; copies ${s.ev.copy||0}: genome ${gn}, wall ${w}`);
      {const {comp,members}=s.bodies();snap(s,'zoom','the bud at the end',{units:members[comp[Du[0]]],radius:8},false);}
      finish('Bud pair on copies: the bud catches a copy mid-wall by its low end and splits off with food left; frames then follow the bud');},
    // budgrow: the bud grows instead of being prepared (structures.grownBud). The parent P (prepared, labelled: ring of
    // side 7 with a pulse door beside its seed side, a stamp pocket casting the bud's cap part from blanks, blanks xxx
    // inside) and the bud's kit parts outside (every bud cell its own type; extra: copies per type, default 4). The bud
    // ring D (side 5) grows from P's seed: while a wall site is open the lock signal holds both doors shut; when D's last
    // cell arrives both open, cap parts cast in P come through the doorway and grow D's two-cell cap; when nothing is
    // open, D's seed bond is cut, the lock signal returns, both doors swing shut and D leaves. extra 'g' (genome, as
    // split g): instead of the cap, D's wall front carries an anchor Z@| (grownBud anchorGlue) and P holds the founder
    // aaaa on its anchor W| with a pocket casting its dockers Ay.z (40 blanks, 24 fills Y--); once the doorway is open
    // a copy AAAA drifts into D, its high end z is caught, nothing is open any more and D splits off with it
    budgrow(){steps=steps||400000;const gen=String(extra||'').includes('g'),per=parseInt(extra)||4,size=32,c=size/2,cy=c-5,RP=7,RD=5,g=S.grownBud(gen?{RP,RD,seed:'v',capGlue:null,anchorGlue:'Z',avoid:'ayw'}:{RP,RD}),dcy=cy+(RP+RD)*H;
      const P=g.P,Pt=P.map(x=>g.tris[x]),kit={};for(const t of g.kit)kit[t]=(kit[t]||0)+per;kit[g.rootType]=per;
      // genome variant: the wall front's cells up to the anchor get three times the supply (the anchor's open signal holds
      // the pair; if the 7-cell panel front completes first, nothing is open and the root lets go: a race, as kitRace)
      if(gen)for(const x of g.frontB.slice(0,g.anchor[2]+1))kit[g.tris[x].type]+=2*per;
      const pocket={tris:S.lidPocket(S.stampInstr(gen?'Ay.z':g.cap.type),'X'),x:c-0.5,y:cy-2.5,rot:0};
      const {s,structures,founders}=createWorld({seed,size,founders:gen?[{gaps:[1,1,1],faces:'aaaa',ends:'w-',x:c,y:cy+3}]:[],structures:[{tris:Pt,x:c,y:cy},pocket],supply:{xxx:gen?40:30,...(gen?{'Y--':24}:{}),...kit},params:{lockRange:120}});
      const U=structures[0],PK=structures[1],F=gen?founders[0]:[];
      // genome variant (as split g): P's anchor W| holds the founder aaaa by its low end w (placed there at t=0, labelled);
      // the pocket casts its dockers Ay.z (copies AAAA expose seed z at their high end), Y-- are their fills;
      // the bud's anchor Z@| (grownBud anchorGlue) emits the open signal until it catches a copy's z, then nothing is
      // open and the bud splits off with it. P's anchor: a plain inner side in the middle of a flat wall (the founder
      // stands into P), the farthest from the pocket and the parent's door
      if(gen){const {gcode:gc,GLUE}=require('./sim'),cen3=V=>[(V[0][0]+V[1][0]+V[2][0])/3,(V[0][1]+V[1][1]+V[2][1])/3],busy=new Set([...g.panelP,g.doors[0].hinge,g.S]);
        const far=[...pocket.tris.map(t=>cen3(t.v.map(p=>[p[0]+pocket.x-c,p[1]+pocket.y-cy]))),...g.panelP.map(x=>cen3(g.tris[x].v))],inC=[...Array(6).keys()].map(i=>[(RP-1)*Math.cos(i*Math.PI/3),(RP-1)*Math.sin(i*Math.PI/3)]);let pa=null;
        for(const x of g.P){if(busy.has(x))continue;const V=g.tris[x].v;for(let i=0;i<3;i++){if(s.bond[U[x]*3+i]>=0||s.glue[U[x]*3+i])continue;const m=[(V[i][0]+V[(i+1)%3][0])/2,(V[i][1]+V[(i+1)%3][1])/2];
          if(S.hexr(m)>RP-0.5||inC.some(q=>Math.hypot(q[0]-m[0],q[1]-m[1])<1.5-1e-6))continue;const o=cen3(V),l=Math.hypot(m[0]-o[0],m[1]-o[1]),z=[m[0]+2*(m[0]-o[0])/l,m[1]+2*(m[1]-o[1])/l],d=Math.min(...far.map(q=>Math.hypot(q[0]-z[0],q[1]-z[1])));
          if(!pa||d>pa.d)pa={u:U[x],i,d};}}
        if(!pa)throw Error('budgrow: no place for the parent anchor');s.glue[pa.u*3+pa.i]=gc('W');s.anc[pa.u*3+pa.i]=1;for(let k=0;k<40;k++)s.derive();
        const b=F.find(u=>{const r=s.roles(u);return r.inert>=0&&s.glue[u*3+r.inert]===gc('w');}),f=s.roles(b).inert,md=s.moveDepth;s.moveDepth=()=>0;const ok=s._snapBody(b,f,pa.u,pa.i);s.moveDepth=md;
        if(!ok)throw Error('budgrow: founder not placed');s.bind(pa.u,pa.i,GLUE,b,f,GLUE);
        const {triDepth}=require('./physics'),A=new Float64Array(6),B=new Float64Array(6);for(const u of F)for(const v of [...U,...PK]){const dx=s._dx(s.px[v]-s.px[u]),dy=s._dy(s.py[v]-s.py[u]);if(dx*dx+dy*dy>1.4)continue;
          for(let q=0;q<3;q++){A[2*q]=s.ox[u*3+q];A[2*q+1]=s.oy[u*3+q];B[2*q]=dx+s.ox[v*3+q];B[2*q+1]=dy+s.oy[v*3+q];}if(triDepth(A,B)>1e-6)throw Error('budgrow: founder overlaps the parent');}}
      const prep=new Set([...U,...PK,...F]),free=[...Array(s.n).keys()].filter(u=>!prep.has(u)),placed=[...prep];
      // prepared parts must not meet the parent's door sweep
      {const {triDepth}=require('./physics'),d=g.doors[0],tr=p=>[p[0]+c,p[1]+cy],pin=tr(d.pin),flat=V=>Float64Array.from(V.flat());
        const pk=pocket.tris.map(t=>t.v.map(p=>[p[0]+pocket.x,p[1]+pocket.y]));if(!S.sweepClear(d.panel.map(x=>g.tris[x].v.map(tr)),pk,pin,d.dir,d.ang))throw Error('budgrow: the pocket is in the door sweep');void triDepth;void flat;}
      // blanks inside P; kit parts outside both rings (D's place included)
      free.forEach(u=>{const inP=typeName(s,u)==='xxx'||typeName(s,u)==='Y--';if(!placeFree(s,u,placed,()=>{for(;;){if(inP){const x=(2*s.rng()-1)*RP,y=(2*s.rng()-1)*RP;if(S.hexr([x,y])<RP-1.6)return [c+x,cy+y];continue;}
        const x=size*s.rng(),y=size*s.rng();if(S.hexr([s._dx(x-c),s._dy(y-cy)])>RP+0.6&&S.hexr([s._dx(x-c),s._dy(y-dcy)])>RD+0.6)return [x,y];}},50000))throw Error('place');placed.push(u);});
      const norm=t=>{const z=new TriSim({},1);z.setType(0,t);return canon(z.typeName(0));},kitT=new Set([...g.kit,g.rootType].map(norm)),capT=norm(gen?'Ay.z':g.cap.type),aT=gen?norm(g.tris[g.anchor[0]].type):null;
      // genome variant: the bud's anchor cell (in body dU) holds a strand
      const held=dU=>dU.some(u=>norm(typeName(s,u))===aT&&[0,1,2].some(i=>s.anc[u*3+i]&&s.bond[u*3+i]>=0));
      const Su=U[g.S],flap=(f,p)=>{const i=[0,1,2].find(i=>s.bond[f*3+i]>=0&&((s.bond[f*3+i]/3)|0)===p);if(i===undefined)return NaN;return Math.abs(Math.atan2(Math.sin(s.angle(f)-s.angle(p)-s.hRel[f*3+i]),Math.cos(s.angle(f)-s.angle(p)-s.hRel[f*3+i]))*180/Math.PI);};
      // the bud's root and its panel's hinge cell (whichever kit copies became them)
      const rootT=norm(g.rootType),p1T=norm(g.tris[g.panelD[0]].type),qT=norm(g.tris[g.q].type);
      let closed=0,opened=0,split=0,early=0;const ctr=L=>{let x=0,y=0;for(const u of L){x+=s._dx(s.px[u]-s.px[L[0]]);y+=s._dy(s.py[u]-s.py[L[0]]);}return [s.px[L[0]]+x/L.length,s.py[L[0]]+y/L.length];};
      const report=t=>{const {comp,members}=s.bodies(),root=rootU>=0?rootU:undefined;
        const dc=root!==undefined?comp[root]:-1,dU=dc>=0?members[dc]:[],cells=dU.filter(u=>kitT.has(norm(typeName(s,u)))).length,q=dU.find(u=>norm(typeName(s,u))===qT),p1=dU.find(u=>norm(typeName(s,u))===p1T);
        const aP=flap(U[g.panelP[0]],U[g.doors[0].hinge]),aD=p1!==undefined&&root!==undefined?flap(p1,root):NaN,cap=dU.filter(u=>norm(typeName(s,u))===capT).length;
        if(!closed&&q!==undefined)closed=t;if(!opened&&aP>20)opened=t;if(!closed&&aP>20)early=t;if(!split&&root!==undefined&&dc!==comp[Su]&&cells>=g.D.length-1)split=t;
        const dK=dU.filter(u=>kitT.has(norm(typeName(s,u)))),inD=dK.length>=g.D.length-1?(()=>{const [x,y]=ctr(dK);return u=>Math.hypot(s._dx(s.px[u]-x),s._dy(s.py[u]-y))<(RD-1)*H;})():()=>false;
        const parts=free.filter(u=>!s.bonded(u)&&norm(typeName(s,u))===capT);
        console.log(`t=${t} bud cells=${cells}/${g.D.length} ${closed?'closed at '+closed:'open'} doors P:${(aP|0)} D:${isNaN(aD)?'-':aD|0} deg${early?' EARLY at '+early:''} casts=${s.ev.cast||0} free cap parts=${parts.length} (in D ${parts.filter(inD).length}) ${gen?(held(dU)?'copy anchored in D':'no copy in D')+` strands ${census(s).filter(x=>x.n>=7).length}`:`cap=${cap}/${g.cap.slots.length}`} ${split?'SPLIT at '+split:'joined'} doors after split: ${split?(aP<5&&aD<5?'shut':'open'):'-'} kit parts in D=${free.filter(u=>!s.bonded(u)&&kitT.has(norm(typeName(s,u)))&&inD(u)).length} completions=${s.ev.complete||0}`);};
      console.log('bud kit',g.kit.length+1,'types x',per,gen?'anchor on wall front cell '+(g.anchor[2]+1):'cap part '+g.cap.type,'doors',g.doors.map(d=>d.ang+'deg').join(' '));
      snap(s,'t0',gen?'t=0: parent P (seed on its top wall, door, founder aaaa on its anchor, pocket casting its dockers, blanks); the bud kit outside':'t=0: parent P (seed on its top wall, door, stamp pocket, blanks); the bud kit outside',{units:U,radius:15});
      // events (every 50 steps): the bud's last cell q bonded (ring closed), the doors' widest opening before and after,
      // each cap cell, the split
      const ev={closed:0,open:0,caps:[],split:0,early:0,maxBefore:0,anch:0,lost:[]};let rootU=-1;const seedI=[0,1,2].find(i=>s.glue[Su*3+i]&&s.ltc[Su*3+i]);
      const watch=t=>{const r=s.partner(Su,seedI);if(r>=0&&!ev.split)rootU=r;if(rootU<0)return;const {comp,members}=s.bodies(),dU=members[comp[rootU]];
        if(!ev.closed&&dU.some(u=>norm(typeName(s,u))===qT))ev.closed=t;const aP=flap(U[g.panelP[0]],U[g.doors[0].hinge]);
        if(!ev.closed)ev.maxBefore=Math.max(ev.maxBefore,aP|0);else if(!ev.open&&aP>30)ev.open=t;
        const cap=dU.filter(u=>norm(typeName(s,u))===capT).length;while(ev.caps.length<cap)ev.caps.push(t);if(gen&&!ev.anch&&held(dU))ev.anch=t;if(!ev.split&&comp[rootU]!==comp[Su]){if(ev.closed)ev.split=t;else{ev.lost.push(t);rootU=-1;}}};
      for(let t=1;t<=steps;t++){s.step();if(t%50===0)watch(t);if(every(t,30))report(t);if(every(t,6))snap(s,`t${t}`,`t=${t}`,{units:U,radius:15},false);}
      console.log(`events: ring closed at ${ev.closed||'-'}, parent door widest before that ${ev.maxBefore} deg, doors open at ${ev.open||'-'}, ${gen?`copy anchored in D at ${ev.anch||'-'}`:`cap cells at ${ev.caps.join(' ')||'-'}`}, split at ${ev.split||'-'}, early releases at ${ev.lost.join(' ')||'-'}`);
      // end of run: each bud cell missing from the root's body (panel, wall front position, last cell q), whether its
      // predecessor is there, and where the copies of its type are (free near the bud, free elsewhere, bonded elsewhere)
      {const {comp,members}=s.bodies(),r=rootU>=0?rootU:undefined;
        if(r!==undefined){const have=new Set(members[comp[r]].map(u=>norm(typeName(s,u)))),order=[g.root,...g.panelD,...g.frontB],pred=c=>{const i=g.panelD.indexOf(c);if(i>=0)return i?g.panelD[i-1]:g.root;const j=g.frontB.indexOf(c);return j?g.frontB[j-1]:g.root;};
          const miss=order.filter(c=>!have.has(norm(g.tris[c].type))),[x,y]=ctr(members[comp[r]].filter(u=>kitT.has(norm(typeName(s,u)))));
          console.log(`bud: ${order.length-miss.length}/${order.length} cells; missing:`);
          for(const c of miss){const name=g.panelD.includes(c)?'panel '+(g.panelD.indexOf(c)+1):c===g.q?'last cell q':'wall '+(g.frontB.indexOf(c)+1),T=norm(g.tris[c].type),where={};
            for(let u=0;u<s.n;u++){if(norm(typeName(s,u))!==T)continue;const k=s.bonded(u)?'bonded elsewhere':Math.hypot(s._dx(s.px[u]-x),s._dy(s.py[u]-y))<RD*H?'free inside the bud':'free outside';where[k]=(where[k]||0)+1;}
            console.log(`  ${name} ${g.tris[c].type}: predecessor ${have.has(norm(g.tris[pred(c)].type))?'there':'missing'}, copies ${JSON.stringify(where)}`);}
          snap(s,'zoom','the bud',{units:members[comp[r]],radius:7});}}
      finish(gen?'Grown bud catches a genome copy: the bud ring grows on the parent; its closing opens the doorway; its anchor catches a copy of the parent\'s genome; it splits off sealed':'Grown bud: the bud ring grows on the parent; its closing opens the doorway; the parent feeds its cap; it splits off sealed');},
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
    // selective import: a ring whose revolving door carries blanks (xxx) inside and drops them; junk (---) stays out
    // except what slips through while the door is open (extra: blanks outside, default 12)
    import(){steps=steps||20000;const nb=parseInt(extra)||12,size=18,c=size/2,{tris,R,door}=S.importRing(4,'X');
      const {s,structures}=createWorld({seed,size,structures:[{tris,x:c,y:c}],supply:{xxx:nb,'---':24}});
      const U=structures[0],ring=new Set(U),free=[...Array(s.n).keys()].filter(u=>!ring.has(u)),placed=[...U],inner=(R-1)*H-0.3,outer=R+0.3;
      const centre=()=>{let x=0,y=0;for(const u of U){x+=s._dx(s.px[u]-s.px[U[0]]);y+=s._dy(s.py[u]-s.py[U[0]]);}return [s.px[U[0]]+x/U.length,s.py[U[0]]+y/U.length];};
      free.forEach(u=>{if(!placeFree(s,u,placed,()=>{const a=2*Math.PI*s.rng(),r=outer+0.6+(size/2-outer-1)*s.rng();return [c+r*Math.cos(a),c+r*Math.sin(a)];}))throw Error('place');placed.push(u);});
      const inside=t=>{const [x,y]=centre();return free.filter(u=>typeName(s,u)===t&&Math.hypot(s._dx(s.px[u]-x),s._dy(s.py[u]-y))<inner).length;};
      const focus={units:U,radius:R+1.5};snap(s,'t0','t=0: blanks xxx and junk outside',focus);
      for(let t=1;t<=steps;t++){s.step();if(every(t,10))console.log(`t=${t} inside: xxx=${inside('xxx')} junk=${inside('---')} catches=${s.ev.glue||0} drops=${s.ev.drop||0} stalls=${s.ev.stall||0}`);
        if(every(t,3))snap(s,`t${t}`,`t=${t}: inside xxx ${inside('xxx')}, junk ${inside('---')}`,focus);}
      finish('Selective import: a revolving door carries blanks in');},
    // protocell: an import ring (R=7) whose door carries blanks xxx in; inside (labelled start) the chain aaaaa and two
    // lid pockets that cast blanks into its dockers A-- and a--; outside blanks and junk. extra: 'none' = no pockets
    cell(){steps=steps||40000;const size=30,c=size/2,{tris,R}=S.importRing(7,'X'),pk=extra!=='none';   // layout found by a search (no overlaps, slots and dock sites free, clear of the door's sweep)
      const pockets=pk?[{tris:S.lidPocket('-A-','X'),x:c-1.537,y:c+2.156,rot:Math.PI},{tris:S.lidPocket('-a-','X'),x:c+1.353,y:c+4.116,rot:4*Math.PI/3}]:[];
      const {s,structures,founders}=createWorld({seed,size,founders:[{gaps:[1,1,1,1],faces:'aaaaa',x:c+1.053,y:c-1.051}],structures:[{tris,x:c,y:c},...pockets],supply:{xxx:50,'---':30},params:{pLoose:0.05}});
      // check: prepared structures do not overlap
      {const {triDepth}=require('./physics');const U=[...founders[0],...structures.flat()],A=new Float64Array(6),B=new Float64Array(6);
        for(const u of U)for(const v of U){if(v<=u)continue;const dx=s._dx(s.px[v]-s.px[u]),dy=s._dy(s.py[v]-s.py[u]);if(dx*dx+dy*dy>1.4)continue;
          for(let q=0;q<3;q++){A[2*q]=s.ox[u*3+q];A[2*q+1]=s.oy[u*3+q];B[2*q]=dx+s.ox[v*3+q];B[2*q+1]=dy+s.oy[v*3+q];}if(triDepth(A,B)>1e-6){if(process.env.LAYOUT)console.log('overlap',u,v);else throw Error('protocell: prepared parts overlap '+u+' '+v);}}}
      // free triangles start outside the ring
      const ring=structures[0],inside=new Set([...founders[0],...structures.flat()]),free=[...Array(s.n).keys()].filter(u=>!inside.has(u)),placed=[...inside],outer=R+0.3;
      free.forEach(u=>{if(!placeFree(s,u,placed,()=>{const a=2*Math.PI*s.rng(),r=outer+0.6+(size/2-outer-1)*s.rng();return [c+r*Math.cos(a),c+r*Math.sin(a)];}))throw Error('place');placed.push(u);});
      const centre=()=>{let x=0,y=0;for(const u of ring){x+=s._dx(s.px[u]-s.px[ring[0]]);y+=s._dy(s.py[u]-s.py[ring[0]]);}return [s.px[ring[0]]+x/ring.length,s.py[ring[0]]+y/ring.length];};
      const isIn=u=>{const [x,y]=centre();return Math.hypot(s._dx(s.px[u]-x),s._dy(s.py[u]-y))<(R-1)*H-0.3;};
      const report=t=>{const tc={};for(let u=0;u<s.n;u++){if(inside.has(u))continue;const k=canon(typeName(s,u))+(isIn(u)?'@in':'@out');tc[k]=(tc[k]||0)+1;}
        const cs=census(s).filter(q=>q.n>=9&&!q.paired);
        console.log(`t=${t} strands [${cs.map(q=>q.faces).join(' ')}] casts=${s.ev.cast||0} imports=${s.ev.drop||0} docks=${s.ev.dock||0} in: xxx=${tc['xxx@in']||0} junk=${tc['---@in']||0} A--=${tc[canon('A--')+'@in']||0} a--=${tc[canon('a--')+'@in']||0} out: A--=${tc[canon('A--')+'@out']||0} a--=${tc[canon('a--')+'@out']||0}`);};
      const focus={units:ring,radius:R+1.2};snap(s,'t0','t=0: protocell (prepared inside), blanks outside',focus);
      for(let t=1;t<=steps;t++){s.step();if(every(t,20))report(t);if(every(t,3))snap(s,`t${t}`,`t=${t}: casts ${s.ev.cast||0}`,focus);}
      finish('Protocell: the membrane imports blanks, pockets inside cast them into dockers, the chain copies inside');},
    // budding: a parent ring (prepared) exposes seed z on one outer face; a daughter ring grows from it (periodic ring
    // kit), and when it closes, its root's closure (a trigger) releases its seed latch: the daughter lets go and the
    // seed is free for the next one (extra: motif copies, 14)
    bud(){steps=steps||40000;const per=parseInt(extra)||14,size=20,c=size/2,K=S.ringKit(3,'z',null,true),P=S.ringKit(3,'q').tris.map(t=>t.v);
      // the seed sits at the tip of a three-cell stalk (parent cell 0, side 1; then sides 1, 2; seed on the tip's side 1),
      // found by a search: the daughter's closing gap (always next to its root) stays 2.5 away from the parent
      const mir=(V,i)=>{const a=V[i],b=V[(i+1)%3],c=V[(i+2)%3];return [b,a,[a[0]+b[0]-c[0],a[1]+b[1]-c[1]]];};
      const parent=P.map(v=>({v,type:'---'})),s1=mir(P[0],1),s2=mir(s1,1),s3=mir(s2,2);parent.push({v:s1,type:'---'},{v:s2,type:'---'},{v:s3,type:'-z-'});
      const supply={[K.tris[0].type]:6};for(const t of K.kit)supply[t]=(supply[t]||0)+per;
      const {s,structures}=createWorld({seed,size,structures:[{tris:parent,x:c-3,y:c}],supply});const PU=new Set(structures[0]);
      const tmp=new TriSim({},1),norm=t=>{tmp.setType(0,t);return canon(tmp.typeName(0));},rootT=norm(K.tris[0].type),motif=new Set(K.kit.map(norm));
      const report=t=>{const {comp,members}=s.bodies(),pc=comp[structures[0][0]];let att=0,free=[];for(const m of members){const kit=m.filter(u=>!PU.has(u)&&(motif.has(norm(typeName(s,u)))||norm(typeName(s,u))===rootT)).length;
          if(comp[m[0]]===pc)att+=kit;else if(kit>=10)free.push(kit);}
        console.log(`t=${t} on parent=${att} released rings [${free.join(' ')}] closures=${s.ev.closeGlue||0} completions=${s.ev.complete||0}`);};
      snap(s,'t0','t=0: parent ring with seed z, daughter kit in supply',null,false);
      for(let t=1;t<=steps;t++){s.step();if(every(t,20))report(t);if(every(t,4))snap(s,`t${t}`,`t=${t}: buds released ${s.ev.complete||0}`,null,false);}
      finish('Budding: a daughter ring grows on the parent and lets go when it closes');},
    // encapsulation: a chain whose low end carries seed z grows a membrane ring (periodic kit, R=6, root facing inward)
    // around itself; when the ring closes, the root lets go of the seed: the chain is free inside its own compartment
    // (extra: motif copies, 8)
    wrap(){steps=steps||100000;const per=parseInt(extra)||12,size=26,c=size/2,K=S.ringKit(6,'z',null,true,false,true);
      const supply={[K.tris[0].type]:4};for(const t of K.kit)supply[t]=(supply[t]||0)+per;
      const {s,founders}=createWorld({seed,size,founders:[{gaps:[1,1,1,1],faces:'aaaaa',ends:'z-',x:c,y:c}],supply});const F=founders[0];
      const tmp=new TriSim({},1),norm=t=>{tmp.setType(0,t);return canon(tmp.typeName(0));},kitT=new Set([...K.kit,K.tris[0].type].map(norm));
      const report=t=>{const {comp,members}=s.bodies(),fc=comp[F[0]];let on=0,rings=[];for(const m of members){const k=m.filter(u=>kitT.has(norm(typeName(s,u)))).length;if(comp[m[0]]===fc)on+=k;else if(k>=30)rings.push(m);}
        // is the chain inside a released ring? (centre of the ring within its inner apothem of the chain's centre)
        const inside=rings.map(m=>{let x=0,y=0;for(const u of m){x+=s._dx(s.px[u]-s.px[m[0]]);y+=s._dy(s.py[u]-s.py[m[0]]);}x=s.px[m[0]]+x/m.length;y=s.py[m[0]]+y/m.length;
          return Math.hypot(s._dx(s.px[F[4]]-x),s._dy(s.py[F[4]]-y))<5*H?'chain inside':'chain outside';});
        console.log(`t=${t} ring cells on the chain=${on}/${K.tris.length} released rings ${rings.length} [${inside.join(', ')}] completions=${s.ev.complete||0}`);};
      snap(s,'t0','t=0: chain with seed z, membrane kit in supply',null,false);
      for(let t=1;t<=steps;t++){s.step();if(every(t,20))report(t);if(every(t,4))snap(s,`t${t}`,`t=${t}`,null,false);}
      {const {comp}=s.bodies();snap(s,'zoom','the chain and its membrane',{units:[...Array(s.n).keys()].filter(u=>kitT.has(norm(typeName(s,u)))||F.includes(u)),radius:7.5});}
      finish('Encapsulation: a chain grows a membrane around itself and is released inside');},
    // living membrane: a chain whose low end carries seed z grows a membrane with its own import door (door ring kit:
    // motif front + wall cell + latched door panel with key X; the motif closes onto the panel's hinge); the closed ring
    // lets go of the chain; blanks xxx bind the key and are carried in, junk stays out (extra: RxM, ring R, M kit copies
    // per cell; default 6x2: with 3 the leftover kit parts trapped inside the closed ring jammed the door's swing in 2 of
    // 4 worlds; RxMp: a pore instead of a door, the panel opens once the ring is closed and stays open)
    live(){steps=steps||150000;const pore=(extra||'').endsWith('p'),[R,mult]=(extra||'6x2').replace('p','').split('x').map(Number),size=R*2+14,c=size/2,K=S.doorRingKit(R,'z','X',4,'',pore?3:1,true,pore);
      const supply={[K.rootType]:2,xxx:16,'---':16};for(const [t,m] of Object.entries(K.counts))supply[t]=(supply[t]||0)+(mult||2)*m;
      const {s,founders}=createWorld({seed,size,founders:[{gaps:[1,1,1,1],faces:'aaaaa',ends:'z-',x:c,y:c}],supply});const F=founders[0];
      const tmp=new TriSim({},1),norm=t=>{tmp.setType(0,t);return canon(tmp.typeName(0));},kitT=new Set([...Object.keys(K.counts),K.rootType].map(norm));
      const isKit=u=>kitT.has(norm(typeName(s,u)));
      const report=t=>{const {comp,members}=s.bodies(),fc=comp[F[0]];let on=0,rings=[];for(const m of members){const k=m.filter(isKit).length;if(comp[m[0]]===fc)on+=k;else if(k>=K.N-1)rings.push(m);}
        const cen=m=>{let x=0,y=0;for(const u of m){x+=s._dx(s.px[u]-s.px[m[0]]);y+=s._dy(s.py[u]-s.py[m[0]]);}return [s.px[m[0]]+x/m.length,s.py[m[0]]+y/m.length];};
        const inside=(m,ty)=>{const [x,y]=cen(m.filter(isKit));let k=0;for(let u=0;u<s.n;u++)if(typeName(s,u)===ty&&!s.bonded(u)&&Math.hypot(s._dx(s.px[u]-x),s._dy(s.py[u]-y))<(R-1)*H-0.3)k++;return k;};
        const chainIn=m=>{const [x,y]=cen(m.filter(isKit));return Math.hypot(s._dx(s.px[F[4]]-x),s._dy(s.py[F[4]]-y))<(R-1)*H;};
        console.log(`t=${t} ring cells on the chain=${on} closed rings ${rings.length} [${rings.map(m=>`chain ${chainIn(m)?'in':'out'}, xxx in ${inside(m,'xxx')}, junk in ${inside(m,'---')}`).join('; ')}] completions=${s.ev.complete||0} unlatch=${s.ev.unlatch||0} drops=${s.ev.drop||0} stalls=${s.ev.stall||0}`);};
      snap(s,'t0','t=0: chain with seed z; door membrane kit, blanks xxx, junk',null,false);
      for(let t=1;t<=steps;t++){s.step();if(every(t,30))report(t);if(every(t,4))snap(s,`t${t}`,`t=${t}: imports ${s.ev.drop||0}`,null,false);}
      snap(s,'zoom','the cell',{units:[...Array(s.n).keys()].filter(u=>isKit(u)&&s.bonded(u)),radius:R+1.5});
      finish('Living membrane: a chain grows a membrane with an import door; blanks come in');},
    // grown protocell: chain aaaaa with membrane seed z (low end) and pocket seed y (high end). From the supply it grows a
    // membrane with an import door (door ring kit, R=7) and a lid pocket that casts blanks xxx into dockers A--; blanks
    // come in through the door, the pocket casts them, the chain copies inside its own membrane (extra: membrane kit copies per
    // cell, 4; the pocket kit gets 4 times as many per type, so it usually completes before the membrane closes)
    grown(){steps=steps||200000;const R=7,mult=parseInt(extra)||4,size=30,c=size/2,KR=S.doorRingKit(R,'z','X',4,'a');
      const founder={gaps:[1,1,1,1],faces:'aaaaa',ends:'zy',x:c,y:c};
      // plan (read-only): a pocket kit option whose cells lie inside the membrane, clear of its wall and the chain's dock sites
      const probe=createWorld({seed,size,founders:[founder]}),U0=probe.founders[0],ring=partPlacement(probe.s,U0,U0[0],KR);
      const cen=v=>[(v[0][0]+v[1][0]+v[2][0])/3,(v[0][1]+v[1][1]+v[2][1])/3],dist=(a,b)=>{const p=cen(a),q=cen(b);return Math.hypot(p[0]-q[0],p[1]-q[1]);};
      const KP=S.kitOptions(S.lidPocket('-A-','X'),'xaz'+KR.letters,'y',[S.lidSlot('B')]).find(k=>{const pp=partPlacement(probe.s,U0,U0[U0.length-1],k,S.lidClear());
        return pp.ok&&pp.cells.every(v=>ring.cells.every(w=>dist(v,w)>1.1));});
      if(!ring.ok||!KP)throw Error('grown: no layout');console.log('membrane root',KR.rootType,'pocket root',KP.root,'side',KP.rootSide,'risk',KP.risk);
      const supply={[KR.rootType]:6,[KP.types[KP.root]]:2,xxx:40,'---':10};
      for(const [t,m] of Object.entries(KR.counts))supply[t]=(supply[t]||0)+mult*m;for(const t of KP.kit)supply[t]=(supply[t]||0)+4*mult;
      // race cells (structures.kitRace: the lid and the cell beside the slot can be closed off by a later cell): three times the
      // supply; membrane roots 6 (with 2 the faster pocket went live before any root had attached in 2 of 4 worlds)
      for(const x of S.kitRace(KP,[S.lidSlot('B')]))supply[KP.types[x]]+=8*mult;
      const {s,founders}=createWorld({seed,size,founders:[founder],supply,params:{pLoose:0.05}});const F=founders[0];
      const tmp=new TriSim({},1),norm=t=>{tmp.setType(0,t);return canon(tmp.typeName(0));},memT=new Set([...Object.keys(KR.counts),KR.rootType].map(norm));
      const isMem=u=>memT.has(norm(typeName(s,u))),A=canon('A--'),pocT=new Set(KP.types.map(norm));
      const report=t=>{const {comp,members}=s.bodies(),fc=comp[F[0]];let on=0,mem=null;for(const m of members){const k=m.filter(isMem).length;if(comp[m[0]]===fc)on+=k;else if(k>=KR.N-1)mem=m;}
        let inn=null;if(mem){const M=mem.filter(isMem);let x=0,y=0;for(const u of M){x+=s._dx(s.px[u]-s.px[M[0]]);y+=s._dy(s.py[u]-s.py[M[0]]);}x=s.px[M[0]]+x/M.length;y=s.py[M[0]]+y/M.length;
          inn=u=>Math.hypot(s._dx(s.px[u]-x),s._dy(s.py[u]-y))<(R-1)*H-0.3;}
        const cnt=(ty,where)=>{let k=0;for(let u=0;u<s.n;u++)if(canon(typeName(s,u))===ty&&(where==='in'?inn&&inn(u):!(inn&&inn(u))))k++;return k;};
        const cs=census(s).filter(q=>q.n>=7);
        const pk=members[fc].filter(u=>pocT.has(norm(typeName(s,u)))).length;
        console.log(`t=${t} membrane ${mem?'closed':on+'/'+KR.N} pocket ${pk}/${KP.types.length} strands [${cs.map(q=>q.faces+(q.paired?'*':'')+(inn?inn(q.units[4])?'(in)':'(out)':'')).join(' ')}] casts=${s.ev.cast||0} docks=${s.ev.dock||0} imports=${s.ev.drop||0} in: xxx=${inn?cnt('xxx','in'):'-'} A--=${inn?cnt(A,'in'):'-'} out: A--=${cnt(A,'out')}`);};
      snap(s,'t0','t=0: chain aaaaa with seeds z and y; membrane and pocket kits, blanks, junk',null,false);
      for(let t=1;t<=steps;t++){s.step();if(every(t,50))report(t);if(every(t,4))snap(s,`t${t}`,`t=${t}: casts ${s.ev.cast||0}, imports ${s.ev.drop||0}`,null,false);}
      snap(s,'zoom','the grown cell',{units:F,radius:R+1.5});
      finish('Grown protocell: a chain grows its membrane with a door and a casting pocket, imports blanks and copies inside');},
    // heritable cells: chain aaaa with seed z on its high end; dockers Ay.z/ay.z carry z on their next side (a copy's high
    // end exposes it again), fills Y-- (dockers never fill); a membrane kit (ring R=4, root facing inward) in
    // supply: chains copy, and every chain grows a membrane around itself (extra: motif copies, 12)
    cells(){steps=steps||100000;const per=parseInt(extra)||12,size=30,c=size/2,K=S.ringKit(4,'z',null,true,false,true);
      // docker prev side close-only: a released copy's low end catches no loose fill. Supply: the founder's first dock
      // races the membrane root for its high end (a root there first commits it to wrapping, uncopied); 24 dockers per
      // face type and 4 roots (one per cell) make the dock win in 4 of 4 worlds (12 and 8: 2 of 4)
      const supply={'Ay.z':24,'ay.z':24,'Y--':36,[K.tris[0].type]:4};for(const t of K.kit)supply[t]=(supply[t]||0)+per;
      const {s,founders}=createWorld({seed,size,founders:[{gaps:[1,1,1],faces:'aaaa',ends:'-z',x:c,y:c}],supply,params:{}});
      const tmp=new TriSim({},1),norm=t=>{tmp.setType(0,t);return canon(tmp.typeName(0));},kitT=new Set([...K.kit,K.tris[0].type].map(norm));
      const report=t=>{const {comp,members}=s.bodies(),cs=census(s).filter(q=>q.n>=7&&!q.paired),rings=[];
        for(const m of members){const k=m.filter(u=>kitT.has(norm(typeName(s,u)))).length;if(k>=K.tris.length&&!m.some(u=>s._edges(u).prev>=0||s._edges(u).next>=0))rings.push(m);}
        const cen=m=>{let x=0,y=0;for(const u of m){x+=s._dx(s.px[u]-s.px[m[0]]);y+=s._dy(s.py[u]-s.py[m[0]]);}return [s.px[m[0]]+x/m.length,s.py[m[0]]+y/m.length];};
        const wrapped=cs.map(q=>rings.some(m=>{const [x,y]=cen(m);return Math.hypot(s._dx(s.px[q.units[3]]-x),s._dy(s.py[q.units[3]]-y))<3*H;})?q.faces+'(in a cell)':q.faces+'+'+(members[comp[q.units[0]]].filter(u=>kitT.has(norm(typeName(s,u)))).length));
        console.log(`t=${t} chains [${wrapped.join(' ')}] closed membranes=${rings.length} docks=${s.ev.dock||0} completions=${s.ev.complete||0}`);};
      snap(s,'t0','t=0: chain aaaa with seed z; dockers, fills, membrane kit',null,false);
      for(let t=1;t<=steps;t++){s.step();if(every(t,20))report(t);if(every(t,4))snap(s,`t${t}`,`t=${t}: cells ${s.ev.complete||0}`,null,false);}
      finish('Heritable cells: chains copy and every chain grows its own membrane');},
    // conveyor of two hatches with hand-off
    conveyor(){steps=steps||3000;const {s,structures}=createWorld({seed,size:12,structures:[{tris:S.conveyor(),x:6,y:6}],supply:{'aaa':10,'---':14}});
      const U=structures[0],focus={units:U,radius:2.8,align:{u:U[2],a0:s.angle(U[2])}};snap(s,'t0','t=0',focus);
      for(let t=1;t<=steps;t++){s.step();if(every(t,10))console.log(`t=${t} catches=${s.ev.glue||0} closures=${s.ev.closeGlue||0} handoffs=${s.ev.handoff||0} drops=${s.ev.drop||0}`);if(every(t,4))snap(s,`t${t}`,`t=${t}: hand-offs ${s.ev.handoff||0}, drops ${s.ev.drop||0}`,focus);}
      finish('Conveyor: hatch 1 catches and hands off to hatch 2, which drops');},
    // gated ring membrane (rows from extra: 'r2'), keys from extra number
    gate(){steps=steps||10000;const rows=String(extra||'').includes('r2')?2:1,keys=parseInt(extra)||12,{tris,R}=S.ring(4+rows-1,rows);ringRun({tris,R,rows,keys,door:1,title:`Gated ring membrane (${rows} row${rows>1?'s':''}), ${keys} keys`});},
    // energy: the lid pocket's lid spends a charged carrier per closing; carriers recharge in a light zone (extra 'dark': off)
    energy(){steps=steps||10000;const light=extra!=='dark';
      const {s}=createWorld({seed,size:16,structures:[{tris:S.lidPocket('bcd','A','E'),x:4.5,y:8}],supply:{'aaa':16,'eee':12,'---':12},params:light?{light:{x:12,y:8,r:2.5,p:0.02}}:{}});
      const carriers=[...Array(s.n).keys()].filter(u=>typeName(s,u)==='eee');for(const u of carriers)s.chg[u]=0;snap(s,'t0',`t=0: light ${light?'on':'off'}, carriers discharged`,null,false);
      for(let t=1;t<=steps;t++){s.step();if(every(t,10))console.log(`t=${t} light=${light} casts=${s.ev.cast||0} fuelUsed=${s.ev.fuelUsed||0} recharges=${s.ev.recharge||0} charged=${carriers.filter(u=>s.chg[u]).length}`);
        if(every(t,3))snap(s,`t${t}`,`t=${t}: casts ${s.ev.cast||0}, fuel used ${s.ev.fuelUsed||0}`,null,false);}
      finish(`Energy: one charged carrier per hatch swing (light ${light?'on':'off'})`);},
    // factory: lid pockets cast blanks xxx into the dockers the chain needs (extra: kinds, e.g. 'AA' or 'Aa'; 'none' = control)
    factory(){steps=steps||20000;const kinds=extra==='none'?'':(extra||'Aa'),spots=[[5,5,0],[5,14,Math.PI],[14,5,Math.PI],[14,14,0]];
      const {s}=createWorld({seed,size:20,founders:[{gaps:[1,1,1,1],faces:'aaaaa',x:13,y:13}],structures:[...kinds].map((k,i)=>({tris:S.lidPocket('-'+k+'-','X'),x:spots[i][0],y:spots[i][1],rot:spots[i][2]})),supply:{'xxx':60,'---':40}});
      snap(s,'t0',`t=0: pockets ${kinds||'none'}`,null,false);
      for(let t=1;t<=steps;t++){s.step();if(every(t,10)){const c=census(s).filter(x=>x.n>=9),tc=typeCount(s);
          console.log(`t=${t} complete aaaaa=${c.filter(q=>q.faces==='aaaaa').length} AAAAA=${c.filter(q=>q.faces==='AAAAA').length} casts=${s.ev.cast||0} A--=${tc[canon('A--')]||0} a--=${tc[canon('a--')]||0} xxx=${tc.xxx||0} docks=${s.ev.dock||0}`);}
        if(every(t,3))snap(s,`t${t}`,`t=${t}: casts ${s.ev.cast||0}`,null,false);}
      finish(`Factory: pockets (${kinds||'none'}) cast blanks into dockers for the chain aaaaa`);},
  };
  // ring worlds: tracers inside and outside, keys outside; counts crossings (inside <-> outside) and door activity
  function ringRun({tris,R,rows,keys,door,title}){const size=20,c=size/2;
    const {s,structures}=createWorld({seed,size,structures:[{tris,x:c,y:c}],supply:{'---':24,'ggg':keys},params:{hingeAngle:2*Math.PI/3}});
    const U=structures[0],ring=new Set(U),free=[...Array(s.n).keys()].filter(u=>!ring.has(u)),tracers=free.filter(u=>typeName(s,u)==='---'),placed=[...U];
    const ref=U[6],rx0=c-s.px[ref],ry0=c-s.py[ref],ra0=s.angle(ref);
    const centre=()=>{const d=s.angle(ref)-ra0,cs=Math.cos(d),sn=Math.sin(d);return [s.px[ref]+cs*rx0-sn*ry0,s.py[ref]+sn*rx0+cs*ry0];};
    const inner=(R-rows)*H-0.3,outer=R+0.2,where=u=>{const [x,y]=centre(),d=Math.hypot(s._dx(s.px[u]-x),s._dy(s.py[u]-y));return d<inner?'in':d>outer?'out':'wall';};
    free.forEach(u=>{const inside=tracers.indexOf(u)>=0&&tracers.indexOf(u)<12;
      if(!placeFree(s,u,placed,()=>{const a=2*Math.PI*s.rng(),r=inside?inner-0.3-1.4*s.rng():outer+0.6+(size/2-outer-1)*s.rng();return [c+r*Math.cos(a),c+r*Math.sin(a)];}))throw Error('could not place');placed.push(u);});
    const side=new Map(tracers.map(u=>[u,where(u)]));let crossings=0;const focus={units:U,radius:R+1.5,align:{u:ref,a0:ra0}};
    snap(s,'t0',`t=0: ${keys} keys outside`,focus);
    for(let t=1;t<=steps;t++){s.step();for(const u of tracers){const w=where(u);if(w!=='wall'&&w!==side.get(u)){crossings++;side.set(u,w);}}
      if(every(t,10))console.log(`t=${t} tracers inside=${tracers.filter(u=>where(u)==='in').length} crossings=${crossings} unlatches=${s.ev.unlatch||0} pulses=${s.ev.pulse||0} interlocked=${s.ev.interlocked||0}`);
      if(every(t,3))snap(s,`t${t}`,`t=${t}: ${crossings} crossings`,focus);}
    finish(title);}
  if(!D[name])throw Error('unknown demo '+name+'; one of '+Object.keys(D).join(' '));
  D[name]();
}
if(require.main===module){const [name,seed='1',steps,dir='runs',extra]=process.argv.slice(2);demo(name,+seed,steps?+steps:0,dir,extra);}
module.exports={demo};
