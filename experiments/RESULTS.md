# Results

Measurements from the headless runner. **Sections 1 to 14 were measured on the rigid-body engine,
which was removed on 2026-09-23** (recover it from git at commit `b41557c` to reproduce them bit
for bit; their scripts now run on the polygon engine and give different numbers). Section 15 and
later are on the polygon engine, which is now the only one. Where a result was re-measured on the
polygon engine (length selection, section 15) it held.
Every run is deterministic per seed; the commands are in the `.sh` scripts next to this file and
`run_all.sh` reproduces everything in about 50 minutes on four cores. Tables come from
`summarize.js`, `births_by_length.js` and `mutation_rates.js` over `out/*.csv` and
`out/*.births.jsonl`. The same batches were run on the earlier rigid-body physics; every
conclusion below held there too, with different rates.

Unless stated otherwise: 80×80 torus, 400 A + 400 B monomers, 300 energy particles, one seed
strand `ABBABA`, jostle 0.3, unit-mode energy, ligation off. "Steps" are simulation steps; a
copy cycle for a 6-mer in a fresh bath is roughly 1,500 steps.

## 1. Phase 1: copying works, exactly

`node test.js` checks these on every change:

- With no seed strand and capture off, free monomers never bond to each other (20,000 steps).
- A seeded 6-mer is copied; every logged child equals the reverse of its parent; no strand of any
  other length appears; one sequence in the population.
- Unit-mode energy spent equals the number of re-armed units exactly. Strand mode spends about
  one particle per copy.
- Mass and energy particle counts are conserved under mutation and turnover; bond tables stay
  symmetric; two runs with the same seed give identical positions.

Two 30,000-step runs with every soft knob at zero (seeds 2 and 5, 60×60 world) produced 29 and
36 births, all exact, no chain of any length but 6, and the closest pair of unbonded squares in
the world never inside a side length. Three separate mechanisms that produced chimeras before
that test passed are recorded in the design doc, section 10.

`R_base` below is the same thing over 100,000 steps: births are all faithful until the free
monomer pool hits zero and every template is stuck holding a partial copy. That is the material
lockup the design predicted for a world without turnover.

## 2. One variation source at a time (`regimes.sh`, 100,000 steps)

| run | knobs | births | faithful | substitution | longer | shorter | mean length at end | distinct seqs | free monomers |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| R_base | none | 83 | 100% | 0% | 0% | 0% | 6.00 | 1 | 0 |
| R_soft | pSoft 0.02 | 81 | 83% | 17% | 0% | 0% | 6.00 | 10 | 0 |
| R_capture | pCapture 0.05 | 91 | 77% | 0% | 10% | 13% | 5.40 | 22 | 0 |
| R_fray | pFray 0.0003 | 4,027 | 98.6% | 0.4% | 1.0% | 0% | 2.06 | 5 | 365 |
| R_fraycap | pCapture 0.05, pFray 0.0003 | 2,869 | 89.5% | 2.3% | 5.8% | 1.0% | 2.45 | 15 | 207 |
| R_gentle_7 | pSoft 0.01, pCapture 0.01, pFray 0.0001 | 1,898 | 92% | 4.4% | 2.8% | 0.4% | 2.30 | 14 | 104 |
| R_gentle_8 | same, seed 8 | 1,841 | 92% | 4.9% | 2.3% | 0.6% | 2.26 | 12 | 90 |

What each source does:

- **Wrong-type docking** gives substitutions and nothing else. Length stays 6. At `pSoft` 0.02 about
  3% of dockings are wrong-typed and 17% of births carry at least one substitution.
- **End capture** gives insertions (a monomer sticks to a strand end) and, through gaps, both
  substitutions and truncations: a captured unit faces the fragment on the far side of the gap with
  an `END` side, the fragment answers `STICKY`, they only join at `pLigate`, so the near fragment
  leaves as a shorter strand. The longest strand reached 12 units and 22 sequences were in play.
- **Fraying** alone gives turnover (365 free monomers at steady state instead of 0) and a
  fifty-fold jump in births, almost all of them dimers and trimers. Length collapses to 2 within
  30,000 steps. Fraying is itself a mutation source: 1% of births are longer than their parent,
  because a template end frays after its copy unit has released.
- **Gentle** (all sources at low rates) keeps nine tenths of births faithful and a dozen sequences
  in play, and still collapses to length 2.3.

Soft probabilities are per step of contact. A free monomer sits in front of a face for a few
steps, so `pSoft` 0.02 gives 3% wrong-typed dockings, not 2%; on the earlier rigid-body physics,
whose contacts lasted longer, the same setting gave 6%.

## 3. Does anything besides cooperativity hold length up? (`length_selection.sh`, 150,000 steps)

Mutation and turnover on (pSoft 0.02, pCapture 0.05, pFray 0.0003), varying how energy is
supplied. `unit`: every released unit needs its own particle. `strand`: one particle re-arms a
whole strand, caught by any of its N back sides. E40 uses fewer particles and a slower reload.
`sun`: particles reload only inside a disc of radius 12. Mean length counts templates that are
being copied as well as free strands.

| run | energy | mean length | max | strands | births | distinct | entropy (bits) | E on | free |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| L_unit_E300_11 | unit, 300 | 2.46 | 5 | 146 | 5,611 | 16 | 2.96 | 251 | 279 |
| L_unit_E300_12 | unit, 300 | 2.52 | 5 | 148 | 5,070 | 16 | 3.02 | 260 | 244 |
| L_strand_E300_11 | strand, 300 | 2.49 | 6 | 155 | 5,380 | 19 | 2.96 | 281 | 238 |
| L_strand_E300_12 | strand, 300 | 2.74 | 6 | 137 | 4,675 | 22 | 3.52 | 285 | 214 |
| L_unit_E40_11 | unit, 40 | 2.51 | 5 | 78 | 2,520 | 14 | 3.02 | 15 | 531 |
| L_unit_E40_12 | unit, 40 | 2.45 | 5 | 73 | 2,653 | 13 | 2.77 | 17 | 553 |
| L_strand_E40_11 | strand, 40 | 2.47 | 5 | 137 | 4,233 | 14 | 2.91 | 17 | 315 |
| L_strand_E40_12 | strand, 40 | 2.57 | 5 | 140 | 4,289 | 19 | 3.17 | 20 | 279 |
| L_sun_strand_11 | strand, sun | 2.53 | 5 | 144 | 4,643 | 17 | 3.07 | 33 | 282 |
| L_sun_strand_12 | strand, sun | 2.54 | 6 | 140 | 4,321 | 16 | 3.06 | 39 | 293 |

Every configuration lands between 2.45 and 2.75. Strand-mode energy does not hold length up;
under scarcity it only supports more strands (137 against 75), because one particle re-arms a
whole strand. The sun patch changes where things happen, not what. Roughly one birth in six
carries a mutation in these runs (84% faithful, 8% substitution, 6% longer, 1% shorter).

**Ligation, revised.** On the rigid-body physics ligation was a runaway: fused strands became
rigid rafts that could not separate and births fell by three quarters. On the per-square physics
the same two probes (strand mode, 300 E, otherwise as above) give the longest and most diverse
populations measured so far:

| run | pLigate | ligations | mean length | max | strands | births | distinct | entropy (bits) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| L_ligate005_11 | 0.005 | 668 | 2.75 | 6 | 149 | 3,913 | 24 | 3.42 |
| L_ligate02_11 | 0.02 | 1,390 | 4.66 | 19 | 90 | 2,110 | 46 | 4.95 |

At 0.02 the length histogram at the end runs from 2 to 25 units with most mass between 3 and 8,
births continue at two fifths of the ligation-free rate, and eight of ten births are still
faithful copies. Fusion and fraying set a length distribution the way a polymerisation
equilibrium does; this is chemistry, not selection, but it is the first open regime in which long
strands persist. Whether selection acts on top of it (ligation with cooperative docking on, and
which sequences win) is the obvious next run.

## 4. Direct competition: dimer against 6-mer (`competition.sh`, 100,000 steps)

Three `AB` and three `ABBABA` strands start together with every mutation knob at zero, so the two
species stay distinct and births per species are a direct fitness readout. "Other" is zero in
every run without fraying, which is the check that no chimeras form.

| run | energy | fray | dimer births | 6-mer births | ratio |
|---|---|---|---:|---:|---:|
| C_unit_E300_fray0_21 | unit, 300 | 0 | 260 | 9 | 29 |
| C_unit_E300_fray0_22 | unit, 300 | 0 | 270 | 5 | 54 |
| C_strand_E300_fray0_21 | strand, 300 | 0 | 253 | 11 | 23 |
| C_strand_E300_fray0_22 | strand, 300 | 0 | 277 | 4 | 69 |
| C_unit_E10_fray0_21 | unit, 10 | 0 | 252 | 22 | 11 |
| C_unit_E10_fray0_22 | unit, 10 | 0 | 268 | 17 | 16 |
| C_strand_E10_fray0_21 | strand, 10 | 0 | 244 | 25 | 10 |
| C_strand_E10_fray0_22 | strand, 10 | 0 | 291 | 14 | 21 |
| C_unit_E300_fray3_21 | unit, 300 | 0.0003 | 4,600 | 12 | 383 |
| C_unit_E300_fray3_22 | unit, 300 | 0.0003 | 4,732 | 0 | ∞ |
| C_strand_E10_fray3_21 | strand, 10 | 0.0003 | 325 | 0 | ∞ |
| C_strand_E10_fray3_22 | strand, 10 | 0.0003 | 380 | 4 | 95 |

Without fraying the pool is exhausted by 50,000 steps and the dimers took nine tenths of it.
Scarce energy narrows the gap from 25:1 to 60:1 down to 10:1 to 20:1 because everyone waits for
particles, but never closes it. Strand-mode energy, which lets a long strand catch a particle on
any of its back sides, makes no difference. With fraying on, the 6-mers make almost no births:
they shorten faster than they finish a copy.

Why the dimer wins here is mechanical. A copy of N units waits for the slowest of N dockings
(roughly H_N times the single-site wait), then in unit mode for the slowest of N energy
arrivals. Every term favours short. In this world a single docked monomer is as stable as a full
duplex, so a dimer copies on two lucky dockings and nothing makes a long template a better place
to copy.

## 5. Cooperative docking (`cooperativity.sh`, 100,000 steps)

Rule R6: a docked monomer with no lateral bonds falls off at `pUndock` per step and is pushed
off the face; a run of two or more linked units stays. Copying becomes nucleation-limited: the
slow step is two monomers landing side by side before either leaves, and a template of N units
has N-1 places for that to happen while a dimer has one.

Same competition as section 4 (three `AB` and three `ABBABA`, mutation off, unit-mode energy,
300 particles), with the undocking rate varied. Two seeds each.

| pUndock | dimer births (seed 21, 22) | 6-mer births (21, 22) | dimer : 6-mer by births | share of copied material in 6-mers |
|---:|---:|---:|---:|---:|
| 0 (section 4) | 260, 270 | 9, 5 | 38 : 1 | 7% |
| 0.02 | 262, 215 | 36, 48 | 6 : 1 | 35% |
| 0.05 | 86, 99 | 90, 87 | 1 : 1 | 74% |
| 0.1 | 5, 20 | 116, 107 | 1 : 9 | 96% |
| 0.2 | 11, 16 | 93, 97 | 1 : 7 | 95% |

"Share of copied material" weights births by length. The race flips between 0.02 and 0.05 per
step, which at this jostle is an undocking wait of twenty to fifty steps against a single-site
docking wait of a few hundred. At 0.1 the 6-mer wins outright: the dimers are nearly extinct by
the second half of the run (0 and 3 births in the last 50,000 steps against 33 and 35 for the
6-mers). One local rule, of the same form as fraying, turns selection for the shortest strand
into selection for the longer one.

Two runs also seeded a 12-mer (`ABBABAABABBA`) at `pUndock` 0.02: it reproduced (13 and 16
births against 54 and 17 for the 6-mer and 87 and 173 for the dimer) but did not gain. Where the
optimum lies at higher undocking rates is the next measurement; the copy-time estimate in the
design doc (section 13) puts it near 12 units when undocking is ten times faster than docking.

**Evolutionary regime with undocking.** Gentle mutation and turnover (pSoft 0.01, pCapture 0.01,
pFray 0.0001), one seed strand, 100,000 steps, two seeds, with undocking off (`R_gentle`,
section 2), at 0.02 and at 0.1.

| run | pUndock | mean length | max | strands | free | births | faithful | distinct seqs | entropy (bits) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| R_gentle_7 | 0 | 2.27 | 5 | 216 | 96 | 1,898 | 92% | 12 | 1.92 |
| R_gentle_8 | 0 | 2.28 | 6 | 214 | 88 | 1,841 | 92% | 13 | 2.42 |
| U_evo_undock02_7 | 0.02 | 2.28 | 4 | 149 | 422 | 1,434 | 90% | 9 | 2.24 |
| U_evo_undock02_8 | 0.02 | 2.26 | 4 | 143 | 442 | 1,525 | 90% | 11 | 2.11 |
| U_evo_undock10_7 | 0.1 | died at ~40,000 | 0 | 0 | 800 | 14 | 64% | 0 | 0 |
| U_evo_undock10_8 | 0.1 | 3.39 | 6 | 24 | 709 | 151 | 78% | 12 | 3.19 |

This is the honest limit of the result so far. Undocking wins the head-to-head race, but in the
evolutionary regime with turnover on it does not lift length at 0.02 (it only leaves more
monomers free, because lone dockings that used to lock up material now fall off), and at 0.1 the
population starves: with 800 monomers in an 80×80 world a lone docked monomer lasts ten steps
and the next monomer takes hundreds to arrive, so copies rarely nucleate, while fraying keeps
eroding the templates that wait. One seed died at about 40,000 steps; the other hung on with two
dozen strands of mean length 3.4, the longest population this regime has produced.

Density changes the picture. In the viewer's world (48×48, 400 monomers) at `pUndock` 0.1 with
fraying off, the population grows to about fifty strands of mean length 6.2 to 6.5 (insertions
lengthen them); with fraying at 0.0001 the dimers come back and mean length is 2.4 to 2.6.
Cooperativity therefore beats the shortest-wins rule when nucleation is fast enough, and
fraying is what decides whether it is. The window between "dimers win" and "nothing
nucleates" is where the next measurements go: fraying rate against density against undocking
rate, with more than two seeds.

## 7. Origins: a seedless bath (`channels.sh`, `O_` runs, 100,000 steps)

No seed strand. Two free monomers whose lateral sides meet flush link with probability `pSpont`
per step of contact, become a two-unit strand (rule R2), get re-armed, and are templates.
Gentle mutation and turnover (pSoft 0.01, pCapture 0.02, pFray 0.0001), 400 A + 400 B.

| run | pSpont | first birth at | births | strands at end | mean length | distinct | B fraction of births |
|---|---:|---:|---:|---:|---:|---:|---:|
| O_spont3e4_31 | 0.0003 | 8,458 | 2,747 | 244 | 2.12 | 9 | 0.49 |
| O_spont3e4_32 | 0.0003 | 15,015 | 2,368 | 234 | 2.16 | 9 | 0.50 |
| O_spont1e3_31 | 0.001 | 8,574 | 2,696 | 246 | 2.10 | 8 | 0.50 |
| O_spont1e3_32 | 0.001 | 1,639 | 2,586 | 225 | 2.26 | 13 | 0.52 |
| O_spont3e3_31 | 0.003 | 1,063 | 2,889 | 230 | 2.19 | 11 | 0.51 |
| O_spont3e3_32 | 0.003 | 1,708 | 2,634 | 213 | 2.33 | 14 | 0.49 |

Life starts by itself in every run, and once it has started the rate of spontaneous links no
longer matters: all six reach the same population of 210 to 250 strands with about 2,600 births.
What emerges is what the physics of this world favours, dimers, at the pool's composition. The
tight flush check makes `pSpont` 0.0003 already rare in practice (first event after 8,000 to
15,000 steps with 800 monomers); with `pSpont` at 0 nothing ever starts (`node test.js`).

## 8. Radiation with unequal resistance (`channels.sh`, `X_` runs, 100,000 steps)

Rule R7: every lateral bond breaks with probability `pBreak` × (1 − resA) × (1 − resB) per step
for the two blocks it joins. `B` is tough (resB 0.9) and scarce (100 B against 300 A, so a
quarter of the pool). Ligation 0.005 lets fragments rejoin. Control: same rates, no resistance.

| run | resistance | births | strands at end | B fraction of births, first half | second half |
|---|---|---:|---:|---:|---:|
| X_ctrl_31 | none | 2 | 0 | (died) | |
| X_ctrl_32 | none | 1 | 0 | (died) | |
| X_rad_31 | B 0.9 | 4 | 0 | (died) | |
| X_rad_32 | B 0.9 | 616 | 30 | 0.46 | 0.41 |

At `pBreak` 0.001 the seed strand's five bonds last about 200 steps and the seed usually dies
before its first copy: both controls and one of the two resistant runs died. The run that lived
shows the effect clearly: tough blocks make up 41% to 46% of the copied material against 25% of
the pool, almost twice their availability, because an `A`-`A` bond breaks 25 times more often
than a `B`-`B` bond and scarcity is a weaker penalty than fragility at this rate. The population
is dimers (mean length 2.0), so what is being selected is the `BB` dimer over `AB` and `AA`.
A milder batch (`pBreak` 0.0003, three seeds, with controls) is in `X_rad03_*` / `X_ctrl03_*`.

Milder rate, three seeds each:

| run | resistance | births | strands at end | B fraction of births, first half | second half |
|---|---|---:|---:|---:|---:|
| X_ctrl03_31 | none | 828 | 32 | 0.05 | 0.04 |
| X_ctrl03_32 | none | 0 | 0 | (died) | |
| X_ctrl03_33 | none | 588 | 25 | 0.06 | 0.07 |
| X_rad03_31 | B 0.9 | 828 | 58 | 0.40 | 0.29 |
| X_rad03_32 | B 0.9 | 727 | 64 | 0.23 | 0.26 |
| X_rad03_33 | B 0.9 | 639 | 56 | 0.50 | 0.28 |

The right comparison is not against the pool but against the control, and it is stark. Without
resistance, scarcity alone drives `B` out: only 4% to 7% of copied material is `B` against 25%
of the pool, because a strand that needs a `B` waits three times longer for its monomer, and in
a world of dimers that decides everything. With resistance, `B` holds 26% to 29% in the second
half of every run, five to six times the control, and the resistant runs carry twice as many
strands. Durability pays for scarcity and then some. At the harsh rate above the enrichment
reached 41% to 46%. Sequence content is under selection, in the direction the physics predicts,
and the strength of the selection is set by the radiation rate. What has not happened is any
length beyond 2: the winning form is the `BB` dimer, and a ring of tough blocks around a fragile
core is not something a one-dimensional chain can build.

## 9. Metabolism from sequence (`channels.sh`, `M_` runs, 100,000 steps)

Motif rule on and background reload off, so the only source of charged energy is the back of a
`B` block flanked by two `A` blocks. Seed `ABBABA` carries one such motif. Mutation and turnover
as in section 7. Control: motif off, background reload 0.002.

| run | energy from | births | strands | E charged | E spent | E on / off at end | ABA per block, first half | second half |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| M_ctrl_31 | background | 1,301 | 191 | 0 | 3,292 | 283 / 17 | 0.021 | 0.027 |
| M_ctrl_32 | background | 1,037 | 192 | 0 | 3,199 | 281 / 19 | 0.044 | 0.024 |
| M_motif_31 | ABA motifs only | 1,772 | 206 | 3,411 | 3,594 | 117 / 183 | 0.014 | 0.017 |
| M_motif_32 | ABA motifs only | 1,575 | 204 | 3,480 | 3,579 | 201 / 99 | 0.019 | 0.024 |

The population lives on motif energy alone: 3,400 recharges against 3,600 spends, and more
births than the controls, because a motif on a strand charges particles right where they are
needed. But the motif is not selected for: `ABA` per block stays at 0.015 to 0.025 in both
conditions, and the commonest sequences under the motif rule are `AB`, `AA`, `ABB` and `BB`,
none of which carries it. A charged particle diffuses away from the back that charged it and
re-arms whoever is nearest, so the motif is a public good and the dimers free-ride on it.
This is the expected result for a well-mixed world and the classic reason spatial structure or
compartments matter: the benefit has to stay with the sequence that pays for it.

## 10. Hinges, rings and slack (`rings.sh`, `rings2.sh`, 100,000 steps)

A hinge is a lateral bond that pins only the shared back corner, bends up to 90° toward the
backs, and is rigid whenever either square has a face bond: chains are straight while copied and
fold when free. With flush-only bond formation no ring closed in any run (a ring's last bond is
itself a bend). With hinges allowed to form where two back corners touch, rings close.

Open population, `hinge` all, ligation 0.02, gentle mutation and turnover, three seeds:

| run | rings every 20,000 steps | mean ring length | births | strands | mean length | max | distinct | entropy (bits) |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| H2_hinge_51 | 0, 5, 6, 5, 5 | 5.2 | 175 | 69 | 5.6 | 23 | 42 | 5.02 |
| H2_hinge_52 | 1, 2, 3, 4, 4 | 4.3 | 551 | 82 | 4.8 | 27 | 38 | 4.41 |
| H2_hinge_53 | 0, 0, 2, 2, 2 | 4.5 | 113 | 64 | 6.0 | 20 | 41 | 4.84 |

Rings appear within 20,000 to 60,000 steps, are mostly four squares, and persist: they have no
ends to fray and nothing else in this regime breaks a bond. They are sterile (a ring's faces lie
on a curve, so a copy on it can never complete), so they accumulate as durable dead ends and
slowly lock up material. The population around them is the most diverse measured so far: about
forty sequences and 4.4 to 5.0 bits, mean length 5 to 6, strands up to 27, because hinged chains
fuse by ligation readily and fray slowly. Copying is slower than with rigid chains (113 to 551
births against 1,000 to 2,000 in comparable rigid regimes): a curled template has to be
straightened by the docking itself before its copy can link.

With radiation on top (`H2_hingerad_*`, `pBreak` 0.0003, `resB` 0.9, B a quarter of the pool),
rings are transient (0 or 1 at any sample), radiation opening them as fast as ligation closes
them, and the population is dimers again (mean length 2.3 to 2.4). Tough blocks hold 14% to 19%
of copied material, above the 4% to 7% of a scarcity-only control but below the pool.

**Slack.** A rigid lateral bond may instead tolerate a corner gap up to `slack` with no
restoring force inside it (a trapezoid block). Two seeds, 20,000 steps, all soft knobs at zero:

| slack | births | copies exact | odd-length chains | max joint angle |
|---:|---:|---|---:|---:|
| 0 | 33 | yes | 0 | 0.7° |
| 0.1 | 42 | yes | 0 | 18.7° |
| 0.2 | 41 | no | 2 | 23.5° |

At 0.1 the copying rate rises by a quarter, because linking tolerates the wobble of a docked
pair, and copies stay exact. At 0.2 squares docked on different templates link again. The
tolerance is a property of the block, and 0.1 is where it should sit.

## 11. Membrane blocks (`membranes.sh`, 100,000 steps)

A fourth block type `M` bonds only to other `M`, side to side, forming on any corner touch and
then holding a built-in bend (`memAngle` ± `memFlex`), so arcs grow by capturing free blocks at
their ends and close into rings when they reach the size the bend dictates. Radiation breaks
`M` bonds at `resM`. `M` has no state, docks on nothing, and takes no energy.

**Self-assembly** (300 blocks, no replicators): with a 60° bend, 14 rings by 20,000 steps and
41 rings of about 6 blocks by 100,000, with 13 arcs left; with 45°, 26 rings of about 8. Forming
bonds only when the corners meet *at the right bend* had failed completely (arcs grew one block
per 10,000 steps and never closed); forming on any corner touch and letting the bond pull the
joint to its angle is what makes assembly fast.

**Enclosure** (300 blocks with 800 monomers, gentle mutation and turnover, spontaneous
linking, radiation 0.0002 with `resM` 0.7): rings form at the same rate (33 at the end, two
seeds), but they close around almost nothing. At any sample 2 to 4 monomers are inside a ring,
never a template unit, and no ring ever held a strand. A six-block ring has an interior of
about 2.6 square sides in a world with 0.17 units per square side, so it expects to enclose
about half a unit, and a strand of two or more essentially never. The replicator population is
unaffected (6,000 births, all dimers).

**Compartments and the motif** could therefore not be tested: nothing was inside to select. The
motif regime itself (energy only from `ABA`, no background reload) also died within 50,000 steps
both with and without membranes, because under turnover and spontaneous linking the dimers that
take over carry no motif, the charged energy runs out, and copying stops.

What this says: self-assembly works; enclosure by chance does not at any density a replicator
population tolerates. For compartments to matter, rings have to form *around* strands, which
biology does with coat proteins that recognise the genome (a capsid) or with lipids at
concentrations where anything is inside. In this table that is one more row, `M` binding the
back of a template unit so that membranes nucleate on strands, and it is the next experiment.

## 12. Choosing the presets (`presets.sh`, 100,000 steps)

Four candidate open regimes, all with trapezoid slack 0.1, spontaneous linking 0.001, gentle
mutation and ligation 0.02, `B` scarce (200 against 600 `A`):

| run | turnover | mean length | max | strands | births | distinct | entropy (bits) | B fraction, 2nd half |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| E_fray | fraying 0.0001 | 4.33 | 14 | 107 | 1,369 | 40 | 4.64 | 0.24 |
| E_rad1 | radiation 0.0001, resB 0.9 | 2.54 | 8 | 202 | 1,159 | 24 | 2.88 | 0.06 |
| E_rad3 | radiation 0.0003, resB 0.9 | 2.32 | 6 | 200 | 2,156 | 18 | 2.12 | 0.11 |
| E_rad3_und | radiation 0.0003, resB 0.9, undock 0.05 | 2.37 | 6 | 158 | 834 | 15 | 2.15 | 0.20 |

Fraying and radiation are not interchangeable. Fraying erodes ends only, so with ligation it
sets a length distribution and the population stays long and diverse; radiation cuts anywhere,
so with ligation it fragments, and at every rate tried the population is dimers. Radiation is
the selective pressure (section 8), fraying is the turnover, and the "evolution" preset uses
fraying with ligation. Cooperative undocking halves births here and does not lift length.

Larger membrane rings, same regime plus radiation 0.0002 (`resM` 0.7):

| run | bend | ring size | rings at 100k | template units inside, per 20k sample | rings holding a strand, per sample |
|---|---:|---:|---:|---|---|
| P_ring30 | 30° | ~10 | 10 | 0, 0, 2, 0, 0 | 0, 0, 1, 0, 0 |
| P_ring225 | 22.5° | ~14 | 6 | 2, 2, 2, 0, 2 | 1, 1, 1, 0, 1 |

Fourteen-block rings enclose a strand some of the time; ten-block rings almost never. The
protocell regime (30° rings, motif energy with a small background reload) ran without dying,
1,833 births against 1,702 in its membrane-free control, with one ring holding a strand at the
end and no motif inside any ring. That is the state of the compartment line: the machinery
works, the statistics are too thin to say anything about selection, and nucleation on strands
(design doc, section 15, item 7) is what would change that.

The viewer keeps three presets: copying with every soft knob at zero, the `E_fray` regime as
"evolution", and "protocells" (evolution plus 300 membrane blocks at 30°, motif energy, a little
radiation).

## 13. Turnover is a deletion ratchet; processive fraying lifts it (`unzip.sh`)

**Diagnosis.** In a closed world the only way a monomer returns to the pool is by fraying off an
end. A copy of L units therefore has to be paid for by about L end deletions somewhere in the
population. With cooperative docking on (`pUndock` 0.1) and end fraying at 0.00003, one run had
1,092 frays for 602 births: each lineage loses a unit or two per copy cycle, faster than
cooperativity rewards the extra length. Turnover itself is the mutation pressure that keeps
strands short.

**Change.** Processive fraying (`pUnzip`): a unit that frays reads `FRAY` on its lateral sides
for one step before it lets go, and an undocked neighbour that reads `FRAY` follows it with
probability `pUnzip`. At 1 a strand that starts to fray unzips one unit per step until it
reaches a unit with a copy docked on it (being copied protects). Material comes back by strands
dying whole instead of survivors being eroded. At `pUnzip` 0 nothing changes (trajectories are
bit-identical).

End fraying, 60×60, 400 A + 400 B, 300 E, three `ABBABA` seeds, gentle mutation (pSoft 0.01,
pCapture 0.01, pSpont 0.001, slack 0.1), 100,000 steps, one seed each. "u" is `pUndock` × 100,
"f" is `pFray`, "b" radiation instead of fraying:

| run | mean length | max | strands | free | births | newborn length, last 50k | distinct | entropy (bits) | frays |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Z_end_u0_f1e5 | 2.27 | 7 | 251 | 4 | 558 | 2.16 | 15 | 1.84 | 333 |
| Z_end_u0_f3e5 | 2.41 | 6 | 223 | 10 | 941 | 2.25 | 15 | 2.54 | 895 |
| Z_end_u0_f1e4 | 2.22 | 5 | 239 | 57 | 2,754 | 2.14 | 12 | 1.97 | 2,994 |
| Z_end_u0_b5e5 | 2.00 | 2 | 300 | 8 | 1,573 | 2.01 | 3 | 1.23 | 0 |
| Z_end_u10_f1e5 | 3.66 | 8 | 189 | 68 | 363 | 3.64 | 40 | 4.59 | 396 |
| Z_end_u10_f3e5 | 3.17 | 7 | 203 | 117 | 602 | 3.15 | 33 | 4.12 | 1,092 |
| Z_end_u10_f1e4 | 2.60 | 5 | 164 | 339 | 1,614 | 2.73 | 20 | 2.93 | 3,078 |
| Z_end_u10_b5e5 | 2.27 | 4 | 265 | 179 | 1,163 | 2.32 | 15 | 2.38 | 0 |

With end fraying, cooperative docking helps (2.3 to 3.2-3.7) and the gentler the fraying the
longer the strands, but births fall with it. Radiation as the only turnover gives dimers either
way: it cuts anywhere, which is a deletion ratchet too.

Processive fraying, same world, 150,000 steps, one seed each:

| run | mean length | max | strands | free | births | newborn length, last 50k | distinct | entropy (bits) | frays | unzips |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Z_zip_u0_f3e5 | 2.26 | 7 | 246 | 16 | 1,589 | 2.15 | 15 | 2.24 | 1,478 | 804 |
| Z_zip_u5_f3e5 | 3.97 | 8 | 140 | 128 | 1,404 | 3.75 | 41 | 4.80 | 1,582 | 2,807 |
| Z_zip_u10_f3e5 | 4.72 | 9 | 119 | 136 | 952 | 4.64 | 42 | 4.91 | 1,140 | 2,779 |
| Z_zip_u20_f3e5 | 5.36 | 13 | 94 | 196 | 738 | 5.09 | 52 | 5.40 | 870 | 2,454 |
| Z_zip_u0_f1e4 | 2.31 | 6 | 231 | 42 | 4,112 | 2.17 | 16 | 2.40 | 4,357 | 2,459 |
| Z_zip_u5_f1e4 | 3.13 | 7 | 142 | 270 | 3,197 | 3.19 | 24 | 3.88 | 4,040 | 6,039 |
| Z_zip_u10_f1e4 | 3.48 | 6 | 105 | 371 | 2,472 | 3.45 | 32 | 4.37 | 3,107 | 5,538 |
| Z_zip_u20_f1e4 | 3.10 | 7 | 58 | 599 | 1,506 | 3.00 | 15 | 3.10 | 1,759 | 3,364 |

Replicates of the four settings that matter, three seeds each (150,000 steps; end-fraying seed 1
ran 100,000):

| setting | mean length | births | distinct |
|---|---|---|---|
| unzip, no cooperative docking | 2.26, 2.32, 2.23 | 1,589, 1,569, 1,638 | 15, 18, 17 |
| end fraying, `pUndock` 0.1 | 3.17, 3.31, 3.23 | 602, 745, 752 | 33, 36, 38 |
| unzip, `pUndock` 0.1 | 4.72, 4.02, 4.31 | 952, 1,223, 1,199 | 42, 38, 44 |
| unzip, `pUndock` 0.2 | 5.36, 4.43, 4.52 | 738, 886, 916 | 52, 45, 50 |

What this says:

- Neither rule alone does it. Unzipping without cooperativity is still a dimer world (2.3);
  cooperativity with end fraying gives 3.2. Together they give 4.0 to 5.4, a clean dose-response
  in `pUndock`, and the length of newborns climbs through each run (from about 3.5 in the first
  30,000 steps to about 5 at the end at `pUndock` 0.2). This is selection, not ligation: `pLigate`
  is 0 in every run.
- Unzipping is only partly processive in practice: two to three unzip steps per fray at
  `pUndock` 0.1, because a template is often holding a nucleated copy and that stops the wave.
- Denser worlds (42×42 and 50×50 with the same material) give the same lengths (3.9 to 4.9 with
  cooperativity, 2.3 to 2.5 without) and no more births. Births are set by recycling: a birth
  needs free monomers, and monomers come back only when strands die.
- The price is speed. At `pUndock` 0.1 and fraying 0.00003 each strand is copied about once per
  20,000 steps, so a 150,000-step run is only a dozen generations.

Density runs (`Z_d42_*`, `Z_d50_*`, one seed each, 150,000 steps, 250 E):

| run | mean length | max | births | distinct | entropy (bits) |
|---|---:|---:|---:|---:|---:|
| Z_d50_u0_f3e5 | 2.32 | 7 | 1,638 | 18 | 2.23 |
| Z_d50_u5_f3e5 | 3.95 | 8 | 1,373 | 35 | 4.62 |
| Z_d50_u10_f3e5 | 4.21 | 10 | 1,313 | 40 | 4.79 |
| Z_d50_u10_f1e5 | 4.30 | 10 | 629 | 48 | 5.03 |
| Z_d42_u0_f3e5 | 2.51 | 7 | 1,356 | 23 | 2.50 |
| Z_d42_u10_f3e5 | 4.35 | 9 | 1,411 | 51 | 5.17 |
| Z_d42_u20_f3e5 | 4.85 | 11 | 1,177 | 52 | 5.22 |
| Z_d42_u10_f1e4 | 3.88 | 9 | 3,812 | 46 | 4.89 |

## 14. Does sequence pay once length does? The `ABA` motif (`motif.sh`, `long.sh`)

All runs in the length regime above (50×50, unzip, `pUndock` 0.1, fraying 0.00003). The measure
is `ABA` motifs in newborns against the number expected if each newborn's blocks were drawn at
random at the window's `B` fraction (`composition.js`, "ABA vs chance"). Every run starts from
`ABBABA` seeds, which carry one motif, so founder descent pushes even the controls above 1; the
comparison that counts is motif against control.

**Public motif, energy plentiful** (`Q_m_*`, 250 particles, background reload 0.00005, two
seeds). The motif is 1.2 to 1.8 × chance in the last 50,000 steps against 0.9 to 1.3 in the
control, and slowing energy particles to a fifth or a twentieth of their mobility (`mobE`) makes
no consistent difference. The reason is in the energy counts: once any motifs exist, about 200 of
250 particles are charged at any time, and the motif-off control, which used less than half the
energy, made as many births (1,251 to 1,289 against 1,177 to 1,350). Energy is not what limits
copying here; recycling and nucleation are. A public good that is not scarce is not selected.

**Public motif, energy scarce** (`Q_n_*`, 60 particles, motif charging the only income; control
with background reload instead). Last 50,000 steps: 1.3 to 1.6 × chance at normal mobility, 1.7
to 1.9 at mobility 0.2, against 1.7 in the control. No selection.

**Private motif** (`Q_f_*`, the `feed` rule: an armed `B` between two `A`s re-arms its released
neighbours through their shared bonds, so a strand carrying the motif pays one particle where it
would pay three and nobody else benefits). 40 particles, reload 0.0005, energy limiting (1 to 5
particles charged at any time), 200,000 steps, two seeds:

| run | births | fed re-arms | ABA per block, last 50k | ABA vs chance, by 50k window | mean length |
|---|---:|---:|---:|---|---:|
| Q_f_ctl_1 | 1,575 | 0 | 0.093 | 1.55, 1.34, 1.45, 1.52 | 4.27 |
| Q_f_ctl_2 | 1,446 | 0 | 0.106 | 2.02, 1.87, 1.88, 1.79 | 4.28 |
| Q_f_feed_1 | 1,443 | 525 | 0.108 | 2.03, 1.89, 1.89, 1.59 | 4.66 |
| Q_f_feed_2 | 1,381 | 710 | 0.142 | 2.33, 1.94, 2.00, 1.99 | 4.97 |

With `feed` the motif is somewhat more common and strands are longer (the energy saved buys
length), but the difference is within the seed-to-seed spread. One arming in ten comes through a
motif, a saving of a few percent per copy, and 200,000 steps is about fifteen generations: too
few for a few-percent advantage to show above drift.

**Private motif over many generations** (`long.sh`, `L1M_*`): a 40×40 world with 256 A + 256 B
and 26 particles (energy limiting), same regime, 1,000,000 steps, 40 to 52 generations, two seeds
each. "ABA vs chance" by 200,000-step window:

| run | births | max generation | fed re-arms | ABA vs chance, by 200k window | ABA per block, whole run |
|---|---:|---:|---:|---|---:|
| L1M_ctl_1 | 3,816 | 40 | 0 | 1.59, 1.43, 0.95, 1.18, 1.01 | 0.082 |
| L1M_ctl_2 | 3,992 | 44 | 0 | 1.16, 0.62, 0.98, 1.42, 1.72 | 0.078 |
| L1M_feed_1 | 3,845 | 46 | 2,035 | 1.98, 2.15, 2.07, 1.64, 1.65 | 0.132 |
| L1M_feed_2 | 3,712 | 52 | 2,243 | 1.92, 2.24, 2.11, 2.33, 1.64 | 0.147 |

This is the first sequence-level selection in the open regime. With the motif private, `ABA` stays
at 1.6 to 2.3 times chance in every window of both seeds and averages 1.7 times the control's
frequency; without it, the frequency drifts between 0.6 and 1.7 times chance. It is a balance,
not a sweep: the motif does not keep rising. One arming in seven comes through a motif, total
births are unchanged (they are set by recycling, section 13), and mutation keeps breaking motifs
as fast as selection keeps them. Mean length is the same in both arms (4.4 to 5.1). What it
shows is the condition, not the size, of the effect: in this well-mixed world a sequence feature
is selected when its benefit reaches its carrier through the carrier's own bonds, and not when
it goes out into the medium, however slowly the medium carries it.

**Less mutation, four seeds** (`L1L_*`, same world as `L1M_*` with `pSoft` and `pCapture` at 0.002
and `pSpont` at 0.0002, 1,000,000 steps; 91% of births faithful against 72%):

| run | births | fed re-arms | ABA per block | ABA vs chance | mean newborn length | alternating share of newborns of length 4+, by 250k window | top long sequences, last 250k |
|---|---:|---:|---:|---:|---:|---|---|
| L1L_ctl_1 | 5,284 | 0 | 0.099 | 1.90 | 3.47 | 18%, 14%, 39%, 25% | AABA, ABAB, BABB |
| L1L_ctl_2 | 5,542 | 0 | 0.099 | 2.04 | 3.29 | 16%, 33%, 18%, 38% | ABAB, AABAB, AABA |
| L1L_ctl_3 | 6,458 | 0 | 0.050 | 1.22 | 2.97 | 13%, 2%, 12%, 9% | AABB, BAAB, ABBB |
| L1L_ctl_4 | 5,999 | 0 | 0.101 | 2.22 | 3.13 | 22%, 42%, 16%, 23% | BABB, ABAB, AABA |
| L1L_feed_1 | 5,446 | 2,915 | 0.192 | 3.36 | 3.59 | 35%, 70%, 55%, 52% | ABAB, ABABAB, ABABA |
| L1L_feed_2 | 5,670 | 2,200 | 0.146 | 2.72 | 3.48 | 24%, 52%, 39%, 31% | ABAB, AABA, BABB |
| L1L_feed_3 | 5,222 | 2,477 | 0.155 | 2.70 | 3.67 | 34%, 54%, 30%, 16% | ABAB, AABA, BAAB |
| L1L_feed_4 | 5,116 | 2,362 | 0.151 | 2.57 | 3.72 | 19%, 35%, 36%, 16% | AABA, ABAB, AABB |

The two arms no longer overlap. With the private motif every seed carries 0.146 to 0.192 motifs
per block and every control 0.050 to 0.101, and newborns are longer in every `feed` run (3.5 to
3.7 against 3.0 to 3.5): a strand that feeds itself can afford more units. Selection also finds
the sequence the rule rewards most. In an alternating strand every inner `B` is flanked by `A`s,
so `ABABA` needs two particles instead of five; alternating newborns reach 50% to 70% of the long
births in some windows of the `feed` runs (`ABABAB` and `ABABA` among the commonest long strands
in seed 1), and seldom pass 40% in the controls. Nothing in the rules mentions alternation. The
controls are not flat either: with little mutation a few lineages dominate and drift carries
them, so `ABAB` is also common without feed, and the windows swing widely in both arms. Less
mutation raised motif frequency in both arms; the ratio between them stayed near 1.7, so mutation
was not what capped the motif.

**The environment changes, the population adapts** (`shift.sh`, `S_*`). Same small world and low
mutation as `L1L_*`, 1,500,000 steps, two seeds each. For the first 500,000 steps energy is
plentiful (reload 0.005 per spent particle per step); at step 500,000 it drops to 0.0003 and
stays there (`run.js --change 500000:pReload=0.0003`). The rules never change; only the world
does.

| run | ABA per block, by 250k window (switch after the second) | mean newborn length, same windows | alternating share of long newborns, same windows |
|---|---|---|---|
| S_ctl_1 | 0.152, 0.147 → 0.088, 0.017, 0.036, 0.025 | 4.4, 4.5 → 3.4, 2.8, 2.7, 2.4 | 26%, 24% → 19%, 3%, 31%, 21% |
| S_ctl_2 | 0.082, 0.095 → 0.053, 0.033, 0.050, 0.014 | 3.6, 3.9 → 3.0, 2.9, 2.9, 2.8 | 24%, 9% → 20%, 16%, 9%, 1% |
| S_feed_1 | 0.140, 0.126 → 0.079, 0.182, 0.215, 0.189 | 4.0, 3.7 → 3.2, 3.0, 2.9, 3.0 | 15%, 23% → 10%, 45%, 56%, 46% |
| S_feed_2 | 0.127, 0.160 → 0.182, 0.194, 0.166, 0.186 | 3.7, 3.3 → 3.2, 3.0, 3.0, 3.2 | 34%, 74% → 49%, 60%, 60%, 52% |

While energy is plentiful the two arms look the same: the motif saves nothing when particles
are free. When energy turns scarce they split. Without the private motif, selection strips the
population to the cheapest strands, mean length falls from about 4 to 2.5, and the motif all but
disappears (0.4 to 1.3 × chance by the end). With it, the motif rises to 0.17 to 0.22 per block
(3.8 to 5.0 × chance), alternating strands make up about half of the long newborns, and length
holds at 3. Seed 1 shows the adaptation in time: the motif first falls with everything else
after the switch (0.079), then climbs back past its old level within 250,000 steps. Same rules,
same seeds; only the environment changed, and the population followed it.

**Making energy the bottleneck: the spend rule, tried and removed** (`L1S_*`, same world and
regime as `L1M_*`). With `spend` on, a docked unit that is complete reads `DONE` on its face for
a step, and its template unit reads that and drops back to needing energy, so every copy costs
energy on both sides and a motif on the template pays at the step that limits copying.

| run | births | faithful births | fed re-arms | ABA vs chance, by 200k window | ABA per block, whole run |
|---|---:|---:|---:|---|---:|
| L1S_ctl_1 | 2,753 | 47% | 0 | 1.15, 1.48, 1.27, 1.07, 1.00 | 0.066 |
| L1S_ctl_2 | 2,790 | 47% | 0 | 1.63, 1.01, 1.13, 1.57, 1.05 | 0.070 |
| L1S_feed_1 | 3,002 | 56% | 3,523 | 1.61, 2.33, 2.34, 2.20, 2.00 | 0.131 |
| L1S_feed_2 | 2,865 | 55% | 3,529 | 1.93, 1.69, 1.95, 2.48, 2.22 | 0.132 |

The motif is held a little higher (about twice the control, 2.0 to 2.5 × chance late in the
runs), one arming in five comes through it, and for the first time it raises births (5%). But
copying falls apart: only half of births are faithful, against 72% without the rule, with 13%
longer and 10% shorter than their parent. A template unit spent mid-copy is undocked, so it can
fray and unzip while the rest of its strand is still being copied, and the copy's finished part
leaves early as a truncated strand. Selection cannot build on a lineage when every other birth is
a mutant. The rule was removed: it adds a state and a row and costs more fidelity than it buys.

## 15. Deformable polygons (`physics: 'poly'`, `poly_probe.js`)

A second physics engine, on the user's suggestion: each unit is four corners held to a rest
shape by shape matching at a per-type stiffness, and a bond pins the two corners of one side onto
the two corners of the other, so bonded edges coincide and a strand is drawn and moves as one
body. A pin moves each unit rigidly (as the rigid engine's point constraint does) and, by the
unit's softness, deforms the pinned corner. The chemistry is unchanged. The rigid engine stays
the default, so every table above is reproducible bit for bit.

**Copying at every soft knob zero**, `ABBABA`, 60×60, 20,000 steps, seeds 2 and 5:

| engine | stiffness | births | exact | odd lengths |
|---|---:|---|---|---|
| rigid | - | 12, 21 | yes | none |
| poly | 1 | 13, 11 | yes | none |
| poly | 0.5 | 15, 19 | yes | none |
| poly | 0.2 | 25, 23 | 3 unfaithful in one seed | 3- and 8-mers |
| poly | 0.05 | 40, 60 | 18 unfaithful | dimers to 7-mers |

Softness does what slack did (section 10): a little speeds copying because neighbours docked on a
template can link while wobbling, and too much lets copies docked on neighbouring templates link.
0.5 is safe. Bonded corners sit a median 0.015 of a side apart (90th percentile 0.08).

**Length selection carries over** (`PZ_*`, the section 13 regime on the polygon engine at stiffness
0.5, 150,000 steps): mean length 2.50 without cooperative docking, 3.83 and 3.70 at `pUndock`
0.1 (two seeds) and 4.85 at 0.2, against 2.2 to 2.3, 4.0 to 4.7 and 4.4 to 5.4 on the rigid
engine. The same dose-response, slightly lower at 0.1. The polygon engine is about twice as
slow per step at this size.

**Membrane wedges.** The membrane block's rest shape is a trapezoid whose lateral sides lean in
by half the bend, so a ring is its rest state and no bend rule is needed; a bond forms where two
back corners touch and the pins pull the edges flush. A block one side deep cannot lean past
about 50 degrees, so rings have at least seven or eight blocks. 150 blocks in 40×40: rings of
about 7 at 45 degrees (9 rings by 20,000 steps) and 11 at 30 degrees (6 rings).

**Shape as a phenotype.** `bendA` and `bendB` give the replicator blocks the same wedge rest
shape, so a strand's resting curvature is set by its sequence. Copying `ABBABA` at stiffness 0.5:

| `B` bend per bond | births (seeds 2, 5) | exact |
|---:|---|---|
| 0 (square) | 15, 19 | yes |
| 10 | 25, 24 | yes |
| 20 | 9, 9 | yes |
| 30 | 0, 0 | - |

**Octagons** (`shapeA`, `shapeB` = `oct`: a regular octagon one side across, the four working
sides on alternate edges, the other four inert skin) copy at about the square rate, 14 and 20
births at stiffness 0.5, with one truncated copy per seed: neighbours touch only along short
edges, which leaves more room for neighbouring templates to interfere.

Shape has a fitness landscape: a slight taper copies faster than a square, a strong bend slows
copying and at 30 degrees a template cannot be copied at all (monomers docked on its outer curve
splay too far apart to link; an all-`B` 6-mer stays curled at about 155 degrees with monomers
docked on it). Two seeds at 20,000 steps each: a lead, not yet a result.

**Shape selects on sequence** (`shape.sh`, `SH_*`): the section 13 regime on the polygon engine,
40×40, 256 A + 256 B, low mutation, 800,000 steps, two seeds each. `B` blocks are wedges bending
20 degrees per `BB` bond (10 per `AB` bond), against square `B` as the control. The monomer pool is
half `B` throughout; what changes is what the newborns are made of (`pairs.js`):

| run | window | mean length | B fraction of newborn blocks | BB / AB / AA bonds (× chance) |
|---|---|---:|---:|---|
| SH_square_1 | first 200k | 4.40 | 0.50 | 0.73 / 1.42 / 0.43 |
| SH_square_1 | last 200k | 3.34 | 0.50 | 0.44 / 1.64 / 0.28 |
| SH_square_2 | first 200k | 4.04 | 0.51 | 0.70 / 1.59 / 0.09 |
| SH_square_2 | last 200k | 3.23 | 0.49 | 0.32 / 1.73 / 0.23 |
| SH_wedge_1 | first 200k | 2.14 | 0.02 | 0 / 1.03 / 1.00 |
| SH_wedge_1 | last 200k | 2.89 | 0.06 | 0.21 / 0.85 / 1.02 |
| SH_wedge_2 | first 200k | 2.07 | 0.03 | 0 / 1.06 / 1.00 |
| SH_wedge_2 | last 200k | 2.84 | 0.08 | 0.24 / 0.86 / 1.03 |

Block shape alone purged `B` from the genomes: with wedge `B` it makes up 2% to 8% of the blocks
in newborns, against 50% with square `B` and 50% of the pool. The population first collapsed to
`AA` dimers (a dimer has one bond to bend, so it copies whatever its shape) and then rebuilt length
out of `A` (mean newborn length 2.1 rising to 2.9). The prediction was that selection would favour
mixing, since an `AB` bond bends half as much as a `BB` bond; at 20 degrees it did not, because
even an `AB` bond (10 degrees) costs more than it buys.

With a gentler wedge the prediction holds (`SH10_*`, 10 degrees per `BB` bond, 5 per `AB`):

| run | window | mean length | B fraction of newborn blocks | BB / AB / AA bonds (× chance) |
|---|---|---:|---:|---|
| SH10_wedge_1 | first 200k | 3.66 | 0.48 | 0.30 / 1.69 / 0.32 |
| SH10_wedge_1 | last 200k | 3.29 | 0.47 | 0.04 / 1.83 / 0.28 |
| SH10_wedge_2 | first 200k | 3.89 | 0.50 | 0.30 / 1.76 / 0.17 |
| SH10_wedge_2 | last 200k | 3.18 | 0.50 | 0.02 / 1.82 / 0.34 |
| SH10_all_1 | whole run | 2.0 to 2.2 | 0.43 to 0.60 | about 1 / 1 / 1 (137 births in 800k) |
| SH10_all_2 | whole run | 2.0 | 0.39 to 0.53 | about 1 / 1 / 1 (125 births) |

The genome keeps the curved block and spaces it out. `B` stays at half of every newborn, but two
`B`s are almost never neighbours: `BB` bonds fall to 1% (0.02 to 0.04 × chance) against 8% to 11%
in the square control, and nine bonds in ten are `AB`. Where both block types are 10-degree
wedges (`SH10_all_*`) there is no straight block to fall back on, every strand curls, and the
population barely survives as dimers. The same physics gives three different answers depending
on how strong the shape effect is and whether there is an alternative: space the curved block out
(mild), purge it (strong), or fail (no escape). The controls are a warning about
baselines: with little mutation they keep the founder's make-up (`ABBABA` is four fifths `AB`
bonds), so "× chance" figures in a control measure descent as much as selection. The comparison
that counts is against the control, as everywhere above.

## 16. Summary

- Copying, release, re-arming and turnover all come out of one internal state per square, one
  compatibility table and six local transitions, with nothing bigger than a square anywhere in
  the dynamics. Copies are exact when the soft knobs are zero.
- Every soft knob is a distinct, measurable mutation channel. Ligation, a runaway on rigid
  bodies, is on the per-square physics the one regime that keeps long strands in an open
  population (mean length 4.7, up to 25 units, 46 sequences), by fusion balanced against fraying.
- Without cooperativity or ligation the shortest strand wins in every energy regime tried, by 10:1
  to 60:1.
- With a lone docked monomer made unstable, the head-to-head race tips to longer strands at
  undocking rates above about 0.05 per step, decisively at 0.1. In the evolutionary regime with
  turnover the same rule has not yet produced a long-strand population: at low rates it changes
  nothing, at high rates nucleation starves at the densities tried.
- Life starts by itself from a seedless bath at every spontaneous-link rate tried, within 1,000
  to 15,000 steps.
- Radiation with unequal resistance selects on content: tough but scarce blocks make up 26% to
  46% of copied material, against 4% to 7% when they are scarce but not tough. Energy from `ABA`
  motifs sustains a population but is not selected for in a well-mixed world; the dimers free-ride.
- Hinged chains, rigid while copied and free when split, close into four-square rings once a
  hinge may form where corners touch; rings persist without radiation and accumulate as sterile
  durable forms, and the hinged, ligating population is the most diverse measured (about forty
  sequences, five bits). A trapezoid slack of 0.1 on flush bonds raises the copying rate by a
  quarter at no cost; 0.2 lets chimeras back in.
- Membrane blocks self-assemble into rings of a chosen size within 10,000 to 20,000 steps, and
  replicators are unaffected by them; but rings close around empty space at every density tried,
  so no strand was ever enclosed and compartment selection could not be measured.
- Turnover by end fraying is a deletion ratchet: every recycled monomer is a deletion. With
  processive fraying (a fraying strand unzips whole) and cooperative docking together, the open
  population holds a mean length of 4 to 5.4 by selection, 40 to 50 sequences, against 2.3 with
  either rule alone (three seeds each). Monomer density does not matter; recycling sets births.
- The `ABA` energy motif is not selected as a public good, even with energy scarce and slow. Made
  private (`feed`: the motif arms its own neighbours through their bonds) it holds at about 1.7
  times the control's frequency over 40 to 50 generations (0.15 to 0.19 motifs per block against
  0.05 to 0.10, four seeds each, no overlap), strands carrying it are longer, and alternating
  sequences, which the rule rewards most, become common without any rule mentioning them.
- On the polygon engine, a block's shape is a phenotype that selects on sequence, with no rule
  mentioning shape or sequence: a strongly wedge-shaped `B` is purged from the genomes (2% to 8%
  of newborn blocks against 50% with square `B`); a mildly wedge-shaped one is kept at half the
  genome but never placed next to another `B` (`BB` bonds 1% against 8% to 11% in the control).
- When the environment changes from plentiful to scarce energy, populations adapt: without the
  private motif they shrink to short, motif-free strands; with it the motif rises to 4 to 5 ×
  chance and alternating strands to half of the long births, and length holds.
- The open questions for Phase 3: make membranes nucleate on strands (one row: `M` binds a
  template's back), so that compartments hold a genome and the `ABA` motif's public good can
  stay with its carrier; find the radiation window where long strands persist; and give rings a
  way to divide.
