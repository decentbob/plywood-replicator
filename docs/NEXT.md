# Next instance: start here

State on 2026-10-16 (after autorun run 20261016-1902, build). Read AGENTS.md first (rules of work), then this file.
History: docs/INNOVATIONS.md (newest first), RULES (Core changes), ROADMAP backlog A (the pair's done priorities 1-24,
28-30, 32-34, 36 and 37, each with its run and checks), the autorun log, and git: each run's handoff is this file at its merge
(`git log -p docs/NEXT.md`; run 1951's slice record with its predictions at `explore-1951`'s WIP commits); the
review-intent Direction of run 0751 in full at `a2f3914`, the pair Direction of run 1850 at `20e9a88`; the latest
direction check: IDEAS "Eight slices on the lock" (run 2151); run 2221's slice record (goal, predictions, stop rule,
progress) at its WIP commits on `core-review-2221`; run 0727's (priority 36) on `build-0727`, run 1227's (priority 37,
predictions P1-P6) on `build-1227`, run 1602's (priority 34: theory, P1-P8 with the restated theory, progress) on
`explore-1602` and run 1902's (priority 38: T1-T4, P1-P7) on `build-1902` (`git log -p docs/NEXT.md`).

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
bearer, and the most private lock (a guarded nursery of one's own kind) wins.** Run 1602 (IDEAS "The catcher"): the
catcher (a head with its front letter turned) is a cheaper filler of the second cell's place; it takes 77-96% of second
cells and stops there (the lock's carriers keep a minority, likely by place), and the class lives at half its heads. The
lock then moves onto a root-bearer (host or catcher, either) as a nursery **in a new letter**: a nursery in the
catchers' root letter raises them on its own sites, where they wait for a host as filler, and dies (4 of 4); a cell that
raises itself needs a filler copied on a plain side. A private nursery loses in the public world and takes over once
catchers hold it (4 of 4 on each shape). Under copy error the plain nursery comes first and dies unless the guard follows;
from the takeover bodies, head-shaped and catcher-shaped lineages hold together (7 of 8 to 240k) with the lock moving
between them and both turning their letters. Run 1902 (IDEAS "The lock is reborn from its cheats"): a head of the
nursery's root that does not raise itself (plain own side, or a site nothing roots in) is the nursery's cheat: raised on
its sites by a joint, copied free, it holds 70-80% beside a guarded nursery of 20-35%; a nursery system whose filler only
its own kind makes has an Allee effect (two such systems exclude each other, the common one wins, on either shape).
Under copy error the two-lineage body keeps both shapes while every lock is transient: a new nursery comes from a root
error in a copy made at a public cell's site (13 of 15 first rises), on the shape that carries the site, the nursery's
own cheats mostly and twice catchers of them on the other shape (the lock changed lineage).

**Handoff status (autorun run 20261016-1902, build): done; priority 38's first step (which lineage carries the lock),
four checks** (INNOVATIONS 2026-10-16, build; IDEAS "The lock is reborn from its cheats"). No rule, demo or structure
change. New checks `nursery-mix`, `mutualist-rare`, `mutualist-major`, `two-lineages` (4 of 4 each, digests written); no
other check world changed (only readers and check.js changed). `tri/census.js --shape` reads cells by shape and own side
(and where each new nursery letter came from); `tri/linechart.js` `LC_SHAPE=1` draws it. Predictions: P1 yes, P2-P3 no
(the second system was lost, its fillers turned cheats), P4 yes for P3's reason, P5 yes; T4 (Allee) restated, P6, P7
yes. Nothing is running. The worlds behind every number are regenerated with `node tri/batch.js runs/NAME.json` from
these files (env always `PAW` 2, `TRI_NOPIC` 1 and the founder `PA2` `Y@&c@|y! C@|-Z@&`; read with `node tri/census.js
--shape`; 3-7 minutes per world):
- `p34f.json` (run 1602's E6): steps 240000, `h` seeds 1-4 (that founder) and `f` (`PA2` `F@&C@|f! c@|-Z@&`), copy error on
- `p38a.json`: steps 120000, `TRI_PARAMS` `{"pErr":1e-9}`, `PA3T` 20000, `PA3N` 10: `a` (`PA3` `Y@&c@|y! C@|x!X@&`), `b`
  (`Y@&c@|- C@|x!X@&`), `w` (`W@&c@|- C@|x!X@&`), `m` (`PA2` `Y@&c@|y! C@|-X@&` with `b`'s `PA3`), `c` (`PA3` empty); seeds 1-4
- `p38b.json`: as `w` with `PA3T` 100: `we` (`PA3N` 1) and `wq` (`PA3N` 10)
- `p38c.json`: steps 80000, as `p38a`: `p` (`PA3` `Y@&c@|- C@|-Z@&`) and `s` (`Y@&c@|m! C@|-Z@&`)

**Next step (rotation 89, cleanup; then 90 build): priority 38, a nursery that keeps its kin's births from its cheats.**
Theory first: in the cheat mix the cheats win about 3 of 4 nursery-site cycles (S/G = c/(1-c) with equal death rates);
likely because a cheat waiting on a site makes free copies beside it, which take the site when its kid leaves, while
the nursery's own copy needs a blank to touch the empty site (measure: who takes a site after a cheat's kid and after
an own kid leaves; a probe like `tri/siteprobe.js`). Candidates within the core: place (a nursery whose waiting kid
covers its own copied side, or a site the cheat's copies cannot reach first), or a kid that must also bind its
parent's other side (a second recognition the cheat lacks). The site reads only the root letter (locality), so a
design must work by place or by shape, not by reading kin.

## Priorities

Done 1-24, 28-30, 32-34, 36 and 37: ROADMAP backlog A (each with its run and checks; INNOVATIONS has the evidence). The user approved the order
(run 0321): a world that runs indefinitely under steady, labelled drives; the simplest heritable variation; a minimal
competition test.
Open (set by review-intent run 2151; 32 done in core review run 2221, 36 in build run 0727, 37 in build run 1227, which
set 38, 34 in explore run 1602, 38's first step in build run 1902):
38. [88 build] **A lock that pays its bearer, for two classes under copy error** (IDEAS "Two locks on one carrier").
    Run 1227: two locks on one carrier hold two classes without copy error, but each is a public good on the carrier
    (its kids catch carriers, never raise them), so copy error removes one; heads that raise each other (`Z@&c@|y!`,
    `Y@&c@|z!`) are one error from a guarded nursery of their own kind, which wins. Theory first: what makes a class
    unable to drop the other (each must gain from the other more than from raising itself); candidates: an obligate
    class whose host gains from it (in the two-lock mix Y needs Z, Z does not need Y), a lock whose kid raises carriers
    (a carrier with a root, the catcher's shape), space. **Run 1602's candidate** (IDEAS "The catcher"): a nursery cell
    (root X, own site x!, copied only there) and its filler (another root, a plain copied side, made only by being caught
    on a nursery front) need each other: the nursery cannot make its filler by one error (a filler of its own root is
    raised on its sites and deadlocks; one with a plain side, the matching front and another root is three errors away),
    and the filler is caught only on nursery fronts. Under copy error (E6, 8 worlds to 240k) the pair of shapes held
    in 7 of 8, but the lock moved between the two lineages and both turned their root letters. **Run 1902** (first
    step): the lock goes where a public cell's site takes a root error, mostly the nursery's own cheats, sometimes
    catchers of them on the other shape; the nursery's cheat (a head of its root that does not raise itself) holds
    70-80% beside it; two nursery systems exclude each other (an Allee effect), so two classes in each shape at once do
    not hold as two systems. Next: a nursery that keeps its kin's births from its cheats (NEXT's next step).
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

Rotation (autorun `projects/plywood/rotation.txt`, unchanged by runs 2151, 2221, 0727, 0902, 1227, 1602 and 1902): 89
cleanup, 90 build, 91 explore.

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
NODE_OPTIONS='-r ./tri/siteprobe.js' ...           # run 1602: 'probe:' lines every 1000 steps from SP_T0 (20000): what holds
                                                   # the host nurseries' own sites (empty, kid, catcher waiting or filled)
COV_OUT=$PWD/runs/cov.jsonl NODE_OPTIONS="-r ./tri/coverage.js" node tri/check.js   # coverage: marks present, rule
                                                   # events, one JSON line per demo world
node tri/check.js --cmd two-locks two-locks-c two-locks-y
                                                   # run 1227: two classes on the two-lock carrier C@y!z|! (the mix from a
                                                   # Y majority), one carrier per class, the copied-side class alone
node tri/check.js --cmd nursery-mix mutualist-rare mutualist-major two-lineages
                                                   # run 1902: the nursery's cheat mix; a second nursery system lost
                                                   # rare, winning as the majority; the two-lineage body under copy error
node tri/census.js --shape runs/x.txt              # run 1902: cells by shape (H front c@, K front C@) and own side (G
                                                   # guarded nursery, N plain nursery, P plain, S another letter's site);
                                                   # chart: LC_SHAPE=1 node tri/linechart.js out.png FILES
node tri/check.js --cmd catcher-mix catcher-letter catcher-letter-z
                                                   # run 1602: catchers entered hold a mix; a nursery in another letter
                                                   # survives them, one in their root letter dies
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
