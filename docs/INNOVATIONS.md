# Innovation log (typed-triangle world)

One entry per capability: what it is, the evidence, the picture, the command, what it enables. Newest first.
Status: **works** (does what was intended in demos), **partial**, **not yet**. Pictures from before 2026-10-01 were
made with the pre-port engine (experiments/, history before commit `cac79c9`, same rules); `node tri/demos.js NAME`
reproduces each demo with the current engine (`tri/`), except demos marked removed (their code is in git). Results are from one or a few worlds; they show mechanisms,
not statistics.

## 2026-10-03 (autorun run 20261003-0050, explore)

- **The bud lets go by completion release: `budpore`'s doorway bond is an `&` bond cut when the bud's anchor has
  caught** — works (same splits as the latch; no rule change). The copy lineage no longer uses trigger `*`, hear `+`
  or latch `~`.
  - Design: the doorway bond (leftmost P-D contact) carries `&` on both sides and no glue. D's anchor `W@|` emits the
    open signal while it waits (an unbonded `@` side with glue); `openRange` is the anchor's distance to the doorway
    cell + 3, so both sides of the bond hear it. When the anchor catches a strand its `@` side is bonded, the signal
    fades (one bond per pass) and completion release cuts the bond; both freed sides are then spent and never copied.
    The walls start spent (labelled starting condition: one completion pass while only the anchor hears its own
    signal, then the range is set; spent sides stay spent). Replaces the latch `~` on the bond, the anchor's trigger
    `*` and the 4-bond hear chain `+` (code at `e2634fb`).
  - Evidence, sealed pair (`budpore k 100000 runs 100c`, seeds 1-8, `DBGC=1`, before the anchor narrowing below):
    split at 37500 / - / 20000 / 30000 / 12500 / 20000 / 5000 / 40000, the same as the latch version in every seed;
    copies of wall types 0 / 0 / 1 / 0 / 0 / 0 / 0 / 0 (latch version: 15 / 0 / 20 / 30 / 57 / 12 / 8 / 24, mostly
    copies of the freed latch side `-~--+` and of P's freed side): all 180 copies go to the genome. Copies made inside
    the bud after the split 2 / - / 5 / 24 / 25 / 0 / 12 / 16 (latch: 6 / - / 1 / 12 / 12 / 0 / 4 / 7); a full copy on
    the bud's anchored strand still only in seed 7. Open pair (`budpore k 200000 runs 300`, seeds 1-4): split at
    35000 / 30000 / 60000 / 45000 (as the latch) with 182 / 199 / 124 / 150 blanks left (latch 176 / 193 / 113 / 136).
  - Earlier `&` hold (run 1921, variant 3) lost 190-210 blanks to the walls: every wall cell hearing the anchor kept
    its free side unspent. Starting the walls spent removes that; the caveat for a grown bud is recorded in IDEAS
    (its walls must be complete before its anchor emits).
  - Picture (seed 6 at the split, t=20400: the bud, top, leaves with 4 strands; the doorway bond is cut, its sides
    spent): ![completion-release doorway](pictures/budpore_release.png)
- **Core change (narrowing): an anchor side binds only as an anchor, never by glue** — works as intended; M2 not moved.
  - Before: free copies of the waiting anchor cell (`W@|`, parts) glue-bound strand low ends `w`, capping them, and
    were copied again once attached. Gate entry in RULES (Core changes); test "anchor: an anchor side binds only as an
    anchor, never by glue (free or attached)" (fails on the old rule).
  - Evidence (`budpore k 200000 runs 300`, seeds 1-8, both with the completion-release doorway): copies of wall types
    22 / 22 / 35 / 28 / 22 / 30 / 31 / 20, only direct copies of the waiting anchor (old rule: 62 / 65 / 84 / 71 / 84 /
    94 / 47 / 64, of which 14-43 copies of anchor copies bound to strands); genome copies 265-280 of 300 (old 206-253).
    Split at 35000 / 50000 / 40000 / 35000 / 20000 / 45000 / 35000 / 35000 with 165 / 0 / 170 / 183 / 233 / 170 /
    147 / 155 blanks left (old: all 8 with 118-199 left; seed 2 caught late, after the food was gone). Full copies on
    the bud's anchored strand after the split: seeds 5, 6 (old: seeds 1, 2, 7). M2 is still food going outside: after
    the split 89-161 genome copies outside, 2-54 inside D.
  - Full check suite: CHECK_PENDING.

## 2026-10-03 (autorun run 20261002-2321, build)

- **Sealed bud pair (`budpore` option `c`): the parent feeds from food inside and fills its bud with genome copies;
  splits in 7 of 8 worlds** — works as a split (check `budpore-c`); the bud's own copying after the split is still
  1 of 8 (M2 not yet). No new rule; prepared layout (labelled).
  - Design: the doorway joins P and D only (contact cells removed for -0.75 < x < 2.25; the walls touch, unbonded, on
    both sides of it, held rigid by the one latch bond), so nothing gets in or out while joined. 80 copy blanks start
    inside P, 100 outside. P's anchor `W|` is the side of P's wall facing into the doorway at its left edge: the founder
    hangs under the doorway, and the copies made on it are released at the way into D, where D's mid-wall anchor
    catches one and the latch lets go. Each half of the doorway is then a pore.
  - Evidence (`node tri/check.js budpore-c`: `budpore k 100000 runs 100c`, seeds 1-8): split at 37500 / - / 20000 /
    30000 / 12500 / 20000 / 5000 / 40000, strands in the bud at the split 1 / - / 3 / 3 / 1 / 4 / 1 / 3. Before the
    split the food goes to the genome: 150-172 of 180 copies are genome triangles in 6 of 8 worlds (open layout: 107-193
    of 300), and about half are back copies, so fills no longer starve. Controls: the same sealed layout with P's anchor
    in the middle of P's far wall: 0 of 4 split (seeds 5-8; strands seldom pass the doorway); 2-unit doorway: 0 of 4.
  - Still missing (M2): after the split both halves of the doorway are 3-unit pores; P's 4-9 strands leave P and take
    the outside food (out 24-87 genome copies, the bud 0-10); one full copy in the bud in 1 of 8 (seed 7). With 300
    blanks outside: out 66-253, the bud 6-27, still no full copy on the bud's anchored strand.
  - Dropped: the founder hanging from the doorway's right edge stands up into D, but its backs face P's wall: no back
    copies at all (fills 0, 80 face copies) in 4 of 4.
    A second plain anchor `W|` in P beside the doorway (to hold one of P's copies back): splits fall to 2 of 8 (right of
    the doorway, x = 3.5) or 5 of 8 (left, x = -2.5), and as much food leaks out (out 61-86 genome copies).
  - Picture (seed 6 at the split, t=20000: the bud, upper right, leaves with 4 strands, several with partial copies on;
    P keeps the founder and many unused face copies): ![sealed bud pair](pictures/budpore_sealed.png)
- **M2 (`budpore`: the bud copies its genome after the split): not yet; what limits it is food, not the anchor's
  geometry** (measured). No rule change; the default demo output is unchanged.
  - Dry-run of the catch (`BUDDRY=1 node tri/demos.js budpore 1 10 runs 300`): a strand caught by its low end `w` is
    placed on each inner side of D exactly as the anchor rule places it (`_snapBody`), and each back and face site's
    distance to the nearest wall cell is printed. On every flat-wall side the first back site shares an edge with a
    wall cell (0.58); at the corners the strand lies along the wall (all backs 0). Only side 106:1, next to the latch
    cell, where the acute wedge opens into the doorway, has every back clear: 1.00 / 2.00 / 2.65 (the anchored end's own
    face site is then the one at 0.58).
  - With that anchor (`BUDA=106:1`, seeds 1-4, 300 blanks, 200000 steps): split 4 of 4 (25000-70000), releases on the
    bud's anchored strand 0 / 0 / 0 / 1: no copy. With 600 blanks: 1 / 2 / 0 / 1, no copy, although 300-410 blanks were
    left at the split. Where the food goes after the split (`DBGC=1`): inside D 2-17 genome copies, outside 118-256
    (P's copies leave P through the opening, are free strands with open backs and copy fast in the open food), plus
    freed latch sides (up to 82) and anchor-cell copies (up to 106). The bud's interior is one small target beside an
    exponentially growing population of free strands.
  - Copy economy (seed 3, `DBGC=1` prints copies by type): face copies (`wza`, `zAw` and rotations) 130, back copies
    `-W-` 60, fills 60, docks 122: with `latGlue` every back copy becomes a fill, and fills, not dockers, limit copying
    everywhere. Docked dockers expose their own free sides, so face copies breed at the strand while backs do not.
  - Dropped (measured): `latGlue` off (default anchor): fills from any blank, but wall copies 166-191 and no full copy
    in the bud; 20 blanks placed inside D at t=0: they go to copies of the anchor cell before the catch (wall copies
    135-159), one full copy in 1 of 4; a closed doorway joining P and D only with P's anchor where it was (80 blanks in
    P): P makes 3-5 strands (70% of copies on the genome, nothing leaks out), but strands seldom pass the internal
    doorway: 0 of 4 split (2 units), 1 of 4 (3 units); fixed by moving the founder under the doorway (entry above). Code for `d` at commit `1a77906`; the sealed layout became option `c` (above).
  - Picture (seed 3, anchor 106:1, t=60000, the bud 37500 steps after its split: its strand beside the pore with
    dockers on, waiting for fills; almost no blanks inside): ![bud starved](pictures/budpore_starved.png)

## 2026-10-02 (autorun run 20261002-1921, build)

- **`budpore`: the bud catches mid-wall by the strand's low end and splits with food left** — works (8 of 8 seeds);
  **M2, the bud copies its genome after the split: not yet** (2 of 8 seeds make one full copy). No new rule.
  - Design (fewer exposed sides, same core): D's anchor `W@|*` sits in the middle of D's lower-left wall (the inner
    side farthest from D's corners within 5 ring bonds of the latch cell); the 4 cells from the latch cell towards the
    anchor carry a hear side `+` towards it, so the latch cell hears the anchor's trigger signal (sigRange 6) and lets
    go. The anchor catches a strand's **low** end `w` (the same glue as P's anchor `W|`, which holds the founder): the
    high end, where copying starts (zip), stands free in the bud. The latch bond and every prepared wall side carry no
    glue (prepared bonds need none).
  - Evidence (`node tri/demos.js budpore k 200000 runs 300`, seeds 1-8): split at 35000 / 30000 / 60000 / 45000 /
    65000 / 45000 / 40000 / 45000 with 176 / 193 / 113 / 136 / 106 / 157 / 165 / 139 blanks left (before: 4 of 8,
    70000-135000). Releases of copy triangles on the bud's anchored strand after the split: 5 / 3 / 4 / 1 / 2 / 2 / 0 /
    3 (a full copy of `aAaA` releases 4 dockers): one full copy in seeds 1 and 3. Check `budpore` (seeds 1-4, split
    with 50+ blanks left; the line also reports the bud's copies).
  - Variants measured and dropped: (1) mid-wall anchor catching the high end `z`: 1 of 4 split (the caught end is the
    one copying starts from, pinned at the wall); (2) low-end anchor at the old corner place: splits, but the bud
    makes 0-2 releases (its strand lies along the wall); (3) no latch, an `&` hold two bonds from the anchor (openRange
    3): every cell hearing the anchor keeps its free side unspent and was copied, 190-210 wall copies before the split,
    late catches (56000-151000); (4) the mirrored layout (opening and latch on the other side, anchor on D's
    lower-right wall): 2 of 4 split, no copies; (5) "replicate before dividing": the mid-wall anchor without trigger,
    its anchor side also a latch side (an unbonded latch side emits the lock signal, so the latch holds until it has
    caught), and a second, triggering anchor 2 bonds from the latch cell: the first caught in 4 of 4, the second never
    (no split in 200000 steps).
  - **Why the bud does not copy yet (measured).** First, where the strand's backs face: caught by its low end, the
    strand stands at 60 degrees to the wall with its backs towards the acute wedge (seed 1: back sites 0.58, 1.00 and
    1.53 from the nearest wall cell centre, the first covered by a wall cell; faces 1.0-2.5). Backs there get no
    copies, so fills are rare: the strand docks (seed 1 with weld glue: three dockers by 100000 steps) and waits. Even
    while joined with food around (two-anchor variant below) the bud's strand got 0-3 releases in 100000+ steps.
    Second, food (`DBGC=1`): the blanks are gone by about 80000 steps. After the split the food goes to
    (a) the two latch sides, freed and unspent (with weld glue: seed 1, 105 of 172 blanks; their copies glued into
    crystals on P, now inert), (b) copies of the anchor cell made before its catch: parts `W@|*` that glue-bind strand
    low ends `w` (5-17 per world) and are copied again from their free sides (30-80 copies), (c) most of all, P's copies
    outside, which keep copying (out: 50-100 copy events with 300 blanks; 170-270 with 600). With 600 blanks the bud
    still made at most one copy (seeds 1-4: 0 / 1 / 0 / 0): the bud's interior is a small sink beside many templates.
  - Picture (seed 3: split at 60000 with 113 blanks left; the frames then follow the bud, which makes one copy of its
    strand): ![budpore mid-wall](pictures/budpore_mid.png)

## 2026-10-02 (autorun run 20261002-1551, explore)

- **An anchor catches a strand while it is being copied (core change)** — works; `budpore` (bud pair on copies) is
  still partial, now 4 of 8 seeds instead of 0 of 4. Rule: an anchor side `|` catches a strand end whose spare edge
  is unbonded and carries the complementary glue, whether or not the strand is busy or its end face is docked; the
  strand and its partial copy move as one body into the flush place (RULES, Core changes, with the case). The anchor
  reads less than before (no busy relay, no face bond).
  - Evidence, `node tri/demos.js budpore k 200000 runs 300` (300 blanks outside): seeds 1-4 split at 70000 / 100000
    / no / 95000 with 100 / 81 / - / 83 blanks left; seeds 5-8: no / 45000 (122 left) / 135000 (0 left) / no. Before
    the change, seeds 1-4 never split with 300 blanks (run 0921). A variant that kept "the end's face is free" split in
    2 of 4 (seeds 1, 2). Partial check `budpore` (seeds 1-4, split with blanks left).
  - Cost: `imprint ... 150p` seed 2 now fails (1 strand instead of 7): its lone founder was caught at step 1001 in its
    first copy, before any back had been copied; pinned at the wall its backs face a narrow wedge blanks do not
    reach, so no fill triangle exists and the copy stays docked for good (pictures below). Seeds 1, 3-8 pass (5-8
    identical to before): 7 of 8. A strand caught busy finishes its copy only with fills made elsewhere.
  - Not yet: the bud copies its genome after the split. D holds 1-2 strands at the split and 1 at the end: its anchor
    sits beside a corner (the caught strand lies along the wall, no back exposed). Next: a mid-wall anchor in D.
  - Pictures: `docs/pictures/budpore_busy.png` (seed 1: the bud catches a busy copy at 70000 and leaves, food left);
    `docs/pictures/anchor_busy_deadlock.png` (imprint p seed 2: the founder caught mid-copy, no fills).
  - Checks: all 34 pass with the change (`imprint-pore` 3 of 4), plus partial `budpore`.

## 2026-10-02 (autorun run 20261002-1351, build)

- **Grown bud catches a genome copy** — works: 3 of 4 check worlds at 300000 steps; 6 of 8 seeds at 400000 (5 of 8
  at 300000). `budgrow` with
  `split g`'s content: the bud ring grows on the parent's seed as before, but carries an anchor instead of a cap, and
  the parent holds the genome. No new rule; three existing pieces combined (grown bud, anchor `|`, stamp-cast dockers).
  - Set-up (`node tri/demos.js budgrow k 400000 runs g`, labelled start): the parent P of `budgrow` with the founder
    `aaaa` held by an anchor `W|` (an inner side mid-wall, far from the pocket and the door; placed there at t=0) and
    its stamp pocket casting the founder's dockers `Ay.z` from 40 blanks `xxx` (24 fills `Y--`; `latGlue`), so P makes
    copies `AAAA` whose high end exposes the seed `z`; the bud kit outside. `grownBud({anchorGlue:'Z'})` puts `Z@|` on an
    inner side of an early wall-front cell (cell 6) in the middle of a flat wall: like the cap seed it emits the open
    signal, which holds the pair together until the anchor catches a copy's `z`; then nothing is open, the root's `&`
    lets go, both doors shut and the bud leaves with the copy.
  - Evidence (seeds 1-8, 400000 steps; `events:` lines): ring closed at 133500-229600; doors open 150 steps later; copy
    anchored 29400 / 83150 / - / 35350 / 66700 / 61450 / 209750 / - steps after opening; split 100-150 steps after
    the anchor caught; both doors shut in all 6; no early release. The two failures (seeds 3 and 8) are still open
    with 8-9 idle copies in the parent: a copy must drift through the doorway into the bud with its high end first;
    nothing is wrong at the anchor (copies are not busy: nothing copies `AAAA`). Check `budgrow-g` (seeds 1-4, 300000
    steps, need 3).
    Picture (world 4: growth, open doorway, the bud leaving with its anchored copy; a second bud then starts on the
    parent's seed): ![budgrow genome](pictures/budgrow_genome.png)
  - **Three design points.** (1) The bud's seed glue must differ from the genome's letters: with the default seed `z`
    a free anchor part `Z@|` bound the parent's seed side in place of the root (the demo passes `seed: 'v'` to `grownBud`; the
    genome uses `a y z w`). To find the letters, the parent's panel welds (prepared, never released) now share the weld letter `f`,
    as kit welds do (54 letters left for the bud; the glue code is Int8: 63 letters in all). (2) **An early anchor and
    a supply race:** after the 7-cell panel front is complete only the anchor emits the open signal, so if the panel
    finished before the anchor's cell arrived, the root let go and the half-grown bud drifted off (seeds 1 and 2 of the
    first run, at 29200 and 33400; a new bud then regrew on the freed seed). The anchor is the earliest mid-wall side
    (cell 6; cells 2 and 4 are beside a corner or in a door sweep) and the wall-front cells up to it get three times
    the supply (as `kitRace`): no early release in 8 worlds. (3) Leftover anchor parts trapped in the bud when it
    closes carry `Z@`, and a copy's seed `z` catches them (one copy per world lost that way); harmless while copies
    are plentiful.
  - Observed, not yet measured: after the split the parent's seed latch is free and a second bud starts growing on it
    from the remaining kit parts (world 4; also in the cap variant). The old `budgrow` report looked up any bonded root
    and so read that second bud after the split: world 1's "door open after the split" was this misreport (same
    events on the old code, doors shut); the report now follows the bud the events track, and `budgrow` is 4 of 4.
  - Limits: the parent and its door, pocket and founder are prepared; the bud carries one copy and nothing that copies
    it (next: food for the bud after the split, as `imprint p` or `split o`); transport through the doorway has a long
    tail.

## 2026-10-02 (autorun run 20261002-1050, harden)

- **Physics: no block passes a gap narrower than itself (midpoint check merged)** — works; capabilities rebuilt on
  it by layout and supply changes only (no rule change). A direct move longer than a sub-step (0.8) now needs a clear
  midpoint as well as a clear end. Before, a block sitting in a one-row wall's hole hopped across the wall (95 of 2000
  kicks of 0.95), and six checks relied on such hops (run 0721's core review). A probe (`runs/pinch.js`, scratch;
  logic: wrap the midpoint check, log every move it blocks and the lone blocks that bind within 3 steps after one)
  and pictures located each site:
  - **budgrow** (1 of 4 -> 3 of 4): the bud ring's last site q began exactly at the parent's top-right corner apex,
    so the only way in was a channel exactly one block wide (0.866) between the parent's slanted wall and q's
    neighbour. `grownBud` now requires the last site's approach (q mirrored across its free side) to share no side
    with any cell; no layout of any ring size met it with the current door search (the one candidate at offset 3 has
    the parent's door hinged at its corner, swinging up into the bud's door), so the parent's outer corner cell next to
    q is left out: its two neighbours still meet at a point, the parent stays one sealed body (no block passes a
    point) and q's way in is a 120 degree opening. The door search now tries every clear door pair.
  - **split-o** (0 of 4 -> 4 of 4): the bud's import door dropped its blank into a pocket boxed in by the open
    panel, the wall and the anchored strand (centroids 1.2 from the sweep); the panel could not swing back over it and
    the door never shut again (imports 2-18 instead of 13-43). `budPair` keeps the drop place clear (strand, its dock
    sites and the organelle at least 2 away) and tries the next import door candidate when nothing fits.
  - **lid, grow** (single seed -> 4 worlds, need 3): seed noise, not the hop. Eight-seed sweeps give the same mean
    under both rules (lid 7.0 vs 6.6 casts; grow completes 5 vs 6 of 8; on the old rule grow's seeds 1-4 complete 2).
  - **imprint** (2 of 4 at 100000 -> 3 of 4 at 200000 steps): also noise at its threshold (both rules: 3 of 8 worlds
    at 100000 steps; main itself fails world 3). Two stalls remain: a ring at 28/30 whose second-to-last site faces
    inward (with that site and the last one open, the gap through the one-row wall is a rhombus exactly one block wide:
    only a part already inside can fill it), and early part starvation (rings at 7 and 2 cells).
  - **grown** (1 of 1 -> partial): the lid pocket's cell beside the slot is a leaf of every kit tree; if the cell above
    it arrives first, its site is closed off except through the slot (a race, `structures.kitRace`). Three times the
    supply of such cells completes the pocket in 4 of 4 worlds; membrane roots 6 instead of 2 (otherwise the faster
    pocket went live before a membrane root attached). The membrane now closes in 1 of 4 worlds by 200000 steps
    (others stop at 72-76 of 78; not diagnosed). The check is partial.
  - Picture: the import door trap in split-o before the change (the open panel, the boxed-in blank `uuu` between it,
    the wall and the anchored strand): ![import trap](pictures/import_trap.png)
  - Command: `node tri/check.js budgrow split-o lid grow imprint` (about 15 minutes).
  - Enables: membranes, pores and doorways are now sealed for anything wider than the gap; claims about what gets in
    or out (pore feeding, controls) no longer depend on a leak.

## 2026-10-02 (autorun run 20261002-0921, build)

- **A cell fed through a pore (genome on copies, food from outside)** — works (4 of 4 worlds). A ring with a pore
  copies its genome from copy blanks that come in from outside; no new rule. This answers the core change candidate's
  design (b) ("a pore: the rings' outer walls take every blank"): that was true only with plain walls. With every free
  side spent (`&` on the outer, inner and pore-edge sides of a complete ring, which hears no open signal), nothing on
  the cell's surface can be copied, so blanks pass the pore and copy only what lies inside.
  - Set-up (`node tri/demos.js imprint k 100000 runs 150p`, labelled): the sealed ring of `imprint m` (R 6) without
    the 3 wall cells in the middle of its top wall (a pore), an anchor `W|` in the middle of the bottom inner wall,
    the founder `aAaA` (seeded as `seedCopyGenome`) inside, 150 copy blanks outside only (world 20 x 20).
  - Evidence (100000 steps): 6 / 5 / 5 / 5 strands inside (17 / 14 / 6 / 12 in all: copies leave through the pore
    and are copied outside too); all 150 copies are of genome triangles, none of the wall. Controls: no pore (`150pc`):
    0 copies, the founder alone; plain walls with the pore (`150pn`): all 150 copies are of wall cells, no genome copy.
    Checks `imprint-pore` (need 3 of 4 with 4 or more strands inside and no wall copies), `imprint-pore-c`,
    `imprint-pore-n`. Picture (world 1): ![imprint pore](pictures/imprint_pore.png)
  - **The anchor must sit in the middle of a flat wall.** First placed at a hex corner: the anchored founder lay along
    the next wall with its backs against it, no back could be copied, so no fill existed and the first copy stayed
    docked for good (world 4: 1 strand). In the middle of a flat wall the strand stands at 60 degrees into the cell,
    faces and backs exposed. (The same trap is run 0236's "founder bound to P's anchor at t=0", variant (d).)
  - Limits: the anchor holds one strand (the founder, or a copy if the founder left first); copies leave through the
    pore as freely as blanks come in (no selectivity: a pore is as wide for a strand end as for a blank); food is a
    finite batch outside (150 blanks).
  - Enables: a bud that copies its genome after the split, fed through its own pore (below); the core change
    candidate "bringing copy blanks into a cell" is no longer needed for feeding.

- **Bud pair on copies with a doorway (`budpore`)** — partial: the pair splits in 2 of 4 worlds; the bud never copies
  its genome after the split (M2 of the build line: not yet). Fewer parts than `split q`: no doors, no `&` pairs, no
  open signal on the walls. P (R 7) and D (R 5) are joined by one latch bond beside a single opening that joins P, D
  and the outside; D's anchor next to the latch is `Z@|*`: when it catches a copy's high end its trigger side is bonded
  and the latch lets go (existing rule: a latch lets go while a non-hinge partner has a bonded trigger). With no open
  signal every wall side is spent from t = 0. Command: `node tri/demos.js budpore k 200000 runs 150`. Picture (world 4,
  split at 54000; last frame: the bud, its strand lying along the wall): `docs/pictures/budpore.png`.
  - Evidence (150 blanks outside, 200000 steps): split at 130000 / no / no / 55000; both splits came after the blanks
    were spent; the bud then held 1 strand and made no copy (no food left, and its strand lies along its wall).
    300 blanks: no split (worlds 3 and 4 to 200000 steps, D held 2-3 free strands for over 100000 steps and caught
    none; worlds 1 and 2 stopped at 95000 without a split).
  - **Why D's anchor does not catch (measured):** a probe counted strand ends with seed `z` within `capture` of D's
    anchor site every 20 steps (world 3, 60000 steps): 52-87 approaches, all while the strand was busy (busy 26-30),
    0 capture attempts. A strand's seed is active only while it is not being copied; with blanks around, a blank
    touching a face becomes a docker beside it and zip docks the high end first, so ends are idle only for moments.
    `split g` catches because its dockers come only from P's pocket. Core change candidate, built in run 1551 (RULES, Core changes).
  - **Tried and removed, `split ... qp`** (pores in run 0236's `split q`): the `&` pairs that hold a pair lie on both
    sides of its doorway (P's doorstop and pairs left, D's hinge, doorstop and a pair right), joined only round D, so
    D's anchor needed open range 27 (two anchors: 11); every wall cell in range keeps its free side and outside blanks
    copied them: 200 copies in 5000 steps, 2% of them genome. Pores in a pair's walls also cut the open signal's way to
    the pairs (a second gap). A first `budpore` with `&` pairs on one side of the doorway (range 4, 9 cells hearing)
    still lost 60-90% of the blanks to the neck. Hence the latch hold.
  - Next: the bud needs a mid-wall anchor (a hear chain `+` from the anchor to the latch allows up to 5 bonds) and an
    anchor that catches busy strands (core change), then food lasts past the split.

## 2026-10-02 (autorun run 20261002-0236, build)

- **Genome on copies inside a sealed cell** — works (3 of 4 worlds). A cell copies its genome from copy blanks alone:
  no casting pocket, no dockers or fills in supply. No new rule: two existing pieces combined.
  (1) A genome that is its own reverse complement (faces `aAaA`), so copies of its face triangles are its dockers and
  copies of its backs its fills (`latGlue`: every back carries `W` on its next side, every face triangle `w` on its
  prev side and `z` on its next, so only back copies fill and every strand, founder or copy, exposes `w` at its low end
  and `z` at its high end; `demos.seedCopyGenome`). (2) **Spent walls:** every plain free side of the membrane is a
  completion side `&` (no glue, binds nothing). A complete structure hears no open signal, so these sides are spent at
  once, and spent sides are never copied: every copy blank goes to the genome instead of the wall.
  - Evidence (`node tri/demos.js imprint k 40000 runs 60m`, sealed ring R = 6, founder and 60 copy blanks inside):
    5 / 2 / 5 / 6 free strands (founder included); all 60 copies are of genome triangles, none of the wall. Control
    (`... 60mn`, plain walls): 2 / 2 / 3 / 3 strands; the wall takes 34-42 of the 60 copies. With 40 blanks: 2-4
    strands (control 2). Checks `imprint-cell` (4 seeds, need 3 with at least 4 strands and no wall copies) and
    `imprint-cell-n`. Picture: ![imprint cell](pictures/imprint_cell.png)
  - Limits: a finite batch: blanks are spent in about 2000 steps; dockers come out unbalanced (`a` against `A`) and a
    copy waiting for a missing docker type stays paired with its template for good. Blanks cannot be imported (a copy
    blank binds only by its copy side, so no key catches it): a core change candidate, found not needed in run 0921 (a pore with spent walls feeds a cell).
  - Enables: a bud that copies its genome after the split without a pocket (it is complete then, so its walls are
    spent); food for the genome is one uniform blank type.
- **Bud pair on copies (`split ... q`)** — partial: 1 of 4 worlds. `split` with the genome above and 70 copy blanks
  inside P as the only food (no stamp pocket, no dockers or fills; P's anchor `W@|`, the founder free in P, all plain
  free sides `&`, `openRange` 30 so D's anchor's open signal reaches the `&` pairs that hold the pair, op 3-10 at t=0,
  but not P's far walls). P makes 1-2 copies of its genome; in world 4 one reaches D's anchor and the pair splits at
  38000 with both doors shut; worlds 1-3: no strand reached D's anchor in 150000 steps (stalled half-copies; strands
  crowded by 70 free copies). P's anchor `W@|` emits the open signal too until it holds a strand (it held none), so
  only 3 of 134 wall cells were spent; with a plain `W|` (tried, 4 worlds, removed) 60 of 134 are spent, P makes 2-4
  strands and strands enter D in 3 worlds, but D's anchor caught none (0 of 4 split; not diagnosed). Command: `node tri/demos.js split k 150000
  runs q` (variant removed 2026-10-02, cleanup run 1821, superseded by `budpore`; code in git at `c11ed14`). Picture (world 4): `docs/pictures/split_copies.png`.
  Tried on the way (each 4 worlds): (a) RP 9 and 140 blanks, plain walls: the walls took 65-70% of the copies, copies
  stall, no anchoring; (b) a pore in P's wall and 400 blanks outside: all 400 were spent on the rings' outer walls,
  none got in; (c) `&` walls with glue-agnostic fills: copies of `&` wall cells became fills and were cut when their
  `&` side heard no open signal (91 cuts in one world), hence `latGlue`; (d) the founder bound to P's anchor at t=0:
  it lay along the wall with its backs hidden, so no fill copies were made.

## 2026-10-02 (autorun run 20261002-0136, explore)

- **Contact copying (programmable synthesis, decided and built)** — works in isolation. The explore run compared part
  templating, translation and kit-free growth through the core-change gate (IDEAS, decision; RULES, Core changes) and
  chose the smallest templating: one mark, the copy side `?`. A copy blank (`-?-?-?`, a free triangle) binds by a copy
  side to any free side of an attached triangle, whatever its glue, takes that triangle's whole type (the partner
  turned about the shared edge: glues, marks, carried marks) and lets go in the same pass. No machine: the body is the
  template. Unlike stamp pockets this closes the loop: any part on a body's surface, stamp casters included, can be
  multiplied from one uniform blank type.
  - **Ring from copies** (`node tri/demos.js imprint k 100000 runs`, world 36, 400 copy blanks, no free parts): a ring
    (R = 3) grown one motif round on an anchor (root and 5 motif cells: one of each part, prepared, labelled) and a bare
    anchor. Copies of the ring's cells and root complete the ring and start and complete a second ring on the bare
    anchor: both closed in 3 of 4 worlds (closures 61353 / 51554, 33960 / 81267, 26388 / 36407 steps); world 3
    stalled at 7 and 3 cells: one part type (an inner-facing cell) got a single copy before the blanks were spent
    (blanks are used up in about 10000 steps, shared by whatever is exposed: anchors, roots and outer faces take most).
    Control (`... c`, blanks without `?`): 6 cells, nothing copied (2 of 2 worlds).
  - **Genome on copies** (`imprint k 30000 runs g`): a founder strand whose faces `aAaAaA` are their own reverse
    complement and 200 copy blanks, no dockers or fills in supply. Copies of its face triangles are its dockers, copies
    of its backs its fills: 10 / 15 / 12 / 8 free strands after 30000 steps (4 of 4 worlds); control `gc`: 1 strand.
  - Pictures: ![imprint](pictures/imprint.png) ![imprint genome](pictures/imprint_genome.png)
  - Limits (stated in the gate entry): only free sides are copied (5 of the lid pocket's 16 kit cells are enclosed when
    complete; a closed ring's inner faces only from inside); everything exposed is copied, strays and anchors too; a
    finite blank supply goes to whatever is exposed, not to what is needed.
  - Enables: feeding a bud from copies of its parent's own parts and a genome that makes its own dockers, so kit parts
    and casting pockets need no longer be food; a later core-review may remove stamp marks and casting.

## 2026-10-02 (autorun run 20261001-2235, build)

- **Grown bud** — works (4 of 4 worlds). The bud ring is no longer prepared: it grows from free kit parts on a seed
  side of the parent's wall (`structures.grownBud`, demo `budgrow`; the parent, its stamp pocket and blanks are a
  labelled prepared start). Every bud cell is its own type (54 types, 4 copies each). From the root two fronts grow: the
  bud's door panel (7 cells along the contact row, hinged to the root) and the wall the long way round; the wall's last
  cell q meets the panel's far end flush, unbonded. No new rule; the order of events comes from existing signals:
  - **Doors held by the lock signal.** Both door panels (the parent's, 5 cells, and the bud's) are pulse doors (`#`)
    with a built-in trigger, so they open whenever they hear no lock signal. The parent's seed side, the root's seed
    side and every site of the wall front are latch sides (`@~`): while any is unbonded it emits the lock signal. So
    both doors stay shut while the bud grows and open about 150 steps after q arrives (its ring is closed).
  - **Open signal from the panel front and the content.** Latch sites emit no open signal; the panel front's sites
    and the cap seed (on the wall front's second cell) do. The root's seed side is a completion release (`&`): while
    the cap is open the pair holds; the parent's stamp pocket casts cap parts from blanks, they come through the
    doorway and grow the three-cell cap; then nothing is open, the seed bond is cut for good, both seed latches are
    open again, their lock signal swings both doors shut, and the bud drifts off with its panel.
  - **Geometry.** A grown panel hangs only by its hinge (any second bond locks the flap). The panel's far end must
    separate from q when it swings into the bud, so q is an up-triangle in the contact row; one resting on the parent
    would make q's site enclosed (its three sides taken), so the bud sits shifted 2 to the side and q overhangs the
    parent's top corner (its free side faces open space). `grownBud` searches this layout (offset, panels, pins,
    sweeps, cap place).
  - Evidence (`events:` line per world, 250000 steps): ring closed at 141450 / 154150 / 152600 / 172650; the parent's
    door never moved before that (0 degrees); doors open 150 steps later; cap cells 900-4600 steps after closure;
    split 100-200 steps after the last cap cell; both doors shut. Sigma-0 test of the door order in `tri/test.js`.
  - Command: `node tri/demos.js budgrow 1 250000 runs` (about 3 minutes; extra: copies per type). Picture (t=0, growth,
    the closed bud with its cap, the bud after the split): `docs/pictures/budgrow.png`.
  - Limits: the parent is prepared and its door is not regrown; the next bud would need the parent's seed latch only
    (it is free again after the split) and a new kit supply; the content is a cap (no genome or organelle yet); a
    small race remains (if the 7-cell panel completes before the wall front's second cell arrives, nothing is open
    and the root lets go early; not seen in 8 worlds).
  Enables: the BIG goal's "builds its offspring" on a grown bud; next, a genome copy and a pocket in the grown bud.
- **Physics fixes (two leaks through walls)** — found because cap parts left the closed parent ring. (1) A lone block
  that started touching another block (cast products and released parts do) could take its whole kick when that
  reduced its overlap, of any length, and jumped through a one-row wall on kicks above 1.44: the overlap-reducing move
  is now at most 1.0. (2) A lone block's trial checked only blocks in the 3 x 3 grid cells (1.4 wide) around its start,
  but reaches 1.15 + its move; near a cell edge it moved into wall cells it had not checked: the search now covers the
  whole reach. Tests for both (each fails on the old code). Effect on old capabilities: kit pockets grow a little
  slower (blocks no longer tunnel into kit sites); `heir` needs 45000 steps (was 30000) and `cycle` 200000 (was
  120000) on the check's seed (old physics: third generation in 2 of 4 worlds at 120000; new: 0 of 4 at 120000, seed 1
  at 200000), and `split o` 450000 (was 200000: with 200000 two of 4 worlds were still joined; at 450000 all 4
  split at 60000-285000, import 34-51 blanks and copy their genome). `node tri/check.js`: 24 of 25 with the old
  `split-o` horizon (that check then failed 2 of 4); `split-o` at 450000 was run separately on its 4 worlds: 4 of 4.

## 2026-10-01 (autorun run 20261001-2006, harden)

- **Capability checks (`tri/check.js`)** — works. One command runs every capability ROADMAP marks as working (24 checks:
  each an existing demo on fixed seeds with pictures off, `TRI_NOPIC=1`) and reads a pass condition from the demo's
  own last report line (copies made, casts, ring closed, blanks imported, bud split with doors shut, ...), with
  controls (factory without pockets, energy in the dark). Capabilities claimed for several worlds run 4 seeds and need
  3. At most 4 processes, longest jobs first; about 8-9 minutes on a 4-core container (`grown` alone takes 5.5 min).
  First run: 22 of 24 passed; `cells` (2 of 4) and `live` (2 of 4) had fallen below their recorded 3 of 3, fixed below.
  Command: `node tri/check.js` (or `node tri/check.js ring live` for some).
- **A bud that lives alone** — works (4 of 4 worlds, prepared pair; was 2 of 4). An end-of-run report (demo `split`,
  extra `o`) lists each kit cell missing from the bud's pocket, its tree parent, its kit neighbours and where the
  copies of its type are. It found two causes, neither supply: (1) a yolk blank `uuu` that had come in through the
  doorway closed onto two casters' close-only instruction sides `U.` in the pocket's last caster site (cell 1) and
  blocked it for good (seeds 2 and 3); the bud needs `uuu` only after the split, so none starts inside P any more (all
  40 start outside and come in through the bud's own door). (2) Then cell 13 stalled in seeds 3 and 4: its site had a
  side on the bud's wall, so once its parent was there a part could enter only through one side (a narrow site);
  `budPair` now prefers, after kit risk, the organelle placement with the fewest kit cells touching the wall (one with
  none exists, same kit). Result: in all 4 worlds the pocket completes (16/16), the pair splits (t=40000-153000), both
  doors shut, the bud imports 33-50 blanks through its own door, casts its dockers and makes a whole `aaaa` copy of its
  genome (two in world 2). Command: `for k in 1 2 3 4; do node tri/demos.js split $k 200000 runs/sl$k o > runs/sl$k.log
  & done` (about 3 min per world). Picture (world 3 after the split: its pocket, imported `uuu`, the anchored `AAAA`
  and its copy `aaaa`): `docs/pictures/split_alone.png`. Enables: the full BIG-goal sentence on a prepared pair; next,
  grow the pair instead of preparing it.
- **Heritable cells, reliability** — 4 of 4 worlds (was 2 of 4 on the current engine). The founder's first docker races
  the membrane root for its high end; a root there first commits the founder to wrapping before any copy (docks=0).
  Supply changed from 12 dockers per face type and 8 roots to 24 and 4 (one root per cell): every world makes 4 cells
  (47-48 docks per world). `node tri/demos.js cells 1 100000 runs 36`.
- **Grown import door, reliability** — 4 of 4 worlds within 150000 steps (was 2 of 4). With 3 kit copies per cell,
  leftover kit parts trapped inside the closed ring lay in the door's sweep and jammed the panel half open (50000
  stalls, one import). With 2 per cell the ring closes later (54000-57000; one world about 120000) and imports 14-15
  blanks. `node tri/demos.js live 1 150000 runs 6x2`.

## 2026-10-01 (autorun run 20261001-1806)

- **A bud that lives alone: split, import, cast and a whole genome copy made inside the sealed bud** — partial: 2 of
  4 worlds (prepared pair; `split ... o`). First demo run with the lock-signal deafness rule (a trigger side is deaf
  while it hears the lock signal) and with 3 kit parts per organelle type (was 2). In both successful worlds the pair
  splits (t=53328 and t=119988), both doors shut, the bud imports 42-47 blanks `uuu` through its own door, its grown
  pocket casts `aU.w` dockers (16 casts) and a new `aaaa` copy forms in the bud next to its anchored `AAAA`.
  In the other 2 worlds the bud's pocket stalls at 14-15 of 16 cells with the doorway still open, so nothing splits.
  Before the retune (2 parts per type, same rule) 1 of 4 worlds ran fully (split at 119988, 35 imports, two new
  `aaaa` in D); the other 3 stalled at 14-15/16. The rule change caused no regression: `split 1 30000 runs` (cap,
  split at 9000) and `split 1 60000 runs g` (split at 24000) still work. Command:
  `for k in 1 2 3 4; do node tri/demos.js split $k 200000 runs/sj$k o > runs/sj$k.log & done` (about 2 min per
  world on a 4-core container). Picture (world 4 after the split: pocket, imported `uuu`, anchored `AAAA` and its
  copy `aaaa`): `docs/pictures/split_alone.png` (since replaced by the 4-of-4 run's picture). Status: partial (2 of
  4); fixed in run 20261001-2006 (above).

## 2026-10-01 (fourth session)

- **Bud, feed, split: the parent feeds its bud through a doorway; the bud seals and separates when complete** — works
  (4 of 4 worlds, prepared pair). `structures.budPair`: a parent ring P and a bud ring D (prepared, labelled) share a
  flat contact held by completion-release pairs `&`; a doorway runs through both walls. Each door panel (5 cells,
  welded by hear sides, a built-in trigger between its first two cells, so always triggered) is turned open into its
  own ring (P's 120 degrees, D's 60) and held there by a `&` pair to a doorstop cell welded to the wall; that loop
  locks the hinge. While anything bonded to the pair hears an open signal (a growth front in D), all holds. When
  nothing is open: every `&` lets go, P and D drift apart, and each panel swings shut and closes (close-only pair)
  onto the wall cell beyond its doorway, which locks it shut. No new rule: completion release, built-in trigger,
  hinge lock by a bond loop. Two contents tried:
  (1) `split 1 30000 runs`: a stamp pocket in P casts blanks into one part type `A@-a@`; the parts diffuse into D and
  grow a three-cell cap on D's inner wall (one type fills it: the three slots are turns of each other about a vertex).
  The cap completes and the pair splits at 4700-8700 steps in 4 of 4 worlds (rerun on the fixed physics); both doors
  shut; D leaves with its cap and 3-5 blanks; 2-4 free triangles escape while the doors swing (flood-fill count).
  Picture: `docs/pictures/split_cap.png`.
  (2) Genome (`split 1 60000 runs g`, RP 7, RD 5): P holds a chain `aaaa` and a stamp pocket casting its dockers
  `Ay.z` (fills `Y--` as food, latGlue); copies `AAAA` carry seed `z` on their high end. D's wall has an anchor
  `Z@|` (new mark, below), which emits the open signal until it catches a copy. The parent's wall has an anchor `W|`
  for the founder's seed `w` (copies do not carry `w`). Result: a copy is anchored in D and the pair splits at 22000,
  32000, 34000 and 36000 steps; both doors shut in all four; the founder stays in P in all four (anchored there in 2;
  in the first runs without that anchor the founder drifted into D in 1 of 4); one copy slipped out in 1 world. A
  strand lying in the doorway can jam a closing panel (seen once before the parent anchor: P stayed open).
  Picture: `docs/pictures/split_genome.png` (t=0, feeding, split, the bud with its anchored copy and food).
  (3) Organelle (`split 1 150000 runs o`, RP 8, RD 6): the bud also grows its own stamp pocket from a seed `v@` on its
  wall, from kit parts (16 types, 2 each) that start in the parent as food, and the pocket casts `aq.w`, the dockers
  the bud's copy `AAAA` needs. **Yolk**: its blanks `uuu` and fills `Q--` are food only the bud's pocket uses (the
  parent's pocket takes `xxx`; with shared blanks the parent ate them all and the bud left with none). Result: in 3 of 4
  worlds the pair splits at 70000, 75000 and 140000 steps with the bud's pocket complete and a copy anchored; world 4
  had 6/16 pocket cells at 150000. After the split each bud cast 1-3 dockers from its yolk and started a copy, which
  stalled: about a third of the yolk reaches the bud (by area), too little for a whole copy (4 dockers, 3 fills). The
  founder stayed in the parent in 2 of the 3 (anchored there); in one it drifted into the bud before being anchored.
  Some free triangles escape while the doors swing at the split. Picture: `docs/pictures/split_organelle.png` (the bud
  after the split: its grown pocket, the anchored copy with a stalled copy on it).
  (4) Import door (same command, current version): the bud also has a revolving import door (`importD`: key `U*`
  catches blanks `uuu`, deaf until the split), its dockers are `aU.w` (the blanks are also their fills), and 40 `uuu`
  start outside. The bud's closing pair is interlocked with its import door: its wall side is a latch that emits the
  lock signal while the doorway is open, so the import door holds until the closing door is shut (without it the
  import door opened at the split while the doorway was still open; a ring with two gaps fell into two pieces in 2 of
  4 worlds). Result (4 worlds, 200000 steps): splits at 100000, 113000 and 140000 steps (the fourth had 14/16 pocket
  cells). In world 3 everything ran: both doors shut, the bud then imported 36 blanks, cast 4 dockers and is copying
  its anchored genome (docks with fills placed, slow). In worlds 1 and 4 the bud's closing door jammed at 87 degrees
  on a free copy lying in the doorway at the split (P shut; the bud stayed open). Picture:
  `docs/pictures/split_import.png` (the bud after the split, filled with imported blanks, its pocket and its copying
  genome).
  Not yet: a whole copy made in the bud, fewer jams (fewer free copies in the parent, a smaller door sweep), a grown
  pair.
- **Anchor `|`: a structure catches a strand** — works (in `split g`). A strand cannot otherwise join an existing
  structure: capture needs a free triangle and closures need an exact fit. An unbonded anchor side catches a strand
  end's seed (its spare edge, active while the strand is not being copied, complementary glue) when the end comes
  within capture distance of the site, as it would catch a free triangle: the strand moves as one rigid body into the
  flush place if that place is free (physics; chosen by role, the strand end, not by body size).
- **Physics fix: long bodies** — a body's offsets were taken as the torus minimum image from one member, so a body
  longer than half the world (P+D, 21 units in a 32 world) folded: its far cells were turned about a wrong point and
  drifted apart while their bonds stayed (D's wall opened and things leaked out). Offsets are now unwrapped along
  bonds (`Physics._unwrap`). Test added; earlier demos used bodies shorter than half their world.
- **Stamp casting: the metabolism makes the parts of a membrane** — works (4 of 4 worlds). New rule: marks written
  after an apostrophe on a side are *carried*: they do nothing there, and a cast product takes them with that side's
  instruction glue (`Kb.'@X*` casts `b@` onto the product). So a pocket can cast kit parts, which carry attach marks
  `@` (before, casting stripped every mark, and parts could only come from the supply). `structures.stampInstr(type)`
  gives a lid pocket's instruction tokens for any part type. Demo `stamp`: five prepared lid pockets (labelled
  starting condition) stamp blanks `xxx` into the five motif parts of a ring kit (R=3: `A@-b@`, `-B@c@`, ...); an
  anchor with the ring's root (prepared) grows the ring from cast parts only (no parts in the supply). 60 blanks: all
  cast by ~20000 steps (about 12 of each part, unevenly), the ring closes at 36000, 61000, 64000 and 95000 steps in
  worlds 1-4 (the last two or three parts are slow: they must find the one open site). Heritable too: a stamp pocket
  kit (16 types, carried marks kept by `kit`) grows from a seed and casts `A@-b@` (`grow 1 20000 runs 4s`: complete at
  17000 steps, 4 parts cast by 20000). Limits: one pocket per part type (5 pockets of 16 cells for a 30-cell ring); a
  product carries nothing, so a pocket cannot cast stamp casters (no closed loop of part making yet).
  `node tri/demos.js stamp 1 60000 runs`. Picture: `docs/pictures/stamp_factory.png`. Enables: a cell whose pockets
  make its offspring's membrane (feeding), membranes in worlds whose only food is blanks.

## 2026-10-01 (second session)

- **Cell kit: one seed grows a membrane with a pore and an organelle** — partial (in progress). `structures.cellKit`
  turns a door ring kit plus an organelle (two lid pockets joined, `pocketPair`, casting dockers `AXm` and `aXm`) into
  one kit grown from the chain's seed `m` (R=7: 110 cells, 59 types, 62 of 63 glue pairs; the alphabet gained 13
  Cyrillic pairs). Placement by search: organelle on an inward wall cell, slots and lid space clear of wall, door
  sweep and the chain with its dock sites; the door must also not sweep the chain (it did: the panel stalled against
  the chain beside its hinge, flickering its latch 7686 times). New pieces, all local:
  **pore**: a 6-cell panel with a built-in trigger, held to the wall by a completion-release pair `&`; once the cell
  hears no open signal it lets go and swings out for good (a strand leaves through a 6-cell pore in ~5-20k steps; a
  4-cell pore at a hex corner barely lets it out). **Spent sides**: a `&` side whose triangle hears no open signal is
  spent and binds nothing again (with a latch, the open wall side recruited spare panel cells and a second ring grew
  on the first). **Late organelle**: its wall seed is a trigger side, deaf while the wall grows, so the wall closes
  and the pore opens first, then organelle parts come in through the pore (otherwise the ring closed before the
  organelle in 2 of 3 worlds and the cell was stuck). Also fixed: door searches use the direction the hinge really
  turns. Status (4 worlds, 100 blanks, chain `aaaaa`): the wall completes at ~340-380k steps, the pore opens, then
  the organelle grows inside, slowly (its parts must wander in through the pore): complete in 1 of 4 worlds by
  ~900k, the others 1-2 cells short at 1.5M. In that world the organelle cast dockers, the chain copied inside its
  cell, copies were copied again inside (with the second docker type), and **a copy left through the pore**
  (~1.1M steps; four free copies by 2.6M, some copied again outside by dockers that drifted out). A free copy was
  bound by a membrane root and **began its own cell** (root, wall cell and pore panel), but its long wall front stopped
  after one cell: each unique wall part had 3 copies, one went into the parent and one into a ring that a root started
  on a copy *inside* the parent (roots enter through the pore too). Not yet: a complete offspring cell. Lessons: the
  late organelle is safe but slow (parts must find the pore); roots inside the parent waste parts and trap copies;
  supply of unique parts limits the number of cells. Picture: `docs/pictures/birth.png` (world 3 at 2.6M steps: parent
  cell with organelle and copies, free copies above, the offspring's started wall). Long runs continue with
  `TRI_RESUME`. `node tri/demos.js birth 3 900000 runs` (demo removed 2026-10-02, cleanup run 1821; code in git at `c11ed14`).
- **Heritable factory cycle on rigid physics** — works (third generation in 2 of 3 worlds by 150000 steps). Founder
  `aaaaa` with seed `y`; two pocket kits in the supply: P_y casts blanks into dockers `Az-`, P_z casts `ay-`; fills
  `Z--`/`Y--` (latGlue), blanks 60. The founder grows P_y (complete at 35000-40000) and casts `Az-`; its copies
  `AAAAA` carry seed `z` (a docker's lateral glue left free at the copy's end) and grow P_z, which casts `ay-`; their
  copies `aaaaa` carry `y` again. World 1 by 150000: 59 casts (42 `Az-`, 18 `ay-`), five strands, a third-generation
  `aaaaa` that has regrown P_y; world 2: a third-generation strand without its pocket yet; world 3: second generation
  with pockets. Blanks run out (1 left in world 1). No rule changes were needed since the old engine.
  `node tri/demos.js cycle 1 150000 runs`. Picture: `docs/pictures/heritable_cycle.png` (strands with their pockets).
- **Grown protocell: a chain grows its own cell, feeds it and copies inside** — works (4 of 4 worlds). Chain `aaaaa`
  with seed `z` on its low end and `y` on its high end; in the supply: the door membrane kit (R=7, 78 cells, 4 copies
  per cell), a lid pocket kit (16 types that cast blanks `xxx` into dockers `A--`), blanks and junk; `pLoose` 0.05.
  From `y` the pocket grows (complete at 40000-105000 steps), from `z` the membrane with its import door (closed at
  105000-175000). The open signal orders the work without any counter: while the membrane grows, its signal reaches
  the pocket through the chain, so the pocket's sensor stays idle; the membrane cannot let go until the pocket is
  complete. Once the cell is closed: the door imports blanks (36-42 by 250000), the pocket casts dockers inside (20-24
  casts), and the chain copies inside its own membrane (1-4 copies `AAAAA` per world; the first cast always after
  closure, the first copy 10000-25000 steps later). Two fixes on the way: proofreading (`pLoose`) no longer drops a
  key's cargo (the door's blank fell off mid-swing), and the pocket kit gets a richer supply (if the membrane closes
  before the pocket's last cell arrives, that site is inside and the cell is stuck: 2 of 4 worlds with half the
  pocket supply). Not yet: the copies cannot become cells (their dockers carry no seeds, and kit parts cannot enter).
  `node tri/demos.js grown 3 250000 runs`. Picture: `docs/pictures/grown_protocell.png`.
- **A grown membrane with its own import door** — works (3 of 3 worlds at R=6). The door ring kit
  (`structures.doorRingKit`) grows two fronts from its root, which holds the chain's seed: the periodic motif the long
  way round, and a short unique front (one wall cell, then a four-cell door panel attached by its latch side `~`,
  welded by hear sides `+`, whose last cell carries the key `X*` outside and a close-only hinge side). The motif's last
  cell closes onto that hinge side, so the hinge exists only once the ring is closed (a door that swung while the wall
  was open would carry half the wall). Local rules: only unbonded attach sides `@` (growth fronts) emit the open
  signal (`&` sides do not), relayed through every bond (range 120); a trigger side binds nothing (catch or closure)
  while its triangle hears the open signal, so a sensor is live once its structure is complete. So the key stays idle
  until the wall has closed, and the ring lets go of the chain while its key is free. Then a blank binds the
  key, the latch lets go, the panel swings 120 degrees inward, drops the blank and swings back; junk is not caught.
  Chain `aaaaa` (seed `z`), 3 kit copies per cell in a 26x26 world: membranes closed at 28000, 36000 and 44000 steps,
  chain inside, 13-15 blanks imported by 88000 (2 junk slipped in while the door was open). A geometry bug found on the
  way: the "faces outward" test used Euclidean distance, which misjudges sides near hex corners for R >= 6 (the last
  site faced inward and could only be closed by triangles trapped inside); now hex radius everywhere.
  `node tri/demos.js live 1 90000 runs 6x3`. Picture: `docs/pictures/grown_door.png`. Enables a cell that feeds itself:
  the genome grows its membrane and the door that brings in its food.
- **Locality audit (user: "a triangle shouldn't know it is part of a larger structure")** — done. All chemistry rules
  reviewed; three non-local rules removed: closures that asked whether two triangles are in the same body (now one flush
  tolerance, 0.05, for every closure), snapping the smaller of two bonding bodies (removed), copy release reading two
  bonds away (the partner now exposes whether a fill is beside it, computed after bonding). Physics exceptions labelled
  (rigid bodies, flap locked by a loop, binding into free sites). Recorded in AGENTS.md (Locality, with the mistakes),
  RULES.md (Locality audit) and NEXT.md. Re-checked: copying 30-32 docks per 10k steps, factory 4 + 3 copies, conveyor,
  lid, import, grow, bud unchanged.
- **Heritable cells: copies wrap themselves** — works (3 of 3 worlds). Genome `aaaa` with seed `z` on its high end
  (there a smaller membrane fits: R=4, 42 cells, 7 motif types); dockers `Ay.z`/`ay.z` carry `z` on their next side, so
  a copy's high end exposes it again; fills `Y--` (latGlue). In each world the founder made a copy, then founder and copy
  each grew their own membrane and were released inside it: two cells, each with its genome (by 40000-60000 steps).
  Local rules added on the way: a strand end's seed is exposed only while the strand is not being copied, and a high end
  held by a completion-release side starts no copy (commitment: a wrapping genome stops copying, so copy and membrane
  do not jam each other); a kit's growth sites (`@` on an attached triangle) take parts only (a free docker had bound a
  membrane front and seeded a second membrane inside it); the dockers' prev side is close-only (a loose fill had stuck to a copy's end in the membrane's way).
  `node tri/demos.js cells 1 100000 runs 36`. Picture: `docs/pictures/heritable_cells.png`.
- **Encapsulation: a chain grows its own membrane** — works (2 of 2 worlds). The chain's low end exposes seed `z`; a
  periodic ring kit (R=6, 66 cells, 11 motif types) whose root binds the seed by its inner side grows the membrane
  around the chain; the root is chosen so the last two sites face outward (a corner pair), so the ring can close from
  outside; the root's seed side releases on completion (`&`), leaving the chain free inside. The ring size was found by
  a placement check (R=4 and 5 touch the chain or its dock sites). 12 copies per kit type in a 26x26 world: membranes
  complete and released at about 45000 and 65000 steps, chain inside in both. `node tri/demos.js wrap 2 100000 runs`.
  Picture: `docs/pictures/encapsulation.png`. Enables heritable cells: copies carry the seed and can wrap themselves.
- **Budding: a daughter ring grows on the parent and lets go when complete** — works (5 of 5 worlds released a
  complete daughter; 2 released two). New local rule, the open signal: an attached part with an unbonded glued side
  (an open growth front) emits a signal relayed one bond per pass and fading by 1 per bond; a side marked `&` lets go
  once its triangle hears none, i.e. once the part it grew into is complete. The daughter's root carries its seed
  side with `&`: when the ring closes, the last open sides vanish, the signal fades and the daughter detaches; the
  parent's seed is free for the next daughter. Geometry found by search: the seed sits at the tip of a three-cell
  stalk on the parent, so the daughter's closing gap (always next to its root, with one front) is 2.5 away from the
  parent (with the seed on the wall, the last sites faced a crevice and never filled). Two growth fronts were tried
  and dropped: they meet at a random cell, and an inward-facing last cell can only be filled from the closed inside.
  Parent R=3 ring, daughter kit (5 motif types x 14, 6 roots) in a 20x20 world, 50000 steps: first daughter released
  at about 15-30k steps. Test: a complete prepared daughter lets go, an incomplete one holds.
  `node tri/demos.js bud 3 50000 runs`. Picture: `docs/pictures/budding.png`. Enables division: the same signal can
  release a bud that carries a genome copy and a factory.
- **Protocell: import, metabolism and copying inside a membrane** — works (2 of 2 worlds). Combines the import ring
  (R=7), and inside (labelled start, layout found by a search that keeps slots, dock sites and the door's sweep free) the
  chain `aaaaa` and two lid pockets that cast blanks into its dockers `A--` and `a--`; outside 50 blanks and 30 junk
  triangles, no dockers anywhere. 40000 steps: in both worlds the pockets cast 15 dockers inside, the chain made a full
  copy `AAAAA` inside, junk inside 0, products outside 0-1. Control without pockets: blanks accumulate inside (16), no
  casts, no copies. Bottleneck: import (one door; about one catch per 6000 steps; some blanks drift in while it is
  open). `node tri/demos.js cell 2 40000 runs` (`none` = control). Picture: `docs/pictures/protocell.png`.
- **Selective import: a revolving door** — works (2 of 2 worlds). A one-row ring whose door is a 4-cell panel (welded
  with hear sides) hinged at an inner corner, with a catch side (X) on an outer face: a caught blank triggers it, the
  latch hears the trigger through the panel (new: a latch lets go while its triangle hears a trigger), the panel swings
  120 degrees inward carrying the blank, drops it inside, swings back and re-latches. The design was found by sweeping
  panel and carried blank (rigid parts). 12 blanks and 24 junk triangles outside, 20000 steps: 11 and 12 blanks
  inside, junk inside 0 in both worlds (a few blanks slipped out while the door was open and were carried in again).
  The membrane now feeds its inside selectively: the transport step of a metabolism. `node tri/demos.js import 1
  20000 runs`. Picture: `docs/pictures/import.png`.
- **Physics speed (second round)** — a move short enough that it cannot pass through a one-row wall (under 1.0; passing
  needs 1.44) is taken after a single check; one bisection; inlined neighbour loops. A 357-triangle world: 4.2 -> 2.0
  ms per step; binding faster (737 vs 177 catches in the benchmark).
- **Rigid-part physics (user: "let connected parts move as one"; "no deformation and squeezing is fine")** — works.
  `tri/physics.js` rewritten: a body (blocks joined by bonds) is one rigid piece; each step every body tries a
  Brownian translation and turn and moves in sub-steps until contact (move or stop): no overlap, no deformation, no
  tunnelling, no constraint passes. Hinged flaps turn by the same checked move and stall when blocked. Binding:
  a free triangle within 0.6 of a free site beside a complementary side is placed in it (capture; it cannot bind
  into an occupied site); closures inside one body only when flush, between bodies the smaller is placed flush.
  Speed: copy world 1.9 -> 0.5 ms per step, a 357-triangle cycle world 7.6 -> 1.5 ms (about 5x). Re-run on it:
  copying 26 docks in 10k steps (2 copies and copies of copies; was 4-14); lid pocket 6-8 casts per 4000 steps;
  factory 4 new `aaaaa` + 3 `AAAAA` in 30k steps (best so far); energy (lid pocket with fuel) 13 casts paid by 13
  carriers (was 2 casts); ring membrane closed in 2 of 2 worlds at 12939 and 8463 steps (was 40k); gated ring
  (rebuilt) opens and tracers cross (28 crossings in 10k steps); conveyor 4-5 hand-offs and 14-20 drops per 3000;
  grown pocket complete in 2 of 3 worlds by 13.6k steps; heritable pocket: founder, copy and copies of copies grow
  pockets. Fixes the rigid world needed: hand-off flaps no longer re-close on their cargo; flaps catch only at
  rest; in kits only caster B catches (a target in the slot before B arrived closed B's cell off); `pLoose` frees a
  triangle held on one side only. Not yet on rigid physics: the old hatch pocket (its carried target bulges into a
  caster; superseded by the lid pocket) and the airlock (its door panels collide with the wall; rebuild with swept
  doors like the gate).
- **Gated ring rebuilt (swept door)** — works. A hinged panel in a closed wall collides with its latch neighbour
  unless its latch edge moves away during the swing; a search over ring doors found clear 120-degree doors: panels of
  three cells (two at a corner) hinged at an outer vertex, swinging out. `structures.ring` now picks such a door by
  sweeping it, welds the panel with hear sides (the key's signal reaches the hinge two cells away) and puts the key
  trigger next to the latch. `node tri/demos.js gate 1 10000 runs 12`.
- **Heritable factory cycle (progress, old engine)** — partial (works on rigid physics, see above). Two kits (pocket P_y casts `Az-`, pocket P_z casts
  `ay-`), founder `aaaaa` with seed y. By 48000 steps in world 2: the founder grew P_y and cast 50 `Az-`; its copies
  `AAAAA` grew P_z (one complete) which began casting `ay-` (2). Not yet: a third generation. Re-running on rigid
  physics.
- **Aligned bonds (user: "edges don't seem to align, which leads to deformation")** — works. Diagnosis: a free
  triangle bound as soon as its corners were within 0.45 of flush, so cells joined tilted; in a grown strip, cells two
  apart then overlapped, their contact forces pushed against the pins, and the strip jammed bent (flush gaps up to
  0.28-0.40, bonded neighbours overlapping by 0.1; a prepared strip stays at 0.000). Fix (rule): binding pulls the
  free triangle in, placing it exactly flush against its partner's side. Grown rings and pockets now: worst gap
  0.008-0.03.
- **Kit safety: no enclosed cells** — works. The grown pocket stalled at 15/16 (and the cycle worlds too): caster B's
  cell lies between its k cell, the frame below and the slot; in 2D the frame must close around it, so once anything
  sits in the slot B can only squeeze in through it. `kit()` now scores each tree: a cell is risky if, when it
  arrives, all its sides may already face cells no deeper than it (not its descendants) or a slot; the generator picks
  a risk-free root (next to B, so B arrives before the frame closes around it). With binding probability 1
  (`pBond`, was 0.5; binding was limited by flush encounters anyway): grown pocket complete at 6400 steps in 2 of 2
  worlds (was 10-11k, and stalls), 11-13 casts by 16000.
- **Rigid clusters (cluster shape matching)** — works. Even with flush bonds, a grown one-row C curled: each joint's
  tiny angle error bent the same way, and over 28 joints the front overlapped the root region (a prepared 28-cell C
  among free triangles: far end up to 2.15 off its design position). The local pin solver cannot keep long strips
  true. Now blocks joined by full bonds form a cluster whose exact lattice shape follows from the bonds; once per step
  each cluster is pulled onto the best-fit rigid placement of that shape (hinged parts stay free). Far end now within
  0.36. Running it more often than once per step made frames effectively infinitely heavy, and hinged flaps got kicked
  by their frame (conveyor: no hand-offs), so once per step it is.
- **Ring membrane from a periodic kit** — works (closed in 1 world at 40202 steps; others still growing). A one-row hexagonal ring
  of side R is six repeats of a (2R-1)-cell motif; motif types attach in a cycle of unique glues (no counting), the
  root carries the seed on its outer side and closes the ring by a close-only glue. R=3: 30 cells from 5 motif types +
  root. 30000 steps, 12 copies per type: 28/30 cells in 2 of 2 worlds, a clean hexagon with every bond flush (worst gap
  0.03); before the alignment fix the open C crumpled into a spiral. `node tri/demos.js ring 1 60000 runs 3`. Picture: `docs/pictures/grown_ring.png`.
- **Heritable pocket: a chain grows its machine, copies regrow it** — works (2 of 2 worlds). The founder `aaaaa` exposes
  seed `z` on its low end; dockers `Az-`/`az-` carry `z` on their prev side, so every copy's low end exposes the seed
  again (the template's high end becomes the copy's low end). A placement check (`world.partPlacement`) picks the kit
  root and seed side so the grown pocket meets neither the chain, its dock sites nor the cells beside them. Fills must
  be `Z--` (`latGlue`): a docker used as a fill exposed `z` on a hidden back and grew extra pockets mid-chain. 30000
  steps, kit x12: world 1: the founder, its copy `AAAAA` (complete 16-cell pocket, casting) and the copy of the copy
  each grew a pocket at their low end; world 2: founder and copy (copy's pocket complete). The products here (`-A-`)
  lack the seed, so copies built from them would not inherit (fixed in the cycle demo). `node tri/demos.js heir 1
  30000 runs`. Picture: `docs/pictures/heritable_pocket.png`.
- **Greek glue letters** — 24 more glue pairs (α..ω / Α..Ω) so two kits can use disjoint alphabets.
- **Grown pocket (kit generator)** — works (3 of 3 worlds). `structures.kit(tris, root, reserved, seed)` turns a
  prepared structure into kit types that grow it from one root cell: a breadth-first spanning tree (root chosen for the
  shallowest tree), one unique glue pair per tree edge, casters attached by their activator edge (unique glue plus the
  new activator mark `%`), all other shared edges close-only closures. Three problems found and fixed on the way:
  (1) a free caster stuck to a caught target by its recognition side, so the new attach mark `@` makes a free part
  bind only by its attach side (and never dock or fill); (2) a hinge bound at the 0.45 tolerance kept a crooked rest
  angle, so hinge rest angles snap to the lattice; (3) a caster that arrives after the slot caught a target finds its
  cell enclosed (in 2D the frame must close around it), so caught triangles held on only one or two sides now let go
  (option `pLoose`, the user's cooperative-binding idea; a fully recognized target casts at once). Lid pocket for the
  factory part (`-A-`, recognition X), 16 kit types x 12 in a 16x16 world with an anchor + root (labelled start): the
  pocket completed at 11200, 10400, 11200 steps and cast 5, 8, 7 times by 16000. `node tri/demos.js grow 2 16000 runs
  12`. Picture: `docs/pictures/grown_pocket.png`. Enables heritable machines (grow from a strand-end seed next).
- **Factory on lid pockets** — works (2 of 2 worlds). Same factory world (chain `aaaaa`, blanks `xxx`, no dockers),
  two lid pockets casting `A--` and `a--`, 30000 steps: world 1 made 3 new `aaaaa` and 2 `AAAAA` (58 casts), world 2 3
  and 3 (60 casts), all 60 blanks used; control without pockets: nothing. Before (hatch pockets): one generation
  cycle in 1 of 2 worlds in 40000 steps. `node tri/demos.js factory 1 30000 runs Aa`.
- **Lid pocket (bulge-free casting pocket)** — works (3 worlds). Diagnosis of the old hatch pocket's stall: a triangle
  turning 60 degrees about a corner sweeps its far corner along an arc that bulges 0.134 past the chord, straight
  into the fixed caster across the target's far edge, so the carried target jams (seed 1: one catch, then nothing for
  4000 steps). New design: the target slides into an open V notch between two fixed casters (B, R); R's recognition
  side is a trigger, its signal is heard through one frame cell (Q) by a lid hinged to Q (new marks: hear side `+`,
  wide hinge `=` 120 degrees); the lid turns about a corner of the slot, so its leading edge arrives flush and nothing
  bulges into the target; cast; the trigger lets go and the lid reopens. 4000 steps, 16 targets: 5, 5 and 9 casts
  (seeds 1-3) against 0-2 for the hatch pocket. Test: deterministic catch-close-cast-reopen. Enables faster factories;
  the heard trigger wires any sensor side to a flap a few bonds away (signals for budding and division later).
  `node tri/demos.js lid 1 4000 runs`. Picture: `docs/pictures/lid_pocket.png`.
- **Copy deadlock fixed: zip copying** — works (copies complete in 4 of 4 worlds that deadlocked or stalled before).
  Diagnosis: two partial copies on one template leave an empty dock site enclosed on all three sides (template face,
  the lower copy's last fill, the upper copy's dock); no free triangle can reach it since the no-tunnelling fix, so
  the busy relay stays high for ever. Fix (rule): a face docks only while it hears zip from the strand's high end
  (relayed through docked faces and backs), so copies grow one face after another and every dock site is an open
  notch. Sequential docking is slower, so the binding tolerance went from 0.3 to 0.45 (also 2-3x faster conveyor
  hand-offs). copy world (abaabb), 10k steps: zip + 0.45 gave complete copies `BBAABA` in seeds 1-4 (seed 1 also a
  copy of the copy); without zip, seed 3 deadlocked (`BBA*` + `BA*`).
- **Speed** — physics 2.6x faster (cell-grid broad phase, radii cached per pass, allocation-free triangle SAT; same
  results bit for bit): copy world 8.6 -> 3.3 ms per step.

## 2026-10-01

- **Clean engine (`tri/`)** — works. The typed-triangle world was ported out of the old research stack (core letter
  chemistry, half-cells, seeded engine; about 3,500 lines) into `tri/physics.js` + `tri/sim.js` (about 400 lines).
  Same rules and parameters; growth programs, marks, pieces, hands, blades and the damage field were dropped.
  Checks on the new engine: tests pass (`node tri/test.js`); energy demo gives the same numbers (2 casts, 3
  carriers spent, 15 recharges in 10k steps); pocket casts at a similar low rate (5 casts in 3 x 8k steps against
  1-3 per 4k before); conveyor 8 hand-offs in 3k steps (2-4 before); about 3 ms per step.
- **Energy** — works (light on/off, one world each). Charge state; discharged triangles bind nothing (user); a
  hinge with a fuel side spends one charged carrier per swing; carriers recharge in a light zone (environment
  drive). Pocket with fuel, carriers starting discharged, 10k steps: light off: the hatch caught a target and waited
  unfuelled (9692 steps), no casts; light on: 15 recharges, 3 swings, 2 casts.
  `node tri/demos.js energy 1 10000 runs [dark]`. Picture: `docs/pictures/energy.png`.
- **Factory: pockets cast a replicator's parts** — works (closed cycle in 1 of 2 worlds). Chain `aaaaa`; the world
  starts with blanks `xxx` and no dockers. Pockets cast blanks into the dockers `A--`/`a--`. One pocket kind (A--),
  two pockets, 20k steps: 26 casts, a complete copy `AAAAA` by t=10000; control without pockets: nothing. Both kinds
  (Aa), 40k steps: world 2 made `AAAAA`, then the copy of the copy `aaaaa`, then a second `AAAAA` (two generations, 46
  casts); world 1 stalled at a partial copy. `node tri/demos.js factory SEED 40000 runs Aa` (`none` = control).
  Pictures: `docs/pictures/factory.png`, `docs/pictures/factory_cycle.png`.
- **Typed arms** — partial. An arm is a series of distinct types grown from a seed glue on a strand end; each type
  attaches by the complement of its parent's exposed glue and exposes the next glue on side 1 or 2 (the bend); a
  type exposing nothing ends it. Dockers carry the seeds on their side edges, so copies show them again. The shell
  pattern 222112 (mirrored at the far end), 12 of each type in supply: both founder ends grew their planned
  7-triangle arm in 20k steps; copy fragments grew arms too; copying was slow (5 docks).
  `node tri/demos.js arms 1 20000 runs 222112` (demo removed 2026-10-02, cleanup run 1821; code in git at `c11ed14`). Picture: `docs/pictures/typed_arms.png`.
- **Airlock with interlock (user: a double lock)** — partial. One-row ring with a lock: inner door, two-cell
  chamber, outer door; pulse doors (a key opens, is let go, the door swings and re-latches); a lock signal from an
  unlatched door makes the other door ignore its key. Without the interlock both doors opened together and the ring
  tore; with it, in 30k steps the doors never stood open together and the ring kept its shape. Not yet: no key got
  through (it is pushed away by the opening door; a lock is not a pump).
  `node tri/demos.js airlock 1 30000 runs 24` (demo removed 2026-10-02, cleanup run 1821; code in git at `c11ed14`). Picture: `docs/pictures/airlock.png`.
- **No tunnelling (user: jumping single walls is a bug)** — works. Kicks reached 1.8 against a 0.87 wall; a body
  whose centre path enters a block of another structure is moved 1/2, 1/4 of the way or not at all. One-row ring:
  141 crossings in 3k steps before, 0 in 6k after; two-row ring 0 in 8k. Costs: copying and catching slower
  (triangles no longer jump into nooks through structures). Picture: `docs/pictures/sealed_ring.png`.

## 2026-09-30

- **Gated ring membrane** — works (mechanism; the open ring bends). Closed ring; door = two-triangle panel latched
  into the wall, hinged at its outer corner; a key on its outer face unlatches it and it swings 120 degrees out.
  With keys: door opened, tracers crossed; without: none. Once open the ring is a C that bends wide (any doorway
  turns a 2D ring into a C), which led to the airlock. `node tri/demos.js gate 1 10000 runs 12r2`.
  Picture: `docs/pictures/gate.png`.
- **Conveyor (hand-off between hatches)** — works. Hatch 1 catches a block and swings it to hatch 2; once the block
  is bonded twice hatch 1 lets go (hand-off `^`); hatch 2 swings on and drops it (`!`). Lessons: a flap needs free
  space beside the side it swings toward (13% bulge); a loaded flap drives at half rate so a returning one wins.
  `node tri/demos.js conveyor 1 3000 runs`. Picture: `docs/pictures/conveyor.png`.
- **Driven hinges, triggers, latches, close-only sides** — works. Hinges open and close by a trigger (user: not
  floppy), carry what is bonded to the flap; pulse doors; latches; interlock. Rules in docs/RULES.md.
- **Hatch casting pocket** — works. Two fixed casters with close-only recognition sides and a hinged hatch: the hatch
  waits open, catches a target, swings it into the centre, the cast happens, the hatch reopens; 20 casts in 3 x 4k
  steps before the tunnelling fix, all through the hatch. Weakness: the carried target presses on a caster during
  the swing, which then completes only with lucky jostling. `node tri/demos.js pocket 1 4000 runs` (demo removed 2026-10-02, cleanup run 1821; code in git at `c11ed14`).
  Picture: `docs/pictures/hatch_cycle.png`.
- **Casting** — works. A triangle glue-bonded on all three sides to activated casters takes their instruction glues
  and lets go: a permanent, in-simulation type change, general (any type) and rare by chance (needs a frame).
- **Typed triangles; copying reads glue** — works. Types are three side glues in complementary pairs; one binding
  rule; docking needs the complementary face glue. Template `abaabb` -> `BBAABA` (reverse complement) -> `abaabb`.
  `node tri/demos.js copy 1 10000 runs`. Picture: `docs/pictures/typed_copy.png`.
- **Triangle-only chains (foundation)** — works. One block shape; letters T/R/Z by hidden backs (gap 0/1/2); exact
  moulded copying verified geometrically (turns within 4 degrees, corner gaps under 0.05); bent chains copy; fills
  2 - gap; refractory faces stop re-docking under a copy that is still peeling off. Pictures:
  `docs/pictures/letters.png`, `docs/pictures/copy_frames.png`, `docs/pictures/copy_verify.png`; the lattice arm
  planner's shell: `docs/pictures/arm_planner_shell.png`.
