#!/usr/bin/env node
// Quick look at birth logs (finished or still being written): per window, births, mean newborn length, distinct sequences,
// products (translate rule), and the commonest newborns; optional --has=ABA,CDC counts births carrying each motif.
// Usage: node experiments/peek.js experiments/out/X_*.births.jsonl [--window=50000] [--top=4] [--has=ABA,CDC] [--capped]
//   --capped: only strands capped P...Q (the capped worlds of section 33)
const fs = require('fs');
const opt = (k, d) => { const a = process.argv.find((x) => x.startsWith('--' + k + '=')); return a ? a.split('=')[1] : d; };
const win = Number(opt('window', 50000)), ntop = Number(opt('top', 4)), has = opt('has', '') ? opt('has', '').split(',') : [];
const cappedOnly = process.argv.includes('--capped');
for (const f of process.argv.slice(2).filter((a) => !a.startsWith('--'))) {
  if (!fs.existsSync(f)) { console.error('missing ' + f); continue; }
  const all = fs.readFileSync(f, 'utf8').split('\n').filter(Boolean).map((l) => { try { return JSON.parse(l); } catch (e) { return null; } }).filter(Boolean);
  const rows = all.filter((r) => !r.prod && (!cappedOnly || (r.seq[0] === 'P' && r.seq.endsWith('Q'))));
  const prods = all.filter((r) => r.prod);
  const tmax = all.length ? all[all.length - 1].t : 0;
  console.log(`\n${f.replace(/.*\//, '').replace('.births.jsonl', '')}: ${rows.length} births${cappedOnly ? ' (capped)' : ''}, ${prods.length} products, up to step ${tmax}`);
  for (let w0 = 0; w0 <= tmax; w0 += win) {
    const rs = rows.filter((r) => r.t >= w0 && r.t < w0 + win); if (!rs.length) continue;
    const len = rs.reduce((a, r) => a + r.seq.length, 0) / rs.length;
    const cnt = {}; for (const r of rs) cnt[r.seq] = (cnt[r.seq] || 0) + 1;
    const top = Object.entries(cnt).sort((a, b) => b[1] - a[1]).slice(0, ntop).map(([q, c]) => `${q} ${c}`).join(', ');
    const hs = has.map((m) => `${m} ${(100 * rs.filter((r) => r.seq.includes(m)).length / rs.length).toFixed(0)}%`).join(' ');
    const np = prods.filter((r) => r.t >= w0 && r.t < w0 + win).length;
    console.log(`  ${String(w0 / 1000).padStart(5)}k  births ${String(rs.length).padStart(5)}  len ${len.toFixed(2).padStart(5)}  distinct ${String(Object.keys(cnt).length).padStart(4)}${np ? '  products ' + np : ''}${hs ? '  ' + hs : ''}  | ${top}`);
  }
}
