# Entrenador WFA

Offline-first PWA to learn and drill remote first aid (Cadena de Atención a la Víctima).

## Stack

React + Vite + TypeScript · PWA (Workbox via `vite-plugin-pwa`) · React Router · content compiled from YAML and validated with Zod.

## Scripts

- `npm run dev` — dev server (rebuilds content on YAML change).
- `npm run build` — `content:build`, then `tsc --noEmit -p tsconfig.json`, then `vite build`.
- `npm run preview` — serve the production build locally.
- `npm run test` — watch tests · `npm run test:run` — run once.
- `npm run lint` — ESLint (`--max-warnings 0`).
- `npm run typecheck` — `tsc --noEmit` for both `tsconfig.json` and `tsconfig.node.json`.
- `npm run content:build` — compile `docs/*.yaml` → validated JSON in `src/shared/content/generated`.

## Editing content

Clinical content lives in `docs/contenido-cav.yaml` and `docs/casos.yaml`. Edit there
(never hardcode clinical strings in the UI), then run `npm run content:build`.

The build fails on:
- schema errors,
- dangling `worked_example` / chain rationale references,
- duplicate concept ids.

Module-2 case-card references are not yet ref-validated; that check is deferred to
Module 2 (when those concepts get stable ids). Module 2 and Module 3 are planned but
out of scope for v1.

## Reference

- PRD: `docs/PRD - Entrenador WFA.md`
- Design spec: `docs/superpowers/specs/2026-06-19-first-aid-mvp-design.md`
