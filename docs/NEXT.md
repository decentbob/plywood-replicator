# Next instance: start here

State on 2026-10-16 (after autorun run 20261016-2102, cleanup). Read AGENTS.md first (rules of work), then this file.
History: docs/INNOVATIONS.md (newest first), RULES (Core changes), ROADMAP backlog A (every done priority with its run
and checks), the autorun log, and git: each run's handoff is this file at its merge (`git log -p docs/NEXT.md`); a
slice record with its predictions is on its run's branch (`build-1902`, `explore-1602`, `build-1227`, `build-0727`,
`core-review-2221`, `explore-1951`); the latest direction check is IDEAS "Eight slices on the lock" (run 2151).

**Goal (user, 2026-10-05): complex evolution** (AGENTS.md, IDEAS); the organism that feeds its bud is a direction.
Since review-intent run 1850 the vehicle is **the pair** (2 cells, 2 types; IDEAS "Sources in proportion to use"): every
cell of a body exposes exactly one copyable side, so part types are made in the proportion buds use them. The 47-type
organism lineage is frozen; it returns as the complex end once the pair world varies and competes.
Where the line stands (runs 1351-1902; INNOVATIONS has the numbers, IDEAS the reasoning): recognition is one glue pair
and copy error changes one side, so **a lock its carrier needs is frozen** and only a lock its carrier does not need
turns ("Who pays for a lock"). Public locks turn but the core's trap lyses keys and plugs alike; a trap that does not
lyse across a joint (`lysJoint`, candidate (v), default 0; on in the line's world `PAW=2`) guards them. **A lock stays
only where it pays its bearer**: guarded nurseries (own side the root's complement with `!`) live, plain ones die ("A
nursery guards itself"); two locks on one carrier hold two classes until copy error sheds one ("Two locks on one
carrier"); catchers (a head with its front letter turned) take the second cell's place, and the lock moves onto a
root-bearer of either shape as a nursery in a new letter ("The catcher"). Run 1902 ("The lock is reborn from its
cheats"): a head of the nursery's root that does not raise itself is its cheat and holds 70-80% beside it; two nursery
systems exclude each other (an Allee effect); under copy error every lock is transient and a new nursery comes from a
root error in a copy made at a public cell's site, sometimes on the other shape (the lock changed lineage).

**Slice in progress (autorun run 20261016-2151, build; priority 38): a nursery that keeps its kin's births from its
cheats.** Goal: a design within the core in which a head that raises nobody cannot hold a nursery's site; done when it
lives in 3 of 4 worlds, the cheat is lost in 3 of 4, and a check holds it. Stop: if the design's own one-error cheat
holds a mix as before, record why and stop.
- M1 (measured, `tri/raceprobe.js` on `nursery-mix` seeds 1-2 to 60k): after a kid leaves, the nursery wins 33-37% of
  the races for its site; the site stays empty 110-130 steps whoever takes it; copies left by the cheat kid that just
  left take 5-10% of the cheat's wins: **the cheat wins by the free copies of whole cheat bodies elsewhere** (34-41
  copies per cheat per 10k steps, about 90% decay unbound), not by place. NEXT's "leftover copies" guess is wrong.
- T1: recognition is one glue pair, so a site cannot tell its kin from a head of the same root; the race is flux. With
  free cheats' density proportional to cheats m times their lifetime tau, and blanks reaching the site and the cheats'
  plain sides alike, the blank density cancels: the nursery's win share p = 1/(1 + k m tau), and at steady state
  m/n = (1-p)/p gives **n* = 1/(k tau): the nursery's number is fixed by how long free cheats live**, not by the cheats'
  number or the blank supply (not yet tested).
- T2 (design, "the kid raises before it leaves"): drop the filler. A head `Y@&y@!y@!` (root, two guarded sites of its
  root's complement, both attach sides) hears the open signal while either site is empty, so a kid stays on its parent
  until both its sites hold kids, and leaves carrying them. A head that raises nobody has no open side: it lets go a pass
  after it binds, alone, a free triangle with a spent root that is never a template. So the old cheat cannot hold a
  site; the least cheat must raise one kid of its own in place first (`Y@&y@!-`, one site and a plain side copied
  always), and alone it cannot grow (its one kid's leaving frees it). One type, no filler.
- Predictions (written before `runs/sc.json` ran): P1 `Y@&y@!y@!` alone lives 4 of 4 to 60k with most material bonded;
  P2 the one-site cheat entered (10 bodies at 20k) stays below half of cells in 3 of 4 at 80k (it still wins races by
  free copies, but its kid must raise first and it cannot grow alone); P3 under copy error (pErr 0.01, 120k) alive 4 of
  4 and the two-site nursery of the root on most cells at 120k in 3 of 4.
- Read: P1 yes (4 of 4, 988-996 of about 1000 triangles bonded at 60k, one type). P2 no: the one-site cheat
  `-Y@&y@!` took 64-70% of cells by 30k and held to 80k (4 of 4; the nursery 190-327 cells): the same flux mix, the
  nursery a little larger than the old one's 20-31%. Stop rule met for the design; T1 is the question now.
  P3 no: under copy error dead 4 of 4 by 15-20k. A site of a letter no root carries (`Y@&s@!y@!`, `Y@&y.@q@!`) is an
  open front nothing fills: its cell never lets go of its parent, so it holds the parent's site for good, and with a
  close-only or plain side it sprays free copies meanwhile (`Y@&y.@q@!` 125 of 209 bonded at 15k, then none).
- P4 (T1, written before `runs/tau.json` ran; decay every PADI steps, so free parts live about PADI/2): the nursery's
  cell count about doubles with PADI 50 and halves with PADI 200, in both designs (`h50`, `h200`; `m50`, `m200` the old
  head and cheat), and stays near `h`'s 190-330 with twice the blanks (`hb`, PAB 2000), the cheat taking the extra
  material; 3 of 4 worlds each.
- Read (`runs/tau.json`): the old design follows T1: guarded nursery heads 175-272 at PADI 50 and 33-72 at PADI 200,
  against 85-118 at the default 100 (40-80k, 4 of 4 each); the cheat's count about the same (208-330). The new design
  does not: the nursery 187-253 cells at PADI 200 (as at 100), at PADI 50 the cheat was lost in 3 of 4 and in the fourth
  held the same 1:2 mix; with twice the blanks both doubled (nursery 395-516, cheat 1009-1075): a fixed ratio. Likely
  why: its free cheat copies are binding-limited (every waiting cell has an open site to take them), not decay-limited.
- P6 (T1 on the old design, written before `runs/tau2.json` ran): with PAB 2000 at PAS 50 (`mb`) the guarded nursery
  stays at 85-120 heads at 60-80k and the cheat about doubles; with PAS 71 and PAB 2000 (`ma`: twice the area, the same
  density) the nursery doubles (170-240); 3 of 4 each.
- P7 (the access a in T1, written before `runs/cap.json` ran): a smaller capture radius (0.45 instead of 0.6, a core
  parameter, so everything binds less often) raises the guarded nursery by 1.3-1.8 times at 60k (110-190 heads), 3 of 4.
- Read: P6 half: area yes (`ma` 178-248 at 60-80k, about 2x), supply no (`mb` 160-195, 1.6-1.9x, with the same mean
  free blank pool, 56, as at PAB 1000: not b; crowding or the free cheats' binding elsewhere must shorten their reach).
  P7 yes in 3 of 4 (150-228 at 60k, 1.5-2.2x). Checks `nursery-decay` and `self-nursery` written (4 of 4 each).
- P8 (under copy error, written before `runs/tl.json` ran): the two-lineage world (`two-lineages`' command) with PADI
  50 has a lock (G+N on most of a shape's cells, `census.js --shape`) in 4 or more of the 21 censuses from 20k to 120k
  in 3 of 4 worlds, against 0-3 in the check's worlds at PADI 100 (`tl0`, regenerated beside it).
- Running: `node tri/batch.js runs/sc.json` (env `PAW` 2, `TRI_NOPIC` 1, `PA2` `Y@&y@!y@! Y@&y@!y@!`, `TRI_PARAMS`
  `{"pErr":1e-9}`; `a` alone 60k, `h` with `PA3` `Y@&y@!- Y@&y@!-` `PA3T` 20000 `PA3N` 10 to 80k, `e` with `pErr` 0.01 to
  120k; seeds 1-4).

**Handoff status (autorun run 20261016-2102, cleanup): done; no rule or output change** (INNOVATIONS 2026-10-16,
cleanup; the `lysis` demo's unused debug print `LYDBG` removed, check `lysis` same as its digest). NEXT shortened
(the line's history is in INNOVATIONS and IDEAS), ROADMAP's retired genome-copying rows folded into one (their last
text at `9b590df`), check count and suite time corrected (79 checks, about 87 minutes per part), a retired known issue
removed. Nothing is running. Run 1902's worlds (priority 38's first step; INNOVATIONS 2026-10-16, build) are
regenerated with `node tri/batch.js runs/NAME.json` from these files (env always `PAW` 2, `TRI_NOPIC` 1 and the founder
`PA2` `Y@&c@|y! C@|-Z@&`; read with `node tri/census.js --shape`; 3-7 minutes per world):
- `p34f.json` (run 1602's E6): steps 240000, `h` seeds 1-4 (that founder) and `f` (`PA2` `F@&C@|f! c@|-Z@&`), copy error on
- `p38a.json`: steps 120000, `TRI_PARAMS` `{"pErr":1e-9}`, `PA3T` 20000, `PA3N` 10: `a` (`PA3` `Y@&c@|y! C@|x!X@&`), `b`
  (`Y@&c@|- C@|x!X@&`), `w` (`W@&c@|- C@|x!X@&`), `m` (`PA2` `Y@&c@|y! C@|-X@&` with `b`'s `PA3`), `c` (`PA3` empty); seeds 1-4
- `p38b.json`: as `w` with `PA3T` 100: `we` (`PA3N` 1) and `wq` (`PA3N` 10)
- `p38c.json`: steps 80000, as `p38a`: `p` (`PA3` `Y@&c@|- C@|-Z@&`) and `s` (`Y@&c@|m! C@|-Z@&`)

**Next step (rotation 90, build): priority 38, a nursery that keeps its kin's births from its cheats.**
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
Open (set by review-intent run 2151; since then 32, 36, 37 and 34 done, 38 set by run 1227, its first step done in
run 1902):
38. [90 build] **A lock that pays its bearer, for two classes under copy error** (IDEAS "Two locks on one carrier",
    "The catcher", "The lock is reborn from its cheats"). Each class must gain from the other more than from raising
    itself. Run 1602's candidate: a nursery cell (root X, own site x!, copied only there) and its filler (another root,
    a plain copied side, made only by being caught on a nursery front) need each other; under copy error the two
    shapes held in 7 of 8 worlds, but the lock moved between them. Run 1902 (first step): the nursery's cheat holds
    70-80% beside it, two nursery systems exclude each other, and every lock is transient. Next: a nursery that keeps
    its kin's births from its cheats (the next step above).
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

Rotation (autorun `projects/plywood/rotation.txt`, unchanged since run 2151): 90 build, 91 explore, 92 build.

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
