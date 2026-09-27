# P2 local port acquisition

2026-09-27, baseline 861abe3; RESULTS 69 follows prepared geometry in 67–68.
Question: can a conserved, initially unbound part acquire two intended contacts
and persist with acceptable physical residuals? This would establish one local
operation needed by resource-efficient assembly, not growth or inherited benefit.

## Fixed local contract

New research subclass only; preserve core and all historical assay sources.
Expose each block's immutable four face labels as saved port data, obtained at
setup from the twelve section-63 patterns. Runtime compares only the two facing
labels and polarity. No pattern sweep, target ID, original membership, position
memory, component classification or type conversion in reactions. No mutable
chemical state and no relayed marks. Square calibration uses generic orthogonal
X/Y complementary faces on every square, not per-position keys.

After inherited polygon physics, enumerate current neighboring blocks and open
complementary faces, using unchanged _geomOK. A block with no incident bonds may
align to the contacting side by a single-block rotation/translation, as in the
core's docking projection. Check the actual proposed rotated pose with polygon
vacancy before moving. Never reposition an already bonded block for association:
if both have bonds, check their current pose. Reversed endpoint gaps must be no
larger than existing linkDistTol (0.15) times mean actual edge length, including
after proposed placement. No new capture tolerance or shape/rest-position reader.
Form one incident bond per accepted face-pair event. Several sequential events
can occur in one step; record this rather than requiring an artificial delay.

Every occupied bond, including prepared scaffold bonds, has the same independent
loss probability 0.001 per step. One draw per bond uses a canonical endpoint only
to avoid duplicate draws. There is no degree-dependent or organism-dependent
retention rule. Releases occur after association; no selected cuts or protected
original bonds. Knobs: association enabled/disabled and this single fixed loss
rate. The zero-loss setting is only a deterministic viability calibration.
No stock copying/energy chemistry or birth counters run.

## Comparisons frozen before outcomes

Area-size mapping only, n=1 three-column left/right boundary fixtures plus the
four-square corner control from 67. Same conserved parts, stiffness 0.5, motion
sigma 0.3 / sigmaRot 0.45, snapCorners/maxStrain off. Each starts in one of three
conditions: unbound incoming part or either one-contact preparation. The unbound
part is displaced 0.35 in each outward coordinate from its ideal site and rotated
by +10/-10 degrees for seeds 221/222; no initial incoming bond. This is a prepared
near-encounter, not recruitment from a random bath. No new parts during runs.

Arms: enabled versus disabled association, identical loss process and physics.
Motion: body4, individual16 and individual32 (32 fixed in advance to check the
large residuals reported at 16). Two fresh seeds 221/222. 3 fixtures × 3 starts ×
2 arms × 3 settings × 2 seeds = 108 worlds, 500 steps each. No rate tuning,
extensions or extra seeds after outcomes. One worker, at most four machine-wide.
Paired starts do not imply matched later random events after bond changes.

Viability first: 12 zero-kick/zero-loss 20-step one-contact worlds (three fixtures,
two first contacts, on/off). All six enabled must acquire both intended bonds;
all six disabled must preserve their exact initial bonds. Any violation stops
the batch; preserve failed evidence and explain implementation defects separately.

Record per-step physical output: actual target bonds, wrong incoming contacts,
first/second acquisition and loss, original-bond survival, counts/types, maximum
incoming bond endpoint gap, incoming hull overlap with every part, and whole-world
maximum pin/hull residuals. Record all bond-change events and reason counts for
rejected association. Save complete initial/final states, snapshots at 0/1/10/100/
500, RNG and immutable labels. Observer IDs/classifications never enter runtime.

Primary success per enabled world: within 500 steps, at least 100 consecutive
steps with both exact target bonds, no wrong incoming contact, every incoming
bond endpoint gap <=0.15, and incoming hull overlap <=0.02 square units. These are
measurement criteria only, not chemistry. Count raw double binding separately
from acceptable persistent output; report all losses and zero runs.

Promotion gate: every unbound enabled case and every prepared enabled case
passes under body4 and individual32; disabled arms never acquire a missing
target bond. Individual16 is the predeclared sensitivity comparison. A two-seed
pass is a lead for a fresh bounded acquisition confirmation / growth plan, not
reproduction, scarcity advantage or core promotion. If the gate fails, park
this tested acquisition setting and compare P2 with alternatives before further
mechanisms or tuning. A measured distinct implementation defect can justify a
separately documented correction; geometry-only eligibility cannot rescue it.

## Validation and delivery

Test complementary-label specificity, vacancy with rotation, rejection without
pose mutation, no bonded-block repositioning, deterministic loss/conservation,
correct subclass/label restart and observer neutrality. Poison setup/observer
metadata and graph traversal helpers during runtime to test the input boundary
(accepted body-jostling traversal remains). Validate complete case coverage,
source/input hashes, events, per-step metrics, summaries and full trajectory
replay; reject corrupt evidence. Run unchanged five default fingerprints; the
full core suite is unnecessary if core remains byte-identical.

Commands: node experiments/port_acquisition_test.js; node
experiments/port_acquisition.js experiments/scratch/PA_screen_20260927;
node experiments/port_acquisition_analysis_test.js
experiments/out/PA_screen_20260927.json.gz; node tools/fingerprint.js 1500.
Archive raw JSON losslessly and summary with exact command, parameters, seeds,
source hashes and CPU time; retain scratch and negatives. Update RESULTS 69,
LEDGER/index and ROADMAP portfolio decision, then commit and push validated work.
