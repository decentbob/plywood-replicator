# Shared-product recipient dependence

2026-09-26; ROADMAP P1. Seek a causal reproductive effect under existing chemistry,
not evolved novelty. Sections 36/42 give a viable uncapped shared-product world;
44/46 show why capped recipient share and occupancy are insufficient.

## Decision and contract

Return to section 36's PY setting: 40x40, A/B/C/D 150 each, product 1 300,
E 100, three BAAAAB and three BCDDCB founders. Reuse its mutation 0.002,
fraying 0.00003, unzip 1, lone docking loss 0.1 and bare linking 0.01.
No new states, types, reactions or core knobs. Inventory is 1,000 blocks.
The two sequence classes share B; shorter variants remain possible.

Four arms: production/binding both on (`on`), binding off (`noBind`),
production off (`noSource`), both off (`neither`). Disable mature binding
with pBindP=0. Disable production with existing transStart='P', with no P
in the fixed inventory. Keep translate/catalysis/bindAny true and code A1.
This retains material, catalytic linking restriction, and mature-product
binding compatibility on BACK. It changes TRN back exposure to BACK and
removes product construction contacts: a population-level production ablation,
not a pure per-recipient intervention. Do not use translate=false, which
also disables mature binding. All initial poses/bonds/states/RNG must match.

A block exposes its back from its own armed state, immutable type, own
lateral bonds and bonded neighbors' immutable types. Product F contacts K;
local lateral availability controls joining/release. A docked letter reads
the cat mark on its bonded partner F; cat reflects that block's incident
K partner PBIND state. This existing live derived read is not a new relay
or a proof of synchronous semantics. transStart uses trs0, one bond per
derive pass, and has no source in off arms. IDs, sequence classes and
member histories are observers only. No same-maker exclusion.

bodyJostle=true, iters=4, snapCorners=false, no new shape/force settings.
Keep all physics matched. This is a chemical dependency screen, not a
mechanical superiority claim; a promoted geometric effect would require
P0's individual-kick/solver test. Recharge and shaking drive the closed
material pool; turnover recycles existing blocks.

## Predeclared comparison

- Viability: independent seeds 101,102, on arm, 10k steps. Each must have
  at least one producer-parent birth and linked product material. Stop
  and record nonviability otherwise; do not tune rates to rescue it.
- Screen: seeds 103,104, four arms, 50k steps, sample every 100,
  report 10k windows; primary interval (10k,50k]. At most four workers
  total, and no concurrent simulation test queue. CPU budget 2,400 seconds
  for this screen; no long-run extension.
- Primary outcome: absolute births with a length>=2 parent snapshot lacking
  AA (recipient), versus each binding/production ablation, per world.
  AA defines producer *potential* in all arms; off arms produce nothing.
  Missing/one-unit parents remain unknown. Also report producer-parent
  births, exact reversed-parent copies, same-length errors, length errors,
  gen>=2 output, recipient mature occupancy (raw site counts), and complete
  inventory of free/attached/linked letter and product material.
- Promote to fresh confirmation only if both on worlds exceed both
  noBind and noSource by >=5 recipient-parent births, each retains >=5
  producer-parent births in (10k,50k], including >=1 gen>=2 such birth,
  and mature recipient occupancy is positive. Both-off diagnoses residual
  bare reproduction and the production-control interpretation.
- Two passing seeds are only a lead. If passed, the next experiment is
  four fresh seeds of this exact contrast before frequency competition.
  A failed screen parks this setting; compare P2/P4 rather than add states.
  No frequency or evolved-complexity claim in this assay.

## Evidence and reproducibility

Retain raw births, 100-step occupancy/inventory samples, birth member IDs
with sampled intact/active status at 5k age (late births censored), initial
physical hashes, final state, all parameters, source hashes, commands and
process CPU time. Parent snapshots and gen are stock bookkeeping, not an
exact pedigree or proof that each release is a full intended copy.
Detached release, exactness, sampled persistence and later reproduction
are distinct. No per-event significance tests; worlds are replicates.

Check observer neutrality including RNG, exact restart, absent-source
production suppression with mature binding still possible, material/bond
invariants and summary rejection of missing/duplicate/inconsistent runs.
Archive unique scratch prefixes in out, add RESULTS 61 / LEDGER row,
refresh ledger index, update ROADMAP, and commit validated work.
