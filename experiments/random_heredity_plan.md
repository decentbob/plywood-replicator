# P4: exact structures, new material, and prepared-seed controls

2026-09-26, baseline 0f2dbed; RESULTS 32 and audit motivate this assay.
No new chemistry. The question is whether an existing random table propagates
two distinct structures beyond founder material, rather than repeatedly forming
the same equilibrium structure. A positive screen would earn fresh confirmation,
not an evolved-complexity claim.

## Fixed stages and scope

1. Recover archived parameters for 55,57,4,15,1,54 and check drawR equality.
   Save explicit tables, hashes and current effective physics. Select table 55
   first by the existing queue order; no table search. Run seed 1 for 30k steps,
   sample exact state-independent structures of sizes 3..10 every 5k. Rank by
   total sampled occurrence, then canonical signature. Choose the first pair
   with equal type inventories and different side-labelled structure, each
   present at the final sample. Save actual captured geometry and internal state.
   If no such pair exists, report that limitation and do not silently substitute
   another table. Recovery is selection by the experimenter, not evolution.
2. Preserve copyTable(0.00003,0.01), rBreak=0.000005, 150 each A/B, 25x25
   as positive control. Prepared variants AAB and ABA (same composition), four
   founders each. Count each sequence together with its reversed orientation,
   explicitly as a control-specific target set. Random targets use exact local
   side identity without collapsing side permutations. State is excluded from
   structural identity but retained in raw data.
3. Viability/calibration: control variants, seeded arm only, seed 201, 10k.
   Require at least one new founder-disjoint detached target of each variant.
   If this fails, stop before the main screen; inspect the instrumentation and
   report the failed calibration. No horizon or rate rescue in this assay.
4. If viable and a random pair is recovered, run both tables, two variants,
   fresh bath seeds 202/203, arms seeded/disrupted/plain, 50k each (24 worlds).
   All arms have identical counts and base bath. Seeded and disrupted use the
   same four placements, members, shapes and states; disrupted removes founder
   bonds only at t=0. Plain is the unmodified bath. This controls preparation
   better than subtracting the founder count from final populations. Record
   overlaps; no mid-run placement, exclusion or type change.

## Locality and physics

Unchanged RChem: own type/state/bonds and bonded-side colors determine staged
next states, then incident bonds lose incompatible/thermally broken contacts.
No observer IDs, signatures, membership or ancestry feed back into reactions.
No new state, side mark, type, rule or physical knob. bodyJostle=true, iters=4,
snapCorners=true as current RChem; compare all arms under those settings.
Historical base defaults differed, so this is a current-physics assay, not
historical trajectory replication. Promising mechanical claims need P0 later.

## Observation and fixed decision

Exact canonical connected graph: immutable type plus the four local side numbers,
rooted traversals at every vertex, no finite-round hash used as identity. Treat
every bond event as observer input. A target event is a newly isolated exact
component on a new set of members, regardless of internal-state phase. Deduplicate
reappearance of the same member set. Report founder overlap separately. Record
actual attachment/loss histories, not a pedigree inferred from shape alone.

Primary screening outcome per world: unique founder-disjoint target member sets
first observed by 50k, with structure surviving continuously for at least 100
steps. Any incident bond change interrupts that persistence. Also count both
variants in every world, including off-target structures. Record direct contacts
to known target members as exposure evidence, never sufficient proof of copying.
The independent unit is the bath seed, not a contact or repeated snapshot.

Promote a random-table lead only if, for BOTH variants and BOTH bath seeds,
seeded exceeds BOTH controls by >=3 persistent new target member sets, and the
seeded world has at least one persistent new target that later contacts material
of another persistent, disjoint new target before that second target separates.
This contact witness is necessary, not a sufficient pedigree. Opposite-variant
convergence, transient releases, founder fragments and non-renewing accumulation
do not establish heredity. Full confirmation must reconstruct causal formation
and transmission through further material turnover. A failed fixed gate parks
this tested pair; no expanded table search, rate tuning or extra seeds here.

Persist initial/final subclass save states, bond events, target episodes/member
sets, 1k-step inventory samples, parameters, explicit table, protocol and source
hashes. Test exact identity, reversal distinction, member reuse, state changes,
observer neutrality (all arrays/RNG), and RChem restart. Check invariants and
default fingerprints. At most four workers total; use two workers initially.
CPU budget 3,600 seconds for the whole assay, record any budget-censored worlds.
Failed and zero outcomes remain archived. Unique scratch stems; no overwrites.
RESULTS/LEDGER/ROADMAP and a descriptive commit complete this bounded assay.
