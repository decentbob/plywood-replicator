#!/usr/bin/env node
// Q10 driver: RESULTS 29 double-strand world plus ligation and radiation, via run.js. See duplex_damage_plan.md.
//   node experiments/duplex_damage.js calibrate STEM | screen STEM R | summary STEM
const fs = require('fs'), path = require('path'), { spawn } = require('child_process'), assert = require('assert/strict');
const ROOT = path.join(__dirname, '..');
const BASE = ('--W 40 --H 40 --nA 256 --nB 256 --nE 60 --pReload 0.002 --pUnzip 1 --pUndock 0.1 --pFray 0.00003 ' +
  '--seedSeq AAABAB,ABBABA --seedCount 2 --pSoft 0.002 --pCapture 0.002 --pSpont 0.0002 --compCopy 1 --snapCorners 1 ' +
  '--maxStrain 0.5 --heatPeriod 5000 --maxBirthLog 300000').split(' ');
const ARMS = { ss: [0, 0.02, 0], ds: [0.2, 0.02, 0], ssRad: [0, 0.02, 'R'], dsRad: [0.2, 0.02, 'R'],
  ssRadNoLig: [0, 0, 'R'], dsRadNoLig: [0.2, 0, 'R'] };
const args = (arm, R) => { const [h, l, b] = ARMS[arm]; return ['--pHyb', h, '--pLigate', l, '--pBreak', b === 'R' ? R : b].map(String); };

function runAll(jobs) {   // jobs: {name, argv, stem}; at most four concurrent run.js processes
  return new Promise((resolve, reject) => {
    let next = 0, live = 0, done = 0;
    const launch = () => {
      if (done === jobs.length) return resolve();
      while (live < 4 && next < jobs.length) {
        const j = jobs[next++];
        for (const f of [j.stem + '.csv', j.stem + '.births.jsonl', j.stem + '.json']) assert(!fs.existsSync(f), 'Refusing overwrite: ' + f);
        const out = fs.openSync(j.stem + '.csv', 'wx'), err = fs.openSync(j.stem + '.json', 'wx');
        const p = spawn(process.execPath, [path.join(ROOT, 'run.js'), ...j.argv, '--births', j.stem + '.births.jsonl'], { stdio: ['ignore', out, err] });
        live++;
        p.on('exit', code => { live--; done++; console.error(JSON.stringify({ done: j.name, code })); if (code) return reject(new Error(j.name + ' exit ' + code)); launch(); });
      }
    };
    launch();
  });
}
const csv = f => { const [h, ...rows] = fs.readFileSync(f, 'utf8').trim().split('\n'); const k = h.split(','); return rows.map(r => Object.fromEntries(r.split(',').map((v, i) => [k[i], +v]))); };
const births = f => fs.existsSync(f) ? fs.readFileSync(f, 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse) : [];

async function main() {
  const [mode, stem, R] = process.argv.slice(2); assert(stem, 'Usage: see header');
  fs.mkdirSync(path.dirname(path.resolve(stem)), { recursive: true });
  if (mode === 'calibrate') {
    const levels = [0, 1e-5, 3e-5, 1e-4];
    await runAll(levels.map(b => ({ name: 'cal_' + b, stem: `${stem}_${b}`,
      argv: [...BASE, '--steps', '20000', '--every', '5000', '--seed', '90', '--pHyb', '0', '--pLigate', '0.02', '--pBreak', String(b)] })));
    const base = csv(`${stem}_0.csv`).at(-1).meanLen, rows = levels.map(b => {
      const last = csv(`${stem}_${b}.csv`).at(-1), late = births(`${stem}_${b}.births.jsonl`).filter(x => x.t >= 10000).length;
      return { pBreak: b, meanLen: last.meanLen, drop: 1 - last.meanLen / base, lateBirths: late, breaks: last.breaks };
    });
    const pick = rows.find(r => r.pBreak > 0 && r.drop >= 0.15 && r.lateBirths >= 20);
    const out = { rows, chosen: pick ? pick.pBreak : 1e-4, rule: 'lowest pBreak with meanLen drop >= 15% and >= 20 births in 10k-20k; else 1e-4' };
    fs.writeFileSync(stem + '.calibration.json', JSON.stringify(out, null, 1) + '\n', { flag: 'wx' }); console.log(JSON.stringify(out)); return;
  }
  if (mode === 'screen') {
    assert(R && +R > 0);
    const jobs = [];
    for (const seed of [1, 2]) for (const arm of Object.keys(ARMS))
      jobs.push({ name: `${arm}_${seed}`, stem: `${stem}_${arm}_${seed}`, argv: [...BASE, '--steps', '150000', '--every', '10000', '--seed', String(seed), ...args(arm, R)] });
    await runAll(jobs); console.log('screen done'); return;
  }
  if (mode === 'summary') {
    const rows = [];
    for (const seed of [1, 2]) for (const arm of Object.keys(ARMS)) {
      const b = births(`${stem}_${arm}_${seed}.births.jsonl`), late = b.filter(x => x.t >= 100000 && x.t < 150000 && x.parent);
      const c = csv(`${stem}_${arm}_${seed}.csv`), last = c.at(-1);
      rows.push({ seed, arm, B: late.length, L: late.length ? late.reduce((a, x) => a + x.parent.length, 0) / late.length : null,
        newbornLen: late.length ? late.reduce((a, x) => a + x.seq.length, 0) / late.length : null, allBirths: b.length,
        meanLen: last.meanLen, maxLen: last.maxLen, distinct: last.distinct, breaks: last.breaks, ligations: last.ligations,
        meanLenTrace: c.map(r => r.meanLen) });
    }
    const get = (seed, arm) => rows.find(r => r.seed === seed && r.arm === arm);
    const gate = [1, 2].map(seed => {
      const L = a => get(seed, a).L ?? 0, d = L('dsRad') - L('ssRad');
      const c = { seed, viable: get(seed, 'dsRad').B >= 20, diff: d, diffNoRad: L('ds') - L('ss'), diffNoLig: L('dsRadNoLig') - L('ssRadNoLig') };
      c.pass = c.viable && d >= 0.5 && d - c.diffNoRad >= 0.5 && d - c.diffNoLig >= 0.5; return c;
    });
    const out = { rows, gate, lead: gate.every(g => g.pass) };
    fs.writeFileSync(stem + '.summary.json', JSON.stringify(out, null, 1) + '\n', { flag: 'wx' });
    for (const r of rows) { const { meanLenTrace, ...x } = r; console.log(JSON.stringify(x)); }
    console.log(JSON.stringify({ gate, lead: out.lead }));
    return;
  }
  throw new Error('mode must be calibrate, screen or summary');
}
main().catch(e => { console.error(e.stack); process.exitCode = 1; });
