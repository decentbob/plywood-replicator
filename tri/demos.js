'use strict';
// Demos of every capability (one or two small worlds each; pictures + saved states in the output directory).
//   node tri/demos.js NAME [seed] [steps] [outdir] [extra]
// NAME: ring | imprint | budpool | lysis | closure | pair | strip (copy, imprint g/m/p and budcycle, chain copying's demos, retired
// 2026-10-08 in core review run 20261008-2221: git `1284bb4`; budpore, the doorway pairs, retired 2026-10-04: git `882b7d4`;
// the casting lineage's demos were removed on 2026-10-03: git `7415fd4`)
const path=require('path');
const {createWorld,placeFree,typeCount,buildStructure,placeTri}=require('./world');
const {render,montage}=require('./render');
const S=require('./structures');
const {TriSim,canon,typeName,TOK}=require('./sim');
const H=Math.sqrt(3)/2;

function demo(name,seed=1,steps,dir='runs',extra){
  // TRI_NOPIC=1: no pictures or saved states (each picture starts a Chromium; tri/check.js reads only the reports)
  const shots=[],out=f=>path.join(dir,`${name}_${f}.png`),pics=!process.env.TRI_NOPIC;
  const snap=(s,f,title,focus,labels=true,fillOf=null)=>{if(!pics)return;render(s,out(f),title,focus,labels,fillOf);shots.push(out(f));};
  const finish=(title,cols=4)=>{if(!pics)return;montage(path.join(dir,`${name}.png`),cols,title,shots);console.log('pictures:',path.join(dir,`${name}.png`));};
  const every=(t,k)=>t%Math.max(1,(steps/k)|0)===0;
  const D={
    // imprint (contact copying): two anchors z-- (labelled start); on the first a ring (R=3) grown one motif round
    // (root and the 5 motif cells: one of each part, prepared), the second bare (welded to a plain cell so it is
    // attached); copy blanks -?-?-? are the only food: no free parts. A copy blank that touches a free side of an
    // attached triangle becomes a copy of it, so the ring's own cells and root multiply, the ring closes and a second
    // ring grows on the bare anchor. extra: number of copy blanks (default 400); 'c': control, blanks without copy sides
    imprint(){steps=steps||100000;const ctl=String(extra||'').includes('c'),nb=parseInt(extra)||400,size=36,c=size/2,K=S.ringKit(3,'z'),r=K.tris[0],i=K.rootSide;
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
    budpool(){steps=steps||100000;const AK=+(process.env.BPA||0),P=parseInt(extra)||8,B=+(process.env.BPB||8),size=+(process.env.BPS||30),r=+(process.env.BPR||(AK?AK+3:1)),hold=process.env.BPHOLD!=='0',es=process.env.BPES==='1',R=5,K=S.budKit(R,7,null,es,AK?{at:AK,glue:'Z'}:{}),N=K.N,SE=AK?'z-&-&':'w-&-&';
      const rv=K.tris[AK].v,ai=K.anchorSide,stand=v=>{const a=v[ai],b=v[(ai+1)%3],c=v[(ai+2)%3];return [b,a,[a[0]+b[0]-c[0],a[1]+b[1]-c[1]]];};
      const supply={'-?-?-?':B};for(const t of K.types)supply[t]=P;supply[K.types[N-1]]=+(process.env.BPE||5*P);
      const {s,structures}=createWorld({seed,size,structures:[{tris:[...K.tris,{v:stand(rv),type:SE}],x:size/2,y:size/2-R*H}],supply,params:{openRange:r}});
      const U=structures[0],Pu=U.slice(0,N),all=[...Array(s.n).keys()],idx=new Map(Pu.map((u,k)=>[canon(s.typeName(u)),k]));
      const bud=new Array(N).fill(-1),tb=new Array(N).fill(0),cp={bud:new Array(N).fill(0),par:new Array(N).fill(0),other:0},ev={stray:0,next:0},keep=new Set();
      const ob=s.bind.bind(s);s.bind=(u,i,v,j)=>{const res=ob(u,i,v,j);
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
          s.setType(x,SE);placeTri(s,x,stand(V));s.regrid(x);ob(q,e,x,0);}
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
    closure(){const R=5,K=S.budKit(R),N=K.N,s=new TriSim({W:28,H:28,sigma:0,sigmaRot:0,openRange:3},2*N+2),O=[14,14-R*H];
      const Bv=K.tris.map(t=>t.v.map(p=>S.budPose(R,p))),at=(v,dy=0)=>v.map(p=>[O[0]+p[0],O[1]+p[1]+dy]),Pu=[...Array(N).keys()],Bu=Pu.map(k=>N+k),Ps=2*N,Bs=2*N+1;
      const sh=(a,b)=>{const eq=(p,q)=>Math.hypot(p[0]-q[0],p[1]-q[1])<1e-6;for(let i=0;i<3;i++)for(let j=0;j<3;j++)if(eq(a[i],b[(j+1)%3])&&eq(a[(i+1)%3],b[j]))return [i,j];return null;};
      const refl=(u,i)=>{const P=k=>[s.px[u]+s.ox[u*3+k],s.py[u]+s.oy[u*3+k]],a=P(i),b=P((i+1)%3),c=P((i+2)%3);return [b,a,[a[0]+b[0]-c[0],a[1]+b[1]-c[1]]];};
      const pass=k=>{for(let q=0;q<k;q++){s.derive();s._release();}},hear=()=>Bu.filter(u=>s.op[u]>0).length;
      buildStructure(s,Pu,K.tris,O[0],O[1]);placeTri(s,Ps,refl(Pu[0],K.anchorSide));s.setType(Ps,'w--');s.bind(Pu[0],K.anchorSide,Ps,0);
      for(const u of [...Bu,Bs]){placeTri(s,u,[[1,1],[2,1],[1.5,1+H]]);s.px[u]=-40;}pass(10);
      const put=k=>{placeTri(s,Bu[k],at(Bv[k]));s.setType(Bu[k],K.types[k]);if(k===0)s.bind(Bu[0],K.rootSide,Pu[N-1],K.seedSide);else{const [i,j]=sh(Bv[k],Bv[k-1]);s.bind(Bu[k],i,Bu[k-1],j);}s.caught(Bu[k]);pass(4);};
      console.log('kit',K.types.join(' '));snap(s,'t0','the parent (complete; its anchor holds a strand end) with its seed site free',null,true);
      for(let k=0;k<N;k++){put(k);if(k===0||k===24)snap(s,`g${k}`,`the bud grows from copies: ${k+1} of ${N} cells; ${hear()} hear the open signal`,null,true);}
      snap(s,'w',`the bud complete: its doorway faces the parent's pore; only its waiting anchor emits (${hear()} cells hear it)`,null,true);
      placeTri(s,Bs,refl(Bu[0],K.anchorSide));s.setType(Bs,'w--');s.bind(Bu[0],K.anchorSide,Bs,0);pass(10);
      const split=s.bond[Bu[0]*3+K.rootSide]<0;console.log('after the catch: the bud '+(split?'let go of':'still holds')+' its parent');
      Bv.forEach((v,k)=>placeTri(s,Bu[k],at(v,1.2)));placeTri(s,Bs,refl(Bu[0],K.anchorSide));
      snap(s,'split',`the catch: completion releases the bud's root; the bud (moved off) is in the parent's starting state`,null,true);
      finish('Closure by design: a bud of its parent\'s kind (structures.budKit; signals only, no physics)',2);},
    // lysis (explore run 20261004-2051; RULES Core changes, the lysis side '!'): a closed world with no food, a prepared parent
    // of budcycle's kind (budKit(5, 7, eSource, anchor Z@| on cell 6, closed walls, seed site on cell 45), labelled) holding
    // a stand-in end z-- on its anchor (as in closure; until core review run 20261008-2221 its founder strand, held by
    // the high end), and on its seed site a prepared complete bud that waits for a catch that never comes (no blanks:
    // nothing is copied); LYC cutters 'z@!-|-|' (labelled: a part whose attach side carries
    // the lysis mark; it binds only a waiting anchor Z@|) and LYP free parts of each kit type (0). Observation: each bud on
    // the parent's seed site (its root and the cells joined to it), its size, completion and lysis; how many of its cells
    // are parts of the first (stuck) bud. extra: unused. LYS: world size (30); LYA: the anchor cell (44: the anchor opens
    // only when a bud is nearly complete; budcycle's kind has 6, where cutters kill every bud as its cell 6 attaches); LYR:
    // openRange (50: more than the anchor cell, so the root holds while the anchor waits; 9 with LYA=6); the oracle LYFIX
    // (candidate (o)) was removed in run 20261005-1921 (RULES, Core changes: its -1 never fades)
    lysis(){steps=steps||400000;const AK=+(process.env.LYA||44),R=5,C=+(process.env.LYC??4),P=+(process.env.LYP||0),size=+(process.env.LYS||30),cut=process.env.LYT||'z@!-|-|';
      const K=S.budKit(R,7,null,true,{at:AK,glue:'Z'},'-|',45),N=K.N,SC=K.seedCell,O=[size/2,size/2-R*H],supply={};if(C)supply[cut]=C;if(P)for(const t of K.types)supply[t]=P;
      const av=K.tris[AK].v,ai=K.anchorSide,a=av[ai],b=av[(ai+1)%3],c=av[(ai+2)%3],stand={v:[b,a,[a[0]+b[0]-c[0],a[1]+b[1]-c[1]]],type:'z--'};
      const {s,structures}=createWorld({seed,size,structures:[{tris:K.tris,x:O[0],y:O[1]},{tris:K.tris.map(t=>({...t,v:t.v.map(K.pose)})),x:O[0],y:O[1]},{tris:[stand],x:O[0],y:O[1]}],supply,params:{openRange:+(process.env.LYR||50)}});
      const Pu=structures[0],B0=structures[1],F=structures[2],all=[...Array(s.n).keys()],kitT=new Set(K.types.map(canon)),first=new Set(B0);
      s.bind(B0[0],K.rootSide,Pu[SC],K.seedSide);
      s.bind(Pu[AK],K.anchorSide,F[0],0);   // the parent's anchor holds a stand-in end z-- (labelled, as in closure and budpool)
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
    // whose y its R was bound to), the free part pools. PAB blanks (300), PAS world (30), PAR openRange (1), PAKR and PAKS
    // other R and S types (check pair-c: the turned order); extra: bodies to report the time of (20).
    // Direction 1 (build run 20261006-0251), two labelled environment drives, both off by default: PAD=d, every 100 steps
    // each free part (R or S, not a blank) becomes a copy blank with probability d; PAH=h, every 100 steps each body (two or
    // more bonded triangles, as physics moves it) is hit with probability h from step PAHT on (0): one of its triangles,
    // drawn at random, is lysed and the lysis rule takes it apart into its parts (not across an '&' joint), as budcycle's
    // BCH. A body dies when its R loses its S. PAP=k: a 'pop:' line every k steps (living bodies, births, deaths,
    // generations, pools)
    // Direction 2 (explore run 20261006-0450), observation and labelled starts and drives, all off by default: PAV=mix,
    // a neutral marker put in at step PAVT (100000): each R with probability PAVP (0.5), attached or free, gets glue x on
    // its plain side '-' (R 'Y@&b@|x': nothing carries X, so nothing binds it; copies carry it); PAVK=seed puts in a
    // variant instead: S's seed site y without its anchor mark (copied while free, while no bud sits on it); 'var:' lines every PAP steps give the marked share of living bodies and how
    // clustered they are (same-marker share among each body's 6 nearest bodies, against random mixing). PAM=m, a labelled
    // mutagen drive: every 100 steps (at step 50 of each 100) each free part (a free triangle without a copy side) has, with probability m, one
    // side drawn at random changed: its glue (half the time: inert or one of a..z, A..Z) or one of its marks toggled
    // ('.@&|?!'); 'mut:' lines every PAP steps count bodies by their types. With either, PAD decays every free part,
    // variant or not, into a blank (without them only R and S are ever free parts). PAHU=1: the hazard per triangle
    // instead of per body: every triangle of a body is lysed with probability h/2 (a pair is hit about as often as
    // before); per body, a hit lyses one part between '&' joints, so a body of k such parts loses each about k times
    // less often (a body's size lowers its parts' risk)
    // Material flow (build run 20261006-0621), a labelled drive, off by default: PAHB=2, every triangle lysed (the hit one and
    // the part the lysis takes apart, up to its '&' joints) becomes a copy blank once it is free (dead material returns as
    // raw material, not as parts)
    // Two kinds on one supply (build run 20261006-1150), a labelled start, off by default: PA2='T0 T1 ...', a founder of a
    // second kind (stripKit: a strip of these types, each cell across the previous one's side 1) at (size/4, size/4);
    // PA1=0 leaves the pair founder out; PA1T=t, PA2T=t: that founder enters at step t instead (two or three free copy
    // blanks become its cells, at a clear spot); PAEN=k founders enter (1); PA3='T0 T1 ...' with PA3T=t a third kit (stripKit) entering at step t (build run 20261007-1821: kinds as food; PA3N=k of it, default PAEN: explore run 20261008-1522). 'duo:' lines every PAP steps, per kind (pair; PA2): individuals (attached
    // triangles of its last type: a last cell is bonded only in a complete individual), held (its attached triangles),
    // free parts, copies since the previous line; mean blanks; a kind is extinct once nothing of it is attached
    // Heredity of combinations (explore run 20261006-1322), observation and labelled starts and drives, all off by default:
    // PAVK=parasite with PAV=mix: S's seed site y in a share PAVP of S becomes q, no anchor (S 'B@-q': copied at two sides,
    // nothing binds q, so its body never buds); with it 'par:' lines every PAP steps and a 'parental:' result line: the
    // share of births whose R, S, both were copied from the newborn's parent body (a copy's template is a living body's R
    // or the S on its front), and whose two parts were copied from one body (any); PAMX=m: stirring, a labelled drive
    // (each step each free part changes places with a random free triangle with probability m); PADI=k: PAD's decay every
    // k steps instead of 100
    // A second resource (build run 20261006-1620), a labelled start, off by default: PAF='TYPE:N ...', a stock of N free
    // triangles of each TYPE beside the blanks (a part only a kind with the matching front binds: copying is glue-blind, so
    // glue is the only way a resource can be one kind's own). Stock types never decay (PAD) and are not turned into blanks
    // when lysed (PAHB): the lysis rule returns them as themselves, so the stock is conserved. A late founder (PA1T, PA2T)
    // takes its stock cells from the free stock
    // Heritable diets (explore run 20261006-1750), a labelled drive, off by default: PAMF=1 limits the mutagen PAM to fronts:
    // each free part that is not a stock type and has a front (a glued side marked '@|') has, with probability m, that
    // side's glue changed to another letter of PAMA (a..z): the part then catches a different stock (its diet). 'diet:'
    // lines every PAP steps: per front letter (50 steps before each PAP step: between two decay steps), complete individuals (a root, a part with a front and an '&' side, whose
    // front is bonded), waiting roots (front unbonded), free roots; free stock by type; a 'diets:' result line
    // The hazard's unit and a mutagen on letters (build run 20261007-0420), labelled drives, off by default: PAHU=2, the hazard
    // per individual: every 100 steps each individual (bonded triangles joined by bonds that are not joints) is lysed at one of
    // its triangles with probability h, so every attached triangle dies at rate h however it is joined. Stock parts are
    // exempt from every mutagen
    // The whole body (build run 20261007-0820), a labelled drive, off by default: PAHU=3, the hazard per individual as
    // PAHU=2, but a hit lyses every triangle of the hit individual's body, joints included (a waiting bud dies with its
    // parent; a chain of heads that never let go is hit once per head and dies whole, so it cannot split into new chains)
    // The standard world (build run 20261007-0420; IDEAS "The hazard's unit decides between individuals and aggregates"):
    // PAW=1 sets each of these options that is not set: 1000 blanks in world 50, the diet kind 'Z@&c@|- C@-|z|' as the one
    // founder (PA1=0; PA1=1 adds the pair), stocks C, E, G of 150, openRange 9, and four labelled drives: deaths return
    // blanks (PAHB=2), free parts decay (PAD=1), the whole-body hazard (PAHU=3, h 0.07 from step 4000; build run
    // 20261007-1351: PAHU=2 at 0.1 until then) and the general mutagen (PAM=0.01; stock parts exempt). Later pair slices and
    // checks start from it (check world)
    // Roots in place (explore run 20261007-0622), observation, off by default: PARP=1, for every root that binds a seed site
    // by its '&' side, whether its template was in the seed site's body (copied by its own parent); 'root:' lines every
    // PAP steps, a 'roots:' result line, a picture at the first (the 4-cell arc of IDEAS run 0622: PA2 with its four types)
    pair(){steps=steps||200000;if(process.env.PAW==='1')for(const [k,v] of Object.entries({PAB:'1000',PAS:'50',PAHT:'4000',PAHB:'2',PAHU:'3',PAP:'5000',PAR:'9',PAD:'1',PAH:'0.07',PA1:'0',PA2:'Z@&c@|- C@-|z|',PAF:'C@-|z|:150 E@-|z|:150 G@-|z|:150',PAM:'0.01'}))if(process.env[k]===undefined)process.env[k]=v;const {gcode:gc,gname,comp}=require('./sim');const K=S.pairKit(),_kr=process.env.PAKR,_ks=process.env.PAKS;if(_kr)K.tris[0]={...K.tris[0],type:K.R=_kr};if(_ks)K.tris[1]={...K.tris[1],type:K.S=_ks};const NB=+(process.env.PAB||300),size=+(process.env.PAS||30),goal=parseInt(extra)||20;
      const HB=+(process.env.PAHB||0)>0,DK=+(process.env.PAD||0),HZ=+(process.env.PAH||0),HT=+(process.env.PAHT||0),PP=+(process.env.PAP||0),VM=process.env.PAV||'',VT=+(process.env.PAVT||100000),MU=+(process.env.PAM||0),HU=process.env.PAHU==='1',HI=process.env.PAHU==='2'||process.env.PAHU==='3',HW=process.env.PAHU==='3',VK=process.env.PAVK||'x',VP=+(process.env.PAVP||0.5),DI=+(process.env.PADI||100),MX=+(process.env.PAMX||0),MF=process.env.PAMF==='1',MA=process.env.PAMA||'abcdefghijklmnopqrstuvwxyz',PS=VK==='parasite';
      const FST=(process.env.PAF||'').trim().split(/\s+/).filter(Boolean).map(w=>{const i=w.lastIndexOf(':');return [w.slice(0,i),+w.slice(i+1)];}),FS=new Set(FST.map(([t])=>canon(t))),stk=u=>FS.size>0&&FS.has(canon(s.typeName(u)));const DW=MF||(MU>0&&FS.size>0);
      // individuals (census, PAHU=2): sets of bonded triangles joined by bonds that are not joints (no '&' side on either end)
      const units=()=>{const c=new Int32Array(s.n).fill(-1),M=[];
        for(let u=0;u<s.n;u++){if(c[u]>=0||!s.bonded(u))continue;const L=[u];c[u]=M.length;for(let k=0;k<L.length;k++){const x=L[k];for(let i=0;i<3;i++){const q=s.bond[x*3+i];if(q<0||s.done[x*3+i]||s.done[q])continue;const y=(q/3)|0;if(c[y]<0){c[y]=M.length;L.push(y);}}}M.push(L);}
        return {c,M};};
      const K2=process.env.PA2?S.stripKit(process.env.PA2.trim().split(/\s+/)):null,T1=+(process.env.PA1T||0),T2=+(process.env.PA2T||0),K3=process.env.PA3?S.stripKit(process.env.PA3.trim().split(/\s+/)):null,T3=+(process.env.PA3T||0),EN=+(process.env.PAEN||1),EN3=+(process.env.PA3N||EN),P1=process.env.PA1!=='0'&&!T1;
      const {s,structures}=createWorld({seed,size,structures:[...(P1?[{tris:K.tris,x:size/2,y:size/2}]:[]),...(K2&&!T2?[{tris:K2.tris,x:size/4,y:size/4}]:[])],supply:{'-?-?-?':NB,...Object.fromEntries(FST)},params:{openRange:+(process.env.PAR||1)}});
      // joints (observation, the web census): an '&' side that bound a seed site (a caught head's '&' side is spent on
      // release too; a copy blank's bind is not a joint); cleared when its triangle comes free
      const jr=new Int8Array(3*s.n),_bd=s.bind.bind(s),_ct=s.cut.bind(s);s.bind=(u,i,v,j)=>{_bd(u,i,v,j);if(s.done[u*3+i]&&!s.cpy[v*3+j])jr[u*3+i]=1;if(s.done[v*3+j]&&!s.cpy[u*3+i])jr[v*3+j]=1;};
      s.cut=(u,i)=>{const q=s.bond[u*3+i];_ct(u,i);if(q>=0)for(const w of [u,(q/3)|0])if(!s.bonded(w))jr.fill(0,w*3,w*3+3);};
      // alive: a living body's R -> {id (birth order), g (generation), t (birth)}; kids by body id
      const cR=canon(K.R),cS=canon(K.S),cB=canon('-?-?-?'),cV=canon(K.R.replace(/-(?![.@&|?!])/,'x')),RL=new Set([cR,cV]),all=[...Array(s.n).keys()],Y=gc('Y'),B=gc('B'),gb=gc('b'),alive=new Map(P1?[[structures[0][0],{id:0,g:0,t:0}]]:[]),kids=new Map(),dbl=[],dead=new Uint8Array(s.n),ev={births:1,deaths:0,hits:0,decayed:0,returned:0,life:0,lastBirth:0,reused:0,mutated:0},rec=new Int8Array(s.n),pg=new Int32Array(s.n).fill(-1),cp={},cx=new Float32Array(s.n).fill(NaN),cy=new Float32Array(s.n),dist={n:0,sum:0,near:0},src=new Int32Array(s.n).fill(-1),pid=new Int32Array(s.n).fill(-1),par={n:0,R:0,S:0,both:0,same:0,rand:0},parW={n:0,R:0,S:0,both:0,same:0,rand:0};let reached=0,maxGen=0;
      const side=(u,g)=>[0,1,2].find(i=>s.glue[u*3+i]===g),front=u=>{const i=side(u,gb);return i===undefined?-1:s.partner(u,i);};
      // parental share (observation, PAVK=parasite): the living body a copy's template belonged to (its R, or the S on a living R's
      // front; -1 for a waiting bud's R or a free triangle), compared at each birth with the newborn's parent
      const bid=w=>{const a=alive.get(w);if(a)return a.id;for(let i=0;i<3;i++){const q=s.partner(w,i);if(q>=0&&alive.has(q)&&front(q)===w)return alive.get(q).id;}return -1;};
      // a new body: an R bonded to an S by its front (seen within a pass of S binding; its Y lets go one pass later); a
      // death: a living body's R no longer bonded to an S by its front (lysed)
      const scan=t=>{if(HZ)for(const [u,b] of alive)if(front(u)<0){alive.delete(u);ev.deaths++;ev.life+=t-b.t;}
        for(const u of all){if(!s.bonded(u)||alive.has(u)||(s.glue[u*3]!==gb&&s.glue[u*3+1]!==gb&&s.glue[u*3+2]!==gb)||!RL.has(canon(s.typeName(u))))continue;const f=s.partner(u,side(u,gb)),y=s.partner(u,side(u,Y)),pr=y>=0?s.partner(y,side(y,B)):-1,P=pr>=0?alive.get(pr):undefined;
          // a waiting bud remembers its parent's generation (the parent may die in the pass its bud completes)
          if(f<0){if(P){pg[u]=P.g+1;pid[u]=P.id;}continue;}const g=P?P.g+1:pg[u],pi=P?P.id:pid[u];pg[u]=-1;pid[u]=-1;
          if(PS&&pi>=0){const a=src[u]===pi,b=src[f]===pi;for(const o of [par,parW]){o.n++;o.R+=a;o.S+=b;o.both+=a&&b;o.same+=src[u]>=0&&src[u]===src[f];o.rand+=1/Math.max(1,alive.size);}}src[u]=src[f]=-1;alive.set(u,{id:ev.births,g,t});ev.births++;ev.reused+=rec[u]+rec[f];rec[u]=rec[f]=0;for(const v of [u,f])if(!Number.isNaN(cx[v])){const d=Math.hypot(s._dx(s.px[v]-cx[v]),s._dy(s.py[v]-cy[v]));dist.n++;dist.sum+=d;if(d<5)dist.near++;cx[v]=NaN;}ev.lastBirth=t;if(P)kids.set(P.id,(kids.get(P.id)||0)+1);if(g>maxGen)maxGen=g;if(!(ev.births&(ev.births-1)))dbl.push(t);}};
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
      const cSq=canon(K.S.replace(/y\|/,'q'));
      // parental share since the last line: births with a known parent, the share whose R, S, both were copied from the
      // parent body, and the share a random living body would give (1 / living bodies)
      const sCount=()=>{let n=0,q=0;for(const [u] of alive){const v=front(u);if(v<0)continue;n++;if(canon(s.typeName(v))===cSq)q++;}return n?` parasite ${(q/n).toFixed(3)}`:'';},cpW={S:0,q:0},
        parLine=t=>{const o=parW,m=Math.max(1,o.n);console.log(`par: t=${t} births ${o.n} fromParent R ${(o.R/m).toFixed(3)} S ${(o.S/m).toFixed(3)} both ${(o.both/m).toFixed(3)} sameBody ${(o.same/m).toFixed(3)} random ${(o.rand/m).toFixed(4)} openSeed ${opened().S} alive ${alive.size}${sCount()} copies S ${(cp[cS]||0)-cpW.S} q ${(cp[cSq]||0)-cpW.q}`);for(const k in o)o[k]=0;cpW.S=cp[cS]||0;cpW.q=cp[cSq]||0;};
      const vEnd={lost:0,fixed:0},marker=t=>{const L=[...alive.keys()],m=L.map(u=>canon(s.typeName(u))===cV?1:0),N=L.length,f=N?m.reduce((a,b)=>a+b,0)/N:0;let same=0,cnt=0;
        for(let a=0;a<N;a++){const d=[];for(let b=0;b<N;b++)if(b!==a)d.push([Math.hypot(s._dx(s.px[L[b]]-s.px[L[a]]),s._dy(s.py[L[b]]-s.py[L[a]])),m[b]]);d.sort((x,y)=>x[0]-y[0]);for(const [,q] of d.slice(0,6)){same+=q===m[a]?1:0;cnt++;}}
        if(!vEnd.lost&&N&&f===0)vEnd.lost=t;if(!vEnd.fixed&&N&&f===1)vEnd.fixed=t;
        const o=opened();console.log(`var: t=${t} alive ${N} marked ${m.reduce((a,b)=>a+b,0)} share ${f.toFixed(3)} sameNeighbours ${cnt?(same/cnt).toFixed(3):'-'} random ${(f*f+(1-f)*(1-f)).toFixed(3)} copies x ${cp[cV]||0} openSeed ${o.S} openFront ${o.R}`);};
      // mutation census: bodies (two or more bonded triangles) by their types; variant types ever seen in a body
      let mutLast={t:0,bodies:0,kinds:0,c:0,dc:0};const seenV=new Map(),census=t=>{const {members}=s.bodies(),by=new Map();let mb=0,fm=0;
        for(const m of members){if(m.length<2)continue;const ty=m.map(u=>canon(s.typeName(u))),k=ty.slice().sort().join(' + ');by.set(k,(by.get(k)||0)+1);
          if(ty.some(c=>c!==cR&&c!==cS)){mb++;for(const c of new Set(ty))if(c!==cR&&c!==cS){const v=seenV.get(c)||{first:t,last:t,max:0,n:0};v.last=t;v.n++;seenV.set(c,v);}}}
        const nb=[...by.values()].reduce((a,b)=>a+b,0);for(const [c,v] of seenV)if(v.last===t){let k=0;for(const m of members)if(m.length>1&&m.some(u=>canon(s.typeName(u))===c))k++;v.max=Math.max(v.max,k);v.ms=Math.max(v.ms||0,nb?k/nb:0);}
        for(const u of all)if(!s.bonded(u)){const c=canon(s.typeName(u));if(c!==cR&&c!==cS&&c!==cB)fm++;}
        const top=[...by].sort((a,b)=>b[1]-a[1]).slice(0,6).map(([k,n])=>n+'x '+k).join(' | '),o=opened();
        mutLast={t,bodies:nb,kinds:by.size,c:s.ev.copy||0,dc:(s.ev.copy||0)-mutLast.c};
        console.log(`mut: t=${t} bodies ${nb} withVariant ${mb} kinds ${by.size} freeVariants ${fm} mutated ${ev.mutated} openSeed ${o.S} openFront ${o.R} | ${top}`);};
      // the two variants that expose a part more: among attached S-like triangles (a side B@ and a side y), the share whose
      // y side has no anchor mark (the seed site copied while free); among attached R-like ones (Y@ and b@), the share whose
      // b@ side has none (the front copied while a bud waits)
      const yy=gc('y'),opened=()=>{let sn=0,so=0,rn=0,ro=0;const has=(u,g,a)=>[0,1,2].find(i=>s.glue[u*3+i]===g&&(!a||s.att[u*3+i]));
        for(const u of all){if(!s.bonded(u))continue;const iB=has(u,B,1),iy=has(u,yy),iY=has(u,Y,1),ib=has(u,gb,1);
          if(iB!==undefined&&iy!==undefined){sn++;if(!s.anc[u*3+iy])so++;}if(iY!==undefined&&ib!==undefined){rn++;if(!s.anc[u*3+ib])ro++;}}
        return {S:sn?(so/sn).toFixed(2):'-',R:rn?(ro/rn).toFixed(2):'-'};};
      // diets (PAMF): a front is a glued side marked '@|'; a root has a front and an '&' side; per front letter its complete
      // individuals (front bonded), waiting roots, free roots; free stock by type; per letter the first census with 10 or
      // more complete individuals, and the most letters held at once (10 or more each) in the run's second half
      const fside=u=>{for(let i=0;i<3;i++){const k=u*3+i;if(s.att[k]&&s.anc[k]&&s.glue[k]&&!s.cpy[k])return i;}return -1;},isRoot=u=>s.done[u*3]||s.done[u*3+1]||s.done[u*3+2];
      const dEnd={first:{},maxHeld:0,maxAt:0,sum:{},m:0},diet=t=>{const by={},fs={};for(const u of all){const i=fside(u);if(i>=0&&isRoot(u)){const L=gname(s.glue[u*3+i]),o=by[L]||(by[L]={n:0,w:0,f:0});if(!s.bonded(u))o.f++;else if(s.partner(u,i)>=0)o.n++;else o.w++;}else if(!s.bonded(u)&&stk(u)){const c=canon(s.typeName(u));fs[c]=(fs[c]||0)+1;}}
        const Ls=Object.keys(by).sort(),held=Ls.filter(L=>by[L].n>=10);for(const L of held)if(!dEnd.first[L])dEnd.first[L]=t;if(t>steps/2){dEnd.m++;for(const L of Ls)dEnd.sum[L]=(dEnd.sum[L]||0)+by[L].n;if(held.length>dEnd.maxHeld){dEnd.maxHeld=held.length;dEnd.maxAt=t;}}
        console.log(`diet: t=${t} ${Ls.filter(L=>by[L].n||by[L].w).map(L=>`${L} ${by[L].n}/${by[L].w}/${by[L].f}`).join(' ')||'none'} | held ${held.join('')||'-'} | free stock ${FST.map(([ty])=>fs[canon(ty)]||0).join(':')} | blanks ${avg.n?(avg.b/avg.n).toFixed(0):'-'}`);};
      // kinds (with diets, or the mutagen and stocks): an individual is the chain of fronts from a head (a root not caught
      // by a front) through the parts it caught to the part with no front that ends it; its kind is the front letters in
      // order (c: root and stock part, 2 cells; ce: root, a middle part with front e, stock part: 3 cells). Per kind complete individuals (the chain ends in a stock part) and
      // incomplete ones (it ends in an open front); per kind of 3 or more cells the first census with 10 or more
      // complete individuals and the most held; the longest complete individual
      const kEnd={first:{},max:{},last:{},longest:0},kinds=t=>{const R=[],caught=new Set();for(const u of all){if(!s.bonded(u))continue;const i=fside(u);if(i<0)continue;if(isRoot(u))R.push(u);const p=s.partner(u,i);if(p>=0)caught.add(p);}
        const n={},w={};let longest=0;for(const u of R){if(caught.has(u))continue;let x=u,L='',ok=false;for(let a=0;a<40;a++){const i=fside(x);if(i<0){ok=stk(x);break;}L+=gname(s.glue[x*3+i]);const p=s.partner(x,i);if(p<0)break;x=p;}
          if(ok){n[L]=(n[L]||0)+1;longest=Math.max(longest,L.length+1);}else w[L]=(w[L]||0)+1;}
        const len={};for(const [L,k] of Object.entries(n))len[L.length+1]=(len[L.length+1]||0)+k;kEnd.len=len;kEnd.last=n;kEnd.longest=Math.max(kEnd.longest,longest);for(const [L,k] of Object.entries(n))if(L.length>=2){kEnd.max[L]=Math.max(kEnd.max[L]||0,k);if(k>=10&&!kEnd.first[L])kEnd.first[L]=t;}
        const f=o=>Object.entries(o).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([L,k])=>L+' '+k).join(', ')||'-';
        console.log(`kinds: t=${t} complete ${f(n)} | incomplete ${f(w)} | longest ${longest} | by cells ${Object.entries(len).map(([c,k])=>c+':'+k).join(' ')||'-'} || ${indiv(t)}`);};
      // census of individuals (every pair world with PAP; observation only): an individual is a set of triangles joined by
      // bonds that are not joints (a bond with an '&' side on either end); its kind is its composition (the sorted types).
      // Per census: complete individuals of 2 or more cells (no open front: an unbonded glued attach side without '&') and
      // their kinds, kinds with 5 or more individuals (held), the most cells in a held kind, growing individuals (2 or more
      // cells, an open front), lone bonded triangles (heads on a seed site), complete individuals holding by a joint a triangle of a
      // type not in their own kind (another kind's part), the commonest kinds. End line 'census:' (second half: most kinds
      // held at once, most holding; whole run: longest held)
      const iEnd={maxHeld:0,maxAt:0,longest:0,longAt:0,maxHold:0},wk=new Map();let wHeld=[];const indiv=t=>{const {c,M}=units();wk.clear();
        const by=new Map(),key=M.map(L=>{const T=L.map(u=>canon(s.typeName(u)));return {T:new Set(T),k:T.sort().join('+')};});let one=0,grow=0,hold=0;const hk=new Map();
        M.forEach((L,m)=>{if(L.length<2){one++;return;}if(L.some(x=>[0,1,2].some(i=>s.att[x*3+i]&&s.glue[x*3+i]&&!s.done[x*3+i]&&s.bond[x*3+i]<0))){grow++;return;}by.set(key[m].k,(by.get(key[m].k)||0)+1);let h=null;
          const g=wk.get(key[m].k)||{r:new Set(),y:new Set(),a:new Set()};wk.set(key[m].k,g);for(const x of L)for(let i=0;i<3;i++){const k=x*3+i,q=s.glue[k];if(!q)continue;
            if(s.done[k]){if(jr[k])g.r.add(q);}else if(s.att[k])g.a.add(q);else if(!s.cOnly[k]&&!s.cpy[k])g.y.add(q);}
          for(const x of L)for(let i=0;i<3;i++){const q=s.bond[x*3+i];if(q<0||s.done[x*3+i]||!s.done[q])continue;const y=(q/3)|0;if(!key[m].T.has(canon(s.typeName(y)))){h=c[y];break;}}
          if(h!==null){hold++;const w=key[m].k+' > '+key[h].k;hk.set(w,(hk.get(w)||0)+1);}});
        const ks=[...by].sort((a,b)=>b[1]-a[1]),held=ks.filter(([,n])=>n>=5),cells=k=>k.split('+').length,lg=held.reduce((a,[k])=>Math.max(a,cells(k)),0),n=ks.reduce((a,[,v])=>a+v,0);
        wHeld=held;if(lg>iEnd.longest){iEnd.longest=lg;iEnd.longAt=t;}if(t>steps/2){if(held.length>iEnd.maxHeld){iEnd.maxHeld=held.length;iEnd.maxAt=t;}iEnd.maxHold=Math.max(iEnd.maxHold,hold);}
        const top=[...hk].sort((a,b)=>b[1]-a[1])[0];
        return `individuals ${n} kinds ${ks.length} held ${held.length} longestHeld ${lg} growing ${grow} single ${one} holdingOther ${hold}${top?` (${top[1]}x ${top[0]})`:''} | ${ks.slice(0,4).map(([k,v])=>v+'x '+k).join(', ')||'-'}`;};
      // recognition web (every pair world with PAP; observation only; build run 20261007-0820), from the held kinds of the
      // census above (5 or more complete individuals): per kind its roots (glues of '&' sides that bound a seed site, now or
      // before their release), its seed sites (glued sides that are not attach, close-only or copy sides) and its attach
      // sides ('@' without '&': fronts and the parts' attach sides). A kind raises another when a seed site of the one takes
      // the root of the other (complementary glues). A class is a set of kinds that raise one another's buds (a strongly
      // connected component with a cycle, a kind raising its own kind included); a cheat is a held kind in no class (it is
      // raised but raises none of its raisers), counted with the first class that raises it. A link joins two classes where
      // a kind of one raises a kind of the other ('>'), or an attach side or seed site of a kind of one binds an attach side
      // of a kind of the other ('~': a front that catches the other class's parts). 'web:' line after each census
      // (classes by size: roots, kinds/individuals, cheats); end line 'web:' (second half: most classes, links, cheats)
      const wEnd={maxC:0,maxCAt:0,maxL:0,maxLAt:0,maxX:0,n:0,sumC:0,sumL:0},web=(t,held)=>{const H=held.map(([k,n])=>({k,n,...(wk.get(k)||{r:new Set(),y:new Set(),a:new Set()})})),n=H.length;
        const meets=(A,B)=>{for(const q of A)if(B.has(comp(q)))return true;return false;},E=H.map(a=>H.map(b=>meets(a.y,b.r))),Q=E.map(r=>r.slice());
        for(let k=0;k<n;k++)for(let i=0;i<n;i++)if(Q[i][k])for(let j=0;j<n;j++)if(Q[k][j])Q[i][j]=true;
        const cl=new Int32Array(n).fill(-1),C=[];for(let i=0;i<n;i++){if(!Q[i][i]||cl[i]>=0)continue;const o={ks:[],n:0,r:new Set(),x:0,id:C.length};
          for(let j=0;j<n;j++)if(Q[i][j]&&Q[j][i]){cl[j]=o.id;o.ks.push(H[j]);o.n+=H[j].n;for(const q of H[j].r)o.r.add(q);}C.push(o);}
        let X=0,X0=0;for(let j=0;j<n;j++){if(cl[j]>=0)continue;X++;const i=H.findIndex((_,i)=>cl[i]>=0&&E[i][j]);if(i>=0)C[cl[i]].x++;else X0++;}
        const lk=new Map(),pr=new Set();for(let i=0;i<n;i++)for(let j=0;j<n;j++){const a=cl[i],b=cl[j];if(a<0||b<0||a===b)continue;
          if(E[i][j]){lk.set(a+'>'+b,[a,'>',b]);pr.add(Math.min(a,b)+','+Math.max(a,b));}if(a<b&&(meets(H[i].a,H[j].a)||meets(H[i].y,H[j].a)||meets(H[j].y,H[i].a))){lk.set(a+'~'+b,[a,'~',b]);pr.add(a+','+b);}}
        const name=o=>[...o.r].map(gname).sort().join('')||'-',cs=C.slice().sort((a,b)=>b.n-a.n),big=cs[0];
        if(t>steps/2){wEnd.n++;wEnd.sumC+=C.length;wEnd.sumL+=pr.size;if(C.length>wEnd.maxC){wEnd.maxC=C.length;wEnd.maxCAt=t;}if(pr.size>wEnd.maxL){wEnd.maxL=pr.size;wEnd.maxLAt=t;}wEnd.maxX=Math.max(wEnd.maxX,X);}
        console.log(`web: t=${t} held ${n} classes ${C.length} links ${pr.size} largest ${big?big.ks.length:0}/${big?big.n:0} cheats ${X}${X0?` (${X0} unraised)`:''} | ${cs.slice(0,5).map(o=>`${name(o)} ${o.ks.length}/${o.n}${o.x?' x'+o.x:''}`).join(', ')||'-'} | ${[...lk.values()].map(([a,s,b])=>name(C[a])+s+name(C[b])).join(' ')||'-'}`);};
      // two kinds: per kind its types, individuals (attached last cells), held, free parts, copies; extinction times
      // (counted 50 steps before the line: between two decay steps)
      let duoO=null;const DK2=K2?[{name:'pair',T:[cR,cS]},{name:'strip',T:K2.types.map(canon)}].map(k=>({...k,last:k.T[k.T.length-1],set:new Set(k.T),c0:0,ext:0,sum:0,m:0})):[],duoCount=()=>{
        const o=DK2.map(k=>({n:0,held:0,free:0,ft:k.T.map(()=>0)}));for(const u of all){const c=canon(s.typeName(u));DK2.forEach((k,i)=>{if(!k.set.has(c))return;if(s.bonded(u)){o[i].held++;if(c===k.last)o[i].n++;}else{o[i].free++;o[i].ft[k.T.indexOf(c)]++;}});}duoO=o;},duo=t=>{
        const o=duoO||(duoCount(),duoO);duoO=null;
        const parts=DK2.map((k,i)=>{const c=k.T.reduce((a,x)=>a+(cp[x]||0),0),d=c-k.c0;k.c0=c;if(!k.ext&&!o[i].held&&t>(i?T2:T1))k.ext=t;if(t>steps/2){k.sum+=o[i].n;k.m++;}return `${k.name} ${o[i].n} held ${o[i].held} free ${o[i].free} (${o[i].ft.join(':')}) copies +${d}${k.ext?` extinct at ${k.ext}`:''}`;});
        console.log(`duo: t=${t} ${parts.join(' | ')} | blanks ${avg.n?(avg.b/avg.n).toFixed(0):'-'}`);};
      // a late founder (PA1T, PA2T; labelled start): free copy blanks become the founder's cells, placed at a random spot with
      // no other triangle within reach of its cells (material conserved)
      const enter=(tris,t)=>{const U=[];for(const q of tris){const w=FS.has(canon(q.type))?canon(q.type):cB,u=all.find(u=>!U.includes(u)&&!s.bonded(u)&&canon(s.typeName(u))===w);if(u===undefined)return null;U.push(u);}
        const V=tris.flatMap(q=>q.v),mx=V.reduce((a,p)=>a+p[0],0)/V.length,my=V.reduce((a,p)=>a+p[1],0)/V.length,R=Math.max(...V.map(p=>Math.hypot(p[0]-mx,p[1]-my)))+0.6;
        for(let a=0;a<5000;a++){const x=s.rng()*size,y=s.rng()*size;if(all.some(u=>!U.includes(u)&&Math.hypot(s._dx(s.px[u]-x-mx),s._dy(s.py[u]-y-my))<R))continue;
          buildStructure(s,U,tris,x,y);for(const u of U)s._regrid(u);console.log(`t=${t} entry: ${tris.map(q=>q.type).join(' ')} at ${x.toFixed(1)},${y.toFixed(1)}`);return U;}
        return null;};
      snap(s,'t0',`t=0: one founder pair (R ${K.R}, S ${K.S}) among ${NB} copy blanks, no free parts`,null,false);
      // roots in place (observation, PARP=1; explore run 20261007-0622): for every root (a triangle with an '&' side) that
      // binds a seed site by it, whether its template (the triangle it was copied from) is in the seed site's body at that
      // moment (made by its own parent), and the same for the roots whose bud then lets go complete (births); 'root:' lines
      // every PAP steps and a 'roots:' result line
      const RP=process.env.PARP==='1',rpPic={n:0},srcT=new Int32Array(s.n).fill(-1),jb=new Int8Array(s.n),ip=new Int8Array(s.n).fill(-1),rpW={b:0,bi:0,n:0,ni:0,u:0},rpA={b:0,bi:0,n:0,ni:0,u:0},
        rootStep=()=>{for(let u=0;u<s.n;u++){let k=-1;for(let i=0;i<3;i++)if(s.done[u*3+i]){k=u*3+i;break;}if(k<0){jb[u]=0;continue;}
          const b=s.bond[k]>=0;if(b&&!jb[u]){const q=(s.bond[k]/3)|0,w=srcT[u],x=w>=0&&s.bonded(w)&&s.bodyOf(q).includes(w)?1:0;ip[u]=w<0?2:x;for(const o of [rpW,rpA]){o.b++;o.bi+=x;if(w<0)o.u++;}if(x&&!rpPic.n){rpPic.n=1;snap(s,'root',`t=${s.t}: a root copied by its own parent binds the parent's seed site`,{units:s.bodyOf(q),radius:3},true);}}
          else if(!b&&jb[u]&&s.spent[k]&&ip[u]>=0){for(const o of [rpW,rpA]){o.n++;o.ni+=ip[u]===1?1:0;}ip[u]=-1;}
          jb[u]=b?1:0;}},
        rpLine=t=>{const o=rpW;console.log(`root: t=${t} binds ${o.b} inPlace ${(o.bi/Math.max(1,o.b)).toFixed(3)} births ${o.n} inPlace ${(o.ni/Math.max(1,o.n)).toFixed(3)} notCopied ${o.u}`);for(const k in o)o[k]=0;};
      const pic={};let first=0;
      for(let t=1;t<=steps;t++){s.step();if(s.copyLog){for(const [,u,ty,w] of s.copyLog){const c=canon(ty);cp[c]=(cp[c]||0)+1;cx[u]=s.px[u];cy[u]=s.py[u];if(PS)src[u]=bid(w);srcT[u]=w;}s.copyLog.length=0;}
        if(RP)rootStep();
        // PAHB (labelled drive): a dead triangle, once free, returns as a copy blank
        if(HZ)for(let u=0;u<s.n;u++){if(s.ly[u]){rec[u]=1;if(HB&&!stk(u))dead[u]=1;}else if(dead[u]&&!s.bonded(u)){dead[u]=0;s.setType(u,'-?-?-?');rec[u]=0;pg[u]=-1;pid[u]=-1;src[u]=-1;cx[u]=NaN;ev.returned++;}}
        // PAD=d (labelled drive): free parts return to blanks (every PADI steps, 100)
        if(DK&&t%DI===0)for(const u of all){if(s.bonded(u)||s.ly[u]||s.cpy[u*3]||s.cpy[u*3+1]||s.cpy[u*3+2]||stk(u))continue;if(s.rng()<DK){s.setType(u,'-?-?-?');rec[u]=0;pg[u]=-1;pid[u]=-1;src[u]=-1;cx[u]=NaN;ev.decayed++;}}
        // PAH=h (labelled drive): a body hazard, mean life 100/h steps
        if(HZ&&t>HT&&t%100===0&&HI){for(const m of units().M)if(s.rng()<HZ){const u=m[Math.floor(s.rng()*m.length)];if(!s.ly[u]){ev.hits++;for(const v of HW?s.bodyOf(u):[u])if(!s.ly[v]){s.ly[v]=1;if(HB&&!stk(v))dead[v]=1;}}}}
        else if(HZ&&t>HT&&t%100===0){const {members}=s.bodies();if(HU){for(const m of members)if(m.length>1)for(const u of m)if(s.rng()<HZ/2&&!s.ly[u]){s.ly[u]=1;if(HB&&!stk(u))dead[u]=1;ev.hits++;}}else for(const m of members)if(m.length>1&&s.rng()<HZ){const u=m[Math.floor(s.rng()*m.length)];if(!s.ly[u]){s.ly[u]=1;if(HB&&!stk(u))dead[u]=1;ev.hits++;}}}
        // PAV (labelled start): the neutral marker, glue x on R's plain side (its spent '&' side stays spent)
        if(VM&&t===VT)for(const u of all){if(canon(s.typeName(u))!==(VK==='seed'||VK==='parasite'?cS:cR)||s.rng()>=VP)continue;
          for(let i=0;i<3;i++){const k=u*3+i;if(VK==='seed'){if(s.glue[k]===yy)s.anc[k]=0;}else if(VK==='parasite'){if(s.glue[k]===yy){s.anc[k]=0;s.glue[k]=gc('q');}}else if(!s.glue[k]&&!s.cOnly[k]&&!s.att[k]&&!s.done[k]&&!s.anc[k]&&!s.cpy[k]&&!s.lys[k])s.glue[k]=gc('x');}}
        // PAM=m (labelled drive, a mutagen): one side of a free part changed now and then (at mid-interval: PAD 1 would
        // turn a part mutated at the decay's step back into a blank at once)
        if(MU&&t%100===50)for(const u of all){if(s.bonded(u)||s.ly[u]||s.cpy[u*3]||s.cpy[u*3+1]||s.cpy[u*3+2])continue;
          if(MF){const i=fside(u);if(i<0||stk(u)||s.rng()>=MU)continue;const o=gname(s.glue[u*3+i]),L=MA.replace(o,'');s.glue[u*3+i]=gc(L[Math.floor(s.rng()*L.length)]);ev.mutated++;continue;}if(stk(u)||s.rng()>=MU)continue;mutate(u);ev.mutated++;}
        // PAMX=m (labelled drive, stirring): every step each free part, with probability m, changes places with a free
        // triangle drawn at random (blank or part; each takes the other's exact place, so nothing overlaps): copies no
        // longer stay near where they were made
        if(MX)for(const u of all){if(s.bonded(u)||s.ly[u]||s.cpy[u*3]||s.cpy[u*3+1]||s.cpy[u*3+2]||s.rng()>=MX)continue;
          for(let a=0;a<20;a++){const w=Math.floor(s.rng()*s.n);if(w===u||s.bonded(w)||s.ly[w])continue;for(const k of ['px','py','pa']){const x=s[k][u];s[k][u]=s[k][w];s[k][w]=x;}for(const v of [u,w]){s.resetShape(v);s._regrid(v);}break;}}
        if(T1&&t===T1)for(let q=0;q<EN;q++){const U=enter(K.tris,t);if(U)alive.set(U[0],{id:0,g:0,t});}
        if(T2&&t===T2&&K2)for(let q=0;q<EN;q++)enter(K2.tris,t);
        if(T3&&t===T3&&K3)for(let q=0;q<EN3;q++)enter(K3.tris,t);
        scan(t);
        if(VM&&PP&&t%PP===0&&t>=VT)marker(t);
        if(PS&&PP&&t%PP===0)parLine(t);
        if(RP&&PP&&t%PP===0)rpLine(t);
        if(MU&&PP&&t%PP===0)census(t);
        // copy error (pErr, run 20261008-0651; observation only): bonded triangles by type, the commonest 10 (PATN=n: n), and the copy errors so far
        if(s.p.pErr&&PP&&t%PP===0){const by=new Map();let nb=0;for(const u of all)if(s.bonded(u)){nb++;const c=canon(s.typeName(u));by.set(c,(by.get(c)||0)+1);}
          console.log(`types: t=${t} bonded ${nb} kinds ${by.size} copyErrors ${s.ev.copyError||0} copies ${s.ev.copy||0} | ${[...by].sort((a,b)=>b[1]-a[1]).slice(0,+(process.env.PATN||10)).map(([c,k])=>k+' '+c).join(', ')}`);}
        if(DW&&PP>=100&&t%PP===PP-50){diet(t);kinds(t);}else if(PP>=100&&t%PP===PP-50)console.log(`kinds: t=${t} ${indiv(t)}`);
        if(PP>=100&&t%PP===PP-50)web(t,wHeld);
        if(!first&&ev.births>1){first=t;const fu=[...alive.keys()];snap(s,'bud1',`t=${t}: the founder's first bud`,{units:fu,radius:3},true);}
        if(!reached&&ev.births>=goal){reached=t;snap(s,'goal',`t=${t}: ${ev.births} bodies, generation ${maxGen}`,null,false);}
        for(const k of [5,10]){if(!pic[k]&&ev.births>=k){pic[k]=t;snap(s,'b'+k,`t=${t}: ${ev.births} bodies`,null,false);}}
        if(PP){if(t%10===5)acc();if(K2&&PP>=100&&t%PP===PP-50)duoCount();if(K2&&t%PP===0)duo(t);if(t%PP===0)pop(t);}
        if(every(t,20))line(t);}
      if(PP>=100)console.log(`t=${s.t} web: maxClasses=${wEnd.maxC} at ${wEnd.maxCAt||'-'} maxLinks=${wEnd.maxL} at ${wEnd.maxLAt||'-'} maxCheats=${wEnd.maxX} mean2 classes ${wEnd.n?(wEnd.sumC/wEnd.n).toFixed(1):'-'} links ${wEnd.n?(wEnd.sumL/wEnd.n).toFixed(1):'-'}`);
      if(PP>=100)console.log(`census: maxHeld=${iEnd.maxHeld} at ${iEnd.maxAt||'-'} longestHeld=${iEnd.longest} at ${iEnd.longAt||'-'} maxHoldingOther=${iEnd.maxHold}`);
      const P=pools(),gens={};for(const b of alive.values())gens[b.g]=(gens[b.g]||0)+1;
      snap(s,'end',`t=${s.t}: ${alive.size} bodies${ev.deaths?` alive (${ev.births} born, ${ev.deaths} died)`:''}, generation ${maxGen}${DK?'':`, free R ${P.r}, free S ${P.q}`}, blanks ${P.b}`,null,false);
      // copies by type (R, S); children per body (a parent buds again once its last bud has moved off its seed site)
      const kv=[...Array(ev.births).keys()].map(i=>kids.get(i)||0);
      const drv=HZ||DK?` alive=${alive.size} deaths=${ev.deaths} hits=${ev.hits} decayed=${ev.decayed}${HB?` returned=${ev.returned}`:''} meanLife=${ev.deaths?(ev.life/ev.deaths).toFixed(0):'-'} fresh=${(1-ev.reused/Math.max(1,2*(ev.births-1))).toFixed(2)} lastBirth=${ev.lastBirth} aliveGens=${Object.keys(gens).sort((a,b)=>a-b).join(',')}`:'';
      console.log(`t=${s.t} result: bodies=${ev.births} reached${goal}=${reached||'not'} gen=${maxGen} perGen=${Object.keys(gens).sort((a,b)=>a-b).map(g=>g+':'+gens[g]).join(',')} freeR=${P.r} freeS=${P.q} waiting=${P.w} blanks=${P.b} copies=${s.ev.copy||0} copiesR=${cp[cR]||0} copiesS=${cp[cS]||0} firstBud=${first||'not'} doublings=${dbl.join(',')} founderKids=${kids.get(0)||0} maxKids=${kv.reduce((a,b)=>Math.max(a,b),0)} kidsMean=${(kv.reduce((a,b)=>a+b,0)/kv.length).toFixed(2)}${drv}`);
      if(VM){const o=opened();console.log(`t=${s.t} marker: lost=${vEnd.lost||'not'} fixed=${vEnd.fixed||'not'} copiesX=${cp[cV]||0} openSeed=${o.S} openFront=${o.R}`);}
      if(MU){const o=opened();console.log(`t=${s.t} result: openSeed=${o.S} openFront=${o.R} mutated=${ev.mutated} copies=${s.ev.copy||0}`);}
      // still evolving: variant types that were in at least a tenth of the bodies at some census, and those of them first
      // seen in a body in the run's second half; bodies, kinds and copies at the last census
      if(MU){const V=[...seenV.values()].filter(v=>(v.ms||0)>=0.1);console.log(`t=${s.t} evolving: bodies=${mutLast.bodies} kinds=${mutLast.kinds} common=${V.length} lateCommon=${V.filter(v=>v.first>steps/2).length} copiesLast=${mutLast.dc} blanks=${P.b}`);}
      if(RP){const o=rpA;console.log(`t=${s.t} roots: binds=${o.b} inPlace=${(o.bi/Math.max(1,o.b)).toFixed(3)} births=${o.n} birthsInPlace=${(o.ni/Math.max(1,o.n)).toFixed(3)} notCopied=${o.u}`);}
      if(PS){const m=Math.max(1,par.n);console.log(`t=${s.t} parental: births=${par.n} R=${(par.R/m).toFixed(3)} S=${(par.S/m).toFixed(3)} both=${(par.both/m).toFixed(3)} sameBody=${(par.same/m).toFixed(3)} random=${(par.rand/m).toFixed(4)} alive=${alive.size} openSeed=${opened().S} copiesS=${cp[cS]||0} copiesParasite=${cp[cSq]||0}${sCount()}`);}
      // the diets picture (PAMF): a root filled by its front letter's colour, a stock part by its own letter's (bright when
      // attached, dim when free); blanks and other triangles as usual
      if(DW){const D={c:'#ffd31a',e:'#ff7a1a',g:'#3fd8e8',z:'#e83fd0'},dc=(u,L)=>{const c=D[L.toLowerCase()]||'#b9c2c9';return s.bonded(u)?c:c+'55';};
        snap(s,'diets',`t=${s.t}: diets by front glue (c yellow, e orange, g cyan, z magenta, others grey); dim: free`,null,false,u=>{const i=fside(u);if(i>=0&&isRoot(u))return dc(u,gname(s.glue[u*3+i]));if(stk(u)){for(let k=0;k<3;k++)if(s.att[u*3+k]&&s.glue[u*3+k])return dc(u,gname(s.glue[u*3+k]));}});}
      if(DW){const E=Object.entries(kEnd.last).filter(([L])=>L.length>=2).sort((a,b)=>b[1]-a[1]),M=Object.entries(kEnd.max).sort((a,b)=>b[1]-a[1]);
        console.log(`t=${s.t} kinds: endLong=${E.map(([L,k])=>L+':'+k).slice(0,6).join(',')||'-'} maxLong=${M.slice(0,6).map(([L,k])=>L+':'+k+'@'+(kEnd.first[L]||'-')).join(',')||'-'} longest=${kEnd.longest} endByCells=${Object.entries(kEnd.len||{}).map(([c,k])=>c+':'+k).join(',')||'-'}`);}
      if(DW)console.log(`t=${s.t} diets: maxHeld=${dEnd.maxHeld} at ${dEnd.maxAt||'-'} first=${Object.entries(dEnd.first).map(([L,t])=>L+'@'+t).join(',')||'none'} mean2=${Object.entries(dEnd.sum).filter(([,v])=>v/dEnd.m>=1).map(([L,v])=>L+':'+(v/dEnd.m).toFixed(0)).join(',')||'-'} mutated=${ev.mutated}`);
      if(K2)console.log(`t=${s.t} duo: ${DK2.map(k=>`${k.name}=${k.ext?'extinct@'+k.ext:'alive'} mean2=${k.m?(k.sum/k.m).toFixed(0):'-'}`).join(' ')} strip=${K2.types.join(',')}`);
      if(MU)console.log(`t=${s.t} variants (in a body at some census; max bodies, first, last seen): ${[...seenV].sort((a,b)=>b[1].max-a[1].max).slice(0,15).map(([c,v])=>`${c} ${v.max} ${v.first}-${v.last}`).join(' | ')||'none'}`);
      finish(`The pair: one founder among copy blanks (S ${K.S})${HZ||DK?`, hazard ${HZ}, decay ${DK}`:''}`,3);},
    // strips of k cells (core-review run 20261006-1920, RULES Core changes: one range for every length): one founder strip
    // (structures strip(k), a labelled start) among PAB copy blanks (300), world PAS (30), openRange PAR (the core's
    // default); extra: the lengths, one world each in turn (2345). Observation only: each '&' release, whether the
    // released individual (the chain of fronts from its root) is complete, and how many passes after its last cell bound
    strip(){steps=steps||6000;const ks=String(extra||'2345').split('').map(Number),NB=+(process.env.PAB||300),size=+(process.env.PAS||30),out=[];
      for(const k of ks){const K=S.strip(k),T=K.types.map(canon),params=process.env.PAR?{openRange:+process.env.PAR}:{};
        const {s}=createWorld({seed,size,structures:[{tris:K.tris,x:size/2,y:size/2}],supply:{'-?-?-?':NB},params});
        const bt=new Int32Array(s.n).fill(-1),bind=s.bind.bind(s);s.bind=(u,i,v,j)=>{bind(u,i,v,j);bt[u]=bt[v]=s.t;};
        const fr=u=>{for(let i=0;i<3;i++){const q=u*3+i;if(s.att[q]&&s.anc[q]&&s.glue[q])return i;}return -1;},o={ok:0,bad:0,d:[]},rel=s._release.bind(s);
        s._release=()=>{for(let u=0;u<s.n;u++){if(s.op[u]!==0)continue;for(let i=0;i<3;i++){const q=u*3+i;if(!s.done[q]||s.bond[q]<0)continue;
          let x=u,n=1;for(let f=fr(x);f>=0&&s.partner(x,f)>=0;f=fr(x)){x=s.partner(x,f);n++;}
          if(n===k&&canon(s.typeName(x))===T[k-1]){o.ok++;o.d.push(s.t-bt[x]);}else o.bad++;}}rel();};
        for(let t=1;t<=steps;t++)s.step();
        let ind=0,big=0;for(let u=0;u<s.n;u++)if(s.bonded(u)&&canon(s.typeName(u))===T[k-1])ind++;for(const m of s.bodies().members)big=Math.max(big,m.length);
        const d=o.d.sort((a,b)=>a-b),med=d.length?d[d.length>>1]:'-';
        console.log(`k=${k} ${K.types.join(' ')} openRange=${s.p.openRange}: complete releases ${o.ok}, incomplete ${o.bad}, passes from last cell to release (median) ${med}, individuals ${ind}, largest body ${big}`);
        out.push(`k${k}=${o.ok}/${o.bad}/${med}`);
        if(k===ks[ks.length-1])snap(s,'end',`t=${s.t}: ${k}-cell strips, openRange ${s.p.openRange}`,null,false);}
      console.log(`t=${steps} result: complete/incomplete/delay ${out.join(' ')}`);finish('Strips of k cells: one range for every length',1);},
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
