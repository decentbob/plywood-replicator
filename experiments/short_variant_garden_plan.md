# Common-environment test of the observed five-letter variant

2026-09-27; next after Q0 / RESULTS 71. Prospective: no worlds in this plan
have been run. The archive census finds an ABABA/BABAB two-link fuel-supported
lineage in both opposed20 worlds (seeds 203/204), with 5/2 productive short
parents. This is a candidate selected from known outcomes. It does not reopen
section 66's failed eight-letter benefit comparison.

## Question and fixed comparison

Does the observed alternating five-letter organization improve fuel-supported
descendant renewal compared with an equal-composition rearrangement in a
common environment, and does any benefit depend on the opposed wedges?
Alternative: these rows renew because the mixed fragment community supplies
contacts; the inherited arrangement itself has no advantage. Section 50b's
cross-row fuel contacts and the square dimers in 71 make that a live alternative.

Use the section-66 base world (18×18, 60 A, 60 B, 40 U of size 1.2, no E,
compCopy/pocket, stiffness 0.5, pFray=0.00003, pUnzip=1, pSoft=0,
pUndock=0.1, pReloadU=0.002, bodyJostle=true, iters=4, snapCorners=false).
Four active prepared rows at x=9 and y=2.25,6.75,11.25,15.75, angle zero.
Test ABABA/BABAB versus AABAB/ABABB, alternating the two complementary
orientations at successive positions. Each preparation consumes exactly
10 A and 10 B from the same fixed pool. Spare letters remain in the bath;
no new material, fuel, helpers or state resets during a run. Cross both
preparations with square/opposed20 and pGrip=0.2/0; all fuel remains in off arms.
Supply active founders only to test descendant renewal, not autonomous startup.

Viability first: seeds 301/302, both preparations under opposed20/grip-on,
20k, four worlds. Each preparation must make at least one detached exact
founder child in at least one seed. Stop if either fails; no rate/seed rescue.
If viable, fresh seeds 303/304, all eight arms, fixed 100k (16 worlds).
Inspect 20k progress without changing the horizon; record zero worlds.
Matched seeds share bath generation and material but not later RNG events.

Primary per world: distinct nonfounder exact-family parents that fully rearm
through witnessed fuel events and produce a detached exact child while
uninterrupted. Require the same physical member mapping and ordered-event
checks as 71; do not substitute stock generation or repeated strings.
Also report all shorter/other offspring and their renewal, two-link chains,
born-by-50k outcomes, 5k censoring, surviving lineages and full material partitions.

The alternating arrangement earns a **screening lead** only if, in BOTH seeds:
its opposed20 primary is >=2, exceeds the rearranged primary by >=2, that
between-arrangement contrast exceeds the same square contrast, and its own
grip-on primary exceeds grip-off by >=2. A failure parks this candidate's
arrangement-benefit hypothesis without more seeds, states or a longer run.
The rearranged preparation winning is reported, not a post-hoc promotion.
These two worlds cannot establish selection or a general fitness advantage.

## Block contract and physical measurements

No new mutable states, marks, types, reactions or physical forces. Existing
block behavior reads its own state/incident bonds and partner-side exposure.
A fuel particle held on multiple sides exposes GIVE; one consuming letter
arms and the fuel is spent. Previous-pass FRAY propagates local end loss;
the audit's existing live-side caveats remain. No sequence, row, ancestry,
complete/rearmed predicate or fuel-holder classification enters reactions.
Fuel recharge and jostling are drive, not thermodynamic energy conservation.

Use a new observer module, leaving historical hashed sources byte-identical.
At every actual fuel consumption, record the particle and all its held
letter-side endpoints before unlinking; classify them offline as same intact
row, different tracked row or untracked material. The actor must match the
actual fuel-armed unit. Record fuel waits and actual adjacent face-normal
angles on intact rows, not only preferred rest slots. These observations
test the proposed contact explanation; uptake alone cannot pass the gate.
Track parent retirement on both endpoints of actual letter L/R edits, with
the section-66 regression for a fuel particle's L/R bond to a letter's K.

A passing body4 screen earns a separately frozen matched individual-kick /
solver check before any strong mechanical claim, then fresh-seed confirmation.
No generic physics rewrite, automatic solver setting or core promotion is earned.
Even a confirmed advantage over the rearrangement would not show that five
letters beat dimers: 71 supplies an explicit simpler renewing competitor.
A conserved-material dimer competition would be a separate gate before claiming
that additional organization repays its cost; differing founder numbers and
seeding geometry must be controlled there. No length/complexity claim now.

## Execution and validation

Next implementation: `short_variant_garden.js` with a separate summary/test.
Expected entry points (to be implemented before use):

```sh
node experiments/short_variant_garden.js --out experiments/scratch/SVG_viability_20260927 --seeds 301,302 --profiles opposed20 --grips 1 --steps 20000 --workers 4
node experiments/short_variant_garden.js --out experiments/scratch/SVG_screen_20260927 --seeds 303,304 --steps 100000 --workers 4
```

Before launch, check all machine simulation processes, freeze command/source/
plan hashes and full job matrix, and refuse existing output stems. At most
four simulation workers total, one queue. Cost estimate about section 66's
900 CPU seconds; cap at 1,800 CPU seconds for viability plus screen. Budget
exhaustion/invariant failure retains partial raw records and is inconclusive.
No prepared interventions after startup. Save ordered release/fuel/bond/row
events, initial/final states, restart checkpoints, samples and all errors.

Verify physical arrays/RNG against unobserved runs, checkpoint restart,
fuel endpoint accounting, uninterrupted identity, conservation, ordered
same-step events and source/parameter validation. Independently reconstruct
primary counts; corruption tests must reject missing fuel holders, recycled
IDs, incomplete arms and false exact lineage. Run relevant core fuel/fray/
complement/conservation checks and default fingerprints. Archive all outcomes,
including failed viability; update RESULTS/LEDGER/ROADMAP and commit. Do not
reinterpret a changed source or rejected observer as an independent sample.
