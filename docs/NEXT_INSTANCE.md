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

User direction (2026-09-28): mechanics and logic over simulation precision, and fast
tests. Default dt stays 1 (Q9b retired). Screens use the AGENTS QA tiers and
`experiments/screen_kit.js`. Q10 (RESULTS 94): double strands with heat and ligation lengthen templates but not
specifically under damage; closed. Next: ROADMAP order 1.
Evidence:
`experiments/out/PF_20260928*` and `experiments/out/TR_20260928*`.

```
node experiments/time_resolution.js MODE experiments/scratch/UNIQUE_MODE.json.gz   # body4 | individual4 | individual16
node experiments/time_resolution_validate.js experiments/scratch/UNIQUE            # expects UNIQUE_<mode>.json.gz
node experiments/time_resolution_report.js experiments/scratch/UNIQUE experiments/scratch/UNIQUE.report.json
```

**2026-09-29.** The user asked about the half-cells and re-prioritised speed and logic over
byte identity (AGENTS). Q8k (RESULTS 95): the half-cell runtime is 6x faster
(`half_cell_fast.js`, bit-identical in tests); in-place capture does not fix acquisition,
because one inventory is too little material. Q8l (abundant soup) is next or running;
see ROADMAP. Ideas live in `docs/IDEAS.md`.

