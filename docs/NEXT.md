# Next instance: start here

State on 2026-10-06 (after autorun run 20261006-0920, cleanup). Read AGENTS.md first (rules of work), then this file.
History: docs/INNOVATIONS.md (newest first), RULES (Core changes), the autorun log, and git: each run's handoff is
this file at its merge (`git log -p docs/NEXT.md`; the review-intent Direction of run 0751 in full at `a2f3914`, the
pair Direction of run 1850 in full at `20e9a88`).

**Goal (user, 2026-10-05): complex evolution** (AGENTS.md, IDEAS); the organism that feeds its bud is a direction.
Since review-intent run 1850 the vehicle is **the pair** (2 cells, 2 types; IDEAS "Sources in proportion to use"): a
kind where every cell of a body exposes exactly one copyable side, so part types are made in the proportion buds use
them. The 47-type organism lineage is frozen; it returns as the complex end once the pair world varies and competes.

**Current slice (autorun run 20261006-1150, build; in progress): Direction 3, two kinds on one supply.** Demo `pair`
gained `PA2` (a second kind: `stripKit` types), `PA1=0`, late founders `PA1T`/`PA2T` with `PAEN`, and `duo:` lines; checks
`duo`, `duo-inv`, `duo-inv-c` added (not yet run as a suite). Results so far (common: `PAB=1000 PAS=50 PAHT=4000 PAHB=2
PAHU=1 PAP=5000 PAR=3 PAD=1 PAH=0.1 PA2='Z@&c@|- C@d@|- D@-z|'`): the strip needs openRange 3 (else its bud lets go
when the middle cell binds: the relay lag) and lives alone only below h about 0.12 (pair: 0.7); alone the pair draws
blanks to 11, the strip to about 100 (it uses 23% of its copies, the pair 85%); the pair wins from one founder each (3 of
3), 5 pairs entering a strip world at 30k win (4 of 4), 5 strips entering a pair world die (4 of 4). The predator strip
(M `C@d@|y!`, lyses free pair R) does not change that at d 1 (4 of 4 both ways); at `PAD=0.1` it suppresses the pair's
free R and repelled the pairs in seed 2 (seed 1: pair won at 60k). Running: `runs/inv5.sh` (d 0.1, seeds 3-4 predator,
2-4 plain strip; outputs `runs/d01_*`). Next: finish (b) at d 0.1, records, suite.

**Handoff status (autorun run 20261006-0920, cleanup).** No new capability, no rule change.
Results (INNOVATIONS run 0920):
1. `budcycle`'s dead options removed (`BCLK`, `BCH`, `BCHT`, `BCP`, `BCW`, `BCO`, `BCSC`, `BCSV`, `BCGATE`) with the
   chart `node tri/render.js pop`; in git at `20e9a88`. Output byte for byte the same on 8 worlds of 150k steps.
2. Check suite 20 of 20 (5075 s, about 85 minutes: the frozen lineage's `budcycle-3` and `budcycle-lysis`, about 2100 s
   per world, take most of it). Both pass 3 of 4 with seed 1 failing (the same on main: both seed-1 outputs byte for byte the same over 1.2M steps).
3. `pair-mut` kept, against the last handoff's suggestion: its criterion holds in only 1 of 4 `pair-flow` worlds.
4. ROADMAP's frozen-lineage sections and this file condensed; autorun plywood prompts fixed for three repeated
   frictions (waits, remote branch deletes, the harden baseline).
Nothing is running.

**Next step (rotation 54, build): Direction 3 on the flowing world** (priority 7 below): two kinds on one supply in
the `pair-flow` setting (the pair and a 3-cell strip, or kinds the mutagen made): who wins, and why. Then (55,
explore) heredity of combinations: the selfish-S extinction of run 0621 shows the limit is that selection sees part
types, not bodies (IDEAS "Deaths that return blanks").

## Direction and priorities

The user approved this order (run 0321): (1) a world that runs indefinitely under conservation with steady, labelled
drives; (2) the simplest heritable variation; (3) a minimal competition test (two variants on one supply: does one
win, and for a reason?). On the pair (each a slice; rotation index in brackets):
1. Done: the pair in isolation (run 2320, checks `pair`, `pair-c`); speed for pair worlds 1.8-2.1x (run 0021).
2. Done: (1) on the pair, hazard and decay drives (run 0251, check `pair-run`; 4 of 4 to 10^6 steps).
3. Done: (2) heritable variation and selection with a labelled mutagen, no core change (run 0450, `pair-sel`).
4. Done: a world that keeps evolving: deaths return blanks (`PAHB=2`; run 0621, `pair-flow`). By 500k a 3x world is
   one-type chains and rosettes whose variants keep replacing one another; no world grows more complex.
5. Done: cleanup (run 0920): budcycle's dead options pruned.
6. [54 build] **(3) Direction 3:** two kinds on one supply. Risk, stated in run 1850: in template worlds the smallest
   fastest replicator usually wins; what could pay for a longer kind (predation by `!` outer sides, protection,
   crowding) is the research.
7. [55 explore] heredity of combinations: a body's parts come mostly from its own copies (IDEAS).
8. Frozen: the 47-type organism (feeding, candidate (n), the front sink, lysis in the lineage).

Rotation (autorun `projects/plywood/rotation.txt`), unchanged: 54 build, 55 explore, 56 build, 57 explore, 58
review-intent, 59 core-review, 60 build.

**Core-change candidates (for the next `core-review` or `explore`).**
- (s) *Lysed material returns as blanks* (run 0621): the labelled drive `PAHB=2` as physics (a lysed triangle that comes
  free becomes a copy blank, replacing "returns to a fresh state of its type"). Not needed while the drive does it; it
  would make every death return raw material, and lysis stop recycling parts (the lysis demo's bud regrows from them).
- (r) *Copy error in contact copying* (run 0450): not needed yet; a labelled mutagen on free parts gives the same
  variants (RULES, Core changes). Open: whether the core or the environment should limit parts that bind their own
  kind (`g@` and `G@` on one part), which lock the material in the mutagen world.
- (o) the open relay's one-pass lag (false releases in the lineage): closed in run 1921 without a change; before any new
  fix, trace one `falseRel` in `budcycle-lysis` seed 4.
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
                                                   # (about 85 minutes, 4 processes; CHECK_SAVE=dir keeps each world's output)
node tri/demos.js pair 1 3000 runs                # the pair (check pair; 10 s): one founder among copy blanks; PAB blanks (300), PAS world
                                                   # (30), PAR openRange (1), PAT=1 the turned order, PAKR/PAKS other R/S types (pair-c:
                                                   # PAKS='B@y-|' PAKR='Y@&b@-'); result: bodies, gen, copies by type, doublings, children
PAB=1000 PAS=50 PAP=20000 PAHT=1000 PAH=0.6 PAD=1 node tri/demos.js pair 1 1000000 runs/x   # the pair world that runs on
                                                   # (check pair-run at 100k steps; about 35 minutes per 10^6): PAH body hazard,
                                                   # PAD decay of free parts (per 100 steps), PAHT hazard start, PAP 'pop:' lines
PAHB=2 PAB=1000 PAS=50 PAP=5000 PAHT=1000 PAH=0.6 PAD=1 PAM=0.01 PAHU=1 node tri/demos.js pair 1 300000 runs/x   # the mutagen
                                                   # world that keeps evolving (check pair-flow at 200k; about 4 minutes): PAHB=2 every
                                                   # lysed triangle returns as a blank; PAM the mutagen, PAHU=1 hazard per triangle;
                                                   # 'mut:' census lines, 'evolving:' result line; PAB=3000 PAS=87: 3x world
                                                   # (selection: PAV, PAVK, PAVP, PAVT, checks pair-sel, pair-sel-c)
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
