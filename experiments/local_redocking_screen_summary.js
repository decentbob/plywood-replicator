#!/usr/bin/env node
const fs=require('fs'),assert=require('assert/strict');
const {jobs,sourceFiles}=require('./local_redocking_screen');
const {setup}=require('./patch_completion');
const {validateRun,summarize,fileHash,writeCSV}=require('./local_redocking_summary');
function validate(r){
  assert.deepEqual(r.jobs,jobs);assert.equal(r.results.length,jobs.length);assert(r.neutral&&r.cpuSeconds>0);assert.equal(r.executedSteps,800000);
  assert.deepEqual(Object.keys(r.sources).sort(),[...sourceFiles].sort());for(const[f,h]of Object.entries(r.sources))fileHash(f,h);
  r.results.forEach((x,i)=>{for(const[k,v]of Object.entries(jobs[i]))assert.equal(x[k],v);
    const initial=setup(jobs[i]);assert.deepEqual(x.prepared,{state:initial.s.saveState(),parent:initial.parent});validateRun(x,x.prepared);});
  return r;
}
function summary(r){const rows=r.results.map(x=>({seed:x.seed,profile:x.profile,...summarize(x)}));
  const curved=rows.filter(x=>x.profile==='opposed20'&&x.mode==='seek');
  const qualifies=curved.length===2&&curved.some(x=>x.reused.length)&&curved.every(x=>{
    const c=rows.find(c=>c.seed===x.seed&&c.profile===x.profile&&c.mode==='off');return x.exact>c.exact&&x.exact20>=c.exact20;
  })&&rows.filter(x=>x.mode==='seek').every(x=>x.partial===0);
  return {rows,qualifies};
}
if(require.main===module){const r=validate(JSON.parse(fs.readFileSync(process.argv[2]))),s=summary(r);for(const x of s.rows)console.log(JSON.stringify({...x,reused:x.reused.length}));console.log(JSON.stringify({qualifies:s.qualifies,cpuSeconds:r.cpuSeconds}));if(process.argv[3])writeCSV(process.argv[3],s.rows);}
module.exports={validate,summary};
