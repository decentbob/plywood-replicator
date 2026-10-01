'use strict';
// Demos of every capability (one or two small worlds each; pictures + saved states in the output directory).
//   node tri/demos.js NAME [seed] [steps] [outdir] [extra]
// NAME: copy | pocket | lid | stamp | split | budgrow | grow | heir | cycle | ring | import | cell | bud | wrap | live | grown | birth | cells | conveyor | gate | airlock | energy | factory | arms  (see docs/INNOVATIONS.md for results)
const path=require('path');
const {createWorld,placeFree,census,typeCount,partPlacement,strandInKit,openBudDoors}=require('./world');
const {render,montage}=require('./render');
const S=require('./structures');
const {TriSim,canon,typeName}=require('./sim');
const H=Math.sqrt(3)/2;

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
    // casting pocket: the hatch catches aaa, swings it into the centre, the cast gives the instruction glues
    pocket(){steps=steps||4000;const {s,structures}=createWorld({seed,size:14,structures:[{tris:S.pocket('bcd','A'),x:7,y:7}],supply:{'aaa':16,'---':20}});
      const U=structures[0],focus={units:U,radius:5,align:{u:U[4],a0:s.angle(U[4])}};snap(s,'t0','t=0',focus);
      for(let t=1;t<=steps;t++){s.step();if(every(t,10))console.log(`t=${t} casts=${s.ev.cast||0} ${JSON.stringify(typeCount(s)).slice(0,200)}`);if(every(t,4))snap(s,`t${t}`,`t=${t}: casts ${s.ev.cast||0}`,focus);}
      console.log('casts',JSON.stringify((s.castLog||[]).slice(0,8)));finish('Casting pocket: aaa -> bcd (hatch catches, carries, cast, reopens)');},
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
    // their prev side, so every copy's low end exposes the seed again and grows its own pocket; latGlue: fills must be Z--
    // (a docker used as a fill would expose z on a hidden back) (extra: kit copies, 12)
    heir(){steps=steps||30000;const per=parseInt(extra)||12,P=S.lidPocket('-A-','X');
      const supply={'Az-':14,'az-':14,'Z--':30,xxx:10};
      const probe=createWorld({seed,size:22,founders:[{gaps:[1,1,1,1],faces:'aaaaa',ends:'z-'}]}),U0=probe.founders[0];
      const K=S.kitOptions(P,'xa','z',[S.lidSlot('B')]).find(k=>partPlacement(probe.s,U0,U0[0],k,S.lidClear()).ok);if(!K)throw Error('no placement');
      for(const t of K.kit.concat([K.types[K.root]]))supply[t]=(supply[t]||0)+per;
      const {s,founders}=createWorld({seed,size:22,founders:[{gaps:[1,1,1,1],faces:'aaaaa',ends:'z-'}],supply,params:{pLoose:0.05,latGlue:true}});
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
      const {s}=createWorld({seed,size,founders:[{gaps:[1,1,1,1],faces:'aaaaa',ends:'y-'}],supply,params:{pLoose:0.05,latGlue:true}});
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
    // split: a parent ring P and a bud ring D (prepared, labelled) share a wall held by completion-release pairs '&',
    // with an open doorway through both walls (each panel turned open, held by a '&' doorstop, always triggered). Inside
    // P a stamp pocket casts blanks into the bud's part (A@-a@); parts diffuse through the doorway into D and grow a
    // three-cell cap on D's inner wall. While the cap is open the pair hears the open signal; once it is complete every
    // '&' lets go: the doors swing shut and lock, D separates with its content (extra: blanks inside P, default 30)
    // extra 'g' (genome): no cap; P holds a chain aaaa (no seed) and a stamp pocket casting its dockers Ay.z (seed z on
    // the next side, lateral y close-only; fills Y-- as food, latGlue); D's wall has an anchor Z@| that catches a copy's
    // seed z (the strand is placed flush): the bud splits off once it holds a genome copy; the parent's wall has an
    // anchor W| that holds the founder by its seed w (copies do not carry w), so the parent keeps its genome
    // extra 'o' (organelle, with the genome): D also grows a stamp pocket casting aU.w (the dockers its copy AAAA needs;
    // their copies aaaa carry w like the founder; latGlue: the blanks uuu are their fills) from blanks uuu (food only
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
      // the founder (genome variant) near P's anchor: the first spot where prepared parts do not overlap
      const overlap=(s,all)=>{const {triDepth}=require('./physics'),A=new Float64Array(6),B=new Float64Array(6);
        for(const u of all)for(const v of all){if(v<=u)continue;const dx=s._dx(s.px[v]-s.px[u]),dy=s._dy(s.py[v]-s.py[u]);if(dx*dx+dy*dy>1.4)continue;
          for(let q=0;q<3;q++){A[2*q]=s.ox[u*3+q];A[2*q+1]=s.oy[u*3+q];B[2*q]=dx+s.ox[v*3+q];B[2*q+1]=dy+s.oy[v*3+q];}if(triDepth(A,B)>1e-6)return true;}return false;};
      let W0=null;
      for(const f of gen?[0.55,0.45,0.65,0.35,0.75]:[0])for(const ox of gen?[0,1,-1,2,-2]:[0]){
        const w=createWorld({seed,size,founders:gen?[{gaps:[1,1,1],faces:'aaaa',ends:'w-',x:c+bp.anchorP[2][0]*f+ox,y:cy+bp.anchorP[2][1]*f}]:[],structures:[{tris:bp.tris,x:c,y:cy},pocket],supply:gen?{xxx:org?10:nb,'Y--':org?12:16,...(org?{uuu:OUT}:{}),...kitSupply}:{xxx:nb},params:gen?{latGlue:true,...(org?{lockRange:80}:{})}:{}});
        openBudDoors(w.s,w.structures[0],bp);if(!overlap(w.s,[...w.structures[0],...w.structures[1],...(w.founders[0]||[])])){W0=w;break;}}
      if(!W0)throw Error('split: prepared parts overlap');
      const {s,structures,founders}=W0,U=structures[0],PK=[...structures[1],...(founders[0]||[])];
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
    // budgrow: the bud grows instead of being prepared (structures.grownBud). The parent P (prepared, labelled: ring of
    // side 7 with a pulse door beside its seed side, a stamp pocket casting the bud's cap part from blanks, blanks xxx
    // inside) and the bud's kit parts outside (every bud cell its own type; extra: copies per type, default 2). The bud
    // ring D (side 5) grows from P's seed: while a wall site is open the lock signal holds both doors shut; when D's last
    // cell arrives both open, cap parts cast in P come through the doorway and grow D's two-cell cap; when nothing is
    // open, D's seed bond is cut, the lock signal returns, both doors swing shut and D leaves
    budgrow(){steps=steps||300000;const per=parseInt(extra)||2,size=40,c=size/2,cy=c-5,RP=7,RD=5,g=S.grownBud({RP,RD}),dcy=cy+(RP+RD)*H;
      const P=g.P,Pt=P.map(x=>g.tris[x]),kit={};for(const t of g.kit)kit[t]=(kit[t]||0)+per;kit[g.rootType]=per;
      const pocket={tris:S.lidPocket(S.stampInstr(g.cap.type),'X'),x:c-0.5,y:cy-2.5,rot:0};
      const {s,structures}=createWorld({seed,size,structures:[{tris:Pt,x:c,y:cy},pocket],supply:{xxx:30,...kit},params:{lockRange:80}});
      const U=structures[0],PK=structures[1],prep=new Set([...U,...PK]),free=[...Array(s.n).keys()].filter(u=>!prep.has(u)),placed=[...prep];
      // prepared parts must not meet the parent's door sweep
      {const {triDepth}=require('./physics'),d=g.doors[0],tr=p=>[p[0]+c,p[1]+cy],pin=tr(d.pin),flat=V=>Float64Array.from(V.flat());
        const pk=pocket.tris.map(t=>t.v.map(p=>[p[0]+pocket.x,p[1]+pocket.y]));if(!S.sweepClear(d.panel.map(x=>g.tris[x].v.map(tr)),pk,pin,d.dir,d.ang))throw Error('budgrow: the pocket is in the door sweep');void triDepth;void flat;}
      // blanks inside P; kit parts outside both rings (D's place included)
      free.forEach(u=>{const inP=typeName(s,u)==='xxx';if(!placeFree(s,u,placed,()=>{for(;;){if(inP){const x=(2*s.rng()-1)*RP,y=(2*s.rng()-1)*RP;if(S.hexr([x,y])<RP-1.6)return [c+x,cy+y];continue;}
        const x=size*s.rng(),y=size*s.rng();if(S.hexr([s._dx(x-c),s._dy(y-cy)])>RP+0.6&&S.hexr([s._dx(x-c),s._dy(y-dcy)])>RD+0.6)return [x,y];}},50000))throw Error('place');placed.push(u);});
      const norm=t=>{const z=new TriSim({},1);z.setType(0,t);return canon(z.typeName(0));},kitT=new Set([...g.kit,g.rootType].map(norm)),capT=norm(g.cap.type);
      const Su=U[g.S],flap=(f,p)=>{const i=[0,1,2].find(i=>s.bond[f*3+i]>=0&&((s.bond[f*3+i]/3)|0)===p);if(i===undefined)return NaN;return Math.abs(Math.atan2(Math.sin(s.angle(f)-s.angle(p)-s.hRel[f*3+i]),Math.cos(s.angle(f)-s.angle(p)-s.hRel[f*3+i]))*180/Math.PI);};
      // the bud's root and its panel's hinge cell (whichever kit copies became them)
      const rootT=norm(g.rootType),p1T=norm(g.tris[g.panelD[0]].type),qT=norm(g.tris[g.q].type);
      let closed=0,opened=0,split=0,early=0;const ctr=L=>{let x=0,y=0;for(const u of L){x+=s._dx(s.px[u]-s.px[L[0]]);y+=s._dy(s.py[u]-s.py[L[0]]);}return [s.px[L[0]]+x/L.length,s.py[L[0]]+y/L.length];};
      const report=t=>{const {comp,members}=s.bodies(),root=[...Array(s.n).keys()].find(u=>s.bonded(u)&&norm(typeName(s,u))===rootT&&kitT.has(rootT)&&[0,1,2].some(i=>s.bond[u*3+i]>=0));
        const dc=root!==undefined?comp[root]:-1,dU=dc>=0?members[dc]:[],cells=dU.filter(u=>kitT.has(norm(typeName(s,u)))).length,q=dU.find(u=>norm(typeName(s,u))===qT),p1=dU.find(u=>norm(typeName(s,u))===p1T);
        const aP=flap(U[g.panelP[0]],Su),aD=p1!==undefined&&root!==undefined?flap(p1,root):NaN,cap=dU.filter(u=>norm(typeName(s,u))===capT).length;
        if(!closed&&q!==undefined)closed=t;if(!opened&&aP>20)opened=t;if(!closed&&aP>20)early=t;if(!split&&root!==undefined&&dc!==comp[Su]&&cells>=g.D.length-1)split=t;
        const inD=dc>=0?(()=>{const [x,y]=ctr(dU);return u=>S.hexr([s._dx(s.px[u]-x),s._dy(s.py[u]-y)])<RD-1;})():()=>false;
        const parts=free.filter(u=>!s.bonded(u)&&norm(typeName(s,u))===capT);
        console.log(`t=${t} bud cells=${cells}/${g.D.length} ${closed?'closed at '+closed:'open'} doors P:${(aP|0)} D:${isNaN(aD)?'-':aD|0} deg${early?' EARLY at '+early:''} casts=${s.ev.cast||0} free cap parts=${parts.length} (in D ${parts.filter(inD).length}) cap=${cap}/${g.cap.slots.length} ${split?'SPLIT at '+split:'joined'} doors after split: ${split?(aP<5&&aD<5?'shut':'open'):'-'} kit parts in D=${free.filter(u=>!s.bonded(u)&&kitT.has(norm(typeName(s,u)))&&inD(u)).length} completions=${s.ev.complete||0}`);};
      console.log('bud kit',g.kit.length+1,'types x',per,'cap part',g.cap.type,'doors',g.doors.map(d=>d.ang+'deg').join(' '));
      snap(s,'t0','t=0: parent P (seed on its top wall, door, stamp pocket, blanks); the bud kit outside',{units:U,radius:15});
      for(let t=1;t<=steps;t++){s.step();if(every(t,30))report(t);if(every(t,6))snap(s,`t${t}`,`t=${t}`,{units:U,radius:15},false);}
      {const {comp,members}=s.bodies(),r=[...Array(s.n).keys()].find(u=>s.bonded(u)&&norm(typeName(s,u))===rootT);if(r!==undefined)snap(s,'zoom','the bud',{units:members[comp[r]],radius:7});}
      finish('Grown bud: the bud ring grows on the parent; its closing opens the doorway; the parent feeds its cap; it splits off sealed');},
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
      const supply={[KR.rootType]:2,[KP.types[KP.root]]:2,xxx:40,'---':10};
      for(const [t,m] of Object.entries(KR.counts))supply[t]=(supply[t]||0)+mult*m;for(const t of KP.kit)supply[t]=(supply[t]||0)+4*mult;
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
    // birth: chain aaaaa with membrane seed m on its high end grows a whole cell (cellKit: membrane with a pore and an
    // organelle of two lid pockets on its wall, casting dockers AXm and aXm; the root keeps the chain). When the cell is
    // complete the pore opens; blanks diffuse in, the pockets cast dockers, the chain copies (blanks are the fills:
    // latGlue, docker prev side X); a copy carries m on its free end, may leave through the pore and grow its own cell
    // from the supply (extra: kit copies per cell, 3)
    birth(){steps=steps||400000;const R=7,mult=parseInt(extra)||3,size=40,c=size/2;
      const founder={gaps:[1,1,1,1],faces:'aaaaa',ends:'-m',x:c-7,y:c};
      const probe=createWorld({seed,size,founders:[founder]}),U0=probe.founders[0];
      const K=S.cellKit({R,k:6,m:1,pre:7,order:[true],keepFor:K0=>{const g=strandInKit(probe.s,U0,U0[U0.length-1],K0);return [...g.strand,...g.dock];}});
      console.log('cell kit: cells',K.tris.length,'types',Object.keys(K.counts).length,'root',K.rootType,'organelle risk',K.organelle.K.risk);
      // organelle parts 4x richer: if the ring closes first, the organelle's last sites are inside and the cell is stuck
      const orgT=new Set(K.organelle.K.types);
      const supply={[K.rootType]:mult,xxx:100,'---':20};for(const [t,n] of Object.entries(K.counts))supply[t]=(supply[t]||0)+mult*n;
      for(const t of orgT){const c=Object.keys(K.counts).find(x=>{const a=new TriSim({},1);a.setType(0,x);const b=new TriSim({},1);b.setType(0,t);return canon(a.typeName(0))===canon(b.typeName(0));});if(c)supply[c]+=3*mult*K.counts[c];}
      const {s,founders}=createWorld({seed,size,founders:[founder],supply,params:{pLoose:0.05,latGlue:true}});const F=founders[0];
      const tmp=new TriSim({},1),norm=t=>{tmp.setType(0,t);return canon(tmp.typeName(0));},kitT=new Set([...Object.keys(K.counts),K.rootType].map(norm));
      const isKit=u=>kitT.has(norm(typeName(s,u)));
      const report=t=>{const {comp,members}=s.bodies(),cells=[];
        for(const m of members){const k=m.filter(isKit).length;if(k>=20)cells.push(m);}
        const cs=census(s).filter(q=>q.n>=7);
        const where=q=>{const b=comp[q.units[0]];const own=cells.findIndex(m=>comp[m[0]]===b);if(own>=0)return 'on cell'+own;
          for(let i=0;i<cells.length;i++){const M=cells[i].filter(isKit);let x=0,y=0;for(const u of M){x+=s._dx(s.px[u]-s.px[M[0]]);y+=s._dy(s.py[u]-s.py[M[0]]);}x=s.px[M[0]]+x/M.length;y=s.py[M[0]]+y/M.length;
            if(Math.hypot(s._dx(s.px[q.units[4]]-x),s._dy(s.py[q.units[4]]-y))<(R-1)*H)return 'in cell'+i;}return 'free';};
        console.log(`t=${t} cells [${cells.map(m=>m.filter(isKit).length).join(' ')}] strands [${cs.map(q=>q.faces+(q.paired?'*':'')+':'+where(q)).join(' ')}] casts=${s.ev.cast||0} docks=${s.ev.dock||0} releases=${s.ev.release||0} unlatch=${s.ev.unlatch||0}`);};
      snap(s,'t0','t=0: chain aaaaa with seed m; cell kit, blanks, junk',null,false);
      for(let t=1;t<=steps;t++){s.step();if(every(t,80))report(t);if(every(t,8))snap(s,`t${t}`,`t=${t}: casts ${s.ev.cast||0}`,null,false);}
      finish('Birth: a chain grows its cell, the cell opens a pore, copies leave and grow their own cells');},
    // heritable cells: chain aaaa with seed z on its high end; dockers Ay.z/ay.z carry z on their next side (a copy's high
    // end exposes it again), fills Y-- (latGlue: dockers never fill); a membrane kit (ring R=4, root facing inward) in
    // supply: chains copy, and every chain grows a membrane around itself (extra: motif copies, 12)
    cells(){steps=steps||100000;const per=parseInt(extra)||12,size=30,c=size/2,K=S.ringKit(4,'z',null,true,false,true);
      // docker prev side close-only: a released copy's low end catches no loose fill. Supply: the founder's first dock
      // races the membrane root for its high end (a root there first commits it to wrapping, uncopied); 24 dockers per
      // face type and 4 roots (one per cell) make the dock win in 4 of 4 worlds (12 and 8: 2 of 4)
      const supply={'Ay.z':24,'ay.z':24,'Y--':36,[K.tris[0].type]:4};for(const t of K.kit)supply[t]=(supply[t]||0)+per;
      const {s,founders}=createWorld({seed,size,founders:[{gaps:[1,1,1],faces:'aaaa',ends:'-z',x:c,y:c}],supply,params:{latGlue:true}});
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
    // airlock (double lock with interlock)
    airlock(){steps=steps||30000;const keys=parseInt(extra)||24,{tris,R}=S.airlock(4);ringRun({tris,R,rows:1,keys,door:2,title:`Airlock, ${keys} keys`,lock:true});},
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
    // typed arms from strand-end seeds (extra: bend pattern)
    arms(){steps=steps||20000;const pat=extra||'222112',A1=S.armTypes('p',pat,'cdeghi'),A2=S.armTypes('u',S.mirror(pat),'jkmnoq');
      const supply={Apu:8,Bpu:8,apu:8,bpu:8,'---':24};for(const t of [...A1,...A2])supply[t]=(supply[t]||0)+12;
      const {s,founders}=createWorld({seed,size:20,founders:[{gaps:[1,1,1,1,1],faces:'ababab',ends:'pu'}],supply});console.log('arm types',A1.join(' '),'|',A2.join(' '));
      snap(s,'t0','t=0',null,false);
      for(let t=1;t<=steps;t++){s.step();if(every(t,6))console.log(`t=${t} grown=${[...Array(s.n).keys()].filter(u=>s.roles(u).role===4).length} docks=${s.ev.dock||0} strands [${census(s).filter(c=>c.n>1).map(c=>c.faces+'/'+c.gaps).join(' ')}]`);
        if(every(t,3))snap(s,`t${t}`,`t=${t}`,null,false);}
      snap(s,'zoom','founder with arms',{units:founders[0],radius:3.2});finish(`Typed arms ${pat} / ${S.mirror(pat)} from end seeds`);},
  };
  // ring worlds: tracers inside and outside, keys outside; counts crossings (inside <-> outside) and door activity
  function ringRun({tris,R,rows,keys,door,title,lock}){const size=20,c=size/2;
    const {s,structures}=createWorld({seed,size,structures:[{tris,x:c,y:c}],supply:{'---':24,'ggg':keys},params:{hingeAngle:2*Math.PI/3}});
    const U=structures[0],ring=new Set(U),free=[...Array(s.n).keys()].filter(u=>!ring.has(u)),tracers=free.filter(u=>typeName(s,u)==='---'),placed=[...U];
    const ref=U[6],rx0=c-s.px[ref],ry0=c-s.py[ref],ra0=s.angle(ref);
    const centre=()=>{const d=s.angle(ref)-ra0,cs=Math.cos(d),sn=Math.sin(d);return [s.px[ref]+cs*rx0-sn*ry0,s.py[ref]+sn*rx0+cs*ry0];};
    const inner=(R-rows)*H-0.3,outer=R+(lock?2.2:0.2),where=u=>{const [x,y]=centre(),d=Math.hypot(s._dx(s.px[u]-x),s._dy(s.py[u]-y));return d<inner?'in':d>outer?'out':'wall';};
    free.forEach(u=>{const inside=tracers.indexOf(u)>=0&&tracers.indexOf(u)<12;
      if(!placeFree(s,u,placed,()=>{const a=2*Math.PI*s.rng(),r=inside?inner-0.3-1.4*s.rng():outer+0.6+(size/2-outer-1)*s.rng();return [c+r*Math.cos(a),c+r*Math.sin(a)];}))throw Error('could not place');placed.push(u);});
    const side=new Map(tracers.map(u=>[u,where(u)]));let crossings=0;const focus={units:U,radius:R+(lock?3:1.5),align:{u:ref,a0:ra0}};
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
