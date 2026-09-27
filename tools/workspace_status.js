#!/usr/bin/env node
// Read-only startup inventory. Never removes, moves or stages evidence.
const fs = require('fs'), path = require('path'), crypto = require('crypto'), cp = require('child_process');
const root = path.resolve(__dirname, '..');
function files(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    const p = path.join(dir, e.name);
    // Do not follow symlinks or junctions outside the workspace.
    return e.isSymbolicLink() ? [] : e.isDirectory() ? files(p) : e.isFile() ? [p] : [];
  });
}
function digest(file) {
  return new Promise((resolve, reject) => {
    const h = crypto.createHash('sha256'), stream = fs.createReadStream(file);
    stream.on('data', x => h.update(x)); stream.on('error', reject); stream.on('end', () => resolve(h.digest('hex')));
  });
}
async function main() {
  const args = process.argv.slice(2);
  if (args.some(x => x !== '--verify-scratch')) throw Error('Usage: node tools/workspace_status.js [--verify-scratch]');
  const git = args => cp.execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
  const tracked = git(['ls-files', '-z', '--', 'experiments/out']).split('\0').filter(Boolean);
  const archived = files(path.join(root, 'experiments/out')), scratch = files(path.join(root, 'experiments/scratch'));
  const byName = new Map(), missing = [];
  for (const f of tracked) {
    const full = path.join(root, f); if (!fs.existsSync(full)) { missing.push(f); continue; }
    const key = path.basename(f), list = byName.get(key) || []; list.push(full); byName.set(key, list);
  }
  const rel = f => path.relative(root, f).split(path.sep).join('/');
  const trackedSet = new Set(tracked);
  const report = { git: git(['status', '--short', '--branch']).trim().split(/\r?\n/),
    navigation: ['ROADMAP.md (only current queue)', 'docs/NEXT_INSTANCE.md (brief handoff)', 'experiments/LEDGER.md (evidence)'],
    archive: { tracked: tracked.length, missing, untracked: archived.map(rel).filter(x => !trackedSet.has(x)) },
    scratch: { files: scratch.length, bytes: scratch.reduce((n, f) => n + fs.statSync(f).size, 0) },
    simulationActivity: 'Not inferred from files. Inspect process command lines before a run; four workers maximum across the machine.' };
  if (args.includes('--verify-scratch')) {
    const hashes = new Map(), getHash = f => { if (!hashes.has(f)) hashes.set(f, digest(f)); return hashes.get(f); };
    report.scratch.exactArchivedCopies = []; report.scratch.notVerified = [];
    for (const f of scratch) {
      let match;
      for (const candidate of byName.get(path.basename(f)) || []) {
        if (fs.statSync(f).size === fs.statSync(candidate).size && await getHash(f) === await getHash(candidate)) { match = candidate; break; }
      }
      if (match) report.scratch.exactArchivedCopies.push({ scratch: rel(f), archive: rel(match) });
      else report.scratch.notVerified.push(rel(f));
    }
    report.scratch.verificationScope = 'SHA-256 against tracked same-name archives on disk; not a provenance verdict or permission to delete. Different names remain unverified.';
  }
  console.log(JSON.stringify(report, null, 2));
  if (missing.length) process.exitCode = 1;
}
if (require.main === module) main().catch(e => { console.error(e.message); process.exitCode = 1; });
