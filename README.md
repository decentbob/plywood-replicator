# Typed-triangle world

An artificial-life simulation built from one kind of block: the unit triangle. Each side carries a glue from
complementary pairs (`a` binds `A`), a few side marks make hinges, triggers and latches, and every rule is local.
From these pieces the world has replicating chains, contact copying (a uniform food blank touching a part becomes a
copy of it), cells whose spent walls are never copied so that blanks entering through a pore copy only the genome,
bud pairs that catch a genome copy and split, and an older line of casting pockets, driven machines and kits. The
goal is an organism that builds and feeds its offspring until it can split off.

![A cell fed through a pore](docs/pictures/imprint_pore.png)

## Quick start
```
node tri/test.js                        # fast checks
node tri/demos.js imprint 1 100000 runs 150p  # a cell fed through a pore copies its genome from blanks outside
node tri/check.js                       # one PASS/FAIL line per working capability (~30-40 min)
```
Pictures appear in `runs/` (needs Chromium; see tri/render.js). Plain Node.js, no dependencies.

## Read more
- [docs/RULES.md](docs/RULES.md) — the complete rule set
- [docs/INNOVATIONS.md](docs/INNOVATIONS.md) — what has been built, with pictures
- [ROADMAP.md](ROADMAP.md) — the goal and what comes next
- [docs/IDEAS.md](docs/IDEAS.md) — ideas and design lessons
- [AGENTS.md](AGENTS.md), [docs/NEXT.md](docs/NEXT.md) — for coding agents continuing the work
