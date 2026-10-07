# Next instance: start here

State on 2026-10-07 (after autorun run 20261007-1720, explore). Read AGENTS.md first (rules of work), then this file.
History: docs/INNOVATIONS.md (newest first), RULES (Core changes), the autorun log, and git: each run's handoff is
this file at its merge (`git log -p docs/NEXT.md`); the review-intent Direction of run 0751 in full at `a2f3914`, the
pair Direction of run 1850 in full at `20e9a88`.

**Goal (user, 2026-10-05): complex evolution** (AGENTS.md, IDEAS); the organism that feeds its bud is a direction.
Since review-intent run 1850 the vehicle is **the pair** (2 cells, 2 types; IDEAS "Sources in proportion to use"): a
kind where every cell of a body exposes exactly one copyable side, so part types are made in the proportion buds use
them. The 47-type organism lineage is frozen; it returns as the complex end once the pair world varies and competes.

**Current slice (autorun run 20261007-1821, build; priority 19, kinds as food).** Goal: a third class fed by the
second, or a recorded reason why none can be. Done when: the theory is written (IDEAS), designs entered into the
web-two world (U catchers at 10k, a third kit at 20k: new demo option `PA3`/`PA3T`), 4 seeds each, and the web read;
a check if one holds in 3 of 4. Theory first (this run): the bond between two fronts is symmetric, so a catcher of heads
is also their prey, and a 2-cell catcher always exposes at least the copyable sides its prey exposes in the prey's own
individual (its root is unspent there): **every predator of heads farms them**. Predictions: (A) a farmer of U heads
`V@&c@|v` (holding `C@|uU@&`) merges with the U class (V+U raises u, U+V raises v) in 3 of 4; (B) a second farmer of Z
heads `W@&C@|w` (holding `c@|-Z@&`) makes 3 classes (Z, U, W) with links to Z at most censuses in 3 of 4.
Measured (80k, seeds 1-4): (A) V died out in 4 of 4 within 5k of entry; (B) W held beside U for 20-30k in 3 of 4 (3
classes, 3 links), then one farmer excluded the other. Running `runs/food2.json`: (C) a farmer with a private crop
`X@&D@|x` + `d@|-Y@&` (predicted: 3 classes, X unlinked, 4 of 4); (D) the same crop rooting on `z` (`d@|-Z@&`). Measured: C and D died out 4 of 4 (blanks ~31 of 1000 once U
lives: every catch is farmed from blanks, so farmers share one resource and an invader cannot grow); (E) N on K
(a second stock) beside host and U: 3 classes at every census 30k-80k in 3 of 4 (`runs/food3.json`). Running
`runs/food4.json` (F: X first at 10k while blanks are plenty, U at 20k, 120k): predicted X establishes in 3 of 4,
and at 120k at most 2 classes in 4 of 4 (one farmer excludes the other). Batch: `runs/food.json` (regenerate: the commands under Commands with `PA3T=20000 PA3=...`).

**Handoff status (autorun run 20261007-1720, explore).** Priority 18 done (INNOVATIONS run 1720, IDEAS "A class is
a cycle of seed letters"); no rule or demo change. **A class owns its seed letter when its head's copy side is its seed
site** (`N@&k@|n`: the copies root in place) **and its stock part carries no site** (`K@-|-|`): entered into the
standard world it is a second class beside the host class in 4 of 4 (new checks `own-letter` 4 of 4, `own-letter-c`
pass). On the shared stock `C@-|z|` it merges (separate in 1 of 4: the stock part's `z` raises the host class and
catchers holding N heads close the cycle). The n class of 1x seed 3 is this kind arisen by mutation without stock.
**But owning letters does not make the web grow** (both predictions wrong): private stock letters gave no second class
(0 of 4, 240k) and the site-free world (every class owns its letters) one class at every census of the second half (4 of
4, one extinct): new private classes arise in two steps through a neutral site change and replace the old one on the
same stock. Classes are at most the separate foods. Also found: a waiting head's open front is a nursery for any part
with the complementary root (the census reads such kinds as unraised cheats). The run's worlds are not kept
(regenerate: INNOVATIONS run 1720, Commands; about 7 minutes per 120k). Nothing is running.

**Next step (rotation 68, build): priority 19**, kinds as food. The web can outgrow the number of stocks only if kinds
are food for kinds. Start from check `web-two` (u catchers `U@&C@|u` entered into the standard world: 2 classes, one
link; the u copy side is its in-place seed site). Theory first: what a third level can eat (u catcher heads root in
place and seldom reach the pool; the u individual's exposed sides are `u` and its held host head's `-`), design one
(a front that catches a part the second level makes in surplus, an in-place seed letter of its own), predict, then
enter it (`PA1T`, `PAEN`) and read the web (3 classes, 2 links?). If no third level can be fed, record why. Optional
in the same run: the web census could count open fronts as seed sites (observation only).

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
it does not make the web grow (1720; `own-letter`). Open:
19. [68 build] Kinds as food: a catcher class of its own letter on a host class, and a third level (Next step above).
20. [69 explore] Candidates: a kind that pays for length through cheaper catches (IDEAS run 0622), a longer kind whose
    function is in what binds, (t), or a third food that kinds make for one another.
Frozen: the 47-type organism (feeding, candidate (n), the front sink, lysis in the lineage). Not taken from run 1750's
list: (b) diets of different length and (c) more diets than blanks (run 1150's R* rule again).

Rotation (autorun `projects/plywood/rotation.txt`), unchanged (review-intent run 1851: the mix fits the order above):
68 build, 69 explore, 70 review-intent, 71 core-review, 72 build, 73 harden, 74 build, 75 explore.

**Core-change candidates (for the next `core-review` or `explore`).**
- (t) *A copy side reads glue* (run 1620): a copy side with a glue binds only a side carrying the complementary glue; an
  inert copy side binds any side, as now (every existing blank is inert, so outputs stay the same). Reads the partner
  side's glue (fixed type): local. It would let a second blank type be one kind's own resource (blanks `k?k?k?` copy only
  sides `K`), so a diet could be a copied side rather than a stock. Not needed while stock parts give a private resource
  (`PAF`); weigh it if a stock proves too special (it is a prepared supply of a kind's own part types).
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
  Done: (e), (i), (m) first step (lysis), (p) and (q) removed in run 1921. Nothing else in the core is unused (RULES,
  Core inventory).

**Open follow-ups (not priorities; take when a run's kind fits).**
- Core review: same-pass partner reads (zip, gap, release, fn) are allowed by convention (RULES, Locality audit);
  change only if a locality problem traces back to them.
- Speed (run 1721): a supply drive that keeps its stock outside the world, about 1.6x early in a run, changes
  outputs; decide it in a `build` that changes the setup.
- Suite time (run 0920): the frozen lineage's two checks are about three quarters of the suite's CPU time; a `harden`
  or `review-intent` run may cut them to fewer seeds or shorter worlds while the lineage stays frozen.
- Bigger cells and letter reuse (user, 2026-10-03; IDEAS): R 5 is the largest all-unique kind (46 letters); if a
  slice needs a larger cell, reuse letters inside sealed compartments.

## Commands
```
node tri/test.js                                   # fast checks (~5 s)
node tri/check.js [id ...] > runs/check.txt         # capability checks: one PASS/FAIL line each, printed as each finishes
                                                   # (about 100 minutes, 4 processes; CHECK_SAVE=dir keeps each world's output)
node tri/batch.js runs/b.json                      # a batch of demo worlds from a JSON file, 4 at a time, an output file and
                                                   # picture directory per world (format in the file's head comment)
PAW=1 node tri/demos.js pair 1 120000 runs/x            # THE STANDARD WORLD (check world; about 7.5 minutes): the diet kind among stocks
                                                   # C E G, openRange 9, PAHB=2, decay 1, PAHU=3 (whole body, h 0.07; run 1351),
                                                   # the general mutagen 0.01 (stock parts exempt); any option set overrides
                                                   # (PA1=1 adds the pair founder); 'kinds:' census lines, diets picture
PAW=1 PAB=3000 PAS=87 PAF='C@-|z|:450 E@-|z|:450 G@-|z|:450' node tri/demos.js pair 1 240000 runs/x   # the standard
                                                   # world at 3x (about 50 minutes; PAHU=2 PAH=0.1: the old hazard); every pair
                                                   # world prints 'web:' lines (classes, links, cheats) after each 'kinds:' line
PAW=1 PA1T=10000 PAEN=10 PAKR='U@&C@|u' PAKS='c@|-Z@&' node tri/demos.js pair 1 30000 runs/x   # two classes: u catchers
                                                   # entered (check web-two; about 1.5 minutes; plain catchers PAKR='Z@&C@|-': web-two-c)
PAW=1 PA1T=20000 PAEN=10 PAKR='N@&k@|n' PAKS='K@-|-|' PAF='C@-|z|:150 E@-|z|:150 G@-|z|:150 K@-|-|:150' node tri/demos.js pair 1 50000 runs/x
                                                   # a class that owns its seed letter (check own-letter; about 2.5 minutes): an
                                                   # in-place seed site on a site-free stock; on the shared stock (PAKR='N@&c@|n'
                                                   # PAKS='C@-|z|', PAF unset; own-letter-c, seed 2) it merges with the host class
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
