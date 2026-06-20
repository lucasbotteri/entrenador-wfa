# Contributing

## Conventions

- Code, file names, identifiers, comments, and commits in **English**.
- User-facing strings and the `.yaml` clinical content stay **Spanish**.

## Architecture (see design spec §3)

- `src/shared/{content,domain,ui}` — cross-cutting building blocks. These must **not**
  import from `src/modules/*`.
- `src/shared/app` is the composition root — the one exception that wires modules into
  the router.
- `src/modules/<name>/{content,domain,ui,routes}` — a module imports only from `shared/`
  (never from another module). Within a module the dependency direction is
  `routes → ui → domain → content`.
- A module's `content/` holds raw-data selectors; view-model projections that need
  rationale lookups live in the module's `domain/` (e.g. `learn/domain/chainModel.ts`).

Modules 2 and 3 are planned but not part of v1.

## Tests

Colocate under `tests/` mirroring the source path. TDD: write the failing test first.
