# Intent and evidence audit — 2026-09-26

The project has convincing examples of template copying, physical variation and selection
under designed local chemistry. It has not demonstrated sustained evolution of increasingly
capable machines. The best next investment is to make that distinction enforceable in the
workflow, distinguish local reaction logic from numerical motion approximations, and pursue mechanisms that could make
new organization useful without adding a new reward for each function.

This is a static audit of commit `144ccd0`, not a new simulation experiment or a proof that
every execution path is local. Reviewed: the core dynamics and random-chemistry implementation,
the SEEK and handoff mechanisms, experiment ledger, design decisions, literature notes and
selected result sections (especially 32–60). The section-60 raw-data summary was rerun successfully.
The ranked decisions are in [ROADMAP](../ROADMAP.md); this report explains them.

**Subsequent user clarification (2026-09-26):** mechanics and strictly local rules matter more
than strict locality of the numerical physics. The user accepted keeping body jostling for
exploration, checking promising mechanical effects with individual kicks and adequate solver
resolution, and reworking physics only if a relevant discrepancy warrants it. This supersedes
the audit's original recommendation to make a local-physics project the first research task.
The implementation findings remain; aggregate motion is an accepted approximation, not a
reaction-locality violation or established equivalence to individual-block motion.

## What “following intent” must mean

Three tests are independent:

1. **Permitted dynamics:** fixed, simple rules; conserved blocks; block-local chemistry and
   contact-driven mechanics with documented numerical approximations; no organism-level
   controller hidden in a helper or relay.
2. **Autonomous operation:** the required parts encounter, assemble, operate and become available
   again under those rules. A selected bond placement only establishes physical possibility.
3. **Evolutionary consequence:** physical variation produces inherited differences in useful
   function; those differences affect reproduction and persist through replacement of material.

A system can pass the first test and fail the other two. A hand-built local state machine is
not automatically an evolved machine. Conversely, failure to copy a prescribed sequence exactly
need not mean evolution failed: classify fidelity loss separately from viable novel descendants.

## Implementation findings

References below name functions and baseline line numbers; use function names after code changes.

| Finding | Evidence at `144ccd0` | Interpretation and required disposition |
|---|---|---|
| Whole-body jostling is enabled by default | `src/sim.js:243`, `_jostleBodies` at 1371, `_physics` at 1430: traverse all bonded blocks, compute center/inertia/size-dependent motion, move all members together | A clear relaxation of DESIGN 2's per-block physics commitment. DESIGN 14's 2026-09-25 speed entry explicitly acknowledges it; it is not an undisclosed discovery or an organism-level reaction. The subsequent user clarification accepts this motion approximation. Preserve the baseline and check mechanical sensitivity when relevant; do not describe it as strictly per-block motion or as proven equivalent to individual kicks. |
| The exposed-side contract is incompletely represented | `_derive` at 850–947 reads bonded neighbors' types for hub exclusion, motifs and translation; `_transition` reads partner type for proofreading/resistance | Bounded neighboring information, not a whole-strand lookup. The code describes type as color, but `ss` alone does not carry it. Specify a typed side interface or publish an explicit immutable label; do not call this a proof of nonlocal computation, or silently generalize access to private partner data. |
| Some derived reads are live | `_derive` reads current `ss` for fuel WANT/GIVE, catalyst PBIND, and partner-face context; `stk` is also live | Dedicated relay channels use previous-pass buffers correctly, but this is not a blanket synchronous-side guarantee. Trace dependency chains and permute derive order with fixed bonds/states/RNG before claiming one-hop semantics for all channels. The audit did not demonstrate an actual multi-hop leak in these paths. |
| Optional physics/environment exceptions exist | `_stick` at 1336 attracts unbonded nearby G/letter pairs; `_cornerGroups` at 574 plus `snapCorners` at 1568 averages transitively pinned corners; `step` at 1328 computes global `_hot`; radiation uses position with `radBand` | Separate short-range physical forces, a shared-junction numerical constraint, and imposed environmental schedules from chemical messages. These are not all equivalent to a global organism controller. They nevertheless need explicit scope labels, and cannot be cited as a strict bonded-side-only world. `snapCorners` groups are common corner constraints, not necessarily whole bodies. |
| Existing observation boundary is mostly clear in reviewed paths | `_logBirths`, `_logRows`, `stats`, lineage/member reconstruction; no reviewed reaction uses their component/sequence classifications | Good separation. Birth bookkeeping writes `fresh`, `parentOf`, `gen`, etc.; those are observation metadata, not proof of physical copying. Keep observer-neutrality comparisons of physical arrays and RNG. A grep for `componentOf` alone would miss `_jostleBodies`. |
| Conservation is structurally supported | `_init` allocates fixed block arrays; reviewed ordinary steps change states, bonds and coordinates, not block count/type | No mid-run block-creation primitive found in reviewed dynamics. Seeding/transplant helpers impose initial conditions from existing material and must stay outside autonomous rules. Charged energy is not thermodynamically conserved: recharge/jostling drive the system, and `feed` arms neighbors without spending a particle each time. “Conserved energy” should mean conserved particle inventory only. |
| Latest research rules are narrowly local | `local_redocking.js`, `contact_handoff.js:HandoffSim`: own bonds/state, partner marks, own face release; `hm0` snapshots the signal | No selected member ID, site index or completion reader in the reviewed handoff reaction. States SEEK/REQUEST/OFFER/LATCH are an engineering cost, not evidence that complexity evolved. Keep research-only status; observation chooses fixtures and evaluates results. |
| Random chemistry has a cleaner state interface, but limited evidence | `src/rchem.js:_chemistry` stages next states from bonded-side colors; `assemblies` is an observer; `rsearch.js` ranks repeated hashes | Rules are fixed per world and local at the reaction level; inherited base physics includes body jostling. Three-round graph hashes and repeated shapes are screening heuristics, not exact identity, genealogy or heredity. `autocat.js` is a first probe, not a sufficient evolutionary assay. |

**Disposition:** do not rewrite the engine as part of this meta task. No runtime source, numerical
default, assay implementation or archived data was changed. P0 now calls for focused interface
review and mechanical sensitivity checks alongside research, not a compulsory physics rewrite.
Existing findings remain evidence under their recorded assumptions; this audit does not invalidate
them wholesale. Any future semantic change needs its own controls and baseline.

The side-interface cleanup must not become a pretext for adding dozens of states. If a typed side
label merely makes an existing immutable color explicit, seek trajectory-equivalent refactoring.
Changing live reads to delayed reads is a semantic change; isolate it and remeasure affected claims.

## Which findings advance the goal?

| Evidence | What is established | What it does not establish | Priority implication |
|---|---|---|---|
| Copying, mutation, selection, environmental adaptation (1–19) | Local assembly can transmit variable sequences and select physical/chemical traits | An unrestricted source of new functions | Keep as controls and baseline capabilities. |
| Caps, feed/shield, proofreading (33, 38) | Designed functions can be selected; motifs can arise physically, including shield in the dense old-engine runs | Evolution inventing new rule functions, or a current-engine reproduction of every old result | Calibrations, not an endless list of newly rewarded genes. |
| Products/catalysts and parasites (34, 36, 42–46) | Real coupled chemistry, exploitation and spatial effects; some strong reproductive consequences | A demonstrated continuing arms race, or a durable recipient benefit from flexibility | Highest empirical foothold for ecological feedback; first verify actual recipient dependence. |
| Stacks (40) | A second physical copying mode, growth and separation | A reason for longer inherited information: hoarding and shortening persist | Revisit only with a different resource-use mechanism, not because “two modes” sounds promising. |
| Shape (39, 41, 47–51) | Physical fitting, fuel contacts, complementary curved copying; some solver-sensitive effects | A robust inherited shape advantage in reproduction; a self-renewing mechanical machine | Pursue an actual reproductive bottleneck; uptake or straightening alone is insufficient. |
| Completion/reuse investigations (52–60) | Excellent causal diagnostics; productive mergers, release rescue, intact reuse, autonomous handoff in a selected square fixture | General fidelity improvement, fitness advantage or evolution of the mechanism | Valuable operation library; the chain of repairs must not automatically stay top priority. |
| Random tables (32) | Recurrent structures and a copying positive control | Heredity of any unengineered candidate | A small discrimination assay has higher value than continuing a broad recurrence search. |

The strongest procedural work is recent: matched physics, negative controls, fresh-seed failures
retained, raw event reconstruction, conserved material, restart and observer tests. Keep it.
The drift in direction is more subtle: each failed fixture leads to another bespoke mechanism,
while the eventual payoff to inherited function recedes. Predeclared stop gates and periodic
comparison with unrelated directions address this without forbidding exploratory engineering.

## A practical evidence ladder

Use these labels in future reports; do not collapse them to “works.” LEDGER verdicts still describe
the question actually tested, not a global grade of the project.

| Level | Minimum evidence |
|---|---|
| Physical effect | A causal, measured change in geometry/contact/reaction with matched controls. |
| Autonomous operation | Useful acquisition, action and release without chosen IDs, pose edits or observer triggers. |
| Reproductive closure | New assemblies themselves repeat the relevant operation and reproduce from conserved material; no replenished prepared helpers. Record unfinished and dead descendants. |
| Heritable benefit | Offspring retain the organization/function; matched ablation or competition separates benefit from material amount, seed composition and kinetics. |
| Evolved novelty | A previously absent useful organization arises through the world's own variation under unchanged rules and is transmitted. A newly enabled motif rule is not novelty at this level. |
| Cumulative complexity | Additional causal capabilities/dependencies accumulate and persist over multiple descendant turnovers, across fresh runs, while the rule inventory stays fixed. |

Observe both individual and ecological organization. Record reproductive lineages, dependency edges
validated by interaction ablations, persistence through material replacement, and new causal functions.
Length, compressibility, diversity and birth rate are supporting diagnostics; none alone measures
functional complexity. Compare ancestry and physics controls, not just “times random chance.”

This ladder is a project-specific operational proposal. It borrows the distinction between novelty,
complexity and ecological potential from the [MODES paper](https://doi.org/10.1162/artl_a_00280)
(abstract checked; full text was not available through the publisher here). It is not an
implementation or validation of MODES. Taylor's [innovation framework](https://arxiv.org/abs/1806.01883)
distinguishes exploration within a behavioral space from expansion of what can be done; the useful
lesson here is to look for new uses of physical interactions, not only new strings.

## Instruction and workspace cleanup

- Replaced the 698-line accumulating worker guide with a compact working agreement; preserved the
  original verbatim in `docs/archive/AGENTS-2026-09-26.md`. The archive is context, not live instructions.
- Established ROADMAP as the one priority queue. DESIGN 15, the literature shortlist and historical
  handoffs are idea/history records. LEDGER open gaps now link to the queue rather than resurrecting
  disproven next steps (for example a third designed function after proofreading, or product
  flexibility after its failed confirmation).
- Added an experiment plan template with intent, locality, closure, matched controls and stop gates.
  Added an experiment/artifact map; preserved filenames so imports and source hashes still work.
- At audit start the worktree was clean. All 775 existing `experiments/out` files were tracked:
  675 CSV, 48 JSON, 40 JSONL, 12 TXT. Generic ignore rules do not make these disposable. No data
  deletion or source-tree reshuffle was warranted. Scratch contained only an empty
  `AA_recheck` directory, removed after checking it had no contents.
- Corrected navigation and qualified current-status claims. Historical measurements and plans retain
  their original wording with dated scope notices. Kept source files byte-identical because recent
  validation checks their hashes, even where header comments are outdated.

Known historical suggestions that are **not authorization**: a product that cannot bind its maker
(requires ancestry unless a truly contact-local mechanism is supplied); a whole-key match predicate;
an oligomer positioned or copied as one object; a special link probability conditional on belonging
to different templates; global population feedback; programmed multi-step division or stall recovery.
The literal predicate, not its biological name, determines whether it is allowed.

## Verification and limits

Five 1500-step baseline fingerprints at `144ccd0`:

```text
5c253d7fa214c392471bae65568f820b 4 14 0
8e80e217d000688eb8065de496959c3b 0 35 4
278d722779abd3df1e303486807d1771 4 20 0
6132d3da44507cd1c1a66bdc6340e93c 6 54 7
9be3460a1135ad1cd19f53bf29222318 2 53 0
```

All five fingerprints were rerun after the edits and match exactly. Section-60 raw-data
validation passed; the suite lists 39 checks. Local document links, preserved archive content,
unchanged runtime/assay/data files and whitespace were checked. The full invariant suite was
not rerun for documentation-only changes. This audit does not remeasure old-engine experiments, prove
absence of all observation leaks, or certify a fully local physics configuration. The accepted
policy is targeted validation under P0, not a prerequisite physics migration. Literature-derived
hypotheses are identified separately from project results.
