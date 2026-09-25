#!/usr/bin/env node
// Length of capped genomes and gene content, one row per run: over births from --from on, how many capped births, their
// mean length, the share longer than --base units, the longest, and births carrying each gene (capped, or any).
// Usage: node experiments/caplen.js ABA,CDC experiments/out/SC_*.births.jsonl [--from=200000] [--base=5]
const fs = require('fs');
const opt = (k, d) => { const a = process.argv.find((x) => x.startsWith('--' + k + '=')); return a ? a.split('=')[1] : d; };
const genes = process.argv[2].split(','), from = Number(opt('from', 200000)), base = Number(opt('base', 5));
const capped = (q) => q[0] === 'P' && q[q.length - 1] === 'Q';
console.log(`| run | births | capped | mean capped length | longer than ${base} | longest | ${genes.map((g) => g + ' capped / any').join(' | ')} | template units at end |`);
console.log('|---|---:|---:|---:|---:|---:|' + genes.map(() => '---:').join('|') + '|---:|');
for (const f of process.argv.slice(3).filter((a) => !a.startsWith('--'))) {
  if (!fs.existsSync(f)) { console.error('missing ' + f); continue; }
  const rows = fs.readFileSync(f, 'utf8').trim().split('\n').filter(Boolean).map((l) => JSON.parse(l)).filter((r) => r.t >= from);
  const cp = rows.filter((r) => capped(r.seq));
  const len = cp.length ? cp.reduce((a, r) => a + r.seq.length, 0) / cp.length : 0;
  const longer = cp.filter((r) => r.seq.length > base).length, longest = cp.reduce((a, r) => Math.max(a, r.seq.length), 0);
  const g = genes.map((m) => `${cp.filter((r) => r.seq.includes(m)).length} / ${rows.filter((r) => r.seq.includes(m)).length}`);
  let tpl = '-'; const j = f.replace('.births.jsonl', '.json'); try { tpl = JSON.parse(fs.readFileSync(j, 'utf8')).final.tpl; } catch (e) { }
  console.log(`| ${f.replace(/.*\//, '').replace('.births.jsonl', '')} | ${rows.length} | ${cp.length} | ${len.toFixed(2)} | ${cp.length ? (100 * longer / cp.length).toFixed(1) + '%' : '-'} | ${longest} | ${g.join(' | ')} | ${tpl} |`);
}
