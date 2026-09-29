# Comb: sequence-encoded arms and form versus function

2026-09-29; COMPLEXITY_MAP step 3; generic engine (`seeded_growth.js`, `seeded_worlds.js`).
Frozen before the screen. Screen tier, exploratory.

**Rule** (configuration `COMB`, no new rule): B exposes a seed on its back. A D junction
attaches by its face and offers two ports of a second family, and J arm blocks attach by F and
extend by K. Activation by attachment as in the engine. Chain copying is ordinary (A pairs A,
B pairs B, caps P/Q), with `energyGate=false`, because a B back that carries an arm cannot also
take fuel (a declared design choice; the user allows energy flexibility).

**Viability look (before the plan, not evidence):** one world (seed 12, founder PBBQ, 20x20,
40 D and 40 J loose) grew arms on the founder's B, made two copies by 12,500 steps, and the
copies grew their own arms. With 10 D in 24x24 nothing attached in 20k steps (D starvation).

**Question.** Does a sequence that seeds arms (PBBQ) get copied more or less than one that
does not (PAAQ), when both compete for the same loose parts in one world? Any difference
comes only from physics (material cost, steric effects on docking, drag).

**World:** 22x22 with two founders, PBBQ and PAAQ, placed apart. Loose: A 12, B 12, P 8,
Q 8, D 40, J 40. Body motion, 16 passes, pins capture, `pMem` .2. Seeds 1401–1406,
50,000 steps; 6 worlds.

**Outcomes** (read-only census every 1,000 steps): complete P..Q chains by sequence, and arm
blocks per chain position. Primary: final copies of PBBQ versus PAAQ per world (founders
excluded), with a paired sign count across the six worlds. Secondary: arms on B positions of
PBBQ copies (inheritance of structure), other sequences (errors or mixed chains), and free D/J.

**Reading:** inheritance holds if most PBBQ copies carry arms at both B positions by the end.
Form matters if one sequence wins in at least 5/6 worlds; otherwise it is neutral at this
screen size. No claim of adaptation beyond this: two fixed sequences, no mutation.
QA: the first seed gets plain and midpoint-restart checks.
