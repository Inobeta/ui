---
name: chart-pie
description: >-
  Apply when working on PieChartComponent (pie-chart.component.ts). Covers PieChartData
  structure, per-slice backgroundColor, optional unit formatting, passthrough options
  input, and Chart.js configuration for pie charts.
compatibility: opencode
---

## Component Reference

File: `src/app/inobeta-ui/ui/charts/pie-chart.component.ts`
Selector: `pie-chart`

## Inputs

| Input | Type | Default | Description |
|---|---|---|---|
| `title` | `string` | `"Title"` | Chart title (currently unused in template) |
| `data` | `PieChartData[]` | `[]` | Slices with name, value, and colour |
| `unit` | `string \| undefined` | `undefined` | Unit appended to tooltip value |
| `options` | `ChartOptions<"pie"> \| null` | `null` | Full options override (passthrough) |

## Data Type (from `types.ts`)

```typescript
PieChartData = { name: string; backgroundColor: string; value: number }
```

## Key Implementation Rules

- The chart always has **a single dataset**; `backgroundColor` is an array derived from
  `data().map(s => s.backgroundColor)` — one colour per slice.
- Labels are `data().map(s => s.name)`.
- When `options()` is non-null it is used verbatim (full passthrough) — do not merge
  or override it.
- When `options()` is null the default config is used: `responsive: true`,
  `maintainAspectRatio: false`, legend at `"bottom"`.
- Tooltip `label` callback is added **only when `unit()` is defined**; it formats the
  value with `DecimalPipe.transform(value, '1.0-2')` and appends the unit.
- `import 'chart.js/auto'` must remain in the file.
- The file also exports `PieChartStore = { data: PieChartData[]; unit: string }` — do
  not remove this type export.

## Chart.js Options Shape (default)

```
responsive: true, maintainAspectRatio: false
plugins.legend: position "bottom"
plugins.tooltip.callbacks.label: conditional on unit presence
```
