# Polygon Chemistry — guide for coding agents (Codex, Claude Code, others)

This is the canonical working guide; `CLAUDE.md` only imports it. Keep it current when the project changes.

An artificial-life experiment: a 2D world of small deformable polygons ("blocks") under one universal rule
table, in which template copying, mutation, selection and (the goal) **complexity emerging from simplicity**
come out of local rules, not out of code inside the creatures. Plain JavaScript, no dependencies.

The working name *plywood replicator* is after the Penroses' self-reproducing wooden blocks (1957–59), the user's
inspiration: passive units, shaken, that copy a seed, with the logic in their mechanics. The user (2026-09-25): thinking
more mechanically could get somewhere interesting.

Read in this order: this file, `experiments/LEDGER.md` (every experiment with its verdict, the regularities that predict
outcomes, the viability atlas, the knob index, open gaps), `README.md` (rules and physics as they stand), `experiments/RESULTS.md`
section 20 "Summary" and the latest sections, `DESIGN.md` sections 2 (commitments), 14 (decision log, newest
entries near the end of the list), 15 (ideas not yet tried). `LITERATURE.md` (2026-09-25): a survey of self-replication
work (Penrose blocks, tile crystals, von Neumann, Hutton, chemoton, hypercycles, gene origin) mapped onto this world, with a
ranked shortlist at its end.

## The user's rules (hard constraints and preferences)

- **Locality is the fundamental rule, the reason the project exists** (the user, 2026-09-24: many projects have
  pre-programmed behaviour; emergent evolution without it is what has not been seen). A block reads only its own
  type and state, which of its sides are bonded, and the derived state of the side it is bonded to, and changes
  its own state by simple rules on those. Communication only through connected sides. No global signals, no
  counters, no knowledge of strand length, no special behaviour for whole strands, finished copies or anything
  bigger than a block (even if it could be written with local steps: judge a rule by what one block does). A
  signal relayed from block to block moves one block per derive pass (read neighbours' relayed states from
  `ss0` / `tip0`, the previous pass), never further. Check every new rule against this before anything else.
- **No pre-programming.** No rule may mention copy, strand, organism, genome. Those words live in comments.
- **Blocks are conserved: none is created or destroyed mid-run** (the user, 2026-09-25). A rule that makes blocks, or that
  copies, duplicates or inserts a stretch, would make replication pre-programmed. New genes must come from mutations the
  physics already makes. The user's preference for the workflow: wild ideas and combinations in small worlds, promising
  leads in large ones; scarcity and density are factors worth varying.
- **The kind of result the user wants** (2026-09-25): emergent complexity from the local rules themselves, ideally
  "something based on logic, like a well-running machine made of independent parts that can copy itself". Environment
  settings (temperature, bands, cycles) may be tried but interest the user less. Theoretical work on self-replication
  (not only simulations) may hold a missing link; different replication modes (template chains and other assemblies)
  working together are worth exploring.
- **Screen short, confirm long** (the user, 2026-09-25): most answers show in a fraction of a long run (in section 33 the
  winner was clear within 50,000 of 500,000 steps). Screen many variants in 50,000 to 150,000-step runs, four at a time;
  run long only to confirm a lead or to wait for slow or rare things (a gene decaying, a gene arising).
- **Any block type is fine if it obeys locality** (the user, 2026-09-25, on product blocks and their functions).
- **Prefer state changes to type changes.** When a block should become something else, give it an internal
  state and let a bonded side's state trigger the change (as energy particles recharge, as raw membrane is
  activated). The user explicitly disliked a precursor block turning into another type.
- **Keep the core simple.** New mechanisms go behind a knob that defaults off, and the default trajectory must
  stay bit-identical (check with `tools/fingerprint.js`). Mechanisms measured to add nothing are removed
  (history stays in RESULTS/DESIGN). Few presets, the ones with the best prospects.
- **Biology is guidance, not a spec.** Add a rule because a measurement here shows the problem, not because
  biology has one.
- **The polygon engine is the only physics** (the rigid engine was removed on 2026-09-23; it is at commit
  `b41557c` if an old number must be reproduced exactly).
- The user likes honest reports, negatives included, short progress notes during long runs, and a
  recommendation with a question when the direction is theirs to choose. They may be away for hours: keep
  working, keep committing, report at natural checkpoints.

## Layout

```
src/sim.js          the whole simulation (browser global PolyChem, or require()); about 1,700 lines
src/rchem.js        random chemistry: Sim with its rule table replaced by a random one (RChem, randomTable, copyTable)
index.html          viewer: canvas, knobs, presets, readout, event feed, click-to-inspect
run.js              headless runner: CSV every --every steps, JSON summary on stderr (written when the run ends), --births FILE
                    (JSONL, appended every --every steps, so a run in progress or a stopped one has its births so far),
                    --change T:k=v,k=v (environment change mid-run, repeatable); per-type knobs (--mobC, --fold1) accepted;
                    --save FILE (the whole world state, rewritten every interval: open it in the viewer, or continue it) and
                    --load FILE (continue a saved world; knobs given override its own: a branch under a changed rule)
test.js             invariant tests (39); --list and --match=REGEX select checks, with CPU time printed per check
LITERATURE.md       survey of self-replication work mapped onto this world (2026-09-25), ranked shortlist at the end
experiments/LEDGER.md  one row per experiment: question, verdict, key number, script, what it points to. Start here to see
                    what worked, what failed and what is open; add a row for every new experiment
build.js            single-file dist/ build of the viewer
experiments/*.sh    one script per batch; each RESULTS.md section names its script
experiments/*.js    analysis over experiments/out/*.births.jsonl (see below)
experiments/out/    CSV (committed), JSON and births JSONL (gitignored)
tools/fingerprint.js  trajectory hash, to prove a change leaves default behaviour identical
tools/screenshot.js   drive the viewer headless and screenshot it (Playwright + /opt/pw-browsers/chromium)
tools/snap.js         render a Sim in Node to PNG (colorOf callback for custom colours)
tools/queue.sh        job queue: runs a file of jobs (OUTDIR NAME --knobs...), at most 4 run.js processes on the machine
tools/killnode.sh     kill node processes by a pattern without killing your own shell (matches only lines starting "node")
experiments/product_exchange.js  portable worker batch (44), at most four workers; CSV, raw births, source hashes and full
                    parameters in *.manifest.json; fails instead of overwriting an existing batch. Summary via product_exchange_summary.js
experiments/product_latches.js   parked release/activation variants (44); experimental subclass, not standard viewer/CLI knobs
experiments/product_shapes.js    experimental rest-shape switches (45), with accepted-bond diagnostics; standard engine unchanged
experiments/product_shape_summary.js  actual bound/free wedge angles, assembly and binding events, occupancy and births
experiments/product_parent_summary.js  parent/child production classes from raw births; distinguishes mutation from recipient reproduction
experiments/flexibility_summary.js  complete four-arm comparison (46); validates raw counts, windows and parameters, prints paired effects
experiments/mechanical_brace.js  one-founder copying assay (47), prepared attached/free support, equal link probability; summary and test alongside
experiments/geometric_bottleneck.js  permanent-wedge support assay (48), with per-joint geometric dwell counters
experiments/complementary_fit.js  shape x partner-identity assay (49), reciprocal founders and solver controls
experiments/complementary_population.js  small fueled descendant-viability probe (49); each assay has a _summary.js
experiments/curved_fuel.js  isolated inactive-row fuel assay (50); curved_collective.js logs shared fuel contacts
experiments/curved_fuel_reproduction.js  active copying control and inactive-founder startup (50), matched grip ablations
experiments/curved_fuel_analysis_test.js  validates all section-50 batches, provenance and malformed-data rejection
experiments/offspring_recovery.js  exact section-50 replay with member IDs, per-row rearming and material inventories (51)
experiments/offspring_forks.js  identical-state energy/turnover diagnostic; _summary.js and _test.js alongside both assays
experiments/offspring_analysis_test.js  validates section-51 lineage, material partitions, arm contrasts and source hashes
experiments/peek.js   quick look at any birth log, finished or running: births, length, top sequences per window, --has=ABA
experiments/capped.js, caplen.js, letters.js   capped-genome worlds (33, 35): genes per window, length, letter make-up
experiments/stacks.js  the standing population of a saved world (--save): rows, stacks, heights, letters by sequence (40)
experiments/races.js, permtest.js   many-seed races without mutation: each genome's share per seed and seeds won; permutation
                    test between two groups of runs (41). pockets.js: who makes the fuel pockets; order.js: letter order per window
```

## src/sim.js map

- Stack rule (40): `backCopy` makes an armed letter's back template (`KT_*`); with `stack` a finished back copy holds (`I_HOLD`, face
  shows `HOLD`), and stacked units carry the `stk` bit on their lateral sides (read by neighbours for cooperative melting, `pSMelt*`).
- Constants: sides `F R K L`; types `T_A T_B T_E T_M T_C T_D T_X T_P T_Q T_J T_G T_1..T_4` (A–D replicator letters, P/Q caps,
  all in `LETTERS`; E energy particle; M membrane block; X ray; J hub; G droplet block; 1–4 product blocks of the translate
  rule, `PRODUCTS`, `isProd`); `hand` (chirality) is a
  per-block property like type; internal states `I_DOCK I_REPEL I_TPL I_FRAY` (letters), `I_OFF I_ON` (E, and M raw/active);
  derived side states in `S` (append new ones with a new unique value; `SNAME` is built by value).
- `DEFAULTS`: every knob with a one-line comment. Per-type knobs are `<base><Letter>` (`resC`, `stiffD`,
  `bendB`, `shapeA`) read through `typeParam(p, base, t, dflt)`.
- Chemistry (the rule table): `compat` (which side pairs bond, with what probability), `_computeOpen` (which
  sides can bond at all), `_derive` (side states from internal state + bonds; context motifs CHARGE, MAKE,
  FEED, SHIELD, relay; the endLoss tip bit `tip`/`tip0`; translation's back states `TRN_*`, a finished product's `PBIND`,
  the catalysis bit `cat`), `_transition` (all state changes, radiation, fraying, unzip, feed, binding melt,
  membrane activation, product release and melting), `_logBirths` (observation; products are logged with `prod: 1`).
  Relayed signals are read from the previous derive pass (`ss0`, `tip0`), so they move one block per pass.
- Physics: `_physics` (jostle, one neighbour scan, contacts, corner pins with rigid move + softness, shape
  matching), `_formBonds` / `_tryBond` / `_geomOK` / `_formBond` (bond formation from the scan's pairs),
  `_chemistry` (transitions, bond holding, births, reload). `step()` = physics, formBonds, chemistry.
- Observation only (never feeds back): `componentOf`, `cycleOf`, `chainOf`, `enclosedBy`, `stats`, `check`.

### Adding a rule, checklist

1. Knob in `DEFAULTS`, default off. New side state appended to `S` if a neighbour must read something.
2. `_derive` (what the side shows), `compat` + `_computeOpen` (if it bonds), `_transition` (what changes).
3. Event counter in `_init`, exposed in `stats()`, column in `run.js` `cols` if worth logging.
4. `node tools/fingerprint.js 1500` before and after: identical output with the knob off.
5. A test in `test.js`; viewer knob in `KNOBS`, colour in `SIDECOL`, legend entry, default in `ZERO` preset.
6. README rule tables, DESIGN decision log entry, RESULTS section when measured.

## Commands

```sh
node test.js                                    # all invariants, ~10 min
node tools/fingerprint.js 1500 > before.txt     # then after a change: diff
node run.js --help                              # every knob
node run.js --steps 200000 --every 20000 --W 40 --H 40 --nA 256 --nB 256 --seedSeq ABBABA --pUndock 0.1 --pUnzip 1 --pFray 0.00003
node experiments/peek.js experiments/out/TF_dense_1.births.jsonl --capped --has=ABA,CDC --window=100000
nohup tools/queue.sh /path/jobs.txt 4 > /dev/null 2>&1 &   # lines: OUTDIR NAME --knob value ...
node experiments/motifs.js ABA,CDC experiments/out/G3_*.births.jsonl --window=250000
node experiments/composition.js | pairs.js | alternation.js | turnover.js | length_table.js | mutation_rates.js ...
NODE_PATH=$(npm root -g) node tools/screenshot.js /tmp/v.png '{"preset":"evo"}' 10000
```

Speeds (engine of 2026-09-25, CPU time per process on a loaded machine, idle is faster): about 1,100 steps/s at 40×40 with
570 blocks (two letters), 550 to 775 in the capped four-letter world (1,100 blocks), 300 in a jammed 40×40 world of 1,900.
Roughly twice the old engine's. Four cores: at most four processes; more halves everyone. A 300,000-step capped run takes
about 10 to 20 minutes with four running. Measured with four running (wall, 2026-09-25 night): 1,700 to 1,900 steps/s in the
two- and four-letter 40×40 worlds of about 550 blocks, 750 in the capped fuel races (700 blocks), 670 in the dense 48×48 world
(1,300 blocks); stack worlds that lock up slow to 1,000. So 8 to 12 seeds per cell is affordable: prefer many small seeds to one
big world when drift decides races (41).

## Working conventions and pitfalls

- Workflow that worked (2026-09-25): state the question, screen 2 seeds × a few variants in 50,000–150,000 steps with
  `tools/queue.sh` (outputs in the scratchpad), look with `peek.js` while they run, add a same-seed control, then run long
  only what earns it; write the RESULTS section (what it says, what it does not) and a LEDGER row (then
  `node tools/ledger_index.js`; revise a regularity if the result breaks one), commit, move on. Copy
  outputs into `experiments/out/` when done (a stop hook complains about files changing under git mid-run).
- Check a new world lives before measuring anything in it: many screens this session were wasted on worlds that died at
  once (radiation too strong, too few caps, a seed that makes no product). A 20,000-step look with `peek.js` catches it.
- `pkill -f <pattern>` (or `pgrep -f` in a kill loop) matches your own shell's command line and kills it (exit 144); use
  `tools/killnode.sh PATTERN` or kill by PID.
- `tools/queue.sh` reads its job file as it goes: lines appended while it still has lines waiting are run, lines appended after it
  has read the last line are not (it only waits for its children then). Check the log for `ALLDONE`; start a new queue if so.
- A difference is not a result until its same-physics control has run (40e: stacks looked like a radiation shield until released
  back copies, without stacks, did as well; 41a: a fuel "effect" matched by the no-fold control).
- Verify physical shape changes before population runs: at stiffness 1 and without `snapCorners`, bonded blocks skip rest-shape
  matching (45a). Checking `_restSlot` alone is insufficient. Use an actual curling test and measure bound/free corner geometry;
  any softer-block or `snapCorners` experiment needs a straight control with those same physics settings.
- Measure speed in CPU time (`process.cpuUsage()`), not wall time: the machine is usually shared by several runs.
- A birth's parent is the strand its template unit sits in (`strandOf`), not the longest chain of its component (fixed
  2026-09-25: a template bound to another strand, or bridged to another template by a copy, was sometimes read as the parent).
- "× chance" baselines are inflated by founder descent (seeds like `ABBABA` carry motifs; low mutation keeps
  founder make-up). Always compare against a same-seed control run.
- Two seeds is a lead, not a result. Say so in RESULTS.
- Four-letter worlds copy about four times slower per strand (each site needs one letter of four).
- Octagon blocks leak (chimeras); stiffness below ~0.3 lets copies docked on neighbouring templates link.
- Every RESULTS section: the command/script, a table, what it says, and what it does not say.
- `main` is the default branch. Commit often with descriptive messages; push to the session's branch and merge into `main`
  when a piece of work is done (delete merged branches, so `main` stays the only long-lived one). **Standing approval**
  (the user, 2026-09-24): merging finished work from a session branch into `main` and pushing `main` needs no further
  permission (tests pass and the default fingerprint is unchanged first).

## Where the project stands (2026-09-25, night)

The full record is `experiments/LEDGER.md` (about 100 experiments with verdicts, the regularities that predict outcomes, the
viability atlas, the knob index). The short version:

- Works: exact template copying and every kind of copy error from local rules (1–2); length held by cooperative docking
  plus processive fraying (13, 15); private genes selected where their pressure acts (energy `feed` 14, shield 19);
  shape selecting on sequence (15); adaptation to an environment change (14).
- **Genes accumulate, and genes arise by mutation.** With end-replication loss (`endLoss`) and bare caps (`bareCaps`) a
  two-gene genome beats its one-gene competitor wherever radiation acts (33). In dense worlds the shield gene arose by
  mutation in 3 of 3 seeds (33, old engine). **Proofreading (`proof`, 38)**, a third gene whose pressure is copying itself,
  arises from a spare letter one mutation away and sweeps, with a speed-accuracy trade-off.
- **A machine of parts (34, 36).** Translation, catalysis, shared catalysts and their parasites (60–70% of births: the strongest
  ecological effect in the project); no product function yet makes length or complexity pay.
- **A second mode of replication (40): stacks.** Two-faced letters (`backCopy`: a back templates too, the copy lies parallel)
  and copies that stay on as rows (`stack`) give crystals that grow row by row and split, from two local rules on the same
  letters. They copy exactly, but hold length only by hoarding letters (long zipped rows never die, births fall), let short
  rows win again when they turn over, and give nothing under radiation that released back copies do not (two copy sites per
  strand are what rescue a population there). Kept, default off, for combinations.
- **Shape as function (39, 41)**: pockets hold fuel by fit, and a folded genome arms faster from fuel that fits it (a
  many-to-many map no rule lists). But in races between same-letter genomes the fitness differences are within drift, in a
  letter-limited world (8 seeds) and in an energy-limited one (12 seeds, `ABABABAB` 50% with folds vs 24% without at fuel
  1.2, p = 0.09). Pockets are mostly one strand folded on itself (81–92% of fuel armings).
- **Ecology in space (42, 43).** The shared catalyst in an 80×80 world: creeping polymers separate hosts and parasites and hold
  parasites about ten points lower (50–65% of births against 71–72% well mixed, 8 vs 4 runs, no overlap); parasites arise by
  mutation within 50,000 steps. With `transStart` (only strands carrying a start letter translate) and graded specificity, mimics
  (a host's key without the start) arise and live on hosts' products, but in an open world the keys shrink to two letters and
  mimics do not drive key changes (43a). The capped tests also failed to establish an arms race (43); section 44 isolates
  catalyst transport and warns that capped non-producers can reproduce without borrowed catalysts at the tested bare rate.
- **The engine is 2–2.5 times faster** (37). Saved states: `--save`, `--load`, the viewer's "Open state".
- Failed or parked, with reasons in the ledger: compartments and walls (16, 24, 25), recognition between strands (18, 26),
  public goods (9, 14, 17, 21), composition as a phenotype at small scale (35), stacks as a reason for length (40).

The core obstacle, restated after this session: **the shortest viable replicator wins unless something makes length pay**
(regularity 1), and a second replication mode does not change that by itself. Genes pay only by removing a per-length cost,
so the number of genes follows the number of designed pressures. Graded functions (shape) give selection too weak for
populations of 20 to 100 genomes (regularity 10). Strong, self-renewing pressures come from ecology (parasites), which is where
open-ended complexity is most likely to start.

## Handoff (2026-09-26, latest): turnover can restore exact descendant copying, but destroys the rows

Section 51 diagnoses section 50 without adding rules. All worlds/seeds are reused, not fresh confirmation.

- Eight exact 100k replays retain physical offspring IDs and reconcile all 120 letters. Every archived birth,
  fuel arming and 10k statistic matches. **10/21 curved offspring fully rearm but none produces a child** by 100k;
  among seven born by 50k, six fully rearm. The whole-row energy barrier is not the only obstruction.
- Curved worlds contain 33-39 letters in unlogged linked rows at 100k. All 31 such rows across four worlds
  remain attached somewhere. They contain 80 active units: unfinished material is not necessarily inert, and
  partial release/rearming precedes the logged birth. Do not treat world fuel use as mature offspring function.
- Identical-state forks at 100k, seeds 73,74, square/curved, run another 50k with control, energyGate=false,
  pFray=0.00003+pUnzip=1, or both. Bypassing energy alone gives original curved offspring 1/0 exact children
  versus 0/0 control. Turnover with normal energy gives 2/2. **A two-seed diagnostic lead**, not generality.
- Turnover also gives 24/27 curved births with mean length 5.13/4.37, and destroys nine of ten original curved
  offspring. It changes competition, geometry and fuel contacts as well as material availability. Do not claim
  pure monomer rescue, persistent eight-letter lineages, or increased complexity. Intact original-parent attribution
  retires a row at its first fray event; recycled block IDs cannot count as survival.
- 2M steps, 1,592.984 CPU seconds; full member histories/raw births/manifests/source and fork-state hashes retained.
  Both assay tests and analyzer corruption tests pass; default fingerprints/core unchanged. Full suite not rerun.
- **Next:** a small assay of existing local end protection: can it preserve completed rows without protecting
  stalled intermediates too? Caps can protect the free end of an unfinished row as well; measure lifetimes and
  copying viability before any race. No new reward, chemistry, preset or full population sweep is warranted yet.

## Previous handoff (2026-09-26): fuel capture leads to shared-contact startup, not a curvature advantage

Section 50 uses only the existing engine, with prospective choices in `curved_fuel_plan.md`.

- **Partial physical function:** one inactive AAAABBBB with opposing 20-degree wedges, stiffness 0.5 and 40 U
  rearms 3.625/8 units on average in eight fresh seeds; matched square material rearms zero. Almost all events
  arm B; none fully recovers. Eight solver passes retain capture but reduce its magnitude to 2/8 in four seeds.
- **Shared contacts complete recovery:** four rows in 12x12, no free letters, give 22/32 full square recoveries
  and 25/32 curved across eight fresh seeds. Every one of 124 curved A armings uses cross-row fuel contacts.
  Square material works too. More rows change density/material; do not call this evolved cooperation or shape selection.
- **Startup with free material:** in 18x18 with 60 A + 60 B + 40 U, four initially inactive founders produce
  exact eight-letter offspring by 100k in all four fresh seeds. Square births 7/4/7/7; curved 6/4/6/5.
  All grip-disabled controls stay sterile. One-founder 50k screens absorb some fuel but make no offspring.
- **Limit:** only two square runs have a generation-2 birth; curved runs have none. Fuel use alone overstates
  function. This no-turnover world binds up its finite letters; no sustained curved reproduction or length selection.
  Do not pool the two selected screen seeds with fresh confirmation. At 50k some successful 100k runs still have no births.
- 136 runs, 7.48M steps, 2,223.877 process CPU seconds, full manifests/raw events/windows/CSV committed.
  All three assay tests, malformed-data analyzer checks and existing grip/pocket test pass. Core source and all
  five default fingerprints are unchanged; full 39-check suite not rerun. No new rule, preset or viewer feature.
- **Next:** observe each released offspring's progress toward full rearming and material trapped in incomplete
  copies. Separate missing contacts from missing monomers before altering density/turnover or adding chemistry.
  Keep mechanical exploration open; no new reaction is yet justified by this evidence.

## Previous handoff (2026-09-26): complementary shapes relieve a real copying bottleneck

Sections 48-49 follow the user's open exploration request. The engine and default trajectories are unchanged.

- Permanent `bendB=20/30` wedges fail to copy in the prepared-support assay even when a brace straightens the founder
  to about two degrees. At the BB site, incoming wedges' lateral edges still fail the 10-degree linking angle gate.
  The 10-degree support result did not pass its two-seed criterion. Measure both rows' fit, not straightness alone.
- **A confirmed geometric compatibility result:** existing `compCopy` with `bendA=-20`, `bendB=20`, stiffness 0.5
  restores copying in eight fresh seeds. ABBABA exact copies average 0 self / 10.125 complementary; the reverse
  founder BABAAB gives 0.625 / 7.75. Square-adjusted gains are positive in every seed, both directions. Opposing shapes
  without complementary recognition fail, as do same-sign wedges with complementary recognition. No new rule/reward.
- Solver dependence matters: default body jostling at 8 passes preserves the result in four seeds. Individual kicks
  at 4 passes erase the reverse-direction benefit; a post-hoc 16-pass diagnostic recovers both directions in two seeds.
  This is not convergence proof, and self-paired sterility is not universal. Keep all controls visible.
- A two-seed, 50k fueled/turning-over probe gives 42/34 births and generations 4/5 with opposed complementary shapes,
  versus 12/10 births self-paired. Descendants reproduce, but late newborn length falls to 4.08/4.50 from six.
  Free letters are exhausted. **No complexity gain, indefinite persistence, or selection for length is established.**
  The population probe uses default pUndock=0, versus 0.1 in the isolated assay; do not attribute cross-assay changes
  to fuel alone. Within each factorial population comparison, the other parameters match.
- `geometric_bottleneck.js`, `complementary_fit.js` and `complementary_population.js` have prospective plans, bounded
  workers, raw results, full parameters and hashes; each has a `_summary.js`. Geometry samples are dwell times, not
  independent reaction attempts. Snapshot parent differences under turnover are not automatically copying errors.
- 184 valid runs, 3.92M steps, 1,599.717 simulation CPU seconds. All 1,062 isolated complementary-fit assay births
  match expectations. Seven relevant existing checks plus new assay/analyzer tests pass; all five default fingerprints
  are unchanged. The full 39-check suite was not rerun. No new preset or viewer feature.
- **Next:** give a persistently curved but copying-compatible sequence a measured physical function, possibly fuel
  capture via existing pocket geometry. Test that operation and solver controls first. Do not assume this fit result
  makes length pay or resurrects the failed brace/product ecology. Newborns now need not be straight to copy.

## Previous handoff (2026-09-26): physical straightening is not sustained copying improvement

Section 47 follows the user-approved mechanical-bracing test. One active `ABBABA` founder and a prepared six-block
product row; attached vs free support, equal initial geometry and conserved material. `pLinkBare=1` removes the chemical
linking advantage. No energy means offspring cannot rearm: this measures one founder's copying, not population growth.

- A two-seed screen at `foldB=30` increased exact yield from 7/7 to 11/10. Fresh seeds 3–10 **did not confirm** it:
  mean 9.50 free vs 9.25 supported, despite bend falling from 14.59° to 2.13°. Straight controls also did not gain yield.
- The planned `bodyJostle=false` control gives the same sustained-yield conclusion: 7.125 free vs 6.50 supported at
  fold 30, despite 18.55° → 5.27° bending. No new physics/chemistry or preset was introduced.
- **Conditional onset lead:** individual kicks plus fold 30 give first exact copies at mean 2,721 vs 1,425 steps,
  faster with support in 7/8 seeds. Straight templates also start faster in 6/8. This is not specific to folding and does
  not survive as increased 20k output. Default body jostling gives nearly identical first-copy times at fold 30.
- All 630 logged letter births are exact founder copies. 76 small runs, 1.52M steps, about 564 CPU seconds. Data,
  full parameter/raw birth records and source hashes are committed. Do not pool the selected screen with fresh seeds.
- `mechanical_brace_plan.md` records the prospective protocol and selection. `mechanical_brace_summary.js PREFIX...`
  validates complete paired data and reports yield, onset, physical bend and folding-specific contrasts. The assay test
  checks identical initial geometry, equal linking probability, support retention, inactive offspring and exact resume.
  Core engine and five default fingerprints are unchanged; the general suite was not rerun.
- **Next:** measure an actual geometric bottleneck before another support ecology. A structure that makes a template
  straighter has not earned a catalytic function if removal leaves copying intact. Keep the early-copy lead conditional;
  delivery, construction, turnover and inheritance of the prepared brace are all untested. Do not automatically expand
  into mixed-stiffness races or add a new reward rule.

## Previous handoff (2026-09-26): flexibility's recipient benefit did not replicate

Section 46 completes the direct stiffness × binding comparison on fresh seeds 7–10: 16 runs × 50k steps, with the
20k–50k analysis and primary outcome specified before launch in `experiments/flexibility_plan.md`.

- Flexible products with binding produce 15/0/4/2 capped offspring from non-producing parents, versus 2/5/12/3 without
  binding. Mean effect -0.25 births; positive in only one seed. Rigid binding's effect is +0.75; the interaction is -1,
  with mixed signs. The earlier four reused seeds in 45d did not establish a reliable recipient benefit.
- Binding increases total births in every seed, mostly from producer parents: rigid mean 41 vs 11 without binding;
  flexible 34 vs 12. This does not establish dependence or parasitism among recipients.
- Flexible seed 8 has no armed capped recipient site-samples throughout 20k–50k. Occupancy is undefined, not zero.
  Never compare occupancy means that silently exclude different seeds; summaries now show denominator availability.
- Keep existing flexibility controls, but do not promote a preset or expand into an arms race. A better discriminating
  next probe is attachment as a mechanical brace: use `pLinkBare=1` to remove the programmed catalytic link advantage
  while preserving attachment, with matched no-binding controls. Begin with a small physical copying assay, not another
  ecology sweep. `catalysis=false` removes binding too and is not the same ablation. This probe remains unrun.
- The user's flexible-polygon idea already exists. Stiffness controls restoration, not an explicit maximum deformation;
  `maxStrain` breaks eligible bonds by residual pin gap, not by shape deviation. README clarifies this; no engine change.
- `flexibility_summary.js PREFIX` validates complete 20k–50k windows, all raw birth counts and the four-arm parameter
  contrast, then reports paired effects. Partial progress summaries may have unequal endpoints even within one seed;
  never use their whole-run totals as paired results. The new analysis fixture and three product checks pass; the general
  suite was not rerun. All five default fingerprints are unchanged. Raw data and manifests are committed.

## Previous handoff (2026-09-26, later): product flexibility was the clearest mechanical lead

The user: continue where evidence is promising; SpudCell is interesting, only integrate it where useful. Section 45 tests
assembly-triggered rest shapes instead. 34 completed runs (1.16M steps), plus a stopped 90k-window solver diagnostic.

- **Most useful result:** existing `stiff1=stiff2=0.8`, with durable straight products (`productFray=0.03`), increases
  non-producer occupancy in all four matched seeds: mean 7.63% versus 1.45% at stiffness 1 over 10k–30k. Capped offspring
  of non-producing templates increase from 5/3/7/1 to 6/6/10/4. Total births and snapshot fidelity stay similar. It uses
  existing physics; engine source is unchanged. Viewer stiffness controls were exposed, neutral default 1.
- **Shapes remain experimental:** `product_shapes.js` selects folded rest shape on a lateral bond (`lateral`), or requires
  that plus a free face (`lateralFree`). Mild persistent 5° bends increase births in 3/4 fresh seeds; 15° free-only bends
  increase recipient occupancy in 3/4 but do not consistently benefit recipient reproduction. Their mean recipient-parent
  births equal the matched no-binding arm (6.5). No shape switch was promoted to the normal chemistry or viewer.
- **Physical activation trap:** at stiffness 1 without `snapCorners`, bonded blocks skip shape matching. The first screen
  was dynamically identical to straight controls. Tests now check actual curling and the assay measures corner-derived
  bound/free bend angles. Section 34e used `snapCorners=1` and is not invalidated by this finding.
- **Observation:** parent-at-release can be a fragment. Of 53 capped births in the substitution-disabled probe, 52 have
  capped parents and are exact; one reports parent `Q` and is unknown. `product_parent_summary.js` separates template
  reproduction, producer-to-non-producer births, sequence changes and unclassifiable parents. Never turn extra occupancy,
  binding events, or mutant offspring into a claim of recipient fitness.
- **Next:** straight flexible versus rigid products with a direct binding ablation and new seeds. Then mixed-stiffness
  products could give inherited composition/order a function without a new motif reward. The stiffness finding reused
  four historical controls and is a lead, not generality or an arms race. Do not compare old 30k runs with new 50k totals:
  the summaries now accept `--until=30000`; incomplete batches require explicit `--partial`.

All three affected product checks and the viewer build passed. There are 39 registered checks; the unchanged general
suite was not rerun. Default fingerprints are identical. Research classes must resume their own saved states;
the standard viewer does not implement their experimental shape switches.

## Previous handoff (2026-09-26): product lifetime is a transport lead; release alone hurts

Section 44 contains 34 runs (1.08M steps) separating product release, lifetime, recipient occupancy and births. The original
suggestion to remember a maker's identity was deliberately avoided: chemistry still never reads `parentOf` or components.

- **Main addition:** `productFray` (default 1) scales product end-fraying, independently of genome turnover. At 0.03, late
  non-producer occupancy is 0.07/0/1.13/4.63% in four seeds versus zero in matched ordinary-lifetime controls; capped births
  remain similar. Small transport lead, no demonstrated selection or complexity increase.
- **Negative:** delayed activation and melting into a temporarily inactive state reduce original-site retention, but useful
  binding and births fall. Parked in `experiments/product_latches.js`; do not add them back as viewer presets. Its
  `pPReady`/`productReset` are experiment parameters, not normal `run.js` options. The base engine has `_productReady` and
  `_productMelt` single-block hooks for that subclass; default trajectories are unchanged.
- **Geometry lead, unbuilt:** both product kinds folding 45 degrees prevent linked product formation in the tested world.
  `_restSlot` folds free monomers too. Test a rest-shape change triggered by a lateral bond, leaving monomers flat and
  retaining curvature when the product binds again. Read LITERATURE's new release section; do not infer a benefit from shape alone.
- **SpudCell lead, unbuilt:** user asked about it; see LITERATURE and DESIGN 15. Surface crowding suggests an attachment-to-strain
  assay using existing contacts. Start with arcs/ribbons, controls for attachment and bulk, then require repeated functional
  growth and fragmentation. Do not label ring breakage compartment reproduction, or its introduced-variant selection open-ended evolution.
- **Critical measurement:** a rising non-producer birth share can simply be host collapse. Count mature product occupancy
  and use a no-binding control. "Same block" in section 44 is original-block provenance, not whole-maker identity. Full product
  release logs undercount synthesis when products rebind piecemeal. Do not confuse zero logged releases with no product material.
- **Workflow:** portable `product_exchange.js --out PREFIX --steps N --seeds 1,2 --arms baseline,durable --workers 3`;
  at most four simulation workers across all batches/tests. Manifests are tracked; raw birth logs remain ignored unless
  deliberately staged. First two screens predate birth-log capture. Test filtering avoids rerunning the entire suite for every probe.

Best next step: characterize productive encounter rates and extend the durability comparison, or test the bond-triggered
geometry in a small assay. Avoid another million-step arms-race run until catalyst delivery is appreciable and demonstrably
benefits recipients. Default fidelity plus the existing evolutionary regimes remain intact.

## Historical handoff (2026-09-25, night)

Session of 2026-09-25 night (branch `claude/youthful-clarke-pmu31b`, merged into `main` as it went). The user this session:
don't follow the handoff blindly, think about what is promising or underexplored; perhaps several kinds of replication with
mutation and a reason for selection are enough; mechanical designs at the core; theory may hold a missing link. Done: stacks
(40), many-seed shape races (41), a shared catalyst in space (42), keys and mimics with `transStart` (43), tools
(`experiments/stacks.js`, `races.js`, `permtest.js`, `pockets.js`, `order.js`, `spatial.js`, `hostmap.js`, `keys.js`,
`redqueen.js`), viewer presets `stacks` and `parasites`, regularities 1 and 10 revised. A claim was corrected by its control (40e: stacks are not a radiation shield);
always run the same-physics control (released back copies, no folds) before believing a difference.

Next steps, ranked:

1. **An arms race needs a good that reaches others** (43). With `transStart` mimics arise, but in an open world keys shrink to two
   letters, and in the capped world (keys cannot shrink) mimics stay at 1–3% because products stay on their maker (they rebind it in
   register). Next: products that leave their maker (e.g. a finished product may not bind the strand it was made on for a while),
   with capped keys and space (42); then whole-key recognition (a product binds only once every unit has found its letter). Read
   with `experiments/keys.js --capped` and `redqueen.js --capped`.
2. **Bigger effective populations** for graded effects: the shape races need 96×96 worlds or genomes whose shapes differ more
   (composition, not only order); two-faced letters (`backCopy` without `stack`) double births per genome and could be used as
   a speed-up of evolution in any world (with `endLoss` the back follows the face's end rule).
3. **A gene from nothing needs raw material** (unchanged): a local source of duplications at ordinary density.
4. Stacks in combination (untested): kin aggregation with four letters (`pSNuc` > 0), stacks with translation, with caps.
5. Older unfinished items as before (random chemistry heredity 32, chirality round 2 30, droplets 31, duplex seed 3 29).

Runs share four cores: keep at most four `run.js` processes (`tools/queue.sh` enforces it; a second queue with a higher cap
for light runs is fine). Measure speed in CPU time. The two old branches `claude/serene-keller-sprlt0` and
`claude/simulation-behavior-evolution-i8yy4g` are fully merged into `main` (deleting them was refused by the git proxy).
