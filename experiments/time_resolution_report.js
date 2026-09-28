#!/usr/bin/env node
// Secondary, ungated Q9 readouts; requires the matching successful validation record.
const fs = require('fs'), zlib = require('zlib'), assert = require('assert/strict');
const { hash, cpu } = require('./duplex_repair.js');
const T = require('./time_resolution.js');
const stem = process.argv[2], output = process.argv[3];
assert(stem, 'Usage: node experiments/time_resolution_report.js STEM [NEW_REPORT.json]'); if (output) assert(!fs.existsSync(output), 'Refusing overwrite');
const validation = JSON.parse(fs.readFileSync(stem + '.validation.json')); assert(validation.valid);
const median = xs => { const v = xs.filter(x => x !== null).sort((a, b) => a - b); return v.length ? v[(v.length - 1) >> 1] : null; };
const rows = [], cpus = {};
for (const mode of T.modes) {
  const file = `${stem}_${mode}.json.gz`, bytes = fs.readFileSync(file);
  assert.equal(validation.inputs[file.split('/').pop()], hash(bytes), 'input differs from validated bytes');
  const data = JSON.parse(zlib.gunzipSync(bytes)); cpus[mode] = JSON.parse(fs.readFileSync(file + '.cpu.json')).cpuSeconds;
  for (const preparation of ['acquire', 'escape']) for (const dt of T.dts) {
    const o = data.records.filter(r => r.job.preparation === preparation && r.job.dt === dt).map(r => r.outcome);
    rows.push({ mode, preparation, dt, n: o.length, anyFaceLink: o.filter(x => x.firstFaceLink !== null).length,
      medianFirstLink: median(o.map(x => x.firstFaceLink)), everFull: o.filter(x => x.firstFull !== null).length,
      bridge: o.filter(x => x.bridge).length, firstEventRelink: o.filter(x => x.firstFaceEvent && x.firstFaceEvent.op === 'link').length,
      directEscape: o.filter(x => x.directEscape).length, released: o.filter(x => x.firstRelease !== null).length,
      occupied: +(o.reduce((a, x) => a + x.occupiedFaceFraction, 0) / o.length).toFixed(4),
      eligible: +(o.reduce((a, x) => a + x.eligibleFraction[0] + x.eligibleFraction[1], 0) / (2 * o.length)).toFixed(4),
      faceLinks: o.reduce((a, x) => a + x.faceLinks, 0), lateralEvents: o.reduce((a, x) => a + x.lateralEvents, 0) });
  }
}
const report = { command: process.argv, scriptSha256: hash(fs.readFileSync(__filename)), verdicts: validation.combined, rows,
  runCpuSeconds: cpus, validationCpuSeconds: validation.cpuSeconds, reportCpuSeconds: cpu() };
if (output) fs.writeFileSync(output, JSON.stringify(report, null, 2) + '\n', { flag: 'wx' });
for (const r of rows) console.log(JSON.stringify(r));
console.log(JSON.stringify({ reportCpuSeconds: report.reportCpuSeconds }));
