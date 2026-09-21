# Results

Measurements from the headless runner on the per-square physics (third draft, 2026-09-21).
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

## 11. Summary

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
- The open questions for Phase 3: keep the benefit of a motif with the strand that carries it
  (spatial structure, slower particles, or compartments), find the radiation window where long
  strands can persist, and make rings do something, such as shelter what is inside them.
