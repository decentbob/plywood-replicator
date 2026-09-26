# Polygon Chemistry — working agreement

A world of conserved deformable polygons should produce heritable variation, selection,
and increasingly capable assemblies through simple local interactions. The goal is
**complexity emerging from simplicity**, ideally a machine of independent parts that
can reproduce. More mechanisms in the simulator are not progress by themselves.
The Penroses' passive wooden replicators are the inspiration. Plain JavaScript, no dependencies.

## Start here

1. Read this guide and [ROADMAP.md](ROADMAP.md): the single current priority queue and gates.
2. Read [experiments/LEDGER.md](experiments/LEDGER.md): regularities, viability, relevant rows.
3. Read [README.md](README.md) for implemented rules, then the relevant RESULTS sections and assay plan.
4. Read [docs/RESEARCH_AUDIT.md](docs/RESEARCH_AUDIT.md) before claiming strict locality or complexity.
   Use DESIGN section 2 for commitments and section 14 for decisions; use LITERATURE for sources.

The user's current request overrides this guide. This guide states constraints; ROADMAP orders
work; LEDGER/RESULTS record evidence; DESIGN and old plans preserve reasoning. Historical
“next” paragraphs are not current assignments. The previous 698-line guide, including all
handoffs, is preserved in [the archive](docs/archive/AGENTS-2026-09-26.md).
`CLAUDE.md` imports this file. Update the current queue rather than appending another handoff here.

## Hard constraints and preferences

- **Locality comes first.** A reaction reads its block's own type/state/bonds and the derived
  state exposed by its bonded partner side. It changes its own state or requests a change to
  an incident bond. No component traversal, sequence/length/completion/age reader, global
  signal, organism counter, parent identity, or correct-position memory in dynamics.
  Pair contact/geometry checks are physics; they must not become whole-assembly operations.
- **Signals move one bond per derive pass.** Relayed marks use previous-pass buffers
  (`ss0`, `tip0`, `prf0`, `trs0`, or the assay's explicit equivalent). A simulation step has
  several derive passes: do not claim one bond per step. Test propagation and withdrawal.
- **Locality is necessary, not sufficient.** A distributed program that coordinates a
  predetermined whole-copy operation can still violate intent. Describe each block's action
  without copy, strand, genome or organism predicates. Comments and legacy names may use those
  words; renaming variables does not establish compliance. Prefer fewer states and broad reuse.
- **Conserve blocks.** No creation, destruction, cloning, insertion or duplication operation
  during a run. Variation must arise through physical assembly, binding errors and bond changes.
  Prepared seeds, transplants and selected interventions are experiments, explicitly labelled;
  they are not autonomous replication. Keep material counts and types fixed in comparisons.
- **Prefer state changes to type changes.** Any block type is allowed if its behavior meets
  these constraints. The user disliked precursor-to-new-type conversion.
- **Prefer mechanical function and internally generated selection pressures.** Environment
  scarcity/density and deliberate environmental controls are allowed, but adding a rewarded
  motif for each desired function is evidence about designed pressures, not open-ended invention.
- **Keep the core simple.** Research mechanisms begin in isolated assays/subclasses. New core
  mechanisms need evidence, default off, and unchanged default fingerprints. Remove or park
  mechanisms that add nothing; preserve their evidence and reproducibility before code removal.
  Keep few viewer presets. Biology and theory suggest hypotheses, not implementation requirements.
- **Only polygon physics.** No lattice replacement or resurrection of the removed rigid engine.
  Existing `bodyJostle=true` aggregates whole bonded bodies: DESIGN 14 records this speed
  relaxation, but it does not satisfy the stricter per-block physics commitment. Do not conceal
  that conflict or silently change historical defaults. ROADMAP P0 defines the local-path audit.
  Direct neighbor-type reads and optional physics exceptions are also catalogued in the audit.
- **Preserve the user's research style.** Try varied ideas in small worlds; scale promising
  leads. Screen ordinary population questions in 50k–150k steps, with an early viability look;
  prepared mechanical tests may be much shorter. Two seeds are a lead, not confirmation.
  Use fresh seeds for confirmation and long runs only for an earned lead or a specified rare event.

## Before and after an experiment

Use [experiments/PLAN_TEMPLATE.md](experiments/PLAN_TEMPLATE.md), keeping the plan proportional.

1. State the question, its ROADMAP item, the existing evidence, and the result that would change
   the next decision. Explain how this could lead to inherited function rather than just more births.
2. Write the block-level read/write contract and the physics assumptions. Record new states,
   side marks, rule cases and knobs; justify each. Never put an observer's IDs or classifications
   into reactions. No same-maker exclusion or whole-key matching helper.
3. Fix controls, primary outcome, run horizon, seeds and stop/promotion criteria before outcomes.
   Include the same physics in controls; test actual shape, not only `_restSlot`. A prepared
   rescue needs autonomous acquisition; a new mechanism must beat doing nothing/waiting where relevant.
4. Confirm viability before a batch. At most **four simulation processes/workers in total** on
   the machine, including multiple queues. This is a compute limit, not an instruction to spawn agents.
   Use CPU time for cost, not shared-machine wall time. Check progress without interrupting useful runs.
5. Record failed/zero runs, censoring, raw counts, parameters, seeds, source/input hashes and exact commands.
   Repeated contacts in one world are not independent samples. Same-seed branching matches initial
   conditions; conditional RNG consumption can diverge. Do not claim later event-by-event matching.
6. Measure physical output and descendants. Stock births can count temporary release in research states.
   Distinguish detached, complete, active, reproducing and persistent. Record material sequestration and
   mutation/error classes; do not optimize perfect copying at the expense of all heritable variation.
7. Run relevant invariants and analysis validation. Observer instrumentation must preserve physical
   arrays and RNG; research states must restart with their own subclass and side-mark buffers.
8. Add a RESULTS section (script/command, table, what it says, what it does not) and LEDGER row;
   run `node tools/ledger_index.js` when the ledger table changes. Revise a regularity if contradicted.
   Update ROADMAP status and the next discriminating test. After a failed confirmation, park the
   hypothesis unless new evidence identifies a different cause. Do not add states to prolong a dead end.

A claim of evolved complexity requires a new inherited organization/function arising under fixed
rules, a causal reproductive benefit, and persistence through descendant turnover. Report length,
diversity, designed gene counts and ecological dependencies separately. No finite run proves unbounded
complexity; see the audit's evidence ladder. Every few completed assays, reassess the branch against
alternatives instead of following its latest “next” indefinitely.

## Files and commands

- `src/sim.js`: physics, rule table, save/restore and observation. `src/rchem.js`: alternative fixed
  random tables; searching tables is research by us, not evolution within a world.
- `index.html`: viewer; `build.js`: generated single-file `dist/` build. `run.js`: CLI, CSV,
  births JSONL, `--save`, `--load`, `--change`; per-type knobs accepted.
- `experiments/README.md`: assay families, artifact handling and platform guidance.
- `test.js`: invariant suite (39 at this audit); `--list`, `--match=REGEX` select checks.
- `tools/fingerprint.js`: five trajectory hashes; `tools/ledger_index.js`: derived knob index.
- Analysis helpers: `peek.js` for running birth logs, `stacks.js` for saved standing populations,
  `races.js`/`permtest.js` for replicate races. Assays generally have `_summary.js` and `_test.js`.

```sh
node test.js --list
node tools/fingerprint.js 1500
node run.js --help
node experiments/contact_handoff_summary.js experiments/out/CH_selected.json
node build.js
```

`_derive` exposes side states; `compat`/`_computeOpen` govern binding; `_transition` changes
one block. `_physics`, `_formBonds`, `_chemistry` run in that order. `componentOf`, `strandOf`,
`chainOf`, `cycleOf`, `enclosedBy`, `stats` and birth classification are observation only;
review other graph traversals too (the body-jostling exception does not call `componentOf`).
See the audit before assuming all existing helpers satisfy this contract.

For a promoted core rule: knob/default, unique side-state values, derive/compat/open/transition
as needed, meaningful invariant, event counter/readout if useful, viewer knob/legend/ZERO default,
README rule table and DESIGN decision. Compare five before/after 1500-step fingerprints.
Do not edit a hashed source merely to tidy comments: historical analyzers may require its bytes.

## Workspace and delivery

- Read `git status` first; preserve user changes. Avoid broad file moves: assay source hashes and
  hard-coded paths are part of provenance. Never delete raw data because `.gitignore` matches it.
- Use `experiments/scratch/` for runs in progress, unique output stems, no overwrites. Archive a
  completed batch in `experiments/out/` with its raw evidence and manifests. Many JSON/JSONL files
  there are already tracked despite generic ignore patterns. Verify with `git ls-files`.
- Windows: prefer portable Node runners; `.sh` tools require Bash/WSL. Stop only known task PIDs;
  never use a kill pattern matching the shell itself. Do not start a second queue assuming it has
  an independent four-worker allowance. See experiments/README for older platform-specific tools.
- Commit finished, validated work with descriptive messages. `main` is the only long-lived branch.
  Standing user approval permits pushing session work, merging it into `main`, pushing `main`, and
  deleting merged session branches once relevant checks pass and default fingerprints are unchanged.
- Give short progress notes, report negatives honestly, and recommend the next direction. Continue
  authorized work without repeated confirmations. Ask only when a real user decision is needed.
  Record skipped checks accurately; documentation-only work does not require the ten-minute physics suite.
