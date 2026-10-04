# Next instance: start here

State on 2026-10-04 (after autorun run 20261004-0820, core-review). Read AGENTS.md first (rules of work), then this
file. History of earlier runs: docs/INNOVATIONS.md (newest first), RULES (Core changes), the autorun log and git (older
handoffs: NEXT.md in git, e.g. at `882b7d4` for run 0751's, `8123a2d` for run 0621's).

**Handoff status (autorun run 20261004-0820, core-review).** Priority 1 below is done; the next run (index 36) is a
`build`: priority 2. Done: (1) `heldCopy` is the rule (zip from a held high end only; the core has no option left);
(2) run 0050's narrowing removed (candidate (i): a free triangle's anchor side now binds as its glue does; 35 of 35
check worlds byte for byte the same without it); (3) 12 checks and the `budpore` demo retired, `copy`, `imprint g` and
the `imprint p` cells moved onto held founders (`createWorld` founder option `hold`); suite 23 checks / 2849 s -> 11
checks / 1349 s, all pass; the 20 worlds of the unaffected checks and the old `imprint-held` (now `imprint-pore`) byte
for byte the same (RULES, Core changes; INNOVATIONS, run 0820). An independent review (deep-reviewer) confirmed the
rule's locality and that only an anchor's catch holds a spare edge; its findings were fixed (hold cells copied by
blanks, unchecked hold placement, wording on lost holds). No longer checked anywhere: a bud copying its caught strand
after the split (was `budpore-held`/`-kind`): priority 2 brings it back on `budcycle`. Nothing is running. Branch
`claude/autorun-20261004-0820`, merged by PR. Worktrees `/home/user/pw-base`, `/home/user/pw-i` were scratch (container
only).

### Direction (autorun run 20261004-0751, review-intent): where the work stands and what comes first
Eleven runs since the last direction check (run 1321): five `build` (1420, 1650, 1921, 2221, 0251), three `explore`
(1720, 0022, 0621), one `core-review` (2121), one `harden` (1520), one `cleanup` (1351). **Findings.**
1. **The last check's priorities were all taken and paid off.** The bud grows from a part pool (1420); the kind's
   opening was dissolved rather than solved (`heldCopy` makes leaks sterile, 1720; the bud off the corner needs no
   doorway, 0621); one and two generations from the kit (2221) and without the pool harness in 3 of 4 (0621).
   Capabilities are being combined, not piling up: `budcycle` joins pool growth, anchors, `heldCopy`, completion
   release and contact copying in one world. The path to the organism is one demo.
2. **The core shrank while capabilities grew**: 16 marks to 5 (casting lineage removed, 2121), two narrowings (0022,
   2121), one option (`heldCopy`). The option is now a fork: the lineage runs on it, six older checks run without it.
   It should become the rule (candidate (e) below), and the checks that test layouts the lineage has left should retire
   with it rather than be re-tuned.
3. **The lineage burns down two prepared stocks; neither is renewed** (new census, this run; INNOVATIONS, run 0751).
   In the `budcycle-free` setup (seeds 1, 3): the food stock (180 pre-food plus 20 blanks) is nearly gone when the first bud splits (t = 189061,
   270457: 0-7 free blanks, none soon after; 179-180 of 180 pre-food fed), so the bud copies its strand 0 and 1 times: **the
   answer to last run's question (b) is food, not access.** The part pool (8 per type, 46 types, 368 parts) falls from
   mean 8 to 4.2 (seed 1, two types empty) and 6.6 (seed 3, fewest 3): 114-148 kit copies against about 190-290 parts
   used. The copies come almost all while the first bud grows and food is still there (seed 1: 91 copies by t = 150000,
   when its 47 parts were in place: about 2 per part used); later buds grow on stock with no food left to copy them. The per-type
   spread widens from the start (8-8 to 5-21 within one bud): copies go to the cells whose fronts wait longest, not to
   the types that run short. So the "two generations without the harness" is a burn-down: the lineage ends when
   either stock ends, and seed 1's nine later buds empty the pool. This is the gap between the demo and the goal.
4. **The goal's second half is not met yet: "feeds it until it can live on its own".** Today the parent gives the bud
   a seed site and a strand (a leaked copy); the bud's food and parts come from the shared stocks, and it lets go as
   soon as it is complete and has caught, whether or not it can copy. "Lives on its own" has a local measure: the bud
   makes copies of its own strand after the split, and its own bud catches one of them. No run has shown that yet
   (0-2 copies, finding 3). The release condition is where "until it can live on its own" maps to rules (a hold that
   lasts until the caught strand has been copied once would read the anchor's strand's busy relay: a core change,
   explore only, and worth it only if a fed bud still fails to copy after letting go).
5. **Prepared structure still doing work that should be grown or supplied.** The first parent with its held founder
   (a labelled start: fine). The part pool: renewable in principle (each growing bud makes about 2 copies per part
   used while food lasts) but not shown, and with no per-type regulation (1420; widening spread, finding 3). The food
   stock: an environment drive is allowed, but a stock is not a metabolism; with conservation an indefinite lineage
   needs a material loop, food arriving for ever, which in a closed world means material returning to food (a labelled
   drive: waste triangles and abandoned bodies decay to blanks, as `BCWK`/`BCW` do for parts and monomers) or an open
   boundary. The 32 x 32 world also fills: seed 1 ended with 9 later buds.
6. **Diagnostic options piled up again, now in `budcycle`** (17 `BC*` variables: oracles `BCA`, `BCG`, drives `BCW`,
   `BCWK`, `BCF`, `BCFP`, the harness `BCHOLD`, layout `BCK`, `BCSEED`, ...) beside `budpore`'s 18 `BUD*`. And **checks
   of layouts the lineage has left cost most of the suite**: estimated worker time (`secs` x seeds in `tri/check.js`,
   18379 s in all): the doorway pairs `budpore`, `budpore-held`, `budpore-kind`, `budpore-c` 4200 s (23%), the sealed
   pair's last cell `budpool-e` 880 s, the harness cycles `budcycle` and `budcycle-2` 7200 s (39%). Each guarded a
   real step, recorded in INNOVATIONS; the lineage now uses the corner bud, closed walls and no harness.
7. **Other paths, weighed.** *Fewer part types* (a periodic ring: 7 motif types plus about 10 unique cells, run 1321)
   would make per-type drift and pool cost smaller; wait for the pool balance under a steady supply (priority 2), then
   decide. *Fission and insertion growth*: not needed now that leaks are sterile. *A genome whose exposure matches its
   use* (candidate (j)) saves food but changes no limit before the food loop exists. No change to the goal is
   proposed: budding off the corner with a caught strand is the goal sentence's "builds its offspring and splits it
   off"; "feeds it until it can live on its own" is priority 2's measure.
8. **Speed matters again for the lineage.** A `budcycle-free` world takes 10-20 minutes for two generations; three
   generations need about a million steps. One `harden` per twelve runs stays, aimed at `budcycle` worlds.

**Priorities (in order; each a slice).**
1. **Done (run 0820, core-review): `heldCopy` as the rule, and retire the checks of layouts the lineage left.**
   Candidate (e) below: make `heldCopy` the rule (RULES gate), then for each check that runs without it decide
   adapt (anchor on a high end) or retire. Proposed to retire, with their INNOVATIONS entries kept and ROADMAP rows
   marked "retired (git `<commit>`)": `budpore` and `budpore-c` (doorway pairs, superseded by the corner bud),
   `budpore-held` and `budpore-kind` (unless one tests a step `budcycle-free` does not: transfer through a doorway is
   no longer used), `budpool-e` (the sealed pair's last cell: the corner bud's last site opens to the outside),
   `budcycle-2` (the harness; `budcycle-free` is the two-generation check). Keep `budpool` (growth in isolation) and a
   short one-generation `budcycle`. Also weigh candidate (i) (run 0050's narrowing, likely redundant) by a byte-for-byte
   comparison. Target: the same capabilities on the kept checks, a smaller core, the suite about half as long.
2. **`build`: a lineage that does not burn down.** (a) Make the corner the kind's default (`seedAt=45`, closed walls
   `-|`, no harness in `budcycle`; keep `BCSEED=46` as the doorway comparison only if a check needs it); prune
   `budcycle`'s one-off options (oracles `BCA`, `BCG`; results stay in INNOVATIONS). (b) A steady food loop: food
   arriving for the whole run, not one stock (labelled drive; first try the existing pieces: a slow pre-food inflow
   from material returning, `BCWK`-style decay of free kit parts and free monomers outside any body back to blanks, a
   larger world). Measure per generation: the bud's own copies after the split, kit copies made against parts used,
   the pool's fewest/mean/most per type, food fed. Target: **three generations without the harness in 3 of 4 worlds,
   with each bud copying its own strand at least once after the split**. If the pool's mean holds but types empty
   (drift), the next slice is fewer types or a front that copies what runs short; if the bud still does not copy with
   food present, look at its geometry (founder's backs facing open space, pore direction) before any release-rule
   change.
3. **`harden` (index 37): speed of `budcycle` worlds** (profile a `budcycle-free` world; the suite's long checks are
   all `budcycle`); and the margins left from run 1520 (`imprint` seed 6) if time remains.
4. **`explore`: the release condition as "until it can live on its own"** (finding 4), only if priority 2 shows fed
   buds that still fail to copy after letting go; otherwise candidate (j) (monomer mix) or fewer part types if the
   pool drifts.
5. **Later: N generations as the organism's own check** (a lineage that runs until stopped in a steady world, the
   goal's check), then the backlog (scanner gate, membrane growth).

**Rotation (autorun `projects/plywood/rotation.txt`):** lines 5 and 11 swapped (core-review and cleanup), so the next
run (index 35) is the `core-review` of priority 1 and the `cleanup` comes at index 41, after the build has made the
corner the default (it then prunes what the build left). The mix (5 build, 3 explore, 1 each of the rest) still fits:
the open work is building (priority 2) with design questions behind it.

**Core-change candidates (for the next `core-review` or `explore`).** (e) and (i) done in run 0820. (f) *The seed
site `y`* (plain glue, never spent) is copied by every blank that reaches it while no bud sits on it; keep. (j)
*Monomer mix:* a copy uses 2 : 2 : 3 of a mix now made about 1 : 1 : 1, and a strand's middle faces are copied far less
than its ends (IDEAS, run 0022); no design yet. (k) *No copy blank binds an `&` side*: not needed, closed wall sides
`-|` do it in the kit. (l) *A triangle with both a copy side `?` and a glued anchor side* (review, run 0820): once it
has copy-bound in a pass it counts as attached, so its anchor side could catch a strand end in the same pass, after
which it is no longer bonded by its copy side alone and never copies or lets go. No such type exists (blanks are
`-?-?-?`, and a copy takes its template's type, which never carries `?`); a rule "a triangle with a copy side catches
nothing" would close it if one ever appears. Nothing else in the core is unused (Core inventory).

### Open follow-ups (not priorities; take when a run's kind fits)
- **Core review:** same-pass partner reads (zip, gap, release, fn) are allowed by convention (RULES, Locality audit);
  change only if a locality problem traces back to them. Coverage hook: `COV_OUT=$PWD/runs/cov.jsonl NODE_OPTIONS="-r
  ./tri/coverage.js" node tri/check.js` (one JSON line per demo world: marks present, rule events). To show a change
  leaves outputs the same: `CHECK_SAVE=$PWD/runs/a node tri/check.js` before and after (another worktree), then
  `diff -r runs/a runs/b`.
- **Bigger cells and letter reuse** (user, 2026-10-03; IDEAS): R 5 is the largest all-unique kind (46 letters); if
  a slice needs a larger cell, reuse letters inside sealed compartments.

## Commands
```
node tri/test.js                                   # fast checks (~5 s)
node tri/check.js [id ...] > runs/check.txt         # capability checks: one PASS/FAIL line each, printed as each finishes (~23 minutes, 4 processes; CHECK_SAVE=dir keeps each world's output)
POOLB=20 POOLISO=1 node tri/demos.js pool 1 100000 runs 4   # a waiting front among 20 blanks and 4 next parts: copies per bound part vs B/n
                                                   # (seconds; without POOLISO three more copyable sides beside it)
node tri/demos.js budpool 1 250000 runs             # the kind's bud grown from a pool of its 47 part types (extra: parts per type, 8;
                                                   # BPE: E parts, 40; BPB: blanks, 8; BPS: world size, 30; BPR: openRange, 1; BPHOLD=0: no harness)
BPES=1 BPE=0 BPB=16 node tri/demos.js budpool 1 250000 runs   # the same with E's pore side plain and no E part: the last cell from the source (check budpool-e retired, run 0820)
node tri/demos.js budcycle 1 300000 runs           # one generation from the kit: the parent copies its held founder, grows its bud from the
                                                   # pool, the bud catches a real copy, splits, completes (check budcycle; extra: parts per type, 8;
                                                   # BCB blanks 200, BCI inside 20, BCS world 32, BCR openRange 9, BCE E parts 0, BCAFTER 50000,
                                                   # BCHOLD=0 no harness, BCW waste-to-blank drive 0)
BCAFTER=300000 node tri/demos.js budcycle 1 600000 runs   # the same run on: both seed sites start new buds ('later buds:' line)
BCK=1 BCB=20 BCF=180 BCFP=0.001 BCHOLD=0 BCAFTER=300000 BCSTOP2=1 node tri/demos.js budcycle 3 600000 runs/x   # no harness: closed walls and a
                                                   # food supply (gen2 2 of 4; BCWK=q kit parts decay, BCA=1 oracle; BCDBG=1: pool and kit-copy census)
BCSEED=45 BCK=1 BCB=20 BCF=180 BCFP=0.001 BCHOLD=0 BCAFTER=300000 BCSTOP2=1 node tri/demos.js budcycle 1 600000 runs/x   # the bud off the
                                                   # parent's corner (seed site on cell 45): no sealed pair; gen2 3 of 4 (check budcycle-free)
BCDBG=1 node tri/demos.js budcycle 3 300000 runs   # with the genome monomer census: copies by source, by type, monomers bound (run 0022)
BCG=1 BCDBG=1 node tri/demos.js budcycle 1 300000 runs   # the oracle for candidate (g): free strands not contact-copied (non-local)
BCR=50 BCW=0.05 node tri/demos.js budcycle 1 300000 runs  # the designed order (complete, catch, split): the picture in INNOVATIONS
node tri/demos.js closure                          # the designed kind (budKit): parent, bud grown in signal passes, catch, split (picture, no physics)
BPA=6 BPES=1 BPE=0 BPB=16 node tri/demos.js budpool 1 250000 runs   # the kind's bud from the pool with the anchor Z@| on cell 6 (openRange 9)
node tri/demos.js imprint 1 100000 runs 150px      # a cell fed through a pore copies its held genome from blanks outside; 3 sterile rivals (check imprint-pore; without x: alone; 150pc, 150pn: controls; 150pw: 7-cell pore) (150pc, 150pn: controls)
node tri/demos.js imprint 1 100000 runs 150ph      # the same cell with a hooded pore: no strand leaves (x: 3 rival strands outside)
node tri/demos.js imprint 1 60000 runs 60m         # a sealed cell (spent & walls) copies its genome from copy blanks (60mn: control)
node tri/demos.js imprint 1 30000 runs g           # a held strand copied from copies of its own triangles (gc: control)
node tri/demos.js imprint 1 200000 runs            # contact copying: a ring closes and a second grows from copy blanks only
```
Older demos: `copy` (chain copying from dockers, the founder held by its high end) and `ring` (a ring kit closes); each has a check in `tri/check.js`
with its seeds, steps and extra. The casting lineage's demos were removed on 2026-10-03 (git `7415fd4`). Pictures go to
`runs/NAME.png` with saved states; `TRI_NOPIC=1` turns them off. `TRI_RESUME=runs/x/NAME_tNNN.json.gz` continues a demo
world from a saved state; `TRI_PARAMS='{...}'` overrides parameters.

## Pitfalls learned
Read before designing a layout: docs/IDEAS.md, "Pitfalls learned (copy lineage)" (doorways, anchors, food sinks,
signals, rings, physics) and "Pitfalls from the casting lineage" (kits, pockets, doors, flaps; that lineage is
removed, its lessons stay).
