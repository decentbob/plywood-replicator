#!/usr/bin/env node
const fs=require('fs'),path=require('path'),os=require('os'),assert=require('assert/strict');
const {load,validate,summarize}=require('./patch_completion_summary');
const src=process.argv[2]||'experiments/out/PC_screen',rs=load(src),m=JSON.parse(fs.readFileSync(src+'.manifest.json'));
summarize(rs);assert.throws(()=>summarize([...rs,rs[0]]));assert.throws(()=>summarize(rs.slice(1)));
const r=rs.find(r=>r.completed.some(p=>p.nuclei.length>1)&&r.unfinished.length);
for(const change of [r=>r.params.pUndock+=0.01,r=>r.links[0].kind='merge',r=>r.links[0].u=r.parent[0],
  r=>r.completed[0].start++,r=>r.completed[0].nuclei.push(0),r=>r.completed[0].units[0]=r.parent[0],
  r=>r.unfinished[0].start++,r=>r.windows[0].multi++,r=>r.windows[0].stats.free++,r=>r.exact++,r=>r.births[0].gen=2]){
  const bad=structuredClone(r);change(bad);assert.throws(()=>validate(bad));
}
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'patch-completion-')),prefix=path.join(dir,'fixture');
try{
  fs.copyFileSync(src+'.runs.jsonl',prefix+'.runs.jsonl');
  for(const change of [m=>m.complete=false,m=>m.jobs.pop(),m=>m.sources['patch_completion.js']='bad']){
    const bad=structuredClone(m);change(bad);fs.writeFileSync(prefix+'.manifest.json',JSON.stringify(bad));assert.throws(()=>load(prefix));
  }
}finally{for(const ext of ['.runs.jsonl','.manifest.json'])if(fs.existsSync(prefix+ext))fs.unlinkSync(prefix+ext);fs.rmdirSync(dir);}
console.log(JSON.stringify({pass:true,runs:rs.length,steps:rs.reduce((n,r)=>n+r.steps,0),cpuSeconds:m.cpuSeconds,
  checks:'provenance, parameters, complete paired grid, independent graph reconstruction, birth identities, material, censored histories, malformed-data rejection'}));
