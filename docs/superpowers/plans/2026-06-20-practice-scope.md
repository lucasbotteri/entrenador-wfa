# Practice Temporary Scope Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Temporarily restrict Practicar to Escena + Primaria + AVDN: exclude the rest from the session and due-count, and grey them (still visible) in the "Dominio por tema" list.

**Architecture:** A single `ENABLED_CONCEPTS` set (keyed by `Card.rationaleRef`) in a new `practice/domain/scope.ts` drives everything. Session/due-count call sites filter cards through `inScopeCards`. `masteryByTopic` gains an `enabled` flag (and sorts enabled-first) so `MasteryBars` can render disabled topics greyed with a tag. No persistence/SRS change — out-of-scope cards keep their state, just aren't served.

**Tech Stack:** React 18 + TypeScript (strict), Vitest + Testing Library, CSS Modules.

**Conventions:** TDD per task. Raw binaries (RTK can mask exit codes): `./node_modules/.bin/vitest`, `./node_modules/.bin/tsc`, `./node_modules/.bin/eslint`. `/usr/bin/git`. Code English; UI Spanish. Do NOT `git add -A` — add only the listed files.

---

## File Structure

| File | Responsibility | Change |
|---|---|---|
| `src/modules/practice/domain/scope.ts` | the temporary enabled-concept set + predicates | Create |
| `src/modules/practice/domain/mastery.ts` | per-topic mastery | Modify: `TopicMastery.enabled`, compute it, sort enabled-first |
| `src/modules/practice/routes/PracticeHome.tsx` | practice home (due + mastery) | Modify: due via `inScopeCards` |
| `src/modules/practice/content/useDueCount.ts` | tab due badge | Modify: via `inScopeCards` |
| `src/modules/practice/routes/Session.tsx` | session runner | Modify: `buildSession` via `inScopeCards` |
| `src/modules/practice/ui/MasteryBars.tsx` | mastery list UI | Modify: disabled topic = greyed + tag, no %/bar |
| `src/modules/practice/ui/MasteryBars.module.css` | mastery list styles | Modify: `.disabled`, `.tag` |
| `tests/modules/practice/scope.test.ts` | scope unit tests | Create |
| `tests/modules/practice/mastery.test.ts` | mastery tests | Modify: enabled flag + sort |
| `tests/modules/practice/scope-wiring.test.ts` | due/session exclude out-of-scope | Create |
| `tests/modules/practice/mastery-bars.test.tsx` | MasteryBars disabled UI | Create |

---

## Task 1: Scope module

**Files:**
- Create: `src/modules/practice/domain/scope.ts`
- Test: `tests/modules/practice/scope.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/modules/practice/scope.test.ts`:

```ts
import { describe, it, expect } from 'vitest'

import { isCardInScope, inScopeCards, isTopicInScope, ENABLED_CONCEPTS } from '@/modules/practice/domain/scope'
import type { Card } from '@/shared/content/types'

const card = (id: string, topic: string, rationaleRef: string): Card =>
  ({ id, topic, type: 'escribir', prompt: 'p', answer: ['a'], rationaleRef }) as Card

describe('practice scope (temporary: Escena + Primaria + AVDN)', () => {
  it('ENABLED_CONCEPTS is exactly the scene/primary/avdn concepts', () => {
    expect([...ENABLED_CONCEPTS].sort()).toEqual(['avdn', 'escena', 'habcde', 'mdd', 'primaria', 'tev'])
  })

  it('isCardInScope: true for scene/primary/avdn concepts, false otherwise', () => {
    expect(isCardInScope(card('1', 'Escena', 'escena'))).toBe(true)
    expect(isCardInScope(card('2', 'HABCDE', 'habcde'))).toBe(true)
    expect(isCardInScope(card('3', 'AVDN', 'avdn'))).toBe(true)
    expect(isCardInScope(card('4', 'Mecanismo', 'mdd'))).toBe(true)
    expect(isCardInScope(card('5', 'Signos vitales', 'signos_vitales'))).toBe(false)
    expect(isCardInScope(card('6', 'Evacuación', 'niveles_evacuacion'))).toBe(false)
  })

  it('inScopeCards drops out-of-scope cards', () => {
    const cards = [card('a', 'HABCDE', 'habcde'), card('b', 'Signos vitales', 'signos_vitales')]
    expect(inScopeCards(cards).map(c => c.id)).toEqual(['a'])
  })

  it('isTopicInScope: true if the topic has any in-scope card (incl. a mixed topic)', () => {
    const cards = [
      card('m1', 'Manejo', 'habcde'),     // in scope
      card('m2', 'Manejo', 'secundaria'), // out of scope
      card('s1', 'Signos vitales', 'signos_vitales'),
    ]
    expect(isTopicInScope(cards, 'Manejo')).toBe(true)
    expect(isTopicInScope(cards, 'Signos vitales')).toBe(false)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `./node_modules/.bin/vitest run tests/modules/practice/scope.test.ts`
Expected: FAIL — module `scope` does not exist.

- [ ] **Step 3: Create the scope module**

Create `src/modules/practice/domain/scope.ts`:

```ts
import type { Card } from '@/shared/content/types'

// TEMPORARY: Practicar is limited to what class has covered — Escena + Primaria + AVDN.
// Widen or delete this set as the course advances. Keyed by Card.rationaleRef (concept id).
export const ENABLED_CONCEPTS: ReadonlySet<string> = new Set([
  'escena', 'mdd', 'tev', // Evaluación de la escena (4 partes, incl. bioseguridad/EPP → 'escena')
  'habcde', 'primaria', // Evaluación primaria
  'avdn', // AVDN (explicit keep)
])

export function isCardInScope(card: Card): boolean {
  return ENABLED_CONCEPTS.has(card.rationaleRef)
}

export function inScopeCards(cards: Card[]): Card[] {
  return cards.filter(isCardInScope)
}

export function isTopicInScope(cards: Card[], topic: string): boolean {
  return cards.some(c => c.topic === topic && isCardInScope(c))
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `./node_modules/.bin/vitest run tests/modules/practice/scope.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Typecheck + commit**

Run: `./node_modules/.bin/tsc --noEmit -p tsconfig.json` → exit 0.

```bash
/usr/bin/git add src/modules/practice/domain/scope.ts tests/modules/practice/scope.test.ts
/usr/bin/git commit -m "feat(practice): temporary enabled-concept scope (Escena+Primaria+AVDN)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 2: Mastery `enabled` flag + sort

**Files:**
- Modify: `src/modules/practice/domain/mastery.ts`
- Test: `tests/modules/practice/mastery.test.ts`

- [ ] **Step 1: Write the failing test**

Append to `tests/modules/practice/mastery.test.ts` (inside the file, after the existing `describe`):

```ts
describe('masteryByTopic — scope flag (temporary)', () => {
  const card = (id: string, topic: string, rationaleRef: string): Card =>
    ({ id, topic, type: 'escribir', prompt: 'p', answer: ['a'], rationaleRef }) as Card

  it('marks topics enabled when they have an in-scope card, and sorts enabled first', () => {
    const cards = [
      card('s1', 'Signos vitales', 'signos_vitales'), // disabled
      card('h1', 'HABCDE', 'habcde'),                 // enabled
      card('m1', 'Manejo', 'habcde'),                 // enabled (mixed topic)
      card('m2', 'Manejo', 'secundaria'),
    ]
    const m = masteryByTopic(cards, {})
    expect(m.find(t => t.topic === 'HABCDE')!.enabled).toBe(true)
    expect(m.find(t => t.topic === 'Manejo')!.enabled).toBe(true)
    expect(m.find(t => t.topic === 'Signos vitales')!.enabled).toBe(false)
    // enabled topics come before disabled ones
    const lastEnabled = m.findIndex(t => !t.enabled)
    expect(m.slice(0, lastEnabled).every(t => t.enabled)).toBe(true)
    expect(m.slice(lastEnabled).every(t => !t.enabled)).toBe(true)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `./node_modules/.bin/vitest run tests/modules/practice/mastery.test.ts`
Expected: FAIL — `enabled` is undefined (not on `TopicMastery` yet).

- [ ] **Step 3: Add the flag, compute it, sort enabled-first**

Replace the contents of `src/modules/practice/domain/mastery.ts` with:

```ts
import { isCardInScope } from './scope'
import type { CardState } from './srs'

import type { Card } from '@/shared/content/types'

export interface TopicMastery {
  topic: string
  pct: number
  count: number
  enabled: boolean
}

export function masteryByTopic(cards: Card[], states: Record<string, CardState>): TopicMastery[] {
  const byTopic = new Map<string, { total: number; mastered: number; enabled: boolean }>()
  for (const c of cards) {
    const t = byTopic.get(c.topic) ?? { total: 0, mastered: 0, enabled: false }
    t.total += 1
    if ((states[c.id]?.box ?? 1) >= 4) t.mastered += 1
    if (isCardInScope(c)) t.enabled = true
    byTopic.set(c.topic, t)
  }
  const rows = [...byTopic.entries()].map(([topic, { total, mastered, enabled }]) => ({
    topic,
    count: total,
    pct: total ? Math.round((mastered / total) * 100) : 0,
    enabled,
  }))
  // Enabled topics first; Array.prototype.sort is stable, so within each group the
  // original first-occurrence order is preserved.
  return rows.sort((a, b) => Number(b.enabled) - Number(a.enabled))
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `./node_modules/.bin/vitest run tests/modules/practice/mastery.test.ts`
Expected: PASS (existing test + new test). The existing test still passes (its cards use `rationaleRef: 'habcde'` → enabled, and `.find` is order-independent).

- [ ] **Step 5: Typecheck + commit**

Run: `./node_modules/.bin/tsc --noEmit -p tsconfig.json` → exit 0.

```bash
/usr/bin/git add src/modules/practice/domain/mastery.ts tests/modules/practice/mastery.test.ts
/usr/bin/git commit -m "feat(practice): per-topic enabled flag + sort enabled-first

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 3: Wire call sites (session + due-count filtered to in-scope)

**Files:**
- Modify: `src/modules/practice/routes/PracticeHome.tsx`
- Modify: `src/modules/practice/content/useDueCount.ts`
- Modify: `src/modules/practice/routes/Session.tsx`
- Test: `tests/modules/practice/scope-wiring.test.ts` (create)

- [ ] **Step 1: Write the failing test**

Create `tests/modules/practice/scope-wiring.test.ts` (verifies the intended composition at the boundary — out-of-scope cards never reach the due queue or the session):

```ts
import { describe, it, expect } from 'vitest'

import { validContent } from '../../fixtures/content.fixture'

import { getDueCards } from '@/modules/practice/content/selectors'
import { inScopeCards } from '@/modules/practice/domain/scope'
import { buildSession } from '@/modules/practice/domain/session'

// Fixture cards: t-w/t-o (HABCDE→habcde, in scope), t-c (AVDN→avdn, in scope),
// t-e (Manejo→secundaria, OUT of scope).
describe('scope wiring: out-of-scope cards are excluded from due + session', () => {
  it('getDueCards over inScopeCards drops the secundaria card', () => {
    const due = getDueCards(inScopeCards(validContent.cards), {}, '2026-06-20')
    expect(due.find(c => c.id === 't-e')).toBeUndefined()
    expect(due.find(c => c.id === 't-w')).toBeDefined()
  })

  it('buildSession over inScopeCards drops the secundaria card', () => {
    const queue = buildSession(inScopeCards(validContent.cards), {}, '2026-06-20', { cap: 10, maxNew: 10 })
    expect(queue.find(c => c.id === 't-e')).toBeUndefined()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `./node_modules/.bin/vitest run tests/modules/practice/scope-wiring.test.ts`
Expected: FAIL — `inScopeCards` import resolves (Task 1), but the test would PASS only if the fixture's `t-e` is `secundaria`. If it FAILS at import or assertion, fix accordingly. (Note: this test exercises the composition directly; it passes once Task 1 exists. If it already passes, that's fine — it locks the behavior the call-site edits below rely on.)

- [ ] **Step 3: Wire PracticeHome**

In `src/modules/practice/routes/PracticeHome.tsx`, add the import:
```tsx
import { inScopeCards } from '@/modules/practice/domain/scope'
```
and change the due line inside the effect from:
```tsx
      setDue(getDueCards(content.cards, states, today).length)
```
to:
```tsx
      setDue(getDueCards(inScopeCards(content.cards), states, today).length)
```
Leave `masteryByTopic(content.cards, states)` using ALL cards (so disabled topics still list).

- [ ] **Step 4: Wire useDueCount**

In `src/modules/practice/content/useDueCount.ts`, add the import:
```tsx
import { inScopeCards } from '@/modules/practice/domain/scope'
```
and change:
```tsx
      if (active) setN(getDueCards(content.cards, states, today).length)
```
to:
```tsx
      if (active) setN(getDueCards(inScopeCards(content.cards), states, today).length)
```

- [ ] **Step 5: Wire Session**

In `src/modules/practice/routes/Session.tsx`, add the import:
```tsx
import { inScopeCards } from '@/modules/practice/domain/scope'
```
and change:
```tsx
    loadStates().then(states => setQueue(buildSession(content.cards, states, today)))
```
to:
```tsx
    loadStates().then(states => setQueue(buildSession(inScopeCards(content.cards), states, today)))
```

- [ ] **Step 6: Run the full practice suite (no regressions)**

Run: `./node_modules/.bin/vitest run tests/modules/practice/`
Expected: PASS (scope-wiring green; existing home/session/selectors tests still pass — `getDueCards`/`buildSession`/`getTopics` signatures are unchanged).

- [ ] **Step 7: Typecheck + lint + commit**

Run: `./node_modules/.bin/tsc --noEmit -p tsconfig.json && ./node_modules/.bin/eslint src/modules/practice/routes/PracticeHome.tsx src/modules/practice/content/useDueCount.ts src/modules/practice/routes/Session.tsx --max-warnings 0` → exit 0.

```bash
/usr/bin/git add src/modules/practice/routes/PracticeHome.tsx src/modules/practice/content/useDueCount.ts src/modules/practice/routes/Session.tsx tests/modules/practice/scope-wiring.test.ts
/usr/bin/git commit -m "feat(practice): exclude out-of-scope cards from session + due-count

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 4: MasteryBars disabled state

**Files:**
- Modify: `src/modules/practice/ui/MasteryBars.tsx`
- Modify: `src/modules/practice/ui/MasteryBars.module.css`
- Test: `tests/modules/practice/mastery-bars.test.tsx` (create)

- [ ] **Step 1: Write the failing test**

Create `tests/modules/practice/mastery-bars.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

import { MasteryBars } from '@/modules/practice/ui/MasteryBars'
import type { TopicMastery } from '@/modules/practice/domain/mastery'

const items: TopicMastery[] = [
  { topic: 'HABCDE', pct: 80, count: 6, enabled: true },
  { topic: 'Signos vitales', pct: 0, count: 5, enabled: false },
]

describe('MasteryBars (scope)', () => {
  it('shows % for an enabled topic and the "Aún no visto en clase" tag (no %) for a disabled one', () => {
    render(<MasteryBars items={items} />)
    // enabled topic shows its percentage
    expect(screen.getByText('80%')).toBeInTheDocument()
    // disabled topic is visible but tagged, with no percentage
    expect(screen.getByText('Signos vitales')).toBeInTheDocument()
    expect(screen.getByText(/Aún no visto en clase/i)).toBeInTheDocument()
    expect(screen.queryByText('0%')).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `./node_modules/.bin/vitest run tests/modules/practice/mastery-bars.test.tsx`
Expected: FAIL — disabled topic currently renders `0%` and no tag.

- [ ] **Step 3: Add the disabled styles**

Append to `src/modules/practice/ui/MasteryBars.module.css`:

```css
.disabled { opacity: 0.5; }
.tag { color: var(--muted); font-style: italic; }
```

- [ ] **Step 4: Render the disabled state**

Replace `src/modules/practice/ui/MasteryBars.tsx` with:

```tsx
import styles from './MasteryBars.module.css'

import type { TopicMastery } from '@/modules/practice/domain/mastery'

export function MasteryBars({ items }: { items: TopicMastery[] }) {
  return (
    <div>
      {items.map(t => (
        <div key={t.topic} className={`${styles.row} ${t.enabled ? '' : styles.disabled}`}>
          <div className={styles.head}>
            <span>{t.topic}</span>
            {t.enabled ? (
              <span className={styles.pct}>{t.pct}%</span>
            ) : (
              <span className={styles.tag}>Aún no visto en clase</span>
            )}
          </div>
          {t.enabled && (
            <div className={styles.bar}>
              <span
                className={`${styles.fill} ${t.pct < 50 ? styles.low : t.pct < 80 ? styles.mid : ''}`}
                style={{ width: `${t.pct}%`, display: 'block' }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `./node_modules/.bin/vitest run tests/modules/practice/mastery-bars.test.tsx`
Expected: PASS.

- [ ] **Step 6: Typecheck + lint + commit**

Run: `./node_modules/.bin/tsc --noEmit -p tsconfig.json && ./node_modules/.bin/eslint src/modules/practice/ui/MasteryBars.tsx --max-warnings 0` → exit 0.

```bash
/usr/bin/git add src/modules/practice/ui/MasteryBars.tsx src/modules/practice/ui/MasteryBars.module.css tests/modules/practice/mastery-bars.test.tsx
/usr/bin/git commit -m "feat(practice): grey disabled topics with 'Aún no visto en clase' tag

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 5: Full verification + visual check

**Files:** none.

- [ ] **Step 1: Run all gates (raw binaries)**

```bash
./node_modules/.bin/tsx scripts/build-content.ts --check
./node_modules/.bin/vitest run
./node_modules/.bin/tsc --noEmit -p tsconfig.json
./node_modules/.bin/tsc --noEmit -p tsconfig.node.json
./node_modules/.bin/eslint . --max-warnings 0
./node_modules/.bin/vite build
```
Expected: every command exits 0.

- [ ] **Step 2: Visual check (`npm run dev`)**

In Practicar:
- "Dominio por tema" lists ALL topics; Escena / HABCDE / Vía aérea / Mecanismo / TEV / Bioseguridad / AVDN / Posición / Manejo / Cadena show normally (% + bar); Signos vitales, MUESTRA, DIAS, PILAR, SOAP, Signos, Examen físico, Extremidades, Evacuación show greyed with "Aún no visto en clase" and no %. Enabled topics appear first.
- The due-count (home text + tab badge) and "Empezar sesión" only serve Escena/Primaria/AVDN cards — out-of-scope cards never appear in a session.

- [ ] **Step 3: Confirm clean tree**

Run: `/usr/bin/git status --short` → clean.

---

## Self-review notes (author)

- **Spec coverage:** scope module (Task 1), functional disable / 3 call sites (Task 3), visual disable / mastery flag + sort (Tasks 2+4), tests (each task), gates (Task 5). All spec sections covered.
- **Type consistency:** `TopicMastery` gains `enabled: boolean` in Task 2; consumed in Task 4 and the MasteryBars test. `inScopeCards`/`isCardInScope`/`isTopicInScope`/`ENABLED_CONCEPTS` defined in Task 1, used in Tasks 2/3. Names consistent.
- **No calc change to existing mastery:** `pct`/`count` unchanged; only the `enabled` flag + a stable enabled-first sort added — the existing mastery test (order-independent `.find`) still passes.
- **`masteryByTopic` is fed ALL cards** (not `inScopeCards`) so disabled topics remain listed; only due/session use `inScopeCards`. This split is the crux — don't filter the mastery input.
