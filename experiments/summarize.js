#!/usr/bin/env node
// Summarise experiments/out/*.csv as a markdown table: values averaged over the last `--tail` rows, plus final births.
const fs = require('fs'), path = require('path');
const dir = path.join(__dirname, 'out');
const tail = Number((process.argv.find((a) => a.startsWith('--tail=')) || '--tail=6').split('=')[1]);
const filter = process.argv.find((a) => !a.startsWith('--') && a !== process.argv[0] && a !== process.argv[1]) || '';
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.csv') && f.includes(filter)).sort();
const cols = ['free', 'strands', 'meanLen', 'maxLen', 'distinct', 'entropy', 'eOn'];
console.log('| run | t | ' + cols.map((c) => c + ' (avg)').join(' | ') + ' | births | gen | frays |');
console.log('|---|---:|' + cols.map(() => '---:').join('|') + '|---:|---:|---:|');
for (const f of files) {
  const rows = fs.readFileSync(path.join(dir, f), 'utf8').trim().split('\n');
  if (rows.length < 2) continue;
  const head = rows[0].split(','), data = rows.slice(1).map((r) => Object.fromEntries(r.split(',').map((v, i) => [head[i], Number(v)])));
  const last = data.slice(-tail), fin = data[data.length - 1];
  const avg = (c) => last.reduce((a, r) => a + (c === 'strands' ? r.strands + r.complexes : r[c]), 0) / last.length;
  console.log('| ' + f.replace('.csv', '') + ' | ' + fin.t + ' | ' + cols.map((c) => avg(c).toFixed(c === 'meanLen' || c === 'entropy' ? 2 : 0)).join(' | ') + ' | ' + fin.births + ' | ' + fin.maxGen + ' | ' + fin.frays + ' |');
}
