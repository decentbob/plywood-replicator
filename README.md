# Typed-triangle world

An artificial-life simulation built from one kind of block: the unit triangle. Each side carries a glue from
complementary pairs (`a` binds `A`), six side marks (close-only, attach, completion release, anchor, copy, lysis) shape
how it binds, and every rule is local. From these pieces the world has replicating chains, contact copying (a uniform
food blank touching a part becomes a copy of it), cells whose spent walls are never copied so that blanks entering
through a pore copy only the genome (only a genome held by its cell is copied, so leaked strands are sterile), and two
generations of a cell kind grown from
its own kit: the parent copies its genome, grows its bud from a pool of parts, the bud catches a copy, splits off and
buds in turn; and a reverse path: a cutter that binds a bud waiting in vain takes it apart into its parts, which grow
the next bud. (An older
line of casting pockets, driven machines and kits was removed on 2026-10-03; it is in git at `7415fd4`.) The goal is
an organism that builds and feeds its offspring until it can split off.

![Two generations of the kind, grown from a pool of its parts](docs/pictures/budcycle_generations.png)

## Quick start
```
node tri/test.js                        # fast checks
node tri/demos.js imprint 1 100000 runs 150p  # a cell fed through a pore copies its genome from blanks outside
node tri/demos.js budcycle 1 300000 runs     # one generation: a parent grows its bud from parts, the bud catches a copy and splits
node tri/demos.js lysis 1 1000000 runs        # a stuck bud taken apart into its parts; a new bud grows from them
node tri/check.js                       # one PASS/FAIL line per working capability (~40 min)
```
Pictures appear in `runs/` (needs Chromium; see tri/render.js). Plain Node.js, no dependencies.

## Read more
- [docs/RULES.md](docs/RULES.md) — the complete rule set
- [docs/INNOVATIONS.md](docs/INNOVATIONS.md) — what has been built, with pictures
- [ROADMAP.md](ROADMAP.md) — the goal and what comes next
- [docs/IDEAS.md](docs/IDEAS.md) — ideas and design lessons
- [AGENTS.md](AGENTS.md), [docs/NEXT.md](docs/NEXT.md) — for coding agents continuing the work
