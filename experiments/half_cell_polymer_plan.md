# Q8d correction: ordinary polymer end-corner capture for W

Frozen 2026-09-28 after the user asks why W does not bind like other polymers.
Q8c's nearly flush two-endpoint/10-degree criterion was an unnecessary extra
restriction. Reuse the existing membrane end-corner capture mechanics instead
of the previously proposed free-monomer projection comparison. This explicit
user direction supersedes that queued comparison; no copying/fuel state gate.

HalfCellPolymerSim extends the unchanged rim interface. P+/W+ correspond to
the membrane R endpoint role (second corner); Q-/W- correspond to L (first
corner). Compatible end corners within existing memLinkTol-or-linkDistTol
times mean block size, with side normals opposing at all (dot <=0), may bind
with existing pMem=.2 per contact step. Pins then align their edges; do not
move either whole block at binding. W is constitutively sticky: the M-specific
raw/active ecology is not imported. Keep complementary labels/cap-cap exclusion.
This is code reuse of geometry/probability/bond mechanics, not all M behavior.

No new knobs, states, conversion, ancestry, length, age or completion predicate.
Read contacting end labels, occupancy and physical geometry; write one incident
rim bond. Ordinary chain chemistry/fuel and numerical solver remain unchanged.
Neither energy supply nor state is consulted by W association.

First verify contact decisions against the actual Sim._geomOK membrane branch
through a geometry adapter, both cap roles, angles0/30/90/120 and offsets0/.06/.2.
Verify a corner-touching 30-degree case is accepted while the old nearly-flush
criterion rejects it, and bond addition alone changes no physical pose. Use
pMem=1 only in deterministic functional tests; kinetic runs use default .2.
Test off/wrong labels and ordinary state/energy independence. Preserve any
failed test report and exact source before repair.

Then replay Q8c's same 24 initial worlds with only the association method
changed: seeds701/703, P/Q, body16/individual16, prepared200/on300/off300.
No rate/tolerance/shape/horizon tuning. Keep eight blocks, original inventories
and all other parameters exactly. Prepared/off controls must match archived
physical arrays/RNG. On trajectories may diverge after a contact RNG draw.
Record eligible pairs and successful links at the actual binding phase.

Retain Q8c's gate unchanged: all prepared fixtures pass; at least1/2 on worlds
per mode/end acquire parent-cap W and retain it through final20 frames with
pin <=.1 and overlap <=.02; off recruits nothing. All-frame pin/overlap maxima
are reported separately, including transient failures. First5 steps check
finite state, symmetric disjoint graphs, conservation and pin <=1. Passing
validates acquisition in this preparation only. Failure is a negative screen,
not proof that automatic polymer binding is absent. No further rescue this batch.

Every world gets observed/plain and midpoint restart checks; validate all
frames/geometry/gates and corrupted corners/labels/rim tables. Store exact
source/input hashes, parameters, initial/mid/final states, CPU and phase counts.
One process, no workers; inspect active simulations first. Budget180 CPU s,
execution75, validation75, reserve30 for tests/analysis/archive. Archive failed
and zero outcomes, unique files/no overwrite. Core/historical bytes unchanged.

```
node experiments/half_cell_polymer_assay.js experiments/scratch/HC_polymer_20260928.json.gz
node experiments/half_cell_polymer_assay.js --validate experiments/scratch/HC_polymer_20260928.json.gz
```

RESULTS85/LEDGER/index/ROADMAP/handoff; keep the user's energy flexibility in
the design memo, without adding an energy experiment or changing this batch.
