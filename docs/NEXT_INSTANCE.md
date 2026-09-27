# Next-instance handoff — 2026-09-27

The user is switching instances after this completed slice. Start with
`git status`, AGENTS, [ROADMAP](../ROADMAP.md), [LEDGER](../experiments/LEDGER.md)
and the research audit. **Q3's fixture gate is complete (RESULTS 74). The
archived-world replay has not started.** No task-owned simulation remains.

## Delivered slice

Baseline `98838fc` on main; find this slice's delivered commit with `git log`.
New observer: `experiments/delivery_diagnostic.js`. It wraps existing methods
without changing chemistry, state, material, probabilities, forces or RNG.
Historical sources and core bytes are unchanged.

- Measures armed recipient availability, engine-scanned mature product/open-
  back geometry (also at pBindP=0), actual binding episodes and placement
  failures, cat-supported local lateral links, and detached exact output.
- Support requires the actual mature product bond plus a witnessed binding
  episode. Stale cat signals remain unknown. Row IDs retire on lateral edits/
  fraying; a broken/replaced bond cannot reuse an old support witness.
- All twelve prepared stage/control fixtures pass. Supported and bare cases
  both produce one exact child, but only the supported case gets attribution.
  Retired parent, severed link and stale signal cases are correctly excluded.
- Eight small worlds (411/412, four arms, 1k) match unobserved state, typed
  arrays, numeric counters and RNG; a 500-step restart matches observation.
  These worlds have NO mature deliveries or births. All twelve prepared
  cases therefore also have explicit unobserved controls, and a restart
  during an active binding episode checks the positive observation path.
- Independent reconstruction of 20 bond/row/release histories, six corruption
  checks and a complete deterministic suite rerun pass. Twenty-four actual-
  corner geometry cases agree with the engine predicate.
- Completed suite: 11.781 process CPU seconds, 20k simulation steps including
  plain/restarted comparisons, plus scheduled fixture phases. Validation
  rerun cost excluded. One process, no workers. No core fingerprint/full-suite
  rerun was needed; core unchanged and fixture invariants pass.

Archive: `experiments/out/DD_fixtures_20260927.json` (3,522,308 bytes), identical
to the retained scratch copy. Contains source/plan hashes, exact command,
initial/final states and complete observer records. Do not tidy hashed files.
This is measurement validation, not an ecological benefit or complexity claim.
The live cat-side dependency remains the existing audit caveat.

```sh
node experiments/delivery_diagnostic_analysis_test.js experiments/out/DD_fixtures_20260927.json
node experiments/delivery_diagnostic_analysis_test.js experiments/out/DD_fixtures_20260927.json --replay
```

To recreate evidence use `node experiments/delivery_diagnostic_test.js` with a
fresh output stem; it refuses overwrites. The original command is in the archive.

## Next slice: implement and execute the frozen replay protocol

Read [delivery_replay_plan.md](../experiments/delivery_replay_plan.md), written
before any replay outcomes. No runner for the full replay exists yet.

1. Validate `experiments/out/RD_dependence_confirm` protocol, manifest and raw
   runs. Keep all seeds 105–108 and on/noBind/noSource/neither, original 50k
   horizon and (10k,50k] window. Original batch cost was 1,673.093 CPU seconds.
2. Attach the new observer and original birth/member observer. Reproduce the
   original initial physical hash, full final state/RNG, old 100-step samples,
   births and member follow-ups exactly before interpreting new records.
3. First 105/on to 10k is a cost-only preflight: <=45 CPU seconds, <=1 GiB RSS,
   projected 80-fold CPU <=3,600 seconds. Continue the same instance if it
   passes. Stop on cost/measurement failure and preserve partial evidence.
   Prefer one process initially, at most three workers thereafter, always
   within the machine-wide four-simulation limit. Inspect active processes;
   many Node processes are Codex/MCP services, not simulations.
4. Freeze launch hashes/commands before stepping. Keep original chemistry and
   `delivery_diagnostic.js` unchanged. Store full records losslessly; no raw
   data deletion. A replay mismatch or coverage failure is an honest stop.
5. Plan fixes availability/encounter/binding/use rates, censoring and output
   witnesses. Both previously failed worlds must be strictly below both
   passed worlds for a retrospective stage signature. Require >=80% known
   site coverage and minimum denominators (20 contacts or ended bindings).
   No pooling, threshold tuning or choosing only seed 106. A signature is
   not causal proof; no signature/coverage means no isolated explanation.

A possible later catalytic-efficacy ablation would keep production/binding but
make docked letters use their existing bare linking rate. It is NOT implemented
or yet earned. It would require its own causal plan and prepared control;
later contacts can diverge. No new population screen, confirmation, frequency
race or reward motif is queued. Section 62 and Q1 remain failed; Q2 is parked.

Standing approval permits committing/pushing validated work. Main is the only
long-lived branch. Confirm clean local status and remote agreement at delivery.
