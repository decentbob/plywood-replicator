# Next instance: start here

State on 2026-10-03 (after autorun run 20261003-2221, build). Read AGENTS.md first (rules of work), then this
file. History of earlier runs: docs/INNOVATIONS.md (newest first), RULES (Core changes), the autorun log and git (older
handoffs: NEXT.md in git, e.g. at `f05ed31` for run 2121's, `7415fd4` for run 1921's).

**Handoff status (autorun run 20261003-2221, build).** Slice done: priority 3, one generation of the kind from its
own kit with no stand-in (new demo `budcycle`, check `budcycle` 4 of 4), and run on, two (check `budcycle-2`). Branch
`claude/autorun-20261003-2221`, merged into `main` by PR; no simulations running. (1) **What runs:** a prepared parent
of `budKit(5, 7, null, true, {at: 6, glue: 'Z'})` holding its founder by the high end on arc cell 6 (labelled),
`heldCopy`, openRange 9, 8 free parts of each kit type but E, 200 blanks (20 inside), budpool's harness (kit copies back
to blanks). The parent copies its founder through its pore, grows its bud from the pool, the bud catches a real copy
and lets go. Seeds 1-8: 8 of 8 split after a real catch and complete their bud, 0 stray bindings; both seed sites then
start new buds in 8 of 8. (2) **The order is left to chance:** in 7 of 8 the bud catches while growing (8-45 cells),
lets go 10 steps later (its root hears nothing once the front is 9+ bonds away) and finishes its wall alone from the
pool; its last site then opens outward, so the sealed pair's last-cell problem does not arise. openRange 50 forces the
designed order (complete, catch, split: seed 1 of 4) but keeps the whole bud copyable while it grows (blanks copy its
wall 2-10 times more; 1 of 4 stopped at 46 of 47, 2 of 4 founders never copied). (3) **Food is the next limit:** the
200 blanks are gone by t = 75000 (contact copies of every strand's sides pile up as free genome triangles only a held
strand uses); buds that split late copy their strand 0-1 times, early ones (split before t = 53000) 5-9 times. A
labelled waste-to-blank drive (`BCW`) did not help (at 0.05 it recycled the parent's face copies before they docked).
(4) **Two generations:** run on to 600000 steps (`BCAFTER=300000`), a bud grown on a bud's seed site completes and
lets go after a catch in 6 of 6 worlds (seeds 1-4, 7, 8); check `budcycle-2` (stops at the first such bud): 4 of 4 (seeds 1-4: let go at 397900 / 414300 / 420600 / 506500, 0 stray; 702 s).
Later buds mostly catch leaked strands (10-15 lie outside): with `heldCopy` a leak is held and copied again by the next
bud that passes. Records: INNOVATIONS (run 2221), IDEAS ("A bud that catches early splits early and finishes
alone"), ROADMAP rows; pictures `docs/pictures/budcycle.png`, `budcycle_generations.png` (commands below).

**Exact next step** (the next `build`). Priority 3 works with two labelled supports left: the prepared pool (8 parts
of each of 46 types, enough for about 8 buds) and budpool's harness, which turns every copy of a kit part back into a
blank. The kind's own refill is the copies blanks make of a bud's unspent cells while it grows (200-900 per bud with
the harness). Next: turn the harness off (`BCHOLD=0`) so those copies stay as parts, give the world a steady food
supply if the blanks run out first (an environment drive, labelled: e.g. blanks enter at the world's edge; the waste
drive `BCW` recycled the parent's face copies and did not help), and measure the pool per type over two or three
generations (does any type run out; which). Target: the second generation (`budcycle-2`) in 3 of 4 with the harness
off. If the pool drifts (run 1420: no per-type regulation), that is the finding; weigh the periodic ring (fewer types)
then. Food after the split also limits each bud's own copies (0-1 when it splits late, 5-9 early; 400 blanks in a 36
world, seed 2: 4).

**Core-change candidates (for the next `core-review` or `explore`).** (e) *`heldCopy` as the rule:* RULES (Core
changes, run 1720) foresaw that it replaces the `&` case of zip once the casting lineage is gone and the copy lineage's
demos hold their strands by the high end. Today the option is off by default and `imprint g`, `imprint m`, `imprint
p`, `budpore 300`, `budpore c` copy free or low-end-held strands, so making it the rule changes those checks; weigh it
when the kind's cycle (priority 3) runs on it, moving or retiring those demos then. Run 2221: the kind's cycle now runs on it (`budcycle`, two generations), so (e) is ripe for the next `core-review`. (f) *The seed site `y`* (plain
glue, never spent) is copied by every blank that reaches it while no bud sits on it (copies of E; run 1420: 0-6 before
the first root binds); the last-cell problem needs that source: keep. (g) *Free strands not contact-copied* (run 2221): sterile strands are still food sinks (every blank that touches a free strand becomes a free genome triangle that only a held strand can use; 200 blanks gone by t = 75000 in `budcycle`); a rule that reads whether a strand end is held, as `heldCopy` does, could keep blanks off free strands; weigh only if a supply in the environment does not solve the food after the split. Nothing else in the core is unused: every mark,
signal and value has a kept check that uses it (Core inventory).

### Direction (autorun run 20261003-1321, review-intent): where the work stands and what comes first
Ten runs since the last direction check (run 1751): four `build` runs on M2 (1921, 2321, 0320, 0751), one `build` on
closure (1121), two `explore` (0050 completion release, 1221 anchor narrowing), one `core-review` (0450, removals), two
`harden` (speed 1.1-1.25x, 1.34x), one `cleanup`. **Findings.**
1. **M2 in `budpore` has stopped paying.** Four build runs gave real lessons (the way in is the way out; free strands
   beat cells; completion release; the genome as the plug; cap release 2 of 4) but no bud that copies its genome after
   the split, and `budpore` is a prepared pair that is not the organism's kind (finding 4 of run 1751). Further M2
   work there tunes a layout the lineage will not use. **Decision: no more M2 work on `budpore`'s layout**; `budpore`
   and `budpore c` stay as checks of transfer and split. M2 is now a question about the closure kind (priority 2).
2. **The closure kind inherits the unsolved problem.** `budKit`'s 7-cell pore is both the doorway (strands must pass,
   7 cells needed: 3-cell halves pass none) and the cell's feeding pore afterwards. By the law found in run 0320 (an
   opening a strand passes one way it passes the other) both cells then leak strands (run 1121: 0 / 11 / 7 / 9 strands
   outside after the split in 4 worlds), and leaked strands starve every cell near them. So the kind as designed cannot
   live on its own after the split, whatever its growth does. The kind's opening must be settled by design before more
   is built on its geometry, and the planned "move the anchor off the doorway" depends on that answer (an anchor at the
   pore's edge is a jam for the parent's founder but a plug for the bud's: run 0320 vs run 1121).
3. **Closure depends on an untested step with a large cost.** Every bud part comes from a pool of free parts of 46
   types, kept by copies made while each bud grows; run 1221's law puts the steady pool at about (r + 1)/2 to r + 1
   parts of each type per blank near the bud. If growth from such a pool stalls (crowding, wrong-type jams, the first
   fronts taking the blanks) the kind is dead whatever its opening. And a pool the organism does not refill is the
   casting lineage's prepared kit again (the reason it was frozen). This is the riskiest assumption left; test it first
   and in isolation, measuring the refill, not only completion.
4. **The core is shrinking; good.** Since run 1751: the latch, hear chain and trigger left the copy lineage; `#` key
   release, `zip` and `latGlue` options and latch partner reads removed; anchors narrowed twice. Capabilities did not
   pile up as separate demos (`budpore` combines `imprint p`, anchors and completion release), but **diagnostic options
   piled up in one demo**: `budpore` reads 24 `BUD*` environment variables, most from options tried once and dropped.
5. **The frozen casting lineage costs about half of every check run** (estimated worker time in `tri/check.js`: 5100 s
   of 9200 s) and about a dozen of the core's marks, and nothing on the closure path uses it (the copy lineage uses `. @ & | ?`,
   the open signal and binding). Run 1751 deferred its removal until a whole cycle works; that is several runs away
   (priorities 1-3), so the cost is paid on every check until then.
6. **Other paths, weighed.** *Fission* (a septum across a cell holding two strands) needs no strand transfer and no
   wide doorway at all, but its halves are not the parent's shape until the membrane grows back (insertion growth: the
   user's idea of 2026-10-03, hard on rigid physics: IDEAS). *A periodic ring* (7 motif types plus about 10 unique
   cells) cuts the pool by about 3x but brings back the door-cell race. Neither is clearly simpler than fixing the
   kind's opening; both stay candidates for priority 2's analysis. The goal sentence (the parent builds and feeds its
   offspring, then splits it off) fits budding; no change to the goal is proposed.

**Priorities (in order; each a slice).**
1. **Done (run 1420, demo `budpool`; was priority 3): the kind's bud grown from a part pool, in isolation.** The
   original text: A fixed seed site `y` (the
   parent's E alone, or a prepared parent ring without food or strands), a pool of `budKit` parts seeded at about
   (r + 1)/2 parts of each type per blank, the anchor at a parameter k (r = k + 1; k from a quick dry-run, no transfer
   batch). Measure: bud completed (target 3 of 4 worlds), steps to complete, copies made per type during the growth
   (the refill: at least one per type used), stray bindings, crowding. If it stalls, find out why before anything else;
   a fix to the kit or a smaller kind is the slice. This settles finding 3.
2. **The kind's opening: feed without leaking, still pass a strand to the next bud** (analysis first; `explore` or
   `build`; "designed, not demonstrated" is a valid result). The opening must be wide while a strand crosses to the bud
   and closed to strands while each cell feeds, and only binding events are one-way. Weigh at least: (a) two openings,
   a hooded feeding pore (`imprint ph`: no strand out) and a doorway that a binding event narrows after the transfer
   (the bud's caught strand as its plug, run 0320) and that the next bud's growth reopens; two gaps cut a one-row ring
   in two (IDEAS, Pitfalls), so the hood must join both sides of its pore (`imprint ph`'s hangs on one strut: untested); (b) one opening narrowed by its own caught strand and re-opened
   by a release the next bud's growth triggers; (c) fission plus insertion growth (finding 6). Output: the revised kind
   (`budKit` and its test), with each step mapped to a demo and the rules it reads (locality); a core change only
   through the RULES gate. Then move the anchor where the chosen opening needs it, and rerun the transfer batch on the
   kind's own layout (target 3 of 4). This replaces the old M2 priority. Two more requirements from run 1420 (IDEAS):
   the bud's last site opens only into the sealed pair (solved in isolation in run 1650: E's pore side plain, an E
   source inside, check `budpool-e`), and the pool's per-type counts drift with nothing to restore them (weigh fewer
   types, e.g. the periodic ring). Run 1650's analysis (IDEAS) narrows the opening: one opening per body, only
   silence widens; (a)'s hood joining both sides of its pore is no help. **Run 1720 (explore):** (i)-(iii) fail on paper in the kind's geometry;
   proposed instead: option `heldCopy` (free strands sterile), with which leaks cost nothing and the bud copies after
   the split on `budpore`'s open pair (3 of 4). **Run 1921 (build):** on the kind's own layout the anchors must leave
   the root (a high end held there stands in the doorway); on arc cell 6 the bud copies after the split in 8 of 8
   (check `budpore-kind`); the kit has the option. Next: priority 3 (Exact next step).
3. **Two generations** (was 4): a grown bud catches a strand, splits, feeds without leaking, and starts its own bud.
   The whole cycle. Done (run 2221) with a prepared pool and budpool's harness: one generation (`budcycle`, 4 of 4)
   and two (`budcycle-2`, 4 of 4; 6 of 6 long runs). Next: the pool without the harness (Exact next step).
4. **Prune `budpore`** (done in run 1351, cleanup; left: decide on `BUDCAP` and `BUDRD=7` once priority 2 has chosen): drop options no check or listed command uses (dead ends such as
   `BUDTOOTH`, `BUDNOCA`, `BUDDBGA`, `BUDNOP`; their results stay in INNOVATIONS and git); decide whether the plug
   (`BUDRD=7`) and cap-release (`BUDCAP`) commands still earn their options once priority 2 has chosen; keep `300`,
   `100c`, the 7-cell doorway and the dry-run; outputs identical on the checked worlds. Also: `tri/check.js` printing
   each check as it finishes (autorun feedback, run 2150).
5. **Done (run 2121, core-review): the casting lineage removed** (RULES, Core changes): the decision was for removal;
   every kept check's output is byte for byte the same.
6. **Speed and margins** (`harden`): `imprint-hood` done in run 1520 (14 of 14). Left at their margins, failure modes
   named (INNOVATIONS, run 1520): `budpore-c` 6 of 8 (frozen layout: fix only if priority 2 reuses it), `imprint` 3 of
   4 (seed 6's stop at 28 of 30 not diagnosed: next harden's first look), `budpore` 3 of 4 (food used up). Speed: the
   flat cell grid of run 2150's idea was built in run 0950; the suite took about 32 minutes with the casting
   lineage and 18 minutes without it. One `harden` per
   twelve runs is enough now: the work is limited by design questions, not by run time.
**Rotation (autorun `projects/plywood/rotation.txt`):** the second `harden` (line 8) became an `explore`: priorities 1
and 3 are `build` work, 2 is design work that `explore` and `build` can both take.

### Open follow-ups (not priorities; take when a run's kind fits)
- **Core review:** same-pass partner reads (zip, gap, release, fn) are allowed by convention (RULES, Locality audit);
  change only if a locality problem traces back to them. Coverage hook: `COV_OUT=$PWD/runs/cov.jsonl NODE_OPTIONS="-r
  ./tri/coverage.js" node tri/check.js` (one JSON line per demo world: marks present, rule events). To show a change
  leaves outputs the same: `CHECK_SAVE=$PWD/runs/a node tri/check.js` before and after (another worktree), then
  `diff -r runs/a runs/b`.
- **Bigger cells and letter reuse** (user, 2026-10-03; IDEAS): R 5 is the largest all-unique kind (46 letters); if
  priority 1 or 2 needs a larger cell, reuse letters inside sealed compartments.

## Commands
```
node tri/test.js                                   # fast checks (~5 s)
node tri/check.js [id ...] > runs/check.txt         # capability checks: one PASS/FAIL line each, printed as each finishes (~35 minutes, 4 processes; CHECK_SAVE=dir keeps each world's output)
POOLB=20 POOLISO=1 node tri/demos.js pool 1 100000 runs 4   # a waiting front among 20 blanks and 4 next parts: copies per bound part vs B/n
                                                   # (seconds; without POOLISO three more copyable sides beside it)
node tri/demos.js budpool 1 250000 runs             # the kind's bud grown from a pool of its 47 part types (extra: parts per type, 8;
                                                   # BPE: E parts, 40; BPB: blanks, 8; BPS: world size, 30; BPR: openRange, 1; BPHOLD=0: no harness)
BPES=1 BPE=0 BPB=16 node tri/demos.js budpool 1 250000 runs   # the same with E's pore side plain and no E part: the last cell from the source
node tri/demos.js budcycle 1 300000 runs           # one generation from the kit: the parent copies its held founder, grows its bud from the
                                                   # pool, the bud catches a real copy, splits, completes (check budcycle; extra: parts per type, 8;
                                                   # BCB blanks 200, BCI inside 20, BCS world 32, BCR openRange 9, BCE E parts 0, BCAFTER 50000,
                                                   # BCHOLD=0 no harness, BCW waste-to-blank drive 0)
BCAFTER=300000 node tri/demos.js budcycle 1 600000 runs   # the same run on: both seed sites start new buds ('later buds:' line)
BCR=50 BCW=0.05 node tri/demos.js budcycle 1 300000 runs  # the designed order (complete, catch, split): the picture in INNOVATIONS
node tri/demos.js closure                          # the designed kind (budKit): parent, bud grown in signal passes, catch, split (picture, no physics)
BUDRP=5 BUDRD=5 BUDPG=-1.75,1.75 BUDDG=-1.75,1.75 BUDPX=b BUDLX=2 BUDA=84:2 BUDNI=20 BUDPS=2 node tri/demos.js budpore 1 100000 runs 100c
                                                   # the kind's 7-cell doorway, founder away (4 of 4 split); the kind's own layout:
                                                   # BUDPF=-1.75 BUDPFE=w instead of BUDPX=b (1 of 4); 3-cell pores: BUDPG=BUDDG=-0.75,0.75
                                                   # BUDLX=1 BUDA=90:2 (0 of 8); BUDDRY=1: dry-run every bud anchor side (BUDAG=Z: by the high end)
node tri/demos.js budpore 1 100000 runs 100c       # sealed bud pair: P feeds inside, founder under the doorway (7 of 8 split)
node tri/demos.js budpore 1 200000 runs 300        # bud pair on copies: mid-wall catch, the doorway bond cut by completion release, split with food left (7 of 8); DBGC=1: where copies go, BUDF=20: frames;
                                                   # BUDDRY=1: dry-run a catch on every inner side of D; BUDA=cell:side: anchor
BUDRD=7 BUDDG=-1.75,3.25 BUDA=126:1 node tri/demos.js budpore 1 100000 runs 100c   # the bud's genome as its plug (run 0320)
BUDCAP=-2.75 BUDRP=9 BUDNI=160 BUDPG=-2.75,2.25 BUDPX=b BUDRD=7 BUDDG=-1.75,3.25 BUDA=146:1 node tri/demos.js budpore 1 100000 runs 100c
                                                   # cap release: the parent plugs its half after the bud's catch (2 of 4 split)
node tri/demos.js imprint 2 100000 runs 150pzox    # heldCopy: anchor Z@| holds the founder's high end, 3 sterile rivals outside
                                                   # (150pzx: control without the option; 150pzow: 7-cell pore; 150pzo: alone)
BUDAG=Z BUDPFE=z BUDPA=52:1 TRI_PARAMS='{"heldCopy":true}' node tri/demos.js budpore 2 200000 runs 300   # the bud copies after the split
                                                   # (check budpore-held; BUDDRYP=1: dry-run every inner side of P; BUDPA=cell:side: P's anchor)
BUDRP=5 BUDRD=5 BUDPG=-1.75,1.75 BUDDG=-1.75,1.75 BUDPFE=z BUDLX=2 BUDAG=Z BUDNI=20 BUDPS=2 BUDPA=16:0 BUDA=90:2 TRI_PARAMS='{"heldCopy":true}' node tri/demos.js budpore 1 200000 runs 300c
                                                   # the kind's own layout, anchors on arc cell 6 (check budpore-kind)
BPA=6 BPES=1 BPE=0 BPB=16 node tri/demos.js budpool 1 250000 runs   # the kind's bud from the pool with the anchor Z@| on cell 6 (openRange 9)
node tri/demos.js imprint 1 100000 runs 150p       # a cell fed through a pore copies its genome from blanks outside (150pc, 150pn: controls)
node tri/demos.js imprint 1 100000 runs 150ph      # the same cell with a hooded pore: no strand leaves (x: 3 rival strands outside)
node tri/demos.js imprint 1 60000 runs 60m         # a sealed cell (spent & walls) copies its genome from copy blanks (60mn: control)
node tri/demos.js imprint 1 30000 runs g           # a strand copied from copies of its own triangles (gc: control)
node tri/demos.js imprint 1 200000 runs            # contact copying: a ring closes and a second grows from copy blanks only
```
Older demos: `copy` (chain copying from dockers) and `ring` (a ring kit closes); each has a check in `tri/check.js`
with its seeds, steps and extra. The casting lineage's demos were removed on 2026-10-03 (git `7415fd4`). Pictures go to
`runs/NAME.png` with saved states; `TRI_NOPIC=1` turns them off. `TRI_RESUME=runs/x/NAME_tNNN.json.gz` continues a demo
world from a saved state (not `budpore`: it places parts after loading); `TRI_PARAMS='{...}'` overrides parameters.

## Pitfalls learned
Read before designing a layout: docs/IDEAS.md, "Pitfalls learned (copy lineage)" (doorways, anchors, food sinks,
signals, rings, physics) and "Pitfalls from the casting lineage" (kits, pockets, doors, flaps; that lineage is
removed, its lessons stay).
