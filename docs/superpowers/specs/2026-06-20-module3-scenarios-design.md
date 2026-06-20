# Design Spec — Módulo 3 "Escenarios" (Modo B · banco de acciones)

> Date: 2026-06-20
> Status: Approved for implementation planning
> Source: `docs/PRD - Entrenador WFA.md` §8 (R3.1-R3.8), `docs/Motor de Escenarios - Diseño.md`, `docs/casos.yaml`
> Builds on: the shipped MVP + Module 1 (rationale/conceptLinks) + Module 2 (storage, tab bar).

## 1. Scope

Module 3 "Escenarios" v1 = **Mode B (banco de acciones)** over the **2 existing cases** in `docs/casos.yaml` (trauma "descenso-bloques" + ambiental "hipotermia-vivac"). The player works one case through its 4 phases, picking actions from a mixed bank (key actions + plausible distractors), with progressive disclosure and a key-feature debrief at the end.

**In scope (R3.1 mode B, R3.2-R3.6, R3.8):**
- Action bank per phase: key actions + distractors mixed, no visual "which is correct" hint.
- Tap-to-act, one at a time; **progressive disclosure** (`reveals` change the visible state as you act); activating a distractor gives **immediate teaching feedback** (`whyNot` + type); **no undo** (R3.8 no retries within a run — replay the whole case from scratch).
- **Strict order** in the primary phase (HABCDE): out-of-order criticals penalize; **skipping H with massive hemorrhage = critical failure** (R3.3). Order from the `order` field; case 2's primary is `strictOrder: false` (focus on E).
- **Evacuation decision** (CRÍTICO/GRAVE/LEVE) with feedback.
- **Key-feature scoring** → a **debrief** (the primary output, not a number): ✅ did / ⚠️ missed / ❌ dangerous / 🧭 priorities / 🏁 evacuation, plus a dry summary line; each item links to the Module-1 rationale via its `concept`. Tone: demanding on the standard, respectful of the person.
- **Escenarios tab** enabled in the bottom tab bar.

**Out of scope / non-goals:** Mode A (recordar-primero) and Mode C (detectar-el-error) — deferred to future specs over the same engine/data. No timer in v1 (R3.8's "time only in primary" deferred). No LLM. No free-text. No new clinical content (the 2 cases exist).

**Conventions:** code/identifiers/files English; user-facing text + `.yaml` content Spanish. TDD; raw-binary gates; build fails on bad content. After YAML edits: `npm run content:build`. Work on `main` (user consent).

## 2. Decisions (locked during brainstorming)

| Topic | Decision |
|---|---|
| Modes | **Mode B + 2 cases**; A/C deferred. |
| Acting | **Tap one at a time**, progressive reveal, immediate distractor feedback, **no undo**. |
| Order (primary) | **Strict**: out-of-order criticals penalize; skipping H with hemorrhage = critical failure; order from `order`. Case 2 primary flexible. |
| Timer | **None in v1.** |
| Debrief | Key-feature sections (✅/⚠️/❌/🧭/🏁) + dry summary; links to M1 via `concept`. "Reintentar el caso" replays from scratch. |
| conceptLinks | **Promote** `practice/domain/conceptLinks.ts` → `shared/domain/conceptLinks.ts` (M2 + M3 share it). |

## 3. Architecture

```
src/modules/scenarios/
├── content/
│   └── selectors.ts        # getCase(cases, id), allCases(cases)
├── domain/
│   ├── engine.ts           # RunState, startRun, act, canAdvance, advance, decide
│   ├── scoring.ts          # key-feature tally from a run
│   └── debrief.ts          # buildDebrief(case, run) → debrief sections
├── ui/
│   ├── PhaseStepper.tsx
│   ├── ActionBank.tsx      # the tappable mixed bank
│   ├── ActionCard.tsx
│   ├── DistractorFeedback.tsx
│   ├── RevealCard.tsx
│   ├── DidTrail.tsx        # "Hiciste" ordered list
│   ├── EvacuationDecision.tsx
│   └── Debrief.tsx
│   └── *.module.css
├── routes/
│   ├── ScenariosHome.tsx   # /scenarios — case list
│   └── Play.tsx            # /scenarios/:caseId — run + debrief
└── index.tsx               # scenariosRoutes
```

### Shared changes
- **`src/shared/domain/conceptLinks.ts`** — move the existing `CONCEPT_TO_NODE` + `linkForRef` here from `practice/domain`; delete `practice/domain/conceptLinks.ts`. **Grep the whole repo for the old path** (`@/modules/practice/domain/conceptLinks`) and update every importer. Confirmed importers today: `src/modules/practice/ui/FeedbackPanel.tsx`, `tests/modules/practice/concept-links.test.ts`, AND `tests/modules/practice/feedback.test.tsx` — all three must point at `@/shared/domain/conceptLinks`. Re-run the practice + moved tests to confirm green.
- **`src/shared/content/schemas.ts` + `mapping.ts`** — full `CaseSchema` + expanded `mapCase` (§4).
- **`scripts/build-content.ts` / `integrity.ts`** — a guard that every case action/distractor `concept` resolves in the rationale map.
- **`src/shared/app/Shell.tsx`** — enable the Escenarios tab (`Link` to `/scenarios`); add its active-match.
- **`src/shared/app/router.tsx`** — compose `scenariosRoutes`.

### Layer rules
`scenarios` imports only `@/shared/*` (never `learn`/`practice`). `content → domain → ui → routes` within. The composition root (`shared/app`) wires all modules.

## 4. Data: CaseSchema + mapper

`casos.yaml` is today validated by a minimal `CaseSchema` (`{id, title}.passthrough()`) and `mapCase` only does `titulo→title`. Replace with a full typed model (anglicized keys, consistent with the content pipeline).

### 4.1 Schema (zod, `schemas.ts`)
```ts
const ScenarioPhaseId = z.enum(['scene', 'primary', 'secondary', 'evacuation'])

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
const ScenarioPhaseSchema = z.object({
  id: ScenarioPhaseId,
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

### 4.2 Mapper (`mapCase`, full es→en)
Phase `id`: `escena→scene`, `primaria→primary`, `secundaria→secondary`, `evacuacion→evacuation`. Field map: `titulo→title`, `contexto→context`, `conceptos→concepts`, `fases→phases`, `estado→state`, `orden_estricto→strictOrder`, `acciones_clave→keyActions`, `texto→text`, `critico→critical`, `concepto→concept`, `racional→rationale`, `orden→order`, `distractores→distractors`, `tipo→type`, `por_que_no→whyNot`, `revelaciones→reveals` (`si_hace→ifDone`, `revela→text`), `transicion→transition`, `decision` (`correcta→correct`, `opciones→options`, `nivel→level`, `fb→feedback`), `debrief_modelo→modelDebrief`. The case-level `meta` of `casos.yaml` is ignored.

### 4.3 Integrity
A build guard `findCaseConceptDangling(content, cases)` collects every `concept` from case key-actions + distractors and checks each resolves in the concept-id set (the rationale-map keys incl. M2's Spanish aliases). Verified: all case concepts (`escena/habcde/mdd/tev/secundaria/shock/avdn/muestra/dias/pilar/evacuacion/termica/empaque`) resolve today. Build fails on a dangling case concept. `cases.json` becomes fully typed.

## 5. Engine (`domain/engine.ts`) — pure state machine

```ts
export interface ActionRecord {
  id: string
  kind: 'key' | 'distractor'
  critical: boolean        // false for distractors
  correct: boolean         // key in-order = true; distractor = false; out-of-order key = false
  outOfOrder?: boolean     // strict primary, acted before a lower-order critical
  skippedCritical?: boolean // a higher-order critical acted while a critical (e.g. H) is still undone
}
export interface RunState {
  caseId: string
  phaseIndex: number
  log: ActionRecord[]
  revealedTexts: string[]  // reveal texts accumulated this run
  decision?: string        // chosen evacuation level
}
export function startRun(caseId: string): RunState
export function act(c: Case, run: RunState, actionId: string): { run: RunState; feedback?: { type: string; whyNot: string } }
export function canAdvance(c: Case, run: RunState): boolean   // all critical key actions of current phase logged
export function advance(run: RunState): RunState              // phaseIndex + 1
export function decide(run: RunState, level: string): RunState
export function currentPhase(c: Case, run: RunState): ScenarioPhase
export function remainingBank(c: Case, run: RunState): Array<KeyAction | Distractor> // bank minus already-acted, deterministic order by id
```

**`act` logic:**
- Resolve `actionId` to a key action or distractor of the **current phase**. (Ignore ids not in the current phase.)
- **Key action:** record `kind:'key', critical`. In a `strictOrder` phase, if the action has an `order` and any lower-`order` **critical** key action is not yet logged → `correct:false, outOfOrder:true`; the special case where H (the lowest-order critical) is still undone while acting on another critical → `skippedCritical:true`. Otherwise `correct:true`.
- **Distractor:** record `kind:'distractor', critical:false, correct:false`; return `feedback: { type, whyNot }`.
- After recording, fire any `reveals` whose `ifDone === actionId` → append `reveal.text` to `revealedTexts` (dedup).
- Acting twice on the same id is a no-op (already logged).

**`canAdvance`:** every `critical:true` key action of the current phase is present in `log`. (Non-critical key actions are optional.) The evacuation phase advances via `decide` instead (it may also have key actions, e.g. case 2 — those still gate `canAdvance` before the decision is offered).

Pure: no clock, no storage, deterministic. `remainingBank` returns the mixed bank (key + distractors) minus logged ids, sorted by `id` (stable, non-criticality-revealing).

### 5.1 Engine & scoring rules (explicit, to avoid divergent implementations)
- **`outOfOrder`** is set ONLY on a critical key action acted before a lower-`order` critical key action is logged (a critical-priority violation). Non-critical key actions carry no `order`; they are always logged `correct: true` and never block or penalize.
- **`skippedCritical`** is the specific case where the lowest-`order` critical (H) is still undone while acting on another critical in a `strictOrder` phase. It implies `outOfOrder: true` and, for scoring, counts as a **missed critical** (the run did not control hemorrhage first) AND forces `prioritiesOk = false`.
- **`canAdvance`** gates on all `critical: true` key actions of the current phase being logged (regardless of correct/outOfOrder — they were done; order quality is scored, not gating). For an evacuation phase that ALSO has key actions (case 2), `canAdvance` gates those key actions; once true, `EvacuationDecision` is offered and the chosen `decide(level)` ends the run. A decision-only evacuation phase (case 1) offers the decision immediately.
- **`scoreRun`** derivation: `criticalDone` = count of critical key actions logged with `correct: true` (in-order); `criticalTotal` = count of all critical key actions across phases; `dangerous` = count of distractor logs; `prioritiesOk` = no `outOfOrder`/`skippedCritical` flag anywhere in the log.
- **Debrief sections derive from walking the run log + case**, NOT from the `scoreRun` numbers: `did` = critical/key actions logged correct; `missed` = critical key actions absent from the log; `dangerous` = distractor logs (with `whyNot`/`type`); `priorities` = `prioritiesOk` + an explicit message when `skippedCritical`; `evacuation` = `run.decision` vs `decision.correct` + the chosen option's `feedback`.

## 6. Scoring + debrief

### 6.1 Scoring (`domain/scoring.ts`)
`scoreRun(c, run)` walks the case + log and produces:
```ts
interface RunScore {
  criticalDone: number      // critical key actions done in-order (correct)
  criticalTotal: number     // total critical key actions across phases
  dangerous: number         // distractors activated
  prioritiesOk: boolean     // no outOfOrder / skippedCritical in any strict phase
}
```

### 6.2 Debrief builder (`domain/debrief.ts`)
`buildDebrief(c, run)` → the screen model:
```ts
interface DebriefItem { text: string; concept: string; link: string } // link = linkForRef(concept)
interface Debrief {
  summary: RunScore
  did: DebriefItem[]        // critical/key actions done correctly (use action.text + its rationale)
  missed: DebriefItem[]     // critical key actions NOT in the log
  dangerous: DebriefItem[]  // distractors activated (action.text + whyNot)
  priorities: { ok: boolean; text: string }  // order respected in strict phases
  evacuation?: { chosen?: string; correct: string; ok: boolean; feedback: string }
}
```
Items resolve `link` via the shared `linkForRef(concept)`. The ❌ dangerous items show the standard (the distractor's `whyNot`). 🧭 priorities reflects strict-order adherence (and flags `skippedCritical` explicitly). 🏁 evacuation compares `run.decision` to the phase `decision.correct` and shows the chosen option's `feedback`. The `did` section is derived from the actual run (the case's `modelDebrief` is available as reference copy but the shown items come from what the player did).

## 7. Persistence (light, `domain/store.ts`)
On reaching the debrief, save `scenarios:progress` → `Record<caseId, { criticalDone, criticalTotal, dangerous, completedAt: string }>` via the existing KV wrapper. `ScenariosHome` reads it to show a "completado" badge + last summary on each case card. Storage key added to `KEYS`. No other persistence in v1.

## 8. UI
- **Escenarios tab** in `Shell` becomes a `Link` to `/scenarios` (was a disabled span). Implementation note: the `TABS` array in `Shell.tsx` is currently `as const`; add `{ to: '/scenarios', label: 'Escenarios', match: (p: string) => p.startsWith('/scenarios') }` and replace the disabled `<span>` with the mapped `Link` (widen/drop `as const` as needed so the third tab is a real route). `router.tsx` spreads `scenariosRoutes` BEFORE the `{ path: '*' }` catch-all. A `Shell.test.tsx` assertion confirms the Escenarios link is active on `/scenarios`.
- **ScenariosHome (`/scenarios`):** a card per case (title, tag, context preview, completed badge if any). Tap → `/scenarios/:caseId`.
- **Play (`/scenarios/:caseId`):** drives the engine.
  - `PhaseStepper` (4 phases) + the current phase label (primary shows "ORDEN ESTRICTO").
  - State block = phase `state` + accumulated `revealedTexts` (`RevealCard`s, dark-green).
  - `DidTrail` = logged actions in order (✓ green key / ✗ burgundy distractor / out-of-order flagged).
  - `DistractorFeedback` inline when the last act was a distractor (type tag + whyNot).
  - `ActionBank` = `remainingBank` as tappable `ActionCard`s (no criticality hint). Tap → `act`.
  - "Continuar" enabled when `canAdvance`; on the evacuation phase, once key actions (if any) are done, render `EvacuationDecision` (the 3 levels → `decide` → option feedback) then "Ver debrief".
  - At the end → `Debrief`.
- **Debrief:** dry summary line + the five sections (each item links "Ver … en Aprender") + "Reintentar el caso" (resets the run via `startRun`) + "Volver a Escenarios".
- Reuses `shared/ui` tokens (Field Manual). New components are small, module-local.

## 9. Testing
| Layer | Cases |
|---|---|
| `content/schemas` (CaseSchema) | parses both real cases; rejects a malformed phase |
| `content/mapping` (mapCase) | es→en for nested keys; phase-id enum; reveals/decision shape |
| `scripts/integrity` | a dangling case `concept` fails the build; real cases pass |
| `engine.act` | key in-order → correct; distractor → feedback + correct:false; reveal fires on `ifDone`; act-twice no-op |
| `engine` strict order | out-of-order critical → outOfOrder; acting later critical while H undone → skippedCritical; case-2 flexible phase no flags |
| `engine` canAdvance/advance/decide | advances only when all criticals done; decide sets decision |
| `engine.remainingBank` | bank excludes logged ids; deterministic order |
| `scoring` | criticalDone/Total, dangerous count, prioritiesOk |
| `debrief` | did/missed/dangerous/priorities/evacuation derived; items carry `link` |
| `ui` | ActionBank tap → log grows + bank shrinks; DistractorFeedback shows whyNot; EvacuationDecision picks; Debrief renders sections + links; ScenariosHome lists cases; Escenarios tab is a link |
| fixture | a minimal Case (2 phases incl. a strict primary + an evacuation decision) for engine/ui tests |

Gates (raw binaries): `vitest run`, both `tsc`, `eslint --max-warnings 0`, `tsx scripts/build-content.ts --check`, `vite build`.

## 10. Build order
1. `CaseSchema` + `mapCase` expansion + case-concept integrity guard (+ tests); `cases.json` typed.
2. Promote `conceptLinks` to `shared/domain` (update M2 imports + test path); confirm M2 green.
3. Engine: `startRun`/`act`/reveals/strict-order/`canAdvance`/`advance`/`decide`/`remainingBank` (+ tests).
4. Scoring + debrief builder (+ tests).
5. Scenarios store (progress) + selectors (+ tests).
6. UI: PhaseStepper, ActionCard/ActionBank, DistractorFeedback, RevealCard, DidTrail (+ tests).
7. UI: EvacuationDecision, Debrief (+ tests).
8. Play route (engine wiring) + ScenariosHome + routes (+ tests).
9. Enable Escenarios tab in Shell + router wiring (+ tests).
10. Verify gates + visual check (run both cases end-to-end: bank, reveals, distractor feedback, strict-order fail, evacuation, debrief, badges; offline).

## 11. Open questions / explicit non-decisions
- Bank ordering is deterministic by `id` (non-revealing) for v1; a shuffled presentation can come later without changing the engine.
- `modelDebrief` (the YAML ideal-pass copy) is reference only in v1; the shown ✅ items derive from the actual run.
- The evacuation phase of case 2 has both `keyActions` and a `decision` — `canAdvance` gates the key actions, then the decision is offered; case 1's evacuation has only a `decision`.
- "Reintentar" replays the whole case (R3.8 no in-run retries); no partial undo.
