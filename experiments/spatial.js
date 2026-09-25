#!/usr/bin/env node
// Spatial structure of a host-parasite population from birth positions (RESULTS 42): per window, births of hosts (strands that
// make product: here a run of A, the code A1) and of parasites (none), and a segregation index: for each birth, the share of the
// other births in the same window within radius r (torus) that are of its own kind, minus that kind's share of all births in the
// window, averaged over births (0: well mixed; positive: kinds apart in space). Also where host births are centred and how far
// that centre moves from one window to the next (a travelling front would show as steady drift).
//   node experiments/spatial.js out/SP_*.births.jsonl [--window=25000] [--r=8] [--host=AA] [--W=80]
const fs = require('fs');
const opt = (k, d) => { const a = process.argv.find((x) => x.startsWith('--' + k + '=')); return a ? a.split('=')[1] : d; };
const win = Number(opt('window', 25000)), r = Number(opt('r', 8)), hostMotif = opt('host', 'AA'), W = Number(opt('W', 80)), H = Number(opt('H', W));
const d2 = (a, b) => { let dx = Math.abs(a.x - b.x); dx = Math.min(dx, W - dx); let dy = Math.abs(a.y - b.y); dy = Math.min(dy, H - dy); return dx * dx + dy * dy; };
// circular mean on a torus, per axis
const cmean = (xs, L) => { let s = 0, c = 0; for (const x of xs) { s += Math.sin(2 * Math.PI * x / L); c += Math.cos(2 * Math.PI * x / L); } const R = Math.hypot(s, c) / xs.length; return { m: ((Math.atan2(s, c) / (2 * Math.PI)) * L + L) % L, R }; };
console.log('| run | window | births | hosts | parasites | segregation | host centre (x, y), concentration | centre moved |');
console.log('|---|---|---:|---:|---:|---:|---|---:|');
for (const f of process.argv.slice(2).filter((a) => !a.startsWith('--'))) {
  const rows = fs.readFileSync(f, 'utf8').trim().split('\n').filter(Boolean).map((l) => JSON.parse(l)).filter((b) => !b.prod && b.seq.length >= 2);
  const tmax = rows.length ? rows[rows.length - 1].t : 0;
  let prev = null;
  for (let w0 = 0; w0 <= tmax; w0 += win) {
    const rs = rows.filter((b) => b.t >= w0 && b.t < w0 + win).map((b) => ({ x: b.x, y: b.y, h: b.seq.includes(hostMotif) }));
    if (rs.length < 10) continue;
    const nh = rs.filter((b) => b.h).length, fh = nh / rs.length;
    let seg = 0, cnt = 0;
    for (const a of rs) {
      let same = 0, tot = 0;
      for (const b of rs) { if (a === b || d2(a, b) > r * r) continue; tot++; if (a.h === b.h) same++; }
      if (tot === 0) continue;
      seg += same / tot - (a.h ? fh : 1 - fh); cnt++;
    }
    const hx = cmean(rs.filter((b) => b.h).map((b) => b.x), W), hy = cmean(rs.filter((b) => b.h).map((b) => b.y), H);
    let moved = '';
    if (prev && nh) { let dx = Math.abs(hx.m - prev.x); dx = Math.min(dx, W - dx); let dy = Math.abs(hy.m - prev.y); dy = Math.min(dy, H - dy); moved = Math.hypot(dx, dy).toFixed(1); }
    if (nh) prev = { x: hx.m, y: hy.m };
    console.log(`| ${f.replace(/.*\//, '').replace('.births.jsonl', '')} | ${w0 / 1000}k | ${rs.length} | ${nh} | ${rs.length - nh} | ${cnt ? (seg / cnt).toFixed(3) : '-'} | ${nh ? `${hx.m.toFixed(0)}, ${hy.m.toFixed(0)}; ${((hx.R + hy.R) / 2).toFixed(2)}` : '-'} | ${moved} |`);
  }
}
