#!/usr/bin/env node
// A portable, bounded batch for RESULTS 44. No observer feeds back into the simulation.
// node experiments/product_exchange.js --out experiments/out/PE_screen --steps 50000 --seeds 1,2
// --arms baseline,delay100,delay1000,melt --workers 4 --mode race|probe
// probe has no turnover or mutation; race has both. Each seed is an independent replicate.
// Historical column name "mimic" means any capped sequence without D. It does NOT prove
// key identity, catalyst dependence, or parasitism; use the birth log for finer classification.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const { isProd, LETTERS, I_TPL, I_REPEL, F, K, L, R } = require('../src/sim.js');
const { ProductShapeSim: Sim } = require('./product_shapes.js');

const arms = {
  baseline: {},
  delay100: { pPReady: 0.01 },
  delay1000: { pPReady: 0.001 },
  melt: { pPMeltRun: 0.05 },
  nospec: { pMisMelt: -1 },
  delayNospec: { pPReady: 0.001, pMisMelt: -1 },
  fold: { fold1: 45, fold2: 45 },
  reset100: { productReset: true, pPReady: 0.01 },
  reset1000: { productReset: true, pPReady: 0.001 },
  resetNospec: { productReset: true, pPReady: 0.001, pMisMelt: -1 },
  delayFold: { pPReady: 0.01, fold1: 45, fold2: 45 },
  noBind: { pBindP: 0 },
  durable: { productFray: 0.03 },
  durableReset: { productFray: 0.03, productReset: true, pPReady: 0.001 },
  durableNoBind: { productFray: 0.03, pBindP: 0 },
  shapeFace15: { productFray: 0.03, fold1: 15, fold2: 15 },
  shapeSide5: { productFray: 0.03, fold1: 5, fold2: 5, productShape: 'lateral' },
  shapeSide15: { productFray: 0.03, fold1: 15, fold2: 15, productShape: 'lateral' },
  shapeSide30: { productFray: 0.03, fold1: 30, fold2: 30, productShape: 'lateral' },
  shapeSideNeg15: { productFray: 0.03, fold1: -15, fold2: -15, productShape: 'lateral' },
  shapeFree15: { productFray: 0.03, fold1: 15, fold2: 15, productShape: 'lateralFree' },
};
// Same-physics shape controls: at stiffness 1 and without snapCorners, bonded rest shapes do not update.
for (const [name, source] of Object.entries({ soft0:'durable', softFace15:'shapeFace15', softSide5:'shapeSide5',
  softSide15:'shapeSide15', softSide30:'shapeSide30', softSideNeg15:'shapeSideNeg15', softFree15:'shapeFree15' })) {
  arms[name] = { ...arms[source], stiff1:0.8, stiff2:0.8 };
}
arms.softFree15NoBind = { ...arms.softFree15, pBindP:0 };
const base = {
  W: 40, H: 40, nA: 150, nB: 150, nC: 150, nD: 150, nP: 120, nQ: 120,
  n1: 150, n2: 150, nE: 100, capFray: 0.03, pUnzip: 1, pFray: 0.001,
  pUndock: 0.1, endLoss: true, seedSeq: 'PDABBABQ,PCABBABQ', seedCount: 6,
  pSoft: 0.002, translate: true, transCode: 'A1,B2', catalysis: true,
  bindAny: true, transStart: 'D', pLinkBare: 0.05, pMisMelt: 0.05,
  maxEventLog: 0, maxBirthLog: 100000,
};
const columns = ['arm', 'seed', 't', 'hostBirths', 'mimicBirths', 'otherBirths', 'products',
  'hostSites', 'mimicSites', 'otherSites', 'hostBound', 'mimicBound', 'otherBound',
  'matchedBound', 'mismatchedBound', 'productUnits', 'readyUnits', 'waitingUnits', 'sameSiteBound',
  'productLateralEvents', 'productDockEvents', 'productBindEvents',
  'boundBendDeg', 'boundShapeSamples', 'freeBendDeg', 'freeShapeSamples'];

function capped(q) { return /^P.*Q$|^Q.*P$/.test(q); }
function kind(q) { return !capped(q) ? 'other' : q.includes('D') ? 'host' : 'mimic'; }
function sample(s, row) {
  const seen = new Set();
  for (let u = 0; u < s.n; u++) {
    if (!LETTERS.includes(s.type[u]) || seen.has(u)) continue;
    const chain = s.strandOf(u);
    for (const v of chain) seen.add(v);
    const category = kind(chain.map(v => s._letter(v)).join(''));
    for (const v of chain) {
      // Armed non-cap positions: a site-exposure denominator, not a count of collision opportunities.
      if (s.is[v] !== I_TPL || s.type[v] === 7 || s.type[v] === 8) continue;
      row[category + 'Sites']++;
      const q = s.bond[v * 4 + K];
      if (q < 0 || !isProd(s.type[q >> 2]) || s.is[q >> 2] !== I_TPL) continue;
      const p = q >> 2;
      row[category + 'Bound']++;
      row[s._code[s.type[v]] === s.type[p] ? 'matchedBound' : 'mismatchedBound']++;
      // A unit returning to the exact block it formed on, NOT a whole-maker identity metric.
      if (s.parentOf[p] === v) row.sameSiteBound++;
    }
  }
  for (let u = 0; u < s.n; u++) {
    if (!isProd(s.type[u]) || (s.bond[u * 4 + L] < 0 && s.bond[u * 4 + R] < 0)) continue;
    row.productUnits++;
    if (s.is[u] === I_TPL) row.readyUnits++;
    if (s.is[u] === I_REPEL) row.waitingUnits++;
    if (s.is[u] === I_TPL && 'boundBendDeg' in row) {
      const left = s._side(u, L, [0,0,0,0]), right = s._side(u, R, [0,0,0,0]);
      const bend = Math.acos(Math.max(-1, Math.min(1, -left[2]*right[2]-left[3]*right[3]))) * 180/Math.PI;
      const prefix = s.bond[u*4+F] >= 0 ? 'bound' : 'free';
      row[prefix+'BendDeg'] += bend; row[prefix+'ShapeSamples']++;
    }
  }
}
function run(job) {
  const params = { ...base, ...arms[job.arm], seed: job.seed };
  if (job.mode === 'probe') Object.assign(params, { pFray: 0, pSoft: 0 });
  const s = new Sim(params), initialTypes = Array.from(s.type);
  const eventKeys = ['productLateralEvents', 'productDockEvents', 'productBindEvents'];
  const previous = Object.fromEntries(eventKeys.map(k => [k, s[k]]));
  const rows = [];
  for (let end = Math.min(job.every, job.steps); ; end = Math.min(end + job.every, job.steps)) {
    const row = Object.fromEntries(columns.map(c => [c, 0]));
    Object.assign(row, { arm: job.arm, seed: job.seed, t: end });
    while (s.t < end) { s.run(Math.min(100, end - s.t)); sample(s, row); }
    for (const b of s.births) {
      if (b.prod) row.products++;
      else row[kind(b.seq) + 'Births']++;
    }
    for (const k of eventKeys) { row[k] = s[k] - previous[k]; previous[k] = s[k]; }
    const errors = s.check();
    if (errors.length || s.n !== initialTypes.length || initialTypes.some((t, i) => s.type[i] !== t)) {
      throw new Error('Invariant failure: ' + JSON.stringify(errors));
    }
    rows.push(row);
    parentPort.postMessage({ progress: row, births: s.births });
    s.births.length = 0;
    if (end === job.steps) break;
  }
  return { rows, params: s.p };
}

if (!isMainThread) {
  parentPort.postMessage({ result: run(workerData) });
} else if (require.main === module) {
  const options = { out: '', steps: 50000, every: 10000, seeds: '1,2', arms: 'baseline,delay100,delay1000,melt', workers: 4, mode: 'race' };
  for (let i = 2; i < process.argv.length; i += 2) {
    const key = process.argv[i].replace(/^--/, '');
    if (!(key in options) || process.argv[i + 1] === undefined) throw new Error('Unknown or missing option: ' + process.argv[i]);
    options[key] = typeof options[key] === 'number' ? Number(process.argv[i + 1]) : process.argv[i + 1];
  }
  const seeds = options.seeds.split(',').map(Number), selected = options.arms.split(',');
  if (!options.out || !['race', 'probe'].includes(options.mode) ||
      ![options.steps, options.every, options.workers].every(x => Number.isInteger(x) && x > 0) || options.workers > 4 ||
      !seeds.every(Number.isInteger) || new Set(seeds).size !== seeds.length || new Set(selected).size !== selected.length ||
      selected.some(a => !Object.hasOwn(arms, a))) throw new Error('Invalid batch options');
  fs.mkdirSync(path.dirname(options.out), { recursive: true });
  const csv = options.out + '.csv', manifest = options.out + '.manifest.json', births = options.out + '.births.jsonl';
  if ([csv, manifest, births].some(f => fs.existsSync(f))) throw new Error('Output exists; choose a new --out prefix');
  const jobs = seeds.flatMap(seed => selected.map(arm => ({ ...options, seed, arm })));
  const metadata = { options, node: process.version, platform: process.platform, started: new Date().toISOString(),
    simSha256: crypto.createHash('sha256').update(fs.readFileSync(path.join(__dirname, '../src/sim.js'))).digest('hex'),
    modelSha256: crypto.createHash('sha256').update(fs.readFileSync(path.join(__dirname, 'product_latches.js'))).digest('hex'),
    shapeSha256: crypto.createHash('sha256').update(fs.readFileSync(path.join(__dirname, 'product_shapes.js'))).digest('hex'),
    scriptSha256: crypto.createHash('sha256').update(fs.readFileSync(__filename)).digest('hex'),
    // CPU usage is process-wide for worker threads: report only once for the whole batch below.
    jobs: [], complete: false };
  const cpuStart = process.cpuUsage(), wallStart = Date.now();
  fs.writeFileSync(csv, columns.join(',') + '\n', { flag: 'wx' });
  fs.writeFileSync(births, '', { flag: 'wx' });
  fs.writeFileSync(manifest, JSON.stringify(metadata, null, 2));
  let next = 0, active = 0, completed = 0, failed = false;
  const launch = () => {
    while (!failed && active < options.workers && next < jobs.length) {
      const job = jobs[next++]; active++;
      const worker = new Worker(__filename, { workerData: job });
      let received = false;
      worker.on('message', msg => {
        if (msg.progress) {
          console.error(JSON.stringify(msg.progress));
          fs.appendFileSync(csv, columns.map(c => msg.progress[c]).join(',') + '\n');
        }
        if (msg.births && msg.births.length) fs.appendFileSync(births,
          msg.births.map(b => JSON.stringify({ arm: job.arm, seed: job.seed, ...b })).join('\n') + '\n');
        if (!msg.result) return;
        received = true;
        const { params } = msg.result;
        metadata.jobs.push({ arm: job.arm, seed: job.seed, params });
        fs.writeFileSync(manifest, JSON.stringify(metadata, null, 2));
      });
      worker.on('error', err => { failed = true; process.exitCode = 1; console.error(err); });
      worker.on('exit', code => {
        active--; completed++;
        if (code !== 0 || !received) { failed = true; process.exitCode = 1; }
        if (completed === jobs.length) {
          const cpu = process.cpuUsage(cpuStart);
          Object.assign(metadata, { complete: !failed, finished: new Date().toISOString(),
            cpuSeconds: (cpu.user + cpu.system) / 1e6, wallSeconds: (Date.now() - wallStart) / 1000 });
          fs.writeFileSync(manifest, JSON.stringify(metadata, null, 2));
        }
        launch();
      });
    }
  };
  launch();
}
module.exports = { capped, kind, sample };
