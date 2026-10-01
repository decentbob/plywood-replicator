# Typed-triangle world — working agreement

A world of conserved unit triangles whose sides carry glues should grow, by local rules, into replicators with
machines and a metabolism. **Goal (user): an organism that builds its offspring, feeds it until it can live on its
own, and splits it off** — complexity emerging from simplicity. Plain JavaScript, no dependencies.

`CLAUDE.md` imports this file. The user's current request overrides it. This repository contains only the
typed-triangle simulation; all earlier simulations (letter chemistry, half-cells, seeded engine) were removed on
2026-10-01 and remain in git history at commit `cac79c9` and before. Do not revive them.

## Start here

1. This file, then [docs/NEXT.md](docs/NEXT.md) (state and the next concrete tasks).
2. [ROADMAP.md](ROADMAP.md): the BIG goal, module table and backlog.
3. [docs/RULES.md](docs/RULES.md): every rule of the world. [docs/INNOVATIONS.md](docs/INNOVATIONS.md): what works,
   with pictures. [docs/IDEAS.md](docs/IDEAS.md): the user's ideas and design lessons.
4. Code: `tri/physics.js` (motion), `tri/sim.js` (chemistry), `tri/world.js` (worlds, census), `tri/structures.js`
   (designed machines and kits), `tri/render.js` (pictures), `tri/demos.js` (one demo per capability),
   `tri/test.js` (fast checks).

## How we work: a small core, built on in slices

- **The core stays small** (user, 2026-10-01). The core is the rule set in docs/RULES.md: side marks, signals,
  states, the binding, copying, casting and hinge rules, physics exceptions. Capabilities come from new combinations
  of it: structures, kits, glue assignments, machines, environments. New glue letters are labels, not rules, and are
  fine. A **core change** (new mark, signal, state, rule or rule branch, physics exception, or a default that changes
  behaviour everywhere) needs a very good reason and an entry under "Core changes" in docs/RULES.md written before
  any code: (1) the capability and why the goal needs it; (2) at least two designs with the existing core and why
  they fail; (3) the locality check: exactly what the triangle reads and from where; (4) which other structures can
  use it; (5) what it replaces or makes removable. Prefer generalizing or removing a rule over adding one. After a
  core change, the capability checks (`node tri/check.js`, once it exists) must still pass.
- **Slices.** Before any code, write under "Current slice" at the top of docs/NEXT.md: **goal** (one sentence: what
  will exist or be known, and how it moves the organism forward), **acceptance** (a command and the observable
  result, with a number, e.g. "3 of 4 worlds"), **stop boundary** (what is out of scope, and a budget of demo runs
  after which you hand off) and **approach** (designs considered, the one chosen and why). Work toward the acceptance
  only; record side paths in NEXT. End with acceptance met, or a verified milestone and the exact next step. A slice
  that turns out wrong ends with what was learned. A slice is a substantial step (typically a few hours), not one
  batch and a retune; split work longer than a session into milestones with their own acceptance.
- **Simplifying is progress** (user, 2026-10-01): removing or merging core rules while keeping the capabilities is
  worth as much as a new capability.
- **Theory counts** (user, 2026-10-01): when a demonstration would take unreasonable compute or needs a structure
  that does not exist yet, a careful design argument is a result (types laid out, each step justified by a named
  rule, timing and supply estimated, weakest assumption stated). Record it as "designed, not demonstrated", never as
  working.
- **What counts as a slice:** a new structure or machine from the existing core, making a capability reliable (3 of
  4 worlds or better), a capability check, a speed-up that limits iteration, an analysis or design argument that
  decides a question, a removal or merge of core rules, and (rarely) a gated core change. A parameter sweep without a question is not.
- **The loop:** idea → build it as types and structures with the existing core → a demo world, as short as shows the
  behaviour → look at pictures → fix the mechanics → log it with a picture → next idea.
- **Batches are rare:** only when a capability works in demos and a number changes what gets built next; about six
  worlds, one round. One retune per idea when a demo fails; then try another idea or record "not yet".
- **Build mechanisms in isolation, then combine** (user, 2026-10-01). Stack new capabilities on existing ones.
- **Speed matters.** Keep demos small; optimise code when it limits demos.

## Hard constraints

- **Locality, always.** A rule reads its triangle's own type, state and bonds and the values bonded partners exposed in the
  previous pass; it changes its own state or one of its own bonds. Relayed signals move one bond per pass. No
  counters, traversals, global signals, organism or parent predicates. Environment drives (light zones, fields,
  supply) are allowed and labelled.
  **Check every new rule against this before writing it** (user, 2026-10-01). A triangle does not know it is part of
  a larger structure except through its own bonds. Mistakes made and undone so far: (1) "separate structures do not
  close bonds" (it asked whether two triangles belong to the same body: a traversal); (2) "move the smaller of two
  bodies" when they bond (counted body sizes); (3) a docked triangle reading whether its partner's partners are fills
  (two bonds away). The local alternative is always one of: the triangle's own type/state/bonds, a value its direct
  partner exposes, or a signal relayed one bond per pass (busy, zip, lock, hear, open). Physics is the one exception
  and must be labelled as such in RULES: rigid motion of connected parts, a flap that is bonded back to its own base
  cannot turn, a triangle cannot bind into an occupied site.
- **No hidden programs.** Behaviour comes from types (glues and marks) and their combination, not stored programs
  (user: "amino acids, not proteins"). Describe every triangle's action without copy, genome or organism words.
- **Conserve blocks.** No creation or destruction. Types change only by casting; states (charge, fill, door) change
  by rules. Prepared structures are labelled starting conditions.
- **One shape:** the unit triangle. Larger parts are built from triangles.
- **Polygon physics only.** Mechanics and local logic matter more than numerical perfection. Physics: rigid parts,
  move-or-stop (no overlap, no squeezing); it may treat a connected structure as one body, chemistry may not.

## Recording (light)

- Every capability gets an entry in docs/INNOVATIONS.md (date, what is new, evidence, picture, command, status,
  what it enables) and a picture in the chat (`render()` / `node tri/demos.js`).
- Update ROADMAP (module table, backlog) and docs/RULES.md when rules change. Record the user's ideas in IDEAS.
- Honest language: "demo shows", "works in N worlds", "not yet". Report failures plainly.

## Workspace and delivery

- Read `git status` first; preserve user changes. Run output goes to `runs/` (ignored); keep only chosen pictures in
  `docs/pictures/`.
- Run `node tri/test.js` (and `node tri/check.js` once it exists) before committing rule or physics changes.
- Commit often with descriptive messages; standing approval to push the working branch, merge into `main` and push
  `main`. At most four simulation processes at once. Container restarts happen: commit results early.
- **Always ready for handoff** (user, 2026-10-01). After every checkpoint reached or any stoppage, leave the work so
  another agent can take over at once: results recorded (INNOVATIONS, ROADMAP, RULES, NEXT), docs/NEXT.md's handoff
  status current (what is being worked on, what was last tried and what it showed, the exact next step, commands),
  tests passing, everything committed and pushed (branch and `main`), no simulations left running unnoticed. Anything
  only in `runs/` (ignored) is lost on handoff: say in NEXT how to regenerate it.
