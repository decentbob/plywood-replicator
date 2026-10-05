# Next instance: start here

State on 2026-10-05 (after autorun run 20261004-2221, build). Read AGENTS.md first (rules of work), then this
file. History of earlier runs: docs/INNOVATIONS.md (newest first), RULES (Core changes), the autorun log and git (older
handoffs: NEXT.md in git, e.g. at `faeb75b` for run 2051's, `ef27e51` for run 1721's, `3d99dbd` for run 1421's, `ef7e74a` for run 1021's, `882b7d4` for run 0751's).

**Current slice (autorun run 20261005-0251, cleanup; in progress).** Goal: a leaner `budcycle` and a shorter suite and
NEXT, no capability or core change. (1) Retire check `budcycle` (the doorway kind with budpool's harness, 2400 s of
worker time; superseded by `budcycle-3`, which shows the same steps three times in the default setup) and remove the
options only it used (`BCHOLD`, `BCSEED`, `BCK`) and `BCLK` (run 1021's setup C, 0 of 2). (2) Shrink NEXT: the
Direction section to its standing conclusions, stale commands out. Done when: four short `budcycle` worlds (default,
receptor with cutters, `BCGATE`+`BCES=0`, `BCES=2 BCA=44`) give byte for byte the same output before and after, tests
pass, records follow. Stop there.

**Handoff status (autorun run 20261004-2221, build).** Priority 3a below is done, by another design than the one
written: **a lysis receptor on the bud's last cell** (INNOVATIONS run 2221; IDEAS; kit only, no core change).
`budKit(..., receptor)` puts `Г@&` on E's outer side; cutters `г@!-|-|` (labelled), openRange 50. E exists only on a
complete bud and its `&` side binds only while E hears the waiting anchor (cell 6, 40 bonds away), so cutters take
apart complete buds waiting for a catch and nothing else; the anchor stays on cell 6. New check `budcycle-lysis`
(budcycle-3's setup with `BCQ=1 BCR=50 BCC=2`): generation 3 in 3 of 4 (seeds 2-4: 855000, 736900, 1083700), 16 of 16
lysed buds complete (47 cells), fewest part type at the end 6, 1, 3, 1 (budcycle-3: 1, 0, 3, 1). Control without
cutters: generation 3 in 2 of 4; seed 4's first bud waits for ever where with cutters it was lysed and the line went on
(openRange 50 alone costs the lineage; budcycle-3 at range 9: 4 of 4). Test "receptor: ..." (35 tests). Seed 1 fails: its founder's first copy never completes, so no
strand leaves and the cutters return its 8 waiting buds to the pool.
Why not as written (anchor on cell 44): a late anchor hangs the held founder in or beside the pore and its first copy
jams for good (5 of 5 cutter-free worlds at 44, 4 of 4 at 40/38 to 360k; E's source outside does not help); the default
anchor 6 starts with the same jam and clears it at 100-180k when supply blanks reach the founder.
Also measured: the open relay's lag (o) releases 3-9 roots incomplete per world in the default lineage (14 of 22 at
one cell; rerun of budcycle-3 on this code gives the recorded generation-3 times, 0 stray), 0-16 with openRange 50.
New `budcycle` options: `BCA` anchor cell, `BCC`/`BCT` cutters, `BCQ` receptor; result line: cutBinds, lysedBuds, cuts,
falseRel, lysedAt, poolMin. Checks: 12 of 12 (all but `budcycle-3`, 2069 s; `budcycle-lysis` 3 of 4, 1758 s);
`budcycle-3` as four worlds on this run's demo code (same generation-3 times; `budKit`'s receptor defaults off).
Branch `claude/autorun-20261004-2221`, merged by PR. Nothing is running.
Scratch (container only, regenerate with the commands in INNOVATIONS run 2221): `runs/la`-`lt` (anchor 44/40 batches),
`runs/d1-4` (budcycle-3 rerun), `runs/q1-4` (the receptor, q1 with pictures), `runs/c1-4` (its control), `runs/jam.js`
(prints a saved state's founder body: `node runs/jam.js runs/x/budcycle_endw.json.gz`), `runs/pic.js` (the picture).

**Next steps (proposals).**
1. **Does lysis make the lineage longer?** (a `build`): long `budcycle` worlds (no `BCGEN`, 3-4M steps) with and without
   the receptor's cutters, counting generations and the fewest part type over time; 1.2M steps with a stop at
   generation 3 cannot show it. If yes, the labelled food loops (`BCL`, `BCLK`) may become unnecessary for bodies.
2. **The founder's start-up jam** (seed 1 of the receptor setup never copies; the default clears it slowly): a held
   strand whose first copy waits for a fill no blank brings. Measure in a `harden` how often and how long across seeds;
   a layout where incoming blanks pass the strand, or more blanks inside at the start (labelled), may remove it.
3. **Candidate (o)** at the next `explore` (index 43) or `core-review`: now with evidence from the default lineage.
4. The parent's open receptor while its own bud grows (IDEAS run 2221) is closed by candidate (n): weigh them together.
The check suite now takes about 70 minutes (`budcycle-3` and `budcycle-lysis` 2000 s each); the `cleanup` run (index 41)
may weigh which lineage check to keep once item 1 is answered.

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

**Priorities (in order; each a slice).** (Runs 0820 and 1021 did priorities 1 and 2 of run 0751's list: `heldCopy`
the rule and the checks retired; the corner default, the census and three generations. Their text is in git at
`7c9bbac`.)
1. *(Done, run 1421: `budcycle` worlds 1.2-1.4x faster, outputs the same; INNOVATIONS.)*
2. *(Done as a finding, run 1721: no kit change meets the target; the failing chains are buds that bud before they
   catch; INNOVATIONS. The speed side note stays open: a supply drive that keeps its stock outside the world, about
   1.6x early in a run, changes outputs; decide it in a `build` that changes the setup.)*
3. *(Done in isolation, run 2051: the lysis side `!`; INNOVATIONS, RULES.)* Next for it, in this order:
   a. *(Done, run 2221, by a receptor on the last cell instead of a late anchor: check `budcycle-lysis`; INNOVATIONS.
      Its next steps are the handoff's items 1-2.)*
   b. **Core change (o) (next `explore`, index 43, or `core-review`):** the open relay's lag, below.
4. **"Feeding" the offspring (the goal's second half, user 2026-10-04, IDEAS):** the parent should pass its bud the
   building blocks it needs to grow and later replicate; today the bud takes them from the shared environment and
   the parent gives only a seed site and a strand. Design question for an `explore` after (m), together with the
   release condition "until it can live on its own" (Direction finding 4).
5. **Later: N generations as the organism's own check** (a lineage that runs until stopped once blocks circulate),
   then the backlog (scanner gate, membrane growth).

**Rotation (autorun `projects/plywood/rotation.txt`):** unchanged: 41 cleanup (prunes what the builds left in
`budcycle`: the harness and doorway setup kept only for the pinned `budcycle` check, `BCLK`; the anchor-44 findings
need no option kept but `BCA`), 42 build (handoff item 1), 43 explore (candidate (o)), 44 build, 45 explore, 46
review-intent, 47 core-review.

**Core-change candidates (for the next `core-review` or `explore`).** (o) *The open relay hears "complete" too early
after a new bond* (run 2051): a bonded triangle whose partners all had 0 or -1 in the previous pass hears 0, so a
triangle joined by a partner that was free a pass ago (-1: not yet heard) can conclude "complete". Proposed: a triangle
that would hear 0 while a bonded partner had -1 hears -1 (not yet heard). Locality: partners' previous values, as now.
Effect: `&` releases wait one more pass in such cases; a -1 wave may cross silent bodies when a dock or root binds
them (one pass each). Evidence: traced in `lysis` (root binds 4006, cell 1 binds 4007, released 4008); oracle `LYFIX=1`
in `lysis` removes the detour. Before deciding: the check suite with `CHECK_SAVE` to see which worlds change. (m) *A
reverse path*: first step done (lysis, run 2051). (n) *Bud only after letting go* (run 1721): a seed site binds a
root only while its triangle hears no open signal (as `&` releases only then), so a bud still growing or waiting for
its catch (its anchor emits open) cannot start its own bud. Locality: the triangle's own open signal, relayed. Layout
it needs: the seed cell within `openRange` of the anchor (today 39 bonds apart, range 9: e.g. seed cell 1-5 beside the
anchor on cell 6, wedges not yet tried). The oracle `BCGATE=1` shows the effect (every chain bud copies its strand
after let-go) and the cost (slower; with a fixed pool, surplus buds still starve the next generation): worth it with
(m), weigh together; with the anchor on cell 44 (priority 3a) the seed cell 45 is beside it. (e) and (i) done in run 0820. (f) *The seed
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
node tri/check.js [id ...] > runs/check.txt         # capability checks: one PASS/FAIL line each, printed as each finishes (~36 minutes, 4 processes; CHECK_SAVE=dir keeps each world's output)
POOLB=20 POOLISO=1 node tri/demos.js pool 1 100000 runs 4   # a waiting front among 20 blanks and 4 next parts: copies per bound part vs B/n
                                                   # (seconds; without POOLISO three more copyable sides beside it)
node tri/demos.js budpool 1 250000 runs             # the kind's bud grown from a pool of its 47 part types (extra: parts per type, 8;
                                                   # BPE: E parts, 40; BPB: blanks, 8; BPS: world size, 30; BPR: openRange, 1; BPHOLD=0: no harness)
BPES=1 BPE=0 BPB=16 node tri/demos.js budpool 1 250000 runs   # the same with E's pore side plain and no E part: the last cell from the source (check budpool-e retired, run 0820)
BCGEN=3 BCAFTER=900000 node tri/demos.js budcycle 3 1200000 runs/x   # the lineage (defaults: corner bud, closed walls, no harness,
                                                   # 20 blanks + 400 pre-food at 0.0003, world 36): three generations (check budcycle-3;
                                                   # about 30 minutes); 'letgo:' lines per bud, ownCopies in the result. Options: extra parts per
                                                   # type (8); BCB blanks, BCI inside, BCS world, BCR openRange (9), BCE E parts (0), BCF/BCFP the
                                                   # supply, BCL=q / BCLK=q free monomers / kit parts back to blanks (labelled loops), BCDBG=1 census
BCQ=1 BCR=50 BCC=2 BCGEN=3 BCAFTER=900000 node tri/demos.js budcycle 3 1200000 runs/x   # run 2221: the lineage with a lysis
                                                   # receptor on each body's last cell and 2 cutters (check budcycle-lysis; about 30 minutes);
                                                   # BCA anchor cell (6), BCC cutters, BCT cutter type; result: lysedBuds, lysedAt, falseRel, poolMin
node tri/demos.js lysis 1 1000000 runs/x           # run 2051: a bud stuck on its parent's seed site taken apart by cutters 'z@!-|-|' at its
                                                   # waiting anchor (cell 44, openRange 50; check lysis, 2.5 minutes); a new bud grows from its
                                                   # parts. LYC cutters (4), LYP parts per type (0), LYA anchor cell, LYR openRange, LYS world (30),
                                                   # LYFIX=1 the oracle for candidate (o); one output folder per seed when running several
BCGATE=1 BCGEN=3 BCAFTER=900000 node tri/demos.js budcycle 3 1200000 runs/x   # run 1721's oracle: a bud buds only after
                                                   # letting go (BCES=0 BCE=8: no E source, 8 E parts; BCES=2: E source outside); 'sinks', 'chain:' lines
BCL=0.002 BCGEN=3 BCAFTER=900000 node tri/demos.js budcycle 3 1200000 runs/x   # run 1021's setup B (generation 3 in 4 of 4; the picture)
BCS=32 BCF=180 BCFP=0.001 BCAFTER=300000 BCGEN=2 node tri/demos.js budcycle 1 600000 runs/x   # runs 0621-0751's setup (check budcycle-free, retired)
BCAFTER=2000 BCSEED=-1 BCK=0 BCHOLD=1 BCB=200 BCF=0 BCS=32 node tri/demos.js budcycle 1 300000 runs   # one generation, the doorway
                                                   # kind with budpool's harness (check budcycle; BCR=50: the designed order, run 2221's picture)
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
