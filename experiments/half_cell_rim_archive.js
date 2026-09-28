#!/usr/bin/env node
'use strict';
const fs=require('fs'),zlib=require('zlib'),assert=require('assert/strict');
const {hash}=require('./half_cell_rim_test');
const {TNAME}=require('../src/sim');
const stem='HC_rim_20260928',src='experiments/scratch/',dest='experiments/out/';
const names=[stem+'.tests.json',stem+'.json.gz',stem+'.json.gz.cpu.json',stem+'.json.gz.validation.json',
  stem+'.json.gz.validation.json.cpu.json',stem+'.diagnosis.json',stem+'.diagnosis.json.cpu.json'];
const read=f=>JSON.parse(f.endsWith('.gz')?zlib.gunzipSync(fs.readFileSync(f)):fs.readFileSync(f));
const manifestFile=dest+stem+'.manifest.json',svgFile=dest+stem+'.svg';
for(const f of [...names.map(n=>dest+n),manifestFile,svgFile])assert(!fs.existsSync(f),'Refusing overwrite '+f);
const raw=read(src+stem+'.json.gz'),validation=read(src+stem+'.json.gz.validation.json'),diagnosis=read(src+stem+'.diagnosis.json'),tests=read(src+stem+'.tests.json');
assert(raw.complete&&validation.complete&&diagnosis.complete&&tests.complete);assert(!raw.summary.pass);
assert.equal(validation.rawHash,hash(src+stem+'.json.gz'));assert.equal(diagnosis.rawHash,validation.rawHash);
for(const [f,h]of Object.entries(raw.sources))assert.equal(hash(f),h,f);
assert.equal(diagnosis.sourceHash,hash('experiments/half_cell_rim_diagnose.js'));
const files=[];
for(const name of names){fs.copyFileSync(src+name,dest+name,fs.constants.COPYFILE_EXCL);assert.equal(hash(src+name),hash(dest+name));
  files.push({source:src+name,target:dest+name,sha256:hash(dest+name),bytes:fs.statSync(dest+name).size});}
const c=raw.records.find(c=>c.job.seed===701&&c.job.mode==='individual16'&&c.job.end==='Q'&&c.job.arm==='prepared');
const times=[0,1,6],polys=times.flatMap(t=>c.samples[t].frame.polygons.flat());
const minX=Math.min(...polys.map(p=>p[0])),maxX=Math.max(...polys.map(p=>p[0])),minY=Math.min(...polys.map(p=>p[1])),maxY=Math.max(...polys.map(p=>p[1]));
const scale=Math.min(300/(maxX-minX),285/(maxY-minY));
const panels=times.map((t,k)=>{
  const f=c.samples[t].frame,x0=25+k*355,xy=p=>[x0+20+(p[0]-minX)*scale,85+(p[1]-minY)*scale];
  const blocks=f.polygons.map((ps,u)=>{const type=TNAME[c.metadata.types[u]],label=type==='C'?'W':type;
    const fill=label==='W'?'#bde4c7':label==='E'?'#f8dfa2':label==='A'?'#e2e8f0':'#bcd8f2',p=xy(f.centers[u]);
    return `<polygon points="${ps.map(p=>xy(p).join(',')).join(' ')}" fill="${fill}" stroke="#253345" stroke-width="1.5"/><text x="${p[0]}" y="${p[1]+4}" text-anchor="middle" font-size="13">${label}</text>`;
  }).join('');
  return `<g><rect x="${x0}" y="48" width="340" height="335" rx="8" fill="#f8fafc"/><text x="${x0+15}" y="72" font-size="16">${['Prepared contacts','Ordinary face release','Fragments separated'][k]} · t=${t}</text>${blocks}</g>`;
}).join('');
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1100" height="448" viewBox="0 0 1100 448"><title>Prepared chain-end fragments retain their rim stubs during ordinary release</title><rect width="1100" height="448" fill="white"/><g font-family="sans-serif" fill="#253345"><text x="25" y="29" font-size="21">Rim attachments survive ordinary chain release</text>${panels}<text x="25" y="410" font-size="15">Actual polygons · P/Q caps, A chain neighbors, W rim stubs, E fuel · Seed 701, individual motion, 16 passes</text><text x="25" y="432" font-size="15">Prepared fragments only. No complete half-cell, polymer growth or autonomous chain assembly is shown.</text></g></svg>\n`;
fs.writeFileSync(svgFile,svg,{flag:'wx'});files.push({target:svgFile,sha256:hash(svgFile),bytes:fs.statSync(svgFile).size});
const costs=names.filter(n=>n.endsWith('.cpu.json')).map(n=>({file:dest+n,...read(dest+n)}));
const cpu=process.cpuUsage(),archiveCpuSeconds=(cpu.user+cpu.system)/1e6;
const manifest={command:process.argv.slice(1),sourceHash:hash(__filename),files,costs,testsCpuSeconds:tests.cpuSeconds,
  readOnlyInspectionCpuSeconds:.452,archiveCpuSeconds,
  measuredCpuSeconds:costs.reduce((s,c)=>s+c.cpuSeconds,0)+tests.cpuSeconds+.452+archiveCpuSeconds,
  timingScope:'Includes process startup, tests, execution, replay, diagnosis, the logged read-only inspection, compression and archive. Final small bookkeeping/manifest writes, shell, editing and Git are unmeasured.',
  physicsSteps:16000+6400+tests.result.physicsSteps+diagnosis.physicsSteps,
  outcome:{gate:false,prepared:8,recruited:0,onWorlds:8,eligibleAtBinding:0},
  reproduce:'The assay names its scratch tests input. Copy HC_rim_20260928.tests.json from out to scratch unchanged if absent; refuse overwrite. Use new output stems for execution/replay/diagnosis.'};
fs.writeFileSync(manifestFile,JSON.stringify(manifest,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({files:files.length,physicsSteps:manifest.physicsSteps,measuredCpuSeconds:manifest.measuredCpuSeconds,outcome:manifest.outcome}));
