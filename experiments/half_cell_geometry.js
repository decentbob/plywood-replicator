#!/usr/bin/env node
'use strict';
// Prepared polygon access only. Never enable ordinary chemistry on rim carrier slots.
const fs = require('fs'), path = require('path'), crypto = require('crypto'), assert = require('assert/strict');
const { Sim, NV, F, R, K, L, T_A, T_C, T_E, T_P, T_Q, I_TPL } = require('../src/sim');
const SOURCES = ['src/sim.js', 'experiments/half_cell_geometry.js', 'experiments/half_cell_geometry_plan.md'];
const cpu = () => { const c = process.cpuUsage(); return (c.user + c.system) / 1e6; };
const steps={observed:0,plain:0,restart:0};
const hash = f => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const clone = x => structuredClone(x), wrap = (x, w) => x - w * Math.round(x / w);
const width = Math.sqrt(5) / 4;
const shapes = {
  [T_P]: { points: [[.5,-.5],[.5,.5],[-.5,.5],[-.5,0],[-.25,-.5]], edges: [0,1,2,3] },
  [T_Q]: { points: [[.5,-.5],[.5,.5],[-.25,.5],[-.5,0],[-.5,-.5]], edges: [0,2,3,4] },
  [T_C]: { points: [[.25,-width/2],[.25,width/2],[-.25,width/2],[-.25,-width/2]], edges: [0,1,2,3] }
};
const mean = ps => ps.reduce((a,p) => [a[0]+p[0]/ps.length,a[1]+p[1]/ps.length], [0,0]);
const rotate = (p,a) => [p[0]*Math.cos(a)-p[1]*Math.sin(a),p[0]*Math.sin(a)+p[1]*Math.cos(a)];
class HalfCellGeometrySim extends Sim {
  _initGeometry() {
    super._initGeometry();
    for (const [key,shape] of Object.entries(shapes)) {
      const t=Number(key), m=mean(shape.points); this.nv[t]=shape.points.length;
      shape.points.forEach((p,k) => { this.rx[t*NV+k]=p[0]-m[0]; this.ry[t*NV+k]=p[1]-m[1]; });
      shape.edges.forEach((e,i) => this.edgeOf[t*4+i]=e);
    }
    for(let u=0;u<this.n;u++) { this.vw[u]=this.nv[this.type[u]]*this.w[u]; this._resetShape(u); }
  }
  step() { throw Error('Geometry fixture: ordinary steps are forbidden'); }
  _chemistry() { throw Error('Geometry fixture: chemistry is forbidden'); }
  _formBonds() { throw Error('Geometry fixture: binding is forbidden'); }
  _formBond() { throw Error('Geometry fixture: binding is forbidden'); }
}
function jobs() {
  return [611,613].flatMap(seed => ['body4','individual4','individual16'].flatMap(mode =>
    ['P','Q'].flatMap(end => ['attached','unbound'].map(arm => ({seed,mode,end,arm})))));
}
function setup(job, turn=0) {
  const s=new HalfCellGeometrySim({seed:job.seed,W:24,H:24,seedCount:0,nA:2,nB:0,nC:2,nP:1,nQ:1,nE:2,
    sizeC:.5,stiffA:.8,stiffP:.8,stiffQ:.8,stiffC:.8,sigma:.3,sigmaRot:.45,
    bodyJostle:job.mode==='body4',iters:job.mode==='individual16'?16:4,snapCorners:false,maxStrain:0,
    pBreak:0,pFray:0,pUnzip:0,pSpont:0,pCapture:0,pSoft:0,pLigate:0,maxEventLog:0,maxBirthLog:0});
  const units=t => Array.from({length:s.n},(_,u)=>u).filter(u=>s.type[u]===t);
  const caps=job.end==='P'?[units(T_P)[0],units(T_Q)[0]]:[units(T_Q)[0],units(T_P)[0]];
  const letters=units(T_A), rims=units(T_C), fuels=units(T_E), sign=job.end==='P'?1:-1;
  function pose(u,x,y,a,uncentered=false) {
    const m=uncentered?rotate(mean(shapes[s.type[u]].points),a):[0,0];
    s.px[u]=12+x+m[0];s.py[u]=12+y+m[1];s.pa[u]=a;s._resetShape(u);s.is[u]=I_TPL;
  }
  function mate(u,side,v) {
    const q=s._side(u,side,[0,0,0,0]), a=Math.atan2(-q[3],-q[2]);
    s.pa[v]=a;s._resetShape(v);const vside=s._side(v,F,[0,0,0,0]);
    s.px[v]=s.px[u]+q[0]-vside[0];s.py[v]=s.py[u]+q[1]-vside[1];
  }
  for(let h=0;h<2;h++) {
    const cap=caps[h],a=-Math.PI/2+h*Math.PI,rail=s.type[cap]===T_P?R:L,rim=s.type[cap]===T_P?L:R;
    pose(cap,0,-h,a,true);pose(letters[h],sign,-h,a);
    s._link(cap,rail,letters[h],rail===R?L:R);
    mate(cap,rim,rims[h]);mate(cap,K,fuels[h]);
    if(job.arm==='attached')s._link(cap,rim,rims[h],F);
  }
  s._link(caps[0],F,caps[1],F);s._link(letters[0],F,letters[1],F);
  if(turn)for(let u=0;u<s.n;u++) {
    const p=rotate([s.px[u]-12,s.py[u]-12],turn);s.px[u]=12+p[0];s.py[u]=12+p[1];
    s.pa[u]+=turn;for(let k=u*NV;k<u*NV+s.corners(u);k++){const q=rotate([s.ox[k],s.oy[k]],turn);s.ox[k]=q[0];s.oy[k]=q[1];}
  }
  s._computeOpen();s._buildHash();s._bondList();assert.equal(s.n,8);assert.deepEqual(s.check(),[]);
  const ids={caps,letters,rims,fuels,groups:[0,1].map(h=>[caps[h],letters[h],...(job.arm==='attached'?[rims[h]]:[])]),
    moving:[caps[1],letters[1],rims[1],fuels[1]]};
  return {s,ids};
}
function metadata(s) { return {W:s.p.W,H:s.p.H,types:[...s.type],sizes:[...s.size],edgeOf:[...s.edgeOf],
  distTol:s.p.distTol,tolDeg:s.p.tolDeg,tolRotDeg:s.p.tolRotDeg}; }
function frame(s) {
  return {t:s.t,centers:Array.from({length:s.n},(_,u)=>[s.px[u],s.py[u]]),
    polygons:Array.from({length:s.n},(_,u)=>Array.from({length:s.corners(u)},(_,k)=>[s.px[u]+s.ox[u*NV+k],s.py[u]+s.oy[u*NV+k]])),
    bonds:Array.from(s.bond).flatMap((q,a)=>q>a?[[a,q]]:[])};
}
const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
function hull(ps) {
  const sorted=ps.map(p=>[...p]).sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
  const half=xs=>{const out=[];for(const p of xs){while(out.length>1&&cross(out.at(-2),out.at(-1),p)<=1e-12)out.pop();out.push(p);}return out;};
  return [...half(sorted).slice(0,-1),...half([...sorted].reverse()).slice(0,-1)];
}
function area(ps) { return Math.abs(ps.reduce((a,p,i)=>{const q=ps[(i+1)%ps.length];return a+p[0]*q[1]-p[1]*q[0];},0))/2; }
function overlap(a,b) {
  let out=hull(a);const clip=hull(b);
  for(let i=0;i<clip.length;i++) {
    const p=clip[i],q=clip[(i+1)%clip.length],input=out;out=[];if(!input.length)break;
    for(let j=0;j<input.length;j++) {
      const v=input[j],w=input[(j+1)%input.length],cv=cross(p,q,v),cw=cross(p,q,w);
      if(cv>=-1e-12)out.push(v);
      if((cv>=0)!==(cw>=0)){const t=cv/(cv-cw);out.push([v[0]+t*(w[0]-v[0]),v[1]+t*(w[1]-v[1])]);}
    }
  }
  return out.length>2?area(out):0;
}
function nearbyPolygon(f,m,u,v) {
  const a=f.centers[u],b=f.centers[v],dx=wrap(b[0]-a[0],m.W)-(b[0]-a[0]),dy=wrap(b[1]-a[1],m.H)-(b[1]-a[1]);
  return f.polygons[v].map(p=>[p[0]+dx,p[1]+dy]);
}
function side(f,m,u,i) {
  const poly=f.polygons[u],edge=m.edgeOf[m.types[u]*4+i],a=poly[edge],b=poly[(edge+1)%poly.length];
  const len=Math.hypot(b[0]-a[0],b[1]-a[1]);
  return {a,b,mid:[(a[0]+b[0])/2,(a[1]+b[1])/2],normal:[(b[1]-a[1])/len,(a[0]-b[0])/len]};
}
function contact(f,m,u,i,v,j) {
  const a=side(f,m,u,i),b=side(f,m,v,j),du=f.centers[u],dv=f.centers[v];
  const dx=wrap(dv[0]-du[0],m.W),dy=wrap(dv[1]-du[1],m.H),d=Math.hypot(dx,dy),d0=(m.sizes[u]+m.sizes[v])/2;
  const delta=(p,q)=>[wrap(q[0]-p[0],m.W),wrap(q[1]-p[1],m.H)];
  const gap=Math.hypot(...delta(a.mid,b.mid));
  const pin=Math.max(Math.hypot(...delta(a.a,b.b)),Math.hypot(...delta(a.b,b.a)));
  const cos=x=>Math.cos(x*Math.PI/180),dot=a.normal[0]*b.normal[0]+a.normal[1]*b.normal[1];
  return {gap,pin,eligible:d>=d0*(1-m.distTol)&&d<=d0*(1+m.distTol)&&gap<=d0*m.distTol&&
    (a.normal[0]*dx+a.normal[1]*dy)/d>=cos(m.tolDeg)&&-(b.normal[0]*dx+b.normal[1]*dy)/d>=cos(m.tolDeg)&&dot<=-cos(m.tolRotDeg)};
}
function fuelProbe(f,m,cap,u) {
  const port=side(f,m,cap,K),a=Math.atan2(-port.normal[1],-port.normal[0]);
  const offset=rotate([.25,0],a),center=[port.mid[0]-offset[0],port.mid[1]-offset[1]];
  const ps=[[.25,-.25],[.25,.25],[-.25,.25],[-.25,-.25]].map(p=>{const q=rotate(p,a);return [q[0]+center[0],q[1]+center[1]];});
  const f2={...f,centers:f.centers.map((p,v)=>v===u?center:p),polygons:f.polygons.map((p,v)=>v===u?ps:p)};
  let maxOverlap=0;for(let v=0;v<m.types.length;v++)if(v!==u)maxOverlap=Math.max(maxOverlap,overlap(ps,nearbyPolygon(f2,m,u,v)));
  return {maxOverlap,contact:contact(f2,m,cap,K,u,F)};
}
function pointSegment(p,a,b) {
  const dx=b[0]-a[0],dy=b[1]-a[1],l=dx*dx+dy*dy;
  const t=l?Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/l)):0;
  return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy);
}
function distance(a,b) {
  if(overlap(a,b)>1e-10)return 0;
  let d=Infinity;for(const [p,q] of [[a,b],[b,a]])for(const x of p)for(let i=0;i<q.length;i++)d=Math.min(d,pointSegment(x,q[i],q[(i+1)%q.length]));
  return d;
}
function measure(f,m,ids) {
  let maxOverlap=0,maxHullExcess=0,maxPin=0,crossOverlap=0,minCrossGap=Infinity;
  for(let u=0;u<m.types.length;u++) {
    maxHullExcess=Math.max(maxHullExcess,area(hull(f.polygons[u]))-area(f.polygons[u]));
    for(let v=u+1;v<m.types.length;v++)maxOverlap=Math.max(maxOverlap,overlap(f.polygons[u],nearbyPolygon(f,m,u,v)));
  }
  for(const [a,b] of f.bonds)if(m.types[a>>2]!==T_E&&m.types[b>>2]!==T_E)maxPin=Math.max(maxPin,contact(f,m,a>>2,a&3,b>>2,b&3).pin);
  for(const u of ids.groups[0])for(const v of ids.groups[1]) {
    const a=f.polygons[u],b=nearbyPolygon(f,m,u,v);crossOverlap=Math.max(crossOverlap,overlap(a,b));minCrossGap=Math.min(minCrossGap,distance(a,b));
  }
  return {maxOverlap,maxHullExcess,maxPin,crossOverlap,minCrossGap,
    copying:[ids.caps,ids.letters].map(([u,v])=>contact(f,m,u,F,v,F)),
    fuel:ids.caps.map((u,h)=>fuelProbe(f,m,u,ids.fuels[h]))};
}
function good(x) { return x.maxPin<=.1&&x.maxOverlap<=.02&&x.copying.every(c=>c.eligible)&&x.fuel.every(p=>p.maxOverlap<=.02); }
function staticCases() {
  const records=[];
  for(const end of ['P','Q'])for(const turn of [0,Math.PI/2]) {
    const {s,ids}=setup({end,arm:'attached',seed:611,mode:'body4'},turn),m=metadata(s),start=frame(s),samples=[];
    const direction=rotate([0,-1],turn);
    for(let k=0;k<=20;k++) {
      const f=clone(start),d=k/10;
      for(const u of ids.moving){f.centers[u]=f.centers[u].map((x,i)=>x+d*direction[i]);f.polygons[u]=f.polygons[u].map(p=>p.map((x,i)=>x+d*direction[i]));}
      f.bonds=f.bonds.filter(([a,b])=>!([ids.caps,ids.letters].some(pair=>pair.includes(a>>2)&&pair.includes(b>>2)&&(a&3)===F&&(b&3)===F)));
      samples.push({displacement:d,frame:f,metrics:measure(f,m,ids)});
    }
    const at0=measure(start,m,ids),contacts=start.bonds.map(([a,b])=>contact(start,m,a>>2,a&3,b>>2,b&3));
    const engineCopy=[ids.caps,ids.letters].map(([u,v])=>s._geomOK(u,F,v,F,s._dx(s.px[v]-s.px[u]),s._dy(s.py[v]-s.py[u]),Math.hypot(s._dx(s.px[v]-s.px[u]),s._dy(s.py[v]-s.py[u]))));
    records.push({end,turn,metadata:m,ids,initial:start,contacts,engineCopy,samples,
      pass:samples.every(q=>q.metrics.maxOverlap<=1e-9)&&contacts.every(q=>q.pin<=1e-9)&&
        at0.copying.every(q=>q.eligible)&&at0.fuel.every(q=>q.maxOverlap<=1e-9&&q.contact.eligible&&q.contact.pin<=1e-9)&&engineCopy.every(Boolean)});
  }
  return records;
}
function advance(s,kind='observed') { s._physics();s.t++;steps[kind]++; }
function release(s,ids) { for(const u of [ids.caps[0],ids.letters[0]])s._unlink(u,F);s._computeOpen(); }
function comparable(st) { const v=clone(st);delete v.nums.pinsVersion;return v; }
function invariant(s,initial,ids) {
  assert.deepEqual(s.check(),[]);assert.equal(s.n,8);
  const now=s.saveState();for(const k of ['type','nv','rx','ry','edgeOf','size','w','wr'])assert.deepEqual(now.arrays[k],initial.arrays[k],k);
  const b=HalfCellGeometrySim.fromState(initial).bond;
  for(let a=0;a<b.length;a++)if(b[a]>=0) {
    const released=s.t>100&&(a%4===F)&&[...ids.caps,...ids.letters].includes(a>>2);
    assert.equal(s.bond[a],released?-1:b[a]);
  }
}
function runCase(job,retain=()=>{}) {
  const {s,ids}=setup(job),initial=s.saveState(),m=metadata(s),plain=HalfCellGeometrySim.fromState(initial),samples=[];
  const record={job,ids,metadata:m,initial,samples,neutral:false,restart:false};retain(record);
  const capture=()=>{const f=frame(s);samples.push({frame:f,metrics:measure(f,m,ids)});};capture();
  for(let t=1;t<=100;t++){advance(s);capture();if(t<=5){invariant(s,initial,ids);assert(samples.at(-1).metrics.maxPin<=1,'viability pin error');}}
  const midpoint=s.saveState(),resumed=HalfCellGeometrySim.fromState(midpoint);record.midpoint=midpoint;release(s,ids);release(resumed,ids);
  for(let t=101;t<=200;t++){advance(s);advance(resumed,'restart');capture();}
  for(let t=1;t<=100;t++)advance(plain,'plain');release(plain,ids);for(let t=101;t<=200;t++)advance(plain,'plain');
  invariant(s,initial,ids);const final=s.saveState();
  record.final=final;
  assert.deepEqual(comparable(final),comparable(plain.saveState()),'observer affects physical state/RNG');
  assert.deepEqual(comparable(final),comparable(resumed.saveState()),'restart mismatch');
  record.neutral=true;record.restart=true;return record;
}
function summarize(r) {
  const rows=r.records.map(c=>{const tail=c.samples.filter(q=>q.frame.t>=76&&q.frame.t<=100).map(q=>q.metrics);
    return {...c.job,goodHeld:tail.filter(good).length,maxTailPin:Math.max(...tail.map(x=>x.maxPin)),
      maxTailOverlap:Math.max(...tail.map(x=>x.maxOverlap)),maxTailFuelOverlap:Math.max(...tail.flatMap(x=>x.fuel.map(p=>p.maxOverlap))),
      firstClear:c.samples.find(q=>q.frame.t>100&&q.metrics.minCrossGap>=.1)?.frame.t??null,
      maxReleasedCrossOverlap:Math.max(...c.samples.filter(q=>q.frame.t>100).map(q=>q.metrics.crossOverlap))};});
  const staticPass=r.static.length===4&&r.static.every(x=>x.pass);
  const physicalPass=rows.length===24&&rows.filter(x=>x.mode!=='individual4').every(x=>x.goodHeld>=24);
  return {staticPass,physicalPass,admitted:staticPass&&physicalPass,rows};
}
function selfCheck() {
  const a=[[0,0],[1,0],[1,1],[0,1]];
  assert.equal(overlap(a,a.map(([x,y])=>[x+1,y])),0);
  assert(Math.abs(overlap(a,a.map(([x,y])=>[x+.5,y]))-.5)<1e-12);
  assert(Math.abs(overlap(a,[[.2,.2],[.8,.2],[.8,.8],[.2,.8]])-.36)<1e-12);
  assert.equal(distance(a,a.map(([x,y])=>[x+2,y])),1);
  const {s}=setup(jobs()[0]);assert.throws(()=>s.step(),/forbidden/);assert.throws(()=>s._chemistry(),/forbidden/);
}
function validateRecord(c,replay=true) {
  assert.equal(c.samples.length,201);assert(c.neutral&&c.restart);
  const {s,ids}=setup(c.job);assert.deepEqual(ids,c.ids);assert.deepEqual(comparable(s.saveState()),comparable(c.initial));assert.deepEqual(metadata(s),c.metadata);
  for(let t=0;t<=200;t++) {
    const sample=c.samples[t];assert.equal(sample.frame.t,t);assert.deepEqual(measure(sample.frame,c.metadata,c.ids),sample.metrics,'frame metrics mismatch');
    if(replay){if(t===101)release(s,ids);if(t)advance(s);assert.deepEqual(frame(s),sample.frame,'trajectory frame mismatch');if(t===100)assert.deepEqual(comparable(s.saveState()),comparable(c.midpoint));}
  }
  if(replay){invariant(s,c.initial,ids);assert.deepEqual(comparable(s.saveState()),comparable(c.final));}
}
function draw(r,file) {
  const c=r.static[0],f=c.initial,labels=new Map([...c.ids.caps.map(u=>[u,c.metadata.types[u]===T_P?'P':'Q']),...c.ids.letters.map(u=>[u,'A']),...c.ids.rims.map(u=>[u,'W']),...c.ids.fuels.map(u=>[u,'E'])]);
  const xy=p=>[(p[0]-10)*170,(p[1]-9.7)*170];
  const body=f.polygons.map((ps,u)=>{const p=xy(f.centers[u]),fill=labels.get(u)==='W'?'#d3e9dc':labels.get(u)==='E'?'#f4e6af':'#cfe2f3';
    return `<polygon points="${ps.map(p=>xy(p).join(',')).join(' ')}" fill="${fill}" stroke="#253345" stroke-width="2"/><text x="${p[0]}" y="${p[1]+5}" text-anchor="middle" font-family="sans-serif" font-size="18">${labels.get(u)}</text>`;}).join('\n');
  fs.writeFileSync(file,`<svg xmlns="http://www.w3.org/2000/svg" width="760" height="680" viewBox="0 0 760 680"><title>Prepared half-cell end fixture, actual initial polygons</title><rect width="760" height="680" fill="#ffffff"/><text x="30" y="32" font-family="sans-serif" font-size="21">Half-cell end: actual prepared polygon geometry</text><text x="30" y="60" font-family="sans-serif" font-size="15">P/Q caps · A rail neighbors · W rim stubs · E fuel</text>${body}<text x="30" y="630" font-family="sans-serif" font-size="15">Prepared contacts only; no arc growth or autonomous copying tested.</text></svg>\n`,{flag:'wx'});
}
function main() {
  const validating=process.argv[2]==='--validate',arg=process.argv[validating?3:2];assert(arg,'Provide a unique output JSON path');
  const file=path.resolve(arg),target=validating?file+'.validation.json':file;assert(!fs.existsSync(target),'Refusing overwrite');
  selfCheck();
  if(validating) {
    const r=JSON.parse(fs.readFileSync(file));assert(r.complete);assert.deepEqual(r.jobs,jobs());
    for(const f of SOURCES)assert.equal(hash(f),r.sources[f],f);assert.deepEqual(r.static,staticCases());
    assert.equal(r.records.length,24);for(let i=0;i<24;i++){assert.deepEqual(r.records[i].job,r.jobs[i]);validateRecord(r.records[i]);}
    assert.deepEqual(r.summary,summarize(r));
    const bad=clone(r.records[0]);bad.samples[1].frame.polygons[0][0][0]+=.2;assert.throws(()=>validateRecord(bad,false),/frame metrics mismatch/);
    const wrong=clone(r.summary);wrong.admitted=!wrong.admitted;assert.throws(()=>assert.deepEqual(wrong,summarize(r)));
    const report={valid:true,rawHash:hash(file),worlds:24,replaySteps:4800,corruptionsRejected:2,cpuSeconds:cpu(),summary:r.summary};
    fs.writeFileSync(target,JSON.stringify(report)+'\n',{flag:'wx'});console.log(JSON.stringify(report));return;
  }
  for(const suffix of ['.cpu.json','.svg'])assert(!fs.existsSync(file+suffix),'Companion exists');fs.mkdirSync(path.dirname(file),{recursive:true});
  const r={kind:'half-cell-geometry',created:new Date().toISOString(),command:process.argv.slice(1),sources:Object.fromEntries(SOURCES.map(f=>[f,hash(f)])),jobs:jobs(),static:[],records:[],complete:false};
  let error;
  try {
    r.static=staticCases();
    for(const job of r.jobs){runCase(job,c=>r.records.push(c));assert(cpu()<50,'execution CPU reserve exhausted');}
    r.summary=summarize(r);r.complete=true;draw(r,file+'.svg');
  } catch(e) {r.error={message:e.message,stack:e.stack};error=e;}
  fs.writeFileSync(file,JSON.stringify(r)+'\n',{flag:'wx'});
  const cost={cpuSeconds:cpu(),complete:r.complete,observedSteps:steps.observed,plainSteps:steps.plain,restartSteps:steps.restart};
  fs.writeFileSync(file+'.cpu.json',JSON.stringify(cost)+'\n',{flag:'wx'});console.log(JSON.stringify({complete:r.complete,cost,summary:r.summary,error:r.error}));if(error)throw error;
}
if(require.main===module)main();
module.exports={HalfCellGeometrySim,setup,jobs,frame,measure,staticCases,runCase,summarize,validateRecord,overlap,comparable};
