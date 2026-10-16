# Next instance: start here

State on 2026-10-16 (after autorun run 20261016-0727, build). Read AGENTS.md first (rules of work), then this file.
History: docs/INNOVATIONS.md (newest first), RULES (Core changes), ROADMAP backlog A (the pair's done priorities 1-24,
28-30, 32, 33 and 36, each with its run and checks), the autorun log, and git: each run's handoff is this file at its merge
(`git log -p docs/NEXT.md`; run 1951's slice record with its predictions at `explore-1951`'s WIP commits); the
review-intent Direction of run 0751 in full at `a2f3914`, the pair Direction of run 1850 at `20e9a88`; the latest
direction check: IDEAS "Eight slices on the lock" (run 2151); run 2221's slice record (goal, predictions, stop rule,
progress) at its WIP commits on `core-review-2221`; run 0727's (priority 36, with its predictions) on `build-0727`
(`git log -p docs/NEXT.md`).

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
does not lyse across a joint (`lysJoint`, candidate (v), an option, default 0) guards a public lock: the root letter then turned
11-19 times in 480k in 4 of 8 worlds (0-3 unguarded). Run 0727 (the line's world `PAW=2`, 8 worlds to 480k; IDEAS
"A nursery guards itself"): a world's fate follows where its lock sits. Plain nurseries (own side without `!`) died
(3 of 3); **guarded nurseries** (own side the root's complement with `!`: under `lysJoint` it raises the children and lyses
plugs with itself) lived (2 of 2); public worlds lived (2 of 2) with two root classes alternating; a world with no lock
on any cell (catchers only) died. The second cell's lock never follows a nursery (0 of 46 censuses). Catchers took the
second cell's place in 4 of 8, and the two that lived moved the lock onto a cell's own side: the host head (seed 1) or
the catcher itself (seed 5, roles swapped).

**Handoff status (autorun run 20261016-0727, build): priority 36 done** (INNOVATIONS 2026-10-16; IDEAS "A nursery guards
itself"). The line's world is the preset `PAW=2` (`PAW=1` without stocks or mutagen, `PATN=30`, founder `Z@&c@|- C@-z|!`,
`pErr` 0.01, `lysJoint` 1; byte for byte run 1951's E4j command; `PAW=1` unchanged). New checks `line` (240k, the root
letter turns at least twice), `nursery-guard` and its control `nursery-guard-c` (no copy error, 20 plugs: the guarded
nursery `Z@&c@|z!` loses them, the plain one dies); `tri/census.js --pool` now reads catchers (a C attach side with a root
is a second cell), heads with a lock, two-site second cells, guarded nurseries. No core change. Nothing is running. The 8
worlds are in `runs/p36` only: `node tri/batch.js runs/p36.json` (file:
`{"demo":"pair","steps":480000,"env":{"PAW":"2","TRI_NOPIC":"1"},"jobs":[{"id":"w","seeds":[1,2,3,4,5,6,7,8]}]}`, about
35 minutes with 4 at once), read with `node tri/census.js --pool --joint runs/p36/w*.txt`; the picture with `node
tri/linechart.js docs/pictures/line-world.png runs/p36/w*.txt`.

**Next step (rotation 85, harden)**: suite time with 69 checks (`line` adds about 9 minutes per part it lands in), and
whether `world-free`/`seal-evolve`-style long checks can share worlds; then 86 build, 87 explore (priority 34, which
now starts from run 0727's two bodies).

## Priorities

Done 1-24, 28-30, 32, 33 and 36: ROADMAP backlog A (each with its run and checks; INNOVATIONS has the evidence). The user approved the order
(run 0321): a world that runs indefinitely under steady, labelled drives; the simplest heritable variation; a minimal
competition test.
Open (set by review-intent run 2151; 32 done in core review run 2221, 36 in build run 0727):
34. [87 explore] **The catcher, shape first** (theory first). A head whose front became `C@` takes the second cell's place
    on host fronts and carries no lock. Run 0727 saw the shape answer twice in the line's world (`PAW=2`): catchers took
    most second cells in 4 of 8 worlds, and the two that lived put a guarded lock on a cell's own side (the host head,
    `I!i@&c@`, seed 1; the catcher itself, `C@f!F@&`, seed 5, roles swapped); the two that died kept no guarded lock on
    any cell. Derive why the lock goes where it does (which cell's own kind it raises, who pays for a plug), predict
    which cell keeps it from the order of errors, then an entry test: catchers entered into a public world with and
    without hosts carrying `z!` on their own side. Only then whether anything else is needed.
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
Frozen: the 47-type organism (feeding, candidate (n), the front sink, lysis in the lineage); its genome copying left the
core in run 2221 (git `1284bb4`); `budpool`, `closure` and `lysis` keep its kit. Not taken from run 1750's list: (b) diets of different length and (c) more
diets than blanks (run 1150's R* rule again).

Rotation (autorun `projects/plywood/rotation.txt`, unchanged by runs 2151, 2221 and 0727): 85 harden (suite time: 69
checks, about 80 minutes per part in run 2221's container before `line`), 86 build, 87 explore, 88 build, 89 cleanup.

**Core-change candidates:** docs/RULES.md, Core changes, Open candidates ((v) kept as the option `lysJoint`, (t), (s), (r)'s open part, (j), (l); settled there: (f),
(k) and the done ones, (u) and (w) in run 2221).

**Open follow-ups (not priorities; take when a run's kind fits).**
- Core review: the convention of reading a partner's current state is now used only by binding (the chain rules'
  same-pass reads left with them, run 2221; RULES, Locality audit). `pBond` is never below 1 (removing it changes the
  random stream only: take it with a change that changes outputs anyway).
- Speed (run 1721): a supply drive that keeps its stock outside the world, about 1.6x early in a run, changes
  outputs; decide it in a `build` that changes the setup.
- Suite time: 71 minutes at run 0250, 160 in run 0651's container (hence `--part`); the frozen lineage's two long
  checks left in run 2221; the rest is pair worlds, whose time is lone blocks' physics (about 80%; a destination-only
  neighbour gather was 5% slower); `seal-evolve` (4 x 400k) and `race` are the longest.
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
PAW=2 node tri/demos.js pair 1 480000 runs/x       # THE LINE'S WORLD (run 0727): no stocks or mutagen, founder
                                                   # 'Z@&c@|- C@-z|!', pErr 0.01, lysJoint 1 (check line at 240k); read
                                                   # with census --pool --joint, chart with tri/linechart.js
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
node tri/demos.js imprint 1 200000 runs/x           # contact copying: a ring with one of each part closes, a second grows
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
