# Next-instance handoff — 2026-09-28

Read ROADMAP.md, the sole queue. The user approved the two-D geometry and asked
for real-simulation integration. Q8g (RESULTS88) now runs it through ordinary
Sim.step in an opt-in live lab: node tools/half_cell_server.js, then127.0.0.1:8787.
The server is left paused in this task (exec session91197); it only steps on
request. Check processes before a new batch; an actively stepping viewer counts
toward the four-worker limit. Core/default chemistry is unchanged.

Runtime: experiments/half_cell_live.js inherits curved W geometry and automatic
native-polymer rim binding, restoring ordinary melting/reload rates. No new
state, reaction, type change, scheduled splitting or block insertion. Three
starts: one prepared seed + loose random bath; one seed + prepared loose contacts;
two complete prepared Ds joined by face bonds. Same28 blocks,16 solver passes,
body default or individual kicks. Rim bonds currently have no decay.

Fresh integration screen: seeds787/797 x body/individual x three starts,120
steps. Prepared pairs release at t1 in4/4 through ordinary chemistry. Moving
bath/contact starts acquire0/8 new complete cells; seed787/body/contacts makes
one W bond. Stationary prepared contacts at pMem=1 assemble/release a second
chain and close its rim; polymer-off controls form the chain but not the rim.
This is prepared-contact function, not random-bath reproduction or descendants.
One partial-contact world spends/reloads E; the preliminary manifest's no-fuel
note has an explicit correction.json beside it. No new fuel mechanism indicated.

Q8f remains negative: static geometry fits, original dynamic2/4 and separate32
comparison3/4. Source audit confirms bonded-pair contact exclusion then pin/shape
correction, but does not justify a competing generic-separation fix. User's
integration request overrides the old chemistry stop, not either mechanical
gate. Live-screen maximum overlap .194134, pin .583212. No sealed-wall claim.

Next Q8h: freeze a bounded50k–150k free-bath rim-on/off screen with early viability
and CPU look, encounter/attachment accounting, partial arcs/cross-links and
actual released complete outputs.120 steps is not a bath-viability test. No new
assay frozen, no retuning or timing program. Earn any later mechanical/descendant
follow-up; no third resolution sweep. Q7 remains deferred.

Evidence: experiments/out/HC_live_20260928* raw/CPU/validation/HTTP/manifest and
fuel-note correction.12 neutrality/restarts,1,452-frame replay, four invalid
save cases, HTTP/browser checks pass; no failed harness executions.5,112 timed
physics steps plus123 untimed smoke/UI steps;64.326 measured CPU s. Source hashes
unchanged for core/historical modules; no full core suite/fingerprints rerun.
node build.js passes. Browser file picker not tested; exact save/load via HTTP.
Use unique output stems; live assay reads archived inputs directly. Research
saves require the lab runtime, not the standard viewer. Do not tidy hashed files.
