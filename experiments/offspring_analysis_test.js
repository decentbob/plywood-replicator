#!/usr/bin/env node
const fs=require('fs'),path=require('path'),os=require('os'),crypto=require('crypto'),assert=require('assert/strict');
const root=process.argv[2]||path.join(__dirname,'out'),dir=fs.mkdtempSync(path.join(os.tmpdir(),'offspring-analysis-')),prefix=path.join(dir,'fixture');
let cpu=0,steps=0;
try{for(const [moduleName,name]of [['offspring_recovery_summary','OR_replay'],['offspring_forks_summary','OR_forks']]){
  const a=require('./'+moduleName),source=path.join(root,name),rs=a.load(source);a.summarize(rs);assert.throws(()=>a.summarize([...rs,rs[0]]));assert.throws(()=>a.summarize(rs.slice(1)));
  const m=JSON.parse(fs.readFileSync(source+'.manifest.json'));cpu+=m.cpuSeconds;
  steps+=rs.reduce((n,r)=>n+(r.forkAt?r.forkAt+r.steps*r.arms.length:r.steps),0);
  for(const [file,hash]of Object.entries(m.sources)){const text=fs.readFileSync(path.join(__dirname,file),'utf8'),lf=text.replace(/\r\n/g,'\n');
    assert([text,lf,lf.replace(/\n/g,'\r\n')].some(s=>crypto.createHash('sha256').update(s).digest('hex')===hash),'Source changed: '+file);}
  const reset=()=>['.runs.jsonl','.manifest.json'].forEach(ext=>fs.copyFileSync(source+ext,prefix+ext));reset();
  const badM={...m,complete:false};fs.writeFileSync(prefix+'.manifest.json',JSON.stringify(badM));assert.throws(()=>a.load(prefix));reset();
  const bad=structuredClone(rs);if(name==='OR_replay')bad[0].windows[0].material.free++;else bad[0].arms[0].exactCohort++;
  fs.writeFileSync(prefix+'.runs.jsonl',bad.map(JSON.stringify).join('\n')+'\n');assert.throws(()=>a.load(prefix));reset();
  const badParams=structuredClone(rs);if(name==='OR_replay')badParams[0].params.pFray=0.1;else badParams[0].arms[1].params.pUndock=0.9;
  fs.writeFileSync(prefix+'.runs.jsonl',badParams.map(JSON.stringify).join('\n')+'\n');assert.throws(()=>a.load(prefix));
}}finally{for(const ext of ['.runs.jsonl','.manifest.json'])if(fs.existsSync(prefix+ext))fs.unlinkSync(prefix+ext);fs.rmdirSync(dir);}
console.log(JSON.stringify({pass:true,steps,cpuSeconds:cpu,checks:'provenance, complete paired data, births, lineage, material and arm parameters; corrupt fixtures rejected'}));
