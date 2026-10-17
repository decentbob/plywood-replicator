# Next instance: start here

State on 2026-10-17 (after autorun run 20261017-0902, harden). Read AGENTS.md first (rules of work), then this
file. History: docs/INNOVATIONS.md (newest first), RULES (Core changes), ROADMAP backlog A (every done priority with its
run and checks), the autorun log, and git: each run's handoff is this file at its merge (`git log -p docs/NEXT.md`); a
slice record with its predictions is on its run's branch (`build-0726`, `explore-0416`, `build-0252`, `explore-2258`, `build-2151`,
`build-1902`, `explore-1602`, `build-1227`, `build-0727`, `core-review-2221`, `explore-1951`); the latest direction check
is IDEAS "What a lineage owns is what it raises" (run 0456).

**Goal (user, 2026-10-05): complex evolution** (AGENTS.md, IDEAS); the organism that feeds its bud is a direction.
Since review-intent run 1850 the vehicle is **the pair** (2 cells, 2 types; IDEAS "Sources in proportion to use"): every
cell of a body exposes exactly one copyable side, so part types are made in the proportion buds use them. The 47-type
organism lineage is frozen; it returns as the complex end once the pair world varies and competes.
Where the line stands (runs 1351-0416; INNOVATIONS has the numbers, IDEAS the reasoning): recognition is one glue pair
and copy error changes one side, so a lock its carrier needs is frozen and only a lock its carrier does not need turns
("Who pays for a lock"); a lock stays only where it pays its bearer, and under copy error every lock is transient, lost
to its cheats and reborn from them; the cheat wins the site by flux ("One encounter against two"); the nursery's share
is the environment's. **Candidate (x)** (`lysJoint: 2`, an option: a lysis side spares across a joint only a partner
carrying the identical side) keeps a guarded lineage's lock under copy error (24 of 24 censuses) and freezes its
letters. Two guarded nurseries front to front are two obligate classes (run 0252), but a public partner of a foreign
root takes either role, and **no body in the core checks the partner it keeps** (run 0416): every kept structure is
public, and what a lineage owns is what it raises, one triangle per generation. **The first bodies of more than two
cells** (run 0726): on the guarded platform the public partner is rootless, and one front error makes it a chain cell
that binds the partner's plain side and its own; a chain closes after four cells into a **ring of six** that covers
its head's site. It is the parasite's body, not the host's, and it lives on the partners' commonest letter, which
escapes it: so the guarded head keeps its letters while the partner's letter turns in bursts (IDEAS "Rings of six").

**Handoff status (autorun run 20261017-0902, harden): nothing needed fixing (idle).** The suite on main in a fresh
container: 91 of 91 checks pass, all 327 worlds byte for byte main's digests (so the digests hold across containers);
part 1 85 minutes, part 2 89 (each about 30 minutes inside the 2-hour limit, room for some 70 worlds of 100 s more).
The `secs` estimates are 0.8x the measured times throughout, so the parts stay balanced. At 3 of 4 (need 3): `ring`,
`imprint`, `race`, `seal-evolve`, `nursery-c`, `rosette-escape`; `pair-flow-c` partial 1 of 2 as before. No code change.
- Profile (`PAW=2` world, 30k steps): `_overlap` 30%, `_pairs` 15%, `tryMove` 10%, `eqDepthN` 6%, `_jostle` 6%. Bodies
  make 0.75 million `tryMove` calls per 1000 steps, 75% of them free at once, 1.5 `_overlap` calls each: a neighbour list
  gathered once per move (what made lone blocks fast, run 1421) would not pay for bodies. A finer grid could cut the
  cells scanned (about 0.8 blocks per 1.43-unit cell in world 50) but changes the order of the rare overlap-reducing
  sums, so outputs could change: not worth a suite while both parts fit.
- Run 0726's batches (e1, e5, e6: the evolve settings, the platform watch, `rosette` under copy error) are in its
  handoff: `git show fd0101b:docs/NEXT.md`. Nothing is running.

**Next step (rotation 98, build): priority 39, second slice** (below): the immune partner and a ring that pays its head,
on `rosette`'s world (`node tri/check.js --cmd rosette`).

## Slice in progress (autorun run 20261017-1302, build): priority 39, second slice

Goal: settle (a) the immune partner and (b) a ring that pays its head on `rosette`'s world, by theory first, then entry
tests (4 seeds, 60k, `runs/f1.json`). Done when one holds in 3 of 4 as a check, or the argument settles it. Stop after
the entry tests and one copy-error batch for whichever holds.

**Theory (before any run).**
- *Lysis is death in this world.* With deaths returning blanks (`PAHB=2`, set by `PAW=2`) every lysed triangle becomes
  a copy blank once free, not only the hazard's: contact lysis kills. A chain cell `t@` that binds the immune partner's
  `T!` is lysed (no joint: `lysJoint` does not apply), its lysis comes back across that bond into the partner and on into
  the head (not into a kid on the head's site: a joint). So `C@s!T!` is not immune but a trap: the chain cell and the
  whole body die together (IDEAS run 2221, "A trap or a lock": the same mark again, one cell over).
- *So it is not an escape like A.* A chained `T` partner lives on in a ring (hit by the hazard as any individual) and is
  copied at one side; an `A` partner is never touched and copied at two; a `T!` partner is copied at two until the first
  chain cell finds it, then dies. Killing the chain cell is a public good (it spares the `T` partners as much as itself).
- *Without selection it sits at a third.* Under copy error a side drawn at random toggles one of six marks half the
  time: the partner loses one of its two `!` at 2 x 1/3 x 1/2 x 1/6 = 1/18 per copy error and gains the one it lacks at
  1/36, so the immune share drifts to 1/3 by mutation alone (run 0726's control without chains: 33%).
- *The paying ring.* `t@y!T` has `t@s!T`'s front and plain side, so it chains and closes the same way; the four chain
  cells' outward sides are then `y!` sites: four nursery sites per ring for any head `Y@&c@y!` (the kin guard spares a
  root that carries `y!`), and the kid leaves with its partner as on a head. But head copies come only from heads' own
  empty sites (a blank on a chain cell's `y!` copies the chain cell), and the ring's own head is still covered. An
  occupied `y!` is not copied, so a `y` chain cell is copied less than an `s` one, while the heads it raises make fronts
  and partners for every chain: the benefit is public, the cost private.

**Predictions.**
- Pa1: `C@s!T!` entered as 10 bodies at 10k beside the chain does not take the partners (below half at 60k in 3 of 4,
  where `A` took 95-100%); the chain is still there at 60k. Pa0 (control, no chain): it stays rare (the 1/3 balance needs
  copy error).
- Pb1: `t@y!T` alone (20 at 10k) closes rings of six that hold, and its world has more heads at 60k than `rosette`'s
  (208-281) in 4 of 4: the ring raises kids. Fewer heads than the world without a chain (about 530): its head is still
  sterile and head copies come only from fertile heads.
- Pb2: both entered (10 each at 10k): `t@s!T` ends with more chain cells than `t@y!T` in 3 of 4 (the cheat wins by flux).
- If Pb1 holds and Pb2 too, the paying ring is a mutualism that its own site error undoes; no copy-error batch for it
  beyond one 4-world check of that.

## Priorities

Done 1-24, 28-30, 32-34, 36-38: ROADMAP backlog A (each with its run and checks; INNOVATIONS has the evidence). The user
approved the order (run 0321): a world that runs indefinitely under steady, labelled drives; the simplest heritable
variation; a minimal competition test.
Open (set by review-intent run 20261017-0456; reasoning in IDEAS "What a lineage owns is what it raises"):
39. [98 build] **Growth on the guarded platform, second and last slice.** First slice (run 0726): rings of six, a
    parasite of the public partner's plain side that the letter escapes (`rosette*`). Theory first, then entry tests
    on `rosette`'s world: (a) **the immune partner** `C@s!T!` (both free sides lysing: no chain binds it) entered rare
    beside the chain: predict it escapes like A; then under copy error, whether it fixes and the partner's letter stops
    turning (the guard once more, one cell over); (b) **a ring that pays its head**: a chain cell carrying the head's
    site (`t@y!T`, one site error from `t@s!T`) makes each ring four nursery sites for the head's kin; an occupied site
    is not copied, so predict whether it spreads against `t@s!T` and whether heads on such rings out-raise plain ones.
    Done when one of them holds in 3 of 4 (a check) or the argument settles it. After it, 39 goes back to the direction
    check (stop rule: four slices without a capability that holds under copy error; the rings hold only without an
    escape letter).
40. [99 explore] **When a joint lets go (on paper first).** The one route to a body that owns more than one cell per
    generation is a checked bond that outlasts completion (IDEAS run 0416: (x)'s check bites only across a joint, and a
    joint is cut at completion). Design the smallest change on the keeping side, say exactly what it reads (locality),
    and derive whether it makes bodies that never let go (run 0820's collapse at 3x) or self-binders (candidate (y)).
    Build only if the argument says it does neither; record it under Core changes either way.
31. [later] **Shape inside the loop.** Every class is one shape, so the loop is turnover of letters; 37 (done, run 1227:
    two locks hold two classes until copy error parts them) was its first concrete case. 39 is its next.
25. [later] **Length without sinks.** Chains of second cells arise by one mutation (an attach letter that complements a
    seed site) and preceded both collapses in run 0121 and all four in run 0551's control; a lysing site at the chain's
    tip stops them. Length as a function needs a chain that lets go (an `&` at its end) or a third cell that covers an
    open site (length as defence). On the platform (run 0726) the lattice stops a chain: bound by one side each time it
    closes after four cells into a ring of six (`rosette`); that ring is a parasite's, covering its head's site.
26. [later] Killing as a frequency-dependent enemy: the root-lysing seed site `z!` is the first killer to arise; it spread
    as a cheat, not as a predator, and guards against chains (run 0551).
Frozen: the 47-type organism (feeding, candidate (n), the front sink, lysis in the lineage); its genome copying left the
core in run 2221 (git `1284bb4`); `budpool`, `closure` and `lysis` keep its kit. Not taken from run 1750's list: (b) diets
of different length and (c) more diets than blanks (run 1150's R* rule again).

Rotation (autorun `projects/plywood/rotation.txt`, unchanged in runs 0456, 0518 and 0726): 95 core-review, 96 build, 97
harden, 98 build, 99 explore. Run 98 (build) takes 39's second slice.

**Core-change candidates:** docs/RULES.md, Core changes, Open candidates ((x) the option mode `lysJoint: 2` since run
2258, tried as the rule and kept an option in run 0518; (y) written and not proposed in run 0416; (v) kept as the option `lysJoint`, (t), (s), (r)'s open part, (j), (l); settled there: (f),
(k) and the done ones, (u) and (w) in run 2221).

**Open follow-ups (not priorities; take when a run's kind fits).**
- Core review: the convention of reading a partner's current state is now used only by binding (the chain rules'
  same-pass reads left with them, run 2221; RULES, Locality audit). `pBond` is never below 1 (removing it changes the
  random stream only: take it with a change that changes outputs anyway).
- Speed (run 1721): a supply drive that keeps its stock outside the world, about 1.6x early in a run, changes
  outputs; decide it in a `build` that changes the setup.
- Suite time: 85 and 89 minutes per part in harden run 20261017-0902 (91 checks); physics is most of it (handoff
  above; a cell-distance cut in `_pairs` would rarely skip a cell: the pair reach, 1.39, is about a cell, 1.4). When a
  part nears 2 hours, `--part k/3` balances three parts the same way. Worlds shared between checks: only `race`/`seal-evolve` had one setting
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
node tri/check.js --cmd rosette rosette-escape rosette-escape-c
                                                   # run 0726: chain cells t@s!T entered on the platform close into rings
                                                   # of six; a rare partner letter escapes them; control
node tri/census.js --partner runs/x.txt            # run 0726: rootless partners by plain letter ('immune': both free sides
                                                   # lyse), chain cells, cells in 3+ bodies (from 'body:' lines); chart:
                                                   # LC_PARTNER=1 node tri/linechart.js out.png FILES
NODE_OPTIONS='-r ./tri/bodyprobe.js' ...           # run 0726: 'body:' lines every 5000 steps, individuals by cells
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
