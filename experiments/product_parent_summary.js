#!/usr/bin/env node
// Distinguish reproduction by non-producing templates from new non-producers born to producers.
// Parent is the engine's sequence snapshot at release, not a persistent lineage identity.
const fs = require('fs');
const { kind } = require('./product_exchange.js');
const args = process.argv.slice(2), files = args.filter(a=>!a.startsWith('--'));
const after = Number((args.find(a=>a.startsWith('--after='))||'--after=0').slice(8));
const untilArg=args.find(a=>a.startsWith('--until=')), until=untilArg?Number(untilArg.slice(8)):Infinity;
if (files.length!==1 || !Number.isFinite(after) || !(until>after) || (untilArg && !Number.isFinite(until)) ||
    args.some(a=>a.startsWith('--') && !/^--(?:after|until)=/.test(a) && a!=='--partial')) {
  throw new Error('usage: product_parent_summary.js FILE.births.jsonl [--after=0] [--until=N] [--partial]');
}
const file=files[0], manifest=file.replace(/\.births\.jsonl$/,'.manifest.json');
const m=JSON.parse(fs.readFileSync(manifest,'utf8'));
if (!m.complete) {
  if (!args.includes('--partial')) throw new Error('Incomplete batch; use --partial only for progress inspection');
  console.error('PARTIAL: runs may have unequal lengths');
}
const groups=new Map();
function group(arm,seed) {
  const key=arm+':'+seed;
  if (!groups.has(key)) groups.set(key,{arm,seed,capped:0,hostParent:0,nonproducerParent:0,otherParent:0,
    nonproducerChild:0,hostToNonproducer:0,nonproducerToNonproducer:0,otherToNonproducer:0,
    exact:0,sameLengthChanged:0,lengthChanged:0});
  return groups.get(key);
}
for (const job of m.jobs) group(job.arm,job.seed);
for (const line of fs.readFileSync(file,'utf8').split(/\r?\n/).filter(Boolean)) {
  const b=JSON.parse(line); if (b.prod || b.t<=after || b.t>until || kind(b.seq)==='other') continue;
  const g=group(b.arm,b.seed), parent=kind(b.parent||''); g.capped++;
  g[parent==='host'?'hostParent':parent==='mimic'?'nonproducerParent':'otherParent']++;
  if (parent!=='other') {
    const expected=[...b.parent].reverse().map(c=>c==='P'?'Q':c==='Q'?'P':c).join('');
    g[b.seq===expected?'exact':b.seq.length===b.parent.length?'sameLengthChanged':'lengthChanged']++;
  }
  if (kind(b.seq)==='mimic') {
    g.nonproducerChild++;
    g[parent==='host'?'hostToNonproducer':parent==='mimic'?'nonproducerToNonproducer':'otherToNonproducer']++;
  }
}
const rows=[...groups.values()].sort((a,b)=>a.arm.localeCompare(b.arm)||a.seed-b.seed);
console.log('| arm | seed | capped children | producer parents | non-producer parents | other parents | non-producer children | producer → non-producer | non-producer → non-producer | other → non-producer |');
console.log('|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|');
const parentKeys=['arm','seed','capped','hostParent','nonproducerParent','otherParent','nonproducerChild',
  'hostToNonproducer','nonproducerToNonproducer','otherToNonproducer'];
const print=r=>console.log('| '+parentKeys.map(k=>r[k]).join(' | ')+' |');
rows.forEach(print);
console.log('\nEqual-weight seed means:');
const means=[];
for (const arm of [...new Set(rows.map(r=>r.arm))]) {
  const rs=rows.filter(r=>r.arm===arm), mean={arm,seed:'mean, n='+rs.length};
  for (const k of Object.keys(rs[0]).slice(2)) mean[k]=rs.reduce((a,r)=>a+r[k],0)/rs.length;
  print(mean); means.push(mean);
}
console.log('\nSequence comparison to the parent snapshot at release; exact = reversed parent with P/Q swapped.');
console.log('| arm | seed | exact capped copies | same-length changes | length changes | uncapped or missing parent |');
console.log('|---|---:|---:|---:|---:|---:|');
for (const r of [...rows,...means]) console.log(`| ${r.arm} | ${r.seed} | ${r.exact} | ${r.sameLengthChanged} | ${r.lengthChanged} | ${r.otherParent} |`);
