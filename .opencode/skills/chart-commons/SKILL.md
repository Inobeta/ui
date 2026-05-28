---
name: chart-commons
description: >-
  Apply when working on any chart component inside src/app/inobeta-ui/ui/charts/.
  Covers conventions shared by all charts: standalone/signal structure, empty state
  pattern, host sizing, number formatting, i18n, selector naming, shared types
  (ChartSeriesData, ChartSeriesMeasure, ChartSeriesConfig), and Chart.js vs pure-Angular
  discriminant. Always load this skill together with the chart-specific skill.
compatibility: opencode
---

## Shared Conventions

### Component Structure

- All chart components are `standalone: true`; keep them that way.
- All are signal-first: use `input()`, `computed()`, `inject()`. Do not add `@Input()`.

### Empty State

Every chart must render a `.chart-empty` block when there is no data to display:

```html
<div class="chart-empty">
  <mat-icon class="chart-empty-icon"><!-- relevant icon --></mat-icon>
  <span class="chart-empty-label">{{ "common.noItems" | translate }}</span>
</div>
```

The guard condition varies per chart (`data().length === 0`, `progress() < 0`, etc.) —
check the component-specific skill for the exact condition.

### Host Sizing

Every component must keep:

```css
:host { display: block; width: 100%; height: 100%; }
```

### Number Formatting

Always format numeric values with `DecimalPipe` using the locale from
`translate.currentLang ?? 'it'`. Never hard-code a locale string.

### i18n

Use `TranslateService.instant()` or `TranslatePipe` for all user-visible strings.
Pass translation keys — not raw labels — into axis labels, titles, and tooltips.

### Selectors

Existing selectors (`bar-chart`, `line-chart`, `pie-chart`, `ring-gauge`, `single-value`)
deliberately omit the `ib-` prefix. Do **not** rename them.

### Types

All shared types live in `types.ts`. Add new types there; do not duplicate them inside
component files. Import them as `import { ... } from './types'` within the feature.

---

## Shared Data Types (`types.ts`)

```typescript
// Used by bar-chart, line-chart
ChartSeriesData    = { name: string; x: string; y: number }
ChartSeriesMeasure = { name: string; color: string; yAxis: "y1" | "y2" }
ChartSeriesConfig  = { xLabel: string; y1Label: string; y1Symbol: string;
                       y2Label?: string; y2Symbol?: string }

// Used by pie-chart
PieChartData = { name: string; backgroundColor: string; value: number }

// Used by ring-gauge
RingGaugeAdditionalInfo = { label: string; icon: string; labelColor: string; iconColor: string }

// Used by single-value
SingleValueAdditionalInfo = { label: string; icon: string; labelColor: string; iconColor: string }
```

---

## Chart.js vs Pure Angular

**Chart.js charts** (`bar-chart`, `line-chart`, `pie-chart`):
- `import 'chart.js/auto'` must be present to register all Chart.js components.
- Use `BaseChartDirective` from `ng2-charts` for canvas rendering.

**Pure Angular** (`ring-gauge`, `single-value`):
- Do not add `BaseChartDirective`, `chart.js/auto`, or any ng2-charts import.
