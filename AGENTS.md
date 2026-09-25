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
src/sim.js          the whole simulation (browser global PolyChem, or require()); about 1,400 lines
src/rchem.js        random chemistry: Sim with its rule table replaced by a random one (RChem, randomTable, copyTable)
index.html          viewer: canvas, knobs, presets, readout, event feed, click-to-inspect
run.js              headless runner: CSV every --every steps, JSON summary on stderr (written when the run ends), --births FILE
                    (JSONL, appended every --every steps, so a run in progress or a stopped one has its births so far),
                    --change T:k=v,k=v (environment change mid-run, repeatable); per-type knobs (--mobC, --fold1) accepted;
                    --save FILE (the whole world state, rewritten every interval: open it in the viewer, or continue it) and
                    --load FILE (continue a saved world; knobs given override its own: a branch under a changed rule)
test.js             invariant tests (32; about 12 minutes on one core)
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

Speeds (one core, idle machine): about 800 steps/s at 60×60 with 1,100 blocks, 1,200 at 40×40 with 540,
300 to 350 at 80×80 to 100×100. Four cores: run batches with `xargs -P 4`; six processes on four cores
halves everyone. A 1,000,000-step small-world run takes 20 to 45 minutes; an 80×80 one several hours.

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

## Where the project stands (2026-09-25)

The full record is `experiments/LEDGER.md` (80 experiments with verdicts, the regularities that predict outcomes, the
viability atlas, the knob index). The short version:

- Works: exact template copying and every kind of copy error from local rules (1–2); length held by cooperative docking
  plus processive fraying (13, 15); private genes selected where their pressure acts (energy `feed` 14, shield 19);
  shape selecting on sequence (15); adaptation to an environment change (14).
- **Genes accumulate, and a gene arose from nothing (33).** With end-replication loss (`endLoss`: pieces of a genome die
  out) and bare caps (`bareCaps`: a genome must carry the energy gene to re-arm), a two-gene genome beats its one-gene
  competitor wherever radiation acts (2 seeds, 4 environments). In dense worlds (400 letters of each kind, where copies
  bridging two templates make duplications common) the shield gene arose by mutation inside `PABAQ` in 3 of 3 seeds and
  spread, and shielded genomes then expanded from 5 to 10–13 units. At ordinary density, or with four times the population,
  it never arose (0 of 7 runs). Density, not population size, supplies the raw material.
- **A machine of parts (34, 36).** Translation (`translate`): a genome's backs template a second polymer (product blocks
  `1`–`4`) by a code, exactly. With `catalysis` copying needs the product; with a shared catalyst (`bindAny`) parasites
  take 60–70% of births and coexist with the makers; graded specificity (`pMisMelt`) holds them to 5–20%. No product
  function tried yet makes length or complexity pay (34d, 34e).
- Failed or parked, with reasons in the ledger: compartments and walls (16, 24, 25), recognition between strands (18, 26),
  public goods (9, 14, 17, 21), composition as a phenotype at small scale (35).

The core obstacle, restated: **the shortest viable replicator wins unless something makes length pay** (ledger
regularity 1). What has made length pay so far is a gene that removes a per-length cost (the relayed shield) in a world
dense enough to supply duplications. The next step is to see whether that repeats: a third gene in expanded genomes.

## Handoff (2026-09-25, end of session): pick up here

Session of 2026-09-24/25 (branch `claude/modest-newton-esla1t`, merged into `main`). Locality made the fundamental rule;
relayed signals one block per pass; `endLoss`, `bareCaps`, `radBand`, translation and catalysis, `bindAny`, `pMisMelt`;
RESULTS 33–36; `LITERATURE.md`; the ledger and workflow tools (`tools/queue.sh`, `experiments/peek.js`, incremental birth
logs, `tools/ledger_index.js`). All outputs are in `experiments/out/`. The user's view at the end: the dense-world gene
origin is promising; mechanical directions interest them; screen short, confirm long; do not run worlds without a question.

Next steps, ranked (reasons in `experiments/LEDGER.md`, "Open gaps", and `DESIGN.md` section 15):

1. **A third gene in expanded genomes.** Dense capped world (the `TF_dense` setup) seeded with `PABACDCQ` (skip the slow
   origin), plus a third pressure with a private gene not yet in the world. Does the third gene arise and spread in the
   spare letters? That is the test of open-ended accumulation. Needs a third private function: candidates are `act`
   (monomer activation, but it is public as built) or a new private rule; design it local and simple.
2. **Mechanical directions** (the user's interest): crystal ribbons (a second replication mode where fragments carry the
   whole information), a polymerase block (a copier made of parts), recombination by template switching (`pSwitch`).
   Each is designed in words in DESIGN 15.
3. **The translation machine in a dense world**: does it gain parts where length is cheap? And a product function that
   pays by degrees (DESIGN 15, F1, F2).
4. Older unfinished items (each a screen of an hour or two): random chemistry heredity test (32: `node
   experiments/autocat.js 55 57 4 15 1 54`, compare `--control`), chirality round 2 (30: `ROUND=2 experiments/chiral.sh`),
   droplets and the public motif (31: `experiments/droplets.sh`), double strands seed 3 (29: `experiments/duplex.sh`),
   search round 2/3 (27: `experiments/search.js`).

Runs share four cores: keep at most four `run.js` processes (`tools/queue.sh` enforces it). The two old branches
`claude/serene-keller-sprlt0` and `claude/simulation-behavior-evolution-i8yy4g` are fully merged into `main`; deleting
them from here was refused by the git proxy, so they remain (harmless; the user can delete them on GitHub).
