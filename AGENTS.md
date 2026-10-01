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

## How we work: innovation first

- **Each slice builds something new**: a type kit, a rule, a machine, an environment feature. A parameter variant
  or a rerun is not a slice.
- **The loop:** idea → build it as types and structures (rules only when needed) → a demo world, as short as shows
  the behaviour → look at pictures → fix the mechanics → log it with a picture → next idea.
- **Batches are rare:** only when a capability works in demos and a number changes what gets built next; about six
  worlds, one round. One retune per idea when a demo fails; then try another idea or record "not yet".
- **Build mechanisms in isolation, then combine** (user, 2026-10-01). Stack new capabilities on existing ones.
- **Speed matters.** Keep demos small; optimise code when it limits demos.

## Hard constraints

- **Locality.** A rule reads its triangle's own type, state and bonds and the values bonded partners exposed in the
  previous pass; it changes its own state or one of its own bonds. Relayed signals move one bond per pass. No
  counters, traversals, global signals, organism or parent predicates. Environment drives (light zones, fields,
  supply) are allowed and labelled.
- **No hidden programs.** Behaviour comes from types (glues and marks) and their combination, not stored programs
  (user: "amino acids, not proteins"). Describe every triangle's action without copy, genome or organism words.
- **Conserve blocks.** No creation or destruction. Types change only by casting; states (charge, fill, door) change
  by rules. Prepared structures are labelled starting conditions.
- **One shape:** the unit triangle. Larger parts are built from triangles.
- **Polygon physics only.** Mechanics and local logic matter more than numerical perfection.

## Recording (light)

- Every capability gets an entry in docs/INNOVATIONS.md (date, what is new, evidence, picture, command, status,
  what it enables) and a picture in the chat (`render()` / `node tri/demos.js`).
- Update ROADMAP (module table, backlog) and docs/RULES.md when rules change. Record the user's ideas in IDEAS.
- Honest language: "demo shows", "works in N worlds", "not yet". Report failures plainly.

## Workspace and delivery

- Read `git status` first; preserve user changes. Run output goes to `runs/` (ignored); keep only chosen pictures in
  `docs/pictures/`.
- Run `node tri/test.js` before committing rule or physics changes.
- Commit often with descriptive messages; standing approval to push the working branch, merge into `main` and push
  `main`. At most four simulation processes at once. Container restarts happen: commit results early.
