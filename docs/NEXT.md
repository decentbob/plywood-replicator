# Next instance: start here

**Current slice (autorun run 20261003-1121, build): closure by design (priority 2).** Goal: one organism kind whose
bud is the same kind, every part grown from copies or taken from the environment, each step mapped to an existing demo
or marked new, and the rules each step reads (locality). Done when: the design is written (IDEAS, ROADMAP parts table),
its signal logic is checked deterministically in `tri/test.js` (growth order, completion, release) on a generated kit,
and the least certain step (a strand passing an aligned 3+3 doorway into a bud of the parent's size) has been tried on
`budpore`'s options in 4 worlds. Stop there: no M2 work, no growth-from-copies demo (priority 3).

State on 2026-10-03 (after autorun run 20261003-0950, harden). Read AGENTS.md first (rules of work), then this file.
History of earlier runs: docs/INNOVATIONS.md (newest first), RULES (Core changes), the autorun log and git (older
handoffs: NEXT.md in git, e.g. at `a993d78`).

**Handoff status (autorun run 20261003-0950, harden).** Everything committed on branch `claude/autorun-20261003-0950`
and merged into `main`. No simulations running; `node tri/test.js` 36 pass; the whole check suite was run before and
after (37 of 37 pass, `grown` partial, result lines identical). **Slice: check suite and speed (priority 5). Result:
1.34x by exact changes** (same output byte for byte on all 37 check configurations; suite 2286 -> 1701 s, a `budpore
300` world 253 -> 178 s; details INNOVATIONS run 0950). Nothing failed, so nothing was fixed. The user's idea of growing
a finished membrane by breaking it and inserting triangles is in IDEAS (top) with first feasibility notes; it bears on
closure (priority 2: a bud born small that grows to its parent's size). The next speed idea, if a harden run wants
one: `_overlap` on ring bodies scans mostly the body's own blocks (a per-body list of foreign neighbours gathered once
per `tryMove` would help bodies that take several trials); `_single`'s gather visits about 10 cells per lone block.

**M2 state (from build run 20261003-0751, unchanged).** Slice: plug the parent's half (priority 1, M2). Result: M2 not
met (the bud makes a full copy after the split in at most 1 of 4 worlds of any layout); one new mechanism, cap release
(partial, 2 of 4); a core-change candidate. Details and numbers: INNOVATIONS (run 0751). In short:
- All three options of the old next step fail: more food in a bigger parent never reaches the bud before the split; the
  founder lying in a wall row turns all food into face copies (no fills); the founder right of the doorway lies facing
  in or stalls.
- A catching anchor that waits near food is a food sink (copied 29-69 times per world). With copy binds on `@` sides
  refused (hook), a parent catching anchor plugs the parent in time (3 of 8 with a full copy in the bud), but when it
  catches first its 3-cell pore lets no strand reach the bud.
- *Cap release* (`BUDCAP`, see Commands): the parent's plug anchor is bonded to a free cap until the bud's catch; the
  decaying open signal cuts the cap one pass before the doorway, the freed anchor holds the doorway until it has caught,
  then the pair splits. Order solved, no leak window: the parent keeps 7-14 strands (old layout 1-2). Fails on the bud's
  anchor sink (no catch in 2 of 4) and on the bud's food after the split.
- New demo options (diagnostics): `budpore` `BUDPF=x` (the founder held by its high end in P's row), `BUDNI=n` (blanks in
  P), `BUDRP=r` (P's radius, odd), `BUDTOOTH=a`, `BUDCAP=a`, `BUDDBGA=1` (which prepared sides copy blanks bind; after the
  split by template body), `BUDNOCA=1` (copy binds on `@` sides let go at once: the candidate below, not a rule). The
  hook used for the checks is `runs/noca.js` (four lines, recreate from INNOVATIONS run 0751 if needed:
  `TriSim.prototype.bind` wrapped so a copy bind on an `@` side is cut at once), run as
  `NODE_OPTIONS="-r $PWD/runs/noca.js" node tri/check.js ...`. Pitfall: with `BUDA`, D's cell indices move when P's gap
  changes (count P's removed cells).

**Exact next step.** M2 has had four build runs (1921, 2321, 0320, 0751); the obstacles are now (1) the bud's waiting
anchor as a food sink, which wants the core narrowing (c) below (an `explore` run), and (2) the bud's food after the
split: outside blanks meet exposed templates (both plugs' backs face out, the bud's freed doorway side) before they
pass its 3-cell pore. Recommended order: the next `build` run takes **priority 2, closure by design** (analysis; it
decides what the bud's opening and anchors must be in every generation, which bounds the M2 design); the next
`explore` run weighs candidate (c) and, if adopted, reruns the cap layout (`BUDCAP` command below, 8 worlds) as its
evidence. A build run that returns to M2 should start from cap release and attack the bud's food: e.g. a bud whose
pore is hooded (`imprint ph`), or a plug whose backs face a wall.

**Core-change candidates.** (c) *A copy blank binds no `@` side* (run 0751): a catching anchor waits unbonded and
exposed, and every blank that touches it becomes a useless copy of the anchor cell (29-69 per world when food is near:
`BUDDBGA`). The rule would read the site's own attach mark (the copy bind already reads the site's spent state); it
narrows, adds nothing. Measured as a hook over `imprint`, `imprint-genome`, `imprint-cell`, `imprint-pore`,
`imprint-hood`, `budpore`, `budpore-c`: all pass as before (rings 30/30 in 4 of 4). Cost to weigh: an anchor or ring
front cell can then be copied only through its other free sides. (d) *Code vs RULES:* the anchor catch does not test
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
