# Next instance: start here

State on 2026-10-03 (after autorun run 20261003-1121, build). Read AGENTS.md first (rules of work), then this file.
History of earlier runs: docs/INNOVATIONS.md (newest first), RULES (Core changes), the autorun log and git (older
handoffs: NEXT.md in git, e.g. at `b13cde7` for run 0950's and `a993d78`).

**Current slice (autorun run 20261003-1221, explore): weigh core candidate (c) against closure.** (c) as stated (a
copy blank binds no `@` side) makes every cell whose only free side is `@` uncopyable (the kind's root, any in-wall
anchor cell, every growth front's forward link): it cuts the lineage. Try instead the narrower (c'): *a copy blank binds
no anchor side `|`*; every cell stays copyable while it is a growth front, the waiting anchor stops being a food sink.
Measure with a hook first (`runs/noanc.js`, recreate from this run's INNOVATIONS entry) on budpore 300, budpore 100c,
imprint 150p/150ph; build it as a rule only if it helps and keeps the checks (case in RULES first). Done when: a
decision with numbers (rule built and 37 checks pass, or rejected with why). Stop at that.

**Handoff status (autorun run 20261003-1121, build).** Everything committed on branch `claude/autorun-20261003-1121`
and merged into `main`. No simulations running; `node tri/test.js` 37 pass (one new test); no rule, physics or shared
structure changed, so the check suite was not rerun (`budpore`'s default output checked byte-identical to main, both
check variants, 6000 steps). **Slice: closure by design (priority 2). Result: designed, not demonstrated** (INNOVATIONS
and IDEAS, run 1121; ROADMAP parts table). In short:
- The kind: `structures.budKit(5, 7)`: a radius-5 ring with a 7-cell pore, every cell its own type (46 bond letters),
  grown from its root one way round. Root = the pore's left edge: seed bond `Y@&` out, catching anchor `W@|` into the
  pore (it later holds the founder). Last cell E = the pore's right edge with the seed site `y` (plain glue). A bud on
  E is the parent turned 180 degrees about the pore: pores face (the doorway), the bud's E lies on the parent's root.
- Why unique cells: growth cannot count motif repeats, so a periodic ring cannot stop beside a gap; the periodic
  alternative (door cells released at ring closure, closure target `@.`) races its two growth fronts (IDEAS).
- Checked: test "closure (budKit)" (deterministic, no physics): the bud holds while growing and waiting, lets go only
  after its catch, and is then in the parent's starting state; the parent's seed site is free again (buds again).
- Tried (`budpore` options, R 5 pair, 3 strands and 20 blanks in P, seeds 1-4, 100000 steps): 3-cell pores pass no
  strand (0 of 8 worlds); 7-cell pores 4 of 4 split with the founder away from the doorway (a full copy in the bud
  after the split in 3 of 4; strands leak out of the wide pores), 1 of 4 with the founder where the kind holds it (on
  the parent's root, at the doorway's corner: it hangs into the doorway and jams it).
- New: `structures.budKit`, `structures.budPose`, demo `closure` (picture only), `budpore` options `BUDPS`, `BUDPFE`,
  `BUDLX`, `BUDAG`, `BUDA` on the doorway cell, dry-run positions (Commands).

**Exact next step.** A `build` run continues closure toward a demonstration, in this order: (1) **move the anchor off
the doorway** in the kind: the root keeps the seed bond, the catching anchor goes k cells counter-clockwise (openRange
k + 1, so the waiting anchor still holds the root and only cells within k of it stay unspent; no race, there is no
door). Find k by dry-run on the 7-cell layout (`BUDDRY=1`, both catch ends with `BUDAG=Z`, Commands): a held strand
must stand inside, backs open, leaning away from the doorway; then rerun the faithful transfer batch with the founder
on the same side in P (`BUDPF`/`BUDPFE`, or `BUDPX`) and the bud's anchor there (`BUDA`), 4 worlds, target 3 of 4, and
update `budKit` (anchor position as a parameter) and its test. (2) Priority 3 on this kind: a bud grows on a parent's
seed site from a pool of free parts (one of each of the 47 types to start, labelled) and copy blanks; measure whether
its growth leaves copies of every type for the next bud (the pool). M2 (the bud's food after the split) stays open;
7-cell pores also leak strands. The next `explore` run weighs candidate (c) with the cost found here.

**Core-change candidates.** (c) *A copy blank binds no `@` side* (run 0751): a catching anchor waits unbonded and
exposed, and every blank that touches it becomes a useless copy of the anchor cell (29-69 per world when food is near:
`BUDDBGA`). The rule would read the site's own attach mark (the copy bind already reads the site's spent state); it
narrows, adds nothing. Measured as a hook over `imprint`, `imprint-genome`, `imprint-cell`, `imprint-pore`,
`imprint-hood`, `budpore`, `budpore-c`: all pass as before (rings 30/30 in 4 of 4). Cost to weigh: an anchor or ring
front cell can then be copied only through its other free sides; closure (run 1121) needs every cell type copied
some time, and a cell whose free sides are all `@` (the kind's root `W@|Y@&b@`, an in-facing anchor cell) never would
be: as stated (c) cuts the lineage unless such cells get a non-`@` free side. Hook for measuring it: `runs/noca.js` (recreate:
`TriSim.prototype.bind` wrapped so a copy bind on an `@` side is cut at once; INNOVATIONS run 0751), run as
`NODE_OPTIONS="-r $PWD/runs/noca.js" node tri/check.js ...`; `budpore` `BUDNOCA=1` does the same in one demo. (d) *Code vs RULES:* the anchor catch does not test
`spent` (`sim.js`, anchor block), while RULES says a spent side binds nothing again; no structure has a spent anchor
side, so nothing depends on it; a core review should add the test. (a) A flap swings on a welded partner's bonded
trigger read directly, besides hearing through `+`: only `budgrow`'s pulse-door hinges use the direct path
(`grownBud`); a `+` on those weld sides would leave one path. (b) An attached close-only side still takes docks and
fills (dockers `Ay.z` take fills on `y.`), against "close-only binds no free triangle"; documented as an exception in
RULES Binding. (a) and (b) are casting lineage; take them with the removal of finding 2.


### Direction (autorun run 20261002-1751, review-intent): where the work stands and what comes first
**Findings.**
1. **Two half-organisms.** Since the synthesis decision (run 0136: contact copying) the build line has alternated
   between two lineages: the casting lineage (kit parts and stamp-cast dockers as prepared food: `split o`,
   `budgrow`, `budgrow g`; run 1351 built here) and the copy lineage (one uniform food, copy blanks: `imprint m/p`,
   `budpore`; runs 0236, 0921, 1551). Each covers part of the goal sentence with different prepared pieces; neither
   is converging on the other. The copy lineage is the only one where the parent can construct its offspring from
   uniform food (in the casting lineage the world supplies the bud's kit parts, the parent only a seed), and only it
   lets a later core review shrink the core. **Decision: all new building goes to the copy lineage; the casting
   lineage is frozen** (its checks keep running and passing; no new features, its open follow-ups are dropped:
   `budgrow g`'s transport tail and second bud, `grown`'s membrane stall, fuel per swing, the airlock).
2. **The core is not outgrowing the capabilities.** Since 10-01 the core gained one rule (copy side `?`) and lost or
   narrowed several (K merged into `%`, the latch's open hold, 8 options, the anchor reads less). Good. The larger
   win is ahead: the copy lineage uses only `@ . & | ? ~ *`, the open, busy and zip signals and binding; casting,
   stamp, fuel and machine marks (`% ' $ ^ # = ! < > + * ~`) serve only the frozen lineage (measured with the coverage hook on 3000-step runs of `budpore 300`, `imprint`,
   `imprint 60m`, `imprint 150p`; rerun in run 20261003-0050 with `budpore 100c`: marks present are `. @ & | ?` only;
   `budpore` no longer uses trigger `*`, latch `~` or hear `+`, its doorway is a completion-release bond). Once the organism on
   copies runs a whole cycle (priority 3), a `core-review` should weigh removing them (with their demos, into git
   history, as the 10-01 restart did); the case goes through the RULES gate first.
3. **Prepared structure does most of the organism's work.** In `budpore` only the genome copies are grown; both
   rings, the bud's anchor, the doorway bond, the opening and the founder are prepared (ROADMAP, "Organism on copies:
   parts and where they come from"). Of these, the bud ring and everything on it must be made each generation.
4. **Nothing yet tests closure.** The goal is a lineage: the offspring must be able to do it again. `budpore`'s bud is
   not its parent's kind (D is R 5 with a catching anchor `W@|` and a doorway `&` side; P is R 7 with anchor `W|` and a seed for no
   bud), so even a perfect run would end the lineage after one generation. Closure is a design question to settle
   early, before more prepared asymmetries are built on.
5. **A design tension found.** Food protection needs spent `&` walls (spent sides are never copied: imprint m, p);
   but a spent wall cannot be a template, so a complete parent cannot template its bud's ring. Ring material must
   come from something exposed and unspent: the bud's own growing front (as `imprint`'s rings: one motif round grows
   into a whole ring from copies, while open-signal sides are unspent), or templates carried where they stay exposed
   (on the genome, inside the parent). Written into IDEAS.

**Priorities (in order; each a slice).**
1. **M2: the bud copies its genome after the split** (`budpore`, mid-wall anchor in D; as run 1551 set it; run 1921
   built the mid-wall low-end anchor, splits 8 of 8, but the caught strand's backs face the wall; run 2321: an anchor
   with open backs does not help, the parent's leaked copies take the food; run 0320: no fixed doorway works; run 0751: cap release keeps the parent's strands in, the bud still starves, see Exact next step). After the
   split D's half of the opening is its pore, so D is then an `imprint p` cell: the bud "lives on its own".
2. **Closure by design (analysis slice; "designed, not demonstrated" is a valid result).** Specify one organism kind
   whose bud is the same kind: one ring size or a fixed alternation, which anchor holds the founder and which catches
   (one glue for both roles, or roles by position), how the bud's seed site and doorway bond are re-made in the bud, and
   where the bud ring's first motif round comes from (finding 5). Output: a parts list where every part is grown from
   copies or comes from the environment, with each step mapped to an existing demo, and the rules it reads (locality
   check). A `build` or `explore` run can take it; if it needs a core change, the case goes to RULES first.
   **Designed in run 20261003-1121** (`budKit`, IDEAS "Closure by design"); open: the anchor's place, the part pool.
3. **Grow the bud ring from copies** (replace D in `budpore`): the bud grows on P's seed site from copies of its own
   motif round (as `imprint`), outside in the food; doorway bond and anchor as parts of its kit (its walls spent before its anchor emits: IDEAS, 2026-10-03). Fix `imprint`'s one-front
   28/30 stall on the way (Pitfalls: one-front rings), since this ring uses the same growth. Target 3 of 4 worlds.
4. **Two generations:** the bud of priority 3 splits off, copies its genome (priority 1) and starts its own bud.
   This is the goal's whole cycle; then the core-review of finding 2.
5. **Speed (for `harden` runs):** `budpore` worlds take about 3 minutes and the check suite 28 (run 2150: 1.1-1.25x, run 0950: 1.34x, both by exact changes); copy-lineage worlds
   need hundreds of blanks, and lone blocks dominate physics (`_single`). Measure steps per second on `budpore` and
   optimise the lone-block path; keep capability lines identical or explain each difference.
   Next idea (run 2150): a lone block's gather visits about 22 grid cells to find 2 neighbours; a grid kept per step as flat
   arrays (counting sort) would cut that, but neighbour order changes overlap sums, so outputs need re-checking.
**Rotation:** unchanged. Five `build` runs per twelve fit priorities 1-4; `explore` can take priority 2 or a core
change it needs; the two `harden` runs take priority 5 and the copy lineage's partial checks (`budpore`, `imprint`
5 of 8); `core-review` takes finding 2 once priority 3 works.

### Open follow-ups (not priorities; take when a run's kind fits)
- **Core review (after priority 3, see finding 2):** `#` on a trigger side was removed in run 0450. Lock signal has three uses (keys deaf, latches held, pulse doors ignore their trigger); a merge would need
  non-pulse flaps to tell their own open latch from another door's. Same-pass partner reads (zip, gap, release, fn,
  cast) are allowed by convention (RULES, Locality audit); change only if a locality problem traces back to them.
  Coverage hook: `COV_OUT=$PWD/runs/cov.jsonl NODE_OPTIONS="-r ./tri/coverage.js" node tri/check.js` (one JSON line
  per demo world: marks used, rule events).
- **Frozen with the casting lineage (not pursued):** fuel per swing (two carriers on one fuel triangle are both spent;
  design in git, NEXT.md at `c11ed14`), `grown`'s membrane stall at 72-76 of 78, `budgrow g`'s transport tail and
  second bud.

## Commands
```
node tri/test.js                                   # fast checks (~5 s)
node tri/check.js [id ...]                         # capability checks: one PASS/FAIL line each (~28 min, 4 processes)
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
- **A waiting anchor near food is a food sink** (2026-10-03, run 0751). Its unbonded `@` side is copied by every blank
  that touches it (29-69 copies per world), and the anchor cell's own `&` sides stay unspent while it hears its own
  signal (60-68 copies once exposed). Keep waiting anchors away from food or covered.
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
