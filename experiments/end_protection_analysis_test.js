#!/usr/bin/env node
const fs=require('fs'),path=require('path'),os=require('os'),crypto=require('crypto'),assert=require('assert/strict'),{load,summarize}=require('./end_protection_summary');
const root=process.argv[2]||path.join(__dirname,'out'),dir=fs.mkdtempSync(path.join(os.tmpdir(),'end-protection-')),prefix=path.join(dir,'fixture');let steps=0,cpu=0,runs=0;
try{for(const name of ['EP_copy','EP_lifetime','EP_natural']){
  const src=path.join(root,name),rs=load(src),m=JSON.parse(fs.readFileSync(src+'.manifest.json'));summarize(rs);runs+=rs.length;steps+=rs.reduce((n,r)=>n+r.steps,0);cpu+=m.cpuSeconds;
  for(const[file,hash]of Object.entries(m.sources)){const text=fs.readFileSync(path.join(__dirname,file),'utf8'),lf=text.replace(/\r\n/g,'\n');assert([text,lf,lf.replace(/\n/g,'\r\n')].some(s=>crypto.createHash('sha256').update(s).digest('hex')===hash),'Source changed: '+file);}
  assert.throws(()=>summarize([...rs,rs[0]]));assert.throws(()=>summarize(rs.slice(1)));
  const reset=()=>['.runs.jsonl','.manifest.json'].forEach(ext=>fs.copyFileSync(src+ext,prefix+ext));reset();
  fs.writeFileSync(prefix+'.manifest.json',JSON.stringify({...m,complete:false}));assert.throws(()=>load(prefix));reset();
  const bad=structuredClone(rs);bad[0].params.capFray+=0.2;fs.writeFileSync(prefix+'.runs.jsonl',bad.map(JSON.stringify).join('\n')+'\n');assert.throws(()=>load(prefix));reset();
  const counts=structuredClone(rs);counts[0].windows[0].stats.births++;fs.writeFileSync(prefix+'.runs.jsonl',counts.map(JSON.stringify).join('\n')+'\n');assert.throws(()=>load(prefix));
}}finally{for(const ext of ['.runs.jsonl','.manifest.json'])if(fs.existsSync(prefix+ext))fs.unlinkSync(prefix+ext);fs.rmdirSync(dir);}
console.log(JSON.stringify({pass:true,runs,steps,cpuSeconds:cpu,checks:'source hashes, matched shapes, conservation, protected ends, raw counts and malformed-data rejection'}));
