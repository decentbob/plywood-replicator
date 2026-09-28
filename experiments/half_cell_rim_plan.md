# Q8c: chemically separate rim bonds and local W recruitment

Frozen 2026-09-28 before tests/outcomes. ROADMAP Q8c; RESULTS 82–83.
Question: can a cap retain its ordinary end/release/rearming rules while a
distinct polymer bond constrains it physically, and acquire that bond by contact?
This is a prerequisite for independent daughter boundaries, not a complete
half-cell, inheritance or radiation-benefit test.

## Local contract and implementation scope

Keep Q8a's cap pentagons and rectangular W stubs. W remains the fixed C carrier
for the entire run; its ordinary chemistry is inert. No new chemical states,
relays, clocks, division/length/completion predicates or type conversions.
`rimBond` stores reciprocal endpoint bonds separately from ordinary `bond`.
Immutable labels: P's outer port +, Q's outer port -, W F -, W K +. Opposite
labels bind only when at least one participant is W; cap/cap rim bonds are
incompatible. This allows W/W polymerization as well as P/W and Q/W. Q-attached
W uses K instead of F; rotate its rectangle 180 degrees in preparation, leaving
the same outline. No curvature, arc closure or forced ownership is programmed.

An exposed pair of compatible ends binds with probability one if both reversed
endpoint gaps are <=.1 and normals oppose within 10 degrees. This reads pair
geometry, labels and occupancy and changes only their incident bond. No snapping
or shared-parent/half-cell check. Bonds persist in this first assay (no rim-loss
knob); count sequestration and do not infer turnover from persistence.
`rimBind=false` is the one new ablation knob, otherwise true in this subclass.

Ordinary chemistry sees only ordinary bonds, using unchanged derive/transition
rules for A/P/Q/E. W cannot enter that table. Physics sees their union through
a temporary mechanical bond array, restored before any chemistry/observation.
Existing polygon contacts/body16 or individual16 are used. This carrier layout
does not impose a four-side design limit. Each chemical and physical port is
distinct here; no core arity refactor is needed for this fixture.

Ordinary binding retains compatibility and geometric tests, with current-corner
candidate bounds. A completely mechanically free block may be projected onto
an exposed edge with a rotated-polygon vacancy test. If both participants have
any bond (including rim bonds), add an in-place pin only when endpoint gaps
are <=.1. Never move an attached cap alone or an entire assembly into place.
E binding does not move either participant. Relaxation resets only mechanically
free blocks. Undocking kicks, proofreading, strain breaking and snapping are
disabled/guarded in this assay; broader chemistry is not claimed supported.

## Fixed tests and worlds

First deterministic interface checks: P/Q end signals with/without rim;
rim cannot substitute for a missing rail or keep a cap armed after rail loss;
ordinary local release and supplied-energy rearm leave rim bonds intact;
W ordinary ports are inert; correct and wrong labels, W/W contact and ablation;
attached-cap docking does not translate/rotate either attached participant;
mechanical union matches the established contact solver's physical arrays/RNG;
serialization/restoration preserves both graphs; poisoned observer metadata is
not read by contact rules. Record failures before any repair/rerun.

New seeds 701/703 × initial end P/Q × body16/individual16 =8 preparations.
Each has the same eight blocks as Q8a, both chain rails and two copying contacts
prepared. Parent cap/letter start TPL, daughter cap/letter DOCK, two E ON.
No chemistry-driven acquisition of the supplied chains is claimed. Ordinary
release is not manually imposed in these runs. Use .8 stiffness, sigma .3 and
sigmaRot .45, iters16, 24×24 torus. Set breaking/fraying/melting/undocking,
spontaneous chain joining and reload to zero. Energy is still required to rearm.

For each preparation run three arms: prepared rims (200 steps, new rim binding
off), near/on and near/off (300 steps). Near W blocks start unbound, .06 outward
from their matching cap rim faces. This is a prepared near-contact opportunity,
not capture from a well-mixed bath. Two W blocks can also join each other; count
those bonds, wrong-cap attachment and remaining free/sequestered W explicitly.
No insertion, material creation, external repositioning or post-start intervention.

Gate: deterministic checks all pass. All8 prepared worlds release both initial
copying contacts by t10 and reach structural clearance >=.1 by t200, retaining
their rim/rail bonds, with final20 frames max pin <=.1 and all-pair overlap <=.02.
For each mode/end stratum at least1/2 near/on worlds must acquire a W on the
initial parent cap and retain it through the final20 frames with pin <=.1 and
all-pair overlap <=.02; near/off must have zero rim recruitment. The partner
may be either W: IDs are observer classifications, not admissibility rules.
Report first recruitment/release, rearmed chain units, W/W and cross-side links
and physical residuals. Unit is a world, not repeated contact. Same-seed arms
share initial preparations; later RNG/body motion can diverge.

First5 steps check finite state, conservation, symmetric disjoint bond tables
and max retained pin <=1. Stop on invariant/viability failure, preserve partial
raw. Ordinary gate failures do not censor remaining worlds. No tuning, longer
horizon or extra seeds to rescue failure. A pass earns a chain-copying/curved-rim
assay, not full-cell or core promotion; failure parks this acquisition setting
until a distinct cause is identified. No new timing state is a default rescue.

## Evidence and reproduction

One process, no workers; inspect active simulations. CPU budget180s, execution
cap75s, validation cap75s, reserve30s for tests/failures/archive. Count all measured
CPU and physics steps, disclose any untimed bookkeeping. Preserve actual polygons,
ordinary/rim bond tables, states, initial/mid/final saved states, input/source
hashes and commands. Observed/plain and midpoint restart must agree in physical
arrays and RNG, ignoring only pinsVersion and normalizing initial restored cache.
Replay all samples; independently recompute geometry/gates and reject altered
corners, rim bonds and labels. Keep source bytes immutable once runs begin.

```
node experiments/half_cell_rim_test.js experiments/scratch/HC_rim_20260928.tests.json
node experiments/half_cell_rim_assay.js experiments/scratch/HC_rim_20260928.json.gz
node experiments/half_cell_rim_assay.js --validate experiments/scratch/HC_rim_20260928.json.gz
```

Refuse overwrites, retain failed source snapshots, archive evidence in out.
RESULTS84/LEDGER, rebuild index, update ROADMAP and short handoff. Core/historical
sources remain unchanged; no full core suite/default fingerprint rerun is needed.
