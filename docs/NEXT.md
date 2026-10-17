# Next instance: start here

State on 2026-10-17 (after autorun run 20261017-0416, explore). Read AGENTS.md first (rules of work), then this file.
History: docs/INNOVATIONS.md (newest first), RULES (Core changes), ROADMAP backlog A (every done priority with its run
and checks), the autorun log, and git: each run's handoff is this file at its merge (`git log -p docs/NEXT.md`); a
slice record with its predictions is on its run's branch (`explore-0416`, `build-0252`, `explore-2258`, `build-2151`, `build-1902`, `explore-1602`,
`build-1227`, `build-0727`, `core-review-2221`, `explore-1951`); the latest direction check is IDEAS "Eight slices on the
lock" (run 2151).

**Goal (user, 2026-10-05): complex evolution** (AGENTS.md, IDEAS); the organism that feeds its bud is a direction.
Since review-intent run 1850 the vehicle is **the pair** (2 cells, 2 types; IDEAS "Sources in proportion to use"): every
cell of a body exposes exactly one copyable side, so part types are made in the proportion buds use them. The 47-type
organism lineage is frozen; it returns as the complex end once the pair world varies and competes.
Where the line stands (runs 1351-0416; INNOVATIONS has the numbers, IDEAS the reasoning): recognition is one glue pair
and copy error changes one side, so **a lock its carrier needs is frozen** and only a lock its carrier does not need
turns ("Who pays for a lock"). Public locks turn but the core's trap lyses keys and plugs alike; a trap that does not
lyse across a joint (`lysJoint` 1, candidate (v); on in the line's world `PAW=2`) guards them. **A lock stays only where
it pays its bearer**: guarded nurseries (own side the root's complement with `!`) live, plain ones die; catchers take
the second cell's place ("The catcher"); a head of the nursery's root that does not raise itself is its cheat, and under
copy error every lock is transient, lost to its cheats and reborn from them ("The lock is reborn from its cheats"); the
cheat wins the site by flux ("One encounter against two"). Run 2258 ("The nursery's share is the environment's"): the
nursery's share is n* = c rB / (pi rho), where only the free copies' reach rho moves (life, area, crowd), so no body
plan in the core changes it; a recess cannot be built (the two-wall notch is the kid's front's place) and shape is
public (fillers); **candidate (x)**, a lysis side that spares across a joint only a partner carrying the identical side
(`lysJoint: 2`, an option), lets no head that does not raise itself be raised on a guarded site: under copy error the
lock held in every census to 480k (4 of 4), the nursery added flux to place (its front lost the anchor and sprays
kin), and the lock's letters froze. Run 0252 ("Each completes the other"): two guarded nurseries front to front with
leaky fronts (`Y@&c@y! C@x!X@&`) complete each other's kids with copies of their own waiting kids and live with no
filler: **two obligate classes, each with its own heredity**; but a cell that sprays only while it waits never
out-sprays one that sprays always, so a public partner of a foreign root takes the role at any frequency (the guard
traps public cells of its own root only), and under copy error a root error makes one. Run 0416 ("Checking and keeping exclude
each other"): **no body in the core checks the partner it keeps**: a bond that outlasts completion reads one letter, and
the kin check bites only across a joint to a waiting cell; the one checked partner is raised on the host's front and
leaves (D1, dies), and the smallest candidate for a kept one, (y), makes partners that catch their own kind.

**Handoff status (autorun run 20261017-0416, explore): done; no rule, demo, structure or check change; candidate (y)
written and not proposed** (INNOVATIONS 2026-10-17 run 0416; IDEAS "Checking and keeping exclude each other"; RULES (y);
the slice record with predictions P1-P3 is this file at `5e29fa2` on branch `explore-0416`).
- Theory: binding and closure read one glue pair, contact lysis on a bond that is not a joint lyses whatever it holds,
  and (x)'s kin check reads a second feature only across a joint and only on a cell that hears an open front for two
  passes (the joint is cut at the release after completion, before lysis can cut). So a checked bond is a joint to a
  waiting cell and a kept bond is read by one letter; every kept structure is public.
- D1, the one checked partner (host `Y@&c@!y!` raises `C@&c@!-|` or `C@&c@!-` on its front as kin): dies in the line's
  world (0 of 8 at 40k); with the per-individual hazard or none it dies or ends as a frozen mass of waiting kids (16
  worlds). Every bond is a joint, so nothing keeps the host. A stranger on the kid's front kills the kid.
- Candidate (y) (kin check on every bond) as a throwaway (`lysJoint` 3, not committed; the patch is in RULES (y) item 4):
  a kept partner must carry the host's side, so it catches its own copies; the fan freezes at 9-10 cells (0 of 8).
- Under the guard a head's front is not part of its kin, so the front letter (which partner the kids take) is the
  guarded lineage's one heritable trait that varies without cheats; it is frozen while the lineage needs its partner.
- Nothing is running. Worlds regenerate with `node tri/batch.js runs/NAME.json` (env always `PAW` 2, `TRI_NOPIC` 1,
  `TRI_PARAMS` `{"pErr":1e-9,"lysJoint":2}`):
  - `p1.json` (40k): `da` (`PA2` `Y@&c@!y! C@&c@!-|`), `db` (`PA2` `Y@&c@!y! C@&c@!-`); seeds 1-4
  - `p2.json` (30k, `PA2` as `db`): `e1` (`PAHU` 2), `e0` (`PAHT` 1e9), `z1` and `z2` (`PAHT` 1e9, `PA3N` 10, `PA3T` 10000, `PA3`
    `Y@&c@!y! C@&-|-` and `Y@&c@!y! C@&z@|-`)
  - `p3.json` (20k, `lysJoint` 3 on a patched copy of `tri/`, `node runs/ytri/batch.js`): `r1` (`PA2` `Y@&c@!y! C@c@!-|`),
    `r2` (`PA2` `Y@&c@!y! C@-|c@!`)

**Next step (rotation 94, review-intent): the direction check.** Weigh priority 38 as it stands: the guard keeps one
lineage's lock under copy error (frozen), two obligate classes live (run 0252) but a kept partner is public in the core
(this run), so two-class locks have reached the core's limit. Choose the line's next vehicle: (a) the public partner as
given, selecting on what partners do through place (heredity of combinations is locality, IDEAS run 1322), from the
copy-error end state (one guarded lineage with a rootless partner `C@s!T`, `C@|R!I` that drifts in two free sides:
`node tri/check.js --cmd mutual-pair-evolve`, run to 240k); (b) a core change on the keeping side (when a joint lets go),
not designed; (c) leave locks for another capability (ROADMAP backlog). The core review (rotation 95) decides (x).

## Priorities

Done 1-24, 28-30, 32-34, 36 and 37: ROADMAP backlog A (each with its run and checks; INNOVATIONS has the evidence). The user approved the order
(run 0321): a world that runs indefinitely under steady, labelled drives; the simplest heritable variation; a minimal
competition test.
Open (set by review-intent run 2151; since then 32, 36, 37 and 34 done, 38 set by run 1227, its first step done in
run 1902, its second in run 20261016-2151, its third in run 20261016-2258, its fourth in run 20261017-0252, partner
choice settled on paper in run 20261017-0416):
38. [94 review-intent] **A lock that pays its bearer, for two classes under copy error** (IDEAS "Two locks on one carrier",
    "The catcher", "The lock is reborn from its cheats"). Each class must gain from the other more than from raising
    itself. Run 1602's candidate: a nursery cell (root X, own site x!, copied only there) and its filler (another root,
    a plain copied side, made only by being caught on a nursery front) need each other; under copy error the two
    shapes held in 7 of 8 worlds, but the lock moved between them. Run 1902 (first step): the nursery's cheat holds
    70-80% beside it, two nursery systems exclude each other, and every lock is transient. Run 2151 (second step): the
    cheat wins the site by flux (one encounter against two), the nursery's number is set by the free cheats' life, area
    and access; no design within the core keeps the cheat off the site. Run 2258 (third step): the share is the
    environment's (crowding is reach), the recess is not buildable; candidate (x) (`lysJoint: 2`) keeps the lock under
    copy error and freezes it. Run 0252 (fourth step): two guarded nurseries that complete each other's kids live without
    a filler (two obligate classes), but a public partner of a foreign root takes either role at any frequency, and
    copy error makes one. Run 0416 (explore): partner choice on paper: no body checks the partner it keeps (a kept bond
    reads one letter; the kin check bites only across a joint to a waiting cell); a raised partner (D1) dies; candidate
    (y) makes self-binders. Next: the direction check (the next step above).
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

Rotation (autorun `projects/plywood/rotation.txt`, unchanged since run 2151): 93 explore, 94 review-intent, 95 core-review.

**Core-change candidates:** docs/RULES.md, Core changes, Open candidates ((x) built as the option `lysJoint: 2` in run
2258, for the next core review; (y) written and not proposed in run 0416; (v) kept as the option `lysJoint`, (t), (s), (r)'s open part, (j), (l); settled there: (f),
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
                                                   # site after a kid leaves, how long it was empty, the taker's origin;
                                                   # run 2258: 'fate:' lines (copies to site, decay or elsewhere; rB, pi,
                                                   # rho, c's births ratio against the N count)
node tri/check.js --cmd kin-guard kin-guard-evolve   # run 2258: candidate (x), lysJoint 2 (TRI_PARAMS): the nursery's
                                                   # cheats lost; under copy error the lock in every census
node tri/check.js --cmd mutual-pair mutual-pair-a mutual-filler mutual-trap mutual-pair-evolve
                                                   # run 0252: two leaky guarded nurseries front to front, no filler;
                                                   # anchored control; a foreign-root public filler takes the role; a
                                                   # public head of root Y is lost; copy error to 120k
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
