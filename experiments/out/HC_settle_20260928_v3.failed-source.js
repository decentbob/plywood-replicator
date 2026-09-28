#!/usr/bin/env node
'use strict';
const fs=require('fs'),zlib=require('zlib'),assert=require('assert/strict');
const {Sim,F,R,K,L,T_A,T_C,T_M,T_P,T_Q,I_ON,I_TPL}=require('../src/sim');
const {HalfCellPolymerSim}=require('./half_cell_polymer');
const g=require('./half_cell_geometry'),{hash}=require('./half_cell_rim_test');
const oldSources=JSON.parse(zlib.gunzipSync(fs.readFileSync('experiments/out/HC_polymer_20260928_v2.json.gz'))).sources;
const sources=()=>Object.fromEntries([...Object.keys(oldSources),'experiments/half_cell_settle.js','experiments/half_cell_settle_plan.md'].map(f=>[f,hash(f)]));
const cpu=()=>{const c=process.cpuUsage();return(c.user+c.system)/1e6;};
const counts={observed:0,plain:0,restart:0,replay:0};
const jobs=()=>['Pattach','Qattach','Pextend','Qextend','M+','M-'].flatMap(fixture=>
  [733,739].flatMap(seed=>['body16','individual16'].flatMap(mode=>['on','off'].map(arm=>({fixture,seed,mode,arm})))));
class SettleSim extends HalfCellPolymerSim {
  _polygonContacts(){
    const pairs=[];
    for(let u=0;u<this.n;u++){
      assert([T_A,T_C,T_M,T_P,T_Q].includes(this.type[u]));
      for(let v=u+1;v<this.n;v++)if(!this.bond.subarray(u*4,u*4+4).some(q=>q>=0&&(q>>2)===v))pairs.push(u,v);
    }
    return pairs;
  }
  step(){throw Error('Prepared mechanical assay: use physics-only advance');}
}
function align(s,u,i,v,j){
  const a=s._side(u,i,[0,0,0,0]),b=s._side(v,j,[0,0,0,0]);
  s._rigidMove(v,0,0,Math.atan2(-a[3],-a[2])-Math.atan2(b[3],b[2]));
  const c=s._side(v,j,[0,0,0,0]);s._rigidMove(v,s._dx(s.px[u]+a[0]-s.px[v]-c[0]),s._dy(s.py[u]+a[1]-s.py[v]-c[1]),0);
}
function setup(job){
  const native=job.fixture[0]==='M',p=job.fixture[0]==='P';
  const s=new SettleSim({seed:job.seed,W:24,H:24,seedCount:0,nA:1,nB:0,nE:0,nC:native?0:3,
    nP:!native&&p?1:0,nQ:!native&&!p?1:0,nM:native?4:0,sizeC:.5,sizeM:.5,memAngle:45,
    stiffA:.8,stiffP:.8,stiffQ:.8,stiffC:.8,stiffM:.8,mobM:1,sigma:.3,sigmaRot:.45,
    bodyJostle:job.mode==='body16',iters:16,snapCorners:false,maxStrain:0,pUndock:0,
    pBreak:0,pMemDecay:0,pFray:0,pUnzip:0,pMelt:0,pMeltRun:0,pMeltEnd:0,rimBind:false,
    pSpont:0,pCapture:0,pSoft:0,pLigate:0,pReload:0,maxEventLog:0,maxBirthLog:0});
  for(let u=0;u<s.n;u++){s.px[u]=2+u*3;s.py[u]=3;s.pa[u]=0;s._resetShape(u);s.is[u]=s.type[u]===T_M?I_ON:I_TPL;}
  const units=t=>Array.from({length:s.n},(_,u)=>u).filter(u=>s.type[u]===t);
  let u,i,v,j,probe,probeSide,tipSide;
  if(native){
    const [root,anchor,incoming,spare]=units(T_M);u=root;v=incoming;probe=spare;
    i=job.fixture==='M+'?R:L;j=i===R?L:R;tipSide=i;probeSide=j;
    s.px[u]=s.py[u]=12;align(s,u,j,anchor,i);s._link(u,j,anchor,i);
  }else{
    const cap=units(p?T_P:T_Q)[0],rail=units(T_A)[0],[first,second,spare]=units(T_C);
    s.px[cap]=s.py[cap]=12;const railSide=p?R:L,rimSide=p?L:R,join=p?F:K;
    align(s,cap,railSide,rail,railSide===R?L:R);s._link(cap,railSide,rail,railSide===R?L:R);
    if(job.fixture.endsWith('extend')){
      align(s,cap,rimSide,first,join);s._linkRim(cap,rimSide,first,join);
      u=first;i=join===F?K:F;v=second;j=join;
    }else{u=cap;i=rimSide;v=first;j=join;}
    probe=spare;tipSide=j===F?K:F;probeSide=j;
  }
  align(s,u,i,v,j);
  const label=native?(j===R?1:-1):s.rimLabel(v,j),angle=-label*Math.PI/6;
  s._rigidMove(v,0,0,angle);
  const ac=s._sideCorners(u,i,[0,0]),bc=s._sideCorners(v,j,[0,0]),a=ac[label<0?1:0],b=bc[label>0?1:0];
  s._rigidMove(v,s._dx(s.px[u]+s.ox[a]-s.px[v]-s.ox[b]),s._dy(s.py[u]+s.oy[a]-s.py[v]-s.oy[b]),0);
  s._deriveAll();s._deriveAll();s._computeOpen();s._buildHash();s._bondList();
  const dx=s._dx(s.px[v]-s.px[u]),dy=s._dy(s.py[v]-s.py[u]);
  const eligible=native?Sim.prototype._geomOK.call(s,u,i,v,j,dx,dy,Math.hypot(dx,dy)):s.polymerContact(u,i,v,j);
  assert(eligible,'Prepared contact ineligible');if(native)assert.equal(s.compat(u,i,v,j),.2);
  const pose=s.saveState();
  if(job.arm==='on'){if(native)Sim.prototype._formBond.call(s,u,i,v,j);else s._linkRim(u,i,v,j);}
  for(const key of ['px','py','pa','ox','oy'])assert.deepEqual(s.saveState().arrays[key],pose.arrays[key]);
  s._bondList();
  const metadata={W:s.p.W,H:s.p.H,types:[...s.type],sizes:[...s.size],edgeOf:[...s.edgeOf],
    distTol:s.p.distTol,tolDeg:s.p.tolDeg,tolRotDeg:s.p.tolRotDeg};
  return {s,ids:{u,i,v,j,probe,probeSide,tipSide,native},metadata,eligible,angle};
}
function frame(s){return {...g.frame(s),rimBonds:[...s.rimBond].flatMap((b,a)=>b>a?[[a,b]]:[])};}
const wrap=(x,w)=>x-w*Math.round(x/w);
function nearbyPolygon(f,m,u,v){
  const dx=f.centers[v][0]-f.centers[u][0],dy=f.centers[v][1]-f.centers[u][1];
  return f.polygons[v].map(p=>[p[0]+wrap(dx,m.W)-dx,p[1]+wrap(dy,m.H)-dy]);
}
function side(f,m,u,i){
  const ps=f.polygons[u],k=m.edgeOf[m.types[u]*4+i],a=ps[k],b=ps[(k+1)%ps.length],d=Math.hypot(b[0]-a[0],b[1]-a[1]);
  return {a,b,mid:[(a[0]+b[0])/2,(a[1]+b[1])/2],normal:[(b[1]-a[1])/d,(a[0]-b[0])/d]};
}
function pinGap(f,m,u,i,v,j){
  const a=side(f,m,u,i),b=side(f,m,v,j),dist=(p,q)=>Math.hypot(wrap(p[0]-q[0],m.W),wrap(p[1]-q[1],m.H));
  return Math.max(dist(a.a,b.b),dist(a.b,b.a));
}
function probe(f,m,ids){
  const {v,tipSide,probe:u,probeSide}=ids,a=side(f,m,v,tipSide),b=side(f,m,u,probeSide);
  const rot=Math.atan2(-a.normal[1],-a.normal[0])-Math.atan2(b.normal[1],b.normal[0]),c=Math.cos(rot),s=Math.sin(rot);
  const transform=p=>{const x=p[0]-b.mid[0],y=p[1]-b.mid[1];return[a.mid[0]+c*x-s*y,a.mid[1]+s*x+c*y];};
  const centers=f.centers.map((p,k)=>k===u?transform(p):p),polygons=f.polygons.map((p,k)=>k===u?p.map(transform):p);
  const trial={...f,centers,polygons};let overlap=0;
  for(let k=0;k<m.types.length;k++)if(k!==u)overlap=Math.max(overlap,g.overlap(polygons[u],nearbyPolygon(trial,m,u,k)));
  const occupied=[...f.bonds,...f.rimBonds].some(pair=>pair.includes(v*4+tipSide));
  return {overlap,pin:pinGap(trial,m,v,tipSide,u,probeSide),occupied,polygon:polygons[u]};
}
function measure(f,m,ids){
  let overlap=0,pin=0;
  for(let u=0;u<m.types.length;u++)for(let v=u+1;v<m.types.length;v++)overlap=Math.max(overlap,g.overlap(f.polygons[u],nearbyPolygon(f,m,u,v)));
  for(const [a,b]of [...f.bonds,...f.rimBonds])pin=Math.max(pin,pinGap(f,m,a>>2,a&3,b>>2,b&3));
  const candidate=pinGap(f,m,ids.u,ids.i,ids.v,ids.j),p=probe(f,m,ids);
  return {overlap,pin,candidate,probe:p};
}
function invariant(s,c){
  assert.equal(s.n,5);assert.deepEqual(s.check(),[]);const state=s.saveState();
  for(const key of ['type','nv','rx','ry','edgeOf','size','w','wr','bond','rimBond','is'])assert.deepEqual(state.arrays[key],c.initial.arrays[key],key);
  for(const key of ['px','py','pa','ox','oy'])assert(s[key].every(Number.isFinite),key);
}
function advance(s,kind){s._physics();s.t++;counts[kind]++;}
function run(c){
  const s=SettleSim.fromState(c.initial),plain=SettleSim.fromState(c.initial);let resumed;
  for(let t=0;t<=60;t++){
    if(t){advance(s,'observed');if(t>30)advance(resumed,'restart');}
    const f=frame(s),metrics=measure(f,c.metadata,c.ids);c.samples.push({frame:f,metrics});
    if(t<=5){invariant(s,c);assert(metrics.pin<=1,'Viability pin residual');}
    if(t===30){c.midpoint=s.saveState();resumed=SettleSim.fromState(c.midpoint);}
  }
  for(let t=0;t<60;t++)advance(plain,'plain');invariant(s,c);c.final=s.saveState();
  assert.deepEqual(g.comparable(c.final),g.comparable(plain.saveState()));
  assert.deepEqual(g.comparable(c.final),g.comparable(resumed.saveState()));c.neutral=true;c.restart=true;
}
const good=q=>q.pin<=.1&&q.overlap<=.02&&!q.probe.occupied&&q.probe.pin<=.1&&q.probe.overlap<=.02;
function summarize(raw){
  const rows=raw.records.map(c=>{const tail=c.samples.slice(-10);return {...c.job,
    pass:tail.every(q=>good(q.metrics))&&(c.job.arm==='off'||tail.every(q=>q.metrics.candidate<=.1)),
    candidateAligned:tail.every(q=>q.metrics.candidate<=.1),
    firstPersistentGood:c.samples.findIndex((q,k)=>good(q.metrics)&&c.samples.slice(k).every(x=>good(x.metrics))),
    maxPin:Math.max(...c.samples.map(q=>q.metrics.pin)),maxOverlap:Math.max(...c.samples.map(q=>q.metrics.overlap)),
    tailPin:Math.max(...tail.map(q=>q.metrics.pin)),tailOverlap:Math.max(...tail.map(q=>q.metrics.overlap)),
    tailProbeOverlap:Math.max(...tail.map(q=>q.metrics.probe.overlap)),tailProbePin:Math.max(...tail.map(q=>q.metrics.probe.pin))};});
  const groups=[];for(const fixture of [...new Set(rows.map(r=>r.fixture))])for(const mode of ['body16','individual16']){
    const on=rows.filter(r=>r.fixture===fixture&&r.mode===mode&&r.arm==='on'),off=rows.filter(r=>r.fixture===fixture&&r.mode===mode&&r.arm==='off');
    groups.push({fixture,mode,onPass:on.filter(r=>r.pass).length,offAligned:off.filter(r=>r.candidateAligned).length,
      benefit:on.some(r=>r.pass&&!off.find(x=>x.seed===r.seed).candidateAligned)});
  }
  return {pass:rows.length===48&&rows.filter(r=>r.arm==='on').every(r=>r.pass)&&groups.every(r=>r.benefit),groups,rows};
}
function validate(c,job){
  assert.deepEqual(c.job,job);const prepared=setup(job);assert.deepEqual(c.ids,prepared.ids);assert.deepEqual(c.metadata,prepared.metadata);
  assert.deepEqual(g.comparable(c.initial),g.comparable(prepared.s.saveState()));assert(c.neutral&&c.restart);assert.equal(c.samples.length,61);
  const s=SettleSim.fromState(c.initial);
  for(let t=0;t<=60;t++){
    const q=c.samples[t];assert.deepEqual(measure(q.frame,c.metadata,c.ids),q.metrics,'Metric mismatch');
    if(t)advance(s,'replay');assert.deepEqual(frame(s),q.frame,'Frame mismatch');
    if(t===30)assert.deepEqual(g.comparable(s.saveState()),g.comparable(c.midpoint));
  }
  invariant(s,c);assert.deepEqual(g.comparable(s.saveState()),g.comparable(c.final));
}
function main(){
  const validating=process.argv[2]==='--validate',file=process.argv[validating?3:2];assert(file);
  const target=validating?file+'.validation.json':file;assert(!fs.existsSync(target)&&!fs.existsSync(target+'.cpu.json'),'Refusing overwrite');
  const r={command:process.argv.slice(1),sources:sources(),jobs:jobs(),records:[],complete:false};let error;
  try{
    for(const [f,h]of Object.entries(oldSources))assert.equal(hash(f),h,f);
    if(validating){
      const raw=JSON.parse(zlib.gunzipSync(fs.readFileSync(file)));assert(raw.complete);assert.deepEqual(raw.sources,r.sources);assert.deepEqual(raw.jobs,r.jobs);assert.equal(raw.records.length,48);
      for(let k=0;k<48;k++){validate(raw.records[k],r.jobs[k]);assert(cpu()<45,'Validation CPU ceiling');}
      assert.deepEqual(summarize(raw),raw.summary);
      const bad=structuredClone(raw.records[0]);bad.samples[1].frame.polygons[0][0][0]+=.3;assert.throws(()=>validate(bad,r.jobs[0]),/Metric mismatch/);
      const labels=structuredClone(raw.records[0]);labels.job.seed++;assert.throws(()=>validate(labels,r.jobs[0]));
      const bonds=structuredClone(raw.records[0]);bonds.samples[1].frame.rimBonds=[];assert.throws(()=>validate(bonds,r.jobs[0]));
      const aggregate=structuredClone(raw.summary);aggregate.pass=!aggregate.pass;assert.throws(()=>assert.deepEqual(aggregate,summarize(raw)));
      Object.assign(r,{rawHash:hash(file),summary:raw.summary,frames:48*61,corruptionsRejected:4});
    }else{
      for(const job of r.jobs){const {s,ids,metadata,eligible,angle}=setup(job),initial=s.saveState();
        const c={job,ids,metadata,initial,eligible,angle,samples:[]};r.records.push(c);
        assert(measure(frame(s),metadata,ids).overlap<=1e-9,'Initial overlap');invariant(s,c);
        assert.deepEqual(g.comparable(initial),g.comparable(SettleSim.fromState(initial).saveState()));
      }
      for(const c of r.records){run(c);assert(cpu()<45,'Execution CPU ceiling');}r.summary=summarize(r);
    }
    r.complete=true;
  }catch(e){error=e;r.error={message:e.message,stack:e.stack};}
  const bytes=Buffer.from(JSON.stringify(r)+'\n');fs.writeFileSync(target,validating?bytes:zlib.gzipSync(bytes),{flag:'wx'});
  const cost={cpuSeconds:cpu(),counts,complete:r.complete};fs.writeFileSync(target+'.cpu.json',JSON.stringify(cost)+'\n',{flag:'wx'});
  console.log(JSON.stringify({complete:r.complete,cost,pass:r.summary?.pass,groups:r.summary?.groups,error:r.error}));if(error)process.exitCode=1;
}
if(require.main===module)main();
module.exports={SettleSim,setup,frame,measure,summarize,validate};
