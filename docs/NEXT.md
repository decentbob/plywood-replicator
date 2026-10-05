# Next instance: start here

State on 2026-10-05 (after autorun run 20261005-1422, explore). Read AGENTS.md first (rules of work), then this file.
History: docs/INNOVATIONS.md (newest first), RULES (Core changes), the autorun log and git (earlier handoffs: NEXT.md
at each run's merge, e.g. `a2f3914` for run 2221's, which also holds the full Direction text of run 0751).

**The goal changed (user, 2026-10-05): complex evolution** (AGENTS.md, IDEAS); the organism is a direction. The
user approved the order in "Direction" below during run 0321.

**Handoff status (autorun run 20261005-1422, explore).** Candidate (p), free strands not contact-copied: **not yet**
(INNOVATIONS run 1422; RULES Core changes, candidate (p); IDEAS "Closing one sink moves the blanks to the next";
picture `heldcontact_2m.png`). Built as the option `heldContact` (off by default; the relayed value `hold` and a gate
in copy bind; test "copy side (heldContact ...)"); default outputs unchanged. Four 2M `budcycle` worlds (run 1051's
drives, no scavengers, seeds 2-5) against the same worlds without it: the strand sink closes (`gF` 0 against
1133-1979), blanks stay 2-39 (control 0-1) and 2-5 complete bodies live at 2M (control 0-2), but the saved blanks go to
stalled kit fronts, which copy their own type (parts 519-670, one type up to 356; control 45-122), and the lineage is
no deeper (highest generation 1, 0, 3, 3 against 2, 2, 2, 2). Also seen in both: nearly every let-go is incomplete
without scavengers (a growing bud's anchor catches a nearby free strand at 18-33 cells; the root, beyond `openRange`
9 of the front, then lets go). Not made the rule; the option stays for the `core-review` (47) to adopt or remove.
`node tri/test.js` 38 tests; `node tri/check.js` on this code (default unchanged): see the merge commit. Nothing is
running. Raw logs were in `runs/` (regenerate with the INNOVATIONS command: about 65 minutes per world with the option,
85 without, 4 at once). Small tool change: `popChart` draws a label starting with `~` dashed (a control).

**Next steps (proposals).**
1. **The front sink (next `review-intent`, 46: a design question).** Under closed walls type k is made only at a
   waiting front of cell k, exactly where k is no longer needed; a front stalled for want of k+1 piles up k while k+1
   stays empty (runs 0721, 1051, 1422). Every run of Direction 1 has ended on this weakest-link structure of the
   47-type kind. Weigh: (a) a kind with few part types (a periodic ring: each type used many times per body, so no
   single type limits; closure then has to come from geometry or a count-free signal; run 0751 left it for later),
   (b) parts made where they are used next (a front of cell k a template for k+1: not possible with contact copying,
   which copies the template's own type), (c) a source of every type in each living body with need-limited exposure.
   Decide which one a `build` or `explore` tries next.
2. **Core review (47): `heldContact` the rule or removed.** Evidence above: it closes the strand sink and keeps more
   bodies alive but does not by itself make the lineage longer. Suggestion: keep it only if the next design (step 1)
   still leaks strands; otherwise remove it (git keeps it at this run's merge). With it on as the rule, run the check
   suite (`CHECK_SAVE`) to see which worlds change. Also (o) and the incomplete let-gos above (a growing bud catching
   early): either the catch waits for completion (candidate (n)-like gate on the anchor, read from the open signal) or
   the release reads more than `openRange` 9.
3. **The simplest heritable variation** (Direction 2) and **competition** (Direction 3), as before; then the older
   items: the founder's start-up jam (seed 1), candidate (o), candidate (n) with lysis.

### Direction (user, 2026-10-05, approved during run 20261005-0321): complex evolution first
The goal is complex evolution (AGENTS.md, IDEAS 2026-10-05); the organism that feeds its bud is a direction, not the
finish line. The user approved this order for the next slices, ahead of the priorities below (which stay as the
vehicle's to-do list):
1. **A world that runs indefinitely:** material returns to blanks under conservation, with a steady, labelled
   environment drive; today every `budcycle` world freezes once its food stock is spent (run 0321); with decay and
   death as labelled drives the blanks end in leaked genome copies (run 0721: not yet); with two scavengers 1 of 4 worlds still makes offspring near 4M (run 1051); with free strands not copied the blanks
   move to stalled fronts (run 1422; next step 1 above).
2. **The simplest heritable variation:** e.g. contact copying that now and then makes a different part type, the
   variant itself copied true (heredity with mutation in one rule; a core change: make the case in RULES first).
3. **A minimal competition test:** two variants on one food supply; does one win, and for a reason?

### Direction (review-intent run 20261004-0751, condensed; full text in git at `a2f3914`)
Standing conclusions: (a) capabilities are being combined in one demo, `budcycle` (pool growth, anchors, `heldCopy`,
completion release, contact copying, now lysis); the path to the organism is that demo. (b) The lineage burns down its
prepared stocks (food, part pool); an indefinite lineage under conservation needs material returning to use (lysis,
run 2051, is the first step; the monomer loop `BCL` a labelled stand-in). (c) **The goal's second half is not met:
"feeds it until it can live on its own".** Local measure: the bud copies its own strand after the split and its own bud
catches one of those copies (`ownCopies` in `budcycle`'s result). (d) Retire checks of layouts the lineage has left
instead of re-tuning them; keep diagnostic options few. (e) Speed matters for the lineage: one `harden` per twelve runs.

**Priorities (in order; each a slice).** Done since run 0751: `heldCopy` the rule (0820), the corner default and three
generations (1021), speed (1421), where the blanks go (1721), lysis in isolation (2051) and in the lineage (2221).
1. **Core change (o)** (next `explore` or `core-review`): the open relay's lag, below.
2. **"Feeding" the offspring (user 2026-10-04, IDEAS):** the parent should pass its bud the building blocks it needs
   to grow and later replicate; today the bud takes them from the shared environment and the parent gives only a seed
   site and a strand. Design question for an `explore`, together with the release condition "until it can live on its
   own" (a hold that lasts until the caught strand has been copied once would read the anchor's strand's busy relay: a
   core change, worth it only if a fed bud still fails to copy after letting go).
3. **Later:** N generations as the organism's own check (a lineage that runs until stopped), then the backlog (scanner
   gate, membrane growth). Other paths weighed in run 0751 and left for later: fewer part types (a periodic ring),
   a genome whose exposure matches its use (candidate (j)).

**Rotation (autorun `projects/plywood/rotation.txt`):** 45 explore (done: run 1422, candidate (p), not yet),
46 review-intent, 47 core-review, 48 build, 49 harden, 50 build.

**Core-change candidates (for the next `core-review` or `explore`).**
- (p) *Contact copying follows "held"* (run 1051): built as the option `heldContact` in run 1422 (not yet: it closes
  the strand sink, the blanks then pile up at stalled fronts); adopt or remove at the core review (next step 2).
- (o) *The open relay hears "complete" too early after a new bond* (run 2051): a bonded triangle whose partners all had
  0 or -1 in the previous pass hears 0, so a triangle joined by a partner that was free a pass ago (-1: not yet heard)
  can conclude "complete". Proposed: a triangle that would hear 0 while a bonded partner had -1 hears -1. Locality:
  partners' previous values, as now. Effect: `&` releases wait one more pass in such cases; a -1 wave may cross silent
  bodies when a dock or root binds them (one pass each). Evidence: traced in `lysis` (root binds 4006, cell 1 binds
  4007, released 4008); oracle `LYFIX=1` in `lysis` removes the detour; 3-9 incomplete root releases per world in
  `budcycle` (run 2221). Before deciding: the check suite with `CHECK_SAVE` to see which worlds change.
- (n) *Bud only after letting go* (run 1721): a seed site binds a root only while its triangle hears no open signal,
  so a bud still growing or waiting for its catch cannot start its own bud. Locality: the triangle's own open signal,
  relayed. Needs the seed cell within `openRange` of the anchor (today 39 bonds apart, range 9). Oracle `BCGATE=1`
  shows the effect (every chain bud copies its strand after let-go) and the cost (slower; surplus buds still starve
  the next generation). Weigh with lysis.
- (j) *Monomer mix:* a copy uses 2 : 2 : 3 of a mix made about 1 : 1 : 1, and a strand's middle faces are copied far
  less than its ends (IDEAS, run 0022); no design yet.
- (l) *A triangle with both a copy side `?` and a glued anchor side* could catch a strand end in the pass it
  copy-binds and then never copy or let go (review, run 0820). No such type exists; a rule "a triangle with a copy
  side catches nothing" would close it if one ever appears.
- Settled, keep: (f) the seed site `y` (plain glue, never spent) is copied by every blank that reaches it while no
  bud sits on it. Not needed: (k) no copy blank binds an `&` side (closed walls `-|` do it). Done: (e), (i) (run
  0820), (m) first step (lysis, run 2051). Nothing else in the core is unused (RULES, Core inventory).

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
                                                   # per type (0), LYA anchor cell, LYR openRange, LYS world (30), LYFIX=1 candidate (o)'s oracle
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
