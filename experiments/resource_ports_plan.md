# P2 polygon-port preflight

2026-09-27, after section 66; baseline 809b09d. Question: can the section-63
square/interior and double-width boundary contact graph be expressed and
accessed by the existing polygon mechanics? A possible scarce-material benefit
requires physical growth and turnover, not merely a consistent contact graph.

## Scope fixed before measurements

No chemistry implementation, growth simulation, rate search or population run.
Use three geometry archetypes: unit square, 2×1 bottom rectangle with two inward
top segments, and its top counterpart. Rectangles use six perimeter vertices
(split both long faces to keep the vertex mean at the area centroid), four active
ports and inert remaining edges; NV=8 already has room. All contacts have length
one. Encode all twelve immutable label patterns from section 63 offline, including
polarity; never install the analysis sweep in a reaction.

Enumerate n=1,2,3 minimum-scarce cycles, both strip parities, lengths 3 and 6,
and all four rigid quarter-turn orientations. Use actual corner coordinates to
discover touching ports, independently check against the section-63 strip graph,
and check both exposed two-contact growth sites. Record polygon overlap area,
normal and pin residuals, label matches, current _geomOK acceptance and the full
distance/neighbor gates. No whole-fragment snap or orientation lock.

A natural initial parameterization uses size=sqrt(area), mass=area, correct
rectangle inertia, and the engine's size-derived radius. This is an explicit
fixture choice, not an existing rectangle preset. Also inspect the single
geometrically determined size=2 (long dimension) diagnostic, retaining the same
mass, inertia and polygon. This is a proxy sensitivity check, not a rate sweep.
Compare square controls under each matched solver setting.

Prepared two-contact boundary-front fixtures use n=1, parity zero, both ends
(covering both boundary archetypes) and both first-contact choices. Start all parts at exact physical
contact, attach the incoming rectangle by one incident contact, and measure the
unbound second contact before and after 1/10/100 physics passes (steps). Seeds
211/212, body-jostle/4, individual-kick/4 and individual-kick/16; stiffness 0.5,
snapCorners off. Also run zero-kick geometry diagnostics at 4/16 passes. Preserve
the same bonds and material in comparisons; no chemistry forms or deletes bonds.
These measure prepared accessibility and solver sensitivity, not autonomous
association or cooperative retention. At most one simulation process is needed.

Use two free, axis-aligned rectangles as an analytic steric witness: centres
1.6 apart along their long direction (true overlap), versus 1.2 apart along
their short direction (true separation). Examine current radius and slot checks,
and 10 zero-kick physics steps at 4/16 passes. No scalar radial cutoff can reject
the former while permitting the latter. Measure the effect rather than assuming
it blocks every possible assembly. Include equivalent nonoverlapping square pairs.

## Gate and stop

Port representation passes only if all ideal contacts match labels and reversed
corners, do not double-book a side, have no area overlap, and rotated copies
retain these properties. Record whether all necessary contacts pass the current
search/geometry gates. Classify proxy discrepancies separately from port-layout
failures. A material radial/placement discrepancy affecting these contacts blocks
a claim of validated physical feasibility; do not fix it by widening tolerances,
choosing a favored orientation or locking an entire assembly.

If the geometry passes but mechanics remain unresolved, finish this bounded
preflight as partial and specify the smallest targeted follow-up under P0. Do
not silently launch turnover runs or redesign the engine. A passing preflight
would earn a separately planned first-contact/retention/turnover assay including
the narrow recycling competitor. Neither outcome establishes inherited benefit.

## Evidence and validation

Use existing Sim._physics and side/pin accessors without changing core bytes.
Geometry and prepared IDs are setup/observation only. Record exact fixed part
counts, initial/final states, parameters, seeds, sampling, actual polygons and
all failures, with source/input hashes, exact command and CPU cost. Fixture
restart must preserve its geometry constructor and saved rest-shape buffers.
Test restore and observer/RNG neutrality. Square acquisition controls use a
prepared four-square corner (different mass, only a numerical calibration).
For deformed nonconvex outlines, report convex-hull overlap as a conservative
bound; exact overlap claims use the undeformed convex fixtures.
Validate overlap with independent axis-aligned area examples, check perturbations
break exact port agreement, and verify archived summaries reject corrupt data.
Archive under RP_preflight_20260927, add RESULTS 67 and a ledger row, update
ROADMAP and commit the completed gate. No long physics suite for unchanged core;
run relevant checks and compare the five default fingerprints.
