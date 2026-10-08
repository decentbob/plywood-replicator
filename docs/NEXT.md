# Next instance: start here

State on 2026-10-08 (after autorun run 20261008-0250, harden). Read AGENTS.md first (rules of work), then this file.
History: docs/INNOVATIONS.md (newest first), RULES (Core changes), the autorun log, and git: each run's handoff is
this file at its merge (`git log -p docs/NEXT.md`); the review-intent Direction of run 0751 in full at `a2f3914`, the
pair Direction of run 1850 in full at `20e9a88`.

**Goal (user, 2026-10-05): complex evolution** (AGENTS.md, IDEAS); the organism that feeds its bud is a direction.
Since review-intent run 1850 the vehicle is **the pair** (2 cells, 2 types; IDEAS "Sources in proportion to use"): a
kind where every cell of a body exposes exactly one copyable side, so part types are made in the proportion buds use
them. The 47-type organism lineage is frozen; it returns as the complex end once the pair world varies and competes.

**Current slice (autorun run 20261008-0551, build; in progress): priority 22, the head-nursery founder.** Goal: start
the stockless world from the evolved design and see whether in-place heredity holds and what evolves next. Check: alive
at 240k in at least 3 of 4 worlds, head cheats (no `z` side) under 10% of heads; if so a check `nursery` (shorter). Stop
after the 8-world batch (4 `Z@&c@|z C@-z!`, 4 control `Z@&c@|z C@-z`) and at most one follow-up batch. Batch:
`node tri/batch.js runs/hn.json` (written in the run; env `PAW=1 PAF=` with `PA2` as above, 240000 steps, seeds 1-4).
Theory (before the batch; the head `Z@&c@|z`: front `Z@&`, catch site `c@|`, side `z` that raises heads; the second
cell `C@-z!`: attach `C@`, an inert side, a seed site that lyses the root it binds):
- A head's copy, made on its `z` side, lets go and binds the nearest free `z` side: usually its parent's (0.90 in place,
  run 0121). A head mutant without `z` (or with another letter there) is born only from the pool, (1-λ) p of births:
  with λ 0.9 it invades only if D c 0.1 > 1, so it stays at mutation-selection balance (P2). A head whose front letter
  changes (`Y@&c@|z`) cannot bind its own copies' side: one mutation leaves the nursery, so the root letter is locked
  (P3: `Z` and `z` in the commonest kind in 7 of 8).
- The second cell is still caught from the pool (λ about 0.3), and in the head nursery few free roots reach it (most
  heads are born in place). So its seed site is rarely occupied and costs little: in the control it is near neutral (P4).
- The second cell's two free sides (`-` and the seed site) are its templates; a glue on its inert side, or an attach
  letter matching a seed site, makes chains, which preceded both collapses in run 0121 (P5).
Predictions: P1 alive at 240k in 4 of 4 in each design. P2 heads without a `z` side under 10% of heads at every census
after 20k. P3 root letter `Z` with side `z` in the commonest kind at 240k in at least 7 of 8. P4 the control keeps the
head nursery (commonest kind `Z@&c@|z` with any second cell) in at least 3 of 4; its seed site may drift. P5 chains of
3 or more cells arise in at least 2 of 8 and precede any collapse. P6 individuals 400 or more (run 0121's founder
world: 300-370).
Follow-up (invasions, no mutagen, 10 entered at 20k, 60k, seeds 1-4; `runs/hi.json`): P7 the head nursery
(`Z@&c@|z C@-z!`) entered into the founder world (`Z@&c@|- C@-z|`) holds more than half the individuals by 60k in at
least 3 of 4 (its copies are born in place; the founder's roots come from the pool). P8 a head without the `z` side
(`Z@&c@|- C@-z!`) entered into the head-nursery world stays under 10% of individuals in 4 of 4: its copies all go to
the pool and find only the few host `z` sides a host's own copy did not take (D c (1-λ) about 0.2 with λ 0.9, c 2).

**Handoff status (autorun run 20261008-0250, harden).** The suite on `main` d76ac35: 56 of 56 (the partial control
`pair-flow-c` 1 of 2, as recorded), 4728 s. The frozen lineage's two checks now run seed 3 alone (`budcycle-3`,
`budcycle-lysis`): it reaches generation 3 first in both (735900, 736900) and is the one world where cutters lyse a bud;
the suite on the branch 56 of 56 in 4279 s (71 minutes), every shared world's output byte for byte main's. The lineage
was about 20% of the suite's CPU, not three quarters (that figure predates the pair checks; this machine runs each world
about twice as fast as the recorded `secs`). A speed attempt on lone blocks' physics (a destination-only neighbour
gather for moves within a sub-step, same outputs) was 5% slower and is reverted. Weakest checks: `ring` and `imprint`
3 of 4 (frozen, unchanged). Priority 21's results (run 0121): INNOVATIONS. Nothing is running.

**Next step (rotation 74, build): priority 22 below (the head-nursery founder).**

## Direction and priorities

The user approved this order (run 0321): (1) a world that runs indefinitely under conservation with steady, labelled
drives; (2) the simplest heritable variation; (3) a minimal competition test (two variants on one supply: does one
win, and for a reason?). On the pair, done (run; checks; INNOVATIONS has each): 1 the pair in isolation (2320; `pair`,
`pair-c`), its speed (0021); 2 hazard and decay drives (0251; `pair-run`); 3 variation and selection under a labelled
mutagen (0450; `pair-sel`); 4 deaths return blanks, a world that keeps evolving (0621; `pair-flow`); 5 budcycle's dead
options pruned (0920); 6 two kinds on one supply: the pair beats a 3-cell strip (1150; `duo`, `duo-inv`); 7 heredity
of combinations by locality, s about 0.44-0.58 (1322; `pair-host`); 8 a stock pays for length when risk is per
individual (1620; `duo-stock`); 9 heritable diets (1750; `diets`); 10 one openRange for every length (1920;
`strips`); 11 length by mutation shrinks to the 2-cell shortcut (2350; `ladder`, a negative); 12 the census of
individuals (0050); 13 the standard world `PAW=1` (0420; `world`); 14 host and catcher, what place delivers, the
4-cell arc (0622; `catcher-free`, `diets-catcher`, `arc-root`); 15 the recognition web does not grow; at 3x the
standard world collapses into heads that never let go (3 of 4), the whole-body hazard `PAHU=3` holds (4 of 4) (0820;
`web-two`); 16 the pair demo's options pruned (1051); 17 the whole-body hazard at h 0.07 is the standard world's
(1351; `world`, `arc-root` pins `PAHU=2`); 18 a class that owns its seed letter: in place, on a site-free stock;
it does not make the web grow (1720; `own-letter`); 19 kinds as food: every catcher farms its catch from blanks, so
the classes are at most the limiting resources, three on three (1821; `web-three`); 20 a resource each class makes for
itself: private recycling under (t) is no resource, and a rare class wastes its parts (1921; `rare-waste`).
Review-intent run 2021 (IDEAS "Twenty slices on the pair"): the web-size line stops here (its bound is derived and
measured); the stocks block coevolution; next, frequency dependence, first through the nursery cheat that already
arises. 21 the standard world without stocks: no Red Queen of letters, the body plan evolves (0121; `world-free`, `seed-cheat`,
`seed-open`). Open (run 0121's proposals; review-intent 82 may reorder):
22. [74 build] **The head-nursery founder.** Start the stockless world from the evolved design (`PA2='Z@&c@|z C@-z!'`,
    and `C@-z` as its control: the second cell's seed site plays no part once the head raises), with the drives and the
    mutagen as `world-free`, 240k, 4 worlds. Predictions: alive in 4 of 4 (no collapse); cheat heads (no `z` side) and
    cheat second cells stay under 10% (λ 0.9: Dc(1-λ) far below 1); what evolves next is the question (length? a second
    class?). If it holds better than the founder world, it is the candidate standard world (nothing prepared but
    blanks and a founder): a decision for review-intent 82, with the stock checks moved over.
23. [75 explore] **In-place heredity and the web.** A rare class lost because its parts decay in the pool before its
    few buds catch them (run 1921); a head nursery delivers its root in place. Theory first: does that remove the Allee
    barrier for a second head-nursery class (own root and seed letters, shared second cells) entered as 10 into the
    head-nursery world, and does R* on blanks still exclude it? Then the runs.
24. [later] **Length without sinks.** Chains of second cells arise by one mutation (an attach letter that complements a
    seed site) and preceded both collapses; length as a function needs a chain that lets go (an `&` at its end) or a
    third cell that covers an open site (old 23, length as defence). Designed, not demonstrated.
25. [later] Killing as a frequency-dependent enemy (old 22): the root-lysing seed site `z!` is the first killer to
    arise and it spread as a cheat, not as a predator (it lyses roots, which return as blanks for everyone).
Frozen: the 47-type organism (feeding, candidate (n), the front sink, lysis in the lineage). Not taken from run 1750's
list: (b) diets of different length and (c) more diets than blanks (run 1150's R* rule again).

Rotation (autorun `projects/plywood/rotation.txt`), unchanged (review-intent run 2021: the order above needs one build,
then an explore, then a build, as the mix gives): 72 build (done), 73 harden, 74 build, 75 explore, 76 build,
77 cleanup, 78 build, 79 explore, 80 build, 81 explore, 82 review-intent. 73 harden: done (lineage checks on one
seed). 77 cleanup: prune the pair demo's 31 options to those a check or
a command above uses.

**Core-change candidates (for the next `core-review` or `explore`).**
- (t) *A copy side reads glue* (run 1620): a copy side with a glue binds only a side carrying the complementary glue; an
  inert copy side binds any side, as now (every existing blank is inert, so outputs stay the same). Reads the partner
  side's glue (fixed type): local. It would let a second blank type be one kind's own resource (blanks `k?k?k?` copy only
  sides `K`), so a diet could be a copied side rather than a stock. Not needed while stock parts give a private resource
  (`PAF`); weigh it if a stock proves too special (it is a prepared supply of a kind's own part types).
  Run 1821: the classes are at most the limiting resources and every copied part is a blank, so (t) is the one way in the
  core to a resource kinds make; open: what keeps the second blank type in supply (`PAHB=2` returns plain blanks).
  Run 1921: **built as the option `copyGlue`** (default off) with the drive `PAHB=3` (lettered blanks): a class copied
  only from its own deaths, which is no resource (it makes them from plain blanks); exclusion as without it. **Removed**
  in core review run 2051 (code at `25c68b9`); a new attempt answers first what keeps a second blank type in supply.
- (u) *Retire chain copying with the frozen lineage* (core review run 2051, from its coverage run): chain copying (the
  relay zip, the values gap, need, fn, the state fill, the dock, fill, close and release rules, four bond kinds) fires
  only in `copy`, `imprint` (`g`, `p`) and `budcycle`; the anchor's catch of a strand end, with its physics exception
  (the strand moves as one body, `_snapBody`), only in `budcycle` (23 catches in the suite). The pair line uses neither.
  Retiring both would leave contact copying as the one way to copy and roughly halve `tri/sim.js`, at the cost of the
  checks `copy`, `imprint-genome(-c)`, `imprint-pore(-c, -n)`, `budcycle-3`, `budcycle-lysis` (code stays in git) and of
  the lineage returning as it is (its founder genome is a held strand). A capability decision, not a review's: weigh it
  at review-intent 82 (run 73's harden cut the lineage's checks to one world each, not the code), with the question whether a heritable
  sequence (a genome) will be needed for complex evolution and whether contact copying of a held strand (`imprint g`)
  could carry it.
- (s) *Lysed material returns as blanks* (run 0621): the labelled drive `PAHB=2` as physics (a lysed triangle that comes
  free becomes a copy blank, replacing "returns to a fresh state of its type"). Not needed while the drive does it; it
  would make every death return raw material, and lysis stop recycling parts (the lysis demo's bud regrows from them).
- (r) *Copy error in contact copying* (run 0450): not needed yet; a labelled mutagen on free parts gives the same
  variants (RULES, Core changes). Open: whether the core or the environment should limit parts that bind their own
  kind (`g@` and `G@` on one part), which lock the material in the mutagen world.
- (o) the open relay's one-pass lag: **adopted** in run 1920 together with the joint (RULES Core changes); the
  lineage's false releases (`falseRel`) did not change and have another cause (trace one before any fix).
- (n) *Bud only after letting go* (run 1721): its oracle `BCGATE` was removed in run 0920 (git `20e9a88`). Organism
  lineage; frozen with it.
- (j) *Monomer mix* (run 0022) and (l) *a copy side with a glued anchor side* (run 0820): no design, no such type.
- Settled, keep: (f) the seed site `y` is copied while no bud sits on it (the pair relies on it). Not needed: (k).
  Done: (e), (i), (m) first step (lysis), (p) and (q) removed in run 1921, (t) removed in run 2051. Nothing else in the
  core is unused (RULES, Core inventory, run 2051 coverage); `pBond` is never set below 1 (removing it changes the
  random stream, not the rules: take it with a run that changes outputs anyway).

**Open follow-ups (not priorities; take when a run's kind fits).**
- Core review: same-pass partner reads (zip, gap, release, fn) are allowed by convention (RULES, Locality audit);
  change only if a locality problem traces back to them.
- Speed (run 1721): a supply drive that keeps its stock outside the world, about 1.6x early in a run, changes
  outputs; decide it in a `build` that changes the setup.
- Suite time (run 0250): 71 minutes; the frozen lineage's two checks (one world each, 15-17 minutes) are about 12% of
  the suite's CPU; the rest is pair worlds, whose time is lone blocks' physics (about 80%; a destination-only neighbour
  gather was tried and was 5% slower, reverted).
- Bigger cells and letter reuse (user, 2026-10-03; IDEAS): R 5 is the largest all-unique kind (46 letters); if a
  slice needs a larger cell, reuse letters inside sealed compartments.

## Commands
```
node tri/test.js                                   # fast checks (~5 s)
node tri/check.js [id ...] > runs/check.txt         # capability checks: one PASS/FAIL line each, printed as each finishes
                                                   # (about 71 minutes, 4 processes; CHECK_SAVE=dir keeps each world's output)
node tri/batch.js runs/b.json                      # a batch of demo worlds from a JSON file, 4 at a time, an output file and
                                                   # picture directory per world (format in the file's head comment)
PAW=1 node tri/demos.js pair 1 120000 runs/x            # THE STANDARD WORLD (check world; about 7.5 minutes): the diet kind among stocks
                                                   # C E G, openRange 9, PAHB=2, decay 1, PAHU=3 (whole body, h 0.07; run 1351),
                                                   # the general mutagen 0.01 (stock parts exempt); any option set overrides
                                                   # (PA1=1 adds the pair founder); 'kinds:' census lines, diets picture
PAW=1 PAF= PA2='Z@&c@|- C@-z|' node tri/demos.js pair 1 240000 runs/x   # the world without stocks (check world-free at
                                                   # 120k; about 7 minutes): blanks only, the founder pair copied whole;
                                                   # PA2='Z@&c@|z C@-z!' the evolved head nursery (smoke run 0121: 420-430
                                                   # individuals, 97% one kind at 30k, seed 1)
PAW=1 PAF= PA2='Z@&c@|- C@-z|' PAM=0 PA3T=20000 PAEN=10 PA3='Z@&c@|- C@-q|' node tri/demos.js pair 1 60000 runs/x
                                                   # a second cell that raises nobody invades its hosts (check seed-cheat; 2
                                                   # minutes); PA3 'C@wz|' a marked host (seed-cheat-c), 'C@-z' the anchorless
                                                   # host (seed-open, 50k); NODE_OPTIONS='-r ./tri/copyrate.js' adds a
                                                   # 'copyrate:' line (copies per template class from CR_T0, 25000)
PAW=1 PAB=3000 PAS=87 PAF='C@-|z|:450 E@-|z|:450 G@-|z|:450' node tri/demos.js pair 1 240000 runs/x   # the standard
                                                   # world at 3x (about 50 minutes; PAHU=2 PAH=0.1: the old hazard); every pair
                                                   # world prints 'web:' lines (classes, links, cheats) after each 'kinds:' line
PAW=1 PA1T=10000 PAEN=10 PAKR='U@&C@|u' PAKS='c@|-Z@&' node tri/demos.js pair 1 30000 runs/x   # two classes: u catchers
                                                   # entered (check web-two; about 1.5 minutes; plain catchers PAKR='Z@&C@|-': web-two-c)
PAW=1 PA1T=20000 PAEN=10 PAKR='N@&k@|n' PAKS='K@-|-|' PAF='C@-|z|:150 E@-|z|:150 G@-|z|:150 K@-|-|:150' node tri/demos.js pair 1 50000 runs/x
                                                   # a class that owns its seed letter (check own-letter; about 2.5 minutes): an
                                                   # in-place seed site on a site-free stock; on the shared stock (PAKR='N@&c@|n'
                                                   # PAKS='C@-|z|', PAF unset; own-letter-c, seed 2) it merges with the host class
PAW=1 PA1T=10000 PAEN=10 PAKR='U@&C@|u' PAKS='c@|-Z@&' PA3T=20000 PA3='N@&k@|n K@-|-|' PAF='C@-|z|:150 E@-|z|:150 G@-|z|:150 K@-|-|:150' node tri/demos.js pair 1 50000 runs/x
                                                   # three classes on three resources (check web-three; about 3 minutes): PA3 a
                                                   # third kit entering at PA3T; the farmer of a private crop PA3='X@&D@|x d@|-Y@&'
                                                   # (PAF unset) never establishes (web-three-c)
PAW=1 PAF= PAM=0 PA2T=2000 PA3T=2000 PAEN=5 PA2='U@&C@|u c@|C.Z@&' PA3='W@&E@|w e@|E.Y@&' node tri/demos.js pair 1 30000 runs/x
                                                   # two equal blank farmers (check rare-waste; about 2 minutes): one excludes
                                                   # the other by 30k; PAD=0: both stay (rare-waste-c)
PAW=1 PAF= PAM=0 PA2='U@&C@|u c@|-Z@&' node tri/demos.js pair 1 20000 runs/x   # a catcher with its own seed site, alone
                                                   # without stock (check catcher-free; 45 s); diets world with catchers entered:
                                                   # check diets-catcher's env (PA1T, PAEN, PAKR, PAKS: a late entry of any 2-cell kit)
PAW=1 PAM=0 PAH=0.03 PARP=1 PA2='Z@&t@|- T@-|a@| A@-|b@| B@-|z|' PAF='T@-|a@|:150 A@-|b@|:150 B@-|z|:150' node tri/demos.js pair 1 30000 runs/x
                                                   # the 4-cell arc on stock middles (check arc-root; 90 s): PARP=1 'root:' lines,
                                                   # the share of births whose root its own parent copied, picture at the first
node tri/demos.js strip 1 6000 runs/x 2345         # strips of 2 to 5 cells, one world each (check strips; 30 s): complete and
                                                   # incomplete releases, delay from the last cell; PAR openRange (default 120)
node tri/demos.js pair 1 3000 runs                # the pair (check pair; 10 s): one founder among copy blanks; PAB blanks (300), PAS world
                                                   # (30), PAR openRange (1), PAKR/PAKS other R/S types (pair-c, the turned order:
                                                   # PAKS='B@y-|' PAKR='Y@&b@-'); result: bodies, gen, copies by type, doublings, children
PAB=1000 PAS=50 PAP=20000 PAHT=1000 PAH=0.6 PAD=1 node tri/demos.js pair 1 1000000 runs/x   # the pair world that runs on
                                                   # (check pair-run at 100k steps; about 35 minutes per 10^6): PAH body hazard,
                                                   # PAD decay of free parts (per 100 steps), PAHT hazard start, PAP 'pop:' lines and 'kinds:' census
                                                   # lines (individuals between joints, kinds by composition; every pair world)
PAHB=2 PAB=1000 PAS=50 PAP=5000 PAHT=1000 PAH=0.6 PAD=1 PAM=0.01 PAHU=1 node tri/demos.js pair 1 300000 runs/x   # the mutagen
                                                   # world that keeps evolving (check pair-flow at 200k; about 7 minutes): PAHB=2 every
                                                   # lysed triangle returns as a blank; PAM the mutagen, PAHU=1 hazard per triangle
                                                   # (PAHU=2 PAH=0.5: per individual, check pair-flow-i);
                                                   # 'mut:' census lines, 'evolving:' result line; PAB=3000 PAS=87: 3x world
                                                   # (selection: PAV, PAVK, PAVP, PAVT, checks pair-sel, pair-sel-c)
PAB=1000 PAS=50 PAHT=4000 PAHB=2 PAHU=1 PAP=5000 PAR=3 PAD=1 PAH=0.1 PA2='Z@&c@|- C@d@|- D@-z|' node tri/demos.js pair 1 20000 runs/x
                                                   # two kinds on one supply (check duo; about 1.5 minutes): the pair and a 3-cell
                                                   # strip; PA1=0 the strip alone; PA1T=30000 PAEN=5 pairs enter later (duo-inv),
                                                   # PA2T strips (duo-inv-c); 'duo:' lines, a last 'duo: pair=... strip=...' line
PAB=1000 PAS=50 PAHT=4000 PAHB=2 PAHU=0 PAP=5000 PAR=3 PAD=1 PAH=0.1 PA2='Z@&c@|- C@d@|-| D@-|z|' PAF='C@d@|-|:400 D@-|z|:400' node tri/demos.js pair 1 40000 runs/x
                                                   # a second resource (check duo-stock; about 3 minutes): PAF a labelled stock of
                                                   # parts (never decay, return as themselves); PAHU=0 hazard per individual
PAB=1000 PAS=50 PAHT=4000 PAHB=2 PAHU=0 PAP=5000 PAR=3 PAD=1 PAH=0.1 PA1=0 PA2='Z@&c@|- C@-|z|' PAMF=1 PAF='C@-|z|:150 E@-|z|:150 G@-|z|:150' PAM=0.01 PAMA=cdefgh node tri/demos.js pair 1 60000 runs/x
                                                   # heritable diets (check diets; about 5 minutes): PAMF=1 the mutagen on front
                                                   # glues only (letters PAMA, a..z), 'diet:' lines and a diets picture; PAM=0.02
                                                   # without PAMA: the a..z mutagen (z fronts eat other kinds' roots)
PAB=1000 PAS=50 PAHT=4000 PAHB=2 PAHU=0 PAP=5000 PAR=9 PAD=1 PAH=0.1 PA1=0 PA2='Z@&c@|- C@e@|- E@-|z|' PAMF=1 PAF='E@-|z|:150 G@-|z|:150' PAM=0.02 node tri/demos.js pair 1 60000 runs/x
                                                   # the ladder world (check ladder; about 5 minutes): a 3-cell founder with a
                                                   # copied middle; 'kinds:' lines (front letters per individual, cells per
                                                   # individual; in every world with diets, or the mutagen and stocks)
PAHB=2 PAB=1000 PAS=50 PAHT=1000 PAD=1 PAHU=1 PAP=2000 PAH=0.3 PADI=10 PAV=mix PAVP=0.1 PAVK=parasite PAVT=20000 node tri/demos.js pair 1 40000 runs/x
                                                   # heredity by locality (check pair-host; about 2 minutes): PAVK=parasite the S
                                                   # variant, with it 'par:' lines (parental share),
                                                   # PADI decay interval (100), PAMX stirring; without PADI the parasite holds
                                                   # (pair-host-c), with PAMX=0.2 it spreads (pair-host-mx)
BCGEN=3 BCAFTER=900000 node tri/demos.js budcycle 3 1200000 runs/x   # the frozen lineage (corner bud, closed walls, 20 blanks +
                                                   # 400 pre-food at 0.0003, monomer loop BCL 0.002, world 36): three generations (check
                                                   # budcycle-3; about 30 minutes). Options: extra parts per type (8); BCB blanks, BCI
                                                   # inside, BCS world, BCR openRange (9), BCE E parts (0), BCES=0/2 no E source / outside,
                                                   # BCF/BCFP the supply, BCL the monomer loop, BCDBG=1 census
BCQ=1 BCR=50 BCC=2 BCGEN=3 BCAFTER=900000 node tri/demos.js budcycle 3 1200000 runs/x   # lysis in the lineage: a receptor on each
                                                   # body's last cell, 2 cutters (check budcycle-lysis; about 30 minutes); BCA anchor cell
                                                   # (6), BCT cutter type; result: lysedBuds, lysedAt, falseRel, poolMin
node tri/demos.js lysis 1 1000000 runs/x           # a stuck bud taken apart by cutters at its waiting anchor (check lysis, 2.5 minutes)
node tri/demos.js budpool 1 250000 runs             # the kind's bud grown from a pool of its 47 part types (check budpool)
node tri/demos.js closure                          # the designed kind (budKit): parent, bud grown in signal passes, catch, split (no physics)
POOLB=20 POOLISO=1 node tri/demos.js pool 1 100000 runs 4   # a waiting front among 20 blanks and 4 next parts: copies per bound part
node tri/demos.js imprint 1 100000 runs 150px      # a cell fed through a pore copies its held genome; 3 sterile rivals (check imprint-pore;
                                                   # 150pc, 150pn: controls; 150ph: a hooded pore; 150pw: 7-cell pore)
node tri/demos.js imprint 1 30000 runs g           # a held strand copied from copies of its own triangles (gc: control)
node tri/demos.js imprint 1 200000 runs            # contact copying: a ring closes and a second grows from copy blanks only
```
Older demos: `copy` (chain copying, the founder held by its high end) and `ring` (a ring kit closes); each check in
`tri/check.js` names its seeds, steps, extra and env, and each demo's options are listed in the comment above it in
`tri/demos.js`. Commands of earlier setups are in their INNOVATIONS entries (options since removed: in git at the
commit INNOVATIONS' header or `tri/demos.js` names). Pictures go to `runs/NAME.png` with saved states; `TRI_NOPIC=1`
turns them off. `TRI_RESUME=runs/x/NAME_tNNN.json.gz` continues a demo world from a saved state; `TRI_PARAMS='{...}'`
overrides parameters. To show a change leaves outputs the same: `CHECK_SAVE=$PWD/runs/a node tri/check.js` in a
worktree of main and `CHECK_SAVE=$PWD/runs/b ...` in the branch, then `diff -r`. Coverage hook: `COV_OUT=$PWD/runs/cov.jsonl
NODE_OPTIONS="-r ./tri/coverage.js" node tri/check.js` (one JSON line per demo world: marks present, rule events).

## Pitfalls learned
Read before designing a layout: docs/IDEAS.md, "Pitfalls learned (copy lineage)" (doorways, anchors, food sinks,
signals, rings, physics) and "Pitfalls from the casting lineage" (kits, pockets, doors, flaps; that lineage is
removed, its lessons stay).
