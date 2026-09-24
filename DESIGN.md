# Polygon Chemistry

Design notes for an artificial life simulation where replication and evolution come out of a tiny universal physics, not out of code inside the creatures.

**Status:** living design, fourth draft (2026-09-23). The first draft was a plan; the second recorded what was built and measured; the third moved to a physics with nothing bigger than a square; this one records the deformable-polygon engine (now the only physics), processive fraying, private metabolism, four letters and the attempts at compartments, recognition and gene accumulation. Section 2 lists the commitments that define the project. Everything else is a current best guess and should be replaced the moment a better idea or an experiment says so. The decision log (section 14) is where the reasoning behind each change survives; section 15 holds the ideas not yet tried, ranked at its top. `AGENTS.md` at the repository root is the short guide for a new working session (`CLAUDE.md` imports it).

---

## 1. The goal and the bet

Build a 2D world of small polygons ("primitives") governed by one fixed, universal rule set. A primitive can see only its own sides and the sides it is bonded to. From that, we want:

1. Chains that get copied by templating, without any rule that says "copy". **Done.**
2. Copy errors, without any rule that says "mutate". **Done.** Substitutions, insertions, deletions, fissions and fusions all come from soft binding, end fraying and bond breaking; and with `pSpont`, strands start without a seed.
3. Selection, from a conserved energy budget and turnover. **Done, with the expected result first:** in a well-mixed world the shortest strand wins, 25:1 to 60:1. **Reversed in a head-to-head race** by one more local rule: make a lone docked monomer unstable (R6), so copying needs two monomers to land side by side, and 6-mers beat dimers nine to one. **Reversed in the open evolutionary regime** once turnover recycles whole strands instead of eroding them (processive fraying, section 7): with both rules the population holds a mean length of 4 to 5.4 against 2.3 with either alone, three seeds each.
4. Eventually, structures we did not design: membranes, catalysts, whatever shows up. **Open.** Sequence content now has two ways to matter, durability under radiation and energy from an `ABA` motif. The first is selected for. The second is a public good that free-riders exploit when the motif charges particles into the medium, and is selected (held at about 1.7 times its control frequency) when it arms its own strand through bonds (`feed`, section 8).

The bet is that the mechanism biology uses, a molecule docking onto a template and thereby changing the state of its other sides, is enough to get template copying out of a handful of local rules, and that once copying with errors exists, the rest is an experiment rather than a design task. The first half of the bet has paid off: the whole chemistry is one internal state per square, one compatibility table, and seven transitions (section 4). The second half has produced its first non-obvious result: the thing that decides whether selection here favours short or long is not energy or space but whether a single docked unit is stable, and the thing that decides whether that helps in an open population is how fast copies nucleate against how fast strands fray.

Prior art worth reading before building: Lionel Penrose's mechanical self-replicating blocks (1957), Tim Hutton's Squirm3 artificial chemistry (2002 onward; he later got membranes and a genotype/phenotype split), JohnnyVon (Smith, Turney, Ewaschuk, 2003) for the "state flips propagate along a strand" release mechanism, and Boerlijst and Hogeweg on why spatial structure protects replicators from parasites. ALIEN (Heinemann) is the reference for simulating millions of bonded particles on a GPU, but its cells run programs, which is what we are trying to avoid. Spiegelman's monster (1965) is the result to expect from any well-mixed replicator soup, and we got it.

---

## 2. Core commitments (do not change without a very good reason)

- **One universal physics.** Every primitive obeys the same rule table. No primitive carries its own program, genome, or neural net. An "organism" is any configuration of primitives that happens to make more of itself.
- **Strict locality.** A primitive reads only: its own type, its own state, which of its sides are bonded, and the state of the side it is bonded to on each partner. No global signals, no counters, no knowledge of chain length, no "am I finished" flag that isn't computed locally.
- **Digital bonds.** A bond is on or off. Bonds never break from thermal jostling. They form when compatible sides meet and break only when a rule sets a side to a non-holding state. This is the single most important lesson from the failed earlier attempt, which used analog attraction and could not find a strength that both formed chains and released them.
- **Replication is a pathway, not a primitive.** The rule table must not contain anything that refers to "chain", "copy", "template", or "organism". Those words may appear in the documentation of why a rule exists, never in what a rule computes.
- **Mutation is a side effect.** Binding compatibility is soft: a near-match binds with low probability. Variation comes from that, from strands fraying, and from nothing else added on purpose.
- **Energy is conserved and recycled.** Energy particles are never created or destroyed. They flip between ON and OFF, and OFF ones get reloaded somewhere. Energy is required for exactly one scarce step of the replication pathway.
- **Minimal environment.** Random jostling (the only "temperature"), soft repulsion between bodies, and an energy reload rule. Nothing else. No gradients, no chemistry zones, unless an experiment shows they are needed. (A sun patch was tried as such an experiment and removed, section 8.)
- **Biology is guidance, not a spec.** Where biology has solved a problem this world runs into (copy straight and fold free; let the shield self-assemble instead of being encoded; keep a public good inside a compartment), take the shape of the solution and find the smallest local rule that has it. Never import the mechanism itself, and never add a rule because biology has one; add it because a measurement here says the problem exists.
- **Space is exclusive.** Two squares cannot occupy the same place, and a bond cannot form into a spot that is occupied. Added in the second draft after the build showed what happens without it (section 10).
- **Nothing bigger than a square exists in the dynamics.** Not in the rules and not in the physics. A bond is a constraint between the two squares it joins and nothing else; jostling, repulsion and bond constraints act on one square at a time. Chains, strands, templates and copies are words for what an observer sees. The code that counts them (`componentOf`, `stats`, the birth log) is observation and never feeds back. Added in the third draft: the second draft's physics moved bonded squares as one rigid body, which was faster and exact but broke this principle.

---

## 3. The primitive

A primitive is a small rigid square in a continuous 2D world (a torus).

Fields:

- `type`: fixed for life. `A` and `B` are monomers, `E` is the energy particle, `M` is a membrane block.
- `state`: one small integer. For `A`/`B`: `DOCK`, `REPEL` or `TPL` (and `FRAY` for one step while leaving a strand, with processive fraying on). For `E`: `OFF` or `ON`. That is the entire mutable state of a unit.
- `bond[4]`: for each side, either nothing or a pointer to one side of one other unit.

Sides, counter-clockwise from the face: `F` (face), `R` (right), `K` (back), `L` (left). Strand bonds run `L`-to-`R` only, which gives every strand a direction.

**Derived side states.** The first draft gave each side its own stored state. The build showed that every side state can be *derived* from the unit's one internal state plus which of its sides are bonded, so the interface a neighbour reads is:

| side | derived state | when |
|---|---|---|
| F | `DOCK` | state is `DOCK` (free, or docked on a template) |
| F | `TPL_MM`, `TPL_LF`, `TPL_RF` | state is `TPL`; both laterals bonded, left free, or right free |
| F | `REPEL` | state is `REPEL` |
| L, R | `BONDED` / `ARMED` | bonded; `ARMED` if this unit is `TPL` |
| L, R | `STICKY` | unbonded, and the unit is docked where its template partner's face says the template continues on that side, or the unit was laterally captured |
| L, R | `END` | unbonded, and the unit is `REPEL` or `TPL` (an open strand end), or docked at its template's end |
| L, R | `INERT` | unbonded free monomer |
| K | `WANT` / `IDLE` | state is `REPEL` / anything else |
| K | `CHARGE` | (motif rule on) state is `TPL`, the unit is a `B`, and both lateral partners are `A` |
| E (all sides) | `ON` / `OFF` | |

This keeps section 2's locality intact (a derived state depends only on the unit's own bonds and state) and shrinks the state space to three values per unit.

Physics (all of it per square):

- Every square gets its own Brownian kick in position and angle each step.
- Two squares that are not bonded to each other may not overlap (as discs of half a side). This is a constraint, not a force: the solver separates any overlapping pair on every pass, the same way it enforces bonds. A soft repulsion was tried first and lost against the bond passes, so chains slid through each other (section 10).
- A bond is a constraint: the two bonded sides must lie flush (same midpoint, antiparallel normals). Each step the solver visits every bond and every touching pair a fixed number of times and nudges the two squares involved toward satisfying the constraint, splitting the correction by inverse mass. That is the only way a bond or a contact acts on anything. Straightness of a strand is not imposed; it is what a row of flush constraints produces. With 24 passes a docked square sits within a degree or two of its template partner and a chain of ten is straight to the eye.
- When a bond forms, the less-connected of the two squares is snapped flush onto the other. That is the one discontinuous move in the physics.
- No ranged attraction of any kind.
- A hinge is a lateral bond that pins only the shared *back* corner of the two squares and lets the angle run from flush to `hingeMax` (90°) toward the backs; the contact constraint stops the squares folding through each other. Which lateral bonds are hinges is set by `hinge` (`none`, `all`, `BB`, `AB`), and a hinge is rigid whenever either of its squares has a face bond. So a free strand curls under jostling, a strand being copied straightens as monomers dock along it, and the copy is straight when it is made and free to curl once released: the replication shape is held by the copying itself, and folding happens after the split, as with proteins. Edge-midpoint hinges were tried first and cannot bend at all: two squares pivoting on a shared edge midpoint overlap, and the contact constraint forbids it.
- A bond forms when the geometry it will enforce is already satisfied within tolerance. For a rigid lateral bond that means flush; for a hinge it means the two back corners touch and the bend is within the hinge's range. This distinction is what lets a ring close: the closing bond of a four-square ring is itself a right angle, so it could never form under the flush rule, and an eight-square ring would need four free hinges at 90° at the same moment, which was never observed.
- `slack` gives a rigid lateral bond a trapezoid tolerance: each pair of shared corners may gap by up to that distance with no restoring force inside the gap, so a gently curved chain is a rest state and its copy, one block further out on the curve, can still link. Measured: at 0.1 copies stay exact and births rise by a quarter, at 0.2 squares on different templates link again (section 10). The tolerance is therefore a property of the block, not a knob to loosen freely.

Bond formation:

- Two sides may bond if the compatibility table allows their (type, side, derived state) pair, the vector between the two units lies along both sides' outward normals within a tolerance, the sides are nearly antiparallel, and **the moving square would land in an empty spot**.
- Docking (face to face, or energy to back) uses a loose tolerance, 30° and 35% of a side, so that a jostling monomer finds a template in reasonable time. Side-to-side links (L to R, and K to K when stacking is on) use a tight one, 10° and 15%, because the only legitimate case is two squares already held flush by the same template, and a loose tolerance lets squares docked on *different* templates link (section 10).
- Compatibility is probabilistic. Exact matches bind with probability 1. Near matches bind with a small probability **per step of contact**. A monomer's contact with a face lasts a handful of steps and two strands in contact can stay so for tens of steps, so the per-encounter probability is several times the nominal value (section 6). The near matches are the mutation sources.

Rules:

Every rule reads the unit's own state, which sides are bonded, and the derived state of bonded partner sides, and sets the unit's own state. A rule may also break the unit's own bonds (fraying does). That is the whole computational model.

---

## 4. The replication pathway

This is what the build settled on. It has no caps, no completion handshake, and no wave. It is smaller than the first draft's pathway and does the same job.

**Compatibility table** (symmetric):

| side | partner side | probability | role |
|---|---|---|---|
| F `DOCK` | F `TPL_*`, same type | 1 | docking |
| F `DOCK` | F `TPL_*`, other type | `pSoft` | substitution |
| L `STICKY` | R `STICKY` | 1 | two neighbours docked on the same template link |
| L/R `STICKY` or `END` | R/L `END` or `STICKY` | `pLigate` | two strands join end to end |
| L/R `INERT` | R/L `STICKY` or `END` | `pCapture` | a free monomer joins a strand without a template |
| K `WANT` | E `ON` | 1 | energy docks and is spent |
| K `CHARGE` | E `OFF` | 1 | a spent particle is recharged at an `ABA` motif's back (motif rule) |
| L `INERT` | R `INERT` | `pSpont` | two free monomers join: the only way a strand can begin without a seed |
| M `MEM` (L) | M `MEM` (R) | `pMem` | two membrane blocks link where their back corners touch; the bond then holds a built-in bend (`memAngle` ± `memFlex`), so arcs and rings self-assemble. `M` bonds to nothing else and has no state; radiation breaks it at `resM` |

Everything else is 0. Note what is absent: `DOCK`-`DOCK` (two free monomers never dock on each other), `TPL`-`TPL` (two strands never dock on each other), anything involving `REPEL`. With `pSpont` at 0 nothing ever starts without a seed; with it above 0, two free monomers that happen to meet flush side to side become a strand of two, and R2, R4 and the rest do the rest.

**Transitions:**

| rule | from | to | condition |
|---|---|---|---|
| R1 | `DOCK` | `REPEL` | my F is bonded, and I have every lateral bond my template partner's face says I need: both if it reads `TPL_MM`, only L if `TPL_LF`, only R if `TPL_RF` |
| R2 | `DOCK` | `REPEL` | my F is not bonded and a lateral side is (I was captured) |
| R3 | `REPEL` or `TPL` | `DOCK` | no lateral bonds |
| R4 | `REPEL` | `TPL` | an `ON` energy particle is bonded to my K, or (feed rule) a lateral partner side reads `FEED` |
| R5 | `REPEL` or `TPL` | `DOCK`, breaking my lateral bonds (with `pUnzip` > 0: `FRAY` first, then `DOCK` the next step) | I have no face bond, exactly one lateral bond, and a coin at `pFray` comes up |
| R5b | `REPEL` or `TPL` | `FRAY` | processive fraying: I have no face bond, a lateral partner side reads `FRAY`, and a coin at `pUnzip` comes up |
| R6 | `DOCK` (docked) | `DOCK`, breaking my face bond | I have no lateral bonds and a coin at `pUndock` comes up. Physics then pushes me off the face I left |
| R7 | any | same, breaking one lateral bond | radiation: each lateral bond breaks with probability `pBreak` × (1 − res of me) × (1 − res of my neighbour), where `resA` and `resB` are the two block types' resistances |

**Bond holding:** a bond breaks when either of its sides derives to `REPEL`, `INERT`, `IDLE` or `OFF`.

**Walkthrough.**

1. *Free monomer.* State `DOCK`, no bonds. Its laterals derive to `INERT`. It can bond only face-first onto a `TPL` face.
2. *Docking.* It meets a `TPL` face of its own type, geometry checks, the slot is free, the bond forms. Its laterals now derive to `STICKY`. Because the docked monomer is rotated 180°, its L faces the template's R direction: copies are antiparallel. With `pUndock` > 0 a docked monomer that has no lateral neighbour yet falls off again at that rate; only a run of two or more linked units is stable. Copying is then nucleation-limited, as base pairing is.
3. *Lateral linking.* Two docked neighbours, both `STICKY`, link (probability 1). `STICKY` only ever arises from docking or capture, so free monomers never form chains. A docked unit at its template's end reads `END` on the outward side, not `STICKY`, so copies growing on two different templates that happen to sit end to end do not link into a chimera (they may ligate at `pLigate`, like any two ends).
4. *Local completion (R1).* A docked unit reads its partner's face. On a middle template unit it waits for both lateral bonds; on an end unit it waits for the one that points into the strand. When satisfied it goes `REPEL`, which breaks its face bond. There is no round trip and no cap: each unit decides for itself, and the copy leaves the template exactly when every unit has decided, because until then the undecided ones hold it. A copy with a gap waits for the gap to fill.
5. *Separation.* `REPEL` faces do not bond to anything. Body repulsion and jostling push the two strands apart. They cannot re-dock: `REPEL` is inert and `TPL` does not bond `TPL`.
6. *Re-arming (R4, the energy step).* A `REPEL` unit's K reads `WANT`. An `ON` energy particle docks, the unit goes `TPL`, the particle goes `OFF`, and both sides stop holding, so the particle leaves. The unit's face now reads `TPL_MM`/`TPL_LF`/`TPL_RF` from its own lateral bonds, so a fresh copy knows its own ends without being told.

Now both strands are templates and the cycle repeats. Verified in the sandbox (`node test.js`): free monomers never form dimers or chains; a seeded 6-mer gets complete copies, each the reverse of its parent, and nothing else; energy spent equals units re-armed (unit mode) or roughly copies made (strand mode); mass and energy are conserved; runs are deterministic per seed.

---

## 5. Minimal palette and the open choices in it

Types: `A`, `B`, `E`. Three internal states for monomers, two for energy. No cap type, no breaker type.

**Caps versus end-ness as state.** Resolved in favour of end-ness as state, carried on the template's face (`TPL_LF`/`TPL_RF`). It cost nothing: the end-ness is derived from the unit's own lateral bonds. Caps would have needed two cap types (a left cap's complement is a right cap, because copies are antiparallel) and a way to grow. Strands can now change length.

**Where energy gates.** Re-arming, as in the first draft. Two modes exist (section 8). The alternative of gating docking (activated monomers, as with NTPs) is untried; see section 15.

**Alphabet size.** Two letters, self-complementary (`A` pairs `A`, `B` pairs `B`). A copy is the reverse of its template, so a strand returns to itself after two generations, as with DNA. Self-complementary pairing was chosen over `A`-`B` pairing because it makes the birth log readable at a glance; nothing else depends on it.

---

## 6. Sources of variation

All measured in the birth log (`run.js --births`).

- **Substitution** from `pSoft`: an `A` docks where a `B` should.
- **Substitution and insertion** from `pCapture`: a free monomer sticks to a docked unit's open lateral side (filling a gap with a random letter, never checked against the template), or to a strand's open end (lengthening it by one, template or copy alike).
- **Truncation** from `pCapture` interacting with gaps: a captured unit in a gap has an `END` side facing the fragment on the other side of the gap, which is `STICKY`; they join only at `pLigate`. If they do not, the near fragment is complete and leaves as a shorter strand, and the far fragment waits on the template until fresh monomers fill the vacated sites and link to it. Nothing is stuck for good.
- **Deletion** from `pFray`: end units fall off undocked strands.
- **Fission and recombination** from `pBreak` (R7): a lateral bond breaks, anywhere in a strand, not only at the ends. With ligation on, the fragments rejoin in new combinations. A docked copy is immune in practice: its neighbours are still flush and sticky, so a broken link re-forms the next step, which means a template shields its copy and an undocked strand is the exposed one.
- **Origins** from `pSpont`: two free monomers link side to side and become a strand of two with no template. The tight flush check for side-to-side links makes this rare per contact (about one event per 40,000 steps at 1e-4 with 320 monomers), which is what a seedless world needs: rare enough not to be junk, frequent enough to happen.
- **Fusion** from `pLigate`: two strands meet end to end and join. On the rigid-body physics this was a runaway: fused strands became rigid rafts that could not separate and births fell by three quarters. On the per-square physics it is a working channel: at 0.02 with fraying on, fusion and fission balance at a mean length of 4.6 with strands up to 18 units, 46 sequences in play and 4.9 bits of sequence entropy, the longest and most diverse population measured so far, while births continue at two thirds the rate of the ligation-free runs (`experiments/RESULTS.md`, section 3). This is chemistry setting a length distribution, not selection for length, but it is the first regime in which long strands persist in an open population.

Measured rates matter more than the parameters. In the reference runs, `pSoft` 0.02 gave about 6% of dockings wrong-typed; `pCapture` 0.05 gave about one capture per three dockings, most of them gap fills; `pFray` 0.0003 gave about one fray per birth in unit mode. See `experiments/RESULTS.md`.

---

## 7. Turnover

Resolved with fraying (R5): a unit that is not docked and has exactly one lateral bond falls off with probability `pFray` per step, returns to `DOCK`, and its neighbour's face re-derives to an end state. This is per-unit and memoryless, so it needs no timer and no breaker type. Mass is conserved (`test.js` checks it).

**Turnover is a mutation, and end fraying is the wrong one.** In a closed world a monomer returns to the pool only by fraying off an end, so a copy of L units is paid for by about L end deletions somewhere in the population (1,092 frays for 602 births in one cooperative-docking run). Recycling is then a deletion ratchet that outpaces any selection for length. Radiation is no better: it cuts anywhere. The fix is to recycle by death rather than by erosion. **Processive fraying** (`pUnzip`): a fraying unit reads `FRAY` on its lateral sides for one step before it lets go, and an undocked neighbour that reads `FRAY` follows it with probability `pUnzip`. At 1 a strand that starts to fray unzips one unit per step until it meets a unit with a copy docked on it, so being copied protects. Exonucleases in biology are processive for the same reason. One internal state, one derived side state, one row; the neighbour learns that its partner is leaving by reading the partner's side, which is the only channel this world has. *Measured:* with cooperative docking at 0.1 it raises the population's mean length from 3.2 to 4.0 to 4.7 (three seeds), and at 0.2 to 4.4 to 5.4; alone it changes nothing (`experiments/RESULTS.md`, section 13).

Without turnover the free monomer pool drains into strands and selection stops within a few hundred thousand steps: every template ends up holding a partial copy that can never be completed. With turnover the pool stays at a steady fraction and the population keeps producing births indefinitely.

Fraying also does something the first draft hoped for and the build confirmed only in part: a two-unit strand is two ends, so it dies at rate `2 pFray`, while a long strand only shortens. This penalises dimers but does not, on its own, hold length up (section 10, "shortest replicator wins"). Fraying is also a mutation source in its own right: a template end can fray after its copy unit has released but before the copy leaves, and a released copy end can fray while the rest of the copy is still docked, so children come out one unit longer or shorter than their parent even with every soft probability at zero.

---

## 8. Energy

- Energy particles are squares of a third type, half the side of a block, with one state (`ON` or `OFF`) that all four of their sides show. They never chain and never dock on a face: the only side that accepts them is a block's back. A charged particle meeting the back of a released block (`WANT`) bonds, the block re-arms to `TPL`, the particle flips to `OFF`, and the bond lets go the same step. Nothing is absorbed: the spent particle drifts off as a grey square.
- Fixed population, never created, never destroyed. `OFF` particles recharge to `ON` at a background rate everywhere (`pReload`), or, with the motif rule, at the back of a `B` block flanked by two `A` blocks (`CHARGE`): a spent particle meeting such a back bonds, flips to `ON`, and lets go. (A sun patch, reload only inside a disc, and a strand-wide re-arm mode were tried and removed: neither changed any outcome, and the motif is the sequence-based way to make energy local.)
- The motif rule makes energy income a property of sequence. With `pReload` at 0, a world whose strands carry no `ABA` runs out of energy and stops (measured: a seed of `AABBAA` spends its 150 particles and makes 25 copies, a seed of `ABBABA` keeps charging). A strand with the motif feeds the re-arming of every strand near it, so the first question is whether the motif is selected for or merely tolerated; the answer depends on how far a charged particle travels before it is spent.
- Every released unit needs its own particle, so the cost of a copy is its length. A strand-wide re-arm (one particle for a whole strand, caught on any of its N backs) was tried as a way to favour length and measured to change nothing: a dimer out-reproduces a 6-mer 25:1 to 60:1 in either mode (`experiments/RESULTS.md`, sections 3 and 4). It was the only rule that let anything travel along a chain, and it is gone.
- Total energy and reload rate set the carrying capacity.
- **Feed** (`feed`), the private version of the motif: an armed `B` between two `A`s reads `FEED` on both lateral sides, and a released neighbour that reads `FEED` re-arms without a particle. A strand that carries the motif pays one particle where it would pay three, and the saving goes only to it, through its own bonds. Added because the public motif was measured not to be selected, and slowing energy particles (`mobE`, a physics knob) to keep the benefit local did not change that either: at feasible world sizes a strand's offspring are well mixed within a generation (`experiments/RESULTS.md`, section 14).

---

## 9. Phenotype and higher structure

Copying alone gives selection on copy speed only, and the winner is the shortest strand. The build confirms it (section 10). For evolution to build anything, a sequence has to do something. Sources of phenotype, cheapest first:

**Durability (now).** With radiation on and the two block types given different resistances, the sequence decides how long a strand survives between copies: an `A`-`A` bond at `resB` 0.9 breaks 25 times more often than a `B`-`B` bond. If `B` is the scarcer monomer, a tough strand waits longer for its material, so durability costs copying speed and there is a real trade-off for selection to work on. This is the first phenotype in the world that is about the sequence's content rather than its length, and it needs no new geometry. *Measured:* with `B` at a quarter of the pool, scarcity alone drives it down to 4% to 7% of copied material; give it resistance 0.9 and it holds 26% to 29% at a mild radiation rate and 41% to 46% at a harsh one, five to six times the control (`experiments/RESULTS.md`, section 8). The winning form is still a dimer, `BB`; what radiation cannot yet select for is a structure, because a one-dimensional chain cannot wrap anything.

**Metabolism (now).** With the motif rule on, an `ABA` run in a strand recharges energy particles at its back (section 8). Sequence content then sets energy income. Because charged particles diffuse, the benefit is shared with neighbours, which makes it a public good and invites parasites. *Measured:* a population lives on motif energy alone, with more births than the background-reload control, but the motif is not enriched; dimers without it free-ride (`experiments/RESULTS.md`, section 9). Keeping the benefit with the sequence that pays for it is the next problem, and it is the problem compartments solve.

**Compartments (now).** The replicator does not build its own shelter, any more than a genome builds a lipid. A fourth block type `M` bonds only to other `M`, side to side, with a built-in bend, so arcs grow by capturing free blocks at their ends and close into rings of a fixed size when they reach it (60° closes six, 45° eight, 90° four). Rings enclose whatever was inside when they closed: with hard contacts nothing passes an intact ring, so an enclosed strand copies with the monomers it has and then waits, and radiation, which breaks `M` bonds at `resM`, is what opens a ring, lets material exchange, and lets it close again. That is a crude cell cycle from one type and one row. The user's alternative, letting the replicator chain itself fold into rings, was built first (hinges): it works in principle, but hinged replicator chains fold into compact clumps and close only once in tens of thousands of steps, and a ring of replicator is sterile anyway. Separating the shield from the genome keeps the core simple and is what biology did. What compartments are for, here, is to keep a public good with the strand that makes it: the `ABA` energy motif was not selected in a well-mixed world (section 8); inside a ring, the particles it charges stay with it. *Measured:* rings self-assemble reliably (41 six-block rings from 300 blocks in 100,000 steps) and leave the replicators untouched, but they close around empty space: at the densities a replicator population tolerates, no ring ever enclosed a strand, so compartment selection could not be tested (`experiments/RESULTS.md`, section 11). Biology's answer to that is a coat that recognises the genome. The next row is `M` binding the back of a template unit, so that membranes nucleate on strands instead of on nothing.

**Cooperativity (now).** With R6 on, length is a phenotype: a longer template has more places for two monomers to land side by side before either leaves, so it nucleates copies faster. Measured to flip the dimer-versus-6-mer competition at `pUndock` between 0.02 and 0.05 and to make 6-mers win nine to one at 0.1 (`experiments/RESULTS.md`, section 5), and, with processive fraying, to hold an open population at a mean length of 4 to 5.4 with 40 to 50 sequences in play (section 13).

**Why chains are one-dimensional.** Sides are fixed for life and the table only lets F meet F, L meet R, and K meet E. A square therefore has exactly one neighbour on each lateral side and a chain cannot branch; a template and its copy meet face to face and nothing meets a back. Two-dimensional forms come from the membrane type (below), not from the replicator's blocks. A back-to-back pairing of templates was tried as a one-row route to 2D and removed: it blocked the backs that energy needs, and membranes do the job without touching the replicator.

**Geometry (now).** Working through shapes turned up a problem the first draft missed: with rigid bonds, **a bent template cannot be copied**. A bend turns away from the face side, so the copy sits on the outside of the bend, where adjacent docked units are further apart than a side length and cannot link. A corner block type (a square whose L and R sides are adjacent) has the same problem at every corner, and free-angle edge bonds cannot bend at all (section 3). What works is the biological answer: copy straight, fold free. Hinges (section 3) are rigid while either square is docked and free otherwise, so a template is straightened by being copied and the copy curls after release. With `hinge` set to `BB` or `AB`, sequence decides where a strand bends: a genotype-to-phenotype map for shape. With ligation on, a curled strand whose ends meet closes into a ring. A ring has no ends, so it cannot fray; it cannot be copied either, because its faces lie on a curve, so it is a sterile, durable form: a spore rather than a cell. *Measured:* four-square rings close within a few thousand steps once hinges may form where corners touch, and they appear in open populations with mutation and turnover (`experiments/RESULTS.md`, section 10). Larger rings need a run of hinges at right angles with flush bonds between them, which jostling rarely arranges.

**Self-bonding.** Compatible faces on distant units of the same strand can bond, folding the strand (RNA secondary structure). Free once hinges exist. Avoid ranged attraction; it is the particle-life knob, hard to tune, and it blurs what "chemistry" means here.

**Gates.** A closed ring of flush-bonded polygons is sealed. Permeability has to come from a bond that can open. The natural candidate is the bond that closes a ring: an energy particle docking on that unit's K flips the closure bond open, the ring opens into a horseshoe, and it re-closes when the ends meet again. Heritable, evolvable, and it uses nothing beyond section 4's machinery.

**Pass-through option (experiment, not default).** Any two bodies may overlap but a third is blocked from a spot where two already overlap. Gives permeability by thickness. Kept behind a flag idea only; the hard-body baseline exists now, so there is something to compare against.

---

## 10. Failure modes, observed and expected

- **Junk chains.** Any lateral bonding not preceded by docking. *Observed: none* in 20,000 steps with no seed and `pCapture` 0 (`test.js`). With `pCapture` > 0, captured chains grow only from existing strand ends, never from nothing.
- **Everything ends up in strands.** *Observed*, exactly as predicted, whenever `pFray` is 0: free monomers hit zero and every template holds a partial copy forever. Fix: turnover (section 7).
- **Immediate re-docking.** *Not observed.* `REPEL` faces are inert and `TPL` does not dock on `TPL`, so the energy gate is not needed for this; it is needed only as the scarce resource.
- **Stalled copies.** *Observed as a transient*: a captured unit in a gap leaves the far fragment waiting on the template. It resolves when new monomers fill the freed sites. Diagnostic: `docked` count in the CSV that stays high while `free` is nonzero.
- **Docking through an occupied slot.** *Observed and fixed.* With loose geometric tolerance and soft repulsion, a monomer near a template site whose old copy unit was still sitting there unbonded could pass the geometry check and be snapped into the occupied spot, on top of the old unit. Fix: a bond forms only if the slot is empty (section 3). This is the reason for the "space is exclusive" commitment in section 2.
- **Squares docked on different templates link.** *Observed twice and fixed twice.* The rules never say "the two sticky squares must be on the same template"; geometry is supposed to make it so. First case: two templates lying end to end, whose end-docked squares faced each other. Fix: a square docked at its template's end reads `END` on the outward side, not `STICKY`. Second case, after the move to per-square physics: two templates lying close and roughly parallel, each with one square docked at its end, the two docked squares tilted a few degrees each and passed the 30° link check. The pair then satisfied both release conditions and left as a two-unit "copy" of nothing (21 such dimers in 30,000 steps with every mutation knob at zero). Fix: side-to-side links require flush alignment within 10°, and the solver runs enough passes that a docked square sits within a degree or two of its partner. Third case, same session: with links tight, odd chains still appeared, and the positions showed why: two templates had slid *through* each other until one template's end unit sat a quarter of a side from the other's third unit, so a square docked on the one sat exactly in a copy slot of the other. The soft repulsion (one weak push per step) could not hold against 24 bond passes. Fix: overlap between unbonded squares is a hard constraint solved in the same passes as the bonds. The general lesson: any place where the rules rely on geometry to rule out a pairing needs the geometry to be tight enough to actually rule it out, and a test with all knobs at zero that counts odd-length births is the way to know.
- **Shortest replicator wins.** *Observed, robustly.* With fraying on, mean strand length collapses from 6 to between 2.5 and 2.9 within 50,000 steps in every configuration tried (unit or strand energy, abundant or scarce, uniform or sun patch), while the birth rate goes up by a factor of ten to seventy. In direct competition with mutation off, a dimer out-reproduces a 6-mer 50:1 with abundant energy, 10:1 with scarce energy, and with fraying on the 6-mers produce no births at all. Everything in the copy cycle favours short strands: a copy of N units waits for the slowest of N dockings, then (in unit mode) the slowest of N energy arrivals, then a longer body diffuses away more slowly, and fraying shortens a long template faster than it finishes a copy. Neither strand-mode energy nor the sun patch changed this. The missing ingredient is cooperativity: here a single docked monomer is as stable as a whole duplex, so a dimer copies on two lucky dockings. R6 (`pUndock`) makes a lone docked unit unstable, so copying needs two monomers to land side by side before either leaves, and a long template has more places for that to happen. *Measured:* the dimer's advantage falls from 38:1 at `pUndock` 0 to 6:1 at 0.02, 1:1 at 0.05, and reverses at 0.1 and 0.2, where 6-mers make nine births for every dimer birth and take 95% of the copied material. *Not yet enough in the open regime:* with fraying on, 0.02 changes nothing and 0.1 starves nucleation at 800 monomers in 80×80 (one seed died, the other held two dozen strands of mean length 3.4). At twice the density and without fraying, the same rule grows fifty strands of mean length 6 or more. The next map is fraying against density against undocking (`experiments/RESULTS.md`, section 5).
- **Rules leaking global knowledge.** None. Every rule in section 4 reads one unit and its bonded partner sides.
- **Analog creep.** None in the chemistry. The physics has tolerances (docking angle and distance, repulsion stiffness, jostle size) but no pair of them has to be balanced against each other for chains to both form and release; release is a logic event.

---

## 11. Build plan

**Phase 0, physics sandbox.** *Done.* Rigid compound bodies, jostling, soft repulsion, face-normal check, slot check, snapping. No springs.

**Phase 1, one copy.** *Done.* One uncapped strand of length 6 in a bath gets a complete antiparallel copy, released and re-armed, no junk; then exponential growth until the monomer pool runs out. Energy consumption per copy equals strand length (unit mode).

**Phase 2, variation and selection.** *Done.* With `pSoft`, `pCapture` and `pFray` on, sequence diversity grows to about ten distinct sequences and 2.5 to 3.3 bits of entropy within 100,000 steps, the population turns over indefinitely (generation 20 to 40), and length collapses to between 2.5 and 3 units. Energy scarcity and where energy comes from do not change that. Ligation, on the per-square physics, sets a length distribution by fusion against fraying (mean 4.7, up to 25) and is the most diverse regime measured. Cooperative docking (R6) attacks the cause and wins a head-to-head race but starves in the open regime; see `experiments/RESULTS.md`.

**Phase 3, structure.** *In progress.* Done since: length selected (processive fraying with cooperative docking), private metabolism selected, adaptation to environment change, shape as a phenotype, a shield gene under radiation (`experiments/RESULTS.md`, sections 13 to 19). Not yet: compartments that keep their contents and divide, specific recognition between strands, genomes carrying more than one gene. The obstacle common to the last three is that every pressure costs long genomes more than short ones; compartments (several short strands selected together) are the next step. Earlier text of this phase: The window in which R6 holds length up in an open population is mapped (`experiments/RESULTS.md`, section 13): it needs processive fraying, and within it length rises with `pUndock` and falls with the fraying rate, while monomer density changes nothing because births are set by recycling. Next is making sequence pay: the `ABA` motif is not selected as a public good, and its private form (`feed`) is being measured over many generations (section 14). Hinges and membranes are in (section 9); the next structural step is membranes that nucleate on strands (section 15, item 7), so that compartments hold a genome.

**Phase 4, origins.** *Started.* With `pSpont` on and no seed strand, replication starts by itself: two monomers meet flush, become a two-unit strand, get re-armed, and are copied. The seedless bath is now a runnable experiment (`experiments/channels.sh`, the `O_` runs). *Measured:* life starts in every run, first birth between 1,000 and 15,000 steps, and the population that emerges is the one the physics favours, dimers at the pool's composition (`experiments/RESULTS.md`, section 7).

**Phase 5, rule-space search.** The whole chemistry is now one compatibility table of ten rows and seven transitions. Randomising it within section 2's constraints and searching for tables that produce replicators from a seedless bath is a smaller search than the first draft assumed. Still: do not start here.

Metrics logged from Phase 1 onward (`run.js`): free monomer count, strand count and length histogram, births, generation depth, sequence count and entropy, energy state, event counts for dockings, wrong-type dockings, captures, ligations, frays.

---

## 12. Implementation notes

- 2D torus with a spatial hash. Per-square state only: position, angle, type, one internal state, four bond slots. Bonds are enforced by position-based dynamics: 24 Gauss-Seidel passes over the bond list per step, each pass correcting angle then side-midpoint distance for one bond, weighted by inverse mass. About 2,000 steps per second for 440 squares in Node; the solver is not the bottleneck.
- The compatibility table is one function (`compat`) over (type, side, derived state) pairs and the transitions are one function (`_transition`) of five clauses. Both are small enough to print on a page and to randomise.
- Deterministic RNG (mulberry32) with a logged seed. `test.js` checks two runs with the same seed give the same positions.
- Side states are drawn as colours on the square's edges; the state machine can be read off the screen, and clicking a square prints its state and its partners' states.
- Every birth is logged with time, sequence, generation, parent sequence and position. Most of the analysis happens on that log.
- Speed: about 740 steps per second for 1,100 units and 1,200 for 540 units in Node on one core, after the neighbour loops were rewritten without closures (2.4 times faster, trajectories bit-identical); earlier figures: about 180 in the browser while drawing at full detail. A copy cycle is a few thousand steps. Phase 3 will want a faster inner loop before it wants a GPU.
- The viewer draws every side of every square in the colour of its derived state, a tie across every bond, a notch on every face so orientation reads on free monomers too, and a ring that fades over 80 steps at the site of every dock, link, release, re-arm, birth, fray and undock. The event feed lists the same events and jumps the camera to the square.

---

## 13. Open questions

Answered by the build:

- *Is the K side needed?* Yes, but only as a place for energy to dock that faces away from the template; nothing else uses it.
- *Does the FWD/REL round trip need caps at both ends?* Moot: the round trip is gone. Local completion needs neither caps nor a wave. The only rule in the table that lets anything travel along a chain is the optional `strand` energy mode (R4's second clause), which is off by default.
- *What is the smallest rule table that passes Phase 1?* Five transitions and the first three rows of the compatibility table. R2, R5 and the soft rows are only for variation and turnover.
- *Should a template accept docking while its neighbour is still busy?* Yes, and it does; no tangles observed.
- *Does anything secretly depend on strands being straight?* Yes, copying does (section 9). This is the phenotype/replication tension, arriving on schedule.

Still open:

- Is one universal `pCapture` right, or should captures at a template end and at a copy gap differ? (They are the same event locally; making them differ would need a new derived state.)
- Should soft probabilities be per encounter rather than per step? Per step is the only memoryless option, and it makes the effective rate depend on how long bodies stay in contact, which depends on their size.
- Under cooperative docking, where is the optimum length, and how does it move with `pUndock` and with fraying? The estimate in section 10's terms is a copy time of about `κ/((N-1)λ²) + H_N/λ` for undock rate κ and single-site docking rate λ, which peaks near N = 12 when κ is ten times λ.
- With ligation setting the length distribution, does selection act on top of it? A ligation regime with cooperative docking on is the obvious next run; whether it favours particular sequences is the question that matters.
- Does radiation with unequal resistances select `B`-rich sequences when `B` is scarce, or does copying speed win? Does the `ABA` motif spread under the metabolism rule, or do parasites free-ride? Both are measured in `experiments/RESULTS.md` sections 7 to 9.
- Rings. A ring of tough blocks around a fragile template would be the first protective structure. It needs chains that can close, which needs hinges or a second shape. Radiation is the pressure that would make such a structure pay.
- What does the population do over millions of steps rather than hundreds of thousands?

---

## 14. Decision log

Keep entries short: date, what changed, why, what evidence.

- 2026-09-15. Switched from thermal bond breaking to digital, rule-driven bonds. Reason: earlier build could not find an attraction strength that both formed chains and released them. Digital bonds make release a logic problem.
- 2026-09-15. Dropped the "size sieve" idea for membrane permeability. Reason: flush-bonded rings have no gaps. Replaced with an energy-openable cap-cap latch.
- 2026-09-15. Ranged attraction rejected as a folding mechanism in favour of self-bonding between compatible faces. Reason: keeps everything local and digital.
- 2026-09-15. Pass-through physics with triple-overlap blocking kept as an experiment behind a flag, not the default.
- 2026-09-15. Replaced the FWD/REL completion round trip and the cap type with local completion read off the template partner's face (`TPL_MM`/`TPL_LF`/`TPL_RF`). Reason: same guarantee (a copy with a gap cannot leave) with no wave, no caps, and strands that can change length. Evidence: `test.js`, exact copies only.
- 2026-09-15. Collapsed per-side stored states into one internal state per unit plus derived side states. Reason: every side state in the first draft was a function of the unit's bonds and one trit. Evidence: the derived table in section 3 reproduces the whole pathway.
- 2026-09-15. Chose rigid compound bodies over bond springs. Reason: exact flush geometry, no jitter, no false negatives on the face-normal check, no stiffness tuning. Cost: bending needs an articulated solver later.
- 2026-09-15. Added the slot-must-be-empty check on bond formation and the "space is exclusive" commitment. Reason: a monomer docked through a released copy unit and was snapped on top of it. Evidence: birth log showed a parent read as a single letter; the dump showed a template with a fresh monomer where the leaving copy still sat.
- 2026-09-15. Added end capture (`pCapture`) as the main variation source alongside wrong-type docking. Reason: one physically obvious soft event (a monomer sticks to its neighbour instead of the template) gives insertions, gap substitutions and truncations at once.
- 2026-09-15. Added end fraying as turnover instead of a breaker type or a timer. Reason: per-unit, memoryless, no new type, and it penalises dimers.
- 2026-09-15. Added `strand` energy mode (re-arming spreads along lateral bonds). Reason: it is the only local mechanism found so far that gives length a physical advantage; kept `unit` mode for comparison. Evidence pending in `experiments/RESULTS.md`.
- 2026-09-15. Self-complementary alphabet (`A`-`A`, `B`-`B`). Reason: birth log readability. Copies are reverses of parents.
- 2026-09-15. A docked unit's outward lateral side at its template's end now reads `END`, not `STICKY`. Reason: an independent review of the code found that copies docked on two different templates lying end to end linked into chimeras with every mutation knob at zero (odd-length births in the mutation-off competition runs). Evidence: after the change, zero odd-length births in 20,000 steps with knobs off, two seeds.
- 2026-09-15. Space exclusion now checks every unit of a moving body, not only the bonding unit; the spatial hash is rebuilt after a merge; rule-requested bond breaks are applied after all units have been updated, so transitions are truly synchronous. Reason: same review. No behaviour change at default settings, but ligation and fraying no longer depend on unit index order.
- 2026-09-15. Birth logging finds the strand as the component's longest chain and takes the parent from the template unit each copy unit was docked on. Reason: the review found births deferred or attributed to a frayed singleton when the copy separated while a monomer was already docked on it.
- 2026-09-15. `pLigate` default set to 0 and marked a runaway. Evidence: section 6.
- 2026-09-15. Added R6 undocking (`pUndock`), with a physical push off the face. Reason: the dimer-versus-6-mer competition showed every configuration favouring the dimer by 6:1 to 50:1; a lone docked monomer here is as stable as a full duplex, which is what lets a dimer copy on two lucky dockings. Making a lone docked unit unstable makes copying nucleation-limited, and a longer template has more places to nucleate. Evidence: section 10.
- 2026-09-15. Strand-mode energy did not rescue length. Evidence: section 8 and `experiments/RESULTS.md`. Kept as an option because it changes what energy limits.
- 2026-09-15. R6 confirmed as the first length-favouring rule in a head-to-head race. Evidence: `experiments/RESULTS.md`, section 5.
- 2026-09-21. Ligation's "runaway" verdict withdrawn. Reason: on the per-square physics fused strands stay flexible and copyable; at `pLigate` 0.02 with fraying the population holds a mean length of 4.6 and 46 sequences. The rafts were a rigid-body artefact. Default stays 0 so that the reference runs stay comparable; the viewer knob hint was corrected.
- 2026-09-21. R6's earlier claim for the open evolutionary regime (mean length 2.3 to 3.1 at `pUndock` 0.02) did not survive the per-square physics: re-measured, 0.02 changes nothing and 0.1 starves nucleation at the reference density. The race result stands. Viewer presets changed accordingly: "dimers vs 6-mers" with and without cooperative docking, fraying off, so the effect is visible.
- 2026-09-21. Physics rewritten per square: rigid compound bodies replaced by bond constraints solved by position-based dynamics. Reason: the project's principle is that nothing bigger than a square exists, and the rigid-body code had an object for every chain. Cost: strands are straight to within a degree or two instead of exactly; docking rate is unchanged.
- 2026-09-21. Side-to-side links get their own tight tolerance (10°, 15%) and the solver runs 24 passes. Reason: with per-square physics, squares docked on different nearby templates linked and released as two-unit chimeras (section 10). Evidence: 21 dimers in 30,000 steps with all knobs at zero before, three odd chains after.
- 2026-09-21. Overlap between unbonded squares made a hard constraint inside the solver loop, replacing the soft repulsion. Reason: the remaining odd chains came from templates sliding through each other (section 10). Evidence: zero odd chains in 30,000 steps with all knobs at zero, two seeds, and the closest unbonded pair in the world never inside a side length.
- 2026-09-21. Added `pStack` (template backs pair). Reason: it is the one-row answer to "why are forms one-dimensional"; off by default.
- 2026-09-21. Added `pSpont` (two free monomers may link). Reason: without it only seeded strands could ever replicate; with it the seedless bath is an origin experiment. The flush check keeps it rare.
- 2026-09-21. Added radiation (R7, `pBreak` with `resA`, `resB`). Reason: the user's point that a destructive force with unequal resistances gives sequence content a fitness meaning; it also ends the material lockup that pure copying runs into. Ends-only fraying stays as the gentler turnover.
- 2026-09-21. Added the `ABA` charging motif. Reason: section 15 item 3; the cheapest way to make energy income depend on sequence. Chose `ABA` because it is a palindrome and so survives the antiparallel copy.
- 2026-09-21. Added hinges: lateral bonds that pin the shared back corner only, rigid while docked, limited to 90°, chosen by `hinge` mode. Reason: the only way found to let chains close into rings while keeping copying on straight templates; corner blocks and free-angle edge bonds both fail (section 9). Evidence: in `all` mode free hinges sit at a median of 40° and never past the limit, docked chains stay within 1°, and copies are exact.
- 2026-09-21. Presets cut to three: copying, evolution, protocells. Reason: the user's rule that a few presets with the best prospects beat many. Evolution is end fraying with ligation, which keeps the long, diverse population; radiation was measured to fragment it at every rate and stays as the selective knob, not the turnover (`experiments/RESULTS.md`, section 12). Protocells is the prospect: membranes, motif energy, radiation as the gate.
- 2026-09-21. Pruned: the strand-wide re-arm mode, the sun patch, back-to-back stacking (`pStack`) and hinge detents. Reason: the user's rule that we do not need several mechanisms for the same thing. Each was measured to add nothing (sections 8 and 9) or was superseded (stacking by membranes, detents by corner-touch formation). Their rows stay in `experiments/RESULTS.md` as history. Fraying stays as a knob but the presets use radiation, which covers turnover and carries the resistance phenotype.
- 2026-09-21. Added membrane block type `M` after the user's suggestion that a shield need not be made of the replicator's blocks. Reason: hinged replicator chains clump rather than ring, and a ring of replicator cannot copy. Membrane bonds form on any corner touch and then bend to their angle: forming only at the right angle made arcs grow one block per 10,000 steps and no ring ever closed; forming at any bend gives rings within 10,000 steps.
- 2026-09-21. Hinges form where back corners touch, not where edges lie flush. Reason: with flush formation no ring ever closed in 100,000 steps under any setting (the closing bond of a small ring is a bend); with corner formation four-square rings close within thousands of steps. Detents (a pull toward flush or the limit) were tried first, did not help, and were removed.
- 2026-09-21. Added `slack`, the trapezoid tolerance, after the user's suggestion that blocks could have a natural shape and deform a little so that connections stay flush on a curve. Evidence: 0.1 raises births by a quarter with exact copies; 0.2 brings chimeras back. Default 0 so the reference tables stay comparable; the hinge preset uses 0.1.
- 2026-09-21. Face notch removed from the viewer; side colours carry orientation. Stacking preset removed; chains stay one-dimensional, the knob remains as an experiment.
- 2026-09-22. Step loop rewritten without closures or repeated property loads: 2.4 times faster, every trajectory bit-identical (checked by hashing positions, bonds and states on three configurations). Reason: runs of a dozen generations are too short to see evolution.
- 2026-09-22. Added processive fraying (`pUnzip`). Reason: with end fraying as the only recycling, every copy of L units costs about L deletions somewhere, so turnover is a deletion ratchet (1,092 frays for 602 births in a cooperative-docking run). Evidence: with `pUnzip` 1 and `pUndock` 0.1 mean length 4.0 to 4.7 against 3.2 to 3.3 with end fraying and 2.2 to 2.3 without cooperative docking, three seeds each (`experiments/RESULTS.md`, section 13). R6's open-regime claim, withdrawn on 2026-09-21, is restored with this condition.
- 2026-09-22. Added `mobE`, energy particles' mobility. Reason: test whether keeping charged energy near its maker makes the `ABA` motif selectable. Evidence: no consistent effect at 1, 0.2 and 0.05; energy was not limiting once motifs existed (section 14). Kept as a physics knob, default 1.
- 2026-09-22. Added `feed`, the private motif: an armed `B` between two `A`s re-arms its released neighbours through their bonds. Reason: the public motif is not selected in a well-mixed world, and the project's one communication channel, a bonded side, is the natural way to keep a benefit with its carrier. Evidence: over 40 to 52 generations the motif holds at 1.6 to 2.3 times chance in every window, about 1.7 times the control, which drifts between 0.6 and 1.7 (two seeds each, section 14). The first sequence-level selection in the open regime.
- 2026-09-23. Tried and removed the spend rule: a template unit whose copy unit reads `DONE` drops back to needing energy, so copying costs energy on both sides and a motif pays at the rate-limiting step. Evidence: the motif rose to about twice its control and births rose 5%, but only half of all births were faithful (72% without it), because spent template units fray and unzip mid-copy; selection cannot build on that (`experiments/RESULTS.md`, section 14).
- 2026-09-23. Added the deformable-polygon engine (`physics: 'poly'`), on the user's suggestion: a unit is four corners held to a rest shape by shape matching at a per-type stiffness; a bond pins corners to corners, so bonded edges coincide and a strand is one body. A pin moves each unit rigidly and, by its softness, deforms the pinned corner (moving single corners alone diverged). The rigid engine stays the default so every earlier result reproduces. Evidence: exact copies at stiffness 1 and 0.5, chimeras from 0.2 down, the same window slack had. Membrane blocks become wedges whose rest state is a ring, replacing the bend rule; sequence-set wedges (`bendA`, `bendB`) make curvature a phenotype with an optimum near 10 degrees and a hard limit near 30 (`experiments/RESULTS.md`, section 15).
- 2026-09-23. Added `run.js --change` (environment changes mid-run). Evidence it matters: when energy turns from plentiful to scarce, populations with the private motif raise it to 4 to 5 times chance and keep their length, and populations without it shrink to short, motif-free strands (`experiments/RESULTS.md`, section 14).
- 2026-09-23. The polygon engine becomes the viewer's default (stiffness 0.5), on the user's judgement that it is the more robust and simpler direction. Evidence: it reproduces the length selection of section 13 (mean length 2.5, 3.7 to 3.8 and 4.9 at `pUndock` 0, 0.1 and 0.2), copies exactly at stiffness 0.5, and shape becomes a phenotype that selects on sequence: a 20-degree `B` wedge is purged from genomes, a 10-degree one is kept but spaced out by `A`s (`experiments/RESULTS.md`, section 15). Up to eight corners per unit; octagons copy. The headless default stays rigid so recorded results reproduce.
- 2026-09-23. Removed the rigid-body engine; the polygon engine is the only physics (the user's call: simpler and more robust). Gone with it: hinges, slack, the membrane bend rule and the rigid solver. The engine was reworked in the same change: one neighbour scan per step feeds both contacts and bonding, both values of each Box-Muller pair are used, and 16 passes replace 24 (8, 12 and 24 passes all gave exact copies in 4 seeds × 40,000 steps). 786 steps per second at the evolution preset's size, against 579 for the polygon engine before and 741 for the rigid one. Octagons turned out to leak (rounder blocks let templates pack close enough for copies docked on two of them to link) and are kept as an option, not a default. Earlier results are marked as measured on the removed engine; it is at commit `b41557c`.
- 2026-09-23. Membrane made by the replicators, as a state change on the user's preference (not a type change): raw blocks cannot link; the back of an `A` between two `B`s reads `MAKE`. First version (activate on touch, let go): rings formed nowhere near makers (0.08 rings holding a strand against 1.42 for a fixed active stock). Second version (anchor on the strand, recruit raw neighbours): recruitment spreads, the whole stock turns active, and the world looks like the fixed-stock one (1.42). Kept off by default as the base for a tether that keeps a membrane with its maker's lineage (`experiments/RESULTS.md`, section 16).
- 2026-09-23. Lock-and-key binding (`pHyb`, `pMelt`, `pMeltRun`, `pMeltEnd`). Measured: with two letters, binding is general stickiness (two-letter matches are everywhere), diversity falls from about 30 sequences to 18, and a zipper (runs of three or more) finds no window where true complements hold and random strands do not (section 18). Kept, off by default.
- 2026-09-23. Four letters (`nC`, `nD`), each pairing with its own kind; per-type knobs read through one helper. Two-letter worlds are bit-identical. Binding partners became complementary letters (A–B, C–D), identical to the old rule with two letters. Reason: two letters and strands of four to six are too little information for specific recognition or for more than one function per genome.
- 2026-09-23. Added `shield`, a second gene of the same form as `feed`: a `D` template between two `C`s makes its two bonds immune to radiation. Reason: to test whether genomes accumulate functions when the environment demands several (energy scarcity and radiation at once).
- 2026-09-23. Added `mobS` (bonded blocks jostle at a fraction of a free block's step: polymers creep, monomers and energy diffuse). Reason: section 17 slowed only energy; limited dispersal of the replicators themselves is the other way space could keep a public good with its makers (metabolically coupled replicators on a surface). Evidence: slow polymers make kin clusters (assortment 1.1 to 1.6 against 1.05 to 1.2) but do not rescue the public `ABA` motif, which is lost in one run of three at every mobility (`experiments/RESULTS.md`, section 21). Kept as a physics knob, default 1.
- 2026-09-23. Checked whether an overgrown membrane ring divides by itself: it does not; soft blocks and the pins' give absorb extra membrane, and a ring at a strong bend coils past itself (`experiments/RESULTS.md`, section 16). Division needs its own rule.
- 2026-09-23. Added `act` (monomer activation): a unit that leaves a strand returns to the pool inactive (a new internal state, on the user's preference for state changes) and can dock again only after its back has met the back of a template unit in `actMotif` (`BAB` by default). A second catalysed good beside energy, so that a population needs two functions at once. Off by default; not yet measured.
- 2026-09-23. Flush polygons, on the user's picture of bonded blocks as one shape with a line between them, and the user's call that bonds may break when blocks are deformed too far (a change to the digital-bond commitment of section 2, for weak bonds only). `snapCorners`: after the passes, pinned corners are brought together exactly by deforming the blocks. `maxStrain`: a membrane bond, or a lone docked monomer, lets go when the passes leave its corners further apart than a limit; the monomers of a copy in progress hold each other, and a strand's own bonds have a separate limit `maxStrainStrand`, off. Evidence: any mechanical break inside a copy in progress turns strands into replicating fragments at every limit tried; with the exemption copying is exact; soft snapped membrane with the limit turns an arc of twice the natural length into two rings in 15 of 20 seeds (`experiments/RESULTS.md`, section 23). Tried and removed in the same work: polygon-exact contacts (no effect on the misfits, 2.3 times slower) and fluid membrane `pSwap` (rings of the wrong size). All default off.
- 2026-09-23. Added `tether` and `memPerm` (default off). Tether: a membrane block anchored on a `MAKE` back passes an anchor signal along its arc (as the relay passes `FEED`); raw blocks join only an anchored arc's open ends; active membrane the signal does not reach decays and lets go. It is DESIGN 15A's first half. Evidence: walls grow from their makers and curl around them, copies start walls of their own, arcs of neighbours join into shared walls; but rings holding strands are rarer than with a fixed stock, and with energy from the public motif the wall-making motif is selected against (a fifth of chance against twice chance without membrane): an open wall costs and only a closed one keeps energy (`experiments/RESULTS.md`, section 24). Kept off; closure around the maker and division are the open problems.
- 2026-09-23. Added `act` and `mobS` earlier the same day (see above); the "protocells" viewer preset (a fixed membrane stock) is replaced by "cells" (tethered, permeable walls).
- 2026-09-24. `memLinkTol` (a looser catch for membrane ends): a lone maker's wall closes around it in 20 of 20 seeds at full mobility (8 of 20 before). Then found that walls leaked: energy particles, rays and even strands pass a closed ring when membrane jostles as hard as a free block, or when a particle's step is a large part of a side (`experiments/RESULTS.md`, section 25; section 24's energy rounds are corrected accordingly). Added `mobM` (membrane mobility) and made `mobS` apply to non-membrane bonded blocks only. Walls seal at membrane 0.5 with energy 0.2, rays 0.08 and letters 0.6; then only short makers (`BAB`) close their walls reliably.
- 2026-09-24. Rays as particles (`nX`, `rayHit`, `sizeX`, `mobX`), the user's choice: radiation made physical, so that a wall shields what it encloses without any rule about inside or outside. A ray passes through everything but membrane and breaks a bond it touches. Evidence: a closed ring takes 0 hits on the strand inside against 594 outside (section 25). Tried and removed: a wider contact list (`contactMargin`) against the leaks, no effect.
- 2026-09-24. Stranger blocks for the world search (the user's idea): per-letter size and mobility, folding letters (`fold`: bent while the face is free, straight while copied), and caps (`nP`, `nQ`, `capFray`, after the user's question whether chains had end blocks: letters with one lateral side that pair with each other, end a strand for good and never fray). Evidence and the surprise (capped genomes grow only by internal duplication) in `experiments/RESULTS.md`, section 28. Also `search.js` (section 27), after the user's point that evolution got going only once enough separate processes had built up.
- 2026-09-21. Viewer rebuilt for visibility: zoom and pan, side colours on every square, bond ties, event rings and an event feed, and a default view zoomed on the seed strand. Reason: at the old zoom nothing could be seen happening even while births were being logged.

---

## 15. Ideas not yet tried

**Added 2026-09-24.** Search over worlds instead of one mechanism at a time (`experiments/search.js`,
RESULTS section 27; the user's idea that evolution got going only once enough separate processes had built up).
Next for it: stranger block types to draw from (the user's idea): branching blocks with three or more lateral
sides, two-faced blocks, state-dependent shapes, free catalyst blocks, extreme sizes, softness, speeds and
resistances, poisonous blocks.

**Ranked next steps (2026-09-23).**

- **A. Tethered compartments** (builds on the `make` rule). Keep the anchor: a raw membrane block anchored on a
  `MAKE` back stays bonded while that unit is a template, and recruitment extends only arcs that are anchored
  (an active block reads a different open-side state when its arc has no anchor, and raw blocks join only the
  anchored kind), so membrane grows from, and stays with, the strands that make it. A ring grown past its
  natural size and broken twice by radiation closes into two, each with its share of the contents. Measure:
  do rings hold their makers for a generation; do ring counts grow by division; then the stochastic corrector
  (an `ABA` strand and a `CDC` strand in one ring against either alone, under both pressures).
- **B. Viewer presets for what evolves**, and a button that applies an environment change (the headless
  runner has `--change`; the viewer has none).
- **C. Bigger populations** (80×80 and up) for gene combinations: the motif economy survived there where
  small worlds collapsed, mostly through size. Several hours per run.
- **D. Longer strands for recognition.** Binding needs keys of four or more letters to be specific; that
  needs mean lengths of eight or more, which only the strongest cooperative docking gave.
- **E. Activated monomers** (item 1) only if energy has to limit docking itself; so far scarce energy limits
  births through re-arming when it is scarce enough (`G3_energy_*`), so it has not been needed.

Status of the items below: 3 done; 7 built as the `make` rule (did not put rings around makers); 8 still
open; 9 and 10 superseded by the polygon engine (shapes, wedges, per-type stiffness); 11 done (the only
engine); 12 tried (general stickiness at key length two; no specificity window); 13 partly done (`feed`,
`shield`, `make` and the relay are three entries of such a table); 14 not tried; 15 tried (size, not locality,
explains the rescue so far).

Ordered by how little they add to the rule table.

1. **Activated monomers.** Gate docking instead of re-arming: a free monomer needs an `ON` energy particle on its K before its face reads `DOCK`. Energy is then carried by the food, as in biology. Changes who competes for energy (monomers, not strands) and may change the length result.
2. **Sequence-dependent hinges.** A `B`-`B` lateral bond is free to rotate; all other lateral bonds are rigid. Strands fold where the sequence says; copies inherit the fold; rings become possible; folded strands hide their faces and copy slower. This is the cheapest genotype-to-phenotype map available and the one Phase 3 should start with.
3. **Sequence motifs as metabolism.** *Done* (`motif`, section 8): a `B` between two `A`s recharges spent particles at its back.
4. **Two-sided templates.** Let the K side also pair (`A.K` with `B.K`, say). Strands would then template on both faces, and two strands could sandwich a third. Probably too much; listed because it is one row.
5. **Parasite ecology.** With `pCapture` and `pLigate` on, strands appear that were never templated, and with the motif rule on, strands without the motif live off those with it. Log lineage (which units were ever docked) and ask whether compartments separate producers from parasites, as Boerlijst and Hogeweg found spatial structure does for hypercycles.
6. **Rule-space search.** Treat the compatibility table's probabilities and the transition conditions as a genome, start from a seedless bath (now possible with `pSpont`), and select tables for births per energy. The search space is small enough now to be tractable on a laptop.
7. **Nucleation.** Let `M` bind the back (`K`, `IDLE`) of a template unit, so membrane arcs start on strands and close around them. One row. Without it, rings enclose nothing (section 9). With it, a capsid: the replicator inside a shell of blocks it did not encode, and the first place compartment selection can be measured.
8. **Division.** A membrane ring cannot yet split into two; it opens under radiation and re-closes at its fixed size. A ring that grows (an arc joining it while open) and pinches would be true division and needs a shape rule for `M`, or two membrane types with different bends.
9. **Shapes.** A triangle type would bend chains by 60° per unit and make hexagonal rings natural. The blocker is unchanged: a bent template cannot be copied by rigid docking, because "opposite" blocks on the outside of a curve do not align. Two answers exist now. Hinges (done) copy straight and fold free. Slack (done) is the rubber-band answer: blocks that deform a little so both strands can bend together, which copies gently curved templates; at the sizes in this world (strands of 2 to 12) the curvature that slack allows before chimeras return is too gentle to close a ring, so shapes would need to be combined with it, and the alignment problem would have to be re-measured for every new shape.
10. **Block slack as a per-type property.** If `A` and `B` had different slack, sequence would set stiffness: a genotype-to-phenotype map for shape that needs no new geometry, on top of `hinge` set to `BB` or `AB`.
11. **Deformable squares** (the user's suggestion, 2026-09-23). *Built as a second engine, `physics: 'poly'`; see the decision log and `experiments/RESULTS.md`, section 15. Next: more than four sides per shape.* Move the flexibility from the bonds into the blocks: each square is four corner points held to a square by a restoring force (shape matching: every step the corners are pulled toward the best-fit rigid square, with a stiffness), and may deform into any convex quadrilateral. Bonds stay digital and pin two corners to two corners, so bonded sides are always flush and only shapes give. A trapezoid is then a natural state, so a gently bent template and its copy can bend together and a curved template becomes copyable, which rigid squares cannot do (section 9). Stiffness can be a per-type property (`A` stiff, `B` soft): sequence then sets shape, strands curl where the soft blocks are, rings close without hinge rules, and shape trades off against copying speed. Likely replaces both `slack` and `hinge`. Costs: about three to four times the physics per step; every geometric check (docking angle, flush links, empty slot) has to be written on edges; and the chimera guards must be re-measured, since every loosening of geometry so far let copies docked on different templates link (section 10).
12. **Lock-and-key binding between strands.** Let two template faces bind each other weakly, `A` to `B` (the opposite of copying's `A` to `A`), with the same cooperativity as docking: a lone face-to-face bond melts fast, a run of them slowly, so binding strength grows with the length of the match. A strand and its own copies never match (copies pair letter for letter), so kin do not bind; strands carrying the swapped sequence of a stretch of another bind it and block its faces. That is sequence-specific recognition with a combinatorial space of keys, from one soft row, and the classic source of frequency-dependent selection and arms races. Risk: symmetric binding may simply suppress rare complements.
13. **A small genetic code for backs.** The `ABA` context already gives a back a function. A table from (left type, own type, right type) to a back behaviour, fixed for the whole world, with a handful of behaviours (charge energy, feed neighbours, hold a membrane block, cut a touching back), would let sequences combine functions. Evolution would then assemble genomes carrying several, which is the step from one trait to a genotype. Every entry must be justified by a measurement that the behaviour matters.
14. **Bet-hedging under a fluctuating world.** `run.js --change` can alternate harsh and mild periods. Curled strands that close into rings cannot fray but cannot be copied; straight ones copy but fray. A population whose sequences set the fraction that curls could evolve the fraction to the rhythm of the environment.
15. **Size for spatial structure.** A public good (the charging motif) is selected once offspring stay near their parents for a generation. At the engine's speed that needs worlds four to eight times larger than the ones used so far, or slower dispersal. The engine work of 2026-09-23 makes a 120×120 world with 3,000 monomers a few hours per million steps.

