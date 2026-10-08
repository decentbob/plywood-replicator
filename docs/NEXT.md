# Next instance: start here

State on 2026-10-08 (after autorun run 20261008-0651, explore). Read AGENTS.md first (rules of work), then this file.
History: docs/INNOVATIONS.md (newest first), RULES (Core changes), the autorun log, and git: each run's handoff is
this file at its merge (`git log -p docs/NEXT.md`); the review-intent Direction of run 0751 in full at `a2f3914`, the
pair Direction of run 1850 in full at `20e9a88`.

**Current slice (autorun run 20261008-1021, build, in progress): priority 23, a second class in the head nursery
under copy error.** Goal: theory of when an in-place class lets a second root letter in, checked in the head-nursery world
(`PAW=1 PAF= PAM=0 PA2='Z@&c@|z C@-z!'`) at `pErr` 0.005 and 0.01 to 480k (seeds 1-4 each), with the stockless founder
at 0.005 to 240k beside it (rate against place). Done when the batch is read against the predictions below and the
mechanism it shows (or the gate it finds) has a check at 3 of 4. Running: `node tri/batch.js runs/p23.json` (jobs
`a5_`, `a10_`, `b5_`; file in the run's NEXT commit history: env as the Commands' copy-error line, steps 480000, `b5_`
240000 with `PA2='Z@&c@|- C@-z|'`).
Theory (before the batch). Sites for a root letter X: heads' own sides (letter z only) and second cells' free sides. A
glue x on the second cell's inert side (`C@xz!`) raises nobody while no X root exists, so it drifts (neutral; second
cells are copied in the pool). A root mutant `X@&c@|z` (one error) is born on its parent's `z` side, cannot bind it and
goes to the pool, where it lives at most 100 steps (`PAD=1`): it is a **pool class** (in-place share 0), born only on x
sites. The resident's births are about 0.9 in place, so per copy Z succeeds with about 0.9 + 0.1 q_z and X with q_x (the
chance a pool head reaches a free x site within its life), less the time its own `z` side holds leaked Z heads. So X is
at best near neutral, only while x is on most second cells, and negatively frequency dependent (an x site that holds an
X head is no template, so `C@xz!` is copied less as X grows). A nursery of the new letter (`X@&c@|x`) needs a second
error in an X head: a three-step path (site drifts, pool class, nursery), and two nurseries are neutral to each other
(same in-place share, shared blanks and second cells): drift, not coexistence. Rough rates: about 25k head copies per
100k steps, a given root letter per copy pErr/6/53, so 0.4 (0.005) or 0.8 (0.01) mutants of one letter per 100k steps.
Predictions: P1 a glue on the second cell's inert side above 20% of second cells at some census in at least 3 of 4
worlds per rate; P2 a second root letter above 5% of heads at some census in at most 1 of 4 worlds per rate, and its
complement on at least 10% of second cells before it; P3 no pool class replaces the nursery; P4 alive 4 of 4 at 0.005,
at least 3 of 4 at 0.01 (plugs); P5 stockless founder at 0.005: root letter turns over in at most 1 of 4 by 240k (if 2
or more, place matters beyond rate).
Read so far (a5_, a10_ done, 480k): alive 8 of 8 (403-437 individuals); P2 yes: no second root letter above 5% of heads
in 8 of 8; the only non-Z roots in any census were the predicted pool class `l@&c@z` (3 heads at 345k in a5_1, while
`L` sat on 60-73% of second cells; gone by 350k) and one at 125k there; P1 half: a site letter (no `!`, no `.`) on 20% or
more of second cells in 2 of 4 at 0.005 (L 73%, e 29%) and 3 of 4 at 0.01 (d 34%, H 33%, u 30%); P3, P4 yes. Heads drift
as in run 0651 (`Z@&c@z` sweeps 3 of 4 at 0.005, 2 of 4 at 0.01). Scratch scripts for these numbers: the slice's
summary will name what they read (`types:` lines).
Read (follow-ups, no mutation, 10 entered at 20k unless said): **the pool class replaces the nursery when its site is on
the second cells** (e1: `I@&c@|z` with `C@iz!` everywhere: I 396-427 of 396-427 individuals at 80k, 4 of 4; predicted
lost: wrong); without the sites lost by 30k (e1c, 4 of 4: yes); an I nursery drifts (e2: lost 2 of 4, 17 and 138 at
80k); with i sites it replaces Z too (e3, 3 of 4). One I head (`runs/p23f.json` f1, seeds 1-8): established in 1 of 8.
Site share (f2, a second founder with `C@iz!` at t=0, its share at 20k by drift): i sites on 37-46% of second cells:
lost 6 of 6; 80-83%: invaded 2 of 2, and in f2_1 I rose to 257 of 405 at 50k while second cells without i went from 40
to 373 (an i site holding a waiting head is no template), then I fell to 84 and Z came back: the predicted negative
feedback, at the level of the second cell. Stockless founder at 0.005 (b5_): root letters turned over in 2 of 4 (seed 2
Z, m, x after M and X sites spread on second cells; seed 1 a d nursery `C@|Dd@&` at 230k, from heads that carried a D
site on their own side: a copy with root d is born on it); seed 3 evolved the Z nursery and kept Z; seed 4 died of
the chain sink (`-zZ@`) at 150k. P5 wrong: 2 of 4 at the mutagen's supply (copy errors 104 by 20k), so place matters.
Running: `runs/p23g.json` (the loop: e1's world plus 10 Z nurseries with plain second cells `C@-z!` at 20k, 200k).
Follow-up queued (`runs/p23e.json`, no mutation, 10 I founders entered at 20k into the head nursery, 80k, seeds 1-4):
e1 the pool class `I@&c@|z` with i sites on every second cell (`C@iz!` from the start), e1c the same without i sites,
e2 an I nursery `I@&c@|i` (second cells `C@-z!`), e3 the I nursery with i sites. Predicted: e1 lost or under 2% of
heads by 80k in at least 3 of 4 (per copy below the resident); e1c lost by 25k in 4 of 4; e2 lost in at least 3 of 4
(neutral, drift; its leaked heads find no site); e3 lost in at least 2 of 4 (neutral).

**Goal (user, 2026-10-05): complex evolution** (AGENTS.md, IDEAS); the organism that feeds its bud is a direction.
Since review-intent run 1850 the vehicle is **the pair** (2 cells, 2 types; IDEAS "Sources in proportion to use"): a
kind where every cell of a body exposes exactly one copyable side, so part types are made in the proportion buds use
them. The 47-type organism lineage is frozen; it returns as the complex end once the pair world varies and competes.

**Handoff status (autorun run 20261008-0651, explore).** Priority 24 done through candidate (r), now a core rule with a
parameter (RULES Core changes run 0651; INNOVATIONS run 0651; IDEAS "Variation where copies are made"): **copy error**
`pErr` (default 0, so every other world is unchanged; set it with `TRI_PARAMS='{"pErr":0.01}'`). With the mutagen off
and `pErr` 0.01: head-nursery heads vary (4 of 4 by 60k; check `copy-error`), neutral heads drift to large shares
(`Z@&c@z` 99.6%, `Z@&|c@|z` 56%; entered as 10 without mutation both are lost, so drift), the world holds (414-436
individuals). In the stockless founder world the nursery evolves (2 of 4) and **root letters turn over** (2 of 4; one
world Z, I, y, g), each new root letter the complement of a seed site that had spread as a cheat; tested without
mutation: I roots entered after `i` cheats hold beside Z (4 of 4, check `cheat-root`), without the cheats first they
are lost (4 of 4, `cheat-root-c`). One nursery died of a plug (`--D@` on the heads' own `d` sides). Suite on the branch:
60 of 60 (`copy-error` included) plus `cheat-root` and `cheat-root-c` (run alone); it took about 160 minutes in this
container (32 checks hit the 2-hour background limit; the rest rerun by id): run it in two halves by id. Copy error at
0.01 is about twice the mutagen's supply in the stockless world (copy errors 222-274 by 20k, mutations 123-131), so the
difference from run 0121 mixes rate and place. Nothing is running. Batches: `runs/ce.json`, `runs/cf.json` (commands in
INNOVATIONS run 0651).

**Next step (rotation 76, build): priority 23 below, under copy error.**

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
`seed-open`). 22 the head-nursery founder: holds, keeps cheats out, its lysing seed site guards against one-letter
chains, and the head never varies under a free-part mutagen (0551; `nursery`, `nursery-c`, `nursery-cheat`).
24 copy error in contact copying (core, `pErr`): the head varies; root letters turn over through cheat sites; a common
cheat site lets a new root letter in (0651; `copy-error`, `cheat-root`, `cheat-root-c`).
Open (review-intent 82 may reorder):
23. [76 build] **In-place heredity and the web, under copy error.** Run 0651: a new root letter gets in when its seed
    sites are already common as cheats (`cheat-root`), and in the stockless founder world letters turned over that
    way (2 of 4). Open: does the head-nursery world, where head cheats are shut out but second cells still drift, found
    a second class the same way (a second cell with a seed site of another letter spreading as a cheat, then a root
    that fits it), and do two root letters then coexist or replace each other (`cheat-root` settles near half and half
    at 70-110k)? Theory first (when does a class with in-place heredity let a second one in?), then the head-nursery
    world with `pErr` 0.005 and 0.01 to 480k (also separates rate from place, IDEAS run 0651 caveat).
25. [later] **Length without sinks.** Chains of second cells arise by one mutation (an attach letter that complements a
    seed site) and preceded both collapses in run 0121 and all four in run 0551's control; a lysing site at the chain's
    tip stops them. Length as a function needs a chain that lets go (an `&` at its end) or a third cell that covers an
    open site (length as defence). Designed, not demonstrated.
26. [later] Killing as a frequency-dependent enemy: the root-lysing seed site `z!` is the first killer to arise; it spread
    as a cheat, not as a predator, and guards against chains (run 0551).
27. [later] **The plug.** A part with the root letter as its attach side and nothing else (`--D@`) binds a nursery head's
    own side and stops in-place birth (run 0651, one world of 4). Guard designs: a release on the head's own side
    once a non-head binds (no such rule), a lysing own side (kills its own children), or a second own side.
Frozen: the 47-type organism (feeding, candidate (n), the front sink, lysis in the lineage). Not taken from run 1750's
list: (b) diets of different length and (c) more diets than blanks (run 1150's R* rule again).

Rotation (autorun `projects/plywood/rotation.txt`), unchanged (review-intent run 2021: the order above needs one build,
then an explore, then a build, as the mix gives): 72 build (done), 73 harden, 74 build (done), 75 explore, 76 build,
77 cleanup, 78 build, 79 explore, 80 build, 81 explore, 82 review-intent. 73 harden: done (lineage checks on one
seed). 74 build: done (priority 22). 75 explore: done (priority 24, copy error). 77 cleanup: prune the pair demo's 31
options to those a check or a command above uses; consider moving the mutagen's checks to copy error and retiring
`PAM` (changes those checks' outputs: show the capability holds, 3 of 4).

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
- (r) *Copy error in contact copying*: **adopted** in run 0651 as the parameter `pErr`, default 0 (RULES Core changes).
  Open: a default above 0 (and the mutagen retired) would change every world's outputs; whether the core or the
  environment should limit parts that bind their own kind (`g@` and `G@` on one part).
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
                                                   # (about 75 minutes, 4 processes; CHECK_SAVE=dir keeps each world's output)
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
PAW=1 PAF= PAM=0 TRI_PARAMS='{"pErr":0.01}' PA2='Z@&c@|z C@-z!' node tri/demos.js pair 1 240000 runs/x   # copy error
                                                   # instead of the mutagen (check copy-error at 60k): 'types:' lines (bonded
                                                   # triangles by type); PA2='Z@&c@|- C@-z|' the stockless founder (root
                                                   # letters turn over); stepping stone: check cheat-root's env (70k)
PAW=1 PAF= PA2='Z@&c@|z C@-z!' node tri/demos.js pair 1 240000 runs/x   # the head-nursery founder (check nursery at 60k;
                                                   # about 10 minutes at 240k): 420-450 individuals; C@-z the control (chains
                                                   # -zZ@, collapse by 45-105k; nursery-c); add PAM=0 PA3T=20000 PAEN=10
                                                   # PA3='Z@&c@|- C@-z!' for heads that raise nobody (nursery-cheat)
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
