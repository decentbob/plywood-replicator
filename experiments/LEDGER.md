# Experiment ledger

What has been tried in this world, what happened, and what it predicts. For an agent starting work: read the
regularities first (they say what will probably happen to a new idea), then the viability atlas (so a new world lives),
then look up the mechanisms you plan to use in the table and the knob index. Add a row for every new experiment, and
revise a regularity when an experiment breaks it. Details are in `RESULTS.md` (section numbers in the first column).

Verdicts: **works** (did what was asked, measured) · **negative** (tested, did not happen or was selected against) ·
**inconclusive** (ran, data cannot decide) · **lead** (promising, too few seeds or steps) · **partial** (not finished) ·
**superseded** (replaced by a later mechanism or engine). Sections 1–14 ran on the rigid engine (removed 2026-09-23).

## Regularities (what predicts outcomes here)

Each is backed by the rows cited; treat it as a strong prior, not a law.

1. **Shortest wins unless something makes length pay.** Every open population shrinks toward the smallest viable
   replicator: dimers (3, 4, 5b, 19d), `CDC` alone (19), `PQ` (33a), the minimal `AA` cooperator (36c), and catalysis does
   not change it (34d). Length has held only with cooperative docking plus processive fraying (13b, 15b), ligation
   balanced by fraying (3b, 27b: accumulation, not function), or a gene that removes the cost of length (33i, 33j). Three
   such costs have genes now: radiation per bond (shield), energy per unit (feed with relay), copy errors per functional
   letter (proofreading, selected when seeded, 38b). A second mode of replication does not change it by itself: stacks (40b)
   hold length only by hoarding (long rows zipped into stacks are immortal, the letters lock up, births fall), and stacks that
   turn over let short rows win again (40c). More copy sites per strand (two-faced letters) make a population robust (40e),
   not longer.
2. **Any viable fragment of a genome defeats a genome that needs several genes.** (22, 19d, 33a'.) Make pieces
   sterile first (end loss on capped strands, 33a–d), and make the smallest viable genome already carry one gene (bare
   caps, 33b), or genes will not accumulate.
3. **A gene pays only where its pressure acts, and only if the benefit stays with its carrier.** Private goods are
   selected (feed 14b, shield 19, relay 19c, 33b); public goods are not, in any world size or mobility tried (9, 14, 17,
   21); a shared catalyst feeds parasites, which take the majority but not everything (36a, 36b); graded specificity
   (a good that favours kin) holds parasites down (36c). In space, creeping polymers keep a shared catalyst near its makers and
   parasites about ten points lower (42); a catalyst that carries its maker's key rebinds its maker and stays, so it is private in
   practice and mimics of the key cannot spread (43b).
4. **Without its pressure a gene decays by point mutation, slowly** (shield 74 → 32% of births over 500k steps, 33c):
   genes are kept for a few hundred thousand steps after their pressure ends.
5. **New genes need raw material: length variation comes from density, not population size.** At ordinary density
   genome length almost never changes (1–2% of capped births) and no gene arose in 7 million-step runs up to 240 genomes
   (33f); at 400 letters of each kind length varies ten times as often (33h) and the shield gene arose in 3 of 3 seeds
   (33i). Duplications come from copies bridging two templates, which crowding makes common (28c, 33h).
6. **Once shielded, genomes expand** (5 → 11–13 units) where monomers are plentiful; not without the shield rule, not at
   200 letters (33i, 33j). A cost removed lets length drift up: raw material for further genes.
7. **Geometry acts as a switch, not a gradient.** Wedge letters stop copying outright (15c, 35: `bendC` 15° never
   copied); a strongly wedged letter is purged, a mild one kept apart from its own kind (15d); folding letters copy
   exactly (28b); a folding product straightens as it binds, so its free shape has no effect (34e). Mixed sizes break
   copying (28). Slow letters copy about five times slower (35). Stiffness below ~0.3 lets neighbouring copies link.
   Verify that a proposed shape change physically happens: at stiffness 1 without `snapCorners`, bonded shape matching
   is skipped, so changing the selected rest shape does nothing until the block becomes unbonded (45a).
8. **Walls and compartments have not paid in any form** (11b, 12b, 16, 16b–d, 24, 24b, 25d): they are slow to build,
   seal only when everything is slow, shut copies in, and walled worlds died. Parked, not disproved.
9. **Recognition between strands has not given specificity** (18, 18b, 26, 26b): with two letters binding is
   self-complementary (autoimmune cutters); with four, partners rarely meet.
10. **Small populations are drift-dominated.** Below about 100 births per 50,000 steps, composition effects are
    swamped (35); founder make-up inflates "× chance" (always compare with a same-seed control). With 20 to 30 genomes per world,
    races between genomes differing only in letter order swing from 0 to 100% per seed, and graded effects (pocket fit, 41) stay
    invisible even at 12 seeds; the effects that were selected cleanly were all-or-nothing (shield under radiation, proofreading).
    Run a same-physics control (e.g. no folds) beside every race: in 41a it matched the "effect".
11. **Most answers show early.** Winners were clear within 50,000 of 500,000 steps (33b); run long only for slow decay
    or rare events (33c, 33i).
12. **Release is not delivery, and relative success is not exploitation.** A retracting product latch can reduce original-block
    retention from nearly 100% to 39%, yet reduce productive host occupancy from 60% to 2% and capped births from 20 to 8
    (44e, four seeds). Non-producer share rises mainly because hosts lose births. Products must survive the journey and bind
    usefully afterwards. Product durability alone gives a small transport lead without reducing total births (44e), not evidence
    of evolved complexity. Measure recipient occupancy and include a no-binding control before calling non-producers parasites.

## Viability atlas (will a new world live?)

- **Copying speed**: about 1,200 steps/s at 40×40 with ~540 blocks on an idle core, 800 at 60×60 with 1,100, 100–300 at
  80×80 with 4,000+; four runs at once each slow by roughly a third. Capped four-letter worlds of 1,000–1,700 blocks run
  at 150–400 steps/s.
- **Radiation** (`pBreak`): capped 8–9-unit genomes without a shield die at 5e-5 (35); with the relayed shield they
  live at 3e-5 (33b); unshielded capped worlds need ≤ 1e-5 to 2e-5 (35). Per-bond: long genomes pay more.
- **Caps** (40×40): 30 or 60 of each kind die out under radiation 3e-5 (33h); 120 live. **Letters**: 100 of each die,
  200 live, 400 give length variation (33h). Uncapped two-letter worlds: 150–256 of each is typical.
- **Energy**: 60 particles at reload 0.002 is plentiful; 16 at 0.0004 is scarce (limits births, selects `ABA` with
  feed); 12 at 0.0003 plus radiation collapses populations (19, 22).
- **Turnover is required**: without fraying or another death, templates lock up material and copying stops (1, 28c,
  34 probes). Capped worlds need open ends fragile (`pFray` 0.001) and caps not (`capFray` 0.03) (33).
- **Seeds must be viable under the rules**: a translation seed needs adjacent coded letters or it makes no product
  (36b); with bare caps a seed needs `ABA`; with `pUndock` 0 half-finished copies can lock templates.
- **Mutation**: `pSoft` 0.002 is gentle, 0.01 fivefold (on the new engine half or more of 11-unit capped copies then carry a
  substitution, 38a); on the old engine iters 8 added about 2% copy errors (33, DESIGN 15).
- **Stacks** (40): held stacks (`stackHold`) lock the letters up at zip (`pSBind`) 0.03 or more with a nucleation barrier, at 0.1 or
  more without; treadmilling stacks (default) never did. Without a barrier (`pSNuc` -1) two-letter strands aggregate.
- **Engine (since 2026-09-25, section 37)**: `bodyJostle` with 4 passes; about 2x faster. Do not jam a world (blocks covering more
  than about 90% of it): the section 33 dense world (40×40, 400 of each letter, 240 caps) loses a letter in a third of its copies
  at 4 passes; use 48×48 (97% exact) or `iters` 8–16. Old step counts do not carry over exactly.

## Experiments

| § | Experiment | Question | Mechanism / knobs | Verdict | Key number | Script | Points to | Notes |
|---|---|---|---|---|---|---|---|---|
| 1 | Exact template copying | Do local rules copy a seed exactly? | every soft knob 0 (`pSoft`, `pCapture`, `pFray`) | works | 29 and 36 births, all exact (2 seeds, 30k steps) | test.js | material lockup without turnover (2) | Rigid engine (removed 2026-09-23); still checked by test.js |
| 2 | One variation source each | What does each soft knob do alone? | `pSoft`, `pCapture`, `pFray` | works | `pFray` alone: 4,027 births vs 83, length collapses to 2.06 | regimes.sh | what holds length up (3) | Rigid engine (removed) |
| 3 | Energy supply vs length | Does the energy regime hold length up? | `energyMode` unit/strand, `nE`, `sun` | negative | mean length 2.45 to 2.75 in every setting | length_selection.sh | cooperativity (5) | Rigid engine (removed); strand mode and sun patch later removed |
| 3b | Ligation equilibrium | Does ligation keep long strands in an open population? | `pLigate` 0.005, 0.02 | lead | mean length 4.66, max 19, 46 seqs at 0.02 | length_selection.sh | ligation plus cooperative docking | Rigid engine (removed); one seed; chemistry, not selection |
| 4 | Dimer vs 6-mer race | Which wins head to head? | `energyMode`, `nE`, `pFray` | negative | dimers out-copy 6-mers 10:1 to 69:1 | competition.sh | cooperative docking (5) | Rigid engine (removed); 2 seeds per setting |
| 5 | Cooperative docking race | Does an unstable lone monomer favour long templates? | `pUndock` | works | race flips at 0.02 to 0.05; 1:9 for the 6-mer at 0.1 (2 seeds) | cooperativity.sh | evolutionary regime (5b) | Rigid engine (removed) |
| 5b | Undocking with turnover | Does undocking lift length in an open population? | `pUndock`, `pSoft`, `pCapture`, `pFray` | negative | 2.28 at 0.02; at 0.1 one seed died, the other 3.39 | cooperativity.sh | fraying vs density vs undocking; unzip (13) | Rigid engine (removed); 2 seeds |
| 7 | Seedless origins | Does replication start with no seed? | `pSpont` | works | first birth after 1,063 to 15,015 steps in 6 of 6 runs | channels.sh (`O_`) | dimers dominate what emerges | Rigid engine (removed) |
| 8 | Radiation, unequal resistance | Does bond toughness select content? | `pBreak`, `resB`, `pLigate` | works | tough B 26–29% of births vs 4–7% in control (3 seeds) | channels.sh (`X_`) | length stays 2 | Rigid engine (removed) |
| 9 | Public energy motif | Is an `ABA` charging motif selected? | `motif`, `pReload` 0 | negative | `ABA` 0.015–0.025 per block in both arms | channels.sh (`M_`) | benefit must stay with carrier (space, compartments) | Rigid engine (removed); 2 seeds |
| 10 | Hinged rings | Do hinged chains close into rings? | `hinge`, `hingeMax`, `pLigate`, `pBreak` | superseded | 4-unit sterile rings; ~40 seqs, 4.4–5.0 bits (3 seeds) | rings.sh, rings2.sh | folding letters (28) | Rigid engine (removed); hinge removed, scripts deleted |
| 10b | Corner slack | Does trapezoid slack help copying? | `slack` | superseded | 0.1: births +25%, exact; 0.2: chimeras | rings.sh, rings2.sh | polygon softness (15) | Rigid engine (removed); 2 seeds, 20k steps |
| 11 | Membrane self-assembly | Do M blocks assemble into rings? | `nM`, `memAngle`, `memFlex`, `resM` | superseded | 41 rings of ~6 by 100k steps (60°) | membranes.sh | polygon membrane wedges (15) | Rigid engine (removed); script deleted |
| 11b | Enclosure by chance (rigid) | Do rings close around strands? | `nM`, `pBreak`, `resM`, `pSpont` | negative | no ring ever held a strand | membranes.sh | M nucleating on strands | Rigid engine (removed); script deleted |
| 12 | Preset choice: turnover | Which turnover keeps strands long and diverse? | `pFray`, `pBreak`, `resB`, `pUndock`, `pLigate`, `slack` | works | fraying + ligation: length 4.33, 40 seqs; radiation: 2.3–2.5 | presets.sh | "evolution" preset | Rigid engine (removed); one run each, script deleted |
| 12b | Larger rings, protocells | Do larger rings enclose strands? | `memAngle` 30°, 22.5°, `motif` | inconclusive | 14-block rings hold a strand ~1 per sample | presets.sh | membrane nucleation on strands | Rigid engine (removed); one run each |
| 13 | Deletion ratchet | Does end fraying keep strands short? | `pFray`, `pUndock` | works | 1,092 frays for 602 births; length ≤ 3.7 | unzip.sh | processive fraying (13b) | Rigid engine (removed); one seed each |
| 13b | Processive fraying | Do unzip + cooperative docking select length? | `pUnzip`, `pUndock`, `pFray` | works | mean length 4.0–5.4 vs 2.3 with either rule alone (3 seeds) | unzip.sh | does sequence pay (14) | Rigid engine (removed); held on polygons (15) |
| 14 | Public motif, energy varied | Is a public `ABA` selected when energy is plentiful or scarce? | `motif`, `mobE`, `nE`, `pReload` | negative | 1.3–1.9x chance vs 1.7 in control (scarce) | motif.sh | private motif | Rigid engine (removed); 2 seeds |
| 14b | Private energy motif | Is a motif that feeds its own strand selected? | `feed`, `pSoft`, `pCapture` | works | 1.7x control; 0.146–0.192 vs 0.050–0.101 per block (4 seeds, no overlap) | long.sh | alternation emerges; environment change | Rigid engine (removed); 200k probe inconclusive |
| 14c | Environment shift | Does a population adapt when energy turns scarce? | `feed`, `--change pReload` | works | motif 3.8–5.0x chance after switch vs 0.4–1.3 control | shift.sh | — | Rigid engine (removed); 2 seeds |
| 14d | Spend rule | Does re-arming per copy make the motif pay? | `spend`, `feed` | negative | faithful births 47–56% vs 72% | long.sh (`L1S_`) | rule removed | Rigid engine (removed) |
| 15 | Polygon engine copying | Do deformable polygons copy exactly? | `physics` poly, `stiffA` | works | exact at stiffness ≥ 0.5; 18 unfaithful at 0.05 | poly_probe.js | — | 2 seeds, 20k steps |
| 15b | Length selection on polygons | Does section 13 hold on polygons? | `pUnzip`, `pUndock`, `stiffA` | works | 3.83, 3.70 at `pUndock` 0.1 and 4.85 at 0.2 vs 2.50 | poly_probe.js | — | `PZ_` runs; 1–2 seeds per setting |
| 15c | Shape probes | Does block shape affect copying? | `bendA`, `bendB`, `shapeA` oct | lead | B bend 30°: 0 births; 10°: faster than square | poly_probe.js | shape selection test | 2 seeds, 20k steps |
| 15d | Shape selects sequence | Does a wedge-shaped letter change genomes? | `bendB` (20°, 10°) | works | strong wedge: B 2–8% of newborn blocks vs 50%; mild: `BB` 0.02–0.04x chance | shape.sh | — | 2 seeds each |
| 16 | Compartments by chance | Do rings hold strands long enough to matter? | `nM`, `memAngle`, `pBreak`, `resM` | negative | up to 10 rings with strands, but rings open far within a generation | encl.sh | ring division | One seed each |
| 16b | Ring growth and split | Do opened rings grow and divide on their own? | `nM`, `memAngle`, `pBreak` | negative | ring sizes 8–18, never 22 | ring_growth.js | membrane made continuously | — |
| 16c | Membrane made by strands | Does `make` put rings around their makers? | `make`, `pMemDecay` | negative | anchored: 395 of 400 blocks active by 40k steps | make_probe.js | tether (24) | — |
| 16d | Division by overgrowth | Does an overgrown ring pinch in two? | `memAngle`, `stiffM` | negative | no ring pinches (12–20 blocks) | ring_shape.js | strain limit (23) | — |
| 17 | Space and a public good | Does a larger world keep the public motif? | `motif`, `mobE`, `W`, `H` | inconclusive | small world collapses 2 of 3; 80x80 sustained 4 of 4 | space.sh | slow polymers (21) | Rescue mostly size; space not shown |
| 18 | Lock-and-key binding | Does strand binding keep diversity high? | `pHyb`, `pMelt` | negative | 18 seqs vs 30–33 in control at `pHyb` 0.2 | binding.sh | longer key (18b) | 2 seeds |
| 18b | Zipper binding | Is there a window where only perfect matches hold? | `pMeltEnd` | negative | 13.7 perfect vs 12.7 random bound at 0.004 | binding.sh | longer strands or larger alphabet | Parked, knobs off |
| 19 | Shield gene | Does radiation select `CDC`? | `shield`, `pBreak`, `nC` | works | `CDC` 13–21x chance (G_rad_1); 8–11x both seeds with relay | genes.sh | two genes in one genome | Round 1 one seed |
| 19b | Energy gene, four letters | Does scarce energy select `ABA`? | `feed`, `nE`, `pReload` | inconclusive | rose to 6–11x in one seed, then lost; never in the other | genes.sh | narrow energy band | 2 seeds |
| 19c | Relay | Does a relayed gene pay for genome length? | `relay`, `feed`, `shield` | works | shield genomes 2.8–3.4 units vs 2.5 without relay | genes.sh | both genes (19d) | 2 seeds |
| 19d | Both genes, ligation, band | Do genomes accumulate both genes? | `relay`, `pLigate`, `nE`, `pBreak` | negative | both-gene genomes ≤ 8% of long births, gone by the end | genes.sh, motifs.js | compartments (stochastic corrector) | Band search one seed per cell |
| 21 | Slow polymers | Does limited dispersal rescue the public motif? | `mobS`, `motif`, `mobE` | negative | motif lost in 1 of 3 runs at every mobility | viscous.sh, assort.js | larger world; droplets (31) | Small worlds, ~100 strands |
| 22 | Keeping a two-gene genome | Is a seeded `ABACDC` kept? | `feed`, `shield`, `relay` | negative | last `ABACDC` birth at 13k to 222k steps, 6 of 6 runs | keep.sh | fragment problem: longer minimum replicator or compartments | 2 seeds per environment |
| 23 | Snapped corners, copying | Can bonds be flush and strain-limited with exact copying? | `snapCorners`, `maxStrain`, `maxStrainStrand` | works | 140 and 159 births, none unfaithful (4 seeds) | arc_split.js | — | Any break inside a copy wrecks fidelity; polygon-exact contacts removed |
| 23b | Membrane division by strain | Does an overlong arc split into rings? | `maxStrain`, `snapCorners`, `stiffM` | works | arc of 24: two rings in 15 of 20 seeds | arc_split.js | do contents split | `pSwap` tried and removed |
| 24 | Tethered walls | Do tethered walls enclose their makers? | `tether`, `make`, `memPerm` | negative | rings with strands 0–1.2 vs 1.4–2.3 fixed stock | cells.sh, tether_probe.js | do walls pay (24b) | 3 seeds |
| 24b | Do walls pay | Is wall-making (`BAB`) selected? | `tether`, `motif`, `memLinkTol`, `nE` | negative | `BAB` falls to ~0.1x chance with walls vs ~2x without | walls.sh | sealing walls (25) | Walls leaked (25): measured cost only |
| 24c | Wall closure | Can a wall close around its maker? | `memLinkTol`, `stiffM`, `memAngle` | works | 20 of 20 closed at catch 0.3, ~12k steps | closure.js | wall selection round 2 | 20 seeds per row |
| 25 | Sealing walls | What lets a closed ring keep particles in? | `mobM`, `mobE`, `mobS` | works | membrane 0.5 + energy 0.2: 0 of 3 out | leak.js | rays as particles | 3 particles per test |
| 25b | Rays as particles | Does a closed ring shield its contents? | `nX`, `rayHit`, `sizeX`, `mobX` | works | 0 hits inside vs 594 outside | ray_shield.js | wall selection with rays | — |
| 25c | Closure at sealing mobilities | Which makers close walls when things move slowly? | `mobM`, `mobS`, `memLinkTol` | works | `BAB` 19 of 20 closed, `ABBABA` 4 of 20 | closure.js | cell size limits genome length | 20 seeds per row |
| 25d | Walls against rays | Are walls selected under rays? | `tether`, `nX`, `rayHit`, `mobM` | negative | walled worlds extinct 3 of 3; unwalled live as dimers | rays.sh | compartments parked | 3 seeds each |
| 26 | Cutting, two letters | Is a cutter motif selected? | `cut`, `cutMotif`, `pCut`, `pHyb`, `mobS` | negative | `BAB` ends at 0.1–0.2x chance in all 3 cutting runs | cut.sh, who_cuts.js | four letters (cutter autoimmune) | 3 seeds |
| 26b | Cutting, four letters | Does an A/C cutter spread? | `cutMotif` `CAC`, `pHyb`, `mobS` | inconclusive | 5 to 36 cuts per million steps | cut.sh, tribes.js | a way to make the cutter motif common | 3 seeds; a null result |
| 27 | Random world search | Does a random mix of mechanisms find long multi-gene genomes? | all built knobs, drawn at random | lead | world 19: length 4.35→4.78, 2 motifs in one genome | search.js, search_summary.js | world 19 follow-up | 80 worlds, one seed each, 300k steps |
| 27b | World 19 knockouts | What makes world 19's genomes long? | `pLigate`, `pHyb`, `tether`, `shield`, `motif` | negative | ligation off: length 4.1, `ABA` 6.9x vs 0.7 | world.js | score function, not length | False lead: fusion, not selection |
| 28 | Letter size and mobility | Can letters differ in size and speed? | `sizeA`..`sizeD`, `mobA`..`mobD` | lead | mixed sizes (1.4 / 0.7): 2 births vs 77–84 | — | search round 3 | 2 seeds, 30k steps |
| 28b | Folding letters | Can strands curl free and straighten when copied? | `foldA`..`foldD` | works | fold 0/10/20°: 74, 71, 76 births, none unfaithful | — | search round 3 | Probe; spirals, no rings |
| 28c | Caps | Do end caps give stable capped copies? | `nP`, `nQ`, `capFray` | lead | capped 59 births vs 3,191 uncapped; duplications appear | — | caps need something that kills | 3 seeds, 40k steps |
| 29 | Double strands, heat | Do heat cycles undo binding's length collapse? | `compCopy`, `pHyb`, `heatPeriod`, `heatFrac` | partial | binding alone 2.3; binding + heat 3.6 vs 3.5 | duplex.sh | seed 3 and `DX_bindheat_2` | Binding + heat one seed |
| 30 | Chirality, round 1 | Does a racemic world break symmetry? | `chiral`, `pMisDock` | partial | ee ≤ 0.21, no symmetry breaking | chiral.sh, hand.js | round 2 (`pRacem`, `pMixLink`); seed 2 | One seed per setting |
| 31 | Droplets | Does grouping in droplets rescue the public motif? | `nG`, `gStick`, `gRange`, `gStickS`, `gStickF` | partial | 1/5 of template units in droplets; 105 vs 82 births | droplets.sh | run the selection test (vs 21) | Scripted, not run |
| 32 | Random chemistry screen | Do random rule tables make ordered assemblies? | `randomTable` (`pAff`, `pRule`) | partial | 31 of 100 tables; repeats 44 vs 1 shuffled (table 55) | src/rchem.js, rsearch.js | `autocat.js` on top tables; 69 more tables | Self-assembly, not yet copying |
| 32b | Hand-written copier control | Does the heredity test detect copying? | `copyTable` | works | 12 assemblies vs 1 unseeded after 1,000 steps | autocat.js | test random tables | Products fragment (fragment problem) |
| 33a | Telomeres (end loss) | Do a genome's pieces die out, so a two-gene genome holds? | `endLoss`, `capFray`, `pFray`, caps | partial | genes kept per pressure until `PQ` (made by a copying mistake) takes over, 3 of 4 environments | telo.sh | bare caps (33b) | seed 1; `PQ` held out only under scarce energy |
| 33a' | Telomeres off (control) | Same without end loss? | caps, no `endLoss` | negative | genome falls into its genes (`PCDCQ`) or `PQ` | telo.sh (`TK_off`) | end loss is needed | seed 1 |
| 33b | Bare caps: two genes selected | Is `PABACDCQ` selected over `PABAQ`? | `bareCaps`, `endLoss`, `feed`, `shield`, `relay` | works | radiation: `PABAQ` gone within 50k steps, both genes in 68–92% of capped births for 500k; no radiation: shield lost by 200k | telo3.sh | gene from nothing | 2 seeds × 4 environments, all agree |
| 33c | Bare caps, keep | Is a seeded two-gene genome kept? | as 33b | works | kept 67–88% under radiation; shield decays 74→32% without | telo3.sh | — | 2 seeds |
| 33d | Bare caps without end loss | Which of the two rules does what? | `bareCaps` only | works | two-gene still wins among capped, but pieces fill the world (capped births 13–19% vs 25–33%) | telo3.sh (`TB_noend`) | both rules needed | seed 1 |
| 33e | Assembly by ligation | Do `PABAQ` + `PCDCQ` pieces join? | `pLigate`, bare caps | negative | 0 two-gene births; `CDC` gone by 32k steps (`PCDCQ` cannot re-arm) | telo2.sh | gene from nothing | seed 1; design flaw |
| 33f | Gene from nothing, ordinary density | Does `CDC` arise inside `PABAQ`? | fivefold mutation, `pLigate`, 13–240 genomes | negative | 0 two-gene births in 7 runs (1M steps each), incl. 80×80 | telo4.sh, telo5.sh | density (33i) | length almost never changes (1–2% of births) |
| 33g | Radiation band (niches) | Do lit and dark halves keep different genomes? | `radBand` | lead | no second species; shield 82% lit vs 44% dark (a cline) | band.sh | — | 1 seed each, 2 mobilities |
| 33h | Scarcity × density sweep | Which resource sets length variation? | caps 30–120 × letters 100–400 | lead | 6 of 9 worlds extinct; at 400 letters 10.4% of births longer than 5 vs 1% at 200 | scarcity.sh | dense gene origin | seed 1 |
| 33i | Gene from nothing, dense world | Does `CDC` arise with 400 letters of each kind? | as 33f, `nA`..`nD` 400 | works | arose in 3 of 3 seeds (steps 645k, 437k, 173k); then 35–61% of capped births carry `CDC`, genomes expand 5 → 10–13 | telo4.sh (`TF_dense`) | third gene; mechanism of expansion | 3 seeds; control without shield rule: no gene, length 5.2 throughout |
| 33j | What drives expansion | Shield alone, or density too? | seeded `PABACDCQ`, 200 vs 400 letters | works | 200 letters: length stays 7.5–7.8; 400: expands 9.3 → 10.7 | TG runs (commands in RESULTS 33) | — | 1 seed each |
| 34a | Translation | Does a genome's back template a product by a code? | `translate`, `transCode`, `n1`..`n4` | works | 12 of 12 products exact (`ABACDCAB` → `12134312`) | test.js, probes | product function | — |
| 34b | Product folding | Does a product's shape follow sequence? | `fold1` | works | 8 × 45° wedges fold into an almost closed wheel | probe (rendered) | shape-dependent function | rings do not close (ligation needs flush ends) |
| 34c | Catalysis (the machine) | Can copying be made to need the product? | `catalysis`, `pLinkBare`, `pBindP` | works | links rare, no product: 0 births; with products: 40 births, accelerating | test.js, probes | what the product does | — |
| 34d | Does catalysis make length pay? | Longer products bind longer? | as 34c + mutation | negative | length 3.7 vs 3.6 without catalysis at 300k | `CA_*` | graded product function | seed 1; a 2-unit product binds as stably as a long one |
| 34e | Product shape vs catalysis | Does fold change catalysis? | `fold1` 0–60° | negative | births 188–245 at every fold | prodshape.sh | — | products straighten as they bind |
| 35 | Letters with trade-offs | Does composition follow the environment (tough/slow vs fragile/fast)? | `resC`, `mobC`, `pBreak` | inconclusive | C+D drift up even in the control; slowness costs more than toughness pays | tradeoff.sh | larger worlds | small populations, drift dominates; speed check: `mobC` 0.5 copies ~5× slower, wedge `bendC` 15° never copied |
| 36a | Shared catalyst, parasites | Do non-producers spread when the catalyst is shared? | `bindAny`, code `A1,B2` | works | parasites rise to ~50% in 100k, coexist for 400k | parasite.sh | — | share follows letter supply (resource partition), see 36b |
| 36b | Parasites on shared letters | Same with shared letters? | `bindAny`, code `A1` | works | parasites 60–70% of births, level off; cooperators persist; private catalyst: ≤ 10% | parasite2.sh | graded specificity | 2 seeds + slow |
| 36c | Graded specificity | Does a mismatched product letting go fast change it? | `pMisMelt` 0.05, 0.2 | works | parasites 5–20%; the smallest cooperator (one `AA` run) wins | parasite2.sh | "shortest wins" again | 2 seeds |
| 37 | Faster engine | Can the engine be made much faster, shapes kept? | `bodyJostle`, `iters` 4 | works | 2–2.5x CPU steps/s at ordinary density, copies exact; jammed worlds need 48×48 or 8–16 passes (39% deletions at 4) | scratchpad probes (RESULTS 37) | bigger, longer worlds | Old results not re-measured; trajectories differ from before |
| 38a | Proofreading works | Does `BDB` cut substitutions in its strand's copies? | `proof`, `pProof` | works | substitutions 50→17.5% (0.5), 57→9.5% (0.9) per capped copy | proof_capped probe | selection test | 2 seeds, 30k steps |
| 38b | Proofreading selected | Is a genome carrying `BDB` selected over a one-letter-different competitor? | `proof`, `pSoft` 0.01, radiation | lead | `BDB` 55→76–78% with the rule, 20–29→10–17% without | PC_* (RESULTS 38) | gene from spare letters (`PN_*`) | 2 seeds, 150k steps, small populations |
| 38d | Proofreading from a spare letter | Does `BDB` arise by one point mutation (`BCB` → `BDB`) and spread? | `proof`, `pSoft` 0.01, radiation | works | `BDB` 2–8 → 73–89% of capped births over 300k with the rule (2 of 2 seeds), 3–17% without; births fall a third (speed-accuracy trade-off) | PN1_* (RESULTS 38) | a gene from nothing needs raw material (density or duplication) | from three letters away (`AAA`) nothing arose in 110k (PN3) |
| 39a | Pockets that fit fuel | Does a folded chain's shape decide which fuel particles its pockets hold? | `grip`, `nU`, `sizeU`, `fold1` | works | 45–90° folds hold small (0.4–0.7) fuel ~24%, 30° large (1.2) 17%, 20° almost nothing, straight mid/large by pairing | grip_probe.js | genome as its own enzyme | seeded product chains, 2 seeds |
| 39b | Genome as its own enzyme | Does a genome whose shape fits the fuel arm faster? | `pocket`, `foldA`, fuel only energy | works | armed/waiting at 20k: fit 87/16 and 78/36, misfit 34/117 and 49/68 | probes (RESULTS 39) | selection | 1 seed each |
| 39c | Harvest spectrum | Does letter order (same letters) decide which fuel is used? | `pocket`, `foldA` 45, `foldB` 30 | works | each fuel size has a different best 8-mer: 0.5 `AABBAABB` 36, 0.85 `AAAABBBB` 23, 1.2 `ABABABAB` 24 | harvest.js | pocket races (selection) | 2 seeds, mutation off |
| 39d | Pocket selection screens | Does composition follow fuel size? | `pocket`, fuel only, 40×40 and 30×30 | inconclusive | 9–47 births per 30k steps: too few; copying runs at ~1 birth per 1,000 steps in small worlds | FS_*, FT_*, PK_*, PR05..PR12 | bigger worlds, longer runs (PW_*) | worlds too small or fuel-poor |
| 39e | Pockets with fuel as a supplement | Does fuel size decide which of three same-letter genomes wins, over scarce energy? | `pocket`, `nE` 16, `nU` 120, `sizeU` | inconclusive | without fuel `ABABABAB` wins (2 of 2); with fuel the winner differs between seeds | PS* | monoculture fitness assays, larger worlds | 5–30 births per lineage per window |
| 39f | Pocket fitness assays | Does shape decide a genome's energy or births when it is alone? | `pocket`, `nU` 120/40, monocultures | partial | armed state follows the harvest spectrum (large fuel: `ABABABAB` 322 armed/67 waiting vs `AABBAABB` 230/120); births differ little (letters limit) | MO_*, ML_*, monoculture.js | competition in large worlds | fuel at 120 × 0.01 saturates energy |
| 40a | Stacks (a second way to copy) | Do back copies that stay give crystals that grow and split? | `backCopy`, `stack`, `pSBind`, `pSNuc`, `pSMeltEnd` | works | rows exact (20 of 20), stacks of 3 to 26 rows melt apart and regrow; without a nucleation barrier two-letter strands sharing a 3-run aggregate | stacks.sh, stacks.js, test.js | kin aggregation with four letters; shape-limited stacks | copy is parallel on a back, reversed on a face |
| 40b | Do stacks make length pay? | Is newborn length held in an open two-letter world with held stacks? | `stack`, `stackHold`, `pSBind` 0 to 0.05, `pSNuc` 0 | negative | length ≥ 3.5 only where letters lock up (free < 190 of 512) and births fall 3–10×; turning over, 2.0–2.5 as plain | stacks.sh (`ST_hold_*`) | hoarding is not selection | knife edge at zip 0.02 (alive, 3.1–3.5); 2 seeds |
| 40c | Treadmilling stacks | Same with stack bottoms fraying (they grow at the top, die at the bottom)? | `stack`, `stackHold` off, `pSBind` 0 to 0.5 | negative | never lock up; length 2.1–2.8 at every zip rate; with aggregation (no barrier) 4.4–4.8 but letters locked again | stacks.sh (`ST_tread_*`) | stacks where free strands are punished (radiation) | melting is not death: a row that comes off copies at once |
| 40d | Stacks keep a two-gene genome? | Is `ABACDC` kept longer with stacks (section 22 world)? | `stack` (held, zip 0.02) with `feed`, `shield`, `relay` | inconclusive | seed 2: plain lost it by 76–78k, stacks kept it to 165–192k; seed 1: no difference | stacks.sh (`ST_K*`) | more seeds | the plain world now keeps it far longer than section 22 said |
| 40e | Stacks under radiation | Do stacks keep a population alive where radiation kills it? | `stack`, `backCopy`, `pBreak` 3e-5 to 3e-4 | negative | at 3e-4 plain extinct (2 of 2) but back copies released without stacks live as well (665–684 births per 15k vs 602–619 with stacks); length 2.0 everywhere | stacks.sh (`ST_rad*`) | — | two-faced templating (two copy sites per strand) is the rescue, not stacking; first reading was wrong |
| 40f | Shape-limited stacks | Do wedge rows limit stack height? | `stack`, `bendA` 0 to 20 | negative | heights 6–10 at 0–10°; 15° and more: no copying at all | probe (RESULTS 40) | — | geometry is a switch again |
| 40g | Heritable stacking (sticky and slippery letters) | Is the stacking mode selected under radiation when a letter sets it? | `smeltA` 20, `stack`, `pBreak` 0 to 3e-4 | negative | `B` share 0.47–0.55 in every arm | stacks.sh (`ST_slip*`) | — | follows from 40e: stacks give nothing to select |
| 41a | Pocket races, 8 seeds | Does fuel size decide which of three same-letter genomes wins (section 39 world)? | `pocket`, `foldA` 45, `foldB` 30, `sizeU`, `nU` 40 | negative | shares within drift (per-seed 0–70%); the one nominal effect (p = 0.05) is matched by the no-fold control | races.js, permtest.js (`RC*`, `RN*`) | an energy-limited world (41b) | births limited by letters: fuel arms more templates but births stay (105–129 vs 122 without fuel) |
| 41b | Who makes pockets; energy-limited world | Are pockets one strand or two? Where does energy limit births? | `pocket`; 48×48, 400 letters each, `nE` 8 to 64 | works | 81–92% of fuel armings in one folded strand; dense world: births 39/68/86/127 at 8/16/32/64 energy particles | pockets.js, `EL*` | races in the dense world (41c) | harvest order differs from the section 39 spectrum (context) |
| 41c | Pocket races, energy-limited, 12 seeds | Does fold decide same-letter races where energy limits births? | `pocket`, folds on/off, fuel 0.5/1.2, dense 48×48 | inconclusive | `ABABABAB` 50% with folds vs 24% without at fuel 1.2 (p = 0.09), 49% with folds and no fuel; nothing significant | races.js, permtest.js (`DR*`, `DS*`) | 96×96 worlds, or genomes differing in composition | 20–40 births per lineage per seed: drift swings shares 0–100% |
| 42a | Shared catalyst in space | Do creeping polymers let hosts and parasites separate and hold parasites down (80×80)? | `bindAny`, `translate`, `catalysis`, `mobS` 0.1, 0.3, 1 | works | parasites at the end 50–65% creeping, 60–63% at 0.3, 71–72% well mixed (8 vs 4 runs, no overlap); segregation 0.03–0.10 vs 0.01–0.03; host births equal | hostparasite.sh, spatial.js, hostmap.js (`HP_*`) | hosts that can evolve against parasites (43) | 2 seeds per mobility; no travelling front; a ~10-point effect |
| 42b | Parasites arise by themselves | With only hosts seeded, do non-producers arise, and does space hold them down? | as 42a, mutation 0.005 | works | short B/C/D strands arise within 50k and take 58–62% creeping vs 72% mixed | hostparasite.sh (`HM_*`) | — | hosts shrink to `AAB`, `AAAB` (regularity 1) |
| 43a | Keys and mimics, open world | With a start letter for translation and graded specificity, do hosts escape mimics by changing keys (a Red Queen)? | `transStart` D, `transCode` A1,B2, `bindAny`, `pMisMelt` 0.05 | negative | mimics 12–29% of births; mimic load does not predict a key's fall (pooled r = +0.05, p = 0.72; +0.15 without specificity); keys shrink to 2–3 letters | armsrace.sh, keys.js, redqueen.js (`AR_*`) | capped world, where keys cannot shrink (`CR_*`) | 2 seeds, 1M steps; one striking cycle in seed 1 is drift by the test |
| 43b | Keys and mimics, capped world | Where keys cannot shrink, do mimics spread and drive key changes? | as 43a, capped (`endLoss`, caps), `pLinkBare` 0.05 | negative | capped mimics 0.1–2.7% of capped births over 2M steps in both arms; keys drift as much without specificity; r = +0.02 | armsrace.sh (`CR_*`), keys.js, redqueen.js `--capped` | products that leave their maker; whole-key recognition | products stay on their maker, so mimics copy at the bare rate |
| 44a | Activation delay and melting | Does preventing immediate rebinding deliver catalysts? | experimental pPReady 0.01/0.001; `pPMeltRun` 0.05 | negative | 100-step delay gives 3.94% non-producer occupancy in one seed, zero in the other; fast melting raises share by host loss | product_exchange.js (`PE_screen`) | repeated retraction and lifetime | 2 seeds, 50k; last 30k analyzed |
| 44b | Retracting product latch | Does melting into an inactive state permit sharing? | experimental productReset, pPReady 0.01/0.001 | negative | non-producer occupancy zero in both seeds; 1000-step activation leaves only about 14% of linked product units mature | product_exchange.js (`PE_reset_screen`) | survival between encounters | 2 seeds, 20k; prototypes parked outside normal chemistry |
| 44c | Both product kinds folded | Can curvature plus a delay prevent rebinding? | `fold1` 45, `fold2` 45, experimental pPReady 0.01 | negative | zero linked product-unit samples in both seeds | product_exchange.js (`delayFold`) | flat monomers, shape changed on joining | 2 seeds, 20k; free monomers fold too; causal geometry ablation still needed |
| 44d | No-turnover exchange probe | Can retraction permit exchange if products survive? | `pFray` 0, `pSoft` 0, experimental productReset | lead | recipient occupancy 0.92/0.51% vs 0/0; original-block retention 17/48% vs nearly 100% | product_exchange.js (`PE_lifetime_probe`) | restore genome turnover, change product lifetime only | 2 seeds, 20k; not an evolutionary world |
| 44e | Product durability with matched controls | Does useful delivery survive genome turnover? | `productFray` 0.03; `pBindP` 0 control; experimental reset ablation | lead | late recipient occupancy 0.07/0/1.13/4.63% vs 0/0/0/0; capped births 20.25 vs 20.75; reset reduces births to 8.25 | product_exchange.js (`PE_durable`, `PE_durable_control`) | more seeds, encounter efficiency, bond-triggered shape | 4 fresh seeds, 30k; transport lead only, no selection or complexity claim |
| 38c | Proofreading in the jammed world | Does it rescue a meltdown at 5x mutation? | `proof` 0.5, old engine, dense | negative | both arms melt down; half the errors are length changes | PR_* | measure the error spectrum first | seed 1, stopped at 60–70k |

## Knob index

Generated by `node tools/ledger_index.js` from the table above (every knob in backticks in the Mechanism column, with
the rows that used it). Rerun it after adding rows.

<!-- knob-index -->
| knob | rows (verdict) |
|---|---|
| `backCopy` | 40a (works), 40e (negative) |
| `bareCaps` | 33b (works), 33d (works) |
| `bendA` | 15c (lead), 40f (negative) |
| `bendB` | 15c (lead), 15d (works) |
| `bindAny` | 36a (works), 36b (works), 42a (works), 43a (negative) |
| `bodyJostle` | 37 (works) |
| `capFray` | 28c (lead), 33a (partial) |
| `catalysis` | 34c (works), 42a (works) |
| `chiral` | 30 (partial) |
| `compCopy` | 29 (partial) |
| `cut` | 26 (negative) |
| `cutMotif` | 26 (negative), 26b (inconclusive) |
| `endLoss` | 33a (partial), 33a' (negative), 33b (works), 43b (negative) |
| `energyMode` | 3 (negative), 4 (negative) |
| `feed` | 14b (works), 14c (works), 14d (negative), 19b (inconclusive), 19c (works), 22 (negative), 33b (works), 40d (inconclusive) |
| `fold1` | 34b (works), 34e (negative), 39a (works), 44c (negative) |
| `fold2` | 44c (negative) |
| `foldA` | 28b (works), 39b (works), 39c (works), 41a (negative) |
| `foldB` | 39c (works), 41a (negative) |
| `foldD` | 28b (works) |
| `gRange` | 31 (partial) |
| `grip` | 39a (works) |
| `gStick` | 31 (partial) |
| `gStickF` | 31 (partial) |
| `gStickS` | 31 (partial) |
| `H` | 17 (inconclusive) |
| `heatFrac` | 29 (partial) |
| `heatPeriod` | 29 (partial) |
| `hinge` | 10 (superseded) |
| `hingeMax` | 10 (superseded) |
| `iters` | 37 (works) |
| `make` | 16c (negative), 24 (negative) |
| `maxStrain` | 23 (works), 23b (works) |
| `maxStrainStrand` | 23 (works) |
| `memAngle` | 11 (superseded), 12b (inconclusive), 16 (negative), 16b (negative), 16d (negative), 24c (works) |
| `memFlex` | 11 (superseded) |
| `memLinkTol` | 24b (negative), 24c (works), 25c (works) |
| `memPerm` | 24 (negative) |
| `mobA` | 28 (lead) |
| `mobC` | 35 (inconclusive) |
| `mobD` | 28 (lead) |
| `mobE` | 14 (negative), 17 (inconclusive), 21 (negative), 25 (works) |
| `mobM` | 25 (works), 25c (works), 25d (negative) |
| `mobS` | 21 (negative), 25 (works), 25c (works), 26 (negative), 26b (inconclusive), 42a (works) |
| `mobX` | 25b (works) |
| `motif` | 9 (negative), 12b (inconclusive), 14 (negative), 17 (inconclusive), 21 (negative), 24b (negative), 27b (negative) |
| `n1` | 34a (works) |
| `n4` | 34a (works) |
| `nA` | 33i (works) |
| `nC` | 19 (works) |
| `nD` | 33i (works) |
| `nE` | 3 (negative), 4 (negative), 14 (negative), 19b (inconclusive), 19d (negative), 24b (negative), 39e (inconclusive), 41b (works) |
| `nG` | 31 (partial) |
| `nM` | 11 (superseded), 11b (negative), 16 (negative), 16b (negative) |
| `nP` | 28c (lead) |
| `nQ` | 28c (lead) |
| `nU` | 39a (works), 39e (inconclusive), 39f (partial), 41a (negative) |
| `nX` | 25b (works), 25d (negative) |
| `pBindP` | 34c (works), 44e (lead) |
| `pBreak` | 8 (works), 10 (superseded), 11b (negative), 12 (works), 16 (negative), 16b (negative), 19 (works), 19d (negative), 35 (inconclusive), 40e (negative), 40g (negative) |
| `pCapture` | 1 (works), 2 (works), 5b (negative), 14b (works) |
| `pCut` | 26 (negative) |
| `pFray` | 1 (works), 2 (works), 4 (negative), 5b (negative), 12 (works), 13 (works), 13b (works), 33a (partial), 44d (lead) |
| `pHyb` | 18 (negative), 26 (negative), 26b (inconclusive), 27b (negative), 29 (partial) |
| `physics` | 15 (works) |
| `pLigate` | 3b (lead), 8 (works), 10 (superseded), 12 (works), 19d (negative), 27b (negative), 33e (negative), 33f (negative) |
| `pLinkBare` | 34c (works), 43b (negative) |
| `pMelt` | 18 (negative) |
| `pMeltEnd` | 18b (negative) |
| `pMemDecay` | 16c (negative) |
| `pMisDock` | 30 (partial) |
| `pMisMelt` | 36c (works), 43a (negative) |
| `pocket` | 39b (works), 39c (works), 39d (inconclusive), 39e (inconclusive), 39f (partial), 41a (negative), 41b (works), 41c (inconclusive) |
| `pPMeltRun` | 44a (negative) |
| `pProof` | 38a (works) |
| `pReload` | 9 (negative), 14 (negative), 19b (inconclusive) |
| `productFray` | 44e (lead) |
| `proof` | 38a (works), 38b (lead), 38d (works), 38c (negative) |
| `pSBind` | 40a (works), 40b (negative), 40c (negative) |
| `pSMeltEnd` | 40a (works) |
| `pSNuc` | 40a (works), 40b (negative) |
| `pSoft` | 1 (works), 2 (works), 5b (negative), 14b (works), 38b (lead), 38d (works), 44d (lead) |
| `pSpont` | 7 (works), 11b (negative) |
| `pUndock` | 5 (works), 5b (negative), 12 (works), 13 (works), 13b (works), 15b (works) |
| `pUnzip` | 13b (works), 15b (works) |
| `radBand` | 33g (lead) |
| `rayHit` | 25b (works), 25d (negative) |
| `relay` | 19c (works), 19d (negative), 22 (negative), 33b (works), 40d (inconclusive) |
| `resB` | 8 (works), 12 (works) |
| `resC` | 35 (inconclusive) |
| `resM` | 11 (superseded), 11b (negative), 16 (negative) |
| `shapeA` | 15c (lead) |
| `shield` | 19 (works), 19c (works), 22 (negative), 27b (negative), 33b (works), 40d (inconclusive) |
| `sizeA` | 28 (lead) |
| `sizeD` | 28 (lead) |
| `sizeU` | 39a (works), 39e (inconclusive), 41a (negative) |
| `sizeX` | 25b (works) |
| `slack` | 10b (superseded), 12 (works) |
| `snapCorners` | 23 (works), 23b (works) |
| `spend` | 14d (negative) |
| `stack` | 40a (works), 40b (negative), 40c (negative), 40d (inconclusive), 40e (negative), 40f (negative), 40g (negative) |
| `stackHold` | 40b (negative), 40c (negative) |
| `stiffA` | 15 (works), 15b (works) |
| `stiffM` | 16d (negative), 23b (works), 24c (works) |
| `sun` | 3 (negative) |
| `tether` | 24 (negative), 24b (negative), 25d (negative), 27b (negative) |
| `transCode` | 34a (works), 43a (negative) |
| `translate` | 34a (works), 42a (works) |
| `transStart` | 43a (negative) |
| `W` | 17 (inconclusive) |
<!-- /knob-index -->

## Open gaps (worth trying, with the reason)

- **Product survival and productive encounters** (44): durability permits a little delivery without removing genome turnover;
  forced release loses host function. Extend the matched durability assay before long arms-race runs. A lateral-bond-triggered
  rest shape could leave monomers flat but generate curvature after assembly; test synthesis, release and useful binding separately.

- **A third gene in expanded genomes** (33i, 33j): genomes of 11–13 units carry spare letters; give them a third
  pressure with a private gene and see whether a third gene arises (regularity 5, 6).
- **Mechanical directions not yet built** (DESIGN 15, LITERATURE shortlist): crystal ribbons (a second replication mode;
  fragments carry the whole information), a polymerase block (a copier made of parts), recombination by template
  switching (genes move between lineages in one step).
- **A product function that pays by degrees** (34d, 34e fail because every product fits its maker and shape is lost on
  binding): candidates in DESIGN 15 (F1 pleiotropic letters, F2 shape that survives binding).
- **Unfinished older items**: random chemistry heredity test (32), chirality round 2 (30), droplets selection test (31),
  double strands seed 3 (29).
- **Untested combinations**: dense world + translation (does the machine gain parts where length is cheap?); dense world
  + parasites; radiation band in a dense world; bare caps with cutting (a cut kills in a capped world, 26 was null).
