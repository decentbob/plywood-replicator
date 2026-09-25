# Results

Measurements from the headless runner. **Sections 1 to 14 were measured on the rigid-body engine,
which was removed on 2026-09-23** (recover it from git at commit `b41557c` to reproduce them bit
for bit; their scripts now run on the polygon engine and give different numbers). Section 15 and
later are on the polygon engine, which is now the only one. Where a result was re-measured on the
polygon engine (length selection, section 15) it held.
Every run is deterministic per seed; the commands are in the `.sh` scripts next to this file (the
scripts of sections 10 to 12 tested mechanisms that were removed with the rigid engine, so they
were deleted too; they are at commit `b41557c`). Tables come from
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

## 16. Compartments by chance (`encl.sh`, polygon engine)

40×40, 400 replicator monomers in the length regime, many membrane wedges, mild radiation
(0.0002 per bond, `resM` 0.7, both replicator types resistance 0.9), 150,000 steps, one seed each.
"Rings holding a strand" counts rings with two or more template units inside, sampled every
30,000 steps.

| run | M blocks | bend | rings | rings holding a strand |
|---|---:|---:|---|---|
| EN_m400_a20 | 400 | 20° | 11 to 15 | 1, 2, 2, 3, 2 |
| EN_m400_a25 | 400 | 25° | 19 to 24 | 0, 1, 1, 2, 0 |
| EN_m600_a20 | 600 | 20° | 14 to 24 | 2, 3, 1, 1, 10 |
| EN_m600_a30 | 600 | 30° | 44 to 50 | 0, 1, 0, 1, 0 |

Large wedge rings (18 blocks at 20 degrees) at high density do close around strands, up to ten
at once, where the rigid engine's rings almost never did. Two things are still missing for
compartments to be selected. At this radiation rate a ring opens every few thousand steps, far
less than a generation (about 20,000), so an enclosure does not last. And rings do not divide,
so a ring holding a good strand cannot make more rings like it. Division is the missing step.

**Can rings grow and split without a new rule?** (`ring_growth.js`, 500 membrane blocks at 25
degrees, radiation opening a ring every ten thousand steps or so, 150,000 steps.) The hope was
that an opened ring would take in free blocks, reclose larger, and at about twice its natural
size split in two when two of its bonds broke. It does not happen. Ring sizes stay at 8 to 18
(median 11 with soft blocks, 13 with rigid ones) and never reach 22: an opened ring's ends are
still next to each other, so it recloses before anything can join, and almost every block is
already in some ring, so there is little free membrane to add. Growth needs membrane to be made
continuously, not drawn from a fixed stock. The natural candidate is membrane made by the
replicators themselves: a precursor block that becomes a membrane block where it touches a strand
carrying some motif, so membrane forms around its makers and a ring holding a maker grows. 

**Membrane made by the replicators** (`make` rule, `make_probe.js`). Built as a state change, on
the user's preference, not a new type: membrane blocks start raw (their sides cannot link); the
back of an `A` template unit between two `B`s reads `MAKE`; an active block with no neighbours
falls back to raw at `pMemDecay`. Same world as above, 400 blocks at 18 degrees (rings of about
18), radiation opening rings, 150,000 steps. Mean over samples after step 30,000:

| membrane | rings holding a strand | template units inside rings |
|---|---:|---:|
| fixed stock, all active (`make` off) | 1.42 | 3.42 |
| made: a raw block activates where its face touches a `MAKE` back, then lets go | 0.08 | 0.17 |
| made and anchored: a raw block's back docks on a `MAKE` back and stays; raw blocks touching an active block's open side are recruited | 1.42 | 3.58 |

Neither version puts compartments around their makers. Activated blocks that let go drift off
and decay before they meet, so rings seldom assemble at all. Anchored blocks do start arcs on the
strands, but recruitment spreads: within 40,000 steps nearly every block is active (395 of 400)
and the world looks like the fixed-stock one. What is still missing is something that keeps a
membrane with the strand that made it, as a tether keeps a cell wall with its cell. The rule is
kept, off by default, as the base for that.

**Division by overgrowth, checked** (`ring_shape.js`, 2026-09-23). The hope behind "a ring grown
past its natural size divides": a closed loop of wedges that together want to turn 720° must
buckle, perhaps into a dumbbell whose waist brings two membrane backs together, where one local
rule could split it. Rings of 8 to 20 blocks built by hand and relaxed for 3,000 steps:

| bend, stiffness | natural size | 12 blocks | 16 blocks | 20 blocks |
|---|---:|---|---|---|
| 45°, rigid | 8 | round | coils into a double loop that overlaps itself | the same |
| 45°, soft (0.5) | 8 | round | round, blocks flattened | round, blocks flattened |
| 30°, rigid | 12 | round | round, pins gape | round, pins gape |

No ring pinches. Soft blocks and the pins' give absorb the extra membrane, so an overgrown ring is
just a larger round ring; at a strong bend it coils past itself, an artefact of the membrane's small
contact radius. Division would need a rule of its own; the geometry does not supply one.

Why the overgrown ring stays round: a bond pins two corners onto two corners, but the pins are
constraints solved in a fixed number of passes, and when a shape is geometrically impossible they
settle on an even compromise. In a natural 12-ring at 30° the pinned corners coincide (gap 0.008
of a side on average); in a 20-ring they gape by 0.15 on average and 0.27 at most, and 64 or 256
passes instead of 16 change nothing (0.147, 0.146). Frustrated pins act as stiff springs.
A strain limit (`maxStrain`, section 23) lets such a bond go, so membrane cannot hold a shape its
blocks do not fit; with it an overlong membrane closes into several rings of about the natural
size instead of one frustrated one (section 23).

## 17. Does space rescue a public good? (`space.sh`)

The `ABA` charging motif as the only real energy income (background reload 0.00005), energy
particles slowed to a fifth (`mobE` 0.2), low mutation, the length regime, 1,000,000 steps. The
same density of monomers and particles in a 40×40 world and in an 80×80 one (four times the
area, four times the population).

| run | world | motifs per template unit at 200k, 400k, 600k, 800k, 1M | mean length at the end | outcome |
|---|---|---|---:|---|
| SP_small_motif | 40×40 | 0.14, 0.08, 0.12, 0.03, 0 | 2.04 | collapsed to motif-free dimers |
| SP_small_motif_2 | 40×40 | 0.10, 0.02, 0, 0, 0.05 | 2.26 | collapsed |
| SP_small_motif_3 | 40×40 | 0.03, 0.07, 0.13, 0.18, 0.16 | 3.34 | survived, motif enriched |
| SP80_motif_1 | 80×80 | 0.11, 0.14, 0.12, 0.12, 0.12 | 2.96 | sustained |
| SP80_motif_2 | 80×80 | 0.12, 0.12, 0.09, 0.10, 0.10 | 3.55 | sustained |

In the small world the motif economy collapses in two seeds of three: once the motif carriers
dip, energy runs out, only dimers (which cannot carry `ABA`) still copy, and the motif is gone.
In the larger world neither seed collapses; the motif holds at about one template unit in ten
throughout. What this does not yet say is why. The larger world differs in two ways, local
structure (energy charged in one corner is spent there) and a four times larger population,
which is harder to lose to chance. Separating them needs the large world with energy mobility 1,
which washes local structure out while keeping the population.

| run | world | energy mobility | motifs per template unit at 200k, 400k, 600k, 800k, 1M | charged particles |
|---|---|---:|---|---:|
| SP80_fastE_1 | 80×80 | 1 | 0.14, 0.13, 0.11, 0.06, 0.04 | 130 to 185 of 192 |
| SP80_fastE_2 | 80×80 | 1 | 0.15, 0.18, 0.13, 0.11, 0.12 | 165 to 185 of 192 |

With fast energy the large world does not collapse either, so the rescue is mostly size: a
population four times larger does not lose its motif carriers to chance. There is a hint of local
structure on top. Fast particles find motif backs quickly, energy is plentiful (130 to 185 of 192
charged, against about 100 with slow particles), and in one seed the motif erodes to 0.04 per
template unit, as a public good does when free-riders pay nothing for it; with slow energy it held
at 0.10 to 0.14 in both seeds. One seed each way: space as such is not shown to matter yet.

## 18. Lock-and-key binding between strands (`binding.sh`)

Two template faces of opposite type bind at `pHyb` per step of contact; a bond with a bound
neighbour melts at 0.001 per step, a lone one at 0.1. Copies pair like with like, so kin never
bind. Small world, low mutation, the length regime, 1,000,000 steps. Diversity is counted over
newborns of three units or more, per 200,000-step window (`turnover.js`).

| run | pHyb | births | bindings | mean newborn length, last half | distinct sequences (mean) | entropy (bits, mean) | changes of the dominant sequence |
|---|---:|---:|---:|---:|---:|---:|---:|
| HY_ctl_1 | 0 | 5,275 | 0 | 3.64 | 30 | 3.89 | 3 |
| HY_ctl_2 | 0 | 4,961 | 0 | 3.65 | 33 | 3.92 | 3 |
| HY_h05_1 | 0.05 | 4,984 | 65,523 | 3.42 | 28 | 3.67 | 2 |
| HY_h05_2 | 0.05 | 5,465 | 68,153 | 3.15 | 26 | 3.56 | 3 |
| HY_h20_1 | 0.2 | 4,252 | 191,417 | 2.59 | 18 | 3.17 | 3 |
| HY_h20_2 | 0.2 | 4,750 | 180,152 | 2.56 | 18 | 2.96 | 2 |

The hope was frequency-dependent selection: common sequences caught by their complements,
diversity kept high, the dominant sequence replaced again and again. The opposite happened.
Binding lowers diversity (18 sequences against 30 to 33 at 0.2, 26 to 28 at 0.05), shortens strands and costs births, and the
dominant sequence changes no more often. The reason is that a two-unit match already holds, and
among random sequences a two-unit opposite-letter match is everywhere: binding is not a lock and
key but general stickiness, and it costs long strands most because they have more places to be
caught. **A longer key, tried.** `pMeltEnd` sets the melting of a bond with a bound neighbour on one side
only (the end of a run), between the lone rate and the in-run rate, so only runs of three or more
hold (a zipper). Bound units on average over 12,000 steps, four copies of `ABBABA` and of its
perfect complement `BABAAB` against eight random 6-mers:

| pMeltEnd | perfect complements | random strands |
|---:|---:|---:|
| 0.02 | 0.3 | 1.0 |
| 0.01 | 0.7 | 5.7 |
| 0.004 | 13.7 | 12.7 |

There is no window in which the perfect match holds and the random ones do not. Random 6-mers
share a three-unit opposite stretch often enough, and nucleating a run takes as long for a
perfect match as for a partial one. With two letters and strands of four to six, there are too
few distinct keys for recognition to be specific. The line would need longer strands or a larger
alphabet; it is parked, with both knobs off by default.

## 19. Two genes in a four-letter world (`genes.sh`, `motifs.js`)

Four letters, 128 of each, small world, low mutation, the length regime. Two rules of the same
form, both always on: `feed` (an armed `B` between two `A`s arms its neighbours: private energy)
and `shield` (a `D` between two `C`s makes its two bonds immune to radiation: private durability).
Seeds `ABABCD` and `CDCDAB` carry one gene each. Only the environment differs. Motif frequency
per block (× chance at the window's letter frequencies), by 250,000-step window:

| run | environment | ABA | CDC | mean newborn length |
|---|---|---|---|---:|
| G_none_1 | plentiful energy, no radiation | 0.054, 0.026, 0.027, 0.003 | 0.003, 0.001, 0.005, 0.024 | 3.4 to 4.0 |
| G_energy_1 | 26 particles, reload 0.0005 | 0.003, 0.009, 0.021, 0.001 | 0.075, 0.030, 0.009, 0.002 | 3.3 to 3.7 |
| G_rad_1 | radiation 0.0001 | 0.001, 0.003, 0, 0 | 0.185, 0.188, 0.171, 0.176 (13 to 21 × chance) | 2.5 to 2.6 |
| G_both_1 | both | 0, 0, 0, 0 | 0.207, 0.212, 0.203, 0.214 (8 to 10 × chance) | 2.6 |

Radiation selects the shield strongly and at once, and the population shrinks to about the
smallest strand that carries it, `CDC` itself, with both its bonds shielded. The energy setting
was not a pressure: `feed` fired 91 times in a million steps and births were as in the unpressed
run, so `ABA` drifted. With both, the shield wins alone and no genome carries both genes: the
radiation pressure toward short strands overrides everything, and a genome with both genes needs
at least six units.

Round 2 (`G2_*`), energy truly scarce (12 particles, reload 0.0003), radiation a third as strong,
two seeds each. Scarce energy: `ABA` rose to 0.09 to 0.11 per block (6 to 11 × chance) for
750,000 steps in one seed and was then lost, and never rose in the other; genomes shrank to 2.4
to 3.2 units. Both pressures: dimers in one seed, `CDC` alone in the other. No genome carried
both.

Why, in one line: neither gene pays for its own length. `ABA` with `feed` is three units that
save at most two energy particles, so a strand without it is always cheaper; `CDC` with `shield`
adds two bonds and protects exactly those two. Selection therefore prefers the shortest genome
that works, and two genes never fit. For genes to accumulate, a gene's benefit has to grow with
the genome that carries it. That is what the relay does (`relay`: a template unit passes FEED and
SHIELD on along its strand, away from the motif, so one motif arms or shields the whole strand);
round 3 (`G3_*`) repeats the four environments with it.

Round 3 (`G3_*`, relay on), per-block motif frequency (× chance) over the run, two seeds each:

| environment | ABA | CDC | mean newborn length | outcome |
|---|---|---|---:|---|
| none | drifts, 0 to 0.05 | drifts, 0 to 0.05 | 3.3 to 3.9 | neither selected |
| scarce energy | seed 1 held at 0.07 to 0.09 (4 to 7 ×) all run; seed 2 never arose | - | 3.3 to 4.1 (seed 1) | energy gene kept where it exists |
| radiation | - | 0.15 to 0.20 (8 to 11 ×), both seeds | 2.8 to 3.4 | shield gene selected, genomes longer than without the relay (2.5) |
| both | - | lost | 2.0 | both seeds collapse to dimers |

With the relay each gene pays for length where its pressure acts: energy-limited genomes carrying
`ABA` stay at 3.3 to 4.1 units, and radiation no longer shrinks shield carriers to bare `CDC`. No
genome carried both genes, though: two pressures at these strengths are more than the population
survives, and point mutation alone is slow to build a genome of six or more that has both.
Round 4 (`G4_*`) makes both pressures milder and turns on ligation, the one channel here that
joins two strands, so an energy-gene strand and a shield-gene strand can fuse.

Round 4 (26 particles, reload 0.0005, radiation 0.00005, relay on, two seeds each, with and
without ligation 0.02): every run survives and every run selects the shield (`CDC` 8 to 17 ×
chance). `ABA` never rises: `feed` fired 2 to 107 times in a million steps, so energy was still not
what limited births in the four-letter world. Ligation made 185 to 200 fusions per run and
genomes carrying both genes appeared (up to 8% of the long newborns in one window) but did not
spread, and none were left in the last quarter of either run.

Where the two-gene test stands: each gene is selected where its pressure acts, and with the
relay each pays for length; the shield is robust, the energy gene only where energy truly limits
copying, which in four-letter worlds is a narrow band between "not limiting" and "the population
dies". Genes did not accumulate in any run. The obstacle is not the rules for the genes but the
pressures: to hold two genes the population must meet two pressures of similar strength, each
strong enough to select and together weak enough to survive, for long enough that a combined
genome arises and spreads. That band has not been found.

**The band, searched** (`GR_*`): energy at 12, 16 and 20 particles (reload 0.0003 to 0.0005) against
radiation at 0.00002, 0.00003 and 0.00005, relay and ligation 0.01 on, 1,000,000 steps, one seed
each. Last 500,000 steps:

| energy \ radiation | 0.00002 | 0.00003 | 0.00005 |
|---|---|---|---|
| 12 particles | length 2.2, neither gene | 2.3, neither | 2.1, `ABA` traces |
| 16 particles | 2.2, `CDC` traces | 2.5, `CDC` 0.09 per block | 2.7, `CDC` 0.13 |
| 20 particles | 2.4, neither | 2.7, `CDC` 0.07 | 2.8, `CDC` 0.13 |

No cell holds both genes, and no cell holds the energy gene past the first half. Under two
pressures at once every population shrinks toward two or three units, the shield survives where
radiation is strong enough to select it, and the energy gene, which needs three units and an
armed middle before it pays, is lost. Genomes carrying both never exceeded a trace.

This is the old obstacle in a new form: every pressure in this world costs long genomes more than
short ones, so a genome carrying two genes must out-copy a dimer, and it does not. Biology's
answer to the same problem was not longer genomes first but compartments: genes in separate
short strands that share one enclosure and are selected together (the stochastic corrector). That
again needs compartments that keep with their contents and divide, which section 16 did not get.

## 20. Summary

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
- In a four-letter world a shield gene (`CDC`: its bonds immune to radiation) is selected
  strongly and at once wherever radiation acts; an energy gene (`ABA` with `feed`) only where
  energy truly limits copying. With a relay (one motif serves its whole strand) each gene pays
  for the length of its genome. Genomes carrying both genes appeared with ligation but did not
  spread in any run: accumulation of genes has not been shown.
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

## 21. Slow polymers: does limited dispersal rescue a public good? (`viscous.sh`, `assort.js`)

Section 17 slowed the energy particles and enlarged the world; the strands themselves always
diffused freely, so a copy was far from its parent within a generation. `mobS` slows every block
that has a bond (its Brownian step and turn) relative to a free one, as polymers adsorbed on a
mineral surface creep while monomers and energy diffuse: offspring stay near their parents. The
world is `SP_small_motif`'s (40×40, public `ABA` motif as the only real energy income, energy at a
fifth of its mobility, low mutation, the length regime, 1,000,000 steps). Copying is unharmed:
in a 150,000-step probe births were 571, 722, 606 and 840 at `mobS` 1, 0.3, 0.1 and 0.03, though
strands are shorter at 0.03 (2.4 against 4.0). `ABA` per newborn block, by 250,000-step window:

| run | mobS | ABA per block, by window | lost (≤ 0.01) in a window |
|---|---:|---|---|
| SP_small_motif (rerun, bit-identical) | 1 | 0.125, 0.102, 0.129, 0.035 | no, falling |
| SP_small_motif_2 | 1 | 0.105, 0.068, 0.004, 0.008 | yes |
| SP_small_motif_3 | 1 | 0.072, 0.128, 0.164, 0.184 | no |
| V_m10_1 | 0.1 | 0.159, 0.073, 0.001, 0.120 | yes, then back |
| V_m10_2 | 0.1 | 0.148, 0.130, 0.175, 0.118 | no |
| V_m10_3 | 0.1 | 0.213, 0.164, 0.146, 0.149 | no |
| V_m30_1 | 0.03 | 0.131, 0.149, 0.127, 0.107 | no |
| V_m30_2 | 0.03 | 0.120, 0.182, 0.207, 0.221 | no |
| V_m30_3 | 0.03 | 0.187, 0.114, 0.002, 0.007 | yes |
| V_ctl_m100_1 (motif off, reload 0.0003) | 1 | 0.046, 0.056, 0.087, 0.130 | - |
| V_ctl_m10_1 (motif off) | 0.1 | 0.037, 0.008, 0.035, 0.119 | - |
| V_ctl_m10_2 (motif off) | 0.1 | 0.036, 0.061, 0.109, 0.111 | - |

Slow polymers do make space: a newborn carrying `ABA` has carriers among the newborns born within
five units and 5,000 steps of it 1.12 to 1.61 times as often as among all newborns of that time,
against 1.05 to 1.18 at full mobility (`assort.js`). But the public motif is not rescued: it is
lost in one run of three at every mobility, and where it survives its frequency overlaps the
motif-off controls, which drift up to 0.11 to 0.13 by the end through founder descent. The losses
are not a slow invasion by free-riders but a crash: energy dips, only dimers (which cannot carry
`ABA`) still afford a copy, and the motif is gone with them. Kin clusters of a few strands do not
protect against that.

What this does not say: the worlds are small (about 100 strands) and one clustering scale was
measured; a larger world with slow polymers might behave differently. `mobS` stays as a physics
knob, default 1.

## 22. Is a two-gene genome kept once it exists? (`keep.sh`)

Section 19 asked whether evolution would assemble a genome carrying both genes and found none. This
asks the other half: seed only `ABACDC` (the energy gene `ABA` with `feed` and the shield gene `CDC`
with `shield`, relay on, so one copy of each serves the whole strand; three seed strands) in the
same four-letter world, and see whether it holds. Hard: the pressures of `G3_both` (12 particles,
reload 0.0003, radiation 0.0001); mild: `GR_e16_b3` (16 particles, 0.0004, radiation 0.00003);
none: 60 particles, reload 0.002, no radiation. Two seeds each, 1,000,000 steps.

| run | commonest newborns, first 50k steps | commonest newborns, 50k to 150k | last birth carrying `ABACDC` (step) | end: template units, mean length |
|---|---|---|---:|---|
| K_hard_1 | ABACDC, AB, CDC, CD | CDC, AB, CD, ACDC | 78,347 | 0, extinct |
| K_hard_2 | (both genes in half of the long births) | dimers only | 13,349 | 0, extinct |
| K_mild_1 | ABACDC, AB, ABA, CD | AB, CD, ABA, AC, CDC | 71,508 | 82, 2.4 |
| K_mild_2 | ABA and CDC at 11 to 16 × chance | both genes in 54% of long births | 175,877 | 58, 2.0 |
| K_none_1 | BBACDC, ABACDC, BACDC | BACDC, BBACDC, AB, CD | 221,527 | 291, 3.5 |
| K_none_2 | both genes in 14% of long births | no long birth carries both | 83,996 | 310, 3.4 |

The two-gene genome is not kept anywhere, not even without pressure. It falls apart into pieces
of itself (`AB`, `CD`, `ABA`, `CDC`, `ACDC`); the last birth carrying it comes between steps 13,000 and 222,000, and the pieces, each a
complete replicator of two to four units, out-copy the whole. Under radiation the reason is plain:
a newborn copy is not shielded until it is re-armed (the shield is a template-unit state), so it
is broken while it waits for energy, and the fragments live on. Under the hard pressures the
fragments die too and the world goes extinct; under the mild ones dimers take over.

What this says: the obstacle of section 19 is not only assembly. Every fragment of a genome longer
than two is itself a viable replicator, so any genome is in competition with its own pieces, and
pieces are cheaper. A genome can hold only where its fragments cannot live on their own. Two
directions follow: a smallest viable replicator longer than two (so fragments die), or compartments
(so fragments stay with the whole and are selected with it).

## 23. Flush polygons: snapped corners and a strain limit (`arc_split.js`)

On the user's picture of bonded polygons as one shape with a line between them: a bond pins two
corners onto two corners, but in a fixed number of solver passes the pins settle on a compromise
wherever the blocks cannot fit (section 16), and a closed ring of the wrong size shows gaping
corners. Two knobs, both default off:

- `snapCorners`: after the passes, every group of pinned corners (two blocks, or three or four
  meeting at a point) is brought to its common mean by deforming the blocks; the shape force works against the deformation from the next step on
  (rigid blocks included). Bonded sides are then always flush.
- `maxStrain`: a bond whose corners the passes left further apart than this (in block sides) lets
  go. It applies to membrane bonds and to a lone docked monomer (which falls off, as in undocking).
  A strand's own lateral bonds have their own limit, `maxStrainStrand`, off by default.

**Copying.** 40×40, 400 monomers, two `ABBABA` seeds, 40,000 steps, three seeds per row
(`snapCorners` on):

| rule for a strained bond | limit | births | unfaithful | strands not of length 6 at the end |
|---|---:|---:|---:|---:|
| none (limit off) | - | 107 | 0 | 0 |
| every bond breaks where it is | 0.25 | 854 | 49 | 471 |
| every bond breaks where it is | 0.9 | 129 | 18 | 44 |
| docked monomer falls off whole, strand bonds exempt | 0.25 | 496 | 26 | 496 |
| docked monomer lets go of its template only | 0.25 | 541 | 107 | 470 |
| only a lone docked monomer falls off; a copy in progress holds | 0.25 | 118 | 0 | 0 |
| the same | 0.4 | 115 | 0 | 0 |

Any mechanical break inside a copy in progress wrecks fidelity, at every limit tried: the strands
break into fragments, each a replicator. The misfits come from ordinary copying: 1% of face bonds
are pulled more than 0.26 to 0.54 of a side at any moment, almost all on docked monomers that
already have a linked neighbour (10% of those against 0.2% of lone ones), where a partial copy
forms a closed loop of bonds with its template; some are bridges between two neighbouring
templates. Polygon-exact contacts between unbonded blocks (a corner inside another block pushed out
across its nearest edge) were tried and removed: the tail did not shrink (face p99 0.45 either way)
and the physics ran 2.3 times slower. With a copy in progress exempt, copying is exact and
`snapCorners` alone copies exactly at stiffness 0.5 and 1 (140 and 159 births, none unfaithful, four
seeds).

**Membrane.** An open arc of 24 wedges at 30° (natural ring 12), relaxed, then left alone for
20,000 steps, 20 seeds each:

| setting | two rings | one ring | no ring | ring sizes |
|---|---:|---:|---:|---|
| no limit | 0 | 18 (all of 24, frustrated) | 2 | 24 |
| limit 0.25, rigid wedges | 4 | 13 | 3 | 9 to 13 |
| limit 0.25, corners snapped | 8 | 12 | 0 | 9 to 13 |
| no limit, corners snapped, stiffness 0.7 | 0 | 12 | 8 | - |
| limit 0.25, corners snapped, stiffness 0.7 | 15 | 5 | 0 | 8 to 14 |
| the same, an arc of 36 | 19 (two or three) | 1 | 0 | 8 to 14 |

Blocks that give a little plus bonds that give up past a limit turn an overlong membrane into
rings of about the natural size: the arc curls, the most strained bond lets go, and each part
closes. That is the physical half of division: a membrane that has grown to twice its natural
size usually ends up as two compartments. Whether the contents are split between them is the next
question. Fluid membrane (an open membrane side taking over a bonded one, `pSwap`) was also tried
and removed: rings formed faster but at the wrong sizes, and with the limit on it did not help.

## 24. Walls made by their strands (`tether_probe.js`, `cells.sh`, `walls.sh`)

Section 16's make rule activated membrane at a maker's back, but activated membrane spread
everywhere. `tether` keeps it with its makers: a raw block anchored on a `MAKE` back (the back of an
`A` template unit between two `B`s) passes an anchor signal along its arc (as `relay` passes `FEED`
along a strand); raw blocks join only an anchored arc's open ends; active membrane the signal does
not reach falls back to raw at `pMemDecay` and lets go. `memPerm` makes membrane permeable to free
monomers (a membrane block and an unbonded letter do not collide), while strands and energy
particles stay on their side. All on the flush-polygon physics of section 23 (corners snapped,
membrane stiffness 0.7, strain limit 0.5).

**What the tether does.** One `ABBABA` strand among 250 raw membrane blocks (30×30, no turnover,
energy not gating): an anchored arc grows on the strand's back and curls around it, the strand
bending along the inside of its wall; each copy that carries `BAB` starts a wall of its own; arcs of
neighbouring strands join end to end into walls shared by several strands; now and then an arc
closes into a ring around its maker and the maker's copy. Nothing in the rules mentions a cell;
the rule is "raw membrane joins the open end of an arc anchored on a maker".

**Rings holding strands**, three seeds per regime, 150,000 steps, bend 15° (rings of about 24),
standard turnover; mean over the last two thirds (`cells.sh`):

| membrane | seed 1 | seed 2 | seed 3 | active membrane at the end (of 250) |
|---|---:|---:|---:|---|
| fixed stock, all active | 1.40 | 2.30 | 1.70 | 250 |
| made at `BAB` backs (section 16's rule), permeable | 0.30 | 1.10 | 0.30 | 20, 250, 16 |
| tethered | 0.20 | 0.00 (extinct) | 1.20 | 155, 0, 74 |
| tethered, permeable | 0.00 | 0.80 | 0.00 | 0, 87, 0 |

By this measure the tether does worse than a fixed stock. Where walls vanish, the population lost
its `BAB` makers: a wall does nothing for the strand inside it yet, so nothing keeps the maker
motif against drift, and without makers the tethered membrane decays. When energy comes only from
the public `ABA` motif (charged particles cannot pass membrane), walls persist in both seeds tried
(121 to 176 active blocks after 200,000 steps, one to four rings holding strands). Whether walls
then pay (whether `BAB` and `ABA` rise together) is `walls.sh`, below.

**Correction (section 25).** The three rounds below ran with energy particles at full mobility and
membrane jostling as hard as any block, and in that setting walls do not keep energy particles in:
three particles started inside a closed ring were all outside within 20,000 steps. The benefit these
rounds were meant to test (energy kept inside) did not exist; what they measured is the cost of a
wall. Read them as that.

**Do walls pay?** (`walls.sh`, 30×30, energy only from the public `ABA` motif, 1,000,000 steps,
three seeds each.) W: strands carrying `BAB` grow tethered, permeable walls. N: the same world with no
membrane, where `BAB` does nothing. Per newborn block, × chance, by 250,000-step window:

| run | `BAB` | `ABA` | births | active membrane at the end |
|---|---|---|---:|---:|
| W_1 | 2.2, 0.8, 0.2, 0.1 | 2.7, 2.0, 2.3, 3.6 | 1,470 | 79 |
| W_2 | 0, 0, 0, 0 (lost with the motif at the start) | 0, 0, 0.3, 0.1 | 930 | 30 |
| W_3 | 1.6, 0.8, 0.4, 0.8 | 1.7, 3.0, 4.3, 3.2 | 1,485 | 49 |
| N_1 | 1.7, 2.3, 1.9, 2.2 | 1.6, 2.7, 2.1, 0.9 | 1,636 | - |
| N_2 | 1.9, 1.4, 2.0, 0.6 | 1.9, 1.9, 2.1, 0.7 | 1,469 | - |
| N_3 | 2.0, 2.8, 4.1, 3.9 | 2.3, 2.4, 2.4, 2.9 | 2,112 | - |

Making a wall is selected against: where walls exist `BAB` falls from about twice chance to a fifth
of it, while in the world without membrane, where it does nothing, it drifts around twice chance.
`ABA` does as well or better in the walled seeds that kept it, but only after the walls were gone.
The reason is that only a closed ring keeps energy in, and a wall rarely closes around its maker;
an open wall is a cost (it bends its strand, crowds the copies, and slows births) with no return.

What this says: tethered walls are made by, and stay with, their makers, which section 16 lacked,
but a wall pays only when it closes, and closure is left to chance. For compartments to be selected,
a maker's wall has to close around it reliably, and then divide with it. Neither is solved.

**Closure around the maker** (`closure.js`: one `ABBABA` among 150 raw membrane blocks, 24×24,
tether on, strain limit 0.5, corners snapped, 20 seeds, 60,000 steps). A wall that does not close
either overshoots (its two ends pass each other and it grows on into a spiral, up to three times a
ring's length) or breaks and loses its unanchored part. Two membrane ends link where their back
corners come within `memLinkTol` of each other (default: the side-to-side tolerance, 0.15 of a
side); passing ends rarely come that close. Since corners are now snapped together and a badly
aligned bond snaps under strain, the catch can be looser:

| bend | membrane stiffness | catch | walls closed around their maker | median step |
|---:|---:|---:|---:|---:|
| 15° | 0.7 | 0.15 | 10 of 20 | 30,000 |
| 15° | 1 | 0.15 | 8 of 20 (9 overshot, 3 broke) | 49,500 |
| 12° | 1 | 0.15 | 8 of 20 (5 overshot, 7 broke) | 30,000 |
| 15° | 1 | **0.3** | **20 of 20** | 11,500 |
| 18° | 1 | 0.3 | 20 of 20 | 13,500 |
| 12° | 1 | 0.3 | 15 of 20 | 13,500 |
| 15° | 0.7 | 0.3 | 14 of 20 | 10,000 |
| 15° | 1 | 0.5 | 19 of 20 | - |

With the looser catch a maker's wall closes around it within about 12,000 steps, stays closed for
10,000 to 50,000 steps, opens under strain and often closes again (eight seeds traced over 60,000
steps). Rigid membrane closes more reliably than soft.

**Do walls pay once they close?** (`walls.sh`, round 2, `W2_*`: the same test with rigid membrane
and the catch at 0.3; `W2b_1` at 18°; the `N_*` runs above are the control.)

| run | `BAB` × chance, by 250k window | `ABA` × chance | charged particles (of 40), every 100k |
|---|---|---|---|
| W2_1 | 2.3, 0.5, 0.8, 0.1 | 3.0, 4.6, 1.9, 1.0 | 33 36 39 37 33 26 1 5 36 2 |
| W2_2 | 1.0, 0.4, 0.4, 0.0 | 4.2, 4.1, 2.2, 1.1 | 38 38 38 40 38 40 34 38 34 2 |
| W2_3 | 0.3, 0, 0, 0.1 | 1.4, 0.2, 0, 0 | 36 27 1 19 1 1 1 1 2 0 |
| W2b_1 | 0.5, 0, 0.3, 0.1 | 0.6, 1.4, 3.1, 2.2 | 5 0 1 33 32 38 37 40 40 37 |
| N_1 (no membrane) | 1.7, 2.3, 1.9, 2.2 | 1.6, 2.7, 2.1, 0.9 | 39 38 33 38 38 38 38 39 19 0 |

Closing walls are selected against as strongly as open ones. The energy column shows why this test
could not have shown a benefit: once a few motifs exist, nearly every particle is charged, so energy
is not scarce, and a wall that keeps energy private saves nothing (the lesson of section 14 again).
What was measured is the cost: a closed wall also shuts its maker's copies in, so a walled lineage
cannot spread until its wall opens, while an unwalled one spreads freely. Round 3 makes energy scarce.

**Round 3, energy scarce** (`W3_*`, `N3_*`: 12 particles instead of 40, two seeds each):

| run | `BAB` × chance, by 250k window | `ABA` × chance | charged particles (of 12), every 100k | births |
|---|---|---|---|---:|
| W3_1 | 0.6, 0, 0, 0 | 0.6, 0, 0, 0 | 2 1 2 0 0 2 0 1 4 1 | 420 |
| W3_2 | 1.5, 0.9, 0.1, 0.1 | 2.3, 5.8, 4.0, 2.2 | 1 8 10 11 9 12 8 2 8 1 | 1,593 |
| N3_1 | 2.3, 2.1, 2.3, 1.8 | 2.3, 2.5, 2.8, 1.0 | 9 10 12 10 10 12 7 10 0 0 | 1,525 |
| N3_2 | 1.6, 2.1, 0.2, 0.3 | 1.5, 1.2, 1.7, 2.8 | 10 10 4 2 0 6 9 10 10 9 | 1,773 |

Walls are selected against here too: in the walled seed that lived, `BAB` fell to a tenth of chance
within 500,000 steps while `ABA` rose to 4 to 6 times chance without it; the other walled seed lost
its motifs early and lived on dimers. Even with 12 particles the energy economy flips between
plenty and crash, so a steady scarcity in which private energy pays for the wall was not reached.

Where walls stand after three rounds: made by their strands, tethered to them, closing reliably, and
not worth their cost to the lineage in any energy regime tried. Two costs are plain: a closed wall
shuts the maker's copies in until strain opens it, and the wall is made from the same crowded space
the lineage needs to spread into. The benefit (energy kept inside) is real only while energy is
scarce, and in this world energy is scarce only on the way to a crash.

## 25. Walls that are walls, and rays as particles (`leak.js`, `ray_shield.js`, `closure.js`)

**Leaks.** Particles started inside a closed ring of rigid membrane (24 blocks at 15°, immune to
rays), counted outside after 20,000 steps (`leak.js`; three particles; the ring's own polygon decides
inside):

| walls' mobility | energy, mobility 1 | energy, 0.2 | ray (size 0.3), mobility 0.3 | ray, 0.12 | ray, 0.08 |
|---:|---:|---:|---:|---:|---:|
| 1 | 3 of 3 out | 3 of 3 | 3 of 3 | 3 of 3 | 3 of 3 |
| 0.5 | 3 of 3 | **0 of 3** | 3 of 3 | 2 of 3 | **0 of 3** |

Two separate leaks. A particle whose Brownian step is a sizeable part of a side (energy at full
mobility moves about 0.6 per step) jumps a wall one block thick. And a wall block kicked as hard as a
free block (0.3 per step, sometimes 0.9) can carry its centre past a particle lying against it; the
disc contact then pushes the particle out the far side while the pins pull the block back (traced
step by step: the particle moves 0.6 to 1.2 within the solve, against a kick of 0.12). Crowding does
the same: particles pressed into the wall by others are pushed through. Neither is cured by more
passes or a wider contact list. A wall seals when its blocks move less (`mobM`, the membrane's
Brownian step, default 1) and what it holds moves in small steps. The same goes for strands: at full
strand mobility a strand leaves a closed ring (5% of its blocks inside at the end against 50% for a
strand that stays); at `mobS` 0.6 it stays.

**Rays** (`nX`, `rayHit`, `sizeX`, `mobX`): radiation as particles instead of a rate. A ray is a small
block that never bonds; it passes through everything but membrane, and touching a block it breaks one
of its lateral bonds at `rayHit` per step of contact, scaled by the resistances (a shielded bond does
not break). A closed ring then shields what it encloses by plain physics (`ray_shield.js`: a ring
immune to rays, a strand of four inside, one outside, 60 rays, broken bonds rejoined only where the
halves still touch, 30,000 steps):

| mobilities (bonded letters, membrane, rays) | hits inside | hits outside | strand blocks inside |
|---|---:|---:|---:|
| 1, 1, 0.08 | 0 | 992 | 3% (the strand left) |
| 1, 0.5, 0.08 | 0 | 1,420 | 4% (the strand left) |
| 0.6, 0.7, 0.08 | 152 | 492 | 50% |
| **0.6, 0.5, 0.08** | **0** | **594** | **50%** |

**Closure at sealing mobilities.** Slow membrane closes less often: the arms of a wall that miss each
other no longer wobble into each other, and they overshoot into spirals. The pictures show why they
miss: the maker, a straight strand anchored on its own wall, is a stiff bar across the inside of the
ring and holds the wall out of round near the anchor. A genome has to fit inside the wall it makes
(`closure.js`, bend 15° unless noted, catch 0.3, letters 0.6, membrane 0.5, 20 seeds, 60,000 steps):

| maker | closed | overshot |
|---|---:|---:|
| `ABBABA` (6 units) | 4 | 11 (5 broke) |
| `ABBABA`, bend 10°, catch 0.5 | 10 | 10 |
| `ABAB` (4) | 11 | 9 |
| `BAB` (3) | 19 | 1 |
| `BAB`, bend 18° | 20 | 0 |

(At full mobility, where walls leak, `ABBABA` closed 20 of 20: its strand bends and the wall wobbles.)
So in a world where walls hold, cell size limits genome length, a constraint no rule states. The
selection test with rays is `rays.sh`, below.

**Walls against rays** (`rays.sh`: 30×30, 60 rays at `rayHit` 0.0005, the sealing mobilities above,
`ABBABA` seeds, 1,000,000 steps, three seeds each):

| run | template units every 200k | births | ends |
|---|---|---:|---|
| R_W_1 (walls) | 0 0 2 0 0 | 285 | extinct |
| R_W_2 | 0 2 9 10 0 | 358 | extinct |
| R_W_3 | 6 0 2 0 0 | 269 | extinct |
| R_N_1 (no membrane) | 35 34 39 44 23 | 3,170 | dimers |
| R_N_2 | 16 51 26 24 45 | 3,021 | dimers |
| R_N_3 | 40 43 52 41 32 | 3,152 | dimers |

The walled worlds die; the unwalled ones live on as dimers. Two probes with three-unit makers
(`BAB`, which close their walls reliably), rays switched on at step 40,000 once walls had had time
to form, at `rayHit` 0.001 and 0.002: in both, one wall at most had closed when the rays came, the
unwalled strands died, and the walled lineage was gone by step 100,000 (its wall decays once its
maker is lost); the world without membrane lived on at 0.001 and was near extinction at 0.002.

Where compartments stand after sections 16, 24 and 25. Every piece works on its own: division of an
overlong membrane (strain), walls made by and tethered to their makers, closure around the maker,
walls that keep rays out and strands in. Together they do not pay, for reasons that are physical
rather than about the rules: a wall of 20 to 24 blocks recruited one at a time from the medium
takes longer to build than a strand takes to copy; walls seal only when membrane and contents move
slowly, and slow walls close only around short makers; a closed wall shuts its maker's copies in;
and a world dense in membrane is a worse place for strands. In every selection test here, making a
wall was selected against or the walled world died.

## 26. Cutting by recognition (`cut.sh`, `who_cuts.js`, `tribes.js`)

The user's choice after section 25: ecology instead of longer genomes. `cut` builds on binding
(section 18: two template faces of complementary letters, A–B and C–D, stick; a run of such pairs
holds long, a lone pair melts fast): a template unit in the motif `cutMotif` (default `BAB`) whose face
is bound to another strand shows `CUT`, and the unit bound to it lets go of all its bonds at `pCut`
per step, so the other strand is cut. Copies pair a letter with itself, so a strand and its copy do
not bind at the copying alignment; the hope was a bacteriocin: a cutter that cuts only non-kin.
Neighbours are competitors when polymers creep (`mobS` 0.3).

**Two letters** (`CUT_*`, `CTL_*`: 40×40, 256 A + 256 B, binding 0.05, `ABBABA` seeds, 1,000,000 steps):

| run | `BAB` × chance, by 250k window | births | cuts |
|---|---|---:|---:|
| CUT_1 | 0.3, 0.1, 0.2, 0.2 | 5,751 | 233 |
| CUT_2 | 1.6, 0.5, 0.3, 0.1 | 6,598 | 568 |
| CUT_3 | 0.6, 1.2, 0.7, 0.2 | 6,953 | 577 |
| CTL_1 (binding, no cutting) | 1.7, 0.9, 0.7, 0.3 | 5,322 | 0 |
| CTL_2 | 3.8, 3.7, 3.0, 2.4 | 5,964 | 0 |
| CTL_3 | 0.6, 0.3, 0.5, 0.8 | 5,280 | 0 |

The cutter motif is selected against, ending at 0.1 to 0.2 × chance in every cutting run. Births
rise a little with cutting (cut strands return their monomers). Who cuts whom (`who_cuts.js`, 200,000
steps of `CUT_1`'s world, each strand read along its own bonds): 34 of 77 cuts hit a strand of the
cutter's own sequence (`BABA` cuts `ABAB`, its reversed copy), 39 hit other strands without the motif.
The cutter is autoimmune: `BAB` is alternating, and an alternating stretch is complementary to
itself shifted by one letter, so a strand carrying it binds its own copies, which slow polymers keep
beside it. In two letters no cutter can avoid it.

**Four letters.** A strand that uses only one letter of each pair (only A and C, say) can never bind
its own kind. With cutter motif `CAC` and a cutter strand `ACACCA` among mixed strands, 23 of 24 cuts
in 200,000 steps hit strands carrying B or D, none a strand of the cutter's own sequence: self and
non-self are told apart by sequence. The selection test is below (`CUT4_*`, `CTL4_*`).

**Four letters, selection** (`CUT4_*`, `CTL4_*`: 128 of each letter, binding 0.05, cutter motif `CAC`,
seeds `ACACCA` and `ABCDBA`, slow polymers, 1,000,000 steps, three seeds each). Newborns of three
units or more by tribe (`tribes.js`: a strand using one letter of each binding pair cannot bind its
own kind):

| run | cuts | births | `CAC` per block, by 250k window | share of newborns in a tribe (not mixed), by window |
|---|---:|---:|---|---|
| CUT4_1 | 5 | 3,079 | 0.003, 0.001, 0.001, 0.001 | 4%, 10%, 6%, 6% |
| CUT4_2 | 14 | 3,221 | 0.012, 0.003, 0.002, 0.000 | 9%, 8%, 22%, 11% |
| CUT4_3 | 36 | 3,352 | 0.010, 0.001, 0.002, 0.012 | 8%, 6%, 13%, 18% |
| CTL4_1 | 0 | 3,380 | 0.004, 0.000, 0.001, 0.001 | 5%, 11%, 8%, 11% |
| CTL4_2 | 0 | 3,457 | 0.021, 0.000, 0.001, 0.001 | 17%, 7%, 11%, 10% |
| CTL4_3 | 0 | 3,382 | 0.025, 0.021, 0.005, 0.012 | 12%, 4%, 14%, 18% |

Nothing happened: cutting was too rare to matter (5 to 36 cuts in a million steps). The one A/C cutter
seed was swamped by mixed strands within the first window, and random sequences almost always carry
both letters of a pair (80% to 96% of newborns), so a cutter's own lineage is mixed within a few
generations and the motif is as rare as in the control. Cutting as built needs its motif to be
common before it can pay, and nothing makes it common. A null result, not a negative one.

## 27. Throwing things at the wall: a random search over worlds (`search.js`, `search_summary.js`, `world.js`)

The user's suggestion (2026-09-24): real evolution is messy and got going once enough complexity had
built up through many separate processes, so stop testing one mechanism at a time. Almost everything
built here fails alone for one reason: it is a cost with nothing yet to pay for it (walls without a
hazard, cutters without prey, energy genes without scarcity). `search.js` draws worlds at random from
everything built so far (two or four letters; energy count, reload, `motif`, `feed`, `relay`; `shield`;
`act`; radiation as a rate or as rays; binding and cutting with or without the relay; tethered walls,
permeable or not; polymer and membrane mobility; ligation; cooperative docking and fraying rates).
Seeds are four random strands and spontaneous origins, so no gene is put in by hand. Each world runs
300,000 steps (40×40, corners snapped, strain limit 0.5) and is scored, over the middle and the last
third, on newborn length, distinct sequences, how many of its functional motifs (those that do
something under its rules) are present, and how many sit in one genome. 80 worlds, results in
`experiments/out/search_1.jsonl`; 64 alive at the end. Top by length and by motifs in one genome:

| world | births | mean newborn length, middle → last third | distinct sequences | functional motifs present | most in one genome | mechanisms on |
|---:|---:|---|---|---|---:|---|
| 62 | 633 | 5.07 → 5.15 | 68 → 57 | `BAB` | 1 | 4 letters, walls (permeable), ligation, 40 particles, `mobS` 0.6 |
| 19 | 444 | 4.35 → 4.78 | 33 → 42 | `ABA`, `CDC`, `BAB` | 2 | 4 letters, public energy motif, shield, walls (permeable), binding 0.02, ligation, 40 particles |
| 59 | 218 | 4.05 → 4.23 | 13 → 16 | `CDC` of 3 | 1 | 4 letters, shield, relayed cutting, walls, binding, scarce energy, `mobS` 0.3 |
| 45 | 534 | 3.51 → 3.80 | 24 → 26 | `ABA` | 1 | 2 letters, cutting, binding, ligation, `mobS` 0.3 |
| 58 | 1,114 | 2.96 → 3.29 | 53 → 69 | `CDC`, `ACA` | 1 | 4 letters, relay, shield, cutting, radiation, binding 0.05, ligation, 12 particles |
| 65 | 1,483 | 3.10 → 3.06 | 59 → 55 | `ABA` | 1 | 2 letters, feed, relayed cutting, 80 rays, binding 0.1, ligation, `mobS` 0.3 |

(Two-letter worlds reach "two motifs in one genome" trivially: `ABAB` carries `ABA` and `BAB`.) World 19
is the first world in this project where genomes are long and growing, diversity is rising, all
its functional motifs are present, and genomes carry two of them at once, in four letters, where
two genes need five units or more. Ligation is on in five of the six. Walls, which never paid in a
controlled test, are on in three. One seed each and 300,000 steps: these are leads. Long runs and a
second seed follow (`world.js`).

**World 19 followed up** (`world.js 19`, 2,000,000 steps, and with a second random seed): mean newborn
length by 500,000-step window 5.0, 7.3, 7.9, 8.7 (second seed 5.0, 7.9, 12.1, 11.0), strands in the
population 12 to 13 units long at the end, the longest this project has seen; but births fall in
every window (596 to 195), diversity falls (36 to 18 distinct), and the three motifs do not hold.
Knockouts, one mechanism off at a time, 1,000,000 steps:

| world 19 with | mean strand length at 1M | births | `ABA` × chance, second half |
|---|---:|---:|---:|
| everything on | 7.7 | 959 | 0.7 |
| ligation off | **4.1** | **1,540** | **6.9** |
| binding off | 17.8 | 667 | 0.7 |
| walls off | 8.6 | 845 | 1.9 |
| shield off | 12.3 | 833 | 1.8 |
| energy motif off | 14.1 | 605 | 2.0 |

The long genomes are ligation and nothing else: strands fuse end to end, fraying is at the bottom of
the searched range (1.1e-5), and fused strands pile up and copy ever more slowly. It is accumulation
by fusion, not selection for function. Without ligation the world copies faster and the energy motif
stands at 5 to 7 times chance. A false lead, with a lesson for the search: mean length rewards fusion,
so a score must ask for function, not length.

## 28. Stranger blocks (the user's idea, 2026-09-24)

Block types that were not thought of or were set aside, each behind a knob (default off,
trajectories bit-identical) so the search can draw them.

- **Size and mobility per letter** (`sizeA`..`sizeD`, `mobA`..`mobD`). 40×40, two `ABBABA` seeds,
  30,000 steps, two seeds: uniform giants (1.4) 77 births, none unfaithful; uniform small letters
  (0.7) 84 births, 7 unfaithful; A at 1.4 with B at 0.7, 2 births: a docked giant and a docked small
  neighbour cannot hold a link, so a strand of mixed sizes can hardly be copied.
- **Folding letters** (`foldA`..`foldD`, degrees): a folding letter has the fold as its bend while
  its face is free and its ordinary shape while something is bound to its face, so a free strand
  curls and the part being copied straightens (copy straight, fold free: the hinge idea of the rigid
  engine, now as a shape). Twelve A at 30° curl into a spiral; they do not close into a ring (ligation
  needs flush ends). Copying is untouched: fold 0, 10 and 20° on both letters give 74, 71 and 76
  births, none unfaithful.
- **Caps** (`nP`, `nQ`, `capFray`), after the user's question whether chains have end blocks (they did
  not: an end was any letter with a free side). `P` has only a right side and can sit only at a left
  end, `Q` the mirror; a copy lies reversed on its template, so `P` docks on a `Q` template and `Q` on
  `P`, and a capped strand `P…Q` copies into a capped strand. A cap cannot be extended, captured onto
  or ligated, and it frays at `capFray` times the normal rate (default 0: never). Seeds `PABBAQ`
  against `ABBA`, strong fraying, three seeds, 40,000 steps:

  | seed | births | capped at both ends | frays | template units at the end |
  |---|---:|---:|---:|---:|
  | `PABBAQ` | 59 | 59 | 0 | 922 |
  | `ABBA` | 3,191 | 0 | 3,461 | 688 |

  Capped strands never die, so the material ends up locked in immortal templates and births almost
  stop; caps need something else that kills (radiation, rays, cutting). A capped genome changes length
  only by copying errors inside it (the user's point: consistent copies, variation still possible).
  The errors that appeared are duplications: `PABBAQ` → `PABBBBAQ` → `PABBBBBBBBAQ`, made when a copy's
  two halves dock on two neighbouring templates and link in the middle (the chimera of crowded
  templates, section 10). With capped ends that is the only way a genome grows, and what it makes is
  internal duplication, which in biology is the raw material of new genes.

Search round 3 (`search.js --round=3`) draws folding letters, more ligation and caps on top of round 2.

## 29. Double strands and temperature cycles (`duplex.sh`), partial

Complementary copying (`compCopy`) with binding (`pHyb` 0.2) and heat cycles (`heatPeriod` 5,000, hot fifth). 500,000
steps, 40×40. Seeds 1 and 2 finished (seed 3 and `DX_bindheat_2` were stopped at the handoff, 2026-09-24). Mean length of
newborns (length 2 and up) per 125,000-step window:

| run | births | mean length by window |
|---|---:|---|
| DX_comp_1 (no binding) | 2,674 | 4.55, 3.61, 3.37, 3.48 |
| DX_comp_2 | 2,213 | 4.60, 4.26, 4.18, 3.71 |
| DX_bind_1 (binding, no heat) | 2,444 | 2.09, 2.26, 2.38, 2.39 |
| DX_bind_2 | 2,578 | 2.13, 2.31, 2.33, 2.33 |
| DX_bindheat_1 (binding + heat) | 1,678 | 4.56, 4.17, 3.92, 3.63 |
| DX_heat_1, DX_heat_2 (heat, no binding) | | identical to DX_comp_1, _2 (heat acts only on binding) |

What it says: binding without heat collapses length to about 2.3 (long strands are locked in double strands and stop
copying; short ones win). Heat undoes that: with cycles, length stays near the no-binding level (3.6 at the end against
3.5, one seed). The earlier lead (4.3–4.8 against 3.65 in a short probe) does not hold at 500,000 steps. What it does not
say: one seed for binding + heat; whether double strands protect anything (no pressure was on).

## 30. Chirality (`chiral.sh`, `hand.js`), partial

A racemic pool (`chiral` 0.5), one strand of each hand as seeds, 300,000 steps. Births per 50,000-step window as
one-handed upper / one-handed lower / mixed, and the enantiomeric excess of the one-handed ones:

| run | windows |
|---|---|
| CH_mis0_1 (no mirror docking) | ee 0.10, 0.13, 0.04, 0.06, 0.06, 0.06; no mixed births |
| CH_mis03_1 (`pMisDock` 0.3) | ee 0.10, 0.03, 0.13, 0.10, 0.21, 0.02; about half of births mixed |
| CH_mis1_1 (`pMisDock` 1) | ee 0.00, 0.16, 0.04, 0.16, 0.04, 0.01; about half mixed |

No symmetry breaking: with hands fixed for life, the losing hand's monomers pile up in the pool and favour it again
(negative frequency dependence), as expected without a shared pool. Round 2 (`ROUND=2 experiments/chiral.sh`: free monomers
flip hand at `pRacem` 0.001, mixed neighbours link at `pMixLink` 0.001, with and without mirror docking; Frank's conditions)
was started and stopped at the handoff; it needs running. Seed 2 of round 1 also.

## 31. Droplets (`droplets.sh`), not yet run

`nG` blocks separate into liquid droplets at `gStick` 1, `gRange` 2.2 (at 0.3 or with range 1.6 they stay dispersed:
Brownian steps are 0.3 of a side). With strands drawn to G (`gStickS` 0.6, `gStickF` 0.3) about a fifth of template units
sit in droplets, at the droplet surfaces, and copying is unharmed (105 births in 30,000 steps against 82 without). The
selection test (does grouping in droplets rescue the public `ABA` motif that section 21 lost) is scripted, not run.

## 32. Random chemistry (`src/rchem.js`, `rsearch.js`, `autocat.js`), partial

The user's question (2026-09-24): blocks with random sides, random attractions and random switching rules in one world,
too much chaos or enough for complexity? A random table: K types, NS states, NC side colours (0 inert); a side's colour
from (type, state, side); colour pairs attract with probability pAff; rules "side i bonded to colour c (or free) → state
s" with probability pRule. 31 of 100 tables screened (`experiments/out/rsearch_1_partial.jsonl`, 30,000 steps, 25×25,
about 300 blocks):

- 5 of 31 gel (one assembly of 100 or more blocks), 2 barely bond, 24 in between: small assemblies that form and break.
- Order beyond chance is common: repeats among assemblies of 3+ blocks against the same assemblies with their make-up
  shuffled are 44 against 1 (table 55), 30 against 0 (table 4), 65 against 22 (table 57). Table 4 of the first probe
  builds 2×2 squares of two types. This is self-assembly; it is not yet known to be copying.
- Positive control: `copyTable()` is a hand-written copier in the same format (states: free, docked, docked and linked
  right or left, released, strand, left end, right end, leaving). It copies (strand blocks from 12 to 140 in 30,000 steps)
  but products fragment into 2–3-block strands (the fragment problem of section 22 again). `autocat.js --control`: 4
  copies of its commonest assembly put into a fresh world give 12 after 1,000 steps against 1 unseeded. That is the test
  that separates copying from self-assembly.

Not yet done: `autocat.js` on the top tables (55, 57, 4, 15, 1, 54), and the other 69 tables.

## 33. Telomeres: end-replication loss and the fragment problem (`telo.sh`, `telo3.sh`, `telo2.sh`, `capped.js`)

Section 22 ended on the fragment problem: any piece of a genome is itself a replicator and out-copies the whole, so a
two-gene genome falls apart into its genes. `endLoss` is a one-neighbour rule aimed at it (the user's point the same day:
locality is fundamental, so no rule may treat whole strands specially). A template block with a free lateral side shows no
face and marks its bonded side as a tip; a block that reads the tip counts that side as the end. A copy therefore lacks
its template's open ends. Caps (`P` has no left side, `Q` no right side) have no free side, so a strand capped at both ends
copies whole; a piece shrinks by a unit per open end per generation (`ABBABA` → `BABB` → `BA` → nothing; `PABBAB` →
`ABBAQ` → `PABBA` → `BBAQ` → `PAB` → `AQ` → nothing, `test.js`). This is the end-replication problem of linear
chromosomes and the telomere answer to it.

**Finding a working regime** (40×40, four letters, feed, shield and relay on, seed `PABACDCQ` ×3, 150,000-step probes):

| regime | what happened |
|---|---|
| 40 caps of each kind, 128 of each letter, `pFray` 3e-5, `pUndock` 0.1 | copying of the 8-unit genome so slow that radiation 3e-5 kills everything |
| 60 caps, `pUndock` 0 | copying stops at 20,000 steps: half-finished copies hold all the `A` and `C` monomers, and a template with a copy on it cannot die |
| 40 caps, 200 of each letter, `pUndock` 0.02 | the pieces' dying lineages (`CDCA` → `CD`, `PABA` → `BAQ` → `PA`) hold the caps; capped births stop |
| 120 caps, `pUndock` 0 | better (69 to 90 capped births in the first 50,000 steps), then the pieces' lineages fill the world and take the free letters |
| 120 caps, open ends fragile (`pFray` 0.001), caps not (`capFray` 0.03) | pieces die within about 1,000 steps; whole genomes copy steadily (120 to 340 capped births per 50,000 steps) |

The last is the regime of everything below: open ends fray fast (an exonuclease), capped ends slowly. Biology again: an
unprotected chromosome end is degraded.

**Round 1** (`telo.sh`, seed `PABACDCQ` alone, 500,000 steps, seed 1). Environments as in section 22: none (60
particles, reload 0.002), energy (16, 0.0004), radiation (`pBreak` 3e-5), both. Share of capped births carrying each gene:

| run | 0–100k | 100k–200k | 200k–300k | 300k–400k | 400k–500k |
|---|---|---|---|---|---|
| none | ABA 55%, CDC 47%, `PQ` 35 of 292 | `PQ` 271 of 388 | `PQ` 371 of 379 | `PQ` 360 of 361 | `PQ` only |
| energy | ABA 89%, CDC 90% | 82%, 82% | 87%, 74% | 89%, 53% | 85%, 64% (length 7.8) |
| radiation | ABA 65%, CDC 85% | 66%, 85% | 65%, 85% | `PQ` 101 of 363 | `PQ` 464 of 554 |
| both | ABA 73%, CDC 73% | `PQ` 373 of 675 | `PQ` 628 of 665 | `PQ` only | `PQ` only |

What it says. The fragment problem is gone: genomes do not fall apart into their genes, and each gene is kept where its
pressure acts (the energy gene at 85 to 89% under scarce energy while the unused shield gene drifts down; the shield at 85%
under radiation). But a new, smaller replicator appears: `PQ`, two caps and nothing between, made by a copying mistake
(first births of `PQ` at steps 17,615 to 30,198 in all four runs, from parents such as `DCABAQ`, `PABACDCQ`, `PCDC`).
Without pressure it won at once. Under radiation it arose at step 28,069 and took over only after step 300,000; under both
pressures it took over by step 200,000. Under scarce energy alone it arose (step 25,558) and did not spread: 19 births in
500,000 steps, while the two-gene genome held at length 7.8. So under scarce energy the genome with the private `feed` gene holds against `PQ` (why exactly is not measured); under
radiation, which costs per bond, the one-bond `PQ` wins slowly, and with both pressures radiation's push wins sooner. A gene here only reduces a cost that grows
with length, and the shortest genome hardly pays that cost.

Controls without `endLoss` (`TK_off_*_1`, same world otherwise): under scarce energy `PQ` takes over too (the two-gene
genome falls from 72% to 28% of capped births, `PQ` is the commonest capped strand at the end), where with `endLoss` it never
spread; under radiation the genome falls apart into its pieces, `PCDCQ` (the shield gene alone) rising to the commonest
capped birth (94 of 242 in the last window) beside `PQ`, with most births uncapped; under both pressures `PQ` again. So
`endLoss` alone already stops the genome falling into its genes, and under scarce energy it also keeps `PQ` out.

The fix tried next is in the same spirit as `endLoss`, one block property: `bareCaps`, caps have no back, so no energy
particle docks on a cap and a cap is armed only through its bond (the `feed` relay). Then `PQ` can never be re-armed, and a
genome must carry the energy gene to reproduce, as a real genome must encode its own metabolism.

**Round 2: bare caps** (`telo3.sh`: as round 1 with `bareCaps`; `TB_comp_*`: `PABACDCQ` against `PABAQ`, three seed strands
each; 500,000 steps). With bare caps `PQ` is sterile and the smallest viable genome is `PABAQ`, the energy gene between
caps. Share of capped births carrying each gene, and the one-gene competitor's births, by 100,000-step window, seed 1:

| environment | 0–100k | 100k–200k | 200k–300k | 300k–400k | 400k–500k | `PABAQ` births after 100k |
|---|---|---|---|---|---|---:|
| none | ABA 67%, CDC 15% | 58%, 2% | 55%, 0% | 57%, 0% | 60%, 0% | 183 to 192 per window |
| energy | ABA 72%, CDC 21% | 67%, 0% | 68%, 0% | 64%, 0% | 66%, 0% | 234 to 279 per window |
| radiation | ABA 86%, CDC 64% | 84%, 80% | 86%, 83% | 85%, 86% | 85%, 84% | 1 |
| both | ABA 91%, CDC 79% | 94%, 91% | 90%, 90% | 92%, 91% | 93%, 92% | 0 |

(The capped births without `ABA` are one-generation dead ends: `PABDQ`, `PCBAQ` and the like, point mutants of the energy
gene that cannot re-arm their caps. That load is why `ABA` sits at 55 to 70% of births where `PABAQ` wins.)

What it says: the shield gene is kept exactly where it pays. Where radiation acts, the eight-unit genome carrying both genes
drives the five-unit `PABAQ` extinct within the first 50,000 steps (78 births of it in the first 50,000, then 1 in 450,000)
and holds both genes in 74% (radiation) and 81 to 86% (both pressures) of capped births for the rest of the run, at mean
capped length 7.9 to 8.0. Where radiation does not act, `PABAQ` wins and the shield gene is lost by step 100,000 to
200,000. This is the first time in this project that a genome with two genes has been selected over a shorter competitor
and kept, and it happens in the environment (energy and radiation together) where every earlier attempt collapsed (section
19: to dimers; section 22: to the genome's own pieces; round 1: to `PQ`). **Seed 2** repeats every cell: with no pressure and with scarce energy `PABAQ` wins and the shield gene is gone by step
200,000 (`TB_comp_none_2`, `TB_comp_energy_2`); with radiation (`TB_comp_rad_2`, `TB_comp_both_2`) `PABAQ` is
out-competed within the first window, both genes in 68 to 70% (radiation) and 82 to 85% (both) of capped births from
100,000 steps to the end. **Keep runs** (`TB_keep_*`, `PABACDCQ` alone, two seeds): with radiation both genes stay in 67 to 88% of
capped births for 500,000 steps (under both pressures `PABAQ` arose by mutation, 33 births between steps 200,000 and 300,000,
and was purged); without radiation the shield gene decays by point mutation (74% → 32% with no pressure, 75% → 26% under
scarce energy in seed 1; 68% → 45% and 60% → 55% in seed 2) while the energy gene holds at 80 to 89%.

**Control: bare caps without `endLoss`** (`TB_noend_comp_rad_1`, radiation, seed 1). Among capped births the two-gene
genome still beats `PABAQ` (both genes in 59 to 71%), so bare caps are what decide between capped genomes. But pieces now
live on: capped births are 13 to 19% of all births (against 25 to 33% with `endLoss`), mean newborn length is 3.8, and at
the end the world holds 25 two-gene genomes among dimers and pieces (`CP`, `AP`, `DCP`, `CQ`, `AB`), against 47 with
`endLoss`. `endLoss` keeps the population made of whole genomes; bare caps make the second gene pay.

**Assembly** (`telo2.sh`, `TA_lig_1`: seeds `PABAQ` and `PCDCQ`, both pressures, ligation 0.02, 1,000,000 steps): no
genome carrying both genes was ever born. With bare caps `PCDCQ` cannot re-arm, so its seeds only wait to be broken; the last
birth carrying `CDC` was at step 32,662, and 174 ligations in the run never joined a `CDC` piece to an `ABA` piece. The test
gave the second gene no time to be picked up. The fairer question, whether the shield gene can arise inside `PABAQ` by
mutation, is `telo4.sh`.

**A gene from nothing** (`telo4.sh`, `TD_*`: seed `PABAQ` only, both pressures, 1,000,000 steps). A shield gene needs about
three insertions and some point mutations inside a genome that must keep `ABA` at every step. None arose: at fivefold
mutation (`pSoft`, `pCapture` 0.01) one birth in two million steps carried `CDC` (a sterile `PCDCQ`), and capped births were
almost all five units long (seed 1: 3,945 of length 5, 66 of length 6, none longer; seed 2: 4,386 of length 5, one of
length 6). Insertions happen but are lost: each adds a bond for radiation to break and pays nothing until the whole gene is
there, and under both pressures the population is small (60 to 70 template units, about thirteen genomes). This is the
classic valley between genes. Under radiation alone (`TD_rad5_1`, `_2`: plentiful energy, about 300 template units or
60 genomes, fivefold mutation) it is the same: 28 births in two million steps carried `CDC`, all of them sterile pieces
(`CDC`, `PCDCQ`, `CDCD`), none with `ABA` as well; 15,103 capped births were five units long and ten were longer. With these
mutation channels and population sizes a new gene of three letters does not arise inside a genome in a million steps.
Seeded, it is kept; from nothing, it is not made.
Part of the reason is the mutation spectrum: in a capped world almost only point mutations happen (a copy lies letter for
letter on its template; insertions and deletions need a copy that bridges two templates, which is rare), so genome length
hardly changes (15,103 of 15,113 capped births five units long). Ligation adds a local channel that changes length: a
genome broken by radiation can have its pieces rejoined to other pieces (end joining, as cells repair double-strand
breaks), giving duplications and deletions. With ligation 0.05 (`TD_lig_1`, `_2`, radiation only, fivefold mutation)
length varies more (lengths 6 to 10 in 94 and 88 capped births, against 10 in all without it), but no genome carrying both
genes was made in two million steps either (40 births with `CDC`, all sterile pieces).

**Niches** (`band.sh`: radiation only in the left half of an 80×20 world, `radBand` 0.5, seeds `PABACDCQ` and `PABAQ`,
1,000,000 steps, seed 1). Share of capped births carrying `CDC`, lit half (x < 40) against dark half, by 200,000-step window:

| run | lit half | dark half |
|---|---|---|
| TR_band_1 (ordinary mobility) | 63%, 83%, 82%, 83%, 80% | 46%, 63%, 70%, 65%, 64% |
| TR_bandslow_1 (`mobS` 0.3) | 79%, 81%, 81%, 83%, 82% | 58%, 50%, 54%, 55%, 44% |

No second species: `PABAQ` died out in both halves (after about 200,000 steps with ordinary mobility; at once, by chance,
with slow polymers, 4 births in all), so the dark half is filled by the lit half's genome too. What does differ is the
shield: in the dark half it decays by point mutation into same-length genomes with a broken shield (`PABADDCQ`,
`PABABDCQ`, `PCDBABAQ`), 44% against 82% at the end with slow polymers. That is relaxed selection in a place: a cline in
the genomes across the world, the first spatial difference in genomes seen here. One seed each.

## 34. Translation: a genome that builds a second polymer (`tr1.js`-style probes, `CA_*` runs), stage by stage

The user's direction (2026-09-25): emergent complexity from local rules, ideally "a well-running machine made of independent
parts that can copy itself", and replication modes of different kinds together. Of the directions in `LITERATURE.md` and
DESIGN 15, translation was chosen first: the genome builds something that is not a copy of itself (von Neumann's missing
half). `translate`: the back of an armed letter templates a *product* block (a new family, kinds `1`..`4`) by a fixed code
(`A`→`1`, `B`→`2`, `C`→`3`, `D`→`4`); docked products link where the template continues and a finished product chain is
released, exactly as a copy is on the face. No rule mentions translation: it is docking, linking and release on another
side.

**Stage 1, translation works** (40×40, four letters and four product kinds of 100 to 150 each, seed `ABACDCAB`): 12 of 12
products in 20,000 steps were exact (`ABACDCAB` → `12134312`), made beside ordinary copying. A first version cut products
short at any neighbour not yet re-armed (partial products `3121`, `12`); continuation is now read from the neighbour's type,
and a product waits for a neighbour that will be armed.

**Stage 2, products fold** (`fold1` 45°: a product block of kind `1` is a wedge while its face is free and square while
docked): the product of `AAAAAAAA` folds into an almost closed wheel of eight wedges (rendered; one gap: ligation needs flush
ends). Shape follows the genome's sequence.

**Stage 3, the machine needs its part** (`catalysis`): a finished product binds back onto strands it matches by the code
(cooperatively: a lone bound unit lets go at 0.05 per step, one in a bound run at 0.0005), and where one is bound the
template's face is catalysed: two monomers docked there link at once, elsewhere only at `pLinkBare`. Two letters, 50,000
steps, seed `ABBABA`:

| world | births |
|---|---:|
| ordinary copying | 152 |
| `pLinkBare` 0.01, no translation (no catalyst) | 0, extinct by step 30,000 |
| translation, no catalysis | 127 |
| translation + catalysis, `pLinkBare` 0.01 | 40, from step 30,000 on and accelerating (template units 19 → 201) |

With `pLinkBare` 0 nothing is ever copied without products, and with translation copying runs (test). The genome is copied
only with the help of the machine part it builds. (A bug on the way: the catalysis gate first applied to the links between
product blocks too, so no product could be finished; products link freely now.)

**Does the machine make length pay?** The hypothesis: longer products bind back longer, so length pays by degrees, which
might carry genomes over the valley of section 33. 300,000 steps, two letters, mutation (`CA_cat_1` against `CA_ctl_1`,
translation without catalysis):

| run | mean newborn length by 50,000-step window | births per window |
|---|---|---|
| CA_cat_1 | 5.25, 4.27, 3.97, 3.93, 3.60, 3.73 | 116 to 184 |
| CA_ctl_1 | 4.87, 4.10, 4.02, 3.99, 3.64, 3.64 | 161 to 218 |

No: length falls the same way with and without catalysis. The machine works but adds no new selective dimension: every
genome's own product fits it, and a two-unit product binds as stably as a long one (both of its units count as in a run).
One seed. What it would take for the product to matter: a function that depends on the product's sequence or shape in
graded ways (its fold, its kinds' physics), not only on matching its maker.

**Scarcity and density** (`scarcity.sh`: the `TD_lig` world, caps 30/60/120 of each kind × letters 100/200/400 of each kind,
400,000 steps, seed 1). Capped births from step 200,000 on:

| caps \ letters | 100 | 200 | 400 |
|---|---|---|---|
| 30 | extinct | extinct | extinct |
| 60 | extinct | extinct | length 5.05, 3.1% longer than 5 (up to 9) |
| 120 | extinct | length 4.99, 1.0% longer than 5 (up to 10) | length 5.21, **10.4%** longer than 5 (up to 14) |

Under this radiation a capped world needs density to live at all (six of nine cells died out). Where it lives, letter
density sets how often genome length changes: at 400 letters of each kind a tenth of capped births are longer than the
five-unit genome, against one in a hundred at 200. Crowded templates make more copies that bridge two templates (the
duplications and insertions of section 28). No `CDC` gene arose in 400,000 steps. What it suggests: gene origin should be
tried in dense worlds, where the raw material (longer genomes) is ten times as common. One seed.

## 35. Letters with trade-offs (`tradeoff.sh`, `letters.js`), the user's idea, first screens

Letters that differ physically, none simply better, so a genome's make-up is a phenotype. First pair tried: `C` and `D`
tough (radiation resistance 0.8) but slow (`mobC`, `mobD` 0.5), `A` and `B` fragile and fast. Capped nine-unit genomes with the
energy gene (bare caps, `endLoss`, feed relay; the shield rule off), four free positions starting mixed; share of each letter
in those positions, 150,000 steps, two seeds.

Speed check first (homopolymer copies in 15,000 steps, two seeds): slow `C` 4 to 16 against `A` 37 to 38; large `C` (1.2)
31 to 35; soft `C` (stiffness 0.3) 34 to 36; wedge `C` (15°) none at all. Slowness is a real copying cost, wedges forbid
copying outright, size and softness cost little.

| run | environment | C + D in the free positions, by 50,000-step window |
|---|---|---|
| TO2_ctlnone_1, _2 | no trade-off, no radiation | 59 → 58 → 65%; 55 → 60 → 69% |
| TO_none_1, _2 | trade-off, no radiation | 52 → 61 → 60%; 43 → 60 → 69% |
| TO2_rad1_1, _2 | trade-off, radiation 1e-5 | 36 → 42 → 45%; 49 → 52 → 63% |
| TO2_rad2_1, _2 | trade-off, radiation 2e-5 | 38 → 36 → 27%; 42 → 50%, then extinct |
| TO2_ctlrad2_1, _2 | no trade-off, radiation 2e-5 | extinct in both |
| TO_rad, TO_ctlrad | radiation 5e-5 | extinct in all four |

What it says: nothing clean. `C` and `D` drift upward even with no trade-off and no radiation (a founder or mutation bias),
and under radiation the tough letters are not favoured (in three of four runs the fast letters did as well or better):
toughness does not pay for slowness at these doses. Radiation 2e-5 killed the worlds without the trade-off and one of two
with it, so toughness helps survival a little. Populations are small (50 to 90 capped births per 50,000 steps) and drift
dominates. Composition as a phenotype is weak here; it would need larger worlds, or a trade-off whose two sides are closer
in size. Not pursued further for now.
