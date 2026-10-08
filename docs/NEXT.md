# Next instance: start here

State on 2026-10-08 (after autorun run 20261008-1522, explore). Read AGENTS.md first (rules of work), then this file.
History: docs/INNOVATIONS.md (newest first), RULES (Core changes), ROADMAP backlog A (the pair's done priorities 1-24, 28
and 29, each with its run and checks), the autorun log, and git: each run's handoff is this file at its merge (`git log -p
docs/NEXT.md`); the review-intent Direction of run 0751 in full at `a2f3914`, the pair Direction of run 1850 at `20e9a88`.

**Goal (user, 2026-10-05): complex evolution** (AGENTS.md, IDEAS); the organism that feeds its bud is a direction.
Since review-intent run 1850 the vehicle is **the pair** (2 cells, 2 types; IDEAS "Sources in proportion to use"): a
kind where every cell of a body exposes exactly one copyable side, so part types are made in the proportion buds use
them. The 47-type organism lineage is frozen; it returns as the complex end once the pair world varies and competes.
Where the line stands (runs 1351, 1522, INNOVATIONS): under copy error the commons loop runs by itself (commons
classes and the second cell's site letter chase each other; turnover, not yet growth in complexity: every class has
one shape). Its one sink is a plug on the heads' own sides. No head can guard its own side; the guard is a trap on the
shared part (`z!` on the second cell), and under the current core the trap dies with each plug it lyses, so it is
selected away in an epidemic. One-way lysis (option `lysOneWay`, candidate (w)) keeps it.

**Handoff status (autorun run 20261008-1522, explore): priority 29 done.** One core candidate built as an option:
`lysOneWay` (default 0; RULES Core changes (w), with its case; every default output unchanged: a 15k copy-error world
byte for byte main's). New checks `trap`, `trap-c`, `trap-oneway`, `trap-oneway-c` (`node tri/check.js trap trap-c trap-oneway
trap-oneway-c`: 4 of 4 checks pass, each 4 of 4 worlds, 591 s); test "lysOneWay" (tests 45 of 45); demo option `PA3N`; a resumed world takes `TRI_PARAMS` and
`TRI_RESEED=k`. Records: INNOVATIONS run 1522, IDEAS "A trap on the shared part", RULES (w) and (v), ROADMAP (row,
backlog A 29), picture `plug-trap.png`. The batches (`runs/` is not kept) are rebuilt from INNOVATIONS run 1522's
entries and commands; read them with the trap reader in the checks (`trap*`: heads, second cells with `z!`, plugs from
`types:` lines). The full suite was not rerun: the option is off by default, and nothing else in the rules, physics or a
shared structure changed. Nothing is running.

**Next step (rotation 80, build): priority 30, the loop at length**, now with two arms: the current core and
`lysOneWay` (does one-way lysis remove the plug collapse and keep the loop turning?). Then rotation 83 (core-review):
adopt `lysOneWay` as the rule or remove it (adopting changes outputs: full suite).

## Priorities

Done 1-24, 28 and 29: ROADMAP backlog A (each with its run and checks; INNOVATIONS has the evidence). The user approved the order
(run 0321): a world that runs indefinitely under steady, labelled drives; the simplest heritable variation; a minimal
competition test.
Open (review-intent 82 may reorder):
30. [80 build] **The loop at length.** Does it run indefinitely? Worlds at 0.005 (the `race` world) to 1.2M, seeds 5
    and 6 plus two more (about 45 minutes each): count site turns (run 1351: about one per 110k steps in the 480k
    worlds), commons classes by mutation (4 in 4.8M world-steps), nursery losses and returns, collapses. A check if
    the loop holds through several turns in 3 of 4. Second arm (run 1522): the same worlds with `lysOneWay` 1 (add it
    to `TRI_PARAMS`): plug collapses (current core: 1 in 16 by 240k) and the trap's share over time (`z!` on second
    cells: the `trap*` checks' reader); does a second trap side arise and spread during a plug epidemic?
32. [83 core-review] **Adopt or remove `lysOneWay`** (RULES (w)). For: the trap survives its catch, the scavenger's
    `&` trick becomes unnecessary, one condition. Against: it changes outputs wherever a `!` side holds a part without
    `&`. Run the suite with it on as default before deciding; the lysis demo's cutters and the scavenger test change.
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

Rotation (autorun `projects/plywood/rotation.txt`, unchanged): 79 explore (done), 80 build, 81 explore, 82
review-intent, 83 core-review.

**Core-change candidates:** docs/RULES.md, Core changes, Open candidates ((w) built as `lysOneWay`, (v), (t), (u), (s), (r)'s open part, (j), (l);
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
