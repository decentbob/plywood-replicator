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
   Double strands with heat cycles and ligation (94) keep reproducing templates 2–3x longer, with or
   without radiation, but with a sixth of the births; the gain is not damage-specific repair.
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
   A prepared support can straighten a folding template (14.59° → 2.13°) without raising its sustained copy yield (47).
   After prepared face loss, existing fold45 at stiffness 0.8 turns two endpoints out of binding alignment (80);
   rigid-fold and straight controls stay aligned. This is zero-kick relaxation with reactions off: acquisition,
   rebinding competition and preserved repair have not been demonstrated.
   Half-cell cap polygons preserve prepared copying/fuel access (82): 84 static
   placements and all body4/individual16 held fixtures pass, while attached
   individual4 fails. Forced face removal is not autonomous release; later A/A
   overlaps expose the core contact approximation. Research polygon contacts
   reduce these but fail one four-pass fixture (83): pin/shape correction
   reintroduces overlap. A fixed body16 follow-up and individual16 reference
   pass all eight worlds each, including fuel/all-pair overlap bounds. This
   admits an isolated chemistry test, not exact continuous exclusion. No arc
   growth or shielding benefit is established. Separate rim storage preserves
   cap chemistry and prepared ordinary release in 8/8 fixtures (84), but passive
   W recruitment fails 0/8: no post-motion encounters satisfy its nearly flush
   end criterion. Initial contact is lost after kicking; on/off paths match.
   Fresh initial overlaps up to .235433 also limit generalization from 83's
   prepared contact gate. Retain the interface, park that acquisition setting.
   Reusing ordinary membrane end-corner capture for W (85) passes cap binding
   and W/W extension functional tests without fuel/copy-state gating. The same
   sparse screen still recruits 0/8, with just one eligible failed attempt.
   This does not establish kinetic growth or refute automatic association;
   angled-contact relaxation remains a separate mechanical prerequisite.
   Prepared angled capture followed by physics passes final alignment/free-end
   access in 16/16 W fixtures and 8/8 native-M benchmarks (86), while 0/24
   unbound controls maintain edge alignment. Individual Q extension still
   reaches transient overlap .223063; final fit is not continuous exclusion.
   This admits curved-arc geometry planning, not bath growth or protection.
   Complete prepared D shapes with eight identical curved W blocks fit and
   separate after imposed release (87). The full-D dynamic gate passes closed
   body16 2/2 but individual16 0/2. Neutral diagnosis finds a directly bonded
   A/A residual still converging; one separately frozen 32-pass check reaches
   3/4 closed passes, still below its all-world gate (.021333 overlap > .02).
   All four closed released windows pass at32. Park this dynamic setting;
   static feasibility is not acquisition, reliable exclusion or reproduction.
   User-requested live integration (88) retains these mechanics and runs actual
   chemistry: prepared paired Ds release at t1 in4/4 moving worlds. Stationary
   prepared loose contacts form/release a second capped chain and, with pMem=1,
   close its W rim; polymer-off controls acquire no rim. Moving120-step bath/
   contact starts yield0/8 new complete cells, one W bond in one world. This
   short software screen neither demonstrates nor rules out bath reproduction.
   A fresh50k-step bath screen (89) acquires6/7 new rim bonds in two on worlds,
   but zero new chain rails/capped chains/cells in all four on/off worlds.
   Ordinary placement rejects39/44 post-filter attempts; no E is spent. Thus
   automatic W growth is observed, while ordinary chain acquisition fails even
   without further rim binding. Diagnose rejection geometry before any longer
   run or new timing/fuel mechanism; these counts do not identify the cause.
   Exact replay diagnoses those placements (90): all34 rejected free projections
   intersect an immediate bonded neighbor of their intended partner; none hits
   the intended partner or W. Five bound-cap contacts miss the .1 endpoint-gap
   limit. All44 attempts are face docking;15 compatible rail tests fail earlier
   geometry. Only44/6,499 compatible tests reach placement. Core placement accepts
   all39 rejects but increases overlap above1e-10 in35; bypassing vacancy is not
   a demonstrated correction. Prepared stationary contacts and exact square
   controls pass. In-place incident pins (91) align all38 bath contacts under
   body16 and individual16, but sustained geometry plus next-rail access passes
   only37/38 and0/38 respectively. Existing-joint and neighboring-access defects
   persist with relative kicks; final-window overlap reaches .198082. Moving
   prepared controls also pass4/4 body and0/4 individual. Their original zero-kick
   records and the separate correction are preserved. Park this capture variant
   and the current half-cell acquisition branch; another bath is not earned.
   Permanent wedges expose a two-row joint mismatch that straight supports do not remove (48). Opposing A/B wedges
   with complementary pairing restore copying under default physics in both directions (49); the benefit weakens with
   poorly resolved individual kicks. Shape and pairing must be tested together, with solver controls.
   Persistent curvature captures fuel in isolation but rearms only part of an eight-unit row (50a). Other rows
   supply missing contacts even with square material (50b); isolated fuel capture is not a reproductive advantage (50c).
   Equal-composition active-founder worlds with slow turnover can renew exact descendants (66): opposed20
   ABABABAB reaches generation three in both screen seeds. Its fixed between-sequence benefit gate still fails;
   AAAABBBB versus ABABABAB gives 2/0 versus 3/3 reproducing offspring, with extensive shortening and founder loss.
   A separate retrospective census (71) finds inherited fuel-supported renewal among shorter rows:
   four families have two-link chains in both archived seeds, including square dimers. Loss of the
   exact founder lineage is not loss of all inherited renewal; no arrangement benefit or length payoff follows.
   The five-letter common-environment follow-up (72) also misses its fixed benefit gate:
   opposed20 alternating/rearranged primary 10/3 and 9/8 versus square 12/18 and 10/2.
   Both arrangements renew; 359/360 productive-parent fuel witnesses involve outside material.
   These contacts do not establish a persistent partnership or a private shape function.
   A distinct prepared error-discrimination test (77) reduces wrong joining with opposing
   wedges, but selective wrong-member loss misses its gate in both noise/solver strata.
   Every AA correct case loses a member first while both wrong placements join. Shape
   can filter incoming material without preferring the intended complementary identity.
   Prepared passive support can restore a cut lateral bond through ordinary ligation (78):
   12/12 intact-support cases reconnect versus 0/12 split-support and 0/12 unbound,
   under body4 and individual4/16. This retains arrangement without fresh material, but
   all bound faces stay occupied and there are no births. Acquisition/release and payoff
   against independently renewing fragments remain untested; two seeds are only a lead.
   Ordinary acquisition/melting fails the next prerequisite (79): all 8 prepared on
   cases repair but none achieves sustained release; disabling future binding gives 7/8
   repair-and-release controls but removes acquisition. Only 2/8 on near-encounters
   sustain a bridge. The rate/preparation combination is parked, without a population test.
   The existing free-face fold changes that race, but without a latch it trades acquisition for
   release (92). Fold45 dimers escape directly in 11/9/12 of 16 worlds versus straight 5/4/4
   (body4/individual4/individual16), but sustain a full bridge in 0/2/0 versus 5/7/7. An
   own-face shape switch cannot tell a bond just lost from one not yet formed. Parked.
   **Contact kinetics are not time-step converged (93).** Kicks per default step are as large as
   the binding window. Refining time (kicks x sqrt(dt), probabilities 1-(1-p)^dt) raises
   flush-pair acquisition under individual kicks from 8–9 to 15–17 of 32 at dt 1/16 and lowers
   direct escape from 9–11 to 4. The default step understates binding and overstates release,
   so default-step acquisition and release rates are qualitative until checked at a finer step.
   The offline partner audit (73) finds one repeated reciprocal renewing pair, but no
   candidate above its fixed opportunity reference. Only 3.3–6.2% of covered events have
   alternative helpers; this limits identification rather than proving interchangeable support.
   Noncircular parts also need a check of numerical exclusion and search bounds (67): split-edge rectangle
   ports fit, but circular contact forces and centre-distance filters miss overlap or reject valid growth
   placements. More solver passes do not fix that deterministic geometry mismatch.
   A research-only convex-envelope correction resolves the prepared witnesses (68): all 192 placements
   and 24/24 individual16 target predicates pass. Eligibility still permits deformed edges with large
   endpoint gaps; that assay does not test actual acquisition or retention, and hull exclusion is conservative.
   Actual acquisition under local face binding and uniform bond loss fails its gate (69): body4
   succeeds in 12/12 prepared one-contact cases but only 2/6 unbound near-encounters; individual32
   gives 1/12 (square only) and 0/6. More eligibility or prepared fit is not robust acquisition.
8. **Walls and compartments have not paid in any form** (but see 97–98: an anchored half-cell wall now
   reproduces in screens; no benefit measured yet) (11b, 12b, 16, 16b–d, 24, 24b, 25d): they are slow to build,
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
    Flexibility's recipient benefit in four reused seeds (45d) failed a fresh-seed binding control (46): mean recipient-parent
    births 5.25 with flexible binding vs 5.5 without it; only one of four seeds improves. Binding benefits producers much more.
    In the uncapped PY setting, a fresh two-seed production/binding screen does support recipient dependence (61):
    18/24 recipient-parent births versus 0/1 without binding and 2/1 without production, with continuing producer output.
    Detached exact recipient output has the same direction. Fresh confirmation (62) gives binding effects +16/-1/+22/+4:
    mean benefit remains positive, but only 2/4 worlds pass the predeclared gate. Producers remain viable in all four.
    Park this setting for frequency competition; it does not rescue flexibility or establish reliable delivery in every world.
    Exact archived replays (75) preserve all sixteen histories but do not isolate a common delivery bottleneck:
    on-world identity coverage is 75.95–79.80%, below the fixed 80%, and seed 106 has only 13 geometric
    opportunities/two ended recipient bindings. Supported output is attribution, not a causal explanation.

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
- **Two-contact fuel startup** (50): one inactive AAAABBBB with opposing 20-degree wedges captures fuel but does
  not fully rearm in 50k. Four rows share contacts; with 120 letters and 40 U in 18x18, both square/curved
  founders start copying by 100k in four fresh seeds. Curved offspring have no generation-2 births there.
- **Turnover is required**: without fraying or another death, templates lock up material and copying stops (1, 28c,
  34 probes). Capped worlds need open ends fragile (`pFray` 0.001) and caps not (`capFray` 0.03) (33).
  Exact replays in 51 show fully active curved offspring stalling amid 33-39 units/world in unfinished rows.
  Turnover restores some exact descendant copying in two seeds, but newborns shorten and original rows die.
  Perfect caps protect incomplete rows too (52): a cap can close the free end while a docked end blocks fraying;
  capless patches with both ends docked also lack a place to start end-fraying. Capping is not selective cleanup.
  Stronger lone-monomer undocking suppresses copying (53); multiple patches often merge into exact copies.
  One curved world retains overlapping prefixes despite 117 free monomers, so total pool depletion is not
  required for a stall. Its selected replay (54) finds occupied sites, excluded docking placements and failed
  linking distance. Contact-gated recruitment reduces unfinished inventory but lowers exact output (55).
  In the selected state, releasing either overlapping prefix restores three exact copies versus zero;
  the retained prefix completes intact, but the released piece remains inactive (56). This is one fixture,
  not evidence for a general release rule or reuse of parts.
  The unchanged retained handoff also fails the original-obstruction benefit gate (70): four
  physical capture/release/redocking cycles return to the original site, with no new settled row.
  SEEK and pulse each complete one original cohort intact; waiting and ordinary chemistry do not.
  Local operation is not useful completion, and persistent inactive output is not reproductive closure.
- **Equal-composition renewal screen** (66): four initially active eight-letter rows, 120 letters/40 U in
  18×18, pFray 0.00003/pUnzip 1 from time zero pass the 20k exact-copy gate for AAAABBBB and ABABABAB.
  At 100k, opposed20 ABABABAB has three fully rearmed exact offspring that reproduce in each seed;
  square and grip-off controls have zero. The full between-sequence gate fails, and this preparation
  does not preserve founders or generally retain eight-letter lineages. Do not infer indefinite viability.
- **Seeds must be viable under the rules**: a translation seed needs adjacent coded letters or it makes no product
  (36b); with bare caps a seed needs `ABA`; with `pUndock` 0 half-finished copies can lock templates.
- **Uncapped shared products** (61): the section-36 PY inventory of 1,000 blocks remains viable under current body jostling:
  8/9 producer-parent births at 10k in viability seeds 101/102. Full product releases of 0/1 underestimate standing linked
  production (34/38 units); use inventory and mature occupancy alongside release counts.
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
| 45a | Physical shape activation | Does selecting a folded rest shape actually bend bonded blocks? | `stiff1`, `stiff2`, `snapCorners`; experimental productShape | works | lateral-fold arms are exactly identical to straight at stiffness 1; stiffness 0.8 activates measured bending | product_shapes_test.js; product_exchange.js (`PS_screen`) | verify physical phenotype before population runs | stopped diagnostic: 9 complete 10k windows, not an efficacy screen |
| 45b | Assembly-triggered shape screen | Can flat monomers assemble products that stay bent? | `fold1`, `fold2`, `stiff1` 0.8, `stiff2` 0.8; experimental productShape | lead | 5° persistent bend births 25/20 vs 20/13; 30° costs assembly and occupancy; free-only bend delivers in both seeds | product_exchange.js (`PS_flexible`) | fresh seeds, same-physics and no-binding controls | 2 seeds × 7 arms × 20k; actual bound/free angles measured |
| 45c | Fresh-seed shape comparison | Do mild or free-only bends improve productive exchange? | `fold1`, `fold2`, `pBindP`; experimental productShape | inconclusive | mild-bend births rise in 3/4; free-bend occupancy 18.02% vs 10.32%, but recipient-parent births equal no-binding mean 6.5 | product_exchange.js (`PS_confirm`); product_parent_summary.js | retain research variants; occupancy is not fitness | 4 fresh seeds × 4 arms × 50k; 20k–50k analysis; no selection claim |
| 45d | Product material compliance | Is flexibility alone enough to improve transfer? | `stiff1` 0.8, `stiff2` 0.8 vs 1; `productFray` 0.03 | lead | recipient occupancy 7.63% vs 1.45%; recipient-parent births 6.5 vs 4, both increase in 4/4 seeds; total births similar | product_exchange_summary.js (`PE_durable`, `PS_confirm`, 10k–30k) | flexibility × binding ablation, independent seeds, inherited mixed stiffness | reuses four matched historical controls; no new chemistry needed |
| 45e | Shape without substitutions | Does mild bending still copy faithfully at pSoft 0? | `pSoft` 0, `fold1` 5, `fold2` 5, `stiff1` 0.8, `stiff2` 0.8 | works | 52/52 classifiable capped births exact; one parent snapshot only Q, fidelity unknown | product_exchange.js (`PS_exact`); product_parent_summary.js | separate snapshot differences from known copying errors | 2 seeds × 2 arms × 20k; post-hoc diagnostic, not long-run proof |
| 38c | Proofreading in the jammed world | Does it rescue a meltdown at 5x mutation? | `proof` 0.5, old engine, dense | negative | both arms melt down; half the errors are length changes | PR_* | measure the error spectrum first | seed 1, stopped at 60–70k |
| 46 | Independent flexibility control | Does flexibility improve recipient reproduction through binding? | `stiff1` 0.8 vs 1, `stiff2` 0.8 vs 1, `pBindP`, `productFray` 0.03 | negative | flexible recipient-parent births 5.25 vs 5.5 without binding, improves in 1/4 seeds; total births 34 vs 12 | product_exchange.js (`PF_binding`); flexibility_summary.js | controlled mechanical-bracing assay with pLinkBare 1 before another ecology | 4 fresh seeds × 4 arms × 50k; prespecified 20k–50k; fails to confirm 45d, not proof of zero effect |
| 47a | Prepared mechanical support | Does attachment straighten a template with no chemical link advantage? | `pLinkBare` 1, `foldB` 30, `stiffA` 0.5, `stiffB` 0.5, `stiff1` 1, `stiff2` 1 | works | fresh-seed bend 14.59° → 2.13°; individual kicks 18.55° → 5.27° | mechanical_brace.js (`MB_confirm`, `MB_local`) | physical effect must improve copying separately | prepared support, single active founder, 8 seeds per setting; same runs as 47b/c |
| 47b | Mechanical support yield | Does straightening improve sustained exact copying? | `pLinkBare` 1, `foldB` 0/30, `bodyJostle` | negative | folded exact yield 9.50 free vs 9.25 attached; individual kicks 7.125 vs 6.50 | mechanical_brace.js; mechanical_brace_summary.js | find a genuine geometric bottleneck before support ecology | 2-seed screen selected 30°; 8 fresh seeds failed confirmation; all 630 births across 76 runs exact |
| 47c | Mechanical support onset | Does attachment speed the first exact copy? | `pLinkBare` 1, `foldB` 30, `bodyJostle` false | lead | individual kicks: 2,721 → 1,425 steps, faster in 7/8; default jostling 1,001 → 988, 4/8 | mechanical_brace_summary.js (`MB_local`) | conditional transient benefit, no sustained yield gain | first-copy timing prespecified; straight control also faster in 6/8; prepared supports have unmeasured costs |

| 48 | Persistent-wedge bottleneck | Does a straight brace rescue permanent curvature? | `bendB` 0/10/20/30, `stiffA` 0.5, `stiffB` 0.5, `pLinkBare` 1 | negative | 20/30 degrees: zero copies in both arms/seeds despite founder straightening; every sampled eligible BB pair at 20 fails the angle gate | geometric_bottleneck.js (`GB_screen`) | fit of both rows; complementary opposing wedges (49) | 2 seeds, 20k; 10-degree gain only in one seed; dwell samples are not rates |

| 49a | Complementary geometric fit | Can opposing wedges remove the copying obstruction? | `bendA` -20, `bendB` 20, `compCopy`, `stiffA` 0.5, `stiffB` 0.5 | works | fresh 8 seeds: ABBABA 0 to 10.125 exact copies, BABAAB 0.625 to 7.75; square-adjusted gain positive in every seed | complementary_fit.js (`CF_confirm`) | persistent curved replicators with a measured physical function | two-seed screen kept separate; no new rule; prepared founders, 20k |
| 49b | Fit versus solver/noise | Does the rescue survive changing deformation resolution? | `bodyJostle`, `iters` 4/8/16, `compCopy`, `bendA` -20, `bendB` 20 | lead | default 8 passes preserves both directions; individual/4 loses reverse advantage, individual/16 recovers both directions in 2 seeds | complementary_fit.js (`CF_solver`, `CF_local`, `CF_local16`) | physical effect, resolution-sensitive magnitude | robustness seeds reused; 16-pass probe post-hoc; no convergence claim |
| 49c | Complementary-wedge descendants | Do curved offspring reproduce with fuel and turnover? | `compCopy`, `bendA` -20, `bendB` 20, `pFray` 0.00003, `pUnzip` 1 | lead | 42/34 births, generations 4/5 at 50k; late birth lengths 4.08/4.50 from 6-letter founders | complementary_population.js (`CF_population`) | copying-compatible curvature, not complexity growth | 2 seeds; near square output; free letters exhausted; parent snapshots are not a fidelity oracle |

| 50a | Persistent-shape fuel capture | Does copying-compatible curvature acquire energy? | `pocket`, `bendA` -20, `bendB` 20, `pGrip`, `iters` 4/8 | works | 8 fresh seeds: 3.625/8 units rearmed vs zero square; no complete row; mean falls to 2 at 8 passes in 4 seeds | curved_fuel.js (`UF_screen`, `UF_confirm`, `UF_solver`, `UF_off`) | distinguish acquisition from full recovery | 28/29 fresh events arm B; no free letters; 40-degree screen lacks copying check |
| 50b | Shared fuel contacts | Can other rows supply missing contacts? | `pocket`, `pGrip`, `bendA` -20, `bendB` 20, `iters` 4/8 | works | 8 fresh seeds, 4 rows: full recovery 22/32 square, 25/32 curved; all 124 curved A armings cross rows | curved_collective.js (`UF_collective`, `UF_collective_confirm`, `UF_collective_solver`) | shared-contact startup, not curvature superiority | more rows change density/material; events within worlds are not independent replicates |
| 50c | Inactive-founder startup | Does acquisition start actual reproduction? | `pocket`, `pGrip` 0/0.2, `compCopy`, `pFray` 0, `bendA` -20, `bendB` 20 | lead | 4 fresh seeds at 100k: square 7/4/7/7 exact births, curved 6/4/6/5; every grip-off arm zero; gen-2 births only in 2 square runs | curved_fuel_reproduction.js (`UF_copy`, `UF_bootstrap`, `UF_bootstrap_confirm`) | measure offspring rearming and material sequestration | fixed material, no turnover; one-founder screen sterile; no advantage, selection or sustained curved reproduction |

| 51a | Offspring fate and material inventory | Is lack of rearming the only block to descendant copying? | `pocket`, `pFray` 0, `bendA` -20, `bendB` 20 | negative | 10/21 curved offspring fully active with no children at 100k; 33-39 units/world in attached unfinished rows | offspring_recovery.js (`OR_replay`) | separate incomplete rearming, unfinished material and actual child production | exact replay of 50, not fresh confirmation; 6/7 early-born curved offspring fully active; birth identities are observation only |
| 51b | Identical-state recycling forks | Does energy bypass or turnover restore an exact second cycle? | `energyGate`, `pFray` 0/0.00003, `pUnzip` 0/1 | lead | curved original offspring: 0/0 exact children control, 1/0 bypass, 2/2 turnover; turnover destroys 9/10 original rows and newborn means fall to 5.13/4.37 | offspring_forks.js (`OR_forks`) | test end protection against both completed and stalled-row lifetimes | 2 reused seeds, 50k forks; not pure monomer manipulation, steady persistence or shape advantage |

| 52a | Capped curved copying | Can the protected ten-letter sequence copy? | `compCopy`, `capFray` 0, `bendA` -20, `bendB` 20, `stiffP` 0.5, `stiffQ` 0.5 | works | 20k exact copies: square 5/5, curved 3/2; all 15 births exact generation 1 | end_protection.js (`EP_copy`) | copying viability before turnover | 2 seeds; no fuel/rearming; different sequence and material from earlier worlds |
| 52b | Selective end protection | Do caps preserve full rows while clearing incomplete ones? | `capFray` 0/1, `pFray` 0.00003, `pUnzip` 1 | negative | capFray=0 preserves full and attached-partial rows at 50k; detached partials lose an original bond at 11,074/11,299 | end_protection.js (`EP_lifetime`) | docking protects the other end; no capped ecology sweep | prepared no-spare-material fixture; 2 seeds; completed/partial fixtures differ in mass; fragile attached seed 82 censored |
| 52c | Naturally protected unfinished ends | Does the protected arrangement arise in ordinary copying? | `capFray` 0, `pUndock` 0.1 | works | all 21 row-samples lack fray-eligible ends: 15 cap-ended, six capless with both ends docked | end_protection_natural.js (`EP_natural`) | patch formation versus exact completion | exact replays, repeated 5k snapshots in four worlds; protection from fraying is not proof of permanent arrest |
| 53a | Undocking versus exact completion | Does stronger lone-monomer undocking improve capped copying? | `pUndock` 0.1/0.3/1 | negative | curved 50k copies 7/6 at 0.1, 1/4 at 0.3, 0/0 at 1; square also loses yield | patch_completion.js (`PC_screen`) | neither stronger rate earns confirmation | two seeds, no fuel/turnover; no optimum or lower-rate claim |
| 53b | Productive mergers and overlapping prefixes | Are separate patches necessarily wasted assembly? | `pUndock` 0.1/0.3 | works | 10/13 curved control copies combine two nuclei; one 0.3 world has two overlapping prefixes aged over 36k despite 117 free monomers | patch_completion_summary.js (`PC_screen`) | measure local endpoint obstruction in selected stalled world | correlated within-world histories; completed-only times exclude censoring; no permanent-arrest or shape-benefit claim |
| 54 | Anchor accessibility in a selected stall | Is progress blocked by occupancy, fit or delivery? | `pUndock` 0.3, unchanged chemistry | works | 35k samples: one next site always occupied; the other sees 8,146 compatible geometry checks but only 4 dockings; 428 anchor linking checks all fail gap | anchor_access.js (`AA_selected`) | separate local attachment and useful placement | exact replay of selected seed 83; repeated checks, no causal removal experiment; full saved-state/RNG neutrality |
| 55 | Contact-gated assembly fronts | Can neighbor-triggered exposure improve completed assembly? | research-only L/R face gate, `pUndock` 0.1 | negative | curved 50k output 7/4 control, 3/2 L, 3/4 R; all 45 births exact; neither gate qualifies | assembly_front.js (`AF_screen`) | reversible positioning of linked parts, not an interpreter | two seeds; fewer unfinished rows and fewer mergers do not mean better output; no new core rule or universal-construction claim |
| 56 | Selected placement blocker and release | Can freeing an attachment rescue the stalled assembly without fragmentation? | prepared DOCK→REPEL + F release, `pUndock` 0.3 | works | all 43 rejected placements excluded by anchor 87; release 87/107/both gives 3/3/2 new exact copies versus 0; retained original prefix completes | placement_release.js (`PR_selected`) | test local reversible docking and useful reattachment separately | one selected 15k state; released pieces remain inactive; forced partial birth logs excluded; all 150 blocks and lateral bonds preserved |
| 57a | Intact local redocking | Can released material dock again and complete? | research-only SEEK, endpoint rate 0.0001/0.001 | works | 1 exact reused product at each rate versus 0 off/irreversible; original six-member prefix completes at 31,568 at low rate | local_redocking.js (`RD_selected`) | fresh screen at predeclared lower rate | one selected state; full detachment/member retention reconstructed; stock births can miss later completion |
| 57b | Redocking yield and fidelity | Does general endpoint release improve ordinary assembly? | research-only SEEK, endpoint rate 0.0001, `pUndock` 0.1 | negative | curved exact 5/7 vs 2/5 off, square 7/8 vs 8/10; two nine-unit errors after one-site shifts; confirmation criterion fails | local_redocking_screen.js (`RD_screen`) | physical registration on repeated letters | two-seed curved yield lead, 5 fully detached parts reused in exact curved products; no promotion, tuning or long confirmation |
| 58 | Shape retention after release | Does higher stiffness prevent the selected shifted returns? | `stiffA`/`stiffB`/`stiffP`/`stiffQ` 0.5/0.8, `iters` 4/8 | negative | all 8 first returns shift; 0 intact exact target completions; curved +100 corner RMS falls about fivefold but alternatives stall | registration_fit.js (`RF_selected`) | test availability/usefulness of a second contact before adding a rule | two selected post-release states, +5k; square errors persist, unfinished curved outcomes are censored; no new chemistry |
| 59a | Prepared supporting contact | Can a real second contact preserve useful alignment? | existing DOCK/HOLD fixture, unchanged chemistry | works | square 1/9 candidates fits, curved 0/21; DOCK/HOLD rescue exact target in both placement orders, placement-only does not | second_contact.js, second_contact_order.js (`SC_selected`, `SC_scan_order`) | establish support before release using local state transitions | selected square fixture; 1 physics phase suffices; longer HOLD not consistently faster; no autonomous capture mechanism |
| 59b | Natural secondary-face exposure | Does exposing an available face acquire the useful contact? | prepared REPEL→SEEK only | negative | neighbor docks at shifted site3 and releases within step5329; zero constraint phases; target still PAAAABBBQ | second_contact_exposure.js (`SC_exposure`) | local contact handoff, retaining support through physics | same selected state; no bond/pose/RNG edit; no fresh screen or extra exposed members |
| 60a | Autonomous contact handoff | Can a neighbor acquire support before local release? | research REQUEST/OFFER/LATCH, previous-pass side marks | works | square capture 5318, release 5319, correct return 5320; support 2 physics phases, exact target at 7728 | contact_handoff.js (`CH_selected`) | test usefulness against waiting in the original two-prefix obstruction | one selected state; no prepared bond, ID read, kick or new material |
| 60b | Handoff benefit and availability | Does the handshake outperform waiting and work when curved? | matched seek/wait/pulse/hold, +5k | negative | square wait exact at 6619 and pulse at 6048, both sooner than hold; curved request arms acquire no support and remain unfinished | contact_handoff.js (`CH_selected`) | no fresh screen, extra states or rate tuning | no efficiency benefit demonstrated; curved outcomes censored, not permanent arrest; default engine unchanged |
| 61 | Uncapped recipient dependence | Does recipient reproduction require shared-product interactions? | `pBindP` 0/0.2, `transStart` absent P/off, `pLinkBare` 0.01, `bindAny` | lead | recipient-parent births 18/24 on, 0/1 no binding, 2/1 no production; detached exact output 15/18 versus 0/1 and 2/1 | recipient_dependence.js (`RD_dependence_screen`) | unchanged four-arm confirmation, fresh seeds 105–108 | two screen seeds plus two viability; fixed 1,000 blocks; producer-parent output 48/58; no frequency dependence or novelty |
| 62 | Fresh recipient-dependence confirmation | Does the fixed dependence criterion hold across four fresh worlds? | `pBindP` 0/0.2, `transStart` absent P/off, `pLinkBare` 0.01, `bindAny` | negative | 2/4 pass; recipient binding effects +16/-1/+22/+4, production +21/+3/+21/+4; producers reproduce in all four | recipient_dependence.js, recipient_confirmation_summary.js (`RD_dependence_confirm`) | park this setting; P2 material-budget derivation next | positive means +10.25/+12.25 do not pass the all-four gate; 106 reverses detached exact binding effect, 108 misses +5 threshold |
| 63 | Scarce-material contact-table accounting | Does wider organization save material per renewing fragment? | offline table 670873, n=1..8, T1 scarcity, three-column cuts | partial | all 1,020 states: no T1-free ideal cycle; gross T1 1/2,3/8,3/10 for n=1,2,3; narrow cut can return every T1 | resource_economy.js (`RE_670873_20260926`) | physical turnover gate incomplete; P4 heredity assay next | analytical deliverable complete; no physical runs, autonomous cuts, survival rates or reproductive advantage; fixed finite-stock budgets and all cut phases retained |
| 64 | Exact-structure random-chemistry heredity | Does table 55 propagate two prepared variants beyond founder material? | fixed table 55, copyTable control, bodyJostle, seeded/disrupted/plain | negative | 0/4 random cases pass: V0 seeded 8/3 vs disrupted 10/3 and plain 5/8; V1 seeded 0/0; copying control 4/4 pass | random_heredity.js, random_heredity_summary.js (`RH_20260926`) | park this pair; recover existing table 57 before one further bounded assay | two bath seeds, same-composition variants, exact graphs and full bond replay; no random renewal witnesses; contact witnesses are not sufficient pedigrees |
| 65 | Second random-chemistry heredity candidate | Does table 57 transmit two persistent equal-composition variants? | fixed table 57, copyTable control, bodyJostle, seeded/disrupted/plain | negative | 0/4 random cases pass: V0 seeded 37/34 vs plain 64/40; V1 seeded 8/2 vs disrupted 2/2 and plain 7/5; copying control 4/4 pass | random_57.js, random_57_screen.js (`R57_20260926`) | park further candidate screening; P3 inherited geometry next | two BBB side-graph variants pass calibration; full bond replay; V1 partial effect misses gate; V0 witnesses also arise in plain baths, not sufficient pedigrees |
| 66 | Equal-composition shape and descendant renewal | Does inherited arrangement improve exact offspring renewal under matched fuel/shape controls? | `bendA`/`bendB` 0 or opposed20, `pGrip` 0/0.2, `pFray` 0.00003, `pUnzip` 1 | negative | opposed20 AAAABBBB/ABABABAB reproducing offspring 2/0 vs 3/3; first seed's +1 misses fixed +2; alternating reaches generation three in both | sequence_shape.js, sequence_shape_summary.js (`SS_screen_20260927`) | park preparation; P2 polygon-port and physical turnover feasibility next | 2 viability + 2 fresh seeds; 16 matched 100k worlds; active founders, all lost; rejected observer pilot preserved, corrected replay physically identical; no core change or P0 promotion |
| 67 | Resource-economy polygon-port preflight | Can the proposed contacts fit and remain accessible under existing numerical mechanics? | prepared six-corner rectangles, `sizeB`/`sizeC` sqrt(2)/2, `iters` 4/16, `bodyJostle` on/off | partial | all 96 port layouts fit; area sizing excludes 72/960 internal contacts; long sizing rejects 96/96 front placements; 0.4 overlap persists at 16 passes | resource_ports.js, resource_ports_summary.js (`RP_preflight_20260927`) | targeted research-only polygon contact/placement correction before growth | 120 prepared 100-step fixtures + 16 steric probes; all replay exactly; zero autonomous bonds or turnover; square controls, conserved material, unchanged core |
| 68 | Polygon-aware contact comparison | Does correcting exclusion/search/placement resolve the measured rectangle failures? | research convex envelopes, `sizeB`/`sizeC` sqrt(2)/2, `iters` 4/16, `bodyJostle` on/off | works | all 192 front placements pass; steric witnesses corrected; body/zero 72/72 exact; individual16 eligible 24/24 vs 15/24 baseline | polygon_contact.js, polygon_contact_summary.js (`PC_compare_20260927`) | bounded actual first/second-contact acquisition with pin and retention measurements | prepared geometry only; 272 paired trajectories replay; worst individual16 target gap 0.7515, existing-pin gap 0.2328; convex envelopes approximate concavities; no chemistry or core change |
| 69 | Actual first/second port acquisition | Can unbound parts acquire and persist at two intended contacts under local rules? | immutable face labels, `associationEnabled`, `portLoss` 0.001, `linkDistTol` 0.15 endpoint check, `iters` 4/16/32, `bodyJostle` on/off | negative | body4 success free 2/6, prepared 12/12; individual16/32 free 0/6, prepared 1/12 each (square); controls 0/54 | port_acquisition.js, port_acquisition_summary.js (`PA_screen_20260927`) | park tested P2 setting; C1 unchanged original-obstruction closure next | 12 viability + 108 conserved 500-step worlds; full replay and bond histories; no protected scaffold; two off-target compatible contacts; no growth/turnover or core change |
| 70 | Original-obstruction handoff closure | Does retained support beat waiting and reuse an original prefix intact? | unchanged SEEK/request hazard 0.0001, REQUEST/OFFER/LATCH, `bodyJostle` true, `iters` 4 | negative | useful exact ordinary/SEEK/wait/pulse/hold 0/1/0/1/0; hold makes four supported releases and same-site returns without completion | handoff_closure.js, handoff_closure_summary.js (`HC_original_20260927`) | park C1; Q0 evidence synthesis and one prospective distinct-hypothesis assay plan next | one selected 150-block state, five 35k forks; no new rules; full replay/neutrality/restart and independent reconstruction; no active or reproducing descendants |
| 71 | Q0 portfolio and short-variant census | Does shortening preserve witnessed inherited renewal beyond the exact founder family? | offline existing `pGrip` on/off and square/opposed `bendA`/`bendB` histories; no simulation | lead | 83 fueled productive short parents and 39 overlapping two-link chains across eight on worlds; zero off; four family/preparation/shape candidates repeat across both seeds | short_variant_summary.js, short_variant_analysis_test.js (`SV_census_20260927`) | Q1 frozen five-letter common-environment assay; earlier benefit gates remain failed | all 16 archived section-66 worlds, reused seeds 203/204; retrospective selection; square dimers qualify; unregistered fragments limit ancestry; no causal benefit or complexity claim |
| 72 | Five-letter common-environment test | Does the observed alternating variant have an inherited arrangement benefit under matched shape/fuel controls? | `bendA`/`bendB` square/opposed20, `pGrip` 0/0.2, fixed `pFray` 0.00003 and `pUnzip` 1 | negative | opposed20 primary 10/3 and 9/8 alternating/rearranged; square 12/18 and 10/2; seed 304 fails minimum contrast and interaction; 359/360 primary fuel witnesses involve outside holders | short_variant_garden.js, short_variant_garden_summary.js, short_variant_garden_report.js (`SVG_screen_20260927`) | park Q1; offline Q2 fuel-support partner/renewal audit before any simulation | 2 viability + 2 fresh seeds, 20 worlds / 1.68M steps; strict exact/fueled parent mapping; all founders lost, short variants retained; core unchanged; no P0 promotion |
| 73 | Fuel-support partner audit | Do recurring renewing partners stand out from available contact opportunities? | offline `pGrip` on/off, square/opposed `bendA`/`bendB` archives; no simulation | inconclusive | 1680/2611 events covered; 117 reciprocal pairs, 8 repeated both ways, 1 renewing primary; none above reference q95; alternatives in 3.3–6.2% of covered events | fuel_support.js, fuel_support_analysis_test.js (`FS_audit_20260927`) | park Q2 candidate source; Q3 ecological delivery diagnostic design before replay | all 16 section-72 worlds; 199 lifetime-respecting reference draws per world; 9.327 CPU seconds, zero steps; unknown charge/identity and sparse alternatives limit inference; fixed nomination gate fails |
| 74 | Delivery diagnostic fixture gate | Can an unchanged observer separate opportunity, binding, supported linking and physical output? | observer-only existing `catalysis`, `bindAny`, prepared `pBindP` 0/1 and `pLinkBare` 1 | works | all 12 prepared signatures pass; supported/bare output 1/1 but supported attribution 1/0; eight small neutrality/restart worlds, all prepared controls and active-binding restart match | delivery_diagnostic.js, delivery_diagnostic_test.js, delivery_diagnostic_analysis_test.js (`DD_fixtures_20260927`) | fixed Q3 retrospective replay plan; no original world replayed yet | 11.781 CPU seconds / 20k suite steps plus scheduled phases; six corruptions rejected; small worlds have no deliveries, positive paths tested in prepared cases; measurement only, no benefit or locality promotion |
| 75 | Archived ecological delivery replay | Do failed worlds share a qualifying delivery-stage bottleneck? | observer-only existing `catalysis`/`bindAny`, `pBindP` 0/0.2; unchanged historical parameters | inconclusive | all 16 histories reproduce exactly; on coverage 75.95–79.80% misses >=80%; seed 106 has 13 geometric opportunities/2 ended bindings; no signature | delivery_replay.js, delivery_replay_summary.js (`DD_replay_20260927`) | park Q3; Q4 offline causal-contrast portfolio checkpoint before any new assay | 800k steps / 3,581.703 run + 39.328 final-QA CPU seconds (unreserved QA exceeds total cap); continuous supported recipient output 16/0/13/3; full physical tapes, original follow-ups, all controls and unknown/censored categories retained; no core change or benefit claim |
| 76 | Portfolio after delivery (static design review) | Does either causal contrast earn another assay? | no executed intervention; compare efficacy suppression with retained binding and pairing-mode mechanical renewal | inconclusive | 2 options compared, 0 plans earned, 0 simulation steps; no new empirical outcome | portfolio_after_delivery.md | identify an inherited physical operation and same-material causal benefit against simple renewal before admitting a plan | efficacy can change producer supply; fit rescue lacks a predicted extra function; cost ceilings are design admission conditions, not launched batches; all prior failed gates retained |
| 77 | Prepared geometric error discrimination | Can unchanged shape and ordinary undocking reject a wrong docked letter while retaining correct joining? | existing `compCopy`, opposed `bendA`/`bendB`, `pUndock` 0.1, `pSoft` 0.002; proof off; body4/individual16 | negative | 96 valid cases; square/opposed correct joining 4/4 vs 3/4; wrong joining 8/8 vs 2/8 body, 4/8 individual; wrong-member loss only 1–3/8 (<4) in every stratum | geometric_error.js, geometric_error_test.js, geometric_error_report.js (`GE_20260927`) | park this preparation; no context selection, shape/rate tuning, proof rule or population follow-up | AA favors both wrong placements over correct; no censoring or simultaneous-loss ambiguity; 48k steps including neutrality/restart plus 9.6k prepared physics passes, 11.948 measured CPU seconds including QA/report; fixed 16-block inventory, unchanged core |
| 78 | Prepared passive duplex repair | Can an intact face-bound support retain broken ends for ordinary ligation? | existing `pLigate` 0.02/0, `pHyb` 0, `pMelt`/`pMeltEnd`/`pMeltRun` 0; body4/individual4/individual16 | lead | bridge repair 12/12; split/unbound/no-ligation 0/12 each; uncut stability 12/12; every seed/physics gate passes | duplex_repair.js, duplex_repair_test.js, duplex_repair_report.js (`DR_20260927`) | freeze a small autonomous acquisition/repair/release plan before reproductive testing | 60 eight-block worlds, 75,060 ordinary steps including QA continuations; 16.121 measured CPU seconds including analysis; all bound faces remain occupied, zero births; no core change, two seeds not confirmation |
| 79 | Passive repair acquisition/release prerequisites | Can ordinary binding acquire support and ordinary melting free repaired material? | existing `pHyb` 0.2/0, `pLigate` 0.02/0, `pMelt` 0.1/0, `pMeltRun` 0.001/0, `pMeltEnd` -1/0; body4/individual16 | negative | all 8 on gate cells fail; acquired bridge 2/8, acquisition-release 0/8, prepared repair 8/8 but release 0/8; noBind prepared repair-release 7/8 | duplex_cycle.js, duplex_cycle_test.js, duplex_cycle_report.js (`DC_20260927`) | park setting; require a distinct passive-escape geometry prediction before another assay | 64 eight-block worlds, 800k steps including neutrality/restart; 131.184 measured CPU seconds with QA; 6 synthetic and 5 corruption checks pass; zero births, no new-neighbor joins; acquisition supplied in release controls, no natural-damage cycle |
| 80 | Passive escape geometry admission | Does the existing free-face fold physically prevent endpoint reattachment? | `foldA`/`foldB` 0/45, `stiffA`/`stiffB` 0.8/1, `iters` 4/16, `sigma`/`sigmaRot` 0; reactions off | lead | both solver gates pass: fold45 ineligible after 3/1 steps; controls eligible; final mismatch 43.81 degrees, retained-pin residual 0.0633 | passive_escape.js (`PE_geometry_20260927`) | freeze one matched kinetic acquisition/rebinding test; no repair or population promotion | six prepared four-block worlds, 2100 steps including neutrality/restart/replay, 1.326 measured CPU seconds; no stochastic replicates, chemistry or turnover; core unchanged; geometry only |
| 81 | Junction-cap architecture admission | Can caps retain copy/fuel access in a four-port budget, and can cuts alone divide a rim? | offline four-port counts; cycles 8/12/16; zero simulation knobs | works | separate cap/J requires 4/3 ports versus direct cap 5 with fuel; cuts alone 0/253 two-cycle outcomes; reclosure gives 4/9/16 anchor-complete graph witnesses | junction_topology.js (`JT_20260927`) | actual cap/J copying and fuel access geometry; Q7b deferred by user direction | exact static enumeration, not physical fit, acquisition, division or evolution; 534 reconnection pairings, length oracle and corruption check; unchanged core |
| 82 | Half-cell cap access geometry | Can angled rim ports coexist with ordinary copying/rail and fuel contacts? | research cap/rest polygons; `stiffA`/`stiffP`/`stiffQ`/`stiffC` .8; `sigma` .3, `sigmaRot` .45, body4/individual4/16; chemistry off | lead | 84 static placements pass; attached held gate body4 4/4, individual16 4/4, individual4 0/4; all 24 fixtures clear after imposed face loss, but released overlap reaches .2613 area | half_cell_geometry.js, half_cell_geometry_report.js (`HC_geometry_20260927_v2`) | targeted released-contact comparison and distinct rim interface before chemistry; radiation benefit remains hypothetical | 24 eight-block fixtures, 17,300 physics steps including failed attempt/QA; 11.138 measured CPU s plus untimed preliminary aggregation; exact replay/neutrality/restart pass; first cache failure/source snapshots retained; no arc growth, ordinary release, descendants or core change |
| 83 | Half-cell contact and solver check | Can existing polygon exclusion control released overlap while retaining cap access? | core/polygon contacts; body4/individual16, then separately frozen body16; same Q8a inventory/kicks/stiffness; chemistry off | lead | original polygon gate 15/16 (fails); body4 A/A overlap .07367 after final pin correction, A/E .21565; body16 follow-up 8/8 plus individual16 reference 8/8 pass all-pair bound, maxima .001207/.000678 | half_cell_contact.js, half_cell_contact_validate.js, half_cell_resolution.js (`HC_contact_20260927_v2`, `HC_resolution_20260927`) | Q8c distinct rim interface and local association at body16/individual16; body4 parked for this assay | 32 paired worlds plus 8 resolution worlds; 28,116 physics steps including replay/diagnosis; 28.539 measured CPU s including failures/archive; full replay, neutrality/restarts and corruption checks; two harness failures retained; reused seeds, no chemistry, descendants or core edits |
| 84 | Separate rim chemistry and recruitment | Can a cap retain chain semantics and acquire W through local end contacts? | research `rimBind` on/off; separate rim bonds; fixed end labels, .1 gap/10-degree normals; body16/individual16; seeds 701/703 | negative | prepared release 8/8 at t1, stubs retained; near/on recruitment 0/8 versus off 0/8; zero eligible encounters at 2,400 binding phases; transient initial overlap up to .235433 | half_cell_rim.js, half_cell_rim_assay.js, half_cell_rim_diagnose.js (`HC_rim_20260928`) | retain interface; freeze existing free-W docking comparison against failed passive rule/off control; no timing/tolerance/horizon rescue | 24 worlds; 24,823 physics steps including tests/QA/diagnosis; 32.980 measured CPU s; full replay/neutrality/restart, 12 chemical cases and four corruption checks; no curved arc, full chain acquisition or descendants; core unchanged |
| 85 | Ordinary polymer capture for W | Does reusing native polymer attachment remove an unnecessary alignment restriction? | `pMem`=.2, existing `memLinkTol`/`linkDistTol`; W always sticky; same Q8c worlds; no fuel/state gate | negative | functional cap attachment 2/2 and W/W extension 2/2; native-M geometry 24/24; prepared release 8/8; sparse recruitment 0/8 with only one eligible attempt in 2,400 phases | half_cell_polymer.js, half_cell_polymer_assay.js, half_cell_polymer_test.js (`HC_polymer_20260928_v2`) | retain simple automatic binding; retire sparse preparation; check angled-contact relaxation against native M before curved growth | 24 worlds; 22,400 physics steps; 28.199 measured CPU s; full replay/neutrality/restart, 16 archived control state/RNG matches, four corruption checks; missing-size test-adapter failure/source retained; no kinetic promotion or core changes |
| 86 | Angled polymer joint mechanics | Do prepared eligible W joints align and leave the next end accessible? | prepared on/off; 30-degree corner contact; `iters`16, stiffness.8, body/individual kicks; native M benchmark | lead | final gate 16/16 W and 8/8 native M; unbound aligned 0/24; maximum final pin .080312/overlap .009121; transient Q-extension overlap .223063 | half_cell_settle.js, half_cell_settle_report.py (`HC_settle_20260928_v5`) | derive one curved W polygon and complete D-shaped seed geometry; no timing state or bath-growth promotion | 48 five-block worlds, fresh seeds733/739, 60 steps; 10,081 total physics steps with QA; 10.712 measured CPU s; 48 neutrality/restarts, 2,928-frame replay, four corruption checks; four zero-step harness failures/sources retained; imposed bonds, no chemistry/acquisition/descendants; core unchanged |
| 87 | Complete paired D geometry | Can identical curved W close behind a capped chain and preserve copying/release space? | eight W per P-A-A-Q; closed/open control, body/individual kicks, `iters`16 then separately frozen32; physics only | negative | static fit/access passes; all pairs separate after imposed release; closed gate body16 2/2, individual16 0/2; at32 3/4 overall, seed769 held overlap .021333 > .02; all closed released windows pass at32 | half_cell_arc.js, half_cell_arc_diagnose.js, half_cell_arc_resolution.js (`HC_arc_20260928`, `HC_arc32_20260928`) | park dynamic settings; narrowly audit bonded A/A exclusion/constraint residual before any distinct correction; no third resolution or chemistry promotion | 16 prepared 28-block worlds, seeds761/769, 120 steps; 6,792 total physics steps, 121.401 measured CPU s; 16 neutrality/restarts, 1,936 replay frames, eight corruption checks, neutral diagnosis; no harness failures; imposed bonds/release, no acquisition/descendants; core unchanged |
| 88 | Live half-cell chemistry integration | Can curved W, ordinary chain chemistry and the viewer run together without scheduled splitting? | ordinary Sim.step; `pMem` .2, `pMelt`/`pMeltRun`/`pMeltEnd` and `pReload` restored; body/individual16; paired/contact/bath starts | lead | prepared pair release4/4 at t1; stationary loose contacts form/release chain and rim with pMem=1, off controls no rim; moving acquisition0/8 complete cells, one W bond; maximum overlap .194134 | half_cell_live.js, half_cell_live_assay.js, tools/half_cell_server.js (`HC_live_20260928`) | bounded free-bath on/off screen before reproduction claims; keep geometry caveat and no timing program | 12 worlds, seeds787/797,120 steps; 5,112 timed physics steps plus123 untimed smoke/browser steps;64.326 measured CPU s;12 neutrality/restarts,1,452-frame replay, four invalid-save cases, HTTP/UI checks; no failed harness; manifest fuel-note erratum retained; core unchanged |
| 89 | Free-bath half-cell acquisition | Can the live seed acquire a new half-cell from loose conserved material? | `rimBind` on/off, `pMem` .2, body16, unchanged Q8g runtime | negative | on acquires6/7 rim bonds; all four worlds have0 new rails/capped chains/cells; ordinary placement rejects39/44 attempts; E stays charged; sampled overlap .203795 | half_cell_bath.js, half_cell_bath_summary.js (`HC_bath_20260928`) | park bath setting; diagnose actual rejected placements before longer runs or timing/fuel changes | fresh809/811 x on/off x50k,28 blocks, one-offspring inventory;404,500 total physics steps,3,768.891 measured CPU s;4 full neutrality/restarts,404-frame and every-step bond-tape replay, three corruption checks; no censoring/harness failures; preflight/figure revisions preserved; core/runtime unchanged |
| 90 | Half-cell placement rejection replay | Which geometry rejects ordinary acquisition, and what earlier filters precede it? | unchanged Q8h body16; read-only placement/stage wrappers; stationary prepared contact and exact square controls | works | all34 free rejects hit an anchor neighbor, none the partner or W;5 bound caps miss .1 gap;44/6,499 compatible tests reach placement,5 bind; core accepts39 rejects but35 increase overlap | half_cell_placement.js, half_cell_placement_summary.js (`HC_placement_20260928`) | freeze current projection versus in-place edge-pin settling with unchanged exclusion and waiting controls; no bath promotion | four archived50k replays,200,274 total steps,1,679.275 measured CPU s;44 checkpoint and4 final matches, full successful-event tapes,44 restored attempts, prepared7/7 and square2/2, three corruptions rejected; no censoring/failures or runtime changes; geometry diagnosis only |
| 91 | In-place half-cell face capture | Can incident pins settle admitted contacts while preserving existing joints and next-rail fit? | isolated pins/project/wait; body16/individual16; 60 physics steps, no chemistry | negative | target alignment38/38 both modes; full bath gate37/38 body and0/38 individual; moving prepared controls4/4 and0/4; final-window overlap .198082 | half_cell_capture.js, half_cell_capture_controls.js (`HC_capture_20260928`) | park candidate and current half-cell acquisition branch; portfolio favors freezing deferred Q7b acquisition/rebinding test | 42 correlated saved contacts x3 arms x2 modes plus24 corrected controls;58,222 total steps,549.494 measured CPU s;276 neutrality/restarts,16,836 replayed frames,3 corruptions; failed cache preflight and original stationary-control deviation retained; no censoring or live/core change |
| 92 | Passive-fold kinetic race | Does the existing free-face fold beat rebinding while retaining bridge acquisition? | `foldA`/`foldB` 0/45, `stiffA`/`stiffB` .8, `pHyb` .2, `pMelt` .1, `pMeltRun` .001, `pMeltEnd` -1, `pLigate` .02; body4/individual4/individual16 | negative | direct escape straight/fold 5/11, 4/9, 4/12; sustained bridges 5/0, 7/2, 7/0; gate fails every mode (straight fixture validity and fold retention) | passive_fold_kinetics.js, passive_fold_kinetics_validate.js, passive_fold_kinetics_report.js (`PF_20260928`) | park fold candidate and the passive repair branch; no angle/stiffness/rate/horizon rescue | 192 four-block worlds, seeds 7301–7316, 1,000 kinetic steps; about 693,200 steps incl. neutrality/restart/replay, about 21.5 measured CPU s; built-in validator failed on a CRLF core-hash comparison, replaced by a separate normalized validator; no births or lateral changes; core unchanged |
| 93 | Time-step resolution of near-encounter binding | Does prepared acquisition depend on the time step when kicks scale by sqrt(dt) and probabilities by 1-(1-p)^dt? | `sigma`/`sigmaRot` x sqrt(dt), `pHyb` .2, `pMelt` .1, `pMeltRun` .001, `pLigate` .02 rescaled; dt 1, 1/4, 1/16; body4/individual4/individual16 | works | sustained bridges /32 at dt 1/(1/4)/(1/16): body4 10/14/14, individual4 8/8/17 (p .039), individual16 9/9/15; direct escape falls 9–11 to 4 in every mode; frozen verdict sensitive toward more acquisition, not converged | time_resolution.js, time_resolution_validate.js, time_resolution_report.js (`TR_20260928`) | freeze one RESULTS 79 acquire/on re-screen at a finer step with a dt 1/64 dimer rung; default-step change is a user cost decision | 576 four-block worlds, seeds 7301–7332; dt 1 seeds 7301–7316 reproduce RESULTS 92 exactly; about 14.2M steps incl. neutrality/restart/replay, 411.7 measured CPU s; three concurrent workers; core unchanged; one fixture, no gate reopened |
| 94 | Double strands under damage | Do binding, heat cycles and ligation let repair make length pay under radiation? | `compCopy`, `pHyb` .2/0, `pLigate` .02/0, `pBreak` 1e-5/0, `heatPeriod` 5000 | negative | late parent length dsRad/ssRad 6.9/4.0 and 5.6/4.2, but without radiation 13.9/7.2 and 18.0/5.8; no-ligation ds shorter; not damage-specific | duplex_damage.js (`DD10`) | no rescue; double-strand ligation length behaves like accumulation with sequestration (12–18 vs 85–88 late births) | 12 worlds x 150k plus 4 calibration worlds; about 2,070 process-seconds; screen tier, 2 seeds; core unchanged |
| 95 | Half-cell in-place capture, live (reopened) | With body motion, does in-place capture let the live half-cell assemble a new D? | research pins versus projection; body16; `rimBind` on | negative | contacts novel chain 1/8 vs 0/8, closed 0/8 both; bath 0/4 both; 2–3 face docks per 50k; W sequestered in rims/rings | half_cell_fast.js (4x, bit-identical), half_cell_pins.js (`HCP_20260929`) | test an abundant soup (more loose material) before any other half-cell mechanism | 16 contacts + 8 bath worlds; about 1,000 CPU s; screen-tier QA; exploratory reopening, RESULTS 91 unchanged |
| 96 | Half-cell abundant soup | Does the live half-cell copy when loose parts are abundant? | founder D + K loose inventories (K 4/8), body16, project/pins | negative | one novel chain in 8 worlds, no closed D; W cap-bound 35–40/40 and 53–65/72, free W rings 13–14; loose A dimers dock on the founder but bulky W-loaded caps rarely arrive | half_cell_soup.js, half_cell_soup_screen.js (`HCS_20260929`); fast runtime 6.4x (bit-identical) | Q8m: rim growth only from anchored ends | 8 worlds x 50k, 72/128 blocks; about 4,800 CPU s incl. QA; exploratory |
| 97 | Half-cell anchored rim growth | Do rims that grow only from anchored ends (a cap in a chain, or a W already attached) let the soup copy? | research anchor rule (own bonds only), soup K 4/8, body16, project/pins | lead | novel chains 7/8 vs 1/8 ungated; novel closed D 3/8 vs 0/8; one separated active daughter D (K4 pins 1201, t 47,800); W stays free | half_cell_anchor.js, half_cell_anchor_figure.js (`HCA_20260929`) | fresh seeds, longer horizon, observer parent tracking for generation 2 | 8 worlds x 50k; about 5,000 CPU s; screen tier, one world; exploratory body motion, overlap up to .025 |
| 98 | Half-cell generations | Do daughter half-cells template further copies under the anchor rule? | anchor rule, soup K 4, body16, project/pins, 150k | lead | generation-2 chains in 7/12 worlds, closed generation-2 D in 3/12 (pins 1302/1305, project 1303); pins faster (closed gen-1 5/6 vs 1/6); chains never break so parentage is exact | half_cell_generations.js (`HCG_20260929`, post-hoc tape parentage) | confirmation-tier plan; add turnover and heritable variation | 12 worlds, about 9,800 CPU s; first multi-generation assembly reproduction in the project; finite material, fixed sequence, exploratory physics |

## Knob index

Generated by `node tools/ledger_index.js` from the table above (every knob in backticks in the Mechanism column, with
the rows that used it). Rerun it after adding rows.

<!-- knob-index -->
| knob | rows (verdict) |
|---|---|
| `backCopy` | 40a (works), 40e (negative) |
| `bareCaps` | 33b (works), 33d (works) |
| `bendA` | 15c (lead), 40f (negative), 49a (works), 49b (lead), 49c (lead), 50a (works), 50b (works), 50c (lead), 51a (negative), 52a (works), 66 (negative), 71 (lead), 72 (negative), 73 (inconclusive), 77 (negative) |
| `bendB` | 15c (lead), 15d (works), 48 (negative), 49a (works), 49b (lead), 49c (lead), 50a (works), 50b (works), 50c (lead), 51a (negative), 52a (works), 66 (negative), 71 (lead), 72 (negative), 73 (inconclusive), 77 (negative) |
| `bindAny` | 36a (works), 36b (works), 42a (works), 43a (negative), 61 (lead), 62 (negative), 74 (works), 75 (inconclusive) |
| `bodyJostle` | 37 (works), 47b (negative), 47c (lead), 49b (lead), 67 (partial), 68 (works), 69 (negative), 70 (negative) |
| `capFray` | 28c (lead), 33a (partial), 52a (works), 52b (negative), 52c (works) |
| `catalysis` | 34c (works), 42a (works), 74 (works), 75 (inconclusive) |
| `chiral` | 30 (partial) |
| `compCopy` | 29 (partial), 49a (works), 49b (lead), 49c (lead), 50c (lead), 52a (works), 77 (negative), 94 (negative) |
| `cut` | 26 (negative) |
| `cutMotif` | 26 (negative), 26b (inconclusive) |
| `endLoss` | 33a (partial), 33a' (negative), 33b (works), 43b (negative) |
| `energyGate` | 51b (lead) |
| `energyMode` | 3 (negative), 4 (negative) |
| `feed` | 14b (works), 14c (works), 14d (negative), 19b (inconclusive), 19c (works), 22 (negative), 33b (works), 40d (inconclusive) |
| `fold1` | 34b (works), 34e (negative), 39a (works), 44c (negative), 45b (lead), 45c (inconclusive), 45e (works) |
| `fold2` | 44c (negative), 45b (lead), 45c (inconclusive), 45e (works) |
| `foldA` | 28b (works), 39b (works), 39c (works), 41a (negative), 80 (lead), 92 (negative) |
| `foldB` | 39c (works), 41a (negative), 47a (works), 47b (negative), 47c (lead), 80 (lead), 92 (negative) |
| `foldD` | 28b (works) |
| `gRange` | 31 (partial) |
| `grip` | 39a (works) |
| `gStick` | 31 (partial) |
| `gStickF` | 31 (partial) |
| `gStickS` | 31 (partial) |
| `H` | 17 (inconclusive) |
| `heatFrac` | 29 (partial) |
| `heatPeriod` | 29 (partial), 94 (negative) |
| `hinge` | 10 (superseded) |
| `hingeMax` | 10 (superseded) |
| `iters` | 37 (works), 49b (lead), 50a (works), 50b (works), 58 (negative), 67 (partial), 68 (works), 69 (negative), 70 (negative), 80 (lead), 86 (lead), 87 (negative) |
| `linkDistTol` | 69 (negative), 85 (negative) |
| `make` | 16c (negative), 24 (negative) |
| `maxStrain` | 23 (works), 23b (works) |
| `maxStrainStrand` | 23 (works) |
| `memAngle` | 11 (superseded), 12b (inconclusive), 16 (negative), 16b (negative), 16d (negative), 24c (works) |
| `memFlex` | 11 (superseded) |
| `memLinkTol` | 24b (negative), 24c (works), 25c (works), 85 (negative) |
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
| `pBindP` | 34c (works), 44e (lead), 45c (inconclusive), 46 (negative), 61 (lead), 62 (negative), 74 (works), 75 (inconclusive) |
| `pBreak` | 8 (works), 10 (superseded), 11b (negative), 12 (works), 16 (negative), 16b (negative), 19 (works), 19d (negative), 35 (inconclusive), 40e (negative), 40g (negative), 94 (negative) |
| `pCapture` | 1 (works), 2 (works), 5b (negative), 14b (works) |
| `pCut` | 26 (negative) |
| `pFray` | 1 (works), 2 (works), 4 (negative), 5b (negative), 12 (works), 13 (works), 13b (works), 33a (partial), 44d (lead), 49c (lead), 50c (lead), 51a (negative), 51b (lead), 52b (negative), 66 (negative), 72 (negative) |
| `pGrip` | 50a (works), 50b (works), 50c (lead), 66 (negative), 71 (lead), 72 (negative), 73 (inconclusive) |
| `pHyb` | 18 (negative), 26 (negative), 26b (inconclusive), 27b (negative), 29 (partial), 78 (lead), 79 (negative), 92 (negative), 93 (works), 94 (negative) |
| `physics` | 15 (works) |
| `pLigate` | 3b (lead), 8 (works), 10 (superseded), 12 (works), 19d (negative), 27b (negative), 33e (negative), 33f (negative), 78 (lead), 79 (negative), 92 (negative), 93 (works), 94 (negative) |
| `pLinkBare` | 34c (works), 43b (negative), 47a (works), 47b (negative), 47c (lead), 48 (negative), 61 (lead), 62 (negative), 74 (works) |
| `pMelt` | 18 (negative), 78 (lead), 79 (negative), 88 (lead), 92 (negative), 93 (works) |
| `pMeltEnd` | 18b (negative), 78 (lead), 79 (negative), 88 (lead), 92 (negative) |
| `pMeltRun` | 78 (lead), 79 (negative), 88 (lead), 92 (negative), 93 (works) |
| `pMem` | 85 (negative), 88 (lead), 89 (negative) |
| `pMemDecay` | 16c (negative) |
| `pMisDock` | 30 (partial) |
| `pMisMelt` | 36c (works), 43a (negative) |
| `pocket` | 39b (works), 39c (works), 39d (inconclusive), 39e (inconclusive), 39f (partial), 41a (negative), 41b (works), 41c (inconclusive), 50a (works), 50b (works), 50c (lead), 51a (negative) |
| `pPMeltRun` | 44a (negative) |
| `pProof` | 38a (works) |
| `pReload` | 9 (negative), 14 (negative), 19b (inconclusive), 88 (lead) |
| `productFray` | 44e (lead), 45d (lead), 46 (negative) |
| `proof` | 38a (works), 38b (lead), 38d (works), 38c (negative) |
| `pSBind` | 40a (works), 40b (negative), 40c (negative) |
| `pSMeltEnd` | 40a (works) |
| `pSNuc` | 40a (works), 40b (negative) |
| `pSoft` | 1 (works), 2 (works), 5b (negative), 14b (works), 38b (lead), 38d (works), 44d (lead), 45e (works), 77 (negative) |
| `pSpont` | 7 (works), 11b (negative) |
| `pUndock` | 5 (works), 5b (negative), 12 (works), 13 (works), 13b (works), 15b (works), 52c (works), 53a (negative), 53b (works), 54 (works), 55 (negative), 56 (works), 57b (negative), 77 (negative) |
| `pUnzip` | 13b (works), 15b (works), 49c (lead), 51b (lead), 52b (negative), 66 (negative), 72 (negative) |
| `radBand` | 33g (lead) |
| `rayHit` | 25b (works), 25d (negative) |
| `relay` | 19c (works), 19d (negative), 22 (negative), 33b (works), 40d (inconclusive) |
| `resB` | 8 (works), 12 (works) |
| `resC` | 35 (inconclusive) |
| `resM` | 11 (superseded), 11b (negative), 16 (negative) |
| `shapeA` | 15c (lead) |
| `shield` | 19 (works), 19c (works), 22 (negative), 27b (negative), 33b (works), 40d (inconclusive) |
| `sigma` | 80 (lead), 82 (lead), 93 (works) |
| `sigmaRot` | 80 (lead), 82 (lead), 93 (works) |
| `sizeA` | 28 (lead) |
| `sizeB` | 67 (partial), 68 (works) |
| `sizeC` | 67 (partial), 68 (works) |
| `sizeD` | 28 (lead) |
| `sizeU` | 39a (works), 39e (inconclusive), 41a (negative) |
| `sizeX` | 25b (works) |
| `slack` | 10b (superseded), 12 (works) |
| `snapCorners` | 23 (works), 23b (works), 45a (works) |
| `spend` | 14d (negative) |
| `stack` | 40a (works), 40b (negative), 40c (negative), 40d (inconclusive), 40e (negative), 40f (negative), 40g (negative) |
| `stackHold` | 40b (negative), 40c (negative) |
| `stiff1` | 45a (works), 45b (lead), 45d (lead), 45e (works), 46 (negative), 47a (works) |
| `stiff2` | 45a (works), 45b (lead), 45d (lead), 45e (works), 46 (negative), 47a (works) |
| `stiffA` | 15 (works), 15b (works), 47a (works), 48 (negative), 49a (works), 58 (negative), 80 (lead), 82 (lead), 92 (negative) |
| `stiffB` | 47a (works), 48 (negative), 49a (works), 58 (negative), 80 (lead), 92 (negative) |
| `stiffC` | 82 (lead) |
| `stiffM` | 16d (negative), 23b (works), 24c (works) |
| `stiffP` | 52a (works), 58 (negative), 82 (lead) |
| `stiffQ` | 52a (works), 58 (negative), 82 (lead) |
| `sun` | 3 (negative) |
| `tether` | 24 (negative), 24b (negative), 25d (negative), 27b (negative) |
| `transCode` | 34a (works), 43a (negative) |
| `translate` | 34a (works), 42a (works) |
| `transStart` | 43a (negative), 61 (lead), 62 (negative) |
| `W` | 17 (inconclusive) |
<!-- /knob-index -->

## Current navigation

[ROADMAP.md](../ROADMAP.md) is the only ranked queue. This ledger records
observations and historical dispositions; a row's old "Points to" field is not
a current assignment. Follow later evidence when a lead has failed confirmation.

Prepared passive repair remains a physical-effect lead (78), but its ordinary
acquisition/release prerequisites fail (79), and the passive fold trades
acquisition for release (92). The repair branch is parked. No autonomous cycle or inherited
benefit is established. Q5 and all earlier failed gates remain failed. Use the roadmap for the next admitted slice and
[the brief handoff](../docs/NEXT_INSTANCE.md) for operational status. Detailed
completed briefs remain in the [Q5 roadmap snapshot](../docs/archive/ROADMAP-2026-09-27-Q5.md).
