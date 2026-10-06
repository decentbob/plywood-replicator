# Next instance: start here

State on 2026-10-06 (after autorun run 20261006-0450, explore). Read AGENTS.md first (rules of work), then this file.
History: docs/INNOVATIONS.md (newest first), RULES (Core changes), the autorun log and git (earlier handoffs: NEXT.md
at each run's merge: run 0251's at `f7b31f3`, run 0021's at `c98bb3c`, run 2320's at `5850fe7`, run 1921's at `908502a`, run 1850's at `f1ec517`, run 1422's at `4f65d5c`, with the condensed Direction of run 0751; that Direction in full at `a2f3914`).

**Current slice (autorun run 20261006-0621, build, in progress): a world that keeps evolving** (priority 6). Goal: in
the mutagen world (`PAM=0.01 PAHU=1`, seeds 1-4, 300k), a labelled drive on demo `pair` (no core change) under which
dead material returns as blanks (a lysed triangle becomes a copy blank once free), so material held by binding
variants flows. Done when, in at least 3 of 4 worlds, mean blanks stay above about 100 and copies above 10k per 5000
steps through 300k while variants still arise and sweep, against the baseline (same seeds without the drive), with a
check in `tri/check.js`. Stop: if no setting of the drive keeps material flowing, record why (a cost for holding,
IDEAS) and hand off.

**The goal changed (user, 2026-10-05): complex evolution** (AGENTS.md, IDEAS); the organism is a direction. The
user approved the order in "Direction (user)" below during run 0321. Run 1850 keeps that order and changes the vehicle
it is tried on (below).

**Handoff status (autorun run 20261006-0450, explore).** **Heritable variation and selection on the pair, no rule
change** (priority 5 done, Direction 2; INNOVATIONS run 0450, IDEAS "Variation on the pair", RULES candidate (r)).
Contact copying is exact, so a variant part type in a body is copied true; demo `pair` gained labelled starts and a
drive (all off by default, default output byte for byte the same): `PAV`/`PAVK`/`PAVP`/`PAVT` put a neutral marker or
an exposure variant into some R or S; `PAM` is a mutagen (each free part, with probability m per 100 steps, one side's
glue or one mark changed); `PAHU=1` the hazard per triangle. Findings:
1. A neutral marker drifts (half the world marked: fixed or lost in 45-215k steps; from 1 in 10: 0.31-0.51 or lost by
   40k later); patches dissolve within 5000 steps: heredity is by part type in a mixed pool, not by lineage.
2. **Selection:** a seed site or a front without its anchor mark (copied while free, so its part has two sources) put
   into 1 in 10 S (R) fixes by 50k (40k) in 4 of 4 worlds each; bodies do not increase (part-type selection). This
   is Direction 3's minimal test too (two variants on one supply, one wins for a reason: exposure).
3. Under the mutagen (m 0.001-0.03) these exposure variants arise and sweep by themselves (6 of 8 worlds by 60k). Then
   **binding variants win** (a glued `@` side that keeps a body joined; parts binding their own kind, `F@f@&J@` rosettes;
   two types binding each other; in one world R that buds R, then two R-derived types and no S): they catch free parts
   before decay, blanks fall to 2-30, copying to a third or less, evolution slows. 4 of 4 worlds with the per-body
   hazard (it rewards joined bodies), 3 of 4 with the hazard per triangle (one stays a pair to 300k).
Checks: new `pair-sel` 4/4, `pair-sel-c` 4/4 (control), `pair-mut` 4/4; `pair`, `pair-c`, `pair-run` pass as before (the
full suite was not rerun: only demo `pair` and `check.js` changed). `node tri/test.js` 40 pass. Nothing is running.
Pictures `pair-mutagen-rosettes.png`, `pair-variation.png`. Regenerate: `PAB=1000 PAS=50 PAP=5000 PAHT=1000 PAH=0.6
PAD=1 node tri/demos.js pair SEED STEPS runs` plus `PAM=0.01 PAHU=1` (300k, about 10 minutes) or `PAV=mix PAVP=0.1
PAVK=seed PAVT=20000` (200k); the chart was drawn by a one-off script from the `var:`/`pop:` lines (not kept).

**Next step (rotation 52, build): a world that keeps evolving** (priority 6). The mutagen world locks its material
once binding variants appear. Try, as labelled drives on demo `pair` (no core change): deaths that return raw
material, i.e. a hazard per triangle whose hit triangle (and the part it lyses) becomes blanks instead of parts, so
that material held in bodies flows through copying at a fixed rate whatever binds; then `PAM=0.01` in 4 worlds to 300k
against the lock worlds above (seeds 1, 3, 4 lock by 140k): do blanks stay above about 100 and copies above 10k per
5000 steps, and what evolves? Measure first what share of births are fresh copies in the lock worlds (the `fresh`
field counts only R and S). If a drive cannot keep material flowing, write down why (the core may need a cost for
holding: IDEAS). Direction 3 (two kinds on one supply) follows; the mutagen world already makes new kinds compete.

### Direction (review-intent run 20261005-1850)
The argument is in IDEAS ("Sources in proportion to use"); in short:
1. **The front sink is structural.** A part type is made where its free sides are exposed. In the 47-type kind that is
   growth fronts (type k exposed while the front waits for k+1) and, with open walls, only the outward half of a
   one-row ring (the inward half faces the lumen). Exposure differs from type to type, and with 47 unique types in one
   pool the least exposed type sets the rate. Runs 0721, 1051 and 1422 each closed one sink and found the next; no
   drive can make unequal sources equal.
2. **Design rule: every cell of a complete body exposes exactly one copyable side to the outside.** Each living body is
   then one source of each of its types, so types are made in the proportion buds use them, by symmetry, with no need
   signal (run 1422's option (c), met by geometry). The same rule is what heredity needs: a variant part is made in
   proportion to the bodies that carry it. A one-row ring with a lumen cannot meet it, nor a filled hexagon (its root's
   one outer side is the joint, spent after the split). A strip can: its end cells have two free sides.
3. **The pair:** root R `Y@&` `b@` `-` and second cell S `B@` `y` `-|` (side order chosen so a bud points away from its
   parent; as built in run 2320: R `Y@&b@|-`, S `B@-y|`, IDEAS "Built"). A free R binds a body's seed site `y`; its open `b@` emits; a free S binds there; R hears nothing (openRange
   1 suffices: R is the emitter) and its `&` lets go. Rules used: `@` binding, contact copying, the open signal, `&`
   release. No new rule. R is exposed by its `-` side, S by `y` (while no bud sits on it).
4. **Why switch now** (AGENTS: mechanisms in isolation, then combined): on the pair none of the three interacting sinks
   (strands, fronts, lumen) exists, a generation should take thousands of steps instead of about 300 thousand, and a
   variant changes one of two types, so Directions 2 and 3 become measurable. If the pair cannot run on with labelled
   drives, no larger kind will; if it can, the rule and the drive rates carry over. Risk, stated: in template worlds the
   smallest fastest replicator usually wins; what could pay for a longer kind here (predation by `!` outer sides,
   protection, crowding) is Direction 3's question, and it is the research.
5. **Not taken:** run 1422's (b), parts made where they are next used, needs complementary contact copying (a core
   change) and turns growth into crystal growth. (a), few periodic types in a ring, helps only linearly and keeps the
   lumen; a periodic ring comes back later as a compartment on the evolution vehicle.
6. **Housekeeping found:** `budcycle` carries about 20 option variables, many from dead ends (`BCLK`, `BCH`, `BCHT`,
   `BCP`, `BCW`, `BCO`, `BCSV`, `BCGATE`): prune at the next cleanup, after the pair world has taken the drives it reuses.
   Since run 0751 the core grew by one rule (lysis: a capability) and one option (`heldContact`: none); fine.

**Priorities (each a slice; rotation index in brackets).**
1. Done in run 1921 (core-review): `heldContact` removed; (o) closed without a change; busy and refractory removed.
2. Done in run 2320 (build): the pair in isolation (`pairKit` R `Y@&b@|-`, S `B@-y|`; demo `pair`; checks `pair`,
   `pair-c`). Buds point away; no jam seen (a parent buds again once its last bud has moved off: children per body
   0.99 on average, founder 4, at most 7, while blanks lasted; seed 1).
3. Done in run 0021 (harden): speed for pair worlds, 1.8-2.1x, exact.
4. Done in run 0251 (build): Direction 1 on the pair (`PAH` 0.6, `PAD` 1: 4 of 4 worlds to 10^6 steps; check `pair-run`).
5. Done in run 0450 (explore): Direction 2, heritable variation and selection with a labelled mutagen (no core change;
   candidate (r), copy error, not needed yet).
6. [52 build] **A world that keeps evolving:** material keeps flowing once binding variants appear (deaths return
   blanks; Next step above).
7. [54 build] **Direction 3:** two kinds on one supply (the pair and a 3-cell strip, or kinds the mutagen made): who
   wins, and why. [55 explore] heredity of combinations: a body's parts come mostly from its own copies (IDEAS).
8. Frozen: the 47-type organism (feeding, (n), the front sink, lysis in the lineage); it returns as the complex end once
   the pair world runs on and varies.

**Rotation (autorun `projects/plywood/rotation.txt`): unchanged**; its mix (5 build, 3 explore, 1 harden, 1 cleanup, 1
review-intent, 1 core-review per 12) fits a new vehicle that needs mostly building. 52 build, 53 cleanup, 54 build, 55 explore, 56 build,
57 explore, 58 review-intent, 59 core-review.

### Direction (user, 2026-10-05, approved during run 20261005-0321): complex evolution first
The goal is complex evolution (AGENTS.md, IDEAS 2026-10-05); the organism that feeds its bud is a direction, not the
finish line. The user approved this order for the next slices:
1. **A world that runs indefinitely:** material returns to blanks under conservation, with a steady, labelled
   environment drive. On the 47-type kind: food stock spent (0321), blanks in leaked strands (0721), scavengers cannot
   track the population (1051), blanks at stalled fronts (1422). Next: on the pair (priority 4 above).
2. **The simplest heritable variation:** e.g. contact copying that now and then makes a different part type, the
   variant itself copied true (heredity with mutation in one rule; a core change: make the case in RULES first).
3. **A minimal competition test:** two variants on one food supply; does one win, and for a reason?

**Core-change candidates (for the next `core-review` or `explore`).**
- (r) *Copy error in contact copying* (run 0450): not needed yet; a labelled mutagen on free parts gives the same
  variants (RULES, Core changes). Open: whether the core or the environment should limit parts that bind their own
  kind (`g@` and `G@` on one part), which lock the material in the mutagen world.
- Closed in run 1921: (p) removed (git `4f65d5c`); (o) not adopted: the oracle `LYFIX` never fades and is removed, a
  fading variant ("a partner bonded since the last pass counts as open one bond away") left false releases at 8, 0, 2,
  14 (base 8, 0, 2, 13). Before any new fix for (o), trace one `falseRel` in `budcycle-lysis` seed 4. Done: (q) busy
  and refractory removed (RULES, Core changes).
- (n) *Bud only after letting go* (run 1721): a seed site binds a root only while its triangle hears no open signal
  (oracle `BCGATE=1`). Organism lineage; frozen with it.
- (j) *Monomer mix* (run 0022) and (l) *a copy side with a glued anchor side* (run 0820): no design, no such type.
- Settled, keep: (f) the seed site `y` is copied while no bud sits on it (the pair relies on it). Not needed: (k).
  Done: (e), (i), (m) first step (lysis). Nothing else in the core is unused (RULES, Core inventory).

### Open follow-ups (not priorities; take when a run's kind fits)
- **Core review:** same-pass partner reads (zip, gap, release, fn) are allowed by convention (RULES, Locality audit);
  change only if a locality problem traces back to them. Coverage hook: `COV_OUT=$PWD/runs/cov.jsonl NODE_OPTIONS="-r
  ./tri/coverage.js" node tri/check.js` (one JSON line per demo world: marks present, rule events). To show a change
  leaves outputs the same: `CHECK_SAVE=$PWD/runs/a node tri/check.js` before and after (another worktree), then
  `diff -r runs/a runs/b`.
- **Speed side note (run 1721):** a supply drive that keeps its stock outside the world, about 1.6x early in a run,
  changes outputs; decide it in a `build` that changes the setup.
- **Bigger cells and letter reuse** (user, 2026-10-03; IDEAS): R 5 is the largest all-unique kind (46 letters); if
  a slice needs a larger cell, reuse letters inside sealed compartments.

## Commands
```
node tri/test.js                                   # fast checks (~5 s)
node tri/check.js [id ...] > runs/check.txt         # capability checks: one PASS/FAIL line each, printed as each finishes
                                                   # (about an hour, 4 processes; CHECK_SAVE=dir keeps each world's output)
BCGEN=3 BCAFTER=900000 node tri/demos.js budcycle 3 1200000 runs/x   # the lineage (defaults: corner bud, closed walls, no harness,
                                                   # 20 blanks + 400 pre-food at 0.0003, monomer loop BCL 0.002, world 36): three
                                                   # generations (check budcycle-3; about 30 minutes); 'letgo:' lines per bud, ownCopies
                                                   # in the result. Options: extra parts per type (8); BCB blanks, BCI inside, BCS world,
                                                   # BCR openRange (9), BCE E parts (0), BCES=0/2 no E source / outside, BCF/BCFP the
                                                   # supply, BCL the monomer loop, BCDBG=1 census, BCGATE=1 candidate (n)'s oracle
BCQ=1 BCR=50 BCC=2 BCGEN=3 BCAFTER=900000 node tri/demos.js budcycle 3 1200000 runs/x   # lysis in the lineage: a receptor on each
                                                   # body's last cell, 2 cutters (check budcycle-lysis; about 30 minutes); BCA anchor cell
                                                   # (6), BCT cutter type; result: lysedBuds, lysedAt, falseRel, poolMin
node tri/demos.js lysis 1 1000000 runs/x           # a stuck bud taken apart by cutters at its waiting anchor (cell 44, openRange 50;
                                                   # check lysis, 2.5 minutes); a new bud grows from its parts. LYC cutters (4), LYP parts
                                                   # per type (0), LYA anchor cell, LYR openRange, LYS world (30)
node tri/demos.js budpool 1 250000 runs             # the kind's bud grown from a pool of its 47 part types (check budpool; extra: parts per
                                                   # type, 8; BPE: E parts, 40; BPB: blanks, 8; BPS: world, 30; BPR: openRange, 1; BPHOLD=0: no
                                                   # harness; BPES=1: E's pore side plain; BPA=k: the anchor on cell k)
node tri/demos.js pair 1 3000 runs                # the pair (check pair; 10 s): one founder among copy blanks; PAB blanks (300), PAS world
                                                   # (30), PAR openRange (1), PAT=1 the turned order, PAKR/PAKS other R/S types (pair-c:
                                                   # PAKS='B@y-|' PAKR='Y@&b@-'); result: bodies, gen, copies by type, doublings, children
PAB=1000 PAS=50 PAP=20000 PAHT=1000 PAH=0.6 PAD=1 node tri/demos.js pair 1 1000000 runs/x   # the pair world that runs on
                                                   # (check pair-run at 100k steps; about 35 minutes per 10^6): PAH body hazard,
                                                   # PAD decay of free parts (per 100 steps), PAHT hazard start, PAP 'pop:' lines
node tri/demos.js closure                          # the designed kind (budKit): parent, bud grown in signal passes, catch, split (no physics)
POOLB=20 POOLISO=1 node tri/demos.js pool 1 100000 runs 4   # a waiting front among 20 blanks and 4 next parts: copies per bound part
node tri/demos.js imprint 1 100000 runs 150px      # a cell fed through a pore copies its held genome; 3 sterile rivals (check imprint-pore;
                                                   # 150pc, 150pn: controls; 150ph: a hooded pore; 150pw: 7-cell pore)
node tri/demos.js imprint 1 30000 runs g           # a held strand copied from copies of its own triangles (gc: control)
node tri/demos.js imprint 1 200000 runs            # contact copying: a ring closes and a second grows from copy blanks only
```
Older demos: `copy` (chain copying, the founder held by its high end) and `ring` (a ring kit closes); each check in
`tri/check.js` names its seeds, steps and extra. Commands of earlier setups are in their INNOVATIONS entries (options
since removed: in git at the commit each entry or `tri/demos.js` names). Pictures go to `runs/NAME.png` with saved
states; `TRI_NOPIC=1` turns them off. `TRI_RESUME=runs/x/NAME_tNNN.json.gz` continues a demo world from a saved state;
`TRI_PARAMS='{...}'` overrides parameters.

## Pitfalls learned
Read before designing a layout: docs/IDEAS.md, "Pitfalls learned (copy lineage)" (doorways, anchors, food sinks,
signals, rings, physics) and "Pitfalls from the casting lineage" (kits, pockets, doors, flaps; that lineage is
removed, its lessons stay).
