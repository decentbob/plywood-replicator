# Next-instance handoff — 2026-09-28 (after Q9)

Read ROADMAP.md, the sole queue. No simulation or lab server is running.
Core, live lab and historical sources are unchanged (LF checkout; the archived
core hashes were taken from a CRLF Windows checkout and match after normalization).

**Q7b (RESULTS 92) failed its frozen gate; passive repair is parked.** Fold45
dimers escape directly more than straight ones (11/9/12 vs 5/4/4 of 16) but
almost never complete a bridge (0/2/0 vs 5/7/7). The runner's built-in validator
failed only on that CRLF hash comparison. `passive_fold_kinetics_validate.js`
is the validator of record.

**Q9 (RESULTS 93): contact kinetics depend on the time step.** Refining time with
existing knobs (kicks x sqrt(dt), probabilities 1-(1-p)^dt) raises flush-pair
bridges under individual kicks from 8/9 to 17/15 of 32 at dt 1/16, and lowers
direct escape from 9–11 to 4. dt 1/4 equals dt 1, so convergence is not shown.
The frozen verdict is sensitive (more acquisition). No earlier gate reopens.

Next: freeze Q9b (a dt 1/64 rung, plus a RESULTS 79 acquire/on re-screen at a
finer step). Whether to adopt a finer default step is a user cost decision. Evidence:
`experiments/out/PF_20260928*` and `experiments/out/TR_20260928*`.

```
node experiments/time_resolution.js MODE experiments/scratch/UNIQUE_MODE.json.gz   # body4 | individual4 | individual16
node experiments/time_resolution_validate.js experiments/scratch/UNIQUE            # expects UNIQUE_<mode>.json.gz
node experiments/time_resolution_report.js experiments/scratch/UNIQUE experiments/scratch/UNIQUE.report.json
```
