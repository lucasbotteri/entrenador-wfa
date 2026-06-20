# Design Spec — Módulo Aprender Fixes (ronda 3, P1-P2)

> Date: 2026-06-20
> Status: Approved for implementation
> Source: `docs/Fixes 3 - Modulo Aprender.md`
> Builds on: MVP + M1 (+ rounds 1 & 2).

## 1. Scope

Two Escena-phase nodes were under-represented vs the PDF (content compacted them). The clinical content is already applied in `docs/contenido-cav.yaml` (**v0.6**, uncommitted). This round is pure UI wiring in `chainModel.ts` `SCENE_PART_DEFS` to surface the richer fields.

- **P1 — "Número de víctimas" → víctimas ↔ recursos.** The node is a balance of victims vs resources, not just a count. Surface `recursos` and `testigos` (already in the YAML), and rename the node title to **"Números"**.
- **P2 — "Mecanismo de daño" → origins, sudden illness, environment.** Injuries can come from trauma, environment, sudden illness, or a combination. Surface `origenes`, `enfermedad_subita`, `ambiente`, and relabel the trauma-specific `evaluar` field as **"Qué evaluar (en trauma)"**.

**Conventions:** code/identifiers/files English; user-facing text + `.yaml` Spanish. TDD; raw-binary gates; after YAML edits `npm run content:build`. Work on `main` (user consent).

**Non-goals:** no schema changes (these are free-form `content` fields already tolerated by the loose-record access); no touching bioseguridad / evacuación (the doc's "próxima pasada"); no changes outside the two scene nodes.

## 2. Content (`docs/contenido-cav.yaml`, v0.6 — already applied)

- `cadena[escena].contenido.numero_victimas` has: `definicion`, `recursos`, `triage`, `testigos`, `nota`.
- `cadena[escena].contenido.mecanismo_dano` has: `definicion`, `origenes`, `evaluar` (array), `sospechar_lesiones_graves` (array), `enfermedad_subita`, `ambiente`, `regla`.

Commit the v0.6 YAML with the wiring; rebuild content. No schema change (the scene `content` is `z.record(z.unknown())`; `chainModel` reads it via tolerant `isRecord`/`asDetail`, which already joins string-array fields with " · ").

## 3. Wiring — `src/modules/learn/domain/chainModel.ts` `SCENE_PART_DEFS`

**`numero_victimas`** def:
```ts
numero_victimas: {
  id: 'scene-victims',
  title: 'Números',
  fields: [
    ['definicion', 'Qué es'],
    ['recursos', 'Recursos'],
    ['triage', 'Triage'],
    ['testigos', 'Testigos / ayuda'],
    ['nota', 'Nota'],
  ],
},
```

**`mecanismo_dano`** def:
```ts
mecanismo_dano: {
  id: 'scene-mechanism',
  title: 'Mecanismo de daño',
  fields: [
    ['definicion', 'Qué es'],
    ['origenes', 'Orígenes posibles'],
    ['evaluar', 'Qué evaluar (en trauma)'],
    ['sospechar_lesiones_graves', 'Sospechar lesiones graves'],
    ['enfermedad_subita', 'Si es enfermedad súbita'],
    ['ambiente', 'Ambiente'],
    ['regla', 'Regla'],
  ],
},
```

`fieldItems` skips fields whose value is empty/missing, so any absent field degrades gracefully (no empty rows). Field display order follows the arrays above.

## 4. Testing

Fixture (`tests/fixtures/content.fixture.ts`) enrichment so the new fields are exercised. NOTE: the fixture scene currently has NO `numero_victimas` part (its `sequence` is orders 1=seguridad, 2=mecanismo_dano, 4=impresion_general; `content` has no `numero_victimas`). So:
- Add a `{ order: 3, part: 'numero_victimas' }` entry to the scene `sequence`, and a `numero_victimas: { definicion, recursos, triage, testigos, nota }` block to the scene `content`.
- Add `origenes` + `enfermedad_subita` + `ambiente` strings to the existing `mecanismo_dano` block in the fixture `content`.

`tests/modules/learn/chainModel.test.ts`:
- The `scene-victims` node title is "Números"; its items include labels "Recursos" and "Testigos / ayuda" with their detail.
- The `scene-mechanism` node items include "Orígenes posibles", "Si es enfermedad súbita", "Ambiente", and the relabeled "Qué evaluar (en trauma)".

Gates (raw binaries): `tsx scripts/build-content.ts --check`, `vitest run`, both `tsc`, `eslint --max-warnings 0`, `vite build`.

## 5. Build order

1. Commit v0.6 YAML (content already applied) + rebuild.
2. Wire `SCENE_PART_DEFS` (P1 title+fields, P2 fields+relabel) + fixture + chainModel tests.
3. Gates + visual check (Escena → "Números" shows Recursos/Testigos; "Mecanismo de daño" shows Orígenes/enfermedad súbita/Ambiente + "Qué evaluar (en trauma)").
