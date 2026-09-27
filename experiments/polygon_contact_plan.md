# P0/P2 polygon contact comparison

2026-09-27, baseline 81ae321, following RESULTS 67. This is one bounded
mechanical correction test, not a growth or turnover experiment. The resource
economy hypothesis needs accessible rectangle contacts before inherited benefit
can be tested. Existing circular exclusion fails analytic rectangle witnesses.

## Contract and implementation fixed before measurement

Use a research subclass of PortSim; leave all core and section-67 source bytes
unchanged. Copy the current physics method with only neighbor/contact sections
replaced, and mechanically verify that kicks, pin corrections, shape restoration
and the final wrapping/strain code remain identical. Body jostling stays enabled
for exploration. No chemistry, new types, states, marks, bond changes or rates.

Represent exclusion by the convex hull of each block's actual current corners.
For overlapping hulls use edge-normal projection intervals to find the smallest
separating translation, split by the existing inverse masses. Like the old
radial force this correction translates centres; pins still rotate and deform
blocks. Hull exclusion is exact for convex outlines and conservative for concave
ones: record hull area minus actual signed polygon area rather than silently
calling it exact deformable-polygon contact. Directly bonded pairs retain the
core's exclusion exemption. No component, pattern, target ID or lineage reader.

For these small worlds enumerate block pairs, filtering on the sum of actual
corner radii plus the existing side-distance tolerance for contact candidates.
Refresh collision bounds at each solver pass and candidate pairs after solving;
no stale hash or fixed radius may exclude a relevant rectangle. A candidate
still must pass unchanged _geomOK. Placement checks use proposed position and
rotation against the other current hulls, including directly bonded neighbors.
Contact and vacancy helpers are physics-only: do not enable the core chemistry
or claim the future bond-formation path is integrated. Fail closed if step or
bond formation is attempted with this subclass.

## Frozen comparison

Input: all initial states and ideal layouts in RP_preflight_20260927.json.gz.
Replay all 120 prepared first-contact cases for 100 steps and all 16 steric
witnesses for 10 steps under both original and corrected physics. Preserve
the recorded proxies (sqrt(2)/2), seeds 211/212, material, bonds, stiffness,
body4/individual4/individual16/zero4/zero16 conditions and sampling at 0/1/10/100
(steric 0/10). Reused seeds are a paired diagnostic, not fresh confirmation.
Check all 96 ideal layouts and their 192 fronts with the new candidate and
placement checks. Record all contacts, positions, hull excess, pin residuals,
full initial/final states, RNG and failures; observer target IDs never enter
the mechanics. Original trajectories must replay the archived final states.

Viability: first run analytic overlap/separation, rotated and periodic witnesses,
one zero-kick boundary fixture, restart and observer neutrality unit checks.
Stop on nonfinite state or conservation failure; preserve any failed batch.
One simulation process, maximum four machine-wide. No long runs or rate sweep.

Primary gates, fixed now:

1. Every ideal contact passes the conservative search and unchanged geometry
   predicate; all exact front placements are admitted.
2. All analytic overlaps are rejected by vacancy and have <=1e-8 overlap after
   ten zero-kick steps; separated rectangle and square witnesses remain unchanged
   within 1e-8. Independent rotations/periodic cases are validation, not replicates.
3. All zero-kick and body-jostled prepared target contacts remain geometrically
   eligible at step 100, including square controls, with pin/target gaps <1e-7.
4. At individual16, all prepared targets are eligible at step 100 in both proxies;
   report individual4 separately. Failure limits promotion to deterministic
   geometry and requires identifying a distinct cause, not extra seeds/tuning.

Passing all gates earns a separately planned local first/second-contact
acquisition assay. It does not earn core promotion, physical growth, fragmentation,
renewal, scarce-material benefit or a population race. Report gates separately.
If the targeted correction fails, preserve it as diagnostic research and update
the next decision from the measured cause; do not add chemical states to rescue it.

## Validation and delivery

Independent interval/rectangle examples, containment, tangency, diagonal gaps,
mass-weighted movement, rotation and periodic translation tests. Exact restart
and observed/unobserved comparisons; fixed type/bond arrays and finite positions.
Validate provenance and complete case coverage, replay stored snapshots/final RNG,
reject altered metadata, input, geometry, state and gate summaries. Verify copied
solver portions mechanically; compare five unchanged default fingerprints.

Commands: node experiments/polygon_contact_test.js; node
experiments/polygon_contact.js experiments/scratch/PC_compare_20260927;
node experiments/polygon_contact_analysis_test.js
experiments/out/PC_compare_20260927.json.gz; node tools/fingerprint.js 1500.
Archive lossless raw JSON and summary with input/source hashes, exact commands,
CPU cost (excluding validation), parameters and no overwrites. Add RESULTS 68,
LEDGER/derived index and ROADMAP disposition; commit and push validated work.
