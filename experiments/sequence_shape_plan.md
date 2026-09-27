# Equal-composition shape and descendant renewal

2026-09-27; ROADMAP P3, geometric specificity. Seek reproductive closure and a
screening lead for inherited benefit, not novelty. Sections 50–51 establish fuel
capture and show that turnover can free some descendant reproduction while
eroding the eight-letter rows. Section 41 warns against interpreting small races.

## Fixed comparison

Compare AAAABBBB and ABABABAB in separate worlds, each with 60 A, 60 B and 40 U,
18×18, four prepared eight-unit rows at the section-50 positions. Start founders
**active**, explicitly supplying the first cycle to isolate offspring renewal.
This differs from section 50's inactive startup and section 51's late turnover
intervention. Turnover is on from time zero: pFray=0.00003, pUnzip=1. Keep
compCopy, pocket, sizeU=1.2, pReloadU=0.002, pUndock=0.1, pSoft=0, stiffness
0.5, and the ordinary energy gate. No new simulator rule or state.

Full factorial: sequence × square/opposed20 (-20/+20 degrees) × pGrip 0.2/0.
All fuel remains in grip-disabled controls. Same-seed arms match bath generation
and material; conditional RNG and distinct seed arrangements diverge thereafter.
Body jostling, 4 solver passes, no snapCorners. Read actual face-normal angles
on intact rows every 100 steps, not selected rest-slot indices.

Viability: seeds 201,202, opposed20/grip-on, both sequences, 20k steps. Proceed
only if each sequence produces at least one detached exact founder child in
at least one world. This is an initial copying gate, not evidence of renewal.
If it fails, stop this preparation without tuning or adding helpers.

If viable, screen fresh seeds 203,204 for 100k (16 worlds); inspect 20k progress.
Primary: number of distinct exact, fully rearmed offspring that produce a
detached exact child before losing their original lateral organization. Require
uninterrupted parent identity and per-unit release provenance; raw stock gen
and parent strings alone are insufficient. Track all releases, errors/length
changes, full activation, survival, exact lineage depth and unfinished material.

A sequence earns a lead only if in BOTH screen seeds its opposed20/grip-on
primary count is >=2 and exceeds the other sequence by >=2; its within-seed
sequence contrast must exceed the square/grip-on contrast in the same direction,
and its own grip-disabled count by >=2. If neither sequence closes a second
exact cycle, park this preparation; other failed contrasts also earn no tuning.
No significance claim from two worlds. A passing screen earns a separately
predeclared solver/individual-kick comparison and fresh confirmation, not promotion.

## Contract and measurements

Unchanged chemistry reads own bonds/state and exposed bonded-side states: fuel
with multiple held contacts exposes GIVE; an inactive letter on GIVE arms; end
fraying and previous-pass FRAY exposure release lateral bonds. Existing live-side
derivation caveats in RESEARCH_AUDIT still apply. No observer row IDs, sequences,
ancestry, completion predicates or shape summaries enter physics or reactions.
Fuel recharge is external drive; particle counts/types are conserved.

An observer retires a row at its first fray or lateral bond edit; recycled IDs
cannot revive it. Per-letter release records capture the then-intact parent row.
Rows must be fully face-detached at recorded birth to count as useful output.
Full activation may precede whole-row release, and is checked on registration.
Later children require exact reversed-complement member mapping to an intact
parent, with disjoint child/parent material. Primary counts only exact founder
lineages, with full activation by the child's birth. Late rows are censored at
100k; also report the born-by-50k cohort and 5k uninterrupted survival.

Snapshots partition all 120 letters into intact founders, intact logged offspring,
free monomers, docked singles, other linked rows (unfinished/released), and other.
Measure actual bend, fuel use and unfinished inventory as diagnostics only.
Save initial/final state hashes, final states, all row lifetimes and observation
events, parameters, source hashes, exact commands and CPU cost. Tests must verify
observer neutrality, restart, conserved inventory, parent mapping and recycled-ID
rejection, plus analyzer rejection of missing/corrupt records.

At most four simulation workers total. Existing node service processes were idle
across two CPU snapshots before work; no other simulation queue was observed.
Unique scratch stems SS_viability_20260927 and SS_screen_20260927; archive complete
batches in out, update RESULTS/LEDGER/ROADMAP and commit validated evidence.
