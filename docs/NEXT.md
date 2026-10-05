# Next instance: start here

State on 2026-10-05 (after autorun run 20261005-1921, core-review). Read AGENTS.md first (rules of work), then this file.
History: docs/INNOVATIONS.md (newest first), RULES (Core changes), the autorun log and git (earlier handoffs: NEXT.md
at each run's merge: run 1850's at `f1ec517`, run 1422's at `4f65d5c`, with the condensed Direction of run 0751; that Direction in full at `a2f3914`).

**In progress (autorun run 20261005-2320, build): the pair in isolation** (priority 2). Goal: `structures.pairKit`,
demo `pair`, check `pair` (one founder among 300 copy blanks grows to 20 bodies in at least 3 of 4 worlds); stop once
the check passes and bodies, generations and the R : S pool are measured. First finding: the IDEAS side order fails
(S's only source is its seed site, covered by a waiting bud: 2 bodies by 20k steps); with the anchor mark moved to the
seed site (S `B@-y|`) and the front (R `Y@&b@|-`) 4 of 4 worlds reach 20 bodies by about 400-800 steps.

**The goal changed (user, 2026-10-05): complex evolution** (AGENTS.md, IDEAS); the organism is a direction. The
user approved the order in "Direction (user)" below during run 0321. Run 1850 keeps that order and changes the vehicle
it is tried on (below).

**Handoff status (autorun run 20261005-1921, core-review).** Core smaller, no capability lost: `heldContact` with its
relay `hold` removed (priority 1 done); the busy relay and the state refractory removed (removal (q)); candidate (o)
closed without a change (its oracle never fades; a fading variant did not lower false releases). Core: 6 marks, 3
relayed signals, 4 exposed one-bond values, 2 states, no option (RULES, Core inventory and Core changes). `node
tri/test.js` 38 tests pass; `tri/check.js` 12 of 12 on the final rules (`budcycle-3` 3 of 4: over seeds 1-8 the lineage
reaches generation 3 in 5 of 8, base 6 of 8; expect this check near its margin). Nothing is running. Previous run
(1850, review-intent): Directions 1-3 move to **the pair** (2 cells, 2 types; designed, not demonstrated: IDEAS,
"Sources in proportion to use"); the 47-type lineage is frozen, its checks stay.

**Next step (rotation 48, build): the pair in isolation** (priority 2 below). The core it needs (`@` binding, contact
copying, the open signal, `&` release) is unchanged by this run.

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
   parent). A free R binds a body's seed site `y`; its open `b@` emits; a free S binds there; R hears nothing (openRange
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
2. [48 build] **The pair in isolation:** `structures.pairKit`, demo `pair`: one founder pair among copy blanks (about
   300, world about 30); measure bodies over time, generation depth, the R : S pool. Check: at least 3 of 4 worlds grow
   from one founder to 20 bodies. Look at the pictures first: does the bud point away, do buds jam beside parents?
3. [49 harden] Speed for long worlds of many small bodies; `budcycle` untouched.
4. [50 build] **Direction 1 on the pair:** labelled drives (free parts decay to blanks; a body hazard, lysis into parts,
   as `BCH` does); 4 long worlds; check: bodies still budding at the end in 3 of 4, many generations past the founder,
   pool R : S near 1.
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
