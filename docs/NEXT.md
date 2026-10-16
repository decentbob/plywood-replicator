# Next instance: start here

State on 2026-10-16 (after autorun run 20261016-2151, build). Read AGENTS.md first (rules of work), then this file.
History: docs/INNOVATIONS.md (newest first), RULES (Core changes), ROADMAP backlog A (every done priority with its run
and checks), the autorun log, and git: each run's handoff is this file at its merge (`git log -p docs/NEXT.md`); a
slice record with its predictions is on its run's branch (`build-2151`, `build-1902`, `explore-1602`, `build-1227`, `build-0727`,
`core-review-2221`, `explore-1951`); the latest direction check is IDEAS "Eight slices on the lock" (run 2151).

**Goal (user, 2026-10-05): complex evolution** (AGENTS.md, IDEAS); the organism that feeds its bud is a direction.
Since review-intent run 1850 the vehicle is **the pair** (2 cells, 2 types; IDEAS "Sources in proportion to use"): every
cell of a body exposes exactly one copyable side, so part types are made in the proportion buds use them. The 47-type
organism lineage is frozen; it returns as the complex end once the pair world varies and competes.
Where the line stands (runs 1351-2151; INNOVATIONS has the numbers, IDEAS the reasoning): recognition is one glue pair
and copy error changes one side, so **a lock its carrier needs is frozen** and only a lock its carrier does not need
turns ("Who pays for a lock"). Public locks turn but the core's trap lyses keys and plugs alike; a trap that does not
lyse across a joint (`lysJoint`, candidate (v), default 0; on in the line's world `PAW=2`) guards them. **A lock stays
only where it pays its bearer**: guarded nurseries (own side the root's complement with `!`) live, plain ones die ("A
nursery guards itself"); two locks on one carrier hold two classes until copy error sheds one ("Two locks on one
carrier"); catchers (a head with its front letter turned) take the second cell's place, and the lock moves onto a
root-bearer of either shape as a nursery in a new letter ("The catcher"). Run 1902 ("The lock is reborn from its
cheats"): a head of the nursery's root that does not raise itself is its cheat and holds 70-80% beside it; two nursery
systems exclude each other (an Allee effect); under copy error every lock is transient and a new nursery comes from a
root error in a copy made at a public cell's site, sometimes on the other shape (the lock changed lineage). Run 2151
("One encounter against two"): a site cannot tell kin from cheat; the cheat wins with free copies from afar, so the
nursery's number is set by how long free cheats live (and by area and access), not by the cheats.

**Handoff status (autorun run 20261016-2151, build): done; no rule or output change** (INNOVATIONS 2026-10-16, build;
IDEAS "One encounter against two"; the slice record with predictions P1-P8 is this file on branch `build-2151` at its
merge). Priority 38's second step settled by measurement and theory, no design kept: a site cannot tell kin from a
cheat of its root; the cheat wins races with free copies from afar (`tri/raceprobe.js`: the leaving kid's copies take
4-8% of its wins); the nursery's kid needs one encounter, the cheat's two, so the guarded nursery's number is set by
how long free cheats live (PADI 50 / 100 / 200: 175-272 / 85-118 / 33-72 heads, 4 of 4; check `nursery-decay`), by area
(2x) and access (capture 0.45: 1.5-2.2x), not by the cheats' number; crowding is outside the law (twice the material
in the same area: 1.6-1.9x, predicted no change). Under copy error PADI 50 gave more lock censuses (27 of 84 against
10) but the lock stays transient (1 of 4 worlds above 3 of 21). The one-type nursery `Y@&y@!y@!` (a kid lets go only
once both its sites hold kids; check `self-nursery`) keeps the no-site cheat out, but its one-site cheat holds 64-70%
and under copy error it dies of site mutants that never let go (4 of 4 by 20k). Two checks added (81). Nothing is
running. This run's worlds are regenerated with `node tri/batch.js runs/NAME.json` from these files (env always `PAW` 2
and `TRI_NOPIC` 1; read the old design with `node tri/census.js --shape`, the new from its `types:` lines; 2-11 minutes
per world):
- `sc.json`: `PA2` `Y@&y@!y@! Y@&y@!y@!`, `TRI_PARAMS` `{"pErr":1e-9}`: `a` 60000 steps; `h` 80000 with `PA3`
  `Y@&y@!- Y@&y@!-`, `PA3T` 20000, `PA3N` 10; `e` 120000 with `TRI_PARAMS` `{"pErr":0.01}`; seeds 1-4
- `tau.json`: steps 80000, `TRI_PARAMS` `{"pErr":1e-9}`, `PA3T` 20000, `PA3N` 10: `h50`, `h200` (as `h`, `PADI` 50, 200),
  `hb` (as `h`, `PAB` 2000), `m50`, `m200` (`PA2` `Y@&c@|y! C@|-Z@&`, `PA3` `Y@&c@|- C@|-Z@&`, `PADI` 50, 200)
- `tau2.json`: as `m50` without `PADI`, `PAB` 2000: `mb`, and `ma` with `PAS` 71; `cap.json`: as `mb` at `PAB` 1000 with
  `TRI_PARAMS` `{"pErr":1e-9,"capture":0.45}`, 60000 steps: `mc`
- `tl.json` / `tl0.json`: steps 120000, `PA2` `Y@&c@|y! C@|-Z@&` (copy error on): `t50` (`PADI` 50) and `t100`
- the probe on `nursery-mix` seeds 1-2: `RP_T0=25000 NODE_OPTIONS='-r ./tri/raceprobe.js'` with that check's command

**Next step (rotation 91, explore): priority 38, close T1's crowding gap, then the recess on paper.** Theory first:
twice the material in the same area raised the nursery 1.6-1.9 times with the same free blank pool, so crowding
shortens the free cheats' reach or life in a way T1 leaves out. Measure the fate of free cheat copies (bound to a site,
decayed, after how many steps and how far from their template; add a fate count to `tri/raceprobe.js`) at `PAB` 1000 and
2000 and at PADI 50, and restate T1 with an effective life before any design. Then design on paper (cell count, kit,
fronts, what is copied where) the body that hides its own side in a notch of itself (IDEAS "One encounter against two":
n* should rise as 1/a), and say whether it can be built and copied with the core; a run only if the design is short.
An explore may also question the frame: under copy error every lock has been transient for five slices; a direction
check (review-intent, rotation 100) is near.

## Priorities

Done 1-24, 28-30, 32-34, 36 and 37: ROADMAP backlog A (each with its run and checks; INNOVATIONS has the evidence). The user approved the order
(run 0321): a world that runs indefinitely under steady, labelled drives; the simplest heritable variation; a minimal
competition test.
Open (set by review-intent run 2151; since then 32, 36, 37 and 34 done, 38 set by run 1227, its first step done in
run 1902, its second in run 20261016-2151):
38. [90 build] **A lock that pays its bearer, for two classes under copy error** (IDEAS "Two locks on one carrier",
    "The catcher", "The lock is reborn from its cheats"). Each class must gain from the other more than from raising
    itself. Run 1602's candidate: a nursery cell (root X, own site x!, copied only there) and its filler (another root,
    a plain copied side, made only by being caught on a nursery front) need each other; under copy error the two
    shapes held in 7 of 8 worlds, but the lock moved between them. Run 1902 (first step): the nursery's cheat holds
    70-80% beside it, two nursery systems exclude each other, and every lock is transient. Run 2151 (second step): the
    cheat wins the site by flux (one encounter against two), the nursery's number is set by the free cheats' life, area
    and access; no design within the core keeps the cheat off the site. Next: crowding in the law, then the recess on
    paper (the next step above).
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

Rotation (autorun `projects/plywood/rotation.txt`, unchanged since run 2151): 91 explore, 92 build, 93 explore.

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
                                                   # (4 processes; about 1.5 hours per part: as two background jobs,
                                                   # --part 2/2 started from --part 1/2's notification, from a worktree
                                                   # if you edit code meanwhile);
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
node tri/check.js --cmd nursery-decay self-nursery   # run 2151: the nursery at PADI 50 (its number set by the free
                                                   # cheats' life); the one-type nursery Y@&y@!y@! alone
RP_T0=25000 NODE_OPTIONS='-r ./tri/raceprobe.js' ... # run 2151: 'race:' lines every 10000 steps: who takes a guarded
                                                   # site after a kid leaves, how long it was empty, the taker's origin
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
