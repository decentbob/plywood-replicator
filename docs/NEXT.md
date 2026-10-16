# Next instance: start here

State on 2026-10-16 (after autorun run 20261016-1602, explore). Read AGENTS.md first (rules of work), then this file.
History: docs/INNOVATIONS.md (newest first), RULES (Core changes), ROADMAP backlog A (the pair's done priorities 1-24,
28-30, 32-34, 36 and 37, each with its run and checks), the autorun log, and git: each run's handoff is this file at its merge
(`git log -p docs/NEXT.md`; run 1951's slice record with its predictions at `explore-1951`'s WIP commits); the
review-intent Direction of run 0751 in full at `a2f3914`, the pair Direction of run 1850 at `20e9a88`; the latest
direction check: IDEAS "Eight slices on the lock" (run 2151); run 2221's slice record (goal, predictions, stop rule,
progress) at its WIP commits on `core-review-2221`; run 0727's (priority 36) on `build-0727`, run 1227's (priority 37,
predictions P1-P6) on `build-1227` and run 1602's (priority 34: theory, P1-P8 with the restated theory, progress) on
`explore-1602` (`git log -p docs/NEXT.md`).

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
between them and both turning their letters.

**Slice in progress (autorun run 20261016-1902, build; priority 38): which lineage carries the lock.**
Goal: say what decides which of the two lineages (nursery and filler, IDEAS "The catcher") holds the lock, test it by
entry, and turn what holds into checks. Done when the theory's predictions are read against entry worlds (4 each) and
any capability that holds 3 of 4 has a check. Stop when the entry tests are read; no new long batches beyond E6's 8
worlds (regenerated as `runs/p34f.json` for the new reader `node tri/census.js --shape`).
Theory (written after reading h1 and h2 of E6 to 60k with the new reader, before any entry test):
- T1 **A lock is private when the copy its site makes binds back there**: the site is the complement of its cell's own
  root and the cell's only copied side. The filler's root is vestigial: its `&` side is spent when the body completes,
  so it is never bound and never copied, and its letter drifts (h1: Z, m, P by 50k; h2: Z, S, G, Y by 60k).
- T2 **The nursery's cheat is a head whose site turned** (`Y@&c@|y!` to `Y@&c@|m!`, one error): it is raised as a kid
  (root Y) but its own copies go free and bind other Y nurseries' sites by a joint (the guard does not lyse them), and
  it never waits on its own site. Seen: such public heads held 60-75% of head-shaped cells from 15k in h1 and h2, the
  guarded nursery 20-30%: a mix, since the cheat is born only on the nursery's sites.
- T3 **The two lineages are one cell up to letters**: the head nursery (root, front `c@`, site) and a catcher-shaped
  nursery (front `C@`, site, root) are rotations of each other, as are their plain fillers. So neither shape is favoured;
  what decides is letters: a nursery's kids need free cells of the other shape, and a filler whose vestigial root is a
  nursery's letter is raised on that nursery's sites (h2 at 60k: catcher-shaped cells with root Y).
Predictions (entry tests `runs/p38a.json`: the founder `Y@&c@|y! C@|-Z@&`, no copy error, 10 bodies at 20k, 120k):
- P1 `a`, both cells locked (`Y@&c@|y! C@|x!X@&`): the X lineage is lost, 4 of 4 (its kids wait for a free head-shaped
  cell, which no Y nursery makes).
- P2 `b`, an X catcher nursery with plain fillers of root Y (`Y@&c@|- C@|x!X@&`): the fillers also take Y nurseries' sites
  (T3), so the lock moves to the catcher shape: X nurseries on most catcher-shaped cells and Y nurseries on less than a
  quarter of head-shaped cells at 120k, 3 of 4.
- P3 `w`, the same with fillers of root W (`W@&c@|- C@|x!X@&`): the two systems share nothing but blanks and space, so
  both hold to 120k (each 10% or more of bonded cells), 3 of 4: two classes in each shape at once.
- P4 `m`, the founder's fillers of root X (`Y@&c@|y! C@|-X@&`) against `b`'s entry: each system's fillers take the other's
  sites, so the common one wins: X entered rare is lost, 3 of 4.
- P5 `c`, the founder alone without copy error: alive 4 of 4 at 120k.
Read (19:40): P1 yes (X lost 4 of 4). P2 no: the X catcher nursery was lost (4 of 4), and its fillers, plain heads of
root Y, became the Y nursery's cheats: plain heads 70-80% of head-shaped cells from 35-45k to 120k, the guarded
nursery 18-30%, 4 of 4 (T2's mix without copy error). P3 no: the X system with fillers of root W, which share nothing
with the Y system, was lost too (4 of 4 by 25k). P4: X lost 4 of 4 (as in P3, so not for P4's reason), the same cheat
mix as `b`. P5 yes (the guarded nursery on every head-shaped cell at every census, 4 of 4).
E6 by shape (`runs/p34f`, 8 worlds, 48 censuses each): the nursery shape keeps the lock (guarded or plain nurseries on
most of its cells) in 0-19 censuses; on neither shape in 26-45; the lock on the other shape in h2 (110-120k) and f3
(from 110k) only. The common state is T2's mix: guarded nurseries 10-30% of their shape, site-turned heads the rest;
a nursery in a new root letter sweeps now and then (h1 145k G, h2 165k J, h3 65k h, 105k F; f1 95k P, 185k l; f2
155k n, 215k s) and its own cheats follow within 5-20k. The filler shape's root took the nursery's letter (a mimic,
raised on the nursery's sites) in h2-h4, f2-f4.
Restated (T4, before `p38b`): **a nursery whose filler is made only by its own kind has an Allee effect**: a kid's filler
comes from nearby bodies of its system (free parts decay within 100 steps), so a rare system's kids wait longer, and
two such systems exclude each other: whichever is common wins. P6 `we` (one X body with a W filler beside the Y
founder at step 100): one system lost by 120k in 3 of 4, X winning at least once. P7 `wq` (10 X bodies at step 100):
the Y founder's system lost, 3 of 4.

**Handoff status (autorun run 20261016-1602, explore): done; the catcher derived and tested by entry, three checks**
(INNOVATIONS 2026-10-16, explore; IDEAS "The catcher"). No rule, demo or structure change. New checks `catcher-mix`,
`catcher-letter`, `catcher-letter-z` (4 of 4 each, digests written); no other check world changed. `tri/linechart.js`
takes `LC_MAX` (bars as head counts); `tri/siteprobe.js` is a preload that prints what holds the host nurseries' own
sites. Nothing is running. The worlds behind every number are regenerated with `node tri/batch.js runs/NAME.json` from these files
(env always `PAW` 2 and `TRI_NOPIC` 1; read with `node tri/census.js --pool --joint`; 5-18 minutes per world):
- `r0.json`: steps 160000, `s` seeds 1, 5, 7, 2 (run 0727's worlds, regenerated)
- `p34a.json`: steps 120000, `TRI_PARAMS` `{"pErr":1e-9}`; `e1` (`PA3` `Z@&c@|- C@|-Z@&`), `e2` (`PA2` `Z@&c@|z! C@-z|!`,
  `PA3` `Z@&c@|z! C@|-Z@&`), `e3` (`PA3` `Z@&c@|- C@|z!Z@&`), `e4` (10000 steps, `PA2` `Z@&c@|z! C@|z!Z@&`), `c1` (nothing
  else), `c2` (`PA2` `Z@&c@|z! C@-z|!`); every `PA3` with `PA3T` 20000, `PA3N` 10; seeds 1-4 each
- `p34c.json`: the same head with `PA3T` 20000, `PA3N` 10: `ny` (`PA2` `Y@&c@|y! C@-q!`, `PA3` `Y@&c@|y! C@|-Z@&`), `nz`
  (the same in Z: `Z@&c@|z! C@-q!`, `Z@&c@|z! C@|-Z@&`), `kf` (`PA3` `Z@&c@|- C@|f!F@&`)
- `p34d.json`: as `p34c.json` with the second cell `C@-q|!`: `my` (Y) and `mz` (Z) (the checks `catcher-letter(-z)` at 60k)
- `p34e.json`: steps 160000, `TRI_PARAMS` `{"pErr":1e-9}`, `PA1` 1, `PAEN` 10: `kc` and `hc` (`PA3` `Z@&c@|- C@|-Z@&`, `PA3T`
  20000, `PA3N` 10, `PA1T` 60000, `PAKR` `Z@&c@|-` with `PAKS` `C@|f!F@&`, or `PAKR` `Y@&c@|y!` with `PAKS` `C@-z|!`) and
  `hp` (`PA1T` 20000, `PAKR` `Y@&c@|y!`, `PAKS` `C@-z|!`)
- `p34b.json`: steps 240000, `k` seeds 1-8 (`PA3` `Z@&c@|- C@|-Z@&`, `PA3T` 20000, `PA3N` 10; copy error on)
- `p34f.json`: steps 240000, `h` (`PA2` `Y@&c@|y! C@|-Z@&`) and `f` (`PA2` `F@&C@|f! c@|-Z@&`), seeds 1-4 (copy error on)

**Next step (rotation 88, build): priority 38**, now with a candidate from this run: the nursery and its filler as two
lineages (IDEAS "The catcher", last bullets; E6 above). Then 89 cleanup. A run that changes outputs runs its checks once
and writes the digests in its pull request.

## Priorities

Done 1-24, 28-30, 32-34, 36 and 37: ROADMAP backlog A (each with its run and checks; INNOVATIONS has the evidence). The user approved the order
(run 0321): a world that runs indefinitely under steady, labelled drives; the simplest heritable variation; a minimal
competition test.
Open (set by review-intent run 2151; 32 done in core review run 2221, 36 in build run 0727, 37 in build run 1227, which
set 38, 34 in explore run 1602):
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
    in 7 of 8, but the lock moved between the two lineages and both turned their root letters. Next: what decides
    which lineage carries the lock at a time (theory first: who gains from a lock raising its own kind against one
    raising the other shape), and whether the two-shape body holds two classes in each shape at once.
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

Rotation (autorun `projects/plywood/rotation.txt`, unchanged by runs 2151, 2221, 0727, 0902, 1227 and 1602): 88 build,
89 cleanup, 90 build, 91 explore.

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
