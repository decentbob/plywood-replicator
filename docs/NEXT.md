# Next instance: start here

State on 2026-10-06 (after autorun run 20261006-1750, explore). Read AGENTS.md first (rules of work), then this file.
History: docs/INNOVATIONS.md (newest first), RULES (Core changes), the autorun log, and git: each run's handoff is
this file at its merge (`git log -p docs/NEXT.md`; the review-intent Direction of run 0751 in full at `a2f3914`, the
pair Direction of run 1850 in full at `20e9a88`).

**Goal (user, 2026-10-05): complex evolution** (AGENTS.md, IDEAS); the organism that feeds its bud is a direction.
Since review-intent run 1850 the vehicle is **the pair** (2 cells, 2 types; IDEAS "Sources in proportion to use"): a
kind where every cell of a body exposes exactly one copyable side, so part types are made in the proportion buds use
them. The 47-type organism lineage is frozen; it returns as the complex end once the pair world varies and competes.

**Handoff status (autorun run 20261006-1750, explore).** Priority 9, heritable diets, works; no rule change. Results
(INNOVATIONS run 1750, IDEAS "Diets evolve by one letter"):
1. A 2-cell stock kind `Z@&c@|- C@-|z|` (one copy, one stock part per birth; its diet is its front glue) in run 1620's
   duo world with stocks C, E, G of 150 each. New in demo `pair` (off by default; default, `pair-flow` and `duo-stock`
   output byte for byte as main): `PAMF=1` limits the mutagen to front glues (letters `PAMA`), `diet:` lines, a
   `diets:` result line, a diets picture (`render` gains an optional fill per triangle).
2. From one founder of diet c: mutants e and g take hold at 15k-30k steps and fill their stocks within 5-10k; three
   diets side by side, each near its stock (4 of 4 with letters c..h; 4 of 4 reach three or more with a..z). Controls
   4 of 4: no mutagen, or only stock C: one diet. Unequal stocks (150, 250, 75): diets follow them (2 worlds).
3. Why the wait: diet c alone keeps a starving bud on nearly every seed site (120-140 individuals, as many waiting), so
   a mutant rarely finds a site and loses its own to c's copies; about 1 in 130-280 mutants with a stocked letter takes
   hold.
4. Unplanned: a front `z@|` catches other kinds' roots by their `Z@` side: a 3-cell kind built from the others' copies
   (2 of 4 a..z worlds; 8-15 individuals to 120k). A longer kind by one mutation.
5. Checks `diets`, `diets-c`, `diets-ns`: CHECKRESULTS. Chart `docs/pictures/diets-chart.png` drawn from the `diet:`
   lines by an ad hoc script (not kept); its worlds are the INNOVATIONS commands.
Nothing is running after the merge.

**Next step (rotation 58, review-intent).** Weigh the direction after priority 9. Candidates for priority 10, each a
slice: (a) the z kind: what limits a kind that eats other kinds' roots, and do longer z chains evolve (body length by
mutation); (b) diets that differ in length: stocks that carry a front of their own (run 1620's `C@d@|-|`), so a
mutant reaches a longer diet; (c) more diets than the blanks support: do diets then compete, and on what. (a) is the
most open-ended (kinds that live on kinds) and needs no new option.

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
6. Done: (3) Direction 3, two kinds on one supply (run 1150, checks `duo`, `duo-inv`, `duo-inv-c`): the pair beats a
   3-cell strip from every start (lower R*); a trap for free parts on the extra cell does not pay.
7. Done: heredity of combinations by locality (run 1322, checks `pair-host`, `-c`, `-mx`): s about 0.44, a lean pool
   0.58; a parasite part is excluded once s > 1 - 1/k. By construction (s near 1): not in a pair (parity, IDEAS).
8. Done: what pays for a longer kind (run 1620, checks `duo-stock`, `-inv`, `-c`, `-tri`, `-hi`): a stock of parts only it
   binds, when risk is per individual (coexistence at stock 400, the strip wins at 600; hazard per triangle: the pair).
9. Done: heritable diets (run 1750, checks `diets`, `-c`, `-ns`): front-glue mutants reach unused stocks and coexist
   (three diets, 4 of 4); a z front that eats other kinds' roots makes an unplanned 3-cell kind.
10. [58 review-intent decides] candidates (a)-(c) above.
10. Frozen: the 47-type organism (feeding, candidate (n), the front sink, lysis in the lineage).

Rotation (autorun `projects/plywood/rotation.txt`), unchanged: 58 review-intent, 59 core-review, 60 build, 61 harden,
62 build.

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
- (o) the open relay's one-pass lag (false releases in the lineage): closed in run 1921 without a change. Seen again in
  a minimal kind (run 1150): a 3-cell strip's root lets go when its second cell binds (it stops emitting in the pass the
  new front starts) at openRange 1 or 2; openRange 3 covers it by the echo through the parent. A fix to weigh: binding
  sets the caught part's open signal at once (binding already sets both parties' state). Not needed while the range works.
- (n) *Bud only after letting go* (run 1721): its oracle `BCGATE` was removed in run 0920 (git `20e9a88`). Organism
  lineage; frozen with it.
- (j) *Monomer mix* (run 0022) and (l) *a copy side with a glued anchor side* (run 0820): no design, no such type.
- Settled, keep: (f) the seed site `y` is copied while no bud sits on it (the pair relies on it). Not needed: (k).
  Done: (e), (i), (m) first step (lysis), (p) and (q) removed in run 1921. Nothing else in the core is unused (RULES,
  Core inventory).

**Open follow-ups (not priorities; take when a run's kind fits).**
- Heredity by construction (run 1322, IDEAS parity): a kind of four or more cells in an arc round a vertex whose
  parts are copied beside the cell they join; or a compartment. An `explore` may design it; not needed for priority 8.
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
PAHB=2 PAB=1000 PAS=50 PAHT=1000 PAD=1 PAHU=1 PAP=2000 PAH=0.3 PADI=10 PAV=mix PAVP=0.1 PAVK=parasite PAVT=20000 node tri/demos.js pair 1 40000 runs/x
                                                   # heredity by locality (check pair-host; about 2 minutes): PAPS=1 'par:' lines
                                                   # (parental share), PAV=link two-marker linkage, PAVK=parasite/selfish S variants,
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
