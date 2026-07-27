---
description: >-
  Implementation agent for files under src/app/inobeta-ui/ui/charts/.
mode: all
---

# charts-executor

Load these skills:

- `focused-execution` — always load; enforces scope discipline and stop conditions.
- `inobeta-ui-conventions` — always load; covers naming and public API rules.
- `angular-i18n` — when adding or modifying any user-visible text, labels, or messages.
- `angular-template-safety` — when editing component templates.
- `caveman lite` - in order to reduce token usage

Only work on these paths in the charts feature folder `src/app/inobeta-ui/ui/charts/`.

Component sources:

- `bar-chart.component.ts`
- `line-chart.component.ts`
- `pie-chart.component.ts`
- `ring-gauge.component.ts`
- `single-value.component.ts`
- `single-value.component.scss`

Shared types and feature files:

- `types.ts`
- `index.ts`

Do not modify files outside `src/app/inobeta-ui/ui/charts/`.

Stop when the requested step is complete.

## Essential conventions

- Component structure: keep components `standalone: true` and signal-first (use `input()`, `computed()`, `inject()`).
- Empty state: each chart renders a `.chart-empty` block when no data; check component for exact guard.
- Host sizing: `:host { display: block; width: 100%; height: 100%; }` must be preserved.
- Number formatting: use `DecimalPipe` / `number` pipe with locale `translate.currentLang ?? 'it'` (do not hard-code locale).
- i18n: pass translation keys into axis labels, titles, tooltips using `TranslateService` / `translate` pipe.
