# Next instance: start here

State on 2026-10-17 (after autorun run 20261017-1302, build). Read AGENTS.md first (rules of work), then this
file. History: docs/INNOVATIONS.md (newest first), RULES (Core changes), ROADMAP backlog A (every done priority with its
run and checks), the autorun log, and git: each run's handoff is this file at its merge (`git log -p docs/NEXT.md`); a
slice record with its predictions is on its run's branch (`build-1302`, `build-0726`, `explore-0416`, `build-0252`, `explore-2258`, `build-2151`,
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
escapes it: so the guarded head keeps its letters while the partner's letter turns in bursts (IDEAS "Rings of six"). Its
escapes (run 1302): a new letter (quick, transient) or a close-only plain side (permanent, but not found under copy error
in 480k); a lysing side is a trap that kills the body. A ring whose chain cells carry the head's site raises heads on
four sites and loses to the chain that keeps its side for copies: a gain a body gives away is public (IDEAS "A closed
side, not a lysing one").

## Slice in progress (autorun run 20261017-1406, explore): priority 40, when a joint lets go (on paper first)

Goal: the smallest change on the keeping side (a checked bond that outlasts completion), what it reads, and whether it
makes bodies that never let go or self-binders; build only if neither; test what the existing core already offers.
Done when: the argument is written (IDEAS, RULES Core changes) and its predictions read in 4 worlds each. Stop: one
design tested, no tuning.
Theory (before any run):
- T1 **The keeping side is already in the core, by time.** A joint is cut when the `&` triangle's own body (between
  joints) hears no open front, and its own `@` sides count. So a kid whose site is an attach side (`Y@&c@y@!`) keeps
  its parent's bond until its own kid arrives: buds of two raised cells, both checked while they wait (run 2151 tried it
  without the guard, `Y@&y@!y@!`, and lost to a one-site cheat and to site errors that nobody fills).
- T2 **Keeping for good makes a ring of six.** Cells bonded one to the next by the same pair of sides turn 60 degrees
  about one shared vertex (run 0726's rings, run 0416's fans). A rule that keeps every checked joint (candidate (z): an
  `&` side bonded to a lysis side it carries itself is never cut) makes a lineage one fan: at most six heads about one
  vertex, its last site facing the first root, every site bonded or blocked: no head is copied again (a sink).
- T3 **So keeping must alternate with letting go**, and on a cell of identical copies the alternation can come from
  the side (two sites: keep and let go; with root and front that is a fourth role on a three-sided cell, (y)'s cost
  again) or from time (T1, in the core). Under the kin guard run 2151's site-error sink is gone (a kid whose only `y@!`
  changed is no kin and is lysed while it waits).
Predictions (batch `runs/e1.json`: `PAW=2`, `lysJoint` 2, `pErr` 1e-9, 60k, seeds 1-4, bodyprobe with `BP_RIGID=1`;
`p` the platform `Y@&c@y! C@s!T`, `w` `Y@&c@y@! C@s!T`, `k` the platform under (z) as a throwaway `runs/keep.js`):
- P1 (z): no rigid body holds more than six roots at any census, and every `k` world dies or freezes (no copies) by 30k.
- P2 `w` lives in 3 of 4 to 60k.
- P3 the share of heads in rigid bodies of two or more roots in `w` is at least twice `p`'s (30-60k censuses).
- P4 `w` holds fewer heads than `p` (0.5-0.9 of it): its waiting site is no copy side for most of a kid's life, and the
  whole-body hazard takes mother and daughter together.

**Handoff status (autorun run 20261017-1302, build): priority 39's second and last slice done (progressed).** Theory,
then entry tests on `rosette`'s world (4 seeds, 60k) and one copy-error watch; slice record with predictions in
`docs/NEXT.md` at `5b9516d` (branch `build-1302`); INNOVATIONS and IDEAS ("A closed side, not a lysing one") have it all.
- **The lysing partner `C@s!T!` is a trap, not a shield:** every lysed triangle dies (deaths return blanks) and lysis
  comes back across a bond that is not a joint, so a chain cell that binds `T!` dies with the partner's whole body. Lost
  beside the chain 4 of 4 (no check).
- **The close-only partner `C@s!T.` is the shield** (`rosette-dot`, 3 of 4): no free reader binds a `.` side, a blank
  still copies it; entered as 10 bodies it took 95-100% of partners and the chain left. Under copy error it never spread
  (0-12% of partners, four platform worlds to 480k, `runs/f4`): a new letter is six times likelier and chain episodes
  (one to three per world) are too few to select the mark (run 1650's seal had many).
- **The paying ring** `t@y!T` (`rosette-pay`, 4 of 4): the same ring of six with four nursery sites `y!` outward; heads
  349-419 at 60k against 208-281 with `t@s!T`. **Its cheat wins** (`rosette-pay-cheat`, 4 of 4): beside `t@s!T` it was
  gone by 40k (an occupied site is not copied; the heads it raises serve every chain). Under copy error it spread in 2 of
  4 and its site cheat `t@q!T` overtook it in one.
- Code: `PA3` enters several kits (`PA3='K1,K2'`, `PA3N` of each); `tri/check.js` keys partners by their marks and
  chain cells by their other side. The three new checks' digests are written; `rosette*` outputs unchanged.
- Batches (`runs/` is ignored; JSON here): the world is `rosette`'s env (`{"PAW":"2","PA2":"Y@&c@y! C@s!T",
  "TRI_PARAMS":"{\"pErr\":1e-9,\"lysJoint\":2}","PA3":"t@s!T","PA3T":"10000","PA3N":"20"}`, 60k, seeds 1-4, with
  `NODE_OPTIONS='-r ./tri/bodyprobe.js'`); f1 jobs `s` (as is), `n` (`PA3` ''), `y` (`PA3` `t@y!T`), `ys` (`t@y!T,t@s!T`,
  `PA3N` 10), `i` (`PAKR` `Y@&c@y!`, `PAKS` `C@s!T!`, `PA1T` 10000, `PAEN` 10), `ic` (`i` without `PA3`); f3 the same
  with `PAKS` `C@s!T.`; f2 `y` and `s` with `pErr` 0.01 to 120k; f4 run 0726's platform watch (`PAW=2`, `PA2`
  `Y@&c@y! C@s!T`, `pErr` 0.01, `lysJoint` 2, 480k, `PATN` 60). Nothing is running.

**Next step (rotation 99, explore): priority 40** (below), on paper first. Then 100 (build): what 99 leaves to build;
if nothing, priority 41.

## Priorities

Done 1-24, 28-30, 32-34, 36-39: ROADMAP backlog A (each with its run and checks; INNOVATIONS has the evidence). The user
approved the order (run 0321): a world that runs indefinitely under steady, labelled drives; the simplest heritable
variation; a minimal competition test.
Open (set by review-intent run 20261017-0456; reasoning in IDEAS "What a lineage owns is what it raises"):
40. [99 explore] **When a joint lets go (on paper first).** The one route to a body that owns more than one cell per
    generation is a checked bond that outlasts completion (IDEAS run 0416: (x)'s check bites only across a joint, and a
    joint is cut at completion). Design the smallest change on the keeping side, say exactly what it reads (locality),
    and derive whether it makes bodies that never let go (run 0820's collapse at 3x) or self-binders (candidate (y)).
    Build only if the argument says it does neither; record it under Core changes either way.
41. [100 build, if 99 leaves nothing to build] **The closed platform at length.** `Y@&c@y! C@s!T.` under copy error
    (the body has no side a free reader can hold): watched to 1.2M from the platform with and without the closed side,
    does the seal come in the end as in run 1650, do chain episodes stop once it has, and what varies on a body nothing
    reads (drift only, or a new shape)? Watch first, then one check if a number holds in 3 of 4.
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

Rotation (autorun `projects/plywood/rotation.txt`, unchanged in runs 0456, 0518, 0726 and 1302): 99 explore, 100
build, 101 cleanup, 102 build, 103 explore, 104 build, 105 explore, 106 review-intent (the direction check 39's stop
rule sends it to).

**Core-change candidates:** docs/RULES.md, Core changes, Open candidates ((x) the option mode `lysJoint: 2` since run
2258, tried as the rule and kept an option in run 0518; (y) written and not proposed in run 0416; (v) kept as the option `lysJoint`, (t), (s), (r)'s open part, (j), (l); settled there: (f),
(k) and the done ones, (u) and (w) in run 2221).

**Open follow-ups (not priorities; take when a run's kind fits).**
- Core review: the convention of reading a partner's current state is now used only by binding (the chain rules'
  same-pass reads left with them, run 2221; RULES, Locality audit). `pBond` is never below 1 (removing it changes the
  random stream only: take it with a change that changes outputs anyway).
- Speed (run 1721): a supply drive that keeps its stock outside the world, about 1.6x early in a run, changes
  outputs; decide it in a `build` that changes the setup.
- Suite time: 85 and 89 minutes per part in harden run 20261017-0902 (91 checks; 94 since run 1302, about 5 minutes more per part); physics is most of it (handoff
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
node tri/check.js --cmd rosette-pay rosette-pay-cheat rosette-dot
                                                   # run 1302: the paying chain t@y!T alone and beside t@s!T; the closed
                                                   # partner C@s!T. entered beside the chain
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
