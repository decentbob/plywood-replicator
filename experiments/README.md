# Experiment workspace

Start with [../AGENTS.md](../AGENTS.md), [../ROADMAP.md](../ROADMAP.md), then
[LEDGER.md](LEDGER.md). This file locates evidence; it does not rank research directions.
[RESULTS.md](RESULTS.md) is the full record. New work uses a short prospective
[plan](PLAN_TEMPLATE.md), with raw outcomes and negative controls retained.

## Find the right assay

| Results | Family / main entry points | Scope |
|---|---|---|
| 1–38 | `*.sh`, `run.js`, `peek.js`, `capped.js`, `motifs.js`, `proof_capped.js` | Historical copying/selection screens; consult engine dates before replay. |
| 32 | `rsearch.js`, `autocat.js`, `../src/rchem.js` | Random fixed tables; recurrence is not yet demonstrated heredity. |
| 39–43 | `stacks.js`, `races.js`, `permtest.js`, `pockets.js`, `keys.js`, `redqueen.js` | Shape, stacks, population races and ecology. |
| 44–46 | `product_exchange.js`, `product_latches.js`, `product_shapes.js`, `flexibility_summary.js` | Transport, activation and flexibility; experimental subclass options. |
| 47–49 | `mechanical_brace.js`, `geometric_bottleneck.js`, `complementary_fit.js`, `complementary_population.js` | Mechanical effects, actual fit and copying controls. |
| 50–51 | `curved_fuel.js`, `curved_collective.js`, `curved_fuel_reproduction.js`, `offspring_recovery.js`, `offspring_forks.js` | Fuel contacts, descendant rearming and conserved material. |
| 52–55 | `end_protection.js`, `end_protection_natural.js`, `patch_completion.js`, `anchor_access.js`, `assembly_front.js` | Protected intermediates and measured completion barriers. |
| 56–60 | `placement_release.js`, `local_redocking.js`, `local_redocking_screen.js`, `registration_fit.js`, `second_contact.js`, `contact_handoff.js` | Selected interventions versus autonomous reuse; stock births are insufficient. |
| 61–62 | `recipient_dependence.js`, `recipient_dependence_summary.js`, `recipient_confirmation_summary.js` | Shared-product ecology with independent production and binding ablations; fresh confirmation with a frozen decision protocol. |
| 63 | `resource_economy.js`, `resource_economy_derivation.md` | Offline fixed-table material and contact accounting, including fragment recycling; no simulator rule changes. |
| 64–65 | `random_heredity.js`, `random_heredity_summary.js`, `random_57.js`, `random_57_screen.js` | Exact side-labelled structures, conserved prepared/disrupted/plain baths, founder exclusion and bond-history replay; bounded random-table heredity screens. |
| 66 | `sequence_shape.js`, `sequence_shape_summary.js` | Equal-composition arrangements, actual shape, fuel controls, uninterrupted row identities and exact descendant renewal under existing turnover. |
| 67 | `resource_ports.js`, `resource_ports_summary.js` | Prepared polygon-port feasibility, centre/radius approximation failures, first-contact fixtures and exact physics replay. Raw JSON is losslessly gzipped; the analyzer reads `.json.gz`. |
| 68 | `polygon_contact.js`, `polygon_contact_physics.js`, `polygon_contact_summary.js` | Research-only convex-envelope correction with unchanged kick/pin/deformation code, paired archived fixtures and full replay. Geometry eligibility only; chemistry/bond formation deliberately disabled. |
| 69 | `port_acquisition.js`, `port_acquisition_summary.js` | Local complementary-face acquisition and uniform bond loss, unbound versus one-contact preparations, actual residual/persistence gate, negative solver-controlled screen. Uses a new subclass; historical physics-only class remains unchanged. |
| 70 | `handoff_closure.js`, `handoff_closure_summary.js` | Original section-56 obstruction forked into five unchanged section-60/control arms; actual support physics, intact reuse, persistent completion, full observer/restart replay. Negative benefit gate closes C1. |
| 71 | `short_variant_summary.js`, `portfolio_checkpoint.md` | Q0 comparison and offline census of all section-66 short births: ordered physical parent/fuel witnesses and two-link renewal. Retrospective candidates, not a new simulation or rescue of the eight-letter gate. Next plan: `short_variant_garden_plan.md`. |
| 72 | `short_variant_garden.js`, `short_variant_garden_summary.js`, `short_variant_garden_report.js` | Fresh equal-composition five-letter common environment, strict fueled lineage renewal and complete fuel-holder/bond tapes. One of two screen seeds passes; fixed benefit gate fails. External support is measured, partner-specific dependency remains open. |

Plans, `_summary.js`, `_test.js` and, where present, `_analysis_test.js` live beside the assay.
Read the plan and script's CLI rather than assuming identical options across runners.
Recent assays validate exact input/source hashes: moving files or changing even comments can
break historical validation. Keep runtime and assay source cleanup separate from documentation.

## Data is evidence, not clutter

- `scratch/`: unique run directories/stems, incomplete output and disposable diagnostics. Ignored
  by Git; inspect before removal. Never use it as the only copy of a reported result.
- `out/`: archived completed datasets, including raw JSON/JSONL needed to reconstruct claims,
  CSV summaries and manifests. At the 2026-09-26 audit all 775 existing files were tracked,
  including 48 JSON and 40 JSONL despite the generic `.gitignore` patterns.
- New raw files matching ignore patterns need explicit, exact-path `git add -f` when they are
  evidence required for reproduction; manifests are already exempted. Verify the staged paths.
  A data file being ignored is not permission to delete it. Do not broadly force-add scratch.
- Preserve failed/zero runs and censored observations. A summary without the raw input its
  validator expects is an incomplete archive. Record source revision/hash, full parameters,
  seed list, CPU time and commands. Do not silently recompute an old CSV under newer rules.
- `../dist/` is generated by `node build.js`. It is not the source of the viewer.

Useful read-only checks:

```sh
git status --short
git ls-files experiments/out
node experiments/contact_handoff_summary.js experiments/out/CH_selected.json
node test.js --list
```

The optional second output argument of some summary scripts **writes** a CSV. Omit it for
read-only validation. Research saved states may need an assay's subclass and extra mark buffers;
do not open SEEK/REQUEST/OFFER/LATCH worlds in the standard viewer.

## Platforms and compute

Use portable Node entry points on Windows. Historical `.sh` scripts and `tools/queue.sh` need
Bash/WSL and may contain older paths; inspect before running. `tools/screenshot.js` expects
Playwright and a Linux browser path, so it is not a portable default QA command.
At most four simulation workers in total, even across separate runners. Track task-owned PIDs.
Use CPU time for performance comparisons and report solver/jostling settings with every claim.
Directory rearrangement would require updating imports, source lists and data provenance;
this audit deliberately organizes navigation instead of breaking those references.
