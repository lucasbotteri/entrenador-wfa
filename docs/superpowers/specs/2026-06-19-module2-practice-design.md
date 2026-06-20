# Design Spec — Módulo 2 "Practicar" (SRS)

> Date: 2026-06-19
> Status: Approved for implementation planning
> Source requirements: `docs/PRD - Entrenador WFA.md` §7 (R2.1-R2.7), §4 (pedagogía)
> Builds on: the shipped MVP (Module 1) + the rationale-map / storage / Field-Manual foundation.

## 1. Scope

Module 2 "Practicar": spaced-repetition flashcard practice with generative recall and elaborative feedback that reuses Module 1's rationale. The 42 cards already exist in `docs/contenido-cav.yaml` (`tarjetas`). This module renders them, grades answers, schedules review (Leitner), and tracks light gamification — all offline.

**In scope (R2.1-R2.7):**
- Four generative formats: `ordenar`, `escribir`, `cloze`, `elegir`.
- Leitner SRS (5 boxes, increasing intervals, due dates, interleaving).
- Elaborative feedback (rationale from Module 1, shown on correct AND wrong) + link to the Aprender node.
- Offline persistence of SRS state + streak.
- Reinforcement hook (wrong → box 1, reappears soon).
- Light gamification: day streak + mastery per topic.
- Tab-bar navigation (Aprender / Practicar / Escenarios-coming).
- Close the deferred card-ref integrity guard (cards' `rationaleRef` now all resolve).

**Non-goals:** no LLM / free-text grading; no Module 3; no timers; no accounts/sync; no push; no editing clinical content (only adding short rationale for `signos_vitales` / `niveles_evacuacion` if missing). The "self-grade fallback" was rejected (chose normalize+match).

**Conventions:** code/identifiers/files English; user-facing text + `.yaml` content Spanish. TDD; raw-binary gates; build fails on bad content. After YAML edits: `npm run content:build`.

## 2. Decisions (locked during brainstorming)

| Topic | Decision |
|---|---|
| Navigation | Bottom **tab bar** (Aprender / Practicar+due-badge / Escenarios-disabled), active tab derived from path. M1 routes unchanged. |
| Session shape | **Due-first, interleaved by topic, capped ~12-15**, with a few new cards mixed in. |
| `escribir` grading | **Normalize** (lowercase, strip accents/punctuation) + match any answer in the list; multi-word answers also accept all-tokens-present. |
| SRS | **Leitner 5 boxes**, intervals `[1,2,4,8,16]` days; correct → +1 box; wrong → box 1 (+1 day). |
| Gamification | Day **streak** + **mastery per topic** (% of topic's cards in box ≥ 4). |
| Rationale refs | **Extend the rationale map** with aliases + new keys so all card refs resolve (don't rewrite the 42 cards); activate the card-ref build guard. |

## 3. Architecture

### 3.1 Module layout

```
src/modules/practice/
├── content/
│   └── selectors.ts        # getDueCards, getCardsByTopic, allTopics (over loaded cards)
├── domain/
│   ├── srs.ts              # Leitner: CardState, schedule(state, result, today)
│   ├── session.ts          # buildSession(cards, states, today, opts)
│   ├── grading.ts          # grade(card, userAnswer) per format
│   ├── cloze.ts            # parseCloze(prompt) → segments + blank count
│   ├── streak.ts           # updateStreak(streak, today)
│   ├── mastery.ts          # masteryByTopic(cards, states)
│   └── conceptLinks.ts     # rationaleRef → Module-1 node route (for "Ver en Aprender")
├── ui/
│   ├── cards/
│   │   ├── OrderCard.tsx    # ordenar (reorder, accessible)
│   │   ├── WriteCard.tsx    # escribir (text input)
│   │   ├── ClozeCard.tsx    # cloze (one input per blank)
│   │   └── ChoiceCard.tsx   # elegir (options)
│   ├── CardShell.tsx        # common header (topic · type · prompt) + Comprobar
│   ├── FeedbackPanel.tsx    # ✓/✗ + correct + rationale + link + box movement
│   ├── MasteryBars.tsx      # per-topic mastery bars
│   └── SessionRunner.tsx    # drives the interleaved queue
│   └── *.module.css
├── routes/
│   ├── PracticeHome.tsx     # /practice — due overview, streak, mastery, start
│   └── Session.tsx          # /practice/session — review flow
└── index.tsx                # practiceRoutes
```

### 3.2 Shared changes

- `src/shared/app/Shell.tsx` + `.module.css` — add the bottom **tab bar** (persistent). Active tab from `useLocation().pathname` (`/` and `/chain|example|quickref` → Aprender; `/practice*` → Practicar). Practicar tab shows a due-count badge.
- `src/shared/app/router.tsx` — compose `practiceRoutes` alongside `learnRoutes` (composition root may import modules; eslint already exempts `shared/app`).
- `src/shared/content/schemas.ts` + `mapping.ts` — `CardSchema` gains `options` (`opciones → options`).
- `src/shared/domain/rationale.ts` — extend `buildRationaleMap` (§4.2).
- `scripts/integrity.ts` — re-enable card-ref validation in `findDanglingRefs` (§4.3).
- `docs/contenido-cav.yaml` — add `signos_vitales` / `niveles_evacuacion` rationale to `temas_clinicos` if no canonical text exists (§4.2).

### 3.3 Layer rules

`practice` imports only from `shared/*` (never from `learn`); the rationale is shared via `shared/domain/rationale`. Within the module: `content → domain → ui → routes`. The same eslint layer config that governs `learn` applies (the `shared/{content,domain,ui}` import ban already excludes `shared/app`).

## 4. Data

### 4.1 Card schema

The cards exist (`tarjetas`): `{ id, tema, tipo (ordenar|escribir|cloze|elegir), prompt, respuesta: string[], racional_ref, opciones?: string[] }`. The MVP `CardSchema` already validates id/topic/type/prompt/answer/rationaleRef with `.passthrough()`. Add explicit `options`:
- `CardSchema`: `options: z.array(z.string()).optional()`.
- `mapCard`: add `...(c.opciones ? { options: c.opciones } : {})`.

`elegir` cards require `options`; a build check asserts every `elegir` card has a non-empty `options` (≥2). **It does NOT gate the distractor count** — see the R2.1 relaxation in §10.

### 4.2 Rationale-map extension (closes the deferred guard)

Today ~5 distinct card `rationaleRef`s do not resolve in `buildRationaleMap` (keyed by acronym id, English phase id, clinicalTopic id): `primaria`, `escena`, `secundaria` (Spanish phase names), `signos_vitales`, `niveles_evacuacion`. Resolution:

- **Spanish phase aliases:** in `buildRationaleMap` (in `src/shared/domain/rationale.ts` — NOT `mapping.ts`, to avoid a circular import and keep it pure domain), add a `const PHASE_ALIAS: Record<string,string> = { escena:'scene', primaria:'primary', secundaria:'secondary', evacuacion:'evacuation' }` and, for each chain phase, also register the Spanish-alias key pointing at the same rationale (`m.set(spanishAlias, phase.rationale)`).
- **`signos_vitales` / `niveles_evacuacion`:** these have no single canonical rationale string today (`temas_clinicos` currently holds only `termica`/`shock`/`empaque`). Author two `clinicalTopics` rows in `docs/contenido-cav.yaml` `temas_clinicos` (data-as-content; `buildRationaleMap` already indexes `clinicalTopics` by id). Ship the **actual text**, not a placeholder:
  - `id: signos_vitales` — `racional: "Los signos vitales (FR, FC, presión, temperatura, piel, relleno capilar) son la línea de base para seguir la evolución; se reevalúan periódicamente (estable cada 15-20 min, inestable cada 5 min)."`
  - `id: niveles_evacuacion` — `racional: "La gravedad define la conducta: CRÍTICO (amenaza inmediata para la vida → evacuar lo antes posible), GRAVE (puede volverse crítico → se recomienda evacuar), LEVE (sin amenaza → se puede analizar continuar en el terreno)."`

After this, **all 42 card refs resolve.** A unit test asserts `loadContent().cards.every(c => getRationale(c.rationaleRef, buildRationaleMap(content)) !== undefined)`. Note: adding `signos_vitales`/`niveles_evacuacion` as clinicalTopic ids must not collide with any existing id (the concept-id uniqueness guard will catch a collision at build).

### 4.3 Card-ref build guard

`scripts/integrity.ts` `findDanglingRefs` currently skips `cards` (deferred to M2). Re-add `for (const card of c.cards ?? []) check(card.rationaleRef)`. **Critically**, the guard's known-id set (`collectConceptIds`) must also include the Spanish phase aliases (`escena/primaria/secundaria/evacuacion`) so legitimate card refs are not falsely flagged — mirror the `PHASE_ALIAS` from §4.2 in `collectConceptIds` (push both `p.phase` and its Spanish alias). The integrity test reverses the MVP "deferred" test: a card ref absent from all sources now yields a dangling finding; the real content yields zero.

### 4.4 Concept → Module-1 link (`conceptLinks.ts`)

`FeedbackPanel`'s "Ver en Aprender" needs a route per `rationaleRef`. A `CONCEPT_TO_NODE: Record<string, string>` maps each ref to a representative Module-1 path (node ids per the real `chainModel`), e.g. `habcde → /chain/primary-habcde-h`, `avdn → /chain/secondary-avdn`, `shock → /chain/secondary-vital-signs`, `signos_vitales → /chain/secondary-vital-signs`, `escena/primaria → /chain/scene-safety`, `secundaria → /chain/secondary-vital-signs`, `niveles_evacuacion → /chain/evacuation-decision`, `tev → /chain/scene-impression`, `muestra → /chain/secondary-muestra`, `dias → /chain/secondary-dias`, `pilar → /chain/secondary-pilar`, `mdd/msc → /chain/scene-mechanism` / nearest node. Unmapped refs fall back to `/`. `linkForRef(ref): string`. A test asserts every distinct card `rationaleRef` maps to a node id that the real `buildChainModel` produces (or to `/`).

## 5. SRS, session, persistence

### 5.1 Leitner (`domain/srs.ts`)

```ts
export interface CardState { box: number; due: string; lastResult?: 'correct' | 'wrong' }
export const INTERVALS = [1, 2, 4, 8, 16] // days, box 1..5

export function schedule(state: CardState | undefined, result: 'correct' | 'wrong', today: string): CardState
// correct: box = min(5, (state?.box ?? 1) + 1); due = today + INTERVALS[box-1]
// wrong:   box = 1; due = today + 1
// new (no state): treated as box 1 due today; first attempt schedules it
```
Pure; `today` injected (ISO `YYYY-MM-DD`). A small date helper `addDays(iso, n)` (pure) lives here or in a tiny `dates.ts`.

### 5.2 Session builder (`domain/session.ts`)

```ts
export function buildSession(
  cards: Card[],
  states: Record<string, CardState>,
  today: string,
  opts?: { cap?: number; maxNew?: number },
): Card[]
```
- `due` = cards with no state, or `state.due <= today`.
- Order: overdue first (oldest `due`), then up to `maxNew` new cards.
- **Interleave by topic**: greedy reorder so two adjacent cards rarely share a topic.
- Cap at `opts.cap ?? 14`.
- Pure (no clock, no storage).

### 5.3 Storage (`shared/domain/storage`, existing wrapper)

Keys (namespaced):
- `srs:card:<cardId>` → `CardState`
- `streak:current` → `number`, `streak:lastDay` → ISO date
- Mastery is **derived** at runtime from `srs:card:*`, not persisted.

A thin `practice/domain/store.ts` (or reuse `getStorage()` directly) reads/writes these via the async KV wrapper (IndexedDB + in-memory fallback). Migration: bump `CURRENT_VERSION` if needed; v1 of M2 adds keys, no transform.

### 5.4 Streak (`domain/streak.ts`)

```ts
export function updateStreak(s: { current: number; lastDay?: string }, today: string): { current: number; lastDay: string }
// lastDay === today → unchanged; === yesterday → current+1; else → current=1; lastDay=today
```
Called once when a session is completed (or first card answered that day — implementation picks; default: on session completion). Pure.

### 5.5 Mastery (`domain/mastery.ts`)

`masteryByTopic(cards, states): Array<{ topic: string; pct: number; count: number }>` — pct = cards of the topic with `box >= 4` over the topic's total. Pure; derived.

## 6. Grading (`domain/grading.ts`)

```ts
export function grade(card: Card, userAnswer: UserAnswer): { correct: boolean; correctText: string }
```
- `normalize(s)`: lowercase, strip diacritics, strip punctuation, collapse whitespace, trim.
- **escribir** (`userAnswer: string`): correct if `normalize(input)` equals any `normalize(answer)`, OR (for a multi-word answer) `input` contains all tokens of some answer. `correctText` = first answer.
- **ordenar** (`userAnswer: string[]`): array equals `card.answer`. `correctText` = `answer.join(' → ')`.
- **cloze** (`userAnswer: string[]`): `parseCloze(prompt)` yields N blanks; correct if every `normalize(userAnswer[i])` equals `normalize(answer[i])`. `correctText` = `answer.join(', ')`.
- **elegir** (`userAnswer: string`): equals `card.answer[0]`. `correctText` = `answer[0]`.

`UserAnswer = string | string[]`. `parseCloze(prompt)` (`domain/cloze.ts`) returns `{ segments: string[]; blanks: number }` for rendering text + inputs.

## 7. UI

- **Tab bar** (`shared/app/Shell`): three tabs; Escenarios disabled ("Próximamente"); Practicar shows due-count badge; ≥44px targets; active from path.
- **PracticeHome** (`/practice`): "Repaso de hoy" with due count, **Empezar sesión** button, 🔥 streak, `MasteryBars`. If 0 due → "Al día ✓" + optional free practice entry.
- **Session** (`/practice/session`) → `SessionRunner`: builds the interleaved queue, renders each card's type component inside `CardShell`, "Comprobar" → `FeedbackPanel` (✓/✗, your answer, correct answer if wrong, "Por qué" rationale, "Ver en Aprender" link, Leitner box movement) → "Continuar". Persists each result via `schedule` + storage. At end → results (correct / to-review, streak, mastery, "Volver").
- **Card components:** `OrderCard` (reorder — drag on desktop, ↑↓/tap-swap on mobile, keyboard-accessible), `WriteCard` (input, 16px to avoid iOS zoom), `ClozeCard` (input per blank from `parseCloze`), `ChoiceCard` (option buttons). All use `CardShell` + Field-Manual tokens.
- Reuses `shared/ui` (`Card`, `Chip`, `Section`, tokens). New components are small and module-local.

## 8. Testing

| Layer | Cases |
|---|---|
| `domain/srs` | correct → +1 box & interval; wrong → box1; cap at box 5; new card; `addDays` |
| `domain/session` | due-first; new cards added; interleave avoids same-topic adjacency; cap respected; today injected |
| `domain/grading` | escribir (normalize, multi-token, accent/punct); ordenar (exact); cloze (per-blank, all-correct); elegir |
| `domain/cloze` | parse `{{...}}` → segments + blank count; multiple blanks |
| `domain/streak` | consecutive +1; same-day no-op; gap reset |
| `domain/mastery` | pct by topic; box≥4 threshold; empty topic |
| `content/selectors` | getDueCards; byTopic; allTopics |
| `shared/content` | CardSchema `options`; mapCard `opciones→options` |
| `shared/domain/rationale` | every card ref resolves (incl. aliases + new topics) |
| `scripts/integrity` | dangling card ref now fails the build |
| `ui` | each card component (answer + Comprobar); FeedbackPanel (rationale + link + box); tab bar (active + badge); PracticeHome (due + mastery); ClozeCard renders N inputs |
| fixture | cards of all 4 types + a couple of `CardState`s |

Gates (raw binaries): `vitest run`, both `tsc`, `eslint --max-warnings 0`, `tsx scripts/build-content.ts --check`, `vite build`.

## 9. Build order

1. Card schema `options` + mapper; rationale-map aliases + `signos_vitales`/`niveles_evacuacion` topics; re-enable card-ref guard (+ tests).
2. Storage keys/helpers for SRS + streak (+ tests).
3. `srs` (Leitner) + `session` builder + `streak` + `mastery` (+ tests).
4. `grading` + `cloze` parser (+ tests).
5. Card UI components (Order/Write/Cloze/Choice) + `CardShell` (+ tests).
6. `FeedbackPanel` + `conceptLinks` (+ tests).
7. `SessionRunner` + `Session` route + `PracticeHome` + `MasteryBars` (+ tests).
8. Tab bar in `Shell` + router wiring (+ tests).
9. Verify gates + visual check (tab nav, a session of each card type, feedback, results/mastery offline).

## 10. Open questions / explicit non-decisions

- `maxNew` per session and exact `cap` are tunable at implementation (default cap 14, maxNew ~4).
- Streak increment trigger (session completion vs first answer of day) defaults to **session completion**.
- If authoring `signos_vitales`/`niveles_evacuacion` rationale proves redundant with existing text, the implementer may instead repoint those two card refs — default is to author the two topics (§4.2).
- `OrderCard` interaction (full drag-and-drop vs ↑↓ buttons) — both supported; ↑↓/tap-swap is the accessible baseline, drag is enhancement.
- **R2.1 distractor count (relaxation):** PRD R2.1 asks `elegir` to carry ≥5 distractors. The 5 existing `elegir` cards have only 3-4 options total (verified: `t-no-comer` 3; `t-reeval`/`t-examen-orden`/`t-evac-critico`/`t-posicion-columna` 4). **v1 renders the existing options and does NOT gate on distractor count** (gating would fail all five). Enriching each `elegir` card to ≥5 distractors is deferred **content-debt** (a YAML authoring task, clinically reviewed) — flagged, not blocking. The build only asserts `options` is present (≥2) for `elegir` cards.
