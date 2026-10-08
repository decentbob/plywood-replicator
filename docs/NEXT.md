# Next instance: start here

State on 2026-10-08 (after autorun run 20261008-1222, cleanup). Read AGENTS.md first (rules of work), then this file.
History: docs/INNOVATIONS.md (newest first), RULES (Core changes), ROADMAP backlog A (the pair's done priorities 1-24,
each with its run and checks), the autorun log, and git: each run's handoff is this file at its merge (`git log -p
docs/NEXT.md`); the review-intent Direction of run 0751 in full at `a2f3914`, the pair Direction of run 1850 at `20e9a88`.

**Goal (user, 2026-10-05): complex evolution** (AGENTS.md, IDEAS); the organism that feeds its bud is a direction.
Since review-intent run 1850 the vehicle is **the pair** (2 cells, 2 types; IDEAS "Sources in proportion to use"): a
kind where every cell of a body exposes exactly one copyable side, so part types are made in the proportion buds use
them. The 47-type organism lineage is frozen; it returns as the complex end once the pair world varies and competes.
Where the line stands (run 1021, INNOVATIONS): the head nursery keeps its root letter under copy error; a head class
born on a site of the shared second cell (a commons) replaces it, and second cells without the site turn it back.

**Handoff status (autorun run 20261008-1222, cleanup).** No rule, physics, structure or check change. `tri/check.js`
takes `--part k/n` (whole checks balanced by their time estimates; two parts of about 70 estimated minutes each, so a
suite fits a background job's 2-hour limit even in run 0651's slow container) and `--cmd [id ...]` (prints each check's
demo command with its env and seeds: every capability's world is one command, so this file no longer lists them). The
demo `pool` (a frozen-lineage measurement no check used) is removed (code in git at `9556170`). The pair's done list
moved to ROADMAP backlog A and the core-change candidates to RULES (Core changes, Open candidates). `PAM` stays
(follow-ups). Suite `--part 1/2` from a worktree of the branch: 33 of 33 pass (`pair-flow-c` partial as on main), 4073 s; of part 2
only its non-pair demos were run (`copy`, `strips`, `budpool`, `lysis`: 4 of 4 pass), since nothing a check runs changed.
Nothing is running.

**Next step (rotation 78, build): priority 28, the race.** The batch readers run 1021 used were throwaway scripts
(counts of root letters and of second-cell site letters per `types:`/`kinds:` census); rewrite them from the line
formats (about 20 lines each).

## Priorities

Done 1-24: ROADMAP backlog A (each with its run and checks; INNOVATIONS has the evidence). The user approved the order
(run 0321): a world that runs indefinitely under steady, labelled drives; the simplest heritable variation; a minimal
competition test.
Open (review-intent 82 may reorder):
28. [78 build] **The race: does the commons class become a nursery before the commons' cheats remove its sites?**
    Run 1021 measured each step without mutation: a class born on second-cell sites invades the head nursery (`commons`),
    second cells without the site turn it back (`commons-turn`), and a head with a free site on its own side founds a
    nursery of the complementary letter by one error (seen once). Under copy error both arise by mutation: second cells
    lose the site (any error on that side), and `I@&c@|z` becomes `I@&c@|i` (one error; its first copy goes once to the
    pool). If the nursery comes first, letters cycle (Z nursery, I commons class, I nursery, ...): the Red Queen of
    letters; if the cheats come first, the old nursery returns. Theory first (rates: second-cell copies far outnumber
    head copies, so cheats come first unless the I nursery has an edge where i sites remain), then `commons`'s world with
    `pErr` 0.005 and 0.01 from 20k (or from a saved state of the turn's peak, `TRI_RESUME`), seeds 1-4, 240k: count
    worlds where an I nursery holds, where Z returns, and new site letters on second cells after the turn.
25. [later] **Length without sinks.** Chains of second cells arise by one mutation (an attach letter that complements a
    seed site) and preceded both collapses in run 0121 and all four in run 0551's control; a lysing site at the chain's
    tip stops them. Length as a function needs a chain that lets go (an `&` at its end) or a third cell that covers an
    open site (length as defence). Designed, not demonstrated.
26. [later] Killing as a frequency-dependent enemy: the root-lysing seed site `z!` is the first killer to arise; it spread
    as a cheat, not as a predator, and guards against chains (run 0551).
27. [later] **The plug.** A part with the root letter as its attach side and nothing else (`--D@`) binds a nursery head's
    own side and stops in-place birth (run 0651, one world of 4). Guard designs: a release on the head's own side
    once a non-head binds (no such rule), a lysing own side (kills its own children), or a second own side.
Frozen: the 47-type organism (feeding, candidate (n), the front sink, lysis in the lineage). Not taken from run 1750's
list: (b) diets of different length and (c) more diets than blanks (run 1150's R* rule again).

Rotation (autorun `projects/plywood/rotation.txt`, unchanged): 77 cleanup (done), 78 build, 79 explore, 80 build, 81
explore, 82 review-intent.

**Core-change candidates:** docs/RULES.md, Core changes, Open candidates ((t), (u), (s), (r)'s open part, (j), (l);
settled there: (f), (k) and the done ones).

**Open follow-ups (not priorities; take when a run's kind fits).**
- Core review: same-pass partner reads (zip, gap, release, fn) are allowed by convention (RULES, Locality audit);
  change only if a locality problem traces back to them.
- Speed (run 1721): a supply drive that keeps its stock outside the world, about 1.6x early in a run, changes
  outputs; decide it in a `build` that changes the setup.
- Suite time: 71 minutes at run 0250, about 100 with the nine checks added since, 160 in run 0651's container (hence
  `--part`); the frozen lineage's two checks (one world each, 15-17 minutes) are about 12% of the suite's CPU; the rest
  is pair worlds, whose time is lone blocks' physics (about 80%; a destination-only neighbour gather was 5% slower).
- Copy error as the standard world's variation (cleanup run 1222 looked, did not do it): `PAM` is on in 21 checks, 5
  of them the front-only mutagen (`PAMF=1`: `diets`, `diets-ns`, `diets-catcher(-c)`, `ladder`), which copy error
  cannot replace (it errs on any side of a copy, not on free fronts). Retiring `PAM` changes the standard world
  (`PAW=1`) and every check built on it: a `build` decision for the setup, after review-intent 82, not a cleanup.
- Bigger cells and letter reuse (user, 2026-10-03; IDEAS): R 5 is the largest all-unique kind (46 letters); if a
  slice needs a larger cell, reuse letters inside sealed compartments.

## Commands
```
node tri/test.js                                   # fast checks (~5 s)
node tri/check.js [id ...] > runs/check.txt         # capability checks: one PASS/FAIL line each, printed as each finishes
                                                   # (4 processes; 71-160 minutes by container: as two background jobs,
                                                   # --part 1/2 then --part 2/2, from a worktree if you edit code meanwhile);
                                                   # CHECK_SAVE=dir keeps each world's output
node tri/check.js --cmd [id ...]                   # each check's demo command (env, seeds, steps): the world of every
                                                   # capability; change the steps (third argument) to run it longer
node tri/batch.js runs/b.json                      # a batch of demo worlds from a JSON file, 4 at a time, an output file and
                                                   # picture directory per world (format in the file's head comment)
PAW=1 node tri/demos.js pair 1 120000 runs/x       # THE STANDARD WORLD (check world): the diet kind among stocks C E G,
                                                   # openRange 9, deaths return blanks, decay, the whole-body hazard h 0.07,
                                                   # the general mutagen 0.01; any option set overrides (demos.js, comments
                                                   # above the pair demo, list every option)
PAW=1 PAF= PAM=0 TRI_PARAMS='{"pErr":0.01}' PA2='Z@&c@|z C@-z!' node tri/demos.js pair 1 240000 runs/x
                                                   # the head nursery under copy error (check copy-error at 60k); the
                                                   # commons and its turn: --cmd commons commons-turn
PAW=1 PAB=3000 PAS=87 PAF='C@-|z|:450 E@-|z|:450 G@-|z|:450' node tri/demos.js pair 1 240000 runs/x
                                                   # the standard world at 3x (about 50 minutes); 'web:' lines
NODE_OPTIONS='-r ./tri/copyrate.js' ...            # adds a 'copyrate:' line (copies per template class from CR_T0, 25000)
COV_OUT=$PWD/runs/cov.jsonl NODE_OPTIONS="-r ./tri/coverage.js" node tri/check.js   # coverage: marks present, rule
                                                   # events, one JSON line per demo world
node tri/demos.js closure                          # the designed organism kind (budKit) drawn, no physics
node tri/demos.js imprint 1 100000 runs 150ph      # a hooded pore (150pw: a 7-cell pore); the checked ones: --cmd imprint-pore
```
Pictures go to `runs/NAME.png` with saved states; `TRI_NOPIC=1` turns them off. `TRI_RESUME=runs/x/NAME_tNNN.json.gz`
continues a demo world from a saved state; `TRI_PARAMS='{...}'` overrides parameters. To show a change leaves outputs
the same: `CHECK_SAVE=$PWD/runs/a node tri/check.js` in a worktree of main and `CHECK_SAVE=$PWD/runs/b ...` in the
branch, then `diff -r`. Commands of earlier setups are in their INNOVATIONS entries (options since removed: in git at
the commit INNOVATIONS' header names).

## Pitfalls learned
Read before designing a layout: docs/IDEAS.md, "Pitfalls learned (copy lineage)" (doorways, anchors, food sinks,
signals, rings, physics) and "Pitfalls from the casting lineage" (kits, pockets, doors, flaps; that lineage is
removed, its lessons stay).
