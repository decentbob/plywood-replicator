'use strict';
// Demos of every capability (one or two small worlds each; pictures + saved states in the output directory).
//   node tri/demos.js NAME [seed] [steps] [outdir] [extra]
// NAME: copy | pocket | lid | grow | heir | cycle | ring | conveyor | gate | airlock | energy | factory | arms  (see docs/INNOVATIONS.md for results)
const path=require('path');
const {createWorld,placeFree,census,typeCount,partPlacement}=require('./world');
const {render,montage}=require('./render');
const S=require('./structures');
const {TriSim,canon,typeName}=require('./sim');
const H=Math.sqrt(3)/2;

function demo(name,seed=1,steps,dir='runs',extra){
  const shots=[],out=f=>path.join(dir,`${name}_${f}.png`);
  const snap=(s,f,title,focus,labels=true)=>{render(s,out(f),title,focus,labels);shots.push(out(f));};
  const finish=(title,cols=4)=>{montage(path.join(dir,`${name}.png`),cols,title,shots);console.log('pictures:',path.join(dir,`${name}.png`));};
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
    // extra: copies of each kit type (default 4)
    grow(){steps=steps||20000;const per=parseInt(extra)||4,K=S.kit(S.lidPocket('-A-','X',null,'B'),'auto','x','z',null,[S.lidSlot('B')]),r=K.tris[K.root],i=K.rootSide;
      const a=r.v[i],b=r.v[(i+1)%3],c=r.v[(i+2)%3],anchor={v:[b,a,[a[0]+b[0]-c[0],a[1]+b[1]-c[1]]],type:'z--'};
      const supply={xxx:16};for(const t of K.kit)supply[t]=(supply[t]||0)+per;
      const {s,structures}=createWorld({seed,size:16,structures:[{tris:[anchor,r],x:8,y:8}],supply,params:{pLoose:0.05}});
      console.log('kit',K.kit.join(' '),'depth',K.depth);const A=structures[0][0];
      const tmp=new TriSim({},1),want=new Set(K.types.map(t=>{tmp.setType(0,t);return canon(tmp.typeName(0));})),grown=()=>{const {comp}=s.bodies();let k=0;for(let u=0;u<s.n;u++)if(comp[u]===comp[A]&&want.has(canon(typeName(s,u))))k++;return k;};
      snap(s,'t0','t=0: anchor and root',null,false);let done=0;
      for(let t=1;t<=steps;t++){s.step();if(every(t,20)){const g=grown();if(!done&&g>=K.tris.length)done=t;console.log(`t=${t} kit cells=${g}/${K.tris.length} casts=${s.ev.cast||0}`);}
        if(every(t,4))snap(s,`t${t}`,`t=${t}: casts ${s.ev.cast||0}`,null,false);}
      {const {comp}=s.bodies();snap(s,'zoom','grown part (zoom)',{units:[...Array(s.n).keys()].filter(u=>comp[u]===comp[A]),radius:3.5});}
      console.log('complete at',done||'not yet');finish(`Grown lid pocket from a seed (kit of ${K.kit.length} types, ${per} each)`);},
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
