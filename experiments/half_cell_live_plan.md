# Q8g: run the half-cell geometry with live chemistry

2026-09-28. The user explicitly requests integration into the real simulation.
This overrides the previous queue's chemistry-admission stop, not RESULTS87's
failed geometry verdict. Keep the existing16-pass physics without a numerical
rescue. Source inspection confirms directly bonded pairs are excluded from
contact correction and each pass ends with pins/shape matching; enabling such
contacts would compete with pins and is not a demonstrated fix. Defer that
change. Body jostling remains the exploratory default; retain an individual
motion check and report its limitations. No protection or exact-exclusion claim.

Build an opt-in research runtime/viewer using the actual Sim.step order:
physics, ordinary bond formation plus automatic rim binding, ordinary chemistry.
The fixed W polygon is the Q8f shape; P/Q cap shapes and separate rim table stay.
W reads fixed complementary end labels, port occupancy, local corner geometry
and existing pMem. P/Q/A/E retain existing rules. No new state, signal, observer
predicate, timer, growth schedule, type conversion or dynamic material creation.
Rim bonds currently do not decay. Keep that limitation explicit.

Prepare28 blocks (one or two D assemblies and/or the same free material):
4 A,16 W,2 P,2 Q,4 E, world24x24. Three labelled starts: one prepared D with
random nonoverlapping free material; one D with loose prospective daughter
parts in eligible positions (prepared contacts, no daughter bonds); paired Ds
already joined (release diagnostic). IDs and classifications are observer/setup
only. No insertion, relocation or scheduled bond removal after stepping starts.
Use sigma.3, sigmaRot.45, stiffness.8, iters16; restore default ordinary melting
and E reload rates that the geometry assay disabled, energyGate=true, pMem=.2.
No special energy treatment, fraying or damage experiment.

Freeze integration screen: seeds787/797 x body/individual x three starts,
120 steps each. Independent world is the unit. First5 steps: conserved material,
valid bonds, finite geometry; stop on invariant/harness failure, preserve source
and failed output. Functional zero-motion contact tests at pMem=1 show both
cap attachment/extension/closure via actual step; pMem=0 controls prevent new
rim bonds, rimBind=false prevents them too. Existing ordinary release must be
observed in the paired start without imposed unlinks. This is software/operation
admission, not a population or autonomous-reproduction success threshold.

Primary report: ordinary/rim bonds acquired, copying contacts, ordinary detached
complete chains, topology-complete D assemblies and active status. Distinguish
prepared assemblies from acquired bonds; use target IDs only in observer reports.
Report full-run geometric maxima separately. No sealed wall from graph closure.
If no free-bath assembly occurs, record zero; do not extend/retune the screen.
Results may justify a later50k–150k free-bath screen, not an inheritance claim.

Check observer/plain and midpoint restart in all12 worlds, full replay and
saved topology/arrays/RNG, corrupted saved-state rejection and observer synthetic
cases. UI runs the same runtime, with pause/step/reset, motion control, save/load
and actual polygon/rim rendering; no fake animation. Node HTTP on loopback only,
no dependencies or default core changes. Test endpoint and browser interaction.
At most one simulation process for the assay; stop it before the viewer check.
Measured assay/validation CPU budget180s, reserve60s for failures/QA; capture
partial records on exhaustion. Archive all evidence, source/input hashes,
commands and CPU; RESULTS88/LEDGER/ROADMAP/handoff. Commit and push after checks.
