# Design Spec — Módulo Aprender Fixes (P1-P5)

> Date: 2026-06-19
> Status: Approved for implementation planning
> Source: `docs/Fixes - Modulo Aprender.md` (P1-P5)
> Builds on: `docs/superpowers/specs/2026-06-19-first-aid-mvp-design.md` (the shipped MVP)

## 1. Scope

Render/UX fixes to Module 1 "Aprender". The clinical content is data; these are projection + UI changes. Five fixes, one spec/plan:

- **P1** — Show the scene phase as an ordered sequence (1 Seguridad·priority → 2 Mecanismo → 3 Número de víctimas → 4 Impresión general) + "Buscar ayuda" as a bridge step. Bioseguridad is nested inside Seguridad, not a separate node.
- **P2** — The "Signos vitales" node shows actual normal values (FR/FC/PA/relleno/reevaluación), not bare component names.
- **P3** — Practical rules (`practicalRules`), currently unused by any component, hang off the matching HABCDE letter node.
- **P4** — Victim position (`positions`), currently unrendered, appears on the Evacuation node.
- **P5** — Design polish: ring number badge for the scene sequence, icon de-duplication, label contrast (AA), larger prev/next touch targets.

**Conventions:** code/identifiers/files English; user-facing text and `.yaml` content Spanish. TDD; build fails on bad content. After YAML edits: `npm run content:build`.

**Non-goals:** no Module 2/3 work; no changes to WorkedExample / QuickRef / the chain-map organizer (they work). No unrelated refactors.

## 2. Current state / WIP reconciliation

There is **uncommitted WIP** that enriched the scene differently than P1 (multiple scene nodes incl. bioseguridad as a separate node, hardcoded `SCENE_TOPICS`, and 5 new icons). The YAML was bumped to v0.3 with the correct ordering data. Reconciliation:

- **Keep:** `docs/contenido-cav.yaml` v0.3 — `cadena[escena].orden_estricto: true`, `cadena[escena].secuencia` (`orden`/`parte`/`prioridad`/`incluye`), `cadena[escena].luego: "buscar_ayuda"`. This is the P1 data.
- **Replace:** the WIP scene projection in `chainModel.ts` (hardcoded multi-node) with a `sequence`-driven projection (nested bioseguridad, bridge node).
- **Trim:** `icons.ts` — drop the WIP icons `biosafety`/`mechanism`/`victims`/`impression` (the scene uses numeric badges, not icons, in the map); keep `help` for the bridge.
- **Adapt:** the WIP `content.fixture.ts` + `chainModel.test.ts` to the final shape.

## 3. Data model & content changes (P1, P3, P4)

### 3.1 Carry scene ordering through schema + mapper (P1)

`mapChainPhase` currently drops `secuencia` and `luego`. Extend:

- **`ChainPhaseSchema`** adds:
  ```ts
  sequence: z.array(z.object({
    order: z.number(),
    part: z.string(),
    priority: z.boolean().optional(),
    includes: z.array(z.string()).optional(),
  })).optional(),
  next: z.string().optional(),
  ```
- **`mapChainPhase`** maps `secuencia → sequence` (`orden→order`, `parte→part`, `prioridad→priority`, `incluye→includes`) and `luego → next`. `orden_estricto → strictOrder` already exists.

### 3.2 Per-letter tags on practical rules (P3)

`practicalRules` carry `concepto`, but it's generic (`habcde` for 5 of 7 rules) — it doesn't say which letter. To attach rules to the right HABCDE letter data-driven, add a `letra` field in the YAML to the relevant rules:

| rule id | letra |
|---|---|
| `hemorragia` | `H` |
| `via-sin-trauma`, `via-con-trauma`, `habla-via`, `pls` | `A` |
| `shock-piel` | `C` |
| `no-comer-beber` | *(none — concepto `secundaria`)* |

- **`PracticalRuleSchema`** adds `letter: z.string().optional()`.
- **`mapPracticalRule`** maps `letra → letter`.

### 3.3 Victim position (P4)

No data change — `positions` is already in `ContentSchema` (mapped `posicion_victima → positions`, `situacion/posicion → situation/position`). It is consumed by the evacuation projection (§4.4).

## 4. chainModel projection (P1, P2, P3, P4)

### 4.1 ChainNode additions

```ts
interface ChainNode {
  // ...existing...
  order?: number        // 1-4 for scene sequence parts
  priority?: boolean    // Seguridad = the priority
}
type NodeKind = 'acronymLetter' | 'acronym' | 'topic' | 'reference' | 'bridge'  // + 'bridge'

interface NodeItem {
  label: string
  detail: string
  why?: string
  heading?: string      // optional sub-section heading rendered above the item
}
```

### 4.2 Scene ordered projection (P1) — replaces the WIP scene code

Read `scene.sequence` (sorted by `order`). For each part, build ONE numbered node from its `content` sub-object:

- **1 · Seguridad** (`priority: true`) — items from `seguridad`: `regla` (heading "Regla"), `riesgos` (heading "Riesgos de la escena", string list joined). **Nested bioseguridad** (`includes: ["bioseguridad"]`): append `bioseguridad`'s fields (`definicion`, `epp`, `transmision_sangre`, `transmision_aire`, `lavado_manos`) as items under a `heading: "Bioseguridad"` on the FIRST of them. Not a separate node.
- **2 · Mecanismo de daño** — items: `definicion`, `evaluar`, `sospechar_lesiones_graves`, `regla`.
- **3 · Número de víctimas** — items: `definicion`, `triage`, `nota`.
- **4 · Impresión general** — resolves `impresion_general.ref_sigla` (`tev`) → TEV components as items; `rationaleId: 'tev'`, subtitle = TEV name.
- **Bridge** — `scene.next: "buscar_ayuda"` → node `{ id: 'scene-help', kind: 'bridge', title: 'Buscar ayuda', items: [content.buscar_ayuda] }`. Not numbered.

All scene nodes keep `rationaleId: 'scene'` (resolves in the rationale map) except the impression node (`'tev'`). Node ids: `scene-1-seguridad`, `scene-2-mecanismo`, `scene-3-victimas`, `scene-4-impresion`, `scene-help` (or derive from `part`). Helpers (`isRecord`, `asDetail` for string|string[]→detail, field-projection) are pure and unit-tested.

**Leaf coercion:** string → as-is; string[] → joined `" · "`; else skip the item.

### 4.3 Vital signs with values (P2)

`secondary-vital-signs` node items today are `components.map(c => ({label:c, detail:''}))`. Replace with value rows read from the `vitalSigns` sub-objects (same data QuickRef uses):

| label | source |
|---|---|
| Frecuencia respiratoria | `respiratoryRate.adulto` (e.g. "12-20") |
| Frecuencia cardíaca | `heartRate.adulto` ("60-100") |
| Presión arterial | `bloodPressure.normal` ("120/80 mmHg…") |
| Relleno capilar | `capillaryRefill.normal` ("< 2 segundos") |
| Reevaluación | `reevaluacion.estable` / `.inestable` ("estable 15-20 / inestable 5 min") |

Tolerant optional access; skip rows whose value is absent.

**Build-pipeline gap (must fix for the Reevaluación row).** `anglicizeVitals` in `scripts/build-content.ts` currently constructs `vitalSigns` from only `components/respiratoryRate/heartRate/bloodPressure/skin/capillaryRefill` — it does NOT copy `signos_vitales.reevaluacion` (which exists in the YAML). So `content.vitalSigns.reevaluacion` is `undefined` today. Fix: add `reevaluacion: v.reevaluacion` to `anglicizeVitals`, and add `reevaluacion: z.record(z.unknown()).optional()` to `VitalSignsSchema`. The other four rows already land as the camelCase keys above (verified against generated `content.json` and `QuickRef.tsx`). The vital-signs node then reads all five from `content.vitalSigns` (single-sourced, same as QuickRef).

### 4.4 Practical rules on HABCDE letters (P3)

In `primaryNodes`, for each letter node append the `practicalRules` whose `letter === node.letter` as items under `heading: "Reglas clave"` (the first such item carries the heading). So H shows the hemorrhage→torniquete rule, A the airway-maneuver rules, C the shock-skin rule. The `no-comer-beber` rule (no letter) is attached to a secondary node (the existing `secondary-vital-signs` or a small dedicated item under secondary — implementation picks the secondary node whose concept fits; default: append to the secondary phase as an item under "Reglas clave").

### 4.5 Victim position on Evacuation (P4)

In `evacuationNodes`, the decision node gains items from `positions` under `heading: "Posición de la víctima"` (situation → position), after the evac-level items.

## 5. UI & components (P1, P5)

### 5.1 New / changed components

- **`StepBadge.tsx` (+ `.module.css`)** — outline ring, burgundy, ~22px (hero ~44px), centered number. `aria-label={`Paso ${n}`}`. Used by `NodeCard` and `NodeDetail`.
- **`NodeCard`** — render order: `node.order` → `StepBadge`; else `node.letter` → `LetterBadge`; else `node.icon` → `Icon`. When `node.priority`, render a small "prioridad" `Chip`-like marker next to the title. When `node.kind === 'bridge'`, render a dashed-border card (no number) preceded by a "↓" connector and a small `help` icon.
- **`ExpandableItem`** — when `item.heading` is set, render a small uppercase sub-heading (reuse `Section` label styling) above the item.
- **`NodeDetail` hero** — `node.order` → `StepBadge` (large); `node.priority` → "prioridad" marker in the title.

### 5.2 Polish (P5)

- **Icons:** scene uses numeric badges in the map → no scene icons → the "two triangles" (Seguridad vs Impresión) issue disappears. Remove WIP icons `biosafety`/`mechanism`/`victims`/`impression` from `icons.ts`; keep `help` (bridge).
- **Contrast:** darken `--muted` from `#7a5f3d` to `#6b5326` (≥4.5:1 on `--bg` cream) — affects "EN LÍNEA"/"FASE N"/breadcrumb labels. `--ink-soft` (#5a4b30) already passes; verify and adjust only if it fails.
- **Touch targets:** `NodeDetail` prev/next links wrapped to ≥44px tap height (inline-block + padding).

## 6. Testing

| Layer | Cases |
|---|---|
| `schemas` | `sequence`/`next` parse on a phase; `rule.letter` optional parses |
| `mapping` | `secuencia→sequence` (incl. `orden/parte/prioridad/incluye`), `luego→next`, `regla.letra→letter` |
| `chainModel` | scene nodes ordered 1-4; node 1 has `priority` + nested Bioseguridad items (NOT a separate node); `buscar_ayuda` is a `bridge` node; impression node resolves TEV; vital-signs node has value details (FR/FC/PA/relleno/reevaluación); H/A/C letter nodes carry their rules under "Reglas clave"; evac node has position items |
| `ui` | `StepBadge` renders number + `aria-label`; `NodeCard` renders StepBadge for ordered node, priority marker, bridge variant |
| `fixture` | add `sequence`+`next` to the scene phase, ≥2 rules with `letter`, richer `vitalSigns`, `positions` |

Gates (raw binaries): `vitest run`, `tsc --noEmit -p tsconfig.json` + `-p tsconfig.node.json`, `eslint . --max-warnings 0`, `tsx scripts/build-content.ts --check`, `vite build`.

## 7. File map

- `docs/contenido-cav.yaml` — add `letra` to relevant rules (P3). (v0.3 sequence data already present.)
- `src/shared/content/schemas.ts` — `sequence`/`next` on phase; `letter` on rule; `reevaluacion` on `VitalSignsSchema` (P2).
- `scripts/build-content.ts` — extend `anglicizeVitals` to carry `reevaluacion` (P2).
- `src/shared/content/mapping.ts` — map the new keys.
- `src/shared/content/types.ts` — re-export if needed (inferred).
- `src/modules/learn/domain/chainModel.ts` — scene (P1), vitals (P2), rules-on-letters (P3), position-on-evac (P4); `order`/`priority`/`bridge`/`heading`.
- `src/shared/ui/components/StepBadge.tsx` (+css), `ExpandableItem.tsx` (heading), `NodeCard.tsx` (+css; StepBadge/priority/bridge).
- `src/modules/learn/routes/NodeDetail.tsx` — hero StepBadge + priority + touch targets.
- `src/shared/ui/tokens.css` — `--muted` contrast.
- `src/shared/ui/icons.ts` — trim WIP icons, keep `help`.
- `tests/...` — schema/mapping/chainModel/ui + fixture.

## 8. Build order

1. Schema + mapper for `sequence`/`next`/`letter` (+ tests). Add `letra` to YAML rules.
2. Fixture enrichment (sequence/next/rules-with-letter/vitals/positions).
3. chainModel: scene ordered + nested bioseguridad + bridge (replace WIP) (+ tests).
4. chainModel: vital values (P2), rules-on-letters (P3), position-on-evac (P4) (+ tests).
5. `StepBadge` + `ExpandableItem` heading + `NodeCard` (StepBadge/priority/bridge) (+ tests).
6. `NodeDetail` hero + touch targets; `tokens.css` contrast; `icons.ts` trim.
7. Verify gates + visual check (dev server screenshot of the ordered scene + a letter node with rules + vitals + evac position).

## 9. Open questions / explicit non-decisions

- The `no-comer-beber` rule's exact secondary placement is implementation-time (default: a secondary "Reglas clave" item). Low stakes.
- `--ink-soft` contrast: keep unless it measures < 4.5:1, then darken alongside `--muted`.
