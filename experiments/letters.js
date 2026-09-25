#!/usr/bin/env node
// Letter make-up of capped births over time: the share of each letter among the letters of capped births that carry --gene
// (the gene's own letters taken out once, caps left out), by window. For trade-off worlds: do the free positions fill with
// the letters the environment favours?
// Usage: node experiments/letters.js experiments/out/TO_*.births.jsonl [--gene=ABA] [--window=100000]
const fs = require('fs');
const opt = (k, d) => { const a = process.argv.find((x) => x.startsWith('--' + k + '=')); return a ? a.split('=')[1] : d; };
const gene = opt('gene', 'ABA'), win = Number(opt('window', 100000)), L = 'ABCD';
console.log(`| run | window | capped births with ${gene} | mean length | ${[...L].map((c) => c).join(' | ')} |`);
console.log('|---|---|---:|---:|' + [...L].map(() => '---:').join('|') + '|');
for (const f of process.argv.slice(2).filter((a) => !a.startsWith('--'))) {
  if (!fs.existsSync(f)) { console.error('missing ' + f); continue; }
  const rows = fs.readFileSync(f, 'utf8').trim().split('\n').filter(Boolean).map((l) => JSON.parse(l));
  const tmax = rows.length ? rows[rows.length - 1].t : 0;
  for (let w0 = 0; w0 < tmax; w0 += win) {
    const rs = rows.filter((r) => r.t >= w0 && r.t < w0 + win && r.seq[0] === 'P' && r.seq.endsWith('Q') && r.seq.includes(gene));
    if (!rs.length) continue;
    const cnt = { A: 0, B: 0, C: 0, D: 0 }; let tot = 0, len = 0;
    for (const r of rs) {
      const i = r.seq.indexOf(gene), rest = r.seq.slice(1, i) + r.seq.slice(i + gene.length, -1);
      len += r.seq.length;
      for (const c of rest) if (c in cnt) { cnt[c]++; tot++; }
    }
    console.log(`| ${f.replace(/.*\//, '').replace('.births.jsonl', '')} | ${w0 / 1000}k-${(w0 + win) / 1000}k | ${rs.length} | ${(len / rs.length).toFixed(2)} | ${[...L].map((c) => tot ? (100 * cnt[c] / tot).toFixed(0) + '%' : '-').join(' | ')} |`);
  }
}
