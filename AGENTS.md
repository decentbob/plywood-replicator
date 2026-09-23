# Polygon Chemistry — guide for coding agents (Codex, Claude Code, others)

This is the canonical working guide; `CLAUDE.md` only imports it. Keep it current when the project changes.

An artificial-life experiment: a 2D world of small deformable polygons ("blocks") under one universal rule
table, in which template copying, mutation, selection and (the goal) **complexity emerging from simplicity**
come out of local rules, not out of code inside the creatures. Plain JavaScript, no dependencies.

Read in this order: this file, `README.md` (rules and physics as they stand), `experiments/RESULTS.md`
section 20 "Summary" and the latest sections, `DESIGN.md` sections 2 (commitments), 14 (decision log, newest
entries near the end of the list), 15 (ideas not yet tried).

## The user's rules (hard constraints and preferences)

- **Simple base rules, strictly local.** A block reads only its own type and state, which of its sides are
  bonded, and the derived state of the side it is bonded to. Communication only through connected sides.
  No global signals, no counters, no knowledge of strand length.
- **No pre-programming.** No rule may mention copy, strand, organism, genome. Those words live in comments.
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
src/sim.js          the whole simulation (browser global PolyChem, or require()); about 1,000 lines
index.html          viewer: canvas, knobs, presets, readout, event feed, click-to-inspect
run.js              headless runner: CSV every --every steps, JSON summary on stderr, --births FILE (JSONL, written
                    at the END of the run), --change T:k=v,k=v (environment change mid-run, repeatable)
test.js             invariant tests (15; about 6 minutes on one core)
build.js            single-file dist/ build of the viewer
experiments/*.sh    one script per batch; each RESULTS.md section names its script
experiments/*.js    analysis over experiments/out/*.births.jsonl (see below)
experiments/out/    CSV (committed), JSON and births JSONL (gitignored)
tools/fingerprint.js  trajectory hash, to prove a change leaves default behaviour identical
tools/screenshot.js   drive the viewer headless and screenshot it (Playwright + /opt/pw-browsers/chromium)
```

## src/sim.js map

- Constants: sides `F R K L`; types `T_A T_B T_E T_M T_C T_D` (A–D are replicator letters; E energy particle;
  M membrane block); internal states `I_DOCK I_REPEL I_TPL I_FRAY` (letters), `I_OFF I_ON` (E, and M raw/active);
  derived side states in `S` (append new ones with a new unique value; `SNAME` is built by value).
- `DEFAULTS`: every knob with a one-line comment. Per-type knobs are `<base><Letter>` (`resC`, `stiffD`,
  `bendB`, `shapeA`) read through `typeParam(p, base, t, dflt)`.
- Chemistry (the rule table): `compat` (which side pairs bond, with what probability), `_computeOpen` (which
  sides can bond at all), `_derive` (side states from internal state + bonds; context motifs CHARGE, MAKE,
  FEED, SHIELD, relay), `_transition` (all state changes, radiation, fraying, unzip, feed, binding melt,
  membrane activation), `_logBirths` (observation).
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
node experiments/motifs.js ABA,CDC experiments/out/G3_*.births.jsonl --window=250000
node experiments/composition.js | pairs.js | alternation.js | turnover.js | length_table.js | mutation_rates.js ...
NODE_PATH=$(npm root -g) node tools/screenshot.js /tmp/v.png '{"preset":"evo"}' 10000
```

Speeds (one core, idle machine): about 800 steps/s at 60×60 with 1,100 blocks, 1,200 at 40×40 with 540,
300 to 350 at 80×80 to 100×100. Four cores: run batches with `xargs -P 4`; six processes on four cores
halves everyone. A 1,000,000-step small-world run takes 20 to 45 minutes; an 80×80 one several hours.

## Working conventions and pitfalls

- Long runs: write outputs to the scratchpad, copy into `experiments/out/` when done (a stop hook complains
  about files changing under git mid-run). The births JSONL only appears when a run ends.
- `pkill -f <pattern>` can match your own shell's command line and kill it; kill by PID or a narrow pattern.
- "× chance" baselines are inflated by founder descent (seeds like `ABBABA` carry motifs; low mutation keeps
  founder make-up). Always compare against a same-seed control run.
- Two seeds is a lead, not a result. Say so in RESULTS.
- Four-letter worlds copy about four times slower per strand (each site needs one letter of four).
- Octagon blocks leak (chimeras); stiffness below ~0.3 lets copies docked on neighbouring templates link.
- Every RESULTS section: the command/script, a table, what it says, and what it does not say.
- Commit often with descriptive messages; push to the session's branch.

## Where the project stands (2026-09-23)

Works, measured (RESULTS sections in brackets):
- Exact template copying from local rules; copy errors of every kind from soft rules (1–2).
- Length selected in an open population: cooperative docking (a lone docked monomer falls off) plus
  processive fraying (strands die whole instead of eroding) hold mean length 4–5.4 against 2.3 (13, 15).
- A private energy motif (`feed`: `ABA` arms its neighbours) is selected, 1.7× its control, four seeds; a
  public one (`motif`: `ABA` charges particles into the medium) is not (14).
- Adaptation to an environment change: when energy turns scarce the motif rises to 4–5× chance only where
  it pays (14).
- Block shape selects on sequence: a strongly wedge-shaped `B` is purged; a mildly wedge-shaped one is kept
  but never placed next to another `B` (15).
- Radiation selects a shield gene (`CDC`, `shield`) at once, 8–21× chance (19).

Tried and failed, with the reason (so they are not retried blindly):
- Compartments by chance (16): rings close around strands, but enclosures last less than a generation and
  rings never divide. Membrane made by strands (`make`, two versions): rings do not form around their makers.
- Lock-and-key binding between strands (18): with two letters, general stickiness, diversity falls; the
  zipper variant found no specificity window; with four letters, complementary strands rarely meet.
- Gene accumulation (19): under any pair of pressures genomes shrink to 2–3 units; no genome kept both the
  energy and the shield gene, even with the relay (one motif serves the whole strand) and ligation.
- Spend rule (templates re-arm after every copy): half of births became mutants; removed (14).

The core obstacle, stated once: **every pressure in this world costs long genomes more than short ones**, so
anything that needs several genes in one genome loses to dimers. Biology's answer is compartments (group
selection of several short strands in one enclosure: the stochastic corrector).

## Next steps, ranked (details in DESIGN.md section 15)

1. **Tethered compartments.** Membrane that stays with the lineage that made it and divides: a raw block
   anchored on a MAKE back keeps the anchor; recruitment only extends arcs that are anchored (not any active
   block anywhere), so each ring is grown by the strands inside it; a ring grown past its natural size and
   broken twice by radiation closes into two, each with its share of contents. Then test the stochastic
   corrector: an energy-gene strand and a shield-gene strand in one ring vs either alone. All state changes,
   read through bonded sides.
2. **Viewer presets that show what evolves**: shield genes under radiation, the energy gene when energy turns
   scarce (the viewer has no `--change`; a button that applies an environment change would do), shape spacing.
3. **Bigger populations** (80×80 and up): the motif economy survived there where small worlds collapsed,
   mostly through size; gene combinations might too. Slow: several hours per run.
4. Longer list: DESIGN.md section 15.
