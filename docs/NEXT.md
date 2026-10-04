# Next instance: start here

State on 2026-10-04 (after autorun run 20261004-0022, explore). Read AGENTS.md first (rules of work), then this
file. History of earlier runs: docs/INNOVATIONS.md (newest first), RULES (Core changes), the autorun log and git (older
handoffs: NEXT.md in git, e.g. at `faf6b8d` for run 2221's, `f05ed31` for run 2121's).

**Handoff status (autorun run 20261004-0022, explore).** Slice done: run 2221's "food after the split" diagnosed, and
one core change. Branch `claude/autorun-20261004-0022`, merged into `main` by PR; no simulations running. (1) **Core
change (RULES, Core changes, "Narrowing: only grown triangles bind by glue"):** a strand end's seed binds only by an
anchor's catch and a released back binds nothing by glue (two cases of the active-side rule gone); zip's `&` case
went with them. Check suite 22 of 22 (2072 s) after one setup fix: the `imprint` `z` variants start with the founder
held on the anchor (it could leave through the 7-cell pore before the catch: `imprint-held-w` had failed 2 of 4).
Margins moved (RULES, the entry's point 7): `copy`, `budpore`, `budpore-c` gained a world; `budpore-held` (seed 1
never split) and `imprint-cell` (a sealed cell now runs short of back monomers) are at 3 of 4. (2) **What it fixed:** in `budcycle` the blanks became genome monomers 5x
faster than copying used them, in the mix awz : Awz : --W = 30 : 64 : 100 against 2 : 2 : 3 used per copy, because
free back monomers glue-capped strands' low ends (the cap hid a face monomer's source and was copied over and over:
5 caps, 61 of 100 back monomers). Now about 1 : 1 : 1 made and 47-86% used (was 17-46%); parent and bud make 10-13
full copies per world (4-12); the bud copies 6-8 times after the split in 3 of 4 worlds (0-3 before; seed 1, split
late, 1). (3) **Candidate (g) withdrawn:** its oracle (`BCG=1`) moved the copying to the held strands and saved no food.
(4) Census tools in `budcycle`: `BCDBG=1` (genome copies by source, by type, and genome triangles bound by kind),
`BCG=1` (the oracle). Records: INNOVATIONS (run 0022), IDEAS ("Monomers are made in proportion to exposure, not to
need"), picture `docs/pictures/glue_caps_monomers.png` (made with a one-off chart script from the census lines of
`budcycle` seeds 3 and 4).

**Exact next step** (the next `build`; unchanged in aim from run 2221, sharper in what to measure). Priority 3 works
with two labelled supports left: the prepared pool (8 parts of each of 46 types) and budpool's harness, which turns
every copy of a kit part back into a blank. Turn the harness off (`BCHOLD=0`) so those copies stay as parts, and
measure the pool per type and the monomers per type (`BCDBG=1`) over two or three generations. Before adding a food
supply (an environment drive, labelled), check with the census whether food is the limit at all: in run 0022 the
limit was the monomer mix, not the number of blanks. Target: the second generation (`budcycle-2`) in 3 of 4 with the
harness off. If the pool drifts (run 1420: no per-type regulation), that is the finding; weigh the periodic ring
(fewer types) then.

**Core-change candidates (for the next `core-review` or `explore`).** (e) *`heldCopy` as the rule:* RULES (Core
changes, run 1720); the kind's cycle runs on it (`budcycle`, two generations). Today the option is off by default and
`copy`, `imprint g`, `imprint m`, `imprint p`, `budpore 300`, `budpore c` copy free or low-end-held strands, so making
it the rule changes those checks (they need anchors on high ends, or retire). Ripe for the next `core-review`. (f) *The
seed site `y`* (plain glue, never spent) is copied by every blank that reaches it while no bud sits on it; the
last-cell problem needs that source: keep. (g) withdrawn (run 0022, above). (i) *Run 0050's narrowing (a free
triangle's anchor side binds nothing)* was made because free copies of a waiting anchor glue-capped strand ends; since
run 0022 no free triangle binds a strand end at all, so it may be redundant (a free anchor-side triangle could still
bind a grown side with the complementary glue: no kit has one). Weigh removing it in the next `core-review` (byte for
byte comparison of the check suite). (j) *Monomer mix:* a copy uses 2 : 2 : 3 of a mix now made about 1 : 1 : 1, and a
strand's middle faces are copied far less than its ends (IDEAS, run 0022); a genome whose exposure matches its use
would waste less (no design yet). Nothing else in the core is unused: every mark, signal and value has a kept check
that uses it (Core inventory); the busy relay is now read only by refractory.

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
BCDBG=1 node tri/demos.js budcycle 3 300000 runs   # with the genome monomer census: copies by source, by type, monomers bound (run 0022)
BCG=1 BCDBG=1 node tri/demos.js budcycle 1 300000 runs   # the oracle for candidate (g): free strands not contact-copied (non-local)
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
