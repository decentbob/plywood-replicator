#!/usr/bin/env node
// Seeded physical assay, not a new rule: all interventions are initial bonds and ordinary parameters.
const fs = require('fs'), path = require('path'), crypto = require('crypto'), assert = require('assert/strict');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const { Sim, F, K, L, R, I_TPL, LETTERS } = require('../src/sim.js');
const sequence = 'ABBABA', expected = [...sequence].reverse().join('');

function setup({seed, fold, attached, bodyJostle = true}) {
  const s = new Sim({ seed, W:18, H:18, nA:60, nB:60, nE:0, n1:3, n2:3, seedCount:0,
    translate:true, transCode:'A1,B2', catalysis:true, pLinkBare:1, pBindP:attached?0.2:0,
    pPMelt:0, pPMeltRun:0, pFray:0, pSoft:0, pUndock:0.1, energyGate:true,
    stiffA:0.5, stiffB:0.5, stiff1:1, stiff2:1, foldB:fold, bodyJostle,
    maxEventLog:0, maxBirthLog:10000 });
  const template = s.seedStrand(9,9,0,sequence.length,sequence);
  const brace = s.seedStrand(9,8,0,sequence.length,'122121');
  assert(template && brace);
  // Determine the back offset from geometry; for this seed orientation K points upward.
  const side = s._side(template[0],K,[0,0,0,0]);
  for (let i=0;i<brace.length;i++) {
    s.px[brace[i]] = s._wx(s.px[template[i]]+side[2]);
    s.py[brace[i]] = s._wy(s.py[template[i]]+side[3]);
    if (attached) s._link(brace[i],F,template[i],K);
  }
  s._deriveAll(); s._computeOpen(); s._buildHash();
  assert.deepEqual(s.check(),[]);
  return {s,template,brace};
}

function geometry(s, template) {
  let bend = 0, occupied=0, supported=0;
  for (let i=0;i<template.length;i++) {
    const u=template[i];
    if (s.bond[u*4+F]>=0) occupied++;
    if (s.bond[u*4+K]>=0) supported++;
    if (i) {
      const a=s._side(template[i-1],F,[0,0,0,0]),b=s._side(u,F,[0,0,0,0]);
      bend += Math.acos(Math.max(-1,Math.min(1,a[2]*b[2]+a[3]*b[3])))*180/Math.PI;
    }
  }
  return {bend:bend/(template.length-1),occupied:occupied/template.length,supported:supported/template.length};
}

function run(job) {
  const {s,template,brace}=setup(job), types=Array.from(s.type), founderSet=new Set(template);
  let bend=0,occupied=0,supported=0,samples=0;
  for (let t=0;t<job.steps;t+=100) {
    s.run(Math.min(100,job.steps-t));
    const g=geometry(s,template); bend+=g.bend; occupied+=g.occupied; supported+=g.supported; samples++;
  }
  assert.deepEqual(s.check(),[]); assert.deepEqual(Array.from(s.type),types);
  for (let u=0;u<s.n;u++) if (LETTERS.includes(s.type[u]) && s.is[u]===I_TPL) assert(founderSet.has(u),'Offspring rearmed');
  for (let i=0;i<brace.length;i++) assert.equal(s.bond[brace[i]*4+F],job.attached?template[i]*4+K:-1,'Attachment intervention failed');
  const births=s.births.filter(b=>!b.prod), exact=births.filter(b=>b.seq===expected && b.parent===sequence);
  return { ...job, total:births.length, exact:exact.length, other:births.length-exact.length,
    firstExact:exact.length?exact[0].t:null, restrictedFirst:exact.length?exact[0].t:job.steps,
    meanBend:bend/samples, faceOccupancy:occupied/samples, supportOccupancy:supported/samples,
    params:s.p, births:s.births };
}

if (!isMainThread) parentPort.postMessage(run(workerData));
else if (require.main===module) {
  const o={out:'',steps:20000,seeds:'1,2',folds:'0,15,30',workers:4,bodyJostle:1};
  for(let i=2;i<process.argv.length;i+=2) {
    const k=process.argv[i].replace(/^--/,''); assert(Object.hasOwn(o,k)&&process.argv[i+1]!==undefined,'Unknown option');
    o[k]=typeof o[k]==='number'?Number(process.argv[i+1]):process.argv[i+1];
  }
  const seeds=o.seeds.split(',').map(Number),folds=o.folds.split(',').map(Number);
  assert(o.out && Number.isInteger(o.steps)&&o.steps>0 && Number.isInteger(o.workers)&&o.workers>=1&&o.workers<=4);
  assert([0,1].includes(o.bodyJostle)&&seeds.every(Number.isInteger)&&folds.every(Number.isFinite));
  assert.equal(new Set(seeds).size,seeds.length); assert.equal(new Set(folds).size,folds.length);
  const files=['.csv','.runs.jsonl','.manifest.json'].map(x=>o.out+x); assert(files.every(f=>!fs.existsSync(f)),'Output exists');
  fs.mkdirSync(path.dirname(o.out),{recursive:true});
  const jobs=seeds.flatMap(seed=>folds.flatMap(fold=>[false,true].map(attached=>({seed,fold,attached,steps:o.steps,bodyJostle:!!o.bodyJostle}))));
  const cols=['seed','fold','attached','steps','bodyJostle','total','exact','other','firstExact','restrictedFirst','meanBend','faceOccupancy','supportOccupancy'];
  const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
  const m={options:o,jobs,complete:false,completed:0,started:new Date().toISOString(),node:process.version,
    simSha256:hash(path.join(__dirname,'../src/sim.js')),scriptSha256:hash(__filename)};
  const write=()=>fs.writeFileSync(files[2],JSON.stringify(m,null,2)+'\n');
  fs.writeFileSync(files[0],cols.join(',')+'\n',{flag:'wx'});fs.writeFileSync(files[1],'',{flag:'wx'});write();
  const cpu=process.cpuUsage(),wall=Date.now();let next=0,active=0,failed=false;
  function launch() {
    while(!failed&&active<o.workers&&next<jobs.length) {
      const job=jobs[next++],w=new Worker(__filename,{workerData:job});active++;let received=false;
      w.on('message',r=>{received=true;m.completed++;fs.appendFileSync(files[1],JSON.stringify(r)+'\n');
        fs.appendFileSync(files[0],cols.map(k=>r[k]??'').join(',')+'\n');write();
        console.error(JSON.stringify({completed:m.completed,total:jobs.length,seed:r.seed,fold:r.fold,attached:r.attached,exact:r.exact,first:r.firstExact}));});
      w.on('error',e=>{failed=true;process.exitCode=1;console.error(e);});
      w.on('exit',code=>{active--;if(code||!received){failed=true;process.exitCode=1;}
        if(!active&&(failed||next===jobs.length)){const c=process.cpuUsage(cpu);Object.assign(m,{complete:!failed,finished:new Date().toISOString(),cpuSeconds:(c.user+c.system)/1e6,wallSeconds:(Date.now()-wall)/1000});write();}
        launch();});
    }
  }
  launch();
}
module.exports={setup,geometry,run};
