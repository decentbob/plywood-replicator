#!/usr/bin/env node
// Keys and mimics (RESULTS 43): with transStart, a strand translates only if it carries the start motif; its product carries its key
// (the longest run of coded letters, here A and B) and, with graded specificity, binds strongly only where that key recurs. Per
// window: births, the share that translate (hosts), how many distinct keys hosts carry and the commonest, the non-translators
// (mimics if their key is one some host in the window carries, else other), and whether the hosts' commonest key changed since the
// last window (a key turnover). Keys are read either way round (a copy reads reversed).
//   node experiments/keys.js out/AR_*.births.jsonl [--start=D] [--coded=AB] [--window=50000] [--top=3]
const fs = require('fs');
const opt = (k, d) => { const a = process.argv.find((x) => x.startsWith('--' + k + '=')); return a ? a.split('=')[1] : d; };
const start = opt('start', 'D'), coded = opt('coded', 'AB'), win = Number(opt('window', 50000)), ntop = Number(opt('top', 3));
const rv = (q) => q.split('').reverse().join('');
const canon = (q) => (q < rv(q) ? q : rv(q));
const key = (q) => { let best = '', cur = ''; for (const c of q + '.') { if (coded.includes(c)) cur += c; else { if (cur.length > best.length) best = cur; cur = ''; } } return canon(best); };
const hasStart = (q) => (start.length === 3 ? q.includes(start) || q.includes(rv(start)) : q.includes(start));
console.log('| run | window | births | hosts | host keys (distinct) | commonest host keys | mimics | other non-hosts | turnover |');
console.log('|---|---|---:|---:|---:|---|---:|---:|---|');
for (const f of process.argv.slice(2).filter((a) => !a.startsWith('--'))) {
  const rows = fs.readFileSync(f, 'utf8').trim().split('\n').filter(Boolean).map((l) => JSON.parse(l)).filter((b) => !b.prod && b.seq.length >= 2);
  const tmax = rows.length ? rows[rows.length - 1].t : 0;
  let prevTop = null;
  for (let w0 = 0; w0 <= tmax; w0 += win) {
    const rs = rows.filter((b) => b.t >= w0 && b.t < w0 + win); if (!rs.length) continue;
    const hosts = rs.filter((b) => hasStart(b.seq)), non = rs.filter((b) => !hasStart(b.seq));
    const hk = {}; for (const b of hosts) { const k = key(b.seq); if (k.length >= 2) hk[k] = (hk[k] || 0) + 1; }
    const tops = Object.entries(hk).sort((a, b) => b[1] - a[1]);
    const mim = non.filter((b) => { const k = key(b.seq); return k.length >= 2 && hk[k]; }).length;
    const top = tops.length ? tops[0][0] : '-';
    const turn = prevTop === null ? '' : top === prevTop ? 'same' : `${prevTop} → ${top}`;
    prevTop = top;
    console.log(`| ${f.replace(/.*\//, '').replace('.births.jsonl', '')} | ${w0 / 1000}k | ${rs.length} | ${hosts.length} | ${tops.length} | ${tops.slice(0, ntop).map(([k, c]) => `${k} ${c}`).join(', ')} | ${mim} | ${non.length - mim} | ${turn} |`);
  }
}
