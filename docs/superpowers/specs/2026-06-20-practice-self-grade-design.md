# Design Spec — Self-graded text cards in Practicar

> Date: 2026-06-20
> Status: Approved for implementation
> Context: Module 2 "Practicar". The text-match grading on `escribir`/`cloze` cards mis-judges valid answers. Let the learner judge their own recall instead.

## 1. Goal

For the two text-match card types (`escribir`, `cloze`), replace auto-grading with **self-assessment**: the learner writes (optional aid), taps **"Mostrar respuesta"** to reveal the expected answer, then taps **"No me acordé"** / **"Me acordé"** — that judgment is the correctness signal fed to the SRS. The objective types (`ordenar`, `elegir`) keep auto-grading (they don't mis-match).

## 2. Decisions (locked)

| Topic | Decision |
|---|---|
| Which types self-graded | `escribir` + `cloze` |
| Objective types | `ordenar` + `elegir` unchanged (auto-graded via `grade()`) |
| Interaction | Keep the input field as a writing aid; the typed text is NOT compared. Reveal expected answer → user judges. |
| SRS | The self-judgment maps to `schedule(..., correct ? 'correct' : 'wrong')` — no SRS/mastery change |
| Toggle | None — direct replacement (YAGNI) |

## 3. Components & flow

- **`CardShell`** gains an optional `footer?: ReactNode`; when provided it replaces the default "Comprobar" button. `onSubmit?` becomes optional (only used by the default footer). Objective cards keep passing `onSubmit` → unchanged behavior.
- **`SelfGradeCard`** (new, `ui/SelfGradeCard.tsx`): wraps the input area (`children`) in a `CardShell` with a custom footer. State machine:
  1. Not revealed → footer is a **"Mostrar respuesta"** button.
  2. Revealed → footer shows the expected answer (`answerText(card)`), the question "¿Te acordaste?", and two buttons **"No me acordé"** (`onResolve(false)`) / **"Me acordé"** (`onResolve(true)`).
- **`WriteCard`** / **`ClozeCard`**: render their existing input(s) inside `SelfGradeCard`; their prop changes from `onAnswer` to `onResolve(correct: boolean)`. The typed value stays local (writing aid only).
- **`SessionRunner`**: a shared `resolve(correct: boolean)` that schedules SRS + builds feedback (using `answerText(card)` for `correctText`). Branch by type:
  - `escribir` / `cloze` → render `WriteCard`/`ClozeCard` with `onResolve={resolve}`.
  - `ordenar` / `elegir` → render `OrderCard`/`ChoiceCard` with `onAnswer={ua => resolve(grade(card, ua).correct)}` (unchanged grading).
- **`FeedbackPanel`**: unchanged — shows ✓/✗ from the (self- or auto-) judgment, the correct answer when wrong, rationale, and box transition.

## 4. grading.ts

Add `answerText(card: Card): string` (the canonical display text), and have `grade()` reuse it for `correctText` (same values as today — pure refactor):
```ts
export function answerText(card: Card): string {
  switch (card.type) {
    case 'ordenar': return card.answer.join(' → ')
    case 'cloze': return card.answer.join(', ')
    default: return card.answer[0]! // escribir, elegir
  }
}
```
`grade()` keeps its existing judging logic for `ordenar`/`elegir` (still used). Its `escribir`/`cloze` branches remain but are no longer called by the runner (kept for the pure-function tests / possible reuse) — no behavior change.

## 5. Testing

| Layer | Cases |
|---|---|
| `grading` | `answerText` returns `H → A → B` (ordenar), `verbal, dolor` (cloze), `card.answer[0]` (escribir/elegir); existing `grade()` tests stay green |
| `SelfGradeCard` | renders "Mostrar respuesta"; after click reveals `answerText`; "Me acordé" → `onResolve(true)`, "No me acordé" → `onResolve(false)` |
| `WriteCard` | self-grade flow: reveal → "Me acordé" calls `onResolve(true)` (replaces the old "Comprobar"/typed-answer test) |
| `ClozeCard` | self-grade flow: inputs render; reveal → "No me acordé" calls `onResolve(false)` |
| `OrderCard` / `ChoiceCard` | unchanged (still submit via "Comprobar" → `onAnswer`) |
| `SessionRunner` | escribir card: reveal → "Me acordé" → ✓¡Bien!, finishes with `correct: 1` |

Gates (raw binaries): `tsx scripts/build-content.ts --check`, `vitest run`, both `tsc`, `eslint --max-warnings 0`, `vite build`.

## 6. Non-goals

- No change to `ordenar`/`elegir`.
- No SRS/mastery/scope changes.
- No auto/self toggle.
- The pre-existing cloze "raw prompt shown above the blanked sentence" is out of scope (untouched).

## 7. Build order

1. `grading.ts` `answerText` + tests.
2. `CardShell` optional `footer` + `SelfGradeCard` + CSS + `SelfGradeCard` test.
3. `WriteCard`/`ClozeCard` → `onResolve` (+ update their tests).
4. `SessionRunner` branch + `resolve` (+ update session-runner test).
5. Gates + visual check.
