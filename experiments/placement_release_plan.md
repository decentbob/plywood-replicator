# Placement obstruction and release (prospective, 2026-09-26)

Section 54 found 43 slot-exclusion failures out of 47 admissible dockings at
site 2 in the selected seed-83/opposed20/undock-0.3 world. Identify the actual
excluding blocks and ask whether releasing either overlapping prefix helps.
This is a diagnostic of the selected world, not independent confirmation.

Replay exactly to step 15,000, retaining the full state including RNG. Observe
the two prefixes PAAAABB (anchor 87, site 3) and PAAAAB (anchor 107, site 4).
Fork four worlds through step 50,000: unchanged, release 87, release 107, release
both. A release fixture changes only the chosen block from DOCK to REPEL and
removes its F bond; it does not move, remove, duplicate, or change any type,
alter a lateral bond, introduce fuel, or alter subsequent ordinary chemistry.
This prepared initial-state intervention is not a proposed ID-aware reaction.
Do not add a kick or any other physical displacement. Use at most four workers.

Record every admissible docking placement at founder sites 2/3, including all
blocks failing the actual `_slotFree` threshold. Classify their identities as
founder, long prefix, short prefix, or other; counts may overlap and are repeated
attempts, not unique arrivals. Hook originals exactly once, with no RNG calls.
Keep successful placements as well as failures, and classify initial prefixes
by their physical members rather than their later sequence alone.

Primary outcome: new exact PAAAABBBBQ generation-1 offspring after the fork.
Secondary: extension/completion of each intact original prefix, complete material
inventories, docking and lateral events, partial released rows and their fates.
The stock birth logger can label forced partial release a birth; report those
separately and never count them as exact completion. Existing REPEL material
cannot redock without energy. Thus release can rescue the remaining material
without demonstrating reuse of the released part.

Require the unchanged fork to reproduce archived births, inventories and the
full uninstrumented restored final state. Also compare with an uninterrupted
50k run: restoration invalidates the bond cache, adding one `pinsVersion`
increment; every other saved field, including physical arrays and RNG, must
match. Retain both raw hashes and that explicit cache delta. Test observer
neutrality, intervention locality and conservation; independently reconstruct
lateral components from raw events and verify all 150 units. Keep hashes and
the original fork state. Fail rather than overwrite output files.

If release restores exact growth, the next candidate is a local reversible state
for a linked docking endpoint, with normal physical docking gates and retained
lateral structure. It needs a separate prepared assay and a new-seed screen;
successful selected release alone does not justify a population experiment.
If release does not help, distinguish continued exclusion from a lack of useful
contacts before adding chemistry. No universal-construction claim is warranted.
