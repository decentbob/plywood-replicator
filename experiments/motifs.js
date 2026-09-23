#!/usr/bin/env node
// Motif content of newborns by window: occurrences per block of each motif, against chance at the window's letter
// frequencies, and the share of newborns (length 5+) that carry every motif at once.
// Usage: node experiments/motifs.js ABA,CDC out/G_*.births.jsonl [--window=200000]
const fs = require('fs');
const motifs = process.argv[2].split(',');
const win = Number((process.argv.find((a) => a.startsWith('--window=')) || '--window=200000').split('=')[1]);
const count = (s, m) => { let n = 0; for (let i = 0; i + m.length <= s.length; i++) if (s.startsWith(m, i)) n++; return n; };
console.log(`| run | window | births | mean len | ${motifs.map((m) => m + ' per block (× chance)').join(' | ')} | carrying all, of length 5+ |`);
console.log('|---|---|---:|---:|' + motifs.map(() => '---:').join('|') + '|---:|');
for (const f of process.argv.slice(3).filter((a) => !a.startsWith('--'))) {
  const rows = fs.readFileSync(f, 'utf8').trim().split('\n').filter(Boolean).map((l) => JSON.parse(l));
  const tmax = rows.length ? rows[rows.length - 1].t : 0;
  for (let w0 = 0; w0 < tmax; w0 += win) {
    const rs = rows.filter((r) => r.t >= w0 && r.t < w0 + win); if (!rs.length) continue;
    let len = 0; const freq = {}; for (const r of rs) { len += r.seq.length; for (const c of r.seq) freq[c] = (freq[c] || 0) + 1; }
    const cells = motifs.map((m) => {
      let obs = 0, exp = 0;
      for (const r of rs) {
        // a palindromic motif reads the same both ways; count it once per place
        obs += count(r.seq, m);
        let pm = 1; for (const c of m) pm *= (freq[c] || 0) / len;
        exp += Math.max(0, r.seq.length - m.length + 1) * pm;
      }
      return `${(obs / len).toFixed(3)} (${exp ? (obs / exp).toFixed(1) : '-'})`;
    });
    const long = rs.filter((r) => r.seq.length >= 5), all = long.filter((r) => motifs.every((m) => r.seq.includes(m)));
    console.log(`| ${f.replace(/.*\//, '').replace('.births.jsonl', '')} | ${w0}-${w0 + win} | ${rs.length} | ${(len / rs.length).toFixed(2)} | ${cells.join(' | ')} | ${long.length ? (100 * all.length / long.length).toFixed(0) + '%' : '-'} |`);
  }
}
