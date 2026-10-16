# Next instance: start here

State on 2026-10-16 (after autorun run 20261016-1227, build). Read AGENTS.md first (rules of work), then this file.
History: docs/INNOVATIONS.md (newest first), RULES (Core changes), ROADMAP backlog A (the pair's done priorities 1-24,
28-30, 32, 33, 36 and 37, each with its run and checks), the autorun log, and git: each run's handoff is this file at its merge
(`git log -p docs/NEXT.md`; run 1951's slice record with its predictions at `explore-1951`'s WIP commits); the
review-intent Direction of run 0751 in full at `a2f3914`, the pair Direction of run 1850 at `20e9a88`; the latest
direction check: IDEAS "Eight slices on the lock" (run 2151); run 2221's slice record (goal, predictions, stop rule,
progress) at its WIP commits on `core-review-2221`; run 0727's (priority 36, with its predictions) on `build-0727`
and run 1227's (priority 37: theory, runs, predictions P1-P6, progress) on `build-1227` (`git log -p docs/NEXT.md`).

## Slice in progress (autorun run 20261016-1602, explore): priority 34, the catcher, shape first

**Goal.** Derive why a lock goes where it does once a catcher takes the second cell's place, predict which cell keeps it,
and test by entry: catchers in a public world, with and without hosts that carry `z!` on their own side; then the
line's world with catchers entered (which cell takes the lock). No core change planned (stop rule of run 2151: shape
first). **Done when** the theory is written (IDEAS), the entry tests are read against the predictions (4 worlds each),
and the records say what holds. **Stop** if the entry tests contradict the theory twice: record what was learned.

**Theory (before the runs).**
- Roles. The head `H = Z@&c@|-` has a root, a front and a plain copied side. The second cell `S = C@-z|!` has an attach
  side, a plain copied side and the site; it has no root, so no site ever raises its kind: S is made only by filling a
  front. The catcher `K = Z@&C@|-` is H with its front letter turned (one glue error). As a free part it has two attach
  sides: its `C@|` fills a host's front (it takes S's place) and its root can be raised on a site like H (its front then
  catches a free head by its front). Either way the body is H + K bonded front to front: two cells with a root each, two
  plain copied sides, no site. **H and K are the same cell up to the front letter: a body H + K is symmetric.**
- Who a lock pays. A site raises root-bearers; the raised kid's front is then filled by whatever filler is free near it.
  A lock on S raises H, and S's kind gains only through the fronts those H offer, which any filler (S, a sealed S, K) can
  take: **a lock on a cell without a root is a public good** (IDEAS run 1227). K is the cheapest filler (no site, no
  waiting kid: the whole-body hazard takes a waiting kid with its parent, so it carries fewer hits) and as a root-bearer
  it can also take sites. A lock on a root-bearer's own copied side raises the bearer's own copies, made at that side
  (heredity in place, run 0121): **the only lock that pays its bearer is on a cell with a root, raising its own kind.**
  Under `lysJoint` such a lock is guarded (a plug is lysed, its bearer pays: run 0727), and the bearer is the one that
  gains, so it is not a public good.
- Which cell keeps it. Once catchers take the fillers' role, the cells with a root are H and K, and each is two errors
  from a guarded nursery of its own kind on its plain side (`-` to `z` then `z!`, or `-!` then `z!`; the plain nursery
  `z` is a selected step, run 0551). The rates are the same per copy, so **which of the two keeps the lock is decided by
  which error comes first, about even odds when both are common**; the other becomes its filler (H's front `c@|` takes K or
  S; K's front `C@|` takes H). Run 0727 saw one of each: seed 1 on the host (`Z@&c@y!`, then root Y), seed 5 on the
  catcher (`C@f!F@&`, roles swapped). A world where neither comes before the locks on S are gone dies (seed 7).
- A body of two self-raising cells. H with `z!` and K with `z!` bonded front to front (`Z@&c@|z! C@|z!Z@&`) needs no S:
  each cell raises its own kind on its own side and each is the other's filler. It is what the two lived worlds of run
  0727 were one error from.

**Predictions** (entry tests, `PAW=2`, no copy error `pErr` 1e-9, 4 worlds each to 120k; batch `runs/p34a.json`):
- P1 (E1: 10 bodies H + K entered at 20k into the public world `Z@&c@|- C@-z|!`): K takes most second cells in 3 of 4 by
  120k and heads fall below half the control's (E1c, no K) in 3 of 4; dead in 2 of 4 or more.
- P2 (E2: the same with hosts carrying `z!`, `Z@&c@|z! C@-z|!`, H's copies `Z@&c@|z!` with K): alive 4 of 4, heads at
  least 80% of the control's (E2c); K above S among fillers in 3 of 4.
- P3 (E3: 10 bodies H + K with `z!` on K, `C@|z!Z@&`, entered into the public world): the catcher with its own lock
  takes most second cells in 3 of 4 and the world lives 4 of 4 (the role swap of seed 5, by entry).
- P4 (E4: the symmetric body `Z@&c@|z! C@|z!Z@&` as founder, no S): alive 4 of 4, heads within a factor 2 of E2c's.
- P5 (E5: the line's world, `pErr` 0.01, 10 bodies H + K at 20k, 8 worlds to 240k; batch `runs/p34b.json`): catchers on
  most second cells in 6 of 8 or more; every world alive at 240k has a guarded self-raising lock (a root-bearer whose own
  side is its root's complement with `!`) on most heads or on most second cells with a root; both H and K take it in at
  least one world each; worlds without it die.

**Progress.** Regenerating run 0727's seeds 1, 5, 7, 2 to 160k (`runs/r0.json`: `{"demo":"pair","steps":160000,"env":
{"PAW":"2","TRI_NOPIC":"1"},"jobs":[{"id":"s","seeds":[1,5,7,2]}]}`) to read the order of errors.

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
the catcher itself (seed 5, roles swapped). Run 1227 (IDEAS "Two locks on one carrier"): a second cell with two guarded
locks of two letters (`C@y!z|!`) holds **two head classes in a mix** without copy error (about 40% Y, reached from both
sides; one carrier per class holds none), but under copy error the carrier sheds a lock (each lock is a public good on
it), and heads that raise each other turn into heads that raise themselves: **a lock stays only where it pays its
bearer, and the most private lock (a guarded nursery of one's own kind) wins.**

**Handoff status (autorun run 20261016-1227, build): done; one capability without copy error, two negatives under it**
(INNOVATIONS 2026-10-16, build; IDEAS "Two locks on one carrier"). No rule or demo change; `tri/census.js --pool` counts
the second root and second cells with locks for both roots (a `two classes` summary line), `tri/linechart.js` takes
`LC_T`, `LC_TITLE`, `LC_NAMES`. New checks `two-locks` (the mix, from a Y majority), `two-locks-c` (one carrier per class:
no mix held) and `two-locks-y` (the Y class alone dies), their digests written; no other check world changed (no
demo, rule or structure code touched). Nothing is running. The worlds behind every number are regenerated with
`node tri/batch.js runs/NAME.json` from these files (each about 10-40 minutes; read with `node tri/census.js --pool --joint`):
- `p37e.json`: `{"demo":"pair","steps":240000,"env":{"PAW":"2","TRI_NOPIC":"1","TRI_PARAMS":"{\"pErr\":1e-9}","PA3T":"20000","PA3N":"10"},"jobs":[{"id":"a","seeds":[1,2,3,4],"env":{"PA2":"Z@&c@|- C@y!z|!","PA3":"Y@&c@|- C@y!z|!"}},{"id":"b","seeds":[1,2,3,4],"env":{"PA2":"Y@&c@|- C@y!z|!","PA3":"Z@&c@|- C@y!z|!"}},{"id":"c","seeds":[1,2,3,4],"env":{"PA2":"Z@&c@|- C@-z|!","PA3":"Y@&c@|- C@-y|!"}}]}`
- `p37f.json`: the same head (no `PA3T`/`PA3N`), jobs `d` (`PA2` `Z@&c@|- C@y!z|!`, `PA3` `Y@&c@|- C@y!z|!`, `PA3T` 100,
  `PA3N` 10) and `s` (`C@y!z!` in both, `PA3T` 20000, `PA3N` 10)
- `p37h.json`: the same head, steps 120000, `PA3T` 100: `dc` (`Z@&c@|- C@-z|!` and `Y@&c@|- C@-y|!`, `PA3N` 10) and `alt` (60000 steps,
  `Z@&c@|y! C@-q!` and `Y@&c@|z! C@-q!`, `PA3N` 1)
- `p37l.json`: steps 480000, env `PAW` 2: `w` (seeds 1-4, `PA2` `Z@&c@|- C@y!z|!`, `PA3` `Y@&c@|- C@y!z|!`, `PA3T` 20000,
  `PA3N` 10) and `p` (seeds 1-8, nothing else: run 0727's worlds, the old `p36.json`)
- `p37i.json`: steps 480000, env `PAW` 2, `PA2T` 100, `PAEN` 10, `PA3T` 100, `PA3N` 10, `PA2` `Z@&c@|y! C@-q!`, `PA3`
  `Y@&c@|z! C@-q!`: `e` (seeds 1-4) and `n` (120000 steps, `TRI_PARAMS` pErr 1e-9)

**Next step (rotation 87, explore): priority 34** (the catcher), which starts from run 0727's two bodies (`p37l.json` `p`
regenerates those worlds). Then 88 build: priority 38. A run that changes outputs runs its checks once and writes the
digests in its pull request.

## Priorities

Done 1-24, 28-30, 32, 33, 36 and 37: ROADMAP backlog A (each with its run and checks; INNOVATIONS has the evidence). The user approved the order
(run 0321): a world that runs indefinitely under steady, labelled drives; the simplest heritable variation; a minimal
competition test.
Open (set by review-intent run 2151; 32 done in core review run 2221, 36 in build run 0727, 37 in build run 1227, which
set 38):
34. [87 explore] **The catcher, shape first** (theory first). A head whose front became `C@` takes the second cell's place
    on host fronts and carries no lock. Run 0727 saw the shape answer twice in the line's world (`PAW=2`): catchers took
    most second cells in 4 of 8 worlds, and the two that lived put a guarded lock on a cell's own side (the host head,
    `I!i@&c@`, seed 1; the catcher itself, `C@f!F@&`, seed 5, roles swapped); the two that died kept no guarded lock on
    any cell. Derive why the lock goes where it does (which cell's own kind it raises, who pays for a plug), predict
    which cell keeps it from the order of errors, then an entry test: catchers entered into a public world with and
    without hosts carrying `z!` on their own side. Only then whether anything else is needed.
38. [88 build] **A lock that pays its bearer, for two classes under copy error** (IDEAS "Two locks on one carrier").
    Run 1227: two locks on one carrier hold two classes without copy error, but each is a public good on the carrier
    (its kids catch carriers, never raise them), so copy error removes one; heads that raise each other (`Z@&c@|y!`,
    `Y@&c@|z!`) are one error from a guarded nursery of their own kind, which wins. Theory first: what makes a class
    unable to drop the other (each must gain from the other more than from raising itself); candidates: an obligate
    class whose host gains from it (in the two-lock mix Y needs Z, Z does not need Y), a lock whose kid raises carriers
    (a carrier with a root, the catcher's shape: priority 34 first), space. Only then a run.
31. [later] **Shape inside the loop.** Every class is one shape, so the loop is turnover of letters; 37 (done, run 1227:
    two locks hold two classes until copy error parts them) was its first concrete case. Others: a head with a second site of its own, a third cell that covers the site (length as defence).
25. [later] **Length without sinks.** Chains of second cells arise by one mutation (an attach letter that complements a
    seed site) and preceded both collapses in run 0121 and all four in run 0551's control; a lysing site at the chain's
    tip stops them. Length as a function needs a chain that lets go (an `&` at its end) or a third cell that covers an
    open site (length as defence). Designed, not demonstrated.
26. [later] Killing as a frequency-dependent enemy: the root-lysing seed site `z!` is the first killer to arise; it spread
    as a cheat, not as a predator, and guards against chains (run 0551).
Frozen: the 47-type organism (feeding, candidate (n), the front sink, lysis in the lineage); its genome copying left the
core in run 2221 (git `1284bb4`); `budpool`, `closure` and `lysis` keep its kit. Not taken from run 1750's list: (b) diets of different length and (c) more
diets than blanks (run 1150's R* rule again).

Rotation (autorun `projects/plywood/rotation.txt`, unchanged by runs 2151, 2221, 0727, 0902 and 1227): 87 explore,
88 build, 89 cleanup, 90 build, 91 explore.

**Core-change candidates:** docs/RULES.md, Core changes, Open candidates ((v) kept as the option `lysJoint`, (t), (s), (r)'s open part, (j), (l); settled there: (f),
(k) and the done ones, (u) and (w) in run 2221).

**Open follow-ups (not priorities; take when a run's kind fits).**
- Core review: the convention of reading a partner's current state is now used only by binding (the chain rules'
  same-pass reads left with them, run 2221; RULES, Locality audit). `pBond` is never below 1 (removing it changes the
  random stream only: take it with a change that changes outputs anyway).
- Speed (run 1721): a supply drive that keeps its stock outside the world, about 1.6x early in a run, changes
  outputs; decide it in a `build` that changes the setup.
- Suite time: 87 minutes per part in run 0902's container (69 checks); lone blocks' physics is most of it (`_overlap`
  30%, `_pairs` 15%, `tryMove` 13% in a `PAW=2` world; a cell-distance cut in `_pairs` would rarely skip a cell: the
  pair reach, 1.39, is about a cell, 1.4). Worlds shared between checks: only `race`/`seal-evolve` had one setting
  (`pair-mut` reads a result line, which a longer world does not repeat).
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
                                                   # CHECK_SAVE=dir keeps each world's output; each line ends [same] etc.
                                                   # against main's digests (tri/digests.txt)
node tri/check.js --write [id ...]                  # ... and rewrite the digests of the worlds run (a PR that changes outputs)
node tri/check.js --write --from runs/a            # digests from a CHECK_SAVE directory, nothing run
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
node tri/check.js --cmd two-locks two-locks-c two-locks-y
                                                   # run 1227: two classes on the two-lock carrier C@y!z|! (the mix from a
                                                   # Y majority), one carrier per class, the copied-side class alone
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
