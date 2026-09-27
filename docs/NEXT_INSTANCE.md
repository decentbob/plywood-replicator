# Next-instance handoff — 2026-09-27

Start with `git status`, AGENTS, [ROADMAP](../ROADMAP.md),
[LEDGER](../experiments/LEDGER.md) and the research audit. Q2 is complete as
RESULTS 73 and parked as a candidate source. Next is Q3's ecological delivery
diagnostic **design**, before replay. No simulation batch is queued and no
task-owned simulation process remains.

## Completed support audit

Baseline `1874b38` on main; find the delivered commit with `git log`.
The [frozen plan](../experiments/fuel_support_plan.md) preceded pair counting.
`fuel_support.js` analyzes all sixteen section-72 screen worlds, using the
unchanged original source/hash/bond-tape validation. No rules, physical arrays,
simulation RNG, material, states or historical assay sources were changed.

- 2,611 fuel events: 1,680 fully identified, 443 untracked actors, 488 tracked
  actors with unknown holders; zero same-row-only support. All eight off worlds
  have zero events/edges. Event-time identity never borrows later membership.
- 1,421 within-world pairs: 117 reciprocal, eight repeated both ways, one
  nonfounder pair with subsequent fueled exact renewal of both participants.
  Helper sets change in 684/889 successive covered events.
- The sole primary is ABABA/opposed20 seed 304, rows 70 (ABAB) and 71 (BABAB).
  Both renew and later fray; no inherited association is shown.
- Fixed opportunity reference: same actor row/unit, helper cardinality, 10k
  bin, prior contact episodes, helpers still live at consumption, duration
  weighting and 199 draws. Charge is unknown, so this is not a causal null.
- No candidate passes. Primary one versus reference median two/q95 three in
  that world; all other primaries zero. Only 3.3–6.2% of covered events have an
  alternative helper set, below the fixed 20% gate. Sparse alternatives limit
  identification, not proof that partners are interchangeable.
- 9.327 process CPU seconds, zero simulation steps, no plan deviations.
  Q1 remains failed; no confirmation, null retuning or pair manipulation.

Archive `experiments/out/FS_audit_20260927.json` (10,540,542 bytes) includes
input/source/plan hashes, exact command, receipts, lifetimes, opportunities,
pairs, all reference draws and decision. Scratch original is preserved and
byte-identical. Inputs remain `SVG_screen_20260927.manifest.json` and
`.runs.jsonl`; the raw JSONL is about 50.5 MB and must not be discarded.
Historical SVG viability/screen evidence and all hashed sources are unchanged.

## Validation and reproduction

```sh
node experiments/fuel_support_test.js
node experiments/fuel_support.js --verify experiments/out/FS_audit_20260927.json
node experiments/fuel_support_analysis_test.js experiments/out/FS_audit_20260927.json
```

Creation requires a fresh output stem; the report preserves the actual
`node experiments/fuel_support.js experiments/scratch/FS_audit_20260927`
command. Synthetic ordered-identity/readiness/episode/renewal/reference tests
pass. Complete hash validation and deterministic recomputation pass. Independent
raw-lifetime/holder queries reproduce all sixteen worlds; pool/draw/quantile/gate
checks pass and ten corrupted records are rejected. No core suite, fingerprint
rerun or individual-kick test was needed or run for this offline-only change.
Section 72 retains its earlier successful core checks and default fingerprints.

## Next: Q3 observer design, before replay

Read [the portfolio reassessment](../experiments/portfolio_after_support.md).
It compares the exhausted support/shape route, ecological delivery and the
parked acquisition/random-table routes. Section 62's low recipient occupancy
has not been separated into encounter, binding, recipient loss or downstream
assembly failure. The existing observer saves only 100-step aggregate occupancy,
birth members and sampled 5k follow-up; no contact/link tape. Aggregate lag
correlations cannot fill that gap.

Design event witnesses for physical contact opportunity, mature-product
binding, supported lateral linking and complete detached output with continuous
member history. Include recipient availability and unknown classifications.
First demonstrate discriminating signatures and observer neutrality on small
fixtures. Freeze worlds/controls, horizon, CPU cap and stop gate before any
deterministic archived-world replay; include successful and failed confirmation
worlds, not only seed 106. Keep all IDs in observation and use existing local
rules. Explain the possible later material-matched causal contrast. If no
discriminator survives, stop design and record why. No replay or new population
batch has yet been queued. All earlier failed gates remain failed.

Standing approval permits committing and pushing validated work. Inspect
local/remote status before delivery; main is the only long-lived branch.
