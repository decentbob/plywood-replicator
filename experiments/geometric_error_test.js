#!/usr/bin/env node
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const {Sim,F,L,R}=require('../src/sim.js');
const {sources,hash,cpu,jobs,outcome,comparable,summarize}=require('./geometric_error.js');
function validate(report){
  assert.equal(report.kind,'geometric-error-preflight');assert(report.complete);assert.equal(report.records.length,96);
  assert.deepEqual(report.jobs,jobs());
  for(const f of sources)assert.equal(report.sources[f],hash(fs.readFileSync(path.join(__dirname,'..',f))),f);
  for(let k=0;k<report.records.length;k++){
    const r=report.records[k];assert.deepEqual(r.job,report.jobs[k]);
    const a=Sim.fromState(r.initial),b=Sim.fromState(r.final),bond=Array.from(a.bond);
    assert.equal(a.n,16);assert.equal(a.t,0);assert.equal(b.t,200);assert.deepEqual(a.type,b.type);assert.deepEqual(b.check(),[]);
    for(const [key,value]of Object.entries({nA:8,nB:8,nE:0,W:24,H:24,compCopy:true,pSoft:0.002,pUndock:0.1,
      pFray:0,energyGate:true,proof:false,catalysis:false,stiffA:0.5,stiffB:0.5,snapCorners:false,
      bodyJostle:r.job.mode==='body4',iters:r.job.mode==='body4'?4:16,
      bendA:r.job.shape==='opposed'?-20:0,bendB:r.job.shape==='opposed'?20:0}))assert.equal(a.p[key],value,key);
    assert.deepEqual(a.p,b.p);assert.equal(new Set([...r.t,...r.c]).size,4);
    r.c.forEach((u,i)=>{assert.equal(a.bond[u*4+F],r.t[i]*4+F);assert.equal(a.bond[u*4+L],-1);assert.equal(a.bond[u*4+R],-1);
      assert.equal(a.type[u]===a.type[r.t[i]],r.job.wrong===i);});
    assert.equal(r.samples.length,200);assert.deepEqual(r.checks,{neutral:true,restart:true,conserved:true});
    let time=0;
    for(const e of r.tape){assert(e.t>=time&&e.t<=200);time=e.t;assert(e.a>=0&&e.a<64&&e.b>=0&&e.b<64&&e.a!==e.b);
      if(e.op==='link'){assert.equal(bond[e.a],-1);assert.equal(bond[e.b],-1);bond[e.a]=e.b;bond[e.b]=e.a;}
      else{assert.equal(e.op,'unlink');assert.equal(bond[e.a],e.b);assert.equal(bond[e.b],e.a);bond[e.a]=bond[e.b]=-1;}}
    assert.deepEqual(bond,Array.from(b.bond));
    // Independent event scan: first edit of either original face or the incoming lateral pair.
    const edges=[[r.c[0]*4+L,r.c[1]*4+R],...r.c.map((u,i)=>[u*4+F,r.t[i]*4+F])];
    let expected={kind:'censored',t:200};
    for(const e of r.tape){const index=edges.findIndex(([x,y])=>Math.min(x,y)===Math.min(e.a,e.b)&&Math.max(x,y)===Math.max(e.a,e.b));
      if(index<0||(index===0?e.op!=='link':e.op!=='unlink'))continue;
      expected={kind:index===0?'incorporated':r.job.wrong<0?'correctLost':index-1===r.job.wrong?'wrongLost':'neighborLost',t:e.t};break;}
    assert.deepEqual(r.outcome,expected);assert.deepEqual(outcome(r.job,r.t,r.c,r.tape),expected);
    r.samples.forEach((g,i)=>{assert.equal(g.t,i+1);const [ax,ay,anx,any]=g.a,[bx,by,bnx,bny]=g.b;
      const gap=Math.hypot(g.dx+bx-ax,g.dy+by-ay),dot=anx*bnx+any*bny;
      assert.equal(g.gap,gap);assert.equal(g.angle,Math.acos(Math.max(-1,Math.min(1,-dot)))*180/Math.PI);
      assert.equal(g.pass,gap<=a.p.linkDistTol&&dot<=-Math.cos(a.p.linkTolDeg*Math.PI/180));
      assert([0,1].includes(g.probability));});
  }
  assert.deepEqual(report.summary,summarize(report.records));
}
if(require.main===module){
  const start=0,file=path.resolve(process.argv[2]),report=JSON.parse(fs.readFileSync(file));validate(report);
  let rejected=0;
  for(const mutate of [r=>r.records[0].outcome.kind='corrupt',r=>r.records[0].tape[0].b=99,
    r=>r.records[0].samples[0].pass=!r.records[0].samples[0].pass,r=>r.summary.lead=!r.summary.lead]){
    const bad=structuredClone(report);mutate(bad);assert.throws(()=>validate(bad));rejected++;
  }
  const execution=JSON.parse(fs.readFileSync(file+'.cpu.json')).cpuSeconds;
  const result={validated:96,corruptionsRejected:rejected,qaCpuSeconds:cpu()-start,executionCpuSeconds:execution,totalCpuSeconds:execution+cpu()-start};
  assert(result.totalCpuSeconds<120,'Total CPU cap');
  fs.writeFileSync(file+'.validation.json',JSON.stringify(result)+'\n',{flag:'wx'});console.log(JSON.stringify(result));
}
module.exports={validate};
