#!/usr/bin/env node
const fs=require('fs'),crypto=require('crypto'),assert=require('assert/strict');
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
function validate(r){
  assert.deepEqual(r.job,{seed:83,profile:'opposed20',undock:0.3,steps:50000});assert.equal(r.start,15000);assert.equal(r.end,50000);assert.equal(r.neutral,true);
  assert.equal(r.occupancy.length,10);for(const c of r.occupancy){assert.deepEqual(Object.keys(c).sort(),['free','linked','single']);
    assert(Object.values(c).every(v=>Number.isInteger(v)&&v>=0));assert.equal(c.free+c.single+c.linked,35000);}
  for(const [key,c]of Object.entries(r.counts)){assert(/^(site[0-9]|anchor87|anchor107)$/.test(key));assert(Object.values(c).every(v=>Number.isInteger(v)&&v>=0));
    const n=k=>c[k]||0;assert(n('compatible')<=n('compatibleCalls'));assert.equal(n('geometry'),n('compatible'));
    assert.equal(n('geometry'),['gap','bearing','angle','pass'].reduce((s,k)=>s+n(k),0));
    assert.equal(n('placement'),n('pass'));assert.equal(n('placement'),n('accepted')+n('occupiedSlot'));}
  const refBytes=fs.readFileSync('experiments/out/PC_screen.runs.jsonl'),refLF=refBytes.toString().replace(/\r\n/g,'\n');
  assert([refBytes,refLF,refLF.replace(/\n/g,'\r\n')].some(x=>hash(x)===r.referenceSha256),'Reference mismatch');
  const ref=refBytes.toString().trim().split(/\r?\n/).map(JSON.parse).find(x=>x.seed===83&&x.profile==='opposed20'&&x.undock===0.3);
  assert.deepEqual(r.params,ref.params);assert.deepEqual(r.parent,ref.parent);assert.deepEqual(r.births,ref.births);
  assert.deepEqual(r.windows,ref.windows.map(({samples,patchSum,multi,zero,...w})=>w));
  assert.deepEqual(Object.keys(r.sources).sort(),['src/sim.js','experiments/patch_completion.js','experiments/end_protection.js','experiments/end_protection_natural.js','experiments/anchor_access.js'].sort());
  for(const [file,h]of Object.entries(r.sources)){const raw=fs.readFileSync(file,'utf8'),lf=raw.replace(/\r\n/g,'\n');assert([raw,lf,lf.replace(/\n/g,'\r\n')].some(x=>hash(x)===h),'Source mismatch: '+file);}
  assert(/^[0-9a-f]{64}$/.test(r.finalStateSha256));assert(r.cpuSeconds>0);
  return {interval:[r.start,r.end],site2:r.counts.site2,site2Occupancy:r.occupancy[2],site3Occupancy:r.occupancy[3],anchor87:r.counts.anchor87,anchor107:r.counts.anchor107,neutral:r.neutral,cpuSeconds:r.cpuSeconds};
}
if(require.main===module)console.log(JSON.stringify(validate(JSON.parse(fs.readFileSync(process.argv[2]))),null,2));
module.exports={validate};
