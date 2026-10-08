# Next instance: start here

State on 2026-10-08 (after autorun run 20261008-1351, build). Read AGENTS.md first (rules of work), then this file.
History: docs/INNOVATIONS.md (newest first), RULES (Core changes), ROADMAP backlog A (the pair's done priorities 1-24 and 28,
each with its run and checks), the autorun log, and git: each run's handoff is this file at its merge (`git log -p
docs/NEXT.md`); the review-intent Direction of run 0751 in full at `a2f3914`, the pair Direction of run 1850 at `20e9a88`.

**Goal (user, 2026-10-05): complex evolution** (AGENTS.md, IDEAS); the organism that feeds its bud is a direction.
Since review-intent run 1850 the vehicle is **the pair** (2 cells, 2 types; IDEAS "Sources in proportion to use"): a
kind where every cell of a body exposes exactly one copyable side, so part types are made in the proportion buds use
them. The 47-type organism lineage is frozen; it returns as the complex end once the pair world varies and competes.
Where the line stands (run 1351, INNOVATIONS): under copy error the commons loop runs by itself. A head class born on a
site of the shared second cell (a commons) replaces the head nursery, its cheats always come first (no I nursery), and
a common site is a target: whatever binds it (the class, an in-place chain, a binder) makes second cells with another
letter win, so the site letter turns over, and commons classes of the new letters arise by one root error. Turnover,
not yet growth in complexity: every class has one shape.

**Handoff status (autorun run 20261008-1351, build): priority 28 done.** No rule or physics change. New check `race`
(the commons world under copy error at 0.005, 240k, about 9 minutes per world; 6 of 8 in the batch, need 3 of 4); demo
option `PATN=n` (`types:` lists n types; default 10, outputs unchanged); `tri/census.js` (heads by root letter, second
cells by site letter, from `types:` lines). Records: INNOVATIONS run 1351, IDEAS "A common site is a target", ROADMAP
(row, backlog A 28), pictures `race.png`, `race-long.png`. Evidence: tests 44 of 44; `node tri/check.js race copy-error`
from a worktree of the branch: `race` 3 of 4 (566 s), `copy-error` 4 of 4 (`types:` unchanged by default); the batches (`runs/` is not kept: rebuild them as `tri/batch.js` files
from INNOVATIONS' Commands: seeds 1-4 at 0.005, at 0.01, and the control; seeds 5-8 at 0.005; seeds 2, 3, 5, 6 at 0.005
to 480k) are read with `node tri/census.js`. The full
suite was not rerun: no rule, physics or shared structure changed, and `PATN` unset leaves every output as before.
Nothing is running.

**Next step (rotation 79, explore): priority 29, the plug guard** (below), the line's one observed collapse under copy
error. Or, if the explore run prefers a new idea, priority 31's theory.

## Priorities

Done 1-24 and 28: ROADMAP backlog A (each with its run and checks; INNOVATIONS has the evidence). The user approved the order
(run 0321): a world that runs indefinitely under steady, labelled drives; the simplest heritable variation; a minimal
competition test.
Open (review-intent 82 may reorder):
29. [79 explore] **The plug guard** (was 27). A part with the root letter as its attach side binds a nursery head's own
    side and stops in-place birth: `--D@` killed run 0651's D nursery, `T!Z@i!` (a second cell two errors away, attach
    letter Z) collapsed a race control world at 180k (run 1351, 1 of 16). Under copy error it is the one parasite that
    sinks the world, because it binds a side the head needs (IDEAS run 1351: a side nobody needs escapes by turnover).
    Guard designs: a release on the head's own side once a non-head binds (no such rule: a core candidate), a lysing
    own side (kills its own children), a second own side. Theory first: which guard needs no new rule.
30. [80 build] **The loop at length.** Does it run indefinitely? Worlds at 0.005 (the `race` world) to 1.2M, seeds 5
    and 6 plus two more (about 45 minutes each): count site turns (run 1351: about one per 110k steps in the 480k
    worlds), commons classes by mutation (4 in 4.8M world-steps), nursery losses and returns, collapses. A check if
    the loop holds through several turns in 3 of 4.
31. [later] **Shape inside the loop.** Every class is one shape (a head and a second cell), so the loop is turnover of
    letters. Complexity needs variants that differ in what they do and are selected inside it: a head with a second
    site of its own (a commons class that is also a commons), or a third cell that covers the site (length as
    defence, priority 25). Theory first: which one-error variant changes shape and pays inside the loop.
25. [later] **Length without sinks.** Chains of second cells arise by one mutation (an attach letter that complements a
    seed site) and preceded both collapses in run 0121 and all four in run 0551's control; a lysing site at the chain's
    tip stops them. Length as a function needs a chain that lets go (an `&` at its end) or a third cell that covers an
    open site (length as defence). Designed, not demonstrated.
26. [later] Killing as a frequency-dependent enemy: the root-lysing seed site `z!` is the first killer to arise; it spread
    as a cheat, not as a predator, and guards against chains (run 0551).
Frozen: the 47-type organism (feeding, candidate (n), the front sink, lysis in the lineage). Not taken from run 1750's
list: (b) diets of different length and (c) more diets than blanks (run 1150's R* rule again).

Rotation (autorun `projects/plywood/rotation.txt`, unchanged): 78 build (done), 79 explore, 80 build, 81 explore, 82
review-intent.

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
node tri/census.js runs/x.txt [--every k]         # heads by root letter, second cells by site letter, from 'types:' lines
                                                   # (copy error on; PATN=30 in the world lists 30 types)
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
