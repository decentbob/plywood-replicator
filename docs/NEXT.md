# Next instance: start here

State on 2026-10-06 (after autorun run 20261006-0251, build). Read AGENTS.md first (rules of work), then this file.
History: docs/INNOVATIONS.md (newest first), RULES (Core changes), the autorun log and git (earlier handoffs: NEXT.md
at each run's merge: run 0021's at `c98bb3c`, run 2320's at `5850fe7`, run 1921's at `908502a`, run 1850's at `f1ec517`, run 1422's at `4f65d5c`, with the condensed Direction of run 0751; that Direction in full at `a2f3914`).

**The goal changed (user, 2026-10-05): complex evolution** (AGENTS.md, IDEAS); the organism is a direction. The
user approved the order in "Direction (user)" below during run 0321. Run 1850 keeps that order and changes the vehicle
it is tried on (below).

**Current slice (autorun run 20261006-0450, explore; in progress): Direction 2, heritable variation on the pair world.**
Goal: show whether a variant part type is inherited on the running pair world (h 0.6, d 1, 1000 blanks, world 50), with
the existing core first. (1) A neutral marked variant (R `Y@&b@|x`: its outer side carries a glue nothing binds) put
into half the world at 100k steps: does it stay in patches, how does its share drift, how long does it last? (2) Variation
without a core change: a labelled mutagen drive (each free part, now and then, gets one side changed: its glue or one
mark), and a body census by type: which variants appear, which persist, does any spread? Done when (1) is measured in
4 worlds and (2) is run in 4 worlds with the variants listed; a core change (copy error inside contact copying) only if
the drive shows something the core needs; otherwise its case is written as "not needed yet". Stop at about 4 hours.

**Handoff status (autorun run 20261006-0251, build).** **The pair world runs on** (priority 4 done, Direction 1):
two labelled drives in demo `pair`, a body hazard (`PAH`=h: every 100 steps each body hit with probability h, lysed
into its R and S) and decay of free parts into blanks (`PAD`=d), keep 1000 blanks in world 50 turning over. At h 0.6,
d 1: 4 of 4 worlds alive at 10^6 steps, 217-324 bodies throughout, 1.41M births each, generation 5884-6071, 95% of the
parts born fresh copies, copies R : S 1.22 (INNOVATIONS run 0251, picture `pair-runs-on.png`). The 50-200 bodies first
proposed lie at an extinction edge: h 0.7 gives 50-190 bodies and 2 of 4 worlds die by 10^6, h 0.8 dies in 4 of 4. Slow
decay (d 0.01-0.3) runs on too but rebuilds bodies from a dead body's parts (5-20% fresh), useless for heredity. The
mean field's birth law (IDEAS) did not decide the numbers: material (slow decay) or the meeting of two fresh parts (fast
decay) did. **Copying is local**: a part is born into a body 2.3 side lengths from where it was copied (91% within 5;
random: about 19); bodies cluster in patches. New check `pair-run` (100k steps, h 0.6, d 1; 4 worlds, need 3): `pair`,
`pair-c` and `pair-run` pass (`pair-run` 4 of 4: 267-285 bodies, generation 620-635 at 100k steps, 194 s); the full suite was not rerun (only demo `pair` changed, and its
default output is byte for byte the same: seeds 1 and 2 compared). `node tri/test.js` 40 pass. Nothing is running.
To regenerate the long worlds: `PAB=1000 PAS=50 PAP=20000 PAHT=1000 PAH=0.6 PAD=1 node tri/demos.js pair SEED 1000000
runs/x` (about 35 minutes each; PAH=0.7 for the edge).

**Next step (rotation 51, explore): Direction 2, heritable variation** (priority 5) on the running pair world (h 0.6,
d 1). Make the case in RULES (Core changes) first: contact copying now and then makes a different type, the variant
then copied true. Which sides may vary: an outer side (R's `-`, S's `-`) changes behaviour without breaking assembly; a
joint side (`Y@&`, `b@|`, `B@`, `y|`) is lethal or makes a new kind. Inheritance here is by neighbourhood (copies land
2-3 side lengths away), so measure first: does a neutral marked variant (a mark that changes nothing, e.g. on an outer side that
still takes copy blanks: check what a blank binds first) stay in patches and drift, and how long does it last against 280 bodies? Then a variant with an effect. To know
whether a body's copies go to its own buds, the copy log would need the template (observation only, `sim.js` copy
event).

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
5. [51 explore] **Direction 2:** heritable variation: contact copying now and then makes a variant (core change; case in
   RULES first: which sides may change; outer sides change behaviour without breaking assembly, joint sides are lethal;
   how a longer kind could arise).
6. [52 build] **Direction 3:** two kinds on one supply (the pair and a 3-cell strip): who wins, and why.
7. Frozen: the 47-type organism (feeding, (n), the front sink, lysis in the lineage); it returns as the complex end once
   the pair world runs on and varies.

**Rotation (autorun `projects/plywood/rotation.txt`): unchanged**; its mix (5 build, 3 explore, 1 harden, 1 cleanup, 1
review-intent, 1 core-review per 12) fits a new vehicle that needs mostly building. 47 core-review, 48 build, 49
harden, 50 build, 51 explore, 52 build, 53 cleanup, 54 build, 55 explore, 56 build, 57 explore, 58 review-intent.

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
