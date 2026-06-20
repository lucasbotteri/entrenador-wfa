# Design Spec — Practice temporary scope (only Escena + Primaria + AVDN)

> Date: 2026-06-20
> Status: Approved for implementation
> Context: Module 2 "Practicar". Class hasn't covered the secondary survey / evacuation yet, so those cards are temporarily out of scope. Keep them VISIBLE but disabled.

## 1. Goal

Temporarily restrict Practicar to the concepts already seen in class — **Evaluación de la escena**, **Evaluación primaria**, and **AVDN** — while keeping the rest visible-but-disabled in the "Dominio por tema" list. The restriction is a single code constant, trivial to widen or remove as class progresses.

## 2. Decisions (locked)

| Topic | Decision |
|---|---|
| Enabled concepts | `escena`, `mdd`, `tev` (the 4 scene parts incl. bioseguridad/EPP which use concept `escena`), `habcde`, `primaria`, `avdn` |
| Disabled = | greyed in MasteryBars AND excluded from the session + due-count (not just visual) |
| Config location | a single `Set` in a new `practice/domain/scope.ts` — temporary by design, no admin UI, no persistence |

## 3. Scope module — `src/modules/practice/domain/scope.ts` (new)

```ts
import type { Card } from '@/shared/content/types'

// TEMPORARY: Practicar is limited to what class has covered — Escena + Primaria + AVDN.
// Widen or delete this set as the course advances. Keyed by Card.rationaleRef (concept id).
export const ENABLED_CONCEPTS: ReadonlySet<string> = new Set([
  'escena', 'mdd', 'tev', // Evaluación de la escena (4 partes, incl. bioseguridad/EPP → 'escena')
  'habcde', 'primaria',   // Evaluación primaria
  'avdn',                 // AVDN (explicit keep)
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

## 4. Functional disable (session + due-count)

Filter the card source to in-scope at the three call sites that feed practice:
- `src/modules/practice/routes/PracticeHome.tsx`: `getDueCards(inScopeCards(content.cards), states, today)`.
- `src/modules/practice/content/useDueCount.ts`: `getDueCards(inScopeCards(content.cards), states, today)`.
- `src/modules/practice/routes/Session.tsx`: `buildSession(inScopeCards(content.cards), states, today)`.

Result: "Empezar sesión", the SRS queue, and the tab due-badge only ever include Escena/Primaria/AVDN cards. Out-of-scope cards keep their stored SRS state untouched (no reset) — they simply aren't served.

## 5. Visual disable (MasteryBars)

`masteryByTopic` (`src/modules/practice/domain/mastery.ts`) gains an `enabled` flag per topic and sorts enabled topics first:
- `TopicMastery` gains `enabled: boolean`.
- A topic is `enabled` when it has at least one in-scope card (`isTopicInScope`). It still lists every topic (visible). Mastery `pct`/`count` continue to be computed over all the topic's cards as today (no calc change) — for disabled topics the bar is suppressed so the number isn't shown anyway.
- Stable sort: enabled topics first (in their existing first-occurrence order), then disabled, so practicable topics sit on top.

`MasteryBars` (`src/modules/practice/ui/MasteryBars.tsx`):
- Enabled topic: unchanged (name, %, bar).
- Disabled topic: greyed row, NO % and NO bar fill, with a small tag **"Aún no visto en clase"**. Still rendered (visible). Add a `.disabled` class + `.tag` in `MasteryBars.module.css`.

## 6. Testing

| Layer | Cases |
|---|---|
| `scope` | `isCardInScope` true for an `escena`/`habcde`/`avdn` card, false for a `signos_vitales`/`niveles_evacuacion` card; `inScopeCards` drops out-of-scope; `isTopicInScope` true for "Escena", false for "Signos vitales", true for mixed "Manejo" (has `habcde` cards) |
| `mastery` | `masteryByTopic` sets `enabled` (scene topic true, secondary topic false, "Manejo" mixed true); enabled topics sorted first |
| due/session | `getDueCards(inScopeCards(...))` and `buildSession(inScopeCards(...))` never include an out-of-scope card (e.g. a `signos_vitales` card) |
| `MasteryBars` | disabled topic renders the "Aún no visto en clase" tag and no `%`; enabled topic renders its `%` and bar |

Gates (raw binaries): `vitest run`, both `tsc`, `eslint --max-warnings 0`, `tsx scripts/build-content.ts --check`, `vite build`.

## 7. Non-goals

- No changes to M1 (Aprender) or M3 (Escenarios).
- No SRS reset / no persistence change — out-of-scope cards keep their state, just aren't served.
- No admin/settings UI to toggle scope — the `ENABLED_CONCEPTS` constant IS the control (temporary).
- The "Manejo" topic mixes `habcde` (in scope) + one `secundaria` card; it shows as enabled (has in-scope cards), and its single out-of-scope card is still individually excluded from sessions by the card-level filter. Acceptable.

## 8. Build order

1. `scope.ts` + tests.
2. `mastery.ts` `enabled` flag + sort + tests.
3. Wire the 3 call sites (`inScopeCards`) + due/session tests.
4. `MasteryBars` disabled state (+ css) + test.
5. Gates + visual check.
