# Entrenador WFA — MVP (Foundation + Module 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the offline-first PWA foundation and Module 1 ("Aprender") for the WFA remote first-aid trainer: a user can navigate the full Cadena de Atención, expand any node to read significado/detalle/por qué, walk one worked example, and consult a quick reference — all offline on mobile.

**Architecture:** React + Vite + TypeScript SPA. Feature-first layout (`modules/learn/{content,domain,ui,routes}`) over a `shared/` cross-cutting layer (content, domain, ui, app). Clinical content lives in `docs/*.yaml`, compiled at build time to validated, typed JSON. A pure projection turns the heterogeneous YAML into a uniform navigable node model the UI renders.

**Tech Stack:** Vite, React 18, TypeScript (strict), `react-router-dom` v6 (HashRouter), `zod`, `yaml`, `idb-keyval`, `lucide-react`, `@fontsource/inter`, `vite-plugin-pwa` (Workbox), Vitest + Testing Library + `fake-indexeddb`, ESLint (flat) + Prettier.

**Reference spec:** `docs/superpowers/specs/2026-06-19-first-aid-mvp-design.md`

**Conventions:** Code/identifiers/files/comments/commits in English. User-facing strings and `.yaml` content stay Spanish. TDD: failing test → minimal impl → green → commit. Commit after every task.

---

## File Map

**Scaffolding & config**
- `package.json`, `tsconfig.json`, `tsconfig.node.json`, `vite.config.ts`, `index.html`, `eslint.config.js`, `.prettierrc`, `vitest.config.ts`, `vitest.setup.ts`, `.github/workflows/ci.yml`
- `src/main.tsx`, `src/index.css`

**shared/content** — data layer
- `schemas.ts` (zod), `types.ts`, `mapping.ts` (es→en keys), `loader.ts`, `generated/*.json` (gitignored)

**scripts** — `build-content.ts` (parse → map → validate → ref-integrity → id-uniqueness → emit JSON)

**shared/domain** — `rationale.ts`, `storage/{index,keys,migrations}.ts`

**shared/ui** — `tokens.css`, `theme.ts`, `icons.ts`, `components/{Chip,Card,LetterBadge,Breadcrumb,Section,Icon}.tsx`

**shared/app** — `App.tsx`, `Shell.tsx`, `router.tsx`, `ErrorBoundary.tsx`, `pwa.ts`

**modules/learn**
- `domain/{chainModel,navigation}.ts`
- `content/selectors.ts`
- `ui/{PhaseTimeline,NodeCard,ExpandableItem,QuickRefTable}.tsx`
- `routes/{ChainMap,NodeDetail,WorkedExample,QuickRef}.tsx`
- `index.ts`

**tests** — `tests/fixtures/content.fixture.ts` + per-unit test files colocated under `tests/`

**content authoring** — add `worked_example` block to `docs/contenido-cav.yaml`

**docs** — `README.md`, `CONTRIBUTING.md`

---

## Phase A — Scaffolding

### Task 1: Initialize project

**Files:**
- Create: `package.json`, `index.html`, `src/main.tsx`, `src/index.css`, `src/shared/app/App.tsx`
- Create: `tsconfig.json`, `tsconfig.node.json`, `vite.config.ts`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "entrenador-wfa",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "npm run content:build && tsc --noEmit -p tsconfig.json && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:run": "vitest run",
    "test:cov": "vitest run --coverage",
    "lint": "eslint . --max-warnings 0",
    "typecheck": "tsc --noEmit -p tsconfig.json && tsc --noEmit -p tsconfig.node.json",
    "format": "prettier -w .",
    "format:check": "prettier -c .",
    "content:build": "tsx scripts/build-content.ts",
    "content:check": "tsx scripts/build-content.ts --check"
  },
  "dependencies": {
    "@fontsource/inter": "^5.0.0",
    "idb-keyval": "^6.2.1",
    "lucide-react": "^0.400.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.24.0",
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.4.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/user-event": "^14.5.0",
    "@types/node": "^20.14.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.0",
    "fake-indexeddb": "^6.0.0",
    "jsdom": "^24.1.0",
    "prettier": "^3.3.0",
    "tsx": "^4.16.0",
    "typescript": "^5.5.0",
    "vite": "^5.3.0",
    "vite-plugin-pwa": "^0.20.0",
    "vitest": "^2.0.0",
    "yaml": "^2.4.0"
  }
}
```

- [ ] **Step 2: Create `index.html`**

```html
<!doctype html>
<html lang="es-AR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <meta name="theme-color" content="#7a1f1c" />
    <title>Entrenador WFA</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 3: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowImportingTsExtensions": false,
    "jsx": "react-jsx",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "exactOptionalPropertyTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noEmit": true,
    "skipLibCheck": true,
    "baseUrl": ".",
    "paths": {
      "@/shared/*": ["src/shared/*"],
      "@/modules/*": ["src/modules/*"]
    }
  },
  "include": ["src", "tests"]
}
```

> Note: the root config and the node config are type-checked independently (no project references / no `tsc -b`), which avoids the composite-emit conflict (TS6310). `@types/node` is required for `node:path`/`__dirname` in `vite.config.ts`.

- [ ] **Step 4: Create `tsconfig.node.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true,
    "types": ["node"],
    "strict": true,
    "skipLibCheck": true
  },
  "include": ["vite.config.ts", "vitest.config.ts", "scripts/**/*.ts"]
}
```

> Note: `target: ES2020` is required because `scripts/integrity.ts` spreads a `Map` iterator (`[...counts.entries()]`). Scripts and tests that legitimately use `any` (build-content.ts, vite.config.ts, integrity.test.ts) carry a top-of-file `/* eslint-disable @typescript-eslint/no-explicit-any */`, matching the convention in `mapping.ts`/`integrity.ts`.

- [ ] **Step 5: Create `vite.config.ts`** (PWA added in Task 20; minimal for now)

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  resolve: {
    alias: {
      '@/shared': path.resolve(__dirname, 'src/shared'),
      '@/modules': path.resolve(__dirname, 'src/modules'),
    },
  },
  plugins: [react()],
})
```

- [ ] **Step 6: Create `src/index.css`** (placeholder; tokens added in Task 17)

```css
:root { color-scheme: light; }
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
#root { min-height: 100vh; }
```

- [ ] **Step 7: Create `src/shared/app/App.tsx`** (placeholder; replaced in Task 22)

```tsx
export function App() {
  return <main>Entrenador WFA</main>
}
```

- [ ] **Step 8: Create `src/main.tsx`**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from '@/shared/app/App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 9: Install and verify the dev server builds**

Run: `npm install && npm run typecheck`
Expected: install completes; `tsc -b --noEmit` exits 0 (no type errors).

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "chore: scaffold Vite + React + TypeScript project"
```

---

### Task 2: ESLint, Prettier, and layer-boundary rules

**Files:**
- Create: `eslint.config.js`, `.prettierrc`, `.prettierignore`

- [ ] **Step 1: Create `.prettierrc`**

```json
{
  "semi": false,
  "singleQuote": true,
  "printWidth": 100,
  "arrowParens": "avoid",
  "trailingComma": "all"
}
```

- [ ] **Step 2: Create `.prettierignore`**

```
dist
src/shared/content/generated
```

- [ ] **Step 3: Create `eslint.config.js`**

Add eslint deps first.

Run: `npm i -D eslint @eslint/js typescript-eslint eslint-plugin-react-hooks eslint-plugin-import eslint-plugin-unused-imports`

```js
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import importPlugin from 'eslint-plugin-import'
import unusedImports from 'eslint-plugin-unused-imports'

export default tseslint.config(
  { ignores: ['dist', 'src/shared/content/generated', 'coverage'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
      import: importPlugin,
      'unused-imports': unusedImports,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'unused-imports/no-unused-imports': 'error',
      'import/order': ['warn', { 'newlines-between': 'always', alphabetize: { order: 'asc' } }],
      // Layer boundaries (spec §3.2): shared must not import modules.
      'no-restricted-imports': [
        'error',
        { patterns: [{ group: ['@/modules/*'], message: 'shared/ must not import from modules/' }] },
      ],
    },
  },
  {
    // modules may not import other modules
    files: ['src/modules/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            { group: ['@/modules/!(learn)/**'], message: 'a module must not import another module' },
          ],
        },
      ],
    },
  },
)
```

- [ ] **Step 4: Run lint to verify config loads**

Run: `npm run lint`
Expected: exits 0 (no errors on the scaffold).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: add eslint flat config, prettier, and layer-boundary rules"
```

---

### Task 3: Vitest setup and first smoke test

**Files:**
- Create: `vitest.config.ts`, `vitest.setup.ts`, `tests/smoke.test.ts`

- [ ] **Step 1: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  resolve: {
    alias: {
      '@/shared': path.resolve(__dirname, 'src/shared'),
      '@/modules': path.resolve(__dirname, 'src/modules'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
  },
})
```

- [ ] **Step 2: Create `vitest.setup.ts`**

```ts
import '@testing-library/jest-dom/vitest'
```

- [ ] **Step 3: Write the failing smoke test** `tests/smoke.test.ts`

```ts
import { describe, it, expect } from 'vitest'

describe('test harness', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2)
  })
})
```

- [ ] **Step 4: Run it**

Run: `npm run test:run`
Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "test: add vitest setup and smoke test"
```

---

### Task 4: CI workflow

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Create the workflow**

```yaml
name: CI
on:
  push: { branches: [main] }
  pull_request:
jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm run content:check
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run test:run
      - run: npm run build
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "ci: add lint/typecheck/test/build pipeline"
```

> Note: `content:check` and `build` will fail until Task 11/12 exist. That is expected; CI goes green once the content pipeline lands. Do not block local progress on it.

---

## Phase B — Content pipeline

### Task 5: zod schemas — acronyms

**Files:**
- Create: `src/shared/content/schemas.ts`
- Test: `tests/shared/content/schemas-acronym.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest'
import { AcronymSchema } from '@/shared/content/schemas'

describe('AcronymSchema', () => {
  it('accepts a letter-based acronym', () => {
    const parsed = AcronymSchema.parse({
      id: 'habcde',
      acronym: 'HABCDE',
      name: 'Evaluación primaria',
      concept: 'primaria',
      isSequence: true,
      letters: [{ letter: 'H', meaning: 'Hemorragia', detail: 'Detener hemorragia.' }],
      rationale: 'Lo que mata primero, primero.',
    })
    expect(parsed.letters?.[0]?.letter).toBe('H')
  })

  it('accepts a component-based acronym (TEV)', () => {
    const parsed = AcronymSchema.parse({
      id: 'tev',
      acronym: 'TEV',
      name: 'Triángulo de Evaluación Vital',
      concept: 'escena',
      isSequence: false,
      components: [{ name: 'Respiración', detail: 'Movimientos, postura.' }],
      rationale: 'Evaluación rápida sin tocar.',
    })
    expect(parsed.components?.[0]?.name).toBe('Respiración')
  })

  it('rejects an acronym missing rationale', () => {
    expect(() =>
      AcronymSchema.parse({ id: 'x', acronym: 'X', name: 'X', concept: 'x', isSequence: false }),
    ).toThrow()
  })
})
```

- [ ] **Step 2: Run it (fails — module missing)**

Run: `npm run test:run -- schemas-acronym`
Expected: FAIL (cannot find `schemas`).

- [ ] **Step 3: Implement `schemas.ts` (acronyms portion)**

```ts
import { z } from 'zod'

export const AcronymLetterSchema = z.object({
  letter: z.string().min(1).max(2),
  meaning: z.string().min(1),
  detail: z.string().min(1),
})

export const AcronymComponentSchema = z.object({
  name: z.string().min(1),
  detail: z.string().min(1),
})

export const AcronymSchema = z.object({
  id: z.string().min(1),
  acronym: z.string().min(1),
  name: z.string().min(1),
  concept: z.string().min(1),
  isSequence: z.boolean(),
  letters: z.array(AcronymLetterSchema).optional(),
  components: z.array(AcronymComponentSchema).optional(),
  definition: z.string().optional(),
  note: z.string().optional(),
  rationale: z.string().min(1),
})
```

- [ ] **Step 4: Run it (passes)**

Run: `npm run test:run -- schemas-acronym`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(content): add acronym zod schema"
```

---

### Task 6: zod schemas — chain, vitals, evac, rules, topics, cards, workedExample, root

**Files:**
- Modify: `src/shared/content/schemas.ts`
- Test: `tests/shared/content/schemas-content.test.ts`

- [ ] **Step 1: Write the failing test** (self-contained — no fixture dependency; the shared fixture arrives in Task 12)

```ts
import { describe, it, expect } from 'vitest'
import { ContentSchema } from '@/shared/content/schemas'

const minimal = {
  meta: { source: 's', version: '0', language: 'es' },
  acronyms: [
    { id: 'habcde', acronym: 'HABCDE', name: 'Primaria', concept: 'primaria', isSequence: true,
      letters: [{ letter: 'H', meaning: 'Hemorragia', detail: 'Detener.' }], rationale: 'Primero lo que mata.' },
  ],
  chain: [{ phase: 'primary', name: 'Primaria', rationale: 'Orden.', content: {} }],
  vitalSigns: { components: ['FC'] },
  practicalRules: [{ id: 'hemorragia', rule: 'Presión directa.', concept: 'habcde' }],
  evacLevels: [{ level: 'CRÍTICO', color: 'rojo', criterion: 'Evacuar ya.' }],
  clinicalTopics: [{ id: 'shock', name: 'Shock', rationale: 'Hipoperfusión.' }],
  cards: [],
  workedExample: { title: 't', steps: [{ phase: 'primary', state: 's', action: 'a', rationaleRef: 'habcde' }] },
}

describe('ContentSchema', () => {
  it('accepts a minimal valid content object', () => {
    const parsed = ContentSchema.parse(minimal)
    expect(parsed.chain.length).toBeGreaterThan(0)
    expect(parsed.evacLevels[0]?.level).toBe('CRÍTICO')
    expect(parsed.workedExample.steps.length).toBeGreaterThan(0)
  })

  it('rejects an unknown phase id', () => {
    const bad = { ...minimal, chain: [{ ...minimal.chain[0], phase: 'nope' }] }
    expect(() => ContentSchema.parse(bad)).toThrow()
  })
})
```

- [ ] **Step 2: Run it**

Run: `npm run test:run -- schemas-content`
Expected: FAIL (missing `ContentSchema`).

- [ ] **Step 3: Extend `schemas.ts`**

```ts
export const PhaseIdSchema = z.enum(['scene', 'primary', 'secondary', 'evacuation'])
export type PhaseId = z.infer<typeof PhaseIdSchema>

// Phase content is heterogeneous (spec §4.2). We validate the structural envelope
// strictly and preserve the deep clinical detail with passthrough so unmodeled
// leaves never break the build but are carried through to the JSON.
export const ChainPhaseSchema = z.object({
  phase: PhaseIdSchema,
  name: z.string().min(1),
  rationale: z.string().min(1),
  refAcronym: z.string().optional(),
  strictOrder: z.boolean().optional(),
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
  })
  .passthrough()

export const EvacLevelSchema = z.object({
  level: z.string().min(1),
  color: z.string().min(1),
  criterion: z.string().min(1),
})

export const PracticalRuleSchema = z.object({
  id: z.string().min(1),
  rule: z.string().min(1),
  concept: z.string().min(1),
})

export const ClinicalTopicSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  rationale: z.string().min(1),
})

export const CardSchema = z
  .object({
    id: z.string().min(1),
    topic: z.string().min(1),
    type: z.enum(['ordenar', 'escribir', 'cloze', 'elegir']),
    prompt: z.string().min(1),
    answer: z.array(z.string()).min(1),
    rationaleRef: z.string().min(1),
  })
  .passthrough()

export const WorkedExampleStepSchema = z.object({
  phase: PhaseIdSchema,
  state: z.string().min(1),
  action: z.string().min(1),
  rationaleRef: z.string().min(1),
})

export const WorkedExampleSchema = z.object({
  title: z.string().min(1),
  steps: z.array(WorkedExampleStepSchema).min(1),
})

export const ContentSchema = z.object({
  meta: z.object({ source: z.string(), version: z.string(), language: z.string() }).passthrough(),
  acronyms: z.array(AcronymSchema).min(1),
  chain: z.array(ChainPhaseSchema).min(1),
  vitalSigns: VitalSignsSchema,
  positions: z.array(z.object({ situation: z.string(), position: z.string() })).optional(),
  practicalRules: z.array(PracticalRuleSchema),
  evacLevels: z.array(EvacLevelSchema).min(1),
  clinicalTopics: z.array(ClinicalTopicSchema),
  cards: z.array(CardSchema),
  workedExample: WorkedExampleSchema,
})

// Cases (Module 3 contract; validated, unused in v1)
export const CaseSchema = z.object({ id: z.string(), title: z.string() }).passthrough()
export const CasesSchema = z.array(CaseSchema)
```

- [ ] **Step 4: Run it**

Run: `npm run test:run -- schemas-content`
Expected: PASS once the fixture exists (Task 12). If running now, create the stub fixture per Step 1 note.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(content): add chain/vitals/evac/cards/workedExample/root schemas"
```

---

### Task 7: Content types

**Files:**
- Create: `src/shared/content/types.ts`
- Test: `tests/shared/content/types.test.ts`

- [ ] **Step 1: Write the failing test** (type-level + runtime sanity)

```ts
import { describe, it, expectTypeOf } from 'vitest'
import type { Content, Acronym, PhaseId } from '@/shared/content/types'

describe('content types', () => {
  it('Content has the expected shape', () => {
    expectTypeOf<Content['acronyms']>().toMatchTypeOf<Acronym[]>()
    expectTypeOf<PhaseId>().toEqualTypeOf<'scene' | 'primary' | 'secondary' | 'evacuation'>()
  })
})
```

- [ ] **Step 2: Run it**

Run: `npm run test:run -- types`
Expected: FAIL (missing `types`).

- [ ] **Step 3: Implement `types.ts`**

```ts
import { z } from 'zod'
import {
  AcronymSchema,
  AcronymLetterSchema,
  AcronymComponentSchema,
  ChainPhaseSchema,
  ContentSchema,
  CasesSchema,
  EvacLevelSchema,
  PracticalRuleSchema,
  ClinicalTopicSchema,
  WorkedExampleSchema,
  WorkedExampleStepSchema,
  PhaseIdSchema,
} from './schemas'

export type Acronym = z.infer<typeof AcronymSchema>
export type AcronymLetter = z.infer<typeof AcronymLetterSchema>
export type AcronymComponent = z.infer<typeof AcronymComponentSchema>
export type ChainPhaseRaw = z.infer<typeof ChainPhaseSchema>
export type Content = z.infer<typeof ContentSchema>
export type Cases = z.infer<typeof CasesSchema>
export type EvacLevel = z.infer<typeof EvacLevelSchema>
export type PracticalRule = z.infer<typeof PracticalRuleSchema>
export type ClinicalTopic = z.infer<typeof ClinicalTopicSchema>
export type WorkedExample = z.infer<typeof WorkedExampleSchema>
export type WorkedExampleStep = z.infer<typeof WorkedExampleStepSchema>
export type PhaseId = z.infer<typeof PhaseIdSchema>
```

- [ ] **Step 4: Run it**

Run: `npm run test:run -- types`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(content): add inferred content types"
```

---

### Task 8: Field mapping (Spanish YAML → English schema)

**Files:**
- Create: `src/shared/content/mapping.ts`
- Test: `tests/shared/content/mapping.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest'
import { mapAcronym, mapChainPhase, mapEvacLevel } from '@/shared/content/mapping'

describe('mapping es → en', () => {
  it('maps a letter acronym', () => {
    const out = mapAcronym({
      id: 'habcde', sigla: 'HABCDE', nombre: 'Evaluación primaria', concepto: 'primaria',
      es_secuencia: true,
      letras: [{ letra: 'H', significado: 'Hemorragia', detalle: 'Detener.' }],
      racional: 'Primero lo que mata.',
    })
    expect(out).toMatchObject({
      id: 'habcde', acronym: 'HABCDE', name: 'Evaluación primaria', concept: 'primaria',
      isSequence: true, rationale: 'Primero lo que mata.',
      letters: [{ letter: 'H', meaning: 'Hemorragia', detail: 'Detener.' }],
    })
  })

  it('maps a component acronym', () => {
    const out = mapAcronym({
      id: 'tev', sigla: 'TEV', nombre: 'TEV', concepto: 'escena', es_secuencia: false,
      componentes: [{ nombre: 'Respiración', detalle: 'Movimientos.' }], racional: 'Sin tocar.',
    })
    expect(out.components).toEqual([{ name: 'Respiración', detail: 'Movimientos.' }])
    expect(out.letters).toBeUndefined()
  })

  it('maps phase enum and envelope', () => {
    const out = mapChainPhase({
      fase: 'primaria', nombre: 'Primaria', racional: 'Orden.', orden_estricto: true,
      ref_sigla: 'habcde', contenido: { previo: 'x' },
    })
    expect(out.phase).toBe('primary')
    expect(out.strictOrder).toBe(true)
    expect(out.refAcronym).toBe('habcde')
    expect(out.content).toEqual({ previo: 'x' })
  })

  it('maps evac level', () => {
    expect(mapEvacLevel({ nivel: 'CRÍTICO', color: 'rojo', criterio: 'Evacuar ya.' })).toEqual({
      level: 'CRÍTICO', color: 'rojo', criterion: 'Evacuar ya.',
    })
  })
})
```

- [ ] **Step 2: Run it**

Run: `npm run test:run -- mapping`
Expected: FAIL.

- [ ] **Step 3: Implement `mapping.ts`**

```ts
/* eslint-disable @typescript-eslint/no-explicit-any */
// Explicit, documented es→en key mapping (spec §4.3). User-facing strings are
// NOT translated — only keys are anglicized.

const PHASE_MAP: Record<string, string> = {
  escena: 'scene',
  primaria: 'primary',
  secundaria: 'secondary',
  evacuacion: 'evacuation',
}

export function mapAcronym(a: any) {
  return {
    id: a.id,
    acronym: a.sigla,
    name: a.nombre,
    concept: a.concepto,
    isSequence: a.es_secuencia,
    rationale: a.racional,
    ...(a.definicion ? { definition: a.definicion } : {}),
    ...(a.nota ? { note: a.nota } : {}),
    ...(a.letras
      ? { letters: a.letras.map((l: any) => ({ letter: l.letra, meaning: l.significado, detail: l.detalle })) }
      : {}),
    ...(a.componentes
      ? { components: a.componentes.map((c: any) => ({ name: c.nombre, detail: c.detalle })) }
      : {}),
  }
}

export function mapChainPhase(p: any) {
  const phase = PHASE_MAP[p.fase]
  if (!phase) throw new Error(`Unknown phase: ${p.fase}`)
  return {
    phase,
    name: p.nombre,
    rationale: p.racional,
    ...(p.orden_estricto ? { strictOrder: true } : {}),
    ...(p.ref_sigla ? { refAcronym: p.ref_sigla } : {}),
    content: p.contenido ?? {},
  }
}

export function mapEvacLevel(e: any) {
  return { level: e.nivel, color: e.color, criterion: e.criterio }
}

export function mapPracticalRule(r: any) {
  return { id: r.id, rule: r.regla, concept: r.concepto }
}

export function mapClinicalTopic(t: any) {
  return { id: t.id, name: t.nombre, rationale: t.racional }
}

export function mapCard(c: any) {
  return {
    id: c.id, topic: c.tema, type: c.tipo, prompt: c.prompt,
    answer: c.respuesta, rationaleRef: c.racional_ref,
  }
}

export function mapCase(c: any) {
  // CaseSchema requires `title`; the YAML uses `titulo`. Other case fields pass
  // through (cases are the Module 3 contract, validated but unused in v1).
  const { titulo, ...rest } = c
  return { ...rest, title: titulo }
}

export function mapPosition(p: any) {
  return { situation: p.situacion, position: p.posicion }
}

export function mapWorkedExample(w: any) {
  return {
    title: w.titulo,
    steps: w.steps.map((s: any) => ({
      phase: PHASE_MAP[s.fase] ?? s.fase, state: s.estado, action: s.accion, rationaleRef: s.racional_ref,
    })),
  }
}
```

- [ ] **Step 4: Run it**

Run: `npm run test:run -- mapping`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(content): add es→en field mapping"
```

---

### Task 9: Author the worked_example block in YAML

**Files:**
- Modify: `docs/contenido-cav.yaml`

- [ ] **Step 1: Append the `worked_example` block** (based on "Caída en descenso", simplified; every `racional_ref` resolves to an existing id)

```yaml
# ---------------------------------------------------------------------
# WORKED EXAMPLE  ·  Módulo 1 (R1.6) — una pasada limpia por la cadena
# Cada racional_ref debe resolver a un id existente (sigla/fase/tema/regla).
# ---------------------------------------------------------------------
worked_example:
  titulo: "Caída en un descenso, terreno de bloques"
  steps:
    - fase: "escena"
      estado: "Tu compañero cae varios metros en un canal de pedrero. Sangra del muslo y no se mueve."
      accion: "Mirás el terreno, asegurás la zona y te ponés guantes antes de acercarte."
      racional_ref: "escena"
    - fase: "primaria"
      estado: "No responde, respira; sangrado pulsátil en el muslo; casco puesto."
      accion: "H: controlás la hemorragia masiva con presión directa antes que nada."
      racional_ref: "habcde"
    - fase: "primaria"
      estado: "Hemorragia controlada; hay mecanismo de trauma."
      accion: "A: abrís la vía aérea con subluxación mandibular (control cervical)."
      racional_ref: "habcde"
    - fase: "secundaria"
      estado: "Consciente pero alterado; pálido, frío y húmedo; dolor abdominal."
      accion: "Reconocés el shock por la piel y tomás signos vitales de base."
      racional_ref: "shock"
    - fase: "evacuacion"
      estado: "Shock con sospecha de sangrado interno, zona remota a 2 h."
      accion: "Decidís evacuación CRÍTICA: el sangrado interno no se resuelve en el terreno."
      racional_ref: "shock"
```

- [ ] **Step 2: Commit**

```bash
git add docs/contenido-cav.yaml
git commit -m "content: add worked_example block for Module 1 (R1.6)"
```

---

### Task 10: build-content script — parse, map, validate, emit

**Files:**
- Create: `scripts/build-content.ts`
- Modify: `.gitignore` (already ignores `node_modules/dist`; add generated dir)

- [ ] **Step 1: Ensure generated dir is gitignored**

Append to `.gitignore`:

```
src/shared/content/generated/
```

- [ ] **Step 2: Implement `scripts/build-content.ts`**

```ts
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parse as parseYaml } from 'yaml'
import { ContentSchema, CasesSchema } from '../src/shared/content/schemas'
import {
  mapAcronym, mapChainPhase, mapEvacLevel, mapPracticalRule,
  mapClinicalTopic, mapCard, mapPosition, mapWorkedExample, mapCase,
} from '../src/shared/content/mapping'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const checkOnly = process.argv.includes('--check')

function readYaml(rel: string): any {
  return parseYaml(readFileSync(resolve(root, rel), 'utf8'))
}

function mapContent(raw: any) {
  return {
    meta: { source: raw.meta?.fuente ?? '', version: raw.meta?.version ?? '', language: raw.meta?.idioma ?? 'es' },
    acronyms: (raw.siglas ?? []).map(mapAcronym),
    chain: (raw.cadena ?? []).map(mapChainPhase),
    vitalSigns: anglicizeVitals(raw.signos_vitales ?? {}),
    positions: (raw.posicion_victima ?? []).map(mapPosition),
    practicalRules: (raw.reglas_practicas ?? []).map(mapPracticalRule),
    evacLevels: (raw.niveles_evacuacion ?? []).map(mapEvacLevel),
    clinicalTopics: (raw.temas_clinicos ?? []).map(mapClinicalTopic),
    cards: (raw.tarjetas ?? []).map(mapCard),
    workedExample: mapWorkedExample(raw.worked_example),
  }
}

// vitalSigns keys are preserved loosely (schema uses passthrough); we only
// rename the top-level ones the UI reads.
function anglicizeVitals(v: any) {
  return {
    components: v.componentes,
    respiratoryRate: v.frecuencia_respiratoria,
    heartRate: v.frecuencia_cardiaca,
    bloodPressure: v.presion_arterial,
    skin: v.piel,
    capillaryRefill: v.relleno_capilar,
  }
}

function fail(msg: string): never {
  console.error(`\n✖ content build failed:\n${msg}\n`)
  process.exit(1)
}

function main() {
  const rawContent = readYaml('docs/contenido-cav.yaml')
  const rawCases = readYaml('docs/casos.yaml')

  const mapped = mapContent(rawContent)

  const contentResult = ContentSchema.safeParse(mapped)
  if (!contentResult.success) {
    fail(contentResult.error.issues.map(i => `  ${i.path.join('.')}: ${i.message}`).join('\n'))
  }
  const content = contentResult.data

  const casesResult = CasesSchema.safeParse((rawCases.casos ?? []).map(mapCase))
  if (!casesResult.success) {
    fail(casesResult.error.issues.map(i => `  ${i.path.join('.')}: ${i.message}`).join('\n'))
  }

  // Integrity checks (Task 11) are invoked here.
  runIntegrityChecks(content)

  if (!checkOnly) {
    const outDir = resolve(root, 'src/shared/content/generated')
    mkdirSync(outDir, { recursive: true })
    writeFileSync(resolve(outDir, 'content.json'), JSON.stringify(content, null, 2))
    writeFileSync(resolve(outDir, 'cases.json'), JSON.stringify(casesResult.data, null, 2))
    console.log('✓ content built')
  } else {
    console.log('✓ content valid')
  }
}

// Defined in Task 11; placeholder import-free declaration kept here so the file
// compiles in this task. Replaced by the real implementation in Task 11.
function runIntegrityChecks(_content: unknown) {}

main()
```

- [ ] **Step 3: Run the build**

Run: `npm run content:build`
Expected: `✓ content built`; files appear in `src/shared/content/generated/`.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(content): add build-content parse/map/validate/emit"
```

---

### Task 11: build-content — referential integrity + concept-id uniqueness

**Files:**
- Modify: `scripts/build-content.ts`
- Test: `tests/scripts/integrity.test.ts`
- Create: `scripts/integrity.ts` (extracted so it is unit-testable)

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest'
import { collectConceptIds, findDuplicateIds, findDanglingRefs } from '../../scripts/integrity'

const base = {
  acronyms: [{ id: 'habcde', concept: 'primaria', rationale: 'r' }],
  chain: [{ phase: 'primary', rationale: 'r', content: {} }],
  clinicalTopics: [{ id: 'shock', name: 'Shock', rationale: 'r' }],
  practicalRules: [{ id: 'hemorragia', rule: 'r', concept: 'habcde' }],
  workedExample: { title: 't', steps: [{ phase: 'primary', state: 's', action: 'a', rationaleRef: 'shock' }] },
  cards: [{ id: 'c1', rationaleRef: 'habcde' }],
} as any

describe('integrity', () => {
  it('collects all concept ids', () => {
    expect(collectConceptIds(base)).toEqual(expect.arrayContaining(['habcde', 'shock', 'hemorragia']))
  })

  it('detects duplicate ids across sources', () => {
    const dup = { ...base, clinicalTopics: [{ id: 'habcde', name: 'x', rationale: 'r' }] }
    expect(findDuplicateIds(dup)).toContain('habcde')
  })

  it('detects dangling rationaleRef', () => {
    const bad = {
      ...base,
      workedExample: { title: 't', steps: [{ phase: 'primary', state: 's', action: 'a', rationaleRef: 'ghost' }] },
    }
    expect(findDanglingRefs(bad)).toContain('ghost')
  })

  it('passes a clean content set', () => {
    expect(findDuplicateIds(base)).toEqual([])
    expect(findDanglingRefs(base)).toEqual([])
  })
})
```

- [ ] **Step 2: Run it**

Run: `npm run test:run -- integrity`
Expected: FAIL (missing `scripts/integrity`).

- [ ] **Step 3: Implement `scripts/integrity.ts`**

```ts
/* eslint-disable @typescript-eslint/no-explicit-any */

// Every source that produces a concept id used as a rationale key (spec §4.4).
export function collectConceptIds(c: any): string[] {
  const ids: string[] = []
  for (const a of c.acronyms ?? []) ids.push(a.id, a.concept)
  for (const p of c.chain ?? []) ids.push(p.phase) // phases are valid ref targets (§4.4)
  for (const t of c.clinicalTopics ?? []) ids.push(t.id)
  for (const r of c.practicalRules ?? []) ids.push(r.id)
  return ids.filter((v, i, arr) => arr.indexOf(v) === i)
}

// A concept id must be produced by exactly one source row. Duplicate id rows
// would silently overwrite a rationale-map entry.
export function findDuplicateIds(c: any): string[] {
  const counts = new Map<string, number>()
  const bump = (id: string) => counts.set(id, (counts.get(id) ?? 0) + 1)
  for (const a of c.acronyms ?? []) bump(a.id)
  for (const t of c.clinicalTopics ?? []) bump(t.id)
  for (const r of c.practicalRules ?? []) bump(r.id)
  return [...counts.entries()].filter(([, n]) => n > 1).map(([id]) => id)
}

export function findDanglingRefs(c: any): string[] {
  const known = new Set(collectConceptIds(c))
  const dangling: string[] = []
  const check = (ref?: string) => {
    if (ref && !known.has(ref)) dangling.push(ref)
  }
  // v1 validates only content it consumes. Card (Module 2) rationale refs are
  // validated when Module 2 is built and those concepts get stable ids.
  for (const s of c.workedExample?.steps ?? []) check(s.rationaleRef)
  return dangling.filter((v, i, arr) => arr.indexOf(v) === i)
}
```

> **Scope decision:** the real `tarjetas` (Module-2 cards) reference concepts (`secundaria`, `signos_vitales`, `niveles_evacuacion`) that have no stable concept id in the v1 model, so v1 does NOT ref-validate card refs — only `worked_example` (which v1 renders). Card-ref integrity is enforced when Module 2 lands. Add a test asserting a dangling *card* ref yields no findings in v1:
> ```ts
> it('does not validate card rationaleRef in v1 (deferred to Module 2)', () => {
>   const withBadCard = { ...base, cards: [{ id: 'c1', rationaleRef: 'does-not-exist' }] }
>   expect(findDanglingRefs(withBadCard)).toEqual([])
> })
> ```

- [ ] **Step 4: Wire it into `build-content.ts`** — replace the placeholder `runIntegrityChecks`

```ts
import { findDuplicateIds, findDanglingRefs } from './integrity'

function runIntegrityChecks(content: any) {
  const dups = findDuplicateIds(content)
  if (dups.length) fail(dups.map(id => `  Duplicate concept id: ${id}`).join('\n'))
  const dangling = findDanglingRefs(content)
  if (dangling.length) fail(dangling.map(r => `  Dangling rationaleRef: ${r}`).join('\n'))
}
```

(Remove the old placeholder `function runIntegrityChecks(_content: unknown) {}`.)

- [ ] **Step 5: Run tests and build**

Run: `npm run test:run -- integrity && npm run content:check`
Expected: tests PASS; `✓ content valid`.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(content): enforce id-uniqueness and ref-integrity at build"
```

---

### Task 12: Test fixture + loader + Vite content plugin

**Files:**
- Create: `tests/fixtures/content.fixture.ts`
- Create: `src/shared/content/loader.ts`
- Modify: `vite.config.ts` (run build-content on buildStart + yaml watch)
- Test: `tests/shared/content/loader.test.ts`

- [ ] **Step 1: Create the fixture** `tests/fixtures/content.fixture.ts`

```ts
import type { Content } from '@/shared/content/types'

export const validContent: Content = {
  meta: { source: 'fixture', version: '0', language: 'es' },
  acronyms: [
    {
      id: 'habcde', acronym: 'HABCDE', name: 'Evaluación primaria', concept: 'primaria',
      isSequence: true,
      letters: [
        { letter: 'H', meaning: 'Hemorragia', detail: 'Detener hemorragia.' },
        { letter: 'A', meaning: 'Apertura de la vía aérea', detail: 'Con control cervical.' },
      ],
      rationale: 'Lo que mata primero, primero.',
    },
    {
      id: 'avdn', acronym: 'AVDN', name: 'Escala de conciencia', concept: 'conciencia',
      isSequence: false,
      letters: [{ letter: 'A', meaning: 'Alerta', detail: 'Orientada.' }],
      rationale: 'Mide el nivel de conciencia.',
    },
  ],
  chain: [
    { phase: 'scene', name: 'Escena', rationale: 'Seguridad primero.', content: { buscar_ayuda: 'Delegá la llamada.' } },
    { phase: 'primary', name: 'Primaria · HABCDE', rationale: 'Orden estricto.', strictOrder: true, refAcronym: 'habcde', content: {} },
    { phase: 'secondary', name: 'Secundaria', rationale: 'Buscar el resto.', content: {} },
    { phase: 'evacuation', name: 'Evacuación', rationale: 'Definir gravedad.', content: {} },
  ],
  vitalSigns: { components: ['Frecuencia cardíaca'], heartRate: { adulto: '60-100' } },
  positions: [{ situation: 'Consciente', position: 'La más confortable.' }],
  practicalRules: [{ id: 'hemorragia', rule: 'Presión directa.', concept: 'habcde' }],
  evacLevels: [
    { level: 'CRÍTICO', color: 'rojo', criterion: 'Evacuar ya.' },
    { level: 'GRAVE', color: 'ámbar', criterion: 'Se recomienda evacuar.' },
    { level: 'LEVE', color: 'verde', criterion: 'Se puede continuar.' },
  ],
  clinicalTopics: [{ id: 'shock', name: 'Shock', rationale: 'Hipoperfusión; piel pálida, fría y húmeda.' }],
  cards: [],
  workedExample: {
    title: 'Caída en descenso',
    steps: [{ phase: 'primary', state: 'Sangrado pulsátil.', action: 'Controlás la hemorragia.', rationaleRef: 'habcde' }],
  },
}

// Variant with a duplicate id, for the build-guard test.
export const duplicateIdContent = {
  ...validContent,
  clinicalTopics: [{ id: 'habcde', name: 'Conflict', rationale: 'r' }],
}
```

- [ ] **Step 2: Write the failing loader test** `tests/shared/content/loader.test.ts`

`vi.mock` is hoisted above imports, so the mock data is created with `vi.hoisted`. The generated JSON files are gitignored and may not exist at test time, so we mock those module imports directly — this keeps the loader test independent of a prior `content:build`.

```ts
import { describe, it, expect, vi } from 'vitest'

// Inline minimal Content inside vi.hoisted so it is available to the hoisted vi.mock factories.
const mock = vi.hoisted(() => ({
  content: {
    meta: { source: 's', version: '0', language: 'es' },
    acronyms: [{ id: 'habcde', acronym: 'HABCDE', name: 'P', concept: 'primaria', isSequence: true,
      letters: [{ letter: 'H', meaning: 'Hemorragia', detail: 'Detener.' }], rationale: 'Primero.' }],
    chain: [{ phase: 'primary', name: 'P', rationale: 'r', content: {} }],
    vitalSigns: { components: ['FC'] },
    practicalRules: [{ id: 'hemorragia', rule: 'r', concept: 'habcde' }],
    evacLevels: [{ level: 'CRÍTICO', color: 'rojo', criterion: 'c' }],
    clinicalTopics: [{ id: 'shock', name: 'Shock', rationale: 'r' }],
    cards: [],
    workedExample: { title: 't', steps: [{ phase: 'primary', state: 's', action: 'a', rationaleRef: 'habcde' }] },
  },
}))

vi.mock('@/shared/content/generated/content.json', () => ({ default: mock.content }))
vi.mock('@/shared/content/generated/cases.json', () => ({ default: [] }))

import { loadContent } from '@/shared/content/loader'

describe('loadContent', () => {
  it('returns validated content and memoizes', () => {
    const a = loadContent()
    const b = loadContent()
    expect(a.acronyms[0]?.id).toBe('habcde')
    expect(a).toBe(b) // same reference → memoized
  })
})
```

- [ ] **Step 3: Implement `loader.ts`**

```ts
import contentJson from './generated/content.json'
import casesJson from './generated/cases.json'
import { ContentSchema, CasesSchema } from './schemas'
import type { Content, Cases } from './types'

let cachedContent: Content | null = null
let cachedCases: Cases | null = null

export function loadContent(): Content {
  if (!cachedContent) cachedContent = ContentSchema.parse(contentJson)
  return cachedContent
}

export function loadCases(): Cases {
  if (!cachedCases) cachedCases = CasesSchema.parse(casesJson)
  return cachedCases
}
```

- [ ] **Step 4: Add the Vite plugin to run build-content** — modify `vite.config.ts`

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

function contentPlugin() {
  const run = () => execFileSync('npx', ['tsx', 'scripts/build-content.ts'], { stdio: 'inherit' })
  return {
    name: 'wfa-content',
    buildStart() { run() },
    configureServer(server: any) {
      server.watcher.add(path.resolve(__dirname, 'docs'))
      server.watcher.on('change', (file: string) => {
        if (file.endsWith('.yaml')) run()
      })
    },
  }
}

export default defineConfig({
  resolve: {
    alias: {
      '@/shared': path.resolve(__dirname, 'src/shared'),
      '@/modules': path.resolve(__dirname, 'src/modules'),
    },
  },
  plugins: [contentPlugin(), react()],
})
```

- [ ] **Step 5: Run loader test + full build**

Run: `npm run content:build && npm run test:run -- loader`
Expected: build emits JSON; loader test PASS.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(content): add fixture, memoized loader, and vite content plugin"
```

---

### Task 13: Rationale map

**Files:**
- Create: `src/shared/domain/rationale.ts`
- Test: `tests/shared/domain/rationale.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest'
import { buildRationaleMap, getRationale } from '@/shared/domain/rationale'
import { validContent } from '../../fixtures/content.fixture'

describe('rationale map', () => {
  it('indexes rationale by concept id from every source', () => {
    const m = buildRationaleMap(validContent)
    expect(getRationale('habcde', m)).toContain('mata primero')
    expect(getRationale('shock', m)).toContain('Hipoperfusión')
    expect(getRationale('primaria', m)).toBeDefined() // acronym.concept
  })

  it('returns undefined for an unknown concept', () => {
    const m = buildRationaleMap(validContent)
    expect(getRationale('ghost', m)).toBeUndefined()
  })
})
```

- [ ] **Step 2: Run it**

Run: `npm run test:run -- rationale`
Expected: FAIL.

- [ ] **Step 3: Implement `rationale.ts`**

```ts
import type { Content } from '@/shared/content/types'

export function buildRationaleMap(content: Content): Map<string, string> {
  const m = new Map<string, string>()
  for (const a of content.acronyms) {
    m.set(a.id, a.rationale)
    m.set(a.concept, a.rationale)
  }
  for (const phase of content.chain) m.set(phase.phase, phase.rationale)
  for (const t of content.clinicalTopics) m.set(t.id, t.rationale)
  return m
}

export function getRationale(conceptId: string, map: Map<string, string>): string | undefined {
  return map.get(conceptId)
}
```

- [ ] **Step 4: Run it**

Run: `npm run test:run -- rationale`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(domain): add rationale map (M2/M3 reuse contract)"
```

---

## Phase C — Storage

### Task 14: Storage KV wrapper with in-memory fallback

**Files:**
- Create: `src/shared/domain/storage/index.ts`, `src/shared/domain/storage/keys.ts`
- Test: `tests/shared/domain/storage.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect, beforeEach } from 'vitest'
import 'fake-indexeddb/auto'
import { createMemoryKV } from '@/shared/domain/storage'

describe('memory KV', () => {
  let kv: ReturnType<typeof createMemoryKV>
  beforeEach(() => { kv = createMemoryKV() })

  it('round-trips a value', async () => {
    await kv.set('progress:learn:lastNode', 'habcde-h')
    expect(await kv.get<string>('progress:learn:lastNode')).toBe('habcde-h')
  })

  it('deletes and clears', async () => {
    await kv.set('a', 1)
    await kv.del('a')
    expect(await kv.get('a')).toBeUndefined()
    await kv.set('b', 2)
    await kv.clear()
    expect(await kv.get('b')).toBeUndefined()
  })
})
```

- [ ] **Step 2: Run it**

Run: `npm run test:run -- storage`
Expected: FAIL.

- [ ] **Step 3: Implement `keys.ts`**

```ts
export const KEYS = {
  storageVersion: 'meta:storageVersion',
  lastLearnNode: 'progress:learn:lastNode',
} as const
```

- [ ] **Step 4: Implement `storage/index.ts`**

```ts
import { get as idbGet, set as idbSet, del as idbDel, clear as idbClear } from 'idb-keyval'

export interface KV {
  get<T>(key: string): Promise<T | undefined>
  set<T>(key: string, value: T): Promise<void>
  del(key: string): Promise<void>
  clear(): Promise<void>
}

export function createMemoryKV(): KV {
  const m = new Map<string, unknown>()
  return {
    async get<T>(k: string) { return m.get(k) as T | undefined },
    async set<T>(k: string, v: T) { m.set(k, v) },
    async del(k: string) { m.delete(k) },
    async clear() { m.clear() },
  }
}

function createIdbKV(): KV {
  return {
    get: <T>(k: string) => idbGet<T>(k),
    set: <T>(k: string, v: T) => idbSet(k, v),
    del: (k: string) => idbDel(k),
    clear: () => idbClear(),
  }
}

async function probe(): Promise<boolean> {
  try {
    await idbSet('__wfa_probe__', 1)
    await idbDel('__wfa_probe__')
    return true
  } catch {
    return false
  }
}

let cached: KV | null = null
export async function getStorage(): Promise<KV> {
  if (cached) return cached
  cached = (await probe()) ? createIdbKV() : createMemoryKV()
  return cached
}

// test-only reset
export function __resetStorage() { cached = null }
```

- [ ] **Step 5: Run it**

Run: `npm run test:run -- storage`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(storage): add KV wrapper with in-memory fallback"
```

---

### Task 15: Storage migrations runner

**Files:**
- Create: `src/shared/domain/storage/migrations.ts`
- Test: `tests/shared/domain/migrations.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest'
import { createMemoryKV } from '@/shared/domain/storage'
import { runMigrations, CURRENT_VERSION } from '@/shared/domain/storage/migrations'
import { KEYS } from '@/shared/domain/storage/keys'

describe('migrations', () => {
  it('sets version on a fresh store and is idempotent', async () => {
    const kv = createMemoryKV()
    await runMigrations(kv)
    expect(await kv.get<number>(KEYS.storageVersion)).toBe(CURRENT_VERSION)
    await runMigrations(kv) // second run no-ops
    expect(await kv.get<number>(KEYS.storageVersion)).toBe(CURRENT_VERSION)
  })
})
```

- [ ] **Step 2: Run it**

Run: `npm run test:run -- migrations`
Expected: FAIL.

- [ ] **Step 3: Implement `migrations.ts`**

```ts
import type { KV } from './index'
import { KEYS } from './keys'

export const CURRENT_VERSION = 1

interface Migration { from: number; to: number; run(kv: KV): Promise<void> }

// v1 establishes the baseline; no data transforms yet.
const MIGRATIONS: Migration[] = []

export async function runMigrations(kv: KV): Promise<void> {
  let version = (await kv.get<number>(KEYS.storageVersion)) ?? 0
  for (const m of MIGRATIONS) {
    if (m.from === version) {
      await m.run(kv)
      version = m.to
    }
  }
  if (version !== CURRENT_VERSION) {
    await kv.set(KEYS.storageVersion, CURRENT_VERSION)
  }
}
```

- [ ] **Step 4: Run it**

Run: `npm run test:run -- migrations`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(storage): add versioned migration runner (v1 baseline)"
```

---

## Phase D — Design system

### Task 16: Design tokens + base stylesheet

**Files:**
- Create: `src/shared/ui/tokens.css`
- Modify: `src/index.css` (import tokens, set body defaults)

- [ ] **Step 1: Create `src/shared/ui/tokens.css`**

```css
:root {
  /* paper */
  --bg: #f4ede0; --surface: #fdf8ee; --ink: #2d2418;
  --ink-soft: #5a4b30; --muted: #7a5f3d; --border: #d9c8a0;
  /* accent */
  --primary: #7a1f1c;
  /* severity (rojo/ámbar/verde) */
  --critical: #7a1f1c; --serious: #b87333; --mild: #4f6b3a;
  --on-critical: #f4ede0; --on-serious: #ffffff; --on-mild: #f4ede0;
  /* type */
  --font-serif: Georgia, 'Charter', 'Iowan Old Style', serif;
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  /* scale */
  --space-1: 4px; --space-2: 8px; --space-3: 12px; --space-4: 16px;
  --space-5: 24px; --space-6: 32px; --space-7: 48px;
  --radius-pill: 999px; --radius-sm: 6px; --radius-md: 10px; --radius-lg: 12px;
  --shadow-card: 0 1px 0 var(--border);
}
```

- [ ] **Step 2: Replace `src/index.css`**

```css
@import '@fontsource/inter/400.css';
@import '@fontsource/inter/600.css';
@import '@fontsource/inter/700.css';
@import './shared/ui/tokens.css';

* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body {
  background: var(--bg);
  color: var(--ink);
  font-family: var(--font-sans);
  font-size: 16px;
  line-height: 1.5;
  -webkit-text-size-adjust: 100%;
}
#root { min-height: 100vh; }
a { color: var(--primary); }
:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
.skip-link {
  position: absolute; left: -9999px; top: 0; background: var(--primary);
  color: var(--on-critical); padding: var(--space-2) var(--space-4); z-index: 100;
}
.skip-link:focus { left: 0; }
```

- [ ] **Step 3: Verify the app still renders**

Run: `npm run typecheck`
Expected: exits 0.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(ui): add Field Manual design tokens and base styles"
```

---

### Task 17: Chip component

**Files:**
- Create: `src/shared/ui/components/Chip.tsx`, `src/shared/ui/components/Chip.module.css`
- Test: `tests/shared/ui/Chip.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Chip } from '@/shared/ui/components/Chip'

describe('Chip', () => {
  it('renders children and a severity-labelled element', () => {
    render(<Chip severity="critical">Crítico</Chip>)
    const el = screen.getByText('Crítico')
    expect(el).toBeInTheDocument()
    expect(el).toHaveAttribute('data-severity', 'critical')
  })
})
```

- [ ] **Step 2: Run it**

Run: `npm run test:run -- Chip`
Expected: FAIL.

- [ ] **Step 3: Implement `Chip.module.css`**

```css
.chip {
  display: inline-block;
  padding: 3px 9px;
  border-radius: var(--radius-pill);
  font-family: var(--font-sans);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.critical { background: var(--critical); color: var(--on-critical); }
.serious { background: var(--serious); color: var(--on-serious); }
.mild { background: var(--mild); color: var(--on-mild); }
```

- [ ] **Step 4: Implement `Chip.tsx`**

```tsx
import styles from './Chip.module.css'

export type Severity = 'critical' | 'serious' | 'mild'

const LABELS: Record<Severity, string> = { critical: 'Crítico', serious: 'Grave', mild: 'Leve' }

export function Chip({ severity, children }: { severity: Severity; children?: React.ReactNode }) {
  return (
    <span
      className={`${styles.chip} ${styles[severity]}`}
      data-severity={severity}
      aria-label={`Severidad: ${LABELS[severity]}`}
    >
      {children ?? LABELS[severity]}
    </span>
  )
}
```

- [ ] **Step 5: Run it**

Run: `npm run test:run -- Chip`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(ui): add Chip severity component"
```

---

### Task 18: Card, Section, Breadcrumb components

**Files:**
- Create: `src/shared/ui/components/Card.tsx` + `.module.css`
- Create: `src/shared/ui/components/Section.tsx` + `.module.css`
- Create: `src/shared/ui/components/Breadcrumb.tsx` + `.module.css`
- Test: `tests/shared/ui/primitives.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Card } from '@/shared/ui/components/Card'
import { Section } from '@/shared/ui/components/Section'
import { Breadcrumb } from '@/shared/ui/components/Breadcrumb'

describe('primitives', () => {
  it('Card renders children', () => {
    render(<Card>hola</Card>)
    expect(screen.getByText('hola')).toBeInTheDocument()
  })

  it('Section shows its label and body', () => {
    render(<Section label="Significado">cuerpo</Section>)
    expect(screen.getByText('Significado')).toBeInTheDocument()
    expect(screen.getByText('cuerpo')).toBeInTheDocument()
  })

  it('Breadcrumb renders a nav with ordered items', () => {
    render(<Breadcrumb items={[{ label: 'Cadena' }, { label: 'HABCDE' }]} />)
    const nav = screen.getByRole('navigation')
    expect(nav).toBeInTheDocument()
    expect(screen.getByText('HABCDE')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run it**

Run: `npm run test:run -- primitives`
Expected: FAIL.

- [ ] **Step 3: Implement `Card.module.css` + `Card.tsx`**

```css
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  padding: var(--space-4);
}
```

```tsx
import styles from './Card.module.css'

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={`${styles.card} ${className ?? ''}`}>{children}</div>
}
```

- [ ] **Step 4: Implement `Section.module.css` + `Section.tsx`**

```css
.label {
  font-family: var(--font-sans);
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--muted);
  font-weight: 600;
  margin: var(--space-3) 0 var(--space-1);
}
.body { font-family: var(--font-serif); font-size: 15px; }
```

```tsx
import styles from './Section.module.css'

export function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className={styles.label}>{label}</p>
      <div className={styles.body}>{children}</div>
    </div>
  )
}
```

- [ ] **Step 5: Implement `Breadcrumb.module.css` + `Breadcrumb.tsx`**

```css
.nav { font-family: var(--font-sans); font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--muted); }
.list { display: flex; gap: var(--space-2); list-style: none; margin: 0; padding: 0; }
.sep { opacity: 0.5; }
```

```tsx
import { Link } from 'react-router-dom'
import styles from './Breadcrumb.module.css'

export interface Crumb { label: string; to?: string }

export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav className={styles.nav} aria-label="Migas de pan">
      <ol className={styles.list}>
        {items.map((c, i) => (
          <li key={`${c.label}-${i}`}>
            {c.to ? <Link to={c.to}>{c.label}</Link> : <span>{c.label}</span>}
            {i < items.length - 1 && <span className={styles.sep}> / </span>}
          </li>
        ))}
      </ol>
    </nav>
  )
}
```

- [ ] **Step 6: Run it (within a router)** — update test to wrap Breadcrumb

Because `Breadcrumb` uses `Link`, wrap the breadcrumb render in `<MemoryRouter>`:

```tsx
import { MemoryRouter } from 'react-router-dom'
// ...
render(<MemoryRouter><Breadcrumb items={[{ label: 'Cadena' }, { label: 'HABCDE' }]} /></MemoryRouter>)
```

Run: `npm run test:run -- primitives`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(ui): add Card, Section, Breadcrumb primitives"
```

---

### Task 19: Icon wrapper + concept→icon map + LetterBadge

**Files:**
- Create: `src/shared/ui/icons.ts`, `src/shared/ui/components/Icon.tsx`
- Create: `src/shared/ui/components/LetterBadge.tsx` + `.module.css`
- Test: `tests/shared/ui/icon-badge.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LetterBadge } from '@/shared/ui/components/LetterBadge'
import { Icon } from '@/shared/ui/components/Icon'

describe('icon + badge', () => {
  it('LetterBadge shows the letter with an aria-label', () => {
    render(<LetterBadge letter="H" />)
    const el = screen.getByLabelText('Letra H')
    expect(el).toHaveTextContent('H')
  })

  it('Icon renders an svg for a known concept', () => {
    const { container } = render(<Icon concept="hemorrhage" />)
    expect(container.querySelector('svg')).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run it**

Run: `npm run test:run -- icon-badge`
Expected: FAIL.

- [ ] **Step 3: Implement `icons.ts`**

```ts
import {
  AlertTriangle, Droplet, Wind, Activity, HeartPulse, Brain, Thermometer,
  Gauge, Eye, ClipboardList, Search, Circle, Siren, type LucideIcon,
} from 'lucide-react'

export type ConceptIcon =
  | 'scene' | 'hemorrhage' | 'airway' | 'breathing' | 'circulation' | 'deficit'
  | 'exposure' | 'vitalSigns' | 'consciousness' | 'history' | 'physicalExam'
  | 'pupils' | 'evacuation'

export const ICONS: Record<ConceptIcon, LucideIcon> = {
  scene: AlertTriangle, hemorrhage: Droplet, airway: Wind, breathing: Activity,
  circulation: HeartPulse, deficit: Brain, exposure: Thermometer, vitalSigns: Gauge,
  consciousness: Eye, history: ClipboardList, physicalExam: Search, pupils: Circle,
  evacuation: Siren,
}
```

- [ ] **Step 4: Implement `Icon.tsx`**

```tsx
import { ICONS, type ConceptIcon } from '@/shared/ui/icons'

export function Icon({ concept, size = 20 }: { concept: ConceptIcon; size?: number }) {
  const Cmp = ICONS[concept]
  return <Cmp size={size} aria-hidden focusable={false} />
}
```

- [ ] **Step 5: Implement `LetterBadge.module.css` + `LetterBadge.tsx`**

```css
.badge {
  display: inline-flex; align-items: center; justify-content: center;
  background: var(--primary); color: var(--on-critical);
  font-family: var(--font-serif); font-weight: 800; border-radius: var(--radius-md);
}
.md { width: 48px; height: 48px; font-size: 24px; }
.lg { width: 56px; height: 56px; font-size: 28px; }
```

```tsx
import styles from './LetterBadge.module.css'

export function LetterBadge({ letter, size = 'md' }: { letter: string; size?: 'md' | 'lg' }) {
  return (
    <span className={`${styles.badge} ${styles[size]}`} aria-label={`Letra ${letter}`}>
      {letter}
    </span>
  )
}
```

- [ ] **Step 6: Run it**

Run: `npm run test:run -- icon-badge`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(ui): add Icon wrapper, concept icon map, and LetterBadge"
```

---

## Phase E — PWA shell

### Task 20: PWA manifest + vite-plugin-pwa

**Files:**
- Modify: `vite.config.ts`
- Create: `public/icons/` placeholder icons (192/512/maskable)

- [ ] **Step 1: Add placeholder icons**

Create three PNGs at `public/icons/icon-192.png`, `icon-512.png`, `icon-mask.png` (any burgundy square for now; replace with real art in Task 31). Generate quickly:

Run:
```bash
mkdir -p public/icons
node -e "const fs=require('fs');const b=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==','base64');for(const f of ['icon-192.png','icon-512.png','icon-mask.png'])fs.writeFileSync('public/icons/'+f,b)"
```

- [ ] **Step 2: Configure `vite-plugin-pwa`** — modify `vite.config.ts` plugins

```ts
import { VitePWA } from 'vite-plugin-pwa'

// inside plugins: [...]
VitePWA({
  registerType: 'autoUpdate',
  includeAssets: ['icons/*.png'],
  workbox: {
    globPatterns: ['**/*.{js,css,html,json,woff2,png,svg,webmanifest}'],
    maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
  },
  manifest: {
    name: 'Entrenador WFA',
    short_name: 'WFA',
    description: 'Primeros socorros en lugares remotos — Cadena de Atención a la Víctima',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#f4ede0',
    theme_color: '#7a1f1c',
    lang: 'es-AR',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/icon-mask.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  },
}),
```

- [ ] **Step 3: Build to verify SW generates**

Run: `npm run build`
Expected: build succeeds; `dist/sw.js` and `dist/manifest.webmanifest` exist.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(pwa): add manifest and workbox precaching"
```

---

### Task 21: Online-status hook, SW registration, ErrorBoundary

**Files:**
- Create: `src/shared/app/pwa.ts`, `src/shared/app/ErrorBoundary.tsx`
- Test: `tests/shared/app/pwa.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect, act } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useOnlineStatus } from '@/shared/app/pwa'

describe('useOnlineStatus', () => {
  it('reflects navigator.onLine and updates on events', () => {
    const { result } = renderHook(() => useOnlineStatus())
    expect(typeof result.current).toBe('boolean')
    act(() => { window.dispatchEvent(new Event('offline')) })
    expect(result.current).toBe(false)
    act(() => { window.dispatchEvent(new Event('online')) })
    expect(result.current).toBe(true)
  })
})
```

- [ ] **Step 2: Run it**

Run: `npm run test:run -- pwa`
Expected: FAIL.

- [ ] **Step 3: Implement `pwa.ts`**

```ts
import { useEffect, useState } from 'react'

export function useOnlineStatus(): boolean {
  const [online, setOnline] = useState(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  )
  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])
  return online
}
```

- [ ] **Step 4: Implement `ErrorBoundary.tsx`**

```tsx
import { Component, type ReactNode } from 'react'

interface State { hasError: boolean }

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  override render() {
    if (this.state.hasError) {
      return (
        <main style={{ padding: 24, fontFamily: 'var(--font-serif)' }}>
          <h1>Contenido no disponible</h1>
          <p>Ocurrió un error al cargar el contenido. Recargá la app.</p>
        </main>
      )
    }
    return this.props.children
  }
}
```

- [ ] **Step 5: Run it**

Run: `npm run test:run -- pwa`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(app): add online-status hook and error boundary"
```

---

### Task 22: AppShell, router, App wiring

**Files:**
- Create: `src/shared/app/Shell.tsx` + `.module.css`
- Create: `src/shared/app/router.tsx`
- Modify: `src/shared/app/App.tsx`
- Create: `src/modules/learn/index.ts` (stub route export, filled in Task 27-30)
- Test: `tests/shared/app/shell.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Shell } from '@/shared/app/Shell'

describe('Shell', () => {
  it('renders header label and a skip link', () => {
    render(
      <MemoryRouter>
        <Shell><p>contenido</p></Shell>
      </MemoryRouter>,
    )
    expect(screen.getByText(/Aprender/i)).toBeInTheDocument()
    expect(screen.getByText('contenido')).toBeInTheDocument()
    expect(screen.getByText(/Saltar al contenido/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run it**

Run: `npm run test:run -- shell`
Expected: FAIL.

- [ ] **Step 3: Implement `Shell.module.css` + `Shell.tsx`**

```css
.header {
  position: sticky; top: 0; z-index: 10; background: var(--bg);
  border-bottom: 1px solid var(--border);
  display: flex; justify-content: space-between; align-items: center;
  padding: var(--space-3) var(--space-4);
  font-family: var(--font-sans); font-size: 11px; letter-spacing: 0.12em;
  text-transform: uppercase; color: var(--muted);
}
.dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 6px; }
.online { background: var(--mild); }
.offline { background: var(--muted); }
.main { max-width: 720px; margin: 0 auto; padding: var(--space-4); }
```

```tsx
import type { ReactNode } from 'react'
import { useOnlineStatus } from './pwa'
import styles from './Shell.module.css'

export function Shell({ children }: { children: ReactNode }) {
  const online = useOnlineStatus()
  return (
    <>
      <a className="skip-link" href="#main">Saltar al contenido</a>
      <header className={styles.header}>
        <span>
          <span className={`${styles.dot} ${online ? styles.online : styles.offline}`} />
          {online ? 'En línea' : 'Offline-ready'}
        </span>
        <span>Aprender · Módulo 1</span>
      </header>
      <main id="main" className={styles.main}>
        {children}
      </main>
    </>
  )
}
```

- [ ] **Step 4: Create `src/modules/learn/index.ts`** (stub; real routes added Task 26-30)

```tsx
import type { RouteObject } from 'react-router-dom'

export const learnRoutes: RouteObject[] = [
  { path: '/', element: <p>ChainMap (pendiente)</p> },
]
```

> Note: this file is `.tsx` because it contains JSX. Rename to `src/modules/learn/index.tsx`.

- [ ] **Step 5: Implement `router.tsx`**

The Shell is the layout route; it renders `<Outlet/>` for the matched child. Update `Shell` to render an `<Outlet/>` instead of `children` when used as a layout — but keep the `children` prop for direct testing. Resolve this by having `Shell` accept optional `children` and fall back to `<Outlet/>`:

```tsx
import { createHashRouter, Navigate, Outlet } from 'react-router-dom'
import { Shell } from './Shell'
import { learnRoutes } from '@/modules/learn'

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
    children: [...learnRoutes, { path: '*', element: <Navigate to="/" replace /> }],
  },
])
```

`Shell` already takes `children` (Task 22 Step 3), so `<Shell><Outlet/></Shell>` works as-is — no Shell change needed.

- [ ] **Step 6: Implement `App.tsx`**

```tsx
import { RouterProvider } from 'react-router-dom'
import { ErrorBoundary } from './ErrorBoundary'
import { router } from './router'

export function App() {
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  )
}
```

- [ ] **Step 7: Run tests + typecheck**

Run: `npm run test:run -- shell && npm run typecheck`
Expected: PASS; types clean.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat(app): add Shell, hash router, and App wiring"
```

---

## Phase F — Module 1 (Aprender)

### Task 23: Chain model projection

**Files:**
- Create: `src/modules/learn/domain/chainModel.ts`
- Test: `tests/modules/learn/chainModel.test.ts`

This is the heart of Module 1: it turns the heterogeneous `cadena` + `siglas` into a uniform navigable node tree (spec §5.1).

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest'
import { buildChainModel } from '@/modules/learn/domain/chainModel'
import { validContent } from '../../fixtures/content.fixture'

describe('buildChainModel', () => {
  const model = buildChainModel(validContent)

  it('produces the four phases in order', () => {
    expect(model.map(p => p.id)).toEqual(['scene', 'primary', 'secondary', 'evacuation'])
  })

  it('expands HABCDE into one node per letter', () => {
    const primary = model.find(p => p.id === 'primary')!
    expect(primary.nodes.map(n => n.letter)).toEqual(['H', 'A'])
    expect(primary.nodes[0]?.id).toBe('primary-habcde-h')
  })

  it('each letter node carries meaning/detail and a resolvable rationale', () => {
    const h = model.find(p => p.id === 'primary')!.nodes[0]!
    expect(h.title).toBe('Hemorragia')
    expect(h.items[0]?.detail).toContain('Detener')
    expect(h.rationaleId).toBe('habcde')
  })

  it('builds a single evacuation decision node referencing evac levels', () => {
    const evac = model.find(p => p.id === 'evacuation')!
    expect(evac.nodes).toHaveLength(1)
    expect(evac.nodes[0]?.kind).toBe('reference')
  })
})
```

- [ ] **Step 2: Run it**

Run: `npm run test:run -- chainModel`
Expected: FAIL.

- [ ] **Step 3: Implement `chainModel.ts`**

```ts
import type { Content, Acronym, PhaseId } from '@/shared/content/types'
import type { ConceptIcon } from '@/shared/ui/icons'

export interface NodeItem { label: string; detail: string; why?: string }

export type NodeKind = 'acronymLetter' | 'acronym' | 'topic' | 'reference'

export interface ChainNode {
  id: string
  phase: PhaseId
  title: string
  subtitle?: string
  icon?: ConceptIcon
  letter?: string
  kind: NodeKind
  items: NodeItem[]
  rationaleId?: string
}

export interface ChainPhase {
  id: PhaseId
  title: string
  rationale: string
  nodes: ChainNode[]
}

const PHASE_ORDER: PhaseId[] = ['scene', 'primary', 'secondary', 'evacuation']

function acronymById(content: Content, id: string): Acronym | undefined {
  return content.acronyms.find(a => a.id === id)
}

// Primary phase: one node per HABCDE letter (matches the chain-map design).
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
    items: [{ label: l.meaning, detail: l.detail }],
    rationaleId: habcde.id,
  }))
}

// Secondary phase: the acronyms used in the secondary survey, each as one node
// whose items are its letters/components.
function acronymNode(content: Content, id: string, icon: ConceptIcon): ChainNode | null {
  const a = acronymById(content, id)
  if (!a) return null
  const items: NodeItem[] =
    a.letters?.map(l => ({ label: `${l.letter} · ${l.meaning}`, detail: l.detail })) ??
    a.components?.map(c => ({ label: c.name, detail: c.detail })) ??
    []
  return {
    id: `secondary-${a.id}`,
    phase: 'secondary',
    title: a.acronym,
    subtitle: a.name,
    icon,
    kind: 'acronym',
    items,
    rationaleId: a.id,
  }
}

function secondaryNodes(content: Content): ChainNode[] {
  const wanted: Array<[string, ConceptIcon]> = [
    ['avdn', 'consciousness'],
    ['muestra', 'history'],
    ['dias', 'physicalExam'],
    ['pilar', 'pupils'],
  ]
  const nodes: ChainNode[] = []
  // Vital signs node first (from vitalSigns, not an acronym).
  nodes.push({
    id: 'secondary-vital-signs',
    phase: 'secondary',
    title: 'Signos vitales',
    subtitle: 'FC · FR · temperatura',
    icon: 'vitalSigns',
    kind: 'topic',
    items: (content.vitalSigns.components ?? []).map(c => ({ label: c, detail: '' })),
    rationaleId: 'secundaria',
  })
  for (const [id, icon] of wanted) {
    const n = acronymNode(content, id, icon)
    if (n) nodes.push(n)
  }
  return nodes
}

// Scene phase: derive nodes from the scene content envelope keys that exist.
function sceneNodes(content: Content): ChainNode[] {
  const phase = content.chain.find(p => p.phase === 'scene')
  const c = (phase?.content ?? {}) as Record<string, unknown>
  const nodes: ChainNode[] = []
  nodes.push({
    id: 'scene-safety',
    phase: 'scene',
    title: 'Seguridad de la escena',
    subtitle: 'bioseguridad · mecanismo · TEV',
    icon: 'scene',
    kind: 'topic',
    items: [{ label: 'Seguridad', detail: typeof c.buscar_ayuda === 'string' ? c.buscar_ayuda : 'Deténgase y piense. Protéjase.' }],
    rationaleId: 'escena',
  })
  return nodes
}

function evacuationNodes(content: Content): ChainNode[] {
  return [
    {
      id: 'evacuation-decision',
      phase: 'evacuation',
      title: 'Decisión de evacuación',
      subtitle: 'CRÍTICO · GRAVE · LEVE',
      icon: 'evacuation',
      kind: 'reference',
      items: content.evacLevels.map(e => ({ label: e.level, detail: e.criterion })),
      rationaleId: 'evacuacion',
    },
  ]
}

const NODE_BUILDERS: Record<PhaseId, (c: Content) => ChainNode[]> = {
  scene: sceneNodes,
  primary: primaryNodes,
  secondary: secondaryNodes,
  evacuation: evacuationNodes,
}

export function buildChainModel(content: Content): ChainPhase[] {
  return PHASE_ORDER.map(id => {
    const phase = content.chain.find(p => p.phase === id)
    return {
      id,
      title: phase?.name ?? id,
      rationale: phase?.rationale ?? '',
      nodes: NODE_BUILDERS[id](content),
    }
  })
}
```

- [ ] **Step 4: Run it**

Run: `npm run test:run -- chainModel`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(learn): project heterogeneous chain+acronyms into node model"
```

---

### Task 24: Selectors + navigation

**Files:**
- Create: `src/modules/learn/content/selectors.ts`
- Create: `src/modules/learn/domain/navigation.ts`
- Test: `tests/modules/learn/selectors.test.ts`, `tests/modules/learn/navigation.test.ts`

- [ ] **Step 1: Write the failing selectors test**

```ts
import { describe, it, expect } from 'vitest'
import { buildChainModel } from '@/modules/learn/domain/chainModel'
import { getNodeById, getAllNodes } from '@/modules/learn/content/selectors'
import { validContent } from '../../fixtures/content.fixture'

const model = buildChainModel(validContent)

describe('selectors', () => {
  it('flattens all nodes across phases', () => {
    expect(getAllNodes(model).length).toBeGreaterThanOrEqual(3)
  })
  it('finds a node by id', () => {
    expect(getNodeById(model, 'primary-habcde-h')?.letter).toBe('H')
    expect(getNodeById(model, 'nope')).toBeNull()
  })
})
```

- [ ] **Step 2: Write the failing navigation test**

```ts
import { describe, it, expect } from 'vitest'
import { buildChainModel } from '@/modules/learn/domain/chainModel'
import { findPrevNext } from '@/modules/learn/domain/navigation'
import { validContent } from '../../fixtures/content.fixture'

const model = buildChainModel(validContent)

describe('findPrevNext', () => {
  it('returns no prev for the first node', () => {
    const first = buildChainModel(validContent)[0]!.nodes[0]!
    const { prev } = findPrevNext(model, first.id)
    expect(prev).toBeUndefined()
  })
  it('links H → A inside primary', () => {
    const { next } = findPrevNext(model, 'primary-habcde-h')
    expect(next?.id).toBe('primary-habcde-a')
  })
})
```

- [ ] **Step 3: Run them**

Run: `npm run test:run -- selectors navigation`
Expected: FAIL.

- [ ] **Step 4: Implement `selectors.ts`**

```ts
import type { ChainPhase, ChainNode } from '@/modules/learn/domain/chainModel'

export function getAllNodes(model: ChainPhase[]): ChainNode[] {
  return model.flatMap(p => p.nodes)
}

export function getNodeById(model: ChainPhase[], id: string): ChainNode | null {
  return getAllNodes(model).find(n => n.id === id) ?? null
}

export function getPhases(model: ChainPhase[]): ChainPhase[] {
  return model
}
```

- [ ] **Step 5: Implement `navigation.ts`**

```ts
import type { ChainPhase, ChainNode } from '@/modules/learn/domain/chainModel'
import { getAllNodes } from '@/modules/learn/content/selectors'

export function findPrevNext(
  model: ChainPhase[],
  currentId: string,
): { prev?: ChainNode; next?: ChainNode } {
  const nodes = getAllNodes(model)
  const i = nodes.findIndex(n => n.id === currentId)
  if (i === -1) return {}
  return {
    ...(i > 0 ? { prev: nodes[i - 1] } : {}),
    ...(i < nodes.length - 1 ? { next: nodes[i + 1] } : {}),
  }
}
```

- [ ] **Step 6: Run them**

Run: `npm run test:run -- selectors navigation`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(learn): add node selectors and prev/next navigation"
```

---

### Task 25: Learn UI components

**Files:**
- Create: `src/modules/learn/ui/NodeCard.tsx` + `.module.css`
- Create: `src/modules/learn/ui/PhaseTimeline.tsx` + `.module.css`
- Create: `src/modules/learn/ui/ExpandableItem.tsx` + `.module.css`
- Test: `tests/modules/learn/ui.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { NodeCard } from '@/modules/learn/ui/NodeCard'
import { ExpandableItem } from '@/modules/learn/ui/ExpandableItem'
import type { ChainNode } from '@/modules/learn/domain/chainModel'

const node: ChainNode = {
  id: 'primary-habcde-h', phase: 'primary', title: 'Hemorragia', subtitle: 'Paso H de HABCDE',
  letter: 'H', kind: 'acronymLetter', items: [{ label: 'Hemorragia', detail: 'Detener.' }], rationaleId: 'habcde',
}

describe('learn ui', () => {
  it('NodeCard links to the node detail and shows its title', () => {
    render(<MemoryRouter><NodeCard node={node} /></MemoryRouter>)
    const link = screen.getByRole('link', { name: /Hemorragia/i })
    expect(link).toHaveAttribute('href', '#/chain/primary-habcde-h')
  })

  it('ExpandableItem shows label and detail', () => {
    render(<ExpandableItem item={{ label: 'Alerta', detail: 'Orientada.' }} />)
    expect(screen.getByText('Alerta')).toBeInTheDocument()
    expect(screen.getByText('Orientada.')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run it**

Run: `npm run test:run -- learn/ui`
Expected: FAIL.

- [ ] **Step 3: Implement `ExpandableItem.module.css` + `ExpandableItem.tsx`**

```css
.item { border-top: 1px solid var(--border); padding: var(--space-3) 0; }
.label { font-family: var(--font-serif); font-weight: 700; font-size: 15px; margin: 0 0 2px; }
.detail { font-family: var(--font-serif); font-size: 14px; margin: 0; color: var(--ink); }
.why { font-style: italic; border-left: 3px solid var(--primary); padding-left: var(--space-3); margin-top: var(--space-2); color: var(--ink-soft); }
```

```tsx
import type { NodeItem } from '@/modules/learn/domain/chainModel'
import styles from './ExpandableItem.module.css'

export function ExpandableItem({ item }: { item: NodeItem }) {
  return (
    <div className={styles.item}>
      <p className={styles.label}>{item.label}</p>
      {item.detail && <p className={styles.detail}>{item.detail}</p>}
      {item.why && <p className={styles.why}>{item.why}</p>}
    </div>
  )
}
```

- [ ] **Step 4: Implement `NodeCard.module.css` + `NodeCard.tsx`**

```css
.card {
  display: flex; align-items: center; gap: var(--space-3);
  padding: var(--space-3) var(--space-4); background: var(--surface);
  border: 1px solid var(--border); border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card); text-decoration: none; color: var(--ink);
  min-height: 44px;
}
.body { flex: 1; min-width: 0; }
.title { font-family: var(--font-serif); font-weight: 700; font-size: 15px; margin: 0; }
.meta { font-family: var(--font-sans); font-size: 11px; color: var(--muted); margin: 1px 0 0; }
.arrow { color: var(--muted); }
.iconBox {
  display: inline-flex; align-items: center; justify-content: center;
  width: 36px; height: 36px; border-radius: var(--radius-md);
  background: #fff5d6; color: var(--primary); flex: 0 0 36px;
}
```

```tsx
import { Link } from 'react-router-dom'
import { LetterBadge } from '@/shared/ui/components/LetterBadge'
import { Icon } from '@/shared/ui/components/Icon'
import type { ChainNode } from '@/modules/learn/domain/chainModel'
import styles from './NodeCard.module.css'

export function NodeCard({ node }: { node: ChainNode }) {
  return (
    <Link to={`/chain/${node.id}`} className={styles.card}>
      {node.letter ? (
        <LetterBadge letter={node.letter} />
      ) : node.icon ? (
        <span className={styles.iconBox}><Icon concept={node.icon} /></span>
      ) : null}
      <span className={styles.body}>
        <p className={styles.title}>{node.title}</p>
        {node.subtitle && <p className={styles.meta}>{node.subtitle}</p>}
      </span>
      <span className={styles.arrow} aria-hidden>›</span>
    </Link>
  )
}
```

- [ ] **Step 5: Implement `PhaseTimeline.module.css` + `PhaseTimeline.tsx`**

```css
.phase { margin-bottom: var(--space-5); }
.label { font-family: var(--font-sans); font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--muted); font-weight: 600; }
.title { font-family: var(--font-serif); font-size: 18px; font-weight: 700; margin: 2px 0 var(--space-3); }
.nodes { display: flex; flex-direction: column; gap: var(--space-2); }
```

```tsx
import type { ChainPhase } from '@/modules/learn/domain/chainModel'
import { NodeCard } from './NodeCard'
import styles from './PhaseTimeline.module.css'

export function PhaseTimeline({ phase, index }: { phase: ChainPhase; index: number }) {
  return (
    <section className={styles.phase}>
      <p className={styles.label}>Fase {index}</p>
      <h2 className={styles.title}>{phase.title}</h2>
      <div className={styles.nodes}>
        {phase.nodes.map(n => (
          <NodeCard key={n.id} node={n} />
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 6: Run it**

Run: `npm run test:run -- learn/ui`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(learn): add NodeCard, ExpandableItem, PhaseTimeline"
```

---

### Task 26: ChainMap route (home, R1.1)

**Files:**
- Create: `src/modules/learn/routes/ChainMap.tsx`
- Modify: `src/modules/learn/index.tsx` (register route)
- Test: `tests/modules/learn/ChainMap.test.tsx`

- [ ] **Step 1: Write the failing test** (mock the loader so the route test needs no prior `content:build`, consistent with Tasks 27-29)

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { validContent } from '../../fixtures/content.fixture'

vi.mock('@/shared/content/loader', () => ({ loadContent: () => validContent }))

import { ChainMap } from '@/modules/learn/routes/ChainMap'

describe('ChainMap', () => {
  it('renders all four phase titles and quick links', () => {
    render(<MemoryRouter><ChainMap /></MemoryRouter>)
    expect(screen.getByText(/Primaria/i)).toBeInTheDocument()
    expect(screen.getByText(/Evacuación/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Ver todo/i })).toHaveAttribute('href', '#/quickref')
    expect(screen.getByRole('link', { name: /Caso resuelto/i })).toHaveAttribute('href', '#/example')
  })
})
```

- [ ] **Step 2: Run it**

Run: `npm run test:run -- ChainMap`
Expected: FAIL.

- [ ] **Step 3: Implement `ChainMap.tsx`**

```tsx
import { Link } from 'react-router-dom'
import { loadContent } from '@/shared/content/loader'
import { buildChainModel } from '@/modules/learn/domain/chainModel'
import { PhaseTimeline } from '@/modules/learn/ui/PhaseTimeline'

export function ChainMap() {
  const content = loadContent()
  const model = buildChainModel(content)
  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, margin: '0 0 4px' }}>
        Cadena de Atención
      </h1>
      <p style={{ fontStyle: 'italic', color: 'var(--ink-soft)', marginTop: 0 }}>
        tocá un paso para abrirlo
      </p>
      {model.map((phase, i) => (
        <PhaseTimeline key={phase.id} phase={phase} index={i} />
      ))}
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-4)' }}>
        <Link to="/example" style={quickLink}>📘 Caso resuelto</Link>
        <Link to="/quickref" style={quickLink}>📋 Ver todo</Link>
      </div>
    </div>
  )
}

const quickLink: React.CSSProperties = {
  flex: 1, padding: '10px 12px', background: 'var(--surface)',
  border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
  textAlign: 'center', fontWeight: 600, fontFamily: 'var(--font-sans)', fontSize: 12,
}
```

- [ ] **Step 4: Register the route** — replace `src/modules/learn/index.tsx`

```tsx
import type { RouteObject } from 'react-router-dom'
import { ChainMap } from './routes/ChainMap'

export const learnRoutes: RouteObject[] = [
  { path: '/', element: <ChainMap /> },
]
```

- [ ] **Step 5: Run it**

Run: `npm run test:run -- ChainMap`
Expected: PASS (loader is mocked; no build needed).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(learn): add ChainMap home route (R1.1)"
```

---

### Task 27: NodeDetail route (R1.2–R1.5)

**Files:**
- Create: `src/modules/learn/routes/NodeDetail.tsx`
- Modify: `src/modules/learn/index.tsx`
- Test: `tests/modules/learn/NodeDetail.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { validContent } from '../../fixtures/content.fixture'

vi.mock('@/shared/content/loader', () => ({ loadContent: () => validContent }))

import { NodeDetail } from '@/modules/learn/routes/NodeDetail'

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/chain/:nodeId" element={<NodeDetail />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('NodeDetail', () => {
  it('shows the node title, its item detail, and the rationale (por qué)', () => {
    renderAt('/chain/primary-habcde-h')
    expect(screen.getByText('Hemorragia')).toBeInTheDocument()
    expect(screen.getByText(/Detener hemorragia/i)).toBeInTheDocument()
    expect(screen.getByText(/Por qué/i)).toBeInTheDocument()
    expect(screen.getByText(/mata primero/i)).toBeInTheDocument()
  })

  it('renders next link to the following node', () => {
    renderAt('/chain/primary-habcde-h')
    expect(screen.getByRole('link', { name: /Siguiente/i })).toHaveAttribute('href', '#/chain/primary-habcde-a')
  })
})
```

- [ ] **Step 2: Run it**

Run: `npm run test:run -- NodeDetail`
Expected: FAIL.

- [ ] **Step 3: Implement `NodeDetail.tsx`**

```tsx
import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { loadContent } from '@/shared/content/loader'
import { buildRationaleMap, getRationale } from '@/shared/domain/rationale'
import { buildChainModel } from '@/modules/learn/domain/chainModel'
import { getNodeById } from '@/modules/learn/content/selectors'
import { findPrevNext } from '@/modules/learn/domain/navigation'
import { Breadcrumb } from '@/shared/ui/components/Breadcrumb'
import { LetterBadge } from '@/shared/ui/components/LetterBadge'
import { Icon } from '@/shared/ui/components/Icon'
import { Section } from '@/shared/ui/components/Section'
import { ExpandableItem } from '@/modules/learn/ui/ExpandableItem'
import { getStorage } from '@/shared/domain/storage'
import { KEYS } from '@/shared/domain/storage/keys'

export function NodeDetail() {
  const { nodeId = '' } = useParams()
  const content = loadContent()
  const model = buildChainModel(content)
  const node = getNodeById(model, nodeId)
  const rationale = node?.rationaleId
    ? getRationale(node.rationaleId, buildRationaleMap(content))
    : undefined
  const { prev, next } = findPrevNext(model, nodeId)

  useEffect(() => {
    if (node) void getStorage().then(kv => kv.set(KEYS.lastLearnNode, node.id))
  }, [node])

  if (!node) {
    return <p>Nodo no encontrado. <Link to="/">Volver al mapa</Link></p>
  }

  return (
    <article>
      <Breadcrumb items={[{ label: 'Cadena', to: '/' }, { label: node.title }]} />
      <div style={{ margin: 'var(--space-3) 0' }}>
        {node.letter ? <LetterBadge letter={node.letter} size="lg" /> : node.icon ? <Icon concept={node.icon} size={32} /> : null}
      </div>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 24, margin: '0 0 2px' }}>{node.title}</h1>
      {node.subtitle && <p style={{ fontStyle: 'italic', color: 'var(--ink-soft)', marginTop: 0 }}>{node.subtitle}</p>}

      {node.items.map((it, i) => (
        <ExpandableItem key={`${it.label}-${i}`} item={it} />
      ))}

      {rationale && (
        <div style={{ marginTop: 'var(--space-4)' }}>
          <Section label="Por qué">{rationale}</Section>
        </div>
      )}

      <nav style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-5)', fontFamily: 'var(--font-sans)', fontSize: 13 }}>
        {prev ? <Link to={`/chain/${prev.id}`}>← Anterior</Link> : <span />}
        {next ? <Link to={`/chain/${next.id}`}>Siguiente →</Link> : <span />}
      </nav>
    </article>
  )
}
```

- [ ] **Step 4: Register the route** — `src/modules/learn/index.tsx`

```tsx
import type { RouteObject } from 'react-router-dom'
import { ChainMap } from './routes/ChainMap'
import { NodeDetail } from './routes/NodeDetail'

export const learnRoutes: RouteObject[] = [
  { path: '/', element: <ChainMap /> },
  { path: '/chain/:nodeId', element: <NodeDetail /> },
]
```

- [ ] **Step 5: Run it**

Run: `npm run test:run -- NodeDetail`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(learn): add NodeDetail route with rationale and prev/next (R1.2-R1.5)"
```

---

### Task 28: WorkedExample route (R1.6)

**Files:**
- Create: `src/modules/learn/routes/WorkedExample.tsx`
- Modify: `src/modules/learn/index.tsx`
- Test: `tests/modules/learn/WorkedExample.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { validContent } from '../../fixtures/content.fixture'

vi.mock('@/shared/content/loader', () => ({ loadContent: () => validContent }))

import { WorkedExample } from '@/modules/learn/routes/WorkedExample'

describe('WorkedExample', () => {
  it('renders the title and each step state/action', () => {
    render(<MemoryRouter><WorkedExample /></MemoryRouter>)
    expect(screen.getByText(/Caída en descenso/i)).toBeInTheDocument()
    expect(screen.getByText(/Sangrado pulsátil/i)).toBeInTheDocument()
    expect(screen.getByText(/Controlás la hemorragia/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run it**

Run: `npm run test:run -- WorkedExample`
Expected: FAIL.

- [ ] **Step 3: Implement `WorkedExample.tsx`**

```tsx
import { loadContent } from '@/shared/content/loader'
import { buildRationaleMap, getRationale } from '@/shared/domain/rationale'
import { Card } from '@/shared/ui/components/Card'
import { Section } from '@/shared/ui/components/Section'

export function WorkedExample() {
  const content = loadContent()
  const map = buildRationaleMap(content)
  const { title, steps } = content.workedExample
  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 24 }}>Caso resuelto</h1>
      <p style={{ fontStyle: 'italic', color: 'var(--ink-soft)' }}>{title}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {steps.map((s, i) => (
          <Card key={i}>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', margin: 0 }}>
              Paso {i + 1}
            </p>
            <p style={{ fontFamily: 'var(--font-serif)', margin: '4px 0' }}>{s.state}</p>
            <p style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, margin: '4px 0' }}>{s.action}</p>
            <Section label="Por qué">{getRationale(s.rationaleRef, map) ?? ''}</Section>
          </Card>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Register the route** — add to `learnRoutes`

```tsx
import { WorkedExample } from './routes/WorkedExample'
// add: { path: '/example', element: <WorkedExample /> },
```

- [ ] **Step 5: Run it**

Run: `npm run test:run -- WorkedExample`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(learn): add WorkedExample route (R1.6)"
```

---

### Task 29: QuickRef route (R1.7)

**Files:**
- Create: `src/modules/learn/routes/QuickRef.tsx`
- Create: `src/modules/learn/ui/QuickRefTable.tsx` + `.module.css`
- Modify: `src/modules/learn/index.tsx`
- Test: `tests/modules/learn/QuickRef.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { validContent } from '../../fixtures/content.fixture'

vi.mock('@/shared/content/loader', () => ({ loadContent: () => validContent }))

import { QuickRef } from '@/modules/learn/routes/QuickRef'

describe('QuickRef', () => {
  it('lists acronyms and the three evac levels', () => {
    render(<QuickRef />)
    expect(screen.getByText('HABCDE')).toBeInTheDocument()
    expect(screen.getByText('Crítico')).toBeInTheDocument()
    expect(screen.getByText('Grave')).toBeInTheDocument()
    expect(screen.getByText('Leve')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run it**

Run: `npm run test:run -- QuickRef`
Expected: FAIL.

- [ ] **Step 3: Implement `QuickRefTable.module.css` + `QuickRefTable.tsx`**

```css
.table { width: 100%; border-collapse: collapse; font-family: var(--font-sans); font-size: 13px; }
.table td { padding: 4px 0; border-top: 1px solid var(--border); }
.table td:first-child { font-weight: 600; padding-right: var(--space-4); }
.heading { font-family: var(--font-serif); font-weight: 700; margin: var(--space-4) 0 var(--space-2); }
```

```tsx
import styles from './QuickRefTable.module.css'

export function QuickRefTable({ rows }: { rows: Array<[string, string]> }) {
  return (
    <table className={styles.table}>
      <tbody>
        {rows.map(([k, v], i) => (
          <tr key={`${k}-${i}`}>
            <td>{k}</td>
            <td>{v}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
```

- [ ] **Step 4: Implement `QuickRef.tsx`**

```tsx
import { loadContent } from '@/shared/content/loader'
import { Chip, type Severity } from '@/shared/ui/components/Chip'
import { QuickRefTable } from '@/modules/learn/ui/QuickRefTable'
import styles from '@/modules/learn/ui/QuickRefTable.module.css'

const SEVERITY_BY_LEVEL: Record<string, Severity> = {
  'CRÍTICO': 'critical', 'GRAVE': 'serious', 'LEVE': 'mild',
}

export function QuickRef() {
  const content = loadContent()
  return (
    <div>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 24 }}>Referencia rápida</h1>

      <h2 className={styles.heading}>Siglas</h2>
      {content.acronyms.map(a => (
        <div key={a.id}>
          <h3 style={{ fontFamily: 'var(--font-serif)', margin: 'var(--space-3) 0 var(--space-1)' }}>
            {a.acronym} · {a.name}
          </h3>
          <QuickRefTable
            rows={
              a.letters?.map(l => [`${l.letter} · ${l.meaning}`, l.detail] as [string, string]) ??
              a.components?.map(c => [c.name, c.detail] as [string, string]) ??
              []
            }
          />
        </div>
      ))}

      <h2 className={styles.heading}>Niveles de evacuación</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {content.evacLevels.map(e => (
          <div key={e.level} style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
            <Chip severity={SEVERITY_BY_LEVEL[e.level] ?? 'mild'} />
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: 14 }}>{e.criterion}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Register the route** — final `src/modules/learn/index.tsx`

```tsx
import type { RouteObject } from 'react-router-dom'
import { ChainMap } from './routes/ChainMap'
import { NodeDetail } from './routes/NodeDetail'
import { WorkedExample } from './routes/WorkedExample'
import { QuickRef } from './routes/QuickRef'

export const learnRoutes: RouteObject[] = [
  { path: '/', element: <ChainMap /> },
  { path: '/chain/:nodeId', element: <NodeDetail /> },
  { path: '/example', element: <WorkedExample /> },
  { path: '/quickref', element: <QuickRef /> },
]
```

- [ ] **Step 6: Run it + full suite**

Run: `npm run test:run`
Expected: all PASS.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(learn): add QuickRef route (R1.7) and wire all learn routes"
```

---

## Phase G — Polish

### Task 30: Manual offline + render verification

**Files:** none (verification task)

- [ ] **Step 1: Build and preview**

Run: `npm run build && npm run preview`
Expected: server starts; open the printed URL.

- [ ] **Step 2: Verify in the browser**

- Home shows the four phases with HABCDE letter badges.
- Click H → NodeDetail shows "Hemorragia", detail, and "Por qué" rationale, with a "Siguiente →" link.
- `/example` and `/quickref` render.
- DevTools → Application → Service Workers shows an active SW; Network → "Offline" → reload still works.
- Lighthouse (mobile) → PWA installable; Performance ≥ 90, A11y ≥ 95 (note any failures to fix).

- [ ] **Step 3: Commit any fixes found**

```bash
git add -A
git commit -m "fix: address offline/render issues found in manual verification"
```

> If no fixes are needed, skip the commit.

---

### Task 31: README, CONTRIBUTING, deploy config

**Files:**
- Create: `README.md`, `CONTRIBUTING.md`
- Create: `vercel.json` (SPA fallback) — or `netlify.toml` if Netlify

- [ ] **Step 1: Create `README.md`**

```markdown
# Entrenador WFA

Offline-first PWA to learn and drill remote first aid (Cadena de Atención a la Víctima).

## Stack
React + Vite + TypeScript · PWA (Workbox) · content compiled from YAML.

## Scripts
- `npm run dev` — dev server (rebuilds content on YAML change)
- `npm run build` — typecheck + content build + production build
- `npm run test` — watch tests · `npm run test:run` — once
- `npm run lint` · `npm run typecheck`
- `npm run content:build` — compile `docs/*.yaml` → validated JSON

## Editing content
Clinical content lives in `docs/contenido-cav.yaml` and `docs/casos.yaml`.
Edit there (never hardcode in the UI), then `npm run content:build`. The build
fails on schema errors, dangling references, or duplicate concept ids.

## Reference
- PRD: `docs/PRD - Entrenador WFA.md`
- Design spec: `docs/superpowers/specs/2026-06-19-first-aid-mvp-design.md`
```

- [ ] **Step 2: Create `CONTRIBUTING.md`**

```markdown
# Contributing

## Conventions
- Code, file names, identifiers, comments, and commits in **English**.
- User-facing strings and the `.yaml` clinical content stay **Spanish**.

## Architecture (see design spec §3)
- `src/shared/*` — cross-cutting (content, domain, ui, app). Never imports `modules/`.
- `src/modules/<name>/{content,domain,ui,routes}` — a module imports only `shared/`.
- A module's `content/` holds raw-data selectors; view-model projections that need
  rationale lookups live in the module's `domain/` (e.g. `learn/domain/chainModel.ts`).

## Tests
Colocate under `tests/` mirroring the source path. TDD: failing test first.
```

- [ ] **Step 3: Create `vercel.json`** (SPA fallback)

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "docs: add README, CONTRIBUTING, and SPA deploy config"
```

---

## Definition of Done

- `npm run lint && npm run typecheck && npm run test:run && npm run build` all green.
- `npm run content:check` passes (schema + ref-integrity + id-uniqueness).
- App runs offline after first load; installable on mobile.
- Module 1 navigable end-to-end: ChainMap → NodeDetail (with rationale + prev/next) → WorkedExample → QuickRef.
- Every Module-1 requirement R1.1–R1.7 has a corresponding implemented route/feature.
