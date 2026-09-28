#!/usr/bin/env node
'use strict';
const fs=require('fs'),zlib=require('zlib'),assert=require('assert/strict');
const {Sim,NV,F,R,K,L,T_A,T_C,T_E,T_P,T_Q,I_TPL,I_DOCK}=require('../src/sim');
const {HalfCellPolymerSim}=require('./half_cell_polymer');
const g=require('./half_cell_geometry'),{hash}=require('./half_cell_rim_test');
const CATALOG='experiments/out/HC_polymer_20260928_v2.json.gz';
const read=f=>JSON.parse(f.endsWith('.gz')?zlib.gunzipSync(fs.readFileSync(f)):fs.readFileSync(f));
const catalog=read(CATALOG),cpu=()=>{const c=process.cpuUsage();return(c.user+c.system)/1e6;};
const counts={observed:0,plain:0,restart:0,replay:0};
const rotate=([x,y],a)=>[x*Math.cos(a)-y*Math.sin(a),x*Math.sin(a)+y*Math.cos(a)];
const wrap=(x,w)=>x-w*Math.round(x/w),mean=ps=>ps.reduce((a,p)=>[a[0]+p[0]/ps.length,a[1]+p[1]/ps.length],[0,0]);
const N=8,RI=.75*Math.sqrt(5),RO=Math.sqrt(5),SWEEP=2*Math.PI-2*Math.atan(2),TURN=SWEEP/N;
const rawPoints=[[RO*Math.cos(TURN/2),RO*Math.sin(TURN/2)],[RI*Math.cos(TURN/2),RI*Math.sin(TURN/2)],
  [RI*Math.cos(TURN/2),-RI*Math.sin(TURN/2)],[RO*Math.cos(TURN/2),-RO*Math.sin(TURN/2)]];
const centroid=mean(rawPoints),POINTS=rawPoints.map(p=>p.map((x,k)=>x-centroid[k]));
const AREA=(RO*RO-RI*RI)*Math.sin(TURN)/2,SIZE=Math.sqrt(AREA);
class ArcSim extends HalfCellPolymerSim {
  _initGeometry(){
    super._initGeometry();this.nv[T_C]=4;
    POINTS.forEach((p,k)=>{this.rx[T_C*NV+k]=p[0];this.ry[T_C*NV+k]=p[1];});
    for(let i=0;i<4;i++)this.edgeOf[T_C*4+i]=i;
    for(let u=0;u<this.n;u++)if(this.type[u]===T_C)this._resetShape(u);
  }
  step(){throw Error('Prepared D geometry: use physics-only advance');}
}
const jobs=()=>[761,769].flatMap(seed=>['body16','individual16'].flatMap(mode=>['closed','open'].map(arm=>({seed,mode,arm}))));
function setup(job){
  const s=new ArcSim({seed:job.seed,W:24,H:24,seedCount:0,nA:4,nB:0,nC:16,nP:2,nQ:2,nE:4,sizeC:SIZE,
    stiffA:.8,stiffP:.8,stiffQ:.8,stiffC:.8,sigma:.3,sigmaRot:.45,bodyJostle:job.mode==='body16',iters:16,
    snapCorners:false,maxStrain:0,pUndock:0,pBreak:0,pFray:0,pUnzip:0,pMelt:0,pMeltRun:0,pMeltEnd:0,
    pSpont:0,pCapture:0,pSoft:0,pLigate:0,pReload:0,rimBind:false,maxEventLog:0,maxBirthLog:0});
  const units=t=>Array.from({length:s.n},(_,u)=>u).filter(u=>s.type[u]===t),p=units(T_P),q=units(T_Q),a=units(T_A),w=units(T_C),fuels=units(T_E);
  const chains=[[p[0],a[0],a[1],q[0]],[p[1],a[2],a[3],q[1]]],arcs=[w.slice(0,N),w.slice(N)];
  const pose=(u,x,y,angle)=>{s.px[u]=12+x;s.py[u]=10+y;s.pa[u]=angle;s._resetShape(u);};
  for(let h=0;h<2;h++){
    const tr=([x,y])=>h?[1-x,3-y]:[x,y];
    for(let k=0;k<4;k++){
      const u=chains[h][k],pos=tr([k===0||k===3?-.05:0,k]);pose(u,...pos,h*Math.PI);s.is[u]=h?I_DOCK:I_TPL;
      if(k)s._link(chains[h][k-1],R,u,L);
    }
    for(let k=0;k<N;k++){
      const theta=-Math.atan(2)-(k+.5)*TURN,center=rotate(centroid,theta),pos=tr([center[0]-1.25,center[1]+1.5]);
      pose(arcs[h][k],...pos,theta+h*Math.PI);
      if(k&&!(job.arm==='open'&&k===N/2))s._linkRim(arcs[h][k-1],K,arcs[h][k],F);
    }
    s._linkRim(chains[h][0],L,arcs[h][0],F);s._linkRim(arcs[h].at(-1),K,chains[h][3],R);
  }
  fuels.forEach((u,k)=>{s.px[u]=k%2?22:2;s.py[u]=k<2?2:22;s.pa[u]=0;s._resetShape(u);});
  const faces=chains[0].map((u,k)=>[u*4+F,chains[1][3-k]*4+F]);
  s._deriveAll();s._deriveAll();s._computeOpen();
  const compatibility=faces.map(([aa,bb])=>s.compat(aa>>2,F,bb>>2,F));
  for(const [aa,bb]of faces)s._link(aa>>2,F,bb>>2,F);
  s._deriveAll();s._deriveAll();s._computeOpen();s._buildHash();s._bondList();
  const ids={chains,arcs,fuels,faces,groups:chains.map((xs,h)=>[...xs,...arcs[h]]),
    caps:chains.flatMap(xs=>[xs[0],xs[3]]),closures:arcs.map(xs=>[xs[3]*4+K,xs[4]*4+F])};
  const metadata={W:s.p.W,H:s.p.H,types:[...s.type],sizes:[...s.size],edgeOf:[...s.edgeOf],
    p:s.p,cosTol:s.cosTol,cosTolRot:s.cosTolRot,cosLinkTol:s.cosLinkTol};
  return {s,ids,metadata,compatibility};
}
function frame(s){return {...g.frame(s),rimBonds:[...s.rimBond].flatMap((b,a)=>b>a?[[a,b]]:[])};}
function nearby(f,m,u,v){
  const dx=f.centers[v][0]-f.centers[u][0],dy=f.centers[v][1]-f.centers[u][1];
  return f.polygons[v].map(p=>[p[0]+wrap(dx,m.W)-dx,p[1]+wrap(dy,m.H)-dy]);
}
function side(f,m,u,i){
  const ps=f.polygons[u],k=m.edgeOf[m.types[u]*4+i],a=ps[k],b=ps[(k+1)%ps.length],d=Math.hypot(b[0]-a[0],b[1]-a[1]);
  return {a,b,mid:[(a[0]+b[0])/2,(a[1]+b[1])/2],normal:[(b[1]-a[1])/d,(a[0]-b[0])/d]};
}
function pin(f,m,aa,bb){
  const a=side(f,m,aa>>2,aa&3),b=side(f,m,bb>>2,bb&3),dist=(p,q)=>Math.hypot(wrap(p[0]-q[0],m.W),wrap(p[1]-q[1],m.H));
  return Math.max(dist(a.a,b.b),dist(a.b,b.a));
}
function geometryOK(f,m,u,i,v,j){
  const adapter={type:m.types,size:m.sizes,p:m.p,cosTol:m.cosTol,cosTolRot:m.cosTolRot,cosLinkTol:m.cosLinkTol,
    _side:(x,k,out)=>{const q=side(f,m,x,k);out[0]=q.mid[0]-f.centers[x][0];out[1]=q.mid[1]-f.centers[x][1];out[2]=q.normal[0];out[3]=q.normal[1];return out;}};
  const dx=wrap(f.centers[v][0]-f.centers[u][0],m.W),dy=wrap(f.centers[v][1]-f.centers[u][1],m.H);
  return Sim.prototype._geomOK.call(adapter,u,i,v,j,dx,dy,Math.hypot(dx,dy));
}
function pointSegment(p,a,b){
  const dx=b[0]-a[0],dy=b[1]-a[1],d=dx*dx+dy*dy,t=d?Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/d)):0;
  return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy);
}
function distance(a,b,overlap){
  if(overlap>1e-10)return 0;let d=Infinity;
  for(const [ps,qs]of [[a,b],[b,a]])for(const p of ps)for(let k=0;k<qs.length;k++)d=Math.min(d,pointSegment(p,qs[k],qs[(k+1)%qs.length]));
  return d;
}
function fuelProbe(f,m,cap,u){
  const a=side(f,m,cap,K),b=side(f,m,u,F),theta=Math.atan2(-a.normal[1],-a.normal[0])-Math.atan2(b.normal[1],b.normal[0]);
  const transform=p=>{const q=rotate([p[0]-b.mid[0],p[1]-b.mid[1]],theta);return[q[0]+a.mid[0],q[1]+a.mid[1]];};
  const trial={...f,centers:f.centers.map((p,k)=>k===u?transform(p):p),polygons:f.polygons.map((ps,k)=>k===u?ps.map(transform):ps)};
  let overlap=0;for(let v=0;v<m.types.length;v++)if(v!==u)overlap=Math.max(overlap,g.overlap(trial.polygons[u],nearby(trial,m,u,v)));
  return {overlap,polygon:trial.polygons[u]};
}
function measure(f,m,ids){
  let allOverlap=0,structuralOverlap=0,crossOverlap=0,crossGap=Infinity,maxPin=0;
  const group=new Map(ids.groups.flatMap((xs,h)=>xs.map(u=>[u,h])));
  for(let u=0;u<m.types.length;u++)for(let v=u+1;v<m.types.length;v++){
    const ps=nearby(f,m,u,v),overlap=g.overlap(f.polygons[u],ps);allOverlap=Math.max(allOverlap,overlap);
    if(group.has(u)&&group.has(v)){
      structuralOverlap=Math.max(structuralOverlap,overlap);
      if(group.get(u)!==group.get(v)){crossOverlap=Math.max(crossOverlap,overlap);crossGap=Math.min(crossGap,distance(f.polygons[u],ps,overlap));}
    }
  }
  for(const [aa,bb]of [...f.bonds,...f.rimBonds])maxPin=Math.max(maxPin,pin(f,m,aa,bb));
  return {allOverlap,structuralOverlap,crossOverlap,crossGap,maxPin,
    copying:ids.faces.map(([aa,bb])=>geometryOK(f,m,aa>>2,F,bb>>2,F)),
    closureGaps:ids.closures.map(([aa,bb])=>pin(f,m,aa,bb)),
    fuel:ids.caps.map((u,k)=>fuelProbe(f,m,u,ids.fuels[k]))};
}
function staticCheck(c){
  const {s,ids,metadata:m,compatibility}=setup(c.job),before=s.saveState(),f=frame(s),initial=measure(f,m,ids),translations=[];
  for(let k=0;k<=20;k++){
    const moved=structuredClone(f),dx=k/10;for(const u of ids.groups[1]){moved.centers[u][0]+=dx;for(const p of moved.polygons[u])p[0]+=dx;}
    translations.push({dx,crossOverlap:measure(moved,m,ids).crossOverlap});
  }
  const endContacts=[...f.rimBonds,...(c.job.arm==='open'?ids.closures:[])].map(([aa,bb])=>
    ({ports:[aa,bb],compatible:s.rimCompatible(aa>>2,aa&3,bb>>2,bb&3),eligible:s.polymerContact(aa>>2,aa&3,bb>>2,bb&3)}));
  const ownGeometry=ids.faces.map(([aa,bb])=>{const u=aa>>2,v=bb>>2,dx=s._dx(s.px[v]-s.px[u]),dy=s._dy(s.py[v]-s.py[u]);return s._geomOK(u,F,v,F,dx,dy,Math.hypot(dx,dy));});
  assert.deepEqual(initial.copying,ownGeometry);assert.deepEqual(g.comparable(before),g.comparable(s.saveState()));
  return {initial,translations,compatibility,endContacts,
    pass:initial.allOverlap<=1e-9&&initial.maxPin<=1e-9&&initial.closureGaps.every(x=>x<=1e-9)&&
      initial.copying.every(Boolean)&&compatibility.every(x=>x>0)&&initial.fuel.every(x=>x.overlap<=1e-9)&&
      translations.every(x=>x.crossOverlap<=1e-9)&&endContacts.every(x=>x.compatible&&x.eligible)};
}
function release(s,ids){for(const [a]of ids.faces)s._unlink(a>>2,F);s._computeOpen();}
function advance(s,c,kind){if(s.t===40)release(s,c.ids);s._physics();s.t++;counts[kind]++;}
function invariant(s,c){
  assert.equal(s.n,28);assert.deepEqual(s.check(),[]);const st=s.saveState();
  for(const k of ['type','nv','rx','ry','edgeOf','size','w','wr','rimBond','is'])assert.deepEqual(st.arrays[k],c.initial.arrays[k],k);
  const bytes=Buffer.from(c.initial.arrays.bond.b,'base64');
  for(let a=0;a<s.bond.length;a++)assert.equal(s.bond[a],s.t>40&&c.ids.faces.some(pair=>pair.includes(a))?-1:bytes.readInt32LE(a*4));
  for(const k of ['px','py','pa','ox','oy'])assert(s[k].every(Number.isFinite),k);
}
function run(c){
  const s=ArcSim.fromState(c.initial),plain=ArcSim.fromState(c.initial);let resumed;
  for(let t=0;t<=120;t++){
    if(t){advance(s,c,'observed');if(t>60)advance(resumed,c,'restart');}
    const f=frame(s),metrics=measure(f,c.metadata,c.ids);c.samples.push({frame:f,metrics});
    if(t<=5){invariant(s,c);assert(metrics.maxPin<=1,'Viability pin');}
    if(t===60){c.midpoint=s.saveState();resumed=ArcSim.fromState(c.midpoint);}
  }
  for(let t=0;t<120;t++)advance(plain,c,'plain');invariant(s,c);c.final=s.saveState();
  assert.deepEqual(g.comparable(c.final),g.comparable(plain.saveState()));assert.deepEqual(g.comparable(c.final),g.comparable(resumed.saveState()));
  c.neutral=true;c.restart=true;
}
function summarize(raw){
  const good=q=>q.metrics.maxPin<=.1&&q.metrics.structuralOverlap<=.02;
  const rows=raw.records.map(c=>{
    const held=c.samples.filter(q=>q.frame.t>=31&&q.frame.t<=40),released=c.samples.filter(q=>q.frame.t>=111);
    const clearance=c.samples.find(q=>q.frame.t>40&&q.metrics.crossGap>=.1)?.frame.t??null;
    return {...c.job,heldGood:held.every(q=>good(q)&&q.metrics.copying.every(Boolean)&&q.metrics.fuel.every(x=>x.overlap<=.02)),
      releasedGood:released.every(good),clearance,
      maxPin:Math.max(...c.samples.map(q=>q.metrics.maxPin)),maxStructuralOverlap:Math.max(...c.samples.map(q=>q.metrics.structuralOverlap)),
      maxAllOverlap:Math.max(...c.samples.map(q=>q.metrics.allOverlap)),heldPin:Math.max(...held.map(q=>q.metrics.maxPin)),
      heldOverlap:Math.max(...held.map(q=>q.metrics.structuralOverlap)),heldFuelOverlap:Math.max(...held.flatMap(q=>q.metrics.fuel.map(x=>x.overlap))),
      releasedPin:Math.max(...released.map(q=>q.metrics.maxPin)),releasedOverlap:Math.max(...released.map(q=>q.metrics.structuralOverlap)),
      finalClosureGaps:c.samples.at(-1).metrics.closureGaps};
  });
  rows.forEach(r=>r.pass=r.heldGood&&r.releasedGood&&r.clearance!==null);
  return {pass:raw.records.length===8&&raw.records.every(c=>c.static.pass)&&rows.filter(r=>r.arm==='closed').every(r=>r.pass),rows};
}
function validate(c,job){
  assert.deepEqual(c.job,job);const {s,ids,metadata,compatibility}=setup(job);assert.deepEqual(c.ids,ids);assert.deepEqual(c.metadata,metadata);
  assert.deepEqual(c.compatibility,compatibility);assert.deepEqual(g.comparable(c.initial),g.comparable(s.saveState()));
  assert.deepEqual(staticCheck(c),c.static);assert(c.neutral&&c.restart);assert.equal(c.samples.length,121);
  const replay=ArcSim.fromState(c.initial);
  for(let t=0;t<=120;t++){
    const q=c.samples[t];assert.deepEqual(measure(q.frame,c.metadata,c.ids),q.metrics,'Metric mismatch');
    if(t)advance(replay,c,'replay');assert.deepEqual(frame(replay),q.frame,'Frame mismatch');
    if(t===60)assert.deepEqual(g.comparable(replay.saveState()),g.comparable(c.midpoint));
  }
  invariant(replay,c);assert.deepEqual(g.comparable(replay.saveState()),g.comparable(c.final));
}
function main(){
  const validating=process.argv[2]==='--validate',file=process.argv[validating?3:2];assert(file);
  const target=validating?file+'.validation.json':file;assert(!fs.existsSync(target)&&!fs.existsSync(target+'.cpu.json'),'Refusing overwrite');
  const files=[...Object.keys(catalog.sources),'experiments/half_cell_arc.js','experiments/half_cell_arc_plan.md'];
  const r={command:process.argv.slice(1),catalog:CATALOG,catalogHash:hash(CATALOG),sources:Object.fromEntries(files.map(f=>[f,hash(f)])),
    design:{arcBlocks:N,innerRadius:RI,outerRadius:RO,sweep:SWEEP,turn:TURN,points:POINTS,area:AREA,size:SIZE},jobs:jobs(),records:[],complete:false};let error;
  try{
    for(const [f,h]of Object.entries(catalog.sources))assert.equal(hash(f),h,f);
    if(validating){
      const raw=read(file);assert(raw.complete);assert.deepEqual(raw.sources,r.sources);assert.deepEqual(raw.design,r.design);assert.deepEqual(raw.jobs,r.jobs);assert.equal(raw.records.length,8);
      for(let k=0;k<8;k++){validate(raw.records[k],r.jobs[k]);assert(cpu()<70,'Validation CPU ceiling');}
      assert.deepEqual(raw.summary,summarize(raw));
      const bad=structuredClone(raw.records[0]);bad.samples[1].frame.polygons[0][0][0]+=.3;assert.throws(()=>validate(bad,r.jobs[0]),/Metric mismatch/);
      const labels=structuredClone(raw.records[0]);labels.job.seed++;assert.throws(()=>validate(labels,r.jobs[0]));
      const bonds=structuredClone(raw.records[0]);bonds.samples[1].frame.rimBonds=[];assert.throws(()=>validate(bonds,r.jobs[0]));
      const aggregate=structuredClone(raw.summary);aggregate.pass=!aggregate.pass;assert.throws(()=>assert.deepEqual(aggregate,summarize(raw)));
      Object.assign(r,{rawHash:hash(file),summary:raw.summary,frames:8*121,corruptionsRejected:4});
    }else{
      for(const job of r.jobs){const {s,ids,metadata,compatibility}=setup(job),c={job,ids,metadata,compatibility,initial:s.saveState(),samples:[]};
        r.records.push(c);c.static=staticCheck(c);assert(c.static.pass,'Static geometry gate');invariant(s,c);
        const restored=ArcSim.fromState(c.initial);restored._bondList();assert.deepEqual(g.comparable(c.initial),g.comparable(restored.saveState()));
      }
      for(const c of r.records){run(c);assert(cpu()<70,'Execution CPU ceiling');}r.summary=summarize(r);
    }
    r.complete=true;
  }catch(e){error=e;r.error={message:e.message,stack:e.stack};}
  const bytes=Buffer.from(JSON.stringify(r)+'\n');fs.writeFileSync(target,validating?bytes:zlib.gzipSync(bytes),{flag:'wx'});
  const cost={cpuSeconds:cpu(),counts,complete:r.complete};fs.writeFileSync(target+'.cpu.json',JSON.stringify(cost)+'\n',{flag:'wx'});
  console.log(JSON.stringify({complete:r.complete,cost,design:r.design,pass:r.summary?.pass,rows:r.summary?.rows,error:r.error}));if(error)process.exitCode=1;
}
if(require.main===module)main();
module.exports={ArcSim,setup,frame,measure,summarize,validate};
