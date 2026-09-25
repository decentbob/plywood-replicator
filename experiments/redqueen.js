#!/usr/bin/env node
// Do mimics drive hosts off their keys? (RESULTS 43.) Per window and per host key k (the longest run of coded letters, either way
// round, 2 letters or more): its share among host births (strands carrying the start letter) and its mimic load (births of k without
// the start, over all births of k). If mimics push hosts off a key, the key's share falls in the next window after a high load: a
// negative correlation between load now and the change in share. Pairs are pooled over the files given; a permutation test (loads
// shuffled over pairs) gives the p-value. Run it on each arm separately (specificity on, off).
//   node experiments/redqueen.js out/AR_spec_*.births.jsonl [--start=D] [--coded=AB] [--window=50000] [--min=5]
const fs = require('fs');
const opt = (k, d) => { const a = process.argv.find((x) => x.startsWith('--' + k + '=')); return a ? a.split('=')[1] : d; };
const start = opt('start', 'D'), coded = opt('coded', 'AB'), win = Number(opt('window', 50000)), min = Number(opt('min', 5));
const rv = (q) => q.split('').reverse().join('');
const canon = (q) => (q < rv(q) ? q : rv(q));
const key = (q) => { let best = '', cur = ''; for (const c of q + '.') { if (coded.includes(c)) cur += c; else { if (cur.length > best.length) best = cur; cur = ''; } } return canon(best); };
const pairs = [];
for (const f of process.argv.slice(2).filter((a) => !a.startsWith('--'))) {
  const rows = fs.readFileSync(f, 'utf8').trim().split('\n').filter(Boolean).map((l) => JSON.parse(l)).filter((b) => !b.prod && b.seq.length >= 2);
  const tmax = rows.length ? rows[rows.length - 1].t : 0, W = [];
  for (let w0 = 0; w0 + win <= tmax + 1; w0 += win) {
    const h = {}, m = {}; let ht = 0;
    for (const b of rows) { if (b.t < w0 || b.t >= w0 + win) continue; const k = key(b.seq); if (k.length < 2) continue; if (b.seq.includes(start)) { h[k] = (h[k] || 0) + 1; ht++; } else m[k] = (m[k] || 0) + 1; }
    W.push({ h, m, ht });
  }
  for (let i = 0; i + 1 < W.length; i++) {
    const a = W[i], b = W[i + 1]; if (!a.ht || !b.ht) continue;
    for (const k in a.h) { if (a.h[k] < min) continue; const load = (a.m[k] || 0) / (a.h[k] + (a.m[k] || 0)); pairs.push({ load, d: (b.h[k] || 0) / b.ht - a.h[k] / a.ht }); }
  }
}
const corr = (xs, ys) => { const n = xs.length, mx = xs.reduce((p, q) => p + q, 0) / n, my = ys.reduce((p, q) => p + q, 0) / n; let sxy = 0, sxx = 0, syy = 0; for (let i = 0; i < n; i++) { sxy += (xs[i] - mx) * (ys[i] - my); sxx += (xs[i] - mx) ** 2; syy += (ys[i] - my) ** 2; } return sxy / Math.sqrt(sxx * syy || 1); };
const L = pairs.map((p) => p.load), D = pairs.map((p) => p.d), r = corr(L, D);
let k = 0; const N = 20000; for (let i = 0; i < N; i++) { const s = L.slice().sort(() => Math.random() - 0.5); if (corr(s, D) <= r) k++; }
const hi = pairs.filter((p) => p.load >= 0.3), lo = pairs.filter((p) => p.load < 0.1), md = (xs) => xs.length ? (xs.reduce((a, p) => a + p.d, 0) / xs.length).toFixed(3) : '-';
console.log(`${pairs.length} (key, window) pairs; correlation of mimic load with the next change in host share r = ${r.toFixed(3)}, one-sided p = ${(k / N).toFixed(3)}`);
console.log(`  mean change in share after load >= 0.3: ${md(hi)} (${hi.length} pairs); after load < 0.1: ${md(lo)} (${lo.length} pairs)`);
