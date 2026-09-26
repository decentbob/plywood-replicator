#!/usr/bin/env node
// Run against committed complete datasets; corrupt copies in a private temporary directory.
const fs=require('fs'),os=require('os'),path=require('path'),assert=require('assert/strict');
const root=fs.mkdtempSync(path.join(os.tmpdir(),'geometry-analysis-'));
try {
  for(const [moduleName,prefix] of [['geometric_bottleneck_summary','GB_screen'],['complementary_fit_summary','CF_screen']]) {
    const analysis=require('./'+moduleName),source=path.join(__dirname,'out',prefix),rows=analysis.load(source);
    assert(analysis.summarize(rows).length>0);
    assert.throws(()=>analysis.summarize([...rows,rows[0]]),/Duplicate/);
    assert.throws(()=>analysis.summarize(rows.slice(1)),/Missing/);
    const wrong=structuredClone(rows);wrong[0].params.pUndock+=0.01;
    assert.throws(()=>analysis.summarize(wrong),/parameter/i);
    if(analysis.contrasts){const cross=structuredClone(rows);for(const r of cross)if(r.profile==='opposed')r.params.pReload+=0.01;
      assert.throws(()=>analysis.contrasts(cross),/square-control parameter/);}
    const target=path.join(root,prefix);
    for(const suffix of ['.manifest.json','.runs.jsonl','.csv'])fs.copyFileSync(source+suffix,target+suffix);
    const m=JSON.parse(fs.readFileSync(target+'.manifest.json','utf8'));m.complete=false;
    fs.writeFileSync(target+'.manifest.json',JSON.stringify(m));assert.throws(()=>analysis.load(target),/Incomplete/);
    m.complete=true;fs.writeFileSync(target+'.manifest.json',JSON.stringify(m));
    const bad=structuredClone(rows);bad[0].exact++;fs.writeFileSync(target+'.runs.jsonl',bad.map(JSON.stringify).join('\n')+'\n');
    assert.throws(()=>analysis.load(target),/CSV\/raw/);
    fs.writeFileSync(target+'.runs.jsonl',rows.map(JSON.stringify).join('\n')+'\n');
    const wrongCount=structuredClone(rows);wrongCount[0].windows[0].edges[0].both++;
    fs.writeFileSync(target+'.runs.jsonl',wrongCount.map(JSON.stringify).join('\n')+'\n');assert.throws(()=>analysis.load(target));
    for(const suffix of ['.manifest.json','.runs.jsonl','.csv'])fs.unlinkSync(target+suffix);
  }
  const population=require('./complementary_population_summary');
  assert.equal(population.load(path.join(__dirname,'out','CF_population')).length,8);
  console.log('PASS: complete paired datasets, duplicate/missing pairs, parameter mismatch, incomplete manifests, raw/CSV mismatch, counter corruption');
} finally {for(const f of fs.readdirSync(root))fs.unlinkSync(path.join(root,f));fs.rmdirSync(root);}
