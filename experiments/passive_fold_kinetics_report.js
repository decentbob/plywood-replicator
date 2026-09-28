#!/usr/bin/env node
// Secondary, ungated readouts for Q7b; requires a matching successful validation record.
const fs = require('fs'), assert = require('assert/strict');
const { hash, cpu } = require('./duplex_repair.js');
assert(process.argv[2], 'Usage: node experiments/passive_fold_kinetics_report.js RAW.json [NEW_REPORT.json]');
const file = process.argv[2], output = process.argv[3]; if (output) assert(!fs.existsSync(output), 'Refusing overwrite');
const bytes = fs.readFileSync(file), data = JSON.parse(bytes), validation = JSON.parse(fs.readFileSync(file + '.validation.json'));
assert(validation.valid && validation.inputSha256 === hash(bytes), 'Matching successful validation required');
const median = xs => { const v = xs.filter(x => x !== null).sort((a, b) => a - b); return v.length ? v[(v.length - 1) >> 1] : null; };
const rows = [];
for (const preparation of ['escape', 'acquire']) for (const mode of ['body4', 'individual4', 'individual16']) for (const arm of ['straight', 'fold45']) {
  const rs = data.records.filter(r => r.job.preparation === preparation && r.job.mode === mode && r.job.arm === arm), o = rs.map(r => r.outcome);
  const steps = rs.length * 1000;
  rows.push({ preparation, mode, arm, n: rs.length,
    firstEventRelink: o.filter(x => x.firstFaceEvent && x.firstFaceEvent.op === 'link').length,
    firstEventUnlink: o.filter(x => x.firstFaceEvent && x.firstFaceEvent.op === 'unlink').length,
    noFaceEvent: o.filter(x => !x.firstFaceEvent).length,
    directEscape: o.filter(x => x.directEscape).length, releasedByHorizon: o.filter(x => x.firstRelease !== null).length,
    medianFirstRelease: median(o.map(x => x.firstRelease)), anyFaceLink: o.filter(x => x.firstFaceLink !== null).length,
    everFullBridge: o.filter(x => x.firstFull !== null).length, sustainedBridge: o.filter(x => x.bridge).length,
    medianFirstBridge: median(o.map(x => x.firstBridge)), faceLinks: o.reduce((n, x) => n + x.faceLinks, 0),
    occupiedFaceFraction: o.reduce((n, x) => n + x.occupiedFaceSteps, 0) / (2 * steps),
    pair0EligibleFraction: o.reduce((n, x) => n + x.eligibleSteps[0], 0) / steps, pair1EligibleFraction: o.reduce((n, x) => n + x.eligibleSteps[1], 0) / steps,
    finalOccupied: o.map(x => x.finalFlags[1]).reduce((m, k) => (m[k] = (m[k] || 0) + 1, m), {}),
    finalBothExact: o.filter(x => x.finalFlags[0] & 1).length, lateralEvents: o.reduce((n, x) => n + x.lateralEvents, 0),
    births: rs.reduce((n, r) => n + r.births, 0),
    relaxed: preparation === 'acquire' ? rs[0].relaxedGeometry.map(g => ({ gap: +g.gap.toFixed(5), angle: +g.angle.toFixed(3), pass: g.pass })) : null,
    relaxedIdentical: rs.every(r => JSON.stringify(r.relaxedGeometry) === JSON.stringify(rs[0].relaxedGeometry)) });
}
const report = { command: process.argv, scriptSha256: hash(fs.readFileSync(__filename)), inputSha256: hash(bytes), gate: data.summary, rows,
  runCpuSeconds: JSON.parse(fs.readFileSync(file + '.cpu.json')).cpuSeconds, validationCpuSeconds: validation.cpuSeconds, reportCpuSeconds: cpu() };
if (output) fs.writeFileSync(output, JSON.stringify(report, null, 2) + '\n', { flag: 'wx' });
for (const r of rows) console.log(JSON.stringify(r));
console.log(JSON.stringify({ reportCpuSeconds: report.reportCpuSeconds }));
