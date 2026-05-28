---
name: chart-line
description: >-
  Apply when working on LineChartComponent (line-chart.component.ts). Covers the
  discrete/timeseries x-axis modes, dual Y-axis setup, borderColor requirement for
  line datasets, legend point-style configuration, and Chart.js options for line charts.
  Always load chart-commons alongside this skill.
compatibility: opencode
---

## Component Reference

File: `src/app/inobeta-ui/ui/charts/line-chart.component.ts`
Selector: `line-chart`

> Shared types (`ChartSeriesData`, `ChartSeriesMeasure`, `ChartSeriesConfig`) and
> cross-chart conventions are documented in the **`chart-commons`** skill.

## Inputs

| Input | Type | Default | Description |
|---|---|---|---|
| `title` | `string` | `"Title"` | Chart title (currently unused in template) |
| `data` | `ChartSeriesData[]` | `[]` | Raw data points |
| `valueType` | `"discrete" \| "timeseries"` | `"discrete"` | X-axis interpretation |
| `measures` | `ChartSeriesMeasure[]` | `[]` | Series colour and Y-axis assignment |
| `config` | `ChartSeriesConfig \| null` | `null` | Axis labels and unit symbols |

## Key Implementation Rules

- Dataset building is identical to `BarChartComponent` with **one addition**: every
  dataset must include `borderColor: cfg?.color ?? "#46638f"` alongside `backgroundColor`.
  Omitting `borderColor` makes line series invisible.
- **Discrete mode** and **timeseries mode** work identically to `BarChartComponent`.
- `yAxisID` mapping follows the same convention: `"y1"` → `"y"`, `"y2"` → `"y1"`.
- `import 'chart.js/auto'` and `import 'chartjs-adapter-date-fns'` must remain in the
  file.
- Tooltip callback uses `DecimalPipe.transform(value, '1.0-2')` with locale from
  `translate.currentLang ?? 'it'`.
- `DecimalPipe` is provided via `providers: [DecimalPipe]` in the component decorator
  (unlike `BarChartComponent` which instantiates it manually — keep the existing pattern).

## Legend Differences vs Bar Chart

The line chart legend uses point-style markers:

```typescript
legend: {
  display: true,
  position: "right",
  labels: {
    boxWidth: 60,
    usePointStyle: true,
    maxWidth: 80,
    font: { size: 12 },
  },
}
```

Do not collapse this to the simpler bar-chart legend shape.

## Chart.js Options Shape

```
responsive: true, maintainAspectRatio: false
scales.x: type category | timeseries
scales.y: left axis
scales.y1: right axis (conditional on hasY2)
plugins.legend: position "right", usePointStyle: true
plugins.tooltip: custom label callback
```
