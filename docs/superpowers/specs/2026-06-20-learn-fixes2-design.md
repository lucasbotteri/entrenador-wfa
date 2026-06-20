# Design Spec — Módulo Aprender Fixes (ronda 2, P1-P6)

> Date: 2026-06-20
> Status: Approved for implementation planning
> Source: `docs/Fixes 2 - Modulo Aprender.md` (P1-P6)
> Builds on: the shipped MVP + Module 1 (+ round-1 fixes) + M2/M3.

## 1. Scope

Second round of Module-1 "Aprender" improvements. The clinical content for P3/P4 is already applied in `docs/contenido-cav.yaml` (v0.4, uncommitted). Six fixes:

- **P1** — Show the pre-primary safety branch as a first "Antes de empezar" node in the Primaria phase (RCP/DEA if not breathing; presentation/consent if conscious). Data exists; not rendered.
- **P2** — "Fase 0" → "Eslabón N+1" (number phases from 1, fitting the *Cadena* metaphor).
- **P3** — Per-letter HABCDE rationale (`porque` per `letra`, already in v0.4): show each letter's own "why this, in this order", not the generic HABCDE rationale.
- **P4** — TEV + buscar-ayuda expanded (v0.4 content flows via `content:build`): verify the impression node shows the richer TEV components and the bridge node shows the 3-level help text. No code change beyond verification.
- **P5** — Ephemeral micro-recovery in learn: the "Por qué" block starts hidden behind a tap-to-reveal recall prompt. No scoring, no persistence (the module boundary: Practicar owns SRS).
- **P6** — Improved worked example: full scene (4 parts) before H + an interactive self-explanation pause ("¿Qué observarías antes de tocar?").

**Conventions:** code/identifiers/files English; user-facing text + `.yaml` content Spanish. TDD; raw-binary gates; build fails on bad content. After YAML edits: `npm run content:build`. Work on `main` (user consent).

**Module boundary (key for P5/P6):** learn = ephemeral, no-score recall (tap-to-reveal). Practicar = SRS with scoring/scheduling (the single source of mastery). Escenarios = situational judgement. P5/P6 must NOT persist state or build a second SRS.

**Non-goals:** no scoring/persistence in learn; `buscar_ayuda` NOT split into 3 sub-points (the text already enumerates them); no M2/M3 changes; no global "recall mode" toggle in v1 (tap-to-reveal is always on).

## 2. Decisions (locked during brainstorming)

| Topic | Decision |
|---|---|
| Scope | All P1-P6 in one spec/plan. |
| P5 shape | Tap-to-reveal per node; hide ONLY the "Por qué" (Significado/Detalle stay visible); ephemeral (local state, re-hides on remount); no scoring. |
| P1 render | A first "Antes de empezar" node in the Primaria phase (not a phase banner). |
| P6 | Full scene (4 parts) added to `worked_example` + an interactive pause before the first clinical beat. |

## 3. Content (`docs/contenido-cav.yaml`)

v0.4 already applies (uncommitted): `porque` on each of the 6 HABCDE `letras`, TEV `componentes` expanded (respiración/circulación/sistema neurológico with observable signs), `buscar_ayuda` expanded to 3 levels. Verified it parses; the letra mapper is explicit so the inert `porque` does not break the build.

**P6 content change** — in the `worked_example` block, replace the single `escena` step with the 4 scene parts (as ordered steps), keep the existing clinical steps, and add a root-level `pausa` sibling to `steps`. Concrete YAML (each `racional_ref` resolves: `scene`→phase, `mdd`/`tev`→acronym ids):
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
    # then the existing clinical steps (unchanged), in order:
    - {fase: "primaria", estado: "No responde, respira; sangrado pulsátil en el muslo; casco puesto.", accion: "H: controlás la hemorragia masiva con presión directa antes que nada.", racional_ref: "habcde"}
    - {fase: "primaria", estado: "Hemorragia controlada; hay mecanismo de trauma.", accion: "A: abrís la vía aérea con subluxación mandibular (control cervical).", racional_ref: "habcde"}
    - {fase: "secundaria", estado: "Consciente pero alterado; pálido, frío y húmedo; dolor abdominal.", accion: "Reconocés el shock por la piel y tomás signos vitales de base.", racional_ref: "shock"}
    - {fase: "evacuacion", estado: "Shock con sospecha de sangrado interno, zona remota a 2 h.", accion: "Decidís evacuación CRÍTICA: el sangrado interno no se resuelve en el terreno.", racional_ref: "shock"}
```
Mapped to `pause: { question, reveal }` (§4). The 4 scene steps are the first beats; the clinical steps follow unchanged.

## 4. Schema + mapper

- **`AcronymLetterSchema`** (`schemas.ts`): add `rationale: z.string().optional()`. NOTE: the schema validates the **mapped (anglicized) output**, not the raw YAML — so the field is `rationale` (the mapper anglicizes `porque → rationale`), not `porque`. `AcronymLetter` (a `z.infer`) gains `rationale?: string` automatically.
- **`mapAcronym`** (`mapping.ts`): in the `letras` map, anglicize `porque → rationale`: `...(l.porque ? { rationale: l.porque } : {})`. (This `rationale` is a field of the letter, distinct from the acronym-level `rationale`.)
- **`WorkedExampleSchema`** (`schemas.ts`): add `pause: z.object({ question: z.string().min(1), reveal: z.string().min(1) }).optional()`.
- **`mapWorkedExample`** (`mapping.ts`): add `...(w.pausa ? { pause: { question: w.pausa.pregunta, reveal: w.pausa.revela } } : {})`.

## 5. chainModel (`src/modules/learn/domain/chainModel.ts`)

`ChainNode` gains `whyText?: string` (a node's own "Por qué", overriding the rationale-map lookup).

**P3 — per-letter rationale.** In `primaryNodes`, each letter node sets `whyText: l.rationale` (the `porque`) when present, instead of relying solely on `rationaleId: habcde.id`. Keep `rationaleId: 'habcde'` as a fallback (so a letter without `porque` still resolves). The node's "Por qué" prefers `whyText`.

**P1 — "Antes de empezar" node.** In `primaryNodes`, PREPEND a node (before the HABCDE letters):
```ts
{
  id: 'primary-before',
  phase: 'primary',
  title: 'Antes de empezar',
  kind: 'topic',
  items: [
    { label: 'Si no responde y no respira', detail: <content.previo> },
    { label: 'Si está consciente', detail: <content.presentacion> },
  ],
  rationaleId: 'primary',
}
```
Read `previo`/`presentacion` from the primary phase's `content` (loose record; tolerant access). The node has no `letter`/`order` (renders with no badge or a neutral marker — it's not numbered in the HABCDE sequence).

`primaryNodes` returns `[beforeNode, ...letterNodes]` so the new node lands first. **Invariant:** `ChainPhase.nodes` render in builder-output array order (PhaseTimeline maps them directly; there is no secondary sort) — so prepending is sufficient to place it before H. The §7 test asserts `nodes[0].id === 'primary-before'` to guard against a future sort regression. The node carries no `order`, so any nav helper (findPrevNext / selectors) that keys off array position keeps working; one that keys off `order` must tolerate its absence (already optional on `ChainNode`).

## 6. UI

- **P2 — `PhaseTimeline.tsx`:** `Fase {index}` → `Eslabón {index + 1}`. The NodeDetail breadcrumb (which references the phase) follows the same numbering where it shows a phase label.
- **P5 — `NodeDetail.tsx` + `RecallPrompt.tsx` (new):**
  - The "Por qué" `Section` is gated by local `const [revealed, setRevealed] = useState(false)`. When not revealed, render `<RecallPrompt onReveal={() => setRevealed(true)} />` (a dashed button: "¿Por qué? — pensalo, después tocá"). When revealed, render the rationale (`node.whyText ?? getRationale(node.rationaleId, map)`).
  - Ephemeral: the state is component-local and resets on remount (navigating away and back re-hides). No storage.
  - `RecallPrompt` is a small accessible button (`role="button"`, aria-label) reusable by P6.
  - Only the "Por qué" is hidden; the node's `items` (Significado/Detalle) stay visible.
- **P6 — `WorkedExample.tsx`:** render the scene steps as beats; before the first non-`scene` step, render a `PauseCard` (reusing the `RecallPrompt` tap-to-reveal pattern) showing `worked_example.pause.question`, revealing `pause.reveal` on tap. The clinical beats then render with their per-step rationale (resolved via the rationale map as today). If `pause` is absent, no pause card.

## 7. Testing
| Layer | Cases |
|---|---|
| `schemas` | `AcronymLetterSchema` accepts `porque`; `WorkedExampleSchema` accepts `pause` |
| `mapping` | letra `porque → rationale`; worked_example `pausa → pause {question, reveal}` |
| `chainModel` | `primary-before` node present (previo/presentacion items); each letter node has `whyText` = its `porque` (not the generic HABCDE rationale) |
| `PhaseTimeline` | renders "Eslabón 1" for index 0 (not "Fase 0") |
| `NodeDetail` | "Por qué" hidden by default (RecallPrompt shown); after reveal, shows the node's `whyText`; Significado/Detalle always visible |
| `RecallPrompt` | renders the prompt + calls `onReveal` on click; has an aria-label |
| `WorkedExample` | renders the 4 scene steps; PauseCard shows the question and reveals on tap before the first clinical beat |
| fixture | add `porque` to a fixture HABCDE letter; add `pause` + scene steps to the worked_example fixture |

Gates (raw binaries): `vitest run`, both `tsc`, `eslint --max-warnings 0`, `tsx scripts/build-content.ts --check`, `vite build`.

## 8. Build order
1. Schema (`porque`, `pause`) + mapper + types (+ tests). Commit v0.4 YAML.
2. P6 content: expand `worked_example` (4 scene steps + `pausa`) in YAML; rebuild.
3. chainModel: per-letter `whyText` (P3) + `primary-before` node (P1) (+ tests).
4. PhaseTimeline "Eslabón" (P2) (+ test).
5. `RecallPrompt` + NodeDetail tap-to-reveal "Por qué" using `whyText` (P5) (+ tests).
6. WorkedExample scene steps + PauseCard (P6) (+ tests).
7. Verify gates + visual check (P4 TEV/help render; P1 node; Eslabón; per-letter why; tap-to-reveal; worked example pause).

## 9. Open questions / explicit non-decisions
- The "Antes de empezar" node renders with no letter badge; whether it gets a small neutral icon (e.g. an info/branch icon) is an implementation-time cosmetic choice (default: no icon, like other topic nodes).
- The `pause.reveal` text is authored content (the TEV impression for this case); the implementer writes a faithful one-liner if the exact string needs composing.
- The crumb "Eslabón N" mirrors the phase index where NodeDetail shows a phase label; if NodeDetail currently shows only "CADENA / <title>", the Eslabón change is limited to `PhaseTimeline`.
