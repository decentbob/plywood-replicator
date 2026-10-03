# Typed-triangle world — working agreement

A world of conserved unit triangles whose sides carry glues should grow, by local rules, into replicators with
machines and a metabolism. **Goal (user): an organism that builds its offspring, feeds it until it can live on its
own, and splits it off** — complexity emerging from a small set of simple rules. Plain JavaScript, no dependencies.

`CLAUDE.md` imports this file; the user's current request overrides it. Earlier simulations (letter chemistry,
half-cells, seeded engine) were removed on 2026-10-01 and stay in git history at `cac79c9` and before; do not revive
them.

## Start here

[docs/NEXT.md](docs/NEXT.md) (state, current slice, next steps), then as needed: [ROADMAP.md](ROADMAP.md) (goal,
module table, backlog), [docs/RULES.md](docs/RULES.md) (every rule), [docs/INNOVATIONS.md](docs/INNOVATIONS.md) (what
works, with pictures), [docs/IDEAS.md](docs/IDEAS.md) (the user's ideas and design lessons). Code in `tri/`: physics,
sim (chemistry), world, structures (kits), demos (one per capability), render, test (fast checks), check
(one PASS/FAIL line per working capability).

## Principles (user)

- **Locality, always.** A rule reads only its triangle's own type, state and bonds, the values its bonded partners
  exposed in the previous pass, and signals relayed one bond per pass; it changes its own state or one of its own
  bonds. No counters, traversals, global signals, body sizes, organism or parent predicates. Check every rule
  against this before writing it: "same structure", "the smaller body" and "my partner's partner" were each written
  once and had to be undone. Physics is the one labelled exception (rigid motion of connected parts, no overlap);
  environment drives (light, supply) are allowed and labelled.
- **The core stays small.** The core is the rule set in docs/RULES.md (marks, signals, states, rules, physics
  exceptions). Capabilities come from new combinations of it; new glue letters are labels and fine. Change the core
  only for a very good reason, and make the case first under "Core changes" in RULES.md: why the existing core
  cannot do it, exactly what the rule reads, what it replaces. Prefer generalizing or removing a rule over adding one.
- **Simplifying is progress.** A smaller core with the same capabilities is worth as much as a new capability.
- **No hidden programs** ("amino acids, not proteins"): behaviour comes from types and their combination. Describe
  every triangle's action without copy, genome or organism words.
- **Conserve blocks; one shape.** Nothing is created or destroyed; types change only by casting. Larger parts are
  built from unit triangles. Prepared structures are labelled starting conditions.
- **Theory counts.** When a demonstration would take unreasonable compute or needs structures that do not exist yet,
  a careful design argument is a result. Record it as "designed, not demonstrated", never as working.

## How work happens

- **In slices:** a substantial step (typically a few hours) with a clear goal, a check that shows it is done (for a
  capability: works in at least 3 of 4 worlds) and a sense of where to stop, written at the top of docs/NEXT.md
  before starting. A slice can build something new, make something reliable or faster, simplify the core, or settle
  a question by analysis. One that turns out wrong ends with what was learned.
- **Build mechanisms in isolation, then combine them.** Keep demos as short as shows the behaviour, look at the
  pictures, fix the mechanics. Large batches only when a number changes what gets built next. Speed matters:
  optimise code when it limits iteration.
- **Honest records:** a new capability gets an INNOVATIONS entry (what, evidence, picture, command, status) and a
  check in `tri/check.js`; ROADMAP and RULES follow changes; the user's ideas go to IDEAS. Say "works in N of M
  worlds", "not yet", and report failures plainly.

## Delivery

- Read `git status` first and preserve the user's changes. Run output goes to `runs/` (ignored); keep chosen
  pictures in `docs/pictures/`.
- **Keep the user in the loop with pictures (user, 2026-10-02).** Now and then, not often, send the user a picture
  in the chat (the session's file-send tool) of what is being worked on, or when something interesting happens (a
  new capability working, a surprising failure), with a one-line caption. This applies to unattended runs too.
- `node tri/test.js` before committing; `node tri/check.js` before merging any rule, physics or shared-structure
  change. At most four simulation processes at once.
- Standing approval to commit, push and merge into `main`, preferably through a pull request (GitHub then deletes
  the branch).
- **Always ready for handoff:** at every checkpoint, results recorded, docs/NEXT.md current (what is in progress,
  what was last tried and what it showed, the exact next step, how to regenerate anything only in `runs/`), tests
  passing, everything pushed, no simulation left running unnoticed.
