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
src/sim.js          the whole simulation (browser global PolyChem, or require()); about 1,350 lines
src/rchem.js        random chemistry: Sim with its rule table replaced by a random one (RChem, randomTable, copyTable)
index.html          viewer: canvas, knobs, presets, readout, event feed, click-to-inspect
run.js              headless runner: CSV every --every steps, JSON summary on stderr, --births FILE (JSONL, written
                    at the END of the run), --change T:k=v,k=v (environment change mid-run, repeatable)
test.js             invariant tests (28; about 10 minutes on one core)
build.js            single-file dist/ build of the viewer
experiments/*.sh    one script per batch; each RESULTS.md section names its script
experiments/*.js    analysis over experiments/out/*.births.jsonl (see below)
experiments/out/    CSV (committed), JSON and births JSONL (gitignored)
tools/fingerprint.js  trajectory hash, to prove a change leaves default behaviour identical
tools/screenshot.js   drive the viewer headless and screenshot it (Playwright + /opt/pw-browsers/chromium)
tools/snap.js         render a Sim in Node to PNG (colorOf callback for custom colours)
```

## src/sim.js map

- Constants: sides `F R K L`; types `T_A T_B T_E T_M T_C T_D T_X T_P T_Q T_J T_G` (A–D replicator letters, P/Q caps,
  all in `LETTERS`; E energy particle; M membrane block; X ray; J hub; G droplet block); `hand` (chirality) is a
  per-block property like type; internal states `I_DOCK I_REPEL I_TPL I_FRAY` (letters), `I_OFF I_ON` (E, and M raw/active);
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
- `main` is the default branch. Commit often with descriptive messages; push to the session's branch and merge into `main`
  when a piece of work is done (delete merged branches, so `main` stays the only long-lived one).

## Where the project stands (2026-09-24)

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
- Flush polygons (23): `snapCorners` brings pinned corners together exactly (blocks deform, the shape force
  pulls back); `maxStrain` lets a membrane bond or a lone docked monomer go when deformed too far. Copying stays
  exact; an overlong membrane splits into rings of about its natural size (an arc of twice the size: two rings
  in 15 of 20 seeds). The viewer uses both by default. (The user's direction, 2026-09-23.)
- Walls made by their strands (24): with `make` + `tether` a strand carrying `BAB` anchors membrane on its back
  and grows a wall around itself; with `memLinkTol` 0.3 the wall closes around its maker in 20 of 20 seeds within
  about 12,000 steps, stays closed for 10,000 to 50,000 and opens under strain. `memPerm` lets monomers through.

Tried and failed, with the reason (so they are not retried blindly):
- Compartments by chance (16): rings close around strands, but enclosures last less than a generation and
  rings never divide. Membrane made by strands (`make`, two versions): rings do not form around their makers.
- Lock-and-key binding between strands (18): with two letters, general stickiness, diversity falls; the
  zipper variant found no specificity window; with four letters, complementary strands rarely meet.
- Gene accumulation (19): under any pair of pressures genomes shrink to 2–3 units; no genome kept both the
  energy and the shield gene, even with the relay (one motif serves the whole strand) and ligation.
- Spend rule (templates re-arm after every copy): half of births became mutants; removed (14).
- Slow polymers (`mobS`, 21): kin clusters form, but the public `ABA` motif is still lost in 1 run of 3.
- A seeded two-gene genome (`ABACDC`, 22) is not kept even without pressure: it falls apart into pieces of
  itself, each a replicator, which out-copy it. Any fragment of a genome competes with it.
- Walls (24, 25): made by and tethered to their makers, closing, sealing (with slow membrane `mobM` 0.5 and slow
  contents: letters `mobS` 0.6, energy `mobE` 0.2, rays `mobX` 0.08). In every selection test (energy plentiful
  or scarce, rays) making a wall was selected against or the walled world died: walls are slow to build, seal only
  when everything moves slowly, then close only around 3-unit makers, and shut the maker's copies in. Note: at
  default mobilities walls leak (energy, rays and strands pass), so section 24's energy rounds measured cost only.
- Cutting (26): a `BAB` template bound face to face to another strand cuts it. In two letters the cutter binds its
  own copies (alternating sequences are self-complementary) and is selected against.
- Tried and removed: polygon-exact contacts (no effect, 2.3× slower), fluid membrane `pSwap`, mechanical breaks
  inside a copy in progress (strands shatter into replicating fragments) (23).

- Double strands (29): binding without heat collapses length to about 2.3; heat cycles restore it, no gain over no binding.
- Chirality (30): a racemic world stays racemic with hands fixed for life (round 1); Frank's conditions not yet run.

The core obstacle, stated once: **every pressure in this world costs long genomes more than short ones**, and
any fragment of a genome is itself a replicator that out-copies it (22), so anything that needs several genes
in one genome loses to its pieces. Biology's answer is compartments (the stochastic corrector); here they have
not paid (24, 25). Ecology (predation by recognition, 26) is being tried as a route that needs no long genomes.

## Handoff (2026-09-24, end of a long session): pick up here

All code below is committed on branch `claude/serene-keller-sprlt0` (not yet merged into `main`; ask the user before
merging). Background batches were stopped at the handoff; partial outputs are in `experiments/out/` and RESULTS 29–32.
Unfinished, in order of value:

1. **Random chemistry (RESULTS 32)**, the user's latest question. Run `node experiments/autocat.js 55 57 4 15 1 54` (does the
   commonest assembly of the most ordered tables beget itself? compare with `--control`), then screen the remaining tables
   (`node experiments/rsearch.js 31 50` and `81 100`, the file keeps indices 0–30 and 50–65 or so). Report to the user
   whether any random table passes the heredity test. The viewer's "random chemistry" preset shows any table by its seed.
2. **Chirality round 2** (RESULTS 30): `ROUND=2 OUT=... P=4 experiments/chiral.sh` (Frank's conditions: `pRacem`,
   small `pMixLink`, `pMisDock`), 2 seeds; `node experiments/hand.js <births files>`. Round 1 seed 2 too.
3. **Droplets and the public motif** (RESULTS 31): `experiments/droplets.sh`, compare with section 21.
4. **Double strands** (RESULTS 29): seed 3 and `DX_bindheat_2` (`experiments/duplex.sh`, edit the seed list).
5. **Search round 2** (RESULTS 27): 53 of 80 worlds in `experiments/out/search_2_partial.jsonl`; summarize with
   `node experiments/search_summary.js experiments/out/search_2_partial.jsonl --by=enrich`, finish indices missing from it
   (`node experiments/search.js <from> <to> --round=2`), then round 3 (`--round=3`: folding, caps, ligation).
6. The walker/helicase block (DESIGN 15, ideas from reality) is designed in words only.

Runs share four cores: keep at most four processes (the last session ran 17 and everything crawled).

## Next steps, ranked (details in DESIGN.md section 15)

1. **Arms race with four letters** (26, running on 2026-09-24): a cutter whose genome uses one letter of each
   binding pair (A/C) cannot bind its own kind; does it spread, do prey shift tribe (AC, AD, BC, BD), does
   `cutRelay` (the whole cutter strand is the key) give an open-ended race? `tribes.js`, `who_cuts.js`.
2. **The fragment problem** (22): any piece of a genome is a viable replicator. A local rule under which short
   pieces cannot replicate on their own would let genomes keep several genes.
3. Compartments are parked (16, 24, 25): every part works, together they do not pay. If resumed: faster wall
   building (pre-made vesicles that encapsulate by chance, grow and split by strain) rather than recruitment.
4. **Stranger blocks for the search** (the user's idea, 2026-09-24): block types not thought of or set aside before,
   each behind a knob so `search.js` can draw them: branching blocks (three or more lateral sides: 2D organisms),
   two-faced blocks (template on face and back), blocks whose shape depends on their state (curl as template,
   straighten while copied), free catalyst blocks that speed a reaction where they touch without being used up,
   extremes of existing properties (giant or tiny, very soft, ray-proof or fragile, very fast or slow letters),
   poisonous blocks that block faces or break bonds.
5. Longer list: DESIGN.md section 15.
