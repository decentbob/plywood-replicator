# Next instance: start here

State on 2026-10-03 (after autorun run 20261003-1321, review-intent). Read AGENTS.md first (rules of work), then this
file. History of earlier runs: docs/INNOVATIONS.md (newest first), RULES (Core changes), the autorun log and git (older
handoffs: NEXT.md in git, e.g. at `30c5e5a` for run 1221's, `4238aea` for run 1121's).

**Current slice (autorun run 20261003-1351, cleanup; in progress).** Goal: prune `budpore`'s diagnostic options
(Direction priority 4), make `tri/check.js` print each check as it finishes, drop unlinked pictures, shorten NEXT.
Done when: `node tri/test.js` passes; `budpore` 300 and 100c give identical output to main on the checked seeds; the
commands kept below still run; branch `claude/autorun-20261003-1351` merged. Stop there: no new capability, no core change.

**Handoff status (autorun run 20261003-1321, review-intent).** Direction check only, no code changed: everything on
branch `claude/autorun-20261003-1321`, merged into `main`. No simulations running; tests and checks as left by run 1221
(38 tests, 37 of 37 checks). The result is the Direction section below (it replaces run 1751's; that one is in git at
`30c5e5a`) and the ROADMAP backlog. The autorun rotation for plywood now has one `harden` and three `explore` runs per
twelve (was two and two).

**Exact next step.** The next run is a `cleanup` (rotation): prune `budpore`'s diagnostic options (Direction, priority
4), keep every check and every command still listed below working, outputs identical on the checked worlds. The next
`build` run takes priority 1 below (the kind's bud grown from a part pool, in isolation); the next `explore` run takes
priority 2 (the kind's opening).

**Core-change candidates.** (c) withdrawn (run 1221); its narrower form is the rule now. (d) *Code vs RULES:*
the anchor catch does not test `spent` (`sim.js`, anchor block), while RULES says a spent side binds nothing again; no
structure has a spent anchor side, so nothing depends on it; a core review should add the test. (a) A flap swings on a
welded partner's bonded trigger read directly, besides hearing through `+`: only `budgrow`'s pulse-door hinges use the
direct path (`grownBud`); a `+` on those weld sides would leave one path. (b) An attached close-only side still takes
docks and fills (dockers `Ay.z` take fills on `y.`), against "close-only binds no free triangle"; documented as an
exception in RULES Binding. (a) and (b) are casting lineage; they go with its removal (priority 5). New observation
(run 1221): the kind's seed site `y` (plain glue, never spent) is copied by every blank that reaches it while no bud
sits on it (copies of E); measure in priority 1 before changing anything.

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
1. **The kind's bud grown from a part pool, in isolation** (`build`; was priority 3). A fixed seed site `y` (the
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
   in two (Pitfalls), so the hood must join both sides of its pore (`imprint ph`'s hangs on one strut: untested); (b) one opening narrowed by its own caught strand and re-opened
   by a release the next bud's growth triggers; (c) fission plus insertion growth (finding 6). Output: the revised kind
   (`budKit` and its test), with each step mapped to a demo and the rules it reads (locality); a core change only
   through the RULES gate. Then move the anchor where the chosen opening needs it, and rerun the transfer batch on the
   kind's own layout (target 3 of 4). This replaces the old M2 priority.
3. **Two generations** (was 4): a grown bud catches a strand, splits, feeds without leaking, and starts its own bud.
   The whole cycle; then priority 5's removal is no longer premature by anyone's measure.
4. **Prune `budpore`** (`cleanup`, next run): drop options no check or listed command uses (dead ends such as
   `BUDTOOTH`, `BUDNOCA`, `BUDDBGA`, `BUDNOP`; their results stay in INNOVATIONS and git); decide whether the plug
   (`BUDRD=7`) and cap-release (`BUDCAP`) commands still earn their options once priority 2 has chosen; keep `300`,
   `100c`, the 7-cell doorway and the dry-run; outputs identical on the checked worlds. Also: `tri/check.js` printing
   each check as it finishes (autorun feedback, run 2150).
5. **Weigh removing the casting lineage now, not after a whole cycle** (next `core-review`, case through the RULES
   gate first): its demos and checks (`lid`, `factory`, `energy`, `conveyor`, `gate`, `import`, `grow`, `stamp`, `heir`,
   `cycle`, `wrap`, `cells`, `live`, `cell`, `grown`, `bud`, `split`, `budgrow`) and the marks only they use (`% ' $ ^ #
   = ! < > * ~ +`, re-measure with the coverage hook), into git history as the 10-01 restart did. For: half the check
   time, a smaller core and RULES, nothing on the closure path uses them. Against: working capabilities (machines,
   pumps) leave the tree; they stay in git and could return if proofreading or transport needs them. If the review
   decides against, record why and keep them frozen.
6. **Speed and margins** (`harden`): `budpore-c` (6 of 8, need 6) and `imprint-hood` (3 of 4, need 3) sit at their
   margins; speed idea from run 2150 (a flat per-step grid by counting sort; outputs need re-checking). One `harden` per
   twelve runs is enough now: the work is limited by design questions, not by run time.
**Rotation (autorun `projects/plywood/rotation.txt`):** the second `harden` (line 8) became an `explore`: priorities 1
and 3 are `build` work, 2 is design work that `explore` and `build` can both take, 5 is the `core-review`'s.

### Open follow-ups (not priorities; take when a run's kind fits)
- **Core review:** `#` on a trigger side was removed in run 0450. Lock signal has three uses (keys deaf, latches held,
  pulse doors ignore their trigger); moot if priority 5 removes the casting lineage. Same-pass partner reads (zip, gap,
  release, fn, cast) are allowed by convention (RULES, Locality audit); change only if a locality problem traces back
  to them. Coverage hook: `COV_OUT=$PWD/runs/cov.jsonl NODE_OPTIONS="-r ./tri/coverage.js" node tri/check.js` (one JSON
  line per demo world: marks used, rule events).
- **Frozen with the casting lineage (not pursued):** fuel per swing (design in git, NEXT.md at `c11ed14`), `grown`'s
  membrane stall at 72-76 of 78, `budgrow g`'s transport tail and second bud.
- **Bigger cells and letter reuse** (user, 2026-10-03; IDEAS): R 5 is the largest all-unique kind (46 letters); if
  priority 1 or 2 needs a larger cell, reuse letters inside sealed compartments.

## Commands
```
node tri/test.js                                   # fast checks (~5 s)
node tri/check.js [id ...]                         # capability checks: one PASS/FAIL line each (~28 min, 4 processes)
POOLB=20 POOLISO=1 node tri/demos.js pool 1 100000 runs 4   # a waiting front among 20 blanks and 4 next parts: copies per bound part vs B/n
                                                   # (seconds; without POOLISO three more copyable sides beside it)
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
node tri/demos.js imprint 1 100000 runs 150p       # a cell fed through a pore copies its genome from blanks outside (150pc, 150pn: controls)
node tri/demos.js imprint 1 100000 runs 150ph      # the same cell with a hooded pore: no strand leaves (x: 3 rival strands outside)
node tri/demos.js imprint 1 60000 runs 60m         # a sealed cell (spent & walls) copies its genome from copy blanks (60mn: control)
node tri/demos.js imprint 1 30000 runs g           # a strand copied from copies of its own triangles (gc: control)
node tri/demos.js imprint 1 200000 runs            # contact copying: a ring closes and a second grows from copy blanks only
```
Casting lineage and older (frozen; each has a check in `tri/check.js` with its seeds, steps and extra): `copy`, `lid`,
`factory`, `energy`, `conveyor`, `gate`, `import`, `grow` (`12`, `4s`), `stamp`, `ring`, `heir`, `cycle`, `wrap`,
`cells`, `live`, `cell`, `grown`, `bud`, `split` (default, `g`, `o`), `budgrow` (default, `g`). Pictures go to
`runs/NAME.png` with saved states; `TRI_NOPIC=1` turns them off. `TRI_RESUME=runs/x/NAME_tNNN.json.gz` continues a demo
world from a saved state (not `split`: it places its parts after loading); `TRI_PARAMS='{...}'` overrides parameters.

## Pitfalls learned
Casting-lineage and machine pitfalls (kits, pockets, doors, flaps): docs/IDEAS.md, "Pitfalls from the casting lineage".
- **Growth cannot stop beside a gap** (2026-10-03, run 1121). A ring grown from a periodic motif ends only by closing
  onto a cell already there (cells of one motif index are interchangeable among the six repeats), so a grown ring with
  a pore needs unique cells up to the pore's far edge, or cells released later. Unique cells lie on segments grown
  from the root.
- **Two aligned 3-cell halves pass no strand** (2026-10-03, run 1121; run 0320 for a 3-cell bud half). The doorway's
  waist is one unit wide and two rows long: 0 of 8 worlds; 7-cell halves pass (4 of 4).
- **An anchor at a doorway's edge holds its strand across the doorway** (2026-10-03, run 1121). A strand caught on the
  pore side of an edge cell (or one cell from it) leans over the opening; as a parent's founder it jams the doorway
  (1 of 4 transfers, 4 of 4 with the founder elsewhere).
- **A catching anchor must carry `@`** (2026-10-03, run 0751). An attached glued side without `@` binds any free
  triangle with the complementary glue (glue catch): a plain `Z|` anchor was capped by a lone face copy and never
  caught a strand. With `@` it binds only a part's `@` side, so only the anchor catch (strand ends) can take it.
- **A waiting anchor near food is a food sink** (2026-10-03, run 0751; narrowed run 1221). Its unbonded `@|` side was
  copied by every blank that touched it (29-69 copies per world); since run 1221 no copy blank binds an anchor side.
  The anchor cell's own `&` sides still stay unspent while it hears its own signal (60-68 copies once exposed): keep
  waiting anchors' cells spent elsewhere or away from food.
- **A strand lying in a wall row facing a fed interior gets no fills** (2026-10-03, run 0751). Its faces meet all the
  food and its backs none: all blanks become face copies, no back copies, copying stalls (80 copies, 12 docks).
- **Signal decay is simultaneous** (2026-10-03, run 0751). When an emitter stops, every cell within range reaches 0
  within the same one or two passes (value R - t or R - 1 - t by distance parity), so `&` cuts cannot be staged by
  distance, only by parity: a cell with R - d even reaches 0 one pass before one with R - d odd.
- **An opening that lets a strand in lets it out** (2026-10-03, run 0320). Motion is reversible: a doorway, pore or
  gap a strand can pass one way it can pass the other, and it stays open after a split. Keep strands in with a bent
  opening (hooded pore) or a binding event (a catch, growth); never count on a narrow straight opening.
- **Changing a layout moves the automatic anchor choice** (2026-10-03, run 0320). `budpore` picks D's anchor by distance
  and corners; with another gap it took the gap's edge (the strand stood outside). Pass `BUDA` and dry-run (`BUDDRY=1`).
- **Where a caught strand's backs face** (2026-10-02, run 1921). A strand caught by an end stands at 60 degrees to the
  wall, leaning one way fixed by which end is caught and the strand's handedness; its backs then face either the acute
  wedge (a back site can be covered by a wall cell) or the open side. Backs in the wedge get no copies, so there are
  no fills and copying stalls after a few docks. Dry-run the capture and measure back sites before placing an anchor.
- **Prepared bonds need no glue** (2026-10-02, run 1921). A weld glue left on a prepared side becomes active when the
  bond is cut (a latch letting go) or on every copy of the cell: copies of `f`/`F` cells glued onto each other and grew
  crystals. Zero the glue of prepared walls; give glue only to sides meant to bind.
- **A freed side is a food sink.** Every free, unspent side of an attached triangle is copied by every copy blank that
  reaches it, glue or not (a released latch side: up to 105 copies). Count exposed sides after each event, not only at t=0.
  A bond that comes apart once should be an `&` bond: its freed sides are spent (`budpore` since run 0050).
- **A strand caught while busy needs fills from elsewhere** (2026-10-02, run 1551). Anchors catch busy strands; the
  strand and its partial copy are pinned in the anchor's orientation. If its backs then face a wall (a narrow wedge),
  no back is copied there, and a copy caught before any back copy exists never gets a fill (`imprint p` seed 2). Place
  anchors so a caught strand stands into the cell with backs open, or keep other strands copying nearby.
- **Glue letters run out; seed letters clash** (2026-10-02, run 1351). The glue code is Int8: 63 letters, and a grown
  bud of side 5 uses 54. A genome in the same world needs its own letters (`avoid`), and the bud's seed glue must not
  be the genome's (a free part carrying the anchor's `Z@` bound the parent's seed side `z@~` in place of the root).
  Prepared bonds that never let go can share one letter (`f`).
- **The last open-signal source must arrive early.** A grown pair holds while anything hears an open signal; latch
  sites emit none. If the content seed (cap seed, anchor) sits late on the wall front, the panel front completes first
  and the root lets go of a half-grown bud. Put it early and give the cells before it more supply.
- **A site needs an open approach, not just a free side** (2026-10-02, run 1050). Binding needs the part within the
  capture tolerance of its place, so a site whose way in is a channel exactly one block wide (0.866) fills only by luck:
  the grown bud's last site beside the parent's corner apex, an import door's drop place boxed in by its open panel,
  the wall and a strand. Check new layouts: mirror the site across its free side; that place must share no side with
  another cell, and anything a door drops needs room to leave its sweep.
- **One-front rings: the last two sites.** Sites alternate outward / inward along a one-row ring, so with one growth
  front and an outward root the second-to-last site faces inward. While it and the last site are both open, the gap
  through the wall is a rhombus exactly one block wide: only a part already inside can fill the inward site (imprint's
  rings stuck at 28/30). `ringKit(..., seedIn)` ends on an outward corner pair instead, but puts the root (and its
  anchor) inside; that changed what imprint copies (tried, reverted: rings stalled at 7 cells).
- **An open-signal hold exposes its whole range to copying** (2026-10-02, run 0921). `&` sides are spent only where
  nothing is heard; every wall cell within `openRange` of an emitter keeps its free side and is copied by any blank
  that reaches it, from inside or outside. With blanks outside, a pair held by `&` pairs (range 27, or 11 with two
  anchors) lost 98% of the blanks to its walls. Start the structure spent and hold by one `&` bond that hears the
  anchor (`budpore` since run 0050; spent sides stay spent), so only the anchor side is ever unspent.
- **Anchors in the middle of a flat wall.** An anchor next to a hex corner lays its strand along the next wall with its
  backs hidden: no back is copied, so no fill exists and copying deadlocks (`budPair`'s P anchor is such a place).
- **One gap per one-row ring.** A pore plus a doorway cuts a ring's wall into two bodies.
- **Copy blanks go to every exposed side.** Walls take most of a batch (65-70% in a cell). Mark plain wall sides `&`:
  they are spent once the structure hears no open signal and are never copied. Copies of `&` cells used as fills are
  cut when their `&` side hears none: give backs a lateral glue so only genome back copies fill (fills match the edge's glue).
- **Latch sites emit no open signal** (`@~`): a front of latch sites carries the lock signal, not the open signal;
  something else must keep a structure open (ordinary sites, a content seed) or its `&` sides cut early.
- **Physics leaks found 2026-10-02** (fixed): check new closed structures for escapes with a trace (cast products and
  released parts start touching their neighbours).
- **Bodies longer than half the world** were folded by the torus minimum image (fixed 2026-10-01, `_unwrap`). Keep
  world size larger than any body anyway (pictures and inside tests use minimum images).
- **A closing door stalls on anything in its sweep**; a strand lying across a doorway can jam it for good.
- **Apostrophes in test names**: `'` inside a single-quoted test name breaks the file (twice this session).
- **Locality (user, 2026-10-01).** Before writing a rule, ask: does this triangle know this through its own bonds,
  a direct partner's exposed value, or a relayed signal? "Same structure", "smaller body", "partner's partner" are
  not local (all three were written once and undone). Physics may treat a structure as one body; chemistry may not.
  See AGENTS.md (Locality) and RULES.md (Locality audit).
- **Inside or outside a hex ring: use `hexr`, not Euclidean distance.** Near a hexagon's corners a side on the inner
  boundary can lie farther from the centre than (R-0.5)H; for R >= 6 twelve sides were misjudged, so a door kit's last
  site faced inward and the ring could only be closed by triangles already trapped inside (fixed 2026-10-01).
- **Trailing comments in one-line code.** Twice a `// comment` appended inside a long line swallowed the code after it
  (no error, wrong behaviour). Put comments on their own line.
- **Rigid machines.** Every swing must be clear: sweep a design before building it (`structures.ring` shows how). A
  flap whose catch side stays flush with its cargo re-closes on it at once (hence the hand-off and at-rest rules).
- **Enclosed holes.** A site whose three neighbours are all present before it fills can never be filled (no free
  triangle can reach it: rigid parts never pass through). This caused the copy deadlock (fixed by zip) and the grown pocket
  stall (fixed by `pLoose`). Check every new design for sites that can become enclosed.
- **lockBusy and other relays are Int8**: lockRange above 127 overflows (no lock at all). Use at most 120.
- **Supply races decide reliability.** The founder's first dock races the membrane root (cells); leftover kit parts
  trapped in a closed ring jam its door (live). Supply ratios are design parameters: check them on 4 worlds.
- Shared edges of a prepared structure must have opposite directions when you write glue onto them.
