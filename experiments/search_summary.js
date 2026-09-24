#!/usr/bin/env node
// Summarize search.js output: one row per world, ranked by a chosen measure, with the mechanisms that were on.
// Usage: node experiments/search_summary.js out/*.jsonl [--by=len|distinct|motifs|maxMotifsInOne|births] [--top=20]
const fs = require('fs');
const by = (process.argv.find((a) => a.startsWith('--by=')) || '--by=len').split('=')[1];
const top = Number((process.argv.find((a) => a.startsWith('--top=')) || '--top=20').split('=')[1]);
const rows = [];
for (const f of process.argv.slice(2).filter((a) => !a.startsWith('--'))) for (const l of fs.readFileSync(f, 'utf8').split('\n')) if (l.trim()) rows.push(JSON.parse(l));
const mech = (p) => {
  const on = [];
  on.push(p.nC ? '4L' : '2L');
  for (const k of ['motif', 'feed', 'relay', 'shield', 'act', 'cut', 'cutRelay', 'make', 'memPerm']) if (p[k]) on.push(k);
  if (p.pBreak) on.push('rad' + p.pBreak.toExponential(0));
  if (p.nX) on.push(`rays${p.nX}@${p.rayHit.toExponential(0)}`);
  if (p.pHyb) on.push('bind' + p.pHyb);
  if (p.pLigate) on.push('lig');
  on.push(`E${p.nE}/${p.pReload.toExponential(0)}`, `undock${p.pUndock}`);
  if (p.mobS !== 1) on.push('mobS' + p.mobS);
  return on.join(' ');
};
const val = (o) => (o.score && o.score.last ? o.score.last[by] ?? o.score[by] ?? 0 : -1);
const alive = rows.filter((o) => o.ok && o.score && o.score.alive && o.score.last.n > 0);
console.log(`${rows.length} worlds, ${alive.length} alive at the end with births in the last third; ranked by last-third ${by}`);
console.log('| i | births | len (mid → last) | distinct (mid → last) | functional motifs present | most in one genome | mechanisms |');
console.log('|---:|---:|---|---|---|---:|---|');
for (const o of alive.sort((a, b) => val(b) - val(a)).slice(0, top)) {
  const s = o.score;
  console.log(`| ${o.i} | ${s.births} | ${s.mid.len} → ${s.last.len} | ${s.mid.distinct} → ${s.last.distinct} | ${s.last.motifs} of ${s.functional.length} (${s.functional.join(' ')}) | ${s.last.maxMotifsInOne} | ${mech(o.params)} |`);
}
