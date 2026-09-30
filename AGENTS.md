# Polygon Chemistry — working agreement

A world of conserved deformable polygons should produce heritable variation, selection,
and increasingly capable assemblies through simple local interactions. The goal is
**complexity emerging from simplicity**, ideally a machine of independent parts that
can reproduce. The Penroses' passive wooden replicators are the inspiration.
Plain JavaScript, no dependencies.

`CLAUDE.md` imports this file. The user's current request overrides it. Earlier versions,
including the verification-heavy workflow of 2026-09-26 to 09-29, are in `docs/archive/`
(`AGENTS-2026-09-30.md` is the last one). Historical "next" paragraphs are not assignments.

## Start here

1. This guide, then [ROADMAP.md](ROADMAP.md): the **innovation backlog**, the current direction.
2. [docs/INNOVATIONS.md](docs/INNOVATIONS.md): what has been built, with pictures and status.
3. [docs/COMPLEXITY_MAP.md](docs/COMPLEXITY_MAP.md): the design view (copied seed plus seeded
   structures, activation by attachment, custom parts) and [docs/IDEAS.md](docs/IDEAS.md).
4. The engine: `experiments/seeded_growth.js` (label-table growth rule, custom shapes,
   reversible programming), `experiments/seeded_worlds.js` (configurations and soups),
   `experiments/seeded_field.js` (shadowing damage field), `tools/snapshot.js` (pictures).
5. Older evidence (RESULTS/LEDGER) only when the idea you are about to build touches it.

## How we work: innovation first (user, 2026-09-30)

The user found too many tests on too little change. **Progress means new capabilities,
not certified thresholds.**

- **Each slice builds something genuinely new:** a block type, a rule, a port arrangement,
  a geometry, a combination of structures, an environment feature or a capability. A
  parameter variant, a rerun or a larger batch of an existing experiment is *not* a slice.
- **The loop:** idea → implement as a configuration or small subclass of the seeded
  engine → a sandbox demo (one or two small worlds, as short as shows the behavior) → look
  at pictures → fix the mechanics until it does something interesting → log it with a
  picture → next idea. Several ideas per session is the normal pace.
- **Batches are the exception.** Run multi-seed comparisons only when a capability already
  works in demos *and* a quantitative answer changes what gets built next: at most one batch
  per few innovations, about six worlds, one round. No confirmation rounds, no reruns to
  meet thresholds, no significance testing for steering. At most one retune per idea when a
  demo fails; then try a different idea or record it as "not yet" and move on.
- **Build on reasonable hypotheses.** Adopt sensible assumptions (walls and shields
  protect, supply limits copying, …) and stack the next capability on them. Honest
  recording still applies: say what happened, including failures, without overclaiming.
- **Combine and stack.** New capabilities should reuse and combine existing ones
  (chain + seeded parts + programming + field …). Complexity is expected from stacking
  simple mechanisms, so prefer ideas that add a new *kind* of part or interaction.
- **Speed matters.** Keep the default time step (dt 1) and body jostling for exploration.
  Optimize slow research code when it limits demos; byte-identical trajectories are not a
  goal (past results stay reproducible from their commits).

## Hard constraints (unchanged in spirit)

- **Locality.** A reaction reads its block's own type, state and bonds and the state exposed
  by bonded partner sides; it changes its own state or requests a change to an incident bond.
  No component traversal, sequence, length or age reader, global signal, organism counter
  or parent identity in reaction logic. Environment drives (fields, zones, supply) are
  allowed and labelled as such. Physics approximations may group bonded material for motion.
- **Relayed signals move one bond per derive pass** (previous-pass buffers).
- **Locality is necessary, not sufficient:** no hidden organism-level program. Describe
  each block's action without copy, genome or organism predicates.
- **Conserve blocks.** No creation, destruction or cloning during a run. Prepared founders
  are labelled starting conditions. Supply control happens through reversible
  *state* changes (programming, erasing), not new types; the user prefers state changes.
- **Block sides are not limited to four;** the four working ports are an implementation
  detail. **Custom parts:** a structure meant to have a length or form is one custom block,
  not a run of repeats (user, 2026-09-29).
- **Only polygon physics** (no lattice, no rigid engine). Mechanics and local logic matter
  more than numerical perfection; do not wait on physics rewrites.
- **Mechanical function and environment-generated pressures,** not a designed reward per
  function.
- **Keep the default core chemistry stable:** new mechanisms go into the seeded engine or
  subclasses, default off in core. At most four simulation processes on the machine.

## Recording (light)

- **Every innovation** gets an entry in `docs/INNOVATIONS.md`: date; what is new (rule,
  block, geometry); the command to reproduce the demo; picture path; status (works /
  partial / not yet); what it enables next. Keep it to a few lines.
- **Every innovation gets a picture in the chat** (`node tools/snapshot.js STATE OUT.png`),
  plus occasional progress images. Images say more than text.
- **Batches** (rare) get a short RESULTS section and a LEDGER row
  (`node tools/ledger_index.js`). A five-line plan written before the batch is enough;
  `experiments/PLAN_TEMPLATE.md` is optional. QA for batches: the first seed gets plain
  and restart checks (`experiments/screen_kit.js`); demos need only `check()` invariants.
- Update the ROADMAP backlog when ideas are done, reprioritized or added. Record user ideas
  in IDEAS or the backlog so they are not lost.
- Evidence language stays honest: "demo shows", "works in N worlds", "not yet". A claim of
  evolved complexity still needs an inherited function arising and spreading under fixed rules.

## Files and commands

- `src/sim.js`: core physics and rule table (stable default chemistry). `run.js`: CLI.
- Seeded engine: `experiments/seeded_growth.js`, `seeded_worlds.js`, `seeded_field.js`,
  `seeded_rays.js`, `half_cell_fast.js` (fast polygon runtime), `half_cell_soup.js`.
- `tools/snapshot.js`: render any saved state to PNG. `tools/fingerprint.js`: core hashes.
- `test.js`: core invariant suite. `experiments/README.md`: older assay families.

`_derive` exposes side states; `compat`/`_computeOpen` govern binding; `_transition` changes
one block; `_physics`, `_formBonds`, `_chemistry` run in that order. Observation helpers
(`componentOf`, `census`, `observe`) must never feed reactions.

## Workspace and delivery

- Read `git status` first; preserve user changes. Scratch runs in `experiments/scratch/`,
  keepers in `experiments/out/` (force-add; generic ignore rules match many data files).
- Container restarts happen: commit results early; long background waits need re-arming.
- Commit with descriptive messages; standing approval to push, merge into `main` and push
  `main`. `main` is the only long-lived branch.
- Short progress notes with pictures; report failures honestly; recommend the next idea.
  Continue authorized work without repeated confirmations; ask only for real user decisions.
