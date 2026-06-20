# Módulo 3 "Escenarios" (Modo B) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Module 3 "Escenarios" (Mode B, action bank) over the 2 existing cases: tap-to-act with progressive disclosure, immediate distractor feedback, strict HABCDE order (skipping H = critical failure), an evacuation decision, and a key-feature debrief that links to Module-1 rationale — all offline.

**Architecture:** New feature-first module `src/modules/scenarios/` (`content → domain → ui → routes`). A pure engine (run state machine + scoring + debrief), clock/storage-free. Shared changes: a full `CaseSchema` + es→en `mapCase`, `conceptLinks` promoted to `shared/domain`, the Escenarios tab enabled.

**Tech Stack:** React + Vite + TypeScript, zod, react-router v6 (HashRouter), idb-keyval, Vitest + Testing Library, CSS Modules.

**Reference spec:** `docs/superpowers/specs/2026-06-20-module3-scenarios-design.md`

**RTK proxy warning:** A shell proxy can report exit 0 even when a tool failed. Run RAW binaries and trust real exit codes: `./node_modules/.bin/vitest run`, `./node_modules/.bin/tsc --noEmit -p tsconfig.json`, `./node_modules/.bin/tsc --noEmit -p tsconfig.node.json`, `./node_modules/.bin/eslint . --max-warnings 0`, `./node_modules/.bin/tsx scripts/build-content.ts --check`, `./node_modules/.bin/vite build`. Use `/usr/bin/git`.

**Conventions:** code/identifiers/files English; user-facing strings + `.yaml` content Spanish. Work on `main` (user consent). `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes` are ON — add minimal `!`/conditional-spread only where bounds are guaranteed (flag any). Generated `src/shared/content/generated/` is gitignored — never commit it.

---

## File Map

**shared (modify/create):**
- `src/shared/domain/conceptLinks.ts` (MOVED from `practice/domain`), delete `practice/domain/conceptLinks.ts`, update 3 importers.
- `src/shared/content/schemas.ts` (full `CaseSchema`), `mapping.ts` (`mapCase`), `types.ts` (export `Case`, `ScenarioPhase`).
- `scripts/integrity.ts` (`findCaseConceptDangling`) + `build-content.ts` (invoke it).
- `src/shared/domain/storage/keys.ts` (`scenariosProgress`).
- `src/shared/app/Shell.tsx` + `Shell.module.css` (Escenarios tab) + `router.tsx`.

**scenarios (create):**
- `domain/`: `engine.ts`, `scoring.ts`, `debrief.ts`, `store.ts`
- `content/selectors.ts`
- `ui/`: `PhaseStepper`, `ActionCard`, `ActionBank`, `DistractorFeedback`, `RevealCard`, `DidTrail`, `EvacuationDecision`, `Debrief` (+ `.module.css`)
- `routes/`: `ScenariosHome.tsx`, `Play.tsx`
- `index.tsx`

**tests:** mirror under `tests/` + a scenarios fixture.

---

## Task 1: Promote conceptLinks to shared

**Files:** create `src/shared/domain/conceptLinks.ts`; delete `src/modules/practice/domain/conceptLinks.ts`; update importers; tests.

- [ ] **Step 1: create the shared module** `src/shared/domain/conceptLinks.ts` (move the map + add `evacuacion`):
```ts
// concept id (from cards / case actions) → a representative Module-1 route.
const CONCEPT_TO_NODE: Record<string, string> = {
  habcde: '/chain/primary-habcde-h',
  primaria: '/chain/primary-habcde-h',
  avdn: '/chain/secondary-avdn',
  muestra: '/chain/secondary-muestra',
  dias: '/chain/secondary-dias',
  pilar: '/chain/secondary-pilar',
  shock: '/chain/secondary-vital-signs',
  signos_vitales: '/chain/secondary-vital-signs',
  secundaria: '/chain/secondary-vital-signs',
  tev: '/chain/scene-impression',
  escena: '/chain/scene-safety',
  mdd: '/chain/scene-mechanism',
  msc: '/chain/scene-mechanism',
  soap: '/quickref',
  evacuacion: '/chain/evacuation-decision',
  niveles_evacuacion: '/chain/evacuation-decision',
}

export function linkForRef(ref: string): string {
  return CONCEPT_TO_NODE[ref] ?? '/'
}
```

- [ ] **Step 2: delete the old file**
```bash
/usr/bin/git rm src/modules/practice/domain/conceptLinks.ts
```

- [ ] **Step 3: update every importer** — grep and fix:
```bash
grep -rln "@/modules/practice/domain/conceptLinks" src tests
```
Update these to `@/shared/domain/conceptLinks`:
- `src/modules/practice/ui/FeedbackPanel.tsx`
- `tests/modules/practice/concept-links.test.ts`
- `tests/modules/practice/feedback.test.tsx`

- [ ] **Step 4: run** `./node_modules/.bin/vitest run && ./node_modules/.bin/tsc --noEmit -p tsconfig.json && ./node_modules/.bin/eslint . --max-warnings 0`
Expected: all green (the moved module + updated imports; M2 feedback/concept-links tests pass against the new path).

- [ ] **Step 5: commit**
```bash
/usr/bin/git add -A
/usr/bin/git commit -m "refactor(shared): promote conceptLinks to shared/domain (M2+M3 share it)"
```

---

## Task 2: CaseSchema + mapCase + integrity guard

**Files:** `src/shared/content/schemas.ts`, `mapping.ts`, `types.ts`, `scripts/integrity.ts`, `scripts/build-content.ts`; tests `tests/shared/content/cases.test.ts`, `tests/scripts/integrity.test.ts`

- [ ] **Step 1: failing schema/mapper test** — create `tests/shared/content/cases.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { CaseSchema } from '@/shared/content/schemas'
import { mapCase } from '@/shared/content/mapping'

const rawCase = {
  id: 'c', titulo: 'T', tag: 'Trauma', contexto: 'ctx', conceptos: ['escena'],
  fases: [
    {
      id: 'primaria', estado: 'st', orden_estricto: true,
      acciones_clave: [{ id: 'H', orden: 1, texto: 'Hemorragia', critico: true, concepto: 'habcde', racional: 'r' }],
      distractores: [{ id: 'x', texto: 'mal', tipo: 'tecnica', por_que_no: 'no', concepto: 'habcde' }],
      revelaciones: [{ si_hace: 'H', revela: 'sangra' }],
      transicion: 't',
    },
    {
      id: 'evacuacion', estado: 'ev',
      decision: { correcta: 'CRÍTICO', opciones: [{ nivel: 'CRÍTICO', correcta: true, fb: 'ok' }, { nivel: 'LEVE', correcta: false, fb: 'no' }] },
    },
  ],
  debrief_modelo: ['hiciste bien'],
}

describe('CaseSchema + mapCase', () => {
  it('maps es→en and validates', () => {
    const mapped = mapCase(rawCase)
    const c = CaseSchema.parse(mapped)
    expect(c.title).toBe('T')
    expect(c.phases[0]!.id).toBe('primary')
    expect(c.phases[0]!.strictOrder).toBe(true)
    expect(c.phases[0]!.keyActions[0]).toMatchObject({ id: 'H', order: 1, text: 'Hemorragia', critical: true, concept: 'habcde', rationale: 'r' })
    expect(c.phases[0]!.distractors[0]).toMatchObject({ id: 'x', text: 'mal', type: 'tecnica', whyNot: 'no', concept: 'habcde' })
    expect(c.phases[0]!.reveals[0]).toEqual({ ifDone: 'H', text: 'sangra' })
    expect(c.phases[1]!.decision).toMatchObject({ correct: 'CRÍTICO', options: [{ level: 'CRÍTICO', correct: true, feedback: 'ok' }, { level: 'LEVE', correct: false, feedback: 'no' }] })
    expect(c.modelDebrief).toEqual(['hiciste bien'])
  })
})
```

- [ ] **Step 2: run** `./node_modules/.bin/vitest run -- cases` → FAIL.

- [ ] **Step 3: implement schema** — in `src/shared/content/schemas.ts`, REPLACE the minimal `CaseSchema`/`CasesSchema` (currently `z.object({id,title}).passthrough()`) with:
```ts
const KeyActionSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  critical: z.boolean(),
  concept: z.string().min(1),
  rationale: z.string().min(1),
  order: z.number().optional(),
})
const DistractorSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  type: z.enum(['prioridad', 'contexto', 'misconcepcion', 'tecnica', 'ineficiencia']),
  whyNot: z.string().min(1),
  concept: z.string().min(1),
})
const RevealSchema = z.object({ ifDone: z.string().min(1), text: z.string().min(1) })
const DecisionOptionSchema = z.object({ level: z.string().min(1), correct: z.boolean(), feedback: z.string().min(1) })
const DecisionSchema = z.object({ correct: z.string().min(1), options: z.array(DecisionOptionSchema).min(2) })
export const ScenarioPhaseSchema = z.object({
  id: PhaseIdSchema,
  state: z.string().min(1),
  strictOrder: z.boolean().optional(),
  keyActions: z.array(KeyActionSchema).default([]),
  distractors: z.array(DistractorSchema).default([]),
  reveals: z.array(RevealSchema).default([]),
  transition: z.string().optional(),
  decision: DecisionSchema.optional(),
})
export const CaseSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  tag: z.string().min(1),
  context: z.string().min(1),
  concepts: z.array(z.string()).default([]),
  phases: z.array(ScenarioPhaseSchema).min(1),
  modelDebrief: z.array(z.string()).default([]),
})
export const CasesSchema = z.array(CaseSchema)
```
(`PhaseIdSchema` already exists in this file — reuse it; its enum is `scene/primary/secondary/evacuation`.)

- [ ] **Step 4: implement mapper** — in `src/shared/content/mapping.ts`, REPLACE `mapCase` (reuse the existing `PHASE_MAP`):
```ts
function mapKeyAction(a: any) {
  return {
    id: a.id, text: a.texto, critical: a.critico, concept: a.concepto, rationale: a.racional,
    ...(a.orden != null ? { order: a.orden } : {}),
  }
}
function mapDistractor(d: any) {
  return { id: d.id, text: d.texto, type: d.tipo, whyNot: d.por_que_no, concept: d.concepto }
}
function mapDecision(dec: any) {
  return {
    correct: dec.correcta,
    options: (dec.opciones ?? []).map((o: any) => ({ level: o.nivel, correct: o.correcta, feedback: o.fb })),
  }
}
function mapScenarioPhase(p: any) {
  const phase = PHASE_MAP[p.id]
  if (!phase) throw new Error(`Unknown scenario phase: ${p.id}`)
  return {
    id: phase,
    state: p.estado,
    ...(p.orden_estricto != null ? { strictOrder: p.orden_estricto } : {}),
    keyActions: (p.acciones_clave ?? []).map(mapKeyAction),
    distractors: (p.distractores ?? []).map(mapDistractor),
    reveals: (p.revelaciones ?? []).map((r: any) => ({ ifDone: r.si_hace, text: r.revela })),
    ...(p.transicion ? { transition: p.transicion } : {}),
    ...(p.decision ? { decision: mapDecision(p.decision) } : {}),
  }
}
export function mapCase(c: any) {
  return {
    id: c.id,
    title: c.titulo,
    tag: c.tag,
    context: c.contexto,
    concepts: c.conceptos ?? [],
    phases: (c.fases ?? []).map(mapScenarioPhase),
    modelDebrief: c.debrief_modelo ?? [],
  }
}
```

- [ ] **Step 5: types** — in `src/shared/content/types.ts`, add imports + exports:
```ts
import { CaseSchema, ScenarioPhaseSchema } from './schemas'   // add to the existing import list
export type Case = z.infer<typeof CaseSchema>
export type ScenarioPhase = z.infer<typeof ScenarioPhaseSchema>
```

- [ ] **Step 6: failing integrity test** — append to `tests/scripts/integrity.test.ts`:
```ts
import { findCaseConceptDangling } from '../../scripts/integrity'

describe('case concept guard (M3)', () => {
  const cases = [{ phases: [{ keyActions: [{ concept: 'habcde' }], distractors: [{ concept: 'ghost' }] }] }]
  it('flags a case concept that does not resolve', () => {
    expect(findCaseConceptDangling(base, cases as any)).toContain('ghost')
  })
  it('accepts resolvable concepts (incl. the Spanish phase alias)', () => {
    // `base` has a 'primary' chain phase → its alias 'primaria' resolves via collectConceptIds.
    const ok = [{ phases: [{ keyActions: [{ concept: 'primaria' }], distractors: [{ concept: 'shock' }] }] }]
    expect(findCaseConceptDangling(base, ok as any)).toEqual([])
  })
})
```
(`base` is the existing fixture in the integrity test; it has acronyms incl. `habcde`, chain phases for aliases, and a `shock` clinicalTopic.)

- [ ] **Step 7: implement guard** — in `scripts/integrity.ts`, add:
```ts
export function findCaseConceptDangling(content: any, cases: any[]): string[] {
  const known = new Set(collectConceptIds(content))
  const dangling: string[] = []
  for (const c of cases ?? []) {
    for (const ph of c.phases ?? []) {
      for (const a of ph.keyActions ?? []) if (a.concept && !known.has(a.concept)) dangling.push(a.concept)
      for (const d of ph.distractors ?? []) if (d.concept && !known.has(d.concept)) dangling.push(d.concept)
    }
  }
  return dangling.filter((v, i, arr) => arr.indexOf(v) === i)
}
```
Wire into `scripts/build-content.ts`: the cases are mapped+validated in `main()`. After `casesResult`, run the guard against `content` + `casesResult.data`:
```ts
import { findDuplicateIds, findDanglingRefs, findElegirWithoutOptions, findCaseConceptDangling } from './integrity'
// in main(), after casesResult is validated:
  const caseDangling = findCaseConceptDangling(content, casesResult.data)
  if (caseDangling.length) fail(caseDangling.map(c => `  Dangling case concept: ${c}`).join('\n'))
```

- [ ] **Step 8: run tests + build** `./node_modules/.bin/vitest run -- "cases|integrity" && ./node_modules/.bin/tsx scripts/build-content.ts --check`
Expected: tests PASS; `✓ content valid` (the 2 real cases now type-validate AND all their concepts resolve). Confirm the generated cases.json is anglicized:
`node -e "const c=require('./src/shared/content/generated/cases.json'); console.log(c.length, c[0].phases[1].id, c[0].phases.find(p=>p.id==='primary').keyActions[0].critical)"`
Expected: `2 primary true`.

- [ ] **Step 9: commit**
```bash
/usr/bin/git add src/shared/content/schemas.ts src/shared/content/mapping.ts src/shared/content/types.ts scripts/integrity.ts scripts/build-content.ts tests/shared/content/cases.test.ts tests/scripts/integrity.test.ts
/usr/bin/git commit -m "feat(content): full CaseSchema + es→en mapCase + case-concept guard (M3)"
```

---

## Task 3: Engine — startRun, act, reveals, strict order, remainingBank

**Files:** `src/modules/scenarios/domain/engine.ts`; test `tests/modules/scenarios/engine.test.ts`

- [ ] **Step 1: failing test**
```ts
import { describe, it, expect } from 'vitest'
import { startRun, act, remainingBank, currentPhase } from '@/modules/scenarios/domain/engine'
import type { Case } from '@/shared/content/types'

const c: Case = {
  id: 'c', title: 'T', tag: 'Trauma', context: 'x', concepts: [], modelDebrief: [],
  phases: [
    {
      id: 'primary', state: 's', strictOrder: true,
      keyActions: [
        { id: 'H', order: 1, text: 'H', critical: true, concept: 'habcde', rationale: 'r' },
        { id: 'A', order: 2, text: 'A', critical: true, concept: 'habcde', rationale: 'r' },
      ],
      distractors: [{ id: 'frente', text: 'frente-menton', type: 'tecnica', whyNot: 'no', concept: 'habcde' }],
      reveals: [{ ifDone: 'H', text: 'sangra a chorro' }],
    },
  ],
}

describe('engine act', () => {
  it('logs a key action in order as correct and fires its reveal', () => {
    const r0 = startRun('c')
    const { run } = act(c, r0, 'H')
    expect(run.log[0]).toMatchObject({ id: 'H', kind: 'key', critical: true, correct: true })
    expect(run.revealedTexts).toContain('sangra a chorro')
  })
  it('distractor returns immediate feedback, correct:false', () => {
    const { run, feedback } = act(c, startRun('c'), 'frente')
    expect(run.log[0]).toMatchObject({ id: 'frente', kind: 'distractor', correct: false })
    expect(feedback).toEqual({ type: 'tecnica', whyNot: 'no' })
  })
  it('strict order: A before H → outOfOrder + skippedCritical', () => {
    const { run } = act(c, startRun('c'), 'A')
    expect(run.log[0]).toMatchObject({ id: 'A', correct: false, outOfOrder: true, skippedCritical: true })
  })
  it('act twice on same id is a no-op', () => {
    const { run } = act(c, act(c, startRun('c'), 'H').run, 'H')
    expect(run.log.filter(r => r.id === 'H')).toHaveLength(1)
  })
  it('remainingBank excludes logged ids, deterministic by id', () => {
    const { run } = act(c, startRun('c'), 'H')
    expect(remainingBank(c, run).map(a => a.id)).toEqual(['A', 'frente'])
  })
})
```

- [ ] **Step 2: run** `./node_modules/.bin/vitest run -- scenarios/engine` → FAIL.

- [ ] **Step 3: implement** `src/modules/scenarios/domain/engine.ts`:
```ts
import type { Case, ScenarioPhase } from '@/shared/content/types'

type KeyAction = ScenarioPhase['keyActions'][number]
type Distractor = ScenarioPhase['distractors'][number]

export interface ActionRecord {
  id: string
  kind: 'key' | 'distractor'
  critical: boolean
  correct: boolean
  outOfOrder?: boolean
  skippedCritical?: boolean
}
export interface RunState {
  caseId: string
  phaseIndex: number
  log: ActionRecord[]
  revealedTexts: string[]
  decision?: string
}

export function startRun(caseId: string): RunState {
  return { caseId, phaseIndex: 0, log: [], revealedTexts: [] }
}

export function currentPhase(c: Case, run: RunState): ScenarioPhase {
  return c.phases[run.phaseIndex]!
}

export function act(
  c: Case,
  run: RunState,
  actionId: string,
): { run: RunState; feedback?: { type: string; whyNot: string } } {
  const phase = currentPhase(c, run)
  if (run.log.some(r => r.id === actionId)) return { run }
  const key = phase.keyActions.find(k => k.id === actionId)
  const dist = phase.distractors.find(d => d.id === actionId)
  if (!key && !dist) return { run }

  let record: ActionRecord
  let feedback: { type: string; whyNot: string } | undefined
  if (key) {
    let outOfOrder = false
    let skippedCritical = false
    if (phase.strictOrder && key.critical && key.order != null) {
      const lowerCriticals = phase.keyActions.filter(
        k => k.critical && k.order != null && k.order < key.order!,
      )
      const undone = lowerCriticals.filter(k => !run.log.some(r => r.id === k.id))
      if (undone.length) {
        outOfOrder = true
        const minOrder = Math.min(
          ...phase.keyActions.filter(k => k.critical && k.order != null).map(k => k.order!),
        )
        if (undone.some(k => k.order === minOrder)) skippedCritical = true
      }
    }
    record = {
      id: actionId,
      kind: 'key',
      critical: key.critical,
      correct: !outOfOrder,
      ...(outOfOrder ? { outOfOrder: true } : {}),
      ...(skippedCritical ? { skippedCritical: true } : {}),
    }
  } else {
    record = { id: actionId, kind: 'distractor', critical: false, correct: false }
    feedback = { type: dist!.type, whyNot: dist!.whyNot }
  }

  const revealedTexts = [...run.revealedTexts]
  for (const rv of phase.reveals) {
    if (rv.ifDone === actionId && !revealedTexts.includes(rv.text)) revealedTexts.push(rv.text)
  }
  return {
    run: { ...run, log: [...run.log, record], revealedTexts },
    ...(feedback ? { feedback } : {}),
  }
}

export function remainingBank(c: Case, run: RunState): Array<KeyAction | Distractor> {
  const phase = currentPhase(c, run)
  const done = new Set(run.log.map(r => r.id))
  return [...phase.keyActions, ...phase.distractors]
    .filter(a => !done.has(a.id))
    .sort((x, y) => (x.id < y.id ? -1 : x.id > y.id ? 1 : 0))
}
```

- [ ] **Step 4: run** `./node_modules/.bin/vitest run -- scenarios/engine && ./node_modules/.bin/tsc --noEmit -p tsconfig.json` → PASS + tsc 0.

- [ ] **Step 5: commit**
```bash
/usr/bin/git add src/modules/scenarios/domain/engine.ts tests/modules/scenarios/engine.test.ts
/usr/bin/git commit -m "feat(scenarios): engine — act, reveals, strict order, bank"
```

---

## Task 4: Engine — canAdvance, advance, decide

**Files:** `src/modules/scenarios/domain/engine.ts`; test `tests/modules/scenarios/engine-advance.test.ts`

- [ ] **Step 1: failing test**
```ts
import { describe, it, expect } from 'vitest'
import { startRun, act, canAdvance, advance, decide } from '@/modules/scenarios/domain/engine'
import type { Case } from '@/shared/content/types'

const c: Case = {
  id: 'c', title: 'T', tag: 'x', context: 'x', concepts: [], modelDebrief: [],
  phases: [
    { id: 'primary', state: 's', strictOrder: true,
      keyActions: [
        { id: 'H', order: 1, text: 'H', critical: true, concept: 'habcde', rationale: 'r' },
        { id: 'D', order: 5, text: 'D', critical: false, concept: 'habcde', rationale: 'r' },
      ],
      distractors: [], reveals: [] },
    { id: 'evacuation', state: 'e',
      keyActions: [], distractors: [], reveals: [],
      decision: { correct: 'CRÍTICO', options: [{ level: 'CRÍTICO', correct: true, feedback: 'ok' }, { level: 'LEVE', correct: false, feedback: 'no' }] } },
  ],
}

describe('engine advance/decide', () => {
  it('canAdvance only when all critical key actions are logged (non-critical optional)', () => {
    let r = startRun('c')
    expect(canAdvance(c, r)).toBe(false)
    r = act(c, r, 'H').run
    expect(canAdvance(c, r)).toBe(true) // D is non-critical, not required
  })
  it('advance moves to the next phase', () => {
    const r = advance(startRun('c'))
    expect(r.phaseIndex).toBe(1)
  })
  it('decide records the chosen evacuation level', () => {
    expect(decide(advance(startRun('c')), 'CRÍTICO').decision).toBe('CRÍTICO')
  })
})
```

- [ ] **Step 2: run** `./node_modules/.bin/vitest run -- scenarios/engine-advance` → FAIL.

- [ ] **Step 3: implement** — append to `src/modules/scenarios/domain/engine.ts`:
```ts
export function canAdvance(c: Case, run: RunState): boolean {
  const phase = currentPhase(c, run)
  const done = new Set(run.log.map(r => r.id))
  return phase.keyActions.filter(k => k.critical).every(k => done.has(k.id))
}

export function advance(run: RunState): RunState {
  // reveals are scoped to a phase; clear them so prior-phase reveals don't linger.
  return { ...run, phaseIndex: run.phaseIndex + 1, revealedTexts: [] }
}

export function decide(run: RunState, level: string): RunState {
  return { ...run, decision: level }
}

export function isLastPhase(c: Case, run: RunState): boolean {
  return run.phaseIndex >= c.phases.length - 1
}
```

- [ ] **Step 4: run** `./node_modules/.bin/vitest run -- scenarios/engine-advance && ./node_modules/.bin/tsc --noEmit -p tsconfig.json` → PASS + tsc 0.

- [ ] **Step 5: commit**
```bash
/usr/bin/git add src/modules/scenarios/domain/engine.ts tests/modules/scenarios/engine-advance.test.ts
/usr/bin/git commit -m "feat(scenarios): engine — canAdvance, advance, decide"
```

---

## Task 5: Scoring + debrief builder

**Files:** `src/modules/scenarios/domain/scoring.ts`, `debrief.ts`; tests `tests/modules/scenarios/{scoring,debrief}.test.ts`

- [ ] **Step 1: failing tests**

`tests/modules/scenarios/scoring.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { scoreRun } from '@/modules/scenarios/domain/scoring'
import { startRun, act, advance, decide } from '@/modules/scenarios/domain/engine'
import type { Case } from '@/shared/content/types'

const c: Case = {
  id: 'c', title: 'T', tag: 'x', context: 'x', concepts: [], modelDebrief: [],
  phases: [
    { id: 'primary', state: 's', strictOrder: true,
      keyActions: [
        { id: 'H', order: 1, text: 'H', critical: true, concept: 'habcde', rationale: 'r' },
        { id: 'A', order: 2, text: 'A', critical: true, concept: 'habcde', rationale: 'r' },
      ],
      distractors: [{ id: 'agua', text: 'agua', type: 'misconcepcion', whyNot: 'no', concept: 'habcde' }], reveals: [] },
  ],
}

describe('scoreRun', () => {
  it('counts criticals done in order, dangerous distractors, priorities', () => {
    let r = startRun('c')
    r = act(c, r, 'H').run
    r = act(c, r, 'agua').run
    r = act(c, r, 'A').run
    const s = scoreRun(c, r)
    expect(s).toEqual({ criticalDone: 2, criticalTotal: 2, dangerous: 1, prioritiesOk: true })
  })
  it('out-of-order critical drops prioritiesOk and criticalDone', () => {
    let r = startRun('c')
    r = act(c, r, 'A').run // before H → outOfOrder/skippedCritical
    r = act(c, r, 'H').run
    const s = scoreRun(c, r)
    expect(s.prioritiesOk).toBe(false)
    expect(s.criticalDone).toBe(1) // only H counted correct
  })
})
```

`tests/modules/scenarios/debrief.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { buildDebrief } from '@/modules/scenarios/domain/debrief'
import { startRun, act, advance, decide } from '@/modules/scenarios/domain/engine'
import type { Case } from '@/shared/content/types'

const c: Case = {
  id: 'c', title: 'T', tag: 'x', context: 'x', concepts: [], modelDebrief: [],
  phases: [
    { id: 'primary', state: 's', strictOrder: true,
      keyActions: [
        { id: 'H', order: 1, text: 'Control hemorragia', critical: true, concept: 'habcde', rationale: 'r' },
        { id: 'A', order: 2, text: 'Vía aérea', critical: true, concept: 'habcde', rationale: 'r' },
      ],
      distractors: [{ id: 'agua', text: 'Darle agua', type: 'misconcepcion', whyNot: 'No con shock', concept: 'habcde' }], reveals: [] },
    { id: 'evacuation', state: 'e', keyActions: [], distractors: [], reveals: [],
      decision: { correct: 'CRÍTICO', options: [{ level: 'CRÍTICO', correct: true, feedback: 'urgente' }, { level: 'LEVE', correct: false, feedback: 'no' }] } },
  ],
}

describe('buildDebrief', () => {
  it('derives did/missed/dangerous/priorities/evacuation from the run', () => {
    let r = startRun('c')
    r = act(c, r, 'H').run
    r = act(c, r, 'agua').run
    r = advance(r)         // to evacuation (A omitted)
    r = decide(r, 'CRÍTICO')
    const d = buildDebrief(c, r)
    expect(d.did.map(i => i.text)).toContain('Control hemorragia')
    expect(d.missed.map(i => i.text)).toContain('Vía aérea')
    expect(d.dangerous[0]).toMatchObject({ text: 'Darle agua' })
    expect(d.dangerous[0]!.link).toBe('/chain/primary-habcde-h')
    expect(d.priorities.ok).toBe(true)
    expect(d.evacuation).toMatchObject({ chosen: 'CRÍTICO', correct: 'CRÍTICO', ok: true, feedback: 'urgente' })
  })
})
```

- [ ] **Step 2: run** `./node_modules/.bin/vitest run -- "scenarios/scoring|scenarios/debrief"` → FAIL.

- [ ] **Step 3: implement `scoring.ts`**
```ts
import type { Case } from '@/shared/content/types'
import type { RunState } from './engine'

export interface RunScore {
  criticalDone: number
  criticalTotal: number
  dangerous: number
  prioritiesOk: boolean
}

export function scoreRun(c: Case, run: RunState): RunScore {
  const criticalTotal = c.phases.reduce((n, p) => n + p.keyActions.filter(k => k.critical).length, 0)
  const criticalDone = run.log.filter(r => r.kind === 'key' && r.critical && r.correct).length
  const dangerous = run.log.filter(r => r.kind === 'distractor').length
  const prioritiesOk = !run.log.some(r => r.outOfOrder || r.skippedCritical)
  return { criticalDone, criticalTotal, dangerous, prioritiesOk }
}
```

- [ ] **Step 4: implement `debrief.ts`**
```ts
import type { Case } from '@/shared/content/types'
import { linkForRef } from '@/shared/domain/conceptLinks'
import type { RunState } from './engine'
import { scoreRun, type RunScore } from './scoring'

export interface DebriefItem { text: string; concept: string; link: string; detail?: string }
export interface Debrief {
  summary: RunScore
  did: DebriefItem[]
  missed: DebriefItem[]
  dangerous: DebriefItem[]
  priorities: { ok: boolean; text: string }
  evacuation?: { chosen?: string; correct: string; ok: boolean; feedback: string }
}

function item(text: string, concept: string): DebriefItem {
  return { text, concept, link: linkForRef(concept) }
}

export function buildDebrief(c: Case, run: RunState): Debrief {
  const summary = scoreRun(c, run)
  const done = new Set(run.log.map(r => r.id))

  const did: DebriefItem[] = []
  const missed: DebriefItem[] = []
  for (const phase of c.phases) {
    for (const k of phase.keyActions) {
      const rec = run.log.find(r => r.id === k.id)
      if (rec && rec.correct) did.push(item(k.text, k.concept))
      else if (k.critical && !done.has(k.id)) missed.push(item(k.text, k.concept))
    }
  }

  const dangerous: DebriefItem[] = []
  for (const phase of c.phases) {
    for (const d of phase.distractors) {
      if (done.has(d.id)) dangerous.push({ text: d.text, concept: d.concept, link: linkForRef(d.concept), detail: d.whyNot })
    }
  }

  const skipped = run.log.some(r => r.skippedCritical)
  const priorities = {
    ok: summary.prioritiesOk,
    text: skipped
      ? 'Saltaste el control de hemorragia masiva (H) — lo primero que mata, primero.'
      : summary.prioritiesOk
        ? 'Respetaste el orden de prioridad vital.'
        : 'Hiciste acciones fuera del orden de prioridad.',
  }

  const evacPhase = c.phases.find(p => p.decision)
  let evacuation: Debrief['evacuation']
  if (evacPhase?.decision) {
    const chosen = run.decision
    const opt = evacPhase.decision.options.find(o => o.level === chosen)
    evacuation = {
      ...(chosen ? { chosen } : {}),
      correct: evacPhase.decision.correct,
      ok: chosen === evacPhase.decision.correct,
      feedback: opt?.feedback ?? '',
    }
  }

  return { summary, did, missed, dangerous, priorities, ...(evacuation ? { evacuation } : {}) }
}
```

- [ ] **Step 5: run** `./node_modules/.bin/vitest run -- "scenarios/scoring|scenarios/debrief" && ./node_modules/.bin/tsc --noEmit -p tsconfig.json` → PASS + tsc 0.

- [ ] **Step 6: commit**
```bash
/usr/bin/git add src/modules/scenarios/domain/scoring.ts src/modules/scenarios/domain/debrief.ts tests/modules/scenarios/scoring.test.ts tests/modules/scenarios/debrief.test.ts
/usr/bin/git commit -m "feat(scenarios): key-feature scoring + debrief builder"
```

---

## Task 6: Scenarios store + selectors + fixture

**Files:** `src/shared/domain/storage/keys.ts`, `src/modules/scenarios/domain/store.ts`, `src/modules/scenarios/content/selectors.ts`, `tests/fixtures/scenarios.fixture.ts`; tests `tests/modules/scenarios/{store,selectors}.test.ts`

- [ ] **Step 1: fixture** — create `tests/fixtures/scenarios.fixture.ts`:
```ts
import type { Case } from '@/shared/content/types'

export const fixtureCase: Case = {
  id: 'demo', title: 'Demo', tag: 'Trauma', context: 'Contexto demo', concepts: ['habcde'], modelDebrief: ['ideal'],
  phases: [
    {
      id: 'primary', state: 'No responde; sangra.', strictOrder: true,
      keyActions: [
        { id: 'H', order: 1, text: 'Control de hemorragia', critical: true, concept: 'habcde', rationale: 'Primero lo que mata.' },
        { id: 'A', order: 2, text: 'Vía aérea con control cervical', critical: true, concept: 'habcde', rationale: 'Trauma.' },
      ],
      distractors: [{ id: 'agua', text: 'Darle agua', type: 'misconcepcion', whyNot: 'No con shock.', concept: 'habcde' }],
      reveals: [{ ifDone: 'H', text: 'El sangrado es a chorro.' }],
    },
    {
      id: 'evacuation', state: 'Shock.', keyActions: [], distractors: [], reveals: [],
      decision: { correct: 'CRÍTICO', options: [
        { level: 'CRÍTICO', correct: true, feedback: 'Evacuación urgente.' },
        { level: 'LEVE', correct: false, feedback: 'Subestima el shock.' },
      ] },
    },
  ],
}
```

- [ ] **Step 2: failing tests**

`tests/modules/scenarios/selectors.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { getCase, allCases } from '@/modules/scenarios/content/selectors'
import { fixtureCase } from '../../fixtures/scenarios.fixture'

describe('scenarios selectors', () => {
  it('getCase finds by id; allCases lists', () => {
    const cases = [fixtureCase]
    expect(getCase(cases, 'demo')?.title).toBe('Demo')
    expect(getCase(cases, 'nope')).toBeNull()
    expect(allCases(cases)).toHaveLength(1)
  })
})
```

`tests/modules/scenarios/store.test.ts`:
```ts
import { describe, it, expect, beforeEach } from 'vitest'
import 'fake-indexeddb/auto'
import { __resetStorage } from '@/shared/domain/storage'
import { loadProgress, saveProgress } from '@/modules/scenarios/domain/store'

describe('scenarios store', () => {
  beforeEach(() => __resetStorage())
  it('round-trips case progress', async () => {
    await saveProgress('demo', { criticalDone: 2, criticalTotal: 2, dangerous: 1, completedAt: '2026-06-20' })
    expect((await loadProgress())['demo']).toMatchObject({ criticalDone: 2, dangerous: 1 })
  })
})
```

- [ ] **Step 3: run** `./node_modules/.bin/vitest run -- "scenarios/selectors|scenarios/store"` → FAIL.

- [ ] **Step 4: implement keys** — in `src/shared/domain/storage/keys.ts`, add `scenariosProgress: 'scenarios:progress'` to `KEYS`.

`src/modules/scenarios/domain/store.ts`:
```ts
import { getStorage } from '@/shared/domain/storage'
import { KEYS } from '@/shared/domain/storage/keys'

export interface CaseProgress {
  criticalDone: number
  criticalTotal: number
  dangerous: number
  completedAt: string
}

export async function loadProgress(): Promise<Record<string, CaseProgress>> {
  const kv = await getStorage()
  return (await kv.get<Record<string, CaseProgress>>(KEYS.scenariosProgress)) ?? {}
}

export async function saveProgress(caseId: string, p: CaseProgress): Promise<void> {
  const kv = await getStorage()
  const all = (await kv.get<Record<string, CaseProgress>>(KEYS.scenariosProgress)) ?? {}
  all[caseId] = p
  await kv.set(KEYS.scenariosProgress, all)
}
```

`src/modules/scenarios/content/selectors.ts`:
```ts
import type { Case } from '@/shared/content/types'

export function getCase(cases: Case[], id: string): Case | null {
  return cases.find(c => c.id === id) ?? null
}

export function allCases(cases: Case[]): Case[] {
  return cases
}
```

- [ ] **Step 5: run** `./node_modules/.bin/vitest run -- "scenarios/selectors|scenarios/store" && ./node_modules/.bin/tsc --noEmit -p tsconfig.json` → PASS + tsc 0.

- [ ] **Step 6: commit**
```bash
/usr/bin/git add src/shared/domain/storage/keys.ts src/modules/scenarios/domain/store.ts src/modules/scenarios/content/selectors.ts tests/fixtures/scenarios.fixture.ts tests/modules/scenarios/selectors.test.ts tests/modules/scenarios/store.test.ts
/usr/bin/git commit -m "feat(scenarios): progress store + selectors + fixture case"
```

---

## Task 7: UI — PhaseStepper, ActionCard, ActionBank, DistractorFeedback, RevealCard, DidTrail

**Files:** the six components (+ a shared `.module.css`); test `tests/modules/scenarios/ui-bank.test.tsx`

- [ ] **Step 1: failing test**
```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ActionBank } from '@/modules/scenarios/ui/ActionBank'
import { DistractorFeedback } from '@/modules/scenarios/ui/DistractorFeedback'
import { DidTrail } from '@/modules/scenarios/ui/DidTrail'

describe('scenarios bank ui', () => {
  it('ActionBank renders actions and calls onAct on tap', () => {
    const onAct = vi.fn()
    render(<ActionBank actions={[{ id: 'H', text: 'Control hemorragia' }, { id: 'agua', text: 'Darle agua' }]} onAct={onAct} />)
    fireEvent.click(screen.getByRole('button', { name: /Darle agua/i }))
    expect(onAct).toHaveBeenCalledWith('agua')
  })
  it('DistractorFeedback shows type + whyNot', () => {
    render(<DistractorFeedback type="tecnica" whyNot="Hiperextiende el cuello." />)
    expect(screen.getByText(/tecnica/i)).toBeInTheDocument()
    expect(screen.getByText(/Hiperextiende/)).toBeInTheDocument()
  })
  it('DidTrail renders done actions with correct/incorrect markers', () => {
    render(<DidTrail items={[{ id: 'H', text: 'Control hemorragia', ok: true }, { id: 'agua', text: 'Darle agua', ok: false }]} />)
    expect(screen.getByText('Control hemorragia')).toBeInTheDocument()
    expect(screen.getByText('Darle agua')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: run** `./node_modules/.bin/vitest run -- scenarios/ui-bank` → FAIL.

- [ ] **Step 3: implement** — create `src/modules/scenarios/ui/scenarios.module.css`:
```css
.bankBtn { display: block; width: 100%; text-align: left; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 11px 13px; margin-bottom: 7px; font-family: var(--font-serif); font-size: 14px; color: var(--ink); line-height: 1.3; min-height: 44px; }
.fb { background: #fdf0ee; border: 1px solid #e0b9b3; border-left: 4px solid var(--primary); border-radius: var(--radius-md); padding: 11px 13px; margin: 2px 0 9px; }
.fbTag { display: inline-block; font-family: var(--font-sans); font-size: 9px; text-transform: uppercase; letter-spacing: 0.06em; background: var(--primary); color: var(--on-critical); border-radius: var(--radius-pill); padding: 1px 7px; margin-bottom: 5px; }
.fbWhy { font-family: var(--font-serif); font-size: 13px; color: var(--ink); }
.didLbl { font-family: var(--font-sans); font-size: 9px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--muted); font-weight: 600; margin-bottom: 5px; }
.did { display: flex; align-items: center; gap: 8px; font-family: var(--font-sans); font-size: 12px; padding: 5px 0; border-bottom: 1px dotted var(--border); }
.didN { width: 18px; height: 18px; border-radius: 50%; color: var(--on-critical); font-size: 10px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex: 0 0 18px; background: var(--mild); }
.didN.bad { background: var(--primary); }
.reveal { background: #1f2d18; color: #e9f0e3; border-radius: var(--radius-md); padding: 11px 13px; margin-bottom: 8px; border-left: 4px solid var(--mild); font-size: 13px; }
.stepper { display: flex; gap: 4px; margin-bottom: 12px; }
.step { flex: 1; height: 4px; border-radius: 99px; background: var(--border); }
.step.done { background: var(--mild); }
.step.now { background: var(--primary); }
```
`ActionCard.tsx`:
```tsx
import styles from './scenarios.module.css'

export function ActionCard({ id, text, onAct }: { id: string; text: string; onAct: (id: string) => void }) {
  return (
    <button className={styles.bankBtn} onClick={() => onAct(id)}>
      {text}
    </button>
  )
}
```
`ActionBank.tsx`:
```tsx
import { ActionCard } from './ActionCard'

export function ActionBank({ actions, onAct }: { actions: Array<{ id: string; text: string }>; onAct: (id: string) => void }) {
  return (
    <div>
      {actions.map(a => (
        <ActionCard key={a.id} id={a.id} text={a.text} onAct={onAct} />
      ))}
    </div>
  )
}
```
`DistractorFeedback.tsx`:
```tsx
import styles from './scenarios.module.css'

export function DistractorFeedback({ type, whyNot }: { type: string; whyNot: string }) {
  return (
    <div className={styles.fb}>
      <span className={styles.fbTag}>{type}</span>
      <div className={styles.fbWhy}>{whyNot}</div>
    </div>
  )
}
```
`RevealCard.tsx`:
```tsx
import styles from './scenarios.module.css'

export function RevealCard({ text }: { text: string }) {
  return <div className={styles.reveal}>{text}</div>
}
```
`DidTrail.tsx`:
```tsx
import styles from './scenarios.module.css'

export function DidTrail({ items }: { items: Array<{ id: string; text: string; ok: boolean }> }) {
  if (items.length === 0) return null
  return (
    <div style={{ marginBottom: 'var(--space-3)' }}>
      <div className={styles.didLbl}>Hiciste</div>
      {items.map((it, i) => (
        <div key={it.id} className={styles.did}>
          <span className={`${styles.didN} ${it.ok ? '' : styles.bad}`}>{it.ok ? i + 1 : '✗'}</span>
          {it.text}
        </div>
      ))}
    </div>
  )
}
```
`PhaseStepper.tsx`:
```tsx
import styles from './scenarios.module.css'

export function PhaseStepper({ count, current }: { count: number; current: number }) {
  return (
    <div className={styles.stepper}>
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className={`${styles.step} ${i < current ? styles.done : i === current ? styles.now : ''}`} />
      ))}
    </div>
  )
}
```

- [ ] **Step 4: run** `./node_modules/.bin/vitest run -- scenarios/ui-bank && ./node_modules/.bin/tsc --noEmit -p tsconfig.json` → PASS + tsc 0.

- [ ] **Step 5: commit**
```bash
/usr/bin/git add src/modules/scenarios/ui/ tests/modules/scenarios/ui-bank.test.tsx
/usr/bin/git commit -m "feat(scenarios): bank/feedback/reveal/trail/stepper components"
```

---

## Task 8: UI — EvacuationDecision + Debrief

**Files:** `src/modules/scenarios/ui/EvacuationDecision.tsx`, `Debrief.tsx`; test `tests/modules/scenarios/ui-debrief.test.tsx`

- [ ] **Step 1: failing test**
```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { EvacuationDecision } from '@/modules/scenarios/ui/EvacuationDecision'
import { Debrief } from '@/modules/scenarios/ui/Debrief'

describe('scenarios debrief ui', () => {
  it('EvacuationDecision calls onDecide with the chosen level', () => {
    const onDecide = vi.fn()
    render(<EvacuationDecision options={[{ level: 'CRÍTICO' }, { level: 'LEVE' }]} onDecide={onDecide} />)
    fireEvent.click(screen.getByRole('button', { name: 'CRÍTICO' }))
    expect(onDecide).toHaveBeenCalledWith('CRÍTICO')
  })
  it('Debrief renders the sections + links', () => {
    render(
      <MemoryRouter>
        <Debrief
          debrief={{
            summary: { criticalDone: 1, criticalTotal: 2, dangerous: 1, prioritiesOk: true },
            did: [{ text: 'Control hemorragia', concept: 'habcde', link: '/chain/primary-habcde-h' }],
            missed: [{ text: 'Vía aérea', concept: 'habcde', link: '/chain/primary-habcde-h' }],
            dangerous: [{ text: 'Darle agua', concept: 'habcde', link: '/chain/primary-habcde-h' }],
            priorities: { ok: true, text: 'Respetaste el orden.' },
            evacuation: { chosen: 'CRÍTICO', correct: 'CRÍTICO', ok: true, feedback: 'urgente' },
          }}
          onRetry={() => {}}
          onBack={() => {}}
        />
      </MemoryRouter>,
    )
    expect(screen.getByText(/Hiciste/i)).toBeInTheDocument()
    expect(screen.getByText('Control hemorragia')).toBeInTheDocument()
    expect(screen.getByText('Vía aérea')).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /Ver .* en Aprender/i })[0]).toHaveAttribute('href', '/chain/primary-habcde-h')
  })
})
```

- [ ] **Step 2: run** `./node_modules/.bin/vitest run -- scenarios/ui-debrief` → FAIL.

- [ ] **Step 3: implement `EvacuationDecision.tsx`**
```tsx
import styles from './scenarios.module.css'

export function EvacuationDecision({ options, onDecide }: { options: Array<{ level: string }>; onDecide: (level: string) => void }) {
  return (
    <div>
      <p style={{ fontFamily: 'var(--font-serif)', fontWeight: 700 }}>Decisión de evacuación</p>
      {options.map(o => (
        <button key={o.level} className={styles.bankBtn} onClick={() => onDecide(o.level)}>
          {o.level}
        </button>
      ))}
    </div>
  )
}
```
`Debrief.tsx`:
```tsx
import { Link } from 'react-router-dom'
import type { Debrief as DebriefModel, DebriefItem } from '@/modules/scenarios/domain/debrief'

function Section({ label, items }: { label: string; items: DebriefItem[] }) {
  if (items.length === 0) return null
  return (
    <div style={{ marginBottom: 'var(--space-4)' }}>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 700, marginBottom: 6 }}>{label}</div>
      {items.map((it, i) => (
        <div key={i} style={{ fontSize: 14, padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
          {it.text}
          {it.detail && (
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 13, color: 'var(--ink-soft)', marginTop: 2 }}>
              {it.detail}
            </div>
          )}
          {it.link !== '/' && (
            <>
              <br />
              <Link to={it.link} style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'var(--primary)', fontWeight: 600 }}>
                Ver "{it.concept}" en Aprender →
              </Link>
            </>
          )}
        </div>
      ))}
    </div>
  )
}

export function Debrief({ debrief, onRetry, onBack }: { debrief: DebriefModel; onRetry: () => void; onBack: () => void }) {
  const s = debrief.summary
  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 24 }}>Debrief</h1>
      <div style={{ background: 'var(--ink)', color: 'var(--bg)', borderRadius: 'var(--radius-lg)', padding: '11px 13px', fontFamily: 'var(--font-sans)', fontSize: 12, marginBottom: 'var(--space-4)' }}>
        decisiones críticas {s.criticalDone}/{s.criticalTotal} · errores peligrosos {s.dangerous} · prioridades {s.prioritiesOk ? '✓' : '✗'}
      </div>
      <Section label="✅ Hiciste" items={debrief.did} />
      <Section label="⚠️ Te faltó" items={debrief.missed} />
      <Section label="❌ Peligroso" items={debrief.dangerous} />
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 700, marginBottom: 6 }}>🧭 Prioridades</div>
        <div style={{ fontSize: 14 }}>{debrief.priorities.text}</div>
      </div>
      {debrief.evacuation && (
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 700, marginBottom: 6 }}>🏁 Evacuación</div>
          <div style={{ fontSize: 14 }}>
            {debrief.evacuation.chosen ?? '—'} {debrief.evacuation.ok ? '✓' : `✗ (correcta: ${debrief.evacuation.correct})`} — {debrief.evacuation.feedback}
          </div>
        </div>
      )}
      <button onClick={onRetry} style={{ width: '100%', background: 'var(--primary)', color: 'var(--on-critical)', border: 'none', borderRadius: 'var(--radius-lg)', padding: 13, fontFamily: 'var(--font-sans)', fontWeight: 700, minHeight: 44 }}>
        Reintentar el caso
      </button>
      <button onClick={onBack} style={{ width: '100%', background: 'transparent', color: 'var(--muted)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 11, marginTop: 8, fontFamily: 'var(--font-sans)', fontWeight: 600, minHeight: 44 }}>
        Volver a Escenarios
      </button>
    </div>
  )
}
```

- [ ] **Step 4: run** `./node_modules/.bin/vitest run -- scenarios/ui-debrief && ./node_modules/.bin/tsc --noEmit -p tsconfig.json` → PASS + tsc 0.

- [ ] **Step 5: commit**
```bash
/usr/bin/git add src/modules/scenarios/ui/EvacuationDecision.tsx src/modules/scenarios/ui/Debrief.tsx tests/modules/scenarios/ui-debrief.test.tsx
/usr/bin/git commit -m "feat(scenarios): EvacuationDecision + Debrief components"
```

---

## Task 9: Play route + ScenariosHome + routes

**Files:** `src/modules/scenarios/routes/Play.tsx`, `ScenariosHome.tsx`, `src/modules/scenarios/index.tsx`; test `tests/modules/scenarios/play.test.tsx`

- [ ] **Step 1: failing test**
```tsx
import { describe, it, expect, vi } from 'vitest'
import 'fake-indexeddb/auto'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { __resetStorage } from '@/shared/domain/storage'
import { fixtureCase } from '../../fixtures/scenarios.fixture'

vi.mock('@/shared/content/loader', () => ({ loadCases: () => [fixtureCase], loadContent: () => ({ acronyms: [], chain: [], clinicalTopics: [] }) }))

import { Play } from '@/modules/scenarios/routes/Play'

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes><Route path="/scenarios/:caseId" element={<Play />} /></Routes>
    </MemoryRouter>,
  )
}

describe('Play', () => {
  it('runs a phase: tap a key action, advance, decide, see debrief', async () => {
    __resetStorage()
    renderAt('/scenarios/demo')
    // primary phase: do both criticals
    fireEvent.click(await screen.findByRole('button', { name: /Control de hemorragia/i }))
    fireEvent.click(screen.getByRole('button', { name: /Vía aérea con control cervical/i }))
    // continue to evacuation
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }))
    // decide
    fireEvent.click(await screen.findByRole('button', { name: 'CRÍTICO' }))
    // debrief
    expect(await screen.findByText(/Debrief/i)).toBeInTheDocument()
    expect(screen.getByText(/decisiones críticas 2\/2/)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: run** `./node_modules/.bin/vitest run -- scenarios/play` → FAIL.

- [ ] **Step 3: implement `Play.tsx`**
```tsx
import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { loadCases } from '@/shared/content/loader'
import { getCase } from '@/modules/scenarios/content/selectors'
import { startRun, act, canAdvance, advance, decide, currentPhase, isLastPhase, remainingBank, type RunState } from '@/modules/scenarios/domain/engine'
import { buildDebrief } from '@/modules/scenarios/domain/debrief'
import { scoreRun } from '@/modules/scenarios/domain/scoring'
import { saveProgress } from '@/modules/scenarios/domain/store'
import { PhaseStepper } from '@/modules/scenarios/ui/PhaseStepper'
import { ActionBank } from '@/modules/scenarios/ui/ActionBank'
import { DistractorFeedback } from '@/modules/scenarios/ui/DistractorFeedback'
import { RevealCard } from '@/modules/scenarios/ui/RevealCard'
import { DidTrail } from '@/modules/scenarios/ui/DidTrail'
import { EvacuationDecision } from '@/modules/scenarios/ui/EvacuationDecision'
import { Debrief } from '@/modules/scenarios/ui/Debrief'

export function Play() {
  const { caseId = '' } = useParams()
  const cases = loadCases()
  const c = getCase(cases, caseId)
  const navigate = useNavigate()
  const [run, setRun] = useState<RunState>(() => startRun(caseId))
  const [feedback, setFeedback] = useState<{ type: string; whyNot: string } | null>(null)
  const [finished, setFinished] = useState(false)

  if (!c) return <p>Caso no encontrado.</p>

  const phase = currentPhase(c, run)
  const trailItems = run.log.map(r => {
    const ka = phase.keyActions.find(k => k.id === r.id)
    const da = phase.distractors.find(d => d.id === r.id)
    return { id: r.id, text: ka?.text ?? da?.text ?? r.id, ok: r.correct }
  })

  const onAct = (id: string) => {
    const res = act(c, run, id)
    setRun(res.run)
    setFeedback(res.feedback ?? null)
  }
  const onContinue = () => {
    setFeedback(null)
    if (isLastPhase(c, run)) return // evacuation: handled by decision
    setRun(advance(run))
  }
  const finish = (finalRun: RunState) => {
    const s = scoreRun(c, finalRun)
    void saveProgress(c.id, { ...s, completedAt: new Date().toISOString().slice(0, 10) })
    setFinished(true)
  }
  const onDecide = (level: string) => {
    const next = decide(run, level)
    setRun(next)
    finish(next)
  }
  const onRetry = () => { setRun(startRun(c.id)); setFeedback(null); setFinished(false) }

  if (finished) return <Debrief debrief={buildDebrief(c, run)} onRetry={onRetry} onBack={() => navigate('/scenarios')} />

  const isEvac = phase.decision != null
  const decisionReady = isEvac && canAdvance(c, run)

  return (
    <div>
      <PhaseStepper count={c.phases.length} current={run.phaseIndex} />
      <p style={{ fontFamily: 'var(--font-sans)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--primary)', fontWeight: 700 }}>
        {phase.id}{phase.strictOrder ? ' · orden estricto' : ''}
      </p>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '11px 13px', fontStyle: 'italic', marginBottom: 8 }}>{phase.state}</div>
      {run.revealedTexts.map((t, i) => <RevealCard key={i} text={t} />)}
      <DidTrail items={trailItems} />
      {feedback && <DistractorFeedback type={feedback.type} whyNot={feedback.whyNot} />}

      {decisionReady ? (
        <EvacuationDecision options={phase.decision!.options} onDecide={onDecide} />
      ) : (
        <>
          <p style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: 17 }}>¿Qué hacés?</p>
          <ActionBank actions={remainingBank(c, run)} onAct={onAct} />
          {!isEvac && (
            <button
              onClick={onContinue}
              disabled={!canAdvance(c, run)}
              style={{ width: '100%', marginTop: 10, background: canAdvance(c, run) ? 'var(--ink)' : 'var(--border)', color: canAdvance(c, run) ? 'var(--bg)' : 'var(--muted)', border: 'none', borderRadius: 'var(--radius-lg)', padding: 13, fontFamily: 'var(--font-sans)', fontWeight: 700, minHeight: 44 }}
            >
              Continuar
            </button>
          )}
        </>
      )}
    </div>
  )
}
```
`ScenariosHome.tsx`:
```tsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { loadCases } from '@/shared/content/loader'
import { allCases } from '@/modules/scenarios/content/selectors'
import { loadProgress, type CaseProgress } from '@/modules/scenarios/domain/store'

export function ScenariosHome() {
  const cases = allCases(loadCases())
  const [progress, setProgress] = useState<Record<string, CaseProgress>>({})
  useEffect(() => { void loadProgress().then(setProgress) }, [])
  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 24 }}>Escenarios</h1>
      <p style={{ color: 'var(--ink-soft)' }}>Casos integrales: actuá toda la cadena.</p>
      {cases.map(c => {
        const p = progress[c.id]
        return (
          <Link key={c.id} to={`/scenarios/${c.id}`} style={{ display: 'block', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)', marginBottom: 'var(--space-3)', textDecoration: 'none', color: 'var(--ink)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: 17 }}>{c.title}</span>
              {p && <span style={{ fontFamily: 'var(--font-sans)', fontSize: 10, background: 'var(--mild)', color: 'var(--on-mild)', borderRadius: 'var(--radius-pill)', padding: '2px 8px' }}>✓ {p.criticalDone}/{p.criticalTotal}</span>}
            </div>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 11, color: 'var(--muted)', margin: '2px 0 6px' }}>{c.tag}</p>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: 13, margin: 0 }}>{c.context.slice(0, 120)}…</p>
          </Link>
        )
      })}
    </div>
  )
}
```
`index.tsx`:
```tsx
import type { RouteObject } from 'react-router-dom'
import { ScenariosHome } from './routes/ScenariosHome'
import { Play } from './routes/Play'

export const scenariosRoutes: RouteObject[] = [
  { path: '/scenarios', element: <ScenariosHome /> },
  { path: '/scenarios/:caseId', element: <Play /> },
]
```

- [ ] **Step 4: run** `./node_modules/.bin/vitest run -- scenarios/play && ./node_modules/.bin/tsc --noEmit -p tsconfig.json` → PASS + tsc 0.

- [ ] **Step 5: commit**
```bash
/usr/bin/git add src/modules/scenarios/routes/ src/modules/scenarios/index.tsx tests/modules/scenarios/play.test.tsx
/usr/bin/git commit -m "feat(scenarios): Play route (engine wiring) + ScenariosHome + routes"
```

---

## Task 10: Enable Escenarios tab + router wiring

**Files:** `src/shared/app/Shell.tsx`, `src/shared/app/router.tsx`; test `tests/shared/app/shell.test.tsx`

- [ ] **Step 1: failing test** — append to `tests/shared/app/shell.test.tsx`:
```tsx
it('Escenarios tab is an active link on /scenarios', () => {
  render(
    <MemoryRouter initialEntries={['/scenarios']}>
      <Shell><p>x</p></Shell>
    </MemoryRouter>,
  )
  expect(screen.getByRole('link', { name: /Escenarios/i })).toHaveAttribute('href', '/scenarios')
})
```

- [ ] **Step 2: run** `./node_modules/.bin/vitest run -- shell` → FAIL.

- [ ] **Step 3: implement** — in `src/shared/app/Shell.tsx`, add the Escenarios tab to `TABS` and remove the disabled span. The `TABS` becomes (drop `as const`, type each entry):
```tsx
const TABS: Array<{ to: string; label: string; match: (p: string) => boolean }> = [
  { to: '/', label: 'Aprender', match: p => p === '/' || p.startsWith('/chain') || p === '/example' || p === '/quickref' },
  { to: '/practice', label: 'Practicar', match: p => p.startsWith('/practice') },
  { to: '/scenarios', label: 'Escenarios', match: p => p.startsWith('/scenarios') },
]
```
In the `<nav>`, render all three as `Link`s (the due-count badge stays only on the Practicar tab — keep that conditional). Remove the `<span className={`${styles.tab} ${styles.tabDisabled}`} aria-disabled>Escenarios</span>`. (Keep the `useDueCount` badge logic on the Practicar tab.)

In `src/shared/app/router.tsx`, import and compose `scenariosRoutes`:
```tsx
import { scenariosRoutes } from '@/modules/scenarios'
// children: [...learnRoutes, ...practiceRoutes, ...scenariosRoutes, { path: '*', element: <Navigate to="/" replace /> }],
```

- [ ] **Step 4: run** `./node_modules/.bin/vitest run -- shell && ./node_modules/.bin/tsc --noEmit -p tsconfig.json && ./node_modules/.bin/eslint . --max-warnings 0 && ./node_modules/.bin/vite build` → all green.

- [ ] **Step 5: commit**
```bash
/usr/bin/git add src/shared/app/Shell.tsx src/shared/app/router.tsx tests/shared/app/shell.test.tsx
/usr/bin/git commit -m "feat(app): enable Escenarios tab + wire scenarios routes"
```

---

## Task 11: Full verification + visual check

**Files:** none.

- [ ] **Step 1: all gates (raw binaries)** — confirm each exits 0:
```bash
./node_modules/.bin/tsx scripts/build-content.ts --check
./node_modules/.bin/vitest run
./node_modules/.bin/tsc --noEmit -p tsconfig.json
./node_modules/.bin/tsc --noEmit -p tsconfig.node.json
./node_modules/.bin/eslint . --max-warnings 0
./node_modules/.bin/vite build
```

- [ ] **Step 2: visual check** — `npm run dev`; confirm both real cases:
- Escenarios tab → `/scenarios` lists 2 cases (trauma + hipotermia).
- A run: phase stepper, state + reveals appearing as you act, the mixed action bank (no criticality hint), tapping a distractor shows immediate `whyNot`, "Hiciste" trail in order, "Continuar" enabled only after the critical actions.
- Strict order (case 1 primary): acting A before H flags it (✗ in the trail); the debrief 🧭 priorities calls out skipping H.
- Evacuation phase → pick a level → debrief.
- Debrief: dry summary + ✅/⚠️/❌/🧭/🏁 sections, each linking to Aprender; "Reintentar" restarts; the case card shows a ✓ badge after.
- Module 1 + 2 unchanged; offline (DevTools offline) still works.

- [ ] **Step 3: commit any fixes** (skip if none)
```bash
/usr/bin/git add -A && /usr/bin/git commit -m "fix(scenarios): address issues from visual verification"
```

---

## Definition of Done

- All gates green (content-check, vitest, both tsc, eslint, vite build) on raw binaries.
- Both real cases run end-to-end in Mode B: action bank, progressive reveals, immediate distractor feedback, strict HABCDE order (skipping H flagged as critical), evacuation decision, key-feature debrief linking to M1, replay, progress badge — offline.
- `conceptLinks` lives in `shared/domain` and M2 still passes. `cases.json` is fully typed + anglicized; the case-concept guard catches a dangling concept. Escenarios tab navigable; M1/M2 unchanged.
