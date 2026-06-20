# Design Spec — Módulo Aprender Fixes (ronda 4, cerrar Escena/CAV)

> Date: 2026-06-20
> Status: Approved (goal: "termina todo")
> Source: PDF "Guía para el alumno de Primeros Socorros Estándares en Lugares Remotos-WFA" (p. 24 EPP) — glove-removal box on p. 40 ("CÓMO QUITARSE LOS GUANTES").
> Closes the scene/CAV review the Fixes-3 doc flagged for a next pass: bioseguridad (glove-removal technique) + evacuación (comunicación / evaluación continua / contacto AE).

## 1. Scope

Two remaining under-surfaced areas:
- **P1 — Bioseguridad: glove-removal technique.** The node lists EPP / transmission / hand-washing but omits the manual's "Cómo quitarse los guantes" technique. Add it as new content (faithfully transcribed from the PDF, p. 40) and surface it.
- **P2 — Evacuación: comunicación / evaluación continua / contacto AE.** The evacuation phase `content` already holds `comunicacion`, `evaluacion_continua`, `contactar_ae` (in the YAML), but `evacuationNodes` renders only levels + positions. Wire those three into the node. Pure wiring; no new content.

**Conventions:** code/identifiers/files English; user-facing text + `.yaml` Spanish (voseo, matching existing content). TDD; raw-binary gates; after YAML edits `npm run content:build`. On `main`.

**Non-goals:** no schema changes (scene/evac `content` is loose `z.record`); no new acronyms; no M2/M3 changes; the glove-removal text is transcribed from the PDF, not invented.

## 2. Content (`docs/contenido-cav.yaml` → v0.7)

**Bioseguridad** — add `quitarse_guantes` (array) under `cadena[escena].contenido.bioseguridad`, transcribed from the PDF box (p. 40), lightly adapted to voseo:
```yaml
quitarse_guantes:
  - "Tomá un guante por su extremo posterior, en pinza con la otra mano, tocando siempre la parte EXTERNA."
  - "Tirá hasta quitarlo del todo y envolverlo dentro de la mano enguantada."
  - "Meté dos dedos de la mano libre por DENTRO de la mano enguantada (tocando solo la piel y la cara interna del guante)."
  - "Arrastrá hasta quitar y envolver los dos guantes; la cara interna del segundo queda hacia afuera."
  - "Descartá los guantes en un recipiente para residuos patológicos o bolsa roja."
```

Evacuation content is already present (no YAML change needed for P2): `cadena[evacuacion].contenido.{comunicacion, evaluacion_continua, contactar_ae}`.

## 3. Wiring — `src/modules/learn/domain/chainModel.ts`

**P1 — `BIOSAFETY_FIELDS`:** add `['quitarse_guantes', 'Cómo quitarse los guantes']` after `['epp', …]`:
```ts
const BIOSAFETY_FIELDS: Array<[string, string]> = [
  ['definicion', 'Qué es'],
  ['epp', 'Equipo de protección (EPP)'],
  ['quitarse_guantes', 'Cómo quitarse los guantes'],
  ['transmision_sangre', 'Transmisión por sangre'],
  ['transmision_aire', 'Transmisión por aire'],
  ['lavado_manos', 'Lavado de manos'],
]
```
(`asDetail` joins string arrays with " · "; `fieldItems` skips missing fields — graceful.)

**P2 — `evacuationNodes`:** read the evacuation phase `content` (tolerant access) and append items for the three guidance fields, grouped under a heading "Durante la evacuación":
```ts
const phase = content.chain.find(p => p.phase === 'evacuation')
const c = (phase?.content ?? {}) as Record<string, unknown>
const guidance: Array<[string, string]> = [
  ['comunicacion', 'Comunicación'],
  ['evaluacion_continua', 'Evaluación continua'],
  ['contactar_ae', 'Contactar ayuda externa'],
]
const guidanceItems = guidance
  .map(([k, label], i): NodeItem | null =>
    typeof c[k] === 'string'
      ? { label, detail: c[k] as string, ...(i === 0 ? { heading: 'Durante la evacuación' } : {}) }
      : null,
  )
  .filter((x): x is NodeItem => x !== null)
```
The single evacuation node's `items` become `[...levelItems, ...positionItems, ...guidanceItems]`. NOTE: `withHeading` sets the heading on the FIRST item of a slice; here the first present guidance item carries the heading. If `comunicacion` were absent, the heading should fall on the first present item — implement by tagging the heading on the first surviving item after filtering (see plan), not on index 0 pre-filter.

## 4. Testing

Fixture (`tests/fixtures/content.fixture.ts`):
- `content.bioseguridad` gains `quitarse_guantes: ['Tomá un guante…', 'Descartá…']` (≥2 steps).
- The `evacuation` chain entry's `content` gains `{ comunicacion, evaluacion_continua, contactar_ae }` strings (currently `content: {}`).

`tests/modules/learn/chainModel.test.ts`:
- The safety node (`scene-safety`, which nests bioseguridad) includes an item labelled "Cómo quitarse los guantes" whose detail contains a step keyword (e.g. "guante").
- The evacuation node includes items "Comunicación", "Evaluación continua", "Contactar ayuda externa", and the first of them carries the heading "Durante la evacuación".

Gates (raw binaries): `tsx scripts/build-content.ts --check`, `vitest run`, both `tsc`, `eslint --max-warnings 0`, `vite build`.

## 5. Build order
1. Content v0.7 (bioseguridad `quitarse_guantes`) + rebuild.
2. Wire `BIOSAFETY_FIELDS` (P1) + `evacuationNodes` guidance (P2) + fixture + tests.
3. Gates + visual check (Escena → Seguridad → bioseguridad shows "Cómo quitarse los guantes"; Evacuación node shows Comunicación / Evaluación continua / Contactar AE).
