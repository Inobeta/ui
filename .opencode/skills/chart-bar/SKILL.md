---
name: chart-bar
description: >-
  Apply when working on BarChartComponent (bar-chart.component.ts). Covers the
  discrete/timeseries x-axis modes, dual Y-axis setup, dataset grouping logic, and
  Chart.js options for bar charts. Always load chart-commons alongside this skill.
compatibility: opencode
---

## Component Reference

File: `src/app/inobeta-ui/ui/charts/bar-chart.component.ts`
Selector: `bar-chart`

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

- Data is **grouped by `name`** into `Map<string, ChartSeriesData[]>` before building
  datasets; one `name` → one Chart.js dataset.
- **Discrete mode**: X labels are derived from `[...new Set(data.map(d => d.x))]`;
  each dataset maps labels to `y` values (defaulting to `0` for missing entries).
- **Timeseries mode**: X labels array is empty; each point is `{ x: Date.getTime(), y }`,
  sorted ascending; import `chartjs-adapter-date-fns` is required.
- `yAxisID` mapping: `cfg.yAxis === "y1"` → `"y"` (primary left axis);
  `"y2"` → `"y1"` (secondary right axis, only rendered when `hasY2 === true`).
- Tooltip `label` callback uses `DecimalPipe.transform(value, '1.0-2')` with locale from
  `translate.currentLang ?? 'it'`; appends the axis symbol when present.
- `import 'chart.js/auto'` must remain in the file to register all Chart.js components.
- Axis titles use `translate.instant(key)` — pass translation keys, not raw strings,
  into `config.xLabel`, `config.y1Label`, etc.

## Chart.js Options Shape

```
responsive: true, maintainAspectRatio: false
scales.x: type category | timeseries
scales.y: left axis
scales.y1: right axis (conditional on hasY2)
plugins.legend: position "right"
plugins.tooltip: custom label callback
```
