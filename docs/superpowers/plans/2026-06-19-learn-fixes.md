# Módulo Aprender Fixes (P1-P5) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render/UX fixes to Module 1 "Aprender": ordered scene sequence with nested bioseguridad + a bridge step (P1), vital-signs values (P2), practical rules on HABCDE letter nodes (P3), victim position on evacuation (P4), and design polish — ring step badge, contrast, touch targets (P5).

**Architecture:** Pure data-driven projection. The clinical content is already in `docs/contenido-cav.yaml` (v0.3, with the scene `secuencia`/`luego`). Changes flow: schema + mapper carry new keys → `chainModel` projects them → UI renders. No hardcoded clinical text. TDD, raw-binary gates, frequent commits.

**Tech Stack:** React + Vite + TypeScript, zod, Vitest + Testing Library, CSS Modules.

**Reference spec:** `docs/superpowers/specs/2026-06-19-learn-fixes-design.md`

**RTK proxy warning:** A shell proxy can report exit 0 even when a tool failed. Run RAW binaries and trust real exit codes: `./node_modules/.bin/vitest run`, `./node_modules/.bin/tsc --noEmit -p tsconfig.json`, `./node_modules/.bin/tsc --noEmit -p tsconfig.node.json`, `./node_modules/.bin/eslint . --max-warnings 0`, `./node_modules/.bin/tsx scripts/build-content.ts --check`, `./node_modules/.bin/vite build`. Use `/usr/bin/git` for git status/log.

**Conventions:** code/identifiers/files English; user-facing strings + `.yaml` content Spanish.

---

## File Map

- `docs/contenido-cav.yaml` — add `letra` to relevant `reglas_practicas` (P3). (v0.3 `secuencia`/`orden_estricto`/`luego` already present.)
- `src/shared/content/schemas.ts` — `sequence`/`next` on `ChainPhaseSchema`; `letter` on `PracticalRuleSchema`; `reevaluacion` on `VitalSignsSchema`.
- `scripts/build-content.ts` — `anglicizeVitals` carries `reevaluacion`.
- `src/shared/content/mapping.ts` — `mapChainPhase` maps `secuencia→sequence`/`luego→next`; `mapPracticalRule` maps `letra→letter`.
- `src/modules/learn/domain/chainModel.ts` — scene ordered (P1), vital values (P2), rules-on-letters (P3), position-on-evac (P4); `ChainNode.order/priority`, `NodeKind 'bridge'`, `NodeItem.heading`.
- `src/shared/ui/components/StepBadge.tsx` (+ `.module.css`) — ring number badge (P1/P5).
- `src/shared/ui/icons.ts` — add `help` (bridge icon).
- `src/modules/learn/ui/ExpandableItem.tsx` (+ css) — render `item.heading`.
- `src/modules/learn/ui/NodeCard.tsx` (+ css) — StepBadge / priority marker / bridge variant.
- `src/modules/learn/ui/PhaseTimeline.tsx` — `↓` connector before a bridge node.
- `src/modules/learn/routes/NodeDetail.tsx` — hero StepBadge + priority + larger prev/next.
- `src/shared/ui/tokens.css` — darken `--muted` (contrast, P5).
- `tests/fixtures/content.fixture.ts` — enrich with `sequence`/`next`/rules-with-letter/vitals/positions.
- `tests/...` — schema/mapping/chainModel/ui tests.

---

## Task 1: Reset divergent WIP + tag rules with letters

There is uncommitted WIP that enriched the scene a different way. Reset the WIP **code** files to the clean MVP (HEAD) — we rebuild them per the design — but KEEP the YAML v0.3 (its `secuencia`/`luego` data is correct), and add the `letra` tags (P3).

**Files:**
- Reset: `src/modules/learn/domain/chainModel.ts`, `src/shared/ui/icons.ts`, `tests/fixtures/content.fixture.ts`, `tests/modules/learn/chainModel.test.ts`
- Modify: `docs/contenido-cav.yaml` (rules `letra`)

- [ ] **Step 1: Reset the WIP code files to HEAD (keep the YAML)**

```bash
/usr/bin/git checkout HEAD -- \
  src/modules/learn/domain/chainModel.ts \
  src/shared/ui/icons.ts \
  tests/fixtures/content.fixture.ts \
  tests/modules/learn/chainModel.test.ts
```
Verify `docs/contenido-cav.yaml` is still modified (v0.3): `/usr/bin/git status --short` should show `M docs/contenido-cav.yaml` and the code files no longer modified.

- [ ] **Step 2: Add `letra` to the practical rules** in `docs/contenido-cav.yaml`

Replace the `reglas_practicas:` block with (only `letra` added to the relevant rows; `no-comer-beber` gets none):

```yaml
reglas_practicas:
  - {id: "via-sin-trauma", regla: "Sin sospecha de lesión cervical: maniobra frente-mentón.", concepto: "habcde", letra: "A"}
  - {id: "via-con-trauma", regla: "Con sospecha de lesión cervical: maniobra de subluxación de la mandíbula.", concepto: "habcde", letra: "A"}
  - {id: "habla-via", regla: "Si la víctima puede hablar, gritar o llorar, tiene la vía aérea abierta y está ventilando.", concepto: "habcde", letra: "A"}
  - {id: "hemorragia", regla: "Hemorragia importante: presión directa con mano enguantada; si no cede en los primeros minutos, torniquete a 5-8 cm de la herida, nunca sobre articulación, anotar la hora.", concepto: "habcde", letra: "H"}
  - {id: "shock-piel", regla: "Signos de shock: piel pálida, fría y húmeda.", concepto: "shock", letra: "C"}
  - {id: "pls", regla: "Inconsciente que respira normal (sin sospecha de columna): Posición Lateral de Seguridad (PLS).", concepto: "habcde", letra: "A"}
  - {id: "no-comer-beber", regla: "No dar de comer ni beber ante sospecha de lesión abdominal o shock.", concepto: "secundaria"}
```

- [ ] **Step 3: Verify baseline is green (clean MVP + YAML)**

Run: `./node_modules/.bin/tsx scripts/build-content.ts --check && ./node_modules/.bin/vitest run`
Expected: `✓ content valid` and 47 tests pass (the YAML `letra`/`secuencia` are ignored by the current mapper, no breakage).

- [ ] **Step 4: Commit**

```bash
/usr/bin/git add docs/contenido-cav.yaml src/modules/learn/domain/chainModel.ts src/shared/ui/icons.ts tests/fixtures/content.fixture.ts tests/modules/learn/chainModel.test.ts
/usr/bin/git commit -m "chore(learn): reset scene WIP to MVP base; tag practical rules with letter (P3)"
```

---

## Task 2: Schema — sequence/next, rule.letter, vitals.reevaluacion

**Files:**
- Modify: `src/shared/content/schemas.ts`
- Test: `tests/shared/content/schemas-content.test.ts` (append)

- [ ] **Step 1: Write the failing test** — append to `tests/shared/content/schemas-content.test.ts`

```ts
import { ChainPhaseSchema, PracticalRuleSchema, VitalSignsSchema } from '@/shared/content/schemas'

describe('fixes schemas', () => {
  it('accepts a scene phase with sequence + next', () => {
    const p = ChainPhaseSchema.parse({
      phase: 'scene', name: 'Escena', rationale: 'r', strictOrder: true,
      sequence: [{ order: 1, part: 'seguridad', priority: true, includes: ['bioseguridad'] }, { order: 2, part: 'mecanismo_dano' }],
      next: 'buscar_ayuda', content: {},
    })
    expect(p.sequence?.[0]?.part).toBe('seguridad')
    expect(p.next).toBe('buscar_ayuda')
  })
  it('accepts a practical rule with letter', () => {
    expect(PracticalRuleSchema.parse({ id: 'x', rule: 'r', concept: 'habcde', letter: 'A' }).letter).toBe('A')
  })
  it('carries vitalSigns.reevaluacion', () => {
    const vs = VitalSignsSchema.parse({ reevaluacion: { estable: '15-20 min', inestable: '5 min' } })
    expect((vs.reevaluacion as Record<string, string>).estable).toBe('15-20 min')
  })
})
```

- [ ] **Step 2: Run it**

Run: `./node_modules/.bin/vitest run -- schemas-content`
Expected: FAIL (sequence/next/letter/reevaluacion not in schema).

- [ ] **Step 3: Implement** — in `src/shared/content/schemas.ts`, replace `ChainPhaseSchema`, `VitalSignsSchema`, `PracticalRuleSchema`:

```ts
export const ChainPhaseSchema = z.object({
  phase: PhaseIdSchema,
  name: z.string().min(1),
  rationale: z.string().min(1),
  refAcronym: z.string().optional(),
  strictOrder: z.boolean().optional(),
  sequence: z
    .array(
      z.object({
        order: z.number(),
        part: z.string().min(1),
        priority: z.boolean().optional(),
        includes: z.array(z.string()).optional(),
      }),
    )
    .optional(),
  next: z.string().optional(),
  content: z.record(z.unknown()),
})

export const VitalSignsSchema = z
  .object({
    components: z.array(z.string()).optional(),
    respiratoryRate: z.record(z.unknown()).optional(),
    heartRate: z.record(z.unknown()).optional(),
    bloodPressure: z.record(z.unknown()).optional(),
    skin: z.record(z.unknown()).optional(),
    capillaryRefill: z.record(z.unknown()).optional(),
    reevaluacion: z.record(z.unknown()).optional(),
  })
  .passthrough()

export const PracticalRuleSchema = z.object({
  id: z.string().min(1),
  rule: z.string().min(1),
  concept: z.string().min(1),
  letter: z.string().min(1).max(2).optional(),
})
```

- [ ] **Step 4: Run it**

Run: `./node_modules/.bin/vitest run -- schemas-content`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
/usr/bin/git add src/shared/content/schemas.ts tests/shared/content/schemas-content.test.ts
/usr/bin/git commit -m "feat(content): schema for scene sequence/next, rule letter, vitals reevaluacion"
```

---

## Task 3: Mapper + build-content for the new keys

**Files:**
- Modify: `src/shared/content/mapping.ts`, `scripts/build-content.ts`
- Test: `tests/shared/content/mapping.test.ts` (append)

- [ ] **Step 1: Write the failing test** — append to `tests/shared/content/mapping.test.ts`

```ts
import { mapPracticalRule } from '@/shared/content/mapping'

describe('fixes mapping', () => {
  it('maps secuencia → sequence and luego → next', () => {
    const out = mapChainPhase({
      fase: 'escena', nombre: 'Escena', racional: 'r', orden_estricto: true,
      secuencia: [{ orden: 1, parte: 'seguridad', prioridad: true, incluye: ['bioseguridad'] }],
      luego: 'buscar_ayuda', contenido: { seguridad: {} },
    })
    expect(out.sequence).toEqual([{ order: 1, part: 'seguridad', priority: true, includes: ['bioseguridad'] }])
    expect(out.next).toBe('buscar_ayuda')
  })
  it('maps regla.letra → letter (omitted when absent)', () => {
    expect(mapPracticalRule({ id: 'x', regla: 'r', concepto: 'habcde', letra: 'A' })).toEqual({ id: 'x', rule: 'r', concept: 'habcde', letter: 'A' })
    expect('letter' in mapPracticalRule({ id: 'y', regla: 'r', concepto: 'secundaria' })).toBe(false)
  })
})
```

- [ ] **Step 2: Run it**

Run: `./node_modules/.bin/vitest run -- mapping`
Expected: FAIL.

- [ ] **Step 3: Implement** — in `src/shared/content/mapping.ts`, replace `mapChainPhase` and `mapPracticalRule`:

```ts
export function mapChainPhase(p: any) {
  const phase = PHASE_MAP[p.fase]
  if (!phase) throw new Error(`Unknown phase: ${p.fase}`)
  return {
    phase,
    name: p.nombre,
    rationale: p.racional,
    ...(p.orden_estricto ? { strictOrder: true } : {}),
    ...(p.ref_sigla ? { refAcronym: p.ref_sigla } : {}),
    ...(p.secuencia
      ? {
          sequence: p.secuencia.map((s: any) => ({
            order: s.orden,
            part: s.parte,
            ...(s.prioridad ? { priority: true } : {}),
            ...(s.incluye ? { includes: s.incluye } : {}),
          })),
        }
      : {}),
    ...(p.luego ? { next: p.luego } : {}),
    content: p.contenido ?? {},
  }
}

export function mapPracticalRule(r: any) {
  return {
    id: r.id,
    rule: r.regla,
    concept: r.concepto,
    ...(r.letra ? { letter: r.letra } : {}),
  }
}
```

- [ ] **Step 4: Carry `reevaluacion`** — in `scripts/build-content.ts`, replace `anglicizeVitals`:

```ts
function anglicizeVitals(v: any) {
  return {
    components: v.componentes,
    respiratoryRate: v.frecuencia_respiratoria,
    heartRate: v.frecuencia_cardiaca,
    bloodPressure: v.presion_arterial,
    skin: v.piel,
    capillaryRefill: v.relleno_capilar,
    reevaluacion: v.reevaluacion,
  }
}
```

- [ ] **Step 5: Run tests + rebuild content**

Run: `./node_modules/.bin/vitest run -- mapping && ./node_modules/.bin/tsx scripts/build-content.ts`
Expected: tests PASS; `✓ content built`. Then confirm the generated JSON carries the new keys:
`node -e "const c=require('./src/shared/content/generated/content.json'); const s=c.chain.find(p=>p.phase==='scene'); console.log(JSON.stringify(s.sequence), s.next, c.vitalSigns.reevaluacion, c.practicalRules.find(r=>r.id==='hemorragia').letter)"`
Expected: prints the sequence array, `buscar_ayuda`, the reevaluacion object, and `H`.

- [ ] **Step 6: Commit**

```bash
/usr/bin/git add src/shared/content/mapping.ts scripts/build-content.ts tests/shared/content/mapping.test.ts
/usr/bin/git commit -m "feat(content): map scene sequence/next, rule letter; carry vitals reevaluacion"
```

---

## Task 4: Model types + fixture enrichment

**Files:**
- Modify: `src/modules/learn/domain/chainModel.ts` (types only this task)
- Modify: `tests/fixtures/content.fixture.ts`

- [ ] **Step 1: Extend the model types** — in `src/modules/learn/domain/chainModel.ts`, replace the `NodeItem`, `NodeKind`, and `ChainNode` declarations:

```ts
export interface NodeItem {
  label: string
  detail: string
  why?: string
  heading?: string
}

export type NodeKind = 'acronymLetter' | 'acronym' | 'topic' | 'reference' | 'bridge'

export interface ChainNode {
  id: string
  phase: PhaseId
  title: string
  subtitle?: string
  icon?: ConceptIcon
  letter?: string
  order?: number
  priority?: boolean
  kind: NodeKind
  items: NodeItem[]
  rationaleId?: string
}
```

- [ ] **Step 2: Enrich the fixture** — in `tests/fixtures/content.fixture.ts`, update the `scene` chain entry, `vitalSigns`, and `practicalRules` of `validContent`:

Replace the `scene` chain entry with:
```ts
    {
      phase: 'scene',
      name: 'Escena',
      rationale: 'Seguridad primero.',
      strictOrder: true,
      sequence: [
        { order: 1, part: 'seguridad', priority: true, includes: ['bioseguridad'] },
        { order: 2, part: 'mecanismo_dano' },
        { order: 4, part: 'impresion_general' },
      ],
      next: 'buscar_ayuda',
      content: {
        seguridad: { regla: 'Deténgase y piense.', riesgos: ['Clima', 'Rocas'] },
        bioseguridad: { definicion: 'Evitar contagio.', epp: ['Guantes', 'Antiparras'] },
        mecanismo_dano: { definicion: 'Estimar causa.', regla: 'Alta energía → columna.' },
        impresion_general: { ref_sigla: 'tev' },
        buscar_ayuda: 'Delegá la llamada.',
      },
    },
```

Replace `vitalSigns` with:
```ts
  vitalSigns: {
    components: ['Frecuencia cardíaca'],
    heartRate: { adulto: '60-100' },
    respiratoryRate: { adulto: '12-20' },
    bloodPressure: { normal: '120/80 mmHg' },
    capillaryRefill: { normal: '< 2 segundos' },
    reevaluacion: { estable: '15-20 min', inestable: '5 min' },
  },
```

Replace `practicalRules` with:
```ts
  practicalRules: [
    { id: 'hemorragia', rule: 'Presión directa.', concept: 'habcde', letter: 'H' },
    { id: 'via-con-trauma', rule: 'Subluxación mandibular.', concept: 'habcde', letter: 'A' },
    { id: 'no-comer-beber', rule: 'Nada por boca.', concept: 'secundaria' },
  ],
```

Add a `tev` acronym to the `acronyms` array (the fixture's scene impression resolves it):
```ts
    {
      id: 'tev',
      acronym: 'TEV',
      name: 'Triángulo de Evaluación Vital',
      concept: 'escena',
      isSequence: false,
      components: [{ name: 'Respiración', detail: 'Movimientos, postura.' }],
      rationale: 'Evaluación rápida sin tocar.',
    },
```

- [ ] **Step 3: Verify typecheck + existing tests still pass**

Run: `./node_modules/.bin/tsc --noEmit -p tsconfig.json && ./node_modules/.bin/vitest run`
Expected: tsc exit 0; tests pass (chainModel still uses old scene code, but the new fixture fields are additive — note the old `chainModel.test.ts` scene assertions may need the next task; if a scene test breaks here, it is replaced in Task 5).

> If the existing `chainModel.test.ts` `sceneNodes` test breaks because the fixture scene content changed shape, that is expected — Task 5 rewrites the scene projection and its tests. You may temporarily `it.skip` the single failing scene test with a `// rewritten in Task 5` comment, or proceed straight to Task 5 in the same session.

- [ ] **Step 4: Commit**

```bash
/usr/bin/git add src/modules/learn/domain/chainModel.ts tests/fixtures/content.fixture.ts
/usr/bin/git commit -m "feat(learn): model order/priority/bridge/heading; enrich fixture"
```

---

## Task 5: Scene ordered projection (P1)

**Files:**
- Modify: `src/modules/learn/domain/chainModel.ts` (replace `sceneNodes`)
- Test: `tests/modules/learn/chainModel.test.ts` (replace scene assertions)

- [ ] **Step 1: Write the failing test** — replace any existing scene test in `tests/modules/learn/chainModel.test.ts` with:

```ts
describe('scene ordered projection', () => {
  const model = buildChainModel(validContent)
  const scene = model.find(p => p.id === 'scene')!

  it('orders parts by sequence with numeric order + priority on safety', () => {
    expect(scene.nodes.map(n => n.id)).toEqual([
      'scene-safety', 'scene-mechanism', 'scene-impression', 'scene-help',
    ])
    const safety = scene.nodes[0]!
    expect(safety.order).toBe(1)
    expect(safety.priority).toBe(true)
  })

  it('nests bioseguridad inside the safety node (not a separate node)', () => {
    const safety = scene.nodes[0]!
    expect(scene.nodes.some(n => n.id === 'scene-biosafety')).toBe(false)
    const bio = safety.items.find(it => it.heading === 'Bioseguridad')
    expect(bio).toBeTruthy()
    expect(bio?.detail).toContain('Guantes')
  })

  it('makes buscar_ayuda a non-numbered bridge node', () => {
    const help = scene.nodes.find(n => n.id === 'scene-help')!
    expect(help.kind).toBe('bridge')
    expect(help.order).toBeUndefined()
    expect(help.items[0]?.detail).toBe('Delegá la llamada.')
  })

  it('resolves impresion_general via TEV', () => {
    const imp = scene.nodes.find(n => n.id === 'scene-impression')!
    expect(imp.rationaleId).toBe('tev')
    expect(imp.items[0]?.label).toBe('Respiración')
  })
})
```

- [ ] **Step 2: Run it**

Run: `./node_modules/.bin/vitest run -- chainModel`
Expected: FAIL.

- [ ] **Step 3: Implement** — in `src/modules/learn/domain/chainModel.ts`, replace the entire `sceneNodes` function (and add the helpers above it):

```ts
// --- scene helpers (P1) ---
function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

// string → as-is; string[] → joined; else '' (filtered out).
function asDetail(v: unknown): string {
  if (typeof v === 'string') return v
  if (Array.isArray(v)) return v.filter(x => typeof x === 'string').join(' · ')
  return ''
}

function fieldItems(source: Record<string, unknown>, fields: Array<[string, string]>): NodeItem[] {
  return fields
    .map(([key, label]): NodeItem => ({ label, detail: asDetail(source[key]) }))
    .filter(it => it.detail !== '')
}

function withHeading(items: NodeItem[], heading: string): NodeItem[] {
  return items.map((it, i) => (i === 0 ? { ...it, heading } : it))
}

interface ScenePartDef {
  id: string
  title: string
  fields: Array<[string, string]>
}

const SCENE_PART_DEFS: Record<string, ScenePartDef> = {
  seguridad: {
    id: 'scene-safety',
    title: 'Seguridad de la escena',
    fields: [
      ['regla', 'Regla'],
      ['riesgos', 'Riesgos de la escena'],
    ],
  },
  mecanismo_dano: {
    id: 'scene-mechanism',
    title: 'Mecanismo de daño',
    fields: [
      ['definicion', 'Qué es'],
      ['evaluar', 'Qué evaluar'],
      ['sospechar_lesiones_graves', 'Sospechar lesiones graves'],
      ['regla', 'Regla'],
    ],
  },
  numero_victimas: {
    id: 'scene-victims',
    title: 'Número de víctimas',
    fields: [
      ['definicion', 'Qué es'],
      ['triage', 'Triage'],
      ['nota', 'Nota'],
    ],
  },
}

const BIOSAFETY_FIELDS: Array<[string, string]> = [
  ['definicion', 'Qué es'],
  ['epp', 'Equipo de protección (EPP)'],
  ['transmision_sangre', 'Transmisión por sangre'],
  ['transmision_aire', 'Transmisión por aire'],
  ['lavado_manos', 'Lavado de manos'],
]

function sceneImpressionNode(
  content: Content,
  c: Record<string, unknown>,
  order: number,
): ChainNode | null {
  const ref = isRecord(c.impresion_general) ? c.impresion_general.ref_sigla : undefined
  if (typeof ref !== 'string') return null
  const a = acronymById(content, ref)
  if (!a?.components) return null
  return {
    id: 'scene-impression',
    phase: 'scene',
    title: 'Impresión general',
    subtitle: a.name,
    order,
    kind: 'topic',
    items: a.components.map(comp => ({ label: comp.name, detail: comp.detail })),
    rationaleId: a.id,
  }
}

// Scene phase is an ordered sequence (spec §4.2). Each `sequence` entry names a
// `part`; its content sub-object becomes one numbered node. `includes` nests a
// sub-part (bioseguridad) inside the node. `next` adds a non-numbered bridge.
function sceneNodes(content: Content): ChainNode[] {
  const phase = content.chain.find(p => p.phase === 'scene')
  if (!phase) return []
  const c = phase.content as Record<string, unknown>
  const sequence = (phase.sequence ?? []).slice().sort((a, b) => a.order - b.order)
  const nodes: ChainNode[] = []

  for (const part of sequence) {
    if (part.part === 'impresion_general') {
      const n = sceneImpressionNode(content, c, part.order)
      if (n) nodes.push(n)
      continue
    }
    const def = SCENE_PART_DEFS[part.part]
    const source = c[part.part]
    if (!def || !isRecord(source)) continue
    let items = fieldItems(source, def.fields)
    for (const inc of part.includes ?? []) {
      if (inc === 'bioseguridad' && isRecord(c.bioseguridad)) {
        items = items.concat(withHeading(fieldItems(c.bioseguridad, BIOSAFETY_FIELDS), 'Bioseguridad'))
      }
    }
    if (items.length === 0) continue
    nodes.push({
      id: def.id,
      phase: 'scene',
      title: def.title,
      order: part.order,
      kind: 'topic',
      items,
      ...(part.priority ? { priority: true } : {}),
      rationaleId: 'scene',
    })
  }

  const next = phase.next
  if (typeof next === 'string' && typeof c[next] === 'string') {
    nodes.push({
      id: 'scene-help',
      phase: 'scene',
      title: 'Buscar ayuda',
      kind: 'bridge',
      items: [{ label: 'Buscar ayuda', detail: c[next] as string }],
    })
  }

  return nodes
}
```

- [ ] **Step 4: Run it**

Run: `./node_modules/.bin/vitest run -- chainModel && ./node_modules/.bin/tsc --noEmit -p tsconfig.json`
Expected: PASS; tsc exit 0.

- [ ] **Step 5: Commit**

```bash
/usr/bin/git add src/modules/learn/domain/chainModel.ts tests/modules/learn/chainModel.test.ts
/usr/bin/git commit -m "feat(learn): ordered scene projection with nested bioseguridad + bridge (P1)"
```

---

## Task 6: Vital values (P2), rules-on-letters (P3), position-on-evac (P4)

**Files:**
- Modify: `src/modules/learn/domain/chainModel.ts`
- Test: `tests/modules/learn/chainModel.test.ts` (append)

- [ ] **Step 1: Write the failing test** — append:

```ts
describe('vital values / rules / position', () => {
  const model = buildChainModel(validContent)

  it('vital-signs node shows values incl. reevaluación', () => {
    const vs = model.find(p => p.id === 'secondary')!.nodes.find(n => n.id === 'secondary-vital-signs')!
    const byLabel = (l: string) => vs.items.find(i => i.label === l)?.detail
    expect(byLabel('Frecuencia cardíaca')).toBe('60-100')
    expect(byLabel('Frecuencia respiratoria')).toBe('12-20')
    expect(byLabel('Reevaluación')).toContain('estable 15-20 min')
  })

  it('HABCDE letter nodes carry their rules under "Reglas clave"', () => {
    const primary = model.find(p => p.id === 'primary')!
    const h = primary.nodes.find(n => n.letter === 'H')!
    const rule = h.items.find(i => i.heading === 'Reglas clave')
    expect(rule?.detail).toContain('Presión directa')
    const a = primary.nodes.find(n => n.letter === 'A')!
    expect(a.items.some(i => i.detail.includes('Subluxación'))).toBe(true)
  })

  it('letterless rules go to a secondary "Reglas clave" node', () => {
    const sec = model.find(p => p.id === 'secondary')!
    const rulesNode = sec.nodes.find(n => n.id === 'secondary-rules')!
    expect(rulesNode.items[0]?.detail).toBe('Nada por boca.')
  })

  it('evacuation node lists victim positions', () => {
    const evac = model.find(p => p.id === 'evacuation')!.nodes[0]!
    const pos = evac.items.find(i => i.heading === 'Posición de la víctima')
    expect(pos?.detail).toBe('La más confortable.')
  })
})
```

- [ ] **Step 2: Run it**

Run: `./node_modules/.bin/vitest run -- chainModel`
Expected: FAIL.

- [ ] **Step 3: Implement** — in `src/modules/learn/domain/chainModel.ts`:

(a) Add helpers (near the other helpers):
```ts
// --- vital signs values (P2) ---
function reevalText(r?: Record<string, unknown>): string | undefined {
  if (!r) return undefined
  const parts: string[] = []
  if (typeof r.estable === 'string') parts.push(`estable ${r.estable}`)
  if (typeof r.inestable === 'string') parts.push(`inestable ${r.inestable}`)
  return parts.length ? parts.join(' · ') : undefined
}

function vitalSignItems(vs: Content['vitalSigns']): NodeItem[] {
  const v = vs as Record<string, Record<string, unknown> | undefined>
  const rows: Array<[string, unknown]> = [
    ['Frecuencia respiratoria', v.respiratoryRate?.adulto],
    ['Frecuencia cardíaca', v.heartRate?.adulto],
    ['Presión arterial', v.bloodPressure?.normal],
    ['Relleno capilar', v.capillaryRefill?.normal],
    ['Reevaluación', reevalText(v.reevaluacion)],
  ]
  return rows
    .filter((r): r is [string, string] => typeof r[1] === 'string')
    .map(([label, detail]) => ({ label, detail }))
}

// --- practical rules (P3) ---
function rulesForLetter(content: Content, letter: string): NodeItem[] {
  return content.practicalRules
    .filter(r => r.letter === letter)
    .map((r, i): NodeItem => ({ label: 'Regla', detail: r.rule, ...(i === 0 ? { heading: 'Reglas clave' } : {}) }))
}
```

(b) Replace `primaryNodes` so each letter node appends its rules:
```ts
function primaryNodes(content: Content): ChainNode[] {
  const habcde = acronymById(content, 'habcde')
  if (!habcde?.letters) return []
  return habcde.letters.map(l => ({
    id: `primary-habcde-${l.letter.toLowerCase()}`,
    phase: 'primary' as const,
    title: l.meaning,
    subtitle: `Paso ${l.letter} de HABCDE`,
    letter: l.letter,
    kind: 'acronymLetter' as const,
    items: [{ label: l.meaning, detail: l.detail }, ...rulesForLetter(content, l.letter)],
    rationaleId: habcde.id,
  }))
}
```

(c) Replace the WHOLE `secondaryNodes` function — vital-signs node now shows values, and letterless rules get their own node:
```ts
function secondaryNodes(content: Content): ChainNode[] {
  const wanted: Array<[string, ConceptIcon]> = [
    ['avdn', 'consciousness'],
    ['muestra', 'history'],
    ['dias', 'physicalExam'],
    ['pilar', 'pupils'],
  ]
  const nodes: ChainNode[] = []
  nodes.push({
    id: 'secondary-vital-signs',
    phase: 'secondary',
    title: 'Signos vitales',
    subtitle: 'FC · FR · temperatura',
    icon: 'vitalSigns',
    kind: 'topic',
    items: vitalSignItems(content.vitalSigns),
    rationaleId: 'secondary',
  })
  for (const [id, icon] of wanted) {
    const n = acronymNode(content, id, icon)
    if (n) nodes.push(n)
  }
  const looseRules = content.practicalRules.filter(r => !r.letter)
  if (looseRules.length) {
    nodes.push({
      id: 'secondary-rules',
      phase: 'secondary',
      title: 'Reglas clave',
      kind: 'topic',
      rationaleId: 'secondary',
      items: looseRules.map(r => ({ label: 'Regla', detail: r.rule })),
    })
  }
  return nodes
}
```

(d) Replace `evacuationNodes` to append positions:
```ts
function evacuationNodes(content: Content): ChainNode[] {
  const levelItems: NodeItem[] = content.evacLevels.map(e => ({ label: e.level, detail: e.criterion }))
  const positionItems: NodeItem[] = (content.positions ?? []).map((p, i) => ({
    label: p.situation,
    detail: p.position,
    ...(i === 0 ? { heading: 'Posición de la víctima' } : {}),
  }))
  return [
    {
      id: 'evacuation-decision',
      phase: 'evacuation',
      title: 'Decisión de evacuación',
      subtitle: 'CRÍTICO · GRAVE · LEVE',
      icon: 'evacuation',
      kind: 'reference',
      items: [...levelItems, ...positionItems],
      rationaleId: 'evacuation',
    },
  ]
}
```

- [ ] **Step 4: Run it + rebuild**

Run: `./node_modules/.bin/vitest run -- chainModel && ./node_modules/.bin/tsc --noEmit -p tsconfig.json && ./node_modules/.bin/tsx scripts/build-content.ts --check`
Expected: PASS; tsc 0; `✓ content valid`.

- [ ] **Step 5: Commit**

```bash
/usr/bin/git add src/modules/learn/domain/chainModel.ts tests/modules/learn/chainModel.test.ts
/usr/bin/git commit -m "feat(learn): vital values (P2), rules on letters (P3), position on evac (P4)"
```

---

## Task 7: StepBadge component + `help` icon

**Files:**
- Create: `src/shared/ui/components/StepBadge.tsx`, `src/shared/ui/components/StepBadge.module.css`
- Modify: `src/shared/ui/icons.ts`
- Test: `tests/shared/ui/step-badge.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StepBadge } from '@/shared/ui/components/StepBadge'

describe('StepBadge', () => {
  it('renders the number with an aria-label', () => {
    render(<StepBadge n={2} />)
    const el = screen.getByLabelText('Paso 2')
    expect(el).toHaveTextContent('2')
  })
})
```

- [ ] **Step 2: Run it**

Run: `./node_modules/.bin/vitest run -- step-badge`
Expected: FAIL.

- [ ] **Step 3: Implement** `StepBadge.module.css`

```css
.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid var(--primary);
  color: var(--primary);
  border-radius: 50%;
  font-family: var(--font-sans);
  font-weight: 700;
}
.md { width: 24px; height: 24px; font-size: 12px; flex: 0 0 24px; }
.lg { width: 44px; height: 44px; font-size: 20px; }
```

`StepBadge.tsx`

```tsx
import styles from './StepBadge.module.css'

export function StepBadge({ n, size = 'md' }: { n: number; size?: 'md' | 'lg' }) {
  return (
    <span className={`${styles.badge} ${styles[size]}`} aria-label={`Paso ${n}`}>
      {n}
    </span>
  )
}
```

- [ ] **Step 4: Add the `help` icon** — in `src/shared/ui/icons.ts`, add `PhoneCall` to the import, the `'help'` member to the `ConceptIcon` union, and `help: PhoneCall` to `ICONS`:

```ts
import {
  AlertTriangle, Droplet, Wind, Activity, HeartPulse, Brain, Thermometer,
  Gauge, Eye, ClipboardList, Search, Circle, Siren, PhoneCall, type LucideIcon,
} from 'lucide-react'

export type ConceptIcon =
  | 'scene' | 'hemorrhage' | 'airway' | 'breathing' | 'circulation' | 'deficit'
  | 'exposure' | 'vitalSigns' | 'consciousness' | 'history' | 'physicalExam'
  | 'pupils' | 'evacuation' | 'help'

export const ICONS: Record<ConceptIcon, LucideIcon> = {
  scene: AlertTriangle, hemorrhage: Droplet, airway: Wind, breathing: Activity,
  circulation: HeartPulse, deficit: Brain, exposure: Thermometer, vitalSigns: Gauge,
  consciousness: Eye, history: ClipboardList, physicalExam: Search, pupils: Circle,
  evacuation: Siren, help: PhoneCall,
}
```

- [ ] **Step 5: Run it**

Run: `./node_modules/.bin/vitest run -- step-badge && ./node_modules/.bin/tsc --noEmit -p tsconfig.json`
Expected: PASS; tsc 0.

- [ ] **Step 6: Commit**

```bash
/usr/bin/git add src/shared/ui/components/StepBadge.tsx src/shared/ui/components/StepBadge.module.css src/shared/ui/icons.ts tests/shared/ui/step-badge.test.tsx
/usr/bin/git commit -m "feat(ui): add StepBadge (ring number) and help icon"
```

---

## Task 8: ExpandableItem heading + NodeCard (StepBadge/priority/bridge) + connector

**Files:**
- Modify: `src/modules/learn/ui/ExpandableItem.tsx`, `.module.css`
- Modify: `src/modules/learn/ui/NodeCard.tsx`, `.module.css`
- Modify: `src/modules/learn/ui/PhaseTimeline.tsx`
- Test: `tests/modules/learn/ui.test.tsx` (append)

- [ ] **Step 1: Write the failing test** — append to `tests/modules/learn/ui.test.tsx`

```tsx
import type { ChainNode } from '@/modules/learn/domain/chainModel'

describe('fixes ui', () => {
  it('ExpandableItem renders a heading when present', () => {
    render(<ExpandableItem item={{ label: 'Qué es', detail: 'x', heading: 'Bioseguridad' }} />)
    expect(screen.getByText('Bioseguridad')).toBeInTheDocument()
  })

  it('NodeCard renders a StepBadge + priority marker for an ordered node', () => {
    const node: ChainNode = {
      id: 'scene-safety', phase: 'scene', title: 'Seguridad', order: 1, priority: true,
      kind: 'topic', items: [], rationaleId: 'scene',
    }
    render(<HashRouter><NodeCard node={node} /></HashRouter>)
    expect(screen.getByLabelText('Paso 1')).toBeInTheDocument()
    expect(screen.getByText('prioridad')).toBeInTheDocument()
  })

  it('NodeCard renders the bridge variant with the help icon', () => {
    const node: ChainNode = { id: 'scene-help', phase: 'scene', title: 'Buscar ayuda', kind: 'bridge', items: [] }
    const { container } = render(<HashRouter><NodeCard node={node} /></HashRouter>)
    expect(container.querySelector('svg')).toBeTruthy()
    expect(screen.getByRole('link', { name: /Buscar ayuda/i })).toHaveAttribute('href', '#/chain/scene-help')
  })
})
```
(Ensure `HashRouter` and `ExpandableItem` are imported at the top of the file alongside the existing imports.)

- [ ] **Step 2: Run it**

Run: `./node_modules/.bin/vitest run -- learn/ui`
Expected: FAIL.

- [ ] **Step 3: Implement `ExpandableItem`** — `ExpandableItem.module.css` add:

```css
.heading {
  font-family: var(--font-sans);
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--muted);
  font-weight: 600;
  margin: var(--space-3) 0 var(--space-1);
}
```

`ExpandableItem.tsx`:

```tsx
import styles from './ExpandableItem.module.css'

import type { NodeItem } from '@/modules/learn/domain/chainModel'

export function ExpandableItem({ item }: { item: NodeItem }) {
  return (
    <div className={styles.item}>
      {item.heading && <p className={styles.heading}>{item.heading}</p>}
      <p className={styles.label}>{item.label}</p>
      {item.detail && <p className={styles.detail}>{item.detail}</p>}
      {item.why && <p className={styles.why}>{item.why}</p>}
    </div>
  )
}
```

- [ ] **Step 4: Implement `NodeCard`** — `NodeCard.module.css` add:

```css
.prio {
  display: inline-block;
  margin-left: var(--space-2);
  padding: 1px 6px;
  border-radius: var(--radius-pill);
  background: var(--primary);
  color: var(--on-critical);
  font-family: var(--font-sans);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  vertical-align: middle;
}
.bridge {
  border-style: dashed;
  background: transparent;
}
.connector {
  text-align: center;
  color: var(--border);
  margin: 0;
  line-height: 1;
}
```

`NodeCard.tsx`:

```tsx
import { Link } from 'react-router-dom'

import styles from './NodeCard.module.css'

import type { ChainNode } from '@/modules/learn/domain/chainModel'
import { Icon } from '@/shared/ui/components/Icon'
import { LetterBadge } from '@/shared/ui/components/LetterBadge'
import { StepBadge } from '@/shared/ui/components/StepBadge'

export function NodeCard({ node }: { node: ChainNode }) {
  const lead =
    node.kind === 'bridge' ? (
      <span className={styles.iconBox}>
        <Icon concept="help" />
      </span>
    ) : node.order != null ? (
      <StepBadge n={node.order} />
    ) : node.letter ? (
      <LetterBadge letter={node.letter} />
    ) : node.icon ? (
      <span className={styles.iconBox}>
        <Icon concept={node.icon} />
      </span>
    ) : null

  return (
    <Link to={`/chain/${node.id}`} className={`${styles.card} ${node.kind === 'bridge' ? styles.bridge : ''}`}>
      {lead}
      <span className={styles.body}>
        <p className={styles.title}>
          {node.title}
          {node.priority && <span className={styles.prio}>prioridad</span>}
        </p>
        {node.subtitle && <p className={styles.meta}>{node.subtitle}</p>}
      </span>
      <span className={styles.arrow} aria-hidden>
        ›
      </span>
    </Link>
  )
}
```

- [ ] **Step 5: Implement the connector in `PhaseTimeline`**

```tsx
import { Fragment } from 'react'

import { NodeCard } from './NodeCard'
import styles from './PhaseTimeline.module.css'

import type { ChainPhase } from '@/modules/learn/domain/chainModel'

export function PhaseTimeline({ phase, index }: { phase: ChainPhase; index: number }) {
  return (
    <section className={styles.phase}>
      <p className={styles.label}>Fase {index}</p>
      <h2 className={styles.title}>{phase.title}</h2>
      <div className={styles.nodes}>
        {phase.nodes.map(n => (
          <Fragment key={n.id}>
            {n.kind === 'bridge' && (
              <p className={styles.connector} aria-hidden>
                ↓
              </p>
            )}
            <NodeCard node={n} />
          </Fragment>
        ))}
      </div>
    </section>
  )
}
```
Add to `PhaseTimeline.module.css`:
```css
.connector {
  text-align: center;
  color: var(--border);
  margin: 0;
  line-height: 1;
}
```

- [ ] **Step 6: Run it**

Run: `./node_modules/.bin/vitest run -- learn/ui && ./node_modules/.bin/tsc --noEmit -p tsconfig.json`
Expected: PASS; tsc 0.

- [ ] **Step 7: Commit**

```bash
/usr/bin/git add src/modules/learn/ui/ExpandableItem.tsx src/modules/learn/ui/ExpandableItem.module.css src/modules/learn/ui/NodeCard.tsx src/modules/learn/ui/NodeCard.module.css src/modules/learn/ui/PhaseTimeline.tsx src/modules/learn/ui/PhaseTimeline.module.css tests/modules/learn/ui.test.tsx
/usr/bin/git commit -m "feat(learn): heading sub-sections; StepBadge/priority/bridge in NodeCard + connector"
```

---

## Task 9: NodeDetail hero + touch targets; contrast token

**Files:**
- Modify: `src/modules/learn/routes/NodeDetail.tsx`
- Modify: `src/shared/ui/tokens.css`
- Test: `tests/modules/learn/NodeDetail.test.tsx` (append)

- [ ] **Step 1: Write the failing test** — append to `tests/modules/learn/NodeDetail.test.tsx`

```tsx
it('renders a StepBadge + priority for an ordered scene node', () => {
  renderAt('/chain/scene-safety')
  expect(screen.getByLabelText('Paso 1')).toBeInTheDocument()
  expect(screen.getByText('prioridad')).toBeInTheDocument()
})
```
(Uses the existing `renderAt` helper + the loader mock returning `validContent`. The fixture's scene-safety node has `order: 1`, `priority: true`.)

- [ ] **Step 2: Run it**

Run: `./node_modules/.bin/vitest run -- NodeDetail`
Expected: FAIL.

- [ ] **Step 3: Implement** — in `src/modules/learn/routes/NodeDetail.tsx`, add the `StepBadge` import and update the hero + title + nav. Replace the hero block, title, and `nav`:

Add import:
```tsx
import { StepBadge } from '@/shared/ui/components/StepBadge'
```

Replace the hero `<div>` (the `node.letter ? ... : node.icon ? ...` block) with:
```tsx
      <div style={{ margin: 'var(--space-3) 0' }}>
        {node.order != null ? (
          <StepBadge n={node.order} size="lg" />
        ) : node.letter ? (
          <LetterBadge letter={node.letter} size="lg" />
        ) : node.icon ? (
          <Icon concept={node.icon} size={32} />
        ) : null}
      </div>
```

Replace the `<h1>` with a title that includes the priority marker:
```tsx
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, margin: '0 0 2px' }}>
        {node.title}
        {node.priority && (
          <span
            style={{
              marginLeft: 8, padding: '1px 6px', borderRadius: 'var(--radius-pill)',
              background: 'var(--primary)', color: 'var(--on-critical)',
              fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: 700,
              letterSpacing: '0.06em', textTransform: 'uppercase', verticalAlign: 'middle',
            }}
          >
            prioridad
          </span>
        )}
      </h1>
```

Replace the prev/next `<Link>`s with larger tap targets (≥44px):
```tsx
        {prev ? (
          <Link to={`/chain/${prev.id}`} style={{ display: 'inline-block', padding: 'var(--space-3) var(--space-2)', minHeight: 44 }}>
            ← Anterior
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link to={`/chain/${next.id}`} style={{ display: 'inline-block', padding: 'var(--space-3) var(--space-2)', minHeight: 44 }}>
            Siguiente →
          </Link>
        ) : (
          <span />
        )}
```

- [ ] **Step 4: Contrast token** — in `src/shared/ui/tokens.css`, darken `--muted`:

Change `--ink-soft: #5a4b30; --muted: #7a5f3d; --border: #d9c8a0;` to:
```css
  --ink-soft: #5a4b30; --muted: #6b5326; --border: #d9c8a0;
```

- [ ] **Step 5: Run it + gates**

Run: `./node_modules/.bin/vitest run -- NodeDetail && ./node_modules/.bin/tsc --noEmit -p tsconfig.json && ./node_modules/.bin/eslint . --max-warnings 0`
Expected: PASS; tsc 0; eslint 0.

- [ ] **Step 6: Commit**

```bash
/usr/bin/git add src/modules/learn/routes/NodeDetail.tsx src/shared/ui/tokens.css tests/modules/learn/NodeDetail.test.tsx
/usr/bin/git commit -m "feat(learn): NodeDetail StepBadge/priority + larger prev/next; darken muted for AA (P5)"
```

---

## Task 10: Full verification + visual check

**Files:** none (verification).

- [ ] **Step 1: All gates (raw binaries)**

Run, and confirm every one exits 0:
```bash
./node_modules/.bin/tsx scripts/build-content.ts --check
./node_modules/.bin/vitest run
./node_modules/.bin/tsc --noEmit -p tsconfig.json
./node_modules/.bin/tsc --noEmit -p tsconfig.node.json
./node_modules/.bin/eslint . --max-warnings 0
./node_modules/.bin/vite build
```
Expected: content valid; all tests pass; tsc/eslint clean; `dist/` built.

- [ ] **Step 2: Visual check (dev server)**

`npm run dev` (or build+preview) and confirm in the browser:
- ChainMap → Escena shows **1 Seguridad·prioridad → 2 Mecanismo → 3 Número de víctimas → 4 Impresión general** with ring number badges, then a dashed **Buscar ayuda** bridge under a `↓`.
- Open Seguridad → its detail shows Regla + Riesgos and a **Bioseguridad** sub-section (nested, not a separate map node).
- Open H → shows the hemorrhage rule under **Reglas clave**; A → airway rules.
- Secundaria → Signos vitales shows **values** (FC 60-100, FR 12-20, PA, relleno, reevaluación).
- Evacuación → shows the three levels + **Posición de la víctima**.
- Labels ("EN LÍNEA", "FASE 0") read darker (contrast); prev/next are comfortably tappable.

- [ ] **Step 3: Commit any fixes found** (skip if none)

```bash
/usr/bin/git add -A && /usr/bin/git commit -m "fix(learn): address issues from visual verification"
```

---

## Definition of Done

- `tsx scripts/build-content.ts --check`, `vitest run`, both `tsc` projects, `eslint --max-warnings 0`, `vite build` all green (raw binaries).
- P1 — scene ordered 1-4 with ring badges + priority + nested bioseguridad + bridge.
- P2 — vital-signs node shows values incl. reevaluación.
- P3 — practical rules on the matching HABCDE letter nodes (+ letterless rule on secondary).
- P4 — victim position on the evacuation node.
- P5 — ring step badge, AA contrast on muted labels, larger prev/next, no duplicate scene icons.
