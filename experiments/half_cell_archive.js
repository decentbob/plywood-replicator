#!/usr/bin/env node
'use strict';
// Archive this completed batch without overwriting or deleting scratch evidence.
const fs=require('fs'),crypto=require('crypto'),assert=require('assert/strict'),zlib=require('zlib');
const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const read=f=>JSON.parse(f.endsWith('.gz')?zlib.gunzipSync(fs.readFileSync(f)):fs.readFileSync(f));
const names=['HC_contact_20260927.json.gz','HC_contact_20260927.json.gz.cpu.json',
  'HC_contact_20260927.failed-source.js','HC_contact_20260927_v2.json.gz',
  'HC_contact_20260927_v2.json.gz.cpu.json','HC_contact_20260927_v2.json.gz.validation.json',
  'HC_contact_20260927_v2.json.gz.validation.json.cpu.json','HC_contact_20260927_v2.checked.json',
  'HC_contact_20260927_v2.checked.json.cpu.json','HC_resolution_20260927.json.gz',
  'HC_resolution_20260927.json.gz.cpu.json','HC_resolution_20260927.json.gz.validation.json',
  'HC_resolution_20260927.json.gz.validation.json.cpu.json'];
const out='experiments/out/HC_contact_resolution_20260927.manifest.json';
assert(!fs.existsSync(out),'Refusing manifest overwrite');
for(const name of names)assert(!fs.existsSync('experiments/out/'+name),'Refusing artifact overwrite: '+name);
const sourcePrefix='experiments/scratch/',targetPrefix='experiments/out/';
const failed=read(sourcePrefix+names[0]);assert(!failed.complete);
assert.equal(failed.sources['experiments/half_cell_contact.js'],hash(sourcePrefix+names[2]));
for(const file of ['HC_contact_20260927_v2.json.gz','HC_resolution_20260927.json.gz']){
  const r=read(sourcePrefix+file);assert(r.complete);for(const [f,h]of Object.entries(r.sources))assert.equal(hash(f),h,f);
}
const checked=read(sourcePrefix+'HC_contact_20260927_v2.checked.json');assert(checked.complete&&!checked.summary.pass);
assert.equal(checked.rawHash,hash(sourcePrefix+'HC_contact_20260927_v2.json.gz'));
assert.equal(checked.validatorHash,hash('experiments/half_cell_contact_validate.js'));
const resolution=read(sourcePrefix+'HC_resolution_20260927.json.gz.validation.json');assert(resolution.complete&&resolution.summary.pass);
assert.equal(resolution.rawHash,hash(sourcePrefix+'HC_resolution_20260927.json.gz'));
const files=[];
for(const name of names){const source=sourcePrefix+name,target=targetPrefix+name;fs.copyFileSync(source,target,fs.constants.COPYFILE_EXCL);
  assert.equal(hash(source),hash(target));files.push({source,target,sha256:hash(target),bytes:fs.statSync(target).size});}
const costs=names.filter(n=>n.endsWith('.cpu.json')).map(n=>({file:targetPrefix+n,...read(targetPrefix+n)}));
const c=process.cpuUsage(),archiveCpuSeconds=(c.user+c.system)/1e6;
const manifest={command:process.argv.slice(1),archiverHash:hash(__filename),files,costs,archiveCpuSeconds,
  measuredCpuSeconds:costs.reduce((s,c)=>s+c.cpuSeconds,0)+archiveCpuSeconds,
  timingScope:'Process CPU includes setup, failures, analysis, compression, replay and archive verification. Final CPU-companion writes, manifest serialization, shell, editing and Git are not timed.',
  physicsSteps:16000+6400+checked.diagnosticSteps+4000+1600,
  result:{contactGate:checked.summary.pass,resolutionGate:resolution.summary.pass,body16Passing:resolution.summary.body16Passing,
    individual16Passing:resolution.summary.individual16Passing},
  reproduce:'The resolution runner names its scratch inputs. If absent, copy HC_contact_20260927_v2.json.gz and HC_contact_20260927_v2.checked.json from out to scratch unchanged; refuse overwrites. Run the documented commands with new output stems.'};
fs.writeFileSync(out,JSON.stringify(manifest,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({files:files.length,physicsSteps:manifest.physicsSteps,measuredCpuSeconds:manifest.measuredCpuSeconds,result:manifest.result}));
