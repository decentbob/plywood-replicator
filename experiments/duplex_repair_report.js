#!/usr/bin/env node
const fs = require('fs'), assert = require('assert/strict');
const { hash, cpu } = require('./duplex_repair.js');
assert(process.argv[2], 'Usage: node experiments/duplex_repair_report.js RAW.json [NEW_REPORT.json]');
const file = process.argv[2], output = process.argv[3];
if (output) assert(!fs.existsSync(output), 'Refusing overwrite');
const bytes = fs.readFileSync(file), data = JSON.parse(bytes);
const validation = JSON.parse(fs.readFileSync(file + '.validation.json'));
assert(validation.valid && validation.inputSha256 === hash(bytes), 'Matching valid evidence required');
const rows = [];
for (const mode of ['body4', 'individual4', 'individual16']) for (const arm of ['bridge', 'split', 'unbound', 'noLigate', 'uncut']) {
  const group = data.records.filter(r => r.job.mode === mode && r.job.arm === arm);
  const before = group.flatMap(r => r.samples.filter(g => r.outcome.firstRepair === null || g.t <= r.outcome.firstRepair));
  rows.push({ mode, arm, n: group.length, repaired: group.filter(r => r.outcome.repaired).length,
    times: group.map(r => r.outcome.firstRepair), eligibleOpenScans: before.filter(g => g.free && g.pass).length,
    totalScansBeforeRepair: before.length, finalOccupiedFaces: group.map(r => r.outcome.occupiedFaces),
    supportRepairs: group.map(r => r.outcome.supportRepair),
    changedNeighbors: group.reduce((n, r) => n + r.outcome.changedNeighborJoins, 0), births: group.reduce((n, r) => n + r.outcome.births, 0) });
}
const report = { command: process.argv, inputSha256: hash(bytes), scriptSha256: hash(fs.readFileSync(__filename)),
  rows, gate: data.summary, runCpuSeconds: JSON.parse(fs.readFileSync(file + '.cpu.json')).cpuSeconds,
  validationCpuSeconds: validation.cpuSeconds, reportCpuSeconds: cpu(),
  accountingScope: 'Process CPU through calculation; excludes final small report serialization/write and any separate auxiliary commands.' };
if (output) fs.writeFileSync(output, JSON.stringify(report, null, 2) + '\n', { flag: 'wx' });
console.log(JSON.stringify(report));
