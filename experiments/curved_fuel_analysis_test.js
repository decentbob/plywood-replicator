#!/usr/bin/env node
const fs=require('fs'),path=require('path'),os=require('os'),crypto=require('crypto'),assert=require('assert/strict');
const fuel=require('./curved_fuel_summary.js'),collective=require('./curved_collective_summary.js'),reproduction=require('./curved_fuel_reproduction_summary.js');
const root=process.argv[2]||path.join(__dirname,'out');
const groups=[[fuel,['UF_screen','UF_confirm','UF_solver','UF_off']],[collective,['UF_collective','UF_collective_confirm','UF_collective_solver']],
  [reproduction,['UF_copy','UF_bootstrap','UF_bootstrap_confirm']]];
let runs=0,steps=0,cpu=0;
for(const [analyzer,names]of groups)for(const name of names){const prefix=path.join(root,name),rows=analyzer.load(prefix);analyzer.summarize(rows);
  const m=JSON.parse(fs.readFileSync(prefix+'.manifest.json'));for(const [file,hash]of Object.entries(m.sources)){
    const source=fs.readFileSync(path.join(__dirname,file),'utf8'),lf=source.replace(/\r\n/g,'\n');
    // Manifests retain byte hashes as executed; accept Git's platform newline conversion only.
    assert([source,lf,lf.replace(/\n/g,'\r\n')].some(s=>crypto.createHash('sha256').update(s).digest('hex')===hash),'Source changed: '+file);
  }
  runs+=rows.length;steps+=rows.reduce((n,r)=>n+r.steps,0);cpu+=m.cpuSeconds;
}
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'curved-fuel-analysis-')),prefix=path.join(dir,'fixture');
try{for(const [analyzer,names]of groups){const src=path.join(root,names[1]),exts=['.csv','.runs.jsonl','.manifest.json'];
    const reset=()=>exts.forEach(ext=>fs.copyFileSync(src+ext,prefix+ext));reset();analyzer.load(prefix);
    let m=JSON.parse(fs.readFileSync(prefix+'.manifest.json'));m.complete=false;fs.writeFileSync(prefix+'.manifest.json',JSON.stringify(m));assert.throws(()=>analyzer.load(prefix));reset();
    const raw=fs.readFileSync(prefix+'.runs.jsonl','utf8').trim().split(/\r?\n/);raw[1]=raw[0];fs.writeFileSync(prefix+'.runs.jsonl',raw.join('\n')+'\n');assert.throws(()=>analyzer.load(prefix));reset();
    const rs=fs.readFileSync(prefix+'.runs.jsonl','utf8').trim().split(/\r?\n/).map(JSON.parse);rs[0].params.pFray=0.1;
    fs.writeFileSync(prefix+'.runs.jsonl',rs.map(JSON.stringify).join('\n')+'\n');assert.throws(()=>analyzer.load(prefix));reset();
    const valid=analyzer.load(prefix);assert.throws(()=>analyzer.summarize([...valid,valid[0]]));
    assert.throws(()=>analyzer.summarize(valid.slice(1)),'Missing paired arm');
    const e=valid.find(r=>r.events.length);assert(e);e.events[0].t=e.steps+1;
    fs.writeFileSync(prefix+'.runs.jsonl',valid.map(JSON.stringify).join('\n')+'\n');assert.throws(()=>analyzer.load(prefix));
  }
}finally{for(const ext of ['.csv','.runs.jsonl','.manifest.json'])if(fs.existsSync(prefix+ext))fs.unlinkSync(prefix+ext);fs.rmdirSync(dir);}
console.log(JSON.stringify({pass:true,runs,steps,cpuSeconds:cpu,checks:'complete data, source hashes, parameters, raw events, windows, pair controls; malformed fixtures rejected'}));
