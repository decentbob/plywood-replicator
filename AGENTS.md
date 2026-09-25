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
test.js             invariant tests (34; about 10 minutes on one core)
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
experiments/peek.js   quick look at any birth log, finished or running: births, length, top sequences per window, --has=ABA
experiments/capped.js, caplen.js, letters.js   capped-genome worlds (33, 35): genes per window, length, letter make-up
```

## src/sim.js map

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
node test.js                                    # all invariants, ~6 min
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
about 10 to 20 minutes with four running.

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

## Where the project stands (2026-09-25, evening)

The full record is `experiments/LEDGER.md` (89 experiments with verdicts, the regularities that predict outcomes, the
viability atlas, the knob index). The short version:

- Works: exact template copying and every kind of copy error from local rules (1–2); length held by cooperative docking
  plus processive fraying (13, 15); private genes selected where their pressure acts (energy `feed` 14, shield 19);
  shape selecting on sequence (15); adaptation to an environment change (14).
- **Genes accumulate, and genes arise by mutation.** With end-replication loss (`endLoss`) and bare caps (`bareCaps`) a
  two-gene genome beats its one-gene competitor wherever radiation acts (33). In dense worlds the shield gene arose by
  mutation in 3 of 3 seeds (33, old engine). **Proofreading (`proof`, 38)**, a third gene whose pressure is copying itself
  (copy errors per functional letter), cuts substitutions 3–6 times, is selected when seeded, and arises from a spare letter
  one mutation away and sweeps (8 → 89%, 2 → 73%, 2 of 2 seeds), with a speed-accuracy trade-off (births fall a third).
- **A machine of parts (34, 36).** Translation, catalysis, shared catalysts and their parasites; no product function yet makes
  length or complexity pay.
- **Shape as function (39)**, the user's preferred direction: fuel particles held in pockets, two backs at once (a mechanical
  AND). Which fold holds which fuel size is geometry (45–90° small, 30° large, 20° none, straight mid-sized by pairing), and
  among 8-mers of the same letters each fuel size has a different best sequence: a many-to-many genotype-to-phenotype map
  that no rule lists. Selection on it is so far a lead only (worlds with fuel as the only energy are fragile; fuel as a
  supplement to scarce energy, `PS_*`, running at the end of the session).
- **The engine is 2–2.5 times faster** (37): bodies jostled whole, 4 passes, no trigonometry, cell lists. Old results were
  on the old engine. Do not jam worlds (use 48×48 for "dense"). Saved states: `--save`, `--load`, the viewer's "Open state".
- Failed or parked, with reasons in the ledger: compartments and walls (16, 24, 25), recognition between strands (18, 26),
  public goods (9, 14, 17, 21), composition as a phenotype at small scale (35).

The core obstacle, restated: **the shortest viable replicator wins unless something makes length pay** (regularity 1). Three
per-length costs now have genes (radiation: shield; energy: feed with relay; copy errors: proofreading). What limits
open-endedness is the function space: each motif gene is one hand-written rule. Shape (39) is the first generic map from
sequence to function; the question now is whether it drives selection and, with several fuels, several shaped regions.

## Handoff (2026-09-25, evening): pick up here

Session of 2026-09-25 (branch `claude/zealous-wright-w26ln9`, merged into `main`). The user this session: think about what
is promising, not only the handoff list; mechanical designs and several replication modes; physics may change freely for
speed ("anything we can optimize now will reward us"), but keep shapes (no grid: "shapes I think are a very promising
direction"); test runs headless, visualization only on demand. Done: engine speed-up (37), saved states, proofreading (38),
fuel pockets (39), fixes (parent attribution, body turn), tools (`tools/killnode.sh`, `experiments/lineages.js`). The shape
options A–D were put to the user (DESIGN 15, top); B was started without an answer.

Next steps, ranked:

1. **Shape selection, properly.** Fuel as a supplement to scarce energy (`PS_*` world: capped 40×40, `nE` 16, `pReload`
   0.0004, `nU` 120, `pReloadU` 0.01, `foldA` 45, `foldB` 30) or larger worlds, 3+ seeds. Does the winner follow fuel size?
   Then mutation on: does letter order adapt? Then two fuels (`nU`, `nV`, `sizeV`, `pReloadV`): do genomes carry two
   differently folded regions when each fuel is scarce (complexity from shape)? Probes: `experiments/harvest.js` (fuel used by sequence and fuel
   size), `experiments/grip_probe.js` (fold against fuel size), `experiments/proof_capped.js`, `experiments/dense_fid.js`
   (copy fidelity of an engine setting in the dense world); `experiments/lineages.js` counts births per competing genome.
2. **Enzymes of parts** (the rest of option B): products that fold into pockets (`grip` exists), carry the charge, and deliver
   it to kin genomes through code-matched binding. Then several product kinds, several fuels.
3. **A gene from nothing needs raw material.** Proofreading arose one mutation away, not three. On the new engine the 48×48
   dense world makes almost no longer copies; find a local source of duplications (copies bridging templates happened only
   in jammed worlds).
4. Options A (folded genomes with hairpins) and C (2D crystals, a second replication mode): see DESIGN 15.
5. Older unfinished items as before (random chemistry heredity 32, chirality round 2 30, droplets 31, duplex seed 3 29).

Runs share four cores: keep at most four `run.js` processes (`tools/queue.sh` enforces it; a second queue with a higher cap
for light runs is fine). Measure speed in CPU time. The two old branches `claude/serene-keller-sprlt0` and
`claude/simulation-behavior-evolution-i8yy4g` are fully merged into `main` (deleting them was refused by the git proxy).
