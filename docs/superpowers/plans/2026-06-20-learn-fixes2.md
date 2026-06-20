# Módulo Aprender Fixes (ronda 2, P1-P6) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship six Module-1 "Aprender" improvements: a pre-primary safety node (P1), Eslabón numbering (P2), per-letter HABCDE rationale (P3), TEV/buscar-ayuda content render (P4), ephemeral tap-to-reveal micro-recovery (P5), and a richer worked example with a scene + self-explanation pause (P6).

**Architecture:** Content lives in `docs/contenido-cav.yaml` (Spanish), is anglicized by `mapping.ts` and validated by zod `schemas.ts` (the schema validates the **mapped** output), then frozen to JSON at build time. The learn module builds a `ChainPhase[]`/`ChainNode[]` view-model (`chainModel.ts`) consumed by route components. A new self-contained `RecallPrompt` component provides ephemeral tap-to-reveal, reused by NodeDetail (P5) and WorkedExample (P6).

**Tech Stack:** React 18 + TypeScript (strict), Vite, zod, Vitest + Testing Library, CSS Modules. Spanish UI/content; English code.

**Conventions:** TDD per task. Run gates with raw binaries (RTK can mask exit codes): `./node_modules/.bin/vitest`, `./node_modules/.bin/tsc`, `./node_modules/.bin/eslint`, `./node_modules/.bin/tsx`, `./node_modules/.bin/vite`. Use `/usr/bin/git`. After any YAML edit run `npm run content:build` (or `./node_modules/.bin/tsx scripts/build-content.ts`).

---

## File Structure

| File | Responsibility | Change |
|---|---|---|
| `src/shared/content/schemas.ts` | zod schemas (validate mapped output) | Modify: `AcronymLetterSchema.rationale?`, `WorkedExampleSchema.pause?` |
| `src/shared/content/mapping.ts` | es→en key mapping | Modify: `mapAcronym` letras `porque→rationale`; `mapWorkedExample` `pausa→pause` |
| `docs/contenido-cav.yaml` | clinical content (Spanish) | Modify: P6 worked_example (4 scene steps + `pausa`). (v0.4 `porque`/TEV/help already applied.) |
| `src/modules/learn/domain/chainModel.ts` | chain view-model | Modify: `ChainNode.whyText?`; `primaryNodes` per-letter `whyText` (P3) + prepend `primary-before` node (P1) |
| `src/modules/learn/ui/PhaseTimeline.tsx` | phase header in ChainMap | Modify: `Fase {index}` → `Eslabón {index + 1}` (P2) |
| `src/modules/learn/ui/RecallPrompt.tsx` | NEW — ephemeral tap-to-reveal wrapper | Create |
| `src/modules/learn/ui/RecallPrompt.module.css` | NEW — dashed recall button styles | Create |
| `src/modules/learn/routes/NodeDetail.tsx` | node detail page | Modify: prefer `whyText`; wrap "Por qué" in `RecallPrompt` (P5) |
| `src/modules/learn/routes/WorkedExample.tsx` | worked-example page | Modify: render pause card before first non-scene step (P6) |
| `tests/fixtures/content.fixture.ts` | shared test content | Modify: primary `previo`/`presentacion`; H letter `rationale`; worked_example scene steps + `pause` |
| `tests/shared/content/mapping.test.ts` | NEW — mapper unit tests | Create |
| `tests/modules/learn/chainModel.test.ts` | chainModel tests | Modify: primary-before + whyText cases |
| `tests/modules/learn/PhaseTimeline.test.tsx` | NEW — Eslabón test | Create |
| `tests/modules/learn/RecallPrompt.test.tsx` | NEW — RecallPrompt test | Create |
| `tests/modules/learn/NodeDetail.test.tsx` | NodeDetail tests | Modify: rationale now hidden until reveal |
| `tests/modules/learn/WorkedExample.test.tsx` | WorkedExample tests | Modify: scene steps + pause reveal |

---

## Task 1: Schema + mapper — per-letter rationale + worked_example pause

**Files:**
- Modify: `src/shared/content/schemas.ts`
- Modify: `src/shared/content/mapping.ts`
- Test: `tests/shared/content/mapping.test.ts` (create)

- [ ] **Step 1: Write the failing test**

Create `tests/shared/content/mapping.test.ts`:

```ts
import { describe, it, expect } from 'vitest'

import { mapAcronym, mapWorkedExample } from '@/shared/content/mapping'

describe('mapAcronym — per-letter rationale (P3)', () => {
  it('anglicizes letra.porque → letter.rationale when present', () => {
    const mapped = mapAcronym({
      id: 'habcde', sigla: 'HABCDE', nombre: 'Primaria', concepto: 'primaria',
      es_secuencia: true, racional: 'general',
      letras: [
        { letra: 'H', significado: 'Hemorragia', detalle: 'Presión directa.', porque: 'Mata en minutos: primero.' },
        { letra: 'A', significado: 'Vía aérea', detalle: 'Control cervical.' },
      ],
    })
    expect(mapped.letters?.[0]?.rationale).toBe('Mata en minutos: primero.')
    expect(mapped.letters?.[1]?.rationale).toBeUndefined()
  })
})

describe('mapWorkedExample — pause (P6)', () => {
  it('anglicizes pausa.{pregunta,revela} → pause.{question,reveal}', () => {
    const mapped = mapWorkedExample({
      titulo: 'Caso',
      pausa: { pregunta: '¿Qué observás?', revela: 'No responde, respira.' },
      steps: [{ fase: 'escena', estado: 's', accion: 'a', racional_ref: 'scene' }],
    })
    expect(mapped.pause).toEqual({ question: '¿Qué observás?', reveal: 'No responde, respira.' })
  })

  it('omits pause when pausa is absent', () => {
    const mapped = mapWorkedExample({
      titulo: 'Caso', steps: [{ fase: 'primaria', estado: 's', accion: 'a', racional_ref: 'habcde' }],
    })
    expect('pause' in mapped).toBe(false)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `./node_modules/.bin/vitest run tests/shared/content/mapping.test.ts`
Expected: FAIL — `mapped.letters[0].rationale` is undefined (mapper drops `porque`); `mapped.pause` is undefined (mapper ignores `pausa`).

- [ ] **Step 3: Schema — add the optional fields**

In `src/shared/content/schemas.ts`, change `AcronymLetterSchema`:

```ts
export const AcronymLetterSchema = z.object({
  letter: z.string().min(1).max(2),
  meaning: z.string().min(1),
  detail: z.string().min(1),
  rationale: z.string().optional(),
})
```

And change `WorkedExampleSchema`:

```ts
export const WorkedExampleSchema = z.object({
  title: z.string().min(1),
  pause: z.object({ question: z.string().min(1), reveal: z.string().min(1) }).optional(),
  steps: z.array(WorkedExampleStepSchema).min(1),
})
```

- [ ] **Step 4: Mapper — anglicize the new fields**

In `src/shared/content/mapping.ts`, in `mapAcronym`, change the `letras` map:

```ts
    ...(a.letras
      ? {
          letters: a.letras.map((l: any) => ({
            letter: l.letra,
            meaning: l.significado,
            detail: l.detalle,
            ...(l.porque ? { rationale: l.porque } : {}),
          })),
        }
      : {}),
```

And change `mapWorkedExample`:

```ts
export function mapWorkedExample(w: any) {
  return {
    title: w.titulo,
    ...(w.pausa ? { pause: { question: w.pausa.pregunta, reveal: w.pausa.revela } } : {}),
    steps: w.steps.map((s: any) => ({
      phase: PHASE_MAP[s.fase] ?? s.fase,
      state: s.estado,
      action: s.accion,
      rationaleRef: s.racional_ref,
    })),
  }
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `./node_modules/.bin/vitest run tests/shared/content/mapping.test.ts`
Expected: PASS (4 assertions).

- [ ] **Step 6: Typecheck**

Run: `./node_modules/.bin/tsc --noEmit -p tsconfig.json`
Expected: exit 0 (no type errors; `AcronymLetter`/`WorkedExample` infer the new optional fields).

- [ ] **Step 7: Commit**

```bash
/usr/bin/git add src/shared/content/schemas.ts src/shared/content/mapping.ts tests/shared/content/mapping.test.ts
/usr/bin/git commit -m "feat(content): map per-letter rationale (porque) and worked-example pause

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 2: P6 content — expand worked_example + commit v0.4 YAML

**Files:**
- Modify: `docs/contenido-cav.yaml` (worked_example block)
- Modify: `src/shared/content/generated/content.json` (regenerated)

- [ ] **Step 1: Edit the worked_example block**

In `docs/contenido-cav.yaml`, replace the `worked_example:` block with:

```yaml
worked_example:
  titulo: "Caída en un descenso, terreno de bloques"
  pausa:
    pregunta: "¿Qué observarías antes de tocar?"
    revela: "Sin tocarla: respira pero no responde a tu voz; la piel está pálida. Esa impresión general (TEV) te da la gravedad antes de entrar al HABCDE."
  steps:
    - {fase: "escena", estado: "Tu compañero cae varios metros en un canal de pedrero y queda tendido.", accion: "1 · Seguridad: mirás el terreno, asegurás la zona y te ponés guantes antes de acercarte.", racional_ref: "scene"}
    - {fase: "escena", estado: "Cayó golpeando contra las rocas.", accion: "2 · Mecanismo: golpe contra rocas → sospechás trauma de columna.", racional_ref: "mdd"}
    - {fase: "escena", estado: "Dos compañeros cerca; el resto de la cordada por encima.", accion: "3 · Número de víctimas: una; el resto está bien. Delegás la llamada al SEM.", racional_ref: "scene"}
    - {fase: "escena", estado: "Te acercás con seguridad.", accion: "4 · Impresión general (TEV) sin tocar: no responde, respira, piel pálida.", racional_ref: "tev"}
    - {fase: "primaria", estado: "No responde, respira; sangrado pulsátil en el muslo; casco puesto.", accion: "H: controlás la hemorragia masiva con presión directa antes que nada.", racional_ref: "habcde"}
    - {fase: "primaria", estado: "Hemorragia controlada; hay mecanismo de trauma.", accion: "A: abrís la vía aérea con subluxación mandibular (control cervical).", racional_ref: "habcde"}
    - {fase: "secundaria", estado: "Consciente pero alterado; pálido, frío y húmedo; dolor abdominal.", accion: "Reconocés el shock por la piel y tomás signos vitales de base.", racional_ref: "shock"}
    - {fase: "evacuacion", estado: "Shock con sospecha de sangrado interno, zona remota a 2 h.", accion: "Decidís evacuación CRÍTICA: el sangrado interno no se resuelve en el terreno.", racional_ref: "shock"}
```

Note: `racional_ref` values must resolve in the rationale map. `scene`/`primary`/`secondary`/`evacuation` are phases; `mdd`/`tev`/`habcde` are acronym ids; `shock` is a clinicalTopic id — all exist in the real content.

- [ ] **Step 2: Rebuild content and verify it validates**

Run: `./node_modules/.bin/tsx scripts/build-content.ts`
Expected: prints success / "content valid", regenerates `src/shared/content/generated/content.json`. If it reports a dangling `racional_ref`, the ref name is wrong — fix to a resolvable id.

- [ ] **Step 3: Run the content-integrity / build-check gate**

Run: `./node_modules/.bin/tsx scripts/build-content.ts --check`
Expected: exit 0, no dangling refs / duplicate ids.

- [ ] **Step 4: Run the full suite (no regressions from regenerated JSON)**

Run: `./node_modules/.bin/vitest run`
Expected: all green (the generated JSON now carries the new worked_example + the v0.4 letra `rationale`/TEV/help fields, but no component reads them yet).

- [ ] **Step 5: Commit**

```bash
/usr/bin/git add docs/contenido-cav.yaml src/shared/content/generated/content.json
/usr/bin/git commit -m "content(v0.4): per-letter HABCDE rationale, richer TEV + buscar-ayuda, worked-example scene+pause

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 3: chainModel — per-letter whyText (P3) + primary-before node (P1)

**Files:**
- Modify: `src/modules/learn/domain/chainModel.ts`
- Modify: `tests/fixtures/content.fixture.ts`
- Test: `tests/modules/learn/chainModel.test.ts`

- [ ] **Step 1: Update the fixture**

In `tests/fixtures/content.fixture.ts`:

(a) Give the HABCDE `H` letter a `rationale` (for the whyText test). Change the `habcde` letters to:

```ts
      letters: [
        { letter: 'H', meaning: 'Hemorragia', detail: 'Detener hemorragia.', rationale: 'La hemorragia mata en minutos: primero.' },
        { letter: 'A', meaning: 'Apertura de la vía aérea', detail: 'Con control cervical.' },
      ],
```

(b) Give the `primary` phase content the safety branch. Change the primary chain entry's `content: {}` to:

```ts
      content: {
        previo: 'Si no responde y no respira → secuencia de paro (RCP/DEA).',
        presentacion: 'Si está consciente: presentate, pedí consentimiento.',
      },
```

- [ ] **Step 2: Write the failing tests**

Append to `tests/modules/learn/chainModel.test.ts`:

```ts
describe('chainModel — Fixes2 round (P1/P3)', () => {
  it('primary phase prepends an "Antes de empezar" node first (P1)', () => {
    const model = buildChainModel(validContent)
    const primary = model.find(p => p.id === 'primary')!
    expect(primary.nodes[0]?.id).toBe('primary-before')
    expect(primary.nodes[0]?.title).toBe('Antes de empezar')
    const labels = primary.nodes[0]!.items.map(i => i.label)
    expect(labels).toContain('Si no responde y no respira')
    expect(labels).toContain('Si está consciente')
  })

  it('the H letter node carries its own whyText (P3), not just the acronym rationale', () => {
    const model = buildChainModel(validContent)
    const primary = model.find(p => p.id === 'primary')!
    const h = primary.nodes.find(n => n.id === 'primary-habcde-h')!
    expect(h.whyText).toBe('La hemorragia mata en minutos: primero.')
  })

  it('a letter without its own rationale has no whyText but keeps the rationaleId fallback (P3)', () => {
    const model = buildChainModel(validContent)
    const primary = model.find(p => p.id === 'primary')!
    const a = primary.nodes.find(n => n.id === 'primary-habcde-a')!
    expect(a.whyText).toBeUndefined()
    expect(a.rationaleId).toBe('habcde')
  })
})
```

Confirm the test file already imports `buildChainModel` and `validContent`; if not, add:
```ts
import { buildChainModel } from '@/modules/learn/domain/chainModel'
import { validContent } from '../../fixtures/content.fixture'
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `./node_modules/.bin/vitest run tests/modules/learn/chainModel.test.ts`
Expected: FAIL — no `primary-before` node; `whyText` is undefined.

- [ ] **Step 4: Add `whyText` to the ChainNode type**

In `src/modules/learn/domain/chainModel.ts`, add the field to `ChainNode`:

```ts
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
  whyText?: string
}
```

- [ ] **Step 5: Build the primary-before node and add whyText to letters**

In `src/modules/learn/domain/chainModel.ts`, replace `primaryNodes` with:

```ts
// The pre-HABCDE safety branch (P1): shown as the first node of the primary phase.
function primaryBeforeNode(content: Content): ChainNode | null {
  const phase = content.chain.find(p => p.phase === 'primary')
  const c = (phase?.content ?? {}) as Record<string, unknown>
  const items: NodeItem[] = []
  if (typeof c.previo === 'string') items.push({ label: 'Si no responde y no respira', detail: c.previo })
  if (typeof c.presentacion === 'string') items.push({ label: 'Si está consciente', detail: c.presentacion })
  if (items.length === 0) return null
  return {
    id: 'primary-before',
    phase: 'primary',
    title: 'Antes de empezar',
    kind: 'topic',
    items,
    rationaleId: 'primary',
  }
}

// Primary phase: the safety branch first, then one node per HABCDE letter.
// Each letter node carries its own whyText (P3) when the content provides one,
// falling back to the acronym-level rationale via rationaleId.
function primaryNodes(content: Content): ChainNode[] {
  const habcde = acronymById(content, 'habcde')
  if (!habcde?.letters) return []
  const letterNodes: ChainNode[] = habcde.letters.map(l => ({
    id: `primary-habcde-${l.letter.toLowerCase()}`,
    phase: 'primary' as const,
    title: l.meaning,
    subtitle: `Paso ${l.letter} de HABCDE`,
    letter: l.letter,
    kind: 'acronymLetter' as const,
    items: [{ label: l.meaning, detail: l.detail }, ...rulesForLetter(content, l.letter)],
    rationaleId: habcde.id,
    ...(l.rationale ? { whyText: l.rationale } : {}),
  }))
  const before = primaryBeforeNode(content)
  return before ? [before, ...letterNodes] : letterNodes
}
```

Invariant relied on: `ChainPhase.nodes` render in array order (PhaseTimeline maps them directly; no secondary sort), so prepending places the node before H. The `primary-before` node has no `letter`/`order`, so NodeDetail renders no badge for it and `findPrevNext` (array-position based) keeps working.

- [ ] **Step 6: Run tests to verify they pass**

Run: `./node_modules/.bin/vitest run tests/modules/learn/chainModel.test.ts`
Expected: PASS.

- [ ] **Step 7: Run navigation + selectors tests (no regression from the new node)**

Run: `./node_modules/.bin/vitest run tests/modules/learn/navigation.test.ts tests/modules/learn/selectors.test.ts`
Expected: PASS (the extra primary node flows in prev/next; `getNodeById` finds it by id).

- [ ] **Step 8: Commit**

```bash
/usr/bin/git add src/modules/learn/domain/chainModel.ts tests/fixtures/content.fixture.ts tests/modules/learn/chainModel.test.ts
/usr/bin/git commit -m "feat(learn): pre-primary safety node (P1) + per-letter rationale whyText (P3)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 4: PhaseTimeline — "Eslabón N" numbering (P2)

**Files:**
- Modify: `src/modules/learn/ui/PhaseTimeline.tsx:11`
- Test: `tests/modules/learn/PhaseTimeline.test.tsx` (create)

- [ ] **Step 1: Write the failing test**

Create `tests/modules/learn/PhaseTimeline.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'

import { PhaseTimeline } from '@/modules/learn/ui/PhaseTimeline'
import type { ChainPhase } from '@/modules/learn/domain/chainModel'

const phase: ChainPhase = { id: 'scene', title: 'Escena', rationale: 'r', nodes: [] }

describe('PhaseTimeline (P2)', () => {
  it('numbers phases from 1 as "Eslabón N", not 0-based "Fase"', () => {
    render(
      <MemoryRouter>
        <PhaseTimeline phase={phase} index={0} />
      </MemoryRouter>,
    )
    expect(screen.getByText('Eslabón 1')).toBeInTheDocument()
    expect(screen.queryByText('Fase 0')).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `./node_modules/.bin/vitest run tests/modules/learn/PhaseTimeline.test.tsx`
Expected: FAIL — renders "Fase 0", not "Eslabón 1".

- [ ] **Step 3: Change the label**

In `src/modules/learn/ui/PhaseTimeline.tsx`, line 11:

```tsx
      <p className={styles.label}>Eslabón {index + 1}</p>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `./node_modules/.bin/vitest run tests/modules/learn/PhaseTimeline.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
/usr/bin/git add src/modules/learn/ui/PhaseTimeline.tsx tests/modules/learn/PhaseTimeline.test.tsx
/usr/bin/git commit -m "feat(learn): number phases from 1 as Eslabón N (P2)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 5: RecallPrompt + NodeDetail tap-to-reveal "Por qué" (P5)

**Files:**
- Create: `src/modules/learn/ui/RecallPrompt.tsx`
- Create: `src/modules/learn/ui/RecallPrompt.module.css`
- Modify: `src/modules/learn/routes/NodeDetail.tsx`
- Test: `tests/modules/learn/RecallPrompt.test.tsx` (create)
- Test: `tests/modules/learn/NodeDetail.test.tsx` (modify)

- [ ] **Step 1: Write the failing RecallPrompt test**

Create `tests/modules/learn/RecallPrompt.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'

import { RecallPrompt } from '@/modules/learn/ui/RecallPrompt'

describe('RecallPrompt (P5)', () => {
  it('hides children behind a recall button, reveals them on click', async () => {
    render(
      <RecallPrompt question="¿Por qué?">
        <p>respuesta secreta</p>
      </RecallPrompt>,
    )
    // hidden initially
    expect(screen.queryByText('respuesta secreta')).not.toBeInTheDocument()
    const btn = screen.getByRole('button', { name: /Revelar/i })
    expect(btn).toBeInTheDocument()
    // reveal
    await userEvent.click(btn)
    expect(screen.getByText('respuesta secreta')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `./node_modules/.bin/vitest run tests/modules/learn/RecallPrompt.test.tsx`
Expected: FAIL — module `RecallPrompt` does not exist.

- [ ] **Step 3: Create the RecallPrompt component**

Create `src/modules/learn/ui/RecallPrompt.module.css`:

```css
.button {
  display: block;
  width: 100%;
  text-align: center;
  cursor: pointer;
  border: 1.5px dashed var(--accent, #c9a86a);
  background: var(--surface-soft, #fbf3df);
  border-radius: var(--radius-md, 12px);
  padding: var(--space-3, 14px);
  font-family: var(--font-serif);
  color: var(--ink, #2d2418);
}
.question {
  display: block;
  font-weight: 700;
  font-size: 15px;
}
.hint {
  display: block;
  font-family: var(--font-sans);
  font-size: 11px;
  color: var(--ink-soft, #9a7b2e);
  margin-top: 4px;
}
```

Create `src/modules/learn/ui/RecallPrompt.tsx`:

```tsx
import { useState, type ReactNode } from 'react'

import styles from './RecallPrompt.module.css'

// Ephemeral tap-to-reveal (P5). Hides `children` behind a recall prompt; tapping
// reveals them. State is local and not persisted — to re-hide on a new node,
// give the element a `key` (e.g. the nodeId) so React remounts it.
export function RecallPrompt({ question, children }: { question: string; children: ReactNode }) {
  const [revealed, setRevealed] = useState(false)
  if (revealed) return <>{children}</>
  return (
    <button
      type="button"
      className={styles.button}
      aria-label={`Revelar: ${question}`}
      onClick={() => setRevealed(true)}
    >
      <span className={styles.question}>{question}</span>
      <span className={styles.hint}>Pensalo… después tocá para revelar</span>
    </button>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `./node_modules/.bin/vitest run tests/modules/learn/RecallPrompt.test.tsx`
Expected: PASS.

- [ ] **Step 5: Update the NodeDetail tests for the new hidden-by-default behavior**

In `tests/modules/learn/NodeDetail.test.tsx`, replace the first test (`shows the node title, its item detail, and the rationale (por qué)`) with two tests — one for the visible parts, one for the gated rationale:

```tsx
  it('shows the node title and its item detail; rationale is hidden until revealed', async () => {
    renderAt('/chain/primary-habcde-h')
    expect(screen.getByRole('heading', { name: 'Hemorragia' })).toBeInTheDocument()
    expect(screen.getByText(/Detener hemorragia/i)).toBeInTheDocument()
    // the per-letter rationale (P3) is behind the recall prompt (P5)
    expect(screen.queryByText(/mata en minutos/i)).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /Revelar/i }))
    expect(screen.getByText(/mata en minutos/i)).toBeInTheDocument()
  })
```

Add the userEvent import at the top of the file:

```tsx
import userEvent from '@testing-library/user-event'
```

- [ ] **Step 6: Run the NodeDetail test to verify it fails**

Run: `./node_modules/.bin/vitest run tests/modules/learn/NodeDetail.test.tsx`
Expected: FAIL — currently the rationale renders immediately (no recall button), so `queryByText(/mata en minutos/i)` finds it and `getByRole('button', {name: /Revelar/i})` is absent.

- [ ] **Step 7: Wire NodeDetail to prefer whyText and gate the "Por qué" behind RecallPrompt**

In `src/modules/learn/routes/NodeDetail.tsx`:

(a) Add the import:
```tsx
import { RecallPrompt } from '@/modules/learn/ui/RecallPrompt'
```

(b) Replace the `rationale` computation (lines 23-25) with a `why` that prefers the node's own text:
```tsx
  const why =
    node?.whyText ??
    (node?.rationaleId ? getRationale(node.rationaleId, buildRationaleMap(content)) : undefined)
```

(c) Replace the rationale render block (the `{rationale && ( ... )}` block) with:
```tsx
      {why && (
        <div style={{ marginTop: 'var(--space-4)' }}>
          <RecallPrompt key={nodeId} question="¿Por qué?">
            <Section label="Por qué">{why}</Section>
          </RecallPrompt>
        </div>
      )}
```

The `key={nodeId}` makes the reveal ephemeral: navigating to another node remounts `RecallPrompt`, resetting it to hidden.

- [ ] **Step 8: Run NodeDetail + the full learn suite**

Run: `./node_modules/.bin/vitest run tests/modules/learn/`
Expected: PASS (NodeDetail reveal test green; the existing "next link" and "scene node badge" tests unaffected).

- [ ] **Step 9: Typecheck + lint**

Run: `./node_modules/.bin/tsc --noEmit -p tsconfig.json && ./node_modules/.bin/eslint src/modules/learn/ui/RecallPrompt.tsx src/modules/learn/routes/NodeDetail.tsx --max-warnings 0`
Expected: exit 0.

- [ ] **Step 10: Commit**

```bash
/usr/bin/git add src/modules/learn/ui/RecallPrompt.tsx src/modules/learn/ui/RecallPrompt.module.css src/modules/learn/routes/NodeDetail.tsx tests/modules/learn/RecallPrompt.test.tsx tests/modules/learn/NodeDetail.test.tsx
/usr/bin/git commit -m "feat(learn): ephemeral tap-to-reveal of the Por qué (P5)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 6: WorkedExample — scene steps + self-explanation pause (P6)

**Files:**
- Modify: `src/modules/learn/routes/WorkedExample.tsx`
- Modify: `tests/fixtures/content.fixture.ts` (worked_example)
- Test: `tests/modules/learn/WorkedExample.test.tsx`

- [ ] **Step 1: Update the fixture worked_example**

In `tests/fixtures/content.fixture.ts`, replace the `workedExample` block with scene steps + a pause (refs `scene`/`tev`/`habcde` all resolve in the fixture):

```ts
  workedExample: {
    title: 'Caída en descenso',
    pause: { question: '¿Qué observarías antes de tocar?', reveal: 'No responde, respira, piel pálida.' },
    steps: [
      { phase: 'scene', state: 'Cae en un pedrero.', action: '1 · Seguridad: asegurás la zona.', rationaleRef: 'scene' },
      { phase: 'scene', state: 'Te acercás.', action: '4 · Impresión general (TEV).', rationaleRef: 'tev' },
      {
        phase: 'primary',
        state: 'Sangrado pulsátil.',
        action: 'Controlás la hemorragia.',
        rationaleRef: 'habcde',
      },
    ],
  },
```

- [ ] **Step 2: Write the failing test**

Replace the body of `tests/modules/learn/WorkedExample.test.tsx` describe block with:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'

import { validContent } from '../../fixtures/content.fixture'

vi.mock('@/shared/content/loader', () => ({ loadContent: () => validContent }))

import { WorkedExample } from '@/modules/learn/routes/WorkedExample'

function renderWE() {
  return render(
    <MemoryRouter>
      <WorkedExample />
    </MemoryRouter>,
  )
}

describe('WorkedExample (P6)', () => {
  it('renders the title and the scene + clinical step actions', () => {
    renderWE()
    expect(screen.getByText(/Caída en descenso/i)).toBeInTheDocument()
    expect(screen.getByText(/1 · Seguridad/i)).toBeInTheDocument()
    expect(screen.getByText(/Controlás la hemorragia/i)).toBeInTheDocument()
  })

  it('shows a self-explanation pause before the first clinical beat; reveal on tap', async () => {
    renderWE()
    // pause question visible, its reveal hidden until tapped
    expect(screen.getByText('¿Qué observarías antes de tocar?')).toBeInTheDocument()
    expect(screen.queryByText(/No responde, respira, piel pálida/i)).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /Revelar/i }))
    expect(screen.getByText(/No responde, respira, piel pálida/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 3: Run test to verify it fails**

Run: `./node_modules/.bin/vitest run tests/modules/learn/WorkedExample.test.tsx`
Expected: FAIL — no pause card / "¿Qué observarías antes de tocar?" not rendered.

- [ ] **Step 4: Render the pause before the first non-scene step**

Replace `src/modules/learn/routes/WorkedExample.tsx` with:

```tsx
import { Fragment } from 'react'

import { RecallPrompt } from '@/modules/learn/ui/RecallPrompt'
import { loadContent } from '@/shared/content/loader'
import { buildRationaleMap, getRationale } from '@/shared/domain/rationale'
import { Card } from '@/shared/ui/components/Card'
import { Section } from '@/shared/ui/components/Section'

export function WorkedExample() {
  const content = loadContent()
  const map = buildRationaleMap(content)
  const { title, steps, pause } = content.workedExample
  const firstClinicalIdx = steps.findIndex(s => s.phase !== 'scene')

  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 24 }}>Caso resuelto</h1>
      <p style={{ fontStyle: 'italic', color: 'var(--ink-soft)' }}>{title}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {steps.map((s, i) => (
          <Fragment key={i}>
            {pause && i === firstClinicalIdx && (
              <RecallPrompt question={pause.question}>
                <Card>
                  <Section label="Antes de tocar">{pause.reveal}</Section>
                </Card>
              </RecallPrompt>
            )}
            <Card>
              <p
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: 10,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'var(--muted)',
                  margin: 0,
                }}
              >
                Paso {i + 1}
              </p>
              <p style={{ fontFamily: 'var(--font-serif)', margin: '4px 0' }}>{s.state}</p>
              <p style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, margin: '4px 0' }}>
                {s.action}
              </p>
              <Section label="Por qué">{getRationale(s.rationaleRef, map) ?? ''}</Section>
            </Card>
          </Fragment>
        ))}
      </div>
    </div>
  )
}
```

Note: if there is no non-scene step, `firstClinicalIdx` is `-1` and the pause never renders — acceptable (the real content always has clinical steps). If `pause` is absent, no pause card renders.

- [ ] **Step 5: Run test to verify it passes**

Run: `./node_modules/.bin/vitest run tests/modules/learn/WorkedExample.test.tsx`
Expected: PASS.

- [ ] **Step 6: Typecheck + lint**

Run: `./node_modules/.bin/tsc --noEmit -p tsconfig.json && ./node_modules/.bin/eslint src/modules/learn/routes/WorkedExample.tsx --max-warnings 0`
Expected: exit 0.

- [ ] **Step 7: Commit**

```bash
/usr/bin/git add src/modules/learn/routes/WorkedExample.tsx tests/fixtures/content.fixture.ts tests/modules/learn/WorkedExample.test.tsx
/usr/bin/git commit -m "feat(learn): worked example scene steps + self-explanation pause (P6)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 7: Full verification + visual check

**Files:** none (verification only)

- [ ] **Step 1: Run all gates (raw binaries)**

```bash
./node_modules/.bin/tsx scripts/build-content.ts --check
./node_modules/.bin/vitest run
./node_modules/.bin/tsc --noEmit -p tsconfig.json
./node_modules/.bin/tsc --noEmit -p tsconfig.node.json
./node_modules/.bin/eslint . --max-warnings 0
./node_modules/.bin/vite build
```
Expected: every command exits 0; content valid; all tests pass; no type/lint errors; production build succeeds.

- [ ] **Step 2: Visual check (dev server)**

Run `npm run dev` and verify in the browser:
- **P4 — TEV:** ChainMap → Escena → "Impresión general" shows the three richer components (Respiración with trípode/tiraje/sounds, Circulación coloración, Sistema neurológico). Escena → "Buscar ayuda" shows the 3-level help text.
- **P1 — safety node:** Escena → Primaria: the first node is "Antes de empezar" (RCP/DEA + presentación), before H.
- **P2 — Eslabón:** the ChainMap phase headers read "Eslabón 1…4", not "Fase 0…3".
- **P3 — per-letter why:** open H → reveal "Por qué" → shows the H-specific rationale ("…mata en minutos…"), not the generic HABCDE rationale; check A/B/C/D/E each show their own.
- **P5 — tap-to-reveal:** every node's "Por qué" starts hidden behind the recall prompt; tapping reveals; navigating away and back re-hides; Significado/Detalle stay visible.
- **P6 — worked example:** Caso resuelto opens with the 4 scene steps, then the pause "¿Qué observarías antes de tocar?" (tap reveals), then the clinical beats.

- [ ] **Step 3: Confirm a clean tree**

Run: `/usr/bin/git status --short`
Expected: clean (all changes committed). The unrelated `conceptLinks.ts` / `concept-links.test.ts` working-tree change (termica fix) is out of scope for this plan — leave it untouched; do not commit it as part of this work.

---

## Self-review notes (author)

- **Spec coverage:** P1 (Task 3), P2 (Task 4), P3 (Tasks 1+3), P4 (Task 2 content + Task 7 visual verify — no code change, per spec), P5 (Task 5), P6 (Tasks 1+2+6). All covered.
- **Schema field name:** the schema validates the **mapped** output, so the per-letter field is `rationale` (mapper anglicizes `porque→rationale`), not `porque`. Corrected from spec §4 prose.
- **P5 ephemerality:** the router keeps NodeDetail mounted across nodes, so `useState` alone would not re-hide; `key={nodeId}` on `RecallPrompt` forces a remount and resets the reveal. This is stricter than the spec's "remount" wording and is the actual mechanism.
- **Test breakage handled:** the existing `NodeDetail` test asserted the rationale was visible by default; Task 5 Step 5 rewrites it for the hidden-until-reveal behavior. The existing `WorkedExample` test's title/step assertions still hold after the fixture change.
- **Ref resolvability:** fixture worked_example uses `scene`/`tev`/`habcde` (all in the fixture); real YAML uses `scene`/`mdd`/`tev`/`habcde`/`shock` (all in real content).
