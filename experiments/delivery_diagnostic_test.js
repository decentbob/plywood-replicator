#!/usr/bin/env node
const fs=require('fs'),path=require('path'),crypto=require('crypto'),assert=require('assert/strict');
const {Sim,F,K,L,R,I_DOCK,I_TPL}=require('../src/sim.js');
const {base,arms}=require('./recipient_dependence.js');
const {geometry,observe,summary}=require('./delivery_diagnostic.js');
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const sources=['src/sim.js','experiments/recipient_dependence.js','experiments/delivery_diagnostic_plan.md',
  'experiments/delivery_diagnostic.js','experiments/delivery_diagnostic_test.js'];
function refresh(s){s._deriveAll();s._deriveAll();s._computeOpen();s._buildHash();}
function setup(name){
  const s=new Sim({W:24,H:24,nA:0,nB:4,n1:2,nE:0,seedCount:0,seed:410,translate:true,
    transCode:'A1',catalysis:true,bindAny:true,pBindP:name==='noBind'?0:1,pLinkBare:1,
    pUndock:0,pFray:0,pPMelt:0,pPMeltRun:0,bodyJostle:true,iters:4,maxEventLog:0});
  const t=s.seedStrand(10,10,0,2,'BB'),p=s.seedStrand(10,11,0,2,'11');
  const c=Array.from(s.type).flatMap((type,u)=>type===1&&!t.includes(u)?[u]:[]);
  c.forEach((u,i)=>{s.px[u]=4+i*2;s.py[u]=4;s.pa[u]=Math.PI/2;s._resetShape(u);});
  if(name==='absent')t.forEach(u=>s.is[u]=I_DOCK);
  if(name==='far')p.forEach(u=>s.py[u]+=3);
  if(name==='rotated')p.forEach(u=>{s.pa[u]+=Math.PI;s._resetShape(u);});
  if(name==='immature')p.forEach(u=>s.is[u]=I_DOCK);
  if(['supported','bare','retired','severed','stale'].includes(name))c.forEach((u,i)=>{
    s.px[u]=s.px[t[i]];s.py[u]=9;s._resetShape(u);s._link(u,F,t[i],F);
  });
  if(name==='blocked'){s.px[c[0]]=s.px[p[0]];s.py[c[0]]=s.py[p[0]];}
  refresh(s);return {s,t,p,c};
}
function fixture(name){
  const {s,t,p,c}=setup(name),initialState=s.saveState(),o=observe(s);
  s.t=1;s.pairs=name==='bare'?[]:[t[0],p[0]];s._formBonds();
  if(['supported','bare','retired','severed','stale'].includes(name)){
    refresh(s);
    if(name==='stale')s._unlink(t[0],K); // deliberate within-pass stale cat signal
    s.t=2;s.pairs=[c[1],c[0]];s._formBonds();
    if(name==='retired')s._unlink(t[0],R);
    if(name==='severed'){
      s._unlink(c[1],R);s._unlink(t[0],K);refresh(s);
      s.t=3;s.pairs=[c[1],c[0]];s._formBonds();
    }
    s._chemistry();
  }
  assert.deepEqual(s.check(),[]);assert.deepEqual(s.type,Sim.fromState(initialState).type);
  return {name,initialState,finalState:s.saveState(),observer:o.snapshot(),counts:summary(o.data)};
}
function assertFixtures(fixtures){
  const by=Object.fromEntries(fixtures.map(f=>[f.name,f]));
  for(const n of ['absent','far','immature'])assert.equal(by[n].counts.opportunities,0,n);
  assert.equal(by.absent.observer.samples[0].recipient,0);
  assert.equal(by.far.observer.samples[0].recipient,2);
  assert.equal(by.rotated.counts.opportunities,1);assert.equal(by.rotated.counts.geometric,0);
  assert.equal(by.noBind.counts.geometric,1);assert.equal(by.noBind.counts.bindings,0);
  assert.equal(by.bound.counts.bindings,1);assert.equal(by.bound.counts.supportedLinks,0);
  assert.equal(by.blocked.counts.geometric,1);assert.equal(by.blocked.counts.formationFailures,1);
  assert.equal(by.blocked.counts.bindings,0);
  assert.equal(by.supported.counts.supportedLinks,1);assert.equal(by.supported.counts.supportedExact,1);
  assert.equal(by.bare.counts.exact,1);assert.equal(by.bare.counts.supportedExact,0);
  assert.equal(by.retired.counts.exact,0);assert.equal(by.retired.counts.supportedExact,0);
  assert.equal(by.severed.counts.supportedLinks,1);assert.equal(by.severed.counts.supportedExact,0);
  assert.equal(by.stale.counts.supportedLinks,0);assert.equal(by.stale.counts.unknownSupportLinks,1);
}
function compare(a,b){
  assert.deepEqual(a.saveState(),b.saveState());assert.deepEqual(a.births,b.births);
  for(const k of Object.keys(a))if(ArrayBuffer.isView(a[k]))assert.deepEqual(a[k],b[k],k);
  for(const k of Object.keys(a))if(typeof a[k]==='number')assert.equal(a[k],b[k],k);
  assert.equal(a.rng.getState(),b.rng.getState());
}
function geometryChecks(){
  const {s,t,p}=setup('bound');let n=0;
  for(const seam of [false,true])for(const angle of [0,.1,.5,Math.PI])for(const shift of [0,.1,.4]){
    s.pa[p[0]]=-Math.PI/2+angle;s._resetShape(p[0]);
    s.px[t[0]]=seam?23.7:9.5;s.px[p[0]]=(s.px[t[0]]+shift)%24;s.py[p[0]]=11;
    const g=geometry(s,t[0],p[0]);
    assert.equal(g.sides,s._geomOK(t[0],K,p[0],F,g.dx,g.dy,g.d));n++;
  }
  return n;
}
function run(){
  const cpu=process.cpuUsage();
  const fixtures=['absent','far','rotated','immature','noBind','bound','blocked','supported','bare','retired','severed','stale'].map(fixture);
  assertFixtures(fixtures);const geometryCases=geometryChecks(),neutral=[];
  for(const seed of [411,412])for(const [arm,p]of Object.entries(arms)){
    const params={...base,...p,W:16,H:16,nA:12,nB:12,nC:12,nD:12,n1:12,nE:8,seedCount:1,seed};
    const a=new Sim(params),b=new Sim(params),initialState=a.saveState();let o=observe(a);
    a.run(500);b.run(500);compare(a,b);
    const saved=o.snapshot(),c=Sim.fromState(a.saveState()),co=observe(c,saved);
    // Derived pin cache revisions differ after restore; compare saved dynamics plus full
    // uninterrupted instrumented/plain arrays, and all resumed observer records.
    a.run(500);b.run(500);c.run(500);compare(a,b);
    const x=a.saveState(),y=c.saveState();delete x.nums.pinsVersion;delete y.nums.pinsVersion;assert.deepEqual(x,y);
    assert.deepEqual(o.snapshot(),co.snapshot());assert.deepEqual(a.check(),[]);
    assert.deepEqual(a.type,Sim.fromState(initialState).type);
    neutral.push({seed,arm,steps:1000,initialState,finalState:a.saveState(),observer:o.snapshot(),counts:summary(o.data)});
  }
  const used=process.cpuUsage(cpu),cpuSeconds=(used.user+used.system)/1e6;assert(cpuSeconds<=120);
  return {fixtures,geometryCases,neutral,cpuSeconds,simulationSteps:20000,pass:true};
}
if(require.main===module){
  const stem=process.argv[2];assert(stem,'Provide a fresh output stem');const file=path.resolve(stem+'.json');
  assert(!fs.existsSync(file),'Refusing overwrite');const result=run();
  const report={kind:'delivery-diagnostic-fixtures',created:new Date().toISOString(),command:process.argv,
    sources:Object.fromEntries(sources.map(f=>[f,hash(fs.readFileSync(path.join(__dirname,'..',f)))])),result};
  fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,JSON.stringify(report,null,2)+'\n',{flag:'wx'});
  console.table(result.fixtures.map(f=>({name:f.name,...f.counts})));
  console.log(JSON.stringify({pass:true,geometryCases:result.geometryCases,neutralityWorlds:result.neutral.length,cpuSeconds:result.cpuSeconds,file}));
}
module.exports={setup,fixture,assertFixtures,compare,run};
