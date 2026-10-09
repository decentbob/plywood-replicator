# Next instance: start here

State on 2026-10-08 (after autorun run 20261008-2151, review-intent). Read AGENTS.md first (rules of work), then this file.
History: docs/INNOVATIONS.md (newest first), RULES (Core changes), ROADMAP backlog A (the pair's done priorities 1-24,
28-30 and 33, each with its run and checks), the autorun log, and git: each run's handoff is this file at its merge
(`git log -p docs/NEXT.md`; run 1951's slice record with its predictions at `explore-1951`'s WIP commits); the
review-intent Direction of run 0751 in full at `a2f3914`, the pair Direction of run 1850 at `20e9a88`; the latest
direction check: IDEAS "Eight slices on the lock" (run 2151).

**Slice in progress (autorun run 20261008-2221, core-review; branch `core-review-2221`): priority 32 whole.**
Goal: (v) becomes the rule (lysis never crosses a joint, by contact or relay; the option `lysJoint` goes), (w) is removed
(`lysOneWay`: no gain in either long test), (u) chain copying leaves the core (zip, gap, need, fn, fill, bond kinds,
dock, fill, close, release, the anchor's catch and `_snapBody`; founder strands in `world.js`; checks `copy`,
`imprint-genome(-c)`, `imprint-pore(-c, -n)`, `budcycle-3`, `budcycle-lysis`, and with (v)/(w) `lock-guard-0`,
`trap-oneway(-c)`). Done when: `node tri/test.js` passes; the branch suite passes, and every world that an observation
hook found untouched by (v) is byte for byte main's (CHECK_SAVE, `diff`). Predicted: worlds with a `!` side that holds
an `&` part change (the nursery family `z!`, `lysis`'s demo for its stand-in end); every other pair world is identical
(no strand exists there, and the removed rules draw no random number without one); `lock-guard` passes without
`lysOneWay` (the lock dies with each plug it lyses, but 20 plugs are few). Stop: if (v) breaks 3 or more checks beyond
the nursery family, keep it an option and record why. Running: the baseline suite on main `1284bb4` in worktree
`../wt-base` (`CHECK_SAVE=runs/base`, hook `runs/ld.jsonl`: per world the passes where `lysJoint`/`lysOneWay` would
change a lysis value; the hook is in this run's scratchpad, its logic in the handoff below). Part 1 done 00:05 (36 of 37:
the one failure, `budcycle-lysis`, stopped by hand, retired); (v) touches 13 of its checks (every mutagen or copy-error
world: mutant `!` sides meet `&` sides), so the stop rule reads failures, not changes. Part 2 running (the remaining
checks but the retired ones), then the branch suite with `COV_OUT` (coverage for the Core inventory). Code review by an
independent agent: no divergence outside (v), random stream identical (oldv vs new bit for bit in 9 worlds). **Branch part 1
(02:49): 74 worlds untouched by (v) byte for byte main's ((u) is output-neutral); (v) as the rule failed `seal-evolve` 0/4
(all worlds die), `pair-flow` 1/4, `commons-turn` 1/4, `nursery-cheat` 0/4, `nursery-c` 2/4: stop rule met, (v) reverted
to the option `lysJoint` (commit 506f954; IDEAS "A trap or a lock"). Now running** in worktree `../wt-br` (detached at
506f954): the 46 checks (v) touched or not yet run (`runs/rerun.txt`), `CHECK_SAVE=runs/br2`, `COV_OUT=runs/cov2.jsonl`,
`--part 1/2` then `2/2`; expected byte for byte main's except `lysis` (stand-in end) and `lock-guard(-0)` (no
`lysOneWay`).

**Goal (user, 2026-10-05): complex evolution** (AGENTS.md, IDEAS); the organism that feeds its bud is a direction.
Since review-intent run 1850 the vehicle is **the pair** (2 cells, 2 types; IDEAS "Sources in proportion to use"): a
kind where every cell of a body exposes exactly one copyable side, so part types are made in the proportion buds use
them. The 47-type organism lineage is frozen; it returns as the complex end once the pair world varies and competes.
Where the line stands (runs 1351-1951, INNOVATIONS; IDEAS "Who pays for a lock"): recognition is one glue pair and copy
error changes one side, so **a lock its carrier needs is frozen** and only a lock its carrier does not need turns. In the
nursery world that is the second cell's site, which seals for good (run 1650: the loop stops). In the stockless world it
is a **public lock** (the pool-raised class's site on the second cell): it turns and its seal is self-limiting, but the
core's guard (a trap of its letter) lyses keys and plugs alike, so **turnable and guardable exclude each other**: 3 of 4
such worlds died of lock parasites by 480k, the fourth privatized (a nursery guarded by a trap) and froze. A trap that
does not lyse across a joint (`lysJoint`, candidate (v), default 0) guards a public lock: the root letter then turned
11-19 times in 480k in 4 of 8 worlds (0-3 unguarded). Left: the **catcher** (a head with a `C@` front in the second
cell's place, carrying no lock) and nurseries whose second cells carry no lock of their letter (sunk by a plug): 4 of 8
guarded worlds died of these.

**Handoff status (autorun run 20261008-2151, review-intent): direction set, no building** (IDEAS "Eight slices on
the lock"). The lock line combines its capabilities in one world and reached a loop of root letters that does not settle
(`lysJoint`: 11-19 turns in 4 of 8 worlds), but every body is still two cells, and the last three slices each answered
a parasite with a guard (two of them core parameters). A strip has one key and one lock (each cell uses two sides and
exposes one), so a spare lock is a cell with two sites, `C@z!z!`, which has already arisen: duplication, then
divergence (two guarded locks of two letters raising two classes on one carrier), is the shape step the lock theory
points to. Decided: chain copying (candidate (u)) is retired at a core review; the stockless world under copy error
becomes the line's preset; the mutagen stays for `PAW=1`'s checks. Stop rule for the lock line: no new core parameter
for a guard until (v) and (w) are settled, then a shape the world reaches by one error before a new rule. Records:
IDEAS, ROADMAP backlog A, RULES (u). Nothing is running.

**Next step (rotation 83, core-review)**: priority 32 ((v) and (w)), then (u) if the run has room.

## Priorities

Done 1-24, 28-30 and 33: ROADMAP backlog A (each with its run and checks; INNOVATIONS has the evidence). The user approved the order
(run 0321): a world that runs indefinitely under steady, labelled drives; the simplest heritable variation; a minimal
competition test.
Open (set by review-intent run 2151):
32. [83 core-review] **Adopt or remove `lysJoint` and `lysOneWay`** (RULES (v) item 5, (w) item 6). For (v): it alone
    makes a turnable lock guardable (`lock-guard`; 11-19 root turns in 4 of 8 long worlds, 0-3 without), and lysis then
    never crosses a joint (one condition for contact and relay). Against: outputs change wherever a `!` side holds a part
    across a joint: the head nursery's trap `z!` raises its pool-born heads instead of lysing them, budcycle's cutter on
    its `&` receptor lyses nothing (`budcycle-lysis` changes), the scavenger needs no `&`. (w): no gain shown in either
    long test. Run the suite with each on as default before deciding. **Then (u), decided in run 2151: retire chain
    copying** (RULES (u): zip, gap, need, fn, fill, the dock, fill, close and release rules, the strand catch and
    `_snapBody`; checks `copy`, `imprint-genome(-c)`, `imprint-pore(-c, -n)`, `budcycle-3`, `budcycle-lysis` leave, code
    in git). Show the pair checks' outputs unchanged (`CHECK_SAVE` and `diff -r`). If the run has no room, (u) is the
    next core review's first item.
36. [84 build] **The line's world as a preset** (e.g. `PAW=2`: `PAF= PAM=0 PATN=30`, founder `Z@&c@|- C@-z|`, or
    `C@-z|!` with `lysJoint` if 83 adopts (v), `pErr` 0.01; `PAW=1` and its checks unchanged), then old 35 in it: **a
    nursery and its guard.** Privatization is still the exit in the guarded world, and a nursery whose second cells carry
    no lock of its letter dies of a plug (2 of 4 guarded deaths); in E4 seed 1 the nursery kept a guarded lock of its
    letter (`C!C@L!` under `Ll@&c@`) and lived. Measure how often the guard follows the root (8 seeds, 480k; census
    `--pool --joint`), and count second cells with two sites (`census.js` may need a column) as the baseline for 37.
34. [87 explore] **The catcher, shape first** (theory first). A head whose front became `C@` (`Z@&C@-`) takes the second
    cell's place on host fronts and carries no lock; it killed 2 of 4 guarded and 1 of 4 unguarded long stockless
    worlds. It is a parasite of the carrier role, read by the frozen front/attach pair, so a guard must read a second
    side. By the stop rule, derive first which shape reachable by one error answers it (a second cell with two sites; a
    third cell; the head's own side), and only then whether a rule is needed.
37. [after 34] **Duplication and divergence** (IDEAS "Eight slices on the lock"). A strip has one key and one lock; a
    second cell with two sites (`C@z!z!`) is the one-error spare lock. Predicted: under `lysJoint` a carrier with two
    guarded locks of two letters (`C@z|!y!`) raises two head classes, so two classes live on one carrier (run 2021's
    third test, by shape). Theory, then an entry test (both classes, one carrier) and the share of two-site cells under
    copy error.
31. [later] **Shape inside the loop.** Every class is one shape, so the loop is turnover of letters; 37 is its first
    concrete case. Others: a head with a second site of its own, a third cell that covers the site (length as defence).
25. [later] **Length without sinks.** Chains of second cells arise by one mutation (an attach letter that complements a
    seed site) and preceded both collapses in run 0121 and all four in run 0551's control; a lysing site at the chain's
    tip stops them. Length as a function needs a chain that lets go (an `&` at its end) or a third cell that covers an
    open site (length as defence). Designed, not demonstrated.
26. [later] Killing as a frequency-dependent enemy: the root-lysing seed site `z!` is the first killer to arise; it spread
    as a cheat, not as a predator, and guards against chains (run 0551).
Frozen: the 47-type organism (feeding, candidate (n), the front sink, lysis in the lineage); with (u) its genome copying
leaves the core and it returns from git. Not taken from run 1750's list: (b) diets of different length and (c) more
diets than blanks (run 1150's R* rule again).

Rotation (autorun `projects/plywood/rotation.txt`, unchanged by run 2151): 83 core-review, 84 build, 85 harden
(suite time: 76 checks, about 2.5 hours in two parts; retire the checks a decided candidate makes redundant, e.g.
`lock-guard-0` if (v) is adopted, `trap-oneway(-c)` if (w) is removed), 86 build, 87 explore, 88 build, 89 cleanup.

**Core-change candidates:** docs/RULES.md, Core changes, Open candidates ((w) built as `lysOneWay`, (v) built as `lysJoint`, (t), (u), (s), (r)'s open part, (j), (l);
settled there: (f), (k) and the done ones).

**Open follow-ups (not priorities; take when a run's kind fits).**
- Core review: same-pass partner reads (zip, gap, release, fn) are allowed by convention (RULES, Locality audit);
  change only if a locality problem traces back to them.
- Speed (run 1721): a supply drive that keeps its stock outside the world, about 1.6x early in a run, changes
  outputs; decide it in a `build` that changes the setup.
- Suite time: 71 minutes at run 0250, about 100 with the nine checks added since, 160 in run 0651's container (hence
  `--part`); the frozen lineage's two checks (one world each, 15-17 minutes) are about 12% of the suite's CPU; the rest
  is pair worlds, whose time is lone blocks' physics (about 80%; a destination-only neighbour gather was 5% slower).
- Copy error as the standard world's variation: decided in run 2151 not to retire `PAM` now (on in 21 checks, 5 of them
  the front-only mutagen `PAMF=1`, which copy error cannot replace); new work runs in the line's preset (priority 36).
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
node tri/census.js --loop runs/x.txt [...]        # one summary per world: site turns, commons episodes, sealed site,
                                                   # trap, plugs, chains
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
