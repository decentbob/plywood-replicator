#!/usr/bin/env node
// The standing population of a saved world (run.js --save), for the stack rule (RESULTS 40): every row (a chain of armed, held or
// released letters, docked copies in progress left out), whether it sits in a stack, how tall the stacks are, and the length and
// sequences the letters are invested in. Births alone miss this: a stack holds its rows for a long time.
//   node experiments/stacks.js out/X.state.json [...]  [--top=6]
const fs = require('fs');
const { Sim, L, R, K, LETTERS, I_TPL, I_REPEL, I_HOLD } = require('../src/sim.js');
const top = Number((process.argv.find((a) => a.startsWith('--top=')) || '--top=6').split('=')[1]);
for (const f of process.argv.slice(2).filter((a) => !a.startsWith('--'))) {
  const s = Sim.fromState(JSON.parse(fs.readFileSync(f, 'utf8')));
  const seen = new Uint8Array(s.n), rows = [];
  for (let u = 0; u < s.n; u++) {
    if (seen[u] || !LETTERS.includes(s.type[u]) || !(s.is[u] === I_TPL || s.is[u] === I_REPEL || s.is[u] === I_HOLD)) continue;
    const ch = s.strandOf(u); for (const x of ch) seen[x] = 1;
    if (ch.length < 2) continue;
    // stacked: a unit's face holds a back, or its back holds an armed or held face
    let stk = false;
    for (const x of ch) { const qf = s.bond[x * 4], qk = s.bond[x * 4 + K]; if ((qf >= 0 && (qf & 3) === K) || (qk >= 0 && (qk & 3) === 0 && s.is[qk >> 2] !== 0)) { stk = true; break; } }
    const seq = ch.map((x) => s._letter(x)).join('');
    rows.push({ seq, len: ch.length, stk, u: ch[0] });
  }
  // stacks: components that hold two or more rows
  const comp = new Map(); for (const r of rows) { const c = s.componentOf(r.u); const key = Math.min(...c); if (!comp.has(key)) comp.set(key, []); comp.get(key).push(r); }
  const stacks = [...comp.values()].filter((rs) => rs.length >= 2);
  const units = (rs) => rs.reduce((a, r) => a + r.len, 0);
  const inStk = rows.filter((r) => r.stk), free = rows.filter((r) => !r.stk);
  const mean = (rs, w) => rs.length ? (w ? rs.reduce((a, r) => a + r.len * r.len, 0) / units(rs) : units(rs) / rs.length) : 0;
  let freeMono = 0; for (let u = 0; u < s.n; u++) { const o = u * 4; if (LETTERS.includes(s.type[u]) && s.bond[o] < 0 && s.bond[o + 1] < 0 && s.bond[o + 2] < 0 && s.bond[o + 3] < 0) freeMono++; }
  const heights = stacks.map((rs) => rs.length).sort((a, b) => b - a);
  console.log(`\n${f.replace(/.*\//, '').replace('.state.json', '')} (t=${s.t}): ${rows.length} rows, ${units(rows)} letters in rows, ${freeMono} free letters`);
  console.log(`  in stacks: ${inStk.length} rows, ${units(inStk)} letters, mean length ${mean(inStk).toFixed(2)} (letter-weighted ${mean(inStk, 1).toFixed(2)}); ${stacks.length} stacks, heights ${heights.slice(0, 12).join(' ')}${heights.length > 12 ? ' ...' : ''}`);
  console.log(`  free rows: ${free.length} rows, ${units(free)} letters, mean length ${mean(free).toFixed(2)} (letter-weighted ${mean(free, 1).toFixed(2)})`);
  const cnt = {}; for (const r of rows) { const rv = r.seq.split('').reverse().join(''); const k = r.seq < rv ? r.seq : rv; cnt[k] = (cnt[k] || 0) + r.len; }
  console.log('  letters by sequence (either direction): ' + Object.entries(cnt).sort((a, b) => b[1] - a[1]).slice(0, top).map(([q, c]) => `${q} ${c}`).join(', '));
  const sc = stacks.map((rs) => { const c = {}; for (const r of rs) c[r.seq] = (c[r.seq] || 0) + 1; const [q, n] = Object.entries(c).sort((a, b) => b[1] - a[1])[0]; return `${q}×${n}/${rs.length}`; });
  console.log('  tallest stacks (commonest row × count / rows): ' + sc.sort((a, b) => +b.split('/')[1] - +a.split('/')[1]).slice(0, top).join(', '));
}
