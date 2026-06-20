# Módulo 2 "Practicar" (SRS) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Module 2 "Practicar": spaced-repetition flashcards over the existing 42 `tarjetas` — four generative formats, Leitner SRS, elaborative feedback reusing Module 1's rationale, tab-bar navigation, day streak + per-topic mastery, all offline.

**Architecture:** New feature-first module `src/modules/practice/` (`content → domain → ui → routes`). Pure domain (SRS, session, grading, streak, mastery) is clock-injected and storage-free; UI/routes compose it. Shared changes: tab-bar `Shell`, rationale-map aliases + two new clinical topics (so all card refs resolve), card-ref build guard, `CardSchema.options`. SRS state persists via the existing `idb-keyval` KV wrapper under a single `practice:srs` record.

**Tech Stack:** React + Vite + TypeScript, zod, react-router v6 (HashRouter), idb-keyval, Vitest + Testing Library, CSS Modules.

**Reference spec:** `docs/superpowers/specs/2026-06-19-module2-practice-design.md`

**RTK proxy warning:** A shell proxy can report exit 0 even when a tool failed. Run RAW binaries and trust real exit codes: `./node_modules/.bin/vitest run`, `./node_modules/.bin/tsc --noEmit -p tsconfig.json`, `./node_modules/.bin/tsc --noEmit -p tsconfig.node.json`, `./node_modules/.bin/eslint . --max-warnings 0`, `./node_modules/.bin/tsx scripts/build-content.ts --check`, `./node_modules/.bin/vite build`. Use `/usr/bin/git`.

**Conventions:** code/identifiers/files English; user-facing strings + `.yaml` content Spanish. Work on branch `main` (user consent). Generated `src/shared/content/generated/` is gitignored — never commit it.

**Storage-key refinement (vs spec §5.3):** instead of one key per card (`srs:card:<id>`), all SRS state lives under a single `practice:srs` record (`Record<cardId, CardState>`), and streak under `practice:streak`. This avoids needing key enumeration from the KV wrapper and lets session/mastery load everything at once.

---

## File Map

**shared (modify):**
- `src/shared/content/schemas.ts` — `CardSchema.options`.
- `src/shared/content/mapping.ts` — `mapCard` maps `opciones → options`.
- `src/shared/content/types.ts` — export `Card`.
- `src/shared/domain/rationale.ts` — `PHASE_ALIAS` + alias keys.
- `scripts/integrity.ts` — card-ref guard + aliases in `collectConceptIds` + elegir-options assertion (in build-content).
- `scripts/build-content.ts` — assert every `elegir` card has `options`.
- `docs/contenido-cav.yaml` — two `temas_clinicos` rows (`signos_vitales`, `niveles_evacuacion`).
- `src/shared/app/Shell.tsx` + `Shell.module.css` — bottom tab bar.
- `src/shared/app/router.tsx` — compose `practiceRoutes`.

**practice (create):**
- `domain/`: `dates.ts`, `srs.ts`, `session.ts`, `streak.ts`, `mastery.ts`, `grading.ts`, `cloze.ts`, `conceptLinks.ts`, `store.ts`
- `content/selectors.ts`
- `ui/`: `CardShell.tsx`, `cards/{OrderCard,WriteCard,ClozeCard,ChoiceCard}.tsx`, `FeedbackPanel.tsx`, `MasteryBars.tsx`, `SessionRunner.tsx` (+ `.module.css`)
- `routes/`: `PracticeHome.tsx`, `Session.tsx`
- `index.tsx`

**tests:** mirror under `tests/` + extend `tests/fixtures/content.fixture.ts`.

---

## Task 1: CardSchema options + mapper + Card type

**Files:** `src/shared/content/schemas.ts`, `src/shared/content/mapping.ts`, `src/shared/content/types.ts`; tests `tests/shared/content/schemas-content.test.ts`, `tests/shared/content/mapping.test.ts`

- [ ] **Step 1: failing test** — append to `tests/shared/content/schemas-content.test.ts`:

```ts
import { CardSchema } from '@/shared/content/schemas'

describe('CardSchema options (M2)', () => {
  it('accepts an elegir card with options', () => {
    const c = CardSchema.parse({
      id: 't-x', topic: 'Manejo', type: 'elegir', prompt: '¿?',
      answer: ['No'], options: ['No', 'Sí'], rationaleRef: 'habcde',
    })
    expect(c.options).toEqual(['No', 'Sí'])
  })
})
```
And append to `tests/shared/content/mapping.test.ts`:
```ts
import { mapCard } from '@/shared/content/mapping'

describe('mapCard options (M2)', () => {
  it('maps opciones → options, omits when absent', () => {
    expect(mapCard({ id: 'c', tema: 'T', tipo: 'elegir', prompt: 'p', respuesta: ['a'], opciones: ['a', 'b'], racional_ref: 'r' }).options).toEqual(['a', 'b'])
    expect('options' in mapCard({ id: 'c', tema: 'T', tipo: 'escribir', prompt: 'p', respuesta: ['a'], racional_ref: 'r' })).toBe(false)
  })
})
```

- [ ] **Step 2: run** `./node_modules/.bin/vitest run -- "schemas-content|mapping"` → FAIL.

- [ ] **Step 3: implement** — in `src/shared/content/schemas.ts`, change `CardSchema` to add `options`:
```ts
export const CardSchema = z
  .object({
    id: z.string().min(1),
    topic: z.string().min(1),
    type: z.enum(['ordenar', 'escribir', 'cloze', 'elegir']),
    prompt: z.string().min(1),
    answer: z.array(z.string()).min(1),
    options: z.array(z.string()).optional(),
    rationaleRef: z.string().min(1),
  })
  .passthrough()
```
In `src/shared/content/mapping.ts`, replace `mapCard`:
```ts
export function mapCard(c: any) {
  return {
    id: c.id,
    topic: c.tema,
    type: c.tipo,
    prompt: c.prompt,
    answer: c.respuesta,
    ...(c.opciones ? { options: c.opciones } : {}),
    rationaleRef: c.racional_ref,
  }
}
```
In `src/shared/content/types.ts`, add the import + export:
```ts
import { CardSchema } from './schemas'   // add to the existing import list
export type Card = z.infer<typeof CardSchema>
```

- [ ] **Step 4: run** `./node_modules/.bin/vitest run -- "schemas-content|mapping" && ./node_modules/.bin/tsc --noEmit -p tsconfig.json` → PASS + tsc 0.

- [ ] **Step 5: commit**
```bash
/usr/bin/git add src/shared/content/schemas.ts src/shared/content/mapping.ts src/shared/content/types.ts tests/shared/content/schemas-content.test.ts tests/shared/content/mapping.test.ts
/usr/bin/git commit -m "feat(content): CardSchema options (opciones) + Card type (M2)"
```

---

## Task 2: Rationale-map aliases + two clinical topics + card-ref guard

**Files:** `docs/contenido-cav.yaml`, `src/shared/domain/rationale.ts`, `scripts/integrity.ts`; tests `tests/shared/domain/rationale.test.ts`, `tests/scripts/integrity.test.ts`

- [ ] **Step 1: author the two clinical topics** — in `docs/contenido-cav.yaml`, append two rows to `temas_clinicos:`:
```yaml
  - id: "signos_vitales"
    nombre: "Signos vitales"
    racional: "Los signos vitales (FR, FC, presión, temperatura, piel, relleno capilar) son la línea de base para seguir la evolución; se reevalúan periódicamente (estable cada 15-20 min, inestable cada 5 min)."
  - id: "niveles_evacuacion"
    nombre: "Niveles de evacuación"
    racional: "La gravedad define la conducta: CRÍTICO (amenaza inmediata para la vida → evacuar lo antes posible), GRAVE (puede volverse crítico → se recomienda evacuar), LEVE (sin amenaza → se puede analizar continuar en el terreno)."
```

- [ ] **Step 2: failing test (rationale aliases)** — append to `tests/shared/domain/rationale.test.ts`:
```ts
it('resolves Spanish phase aliases (M2 card refs)', () => {
  const m = buildRationaleMap(validContent)
  expect(getRationale('escena', m)).toBeDefined()
  expect(getRationale('primaria', m)).toBeDefined()
  expect(getRationale('secundaria', m)).toBeDefined()
})
```

- [ ] **Step 3: run** `./node_modules/.bin/vitest run -- rationale` → FAIL.

- [ ] **Step 4: implement aliases** — replace `src/shared/domain/rationale.ts`:
```ts
import type { Content } from '@/shared/content/types'

// Cards (Module 2) reference phases by their Spanish names; the map keys phases
// by English id. Register the Spanish alias → same rationale so card refs resolve.
const PHASE_ALIAS: Record<string, string> = {
  scene: 'escena',
  primary: 'primaria',
  secondary: 'secundaria',
  evacuation: 'evacuacion',
}

export function buildRationaleMap(content: Content): Map<string, string> {
  const m = new Map<string, string>()
  for (const a of content.acronyms) m.set(a.id, a.rationale)
  for (const phase of content.chain) {
    m.set(phase.phase, phase.rationale)
    const alias = PHASE_ALIAS[phase.phase]
    if (alias) m.set(alias, phase.rationale)
  }
  for (const t of content.clinicalTopics) m.set(t.id, t.rationale)
  return m
}

export function getRationale(conceptId: string, map: Map<string, string>): string | undefined {
  return map.get(conceptId)
}
```

- [ ] **Step 5: run** `./node_modules/.bin/vitest run -- rationale` → PASS.

- [ ] **Step 6: failing test (card-ref guard)** — append to `tests/scripts/integrity.test.ts`:
```ts
it('validates card rationaleRef in M2 (dangling card ref → finding)', () => {
  const withBadCard = { ...base, cards: [{ id: 'c1', rationaleRef: 'does-not-exist' }] }
  expect(findDanglingRefs(withBadCard)).toContain('does-not-exist')
})
it('accepts Spanish phase aliases as known ids', () => {
  const withAliasCard = { ...base, cards: [{ id: 'c2', rationaleRef: 'primaria' }] }
  expect(findDanglingRefs(withAliasCard)).toEqual([])
})
```
> Note: the prior MVP test `does not validate card rationaleRef in v1 (deferred to Module 2)` now contradicts this. DELETE that old test from `tests/scripts/integrity.test.ts`.

- [ ] **Step 7: run** `./node_modules/.bin/vitest run -- integrity` → FAIL.

- [ ] **Step 8: implement guard** — replace the two functions in `scripts/integrity.ts`:
```ts
const PHASE_ALIAS: Record<string, string> = {
  scene: 'escena', primary: 'primaria', secondary: 'secundaria', evacuation: 'evacuacion',
}

export function collectConceptIds(c: any): string[] {
  const ids: string[] = []
  for (const a of c.acronyms ?? []) ids.push(a.id)
  for (const p of c.chain ?? []) {
    ids.push(p.phase)
    const alias = PHASE_ALIAS[p.phase]
    if (alias) ids.push(alias)
  }
  for (const t of c.clinicalTopics ?? []) ids.push(t.id)
  return ids.filter((v, i, arr) => arr.indexOf(v) === i)
}

export function findDanglingRefs(c: any): string[] {
  const known = new Set(collectConceptIds(c))
  const dangling: string[] = []
  const check = (ref?: string) => {
    if (ref && !known.has(ref)) dangling.push(ref)
  }
  for (const s of c.workedExample?.steps ?? []) check(s.rationaleRef)
  for (const card of c.cards ?? []) check(card.rationaleRef)
  return dangling.filter((v, i, arr) => arr.indexOf(v) === i)
}
```
(Leave `findDuplicateIds` unchanged.)

- [ ] **Step 9: run tests + rebuild content (proves all 42 card refs resolve)**
```bash
./node_modules/.bin/vitest run -- "integrity|rationale"
./node_modules/.bin/tsx scripts/build-content.ts --check
```
Expected: tests PASS; `✓ content valid` (no dangling card refs — the two new topics + aliases cover them).

- [ ] **Step 10: add an end-to-end resolution test** — append to `tests/shared/domain/rationale.test.ts`:
```ts
it('every fixture card ref resolves', () => {
  const m = buildRationaleMap(validContent)
  for (const card of validContent.cards) expect(getRationale(card.rationaleRef, m)).toBeDefined()
})
```
(This needs the fixture to carry a few cards — added in Task 7's fixture step; if `validContent.cards` is empty now, this passes vacuously and becomes meaningful after Task 7. Acceptable.)

- [ ] **Step 11: commit**
```bash
/usr/bin/git add docs/contenido-cav.yaml src/shared/domain/rationale.ts scripts/integrity.ts tests/shared/domain/rationale.test.ts tests/scripts/integrity.test.ts
/usr/bin/git commit -m "feat(content): rationale aliases + signos_vitales/niveles_evacuacion topics; enable card-ref guard (M2)"
```

---

## Task 3: build-content elegir-options assertion

**Files:** `scripts/build-content.ts`; test `tests/scripts/integrity.test.ts` (or a new `tests/scripts/cards.test.ts`)

- [ ] **Step 1: failing test** — create `tests/scripts/cards.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { findElegirWithoutOptions } from '../../scripts/integrity'

describe('elegir options guard', () => {
  it('flags an elegir card without options', () => {
    const c = { cards: [{ id: 'c', type: 'elegir', options: [] }, { id: 'd', type: 'escribir' }] }
    expect(findElegirWithoutOptions(c)).toEqual(['c'])
  })
  it('passes when elegir cards have options', () => {
    const c = { cards: [{ id: 'c', type: 'elegir', options: ['a', 'b'] }] }
    expect(findElegirWithoutOptions(c)).toEqual([])
  })
})
```

- [ ] **Step 2: run** `./node_modules/.bin/vitest run -- cards` → FAIL.

- [ ] **Step 3: implement** — add to `scripts/integrity.ts`:
```ts
export function findElegirWithoutOptions(c: any): string[] {
  return (c.cards ?? [])
    .filter((card: any) => card.type === 'elegir' && !(card.options?.length))
    .map((card: any) => card.id)
}
```
Wire it into `scripts/build-content.ts` `runIntegrityChecks`:
```ts
import { findDuplicateIds, findDanglingRefs, findElegirWithoutOptions } from './integrity'
// inside runIntegrityChecks(content):
  const noOpts = findElegirWithoutOptions(content)
  if (noOpts.length) fail(noOpts.map(id => `  elegir card without options: ${id}`).join('\n'))
```

- [ ] **Step 4: run** `./node_modules/.bin/vitest run -- cards && ./node_modules/.bin/tsx scripts/build-content.ts --check` → PASS; `✓ content valid` (all real elegir cards have `opciones`).

- [ ] **Step 5: commit**
```bash
/usr/bin/git add scripts/integrity.ts scripts/build-content.ts tests/scripts/cards.test.ts
/usr/bin/git commit -m "feat(content): build guard — elegir cards must carry options (M2)"
```

---

## Task 4: Dates + Leitner SRS

**Files:** `src/modules/practice/domain/dates.ts`, `src/modules/practice/domain/srs.ts`; tests `tests/modules/practice/srs.test.ts`

- [ ] **Step 1: failing test**
```ts
import { describe, it, expect } from 'vitest'
import { addDays } from '@/modules/practice/domain/dates'
import { schedule, INTERVALS } from '@/modules/practice/domain/srs'

describe('srs', () => {
  it('addDays adds calendar days (ISO)', () => {
    expect(addDays('2026-06-19', 4)).toBe('2026-06-23')
  })
  it('correct bumps box and schedules by interval', () => {
    const s = schedule({ box: 1, due: '2026-06-19' }, 'correct', '2026-06-19')
    expect(s.box).toBe(2)
    expect(s.due).toBe(addDays('2026-06-19', INTERVALS[1]))
    expect(s.lastResult).toBe('correct')
  })
  it('correct caps at box 5', () => {
    expect(schedule({ box: 5, due: '2026-06-19' }, 'correct', '2026-06-19').box).toBe(5)
  })
  it('wrong resets to box 1 due tomorrow', () => {
    const s = schedule({ box: 4, due: '2026-06-19' }, 'wrong', '2026-06-19')
    expect(s.box).toBe(1)
    expect(s.due).toBe('2026-06-20')
  })
  it('new card (undefined state) on correct → box 2', () => {
    expect(schedule(undefined, 'correct', '2026-06-19').box).toBe(2)
  })
})
```

- [ ] **Step 2: run** `./node_modules/.bin/vitest run -- practice/srs` → FAIL.

- [ ] **Step 3: implement `dates.ts`**
```ts
// ISO date math in UTC (dates are YYYY-MM-DD, no time component).
export function addDays(iso: string, n: number): string {
  const d = new Date(`${iso}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}
```
`srs.ts`
```ts
import { addDays } from './dates'

export interface CardState {
  box: number
  due: string
  lastResult?: 'correct' | 'wrong'
}
export type Result = 'correct' | 'wrong'

// days until next review, indexed by box 1..5
export const INTERVALS = [1, 2, 4, 8, 16]

export function schedule(state: CardState | undefined, result: Result, today: string): CardState {
  if (result === 'wrong') {
    return { box: 1, due: addDays(today, 1), lastResult: 'wrong' }
  }
  const box = Math.min(5, (state?.box ?? 1) + 1)
  return { box, due: addDays(today, INTERVALS[box - 1]), lastResult: 'correct' }
}
```

- [ ] **Step 4: run** `./node_modules/.bin/vitest run -- practice/srs` → PASS.

- [ ] **Step 5: commit**
```bash
/usr/bin/git add src/modules/practice/domain/dates.ts src/modules/practice/domain/srs.ts tests/modules/practice/srs.test.ts
/usr/bin/git commit -m "feat(practice): Leitner SRS schedule + date helper"
```

---

## Task 5: Session builder + streak + mastery

**Files:** `src/modules/practice/domain/{session,streak,mastery}.ts`; tests `tests/modules/practice/{session,streak,mastery}.test.ts`

- [ ] **Step 1: failing tests**

`tests/modules/practice/session.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { buildSession } from '@/modules/practice/domain/session'
import type { Card } from '@/shared/content/types'

const card = (id: string, topic: string): Card =>
  ({ id, topic, type: 'escribir', prompt: 'p', answer: ['a'], rationaleRef: 'habcde' }) as Card

describe('buildSession', () => {
  const cards = [card('a', 'X'), card('b', 'X'), card('c', 'Y'), card('d', 'Y'), card('e', 'Z')]
  it('includes due cards (no state = due) capped', () => {
    const s = buildSession(cards, {}, '2026-06-19', { cap: 3, maxNew: 3 })
    expect(s.length).toBe(3)
  })
  it('avoids adjacent same-topic when possible', () => {
    const s = buildSession(cards, {}, '2026-06-19', { cap: 5, maxNew: 5 })
    let adjacent = 0
    for (let i = 1; i < s.length; i++) if (s[i].topic === s[i - 1].topic) adjacent++
    expect(adjacent).toBe(0)
  })
  it('excludes cards not yet due', () => {
    const states = { a: { box: 3, due: '2026-07-01' } }
    const s = buildSession(cards, states, '2026-06-19', { cap: 10, maxNew: 10 })
    expect(s.find(c => c.id === 'a')).toBeUndefined()
  })
})
```

`tests/modules/practice/streak.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { updateStreak } from '@/modules/practice/domain/streak'

describe('updateStreak', () => {
  it('same day is a no-op', () => {
    expect(updateStreak({ current: 3, lastDay: '2026-06-19' }, '2026-06-19')).toEqual({ current: 3, lastDay: '2026-06-19' })
  })
  it('consecutive day increments', () => {
    expect(updateStreak({ current: 3, lastDay: '2026-06-18' }, '2026-06-19')).toEqual({ current: 4, lastDay: '2026-06-19' })
  })
  it('gap resets to 1', () => {
    expect(updateStreak({ current: 9, lastDay: '2026-06-10' }, '2026-06-19')).toEqual({ current: 1, lastDay: '2026-06-19' })
  })
  it('first ever → 1', () => {
    expect(updateStreak({ current: 0 }, '2026-06-19')).toEqual({ current: 1, lastDay: '2026-06-19' })
  })
})
```

`tests/modules/practice/mastery.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { masteryByTopic } from '@/modules/practice/domain/mastery'
import type { Card } from '@/shared/content/types'

const card = (id: string, topic: string): Card =>
  ({ id, topic, type: 'escribir', prompt: 'p', answer: ['a'], rationaleRef: 'habcde' }) as Card

describe('masteryByTopic', () => {
  it('pct = cards in box>=4 over topic total', () => {
    const cards = [card('a', 'X'), card('b', 'X'), card('c', 'Y')]
    const states = { a: { box: 4, due: '' }, b: { box: 2, due: '' } }
    const m = masteryByTopic(cards, states)
    const x = m.find(t => t.topic === 'X')!
    expect(x.pct).toBe(50)
    expect(x.count).toBe(2)
    const y = m.find(t => t.topic === 'Y')!
    expect(y.pct).toBe(0)
  })
})
```

- [ ] **Step 2: run** `./node_modules/.bin/vitest run -- "practice/session|practice/streak|practice/mastery"` → FAIL.

- [ ] **Step 3: implement `session.ts`**
```ts
import type { Card } from '@/shared/content/types'
import type { CardState } from './srs'

interface Opts { cap?: number; maxNew?: number }

// Greedy interleave: repeatedly pick the next card whose topic differs from the
// previous one when possible, to avoid same-topic runs.
function interleave(cards: Card[]): Card[] {
  const out: Card[] = []
  const pool = [...cards]
  let prevTopic: string | undefined
  while (pool.length) {
    let idx = pool.findIndex(c => c.topic !== prevTopic)
    if (idx === -1) idx = 0
    const [picked] = pool.splice(idx, 1)
    out.push(picked)
    prevTopic = picked.topic
  }
  return out
}

export function buildSession(
  cards: Card[],
  states: Record<string, CardState>,
  today: string,
  opts: Opts = {},
): Card[] {
  const cap = opts.cap ?? 14
  const maxNew = opts.maxNew ?? 4
  const due: Card[] = []
  const fresh: Card[] = []
  for (const c of cards) {
    const st = states[c.id]
    if (!st) fresh.push(c)
    else if (st.due <= today) due.push(c)
  }
  due.sort((a, b) => (states[a.id]!.due < states[b.id]!.due ? -1 : 1))
  const picked = [...due, ...fresh.slice(0, maxNew)].slice(0, cap)
  return interleave(picked)
}
```
`streak.ts`
```ts
import { addDays } from './dates'

export interface Streak { current: number; lastDay?: string }

export function updateStreak(s: Streak, today: string): Required<Streak> {
  if (s.lastDay === today) return { current: s.current, lastDay: today }
  if (s.lastDay && addDays(s.lastDay, 1) === today) return { current: s.current + 1, lastDay: today }
  return { current: 1, lastDay: today }
}
```
`mastery.ts`
```ts
import type { Card } from '@/shared/content/types'
import type { CardState } from './srs'

export interface TopicMastery { topic: string; pct: number; count: number }

export function masteryByTopic(cards: Card[], states: Record<string, CardState>): TopicMastery[] {
  const byTopic = new Map<string, { total: number; mastered: number }>()
  for (const c of cards) {
    const t = byTopic.get(c.topic) ?? { total: 0, mastered: 0 }
    t.total += 1
    if ((states[c.id]?.box ?? 1) >= 4) t.mastered += 1
    byTopic.set(c.topic, t)
  }
  return [...byTopic.entries()].map(([topic, { total, mastered }]) => ({
    topic,
    count: total,
    pct: total ? Math.round((mastered / total) * 100) : 0,
  }))
}
```

- [ ] **Step 4: run** `./node_modules/.bin/vitest run -- "practice/session|practice/streak|practice/mastery" && ./node_modules/.bin/tsc --noEmit -p tsconfig.json` → PASS + tsc 0.

- [ ] **Step 5: commit**
```bash
/usr/bin/git add src/modules/practice/domain/session.ts src/modules/practice/domain/streak.ts src/modules/practice/domain/mastery.ts tests/modules/practice/session.test.ts tests/modules/practice/streak.test.ts tests/modules/practice/mastery.test.ts
/usr/bin/git commit -m "feat(practice): session builder (interleave), streak, mastery"
```

---

## Task 6: Cloze parser + grading

**Files:** `src/modules/practice/domain/{cloze,grading}.ts`; tests `tests/modules/practice/{cloze,grading}.test.ts`

- [ ] **Step 1: failing tests**

`tests/modules/practice/cloze.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { parseCloze } from '@/modules/practice/domain/cloze'

describe('parseCloze', () => {
  it('splits {{...}} into segments + blank count', () => {
    const r = parseCloze('A {{x}}, B {{y}}, C')
    expect(r.blanks).toBe(2)
    expect(r.segments).toEqual(['A ', ', B ', ', C'])
  })
})
```

`tests/modules/practice/grading.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { grade } from '@/modules/practice/domain/grading'
import type { Card } from '@/shared/content/types'

const c = (over: Partial<Card>): Card =>
  ({ id: 'x', topic: 'T', type: 'escribir', prompt: 'p', answer: ['a'], rationaleRef: 'habcde', ...over }) as Card

describe('grade', () => {
  it('escribir: normalizes accents/case and matches list', () => {
    expect(grade(c({ answer: ['vía aérea', 'apertura'] }), 'VIA AEREA').correct).toBe(true)
    expect(grade(c({ answer: ['hemorragia'] }), 'pulmon').correct).toBe(false)
  })
  it('escribir: multi-word answer accepts all-tokens-present any order', () => {
    expect(grade(c({ answer: ['respiracion circulacion aspecto general'] }), 'aspecto general, respiracion y circulacion').correct).toBe(true)
  })
  it('ordenar: exact sequence', () => {
    expect(grade(c({ type: 'ordenar', answer: ['H', 'A', 'B'] }), ['H', 'A', 'B']).correct).toBe(true)
    expect(grade(c({ type: 'ordenar', answer: ['H', 'A', 'B'] }), ['A', 'H', 'B']).correct).toBe(false)
  })
  it('cloze: all blanks must match (normalized)', () => {
    const card = c({ type: 'cloze', prompt: '{{Verbal}} y {{Dolor}}', answer: ['verbal', 'dolor'] })
    expect(grade(card, ['Verbal', 'DOLOR']).correct).toBe(true)
    expect(grade(card, ['verbal', 'x']).correct).toBe(false)
  })
  it('elegir: matches answer[0]', () => {
    const card = c({ type: 'elegir', answer: ['No, nada por boca'], options: ['No, nada por boca', 'Sí'] })
    expect(grade(card, 'No, nada por boca').correct).toBe(true)
    expect(grade(card, 'Sí').correct).toBe(false)
  })
})
```

- [ ] **Step 2: run** `./node_modules/.bin/vitest run -- "practice/cloze|practice/grading"` → FAIL.

- [ ] **Step 3: implement `cloze.ts`**
```ts
export interface ClozeParts { segments: string[]; blanks: number }

// Split a prompt on {{...}} markers. segments.length === blanks + 1.
export function parseCloze(prompt: string): ClozeParts {
  const segments = prompt.split(/\{\{[^}]*\}\}/)
  return { segments, blanks: segments.length - 1 }
}
```
`grading.ts`
```ts
import type { Card } from '@/shared/content/types'

export type UserAnswer = string | string[]
export interface GradeResult { correct: boolean; correctText: string }

export function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '') // strip diacritics (portable unicode property escape)
    .replace(/[^\p{L}\p{N}\s]/gu, ' ') // strip punctuation
    .replace(/\s+/g, ' ')
    .trim()
}

function tokens(s: string): string[] {
  return normalize(s).split(' ').filter(Boolean)
}

function gradeWrite(card: Card, input: string): boolean {
  const n = normalize(input)
  return card.answer.some(ans => {
    const na = normalize(ans)
    if (n === na) return true
    const at = tokens(ans)
    if (at.length > 1) {
      const inSet = new Set(tokens(input))
      return at.every(t => inSet.has(t))
    }
    return false
  })
}

export function grade(card: Card, userAnswer: UserAnswer): GradeResult {
  switch (card.type) {
    case 'ordenar': {
      const ua = userAnswer as string[]
      const correct = ua.length === card.answer.length && ua.every((v, i) => v === card.answer[i])
      return { correct, correctText: card.answer.join(' → ') }
    }
    case 'cloze': {
      const ua = userAnswer as string[]
      const correct =
        ua.length === card.answer.length && ua.every((v, i) => normalize(v) === normalize(card.answer[i]))
      return { correct, correctText: card.answer.join(', ') }
    }
    case 'elegir': {
      return { correct: (userAnswer as string) === card.answer[0], correctText: card.answer[0] }
    }
    case 'escribir':
    default: {
      return { correct: gradeWrite(card, userAnswer as string), correctText: card.answer[0] }
    }
  }
}
```

- [ ] **Step 4: run** `./node_modules/.bin/vitest run -- "practice/cloze|practice/grading"` → PASS.

- [ ] **Step 5: commit**
```bash
/usr/bin/git add src/modules/practice/domain/cloze.ts src/modules/practice/domain/grading.ts tests/modules/practice/cloze.test.ts tests/modules/practice/grading.test.ts
/usr/bin/git commit -m "feat(practice): cloze parser + per-format grading with normalization"
```

---

## Task 7: Practice store + selectors + fixture cards

**Files:** `src/modules/practice/domain/store.ts`, `src/modules/practice/content/selectors.ts`, `tests/fixtures/content.fixture.ts`; tests `tests/modules/practice/{store,selectors}.test.ts`

- [ ] **Step 1: enrich the fixture** — in `tests/fixtures/content.fixture.ts`, replace `cards: []` with four cards (one per type):
```ts
  cards: [
    { id: 't-w', topic: 'HABCDE', type: 'escribir', prompt: '¿H?', answer: ['hemorragia'], rationaleRef: 'habcde' },
    { id: 't-o', topic: 'HABCDE', type: 'ordenar', prompt: 'Ordená', answer: ['H', 'A', 'B'], rationaleRef: 'habcde' },
    { id: 't-c', topic: 'AVDN', type: 'cloze', prompt: 'A {{Verbal}}', answer: ['verbal'], rationaleRef: 'avdn' },
    { id: 't-e', topic: 'Manejo', type: 'elegir', prompt: '¿Agua?', answer: ['No'], options: ['No', 'Sí'], rationaleRef: 'secundaria' },
  ],
```
(`secundaria` resolves via the Task-2 alias; `avdn`/`habcde` are acronym ids — so the Task-2 "every fixture card ref resolves" test now passes meaningfully.)

- [ ] **Step 2: failing tests**

`tests/modules/practice/selectors.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { getDueCards, getTopics } from '@/modules/practice/content/selectors'
import { validContent } from '../../fixtures/content.fixture'

describe('practice selectors', () => {
  it('getDueCards: no state = due', () => {
    expect(getDueCards(validContent.cards, {}, '2026-06-19').length).toBe(validContent.cards.length)
  })
  it('getTopics: distinct topics', () => {
    expect(getTopics(validContent.cards)).toEqual(expect.arrayContaining(['HABCDE', 'AVDN', 'Manejo']))
  })
})
```

`tests/modules/practice/store.test.ts`:
```ts
import { describe, it, expect, beforeEach } from 'vitest'
import 'fake-indexeddb/auto'
import { __resetStorage } from '@/shared/domain/storage'
import { loadStates, saveState, loadStreak, saveStreak } from '@/modules/practice/domain/store'

describe('practice store', () => {
  beforeEach(() => __resetStorage())
  it('round-trips card states', async () => {
    await saveState('t-w', { box: 2, due: '2026-06-20' })
    expect((await loadStates())['t-w']).toEqual({ box: 2, due: '2026-06-20' })
  })
  it('round-trips streak', async () => {
    await saveStreak({ current: 3, lastDay: '2026-06-19' })
    expect(await loadStreak()).toEqual({ current: 3, lastDay: '2026-06-19' })
  })
})
```

- [ ] **Step 3: run** `./node_modules/.bin/vitest run -- "practice/selectors|practice/store"` → FAIL.

- [ ] **Step 4: implement keys** — in `src/shared/domain/storage/keys.ts`, add:
```ts
export const KEYS = {
  storageVersion: 'meta:storageVersion',
  lastLearnNode: 'progress:learn:lastNode',
  practiceSrs: 'practice:srs',
  practiceStreak: 'practice:streak',
} as const
```
`src/modules/practice/domain/store.ts`
```ts
import { getStorage } from '@/shared/domain/storage'
import { KEYS } from '@/shared/domain/storage/keys'
import type { CardState } from './srs'
import type { Streak } from './streak'

export async function loadStates(): Promise<Record<string, CardState>> {
  const kv = await getStorage()
  return (await kv.get<Record<string, CardState>>(KEYS.practiceSrs)) ?? {}
}

export async function saveState(cardId: string, state: CardState): Promise<void> {
  const kv = await getStorage()
  const all = (await kv.get<Record<string, CardState>>(KEYS.practiceSrs)) ?? {}
  all[cardId] = state
  await kv.set(KEYS.practiceSrs, all)
}

export async function loadStreak(): Promise<Streak> {
  const kv = await getStorage()
  return (await kv.get<Streak>(KEYS.practiceStreak)) ?? { current: 0 }
}

export async function saveStreak(s: Streak): Promise<void> {
  const kv = await getStorage()
  await kv.set(KEYS.practiceStreak, s)
}
```
`src/modules/practice/content/selectors.ts`
```ts
import type { Card } from '@/shared/content/types'
import type { CardState } from '@/modules/practice/domain/srs'

export function getDueCards(cards: Card[], states: Record<string, CardState>, today: string): Card[] {
  return cards.filter(c => {
    const st = states[c.id]
    return !st || st.due <= today
  })
}

export function getTopics(cards: Card[]): string[] {
  return [...new Set(cards.map(c => c.topic))]
}
```

- [ ] **Step 5: run** `./node_modules/.bin/vitest run -- "practice/selectors|practice/store|rationale" && ./node_modules/.bin/tsc --noEmit -p tsconfig.json` → PASS + tsc 0 (the Task-2 fixture-card-ref test now runs against real cards).

- [ ] **Step 6: commit**
```bash
/usr/bin/git add src/shared/domain/storage/keys.ts src/modules/practice/domain/store.ts src/modules/practice/content/selectors.ts tests/fixtures/content.fixture.ts tests/modules/practice/selectors.test.ts tests/modules/practice/store.test.ts
/usr/bin/git commit -m "feat(practice): SRS/streak store + selectors + fixture cards"
```

---

## Task 8: Card UI — CardShell, WriteCard, ChoiceCard

**Files:** `src/modules/practice/ui/CardShell.tsx` (+css), `src/modules/practice/ui/cards/WriteCard.tsx`, `ChoiceCard.tsx` (+css); test `tests/modules/practice/cards.test.tsx`

Each card component takes `{ card, onAnswer }` where `onAnswer(userAnswer)` is called on "Comprobar". `CardShell` renders header (topic · type · prompt) + the answer slot + the Comprobar button.

- [ ] **Step 1: failing test**
```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { WriteCard } from '@/modules/practice/ui/cards/WriteCard'
import { ChoiceCard } from '@/modules/practice/ui/cards/ChoiceCard'
import type { Card } from '@/shared/content/types'

describe('practice cards', () => {
  it('WriteCard submits the typed answer', () => {
    const card = { id: 'w', topic: 'T', type: 'escribir', prompt: '¿H?', answer: ['hemorragia'], rationaleRef: 'habcde' } as Card
    const onAnswer = vi.fn()
    render(<WriteCard card={card} onAnswer={onAnswer} />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'hemorragia' } })
    fireEvent.click(screen.getByRole('button', { name: /Comprobar/i }))
    expect(onAnswer).toHaveBeenCalledWith('hemorragia')
  })
  it('ChoiceCard submits the selected option', () => {
    const card = { id: 'e', topic: 'T', type: 'elegir', prompt: '¿?', answer: ['No'], options: ['No', 'Sí'], rationaleRef: 'secundaria' } as Card
    const onAnswer = vi.fn()
    render(<ChoiceCard card={card} onAnswer={onAnswer} />)
    fireEvent.click(screen.getByRole('button', { name: 'Sí' }))
    fireEvent.click(screen.getByRole('button', { name: /Comprobar/i }))
    expect(onAnswer).toHaveBeenCalledWith('Sí')
  })
})
```

- [ ] **Step 2: run** `./node_modules/.bin/vitest run -- practice/cards` → FAIL.

- [ ] **Step 3: implement `CardShell.module.css`**
```css
.card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); box-shadow: var(--shadow-card); padding: var(--space-4); }
.meta { display: flex; justify-content: space-between; font-family: var(--font-sans); font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--muted); margin-bottom: var(--space-3); }
.type { background: var(--primary); color: var(--on-critical); border-radius: var(--radius-pill); padding: 2px 8px; font-weight: 700; }
.prompt { font-family: var(--font-serif); font-weight: 700; font-size: 18px; margin: 0 0 var(--space-4); }
.submit { margin-top: var(--space-4); width: 100%; background: var(--primary); color: var(--on-critical); border: none; border-radius: var(--radius-lg); padding: 13px; font-family: var(--font-sans); font-weight: 700; font-size: 15px; min-height: 44px; }
.input { width: 100%; box-sizing: border-box; border: 1px solid var(--border); border-radius: var(--radius-md); background: var(--bg); padding: 12px; font-family: var(--font-serif); font-size: 16px; color: var(--ink); }
.option { display: block; width: 100%; text-align: left; background: var(--bg); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 12px 14px; margin-bottom: var(--space-2); font-family: var(--font-serif); font-size: 15px; color: var(--ink); min-height: 44px; }
.option.sel { border-color: var(--primary); box-shadow: inset 0 0 0 1px var(--primary); }
```
`CardShell.tsx`
```tsx
import type { ReactNode } from 'react'
import type { Card } from '@/shared/content/types'
import styles from './CardShell.module.css'

const TYPE_LABEL: Record<Card['type'], string> = {
  ordenar: 'Ordenar', escribir: 'Escribir', cloze: 'Cloze', elegir: 'Elegir',
}

export function CardShell({ card, children, onSubmit }: { card: Card; children: ReactNode; onSubmit: () => void }) {
  return (
    <div className={styles.card}>
      <div className={styles.meta}>
        <span>{card.topic}</span>
        <span className={styles.type}>{TYPE_LABEL[card.type]}</span>
      </div>
      <p className={styles.prompt}>{card.prompt}</p>
      {children}
      <button className={styles.submit} onClick={onSubmit}>Comprobar</button>
    </div>
  )
}

export { styles as shellStyles }
```
`cards/WriteCard.tsx`
```tsx
import { useState } from 'react'
import type { Card } from '@/shared/content/types'
import { CardShell, shellStyles } from '../CardShell'

export function WriteCard({ card, onAnswer }: { card: Card; onAnswer: (a: string) => void }) {
  const [value, setValue] = useState('')
  return (
    <CardShell card={card} onSubmit={() => onAnswer(value)}>
      <input
        className={shellStyles.input}
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="Escribí tu respuesta…"
        aria-label="Respuesta"
      />
    </CardShell>
  )
}
```
`cards/ChoiceCard.tsx`
```tsx
import { useState } from 'react'
import type { Card } from '@/shared/content/types'
import { CardShell, shellStyles } from '../CardShell'

export function ChoiceCard({ card, onAnswer }: { card: Card; onAnswer: (a: string) => void }) {
  const [sel, setSel] = useState<string | null>(null)
  return (
    <CardShell card={card} onSubmit={() => sel != null && onAnswer(sel)}>
      {(card.options ?? []).map(opt => (
        <button
          key={opt}
          className={`${shellStyles.option} ${sel === opt ? shellStyles.sel : ''}`}
          onClick={() => setSel(opt)}
        >
          {opt}
        </button>
      ))}
    </CardShell>
  )
}
```

- [ ] **Step 4: run** `./node_modules/.bin/vitest run -- practice/cards && ./node_modules/.bin/tsc --noEmit -p tsconfig.json` → PASS + tsc 0.

- [ ] **Step 5: commit**
```bash
/usr/bin/git add src/modules/practice/ui/CardShell.tsx src/modules/practice/ui/CardShell.module.css src/modules/practice/ui/cards/WriteCard.tsx src/modules/practice/ui/cards/ChoiceCard.tsx tests/modules/practice/cards.test.tsx
/usr/bin/git commit -m "feat(practice): CardShell + WriteCard + ChoiceCard"
```

---

## Task 9: OrderCard + ClozeCard

**Files:** `src/modules/practice/ui/cards/OrderCard.tsx`, `ClozeCard.tsx`; test `tests/modules/practice/cards-order-cloze.test.tsx`

- [ ] **Step 1: failing test**
```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { OrderCard } from '@/modules/practice/ui/cards/OrderCard'
import { ClozeCard } from '@/modules/practice/ui/cards/ClozeCard'
import type { Card } from '@/shared/content/types'

describe('order + cloze cards', () => {
  it('OrderCard submits the current order; ↑ moves an item up', () => {
    const card = { id: 'o', topic: 'T', type: 'ordenar', prompt: 'Ordená', answer: ['H', 'A', 'B'], rationaleRef: 'habcde' } as Card
    const onAnswer = vi.fn()
    render(<OrderCard card={card} onAnswer={onAnswer} />)
    // move the 2nd item up (buttons labelled "Subir <item>")
    fireEvent.click(screen.getByRole('button', { name: /Subir A/i }))
    fireEvent.click(screen.getByRole('button', { name: /Comprobar/i }))
    expect(onAnswer).toHaveBeenCalledWith(['A', 'H', 'B'])
  })
  it('ClozeCard submits one value per blank', () => {
    const card = { id: 'c', topic: 'T', type: 'cloze', prompt: 'A {{Verbal}} y {{Dolor}}', answer: ['verbal', 'dolor'], rationaleRef: 'avdn' } as Card
    const onAnswer = vi.fn()
    render(<ClozeCard card={card} onAnswer={onAnswer} />)
    const inputs = screen.getAllByRole('textbox')
    expect(inputs).toHaveLength(2)
    fireEvent.change(inputs[0], { target: { value: 'verbal' } })
    fireEvent.change(inputs[1], { target: { value: 'dolor' } })
    fireEvent.click(screen.getByRole('button', { name: /Comprobar/i }))
    expect(onAnswer).toHaveBeenCalledWith(['verbal', 'dolor'])
  })
})
```

- [ ] **Step 2: run** `./node_modules/.bin/vitest run -- cards-order-cloze` → FAIL.

- [ ] **Step 3: implement `cards/OrderCard.tsx`** (accessible ↑↓ baseline; the items are the `answer` shuffled — for the test we start from `answer` order but moving A up yields ['A','H','B'])
```tsx
import { useState } from 'react'
import type { Card } from '@/shared/content/types'
import { CardShell, shellStyles } from '../CardShell'

// Deterministic initial order: reverse of answer (so it always differs and tests are stable).
function initialOrder(answer: string[]): string[] {
  return [...answer].reverse()
}

export function OrderCard({ card, onAnswer }: { card: Card; onAnswer: (a: string[]) => void }) {
  const [items, setItems] = useState<string[]>(() => initialOrder(card.answer))
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= items.length) return
    const next = [...items]
    ;[next[i], next[j]] = [next[j], next[i]]
    setItems(next)
  }
  return (
    <CardShell card={card} onSubmit={() => onAnswer(items)}>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {items.map((it, i) => (
          <li key={it} className={shellStyles.option} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ flex: 1 }}>{it}</span>
            <button aria-label={`Subir ${it}`} onClick={() => move(i, -1)} disabled={i === 0}>↑</button>
            <button aria-label={`Bajar ${it}`} onClick={() => move(i, 1)} disabled={i === items.length - 1}>↓</button>
          </li>
        ))}
      </ul>
    </CardShell>
  )
}
```
> Note: in real content the initial order should be shuffled; `reverse()` is a deterministic, always-different baseline that keeps tests stable and avoids `Math.random()` (which is unavailable in some contexts). A future enhancement can add drag-and-drop on top.

`cards/ClozeCard.tsx`
```tsx
import { useState, Fragment } from 'react'
import type { Card } from '@/shared/content/types'
import { parseCloze } from '@/modules/practice/domain/cloze'
import { CardShell, shellStyles } from '../CardShell'

export function ClozeCard({ card, onAnswer }: { card: Card; onAnswer: (a: string[]) => void }) {
  const { segments, blanks } = parseCloze(card.prompt)
  const [values, setValues] = useState<string[]>(() => Array(blanks).fill(''))
  const set = (i: number, v: string) => setValues(prev => prev.map((x, k) => (k === i ? v : x)))
  return (
    <CardShell card={card} onSubmit={() => onAnswer(values)}>
      <p style={{ fontFamily: 'var(--font-serif)', fontSize: 16, lineHeight: 2 }}>
        {segments.map((seg, i) => (
          <Fragment key={i}>
            {seg}
            {i < blanks && (
              <input
                className={shellStyles.input}
                style={{ display: 'inline-block', width: 110, padding: '4px 8px', margin: '0 4px' }}
                value={values[i]}
                onChange={e => set(i, e.target.value)}
                aria-label={`Hueco ${i + 1}`}
              />
            )}
          </Fragment>
        ))}
      </p>
    </CardShell>
  )
}
```

- [ ] **Step 4: run** `./node_modules/.bin/vitest run -- cards-order-cloze && ./node_modules/.bin/tsc --noEmit -p tsconfig.json` → PASS + tsc 0.

- [ ] **Step 5: commit**
```bash
/usr/bin/git add src/modules/practice/ui/cards/OrderCard.tsx src/modules/practice/ui/cards/ClozeCard.tsx tests/modules/practice/cards-order-cloze.test.tsx
/usr/bin/git commit -m "feat(practice): OrderCard (accessible reorder) + ClozeCard"
```

---

## Task 10: conceptLinks + FeedbackPanel

**Files:** `src/modules/practice/domain/conceptLinks.ts`, `src/modules/practice/ui/FeedbackPanel.tsx` (+css); test `tests/modules/practice/feedback.test.tsx`

- [ ] **Step 1: failing test**
```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { FeedbackPanel } from '@/modules/practice/ui/FeedbackPanel'
import { linkForRef } from '@/modules/practice/domain/conceptLinks'

describe('feedback', () => {
  it('linkForRef maps a known concept to a chain route, unknown to /', () => {
    expect(linkForRef('habcde')).toBe('/chain/primary-habcde-h')
    expect(linkForRef('zzz')).toBe('/')
  })
  it('shows the rationale, correct banner, and box movement', () => {
    render(
      <MemoryRouter>
        <FeedbackPanel
          correct
          correctText="hemorragia"
          rationale="Lo que mata primero, primero."
          rationaleRef="habcde"
          fromBox={2}
          toBox={3}
          onContinue={() => {}}
        />
      </MemoryRouter>,
    )
    expect(screen.getByText(/Por qué/i)).toBeInTheDocument()
    expect(screen.getByText(/mata primero/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Ver .* en Aprender/i })).toHaveAttribute('href', '/chain/primary-habcde-h')
  })
})
```

- [ ] **Step 2: run** `./node_modules/.bin/vitest run -- practice/feedback` → FAIL.

- [ ] **Step 3: implement `conceptLinks.ts`**
```ts
// Map a card rationaleRef to a representative Module-1 node route (ids per chainModel).
const CONCEPT_TO_NODE: Record<string, string> = {
  habcde: '/chain/primary-habcde-h',
  avdn: '/chain/secondary-avdn',
  muestra: '/chain/secondary-muestra',
  dias: '/chain/secondary-dias',
  pilar: '/chain/secondary-pilar',
  shock: '/chain/secondary-vital-signs',
  signos_vitales: '/chain/secondary-vital-signs',
  secundaria: '/chain/secondary-vital-signs',
  tev: '/chain/scene-impression',
  escena: '/chain/scene-safety',
  primaria: '/chain/primary-habcde-h',
  mdd: '/chain/scene-mechanism',
  msc: '/chain/scene-mechanism',
  soap: '/quickref',
  niveles_evacuacion: '/chain/evacuation-decision',
}

export function linkForRef(ref: string): string {
  return CONCEPT_TO_NODE[ref] ?? '/'
}
```
`FeedbackPanel.module.css`
```css
.banner { padding: 14px 16px; font-family: var(--font-sans); font-weight: 700; font-size: 15px; border-radius: var(--radius-lg) var(--radius-lg) 0 0; }
.ok { background: var(--mild); color: var(--on-mild); }
.bad { background: var(--primary); color: var(--on-critical); }
.body { background: var(--surface); border: 1px solid var(--border); border-top: none; border-radius: 0 0 var(--radius-lg) var(--radius-lg); padding: var(--space-4); }
.why { border-left: 3px solid var(--primary); padding-left: var(--space-3); margin: var(--space-3) 0; }
.label { font-family: var(--font-sans); font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--muted); font-weight: 600; }
.continue { margin-top: var(--space-4); width: 100%; background: var(--ink); color: var(--bg); border: none; border-radius: var(--radius-lg); padding: 13px; font-family: var(--font-sans); font-weight: 700; min-height: 44px; }
.box { font-family: var(--font-sans); font-size: 12px; color: var(--ink-soft); margin-top: var(--space-3); }
```
`FeedbackPanel.tsx`
```tsx
import { Link } from 'react-router-dom'
import { linkForRef } from '@/modules/practice/domain/conceptLinks'
import styles from './FeedbackPanel.module.css'

export function FeedbackPanel({
  correct, correctText, rationale, rationaleRef, fromBox, toBox, onContinue,
}: {
  correct: boolean
  correctText: string
  rationale?: string
  rationaleRef: string
  fromBox: number
  toBox: number
  onContinue: () => void
}) {
  return (
    <div>
      <div className={`${styles.banner} ${correct ? styles.ok : styles.bad}`}>
        {correct ? '✓ ¡Bien!' : '✗ Revisalo'}
      </div>
      <div className={styles.body}>
        {!correct && (
          <p>
            <span className={styles.label}>Correcta</span>
            <br />
            {correctText}
          </p>
        )}
        {rationale && (
          <div className={styles.why}>
            <span className={styles.label}>Por qué</span>
            <p style={{ fontFamily: 'var(--font-serif)', margin: '4px 0 0' }}>{rationale}</p>
          </div>
        )}
        <Link to={linkForRef(rationaleRef)} style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 13 }}>
          Ver "{rationaleRef}" en Aprender →
        </Link>
        <p className={styles.box}>Caja {fromBox} → {toBox}</p>
        <button className={styles.continue} onClick={onContinue}>Continuar</button>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: run** `./node_modules/.bin/vitest run -- practice/feedback && ./node_modules/.bin/tsc --noEmit -p tsconfig.json` → PASS + tsc 0.

- [ ] **Step 5: commit**
```bash
/usr/bin/git add src/modules/practice/domain/conceptLinks.ts src/modules/practice/ui/FeedbackPanel.tsx src/modules/practice/ui/FeedbackPanel.module.css tests/modules/practice/feedback.test.tsx
/usr/bin/git commit -m "feat(practice): conceptLinks + FeedbackPanel (elaborative feedback)"
```

---

## Task 11: SessionRunner + Session route

**Files:** `src/modules/practice/ui/SessionRunner.tsx`, `src/modules/practice/routes/Session.tsx`; test `tests/modules/practice/session-runner.test.tsx`

`SessionRunner` takes a `Card[]` queue + a `rationaleMap`, drives each card → grade → FeedbackPanel → next, persists each result (schedule + saveState), and calls `onDone(summary)` at the end.

- [ ] **Step 1: failing test**
```tsx
import { describe, it, expect, vi } from 'vitest'
import 'fake-indexeddb/auto'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { __resetStorage } from '@/shared/domain/storage'
import { SessionRunner } from '@/modules/practice/ui/SessionRunner'
import type { Card } from '@/shared/content/types'

const cards: Card[] = [
  { id: 't-w', topic: 'HABCDE', type: 'escribir', prompt: '¿H?', answer: ['hemorragia'], rationaleRef: 'habcde' } as Card,
]

it('grades an answer, shows feedback, and finishes', async () => {
  __resetStorage()
  const onDone = vi.fn()
  const map = new Map([['habcde', 'Lo que mata primero, primero.']])
  render(
    <MemoryRouter>
      <SessionRunner queue={cards} rationaleMap={map} today="2026-06-19" onDone={onDone} />
    </MemoryRouter>,
  )
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'hemorragia' } })
  fireEvent.click(screen.getByRole('button', { name: /Comprobar/i }))
  expect(await screen.findByText(/¡Bien!/i)).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: /Continuar/i }))
  await waitFor(() => expect(onDone).toHaveBeenCalled())
  expect(onDone.mock.calls[0][0]).toMatchObject({ correct: 1, wrong: 0, total: 1 })
})
```

- [ ] **Step 2: run** `./node_modules/.bin/vitest run -- session-runner` → FAIL.

- [ ] **Step 3: implement `SessionRunner.tsx`**
```tsx
import { useState } from 'react'
import type { Card } from '@/shared/content/types'
import { getRationale } from '@/shared/domain/rationale'
import { grade, type UserAnswer } from '@/modules/practice/domain/grading'
import { schedule, type CardState } from '@/modules/practice/domain/srs'
import { loadStates, saveState } from '@/modules/practice/domain/store'
import { WriteCard } from './cards/WriteCard'
import { ChoiceCard } from './cards/ChoiceCard'
import { OrderCard } from './cards/OrderCard'
import { ClozeCard } from './cards/ClozeCard'
import { FeedbackPanel } from './FeedbackPanel'

export interface SessionSummary { correct: number; wrong: number; total: number }

interface Feedback { correct: boolean; correctText: string; rationaleRef: string; fromBox: number; toBox: number; rationale?: string }

export function SessionRunner({
  queue, rationaleMap, today, onDone,
}: {
  queue: Card[]
  rationaleMap: Map<string, string>
  today: string
  onDone: (s: SessionSummary) => void
}) {
  const [i, setI] = useState(0)
  const [fb, setFb] = useState<Feedback | null>(null)
  const [score, setScore] = useState({ correct: 0, wrong: 0 })
  const card = queue[i]

  const answer = async (ua: UserAnswer) => {
    const r = grade(card, ua)
    const states = await loadStates()
    const prev: CardState | undefined = states[card.id]
    const next = schedule(prev, r.correct ? 'correct' : 'wrong', today)
    await saveState(card.id, next)
    setScore(s => ({ correct: s.correct + (r.correct ? 1 : 0), wrong: s.wrong + (r.correct ? 0 : 1) }))
    setFb({
      correct: r.correct,
      correctText: r.correctText,
      rationaleRef: card.rationaleRef,
      rationale: getRationale(card.rationaleRef, rationaleMap),
      fromBox: prev?.box ?? 1,
      toBox: next.box,
    })
  }

  const cont = () => {
    setFb(null)
    if (i + 1 >= queue.length) onDone({ ...score, total: queue.length })
    else setI(i + 1)
  }

  if (!card) return null
  if (fb) return <FeedbackPanel {...fb} onContinue={cont} />

  switch (card.type) {
    case 'ordenar': return <OrderCard card={card} onAnswer={answer} />
    case 'cloze': return <ClozeCard card={card} onAnswer={answer} />
    case 'elegir': return <ChoiceCard card={card} onAnswer={answer} />
    default: return <WriteCard card={card} onAnswer={answer} />
  }
}
```
`routes/Session.tsx`
```tsx
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadContent } from '@/shared/content/loader'
import { buildRationaleMap } from '@/shared/domain/rationale'
import { todayIso } from '@/modules/practice/domain/dates'
import { buildSession } from '@/modules/practice/domain/session'
import { loadStates, loadStreak, saveStreak } from '@/modules/practice/domain/store'
import { updateStreak } from '@/modules/practice/domain/streak'
import { SessionRunner, type SessionSummary } from '@/modules/practice/ui/SessionRunner'
import type { Card } from '@/shared/content/types'

export function Session() {
  const content = loadContent()
  const map = useMemo(() => buildRationaleMap(content), [content])
  const today = todayIso()
  const [queue, setQueue] = useState<Card[] | null>(null)
  const [done, setDone] = useState<SessionSummary | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    loadStates().then(states => setQueue(buildSession(content.cards, states, today)))
  }, [content, today])

  const onDone = async (s: SessionSummary) => {
    const streak = await loadStreak()
    await saveStreak(updateStreak(streak, today))
    setDone(s)
  }

  if (done) {
    return (
      <div>
        <h1 style={{ fontFamily: 'var(--font-serif)' }}>Sesión terminada</h1>
        <p>Aciertos: {done.correct} · A repasar: {done.wrong}</p>
        <button onClick={() => navigate('/practice')} style={{ minHeight: 44 }}>Volver a Practicar</button>
      </div>
    )
  }
  if (!queue) return <p>Cargando…</p>
  if (queue.length === 0) return <p>No hay tarjetas para repasar. <button onClick={() => navigate('/practice')}>Volver</button></p>
  return <SessionRunner queue={queue} rationaleMap={map} today={today} onDone={onDone} />
}
```
Add `todayIso()` to `src/modules/practice/domain/dates.ts`:
```ts
export function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}
```

- [ ] **Step 4: run** `./node_modules/.bin/vitest run -- session-runner && ./node_modules/.bin/tsc --noEmit -p tsconfig.json` → PASS + tsc 0.

- [ ] **Step 5: commit**
```bash
/usr/bin/git add src/modules/practice/ui/SessionRunner.tsx src/modules/practice/routes/Session.tsx src/modules/practice/domain/dates.ts tests/modules/practice/session-runner.test.tsx
/usr/bin/git commit -m "feat(practice): SessionRunner + Session route (grade→feedback→persist→streak)"
```

---

## Task 12: PracticeHome + MasteryBars + module routes

**Files:** `src/modules/practice/ui/MasteryBars.tsx` (+css), `src/modules/practice/routes/PracticeHome.tsx`, `src/modules/practice/index.tsx`; test `tests/modules/practice/home.test.tsx`

- [ ] **Step 1: failing test**
```tsx
import { describe, it, expect, vi } from 'vitest'
import 'fake-indexeddb/auto'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { __resetStorage } from '@/shared/domain/storage'
import { validContent } from '../../fixtures/content.fixture'

vi.mock('@/shared/content/loader', () => ({ loadContent: () => validContent }))

import { PracticeHome } from '@/modules/practice/routes/PracticeHome'

it('shows due count and mastery, links to a session', async () => {
  __resetStorage()
  render(<MemoryRouter><PracticeHome /></MemoryRouter>)
  expect(await screen.findByText(/Repaso de hoy/i)).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /Empezar sesión/i })).toHaveAttribute('href', '/practice/session')
  await waitFor(() => expect(screen.getByText(/HABCDE/)).toBeInTheDocument())
})
```

- [ ] **Step 2: run** `./node_modules/.bin/vitest run -- practice/home` → FAIL.

- [ ] **Step 3: implement `MasteryBars.module.css`**
```css
.row { margin-bottom: var(--space-2); }
.head { display: flex; justify-content: space-between; font-family: var(--font-sans); font-size: 12px; margin-bottom: 3px; }
.pct { color: var(--muted); }
.bar { height: 7px; background: var(--border); border-radius: 99px; overflow: hidden; }
.fill { height: 100%; border-radius: 99px; background: var(--mild); }
.mid { background: var(--serious); }
.low { background: var(--primary); }
```
`MasteryBars.tsx`
```tsx
import type { TopicMastery } from '@/modules/practice/domain/mastery'
import styles from './MasteryBars.module.css'

export function MasteryBars({ items }: { items: TopicMastery[] }) {
  return (
    <div>
      {items.map(t => (
        <div key={t.topic} className={styles.row}>
          <div className={styles.head}>
            <span>{t.topic}</span>
            <span className={styles.pct}>{t.pct}%</span>
          </div>
          <div className={styles.bar}>
            <span
              className={`${styles.fill} ${t.pct < 50 ? styles.low : t.pct < 80 ? styles.mid : ''}`}
              style={{ width: `${t.pct}%`, display: 'block' }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
```
`routes/PracticeHome.tsx`
```tsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { loadContent } from '@/shared/content/loader'
import { todayIso } from '@/modules/practice/domain/dates'
import { getDueCards } from '@/modules/practice/content/selectors'
import { masteryByTopic, type TopicMastery } from '@/modules/practice/domain/mastery'
import { loadStates, loadStreak } from '@/modules/practice/domain/store'
import { MasteryBars } from '@/modules/practice/ui/MasteryBars'

export function PracticeHome() {
  const content = loadContent()
  const [due, setDue] = useState(0)
  const [streak, setStreak] = useState(0)
  const [mastery, setMastery] = useState<TopicMastery[]>([])

  useEffect(() => {
    const today = todayIso()
    void Promise.all([loadStates(), loadStreak()]).then(([states, s]) => {
      setDue(getDueCards(content.cards, states, today).length)
      setStreak(s.current)
      setMastery(masteryByTopic(content.cards, states))
    })
  }, [content])

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 24 }}>Repaso de hoy</h1>
      <p style={{ color: 'var(--ink-soft)' }}>{due} tarjeta{due === 1 ? '' : 's'} para repasar</p>
      <Link
        to="/practice/session"
        style={{
          display: 'inline-block', background: 'var(--primary)', color: 'var(--on-critical)',
          padding: '12px 18px', borderRadius: 'var(--radius-lg)', fontFamily: 'var(--font-sans)',
          fontWeight: 700, textDecoration: 'none', minHeight: 44,
        }}
      >
        Empezar sesión
      </Link>
      {streak > 0 && <p style={{ fontFamily: 'var(--font-sans)', marginTop: 'var(--space-4)' }}>🔥 Racha de {streak} día{streak === 1 ? '' : 's'}</p>}
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 16, marginTop: 'var(--space-5)' }}>Dominio por tema</h2>
      <MasteryBars items={mastery} />
    </div>
  )
}
```
`index.tsx`
```tsx
import type { RouteObject } from 'react-router-dom'
import { PracticeHome } from './routes/PracticeHome'
import { Session } from './routes/Session'

export const practiceRoutes: RouteObject[] = [
  { path: '/practice', element: <PracticeHome /> },
  { path: '/practice/session', element: <Session /> },
]
```

- [ ] **Step 4: run** `./node_modules/.bin/vitest run -- practice/home && ./node_modules/.bin/tsc --noEmit -p tsconfig.json` → PASS + tsc 0.

- [ ] **Step 5: commit**
```bash
/usr/bin/git add src/modules/practice/ui/MasteryBars.tsx src/modules/practice/ui/MasteryBars.module.css src/modules/practice/routes/PracticeHome.tsx src/modules/practice/index.tsx tests/modules/practice/home.test.tsx
/usr/bin/git commit -m "feat(practice): PracticeHome + MasteryBars + module routes"
```

---

## Task 13: Tab bar in Shell + router wiring

**Files:** `src/shared/app/Shell.tsx`, `src/shared/app/Shell.module.css`, `src/shared/app/router.tsx`; test `tests/shared/app/shell.test.tsx`

- [ ] **Step 1: failing test** — append to `tests/shared/app/shell.test.tsx`:
```tsx
import { MemoryRouter } from 'react-router-dom'

it('renders the tab bar with Aprender + Practicar', () => {
  render(
    <MemoryRouter initialEntries={['/practice']}>
      <Shell><p>x</p></Shell>
    </MemoryRouter>,
  )
  expect(screen.getByRole('link', { name: /Aprender/i })).toHaveAttribute('href', '/')
  expect(screen.getByRole('link', { name: /Practicar/i })).toHaveAttribute('href', '/practice')
})
```
> Note: the existing shell test renders `<Shell>` without a router; adding `Link`s means ALL shell tests must wrap in a router. Update the existing render(s) in this file to wrap `<Shell>` in `<MemoryRouter>`.

- [ ] **Step 2: run** `./node_modules/.bin/vitest run -- shell` → FAIL.

- [ ] **Step 3: implement** — `src/shared/app/Shell.tsx`:
```tsx
import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'

import styles from './Shell.module.css'
import { useOnlineStatus } from './pwa'

const TABS = [
  { to: '/', label: 'Aprender', match: (p: string) => p === '/' || p.startsWith('/chain') || p === '/example' || p === '/quickref' },
  { to: '/practice', label: 'Practicar', match: (p: string) => p.startsWith('/practice') },
] as const

export function Shell({ children }: { children: ReactNode }) {
  const online = useOnlineStatus()
  const { pathname } = useLocation()
  return (
    <>
      <a className="skip-link" href="#main">Saltar al contenido</a>
      <header className={styles.header}>
        <span>
          <span className={`${styles.dot} ${online ? styles.online : styles.offline}`} />
          {online ? 'En línea' : 'Offline-ready'}
        </span>
        <span>Entrenador WFA</span>
      </header>
      <main id="main" className={styles.main}>{children}</main>
      <nav className={styles.tabs} aria-label="Módulos">
        {TABS.map(t => (
          <Link key={t.to} to={t.to} className={`${styles.tab} ${t.match(pathname) ? styles.tabOn : ''}`}>
            {t.label}
          </Link>
        ))}
        <span className={`${styles.tab} ${styles.tabDisabled}`} aria-disabled>Escenarios</span>
      </nav>
    </>
  )
}
```
Add to `src/shared/app/Shell.module.css`:
```css
.main { max-width: 720px; margin: 0 auto; padding: var(--space-4); padding-bottom: 84px; }
.tabs {
  position: fixed; left: 0; right: 0; bottom: 0; z-index: 10;
  display: flex; background: var(--surface); border-top: 1px solid var(--border);
}
.tab {
  flex: 1; text-align: center; padding: 12px 0; min-height: 44px;
  font-family: var(--font-sans); font-size: 12px; color: var(--muted);
  text-decoration: none;
}
.tabOn { color: var(--primary); font-weight: 700; box-shadow: inset 0 2px 0 var(--primary); }
.tabDisabled { opacity: 0.45; }
```
(Replace the existing `.main` rule with the one above — it adds bottom padding for the fixed tab bar.)

`src/shared/app/router.tsx`:
```tsx
import { createHashRouter, Navigate, Outlet } from 'react-router-dom'

import { Shell } from './Shell'

import { learnRoutes } from '@/modules/learn'
import { practiceRoutes } from '@/modules/practice'

function Layout() {
  return (
    <Shell>
      <Outlet />
    </Shell>
  )
}

export const router = createHashRouter([
  {
    element: <Layout />,
    children: [...learnRoutes, ...practiceRoutes, { path: '*', element: <Navigate to="/" replace /> }],
  },
])
```

- [ ] **Step 4: run** `./node_modules/.bin/vitest run -- shell && ./node_modules/.bin/tsc --noEmit -p tsconfig.json && ./node_modules/.bin/eslint . --max-warnings 0` → PASS; tsc 0; eslint 0.

- [ ] **Step 5: commit**
```bash
/usr/bin/git add src/shared/app/Shell.tsx src/shared/app/Shell.module.css src/shared/app/router.tsx tests/shared/app/shell.test.tsx
/usr/bin/git commit -m "feat(app): bottom tab bar (Aprender/Practicar/Escenarios) + wire practice routes"
```

---

## Task 14: Full verification + visual check

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

- [ ] **Step 2: visual check** — `npm run dev`; confirm:
- Bottom tab bar (Aprender / Practicar / Escenarios-disabled) on every screen; Aprender still opens the chain map; switching tabs works.
- `/practice` shows due count, "Empezar sesión", streak (after a session), mastery bars.
- A session runs each card type (escribir/elegir/ordenar/cloze), grades, shows feedback with the "Por qué" rationale + working "Ver en Aprender" link, and the Leitner box movement; "Continuar" advances; end shows the summary.
- Reload mid-progress: SRS state persists (a previously-correct card is no longer due); offline (DevTools offline) still works.

- [ ] **Step 3: commit any fixes** (skip if none)
```bash
/usr/bin/git add -A && /usr/bin/git commit -m "fix(practice): address issues from visual verification"
```

---

## Definition of Done

- All gates green (content-check, vitest, both tsc, eslint, vite build) on raw binaries.
- The 42 real card refs resolve (rationale map) and the build guard catches a dangling card ref.
- A practice session works end-to-end for all four formats, with elaborative feedback (M1 rationale) + link, Leitner scheduling, streak, and per-topic mastery — offline, persisted.
- Tab-bar navigation between Aprender and Practicar; Module 1 unchanged.
