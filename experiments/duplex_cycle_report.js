#!/usr/bin/env node
const fs = require('fs'), assert = require('assert/strict');
const { hash, cpu } = require('./duplex_repair.js');
assert(process.argv[2], 'Usage: node experiments/duplex_cycle_report.js RAW.json [NEW_REPORT.json]');
const file = process.argv[2], output = process.argv[3]; if (output) assert(!fs.existsSync(output), 'Refusing overwrite');
const bytes = fs.readFileSync(file), data = JSON.parse(bytes), validation = JSON.parse(fs.readFileSync(file + '.validation.json'));
assert(validation.valid && validation.inputSha256 === hash(bytes), 'Matching successful validation required');
const rows = [];
for (const mode of ['body4', 'individual16']) for (const preparation of ['acquire', 'release']) for (const arm of ['on', 'noBind', 'noLigate', 'noMelt']) {
  const rs = data.records.filter(r => r.job.mode === mode && r.job.preparation === preparation && r.job.arm === arm);
  rows.push({ mode, preparation, arm, n: rs.length, newFaceContacts: rs.filter(r => r.outcome.firstNewFaceContact !== null).length,
    sustainedBridges: rs.filter(r => r.outcome.firstBridge !== null).length, repairs: rs.filter(r => r.outcome.firstRepair !== null).length,
    supportedRepairs: rs.filter(r => r.outcome.firstSupportedRepair !== null).length, released: rs.filter(r => r.outcome.success).length,
    censored: rs.filter(r => r.outcome.censored).length, finalOccupiedFaces: rs.map(r => r.outcome.finalFlags[1]),
    occupiedFaceSteps: rs.reduce((n, r) => n + r.outcome.occupiedFaceSteps, 0),
    possibleFaceSteps: rs.reduce((n, r) => n + 8 * r.frames.length, 0), newNeighborJoins: rs.reduce((n, r) => n + r.outcome.newNeighborJoins, 0),
    births: rs.reduce((n, r) => n + r.births, 0) });
}
const report = { command: process.argv, scriptSha256: hash(fs.readFileSync(__filename)), inputSha256: hash(bytes),
  complete: data.complete, viable: data.viable, rows, gate: data.summary || null,
  cases: data.records.map(r => ({ ...r.job, ...r.outcome })),
  runCpuSeconds: JSON.parse(fs.readFileSync(file + '.cpu.json')).cpuSeconds, validationCpuSeconds: validation.cpuSeconds,
  reportCpuSeconds: cpu(), accountingScope: 'Process CPU through calculation; separate fixture command and final report write are not included here.' };
if (output) fs.writeFileSync(output, JSON.stringify(report, null, 2) + '\n', { flag: 'wx' });
console.log(JSON.stringify({ complete: report.complete, viable: report.viable, rows, lead: report.gate && report.gate.lead, reportCpuSeconds: report.reportCpuSeconds }));
