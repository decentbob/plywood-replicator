# Next-instance handoff — 2026-09-27

Read [ROADMAP](../ROADMAP.md), the sole current queue. The user clarified that
blocks are not limited to four sides and proposed integrated polymer caps with
two end polarities. This supersedes the separate-J preference from `b890d63`.
The explicit clarification is now in AGENTS and DESIGN.

[POLYMER_CAPS](POLYMER_CAPS.md) is the current design memo. Give C_L/C_R enough
ports for inward rail, copy, two rim contacts and fuel; extra sides are allowed.
Two cap types encode local polarity, but actual antiparallel-copy orientations
must fit. End growth can be simple; a closed rim needs an explicit enlargement
route, and copying inside a common rim does not itself produce two cells.

Next: freeze an isolated integrated-cap geometry fixture, including adjacent
ordinary tiles, rim stubs and fuel, before growth chemistry. Test spatial
clearance first with no timing gate. A candidate gate based on own rail occupancy
and free copying face only affects recruitment at the cap; it neither stops
remote polymer tips nor detects completed copying. No relay or cell schedule
is admitted. The physical plan, rates, seeds and horizon are not frozen yet.

The old brief, topology plan/runner and raw RESULTS 81 evidence are byte-hashed
and unchanged. Their four-port restriction is historical implementation scope.
This slice adds design clarification only; no experiments, core modifications,
physics-suite or fingerprint reruns. Q7b remains deferred; old failures remain
failed. No task-owned simulation or subagent is active.
