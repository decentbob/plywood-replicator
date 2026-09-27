#!/usr/bin/env node
// Prepared wrong-letter discrimination. All identities are setup/observation only.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),assert=require('assert/strict');
const {Sim,F,L,R,T_A,T_B}=require('../src/sim.js');
const contexts=['AA','AB','BA','BB'],modes=['body4','individual16'];
const sources=['src/sim.js','experiments/geometric_error_plan.md','experiments/geometric_error.js','experiments/geometric_error_test.js'];
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const cpu=()=>{const c=process.cpuUsage();return (c.user+c.system)/1e6;};
function jobs(){return [501,502].flatMap(seed=>modes.flatMap(mode=>['square','opposed'].flatMap(shape=>contexts.flatMap(context=>[-1,0,1].map(wrong=>({seed,mode,shape,context,wrong}))))));}
function refresh(s){s._deriveAll();s._deriveAll();s._computeOpen();s._buildHash();}
function setup(job){
  const s=new Sim({seed:job.seed,W:24,H:24,nA:8,nB:8,nE:0,seedCount:0,compCopy:true,
    pSoft:0.002,pUndock:0.1,pFray:0,energyGate:true,proof:false,catalysis:false,
    stiffA:0.5,stiffB:0.5,snapCorners:false,bendA:job.shape==='opposed'?-20:0,
    bendB:job.shape==='opposed'?20:0,bodyJostle:job.mode==='body4',iters:job.mode==='body4'?4:16,
    maxEventLog:0,maxBirthLog:1000});
  for(let u=0;u<s.n;u++){s.px[u]=2+2*(u%4);s.py[u]=2+2*Math.floor(u/4);s.pa[u]=0;s._resetShape(u);}
  const t=s.seedStrand(16,16,0,2,job.context);assert(t);
  const sigma=s.p.sigma,rot=s.p.sigmaRot;s.p.sigma=0;s.p.sigmaRot=0;
  for(let k=0;k<100;k++)s._physics();s.p.sigma=sigma;s.p.sigmaRot=rot;
  const c=[];
  for(let k=0;k<2;k++){
    const correct=job.context[k]==='A'?T_B:T_A,want=k===job.wrong?(correct===T_A?T_B:T_A):correct;
    const u=Array.from(s.type).findIndex((x,i)=>x===want&&!t.includes(i)&&!c.includes(i));assert(u>=0);c.push(u);
    s._buildHash();assert(s._formBond(t[k],F,u,F),'Prepared placement failed');
  }
  refresh(s);assert.deepEqual(s.check(),[]);assert.equal(s.compat(c[0],L,c[1],R),1);
  return {s,t,c};
}
function geometry(s,c){
  const [u,v]=c,a=s._side(u,L,[0,0,0,0]),b=s._side(v,R,[0,0,0,0]);
  const dx=s._dx(s.px[v]-s.px[u]),dy=s._dy(s.py[v]-s.py[u]);
  return {t:s.t,a,b,dx,dy,gap:Math.hypot(dx+b[0]-a[0],dy+b[1]-a[1]),
    angle:Math.acos(Math.max(-1,Math.min(1,-a[2]*b[2]-a[3]*b[3])))*180/Math.PI,
    probability:s.compat(u,L,v,R),pass:s._geomOK(u,L,v,R,dx,dy,Math.hypot(dx,dy)),
    faces:c.map(u=>s.bond[u*4+F]),sides:[s.bond[u*4+L],s.bond[v*4+R]]};
}
function observe(s,c){
  const tape=[],samples=[],link=s._link,unlink=s._unlink,form=s._formBonds;
  s._link=function(u,i,v,j){tape.push({t:this.t,op:'link',a:u*4+i,b:v*4+j});return link.call(this,u,i,v,j);};
  s._unlink=function(u,i){const a=u*4+i,b=this.bond[a];if(b>=0)tape.push({t:this.t,op:'unlink',a,b});return unlink.call(this,u,i);};
  s._formBonds=function(){samples.push(geometry(this,c));return form.call(this);};
  return {tape,samples};
}
function outcome(job,t,c,tape){
  const same=(e,a,b)=>(e.a===a&&e.b===b)||(e.a===b&&e.b===a);
  for(const e of tape){
    if(e.op==='link'&&same(e,c[0]*4+L,c[1]*4+R))return {kind:'incorporated',t:e.t};
    if(e.op==='unlink')for(let k=0;k<2;k++)if(same(e,c[k]*4+F,t[k]*4+F))
      return {kind:job.wrong<0?'correctLost':k===job.wrong?'wrongLost':'neighborLost',t:e.t};
  }
  return {kind:'censored',t:200};
}
function comparable(state){const x=structuredClone(state);delete x.nums.pinsVersion;return x;}
function run(job){
  const {s,t,c}=setup(job),initial=s.saveState(),plain=Sim.fromState(initial),o=observe(s,c);
  s.run(100);const midpoint=s.saveState(),resumed=Sim.fromState(midpoint);s.run(100);plain.run(200);resumed.run(100);
  const final=s.saveState();assert.deepEqual(comparable(final),comparable(plain.saveState()),'Observer changed dynamics');
  assert.deepEqual(comparable(final),comparable(resumed.saveState()),'Restart changed dynamics');
  for(const x of [s,plain,resumed]){assert.deepEqual(x.check(),[]);assert.deepEqual(x.type,Sim.fromState(initial).type);}
  return {job,t,c,initial,midpoint,final,...o,outcome:outcome(job,t,c,o.tape),checks:{neutral:true,restart:true,conserved:true}};
}
function summarize(records){
  const rows=[];
  for(const seed of [501,502])for(const mode of modes){
    const cell={seed,mode};
    for(const shape of ['square','opposed']){
      const r=records.filter(r=>r.job.seed===seed&&r.job.mode===mode&&r.job.shape===shape);
      const correct=r.filter(r=>r.job.wrong<0),wrong=r.filter(r=>r.job.wrong>=0);
      cell[shape]={n:r.length,correctLinks:correct.filter(r=>r.outcome.kind==='incorporated').length,
        wrongLinks:wrong.filter(r=>r.outcome.kind==='incorporated').length,
        wrongLost:wrong.filter(r=>r.outcome.kind==='wrongLost').length,
        neighborLost:wrong.filter(r=>r.outcome.kind==='neighborLost').length,
        censored:r.filter(r=>r.outcome.kind==='censored').length};
    }
    const a=cell.square,b=cell.opposed;
    cell.viable=a.n===12&&b.n===12&&a.correctLinks>=3&&b.correctLinks>=3;
    cell.interaction=(b.correctLinks/4-b.wrongLinks/8)-(a.correctLinks/4-a.wrongLinks/8);
    cell.pass=cell.viable&&a.wrongLinks>=4&&b.wrongLinks<=a.wrongLinks/2&&cell.interaction>=0.25&&b.wrongLost>=4;
    rows.push(cell);
  }
  return {worlds:records.length,rows,lead:records.length===96&&rows.every(r=>r.pass)};
}
function main(){
  const start=0,file=path.resolve(process.argv[2]||'');assert(process.argv[2],'Output JSON required');assert(!fs.existsSync(file),'Refusing overwrite');assert(!fs.existsSync(file+'.cpu.json'),'CPU ledger exists');
  fs.mkdirSync(path.dirname(file),{recursive:true});
  const report={kind:'geometric-error-preflight',baseline:'9fa730d',command:process.argv,created:new Date().toISOString(),
    sources:Object.fromEntries(sources.map(f=>[f,hash(fs.readFileSync(path.join(__dirname,'..',f)))])),
    jobs:jobs(),records:[],complete:false,cpuSeconds:null};
  try{for(const job of report.jobs){report.activeJob=job;assert(cpu()-start<80,'Execution CPU reserve reached');report.records.push(run(job));}
    report.complete=true;report.summary=summarize(report.records);
  }catch(e){report.failure=e.stack;process.exitCode=1;}
  report.cpuSeconds=cpu()-start;
  const data=JSON.stringify(report);report.cpuSeconds=cpu()-start;
  fs.writeFileSync(file,JSON.stringify(report)+'\n',{flag:'wx'});
  console.log(JSON.stringify({file,complete:report.complete,failure:report.failure,summary:report.summary,cpuSeconds:report.cpuSeconds,serializedBytes:data.length}));
  // A separate ledger includes final serialization/write and is never overwritten.
  fs.writeFileSync(file+'.cpu.json',JSON.stringify({command:process.argv,cpuSeconds:cpu()-start,scope:'setup, runs, neutrality, restart, summary and raw serialization/write'})+'\n',{flag:'wx'});
}
if(require.main===module)main();
module.exports={sources,hash,cpu,jobs,setup,geometry,observe,outcome,comparable,run,summarize};
